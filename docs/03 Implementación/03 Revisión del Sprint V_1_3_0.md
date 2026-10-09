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
| **Fecha de elaboración**      | 07 de octubre de 2026                                                                                                 |
| **Versión**                   | V_1_3_0                                                                                                               |
| **Estado del documento**      | Actualización del avance del Sprint 1                                                                                 |

---

## 2. Objetivo del Sprint

El objetivo del Sprint 1 es establecer una base funcional para EcoLogistica-Lima mediante el desarrollo progresivo de las funcionalidades de gestión de vehículos, conductores y pedidos logísticos.

Al corte del **07 de octubre de 2026**, las historias **US-001 — Registrar y administrar vehículos**, **US-002 — Administrar conductores** y **US-003 — Registrar pedidos logísticos** se registran como completadas.

La siguiente historia en la secuencia funcional es **US-004 — Gestionar clientes y preferencias**, que permanece pendiente de finalización en esta revisión.

---

## 3. Resumen de las historias de usuario

| Código                  | Historia de usuario               | Story Points | Estado al corte                        |
| :---------------------- | :-------------------------------- | :----------: | :------------------------------------- |
| US-001                  | Registrar y administrar vehículos |     5 SP     | **Completada**                         |
| US-002                  | Administrar conductores           |     5 SP     | **Completada**                         |
| US-003                  | Registrar pedidos logísticos      |     8 SP     | **Completada**                         |
| US-004                  | Gestionar clientes y preferencias |     3 SP     | **Pendiente**                          |
| **Total de referencia** | **Cuatro historias**              |   **21 SP**  | **18 SP completados; 3 SP pendientes** |

De acuerdo con los estados indicados para esta versión, se registran **18 de los 21 Story Points** como completados, equivalentes aproximadamente al **85,7 %** del alcance acumulado de estas cuatro historias.

La matriz de casos de uso contempla siete subtareas para US-001, cinco para US-002, cinco para US-003 y cuatro para US-004. El estado de cada subtarea debe verificarse en Jira.

---

## 4. US-001 — Registrar y administrar vehículos

**Requisito relacionado:** RF-001
**Story Points:** 5 SP
**Estado:** Completada

Esta historia permite administrar los vehículos de la flota logística.

Su alcance técnico comprende el modelo de datos, las migraciones y restricciones de base de datos, los endpoints REST, las validaciones de negocio, las pruebas y la integración de la interfaz web con la API.

La historia se conserva como completada según el estado registrado en las revisiones anteriores.

---

## 5. US-002 — Administrar conductores

**Requisito relacionado:** RF-008
**Story Points:** 5 SP
**Estado:** Completada

Esta historia contempla el mantenimiento de la información de los conductores, sus datos de identificación, licencia, experiencia, disponibilidad y punto de partida.

Su alcance incluye los servicios REST, las reglas de disponibilidad y jornada, las pantallas de administración y las pruebas de integración con la persistencia.

La historia se conserva como completada según el estado registrado en la versión anterior.

---

## 6. US-003 — Registrar pedidos logísticos

**Story Points:** 8 SP
**Estado:** Completada

### 6.1. Objetivo

Permitir el registro de pedidos logísticos con datos de peso, volumen, prioridad, ventanas horarias y ubicación geográfica.

### 6.2. Alcance técnico

| Subtarea   | Actividad                                                                                       |
| :--------- | :---------------------------------------------------------------------------------------------- |
| SUB-003-01 | Crear la tabla `pedidos` en PostgreSQL/PostGIS con atributos logísticos y coordenadas GPS.      |
| SUB-003-02 | Implementar el endpoint backend para recepción individual y carga masiva.                       |
| SUB-003-03 | Programar el validador de geocodificación para identificar ubicaciones inválidas o incompletas. |
| SUB-003-04 | Construir el formulario frontend para registrar pedidos y referencias locales.                  |
| SUB-003-05 | Integrar el formulario con la API de validación de ubicaciones y la gestión de errores.         |

### 6.3. Resultado de la revisión

Al corte del 07 de octubre de 2026, US-003 se registra como completada. Su cierre deberá respaldarse con las evidencias de implementación y validación, además del estado actualizado de sus subtareas.

La funcionalidad de pedidos permite registrar la información logística necesaria para continuar con la administración de clientes y sus preferencias de entrega.

---

## 7. US-004 — Gestionar clientes y preferencias

**Story Points:** 3 SP
**Estado:** Pendiente

### 7.1. Objetivo

Permitir la administración de los clientes y sus preferencias de entrega, considerando horarios de recepción y restricciones de acceso.

### 7.2. Alcance técnico previsto

| Subtarea   | Actividad                                                                                                    |
| :--------- | :----------------------------------------------------------------------------------------------------------- |
| SUB-004-01 | Diseñar el modelo relacional de `clientes` y `preferencias_entrega`.                                         |
| SUB-004-02 | Crear servicios REST para consultar, asignar y actualizar preferencias de horario y restricciones de acceso. |
| SUB-004-03 | Desarrollar la vista de administración de clientes y preferencias en el frontend.                            |
| SUB-004-04 | Conectar la vista con los servicios API e implementar alertas de confirmación al guardar cambios.            |

### 7.3. Estado al corte

US-004 permanece pendiente al 07 de octubre de 2026. Las actividades indicadas constituyen el alcance previsto y deberán ejecutarse, probarse y validarse antes de declarar la historia completada.

La información de clientes y sus preferencias permitirá complementar los datos de los pedidos con las condiciones de recepción de cada destino.

---

## 8. Resumen de la demostración

La revisión de este corte comprende las funcionalidades de administración de vehículos, conductores y pedidos logísticos.

| Elemento                          | Resultado                                                                  |
| :-------------------------------- | :------------------------------------------------------------------------- |
| US-001 — Vehículos                | Completada según el estado registrado.                                     |
| US-002 — Conductores              | Completada según el estado registrado.                                     |
| US-003 — Pedidos logísticos       | Completada según el estado registrado en esta versión.                     |
| US-004 — Clientes y preferencias  | Pendiente de finalización.                                                 |
| Evidencias                        | Conservar capturas, pruebas y registros de Jira asociados a cada historia. |
| Retroalimentación de stakeholders | Registrar las observaciones efectivamente recopiladas durante la revisión. |

La demostración debe permitir revisar las funcionalidades disponibles para gestionar vehículos, conductores y pedidos. La funcionalidad de clientes y preferencias deberá incorporarse cuando su implementación y validación hayan concluido.

---

## 9. Estado del Sprint

| Indicador                              | Resultado      |
| :------------------------------------- | :------------- |
| Historias consideradas en la secuencia | 4              |
| Story Points acumulados                | 21 SP          |
| Historias completadas                  | 3              |
| Historias pendientes                   | 1              |
| Story Points completados               | 18 SP          |
| Story Points pendientes                | 3 SP           |
| US-001                                 | **Completada** |
| US-002                                 | **Completada** |
| US-003                                 | **Completada** |
| US-004                                 | **Pendiente**  |

El estado presentado corresponde al corte del 07 de octubre de 2026. La siguiente actualización deberá registrar el resultado de US-004 y las evidencias de su finalización.

---

## 10. Observaciones y elementos pendientes

* Conservar las evidencias de implementación y validación de US-001, US-002 y US-003.
* Verificar que los criterios de aceptación de US-003 estén respaldados por pruebas.
* Desarrollar el modelo de datos de clientes y preferencias de entrega.
* Implementar los servicios REST de consulta y actualización de preferencias.
* Desarrollar la interfaz web de administración.
* Integrar el frontend con la API.
* Verificar las alertas de confirmación al guardar cambios.
* Ejecutar las pruebas correspondientes a US-004.
* Actualizar Jira y el Sprint Backlog.
* Registrar la retroalimentación de los stakeholders.

---

## 11. Próximas actividades

1. Confirmar las evidencias de cierre de US-003.
2. Desarrollar US-004 — Gestionar clientes y preferencias.
3. Implementar las tablas y relaciones de datos necesarias.
4. Desarrollar los servicios REST para las preferencias de entrega.
5. Construir e integrar la interfaz de administración.
6. Verificar las confirmaciones y validaciones de la interfaz.
7. Ejecutar pruebas funcionales y de integración.
8. Validar los criterios de aceptación de US-004.
9. Actualizar Jira y la documentación del proyecto.
10. Preparar la siguiente revisión del Sprint.

---

## 12. Conclusión

Al 07 de octubre de 2026, US-001, US-002 y US-003 se registran como completadas, con un total acumulado de **18 Story Points**. La siguiente historia, US-004 — Gestionar clientes y preferencias, permanece pendiente y representa 3 Story Points adicionales.

La secuencia funcional ha avanzado desde la administración de los recursos de la flota hasta el registro de pedidos logísticos. La siguiente revisión deberá reflejar el resultado de US-004 y las evidencias que permitan comprobar su finalización.

---

## 13. Control de cambios

| Versión | Fecha      | Responsable         | Descripción                                                                                | Estado      |
| :------ | :--------- | :------------------ | :----------------------------------------------------------------------------------------- | :---------- |
| V_1_0_0 | 24/09/2026 | Angela Rojas Quispe | Borrador inicial de la Revisión del Sprint 1.                                              | Histórico   |
| V_1_1_0 | 30/09/2026 | Angela Rojas Quispe | US-001 completada y US-002 pendiente.                                                      | Histórico   |
| V_1_2_0 | 01/10/2026 | Angela Rojas Quispe | US-002 completada y US-003 pendiente.                                                      | Histórico   |
| V_1_3_0 | 07/10/2026 | Angela Rojas Quispe | US-003 registrada como completada y US-004 identificada como siguiente historia pendiente. | Actualizada |

---

[← Volver al README principal](../../README.md)
