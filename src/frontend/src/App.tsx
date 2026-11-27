import React, { Suspense, lazy, useState, useEffect } from 'react';
import { 
  BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation 
} from 'react-router-dom';
import { 
  Truck, Users, PackageCheck, Sparkles, 
  KeyRound, LogOut, Shield, Briefcase, Store,
  Route as RouteIcon
} from 'lucide-react';
import { LoginView } from './pages/LoginView';
import { AuthService } from './services/auth';
import { Usuario, RolUsuario } from './services/api';

// División de código por ruta: cada módulo se descarga solo cuando el usuario entra
// a él. El login se mantiene en el paquete inicial porque es la primera pantalla.
const VehiculosView = lazy(() =>
  import('./pages/VehiculosView').then(m => ({ default: m.VehiculosView }))
);
const ConductoresView = lazy(() =>
  import('./pages/ConductoresView').then(m => ({ default: m.ConductoresView }))
);
const ClientesView = lazy(() =>
  import('./pages/ClientesView').then(m => ({ default: m.ClientesView }))
);
const PedidosView = lazy(() =>
  import('./pages/PedidosView').then(m => ({ default: m.PedidosView }))
);
const RutasView = lazy(() =>
  import('./pages/RutasView').then(m => ({ default: m.RutasView }))
);
const AdminUsersView = lazy(() =>
  import('./pages/AdminUsersView').then(m => ({ default: m.AdminUsersView }))
);
const ClientePedidosView = lazy(() => import('./pages/ClientePedidosView').then(m=>({default:m.ClientePedidosView})));
const SostenibilidadView = lazy(() => import('./pages/SostenibilidadView').then(m => ({default: m.SostenibilidadView})));

/** Reserva de espacio mientras se descarga el módulo: evita saltos de maquetación. */
function ModuleFallback() {
  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.75rem',
        minHeight: '40vh',
        color: 'var(--apple-text-secondary, #556B2F)',
        fontSize: '0.85rem'
      }}
    >
      <span
        aria-hidden="true"
        style={{
          width: '28px',
          height: '28px',
          borderRadius: '999px',
          border: '3px solid rgba(167, 179, 139, 0.35)',
          borderTopColor: '#2D3A2E',
          animation: 'module-spin 0.8s linear infinite'
        }}
      />
      <span>Cargando módulo…</span>
    </div>
  );
}

function AppLayout() {
  const navigate = useNavigate();
  const location = useLocation();

  const [theme, setTheme] = useState<'dark' | 'light'>('light');
  const [currentUser, setCurrentUser] = useState<Usuario | null>(() => AuthService.getUser());

  useEffect(() => {
    const expired = () => { AuthService.logout(); setCurrentUser(null); navigate('/login', { replace: true }); };
    window.addEventListener('ecologistica-session-expired', expired);
    return () => window.removeEventListener('ecologistica-session-expired', expired);
  }, [navigate]);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  const handleLogout = () => {
    AuthService.logout();
    setCurrentUser(null);
    navigate('/login');
  };

  const currentPath = location.pathname;

  // Si no está autenticado y no está en /login, redirigir a /login
  if (!currentUser) {
    return (
      <Routes>
        <Route 
          path="/login" 
          element={<LoginView onLoginSuccess={(u) => setCurrentUser(u)} />} 
        />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  // Si está autenticado y accede a /login, redirigir al módulo según rol
  if (currentPath === '/login') {
    const defaultRoute = currentUser.rol === 'CLIENTE' || currentUser.rol === 'REPARTIDOR' 
      ? '/pedidos' 
      : '/vehiculos';
    return <Navigate to={defaultRoute} replace />;
  }

  const userRole = currentUser.rol;

  // Permisos de visibilidad en el menú lateral según el rol del usuario autenticado
  const canAccessVehiculos = userRole === 'ADMIN' || userRole === 'OFICINA';
  const canAccessConductores = userRole === 'ADMIN' || userRole === 'OFICINA';
  const canAccessClientes = userRole === 'ADMIN' || userRole === 'OFICINA';
  const canAccessRutas = userRole === 'ADMIN' || userRole === 'OFICINA' || userRole === 'REPARTIDOR';
  const canAccessPedidos = true; // Todos los roles tienen acceso o tracking
  const canAccessAdmin = userRole === 'ADMIN';
  const canAccessAnalytics = userRole === 'ADMIN' || (userRole === 'OFICINA' && currentUser.permisos.includes('ANALITICA'));

  const roleMeta: Record<RolUsuario, { label: string; badge: string; color: string; icon: any }> = {
    ADMIN: { label: 'Administrador', badge: 'Acceso Total', color: '#C4D2A8', icon: Shield },
    OFICINA: { label: 'Personal Oficina', badge: 'Seguimiento', color: '#F5F4EE', icon: Briefcase },
    REPARTIDOR: { label: 'Repartidor', badge: 'Ruta Campo', color: '#EDB878', icon: Truck },
    CLIENTE: { label: 'Cliente B2B', badge: 'Tracking', color: '#C4D2A8', icon: Store },
  };

  const roleConfig = roleMeta[userRole] || roleMeta.ADMIN;
  const RoleIcon = roleConfig.icon;

  return (
    <div className="container">
      <a className="skip-link" href="#main-content">Saltar al contenido principal</a>
      {/* Sidebar Sólida Verde Bosque (#2D3A2E) */}
      <aside className="sidebar">
        <div className="brand-badge">
          <div className="icon-container">
            <Sparkles size={17} />
          </div>
          <div>
            <h2>EcoLogística</h2>
          </div>
        </div>
        <p className="sidebar-caption">Sys MTZ</p>

        {/* Tarjeta de Perfil Sólida (#3C4A3F) */}
        <div style={{
          margin: '0 0 1.25rem 0',
          padding: '0.85rem',
          borderRadius: '12px',
          background: '#3C4A3F',
          border: '1.5px solid #4A5B4E',
          display: 'flex',
          flexDirection: 'column'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '0.5rem'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              fontSize: '0.75rem',
              fontWeight: 700,
              color: roleConfig.color
            }}>
              <RoleIcon size={14} />
              <span>{roleConfig.label}</span>
            </div>
            <span style={{
              fontSize: '0.65rem',
              padding: '2px 6px',
              borderRadius: '999px',
              background: '#2D3A2E',
              color: '#F5F4EE',
              fontWeight: 600,
              border: '1px solid #4A5B4E'
            }}>
              {roleConfig.badge}
            </span>
          </div>

          <div style={{
            fontSize: '0.84rem',
            fontWeight: 700,
            color: '#F5F4EE',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
          }}>
            {currentUser.nombre_completo.split('(')[0].trim()}
          </div>

          <div style={{
            fontSize: '0.7rem',
            color: '#C4D2A8',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            marginBottom: '0.65rem'
          }}>
            {currentUser.email}
          </div>

          {/* Botón de Cerrar Sesión Sólido */}
          <button
            onClick={handleLogout}
            style={{
              width: '100%',
              padding: '0.4rem 0.5rem',
              borderRadius: '8px',
              border: '1px solid rgba(214, 69, 65, 0.45)',
              background: '#2D3A2E',
              color: '#FF8A87',
              fontSize: '0.72rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.35rem',
              transition: 'background-color 0.15s ease'
            }}
            onMouseEnter={e => (e.currentTarget.style.background = '#243025')}
            onMouseLeave={e => (e.currentTarget.style.background = '#2D3A2E')}
          >
            <LogOut size={12} />
            <span>Cerrar Sesión</span>
          </button>
        </div>

        {/* Enlaces de Navegación Dinámica */}
        <nav className="nav-links" aria-label="Navegación principal">
          {canAccessAnalytics && <button className={`nav-item ${currentPath === '/sostenibilidad' ? 'active' : ''}`} onClick={() => navigate('/sostenibilidad')}><Sparkles size={17} /><span>Sostenibilidad</span></button>}
          {canAccessVehiculos && (
            <button
              className={`nav-item ${currentPath === '/vehiculos' ? 'active' : ''}`}
              onClick={() => navigate('/vehiculos')}
            >
              <Truck size={17} />
              <span>Vehículos</span>
            </button>
          )}

          {canAccessConductores && (
            <button
              className={`nav-item ${currentPath === '/conductores' ? 'active' : ''}`}
              onClick={() => navigate('/conductores')}
            >
              <Users size={17} />
              <span>Conductores</span>
            </button>
          )}

          {canAccessClientes && (
            <button
              className={`nav-item ${currentPath === '/clientes' ? 'active' : ''}`}
              onClick={() => navigate('/clientes')}
            >
              <Store size={17} />
              <span>Clientes</span>
            </button>
          )}

          {canAccessRutas && (
            <button
              className={`nav-item ${currentPath === '/rutas' ? 'active' : ''}`}
              onClick={() => navigate('/rutas')}
            >
              <RouteIcon size={17} />
              <span>Rutas y Despacho</span>
            </button>
          )}

          {canAccessPedidos && (
            <button
              className={`nav-item ${currentPath === '/pedidos' ? 'active' : ''}`}
              onClick={() => navigate('/pedidos')}
            >
              <PackageCheck size={17} />
              <span>{userRole === 'CLIENTE' ? 'Tracking de Pedidos' : 'Pedidos y GPS'}</span>
            </button>
          )}

          {canAccessAdmin && (
            <button
              className={`nav-item ${currentPath === '/admin' ? 'active' : ''}`}
              onClick={() => navigate('/admin')}
            >
              <KeyRound size={17} />
              <span>Administración</span>
            </button>
          )}
        </nav>
      </aside>

      {/* Área Principal de Contenido con Enrutamiento Dinámico */}
      <main className="main-content" id="main-content" tabIndex={-1}>
        <Suspense fallback={<ModuleFallback />}>
        <Routes>
          <Route path="/sostenibilidad" element={canAccessAnalytics ? <SostenibilidadView /> : <Navigate to="/pedidos" replace />} />
          <Route 
            path="/" 
            element={
              <Navigate 
                to={userRole === 'CLIENTE' || userRole === 'REPARTIDOR' ? '/pedidos' : '/rutas'} 
                replace 
              />
            } 
          />
          <Route 
            path="/vehiculos" 
            element={canAccessVehiculos ? <VehiculosView /> : <Navigate to="/pedidos" replace />} 
          />
          <Route 
            path="/conductores" 
            element={canAccessConductores ? <ConductoresView /> : <Navigate to="/pedidos" replace />} 
          />
          <Route 
            path="/clientes" 
            element={canAccessClientes ? <ClientesView /> : <Navigate to="/pedidos" replace />} 
          />
          <Route 
            path="/rutas" 
            element={canAccessRutas ? <RutasView /> : <Navigate to="/pedidos" replace />} 
          />
          <Route path="/pedidos" element={userRole === 'CLIENTE' || userRole === 'REPARTIDOR' ? <ClientePedidosView readOnly={userRole === 'REPARTIDOR'} /> : <PedidosView />} />
          <Route 
            path="/admin" 
            element={
              canAccessAdmin ? (
                <AdminUsersView />
              ) : (
                <Navigate to="/pedidos" replace />
              )
            } 
          />
          {/* Ruta comodín de redirección */}
          <Route 
            path="*" 
            element={
              <Navigate 
                to={userRole === 'CLIENTE' || userRole === 'REPARTIDOR' ? '/pedidos' : '/rutas'} 
                replace 
              />
            } 
          />
        </Routes>
        </Suspense>
      </main>
    </div>
  );
}

export function App() {
  return (
    <BrowserRouter>
      <AppLayout />
    </BrowserRouter>
  );
}

export default App;
