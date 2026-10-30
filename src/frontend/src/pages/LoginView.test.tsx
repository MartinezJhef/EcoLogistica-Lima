import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { LoginView } from './LoginView';
import { AuthService, CUENTAS_PREDEFINIDAS } from '../services/auth';

describe('Componente de Vista: LoginView', () => {
  const onLoginSuccessMock = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    // Mock global fetch para evitar llamadas de red reales durante tests
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => []
    } as unknown as Response);
  });

  it('renderiza correctamente los elementos de la interfaz de Login', () => {
    render(<LoginView onLoginSuccess={onLoginSuccessMock} />);

    expect(screen.getByText('EcoLogística')).toBeInTheDocument();
    expect(screen.getByText('Acceso al Sistema')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('usuario@ecologistica.pe')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('••••••••••••')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Iniciar Sesión/i })).toBeInTheDocument();
  });

  it('permite alternar la visibilidad de la contraseña con el botón toggle', () => {
    render(<LoginView onLoginSuccess={onLoginSuccessMock} />);

    const passwordInput = screen.getByPlaceholderText('••••••••••••') as HTMLInputElement;
    expect(passwordInput.type).toBe('password');

    // Botón de visibilidad
    const toggleButtons = screen.getAllByRole('button');
    const eyeButton = toggleButtons.find(b => b.getAttribute('type') === 'button');
    expect(eyeButton).toBeDefined();

    if (eyeButton) {
      fireEvent.click(eyeButton);
      expect(passwordInput.type).toBe('text');

      fireEvent.click(eyeButton);
      expect(passwordInput.type).toBe('password');
    }
  });

  it('inicia sesión exitosamente y ejecuta onLoginSuccess con el usuario autenticado', async () => {
    const adminUser = CUENTAS_PREDEFINIDAS[0];
    vi.spyOn(AuthService, 'login').mockResolvedValue(adminUser);

    render(<LoginView onLoginSuccess={onLoginSuccessMock} />);

    const emailInput = screen.getByPlaceholderText('usuario@ecologistica.pe');
    const passwordInput = screen.getByPlaceholderText('••••••••••••');
    const submitBtn = screen.getByRole('button', { name: /Iniciar Sesión/i });

    fireEvent.change(emailInput, { target: { value: 'admin@ecologistica.pe' } });
    fireEvent.change(passwordInput, { target: { value: 'Admin2026*' } });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(onLoginSuccessMock).toHaveBeenCalledWith(adminUser);
    });
  });

  it('muestra mensaje de error cuando la autenticación falla', async () => {
    vi.spyOn(AuthService, 'login').mockRejectedValue(new Error('Credenciales inválidas.'));

    render(<LoginView onLoginSuccess={onLoginSuccessMock} />);

    const emailInput = screen.getByPlaceholderText('usuario@ecologistica.pe');
    const passwordInput = screen.getByPlaceholderText('••••••••••••');
    const submitBtn = screen.getByRole('button', { name: /Iniciar Sesión/i });

    fireEvent.change(emailInput, { target: { value: 'invalido@ecologistica.pe' } });
    fireEvent.change(passwordInput, { target: { value: 'wrongpass' } });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText(/Credenciales inválidas/i)).toBeInTheDocument();
      expect(onLoginSuccessMock).not.toHaveBeenCalled();
    });
  });
});

