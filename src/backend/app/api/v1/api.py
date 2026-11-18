from fastapi import APIRouter, Depends
from app.core.auth import require_permission
from app.api.v1.endpoints import auth, mobile
from app.api.v1.endpoints import (
    vehiculos,
    conductores,
    pedidos,
    health,
    usuarios,
    clientes,
    rutas
)

api_router = APIRouter()
api_router.include_router(auth.router, prefix="/auth", tags=["Autenticación"])
api_router.include_router(mobile.router, prefix="/mobile", tags=["Aplicación móvil"])

api_router.include_router(health.router, tags=["Health"])
api_router.include_router(vehiculos.router, dependencies=[Depends(require_permission("GESTION_FLOTA"))], prefix="/vehiculos", tags=["Vehículos (US-001)"])
api_router.include_router(conductores.router, dependencies=[Depends(require_permission("GESTION_CONDUCTORES"))], prefix="/conductores", tags=["Conductores (US-002)"])
api_router.include_router(pedidos.router, dependencies=[Depends(require_permission("REGISTRO_PEDIDOS"))], prefix="/pedidos", tags=["Pedidos (US-003 / US-004)"])
api_router.include_router(rutas.router, dependencies=[Depends(require_permission("SEGUIMIENTO_RUTAS"))], prefix="/rutas", tags=["Rutas y Optimización CVRPTW (US-005 / US-006 / US-007)"])
api_router.include_router(usuarios.router, dependencies=[Depends(require_permission("ADMIN_USUARIOS"))], prefix="/usuarios", tags=["Administración de Usuarios y Roles (RBAC)"])
api_router.include_router(clientes.router, dependencies=[Depends(require_permission("REGISTRO_PEDIDOS"))], prefix="/clientes", tags=["Clientes y Comercios (B2B)"])
