import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, beforeEach, test, expect } from 'vitest';
import { SostenibilidadView } from './SostenibilidadView';
import { api } from '../services/api';
vi.mock('../services/api', () => ({ API_BASE_URL: '/api/v1', api: { get: vi.fn(), post: vi.fn(), put: vi.fn() } }));
const config = { fuente: 'Fuente de pruebas', vigencia: '2020-01-01', precios_por_galon: { DIESEL: 20 }, kg_por_arbol: 20, horizonte_anios: 10, kg_por_credito: 1000, proyectos: [{ id:'a', nombre:'Proyecto A' }] };
const summary = { desde:'2026-06-01', hasta:'2026-06-01', totales:{rutas:1, distancia_km:100, co2_kg:45, costo_pen:200, consumo_gal:10, energia_kwh:0, parametros_incompletos:0}, variacion_porcentaje:{co2_kg:0}, estados:{COMPLETADA:1}, ahorro_co2_kg:0, metodologia:'Estimaciones de itinerario' };
beforeEach(() => {
  vi.resetAllMocks();
  localStorage.setItem('ecologistica_auth_user', JSON.stringify({rol:'ADMIN'}));
  vi.mocked(api.get).mockImplementation(async path => ({status:200, data:path.includes('configuracion') ? config : path === '/reportes' ? [] : summary}) as any);
});
test('loads dashboard, units and historical comparison', async () => {
  render(<SostenibilidadView />);
  expect(await screen.findByText('100 km')).toBeInTheDocument();
  expect(screen.getByText('45 kg CO₂')).toBeInTheDocument();
  expect(screen.getByText('Variación: 0 %')).toBeInTheDocument();
});
test('requests a report and shows its asynchronous notification', async () => {
  vi.mocked(api.post).mockResolvedValue({status:202,data:{id:'job'}});
  render(<SostenibilidadView />); await screen.findByText('100 km');
  fireEvent.click(screen.getByText('Generar reporte PDF'));
  expect(await screen.findByText(/Reporte solicitado/)).toBeInTheDocument();
  expect(api.post).toHaveBeenCalledWith('/reportes', expect.objectContaining({desde:expect.any(String)}));
});
test('does not fabricate success when report generation fails', async () => {
  vi.mocked(api.post).mockRejectedValue(new Error('No se encontraron datos para generar el reporte en el periodo especificado.'));
  render(<SostenibilidadView />); await screen.findByText('100 km');
  fireEvent.click(screen.getByText('Generar reporte PDF'));
  expect(await screen.findByRole('alert')).toHaveTextContent('No se encontraron datos');
  expect(screen.queryByText(/Reporte solicitado/)).not.toBeInTheDocument();
});
test('calculates distribution and shows proposal', async () => {
  vi.mocked(api.post).mockResolvedValue({status:200,data:{arboles:3,creditos:.045,aviso:'Propuesta estimada',proyectos:[{nombre:'Proyecto A',porcentaje:100,arboles:3}]}});
  render(<SostenibilidadView />);
  fireEvent.change(await screen.findByLabelText('Proyecto A (%)'), {target:{value:'100'}});
  fireEvent.click(screen.getByText('Calcular y preparar PDF'));
  expect(await screen.findByText(/0.045 créditos estimados/)).toBeInTheDocument();
  expect(api.post).toHaveBeenCalledWith('/compensacion/propuestas', expect.objectContaining({distribucion:{a:100}}));
});
test('admin saves validated factors and office cannot see configuration form', async () => {
  vi.mocked(api.put).mockResolvedValue({status:200,data:config});
  const view = render(<SostenibilidadView />); await screen.findByText('100 km');
  fireEvent.click(screen.getByText('Guardar configuración'));
  await waitFor(() => expect(api.put).toHaveBeenCalled());
  expect(await screen.findByText(/Configuración guardada/)).toBeInTheDocument();
  view.unmount(); localStorage.setItem('ecologistica_auth_user', JSON.stringify({rol:'OFICINA'}));
  render(<SostenibilidadView />); await screen.findByText('100 km');
  expect(screen.queryByText('Guardar configuración')).not.toBeInTheDocument();
});
test('empty history and missing parameters are visible', async () => {
  vi.mocked(api.get).mockImplementation(async path => ({status:200,data:path.includes('configuracion') ? null : path === '/reportes' ? [] : {...summary,totales:{...summary.totales,rutas:0,costo_pen:null,parametros_incompletos:1}}}) as any);
  render(<SostenibilidadView />);
  expect(await screen.findByText('No hay rutas completadas en este periodo.')).toBeInTheDocument();
  expect(screen.getByText('No configurado')).toBeInTheDocument();
});
test('report retries and downloads use authenticated access', async () => {
  vi.mocked(api.get).mockImplementation(async path => ({status:200,data:path.includes('configuracion') ? config : path === '/reportes' ? [{id:'a',estado:'LISTO',tipo:'REPORTE',desde:'2026-06-01',hasta:'2026-06-01'},{id:'b',estado:'ERROR',tipo:'REPORTE'}] : summary}) as any);
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ok:false}));
  vi.mocked(api.post).mockResolvedValue({status:202,data:{}});
  render(<SostenibilidadView />);
  fireEvent.click(await screen.findByText('Descargar PDF'));
  expect(await screen.findByRole('alert')).toHaveTextContent('PDF no está disponible');
  fireEvent.click(screen.getByText('Reintentar'));
  await waitFor(() => expect(api.post).toHaveBeenCalledWith('/reportes/b/reintentar'));
  vi.unstubAllGlobals();
});
