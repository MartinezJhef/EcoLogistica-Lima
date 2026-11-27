[← Volver al README principal](../../README.md)

# Transformando a ágil - backlog consolidado V_1_1_0

**Proyecto:** EcoLogística Lima · **Fecha:** 27/11/2026. Se conserva el [backlog original V_1_0_0](01%20Transformando%20a%20%C3%A1gil%20V_1_0_0.md), sus criterios de aceptación y su prioridad. Esta versión concilia el estado técnico al cierre; no modifica Jira ni certifica sus sprints cerrados.

## 1. Historias y estimación reconciliada

| Historia | Funcionalidad | SP consolidados | Incremento documental | Estado del cierre |
|---|---|---:|---|---|
| US-001 | Vehículos | 5 | Sprint 1 | Implementación y verificación técnica; aceptación administrativa no inferida |
| US-002 | Conductores | 3 | Sprint 1 | Implementación y verificación técnica; aceptación administrativa no inferida |
| US-003 | Pedidos | 5 | Sprint 2 | Implementación y verificación técnica; aceptación administrativa no inferida |
| US-004 | Preferencias | 5 | Sprint 2 | Implementación y verificación técnica; aceptación administrativa no inferida |
| US-005 | Optimización | 13 | Sprint 3 | Implementación y verificación técnica; aceptación administrativa no inferida |
| US-006 | Mapa | 8 | Sprint 3 | Implementación y verificación técnica; aceptación administrativa no inferida |
| US-007 | Reoptimización | 8 | Sprint 3 | Implementación y verificación técnica; aceptación administrativa no inferida |
| US-008 | Indicadores | 5 | Sprint 4 | Implementación y verificación técnica; aceptación administrativa no inferida |
| US-009 | PDF | 3 | Sprint 4 | Implementación y verificación técnica; aceptación administrativa no inferida |
| US-010 | Compensación | 5 | Sprint 4 | Implementación y verificación técnica; aceptación administrativa no inferida |
| Total | Diez historias | 60 | Cuatro incrementos | Ver límites de aceptación humana y no funcionales |

## 2. Conciliación de estimaciones

El backlog inicial suma **58 SP**, con US-004 = 3. El informe de Sprint 2 V_1_3_0 contiene US-004 = 5, aunque también muestra sumas y referencias a US-003 inconsistentes. El cierre usa US-003 = 5 y US-004 = 5 de su tabla y del incremento 10 SP; no adopta la frase que asigna 8 SP a US-003 y total 21 porque no coincide con esas filas.

Cambio EST-01: US-004 3 → 5 SP, diferencia +2, por mayor esfuerzo de preferencias, validaciones e integración reconocido en el informe posterior. No añade requisitos de negocio. Es conciliación documental retrospectiva, sin atribuir una aprobación histórica ni alterar una estimación actual de Jira no consultada.

Distribución reconciliada: Sprint 1 = 8; Sprint 2 = 10; Sprint 3 = 29; Sprint 4 = 13. Las capturas históricas de Jira presentan otra agrupación y puntos; se conservan como fuentes separadas, no se fuerzan a coincidir. No se usa velocidad promedio como compromiso porque no hay capacidad/duración homogénea acreditada.

## 3. Definition of Done y límites

Una historia se verifica técnicamente con código integrado, casos positivos/negativos, permisos, persistencia y recorrido del sistema. Los workflows al 26/11 aprobaron backend, web, móvil, navegadores y despliegue. Los requisitos de participantes reales, rendimiento universal, piloto ambiental y aceptación de interesados siguen diferenciados; no se declara DoD completa solo por tener pruebas verdes.

## Historial de cambios

| Versión | Fecha | Cambio y fundamento |
|---|---|---|
| 1.0.0 | Fecha del artefacto original | Línea base conservada sin reescritura. |
| 1.1.0 | 27/11/2026 | Conciliación de cierre con evidencia técnica y escenario de gestión simulado autorizado. No es aprobación retroactiva ni re-baseline que elimine desviaciones. |


[← Volver al README principal](../../README.md)
