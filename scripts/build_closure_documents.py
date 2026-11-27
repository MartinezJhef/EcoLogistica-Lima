"""Build the seven closure reports from the declared simulated model.

The prose distinguishes verified technical evidence, simulated management data,
and approvals or human activities that have not been established.
"""
from pathlib import Path
from decimal import Decimal, ROUND_HALF_UP
from urllib.parse import quote
import json

ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'docs/04 Cierre'
M=json.loads((OUT/'evidencias/escenario-cierre-simulado.json').read_text(encoding='utf-8'))
D=Decimal;BAC=D(M['BAC']);r=M['cortes'];now=r[-1];prior=r[-2]
def n(v,places=2):return f'{D(str(v)):.{places}f}'
def money(v):return 'S/ '+n(v)
def link(label,target):return f'[{label}]({quote(target,safe="/.:#")})'
def table(headers,rows):return '\n'.join(['| '+' | '.join(headers)+' |','|'+'|'.join(['---']*len(headers))+'|']+['| '+' | '.join(map(str,row))+' |' for row in rows])
names=['01 Reporte de Estado V_1_0_0.md','02 Reporte de Variación V_1_0_0.md','03 Reporte de Análisis de Valor Ganado - EVM V_1_0_0.md','04 Tableros de Control - Híbridos V_1_0_0.md','05 Radiadores de Información V_1_0_0.md','06 Reporte Final del Proyecto V_1_0_0.md','07 Reporte Final de Lecciones Aprendidas V_1_0_0.md']
back='[← Volver al README principal](../../README.md)'
note='> **Naturaleza de los datos.** Pruebas, commits y despliegues: evidencia técnica real al 26/11/2026. Horas, costos incurridos del escenario, EVM, evolución de radiadores y ánimo: **datos simulados**, autorizados para este cierre. No acreditan pagos, opiniones, reuniones ni aprobación de interesados.'
def write(i,title,body,sim=True):
    text=f'{back}\n\n# {title}\n\n**Proyecto:** EcoLogística Lima · **Código:** PFA-ECOLIMA-2026  \n**Fecha de corte:** 27/11/2026 · **Versión:** 1.0.0  \n**Periodo actual:** 31/10–27/11/2026 · **Corte anterior:** 30/10/2026\n\n'+(note+'\n\n' if sim else '')+body.strip()+f'\n\n---\n\n{back}\n'
    (OUT/names[i]).write_text('\n'.join(line.rstrip() for line in text.splitlines())+'\n',encoding='utf-8')

write(0,'Reporte de Estado del Proyecto (Status Report)',f'''
## 1. Información de Alcance

**Logros:** diez historias funcionales implementadas, integración web/API/móvil, rutas y entrega, analítica, PDF persistente y propuesta ambiental. Validación final: 226 pruebas web; 102 pruebas backend más una integración PostGIS; aceptación de cuatro roles en tres navegadores; Android compilado y despliegue aprobado. [Evidencia técnica](evidencias/validacion-tecnica.json).

**Cambios:** cuatro incrementos documentados frente a ocho sprints iniciales; Flutter sustituye la propuesta React Native. US-004 pasa de 3 a 5 SP por conciliación entre backlog e informe del Sprint 2: 58 → 60 SP, sin nueva funcionalidad. **Calidad:** se corrigieron truncamiento a 12 registros, bloqueo del último administrador, edición de pedidos cerrados y fecha UTC/Lima en aceptación.

## 2. Información de Cronograma

**No completado:** aceptación humana, mood real y conciliación actual de Jira. El video queda fuera de este encargo; sigue siendo requisito externo de la consigna. La meta original fue 05/11; estabilización técnica 26/11 (**+21 días**) y corte documental 27/11 (**+22 días**). La integración tardía, configuración del hosting y evidencia insuficiente afectaron la secuencia integración → aceptación → entrega. **Respuesta:** conservar la línea base, registrar desviación, adjuntar CI y ejecutar demo ensayada; PM coordina aceptación, QA conserva evidencias.

## 3. Información de Costos

**Escenario simulado:** AC del periodo {money(D(now['AC'])-D(prior['AC']))}; acumulado {money(now['AC'])}; BAC {money(BAC)}; CV favorable {money(now['CV'])}. Se modelan 1220 h frente a 1200 h (+20 h), compensadas por uso de herramientas gratuitas y reserva sin consumo simulado. No hay libro de gastos reales completo; autorización de nuevos cargos: S/ 0.00. **Control:** no contratar recursos pagos; separar valorización de horas y desembolsos.

## 4. Proyección (Look Ahead)

Entregar los siete reportes y anexos, verificar enlaces y ensayar 10 min de gestión + 10 min de demo. En el escenario EVM, ETC técnico = S/ 0.00; las actividades de aceptación futuras quedan fuera de ese cierre modelado y se estimarán antes de contratar recursos. No hay autorización de gasto adicional.

## 5. Riesgos, Incidentes y Comentarios

Riesgos abiertos: suspensión/latencia del hosting gratuito, factores ambientales simulados, falta de participantes reales y evidencia Jira antigua. El monitoreo de dos horas obtuvo 239/240 respuestas disponibles (99.58% de muestras), sin demostrar SLA mensual. El objetivo universal <500 ms y SUS real permanecen sin acreditar. Cierre documental preparado; aceptación administrativa pendiente de constancia del equipo. [Detalle EVM]({quote(names[2])}) y [reporte final]({quote(names[5])}).
''')

write(1,'Reporte de Variación (Variance Report)',f'''
## 1. Variación de Cronograma

{table(['Métrica / Aspecto','Detalle'],[
('Resultados Planificados','H-05 final: 05/11/2026; horizonte de 16 semanas y ocho sprints iniciales.'),
('Resultados Reales','Última corrección técnica: 26/11; paquete documental: 27/11; cuatro incrementos registrados. Aceptación del patrocinador no acreditada.'),
('Variación Obtenida','+21 días calendario técnicos y +22 días hasta corte documental. La duración de sprints no se infiere del número de commits.'),
('Causa Raíz','Se integraron tarde flujos entre roles, servicios publicados y evidencias; también hubo correcciones de sesión, permisos y fechas operativas.'),
('Respuesta Planificada','PM mantiene la línea base original; QA exige recorrido completo por incremento; líder técnico conserva regresión UTC/Lima y automatización de despliegue.')])}

La cadena de dependencia que realmente bloqueó la entrega fue configuración de datos y acceso → integración → despliegue → aceptación y evidencias. Es una secuencia crítica observada; no se presenta como una ruta CPM calculada sin red ni duraciones aprobadas. SPI monetario final = 1 porque PV y EV llegan al BAC; **no elimina los 21/22 días de demora**.

## 2. Variación de Costo

{table(['Métrica / Aspecto','Detalle'],[
('Resultados Planificados',f'BAC académico {money(BAC)}; tope del acta S/ 12850.00. RR.HH. S/ 7875.00; herramientas S/ 375.00; cloud S/ 2175.00; contingencia S/ 1042.50.'),
('Resultados Reales',f'AC del escenario simulado {money(now["AC"])}. No es costo final real certificado ni gasto pagado. Servicios desplegados autorizados solamente en planes gratuitos.'),
('Variación Obtenida',f'CV = EV − AC = {money(now["CV"])}; RR.HH. modelados +S/ 161.25 (+2.05%); horas +20 (+1.67%).'),
('Causa Raíz','Más esfuerzo modelado de integración y QA; ausencia de compras modeladas de cloud/licencias y contingencia.'),
('Respuesta Planificada','Registrar horas y comprobantes reales para sustituir el escenario. PM valida variaciones y gasto; no usar commits como horas trabajadas.')])}

Conciliación del escenario: ahorro de herramientas/cloud S/ 2550.00 + reserva sin consumo S/ 1042.50 − mayor valorización de RR.HH. S/ 161.25 = **S/ 3431.25**. No se atribuye ese ahorro a una eficiencia real demostrada.

## 3. Variación de Calidad

{table(['Resultados planificados','Resultados comprobados','Variación / causa raíz','Respuesta y responsable'],[
('Flujos integrados sin fallos en la aceptación definida','226 web + 102 backend + 1 PostGIS; recorridos completos por roles/navegadores; Android y CI aprobados.','Defectos de límite de listado, cierre de pedido, administración y calendario detectados y corregidos.','QA conserva pruebas de regresión; líder técnico exige CI verde antes de desplegar.'),
('Cobertura ≥80%','Workflows ejecutan umbral ≥80%; resultados aprobados. No se confunde tasa de éxito de pruebas con cobertura.','Cumplimiento de umbral del workflow; no se inventa porcentaje exacto distinto.','Mantener gate de cobertura.'),
('SUS ≥85 con participantes reales en acta','n humano = 0; cinco perfiles simulados, promedio 77.5.','Resultado real no evaluable; simulación 7.5 puntos bajo meta, sin equivalencia a aceptación.','PO coordina cinco participantes reales y archiva respuestas.'),
('Todas las respuestas <500 ms','Mediana de resumen 458.45 ms; 9/10 <500, máximo 500.91 ms; login supera meta.','Meta universal no acreditada; red, autenticación y plan gratuito influyen.','Perfilar y medir por endpoint en frío/caliente antes de contratar capacidad.'),
('Disponibilidad ≥99.5%','239/240 muestras en dos horas: 99.58%.','Cumplimiento muestral, no certificación mensual ni operación continua.','Soporte amplía monitoreo y registra interrupciones.'),
('Reducción ambiental -22% / hasta 25%','Hay cálculo de CO₂ estimado y pruebas con parámetros simulados.','No existe piloto causal ni línea base de emisiones físicas verificadas.','PO valida factores y diseña comparación de rutas reales.')])}

### Control de cambios

La consolidación no rebaja metas ni declara exenciones aceptadas. Se conservan las versiones originales y se crean acta, presupuesto, backlog y stack V_1_1_0, con fuentes, cambios y limitaciones. El retiro del video aplica al trabajo solicitado, no cambia la rúbrica del curso.
''')

keys=['PV','EV','AC','SV','CV','SPI','CPI']
current={k:(D(now[k])-D(prior[k])) for k in ['PV','EV','AC']}
current.update(SV=current['EV']-current['PV'],CV=current['EV']-current['AC'],SPI=current['EV']/current['PV'],CPI=current['EV']/current['AC'])
metric_table=table(['Métrica','Periodo actual','Acumulado actual','Acumulado anterior'],[(k,n(current[k],4 if k in ['SPI','CPI'] else 2),n(now[k],4 if k in ['SPI','CPI'] else 2),n(prior[k],4 if k in ['SPI','CPI'] else 2)) for k in keys])
hours_table=table(['Integrante / rol de referencia','P1 h','P2 h','P3 h','P4 h','Total h','PEN/h','Costo simulado'],[(p['nombre']+' / '+p['rol'],*p['horas_periodo'],p['horas_simuladas'],p['tarifa_PEN_h'],p['costo_simulado']) for p in M['personas']])
def forecasts(row):
    cpi=D(row['CPI']);spi=D(row['SPI']);ac=D(row['AC']);ev=D(row['EV'])
    return [BAC/cpi,BAC/(cpi*spi),ac+(BAC-ev)/(cpi*spi)]
f=forecasts(now);fp=forecasts(prior)
write(2,'Reporte de Análisis de Valor Ganado - EVM',f'''
**BAC:** {money(BAC)} · **Estado general:** cierre técnico modelado completo; retraso calendario real y aceptación humana pendiente.

## 1. Métricas de Desempeño EVM

Todos los importes de esta sección son **PEN simulados**. AC significa costo incurrido **del escenario**, no registro contable real.

{metric_table}

Periodo actual = acumulado 27/11 − acumulado 30/10 para PV, EV y AC. Los índices se calculan desde los importes de cada columna; **no se restan índices**. SV y CV se expresan en PEN, no en días.

### Base reproducible y criterio de reconocimiento

BAC se toma del presupuesto académico de USD 3058.00 × cambio interno 3.75 = S/ 11467.50, incluida contingencia. El tope S/ 12850.00 del acta no se usa como BAC: diferencia S/ 1382.50, sin autorización nueva para gastar.

PV acumulado modelado: 20%, 45%, 90%, 100%. EV acumulado modelado: 12%, 30%, 75%, 100%. Los cortes P1/P2/P3/P4 son un **escenario retrospectivo de gestión**, no exportaciones del historial Jira. EV reconoce paquetes presupuestados según aceptación técnica simulada; no convierte SP en dinero ni prueba aceptación humana total.

{hours_table}

Horas planificadas: 240 por integrante, 1200 total. Horas del escenario: 1220. Tarifas académicas originales: USD 1.75/2.00/1.70/1.70/1.60 por hora, multiplicadas por el cambio interno 3.75. AC = Σ(horas × tarifa); gastos externos y consumo de reserva del escenario = 0. La gratuidad autorizada de hosting no convierte el tiempo del equipo en costo real cero.

Regla de redondeo: cálculo Decimal y redondeo a céntimos por corte; el costo del periodo es la diferencia de acumulados. Así se evita una discrepancia de un céntimo por redondear periodos por separado. [Horas fuente](evidencias/horas-simuladas.csv), [modelo JSON](evidencias/escenario-cierre-simulado.json) y [tabla CSV](evidencias/evm-simulado.csv).

## 2. Porcentajes de Avance Acumulado (Respecto al BAC)

- Planificado: PV/BAC = {n(D(now['PV'])/BAC*100)}%.
- Ganado: EV/BAC = {n(D(now['EV'])/BAC*100)}%.
- Gastado: AC/BAC = {n(D(now['AC'])/BAC*100)}%.

![Avance respecto al BAC](evidencias/avance-bac.png)

## 3. Análisis de Desviaciones

**Cronograma:** al corte anterior SPI = {n(prior['SPI'],4)} y SV = {money(prior['SV'])}: se había ganado menos de lo planificado. Al cierre SPI = 1 por agotarse el trabajo presupuestado. El cierre técnico del 26/11 permanece 21 días después del objetivo 05/11; el cierre documental del 27/11 está 22 días después. No se altera la línea base para ocultarlo.

**Costo:** CPI final = {n(now['CPI'],4)} y CV = {money(now['CV'])}. El escenario conserva herramientas/infraestructura gratuitas y usa más horas de integración/QA. La diferencia positiva es una comparación modelada contra un presupuesto que incluía recursos no contratados; no es ahorro real certificado. CPI queda fuera de la banda inicial 0.95–1.05 por debajo del costo previsto; se explica la composición en lugar de declarar cumplimiento artificial.

## 4. Estimaciones a la Conclusión (EAC)

{table(['Fórmula','Acumulado anterior, 30/10','Cierre, 27/11'],[(
 '1. BAC / CPI',money(fp[0]),money(f[0])),('2. BAC / (CPI × SPI)',money(fp[1]),money(f[1])),('3. AC + (BAC − EV) / (CPI × SPI)',money(fp[2]),money(f[2]))])}

**Seleccionada: fórmula 3.** Al cierre EV = BAC y trabajo remanente = 0, por tanto ETC = 0 y EAC = AC = {money(now['AC'])}. Las tres fórmulas coinciden al cierre por SPI = 1 y EV = BAC. En el corte anterior no coinciden: la segunda penaliza el BAC entero por costo y cronograma, mientras la tercera aplica el rendimiento combinado solo al trabajo pendiente. Se usa precisión completa para índices y se redondea únicamente el resultado mostrado.

VAC = BAC − EAC = {money(now['CV'])}. TCPI sobre BAC no se utiliza al no existir trabajo pendiente del escenario. Aceptación humana, pilotos reales o nuevos servicios se estiman como trabajo futuro antes de comprometer fondos; no se ocultan dentro de ETC = 0.

![Tendencia EVM simulada](evidencias/evm-tendencia.png)

## 5. Verificación

`python scripts/build_closure_figures.py` regenera datos y figuras; `python scripts/verify_closure.py` verifica fórmulas, sumas, enlaces y marcadores. El modelo financiero conserva explícitamente su condición simulada.
''')

write(3,'Tableros de Control Híbridos (Hybrid Dashboards)',f'''
**Frecuencia:** actualización técnica en cada integración/despliegue; revisión de gestión al cierre de cada sprint; corte consolidado 27/11/2026. No es un tablero en tiempo real.

## 1. Justificación de Métricas (Principio Less is More)

PM y docente necesitan saber qué se entrega, cuánto se desvía y qué falta para aceptar. Desarrollo y QA necesitan defectos, flujo de revisión y resultados reproducibles. Se muestran cuatro familias: alcance/entrega, calendario/costo, calidad operativa y aceptación. No se incorporan métricas de vanidad ni se deduce productividad de commits.

Colores con redundancia textual: VERDE = evidencia técnica aprobada; ÁMBAR = condición/estimación; ROJO = evidencia real requerida ausente. Las tablas conservan valores, unidades y fuentes aunque la imagen se vea en escala de grises. Las figuras son PNG legibles y SVG vectoriales, sin depender de hover ni conexión.

## 2. Tabla Semáforo (RAG Chart) por Componente

{table(['Componente / Entregable','Enfoque','Estado','Observación / Umbral'],[
('Requisitos, arquitectura y presupuesto','Predictivo','ÁMBAR','Versiones conciliadas; horas y ejecución financiera simuladas.'),
('US-001–US-010 e integración','Adaptativo','VERDE técnico','Historias con implementación y recorridos automatizados; no equivale a aceptación de stakeholders.'),
('Web, API, móvil y despliegue','Adaptativo','VERDE','226 web + 103 backend/PostGIS, E2E multirrol y Android; workflows aprobados al 26/11.'),
('Cronograma macro','Predictivo','ROJO','21 días hasta estabilización técnica; 22 hasta corte documental frente al 05/11.'),
('Costo / EVM','Predictivo','ÁMBAR','CPI 1.4270 del escenario; registro económico real no disponible.'),
('SUS y aceptación humana','Híbrido','ROJO','n real = 0; cinco casos simulados, SUS 77.5.'),
('Disponibilidad / latencia','Híbrido','ÁMBAR','99.58% de 240 muestras en dos horas; máximo del resumen 500.91 ms; no SLA mensual.'),
('Documentos y transición','Predictivo','ÁMBAR','Paquete y guía preparados; aceptación administrativa y capacitación por registrar.')])}

## 3. Gráficos de Desempeño Predictivo y Ágil

### 3.1 Tendencias de Variación y Valor Ganado (Líneas)

![Tendencia EVM](evidencias/evm-tendencia.png)

Interpretación: el EV simulado queda bajo PV hasta P3 y converge al cierre. La distancia EV–AC representa CV favorable del escenario; el retraso calendario se conserva aparte. Datos: [EVM CSV](evidencias/evm-simulado.csv).

### 3.2 Flujo Acumulado / Áreas Apiladas

![Flujo acumulado simulado](evidencias/flujo-acumulado-simulado.png)

Interpretación: la banda de revisión se ensancha antes del corte P3 y requiere limitar trabajo iniciado y revisar antes. Es reconstrucción simulada del proyecto completo, no una medición del tablero Jira. Se mantienen 58 SP al inicio y 60 tras conciliar US-004.

### 3.3 Relación Costo-Cronograma (SPI vs. CPI con tamaño CSI)

![Burbujas SPI y CPI](evidencias/evm-burbujas.png)

CSI se define aquí como **Cost-Schedule Index = CPI × SPI**, no índice de satisfacción. El área de cada burbuja es proporcional a CSI. El punto final (1.0000; 1.4270) conserva una advertencia: el SPI monetario no representa cumplimiento de la fecha original. Todos los puntos son simulados.

### 3.4 Medidores de Estado / Gráficos de Barras

![Barras de avance](evidencias/avance-bac.png)

Interpretación: 100% de PV/EV del escenario y {n(D(now['AC'])/BAC*100)}% del BAC valorizado como AC. Se prefieren barras a medidores circulares porque permiten comparar directamente los tres valores. Un 100% modelado no convierte la evaluación humana en completada.

## 4. Acciones activadas por el tablero

PM registra aceptación y desviación de fecha; QA conserva pruebas; líder técnico observa hosting y latencia; producto coordina SUS real; comunicaciones consolida horas y datos faltantes. Responsabilidades propuestas según los roles documentados, sin atribuir asistencia o compromisos nuevos a una reunión no acreditada.
''')

write(4,'Radiadores de Información (Information Radiators)',f'''
**Marco ágil:** Scrum con gobierno predictivo de presupuesto, riesgos e hitos. **Lectura:** evidencias reales históricas más reconstrucciones simuladas claramente rotuladas.

## 1. Burndown Chart (Trabajo Restante)

![Burndown simulado](evidencias/burndown-simulado.png)

La serie corresponde al proyecto agregado, no al Sprint 4 de 13 SP. El ideal parte de 58 SP y desciende linealmente; el modelo pasa a 60 al revisar US-004. Trabajo restante final: 0 SP **del escenario**. El avance no es uniforme: la concentración de terminaciones al cierre de integración sugiere evitar lotes grandes. No se calcula una velocidad real diaria desde esta simulación.

## 2. Burnup Chart (Trabajo Completado y Cambios de Alcance)

![Burnup simulado](evidencias/burnup-simulado.png)

La estimación total pasa de 58 a 60 SP por US-004 de 3 a 5 SP; se mantienen diez historias. No se confunde un aumento de estimación con una nueva funcionalidad. Distribución reconciliada por incremento: 8, 10, 29 y 13 SP. Promedio aritmético 15 SP/incremento; no se usa como pronóstico de velocidad porque los incrementos no acreditan igual duración/capacidad. [Datos simulados](evidencias/radiadores-simulados.csv).

## 3. Task Board / Tablero Kanban

![Captura histórica del tablero Jira](../02%20Planificaci%C3%B3n/image-3.png)

**Captura real histórica ya incluida en el artefacto Jira**, sin fecha verificable en la imagen. Muestra Por hacer, En curso, Listo e In Review; las tres tarjetas visibles están en Por hacer y las demás columnas en cero. El encabezado dice «Proyecto Ecologistica Huancayo»: inconsistencia de denominación frente a EcoLogística Lima que debe conciliar el equipo. No prueba el estado final ni se editó para aparentar tareas terminadas.

Cuello de botella visible: trabajo concentrado en Por hacer y una columna In Review posterior a Listo en la captura. Se conserva la decisión del usuario de **no cambiar columnas**. Acción: revisar el mapeo de estados y obtener una exportación/captura actual antes de declarar sprints cerrados; no se realizaron modificaciones en Jira durante este cierre.

![Captura histórica del backlog Jira](../02%20Planificaci%C3%B3n/image-1.png)

La captura usa otra agrupación/estimación de historias que el backlog textual. Por eso no se mezclan sus puntos ni sus fechas con las series simuladas. Las claves ANA visibles son evidencia histórica; no se inventan correspondencias para otras historias.

## 4. Mood Chart (Estado de Ánimo del Equipo)

![Mood chart simulado](evidencias/mood-simulado.png)

{table(['Integrante / rol de referencia','Sprint 1','Sprint 2','Sprint 3','Sprint final'],[(p['nombre']+' / '+p['rol'],*vals) for p,vals in zip(M['personas'],[[4,3,3,4],[4,3,2,4],[4,4,3,5],[3,3,2,4],[4,3,3,4]])])}

Escala 1 muy bajo a 5 muy alto. **Todos los valores son simulados** y no representan opiniones de las personas nombradas. Media final 4.2/5; media de Sprint 3 2.6/5. Hipótesis del escenario: presión de integración y recuperación al estabilizar pruebas. Se recomienda medir voluntariamente y acordar mejoras de carga sin usar el ánimo como evaluación individual.

## 5. Tableros de Retrospectiva

![Retrospectiva reconstruida](evidencias/retrospectiva-reconstruida.png)

Reconstrucción de la [retrospectiva versionada del Sprint 4](../03%20Implementaci%C3%B3n/Sprint%204/02%20Retrospectiva%20del%20Sprint%20V_1_0_0.md), no captura de una reunión. **Funcionó:** lógica compartida, permisos del servidor y pruebas reproducibles. **Mejorar:** validación con participantes, distribución de responsabilidades y calidad de evidencias. **Implementado técnicamente:** fecha Lima, regresiones, CI/CD y corrección de flujos. **Propuesto:** sesión real de aceptación y registro de sus acuerdos.

## 6. Límite de cumplimiento

La consigna solicita radiadores reales usados durante la ejecución. Se aporta el tablero real histórico existente; burndown, burnup, flujo y mood se entregan como simulados, y la retro como reconstrucción. Esto completa el material solicitado con la autorización recibida, pero **no acredita que esas gráficas fueran observadas en Jira ni sustituye las capturas reales exigidas por la rúbrica**.
''')

write(5,'Reporte Final del Proyecto (Final Project Report)',f'''
**Estado del cierre:** entrega técnica y documental preparada; aceptación administrativa por registrar. **Fecha de cierre documental:** 27/11/2026. No es una firma de aprobación del patrocinador.

## 1. Descripción General del Proyecto

EcoLogística Lima aborda planificación de última milla y trazabilidad de impacto ambiental estimado para operadores y comercios. Integra web React/TypeScript, app Flutter, API FastAPI, PostgreSQL 16/PostGIS, rutas viales OSRM, estados de entrega y reportes PDF. Roles: administrador, oficina, repartidor y cliente. El alcance se alinea al [acta consolidada V_1_1_0](../01%20Inicio/02.%20Acta%20de%20constituci%C3%B3n%20V_1_1_0.md), conservando el acta original como referencia de metas.

Producto publicado: [web](https://ecologistica-web.onrender.com) y [API/OpenAPI](https://ecologistica-api.onrender.com/docs). Última revisión técnica de referencia: `be3e3ac99db6714978326dbc3a52126861419dfd`, 26/11/2026; esta entrega de cierre añade documentación sin cambiar reglas de negocio.

## 2. Resumen de Desempeño

### 2.1 Alcance (Predictivo y Adaptativo)

**Predictivo:** acta, requisitos, reglas, arquitectura, presupuesto y riesgos establecieron límites. Se conserva fecha 05/11 y techo S/ 12850.00 para medir desviación. La nueva versión concilia lo implementado, sin atribuir una replanificación aprobada inexistente.

**Adaptativo:** diez historias: flota y conductores (US-001/002); pedidos y preferencias (US-003/004); optimización/mapa/reoptimización (US-005/006/007); indicadores/PDF/compensación (US-008/009/010). Los cuatro incrementos consolidados suman 60 SP, frente a 58 iniciales por la reestimación de US-004. El 100% funcional implementado no equivale al 100% de todos los criterios no funcionales o de aceptación humana.

Objetivo: módulos core operativos. Evidencia: pruebas por roles y recorrido cliente → asignación → entrega → regreso → analítica/PDF. Variaciones: Flutter frente al diseño inicial React Native; cola persistida/polling frente a propuestas de notificaciones externas; cuatro incrementos frente a ocho sprints previstos. [Stack consolidado](../01%20Inicio/10.%20Stack%20tecnol%C3%B3gico%20V_1_1_0.md).

### 2.2 Calidad

{table(['Criterio / evidencia','Resultado al corte','Conclusión'],[
('Pruebas web','226 aprobadas; construcción y precompresión correctas.','Verificación técnica aprobada.'),
('Backend y base geoespacial','102 pruebas locales + 1 integración PostgreSQL/PostGIS aprobadas.','La prueba PostgreSQL ejecuta planificación y replanificación sobre base real desechable.'),
('Aceptación automatizada','Cuatro roles × tres navegadores; pruebas completas y workflows aprobados.','No representa una encuesta ni aprobación humana.'),
('Android','Análisis, pruebas y compilación APK del workflow aprobados.','No acredita un piloto de campo en dispositivos de repartidores reales.'),
('Sitio publicado','20 comprobaciones del 26/11 aprobadas: acceso, consultas, fechas inválidas y protección del PDF.','Se consultaron datos existentes sin crear registros en esta revisión.'),
('SUS','Cinco casos simulados: media 77.5; n humano real = 0.','Meta original SUS ≥85 y muestra humana no acreditadas.'),
('Rendimiento','Resumen: mediana 458.45 ms, máximo 500.91; login por encima de 500 ms.','No se declara cumplimiento universal de 350/500 ms.'),
('Disponibilidad','Dos horas, 239/240 muestras disponibles, 99.58%.','No equivale a SLA mensual ni asegura continuidad del plan gratuito.'),
('Impacto ambiental','CO₂ y costos estimados según factores configurados y conservados por operación.','Factores simulados; no hay demostración física de -22%/25% ni neutralidad de carbono.')])}

**Exenciones:** no consta aprobación formal de waivers. Se identifican brechas sin eliminarlas de la línea base. El video se excluye por instrucción del usuario en este encargo y permanece como requisito de evaluación externo.

Fuentes de las métricas: [registro de validación técnica](evidencias/validacion-tecnica.json), [análisis Playwright y latencia](../03%20Implementaci%C3%B3n/Sprint%204/03%20Analisis%20PlayWrigth%20V_1_0_0.md), [monitoreo real original](../03%20Implementaci%C3%B3n/Sprint%204/evidencias/monitoreo-real-2h.json) y [anexo SUS simulado](../03%20Implementaci%C3%B3n/Sprint%204/08%20Anexo%20SUS%20simulado%20V_1_0_0.md).

### 2.3 Cronograma

{table(['Hito / entrega','Enfoque','Fecha planificada original','Fecha / evidencia real','Variación / impacto'],[
('H-01 Requerimientos','Predictivo','23/07/2026','Documentos de Inicio fechados 28/08; no hay acta de finalización de H-01.','No calculable con precisión; fecha de documento no prueba término del hito.'),
('H-02 Arquitectura/BD/mockups','Predictivo','13/08/2026','Artefactos de Planificación 04/09; actualizaciones técnicas posteriores.','No se inventa fecha de aceptación; incongruencia documental preservada.'),
('H-03 Desarrollo inicial','Adaptativo','17/09/2026','Integración técnica Sprints 1–3 registrada 18/11, commit d39d2e8.','Evidencia tardía de integración; no se usa como fecha individual de cada historia.'),
('H-04 Integración mapas/dashboard/PDF','Adaptativo','15/10/2026','PR #12/#13 integrados 19/11; correcciones 20–26/11.','+35 días hasta integración del 19/11; estabilización posterior.'),
('H-05 Pruebas y presentación','Híbrido','05/11/2026','Estabilización técnica 26/11; documentos 27/11; sustentación aún no acreditada.','+21/+22 días calendario; no se afirma que la exposición ya ocurrió.')])}

No se transforman los cortes simulados del EVM en fechas reales de aceptación. El SPI final de 1.0000 no cancela los retrasos del calendario original.

### 2.4 Costo

Presupuesto modelado de planificación: S/ 11467.50, techo del acta S/ 12850.00. Costo final real integral: **no determinable sin horas/comprobantes**. Costo final **simulado**: {money(now['AC'])}; CV {money(now['CV'])}; CPI {n(now['CPI'],4)}; 1220 h modeladas frente a 1200 h previstas. La mayor valorización de mano de obra se compensa en el escenario con servicios gratuitos y contingencia sin consumo. Render/Neon se autorizaron con límite S/ 0; no se contrataron recursos pagos en este trabajo. [EVM reproducible]({quote(names[2])}).

## 3. Resumen de Riesgos, Incidentes e Impedimentos

{table(['ID / descripción','Tipo','Impacto real observado','Respuesta aplicada / pendiente'],[
('RSK-01 / APIs y hosting gratuitos','Riesgo materializado parcialmente','Latencia y una muestra HTTP no disponible durante monitoreo.','Mediciones, manejo de errores y conservación del último resultado; monitoreo continuo por ampliar.'),
('RSK-02 / retraso','Riesgo materializado','Correcciones y despliegue posteriores al 05/11.','Priorización de integración y regresión; conservar desviación y preparar demo reproducible.'),
('RSK-03 / factores ambientales','Riesgo abierto','Parámetros actuales identificados como simulados.','Fuente y vigencia visibles, instantáneas históricas; validar factores reales antes de operar.'),
('RSK-04 / participantes','Impedimento de aceptación','Sin respuestas SUS humanas ni mood real.','Datos simulados autorizados y rotulados; piloto real pendiente.'),
('RSK-06 / acceso y datos','Riesgo mitigado en flujos probados','Sesión vencida y permisos podían confundir al usuario; acceso a reportes requiere rol.','Recuperación de sesión, autorización de servidor, PDF privado; no se declara certificación legal.'),
('RSK-07/11 / coherencia y trazabilidad','Incidente documental','Stack inicial distinto al real; SP discrepantes y capturas antiguas de Jira.','Versiones V_1_1_0 y matriz de fuentes; cierre formal Jira no verificado.'),
('INC-26-01 / listados','Defecto corregido','Solo primeros 12 vehículos/conductores visibles.','Recuperación de páginas y orden estable; regresión automatizada.'),
('INC-26-02 / último administrador','Defecto corregido','Posible pérdida de capacidad de administración.','Rechazo de eliminación/bloqueo/cambio de rol del último administrador activo.'),
('INC-26-03 / pedidos cerrados','Defecto corregido','Preferencias y formulario podían conservar estado editable incorrecto.','Bloqueo de cerrados en API/interfaz y actualización del estado al recargar.'),
('INC-26-04 / UTC-Lima en smoke test','Defecto de prueba corregido','CI programaba mañana usando UTC y rechazaba iniciar la ruta.','Fecha Lima en script; recorrido desechable y workflow repetidos con éxito.')])}

## 4. Evaluación del Éxito y Cierre

**Satisfacción de interesados:** no hay medición real de aceptación. SUS simulado 77.5 y feedback simulado no se convierten en aprobación. El equipo debe registrar una sesión real y las observaciones recibidas.

**Satisfacción y reconocimiento del equipo:** mood simulado final 4.2/5 (no opiniones reales). Se reconoce la contribución de los cinco roles documentados a planificación, implementación, calidad y comunicación, sin atribuir horas reales no registradas. La discusión de carga y reconocimiento se propone para la reunión de cierre.

**Transición operativa:** producto y configuración desplegados; guía de uso, instalación y recuperación disponibles. Responsabilidades propuestas: Jheferson, soporte técnico; Angela, experiencia/usuarios; Maylit, QA; Zayuri, aceptación y documentación; Diego, comunicaciones/seguimiento. La disponibilidad de soporte 30 días es una **propuesta**, no un compromiso confirmado.

**Cierre administrativo:** conservar versiones y evidencias; catalogar código; verificar accesos y respaldos; registrar aceptación, responsables y transferencia privada de credenciales; revisar recursos gratuitos; inventariar contratos y pagos si existieran. No hay acta firmada ni facturas finales aportadas; no se declara cierre contractual consumado.

**Conclusión:** producto técnicamente entregable en los flujos verificados, con documentación de cierre preparada. La aprobación de la entrega y el éxito global frente a metas originales requieren que los interesados conozcan y acepten las brechas registradas. [Guía de sustentación y transición](anexos/Guia%20de%20sustentacion%20y%20transicion.md).
''')

lessons=[
('Desempeño del equipo','Reparto de áreas y pruebas compartidas.','La concentración de integración aumenta presión; el mood disponible es simulado.','Revisar capacidad por sprint y acordar suplencia por módulo; PM verifica WIP semanal.'),
('Evolución y control del alcance','Diez historias trazables a requisitos.','SP y agrupaciones difieren entre Jira y documentos; 58/60 SP.','Versionar estimaciones, distinguir cambio de esfuerzo de cambio funcional y adjuntar exportación de backlog por corte.'),
('Cronograma híbrido','Combinar hitos predictivos con entregas funcionales.','El plan de ocho sprints no representa los cuatro incrementos documentados.','Mantener ambos calendarios, justificar variaciones y ligar cada hito a evidencia de aceptación; no reiniciar línea base para ocultar demora.'),
('Presupuesto y costos','Priorizar software abierto y servicios gratuitos con gasto autorizado cero.','Presupuesto académico no equivale a desembolso; faltan horas reales.','Registrar horas por rol y gastos respaldados; separar BAC, techo, contingencia, costo económico y caja.'),
('Técnicas de estimación','Descomposición por historias y criterios concretos.','No hay velocidad comparable con iteraciones desiguales ni historial suficiente.','Usar rangos y capacidad observada; no convertir SP/commits en horas. Reestimar tras integrar datos, roles y despliegue.'),
('Aseguramiento de calidad','Regresiones en base real y tres navegadores; CI/CD antes del despliegue.','Pruebas positivas no cubrían límites de listado, último administrador y estados terminales.','Añadir casos de frontera y permisos a la DoD; ensayar después de 19:00 Lima para detectar UTC al día siguiente.'),
('Involucramiento de interesados','Documentar límites y distinguir mediciones de simulaciones.','Piloto y SUS real se pospusieron; no hay aceptación humana demostrada.','Programar cinco participantes desde planificación y obtener consentimiento y respuestas antes del cierre; no reemplazar satisfacción con E2E.'),
('Riesgos, incidentes e impedimentos','Registro explícito y respuestas de seguridad, datos e infraestructura.','Dependencia de servicios gratuitos y evidencias históricas sin corte.','Asignar propietario, disparador, acción y prueba de eficacia; revisar riesgos en cada review y al transferir operación.')]
write(6,'Reporte Final de Lecciones Aprendidas (Final Lessons Learned Report)',f'''
**Fecha de consolidación:** 27/11/2026. **Fecha de reunión de cierre:** no se acredita una reunión realizada; se propone usar este documento como agenda y registrar después asistentes/acuerdos reales. Las recomendaciones son una síntesis analítica del repositorio y de los incidentes comprobados.

## 1. Matriz Consolidada de Aprendizajes

{table(['Categoría de gestión','Prácticas efectivas: qué mantener','Oportunidades: qué evitar/ajustar','Recomendación para futuros equipos'],lessons)}

## 2. Conclusiones de la Retrospectiva de Cierre

La principal lección es validar **el recorrido completo**, no solo módulos aislados. Un pedido debe persistir, asignarse, llegar al repartidor, terminar su entrega, confirmar regreso y alimentar el mismo cálculo del dashboard/PDF. La aceptación sobre PostgreSQL y en el despliegue detectó problemas que no se observaban en pruebas de funciones individuales.

El incidente del script con UTC mostró que las pruebas también son software: el servidor rechazó correctamente una ruta programada para otra fecha. La corrección fue alinear el reloj del caso de aceptación con Lima, no quitar la regla de negocio.

La gestión financiera debe iniciar con una regla de medición: este cierre puede reproducir un EVM simulado matemáticamente coherente, pero no recuperar horas reales que nunca se registraron. El próximo equipo debe guardar parte de trabajo y fuente del costo desde el primer sprint.

Una versión funcional no demuestra por sí sola satisfacción, ahorro ambiental real ni SLA mensual. Los cinco casos SUS y el mood permiten ejercitar el análisis, con su etiqueta simulada; la validación con personas se planifica anticipadamente y se conserva sin atribuciones inventadas.

### Acciones propuestas para la transferencia

{table(['Acción','Responsable propuesto','Criterio observable'],[
('Registrar aceptación y brechas conocidas antes de declarar cierre administrativo.','Zayuri / PM','Acta real con participantes, fecha, decisiones y responsables.'),
('Conservar copia del código, instrucciones y configuración sin secretos.','Jheferson / técnico','Repositorio navegable y recuperación ensayada en ambiente desechable.'),
('Organizar prueba con usuarios y factores reales cuando se pase del demo a operación.','Angela / producto','Respuestas reales separadas del dataset simulado; fuentes ambientales identificadas.'),
('Verificar enlaces, pruebas y monitorización antes de sustentar.','Maylit / QA','Validador documental y CI aprobados; ventana de monitoreo y sus límites visibles.'),
('Comunicar acceso, soporte y pendientes a quienes recibirán el sistema.','Diego / comunicaciones','Guía compartida; credenciales por canal privado; soporte aceptado expresamente.')])}

No se atribuye la aprobación de estas acciones a una reunión no documentada. Se conservan las [retrospectivas del Sprint 4](../03%20Implementaci%C3%B3n/Sprint%204/02%20Retrospectiva%20del%20Sprint%20V_1_0_0.md) y el [registro de riesgos](../02%20Planificaci%C3%B3n/03%20Registro%20de%20riesgos%20V_1_0_0.md) como antecedentes para la discusión.
''')
print('Siete reportes de cierre generados; datos financieros y de ánimo explícitamente simulados.')
