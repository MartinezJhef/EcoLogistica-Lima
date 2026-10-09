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
| **Fecha de elaboración**      | 08 de octubre de 2026                                                                                                 |
| **Versión**                   | V_1_4_0                                                                                                               |
| **Estado del documento**      | Actualización del avance del Sprint 1                                                                                 |

---

## 2. Objetivo del Sprint

El objetivo del Sprint 1 es establecer una base funcional para EcoLogistica-Lima mediante la implementación progresiva de las funcionalidades de gestión de vehículos, conductores, pedidos logísticos y preferencias de los clientes.

Al corte del **08 de octubre de 2026**, las historias **US-001 — Registrar y administrar vehículos**, **US-002 — Administrar conductores**, **US-003 — Registrar pedidos logísticos** y **US-004 — Gestionar clientes y preferencias** se registran como completadas.

La siguiente historia de la matriz de casos de uso es **US-005 — Generar rutas optimizadas**. Su desarrollo deberá organizarse en la siguiente etapa, conforme a la planificación que se confirme para el Sprint 2.

---

## 3. Resumen de las historias de usuario

| Código    | Historia de usuario               | Story Points | Estado al corte       |
| :-------- | :-------------------------------- | :----------: | :-------------------- |
| US-001    | Registrar y administrar vehículos |     5 SP     | **Completada**        |
| US-002    | Administrar conductores           |     5 SP     | **Completada**        |
| US-003    | Registrar pedidos logísticos      |     8 SP     | **Completada**        |
| US-004    | Gestionar clientes y preferencias |     3 SP     | **Completada**        |
| **Total** | **Cuatro historias**              |   **21 SP**  | **21 SP completados** |

Según los estados indicados para esta versión, las cuatro historias suman **21 Story Points registrados como completados**.

La matriz de casos de uso contiene siete subtareas para US-001, cinco para US-002, cinco para US-003 y cuatro para US-004. Para mantener la trazabilidad, la finalización de cada subtarea deberá corresponder al estado real registrado en Jira y contar con las evidencias aplicables.

---

## 4. US-001 — Registrar y administrar vehículos

**Requisito relacionado:** RF-001
**Story Points:** 5 SP
**Estado:** Completada

Esta historia permite registrar y administrar los vehículos de la flota logística de DistriRápido S.A.C.

Su alcance incluye el modelo de datos de vehículos, las migraciones, las restricciones de unicidad, los endpoints REST, las validaciones de negocio, las pruebas y la integración de la interfaz web con la API.

La historia se conserva como completada según las revisiones anteriores.

---

## 5. US-002 — Administrar conductores

**Requisito relacionado:** RF-008
**Story Points:** 5 SP
**Estado:** Completada

Esta historia permite administrar los datos de los conductores y contempla los servicios de alta, edición y cambio de estado, las reglas de disponibilidad y jornada, las pantallas de administración y las pruebas de integración.

La historia se conserva como completada según el estado registrado en la versión V_1_2_0.

---

## 6. US-003 — Registrar pedidos logísticos

**Story Points:** 8 SP
**Estado:** Completada

Esta historia permite registrar pedidos logísticos con información de peso, volumen, prioridad, ventanas horarias y ubicación geográfica.

Su alcance contempla el modelo de datos en PostgreSQL/PostGIS, los servicios de recepción individual y masiva, la validación de ubicaciones, el formulario frontend y la integración con los servicios backend.

La historia se conserva como completada según el estado registrado en la versión V_1_3_0.

---

## 7. US-004 — Gestionar clientes y preferencias

**Story Points:** 3 SP
**Estado:** Completada

### 7.1. Objetivo

Permitir la administración de los clientes y de sus preferencias de entrega, incluyendo horarios de recepción y restricciones de acceso.

### 7.2. Alcance técnico

| Subtarea   | Actividad                                                                                                    |
| :--------- | :----------------------------------------------------------------------------------------------------------- |
| SUB-004-01 | Diseñar el modelo relacional de clientes y preferencias de entrega.                                          |
| SUB-004-02 | Crear servicios REST para consultar, asignar y actualizar preferencias de horario y restricciones de acceso. |
| SUB-004-03 | Desarrollar la vista de administración de clientes y preferencias.                                           |
| SUB-004-04 | Conectar la vista con los servicios API e implementar alertas de confirmación al guardar cambios.            |

### 7.3. Resultado de la revisión

Al corte del 08 de octubre de 2026, US-004 se registra como completada. Su cierre debe contar con el estado actualizado de las subtareas, los criterios de aceptación verificados y las evidencias de implementación y pruebas correspondientes.

La funcionalidad complementa la información de los pedidos al incorporar las preferencias de recepción y las restricciones que deben considerarse en la operación logística.

---

## 8. Resumen de la demostración

La revisión de este corte comprende las funcionalidades correspondientes a la administración de vehículos, conductores, pedidos y preferencias de clientes.

| Elemento                          | Resultado                                                                              |
| :-------------------------------- | :------------------------------------------------------------------------------------- |
| US-001 — Vehículos                | Completada según el estado registrado.                                                 |
| US-002 — Conductores              | Completada según el estado registrado.                                                 |
| US-003 — Pedidos logísticos       | Completada según el estado registrado.                                                 |
| US-004 — Clientes y preferencias  | Completada según el estado registrado en esta versión.                                 |
| Evidencias                        | Conservar capturas, resultados de pruebas y registros de Jira de las cuatro historias. |
| Retroalimentación de stakeholders | Incorporar las observaciones efectivamente recopiladas durante la sesión de revisión.  |

La demostración del incremento debe permitir revisar el flujo funcional disponible para administrar los vehículos, conductores, pedidos y preferencias de entrega.

La evidencia de la sesión deberá incluir, cuando esté disponible, la fecha de la reunión, los asistentes, las funcionalidades presentadas, las observaciones recibidas y los acuerdos adoptados.

---

## 9. Estado actual del Sprint

| Indicador                                             | Resultado                          |
| :---------------------------------------------------- | :--------------------------------- |
| Historias consideradas en la secuencia                | 4                                  |
| Story Points acumulados                               | 21 SP                              |
| Historias completadas                                 | 4                                  |
| Historias pendientes dentro de estas cuatro historias | 0                                  |
| Story Points completados                              | 21 SP                              |
| US-001                                                | **Completada**                     |
| US-002                                                | **Completada**                     |
| US-003                                                | **Completada**                     |
| US-004                                                | **Completada**                     |
| Siguiente historia de la matriz                       | US-005 — Generar rutas optimizadas |

Este estado representa la situación registrada al 08 de octubre de 2026. La preparación del siguiente incremento deberá considerar la disponibilidad de datos de vehículos, conductores, pedidos y preferencias de los clientes.

---

## 10. Elementos pendientes

Aunque las cuatro historias se registran como completadas, se deben mantener las siguientes actividades de control y preparación:

* Verificar que las evidencias de implementación y pruebas estén vinculadas a las cuatro historias.
* Confirmar que las subtareas y los criterios de aceptación estén actualizados en Jira.
* Mantener la documentación funcional y técnica sincronizada con el incremento disponible.
* Registrar las observaciones y acuerdos de la Sprint Review.
* Revisar la integración de la información de vehículos, conductores, pedidos y preferencias.
* Preparar la planificación de US-005.
* Identificar los datos y restricciones necesarios para la generación de rutas optimizadas.
* Registrar los riesgos, dependencias e impedimentos que se identifiquen durante la planificación siguiente.

---

## 11. Próximas actividades

La siguiente etapa deberá organizarse en torno a **US-005 — Generar rutas optimizadas**, conforme a la planificación del Sprint 2.

Las actividades previstas son:

1. Revisar los criterios de aceptación de US-005.
2. Confirmar las dependencias con los datos de vehículos, conductores, pedidos y preferencias de clientes.
3. Descomponer la historia en sus seis subtareas técnicas.
4. Planificar la implementación del algoritmo de optimización Green VRPTW.
5. Definir las restricciones operativas que deberá considerar el cálculo de rutas.
6. Preparar las pruebas de rendimiento y validación de resultados que correspondan.
7. Actualizar Jira con las tareas, responsables y estados acordados.
8. Registrar la planificación del siguiente incremento en la documentación del proyecto.

Las fechas definitivas y la asignación de responsables deberán establecerse en la planificación del Sprint 2.

---

## 12. Conclusión

Al 08 de octubre de 2026, US-001, US-002, US-003 y US-004 se registran como completadas, con un total acumulado de **21 Story Points**.

El incremento funcional considerado abarca la administración de vehículos, conductores, pedidos logísticos y preferencias de los clientes. Estas funcionalidades proporcionan la información necesaria para preparar el siguiente paso del proyecto: la generación de rutas optimizadas.

La siguiente historia de la matriz es **US-005 — Generar rutas optimizadas**, cuya planificación e implementación deberán documentarse en la siguiente etapa, sin atribuirle resultados antes de su ejecución y validación.

---

## 13. Control de cambios

| Versión | Fecha      | Responsable         | Descripción                                                                                                | Estado      |
| :------ | :--------- | :------------------ | :--------------------------------------------------------------------------------------------------------- | :---------- |
| V_1_0_0 | 24/09/2026 | Angela Rojas Quispe | Borrador inicial de la Revisión del Sprint 1.                                                              | Histórico   |
| V_1_1_0 | 30/09/2026 | Angela Rojas Quispe | US-001 completada y US-002 pendiente.                                                                      | Histórico   |
| V_1_2_0 | 01/10/2026 | Angela Rojas Quispe | US-002 completada y US-003 pendiente.                                                                      | Histórico   |
| V_1_3_0 | 07/10/2026 | Angela Rojas Quispe | US-003 completada y US-004 pendiente.                                                                      | Histórico   |
| V_1_4_0 | 08/10/2026 | Angela Rojas Quispe | US-004 registrada como completada y US-005 identificada como siguiente historia de la secuencia funcional. | Actualizada |

----

[← Volver al README principal](../../README.md)
