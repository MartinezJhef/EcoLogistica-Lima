import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, JSON
from sqlalchemy.dialects.postgresql import UUID
from app.models.vehiculo import Base

class Usuario(Base):
    """
    Modelo ORM de Usuario y Control de Acceso Basado en Roles (RBAC).
    Cumple con ROL-01 a ROL-04 según la especificación del sistema.
    """
    __tablename__ = "usuarios"

    usuario_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String(255), nullable=False, unique=True, index=True)
    nombre_completo = Column(String(150), nullable=False, default="Usuario")
    telefono = Column(String(20), nullable=True)
    password_hash = Column(String(255), nullable=False)
    rol = Column(String(20), nullable=False, default="OFICINA", index=True)  # ADMIN, OFICINA, REPARTIDOR, CLIENTE
    permisos = Column(JSON, nullable=False, default=list)  # Lista de claves de permisos granulares
    estado = Column(String(20), nullable=False, default="ACTIVO")  # ACTIVO, INACTIVO, BLOQUEADO
    creado_en = Column(DateTime(timezone=True), default=datetime.utcnow)
