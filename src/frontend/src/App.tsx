import React, { useState, useEffect } from 'react';
import { Truck, Users, PackageCheck, ShieldCheck, Sparkles, Moon, Sun } from 'lucide-react';
import { VehiculosView } from './pages/VehiculosView';
import { ConductoresView } from './pages/ConductoresView';
import { PedidosView } from './pages/PedidosView';

export function App() {
  const [activeTab, setActiveTab] = useState<'vehiculos' | 'conductores' | 'pedidos'>('vehiculos');
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  return (
    <div className="container">
      {/* Sidebar con estilo macOS Sonoma / VisionOS Dark Glass */}
      <aside className="sidebar">
        <div className="brand-badge">
          <div className="icon-container">
            <Sparkles size={17} />
          </div>
          <div>
            <h2>EcoLogística</h2>
          </div>
        </div>
        <p className="sidebar-caption">Lima · DistriRápido S.A.C.</p>

        <nav className="nav-links">
          <button
            className={`nav-item ${activeTab === 'vehiculos' ? 'active' : ''}`}
            onClick={() => setActiveTab('vehiculos')}
          >
            <Truck size={17} />
            <span>Vehículos</span>
          </button>

          <button
            className={`nav-item ${activeTab === 'conductores' ? 'active' : ''}`}
            onClick={() => setActiveTab('conductores')}
          >
            <Users size={17} />
            <span>Conductores</span>
          </button>

          <button
            className={`nav-item ${activeTab === 'pedidos' ? 'active' : ''}`}
            onClick={() => setActiveTab('pedidos')}
          >
            <PackageCheck size={17} />
            <span>Pedidos y GPS</span>
          </button>
        </nav>

        {/* Conmutador de Tema Apple & Telemetría */}
        <div className="sidebar-footer">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.65rem' }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--apple-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Apariencia
            </span>
            <button
              onClick={toggleTheme}
              className="btn-secondary"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                padding: '0.25rem 0.55rem',
                fontSize: '0.72rem',
                borderRadius: '8px',
                cursor: 'pointer'
              }}
            >
              {theme === 'dark' ? <Moon size={12} color="var(--apple-accent)" /> : <Sun size={12} color="var(--apple-orange)" />}
              <span>{theme === 'dark' ? 'Oscuro' : 'Claro'}</span>
            </button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', fontWeight: 600, color: 'var(--apple-text-primary)' }}>
            <ShieldCheck size={15} color="var(--apple-cyan)" /> FastAPI 0.109+
          </div>
          <p style={{ color: 'var(--apple-text-secondary)', fontSize: '0.7rem', marginTop: '0.2rem' }}>
            PostgreSQL 16 + PostGIS
          </p>
        </div>
      </aside>

      {/* Área Principal de Contenido */}
      <main className="main-content">
        {activeTab === 'vehiculos' && <VehiculosView />}
        {activeTab === 'conductores' && <ConductoresView />}
        {activeTab === 'pedidos' && <PedidosView />}
      </main>
    </div>
  );
}

export default App;
