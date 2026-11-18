import hashlib
from typing import List, Optional
from uuid import UUID
from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from app.models.usuario import Usuario
from app.schemas.usuario import (
    UsuarioCreate,
    UsuarioUpdate,
    PERMISOS_POR_DEFECTO,
    RolUsuario,
    EstadoUsuario
)

def _hash_password(plain_password: str) -> str:
    from app.core.auth import hash_password
    return hash_password(plain_password)

class UserService:
    @staticmethod
    def validate_driver_link(db, driver_id, user_id=None):
        if not driver_id:
            return
        from app.models.conductor import Conductor
        if not db.get(Conductor, driver_id):
            raise HTTPException(422, "El conductor seleccionado no existe")
        existing = db.query(Usuario).filter(Usuario.conductor_id == driver_id)
        if user_id:
            existing = existing.filter(Usuario.usuario_id != user_id)
        if existing.first():
            raise HTTPException(409, "Ese conductor ya está vinculado a otra cuenta")

    @staticmethod
    def count(db: Session, rol: Optional[str] = None, estado: Optional[str] = None) -> int:
        """Cuenta el total de usuarios según los filtros dados para paginación Green IT."""
        query = db.query(Usuario)
        if rol:
            query = query.filter(Usuario.rol == rol.upper())
        if estado:
            query = query.filter(Usuario.estado == estado.upper())
        return query.count()

    @staticmethod
    def get_all(
        db: Session,
        skip: int = 0,
        limit: int = 12,
        rol: Optional[str] = None,
        estado: Optional[str] = None
    ) -> List[Usuario]:
        """Obtiene usuarios paginados a 12 registros por página para minimizar transferencia de red."""
        query = db.query(Usuario)
        if rol:
            query = query.filter(Usuario.rol == rol.upper())
        if estado:
            query = query.filter(Usuario.estado == estado.upper())
        return query.order_by(Usuario.creado_en.desc()).offset(skip).limit(limit).all()

    @staticmethod
    def get_by_id(db: Session, usuario_id: UUID) -> Usuario:
        user = db.query(Usuario).filter(Usuario.usuario_id == usuario_id).first()
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Usuario no encontrado en la plataforma."
            )
        return user

    @staticmethod
    def create(db: Session, user_in: UsuarioCreate) -> Usuario:
        UserService.validate_driver_link(db, user_in.conductor_id)
        # Verificar email duplicado
        existente = db.query(Usuario).filter(Usuario.email == user_in.email.lower()).first()
        if existente:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"Ya existe un usuario registrado con el correo: {user_in.email}"
            )

        # Si no se definieron permisos específicos, aplicar la plantilla del rol seleccionado
        permisos_finales = user_in.permisos
        if not permisos_finales or len(permisos_finales) == 0:
            permisos_finales = PERMISOS_POR_DEFECTO.get(user_in.rol, [])

        nuevo = Usuario(
            conductor_id=user_in.conductor_id,
            email=user_in.email.lower(),
            nombre_completo=user_in.nombre_completo.strip(),
            telefono=user_in.telefono.strip() if user_in.telefono else None,
            password_hash=_hash_password(user_in.password),
            rol=user_in.rol.value,
            permisos=permisos_finales,
            estado=user_in.estado.value
        )
        db.add(nuevo)
        db.commit()
        db.refresh(nuevo)
        return nuevo

    @staticmethod
    def update(db: Session, usuario_id: UUID, user_in: UsuarioUpdate) -> Usuario:
        user = UserService.get_by_id(db, usuario_id)

        if "conductor_id" in user_in.model_fields_set:
            UserService.validate_driver_link(db, user_in.conductor_id, usuario_id)
            user.conductor_id = user_in.conductor_id

        if user_in.nombre_completo is not None:
            user.nombre_completo = user_in.nombre_completo.strip()
        if user_in.telefono is not None:
            user.telefono = user_in.telefono.strip() if user_in.telefono else None
        if user_in.rol is not None:
            user.rol = user_in.rol.value
            # Si se actualizó el rol y no se enviaron permisos explícitos, sincronizar plantilla
            if user_in.permisos is None:
                user.permisos = PERMISOS_POR_DEFECTO.get(user_in.rol, user.permisos)
        if user_in.permisos is not None:
            user.permisos = user_in.permisos
        if user_in.estado is not None:
            user.estado = user_in.estado.value
        if user_in.password:
            user.password_hash = _hash_password(user_in.password)

        db.commit()
        db.refresh(user)
        return user

    @staticmethod
    def delete(db: Session, usuario_id: UUID) -> None:
        user = UserService.get_by_id(db, usuario_id)
        db.delete(user)
        db.commit()
