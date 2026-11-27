/**
 * Cliente HTTP mínimo sobre `fetch` nativo.
 *
 * Sustituye a axios (≈ 13 KB comprimidos) por la API del navegador. Mantiene la
 * misma forma de llamada (`api.get`, `api.post`…) para no tocar los servicios,
 * pero elimina la dependencia del paquete inicial.
 */
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

export interface ApiResponse<T> {
  data: T;
  status: number;
}

const JSON_HEADERS = { 'Content-Type': 'application/json' };

async function request<T>(
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
  path: string,
  body?: unknown,
  params?: Record<string, string | number | boolean>
): Promise<ApiResponse<T>> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), path.includes('/rutas') ? 60000 : 10000);
  const query = params
    ? `?${new URLSearchParams(
        Object.entries(params).map(([clave, valor]) => [clave, String(valor)])
      ).toString()}`
    : '';
  try {
    const res = await fetch(`${API_BASE_URL}${path}${query}`, {
      method,
      headers: { ...JSON_HEADERS, ...(localStorage.getItem('ecologistica_access_token') ? { Authorization: `Bearer ${localStorage.getItem('ecologistica_access_token')}` } : {}) },
      body: body === undefined ? undefined : JSON.stringify(body),
      signal: controller.signal
    });
    if (!res.ok) {
      if (res.status === 401 && localStorage.getItem('ecologistica_access_token') && path !== '/auth/login') {
        localStorage.removeItem('ecologistica_access_token');
        localStorage.removeItem('ecologistica_auth_user');
        window.dispatchEvent(new Event('ecologistica-session-expired'));
      }
      const detalle = await res.text().catch(() => '');
      let message = detalle;
      try { message = JSON.parse(detalle).detail || detalle; } catch {}
      throw Object.assign(new Error(message || `HTTP ${res.status}`), { response: { status: res.status, data: { detail: message } } });
    }
    if (res.status === 204) return { data: undefined as T, status: res.status };
    return { data: (await res.json()) as T, status: res.status };
  } finally {
    clearTimeout(timer);
  }
}

export const api = {
  get: <T>(path: string, config?: { params?: Record<string, string | number | boolean> }) =>
    request<T>('GET', path, undefined, config?.params),
  post: <T>(path: string, body?: unknown) => request<T>('POST', path, body),
  put: <T>(path: string, body?: unknown) => request<T>('PUT', path, body),
  patch: <T>(path: string, body?: unknown) => request<T>('PATCH', path, body),
  delete: <T>(path: string) => request<T>('DELETE', path)
};

async function getAllPages<T>(path: string, filters: Record<string, string> = {}): Promise<T[]> {
  const rows: T[] = [];
  const limit = 500;
  for (let skip = 0; ; skip += limit) {
    const { data } = await api.get<T[]>(path, { params: { ...filters, limit, skip } });
    rows.push(...data);
    if (data.length < limit) return rows;
  }
}

export interface Vehiculo {
  altura_m?: number | null;
  es_ligero?: boolean | null;
  vehiculo_id: string;
  placa: string;
  marca_modelo: string;
  anio_fabricacion?: number;
  capacidad_peso_kg: number;
  capacidad_volumen_m3: number;
  consumo_km_gal?: number;
  tipo_combustible: 'DIESEL' | 'GNV' | 'ELECTRICO' | 'HIBRIDO';
  factor_emision_co2: number;
  restriccion_circulacion?: string;
  estado: string;
}

export interface Conductor {
  conductor_id: string;
  dni: string;
  nombres: string;
  apellidos: string;
  licencia: string;
  licencia_vencimiento?: string;
  categoria_licencia?: string;
  telefono: string;
  direccion_origen?: string;
  latitud_origen?: number;
  longitud_origen?: number;
  estado: string;
  horas_conduccion_hoy: number;
}

export interface ValidarJornadaResponse {
  conductor_id: string;
  conductor_nombre: string;
  estado_actual: string;
  horas_acumuladas_hoy: number;
  horas_solicitadas: number;
  horas_proyectadas: number;
  limite_legal_horas: number;
  aprobado: boolean;
  mensaje: string;
}

export interface Pedido {
  usuario_cliente_id?: string;
  pedido_id: string;
  ruta_id?: string | null;
  codigo_seguimiento: string;
  cliente_nombre: string;
  origen_direccion?: string;
  origen_lat?: number;
  origen_lng?: number;
  direccion_destino: string;
  latitud: number;
  longitud: number;
  peso_kg: number;
  volumen_m3: number;
  ventana_inicio: string;
  ventana_fin: string;
  prioridad: string;
  estado: string;
  referencia_ubicacion?: string;
  referencia_destino?: string;
  restriccion_acceso?: string;
  foto_referencia_url?: string;
  telefono_contacto?: string;
  creado_en?: string;
}

export interface PreferenciasClienteUpdate {
  ventana_inicio?: string;
  ventana_fin?: string;
  restriccion_acceso?: string;
  referencia_ubicacion?: string;
  foto_referencia_url?: string;
  telefono_contacto?: string;
}

export type TipoComercio = 'BODEGA' | 'SUPERMERCADO' | 'RESTAURANTE' | 'FARMACIA' | 'DISTRIBUIDORA' | 'PARTICULAR';

export interface Cliente {
  cliente_id: string;
  tipo_documento: 'RUC' | 'DNI' | 'CE';
  numero_documento: string;
  razon_social: string;
  nombre_contacto?: string;
  telefono: string;
  email?: string;
  direccion: string;
  distrito: string;
  latitud: number;
  longitud: number;
  tipo_comercio: TipoComercio;
  ventana_entrega_inicio: string;
  ventana_entrega_fin: string;
  restriccion_acceso: string;
  estado: 'ACTIVO' | 'INACTIVO';
  creado_en?: string;
}

export type ClienteCreatePayload = Omit<Cliente, 'cliente_id' | 'creado_en'>;
export type ClienteUpdatePayload = Partial<ClienteCreatePayload>;

export const VehiculoService = {
  getAll: (tipo?: string): Promise<Vehiculo[]> => getAllPages('/vehiculos', tipo && tipo !== 'TODOS' ? { tipo_combustible: tipo } : {}),
  getById: async (id: string): Promise<Vehiculo> => (await api.get<Vehiculo>(`/vehiculos/${id}`)).data,
  create: async (data: Omit<Vehiculo, 'vehiculo_id'>): Promise<Vehiculo> => (await api.post<Vehiculo>('/vehiculos', data)).data,
  update: async (id: string, data: Partial<Vehiculo>): Promise<Vehiculo> => (await api.put<Vehiculo>(`/vehiculos/${id}`, data)).data,
  delete: async (id: string) => (await api.delete(`/vehiculos/${id}`)).data,
};
export const ConductorService = {
  getAll: (estado?: string): Promise<Conductor[]> => getAllPages('/conductores', estado && estado !== 'TODOS' ? { estado } : {}),
  getById: async (id: string): Promise<Conductor> => (await api.get<Conductor>(`/conductores/${id}`)).data,
  create: async (data: Omit<Conductor, 'conductor_id'>): Promise<Conductor> => (await api.post<Conductor>('/conductores', data)).data,
  update: async (id: string, data: Partial<Conductor>): Promise<Conductor> => (await api.put<Conductor>(`/conductores/${id}`, data)).data,
  delete: async (id: string) => (await api.delete(`/conductores/${id}`)).data,
  validarJornada: async (id: string, horas: number) => (await api.post<any>(`/conductores/${id}/validar-jornada?horas_ruta=${horas}`)).data,
  acumularHoras: async (id: string, horas: number) => (await api.post<any>(`/conductores/${id}/acumular-horas?horas=${horas}`)).data,
  reiniciarJornada: async (id: string) => (await api.post<any>(`/conductores/${id}/reiniciar-jornada`)).data,
};
export const PedidoService = {
  getCuentasClientes: async (): Promise<{usuario_id:string;nombre:string}[]> => (await api.get<{usuario_id:string;nombre:string}[]>('/clientes/cuentas')).data,
  getAll: async (params?: {estado?: string; prioridad?: string; limite?: number; desplazamiento?: number}): Promise<Pedido[]> => (await api.get<Pedido[]>('/pedidos', {params: {
    limit: params?.limite ?? 500, skip: params?.desplazamiento ?? 0, ...(params?.estado && params.estado !== 'TODOS' ? {estado: params.estado} : {}), ...(params?.prioridad && params.prioridad !== 'TODOS' ? {prioridad: params.prioridad} : {})
  }})).data,
  getById: async (id: string): Promise<Pedido> => (await api.get<Pedido>(`/pedidos/${id}`)).data,
  getByCodigo: async (codigo: string): Promise<Pedido> => (await api.get<Pedido>(`/pedidos/codigo/${encodeURIComponent(codigo)}`)).data,
  create: async (data: Omit<Pedido, 'pedido_id'|'creado_en'|'ruta_id'|'estado'>): Promise<Pedido> => (await api.post<Pedido>('/pedidos', data)).data,
  updatePreferencias: async (id: string, data: PreferenciasClienteUpdate): Promise<Pedido> => (await api.patch<Pedido>(`/pedidos/${id}/preferencias`, data)).data,
  updateEstado: async (id: string, estado: string): Promise<Pedido> => (await api.patch<Pedido>(`/pedidos/${id}/estado`, {estado})).data,
  delete: async (id: string) => (await api.delete(`/pedidos/${id}`)).data,
};
export type RolUsuario = 'ADMIN' | 'OFICINA' | 'REPARTIDOR' | 'CLIENTE';
export type EstadoUsuario = 'ACTIVO' | 'INACTIVO' | 'BLOQUEADO';

export interface PermisoItem {
  codigo: string;
  modulo: string;
  nombre: string;
  descripcion: string;
}

export interface RolDisponible {
  codigo: RolUsuario;
  nombre: string;
  descripcion: string;
  permisos_default: string[];
}

export interface CatalogoPermisosResponse {
  roles_disponibles: RolDisponible[];
  catalogo_permisos: PermisoItem[];
}

export interface Usuario {
  conductor_id?: string | null;
  usuario_id: string;
  email: string;
  nombre_completo: string;
  telefono?: string;
  rol: RolUsuario;
  permisos: string[];
  estado: EstadoUsuario;
  creado_en: string;
}

export interface UsuarioCreatePayload {
  conductor_id?: string | null;
  email: string;
  nombre_completo: string;
  telefono?: string;
  rol: RolUsuario;
  password: string;
  permisos?: string[];
  estado?: EstadoUsuario;
}

export interface UsuarioUpdatePayload {
  conductor_id?: string | null;
  nombre_completo?: string;
  telefono?: string;
  rol?: RolUsuario;
  permisos?: string[];
  estado?: EstadoUsuario;
  password?: string;
}

export const UsuarioService = {
  getCatalogoPermisos: async () => (await api.get<any>('/usuarios/catalogo-permisos')).data,
  getAll: (rol?: string, estado?: string): Promise<Usuario[]> => getAllPages('/usuarios', {...(rol && rol !== 'TODOS' ? {rol} : {}), ...(estado && estado !== 'TODOS' ? {estado} : {})}),
  getById: async (id: string): Promise<Usuario> => (await api.get<Usuario>(`/usuarios/${id}`)).data,
  create: async (data: UsuarioCreatePayload): Promise<Usuario> => (await api.post<Usuario>('/usuarios', data)).data,
  update: async (id: string, data: UsuarioUpdatePayload): Promise<Usuario> => (await api.put<Usuario>(`/usuarios/${id}`, data)).data,
  delete: async (id: string) => (await api.delete(`/usuarios/${id}`)).data,
};


export const ClienteService = {
  getAll: (): Promise<Cliente[]> => getAllPages('/clientes'),
  getById: async (id: string): Promise<Cliente> => (await api.get<Cliente>(`/clientes/${id}`)).data,
  create: async (data: ClienteCreatePayload): Promise<Cliente> => (await api.post<Cliente>('/clientes', data)).data,
  update: async (id: string, data: ClienteUpdatePayload): Promise<Cliente> => (await api.put<Cliente>(`/clientes/${id}`, data)).data,
  delete: async (id: string) => (await api.delete(`/clientes/${id}`)).data,
};

// ============================================================================
// US-005 / US-006 / US-007: Rutas, Visualización Cartográfica y CodeCarbon
// ============================================================================

export interface Tramo {
  tramo_id: string;
  ruta_id: string;
  orden_secuencia: number;
  tipo_parada: string;
  pedido_id?: string | null;
  descripcion?: string | null;
  latitud: number;
  longitud: number;
  distancia_tramo_km: number;
  tiempo_estimado_min: number;
  co2_tramo_kg: number;
  alerta_zona_riesgo: boolean;
  nombre_zona_riesgo?: string | null;
  geometria_linea_geojson?: string | null;
}

export interface RutaDetalle {
  medicion_computacional_disponible?: boolean;
  ruta_id: string;
  deposito_origen_id?: string | null;
  conductor_id: string;
  conductor_nombre?: string | null;
  vehiculo_id: string;
  vehiculo_placa?: string | null;
  vehiculo_tipo_combustible?: string | null;
  fecha_operacion: string;
  distancia_total_km: number;
  tiempo_total_min: number;
  co2_total_kg: number;
  co2_computacional_kg: number;
  energia_computacional_kwh: number;
  tiempo_computo_seg: number;
  estado: string;
  creada_en: string;
  tramos: Tramo[];
  pedidos_asignados_count: number;
  incidencias?: IncidenciaVial[];
}

export interface PedidoNoAsignadoInfo {
  pedido_id: string;
  codigo_seguimiento: string;
  cliente_nombre: string;
  peso_kg: number;
  volumen_m3: number;
  motivo: string;
}

export interface RutaOptimizarRequest {
  fecha_operacion?: string;
  vehiculo_id?: string;
  conductor_id?: string;
  pedidos_ids?: string[];
  factor_capacidad_max?: number;
}

export interface RutaOptimizarResponse {
  medicion_computacional_disponible?: boolean;
  rutas: RutaDetalle[];
  pedidos_asignados_count: number;
  pedidos_no_asignados_count: number;
  pedidos_no_asignados: PedidoNoAsignadoInfo[];
  mensaje: string;
  co2_computacional_total_kg: number;
  energia_computacional_total_kwh: number;
  tiempo_computo_total_seg: number;
}

export interface ZonaRiesgo {
  zona_id: string;
  nombre: string;
  motivo: string;
  nivel_peligro: string;
  poligono_coordenadas: number[][]; // [ [lng, lat], ... ]
  activa: boolean;
}

export interface IncidenciaVial {
  descripcion: string;
  poligono: number[][];
  cierre: boolean;
  demora_minutos: number;
}
export interface ReoptimizarRutaRequest {
  resolver_incidencias_previas?: boolean;
  vehiculo_averiado?: boolean;
  carga_en_deposito?: boolean;
  minutos_transcurridos?: number;
  conduccion_continua_min?: number;
  incidencias?: IncidenciaVial[];
  hora_salida?: string;
  latitud_actual?: number;
  longitud_actual?: number;
  pedido_cancelado_id?: string | null;
  nuevo_pedido_urgente_id?: string | null;
  motivo_incidencia?: string;
  evitar_zona_riesgo?: boolean;
}

export interface ReoptimizarRutaResponse {
  estado?: string;
  incidencias?: IncidenciaVial[];
  rutas_reasignadas?: RutaDetalle[];
  pedidos_pendientes?: PedidoNoAsignadoInfo[];
  ruta_id: string;
  mensaje: string;
  distancia_total_km: number;
  tiempo_total_min: number;
  co2_total_kg: number;
  co2_computacional_kg: number;
  tramos: Tramo[];
}

export const RutaService = {
  optimizar: async (payload: RutaOptimizarRequest = {}): Promise<RutaOptimizarResponse> => {
    const res = await api.post<RutaOptimizarResponse>('/rutas/optimizar', payload);
    return res.data;
  },

  list: async (fecha?: string, estado?: string): Promise<RutaDetalle[]> => {
    const params: Record<string, string> = {};
    if (fecha) params.fecha = fecha;
    if (estado) params.estado = estado;
    const res = await api.get<RutaDetalle[]>('/rutas', { params });
    return res.data;
  },

  getById: async (id: string): Promise<RutaDetalle> => {
    const res = await api.get<RutaDetalle>(`/rutas/${id}`);
    return res.data;
  },

  getZonasRiesgo: async (): Promise<ZonaRiesgo[]> => {
    const res = await api.get<ZonaRiesgo[]>('/rutas/zonas-riesgo');
    return res.data;
  },

  reoptimizar: async (rutaId: string, payload: ReoptimizarRutaRequest): Promise<ReoptimizarRutaResponse> => {
    const res = await api.post<ReoptimizarRutaResponse>(`/rutas/${rutaId}/reoptimizar`, payload);
    return res.data;
  }
};
