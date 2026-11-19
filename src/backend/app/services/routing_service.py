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
        raise HTTPException(422, f"El pedido {pedido.codigo_seguimiento} no tiene coordenadas válidas")

    @classmethod
    def optimizar_rutas(cls, db, request):
        from app.services.planning_service import optimize
        return optimize(db, request)

    @classmethod
    def reoptimizar_ruta(cls, db, ruta_id, request):
        from app.services.planning_service import reoptimize
        return reoptimize(db, ruta_id, request)

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
                nombre_zona_riesgo=t.nombre_zona_riesgo,
                geometria_linea_geojson=t.geometria_linea_geojson,
                estado_pedido=t.pedido.estado if t.pedido else None
            )
            for t in db.query(Tramo).filter(Tramo.ruta_id == r.ruta_id).order_by(Tramo.orden_secuencia).all()
        ]

        cond_nombre = f"{r.conductor.nombres} {r.conductor.apellidos}" if r.conductor else "No Asignado"
        veh_placa = r.vehiculo.placa if r.vehiculo else "N/A"
        veh_comb = r.vehiculo.tipo_combustible if r.vehiculo else "N/A"
        pedidos_count = db.query(Pedido).filter(Pedido.ruta_id == r.ruta_id).count()
        import json
        from app.models.route_update import RouteUpdate
        latest = db.query(RouteUpdate).filter(RouteUpdate.ruta_id == r.ruta_id).order_by(RouteUpdate.created_at.desc()).first()
        incidents = json.loads(latest.payload).get("incidencias", []) if latest else []

        return RutaDetalleResponse(
            ruta_id=r.ruta_id,
            deposito_origen_id=r.deposito_origen_id,
            conductor_id=r.conductor_id,
            conductor_nombre=cond_nombre,
            vehiculo_id=r.vehiculo_id,
            vehiculo_placa=veh_placa,
            vehiculo_tipo_combustible=veh_comb,
            fecha_operacion=r.fecha_operacion,
            hora_salida=r.hora_salida,
            distancia_total_km=float(r.distancia_total_km),
            tiempo_total_min=int(r.tiempo_total_min),
            co2_total_kg=float(r.co2_total_kg),
            co2_computacional_kg=float(r.co2_computacional_kg or 0.0),
            energia_computacional_kwh=float(r.energia_computacional_kwh or 0.0),
            tiempo_computo_seg=float(r.tiempo_computo_seg or 0.0),
            estado=r.estado,
            creada_en=r.creada_en,
            tramos=tramos_list,
            pedidos_asignados_count=pedidos_count,
            incidencias=incidents,
            medicion_computacional_disponible=bool(r.medicion_computacional_disponible)
        )

    @classmethod
    def count_rutas(
        cls,
        db: Session,
        fecha: Optional[date] = None,
        estado: Optional[str] = None,
        conductor_id: Optional[UUID] = None
    ) -> int:
        """Cuenta el total de rutas registradas para paginación Green IT."""
        query = db.query(Ruta)
        if conductor_id:
            query = query.filter(Ruta.conductor_id == conductor_id)
        if fecha:
            query = query.filter(Ruta.fecha_operacion == fecha)
        if estado:
            query = query.filter(Ruta.estado == estado.upper())
        return query.count()

    @classmethod
    def list_rutas(
        cls,
        db: Session,
        skip: int = 0,
        limit: int = 12,
        fecha: Optional[date] = None,
        estado: Optional[str] = None,
        conductor_id: Optional[UUID] = None
    ) -> List[RutaDetalleResponse]:
        """Lista las rutas registradas con paginación a 12 registros para Green IT."""
        query = db.query(Ruta)
        if conductor_id:
            query = query.filter(Ruta.conductor_id == conductor_id)
        if fecha:
            query = query.filter(Ruta.fecha_operacion == fecha)
        if estado:
            query = query.filter(Ruta.estado == estado.upper())
        
        rutas_db = (
            query.order_by(Ruta.fecha_operacion.desc(), Ruta.creada_en.desc())
            .offset(skip)
            .limit(limit)
            .all()
        )
        result = []
        for r in rutas_db:
            result.append(cls.get_ruta_by_id(db, r.ruta_id))
        return result

