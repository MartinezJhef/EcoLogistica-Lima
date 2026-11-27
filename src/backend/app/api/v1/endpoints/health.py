from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import text
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session
from app.db.session import get_db

router = APIRouter()

@router.get("/health", summary="Health Check del Backend")
def health_check(db: Session = Depends(get_db)):
    try:
        db.execute(text('SELECT 1'))
    except SQLAlchemyError:
        raise HTTPException(503, 'Base de datos no disponible') from None
    return {
        "status": "ONLINE",
        "service": "EcoLogistica-Lima Backend Core",
        "version": "1.0.0",
        "database": "PostgreSQL 16 + PostGIS"
    }
