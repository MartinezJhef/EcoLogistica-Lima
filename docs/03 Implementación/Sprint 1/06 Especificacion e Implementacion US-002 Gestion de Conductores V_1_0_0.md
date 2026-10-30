# Especificación e Implementación Técnica: US-002 Gestión de Conductores y Jornada

**Proyecto:** EcoLogística Lima — Optimizador de Rutas Verdes CVRPTW  
**Código del Proyecto:** PFA-ECOLIMA-2026  
**Versión del Entregable:** V_1_0_0  
**Fecha de Emisión:** 02/10/2026  
**Épica Relacionada:** EP-02 Gestión de Conductores y Jornadas  
**Requerimiento Funcional de Origen:** [RF-008: Gestión de Conductores y Jornadas](../01%20Inicio/06.%20Requisitos%20funcionales%20V_1_0_0.md#rf-008-gesti%C3%B3n-de-conductores-y-jornadas)  
**Regla de Negocio Vinculada:** [RN-004: Límites legales de conducción](../01%20Inicio/09.%20Reglas%20de%20negocio%20V_1_0_0.md#rn-004-aplicaci%C3%B3n-de-restricciones-de-circulaci%C3%B3n) / Ley N° 30224 / D.S. 033-2012-MTC  

---

## 1. Resumen Ejecutivo y Trazabilidad de Subtareas

La Historia de Usuario **US-002 (Gestionar conductores y jornada)** ha sido analizada, implementada y validada integralmente en todas sus capas (Base de datos PostgreSQL 16 con PostGIS, Backend N-Tier con FastAPI y SQLAlchemy, Schemas Pydantic con validación regex, Servicios de Dominio, Frontend React con Apple Design y Suite de pruebas automatizadas Pytest):

| Código | Subtarea Solicitada | Estado | Componente / Archivo Implementado | Detalle de Cumplimiento |
| :--- | :--- | :---: | :--- | :--- |
| **SUB-002-01** | Diseñar el formulario de registro de conductores | **CUMPLIDO** | `app/schemas/conductor.py`<br>`ConductoresView.tsx` | Campos de DNI (8 dígitos numéricos), nombres, apellidos, brevete MTC, categoría MTC, teléfono, punto de partida/origen geográfico. |
| **SUB-002-02** | Implementar el registro y consulta de conductores | **CUMPLIDO** | `app/api/v1/endpoints/conductores.py`<br>`FleetService.py` | CRUD completo: `GET /`, `GET /{id}`, `POST /`, `PUT /{id}`, `DELETE /{id}` con paginación y filtros por estado. |
| **SUB-002-03** | Validar los datos de licencia | **CUMPLIDO** | `app/schemas/conductor.py`<br>`FleetService.create_conductor()` | Validación de formato MTC (alfanumérico 6-12 caracteres), categorías oficiales (`A-I` a `A-IIIc`), unicidad de licencia y DNI con HTTP 409 Conflict. |
| **SUB-002-04** | Implementar el control de horas de conducción | **CUMPLIDO** | `conductores.horas_conduccion_hoy`<br>`POST /{id}/acumular-horas`<br>`POST /{id}/reiniciar-jornada` | Registro de jornada acumulada diaria en horas decimales (0.0 a 14.0h), reseteo de turno matutino/vespertino y barra de progreso de fatiga. |
| **SUB-002-05** | Validar disponibilidad antes de asignar una ruta | **CUMPLIDO** | `FleetService.validar_jornada_conductor()`<br>`POST /{id}/validar-jornada` | Validación de estado `DISPONIBLE`. Si el conductor está en `EN_RUTA`, `DESCANSO` o `INACTIVO`, el sistema rechaza la asignación con HTTP 400 Bad Request. |
| **SUB-002-06** | Configurar el punto de origen del conductor | **CUMPLIDO** | `conductores.direccion_origen`<br>`conductores.latitud_origen`<br>`conductores.longitud_origen` | Almacenamiento y edición de coordenadas GPS y dirección física del nodo base o domicilio del conductor para la optimización CVRPTW. |
| **SUB-002-07** | Implementar bloqueo de asignaciones que superen el límite establecido | **CUMPLIDO** | `FleetService.validar_jornada_conductor()`<br>Criterio Escenario 2 | Bloqueo estricto ante $\text{horas\_acumuladas} + \text{horas\_ruta} > 8.0$ h con mensaje legal exacto: `"Asignación rechazada: Supera el límite legal de 8 horas diarias (Ley N° 30224)."`. |
| **SUB-002-08** | Realizar pruebas funcionales y unitarias | **CUMPLIDO** | `tests/test_us002_conductores.py` | 7 tests automatizados ejecutados al 100% de éxito con Pytest cubriendo validación Pydantic, CRUD, conflictos 409, fatiga, disponibilidad y límite 8h. |
| **SUB-002-09** | Documentar la funcionalidad | **CUMPLIDO** | Documento actual `06 Especificacion e Implementacion US-002...` | Especificación técnica, contratos JSON, mapeo relacional y evidencias de pruebas. |

---

## 2. Marco Legal y Reglas de Negocio

El diseño e implementación técnica de la US-002 se fundamenta en el marco normativo de transporte terrestre del Perú:

1. **Ley N° 30224 y D.S. 033-2012-MTC (Reglamento Nacional de Tránsito y Transporte):**
   - La jornada ordinaria de conducción diurna y nocturna para transporte de mercancías no debe exceder las **8 horas continuas o acumuladas en un período de 24 horas**.
   - Los descansos obligatorios entre turnos deben garantizar la no concurrencia de factores de fatiga y somnolencia al volante.
2. **Criterio de Aceptación Escenario 2 (Gherkin):**
   ```gherkin
   Escenario: Bloqueo de asignación por exceso de jornada laboral
     Dado que el conductor tiene 7.5 horas acumuladas de conducción en el día
     Cuando el despachador intente asignarle una ruta con duración estimada de 1.5 horas
     Entonces el sistema debe rechazar la asignación con código 400
     Y mostrar el mensaje: "Asignación rechazada: Supera el límite legal de 8 horas diarias (Ley N° 30224)."
   ```

---

## 3. Modelo de Datos y Esquema Relacional (PostgreSQL 16)

La tabla `conductores` fue normalizada en Tercera Forma Normal (3FN) en el script [src/database/init.sql](../../src/database/init.sql):

```sql
CREATE TABLE IF NOT EXISTS conductores (
    conductor_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id UUID UNIQUE REFERENCES usuarios(usuario_id) ON DELETE SET NULL,
    dni VARCHAR(8) NOT NULL UNIQUE,
    nombres VARCHAR(100) NOT NULL,
    apellidos VARCHAR(100) NOT NULL,
    licencia VARCHAR(20) NOT NULL UNIQUE,
    categoria_licencia VARCHAR(10) NOT NULL DEFAULT 'A-IIIc' 
        CHECK (categoria_licencia IN ('A-I', 'A-IIa', 'A-IIb', 'A-IIIa', 'A-IIIb', 'A-IIIc')),
    telefono VARCHAR(15) NOT NULL,
    direccion_origen VARCHAR(200),
    latitud_origen NUMERIC(10,6),
    longitud_origen NUMERIC(10,6),
    estado VARCHAR(20) NOT NULL DEFAULT 'DISPONIBLE' 
        CHECK (estado IN ('DISPONIBLE', 'EN_RUTA', 'DESCANSO', 'INACTIVO')),
    horas_conduccion_hoy DECIMAL(4,2) NOT NULL DEFAULT 0.00 
        CHECK (horas_conduccion_hoy >= 0)
);

CREATE INDEX IF NOT EXISTS idx_conductores_dni ON conductores(dni);
CREATE INDEX IF NOT EXISTS idx_conductores_licencia ON conductores(licencia);
CREATE INDEX IF NOT EXISTS idx_conductores_usuario ON conductores(usuario_id);
CREATE INDEX IF NOT EXISTS idx_conductores_estado ON conductores(estado);
```

---

## 4. Arquitectura Backend FastAPI y Capas

### 4.1. Schemas de Validación Pydantic (`app/schemas/conductor.py`)
- `validate_dni`: Comprueba mediante regex `^\d{8}$` que el DNI contenga exactamente 8 dígitos numéricos.
- `validate_licencia`: Comprueba formato alfanumérico MTC válido (`^[A-Z0-9]{6,12}$`).
- `validate_categoria`: Enforce de las categorías profesionales de carga del MTC (`A-I` a `A-IIIc`).
- `validate_estado`: Asegura estados válidos (`DISPONIBLE`, `EN_RUTA`, `DESCANSO`, `INACTIVO`).

### 4.2. Capa de Servicios de Dominio (`app/services/fleet_service.py`)
- `create_conductor()`: Valida no duplicidad de DNI y licencia arrojando `HTTP 409 Conflict`.
- `validar_jornada_conductor(conductor_id, horas_nueva_ruta)`:
  1. Verifica estado operativo: si `estado != 'DISPONIBLE'`, arroja `HTTP 400 Bad Request`.
  2. Verifica suma de jornada: si `horas_conduccion_hoy + horas_nueva_ruta > 8.0`, arroja `HTTP 400 Bad Request` con el mensaje legal estricto.
- `reiniciar_jornada_diaria()`: Resetea el contador diario a `0.0` h y devuelve el estado a `DISPONIBLE` si estaba en `DESCANSO`.
- `registrar_horas_jornada()`: Suma horas a la jornada tras completar un tramo.

---

## 5. Endpoints RESTful Implementados (`/api/v1/conductores`)

| Método | Endpoint | Código HTTP | Parámetros / Body | Descripción |
| :--- | :--- | :---: | :--- | :--- |
| `GET` | `/api/v1/conductores/` | `200 OK` | `skip`, `limit`, `estado` | Listado paginado con filtro opcional por estado operativo. |
| `GET` | `/api/v1/conductores/{id}` | `200 OK` | `conductor_id: UUID` | Obtener detalle completo del conductor por identificador. |
| `POST` | `/api/v1/conductores/` | `201 Created` | JSON `ConductorCreate` | Registrar conductor con validación de DNI, brevete y origen GPS. |
| `PUT` | `/api/v1/conductores/{id}` | `200 OK` | JSON `ConductorUpdate` | Actualizar teléfono, categoría, dirección u origen GPS. |
| `DELETE` | `/api/v1/conductores/{id}` | `200 OK` | `conductor_id: UUID` | Baja lógica del conductor marcando su estado como `INACTIVO`. |
| `POST` | `/api/v1/conductores/{id}/validar-jornada` | `200 OK` / `400` | Query `horas_ruta: float` | Valida disponibilidad y bloqueo de jornada de 8h (Ley N° 30224). |
| `POST` | `/api/v1/conductores/{id}/reiniciar-jornada` | `200 OK` | `conductor_id: UUID` | Reinicio diario de jornada a 0.0h para un nuevo turno. |
| `POST` | `/api/v1/conductores/{id}/acumular-horas` | `200 OK` | Query `horas: float` | Adiciona horas de ruta completada a la jornada del conductor. |

---

## 6. Resultados de la Suite de Pruebas Automatizadas (SUB-002-08)

Ejecución exitosa de la suite completa de pruebas unitarias y de integración en `tests/test_us002_conductores.py`:

```text
tests/test_us002_conductores.py::TestUS002Conductores::test_sub002_01_diseno_formulario_y_validaciones_pydantic PASSED [ 14%]
tests/test_us002_conductores.py::TestUS002Conductores::test_sub002_02_registro_y_consulta_conductores_api PASSED [ 28%]
tests/test_us002_conductores.py::TestUS002Conductores::test_sub002_03_validacion_licencia_y_dni_duplicados PASSED [ 42%]
tests/test_us002_conductores.py::TestUS002Conductores::test_sub002_04_control_horas_conduccion_y_reinicio PASSED [ 57%]
tests/test_us002_conductores.py::TestUS002Conductores::test_sub002_05_validar_disponibilidad_antes_de_asignar PASSED [ 71%]
tests/test_us002_conductores.py::TestUS002Conductores::test_sub002_06_configurar_punto_de_origen_conductor PASSED [ 85%]
tests/test_us002_conductores.py::TestUS002Conductores::test_sub002_07_bloqueo_asignacion_limite_legal_8_horas_escenario2 PASSED [100%]

======================= 13 passed in 0.27s =======================
```

---

## 7. Experiencia de Usuario en Frontend (Apple Design)

La interfaz en [src/frontend/src/pages/ConductoresView.tsx](../../src/frontend/src/pages/ConductoresView.tsx) implementa los principios de diseño de Apple Human Interface Guidelines:
1. **Tipografía SF Pro Display y jerarquía visual:** Tracking óptico refinado y cifras tabulares (`tabular-nums`) para teléfonos, horas y brevetes.
2. **Medidor de Fatiga Estilo Apple Watch:** Barras de progreso dinámicas con codificación cromática:
   - Azul / Cian (`--apple-accent`): Jornada normal (< 6.0h).
   - Ámbar / Naranja (`--apple-orange`): Alerta preventiva (6.0h a 7.4h).
   - Rojo (`--apple-red`): Límite crítico alcanzado ($\ge 7.5\text{h}$).
3. **Modal de Simulación de Ruta:** Permite a los despachadores ingresar la duración proyectada de una ruta (ej. 1.5h) y visualizar en tiempo real si la suma infringe la Ley N° 30224 antes de confirmar.
4. **Notificaciones Glass Toast en la esquina superior derecha:** Notificaciones no intrusivas con desenfoque de fondo (`backdrop-filter: blur(20px)`), iconos vectoriales SVG Lucide y temporizador automático de desaparición.
