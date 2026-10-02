from fastapi import APIRouter, Depends, status, Query, Body
from sqlalchemy.orm import Session
from typing import List, Optional
from uuid import UUID
from app.db.session import get_db
from app.schemas.conductor import (
    ConductorCreate,
    ConductorUpdate,
    ConductorResponse,
    ValidarJornadaResponse,
    ReiniciarJornadaResponse
)
from app.services.fleet_service import FleetService

router = APIRouter()

@router.get("/", response_model=List[ConductorResponse], summary="Listar conductores registrados (SUB-002-02)")
def read_conductores(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    estado: Optional[str] = Query(None, description="Filtrar por estado: DISPONIBLE, EN_RUTA, DESCANSO, INACTIVO"),
    db: Session = Depends(get_db)
):
    """Retorna la lista de conductores registrados con opción de filtrado por estado operativo."""
    return FleetService.get_conductores(db, skip=skip, limit=limit, estado=estado)

@router.get("/{conductor_id}", response_model=ConductorResponse, summary="Obtener conductor por ID (SUB-002-02)")
def read_conductor_by_id(conductor_id: UUID, db: Session = Depends(get_db)):
    """Obtiene el detalle completo de un conductor según su identificador único UUID."""
    return FleetService.get_conductor_by_id(db, conductor_id)

@router.post("/", response_model=ConductorResponse, status_code=status.HTTP_201_CREATED, summary="Registrar nuevo conductor (SUB-002-01 / SUB-002-02)")
def create_conductor(conductor_in: ConductorCreate, db: Session = Depends(get_db)):
    """
    Registra un nuevo conductor con validación de:
    - DNI peruano de 8 dígitos único
    - Licencia MTC única y categoría válida (A-I a A-IIIc)
    - Punto de origen/partida geográfico (dirección y coordenadas GPS)
    """
    return FleetService.create_conductor(db, conductor_in)

@router.put("/{conductor_id}", response_model=ConductorResponse, summary="Actualizar datos del conductor (SUB-002-02 / SUB-002-06)")
def update_conductor(conductor_id: UUID, conductor_in: ConductorUpdate, db: Session = Depends(get_db)):
    """Actualiza los datos laborales, punto de origen o estado de un conductor."""
    return FleetService.update_conductor(db, conductor_id, conductor_in)

@router.delete("/{conductor_id}", response_model=ConductorResponse, summary="Baja lógica de conductor (SUB-002-02)")
def delete_conductor(conductor_id: UUID, db: Session = Depends(get_db)):
    """Pasa al conductor al estado INACTIVO sin eliminar el histórico de viajes o incidencias."""
    return FleetService.delete_conductor(db, conductor_id)

@router.post("/{conductor_id}/validar-jornada", response_model=ValidarJornadaResponse, summary="Validar jornada máxima de 8 horas y disponibilidad (SUB-002-04 / SUB-002-05 / SUB-002-07)")
def check_conductor_jornada(
    conductor_id: UUID,
    horas_ruta: float = Query(..., gt=0.0, le=14.0, description="Duración estimada en horas de la ruta"),
    db: Session = Depends(get_db)
):
    """
    Valida si el conductor puede asumir una nueva ruta:
    1. Verifica que el estado sea 'DISPONIBLE'.
    2. Verifica que la suma de horas acumuladas hoy + horas de la nueva ruta no supere las 8.0 horas legales.
    Lanza HTTP 400 Bad Request si supera el límite legal o no está disponible.
    """
    resultado = FleetService.validar_jornada_conductor(db, conductor_id, horas_ruta)
    return resultado

@router.post("/{conductor_id}/reiniciar-jornada", response_model=ReiniciarJornadaResponse, summary="Reiniciar jornada diaria del conductor (SUB-002-04)")
def reset_conductor_jornada(conductor_id: UUID, db: Session = Depends(get_db)):
    """Reinicia a 0.00 las horas acumuladas del día para un nuevo turno o cambio de fecha."""
    conductor = FleetService.reiniciar_jornada_diaria(db, conductor_id)
    return {
        "conductor_id": conductor.conductor_id,
        "horas_conduccion_hoy": float(conductor.horas_conduccion_hoy),
        "mensaje": f"Jornada diaria del conductor {conductor.nombres} {conductor.apellidos} reiniciada exitosamente a 0.0 horas."
    }

@router.post("/{conductor_id}/acumular-horas", response_model=ConductorResponse, summary="Acumular horas tras completar ruta (SUB-002-04)")
def add_conductor_horas(
    conductor_id: UUID,
    horas: float = Query(..., gt=0.0, le=14.0, description="Horas a adicionar a la jornada"),
    db: Session = Depends(get_db)
):
    """Adiciona horas de conducción a la jornada acumulada del conductor."""
    return FleetService.registrar_horas_jornada(db, conductor_id, horas)
