import { Usuario, RolUsuario } from './api';

const STORAGE_KEY = 'ecologistica_auth_user';

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
    localStorage.removeItem('ecologistica_access_token');
  },

  /**
   * Prueba latencia en vivo contra Supabase Cloud
   */
  pingSupabase: async (): Promise<{ ok: boolean; latencyMs: number }> => {
    const start = performance.now();
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1'}/health`);
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
    const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1'}/auth/login`, {
      method: 'POST', headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({email: email.trim().toLowerCase(), password: password || ''})
    });
    if (!response.ok) throw new Error('No se pudo iniciar sesión. Revisa el correo, la contraseña y la conexión.');
    const result = await response.json();
    localStorage.setItem('ecologistica_access_token', result.access_token);
    AuthService.setUser(result.usuario);
    return result.usuario;
  },

  /**
   * Inicio rápido por rol para demostración
   */
  loginAsRole: async (rol: RolUsuario): Promise<Usuario> => {
    throw new Error('Introduce el correo y la contraseña de tu cuenta para iniciar sesión.');
  },
};
