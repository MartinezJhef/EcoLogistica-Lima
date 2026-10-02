import uuid
from sqlalchemy import Column, String, Numeric, Integer
from sqlalchemy.dialects.postgresql import UUID
from app.db.session import Base

class Vehiculo(Base):
    __tablename__ = "vehiculos"

    vehiculo_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    placa = Column(String(10), unique=True, nullable=False, index=True)
    marca_modelo = Column(String(100), nullable=False)
    anio_fabricacion = Column(Integer, nullable=False, default=2024)
    capacidad_peso_kg = Column(Numeric(10, 2), nullable=False)
    capacidad_volumen_m3 = Column(Numeric(10, 2), nullable=False)
    consumo_km_gal = Column(Numeric(8, 2), nullable=False, default=35.0)
    tipo_combustible = Column(String(30), nullable=False)
    factor_emision_co2 = Column(Numeric(8, 4), nullable=False)
    restriccion_circulacion = Column(String(100), nullable=False, default="LIBRE_CIRCULACION")
    estado = Column(String(20), nullable=False, default="DISPONIBLE", index=True)

