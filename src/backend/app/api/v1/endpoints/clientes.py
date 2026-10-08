from fastapi import APIRouter, Depends, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from uuid import UUID
from app.db.session import get_db
from app.schemas.cliente import (
    ClienteCreate,
    ClienteUpdate,
    ClienteResponse
)
from app.services.cliente_service import ClienteService

router = APIRouter()

@router.get("/", response_model=List[ClienteResponse], summary="Listar clientes registrados")
def read_clientes(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    tipo_comercio: Optional[str] = Query(None, description="Filtrar por tipo: BODEGA, SUPERMERCADO, RESTAURANTE, etc."),
    estado: Optional[str] = Query(None, description="Filtrar por estado: ACTIVO, INACTIVO"),
    distrito: Optional[str] = Query(None, description="Filtrar por distrito de Lima"),
    db: Session = Depends(get_db)
):
    """Retorna la lista de clientes B2B con opciones de filtro por comercio, distrito y estado."""
    return ClienteService.get_clientes(
        db, skip=skip, limit=limit,
        tipo_comercio=tipo_comercio, estado=estado, distrito=distrito
    )

@router.get("/{cliente_id}", response_model=ClienteResponse, summary="Obtener cliente por ID")
def read_cliente_by_id(cliente_id: UUID, db: Session = Depends(get_db)):
    """Obtiene el detalle completo de un cliente por su UUID."""
    return ClienteService.get_cliente_by_id(db, cliente_id)

@router.post("/", response_model=ClienteResponse, status_code=status.HTTP_201_CREATED, summary="Registrar nuevo cliente B2B")
def create_cliente(cliente_in: ClienteCreate, db: Session = Depends(get_db)):
    """
    Registra un nuevo cliente con:
    - RUC de 11 dígitos o DNI de 8 dígitos único
    - Dirección física y coordenadas GPS validadas en Lima Metropolitana
    - Ventana horaria de recepción y condiciones de acceso
    """
    return ClienteService.create_cliente(db, cliente_in)

@router.put("/{cliente_id}", response_model=ClienteResponse, summary="Actualizar datos del cliente")
def update_cliente(cliente_id: UUID, cliente_in: ClienteUpdate, db: Session = Depends(get_db)):
    """Actualiza datos de contacto, ubicación GPS, ventanas de entrega o estado del cliente."""
    return ClienteService.update_cliente(db, cliente_id, cliente_in)

@router.delete("/{cliente_id}", response_model=ClienteResponse, summary="Baja lógica de cliente")
def delete_cliente(cliente_id: UUID, db: Session = Depends(get_db)):
    """Pasa al cliente al estado INACTIVO sin eliminar el histórico de pedidos asociados."""
    return ClienteService.delete_cliente(db, cliente_id)
