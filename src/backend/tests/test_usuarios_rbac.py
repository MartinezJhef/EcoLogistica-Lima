import pytest
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_get_catalogo_permisos():
    response = client.get("/api/v1/usuarios/catalogo-permisos")
    assert response.status_code == 200
    data = response.json()
    assert "roles_disponibles" in data
    assert "catalogo_permisos" in data
    codigos_roles = [r["codigo"] for r in data["roles_disponibles"]]
    assert "ADMIN" in codigos_roles
    assert "OFICINA" in codigos_roles
    assert "REPARTIDOR" in codigos_roles
    assert "CLIENTE" in codigos_roles

def test_listar_usuarios():
    response = client.get("/api/v1/usuarios/")
    assert response.status_code == 200
    users = response.json()
    assert isinstance(users, list)
    assert len(users) >= 4  # Seed inicial

def test_crear_usuario_oficina_seguimiento():
    payload = {
        "email": "test.oficina@ecologistica.pe",
        "nombre_completo": "Test Analista Seguimiento",
        "telefono": "987654321",
        "rol": "OFICINA",
        "password": "Password123!"
    }
    response = client.post("/api/v1/usuarios/", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert data["email"] == "test.oficina@ecologistica.pe"
    assert data["rol"] == "OFICINA"
    assert "SEGUIMIENTO_RUTAS" in data["permisos"]
    assert data["estado"] == "ACTIVO"

def test_crear_usuario_email_duplicado():
    payload = {
        "email": "test.oficina@ecologistica.pe",
        "nombre_completo": "Duplicado Test",
        "password": "Password123!"
    }
    response = client.post("/api/v1/usuarios/", json=payload)
    assert response.status_code == 409
    assert "Ya existe un usuario registrado" in response.json()["detail"]

def test_actualizar_usuario_estado():
    # Obtener el usuario creado
    response = client.get("/api/v1/usuarios/?rol=OFICINA")
    assert response.status_code == 200
    users = response.json()
    test_user = [u for u in users if u["email"] == "test.oficina@ecologistica.pe"][0]
    user_id = test_user["usuario_id"]

    # Cambiar estado a BLOQUEADO
    update_res = client.put(f"/api/v1/usuarios/{user_id}", json={"estado": "BLOQUEADO"})
    assert update_res.status_code == 200
    assert update_res.json()["estado"] == "BLOQUEADO"

    # Limpiar eliminando el usuario de prueba
    del_res = client.delete(f"/api/v1/usuarios/{user_id}")
    assert del_res.status_code == 204
