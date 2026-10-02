from sqlalchemy.orm import Session
from sqlalchemy import func
from fastapi import HTTPException, status
from app.models.pedido import Pedido
from app.schemas.pedido import PedidoCreate, PedidoResponse
from geoalchemy2.shape import from_shape, to_shape
from shapely.geometry import Point
from typing import List

class OrderService:
    @staticmethod
    def get_pedidos(db: Session, skip: int = 0, limit: int = 100) -> List[PedidoResponse]:
        pedidos = db.query(Pedido).offset(skip).limit(limit).all()
        response = []
        for p in pedidos:
            # Extraer coordenadas desde el objeto espacial PostGIS
            punto = to_shape(p.ubicacion_destino)
            response.append(
                PedidoResponse(
                    pedido_id=p.pedido_id,
                    ruta_id=p.ruta_id,
                    codigo_seguimiento=p.codigo_seguimiento,
                    cliente_nombre=p.cliente_nombre,
                    direccion_destino=p.direccion_destino,
                    latitud=punto.y,
                    longitud=punto.x,
                    peso_kg=float(p.peso_kg),
                    volumen_m3=float(p.volumen_m3),
                    ventana_inicio=p.ventana_inicio,
                    ventana_fin=p.ventana_fin,
                    prioridad=p.prioridad,
                    estado=p.estado,
                    creado_en=p.creado_en
                )
            )
        return response

    @staticmethod
    def create_pedido(db: Session, pedido_in: PedidoCreate) -> PedidoResponse:
        # Validar código único de seguimiento
        existing = db.query(Pedido).filter(Pedido.codigo_seguimiento == pedido_in.codigo_seguimiento).first()
        if existing:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"El código de seguimiento {pedido_in.codigo_seguimiento} ya se encuentra registrado."
            )

        # Crear punto espacial PostGIS SRID 4326 (Longitud, Latitud)
        punto_geom = from_shape(Point(pedido_in.longitud, pedido_in.latitud), srid=4326)

        db_pedido = Pedido(
            codigo_seguimiento=pedido_in.codigo_seguimiento,
            cliente_nombre=pedido_in.cliente_nombre,
            direccion_destino=pedido_in.direccion_destino,
            ubicacion_destino=punto_geom,
            peso_kg=pedido_in.peso_kg,
            volumen_m3=pedido_in.volumen_m3,
            ventana_inicio=pedido_in.ventana_inicio,
            ventana_fin=pedido_in.ventana_fin,
            prioridad=pedido_in.prioridad or "ESTANDAR",
            estado="PENDIENTE"
        )
        db.add(db_pedido)
        db.commit()
        db.refresh(db_pedido)

        return PedidoResponse(
            pedido_id=db_pedido.pedido_id,
            ruta_id=db_pedido.ruta_id,
            codigo_seguimiento=db_pedido.codigo_seguimiento,
            cliente_nombre=db_pedido.cliente_nombre,
            direccion_destino=db_pedido.direccion_destino,
            latitud=pedido_in.latitud,
            longitud=pedido_in.longitud,
            peso_kg=float(db_pedido.peso_kg),
            volumen_m3=float(db_pedido.volumen_m3),
            ventana_inicio=db_pedido.ventana_inicio,
            ventana_fin=db_pedido.ventana_fin,
            prioridad=db_pedido.prioridad,
            estado=db_pedido.estado,
            creado_en=db_pedido.creado_en
        )
