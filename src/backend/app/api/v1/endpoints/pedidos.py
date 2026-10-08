from fastapi import APIRouter, Depends, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from uuid import UUID
from app.db.session import get_db
from app.schemas.pedido import (
    PedidoCreate, 
    PedidoResponse, 
    PreferenciasClienteUpdate, 
    EstadoPedidoUpdate
)
from app.services.order_service import OrderService

router = APIRouter()

@router.get(
    "/", 
    response_model=List[PedidoResponse], 
    summary="Listar pedidos registrados con coordenadas GPS y preferencias (US-003 / US-004)"
)
def read_pedidos(
    skip: int = Query(0, ge=0), 
    limit: int = Query(100, ge=1, le=500), 
    estado: Optional[str] = Query(None, description="Filtrar por estado (PENDIENTE, EN_TRANSITO, etc.)"),
    prioridad: Optional[str] = Query(None, description="Filtrar por prioridad (BAJA, ESTANDAR, ALTA, URGENTE)"),
    db: Session = Depends(get_db)
):
    return OrderService.get_pedidos(db, skip=skip, limit=limit, estado=estado, prioridad=prioridad)

@router.post(
    "/", 
    response_model=PedidoResponse, 
    status_code=status.HTTP_201_CREATED, 
    summary="Registrar nuevo pedido con ventana de tiempo y geolocalización (US-003)"
)
def create_pedido(pedido_in: PedidoCreate, db: Session = Depends(get_db)):
    return OrderService.create_pedido(db, pedido_in)

@router.get(
    "/{pedido_id}", 
    response_model=PedidoResponse, 
    summary="Consultar pedido por UUID (US-003)"
)
def get_pedido(pedido_id: UUID, db: Session = Depends(get_db)):
    return OrderService.get_pedido_by_id(db, pedido_id)

@router.get(
    "/codigo/{codigo_seguimiento}", 
    response_model=PedidoResponse, 
    summary="Consultar pedido por código de seguimiento único"
)
def get_pedido_by_codigo(codigo_seguimiento: str, db: Session = Depends(get_db)):
    pedido = OrderService.get_pedido_by_codigo(db, codigo_seguimiento)
    if not pedido:
        from fastapi import HTTPException
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail=f"Pedido con código {codigo_seguimiento} no encontrado."
        )
    return OrderService._to_response(pedido)

@router.patch(
    "/{pedido_id}/preferencias", 
    response_model=PedidoResponse, 
    summary="Actualizar preferencias y restricciones del cliente (US-004)"
)
def update_preferencias_cliente(
    pedido_id: UUID, 
    prefs_in: PreferenciasClienteUpdate, 
    db: Session = Depends(get_db)
):
    """
    US-004: Actualiza horarios de atención, restricciones de acceso vehicular y referencias.
    Aplica regla RN-007 / RN-010: Bloquea modificaciones si el pedido se encuentra en tránsito.
    """
    return OrderService.update_preferencias_cliente(db, pedido_id, prefs_in)

@router.patch(
    "/{pedido_id}/estado", 
    response_model=PedidoResponse, 
    summary="Actualizar estado operativo del pedido"
)
def update_estado(
    pedido_id: UUID, 
    estado_in: EstadoPedidoUpdate, 
    db: Session = Depends(get_db)
):
    return OrderService.update_estado(db, pedido_id, estado_in)

@router.patch(
    "/{pedido_id}/entrega-pod",
    response_model=PedidoResponse,
    summary="Registrar prueba de entrega POD con fotografía desde la App Móvil"
)
def registrar_entrega_pod(
    pedido_id: UUID,
    datos: dict,
    db: Session = Depends(get_db)
):
    foto_entrega_url = datos.get("foto_entrega_url")
    estado = datos.get("estado", "ENTREGADO")
    return OrderService.registrar_entrega_pod(db, pedido_id, foto_entrega_url, estado)

@router.delete(
    "/{pedido_id}", 
    summary="Cancelar pedido registrado"
)
def delete_pedido(pedido_id: UUID, db: Session = Depends(get_db)):
    return OrderService.delete_pedido(db, pedido_id)
