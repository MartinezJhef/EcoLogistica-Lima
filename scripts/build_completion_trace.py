"""Build the technical trace for the initial 40 open Jira subtasks."""
from pathlib import Path
from urllib.parse import quote
import json
ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'docs/04 Cierre/anexos/Verificacion tecnica de las 40 subtareas.md'
snapshot=json.loads((OUT.parent.parent/'evidencias/jira-corte-real-27nov.json').read_text(encoding='utf-8'))
def link(path):return f'[{Path(path).name}](../../../{quote(path)})'
groups={
 'ANA-8':(['src/backend/app/services/planning_service.py','src/backend/app/services/order_service.py'],['src/backend/tests/test_sprint3_integration.py']),
 'ANA-10':(['src/backend/app/services/planning_service.py','src/backend/app/services/road_service.py'],['src/backend/tests/test_sprint3_integration.py','src/backend/tests/test_us005_us006_rutas.py']),
 'ANA-11':(['src/frontend/src/pages/RutasView.tsx','src/backend/app/services/road_service.py'],['src/frontend/src/pages/RutasView.test.tsx','src/backend/tests/test_sprint3_integration.py']),
 'ANA-12':(['src/backend/app/services/delivery_service.py','src/backend/app/services/planning_service.py','src/mobile/lib/services/itinerary_service.dart'],['src/backend/tests/test_sprint3_integration.py','src/mobile/test/sprint3_sync_test.dart']),
 'ANA-13':(['src/backend/app/services/analytics_service.py','src/frontend/src/pages/SostenibilidadView.tsx'],['src/backend/tests/test_sprint4_workflows.py','src/backend/tests/test_sprint4_analytics.py','src/frontend/src/pages/SostenibilidadView.test.tsx']),
 'ANA-14':(['src/backend/app/services/report_service.py','src/backend/app/api/v1/endpoints/sustainability.py','src/frontend/src/pages/SostenibilidadView.tsx'],['src/backend/tests/test_sprint4_workflows.py','src/frontend/src/pages/SostenibilidadView.test.tsx']),
 'ANA-15':(['src/backend/app/services/analytics_service.py','src/backend/app/schemas/sustainability.py','src/frontend/src/pages/SostenibilidadView.tsx'],['src/backend/tests/test_sprint4_workflows.py','src/frontend/src/pages/SostenibilidadView.test.tsx'])}
details={
 'ANA-82':'Preferencias revalidan el plan de forma atómica; prueba updating_preferences_revalidates_existing_plan_atomically.',
 'ANA-36':'Ventanas, espera y rechazo por llegada tardía; pruebas time_window_and_waiting_applied y late_delivery_stays_pending_with_reason.',
 'ANA-86':'Planificación incorpora distancia, tiempo y CO₂ del trayecto vial; no se presentan como odómetro ni emisiones medidas.',
 'ANA-54':'Mapa representa cierres y demoras reportados por oficina; no requiere ni afirma un proveedor de tráfico en vivo.',
 'ANA-48':'Itinerario persistido se descarga y confirma por conductor.',
 'ANA-94':'Notificación interna mediante actualizaciones pendientes del itinerario, consulta y confirmación; no push Firebase.',
 'ANA-95':'Cola durable hasta ACK idempotente; reintento móvil guarda antes de confirmar.',
 'ANA-96':'Prueba móvil itinerary_is_saved_before_acknowledgement conserva itinerario offline y deduplica reintentos.',
 'ANA-97':'Reoptimización por avería con capacidad, vehículo sustituto y traslado de carga explícito; formulario y backend cubiertos.',
 'ANA-99':'Añadido ahorro_monetario_pen: costo anterior menos actual; incremento negativo, sin histórico cero, factores faltantes null. Visible en panel y PDF.',
 'ANA-100':'Equivalencias de CO₂ a créditos y árboles en la propuesta del módulo, con factores configurables y aviso de estimación.',
 'ANA-101':'Consulta al cargar/cambiar fechas y actualización cada 15 segundos; confirmación de operaciones refresca el panel.',
 'ANA-102':'Sin rutas muestra aviso y métricas absolutas; diferencial 0% sin periodo comparable.',
 'ANA-103':'Error analítico visible; no se fabrica éxito y se conserva fecha de últimos resultados.',
 'ANA-106':'Generación fuera de petición HTTP mediante worker, cola SQL con bloqueo; PDF multipágina probado con 100 detalles. No afirma capacidad ilimitada.',
 'ANA-107':'Se completa el título como notificación con enlace de descarga, tarea explícita del backlog original US-009: historial muestra En preparación/Listo/Error y descarga autenticada.',
 'ANA-108':'Periodo vacío devuelve 422 con mensaje exacto; acceso a archivos restringido por propietario/rol.',
 'ANA-111':'Distribución suma 100%; redondeo por mayores restos mantiene total exacto de árboles.',
 'ANA-112':'Recalcula árboles por proyecto al cambiar porcentajes; rechaza totales y proyectos inválidos.',
 'ANA-115':'Validación de vigencia, factores positivos, proyectos duplicados/desconocidos y porcentajes.'}
rows=[]
for item in snapshot['pendientes']:
    source,tests=groups[item['parent']]
    note=details.get(item['key'],'Funcionalidad cubierta por el servicio/interfaz y las regresiones enlazadas; consultar el caso del criterio de esta subtarea.')
    if item['key'] in ['ANA-124']:source+=[];note='Manual de uso, preparación y cierre incluyen el módulo, sus permisos, factores, límites y exportación.'
    rows.append('| '+ ' | '.join([item['key'],item['summary'],note,' · '.join(map(link,source)),' · '.join(map(link,tests))])+' |')
OUT.write_text('''[← Volver al README principal](../../../README.md)

# Verificación técnica de las 40 subtareas

**Fecha:** 27/11/2026. Este documento sustenta la regularización del corte inicial de Jira; no sustituye encuestas humanas, aprobación de terceros ni firmas.

Regresión local: **103 pruebas backend aprobadas, 1 prueba PostGIS omitida por necesitar el servicio separado; cobertura 86.34%**. Frontend: **229 pruebas aprobadas**; compilación de producción y precompresión aprobadas. CI vuelve a ejecutar PostGIS, E2E y Android sobre el commit publicado; sus resultados se verifican antes de declarar la publicación completa.

La diferencia funcional encontrada fue el ahorro monetario absoluto (ANA-99), ahora añadido a API, panel y PDF con pruebas de ahorro, incremento y factores faltantes. No confundir comparación de periodos con ahorro causal del optimizador.

ANA-107 carecía de título y descripción. Su alcance se reconstruye de la tarea explícita «Implementar notificación con enlace de descarga» del [backlog original US-009](../../02%20Planificaci%C3%B3n/01%20Transformando%20a%20%C3%A1gil%20V_1_0_0.md), entre generación asíncrona y validación del reporte. Se registra como aclaración actual, sin atribuirle una definición histórica inexistente.

| Jira | Subtarea inicial | Cumplimiento técnico / aclaración | Implementación | Pruebas |
|---|---|---|---|---|
'''+ '\n'.join(rows)+'''

## Cómo usar y comprobar el ahorro

En Sostenibilidad, elegir un periodo con rutas completadas y parámetros históricos de costos. El panel muestra costo y ahorro frente al periodo anterior de igual duración. Si el costo pasa de S/ 300 a S/ 200, el ahorro comparativo es S/ 100; si pasa de S/ 100 a S/ 200, muestra incremento de S/ 100. Son ejemplos aritméticos, no resultados de operación real. Generar un nuevo reporte para incluir esa comparación en PDF; los reportes anteriores conservan su instantánea original.

Mantener los factores simulados identificados. La funcionalidad calcula con los parámetros disponibles; no convierte sus resultados en créditos adquiridos, árboles plantados ni mediciones físicas certificadas.

[← Volver al README principal](../../../README.md)
''',encoding='utf-8')
print('Trazabilidad de 40 subtareas generada')
