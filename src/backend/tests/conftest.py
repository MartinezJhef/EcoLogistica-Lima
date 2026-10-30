import pytest
import re
import shapely.wkt
import shapely.wkb
from sqlalchemy import create_engine, event
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool
from sqlalchemy.ext.compiler import compiles
from geoalchemy2 import Geometry
from geoalchemy2.admin.dialects import sqlite
from fastapi.testclient import TestClient

# Adaptar tipos espaciales para ejecución en SQLite en memoria durante tests
@compiles(Geometry, 'sqlite')
def compile_geometry_sqlite(type_, compiler, **kw):
    return "TEXT"

sqlite.after_create = lambda *args, **kwargs: None
sqlite.before_create = lambda *args, **kwargs: None

from main import app
from app.db.session import Base, get_db
from app.models.vehiculo import Vehiculo
from app.models.conductor import Conductor
from app.models.usuario import Usuario
from app.models.deposito import Deposito
from app.models.pedido import Pedido
from app.models.ruta import Ruta
from app.models.tramo import Tramo
from app.models.zona_restringida import ZonaRestringida

def geom_from_ewkt_sqlite(ewkt_str):
    if not ewkt_str:
        return ewkt_str
    wkt_str = str(ewkt_str)
    srid = 4326
    if "SRID=" in wkt_str:
        m = re.match(r"SRID=(\d+);(.*)", wkt_str)
        if m:
            srid = int(m.group(1))
            wkt_str = m.group(2)
    geom = shapely.wkt.loads(wkt_str)
    return shapely.wkb.dumps(geom, hex=True, srid=srid)

# Motor SQLite en memoria compartido para todas las pruebas unitarias e integrales
engine_test = create_engine(
    "sqlite:///:memory:",
    connect_args={"check_same_thread": False},
    poolclass=StaticPool
)

@event.listens_for(engine_test, "connect")
def receive_connect(dbapi_connection, connection_record):
    dbapi_connection.create_function("GeomFromEWKT", 1, geom_from_ewkt_sqlite)
    dbapi_connection.create_function("AsEWKB", 1, lambda x: x)
    dbapi_connection.create_function("AsGeoJSON", 1, lambda x: x)

TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine_test)

# Crear tablas del dominio evaluado
Vehiculo.__table__.create(bind=engine_test, checkfirst=True)
Conductor.__table__.create(bind=engine_test, checkfirst=True)
Usuario.__table__.create(bind=engine_test, checkfirst=True)
Deposito.__table__.create(bind=engine_test, checkfirst=True)
Pedido.__table__.create(bind=engine_test, checkfirst=True)
Ruta.__table__.create(bind=engine_test, checkfirst=True)
Tramo.__table__.create(bind=engine_test, checkfirst=True)
ZonaRestringida.__table__.create(bind=engine_test, checkfirst=True)

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
