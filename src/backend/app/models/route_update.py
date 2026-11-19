import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Text, DateTime, ForeignKey, func
from sqlalchemy.dialects.postgresql import UUID
from app.db.session import Base


class RouteUpdate(Base):
    """Durable delivery queue: a revision remains pending until the device acknowledges it."""
    __tablename__ = "route_updates"
    update_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    ruta_id = Column(UUID(as_uuid=True), ForeignKey("rutas.ruta_id"), nullable=False, index=True)
    conductor_id = Column(UUID(as_uuid=True), ForeignKey("conductores.conductor_id"), nullable=False, index=True)
    payload = Column(Text, nullable=False)
    motivo = Column(String(200), nullable=False)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), server_default=func.now(), nullable=False)
    acknowledged_at = Column(DateTime(timezone=True), nullable=True)
