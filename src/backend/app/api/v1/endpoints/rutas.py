from typing import List, Optional
from uuid import UUID
from datetime import date
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.services.routing_service import RoutingService
from app.schemas.ruta import (
    RutaOptimizarRequest,
    RutaOptimizarResponse,
    RutaDetalleResponse,
    ZonaRiesgoResponse,
    ReoptimizarRutaRequest,
    ReoptimizarRutaResponse
)

router = APIRouter()

@router.post(
    "/optimizar",
    response_model=RutaOptimizarResponse,
    status_code=status.HTTP_200_OK,
    summary="Optimizar Rutas de Reparto CVRPTW (US-005)"
)
def optimizar_rutas(
    request: RutaOptimizarRequest,
    db: Session = Depends(get_db)
):
    """
    US-005: Motor heurístico CVRPTW multiobjetivo (distancia, tiempo, CO2 vehicular y computacional).
    - Asigna pedidos a flota disponible respetando capacidades (RN-001: 85%-90%).
    - Inserta parada de 30 min por descanso técnico obligatorio ante >= 4.5h continuas (Ley N° 30224 / RN-004).
    - Desvía unidades diésel de la ZBE Centro Histórico (Ordenanza MML N° 2160).
    - Marca pedidos excedentes como 'No Asignados por Exceso de Capacidad'.
    - Mide emisiones computacionales con CodeCarbon.
    """
    return RoutingService.optimizar_rutas(db=db, request=request)

@router.get(
    "/zonas-riesgo",
    response_model=List[ZonaRiesgoResponse],
    summary="Consultar Catálogo de Zonas de Riesgo y ZBE de Lima (US-006)"
)
def get_zonas_riesgo(
    db: Session = Depends(get_db)
):
    """
    US-006: Devuelve los polígonos geoespaciales semitransparentes de seguridad urbana
    y la Zona de Bajas Emisiones (ZBE) para renderizado interactivo en el mapa.
    """
    return RoutingService.get_zonas_riesgo(db=db)

@router.get(
    "/",
    response_model=List[RutaDetalleResponse],
    summary="Listar Rutas Planificadas y Ejecutadas"
)
def listar_rutas(
    fecha: Optional[date] = Query(None, description="Filtrar por fecha de operación"),
    estado: Optional[str] = Query(None, description="Filtrar por estado (PLANIFICADA, EN_EJECUCION, COMPLETADA, CANCELADA)"),
    db: Session = Depends(get_db)
):
    """Obtiene la lista de rutas generadas."""
    return RoutingService.list_rutas(db=db, fecha=fecha, estado=estado)

@router.get(
    "/{ruta_id}",
    response_model=RutaDetalleResponse,
    summary="Consultar Detalle de Ruta y Paradas Secuenciales (US-006)"
)
def get_ruta_por_id(
    ruta_id: UUID,
    db: Session = Depends(get_db)
):
    """Obtiene el detalle de una ruta específica con sus tramos ordenados y métricas."""
    return RoutingService.get_ruta_by_id(db=db, ruta_id=ruta_id)

@router.post(
    "/{ruta_id}/reoptimizar",
    response_model=ReoptimizarRutaResponse,
    summary="Reoptimizar Ruta ante Eventos Dinámicos (US-007)"
)
def reoptimizar_ruta(
    ruta_id: UUID,
    request: ReoptimizarRutaRequest,
    db: Session = Depends(get_db)
):
    """
    US-007: Recálculo dinámico del recorrido ante contingencias viales
    (cancelaciones, pedidos urgentes o desvíos de seguridad).
    """
    return RoutingService.reoptimizar_ruta(db=db, ruta_id=ruta_id, request=request)

