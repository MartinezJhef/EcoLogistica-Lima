[← Volver al README principal](../../../README.md)

# Revisión de la rúbrica final

> **Evidencia adicional del 28/11/2026.** [Resultados actuales de sesión, navegación, interfaz nativa de accesibilidad y disponibilidad](Cierre%20de%20validaciones%2028nov.md). 236 pruebas unitarias web, 54 casos de accesibilidad/sesión, 16 árboles nativos y tres verificaciones móviles adicionales aprobados. Jira ANA-26 sigue En curso; no se acredita conformidad integral WCAG ni SLA mensual. [CI y despliegue verificados](../evidencias/validacion-cierre-28nov.json).


**Fuente:** consigna final proporcionada por el usuario, secciones 2–4 y plantillas de la sección 5. **Corte:** 28/11/2026. Esta revisión distingue archivos entregados, mediciones verificadas y hechos que todavía no están acreditados. No asigna una nota en nombre del docente.

## Criterios y evidencia

| Criterio de la rúbrica | Peso / máximo | Verificación de la entrega | Condición para acreditar el nivel máximo |
|---|---|---|---|
| Reportes narrativos y EVM: 01, 02 y 03 | 1 / 3 puntos | Estructuras completas; comparación de periodo, acumulado y corte anterior; PV, EV, AC, SV, CV, SPI, CPI, porcentajes y tres EAC comprobados con el validador. Sin marcadores pendientes. | Horas, AC y EVM proceden de un escenario simulado autorizado. La consigna pide datos reales; hace falta que el docente acepte ese escenario o sustituirlo por registros reales de horas y gastos. La exactitud matemática no cambia la procedencia. |
| Reportes visuales y cierre: 04, 05, 06 y 07 | 1 / 3 puntos | RAG, tendencias, burbujas CSI, barras, burnup, burndown, Kanban, flujo, mood y retrospectiva incluidos; interpretación, desempeño híbrido y acciones por categoría. Jira tiene capturas reales y cortes históricos conservados. | Mood y satisfacción son simulados; la retrospectiva gráfica es una reconstrucción identificada. No equivalen a opiniones recogidas o a captura de una reunión. La aceptación de esas fuentes corresponde al docente; una reunión o aprobación no documentada no se declara realizada. |
| Trazabilidad y versionamiento | 1 / 3 puntos | Siete nombres exactos en `docs/04 Cierre`; enlaces directos desde README y retornos funcionales; versiones anteriores preservadas y conciliadas; validador de enlaces aprobado. | Evidencia documental entregada y comprobable en el repositorio. |
| Demostración funcional y arquitectura | 4 / 12 puntos | Web/API/móvil separados; exclusión de dependencias, archivos privados y temporales; despliegue y pruebas de integración aprobados; manuales y guía de demostración de diez minutos disponibles. | Las pruebas y el guion no acreditan que la sustentación en vivo ya se realizó durante los diez minutos asignados. Debe ejecutarse en la evaluación. Persisten los límites técnicos descritos abajo. |
| Video MP4 | 4 / 12 puntos | Excluido por instrucción expresa del usuario; no se produjo ni se presenta como entregado. | La exclusión del encargo no elimina este criterio de la rúbrica docente. Sin una exención del docente, no corresponde acreditarlo. |

## Comprobaciones técnicas actuales

- 236 pruebas unitarias web aprobadas y 54 casos de accesibilidad/sesión en Chromium, Firefox y WebKit sin violaciones detectadas en el alcance probado.
- 105 pruebas backend locales aprobadas; las integraciones omitidas bajo SQLite se distinguen de las ejecuciones sobre PostGIS. Las tres nuevas pruebas de capacidad y la integración funcional de CI se ejecutaron sobre base real desechable.
- 150 pedidos/15 vehículos: optimización 2,099 s y reoptimización 0,049 s; 1.000 pedidos/50 vehículos: integridad comprobada. Son cargas sintéticas contra el motor y PostGIS reales con adaptador vial controlado; no se extrapolan al proveedor OSRM público o a concurrencia del alojamiento gratuito.
- Monitoreo horario implementado y primera ejecución conservada, incluido el timeout de API. La comprobación posterior al despliegue obtuvo web/API HTTP 200. No acredita disponibilidad mensual ni un objetivo universal de respuesta inferior a 500 ms.
- Recuperación de una exportación pendiente y PDF tras reinicio local medidos en 2,387 s; no se afirma failover de producción.
- Sprints 1–4 cerrados, diez historias/67 SP, 99 subtareas y siete épicas terminadas. Jira registra 122/123 actividades Listo; ANA-26 está En curso: las pruebas, la inspección nativa y los recorridos revisados no acreditan todos los criterios de conformidad integral WCAG 2.1 AA.

[Resultados técnicos y límites](Validaciones%20de%20calidad%20y%20continuidad%2027nov.md) · [Estado de Jira](Estado%20final%20del%20cierre%20Jira.md) · [CI y despliegue verificados](../evidencias/validacion-cierre-28nov.json).

## Qué impide afirmar «100 % de la rúbrica»

1. **Video:** el usuario lo prepara por separado y lo excluyó de este encargo. No se verificó ni se declara entregado desde este paquete. Su evaluación corresponde al docente.
2. **Procedencia real:** las simulaciones de horas, costos, ánimo y encuestas no cumplen por sí mismas una exigencia de datos reales. Se necesita aceptación docente de su uso o los registros reales correspondientes. Las encuestas humanas no pueden reconstruirse a partir de pruebas del agente.
3. **Ejecución en vivo:** el cumplimiento del tiempo y la fluidez se verifica durante la sustentación, no mediante un documento que afirme que ya ocurrió.
4. **Aceptación técnica completa:** faltan la revisión manual integral de accesibilidad y la observación mensual de disponibilidad. La evidencia interna de capacidad no garantiza tiempos de producción con terceros.

La documentación exigida está preparada y sus cálculos y enlaces están verificados. Se mantienen visibles las condiciones anteriores para que el equipo no presente una afirmación de cumplimiento o una aceptación inexistentes. La consigna no exige un archivo adicional de firmas: no se añade esa formalidad como requisito inventado.

[← Volver al README principal](../../../README.md)
