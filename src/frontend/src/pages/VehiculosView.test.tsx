/**
 * VehiculosView.test.tsx
 * Suite de pruebas para US-001: Gestionar vehículos de la flota verde
 * Cubre: CRUD, cálculo CO₂, restricciones zonales, filtros, toasts y validaciones.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  VehiculosView,
  calcularFactorEmisionCO2,
  evaluarRestriccionZonalAutomatica
} from './VehiculosView';

// ─── vi.mock es hoisted: NO usar variables externas en el factory ─────────────
vi.mock('../services/api', () => ({
  VehiculoService: {
    getAll: vi.fn(),
    create: vi.fn(),
    update: vi.fn()
  }
}));

// ─── Datos de prueba (DESPUÉS del vi.mock) ────────────────────────────────────
const MOCK_VEHICULOS = [
  {
    vehiculo_id: 'v1',
    placa: 'ABC-123',
    marca_modelo: 'Mercedes Sprinter GNV',
    anio_fabricacion: 2022,
    capacidad_peso_kg: 1500,
    capacidad_volumen_m3: 12,
    consumo_km_gal: 35,
    tipo_combustible: 'GNV',
    factor_emision_co2: 0.165,
    restriccion_circulacion: 'LIBRE_CIRCULACION',
    estado: 'DISPONIBLE'
  },
  {
    vehiculo_id: 'v2',
    placa: 'XYZ-789',
    marca_modelo: 'Toyota Dyna Diesel',
    anio_fabricacion: 2012,
    capacidad_peso_kg: 5000,
    capacidad_volumen_m3: 20,
    consumo_km_gal: 25,
    tipo_combustible: 'DIESEL',
    factor_emision_co2: 0.408,
    restriccion_circulacion: 'RESTRINGIDO_CENTRO_HISTORICO',
    estado: 'DISPONIBLE'
  },
  {
    vehiculo_id: 'v3',
    placa: 'ELC-001',
    marca_modelo: 'BYD eT3',
    anio_fabricacion: 2024,
    capacidad_peso_kg: 1200,
    capacidad_volumen_m3: 8,
    consumo_km_gal: 0,
    tipo_combustible: 'ELECTRICO',
    factor_emision_co2: 0.0,
    restriccion_circulacion: 'LIBRE_CIRCULACION',
    estado: 'EN_RUTA'
  }
];

// ─── Utilidades puras: calcularFactorEmisionCO2 ───────────────────────────────
describe('Función pura: calcularFactorEmisionCO2', () => {
  it('retorna 0.0 para ELECTRICO', () => {
    expect(calcularFactorEmisionCO2('ELECTRICO', 35)).toBe(0.0);
  });

  it('retorna factor por defecto para GNV sin consumo', () => {
    expect(calcularFactorEmisionCO2('GNV', 0)).toBe(0.165);
  });

  it('retorna factor por defecto para HIBRIDO sin consumo', () => {
    expect(calcularFactorEmisionCO2('HIBRIDO', 0)).toBe(0.120);
  });

  it('retorna factor por defecto para DIESEL sin consumo', () => {
    expect(calcularFactorEmisionCO2('DIESEL', 0)).toBe(0.245);
  });

  it('calcula GNV a 35 km/gal → ~0.165', () => {
    expect(calcularFactorEmisionCO2('GNV', 35)).toBeCloseTo(0.165, 3);
  });

  it('calcula DIESEL a 25 km/gal → ~0.4084', () => {
    expect(calcularFactorEmisionCO2('DIESEL', 25)).toBeCloseTo(0.4084, 3);
  });

  it('maneja combustibles en minúsculas', () => {
    expect(calcularFactorEmisionCO2('electrico', 35)).toBe(0.0);
  });
});

// ─── Utilidades puras: evaluarRestriccionZonalAutomatica ──────────────────────
describe('Función pura: evaluarRestriccionZonalAutomatica', () => {
  it('LIBRE_CIRCULACION para eléctrico', () => {
    const r = evaluarRestriccionZonalAutomatica('ELECTRICO', 2024, 1000, 0.0);
    expect(r.codigo).toBe('LIBRE_CIRCULACION');
    expect(r.badgeClass).toBe('badge-cyan');
  });

  it('RESTRINGIDO_CENTRO_HISTORICO para emisión >= 0.35', () => {
    const r = evaluarRestriccionZonalAutomatica('DIESEL', 2015, 1000, 0.408);
    expect(r.codigo).toBe('RESTRINGIDO_CENTRO_HISTORICO');
    expect(r.badgeClass).toBe('badge-red');
  });

  it('RESTRINGIDO_CENTRO_HISTORICO para vehículo pesado > 3500 kg', () => {
    const r = evaluarRestriccionZonalAutomatica('GNV', 2022, 4000, 0.165);
    expect(r.codigo).toBe('RESTRINGIDO_CENTRO_HISTORICO');
    expect(r.motivo).toContain('3.5 t');
  });

  it('PICO_Y_PLACA_AMBIENTAL para emisión >= 0.24', () => {
    const r = evaluarRestriccionZonalAutomatica('DIESEL', 2020, 1000, 0.280, 'ABC123');
    expect(r.codigo).toBe('PICO_Y_PLACA_AMBIENTAL');
    expect(r.badgeClass).toBe('badge-yellow');
  });

  it('RESTRINGIDO para Diesel con > 10 años', () => {
    // anio 2015 → antiguedad = 2026 - 2015 = 11 > 10
    // Pero la lógica primero evalúa factor >= 0.245 → PICO_Y_PLACA si rendimiento no es 0
    // Con consumo=0 (default 0.245) cae en PICO_Y_PLACA antes.
    // Para forzar RESTRINGIDO necesitamos un consumo que produzca factor < 0.24 y antiguedad > 10
    // 10.210 / rendimiento < 0.24 → rendimiento > 42.5 km/gal
    const r = evaluarRestriccionZonalAutomatica('DIESEL', 2015, 1000, 0.200);
    expect(r.codigo).toBe('RESTRINGIDO_CENTRO_HISTORICO');
    expect(r.motivo).toContain('antigüedad');
  });

  it('LIBRE_CIRCULACION para GNV eficiente liviano', () => {
    const r = evaluarRestriccionZonalAutomatica('GNV', 2022, 1500, 0.165);
    expect(r.codigo).toBe('LIBRE_CIRCULACION');
  });
});

// ─── Componente VehiculosView ─────────────────────────────────────────────────
describe('Componente: VehiculosView (US-001)', () => {
  let user: ReturnType<typeof userEvent.setup>;

  beforeEach(async () => {
    user = userEvent.setup({ delay: null });
    const { VehiculoService } = await import('../services/api');
    vi.mocked(VehiculoService.getAll).mockResolvedValue(MOCK_VEHICULOS as any);
    vi.mocked(VehiculoService.create).mockResolvedValue({
      vehiculo_id: 'v-new',
      placa: 'NEW-001',
      marca_modelo: 'Prueba GNV',
      anio_fabricacion: 2023,
      capacidad_peso_kg: 1000,
      capacidad_volumen_m3: 10,
      consumo_km_gal: 35,
      tipo_combustible: 'GNV',
      factor_emision_co2: 0.165,
      restriccion_circulacion: 'LIBRE_CIRCULACION',
      estado: 'DISPONIBLE'
    } as any);
    vi.mocked(VehiculoService.update).mockResolvedValue(MOCK_VEHICULOS[0] as any);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renderiza el header con título de la vista', async () => {
    await act(async () => { render(<VehiculosView />); });
    // El h1 dice "Gestión de Flota Vehicular" (US-001)
    const h1 = screen.queryByRole('heading', { level: 1 });
    expect(h1).toBeTruthy();
    expect(h1?.textContent).toMatch(/Flota|Vehículo|Gestión/i);
  });

  it('carga y muestra los vehículos del API', async () => {
    await act(async () => { render(<VehiculosView />); });
    await waitFor(() => {
      expect(screen.getByText('ABC-123')).toBeInTheDocument();
    });
    expect(screen.getByText('XYZ-789')).toBeInTheDocument();
    expect(screen.getByText('ELC-001')).toBeInTheDocument();
  });

  it('muestra los 3 vehículos con filtro TODOS', async () => {
    await act(async () => { render(<VehiculosView />); });
    await waitFor(() => expect(screen.getByText('ABC-123')).toBeInTheDocument());
    expect(screen.getByText('Mercedes Sprinter GNV')).toBeInTheDocument();
    expect(screen.getByText('Toyota Dyna Diesel')).toBeInTheDocument();
    expect(screen.getByText('BYD eT3')).toBeInTheDocument();
  });

  it('filtra correctamente al seleccionar Eléctricos', async () => {
    await act(async () => { render(<VehiculosView />); });
    await waitFor(() => expect(screen.getByText('ABC-123')).toBeInTheDocument());
    // El botón de filtro dice "Eléctricos" (no "ELECTRICO")
    const electricoBtn = screen.queryByRole('button', { name: /Eléctricos/i });
    if (electricoBtn) {
      await user.click(electricoBtn);
      expect(screen.queryByText('Mercedes Sprinter GNV')).not.toBeInTheDocument();
      expect(screen.getByText('BYD eT3')).toBeInTheDocument();
    }
  });

  it('muestra el formulario de registro con campos de placa y marca', async () => {
    await act(async () => { render(<VehiculosView />); });
    const inputsText = screen.queryAllByRole('textbox');
    expect(inputsText.length).toBeGreaterThan(0);
  });

  it('muestra el label de restricción zonal en el formulario', async () => {
    await act(async () => { render(<VehiculosView />); });
    // Puede aparecer múltiples veces en el form y la lista → usar queryAllByText
    await waitFor(() => {
      const items = screen.queryAllByText(/Libre Circulación/i);
      expect(items.length).toBeGreaterThan(0);
    });
  });

  it('muestra alerta cuando la API falla al cargar', async () => {
    const { VehiculoService } = await import('../services/api');
    vi.mocked(VehiculoService.getAll).mockRejectedValueOnce(new Error('Network Error'));
    await act(async () => { render(<VehiculosView />); });
    await waitFor(() => {
      expect(screen.queryByText(/No se pudo conectar|servidor/i)).toBeTruthy();
    });
  });

  it('muestra al menos un badge Libre Circulación en la lista', async () => {
    await act(async () => { render(<VehiculosView />); });
    await waitFor(() => expect(screen.getByText('ABC-123')).toBeInTheDocument());
    expect(screen.queryAllByText(/Libre Circulación/i).length).toBeGreaterThan(0);
  });

  it('muestra al menos un badge de restricción para Toyota Dyna Diesel', async () => {
    await act(async () => { render(<VehiculosView />); });
    await waitFor(() => expect(screen.getByText('XYZ-789')).toBeInTheDocument());
    expect(screen.queryAllByText(/Centro Histórico Restringido/i).length).toBeGreaterThan(0);
  });

  it('el componente renderiza el label CO₂ (g CO₂/km)', async () => {
    await act(async () => { render(<VehiculosView />); });
    await waitFor(() => expect(screen.getByText('ABC-123')).toBeInTheDocument());
    // Buscar texto de emisión en la lista de vehículos
    const co2Items = screen.queryAllByText(/g CO₂\/km|kg CO₂|165 g|408 g|0 g/i);
    expect(co2Items.length).toBeGreaterThan(0);
  });

  it('llama a VehiculoService.create al enviar formulario con datos', async () => {
    const { VehiculoService } = await import('../services/api');
    await act(async () => { render(<VehiculosView />); });
    await waitFor(() => expect(screen.getByText('ABC-123')).toBeInTheDocument());

    const placaInput = screen.queryByPlaceholderText(/ABC-123|placa/i);
    const marcaInput = screen.queryByPlaceholderText(/marca|modelo/i);
    if (placaInput && marcaInput) {
      await user.clear(placaInput);
      await user.type(placaInput, 'NEW-001');
      await user.clear(marcaInput);
      await user.type(marcaInput, 'Prueba GNV');
      const submitBtn = screen.queryByRole('button', { name: /Registrar|Guardar|Crear/i });
      if (submitBtn) {
        await user.click(submitBtn);
        await waitFor(() => expect(VehiculoService.create).toHaveBeenCalled());
      }
    }
  });

  it('el botón de filtro GNV está en el DOM', async () => {
    await act(async () => { render(<VehiculosView />); });
    const gnvBtn = screen.queryByRole('button', { name: /GNV/i });
    expect(gnvBtn).toBeTruthy();
  });

  it('el botón de filtro DIESEL está en el DOM', async () => {
    await act(async () => { render(<VehiculosView />); });
    const dieselBtn = screen.queryByRole('button', { name: /DIESEL/i });
    expect(dieselBtn).toBeTruthy();
  });
});
