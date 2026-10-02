import uuid
from sqlalchemy import Column, String, Numeric, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from app.db.session import Base

class Conductor(Base):
    __tablename__ = "conductores"

    conductor_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    usuario_id = Column(UUID(as_uuid=True), nullable=True, unique=True, index=True)
    dni = Column(String(8), unique=True, nullable=False, index=True)
    nombres = Column(String(100), nullable=False)
    apellidos = Column(String(100), nullable=False)
    licencia = Column(String(20), unique=True, nullable=False, index=True)
    categoria_licencia = Column(String(10), nullable=False, default="A-IIIc")
    telefono = Column(String(15), nullable=False)
    direccion_origen = Column(String(200), nullable=True)
    latitud_origen = Column(Numeric(10, 6), nullable=True)
    longitud_origen = Column(Numeric(10, 6), nullable=True)
    estado = Column(String(20), nullable=False, default="DISPONIBLE", index=True)
    horas_conduccion_hoy = Column(Numeric(4, 2), nullable=False, default=0.00)

