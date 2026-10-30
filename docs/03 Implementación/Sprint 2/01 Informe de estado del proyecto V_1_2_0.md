# Revisión del sprint

**Nombre del Proyecto:** EcoLogística Lima – Plataforma Inteligente para la Optimización de Rutas Sostenibles de Última Milla (DistriRápido S.A.C.)

**Código Institucional:** PFA-ECOLIMA-2026

**Líder del Proyecto:** Zayuri Cerron Medina (Directora de Proyecto) / Jheferson Martinez Valerio (Scrum Master)

---

## 1. Información General de la Iteración

| Parámetro | Detalle Operativo del Sprint 2 |
| :--- | :--- |
| **Periodo de Ejecución** | 10 de octubre de 2026  |
| **Fecha de corte** | 5 de octubre|
| **Meta del Sprint** | Consolidar la gestión de pedidos mediante el registro, consulta y validación de información geográfica, preparando los datos para la planificación de rutas sostenibles. |
| **Velocidad comprometida** | Pendiente de confirmar en Jira. |
| **Velocidad completada** | 8 Story Points correspondientes a US-003|
| **Estado general** | US-003 reportada como completada, pendiente de verificar la evidencia de cierre. |

## Historias de Usuario completadas en este Sprint

Durante el Sprint 2 se consolidó la funcionalidad de gestión de pedidos y geolocalización, orientada al registro, validación y consulta de información logística.

### 1. US-003: Gestionar pedidos y geolocalización (ANA-7)

- **Épica:** EP-03 Gestión de Pedidos y Geolocalización.
- **RF asociado:** RF-002.
- **Estimación:** 8 Story Points, pendiente de contrastar con Jira.
- **Prioridad:** Media.
- **Estado:** Completada.

**Alcance implementado:**

- Registro de pedidos mediante el endpoint REST `POST /api/v1/pedidos/`.
- Validación y normalización de códigos de seguimiento, con rechazo de duplicados mediante HTTP `409 Conflict`.
- Persistencia de coordenadas geográficas en PostgreSQL y PostGIS con SRID 4326.
- Validación de peso, volumen y ventanas horarias.
- Consulta de pedidos por UUID y código de seguimiento.
- Listado paginado con filtros por estado y prioridad.
- Asignación del estado inicial `PENDIENTE`.

**Componentes técnicos:**

| Componente | Implementación |
| :--- | :--- |
| API | FastAPI y endpoints REST |
| Validación | Pydantic v2 |
| Persistencia | SQLAlchemy y PostgreSQL |
| Información espacial | PostGIS, GeoAlchemy2 y Shapely |
| Identificación | UUID y código de seguimiento |

**Criterios de aceptación considerados:**

1. Registrar pedidos con información logística y geográfica válida.
2. Rechazar códigos de seguimiento duplicados.
3. Validar las dimensiones de carga y las ventanas horarias.
4. Consultar pedidos por identificador y código de seguimiento.

La evidencia de cumplimiento deberá asociarse con los casos de prueba y resultados efectivamente obtenidos durante el Sprint Review.

### 2. Enablers de Arquitectura y Plataforma Base

**EN-002: Capa de persistencia y servicios de pedidos**

- Integración de los modelos de datos con PostgreSQL y PostGIS.
- Conversión de geometrías espaciales para las respuestas de la API.
- Separación de responsabilidades entre endpoints, esquemas de validación y servicios de dominio.
- Validación de la información logística antes de persistirla.

**Estructura modular del repositorio**

Se mantiene la separación entre backend y frontend dentro de `src/`, permitiendo que las operaciones de gestión de pedidos se implementen en el backend y se consuman desde la interfaz web.

---

## Demostración del trabajo completado

La demostración debe evidenciar el registro, validación y consulta de pedidos, así como la persistencia de su información geográfica.

**Fecha propuesta:** 05 de octubre de 2026

### Puntos de demostración y evidencia objetiva

1. **Registro de pedidos:** comprobar el ingreso de datos válidos y la asignación del estado `PENDIENTE`.
2. **Validación de datos:** probar códigos duplicados, peso o volumen inválidos y ventanas horarias inconsistentes.
3. **Consulta y geolocalización:** verificar consultas por UUID y código de seguimiento, filtros y paginación.
4. **Documentación de la API:** revisar los contratos y ejecutar las peticiones disponibles en FastAPI.

**Evidencias por adjuntar:** capturas de la interfaz, resultados de pruebas, respuestas HTTP, persistencia de coordenadas y registro de aceptación cuando exista.

---

## Pendientes

1. **US-004: Gestionar preferencias y restricciones del cliente:** actualizar horarios, restricciones de acceso, referencias de ubicación y datos de contacto.
2. **US-005: Optimización de rutas:** continuar el desarrollo del motor de optimización de acuerdo con Jira.
3. **US-006: Visualización geoespacial:** continuar la representación cartográfica de rutas y paradas.
4. **Validación integral:** consolidar pruebas de integración, defectos pendientes y decisiones del equipo.

---

[← Volver al README Principal](../../README.md)