from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from typing import List
from app.db.session import get_db
from app.schemas.pedido import PedidoCreate, PedidoResponse
from app.services.order_service import OrderService

router = APIRouter()

@router.get("/", response_model=List[PedidoResponse], summary="Listar pedidos registrados con coordenadas GPS")
def read_pedidos(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return OrderService.get_pedidos(db, skip=skip, limit=limit)

@router.post("/", response_model=PedidoResponse, status_code=status.HTTP_201_CREATED, summary="Registrar nuevo pedido con ventana de tiempo (US-003)")
def create_pedido(pedido_in: PedidoCreate, db: Session = Depends(get_db)):
    return OrderService.create_pedido(db, pedido_in)
