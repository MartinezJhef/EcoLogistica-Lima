"""Apply the observed quality cut after the preserved earlier Jira closure."""
from pathlib import Path
import json
import re

ROOT=Path(__file__).resolve().parents[1]
CLOSE=ROOT/'docs/04 Cierre'
EV=CLOSE/'evidencias'
cut=json.loads((EV/'jira-calidad-final-27nov.json').read_text(encoding='utf-8'))
assert cut['Listo']==122 and cut['En_curso']==1 and cut['pendientes'][0]['key']=='ANA-26'
notice='> **Cierre real de Jira, 27/11/2026.** Sprints **1–4 cerrados**, diez historias (**67 SP**), **99/99 subtareas** y siete épicas en Listo. Corte de calidad posterior: **122/123 actividades Listo**; ANA-26 continúa En curso para completar la revisión manual WCAG. Rendimiento y capacidad tienen mediciones controladas; monitoreo y recuperación están implementados. La disponibilidad mensual no está acreditada. Horas, costos, EVM, mood y SUS conservan su naturaleza simulada. [Estado final](anexos/Estado%20final%20del%20cierre%20Jira.md) · [Resultados de calidad](anexos/Validaciones%20de%20calidad%20y%20continuidad%2027nov.md).'
def write(p,t):p.write_text('\n'.join(line.rstrip() for line in t.strip().splitlines())+'\n',encoding='utf-8')
for p in CLOSE.glob('0*.md'):
    t=p.read_text(encoding='utf-8')
    t=re.sub(r'> \*\*Cierre real de Jira, 27/11/2026\..*?(?=\n\n)',lambda _:notice,t,flags=re.S)
    t=t.replace('cuatro validaciones no funcionales aún abiertas en Jira','la revisión manual de accesibilidad pendiente en Jira')
    t=t.replace('las cuatro validaciones no funcionales restantes','todos los requisitos no funcionales ni la aceptación humana')
    t=t.replace('cuatro enablers no funcionales siguen abiertos','corte de calidad posterior: 122 Listo y ANA-26 En curso')
    t=t.replace('De 123 actividades, 119 están Listo y cuatro Por hacer.','Esta captura corresponde al corte previo: 119 Listo y cuatro Por hacer. El corte de calidad posterior tiene 122 Listo y ANA-26 En curso.')
    t=t.replace('Recuento de 123 actividades de distintos tipos: 119 Listo y cuatro validaciones generales Por hacer.','Captura histórica de 123 actividades de distintos tipos: 119 Listo y cuatro Por hacer. El corte de calidad posterior tiene 122 Listo y ANA-26 En curso.')
    write(p,t)

p=CLOSE/'anexos/Estado final del cierre Jira.md'
t=p.read_text(encoding='utf-8')
start=t.index('## Cuatro actividades generales todavía abiertas') if '## Cuatro actividades generales todavía abiertas' in t else t.index('## Validaciones de calidad actualizadas')
end=t.index('## Entrega documental y aceptación',start)
t=t[:start]+'''## Validaciones de calidad actualizadas

**122/123 actividades Listo**, una En curso (ANA-26), ninguna Por hacer. Se conservan el corte anterior de 119 Listo y sus capturas como antecedentes.

| Jira | Estado observado | Resultado y límite |
|---|---|---|
| ANA-21 | Listo | Motor sobre PostGIS: 150 pedidos/15 vehículos, 2,099 s; reoptimización 0,049 s. Adaptador vial controlado; no acredita esos tiempos con OSRM público. |
| ANA-29 | Listo | 1.000 pedidos/50 vehículos; 1.000 entregas persistidas sin duplicados; 33 rutas. Carga sintética ejecutada contra PostGIS real. |
| ANA-39 | Listo | Implementación de monitoreo horario, salud que consulta la base y recuperación de exportación tras reinicio local (2,387 s). No acredita SLA mensual ni failover de producción. |
| ANA-26 | En curso | 30/30 auditorías automáticas aprobadas en tres navegadores, correcciones de contraste, etiquetas, teclado y ancho 320 px. Falta acreditar la revisión manual integral WCAG 2.1 AA. |

![Consulta de pendientes posterior a las validaciones](../evidencias/jira-calidad-pendiente-27nov.jpg)

[Corte observado de calidad](../evidencias/jira-calidad-final-27nov.json) · [Pruebas, capturas y límites](Validaciones%20de%20calidad%20y%20continuidad%2027nov.md).

Los cambios funcionales de calidad se publicaron en main en `924168b`. La revisión automática de accesibilidad y los datos sintéticos no se presentan como certificación universal o evaluación con personas. El objetivo mensual requiere observación real del periodo, aun cuando la tarea de implementar el monitor esté terminada.

[CI y despliegue de calidad verificados](../evidencias/validacion-tecnica-calidad-27nov.json) · [Comprobación pública posterior](../evidencias/muestra-publica-postdeploy-27nov.json).

'''+t[end:]
write(p,t)
for name in ['Registro de entrega y transicion.md','Matriz de entregables y evidencias.md']:
    p=CLOSE/'anexos'/name;t=p.read_text(encoding='utf-8')
    t=t.replace('Quedan cuatro validaciones no funcionales fuera de los sprints.','El corte de calidad posterior tiene 122 actividades Listo y ANA-26 En curso; la disponibilidad mensual aún no está acreditada.')
    t=t.replace('cuatro validaciones generales aún abiertas','corte de calidad posterior: 122 Listo y ANA-26 En curso; SLA mensual no acreditado')
    if name.startswith('Matriz'):
        seen=False; paragraphs=[]
        for paragraph in re.split(r'\n\s*\n',t):
            if paragraph.startswith('El cierre final observado se incorpora automáticamente'):
                if seen:continue
                seen=True
            paragraphs.append(paragraph)
        t='\n\n'.join(paragraphs)
    write(p,t)
p=ROOT/'README.md';t=p.read_text(encoding='utf-8')
marker='### Evidencias actuales del cierre, 27/11/2026'
t=t[:t.index(marker)]+'''### Evidencias actuales del cierre, 27/11/2026

[Estado final de Jira](docs/04%20Cierre/anexos/Estado%20final%20del%20cierre%20Jira.md) · [Validaciones de calidad y continuidad](docs/04%20Cierre/anexos/Validaciones%20de%20calidad%20y%20continuidad%2027nov.md) · [Entrega y transición](docs/04%20Cierre/anexos/Registro%20de%20entrega%20y%20transicion.md).

Sprints **1–4 cerrados**: diez historias (**67 SP**), **99/99 subtareas** y siete épicas en Listo. Corte posterior de calidad: **122/123 actividades Listo**; ANA-26 En curso para acreditar la revisión manual integral WCAG. Pasaron 30 auditorías automáticas de accesibilidad y las pruebas controladas de 150 pedidos/15 vehículos y 1.000 pedidos/50 vehículos sobre PostGIS. Monitoreo horario y recuperación están implementados; el SLA mensual no está acreditado. Gestión y SUS simulados mantienen esa identificación. No se declara aceptación humana ni cumplimiento global del 100%.
'''
write(p,t)
print('Corte de calidad aplicado: 122 Listo; ANA-26 En curso; SLA mensual no acreditado.')
