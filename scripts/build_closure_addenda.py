"""Versioned reconciliations and presentation guide; no alteration of old files."""
from pathlib import Path
from urllib.parse import quote
import json
ROOT=Path(__file__).resolve().parents[1]
def save(path,text):
    p=ROOT/path;p.parent.mkdir(parents=True,exist_ok=True);p.write_text('\n'.join(line.rstrip() for line in text.strip().splitlines())+'\n',encoding='utf-8')
back='[← Volver al README principal](../../README.md)'
history='''## Historial de cambios

| Versión | Fecha | Cambio y fundamento |
|---|---|---|
| 1.0.0 | Fecha del artefacto original | Línea base conservada sin reescritura. |
| 1.1.0 | 27/11/2026 | Conciliación de cierre con evidencia técnica y escenario de gestión simulado autorizado. No es aprobación retroactiva ni re-baseline que elimine desviaciones. |
'''
save('docs/01 Inicio/02. Acta de constitución V_1_1_0.md',f'''
{back}

# Acta de Constitución - consolidación de cierre V_1_1_0

**Proyecto:** EcoLogística Lima · **Código:** PFA-ECOLIMA-2026 · **Fecha de consolidación:** 27/11/2026.
**Dirección indicada en el acta original:** Zayuri Cerron Medina. Esta versión no atribuye una nueva firma ni aceptación del patrocinador.

## 1. Propósito y alineación

Facilitar la gestión de última milla en Lima mediante una web de despacho y una app para clientes/repartidores, planificación vial, estados de entrega e indicadores ambientales estimados. Se mantiene la justificación y el alcance funcional del [acta original V_1_0_0](02.%20Acta%20de%20constituci%C3%B3n%20V_1_0_0.md).

## 2. Alcance y entrega observada

Diez historias funcionales cubren flota, conductores, pedidos, preferencias, optimización, visualización, reoptimización, analítica, PDF y compensación. Hay implementación y verificación técnica de cuatro incrementos. El plan inicial de ocho sprints quincenales no se sustituye por ocho sprints inventados ni se considera prueba de que Jira haya cerrado los cuatro actuales.

Arquitectura implementada: React/TypeScript, Flutter, FastAPI, PostgreSQL/PostGIS, OSRM y cola persistida de itinerarios/reportes; hosting gratuito Render/Neon. La propuesta inicial de React Native/Expo, Redis y Firebase no se presenta como implantación real.

## 3. Metas originales y condición al cierre

| Dimensión | Meta original conservada | Evidencia / condición actual |
|---|---|---|
| Alcance | 100% de módulos core operativos | Diez historias implementadas; aceptación técnica automatizada y producto publicado. Aceptación humana por documentar. |
| Cronograma | 16 semanas, entrega 05/11/2026; SPI ≥0.95 | Estabilización 26/11 y documentación 27/11: +21/+22 días; SPI final simulado 1 no elimina demora. |
| Costo | Techo S/ 12850.00; CPI 0.95–1.05 | Presupuesto modelado S/ 11467.50; AC simulado S/ 8036.25 y CPI 1.4270. Costo real integral no certificado. |
| Calidad | Cobertura ≥80%, ruteo <350 ms y SUS ≥85 | Gates CI aprobados; rendimiento universal y SUS real no acreditados. Los cinco SUS simulados promedian 77.5. |
| Ambiente / operación | Reducción hasta 25%, disponibilidad ≥99.5% | Estimaciones configurables; no hay piloto físico causal. Monitoreo muestral dos horas 99.58%; no SLA mensual. |

## 4. Calendario de referencia

Se conservan H-01 23/07, H-02 13/08, H-03 17/09, H-04 15/10 y H-05 05/11/2026. Fechas de documentos no equivalen a aceptación del hito. El [reporte final](../04%20Cierre/06%20Reporte%20Final%20del%20Proyecto%20V_1_0_0.md) distingue las fechas observadas y las brechas de trazabilidad.

## 5. Autoridad, riesgos y aceptación

No se autoriza gasto nuevo: servicios solamente gratuitos. Riesgos abiertos: latencia, validación con participantes, factores simulados y evidencia actual de Jira. No consta waiver de los requisitos no cumplidos. Producto técnicamente entregable; cierre administrativo, capacitación y soporte requieren constancia del equipo receptor.

{history}

{back}
''')
save('docs/02 Planificación/04 Presupuesto del proyecto V_1_1_0.md',f'''
{back}

# Presupuesto del proyecto - conciliación de cierre V_1_1_0

**Proyecto:** EcoLogística Lima · **Fecha:** 27/11/2026. **Moneda de control:** PEN.
Antecedente: [presupuesto V_1_0_0](04%20Presupuesto%20del%20proyecto%20V_1_0_0.md). Se mantiene el tipo de cambio **interno referencial** de 3.75 PEN/USD; no es una cotización vigente ni un tipo de cambio oficial investigado.

## 1. Línea base y techo

| Concepto | USD planificados | PEN al cambio interno |
|---|---:|---:|
| Recursos humanos: 1200 h | 2100.00 | 7875.00 |
| Herramientas y licencias | 100.00 | 375.00 |
| Cloud y servicios | 580.00 | 2175.00 |
| Subtotal | 2780.00 | 10425.00 |
| Contingencia: 10% del subtotal | 278.00 | 1042.50 |
| BAC modelado, incluida contingencia | 3058.00 | 11467.50 |
| Techo del acta, distinto del BAC | No se usa una nueva conversión | 12850.00 |
| Margen techo − BAC | No es gasto ni reserva consumida | 1382.50 |

El techo inicial no es la suma de las partidas del acta; las partidas suman S/ 11467.50. Se explicita la diferencia como margen frente al techo, sin duplicarla dentro de la contingencia.

## 2. Ejecución simulada para el cierre

El usuario autorizó construir un escenario lógico; **no hay partes de horas ni comprobantes completos**. Se mantienen las tarifas académicas originales y se modelan 1220 h: Zayuri 220, Jheferson 270, Angela 240, Maylit 260 y Diego 230. Valorización total S/ 8036.25. Incremento de RR.HH. sobre S/ 7875.00: S/ 161.25 (+2.05%).

Herramientas/cloud y contingencia del escenario: S/ 0.00 incurridos. CV modelado: S/ 3431.25 favorable. Esto es valorización simulada, no ahorro contable confirmado. Las horas no fueron inferidas de commits, nombres o actividad de cuenta.

## 3. Desembolso y autorización reales

Render y Neon se configuraron únicamente con autorización de plan gratuito y gasto S/ 0.00. No se dispone del libro completo de gastos del equipo; no se declara costo real total cero ni gasto real igual a S/ 8036.25. Cualquier recurso pago requiere autorización previa y su comprobante.

## 4. Control y trazabilidad

Modelo, horas, cortes, fórmulas y redondeo: [EVM del cierre](../04%20Cierre/03%20Reporte%20de%20An%C3%A1lisis%20de%20Valor%20Ganado%20-%20EVM%20V_1_0_0.md). La simulación no cambia la línea base original ni acredita una liberación real de fondos o contratos liquidados.

{history}

{back}
''')
stories=[('US-001','Vehículos',5,'Sprint 1'),('US-002','Conductores',3,'Sprint 1'),('US-003','Pedidos',5,'Sprint 2'),('US-004','Preferencias',5,'Sprint 2'),('US-005','Optimización',13,'Sprint 3'),('US-006','Mapa',8,'Sprint 3'),('US-007','Reoptimización',8,'Sprint 3'),('US-008','Indicadores',5,'Sprint 4'),('US-009','PDF',3,'Sprint 4'),('US-010','Compensación',5,'Sprint 4')]
story_table='\n'.join(f'| {a} | {b} | {c} | {d} | Implementación y verificación técnica; aceptación administrativa no inferida |' for a,b,c,d in stories)
save('docs/02 Planificación/01 Transformando a ágil V_1_1_0.md',f'''
{back}

# Transformando a ágil - backlog consolidado V_1_1_0

**Proyecto:** EcoLogística Lima · **Fecha:** 27/11/2026. Se conserva el [backlog original V_1_0_0](01%20Transformando%20a%20%C3%A1gil%20V_1_0_0.md), sus criterios de aceptación y su prioridad. Esta versión concilia el estado técnico al cierre; no modifica Jira ni certifica sus sprints cerrados.

## 1. Historias y estimación reconciliada

| Historia | Funcionalidad | SP consolidados | Incremento documental | Estado del cierre |
|---|---|---:|---|---|
{story_table}
| Total | Diez historias | 60 | Cuatro incrementos | Ver límites de aceptación humana y no funcionales |

## 2. Conciliación de estimaciones

El backlog inicial suma **58 SP**, con US-004 = 3. El informe de Sprint 2 V_1_3_0 contiene US-004 = 5, aunque también muestra sumas y referencias a US-003 inconsistentes. El cierre usa US-003 = 5 y US-004 = 5 de su tabla y del incremento 10 SP; no adopta la frase que asigna 8 SP a US-003 y total 21 porque no coincide con esas filas.

Cambio EST-01: US-004 3 → 5 SP, diferencia +2, por mayor esfuerzo de preferencias, validaciones e integración reconocido en el informe posterior. No añade requisitos de negocio. Es conciliación documental retrospectiva, sin atribuir una aprobación histórica ni alterar una estimación actual de Jira no consultada.

Distribución reconciliada: Sprint 1 = 8; Sprint 2 = 10; Sprint 3 = 29; Sprint 4 = 13. Las capturas históricas de Jira presentan otra agrupación y puntos; se conservan como fuentes separadas, no se fuerzan a coincidir. No se usa velocidad promedio como compromiso porque no hay capacidad/duración homogénea acreditada.

## 3. Definition of Done y límites

Una historia se verifica técnicamente con código integrado, casos positivos/negativos, permisos, persistencia y recorrido del sistema. Los workflows al 26/11 aprobaron backend, web, móvil, navegadores y despliegue. Los requisitos de participantes reales, rendimiento universal, piloto ambiental y aceptación de interesados siguen diferenciados; no se declara DoD completa solo por tener pruebas verdes.

{history}

{back}
''')
save('docs/01 Inicio/10. Stack tecnológico V_1_1_0.md',f'''
{back}

# Stack tecnológico implementado V_1_1_0

**Proyecto:** EcoLogística Lima · **Fecha:** 27/11/2026. Actualiza la propuesta de [V_1_0_0](10.%20Stack%20tecnol%C3%B3gico%20V_1_0_0.md) conforme al código y despliegue, conservando el historial.

| Capa | Implementación y fuente | Límite / decisión |
|---|---|---|
| Web | React 18, TypeScript, Vite y Leaflet; `src/frontend/package.json` | Rutas de administración/oficina y consulta por cuenta; API compartida. |
| Móvil | Flutter/Dart; `src/mobile/pubspec.yaml` | Cliente y repartidor; persistencia local y reintento de operaciones. Android compilado por CI. |
| API | Python/FastAPI, Pydantic y SQLAlchemy; `src/backend` | Servicios de dominio, validaciones, permisos y fecha operativa de Lima. |
| Identidad | Token firmado HMAC y contraseña PBKDF2; `app/core/auth.py` | No se etiqueta como JWT estándar; acceso revocable por estado de cuenta. |
| Datos | PostgreSQL 16 + PostGIS en Neon; SQL aditivo | Instantáneas de factores y archivos PDF persistidos. |
| Mapas y rutas | OpenStreetMap, Leaflet, OSRM y servicios de planificación | Rutas y emisiones estimadas; dependencia del servicio externo. |
| Notificaciones/cola | Itinerarios y confirmaciones persistidos en PostgreSQL | Polling/confirmación; Redis y Firebase no son requisitos del despliegue actual. |
| PDF | Trabajador de reportes y descarga autenticada | Estados PENDIENTE/LISTO/ERROR, reintento y privacidad por cuenta/rol. |
| Despliegue | Render web/API; Neon DB; GitHub Actions | Solo planes gratuitos, con suspensión y latencia posibles; no garantiza SLA comercial. |
| Verificación | Pytest, Vitest, Playwright y Flutter | E2E desechable con PostGIS; cobertura con gate ≥80%. |

Las versiones C4 y base de datos V_1_1_0 ya existentes complementan esta consolidación. No se agrega un componente tecnológico solo porque aparezca en una propuesta histórica.

{history}

{back}
''')

save('docs/04 Cierre/anexos/Guia de sustentacion y transicion.md','''
[← Volver al README principal](../../../README.md)

# Sustentación en vivo y transición operativa

Proyecto EcoLogística Lima · Corte 27/11/2026. Este material prepara la sustentación de 20 minutos; **no es guion ni producción del video excluido del encargo**.

## 1. Exposición de gestión y cierre: 10 minutos

| Tiempo | Tema / responsable propuesto | Evidencia que se abre |
|---|---|---|
| 0:00–2:00 | Zayuri: problema, propósito, alcance y estado de aceptación | Reporte final, secciones 1–2. |
| 2:00–4:00 | Diego: cronograma y desviaciones | Reportes de estado/variación; fecha original 05/11 frente a 26/11 y 27/11. |
| 4:00–6:00 | Jheferson: presupuesto/EVM y arquitectura implementada | EVM y tablero; explicar BAC 11467.50, AC simulado 8036.25, CPI 1.4270 y SPI 1.0000. |
| 6:00–8:00 | Maylit: calidad, riesgos y fuentes reales | Validación técnica y Playwright; distinguir 99.58% muestral de SLA mensual. |
| 8:00–10:00 | Angela: radiadores, lecciones y transición | Mood/radiadores rotulados y pendientes de aceptación real. |

Los responsables son propuesta de exposición basada en los roles del proyecto, no un acta de acuerdos. Explicar qué es simulado desde su primera aparición, no solo al final de preguntas.

## 2. Demostración técnica: 10 minutos

| Tiempo | Acción en vivo | Resultado esperado |
|---|---|---|
| 0:00–1:00 | Abrir la web pública e ingresar con cuenta autorizada | Rol reconocido automáticamente; no se muestra contraseña al público. |
| 1:00–2:15 | Mostrar vehículos/conductores, disponibilidad y licencia | Registros persistidos y listados paginados completos. |
| 2:15–3:30 | Mostrar pedido, horario, coordenadas y vínculo de cliente | Validaciones; preferencias antes del reparto. |
| 3:30–5:30 | En entorno desechable, planificar y consultar mapa/itinerario | Ruta vial y asignación; respuesta de API persistida. En producción usar una ruta de prueba existente, sin alterar pedidos de negocio. |
| 5:30–7:00 | Mostrar recepción de itinerario, entrega y regreso en entorno de pruebas | ASIGNADO → EN_TRANSITO → ENTREGADO/NO_ENTREGADO; regreso confirma COMPLETADA. |
| 7:00–9:00 | Sostenibilidad: periodo 24/11/2026 para los registros de prueba conocidos, o periodo con datos completados confirmado antes | Indicadores con unidades y factores simulados visibles; PDF guardado y descarga privada. No presentar 2.90 kg estimados como medición física. |
| 9:00–10:00 | Mostrar compensación, fuente de factores y prueba de acceso por rol | Porcentajes suman 100%; propuesta no implica compra de créditos o árboles plantados. |

Los pasos en un entorno desechable son una alternativa operativa para demostrar escrituras sin afectar datos de producción. Prepararlo y ensayarlo antes de la exposición; no se declara que la sustentación ya ocurrió.

## 3. Preparación, operación y recuperación

- Enlaces: web https://ecologistica-web.onrender.com ; API https://ecologistica-api.onrender.com/docs . Abrir con anticipación para detectar suspensión del servicio gratuito.
- Repositorio: revisar README, los siete reportes y el workflow del commit que se presentará. Si GitHub muestra una ejecución posterior, comprobar su estado antes de afirmar aprobación.
- Instalación: seguir `docs/SPRINT_3_INSTALACION_Y_VALIDACION.md`, la guía de despliegue del Sprint 4 y `docs/GUIA_DE_USO_Y_REPORTES.md`.
- Cuenta de cliente/repartidor: debe crearse con autorización de administración. Cliente se vincula a sus pedidos; repartidor a su conductor. No hay selector libre de roles en login.
- Parámetros: conservar fuente, vigencia y unidades. Mantener simulados los factores del demo hasta que se proporcionen datos reales verificados.
- Credenciales: entregar por canal privado; los reportes y el ZIP no deben contener contraseñas, tokens ni cadenas de base de datos.
- Recuperación: conservar esquema/migraciones y respaldo privado de base; probar restauración en entorno separado antes de borrar o sustituir producción. No hay restauración productiva nueva ejecutada en este cierre documental.
- Caída de red: mostrar error y reintento; usar el entorno local ensayado y explicar el cambio de entorno. No usar una imagen para aparentar una ejecución en vivo.

## 4. Cierre administrativo y soporte propuestos

Zayuri coordina la aceptación; Jheferson el traspaso técnico; Maylit la verificación; Angela la capacitación; Diego las comunicaciones. Registrar la aceptación real, observaciones, responsables y fecha. Proponer soporte durante 30 días, sujeto a aceptación del equipo, y una revisión de acceso/recursos gratuitos al finalizarlo.

No consta firma del patrocinador, capacitación realizada ni cierre contractual certificado. El video y su carpeta no fueron creados por instrucción del usuario.

[← Volver al README principal](../../../README.md)
''')

save('docs/04 Cierre/anexos/Matriz de entregables y evidencias.md','''
[← Volver al README principal](../../../README.md)

# Matriz de cumplimiento y procedencia

| Requisito del encargo | Entrega / control | Condición de evidencia |
|---|---|---|
| Siete nombres exactos en docs/04 Cierre | Reportes 01–07 y validador documental | Archivos entregados; validación de existencia, marcadores y enlaces. |
| Reporte de estado y variación | Alcance, cronograma, costos, proyección, riesgos y causas | Narrativa técnica con limitaciones; ejecución financiera simulada. |
| EVM con tres columnas y tres EAC | Modelo JSON, CSV, horas y fórmulas verificables | Simulado; no libro contable ni horas reales. |
| Dashboards híbridos | RAG, líneas EVM, flujo acumulado, burbujas CSI y barras | Figuras rotuladas; tablas como alternativa textual accesible. |
| Radiadores | Burndown, burnup, mood, tablero Jira histórico y síntesis de retro | Curvas/mood simulados; tablero real histórico; retro reconstruida. No son nuevas capturas reales de ejecución. |
| Reporte final y lecciones | Separación predictivo/adaptativo, riesgos y transición | Aprobación administrativa y reunión real no acreditadas. |
| Nomenclatura y versiones previas | Acta, presupuesto, backlog y stack V_1_1_0 | Versiones originales conservadas; sin aprobación histórica inventada. |
| Arquitectura, limpieza y .gitignore | Web/API/móvil separados; inspección de archivos rastreados y exclusiones | Fuente en repositorio; secretos y dependencias fuera de la entrega. |
| Demostración funcional y tiempo | Guía de 10 min de gestión y 10 min de demo; CI y pruebas | Guía preparada, no exposición ya efectuada. |
| Video MP4 | Excluido expresamente por el usuario | No entregado; no se declara cumplimiento de ese criterio del curso. |

## Fuentes

Consigna final HTML y material docente proporcionados por el usuario, revisados localmente el 27/11/2026. No se publican copias de los PDF docentes. Datos técnicos de referencia: workflows del commit be3e3ac, pruebas documentadas, monitoreo original y retrospectivas versionadas. No se convierten las simulaciones en registros reales.

## Regeneración y revisión

`python scripts/build_closure_figures.py` requiere matplotlib solo para autoría; `python scripts/build_closure_documents.py` y `python scripts/build_closure_addenda.py` usan biblioteca estándar. `python scripts/verify_closure.py` verifica integridad sin instalar dependencias. Los gráficos tienen PNG para Markdown y SVG para exportación.

[← Volver al README principal](../../../README.md)
''')
print('Cuatro versiones V_1_1_0 y dos anexos preparados sin alterar sus antecedentes.')
