import uuid
from sqlalchemy import Column, String, Text, Time, Boolean
from sqlalchemy.dialects.postgresql import UUID
from app.db.session import Base

class ZonaRestringida(Base):
    """
    Modelo ORM de Zonas Restringidas y de Riesgo Urbano en Lima Metropolitana.
    Cubre polígonos de seguridad urbana (Callao, Barrios Altos, etc.) y Zonas de Bajas Emisiones (ZBE Centro Histórico).
    (RF-004, US-006, Ordenanza MML N° 2160).
    """
    __tablename__ = "zonas_restringidas"

    zona_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    nombre = Column(String(150), nullable=False)
    motivo = Column(String(100), nullable=False)
    nivel_peligro = Column(String(50), nullable=False, default="MEDIO")  # ALTO, MEDIO, ZBE_AMBIENTAL, RESTRICCION_HORARIA
    hora_inicio_restriccion = Column(Time, nullable=True)
    hora_fin_restriccion = Column(Time, nullable=True)
    poligono_geojson = Column(Text, nullable=False)
    activa = Column(Boolean, nullable=False, default=True)

