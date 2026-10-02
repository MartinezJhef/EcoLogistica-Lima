# Especificación e Implementación Técnica: US-001 Gestión de Vehículos de la Flota

**Proyecto:** EcoLogística Lima — Optimizador de Rutas Verdes CVRPTW  
**Código del Proyecto:** PFA-ECOLIMA-2026  
**Versión del Entregable:** V_1_0_0  
**Fecha de Emisión:** 02/10/2026  
**Épica Relacionada:** EP-01 Gestión de Vehículos  
**Requerimiento Funcional de Origen:** [RF-001: Gestión de Flota y Emisiones](../01%20Inicio/06.%20Requisitos%20funcionales%20V_1_0_0.md#rf-001-gesti%C3%B3n-de-flota-y-emisiones)  
**Regla de Negocio Vinculada:** [RN-004: Aplicación de restricciones de circulación](../01%20Inicio/09.%20Reglas%20de%20negocio%20V_1_0_0.md#rn-004-aplicaci%C3%B3n-de-restricciones-de-circulaci%C3%B3n)  

---

## 1. Resumen Ejecutivo y Trazabilidad de Subtareas

La Historia de Usuario **US-001 (Gestionar vehículos de la flota)** fue desglosada e implementada en su totalidad en la arquitectura backend del proyecto respetando el patrón modular por capas (API REST, Schemas Pydantic, Modelos SQLAlchemy, Servicios de Dominio y Base de Datos PostgreSQL 16 con extensión PostGIS).

| Código | Subtarea | Estado | Componente Implementado |
| :--- | :--- | :---: | :--- |
| **SUB-001-01** | Diseñar formulario de gestión de vehículos con campos obligatorios | **CUMPLIDO** | `VehiculoBase`, `VehiculoCreate` en `app/schemas/vehiculo.py` con validadores Pydantic. |
| **SUB-001-02** | Implementar registro de vehículos | **CUMPLIDO** | Endpoint `POST /api/v1/vehiculos/` y método `FleetService.create_vehiculo()` con respuesta < 1s. |
| **SUB-001-03** | Implementar la consulta y actualización de vehículos | **CUMPLIDO** | `GET /`, `GET /{id}`, `GET /placa/{placa}`, `PUT /{id}`, `PATCH /{id}`, `DELETE /{id}`. |
| **SUB-001-04** | Validar placas duplicadas | **CUMPLIDO** | Validación estricta con HTTP 409 y mensaje exacto: `"La placa ingresada ya se encuentra registrada en el sistema."`. |
| **SUB-001-05** | Registrar características técnicas y ambientales | **CUMPLIDO** | Atributos `marca_modelo`, `anio_fabricacion`, `capacidad_peso_kg`, `capacidad_volumen_m3`, `consumo_km_gal`, `tipo_combustible`, `factor_emision_co2`. |
| **SUB-001-06** | Implementar la asignación automática de restricciones de circulación | **CUMPLIDO** | Método `FleetService.determinar_restriccion_circulacion()` según normativa MML / ZBE Centro Histórico. |
| **SUB-001-07** | Realizar pruebas unitarias y de integración | **CUMPLIDO** | Suite `tests/test_us001_vehiculos.py` con 6 tests ejecutados al 100% de éxito con Pytest. |
| **SUB-001-08** | Documentar la funcionalidad | **CUMPLIDO** | Documento actual + especificación OpenAPI Swagger interactiva en `/docs`. |

---

## 2. Arquitectura de Capas Backend (FastAPI + SQLAlchemy)

### 2.1. Capa de Persistencia (PostgreSQL 16 + PostGIS)
La tabla `vehiculos` en el script [src/database/init.sql](../../src/database/init.sql) almacena las especificaciones técnicas y medioambientales de cada unidad:

```sql
CREATE TABLE IF NOT EXISTS vehiculos (
    vehiculo_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    placa VARCHAR(10) NOT NULL UNIQUE,
    marca_modelo VARCHAR(100) NOT NULL,
    anio_fabricacion INTEGER NOT NULL DEFAULT 2024 CHECK (anio_fabricacion >= 1990),
    capacidad_peso_kg DECIMAL(10,2) NOT NULL CHECK (capacidad_peso_kg > 0),
    capacidad_volumen_m3 DECIMAL(10,2) NOT NULL CHECK (capacidad_volumen_m3 > 0),
    consumo_km_gal DECIMAL(8,2) NOT NULL DEFAULT 35.00 CHECK (consumo_km_gal >= 0),
    tipo_combustible VARCHAR(30) NOT NULL CHECK (tipo_combustible IN ('DIESEL', 'GNV', 'ELECTRICO', 'HIBRIDO')),
    factor_emision_co2 DECIMAL(8,4) NOT NULL CHECK (factor_emision_co2 >= 0),
    restriccion_circulacion VARCHAR(100) NOT NULL DEFAULT 'LIBRE_CIRCULACION',
    estado VARCHAR(20) NOT NULL DEFAULT 'DISPONIBLE' CHECK (estado IN ('DISPONIBLE', 'EN_RUTA', 'MANTENIMIENTO', 'INACTIVO'))
);
```

### 2.2. Capa de Esquemas y Contratos de Validación (`app/schemas/vehiculo.py`)
- Valida la nomenclatura oficial de placa peruana mediante expresión regular: `^[A-Z0-9]{3}-?[A-Z0-9]{3,4}$`.
- Garantiza que los tipos de combustible pertenezcan a la matriz ecológica permitida: `['DIESEL', 'GNV', 'ELECTRICO', 'HIBRIDO']`.
- Aplica validación cruzada ambiental: Un vehículo tipificado como `ELECTRICO` no puede poseer emisiones directas superiores a `0.05 kg CO₂/km`.
- Provee esquemas segregados: `VehiculoCreate`, `VehiculoUpdate` y `VehiculoResponse`.

### 2.3. Capa de Lógica de Negocio (`app/services/fleet_service.py`)
Incorpora las reglas de negocio **RN-004** y **RF-001**:
1. **Regla de Asignación Automática de Restricciones Zonales:**
   - **`ELECTRICO`**: Cero emisiones. Se asigna automáticamente `LIBRE_CIRCULACION` (acceso irrestricto sin pico y placa ambiental).
   - **`GNV` / `HIBRIDO`**: Combustibles limpios de transición urbana. Se asigna `LIBRE_CIRCULACION`.
   - **`DIESEL`**: Se evalúa la antigüedad (`2026 - anio_fabricacion`). Si la antigüedad es mayor a 10 años o el factor de emisión es $\ge 0.24$ kg CO₂/km, se asigna `RESTRINGIDO_CENTRO_HISTORICO` (prohibición de ingreso a la Zona de Bajas Emisiones / Damero de Pizarro según Ordenanza MML N° 2160). Si es diésel moderno, se asigna `PICO_Y_PLACA_AMBIENTAL`.
2. **Validación de Placa Duplicada:** Verifica colisiones de placa indexada. Si ya existe, levanta una excepción `HTTP 409 Conflict` con el mensaje exacto exigido por los criterios BDD.
3. **Mantenimiento y Baja Lógica:** El borrado de una unidad no destruye la integridad referencial de los reportes históricos; aplica un soft-delete cambiando el estado a `INACTIVO`.

---

## 3. Endpoints RESTful Implementados (`/api/v1/vehiculos`)

| Método | Endpoint | Código HTTP | Descripción |
| :---: | :--- | :---: | :--- |
| `GET` | `/api/v1/vehiculos/` | `200 OK` | Listado paginado de flota con filtros (`tipo_combustible`, `estado`, `restriccion`). |
| `POST` | `/api/v1/vehiculos/` | `201 Created` | Alta de vehículo con asignación automática de restricciones y validación de duplicados. |
| `GET` | `/api/v1/vehiculos/{vehiculo_id}` | `200 OK` / `404` | Consulta de unidad por identificador UUID. |
| `GET` | `/api/v1/vehiculos/placa/{placa}` | `200 OK` / `404` | Consulta de unidad por placa oficial peruana. |
| `PUT` | `/api/v1/vehiculos/{vehiculo_id}` | `200 OK` / `409` | Actualización integral y re-cálculo de restricciones ambientales. |
| `PATCH` | `/api/v1/vehiculos/{vehiculo_id}` | `200 OK` / `409` | Actualización parcial de campos operativos o técnicos. |
| `DELETE` | `/api/v1/vehiculos/{vehiculo_id}` | `200 OK` | Baja lógica de la unidad (`estado = 'INACTIVO'`). |

---

## 4. Evidencia de Pruebas Unitarias y de Integración (SUB-001-07)

Se ejecutó la batería de pruebas automatizadas mediante `pytest` sobre el archivo [src/backend/tests/test_us001_vehiculos.py](../../src/backend/tests/test_us001_vehiculos.py):

```text
============================= test session starts =============================
platform win32 -- Python 3.13.0, pytest-9.1.1, pluggy-1.6.0
rootdir: C:\Users\HP\Desktop\DRIVE_MARTINEZ_2\ECOLOGITICA LIMA\src\backend
collected 6 items

tests/test_us001_vehiculos.py::TestUS001Vehiculos::test_sub001_01_diseno_formulario_y_validaciones_pydantic PASSED [ 16%]
tests/test_us001_vehiculos.py::TestUS001Vehiculos::test_sub001_02_registro_vehiculo_tiempo_respuesta PASSED         [ 33%]
tests/test_us001_vehiculos.py::TestUS001Vehiculos::test_sub001_04_validacion_placa_duplicada PASSED                [ 50%]
tests/test_us001_vehiculos.py::TestUS001Vehiculos::test_sub001_06_asignacion_automatica_restricciones_circulacion PASSED [ 66%]
tests/test_us001_vehiculos.py::TestUS001Vehiculos::test_sub001_03_consulta_por_id_y_placa PASSED                   [ 83%]
tests/test_us001_vehiculos.py::TestUS001Vehiculos::test_sub001_03_actualizacion_y_baja_logica PASSED                [100%]

============================== 6 passed in 2.77s ==============================
```
