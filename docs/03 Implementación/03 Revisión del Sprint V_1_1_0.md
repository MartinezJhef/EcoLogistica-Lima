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
| **Fecha de elaboración**      | 30 de septiembre de 2026                                                                                              |
| **Versión**                   | V_1_1_0                                                                                                               |
| **Estado del documento**      | Actualización del avance del Sprint 1                                                                                 |

---

## 2. Objetivo del Sprint

El objetivo del Sprint 1 es establecer la base funcional de EcoLogistica-Lima mediante la implementación progresiva de las funcionalidades de gestión de vehículos y conductores.

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

| Subtarea   | Descripción                                                                                                 |
| :--------- | :---------------------------------------------------------------------------------------------------------- |
| SUB-001-01 | Diseñar la tabla `vehiculos` en PostgreSQL con los atributos técnicos definidos para cada vehículo.         |
| SUB-001-02 | Crear la migración de base de datos e índices únicos por placa, junto con las restricciones necesarias.     |
| SUB-001-03 | Crear endpoints REST para registrar, consultar y actualizar vehículos.                                      |
| SUB-001-04 | Programar reglas de negocio para validar datos incompletos y valores fuera de las condiciones establecidas. |
| SUB-001-05 | Preparar y ejecutar pruebas unitarias y de integración del backend.                                         |
| SUB-001-06 | Diseñar el formulario y la tabla interactiva de vehículos en el frontend.                                   |
| SUB-001-07 | Integrar el formulario frontend con la API backend y gestionar los estados de carga y validación.           |

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

| Versión | Fecha      | Responsable         | Descripción                                                                                                                 | Estado      |
| :------ | :--------- | :------------------ | :-------------------------------------------------------------------------------------------------------------------------- | :---------- |
| V_1_0_0 | 24/09/2026 | Angela Rojas Quispe | Borrador inicial de la Revisión del Sprint 1.                                                                               | Histórico   |
| V_1_1_0 | 30/09/2026 | Angela Rojas Quispe | US-001 registrada como completada y US-002 como pendiente; actualización del avance, demostración y actividades siguientes. | Actualizada |

---

[← Volver al README principal](../../README.md)
