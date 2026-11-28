import React from 'react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { SessionRecovery, sessionExpiresAt } from './SessionRecovery';
import { AuthService } from '../services/auth';
import { CUENTAS_PREDEFINIDAS } from '../test/demoFixtures';

describe('Reidentificación sin perder formularios',()=>{
  afterEach(()=>vi.restoreAllMocks());
  const user=CUENTAS_PREDEFINIDAS[0];
  function show(expired=true) {
    const callbacks={onResume:vi.fn(),onExit:vi.fn(),onPostpone:vi.fn()};
    render(<SessionRecovery user={user} expired={expired} {...callbacks}/>);return callbacks;
  }
  it('lee solo la expiración para el aviso, sin aceptar un token como autorización',()=>{
    expect(sessionExpiresAt(null)).toBeNull();expect(sessionExpiresAt('invalid')).toBeNull();
    expect(sessionExpiresAt(btoa(JSON.stringify({exp:100}))+'.unverified')).toBe(100000);
    expect(sessionExpiresAt(btoa(JSON.stringify({exp:'100'}))+'.unverified')).toBeNull();
  });
  it('conserva el bloqueo y anuncia un error al fallar la contraseña',async()=>{
    vi.spyOn(AuthService,'login').mockRejectedValue(new Error('offline'));
    const callbacks=show();fireEvent.change(screen.getByLabelText('Contraseña para continuar'),{target:{value:'fixture-only'}});
    fireEvent.click(screen.getByRole('button',{name:'Identificarme y continuar'}));
    await waitFor(()=>expect(screen.getByRole('alert')).toHaveTextContent('Tus cambios siguen'));
    expect(callbacks.onResume).not.toHaveBeenCalled();expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.queryByRole('button',{name:'Continuar por ahora'})).toBeNull();
  });
  it('reanuda únicamente al confirmar la misma cuenta y rol',async()=>{
    const login=vi.spyOn(AuthService,'login').mockResolvedValue({...user});
    const callbacks=show();fireEvent.change(screen.getByLabelText('Contraseña para continuar'),{target:{value:'fixture-only'}});
    fireEvent.click(screen.getByRole('button',{name:'Identificarme y continuar'}));
    await waitFor(()=>expect(callbacks.onResume).toHaveBeenCalledWith(user));
    expect(login).toHaveBeenCalledWith(user.email,'fixture-only');expect(callbacks.onExit).not.toHaveBeenCalled();
  });
  it('descarta el contexto anterior si el servidor devuelve otra identidad',async()=>{
    vi.spyOn(AuthService,'login').mockResolvedValue({...user,usuario_id:'another-account'});
    const logout=vi.spyOn(AuthService,'logout');const callbacks=show();
    fireEvent.change(screen.getByLabelText('Contraseña para continuar'),{target:{value:'fixture-only'}});
    fireEvent.click(screen.getByRole('button',{name:'Identificarme y continuar'}));
    await waitFor(()=>expect(callbacks.onExit).toHaveBeenCalled());expect(logout).toHaveBeenCalled();
    expect(callbacks.onResume).not.toHaveBeenCalled();
  });
  it('permite aplazar el aviso previo, pero no una sesión ya vencida',()=>{
    const callbacks=show(false);fireEvent.click(screen.getByRole('button',{name:'Continuar por ahora'}));
    expect(callbacks.onPostpone).toHaveBeenCalled();
  });
});
