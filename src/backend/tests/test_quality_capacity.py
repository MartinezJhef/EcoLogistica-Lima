"""Measured service/SQL capacity; controlled road provider, never production data."""
import json
import math
import os
import time as clock
from datetime import time, timedelta
from pathlib import Path
from uuid import uuid4

import pytest
from sqlalchemy import create_engine
from sqlalchemy.engine import make_url
from sqlalchemy.orm import Session
from app.core.operational_time import operational_today
from app.models.vehiculo import Vehiculo
from app.models.conductor import Conductor
from app.models.pedido import Pedido
from app.models.ruta import Ruta
from app.models.tramo import Tramo
from app.schemas.ruta import RutaOptimizarRequest, ReoptimizarRutaRequest
from app.services.order_service import OrderService
from app.services.routing_service import RoutingService
from app.services.road_service import RoadService, RoadLeg


def measured_result(name, data):
    target=os.getenv('QUALITY_EVIDENCE_PATH')
    if target:
        path=Path(target)
        path.parent.mkdir(parents=True,exist_ok=True)
        results=json.loads(path.read_text(encoding='utf-8')) if path.exists() else {}
        results[name]={'method':'Real service execution on disposable PostGIS with synthetic orders and controlled road adapter; excludes external OSRM/network/production capacity',**data}
        path.write_text(json.dumps(results,ensure_ascii=False,indent=2),encoding='utf-8')


@pytest.fixture
def capacity_db(monkeypatch):
    if not os.getenv('POSTGRES_TEST_URL'):
        pytest.skip('Requires disposable PostGIS database')
    url=make_url(os.environ['POSTGRES_TEST_URL'])
    assert url.database.endswith('_test'), 'Disposable *_test database required'
    engine=create_engine(url)
    with engine.connect() as connection:
        tx=connection.begin()
        db=Session(bind=connection,join_transaction_mode='create_savepoint')
        # Road latency is deliberately excluded from the CPU/SQL benchmark.
        def controlled_road(self,a,b,blocked=(),traffic=()):
            km=math.hypot((a[0]-b[0])*108,(a[1]-b[1])*111)
            return RoadLeg(km,max(.5,km*3),[a,b])
        monkeypatch.setattr(RoadService,'leg',controlled_road)
        try:yield db
        finally:
            db.close(); tx.rollback()
    engine.dispose()


def seed(db,orders,vehicles):
    marker=uuid4().hex[:6].upper()
    cars=[Vehiculo(placa=f'Q{i:02}-{marker[:3]}',marca_modelo='Controlled capacity test',
        capacidad_peso_kg=500,capacidad_volumen_m3=20,tipo_combustible='ELECTRICO',
        factor_emision_co2=0,altura_m=2,es_ligero=True) for i in range(vehicles)]
    drivers=[Conductor(dni=f'{uuid4().int%100000000:08}',nombres='Capacity',apellidos=f'Test {i}',
        licencia=f'Q{marker}{i}',licencia_vencimiento=operational_today()+timedelta(days=365),
        telefono='999999999',estado='DISPONIBLE',horas_conduccion_hoy=0) for i in range(vehicles)]
    parcels=[Pedido(codigo_seguimiento=f'Q-{marker}-{i}',cliente_nombre='Synthetic capacity order',
        direccion_destino='Controlled fixture only',ubicacion_destino=f'SRID=4326;POINT({-77.05+(i%20)*.0001} {-12.05+(i%17)*.0001})',
        peso_kg=1,volumen_m3=.01,ventana_inicio=time(8),ventana_fin=time(18),estado='PENDIENTE') for i in range(orders)]
    db.add_all([*cars,*drivers,*parcels]);db.commit()
    return cars,drivers,parcels


def test_150_orders_15_vehicles_and_reoptimization(capacity_db):
    db=capacity_db
    cars,drivers,orders=seed(db,150,15)
    started=clock.perf_counter()
    result=RoutingService.optimizar_rutas(db,RutaOptimizarRequest(
        fecha_operacion=operational_today()+timedelta(days=1),pedidos_ids=[p.pedido_id for p in orders]))
    elapsed=clock.perf_counter()-started
    assert not result.pedidos_no_asignados
    assert sum(p.ruta_id is not None for p in orders)==150
    assert len({r.conductor_id for r in result.rutas})==len(result.rutas)
    assert all(r.tiempo_total_min<=480 for r in result.rutas)
    assert elapsed<=45
    assigned=orders[0]
    started=clock.perf_counter()
    replanned=RoutingService.reoptimizar_ruta(db,assigned.ruta_id,ReoptimizarRutaRequest(pedido_cancelado_id=assigned.pedido_id))
    replan=clock.perf_counter()-started
    assert replan<=30 and replanned.tramos
    assert db.get(Pedido,assigned.pedido_id).estado=='CANCELADO'
    measured_result('150_orders_15_vehicles',{'orders':150,'vehicles':15,'routes':len(result.rutas),
        'optimization_seconds':elapsed,'reoptimization_seconds':replan,'assigned':150,'result':'PASS'})


def test_1000_orders_50_vehicles_register_query_and_plan(capacity_db):
    db=capacity_db
    started=clock.perf_counter()
    cars,drivers,orders=seed(db,1000,50)
    insert=clock.perf_counter()-started
    ids={p.pedido_id for p in orders}
    listed=[]
    started=clock.perf_counter()
    total=OrderService.contar_pedidos(db)
    for offset in range(0,total,100):
        listed.extend(OrderService.get_pedidos(db,skip=offset,limit=100))
    assert ids.issubset({p.pedido_id for p in listed})
    query=clock.perf_counter()-started
    durations=[]
    for start in range(0,1000,150):
        started=clock.perf_counter()
        result=RoutingService.optimizar_rutas(db,RutaOptimizarRequest(
            fecha_operacion=operational_today()+timedelta(days=1),pedidos_ids=[p.pedido_id for p in orders[start:start+150]]))
        durations.append(clock.perf_counter()-started)
        assert not result.pedidos_no_asignados
    db.expire_all()
    registered=db.query(Pedido).filter(Pedido.pedido_id.in_(ids)).all()
    assert len(registered)==1000 and all(p.estado=='ASIGNADO' and p.ruta_id for p in registered)
    routes=db.query(Ruta).filter(Ruta.ruta_id.in_({p.ruta_id for p in registered})).all()
    assert len(routes)<=50 and len({r.conductor_id for r in routes})==len(routes)
    assert all(r.tiempo_total_min<=480 for r in routes)
    assert db.query(Tramo).filter(Tramo.ruta_id.in_([r.ruta_id for r in routes]),Tramo.pedido_id.isnot(None)).count()==1000
    leg_ids={row[0] for row in db.query(Tramo.pedido_id).filter(Tramo.ruta_id.in_([r.ruta_id for r in routes]),Tramo.pedido_id.isnot(None)).all()}
    assert leg_ids==ids
    assert max(durations)<=45
    measured_result('1000_orders_50_vehicles',{'orders':1000,'vehicles':50,'routes':len(routes),
        'insert_seconds':insert,'query_all_pages_seconds':query,'planning_batches_seconds':durations,
        'assigned':1000,'integrity':'1000 distinct persisted delivery legs, no reused driver','result':'PASS'})


def test_large_fast_attempt_never_returns_an_unverified_partial_plan(capacity_db):
    db=capacity_db
    cars,drivers,orders=seed(db,21,1)
    for order in orders[:20]:order.restriccion_acceso='ZONA_PEATONAL'
    db.commit()
    result=RoutingService.optimizar_rutas(db,RutaOptimizarRequest(
        fecha_operacion=operational_today()+timedelta(days=1),pedidos_ids=[p.pedido_id for p in orders]))
    assert len(result.pedidos_no_asignados)==20
    assert sum(p.ruta_id is not None for p in orders)==1
    assert orders[-1].ruta_id is not None
