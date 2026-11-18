from types import SimpleNamespace
from uuid import uuid4
from main import app
from app.core.auth import current_user
from app.models.pedido import Pedido
from app.models.ruta import Ruta
from app.services.routing_service import RoutingService
from app.schemas.ruta import RutaOptimizarRequest, ReoptimizarRutaRequest
from test_sprint3_integration import domain
import pytest


@pytest.fixture
def as_user(db_session):
    previous = app.dependency_overrides[current_user]
    def select(role, driver_id=None, user_id=None):
        user = SimpleNamespace(rol=role, conductor_id=driver_id, usuario_id=user_id or uuid4(), permisos=['SEGUIMIENTO_RUTAS'])
        if role == 'CLIENTE':
            from app.models.usuario import Usuario
            db_session.add(Usuario(usuario_id=user.usuario_id,email=f'{user.usuario_id}@example.test',nombre_completo='Cliente de prueba',password_hash='not-used',rol=role,permisos=[],estado='ACTIVO'))
            db_session.commit()
        app.dependency_overrides[current_user] = lambda: user
        return user
    yield select
    app.dependency_overrides[current_user] = previous


def test_client_creation_is_idempotent_and_isolated(domain, client, as_user):
    db, vehicle, driver, order = domain
    user = as_user('CLIENTE')
    payload = dict(codigo_seguimiento='MOBILE-001',cliente_nombre='Cliente móvil',direccion_destino='Av. Lima 123',
        latitud=-12.05,longitud=-77.05,peso_kg=20,volumen_m3=1,ventana_inicio='08:00',ventana_fin='18:00')
    first = client.post('/api/v1/mobile/pedidos',json=payload)
    assert first.status_code == 200
    assert client.post('/api/v1/mobile/pedidos',json=payload).json()['pedido_id'] == first.json()['pedido_id']
    assert db.query(Pedido).count() == 1
    assert client.post('/api/v1/mobile/pedidos',json={**payload,'ventana_fin':'17:00'}).status_code == 409
    assert len(client.get('/api/v1/mobile/pedidos').json()) == 1
    as_user('CLIENTE')
    assert client.get('/api/v1/mobile/pedidos').json() == []


def test_client_preferences_are_private_persisted_and_locked_in_transit(domain,client,as_user):
    db,vehicle,driver,order=domain
    user=as_user('CLIENTE')
    p=order(usuario_cliente_id=user.usuario_id)
    url=f'/api/v1/mobile/pedidos/{p.pedido_id}'
    payload=dict(ventana_inicio='09:00',ventana_fin='14:00',restriccion_acceso='ALTURA_MAXIMA_2_5M',
        referencia_ubicacion='Puerta azul',foto_referencia_url='https://example.test/photo.jpg',telefono_contacto='999888777')
    saved=client.patch(url+'/preferencias',json=payload)
    assert saved.status_code == 200
    assert client.get(url).json()['referencia_ubicacion'] == 'Puerta azul'
    as_user('CLIENTE')
    assert client.get(url).status_code == 404
    assert client.patch(url+'/preferencias',json=payload).status_code == 404
    app.dependency_overrides[current_user]=lambda:user
    p.estado='EN_TRANSITO';db.commit()
    rejected=client.patch(url+'/preferencias',json=payload)
    assert rejected.status_code == 400
    assert 'tránsito' in rejected.json()['detail']


def test_driver_delivery_updates_route_and_does_not_expose_other_drivers(domain, client, as_user):
    db, vehicle, driver, order = domain
    p = order()
    route = RoutingService.optimizar_rutas(db, RutaOptimizarRequest()).rutas[0]
    as_user('REPARTIDOR', uuid4())
    assert client.get('/api/v1/mobile/pedidos').json() == []
    assert client.patch(f'/api/v1/mobile/pedidos/{p.pedido_id}',json={'estado':'EN_TRANSITO'}).status_code == 403
    as_user('REPARTIDOR',driver.conductor_id)
    assert len(client.get('/api/v1/mobile/pedidos').json()) == 1
    assert client.patch(f'/api/v1/mobile/pedidos/{p.pedido_id}',json={'estado':'EN_TRANSITO'}).status_code == 200
    db.expire_all()
    assert db.get(Ruta,route.ruta_id).estado == 'EN_EJECUCION'
    assert client.patch(f'/api/v1/mobile/pedidos/{p.pedido_id}',json={'estado':'ENTREGADO'}).status_code == 200
    db.expire_all()
    assert db.get(Ruta,route.ruta_id).estado == 'EN_EJECUCION'
    assert client.post(f'/api/v1/rutas/{route.ruta_id}/finalizar',json={'regreso_confirmado':True}).status_code == 200
    db.expire_all()
    assert db.get(Ruta,route.ruta_id).estado == 'COMPLETADA'
    assert client.patch(f'/api/v1/mobile/pedidos/{p.pedido_id}',json={'estado':'ASIGNADO'}).status_code == 409


def test_breakdown_redistributes_to_available_vehicle_and_notifies_both_routes(domain):
    from app.models.vehiculo import Vehiculo
    db, vehicle, driver, order = domain
    p = order()
    original = RoutingService.optimizar_rutas(db, RutaOptimizarRequest()).rutas[0]
    backup = Vehiculo(placa='BCK-123',marca_modelo='Backup',capacidad_peso_kg=100,capacidad_volumen_m3=10,
        tipo_combustible='ELECTRICO',factor_emision_co2=0)
    db.add(backup); db.commit()
    result = RoutingService.reoptimizar_ruta(db, original.ruta_id, ReoptimizarRutaRequest(vehiculo_averiado=True))
    assert result.estado == 'CANCELADA'
    assert len(result.rutas_reasignadas) == 1
    assert result.rutas_reasignadas[0].vehiculo_id == backup.vehiculo_id
    assert db.get(Pedido,p.pedido_id).ruta_id == result.rutas_reasignadas[0].ruta_id
    assert db.get(Vehiculo,vehicle.vehiculo_id).estado == 'MANTENIMIENTO'
