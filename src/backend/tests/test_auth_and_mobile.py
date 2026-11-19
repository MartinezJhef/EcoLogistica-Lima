from types import SimpleNamespace
import pytest
from app.core.auth import current_user, hash_password
from app.models.usuario import Usuario
from app.models.conductor import Conductor
from main import app
from uuid import uuid4

@pytest.fixture
def real_auth(db_session):
    previous = app.dependency_overrides.pop(current_user)
    user = Usuario(usuario_id=uuid4(), email=f'{uuid4()}@example.com', nombre_completo='Repartidor',
        password_hash=hash_password('UnaClaveDePrueba123'), rol='REPARTIDOR', permisos=['SEGUIMIENTO_RUTAS'], estado='ACTIVO')
    db_session.add(user); db_session.commit()
    yield user
    db_session.delete(user)
    db_session.commit()
    app.dependency_overrides[current_user] = previous

def test_login_rejects_wrong_password_and_missing_auth(client, real_auth):
    assert client.post('/api/v1/auth/login', json={'email':real_auth.email, 'password':'incorrecta'}).status_code == 401
    assert client.get('/api/v1/rutas/').status_code == 401

def test_authenticated_driver_cannot_see_another_driver_or_mutate_routes(client, real_auth):
    response = client.post('/api/v1/auth/login', json={'email':real_auth.email, 'password':'UnaClaveDePrueba123'})
    assert response.status_code == 200
    headers = {'Authorization':f'Bearer {response.json()["access_token"]}'}
    assert client.get(f'/api/v1/rutas/conductor/{uuid4()}/actualizaciones', headers=headers).status_code == 403
    assert client.post('/api/v1/rutas/optimizar', json={}, headers=headers).status_code == 403
    assert client.get('/api/v1/usuarios/', headers=headers).status_code == 403

def test_token_tampering_and_blocked_accounts_rejected(client, real_auth, db_session):
    response = client.post('/api/v1/auth/login', json={'email':real_auth.email, 'password':'UnaClaveDePrueba123'})
    token = response.json()['access_token']
    assert client.get('/api/v1/rutas/', headers={'Authorization':f'Bearer {token}bad'}).status_code == 401
    real_auth.estado = 'BLOQUEADO'; db_session.commit()
    assert client.get('/api/v1/rutas/', headers={'Authorization':f'Bearer {token}'}).status_code == 401
