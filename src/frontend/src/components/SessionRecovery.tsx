import React, { useState } from 'react';
import { AccessibleDialog } from './AccessibleDialog';
import { AuthService } from '../services/auth';
import type { Usuario } from '../services/api';

// This claim is only a UI hint. The API always verifies the signature and expiry.
export function sessionExpiresAt(token: string | null): number | null {
  if (!token) return null;
  try {
    const encoded = token.split('.')[0].replace(/-/g, '+').replace(/_/g, '/');
    const { exp } = JSON.parse(atob(encoded.padEnd(Math.ceil(encoded.length / 4) * 4, '=')));
    return typeof exp === 'number' && Number.isFinite(exp) && exp > 0 ? exp * 1000 : null;
  } catch { return null; }
}

type Props = { user: Usuario; expired: boolean; onResume: (user: Usuario) => void; onExit: () => void; onPostpone: () => void };
export function SessionRecovery({ user, expired, onResume, onExit, onPostpone }: Props) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const resume = async (event: React.FormEvent) => {
    event.preventDefault(); setBusy(true); setError(null);
    try {
      const confirmed = await AuthService.login(user.email, password);
      if (confirmed.usuario_id !== user.usuario_id || confirmed.rol !== user.rol) {
        AuthService.logout(); onExit(); return;
      }
      setPassword(''); onResume(confirmed);
    } catch {
      setError('No se pudo renovar la sesión. Revisa la contraseña y la conexión. Tus cambios siguen en esta pestaña.');
    } finally { setBusy(false); }
  };
  return <div className="apple-modal-overlay" style={{ zIndex:10000 }}>
    <AccessibleDialog className="apple-modal session-recovery" label="Continuar la sesión" errorMessage={error} onDismiss={() => { if (!expired && !busy) onPostpone(); }}>
      <h2>{expired ? 'Tu sesión terminó' : 'Tu sesión está por terminar'}</h2>
      <p role="status">Vuelve a identificarte para continuar. Los formularios se conservan en esta pestaña; no cierres ni recargues la página.</p>
      <form onSubmit={resume} style={{ display:'grid', gap:16, marginTop:16 }}>
        <label>Correo de la cuenta
          <input type="email" autoComplete="username" readOnly value={user.email} style={{ width:'100%' }} />
        </label>
        <label>Contraseña para continuar
          <input type="password" autoComplete="current-password" required value={password} onChange={e=>setPassword(e.target.value)} disabled={busy} style={{ width:'100%' }} />
        </label>
        <button className="btn" type="submit" disabled={busy}>{busy ? 'Verificando…' : 'Identificarme y continuar'}</button>
        {!expired && <button className="btn btn-secondary" type="button" disabled={busy} onClick={onPostpone}>Continuar por ahora</button>}
        <button className="btn btn-secondary" type="button" disabled={busy} onClick={onExit}>Salir y descartar cambios sin guardar</button>
      </form>
    </AccessibleDialog>
  </div>;
}
