[← Volver al README principal](../../README.md)

# Reporte Final del Proyecto (Final Project Report)

**Proyecto:** EcoLogística Lima · **Código:** PFA-ECOLIMA-2026
**Fecha de corte:** 27/11/2026 · **Versión:** 1.0.0
**Periodo actual:** 31/10–27/11/2026 · **Corte anterior:** 30/10/2026

> **Naturaleza de los datos.** Pruebas, commits y despliegues: evidencia técnica real, actualizada al 27/11/2026. Horas, costos incurridos del escenario, EVM, curvas complementarias y ánimo: **datos simulados**, autorizados para este cierre. No acreditan pagos, opiniones, reuniones ni aprobación de interesados.

**Estado del cierre:** entrega técnica y documental preparada; aceptación administrativa por registrar. **Fecha de cierre documental:** 27/11/2026. No es una firma de aprobación del patrocinador.

> **Cierre real de Jira, 27/11/2026.** Sprints **1–4 cerrados**, diez historias (**67 SP**), **99/99 subtareas** y siete épicas en Listo. Corte de calidad posterior: **122/123 actividades Listo**; ANA-26 continúa En curso para completar la revisión manual WCAG. Rendimiento y capacidad tienen mediciones controladas; monitoreo y recuperación están implementados. La disponibilidad mensual no está acreditada. Horas, costos, EVM, mood y SUS conservan su naturaleza simulada. [Estado final](anexos/Estado%20final%20del%20cierre%20Jira.md) · [Resultados de calidad](anexos/Validaciones%20de%20calidad%20y%20continuidad%2027nov.md).

## 1. Descripción General del Proyecto

EcoLogística Lima aborda planificación de última milla y trazabilidad de impacto ambiental estimado para operadores y comercios. Integra web React/TypeScript, app Flutter, API FastAPI, PostgreSQL 16/PostGIS, rutas viales OSRM, estados de entrega y reportes PDF. Roles: administrador, oficina, repartidor y cliente. El alcance se alinea al [acta consolidada V_1_1_0](../01%20Inicio/02.%20Acta%20de%20constituci%C3%B3n%20V_1_1_0.md), conservando el acta original como referencia de metas.

Producto publicado: [web](https://ecologistica-web.onrender.com) y [API/OpenAPI](https://ecologistica-api.onrender.com/docs). Última revisión técnica de referencia: `be3e3ac99db6714978326dbc3a52126861419dfd`, 26/11/2026; esta entrega de cierre añade documentación sin cambiar reglas de negocio.

## 2. Resumen de Desempeño

### 2.1 Alcance (Predictivo y Adaptativo)

**Predictivo:** acta, requisitos, reglas, arquitectura, presupuesto y riesgos establecieron límites. Se conserva fecha 05/11 y techo S/ 12850.00 para medir desviación. La nueva versión concilia lo implementado, sin atribuir una replanificación aprobada inexistente.

**Adaptativo:** diez historias: flota y conductores (US-001/002); pedidos y preferencias (US-003/004); optimización/mapa/reoptimización (US-005/006/007); indicadores/PDF/compensación (US-008/009/010). El escenario documental previo suma 60 SP frente a 58 iniciales; el corte real actual de Jira suma 67 SP, según la conciliación adjunta. La cobertura técnica verificada no acredita por sí sola todos los criterios no funcionales, pendientes de Jira o de aceptación humana.

Objetivo: módulos core operativos. Evidencia: pruebas por roles y recorrido cliente → asignación → entrega → regreso → analítica/PDF. Variaciones: Flutter frente al diseño inicial React Native; cola persistida/polling frente a propuestas de notificaciones externas; cuatro incrementos frente a ocho sprints previstos. [Stack consolidado](../01%20Inicio/10.%20Stack%20tecnol%C3%B3gico%20V_1_1_0.md).

### 2.2 Calidad

| Criterio / evidencia | Resultado al corte | Conclusión |
|---|---|---|
| Pruebas web | 226 aprobadas; construcción y precompresión correctas. | Verificación técnica aprobada. |
| Backend y base geoespacial | 102 pruebas locales + 1 integración PostgreSQL/PostGIS aprobadas. | La prueba PostgreSQL ejecuta planificación y replanificación sobre base real desechable. |
| Aceptación automatizada | Cuatro roles × tres navegadores; pruebas completas y workflows aprobados. | No representa una encuesta ni aprobación humana. |
| Android | Análisis, pruebas y compilación APK del workflow aprobados. | No acredita un piloto de campo en dispositivos de repartidores reales. |
| Sitio publicado | 20 comprobaciones del 26/11 aprobadas: acceso, consultas, fechas inválidas y protección del PDF. | Se consultaron datos existentes sin crear registros en esta revisión. |
| SUS | Cinco casos simulados: media 77.5; n humano real = 0. | Meta original SUS ≥85 y muestra humana no acreditadas. |
| Rendimiento | Resumen: mediana 458.45 ms, máximo 500.91; login por encima de 500 ms. | No se declara cumplimiento universal de 350/500 ms. |
| Disponibilidad | Dos horas, 239/240 muestras disponibles, 99.58%. | No equivale a SLA mensual ni asegura continuidad del plan gratuito. |
| Impacto ambiental | CO₂ y costos estimados según factores configurados y conservados por operación. | Factores simulados; no hay demostración física de -22%/25% ni neutralidad de carbono. |

**Exenciones:** no consta aprobación formal de waivers. Se identifican brechas sin eliminarlas de la línea base. El video se excluye por instrucción del usuario en este encargo y permanece como requisito de evaluación externo.

Fuentes de las métricas: [registro de validación técnica](evidencias/validacion-tecnica.json), [análisis Playwright y latencia](../03%20Implementaci%C3%B3n/Sprint%204/03%20Analisis%20PlayWrigth%20V_1_0_0.md), [monitoreo real original](../03%20Implementaci%C3%B3n/Sprint%204/evidencias/monitoreo-real-2h.json) y [anexo SUS simulado](../03%20Implementaci%C3%B3n/Sprint%204/08%20Anexo%20SUS%20simulado%20V_1_0_0.md).

### 2.3 Cronograma

| Hito / entrega | Enfoque | Fecha planificada original | Fecha / evidencia real | Variación / impacto |
|---|---|---|---|---|
| H-01 Requerimientos | Predictivo | 23/07/2026 | Documentos de Inicio fechados 28/08; no hay acta de finalización de H-01. | No calculable con precisión; fecha de documento no prueba término del hito. |
| H-02 Arquitectura/BD/mockups | Predictivo | 13/08/2026 | Artefactos de Planificación 04/09; actualizaciones técnicas posteriores. | No se inventa fecha de aceptación; incongruencia documental preservada. |
| H-03 Desarrollo inicial | Adaptativo | 17/09/2026 | Integración técnica Sprints 1–3 registrada 18/11, commit d39d2e8. | Evidencia tardía de integración; no se usa como fecha individual de cada historia. |
| H-04 Integración mapas/dashboard/PDF | Adaptativo | 15/10/2026 | PR #12/#13 integrados 19/11; correcciones 20–26/11. | +35 días hasta integración del 19/11; estabilización posterior. |
| H-05 Pruebas y presentación | Híbrido | 05/11/2026 | Estabilización técnica 26/11; documentos 27/11; sustentación aún no acreditada. | +21/+22 días calendario; no se afirma que la exposición ya ocurrió. |

No se transforman los cortes simulados del EVM en fechas reales de aceptación. El SPI final de 1.0000 no cancela los retrasos del calendario original.

### 2.4 Costo

Presupuesto modelado de planificación: S/ 11467.50, techo del acta S/ 12850.00. Costo final real integral: **no determinable sin horas/comprobantes**. Costo final **simulado**: S/ 8036.25; CV S/ 3431.25; CPI 1.4270; 1220 h modeladas frente a 1200 h previstas. La mayor valorización de mano de obra se compensa en el escenario con servicios gratuitos y contingencia sin consumo. Render/Neon se autorizaron con límite S/ 0; no se contrataron recursos pagos en este trabajo. [EVM reproducible](03%20Reporte%20de%20An%C3%A1lisis%20de%20Valor%20Ganado%20-%20EVM%20V_1_0_0.md).

## 3. Resumen de Riesgos, Incidentes e Impedimentos

| ID / descripción | Tipo | Impacto real observado | Respuesta aplicada / pendiente |
|---|---|---|---|
| RSK-01 / APIs y hosting gratuitos | Riesgo materializado parcialmente | Latencia y una muestra HTTP no disponible durante monitoreo. | Mediciones, manejo de errores y conservación del último resultado; monitoreo continuo por ampliar. |
| RSK-02 / retraso | Riesgo materializado | Correcciones y despliegue posteriores al 05/11. | Priorización de integración y regresión; conservar desviación y preparar demo reproducible. |
| RSK-03 / factores ambientales | Riesgo abierto | Parámetros actuales identificados como simulados. | Fuente y vigencia visibles, instantáneas históricas; validar factores reales antes de operar. |
| RSK-04 / participantes | Impedimento de aceptación | Sin respuestas SUS humanas ni mood real. | Datos simulados autorizados y rotulados; piloto real pendiente. |
| RSK-06 / acceso y datos | Riesgo mitigado en flujos probados | Sesión vencida y permisos podían confundir al usuario; acceso a reportes requiere rol. | Recuperación de sesión, autorización de servidor, PDF privado; no se declara certificación legal. |
| RSK-07/11 / coherencia y trazabilidad | Incidente documental | Stack inicial distinto al real; SP discrepantes y capturas antiguas de Jira. | Versiones V_1_1_0 y matriz de fuentes; corte Jira final: cuatro sprints cerrados y 99 subtareas terminadas; corte de calidad posterior: 122 Listo y ANA-26 En curso. |
| INC-26-01 / listados | Defecto corregido | Solo primeros 12 vehículos/conductores visibles. | Recuperación de páginas y orden estable; regresión automatizada. |
| INC-26-02 / último administrador | Defecto corregido | Posible pérdida de capacidad de administración. | Rechazo de eliminación/bloqueo/cambio de rol del último administrador activo. |
| INC-26-03 / pedidos cerrados | Defecto corregido | Preferencias y formulario podían conservar estado editable incorrecto. | Bloqueo de cerrados en API/interfaz y actualización del estado al recargar. |
| INC-26-04 / UTC-Lima en smoke test | Defecto de prueba corregido | CI programaba mañana usando UTC y rechazaba iniciar la ruta. | Fecha Lima en script; recorrido desechable y workflow repetidos con éxito. |

## 4. Evaluación del Éxito y Cierre

**Satisfacción de interesados:** no hay medición real de aceptación. SUS simulado 77.5 y feedback simulado no se convierten en aprobación. El equipo debe registrar una sesión real y las observaciones recibidas.

**Satisfacción y reconocimiento del equipo:** mood simulado final 4.2/5 (no opiniones reales). Se reconoce la contribución de los cinco roles documentados a planificación, implementación, calidad y comunicación, sin atribuir horas reales no registradas. La discusión de carga y reconocimiento se propone para la reunión de cierre.

**Transición operativa:** producto y configuración desplegados; guía de uso, instalación y recuperación disponibles. Responsabilidades propuestas: Jheferson, soporte técnico; Angela, experiencia/usuarios; Maylit, QA; Zayuri, aceptación y documentación; Diego, comunicaciones/seguimiento. La disponibilidad de soporte 30 días es una **propuesta**, no un compromiso confirmado.

**Cierre administrativo:** conservar versiones y evidencias; catalogar código; verificar accesos y respaldos; registrar aceptación, responsables y transferencia privada de credenciales; revisar recursos gratuitos; inventariar contratos y pagos si existieran. No hay acta firmada ni facturas finales aportadas; no se declara cierre contractual consumado.

**Conclusión:** producto técnicamente entregable en los flujos verificados, con documentación de cierre preparada. La aprobación de la entrega y el éxito global frente a metas originales requieren que los interesados conozcan y acepten las brechas registradas. [Guía de sustentación y transición](anexos/Guia%20de%20sustentacion%20y%20transicion.md).

---

[← Volver al README principal](../../README.md)
