import math
import time
import uuid
import logging
from datetime import date, datetime
from typing import List, Optional, Tuple, Dict, Any
from uuid import UUID

from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from app.models.ruta import Ruta
from app.models.tramo import Tramo
from app.models.zona_restringida import ZonaRestringida
from app.models.deposito import Deposito
from app.models.vehiculo import Vehiculo
from app.models.conductor import Conductor
from app.models.pedido import Pedido
from app.schemas.ruta import (
    RutaOptimizarRequest,
    RutaOptimizarResponse,
    RutaDetalleResponse,
    TramoResponse,
    ZonaRiesgoResponse,
    PedidoNoAsignadoInfo,
    ReoptimizarRutaRequest,
    ReoptimizarRutaResponse
)

logger = logging.getLogger("routing_service")

# Coordenadas por defecto del Centro de Distribución Principal (Lima / Callao)
DEPOSITO_DEFAULT_LAT = -12.045000
DEPOSITO_DEFAULT_LNG = -77.060000

# ZBE Centro Histórico de Lima (Ordenanza MML N° 2160)
# Polígono aproximado del Damero de Pizarro / Centro Histórico
ZBE_CENTRO_HISTORICO = [
    [-77.0380, -12.0420],
    [-77.0260, -12.0420],
    [-77.0260, -12.0540],
    [-77.0380, -12.0540],
    [-77.0380, -12.0420]
]

# Polígonos de Seguridad Urbana y Zonas de Riesgo en Lima (US-006)
CATALOGO_ZONAS_RIESGO = [
    {
        "nombre": "Callao - Zona Puerto y Acceso Gambetta",
        "motivo": "Congestión pesada portuaria y resguardo de mercadería",
        "nivel_peligro": "ALTO",
        "poligono": [
            [-77.1650, -12.0450],
            [-77.1350, -12.0450],
            [-77.1350, -12.0720],
            [-77.1650, -12.0720],
            [-77.1650, -12.0450]
        ]
    },
    {
        "nombre": "Barrios Altos - Cercado Este",
        "motivo": "Vías estrechas, congestión y seguridad urbana",
        "nivel_peligro": "ALTO",
        "poligono": [
            [-77.0250, -12.0440],
            [-77.0080, -12.0440],
            [-77.0080, -12.0580],
            [-77.0250, -12.0580],
            [-77.0250, -12.0440]
        ]
    },
    {
        "nombre": "La Victoria - Cuadrante Gamarra y San Cosme",
        "motivo": "Densidad peatonal extrema y tránsito lento comercial",
        "nivel_peligro": "MEDIO",
        "poligono": [
            [-77.0220, -12.0620],
            [-77.0020, -12.0620],
            [-77.0020, -12.0780],
            [-77.0220, -12.0780],
            [-77.0220, -12.0620]
        ]
    },
    {
        "nombre": "San Juan de Lurigancho - Sector Huáscar",
        "motivo": "Topografía con pendientes pronunciadas y vías angostas",
        "nivel_peligro": "MEDIO",
        "poligono": [
            [-77.0100, -11.9700],
            [-76.9800, -11.9700],
            [-76.9800, -11.9950],
            [-77.0100, -11.9950],
            [-77.0100, -11.9700]
        ]
    },
    {
        "nombre": "Zona de Bajas Emisiones (ZBE) Centro Histórico",
        "motivo": "Restricción de unidades diésel - Ordenanza MML N° 2160",
        "nivel_peligro": "ZBE_AMBIENTAL",
        "poligono": ZBE_CENTRO_HISTORICO
    }
]

def haversine_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Calcula la distancia geodésica ortodrómica en kilómetros."""
    R = 6371.0
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    delta_phi = math.radians(lat2 - lat1)
    delta_lambda = math.radians(lon2 - lon1)

    a = math.sin(delta_phi / 2.0) ** 2 + \
        math.cos(phi1) * math.cos(phi2) * math.sin(delta_lambda / 2.0) ** 2
    c = 2.0 * math.atan2(math.sqrt(a), math.sqrt(1.0 - a))
    return round(R * c, 2)

def point_in_polygon(lat: float, lng: float, polygon: List[List[float]]) -> bool:
    """Algoritmo Ray-Casting para determinar si (lat, lng) está dentro de un polígono [ [lng, lat], ... ]."""
    inside = False
    n = len(polygon)
    p1x, p1y = polygon[0][0], polygon[0][1]
    for i in range(n + 1):
        p2x, p2y = polygon[i % n][0], polygon[i % n][1]
        if lat > min(p1y, p2y):
            if lat <= max(p1y, p2y):
                if lng <= max(p1x, p2x):
                    if p1y != p2y:
                        xinters = (lat - p1y) * (p2x - p1x) / (p2y - p1y) + p1x
                    if p1x == p2x or lng <= xinters:
                        inside = not inside
        p1x, p1y = p2x, p2y
    return inside

class RoutingService:
    """
    Motor Algorítmico Heurístico de Optimización de Rutas Verdes (CVRPTW),
    Evaluación Geoespacial y Medición Computacional con CodeCarbon.
    (US-005, US-006, US-007, RF-003, RF-004, RF-007, RN-001, RN-004).
    """

    @classmethod
    def get_zonas_riesgo(cls, db: Optional[Session] = None) -> List[ZonaRiesgoResponse]:
        """Obtiene el catálogo de zonas de riesgo y polígonos geoespaciales de Lima."""
        zonas = []
        for z in CATALOGO_ZONAS_RIESGO:
            zonas.append(ZonaRiesgoResponse(
                zona_id=uuid.uuid5(uuid.NAMESPACE_DNS, z["nombre"]),
                nombre=z["nombre"],
                motivo=z["motivo"],
                nivel_peligro=z["nivel_peligro"],
                poligono_coordenadas=z["poligono"],
                activa=True
            ))
        return zonas

    @classmethod
    def check_zona_riesgo(cls, lat: float, lng: float) -> Tuple[bool, Optional[str]]:
        """Determina si un punto geográfico cae dentro de una zona de riesgo urbana."""
        for z in CATALOGO_ZONAS_RIESGO:
            if z["nivel_peligro"] != "ZBE_AMBIENTAL" and point_in_polygon(lat, lng, z["poligono"]):
                return True, z["nombre"]
        return False, None

    @classmethod
    def is_in_zbe(cls, lat: float, lng: float) -> bool:
        """Determina si un punto geográfico se ubica en la ZBE Centro Histórico de Lima."""
        return point_in_polygon(lat, lng, ZBE_CENTRO_HISTORICO)

    @classmethod
    def _extract_coords(cls, pedido: Pedido) -> Tuple[float, float]:
        """Extrae de forma tolerante (PostGIS, WKT, o atributos directos) latitud y longitud."""
        if hasattr(pedido, "ubicacion_destino") and pedido.ubicacion_destino is not None:
            try:
                from geoalchemy2.shape import to_shape
                punto = to_shape(pedido.ubicacion_destino)
                return float(punto.y), float(punto.x)
            except Exception:
                pass
            try:
                import re
                val = str(pedido.ubicacion_destino)
                match = re.search(r"POINT\s*\(\s*([-\d.]+)\s+([-\d.]+)\s*\)", val)
                if match:
                    lng_str, lat_str = match.groups()
                    return float(lat_str), float(lng_str)
            except Exception:
                pass
        lat = getattr(pedido, "latitud", None)
        lng = getattr(pedido, "longitud", None)
        if lat is not None and lng is not None:
            return float(lat), float(lng)
        return DEPOSITO_DEFAULT_LAT, DEPOSITO_DEFAULT_LNG

    @classmethod
    def optimizar_rutas(
        cls,
        db: Session,
        request: RutaOptimizarRequest
    ) -> RutaOptimizarResponse:
        """
        Genera rutas optimizadas CVRPTW midiendo las emisiones computacionales de Python
        mediante la librería CodeCarbon.
        """
        # Inicializar medición con CodeCarbon
        computational_co2_kg = 0.0
        computational_energy_kwh = 0.0
        start_clock = time.perf_counter()

        tracker = None
        try:
            from codecarbon import OfflineEmissionsTracker
            tracker = OfflineEmissionsTracker(
                country_iso_code="PER",
                save_to_file=False,
                log_level="error"
            )
            tracker.start()
        except Exception as e:
            logger.warning(f"No se pudo iniciar el tracker de CodeCarbon: {e}")

        try:
            # 1. Recuperar flota vehicular disponible
            vehiculos_query = db.query(Vehiculo).filter(Vehiculo.estado == "DISPONIBLE")
            if request.vehiculo_id:
                vehiculos_query = vehiculos_query.filter(Vehiculo.vehiculo_id == request.vehiculo_id)
            vehiculos_disponibles = vehiculos_query.all()

            if not vehiculos_disponibles:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="No se encontraron vehículos disponibles para optimización de rutas."
                )

            # 2. Recuperar conductores disponibles
            conductores_query = db.query(Conductor).filter(Conductor.estado == "DISPONIBLE")
            if request.conductor_id:
                conductores_query = conductores_query.filter(Conductor.conductor_id == request.conductor_id)
            conductores_disponibles = [
                c for c in conductores_query.all()
                if float(c.horas_conduccion_hoy or 0.0) < 8.0
            ]

            if not conductores_disponibles:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="No existen conductores disponibles con jornada hábil (< 8 horas, Ley N° 30224)."
                )

            # 3. Recuperar depósito base
            deposito = db.query(Deposito).filter(Deposito.estado == "OPERATIVO").first()
            dep_lat = float(deposito.latitud) if deposito and deposito.latitud else DEPOSITO_DEFAULT_LAT
            dep_lng = float(deposito.longitud) if deposito and deposito.longitud else DEPOSITO_DEFAULT_LNG

            # 4. Recuperar pedidos pendientes
            pedidos_query = db.query(Pedido).filter(Pedido.estado == "PENDIENTE")
            if request.pedidos_ids:
                pedidos_query = pedidos_query.filter(Pedido.pedido_id.in_(request.pedidos_ids))
            pedidos_candidatos = pedidos_query.all()

            if not pedidos_candidatos:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="No hay pedidos con estado PENDIENTE para planificar rutas."
                )

            # Ordenar pedidos por prioridad y ventana horaria
            prioridades_peso = {"URGENTE": 4, "ALTA": 3, "ESTANDAR": 2, "BAJA": 1}
            pedidos_ordenados = sorted(
                pedidos_candidatos,
                key=lambda p: (
                    -prioridades_peso.get(str(p.prioridad).upper(), 2),
                    p.ventana_inicio if p.ventana_inicio else datetime.min.time()
                )
            )

            rutas_creadas: List[RutaDetalleResponse] = []
            pedidos_no_asignados_info: List[PedidoNoAsignadoInfo] = []
            pedidos_pendientes_asignacion = list(pedidos_ordenados)

            fecha_op = request.fecha_operacion or date.today()

            # Iterar asignación por cada vehículo disponible
            for idx_vehiculo, vehiculo in enumerate(vehiculos_disponibles):
                if not pedidos_pendientes_asignacion:
                    break

                conductor = conductores_disponibles[idx_vehiculo % len(conductores_disponibles)]
                horas_restantes_conductor = 8.0 - float(conductor.horas_conduccion_hoy or 0.0)

                # Capacidad vehicular efectiva (Regla RN-001: 85% - 90%)
                cap_peso_max = float(vehiculo.capacidad_peso_kg) * request.factor_capacidad_max
                cap_vol_max = float(vehiculo.capacidad_volumen_m3) * request.factor_capacidad_max
                factor_emision = float(vehiculo.factor_emision_co2 or 0.27)
                es_diesel = str(vehiculo.tipo_combustible).strip().upper() == "DIESEL" or \
                            "DIESEL" in str(vehiculo.restriccion_circulacion).upper()

                peso_acumulado = 0.0
                volumen_acumulado = 0.0
                pedidos_en_esta_ruta: List[Tuple[Pedido, float, float]] = []
                pedidos_restantes_para_siguiente: List[Pedido] = []

                # Algoritmo Heurístico de Inserción
                curr_lat = dep_lat
                curr_lng = dep_lng

                while pedidos_pendientes_asignacion:
                    candidato = None
                    candidato_dist = float("inf")
                    candidato_lat = 0.0
                    candidato_lng = 0.0

                    for p in pedidos_pendientes_asignacion:
                        p_lat, p_lng = cls._extract_coords(p)

                        # Validación ZBE: si es DIESEL y el destino está en Centro Histórico, desviar
                        if es_diesel and cls.is_in_zbe(p_lat, p_lng):
                            continue

                        # Validación de capacidad vehicular
                        if (peso_acumulado + float(p.peso_kg) <= cap_peso_max) and \
                           (volumen_acumulado + float(p.volumen_m3) <= cap_vol_max):
                            dist = haversine_km(curr_lat, curr_lng, p_lat, p_lng)
                            if dist < candidato_dist:
                                candidato_dist = dist
                                candidato = p
                                candidato_lat = p_lat
                                candidato_lng = p_lng

                    if candidato:
                        pedidos_pendientes_asignacion.remove(candidato)
                        pedidos_en_esta_ruta.append((candidato, candidato_lat, candidato_lng))
                        peso_acumulado += float(candidato.peso_kg)
                        volumen_acumulado += float(candidato.volumen_m3)
                        curr_lat = candidato_lat
                        curr_lng = candidato_lng
                    else:
                        # Ningún pedido restante cabe en este vehículo
                        break

                if not pedidos_en_esta_ruta:
                    continue

                # Construir la entidad Ruta
                nueva_ruta = Ruta(
                    deposito_origen_id=deposito.deposito_id if deposito else None,
                    conductor_id=conductor.conductor_id,
                    vehiculo_id=vehiculo.vehiculo_id,
                    fecha_operacion=fecha_op,
                    distancia_total_km=0.0,
                    tiempo_total_min=0,
                    co2_total_kg=0.0,
                    estado="PLANIFICADA"
                )
                db.add(nueva_ruta)
                db.flush()

                # Construir los tramos secuenciales con descansos técnicos por fatiga (Ley N° 30224 / RN-004)
                orden_sec = 1
                distancia_acumulada = 0.0
                tiempo_acumulado_min = 0.0
                conduccion_continua_min = 0.0
                co2_acumulado_kg = 0.0

                pos_anterior_lat = dep_lat
                pos_anterior_lng = dep_lng

                # Parada 1: Salida del depósito
                tramo_salida = Tramo(
                    ruta_id=nueva_ruta.ruta_id,
                    orden_secuencia=orden_sec,
                    tipo_parada="DEPOSITO_SALIDA",
                    pedido_id=None,
                    descripcion="Salida desde Centro de Distribución Principal",
                    latitud=dep_lat,
                    longitud=dep_lng,
                    distancia_tramo_km=0.0,
                    tiempo_estimado_min=0.0,
                    co2_tramo_kg=0.0,
                    alerta_zona_riesgo=False,
                    nombre_zona_riesgo=None
                )
                db.add(tramo_salida)

                tramos_resp: List[TramoResponse] = []

                # Paradas de entrega
                for p, p_lat, p_lng in pedidos_en_esta_ruta:
                    orden_sec += 1
                    dist_tramo = haversine_km(pos_anterior_lat, pos_anterior_lng, p_lat, p_lng)
                    tiempo_conduccion_tramo = (dist_tramo / 24.0) * 60.0  # Velocidad urbana promedio Lima 24 km/h
                    tiempo_servicio = 12.0  # 12 min de descarga y atención al cliente
                    tiempo_tramo = round(tiempo_conduccion_tramo + tiempo_servicio, 2)
                    co2_tramo = round(dist_tramo * factor_emision, 2)

                    # Verificar si la conducción continua acumulada alcanza >= 4.5 horas (270 minutos)
                    conduccion_continua_min += tiempo_conduccion_tramo
                    if conduccion_continua_min >= 270.0:
                        # Insertar parada técnica obligatoria de 30 minutos de descanso
                        tramo_descanso = Tramo(
                            ruta_id=nueva_ruta.ruta_id,
                            orden_secuencia=orden_sec,
                            tipo_parada="DESCANSO_TECNICO_30MIN",
                            pedido_id=None,
                            descripcion="Descanso Técnico Obligatorio por Fatiga (Ley N° 30224 - 30 min)",
                            latitud=pos_anterior_lat,
                            longitud=pos_anterior_lng,
                            distancia_tramo_km=0.0,
                            tiempo_estimado_min=30.0,
                            co2_tramo_kg=0.0,
                            alerta_zona_riesgo=False,
                            nombre_zona_riesgo=None
                        )
                        db.add(tramo_descanso)
                        tiempo_acumulado_min += 30.0
                        conduccion_continua_min = 0.0  # Reiniciar contador de fatiga tras descanso
                        orden_sec += 1

                    # Evaluación de Zona de Riesgo Urbana (US-006)
                    en_riesgo, nombre_riesgo = cls.check_zona_riesgo(p_lat, p_lng)

                    tramo_entrega = Tramo(
                        ruta_id=nueva_ruta.ruta_id,
                        orden_secuencia=orden_sec,
                        tipo_parada="ENTREGA",
                        pedido_id=p.pedido_id,
                        descripcion=f"Entrega: {p.codigo_seguimiento} - {p.cliente_nombre}",
                        latitud=p_lat,
                        longitud=p_lng,
                        distancia_tramo_km=dist_tramo,
                        tiempo_estimado_min=tiempo_tramo,
                        co2_tramo_kg=co2_tramo,
                        alerta_zona_riesgo=en_riesgo,
                        nombre_zona_riesgo=nombre_riesgo
                    )
                    db.add(tramo_entrega)

                    # Actualizar estado del pedido asignado
                    p.estado = "ASIGNADO"
                    p.ruta_id = nueva_ruta.ruta_id
                    p.distancia_km = dist_tramo
                    p.tiempo_estimado_min = tiempo_tramo
                    p.emision_co2_kg = co2_tramo

                    distancia_acumulada += dist_tramo
                    tiempo_acumulado_min += tiempo_tramo
                    co2_acumulado_kg += co2_tramo
                    pos_anterior_lat = p_lat
                    pos_anterior_lng = p_lng

                # Parada final: Retorno al depósito base
                orden_sec += 1
                dist_retorno = haversine_km(pos_anterior_lat, pos_anterior_lng, dep_lat, dep_lng)
                tiempo_retorno = round((dist_retorno / 24.0) * 60.0, 2)
                co2_retorno = round(dist_retorno * factor_emision, 2)

                distancia_acumulada += dist_retorno
                tiempo_acumulado_min += tiempo_retorno
                co2_acumulado_kg += co2_retorno

                tramo_retorno = Tramo(
                    ruta_id=nueva_ruta.ruta_id,
                    orden_secuencia=orden_sec,
                    tipo_parada="DEPOSITO_RETORNO",
                    pedido_id=None,
                    descripcion="Retorno a Depósito Base Finalizado",
                    latitud=dep_lat,
                    longitud=dep_lng,
                    distancia_tramo_km=dist_retorno,
                    tiempo_estimado_min=tiempo_retorno,
                    co2_tramo_kg=co2_retorno,
                    alerta_zona_riesgo=False,
                    nombre_zona_riesgo=None
                )
                db.add(tramo_retorno)

                # Consolidar totales en la ruta
                nueva_ruta.distancia_total_km = round(distancia_acumulada, 2)
                nueva_ruta.tiempo_total_min = int(round(tiempo_acumulado_min))
                nueva_ruta.co2_total_kg = round(co2_acumulado_kg, 2)

                # Actualizar horas de conducción del conductor
                conductor.horas_conduccion_hoy = round(float(conductor.horas_conduccion_hoy or 0.0) + (tiempo_acumulado_min / 60.0), 2)

            # 5. Manejo estricto de Exceso de Capacidad (Regla RN-001 & BDD)
            # Marcar pedidos excedentes con el estado exacto: "No Asignados por Exceso de Capacidad"
            for p_excedente in pedidos_pendientes_asignacion:
                p_excedente.estado = "No Asignados por Exceso de Capacidad"
                p_excedente.ruta_id = None
                pedidos_no_asignados_info.append(PedidoNoAsignadoInfo(
                    pedido_id=p_excedente.pedido_id,
                    codigo_seguimiento=p_excedente.codigo_seguimiento,
                    cliente_nombre=p_excedente.cliente_nombre,
                    peso_kg=float(p_excedente.peso_kg),
                    volumen_m3=float(p_excedente.volumen_m3),
                    motivo="No Asignados por Exceso de Capacidad"
                ))

            db.commit()

        finally:
            # 6. Concluir medición de emisiones computacionales de Python con CodeCarbon
            if tracker:
                try:
                    computational_co2_kg = float(tracker.stop() or 0.0)
                    total_energy = getattr(tracker, "_total_energy", None)
                    if total_energy and hasattr(total_energy, "kWh"):
                        computational_energy_kwh = float(total_energy.kWh or 0.0)
                except Exception as e:
                    logger.warning(f"Error al detener tracker de CodeCarbon: {e}")

            compute_time_sec = round(time.perf_counter() - start_clock, 4)

        # Actualizar huella computacional en las rutas guardadas
        rutas_db = db.query(Ruta).filter(Ruta.fecha_operacion == fecha_op).all()
        rutas_count = max(len(rutas_db), 1)
        for r in rutas_db:
            r.co2_computacional_kg = round(computational_co2_kg / rutas_count, 8)
            r.energia_computacional_kwh = round(computational_energy_kwh / rutas_count, 8)
            r.tiempo_computo_seg = round(compute_time_sec / rutas_count, 4)
        db.commit()

        # Armar la respuesta estructurada
        for r in rutas_db:
            tramos_list = []
            for t in db.query(Tramo).filter(Tramo.ruta_id == r.ruta_id).order_by(Tramo.orden_secuencia).all():
                tramos_list.append(TramoResponse(
                    tramo_id=t.tramo_id,
                    ruta_id=t.ruta_id,
                    orden_secuencia=t.orden_secuencia,
                    tipo_parada=t.tipo_parada,
                    pedido_id=t.pedido_id,
                    descripcion=t.descripcion,
                    latitud=float(t.latitud or 0.0),
                    longitud=float(t.longitud or 0.0),
                    distancia_tramo_km=float(t.distancia_tramo_km or 0.0),
                    tiempo_estimado_min=float(t.tiempo_estimado_min or 0.0),
                    co2_tramo_kg=float(t.co2_tramo_kg or 0.0),
                    alerta_zona_riesgo=bool(t.alerta_zona_riesgo),
                    nombre_zona_riesgo=t.nombre_zona_riesgo
                ))

            cond_nombre = f"{r.conductor.nombres} {r.conductor.apellidos}" if r.conductor else "No Asignado"
            veh_placa = r.vehiculo.placa if r.vehiculo else "N/A"
            veh_comb = r.vehiculo.tipo_combustible if r.vehiculo else "N/A"

            pedidos_count = db.query(Pedido).filter(Pedido.ruta_id == r.ruta_id).count()

            rutas_creadas.append(RutaDetalleResponse(
                ruta_id=r.ruta_id,
                deposito_origen_id=r.deposito_origen_id,
                conductor_id=r.conductor_id,
                conductor_nombre=cond_nombre,
                vehiculo_id=r.vehiculo_id,
                vehiculo_placa=veh_placa,
                vehiculo_tipo_combustible=veh_comb,
                fecha_operacion=r.fecha_operacion,
                distancia_total_km=float(r.distancia_total_km),
                tiempo_total_min=int(r.tiempo_total_min),
                co2_total_kg=float(r.co2_total_kg),
                co2_computacional_kg=float(r.co2_computacional_kg or 0.0),
                energia_computacional_kwh=float(r.energia_computacional_kwh or 0.0),
                tiempo_computo_seg=float(r.tiempo_computo_seg or 0.0),
                estado=r.estado,
                creada_en=r.creada_en,
                tramos=tramos_list,
                pedidos_asignados_count=pedidos_count
            ))

        total_asignados = sum(r.pedidos_asignados_count for r in rutas_creadas)
        total_no_asignados = len(pedidos_no_asignados_info)

        return RutaOptimizarResponse(
            rutas=rutas_creadas,
            pedidos_asignados_count=total_asignados,
            pedidos_no_asignados_count=total_no_asignados,
            pedidos_no_asignados=pedidos_no_asignados_info,
            mensaje=f"Optimización finalizada con éxito. {total_asignados} pedidos asignados y {total_no_asignados} excedentes.",
            co2_computacional_total_kg=round(computational_co2_kg, 8),
            energia_computacional_total_kwh=round(computational_energy_kwh, 8),
            tiempo_computo_total_seg=compute_time_sec
        )

    @classmethod
    def reoptimizar_ruta(
        cls,
        db: Session,
        ruta_id: UUID,
        request: ReoptimizarRutaRequest
    ) -> ReoptimizarRutaResponse:
        """
        US-007: Reoptimización dinámica de ruta ante eventos de contingencia
        (cancelaciones, accidentes, pedidos urgentes o desvío de zonas de riesgo).
        Mide el impacto computacional del recálculo con CodeCarbon.
        """
        ruta = db.query(Ruta).filter(Ruta.ruta_id == ruta_id).first()
        if not ruta:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Ruta con ID {ruta_id} no encontrada."
            )

        # Iniciar CodeCarbon para el recálculo dinámico
        comp_co2 = 0.0
        tracker = None
        try:
            from codecarbon import OfflineEmissionsTracker
            tracker = OfflineEmissionsTracker(country_iso_code="PER", save_to_file=False, log_level="error")
            tracker.start()
        except Exception:
            pass

        try:
            factor_emision = float(ruta.vehiculo.factor_emision_co2 or 0.27) if ruta.vehiculo else 0.27

            # 1. Si hay un pedido cancelado, retirarlo de la ruta
            if request.pedido_cancelado_id:
                pedido_canc = db.query(Pedido).filter(Pedido.pedido_id == request.pedido_cancelado_id).first()
                if pedido_canc:
                    pedido_canc.estado = "CANCELADO"
                    pedido_canc.ruta_id = None
                # Eliminar el tramo asociado
                db.query(Tramo).filter(
                    Tramo.ruta_id == ruta_id,
                    Tramo.pedido_id == request.pedido_cancelado_id
                ).delete()

            # 2. Si hay un nuevo pedido urgente a integrar
            if request.nuevo_pedido_urgente_id:
                pedido_urg = db.query(Pedido).filter(Pedido.pedido_id == request.nuevo_pedido_urgente_id).first()
                if pedido_urg:
                    pedido_urg.estado = "ASIGNADO"
                    pedido_urg.ruta_id = ruta_id
                    u_lat, u_lng = cls._extract_coords(pedido_urg)
                    en_r, nom_r = cls.check_zona_riesgo(u_lat, u_lng)
                    nuevo_tramo = Tramo(
                        ruta_id=ruta_id,
                        orden_secuencia=999,  # Se reordenará abajo
                        tipo_parada="ENTREGA",
                        pedido_id=pedido_urg.pedido_id,
                        descripcion=f"Entrega Urgente: {pedido_urg.codigo_seguimiento}",
                        latitud=u_lat,
                        longitud=u_lng,
                        distancia_tramo_km=0.0,
                        tiempo_estimado_min=15.0,
                        co2_tramo_kg=0.0,
                        alerta_zona_riesgo=en_r,
                        nombre_zona_riesgo=nom_r
                    )
                    db.add(nuevo_tramo)

            db.flush()

            # 3. Reordenar y recalcular distancias y tiempos de la secuencia
            tramos_actuales = db.query(Tramo).filter(Tramo.ruta_id == ruta_id).all()
            # Separar inicio, entregas y retorno
            tramo_salida = next((t for t in tramos_actuales if t.tipo_parada == "DEPOSITO_SALIDA"), None)
            tramo_retorno = next((t for t in tramos_actuales if t.tipo_parada == "DEPOSITO_RETORNO"), None)
            tramos_entregas = [t for t in tramos_actuales if t.tipo_parada not in ("DEPOSITO_SALIDA", "DEPOSITO_RETORNO", "DESCANSO_TECNICO_30MIN")]

            if request.evitar_zona_riesgo:
                # Filtrar o priorizar tramos fuera de zonas de riesgo
                tramos_entregas.sort(key=lambda t: 1 if t.alerta_zona_riesgo else 0)

            # Re-secuenciar
            pos_lat = float(tramo_salida.latitud) if tramo_salida else DEPOSITO_DEFAULT_LAT
            pos_lng = float(tramo_salida.longitud) if tramo_salida else DEPOSITO_DEFAULT_LNG

            nueva_dist = 0.0
            nuevo_tiempo = 0.0
            nuevo_co2 = 0.0
            sec = 1

            if tramo_salida:
                tramo_salida.orden_secuencia = sec
                sec += 1

            for te in tramos_entregas:
                te.orden_secuencia = sec
                t_lat = float(te.latitud or 0.0)
                t_lng = float(te.longitud or 0.0)
                d = haversine_km(pos_lat, pos_lng, t_lat, t_lng)
                t = round((d / 24.0) * 60.0 + 12.0, 2)
                co2 = round(d * factor_emision, 2)

                te.distancia_tramo_km = d
                te.tiempo_estimado_min = t
                te.co2_tramo_kg = co2

                nueva_dist += d
                nuevo_tiempo += t
                nuevo_co2 += co2

                pos_lat = t_lat
                pos_lng = t_lng
                sec += 1

            if tramo_retorno:
                tramo_retorno.orden_secuencia = sec
                ret_lat = float(tramo_retorno.latitud or DEPOSITO_DEFAULT_LAT)
                ret_lng = float(tramo_retorno.longitud or DEPOSITO_DEFAULT_LNG)
                d_ret = haversine_km(pos_lat, pos_lng, ret_lat, ret_lng)
                t_ret = round((d_ret / 24.0) * 60.0, 2)
                co2_ret = round(d_ret * factor_emision, 2)

                tramo_retorno.distancia_tramo_km = d_ret
                tramo_retorno.tiempo_estimado_min = t_ret
                tramo_retorno.co2_tramo_kg = co2_ret

                nueva_dist += d_ret
                nuevo_tiempo += t_ret
                nuevo_co2 += co2_ret

            ruta.distancia_total_km = round(nueva_dist, 2)
            ruta.tiempo_total_min = int(round(nuevo_tiempo))
            ruta.co2_total_kg = round(nuevo_co2, 2)

            db.commit()

        finally:
            if tracker:
                try:
                    comp_co2 = float(tracker.stop() or 0.0)
                except Exception:
                    pass

        tramos_finales = db.query(Tramo).filter(Tramo.ruta_id == ruta_id).order_by(Tramo.orden_secuencia).all()
        tramos_resp = [
            TramoResponse(
                tramo_id=t.tramo_id,
                ruta_id=t.ruta_id,
                orden_secuencia=t.orden_secuencia,
                tipo_parada=t.tipo_parada,
                pedido_id=t.pedido_id,
                descripcion=t.descripcion,
                latitud=float(t.latitud or 0.0),
                longitud=float(t.longitud or 0.0),
                distancia_tramo_km=float(t.distancia_tramo_km or 0.0),
                tiempo_estimado_min=float(t.tiempo_estimado_min or 0.0),
                co2_tramo_kg=float(t.co2_tramo_kg or 0.0),
                alerta_zona_riesgo=bool(t.alerta_zona_riesgo),
                nombre_zona_riesgo=t.nombre_zona_riesgo
            ) for t in tramos_finales
        ]

        return ReoptimizarRutaResponse(
            ruta_id=ruta.ruta_id,
            mensaje=f"Ruta reoptimizada exitosamente ante evento: {request.motivo_incidencia}.",
            distancia_total_km=float(ruta.distancia_total_km),
            tiempo_total_min=int(ruta.tiempo_total_min),
            co2_total_kg=float(ruta.co2_total_kg),
            co2_computacional_kg=comp_co2,
            tramos=tramos_resp
        )

    @classmethod
    def get_ruta_by_id(cls, db: Session, ruta_id: UUID) -> RutaDetalleResponse:
        """Obtiene el detalle completo de una ruta con sus paradas y métricas."""
        r = db.query(Ruta).filter(Ruta.ruta_id == ruta_id).first()
        if not r:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Ruta con ID {ruta_id} no encontrada."
            )

        tramos_list = [
            TramoResponse(
                tramo_id=t.tramo_id,
                ruta_id=t.ruta_id,
                orden_secuencia=t.orden_secuencia,
                tipo_parada=t.tipo_parada,
                pedido_id=t.pedido_id,
                descripcion=t.descripcion,
                latitud=float(t.latitud or 0.0),
                longitud=float(t.longitud or 0.0),
                distancia_tramo_km=float(t.distancia_tramo_km or 0.0),
                tiempo_estimado_min=float(t.tiempo_estimado_min or 0.0),
                co2_tramo_kg=float(t.co2_tramo_kg or 0.0),
                alerta_zona_riesgo=bool(t.alerta_zona_riesgo),
                nombre_zona_riesgo=t.nombre_zona_riesgo
            )
            for t in db.query(Tramo).filter(Tramo.ruta_id == r.ruta_id).order_by(Tramo.orden_secuencia).all()
        ]

        cond_nombre = f"{r.conductor.nombres} {r.conductor.apellidos}" if r.conductor else "No Asignado"
        veh_placa = r.vehiculo.placa if r.vehiculo else "N/A"
        veh_comb = r.vehiculo.tipo_combustible if r.vehiculo else "N/A"
        pedidos_count = db.query(Pedido).filter(Pedido.ruta_id == r.ruta_id).count()

        return RutaDetalleResponse(
            ruta_id=r.ruta_id,
            deposito_origen_id=r.deposito_origen_id,
            conductor_id=r.conductor_id,
            conductor_nombre=cond_nombre,
            vehiculo_id=r.vehiculo_id,
            vehiculo_placa=veh_placa,
            vehiculo_tipo_combustible=veh_comb,
            fecha_operacion=r.fecha_operacion,
            distancia_total_km=float(r.distancia_total_km),
            tiempo_total_min=int(r.tiempo_total_min),
            co2_total_kg=float(r.co2_total_kg),
            co2_computacional_kg=float(r.co2_computacional_kg or 0.0),
            energia_computacional_kwh=float(r.energia_computacional_kwh or 0.0),
            tiempo_computo_seg=float(r.tiempo_computo_seg or 0.0),
            estado=r.estado,
            creada_en=r.creada_en,
            tramos=tramos_list,
            pedidos_asignados_count=pedidos_count
        )

    @classmethod
    def list_rutas(
        cls,
        db: Session,
        fecha: Optional[date] = None,
        estado: Optional[str] = None
    ) -> List[RutaDetalleResponse]:
        """Lista todas las rutas registradas con filtros opcionales."""
        query = db.query(Ruta)
        if fecha:
            query = query.filter(Ruta.fecha_operacion == fecha)
        if estado:
            query = query.filter(Ruta.estado == estado.upper())
        
        rutas_db = query.order_by(Ruta.fecha_operacion.desc(), Ruta.creada_en.desc()).all()
        result = []
        for r in rutas_db:
            result.append(cls.get_ruta_by_id(db, r.ruta_id))
        return result
