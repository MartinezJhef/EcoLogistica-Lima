import React, { useState, useEffect } from 'react';
import { 
  BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation 
} from 'react-router-dom';
import { 
  Truck, Users, PackageCheck, Sparkles, 
  KeyRound, LogOut, Shield, Briefcase, Store
} from 'lucide-react';
import { VehiculosView } from './pages/VehiculosView';
import { ConductoresView } from './pages/ConductoresView';
import { ClientesView } from './pages/ClientesView';
import { PedidosView } from './pages/PedidosView';
import { AdminUsersView } from './pages/AdminUsersView';
import { LoginView } from './pages/LoginView';
import { AuthService } from './services/auth';
import { Usuario, RolUsuario } from './services/api';

function AppLayout() {
  const navigate = useNavigate();
  const location = useLocation();

  const [theme, setTheme] = useState<'dark' | 'light'>('light');
  const [currentUser, setCurrentUser] = useState<Usuario | null>(() => AuthService.getUser());

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
  const canAccessConductores = userRole === 'ADMIN' || userRole === 'OFICINA' || userRole === 'REPARTIDOR';
  const canAccessClientes = userRole === 'ADMIN' || userRole === 'OFICINA';
  const canAccessPedidos = true; // Todos los roles tienen acceso o tracking
  const canAccessAdmin = userRole === 'ADMIN';

  const roleMeta: Record<RolUsuario, { label: string; badge: string; color: string; icon: any }> = {
    ADMIN: { label: 'Administrador', badge: 'Acceso Total', color: '#A7B38B', icon: Shield },
    OFICINA: { label: 'Personal Oficina', badge: 'Seguimiento', color: '#F5F4EE', icon: Briefcase },
    REPARTIDOR: { label: 'Repartidor', badge: 'Ruta Campo', color: '#DDA15E', icon: Truck },
    CLIENTE: { label: 'Cliente B2B', badge: 'Tracking', color: '#A7B38B', icon: Store },
  };

  const roleConfig = roleMeta[userRole] || roleMeta.ADMIN;
  const RoleIcon = roleConfig.icon;

  return (
    <div className="container">
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
          border: '1px solid rgba(167, 179, 139, 0.35)',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.25)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ 
              fontSize: '0.65rem', 
              fontWeight: 700, 
              color: '#F5F4EE',
              padding: '0.15rem 0.45rem',
              borderRadius: '6px',
              background: '#2D3A2E',
              border: '1px solid rgba(167, 179, 139, 0.35)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.3rem'
            }}>
              <RoleIcon size={12} color={roleConfig.color} />
              {userRole} · {roleConfig.badge}
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
            color: '#A7B38B',
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
        <nav className="nav-links">
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
      <main className="main-content">
        <Routes>
          <Route 
            path="/" 
            element={
              <Navigate 
                to={userRole === 'CLIENTE' || userRole === 'REPARTIDOR' ? '/pedidos' : '/vehiculos'} 
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
          <Route path="/pedidos" element={<PedidosView />} />
          <Route 
            path="/admin" 
            element={
              canAccessAdmin ? (
                <AdminUsersView 
                  currentSimulatedRole={userRole} 
                  onRoleChange={() => {}} 
                />
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
                to={userRole === 'CLIENTE' || userRole === 'REPARTIDOR' ? '/pedidos' : '/vehiculos'} 
                replace 
              />
            } 
          />
        </Routes>
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
