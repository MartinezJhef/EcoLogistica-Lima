"""Reconcile closure reports with the Jira UI actually observed on 27 Nov.

Run after the base closure generators. This does not call or modify Jira.
"""
from pathlib import Path
from urllib.parse import quote
import json
import re

ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'docs/04 Cierre'
EV=OUT/'evidencias'
BACK='[← Volver al README principal](../../../README.md)'
def write(path,text):
    path.parent.mkdir(parents=True,exist_ok=True)
    path.write_text('\n'.join(line.rstrip() for line in text.strip().splitlines())+'\n',encoding='utf-8')
def table(head,rows):return '\n'.join(['| '+' | '.join(head)+' |','|'+'|'.join(['---']*len(head))+'|']+['| '+' | '.join(map(str,row))+' |' for row in rows])
data=json.loads((EV/'jira-subtareas-observadas-27nov.json').read_text(encoding='utf-8'))
children=[]
for parent,rows in data['historias'].items():
    for row in rows:
        lines=[x.strip() for x in row['text'].splitlines() if x.strip() and x.strip()!='Copiar enlace']
        if not lines or not re.fullmatch(r'ANA-\d+',lines[0]):continue
        children.append(dict(parent=parent,key=lines[0],summary=lines[1],status=row['status'][0].replace(' - Cambiar estado',''),assignee=lines[-2]))
assert len(children)==73
pending=[r for r in children if r['status']!='Listo']
assert len(pending)==40
stories=[('ANA-9','US-001',1,5,'Listo',8,8),('ANA-6','US-002',1,5,'Listo',9,9),
 ('ANA-7','US-003',2,8,'Listo',9,9),('ANA-8','US-004',2,5,'Listo',8,9),
 ('ANA-10','US-005',3,13,'Listo',10,12),('ANA-11','US-006',3,8,'Listo',9,10),
 ('ANA-12','US-007',3,8,'Listo',6,11),('ANA-13','US-008',4,5,'En curso',0,11),
 ('ANA-14','US-009',4,5,'En curso',0,10),('ANA-15','US-010',4,5,'En curso',0,10)]
snapshot=dict(tipo='OBSERVACION_REAL_JIRA',fecha_Lima='2026-11-27',
 source='Interfaz autenticada: backlog, tablero, tablas de subtareas e informes oficiales',
 url='https://continental-team-yg5bc6tv.atlassian.net/jira/software/projects/ANA/boards/2',
 modificaciones='Solo pestaña Informes añadida con autorización explícita; columnas, estados y asignaciones no modificados.',
 historias=[dict(key=a,us=b,sprint=c,SP=d,status=e,subtasks_done=f,subtasks_total=g) for a,b,c,d,e,f,g in stories],
 SP_historia=67,SP_en_Listo=52,SP_en_curso=15,subtareas_totales=99,subtareas_Listo=59,subtareas_pendientes=40,
 proyecto_total_actividades=123,proyecto_estados={'Listo':66,'Por hacer':54,'En curso':3},
 proyecto_sin_asignar=48,subtareas_inspeccionadas=73,pendientes=pending,
 sprint4_informe={'periodo':'11/11/2026–27/11/2026','puntos_completados':0,'puntos_restantes':15},
 advertencia='Listo en backlog no basta para certificar cierre formal. Los cuatro sprints muestran Completar sprint; el informe de Sprint 1 muestra 0% aunque sus historias figuren Listo. No se modificó el mapeo de columnas.')
write(EV/'jira-corte-real-27nov.json',json.dumps(snapshot,ensure_ascii=False,indent=2))

notice='''> **Actualización con Jira real, 27/11/2026.** Las diez historias suman **67 SP**: siete en Listo (52 SP) y tres En curso (15 SP). Hay **40 subtareas abiertas**: 9 heredadas y 31 de Sprint 4. Los cuatro sprints siguen mostrando «Completar sprint». El escenario de 60 SP y el EVM del primer paquete continúan siendo **simulados**, no un reflejo del cierre formal de Jira. [Corte real y pendientes exactos](anexos/Conciliacion%20real%20de%20Jira%2027nov.md).
'''
for report in sorted(OUT.glob('0*.md')):
    text=report.read_text(encoding='utf-8')
    text=text.replace('EVM, evolución de radiadores y ánimo:', 'EVM, curvas complementarias y ánimo:')
    text=text.replace('evidencia Jira antigua', 'estados y subtareas pendientes en Jira')
    text=re.sub(r'> \*\*Actualización con Jira real, 27/11/2026\.\*\*.*?\n\n','',text,flags=re.S)
    before,body=text.split('\n## ',1)
    text=before+'\n'+notice+'\n## '+body
    if report.name.startswith('01 '):
        text=text.replace('aceptación humana, mood real y conciliación actual de Jira.','aceptación humana, mood real y regularización de los estados/subtareas de Jira.')
    if report.name.startswith('03 '):
        text=text.replace('**BAC:**','**El EV de 100% corresponde solo al escenario financiero; el Jira real no está cerrado.**\n\n**BAC:**',1) if '**El EV de 100%' not in text else text
    if report.name.startswith('04 '):
        start=text.index('### 3.2 Flujo Acumulado / Áreas Apiladas')
        end=text.index('### 3.3 Relación',start)
        text=text[:start]+'''### 3.2 Flujo Acumulado / Áreas Apiladas: evidencia real

![Flujo acumulado oficial Jira, consulta 27/11](evidencias/jira-flujo-acumulado-real-27nov.jpg)

Filtro visible: 01/09/2026–27/11/2026. La gráfica usa **recuento de actividades**, no Story Points, e incluye tipos distintos de historia. La banda de Por hacer domina y las resoluciones se concentran al final del historial visible. La vista de informes resume 123 actividades: 66 Listo, 54 Por hacer y 3 En curso; no se mezclan con las diez historias (67 SP). La reconstrucción simulada anterior se conserva como material de cálculo y no reemplaza esta evidencia real.

'''+text[end:]
    if report.name.startswith('06 '):
        text=text.replace('Los cuatro incrementos consolidados suman 60 SP, frente a 58 iniciales por la reestimación de US-004.', 'El escenario documental previo suma 60 SP frente a 58 iniciales; el corte real actual de Jira suma 67 SP, según la conciliación adjunta.')
        text=text.replace('El 100% funcional implementado no equivale al 100% de todos los criterios no funcionales o de aceptación humana.', 'La cobertura técnica verificada no acredita por sí sola todos los criterios no funcionales, pendientes de Jira o de aceptación humana.')
        text=text.replace('evidencia actual de Jira antigua','evidencia de Jira actualizada')
        text=text.replace('cierre formal Jira no verificado.','corte Jira real: cuatro sprints con cierre pendiente y 40 subtareas abiertas.')
    write(report,text)

rows_table=table(['Historia Jira','US','Sprint','SP','Estado','Subtareas Listo / total'],[(f'[{a}](https://continental-team-yg5bc6tv.atlassian.net/browse/{a})',b,c,d,e,f'{f}/{g}') for a,b,c,d,e,f,g in stories])
actions={
 'ANA-82':'Cotejar integración de preferencias con planificación/reoptimización y adjuntar la regresión de preferencias antes de actualizar el estado.',
 'ANA-36':'Adjuntar pruebas de ventanas horarias y planificación; verificar resultados de integración antes de cerrar.',
 'ANA-86':'Adjuntar evidencia del cálculo de distancia, tiempo y CO₂ de ruta.',
 'ANA-54':'Verificar representación de incidencias/tráfico configurado; no afirmar cobertura de tráfico en vivo si no existe proveedor real.',
 'ANA-48':'Adjuntar recepción/confirmación del itinerario por conductor.',
 'ANA-94':'Aclarar que la notificación implementada es itinerario persistido y consulta/confirmación; no prometer push Firebase.',
 'ANA-95':'Adjuntar pruebas de cola, confirmación y reintento.',
 'ANA-96':'Adjuntar prueba móvil de conservación del último itinerario sin conexión.',
 'ANA-97':'Adjuntar regresión de redistribución por avería.',
 'ANA-99':'Verificar que el criterio de ahorro monetario esté cubierto; diferenciar costo estimado, variación porcentual y ahorro absoluto.',
 'ANA-106':'Cotejar procesamiento asíncrono de PDF y límites de volumen con pruebas; no inferir capacidad ilimitada.',
 'ANA-107':'Completar título y criterio: actualmente solo dice SUB-009-08; no cerrar una actividad sin alcance identificable.'}
pending_rows=[]
for item in pending:
    action=actions.get(item['key'],'Vincular implementación, prueba o documentación al criterio de esta subtarea; actualizar estado solo si se acredita su cumplimiento técnico.')
    pending_rows.append((f'[{item["key"]}](https://continental-team-yg5bc6tv.atlassian.net/browse/{item["key"]})',item['parent'],item['summary'],item['assignee'],action))
write(OUT/'anexos/Conciliacion real de Jira 27nov.md',f'''
{BACK}

# Conciliación real de Jira y GitHub

**Consulta:** 27/11/2026. **Proyecto Jira:** ANA, nombre visible «Proyecto Ecologistica Huancayo»; repositorio/aplicación: EcoLogística Lima. No se cambió el nombre ni las columnas. Se añadió únicamente la pestaña Informes con autorización expresa del usuario.

## 1. Estado real de las diez historias

{rows_table}

Total **67 SP**: 52 en historias con estado Listo y 15 En curso. Subtareas: **59 Listo / 99 totales**; pendientes 40. Este recuento no incluye como subtareas las siete épicas ni los siete enablers del backlog.

Los cuatro sprints muestran el botón «Completar sprint», por lo que no se declaran cerrados formalmente. Sprint 1: 15 sep–2 oct; Sprint 2: 3–10 oct; Sprint 3: 12 oct–7 nov; Sprint 4: 11–27 nov. Se transcriben los periodos visibles, sin inventar fechas de cierre administrativo.

## 2. Diferencia de puntos frente a documentos previos

Backlog original: 58 SP; escenario documental conciliado: 60 SP; **Jira consultado: 67 SP**. Las diferencias entre 60 y 67 son US-002 (3→5), US-003 (5→8) y US-009 (3→5). El cambio previo de US-004 (3→5) explica 58→60. No se alteran puntos en Jira para hacer coincidir una simulación.

El EVM conserva BAC y costos simulados independientes de esos SP; no se cambia EV automáticamente con la proporción 52/67 ni se convierten puntos a dinero sin pesos presupuestados aprobados.

## 3. Evidencias auténticas del corte

![Sprints 1 y 2](../evidencias/jira-backlog-sprints-1-2-27nov.jpg)

![Sprints 3 y 4](../evidencias/jira-backlog-sprints-3-4-27nov.jpg)

![Sprint 4 actual](../evidencias/jira-backlog-sprint-4-27nov.jpg)

![Kanban actual](../evidencias/jira-kanban-27nov.jpg)

El tablero muestra Por hacer 0, En curso 3, Listo 7, In Review 0 al filtrar todos los sprints. El informe de Sprint 1 muestra 0% finalizado pese a que sus historias figuran Listo: se debe revisar la interpretación/mapeo de finalización. Se conserva la instrucción de no cambiar las columnas y no se atribuye la causa a un componente no inspeccionado.

## 4. Pendientes heredados concretos

Sprint 1: no se observaron subtareas abiertas de sus dos historias. Sprint 2: ANA-82. Sprint 3: ANA-36, ANA-86, ANA-54, ANA-48, ANA-94, ANA-95, ANA-96 y ANA-97. Las historias principales pueden figurar Listo aunque sus subtareas sigan Por hacer.

## 5. Lista completa de subtareas abiertas y acción

{table(['Actividad','Historia','Qué figura pendiente','Responsable visible','Acción concreta'],pending_rows)}

No se actualizaron estados ni responsables en este corte: completar un informe no es evidencia suficiente para marcar indiscriminadamente todas las tareas Listo. Los cambios de estado deben acompañarse de su evidencia técnica y respetar la aceptación requerida.

## 6. Resumen total del proyecto

El panel de Informes muestra **123 actividades**: 99 subtareas, 10 historias, 7 épicas y 7 tareas. Estados globales: 66 Listo, 54 Por hacer y 3 En curso. Sin asignar: 48. Estos totales incluyen trabajo distinto de las diez historias y no se presentan como 123 historias.

[Datos estructurados del corte](../evidencias/jira-corte-real-27nov.json). La tabla cruda de subtareas conserva solo texto visible del trabajo y no contiene tokens, correos de sesión ni identificadores de autenticación.

{BACK}
''')

report5=OUT/'05 Radiadores de Información V_1_0_0.md'
write(report5,f'''
[← Volver al README principal](../../README.md)

# Radiadores de Información (Information Radiators)

**Proyecto:** EcoLogística Lima · **Corte:** 27/11/2026 · **Versión de entrega:** 1.0.0, revisión de evidencias 2. **Marco:** Scrum con gobierno predictivo.

## 1. Burndown Chart: captura real del Sprint 4

![Burndown oficial Jira](evidencias/jira-burndown-oficial-sprint-4-27nov.jpg)

[Selector de Sprint 4 y fechas del informe](evidencias/jira-burndown-encabezado-sprint-4-27nov.jpg).

Informe oficial, Sprint ANA Sprint 4, 11–27 noviembre, unidad Puntos de historia. La línea de trabajo restante permanece en 15 frente a la guía descendente a cero. Jira no ha registrado puntos terminados del sprint, aunque haya implementación en GitHub. La velocidad de cierre registrada es cero, no la velocidad de desarrollo ni el resultado de las pruebas.

## 2. Burnup Chart: captura real del Sprint 4

![Burnup oficial Jira](evidencias/jira-burnup-oficial-sprint-4-27nov.jpg)

[Selector de Sprint 4 y fechas del informe](evidencias/jira-burnup-encabezado-sprint-4-27nov.jpg).

Alcance de 15 SP; completados registrados 0. La tabla de eventos muestra el inicio del sprint el 11/11/2026 con ANA-13, ANA-14 y ANA-15, sin incremento posterior acreditado en ese informe. No se infiere que el código no exista: el gráfico refleja el registro de Jira. No se alteraron estados para producir una gráfica favorable.

## 3. Task Board / Kanban y flujo acumulado reales

![Kanban real](evidencias/jira-kanban-27nov.jpg)

Todos los sprints: 7 historias en Listo y 3 En curso; las tres del Sprint 4 no tienen responsable. Las columnas se conservaron sin cambios. El cuello de botella de gestión es la regularización de evidencias y subtareas antes del cierre: hay 40 subtareas abiertas, nueve heredadas. Una historia en Listo no elimina pendientes de sus hijos.

![Flujo acumulado oficial](evidencias/jira-flujo-acumulado-real-27nov.jpg)

Filtro visible: 01/09–27/11/2026. Unidad: número de actividades de varios tipos; no SP ni solo historias. Predomina Por hacer y las resoluciones se concentran en el tramo final del historial visible. El panel global contiene 123 actividades, mientras la lista de historias tiene 10; no son denominadores intercambiables.

## 4. Mood Chart del equipo: resultados simulados autorizados

![Mood simulado](evidencias/mood-simulado.png)

| Integrante / rol de referencia | Sprint 1 | Sprint 2 | Sprint 3 | Sprint 4 |
|---|---|---|---|---|
| Zayuri / dirección | 4 | 3 | 3 | 4 |
| Jheferson / técnico | 4 | 3 | 2 | 4 |
| Angela / producto e interfaz | 4 | 4 | 3 | 5 |
| Maylit / calidad | 3 | 3 | 2 | 4 |
| Diego / comunicaciones | 4 | 3 | 3 | 4 |

Escala 1–5. Media final simulada 4.2; media simulada de Sprint 3 2.6. No son respuestas recogidas de las personas nombradas. La simulación permite analizar presión de integración y recuperación al estabilizar pruebas; no acredita satisfacción real.

## 5. Retrospectiva: síntesis del expediente

![Tablero de retrospectiva reconstruido](evidencias/retrospectiva-reconstruida.png)

La figura reconstruye la [retrospectiva versionada del Sprint 4](../03%20Implementaci%C3%B3n/Sprint%204/02%20Retrospectiva%20del%20Sprint%20V_1_0_0.md); no es fotografía de una reunión. Mantener: lógica compartida, permisos y pruebas en base real. Mejorar: coordinación de aceptación, carga y evidencia de gestión. Acciones técnicas ya verificadas: fecha Lima, CI/CD y regresiones. La discusión y aceptación por participantes debe registrarse cuando ocurra.

## 6. Trazabilidad y material complementario

[Corte real con pendientes exactos](anexos/Conciliacion%20real%20de%20Jira%2027nov.md) y [datos observados](evidencias/jira-corte-real-27nov.json). Las antiguas curvas de 60 SP se conservan como **escenario simulado** en [CSV](evidencias/radiadores-simulados.csv), no como exportación de Jira. El estado real consultado suma 67 SP.

Se completa así la evidencia gráfica real disponible. Mood, horas y costos mantienen su condición simulada autorizada; la simulación no convierte una reunión propuesta en reunión realizada ni cambia los criterios de evidencia real del docente.

[← Volver al README principal](../../README.md)
''')

# Version the backlog reconciliation instead of rewriting the earlier 60-SP view.
write(ROOT/'docs/02 Planificación/01 Transformando a ágil V_1_2_0.md',f'''
[← Volver al README principal](../../README.md)

# Backlog conciliado con Jira V_1_2_0

**Proyecto:** EcoLogística Lima · **Fecha de consulta:** 27/11/2026. Antecedentes conservados: [V_1_0_0](01%20Transformando%20a%20%C3%A1gil%20V_1_0_0.md) y [V_1_1_0](01%20Transformando%20a%20%C3%A1gil%20V_1_1_0.md).

{rows_table}

**Total real consultado: 67 SP; 52 en historias Listo y 15 En curso.** Los 58 SP originales y 60 de la conciliación textual anterior se mantienen como historia documental y escenario simulado, no como estimación actual del tablero.

Diferencias frente a 60: US-002 +2, US-003 +3 y US-009 +2. Los cuatro sprints conservan cierre pendiente. No se alteran puntos, columnas, estados ni responsables para hacer coincidir los datos. Las diez historias tienen implementación técnica; esto no certifica su cierre administrativo ni el de todas sus subtareas.

La [conciliación completa](../04%20Cierre/anexos/Conciliacion%20real%20de%20Jira%2027nov.md) incluye capturas y las 40 subtareas abiertas.

## Historial

| Versión | Fecha | Motivo |
|---|---|---|
| 1.0.0 | Planificación inicial | Backlog textual 58 SP. |
| 1.1.0 | 27/11/2026 | Conciliación textual 60 SP antes de nueva consulta autenticada. |
| 1.2.0 | 27/11/2026 | Consulta real Jira: 67 SP y estados/subtareas actuales, sin modificar estimaciones. |

[← Volver al README principal](../../README.md)
''')

# Record actual delivery checks without inventing acceptance or signatures.
write(OUT/'anexos/Registro de entrega y transicion.md',f'''
{BACK}

# Registro de entrega y transición documental

**Proyecto:** EcoLogística Lima · **Fecha:** 27/11/2026 · **Tipo:** registro de preparación y verificación, no acta firmada por terceros.

## Entrega preparada

| Elemento | Resultado verificable |
|---|---|
| Documentos | Siete informes Markdown con nombres requeridos, gráficos, datos y enlaces de retorno. |
| Estado técnico | Web/API y móvil verificados; CI del commit documental 87183c6 aprobado y despliegue exitoso. |
| Radiadores | Capturas reales del 27/11 de backlog, Kanban, burnup, burndown y flujo acumulado. |
| Datos de gestión | Horas, AC, EVM y mood simulados, identificados y reproducibles. |
| Código y arquitectura | Frontend/backend/móvil separados; stack conciliado con el código. |
| Seguridad de la entrega | Dependencias, entornos y credenciales privadas excluidos del archivo y del repositorio. |
| Transferencia | Manual de uso y despliegue, guía de demo, fuentes y scripts de validación incluidos. |
| Respaldo | Copia ZIP de archivos versionados; no contiene respaldo de datos privados de producción. |
| Contratos/facturas | No se aportaron contratos ni libro contable completo; no se declara liquidación o pago inexistente. |
| Video | Fuera del encargo por instrucción explícita. |

## Condiciones que recibe el equipo

Jira mantiene 40 subtareas abiertas y cuatro sprints sin cierre formal; el Sprint 4 muestra 15 SP en curso. Esto se entrega como hallazgo real, no como proyecto administrativamente aprobado. El equipo cuenta con la lista exacta de tareas para decidir y registrar los cambios soportados por evidencia.

Las pruebas automáticas no sustituyen evaluación humana de satisfacción. La reunión de cierre, las firmas y la sustentación no se atribuyen a nadie sin constancia. La consigna no exige un archivo de firmas adicional: este registro documenta la transición preparada sin convertir esa formalidad no aportada en un resultado ficticio.

## Operación y soporte propuestos

Zayuri coordina recepción documental; Jheferson transferencia técnica; Angela capacitación/usuarios; Maylit comprobaciones; Diego comunicaciones. Son responsables propuestos según roles previos, no compromisos nuevos atribuidos a una reunión. Soporte inicial de 30 días sujeto a acuerdo del equipo. Credenciales por canal privado; no se incluyen aquí.

## Revisión previa a sustentar

1. Abrir la URL pública y verificar que despierten los servicios gratuitos.
2. Usar el periodo con operaciones de prueba conocidas para dashboard/PDF.
3. Ensayar la guía de 10 minutos de gestión y 10 minutos de demostración.
4. Explicar qué es real, simulado y pendiente de aceptación, sin presentar gráficos favorables inventados.

{BACK}
''')

matrix=OUT/'anexos/Matriz de entregables y evidencias.md'
text=matrix.read_text(encoding='utf-8').replace('Curvas/mood simulados; tablero real histórico; retro reconstruida. No son nuevas capturas reales de ejecución.','Burnup, burndown, Kanban y flujo acumulado reales del 27/11; mood simulado; retro reconstruida.')
text=text.replace('Acta, presupuesto, backlog y stack V_1_1_0','Acta, presupuesto y stack V_1_1_0; backlog V_1_2_0 con Jira real')
extra='[Conciliación real de Jira](Conciliacion%20real%20de%20Jira%2027nov.md) · [Registro de entrega y transición](Registro%20de%20entrega%20y%20transicion.md).'
if extra not in text:text+='\n\n'+extra+'\n'
regen='Para regenerar el paquete completo, ejecutar en orden: `build_closure_figures.py`, `build_closure_documents.py`, `build_closure_addenda.py` y finalmente `complete_closure_evidence.py`, todos en `scripts/`. El último paso incorpora el corte real de Jira conservado y evita sustituirlo por el escenario simulado. Después ejecutar `python scripts/verify_closure.py`.'
if regen not in text:text+='\n\n'+regen+'\n'
write(matrix,text)
readme=ROOT/'README.md';text=readme.read_text(encoding='utf-8')
text=text.replace('docs/02%20Planificaci%C3%B3n/01%20Transformando%20a%20%C3%A1gil%20V_1_1_0.md','docs/02%20Planificaci%C3%B3n/01%20Transformando%20a%20%C3%A1gil%20V_1_2_0.md')
text=text.replace('[01 Transformando a ágil V_1_1_0.md]','[01 Transformando a ágil V_1_2_0.md]')
text=text.replace('[Transformando a ágil V_1_1_0.md]','[Transformando a ágil V_1_2_0.md]')
text=text.replace('horas, costos, EVM y radiadores simulados', 'horas, costos, EVM y ánimo simulados')
marker='### Evidencias actuales del cierre, 27/11/2026'
if marker not in text:
    text+='''

### Evidencias actuales del cierre, 27/11/2026

[Jira real: capturas, puntos y pendientes exactos](docs/04%20Cierre/anexos/Conciliacion%20real%20de%20Jira%2027nov.md) · [Entrega y transición](docs/04%20Cierre/anexos/Registro%20de%20entrega%20y%20transicion.md).

Los radiadores principales usan las capturas oficiales del 27/11. Jira registra 67 SP, con 52 en historias Listo y 15 En curso; quedan 40 subtareas abiertas. El escenario EVM y de ánimo autorizado sigue identificado como simulado. No se declara aceptación administrativa por tener CI aprobado.
'''
write(readme,text)
print('Evidencias reales incorporadas: 67 SP, 40 subtareas abiertas; sin alterar estados ni columnas.')
