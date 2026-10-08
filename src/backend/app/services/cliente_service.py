from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from typing import List, Optional
from uuid import UUID
from app.models.cliente import Cliente
from app.schemas.cliente import ClienteCreate, ClienteUpdate

class ClienteService:
    @staticmethod
    def get_clientes(
        db: Session,
        skip: int = 0,
        limit: int = 100,
        tipo_comercio: Optional[str] = None,
        estado: Optional[str] = None,
        distrito: Optional[str] = None
    ) -> List[Cliente]:
        query = db.query(Cliente)
        if tipo_comercio and tipo_comercio != "TODOS":
            query = query.filter(Cliente.tipo_comercio == tipo_comercio)
        if estado and estado != "TODOS":
            query = query.filter(Cliente.estado == estado)
        if distrito and distrito != "TODOS":
            query = query.filter(Cliente.distrito.ilike(f"%{distrito}%"))
        return query.order_by(Cliente.razon_social.asc()).offset(skip).limit(limit).all()

    @staticmethod
    def get_cliente_by_id(db: Session, cliente_id: UUID) -> Cliente:
        cliente = db.query(Cliente).filter(Cliente.cliente_id == cliente_id).first()
        if not cliente:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Cliente con ID '{cliente_id}' no encontrado en la base de datos."
            )
        return cliente

    @staticmethod
    def create_cliente(db: Session, cliente_in: ClienteCreate) -> Cliente:
        # Validación de duplicidad por número de documento (RUC/DNI)
        existing = db.query(Cliente).filter(
            Cliente.numero_documento == cliente_in.numero_documento.strip()
        ).first()
        if existing:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"El documento '{cliente_in.numero_documento}' ya se encuentra registrado para el cliente '{existing.razon_social}'."
            )

        db_cliente = Cliente(
            tipo_documento=cliente_in.tipo_documento,
            numero_documento=cliente_in.numero_documento.strip(),
            razon_social=cliente_in.razon_social.strip(),
            nombre_contacto=cliente_in.nombre_contacto.strip() if cliente_in.nombre_contacto else None,
            telefono=cliente_in.telefono.strip(),
            email=cliente_in.email.strip().lower() if cliente_in.email else None,
            direccion=cliente_in.direccion.strip(),
            distrito=cliente_in.distrito.strip(),
            latitud=cliente_in.latitud,
            longitud=cliente_in.longitud,
            tipo_comercio=cliente_in.tipo_comercio,
            ventana_entrega_inicio=cliente_in.ventana_entrega_inicio,
            ventana_entrega_fin=cliente_in.ventana_entrega_fin,
            restriccion_acceso=cliente_in.restriccion_acceso,
            estado=cliente_in.estado
        )
        db.add(db_cliente)
        db.commit()
        db.refresh(db_cliente)
        return db_cliente

    @staticmethod
    def update_cliente(db: Session, cliente_id: UUID, cliente_in: ClienteUpdate) -> Cliente:
        cliente = ClienteService.get_cliente_by_id(db, cliente_id)
        update_data = cliente_in.dict(exclude_unset=True)

        if "numero_documento" in update_data and update_data["numero_documento"]:
            doc = update_data["numero_documento"].strip()
            conflict = db.query(Cliente).filter(
                Cliente.numero_documento == doc,
                Cliente.cliente_id != cliente_id
            ).first()
            if conflict:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail=f"El documento '{doc}' ya está asignado a otro cliente."
                )

        for field, value in update_data.items():
            if value is not None:
                setattr(cliente, field, value)

        db.commit()
        db.refresh(cliente)
        return cliente

    @staticmethod
    def delete_cliente(db: Session, cliente_id: UUID) -> Cliente:
        cliente = ClienteService.get_cliente_by_id(db, cliente_id)
        cliente.estado = "INACTIVO"
        db.commit()
        db.refresh(cliente)
        return cliente
