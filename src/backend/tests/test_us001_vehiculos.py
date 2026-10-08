import time
import pytest
from uuid import uuid4
from fastapi.testclient import TestClient
from pydantic import ValidationError

from main import app
from app.schemas.vehiculo import VehiculoCreate, VehiculoUpdate
from app.services.fleet_service import FleetService
from app.models.vehiculo import Vehiculo

client = TestClient(app)

class TestUS001Vehiculos:
    """
    Suite de Pruebas Unitarias y de Integración para US-001:
    Gestionar vehículos de la flota (RF-001, RN-004, SUB-001-01 a SUB-001-08).
    """

    def test_sub001_01_diseno_formulario_y_validaciones_pydantic(self):
        """SUB-001-01: Validar campos obligatorios, tipos y formatos de placa/emisiones."""
        # 1. Placa en formato válido
        v_valido = VehiculoCreate(
            placa="ABC-123",
            marca_modelo="Hyundai H-100",
            anio_fabricacion=2024,
            capacidad_peso_kg=1500.0,
            capacidad_volumen_m3=12.0,
            consumo_km_gal=38.5,
            tipo_combustible="GNV",
            factor_emision_co2=0.165
        )
        assert v_valido.placa == "ABC-123"
        assert v_valido.tipo_combustible == "GNV"
        assert v_valido.estado == "DISPONIBLE"

        # 2. Rechazo de placa inválida
        with pytest.raises(ValidationError):
            VehiculoCreate(
                placa="INVALIDA-12345",  # Demasiado larga
                marca_modelo="Camion",
                capacidad_peso_kg=1000,
                capacidad_volumen_m3=5,
                tipo_combustible="DIESEL",
                factor_emision_co2=0.25
            )

        # 3. Rechazo de capacidad negativa o cero
        with pytest.raises(ValidationError):
            VehiculoCreate(
                placa="XYZ-789",
                marca_modelo="Camion",
                capacidad_peso_kg=-500,  # Negativo
                capacidad_volumen_m3=0,   # Cero
                tipo_combustible="DIESEL",
                factor_emision_co2=0.25
            )

        # 4. Rechazo de combustible no permitido
        with pytest.raises(ValidationError):
            VehiculoCreate(
                placa="XYZ-789",
                marca_modelo="Camion",
                capacidad_peso_kg=1000,
                capacidad_volumen_m3=5,
                tipo_combustible="GASOLINA_95",  # No ecológico / no soportado
                factor_emision_co2=0.3
            )

        # 5. Coherencia ambiental: eléctrico no puede tener emisión alta
        with pytest.raises(ValidationError):
            VehiculoCreate(
                placa="ELE-101",
                marca_modelo="Foton EV",
                capacidad_peso_kg=1200,
                capacidad_volumen_m3=8,
                tipo_combustible="ELECTRICO",
                factor_emision_co2=0.25  # Incoherente para un eléctrico
            )

    def test_sub001_02_registro_vehiculo_tiempo_respuesta(self):
        """
        SUB-001-02 / Criterio de Aceptación Escenario 1:
        Registro de vehículo con información válida, estado inicial y confirmación en < 1 segundo.
        """
        placa_test = f"TST-{int(time.time()) % 1000:03d}"
        payload = {
            "placa": placa_test,
            "marca_modelo": "Foton iBlue 100% Eléctrico",
            "anio_fabricacion": 2025,
            "capacidad_peso_kg": 1800.0,
            "capacidad_volumen_m3": 14.5,
            "consumo_km_gal": 0.0,
            "tipo_combustible": "ELECTRICO",
            "factor_emision_co2": 0.0,
            "estado": "DISPONIBLE"
        }

        start_time = time.time()
        response = client.post("/api/v1/vehiculos/", json=payload)
        elapsed_time = time.time() - start_time

        assert response.status_code == 201, response.text
        # Criterio Escenario 1: Respuesta en menos de 1 segundo
        assert elapsed_time < 1.0, f"El registro tardó {elapsed_time:.3f}s (debe ser < 1.0s)"

        data = response.json()
        assert data["placa"] == placa_test
        assert data["tipo_combustible"] == "ELECTRICO"
        assert data["estado"] == "DISPONIBLE"
        assert "vehiculo_id" in data

    def test_sub001_04_validacion_placa_duplicada(self):
        """
        SUB-001-04 / Criterio de Aceptación Escenario 2:
        Rechazo ante placa duplicada con mensaje exacto y código 409 Conflict.
        """
        placa_dup = f"DUP-{int(time.time()) % 1000:03d}"
        payload = {
            "placa": placa_dup,
            "marca_modelo": "Hyundai H-100 GNV",
            "anio_fabricacion": 2023,
            "capacidad_peso_kg": 1500.0,
            "capacidad_volumen_m3": 10.0,
            "consumo_km_gal": 35.0,
            "tipo_combustible": "GNV",
            "factor_emision_co2": 0.165
        }

        # Primer registro: Exitoso
        res1 = client.post("/api/v1/vehiculos/", json=payload)
        assert res1.status_code == 201

        # Segundo registro con la misma placa: Debe ser rechazado
        res2 = client.post("/api/v1/vehiculos/", json=payload)
        assert res2.status_code == 409
        # Mensaje exacto especificado en el Criterio de Aceptación Escenario 2 y RF-001:
        assert res2.json()["detail"] == "La placa ingresada ya se encuentra registrada en el sistema."

    def test_sub001_06_asignacion_automatica_restricciones_circulacion(self):
        """
        SUB-001-06: Asignación automática de restricciones de circulación según normativa de Lima:
        - 100% Eléctrico -> LIBRE_CIRCULACION
        - GNV / Híbrido -> LIBRE_CIRCULACION
        - Diésel Antiguo (> 10 años) -> RESTRINGIDO_CENTRO_HISTORICO
        - Diésel Moderno (<= 10 años) -> PICO_Y_PLACA_AMBIENTAL
        """
        # 1. Unidad 100% Eléctrica
        r_electrico = FleetService.determinar_restriccion_circulacion(
            tipo_combustible="ELECTRICO",
            anio_fabricacion=2025,
            factor_emision_co2=0.0
        )
        assert r_electrico == "LIBRE_CIRCULACION"

        # 2. Unidad GNV
        r_gnv = FleetService.determinar_restriccion_circulacion(
            tipo_combustible="GNV",
            anio_fabricacion=2024,
            factor_emision_co2=0.165
        )
        assert r_gnv == "LIBRE_CIRCULACION"

        # 3. Unidad Diésel con más de 10 años de antigüedad (ej. 2012 en año 2026)
        r_diesel_antiguo = FleetService.determinar_restriccion_circulacion(
            tipo_combustible="DIESEL",
            anio_fabricacion=2012,
            factor_emision_co2=0.260
        )
        assert r_diesel_antiguo == "RESTRINGIDO_CENTRO_HISTORICO"

        # 4. Unidad Diésel moderna Euro VI (ej. 2024)
        r_diesel_moderno = FleetService.determinar_restriccion_circulacion(
            tipo_combustible="DIESEL",
            anio_fabricacion=2024,
            factor_emision_co2=0.220
        )
        assert r_diesel_moderno == "PICO_Y_PLACA_AMBIENTAL"

        # 5. Unidad con Consumo Crítico (ej. GNV a 1 km/gal -> 5.775 kg CO2/km)
        factor_gnv_1km = FleetService.calcular_factor_emision("GNV", 1.0)
        assert factor_gnv_1km == 5.775
        r_gnv_critico = FleetService.determinar_restriccion_circulacion(
            tipo_combustible="GNV",
            anio_fabricacion=2024,
            factor_emision_co2=factor_gnv_1km
        )
        assert r_gnv_critico == "RESTRINGIDO_CENTRO_HISTORICO"

    def test_sub001_03_consulta_por_id_y_placa(self):
        """SUB-001-03: Consulta de vehículos por UUID y por placa."""
        placa_busqueda = f"SRH-{int(time.time()) % 1000:03d}"
        payload = {
            "placa": placa_busqueda,
            "marca_modelo": "Toyota Hilux Híbrida",
            "anio_fabricacion": 2024,
            "capacidad_peso_kg": 1100.0,
            "capacidad_volumen_m3": 8.0,
            "consumo_km_gal": 45.0,
            "tipo_combustible": "HIBRIDO",
            "factor_emision_co2": 0.120
        }
        create_res = client.post("/api/v1/vehiculos/", json=payload)
        assert create_res.status_code == 201
        vehiculo_creado = create_res.json()
        vehiculo_id = vehiculo_creado["vehiculo_id"]

        # Consulta por ID
        res_id = client.get(f"/api/v1/vehiculos/{vehiculo_id}")
        assert res_id.status_code == 200
        assert res_id.json()["vehiculo_id"] == vehiculo_id
        assert res_id.json()["restriccion_circulacion"] == "LIBRE_CIRCULACION"

        # Consulta por Placa
        res_placa = client.get(f"/api/v1/vehiculos/placa/{placa_busqueda}")
        assert res_placa.status_code == 200
        assert res_placa.json()["placa"] == placa_busqueda

    def test_sub001_03_actualizacion_y_baja_logica(self):
        """SUB-001-03: Actualización de atributos (PUT/PATCH) y baja lógica (DELETE)."""
        placa_upd = f"UPD-{int(time.time()) % 1000:03d}"
        payload = {
            "placa": placa_upd,
            "marca_modelo": "Isuzu Forward",
            "anio_fabricacion": 2022,
            "capacidad_peso_kg": 3500.0,
            "capacidad_volumen_m3": 22.0,
            "consumo_km_gal": 28.0,
            "tipo_combustible": "DIESEL",
            "factor_emision_co2": 0.230
        }
        created = client.post("/api/v1/vehiculos/", json=payload).json()
        vehiculo_id = created["vehiculo_id"]

        # Actualización parcial (PATCH): cambio de capacidad y estado
        patch_payload = {
            "capacidad_peso_kg": 3800.0,
            "estado": "EN_RUTA"
        }
        patch_res = client.patch(f"/api/v1/vehiculos/{vehiculo_id}", json=patch_payload)
        assert patch_res.status_code == 200
        assert patch_res.json()["capacidad_peso_kg"] == 3800.0
        assert patch_res.json()["estado"] == "EN_RUTA"

        # Baja lógica (DELETE)
        del_res = client.delete(f"/api/v1/vehiculos/{vehiculo_id}")
        assert del_res.status_code == 200
        assert del_res.json()["estado"] == "INACTIVO"
