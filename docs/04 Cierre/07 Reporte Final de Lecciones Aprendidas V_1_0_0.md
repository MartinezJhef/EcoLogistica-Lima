[← Volver al README principal](../../README.md)

# Reporte Final de Lecciones Aprendidas (Final Lessons Learned Report)

**Proyecto:** EcoLogística Lima · **Código:** PFA-ECOLIMA-2026
**Fecha de corte:** 27/11/2026 · **Versión:** 1.0.0
**Periodo actual:** 31/10–27/11/2026 · **Corte anterior:** 30/10/2026

> **Naturaleza de los datos.** Pruebas, commits y despliegues: evidencia técnica real al 26/11/2026. Horas, costos incurridos del escenario, EVM, curvas complementarias y ánimo: **datos simulados**, autorizados para este cierre. No acreditan pagos, opiniones, reuniones ni aprobación de interesados.

**Fecha de consolidación:** 27/11/2026. **Fecha de reunión de cierre:** no se acredita una reunión realizada; se propone usar este documento como agenda y registrar después asistentes/acuerdos reales. Las recomendaciones son una síntesis analítica del repositorio y de los incidentes comprobados.

> **Actualización con Jira real, 27/11/2026.** Las diez historias suman **67 SP**: siete en Listo (52 SP) y tres En curso (15 SP). Hay **40 subtareas abiertas**: 9 heredadas y 31 de Sprint 4. Los cuatro sprints siguen mostrando «Completar sprint». El escenario de 60 SP y el EVM del primer paquete continúan siendo **simulados**, no un reflejo del cierre formal de Jira. [Corte real y pendientes exactos](anexos/Conciliacion%20real%20de%20Jira%2027nov.md).

## 1. Matriz Consolidada de Aprendizajes

| Categoría de gestión | Prácticas efectivas: qué mantener | Oportunidades: qué evitar/ajustar | Recomendación para futuros equipos |
|---|---|---|---|
| Desempeño del equipo | Reparto de áreas y pruebas compartidas. | La concentración de integración aumenta presión; el mood disponible es simulado. | Revisar capacidad por sprint y acordar suplencia por módulo; PM verifica WIP semanal. |
| Evolución y control del alcance | Diez historias trazables a requisitos. | SP y agrupaciones difieren entre Jira y documentos; 58/60 SP. | Versionar estimaciones, distinguir cambio de esfuerzo de cambio funcional y adjuntar exportación de backlog por corte. |
| Cronograma híbrido | Combinar hitos predictivos con entregas funcionales. | El plan de ocho sprints no representa los cuatro incrementos documentados. | Mantener ambos calendarios, justificar variaciones y ligar cada hito a evidencia de aceptación; no reiniciar línea base para ocultar demora. |
| Presupuesto y costos | Priorizar software abierto y servicios gratuitos con gasto autorizado cero. | Presupuesto académico no equivale a desembolso; faltan horas reales. | Registrar horas por rol y gastos respaldados; separar BAC, techo, contingencia, costo económico y caja. |
| Técnicas de estimación | Descomposición por historias y criterios concretos. | No hay velocidad comparable con iteraciones desiguales ni historial suficiente. | Usar rangos y capacidad observada; no convertir SP/commits en horas. Reestimar tras integrar datos, roles y despliegue. |
| Aseguramiento de calidad | Regresiones en base real y tres navegadores; CI/CD antes del despliegue. | Pruebas positivas no cubrían límites de listado, último administrador y estados terminales. | Añadir casos de frontera y permisos a la DoD; ensayar después de 19:00 Lima para detectar UTC al día siguiente. |
| Involucramiento de interesados | Documentar límites y distinguir mediciones de simulaciones. | Piloto y SUS real se pospusieron; no hay aceptación humana demostrada. | Programar cinco participantes desde planificación y obtener consentimiento y respuestas antes del cierre; no reemplazar satisfacción con E2E. |
| Riesgos, incidentes e impedimentos | Registro explícito y respuestas de seguridad, datos e infraestructura. | Dependencia de servicios gratuitos y evidencias históricas sin corte. | Asignar propietario, disparador, acción y prueba de eficacia; revisar riesgos en cada review y al transferir operación. |

## 2. Conclusiones de la Retrospectiva de Cierre

La principal lección es validar **el recorrido completo**, no solo módulos aislados. Un pedido debe persistir, asignarse, llegar al repartidor, terminar su entrega, confirmar regreso y alimentar el mismo cálculo del dashboard/PDF. La aceptación sobre PostgreSQL y en el despliegue detectó problemas que no se observaban en pruebas de funciones individuales.

El incidente del script con UTC mostró que las pruebas también son software: el servidor rechazó correctamente una ruta programada para otra fecha. La corrección fue alinear el reloj del caso de aceptación con Lima, no quitar la regla de negocio.

La gestión financiera debe iniciar con una regla de medición: este cierre puede reproducir un EVM simulado matemáticamente coherente, pero no recuperar horas reales que nunca se registraron. El próximo equipo debe guardar parte de trabajo y fuente del costo desde el primer sprint.

Una versión funcional no demuestra por sí sola satisfacción, ahorro ambiental real ni SLA mensual. Los cinco casos SUS y el mood permiten ejercitar el análisis, con su etiqueta simulada; la validación con personas se planifica anticipadamente y se conserva sin atribuciones inventadas.

### Acciones propuestas para la transferencia

| Acción | Responsable propuesto | Criterio observable |
|---|---|---|
| Registrar aceptación y brechas conocidas antes de declarar cierre administrativo. | Zayuri / PM | Acta real con participantes, fecha, decisiones y responsables. |
| Conservar copia del código, instrucciones y configuración sin secretos. | Jheferson / técnico | Repositorio navegable y recuperación ensayada en ambiente desechable. |
| Organizar prueba con usuarios y factores reales cuando se pase del demo a operación. | Angela / producto | Respuestas reales separadas del dataset simulado; fuentes ambientales identificadas. |
| Verificar enlaces, pruebas y monitorización antes de sustentar. | Maylit / QA | Validador documental y CI aprobados; ventana de monitoreo y sus límites visibles. |
| Comunicar acceso, soporte y pendientes a quienes recibirán el sistema. | Diego / comunicaciones | Guía compartida; credenciales por canal privado; soporte aceptado expresamente. |

No se atribuye la aprobación de estas acciones a una reunión no documentada. Se conservan las [retrospectivas del Sprint 4](../03%20Implementaci%C3%B3n/Sprint%204/02%20Retrospectiva%20del%20Sprint%20V_1_0_0.md) y el [registro de riesgos](../02%20Planificaci%C3%B3n/03%20Registro%20de%20riesgos%20V_1_0_0.md) como antecedentes para la discusión.

---

[← Volver al README principal](../../README.md)
