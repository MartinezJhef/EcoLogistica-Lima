from pydantic import BaseModel, Field, model_validator
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
    estado_pedido: Optional[str] = None

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
    hora_salida: time = time(8, 0)
    medicion_computacional_disponible: bool = False
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
    incidencias: List[dict] = Field(default_factory=list)

    class Config:
        from_attributes = True

class RutaOptimizarRequest(BaseModel):
    fecha_operacion: Optional[date] = None
    vehiculo_id: Optional[UUID] = None
    conductor_id: Optional[UUID] = None
    pedidos_ids: Optional[List[UUID]] = None
    factor_capacidad_max: float = Field(0.90, ge=0.85, le=0.90, description="Regla RN-001: 85%-90% de capacidad vehicular")
    hora_salida: time = time(8, 0)
    peso_distancia: float = Field(1, ge=0, le=10)
    peso_tiempo: float = Field(1, ge=0, le=10)
    peso_co2: float = Field(1, ge=0, le=10)

    @model_validator(mode="after")
    def nonzero_objective(self):
        if self.peso_distancia + self.peso_tiempo + self.peso_co2 == 0:
            raise ValueError("Seleccione al menos un objetivo de optimización")
        return self

class RutaOptimizarResponse(BaseModel):
    medicion_computacional_disponible: bool = False
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

class IncidenciaVial(BaseModel):
    descripcion: str = Field(min_length=3, max_length=200)
    poligono: List[List[float]] = Field(min_length=4, max_length=100)
    cierre: bool = True
    demora_minutos: float = Field(0, ge=0, le=240)

    @model_validator(mode="after")
    def valid_polygon(self):
        from shapely.geometry import Polygon
        if any(len(p) != 2 or not -180 <= p[0] <= 180 or not -90 <= p[1] <= 90 for p in self.poligono):
            raise ValueError("Use coordenadas [longitud, latitud] válidas")
        shape = Polygon(self.poligono)
        if not shape.is_valid or shape.area == 0:
            raise ValueError("El área de incidencia no es válida")
        return self


class ReoptimizarRutaRequest(BaseModel):
    vehiculo_averiado: bool = False
    carga_en_deposito: bool = False
    resolver_incidencias_previas: bool = False
    pedido_cancelado_id: Optional[UUID] = None
    nuevo_pedido_urgente_id: Optional[UUID] = None
    motivo_incidencia: str = Field("RECALCULO_DINAMICO", description="Motivo del recalculo en tiempo real")
    evitar_zona_riesgo: bool = False
    incidencias: List[IncidenciaVial] = Field(default_factory=list, max_length=10)
    hora_salida: Optional[time] = None
    latitud_actual: Optional[float] = Field(None, ge=-90, le=90)
    longitud_actual: Optional[float] = Field(None, ge=-180, le=180)
    minutos_transcurridos: float = Field(0, ge=0, le=480)
    conduccion_continua_min: float = Field(0, ge=0, le=270)

    @model_validator(mode="after")
    def current_position(self):
        if (self.latitud_actual is None) != (self.longitud_actual is None):
            raise ValueError("Indique ambas coordenadas de la posición actual")
        return self

class ReoptimizarRutaResponse(BaseModel):
    estado: str = 'PLANIFICADA'
    incidencias: List[dict] = Field(default_factory=list)
    rutas_reasignadas: List[RutaDetalleResponse] = Field(default_factory=list)
    pedidos_pendientes: List[PedidoNoAsignadoInfo] = Field(default_factory=list)
    medicion_computacional_disponible: bool = False
    ruta_id: UUID
    mensaje: str
    distancia_total_km: float
    tiempo_total_min: int
    co2_total_kg: float
    co2_computacional_kg: float
    tramos: List[TramoResponse]

