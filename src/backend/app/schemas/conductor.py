from pydantic import BaseModel, Field, field_validator
from typing import Optional, Literal
from uuid import UUID
import re

CATEGORIAS_LICENCIA = ('A-I', 'A-IIa', 'A-IIb', 'A-IIIa', 'A-IIIb', 'A-IIIc')
ESTADOS_CONDUCTOR = ('DISPONIBLE', 'EN_RUTA', 'DESCANSO', 'INACTIVO')

class ConductorBase(BaseModel):
    dni: str = Field(..., min_length=8, max_length=8, description="DNI peruano (8 dígitos numéricos)")
    nombres: str = Field(..., min_length=2, max_length=100, description="Nombres del conductor")
    apellidos: str = Field(..., min_length=2, max_length=100, description="Apellidos del conductor")
    licencia: str = Field(..., min_length=6, max_length=20, description="Licencia de conducir MTC (ej. Q12345678)")
    categoria_licencia: Optional[str] = Field("A-IIIc", description="Categoría oficial MTC: A-I, A-IIa, A-IIb, A-IIIa, A-IIIb, A-IIIc")
    telefono: str = Field(..., min_length=7, max_length=15, description="Teléfono de contacto")
    direccion_origen: Optional[str] = Field(None, max_length=200, description="Dirección o punto base de inicio habitual")
    latitud_origen: Optional[float] = Field(None, description="Latitud GPS del punto de origen")
    longitud_origen: Optional[float] = Field(None, description="Longitud GPS del punto de origen")
    estado: Optional[str] = Field("DISPONIBLE", description="Estado operativo del conductor")
    horas_conduccion_hoy: Optional[float] = Field(0.0, ge=0.0, le=14.0, description="Horas acumuladas de conducción en la jornada de hoy")

    @field_validator("dni")
    def validate_dni(cls, v: str) -> str:
        clean = v.strip()
        if not re.match(r"^\d{8}$", clean):
            raise ValueError("El DNI debe contener exactamente 8 dígitos numéricos.")
        return clean

    @field_validator("licencia")
    def validate_licencia(cls, v: str) -> str:
        clean = v.strip().upper()
        # Formato de brevete MTC comúnmente letra + 8 dígitos (ej. Q45892147) o alfanumérico entre 8 y 12 caracteres
        if not re.match(r"^[A-Z0-9]{6,12}$", clean):
            raise ValueError("El número de licencia debe ser un formato alfanumérico MTC válido (6 a 12 caracteres).")
        return clean

    @field_validator("categoria_licencia")
    def validate_categoria(cls, v: Optional[str]) -> str:
        if not v:
            return "A-IIIc"
        cat = v.strip()
        if cat not in CATEGORIAS_LICENCIA:
            raise ValueError(f"Categoría de licencia inválida. Permitidas: {', '.join(CATEGORIAS_LICENCIA)}")
        return cat

    @field_validator("estado")
    def validate_estado(cls, v: Optional[str]) -> str:
        if not v:
            return "DISPONIBLE"
        est = v.strip().upper()
        if est not in ESTADOS_CONDUCTOR:
            raise ValueError(f"Estado de conductor inválido. Permitidos: {', '.join(ESTADOS_CONDUCTOR)}")
        return est

class ConductorCreate(ConductorBase):
    usuario_id: Optional[UUID] = None

class ConductorUpdate(BaseModel):
    nombres: Optional[str] = Field(None, min_length=2, max_length=100)
    apellidos: Optional[str] = Field(None, min_length=2, max_length=100)
    telefono: Optional[str] = Field(None, min_length=7, max_length=15)
    categoria_licencia: Optional[str] = None
    direccion_origen: Optional[str] = None
    latitud_origen: Optional[float] = None
    longitud_origen: Optional[float] = None
    estado: Optional[str] = None
    horas_conduccion_hoy: Optional[float] = Field(None, ge=0.0, le=14.0)

    @field_validator("categoria_licencia")
    def validate_categoria_update(cls, v: Optional[str]) -> Optional[str]:
        if v is not None and v not in CATEGORIAS_LICENCIA:
            raise ValueError(f"Categoría de licencia inválida. Permitidas: {', '.join(CATEGORIAS_LICENCIA)}")
        return v

    @field_validator("estado")
    def validate_estado_update(cls, v: Optional[str]) -> Optional[str]:
        if v is not None and v.upper() not in ESTADOS_CONDUCTOR:
            raise ValueError(f"Estado de conductor inválido. Permitidos: {', '.join(ESTADOS_CONDUCTOR)}")
        return v.upper() if v else v

class ConductorResponse(ConductorBase):
    conductor_id: UUID
    usuario_id: Optional[UUID] = None

    class Config:
        from_attributes = True

class ValidarJornadaRequest(BaseModel):
    horas_ruta: float = Field(..., gt=0.0, le=14.0, description="Duración estimada en horas de la ruta a asignar")

class ValidarJornadaResponse(BaseModel):
    conductor_id: UUID
    conductor_nombre: str
    estado_actual: str
    horas_acumuladas_hoy: float
    horas_solicitadas: float
    horas_proyectadas: float
    limite_legal_horas: float = 8.0
    aprobado: bool
    mensaje: str

class ReiniciarJornadaResponse(BaseModel):
    conductor_id: UUID
    horas_conduccion_hoy: float
    mensaje: str
