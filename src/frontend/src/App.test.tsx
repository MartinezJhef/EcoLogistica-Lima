import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { App } from './App';
import { AuthService, CUENTAS_PREDEFINIDAS } from './services/auth';

describe('Componente Principal de Enrutamiento: App', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => []
    } as unknown as Response);
  });

  it('muestra la pantalla de Login cuando el usuario no está autenticado', () => {
    vi.spyOn(AuthService, 'getUser').mockReturnValue(null);

    render(<App />);

    expect(screen.getByText('Acceso al Sistema')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('usuario@ecologistica.pe')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Iniciar Sesión/i })).toBeInTheDocument();
  });

  it('renderiza la barra lateral y módulos autorizados cuando el usuario es ADMIN', () => {
    const adminUser = CUENTAS_PREDEFINIDAS[0];
    vi.spyOn(AuthService, 'getUser').mockReturnValue(adminUser);

    render(<App />);

    // Verificar marca institucional
    expect(screen.getByText('EcoLogística')).toBeInTheDocument();
    expect(screen.getByText('Sys MTZ')).toBeInTheDocument();

    // Módulos de navegación para Administrador
    expect(screen.getByRole('button', { name: /Vehículos/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Conductores/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Clientes/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Rutas y Despacho/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Administración/i })).toBeInTheDocument();

    // Badge y datos de perfil del usuario autenticado
    expect(screen.getByText('Administrador')).toBeInTheDocument();
    expect(screen.getByText('Acceso Total')).toBeInTheDocument();
    expect(screen.getByText(adminUser.email)).toBeInTheDocument();
  });

  it('permite cerrar sesión y redirige a la vista de Login', async () => {
    const adminUser = CUENTAS_PREDEFINIDAS[0];
    vi.spyOn(AuthService, 'getUser').mockReturnValue(adminUser);
    const logoutSpy = vi.spyOn(AuthService, 'logout');

    render(<App />);

    const logoutBtn = screen.getByRole('button', { name: /Cerrar Sesión/i });
    expect(logoutBtn).toBeInTheDocument();

    fireEvent.click(logoutBtn);

    await waitFor(() => {
      expect(logoutSpy).toHaveBeenCalled();
      expect(screen.getByText('Acceso al Sistema')).toBeInTheDocument();
    });
  });

  it('filtra los enlaces de navegación según el rol del usuario (REPARTIDOR)', () => {
    const repartidorUser = CUENTAS_PREDEFINIDAS[2]; // Rol REPARTIDOR
    vi.spyOn(AuthService, 'getUser').mockReturnValue(repartidorUser);

    render(<App />);

    // El repartidor tiene acceso a Conductores, Rutas y Tracking, pero NO a Vehículos ni Clientes ni Administración
    expect(screen.getByRole('button', { name: /Conductores/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Rutas y Despacho/i })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /^Vehículos$/i })).toBeNull();
    expect(screen.queryByRole('button', { name: /^Clientes$/i })).toBeNull();
    expect(screen.queryByRole('button', { name: /Administración/i })).toBeNull();
  });
});
