[← Volver al README principal](../../README.md)

# Reporte de Estado del Proyecto (Status Report)

**Proyecto:** EcoLogística Lima · **Código:** PFA-ECOLIMA-2026
**Fecha de corte:** 27/11/2026 · **Versión:** 1.0.0
**Periodo actual:** 31/10–27/11/2026 · **Corte anterior:** 30/10/2026

> **Naturaleza de los datos.** Pruebas, commits y despliegues: evidencia técnica real, actualizada al 27/11/2026. Horas, costos incurridos del escenario, EVM, curvas complementarias y ánimo: **datos simulados**, autorizados para este cierre. No acreditan pagos, opiniones, reuniones ni aprobación de interesados.

> **Cierre real de Jira, 27/11/2026.** Sprints **1–4 cerrados**, diez historias (**67 SP**), **99/99 subtareas** y siete épicas en Listo. Corte de calidad posterior: **122/123 actividades Listo**; ANA-26 continúa En curso para completar la revisión manual WCAG. Rendimiento y capacidad tienen mediciones controladas; monitoreo y recuperación están implementados. La disponibilidad mensual no está acreditada. Horas, costos, EVM, mood y SUS conservan su naturaleza simulada. [Estado final](anexos/Estado%20final%20del%20cierre%20Jira.md) · [Resultados de calidad](anexos/Validaciones%20de%20calidad%20y%20continuidad%2027nov.md).

## 1. Información de Alcance

**Logros:** diez historias funcionales implementadas, integración web/API/móvil, rutas y entrega, analítica, PDF persistente y propuesta ambiental. Validación final: 229 pruebas web; 105 pruebas backend locales y tres pruebas adicionales de capacidad sobre PostGIS, además de la integración validada en CI; aceptación de cuatro roles en tres navegadores; Android compilado y despliegue aprobado. [CI y despliegue del último cambio funcional](evidencias/validacion-tecnica-calidad-27nov.json).

**Cambios:** cuatro incrementos documentados frente a ocho sprints iniciales; Flutter sustituye la propuesta React Native. US-004 pasa de 3 a 5 SP por conciliación entre backlog e informe del Sprint 2: 58 → 60 SP, sin nueva funcionalidad. **Calidad:** se corrigieron truncamiento a 12 registros, bloqueo del último administrador, edición de pedidos cerrados y fecha UTC/Lima en aceptación.

## 2. Información de Cronograma

**No completado:** aceptación humana, mood real y validaciones no funcionales pendientes fuera de los sprints. El video queda fuera de este encargo; sigue siendo requisito externo de la consigna. La meta original fue 05/11; estabilización técnica 26/11 (**+21 días**) y corte documental 27/11 (**+22 días**). La integración tardía, configuración del hosting y evidencia insuficiente afectaron la secuencia integración → aceptación → entrega. **Respuesta:** conservar la línea base, registrar desviación, adjuntar CI y ejecutar demo ensayada; PM coordina aceptación, QA conserva evidencias.

## 3. Información de Costos

**Escenario simulado:** AC del periodo S/ 2108.44; acumulado S/ 8036.25; BAC S/ 11467.50; CV favorable S/ 3431.25. Se modelan 1220 h frente a 1200 h (+20 h), compensadas por uso de herramientas gratuitas y reserva sin consumo simulado. No hay libro de gastos reales completo; autorización de nuevos cargos: S/ 0.00. **Control:** no contratar recursos pagos; separar valorización de horas y desembolsos.

## 4. Proyección (Look Ahead)

Entregar los siete reportes y anexos, verificar enlaces y ensayar 10 min de gestión + 10 min de demo. En el escenario EVM, ETC técnico = S/ 0.00; las actividades de aceptación futuras quedan fuera de ese cierre modelado y se estimarán antes de contratar recursos. No hay autorización de gasto adicional.

## 5. Riesgos, Incidentes y Comentarios

Riesgos abiertos: suspensión/latencia del hosting gratuito, factores ambientales simulados, falta de participantes reales y la revisión manual de accesibilidad pendiente en Jira. El monitoreo de dos horas obtuvo 239/240 respuestas disponibles (99.58% de muestras), sin demostrar SLA mensual. El objetivo universal <500 ms y SUS real permanecen sin acreditar. Cierre documental preparado; aceptación administrativa pendiente de constancia del equipo. [Detalle EVM](03%20Reporte%20de%20An%C3%A1lisis%20de%20Valor%20Ganado%20-%20EVM%20V_1_0_0.md) y [reporte final](06%20Reporte%20Final%20del%20Proyecto%20V_1_0_0.md).

---

[← Volver al README principal](../../README.md)
