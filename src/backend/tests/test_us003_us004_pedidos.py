import pytest
from datetime import time
from uuid import uuid4
from unittest.mock import MagicMock
from fastapi import HTTPException
from pydantic import ValidationError

from app.schemas.pedido import (
    PedidoCreate,
    PreferenciasClienteUpdate,
    EstadoPedidoUpdate,
    PedidoResponse,
    RESTRICCIONES_ACCESO
)
from app.services.order_service import OrderService
from app.models.pedido import Pedido

class TestUS003US004Pedidos:
    """
    Suite de Pruebas Unitarias y de Integración para:
    - US-003: Registrar pedidos y geolocalización (RF-002, RN-002, RN-006, RN-007)
    - US-004: Gestionar preferencias y restricciones del cliente (RF-009, RN-007, RN-010)
    """

    # =========================================================================
    # PRUEBAS US-003: Registrar pedidos y geolocalización
    # =========================================================================

    def test_us003_01_formulario_y_validaciones_pydantic_valido(self):
        """US-003 Escenario 1: Registro de pedido válido con coordenadas en Lima y ventana horaria."""
        pedido_valido = PedidoCreate(
            codigo_seguimiento="PED-LIMA-100",
            cliente_nombre="Bodega Los Rosales · San Juan de Lurigancho",
            direccion_destino="Av. Próceres de la Independencia 2450, SJL",
            latitud=-12.012500,
            longitud=-77.001200,
            peso_kg=45.5,
            volumen_m3=0.85,
            ventana_inicio=time(8, 30),
            ventana_fin=time(12, 0),
            prioridad="ALTA",
            restriccion_acceso="LIBRE_ACCESO"
        )
        assert pedido_valido.codigo_seguimiento == "PED-LIMA-100"
        assert pedido_valido.peso_kg == 45.5
        assert pedido_valido.volumen_m3 == 0.85
        assert pedido_valido.ventana_fin > pedido_valido.ventana_inicio
        assert pedido_valido.restriccion_acceso == "LIBRE_ACCESO"

    def test_us003_02_rechazo_dimensiones_y_ventanas_invalidas(self):
        """US-003 Escenario 3 (Ruta Infeliz RF-002 / RN-007): Ventana fin <= inicio o peso/volumen <= 0."""
        # 1. Ventana horaria inválida (fin anterior al inicio)
        with pytest.raises(ValidationError) as exc_info:
            PedidoCreate(
                codigo_seguimiento="PED-FAIL-001",
                cliente_nombre="Cliente Invalido",
                direccion_destino="Av. Principal 100",
                latitud=-12.046374,
                longitud=-77.042793,
                peso_kg=50.0,
                volumen_m3=1.0,
                ventana_inicio=time(14, 0),
                ventana_fin=time(11, 0)  # Inválido
            )
        assert "Ventana de entrega o dimensiones de carga inválidas." in str(exc_info.value)

        # 2. Ventana horaria idéntica (fin == inicio)
        with pytest.raises(ValidationError) as exc_info2:
            PedidoCreate(
                codigo_seguimiento="PED-FAIL-002",
                cliente_nombre="Cliente Invalido",
                direccion_destino="Av. Principal 100",
                latitud=-12.046374,
                longitud=-77.042793,
                peso_kg=50.0,
                volumen_m3=1.0,
                ventana_inicio=time(10, 0),
                ventana_fin=time(10, 0)  # Fin igual a inicio
            )
        assert "Ventana de entrega o dimensiones de carga inválidas." in str(exc_info2.value)

        # 3. Peso no positivo (<= 0)
        with pytest.raises(ValidationError):
            PedidoCreate(
                codigo_seguimiento="PED-FAIL-003",
                cliente_nombre="Cliente Invalido",
                direccion_destino="Av. Principal 100",
                latitud=-12.046374,
                longitud=-77.042793,
                peso_kg=-10.0,  # Negativo
                volumen_m3=1.0,
                ventana_inicio=time(8, 0),
                ventana_fin=time(11, 0)
            )

        # 4. Volumen no positivo (<= 0)
        with pytest.raises(ValidationError):
            PedidoCreate(
                codigo_seguimiento="PED-FAIL-004",
                cliente_nombre="Cliente Invalido",
                direccion_destino="Av. Principal 100",
                latitud=-12.046374,
                longitud=-77.042793,
                peso_kg=10.0,
                volumen_m3=0.0,  # Cero
                ventana_inicio=time(8, 0),
                ventana_fin=time(11, 0)
            )

    def test_us003_03_rechazo_coordenadas_fuera_de_lima(self):
        """US-003: Validación geográfica estricta para Lima Metropolitana (RN-006)."""
        with pytest.raises(ValidationError):
            PedidoCreate(
                codigo_seguimiento="PED-OUT-001",
                cliente_nombre="Ubicación Fuera",
                direccion_destino="Calle Lejana",
                latitud=10.500000,  # Latitud positiva (fuera de Perú / Lima)
                longitud=-77.000000,
                peso_kg=15.0,
                volumen_m3=0.2,
                ventana_inicio=time(9, 0),
                ventana_fin=time(12, 0)
            )

    def test_us003_04_geolocalizacion_manual_y_referencia_textual(self):
        """US-003 Escenario 2: Ubicación manual con referencia textual en zonas sin nomenclatura estándar."""
        pedido_manual = PedidoCreate(
            codigo_seguimiento="PED-MANUAL-001",
            cliente_nombre="Comercial Doña Lucha · Huaycán",
            direccion_destino="Zona Z, Lote 45, UCV 120, Huaycán, Ate",
            latitud=-12.028450,
            longitud=-76.845120,
            peso_kg=120.0,
            volumen_m3=1.5,
            ventana_inicio=time(7, 0),
            ventana_fin=time(10, 30),
            prioridad="URGENTE",
            referencia_ubicacion="Subiendo 2 cuadras del mercado central de Huaycán, fachada color turquesa con portón metálico."
        )
        assert pedido_manual.referencia_ubicacion is not None
        assert "fachada color turquesa" in pedido_manual.referencia_ubicacion
        assert pedido_manual.latitud == -12.028450

    def test_us003_05_rechazo_codigo_duplicado(self):
        """US-003: Validación de código de seguimiento duplicado (HTTP 409)."""
        mock_db = MagicMock()
        existing_pedido = Pedido(
            pedido_id=uuid4(),
            codigo_seguimiento="PED-DUP-001",
            cliente_nombre="Existente",
            estado="PENDIENTE"
        )
        # Simular que la base de datos ya contiene un pedido con ese código
        mock_db.query.return_value.filter.return_value.first.return_value = existing_pedido

        payload = PedidoCreate(
            codigo_seguimiento="PED-DUP-001",
            cliente_nombre="Duplicado",
            direccion_destino="Av. Test 123",
            latitud=-12.046374,
            longitud=-77.042793,
            peso_kg=30.0,
            volumen_m3=0.5,
            ventana_inicio=time(9, 0),
            ventana_fin=time(12, 0)
        )

        with pytest.raises(HTTPException) as exc_info:
            OrderService.create_pedido(mock_db, payload)
        assert exc_info.value.status_code == 409
        assert "ya se encuentra registrado" in exc_info.value.detail

    # =========================================================================
    # PRUEBAS US-004: Gestionar preferencias y restricciones del cliente
    # =========================================================================

    def test_us004_01_actualizacion_preferencias_validas(self):
        """US-004 Escenario 1: Actualizar horarios de atención, acceso vehicular y referencias."""
        # 1. Crear schema válido de actualización
        pref_update = PreferenciasClienteUpdate(
            ventana_inicio=time(10, 0),
            ventana_fin=time(14, 0),
            restriccion_acceso="ALTURA_MAXIMA_2_5M",
            referencia_ubicacion="Entrada por callejón lateral, timbre 3",
            foto_referencia_url="https://ecologistica.pe/assets/fachada-local-01.jpg",
            telefono_contacto="987112233"
        )
        assert pref_update.restriccion_acceso == "ALTURA_MAXIMA_2_5M"
        assert pref_update.ventana_fin > pref_update.ventana_inicio

        # 2. Rechazo de restricción vehicular no estandarizada
        with pytest.raises(ValidationError):
            PreferenciasClienteUpdate(
                restriccion_acceso="RESTRICCION_INVENTADA"
            )

        # 3. Rechazo de ventana horaria inconsistente en actualización
        with pytest.raises(ValidationError) as exc_info:
            PreferenciasClienteUpdate(
                ventana_inicio=time(15, 0),
                ventana_fin=time(11, 0)
            )
        assert "Ventana de entrega o dimensiones de carga inválidas." in str(exc_info.value)

    def test_us004_02_regla_rn010_bloqueo_preferencias_pedido_en_transito(self):
        """
        US-004 Escenario 2 / Regla RN-007 y RN-010:
        Si el pedido está en tránsito (EN_TRANSITO o EN_RUTA), rechazar con HTTP 400 y mensaje exacto:
        'No se pueden alterar las preferencias de un pedido en tránsito.'
        """
        mock_db = MagicMock()
        pedido_en_transito = Pedido(
            pedido_id=uuid4(),
            codigo_seguimiento="PED-RUTA-999",
            cliente_nombre="Supermercado Metro",
            estado="EN_TRANSITO",  # Pedido en camino activo
            ventana_inicio=time(8, 0),
            ventana_fin=time(12, 0),
            restriccion_acceso="LIBRE_ACCESO"
        )
        mock_db.query.return_value.filter.return_value.first.return_value = pedido_en_transito

        pref_in = PreferenciasClienteUpdate(
            ventana_inicio=time(9, 0),
            ventana_fin=time(13, 0),
            restriccion_acceso="NO_CAMIONES_PESADOS"
        )

        with pytest.raises(HTTPException) as exc_info:
            OrderService.update_preferencias_cliente(mock_db, pedido_en_transito.pedido_id, pref_in)

        # Verificación exacta del mensaje exigido por los criterios BDD
        assert exc_info.value.status_code == 400
        assert exc_info.value.detail == "No se pueden alterar las preferencias de un pedido en tránsito."

        # También verificar con estado alternativo 'EN_RUTA'
        pedido_en_transito.estado = "EN_RUTA"
        with pytest.raises(HTTPException) as exc_info2:
            OrderService.update_preferencias_cliente(mock_db, pedido_en_transito.pedido_id, pref_in)
        assert exc_info2.value.status_code == 400
        assert exc_info2.value.detail == "No se pueden alterar las preferencias de un pedido en tránsito."

    def test_us004_03_permite_actualizar_preferencias_en_estado_pendiente(self):
        """US-004: Cuando el pedido está 'PENDIENTE', las preferencias se actualizan con éxito."""
        mock_db = MagicMock()
        pedido_pendiente = Pedido(
            pedido_id=uuid4(),
            codigo_seguimiento="PED-OK-123",
            cliente_nombre="Distribuidora El Sol",
            estado="PENDIENTE",  # Estado permitido para edición
            ventana_inicio=time(8, 0),
            ventana_fin=time(11, 0),
            restriccion_acceso="LIBRE_ACCESO",
            referencia_ubicacion="Frente al parque",
            foto_referencia_url=None,
            telefono_contacto=None
        )
        mock_db.query.return_value.filter.return_value.first.return_value = pedido_pendiente

        # Mock de serialización de respuesta
        from shapely.geometry import Point
        from geoalchemy2.shape import from_shape
        pedido_pendiente.ubicacion_destino = from_shape(Point(-77.042793, -12.046374), srid=4326)
        pedido_pendiente.peso_kg = 50.0
        pedido_pendiente.volumen_m3 = 0.5
        pedido_pendiente.prioridad = "ESTANDAR"
        pedido_pendiente.ruta_id = None
        pedido_pendiente.direccion_destino = "Av. Tacna 450"
        from datetime import datetime
        pedido_pendiente.creado_en = datetime.now()

        pref_in = PreferenciasClienteUpdate(
            ventana_inicio=time(9, 0),
            ventana_fin=time(13, 0),
            restriccion_acceso="SOLO_VEHICULOS_LIGEROS",
            foto_referencia_url="https://ecologistica.pe/foto-fachada.jpg"
        )

        res = OrderService.update_preferencias_cliente(mock_db, pedido_pendiente.pedido_id, pref_in)
        assert pedido_pendiente.restriccion_acceso == "SOLO_VEHICULOS_LIGEROS"
        assert pedido_pendiente.ventana_inicio == time(9, 0)
        assert pedido_pendiente.foto_referencia_url == "https://ecologistica.pe/foto-fachada.jpg"
        assert mock_db.commit.called
