[← Volver al README principal](../../README.md)

# 01. Informe de estado del proyecto

| **Campo** | **Detalle** |
| --- | --- |
| **Nombre del Proyecto** | EcoLogistica-Lima: Plataforma Web y Móvil para la Gestión y Optimización de Logística Verde Urbana |
| **Código del Proyecto** | PFA-ECOLIMA-2026 |
| **Integrantes del Equipo** | • Zayuri Cerron Medina<br>• Jheferson Martinez Valerio<br>• Angela Rojas Quispe<br>• Maylit Mendoza Alarcon<br>• Diego Angulo Gonzales |
| **Fecha de Elaboración** | 30 de septiembre de 2026 |
| **Versión** | 1.0.0 |
| **Líder del Proyecto** | Zayuri Anahí Cerrón Medina |
| **Sprint** | Sprint 1 |
| **Estado del Sprint** | En ejecución |
| **Última actualización** | Registro inicial del avance |
| **Nota de versión** | Esta versión corresponde al primer registro formal del estado del Sprint 1. US-001 se encuentra terminada, mientras que US-002 presenta un avance parcial. Las demás historias del Product Backlog permanecen pendientes de implementación. |

## 1. Objetivo del Sprint

El Sprint 1 tiene como objetivo establecer la primera base funcional del sistema **EcoLogistica-Lima**, mediante el desarrollo de las funcionalidades iniciales relacionadas con la gestión de vehículos de la flota y la gestión de conductores y jornada.

Estas funcionalidades constituyen una base necesaria para los siguientes incrementos del producto, debido a que la información de vehículos y conductores será utilizada posteriormente en los procesos de registro de pedidos, asignación de recursos, generación de rutas y optimización logística.

Para este Sprint se priorizaron las historias de usuario **US-001 – Gestionar vehículos de la flota** y **US-002 – Gestionar conductores y jornada**, correspondientes a las primeras épicas funcionales del proyecto.

---

## 2. Historias de Usuario del Sprint en proceso

| **ID** | **Historia de Usuario** | **Épica** | **RF relacionado** | **SP** | **Estado** |
| --- | --- | --- | --- | ---: | --- |
| **US-001** | Gestionar vehículos de la flota | EP-01 Gestión de Vehículos | RF-001 | 5 | **Terminada** |
| **US-002** | Gestionar conductores y jornada | EP-02 Gestión de Conductores | RF-008 | 3 | **Parcial** |

### US-001 – Gestionar vehículos de la flota

La historia de usuario US-001 tiene como finalidad proporcionar una funcionalidad para administrar la información de los vehículos que conforman la flota utilizada por la empresa.

Durante el Sprint se completó el desarrollo previsto para esta historia, considerando la gestión de los principales datos asociados a los vehículos y la información necesaria para su utilización en los procesos posteriores del sistema.

La funcionalidad constituye la primera base para que los vehículos puedan ser considerados posteriormente en los procesos de asignación y optimización de rutas.

**Estado: Terminada.**

### US-002 – Gestionar conductores y jornada

La historia de usuario US-002 tiene como finalidad permitir la gestión de los conductores y registrar la información relacionada con su jornada y disponibilidad.

Durante el Sprint se avanzó en la implementación de esta funcionalidad y en la estructura necesaria para gestionar la información de los conductores.

Sin embargo, al momento de esta versión todavía se encuentran pendientes algunas validaciones y elementos relacionados con la gestión completa de la jornada y disponibilidad del conductor.

**Estado: Parcial.**

---

## 3. Estado general del Product Backlog

El proyecto cuenta con un conjunto de diez historias de usuario que representan las principales funcionalidades previstas para el producto. Para el Sprint 1 únicamente se priorizaron US-001 y US-002. Las demás historias permanecen pendientes y serán desarrolladas en los siguientes incrementos.

| **ID** | **Historia de Usuario** | **Épica** | **RF** | **SP** | **Estado** |
| --- | --- | --- | --- | ---: | --- |
| **US-001** | Gestionar vehículos de la flota | EP-01 Gestión de Vehículos | RF-001 | 5 | **Terminada** |
| **US-002** | Gestionar conductores y jornada | EP-02 Gestión de Conductores | RF-008 | 3 | **Parcial** |
| US-003 | Registrar pedidos y geolocalización | EP-03 Gestión de Pedidos y Geolocalización | RF-002 | 5 | Pendiente |
| US-004 | Gestionar preferencias y restricciones del cliente | EP-04 Gestión de Clientes y Preferencias | RF-009 | 3 | Pendiente |
| US-005 | Generar rutas optimizadas | EP-05 Optimización de Rutas | RF-003 | 13 | Pendiente |
| US-006 | Visualizar rutas en el mapa | EP-06 Monitoreo y Reoptimización de Rutas | RF-004 | 8 | Pendiente |
| US-007 | Reoptimizar rutas ante eventos | EP-06 Monitoreo y Reoptimización de Rutas | RF-007 | 8 | Pendiente |
| US-008 | Consultar indicadores operativos y de sostenibilidad | EP-07 Analítica, Reportes y Sostenibilidad | RF-005 | 5 | Pendiente |
| US-009 | Generar reportes de sostenibilidad y costos | EP-07 Analítica, Reportes y Sostenibilidad | RF-006 | 3 | Pendiente |
| US-010 | Generar propuesta de compensación de carbono | EP-07 Analítica, Reportes y Sostenibilidad | RF-010 | 5 | Pendiente |

### Resumen del avance

De las historias priorizadas para el Sprint 1:

- **1 historia se encuentra terminada:** US-001.
- **1 historia presenta avance parcial:** US-002.
- **8 historias permanecen pendientes**, debido a que corresponden a funcionalidades previstas para posteriores incrementos.

El avance registrado corresponde a **8 Story Points involucrados en las historias del Sprint**, de los cuales 5 SP corresponden a una historia terminada y 3 SP a una historia con avance parcial.

---

## 4. Casos de uso y funcionalidades relacionadas

Como parte de la trazabilidad del proyecto, se consideran los casos de uso definidos para el sistema. En esta primera versión, los casos relacionados directamente con las funcionalidades trabajadas en el Sprint presentan avance, mientras que los demás permanecen pendientes.

| **Caso de uso / funcionalidad** | **Relación con el Sprint** | **Estado** |
| --- | --- | --- |
| Gestión de vehículos de la flota | US-001 | **Terminado** |
| Gestión de conductores | US-002 | **Parcial** |
| Gestión de jornada de conductores | US-002 | **Parcial** |
| Registro de pedidos | US-003 | Pendiente |
| Geolocalización de pedidos | US-003 | Pendiente |
| Gestión de preferencias y restricciones del cliente | US-004 | Pendiente |
| Generación de rutas optimizadas | US-005 | Pendiente |
| Visualización de rutas en mapa | US-006 | Pendiente |
| Reoptimización de rutas | US-007 | Pendiente |
| Consulta de indicadores operativos y sostenibilidad | US-008 | Pendiente |
| Generación de reportes de sostenibilidad y costos | US-009 | Pendiente |
| Propuesta de compensación de carbono | US-010 | Pendiente |

Esta distribución permite diferenciar las funcionalidades que forman parte del avance actual del Sprint de aquellas que permanecen planificadas para etapas posteriores.

---

## 5. Demostración del trabajo completado

La demostración del Sprint 1 estará orientada a presentar a los stakeholders el avance obtenido en las funcionalidades iniciales del sistema.

La demostración comprende principalmente:

### Gestión de vehículos

- Registro de información de vehículos.
- Consulta de vehículos registrados.
- Gestión de sus principales características.
- Preparación de la información para posteriores procesos de asignación y optimización.

### Gestión de conductores

- Registro y consulta de información de los conductores.
- Estructura inicial para controlar la disponibilidad.
- Avance en la gestión de la jornada de los conductores.

### Seguimiento del Sprint

También se podrá evidenciar el seguimiento de las historias mediante Jira, mostrando:

- Historias incluidas en el Sprint 1.
- Asociación de historias con sus respectivas épicas.
- Story Points asignados.
- Estado de cada historia.
- Evolución del trabajo realizado.

La demostración permitirá evidenciar el paso de la etapa de planificación hacia la implementación de las primeras funcionalidades del producto.

---

## 6. Riesgos gestionados durante el Sprint

Durante el Sprint se realizó seguimiento a los riesgos identificados en el proyecto, principalmente aquellos relacionados con el cronograma, disponibilidad del equipo y trazabilidad del desarrollo.

| **ID** | **Riesgo** | **Acción de gestión** | **Estado** |
| --- | --- | --- | --- |
| RSK-02 | Retraso del cronograma de 16 semanas por sobrecarga académica o subestimación del trabajo. | Priorización de las funcionalidades iniciales y seguimiento periódico del Sprint mediante Jira. | En seguimiento |
| RSK-10 | Disponibilidad de los integrantes por debajo de la capacidad planificada. | Distribución del trabajo de acuerdo con las actividades priorizadas y seguimiento del avance. | En seguimiento |
| RSK-11 | Pérdida de trazabilidad entre Jira y GitHub. | Mantenimiento de la relación entre historias, actividades y evidencias del proyecto. | Controlado |
| RSK-12 | Evidencias de Jira incompletas o incorrectas. | Revisión de las evidencias asociadas al Sprint y actualización del tablero. | Controlado |

Los riesgos que permanecen en seguimiento serán revisados durante los siguientes Sprints y podrán generar acciones de mitigación adicionales si se incrementa su impacto.

---

## 7. Pendientes

Los principales pendientes identificados en esta versión son:

| **ID** | **Pendiente** | **Descripción** |
| --- | --- | --- |
| **US-002** | Completar gestión de conductores y jornada | Finalizar las validaciones y funcionalidades relacionadas con la jornada y disponibilidad. |
| US-003 | Registro de pedidos y geolocalización | Implementar el registro de pedidos y sus respectivas coordenadas. |
| US-004 | Preferencias y restricciones | Implementar la gestión de preferencias y restricciones de los clientes. |
| US-005 | Optimización de rutas | Implementar la generación de rutas optimizadas. |
| US-006 | Visualización de rutas | Incorporar la visualización de rutas mediante mapas. |
| US-007 | Reoptimización | Implementar la actualización de rutas ante eventos o cambios. |
| US-008 | Indicadores | Implementar indicadores operativos y de sostenibilidad. |
| US-009 | Reportes | Implementar reportes relacionados con sostenibilidad y costos. |
| US-010 | Compensación de carbono | Implementar la propuesta de compensación de carbono. |

---

## Cierre de la versión 1.0.0

El primer registro del Sprint 1 evidencia un avance funcional en las primeras capacidades del sistema. La gestión de vehículos se encuentra terminada y la gestión de conductores y jornada presenta un avance parcial. Las demás funcionalidades permanecen pendientes y serán abordadas progresivamente en los siguientes Sprints.

[← Volver al README principal](../../README.md)