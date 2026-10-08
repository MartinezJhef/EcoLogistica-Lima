from fastapi import APIRouter
from app.api.v1.endpoints import vehiculos, conductores, pedidos, health, usuarios, clientes

api_router = APIRouter()

api_router.include_router(health.router, tags=["Health"])
api_router.include_router(vehiculos.router, prefix="/vehiculos", tags=["Vehículos (US-001)"])
api_router.include_router(conductores.router, prefix="/conductores", tags=["Conductores (US-002)"])
api_router.include_router(pedidos.router, prefix="/pedidos", tags=["Pedidos (US-003)"])
api_router.include_router(usuarios.router, prefix="/usuarios", tags=["Administración de Usuarios y Roles (RBAC)"])
api_router.include_router(clientes.router, prefix="/clientes", tags=["Clientes y Comercios (B2B)"])
