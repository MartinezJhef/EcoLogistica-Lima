import { Usuario, RolUsuario } from './api';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://mpeonclcibezbdzdurey.supabase.co';
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_Krx88X8mYMSVdyHPLH7P3Q_iNOSM7oL';
const STORAGE_KEY = 'ecologistica_auth_user';

export const CUENTAS_PREDEFINIDAS: Usuario[] = [
  {
    usuario_id: 'b2d4c110-5c60-4ce0-8de0-9a15220d4a73',
    email: 'admin@ecologistica.pe',
    nombre_completo: 'Ing. Martín Valdivia (Administrador General)',
    telefono: '991234567',
    rol: 'ADMIN',
    permisos: [
      'ADMIN_USUARIOS',
      'GESTION_FLOTA',
      'GESTION_CONDUCTORES',
      'REGISTRO_PEDIDOS',
      'SEGUIMIENTO_RUTAS',
      'REPARTO_POD',
      'TRACKING_CLIENTE',
    ],
    estado: 'ACTIVO',
    creado_en: '2026-10-07T19:45:05.472982+00:00',
  },
  {
    usuario_id: '08ba6e02-4ddc-4169-95cc-487a3a27e156',
    email: 'seguimiento@ecologistica.pe',
    nombre_completo: 'Lic. Carmen Rosales (Oficina y Seguimiento)',
    telefono: '984556677',
    rol: 'OFICINA',
    permisos: ['GESTION_FLOTA', 'GESTION_CONDUCTORES', 'REGISTRO_PEDIDOS', 'SEGUIMIENTO_RUTAS'],
    estado: 'ACTIVO',
    creado_en: '2026-10-07T19:45:05.472982+00:00',
  },
  {
    usuario_id: 'fbdc5dee-1282-4f91-9afa-ec173f8ccdbf',
    email: 'repartidor.juan@ecologistica.pe',
    nombre_completo: 'Juan Alberto Morales (Repartidor / Conductor)',
    telefono: '999888777',
    rol: 'REPARTIDOR',
    permisos: ['REPARTO_POD', 'SEGUIMIENTO_RUTAS'],
    estado: 'ACTIVO',
    creado_en: '2026-10-07T19:45:05.472982+00:00',
  },
  {
    usuario_id: 'ad47482b-d436-4ad2-92fc-9430600654b3',
    email: 'carlos.quispe@ecologistica.pe',
    nombre_completo: 'Carlos Eduardo Quispe Huamán (Conductor / Repartidor)',
    telefono: '987654321',
    rol: 'REPARTIDOR',
    permisos: ['REPARTO_POD', 'SEGUIMIENTO_RUTAS'],
    estado: 'ACTIVO',
    creado_en: '2026-10-08T12:40:28.624773+00:00',
  },
  {
    usuario_id: '03df4c0c-578a-4d59-9118-fecc438adca9',
    email: 'jorge.mendoza@ecologistica.pe',
    nombre_completo: 'Jorge Luis Mendoza Ramos (Conductor / Repartidor)',
    telefono: '912345678',
    rol: 'REPARTIDOR',
    permisos: ['REPARTO_POD', 'SEGUIMIENTO_RUTAS'],
    estado: 'ACTIVO',
    creado_en: '2026-10-08T12:41:03.538066+00:00',
  },
  {
    usuario_id: '5840f980-c197-4fd4-9d2b-146583cafbef',
    email: 'maria.torres@ecologistica.pe',
    nombre_completo: 'María Elena Torres Valdivia (Conductora / Repartidora)',
    telefono: '945678123',
    rol: 'REPARTIDOR',
    permisos: ['REPARTO_POD', 'SEGUIMIENTO_RUTAS'],
    estado: 'ACTIVO',
    creado_en: '2026-10-08T12:41:04.348647+00:00',
  },
  {
    usuario_id: '17ceb171-393a-4f25-8eb9-4cb99c6da6d6',
    email: 'ricardo.gomez@ecologistica.pe',
    nombre_completo: 'Ricardo Antonio Gómez Salazar (Conductor / Repartidor)',
    telefono: '965432198',
    rol: 'REPARTIDOR',
    permisos: ['REPARTO_POD', 'SEGUIMIENTO_RUTAS'],
    estado: 'ACTIVO',
    creado_en: '2026-10-08T12:41:05.140828+00:00',
  },
  {
    usuario_id: 'c1e1d2e6-c5c4-40f4-8dc0-e429e9e44058',
    email: 'cliente.sanjose@distrirapido.com',
    nombre_completo: 'Bodega San José · SJL (Cliente B2B)',
    telefono: '987112233',
    rol: 'CLIENTE',
    permisos: ['TRACKING_CLIENTE'],
    estado: 'ACTIVO',
    creado_en: '2026-10-07T19:45:05.472982+00:00',
  },
];

export const AuthService = {
  /**
   * Obtiene el usuario activo guardado en la sesión local
   */
  getUser: (): Usuario | null => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      return JSON.parse(raw) as Usuario;
    } catch {
      return null;
    }
  },

  /**
   * Guarda el usuario en almacenamiento local
   */
  setUser: (usuario: Usuario): void => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(usuario));
  },

  /**
   * Cierra la sesión activa
   */
  logout: (): void => {
    localStorage.removeItem(STORAGE_KEY);
  },

  /**
   * Prueba latencia en vivo contra Supabase Cloud
   */
  pingSupabase: async (): Promise<{ ok: boolean; latencyMs: number }> => {
    const start = performance.now();
    try {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/usuarios?select=usuario_id&limit=1`, {
        headers: {
          apikey: SUPABASE_KEY,
          Authorization: `Bearer ${SUPABASE_KEY}`,
        },
      });
      const end = performance.now();
      return { ok: response.ok, latencyMs: Math.round(end - start) };
    } catch {
      return { ok: false, latencyMs: 0 };
    }
  },

  /**
   * Autenticación contra Supabase Cloud con fallback de catálogo seguro
   */
  login: async (email: string, password?: string): Promise<Usuario> => {
    const cleanEmail = email.trim().toLowerCase();

    // 1. Intentar validar en la base de datos Supabase Cloud
    try {
      const response = await fetch(
        `${SUPABASE_URL}/rest/v1/usuarios?email=eq.${encodeURIComponent(cleanEmail)}&select=*`,
        {
          headers: {
            apikey: SUPABASE_KEY,
            Authorization: `Bearer ${SUPABASE_KEY}`,
          },
        }
      );

      if (response.ok) {
        const users = await response.json();
        if (Array.isArray(users) && users.length > 0) {
          const u = users[0] as Usuario;
          if (u.estado === 'BLOQUEADO' || u.estado === 'INACTIVO') {
            throw new Error(`La cuenta ${cleanEmail} se encuentra ${u.estado}. Contacte al administrador.`);
          }
          AuthService.setUser(u);
          return u;
        }
      }
    } catch (err: any) {
      if (err.message && err.message.includes('cuenta')) {
        throw err;
      }
      // Si la red falla momentáneamente, continúa con fallback de personas predefinidas
    }

    // 2. Fallback de usuarios predefinidos
    const matched = CUENTAS_PREDEFINIDAS.find(c => c.email.toLowerCase() === cleanEmail);
    if (matched) {
      AuthService.setUser(matched);
      return matched;
    }

    // 3. Si no existe, crear un perfil cliente por defecto
    const autoUser: Usuario = {
      usuario_id: `usr-${Date.now()}`,
      email: cleanEmail,
      nombre_completo: cleanEmail.split('@')[0].toUpperCase(),
      rol: 'CLIENTE',
      permisos: ['TRACKING_CLIENTE'],
      estado: 'ACTIVO',
      creado_en: new Date().toISOString(),
    };
    AuthService.setUser(autoUser);
    return autoUser;
  },

  /**
   * Inicio rápido por rol para demostración
   */
  loginAsRole: async (rol: RolUsuario): Promise<Usuario> => {
    const target = CUENTAS_PREDEFINIDAS.find(c => c.rol === rol) || CUENTAS_PREDEFINIDAS[0];
    return AuthService.login(target.email);
  },
};
