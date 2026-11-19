from datetime import date
from typing import Annotated
from pydantic import BaseModel, Field, model_validator

Positive = Annotated[float, Field(gt=0, allow_inf_nan=False)]


class Project(BaseModel):
    id: str = Field(min_length=1, max_length=50, pattern=r'^[a-zA-Z0-9_-]+$')
    nombre: str = Field(min_length=1, max_length=150)


class SustainabilityConfig(BaseModel):
    fuente: str = Field(min_length=5, max_length=500)
    vigencia: date
    precios_por_galon: dict[str, Positive] = Field(default_factory=dict)
    precio_kwh: Positive | None = None
    consumo_electrico_kwh_km: Positive | None = None
    kg_por_arbol: Positive
    horizonte_anios: int = Field(ge=1, le=100)
    kg_por_credito: Positive = 1000
    proyectos: list[Project] = Field(min_length=1, max_length=30)

    @model_validator(mode='after')
    def unique_projects(self):
        if len({p.id for p in self.proyectos}) != len(self.proyectos):
            raise ValueError('Los proyectos deben tener identificadores únicos')
        if set(self.precios_por_galon) - {'DIESEL', 'GNV', 'HIBRIDO'}:
            raise ValueError('Tipo de combustible desconocido')
        return self


class Period(BaseModel):
    desde: date
    hasta: date

    @model_validator(mode='after')
    def valid_period(self):
        from app.services.analytics_service import comparison_period
        comparison_period(self.desde, self.hasta)
        return self


class Proposal(Period):
    distribucion: dict[str, Annotated[float, Field(ge=0, le=100, allow_inf_nan=False)]]
