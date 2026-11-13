/**
 * api.test.ts
 * Suite de pruebas para los servicios de la capa API (VehiculoService, ConductorService,
 * PedidoService, ClienteService, RutaService, UsuarioService).
 * Cubre la ruta Supabase (fetch ok) y el respaldo contra la API propia (fetch nativo).
 *
 * La capa `api` ya no depende de axios: es un cliente mínimo sobre `fetch`, por lo
 * que ambos caminos se simulan con la misma función global.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  VehiculoService,
  ConductorService,
  PedidoService,
  ClienteService,
  RutaService,
  UsuarioService,
  MOCK_CLIENTES_DEFAULT
} from './api';

// ─── Helpers ──────────────────────────────────────────────────────────────────
const respuestaOk = (data: any) =>
  ({
    ok: true,
    status: 200,
    json: () => Promise.resolve(data),
    text: () => Promise.resolve('')
  } as any);

const respuestaNoOk = () =>
  ({
    ok: false,
    status: 503,
    statusText: 'Service Unavailable',
    json: () => Promise.resolve([]),
    text: () => Promise.resolve('servicio no disponible')
  } as any);

const makeFetchOk = (data: any) => vi.fn().mockResolvedValue(respuestaOk(data));

const makeFetchFail = () => vi.fn().mockRejectedValue(new Error('Network error'));

const makeFetchNotOk = () => vi.fn().mockResolvedValue(respuestaNoOk());

/** Primer intento (Supabase) con el comportamiento indicado; el segundo responde la API propia. */
const makeFetchFallback = (
  primerIntento: 'error' | 'vacio' | 'no-ok',
  data: any
) => {
  let llamada = 0;
  return vi.fn().mockImplementation(() => {
    llamada += 1;
    if (llamada === 1) {
      if (primerIntento === 'error') return Promise.reject(new Error('Network error'));
      if (primerIntento === 'no-ok') return Promise.resolve(respuestaNoOk());
      return Promise.resolve(respuestaOk([]));
    }
    return Promise.resolve(respuestaOk(data));
  });
};

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

  it('getAll pide una ventana paginada y una proyección de columnas', async () => {
    global.fetch = makeFetchOk([MOCK_VEHICULO]);
    await VehiculoService.getAll(undefined, { limite: 12, desplazamiento: 24 });
    const callUrl = (global.fetch as any).mock.calls[0][0] as string;
    expect(callUrl).toContain('limit=12');
    expect(callUrl).toContain('offset=24');
    expect(callUrl).not.toContain('select=*');
    expect(callUrl).toContain('select=vehiculo_id,placa');
  });

  it('getAll usa la API propia cuando fetch lanza error', async () => {
    global.fetch = makeFetchFallback('error', [MOCK_VEHICULO]);
    const result = await VehiculoService.getAll();
    expect(result).toEqual([MOCK_VEHICULO]);
    expect(global.fetch).toHaveBeenCalledTimes(2);
  });

  it('getAll usa la API propia cuando fetch retorna array vacío', async () => {
    global.fetch = makeFetchFallback('vacio', [MOCK_VEHICULO]);
    const result = await VehiculoService.getAll();
    expect(result).toEqual([MOCK_VEHICULO]);
  });

  it('getById retorna vehículo de Supabase', async () => {
    global.fetch = makeFetchOk([MOCK_VEHICULO]);
    const result = await VehiculoService.getById('v1');
    expect(result).toEqual(MOCK_VEHICULO);
  });

  it('getById usa el respaldo cuando fetch no retorna datos', async () => {
    global.fetch = makeFetchFallback('vacio', MOCK_VEHICULO);
    const result = await VehiculoService.getById('v1');
    expect(result).toEqual(MOCK_VEHICULO);
  });

  it('create retorna vehículo creado de Supabase', async () => {
    global.fetch = makeFetchOk([MOCK_VEHICULO]);
    const { vehiculo_id, ...payload } = MOCK_VEHICULO;
    const result = await VehiculoService.create(payload);
    expect(result).toEqual(MOCK_VEHICULO);
  });

  it('create usa el respaldo cuando fetch falla', async () => {
    global.fetch = makeFetchFallback('error', MOCK_VEHICULO);
    const { vehiculo_id, ...payload } = MOCK_VEHICULO;
    const result = await VehiculoService.create(payload);
    expect(result).toEqual(MOCK_VEHICULO);
  });

  it('update usa el respaldo cuando fetch responde no-ok', async () => {
    global.fetch = makeFetchFallback('no-ok', MOCK_VEHICULO);
    const result = await VehiculoService.update('v1', { estado: 'MANTENIMIENTO' });
    expect(result).toEqual(MOCK_VEHICULO);
  });

  it('delete llama fetch DELETE y usa el respaldo', async () => {
    global.fetch = makeFetchFallback('error', MOCK_VEHICULO);
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

  it('getAll usa el respaldo cuando fetch falla', async () => {
    global.fetch = makeFetchFallback('error', [MOCK_CONDUCTOR]);
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

  it('getAll pide una ventana paginada', async () => {
    global.fetch = makeFetchOk([MOCK_PEDIDO]);
    await PedidoService.getAll({ limite: 12, desplazamiento: 0 });
    const callUrl = (global.fetch as any).mock.calls[0][0] as string;
    expect(callUrl).toContain('limit=12');
    expect(callUrl).toContain('offset=0');
  });

  it('getAll usa el respaldo cuando Supabase falla', async () => {
    global.fetch = makeFetchFallback('error', [MOCK_PEDIDO]);
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

  it('getAll usa MOCK_CLIENTES_DEFAULT cuando Supabase y la API fallan', async () => {
    global.fetch = makeFetchFail();
    const result = await ClienteService.getAll();
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBeGreaterThan(0);
  });
});

// ─── RutaService ──────────────────────────────────────────────────────────────
describe('RutaService', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('list consulta la API propia con parámetros de filtro', async () => {
    global.fetch = makeFetchOk([]);
    const result = await RutaService.list('2026-01-01', 'OPTIMIZADA');
    expect(Array.isArray(result)).toBe(true);
    const callUrl = (global.fetch as any).mock.calls[0][0] as string;
    expect(callUrl).toContain('/rutas?fecha=2026-01-01');
    expect(callUrl).toContain('estado=OPTIMIZADA');
  });

  it('getZonasRiesgo retorna zonas de Supabase', async () => {
    global.fetch = makeFetchOk([{ zona_id: 'z1', nombre: 'ZBE Centro', tipo: 'ZBE', nivel_riesgo: 'ALTO', poligono: [], descripcion: '' }]);
    const result = await RutaService.getZonasRiesgo();
    expect(Array.isArray(result)).toBe(true);
  });

  it('optimizar llama al endpoint correcto', async () => {
    global.fetch = makeFetchOk({ rutas: [], pedidos_no_asignados: [], resumen: {} });
    const result = await RutaService.optimizar({
      pedido_ids: ['p1'], vehiculo_ids: ['v1'],
      fecha_operacion: '2026-01-01', hora_inicio: '07:00', hora_fin: '18:00'
    });
    expect(result).toBeDefined();
    const [url, init] = (global.fetch as any).mock.calls[0];
    expect(url).toContain('/rutas/optimizar');
    expect(init.method).toBe('POST');
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

  it('getAll usa el respaldo cuando Supabase falla', async () => {
    global.fetch = makeFetchFallback('error', []);
    const result = await UsuarioService.getAll();
    expect(Array.isArray(result)).toBe(true);
  });

  it('getCatalogoPermisos usa el respaldo cuando Supabase falla', async () => {
    global.fetch = makeFetchFallback('error', {
      roles_disponibles: [],
      catalogo_permisos: []
    });
    const result = await UsuarioService.getCatalogoPermisos();
    expect(result).toBeDefined();
  });
});
