[← Volver al README principal](../../README.md)

# 03. Revisión del Sprint

---

## 1. Información del documento

| Campo                         | Detalle                                                                                                               |
| :---------------------------- | :-------------------------------------------------------------------------------------------------------------------- |
| **Nombre del proyecto**       | EcoLogistica-Lima: Plataforma Web y Móvil para la Gestión y Optimización de Logística Verde Urbana                    |
| **Código del proyecto**       | PFA-ECOLIMA-2026                                                                                                      |
| **Organización piloto**       | DistriRápido S.A.C.                                                                                                   |
| **Responsable del documento** | Angela Rojas Quispe                                                                                                   |
| **Equipo del proyecto**       | Zayuri Cerron Medina, Jheferson Martinez Valerio, Angela Rojas Quispe, Maylit Mendoza Alarcon y Diego Angulo Gonzales |
| **Fecha de elaboración**      | 01 de octubre de 2026                                                                                                 |
| **Versión**                   | V_1_2_0                                                                                                               |
| **Estado del documento**      | Actualización del avance del Sprint 1                                                                                 |

---

## 2. Objetivo del Sprint

El Sprint 1 tiene como objetivo establecer una base funcional para EcoLogistica-Lima mediante la implementación progresiva de las funcionalidades de gestión de vehículos y conductores, con el propósito de disponer de información operativa para los procesos logísticos posteriores.

Al corte del **01 de octubre de 2026**, las historias **US-001 — Registrar y administrar vehículos** y **US-002 — Administrar conductores** se registran como completadas.

La siguiente historia en la secuencia funcional es **US-003 — Registrar pedidos logísticos**, cuyo desarrollo y validación quedan pendientes para la siguiente actualización.

---

## 3. Resumen de las historias de usuario

| Código                  | Historia de usuario               | Story Points | Estado al corte                        |
| :---------------------- | :-------------------------------- | :----------: | :------------------------------------- |
| US-001                  | Registrar y administrar vehículos |     5 SP     | **Completada**                         |
| US-002                  | Administrar conductores           |     5 SP     | **Completada**                         |
| US-003                  | Registrar pedidos logísticos      |     8 SP     | **Pendiente**                          |
| **Total de referencia** | **Tres historias**                |   **18 SP**  | **10 SP completados; 8 SP pendientes** |

Con el cierre de US-002, se registran **10 de los 18 Story Points** del alcance acumulado de estas tres historias como completados, equivalentes aproximadamente al **55,6 %**.

La tabla de casos de uso proporcionada contempla siete subtareas para US-001, cinco para US-002 y cinco para US-003. El estado individual de cada subtarea debe confirmarse en Jira.

---

## 4. US-001 — Registrar y administrar vehículos

**Requisito relacionado:** RF-001
**Story Points:** 5 SP
**Estado:** Completada

US-001 permite registrar, consultar y actualizar los vehículos de la flota logística.

Su alcance técnico comprende el modelo de datos `vehiculos`, las migraciones y restricciones de base de datos, los endpoints REST, las reglas de validación, las pruebas de backend y la integración de la interfaz web con la API.

Para esta versión, la historia se conserva como completada, de acuerdo con el estado registrado en la revisión anterior. Las evidencias técnicas y funcionales deberán mantenerse vinculadas a la historia en Jira.

---

## 5. US-002 — Administrar conductores

**Requisito relacionado:** RF-008
**Story Points:** 5 SP
**Estado:** Completada

### 5.1. Objetivo

Permitir la administración de los conductores de la operación logística, incluyendo sus datos de identificación, licencia, experiencia, disponibilidad y punto de partida.

### 5.2. Alcance técnico

La historia comprende las siguientes subtareas:

| Subtarea   | Actividad                                                                              |
| :--------- | :------------------------------------------------------------------------------------- |
| SUB-002-01 | Diseñar la tabla de conductores con los campos definidos en la matriz de casos de uso. |
| SUB-002-02 | Implementar servicios REST para el alta, edición y cambio de estado.                   |
| SUB-002-03 | Incorporar la restricción de asignación para conductores inactivos o fuera de jornada. |
| SUB-002-04 | Desarrollar las pantallas de administración de conductores.                            |
| SUB-002-05 | Realizar pruebas de integración con la capa de persistencia.                           |

### 5.3. Resultado de la revisión

En esta versión, US-002 se registra como completada. El cierre debe estar respaldado por la validación de los criterios de aceptación y las evidencias de implementación y pruebas.

La funcionalidad de conductores complementa la gestión de vehículos al permitir administrar dos recursos fundamentales de la operación logística.

---

## 6. US-003 — Registrar pedidos logísticos

**Story Points:** 8 SP
**Estado:** Pendiente

### 6.1. Objetivo

Permitir el registro de pedidos logísticos con información sobre peso, volumen, prioridad, ventanas horarias y ubicación geográfica de entrega.

### 6.2. Alcance técnico previsto

| Subtarea   | Actividad                                                                                                |
| :--------- | :------------------------------------------------------------------------------------------------------- |
| SUB-003-01 | Crear la tabla `pedidos` en PostgreSQL/PostGIS con los atributos logísticos y coordenadas GPS.           |
| SUB-003-02 | Implementar el endpoint backend para la recepción individual y carga masiva de pedidos.                  |
| SUB-003-03 | Programar el validador de geocodificación para detectar ubicaciones inválidas o referencias incompletas. |
| SUB-003-04 | Construir el formulario frontend para registrar pedidos y referencias locales.                           |
| SUB-003-05 | Integrar el formulario con el endpoint de validación de ubicaciones y la gestión de errores.             |

### 6.3. Estado al corte

Al 01 de octubre de 2026, US-003 permanece pendiente. Las actividades anteriores representan su alcance previsto y no deben considerarse completadas hasta contar con las evidencias correspondientes.

Su desarrollo permitirá disponer de los datos de pedidos que servirán como entrada para las funcionalidades logísticas posteriores.

---

## 7. Resumen de la demostración

La revisión de este corte contempla las funcionalidades correspondientes a la administración de vehículos y conductores.

| Elemento                          | Resultado                                                          |
| :-------------------------------- | :----------------------------------------------------------------- |
| US-001                            | Completada según el estado registrado.                             |
| US-002                            | Completada según el estado registrado en esta versión.             |
| US-003                            | Pendiente; no forma parte del incremento completado de este corte. |
| Evidencias requeridas             | Capturas de pantalla, resultados de pruebas y registros de Jira.   |
| Retroalimentación de stakeholders | Registrar a partir de las observaciones efectivamente recopiladas. |

La demostración debe mostrar las funcionalidades disponibles para gestionar vehículos y conductores, así como las validaciones que hayan sido implementadas y verificadas.

No se consideran demostradas las funcionalidades de pedidos hasta que su desarrollo y validación se encuentren respaldados por evidencias.

---

## 8. Estado del Sprint

| Indicador                                | Resultado      |
| :--------------------------------------- | :------------- |
| Historias consideradas en esta secuencia | 3              |
| Story Points acumulados                  | 18 SP          |
| Historias completadas                    | 2              |
| Historias pendientes                     | 1              |
| Story Points completados                 | 10 SP          |
| Story Points pendientes                  | 8 SP           |
| US-001                                   | **Completada** |
| US-002                                   | **Completada** |
| US-003                                   | **Pendiente**  |

Este resumen representa el estado registrado al 01 de octubre. La secuencia de desarrollo continúa con US-003, cuya finalización deberá reflejarse en la siguiente versión.

---

## 9. Observaciones y elementos pendientes

* Conservar las evidencias de las historias US-001 y US-002.
* Confirmar que los criterios de aceptación de US-002 se encuentren verificados.
* Iniciar las actividades técnicas de US-003.
* Implementar la estructura de datos para los pedidos logísticos.
* Desarrollar la recepción individual y masiva de pedidos.
* Validar las coordenadas y las referencias de ubicación.
* Integrar la interfaz de registro con los servicios backend.
* Ejecutar las pruebas correspondientes y registrar los resultados.
* Actualizar el Sprint Backlog y Jira con el avance real.
* Registrar la retroalimentación obtenida durante las revisiones.

---

## 10. Próximas actividades

1. Revisar el cierre de US-002 y sus evidencias.
2. Iniciar el desarrollo de US-003 — Registrar pedidos logísticos.
3. Implementar el modelo de datos y los servicios backend.
4. Desarrollar el formulario de registro de pedidos.
5. Incorporar las validaciones de ubicación.
6. Integrar el frontend con la API.
7. Ejecutar las pruebas funcionales y de integración.
8. Validar los criterios de aceptación de US-003.
9. Actualizar Jira y la documentación del proyecto.

---

## 11. Conclusión

Al 01 de octubre de 2026, US-001 y US-002 se registran como completadas, con un total de **10 Story Points**. La siguiente historia, US-003 — Registrar pedidos logísticos, permanece pendiente y representa 8 Story Points adicionales en la secuencia funcional considerada.

La gestión de vehículos y conductores constituye la base para continuar con el registro de pedidos. La siguiente revisión deberá reflejar el avance de US-003 y las evidencias que permitan comprobar su finalización.

---

## 12. Control de cambios

| Versión | Fecha      | Responsable         | Descripción                                                                                              | Estado      |
| :------ | :--------- | :------------------ | :------------------------------------------------------------------------------------------------------- | :---------- |
| V_1_0_0 | 24/09/2026 | Angela Rojas Quispe | Borrador inicial de la Revisión del Sprint 1.                                                            | Histórico   |
| V_1_1_0 | 30/09/2026 | Angela Rojas Quispe | US-001 completada y US-002 pendiente.                                                                    | Histórico   |
| V_1_2_0 | 01/10/2026 | Angela Rojas Quispe | Actualización que registra US-002 como completada e identifica US-003 como siguiente historia pendiente. | Actualizada |

----

[← Volver al README principal](../../README.md)

