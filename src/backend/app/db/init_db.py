import os
import sys
from sqlalchemy import text
from app.db.session import engine
from app.core.config import settings

def test_connection():
    """Verifica si la base de datos PostgreSQL está accesible."""
    try:
        with engine.connect() as conn:
            result = conn.execute(text("SELECT version();")).fetchone()
            print(f"[OK] Conexión exitosa a PostgreSQL:")
            print(f"     {result[0]}")
            
            # Verificar PostGIS
            try:
                gis = conn.execute(text("SELECT PostGIS_Version();")).fetchone()
                print(f"[OK] Extensión PostGIS habilitada: {gis[0]}")
            except Exception:
                print("[WARN] Extensión PostGIS no detectada. Se intentará habilitar en init.sql.")
            return True
    except Exception as e:
        print(f"[ERROR] No se pudo conectar a la base de datos en: {settings.POSTGRES_SERVER}:{settings.POSTGRES_PORT}")
        print(f"Detalle del error: {e}")
        return False

def init_database():
    """Ejecuta el archivo DDL init.sql en PostgreSQL sin necesidad de psql."""
    if not test_connection():
        print("\nPara conectar PostgreSQL, asegúrate de levantar el contenedor Docker:")
        print("  docker compose up -d db")
        print("O configurar la cadena de conexión en src/backend/.env")
        return False

    base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "..", ".."))
    sql_path = os.path.join(base_dir, "src", "database", "init.sql")

    if not os.path.exists(sql_path):
        print(f"[ERROR] No se encontró el archivo init.sql en: {sql_path}")
        return False

    print(f"\n[INFO] Ejecutando DDL desde: {sql_path}")
    with open(sql_path, "r", encoding="utf-8") as f:
        sql_content = f.read()

    try:
        with engine.connect() as conn:
            # Desactivar autocommit manual o usar raw connection para ejecutar scripts multi-statement
            raw_conn = conn.connection
            with raw_conn.cursor() as cursor:
                cursor.execute(sql_content)
            raw_conn.commit()
        print("[OK] Tablas, extensiones (pgcrypto, postgis), índices e integridad 3FN creados con éxito.")
        return True
    except Exception as e:
        print(f"[ERROR] Falló la ejecución de init.sql: {e}")
        return False

if __name__ == "__main__":
    init_database()
