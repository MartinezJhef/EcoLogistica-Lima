"""Reconcile the survey delivery criterion confirmed by the user."""
from pathlib import Path
import json

ROOT=Path(__file__).resolve().parents[1]
CLOSE=ROOT/'docs/04 Cierre'
criterion=json.loads((CLOSE/'evidencias/criterio-encuestas-simuladas-28nov.json').read_text(encoding='utf-8'))
assert criterion['casos_simulados']==5 and criterion['participantes_reales']==0
note='> **Modalidad de encuestas confirmada, 28/11/2026.** El usuario informa que el ingeniero permite encuestas simuladas. Se entregan cinco casos SUS como **resultados simulados**, media 77,5; este apartado no queda pendiente por falta de participantes reales. No cambia la meta original SUS ≥85 ni acredita aceptación humana. La autorización se limita a encuestas.'

def write(path,text):
    path.write_text(text.rstrip()+'\n',encoding='utf-8')

for directory in ['03 Implementación','03 Inplementación']:
    for filename in ['04 Usabilidad V_1_0_0.md','08 Anexo SUS simulado V_1_0_0.md']:
        path=ROOT/'docs'/directory/'Sprint 4'/filename
        text=path.read_text(encoding='utf-8')
        if note not in text:
            lines=text.splitlines();i=next(i for i,line in enumerate(lines) if line.startswith('# '))
            lines.insert(i+1,'\n'+note+'\n');text='\n'.join(lines)
        write(path,text)

path=CLOSE/'anexos/Revision de la rubrica final.md'
text=path.read_text(encoding='utf-8')
old='2. **Procedencia real:** las simulaciones de horas, costos, ánimo y encuestas no cumplen por sí mismas una exigencia de datos reales. Se necesita aceptación docente de su uso o los registros reales correspondientes. Las encuestas humanas no pueden reconstruirse a partir de pruebas del agente.'
new='2. **Procedencia real:** las cinco encuestas SUS simuladas se aceptan para la entrega según la confirmación del usuario de que el ingeniero permite esa modalidad; ya no se consideran un pendiente por ausencia de participantes reales. Se mantienen rotuladas como resultados simulados (77,5). Horas, costos y ánimo conservan sus condiciones de aceptación propias: esta confirmación no se extiende a esos datos.'
text=text.replace(old,new)
if note not in text:text=text.replace('## Criterios y evidencia',note+'\n\n[Confirmación y alcance](../evidencias/criterio-encuestas-simuladas-28nov.json).\n\n## Criterios y evidencia')
write(path,text)

path=CLOSE/'anexos/Cierre de validaciones 28nov.md'
text=path.read_text(encoding='utf-8').replace('## Para sustituir las encuestas simuladas por respuestas reales','## Encuestas simuladas aceptadas para la entrega')
if note not in text:text=text.replace('## Encuestas simuladas aceptadas para la entrega','## Encuestas simuladas aceptadas para la entrega\n\n'+note+'\n\n[Confirmación y alcance](../evidencias/criterio-encuestas-simuladas-28nov.json). La captura de respuestas reales descrita a continuación queda como alternativa opcional para una evaluación futura, sin bloquear esta entrega.')
write(path,text)

replacements={
 'falta de participantes reales y la revisión manual':'la revisión manual',
 'El objetivo universal <500 ms y SUS real permanecen sin acreditar.':'El objetivo universal <500 ms permanece sin acreditar. Las cinco encuestas SUS simuladas están aceptadas para esta entrega según la confirmación del usuario.',
 '| PO coordina cinco participantes reales y archiva respuestas. |':'| Entregar los cinco casos simulados autorizados; la muestra real es opcional. La meta original ≥85 sigue sin alcanzarse con 77,5. |',
 '| SUS y aceptación humana | Híbrido | ROJO | n real = 0; cinco casos simulados, SUS 77.5. |':'| SUS simulado autorizado | Híbrido | ÁMBAR | Cinco casos simulados entregados, SUS 77.5; modalidad permitida según el usuario. Meta original ≥85 no alcanzada; no acredita aceptación humana. |',
 '| RSK-04 / participantes | Impedimento de aceptación | Sin respuestas SUS humanas ni mood real. | Datos simulados autorizados y rotulados; piloto real pendiente. |':'| RSK-04 / encuestas y ánimo | Encuestas simuladas permitidas | Cinco casos SUS simulados entregados; mood sin medición humana. | Encuestas aceptadas según confirmación del usuario; conservar la etiqueta simulada. La aceptación del mood mantiene su condición propia. |',
}
for path in CLOSE.glob('0*.md'):
    text=path.read_text(encoding='utf-8')
    for old,new in replacements.items():text=text.replace(old,new)
    if note not in text:
        lines=text.splitlines();i=next(i for i,line in enumerate(lines) if line.startswith('# '));lines.insert(i+1,'\n'+note+'\n');text='\n'.join(lines)
    write(path,text)

path=ROOT/'README.md';text=path.read_text(encoding='utf-8')
text=text.replace('Usabilidad: pruebas por roles y evaluación SUS pendiente','Usabilidad: pruebas por roles y resultados SUS simulados autorizados')
if note not in text:text+='\n'+note+'\n'
write(path,text)
print('Encuestas simuladas aceptadas para la entrega; procedencia y puntajes conservados.')
