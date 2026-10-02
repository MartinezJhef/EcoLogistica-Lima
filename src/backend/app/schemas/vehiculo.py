import re
from pydantic import BaseModel, Field, field_validator, model_validator
from typing import Optional
from uuid import UUID

class VehiculoBase(BaseModel):
    placa: str = Field(..., min_length=6, max_length=10, description="Placa vehicular peruana oficial (ej. ABC-123)")
    marca_modelo: str = Field(..., min_length=2, max_length=100, description="Marca, línea y modelo de la unidad")
    anio_fabricacion: int = Field(2024, ge=1990, le=2030, description="Año de fabricación del vehículo")
    capacidad_peso_kg: float = Field(..., gt=0, description="Capacidad máxima de carga útil en kilogramos")
    capacidad_volumen_m3: float = Field(..., gt=0, description="Capacidad volumétrica en metros cúbicos")
    consumo_km_gal: float = Field(35.0, ge=0, description="Rendimiento promedio en km/galón (o equivalente en kWh)")
    tipo_combustible: str = Field(..., description="DIESEL, GNV, ELECTRICO o HIBRIDO")
    factor_emision_co2: float = Field(..., ge=0, description="Factor de emisión en kg CO2/km")
    restriccion_circulacion: Optional[str] = Field(None, description="Etiqueta de restricción zonal automática o asignada")
    estado: Optional[str] = Field("DISPONIBLE", description="DISPONIBLE, EN_RUTA, MANTENIMIENTO, INACTIVO")

    @field_validator("placa")
    def validate_placa(cls, v: str) -> str:
        v_clean = v.strip().upper()
        pattern = r"^[A-Z0-9]{3}-?[A-Z0-9]{3,4}$"
        if not re.match(pattern, v_clean):
            raise ValueError("Formato de placa inválido. Debe contener entre 6 y 7 caracteres alfanuméricos (ej. ABC-123).")
        if len(v_clean) == 6 and "-" not in v_clean:
            v_clean = f"{v_clean[:3]}-{v_clean[3:]}"
        return v_clean

    @field_validator("tipo_combustible")
    def validate_tipo_combustible(cls, v: str) -> str:
        valid = ["DIESEL", "GNV", "ELECTRICO", "HIBRIDO"]
        v_upper = v.strip().upper()
        if v_upper not in valid:
            raise ValueError(f"Tipo de combustible inválido. Permitidos: {', '.join(valid)}")
        return v_upper

    @field_validator("estado")
    def validate_estado(cls, v: Optional[str]) -> str:
        if not v:
            return "DISPONIBLE"
        v_upper = v.strip().upper()
        if v_upper == "ACTIVO":
            return "DISPONIBLE"
        valid = ["DISPONIBLE", "EN_RUTA", "MANTENIMIENTO", "INACTIVO"]
        if v_upper not in valid:
            raise ValueError(f"Estado inválido. Permitidos: {', '.join(valid)}")
        return v_upper

    @model_validator(mode="after")
    def validate_coherencia_ambiental(self):
        """Valida que los factores ambientales correspondan al tipo de propulsión (RF-001 / SUB-001-05)."""
        if self.tipo_combustible == "ELECTRICO" and self.factor_emision_co2 > 0.05:
            raise ValueError("Los vehículos 100% eléctricos no pueden tener factores de emisión directos superiores a 0.05 kg CO2/km.")
        return self

class VehiculoCreate(VehiculoBase):
    pass

class VehiculoUpdate(BaseModel):
    marca_modelo: Optional[str] = Field(None, min_length=2, max_length=100)
    anio_fabricacion: Optional[int] = Field(None, ge=1990, le=2030)
    capacidad_peso_kg: Optional[float] = Field(None, gt=0)
    capacidad_volumen_m3: Optional[float] = Field(None, gt=0)
    consumo_km_gal: Optional[float] = Field(None, ge=0)
    tipo_combustible: Optional[str] = None
    factor_emision_co2: Optional[float] = Field(None, ge=0)
    restriccion_circulacion: Optional[str] = None
    estado: Optional[str] = None

    @field_validator("tipo_combustible")
    def validate_tipo_combustible(cls, v):
        if v is None:
            return v
        valid = ["DIESEL", "GNV", "ELECTRICO", "HIBRIDO"]
        v_upper = v.strip().upper()
        if v_upper not in valid:
            raise ValueError(f"Tipo de combustible inválido. Permitidos: {', '.join(valid)}")
        return v_upper

    @field_validator("estado")
    def validate_estado(cls, v):
        if v is None:
            return v
        v_upper = v.strip().upper()
        if v_upper == "ACTIVO":
            return "DISPONIBLE"
        valid = ["DISPONIBLE", "EN_RUTA", "MANTENIMIENTO", "INACTIVO"]
        if v_upper not in valid:
            raise ValueError(f"Estado inválido. Permitidos: {', '.join(valid)}")
        return v_upper

class VehiculoInDBBase(VehiculoBase):
    vehiculo_id: UUID

    class Config:
        from_attributes = True

class VehiculoResponse(VehiculoInDBBase):
    pass
