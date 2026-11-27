"""Validate the closure deliverables, arithmetic, provenance labels and links.

Standard library only. Run from any directory: python scripts/verify_closure.py
"""
from pathlib import Path
from decimal import Decimal, ROUND_HALF_UP
from urllib.parse import unquote, urlsplit
import csv
import json
import re
import subprocess

ROOT=Path(__file__).resolve().parents[1]
CLOSE=ROOT/'docs/04 Cierre'
NAMES=['01 Reporte de Estado V_1_0_0.md','02 Reporte de Variación V_1_0_0.md',
       '03 Reporte de Análisis de Valor Ganado - EVM V_1_0_0.md',
       '04 Tableros de Control - Híbridos V_1_0_0.md','05 Radiadores de Información V_1_0_0.md',
       '06 Reporte Final del Proyecto V_1_0_0.md','07 Reporte Final de Lecciones Aprendidas V_1_0_0.md']
D=Decimal
def cents(x):return x.quantize(D('.01'),rounding=ROUND_HALF_UP)
errors=[]
def check(condition,message):
    if not condition:errors.append(message)

readme=(ROOT/'README.md').read_text(encoding='utf-8')
check(sorted(p.name for p in CLOSE.glob('0*.md'))==sorted(NAMES),'Los siete nombres exactos no coinciden')
readme_links=0
for target in re.findall(r'!?\[[^\]]*\]\(([^\n)]+)\)',readme):
    if target.startswith(('#','http://','https://','mailto:')):continue
    resolved=(ROOT/unquote(urlsplit(target.strip('<>')).path)).resolve()
    check(resolved.is_relative_to(ROOT) and resolved.exists(),f'Enlace roto en README: {target}')
    readme_links+=1
links=0
files=[CLOSE/name for name in NAMES]+list((CLOSE/'anexos').glob('*.md'))
files+=list((ROOT/'docs/01 Inicio').glob('*V_1_1_0.md'))+list((ROOT/'docs/02 Planificación').glob('*V_1_1_0.md'))
for file in files:
    check(file.is_file(),f'Falta {file.name}')
    if not file.is_file():continue
    content=file.read_text(encoding='utf-8')
    check(not re.search(r'\[\s*\?\s*\]|\bTODO\b|\bTBD\b',content),f'Marcadores sin resolver: {file.name}')
    check('README.md)' in content,f'Falta retorno al README: {file.name}')
    if file.parent==CLOSE:
        check('simulad' in content.lower(),f'Falta procedencia simulada: {file.name}')
        expected='docs/04 Cierre/'+file.name
        check(expected in unquote(readme),f'No hay enlace directo en README: {file.name}')
    for target in re.findall(r'!?\[[^\]]*\]\(([^\n)]+)\)',content):
        target=target.strip().strip('<>')
        if target.startswith(('#','http://','https://','mailto:')):continue
        decoded=unquote(urlsplit(target).path)
        resolved=(file.parent/decoded).resolve()
        check(resolved.is_relative_to(ROOT) and resolved.exists(),f'Enlace roto: {file.relative_to(ROOT)} -> {target}')
        links+=1

model=json.loads((CLOSE/'evidencias/escenario-cierre-simulado.json').read_text(encoding='utf-8'))
check(model['tipo']=='SIMULADO','La simulación no está declarada')
bac=D(model['BAC']);check(bac==D('11467.50'),'BAC inconsistente con planificación')
check(bac==D('3058')*D('3.75'),'Conversión presupuestaria incorrecta')
check(sum(p['horas_simuladas'] for p in model['personas'])==1220,'Horas incorrectas')
check(sum(D(p['costo_simulado']) for p in model['personas'])==D('8036.25'),'Costo de personas inconsistente')
check(sum(D(x) for x in model['periodos_AC'])==D('8036.25'),'Costos de periodos no concilian')
evm=(CLOSE/NAMES[2]).read_text(encoding='utf-8')
for i,row in enumerate(model['cortes']):
    pv,ev,ac=(D(row[k]) for k in ['PV','EV','AC'])
    check(D(row['SV'])==ev-pv and D(row['CV'])==ev-ac,f'Variación errónea corte {i}')
    check(abs(D(row['SPI'])-ev/pv)<D('1e-20'),f'SPI erróneo corte {i}')
    check(abs(D(row['CPI'])-ev/ac)<D('1e-20'),f'CPI erróneo corte {i}')
    cost=sum(D(p['tarifa_PEN_h'])*sum(p['horas_periodo'][:i+1]) for p in model['personas'])
    check(ac==cents(cost),f'AC no coincide con horas corte {i}')
    previous=D(model['cortes'][i-1]['AC']) if i else D('0')
    check(D(model['periodos_AC'][i])==ac-previous,f'Redondeo del periodo {i} inconsistente')
    if i in [2,3]:
        cpi,spi=ev/ac,ev/pv
        for forecast in [bac/cpi,bac/(cpi*spi),ac+(bac-ev)/(cpi*spi)]:
            check(f'S/ {forecast:.2f}' in evm,f'Falta EAC {forecast:.2f} del corte {i}')
last,prev=model['cortes'][-1],model['cortes'][-2]
pv,ev,ac=(D(last[k])-D(prev[k]) for k in ['PV','EV','AC'])
for val in [pv,ev,ac,ev-pv,ev-ac]:check(f'{val:.2f}' in evm,f'Falta valor de periodo {val}')
check(f'{ev/pv:.4f}' in evm and f'{ev/ac:.4f}' in evm,'Índices del periodo no son cocientes del periodo')

with (CLOSE/'evidencias/radiadores-simulados.csv').open(encoding='utf-8') as f:
    radiator=list(csv.DictReader(f))
    for row in radiator:
        values=[int(row[k]) for k in ['terminado','en_curso','en_revision','por_hacer']]
        check(min(values)>=0 and sum(values)==int(row['alcance']),'Flujo acumulado inconsistente')
    check(int(radiator[0]['alcance'])==58 and int(radiator[-1]['terminado'])==60,'Conciliación 58/60 SP incorrecta')

evidence=json.loads((CLOSE/'evidencias/validacion-tecnica.json').read_text(encoding='utf-8'))
check(evidence['main']=='be3e3ac99db6714978326dbc3a52126861419dfd','Referencia técnica no corresponde al corte')
check(all(r['conclusion']=='success' for r in evidence['runs']),'Se declaró verde un workflow sin éxito')
tracked=subprocess.check_output(['git','ls-files'],cwd=ROOT,text=True).splitlines()
for file in tracked:
    check(not re.search(r'(^|/)(node_modules|\.venv|venv|__pycache__|\.dart_tool)/|\.pyc$',file),f'Residuo rastreado: {file}')
for private in ['src/backend/.env','src/frontend/node_modules/example.js','src/mobile/.dart_tool/example',
                'test.local.json','token.pem','Credenciales-privadas.docx']:
    result=subprocess.run(['git','check-ignore','--quiet',private],cwd=ROOT)
    check(result.returncode==0,f'.gitignore no excluye {private}')

summary=dict(status='PASS' if not errors else 'FAIL',documents=7,links_checked=links,
             readme_links_checked=readme_links,model='SIMULADO',BAC=str(bac),AC_simulado=last['AC'],errors=errors)
print(json.dumps(summary,ensure_ascii=True,indent=2))
raise SystemExit(bool(errors))
