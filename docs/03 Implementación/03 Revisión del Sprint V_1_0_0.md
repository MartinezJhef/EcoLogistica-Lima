[← Volver al README Principal](../../README.md)

# Revisión del sprint

**Nombre del Proyecto:** EcoLogística Lima – Plataforma Inteligente para la Optimización de Rutas Sostenibles de Última Milla (DistriRápido S.A.C.)

**Código Institucional:** PFA-ECOLIMA-2026

**Líder del Proyecto:** Zayuri Cerron Medina (Directora de Proyecto) / Jheferson Martinez Valerio (Scrum Master)

---

## Historias de Usuario completadas en este Sprint

En la ceremonia formal de **Sprint Review** realizada al cierre de la iteración (Sprint 1: 16 de septiembre al 09 de octubre de 2026), se presentó el incremento de software potencialmente desplegable correspondiente a las **3 Historias de Usuario principales** y los **Enablers de arquitectura** planificados:

### Resumen de Cumplimiento de Historias de Usuario

| ID Historia | Título de la Historia de Usuario | Épica Asociada | Story Points | Criterios BDD Verificados | Estado Final |
| :---: | :--- | :--- | :---: | :---: | :---: |
| **US-001** | Gestionar vehículos de la flota | EP-01 Gestión de Vehículos | 5 SP | 2/2 Cumplidos (Escenario 1 y 2) | **DONE** |
| **US-002** | Gestionar conductores y jornada | EP-02 Gestión de Conductores | 5 SP | 2/2 Cumplidos (Escenario 1 y 2) | **DONE** |
| **US-003** | Gestionar pedidos y geolocalización | EP-03 Gestión de Pedidos | 8 SP | 2/2 Cumplidos (Escenario 1 y 2) | **DONE** |
| **TOTAL** | **Velocidad Lograda en el Sprint 1** | **3 Épicas Impactadas** | **18 SP** | **100% de Criterios Validados** | **DONE** |

---

### Detalle Técnico por Historia de Usuario

#### 1. US-001: Gestionar vehículos de la flota (ANA-9)
* **Objetivo:** Permitir al administrador de flota registrar, consultar, actualizar y tipificar las unidades vehiculares de DistriRápido S.A.C., calculando sus factores de emisión y validando restricciones de capacidad.
* **Criterios de Aceptación Verificados:**
  * *Escenario 1 (Registro con datos válidos):* Registro exitoso de vehículos (Placa, Capacidad en Kg, Volumen en $m^3$, Combustible Diésel/GNV y Factor de Emisión) en un tiempo promedio de respuesta de $180\text{ ms}$ (meta $< 1000\text{ ms}$). Estado inicial asignado: `DISPONIBLE`.
  * *Escenario 2 (Validación de placa duplicada):* Rechazo automático ante intentos de ingreso de placas ya existentes en el sistema, emitiendo respuesta HTTP `409 Conflict` con el mensaje: *"La placa ingresada ya se encuentra registrada en el sistema."*
* **Tareas Técnicas Cerradas:**
  * Creación del modelo relacional `vehiculos` en SQLAlchemy 2.0 y esquemas Pydantic v2.
  * Implementación de endpoints REST: `GET /api/v1/vehiculos`, `POST /api/v1/vehiculos`, `GET /api/v1/vehiculos/{id}`, `PUT /api/v1/vehiculos/{id}`.
  * Construcción de la vista en React 18 con catálogo reactivo, filtros dinámicos y tabla con paginación.

#### 2. US-002: Gestionar conductores y jornada (ANA-6)
* **Objetivo:** Registrar a los conductores de reparto y controlar estrictamente sus límites de fatiga y jornada legal para prevenir sobrecargas de trabajo.
* **Criterios de Aceptación Verificados:**
  * *Escenario 1 (Alta de conductor):* Registro correcto de chofer con DNI, licencia de conducir vigente y punto de partida autorizado. Perfil creado con estado inicial `DISPONIBLE`.
  * *Escenario 2 (Bloqueo por exceso de jornada - RN-004):* Verificación automática de horas acumuladas de manejo. Si un conductor registra $\ge 7.5\text{ h}$, el sistema rechaza la asignación de rutas adicionales emitiendo el mensaje legal: *"Asignación rechazada: Supera el límite legal de 8 horas diarias (Ley N° 30224 / D.S. 033-2012-MTC)."*
* **Tareas Técnicas Cerradas:**
  * Creación de la tabla `conductores` con clave foránea hacia `usuarios` y restricción de unicidad en licencia.
  * Lógica de servicio en `FleetService` para el cómputo de horas de servicio y validación de turnos.
  * Vista web para administración de choferes con semaforización de estado operativo (Verde: Disponible, Amarillo: En Turno, Rojo: Límite Alcanzado).

#### 3. US-003: Gestionar pedidos y geolocalización (ANA-7)
* **Objetivo:** Ingestar pedidos con especificación de destino geográfico, ventanas horarias de entrega y parámetros de peso y volumen.
* **Criterios de Aceptación Verificados:**
  * *Escenario 1 (Ingreso de pedido con coordenadas válidas):* Persistencia espacial en PostgreSQL 16 con tipo `GEOMETRY(Point, 4326)`, validando que las coordenadas pertenezcan a la delimitación geográfica de Lima Metropolitana.
  * *Escenario 2 (Validación de ventanas horarias - RN-007):* Comprobación estricta de que `ventana_fin > ventana_inicio` y que el rango sea de al menos 60 minutos para permitir el despacho logístico.
* **Tareas Técnicas Cerradas:**
  * Endpoint de carga masiva de pedidos por JSON para integración con el ERP de DistriRápido S.A.C.
  * Creación de índices espaciales GiST en la columna `ubicacion_destino`.
  * Formulario web interactivo con selector de horarios y previsualización de dirección.

---

## Demostración del trabajo completado
Demostración a los stakeholres de las funcionalides implementadas.

La demostración del trabajo completado se desarrolló en sesión formal virtual el **09 de octubre de 2026 a las 17:00 horas**, contando con la asistencia de:
* **Ing. Asesor del PFA:** Evaluador de Taller de Proyectos 2 (Escuela Profesional de Ingeniería de Sistemas e Informática).
* **Lic. Roberto Morales:** Representante de Operaciones y Distribución de DistriRápido S.A.C.
* **Equipo de Desarrollo del Proyecto EcoLogística Lima.**

### Agenda de la Demostración y Resultados Obtenidos

1. **Presentación de la Arquitectura en Ejecución:**
   * Se mostró la arquitectura en capas funcionando en contenedores Docker: API Backend en **FastAPI (Python 3.11)**, Base de datos **PostgreSQL 16 + PostGIS 3.4** y Frontend en **React 18 + Vite**.
   * Se evidenció la documentación Swagger UI interactiva en `http://localhost:8000/docs`, ejecutando pruebas de endpoints con respuestas menores a $250\text{ ms}$.

2. **Flujo Operativo de Demostración en Vivo:**
   * **Paso 1 (Gestión de Flota):** Se registró un camión liviano de reparto eléctrico y una furgoneta diésel, demostrando cómo el sistema asigna automáticamente el factor de emisión de $CO_2$ ($g/km$) según la norma Euro correspondiente. Se forzó un intento de duplicar la placa `ABC-123`, demostrando el bloqueo y el mensaje de alerta.
   * **Paso 2 (Gestión de Conductores):** Se dio de alta a dos conductores. Se simuló una jornada acumulada de 7.5 horas para el conductor "Carlos Quispe", intentando asignarle una ruta de prueba adicional de 1 hora; el sistema ejecutó el bloqueo automático conforme a la Ley N° 30224.
   * **Paso 3 (Gestión de Pedidos):** Se demostró la importación de un archivo de 20 pedidos con coordenadas geográficas en Lima Este (Ate, Santa Anita y San Juan de Lurigancho). Se validaron ventanas horarias de entrega y pesos de carga.

3. **Retroalimentación de los Stakeholders:**
   * **DistriRápido S.A.C.:** *"La validación automática del límite legal de jornada para los conductores evita riesgos de sanciones laborales por parte de SUNAFIL. Es un gran acierto tenerlo sistematizado."*
   * **Asesor del Proyecto:** Felicitó el cumplimiento estricto de la arquitectura C4 y el uso de tipos de datos espaciales nativos mediante PostGIS en lugar de simples campos de texto para las coordenadas.

---

## Pendientes

Habiéndose cerrado el 100% de los elementos del Sprint 1, los siguientes ítems constituyen el alcance comprometido para la planificación del **Sprint 2 (10 al 30 de octubre de 2026)**:

1. **US-005 (Optimización de Rutas con Algoritmos Heurísticos):**
   * Desarrollo del solucionador Green VRPTW utilizando la librería **Google OR-Tools** en el backend.
   * Integración del cálculo de la matriz de distancias y tiempos de tránsito mediante servicios cartográficos (OSRM).
2. **US-006 (Visualización Geoespacial e Interactiva de Rutas):**
   * Integración del visor de mapas **Leaflet** en el frontend de React para dibujar los tramos poligonales de las rutas optimizadas y las paradas ordenadas de entrega.
3. **US-004 (Gestión de Preferencias y Restricciones del Cliente):**
   * Módulo para registrar horarios de recepción de clientes B2B (supermercados, bodegas) y zonas de acceso peatonal o restringido.
4. **Despliegue del Sistema de Tareas Asíncronas (Celery + Redis):**
   * Implementación del procesamiento en segundo plano para evitar demoras en la API durante el cálculo de rutas de gran escala.

---

[← Volver al README Principal](../../README.md)
