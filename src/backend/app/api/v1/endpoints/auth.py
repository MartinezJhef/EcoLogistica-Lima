from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.usuario import Usuario
from app.schemas.usuario import UsuarioResponse
from app.core.auth import verify_password, hash_password, issue_token

router = APIRouter()

class Login(BaseModel):
    email: str = Field(max_length=255)
    password: str = Field(min_length=1, max_length=1024)

@router.post('/login')
def login(data: Login, db: Session = Depends(get_db)):
    user = db.query(Usuario).filter(Usuario.email == data.email.strip().lower()).first()
    if not user or user.estado != 'ACTIVO' or not verify_password(data.password, user.password_hash):
        raise HTTPException(401, 'Correo o contraseña incorrectos')
    if not user.password_hash.startswith('pbkdf2_sha256$'):
        user.password_hash = hash_password(data.password)
        db.commit()
    return {'access_token': issue_token(user), 'token_type': 'bearer', 'usuario': UsuarioResponse.model_validate(user)}
