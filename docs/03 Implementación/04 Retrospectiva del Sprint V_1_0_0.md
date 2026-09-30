[← Volver al README principal](../../README.md)

# Reprospectiva del sprint

**Nombre del Proyecto:** EcoLogistica-Lima: Plataforma Web y Móvil para la Gestión y Optimización de Logística Verde Urbana

**Líder del Proyecto:** Zayuri Cerron Medina — Directora de Proyecto / Project Manager

**Código del Proyecto:** PFA-ECOLIMA-2026  
**Responsable del documento:** Diego Angulo Gonzales — Gestor de Stakeholders / Comunicaciones  
**Scrum Master:** Jheferson Martinez Valerio  
**Product Owner:** Angela Rojas Quispe  
**Analista de Riesgos / QA:** Maylit Mendoza Alarcon  
**Sprint:** Sprint 1  
**Periodo previsto:** 16 de septiembre al 9 de octubre de 2026  
**Fecha de elaboración y corte de la revisión:** 30 de septiembre de 2026  
**Versión:** 1.0.0 — V_1_0_0  
**Estado:** Borrador para revisión del equipo; pendiente de validación al cierre del Sprint 1.

**Alcance de esta retrospectiva.** Este documento analiza la organización, seguimiento y trazabilidad del Sprint 1 con corte al 30 de septiembre de 2026. Se contrastaron la consigna y plantilla oficiales, la documentación publicada y el Jira del proyecto mediante consulta directa en lectura. El Sprint todavía está abierto: el análisis es provisional y las acciones son propuestas para validar con el equipo. No se atribuyen historias terminadas, demos realizadas, impedimentos materiales ni acuerdos aprobados sin evidencia.

**Sprint Goal registrado:**

> Implementar las funcionalidades iniciales de gestión de vehículos, conductores y pedidos, estableciendo una base funcional para la posterior optimización y monitoreo de rutas.

**Alcance y estado actuales comprobados en Jira:**

| Historia | Identificador Jira | Requisito de origen | SP actuales | Estado | Persona asignada | Subtareas completadas |
|---|---|---|---:|---|---|---:|
| US-001 Gestionar vehículos de la flota | ANA-9 | RF-001 | 5 | Por hacer | Sin asignar | 0/8 |
| US-002 Gestionar conductores y jornada | ANA-6 | RF-008 | 5 | Por hacer | Sin asignar | 0/9 |
| **Total de Sprint 1** | | | **10** | **10 SP pendientes; 0 en curso; 0 hechos** | | **0/17** |

Las 17 subtareas de estas dos historias figuran también en Por hacer y Sin asignar. Esto acredita el estado registrado en Jira, pero no permite concluir que no exista trabajo realizado fuera de la herramienta. Ambas historias están vinculadas a la versión **V1.0.0-MVP** y tienen prioridad **Highest**.

**Cambio de alcance observado.** La captura histórica de Sprint Planning publicada en GitHub incluía ANA-9, ANA-6 y ANA-7 por 18 SP. En el Jira actual, **ANA-7 / US-003 Gestionar pedidos y geolocalización, de 8 SP, pertenece a ANA Sprint 2**. Su historial confirma un traslado desde Sprint 1 a Sprint 2; la entrada más reciente se muestra como “hace 5 días”. No se encontró en la descripción o el historial consultados la justificación de ese cambio. La reducción de 18 a 10 SP corresponde a la salida de esa historia, no a puntos entregados ni a una reestimación de las dos historias restantes.

La meta de Sprint 1 todavía incluye pedidos, por lo que debe revisarse su coherencia con el alcance actual. Por separado, el resumen del backlog del documento ágil publicado consigna 5, 3 y 5 SP para US-001, US-002 y US-003: esos 13 SP corresponden al conjunto de tres historias y no al Sprint 1 actual. Debe conciliarse esa línea documental con los valores actuales 5, 5 y 8 SP y registrar el cambio de Sprint de ANA-7.

## ¿Qué aprendimos?

**La trazabilidad debe mantener coherencia de contenido, además de identificadores.** Tener US-001, US-002 y US-003 tanto en Jira como en Markdown facilita localizar el trabajo, pero las diferencias de estimación muestran que esa correspondencia no basta. La evidencia histórica muestra 18 SP, el Sprint 1 actual contiene 10 SP y el resumen documental de las tres historias suma 13 SP. Cada cifra responde a un alcance o versión diferente; compararlas sin ese contexto distorsiona la capacidad y el avance. Cada cambio de estimación debe registrar fecha, motivo y documentos afectados; los puntos planificados tampoco pueden tratarse como puntos entregados.

**La base operativa condiciona las funcionalidades posteriores.** El objetivo prioriza datos de vehículos, conductores y pedidos antes de optimizar rutas, pero el traslado de pedidos a Sprint 2 exige revisar qué parte de esa base puede validarse en Sprint 1. La utilidad de esa base depende de validar capacidades, disponibilidad, jornadas, carga, ventanas horarias y coordenadas. Diseñar formularios o registrar tareas no prueba que estas reglas funcionen. Los criterios BDD existentes deben convertirse en pruebas reproducibles que acompañen cada historia.

**Definir calidad y demostrar calidad son actividades distintas.** El documento ágil establece una Definition of Done con aceptación BDD, cobertura unitaria mínima del 80%, análisis estático, revisión por un par, integración, validación en Staging y documentación actualizada. Esta definición es una fortaleza de planificación; sin resultados de pruebas y revisiones no permite afirmar que se cumplió. La retrospectiva debe analizar también el esfuerzo de verificación y evitar concentrarlo al final.

**Un riesgo previsto no equivale a un impedimento ocurrido.** La planificación identifica riesgos de disponibilidad del equipo, servicios externos y pérdida de trazabilidad. Los archivos institucionales de impedimentos y estado revisados son plantillas, no registros operativos de EcoLogistica-Lima. No corresponde convertir esos riesgos en incidentes retrospectivos sin fecha, impacto y evidencia de su materialización.

## ¿Qué estamos haciendo bien?

- **El alcance actual puede inspeccionarse por historia y subtarea.** Jira muestra dos historias, 10 SP y 17 subtareas de diseño, implementación, validaciones, pruebas y documentación. Esta descomposición permite localizar el trabajo necesario; su valor de seguimiento depende de asignar responsables y actualizar estados. La meta existe, aunque necesita alinearse con la salida de pedidos.
- **Existe una base de responsabilidades clara.** La documentación identifica PM, Scrum Master, Product Owner, QA y Comunicaciones. Esta distribución permite asignar seguimiento, aceptación y revisión documental; todavía debe complementarse con responsables de implementación y revisores para cada tarea.
- **La documentación relaciona requisitos con historias y condiciones de aceptación.** RF-001 y RF-008 se vinculan con las historias actuales del Sprint 1; RF-002 corresponde a ANA-7, ahora en Sprint 2. La Definition of Done aporta controles verificables para decidir cuándo termina el trabajo.
- **Jira y GitHub ofrecen una base de seguimiento común.** El artefacto Jira reúne roadmap, backlog, Sprint Planning, tablero y release. Su publicación permite revisar la planificación y detectar diferencias concretas. Su utilidad aumentará al incorporar evidencias fechadas del avance y cierre.
- **La planificación contempla riesgos relevantes.** El registro de riesgos incluye capacidad del equipo, dependencia de mapas y trazabilidad Jira–GitHub. Esto permite preparar medidas preventivas; no implica que dichas medidas ya se ejecutaron o que los riesgos se materializaron.

## ¿Qué podemos hacer mejor?

### Personas

Los roles de gestión están documentados, pero Jira muestra Sin asignar en las dos historias de Sprint 1 y en sus 17 subtareas. La responsabilidad organizativa todavía no se traduce en una asignación visible del trabajo técnico. Esto dificulta saber quién inicia cada tarea, quién revisa y cómo se reparte la carga. No demuestra bajo compromiso individual ni permite atribuir causas de retraso: falta contrastar la disponibilidad y el trabajo externo al tablero.

Se propone que Jheferson y Zayuri revisen la disponibilidad real de cada integrante y asignen responsables de implementación y revisión en Jira. El responsable del documento no debe convertirse automáticamente en responsable técnico de todas las historias. Para compartir conocimiento, cada autor debería explicar a su revisor las validaciones críticas y cómo reproducirlas. La mejora se verificará con la matriz de asignación y registros de revisión, sin usar los Story Points como medida de productividad individual. **Acción vinculada: AC-01.**

### Relaciones

La consulta directa de Jira y las capturas históricas muestran el nombre **“Proyecto Ecologistica Huancayo”**, mientras el repositorio y la línea base identifican **EcoLogistica-Lima**. El registro de interesados contempla comunicación con operaciones, despacho y conductores, pero no se encontró un acta de demo o retroalimentación del Sprint 1. La diferencia de nombres puede confundir el contexto territorial y académico; la ausencia de evidencia de participación no permite afirmar que los interesados hayan validado las funcionalidades.

Se propone que Angela confirme con Zayuri el nombre y ámbito vigentes; Diego deberá documentar esa decisión y preparar la coordinación de la Review con los interesados pertinentes. Las observaciones recibidas deben registrar emisor, fecha, historia afectada y decisión de aceptación, ajuste o aplazamiento. La retrospectiva de cierre debe permitir que los cinco integrantes aporten hechos, dificultades y mejoras, evitando atribuir culpas a partir de capturas históricas. **Acciones vinculadas: AC-02 y AC-06.**

### Procesos

La salida de ANA-7 reduce el alcance visible de Sprint 1 de **18 a 10 SP**, mientras su meta conserva pedidos. El historial prueba el traslado, pero falta documentar su motivo y el efecto sobre la meta. Además, las estimaciones del resumen documental (5/3/5) difieren de Jira (5/5/8). Estas diferencias muestran una brecha de control de cambios y de sincronización. Además, el README plantea una cadencia de dos semanas, mientras el backlog actual de Sprint 1 muestra el periodo del 16 de septiembre al 9 de octubre, superior a esa cadencia. Estas diferencias requieren una explicación documentada: no deben corregirse cambiando fechas o estimaciones sin revisar el acuerdo de planificación.

Se propone conciliar el compromiso inicial, las reestimaciones y la duración efectiva con el Product Owner y el Scrum Master. Para evaluar el resultado final, cada historia declarada terminada debe tener evidencia de aceptación y de la DoD; las pendientes deben conservar su estado y razón. El Informe de Estado, Registro de Impedimentos, Review y Retrospectiva deben utilizar un mismo corte temporal. Jira registra actualmente 0 SP hechos, pero ese valor no es la velocidad final de un Sprint todavía abierto. Sin evidencias de cierre no corresponde concluir éxito total, retraso definitivo o ausencia de defectos. **Acciones vinculadas: AC-03, AC-05 y AC-06.**

### Herramientas

El tablero consultado directamente presenta visualmente **Por hacer → En curso → Listo → In Review**. Este orden difiere del flujo descrito en el artefacto Jira, que sitúa revisión antes de Done. La consulta demuestra el orden visible, pero no permite comprobar las reglas de transición; se debe revisar la configuración antes de atribuir cierres prematuros.

Las capturas de planificación publicadas ya no representan el alcance actual del Sprint: muestran tres historias, mientras el backlog actual contiene dos. Conservarlas sin fecha o explicación puede llevar a evaluar una planificación anterior como si estuviera vigente. Antes de integrar documentos conviene verificar la revisión de referencia y contrastarla con el Jira actual.

Se propone ordenar las columnas conforme al flujo acordado, comprobar las transiciones y conservar capturas con fecha y contexto. Cada cambio funcional debe relacionarse con su historia y revisión, utilizando la estrategia de ramas definida por el proyecto. Para las historias actuales deben registrarse evidencias de validación de placa duplicada, licencia, jornada y disponibilidad, conforme a los criterios de aceptación. La geolocalización queda como dependencia posterior de ANA-7 en Sprint 2; no se evalúa como entrega actual de Sprint 1. **Acciones vinculadas: AC-04, AC-05 y AC-07.**

### Acciones a realizar

El siguiente plan es **propuesto**. Los responsables indicados deben confirmar su aceptación; las fechas son metas de trabajo posteriores a la elaboración del borrador. Diego registrará los acuerdos efectivos en la sesión de cierre y Jheferson realizará el seguimiento. No se presenta ninguna acción como ejecutada.

| ID / eje | Acción concreta | Responsable propuesto | Fecha o momento objetivo | Evidencia e indicador de cumplimiento |
|---|---|---|---|---|
| AC-01 / Personas | Revisar disponibilidad, asignar autor y revisor técnico por historia y acordar una explicación entre pares de las validaciones críticas. | Jheferson Martinez; Zayuri Cerron coordina disponibilidad. | 2 de octubre de 2026. | 2 de 2 historias y 17 de 17 subtareas con responsable; revisor por historia y distribución de capacidad registrada. |
| AC-02 / Relaciones | Confirmar nombre y ámbito Lima/Huancayo y documentar la decisión para los artefactos afectados. | Angela Rojas y Zayuri Cerron; Diego Angulo registra. | 2 de octubre de 2026. | Una decisión fechada; ninguna diferencia territorial sin explicación en los artefactos de entrega. |
| AC-03 / Procesos | Documentar salida de ANA-7 (18→10 SP), su motivo e impacto en la meta; conciliar estimaciones de Jira y Markdown y justificar duración del Sprint. | Angela Rojas y Jheferson Martinez. | 2 de octubre de 2026. | 2 historias actuales conciliadas; traslado de ANA-7 documentado; meta y periodo revisados; 0 discrepancias sin resolver o justificar. |
| AC-04 / Herramientas | Revisar orden de columnas y transiciones para que revisión/QA preceda al estado final; verificar rama y versión documental de referencia. | Jheferson Martinez. | 3 de octubre de 2026. | Captura fechada del tablero y prueba de transición; rama y revisión de referencia identificadas. |
| AC-05 / Procesos y herramientas | Preparar por historia una lista de DoD y enlazar pruebas BDD, cobertura, análisis estático, PR, validación en Staging y documentación aplicable. | Maylit Mendoza; cada autor técnico aporta evidencia. | Antes de declarar cada historia terminada y, como máximo, al cierre del 9 de octubre. | 100% de historias declaradas Done con evidencias de todos los criterios aplicables; cobertura ≥80% según la DoD. |
| AC-06 / Relaciones y procesos | Coordinar la Review; reunir estados finales, demo, feedback e impedimentos reales; realizar la retrospectiva con los cinco integrantes y validar este plan. | Diego Angulo coordina evidencias; Jheferson facilita; Angela valida aceptación. | Cierre previsto del 9 de octubre de 2026. | Registro de Review y retrospectiva con fecha y participantes; 2 historias actuales y el cambio de alcance conciliados; acciones aceptadas, ajustadas o descartadas con motivo. |
| AC-07 / Herramientas y procesos | Actualizar las evidencias de planificación y tablero; relacionar cada subtarea con pruebas y cambios de código, sin marcar Done únicamente para completar el reporte. | Diego Angulo conserva evidencias; autores técnicos actualizan sus tareas; Maylit verifica. | Desde el 2 de octubre y antes de la Review del 9 de octubre. | Evidencias fechadas del alcance de 10 SP; 17 subtareas con estado contrastado con su trabajo; cada cambio funcional con referencia Jira y prueba asociada. |

**Seguimiento propuesto.** En cada jornada de trabajo acordada, el Scrum Master revisará avances y bloqueos; Diego actualizará la evidencia documental y Maylit comprobará los controles de calidad. Al cierre, el equipo revisará cada acción con estado, fecha, evidencia y motivo de cualquier reprogramación. En la siguiente retrospectiva se evaluará si disminuyeron las diferencias entre artefactos y si todas las historias terminadas tienen evidencia de la DoD. Los porcentajes del plan son metas, no resultados obtenidos.

**Validación pendiente para la entrega final.** Después del cierre deben incorporarse los aprendizajes expresados por el equipo, los impedimentos realmente registrados, el resultado verificado de las historias y las acciones acordadas. La Review documentará el incremento y el feedback; esta retrospectiva deberá explicar cómo las prácticas del equipo influyeron en esos resultados. La confirmación de estos elementos permitirá convertir el borrador documental en una retrospectiva de cierre sustentada.

## Fuentes y trazabilidad

- **Consigna y rúbrica de Sprint 1:** `Consigna implementacion sprint 1.html`, en la carpeta local `Consignas de Evaluación`. El criterio de retrospectiva exige análisis de Personas, Relaciones, Procesos y Herramientas con un plan de acción concreto.
- **Plantilla oficial:** `03 Implementación/Plantilla en Markdown/Retrospectiva del Sprint.md`. Se conserva el encabezado “Reprospectiva del sprint” tal como aparece en la plantilla y la jerarquía de apartados requerida.
- **Archivos institucionales de apoyo:** Informe de Estado del Proyecto, Registro de Impedimentos, Revisión del Sprint y Retrospectiva del Sprint, en sus formatos Markdown, Word, Excel y PowerPoint disponibles. Contienen campos o agendas de plantilla; no aportan resultados operativos del equipo. No se encontraron cronogramas PDF en esta carpeta local.
- **Jira consultado directamente en lectura:** [Backlog del proyecto](https://continental-team-yg5bc6tv.atlassian.net/jira/software/projects/ANA/boards/2/backlog), [ANA-9](https://continental-team-yg5bc6tv.atlassian.net/browse/ANA-9), [ANA-6](https://continental-team-yg5bc6tv.atlassian.net/browse/ANA-6) y [ANA-7 e historial](https://continental-team-yg5bc6tv.atlassian.net/browse/ANA-7). Corte: 30 de septiembre de 2026. Se comprobaron alcance actual, SP, estados, asignación y traslado de pedidos; los enlaces requieren acceso al proyecto.
- **Planificación y capturas históricas Jira:** [02 Artefactos Jira V_1_0_0.md, evidencias 3 y 4](https://github.com/MartinezJhef/EcoLogistica-Lima/blob/b062040e442d848023cbd876789c29d6d8e66467/docs/02%20Planificaci%C3%B3n/02%20Artefactos%20Jira%20V_1_0_0.md). Respaldan meta, periodo día/mes, historias, 18 SP y estado histórico. El año 2026 se toma del contexto académico del proyecto.
- **Backlog y DoD:** [01 Transformando a ágil V_1_0_0.md](https://github.com/MartinezJhef/EcoLogistica-Lima/blob/b062040e442d848023cbd876789c29d6d8e66467/docs/02%20Planificaci%C3%B3n/01%20Transformando%20a%20%C3%A1gil%20V_1_0_0.md). Respalda requisitos, siete épicas vigentes, resumen de 13 SP y controles de calidad.
- **Roles y cadencia:** [README del proyecto](https://github.com/MartinezJhef/EcoLogistica-Lima/blob/b062040e442d848023cbd876789c29d6d8e66467/README.md).
- **Participación de interesados:** [05 Registro de interesados](https://github.com/MartinezJhef/EcoLogistica-Lima/blob/b062040e442d848023cbd876789c29d6d8e66467/docs/01%20Inicio/05.%20Registro%20de%20interesados%20V_1_0_0.md), estrategia de comunicación y participación.
- **Riesgos previstos:** [03 Registro de riesgos](https://github.com/MartinezJhef/EcoLogistica-Lima/blob/b062040e442d848023cbd876789c29d6d8e66467/docs/02%20Planificaci%C3%B3n/03%20Registro%20de%20riesgos%20V_1_0_0.md), especialmente RSK-01, RSK-02, RSK-10 y RSK-11.

Los enlaces a GitHub fijan la revisión consultada para preservar la procedencia. Los estados actuales proceden de la consulta directa de Jira y deben revisarse de nuevo al cierre del Sprint.

## Historial de control de cambios

| Versión | Fecha | Responsable documental | Descripción | Estado |
|---|---|---|---|---|
| 1.0.0 | 30 de septiembre de 2026 | Diego Angulo Gonzales | Primera versión para publicación: contraste de plantilla y rúbrica con Jira actual (2 historias, 10 SP, 0/17 subtareas completadas), traslado de ANA-7, análisis de cuatro ejes y plan propuesto. Sustituye el borrador local basado en capturas históricas. | Pendiente de revisión y validación del equipo. |

[← Volver al README principal](../../README.md)
