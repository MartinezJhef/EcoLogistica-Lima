"""Acceptance smoke test for disposable staging, never a production database.

Requires an admin created by the CI bootstrap and the httpx test dependency.
Creates synthetic users, one vehicle, one driver and one order, then verifies a full route.
"""
from pathlib import Path
import json,time,secrets,httpx
from datetime import date,timedelta
import os
from urllib.parse import urlparse
base=os.getenv('STAGING_API_URL','http://127.0.0.1:8000/api/v1').rstrip('/')
if urlparse(base).hostname not in ('localhost','127.0.0.1'):
    raise SystemExit('Esta prueba solo puede ejecutarse contra el entorno local desechable.')
private={'admin_email':os.getenv('STAGING_ADMIN_EMAIL','staging-admin@example.test'),'admin_password':os.environ['STAGING_ADMIN_PASSWORD']}
report=[]
client=httpx.Client(base_url=base,timeout=60,follow_redirects=True)
def call(method,path,**kwargs):
    response=client.request(method,path,**kwargs)
    if response.status_code>=400:raise RuntimeError(f'{method} {path}: {response.status_code}: {response.text[:500]}')
    return response.json()
for _ in range(30):
    try:client.get('/health').raise_for_status();break
    except httpx.HTTPError:time.sleep(.2)
login=call('POST','/auth/login',json={'email':private['admin_email'],'password':private['admin_password']})
admin={'Authorization':'Bearer '+login['access_token']};client.headers.update(admin)
tag=secrets.token_hex(3);plate=secrets.token_hex(2).upper()[:3]+'-'+str(secrets.randbelow(900)+100)
vehicle=call('POST','/vehiculos',json=dict(placa=plate,marca_modelo='Vehículo de prueba local',anio_fabricacion=2025,capacidad_peso_kg=100,capacidad_volumen_m3=10,tipo_combustible='ELECTRICO',factor_emision_co2=0,altura_m=2.4,es_ligero=True,estado='DISPONIBLE'))
driver=call('POST','/conductores',json=dict(dni=str(secrets.randbelow(90000000)+10000000),nombres='Conductor',apellidos='Prueba local',licencia='T'+str(secrets.randbelow(90000000)+10000000),licencia_vencimiento=(date.today()+timedelta(days=365)).isoformat(),categoria_licencia='A-IIIc',telefono='900000000',estado='DISPONIBLE'))
users={}
for role in ['CLIENTE','REPARTIDOR']:
    password=secrets.token_urlsafe(24);email=f'review-{role.lower()}-{tag}@example.test'
    created=call('POST','/usuarios',json=dict(email=email,nombre_completo=f'Cuenta de prueba {role}',password=password,rol=role,estado='ACTIVO',permisos=['SEGUIMIENTO_RUTAS'] if role=='REPARTIDOR' else [],conductor_id=driver['conductor_id'] if role=='REPARTIDOR' else None))
    token=call('POST','/auth/login',json={'email':email,'password':password})['access_token']
    users[role]={'email':email,'password':password,'headers':{'Authorization':'Bearer '+token},'id':created['usuario_id']}
client.headers.update(users['CLIENTE']['headers'])
order=call('POST','/mobile/pedidos',json=dict(codigo_seguimiento='QA-'+tag,cliente_nombre='Cliente de prueba local',direccion_destino='Av. José Pardo 805, Miraflores',latitud=-12.119,longitud=-77.034,peso_kg=20,volumen_m3=1,ventana_inicio='08:00',ventana_fin='18:00'))
oid=order['pedido_id'];prefs={'ventana_inicio':'09:00','ventana_fin':'18:00','referencia_ubicacion':'Puerta de prueba','restriccion_acceso':'ALTURA_MAXIMA_2_5M'}
call('PATCH',f'/mobile/pedidos/{oid}/preferencias',json=prefs);assert call('GET',f'/mobile/pedidos/{oid}')['referencia_ubicacion']=='Puerta de prueba'
report.append('Cliente autenticado registra pedido propio y guarda sus preferencias en PostgreSQL real.')
client.headers.update(admin);started=time.monotonic()
plan=call('POST','/rutas/optimizar',json={'fecha_operacion':date.today().isoformat(),'vehiculo_id':vehicle['vehiculo_id'],'conductor_id':driver['conductor_id'],'pedidos_ids':[oid]})
assert plan['pedidos_asignados_count']==1,plan.get('pedidos_no_asignados')
route=plan['rutas'][0];rid=route['ruta_id']
assert any(t.get('geometria_linea_geojson') for t in route['tramos']);assert route['co2_total_kg']==0
report.append(f'Ruta sobre calles OSRM: {route["distancia_total_km"]} km, {route["tiempo_total_min"]} min; planificación {time.monotonic()-started:.2f} s; CO2 eléctrico cero.')
client.headers.update(users['REPARTIDOR']['headers']);path=f'/rutas/conductor/{driver["conductor_id"]}/actualizaciones'
updates=call('GET',path);assert any(u['itinerario']['ruta_id']==rid for u in updates)
for u in updates:call('POST',path+'/'+u['update_id']+'/confirmar')
assert call('GET',path)==[];report.append('El conductor recibe y confirma el itinerario persistido; la cola queda vacía.')
call('PATCH',f'/mobile/pedidos/{oid}',json={'estado':'EN_TRANSITO'})
client.headers.update(users['CLIENTE']['headers']);locked=client.patch(f'/mobile/pedidos/{oid}/preferencias',json=prefs);assert locked.status_code==400
client.headers.update(users['REPARTIDOR']['headers']);call('PATCH',f'/mobile/pedidos/{oid}',json={'estado':'ENTREGADO'});call('POST',f'/rutas/{rid}/finalizar',json={'regreso_confirmado':True})
client.headers.update(admin);assert call('GET',f'/rutas/{rid}')['estado']=='COMPLETADA'
report.append('Entrega en tránsito bloquea cambios del cliente; entrega y regreso confirmado completan la ruta.')
print('\n'.join(report))
