[← Volver al README Principal](../../README.md)

# 01. Transformando a ágil 

---

## 1. Información del documento

| Campo | Detalle |
| :--- | :--- |
| **Nombre del Proyecto** | EcoLogistica-Lima: Plataforma Web y Móvil para la Gestión y Optimización de Logística Verde Urbana |
| **Código del Proyecto** | PFA-ECOLIMA-2026 |
| **Integrantes del Equipo** | • Zayuri Cerron Medina <br>• Jheferson Martinez Valerio <br>• Angela Rojas Quispe <br>• Maylit Mendoza Alarcon <br>• Diego Angulo Gonzales  |
| **Responsable del Documento**| Angela Rojas Quispe |
| **Fecha de Elaboración** | 4 de septiembre de 2026 |
| **Versión** | 1.0.0 |

---

# A. Metodología de Transformación

La transformación de los requerimientos del proyecto ****EcoLogística Lima**** se realiza siguiendo una estructura ágil, donde los requerimientos funcionales se organizan en épicas y posteriormente se descomponen en historias de usuario. Por otro lado, los requerimientos no funcionales se convierten principalmente en historias técnicas o ****Enablers****, debido a que representan condiciones relacionadas con rendimiento, seguridad, accesibilidad, disponibilidad, escalabilidad y documentación.

## 1\. Requerimientos Funcionales (RF) → Épicas → Historias de Usuario (US)

Los requerimientos funcionales se agrupan según la funcionalidad principal que representan dentro del sistema. De esta manera, se evita crear una épica por cada requisito cuando varios de ellos pertenecen a un mismo módulo o proceso.

### Mapeo de Requerimientos Funcionales

| RF     | Requerimiento Funcional                            | Épica                                      | Historia de Usuario |
| ------ | -------------------------------------------------- | ------------------------------------------ | ------------------- |
| RF-001 | Gestión de Flota y Emisiones                       | EP-01 Gestión de Vehículos                 | US-001              |
| RF-008 | Gestión de Conductores y Control de Jornada        | EP-02 Gestión de Conductores               | US-002              |
| RF-002 | Gestión y Geolocalización de Pedidos               | EP-03 Gestión de Pedidos y Geolocalización | US-003              |
| RF-009 | Módulo de Preferencias y Restricciones del Cliente | EP-04 Gestión de Clientes y Preferencias   | US-004              |
| RF-003 | Motor de Optimización de Rutas                     | EP-05 Optimización de Rutas                | US-005              |
| RF-004 | Visualización Geoespacial e Interactiva de Rutas   | EP-06 Monitoreo y Reoptimización de Rutas  | US-006              |
| RF-007 | Re-optimización Dinámica en Tiempo Real            | EP-06 Monitoreo y Reoptimización de Rutas  | US-007              |
| RF-005 | Dashboard Operativo y de Sostenibilidad            | EP-07 Analítica, Reportes y Sostenibilidad | US-008              |
| RF-006 | Generación de Reportes de Sostenibilidad y Costos  | EP-07 Analítica, Reportes y Sostenibilidad | US-009              |
| RF-010 | Plan y Propuesta de Compensación de Carbono        | EP-07 Analítica, Reportes y Sostenibilidad | US-010              |

### EP-01: Gestión de Vehículos

Esta épica agrupa las funcionalidades relacionadas con el registro, actualización, consulta y control de los vehículos de la flota, incluyendo sus características técnicas y restricciones de circulación.

****RF relacionado:**** RF-001  
****Historia:**** US-001

### EP-02: Gestión de Conductores

Esta épica comprende el registro y control de la información de los conductores, así como la validación de sus condiciones para la asignación de turnos y rutas.

****RF relacionado:**** RF-008  
****Historia:**** US-002

### EP-03: Gestión de Pedidos y Geolocalización

Esta épica reúne las funciones necesarias para registrar los pedidos, sus características de carga, ventanas de atención y ubicación geográfica.

****RF relacionado:**** RF-002  
****Historia:**** US-003

### EP-04: Gestión de Clientes y Preferencias

Esta épica comprende la configuración de horarios de atención, restricciones vehiculares y referencias necesarias para realizar correctamente las entregas.

****RF relacionado:**** RF-009  
****Historia:**** US-004

### EP-05: Optimización de Rutas

Esta épica agrupa las funciones relacionadas con la generación automática de rutas, asignación de pedidos a vehículos y organización de las paradas.

****RF relacionado:**** RF-003  
****Historia:**** US-005

### EP-06: Monitoreo y Reoptimización de Rutas

Esta épica reúne la visualización de las rutas y la capacidad del sistema para actualizar los recorridos cuando se presentan eventos que afectan la operación.

****RF relacionados:**** RF-004 y RF-007  
****Historias:**** US-006 y US-007

### EP-07: Analítica, Reportes y Sostenibilidad

Esta épica agrupa las funcionalidades relacionadas con indicadores operativos, sostenibilidad, generación de reportes y propuestas de compensación de carbono.

****RF relacionados:**** RF-005, RF-006 y RF-010  
****Historias:**** US-008, US-009 y US-010

## 2\. Requerimientos No Funcionales (RNF) → Enablers

Los requerimientos no funcionales se transforman en ****Enablers****, debido a que representan trabajos técnicos necesarios para garantizar que las funcionalidades del sistema puedan operar correctamente.

A diferencia de los RF, los RNF no representan directamente una funcionalidad que el usuario solicite, sino condiciones que debe cumplir la solución, como rendimiento, seguridad, accesibilidad, escalabilidad, disponibilidad y documentación.

### Mapeo de Requerimientos No Funcionales

| RNF     | Requerimiento No Funcional                       | Tipo de Enabler                  | Enabler |
| ------- | ------------------------------------------------ | -------------------------------- | ------- |
| RNF-001 | Rendimiento del algoritmo de optimización        | Rendimiento                      | EN-001  |
| RNF-002 | Seguridad de la aplicación y protección de datos | Seguridad                        | EN-002  |
| RNF-003 | Accesibilidad de la interfaz                     | Accesibilidad / Usabilidad       | EN-003  |
| RNF-004 | Escalabilidad operativa                          | Infraestructura / Rendimiento    | EN-004  |
| RNF-005 | Usabilidad para conductores                      | Usabilidad                       | EN-005  |
| RNF-006 | Disponibilidad del sistema                       | Infraestructura / Disponibilidad | EN-006  |
| RNF-007 | Documentación técnica y operativa                | Documentación / Mantenibilidad   | EN-007  |

Los Enablers definidos son:

-   ****EN-001:**** Validar el rendimiento del motor de optimización.
-   ****EN-002:**** Implementar y validar los controles de seguridad y protección de datos.
-   ****EN-003:**** Validar el cumplimiento de accesibilidad WCAG 2.1 nivel AA.
-   ****EN-004:**** Validar la capacidad de escalabilidad operativa del sistema.
-   ****EN-005:**** Validar la usabilidad de la vista destinada a los conductores.
-   ****EN-006:**** Implementar el monitoreo de disponibilidad y mecanismos de continuidad.
-   ****EN-007:**** Mantener actualizada la documentación técnica y operativa del proyecto.

Los Enablers permiten que los RNF puedan ser planificados y verificados dentro del desarrollo ágil, sin mezclarlos directamente con las historias funcionales.

  

# B. Estructura Estándar de Historias de Usuario (US)

Las historias de usuario se construyen a partir de los requerimientos funcionales definidos para la versión ****V\_1\_0\_0****. Cada historia mantiene la trazabilidad con su requerimiento funcional y épica correspondiente. Además, se incluyen los criterios de aceptación y las tareas o subtareas necesarias para implementar cada funcionalidad.

#### US-001 – Gestionar vehículos de la flota

****ID:**** US-001

****Título:**** Gestionar vehículos de la flota

****Épica Relacionada:**** EP-01 Gestión de Vehículos

****RF de origen:**** RF-001 Gestión de Flota y Emisiones

****Prioridad:**** Must

****Story Points:**** 5

****Redacción:****

****Como**** administrador de flota,

****quiero**** registrar, consultar y actualizar los vehículos de la flota considerando sus características técnicas y ambientales,

****para**** mantener información válida para la planificación de las operaciones y aplicar las restricciones de circulación correspondientes.

##### Criterios de Aceptación

****Escenario 1: Registro de vehículo con información válida****

****Dado**** que el administrador está autenticado y cuenta con permisos de gestión de flota,

****Cuando**** registra un vehículo con placa, tipo, capacidad, consumo y factor de emisión válidos,

****Entonces**** el sistema debe guardar el vehículo con estado ****Activo**** y confirmar el registro en menos de 1 segundo.

****Escenario 2: Registro de placa duplicada****

****Dado**** que ya existe un vehículo registrado con una determinada placa,

****Cuando**** el administrador intenta registrar otro vehículo utilizando la misma placa,

****Entonces**** el sistema debe rechazar la operación, mantener la información existente y mostrar el mensaje ****"La placa ingresada ya se encuentra registrada en el sistema."****

##### Tareas y subtareas

-   Diseñar el formulario de gestión de vehículos.
-   -   Definir campos de placa, tipo, capacidad, consumo y factor de emisión.
    -   Validar los campos obligatorios.
-   Implementar el registro de vehículos.
-   Implementar la consulta y actualización de vehículos.
-   Validar placas duplicadas.
-   Registrar características técnicas y ambientales.
-   Implementar la asignación automática de restricciones de circulación.
-   Realizar pruebas unitarias y de integración.
-   Documentar la funcionalidad.

#### US-002 – Gestionar conductores y jornada

****ID:**** US-002

****Título:**** Gestionar conductores y jornada

****Épica Relacionada:**** EP-02 Gestión de Conductores

****RF de origen:**** RF-008 Gestión de Conductores y Control de Jornada

****Prioridad:**** Must

****Story Points:**** 3

****Redacción:****

****Como**** administrador o despachador,

****quiero**** registrar conductores y validar sus condiciones de jornada antes de asignarles rutas,

****para**** evitar asignaciones que superen los límites establecidos para la operación.

##### Criterios de Aceptación

****Escenario 1: Registro de conductor****

****Dado**** que el administrador está autenticado,

****Cuando**** registra un conductor con DNI, licencia vigente y punto de partida autorizado,

****Entonces**** el sistema debe guardar el perfil y establecer su estado como ****Disponible****.

****Escenario 2: Exceso de jornada****

****Dado**** que un conductor ha cumplido 7.5 horas de manejo durante su jornada,

****Cuando**** el despachador intenta asignarle una nueva ruta estimada en 1.5 horas,

****Entonces**** el sistema debe bloquear la asignación y mostrar el mensaje ****"Asignación rechazada: Supera el límite legal de 8 horas diarias (Ley N° 30224)."****

##### Tareas y subtareas

-   Diseñar el formulario de registro de conductores.
-   -   Definir datos personales y laborales.
    -   Definir información de licencia.
-   Implementar el registro y consulta de conductores.
-   Validar los datos de licencia.
-   Implementar el control de horas de conducción.
-   Validar disponibilidad antes de asignar una ruta.
-   Configurar el punto de origen del conductor.
-   Implementar bloqueo de asignaciones que superen el límite establecido.
-   Realizar pruebas funcionales y unitarias.
-   Documentar la funcionalidad.

#### US-003 – Registrar pedidos y geolocalización

****ID:**** US-003

****Título:**** Registrar pedidos y geolocalización

****Épica Relacionada:**** EP-03 Gestión de Pedidos y Geolocalización

****RF de origen:**** RF-002 Gestión y Geolocalización de Pedidos

****Prioridad:**** Must

****Story Points:**** 5

****Redacción:****

****Como**** usuario del área de ventas,

****quiero**** registrar los pedidos con sus dimensiones, ventanas de tiempo y ubicación geográfica,

****para**** disponer de información válida para la posterior planificación de las entregas.

##### Criterios de Aceptación

****Escenario 1: Registro de pedido válido****

****Dado**** que el usuario está autenticado y cuenta con los datos del cliente y su dirección,

****Cuando**** registra un pedido con peso, volumen y ventana de tiempo válidos,

****Entonces**** el sistema debe calcular las coordenadas GPS, guardar el pedido y asignarle el estado ****Pendiente de Programación****.

****Escenario 2: Ubicación manual****

****Dado**** que el pedido corresponde a una zona sin nomenclatura urbana estándar,

****Cuando**** el usuario selecciona manualmente el punto en el mapa y registra una referencia,

****Entonces**** el sistema debe almacenar las coordenadas seleccionadas junto con la referencia textual.

##### Tareas y subtareas

-   Diseñar el formulario de registro de pedidos.
-   -   Incorporar peso y volumen.
    -   Incorporar ventana de tiempo.
    -   Incorporar datos de ubicación.
-   Implementar el registro y consulta de pedidos.
-   Integrar el servicio de geolocalización.
-   Implementar selección manual de coordenadas.
-   Validar dimensiones de carga.
-   Validar ventanas de tiempo.
-   Asignar automáticamente el estado del pedido.
-   Realizar pruebas funcionales y unitarias.
-   Documentar la funcionalidad.

#### US-004 – Gestionar preferencias y restricciones del cliente

****ID:**** US-004

****Título:**** Gestionar preferencias y restricciones del cliente

****Épica Relacionada:**** EP-04 Gestión de Clientes y Preferencias

****RF de origen:**** RF-009 Módulo de Preferencias y Restricciones del Cliente

****Prioridad:**** Should

****Story Points:**** 3

****Redacción:****

****Como**** cliente,

****quiero**** configurar mis horarios de atención, restricciones de acceso y referencias de entrega,

****para**** facilitar que las entregas se realicen de acuerdo con las condiciones de mi establecimiento.

##### Criterios de Aceptación

****Escenario 1: Actualización de preferencias****

****Dado**** que el cliente está autenticado en la plataforma,

****Cuando**** modifica sus horarios de atención y restricciones de acceso vehicular,

****Entonces**** el sistema debe guardar los cambios y aplicarlos como restricciones en futuros cálculos de rutas.

****Escenario 2: Pedido en tránsito****

****Dado**** que un pedido tiene una ruta activa en proceso de entrega,

****Cuando**** el cliente intenta modificar sus preferencias para dicho pedido,

****Entonces**** el sistema debe rechazar la modificación y mostrar el mensaje ****"No se pueden alterar las preferencias de un pedido en tránsito."****

##### Tareas y subtareas

-   Diseñar la interfaz de preferencias del cliente.
-   Implementar configuración de horarios de atención.
-   Implementar restricciones de acceso vehicular.
-   Implementar registro de referencias de entrega.
-   Permitir adjuntar fotografías de referencia.
-   Integrar las preferencias con el módulo de ruteo.
-   Validar restricciones para pedidos en tránsito.
-   Realizar pruebas funcionales.
-   Documentar la funcionalidad.

#### US-005 – Generar rutas optimizadas

****ID:**** US-005

****Título:**** Generar rutas optimizadas

****Épica Relacionada:**** EP-05 Optimización de Rutas

****RF de origen:**** RF-003 Motor de Optimización de Rutas

****Prioridad:**** Must

****Story Points:**** 13

****Redacción:****

****Como**** operador logístico,

****quiero**** generar automáticamente rutas asignando pedidos a los vehículos disponibles y organizando la secuencia de paradas,

****para**** realizar las entregas de manera eficiente considerando las restricciones operativas.

##### Criterios de Aceptación

****Escenario 1: Generación de rutas****

****Dado**** que existen pedidos pendientes y vehículos disponibles con sus capacidades y restricciones configuradas,

****Cuando**** el operador ejecuta la generación automática de rutas,

****Entonces**** el sistema debe generar una solución válida considerando distancia, tiempo y emisiones de CO2 sin incumplir las restricciones configuradas.

****Escenario 2: Exceso de capacidad****

****Dado**** que la demanda total de los pedidos supera la capacidad combinada de la flota disponible,

****Cuando**** el operador solicita la optimización,

****Entonces**** el sistema debe asignar la cantidad máxima posible, marcar los pedidos restantes como ****"No Asignados por Exceso de Capacidad"**** y notificar al operador.

##### Tareas y subtareas

-   Diseñar la estructura del motor de optimización.
-   -   Definir entradas del algoritmo.
    -   Definir restricciones de vehículos.
    -   Definir restricciones de pedidos.
-   Implementar la asignación de pedidos a vehículos.
-   Implementar la secuencia de paradas.
-   Incorporar restricciones de capacidad.
-   Incorporar ventanas de tiempo.
-   Incorporar restricciones de circulación.
-   Considerar distancia, tiempo y emisiones de CO2.
-   Implementar control de exceso de capacidad.
-   Implementar descansos técnicos dentro de la planificación.
-   Integrar el motor con el módulo de pedidos.
-   Realizar pruebas de optimización.
-   Documentar la solución implementada.

#### US-006 – Visualizar rutas en el mapa

****ID:**** US-006

****Título:**** Visualizar rutas en el mapa

****Épica Relacionada:**** EP-06 Monitoreo y Reoptimización de Rutas

****RF de origen:**** RF-004 Visualización Geoespacial e Interactiva de Rutas

****Prioridad:**** Must

****Story Points:**** 8

****Redacción:****

****Como**** despachador,

****quiero**** visualizar las rutas, paradas, condiciones de tráfico y zonas de riesgo en un mapa interactivo,

****para**** monitorear el desarrollo de las rutas y conocer posibles condiciones que afecten la operación.

##### Criterios de Aceptación

****Escenario 1: Visualización de ruta activa****

****Dado**** que el despachador está autenticado y existe una ruta activa,

****Cuando**** selecciona la ruta en el monitor,

****Entonces**** el sistema debe mostrar el trazado, las paradas y la información de tráfico en el mapa.

****Escenario 2: Zona de riesgo****

****Dado**** que una ruta atraviesa una zona catalogada como de alto riesgo,

****Cuando**** el sistema carga la información geográfica,

****Entonces**** debe mostrar el área de riesgo mediante un polígono y presentar un aviso preventivo.

##### Tareas y subtareas

-   Diseñar la vista del monitor de rutas.
-   Integrar el proveedor de mapas.
-   Implementar visualización de rutas.
-   Implementar marcadores de paradas.
-   Implementar representación del estado del tráfico.
-   Implementar polígonos de zonas de riesgo.
-   Mostrar avisos preventivos.
-   Implementar una vista alternativa cuando el servicio de mapas no esté disponible.
-   Realizar pruebas de visualización.
-   Documentar la funcionalidad.

#### US-007 – Reoptimizar rutas ante eventos

****ID:**** US-007

****Título:**** Reoptimizar rutas ante eventos

****Épica Relacionada:**** EP-06 Monitoreo y Reoptimización de Rutas

****RF de origen:**** RF-007 Re-optimización Dinámica en Tiempo Real

****Prioridad:**** Must

****Story Points:**** 8

****Redacción:****

****Como**** operador logístico,

****quiero**** recalcular una ruta activa cuando ocurra un evento que afecte el recorrido,

****para**** actualizar el itinerario y reducir el impacto de incidentes sobre las entregas programadas.

##### Criterios de Aceptación

****Escenario 1: Cierre de vía****

****Dado**** que un vehículo se encuentra realizando una ruta y existe una alerta confirmada de cierre de vía,

****Cuando**** el sistema procesa el evento,

****Entonces**** debe recalcular la ruta evitando el tramo afectado y enviar el nuevo itinerario al dispositivo del conductor.

****Escenario 2: Aplicación del conductor sin conexión****

****Dado**** que la aplicación del conductor pierde la conexión a Internet durante una reoptimización,

****Cuando**** el servidor genera la nueva ruta,

****Entonces**** el sistema debe mantener la notificación en cola, reintentar el envío y conservar la última ruta conocida en el dispositivo.

##### Tareas y subtareas

-   Diseñar el mecanismo de detección de eventos.
-   Implementar recepción de incidentes viales.
-   Implementar reoptimización de rutas activas.
-   Integrar el motor de optimización.
-   Actualizar el itinerario del conductor.
-   Implementar envío de notificaciones.
-   Implementar cola y reintentos de notificaciones.
-   Mantener la última ruta disponible en modo sin conexión.
-   Implementar redistribución de pedidos ante averías.
-   Realizar pruebas de reoptimización.
-   Documentar la funcionalidad.

#### US-008 – Consultar indicadores operativos y de sostenibilidad

****ID:**** US-008

****Título:**** Consultar indicadores operativos y de sostenibilidad

****Épica Relacionada:**** EP-07 Analítica, Reportes y Sostenibilidad

****RF de origen:**** RF-005 Dashboard Operativo y de Sostenibilidad

****Prioridad:**** Should

****Story Points:**** 5

****Redacción:****

****Como**** supervisor,

****quiero**** consultar indicadores de distancia, consumo, emisiones de CO2, ahorro y equivalencias ambientales,

****para**** conocer el comportamiento operativo y ambiental de las rutas realizadas.

##### Criterios de Aceptación

****Escenario 1: Visualización de indicadores****

****Dado**** que el supervisor tiene permisos para consultar el dashboard,

****Cuando**** se actualiza el avance o cierre de una ruta,

****Entonces**** el sistema debe calcular y mostrar las métricas operativas y ambientales correspondientes.

****Escenario 2: Sin información histórica****

****Dado**** que no existen registros históricos para realizar una comparación,

****Cuando**** el dashboard calcula los indicadores,

****Entonces**** debe mostrar las métricas absolutas y establecer el diferencial comparativo en ****0%****.

##### Tareas y subtareas

-   Diseñar el dashboard operativo.
-   Definir los indicadores de operación.
-   Implementar cálculo de distancia y consumo.
-   Implementar cálculo de emisiones de CO2.
-   Implementar cálculo de ahorros monetarios.
-   Implementar equivalencias ambientales.
-   Implementar actualización de indicadores.
-   Implementar manejo de ausencia de datos históricos.
-   Implementar manejo de errores analíticos.
-   Realizar pruebas funcionales.
-   Documentar la funcionalidad.

#### US-009 – Generar reportes de sostenibilidad y costos

****ID:**** US-009

****Título:**** Generar reportes de sostenibilidad y costos

****Épica Relacionada:**** EP-07 Analítica, Reportes y Sostenibilidad

****RF de origen:**** RF-006 Generación de Reportes de Sostenibilidad y Costos

****Prioridad:**** Should

****Story Points:**** 3

****Redacción:****

****Como**** administrador,

****quiero**** generar reportes en formato PDF sobre las emisiones y costos de la flota para un periodo determinado,

****para**** disponer de información consolidada para el seguimiento de la operación.

##### Criterios de Aceptación

****Escenario 1: Generación del reporte****

****Dado**** que existen operaciones completadas dentro del periodo seleccionado,

****Cuando**** el administrador solicita la generación del reporte,

****Entonces**** el sistema debe generar el PDF con la información consolidada y permitir su descarga.

****Escenario 2: Periodo sin información****

****Dado**** que no existen rutas ni datos registrados en el periodo seleccionado,

****Cuando**** el administrador solicita el reporte,

****Entonces**** el sistema debe cancelar la generación y mostrar el mensaje ****"No se encontraron datos para generar el reporte en el periodo especificado."****

##### Tareas y subtareas

-   Diseñar la estructura del reporte.
-   Implementar selección del periodo.
-   Implementar consulta de información operativa.
-   Implementar cálculo y desglose de emisiones.
-   Implementar cálculo de costos.
-   Implementar generación del archivo PDF.
-   Implementar descarga del reporte.
-   Implementar procesamiento en segundo plano para grandes volúmenes.
-   Implementar notificación con enlace de descarga.
-   Validar ausencia de información.
-   Realizar pruebas de generación.
-   Documentar la funcionalidad.

#### US-010 – Generar propuesta de compensación de carbono

****ID:**** US-010

****Título:**** Generar propuesta de compensación de carbono

****Épica Relacionada:**** EP-07 Analítica, Reportes y Sostenibilidad

****RF de origen:**** RF-010 Plan y Propuesta de Compensación de Carbono

****Prioridad:**** Could

****Story Points:**** 5

****Redacción:****

****Como**** responsable de sostenibilidad,

****quiero**** calcular las emisiones acumuladas y generar una propuesta de compensación mediante créditos de carbono y árboles,

****para**** contar con una estimación de las acciones necesarias para compensar las emisiones generadas por la operación.

##### Criterios de Aceptación

****Escenario 1: Generación de propuesta****

****Dado**** que existen emisiones de CO2 acumuladas durante un periodo,

****Cuando**** el responsable ejecuta la generación del plan de compensación,

****Entonces**** el sistema debe calcular la equivalencia en créditos de carbono y árboles requeridos.

****Escenario 2: Distribución entre proyectos****

****Dado**** que existe un plan de compensación generado,

****Cuando**** el usuario selecciona diferentes proyectos ambientales configurados,

****Entonces**** el sistema debe recalcular la distribución proporcional de árboles por proyecto y permitir exportar la propuesta.

##### Tareas y subtareas

-   Diseñar el módulo de compensación de carbono.
-   Implementar consulta de emisiones acumuladas.
-   Implementar factores de conversión ambiental.
-   Calcular equivalencia en créditos de carbono.
-   Calcular equivalencia en árboles.
-   Implementar distribución entre proyectos ambientales.
-   Implementar recálculo proporcional.
-   Implementar exportación de la propuesta.
-   Implementar manejo de errores de parámetros ambientales.
-   Realizar pruebas funcionales.
-   Documentar la funcionalidad.

## Resumen de Historias de Usuario

| ID     | Épica                                      | RF de origen | Prioridad | Story Points |
| ------ | ------------------------------------------ | ------------ | --------- | ------------ |
| US-001 | EP-01 Gestión de Vehículos                 | RF-001       | Must      | 5            |
| US-002 | EP-02 Gestión de Conductores               | RF-008       | Must      | 3            |
| US-003 | EP-03 Gestión de Pedidos y Geolocalización | RF-002       | Must      | 5            |
| US-004 | EP-04 Gestión de Clientes y Preferencias   | RF-009       | Should    | 3            |
| US-005 | EP-05 Optimización de Rutas                | RF-003       | Must      | 13           |
| US-006 | EP-06 Monitoreo y Reoptimización de Rutas  | RF-004       | Must      | 8            |
| US-007 | EP-06 Monitoreo y Reoptimización de Rutas  | RF-007       | Must      | 8            |
| US-008 | EP-07 Analítica, Reportes y Sostenibilidad | RF-005       | Should    | 5            |
| US-009 | EP-07 Analítica, Reportes y Sostenibilidad | RF-006       | Should    | 3            |
| US-010 | EP-07 Analítica, Reportes y Sostenibilidad | RF-010       | Could     | 5            |

****Total de Story Points: 58****

### C. Criterios de Aceptación bajo Sintaxis BDD (Gherkin)

Toda Historia de Usuario y Enabler debe incluir al menos ****dos (2) Criterios de Aceptación****, estructurados formalmente mediante la sintaxis Gherkin (__Dado... Cuando... Entonces...__). Los criterios permiten verificar de manera objetiva el comportamiento esperado del sistema y el cumplimiento de los requisitos funcionales y no funcionales asociados.

La estructura utilizada para cada criterio es:

****Escenario:**** \[Título descriptivo del escenario de prueba\]

****Dado:**** \[Contexto previo o precondición del sistema\]

****Cuando:**** \[Acción o evento ejecutado por el usuario o sistema\]

****Entonces:**** \[Resultado esperado o estado final verificable\]

## C.1 Criterios de aceptación de las Historias de Usuario

### US-001 – Gestionar vehículos de la flota

****Criterio de Aceptación 1****

****Escenario:**** Registrar un vehículo con información válida

****Dado**** que el administrador de flota se encuentra en el módulo de gestión de vehículos y dispone de los datos técnicos y ambientales del vehículo,

****Cuando**** registra un vehículo con una placa que no existe previamente en el sistema y completa todos los campos obligatorios,

****Entonces**** el sistema debe registrar el vehículo correctamente, mostrar una confirmación de registro y dejarlo disponible para las operaciones de planificación.

****Criterio de Aceptación 2****

****Escenario:**** Rechazar el registro de una placa duplicada

****Dado**** que existe un vehículo registrado con una determinada placa,

****Cuando**** el administrador intenta registrar otro vehículo utilizando la misma placa,

****Entonces**** el sistema debe rechazar el registro y mostrar el mensaje: ****“La placa ingresada ya se encuentra registrada en el sistema.”****

### US-002 – Gestionar conductores y jornada

****Criterio de Aceptación 1****

****Escenario:**** Registrar un conductor disponible

****Dado**** que el administrador o despachador dispone de los datos personales, laborales, licencia de conducir y punto de origen del conductor,

****Cuando**** registra al conductor con información válida,

****Entonces**** el sistema debe crear el perfil del conductor y establecer su estado como ****“Disponible”****.

****Criterio de Aceptación 2****

****Escenario:**** Rechazar una asignación que exceda la jornada permitida

****Dado**** que un conductor ya acumula 7.5 horas de conducción y se intenta asignarle una ruta adicional de 1.5 horas,

****Cuando**** el despachador confirma la asignación de la ruta,

****Entonces**** el sistema debe rechazar la asignación e informar que se supera el límite de jornada establecido.

### US-003 – Registrar pedidos y geolocalización

****Criterio de Aceptación 1****

****Escenario:**** Registrar un pedido con información válida y geolocalización

****Dado**** que el usuario de ventas dispone de la información del pedido, incluyendo peso, volumen, ventana horaria y dirección de entrega,

****Cuando**** registra el pedido con información válida,

****Entonces**** el sistema debe almacenar el pedido, determinar sus coordenadas geográficas y establecer su estado como ****“Pendiente de Programación”****.

****Criterio de Aceptación 2****

****Escenario:**** Seleccionar manualmente la ubicación de un pedido

****Dado**** que la dirección ingresada no puede ser geolocalizada automáticamente de manera precisa,

****Cuando**** el usuario selecciona manualmente la ubicación correspondiente sobre el mapa,

****Entonces**** el sistema debe guardar las coordenadas seleccionadas junto con la referencia textual de la ubicación del pedido.

### US-004 – Gestionar preferencias y restricciones del cliente

****Criterio de Aceptación 1****

****Escenario:**** Actualizar preferencias de entrega de un cliente

****Dado**** que el cliente tiene configuradas sus preferencias de entrega,

****Cuando**** modifica su horario de atención, restricciones de acceso o referencias de entrega,

****Entonces**** el sistema debe guardar la nueva configuración y considerarla en la planificación de futuras rutas.

****Criterio de Aceptación 2****

****Escenario:**** Impedir modificaciones de preferencias de un pedido en tránsito

****Dado**** que un pedido se encuentra actualmente en tránsito,

****Cuando**** el cliente intenta modificar las preferencias o restricciones asociadas al pedido,

****Entonces**** el sistema debe rechazar la modificación y mostrar el mensaje: ****“No se pueden alterar las preferencias de un pedido en tránsito.”****

### US-005 – Generar rutas optimizadas

****Criterio de Aceptación 1****

****Escenario:**** Generar una solución de rutas respetando las restricciones operativas

****Dado**** que existen pedidos pendientes de programación y vehículos disponibles,

****Cuando**** el operador ejecuta el proceso de optimización,

****Entonces**** el sistema debe generar una solución de rutas asignando los pedidos a los vehículos disponibles y respetando las restricciones de capacidad, ventanas horarias, circulación y demás condiciones operativas definidas.

****Criterio de Aceptación 2****

****Escenario:**** Gestionar pedidos cuando la demanda supera la capacidad disponible

****Dado**** que la demanda total de los pedidos pendientes supera la capacidad disponible de la flota,

****Cuando**** el operador ejecuta la optimización,

****Entonces**** el sistema debe asignar los pedidos que puedan ser atendidos y marcar los restantes como ****“No Asignados por Exceso de Capacidad”****, informando esta situación al operador.

### US-006 – Visualizar rutas en el mapa

****Criterio de Aceptación 1****

****Escenario:**** Visualizar una ruta activa

****Dado**** que existe una ruta activa asignada a un vehículo,

****Cuando**** el despachador selecciona dicha ruta en el módulo de monitoreo,

****Entonces**** el sistema debe mostrar en el mapa el trazado de la ruta, sus puntos de parada y la información de tráfico disponible.

****Criterio de Aceptación 2****

****Escenario:**** Identificar una zona de riesgo en la ruta

****Dado**** que una ruta activa atraviesa una zona identificada como de alto riesgo,

****Cuando**** el sistema representa la ruta sobre el mapa,

****Entonces**** debe visualizar la zona de riesgo y mostrar una advertencia preventiva al despachador.

### US-007 – Reoptimizar rutas ante eventos

****Criterio de Aceptación 1****

****Escenario:**** Reoptimizar una ruta ante el cierre de una vía

****Dado**** que existe una ruta activa y se confirma el cierre de una vía incluida en su recorrido,

****Cuando**** el sistema ejecuta el proceso de reoptimización,

****Entonces**** debe generar una nueva alternativa evitando el tramo afectado y actualizar el itinerario de la ruta.

****Criterio de Aceptación 2****

****Escenario:**** Mantener la última ruta conocida cuando el conductor está desconectado

****Dado**** que una ruta activa requiere reoptimización y la aplicación del conductor se encuentra temporalmente sin conexión,

****Cuando**** el sistema genera la nueva ruta,

****Entonces**** debe conservar disponible la última ruta conocida en el dispositivo y dejar la nueva información pendiente de sincronización hasta recuperar la conexión.

### US-008 – Consultar indicadores operativos y de sostenibilidad

****Criterio de Aceptación 1****

****Escenario:**** Actualizar indicadores después de una operación

****Dado**** que existen datos de rutas ejecutadas y operaciones registradas,

****Cuando**** se actualiza la información operativa,

****Entonces**** el dashboard debe mostrar los indicadores correspondientes de distancia recorrida, consumo, emisiones de CO₂, ahorro y equivalentes ambientales.

****Criterio de Aceptación 2****

****Escenario:**** Mostrar indicadores cuando no existen datos históricos

****Dado**** que no existen registros históricos suficientes para realizar una comparación,

****Cuando**** el supervisor consulta el dashboard,

****Entonces**** el sistema debe mostrar los valores absolutos disponibles y evitar presentar una variación histórica que no pueda ser calculada.

### US-009 – Generar reportes de sostenibilidad y costos

****Criterio de Aceptación 1****

****Escenario:**** Generar un reporte con información disponible

****Dado**** que existen operaciones registradas dentro del periodo seleccionado,

****Cuando**** el administrador solicita la generación del reporte,

****Entonces**** el sistema debe generar un archivo PDF que contenga la información de sostenibilidad y costos correspondiente al periodo seleccionado.

****Criterio de Aceptación 2****

****Escenario:**** Solicitar un reporte sin información disponible

****Dado**** que no existen operaciones registradas durante el periodo seleccionado,

****Cuando**** el administrador solicita la generación del reporte,

****Entonces**** el sistema debe cancelar la generación e informar: ****“No se encontraron datos para generar el reporte en el periodo especificado.”****

### US-010 – Generar propuesta de compensación de carbono

****Criterio de Aceptación 1****

****Escenario:**** Calcular una propuesta de compensación a partir de las emisiones

****Dado**** que el sistema dispone de las emisiones acumuladas de CO₂ correspondientes al periodo seleccionado,

****Cuando**** el responsable de sostenibilidad solicita el cálculo de compensación,

****Entonces**** el sistema debe calcular los equivalentes de compensación definidos para créditos de carbono y árboles.

****Criterio de Aceptación 2****

****Escenario:**** Recalcular la distribución de compensación entre proyectos

****Dado**** que existe una propuesta de compensación y el responsable selecciona los proyectos ambientales participantes,

****Cuando**** modifica la distribución entre los proyectos seleccionados,

****Entonces**** el sistema debe recalcular proporcionalmente la distribución de árboles y permitir la generación o exportación de la propuesta actualizada.

## C.2 Criterios de aceptación de los Enablers

Los Enablers representan las condiciones técnicas necesarias para soportar las Historias de Usuario y garantizar atributos relacionados con rendimiento, seguridad, accesibilidad, escalabilidad, usabilidad, disponibilidad y documentación.

### EN-001 – Rendimiento del algoritmo de optimización

****Criterio de Aceptación 1****

****Escenario:**** Ejecutar la optimización dentro del tiempo establecido

****Dado**** que el sistema cuenta con una carga de operación dentro de los parámetros definidos para la solución,

****Cuando**** el operador ejecuta el algoritmo de optimización,

****Entonces**** el sistema debe generar una solución válida dentro del tiempo máximo establecido por el ****RNF-001****.

****Criterio de Aceptación 2****

****Escenario:**** Ejecutar la reoptimización dentro del tiempo establecido

****Dado**** que existe una ruta activa afectada por un evento que requiere una nueva planificación,

****Cuando**** el sistema ejecuta el proceso de reoptimización,

****Entonces**** debe generar una nueva solución válida dentro del tiempo máximo de respuesta establecido por el ****RNF-001****.

### EN-002 – Seguridad de la aplicación y protección de datos

****Criterio de Aceptación 1****

****Escenario:**** Validar el acceso de usuarios autenticados

****Dado**** que un usuario intenta acceder a un módulo protegido de la aplicación,

****Cuando**** proporciona sus credenciales,

****Entonces**** el sistema debe permitir el acceso únicamente cuando las credenciales sean válidas y el usuario cuente con los permisos correspondientes.

****Criterio de Aceptación 2****

****Escenario:**** Impedir el acceso no autorizado a información protegida

****Dado**** que un usuario no posee permisos para acceder a determinada información o funcionalidad,

****Cuando**** intenta realizar una operación restringida,

****Entonces**** el sistema debe rechazar la solicitud y no debe exponer la información protegida.

### EN-003 – Accesibilidad de la interfaz

****Criterio de Aceptación 1****

****Escenario:**** Navegar por los controles principales de la aplicación

****Dado**** que un usuario accede a una interfaz del sistema,

****Cuando**** utiliza los mecanismos de navegación disponibles,

****Entonces**** los controles y funcionalidades principales deben poder identificarse y utilizarse de acuerdo con los criterios de accesibilidad establecidos para el sistema.

****Criterio de Aceptación 2****

****Escenario:**** Identificar información mediante elementos visuales y textuales

****Dado**** que la interfaz presenta información, controles, alertas o mensajes,

****Cuando**** el usuario consulta dichos elementos,

****Entonces**** la información relevante debe presentarse mediante elementos identificables y comprensibles, respetando los criterios de accesibilidad definidos en el ****RNF-003****.

### EN-004 – Escalabilidad operativa

****Criterio de Aceptación 1****

****Escenario:**** Procesar el volumen operativo definido

****Dado**** que el sistema recibe una carga correspondiente al volumen operativo establecido en el ****RNF-004****,

****Cuando**** se ejecutan las operaciones de gestión y planificación,

****Entonces**** el sistema debe procesar dicha carga sin incumplir las condiciones de rendimiento y operación definidas.

****Criterio de Aceptación 2****

****Escenario:**** Incrementar la carga de operaciones

****Dado**** que el volumen de pedidos y vehículos aumenta dentro de los límites establecidos para la solución,

****Cuando**** el sistema procesa la nueva carga,

****Entonces**** debe continuar operando sin pérdida de integridad de los datos ni interrupciones incompatibles con los parámetros definidos en el ****RNF-004****.

### EN-005 – Usabilidad para conductores

****Criterio de Aceptación 1****

****Escenario:**** Consultar una ruta desde la aplicación del conductor

****Dado**** que el conductor tiene una ruta asignada,

****Cuando**** accede a la aplicación durante su jornada,

****Entonces**** debe poder identificar y consultar de forma clara la ruta, las paradas y las indicaciones necesarias para ejecutar la operación.

****Criterio de Aceptación 2****

****Escenario:**** Recibir información ante una modificación de ruta

****Dado**** que una ruta asignada ha sido modificada mediante el proceso de reoptimización,

****Cuando**** el dispositivo del conductor recibe la actualización,

****Entonces**** la aplicación debe presentar de forma clara la nueva información de ruta y las indicaciones correspondientes.

### EN-006 – Disponibilidad del sistema

****Criterio de Aceptación 1****

****Escenario:**** Mantener la disponibilidad requerida del sistema

****Dado**** que el sistema se encuentra en operación,

****Cuando**** los usuarios acceden a las funcionalidades disponibles durante el periodo de servicio,

****Entonces**** el sistema debe mantener el nivel de disponibilidad establecido en el ****RNF-006****.

****Criterio de Aceptación 2****

****Escenario:**** Recuperar la operación después de una interrupción

****Dado**** que se produce una interrupción temporal del servicio,

****Cuando**** se ejecutan los mecanismos de recuperación definidos,

****Entonces**** el sistema debe restablecer la operación y conservar la integridad de la información registrada.

### EN-007 – Documentación técnica y operativa

****Criterio de Aceptación 1****

****Escenario:**** Mantener actualizada la documentación técnica

****Dado**** que se incorpora o modifica una funcionalidad o servicio del sistema,

****Cuando**** se completa la implementación correspondiente,

****Entonces**** la documentación técnica asociada debe actualizarse con la información necesaria para su mantenimiento e integración.

****Criterio de Aceptación 2****

****Escenario:**** Mantener actualizada la documentación de las API

****Dado**** que el sistema expone o modifica un endpoint de API,

****Cuando**** se libera la modificación correspondiente,

****Entonces**** la documentación de la API, incluyendo las especificaciones aplicables en ****OpenAPI/Swagger****, debe reflejar la versión implementada.

###   

### D. Definition of Done (DoD) Global del Proyecto

La ****Definition of Done (DoD)**** establece el conjunto de condiciones técnicas y de calidad que deben cumplirse para que una ****Historia de Usuario sea considerada finalizada ("Done")**** dentro del proyecto EcoLogística Lima.

Los criterios son de cumplimiento obligatorio y deben verificarse antes de cerrar cualquier Historia de Usuario.

#### Criterios del DoD Global

Una Historia de Usuario se considera ****Done**** únicamente cuando cumple con todos los siguientes criterios:

-   ****Implementación completada:**** todas las funcionalidades y tareas asociadas a la Historia de Usuario han sido implementadas de acuerdo con su descripción y criterios de aceptación.
-   ****Criterios de aceptación cumplidos:**** los criterios de aceptación definidos mediante sintaxis BDD (Gherkin) han sido ejecutados y cumplen con los resultados esperados.
-   ****Cobertura de pruebas unitarias ≥ 80%:**** el código desarrollado debe contar con una cobertura de pruebas unitarias igual o superior al ****80%****.
-   ****Análisis estático de código:**** el código debe haber sido analizado mediante herramientas como ****SonarQube o CodeQL****, sin presentar vulnerabilidades críticas pendientes.
-   ****Revisión de código (Peer Review):**** los cambios deben haber sido revisados y aprobados por ****al menos un par técnico**** mediante un ****Pull Request (PR)**** antes de integrarse a la rama correspondiente.
-   ****Defectos críticos corregidos:**** no deben existir defectos críticos o bloqueantes relacionados con la Historia de Usuario pendientes de resolución.
-   ****Integración correcta:**** la funcionalidad debe estar integrada correctamente con los componentes existentes del sistema y no debe generar errores que afecten funcionalidades previamente implementadas.
-   ****Despliegue automatizado:**** el proyecto debe contar con un proceso de despliegue automatizado que pueda ejecutarse correctamente en el ambiente de ****Staging/Pruebas****.
-   ****Validación en Staging/Pruebas:**** la Historia de Usuario debe haber sido desplegada y validada en el ambiente de Staging/Pruebas, verificando el cumplimiento de sus criterios de aceptación.
-   ****Documentación actualizada:**** la documentación técnica relacionada con la funcionalidad implementada debe encontrarse actualizada.
-   ****Documentación de API/código:**** cuando la Historia de Usuario implique la creación o modificación de servicios o endpoints, la documentación correspondiente debe actualizarse utilizando ****OpenAPI/Swagger****.
-   ****Tareas y subtareas completadas:**** todas las tareas y subtareas asociadas a la Historia de Usuario deben encontrarse finalizadas y verificadas.

####

[← Volver al README Principal](../../README.md)