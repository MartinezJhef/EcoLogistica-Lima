# Revisión del sprint

**Nombre del Proyecto:** EcoLogística Lima.

**Líder del Proyecto:** No se ha confirmado quién firma el acta de este Sprint; este informe técnico no atribuye esa responsabilidad a un integrante.

## Historias de Usuario completadas en este Sprint

Incremento implementado y probado en la [rama de Sprint 4](https://github.com/MartinezJhef/EcoLogistica-Lima/tree/prep/sprint-4), disponible para revisión en el [PR #13](https://github.com/MartinezJhef/EcoLogistica-Lima/pull/13). La [web compartida](https://ecologistica-web.onrender.com) está publicada desde el 19/11/2026. Siguen pendientes la activación del administrador, la aceptación autenticada en ese entorno y la aprobación por pares; no se declara cumplida toda la Definition of Done.

| Historia | Implementación y aceptación técnica comprobada |
|---|---|
| US-008 — Dashboard | Periodos, kilómetros, consumo, energía, CO₂, costo, comparación con periodo anterior y diferencial cero sin histórico; permisos, ausencia de parámetros, actualización cada 15 segundos y conservación de datos históricos |
| US-009 — Reportes | PDF privado generado por trabajador separado, trabajos persistidos y recuperables, notificación de disponibilidad, validación de periodo, mensaje exacto sin datos, reintento y reportes multipágina |
| US-010 — Compensación | Factores y proyectos configurables, créditos y árboles estimados, distribución validada al 100 %, redondeo que conserva totales, recálculo y exportación PDF |

Pruebas locales: 85 del servidor, 217 de la web y 12 recorridos integrales con Playwright Python en tres navegadores. Cobertura: servidor 85,18 %; web 82,77 % de líneas. La integración espacial se comprobó mediante el despliegue local PostgreSQL/PostGIS y migración 007 aplicada dos veces.

## Demostración del trabajo completado

Se ejecutó una demostración automatizada en un entorno local desechable: API FastAPI, PostgreSQL 16/PostGIS, trabajador PDF y React. Los roles administrador y oficina consultaron indicadores, descargaron PDF, calcularon compensación y recibieron errores ante porcentajes inválidos. Cliente y repartidor accedieron a sus pantallas y recibieron HTTP 403 al intentar consultar analítica global.

Las evidencias reproducibles están en `scripts/sprint4_e2e.py`, `src/frontend/e2e/sprint4.spec.ts` y sus reportes HTML generados. No se ha celebrado una sesión de demostración con stakeholders ni se atribuye retroalimentación a integrantes que no participaron.

## Pendientes

- Aprobar la revisión de código e integrar las ramas en main; el incremento hasta Sprint 3 sigue en PR #12.
- Activar la cuenta de administrador y comprobar los flujos autenticados en el hosting ya publicado. Las migraciones están aplicadas. Configurar los secretos del workflow para automatizar publicaciones desde main; la primera publicación se hizo mediante Render.
- Configurar factores, precios y proyectos ambientales reales. Los datos sintéticos son exclusivamente de pruebas.
- Realizar la evaluación SUS, revisión y retrospectiva con participantes; confirmar líder y responsables de las acciones.
- Medir disponibilidad y tiempos en hosting: la medición local no acredita uptime público y una petición Firefox alcanzó 516,56 ms.

V_1_0_0 — 18/11/2026: informe del incremento técnico y evidencia local, sin atribuir cierre académico completo.

19/11/2026: actualización con la publicación gratuita verificada en Render y Neon. Se corrigió además el workflow heredado de Sprint 3 para aplicar la migración 007 antes de ejecutar la regresión integrada; su ejecución anterior fallaba por ausencia de `sustainability_snapshots` en la base desechable.

[← Volver al README principal](../../../README.md)
