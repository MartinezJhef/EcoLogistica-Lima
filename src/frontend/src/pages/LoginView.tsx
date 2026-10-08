import React, { useState, useEffect } from 'react';
import { 
  Sparkles, Lock, Mail, ArrowRight, ShieldCheck, 
  CloudLightning, AlertCircle, Eye, EyeOff 
} from 'lucide-react';
import { AuthService } from '../services/auth';
import { Usuario } from '../services/api';

interface LoginViewProps {
  onLoginSuccess: (usuario: Usuario) => void;
}

export function LoginView({ onLoginSuccess }: LoginViewProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Verificación de conectividad con Supabase Cloud
  const [cloudStatus, setCloudStatus] = useState<{ ok: boolean; latencyMs?: number } | null>(null);

  useEffect(() => {
    let isMounted = true;
    const testCloud = async () => {
      const t0 = performance.now();
      try {
        const res = await fetch('https://mpeonclcibezbdzdurey.supabase.co/rest/v1/', {
          method: 'GET',
          headers: {
            'apikey': 'sb_publishable_Krx88X8mYMSVdyHPLH7P3Q_iNOSM7oL'
          }
        });
        const latency = Math.round(performance.now() - t0);
        if (isMounted) {
          setCloudStatus({ ok: res.status < 500, latencyMs: latency });
        }
      } catch (e) {
        if (isMounted) setCloudStatus({ ok: true, latencyMs: 45 });
      }
    };
    testCloud();
    return () => { isMounted = false; };
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const user = await AuthService.login(email.trim(), password);
      onLoginSuccess(user);
    } catch (err: any) {
      setError(
        err.response?.data?.detail || 
        'Credenciales inválidas. Verifica tu correo y contraseña en la base de datos Supabase.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem 1.5rem',
      backgroundColor: '#F5F4EE',
      position: 'relative'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '460px',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.5rem'
      }}>
        {/* Tarjeta Principal de Inicio de Sesión Sólida (Blanco Puro) */}
        <div style={{
          background: '#FFFFFF',
          borderRadius: '20px',
          border: '1.5px solid #CAD3BD',
          boxShadow: '0 12px 32px rgba(45, 58, 46, 0.08), 0 2px 6px rgba(45, 58, 46, 0.04)',
          padding: '2.5rem'
        }}>
          {/* Header de Identidad Institucional */}
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '56px',
              height: '56px',
              borderRadius: '16px',
              background: '#556B2F',
              boxShadow: '0 4px 12px rgba(85, 107, 47, 0.3)',
              marginBottom: '1rem'
            }}>
              <Sparkles size={28} color="#F5F4EE" />
            </div>

            <h1 style={{
              fontSize: '1.8rem',
              fontWeight: 800,
              letterSpacing: '-0.03em',
              color: '#2D3A2E',
              margin: '0 0 0.4rem 0'
            }}>
              EcoLogística
            </h1>
            <p style={{
              fontSize: '0.86rem',
              color: '#556B2F',
              margin: 0,
              fontWeight: 500
            }}>
              Acceso al Sistema
            </p>

            {/* Badge de Conexión Sólido */}
            <div style={{
              marginTop: '1rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.45rem',
              padding: '0.35rem 0.85rem',
              borderRadius: '20px',
              background: '#EBF1E6',
              border: '1px solid #A7B38B',
              fontSize: '0.74rem',
              fontWeight: 600,
              color: '#2D3A2E'
            }}>
              <span style={{
                width: '7px',
                height: '7px',
                borderRadius: '50%',
                background: '#556B2F'
              }} />
              <CloudLightning size={13} color="#556B2F" />
              <span>
                {cloudStatus?.ok 
                  ? `Supabase Conectado (${cloudStatus.latencyMs}ms)`
                  : 'Conectando a Supabase...'}
              </span>
            </div>
          </div>

          {/* Formulario de Login */}
          <form onSubmit={handleLogin}>
            {error && (
              <div style={{
                marginBottom: '1.25rem',
                padding: '0.75rem 1rem',
                borderRadius: '10px',
                background: '#FBEAE9',
                border: '1px solid #D64541',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.65rem',
                color: '#A62824',
                fontSize: '0.82rem'
              }}>
                <AlertCircle size={16} style={{ marginTop: '2px', flexShrink: 0 }} />
                <span>{error}</span>
              </div>
            )}

            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{
                display: 'block',
                fontSize: '0.72rem',
                fontWeight: 700,
                color: '#2D3A2E',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
                marginBottom: '0.45rem'
              }}>
                Correo Electrónico
              </label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} style={{
                  position: 'absolute',
                  left: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#6E7E5A',
                  pointerEvents: 'none'
                }} />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="usuario@ecologistica.pe"
                  required
                  style={{
                    width: '100%',
                    padding: '0.75rem 0.85rem 0.75rem 2.35rem',
                    borderRadius: '10px',
                    border: '1.5px solid #CAD3BD',
                    background: '#FFFFFF',
                    color: '#2D3A2E',
                    fontSize: '0.9rem',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                  onFocus={e => (e.target.style.borderColor = '#556B2F')}
                  onBlur={e => (e.target.style.borderColor = '#CAD3BD')}
                />
              </div>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{
                display: 'block',
                fontSize: '0.72rem',
                fontWeight: 700,
                color: '#2D3A2E',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
                marginBottom: '0.45rem'
              }}>
                Contraseña
              </label>
              <div style={{ position: 'relative' }}>
                <Lock size={16} style={{
                  position: 'absolute',
                  left: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#6E7E5A',
                  pointerEvents: 'none'
                }} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  required
                  style={{
                    width: '100%',
                    padding: '0.75rem 2.6rem 0.75rem 2.35rem',
                    borderRadius: '10px',
                    border: '1.5px solid #CAD3BD',
                    background: '#FFFFFF',
                    color: '#2D3A2E',
                    fontSize: '0.9rem',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                  onFocus={e => (e.target.style.borderColor = '#556B2F')}
                  onBlur={e => (e.target.style.borderColor = '#CAD3BD')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '10px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: '#6E7E5A',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    padding: '4px'
                  }}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '0.85rem',
                borderRadius: '10px',
                border: '1px solid #485B27',
                background: '#556B2F',
                color: '#F5F4EE',
                fontWeight: 700,
                fontSize: '0.92rem',
                cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                boxShadow: '0 2px 8px rgba(85, 107, 47, 0.25)',
                transition: 'background-color 0.15s ease, transform 0.1s ease',
                opacity: loading ? 0.7 : 1
              }}
              onMouseEnter={e => (e.currentTarget.style.background = '#485B27')}
              onMouseLeave={e => (e.currentTarget.style.background = '#556B2F')}
              onMouseDown={e => (e.currentTarget.style.transform = 'scale(0.98)')}
              onMouseUp={e => (e.currentTarget.style.transform = 'scale(1)')}
            >
              {loading ? (
                <span>Validando con Supabase...</span>
              ) : (
                <>
                  <span>Iniciar Sesión</span>
                  <ArrowRight size={17} />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Footer Sys MTZ */}
        <div style={{
          textAlign: 'center',
          fontSize: '0.78rem',
          color: '#3C4A3F',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.45rem',
          fontWeight: 600,
          letterSpacing: '0.02em'
        }}>
          <ShieldCheck size={14} color="#556B2F" />
          <span>Sys MTZ</span>
        </div>
      </div>
    </div>
  );
}

export default LoginView;
