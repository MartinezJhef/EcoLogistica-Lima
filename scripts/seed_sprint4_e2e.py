"""Explicit disposable fixture. Never run against a shared/production database."""
import os
import sys
from pathlib import Path
from datetime import date
sys.path.insert(0, str(Path(__file__).resolve().parents[1] / 'src/backend'))
from app.db.session import SessionLocal
from app.api.v1.api import api_router
from app.core.auth import hash_password
from app.models.usuario import Usuario
from app.models.vehiculo import Vehiculo
from app.models.conductor import Conductor
from app.models.ruta import Ruta
from app.models.sustainability import SustainabilitySettings
from app.services.analytics_service import capture_snapshot

if os.environ.get('E2E_DISPOSABLE_DATABASE') != '1':
    raise SystemExit('Set E2E_DISPOSABLE_DATABASE=1 only for a disposable test database')
password = os.environ['E2E_PASSWORD']
with SessionLocal() as db:
    cfg = SustainabilitySettings(id='current', data={'fuente':'Datos sintéticos de aceptación; no parámetros reales',
        'vigencia':'2020-01-01','precios_por_galon':{'DIESEL':20},'kg_por_arbol':20,'kg_por_credito':1000,
        'horizonte_anios':10,'proyectos':[{'id':'test','nombre':'Proyecto de prueba'}]})
    db.add(cfg)
    vehicle = Vehiculo(placa='S4-TEST',marca_modelo='Prueba',capacidad_peso_kg=500,capacidad_volumen_m3=5,
        consumo_km_gal=10,tipo_combustible='DIESEL',factor_emision_co2=2)
    driver = Conductor(dni='99000004',nombres='Prueba',apellidos='Sprint4',licencia='TEST-S4',telefono='999999999',estado='DISPONIBLE',licencia_vencimiento=date(2030,1,1))
    db.add_all([vehicle,driver]); db.flush()
    for role in ('ADMIN','OFICINA','REPARTIDOR','CLIENTE'):
        db.add(Usuario(email=role.lower()+'@sprint4.example.test',nombre_completo='Prueba '+role,rol=role,
            password_hash=hash_password(password),estado='ACTIVO',permisos=['ANALITICA'] if role=='OFICINA' else ['REPARTO_POD','SEGUIMIENTO_RUTAS'] if role=='REPARTIDOR' else [],
            conductor_id=driver.conductor_id if role=='REPARTIDOR' else None))
    route = Ruta(vehiculo_id=vehicle.vehiculo_id,conductor_id=driver.conductor_id,fecha_operacion=date(2026,6,1),
        estado='COMPLETADA',distancia_total_km=100,co2_total_kg=45,tiempo_total_min=60)
    db.add(route);db.flush();capture_snapshot(db,route);db.commit()
print('Disposable Sprint 4 fixtures created.')
