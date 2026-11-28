import React, { useState, useEffect } from 'react';
import { 
  Lock, Mail, ArrowRight, ShieldCheck,
  CloudLightning, AlertCircle, Eye, EyeOff 
} from 'lucide-react';
import { AuthService } from '../services/auth';
import { Usuario, API_BASE_URL } from '../services/api';

interface LoginViewProps {
  onLoginSuccess: (usuario: Usuario) => void;
}

export function LoginView({ onLoginSuccess }: LoginViewProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Verificación de conectividad con la API
  const [cloudStatus, setCloudStatus] = useState<{ ok: boolean; latencyMs?: number } | null>(null);

  useEffect(() => {
    let isMounted = true;
    const testCloud = async () => {
      const t0 = performance.now();
      try {
        const res = await fetch(`${API_BASE_URL}/health`);
        const latency = Math.round(performance.now() - t0);
        if (isMounted) {
          setCloudStatus({ ok: res.ok, latencyMs: latency });
        }
      } catch (e) {
        if (isMounted) setCloudStatus({ ok: false });
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
        'Credenciales inválidas. Verifica tu correo y contraseña y la conexión al servidor.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page" style={{
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
              {/* Imagen adaptable: AVIF → WebP → PNG, con densidad 1x y 2x.
                  El navegador descarga solo una variante (~0.5 a 1.1 KB). */}
              <picture>
                <source
                  type="image/avif"
                  srcSet="/brand/isotipo-56.avif 1x, /brand/isotipo-112.avif 2x"
                />
                <source
                  type="image/webp"
                  srcSet="/brand/isotipo-56.webp 1x, /brand/isotipo-112.webp 2x"
                />
                <img
                  src="/brand/isotipo-56.png"
                  srcSet="/brand/isotipo-56.png 1x, /brand/isotipo-112.png 2x"
                  width={32}
                  height={32}
                  alt=""
                  decoding="async"
                  style={{ display: 'block', width: '32px', height: '32px' }}
                />
              </picture>
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
                  ? `Servidor conectado (${cloudStatus.latencyMs}ms)`
                  : 'Servidor sin conexión'}
              </span>
            </div>
          </div>

          {/* Formulario de Login */}
          <p style={{fontSize:'0.85rem', color:'#3C4A3F'}}>El rol se reconoce por tu cuenta. Para entrar como oficina, repartidor o cliente, utiliza el correo y la contraseña que te asignó administración.</p>
          <form onSubmit={handleLogin}>
            {error && (
              <div role="alert" style={{
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
              <label htmlFor="loginview-field-6509" style={{
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
                  color: '#596A46',
                  pointerEvents: 'none'
                }} />
                <input id="loginview-field-6509"
                  type="email"
                  autoComplete="username"
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
              <label htmlFor="loginview-field-8195" style={{
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
                  color: '#596A46',
                  pointerEvents: 'none'
                }} />
                <input id="loginview-field-8195"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
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
                  aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                  title={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                  style={{
                    position: 'absolute',
                    right: '10px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: '#596A46',
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
                <span>Validando credenciales...</span>
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
