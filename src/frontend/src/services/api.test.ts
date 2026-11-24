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
  api
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

describe('Servicios integrados con FastAPI', () => {
  it('cierra una sesión rechazada y avisa a la aplicación sin confundirla con un error de red', async () => {
    localStorage.setItem('ecologistica_access_token', 'expired-token');
    localStorage.setItem('ecologistica_auth_user', '{}');
    const expired = vi.fn();
    window.addEventListener('ecologistica-session-expired', expired);
    global.fetch = vi.fn().mockResolvedValue({ok:false,status:401,text:async()=>JSON.stringify({detail:'Inicia sesión con una cuenta activa'})});
    try {
      await expect(api.get('/usuarios/')).rejects.toThrow('Inicia sesión');
      expect(localStorage.getItem('ecologistica_access_token')).toBeNull();
      expect(localStorage.getItem('ecologistica_auth_user')).toBeNull();
      expect(expired).toHaveBeenCalledOnce();
    } finally { window.removeEventListener('ecologistica-session-expired', expired); }
  });
  beforeEach(() => { vi.clearAllMocks(); localStorage.clear(); });
  it.each([
    ['vehículos', () => VehiculoService.getAll(), '/vehiculos'],
    ['conductores', () => ConductorService.getAll(), '/conductores'],
    ['pedidos', () => PedidoService.getAll(), '/pedidos'],
    ['usuarios', () => UsuarioService.getAll(), '/usuarios'],
  ])('consulta %s en la misma API que genera rutas', async (_name, call, path) => {
    global.fetch = makeFetchOk([]);
    expect(await (call as Function)()).toEqual([]);
    expect((global.fetch as any).mock.calls[0][0]).toContain(path);
    expect((global.fetch as any).mock.calls[0][0]).not.toContain('supabase');
  });
  it('envía el token de sesión y mantiene los filtros', async () => {
    localStorage.setItem('ecologistica_access_token', 'token-test');
    global.fetch = makeFetchOk([]);
    await PedidoService.getAll({estado: 'PENDIENTE', prioridad: 'ALTA', limite: 12, desplazamiento: 24});
    const [url, init] = (global.fetch as any).mock.calls[0];
    expect(url).toContain('skip=24'); expect(url).toContain('limit=12');
    expect(url).toContain('prioridad=ALTA');
    expect(init.headers.Authorization).toBe('Bearer token-test');
  });
  it.each([
    ['crear pedido', () => PedidoService.create({} as any)],
    ['guardar preferencias', () => PedidoService.updatePreferencias('p1', {ventana_inicio:'09:00'})],
    ['crear vehículo', () => VehiculoService.create({} as any)],
    ['actualizar conductor', () => ConductorService.update('c1', {estado:'DESCANSO'})],
  ])('propaga el fallo al %s, sin fabricar un guardado local', async (_name, call) => {
    global.fetch = makeFetchNotOk();
    await expect((call as Function)()).rejects.toThrow('servicio no disponible');
    expect(global.fetch).toHaveBeenCalledTimes(1);
  });
  it('conserva el detalle de una validación rechazada por el servidor', async () => {
    global.fetch = vi.fn().mockResolvedValue({ok:false, status:400, text:async () => JSON.stringify({detail:'Pedido en tránsito'})});
    await expect(PedidoService.updatePreferencias('p1', {ventana_inicio:'09:00'})).rejects.toMatchObject({response:{status:400,data:{detail:'Pedido en tránsito'}}});
  });
  it('lee y modifica un vehículo con la respuesta persistida', async () => {
    const vehicle = {vehiculo_id:'v1', altura_m:2.2, es_ligero:true};
    global.fetch = makeFetchOk(vehicle);
    expect(await VehiculoService.getById('v1')).toEqual(vehicle);
    expect(await VehiculoService.create(vehicle as any)).toEqual(vehicle);
    expect(await VehiculoService.update('v1', {altura_m:2.2})).toEqual(vehicle);
    await VehiculoService.delete('v1');
    expect((global.fetch as any).mock.calls.at(-1)[1].method).toBe('DELETE');
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

  it('rechaza la lectura fallida de clientes sin fabricar datos de demostración', async () => {
    global.fetch = makeFetchFail();
    await expect(ClienteService.getAll()).rejects.toThrow();
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

describe('Usuarios', () => {
  it('recupera el catálogo desde el servidor', async () => {
    global.fetch = makeFetchOk({roles_disponibles:[],catalogo_permisos:[]});
    expect(await UsuarioService.getCatalogoPermisos()).toEqual({roles_disponibles:[],catalogo_permisos:[]});
  });
});

describe('Contratos HTTP de los recursos del Sprint 3',()=>{
  it.each([
    ['VehiculoService','getById',['id-1'],'GET','/vehiculos/id-1'],
    ['VehiculoService','update',['id-1',{estado:'DISPONIBLE'}],'PUT','/vehiculos/id-1'],
    ['VehiculoService','delete',['id-1'],'DELETE','/vehiculos/id-1'],
    ['ConductorService','getById',['id-1'],'GET','/conductores/id-1'],
    ['ConductorService','create',[{dni:'12345678'}],'POST','/conductores'],
    ['ConductorService','update',['id-1',{telefono:'999888777'}],'PUT','/conductores/id-1'],
    ['ConductorService','delete',['id-1'],'DELETE','/conductores/id-1'],
    ['ConductorService','validarJornada',['id-1',1.5],'POST','/conductores/id-1/validar-jornada?horas_ruta=1.5'],
    ['ConductorService','acumularHoras',['id-1',1.5],'POST','/conductores/id-1/acumular-horas?horas=1.5'],
    ['ConductorService','reiniciarJornada',['id-1'],'POST','/conductores/id-1/reiniciar-jornada'],
    ['PedidoService','getCuentasClientes',[],'GET','/clientes/cuentas'],
    ['PedidoService','getById',['id-1'],'GET','/pedidos/id-1'],
    ['PedidoService','getByCodigo',['PED A/1'],'GET','/pedidos/codigo/PED%20A%2F1'],
    ['PedidoService','updateEstado',['id-1','EN_TRANSITO'],'PATCH','/pedidos/id-1/estado'],
    ['PedidoService','delete',['id-1'],'DELETE','/pedidos/id-1'],
    ['UsuarioService','getById',['id-1'],'GET','/usuarios/id-1'],
    ['UsuarioService','create',[{email:'test@example.test'}],'POST','/usuarios'],
    ['UsuarioService','update',['id-1',{estado:'BLOQUEADO'}],'PUT','/usuarios/id-1'],
    ['UsuarioService','delete',['id-1'],'DELETE','/usuarios/id-1'],
    ['ClienteService','getById',['id-1'],'GET','/clientes/id-1'],
    ['ClienteService','create',[{razon_social:'Prueba'}],'POST','/clientes'],
    ['ClienteService','update',['id-1',{estado:'ACTIVO'}],'PUT','/clientes/id-1'],
    ['ClienteService','delete',['id-1'],'DELETE','/clientes/id-1'],
    ['RutaService','getById',['id-1'],'GET','/rutas/id-1'],
    ['RutaService','reoptimizar',['id-1',{evitar_zona_riesgo:true}],'POST','/rutas/id-1/reoptimizar'],
  ])('%s.%s usa el método, recurso y autenticación correctos',async(service,method,args,httpMethod,path)=>{
    const services=await import('./api');
    global.fetch=makeFetchOk({ok:true});
    localStorage.setItem('ecologistica_access_token','test-only-token');
    await (services as any)[service as string][method as string](...(args as any[]));
    const [url,init]=(global.fetch as any).mock.calls[0];
    expect(url).toContain(path);expect(init.method).toBe(httpMethod);
    expect(init.headers.Authorization).toBe('Bearer test-only-token');
    localStorage.removeItem('ecologistica_access_token');
  });
});
