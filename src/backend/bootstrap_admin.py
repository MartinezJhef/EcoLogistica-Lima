"""Run after applying the database migration. Never commits credentials to source control."""
import getpass
import sys
from app.db.session import SessionLocal
from app.models.conductor import Conductor
from app.models.usuario import Usuario
from app.core.auth import hash_password
from app.schemas.usuario import PERMISOS_POR_DEFECTO, RolUsuario

if __name__ == '__main__':
    email = input('Correo del administrador: ').strip().lower()
    password = getpass.getpass('Contraseña (12 caracteres mínimo): ')
    if len(password) < 12 or '@' not in email:
        sys.exit('Correo o contraseña no válidos')
    with SessionLocal() as db:
        if db.query(Usuario).filter(Usuario.email == email).first():
            sys.exit('La cuenta ya existe; no se modificó')
        db.add(Usuario(email=email, nombre_completo='Administrador', password_hash=hash_password(password),
            rol='ADMIN', permisos=PERMISOS_POR_DEFECTO[RolUsuario.ADMIN], estado='ACTIVO'))
        db.commit()
    print('Cuenta creada')
