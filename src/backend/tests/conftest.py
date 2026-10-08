import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool
from fastapi.testclient import TestClient

from main import app
from app.db.session import Base, get_db
from app.models.vehiculo import Vehiculo
from app.models.conductor import Conductor
from app.models.usuario import Usuario

# Motor SQLite en memoria compartido para todas las pruebas unitarias e integrales
engine_test = create_engine(
    "sqlite:///:memory:",
    connect_args={"check_same_thread": False},
    poolclass=StaticPool
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine_test)

# Crear tablas del dominio evaluado
Vehiculo.__table__.create(bind=engine_test, checkfirst=True)
Conductor.__table__.create(bind=engine_test, checkfirst=True)
Usuario.__table__.create(bind=engine_test, checkfirst=True)

def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db

@pytest.fixture(scope="session")
def client():
    return TestClient(app)

@pytest.fixture(scope="function")
def db_session():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()
