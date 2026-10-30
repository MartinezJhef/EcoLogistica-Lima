import uuid
from sqlalchemy import Column, String, Text, Numeric
from sqlalchemy.dialects.postgresql import UUID
from app.db.session import Base

class Deposito(Base):
    __tablename__ = "depositos"

    deposito_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    nombre = Column(String(150), nullable=False)
    direccion = Column(Text, nullable=False)
    latitud = Column(Numeric(10, 6), nullable=True)
    longitud = Column(Numeric(10, 6), nullable=True)
    estado = Column(String(20), nullable=False, default="OPERATIVO")
