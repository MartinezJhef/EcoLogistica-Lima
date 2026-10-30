from pydantic import BaseModel, Field
from typing import List, Optional
from uuid import UUID
from datetime import date, datetime, time

class TramoResponse(BaseModel):
    tramo_id: UUID
    ruta_id: UUID
    orden_secuencia: int
    tipo_parada: str
    pedido_id: Optional[UUID] = None
    descripcion: Optional[str] = None
    latitud: float
    longitud: float
    distancia_tramo_km: float
    tiempo_estimado_min: float
    co2_tramo_kg: float
    alerta_zona_riesgo: bool = False
    nombre_zona_riesgo: Optional[str] = None
    geometria_linea_geojson: Optional[str] = None

    class Config:
        from_attributes = True

class PedidoNoAsignadoInfo(BaseModel):
    pedido_id: UUID
    codigo_seguimiento: str
    cliente_nombre: str
    peso_kg: float
    volumen_m3: float
    motivo: str

class RutaDetalleResponse(BaseModel):
    ruta_id: UUID
    deposito_origen_id: Optional[UUID] = None
    conductor_id: UUID
    conductor_nombre: Optional[str] = None
    vehiculo_id: UUID
    vehiculo_placa: Optional[str] = None
    vehiculo_tipo_combustible: Optional[str] = None
    fecha_operacion: date
    distancia_total_km: float
    tiempo_total_min: int
    co2_total_kg: float
    co2_computacional_kg: float = 0.0
    energia_computacional_kwh: float = 0.0
    tiempo_computo_seg: float = 0.0
    estado: str
    creada_en: datetime
    tramos: List[TramoResponse] = []
    pedidos_asignados_count: int = 0

    class Config:
        from_attributes = True

class RutaOptimizarRequest(BaseModel):
    fecha_operacion: Optional[date] = None
    vehiculo_id: Optional[UUID] = None
    conductor_id: Optional[UUID] = None
    pedidos_ids: Optional[List[UUID]] = None
    factor_capacidad_max: float = Field(0.90, ge=0.5, le=1.0, description="Regla RN-001: 85%-90% de capacidad vehicular")

class RutaOptimizarResponse(BaseModel):
    rutas: List[RutaDetalleResponse]
    pedidos_asignados_count: int
    pedidos_no_asignados_count: int
    pedidos_no_asignados: List[PedidoNoAsignadoInfo]
    mensaje: str
    co2_computacional_total_kg: float
    energia_computacional_total_kwh: float
    tiempo_computo_total_seg: float

class ZonaRiesgoResponse(BaseModel):
    zona_id: UUID
    nombre: str
    motivo: str
    nivel_peligro: str
    poligono_coordenadas: List[List[float]]
    activa: bool = True

class ReoptimizarRutaRequest(BaseModel):
    pedido_cancelado_id: Optional[UUID] = None
    nuevo_pedido_urgente_id: Optional[UUID] = None
    motivo_incidencia: str = Field("RECALCULO_DINAMICO", description="Motivo del recalculo en tiempo real")
    evitar_zona_riesgo: bool = False

class ReoptimizarRutaResponse(BaseModel):
    ruta_id: UUID
    mensaje: str
    distancia_total_km: float
    tiempo_total_min: int
    co2_total_kg: float
    co2_computacional_kg: float
    tramos: List[TramoResponse]

