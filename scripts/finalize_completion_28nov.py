"""Apply the dated, reproducible completion evidence without changing historical cuts."""
from pathlib import Path
import json
import re

ROOT = Path(__file__).resolve().parents[1]
CLOSE = ROOT / 'docs/04 Cierre'
EV = CLOSE / 'evidencias'
release = json.loads((EV / 'validacion-cierre-28nov.json').read_text(encoding='utf-8'))
assert release['required_successful']
sha = release['main']
link = 'anexos/Cierre%20de%20validaciones%2028nov.md'
notice = ('> **Actualización de cierre, 28/11/2026.** Sprints 1–4 cerrados: diez historias, 67 SP y 99 subtareas terminadas. '
          'Jira conserva 122/123 actividades Listo y ANA-26 En curso: la revisión integral WCAG no está acreditada. '
          'Se verificaron 236 pruebas unitarias web, 54 casos de accesibilidad/sesión en tres navegadores, '
          '16 árboles nativos de accesibilidad y tres comprobaciones del diálogo móvil con texto ampliado. '
          'CI y despliegue aprobados para `' + sha[:7] + '`. Disponibilidad mensual y respuestas siempre menores de 500 ms no acreditadas. '
          'Horas, costos, EVM, mood y SUS mantienen su identificación simulada; n humano SUS = 0. '
          '[Evidencia actual y límites](' + link + '). El video queda fuera de este encargo.')

def write(path, text):
    text = '\n'.join(x.rstrip() for x in text.strip().splitlines())
    path.write_text(re.sub(r'\n{3,}', '\n\n', text) + '\n', encoding='utf-8')

for path in CLOSE.glob('0*.md'):
    text = path.read_text(encoding='utf-8')
    text = re.sub(r'> \*\*(?:Cierre real de Jira, 27/11/2026|Actualización de cierre, 28/11/2026)\..*?(?=\n\n)',
                  lambda _: notice, text, flags=re.S)
    text = text.replace('231 pruebas web', '236 pruebas web').replace('231 web,', '236 web,')
    text = text.replace('231 aprobadas; construcción y precompresión correctas. 45 auditorías de accesibilidad en tres navegadores y 12 comprobaciones adicionales de texto en Chromium aprobadas.',
        '236 aprobadas; construcción y precompresión correctas. 54 casos de accesibilidad/sesión en tres navegadores, 16 árboles nativos, 12 comprobaciones previas de texto en Chromium y tres del diálogo móvil con texto ampliado aprobados.')
    text = re.sub(r'Última versión funcional verificada: `[^`]+`, 27/11/2026',
                  'Última versión funcional verificada: `' + sha + '`, 28/11/2026', text)
    text = text.replace('evidencias/validacion-accesibilidad-ampliada-27nov.json', 'evidencias/validacion-cierre-28nov.json')
    write(path, text)

path = ROOT / 'README.md'
text = path.read_text(encoding='utf-8')
marker = '### Evidencias actuales del cierre, '
text = text[:text.index(marker)] + '''### Evidencias actuales del cierre, 28/11/2026

[Estado final de Jira](docs/04%20Cierre/anexos/Estado%20final%20del%20cierre%20Jira.md) · [Validaciones y recopilación de evidencia del 28 de noviembre](docs/04%20Cierre/anexos/Cierre%20de%20validaciones%2028nov.md) · [Entrega y transición](docs/04%20Cierre/anexos/Registro%20de%20entrega%20y%20transicion.md) · [Revisión de la rúbrica](docs/04%20Cierre/anexos/Revision%20de%20la%20rubrica%20final.md).

Sprints **1–4 cerrados**: diez historias (**67 SP**), **99/99 subtareas** y siete épicas en Listo. Jira: **122/123 actividades Listo**; ANA-26 En curso hasta acreditar la revisión integral WCAG. Se aprobaron 236 pruebas unitarias web, 54 casos de accesibilidad/sesión en tres navegadores, 16 árboles nativos y tres comprobaciones adicionales del diálogo móvil con texto ampliado. Se conservan las doce comprobaciones previas de texto en Chromium.

Monitoreo horario y resumen de cobertura implementados. Las muestras reales conservan fallos y huecos; no acreditan el SLA mensual ni respuesta universal inferior a 500 ms. Cargas de 150 pedidos/15 vehículos y 1.000 pedidos/50 vehículos verificadas sobre PostGIS con adaptador vial controlado. Gestión y SUS simulados conservan esa identificación (n humano SUS = 0). El video queda fuera de este encargo. No se declara aceptación humana ni cumplimiento global del 100 %.
'''
write(path, text)

for name in ['Estado final del cierre Jira.md', 'Registro de entrega y transicion.md', 'Matriz de entregables y evidencias.md', 'Revision de la rubrica final.md']:
    path = CLOSE / 'anexos' / name
    text = path.read_text(encoding='utf-8')
    text = re.sub(r'\n> \*\*Evidencia adicional del 28/11/2026\.\*\*[^\n]*\n', '\n', text)
    addition = ('\n> **Evidencia adicional del 28/11/2026.** [Resultados actuales de sesión, navegación, interfaz nativa de accesibilidad y disponibilidad](Cierre%20de%20validaciones%2028nov.md). '
                '236 pruebas unitarias web, 54 casos de accesibilidad/sesión, 16 árboles nativos y tres verificaciones móviles adicionales aprobados. '
                'Jira ANA-26 sigue En curso; no se acredita conformidad integral WCAG ni SLA mensual. '
                '[CI y despliegue verificados](../evidencias/validacion-cierre-28nov.json).\n')
    lines = text.splitlines()
    title = next(i for i, line in enumerate(lines) if line.startswith('# '))
    lines.insert(title + 1, addition)
    text = '\n'.join(lines)
    if name == 'Revision de la rubrica final.md':
        text = text.replace('**Corte:** 27/11/2026', '**Corte:** 28/11/2026')
        text = text.replace('229 pruebas unitarias web aprobadas y 30 auditorías automáticas de accesibilidad',
            '236 pruebas unitarias web aprobadas y 54 casos de accesibilidad/sesión')
        text = text.replace('ANA-26 está En curso porque la auditoría automática no acredita todos los criterios manuales WCAG 2.1 AA.',
            'ANA-26 está En curso: las pruebas, la inspección nativa y los recorridos revisados no acreditan todos los criterios de conformidad integral WCAG 2.1 AA.')
        text = text.replace('evidencias/validacion-tecnica-calidad-27nov.json', 'evidencias/validacion-cierre-28nov.json')
        start = text.index('1. **Video:**')
        end = text.index('\n2. **Procedencia real:**', start)
        text = text[:start] + '1. **Video:** el usuario lo prepara por separado y lo excluyó de este encargo. No se verificó ni se declara entregado desde este paquete. Su evaluación corresponde al docente.' + text[end:]
    write(path, text)

print('Evidencias del 28/11 aplicadas; cortes históricos y límites conservados.')
if (EV/'criterio-encuestas-simuladas-28nov.json').exists():
    import runpy
    runpy.run_path(str(ROOT/'scripts/apply_survey_delivery_criterion.py'),run_name='__main__')
