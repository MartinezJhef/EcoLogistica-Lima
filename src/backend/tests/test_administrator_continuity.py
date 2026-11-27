import pytest
from fastapi import HTTPException
from sqlalchemy import create_engine
from sqlalchemy.orm import Session
from app.models.usuario import Usuario
from app.schemas.usuario import UsuarioUpdate
from app.services.user_service import UserService


@pytest.fixture
def accounts():
    engine = create_engine('sqlite://')
    Usuario.__table__.create(engine)
    with Session(engine) as db:
        def add(email, role='ADMIN', state='ACTIVO'):
            user = Usuario(email=email, nombre_completo='Cuenta de prueba',
                           password_hash='unused-test-only', rol=role, estado=state, permisos=[])
            db.add(user)
            db.commit()
            return user
        yield db, add
    engine.dispose()


@pytest.mark.parametrize('change', [dict(rol='OFICINA'), dict(estado='BLOQUEADO'), dict(estado='INACTIVO'), None])
def test_last_active_admin_cannot_be_removed(accounts, change):
    db, add = accounts
    admin = add('admin@example.test')
    add('inactive@example.test', state='INACTIVO')
    with pytest.raises(HTTPException) as rejected:
        if change is None:
            UserService.delete(db, admin.usuario_id)
        else:
            UserService.update(db, admin.usuario_id, UsuarioUpdate(**change))
    assert rejected.value.status_code == 409
    db.refresh(admin)
    assert (admin.rol, admin.estado) == ('ADMIN', 'ACTIVO')


def test_admin_can_be_replaced_and_regular_updates_still_work(accounts):
    db, add = accounts
    first = add('first@example.test')
    second = add('second@example.test')
    UserService.update(db, first.usuario_id, UsuarioUpdate(rol='OFICINA'))
    UserService.update(db, second.usuario_id, UsuarioUpdate(nombre_completo='Nombre actualizado'))
    assert second.nombre_completo == 'Nombre actualizado'
    UserService.delete(db, first.usuario_id)
    assert db.get(Usuario, second.usuario_id).estado == 'ACTIVO'
