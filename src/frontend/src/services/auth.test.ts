import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AuthService, CUENTAS_PREDEFINIDAS } from './auth';
import { Usuario } from './api';

describe('Servicio de Autenticación: AuthService', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it('getUser retorna null cuando no existe sesión en localStorage', () => {
    const user = AuthService.getUser();
    expect(user).toBeNull();
  });

  it('setUser guarda el usuario en localStorage y getUser lo recupera correctamente', () => {
    const mockUser: Usuario = CUENTAS_PREDEFINIDAS[0];
    AuthService.setUser(mockUser);

    const retrieved = AuthService.getUser();
    expect(retrieved).not.toBeNull();
    expect(retrieved?.email).toBe('admin@ecologistica.pe');
    expect(retrieved?.rol).toBe('ADMIN');
  });

  it('logout elimina la sesión del localStorage', () => {
    AuthService.setUser(CUENTAS_PREDEFINIDAS[1]);
    expect(AuthService.getUser()).not.toBeNull();

    AuthService.logout();
    expect(AuthService.getUser()).toBeNull();
  });

  it('login con cuenta predefinida (fallback offline) autentica exitosamente', async () => {
    // Simular fallo de fetch a Supabase para evaluar el fallback local
    globalThis.fetch = vi.fn().mockRejectedValue(new Error('Network error'));

    const user = await AuthService.login('admin@ecologistica.pe', 'admin123');
    expect(user).toBeDefined();
    expect(user.rol).toBe('ADMIN');
    expect(user.email).toBe('admin@ecologistica.pe');
    expect(AuthService.getUser()?.email).toBe('admin@ecologistica.pe');
  });

  it('login con correo nuevo genera perfil de CLIENTE por defecto', async () => {
    globalThis.fetch = vi.fn().mockRejectedValue(new Error('Network error'));

    const nuevoEmail = 'nuevo.comercio@lima.pe';
    const user = await AuthService.login(nuevoEmail, 'password123');

    expect(user).toBeDefined();
    expect(user.email).toBe(nuevoEmail);
    expect(user.rol).toBe('CLIENTE');
    expect(user.permisos).toContain('TRACKING_CLIENTE');
  });

  it('loginAsRole autentica según el rol especificado', async () => {
    globalThis.fetch = vi.fn().mockRejectedValue(new Error('Network error'));

    const repUser = await AuthService.loginAsRole('REPARTIDOR');
    expect(repUser.rol).toBe('REPARTIDOR');

    const ofiUser = await AuthService.loginAsRole('OFICINA');
    expect(ofiUser.rol).toBe('OFICINA');
  });

  it('pingSupabase mide latencia o maneja desconexión', async () => {
    // Caso 1: Supabase responde OK
    globalThis.fetch = vi.fn().mockResolvedValue({ ok: true, status: 200 } as Response);
    const pingOk = await AuthService.pingSupabase();
    expect(pingOk.ok).toBe(true);

    // Caso 2: Supabase no disponible
    globalThis.fetch = vi.fn().mockRejectedValue(new Error('Network error'));
    const pingFail = await AuthService.pingSupabase();
    expect(pingFail.ok).toBe(false);
  });
});

