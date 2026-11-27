"""Apply the final observed Jira closure without overwriting its initial audit."""
from pathlib import Path
from urllib.parse import quote
import json
import re

ROOT=Path(__file__).resolve().parents[1]
CLOSE=ROOT/'docs/04 Cierre'
EV=CLOSE/'evidencias'
cut=json.loads((EV/'jira-cierre-final-27nov.json').read_text(encoding='utf-8'))
assert cut['subtareas_Listo']==99 and cut['sprints_cerrados']==[1,2,3,4]
BACK='[← Volver al README principal](../../../README.md)'
DEST='anexos/Estado%20final%20del%20cierre%20Jira.md'
notice=f'> **Cierre real de Jira, 27/11/2026.** Sprints **1–4 cerrados**, diez historias en Listo (**67 SP**), **99/99 subtareas** y siete épicas en Listo. Se regularizaron las 40 subtareas del corte inicial. Seguridad, vista de conductor y documentación también están en Listo. El proyecto completo registra **119/123 actividades terminadas**; siguen abiertas cuatro validaciones no funcionales. Horas, costos, EVM, mood y SUS autorizados conservan su naturaleza simulada. [Estado final y límites de aceptación]({DEST}).'

def write(path,text):
    path.parent.mkdir(parents=True,exist_ok=True)
    path.write_text('\n'.join(line.rstrip() for line in text.strip().splitlines())+'\n',encoding='utf-8')

for p in CLOSE.glob('0*.md'):
    text=p.read_text(encoding='utf-8')
    text=re.sub(r'> \*\*(?:Actualización con Jira real, 27/11/2026\.|Cierre real de Jira, 27/11/2026\.).*?\n\n','',text,flags=re.S)
    before,body=text.split('\n## ',1)
    text=before.rstrip()+'\n\n'+notice+'\n\n## '+body
    text=text.replace('evidencia técnica real al 26/11/2026','evidencia técnica real, actualizada al 27/11/2026')
    text=text.replace('226 pruebas web; 102 pruebas backend más una integración PostGIS','229 pruebas web; 103 pruebas backend más la integración PostGIS de CI')
    text=text.replace('226 web + 103 backend/PostGIS','229 web + 103 backend y PostGIS en CI')
    text=text.replace('workflows aprobados al 26/11','workflows aprobados al 27/11')
    text=text.replace('[Evidencia técnica](evidencias/validacion-tecnica.json)','[CI y despliegue del último cambio funcional](evidencias/validacion-tecnica-cierre-27nov.json)')
    text=text.replace('regularización de los estados/subtareas de Jira','validaciones no funcionales pendientes fuera de los sprints')
    text=text.replace('estados y subtareas pendientes en Jira','cuatro validaciones no funcionales aún abiertas en Jira')
    text=text.replace('**El EV de 100% corresponde solo al escenario financiero; el Jira real no está cerrado.**','**El EV de 100% corresponde solo al escenario financiero; el cierre de los sprints no acredita las cuatro validaciones no funcionales restantes.**')
    text=text.replace('corte Jira real: cuatro sprints con cierre pendiente y 40 subtareas abiertas.','corte Jira final: cuatro sprints cerrados y 99 subtareas terminadas; cuatro enablers no funcionales siguen abiertos.')
    if p.name.startswith('04 '):
        start=text.index('### 3.2 Flujo Acumulado')
        end=text.index('### 3.3 Relación',start)
        text=text[:start]+'''### 3.2 Flujo Acumulado / Áreas Apiladas: evidencia final real

![Flujo acumulado de cierre](evidencias/jira-flujo-acumulado-cierre-final-27nov.jpg)

Filtro visible: 01/09/2026–27/11/2026. Unidad: recuento de actividades, no Story Points. El aumento final de Listo corresponde a la regularización de estados realizada el 27/11 y no permite reconstruir fechas históricas de desarrollo. De 123 actividades, 119 están Listo y cuatro Por hacer. Las diez historias suman 67 SP; sus 99 subtareas están terminadas. Se conservan el corte inicial y las curvas simuladas como antecedentes identificados.

'''+text[end:]
    write(p,text)

p=CLOSE/'05 Radiadores de Información V_1_0_0.md'
text=p.read_text(encoding='utf-8')
start=text.index('## 1. Burndown')
end=text.index('## 4. Mood')
text=text[:start]+'''## 1. Burndown Chart: Sprint 4 cerrado

![Burndown final de Jira](evidencias/jira-burndown-sprint-4-cerrado-27nov.jpg)

Alcance 15 SP; trabajo restante **0** al cierre del 27/11. La caída final registra cuándo se actualizaron las historias en Jira; no demuestra que todo el desarrollo ocurriera ese día. Se conserva la captura inicial con 15 pendientes para trazabilidad.

## 2. Burnup Chart: Sprint 4 cerrado

![Burnup final de Jira](evidencias/jira-burnup-sprint-4-cerrado-27nov.jpg)

Completados **15/15 SP**, sin aumento del alcance. Las tablas oficiales registran «Sprint completado» para los cuatro sprints: 10/10, 13/13, 29/29 y 15/15 SP. [Eventos originales transcritos de Jira](evidencias/jira-sprints-cerrados-27nov.json). Las fechas de cierre administrativo del 27/11 se conservan; no se retrocedieron a las fechas previstas.

## 3. Kanban y flujo acumulado reales

![Tablero regularizado antes de terminar los sprints](evidencias/jira-kanban-regularizado-27nov.jpg)

La captura muestra las diez historias en Listo antes de terminar los sprints. Orden publicado con autorización expresa: Por hacer → En curso → In Review → Listo. Al quedar Listo al final, Jira pudo cerrar los sprints sin trasladar historias al backlog. Después del cierre, el tablero de sprints activos puede aparecer vacío: los elementos permanecen en los informes y el historial.

![Flujo acumulado final](evidencias/jira-flujo-acumulado-cierre-final-27nov.jpg)

Recuento de 123 actividades de distintos tipos: 119 Listo y cuatro validaciones generales Por hacer. No se presentan como 123 historias. Las 99 subtareas funcionales y siete épicas están terminadas.

'''+text[end:]
text=text.replace('El estado real consultado suma 67 SP.','El corte inicial sumaba 67 SP; el corte final conserva esos puntos y cierra sus cuatro sprints.')
write(p,text)

pending=[
 ('ANA-21','Rendimiento RNF-001','Acreditar una solución válida con 150 pedidos/15 vehículos en ≤45 s y reoptimización ≤30 s, incluyendo las condiciones del proveedor vial. Las regresiones funcionales no equivalen a esta prueba máxima.'),
 ('ANA-26','Accesibilidad RNF-003','Completar auditoría de criterios WCAG 2.1 AA aplicables en las pantallas principales, incluyendo teclado, foco, contraste y comprensión. Las pruebas de controles actuales no certifican el estándar completo.'),
 ('ANA-29','Capacidad RNF-004','Ejecutar y conservar una prueba reproducible de 1.000 pedidos diarios y 50 vehículos con registro, consulta y funciones esenciales, comprobando integridad y límites del entorno.'),
 ('ANA-39','Disponibilidad RNF-006','Acreditar ≥99.5% mensual entre 05:00 y 22:00 y recuperación íntegra. El monitoreo real de dos horas (239/240 muestras) no cubre un mes; no se puede completar ese periodo retroactivamente.')]
rows='\n'.join(f'| [{key}](https://continental-team-yg5bc6tv.atlassian.net/browse/{key}) | {name} | {action} |' for key,name,action in pending)
write(CLOSE/'anexos/Estado final del cierre Jira.md',f'''
{BACK}

# Estado final del cierre de Jira

**Corte final:** 27/11/2026. Fuente: interfaz autenticada de ANA. Se conservaron los cortes anteriores.

## Cambios realizados y verificados

- Se completó el ahorro monetario absoluto en API, panel Sostenibilidad y PDF, con distinción entre ahorro, incremento y datos faltantes.
- Se aclaró ANA-107 como notificación con enlace de descarga, con criterio y evidencia, tras autorización específica.
- Se pasaron a Listo las 40 subtareas inicialmente abiertas y las historias ANA-13, ANA-14 y ANA-15.
- Quedaron **10/10 historias, 99/99 subtareas y 7/7 épicas en Listo**.
- Se publicó exclusivamente el orden de columnas autorizado: Por hacer → En curso → In Review → Listo.
- Se cerraron los Sprints 1–4 sin trasladar trabajo al backlog: **10 + 13 + 29 + 15 = 67 SP**.
- Se registró evidencia y se cerraron ANA-25 (seguridad), ANA-37 (vista del conductor) y ANA-40 (documentación), con autorización específica.
- No se crearon cuentas Confluence ni retrospectivas ficticias al completar los sprints. El Sprint 5 observado queda como borrador vacío, sin iniciarse ni atribuirle trabajo.

## Resultado técnico publicado

Commit funcional `6ef087e`: regresión local de **103 pruebas backend, 229 frontend y cobertura backend 86.34%**. PostGIS, E2E, Android, auditoría Green IT y despliegue aprobaron en CI. [Resultados de GitHub](../evidencias/validacion-tecnica-cierre-27nov.json).

[Aplicación pública](https://ecologistica-web.onrender.com) · [API y Swagger](https://ecologistica-api.onrender.com/docs).

## Cuatro actividades generales todavía abiertas

**119/123 actividades Listo**, cuatro Por hacer, ninguna En curso. Los sprints funcionales cerrados no acreditan por sí solos todos los requisitos de calidad.

| Jira | Requisito | Evidencia que falta para declarar cumplimiento |
|---|---|---|
{rows}

![Consulta final de pendientes](../evidencias/jira-pendientes-generales-final-27nov.jpg)

No se marcaron estas validaciones como aprobadas por tener código o pruebas de otro alcance. El hosting gratuito y OSRM público no acreditan por sí solos carga máxima, capacidad ni disponibilidad mensual. No se contrataron recursos pagos para alterar esta limitación.

## Entrega documental y aceptación

Los siete reportes, fuentes de cálculo, capturas, guía de sustentación y registro de transición están preparados. Video excluido por instrucción. Horas, costos, EVM, mood y cinco casos SUS conservan su condición **simulada**. Si el docente exige cinco personas reales, los casos simulados no sustituyen esa evidencia. Tampoco se atribuyen reuniones o firmas inexistentes.

El cierre de sprints sí está realizado; **no se declara cumplimiento global del 100% ni aceptación humana sin evidencia**.

[Datos finales](../evidencias/jira-cierre-final-27nov.json) · [Eventos de cierre por sprint](../evidencias/jira-sprints-cerrados-27nov.json) · [Trazabilidad técnica de las 40 subtareas](Verificacion%20tecnica%20de%20las%2040%20subtareas.md) · [Corte inicial conservado](Conciliacion%20real%20de%20Jira%2027nov.md).

{BACK}
''')

p=CLOSE/'anexos/Conciliacion real de Jira 27nov.md'
text=p.read_text(encoding='utf-8')
history='> **Corte inicial histórico.** Las 40 subtareas y los cuatro sprints abiertos de este documento fueron regularizados posteriormente el mismo 27/11. Se conserva este hallazgo y sus capturas como antecedente. Consulte el [estado final del cierre](Estado%20final%20del%20cierre%20Jira.md).'
if history not in text:text=text.replace('## 1. Estado real',history+'\n\n## 1. Estado real',1)
write(p,text)
p=CLOSE/'anexos/Registro de entrega y transicion.md'
text=p.read_text(encoding='utf-8').replace('CI del commit documental 87183c6 aprobado','CI del commit funcional 6ef087e aprobado')
start=text.index('Jira mantiene 40 subtareas') if 'Jira mantiene 40 subtareas' in text else -1
if start>=0:
    end=text.index('\n\n',start)
    text=text[:start]+'Jira tiene los Sprints 1–4 cerrados, diez historias (67 SP), 99 subtareas y siete épicas en Listo. Se cerraron seguridad, vista de conductor y documentación. Quedan cuatro validaciones no funcionales fuera de los sprints. [Estado final y evidencia pendiente](Estado%20final%20del%20cierre%20Jira.md). No se declara aceptación global inexistente.'+text[end:]
write(p,text)
p=CLOSE/'anexos/Matriz de entregables y evidencias.md'
text=p.read_text(encoding='utf-8')
extra='El cierre final observado se incorpora automáticamente con `scripts/finalize_closure_documents.py` al terminar `complete_closure_evidence.py`. [Estado final de Jira](Estado%20final%20del%20cierre%20Jira.md): cuatro sprints cerrados; cuatro validaciones generales aún abiertas.'
if extra not in text:text+='\n\n'+extra
write(p,text)
p=ROOT/'README.md';text=p.read_text(encoding='utf-8')
marker='### Evidencias actuales del cierre, 27/11/2026'
if marker in text:text=text[:text.index(marker)]
text+='''### Evidencias actuales del cierre, 27/11/2026

[Estado final de Jira y límites de aceptación](docs/04%20Cierre/anexos/Estado%20final%20del%20cierre%20Jira.md) · [Trazabilidad de las 40 subtareas](docs/04%20Cierre/anexos/Verificacion%20tecnica%20de%20las%2040%20subtareas.md) · [Entrega y transición](docs/04%20Cierre/anexos/Registro%20de%20entrega%20y%20transicion.md).

Sprints **1–4 cerrados**. Diez historias (**67 SP**), **99/99 subtareas** y siete épicas en Listo. Seguridad, vista del conductor y documentación regularizadas. Total: **119/123 actividades terminadas**; ANA-21, ANA-26, ANA-29 y ANA-39 continúan abiertas por validaciones no funcionales todavía no acreditadas. Los informes distinguen el corte inicial del final y conservan los datos de gestión/SUS simulados autorizados. No se declara aceptación humana ni cumplimiento global del 100%.
'''
write(p,text)
print('Cierre final conciliado: 4 sprints cerrados, 119/123 actividades; 4 validaciones abiertas.')
