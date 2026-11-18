import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AuthService } from './auth';
import { CUENTAS_PREDEFINIDAS } from '../test/demoFixtures';
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
    expect(retrieved?.email).toBe('admin@example.test');
    expect(retrieved?.rol).toBe('ADMIN');
  });

  it('logout elimina la sesión del localStorage', () => {
    AuthService.setUser(CUENTAS_PREDEFINIDAS[1]);
    expect(AuthService.getUser()).not.toBeNull();

    AuthService.logout();
    expect(AuthService.getUser()).toBeNull();
  });

  it('comprueba contraseña en el servidor y guarda el token recibido', async () => {
    const user = CUENTAS_PREDEFINIDAS[0];
    globalThis.fetch = vi.fn().mockResolvedValue({ok:true, json:async()=>({access_token:'signed-token', usuario:user})});
    expect(await AuthService.login(user.email, 'contraseña')).toEqual(user);
    expect(localStorage.getItem('ecologistica_access_token')).toBe('signed-token');
    expect(JSON.parse((globalThis.fetch as any).mock.calls[0][1].body).password).toBe('contraseña');
  });
  it('no crea perfiles ni acepta cuentas predefinidas cuando el servidor falla', async () => {
    globalThis.fetch = vi.fn().mockRejectedValue(new Error('Sin conexión'));
    await expect(AuthService.login('admin@example.test', 'incorrecta')).rejects.toThrow();
    expect(AuthService.getUser()).toBeNull();
  });
  it('rechaza credenciales inválidas y acceso por selección de rol', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({ok:false});
    await expect(AuthService.login('no@existe.pe','incorrecta')).rejects.toThrow();
    await expect(AuthService.loginAsRole('ADMIN')).rejects.toThrow();
    expect(AuthService.getUser()).toBeNull();
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

