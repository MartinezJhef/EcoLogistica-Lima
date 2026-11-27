"""Regenerate the explicitly simulated closure model and its static charts.

Requires matplotlib (authoring only; not an application dependency).
No service credentials or production business records are read.
"""
from pathlib import Path
from decimal import Decimal, ROUND_HALF_UP
import csv
import json
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import numpy as np

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'docs/04 Cierre/evidencias'
OUT.mkdir(parents=True, exist_ok=True)
D = Decimal
def rounded(x): return D(str(x)).quantize(D('.01'), rounding=ROUND_HALF_UP)
BAC = D('11467.50')
people = [
    ('Zayuri', 'Dirección del proyecto', '6.5625', [45,45,75,55]),
    ('Jheferson', 'Liderazgo técnico', '7.50', [45,55,100,70]),
    ('Angela', 'Producto e interfaces', '6.375', [50,55,80,55]),
    ('Maylit', 'Calidad y riesgos', '6.375', [30,45,100,85]),
    ('Diego', 'Comunicaciones y soporte', '6.00', [45,45,85,55]),
]
period_ac = [sum(D(p[2])*p[3][i] for p in people) for i in range(4)]
pv_percent = [D('.20'),D('.45'),D('.90'),D('1')]
ev_percent = [D('.12'),D('.30'),D('.75'),D('1')]
rows = []
for i, date in enumerate(['2026-10-09','2026-10-23','2026-10-30','2026-11-27']):
    pv, ev, ac = rounded(BAC*pv_percent[i]), rounded(BAC*ev_percent[i]), rounded(sum(period_ac[:i+1]))
    rows.append(dict(corte=date, PV=str(pv), EV=str(ev), AC=str(ac), SV=str(ev-pv), CV=str(ev-ac),
                     SPI=str(ev/pv), CPI=str(ev/ac), CSI=str(ev/pv*ev/ac)))
model = dict(tipo='SIMULADO',autorizacion='El usuario solicitó simular lógicamente horas, costos, EVM y ánimo para el cierre; no son registros de personas ni pagos reales.',
    moneda='PEN', BAC=str(BAC),tope_acta='12850.00',cambio_interno_USD_PEN='3.75',
    regla_EV='Porcentaje simulado de paquetes de trabajo presupuestados; no conversión de Story Points a dinero.',
    regla_AC='Horas simuladas por tarifa académica de la planificación; gasto externo del escenario: cero.',
    personas=[dict(nombre=p[0],rol=p[1],tarifa_PEN_h=p[2],horas_periodo=p[3],horas_planificadas=240,
                   horas_simuladas=sum(p[3]),costo_simulado=str(rounded(D(p[2])*sum(p[3])))) for p in people],
    cortes=rows,periodos_AC=[str(D(rows[i]['AC'])-(D(rows[i-1]['AC']) if i else D('0'))) for i in range(4)],
    horas_planificadas=1200,horas_simuladas=sum(sum(p[3]) for p in people),
    financiacion_real='Servicios Render y Neon autorizados únicamente en planes gratuitos; no hay libro contable completo del proyecto.',
    limites='EVM, horas, radiadores reconstruidos y ánimo son simulados. No acreditan pagos, aprobación del patrocinador, asistencia ni cierre real en Jira.')
(OUT/'escenario-cierre-simulado.json').write_text(json.dumps(model,ensure_ascii=False,indent=2),encoding='utf-8')
with (OUT/'evm-simulado.csv').open('w',encoding='utf-8',newline='') as f:
    w=csv.DictWriter(f,fieldnames=list(rows[0]));w.writeheader();w.writerows(rows)
with (OUT/'horas-simuladas.csv').open('w',encoding='utf-8',newline='') as f:
    w=csv.writer(f);w.writerow(['Nombre','Rol','Tarifa PEN/h','P1','P2','P3','P4','Total horas','Costo simulado PEN'])
    for p in people:w.writerow([*p[:3],*p[3],sum(p[3]),rounded(D(p[2])*sum(p[3]))])

plt.rcParams.update({'font.family':'DejaVu Sans','font.size':10,'axes.spines.top':False,
    'axes.spines.right':False,'axes.edgecolor':'#bdc7b5','axes.labelcolor':'#334333',
    'text.color':'#293c30','xtick.color':'#596c59','ytick.color':'#596c59','figure.facecolor':'#fafbf7',
    'axes.facecolor':'#fafbf7','savefig.facecolor':'#fafbf7'})
green, olive, amber, blue = '#284b3a','#8b9c60','#b66b24','#3d748b'
def save(fig, name, title, note='DATOS SIMULADOS | Escenario de cierre, 27/11/2026'):
    fig.suptitle(title,ha='left',x=.065,y=.98,fontsize=16,fontweight='bold')
    fig.text(.065,.015,note,fontsize=8,color='#596c59')
    fig.tight_layout(rect=[.04,.055,.98,.92])
    fig.savefig(OUT/(name+'.png'),dpi=160);fig.savefig(OUT/(name+'.svg'));plt.close(fig)
    svg=OUT/(name+'.svg')
    svg.write_text('\n'.join(line.rstrip() for line in svg.read_text(encoding='utf-8').splitlines())+'\n',encoding='utf-8')

x=np.arange(4); labels=['P1\n09 oct','P2\n23 oct','P3\n30 oct','Cierre\n27 nov']
fig,ax=plt.subplots(figsize=(10.5,5.2))
for key,color in [('PV',blue),('EV',green),('AC',amber)]:
    y=[float(r[key]) for r in rows];ax.plot(x,y,'o-',label=key,color=color,lw=2.3)
    ax.annotate(f'{key}: S/ {y[-1]:,.2f}',(x[-1],y[-1]),xytext=(10,12 if key=='PV' else -14 if key=='EV' else 0),textcoords='offset points',fontsize=9,color=color)
ax.set_xticks(x,labels);ax.set_ylabel('PEN valorizados');ax.set_xlim(-.15,3.8);ax.grid(axis='y',alpha=.18);ax.legend(loc='upper left')
save(fig,'evm-tendencia','El valor ganado alcanza el plan al cierre; el retraso calendario permanece')

fig,ax=plt.subplots(figsize=(9.8,5.1))
for i,r in enumerate(rows):
    ax.scatter(float(r['SPI']),float(r['CPI']),s=float(r['CSI'])*400,color=[amber,blue,olive,green][i],alpha=.8,edgecolors='white',linewidths=1.5)
    ax.annotate(['P1','P2','P3','Cierre'][i],(float(r['SPI']),float(r['CPI'])),xytext=(10,5),textcoords='offset points')
ax.axvline(1,color='#99a68f',ls='--');ax.axhline(1,color='#99a68f',ls='--');ax.set_xlabel('SPI = EV / PV');ax.set_ylabel('CPI = EV / AC');ax.set_xlim(.4,1.15);ax.set_ylim(.8,1.8);ax.grid(alpha=.15)
save(fig,'evm-burbujas','El cierre recupera SPI; el CPI refleja la valorización del escenario','DATOS SIMULADOS | Área de burbuja proporcional a CSI = SPI × CPI; no es satisfacción')

fig,ax=plt.subplots(figsize=(10,4.5))
final=rows[-1];values=[float(D(final[k])/BAC*100) for k in ['PV','EV','AC']]
bars=ax.barh(['Planificado / BAC','Ganado / BAC','Gastado / BAC'],values,color=[blue,green,amber],height=.48)
for b,v in zip(bars,values):ax.text(v+1,b.get_y()+b.get_height()/2,f'{v:.2f} %',va='center',fontweight='bold')
ax.set_xlim(0,116);ax.set_xlabel('% del BAC');ax.invert_yaxis();ax.grid(axis='x',alpha=.15)
save(fig,'avance-bac','El escenario valoriza el costo por debajo del BAC')

dates=['04 sep','18 sep','02 oct','09 oct','16 oct','23 oct','30 oct','13 nov','27 nov']
done=np.array([0,3,5,8,12,18,47,53,60]);scope=np.array([58,58,58,58,60,60,60,60,60])
progress=np.array([0,5,7,7,8,9,7,4,0]);review=np.array([0,1,2,3,4,5,3,2,0]);todo=scope-done-progress-review
radiator=[dict(corte=dates[i],alcance=int(scope[i]),terminado=int(done[i]),en_curso=int(progress[i]),en_revision=int(review[i]),por_hacer=int(todo[i])) for i in range(len(dates))]
with (OUT/'radiadores-simulados.csv').open('w',encoding='utf-8',newline='') as f:
    w=csv.DictWriter(f,fieldnames=list(radiator[0]));w.writeheader();w.writerows(radiator)
fig,ax=plt.subplots(figsize=(10.5,5))
ax.plot(dates,scope-done,'o-',color=green,lw=2.4,label='Trabajo restante del escenario')
ax.plot(dates,np.linspace(58,0,len(dates)),'--',color='#9a8879',label='Ideal de referencia: 58 SP iniciales')
ax.set_ylabel('Story Points');ax.set_ylim(0,64);ax.legend();ax.grid(axis='y',alpha=.18)
save(fig,'burndown-simulado','El trabajo pendiente se concentra antes de la integración final','DATOS SIMULADOS | Agregado del proyecto; no es exportación de Jira ni burndown real de Sprint 4')
fig,ax=plt.subplots(figsize=(10.5,5));ax.step(dates,scope,where='post',color=amber,label='Estimación total: 58 → 60 SP',lw=2)
ax.plot(dates,done,'o-',color=green,lw=2.4,label='Trabajo completado del escenario');ax.set_ylabel('Story Points');ax.set_ylim(0,68);ax.legend(loc='upper left');ax.grid(axis='y',alpha=.18)
save(fig,'burnup-simulado','El cambio de estimación de US-004 añade 2 SP, sin añadir funcionalidad','DATOS SIMULADOS | Conciliación documental: backlog inicial 58 SP; informes posteriores 60 SP')
fig,ax=plt.subplots(figsize=(10.5,5));ax.stackplot(dates,done,review,progress,todo,labels=['Terminado','En revisión','En curso','Por hacer'],colors=[green,olive,blue,'#d8ddcf'],alpha=.92)
ax.set_ylabel('Story Points');ax.legend(loc='upper left',ncols=4);ax.set_ylim(0,72)
save(fig,'flujo-acumulado-simulado','La banda de revisión señala el cuello de botella del escenario')

mood=np.array([[4,3,3,4],[4,3,2,4],[4,4,3,5],[3,3,2,4],[4,3,3,4]])
(OUT/'animo-simulado.json').write_text(json.dumps({'tipo':'SIMULADO','escala':'1 muy bajo a 5 muy alto','no_es_encuesta_real':True,'integrantes':[p[0] for p in people],'valores':mood.tolist(),'media_final':float(mood[:,-1].mean())},ensure_ascii=False,indent=2),encoding='utf-8')
fig,ax=plt.subplots(figsize=(9,5));ax.imshow(mood,vmin=1,vmax=5,cmap='YlGn');ax.set_xticks(range(4),['Sprint 1','Sprint 2','Sprint 3','Sprint 4']);ax.set_yticks(range(5),[p[0] for p in people])
for i in range(5):
    for j in range(4):ax.text(j,i,str(mood[i,j]),ha='center',va='center',color='white' if mood[i,j]>=4 else '#283b2c',fontweight='bold',fontsize=14)
save(fig,'mood-simulado','El ánimo modelado mejora tras estabilizar la integración','DATOS SIMULADOS | Escala 1–5; no son respuestas ni opiniones recogidas del equipo')

fig,ax=plt.subplots(figsize=(11,5));ax.axis('off')
columns=[('MANTENER',green,['Lógica compartida para dashboard y PDF','Pruebas en PostgreSQL/PostGIS','Permisos comprobados en servidor']),
 ('MEJORAR',amber,['Anticipar el piloto con participantes','Unificar la fecha operativa de Lima','Conciliar horas, SP y calendario']),
 ('ACCIONES PROPUESTAS',blue,['QA: adjuntar evidencias por incremento','PM: registrar aceptación y costos','Equipo: revisar WIP en cada sprint'])]
for i,(title,color,lines) in enumerate(columns):
    ax.add_patch(plt.Rectangle((i*.335,.05),.315,.83,transform=ax.transAxes,color='#edf0e6'))
    ax.text(i*.335+.018,.79,title,transform=ax.transAxes,fontweight='bold',color=color,fontsize=10)
    import textwrap
    for j,line in enumerate(lines):ax.text(i*.335+.018,.62-j*.20,textwrap.fill(line,29),transform=ax.transAxes,fontsize=10,va='top')
save(fig,'retrospectiva-reconstruida','Prácticas y acciones consolidadas de las retrospectivas versionadas','RECONSTRUCCIÓN DOCUMENTAL | No es captura ni acta de una reunión efectuada')

print(json.dumps({'BAC':str(BAC),'AC_final':rows[-1]['AC'],'horas':model['horas_simuladas'],'cortes':rows,'AC_periodos':model['periodos_AC']},ensure_ascii=False))
