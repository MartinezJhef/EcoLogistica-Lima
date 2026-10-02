import React, { useState, useEffect } from 'react';
import { PackageCheck, Plus, MapPin, AlertCircle, Clock, Weight, CheckCircle2, X } from 'lucide-react';
import { Pedido } from '../services/api';

const MOCK_PEDIDOS: Pedido[] = [
  {
    pedido_id: '1',
    codigo_seguimiento: 'PED-LIMA-001',
    cliente_nombre: 'Bodega San José · San Juan de Lurigancho',
    direccion_destino: 'Av. Canto Grande 2450, SJL',
    latitud: -12.0012,
    longitud: -77.0123,
    peso_kg: 85.0,
    volumen_m3: 0.95,
    ventana_inicio: '08:00',
    ventana_fin: '11:00',
    prioridad: 'ALTA',
    estado: 'PENDIENTE'
  },
  {
    pedido_id: '2',
    codigo_seguimiento: 'PED-LIMA-002',
    cliente_nombre: 'Minimarket Los Laureles · Santa Anita',
    direccion_destino: 'Av. Los Frutales 120, Ate',
    latitud: -12.0450,
    longitud: -76.9650,
    peso_kg: 42.0,
    volumen_m3: 0.45,
    ventana_inicio: '10:00',
    ventana_fin: '13:00',
    prioridad: 'ESTANDAR',
    estado: 'PENDIENTE'
  },
  {
    pedido_id: '3',
    codigo_seguimiento: 'PED-LIMA-003',
    cliente_nombre: 'Supermercado Central · El Agustino',
    direccion_destino: 'Jr. Ancash 890, El Agustino',
    latitud: -12.0380,
    longitud: -76.9980,
    peso_kg: 120.0,
    volumen_m3: 1.40,
    ventana_inicio: '13:00',
    ventana_fin: '16:00',
    prioridad: 'URGENTE',
    estado: 'PENDIENTE'
  }
];

export function PedidosView() {
  const [pedidos, setPedidos] = useState<Pedido[]>(MOCK_PEDIDOS);
  const [codigo, setCodigo] = useState('');
  const [cliente, setCliente] = useState('');
  const [direccion, setDireccion] = useState('');
  const [latitud, setLatitud] = useState(-12.0250);
  const [longitud, setLongitud] = useState(-77.0050);
  const [peso, setPeso] = useState(50);
  const [volumen, setVolumen] = useState(0.8);
  const [vInicio, setVInicio] = useState('09:00');
  const [vFin, setVFin] = useState('12:00');
  const [prioridad, setPrioridad] = useState('ESTANDAR');
  const [error, setError] = useState<string | null>(null);
  const [exito, setExito] = useState<string | null>(null);

  useEffect(() => {
    if (exito) {
      const timer = setTimeout(() => setExito(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [exito]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 6000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  const handleCrear = (e: React.FormEvent) => {
    e.preventDefault();
    if (vFin <= vInicio) {
      setError('La hora de fin de la ventana debe ser posterior a la hora de inicio (Regla RN-007).');
      setExito(null);
      return;
    }

    const nuevo: Pedido = {
      pedido_id: Date.now().toString(),
      codigo_seguimiento: codigo || `PED-LIMA-${Date.now().toString().slice(-4)}`,
      cliente_nombre: cliente,
      direccion_destino: direccion,
      latitud,
      longitud,
      peso_kg: peso,
      volumen_m3: volumen,
      ventana_inicio: vInicio,
      ventana_fin: vFin,
      prioridad,
      estado: 'PENDIENTE'
    };

    setPedidos([nuevo, ...pedidos]);
    setCodigo('');
    setCliente('');
    setDireccion('');
    setError(null);
    setExito(`Pedido ${nuevo.codigo_seguimiento} registrado correctamente.`);
  };

  return (
    <div>
      {/* Encabezado Apple */}
      <div className="header-title">
        <div>
          <h1>Gestión de Pedidos y Coordenadas GPS</h1>
          <p>US-003 · Ingesta geoespacial en PostGIS, carga útil y ventanas horarias estrictas</p>
        </div>
      </div>

      {/* Sistema de Notificaciones Toast Apple a la Derecha Superior */}
      {(error || exito) && (
        <div className="apple-toast-container">
          {exito && (
            <div className="apple-toast apple-toast-success">
              <CheckCircle2 size={18} className="toast-icon" />
              <div className="apple-toast-content">
                <div className="apple-toast-title">Operación Exitosa</div>
                <div className="apple-toast-message">{exito}</div>
              </div>
              <button 
                className="apple-toast-close" 
                onClick={() => setExito(null)}
                title="Cerrar notificación"
              >
                <X size={14} />
              </button>
            </div>
          )}

          {error && (
            <div className="apple-toast apple-toast-error">
              <AlertCircle size={18} className="toast-icon" />
              <div className="apple-toast-content">
                <div className="apple-toast-title">Validación de Pedido (RN-007)</div>
                <div className="apple-toast-message">{error}</div>
              </div>
              <button 
                className="apple-toast-close" 
                onClick={() => setError(null)}
                title="Cerrar notificación"
              >
                <X size={14} />
              </button>
            </div>
          )}
        </div>
      )}

      {/* Métricas Resumen */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', marginBottom: '1.75rem' }}>
        <div className="card" style={{ padding: '1.25rem', margin: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: 'var(--apple-text-secondary)', marginBottom: '0.5rem', fontSize: '0.8rem', fontWeight: 600 }}>
            <PackageCheck size={16} /> Pedidos en Espera
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 700, letterSpacing: '-0.03em' }}>
            {pedidos.length}
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--apple-cyan-text)', fontWeight: 500 }}>
            Listos para optimización CVRPTW
          </span>
        </div>

        <div className="card" style={{ padding: '1.25rem', margin: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: 'var(--apple-text-secondary)', marginBottom: '0.5rem', fontSize: '0.8rem', fontWeight: 600 }}>
            <Weight size={16} /> Carga Total Consolidada
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 700, letterSpacing: '-0.03em' }}>
            {pedidos.reduce((acc, p) => acc + p.peso_kg, 0).toFixed(1)} kg
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--apple-text-secondary)' }}>
            {pedidos.reduce((acc, p) => acc + p.volumen_m3, 0).toFixed(2)} m³ requeridos
          </span>
        </div>

        <div className="card" style={{ padding: '1.25rem', margin: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: 'var(--apple-text-secondary)', marginBottom: '0.5rem', fontSize: '0.8rem', fontWeight: 600 }}>
            <Clock size={16} /> Ventana Horaria Matutina
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 700, letterSpacing: '-0.03em' }}>
            08:00 – 16:00
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--apple-text-secondary)' }}>
            Cobertura Lima Este
          </span>
        </div>
      </div>

      {/* Formulario de Pedido */}
      <div className="card">
        <h3 style={{ marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Plus size={18} color="var(--apple-accent)" /> Registrar Pedido con Ventana Horaria
        </h3>
        <form onSubmit={handleCrear} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', alignItems: 'end' }}>
          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '0.35rem', color: 'var(--apple-text-secondary)' }}>Cliente / Comercio:</label>
            <input
              type="text"
              required
              placeholder="Ej. Comercial Huancayo"
              value={cliente}
              onChange={e => setCliente(e.target.value)}
              style={{ width: '100%' }}
            />
          </div>
          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '0.35rem', color: 'var(--apple-text-secondary)' }}>Dirección de Entrega:</label>
            <input
              type="text"
              required
              placeholder="Av. Los Quechuas 450"
              value={direccion}
              onChange={e => setDireccion(e.target.value)}
              style={{ width: '100%' }}
            />
          </div>
          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '0.35rem', color: 'var(--apple-text-secondary)' }}>Latitud GPS (Lima):</label>
            <input
              type="number"
              step="0.0001"
              value={latitud}
              onChange={e => setLatitud(Number(e.target.value))}
              style={{ width: '100%' }}
            />
          </div>
          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '0.35rem', color: 'var(--apple-text-secondary)' }}>Longitud GPS (Lima):</label>
            <input
              type="number"
              step="0.0001"
              value={longitud}
              onChange={e => setLongitud(Number(e.target.value))}
              style={{ width: '100%' }}
            />
          </div>
          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '0.35rem', color: 'var(--apple-text-secondary)' }}>Ventana Apertura:</label>
            <input
              type="time"
              value={vInicio}
              onChange={e => setVInicio(e.target.value)}
              style={{ width: '100%' }}
            />
          </div>
          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '0.35rem', color: 'var(--apple-text-secondary)' }}>Ventana Cierre:</label>
            <input
              type="time"
              value={vFin}
              onChange={e => setVFin(e.target.value)}
              style={{ width: '100%' }}
            />
          </div>
          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '0.35rem', color: 'var(--apple-text-secondary)' }}>Prioridad:</label>
            <select
              value={prioridad}
              onChange={e => setPrioridad(e.target.value)}
              style={{ width: '100%' }}
            >
              <option value="ESTANDAR">Estándar</option>
              <option value="ALTA">Alta</option>
              <option value="URGENTE">Urgente</option>
            </select>
          </div>
          <button type="submit" className="btn" style={{ height: '38px', justifyContent: 'center' }}>
            Guardar Pedido
          </button>
        </form>
      </div>

      {/* Tabla de Pedidos con Chips de Geocercas */}
      <div className="card">
        <h3 style={{ marginBottom: '1.25rem' }}>Bandeja de Pedidos Georreferenciados ({pedidos.length})</h3>
        <table>
          <thead>
            <tr>
              <th>Tracking ID</th>
              <th>Cliente y Destino</th>
              <th>Punto Geoespacial (SRID 4326)</th>
              <th>Ventana de Atención</th>
              <th>Carga</th>
              <th>Prioridad</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            {pedidos.map(p => (
              <tr key={p.pedido_id}>
                <td><code>{p.codigo_seguimiento}</code></td>
                <td>
                  <div style={{ fontWeight: 600 }}>{p.cliente_nombre}</div>
                  <small style={{ color: 'var(--apple-text-secondary)' }}>{p.direccion_destino}</small>
                </td>
                <td>
                  <span className="badge badge-blue">
                    <MapPin size={12} />
                    <span style={{ fontVariantNumeric: 'tabular-nums' }}>
                      {p.latitud.toFixed(4)}, {p.longitud.toFixed(4)}
                    </span>
                  </span>
                </td>
                <td style={{ fontVariantNumeric: 'tabular-nums' }}>{p.ventana_inicio} – {p.ventana_fin}</td>
                <td style={{ fontVariantNumeric: 'tabular-nums' }}>{p.peso_kg} kg · {p.volumen_m3} m³</td>
                <td>
                  <span className={`badge ${p.prioridad === 'URGENTE' ? 'badge-red' : p.prioridad === 'ALTA' ? 'badge-yellow' : 'badge-blue'}`}>
                    {p.prioridad}
                  </span>
                </td>
                <td>
                  <span className="badge badge-yellow">
                    {p.estado}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
