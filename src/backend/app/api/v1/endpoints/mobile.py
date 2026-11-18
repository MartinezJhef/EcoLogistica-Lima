from uuid import UUID
from typing import Literal, Optional
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.core.auth import current_user
from app.db.session import get_db
from app.models.pedido import Pedido
from app.models.ruta import Ruta
from app.services.order_service import OrderService
from app.schemas.pedido import PedidoCreate, PreferenciasClienteUpdate, PedidoResponse

router = APIRouter()

@router.get('/pedidos/{pedido_id}', response_model=PedidoResponse)
def consultar(pedido_id: UUID, db: Session = Depends(get_db), user=Depends(current_user)):
    order = visible_orders(db, user).filter(Pedido.pedido_id == pedido_id).first()
    if not order:
        raise HTTPException(404, 'Pedido no encontrado para esta cuenta')
    return OrderService._to_response(order)

@router.patch('/pedidos/{pedido_id}/preferencias', response_model=PedidoResponse)
def preferencias(pedido_id: UUID, data: PreferenciasClienteUpdate, db: Session = Depends(get_db), user=Depends(current_user)):
    if user.rol not in ('CLIENTE', 'OFICINA', 'ADMIN'):
        raise HTTPException(403, 'No puedes modificar las preferencias del cliente')
    if not visible_orders(db, user).filter(Pedido.pedido_id == pedido_id).first():
        raise HTTPException(404, 'Pedido no encontrado para esta cuenta')
    return OrderService.update_preferencias_cliente(db, pedido_id, data)

def visible_orders(db, user):
    query = db.query(Pedido)
    if user.rol == 'REPARTIDOR':
        return query.join(Ruta, Pedido.ruta_id == Ruta.ruta_id).filter(Ruta.conductor_id == user.conductor_id) if user.conductor_id else query.filter(False)
    if user.rol == 'CLIENTE':
        return query.filter(Pedido.usuario_cliente_id == user.usuario_id)
    if user.rol not in ('ADMIN', 'OFICINA'):
        raise HTTPException(403, 'Rol no autorizado')
    return query

@router.get('/pedidos')
def pedidos(db: Session = Depends(get_db), user=Depends(current_user)):
    return [OrderService._to_response(p) for p in visible_orders(db, user).order_by(Pedido.creado_en.desc()).limit(500)]

@router.post('/pedidos')
def crear(data: PedidoCreate, db: Session = Depends(get_db), user=Depends(current_user)):
    if user.rol not in ('CLIENTE', 'OFICINA', 'ADMIN'):
        raise HTTPException(403, 'Solo clientes y oficina pueden registrar pedidos')
    existing = db.query(Pedido).filter(Pedido.codigo_seguimiento == data.codigo_seguimiento).first()
    if existing:
        stored = OrderService._to_response(existing).model_dump()
        expected = data.model_dump()
        same_payload = all(stored.get(key) == value for key, value in expected.items()
            if key in ('cliente_nombre','direccion_destino','peso_kg','volumen_m3','ventana_inicio','ventana_fin',
                       'prioridad','restriccion_acceso','latitud','longitud','origen_lat','origen_lng','metodo_pago','precio_producto'))
        if existing.usuario_cliente_id == user.usuario_id and same_payload:
            return OrderService._to_response(existing)
        raise HTTPException(409, 'El código ya existe con otros datos; no se confirmó el envío')
    created = OrderService.create_pedido(db, data, usuario_cliente_id=user.usuario_id)
    return created

class DeliveryUpdate(BaseModel):
    estado: Literal['ASIGNADO', 'EN_TRANSITO', 'ENTREGADO', 'NO_ENTREGADO']
    foto_entrega_url: Optional[str] = None

@router.patch('/pedidos/{pedido_id}')
def actualizar(pedido_id: UUID, data: DeliveryUpdate, db: Session = Depends(get_db), user=Depends(current_user)):
    order = visible_orders(db, user).filter(Pedido.pedido_id == pedido_id).first()
    if not order or user.rol not in ('REPARTIDOR', 'OFICINA', 'ADMIN'):
        raise HTTPException(403, 'No puedes actualizar la entrega de este pedido')
    from app.services.delivery_service import update_delivery
    updated = update_delivery(db, order, data.estado, data.foto_entrega_url)
    return OrderService._to_response(updated)
