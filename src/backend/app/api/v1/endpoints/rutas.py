from typing import List, Optional
from uuid import UUID
from datetime import date
from fastapi import APIRouter, Depends, Query, Response, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.services.routing_service import RoutingService
from app.core.auth import current_user, require_permission
from fastapi import HTTPException
from app.schemas.ruta import (
    RutaOptimizarRequest,
    RutaOptimizarResponse,
    RutaDetalleResponse,
    ZonaRiesgoResponse,
    ReoptimizarRutaRequest,
    ReoptimizarRutaResponse
)

router = APIRouter()

from pydantic import BaseModel
from typing import Literal

class ConfirmarRegreso(BaseModel):
    regreso_confirmado: Literal[True]

@router.post("/{ruta_id}/finalizar")
def finalizar_ruta(ruta_id: UUID, data: ConfirmarRegreso, db: Session = Depends(get_db), user=Depends(current_user)):
    from app.models.ruta import Ruta
    from app.models.pedido import Pedido
    from app.services.planning_service import enqueue
    route = db.query(Ruta).filter(Ruta.ruta_id == ruta_id).with_for_update(of=Ruta).first()
    if not route:
        raise HTTPException(404, "Ruta no encontrada")
    if user.rol not in ("ADMIN", "OFICINA") and route.conductor_id != user.conductor_id:
        raise HTTPException(403, "Solo puedes finalizar tu propia ruta")
    if route.estado == "COMPLETADA":
        return {"estado": "COMPLETADA"}
    if route.estado != "EN_EJECUCION" or db.query(Pedido).filter(Pedido.ruta_id == ruta_id,
            Pedido.estado.notin_(["ENTREGADO", "NO_ENTREGADO", "CANCELADO"])).first():
        raise HTTPException(409, "Hay entregas pendientes o la ruta no está en ejecución")
    route.estado = "COMPLETADA"
    enqueue(db, route, "REGRESO_A_DEPOSITO_CONFIRMADO")
    db.commit()
    return {"estado": "COMPLETADA"}


@router.get("/conductor/{conductor_id}/actualizaciones")
def actualizaciones_conductor(conductor_id: UUID, db: Session = Depends(get_db), user=Depends(current_user)):
    if user.rol not in ("ADMIN", "OFICINA") and user.conductor_id != conductor_id:
        raise HTTPException(403, "Solo puedes consultar tu propio itinerario")
    import json
    from app.models.route_update import RouteUpdate
    updates = db.query(RouteUpdate).filter(RouteUpdate.conductor_id == conductor_id,
        RouteUpdate.acknowledged_at.is_(None)).order_by(RouteUpdate.created_at, RouteUpdate.update_id).all()
    return [{"update_id": str(u.update_id), "motivo": u.motivo,
             "itinerario": json.loads(u.payload)} for u in updates]


@router.post("/conductor/{conductor_id}/actualizaciones/{update_id}/confirmar")
def confirmar_actualizacion(conductor_id: UUID, update_id: UUID, db: Session = Depends(get_db), user=Depends(current_user)):
    if user.rol not in ("ADMIN", "OFICINA") and user.conductor_id != conductor_id:
        raise HTTPException(403, "Solo puedes confirmar tu propio itinerario")
    from datetime import datetime, timezone
    from fastapi import HTTPException
    from app.models.route_update import RouteUpdate
    update = db.query(RouteUpdate).filter(RouteUpdate.update_id == update_id,
        RouteUpdate.conductor_id == conductor_id).first()
    if not update:
        raise HTTPException(404, "Actualización no encontrada para este conductor")
    update.acknowledged_at = update.acknowledged_at or datetime.now(timezone.utc)
    db.commit()
    return {"confirmada": True}

@router.post(
    "/optimizar",
    response_model=RutaOptimizarResponse,
    status_code=status.HTTP_200_OK,
    summary="Optimizar Rutas de Reparto CVRPTW (US-005)",
    dependencies=[Depends(require_permission("GESTION_CONDUCTORES"))]
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
    summary="Listar Rutas Planificadas y Ejecutadas (Paginado a 12 registros)"
)
def listar_rutas(
    response: Response,
    skip: int = Query(0, ge=0, description="Número de registros a omitir para paginación"),
    limit: int = Query(12, ge=1, le=500, description="Límite máximo por página (12 por defecto para Green IT)"),
    fecha: Optional[date] = Query(None, description="Filtrar por fecha de operación"),
    estado: Optional[str] = Query(None, description="Filtrar por estado (PLANIFICADA, EN_EJECUCION, COMPLETADA, CANCELADA)"),
    db: Session = Depends(get_db),
    user=Depends(current_user)
):
    """Obtiene la lista de rutas generadas paginadas a 12 registros con encabezado X-Total-Count."""
    own_id = user.conductor_id if user.rol == "REPARTIDOR" else None
    if user.rol == "REPARTIDOR" and not own_id:
        response.headers["X-Total-Count"] = "0"
        return []
    response.headers["X-Total-Count"] = str(
        RoutingService.count_rutas(db=db, fecha=fecha, estado=estado, conductor_id=own_id)
    )
    return RoutingService.list_rutas(db=db, skip=skip, limit=limit, fecha=fecha, estado=estado, conductor_id=own_id)

@router.get(
    "/{ruta_id}",
    response_model=RutaDetalleResponse,
    summary="Consultar Detalle de Ruta y Paradas Secuenciales (US-006)"
)
def get_ruta_por_id(
    ruta_id: UUID,
    db: Session = Depends(get_db), user=Depends(current_user)
):
    """Obtiene el detalle de una ruta específica con sus tramos ordenados y métricas."""
    detail = RoutingService.get_ruta_by_id(db=db, ruta_id=ruta_id)
    if user.rol == "REPARTIDOR" and detail.conductor_id != user.conductor_id:
        raise HTTPException(403, "Solo puedes consultar tu propia ruta")
    return detail

@router.post(
    "/{ruta_id}/reoptimizar",
    response_model=ReoptimizarRutaResponse,
    summary="Reoptimizar Ruta ante Eventos Dinámicos (US-007)",
    dependencies=[Depends(require_permission("GESTION_CONDUCTORES"))]
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

