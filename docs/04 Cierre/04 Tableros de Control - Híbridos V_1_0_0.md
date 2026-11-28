[← Volver al README principal](../../README.md)

# Tableros de Control Híbridos (Hybrid Dashboards)

**Proyecto:** EcoLogística Lima · **Código:** PFA-ECOLIMA-2026
**Fecha de corte:** 27/11/2026 · **Versión:** 1.0.0
**Periodo actual:** 31/10–27/11/2026 · **Corte anterior:** 30/10/2026

> **Naturaleza de los datos.** Pruebas, commits y despliegues: evidencia técnica real, actualizada al 27/11/2026. Horas, costos incurridos del escenario, EVM, curvas complementarias y ánimo: **datos simulados**, autorizados para este cierre. No acreditan pagos, opiniones, reuniones ni aprobación de interesados.

**Frecuencia:** actualización técnica en cada integración/despliegue; revisión de gestión al cierre de cada sprint; corte consolidado 27/11/2026. No es un tablero en tiempo real.

> **Cierre real de Jira, 27/11/2026.** Sprints **1–4 cerrados**, diez historias (**67 SP**), **99/99 subtareas** y siete épicas en Listo. Corte de calidad posterior: **122/123 actividades Listo**; ANA-26 continúa En curso para completar la revisión manual WCAG. Rendimiento y capacidad tienen mediciones controladas; monitoreo y recuperación están implementados. La disponibilidad mensual no está acreditada. Horas, costos, EVM, mood y SUS conservan su naturaleza simulada. [Estado final](anexos/Estado%20final%20del%20cierre%20Jira.md) · [Resultados de calidad](anexos/Validaciones%20de%20calidad%20y%20continuidad%2027nov.md).

## 1. Justificación de Métricas (Principio Less is More)

PM y docente necesitan saber qué se entrega, cuánto se desvía y qué falta para aceptar. Desarrollo y QA necesitan defectos, flujo de revisión y resultados reproducibles. Se muestran cuatro familias: alcance/entrega, calendario/costo, calidad operativa y aceptación. No se incorporan métricas de vanidad ni se deduce productividad de commits.

Colores con redundancia textual: VERDE = evidencia técnica aprobada; ÁMBAR = condición/estimación; ROJO = evidencia real requerida ausente. Las tablas conservan valores, unidades y fuentes aunque la imagen se vea en escala de grises. Las figuras son PNG legibles y SVG vectoriales, sin depender de hover ni conexión.

## 2. Tabla Semáforo (RAG Chart) por Componente

| Componente / Entregable | Enfoque | Estado | Observación / Umbral |
|---|---|---|---|
| Requisitos, arquitectura y presupuesto | Predictivo | ÁMBAR | Versiones conciliadas; horas y ejecución financiera simuladas. |
| US-001–US-010 e integración | Adaptativo | VERDE técnico | Historias con implementación y recorridos automatizados; no equivale a aceptación de stakeholders. |
| Web, API, móvil y despliegue | Adaptativo | VERDE | 229 web, 105 backend locales y capacidad/PostGIS en CI, E2E multirrol y Android; workflows aprobados al 27/11. |
| Cronograma macro | Predictivo | ROJO | 21 días hasta estabilización técnica; 22 hasta corte documental frente al 05/11. |
| Costo / EVM | Predictivo | ÁMBAR | CPI 1.4270 del escenario; registro económico real no disponible. |
| SUS y aceptación humana | Híbrido | ROJO | n real = 0; cinco casos simulados, SUS 77.5. |
| Disponibilidad / latencia | Híbrido | ÁMBAR | 99.58% de 240 muestras en dos horas; máximo del resumen 500.91 ms; no SLA mensual. |
| Documentos y transición | Predictivo | ÁMBAR | Paquete y guía preparados; aceptación administrativa y capacitación por registrar. |

## 3. Gráficos de Desempeño Predictivo y Ágil

### 3.1 Tendencias de Variación y Valor Ganado (Líneas)

![Tendencia EVM](evidencias/evm-tendencia.png)

Interpretación: el EV simulado queda bajo PV hasta P3 y converge al cierre. La distancia EV–AC representa CV favorable del escenario; el retraso calendario se conserva aparte. Datos: [EVM CSV](evidencias/evm-simulado.csv).

### 3.2 Flujo Acumulado / Áreas Apiladas: evidencia final real

![Flujo acumulado de cierre](evidencias/jira-flujo-acumulado-cierre-final-27nov.jpg)

Filtro visible: 01/09/2026–27/11/2026. Unidad: recuento de actividades, no Story Points. El aumento final de Listo corresponde a la regularización de estados realizada el 27/11 y no permite reconstruir fechas históricas de desarrollo. Esta captura corresponde al corte previo: 119 Listo y cuatro Por hacer. El corte de calidad posterior tiene 122 Listo y ANA-26 En curso. Las diez historias suman 67 SP; sus 99 subtareas están terminadas. Se conservan el corte inicial y las curvas simuladas como antecedentes identificados.

### 3.3 Relación Costo-Cronograma (SPI vs. CPI con tamaño CSI)

![Burbujas SPI y CPI](evidencias/evm-burbujas.png)

CSI se define aquí como **Cost-Schedule Index = CPI × SPI**, no índice de satisfacción. El área de cada burbuja es proporcional a CSI. El punto final (1.0000; 1.4270) conserva una advertencia: el SPI monetario no representa cumplimiento de la fecha original. Todos los puntos son simulados.

### 3.4 Medidores de Estado / Gráficos de Barras

![Barras de avance](evidencias/avance-bac.png)

Interpretación: 100% de PV/EV del escenario y 70.08% del BAC valorizado como AC. Se prefieren barras a medidores circulares porque permiten comparar directamente los tres valores. Un 100% modelado no convierte la evaluación humana en completada.

## 4. Acciones activadas por el tablero

PM registra aceptación y desviación de fecha; QA conserva pruebas; líder técnico observa hosting y latencia; producto coordina SUS real; comunicaciones consolida horas y datos faltantes. Responsabilidades propuestas según los roles documentados, sin atribuir asistencia o compromisos nuevos a una reunión no acreditada.

---

[← Volver al README principal](../../README.md)
