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
| **Fecha de elaboración**      | 24 de septiembre de 2026                                                                                              |
| **Versión**                   | V_1_0_0                                                                                                               |
| **Estado del documento**      | Borrador inicial                                                                                                      |

---

## 2. Objetivo de la revisión

La revisión del Sprint tiene como finalidad presentar el avance del incremento desarrollado, identificar las historias de usuario completadas, recopilar observaciones de los stakeholders y establecer los elementos que deben atenderse antes de finalizar la iteración.

El objetivo de trabajo considerado para el Sprint 1 es:

> Establecer la base funcional de EcoLogistica-Lima mediante la implementación progresiva de las funcionalidades de gestión de vehículos y conductores, preparando la información operativa necesaria para las siguientes funcionalidades logísticas.

Al **24 de septiembre de 2026**, el Sprint 1 continúa en ejecución. Esta versión constituye el borrador inicial del documento de revisión y sirve como punto de partida para registrar el avance y las decisiones que se confirmen durante las siguientes revisiones.

En esta etapa, los estados de las historias deberán contrastarse con Jira y con las evidencias disponibles antes de declararlas completadas.

---

## 3. Historias de usuario consideradas

Para iniciar el seguimiento funcional del Sprint, se consideran las siguientes historias de usuario:

| Código                  | Historia de usuario               | Requisito relacionado | Story Points | Estado al corte                       |
| :---------------------- | :-------------------------------- | :-------------------- | :----------: | :------------------------------------ |
| US-001                  | Registrar y administrar vehículos | RF-001                |     5 SP     | En seguimiento                        |
| US-002                  | Administrar conductores           | RF-008                |     5 SP     | Pendiente de ejecución o confirmación |
| **Total de referencia** | **Dos historias de usuario**      | —                     |   **10 SP**  | **Avance por validar**                |

La planificación y el estado de cada historia deben mantenerse sincronizados con el Sprint Backlog. La condición de «en seguimiento» no equivale a una historia completada.

La cantidad de subtareas y su estado definitivo se confirmarán con el registro actualizado de Jira.

---

## 4. US-001 — Registrar y administrar vehículos

**Código:** US-001
**Story Points de referencia:** 5 SP
**Estado al corte:** En seguimiento

### 4.1. Objetivo funcional

Permitir el registro y la administración de los vehículos que forman parte de la flota logística de DistriRápido S.A.C.

### 4.2. Alcance técnico previsto

Según la matriz de casos de uso, las actividades correspondientes incluyen:

* Diseñar la tabla `vehiculos` en PostgreSQL con los campos necesarios para identificar y caracterizar cada vehículo.
* Incorporar los atributos de placa, tipo, capacidad, consumo, factor de emisiones, año de fabricación y estado.
* Crear la migración de base de datos y las restricciones de unicidad correspondientes.
* Desarrollar los servicios REST para registrar, consultar y actualizar vehículos.
* Implementar validaciones de datos y reglas de negocio.
* Preparar las pruebas unitarias y de integración.
* Desarrollar el formulario y la tabla de administración en el frontend.
* Integrar la interfaz con los servicios del backend.

Estas actividades representan el alcance técnico de la historia. Su finalización deberá verificarse mediante las subtareas y evidencias correspondientes.

---

## 5. US-002 — Administrar conductores

**Código:** US-002
**Story Points de referencia:** 5 SP
**Estado al corte:** Pendiente de confirmación

### 5.1. Objetivo funcional

Permitir la administración de los conductores de la operación logística, incluyendo sus datos de identificación, licencia, experiencia, disponibilidad y punto de partida.

### 5.2. Alcance técnico previsto

La historia contempla:

* Diseñar el modelo de datos de conductores.
* Implementar los servicios REST para registrar, editar y cambiar el estado de los conductores.
* Incorporar las restricciones de asignación asociadas a la disponibilidad y jornada.
* Desarrollar las pantallas de administración.
* Realizar pruebas de integración con la capa de persistencia.

La historia deberá ejecutarse y validarse antes de considerarse completada.

---

## 6. Resumen de la demostración

La revisión contempla la presentación progresiva de las funcionalidades desarrolladas al equipo del proyecto y a los representantes pertinentes de DistriRápido S.A.C.

Para esta primera versión, el resumen de la demostración queda establecido como una sección de seguimiento que deberá completarse con las evidencias de la sesión correspondiente.

| Elemento                      | Información                                                                     |
| :---------------------------- | :------------------------------------------------------------------------------ |
| Objetivo                      | Revisar el avance de las funcionalidades de gestión de vehículos y conductores. |
| Funcionalidad prioritaria     | Registro y administración de vehículos.                                         |
| Evidencias esperadas          | Capturas de pantalla, pruebas ejecutadas y estado de las historias en Jira.     |
| Observaciones de stakeholders | Pendientes de registrar a partir de la sesión de revisión.                      |
| Fecha y asistentes            | Por confirmar según el registro de la reunión.                                  |

La demostración deberá permitir identificar las funcionalidades disponibles, los criterios de aceptación revisados y los aspectos que requieren ajustes.

---

## 7. Elementos pendientes

Al corte de esta versión, se deberán atender o confirmar los siguientes puntos:

* Verificar el estado real de US-001 y sus subtareas en Jira.
* Mantener actualizado el Sprint Backlog.
* Confirmar las evidencias de implementación y pruebas de US-001.
* Organizar el inicio y seguimiento de US-002.
* Verificar los criterios de aceptación de ambas historias.
* Registrar las observaciones de los stakeholders durante la revisión.
* Documentar los acuerdos y responsables de las acciones pendientes.
* Actualizar este documento cuando se disponga de información validada.

---

## 8. Próximas actividades

1. Revisar el estado de las historias de usuario y sus subtareas en Jira.
2. Completar las actividades pendientes de US-001.
3. Preparar las evidencias funcionales y técnicas.
4. Continuar con la planificación y ejecución de US-002.
5. Verificar los criterios de aceptación de las funcionalidades implementadas.
6. Registrar las observaciones de los stakeholders.
7. Actualizar la revisión del Sprint con el siguiente corte.

---

## 9. Conclusión

La versión V_1_0_0 constituye el borrador inicial de la Revisión del Sprint 1, elaborado el 24 de septiembre de 2026.

El documento establece como referencia inicial las historias US-001, relacionada con la administración de vehículos, y US-002, relacionada con la administración de conductores. Su avance deberá confirmarse mediante Jira y las evidencias de implementación disponibles.

Las siguientes versiones registrarán los cambios de estado, las funcionalidades verificadas, los resultados de las demostraciones y las actividades pendientes de acuerdo con la evolución real del proyecto.

---

## 10. Control de cambios

| Versión | Fecha      | Responsable         | Descripción                                                   | Estado   |
| :------ | :--------- | :------------------ | :------------------------------------------------------------ | :------- |
| V_1_0_0 | 24/09/2026 | Angela Rojas Quispe | Elaboración del borrador inicial de la Revisión del Sprint 1. | Borrador |

----

[← Volver al README principal](../../README.md)

