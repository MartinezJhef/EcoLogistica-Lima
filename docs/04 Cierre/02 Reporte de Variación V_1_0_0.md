[← Volver al README principal](../../README.md)

# Reporte de Variación (Variance Report)

> **Modalidad de encuestas confirmada, 28/11/2026.** El usuario informa que el ingeniero permite encuestas simuladas. Se entregan cinco casos SUS como **resultados simulados**, media 77,5; este apartado no queda pendiente por falta de participantes reales. No cambia la meta original SUS ≥85 ni acredita aceptación humana. La autorización se limita a encuestas.

**Proyecto:** EcoLogística Lima · **Código:** PFA-ECOLIMA-2026
**Fecha de corte:** 27/11/2026 · **Versión:** 1.0.0
**Periodo actual:** 31/10–27/11/2026 · **Corte anterior:** 30/10/2026

> **Naturaleza de los datos.** Pruebas, commits y despliegues: evidencia técnica real, actualizada al 27/11/2026. Horas, costos incurridos del escenario, EVM, curvas complementarias y ánimo: **datos simulados**, autorizados para este cierre. No acreditan pagos, opiniones, reuniones ni aprobación de interesados.

> **Actualización de cierre, 28/11/2026.** Sprints 1–4 cerrados: diez historias, 67 SP y 99 subtareas terminadas. Jira conserva 122/123 actividades Listo y ANA-26 En curso: la revisión integral WCAG no está acreditada. Se verificaron 236 pruebas unitarias web, 54 casos de accesibilidad/sesión en tres navegadores, 16 árboles nativos de accesibilidad y tres comprobaciones del diálogo móvil con texto ampliado. CI y despliegue aprobados para `e31c545`. Disponibilidad mensual y respuestas siempre menores de 500 ms no acreditadas. Horas, costos, EVM, mood y SUS mantienen su identificación simulada; n humano SUS = 0. [Evidencia actual y límites](anexos/Cierre%20de%20validaciones%2028nov.md). El video queda fuera de este encargo.

## 1. Variación de Cronograma

| Métrica / Aspecto | Detalle |
|---|---|
| Resultados Planificados | H-05 final: 05/11/2026; horizonte de 16 semanas y ocho sprints iniciales. |
| Resultados Reales | Última corrección técnica: 26/11; paquete documental: 27/11; cuatro incrementos registrados. Aceptación del patrocinador no acreditada. |
| Variación Obtenida | +21 días calendario técnicos y +22 días hasta corte documental. La duración de sprints no se infiere del número de commits. |
| Causa Raíz | Se integraron tarde flujos entre roles, servicios publicados y evidencias; también hubo correcciones de sesión, permisos y fechas operativas. |
| Respuesta Planificada | PM mantiene la línea base original; QA exige recorrido completo por incremento; líder técnico conserva regresión UTC/Lima y automatización de despliegue. |

La cadena de dependencia que realmente bloqueó la entrega fue configuración de datos y acceso → integración → despliegue → aceptación y evidencias. Es una secuencia crítica observada; no se presenta como una ruta CPM calculada sin red ni duraciones aprobadas. SPI monetario final = 1 porque PV y EV llegan al BAC; **no elimina los 21/22 días de demora**.

## 2. Variación de Costo

| Métrica / Aspecto | Detalle |
|---|---|
| Resultados Planificados | BAC académico S/ 11467.50; tope del acta S/ 12850.00. RR.HH. S/ 7875.00; herramientas S/ 375.00; cloud S/ 2175.00; contingencia S/ 1042.50. |
| Resultados Reales | AC del escenario simulado S/ 8036.25. No es costo final real certificado ni gasto pagado. Servicios desplegados autorizados solamente en planes gratuitos. |
| Variación Obtenida | CV = EV − AC = S/ 3431.25; RR.HH. modelados +S/ 161.25 (+2.05%); horas +20 (+1.67%). |
| Causa Raíz | Más esfuerzo modelado de integración y QA; ausencia de compras modeladas de cloud/licencias y contingencia. |
| Respuesta Planificada | Registrar horas y comprobantes reales para sustituir el escenario. PM valida variaciones y gasto; no usar commits como horas trabajadas. |

Conciliación del escenario: ahorro de herramientas/cloud S/ 2550.00 + reserva sin consumo S/ 1042.50 − mayor valorización de RR.HH. S/ 161.25 = **S/ 3431.25**. No se atribuye ese ahorro a una eficiencia real demostrada.

## 3. Variación de Calidad

| Resultados planificados | Resultados comprobados | Variación / causa raíz | Respuesta y responsable |
|---|---|---|---|
| Flujos integrados sin fallos en la aceptación definida | 226 web + 102 backend + 1 PostGIS; recorridos completos por roles/navegadores; Android y CI aprobados. | Defectos de límite de listado, cierre de pedido, administración y calendario detectados y corregidos. | QA conserva pruebas de regresión; líder técnico exige CI verde antes de desplegar. |
| Cobertura ≥80% | Workflows ejecutan umbral ≥80%; resultados aprobados. No se confunde tasa de éxito de pruebas con cobertura. | Cumplimiento de umbral del workflow; no se inventa porcentaje exacto distinto. | Mantener gate de cobertura. |
| SUS ≥85 con participantes reales en acta | n humano = 0; cinco perfiles simulados, promedio 77.5. | Resultado real no evaluable; simulación 7.5 puntos bajo meta, sin equivalencia a aceptación. | Entregar los cinco casos simulados autorizados; la muestra real es opcional. La meta original ≥85 sigue sin alcanzarse con 77,5. |
| Todas las respuestas <500 ms | Mediana de resumen 458.45 ms; 9/10 <500, máximo 500.91 ms; login supera meta. | Meta universal no acreditada; red, autenticación y plan gratuito influyen. | Perfilar y medir por endpoint en frío/caliente antes de contratar capacidad. |
| Disponibilidad ≥99.5% | 239/240 muestras en dos horas: 99.58%. | Cumplimiento muestral, no certificación mensual ni operación continua. | Soporte amplía monitoreo y registra interrupciones. |
| Reducción ambiental -22% / hasta 25% | Hay cálculo de CO₂ estimado y pruebas con parámetros simulados. | No existe piloto causal ni línea base de emisiones físicas verificadas. | PO valida factores y diseña comparación de rutas reales. |

### Control de cambios

La consolidación no rebaja metas ni declara exenciones aceptadas. Se conservan las versiones originales y se crean acta, presupuesto, backlog y stack V_1_1_0, con fuentes, cambios y limitaciones. El retiro del video aplica al trabajo solicitado, no cambia la rúbrica del curso.

---

[← Volver al README principal](../../README.md)
