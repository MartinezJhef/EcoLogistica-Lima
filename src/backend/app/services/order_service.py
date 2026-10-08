from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.models.pedido import Pedido
from app.schemas.pedido import (
    PedidoCreate, 
    PedidoResponse, 
    PreferenciasClienteUpdate, 
    EstadoPedidoUpdate
)
from geoalchemy2.shape import from_shape, to_shape
from shapely.geometry import Point
from uuid import UUID
from typing import List, Optional

class OrderService:
    """
    Servicio de Dominio para US-003 (Gestión y Geolocalización de Pedidos) y
    US-004 (Gestión de Preferencias y Restricciones del Cliente).
    Gobernado por RF-002, RF-009, RN-002, RN-006, RN-007 y RN-010.
    """

    @staticmethod
    def _to_response(p: Pedido) -> PedidoResponse:
        """Serializa la entidad SQLAlchemy y extrae coordenadas espaciales PostGIS."""
        punto = to_shape(p.ubicacion_destino)
        return PedidoResponse(
            pedido_id=p.pedido_id,
            ruta_id=p.ruta_id,
            codigo_seguimiento=p.codigo_seguimiento,
            cliente_nombre=p.cliente_nombre,
            direccion_destino=p.direccion_destino,
            latitud=round(float(punto.y), 6),
            longitud=round(float(punto.x), 6),
            peso_kg=float(p.peso_kg),
            volumen_m3=float(p.volumen_m3),
            ventana_inicio=p.ventana_inicio,
            ventana_fin=p.ventana_fin,
            prioridad=p.prioridad,
            estado=p.estado,
            referencia_ubicacion=p.referencia_ubicacion,
            restriccion_acceso=p.restriccion_acceso or "LIBRE_ACCESO",
            foto_referencia_url=p.foto_referencia_url,
            telefono_contacto=p.telefono_contacto,
            precio_producto=float(p.precio_producto) if p.precio_producto is not None else 0.0,
            metodo_pago=p.metodo_pago or "PAGADO",
            origen_direccion=p.origen_direccion,
            origen_lat=float(p.origen_lat) if p.origen_lat is not None else None,
            origen_lng=float(p.origen_lng) if p.origen_lng is not None else None,
            foto_entrega_url=p.foto_entrega_url,
            distancia_km=float(p.distancia_km) if p.distancia_km is not None else None,
            tiempo_estimado_min=float(p.tiempo_estimado_min) if p.tiempo_estimado_min is not None else None,
            consumo_combustible_gal=float(p.consumo_combustible_gal) if p.consumo_combustible_gal is not None else None,
            emision_co2_kg=float(p.emision_co2_kg) if p.emision_co2_kg is not None else None,
            creado_en=p.creado_en
        )

    @staticmethod
    def get_pedidos(
        db: Session, 
        skip: int = 0, 
        limit: int = 100, 
        estado: Optional[str] = None,
        prioridad: Optional[str] = None
    ) -> List[PedidoResponse]:
        """Consulta y listado de pedidos registrados con filtros opcionales."""
        query = db.query(Pedido)
        if estado:
            query = query.filter(Pedido.estado == estado.upper())
        if prioridad:
            query = query.filter(Pedido.prioridad == prioridad.upper())
        
        pedidos = query.order_by(Pedido.creado_en.desc()).offset(skip).limit(limit).all()
        return [OrderService._to_response(p) for p in pedidos]

    @staticmethod
    def get_pedido_by_id(db: Session, pedido_id: UUID) -> PedidoResponse:
        """Consulta de pedido por su UUID único."""
        pedido = db.query(Pedido).filter(Pedido.pedido_id == pedido_id).first()
        if not pedido:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Pedido con ID {pedido_id} no encontrado."
            )
        return OrderService._to_response(pedido)

    @staticmethod
    def get_pedido_by_codigo(db: Session, codigo_seguimiento: str) -> Optional[Pedido]:
        """Búsqueda interna por código de seguimiento indexado."""
        codigo_clean = codigo_seguimiento.strip().upper()
        return db.query(Pedido).filter(Pedido.codigo_seguimiento == codigo_clean).first()

    @staticmethod
    def create_pedido(db: Session, pedido_in: PedidoCreate) -> PedidoResponse:
        """
        US-003: Registro de nuevo pedido con geolocalización PostGIS,
        validación de dimensiones y ventanas horarias (RF-002, RN-002, RN-006, RN-007).
        """
        # Validación Escenario BDD: Código único de seguimiento
        codigo_clean = pedido_in.codigo_seguimiento.strip().upper()
        existing = OrderService.get_pedido_by_codigo(db, codigo_clean)
        if existing:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"El código de seguimiento {codigo_clean} ya se encuentra registrado."
            )

        # Validación Escenario 3 (Ruta Infeliz): Dimensiones de carga y ventanas horarias
        if pedido_in.ventana_fin <= pedido_in.ventana_inicio or pedido_in.peso_kg <= 0 or pedido_in.volumen_m3 <= 0:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="Ventana de entrega o dimensiones de carga inválidas."
            )

        # Construir punto geométrico PostGIS WGS84 SRID 4326 (Longitud, Latitud)
        punto_geom = from_shape(Point(pedido_in.longitud, pedido_in.latitud), srid=4326)

        db_pedido = Pedido(
            codigo_seguimiento=codigo_clean,
            cliente_nombre=pedido_in.cliente_nombre.strip(),
            direccion_destino=pedido_in.direccion_destino.strip(),
            ubicacion_destino=punto_geom,
            peso_kg=pedido_in.peso_kg,
            volumen_m3=pedido_in.volumen_m3,
            ventana_inicio=pedido_in.ventana_inicio,
            ventana_fin=pedido_in.ventana_fin,
            prioridad=pedido_in.prioridad or "ESTANDAR",
            estado="PENDIENTE",  # Estado inicial obligatorio: Pendiente de Programación
            referencia_ubicacion=pedido_in.referencia_ubicacion,
            restriccion_acceso=pedido_in.restriccion_acceso or "LIBRE_ACCESO",
            foto_referencia_url=pedido_in.foto_referencia_url,
            telefono_contacto=pedido_in.telefono_contacto,
            precio_producto=pedido_in.precio_producto or 0.0,
            metodo_pago=pedido_in.metodo_pago or "PAGADO",
            origen_direccion=pedido_in.origen_direccion,
            origen_lat=pedido_in.origen_lat,
            origen_lng=pedido_in.origen_lng,
            foto_entrega_url=pedido_in.foto_entrega_url,
            distancia_km=pedido_in.distancia_km,
            tiempo_estimado_min=pedido_in.tiempo_estimado_min,
            consumo_combustible_gal=pedido_in.consumo_combustible_gal,
            emision_co2_kg=pedido_in.emision_co2_kg
        )

        db.add(db_pedido)
        db.commit()
        db.refresh(db_pedido)

        return OrderService._to_response(db_pedido)

    @staticmethod
    def update_preferencias_cliente(
        db: Session, 
        pedido_id: UUID, 
        prefs_in: PreferenciasClienteUpdate
    ) -> PedidoResponse:
        """
        US-004: Gestión de preferencias y restricciones del cliente (RF-009, RN-010).
        Regla RN-007 / RN-010: Bloqueo estricto si el pedido está en tránsito.
        """
        pedido = db.query(Pedido).filter(Pedido.pedido_id == pedido_id).first()
        if not pedido:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Pedido con ID {pedido_id} no encontrado."
            )

        # Validación Escenario 2 BDD (Ruta Infeliz RF-009 y Reglas RN-007 / RN-010):
        # "No se pueden alterar las preferencias de un pedido en tránsito."
        if pedido.estado in ["EN_TRANSITO", "EN_RUTA"]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No se pueden alterar las preferencias de un pedido en tránsito."
            )

        # Validar y actualizar ventanas de entrega si fueron suministradas
        nueva_inicio = prefs_in.ventana_inicio or pedido.ventana_inicio
        nueva_fin = prefs_in.ventana_fin or pedido.ventana_fin
        if nueva_fin <= nueva_inicio:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="Ventana de entrega o dimensiones de carga inválidas."
            )

        pedido.ventana_inicio = nueva_inicio
        pedido.ventana_fin = nueva_fin

        if prefs_in.restriccion_acceso is not None:
            pedido.restriccion_acceso = prefs_in.restriccion_acceso
        if prefs_in.referencia_ubicacion is not None:
            pedido.referencia_ubicacion = prefs_in.referencia_ubicacion
        if prefs_in.foto_referencia_url is not None:
            pedido.foto_referencia_url = prefs_in.foto_referencia_url
        if prefs_in.telefono_contacto is not None:
            pedido.telefono_contacto = prefs_in.telefono_contacto

        db.commit()
        db.refresh(pedido)
        return OrderService._to_response(pedido)

    @staticmethod
    def update_estado(db: Session, pedido_id: UUID, estado_in: EstadoPedidoUpdate) -> PedidoResponse:
        """Transición de estado del ciclo de vida logístico del pedido."""
        pedido = db.query(Pedido).filter(Pedido.pedido_id == pedido_id).first()
        if not pedido:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Pedido con ID {pedido_id} no encontrado."
            )
        pedido.estado = estado_in.estado.upper()
        db.commit()
        db.refresh(pedido)
        return OrderService._to_response(pedido)

    @staticmethod
    def delete_pedido(db: Session, pedido_id: UUID) -> dict:
        """Baja o cancelación de pedido."""
        pedido = db.query(Pedido).filter(Pedido.pedido_id == pedido_id).first()
        if not pedido:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Pedido con ID {pedido_id} no encontrado."
            )
        if pedido.estado in ["EN_TRANSITO", "EN_RUTA"]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No se puede eliminar un pedido que se encuentra en tránsito."
            )
        
        pedido.estado = "CANCELADO"
        db.commit()
        return {"message": f"Pedido {pedido.codigo_seguimiento} cancelado exitosamente.", "pedido_id": str(pedido_id)}

    @staticmethod
    def registrar_entrega_pod(
        db: Session,
        pedido_id: UUID,
        foto_entrega_url: Optional[str] = None,
        estado: str = "ENTREGADO"
    ) -> PedidoResponse:
        """Registra la entrega física del pedido con evidencia fotográfica (POD)."""
        pedido = db.query(Pedido).filter(Pedido.pedido_id == pedido_id).first()
        if not pedido:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Pedido con ID {pedido_id} no encontrado."
            )
        pedido.estado = estado.upper()
        if foto_entrega_url:
            pedido.foto_entrega_url = foto_entrega_url
        db.commit()
        db.refresh(pedido)
        return OrderService._to_response(pedido)

