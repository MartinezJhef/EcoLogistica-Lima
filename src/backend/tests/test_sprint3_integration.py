from datetime import date, timedelta
import json
from datetime import time
from uuid import uuid4
import pytest
from fastapi import HTTPException
from pydantic import ValidationError
from shapely.geometry import LineString, Polygon
from app.models.route_update import RouteUpdate
from app.models.ruta import Ruta
from app.models.tramo import Tramo
from app.models.pedido import Pedido
from app.models.vehiculo import Vehiculo
from app.models.conductor import Conductor
from app.models.deposito import Deposito
from app.schemas.ruta import RutaOptimizarRequest, ReoptimizarRutaRequest
from app.services.routing_service import RoutingService
from app.services.planning_service import schedule
from app.services.road_service import RoadService, RoadLeg, RoadBlocked, RoadUnavailable


@pytest.fixture
def domain(db_session, monkeypatch):
    db = db_session
    for model in (RouteUpdate, Tramo, Ruta, Pedido, Conductor, Vehiculo, Deposito):
        db.query(model).delete()
    vehicle = Vehiculo(placa='NEW-123', marca_modelo='Electric van', capacidad_peso_kg=100,
        capacidad_volumen_m3=10, tipo_combustible='ELECTRICO', factor_emision_co2=0, altura_m=2.2, es_ligero=True)
    driver = Conductor(licencia_vencimiento=date.today()+timedelta(days=365), dni='76543210', nombres='Ana', apellidos='Perez', licencia='Q76543210',
        telefono='999999999', horas_conduccion_hoy=0)
    db.add_all([vehicle, driver]); db.commit()
    def fake_leg(_self, start, end, blocked=(), traffic=()):
        if any(LineString([start, end]).intersects(Polygon(p)) for p in blocked):
            raise RoadBlocked('No hay alternativa fuera del cierre')
        return RoadLeg(4, 10 + sum(i.demora_minutos for i in traffic), [start, end])
    monkeypatch.setattr(RoadService, 'leg', fake_leg)
    def order(code='NEW-001', **kwargs):
        data = dict(codigo_seguimiento=code, cliente_nombre='Cliente', direccion_destino='Av. Lima 123',
            ubicacion_destino='SRID=4326;POINT(-77.05 -12.05)', peso_kg=20, volumen_m3=1,
            ventana_inicio=time(8), ventana_fin=time(18), estado='PENDIENTE')
        data.update(kwargs)
        result = Pedido(**data); db.add(result); db.commit(); return result
    return db, vehicle, driver, order


def test_jornada_rejects_75_hours_plus_new_route(domain):
    db, vehicle, driver, order = domain
    driver.horas_conduccion_hoy = 7.5
    p = order()
    result = RoutingService.optimizar_rutas(db, RutaOptimizarRequest())
    assert not result.rutas
    assert '8 horas' in result.pedidos_no_asignados[0].motivo
    assert db.get(Pedido, p.pedido_id).ruta_id is None


def test_maximum_count_prefers_three_small_orders_over_one_large(domain):
    db, vehicle, driver, order = domain
    order('BIG', peso_kg=80, prioridad='URGENTE')
    for n in range(3):
        order(f'SMALL-{n}', peso_kg=30)
    result = RoutingService.optimizar_rutas(db, RutaOptimizarRequest())
    assert result.pedidos_asignados_count == 3
    assert result.pedidos_no_asignados[0].codigo_seguimiento == 'BIG'


def test_maximum_count_can_choose_larger_vehicle_for_only_driver(domain):
    db, vehicle, driver, order = domain
    vehicle.capacidad_peso_kg = 40
    db.add(Vehiculo(placa='BIG-987',marca_modelo='Large van',capacidad_peso_kg=100,
        capacidad_volumen_m3=10,tipo_combustible='HIBRIDO',factor_emision_co2=.1))
    db.commit()
    for n in range(3): order(f'LOAD-{n}',peso_kg=30)
    result = RoutingService.optimizar_rutas(db, RutaOptimizarRequest())
    assert result.pedidos_asignados_count == 3
    assert len(result.rutas) == 1
    assert result.rutas[0].vehiculo_id != vehicle.vehiculo_id


def test_unverified_or_expired_license_cannot_receive_route(domain):
    db, vehicle, driver, order = domain
    order()
    for expiry in (None,date.today()-timedelta(days=1)):
        driver.licencia_vencimiento = expiry
        db.commit()
        with pytest.raises(HTTPException) as error:
            RoutingService.optimizar_rutas(db,RutaOptimizarRequest())
        assert error.value.status_code == 400


def test_risk_warning_checks_road_between_outside_endpoints(domain,monkeypatch):
    from app.services import routing_service
    db, vehicle, driver, order = domain
    monkeypatch.setattr(routing_service,'CATALOGO_ZONAS_RIESGO',[
        dict(nombre='Riesgo de prueba',nivel_peligro='ALTO',
            poligono=[[-77.045,-12.045],[-77.035,-12.045],[-77.035,-12.035],[-77.045,-12.035]])])
    monkeypatch.setattr(RoadService,'leg',lambda self,start,end,*args:
        RoadLeg(4,10,[start,[-77.04,-12.04],end]))
    p=order()
    rows=schedule([p],vehicle,driver,[-77.06,-12.06],480,RoadService())
    assert rows[1]['alerta_zona_riesgo'] is True
    assert rows[1]['nombre_zona_riesgo'] == 'Riesgo de prueba'


def test_time_window_and_waiting_applied(domain):
    db, vehicle, driver, order = domain
    p = order(ventana_inicio=time(9), ventana_fin=time(10))
    result = RoutingService.optimizar_rutas(db, RutaOptimizarRequest())
    assert result.rutas[0].tiempo_total_min == 82  # 10 travel + 50 wait + 12 service + 10 return
    assert result.rutas[0].co2_total_kg == 0
    assert json.loads(result.rutas[0].tramos[1].geometria_linea_geojson)['type'] == 'LineString'


def test_late_delivery_stays_pending_with_reason(domain):
    db, vehicle, driver, order = domain
    p = order(ventana_fin=time(8, 15))
    result = RoutingService.optimizar_rutas(db, RutaOptimizarRequest())
    assert not result.rutas
    assert 'ventana' in result.pedidos_no_asignados[0].motivo
    assert db.get(Pedido, p.pedido_id).estado == 'PENDIENTE'


def test_driver_not_reserved_for_multiple_vehicles(domain):
    db, vehicle, driver, order = domain
    db.add(Vehiculo(placa='NEW-456', marca_modelo='Another', capacidad_peso_kg=100,
        capacidad_volumen_m3=10, tipo_combustible='ELECTRICO', factor_emision_co2=0))
    order('NEW-001', peso_kg=80); order('NEW-002', peso_kg=80)
    result = RoutingService.optimizar_rutas(db, RutaOptimizarRequest())
    assert len(result.rutas) == 1
    assert result.pedidos_no_asignados_count == 1
    order('NEW-003')
    with pytest.raises(HTTPException) as error:
        RoutingService.optimizar_rutas(db, RutaOptimizarRequest())
    assert error.value.status_code == 400


def test_access_restrictions_and_verified_vehicle_height(domain):
    db, vehicle, driver, order = domain
    vehicle.altura_m = 3
    order(restriccion_acceso='ALTURA_MAXIMA_2_5M')
    result = RoutingService.optimizar_rutas(db, RutaOptimizarRequest())
    assert not result.rutas
    assert 'altura' in result.pedidos_no_asignados[0].motivo


def test_network_failure_rolls_back_whole_plan(domain, monkeypatch):
    db, vehicle, driver, order = domain
    order()
    def unavailable(*args): raise RoadUnavailable('Proveedor no disponible')
    monkeypatch.setattr(RoadService, 'leg', unavailable)
    with pytest.raises(HTTPException) as error:
        RoutingService.optimizar_rutas(db, RutaOptimizarRequest())
    assert error.value.status_code == 503
    assert db.query(Ruta).count() == 0
    assert db.query(RouteUpdate).count() == 0


def test_queue_retained_until_ack_and_ack_idempotent(domain, client):
    db, vehicle, driver, order = domain
    order()
    RoutingService.optimizar_rutas(db, RutaOptimizarRequest())
    url = f'/api/v1/rutas/conductor/{driver.conductor_id}/actualizaciones'
    first = client.get(url).json()
    assert len(first) == 1
    assert client.get(url).json() == first
    ack = f'{url}/{first[0]["update_id"]}/confirmar'
    assert client.post(ack).status_code == 200
    assert client.post(ack).status_code == 200
    assert client.get(url).json() == []


def test_replanning_checks_urgent_capacity_and_rolls_back(domain):
    db, vehicle, driver, order = domain
    order(peso_kg=80)
    route = RoutingService.optimizar_rutas(db, RutaOptimizarRequest()).rutas[0]
    urgent = order('NEW-URG', peso_kg=80)
    with pytest.raises(HTTPException) as error:
        RoutingService.reoptimizar_ruta(db, route.ruta_id, ReoptimizarRutaRequest(nuevo_pedido_urgente_id=urgent.pedido_id))
    assert error.value.status_code == 409
    assert db.get(Pedido, urgent.pedido_id).ruta_id is None
    assert db.query(RouteUpdate).count() == 1


def test_cancellation_cannot_modify_order_from_another_route(domain):
    db, vehicle, driver, order = domain
    order()
    route = RoutingService.optimizar_rutas(db, RutaOptimizarRequest()).rutas[0]
    other = order('OTHER-001')
    with pytest.raises(HTTPException):
        RoutingService.reoptimizar_ruta(db, route.ruta_id, ReoptimizarRutaRequest(pedido_cancelado_id=other.pedido_id))
    assert db.get(Pedido, other.pedido_id).estado == 'PENDIENTE'


def test_capacity_limit_cannot_be_overridden_to_100_percent():
    with pytest.raises(ValidationError): RutaOptimizarRequest(factor_capacidad_max=1)


def test_updating_preferences_revalidates_existing_plan_atomically(domain):
    from app.services.order_service import OrderService
    from app.schemas.pedido import PreferenciasClienteUpdate
    db, vehicle, driver, order = domain
    p = order()
    RoutingService.optimizar_rutas(db, RutaOptimizarRequest())
    result = OrderService.update_preferencias_cliente(db, p.pedido_id, PreferenciasClienteUpdate(ventana_inicio=time(9)))
    assert result.ventana_inicio == time(9)
    assert db.query(RouteUpdate).count() == 2
    with pytest.raises(HTTPException):
        OrderService.update_preferencias_cliente(db, p.pedido_id, PreferenciasClienteUpdate(ventana_fin=time(9, 5)))
    assert db.get(Pedido, p.pedido_id).ventana_fin == time(18)
    assert db.query(RouteUpdate).count() == 2


def test_road_provider_checks_entire_geometry_and_uses_safe_detour(monkeypatch):
    road = RoadService()
    blocked = [[.4, -.1], [.6, -.1], [.6, .1], [.4, .1], [.4, -.1]]
    def fetch(points):
        coords = [[0, 0], [0, .3], [1, .3], [1, 0]] if len(points) == 3 else [[0, 0], [1, 0]]
        return [RoadLeg(5, 10, coords)]
    monkeypatch.setattr(road, '_fetch', fetch)
    result = road.leg([0, 0], [1, 0], [blocked])
    assert not LineString(result.coordinates).intersects(Polygon(blocked))


def test_road_provider_rejects_route_through_closed_area(monkeypatch):
    road = RoadService()
    blocked = [[.4, -.1], [.6, -.1], [.6, .1], [.4, .1], [.4, -.1]]
    monkeypatch.setattr(road, '_fetch', lambda pts: [RoadLeg(1, 1, [[0, 0], [1, 0]])])
    with pytest.raises(RoadBlocked): road.leg([0, 0], [1, 0], [blocked])
