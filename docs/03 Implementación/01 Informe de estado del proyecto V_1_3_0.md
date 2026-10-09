[← Volver al README Principal](../../README.md)

# 01. Informe de estado del proyecto

**Nombre del Proyecto:** EcoLogística Lima – Plataforma Inteligente para la Optimización de Rutas Sostenibles de Última Milla (DistriRápido S.A.C.)

**Código Institucional:** PFA-ECOLIMA-2026

**Líder del Proyecto:** Zayuri Cerron Medina (Directora de Proyecto) / Jheferson Martinez Valerio (Scrum Master)

---

## 1. Información General de la Iteración

| Parámetro | Detalle Operativo del Sprint 2 |
| :--- | :--- |
| **Periodo de ejecución** | Sprint 2; fechas de inicio y cierre pendientes de validar con el cronograma oficial. |
| **Fecha límite del informe** | 08 de octubre de 2026 |
| **Meta del Sprint** | Consolidar la gestión de pedidos y las preferencias y restricciones de los clientes, asegurando la validación de los datos logísticos necesarios para las siguientes etapas de planificación de rutas. |
| **Velocidad comprometida** | Pendiente de confirmar con el Sprint Backlog. |
| **Velocidad completada** | 13 Story Points correspondientes a US-003 (8 SP) y US-004 (5 SP), según la estimación indicada para esta actualización. |
| **Estado general** | US-003 y US-004 reportadas como terminadas. La evidencia de cierre debe mantenerse asociada a las pruebas y criterios de aceptación. |

## 2. Historias de Usuario completadas en este Sprint

Durante esta actualización del Sprint 2, se consideran terminadas las funcionalidades de registro de pedidos y geolocalización, así como la gestión de preferencias y restricciones del cliente. Estas funcionalidades permiten disponer de información logística estructurada para su utilización en los procesos posteriores de optimización y monitoreo de rutas.

### 1. US-003: Registrar pedidos y geolocalización (ANA-7)

- **Épica:** EP-03 Gestión de Pedidos y Geolocalización.
- **RF asociado:** RF-002.
- **Estimación:** 8 Story Points.
- **Prioridad:** Según el Product Backlog vigente.
- **Estado:** Terminada.

**Alcance implementado:**

- Registro de pedidos mediante servicios REST.
- Validación del código de seguimiento y prevención de duplicados.
- Almacenamiento de coordenadas geográficas con PostgreSQL y PostGIS.
- Validación de peso, volumen y ventanas horarias.
- Consulta de pedidos por identificador y código de seguimiento.
- Listado de pedidos con filtros y paginación.


### 2. US-004: Gestionar preferencias y restricciones del cliente (ANA-8)

- **Épica:** EP-04 Gestión de Clientes y Preferencias.
- **RF asociado:** RF-009.
- **Estimación:** 5 Story Points.
- **Estado:** Terminada.

**Objetivo:** Permitir la gestión de las condiciones de recepción y restricciones operativas de los clientes, facilitando la preparación de las entregas y la planificación logística.

**Alcance implementado:**

- Actualización de las ventanas horarias de recepción, validando la coherencia entre la hora de inicio y la hora de fin.
- Gestión de restricciones de acceso vehicular, considerando condiciones como altura máxima, vehículos ligeros, camiones pesados y zonas peatonales.
- Registro y actualización de referencias textuales para localizar el punto de entrega.
- Almacenamiento de una URL de fotografía de referencia del establecimiento.
- Actualización del teléfono del contacto responsable de la recepción.
- Restricción de modificaciones cuando el pedido se encuentra en tránsito.
- Validación de datos antes de guardar los cambios.

**Componentes técnicos relacionados:**

| Componente | Descripción |
| :--- | :--- |
| API | FastAPI y endpoints REST |
| Validación | Pydantic y reglas de negocio |
| Persistencia | SQLAlchemy y PostgreSQL |
| Esquema de entrada | `PreferenciasClienteUpdate` |
| Servicio de dominio | `OrderService.update_preferencias_cliente()` |

**Criterios de aceptación:**

1. Actualizar las ventanas horarias con valores válidos.
2. Registrar o modificar las restricciones de acceso.
3. Actualizar las referencias de ubicación, fotografía y teléfono de contacto.
4. Rechazar modificaciones no permitidas para pedidos en tránsito.
5. Mantener la integridad de los datos durante las actualizaciones.

### 3. Enablers de Arquitectura y Plataforma Base

- Integración de los servicios de pedidos con PostgreSQL y PostGIS.
- Separación de responsabilidades entre endpoints, esquemas de validación y servicios de dominio.
- Validación de los datos logísticos antes de persistirlos.
- Integración de las preferencias y restricciones con la información del pedido.
- Preparación de los datos para las futuras funcionalidades de optimización y visualización de rutas.

---

## 3. Estado general del Product Backlog

El Product Backlog mantiene las diez historias de usuario definidas para el proyecto. En esta actualización, US-001 y US-002 continúan terminadas, y se incorporan como terminadas US-003 y US-004. Las historias restantes permanecen pendientes.

| ID | Historia de Usuario | Épica | RF | SP | Estado |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **US-001** | Gestionar vehículos de la flota | EP-01 Gestión de Vehículos | RF-001 | 5 | **Terminada** |
| **US-002** | Gestionar conductores y jornada | EP-02 Gestión de Conductores | RF-008 | 3 | **Terminada** |
| **US-003** | Registrar pedidos y geolocalización | EP-03 Gestión de Pedidos y Geolocalización | RF-002 | 5 | **Terminada** |
| **US-004** | Gestionar preferencias y restricciones del cliente | EP-04 Gestión de Clientes y Preferencias | RF-009 | 5 | **Terminada** |
| **US-005** | Generar rutas optimizadas | EP-05 Optimización de Rutas | RF-003 | 13 | Pendiente |
| **US-006** | Visualizar rutas en el mapa | EP-06 Monitoreo y Reoptimización de Rutas | RF-004 | 8 | Pendiente |
| **US-007** | Reoptimizar rutas ante eventos | EP-06 Monitoreo y Reoptimización de Rutas | RF-007 | 8 | Pendiente |
| **US-008** | Consultar indicadores operativos y de sostenibilidad | EP-07 Analítica, Reportes y Sostenibilidad | RF-005 | 5 | Pendiente |
| **US-009** | Generar reportes de sostenibilidad y costos | EP-07 Analítica, Reportes y Sostenibilidad | RF-006 | 3 | Pendiente |
| **US-010** | Generar propuesta de compensación de carbono | EP-07 Analítica, Reportes y Sostenibilidad | RF-010 | 5 | Pendiente |

### Resumen de la actualización

Con respecto a la versión anterior del documento:

- **US-001** se mantiene terminada.
- **US-002** se mantiene terminada.
- **US-003** pasa a figurar como terminada, con una estimación de 8 Story Points.
- **US-004** pasa a figurar como terminada, con una estimación de 5 Story Points.
- US-005, US-006, US-007, US-008, US-009 y US-010 permanecen pendientes.
- Las cuatro primeras historias acumulan **21 Story Points estimados** en total: 5 + 3 + 8 + 5.
- El incremento correspondiente a US-003 y US-004 representa **10 Story Points estimados**.

Esta actualización refleja el estado declarado de las historias, sin modificar el alcance original de las diez historias del proyecto.

---

## 4. Casos de uso y funcionalidades relacionadas

La siguiente tabla mantiene la trazabilidad entre las historias de usuario y las funcionalidades previstas, actualizando los estados hasta US-004.

| Caso de uso / funcionalidad | Relación | Estado V1.3.0 |
| :--- | :--- | :--- |
| Gestión de vehículos de la flota | US-001 | **Terminado** |
| Gestión de conductores | US-002 | **Terminado** |
| Gestión de jornada de conductores | US-002 | **Terminado** |
| Registro de pedidos | US-003 | **Terminado** |
| Geolocalización de pedidos | US-003 | **Terminado** |
| Consulta y filtrado de pedidos | US-003 | **Terminado** |
| Gestión de preferencias del cliente | US-004 | **Terminado** |
| Gestión de ventanas horarias de entrega | US-004 | **Terminado** |
| Gestión de restricciones de acceso vehicular | US-004 | **Terminado** |
| Gestión de referencias y datos de contacto | US-004 | **Terminado** |
| Generación de rutas optimizadas | US-005 | Pendiente |
| Visualización de rutas en el mapa | US-006 | Pendiente |
| Reoptimización de rutas | US-007 | Pendiente |
| Consulta de indicadores operativos y de sostenibilidad | US-008 | Pendiente |
| Generación de reportes de sostenibilidad y costos | US-009 | Pendiente |
| Propuesta de compensación de carbono | US-010 | Pendiente |

---

## 5. Demostración del trabajo completado

La demostración de esta versión debe evidenciar el funcionamiento de las operaciones de registro y consulta de pedidos y la actualización de las preferencias y restricciones de entrega.

### 5.1. Actividades de demostración y validación

1. **Registro de pedidos:** ingresar pedidos con datos logísticos y geográficos válidos.
2. **Validación de códigos:** comprobar el rechazo de códigos de seguimiento duplicados.
3. **Validación logística:** verificar peso, volumen y ventanas horarias.
4. **Consulta de pedidos:** buscar por identificador y código de seguimiento y revisar filtros y paginación.
5. **Actualización de preferencias:** modificar las ventanas horarias de recepción.
6. **Gestión de restricciones:** actualizar las condiciones de acceso vehicular.
7. **Actualización de referencias:** registrar referencias de ubicación, fotografía y teléfono de contacto.
8. **Control de pedidos en tránsito:** comprobar que las modificaciones no permitidas sean rechazadas.
9. **Verificación integral:** revisar la persistencia de los cambios y registrar los resultados de las pruebas.

**Evidencias por adjuntar:** capturas de pantalla, resultados de pruebas, respuestas HTTP, registros de persistencia y acta de aceptación si corresponde.

---

## 6. Pendientes

Las siguientes actividades corresponden a historias todavía pendientes y deberán ejecutarse según el orden de prioridad y la planificación aprobada.

1. **US-005: Generar rutas optimizadas.** Desarrollar el proceso de optimización considerando pedidos, capacidades de vehículos, ventanas horarias y restricciones operativas.
2. **US-006: Visualizar rutas en el mapa.** Incorporar la representación cartográfica de recorridos y paradas.
3. **US-007: Reoptimizar rutas ante eventos.** Preparar la adaptación de las rutas ante incidencias o cambios operativos.
4. **US-008: Consultar indicadores operativos y de sostenibilidad.** Desarrollar consultas e indicadores para el seguimiento de las operaciones.
5. **US-009: Generar reportes de sostenibilidad y costos.** Preparar reportes de desempeño operativo, costos y sostenibilidad.
6. **US-010: Generar propuesta de compensación de carbono.** Desarrollar la funcionalidad de propuestas vinculadas con la compensación de emisiones.
7. **Integración entre módulos.** Verificar el intercambio de información entre pedidos, clientes, vehículos y los futuros servicios de optimización.
8. **Pruebas de integración.** Validar escenarios de funcionamiento conjunto y registrar defectos.
9. **Documentación técnica.** Actualizar los artefactos del proyecto de acuerdo con el incremento y los resultados verificados.

---

[← Volver al README Principal](../../README.md)