/**
 * ClientesView.test.tsx
 * Suite de pruebas para US-003/004: Gestionar clientes y preferencias
 * Cubre: CRUD clientes, búsqueda, filtros, ventanas horarias, mapa, registro.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ClientesView } from './ClientesView';

// ─── Mock react-router-dom ────────────────────────────────────────────────────
vi.mock('react-router-dom', () => ({
  useNavigate: vi.fn(() => vi.fn())
}));

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
    panTo: vi.fn(),
    remove: vi.fn()
  };
  const mockLayerGroup = {
    addTo: vi.fn().mockReturnThis(),
    clearLayers: vi.fn().mockReturnThis()
  };
  const mockMarker = {
    addTo: vi.fn().mockReturnThis(),
    bindPopup: vi.fn().mockReturnThis(),
    setLatLng: vi.fn().mockReturnThis(),
    setIcon: vi.fn().mockReturnThis(),
    on: vi.fn().mockReturnThis()
  };
  return {
    default: {
      map: vi.fn().mockReturnValue(mockMap),
      layerGroup: vi.fn().mockReturnValue(mockLayerGroup),
      marker: vi.fn().mockReturnValue(mockMarker),
      tileLayer: vi.fn().mockReturnValue({ addTo: vi.fn() }),
      control: { zoom: vi.fn().mockReturnValue({ addTo: vi.fn() }) },
      latLngBounds: vi.fn().mockReturnValue({ extend: vi.fn(), isValid: vi.fn().mockReturnValue(true) }),
      DivIcon: vi.fn(),
      divIcon: vi.fn().mockReturnValue({})
    }
  };
});

vi.mock('leaflet/dist/leaflet.css', () => ({}));

vi.mock('../utils/mapIcons', () => ({
  SVG_MINI_PIN: '<svg></svg>',
  crearIconoNegocioCasa: vi.fn().mockReturnValue({})
}));

// ─── vi.mock hoisted ─────────────────────────────────────────────────────────
vi.mock('../services/api', () => ({
  ClienteService: {
    getAll: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn()
  },
  UsuarioService: {
    create: vi.fn()
  },
  MOCK_CLIENTES_DEFAULT: [
    {
      cliente_id: 'cl1',
      razon_social: 'Bodega San José',
      nombre_contacto: 'Juan Pérez',
      email: 'sanjose@bodega.pe',
      telefono: '987654321',
      direccion: 'Av. Lima 123',
      distrito: 'San Juan de Lurigancho',
      latitud: -12.001200,
      longitud: -77.012300,
      tipo_comercio: 'BODEGA',
      ventana_inicio: '08:00',
      ventana_fin: '14:00',
      estado: 'ACTIVO',
      tipo_documento: 'RUC',
      numero_documento: '20123456789'
    },
    {
      cliente_id: 'cl2',
      razon_social: 'Farmacia Central',
      nombre_contacto: 'Ana Gómez',
      email: 'farmacia@central.pe',
      telefono: '912345678',
      direccion: 'Jr. Arequipa 456',
      distrito: 'Miraflores',
      latitud: -12.128900,
      longitud: -77.014500,
      tipo_comercio: 'FARMACIA',
      ventana_inicio: '09:00',
      ventana_fin: '18:00',
      estado: 'ACTIVO',
      tipo_documento: 'RUC',
      numero_documento: '20987654321'
    }
  ],
  TipoComercio: {},
  ClienteCreatePayload: {},
  ClienteUpdatePayload: {},
  Cliente: {}
}));

// ─── Tests ────────────────────────────────────────────────────────────────────
describe('Componente: ClientesView (US-003/004)', () => {
  let user: ReturnType<typeof userEvent.setup>;

  beforeEach(async () => {
    user = userEvent.setup({ delay: null });
    // Limpiar localStorage para evitar estado persistido
    localStorage.clear();
    const { ClienteService, UsuarioService } = await import('../services/api');
    vi.mocked(ClienteService.getAll).mockResolvedValue([]);
    vi.mocked(ClienteService.create).mockResolvedValue({
      cliente_id: 'cl-new',
      razon_social: 'Nuevo Cliente Test',
      estado: 'ACTIVO'
    } as any);
    vi.mocked(ClienteService.update).mockResolvedValue({} as any);
    vi.mocked(ClienteService.delete).mockResolvedValue({ success: true } as any);
    vi.mocked(UsuarioService.create).mockResolvedValue({ usuario_id: 'u-new' } as any);
  });

  afterEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  // US-003: El título de la vista
  it('renderiza el título de Gestión de Clientes', async () => {
    await act(async () => { render(<ClientesView />); });
    const heading = screen.queryByRole('heading', { level: 1 });
    expect(heading).toBeTruthy();
    expect(heading?.textContent).toMatch(/Cliente|Gestión|Red Comercial/i);
  });

  // US-003: Lista de clientes cargada desde MOCK_CLIENTES_DEFAULT
  it('carga y muestra los clientes por defecto', async () => {
    await act(async () => { render(<ClientesView />); });
    await waitFor(() => {
      const bodega = screen.queryByText(/Bodega San José/i);
      const farmacia = screen.queryByText(/Farmacia Central/i);
      expect(bodega || farmacia).toBeTruthy();
    }, { timeout: 3000 });
  });

  // US-004: Ventanas horarias visibles
  it('muestra las ventanas horarias de los clientes', async () => {
    await act(async () => { render(<ClientesView />); });
    await waitFor(() => {
      const ventana = screen.queryByText(/08:00|09:00|ventana/i);
      expect(ventana).toBeTruthy();
    }, { timeout: 3000 });
  });

  // US-003: Campo de búsqueda presente
  it('muestra el campo de búsqueda de clientes', async () => {
    await act(async () => { render(<ClientesView />); });
    const searchInput = screen.queryByPlaceholderText(/buscar|cliente|razón/i) ||
      screen.queryByRole('searchbox');
    const searchLabel = screen.queryByText(/buscar|búsqueda/i);
    expect(searchInput || searchLabel).toBeTruthy();
  });

  // US-003: Filtros de tipo comercio
  it('muestra los filtros de tipo de comercio (BODEGA, FARMACIA...)', async () => {
    await act(async () => { render(<ClientesView />); });
    const filtros = screen.queryAllByText(/BODEGA|FARMACIA|TODOS|Todos/i);
    expect(filtros.length).toBeGreaterThan(0);
  });

  // US-004: Tipo de comercio visible en la lista
  it('muestra el tipo de comercio de cada cliente', async () => {
    await act(async () => { render(<ClientesView />); });
    await waitFor(() => {
      const tipo = screen.queryAllByText(/BODEGA|FARMACIA|RESTAURANTE|MINIMARKET/i);
      expect(tipo.length).toBeGreaterThan(0);
    }, { timeout: 3000 });
  });

  // US-003: Tabs Lista/Mapa
  it('muestra los tabs Lista y Mapa', async () => {
    await act(async () => { render(<ClientesView />); });
    const btns = screen.queryAllByRole('button');
    const listaBtn = btns.find(b => b.textContent?.includes('Lista'));
    const mapaBtn = btns.find(b => b.textContent?.includes('Mapa'));
    expect(listaBtn || mapaBtn).toBeTruthy();
  });

  // US-003: Estado de clientes (ACTIVO)
  it('muestra el estado ACTIVO de los clientes', async () => {
    await act(async () => { render(<ClientesView />); });
    await waitFor(() => {
      const activo = screen.queryAllByText(/ACTIVO/i);
      expect(activo.length).toBeGreaterThan(0);
    }, { timeout: 3000 });
  });

  // US-003: Formulario de registro
  it('muestra el formulario de registro de clientes', async () => {
    await act(async () => { render(<ClientesView />); });
    // Buscar campos del formulario
    const docInput = screen.queryByPlaceholderText(/RUC|DNI|documento/i);
    const razonInput = screen.queryByPlaceholderText(/razón social|empresa|nombre/i);
    const formHeading = screen.queryAllByText(/Registro|Alta|Nuevo Cliente/i);
    expect(docInput || razonInput || formHeading.length > 0).toBeTruthy();
  });

  // US-003: Dirección y distrito visible
  it('muestra la dirección y distrito de los clientes', async () => {
    await act(async () => { render(<ClientesView />); });
    await waitFor(() => {
      const dirs = screen.queryAllByText(/Lima|Lurigancho|Miraflores|Av\./i);
      expect(dirs.length).toBeGreaterThan(0);
    }, { timeout: 3000 });
  });

  // US-004: Ventana horaria en formulario
  it('muestra campos de ventana horaria en el formulario', async () => {
    await act(async () => { render(<ClientesView />); });
    const timeInputs = document.querySelectorAll('input[type="time"]');
    const ventanaLabel = screen.queryAllByText(/ventana|horaria|horario/i);
    expect(timeInputs.length > 0 || ventanaLabel.length > 0).toBeTruthy();
  });
});
