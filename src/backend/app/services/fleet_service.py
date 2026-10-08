from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.models.vehiculo import Vehiculo
from app.models.conductor import Conductor
from app.schemas.vehiculo import VehiculoCreate, VehiculoUpdate
from app.schemas.conductor import ConductorCreate, ConductorUpdate
from uuid import UUID
from typing import List, Optional

class FleetService:
    @staticmethod
    def calcular_factor_emision(tipo_combustible: str, consumo_km_gal: Optional[float] = None) -> float:
        """
        Calcula el factor de emisión de CO2 (kg CO2 / km) a partir del rendimiento (km/galón).
        - GNV: 5.775 kg CO₂/galón equiv.
        - HIBRIDO: 4.200 kg CO₂/galón
        - DIESEL: 10.210 kg CO₂/galón
        """
        tipo = tipo_combustible.upper()
        if tipo == "ELECTRICO":
            return 0.0
        consumo = max(0.1, float(consumo_km_gal or 35.0))
        emision_galon = {
            "GNV": 5.775,
            "HIBRIDO": 4.200,
            "DIESEL": 10.210
        }.get(tipo, 8.500)
        return round(emision_galon / consumo, 4)

    @staticmethod
    def determinar_restriccion_circulacion(
        tipo_combustible: str,
        anio_fabricacion: int,
        factor_emision_co2: float
    ) -> str:
        """
        SUB-001-06 y Regla RN-004 / RF-001:
        Asignación automática de restricciones de circulación según normativa ambiental
        de Lima Metropolitana (Ordenanza MML N° 2160 y Zonas de Bajas Emisiones - ZBE).
        """
        tipo = tipo_combustible.upper()
        
        # 1. Cero Emisiones directas: Libre tránsito irrestricto
        if tipo == "ELECTRICO":
            return "LIBRE_CIRCULACION"
        
        # 2. Control de Altas Emisiones por Consumo Excesivo o Ineficiencia (ej. 1 km/gal -> 5.775 kg/km)
        # Si un vehículo emite >= 0.35 kg CO2/km, excede el umbral ZBE y queda restringido
        if factor_emision_co2 >= 0.35:
            return "RESTRINGIDO_CENTRO_HISTORICO"

        # 3. Flota Diésel: Evaluación estricta de emisiones y antigüedad (Lima Este / Centro Histórico)
        if tipo == "DIESEL":
            antiguedad = 2026 - anio_fabricacion
            # Si el vehículo tiene más de 10 años o factor de emisión >= 0.24 kg/km
            if antiguedad > 10 or factor_emision_co2 >= 0.24:
                return "RESTRINGIDO_CENTRO_HISTORICO"
            return "PICO_Y_PLACA_AMBIENTAL"

        # 4. Control de Emisiones Intermedias
        if factor_emision_co2 >= 0.24:
            return "PICO_Y_PLACA_AMBIENTAL"

        # 5. Combustibles limpios de transición (GNV / Híbridos) con consumo eficiente
        if tipo in ["GNV", "HIBRIDO"]:
            return "LIBRE_CIRCULACION"
        
        return "LIBRE_CIRCULACION"

    @staticmethod
    def get_vehiculos(
        db: Session,
        skip: int = 0,
        limit: int = 100,
        tipo_combustible: Optional[str] = None,
        estado: Optional[str] = None,
        restriccion: Optional[str] = None
    ) -> List[Vehiculo]:
        """SUB-001-03: Consulta y listado de flota con filtros opcionales."""
        query = db.query(Vehiculo)
        if tipo_combustible:
            query = query.filter(Vehiculo.tipo_combustible == tipo_combustible.upper())
        if estado:
            query = query.filter(Vehiculo.estado == estado.upper())
        if restriccion:
            query = query.filter(Vehiculo.restriccion_circulacion == restriccion.upper())
        return query.offset(skip).limit(limit).all()

    @staticmethod
    def get_vehiculo_by_id(db: Session, vehiculo_id: UUID) -> Vehiculo:
        """SUB-001-03: Consulta de vehículo por su identificador único UUID."""
        vehiculo = db.query(Vehiculo).filter(Vehiculo.vehiculo_id == vehiculo_id).first()
        if not vehiculo:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Vehículo con ID {vehiculo_id} no encontrado."
            )
        return vehiculo

    @staticmethod
    def get_vehiculo_by_placa(db: Session, placa: str) -> Optional[Vehiculo]:
        """SUB-001-04: Búsqueda indexada por placa vehicular normalizada."""
        placa_clean = placa.strip().upper()
        return db.query(Vehiculo).filter(Vehiculo.placa == placa_clean).first()

    @staticmethod
    def create_vehiculo(db: Session, vehiculo_in: VehiculoCreate) -> Vehiculo:
        """
        SUB-001-02, SUB-001-04, SUB-001-05, SUB-001-06:
        Registro de nueva unidad con validación de placa única, características
        técnicas/ambientales y asignación automática de restricción de circulación.
        """
        placa_normalizada = vehiculo_in.placa.strip().upper()
        
        # Validación Escenario 2 (US-001): Verificar placa duplicada
        existing = FleetService.get_vehiculo_by_placa(db, placa_normalizada)
        if existing:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="La placa ingresada ya se encuentra registrada en el sistema."
            )
        
        # SUB-001-06: Asignación automática de factor y restricción según consumo
        factor = vehiculo_in.factor_emision_co2
        if vehiculo_in.consumo_km_gal and (factor is None or factor in [0.165, 0.245, 0.12]):
            factor = FleetService.calcular_factor_emision(
                tipo_combustible=vehiculo_in.tipo_combustible,
                consumo_km_gal=vehiculo_in.consumo_km_gal
            )

        restriccion = vehiculo_in.restriccion_circulacion
        if not restriccion or factor >= 0.35:
            restriccion = FleetService.determinar_restriccion_circulacion(
                tipo_combustible=vehiculo_in.tipo_combustible,
                anio_fabricacion=vehiculo_in.anio_fabricacion,
                factor_emision_co2=factor
            )

        db_vehiculo = Vehiculo(
            placa=placa_normalizada,
            marca_modelo=vehiculo_in.marca_modelo,
            anio_fabricacion=vehiculo_in.anio_fabricacion,
            capacidad_peso_kg=vehiculo_in.capacidad_peso_kg,
            capacidad_volumen_m3=vehiculo_in.capacidad_volumen_m3,
            consumo_km_gal=vehiculo_in.consumo_km_gal,
            tipo_combustible=vehiculo_in.tipo_combustible,
            factor_emision_co2=factor,
            restriccion_circulacion=restriccion,
            estado=vehiculo_in.estado or "DISPONIBLE"
        )
        db.add(db_vehiculo)
        db.commit()
        db.refresh(db_vehiculo)
        return db_vehiculo

    @staticmethod
    def update_vehiculo(db: Session, vehiculo_id: UUID, vehiculo_in: VehiculoUpdate) -> Vehiculo:
        """
        SUB-001-03: Actualización de atributos técnicos, ambientales u operativos.
        Si se modifican combustible o año, recalcula restricciones automáticamente.
        """
        db_vehiculo = FleetService.get_vehiculo_by_id(db, vehiculo_id)

        update_data = vehiculo_in.model_dump(exclude_unset=True)

        # Si se modificó la placa, validar que no choque con otra unidad distinta
        if "placa" in update_data and update_data["placa"]:
            placa_nueva = update_data["placa"].strip().upper()
            if placa_nueva != db_vehiculo.placa:
                existente = FleetService.get_vehiculo_by_placa(db, placa_nueva)
                if existente:
                    raise HTTPException(
                        status_code=status.HTTP_409_CONFLICT,
                        detail="La placa ingresada ya se encuentra registrada en el sistema."
                    )
                db_vehiculo.placa = placa_nueva

        for campo, valor in update_data.items():
            if campo != "placa" and hasattr(db_vehiculo, campo):
                setattr(db_vehiculo, campo, valor)

        if "consumo_km_gal" in update_data and ("factor_emision_co2" not in update_data or update_data.get("factor_emision_co2") in [0.165, 0.245, 0.12]):
            db_vehiculo.factor_emision_co2 = FleetService.calcular_factor_emision(
                db_vehiculo.tipo_combustible,
                db_vehiculo.consumo_km_gal
            )

        # Si no se pasó restricción explícita o las emisiones superan el umbral ZBE:
        if "restriccion_circulacion" not in update_data or float(db_vehiculo.factor_emision_co2) >= 0.35:
            db_vehiculo.restriccion_circulacion = FleetService.determinar_restriccion_circulacion(
                tipo_combustible=db_vehiculo.tipo_combustible,
                anio_fabricacion=db_vehiculo.anio_fabricacion,
                factor_emision_co2=float(db_vehiculo.factor_emision_co2)
            )

        db.commit()
        db.refresh(db_vehiculo)
        return db_vehiculo

    @staticmethod
    def delete_vehiculo(db: Session, vehiculo_id: UUID) -> Vehiculo:
        """SUB-001-03: Baja lógica de la unidad marcándola como INACTIVO."""
        db_vehiculo = FleetService.get_vehiculo_by_id(db, vehiculo_id)
        db_vehiculo.estado = "INACTIVO"
        db.commit()
        db.refresh(db_vehiculo)
        return db_vehiculo

    # -------------------------------------------------------------------------
    # Gestión de Conductores y Jornada (US-002 / RF-008 / Ley N° 30224)
    # -------------------------------------------------------------------------
    @staticmethod
    def get_conductores(
        db: Session,
        skip: int = 0,
        limit: int = 100,
        estado: Optional[str] = None
    ) -> List[Conductor]:
        """SUB-002-02: Consulta y listado de conductores con filtro opcional por estado."""
        query = db.query(Conductor)
        if estado:
            query = query.filter(Conductor.estado == estado.upper())
        return query.offset(skip).limit(limit).all()

    @staticmethod
    def get_conductor_by_id(db: Session, conductor_id: UUID) -> Conductor:
        """SUB-002-02: Consulta de conductor por ID único."""
        conductor = db.query(Conductor).filter(Conductor.conductor_id == conductor_id).first()
        if not conductor:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Conductor con ID '{conductor_id}' no encontrado."
            )
        return conductor

    @staticmethod
    def get_conductor_by_dni(db: Session, dni: str) -> Optional[Conductor]:
        """SUB-002-02: Consulta de conductor por DNI."""
        return db.query(Conductor).filter(Conductor.dni == dni.strip()).first()

    @staticmethod
    def get_conductor_by_licencia(db: Session, licencia: str) -> Optional[Conductor]:
        """SUB-002-03: Consulta de conductor por número de licencia."""
        return db.query(Conductor).filter(Conductor.licencia == licencia.strip().upper()).first()

    @staticmethod
    def create_conductor(db: Session, conductor_in: ConductorCreate) -> Conductor:
        """
        SUB-002-01 / SUB-002-02 / SUB-002-03 / SUB-002-06:
        Registro de conductor con validación de no duplicidad de DNI y Licencia MTC,
        configuración del punto de origen geográfico y estado inicial.
        """
        dni_limpio = conductor_in.dni.strip()
        licencia_limpia = conductor_in.licencia.strip().upper()

        # Validación DNI único
        if FleetService.get_conductor_by_dni(db, dni_limpio):
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"El DNI '{dni_limpio}' ya se encuentra registrado en el sistema."
            )

        # Validación Licencia MTC única
        if FleetService.get_conductor_by_licencia(db, licencia_limpia):
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"El número de licencia '{licencia_limpia}' ya se encuentra registrado en el sistema."
            )

        db_conductor = Conductor(
            usuario_id=conductor_in.usuario_id,
            dni=dni_limpio,
            nombres=conductor_in.nombres.strip(),
            apellidos=conductor_in.apellidos.strip(),
            licencia=licencia_limpia,
            categoria_licencia=conductor_in.categoria_licencia or "A-IIIc",
            telefono=conductor_in.telefono.strip(),
            direccion_origen=conductor_in.direccion_origen,
            latitud_origen=conductor_in.latitud_origen,
            longitud_origen=conductor_in.longitud_origen,
            estado=conductor_in.estado or "DISPONIBLE",
            horas_conduccion_hoy=conductor_in.horas_conduccion_hoy or 0.0
        )
        db.add(db_conductor)
        db.commit()
        db.refresh(db_conductor)
        return db_conductor

    @staticmethod
    def update_conductor(db: Session, conductor_id: UUID, conductor_in: ConductorUpdate) -> Conductor:
        """
        SUB-002-02 / SUB-002-06:
        Actualización de datos laborales, origen GPS, teléfono o estado de jornada.
        """
        db_conductor = FleetService.get_conductor_by_id(db, conductor_id)
        update_data = conductor_in.model_dump(exclude_unset=True)

        for campo, valor in update_data.items():
            if hasattr(db_conductor, campo):
                setattr(db_conductor, campo, valor)

        db.commit()
        db.refresh(db_conductor)
        return db_conductor

    @staticmethod
    def delete_conductor(db: Session, conductor_id: UUID) -> Conductor:
        """SUB-002-02: Baja lógica del conductor marcándolo como INACTIVO."""
        db_conductor = FleetService.get_conductor_by_id(db, conductor_id)
        db_conductor.estado = "INACTIVO"
        db.commit()
        db.refresh(db_conductor)
        return db_conductor

    @staticmethod
    def validar_jornada_conductor(db: Session, conductor_id: UUID, horas_nueva_ruta: float) -> dict:
        """
        SUB-002-04 / SUB-002-05 / SUB-002-07:
        Validación integral previa a la asignación de ruta:
        1. SUB-002-05: El conductor debe encontrarse en estado 'DISPONIBLE'.
        2. SUB-002-07 / Regla RN-004 / Ley N° 30224 / D.S. 033-2012-MTC:
           Límite legal estricto de 8 horas acumuladas de conducción diaria.
        """
        conductor = FleetService.get_conductor_by_id(db, conductor_id)

        # SUB-002-05: Disponibilidad operativa
        if conductor.estado != "DISPONIBLE":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Conductor no disponible para asignación. Estado actual: '{conductor.estado}'. Solo se pueden asignar rutas a conductores en estado 'DISPONIBLE'."
            )

        # SUB-002-07 & Escenario 2: Límite legal 8 horas
        horas_acumuladas = float(conductor.horas_conduccion_hoy)
        horas_totales = horas_acumuladas + horas_nueva_ruta

        if horas_totales > 8.0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Asignación rechazada: Supera el límite legal de 8 horas diarias (Ley N° 30224)."
            )

        return {
            "conductor_id": conductor.conductor_id,
            "conductor_nombre": f"{conductor.nombres} {conductor.apellidos}",
            "estado_actual": conductor.estado,
            "horas_acumuladas_hoy": horas_acumuladas,
            "horas_solicitadas": round(float(horas_nueva_ruta), 2),
            "horas_proyectadas": round(horas_totales, 2),
            "limite_legal_horas": 8.0,
            "aprobado": True,
            "mensaje": "Asignación permitida dentro de los límites legales de jornada."
        }

    @staticmethod
    def reiniciar_jornada_diaria(db: Session, conductor_id: UUID) -> Conductor:
        """SUB-002-04: Reinicio de horas de conducción diaria (inicio de nuevo turno/día)."""
        conductor = FleetService.get_conductor_by_id(db, conductor_id)
        conductor.horas_conduccion_hoy = 0.0
        if conductor.estado == "DESCANSO":
            conductor.estado = "DISPONIBLE"
        db.commit()
        db.refresh(conductor)
        return conductor

    @staticmethod
    def registrar_horas_jornada(db: Session, conductor_id: UUID, horas_adicionales: float) -> Conductor:
        """SUB-002-04: Incremento de horas acumuladas tras completar o avanzar una ruta."""
        conductor = FleetService.get_conductor_by_id(db, conductor_id)
        nuevo_total = float(conductor.horas_conduccion_hoy) + horas_adicionales
        conductor.horas_conduccion_hoy = min(round(nuevo_total, 2), 14.0)
        if nuevo_total >= 8.0 and conductor.estado == "DISPONIBLE":
            conductor.estado = "DESCANSO"
        db.commit()
        db.refresh(conductor)
        return conductor

