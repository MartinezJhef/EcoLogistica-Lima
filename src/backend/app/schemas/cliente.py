from pydantic import BaseModel, Field
from typing import Optional, Literal
from uuid import UUID
from datetime import datetime

class ClienteBase(BaseModel):
    tipo_documento: Literal["RUC", "DNI", "CE"] = Field("RUC", description="Tipo de documento de identidad tributaria")
    numero_documento: str = Field(..., min_length=8, max_length=20, description="Número de RUC o DNI")
    razon_social: str = Field(..., min_length=2, max_length=200, description="Razón Social o Nombre Comercial")
    nombre_contacto: Optional[str] = Field(None, max_length=150, description="Nombre de la persona o encargado de recepción")
    telefono: str = Field(..., min_length=6, max_length=20, description="Teléfono celular o fijo de contacto")
    email: Optional[str] = Field(None, max_length=150, description="Correo electrónico para notificaciones de entrega")
    direccion: str = Field(..., min_length=5, max_length=250, description="Dirección física exacta en Lima")
    distrito: str = Field(..., min_length=2, max_length=100, description="Distrito de Lima Metropolitana")
    latitud: float = Field(..., ge=-13.0, le=-11.0, description="Latitud GPS en Lima Metropolitana")
    longitud: float = Field(..., ge=-78.0, le=-76.0, description="Longitud GPS en Lima Metropolitana")
    tipo_comercio: Literal["BODEGA", "SUPERMERCADO", "RESTAURANTE", "FARMACIA", "DISTRIBUIDORA", "PARTICULAR"] = Field("BODEGA", description="Tipo de negocio o cliente")
    ventana_entrega_inicio: str = Field("08:00", description="Hora de inicio de recepción (HH:MM)")
    ventana_entrega_fin: str = Field("18:00", description="Hora límite de recepción (HH:MM)")
    restriccion_acceso: str = Field("LIBRE_ACCESO", max_length=100, description="Condición de acceso vehicular")
    estado: Literal["ACTIVO", "INACTIVO"] = Field("ACTIVO", description="Estado operativo del cliente")

class ClienteCreate(ClienteBase):
    pass

class ClienteUpdate(BaseModel):
    tipo_documento: Optional[Literal["RUC", "DNI", "CE"]] = None
    numero_documento: Optional[str] = None
    razon_social: Optional[str] = None
    nombre_contacto: Optional[str] = None
    telefono: Optional[str] = None
    email: Optional[str] = None
    direccion: Optional[str] = None
    distrito: Optional[str] = None
    latitud: Optional[float] = None
    longitud: Optional[float] = None
    tipo_comercio: Optional[Literal["BODEGA", "SUPERMERCADO", "RESTAURANTE", "FARMACIA", "DISTRIBUIDORA", "PARTICULAR"]] = None
    ventana_entrega_inicio: Optional[str] = None
    ventana_entrega_fin: Optional[str] = None
    restriccion_acceso: Optional[str] = None
    estado: Optional[Literal["ACTIVO", "INACTIVO"]] = None

class ClienteResponse(ClienteBase):
    cliente_id: UUID
    creado_en: Optional[datetime] = None

    class Config:
        from_attributes = True
