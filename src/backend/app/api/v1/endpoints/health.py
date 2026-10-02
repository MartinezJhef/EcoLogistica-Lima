from fastapi import APIRouter

router = APIRouter()

@router.get("/health", summary="Health Check del Backend")
def health_check():
    return {
        "status": "ONLINE",
        "service": "EcoLogistica-Lima Backend Core",
        "version": "1.0.0",
        "database": "PostgreSQL 16 + PostGIS"
    }
