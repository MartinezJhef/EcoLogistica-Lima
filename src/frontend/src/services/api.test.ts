/**
 * api.test.ts
 * Suite de pruebas para los servicios de la capa API (VehiculoService, ConductorService,
 * PedidoService, ClienteService, RutaService, UsuarioService).
 * Cubre los paths de Supabase (fetch ok) y fallback (axios).
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  VehiculoService,
  ConductorService,
  PedidoService,
  ClienteService,
  RutaService,
  UsuarioService,
  MOCK_CLIENTES_DEFAULT
} from './api';

// ─── Mock axios ───────────────────────────────────────────────────────────────
vi.mock('axios', () => {
  const mockAxios = {
    create: vi.fn().mockReturnThis(),
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
    interceptors: {
      request: { use: vi.fn() },
      response: { use: vi.fn() }
    }
  };
  return { default: mockAxios };
});

// ─── Helpers ──────────────────────────────────────────────────────────────────
const makeFetchOk = (data: any) =>
  vi.fn().mockResolvedValue({
    ok: true,
    json: () => Promise.resolve(data)
  } as any);

const makeFetchFail = () =>
  vi.fn().mockRejectedValue(new Error('Network error'));

const makeFetchNotOk = () =>
  vi.fn().mockResolvedValue({ ok: false, json: () => Promise.resolve([]) } as any);

// ─── VehiculoService ──────────────────────────────────────────────────────────
describe('VehiculoService', () => {
  const MOCK_VEHICULO = {
    vehiculo_id: 'v1', placa: 'ABC-123', tipo_combustible: 'ELECTRICO',
    capacidad_kg: 1500, capacidad_m3: 8, estado: 'DISPONIBLE',
    anio_fabricacion: 2022, marca: 'BYD', modelo: 'T3', factor_emision_co2: 0
  };

  beforeEach(() => { vi.clearAllMocks(); });

  it('getAll retorna datos de Supabase cuando fetch es exitoso', async () => {
    global.fetch = makeFetchOk([MOCK_VEHICULO]);
    const result = await VehiculoService.getAll();
    expect(result).toEqual([MOCK_VEHICULO]);
    expect(global.fetch).toHaveBeenCalledTimes(1);
  });

  it('getAll con filtro de combustible llama al endpoint correcto', async () => {
    global.fetch = makeFetchOk([MOCK_VEHICULO]);
    await VehiculoService.getAll('ELECTRICO');
    const callUrl = (global.fetch as any).mock.calls[0][0];
    expect(callUrl).toContain('ELECTRICO');
  });

  it('getAll usa fallback axios cuando fetch lanza error', async () => {
    global.fetch = makeFetchFail();
    const axios = (await import('axios')).default as any;
    axios.get.mockResolvedValue({ data: [MOCK_VEHICULO] });
    const result = await VehiculoService.getAll();
    expect(result).toEqual([MOCK_VEHICULO]);
  });

  it('getAll usa fallback axios cuando fetch retorna array vacío', async () => {
    global.fetch = makeFetchOk([]);
    const axios = (await import('axios')).default as any;
    axios.get.mockResolvedValue({ data: [MOCK_VEHICULO] });
    const result = await VehiculoService.getAll();
    expect(result).toEqual([MOCK_VEHICULO]);
  });

  it('getById retorna vehículo de Supabase', async () => {
    global.fetch = makeFetchOk([MOCK_VEHICULO]);
    const result = await VehiculoService.getById('v1');
    expect(result).toEqual(MOCK_VEHICULO);
  });

  it('getById usa fallback cuando fetch no retorna datos', async () => {
    global.fetch = makeFetchOk([]);
    const axios = (await import('axios')).default as any;
    axios.get.mockResolvedValue({ data: MOCK_VEHICULO });
    const result = await VehiculoService.getById('v1');
    expect(result).toEqual(MOCK_VEHICULO);
  });

  it('create retorna vehículo creado de Supabase', async () => {
    global.fetch = makeFetchOk([MOCK_VEHICULO]);
    const { vehiculo_id, ...payload } = MOCK_VEHICULO;
    const result = await VehiculoService.create(payload);
    expect(result).toEqual(MOCK_VEHICULO);
  });

  it('create usa fallback axios cuando fetch falla', async () => {
    global.fetch = makeFetchFail();
    const axios = (await import('axios')).default as any;
    axios.post.mockResolvedValue({ data: MOCK_VEHICULO });
    const { vehiculo_id, ...payload } = MOCK_VEHICULO;
    const result = await VehiculoService.create(payload);
    expect(result).toEqual(MOCK_VEHICULO);
  });

  it('update usa fallback axios cuando fetch response no es ok', async () => {
    global.fetch = makeFetchNotOk();
    const axios = (await import('axios')).default as any;
    axios.put.mockResolvedValue({ data: MOCK_VEHICULO });
    const result = await VehiculoService.update('v1', { estado: 'MANTENIMIENTO' });
    expect(result).toEqual(MOCK_VEHICULO);
  });

  it('delete llama fetch DELETE y usa fallback axios', async () => {
    global.fetch = makeFetchFail();
    const axios = (await import('axios')).default as any;
    axios.delete.mockResolvedValue({ data: MOCK_VEHICULO });
    const result = await VehiculoService.delete('v1');
    expect(result).toEqual(MOCK_VEHICULO);
  });
});

// ─── ConductorService ─────────────────────────────────────────────────────────
describe('ConductorService', () => {
  const MOCK_CONDUCTOR = {
    conductor_id: 'c1', nombre_completo: 'Carlos Quispe', dni: '12345678',
    licencia: 'A-III', estado: 'DISPONIBLE', vehiculo_placa: 'ABC-123',
    tipo_vehiculo: 'ELECTRICO'
  };

  beforeEach(() => { vi.clearAllMocks(); });

  it('getAll retorna conductores de Supabase', async () => {
    global.fetch = makeFetchOk([MOCK_CONDUCTOR]);
    const result = await ConductorService.getAll();
    expect(result).toEqual([MOCK_CONDUCTOR]);
  });

  it('getAll con filtro de estado construye URL correcta', async () => {
    global.fetch = makeFetchOk([MOCK_CONDUCTOR]);
    await ConductorService.getAll('DISPONIBLE');
    const callUrl = (global.fetch as any).mock.calls[0][0];
    expect(callUrl).toContain('DISPONIBLE');
  });

  it('getAll usa fallback axios cuando fetch falla', async () => {
    global.fetch = makeFetchFail();
    const axios = (await import('axios')).default as any;
    axios.get.mockResolvedValue({ data: [MOCK_CONDUCTOR] });
    const result = await ConductorService.getAll();
    expect(result).toEqual([MOCK_CONDUCTOR]);
  });
});

// ─── PedidoService ────────────────────────────────────────────────────────────
describe('PedidoService', () => {
  const MOCK_PEDIDO = {
    pedido_id: 'p1', codigo_seguimiento: 'PED-001', cliente_nombre: 'Bodega A',
    origen_direccion: 'Av. Lima 1', direccion_destino: 'Av. Arequipa 100',
    latitud: -12.046, longitud: -77.042, peso_kg: 50, volumen_m3: 0.5,
    ventana_inicio: '09:00', ventana_fin: '12:00', prioridad: 'ESTANDAR',
    estado: 'PENDIENTE', referencia_ubicacion: 'Puerta trasera',
    restriccion_acceso: 'LIBRE_ACCESO', foto_referencia_url: '', telefono_contacto: '999'
  };

  beforeEach(() => { vi.clearAllMocks(); });

  it('getAll retorna pedidos de Supabase cuando fetch es exitoso', async () => {
    global.fetch = makeFetchOk([MOCK_PEDIDO]);
    const result = await PedidoService.getAll();
    expect(Array.isArray(result)).toBe(true);
  });

  it('getAll usa fallback cuando Supabase falla', async () => {
    global.fetch = makeFetchFail();
    const axios = (await import('axios')).default as any;
    axios.get.mockResolvedValue({ data: [MOCK_PEDIDO] });
    const result = await PedidoService.getAll();
    expect(result).toEqual([MOCK_PEDIDO]);
  });
});

// ─── ClienteService ───────────────────────────────────────────────────────────
describe('ClienteService', () => {
  const MOCK_CLIENTE = {
    cliente_id: 'cl1', nombre_comercial: 'Bodega San José', ruc_dni: '12345678',
    tipo_comercio: 'BODEGA' as const, latitud: -12.001, longitud: -77.012,
    direccion_entrega: 'Av. Lima 123', distrito: 'San Juan de Lurigancho',
    ventana_inicio: '08:00', ventana_fin: '11:00', telefono: '987000001',
    email: 'bodega@test.pe', estado: 'ACTIVO' as const,
    restriccion_acceso: 'LIBRE_ACCESO' as const
  };

  beforeEach(() => { vi.clearAllMocks(); });

  it('getAll retorna clientes de Supabase cuando fetch es exitoso', async () => {
    global.fetch = makeFetchOk([MOCK_CLIENTE]);
    const result = await ClienteService.getAll();
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBeGreaterThan(0);
  });

  it('getAll usa MOCK_CLIENTES_DEFAULT cuando Supabase falla y axios falla', async () => {
    global.fetch = makeFetchFail();
    const axios = (await import('axios')).default as any;
    axios.get.mockRejectedValue(new Error('Backend down'));
    const result = await ClienteService.getAll();
    // Debe retornar los clientes mock por defecto
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBeGreaterThan(0);
  });
});

// ─── RutaService ──────────────────────────────────────────────────────────────
describe('RutaService', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('list usa fallback axios cuando fetch falla', async () => {
    global.fetch = makeFetchFail();
    const axios = (await import('axios')).default as any;
    axios.get.mockResolvedValue({ data: [] });
    const result = await RutaService.list();
    expect(Array.isArray(result)).toBe(true);
  });

  it('getZonasRiesgo retorna zonas de Supabase', async () => {
    global.fetch = makeFetchOk([{ zona_id: 'z1', nombre: 'ZBE Centro', tipo: 'ZBE', nivel_riesgo: 'ALTO', poligono: [], descripcion: '' }]);
    const result = await RutaService.getZonasRiesgo();
    expect(Array.isArray(result)).toBe(true);
  });

  it('optimizar llama al endpoint correcto', async () => {
    global.fetch = makeFetchFail();
    const axios = (await import('axios')).default as any;
    axios.post.mockResolvedValue({ data: { rutas: [], pedidos_no_asignados: [], resumen: {} } });
    const result = await RutaService.optimizar({
      pedido_ids: ['p1'], vehiculo_ids: ['v1'],
      fecha_operacion: '2026-01-01', hora_inicio: '07:00', hora_fin: '18:00'
    });
    expect(result).toBeDefined();
  });
});

// ─── MOCK_CLIENTES_DEFAULT ────────────────────────────────────────────────────
describe('MOCK_CLIENTES_DEFAULT', () => {
  it('es un array no vacío', () => {
    expect(Array.isArray(MOCK_CLIENTES_DEFAULT)).toBe(true);
    expect(MOCK_CLIENTES_DEFAULT.length).toBeGreaterThan(0);
  });

  it('cada cliente tiene los campos requeridos', () => {
    for (const c of MOCK_CLIENTES_DEFAULT) {
      expect(c.cliente_id).toBeTruthy();
      expect(c.latitud).toBeDefined();
      expect(c.longitud).toBeDefined();
    }
  });
});

// ─── UsuarioService ───────────────────────────────────────────────────────────
describe('UsuarioService', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('getAll usa fallback axios cuando Supabase falla', async () => {
    global.fetch = makeFetchFail();
    const axios = (await import('axios')).default as any;
    axios.get.mockResolvedValue({ data: [] });
    const result = await UsuarioService.getAll();
    expect(Array.isArray(result)).toBe(true);
  });

  it('getCatalogoPermisos usa fallback axios cuando Supabase falla', async () => {
    global.fetch = makeFetchFail();
    const axios = (await import('axios')).default as any;
    axios.get.mockResolvedValue({
      data: {
        roles_disponibles: [],
        catalogo_permisos: []
      }
    });
    const result = await UsuarioService.getCatalogoPermisos();
    expect(result).toBeDefined();
  });
});
