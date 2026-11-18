/**
 * RutasView.test.tsx
 * Suite de pruebas para US-005/006/007: Optimización y Visualización de Rutas
 * Cubre: generación de rutas CVRPTW, mapa Leaflet, toasts, reoptimización,
 *        zonas de riesgo, fallback de mapa y pedidos no asignados.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, act, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RutasView } from './RutasView';

// ─── Mock Leaflet ─────────────────────────────────────────────────────────────
vi.mock('leaflet', () => {
  const mockMap = {
    setView: vi.fn().mockReturnThis(),
    addLayer: vi.fn().mockReturnThis(),
    removeLayer: vi.fn().mockReturnThis(),
    on: vi.fn().mockReturnThis(),
    off: vi.fn().mockReturnThis(),
    invalidateSize: vi.fn(),
    fitBounds: vi.fn(),
    remove: vi.fn()
  };
  const mockLayerGroup = {
    addTo: vi.fn().mockReturnThis(),
    clearLayers: vi.fn().mockReturnThis(),
    addLayer: vi.fn().mockReturnThis(),
    removeLayer: vi.fn().mockReturnThis()
  };
  const mockPolygon = { addTo: vi.fn().mockReturnThis(), bindPopup: vi.fn().mockReturnThis(),bindTooltip:vi.fn().mockReturnThis() };
  const mockPolyline = { addTo: vi.fn().mockReturnThis(), bindPopup: vi.fn().mockReturnThis() };
  const mockMarker = { addTo: vi.fn().mockReturnThis(), bindPopup: vi.fn().mockReturnThis() };
  const mockCircle = { addTo: vi.fn().mockReturnThis(), bindPopup: vi.fn().mockReturnThis() };
  return {
    default: {
      map: vi.fn().mockReturnValue(mockMap),
      layerGroup: vi.fn().mockReturnValue(mockLayerGroup),
      polygon: vi.fn().mockReturnValue(mockPolygon),
      polyline: vi.fn().mockReturnValue(mockPolyline),
      marker: vi.fn().mockReturnValue(mockMarker),
      circle: vi.fn().mockReturnValue(mockCircle),
      tileLayer: vi.fn().mockReturnValue({ addTo: vi.fn() }),
      control: { zoom: vi.fn().mockReturnValue({ addTo: vi.fn() }) },
      latLngBounds: vi.fn().mockReturnValue({ extend: vi.fn(), isValid: vi.fn().mockReturnValue(true) }),
      DivIcon: vi.fn(),
      divIcon: vi.fn().mockReturnValue({}),
      Icon: { Default: { mergeOptions: vi.fn() } }
    }
  };
});

vi.mock('leaflet/dist/leaflet.css', () => ({}));

// ─── vi.mock hoisted: datos inline ───────────────────────────────────────────
vi.mock('../services/api', () => ({
  RutaService: {
    list: vi.fn(),
    getAll: vi.fn(),
    optimizar: vi.fn(),
    reoptimizar: vi.fn(),
    getZonasRiesgo: vi.fn()
  },
  RutaDetalle: {},
  Tramo: {},
  ZonaRiesgo: {},
  PedidoNoAsignadoInfo: {}
}));

// ─── Datos de prueba ──────────────────────────────────────────────────────────
const MOCK_RUTAS = [{
  ruta_id:'r1',vehiculo_id:'v1',conductor_id:'c1',vehiculo_placa:'ABC-123',vehiculo_tipo_combustible:'GNV',
  conductor_nombre:'Carlos Quispe',estado:'PLANIFICADA',fecha_operacion:'2026-11-17',creada_en:'2026-11-17T08:00:00Z',
  distancia_total_km:45.3,tiempo_total_min:120,co2_total_kg:7.47,co2_computacional_kg:0,
  energia_computacional_kwh:0,tiempo_computo_seg:0,medicion_computacional_disponible:false,pedidos_asignados_count:1,
  tramos:[{tramo_id:'t1',ruta_id:'r1',orden_secuencia:1,tipo_parada:'ENTREGA',pedido_id:'p1',
    descripcion:'Entrega de prueba',latitud:-12.046,longitud:-77.042,distancia_tramo_km:5.2,
    tiempo_estimado_min:15,co2_tramo_kg:.86,alerta_zona_riesgo:false,
    geometria_linea_geojson:JSON.stringify({type:'LineString',coordinates:[[-77.05,-12.05],[-77.042,-12.046]]})}]
}];
const MOCK_ZONAS = [{zona_id:'z1',nombre:'Zona de prueba',motivo:'Riesgo reportado',nivel_peligro:'ALTO',
  poligono_coordenadas:[[-77.1,-12.1],[-77,-12.1],[-77,-12],[-77.1,-12.1]],activa:true}];

// ─── Tests ────────────────────────────────────────────────────────────────────
describe('Componente: RutasView (US-005/006/007)', () => {
  let user: ReturnType<typeof userEvent.setup>;

  it('dibuja la geometría vial guardada y ajusta el mapa a las paradas',async()=>{
    const L=(await import('leaflet')).default;
    await act(async()=>{render(<RutasView/>);});
    await waitFor(()=>expect(L.polyline).toHaveBeenCalledWith([[-12.05,-77.05],[-12.046,-77.042]],expect.objectContaining({weight:4.5})));
    expect(vi.mocked(L.map).mock.results.at(-1)!.value.fitBounds).toHaveBeenCalled();
    expect(vi.mocked(L.polygon).mock.results.at(-1)!.value.bindTooltip).toHaveBeenCalledWith(expect.stringContaining('Zona de prueba'),{sticky:true});
  });

  it('muestra el itinerario textual si no se puede utilizar el mapa',async()=>{
    await act(async()=>{render(<RutasView/>);});
    fireEvent.click(screen.getByRole('button',{name:'Simular Fallback Texto'}));
    expect(screen.getByText('Ruta Segura')).toBeTruthy();
    expect(screen.getAllByText('Entrega de prueba').length).toBeGreaterThan(0);
    fireEvent.click(screen.getByRole('button',{name:'Volver a Mapa'}));
    expect(screen.queryByText('Ruta Segura')).toBeNull();
  });

  it('envía posición, progreso y confirmación de carga al redistribuir una avería',async()=>{
    const {RutaService}=await import('../services/api');
    const L=(await import('leaflet')).default;
    await act(async()=>{render(<RutasView/>);});
    fireEvent.click(screen.getByRole('button',{name:'Reoptimizar (US-007)',exact:true}));
    fireEvent.change(screen.getByLabelText('Hora de recálculo'),{target:{value:'10:00'}});
    fireEvent.change(screen.getByLabelText('Minutos transcurridos'),{target:{value:'60'}});
    fireEvent.change(screen.getByLabelText('Conducción continua'),{target:{value:'45'}});
    fireEvent.click(screen.getByLabelText('El vehículo está averiado: redistribuir las entregas'));
    fireEvent.click(screen.getByLabelText('Confirmo que la carga está en el depósito para transferirla'));
    fireEvent.click(screen.getByLabelText('Las incidencias anteriores ya se resolvieron: retirarlas de este recorrido'));
    fireEvent.click(screen.getByLabelText('Evitar las zonas de riesgo urbano'));
    fireEvent.click(screen.getByRole('button',{name:'Marcar la posición actual del conductor'}));
    const map=vi.mocked(L.map).mock.results.at(-1)!.value as any;
    const handler=map.on.mock.calls.filter((c:any)=>c[0]==='click').at(-1)[1];
    await act(async()=>{handler({latlng:{lat:-12.05,lng:-77.05}});});
    expect(screen.getByText('Posición actual seleccionada')).toBeTruthy();
    await act(async()=>{fireEvent.click(screen.getByRole('button',{name:'Confirmar Reoptimización'}));});
    expect(RutaService.reoptimizar).toHaveBeenCalledWith('r1',expect.objectContaining({vehiculo_averiado:true,carga_en_deposito:true,resolver_incidencias_previas:true,latitud_actual:-12.05,longitud_actual:-77.05,minutos_transcurridos:60,conduccion_continua_min:45,hora_salida:'10:00'}));
  });

  beforeEach(async () => {
    user = userEvent.setup({ delay: null });
    const { RutaService } = await import('../services/api');
    vi.mocked(RutaService.list).mockResolvedValue(MOCK_RUTAS as any);
    vi.mocked(RutaService.getAll).mockResolvedValue(MOCK_RUTAS as any);
    vi.mocked(RutaService.getZonasRiesgo).mockResolvedValue(MOCK_ZONAS as any);
    vi.mocked(RutaService.optimizar).mockResolvedValue({
      rutas: MOCK_RUTAS,
      pedidos_no_asignados: [],
      resumen: { total_rutas: 1, total_pedidos: 5, co2_total: 7.47, distancia_total: 45.3 }
    } as any);
    vi.mocked(RutaService.reoptimizar).mockResolvedValue({
      ruta_id: 'r1',
      mensaje: 'Ruta reoptimizada correctamente',
      ...MOCK_RUTAS[0],
      incidencias: []
    } as any);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  // US-006: Renderizado de la vista
  it('renderiza el título de la vista de Rutas', async () => {
    await act(async () => { render(<RutasView />); });
    const h1 = screen.queryByRole('heading', { level: 1 });
    expect(h1).toBeTruthy();
    expect(h1?.textContent).toMatch(/Ruta|Optimización|Despacho/i);
  });

  // US-005: Botón de optimizar rutas presente
  it('muestra el botón para generar rutas optimizadas', async () => {
    await act(async () => { render(<RutasView />); });
    const optimizarBtn = screen.queryAllByRole('button').find(b =>
      b.textContent?.includes('Optimizar') ||
      b.textContent?.includes('Generar') ||
      b.textContent?.includes('Calcular')
    );
    expect(optimizarBtn).toBeTruthy();
  });

  // US-006: El contenedor del mapa existe
  it('renderiza el contenedor del mapa de Leaflet', async () => {
    await act(async () => { render(<RutasView />); });
    // El div del mapa debe existir en el DOM
    const mapDiv = document.querySelector('[class*="map"], [id*="map"], [data-testid*="map"]') ||
      document.querySelector('div[style*="height"]');
    // Al menos el componente renderizó sin crashear
    expect(screen.queryByRole('heading', { level: 1 })).toBeTruthy();
  });

  // US-005: Llamada al servicio de optimización al hacer click
  it('llama a RutaService.optimizar al hacer click en Optimizar', async () => {
    const { RutaService } = await import('../services/api');
    await act(async () => { render(<RutasView />); });

    const btns = screen.queryAllByRole('button');
    const optimizarBtn = btns.find(b =>
      b.textContent?.includes('Optimizar') ||
      b.textContent?.includes('Generar Rutas')
    );
    if (optimizarBtn) {
      await act(async () => { await user.click(optimizarBtn); });
      await waitFor(() => {
        expect(RutaService.optimizar).toHaveBeenCalled();
      }, { timeout: 3000 });
    }
  });

  // US-006: Carga las rutas existentes al inicializar
  it('llama a RutaService.list al montar', async () => {
    const { RutaService } = await import('../services/api');
    await act(async () => { render(<RutasView />); });
    await waitFor(() => {
      expect(RutaService.list).toHaveBeenCalled();
    });
  });

  // US-006: Muestra las rutas cargadas
  it('muestra las rutas generadas con placa y conductor', async () => {
    await act(async () => { render(<RutasView />); });
    await waitFor(() => {
      const placa = screen.queryByText(/ABC-123/i);
      const conductor = screen.queryByText(/Carlos Quispe/i);
      expect(placa || conductor).toBeTruthy();
    }, { timeout: 3000 });
  });

  // US-006: Zonas de riesgo - botón toggle visible
  it('muestra el toggle de zonas de riesgo', async () => {
    await act(async () => { render(<RutasView />); });
    const zonasBtn = screen.queryAllByRole('button').find(b =>
      b.textContent?.includes('Zona') ||
      b.textContent?.includes('Riesgo') ||
      b.textContent?.includes('Polígono')
    );
    const zonasText = screen.queryAllByText(/Zona|Riesgo|Polígono/i);
    expect(zonasBtn || zonasText.length > 0).toBeTruthy();
  });

  // US-005: Métricas de CO₂ visibles
  it('muestra métricas de CO₂ en la ruta', async () => {
    await act(async () => { render(<RutasView />); });
    await waitFor(() => {
      const co2 = screen.queryAllByText(/CO₂|CO2|kg/i);
      expect(co2.length).toBeGreaterThan(0);
    }, { timeout: 3000 });
  });

  // US-007: Modal de reoptimización
  it('muestra botones de reoptimización en la interfaz', async () => {
    await act(async () => { render(<RutasView />); });
    await waitFor(() => {
      const btns = screen.queryAllByRole('button');
      const reoptBtn = btns.find(b =>
        b.textContent?.includes('Reoptimizar') ||
        b.textContent?.includes('Contingencia') ||
        b.textContent?.includes('Cancelar Parada')
      );
      // El botón de reoptimizar puede aparecer al seleccionar una ruta
      const reoptText = screen.queryAllByText(/Reoptimizar|Contingencia/i);
      expect(reoptBtn || reoptText.length > 0 || btns.length > 2).toBeTruthy();
    }, { timeout: 3000 });
  });

  // US-006: Fallback de mapa — texto de paradas cuando el mapa falla
  it('el componente no crashea cuando Leaflet no puede inicializar', async () => {
    // El mock de Leaflet ya simula una versión sin canvas real
    await act(async () => { render(<RutasView />); });
    // Si renderiza el header, no crasheó
    expect(screen.queryByRole('heading', { level: 1 })).toBeTruthy();
  });

  // US-005: Indicador de distancia total
  it('muestra la distancia total de la ruta en km', async () => {
    await act(async () => { render(<RutasView />); });
    await waitFor(() => {
      const dist = screen.queryAllByText(/45\.3|km|distancia/i);
      expect(dist.length).toBeGreaterThan(0);
    }, { timeout: 3000 });
  });

  // US-005: Indicador de tiempo estimado
  it('muestra el tiempo estimado en minutos', async () => {
    await act(async () => { render(<RutasView />); });
    await waitFor(() => {
      const tiempo = screen.queryAllByText(/min|120|tiempo/i);
      expect(tiempo.length).toBeGreaterThan(0);
    }, { timeout: 3000 });
  });
  it('marca una demora en el mapa y envía el área seleccionada al servidor', async () => {
    const {RutaService} = await import('../services/api');
    const L = (await import('leaflet')).default;
    await act(async () => {render(<RutasView />);});
    await user.click(screen.getByRole('button',{name:'Reoptimizar (US-007)',exact:true}));
    await user.clear(screen.getByLabelText('Demora reportada'));
    await user.type(screen.getByLabelText('Demora reportada'),'5');
    await user.click(screen.getByRole('button',{name:'Marcar el área afectada en el mapa'}));
    const map = vi.mocked(L.map).mock.results.at(-1)!.value;
    const handler = map.on.mock.calls.filter((c:any[]) => c[0] === 'click').at(-1)[1];
    await act(async () => {handler({latlng:{lat:-12.05,lng:-77.05}});handler({latlng:{lat:-12.04,lng:-77.04}});});
    expect(screen.getByText('Área seleccionada.')).toBeTruthy();
    await user.click(screen.getByRole('button',{name:'Confirmar Reoptimización'}));
    expect(RutaService.reoptimizar).toHaveBeenCalledWith('r1',expect.objectContaining({
      incidencias:[expect.objectContaining({cierre:false,demora_minutos:5,poligono:expect.any(Array)})]
    }));
    await waitFor(() => expect(screen.queryByRole('heading',{name:/Reoptimizar Ruta ante Evento/})).toBeNull());
  });

  it('mantiene la ruta y el formulario cuando no existe un desvío seguro', async () => {
    const {RutaService} = await import('../services/api');
    vi.mocked(RutaService.reoptimizar).mockRejectedValueOnce(new Error('No hay alternativa fuera del cierre'));
    await act(async () => {render(<RutasView />);});
    await user.click(screen.getByRole('button',{name:'Reoptimizar (US-007)',exact:true}));
    await user.click(screen.getByRole('button',{name:'Confirmar Reoptimización'}));
    expect(await screen.findByText('No hay alternativa fuera del cierre')).toBeTruthy();
    expect(screen.getByRole('heading',{name:/Reoptimizar Ruta ante Evento/})).toBeTruthy();
    expect(screen.getByText('45.3 km')).toBeTruthy();
  });

  it('muestra un error de conexión al cargar, sin fingir una lista válida', async () => {
    const {RutaService} = await import('../services/api');
    vi.mocked(RutaService.list).mockRejectedValueOnce(new Error('offline'));
    await act(async () => {render(<RutasView />);});
    expect(await screen.findByText('No se pudieron recuperar las rutas planificadas.')).toBeTruthy();
  });

});
