[← Volver al README principal](../../README.md)

# 03. Revisión del Sprint

---

## 1. Información del documento

| Campo                         | Detalle                                                                                                               |
| :---------------------------- | :-------------------------------------------------------------------------------------------------------------------- |
<<<<<<< HEAD
| **Nombre del Proyecto**       | EcoLogistica-Lima: Plataforma Web y Móvil para la Gestión y Optimización de Logística Verde Urbana                    |
| **Código del Proyecto**       | PFA-ECOLIMA-2026                                                                                                      |
| **Integrantes del Equipo**    | Zayuri Cerron Medina, Jheferson Martinez Valerio, Angela Rojas Quispe, Maylit Mendoza Alarcon y Diego Angulo Gonzales |
| **Responsable del Documento** | Angela Rojas Quispe                                                                                                   |
| **Fecha de Elaboración**      | 01 de octubre de 2026                                                                                                 |
| **Versión**                   | V_1_1_0                                                                                                               |
| **Estado**                    | Actualización de la revisión del Sprint 1                                                                             |
=======
| **Nombre del proyecto**       | EcoLogistica-Lima: Plataforma Web y Móvil para la Gestión y Optimización de Logística Verde Urbana                    |
| **Código del proyecto**       | PFA-ECOLIMA-2026                                                                                                      |
| **Organización piloto**       | DistriRápido S.A.C.                                                                                                   |
| **Responsable del documento** | Angela Rojas Quispe                                                                                                   |
| **Equipo del proyecto**       | Zayuri Cerron Medina, Jheferson Martinez Valerio, Angela Rojas Quispe, Maylit Mendoza Alarcon y Diego Angulo Gonzales |
| **Fecha de elaboración**      | 30 de septiembre de 2026                                                                                              |
| **Versión**                   | V_1_1_0                                                                                                               |
| **Estado del documento**      | Actualización del avance del Sprint 1                                                                                 |
>>>>>>> feature/fase-01-inicio

---

## 2. Objetivo del Sprint

El objetivo del Sprint 1 es establecer la base funcional de EcoLogistica-Lima mediante la implementación progresiva de las funcionalidades de gestión de vehículos y conductores.

<<<<<<< HEAD
> Implementar las funcionalidades iniciales de gestión de vehículos y conductores, estableciendo una base funcional para la posterior optimización y monitoreo de rutas.

Al corte del **01 de octubre de 2026**, el Sprint continúa abierto. Durante el periodo transcurrido se completó la implementación y validación de la Historia de Usuario **US-001 — Gestionar vehículos de la flota**, mientras que la Historia de Usuario **US-002 — Gestionar conductores y jornada** permanece pendiente.

Esta versión actualiza el avance registrado en la revisión anterior y distingue las historias completadas de aquellas que todavía requieren desarrollo y validación.

---

## 3. Historias de Usuario del Sprint

Al momento de realizar esta revisión, el alcance considerado para el Sprint 1 comprende dos historias de usuario:

| Historia                                     | Identificador Jira | Requisito de origen | Story Points | Estado                             | Subtareas |
| :------------------------------------------- | :----------------- | :------------------ | :----------: | :--------------------------------- | :-------: |
| **US-001** — Gestionar vehículos de la flota | ANA-9              | RF-001              |     5 SP     | **Completada**                     |    8/8    |
| **US-002** — Gestionar conductores y jornada | ANA-6              | RF-008              |     5 SP     | **Por hacer**                      |    0/9    |
| **Total del Sprint 1**                       | —                  | —                   |   **10 SP**  | 5 SP completados / 5 SP pendientes |  **8/17** |

Con la finalización de US-001, se han completado **5 de los 10 Story Points** considerados en el Sprint 1, equivalentes al **50 % del alcance en Story Points**.

Las ocho subtareas de US-001 se encuentran completadas. Las nueve subtareas asociadas a US-002 permanecen pendientes.

---

## 4. US-001 — Gestionar vehículos de la flota

**Identificador Jira:** ANA-9
**Requisito relacionado:** RF-001
**Story Points:** 5 SP
**Estado actual:** Completada
**Subtareas:** 8/8 completadas

### 4.1. Objetivo

Permitir la gestión de los vehículos pertenecientes a la flota logística de DistriRápido S.A.C.

### 4.2. Implementación y validación
=======
Al corte del **30 de septiembre de 2026**, la Historia de Usuario **US-001 — Registrar y administrar vehículos** se registra como completada, mientras que **US-002 — Administrar conductores** permanece pendiente.

Esta revisión actualiza el borrador inicial y presenta el estado de las historias, el resumen del trabajo revisado y las actividades necesarias para continuar el Sprint.

---

## 3. Resumen de las historias de usuario

| Código    | Historia de usuario               | Requisito relacionado | Story Points | Estado al corte                       |
| :-------- | :-------------------------------- | :-------------------- | :----------: | :------------------------------------ |
| US-001    | Registrar y administrar vehículos | RF-001                |     5 SP     | **Completada**                        |
| US-002    | Administrar conductores           | RF-008                |     5 SP     | **Pendiente**                         |
| **Total** | **Dos historias de usuario**      | —                     |   **10 SP**  | **5 SP completados; 5 SP pendientes** |

Según el estado indicado para esta versión, se han completado **5 de los 10 Story Points**, equivalentes al **50 % del alcance de referencia**.

Para esta versión se utilizará la matriz de subtareas proporcionada como referencia técnica. En ella, US-001 tiene siete subtareas y US-002 tiene cinco. Esta cantidad deberá mantenerse sincronizada con Jira si el equipo registra subtareas adicionales.

---

## 4. US-001 — Registrar y administrar vehículos

**Código:** US-001
**Identificador Jira:** ANA-9
**Requisito relacionado:** RF-001
**Story Points:** 5 SP
**Estado:** Completada

### 4.1. Objetivo

Permitir el registro y la administración de los vehículos de la flota logística de DistriRápido S.A.C.

### 4.2. Alcance técnico

La matriz de casos de uso establece las siguientes actividades:
>>>>>>> feature/fase-01-inicio

| Subtarea   | Descripción                                                                                                 |
| :--------- | :---------------------------------------------------------------------------------------------------------- |
| SUB-001-01 | Diseñar la tabla `vehiculos` en PostgreSQL con los atributos técnicos definidos para cada vehículo.         |
| SUB-001-02 | Crear la migración de base de datos e índices únicos por placa, junto con las restricciones necesarias.     |
| SUB-001-03 | Crear endpoints REST para registrar, consultar y actualizar vehículos.                                      |
| SUB-001-04 | Programar reglas de negocio para validar datos incompletos y valores fuera de las condiciones establecidas. |
| SUB-001-05 | Preparar y ejecutar pruebas unitarias y de integración del backend.                                         |
| SUB-001-06 | Diseñar el formulario y la tabla interactiva de vehículos en el frontend.                                   |
| SUB-001-07 | Integrar el formulario frontend con la API backend y gestionar los estados de carga y validación.           |

<<<<<<< HEAD
Como parte de su finalización, se desarrollaron las funcionalidades correspondientes a la gestión de vehículos y se realizaron las actividades de verificación necesarias para comprobar su funcionamiento.

La historia se considera completada de acuerdo con el estado registrado para esta revisión y con las subtareas reportadas como finalizadas.

---

## 5. US-002 — Gestionar conductores y jornada

**Identificador Jira:** ANA-6
**Requisito relacionado:** RF-008
**Story Points:** 5 SP
**Estado actual:** Por hacer
**Subtareas:** 0/9 completadas

### 5.1. Objetivo

Gestionar la información de los conductores y los datos relacionados con su jornada de trabajo.

### 5.2. Estado al corte

Al **01 de octubre de 2026**, la Historia de Usuario US-002 todavía no ha iniciado su desarrollo y permanece pendiente dentro del Sprint 1.

Su implementación deberá considerar los criterios de aceptación definidos, las pruebas correspondientes y la validación antes de declararse completada.

---

## 6. Criterios de aceptación y Definition of Done

Para declarar completada una Historia de Usuario, se deberá verificar que:

* La funcionalidad responda al objetivo y al alcance definidos para la historia.
* Los criterios de aceptación establecidos hayan sido verificados.
* Las pruebas correspondientes se hayan ejecutado y sus resultados estén registrados.
* Las subtareas asociadas se encuentren completadas.
* Las evidencias de implementación y validación estén disponibles.
* La documentación relacionada se encuentre actualizada.
* El estado de la historia en Jira refleje su situación real.

En el corte de esta revisión, US-001 cumple con el estado de completada y cuenta con sus ocho subtareas finalizadas. US-002 todavía no puede declararse completada porque su desarrollo permanece pendiente.

---

## 7. Demostración del trabajo realizado

Durante el periodo comprendido hasta el **01 de octubre de 2026**, se avanzó en la implementación de la funcionalidad correspondiente a **US-001 — Gestionar vehículos de la flota**.

La revisión del trabajo realizado comprende:

1. Implementación de la funcionalidad de gestión de vehículos.
2. Finalización de las ocho subtareas asociadas a US-001.
3. Verificación del funcionamiento de la funcionalidad desarrollada.
4. Validación de los criterios de aceptación correspondientes.
5. Registro del avance de la Historia de Usuario en Jira.
6. Organización de las evidencias relacionadas con la implementación y validación.

La funcionalidad de US-001 constituye el primer incremento funcional completado dentro del Sprint 1.

La **US-002 — Gestionar conductores y jornada** continúa pendiente y no forma parte todavía del incremento funcional completado.

---

## 8. Estado actual del Sprint

El estado registrado al **01 de octubre de 2026** es el siguiente:

| Indicador                       | Resultado                    |
| :------------------------------ | :--------------------------- |
| Historias consideradas          | 2                            |
| Story Points del alcance        | 10 SP                        |
| Historias completadas           | 1                            |
| Historias en curso              | 0                            |
| Historias pendientes            | 1                            |
| Story Points completados        | 5 SP                         |
| Story Points pendientes         | 5 SP                         |
| Subtareas completadas           | 8/17                         |
| Subtareas pendientes            | 9                            |
| Sprint finalizado               | No                           |
| Incremento funcional disponible | Sí, correspondiente a US-001 |
| US-001                          | **Completada**               |
| US-002                          | **Pendiente**                |

Actualmente se han completado **5 de los 10 Story Points** considerados en el Sprint 1.

El Sprint permanece abierto y tiene como fecha prevista de finalización el **9 de octubre de 2026**. Por lo tanto, el estado presentado corresponde al corte del **01 de octubre de 2026** y puede modificarse antes del cierre definitivo.

---

## 9. Retroalimentación y observaciones

A partir de la revisión del avance actualizado se identifican las siguientes observaciones:

* La Historia de Usuario US-001 fue completada satisfactoriamente y cuenta con sus subtareas finalizadas.
* Se debe mantener actualizada la información de Jira conforme avance el desarrollo de las historias restantes.
* La US-002 permanece pendiente y requiere iniciar las actividades de análisis, desarrollo, pruebas y validación.
* Las evidencias de implementación y pruebas deben mantenerse asociadas a cada Historia de Usuario.
* La Definition of Done debe continuar utilizándose como criterio para determinar cuándo una historia puede declararse completada.
* Antes del cierre del Sprint, se deberá verificar que las historias completadas cuenten con sus respectivas evidencias.
* Se debe continuar con la preparación de la demostración final del Sprint.
* El equipo deberá revisar el cumplimiento del Sprint Goal al finalizar la iteración.

---

## 10. Pendientes

Para continuar con el Sprint 1, se identifican los siguientes elementos pendientes:

* Iniciar el desarrollo de US-002.
* Completar las nueve subtareas asociadas a US-002.
* Implementar la gestión de conductores y jornada.
* Realizar las pruebas correspondientes a US-002.
* Validar los criterios de aceptación de US-002.
* Verificar el cumplimiento de la Definition of Done para US-002.
* Registrar las evidencias de implementación y pruebas en Jira.
* Mantener actualizado el Sprint Backlog con el avance real.
* Preparar la demostración final del Sprint.
* Recopilar la retroalimentación de los stakeholders.
* Registrar las conclusiones y acuerdos de la Sprint Review.
* Actualizar la documentación del proyecto con los resultados finales del Sprint.

---

## 11. Próximas actividades

Antes del cierre del Sprint 1, se propone realizar las siguientes actividades:

1. Iniciar el desarrollo de US-002 — Gestionar conductores y jornada.
2. Registrar el avance de las subtareas directamente en Jira.
3. Implementar las funcionalidades definidas para la gestión de conductores y jornada.
4. Ejecutar las pruebas correspondientes.
5. Validar los criterios de aceptación de la Historia de Usuario.
6. Recopilar las evidencias de desarrollo y pruebas.
7. Verificar el cumplimiento de la Definition of Done.
8. Preparar la demostración del incremento funcional disponible.
9. Recopilar la retroalimentación de los stakeholders.
10. Actualizar el Sprint Backlog con el estado final de las historias.
11. Registrar las conclusiones y acuerdos de la Sprint Review.

---

## 12. Conclusión
=======
### 4.3. Resultado de la revisión

Para este corte, US-001 se registra como completada. El cierre de la historia debe respaldarse con el estado actualizado de sus subtareas, los criterios de aceptación verificados y las evidencias disponibles.

La revisión funcional debe comprobar que la administración de vehículos cumple con el alcance definido y que las validaciones se comportan según lo esperado.

---

## 5. US-002 — Administrar conductores

**Código:** US-002
**Identificador Jira:** ANA-6
**Requisito relacionado:** RF-008
**Story Points:** 5 SP
**Estado:** Pendiente

### 5.1. Objetivo

Administrar la información de los conductores, incluyendo sus datos de identificación, licencia, experiencia, disponibilidad y punto de partida.

### 5.2. Subtareas pendientes

| Subtarea   | Descripción                                                                                           |
| :--------- | :---------------------------------------------------------------------------------------------------- |
| SUB-002-01 | Diseñar la tabla de conductores con los campos definidos.                                             |
| SUB-002-02 | Implementar los servicios REST para el alta, edición y cambio de estado.                              |
| SUB-002-03 | Programar la restricción lógica para impedir asignaciones a conductores inactivos o fuera de jornada. |
| SUB-002-04 | Desarrollar las pantallas de administración de conductores.                                           |
| SUB-002-05 | Realizar pruebas de integración con la capa de persistencia.                                          |

### 5.3. Estado al corte

Al 30 de septiembre, US-002 permanece pendiente. Para su cierre se deberá implementar el alcance técnico, verificar sus criterios de aceptación y reunir las evidencias de las pruebas correspondientes.

---

## 6. Resumen de la demostración

La revisión del incremento se centra en la funcionalidad de administración de vehículos correspondiente a US-001.

| Elemento                          | Resultado de la revisión                                                     |
| :-------------------------------- | :--------------------------------------------------------------------------- |
| Historia revisada                 | US-001 — Registrar y administrar vehículos                                   |
| Estado informado                  | Completada                                                                   |
| Aspectos a verificar              | Registro, consulta, actualización y validaciones de vehículos.               |
| Evidencias                        | Deben conservarse las capturas, pruebas y registros asociados a la historia. |
| US-002                            | Pendiente de implementación y demostración.                                  |
| Retroalimentación de stakeholders | Registrar a partir de la sesión efectivamente realizada.                     |

La demostración debe permitir revisar el incremento disponible y registrar las observaciones que deban convertirse en acciones de mejora. No se atribuyen comentarios específicos a los stakeholders mientras no se disponga de un registro de la sesión.

---

## 7. Estado del Sprint

| Indicador                        | Resultado |
| :------------------------------- | :-------- |
| Historias consideradas           | 2         |
| Story Points de referencia       | 10 SP     |
| Historias completadas            | 1         |
| Historias pendientes             | 1         |
| Story Points completados         | 5 SP      |
| Story Points pendientes          | 5 SP      |
| Sprint finalizado                | No        |
| Incremento completado registrado | US-001    |
| Próxima historia por completar   | US-002    |

El Sprint continúa abierto. El avance deberá actualizarse conforme se desarrollen y validen las actividades pendientes de US-002.

---

## 8. Observaciones y elementos pendientes

* Mantener actualizados los estados de US-001 y US-002 en Jira.
* Conservar las evidencias de implementación y validación de US-001.
* Iniciar y completar las cinco subtareas de US-002.
* Verificar las reglas de disponibilidad y jornada de los conductores.
* Ejecutar las pruebas de integración de US-002.
* Validar los criterios de aceptación antes de declarar la historia completada.
* Registrar las observaciones y acuerdos de los stakeholders.
* Actualizar la documentación del Sprint conforme se obtengan resultados verificables.

---

## 9. Próximas actividades

1. Confirmar en Jira el cierre de US-001.
2. Iniciar las actividades técnicas de US-002.
3. Implementar los servicios y la interfaz de administración de conductores.
4. Verificar las restricciones de disponibilidad y jornada.
5. Ejecutar las pruebas de integración.
6. Registrar las evidencias de las funcionalidades desarrolladas.
7. Revisar el cumplimiento de la Definition of Done.
8. Actualizar el Sprint Backlog y preparar la siguiente revisión.

---

## 10. Conclusión

Al 30 de septiembre de 2026, US-001 se registra como completada y US-002 permanece pendiente. El alcance de referencia comprende 10 Story Points, de los cuales 5 se consideran completados.

Esta versión representa una actualización respecto al borrador del 24 de septiembre. La siguiente revisión deberá reflejar el resultado de la implementación y validación de US-002, manteniendo la trazabilidad entre las historias, sus subtareas y las evidencias disponibles.

---

## 11. Control de cambios
>>>>>>> feature/fase-01-inicio

| Versión | Fecha      | Responsable         | Descripción                                                                                                                 | Estado      |
| :------ | :--------- | :------------------ | :-------------------------------------------------------------------------------------------------------------------------- | :---------- |
| V_1_0_0 | 24/09/2026 | Angela Rojas Quispe | Borrador inicial de la Revisión del Sprint 1.                                                                               | Histórico   |
| V_1_1_0 | 30/09/2026 | Angela Rojas Quispe | US-001 registrada como completada y US-002 como pendiente; actualización del avance, demostración y actividades siguientes. | Actualizada |

<<<<<<< HEAD
El alcance considerado para el Sprint comprende **US-001 y US-002**, equivalentes a **10 Story Points**. De este total, se encuentran completados 5 Story Points correspondientes a US-001, mientras que los 5 Story Points correspondientes a US-002 permanecen pendientes.

Asimismo, se han completado **8 de las 17 subtareas** asociadas a las historias consideradas.

El Sprint continúa abierto hasta el **9 de octubre de 2026**, por lo que todavía se requiere completar US-002, validar su funcionamiento y comprobar el cumplimiento de la Definition of Done antes del cierre.

La revisión definitiva deberá considerar el estado final de las historias, las pruebas ejecutadas, los criterios de aceptación, las evidencias disponibles y la retroalimentación obtenida durante la Sprint Review.

---

## 13. Control de cambios

| Versión     | Fecha      | Responsable         | Descripción                                                                                                                                           | Estado                       |
| :---------- | :--------- | :------------------ | :---------------------------------------------------------------------------------------------------------------------------------------------------- | :--------------------------- |
| **V_1_0_0** | 30/09/2026 | Angela Rojas Quispe | Primera versión de la Revisión del Sprint 1, con corte al 30/09/2026.                                                                                 | Emitida como primera versión |
| **V_1_1_0** | 01/10/2026 | Angela Rojas Quispe | Actualización del estado del Sprint: US-001 completada, US-002 pendiente y actualización del avance, demostración, pendientes y próximas actividades. | Actualizada                  |

---
=======
----

[← Volver al README principal](../../README.md)

