import time
import pytest
from uuid import uuid4
from fastapi.testclient import TestClient
from pydantic import ValidationError
from main import app
from app.schemas.conductor import ConductorCreate, ConductorUpdate
from app.services.fleet_service import FleetService
from app.models.conductor import Conductor

client = TestClient(app)

class TestUS002Conductores:
    """
    Suite de Pruebas Unitarias y de Integración para US-002:
    Gestionar conductores y jornada (RF-008, RN-004, Ley N° 30224, SUB-002-01 a SUB-002-08).
    """

    def test_sub002_01_diseno_formulario_y_validaciones_pydantic(self):
        """SUB-002-01: Validar campos obligatorios, DNI, licencia MTC y categoría."""
        # 1. Conductor válido con todos los atributos
        c_valido = ConductorCreate(
            dni="71234567",
            nombres="Juan Carlos",
            apellidos="Pérez Quispe",
            licencia="Q71234567",
            categoria_licencia="A-IIIc",
            telefono="987654321",
            direccion_origen="Av. Elmer Faucett 2100, Callao",
            latitud_origen=-12.034500,
            longitud_origen=-77.112300,
            estado="DISPONIBLE",
            horas_conduccion_hoy=0.0
        )
        assert c_valido.dni == "71234567"
        assert c_valido.licencia == "Q71234567"
        assert c_valido.categoria_licencia == "A-IIIc"
        assert c_valido.estado == "DISPONIBLE"

        # 2. DNI inválido (no numérico o no tiene 8 dígitos)
        with pytest.raises(ValidationError):
            ConductorCreate(
                dni="1234ABC",  # Inválido
                nombres="Carlos",
                apellidos="López",
                licencia="Q12345678",
                telefono="987654321"
            )

        with pytest.raises(ValidationError):
            ConductorCreate(
                dni="123456789",  # 9 dígitos
                nombres="Carlos",
                apellidos="López",
                licencia="Q12345678",
                telefono="987654321"
            )

        # 3. Categoría de licencia no permitida
        with pytest.raises(ValidationError):
            ConductorCreate(
                dni="74561230",
                nombres="Pedro",
                apellidos="Gómez",
                licencia="Q74561230",
                categoria_licencia="CATEGORIA_FALSA",
                telefono="987654321"
            )

    def test_sub002_02_registro_y_consulta_conductores_api(self):
        """SUB-002-02: Registrar conductor y consultar vía endpoints REST."""
        ts = int(time.time() * 1000) % 10000000
        dni_test = f"8{ts:07d}"[:8]
        lic_test = f"Q{dni_test}"

        payload = {
            "dni": dni_test,
            "nombres": "Roberto",
            "apellidos": "Santillán Ramos",
            "licencia": lic_test,
            "categoria_licencia": "A-IIIb",
            "telefono": "981234567",
            "direccion_origen": "Av. Colonial 1450, Cercado de Lima",
            "latitud_origen": -12.046374,
            "longitud_origen": -77.042793,
            "estado": "DISPONIBLE",
            "horas_conduccion_hoy": 0.0
        }

        # 1. Registrar por POST /api/v1/conductores/
        resp_post = client.post("/api/v1/conductores/", json=payload)
        assert resp_post.status_code == 201, resp_post.text
        data = resp_post.json()
        conductor_id = data["conductor_id"]
        assert data["dni"] == dni_test
        assert data["licencia"] == lic_test
        assert data["categoria_licencia"] == "A-IIIb"

        # 2. Consultar por GET /api/v1/conductores/{id}
        resp_get = client.get(f"/api/v1/conductores/{conductor_id}")
        assert resp_get.status_code == 200
        assert resp_get.json()["conductor_id"] == conductor_id

        # 3. Consultar listado GET /api/v1/conductores/
        resp_list = client.get("/api/v1/conductores/")
        assert resp_list.status_code == 200
        conductores = resp_list.json()
        assert any(c["conductor_id"] == conductor_id for c in conductores)

    def test_sub002_03_validacion_licencia_y_dni_duplicados(self):
        """SUB-002-03: Rechazo por conflicto (HTTP 409) si DNI o licencia ya existen."""
        ts = int(time.time() * 1000) % 10000000
        dni_base = f"7{ts:07d}"[:8]
        lic_base = f"Q{dni_base}"

        payload1 = {
            "dni": dni_base,
            "nombres": "Manuel",
            "apellidos": "Vega Castro",
            "licencia": lic_base,
            "categoria_licencia": "A-IIIc",
            "telefono": "999888777",
            "estado": "DISPONIBLE"
        }
        resp1 = client.post("/api/v1/conductores/", json=payload1)
        assert resp1.status_code == 201

        # Intento con el mismo DNI pero diferente licencia
        payload_dni_dup = dict(payload1)
        payload_dni_dup["licencia"] = f"Z{dni_base}"
        resp_dni_dup = client.post("/api/v1/conductores/", json=payload_dni_dup)
        assert resp_dni_dup.status_code == 409
        assert "DNI" in resp_dni_dup.json()["detail"]

        # Intento con la misma licencia pero diferente DNI
        payload_lic_dup = dict(payload1)
        nuevo_dni = f"6{ts:07d}"[:8]
        payload_lic_dup["dni"] = nuevo_dni
        resp_lic_dup = client.post("/api/v1/conductores/", json=payload_lic_dup)
        assert resp_lic_dup.status_code == 409
        assert "licencia" in resp_lic_dup.json()["detail"]

    def test_sub002_04_control_horas_conduccion_y_reinicio(self):
        """SUB-002-04: Acumulación de horas de conducción y reseteo diario."""
        ts = int(time.time() * 1000) % 10000000
        dni = f"5{ts:07d}"[:8]
        lic = f"Q{dni}"

        payload = {
            "dni": dni,
            "nombres": "Hugo",
            "apellidos": "Alvarado",
            "licencia": lic,
            "categoria_licencia": "A-IIb",
            "telefono": "912345678",
            "estado": "DISPONIBLE",
            "horas_conduccion_hoy": 3.5
        }
        resp = client.post("/api/v1/conductores/", json=payload)
        conductor_id = resp.json()["conductor_id"]

        # Acumular 2.0 horas adicionales
        resp_acum = client.post(f"/api/v1/conductores/{conductor_id}/acumular-horas?horas=2.0")
        assert resp_acum.status_code == 200
        assert resp_acum.json()["horas_conduccion_hoy"] == 5.5

        # Reiniciar jornada diaria
        resp_reset = client.post(f"/api/v1/conductores/{conductor_id}/reiniciar-jornada")
        assert resp_reset.status_code == 200
        assert resp_reset.json()["horas_conduccion_hoy"] == 0.0

        # Verificar que el conductor quedó en 0 horas
        resp_get = client.get(f"/api/v1/conductores/{conductor_id}")
        assert resp_get.json()["horas_conduccion_hoy"] == 0.0

    def test_sub002_05_validar_disponibilidad_antes_de_asignar(self):
        """SUB-002-05: Rechazo de asignación de ruta si el conductor no está DISPONIBLE."""
        ts = int(time.time() * 1000) % 10000000
        dni = f"4{ts:07d}"[:8]
        lic = f"Q{dni}"

        # Crear conductor en estado EN_RUTA
        payload = {
            "dni": dni,
            "nombres": "Marcos",
            "apellidos": "Salinas",
            "licencia": lic,
            "categoria_licencia": "A-IIIc",
            "telefono": "934567890",
            "estado": "EN_RUTA",
            "horas_conduccion_hoy": 2.0
        }
        resp = client.post("/api/v1/conductores/", json=payload)
        conductor_id = resp.json()["conductor_id"]

        # Intentar validar jornada para asignar ruta de 3.0 horas
        resp_val = client.post(f"/api/v1/conductores/{conductor_id}/validar-jornada?horas_ruta=3.0")
        assert resp_val.status_code == 400
        assert "no disponible para asignación" in resp_val.json()["detail"]
        assert "EN_RUTA" in resp_val.json()["detail"]

    def test_sub002_06_configurar_punto_de_origen_conductor(self):
        """SUB-002-06: Configurar y actualizar punto de origen GPS y dirección."""
        ts = int(time.time() * 1000) % 10000000
        dni = f"3{ts:07d}"[:8]
        lic = f"Q{dni}"

        payload = {
            "dni": dni,
            "nombres": "César",
            "apellidos": "Mendoza",
            "licencia": lic,
            "categoria_licencia": "A-IIIa",
            "telefono": "956789012",
            "direccion_origen": "Av. Grau 400, La Victoria",
            "latitud_origen": -12.058900,
            "longitud_origen": -77.025600,
            "estado": "DISPONIBLE"
        }
        resp = client.post("/api/v1/conductores/", json=payload)
        assert resp.status_code == 201
        conductor_id = resp.json()["conductor_id"]
        assert resp.json()["direccion_origen"] == "Av. Grau 400, La Victoria"
        assert resp.json()["latitud_origen"] == -12.058900

        # Actualizar dirección de origen
        update_payload = {
            "direccion_origen": "Av. Javier Prado Este 2500, San Borja",
            "latitud_origen": -12.086300,
            "longitud_origen": -77.001200
        }
        resp_update = client.put(f"/api/v1/conductores/{conductor_id}", json=update_payload)
        assert resp_update.status_code == 200
        assert resp_update.json()["direccion_origen"] == "Av. Javier Prado Este 2500, San Borja"
        assert resp_update.json()["latitud_origen"] == -12.086300

    def test_sub002_07_bloqueo_asignacion_limite_legal_8_horas_escenario2(self):
        """
        SUB-002-07 / Escenario 2 Criterios de Aceptación:
        Dado que el conductor tiene 7.5 horas acumuladas hoy,
        cuando se intenta asignar una ruta de 1.5 horas (total 9.0 > 8.0),
        entonces el sistema rechaza la asignación con HTTP 400 y el mensaje exacto:
        "Asignación rechazada: Supera el límite legal de 8 horas diarias (Ley N° 30224)."
        """
        ts = int(time.time() * 1000) % 10000000
        dni = f"2{ts:07d}"[:8]
        lic = f"Q{dni}"

        payload = {
            "dni": dni,
            "nombres": "Ernesto",
            "apellidos": "Gutiérrez",
            "licencia": lic,
            "categoria_licencia": "A-IIIc",
            "telefono": "978123456",
            "estado": "DISPONIBLE",
            "horas_conduccion_hoy": 7.5  # 7.5 horas acumuladas
        }
        resp = client.post("/api/v1/conductores/", json=payload)
        assert resp.status_code == 201
        conductor_id = resp.json()["conductor_id"]

        # 1. Asignar ruta de 1.5 horas (7.5 + 1.5 = 9.0 > 8.0) -> DEBE RECHAZARSE
        resp_rechazo = client.post(f"/api/v1/conductores/{conductor_id}/validar-jornada?horas_ruta=1.5")
        assert resp_rechazo.status_code == 400
        assert resp_rechazo.json()["detail"] == "Asignación rechazada: Supera el límite legal de 8 horas diarias (Ley N° 30224)."

        # 2. Asignar ruta de 0.4 horas (7.5 + 0.4 = 7.9 <= 8.0) -> DEBE APROBARSE
        resp_aprob = client.post(f"/api/v1/conductores/{conductor_id}/validar-jornada?horas_ruta=0.4")
        assert resp_aprob.status_code == 200
        data_aprob = resp_aprob.json()
        assert data_aprob["aprobado"] is True
        assert data_aprob["horas_proyectadas"] == 7.9
        assert data_aprob["limite_legal_horas"] == 8.0
