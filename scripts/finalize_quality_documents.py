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
    t=t.replace('229 pruebas web; 103 pruebas backend más la integración PostGIS de CI','229 pruebas web; 105 pruebas backend locales y tres pruebas adicionales de capacidad sobre PostGIS, además de la integración validada en CI')
    t=t.replace('229 web + 103 backend y PostGIS en CI','229 web, 105 backend locales y capacidad/PostGIS en CI')
    t=t.replace('[CI y despliegue del último cambio funcional](evidencias/validacion-tecnica-cierre-27nov.json)','[CI y despliegue del último cambio funcional](evidencias/validacion-tecnica-calidad-27nov.json)')
    t=t.replace('Última revisión técnica de referencia: `be3e3ac99db6714978326dbc3a52126861419dfd`, 26/11/2026; esta entrega de cierre añade documentación sin cambiar reglas de negocio.','Última versión funcional verificada: `924168b8d630a44eb17d890e4b3f6b7eb1f05ac6`, 27/11/2026, con correcciones de paginación, rendimiento, accesibilidad y salud de la base. [CI y despliegue](evidencias/validacion-tecnica-calidad-27nov.json). El registro `be3e3ac` se conserva como corte técnico anterior.')
    t=t.replace('226 aprobadas; construcción y precompresión correctas.','229 aprobadas; construcción y precompresión correctas. Treinta auditorías automáticas adicionales de accesibilidad aprobadas en tres navegadores.')
    t=t.replace('102 pruebas locales + 1 integración PostgreSQL/PostGIS aprobadas.','105 pruebas locales aprobadas; cuatro integraciones omitidas bajo SQLite. Las tres nuevas pruebas de capacidad se ejecutaron aparte sobre PostGIS real y la validación funcional de CI aprobó.')
    t=t.replace('Fuentes de las métricas: [registro de validación técnica](evidencias/validacion-tecnica.json)','Fuentes de las métricas actuales: [CI y despliegue de calidad](evidencias/validacion-tecnica-calidad-27nov.json) y [mediciones de calidad y continuidad](anexos/Validaciones%20de%20calidad%20y%20continuidad%2027nov.md). Fuentes del corte previo: [registro de validación técnica](evidencias/validacion-tecnica.json)')
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
    t=t.replace('CI del commit funcional 6ef087e aprobado y despliegue exitoso','CI del commit funcional 924168b aprobado y despliegue exitoso; mediciones y límites en el anexo de calidad')
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

[Revisión por criterio de la rúbrica final y condiciones de cumplimiento](docs/04%20Cierre/anexos/Revision%20de%20la%20rubrica%20final.md).

[Revisión adicional de accesibilidad: 231 pruebas web y 45 auditorías; continuación del monitoreo real](docs/04%20Cierre/anexos/Revision%20de%20accesibilidad%20y%20monitoreo%2027nov.md).

Sprints **1–4 cerrados**: diez historias (**67 SP**), **99/99 subtareas** y siete épicas en Listo. Corte posterior de calidad: **122/123 actividades Listo**; ANA-26 En curso para acreditar la revisión manual integral WCAG. Pasaron 30 auditorías automáticas de accesibilidad y las pruebas controladas de 150 pedidos/15 vehículos y 1.000 pedidos/50 vehículos sobre PostGIS. Monitoreo horario y recuperación están implementados; el SLA mensual no está acreditado. Gestión y SUS simulados mantienen esa identificación. No se declara aceptación humana ni cumplimiento global del 100%.
'''
write(p,t)
print('Corte de calidad aplicado: 122 Listo; ANA-26 En curso; SLA mensual no acreditado.')

# Keep the earlier technical cut as history; use the newer verified release in summaries.
latest=EV/'validacion-accesibilidad-ampliada-27nov.json'
if latest.exists():
    verified=json.loads(latest.read_text(encoding='utf-8'))
    assert verified['required_successful']
    sha=verified['main'][:7]
    for p in CLOSE.glob('0*.md'):
        t=p.read_text(encoding='utf-8')
        t=t.replace('229 pruebas web','231 pruebas web').replace('229 web,','231 web,')
        t=t.replace('229 aprobadas; construcción y precompresión correctas. Treinta auditorías automáticas adicionales de accesibilidad aprobadas en tres navegadores.',
            '231 aprobadas; construcción y precompresión correctas. 45 auditorías de accesibilidad en tres navegadores y 12 comprobaciones adicionales de texto en Chromium aprobadas.')
        t=t.replace('evidencias/validacion-tecnica-calidad-27nov.json','evidencias/validacion-accesibilidad-ampliada-27nov.json')
        t=t.replace('Última versión funcional verificada: `924168b8d630a44eb17d890e4b3f6b7eb1f05ac6`,',f"Última versión funcional verificada: `{verified['main']}`,")
        write(p,t)
    p=CLOSE/'anexos/Registro de entrega y transicion.md';t=p.read_text(encoding='utf-8')
    t=t.replace('CI del commit funcional 924168b aprobado',f'CI del commit funcional {sha} aprobado')
    write(p,t)
    p=ROOT/'README.md';t=p.read_text(encoding='utf-8')
    t=t.replace('Pasaron 30 auditorías automáticas de accesibilidad',
        'Pasaron 45 auditorías de accesibilidad en tres navegadores y 12 comprobaciones adicionales de texto en Chromium')
    write(p,t)
