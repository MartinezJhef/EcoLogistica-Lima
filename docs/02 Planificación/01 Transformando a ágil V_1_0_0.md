[← Volver al README Principal](../../README.md)

# 01 Transformando a ágil V_1_0_0

## 1. Metodología de Transformación

### 1.1 Objetivo

La transformación ágil del proyecto **EcoLogistica-Lima** tiene como objetivo convertir los Requerimientos Funcionales (RF) y Requerimientos No Funcionales (RNF) definidos en la línea base del proyecto en elementos de trabajo ágiles que puedan ser gestionados mediante Épicas, Historias de Usuario (US), Historias Técnicas (Enablers), tareas y subtareas.

La transformación mantiene la trazabilidad entre los requisitos originales y los elementos del backlog, evitando modificar el alcance funcional definido previamente.

### 1.2 Transformación de Requerimientos Funcionales

Los **Requerimientos Funcionales (RF)** se mapean jerárquicamente hacia las **Épicas** del proyecto y posteriormente se descomponen en **Historias de Usuario (US)**.

La descomposición se realiza considerando que una Historia de Usuario debe representar una funcionalidad que entregue valor al usuario o al negocio.

Las actividades como:

* Registrar.
* Editar.
* Actualizar.
* Consultar.
* Validar.
* Configurar.
* Implementar.
* Probar.
* Documentar.

se consideran **tareas o subtareas** cuando forman parte de una misma funcionalidad y no representan por sí solas un valor de negocio independiente.

Por ejemplo, dentro de la historia **US-001 Gestionar vehículos de la flota**, registrar, editar, consultar y validar los vehículos pueden gestionarse como tareas y subtareas necesarias para completar la historia.

De esta manera, se evita crear Historias de Usuario excesivamente pequeñas y se mantiene un backlog más organizado.

### 1.3 Transformación de Requerimientos No Funcionales

Los **Requerimientos No Funcionales (RNF)** se transforman principalmente en **Historias Técnicas o Enablers**, debido a que representan condiciones de calidad necesarias para el funcionamiento del sistema.

Los Enablers se orientan principalmente a:

* Rendimiento.
* Seguridad.
* Accesibilidad.
* Escalabilidad.
* Usabilidad.
* Disponibilidad.
* Documentación técnica.

Estos requisitos también pueden integrarse transversalmente como criterios de aceptación de las Historias de Usuario y como parte de la **Definition of Done (DoD)** global.

### 1.4 Criterio utilizado para la descomposición

La transformación sigue la siguiente estructura:

```text
Requerimiento Funcional (RF)
            │
            ▼
         Épica
            │
            ▼
   Historia de Usuario
            │
            ├── Tarea
            ├── Tarea
            ├── Subtarea
            ├── Subtarea
            └── Pruebas
```

Para los requisitos no funcionales:

```text
Requerimiento No Funcional (RNF)
              │
              ▼
      Historia Técnica
         (Enabler)
              │
              ├── Implementación
              ├── Configuración
              ├── Validación
              └── Pruebas
```

---

## 2. Épicas del Proyecto

| ID    | Épica                                  | Propósito                                                                                                 | Requisitos relacionados |
| ----- | --------------------------------------- | ----------------------------------------------------------------------------------------------------------- | ------------------------ |
| EP-01 | Gestión de Flota y Conductores         | Administrar vehículos y conductores necesarios para las operaciones de reparto.                           | RF-001, RF-008           |
| EP-02 | Gestión de Pedidos y Clientes          | Gestionar pedidos, información logística, clientes y preferencias de entrega.                             | RF-002, RF-009           |
| EP-03 | Optimización y Reoptimización de Rutas | Generar, visualizar y recalcular rutas considerando las condiciones operativas.                           | RF-003, RF-004, RF-007   |
| EP-04 | Sostenibilidad, Analítica y Reportes   | Consultar indicadores, generar reportes y gestionar información relacionada con sostenibilidad y carbono. | RF-005, RF-006, RF-010   |
| EP-05 | Calidad, Seguridad e Infraestructura   | Garantizar las condiciones técnicas de calidad, seguridad, rendimiento, disponibilidad y documentación.   | RNF-001 a RNF-007        |

---

## 3. Mapa de Transformación RF → Épica → Historia de Usuario

| RF     | Épica | Historia de Usuario                                   | Prioridad |
| ------ | ----- | ------------------------------------------------------ | --------- |
| RF-001 | EP-01 | US-001 Gestionar vehículos de la flota                | High      |
| RF-008 | EP-01 | US-002 Gestionar conductores y jornada                | High      |
| RF-002 | EP-02 | US-003 Gestionar pedidos y geolocalización            | High       |
| RF-009 | EP-02 | US-004 Gestionar preferencias del cliente             | Should    |
| RF-003 | EP-03 | US-005 Generar rutas optimizadas                      | Must      |
| RF-004 | EP-03 | US-006 Visualizar rutas en mapa                       | Must      |
| RF-007 | EP-03 | US-007 Reoptimizar rutas activas                      | Must      |
| RF-005 | EP-04 | US-008 Consultar indicadores operativos y ambientales | Should    |
| RF-006 | EP-04 | US-009 Generar reportes de sostenibilidad y costos    | Should    |
| RF-010 | EP-04 | US-010 Gestionar propuesta de compensación de carbono | Could     |

> **Nota:** Los identificadores RF-001 a RF-010 corresponden directamente a los requisitos funcionales definidos en la línea base del proyecto. En versiones anteriores del documento ágil se utilizó la forma abreviada RF-01 a RF-10; para esta versión se estandariza la nomenclatura a RF-001 a RF-010.

---

## 4. Historias de Usuario

### EP-01 Gestión de Flota y Conductores

#### US-001 – Gestionar vehículos de la flota

**ID:** US-001

**Título:** Gestionar vehículos de la flota

**Épica Relacionada:** EP-01 Gestión de Flota y Conductores

**RF de origen:** RF-001 Gestión de Flota y Emisiones

**Prioridad:** High 

**Story Points:** 5

**Redacción:**

**Como** administrador de flota,

**quiero** registrar, consultar y actualizar los vehículos de la flota con sus características técnicas y ambientales,

**para** mantener información válida para la planificación de las operaciones y aplicar las restricciones de circulación correspondientes.

##### Criterios de Aceptación

**Escenario 1: Registro de vehículo con información válida**

**Dado** que el administrador está autenticado y cuenta con permisos de gestión de flota,

**Cuando** registra un vehículo con placa, tipo, capacidad, consumo y factor de emisiones válidos,

**Entonces** el sistema debe guardar el vehículo con estado **Activo** y mostrar una confirmación de registro.

**Escenario 2: Registro de placa duplicada**

**Dado** que ya existe un vehículo registrado con una determinada placa,

**Cuando** el administrador intenta registrar otro vehículo utilizando la misma placa,

**Entonces** el sistema debe rechazar la operación y mostrar un mensaje indicando que la placa ya se encuentra registrada.

##### Tareas y subtareas

* Diseñar formulario de gestión de vehículos.
* Implementar registro de vehículos.
* Implementar consulta de vehículos.
* Implementar actualización de datos.
* Validar placa duplicada.
* Registrar características técnicas y ambientales.
* Aplicar restricciones de circulación.
* Implementar pruebas unitarias.
* Documentar la funcionalidad.

---

#### US-002 – Gestionar conductores y jornada

**ID:** US-002

**Título:** Gestionar conductores y jornada

**Épica Relacionada:** EP-01 Gestión de Flota y Conductores

**RF de origen:** RF-008 Gestión de Conductores y Control de Jornada

**Prioridad:** High 

**Story Points:** 5

**Redacción:**

**Como** administrador de operaciones,

**quiero** registrar y actualizar la información de los conductores y validar su jornada antes de asignarles rutas,

**para** asegurar que las asignaciones se realicen considerando su disponibilidad y los límites de jornada establecidos.

##### Criterios de Aceptación

**Escenario 1: Registro de conductor**

**Dado** que el administrador cuenta con permisos para gestionar conductores,

**Cuando** registra un conductor con DNI, licencia vigente y punto de inicio autorizado,

**Entonces** el sistema debe crear el perfil del conductor y establecerlo como disponible para la programación.

**Escenario 2: Exceso de jornada**

**Dado** que un conductor ya tiene 7.5 horas de conducción registradas,

**Cuando** el operador intenta asignarle una ruta de 1.5 horas,

**Entonces** el sistema debe bloquear la asignación, excluir al conductor de la programación y mostrar el mensaje correspondiente sobre el límite de jornada.

##### Tareas y subtareas

* Crear formulario de conductores.
* Registrar información del conductor.
* Actualizar datos del conductor.
* Consultar disponibilidad.
* Validar licencia.
* Registrar punto de inicio.
* Validar horas de conducción.
* Bloquear asignaciones que superen el límite.
* Implementar pruebas.

---

### EP-02 Gestión de Pedidos y Clientes

#### US-003 – Gestionar pedidos y geolocalización

**ID:** US-003

**Título:** Gestionar pedidos y geolocalización

**Épica Relacionada:** EP-02 Gestión de Pedidos y Clientes

**RF de origen:** RF-002 Gestión y Geolocalización de Pedidos

**Prioridad:** High 

**Story Points:** 8

**Redacción:**

**Como** despachador,

**quiero** registrar pedidos con sus datos logísticos y ubicación geográfica,

**para** disponer de información válida que pueda utilizarse posteriormente en la planificación de rutas.

##### Criterios de Aceptación

**Escenario 1: Registro de pedido con ubicación válida**

**Dado** que el despachador ingresa una dirección, peso, volumen y ventana horaria válidos,

**Cuando** registra el pedido,

**Entonces** el sistema debe obtener o registrar sus coordenadas geográficas y guardar el pedido con estado **Pendiente de Programación**.

**Escenario 2: Pedido con carga no válida**

**Dado** que el pedido supera la capacidad permitida o presenta una ventana horaria inconsistente,

**Cuando** el usuario intenta registrarlo,

**Entonces** el sistema debe bloquear el registro y mostrar los errores correspondientes.

##### Tareas y subtareas

* Diseñar formulario de pedidos.
* Registrar datos logísticos.
* Validar peso y volumen.
* Validar ventana horaria.
* Obtener coordenadas.
* Permitir ubicación manual cuando corresponda.
* Registrar referencia textual.
* Actualizar información del pedido.
* Implementar pruebas.

---

#### US-004 – Gestionar preferencias del cliente

**ID:** US-004

**Título:** Gestionar preferencias del cliente

**Épica Relacionada:** EP-02 Gestión de Pedidos y Clientes

**RF de origen:** RF-009 Módulo de Preferencias y Restricciones del Cliente

**Prioridad:** Should

**Story Points:** 5

**Redacción:**

**Como** operador de clientes,

**quiero** registrar y actualizar las preferencias y restricciones de entrega de cada cliente,

**para** que estas condiciones sean consideradas durante la planificación de las rutas.

##### Criterios de Aceptación

**Escenario 1: Actualización de preferencias**

**Dado** que existe un cliente registrado,

**Cuando** se modifican sus horarios de atención y restricciones de acceso vehicular,

**Entonces** el sistema debe guardar los cambios y asociarlos al perfil del cliente.

**Escenario 2: Restricción de pedido activo**

**Dado** que un pedido se encuentra activo y en tránsito,

**Cuando** el cliente intenta modificar su ventana horaria,

**Entonces** el sistema debe rechazar la modificación e informar que no puede modificarse durante el tránsito.

##### Tareas y subtareas

* Registrar preferencias.
* Consultar preferencias.
* Actualizar horarios de atención.
* Registrar restricciones vehiculares.
* Registrar referencias de entrega.
* Adjuntar referencias visuales o textuales.
* Aplicar preferencias a la planificación.
* Validar modificaciones de pedidos activos.
* Implementar pruebas.

---

### EP-03 Optimización y Reoptimización de Rutas

#### US-005 – Generar rutas optimizadas

**ID:** US-005

**Título:** Generar rutas optimizadas

**Épica Relacionada:** EP-03 Optimización y Reoptimización de Rutas

**RF de origen:** RF-003 Motor de Optimización de Rutas

**Prioridad:** Must

**Story Points:** 13

**Redacción:**

**Como** despachador,

**quiero** generar rutas optimizadas asignando pedidos a vehículos disponibles,

**para** reducir distancia, tiempo, consumo y emisiones, respetando las capacidades y restricciones operativas.

##### Criterios de Aceptación

**Escenario 1: Generación de rutas**

**Dado** que existen pedidos pendientes y vehículos disponibles con sus capacidades y restricciones registradas,

**Cuando** el despachador solicita la programación,

**Entonces** el sistema debe generar las rutas y secuencias de atención respetando las restricciones definidas.

**Escenario 2: Capacidad insuficiente**

**Dado** que la carga total de los pedidos supera la capacidad disponible de la flota,

**Cuando** se ejecuta la programación,

**Entonces** el sistema debe asignar la cantidad posible de pedidos y marcar los restantes como **No Asignados por Exceso de Capacidad**.

##### Tareas y subtareas

* Preparar pedidos pendientes.
* Obtener vehículos disponibles.
* Validar capacidades.
* Validar restricciones.
* Implementar proceso de optimización.
* Generar secuencia de paradas.
* Considerar distancia, tiempo y emisiones.
* Identificar pedidos no asignados.
* Registrar resultados de optimización.
* Implementar pruebas de rendimiento.

---

#### US-006 – Visualizar rutas en mapa

**ID:** US-006

**Título:** Visualizar rutas en mapa

**Épica Relacionada:** EP-03 Optimización y Reoptimización de Rutas

**RF de origen:** RF-004 Visualización Geoespacial e Interactiva de Rutas

**Prioridad:** Must

**Story Points:** 8

**Redacción:**

**Como** despachador,

**quiero** visualizar las rutas, paradas, tráfico y zonas de riesgo en un mapa interactivo,

**para** supervisar geográficamente las operaciones de reparto.

##### Criterios de Aceptación

**Escenario 1: Visualización de ruta**

**Dado** que existe una ruta activa,

**Cuando** el despachador selecciona la ruta,

**Entonces** el sistema debe mostrar su trazado, paradas y asignación correspondiente en el mapa.

**Escenario 2: Servicio de mapas no disponible**

**Dado** que el proveedor del mapa no está disponible,

**Cuando** el usuario intenta visualizar la ruta,

**Entonces** el sistema debe mantener disponible la información operativa mediante una lista secuencial de paradas y mostrar el mensaje de indisponibilidad del servicio de mapas.

##### Tareas y subtareas

* Implementar vista de mapa.
* Mostrar trazado de rutas.
* Mostrar marcadores de paradas.
* Mostrar estado del tráfico.
* Mostrar zonas de riesgo.
* Implementar consulta de detalle.
* Implementar vista alternativa sin mapa.
* Probar tiempos de carga.
* Implementar pruebas.

---

#### US-007 – Reoptimizar rutas activas

**ID:** US-007

**Título:** Reoptimizar rutas activas

**Épica Relacionada:** EP-03 Optimización y Reoptimización de Rutas

**RF de origen:** RF-007 Re-optimización Dinámica en Tiempo Real

**Prioridad:** Must

**Story Points:** 8

**Redacción:**

**Como** operador de despacho,

**quiero** recalcular una ruta activa cuando ocurra una incidencia operativa,

**para** continuar la distribución reduciendo los efectos de cierres de vías, accidentes o problemas de los vehículos.

##### Criterios de Aceptación

**Escenario 1: Cierre de vía**

**Dado** que un vehículo se encuentra en tránsito y se confirma el cierre de una vía,

**Cuando** el sistema ejecuta la reoptimización,

**Entonces** debe generar una nueva ruta evitando el segmento afectado y actualizar el itinerario correspondiente.

**Escenario 2: Aplicación móvil sin conexión**

**Dado** que se genera una nueva ruta mientras la aplicación del conductor está desconectada,

**Cuando** el sistema intenta enviar la actualización,

**Entonces** debe mantener la última ruta conocida, almacenar la notificación pendiente y realizar nuevos intentos posteriormente.

##### Tareas y subtareas

* Detectar incidencias.
* Registrar cierre de vías.
* Registrar averías.
* Ejecutar reoptimización.
* Mantener pedidos ya completados.
* Redistribuir pedidos pendientes.
* Actualizar itinerario.
* Enviar nueva ruta al conductor.
* Gestionar notificaciones pendientes.
* Implementar pruebas.

---

### EP-04 Sostenibilidad, Analítica y Reportes

#### US-008 – Consultar indicadores operativos y ambientales

**ID:** US-008

**Título:** Consultar indicadores operativos y ambientales

**Épica Relacionada:** EP-04 Sostenibilidad, Analítica y Reportes

**RF de origen:** RF-005 Dashboard Operativo y de Sostenibilidad

**Prioridad:** Should

**Story Points:** 5

**Redacción:**

**Como** supervisor de operaciones,

**quiero** consultar indicadores operativos y ambientales de las rutas realizadas,

**para** conocer el comportamiento de las operaciones y sus resultados de sostenibilidad.

##### Criterios de Aceptación

**Escenario 1: Consulta de indicadores**

**Dado** que existen operaciones registradas para un periodo seleccionado,

**Cuando** el supervisor consulta el dashboard,

**Entonces** el sistema debe mostrar indicadores de distancia, consumo, CO₂ y ahorro correspondientes al periodo.

**Escenario 2: Ausencia de información histórica**

**Dado** que no existe una línea base histórica para realizar una comparación,

**Cuando** el supervisor consulta los indicadores,

**Entonces** el sistema debe mostrar los valores absolutos disponibles y representar el diferencial comparativo como **0%**, sin inventar información.

##### Tareas y subtareas

* Diseñar dashboard.
* Calcular distancia recorrida.
* Calcular consumo.
* Calcular emisiones de CO₂.
* Calcular ahorro.
* Implementar filtros por periodo.
* Mostrar indicadores ambientales.
* Manejar ausencia de datos.
* Implementar pruebas.

---

#### US-009 – Generar reportes de sostenibilidad y costos

**ID:** US-009

**Título:** Generar reportes de sostenibilidad y costos

**Épica Relacionada:** EP-04 Sostenibilidad, Analítica y Reportes

**RF de origen:** RF-006 Generación de Reportes de Sostenibilidad y Costos

**Prioridad:** Should

**Story Points:** 5

**Redacción:**

**Como** administrador,

**quiero** generar y descargar reportes de sostenibilidad y costos de un periodo seleccionado,

**para** disponer de información consolidada para el seguimiento de las operaciones.

##### Criterios de Aceptación

**Escenario 1: Generación de reporte**

**Dado** que existen operaciones completadas dentro del periodo seleccionado,

**Cuando** el administrador solicita el reporte,

**Entonces** el sistema debe generar un archivo PDF con la información de sostenibilidad y costos.

**Escenario 2: Ausencia de datos**

**Dado** que no existen rutas u operaciones para el periodo seleccionado,

**Cuando** el administrador solicita el reporte,

**Entonces** el sistema debe cancelar la generación e informar que no existen datos disponibles para elaborar el reporte.

##### Tareas y subtareas

* Diseñar estructura del reporte.
* Consultar información operativa.
* Consultar información ambiental.
* Calcular costos.
* Generar documento PDF.
* Implementar descarga.
* Gestionar reportes de gran volumen.
* Implementar notificación cuando corresponda.
* Validar información del reporte.
* Implementar pruebas.

---

#### US-010 – Gestionar propuesta de compensación de carbono

**ID:** US-010

**Título:** Gestionar propuesta de compensación de carbono

**Épica Relacionada:** EP-04 Sostenibilidad, Analítica y Reportes

**RF de origen:** RF-010 Plan y Propuesta de Compensación de Carbono

**Prioridad:** Could

**Story Points:** 5

**Redacción:**

**Como** responsable de sostenibilidad,

**quiero** calcular las emisiones acumuladas y generar una propuesta de compensación de carbono,

**para** conocer una alternativa de neutralización ambiental basada en los resultados de las operaciones.

##### Criterios de Aceptación

**Escenario 1: Cálculo de compensación**

**Dado** que existe información acumulada de emisiones de CO₂ y parámetros ambientales disponibles,

**Cuando** el responsable solicita la propuesta de compensación,

**Entonces** el sistema debe calcular la equivalencia correspondiente en créditos de carbono o árboles.

**Escenario 2: Error en parámetros ambientales**

**Dado** que existe un error en los factores de conversión o no está disponible la información de los proyectos ambientales,

**Cuando** se solicita el cálculo,

**Entonces** el sistema debe detener la operación e informar que no se puede realizar la conversión con los parámetros disponibles.

##### Tareas y subtareas

* Obtener emisiones acumuladas.
* Configurar factores de conversión.
* Calcular créditos de carbono.
* Calcular equivalencia en árboles.
* Distribuir compensación entre proyectos.
* Recalcular valores proporcionalmente.
* Generar propuesta.
* Exportar propuesta.
* Validar parámetros.
* Implementar pruebas.

---

## 5. Mapa de Transformación RNF → Enablers

| ID     | Enabler                                                 | RNF de origen | Tipo           | Épica |
| ------ | -------------------------------------------------------- | ------------- | -------------- | ----- |
| EN-001 | Validar rendimiento del motor de optimización           | RNF-001       | Rendimiento    | EP-05 |
| EN-002 | Implementar y validar controles de seguridad            | RNF-002       | Seguridad      | EP-05 |
| EN-003 | Validar accesibilidad WCAG 2.1 AA                       | RNF-003       | Accesibilidad  | EP-05 |
| EN-004 | Validar escalabilidad operativa                         | RNF-004       | Escalabilidad  | EP-05 |
| EN-005 | Implementar y validar usabilidad del modo conductor     | RNF-005       | Usabilidad     | EP-05 |
| EN-006 | Implementar monitoreo y contingencia de disponibilidad  | RNF-006       | Disponibilidad | EP-05 |
| EN-007 | Mantener documentación técnica y operativa              | RNF-007       | Documentación  | EP-05 |

---

## 6. Historias Técnicas / Enablers

### EN-001 – Validar rendimiento del motor de optimización

**ID:** EN-001

**Título:** Validar rendimiento del motor de optimización

**RNF de origen:** RNF-001

**Tipo:** Rendimiento

**Redacción:**

**Como** equipo técnico,

**quiero** validar el rendimiento del motor de optimización,

**para** garantizar que la generación y reoptimización de rutas cumplan los tiempos de respuesta establecidos.

#### Criterios de Aceptación

**Escenario 1: Optimización de carga establecida**

**Dado** que existen hasta 150 pedidos y 15 vehículos disponibles,

**Cuando** se ejecuta el proceso de optimización,

**Entonces** la solución debe generarse en un tiempo no mayor a 45 segundos.

**Escenario 2: Reoptimización**

**Dado** que existe una ruta activa que requiere ser recalculada,

**Cuando** se ejecuta la reoptimización,

**Entonces** el nuevo resultado debe generarse en un tiempo no mayor a 30 segundos.

#### Tareas

* Preparar pruebas de rendimiento.
* Crear datos de prueba.
* Ejecutar pruebas con 150 pedidos y 15 vehículos.
* Medir tiempo de optimización.
* Medir tiempo de reoptimización.
* Registrar resultados.
* Corregir problemas de rendimiento.

---

### EN-002 – Implementar y validar controles de seguridad

**ID:** EN-002

**Título:** Implementar y validar controles de seguridad

**RNF de origen:** RNF-002

**Tipo:** Seguridad

**Redacción:**

**Como** equipo técnico,

**quiero** implementar controles de autenticación, autorización y validación de entradas,

**para** proteger la información y evitar accesos o acciones no autorizadas.

#### Criterios de Aceptación

**Escenario 1: Acceso no autorizado**

**Dado** que un usuario no posee permisos para acceder a una funcionalidad,

**Cuando** intenta acceder a ella,

**Entonces** el sistema debe rechazar la operación y no permitir el acceso a la información protegida.

**Escenario 2: Vulnerabilidades críticas**

**Dado** que se ejecuta el análisis de seguridad de la versión evaluada,

**Cuando** finaliza el análisis,

**Entonces** no deben existir vulnerabilidades críticas explotables pendientes de corrección.

#### Tareas

* Implementar autenticación.
* Implementar autorización.
* Validar permisos.
* Validar entradas.
* Ejecutar análisis de seguridad.
* Corregir vulnerabilidades críticas.
* Ejecutar pruebas de seguridad.

---

### EN-003 – Validar accesibilidad WCAG 2.1 AA

**ID:** EN-003

**Título:** Validar accesibilidad WCAG 2.1 AA

**RNF de origen:** RNF-003

**Tipo:** Accesibilidad

**Redacción:**

**Como** equipo técnico,

**quiero** validar la accesibilidad de las principales interfaces del sistema,

**para** asegurar que cumplan los criterios aplicables de WCAG 2.1 nivel AA.

#### Criterios de Aceptación

**Escenario 1: Evaluación de interfaces**

**Dado** que las pantallas principales del sistema se encuentran implementadas,

**Cuando** se realiza la evaluación de accesibilidad,

**Entonces** se deben registrar los criterios WCAG 2.1 AA aplicables y sus resultados.

**Escenario 2: Corrección de incumplimientos**

**Dado** que se detectan incumplimientos durante la evaluación,

**Cuando** se aplican las correcciones,

**Entonces** se debe realizar una nueva evaluación para verificar los resultados.

#### Tareas

* Identificar criterios aplicables.
* Evaluar interfaces.
* Registrar incumplimientos.
* Aplicar correcciones.
* Revaluar interfaces.
* Documentar resultados.

---

### EN-004 – Validar escalabilidad operativa

**ID:** EN-004

**Título:** Validar escalabilidad operativa

**RNF de origen:** RNF-004

**Tipo:** Escalabilidad

**Redacción:**

**Como** equipo técnico,

**quiero** validar el comportamiento del sistema ante un volumen elevado de operaciones,

**para** comprobar que pueda procesar la carga operativa establecida.

#### Criterios de Aceptación

**Escenario 1: Carga operativa**

**Dado** que el sistema recibe hasta 1,000 pedidos diarios y administra hasta 50 vehículos,

**Cuando** se ejecutan los flujos operativos principales,

**Entonces** los procesos deben completarse sin errores atribuibles al volumen de información.

**Escenario 2: Degradación**

**Dado** que se ejecuta una prueba con la carga establecida,

**Cuando** se detecta degradación del rendimiento,

**Entonces** se debe registrar la evidencia y la métrica correspondiente.

#### Tareas

* Preparar datos de carga.
* Simular 1,000 pedidos.
* Simular 50 vehículos.
* Ejecutar pruebas de carga.
* Medir comportamiento.
* Registrar degradación.
* Documentar resultados.

---

### EN-005 – Validar usabilidad del modo conductor

**ID:** EN-005

**Título:** Validar usabilidad del modo conductor

**RNF de origen:** RNF-005

**Tipo:** Usabilidad

**Redacción:**

**Como** equipo técnico,

**quiero** implementar una interfaz simplificada para los conductores,

**para** permitir que consulten sus rutas y entregas sin acceder a funciones administrativas.

#### Criterios de Aceptación

**Escenario 1: Vista del conductor**

**Dado** que un conductor inicia sesión en el sistema,

**Cuando** accede a su vista operativa,

**Entonces** debe visualizar su ruta, entregas pendientes y alertas relevantes.

**Escenario 2: Restricción de funciones**

**Dado** que el usuario tiene el rol de conductor,

**Cuando** intenta acceder a una función administrativa,

**Entonces** el sistema debe impedir el acceso a dicha función.

#### Tareas

* Diseñar vista simplificada.
* Mostrar ruta.
* Mostrar entregas pendientes.
* Mostrar alertas.
* Configurar permisos.
* Bloquear funciones administrativas.
* Realizar pruebas de usabilidad.

---

### EN-006 – Implementar monitoreo y contingencia de disponibilidad

**ID:** EN-006

**Título:** Implementar monitoreo y contingencia de disponibilidad

**RNF de origen:** RNF-006

**Tipo:** Disponibilidad

**Redacción:**

**Como** equipo técnico,

**quiero** implementar mecanismos de monitoreo y recuperación ante interrupciones,

**para** mantener la continuidad de las operaciones y recuperar el sistema de forma controlada cuando ocurra una falla.

#### Criterios de Aceptación

**Escenario 1: Disponibilidad mensual**

**Dado** que el sistema debe operar dentro del horario establecido de 05:00 a 22:00,

**Cuando** se evalúa la disponibilidad mensual,

**Entonces** el objetivo de disponibilidad debe ser igual o superior al 99.5%.

**Escenario 2: Interrupción del servicio**

**Dado** que se simula una interrupción del sistema,

**Cuando** se ejecuta el mecanismo de contingencia,

**Entonces** el sistema debe mantener la continuidad disponible o ejecutar un proceso controlado de recuperación.

#### Tareas

* Configurar monitoreo.
* Registrar disponibilidad.
* Configurar alertas.
* Preparar mecanismo de recuperación.
* Simular interrupciones.
* Validar recuperación.
* Documentar resultados.

---

### EN-007 – Mantener documentación técnica y operativa

**ID:** EN-007

**Título:** Mantener documentación técnica y operativa

**RNF de origen:** RNF-007

**Tipo:** Documentación

**Redacción:**

**Como** equipo técnico,

**quiero** mantener actualizada la documentación técnica y operativa del sistema,

**para** asegurar que la información del proyecto corresponda con la versión implementada.

#### Criterios de Aceptación

**Escenario 1: Actualización documental**

**Dado** que se realiza un cambio en la arquitectura, API o funcionalidad del sistema,

**Cuando** el cambio es incorporado al proyecto,

**Entonces** se deben actualizar los documentos afectados.

**Escenario 2: Revisión de documentación**

**Dado** que se alcanza un hito del proyecto,

**Cuando** se revisa la documentación,

**Entonces** los documentos obligatorios correspondientes al hito deben encontrarse disponibles y alineados con la versión implementada.

#### Tareas

* Revisar documentación existente.
* Actualizar arquitectura.
* Actualizar documentación de API.
* Actualizar documentación funcional.
* Revisar cambios por versión.
* Validar consistencia documental.

---

## 7. Definition of Done (DoD) Global del Proyecto

Una Historia de Usuario o Historia Técnica se considerará **Done** únicamente cuando cumpla todos los criterios aplicables de la siguiente lista:

### 7.1 Pruebas unitarias

* La funcionalidad debe contar con pruebas unitarias.
* La cobertura de pruebas unitarias debe ser **igual o superior al 80%** en el código correspondiente a la funcionalidad implementada.
* Las pruebas deben ejecutarse correctamente antes de cerrar la historia.

### 7.2 Análisis estático y seguridad

* El código debe pasar el análisis estático mediante herramientas como **SonarQube o CodeQL**.
* No deben existir vulnerabilidades críticas pendientes en el alcance evaluado.
* Los problemas críticos detectados deben ser corregidos antes de considerar la historia terminada.

### 7.3 Revisión de código

* El código debe pasar por un proceso de **Peer Review**.
* La revisión debe ser aprobada por al menos un integrante técnico diferente al autor.
* La aprobación debe quedar registrada mediante un **Pull Request**.

### 7.4 Despliegue

* La funcionalidad debe poder desplegarse mediante el proceso automatizado definido por el proyecto.
* El despliegue debe ser ejecutable en el ambiente de **Staging/Pruebas**.
* La funcionalidad debe encontrarse disponible para su validación en dicho ambiente.

### 7.5 Documentación

* La documentación técnica y funcional relacionada con la historia debe estar actualizada.
* Las modificaciones de API deben reflejarse en **OpenAPI/Swagger**.
* Los cambios relevantes de código o arquitectura deben actualizar la documentación correspondiente.

### 7.6 Criterios de aceptación

* Todos los criterios de aceptación definidos para la Historia de Usuario o Enabler deben haber sido validados.
* Los escenarios BDD/Gherkin deben ejecutarse satisfactoriamente.
* No deben existir defectos críticos abiertos que impidan el uso de la funcionalidad.

### 7.7 Integración

* La funcionalidad debe estar integrada en la rama correspondiente del proyecto.
* El código debe cumplir las convenciones definidas por el equipo.
* La integración no debe introducir errores críticos en funcionalidades existentes.

---

## 8. Trazabilidad General

La trazabilidad de los requisitos se mantiene mediante la relación:

```text
RF / RNF
   │
   ├── RF → Épica → Historia de Usuario → Tareas/Subtareas
   │
   └── RNF → Enabler → Tareas/Subtareas
```

| Requisito | Épica | Elemento ágil | Tipo                 |
| --------- | ----- | -------------- | -------------------- |
| RF-001    | EP-01 | US-001         | Historia de Usuario  |
| RF-002    | EP-02 | US-003         | Historia de Usuario  |
| RF-003    | EP-03 | US-005         | Historia de Usuario  |
| RF-004    | EP-03 | US-006         | Historia de Usuario  |
| RF-005    | EP-04 | US-008         | Historia de Usuario  |
| RF-006    | EP-04 | US-009         | Historia de Usuario  |
| RF-007    | EP-03 | US-007         | Historia de Usuario  |
| RF-008    | EP-01 | US-002         | Historia de Usuario  |
| RF-009    | EP-02 | US-004         | Historia de Usuario  |
| RF-010    | EP-04 | US-010         | Historia de Usuario  |
| RNF-001   | EP-05 | EN-001         | Enabler              |
| RNF-002   | EP-05 | EN-002         | Enabler              |
| RNF-003   | EP-05 | EN-003         | Enabler              |
| RNF-004   | EP-05 | EN-004         | Enabler              |
| RNF-005   | EP-05 | EN-005         | Enabler              |
| RNF-006   | EP-05 | EN-006         | Enabler              |
| RNF-007   | EP-05 | EN-007         | Enabler              |

---

## 9. Resumen del Backlog

| Elemento                                | Cantidad                            |
| ---------------------------------------- | ------------------------------------ |
| Épicas                                  | 5                                    |
| Historias de Usuario                    | 10                                   |
| Enablers                                 | 7                                    |
| Requerimientos Funcionales cubiertos    | 10                                   |
| Requerimientos No Funcionales cubiertos | 7                                    |
| Tareas y subtareas                       | Derivadas durante la implementación |

La estructura propuesta permite mantener una relación directa entre los requisitos originales y el backlog ágil, evitando convertir cada operación de mantenimiento, como editar, actualizar o consultar, en una Historia de Usuario independiente.

Las tareas y subtareas representan el trabajo técnico necesario para completar cada historia, mientras que las Historias de Usuario mantienen el enfoque en el valor entregado al usuario y los Enablers permiten controlar los atributos técnicos y de calidad requeridos por el sistema.