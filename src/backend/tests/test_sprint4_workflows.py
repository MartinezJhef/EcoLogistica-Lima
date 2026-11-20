from datetime import date
from types import SimpleNamespace
from uuid import uuid4
from io import BytesIO
import pytest
from app.core.auth import current_user
from app.models.sustainability import SustainabilitySettings, RouteSnapshot, SustainabilityExport
from app.models.ruta import Ruta
from app.models.vehiculo import Vehiculo
from app.models.conductor import Conductor
from app.services.analytics_service import capture_snapshot, summary, compensation, preserve_completed_legs
from app.services.report_service import process_next, render_pdf
from main import app

CONFIG = {'fuente': 'Parámetros sintéticos de prueba, no tarifas de producción', 'vigencia': '2020-01-01',
          'precios_por_galon': {'DIESEL': 20}, 'precio_kwh': 1, 'consumo_electrico_kwh_km': .2,
          'kg_por_arbol': 20, 'horizonte_anios': 10, 'kg_por_credito': 1000,
          'proyectos': [{'id': 'a', 'nombre': 'Proyecto A'}, {'id': 'b', 'nombre': 'Proyecto B'}]}


@pytest.fixture
def setup_s4(db_session):
    db = db_session
    for model in (SustainabilityExport, RouteSnapshot, SustainabilitySettings):
        db.query(model).delete()
    db.add(SustainabilitySettings(id='current', data=CONFIG))
    previous = app.dependency_overrides[current_user]
    user = SimpleNamespace(usuario_id=uuid4(), rol='ADMIN', permisos=['ANALITICA'], conductor_id=None)
    app.dependency_overrides[current_user] = lambda: user
    vehicle = Vehiculo(placa=str(uuid4())[:8], marca_modelo='Prueba', capacidad_peso_kg=500,
        capacidad_volumen_m3=5, consumo_km_gal=10, tipo_combustible='DIESEL', factor_emision_co2=2)
    driver = Conductor(dni=str(uuid4())[:8], nombres='Prueba', apellidos='S4', licencia=str(uuid4())[:10],
                       telefono='999999999', estado='DISPONIBLE')
    db.add_all([vehicle, driver]); db.flush()
    route = Ruta(conductor_id=driver.conductor_id, vehiculo_id=vehicle.vehiculo_id, fecha_operacion=date(2026, 6, 1),
                 distancia_total_km=100, co2_total_kg=45, tiempo_total_min=60, estado='COMPLETADA')
    db.add(route); db.flush(); capture_snapshot(db, route); db.commit()
    yield db, user, route
    app.dependency_overrides[current_user] = previous
    for model in (SustainabilityExport, RouteSnapshot, SustainabilitySettings): db.query(model).delete()
    db.delete(route); db.delete(vehicle); db.delete(driver); db.commit()


def test_dashboard_historical_factors_and_periods(client, setup_s4):
    db, user, route = setup_s4
    response = client.get('/api/v1/analitica/resumen?desde=2026-06-01&hasta=2026-06-01')
    assert response.status_code == 200
    data = response.json()
    assert data['totales']['costo_pen'] == 200
    assert data['totales']['co2_kg'] == 45
    assert data['variacion_porcentaje']['co2_kg'] == 0
    assert client.put('/api/v1/analitica/configuracion', json={**CONFIG, 'precios_por_galon': {'DIESEL': 999}}).status_code == 200
    route.vehiculo.consumo_km_gal = 1; db.commit()
    assert summary(db, date(2026,6,1), date(2026,6,1))['totales']['costo_pen'] == 200
    assert client.get('/api/v1/analitica/resumen?desde=2026-07-01&hasta=2026-06-01').status_code == 422


def test_persistent_report_worker_pdf_and_private_download(client, setup_s4):
    db, user, route = setup_s4
    result = client.post('/api/v1/reportes', json={'desde':'2026-06-01','hasta':'2026-06-01'})
    assert result.status_code == 202
    job_id = result.json()['id']
    assert client.get(f'/api/v1/reportes/{job_id}/archivo').status_code == 409
    assert process_next(db)
    response = client.get(f'/api/v1/reportes/{job_id}/archivo')
    assert response.content.startswith(b'%PDF')
    assert response.headers['cache-control'] == 'private, no-store'
    assert client.get(f'/api/v1/reportes/{job_id}').json()['estado'] == 'LISTO'
    user.rol = 'OFICINA'; user.usuario_id = uuid4()
    assert client.get(f'/api/v1/reportes/{job_id}/archivo').status_code == 404
    assert not process_next(db)


def test_empty_report_exact_message(client, setup_s4):
    response = client.post('/api/v1/reportes', json={'desde':'2020-06-01','hasta':'2020-06-01'})
    assert response.status_code == 422
    assert response.json()['detail'] == 'No se encontraron datos para generar el reporte en el periodo especificado.'


@pytest.mark.parametrize('role,permissions,expected', [('ADMIN',[],200),('OFICINA',['ANALITICA'],200),('OFICINA',[],403),('REPARTIDOR',['ANALITICA'],403),('CLIENTE',['ANALITICA'],403)])
def test_roles_enforced_server_side(client, setup_s4, role, permissions, expected):
    db, user, route = setup_s4
    user.rol, user.permisos = role, permissions
    assert client.get('/api/v1/analitica/resumen?desde=2026-06-01&hasta=2026-06-01').status_code == expected
    assert client.get('/api/v1/reportes').status_code == expected
    assert client.put('/api/v1/analitica/configuracion', json=CONFIG).status_code == (200 if role == 'ADMIN' else 403)


def test_compensation_rounding_and_export(client, setup_s4):
    db, user, route = setup_s4
    payload = {'desde':'2026-06-01','hasta':'2026-06-01','distribucion':{'a':50,'b':50}}
    response = client.post('/api/v1/compensacion/propuestas', json=payload)
    assert response.status_code == 200
    result = response.json()
    assert result['arboles'] == 3 and result['creditos'] == .045
    assert sum(p['arboles'] for p in result['proyectos']) == 3
    assert process_next(db)
    assert client.get(f"/api/v1/compensacion/propuestas/{result['id']}/archivo").content.startswith(b'%PDF')
    for dist in ({'a':90}, {'unknown':100}, {'a':-1,'b':101}):
        assert client.post('/api/v1/compensacion/propuestas', json={**payload,'distribucion':dist}).status_code == 422


def test_summary_batches_periods_and_preserves_state_counts(setup_s4):
    from sqlalchemy import event
    db, user, route = setup_s4
    prior = Ruta(conductor_id=route.conductor_id, vehiculo_id=route.vehiculo_id,
        fecha_operacion=date(2026, 5, 31), distancia_total_km=50,
        co2_total_kg=20, tiempo_total_min=30, estado='COMPLETADA')
    pending = Ruta(conductor_id=route.conductor_id, vehiculo_id=route.vehiculo_id,
        fecha_operacion=date(2026, 6, 1), distancia_total_km=999,
        co2_total_kg=999, tiempo_total_min=30, estado='PLANIFICADA')
    db.add_all([prior, pending]); db.flush(); capture_snapshot(db, prior); db.commit()
    selects = []
    def observe(conn, cursor, statement, parameters, context, executemany):
        if statement.lstrip().upper().startswith('SELECT'): selects.append(statement)
    engine = db.get_bind()
    event.listen(engine, 'before_cursor_execute', observe)
    try:
        result = summary(db, date(2026, 6, 1), date(2026, 6, 1))
    finally:
        event.remove(engine, 'before_cursor_execute', observe)
    assert result['totales']['distancia_km'] == 100
    assert result['anterior']['distancia_km'] == 50
    assert result['variacion_porcentaje']['distancia_km'] == 100
    assert result['estados']['PLANIFICADA'] == 1
    assert len(selects) <= 2
    db.delete(prior); db.delete(pending); db.commit()


def test_missing_snapshot_does_not_invent_costs(setup_s4):
    db, user, route = setup_s4
    db.query(RouteSnapshot).delete(); db.commit()
    result = summary(db, date(2026,6,1), date(2026,6,1))
    assert result['totales']['costo_pen'] is None
    assert result['totales']['parametros_incompletos'] == 1


def test_config_validation(client, setup_s4):
    for change in ({'kg_por_arbol':0}, {'proyectos':[CONFIG['proyectos'][0]]*2}, {'fuente':'x'}, {'precios_por_galon':{'UNKNOWN':2}}):
        assert client.put('/api/v1/analitica/configuracion', json={**CONFIG, **change}).status_code == 422


def test_worker_failure_and_retry(client, setup_s4, monkeypatch):
    db, user, route = setup_s4
    result = client.post('/api/v1/reportes', json={'desde':'2026-06-01','hasta':'2026-06-01'}).json()
    import app.services.report_service as service
    monkeypatch.setattr(service, 'render_pdf', lambda *args: (_ for _ in ()).throw(ValueError('test')))
    assert process_next(db)
    assert client.get(f"/api/v1/reportes/{result['id']}").json()['estado'] == 'ERROR'
    assert client.post(f"/api/v1/reportes/{result['id']}/reintentar").json()['estado'] == 'PENDIENTE'


def test_reoptimization_keeps_completed_prefix_once(setup_s4):
    from app.models.pedido import Pedido
    db, user, route = setup_s4
    order = SimpleNamespace(estado='ENTREGADO')
    # Session.get is isolated here to exercise the prefix accumulator without unrelated spatial fixtures.
    class DB:
        def get(self, model, key): return order if model is Pedido else db.get(model,key)
        def add(self, row): db.add(row)
        def flush(self): db.flush()
    leg = SimpleNamespace(tramo_id=uuid4(),pedido_id=uuid4(),distancia_tramo_km=12,co2_tramo_kg=3)
    preserve_completed_legs(DB(), route, [leg])
    preserve_completed_legs(DB(), route, [leg])
    result = summary(db,date(2026,6,1),date(2026,6,1))
    assert result['totales']['distancia_km'] == 112
    assert result['totales']['co2_kg'] == 48


def test_electric_cost_and_missing_factors(setup_s4):
    db, user, route = setup_s4
    snapshot = db.get(RouteSnapshot,str(route.ruta_id))
    snapshot.data = {**snapshot.data,'combustible':'ELECTRICO'}; db.commit()
    result = summary(db,date(2026,6,1),date(2026,6,1))['totales']
    assert result['consumo_gal'] == 0 and result['energia_kwh'] == 20 and result['costo_pen'] == 20
    snapshot.data = {**snapshot.data,'config':{**CONFIG,'precio_kwh':None}}; db.commit()
    assert summary(db,date(2026,6,1),date(2026,6,1))['totales']['costo_pen'] is None


def test_pdf_large_report_has_multiple_pages(setup_s4):
    db, user, route = setup_s4
    report = summary(db,date(2026,6,1),date(2026,6,1))
    report['detalle'] *= 100
    document = render_pdf(report,'REPORTE')
    assert document.startswith(b'%PDF') and document.count(b'/Type /Page\n') > 1
