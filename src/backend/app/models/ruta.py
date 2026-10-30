import uuid
from sqlalchemy import Column, String, Numeric, Integer, Date, DateTime, ForeignKey, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.db.session import Base

class Ruta(Base):
    """
    Modelo ORM de Rutas Optimizadas (US-005: Generar rutas optimizadas,
    US-006: Visualizar rutas en el mapa, US-007: Reoptimizar rutas ante eventos).
    Conforme a RF-003, RF-004, RF-007, RN-001, RN-004 y Ley N° 30224.
    """
    __tablename__ = "rutas"

    ruta_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    deposito_origen_id = Column(UUID(as_uuid=True), ForeignKey("depositos.deposito_id"), nullable=True)
    conductor_id = Column(UUID(as_uuid=True), ForeignKey("conductores.conductor_id"), nullable=False, index=True)
    vehiculo_id = Column(UUID(as_uuid=True), ForeignKey("vehiculos.vehiculo_id"), nullable=False, index=True)
    fecha_operacion = Column(Date, nullable=False, index=True)
    distancia_total_km = Column(Numeric(10, 2), nullable=False, default=0.00)
    tiempo_total_min = Column(Integer, nullable=False, default=0)
    co2_total_kg = Column(Numeric(10, 2), nullable=False, default=0.00)

    # Métricas de computación y huella de carbono de ejecución (CodeCarbon)
    co2_computacional_kg = Column(Numeric(12, 8), nullable=False, default=0.0)
    energia_computacional_kwh = Column(Numeric(12, 8), nullable=False, default=0.0)
    tiempo_computo_seg = Column(Numeric(10, 4), nullable=False, default=0.0)

    estado = Column(String(20), nullable=False, default="PLANIFICADA", index=True)
    creada_en = Column(DateTime(timezone=True), nullable=False, server_default=func.now())

    # Relaciones
    conductor = relationship("Conductor", lazy="joined")
    vehiculo = relationship("Vehiculo", lazy="joined")
    deposito = relationship("Deposito", lazy="joined")
    tramos = relationship("Tramo", back_populates="ruta", cascade="all, delete-orphan", order_by="Tramo.orden_secuencia")

