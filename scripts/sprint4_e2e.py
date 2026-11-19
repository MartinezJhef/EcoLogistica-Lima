"""Real HTTP/UI acceptance on a disposable, pre-seeded environment.

Requires E2E_PASSWORD and four accounts <role>@sprint4.example.test.
No responses are mocked. Generates a portable HTML report and screenshots.
"""
import os
import json
import time
import html
from pathlib import Path
from playwright.sync_api import sync_playwright, expect

BASE = os.getenv('E2E_WEB_URL', 'http://127.0.0.1:5173')
API = os.getenv('E2E_API_URL', 'http://127.0.0.1:8000/api/v1')
PASSWORD = os.environ['E2E_PASSWORD']
OUT = Path(os.getenv('E2E_OUTPUT', 'playwright-report'))
OUT.mkdir(parents=True, exist_ok=True)
results = []


def run():
    with sync_playwright() as p:
        for browser_name in ('chromium', 'firefox', 'webkit'):
            browser = getattr(p, browser_name).launch()
            for role in ('admin', 'oficina', 'repartidor', 'cliente'):
                started = time.perf_counter()
                context = browser.new_context(accept_downloads=True, viewport={'width':1280,'height':900})
                context.add_init_script("""window.__vitals = {lcp: null}; try { new PerformanceObserver(list => { for (const e of list.getEntries()) window.__vitals.lcp = e.startTime; }).observe({type:'largest-contentful-paint', buffered:true}); } catch {}""")
                context.tracing.start(screenshots=True, snapshots=True)
                page = context.new_page()
                api_times = []
                page.on('requestfinished', lambda request: api_times.append({'url':request.url.split('?')[0], 'ms':request.timing['responseEnd']}) if '/api/v1/' in request.url else None)
                row = {'browser': browser_name, 'role':role}
                try:
                    page.goto(BASE)
                    page.get_by_placeholder('usuario@ecologistica.pe').fill(f'{role}@sprint4.example.test')
                    page.locator('input[type=password]').fill(PASSWORD)
                    page.get_by_role('button', name='Iniciar Sesión', exact=False).click()
                    expect(page.get_by_text('Cerrar Sesión', exact=True)).to_be_visible()
                    if role in ('admin','oficina'):
                        page.get_by_role('button', name='Sostenibilidad', exact=True).click()
                        page.get_by_label('Desde', exact=True).fill('2026-06-01')
                        page.get_by_label('Hasta', exact=True).fill('2026-06-01')
                        page.get_by_role('button', name='Actualizar indicadores').click()
                        expect(page.get_by_text('100 km', exact=True)).to_be_visible()
                        expect(page.get_by_text('45 kg CO₂', exact=True)).to_be_visible()
                        with page.expect_response(lambda response: response.url.endswith('/reportes') and response.request.method == 'POST') as created:
                            page.get_by_role('button', name='Generar reporte PDF').click()
                        job_id = created.value.json()['id']
                        expect(page.get_by_text('Reporte solicitado.', exact=False)).to_be_visible()
                        page.get_by_role('button', name='Actualizar indicadores').click()
                        token = page.evaluate("localStorage.getItem('ecologistica_access_token')")
                        deadline = time.monotonic() + 40
                        while time.monotonic() < deadline:
                            status = context.request.get(API + '/reportes/' + job_id, headers={'Authorization':'Bearer '+token})
                            if status.json()['estado'] == 'LISTO': break
                            time.sleep(.5)
                        else: raise AssertionError('El reporte nuevo no finalizó')
                        page.get_by_role('button', name='Actualizar indicadores').click()
                        expect(page.get_by_role('button', name='Descargar PDF').first).to_be_visible(timeout=40000)
                        with page.expect_download() as download:
                            page.get_by_role('button', name='Descargar PDF').first.click()
                        download.value.save_as(OUT / f'{browser_name}-{role}.pdf')
                        page.get_by_label('Proyecto de prueba (%)').fill('100')
                        page.get_by_role('button', name='Calcular y preparar PDF').click()
                        expect(page.get_by_text('0.045 créditos estimados', exact=False)).to_be_visible()
                        page.get_by_label('Proyecto de prueba (%)').fill('90')
                        page.get_by_role('button', name='Calcular y preparar PDF').click()
                        expect(page.get_by_role('alert')).to_contain_text('100 %')
                        context.set_offline(True)
                        page.get_by_role('button', name='Actualizar indicadores').click()
                        expect(page.get_by_role('alert')).to_be_visible(timeout=15000)
                        context.set_offline(False)
                        page.get_by_role('button', name='Actualizar indicadores').click()
                        expect(page.get_by_text('100 km', exact=True)).to_be_visible()
                    else:
                        expect(page.get_by_role('button', name='Sostenibilidad', exact=True)).to_have_count(0)
                        token = page.evaluate("localStorage.getItem('ecologistica_access_token')")
                        response = context.request.get(API + '/analitica/resumen?desde=2026-06-01&hasta=2026-06-01', headers={'Authorization':'Bearer '+token})
                        assert response.status == 403, response.status
                        expect(page.get_by_role('heading', name='Mis entregas' if role == 'repartidor' else 'Mis pedidos y preferencias', exact=True)).to_be_visible()
                    page.screenshot(path=str(OUT / f'{browser_name}-{role}.png'), full_page=True)
                    row['status'] = 'PASS'
                except Exception as exc:
                    row.update(status='FAIL', error=str(exc))
                    page.screenshot(path=str(OUT / f'{browser_name}-{role}-failure.png'), full_page=True)
                finally:
                    row['elapsed_ms'] = round((time.perf_counter()-started)*1000)
                    row['api_timings'] = api_times
                    row['navigation'] = page.evaluate("JSON.parse(JSON.stringify(performance.getEntriesByType('navigation')))")
                    row['paint'] = page.evaluate("performance.getEntriesByType('paint').map(e => ({name:e.name,ms:e.startTime}))")
                    row['lcp_ms'] = page.evaluate('window.__vitals.lcp')
                    context.tracing.stop(path=str(OUT / f'{browser_name}-{role}-trace.zip'))
                    context.close(); results.append(row)
                    print(browser_name, role, row['status'], flush=True)
            browser.close()
    (OUT/'results.json').write_text(json.dumps(results, indent=2, ensure_ascii=False), encoding='utf-8')
    body = ''.join(f'<tr><td>{r["browser"]}</td><td>{r["role"]}</td><td>{r["status"]}</td><td>{r["elapsed_ms"]}</td><td>{html.escape(r.get("error",""))}</td></tr>' for r in results)
    (OUT/'index.html').write_text('<!doctype html><html lang="es"><meta charset="utf-8"><title>Pruebas Sprint 4</title><style>body{font:16px sans-serif;margin:3rem}td,th{padding:1rem;border:1px solid #aaa}table{border-collapse:collapse}</style><h1>Pruebas funcionales por roles</h1><p>Ejecución automatizada contra la API y base de pruebas. No es una encuesta SUS de participantes.</p><table><tr><th>Navegador</th><th>Rol</th><th>Resultado</th><th>ms</th><th>Detalle</th></tr>'+body+'</table></html>', encoding='utf-8')
    return 1 if any(r['status'] != 'PASS' for r in results) else 0


if __name__ == '__main__':
    raise SystemExit(run())
