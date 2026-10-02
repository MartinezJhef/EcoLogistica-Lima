from pydantic import BaseModel, Field, model_validator
from typing import Optional
from datetime import time, datetime
from uuid import UUID

class GeoPoint(BaseModel):
    latitud: float = Field(..., ge=-18.0, le=-0.0, description="Latitud WGS84 (Área Perú)")
    longitud: float = Field(..., ge=-82.0, le=-68.0, description="Longitud WGS84 (Área Perú)")

class PedidoBase(BaseModel):
    codigo_seguimiento: str = Field(..., max_length=30)
    cliente_nombre: str = Field(..., max_length=200)
    direccion_destino: str
    latitud: float = Field(..., ge=-12.5, le=-11.5, description="Latitud en Lima Metropolitana")
    longitud: float = Field(..., ge=-77.5, le=-76.5, description="Longitud en Lima Metropolitana")
    peso_kg: float = Field(..., gt=0)
    volumen_m3: float = Field(..., gt=0)
    ventana_inicio: time
    ventana_fin: time
    prioridad: Optional[str] = "ESTANDAR"

    @model_validator(mode="after")
    def check_ventanas_horarias(self):
        if self.ventana_fin <= self.ventana_inicio:
            raise ValueError("La hora de fin de la ventana debe ser posterior a la hora de inicio (RN-007).")
        return self

class PedidoCreate(PedidoBase):
    pass

class PedidoResponse(BaseModel):
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
    creado_en: datetime

    class Config:
        from_attributes = True
