import uuid
from sqlalchemy import Column, String, Numeric, Time, Text, DateTime, func
from sqlalchemy.dialects.postgresql import UUID
from geoalchemy2 import Geometry
from app.db.session import Base

class Pedido(Base):
    __tablename__ = "pedidos"

    pedido_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    ruta_id = Column(UUID(as_uuid=True), nullable=True, index=True)
    codigo_seguimiento = Column(String(30), unique=True, nullable=False, index=True)
    cliente_nombre = Column(String(200), nullable=False)
    direccion_destino = Column(Text, nullable=False)
    ubicacion_destino = Column(Geometry("POINT", srid=4326), nullable=False)
    peso_kg = Column(Numeric(10, 2), nullable=False)
    volumen_m3 = Column(Numeric(10, 2), nullable=False)
    ventana_inicio = Column(Time, nullable=False)
    ventana_fin = Column(Time, nullable=False)
    prioridad = Column(String(20), nullable=False, default="ESTANDAR")
    estado = Column(String(20), nullable=False, default="PENDIENTE", index=True)
    creado_en = Column(DateTime(timezone=True), nullable=False, server_default=func.now())
