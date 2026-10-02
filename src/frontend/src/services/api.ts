import axios from 'axios';

export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

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
  codigo_seguimiento: string;
  cliente_nombre: string;
  direccion_destino: string;
  latitud: number;
  longitud: number;
  peso_kg: number;
  volumen_m3: number;
  ventana_inicio: string;
  ventana_fin: string;
  prioridad: string;
  estado: string;
}

export const VehiculoService = {
  getAll: async () => (await api.get<Vehiculo[]>('/vehiculos')).data,
  getById: async (id: string) => (await api.get<Vehiculo>(`/vehiculos/${id}`)).data,
  create: async (data: Omit<Vehiculo, 'vehiculo_id'>) => (await api.post<Vehiculo>('/vehiculos', data)).data,
  update: async (id: string, data: Partial<Vehiculo>) => (await api.put<Vehiculo>(`/vehiculos/${id}`, data)).data,
  delete: async (id: string) => (await api.delete<Vehiculo>(`/vehiculos/${id}`)).data,
};

export const ConductorService = {
  getAll: async (estado?: string) => (await api.get<Conductor[]>(estado ? `/conductores?estado=${estado}` : '/conductores')).data,
  getById: async (id: string) => (await api.get<Conductor>(`/conductores/${id}`)).data,
  create: async (data: Omit<Conductor, 'conductor_id'>) => (await api.post<Conductor>('/conductores', data)).data,
  update: async (id: string, data: Partial<Conductor>) => (await api.put<Conductor>(`/conductores/${id}`, data)).data,
  delete: async (id: string) => (await api.delete<Conductor>(`/conductores/${id}`)).data,
  validarJornada: async (id: string, horas: number) => (await api.post(`/conductores/${id}/validar-jornada?horas_ruta=${horas}`)).data,
  reiniciarJornada: async (id: string) => (await api.post(`/conductores/${id}/reiniciar-jornada`)).data,
  acumularHoras: async (id: string, horas: number) => (await api.post(`/conductores/${id}/acumular-horas?horas=${horas}`)).data,
};

export const PedidoService = {
  getAll: async () => (await api.get<Pedido[]>('/pedidos')).data,
  create: async (data: Omit<Pedido, 'pedido_id' | 'estado'>) => (await api.post<Pedido>('/pedidos', data)).data,
};
