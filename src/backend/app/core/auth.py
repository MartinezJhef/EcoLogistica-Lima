import base64
import hashlib
import hmac
import json
import os
import secrets
import time
from uuid import UUID
from fastapi import Depends, HTTPException, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.usuario import Usuario

bearer = HTTPBearer(auto_error=False)
_development_key = secrets.token_hex(32)


def hash_password(password):
    salt = secrets.token_hex(16)
    digest = hashlib.pbkdf2_hmac('sha256', password.encode(), salt.encode(), 600000).hex()
    return f'pbkdf2_sha256$600000${salt}${digest}'


def verify_password(password, encoded):
    try:
        if encoded.startswith('pbkdf2_sha256$'):
            _, count, salt, expected = encoded.split('$')
            actual = hashlib.pbkdf2_hmac('sha256', password.encode(), salt.encode(), int(count)).hex()
        elif len(encoded) == 64:
            expected, actual = encoded, hashlib.sha256(password.encode()).hexdigest()
        else:
            return False
        return hmac.compare_digest(actual, expected)
    except (ValueError, TypeError):
        return False


def _key():
    return (os.getenv('SECRET_KEY') or _development_key).encode()


def issue_token(user):
    payload = base64.urlsafe_b64encode(json.dumps({'sub': str(user.usuario_id), 'exp': int(time.time()) + 28800}).encode()).decode().rstrip('=')
    signature = hmac.new(_key(), payload.encode(), hashlib.sha256).hexdigest()
    return f'{payload}.{signature}'


def current_user(credentials: HTTPAuthorizationCredentials = Depends(bearer), db: Session = Depends(get_db)):
    try:
        if not credentials: raise ValueError()
        payload, signature = credentials.credentials.split('.')
        expected = hmac.new(_key(), payload.encode(), hashlib.sha256).hexdigest()
        if not hmac.compare_digest(expected, signature): raise ValueError()
        claims = json.loads(base64.urlsafe_b64decode(payload + '=' * (-len(payload) % 4)))
        if claims['exp'] <= time.time(): raise ValueError()
        user = db.get(Usuario, UUID(claims['sub']))
        if not user or user.estado != 'ACTIVO': raise ValueError()
        return user
    except (ValueError, KeyError, TypeError):
        raise HTTPException(401, 'Inicia sesión con una cuenta activa')


def require_permission(permission):
    def check(user=Depends(current_user)):
        if user.rol != 'ADMIN' and permission not in (user.permisos or []):
            raise HTTPException(403, 'Tu cuenta no tiene permiso para esta operación')
        return user
    return check
