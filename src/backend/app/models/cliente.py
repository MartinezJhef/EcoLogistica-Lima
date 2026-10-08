import uuid
from sqlalchemy import Column, String, Numeric, Time, DateTime
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from app.db.session import Base

class Cliente(Base):
    __tablename__ = "clientes"

    cliente_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    tipo_documento = Column(String(10), nullable=False, default="RUC")
    numero_documento = Column(String(20), unique=True, nullable=False, index=True)
    razon_social = Column(String(200), nullable=False, index=True)
    nombre_contacto = Column(String(150), nullable=True)
    telefono = Column(String(20), nullable=False)
    email = Column(String(150), nullable=True)
    direccion = Column(String(250), nullable=False)
    distrito = Column(String(100), nullable=False, index=True)
    latitud = Column(Numeric(10, 6), nullable=False)
    longitud = Column(Numeric(10, 6), nullable=False)
    tipo_comercio = Column(String(50), nullable=False, default="BODEGA")
    ventana_entrega_inicio = Column(String(10), nullable=False, default="08:00")
    ventana_entrega_fin = Column(String(10), nullable=False, default="18:00")
    restriccion_acceso = Column(String(100), nullable=False, default="LIBRE_ACCESO")
    estado = Column(String(20), nullable=False, default="ACTIVO", index=True)
    creado_en = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
