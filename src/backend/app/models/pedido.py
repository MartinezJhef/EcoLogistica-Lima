import uuid
from sqlalchemy import Column, String, Numeric, Time, Text, DateTime, func
from sqlalchemy.dialects.postgresql import UUID
from geoalchemy2 import Geometry
from app.db.session import Base

class Pedido(Base):
    """
    Modelo ORM de Pedidos de Entrega (US-003: Registrar pedidos y geolocalización,
    US-004: Gestionar preferencias y restricciones del cliente).
    Conforme a RF-002, RF-009, RN-002, RN-006, RN-007 y RN-010.
    """
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

    # Campos específicos para US-003 y US-004 (Preferencias y Restricciones del Cliente)
    referencia_ubicacion = Column(Text, nullable=True)
    referencia_destino = Column(Text, nullable=True)
    restriccion_acceso = Column(String(100), nullable=False, default="LIBRE_ACCESO")
    foto_referencia_url = Column(Text, nullable=True)
    telefono_contacto = Column(String(20), nullable=True)

    # Campos de Sincronización Móvil y Prueba de Entrega (POD / Eco-Métricas)
    precio_producto = Column(Numeric(10, 2), nullable=True, default=0.0)
    metodo_pago = Column(String(50), nullable=True, default="PAGADO")
    origen_direccion = Column(Text, nullable=True)
    origen_lat = Column(Numeric(10, 6), nullable=True)
    origen_lng = Column(Numeric(10, 6), nullable=True)
    foto_entrega_url = Column(Text, nullable=True)
    distancia_km = Column(Numeric(10, 2), nullable=True)
    tiempo_estimado_min = Column(Numeric(10, 2), nullable=True)
    consumo_combustible_gal = Column(Numeric(10, 3), nullable=True)
    emision_co2_kg = Column(Numeric(10, 3), nullable=True)

    creado_en = Column(DateTime(timezone=True), nullable=False, server_default=func.now())

