from pydantic import BaseModel, Field, model_validator, field_validator, ConfigDict
from typing import Optional, Literal
from datetime import time, datetime
from uuid import UUID
import re

RESTRICCIONES_ACCESO = (
    'LIBRE_ACCESO',
    'ALTURA_MAXIMA_2_5M',
    'SOLO_VEHICULOS_LIGEROS',
    'NO_CAMIONES_PESADOS',
    'ZONA_PEATONAL'
)

ESTADOS_PEDIDO = (
    'PENDIENTE',
    'ASIGNADO',
    'EN_TRANSITO',
    'ENTREGADO',
    'NO_ENTREGADO',
    'CANCELADO'
)

PRIORIDADES_PEDIDO = (
    'BAJA',
    'ESTANDAR',
    'ALTA',
    'URGENTE'
)

class GeoPoint(BaseModel):
    """Punto geográfico WGS84 para geolocalización de entregas."""
    latitud: float = Field(..., ge=-18.0, le=-0.0, description="Latitud WGS84 (Área Perú)")
    longitud: float = Field(..., ge=-82.0, le=-68.0, description="Longitud WGS84 (Área Perú)")

class PedidoBase(BaseModel):
    """Esquema base de Pedido conforme a RF-002, RF-009, RN-002, RN-006, RN-007 y RN-010."""
    codigo_seguimiento: str = Field(..., min_length=3, max_length=30, description="Código único de seguimiento (ej. PED-LIMA-001)")
    cliente_nombre: str = Field(..., min_length=2, max_length=200, description="Razón social o nombre comercial del cliente")
    direccion_destino: str = Field(..., min_length=3, description="Dirección de entrega física")
    latitud: float = Field(..., ge=-12.5, le=-11.5, description="Latitud en Lima Metropolitana")
    longitud: float = Field(..., ge=-77.5, le=-76.5, description="Longitud en Lima Metropolitana")
    peso_kg: float = Field(..., gt=0, description="Peso de la carga en kilogramos (> 0)")
    volumen_m3: float = Field(..., gt=0, description="Volumen de la carga en metros cúbicos (> 0)")
    ventana_inicio: time = Field(..., description="Hora de inicio de ventana horaria")
    ventana_fin: time = Field(..., description="Hora de fin de ventana horaria")
    prioridad: Optional[str] = Field("ESTANDAR", description="Prioridad del pedido")

    # Campos de US-003 y US-004 (Preferencias y Restricciones del Cliente)
    referencia_ubicacion: Optional[str] = Field(None, max_length=500, description="Referencia manual o textual de ubicación")
    restriccion_acceso: Optional[str] = Field("LIBRE_ACCESO", description="Restricción vehicular de acceso al local")
    foto_referencia_url: Optional[str] = Field(None, description="URL o fotografía de referencia de fachada")
    telefono_contacto: Optional[str] = Field(None, max_length=20, description="Teléfono de contacto del cliente receptor")

    # Campos de sincronización móvil y POD
    precio_producto: Optional[float] = Field(0.0, ge=0, description="Precio del producto en Soles (S/.)")
    metodo_pago: Optional[str] = Field("PAGADO", description="PAGADO o CONTRAENTREGA")
    origen_direccion: Optional[str] = Field(None, description="Dirección de punto de recojo A")
    origen_lat: Optional[float] = Field(None, description="Latitud de recojo")
    origen_lng: Optional[float] = Field(None, description="Longitud de recojo")
    foto_entrega_url: Optional[str] = Field(None, description="Foto de prueba de entrega POD")
    distancia_km: Optional[float] = Field(None, description="Distancia estimada en km")
    tiempo_estimado_min: Optional[float] = Field(None, description="Tiempo estimado en minutos")
    consumo_combustible_gal: Optional[float] = Field(None, description="Galones de combustible")
    emision_co2_kg: Optional[float] = Field(None, description="Kg de CO2 emitidos/ahorrados")

    @field_validator("codigo_seguimiento")
    def validate_codigo(cls, v: str) -> str:
        clean = v.strip().upper()
        if not re.match(r"^[A-Z0-9\-_]{3,30}$", clean):
            raise ValueError("El código de seguimiento debe contener entre 3 y 30 caracteres alfanuméricos, guiones o guiones bajos.")
        return clean

    @field_validator("prioridad")
    def validate_prioridad(cls, v: Optional[str]) -> str:
        if not v:
            return "ESTANDAR"
        prio = v.strip().upper()
        if prio not in PRIORIDADES_PEDIDO:
            raise ValueError(f"Prioridad inválida. Permitidas: {', '.join(PRIORIDADES_PEDIDO)}")
        return prio

    @field_validator("restriccion_acceso")
    def validate_restriccion(cls, v: Optional[str]) -> str:
        if not v:
            return "LIBRE_ACCESO"
        restr = v.strip().upper()
        if restr not in RESTRICCIONES_ACCESO:
            raise ValueError(f"Restricción de acceso inválida. Permitidas: {', '.join(RESTRICCIONES_ACCESO)}")
        return restr

    @model_validator(mode="after")
    def check_dimensiones_y_ventanas(self):
        # Validación estricta según BDD Escenario 3 (Ruta Infeliz RF-002) y Regla RN-007
        if self.ventana_fin <= self.ventana_inicio or self.peso_kg <= 0 or self.volumen_m3 <= 0:
            raise ValueError("Ventana de entrega o dimensiones de carga inválidas.")
        return self

class PedidoCreate(PedidoBase):
    pass

class PreferenciasClienteUpdate(BaseModel):
    """
    US-004: Esquema para actualizar preferencias y restricciones del cliente.
    Aplica regla RN-007 / RN-010 (bloqueo para pedidos en tránsito).
    """
    ventana_inicio: Optional[time] = None
    ventana_fin: Optional[time] = None
    restriccion_acceso: Optional[str] = None
    referencia_ubicacion: Optional[str] = None
    foto_referencia_url: Optional[str] = None
    telefono_contacto: Optional[str] = None

    @field_validator("restriccion_acceso")
    def validate_restriccion(cls, v: Optional[str]) -> Optional[str]:
        if v is not None and v.strip().upper() not in RESTRICCIONES_ACCESO:
            raise ValueError(f"Restricción de acceso inválida. Permitidas: {', '.join(RESTRICCIONES_ACCESO)}")
        return v.strip().upper() if v else v

    @model_validator(mode="after")
    def check_ventanas_horarias(self):
        if self.ventana_inicio and self.ventana_fin:
            if self.ventana_fin <= self.ventana_inicio:
                raise ValueError("Ventana de entrega o dimensiones de carga inválidas.")
        return self

class EstadoPedidoUpdate(BaseModel):
    """Actualización del ciclo de vida del pedido."""
    estado: str = Field(..., description="Nuevo estado del pedido")

    @field_validator("estado")
    def validate_estado(cls, v: str) -> str:
        st = v.strip().upper()
        if st not in ESTADOS_PEDIDO:
            raise ValueError(f"Estado de pedido inválido. Permitidos: {', '.join(ESTADOS_PEDIDO)}")
        return st

class PedidoResponse(BaseModel):
    """Respuesta serializada con coordenadas geográficas y preferencias completas."""
    pedido_id: UUID
    ruta_id: Optional[UUID] = None
    codigo_seguimiento: str
    cliente_nombre: str
    direccion_destino: str
    latitud: float
    longitud: float
    peso_kg: float
    volumen_m3: float
    ventana_inicio: time
    ventana_fin: time
    prioridad: str
    estado: str
    referencia_ubicacion: Optional[str] = None
    restriccion_acceso: str = "LIBRE_ACCESO"
    foto_referencia_url: Optional[str] = None
    telefono_contacto: Optional[str] = None
    precio_producto: Optional[float] = 0.0
    metodo_pago: Optional[str] = "PAGADO"
    origen_direccion: Optional[str] = None
    origen_lat: Optional[float] = None
    origen_lng: Optional[float] = None
    foto_entrega_url: Optional[str] = None
    distancia_km: Optional[float] = None
    tiempo_estimado_min: Optional[float] = None
    consumo_combustible_gal: Optional[float] = None
    emision_co2_kg: Optional[float] = None
    creado_en: datetime

    model_config = ConfigDict(from_attributes=True)
