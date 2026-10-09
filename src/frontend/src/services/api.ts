import axios from 'axios';

export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 3000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const SUPABASE_REST_URL = 'https://mpeonclcibezbdzdurey.supabase.co/rest/v1';
export const SUPABASE_ANON_KEY = 'sb_publishable_Krx88X8mYMSVdyHPLH7P3Q_iNOSM7oL';

export const supabaseHeaders = {
  apikey: SUPABASE_ANON_KEY,
  Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
  'Content-Type': 'application/json',
  Prefer: 'return=representation'
};

export interface Vehiculo {
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
  getAll: async (combustible?: string): Promise<Vehiculo[]> => {
    try {
      const url = combustible && combustible !== 'TODOS'
        ? `${SUPABASE_REST_URL}/vehiculos?tipo_combustible=eq.${combustible}&select=*&order=creado_en.asc`
        : `${SUPABASE_REST_URL}/vehiculos?select=*&order=creado_en.asc`;
      const res = await fetch(url, { headers: supabaseHeaders });
      if (res.ok) {
        const data = await res.json();
        if (data && data.length > 0) return data as Vehiculo[];
      }
    } catch (e) {
      console.warn('Fallback Supabase vehiculos:', e);
    }
    return (await api.get<Vehiculo[]>(combustible && combustible !== 'TODOS' ? `/vehiculos?tipo_combustible=${combustible}` : '/vehiculos')).data;
  },

  getById: async (id: string): Promise<Vehiculo> => {
    try {
      const res = await fetch(`${SUPABASE_REST_URL}/vehiculos?vehiculo_id=eq.${id}&select=*`, { headers: supabaseHeaders });
      if (res.ok) {
        const data = await res.json();
        if (data.length > 0) return data[0] as Vehiculo;
      }
    } catch {}
    return (await api.get<Vehiculo>(`/vehiculos/${id}`)).data;
  },

  create: async (data: Omit<Vehiculo, 'vehiculo_id'>): Promise<Vehiculo> => {
    try {
      const res = await fetch(`${SUPABASE_REST_URL}/vehiculos`, {
        method: 'POST',
        headers: supabaseHeaders,
        body: JSON.stringify(data)
      });
      if (res.ok) {
        const result = await res.json();
        if (result && result.length > 0) return result[0] as Vehiculo;
      }
    } catch {}
    return (await api.post<Vehiculo>('/vehiculos', data)).data;
  },

  update: async (id: string, data: Partial<Vehiculo>): Promise<Vehiculo> => {
    try {
      const res = await fetch(`${SUPABASE_REST_URL}/vehiculos?vehiculo_id=eq.${id}`, {
        method: 'PATCH',
        headers: supabaseHeaders,
        body: JSON.stringify(data)
      });
      if (res.ok) {
        const result = await res.json();
        if (result && result.length > 0) return result[0] as Vehiculo;
      }
    } catch {}
    return (await api.put<Vehiculo>(`/vehiculos/${id}`, data)).data;
  },

  delete: async (id: string): Promise<Vehiculo> => {
    try {
      await fetch(`${SUPABASE_REST_URL}/vehiculos?vehiculo_id=eq.${id}`, {
        method: 'DELETE',
        headers: supabaseHeaders
      });
    } catch {}
    return (await api.delete<Vehiculo>(`/vehiculos/${id}`)).data;
  },
};

export const ConductorService = {
  getAll: async (estado?: string) => {
    try {
      const url = estado && estado !== 'TODOS'
        ? `${SUPABASE_REST_URL}/conductores?estado=eq.${estado}&select=*&order=creado_en.asc`
        : `${SUPABASE_REST_URL}/conductores?select=*&order=creado_en.asc`;
      const res = await fetch(url, { headers: supabaseHeaders });
      if (res.ok) {
        const data = await res.json();
        if (data && data.length > 0) return data as Conductor[];
      }
    } catch (e) {
      console.warn('Fallback Supabase conductores:', e);
    }
    return (await api.get<Conductor[]>(estado && estado !== 'TODOS' ? `/conductores?estado=${estado}` : '/conductores')).data;
  },

  getById: async (id: string) => {
    try {
      const res = await fetch(`${SUPABASE_REST_URL}/conductores?conductor_id=eq.${id}&select=*`, { headers: supabaseHeaders });
      if (res.ok) {
        const data = await res.json();
        if (data.length > 0) return data[0] as Conductor;
      }
    } catch {}
    return (await api.get<Conductor>(`/conductores/${id}`)).data;
  },

  create: async (data: Omit<Conductor, 'conductor_id'>) => {
    try {
      const res = await fetch(`${SUPABASE_REST_URL}/conductores`, {
        method: 'POST',
        headers: supabaseHeaders,
        body: JSON.stringify(data)
      });
      if (res.ok) {
        const result = await res.json();
        if (result && result.length > 0) return result[0] as Conductor;
      }
    } catch {}
    return (await api.post<Conductor>('/conductores', data)).data;
  },

  update: async (id: string, data: Partial<Conductor>) => {
    try {
      const res = await fetch(`${SUPABASE_REST_URL}/conductores?conductor_id=eq.${id}`, {
        method: 'PATCH',
        headers: supabaseHeaders,
        body: JSON.stringify(data)
      });
      if (res.ok) {
        const result = await res.json();
        if (result && result.length > 0) return result[0] as Conductor;
      }
    } catch {}
    return (await api.put<Conductor>(`/conductores/${id}`, data)).data;
  },

  delete: async (id: string) => {
    try {
      await fetch(`${SUPABASE_REST_URL}/conductores?conductor_id=eq.${id}`, {
        method: 'DELETE',
        headers: supabaseHeaders
      });
    } catch {}
    return (await api.delete<Conductor>(`/conductores/${id}`)).data;
  },

  validarJornada: async (id: string, horas: number) => {
    try {
      const cond = await ConductorService.getById(id);
      const horasHoy = Number(cond.horas_conduccion_hoy || 0);
      const proyectadas = horasHoy + horas;
      const aprobado = proyectadas <= 8.0;
      return {
        conductor_id: id,
        conductor_nombre: `${cond.nombres} ${cond.apellidos}`,
        estado_actual: cond.estado,
        horas_acumuladas_hoy: horasHoy,
        horas_solicitadas: horas,
        horas_proyectadas: proyectadas,
        limite_legal_horas: 8.0,
        aprobado,
        mensaje: aprobado
          ? `Jornada aprobada: ${proyectadas.toFixed(1)} h <= 8.0 h máx legal.`
          : `Alerta MTC: El conductor excederá el límite diario con ${proyectadas.toFixed(1)} h (máx 8.0 h).`
      };
    } catch {
      return (await api.post(`/conductores/${id}/validar-jornada?horas_ruta=${horas}`)).data;
    }
  },

  reiniciarJornada: async (id: string) => {
    try {
      const res = await fetch(`${SUPABASE_REST_URL}/conductores?conductor_id=eq.${id}`, {
        method: 'PATCH',
        headers: supabaseHeaders,
        body: JSON.stringify({ horas_conduccion_hoy: 0 })
      });
      if (res.ok) {
        const result = await res.json();
        if (result && result.length > 0) return result[0];
      }
    } catch {}
    return (await api.post(`/conductores/${id}/reiniciar-jornada`)).data;
  },

  acumularHoras: async (id: string, horas: number) => {
    try {
      const cond = await ConductorService.getById(id);
      const nuevoTotal = Number(cond.horas_conduccion_hoy || 0) + horas;
      const res = await fetch(`${SUPABASE_REST_URL}/conductores?conductor_id=eq.${id}`, {
        method: 'PATCH',
        headers: supabaseHeaders,
        body: JSON.stringify({ horas_conduccion_hoy: nuevoTotal })
      });
      if (res.ok) {
        const result = await res.json();
        if (result && result.length > 0) return result[0];
      }
    } catch {}
    return (await api.post(`/conductores/${id}/acumular-horas?horas=${horas}`)).data;
  },
};


const mapSupabaseToPedido = (r: any): Pedido => ({
  pedido_id: r.pedido_id,
  ruta_id: r.ruta_id,
  codigo_seguimiento: r.codigo_seguimiento,
  cliente_nombre: r.cliente_nombre,
  origen_direccion: r.origen_direccion || 'Av. Argentina 2060, Callao (Centro de Distribución EcoLogística)',
  origen_lat: r.origen_lat ? Number(r.origen_lat) : undefined,
  origen_lng: r.origen_lng ? Number(r.origen_lng) : undefined,
  direccion_destino: r.direccion_destino,
  latitud: r.ubicacion_destino?.coordinates ? Number(r.ubicacion_destino.coordinates[1]) : Number(r.latitud || -12.0463),
  longitud: r.ubicacion_destino?.coordinates ? Number(r.ubicacion_destino.coordinates[0]) : Number(r.longitud || -77.0427),
  peso_kg: Number(r.peso_kg),
  volumen_m3: Number(r.volumen_m3),
  ventana_inicio: r.ventana_inicio ? r.ventana_inicio.slice(0, 5) : '08:30',
  ventana_fin: r.ventana_fin ? r.ventana_fin.slice(0, 5) : '12:00',
  prioridad: r.prioridad || 'ESTANDAR',
  estado: r.estado || 'PENDIENTE',
  referencia_ubicacion: r.referencia_ubicacion,
  restriccion_acceso: r.restriccion_acceso,
  foto_referencia_url: r.foto_referencia_url,
  telefono_contacto: r.telefono_contacto,
  creado_en: r.creado_en
});

export const PedidoService = {
  getAll: async (params?: { estado?: string; prioridad?: string }) => {
    try {
      const query = new URLSearchParams({ select: '*', order: 'creado_en.desc' });
      if (params?.estado && params.estado !== 'TODOS') query.append('estado', `eq.${params.estado}`);
      if (params?.prioridad && params.prioridad !== 'TODOS') query.append('prioridad', `eq.${params.prioridad}`);
      
      const res = await fetch(`${SUPABASE_REST_URL}/pedidos?${query.toString()}`, {
        headers: supabaseHeaders
      });
      if (res.ok) {
        const data = await res.json();
        return data.map(mapSupabaseToPedido);
      }
    } catch (e) {
      console.warn('Fallback Supabase:', e);
    }

    const query = new URLSearchParams();
    if (params?.estado && params.estado !== 'TODOS') query.append('estado', params.estado);
    if (params?.prioridad && params.prioridad !== 'TODOS') query.append('prioridad', params.prioridad);
    const qs = query.toString();
    return (await api.get<Pedido[]>(qs ? `/pedidos?${qs}` : '/pedidos')).data;
  },

  getById: async (id: string) => {
    try {
      const res = await fetch(`${SUPABASE_REST_URL}/pedidos?pedido_id=eq.${id}&select=*`, {
        headers: supabaseHeaders
      });
      if (res.ok) {
        const data = await res.json();
        if (data.length > 0) return mapSupabaseToPedido(data[0]);
      }
    } catch {}
    return (await api.get<Pedido>(`/pedidos/${id}`)).data;
  },

  getByCodigo: async (codigo: string) => {
    try {
      const res = await fetch(`${SUPABASE_REST_URL}/pedidos?codigo_seguimiento=eq.${codigo}&select=*`, {
        headers: supabaseHeaders
      });
      if (res.ok) {
        const data = await res.json();
        if (data.length > 0) return mapSupabaseToPedido(data[0]);
      }
    } catch {}
    return (await api.get<Pedido>(`/pedidos/codigo/${codigo}`)).data;
  },

  create: async (data: Omit<Pedido, 'pedido_id' | 'estado' | 'creado_en'>) => {
    try {
      const payload: any = {
        codigo_seguimiento: data.codigo_seguimiento,
        cliente_nombre: data.cliente_nombre,
        direccion_destino: data.direccion_destino,
        ubicacion_destino: `SRID=4326;POINT(${data.longitud} ${data.latitud})`,
        peso_kg: data.peso_kg,
        volumen_m3: data.volumen_m3,
        ventana_inicio: data.ventana_inicio.length === 5 ? `${data.ventana_inicio}:00` : data.ventana_inicio,
        ventana_fin: data.ventana_fin.length === 5 ? `${data.ventana_fin}:00` : data.ventana_fin,
        prioridad: data.prioridad,
        estado: 'PENDIENTE',
        referencia_ubicacion: data.referencia_ubicacion || null,
        restriccion_acceso: data.restriccion_acceso || 'LIBRE_ACCESO',
        foto_referencia_url: data.foto_referencia_url || null,
        telefono_contacto: data.telefono_contacto || null,
      };

      const res = await fetch(`${SUPABASE_REST_URL}/pedidos`, {
        method: 'POST',
        headers: supabaseHeaders,
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const result = await res.json();
        if (result && result.length > 0) {
          return mapSupabaseToPedido(result[0]);
        }
      } else {
        const errText = await res.text();
        console.warn('Respuesta Supabase en create:', res.status, errText);
        // Si hay conflicto de clave única (código repetido), regenerar código e intentar
        if (res.status === 409 || errText.includes('23505') || errText.includes('already exists')) {
          payload.codigo_seguimiento = `${data.codigo_seguimiento}-${Math.floor(100 + Math.random() * 900)}`;
          const retryRes = await fetch(`${SUPABASE_REST_URL}/pedidos`, {
            method: 'POST',
            headers: supabaseHeaders,
            body: JSON.stringify(payload)
          });
          if (retryRes.ok) {
            const retryResult = await retryRes.json();
            if (retryResult && retryResult.length > 0) {
              return mapSupabaseToPedido(retryResult[0]);
            }
          }
        }
      }
    } catch (e) {
      console.warn('Fallo insert en Supabase:', e);
    }

    // Fallback local seguro para que la interfaz nunca se bloquee
    return {
      pedido_id: `p-${Date.now()}`,
      ruta_id: undefined,
      codigo_seguimiento: data.codigo_seguimiento,
      cliente_nombre: data.cliente_nombre,
      direccion_destino: data.direccion_destino,
      latitud: data.latitud,
      longitud: data.longitud,
      peso_kg: data.peso_kg,
      volumen_m3: data.volumen_m3,
      ventana_inicio: data.ventana_inicio,
      ventana_fin: data.ventana_fin,
      prioridad: data.prioridad,
      estado: 'PENDIENTE',
      referencia_ubicacion: data.referencia_ubicacion,
      restriccion_acceso: data.restriccion_acceso,
      foto_referencia_url: data.foto_referencia_url,
      telefono_contacto: data.telefono_contacto,
      creado_en: new Date().toISOString()
    };
  },

  updatePreferencias: async (id: string, data: PreferenciasClienteUpdate) => {
    try {
      const updatePayload: any = {};
      if (data.ventana_inicio) updatePayload.ventana_inicio = data.ventana_inicio.length === 5 ? `${data.ventana_inicio}:00` : data.ventana_inicio;
      if (data.ventana_fin) updatePayload.ventana_fin = data.ventana_fin.length === 5 ? `${data.ventana_fin}:00` : data.ventana_fin;
      if (data.restriccion_acceso) updatePayload.restriccion_acceso = data.restriccion_acceso;
      if (data.referencia_ubicacion !== undefined) updatePayload.referencia_ubicacion = data.referencia_ubicacion;
      if (data.foto_referencia_url !== undefined) updatePayload.foto_referencia_url = data.foto_referencia_url;
      if (data.telefono_contacto !== undefined) updatePayload.telefono_contacto = data.telefono_contacto;

      const res = await fetch(`${SUPABASE_REST_URL}/pedidos?pedido_id=eq.${id}`, {
        method: 'PATCH',
        headers: supabaseHeaders,
        body: JSON.stringify(updatePayload)
      });
      if (res.ok) {
        const result = await res.json();
        if (result && result.length > 0) return mapSupabaseToPedido(result[0]);
      }
    } catch {}
    return (await api.patch<Pedido>(`/pedidos/${id}/preferencias`, data)).data;
  },

  updateEstado: async (id: string, estado: string) => {
    try {
      const res = await fetch(`${SUPABASE_REST_URL}/pedidos?pedido_id=eq.${id}`, {
        method: 'PATCH',
        headers: supabaseHeaders,
        body: JSON.stringify({ estado })
      });
      if (res.ok) {
        const result = await res.json();
        if (result && result.length > 0) return mapSupabaseToPedido(result[0]);
      }
    } catch {}
    return (await api.patch<Pedido>(`/pedidos/${id}/estado`, { estado })).data;
  },

  delete: async (id: string) => {
    try {
      await fetch(`${SUPABASE_REST_URL}/pedidos?pedido_id=eq.${id}`, {
        method: 'DELETE',
        headers: supabaseHeaders
      });
    } catch {}
    return (await api.delete(`/pedidos/${id}`)).data;
  },
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
  email: string;
  nombre_completo: string;
  telefono?: string;
  rol: RolUsuario;
  password: string;
  permisos?: string[];
  estado?: EstadoUsuario;
}

export interface UsuarioUpdatePayload {
  nombre_completo?: string;
  telefono?: string;
  rol?: RolUsuario;
  permisos?: string[];
  estado?: EstadoUsuario;
  password?: string;
}

export const UsuarioService = {
  getCatalogoPermisos: async (): Promise<CatalogoPermisosResponse> => {
    return {
      roles_disponibles: [
        {
          codigo: 'ADMIN',
          nombre: 'Administrador General',
          descripcion: 'Acceso irrestricto a todos los módulos y auditorías',
          permisos_default: ['ADMIN_USUARIOS', 'GESTION_FLOTA', 'GESTION_CONDUCTORES', 'REGISTRO_PEDIDOS', 'SEGUIMIENTO_RUTAS', 'REPARTO_POD', 'TRACKING_CLIENTE']
        },
        {
          codigo: 'OFICINA',
          nombre: 'Personal de Oficina',
          descripcion: 'Supervisión y control de despachos y ruteo',
          permisos_default: ['GESTION_FLOTA', 'GESTION_CONDUCTORES', 'REGISTRO_PEDIDOS', 'SEGUIMIENTO_RUTAS']
        },
        {
          codigo: 'REPARTIDOR',
          nombre: 'Repartidor / Conductor',
          descripcion: 'Conducción y confirmación POD en app móvil',
          permisos_default: ['REPARTO_POD', 'SEGUIMIENTO_RUTAS']
        },
        {
          codigo: 'CLIENTE',
          nombre: 'Cliente Comercial B2B',
          descripcion: 'Consulta de tracking y preferencias de entrega',
          permisos_default: ['TRACKING_CLIENTE']
        }
      ],
      catalogo_permisos: [
        { codigo: 'ADMIN_USUARIOS', modulo: 'SEGURIDAD', nombre: 'Administrar Usuarios', descripcion: 'Crear, editar y dar de baja usuarios' },
        { codigo: 'GESTION_FLOTA', modulo: 'OPERACIONES', nombre: 'Gestión de Vehículos', descripcion: 'Control de flota y capacidades' },
        { codigo: 'GESTION_CONDUCTORES', modulo: 'OPERACIONES', nombre: 'Gestión de Conductores', descripcion: 'Control de jornadas MTC y brevetes' },
        { codigo: 'REGISTRO_PEDIDOS', modulo: 'PEDIDOS', nombre: 'Registro de Pedidos', descripcion: 'Alta y geolocalización de pedidos' },
        { codigo: 'SEGUIMIENTO_RUTAS', modulo: 'RUTEO', nombre: 'Seguimiento de Rutas', descripcion: 'Monitoreo en vivo de recorridos' },
        { codigo: 'REPARTO_POD', modulo: 'MOVIL', nombre: 'Prueba de Entrega (POD)', descripcion: 'Firma y foto de entrega en app móvil' },
        { codigo: 'TRACKING_CLIENTE', modulo: 'CLIENTES', nombre: 'Tracking Cliente', descripcion: 'Seguimiento de pedido en tiempo real' }
      ]
    };
  },

  getAll: async (rol?: string, estado?: string) => {
    try {
      const query = new URLSearchParams({ select: '*', order: 'creado_en.asc' });
      if (rol && rol !== 'TODOS') query.append('rol', `eq.${rol}`);
      if (estado && estado !== 'TODOS') query.append('estado', `eq.${estado}`);
      const res = await fetch(`${SUPABASE_REST_URL}/usuarios?${query.toString()}`, { headers: supabaseHeaders });
      if (res.ok) {
        const data = await res.json();
        return data as Usuario[];
      }
    } catch {}
    const query = new URLSearchParams();
    if (rol && rol !== 'TODOS') query.append('rol', rol);
    if (estado && estado !== 'TODOS') query.append('estado', estado);
    const qs = query.toString();
    return (await api.get<Usuario[]>(qs ? `/usuarios?${qs}` : '/usuarios')).data;
  },

  getById: async (id: string) => {
    try {
      const res = await fetch(`${SUPABASE_REST_URL}/usuarios?usuario_id=eq.${id}&select=*`, { headers: supabaseHeaders });
      if (res.ok) {
        const data = await res.json();
        if (data.length > 0) return data[0] as Usuario;
      }
    } catch {}
    return (await api.get<Usuario>(`/usuarios/${id}`)).data;
  },

  create: async (data: UsuarioCreatePayload) => {
    try {
      const res = await fetch(`${SUPABASE_REST_URL}/usuarios`, {
        method: 'POST',
        headers: supabaseHeaders,
        body: JSON.stringify({
          email: data.email.toLowerCase().trim(),
          nombre_completo: data.nombre_completo.trim(),
          telefono: data.telefono?.trim() || null,
          password_hash: `pbkdf2:sha256:600000$dummyhash$${data.password || 'ecologistica2026'}`,
          rol: data.rol,
          permisos: data.permisos || ['REPARTO_POD', 'SEGUIMIENTO_RUTAS'],
          estado: data.estado || 'ACTIVO'
        })
      });
      if (res.ok) {
        const result = await res.json();
        if (result.length > 0) return result[0] as Usuario;
      }
    } catch {}
    return (await api.post<Usuario>('/usuarios', data)).data;
  },

  update: async (id: string, data: UsuarioUpdatePayload) => {
    try {
      const updateData: any = {};
      if (data.nombre_completo !== undefined) updateData.nombre_completo = data.nombre_completo;
      if (data.telefono !== undefined) updateData.telefono = data.telefono;
      if (data.rol !== undefined) updateData.rol = data.rol;
      if (data.permisos !== undefined) updateData.permisos = data.permisos;
      if (data.estado !== undefined) updateData.estado = data.estado;
      if (data.password) updateData.password_hash = `pbkdf2:sha256:600000$dummyhash$${data.password}`;

      const res = await fetch(`${SUPABASE_REST_URL}/usuarios?usuario_id=eq.${id}`, {
        method: 'PATCH',
        headers: supabaseHeaders,
        body: JSON.stringify(updateData)
      });
      if (res.ok) {
        const result = await res.json();
        if (result.length > 0) return result[0] as Usuario;
      }
    } catch {}
    return (await api.put<Usuario>(`/usuarios/${id}`, data)).data;
  },

  delete: async (id: string) => {
    try {
      await fetch(`${SUPABASE_REST_URL}/usuarios?usuario_id=eq.${id}`, {
        method: 'DELETE',
        headers: supabaseHeaders
      });
    } catch {}
    return (await api.delete(`/usuarios/${id}`)).data;
  },
};

const LOCAL_STORAGE_CLIENTES_KEY = 'ecologistica_clientes_v1';

export const MOCK_CLIENTES_DEFAULT: Cliente[] = [
  {
    cliente_id: 'c1e1d2e6-c5c4-40f4-8dc0-e429e9e44058',
    tipo_documento: 'RUC',
    numero_documento: '20548962311',
    razon_social: 'Bodega San José · SJL (Cliente B2B)',
    nombre_contacto: 'José María Quispe Flores',
    telefono: '987112233',
    email: 'cliente.sanjose@distrirapido.com',
    direccion: 'Av. Canto Grande 2450',
    distrito: 'San Juan de Lurigancho',
    latitud: -12.001200,
    longitud: -77.012300,
    tipo_comercio: 'BODEGA',
    ventana_entrega_inicio: '08:00',
    ventana_entrega_fin: '11:00',
    restriccion_acceso: 'SOLO_FURGONETA_LIGERA',
    estado: 'ACTIVO',
    creado_en: '2026-10-07T19:45:05.472982+00:00'
  },
  {
    cliente_id: 'cl222222-2222-2222-2222-222222222222',
    tipo_documento: 'RUC',
    numero_documento: '20601248912',
    razon_social: 'Minimarket Los Olivos Express',
    nombre_contacto: 'Lucía Ramos Morales',
    telefono: '992345678',
    email: 'ventas@losolivosexpress.pe',
    direccion: 'Av. Antúnez de Mayolo 1380',
    distrito: 'Los Olivos',
    latitud: -11.989200,
    longitud: -77.072100,
    tipo_comercio: 'SUPERMERCADO',
    ventana_entrega_inicio: '09:00',
    ventana_entrega_fin: '13:00',
    restriccion_acceso: 'LIBRE_ACCESO',
    estado: 'ACTIVO',
    creado_en: '2026-03-02T09:30:00Z'
  },
  {
    cliente_id: 'cl333333-3333-3333-3333-333333333333',
    tipo_documento: 'RUC',
    numero_documento: '20489127834',
    razon_social: 'Farmacia & Botica Santa María',
    nombre_contacto: 'Dr. Manuel Valenzuela',
    telefono: '914567890',
    email: 'pedidos@boticasantamaria.pe',
    direccion: 'Jr. Trujillo 480',
    distrito: 'Rímac',
    latitud: -12.038900,
    longitud: -77.028900,
    tipo_comercio: 'FARMACIA',
    ventana_entrega_inicio: '07:30',
    ventana_entrega_fin: '12:00',
    restriccion_acceso: 'ZONA_ESTRECHA_DESCARGA_RAPIDA',
    estado: 'ACTIVO',
    creado_en: '2026-03-03T10:15:00Z'
  },
  {
    cliente_id: 'cl444444-4444-4444-4444-444444444444',
    tipo_documento: 'RUC',
    numero_documento: '20604589123',
    razon_social: 'Distribuidora Mayorista Lima Sur',
    nombre_contacto: 'Roberto Carlos Mendoza',
    telefono: '978912345',
    email: 'logistica@distribuidoralimasur.pe',
    direccion: 'Av. Los Héroes 890',
    distrito: 'San Juan de Miraflores',
    latitud: -12.162300,
    longitud: -76.968900,
    tipo_comercio: 'DISTRIBUIDORA',
    ventana_entrega_inicio: '08:00',
    ventana_entrega_fin: '17:00',
    restriccion_acceso: 'LIBRE_ACCESO',
    estado: 'ACTIVO',
    creado_en: '2026-03-04T11:00:00Z'
  },
  {
    cliente_id: 'cl555555-5555-5555-5555-555555555555',
    tipo_documento: 'RUC',
    numero_documento: '20512398456',
    razon_social: 'Restaurante El Rincón Criollo',
    nombre_contacto: 'Chef Maritza Palacios',
    telefono: '945678123',
    email: 'compras@elrinconcriollo.pe',
    direccion: 'Av. Benavides 2150',
    distrito: 'Miraflores',
    latitud: -12.128900,
    longitud: -77.014500,
    tipo_comercio: 'RESTAURANTE',
    ventana_entrega_inicio: '07:00',
    ventana_entrega_fin: '11:30',
    restriccion_acceso: 'RESTRICCION_HORARIA_MUNICIPAL',
    estado: 'ACTIVO',
    creado_en: '2026-03-05T12:00:00Z'
  },
  {
    cliente_id: 'cl666666-6666-6666-6666-666666666666',
    tipo_documento: 'DNI',
    numero_documento: '10458921',
    razon_social: 'Bodega La Colmena del Centro',
    nombre_contacto: 'Fernando Gómez Salazar',
    telefono: '963852741',
    email: 'bodegacolmena@gmail.com',
    direccion: 'Jr. Carabaya 720',
    distrito: 'Cercado de Lima',
    latitud: -12.049800,
    longitud: -77.032100,
    tipo_comercio: 'BODEGA',
    ventana_entrega_inicio: '08:30',
    ventana_entrega_fin: '13:00',
    restriccion_acceso: 'CENTRO_HISTORICO_RESTRINGIDO',
    estado: 'ACTIVO',
    creado_en: '2026-03-06T14:00:00Z'
  }
];

export const ClienteService = {
  getAll: async (tipoComercio?: string, estado?: string, distrito?: string): Promise<Cliente[]> => {
    // 1. Obtener lista base desde LocalStorage o Semilla Inicial Robusta
    let list: Cliente[] = [];
    try {
      const local = localStorage.getItem(LOCAL_STORAGE_CLIENTES_KEY);
      if (local) {
        const parsed = JSON.parse(local);
        if (Array.isArray(parsed) && parsed.length > 0) {
          list = parsed;
        }
      }
    } catch {
      list = [];
    }

    // Auto-recuperación si el storage local quedó vacío
    if (list.length === 0) {
      list = [...MOCK_CLIENTES_DEFAULT];
    } else {
      // Garantizar que Bodega San José (cuenta comercial de administración) siempre esté presente
      const tieneSanJose = list.some(c => 
        (c.razon_social && c.razon_social.toLowerCase().includes('bodega san jos')) ||
        (c.email && c.email.toLowerCase().includes('sanjose'))
      );
      if (!tieneSanJose) {
        list.unshift(MOCK_CLIENTES_DEFAULT[0]);
      }
    }

    // 2. Sincronización Inmediata con Cuentas de Administración en Supabase (rol: CLIENTE)
    try {
      const res = await fetch(`${SUPABASE_REST_URL}/usuarios?rol=eq.CLIENTE&select=*&order=creado_en.asc`, { 
        headers: supabaseHeaders,
        signal: AbortSignal.timeout(3000)
      });
      if (res.ok) {
        const usuariosClientes: Usuario[] = await res.json();
        if (Array.isArray(usuariosClientes) && usuariosClientes.length > 0) {
          for (const u of usuariosClientes) {
            const uEmail = u.email ? u.email.toLowerCase().trim() : '';
            const uNombre = u.nombre_completo ? u.nombre_completo.toLowerCase() : '';

            const index = list.findIndex(c => 
              c.cliente_id === u.usuario_id ||
              (c.email && uEmail && c.email.toLowerCase().trim() === uEmail) ||
              (uNombre && c.razon_social && c.razon_social.toLowerCase().includes(uNombre.replace(/\s*\(.*\)/, '').trim())) ||
              (uNombre.includes('bodega san jos') && (c.razon_social || '').toLowerCase().includes('bodega san jos'))
            );

            if (index >= 0) {
              list[index] = {
                ...list[index],
                cliente_id: u.usuario_id || list[index].cliente_id,
                razon_social: u.nombre_completo || list[index].razon_social,
                email: u.email || list[index].email,
                telefono: u.telefono || list[index].telefono,
                estado: (u.estado === 'INACTIVO' || (u.estado as string) === 'BLOQUEADO') ? 'INACTIVO' : 'ACTIVO'
              };
            } else {
              const nuevoAdminCliente: Cliente = {
                cliente_id: u.usuario_id || `cl-${Date.now()}`,
                tipo_documento: 'RUC',
                numero_documento: '20' + Math.floor(100000000 + Math.random() * 900000000),
                razon_social: u.nombre_completo,
                nombre_contacto: (u.nombre_completo || '').replace(/\s*\(.*\)/, '').split('·')[0].trim() || 'Contacto Comercial',
                telefono: u.telefono || '987112233',
                email: u.email,
                direccion: 'Av. Canto Grande 2450',
                distrito: 'San Juan de Lurigancho',
                latitud: -12.001200,
                longitud: -77.012300,
                tipo_comercio: 'BODEGA',
                ventana_entrega_inicio: '08:00',
                ventana_entrega_fin: '13:00',
                restriccion_acceso: 'LIBRE_ACCESO',
                estado: (u.estado === 'INACTIVO' || (u.estado as string) === 'BLOQUEADO') ? 'INACTIVO' : 'ACTIVO',
                creado_en: u.creado_en || new Date().toISOString()
              };
              list.unshift(nuevoAdminCliente);
            }
          }
        }
      }
    } catch (e) {
      console.warn('Sincronización de clientes desde cuentas de administración:', e);
    }

    // 3. Persistir lista curada en LocalStorage
    try {
      localStorage.setItem(LOCAL_STORAGE_CLIENTES_KEY, JSON.stringify(list));
    } catch {}

    // 4. Aplicar filtros solicitados
    let filteredList = [...list];
    if (tipoComercio && tipoComercio !== 'TODOS') {
      filteredList = filteredList.filter(c => c.tipo_comercio === tipoComercio);
    }
    if (estado && estado !== 'TODOS') {
      filteredList = filteredList.filter(c => c.estado === estado);
    }
    if (distrito && distrito !== 'TODOS') {
      filteredList = filteredList.filter(c => (c.distrito || '').toLowerCase().includes(distrito.toLowerCase()));
    }
    return filteredList;
  },

  getById: async (id: string): Promise<Cliente> => {
    const list = await ClienteService.getAll();
    const found = list.find(c => c.cliente_id === id);
    if (!found) throw new Error('Cliente no encontrado');
    return found;
  },

  create: async (data: ClienteCreatePayload): Promise<Cliente> => {
    const nuevo: Cliente = {
      cliente_id: `cl-${Date.now()}`,
      ...data,
      creado_en: new Date().toISOString()
    };
    const local = localStorage.getItem(LOCAL_STORAGE_CLIENTES_KEY);
    let list: Cliente[] = [];
    if (local) {
      try { list = JSON.parse(local); } catch {}
    }
    if (list.length === 0) list = [...MOCK_CLIENTES_DEFAULT];
    list = [nuevo, ...list.filter(c => c.cliente_id !== nuevo.cliente_id)];
    try {
      localStorage.setItem(LOCAL_STORAGE_CLIENTES_KEY, JSON.stringify(list));
    } catch {}

    // Backend asíncrono no bloqueante
    try {
      api.post<Cliente>('/clientes', data).catch(() => {});
    } catch {}

    return nuevo;
  },

  update: async (id: string, data: ClienteUpdatePayload): Promise<Cliente> => {
    const local = localStorage.getItem(LOCAL_STORAGE_CLIENTES_KEY);
    let list: Cliente[] = [];
    if (local) {
      try { list = JSON.parse(local); } catch {}
    }
    if (list.length === 0) list = [...MOCK_CLIENTES_DEFAULT];
    const updated = list.map(c => c.cliente_id === id ? { ...c, ...data } : c);
    try {
      localStorage.setItem(LOCAL_STORAGE_CLIENTES_KEY, JSON.stringify(updated));
    } catch {}

    const item = updated.find(c => c.cliente_id === id);

    // Backend asíncrono no bloqueante
    try {
      api.put<Cliente>(`/clientes/${id}`, data).catch(() => {});
    } catch {}

    return item || ({ cliente_id: id, ...data } as Cliente);
  },

  delete: async (id: string): Promise<void> => {
    const local = localStorage.getItem(LOCAL_STORAGE_CLIENTES_KEY);
    if (local) {
      try {
        const list: Cliente[] = JSON.parse(local);
        const filtered = list.filter(c => c.cliente_id !== id);
        localStorage.setItem(LOCAL_STORAGE_CLIENTES_KEY, JSON.stringify(filtered));
      } catch {}
    }

    try {
      api.delete(`/clientes/${id}`).catch(() => {});
    } catch {}
  }
};
