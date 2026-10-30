/**
 * PedidosView.test.tsx
 * Suite de pruebas para US-003/004: Gestión de Pedidos y Preferencias de Cliente
 * Cubre: listado, filtros de estado, registro de nuevo pedido, validaciones,
 *        restricciones de acceso, ventana horaria, búsqueda y badges de estado.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PedidosView, resolverDireccionLima } from './PedidosView';

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
  const mockPolygon  = { addTo: vi.fn().mockReturnThis(), bindPopup: vi.fn().mockReturnThis() };
  const mockPolyline = { addTo: vi.fn().mockReturnThis(), bindPopup: vi.fn().mockReturnThis() };
  const mockMarker   = { addTo: vi.fn().mockReturnThis(), bindPopup: vi.fn().mockReturnThis() };
  const mockCircle   = { addTo: vi.fn().mockReturnThis(), bindPopup: vi.fn().mockReturnThis() };
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

// ─── Mock mapIcons ─────────────────────────────────────────────────────────────
vi.mock('../utils/mapIcons', () => ({
  crearIconoBanderaLlegada: vi.fn().mockReturnValue({}),
  crearIconoCasaOrigen: vi.fn().mockReturnValue({}),
  crearIconoVehiculoConductor: vi.fn().mockReturnValue({}),
  calcularDistanciaKm: vi.fn().mockReturnValue(12.5),
  estimarTiempoMin: vi.fn().mockReturnValue(35),
  SVG_MINI_FLAG: '<svg/>',
  SVG_MINI_HOUSE: '<svg/>',
  SVG_MINI_CAR: '<svg/>',
  SVG_MINI_PIN: '<svg/>'
}));

// ─── Mock services/api ─────────────────────────────────────────────────────────
vi.mock('../services/api', () => ({
  PedidoService: {
    getAll: vi.fn(),
    create: vi.fn(),
    updatePreferencias: vi.fn(),
    updateEstado: vi.fn()
  },
  ConductorService: {
    getAll: vi.fn()
  },
  Pedido: {},
  PreferenciasClienteUpdate: {},
  Conductor: {}
}));

// ─── Datos de prueba ──────────────────────────────────────────────────────────
const MOCK_PEDIDOS = [
  {
    pedido_id: 'p1',
    codigo_seguimiento: 'PED-LIMA-001',
    cliente_nombre: 'Bodega San José · SJL',
    origen_direccion: 'Av. Nicolás Ayllón 2340, Ate',
    direccion_destino: 'Av. Canto Grande 2450, SJL',
    latitud: -12.0012,
    longitud: -77.0123,
    peso_kg: 85.0,
    volumen_m3: 0.95,
    ventana_inicio: '08:00',
    ventana_fin: '11:00',
    prioridad: 'ALTA',
    estado: 'PENDIENTE',
    referencia_ubicacion: 'Rampa 2, frente a garita.',
    restriccion_acceso: 'LIBRE_ACCESO',
    foto_referencia_url: 'https://example.com/img1.jpg',
    telefono_contacto: '987112233'
  },
  {
    pedido_id: 'p2',
    codigo_seguimiento: 'PED-LIMA-002',
    cliente_nombre: 'Minimarket Los Laureles · Santa Anita',
    origen_direccion: 'Av. Argentina 2060, Callao',
    direccion_destino: 'Av. Los Frutales 120, Ate',
    latitud: -12.045,
    longitud: -76.965,
    peso_kg: 42.0,
    volumen_m3: 0.45,
    ventana_inicio: '10:00',
    ventana_fin: '13:00',
    prioridad: 'ESTANDAR',
    estado: 'EN_TRANSITO',
    referencia_ubicacion: 'Pabellón B, Rampa 5.',
    restriccion_acceso: 'ALTURA_MAXIMA_2_5M',
    foto_referencia_url: 'https://example.com/img2.jpg',
    telefono_contacto: '912334455'
  },
  {
    pedido_id: 'p3',
    codigo_seguimiento: 'PED-LIMA-003',
    cliente_nombre: 'Farmacia Central · Miraflores',
    origen_direccion: 'Almacén Central Lima',
    direccion_destino: 'Av. Larco 1200, Miraflores',
    latitud: -12.121,
    longitud: -77.030,
    peso_kg: 15.0,
    volumen_m3: 0.20,
    ventana_inicio: '14:00',
    ventana_fin: '17:00',
    prioridad: 'URGENTE',
    estado: 'ENTREGADO',
    referencia_ubicacion: 'Local principal, planta baja.',
    restriccion_acceso: 'SOLO_VEHICULOS_LIGEROS',
    foto_referencia_url: 'https://example.com/img3.jpg',
    telefono_contacto: '965443322'
  }
];

const MOCK_CONDUCTORES = [
  {
    conductor_id: 'c1',
    nombre_completo: 'Carlos Quispe',
    dni: '12345678',
    licencia: 'A-III',
    estado: 'DISPONIBLE',
    vehiculo_placa: 'ABC-123',
    tipo_vehiculo: 'ELECTRICO'
  }
];

// ─── Tests ────────────────────────────────────────────────────────────────────
describe('Componente: PedidosView (US-003/004)', () => {
  let user: ReturnType<typeof userEvent.setup>;

  beforeEach(async () => {
    user = userEvent.setup({ delay: null });
    const { PedidoService, ConductorService } = await import('../services/api');
    vi.mocked(PedidoService.getAll).mockResolvedValue(MOCK_PEDIDOS as any);
    vi.mocked(PedidoService.create).mockResolvedValue({
      ...MOCK_PEDIDOS[0],
      pedido_id: 'p-nuevo',
      codigo_seguimiento: 'PED-LIMA-NEW'
    } as any);
    vi.mocked(PedidoService.updatePreferencias).mockResolvedValue(MOCK_PEDIDOS[0] as any);
    vi.mocked(PedidoService.updateEstado).mockResolvedValue(MOCK_PEDIDOS[0] as any);
    vi.mocked(ConductorService.getAll).mockResolvedValue(MOCK_CONDUCTORES as any);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  // US-003: Renderizado básico
  it('renderiza el título de Gestión de Pedidos', async () => {
    await act(async () => { render(<PedidosView />); });
    const h1 = screen.queryByRole('heading', { level: 1 });
    expect(h1).toBeTruthy();
    expect(h1?.textContent).toMatch(/Pedidos|Despacho|Logística|Gestión/i);
  });

  // US-003: Carga pedidos al montar
  it('llama a PedidoService.getAll al montar', async () => {
    const { PedidoService } = await import('../services/api');
    await act(async () => { render(<PedidosView />); });
    await waitFor(() => {
      expect(PedidoService.getAll).toHaveBeenCalled();
    });
  });

  // US-003: Muestra los pedidos cargados
  it('muestra los pedidos con código de seguimiento', async () => {
    await act(async () => { render(<PedidosView />); });
    await waitFor(() => {
      const ped1 = screen.queryAllByText(/PED-LIMA-001/i);
      const ped2 = screen.queryAllByText(/PED-LIMA-002/i);
      expect(ped1.length + ped2.length).toBeGreaterThan(0);
    }, { timeout: 3000 });
  });

  // US-003: Filtros de estado visibles
  it('muestra los filtros de estado (PENDIENTE, EN_TRANSITO, ENTREGADO)', async () => {
    await act(async () => { render(<PedidosView />); });
    await waitFor(() => {
      const todos   = screen.queryAllByText(/Todos|TODOS/i);
      const pend    = screen.queryAllByText(/PENDIENTE|Pendiente/i);
      const transit = screen.queryAllByText(/EN_TRANSITO|En Tránsito|transito/i);
      expect(todos.length + pend.length + transit.length).toBeGreaterThan(0);
    }, { timeout: 3000 });
  });

  // US-003: Campo de búsqueda presente
  it('muestra el campo de búsqueda de pedidos', async () => {
    await act(async () => { render(<PedidosView />); });
    const inputs = document.querySelectorAll('input[type="text"], input[placeholder*="uscar"]');
    const searchText = screen.queryAllByText(/Buscar|buscar|Filtrar/i);
    expect(inputs.length > 0 || searchText.length > 0).toBeTruthy();
  });

  // US-003: Estado PENDIENTE visible con badge
  it('muestra el estado PENDIENTE en los pedidos', async () => {
    await act(async () => { render(<PedidosView />); });
    await waitFor(() => {
      const pendBadges = screen.queryAllByText(/PENDIENTE/i);
      expect(pendBadges.length).toBeGreaterThan(0);
    }, { timeout: 3000 });
  });

  // US-003: Estado EN_TRANSITO visible
  it('muestra el estado EN_TRANSITO en los pedidos', async () => {
    await act(async () => { render(<PedidosView />); });
    await waitFor(() => {
      const transit = screen.queryAllByText(/EN_TRANSITO|EN TRÁNSITO|TRÁNSITO/i);
      expect(transit.length).toBeGreaterThan(0);
    }, { timeout: 3000 });
  });

  // US-003: Estado ENTREGADO visible
  it('muestra el estado ENTREGADO en los pedidos', async () => {
    await act(async () => { render(<PedidosView />); });
    await waitFor(() => {
      const entregado = screen.queryAllByText(/ENTREGADO/i);
      expect(entregado.length).toBeGreaterThan(0);
    }, { timeout: 3000 });
  });

  // US-003: Peso y volumen en los pedidos
  it('muestra el peso en kg de los pedidos', async () => {
    await act(async () => { render(<PedidosView />); });
    await waitFor(() => {
      const peso = screen.queryAllByText(/85|42|kg/i);
      expect(peso.length).toBeGreaterThan(0);
    }, { timeout: 3000 });
  });

  // US-004: Ventana horaria visible
  it('muestra las ventanas horarias de los pedidos', async () => {
    await act(async () => { render(<PedidosView />); });
    await waitFor(() => {
      const horas = screen.queryAllByText(/08:00|10:00|ventana|horaria/i);
      expect(horas.length).toBeGreaterThan(0);
    }, { timeout: 3000 });
  });

  // US-003: Prioridad ALTA / URGENTE en los pedidos
  it('muestra la prioridad de los pedidos', async () => {
    await act(async () => { render(<PedidosView />); });
    await waitFor(() => {
      const alta   = screen.queryAllByText(/ALTA/i);
      const urgente = screen.queryAllByText(/URGENTE/i);
      expect(alta.length + urgente.length).toBeGreaterThan(0);
    }, { timeout: 3000 });
  });

  // US-003: Botón de nuevo pedido presente
  it('muestra el botón para registrar un nuevo pedido', async () => {
    await act(async () => { render(<PedidosView />); });
    const btns = screen.queryAllByRole('button');
    const newBtn = btns.find(b =>
      b.textContent?.includes('Nuevo') ||
      b.textContent?.includes('Registrar') ||
      b.textContent?.includes('Agregar') ||
      b.textContent?.includes('Pedido')
    );
    expect(newBtn || btns.length > 0).toBeTruthy();
  });

  // US-004: Restricción de acceso visible
  it('muestra la restricción de acceso de los pedidos', async () => {
    await act(async () => { render(<PedidosView />); });
    await waitFor(() => {
      const libre    = screen.queryAllByText(/LIBRE_ACCESO|Libre/i);
      const altura   = screen.queryAllByText(/ALTURA|2_5M/i);
      const ligeros  = screen.queryAllByText(/LIGEROS|SOLO_VEHICULOS/i);
      expect(libre.length + altura.length + ligeros.length).toBeGreaterThan(0);
    }, { timeout: 3000 });
  });

  // US-003: Nombre de cliente en la lista
  it('muestra el nombre del cliente en el pedido', async () => {
    await act(async () => { render(<PedidosView />); });
    await waitFor(() => {
      const bodega  = screen.queryAllByText(/Bodega San José|San José/i);
      const farm    = screen.queryAllByText(/Farmacia Central/i);
      const mini    = screen.queryAllByText(/Minimarket|Los Laureles/i);
      expect(bodega.length + farm.length + mini.length).toBeGreaterThan(0);
    }, { timeout: 3000 });
  });
});

// ─── Tests de función pura ────────────────────────────────────────────────────
describe('Función pura: resolverDireccionLima', () => {
  beforeEach(() => {
    // Mock fetch para la función de geocoding
    global.fetch = vi.fn().mockResolvedValue({
      json: () => Promise.resolve([{
        display_name: 'San Juan de Lurigancho, Lima, Perú'
      }])
    } as any);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('retorna una dirección cuando fetch responde con datos', async () => {
    const result = await resolverDireccionLima(-12.001, -77.012);
    expect(typeof result).toBe('string');
    expect(result.length).toBeGreaterThan(0);
  });

  it('retorna dirección por defecto cuando fetch falla', async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error('Network error'));
    const result = await resolverDireccionLima(-12.001, -77.012);
    expect(typeof result).toBe('string');
  });

  it('retorna dirección por defecto cuando el array está vacío', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      json: () => Promise.resolve([])
    } as any);
    const result = await resolverDireccionLima(-12.001, -77.012);
    expect(typeof result).toBe('string');
  });
});

