import uuid
from sqlalchemy import Column, String, Numeric, Integer, Boolean, Text, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.db.session import Base

class Tramo(Base):
    """
    Modelo ORM de Tramos y Secuencia de Paradas de una Ruta.
    Cumple con el ordenamiento de visitas, descansos de fatiga (Ley N° 30224)
    y visualización cartográfica geoespacial (US-005 / US-006 / US-007).
    """
    __tablename__ = "tramos"

    tramo_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    ruta_id = Column(UUID(as_uuid=True), ForeignKey("rutas.ruta_id", ondelete="CASCADE"), nullable=False, index=True)
    orden_secuencia = Column(Integer, nullable=False)
    tipo_parada = Column(String(30), nullable=False, default="ENTREGA")  # DEPOSITO_SALIDA, ENTREGA, DESCANSO_TECNICO_30MIN, DEPOSITO_RETORNO
    pedido_id = Column(UUID(as_uuid=True), ForeignKey("pedidos.pedido_id", ondelete="SET NULL"), nullable=True)
    descripcion = Column(Text, nullable=True)
    latitud = Column(Numeric(10, 6), nullable=True)
    longitud = Column(Numeric(10, 6), nullable=True)
    distancia_tramo_km = Column(Numeric(8, 2), nullable=False, default=0.00)
    tiempo_estimado_min = Column(Numeric(8, 2), nullable=False, default=0.00)
    co2_tramo_kg = Column(Numeric(8, 2), nullable=False, default=0.00)
    alerta_zona_riesgo = Column(Boolean, nullable=False, default=False)
    nombre_zona_riesgo = Column(String(150), nullable=True)
    geometria_linea_geojson = Column(Text, nullable=True)

    ruta = relationship("Ruta", back_populates="tramos")
    pedido = relationship("Pedido", lazy="joined")

