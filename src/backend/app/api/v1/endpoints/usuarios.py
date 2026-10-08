from typing import List, Optional
from uuid import UUID
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.schemas.usuario import (
    UsuarioCreate,
    UsuarioUpdate,
    UsuarioResponse,
    PERMISOS_CATALOGO,
    PERMISOS_POR_DEFECTO,
    RolUsuario
)
from app.services.user_service import UserService

router = APIRouter()

@router.get("/catalogo-permisos", tags=["Administración (Usuarios y Roles)"])
def get_catalogo_permisos():
    """Retorna el catálogo completo de permisos y plantillas por rol (RBAC)."""
    return {
        "roles_disponibles": [
            {
                "codigo": RolUsuario.ADMIN.value,
                "nombre": "Administrador General",
                "descripcion": "Acceso global total, gestión de usuarios, flotas, conductores y configuración de parámetros.",
                "permisos_default": PERMISOS_POR_DEFECTO[RolUsuario.ADMIN]
            },
            {
                "codigo": RolUsuario.OFICINA.value,
                "nombre": "Personal de Oficina / Seguimiento",
                "descripcion": "Seguimiento en vivo de despachos, asignación de conductores y gestión de órdenes con clientes.",
                "permisos_default": PERMISOS_POR_DEFECTO[RolUsuario.OFICINA]
            },
            {
                "codigo": RolUsuario.REPARTIDOR.value,
                "nombre": "Conductor / Repartidor",
                "descripcion": "Visualización de hojas de ruta, navegación GPS y registro de pruebas de entrega (POD).",
                "permisos_default": PERMISOS_POR_DEFECTO[RolUsuario.REPARTIDOR]
            },
            {
                "codigo": RolUsuario.CLIENTE.value,
                "nombre": "Cliente Final / Comerciante",
                "descripcion": "Rastreo de envíos propios en tiempo real, verificación de horario y certificado de ahorro de CO2.",
                "permisos_default": PERMISOS_POR_DEFECTO[RolUsuario.CLIENTE]
            }
        ],
        "catalogo_permisos": PERMISOS_CATALOGO
    }

@router.get("/", response_model=List[UsuarioResponse], tags=["Administración (Usuarios y Roles)"])
def listar_usuarios(
    rol: Optional[str] = Query(None, description="Filtrar por rol: ADMIN, OFICINA, REPARTIDOR, CLIENTE"),
    estado: Optional[str] = Query(None, description="Filtrar por estado: ACTIVO, INACTIVO, BLOQUEADO"),
    db: Session = Depends(get_db)
):
    """Lista todos los usuarios del sistema con sus roles y permisos asignados."""
    return UserService.get_all(db=db, rol=rol, estado=estado)

@router.post("/", response_model=UsuarioResponse, status_code=status.HTTP_201_CREATED, tags=["Administración (Usuarios y Roles)"])
def crear_usuario(
    usuario_in: UsuarioCreate,
    db: Session = Depends(get_db)
):
    """Registra un nuevo usuario asignándole rol y permisos específicos."""
    return UserService.create(db=db, user_in=usuario_in)

@router.get("/{usuario_id}", response_model=UsuarioResponse, tags=["Administración (Usuarios y Roles)"])
def obtener_usuario(
    usuario_id: UUID,
    db: Session = Depends(get_db)
):
    """Obtiene los detalles de un usuario por su identificador UUID."""
    return UserService.get_by_id(db=db, usuario_id=usuario_id)

@router.put("/{usuario_id}", response_model=UsuarioResponse, tags=["Administración (Usuarios y Roles)"])
def actualizar_usuario(
    usuario_id: UUID,
    usuario_in: UsuarioUpdate,
    db: Session = Depends(get_db)
):
    """Actualiza rol, permisos, datos o estado de un usuario."""
    return UserService.update(db=db, usuario_id=usuario_id, user_in=usuario_in)

@router.delete("/{usuario_id}", status_code=status.HTTP_204_NO_CONTENT, tags=["Administración (Usuarios y Roles)"])
def eliminar_usuario(
    usuario_id: UUID,
    db: Session = Depends(get_db)
):
    """Elimina permanentemente a un usuario del sistema."""
    UserService.delete(db=db, usuario_id=usuario_id)
    return None
