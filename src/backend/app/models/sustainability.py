"""Persisted Sprint 4 settings, route snapshots and private export jobs."""
import uuid
from sqlalchemy import Column, String, Text, JSON, DateTime, LargeBinary, func
from app.db.session import Base


class SustainabilitySettings(Base):
    __tablename__ = 'sustainability_settings'
    id = Column(String(40), primary_key=True, default='current')
    data = Column(JSON, nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())


class RouteSnapshot(Base):
    __tablename__ = 'sustainability_snapshots'
    id = Column(String(36), primary_key=True)
    data = Column(JSON, nullable=False)


class SustainabilityExport(Base):
    __tablename__ = 'sustainability_exports'
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    owner = Column(String(36), nullable=False, index=True)
    kind = Column(String(30), nullable=False)
    status = Column(String(20), nullable=False, default='PENDIENTE', index=True)
    data = Column(JSON, nullable=False)
    error = Column(Text, nullable=True)
    document = Column(LargeBinary, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
