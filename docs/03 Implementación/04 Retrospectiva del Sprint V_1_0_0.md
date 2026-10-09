[← Volver al README principal](../../README.md)

# Reprospectiva del sprint

**Nombre del Proyecto:** EcoLogistica-Lima: Plataforma Web y Móvil para la Gestión y Optimización de Logística Verde Urbana

**Código del Proyecto:** PFA-ECOLIMA-2026

**Líder del Proyecto:** Zayuri Cerron Medina (Directora de Proyecto) / Jheferson Martinez Valerio (Scrum Master)

**Equipo:** Zayuri Cerron Medina, Jheferson Martinez Valerio, Angela Rojas Quispe, Maylit Mendoza Alarcon y Diego Angulo Gonzales.

**Sprint analizado:** ANA Sprint 2 — 3 al 10 de octubre de 2026, según las fechas visibles en Jira.

**Fecha de corte:** 9 de octubre de 2026.

**Versión del contenido:** 1.2.0. El nombre del archivo conserva V_1_0_0 conforme a la consigna oficial.

**Estado:** Actualización provisional para revisión del equipo. Análisis provisional; no constituye acta de una reunión de retrospectiva ni acredita acuerdos aprobados.

## Alcance y evidencia del corte

Esta actualización analiza la gestión del Sprint 2 en las épicas **EP-03 — Gestión de Pedidos y Geolocalización (ANA-3)** y **EP-04 — Gestión de Clientes y Preferencias (ANA-4)**. Se basa en la consulta de Jira en lectura y la comparación de la documentación publicada en las ramas `main` y `feature/fase-01-inicio` de GitHub.

| Historia | Épica | SP en Jira | Estado de la historia | Subtareas completadas | Asignación |
|---|---|---:|---|---:|---|
| US-003 — Gestionar pedidos y geolocalización (ANA-7) | EP-03 | 8 | Listo | 0/9 | Sin asignar |
| US-004 — Gestionar preferencias y restricciones del cliente (ANA-8) | EP-04 | 5 | Listo | 0/9 | Sin asignar |
| **Total** | | **13** | **13/13 SP registrados como hechos** | **0/18** | |

Las 18 subtareas consultadas permanecen en **Por hacer** y sin asignar. Esto evidencia una inconsistencia de seguimiento, pero no permite concluir que no se haya realizado el trabajo técnico. El backlog todavía muestra la acción **Completar sprint**: las historias están en Listo, pero el cierre formal del sprint sigue pendiente al corte.

US-004 presenta fecha de inicio del **10 de octubre**, aunque ya figura resuelta el día del corte, **9 de octubre**. Debe verificarse si esa fecha representa la planificación inicial o un dato pendiente de actualización.

Los documentos también requieren conciliación: el informe V_1_3_0 de `main` declara 13 SP para este incremento, pero conserva valores que suman 10 SP en otras secciones; las revisiones V_1_3_0 y V_1_4_0 de `feature/fase-01-inicio` incluyen US-003 y US-004 como parte de Sprint 1. Para este análisis se utiliza su pertenencia actual a Sprint 2 y las estimaciones de Jira, sin borrar ni reinterpretar los cortes históricos.

No se ejecutaron pruebas funcionales en esta revisión. Los estados de Jira y la existencia de código no sustituyen los resultados de pruebas ni la verificación de los criterios de aceptación. Los registros de impedimentos de Sprint 2 que se presentan como propuestas en GitHub no se consideran incidentes confirmados.

## ¿Qué aprendimos?

**El cierre de una historia debe mantener trazabilidad con sus subtareas.** Registrar 13 SP en Listo mientras las 18 subtareas siguen en Por hacer produce dos lecturas incompatibles del avance. La solución no es cerrar subtareas automáticamente: primero se debe contrastar cada actividad con su implementación, prueba o documento y registrar el resultado real.

**Las preferencias del cliente complementan los datos del pedido.** EP-03 comprende el registro de pedidos, dimensiones de carga, ventanas de tiempo y geolocalización; EP-04 contempla horarios de atención, restricciones de acceso y referencias de entrega. La revisión conjunta debe comprobar que esos datos se guardan y recuperan de forma coherente. Su utilidad para la planificación posterior depende de esa integración, y no solo de la existencia de formularios separados.

**Los cambios de alcance necesitan una explicación documental.** La pertenencia actual de US-003 y US-004 a Sprint 2 debe distinguirse de los documentos que las sitúan en Sprint 1. Sin fecha de corte, referencia al sprint y motivo del cambio, los porcentajes y puntos dejan de ser comparables. El total actual del incremento es 13 SP; no corresponde mezclarlo con los puntos de Sprint 1 ni tratarlo como porcentaje global del producto.

**La evidencia debe diferenciar resultados y propuestas.** Las pruebas, impedimentos resueltos y acuerdos de mejora deben apoyarse en registros verificables. Una propuesta de impedimento no acredita que el problema ocurrió, y una acción sugerida no demuestra que el equipo ya la ejecutó.

## ¿Qué estamos haciendo bien?

**Existe una separación identificable del alcance.** Jira agrupa pedidos y geolocalización en EP-03, y preferencias del cliente en EP-04. Los identificadores ANA-7 y ANA-8 permiten vincular el seguimiento con las historias descritas en GitHub.

**Se dispone de una descomposición técnica para revisar el incremento.** Cada historia contiene nueve subtareas que abarcan interfaz, validaciones, integración, pruebas y documentación. Aunque sus estados requieren actualización, esta estructura permite revisar qué evidencia debe acompañar el cierre.

**Hay avances técnicos publicados que pueden contrastarse.** En `main` existen archivos de implementación de clientes y pruebas para US-003/US-004, además de informes de Sprint 2. Esto proporciona material para la revisión; no se atribuye éxito a esas pruebas sin comprobar su ejecución.

**Los documentos conservan versiones sucesivas.** Los cortes permiten reconocer cómo evolucionó el avance declarado. Para aprovechar esa trazabilidad, deben identificar claramente cuál versión y rama se utiliza como referencia para la entrega.

## ¿Qué podemos hacer mejor?

### Personas

Las historias y subtareas de Sprint 2 aparecen sin asignar. Esto dificulta identificar quién debe aportar la evidencia, aclarar una validación o actualizar un estado. No implica ausencia de colaboración; revela que las responsabilidades no están reflejadas en la herramienta. Se propone acordar un responsable de seguimiento por historia y confirmar con el equipo quién ejecutó cada actividad, sin atribuir trabajo por suposición.

### Relaciones

Las diferencias entre `main`, la rama histórica y Jira muestran que la comunicación de avances no está consolidada en una referencia común. Una persona puede preparar el informe usando Sprint 2 mientras otra actualiza la revisión bajo Sprint 1. Se propone una revisión conjunta entre Product Owner, Scrum Master y responsables de implementación y documentación para acordar alcance, fechas y evidencias de la entrega.

### Procesos

El estado Listo de las historias no está acompañado por el cierre de sus subtareas. Antes del cierre formal del sprint, debe comprobarse el cumplimiento de los criterios de aceptación y la Definition of Done con evidencia por actividad. Si existe trabajo pendiente, debe identificarse y acordarse su tratamiento; no debe modificarse el estado únicamente para obtener un porcentaje esperado.

También debe revisarse la fecha de inicio de US-004 y conciliarse la pertenencia de las historias a cada sprint en los documentos. La retrospectiva definitiva debe registrar el resultado del cierre y los acuerdos reales de la reunión, que todavía no se acreditan en este borrador.

### Herramientas

Jira permite identificar el avance agregado, pero sus datos requieren mantenimiento para que el detalle lo respalde. GitHub contiene versiones con cifras y alcances distintos, y las ramas no publican el mismo conjunto de archivos. Se propone vincular cada historia con el código, los resultados de pruebas y el documento correspondiente, indicando la rama y el corte revisados.

Debe distinguirse la demostración visual de la comprobación de persistencia e integración. Para EP-03 y EP-04, la evidencia debería incluir registro y recuperación de pedidos y preferencias, respuestas ante datos inválidos y resultados de las pruebas aplicables. La cobertura y los tiempos de respuesta solo se reportarán si fueron medidos.

### Acciones a realizar

Las siguientes acciones son **propuestas pendientes de validar con el equipo**. Los responsables indican coordinación sugerida según los roles conocidos; no constituyen asignaciones aprobadas.

| Acción propuesta | Eje | Responsable propuesto | Plazo propuesto | Evidencia o criterio de verificación |
|---|---|---|---|---|
| Revisar las 18 subtareas de US-003 y US-004 y registrar su estado real, responsable y evidencia. | Personas / Procesos | Jheferson Martinez, con quienes realizaron cada actividad | Antes del cierre formal de Sprint 2 | 18/18 subtareas revisadas; cada una con estado justificado y responsable confirmado, sin exigir que todas estén terminadas. |
| Conciliar alcance, fechas y SP entre Jira, informe, revisión y retrospectiva; aclarar la fecha de inicio de US-004. | Relaciones / Procesos | Angela Rojas y Zayuri Cerron | Antes de aprobar la actualización documental | Los documentos vigentes identifican Sprint 2 del 3 al 10 de octubre, US-003 de 8 SP y US-004 de 5 SP, o explican cualquier cambio confirmado. |
| Reunir resultados de pruebas de pedidos y preferencias, incluyendo persistencia, recuperación y rechazo de datos inválidos. | Procesos / Herramientas | Maylit Mendoza, con el equipo de desarrollo | Antes de validar el cierre de las historias | Registro de casos ejecutados, resultado, fecha, versión probada y defectos pendientes; sin porcentajes de cobertura no medidos. |
| Acordar la rama y versión documental de referencia para la entrega y actualizar sus enlaces cuando se autorice la edición. | Relaciones / Herramientas | Jheferson Martinez y Diego Angulo | Antes de preparar la entrega evaluable | Índice que dirige a los documentos vigentes y al código que respalda el incremento, sin enlaces a archivos inexistentes. |
| Revisar las acciones propuestas en la retrospectiva de Sprint 1 y registrar cuáles se cumplieron, quedaron pendientes o cambiaron. | Personas / Procesos | Equipo Scrum, coordinado por Jheferson Martinez | En la retrospectiva de cierre de Sprint 2 | Cada acción anterior tiene estado, evidencia disponible y decisión de continuidad. |
| Confirmar en reunión los aprendizajes y las acciones, incorporando responsables y plazos acordados. | Relaciones | Equipo Scrum | En el cierre de Sprint 2, previsto para el 10 de octubre | Registro de fecha, participantes y acuerdos reales; publicación posterior a la revisión y autorización del usuario. |

## Referencias consultadas

- [Backlog del proyecto ANA](https://continental-team-yg5bc6tv.atlassian.net/jira/software/projects/ANA/boards/2/backlog).
- [ANA-7 — US-003](https://continental-team-yg5bc6tv.atlassian.net/browse/ANA-7).
- [ANA-8 — US-004](https://continental-team-yg5bc6tv.atlassian.net/browse/ANA-8).
- [Documentación de implementación en main](https://github.com/MartinezJhef/EcoLogistica-Lima/tree/fa85b65393d83eb19af67ac641e606ec92dba927/docs/03%20Implementaci%C3%B3n).
- [Documentación de implementación en feature/fase-01-inicio](https://github.com/MartinezJhef/EcoLogistica-Lima/tree/d79ef93cc616d74133f5892f1817ae69db6a3e20/docs/03%20Implementaci%C3%B3n).

Las referencias de GitHub se fijan al contenido revisado. Jira refleja un estado consultado al 9 de octubre de 2026 y puede cambiar después de este corte.

## Control de cambios

| Versión del contenido | Fecha | Descripción |
|---|---|---|
| 1.2.0 | 09/10/2026 | Actualización provisional de Sprint 2 para EP-03 y EP-04; comparación de Jira y GitHub, análisis de cuatro ejes y plan de acción propuesto. Sustituye el contenido anterior en el nombre oficial; las revisiones previas se conservan en el historial de Git. |

[← Volver al README principal](../../README.md)
