from typing import List, Optional
from datetime import datetime
from uuid import UUID
from enum import Enum
from pydantic import BaseModel, EmailStr, Field

class RolUsuario(str, Enum):
    ADMIN = "ADMIN"
    OFICINA = "OFICINA"
    REPARTIDOR = "REPARTIDOR"
    CLIENTE = "CLIENTE"

class EstadoUsuario(str, Enum):
    ACTIVO = "ACTIVO"
    INACTIVO = "INACTIVO"
    BLOQUEADO = "BLOQUEADO"

# Catálogo oficial de permisos RBAC
PERMISOS_CATALOGO = [
    {
        "codigo": "ADMIN_USUARIOS",
        "modulo": "Administración",
        "nombre": "Gestión de Usuarios y Roles",
        "descripcion": "Crear, editar, bloquear usuarios y asignar permisos en el sistema."
    },
    {
        "codigo": "GESTION_FLOTA",
        "modulo": "Flota Vehicular",
        "nombre": "Administración de Vehículos",
        "descripcion": "Alta, edición y consulta de flota eco-amigable y factores de emisión."
    },
    {
        "codigo": "GESTION_CONDUCTORES",
        "modulo": "Conductores",
        "nombre": "Control de Choferes y Fatiga",
        "descripcion": "Padrón de conductores, validación de brevete MTC y límite de 8h de jornada."
    },
    {
        "codigo": "REGISTRO_PEDIDOS",
        "modulo": "Despacho",
        "nombre": "Registro y Geocodificación de Pedidos",
        "descripcion": "Captura de órdenes con coordenadas GPS, ventanas horarias y restricciones."
    },
    {
        "codigo": "SEGUIMIENTO_RUTAS",
        "modulo": "Oficina / Seguimiento",
        "nombre": "Monitoreo y Seguimiento de Rutas en Tiempo Real",
        "descripcion": "Supervisión del mapa de ruta, alertas de tráfico y control de pedidos."
    },
    {
        "codigo": "REPARTO_POD",
        "modulo": "Reparto en Campo",
        "nombre": "Gestión de Entregas y POD",
        "descripcion": "Hoja de ruta del conductor, actualización de estados y entrega digital."
    },
    {
        "codigo": "TRACKING_CLIENTE",
        "modulo": "Portal Cliente",
        "nombre": "Consulta de Tracking y Huella de Carbono",
        "descripcion": "Rastreo de envíos propios y visualización de CO2 mitigado."
    }
]

# Permisos por defecto asociados a cada Rol
PERMISOS_POR_DEFECTO = {
    RolUsuario.ADMIN: [
        "ADMIN_USUARIOS",
        "GESTION_FLOTA",
        "GESTION_CONDUCTORES",
        "REGISTRO_PEDIDOS",
        "SEGUIMIENTO_RUTAS",
        "REPARTO_POD",
        "TRACKING_CLIENTE"
    ],
    RolUsuario.OFICINA: [
        "GESTION_FLOTA",
        "GESTION_CONDUCTORES",
        "REGISTRO_PEDIDOS",
        "SEGUIMIENTO_RUTAS"
    ],
    RolUsuario.REPARTIDOR: [
        "REPARTO_POD",
        "SEGUIMIENTO_RUTAS"
    ],
    RolUsuario.CLIENTE: [
        "TRACKING_CLIENTE"
    ]
}

class UsuarioBase(BaseModel):
    email: str = Field(..., pattern=r"^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$", description="Correo institucional o corporativo del usuario")
    nombre_completo: str = Field(..., min_length=2, max_length=150, description="Nombre y apellidos del usuario")
    telefono: Optional[str] = Field(None, max_length=20, description="Número telefónico de contacto")
    rol: RolUsuario = Field(default=RolUsuario.OFICINA, description="Rol institucional en EcoLogística")
    permisos: Optional[List[str]] = Field(default=None, description="Permisos granulares asignados")
    estado: EstadoUsuario = Field(default=EstadoUsuario.ACTIVO, description="Estado del usuario en el sistema")

class UsuarioCreate(UsuarioBase):
    password: str = Field(..., min_length=6, description="Contraseña de acceso inicial")

class UsuarioUpdate(BaseModel):
    nombre_completo: Optional[str] = Field(None, min_length=2, max_length=150)
    telefono: Optional[str] = None
    rol: Optional[RolUsuario] = None
    permisos: Optional[List[str]] = None
    estado: Optional[EstadoUsuario] = None
    password: Optional[str] = Field(None, min_length=6)

class UsuarioResponse(BaseModel):
    usuario_id: UUID
    email: str
    nombre_completo: str
    telefono: Optional[str] = None
    rol: RolUsuario
    permisos: List[str]
    estado: EstadoUsuario
    creado_en: datetime

    class Config:
        from_attributes = True
