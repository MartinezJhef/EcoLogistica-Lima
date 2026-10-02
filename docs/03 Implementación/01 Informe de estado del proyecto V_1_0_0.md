[← Volver al README Principal](../../README.md)

# Revisión del sprint

**Nombre del Proyecto:** EcoLogística Lima – Plataforma Inteligente para la Optimización de Rutas Sostenibles de Última Milla (DistriRápido S.A.C.)

**Código Institucional:** PFA-ECOLIMA-2026

**Líder del Proyecto:** Zayuri Cerron Medina (Directora de Proyecto) / Jheferson Martinez Valerio (Scrum Master)

---

## 1. Información General de la Iteración

| Parámetro | Detalle Operativo del Sprint 1 |
| :--- | :--- |
| **Periodo de Ejecución** | 16 de septiembre de 2026 al 09 de octubre de 2026 (Duración: 3 semanas) |
| **Meta del Sprint (Sprint Goal)** | Implementar las funcionalidades iniciales de gestión de vehículos, conductores y pedidos, estableciendo una base funcional para la posterior optimización y monitoreo de rutas. |
| **Velocidad Comprometida** | 18 Story Points (SP) |
| **Velocidad Completada** | 18 Story Points (SP) — 100% de cumplimiento |
| **Estado General** | Cumplido exitosamente sin desvíos críticos |

---

## Historias de Usuario completadas en este Sprint

Durante el **Sprint 1**, el equipo de desarrollo completó satisfactoriamente el 100% de los elementos comprometidos en el Backlog del Sprint, cumpliendo estrictamente con la **Definition of Done (DoD)** institucional, que incluye pruebas unitarias con cobertura superior al 80%, revisión por pares (Peer Review) mediante Pull Requests y validación funcional:

### 1. US-001: Gestionar vehículos de la flota (ANA-9)
* **Épica:** EP-01 Gestión de Vehículos | **RF Asociado:** RF-001 | **Estimación:** 5 Story Points | **Prioridad:** Alta.
* **Alcance Implementado:**
  * Módulo backend en FastAPI para el registro, consulta paginada, actualización y baja lógica de vehículos.
  * Modelado de atributos técnicos y ecológicos: placa única, marca, modelo, capacidad volumétrica ($m^3$), capacidad en peso ($kg$), tipo de combustible (Diésel, GNV, Eléctrico) y factor de emisión de $CO_2$ ($g/km$).
  * Validación estricta con Pydantic para evitar duplicidad de placas y valores de carga menores o iguales a cero.
  * Componente de interfaz web en React 18 con catálogo interactivo, filtros por tipo de combustible y formularios con validación en tiempo real.

### 2. US-002: Gestionar conductores y jornada (ANA-6)
* **Épica:** EP-02 Gestión de Conductores | **RF Asociado:** RF-008 | **Estimación:** 5 Story Points | **Prioridad:** Alta.
* **Alcance Implementado:**
  * Módulo de administración de perfiles de conductores vinculado a la tabla de usuarios con control de roles (RBAC).
  * Registro de DNI, nombres, apellidos, licencia de conducir vigente con validación de formato MTC y número telefónico.
  * Implementación de la regla de negocio **RN-004** (Control de fatiga y jornada legal máxima de 8 horas diarias según Ley N° 30224 y D.S. 033-2012-MTC), bloqueando asignaciones que superen las 7.5 horas acumuladas.
  * Interfaz de monitoreo de disponibilidad operativa (Disponible, En Ruta, Descanso, Inactivo).

### 3. US-003: Gestionar pedidos y geolocalización (ANA-7)
* **Épica:** EP-03 Gestión de Pedidos y Geolocalización | **RF Asociado:** RF-002 | **Estimación:** 8 Story Points | **Prioridad:** Media.
* **Alcance Implementado:**
  * Endpoints REST para ingesta individual y por lotes (batch JSON) de órdenes de entrega con código de seguimiento único (`codigo_seguimiento`).
  * Almacenamiento geoespacial en PostgreSQL 16 utilizando la extensión **PostGIS** con coordenadas WGS84 (`GEOMETRY(Point, 4326)`) para el destino de entrega.
  * Parametrización de ventanas horarias de atención estrictas (`ventana_inicio` y `ventana_fin`), peso en kilogramos, volumen en metros cúbicos y nivel de prioridad del pedido.
  * Estado operativo inicial del pedido en `PENDIENTE` con `ruta_id` nulo, preparado para ser consumido por el motor de ruteo del Sprint 2.

### 4. Enablers de Arquitectura y Plataforma Base
* **EN-002 (Capa Base de Seguridad y Datos):** Inicialización del esquema físico relacional en PostgreSQL 16 + PostGIS 3.4 (11 tablas normalizadas en 3FN), configuración de migraciones y middleware de CORS y autenticación JWT.
* **Estructura Modular del Repositorio:** Creación de carpetas desacopladas `src/backend` (Python/FastAPI) y `src/frontend` (React/Vite), con archivo `.gitignore` estandarizado para omitir dependencias y credenciales.

---

## Demostración del trabajo completado
Demostración a los stakeholres de las funcionalides implementadas.

La sesión formal de demostración y validación del Sprint 1 se llevó a cabo el día **09 de octubre de 2026** ante los principales interesados del proyecto:
* **Ing. Asesor del PFA:** Docente de la asignatura Taller de Proyectos 2 (Universidad Continental).
* **Representante Operativo de DistriRápido S.A.C.:** Jefe de Operaciones Logísticas de la sede central Lima Este.
* **Equipo Scrum PFA-ECOLIMA-2026:** Zayuri Cerron (Product Owner / PM), Jheferson Martinez (Scrum Master), Angela Rojas (Analista de Negocio), Maylit Mendoza (QA/Riesgos) y Diego Angulo (Gestor de Stakeholders).

### Puntos Demostrados y Evidencia Objetiva
1. **Puesta en Marcha del Entorno Local y Contenedores:**
   * Despliegue de los servicios backend, frontend y base de datos relacional espacial en Docker.
   * Ejecución de pruebas automatizadas mediante `pytest` con **85% de cobertura de código** en los servicios de validación de flota y pedidos.
2. **Navegación e Interacción en el Panel Web:**
   * Demostración en vivo del formulario reactivo de registro de vehículos: validación inmediata de placas duplicadas y cálculo dinámico de la huella base teórica.
   * Demostración de alta de conductores con verificación de reglas de jornada laboral máxima (Ley N° 30224) y alerta de bloqueo ante sobreasignación.
   * Carga masiva de 25 pedidos de prueba con geocodificación de coordenadas en Lima Este (San Juan de Lurigancho, Santa Anita, El Agustino), visualizando sus propiedades espaciales y ventanas de tiempo.
3. **Exploración de la Documentación Interactiva de APIs:**
   * Acceso al portal Swagger UI (`/docs`) generado automáticamente por FastAPI, validando esquemas OpenAPI 3.0 y respuestas HTTP estandarizadas (200, 201, 400, 422).
4. **Retroalimentación y Aceptación de Stakeholders:**
   * El cliente DistriRápido S.A.C. expresó alta conformidad con la validación de ventanas de tiempo y capacidades de carga.
   * Se obtuvo la aprobación formal del incremento de software sin observaciones bloqueantes.

---

## Pendientes

Para el siguiente ciclo operativo (**Sprint 2: 10 de octubre al 30 de octubre de 2026**), se establecen los siguientes compromisos y transiciones de trabajo:

1. **Implementación de US-005 (Optimización de Rutas - Green VRPTW):**
   * Integración del motor de optimización matemática metaheurística en Python utilizando **Google OR-Tools** y algoritmos genéticos.
   * Procesamiento de la función objetivo multi-criterio: minimización de kilómetros, balanceo de carga volumétrica (85-90%) y reducción del $CO_2$ emitido.
2. **Implementación de US-006 (Visualización Geoespacial e Interactiva de Rutas):**
   * Integración de la librería cartográfica **Leaflet / React-Leaflet** en el frontend web para renderizar las geometrías de tramos (`LineString`) y paradas ordenadas sobre el mapa de Lima Metropolitana.
3. **Implementación de US-004 (Gestión de Preferencias y Restricciones del Cliente):**
   * Módulo de restricciones horarias y tipos de vehículo permitidos por cliente/bodega receptora.
4. **Despliegue del Worker Asíncrono:**
   * Configuración de la cola de tareas asíncronas con **Celery** y caché de matrices origen-destino en **Redis** para asegurar que el cálculo de rutas no bloquee la API (cumplimiento del RNF-001: tiempo de respuesta $< 45\text{ s}$).

---

[← Volver al README Principal](../../README.md)
