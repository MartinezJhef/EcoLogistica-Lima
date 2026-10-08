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
    """Genera hash seguro SHA-256 para almacenamiento protegido."""
    return hashlib.sha256(plain_password.encode("utf-8")).hexdigest()

class UserService:
    @staticmethod
    def seed_initial_users(db: Session) -> None:
        """Inicializa cuentas de prueba representativas si la base está vacía."""
        count = db.query(Usuario).count()
        if count > 0:
            return

        initial_users = [
            Usuario(
                email="admin@ecologistica.pe",
                nombre_completo="Ing. Martín Valdivia (Administrador General)",
                telefono="991234567",
                password_hash=_hash_password("Admin2026*!"),
                rol=RolUsuario.ADMIN.value,
                permisos=PERMISOS_POR_DEFECTO[RolUsuario.ADMIN],
                estado=EstadoUsuario.ACTIVO.value
            ),
            Usuario(
                email="seguimiento@ecologistica.pe",
                nombre_completo="Lic. Carmen Rosales (Oficina y Seguimiento)",
                telefono="984556677",
                password_hash=_hash_password("Oficina2026*!"),
                rol=RolUsuario.OFICINA.value,
                permisos=PERMISOS_POR_DEFECTO[RolUsuario.OFICINA],
                estado=EstadoUsuario.ACTIVO.value
            ),
            Usuario(
                email="repartidor.juan@ecologistica.pe",
                nombre_completo="Juan Alberto Morales (Repartidor / Conductor)",
                telefono="999888777",
                password_hash=_hash_password("Reparto2026*!"),
                rol=RolUsuario.REPARTIDOR.value,
                permisos=PERMISOS_POR_DEFECTO[RolUsuario.REPARTIDOR],
                estado=EstadoUsuario.ACTIVO.value
            ),
            Usuario(
                email="cliente.sanjose@distrirapido.com",
                nombre_completo="Bodega San José · SJL (Cliente B2B)",
                telefono="987112233",
                password_hash=_hash_password("Cliente2026*!"),
                rol=RolUsuario.CLIENTE.value,
                permisos=PERMISOS_POR_DEFECTO[RolUsuario.CLIENTE],
                estado=EstadoUsuario.ACTIVO.value
            )
        ]

        db.add_all(initial_users)
        db.commit()

    @staticmethod
    def get_all(db: Session, rol: Optional[str] = None, estado: Optional[str] = None) -> List[Usuario]:
        UserService.seed_initial_users(db)
        query = db.query(Usuario)
        if rol:
            query = query.filter(Usuario.rol == rol.upper())
        if estado:
            query = query.filter(Usuario.estado == estado.upper())
        return query.order_by(Usuario.creado_en.desc()).all()

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
