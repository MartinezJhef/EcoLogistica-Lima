from app.core.operational_time import operational_today
from datetime import date, timedelta
"""Optional real PostGIS regression. CI creates a disposable *_test database first."""
import os
from datetime import date, time
from uuid import uuid4
import pytest
from sqlalchemy import create_engine
from sqlalchemy.engine import make_url
from sqlalchemy.orm import Session
from app.models.usuario import Usuario
from app.models.conductor import Conductor
from app.models.vehiculo import Vehiculo
from app.models.deposito import Deposito
from app.models.pedido import Pedido
from app.services.order_service import OrderService
from app.services.routing_service import RoutingService
from app.services.road_service import RoadService, RoadLeg
from app.schemas.pedido import PedidoCreate
from app.schemas.ruta import RutaOptimizarRequest, ReoptimizarRutaRequest


@pytest.mark.skipif(not os.getenv('POSTGRES_TEST_URL'), reason='Requires disposable PostGIS database')
def test_real_postgis_planning_and_replanning(monkeypatch):
    url = make_url(os.environ['POSTGRES_TEST_URL'])
    assert url.database.endswith('_test'), 'Use only a disposable *_test database'
    engine = create_engine(url)
    with engine.connect() as connection:
        transaction = connection.begin()
        db = Session(bind=connection, join_transaction_mode='create_savepoint')
        try:
            marker = uuid4().hex[:6].upper()
            vehicle = Vehiculo(placa=f'T{marker[:2]}-{marker[2:5]}',marca_modelo='PostGIS test', capacidad_peso_kg=100,
                capacidad_volumen_m3=10,tipo_combustible='ELECTRICO',factor_emision_co2=0,altura_m=2,es_ligero=True)
            driver = Conductor(licencia_vencimiento=operational_today()+timedelta(days=365), dni=uuid4().hex[:8],nombres='Test',apellidos='Driver',licencia=f'T{marker}',telefono='999999999')
            depot = Deposito(nombre='Test depot',direccion='Test address',latitud=-12.045,longitud=-77.06)
            db.add_all([vehicle,driver,depot]); db.flush()
            owner = Usuario(email=f'{marker}@example.test',nombre_completo='Test',password_hash='not-used',rol='CLIENTE',permisos=[],estado='ACTIVO')
            db.add(owner); db.commit()
            created = OrderService.create_pedido(db, PedidoCreate(codigo_seguimiento=f'PG-{marker}',cliente_nombre='PostGIS test',
                direccion_destino='Test delivery',latitud=-12.05,longitud=-77.05,peso_kg=10,volumen_m3=1,
                ventana_inicio=time(8),ventana_fin=time(18)),usuario_cliente_id=owner.usuario_id)
            assert created.latitud == pytest.approx(-12.05)
            monkeypatch.setattr(RoadService,'leg',lambda self,a,b,*args:RoadLeg(2,5,[a,b]))
            result = RoutingService.optimizar_rutas(db,RutaOptimizarRequest(vehiculo_id=vehicle.vehiculo_id,
                conductor_id=driver.conductor_id,pedidos_ids=[created.pedido_id]))
            assert len(result.rutas) == 1
            reopt = RoutingService.reoptimizar_ruta(db,result.rutas[0].ruta_id,
                ReoptimizarRutaRequest(pedido_cancelado_id=created.pedido_id))
            assert reopt.estado == 'CANCELADA'
            assert db.get(Pedido,created.pedido_id).estado == 'CANCELADO'
        finally:
            db.close()
            transaction.rollback()
    engine.dispose()
