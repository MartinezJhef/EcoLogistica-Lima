import pytest
from datetime import date, time
from uuid import UUID, uuid4
from fastapi.testclient import TestClient
from geoalchemy2.shape import from_shape
from shapely.geometry import Point

from app.models.vehiculo import Vehiculo
from app.models.conductor import Conductor
from app.models.deposito import Deposito
from app.models.pedido import Pedido
from app.models.ruta import Ruta
from app.models.tramo import Tramo
from app.schemas.ruta import (
    RutaOptimizarRequest,
    ReoptimizarRutaRequest
)
from app.services.routing_service import (
    RoutingService,
    haversine_km,
    point_in_polygon,
    ZBE_CENTRO_HISTORICO
)

def crear_pedido_helper(
    codigo: str,
    cliente: str,
    direccion: str,
    lat: float,
    lng: float,
    peso: float,
    vol: float,
    v_inicio: time,
    v_fin: time,
    prioridad: str = "ESTANDAR",
    estado: str = "PENDIENTE"
) -> Pedido:
    punto = from_shape(Point(lng, lat), srid=4326)
    return Pedido(
        pedido_id=uuid4(),
        codigo_seguimiento=codigo,
        cliente_nombre=cliente,
        direccion_destino=direccion,
        ubicacion_destino=punto,
        peso_kg=peso,
        volumen_m3=vol,
        ventana_inicio=v_inicio,
        ventana_fin=v_fin,
        prioridad=prioridad,
        estado=estado
    )

class TestUS005US006Rutas:
    """
    Suite de Pruebas Unitarias y de Integración para Sprint 3:
    - US-005: Generar rutas optimizadas CVRPTW y medición computacional CodeCarbon (RF-003, RN-001, RN-004)
    - US-006: Visualización geoespacial de rutas, paradas y polígonos de riesgo en Lima (RF-004)
    - US-007: Reoptimización dinámica de rutas ante incidencias (RF-007)
    """

    @pytest.fixture(autouse=True)
    def setup_data(self, db_session):
        """Prepara datos limpios en la base de datos de pruebas para cada test."""
        db_session.query(Tramo).delete()
        db_session.query(Ruta).delete()
        db_session.query(Pedido).delete()
        db_session.query(Conductor).delete()
        db_session.query(Vehiculo).delete()
        db_session.query(Deposito).delete()
        db_session.commit()

        # Crear Depósito Principal
        self.deposito = Deposito(
            deposito_id=uuid4(),
            nombre="Centro de Distribución Principal - Callao / Lima",
            direccion="Av. Argentina 2800, Callao",
            latitud=-12.045000,
            longitud=-77.060000,
            estado="OPERATIVO"
        )
        db_session.add(self.deposito)

        # Crear Vehículo Eléctrico (Emisión 0)
        self.vehiculo_electrico = Vehiculo(
            vehiculo_id=uuid4(),
            placa="ECO-001",
            marca_modelo="BYD T3 Eléctrico",
            anio_fabricacion=2024,
            capacidad_peso_kg=800.0,
            capacidad_volumen_m3=3.8,
            consumo_km_gal=0.0,
            tipo_combustible="ELECTRICO",
            factor_emision_co2=0.0000,
            restriccion_circulacion="LIBRE_CIRCULACION",
            estado="DISPONIBLE"
        )
        db_session.add(self.vehiculo_electrico)

        # Crear Vehículo Diésel (Restringido en ZBE)
        self.vehiculo_diesel = Vehiculo(
            vehiculo_id=uuid4(),
            placa="DIE-999",
            marca_modelo="Hino Dutro Diésel",
            anio_fabricacion=2021,
            capacidad_peso_kg=2500.0,
            capacidad_volumen_m3=12.0,
            consumo_km_gal=28.0,
            tipo_combustible="DIESEL",
            factor_emision_co2=0.2700,
            restriccion_circulacion="CENTRO_HISTORICO_RESTRINGIDO",
            estado="DISPONIBLE"
        )
        db_session.add(self.vehiculo_diesel)

        # Crear Conductor Disponible
        self.conductor = Conductor(
            conductor_id=uuid4(),
            dni="70894512",
            nombres="Carlos Eduardo",
            apellidos="Quispe Huamán",
            licencia="Q70894512",
            categoria_licencia="A-IIb",
            telefono="987654321",
            direccion_origen="Av. Faucett 120, Bellavista",
            latitud_origen=-12.055000,
            longitud_origen=-77.105000,
            estado="DISPONIBLE",
            horas_conduccion_hoy=1.5
        )
        db_session.add(self.conductor)

        db_session.commit()

    # =========================================================================
    # PRUEBAS GEODÉSICAS Y POLÍGONOS DE RIESGO (US-006 / US-005)
    # =========================================================================

    def test_haversine_y_deteccion_poligono_zbe(self):
        """Verifica el cálculo de distancias Haversine y pertenencia a la ZBE Centro Histórico."""
        # Distancia entre Centro de Distribución y Plaza Mayor de Lima
        dist = haversine_km(-12.0450, -77.0600, -12.0453, -77.0311)
        assert 2.5 <= dist <= 4.0

        # Punto dentro de ZBE Centro Histórico (Plaza Mayor)
        punto_zbe = (-12.0453, -77.0311)
        assert RoutingService.is_in_zbe(punto_zbe[0], punto_zbe[1]) is True

        # Punto fuera de ZBE (San Isidro)
        punto_fuera = (-12.0950, -77.0350)
        assert RoutingService.is_in_zbe(punto_fuera[0], punto_fuera[1]) is False

    def test_deteccion_zonas_riesgo_lima(self, client: TestClient):
        """US-006: Endpoint de catálogo de zonas de riesgo y detección de punto en Callao Puerto."""
        response = client.get("/api/v1/rutas/zonas-riesgo")
        assert response.status_code == 200
        data = response.json()
        assert len(data) >= 4

        nombres_zonas = [z["nombre"] for z in data]
        assert any("Callao" in n for n in nombres_zonas)
        assert any("Barrios Altos" in n for n in nombres_zonas)

        # Verificar detección de punto dentro de zona portuaria del Callao
        en_riesgo, nombre = RoutingService.check_zona_riesgo(-12.0550, -77.1500)
        assert en_riesgo is True
        assert "Callao" in nombre

    # =========================================================================
    # PRUEBAS US-005: OPTIMIZACIÓN CVRPTW Y CODECARBON
    # =========================================================================

    def test_us005_optimizacion_cvrptw_con_codecarbon(self, client: TestClient, db_session):
        """
        US-005 Escenario 1: Generación de ruta optimizada con registro de
        emisiones computacionales generadas por Python mediante CodeCarbon.
        """
        p1 = crear_pedido_helper(
            codigo="PED-ECO-001",
            cliente="Farmacia San Martín · Cercado",
            direccion="Av. Colonial 1250, Lima",
            lat=-12.051000,
            lng=-77.049000,
            peso=30.0,
            vol=0.15,
            v_inicio=time(9, 0),
            v_fin=time(13, 0),
            prioridad="ALTA"
        )
        p2 = crear_pedido_helper(
            codigo="PED-ECO-002",
            cliente="Supermercado Metro · Breña",
            direccion="Av. Venezuela 800, Breña",
            lat=-12.059000,
            lng=-77.054000,
            peso=45.0,
            vol=0.25,
            v_inicio=time(10, 0),
            v_fin=time(15, 0),
            prioridad="ESTANDAR"
        )
        db_session.add_all([p1, p2])
        db_session.commit()

        payload = {
            "fecha_operacion": str(date.today()),
            "vehiculo_id": str(self.vehiculo_electrico.vehiculo_id),
            "conductor_id": str(self.conductor.conductor_id),
            "factor_capacidad_max": 0.90
        }

        response = client.post("/api/v1/rutas/optimizar", json=payload)
        assert response.status_code == 200
        data = response.json()

        # Validaciones de resultado de optimización
        assert data["pedidos_asignados_count"] == 2
        assert data["pedidos_no_asignados_count"] == 0
        assert len(data["rutas"]) == 1

        ruta_creada = data["rutas"][0]
        assert ruta_creada["vehiculo_placa"] == "ECO-001"
        assert ruta_creada["distancia_total_km"] > 0
        assert ruta_creada["tiempo_total_min"] > 0

        # Verificación de métricas computacionales registradas por CodeCarbon
        assert "co2_computacional_total_kg" in data
        assert "energia_computacional_total_kwh" in data
        assert "tiempo_computo_total_seg" in data
        assert data["tiempo_computo_total_seg"] >= 0.0

        # Verificación de la secuencia de paradas (US-006): Salida -> Entregas -> Retorno
        tramos = ruta_creada["tramos"]
        assert len(tramos) >= 4  # Salida + 2 Entregas + Retorno
        assert tramos[0]["tipo_parada"] == "DEPOSITO_SALIDA"
        assert tramos[1]["tipo_parada"] == "ENTREGA"
        assert tramos[2]["tipo_parada"] == "ENTREGA"
        assert tramos[-1]["tipo_parada"] == "DEPOSITO_RETORNO"

    def test_us005_exceso_capacidad_marca_estado_exacto(self, client: TestClient, db_session):
        """
        US-005 Escenario 2 / Regla RN-001 (Ruta Infeliz):
        Si la demanda excede la capacidad del vehículo (85%-90%), los pedidos no asignados
        deben ser marcados con el estado exacto: 'No Asignados por Exceso de Capacidad'.
        """
        # Vehículo Eléctrico tiene 800 kg. Capacidad al 90% = 720 kg.
        # Creamos 1 pedido de 600 kg y otro de 200 kg (la suma 800 kg excede el límite de 720 kg).
        p_cabe = crear_pedido_helper(
            codigo="PED-GRANDE-001",
            cliente="Almacén Logístico Norte",
            direccion="Av. Universitaria 3400, SMP",
            lat=-12.012000,
            lng=-77.065000,
            peso=600.0,
            vol=1.0,
            v_inicio=time(8, 0),
            v_fin=time(14, 0),
            prioridad="URGENTE"
        )
        p_excede = crear_pedido_helper(
            codigo="PED-SOBRANTE-002",
            cliente="Bodega Don Pepe",
            direccion="Av. Perú 1800, SMP",
            lat=-12.030000,
            lng=-77.070000,
            peso=200.0,
            vol=1.5,
            v_inicio=time(9, 0),
            v_fin=time(12, 0),
            prioridad="BAJA"
        )
        db_session.add_all([p_cabe, p_excede])
        db_session.commit()

        payload = {
            "fecha_operacion": str(date.today()),
            "vehiculo_id": str(self.vehiculo_electrico.vehiculo_id),
            "conductor_id": str(self.conductor.conductor_id),
            "factor_capacidad_max": 0.90
        }

        response = client.post("/api/v1/rutas/optimizar", json=payload)
        assert response.status_code == 200
        data = response.json()

        assert data["pedidos_asignados_count"] == 1
        assert data["pedidos_no_asignados_count"] == 1

        no_asig = data["pedidos_no_asignados"]
        assert len(no_asig) == 1
        assert no_asig[0]["codigo_seguimiento"] in ("PED-SOBRANTE-002", "PED-GRANDE-001")
        # Criterio BDD exacto: "No Asignados por Exceso de Capacidad"
        assert no_asig[0]["motivo"] == "No Asignados por Exceso de Capacidad"

        # Verificar en base de datos que el estado del pedido excedente se actualizó
        db_session.expire_all()
        id_excedente = UUID(no_asig[0]["pedido_id"])
        p_db = db_session.query(Pedido).filter(Pedido.pedido_id == id_excedente).first()
        assert p_db.estado == "No Asignados por Exceso de Capacidad"
        assert p_db.ruta_id is None

    def test_us005_restriccion_zbe_para_vehiculo_diesel(self, client: TestClient, db_session):
        """
        US-005 Escenario 3 / Ordenanza MML N° 2160:
        Un vehículo con motor DIESEL tiene prohibido el ingreso a pedidos dentro de la ZBE Centro Histórico.
        """
        # Pedido dentro de ZBE Centro Histórico (Plaza San Martín)
        p_zbe = crear_pedido_helper(
            codigo="PED-ZBE-001",
            cliente="Librería Centro Histórico",
            direccion="Jr. de la Unión 850, Cercado",
            lat=-12.051000,
            lng=-77.034000,
            peso=50.0,
            vol=0.3,
            v_inicio=time(8, 0),
            v_fin=time(13, 0),
            prioridad="ALTA"
        )
        db_session.add(p_zbe)
        db_session.commit()

        # Intentar optimizar exclusivamente con vehículo DIESEL
        payload = {
            "fecha_operacion": str(date.today()),
            "vehiculo_id": str(self.vehiculo_diesel.vehiculo_id),
            "conductor_id": str(self.conductor.conductor_id)
        }

        response = client.post("/api/v1/rutas/optimizar", json=payload)
        assert response.status_code == 200
        data = response.json()

        # El pedido en ZBE no debe ser asignado al camión diésel
        assert data["pedidos_asignados_count"] == 0
        assert data["pedidos_no_asignados_count"] == 1
        assert data["pedidos_no_asignados"][0]["codigo_seguimiento"] == "PED-ZBE-001"

    def test_us005_insercion_descanso_tecnico_fatiga_ley_30224(self, db_session):
        """
        US-005 Escenario 4 / Regla RN-004 (Ley N° 30224):
        Si la simulación arroja >= 4.5 horas continuas de conducción (>= 270 min),
        el motor debe insertar automáticamente una parada técnica obligatoria de 30 minutos de descanso.
        """
        # Distancias largas que superan los 120 km y 270 minutos de conducción continua:
        # Ancón (-11.750, -77.150) y Pucusana (-12.480, -76.780)
        p1 = crear_pedido_helper(
            codigo="PED-NORTE-EXTREMO",
            cliente="Cliente Ancón Norte",
            direccion="Playa Hermosa, Ancón",
            lat=-11.7500,
            lng=-77.1500,
            peso=15.0,
            vol=0.1,
            v_inicio=time(8, 0),
            v_fin=time(18, 0),
            prioridad="URGENTE"
        )
        p2 = crear_pedido_helper(
            codigo="PED-SUR-EXTREMO",
            cliente="Cliente Pucusana Sur",
            direccion="Caleta Pucusana, Km 58 Panamericana Sur",
            lat=-12.4800,
            lng=-76.7800,
            peso=15.0,
            vol=0.1,
            v_inicio=time(8, 0),
            v_fin=time(18, 0),
            prioridad="URGENTE"
        )
        db_session.add_all([p1, p2])
        db_session.commit()

        req = RutaOptimizarRequest(
            fecha_operacion=date.today(),
            vehiculo_id=self.vehiculo_electrico.vehiculo_id,
            conductor_id=self.conductor.conductor_id,
            factor_capacidad_max=0.90
        )
        res = RoutingService.optimizar_rutas(db=db_session, request=req)

        # Buscar si en los tramos se insertó la parada DESCANSO_TECNICO_30MIN
        tramos = res.rutas[0].tramos
        descansos = [t for t in tramos if t.tipo_parada == "DESCANSO_TECNICO_30MIN"]

        assert len(descansos) >= 1
        assert descansos[0].tiempo_estimado_min == 30.0
        assert "Ley N° 30224" in descansos[0].descripcion

    # =========================================================================
    # PRUEBAS US-006 Y US-007: CONSULTA Y REOPTIMIZACIÓN DINÁMICA
    # =========================================================================

    def test_us006_consulta_detalle_ruta(self, client: TestClient, db_session):
        """US-006: Visualización de ruta por ID con secuencia completa y datos del conductor/vehículo."""
        p = crear_pedido_helper(
            codigo="PED-VIEW-001",
            cliente="Tienda Callao Centro",
            direccion="Av. Sáenz Peña 450, Callao",
            lat=-12.058000,
            lng=-77.135000,
            peso=25.0,
            vol=0.2,
            v_inicio=time(9, 0),
            v_fin=time(12, 0),
            prioridad="ALTA"
        )
        db_session.add(p)
        db_session.commit()

        res_opt = client.post("/api/v1/rutas/optimizar", json={
            "fecha_operacion": str(date.today()),
            "vehiculo_id": str(self.vehiculo_electrico.vehiculo_id),
            "conductor_id": str(self.conductor.conductor_id)
        })
        assert res_opt.status_code == 200
        ruta_id = res_opt.json()["rutas"][0]["ruta_id"]

        # Consultar detalle
        res_det = client.get(f"/api/v1/rutas/{ruta_id}")
        assert res_det.status_code == 200
        detalle = res_det.json()
        assert detalle["ruta_id"] == ruta_id
        assert detalle["conductor_nombre"] == "Carlos Eduardo Quispe Huamán"
        assert detalle["vehiculo_placa"] == "ECO-001"
        assert len(detalle["tramos"]) >= 3

    def test_us007_reoptimizacion_dinamica_ante_cancelacion(self, client: TestClient, db_session):
        """
        US-007: Reoptimización dinámica de ruta ante evento imprevisto
        (cancelación de un pedido por parte del cliente).
        """
        p1 = crear_pedido_helper(
            codigo="PED-REOPT-01",
            cliente="Cliente A",
            direccion="Av. Lima 100",
            lat=-12.0500,
            lng=-77.0500,
            peso=30.0,
            vol=0.2,
            v_inicio=time(8, 0),
            v_fin=time(12, 0),
            prioridad="ALTA"
        )
        p2 = crear_pedido_helper(
            codigo="PED-REOPT-02",
            cliente="Cliente B (Cancelará)",
            direccion="Av. Arequipa 500",
            lat=-12.0680,
            lng=-77.0370,
            peso=40.0,
            vol=0.3,
            v_inicio=time(9, 0),
            v_fin=time(14, 0),
            prioridad="ESTANDAR"
        )
        db_session.add_all([p1, p2])
        db_session.commit()

        # Generar ruta inicial
        res_init = client.post("/api/v1/rutas/optimizar", json={
            "fecha_operacion": str(date.today()),
            "vehiculo_id": str(self.vehiculo_electrico.vehiculo_id),
            "conductor_id": str(self.conductor.conductor_id)
        })
        ruta_id = res_init.json()["rutas"][0]["ruta_id"]
        distancia_inicial = res_init.json()["rutas"][0]["distancia_total_km"]

        # Cancelar el pedido 2 y reoptimizar dinámicamente
        reopt_payload = {
            "pedido_cancelado_id": str(p2.pedido_id),
            "motivo_incidencia": "CANCELACION_CLIENTE_VENTANA_CERRADA",
            "evitar_zona_riesgo": False
        }

        res_reopt = client.post(f"/api/v1/rutas/{ruta_id}/reoptimizar", json=reopt_payload)
        assert res_reopt.status_code == 200
        data_reopt = res_reopt.json()

        assert data_reopt["ruta_id"] == ruta_id
        assert "reoptimizada exitosamente" in data_reopt["mensaje"]
        # La distancia debió reducirse al omitir el segundo punto
        assert data_reopt["distancia_total_km"] < distancia_inicial

        # Verificar que el pedido cancelado fue liberado de la ruta en la base de datos
        db_session.expire_all()
        p2_db = db_session.query(Pedido).filter(Pedido.pedido_id == p2.pedido_id).first()
        assert p2_db.estado == "CANCELADO"
        assert p2_db.ruta_id is None
