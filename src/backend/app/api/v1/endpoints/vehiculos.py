from fastapi import APIRouter, Depends, status, Query, Path
from sqlalchemy.orm import Session
from typing import List, Optional
from uuid import UUID
from app.db.session import get_db
from app.schemas.vehiculo import VehiculoCreate, VehiculoUpdate, VehiculoResponse
from app.services.fleet_service import FleetService

router = APIRouter()

@router.get(
    "/",
    response_model=List[VehiculoResponse],
    summary="Listar y filtrar vehículos de la flota (SUB-001-03)",
    description="Permite consultar la flota vehicular con paginación y filtros opcionales por propulsión, estado o restricción."
)
def read_vehiculos(
    skip: int = Query(0, ge=0, description="Número de registros a omitir para paginación"),
    limit: int = Query(100, ge=1, le=500, description="Límite máximo de resultados por página"),
    tipo_combustible: Optional[str] = Query(None, description="Filtrar por propulsión: ELECTRICO, GNV, HIBRIDO, DIESEL"),
    estado: Optional[str] = Query(None, description="Filtrar por estado: DISPONIBLE, EN_RUTA, MANTENIMIENTO, INACTIVO"),
    restriccion: Optional[str] = Query(None, description="Filtrar por restricción: LIBRE_CIRCULACION, RESTRINGIDO_CENTRO_HISTORICO, etc."),
    db: Session = Depends(get_db)
):
    return FleetService.get_vehiculos(
        db,
        skip=skip,
        limit=limit,
        tipo_combustible=tipo_combustible,
        estado=estado,
        restriccion=restriccion
    )

@router.post(
    "/",
    response_model=VehiculoResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Registrar nuevo vehículo (SUB-001-02, RF-001, US-001)",
    description="Registra una nueva unidad validando placa duplicada (409), características técnicas/ambientales (SUB-001-05) y asignando automáticamente la restricción de circulación zonal (SUB-001-06)."
)
def create_vehiculo(
    vehiculo_in: VehiculoCreate,
    db: Session = Depends(get_db)
):
    return FleetService.create_vehiculo(db, vehiculo_in)

@router.get(
    "/{vehiculo_id}",
    response_model=VehiculoResponse,
    summary="Consultar vehículo por ID (SUB-001-03)",
    description="Obtiene el detalle completo de un vehículo a través de su identificador UUID."
)
def read_vehiculo_by_id(
    vehiculo_id: UUID = Path(..., description="Identificador único UUID del vehículo"),
    db: Session = Depends(get_db)
):
    return FleetService.get_vehiculo_by_id(db, vehiculo_id)

@router.get(
    "/placa/{placa}",
    response_model=VehiculoResponse,
    summary="Consultar vehículo por placa (SUB-001-03, SUB-001-04)",
    description="Busca una unidad vehicular por su número de placa oficial."
)
def read_vehiculo_by_placa(
    placa: str = Path(..., description="Número de placa oficial (ej. ABC-123)"),
    db: Session = Depends(get_db)
):
    vehiculo = FleetService.get_vehiculo_by_placa(db, placa)
    if not vehiculo:
        from fastapi import HTTPException
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Vehículo con placa {placa.upper()} no encontrado."
        )
    return vehiculo

@router.put(
    "/{vehiculo_id}",
    response_model=VehiculoResponse,
    summary="Actualizar vehículo integralmente (SUB-001-03)",
    description="Actualiza los atributos de una unidad y re-evalúa automáticamente sus restricciones de circulación."
)
def update_vehiculo(
    vehiculo_in: VehiculoUpdate,
    vehiculo_id: UUID = Path(..., description="UUID del vehículo a actualizar"),
    db: Session = Depends(get_db)
):
    return FleetService.update_vehiculo(db, vehiculo_id, vehiculo_in)

@router.patch(
    "/{vehiculo_id}",
    response_model=VehiculoResponse,
    summary="Actualización parcial de vehículo (SUB-001-03)",
    description="Modifica uno o varios campos técnicos, ambientales u operativos de la unidad."
)
def patch_vehiculo(
    vehiculo_in: VehiculoUpdate,
    vehiculo_id: UUID = Path(..., description="UUID del vehículo a modificar"),
    db: Session = Depends(get_db)
):
    return FleetService.update_vehiculo(db, vehiculo_id, vehiculo_in)

@router.delete(
    "/{vehiculo_id}",
    response_model=VehiculoResponse,
    summary="Dar de baja / inactivar vehículo (SUB-001-03)",
    description="Realiza la baja lógica de la unidad cambiando su estado a INACTIVO."
)
def delete_vehiculo(
    vehiculo_id: UUID = Path(..., description="UUID del vehículo a dar de baja"),
    db: Session = Depends(get_db)
):
    return FleetService.delete_vehiculo(db, vehiculo_id)
