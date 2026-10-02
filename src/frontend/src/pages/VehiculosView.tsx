import React, { useState, useEffect } from 'react';
import { Truck, Plus, AlertCircle, Zap, Shield, Leaf, Gauge, Fuel, CheckCircle2, Pencil, X, Save, RefreshCw } from 'lucide-react';
import { Vehiculo, VehiculoService } from '../services/api';

export function VehiculosView() {
  const [vehiculos, setVehiculos] = useState<Vehiculo[]>([]);
  const [filtro, setFiltro] = useState<'TODOS' | 'ELECTRICO' | 'GNV' | 'DIESEL'>('TODOS');
  
  // Estado para Nuevo Registro
  const [placa, setPlaca] = useState('');
  const [marca, setMarca] = useState('');
  const [anio, setAnio] = useState(2024);
  const [peso, setPeso] = useState(1500);
  const [volumen, setVolumen] = useState(12);
  const [consumo, setConsumo] = useState(35);
  const [combustible, setCombustible] = useState<'ELECTRICO' | 'GNV' | 'DIESEL' | 'HIBRIDO'>('GNV');

  // Estado para Edición Modal
  const [editingVehiculo, setEditingVehiculo] = useState<Vehiculo | null>(null);
  const [editMarca, setEditMarca] = useState('');
  const [editAnio, setEditAnio] = useState(2024);
  const [editCombustible, setEditCombustible] = useState<'ELECTRICO' | 'GNV' | 'DIESEL' | 'HIBRIDO'>('GNV');
  const [editPeso, setEditPeso] = useState(1500);
  const [editVolumen, setEditVolumen] = useState(12);
  const [editConsumo, setEditConsumo] = useState(35);
  const [editEstado, setEditEstado] = useState('DISPONIBLE');

  // Banners y Estado
  const [alerta, setAlerta] = useState<string | null>(null);
  const [exito, setExito] = useState<string | null>(null);
  const [cargando, setCargando] = useState(false);
  const [guardandoEdicion, setGuardandoEdicion] = useState(false);

  useEffect(() => {
    cargarVehiculos();
  }, []);

  // Auto-cierre de toasts tras 5 segundos
  useEffect(() => {
    if (exito) {
      const timer = setTimeout(() => setExito(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [exito]);

  useEffect(() => {
    if (alerta) {
      const timer = setTimeout(() => setAlerta(null), 6000);
      return () => clearTimeout(timer);
    }
  }, [alerta]);

  const cargarVehiculos = async () => {
    setCargando(true);
    try {
      const data = await VehiculoService.getAll();
      setVehiculos(data || []);
      setAlerta(null);
    } catch (err: any) {
      setAlerta('No se pudo conectar con el servidor PostgreSQL. Asegúrate de que FastAPI y Docker estén activos.');
    } finally {
      setCargando(false);
    }
  };

  const handleCrear = async (e: React.FormEvent) => {
    e.preventDefault();
    setAlerta(null);
    setExito(null);
    setCargando(true);

    const factor = combustible === 'ELECTRICO' ? 0.0 : combustible === 'GNV' ? 0.165 : combustible === 'HIBRIDO' ? 0.120 : 0.245;
    const nuevoPayload = {
      placa: placa.trim().toUpperCase(),
      marca_modelo: marca,
      anio_fabricacion: anio,
      capacidad_peso_kg: peso,
      capacidad_volumen_m3: volumen,
      consumo_km_gal: consumo,
      tipo_combustible: combustible,
      factor_emision_co2: factor,
      estado: 'DISPONIBLE'
    };

    try {
      const guardado = await VehiculoService.create(nuevoPayload);
      setVehiculos(prev => [guardado, ...prev]);
      setExito(`Vehículo ${guardado.placa} registrado con éxito en la base de datos PostgreSQL. Restricción asignada: ${guardado.restriccion_circulacion || 'LIBRE_CIRCULACION'}.`);
      setPlaca('');
      setMarca('');
    } catch (err: any) {
      const mensaje = err.response?.data?.detail || 'Error al registrar el vehículo en el servidor.';
      setAlerta(mensaje);
    } finally {
      setCargando(false);
    }
  };

  const handleAbrirEditar = (v: Vehiculo) => {
    setEditingVehiculo(v);
    setEditMarca(v.marca_modelo);
    setEditAnio(v.anio_fabricacion || 2024);
    setEditCombustible(v.tipo_combustible as any);
    setEditPeso(Number(v.capacidad_peso_kg));
    setEditVolumen(Number(v.capacidad_volumen_m3));
    setEditConsumo(Number(v.consumo_km_gal || 35.0));
    setEditEstado(v.estado);
  };

  const handleGuardarEdicion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingVehiculo) return;

    setGuardandoEdicion(true);
    setAlerta(null);
    setExito(null);

    const factor = editCombustible === 'ELECTRICO' ? 0.0 : editCombustible === 'GNV' ? 0.165 : editCombustible === 'HIBRIDO' ? 0.120 : 0.245;

    const payload = {
      marca_modelo: editMarca,
      anio_fabricacion: editAnio,
      tipo_combustible: editCombustible,
      capacidad_peso_kg: editPeso,
      capacidad_volumen_m3: editVolumen,
      consumo_km_gal: editConsumo,
      factor_emision_co2: factor,
      estado: editEstado
    };

    try {
      const actualizado = await VehiculoService.update(editingVehiculo.vehiculo_id, payload);
      
      // Actualizar en el estado local de inmediato
      setVehiculos(prev => prev.map(v => v.vehiculo_id === actualizado.vehiculo_id ? actualizado : v));
      setExito(`Vehículo ${actualizado.placa} actualizado exitosamente en PostgreSQL. Restricción recalculada: ${actualizado.restriccion_circulacion}.`);
      setEditingVehiculo(null);
    } catch (err: any) {
      const mensaje = err.response?.data?.detail || 'Error al actualizar el vehículo en la base de datos.';
      setAlerta(mensaje);
    } finally {
      setGuardandoEdicion(false);
    }
  };

  const vehiculosFiltrados = filtro === 'TODOS' 
    ? vehiculos 
    : vehiculos.filter(v => v.tipo_combustible === filtro);

  return (
    <div>
      {/* Encabezado con Tipografía Apple */}
      <div className="header-title">
        <div>
          <h1>Gestión de Flota Vehicular</h1>
          <p>US-001 · Tipificación de unidades, capacidad, consumo y restricciones de circulación</p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {/* Apple Segmented Control */}
          <div className="segmented-control">
            {(['TODOS', 'ELECTRICO', 'GNV', 'DIESEL'] as const).map(tipo => (
              <button
                key={tipo}
                className={filtro === tipo ? 'selected' : ''}
                onClick={() => setFiltro(tipo)}
              >
                {tipo === 'ELECTRICO' && <Zap size={13} />}
                {tipo === 'GNV' && <Fuel size={13} />}
                {tipo === 'DIESEL' && <Fuel size={13} />}
                {tipo === 'TODOS' ? 'Todos' : tipo === 'ELECTRICO' ? 'Eléctricos' : tipo}
              </button>
            ))}
          </div>

          <button
            onClick={cargarVehiculos}
            className="btn-secondary"
            title="Refrescar datos desde PostgreSQL"
            style={{ padding: '0.45rem 0.75rem', borderRadius: '10px', display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.78rem' }}
          >
            <RefreshCw size={13} className={cargando ? 'spin' : ''} />
            Sincronizar BDD
          </button>
        </div>
      </div>

      {/* Sistema de Notificaciones Toast Apple a la Derecha Superior */}
      {(alerta || exito) && (
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

          {alerta && (
            <div className="apple-toast apple-toast-error">
              <AlertCircle size={18} className="toast-icon" />
              <div className="apple-toast-content">
                <div className="apple-toast-title">Aviso del Sistema</div>
                <div className="apple-toast-message">{alerta}</div>
              </div>
              <button 
                className="apple-toast-close" 
                onClick={() => setAlerta(null)}
                title="Cerrar notificación"
              >
                <X size={14} />
              </button>
            </div>
          )}
        </div>
      )}

      {/* Tarjetas de Métricas Resumen (Apple Minimalist Glass) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', marginBottom: '1.75rem' }}>
        <div className="card" style={{ padding: '1.25rem', margin: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: 'var(--apple-text-secondary)', marginBottom: '0.5rem', fontSize: '0.8rem', fontWeight: 600 }}>
            <Truck size={16} /> Total Unidades en BDD
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 700, letterSpacing: '-0.03em' }}>
            {vehiculos.length}
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--apple-cyan-text)', fontWeight: 500 }}>
            {vehiculos.filter(v => v.tipo_combustible === 'ELECTRICO').length} Cero Emisiones
          </span>
        </div>

        <div className="card" style={{ padding: '1.25rem', margin: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: 'var(--apple-text-secondary)', marginBottom: '0.5rem', fontSize: '0.8rem', fontWeight: 600 }}>
            <Leaf size={16} /> Emisión Promedio
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 700, letterSpacing: '-0.03em' }}>
            {vehiculos.length > 0 ? (vehiculos.reduce((acc, v) => acc + Number(v.factor_emision_co2), 0) / vehiculos.length).toFixed(3) : '0.000'}
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--apple-text-secondary)' }}>
            kg CO₂ por kilómetro
          </span>
        </div>

        <div className="card" style={{ padding: '1.25rem', margin: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: 'var(--apple-text-secondary)', marginBottom: '0.5rem', fontSize: '0.8rem', fontWeight: 600 }}>
            <Gauge size={16} /> Capacidad Total
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 700, letterSpacing: '-0.03em' }}>
            {(vehiculos.reduce((acc, v) => acc + Number(v.capacidad_peso_kg), 0) / 1000).toFixed(1)} t
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--apple-text-secondary)' }}>
            {vehiculos.reduce((acc, v) => acc + Number(v.capacidad_volumen_m3), 0).toFixed(1)} m³ de volumen
          </span>
        </div>
      </div>

      {/* Formulario de Alta con Respuesta Táctil (SUB-001-01 / SUB-001-05) */}
      <div className="card">
        <h3 style={{ marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Plus size={18} color="var(--apple-accent)" /> Registrar Nueva Unidad de Flota (US-001)
        </h3>
        <form onSubmit={handleCrear} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', alignItems: 'end' }}>
          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '0.35rem', color: 'var(--apple-text-secondary)' }}>Placa:</label>
            <input
              type="text"
              required
              placeholder="Ej. ABC-123"
              value={placa}
              onChange={e => setPlaca(e.target.value)}
              style={{ width: '100%' }}
            />
          </div>
          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '0.35rem', color: 'var(--apple-text-secondary)' }}>Marca y Modelo:</label>
            <input
              type="text"
              required
              placeholder="Ej. Hyundai H-100"
              value={marca}
              onChange={e => setMarca(e.target.value)}
              style={{ width: '100%' }}
            />
          </div>
          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '0.35rem', color: 'var(--apple-text-secondary)' }}>Año Fabricación:</label>
            <input
              type="number"
              min={1990}
              max={2030}
              value={anio}
              onChange={e => setAnio(Number(e.target.value))}
              style={{ width: '100%' }}
            />
          </div>
          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '0.35rem', color: 'var(--apple-text-secondary)' }}>Propulsión / Combustible:</label>
            <select
              value={combustible}
              onChange={e => setCombustible(e.target.value as any)}
              style={{ width: '100%' }}
            >
              <option value="ELECTRICO">100% Eléctrico (0 g CO₂)</option>
              <option value="GNV">GNV Limpio (165 g CO₂)</option>
              <option value="HIBRIDO">Híbrido Eco (120 g CO₂)</option>
              <option value="DIESEL">Diésel Euro VI (245 g CO₂)</option>
            </select>
          </div>
          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '0.35rem', color: 'var(--apple-text-secondary)' }}>Carga Útil (kg):</label>
            <input
              type="number"
              min={100}
              value={peso}
              onChange={e => setPeso(Number(e.target.value))}
              style={{ width: '100%' }}
            />
          </div>
          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '0.35rem', color: 'var(--apple-text-secondary)' }}>Volumen (m³):</label>
            <input
              type="number"
              min={1}
              value={volumen}
              onChange={e => setVolumen(Number(e.target.value))}
              style={{ width: '100%' }}
            />
          </div>
          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '0.35rem', color: 'var(--apple-text-secondary)' }}>Consumo (km/gal):</label>
            <input
              type="number"
              min={0}
              step="0.5"
              value={consumo}
              onChange={e => setConsumo(Number(e.target.value))}
              style={{ width: '100%' }}
            />
          </div>
          <button type="submit" className="btn" disabled={cargando} style={{ height: '38px', justifyContent: 'center' }}>
            {cargando ? 'Guardando...' : 'Guardar Unidad'}
          </button>
        </form>
      </div>

      {/* Catálogo de Unidades (SUB-001-03 / SUB-001-06) */}
      <div className="card">
        <h3 style={{ marginBottom: '1.25rem' }}>Flota Registrada en Base de Datos ({vehiculosFiltrados.length})</h3>
        <table>
          <thead>
            <tr>
              <th>Placa</th>
              <th>Vehículo y Año</th>
              <th>Propulsión</th>
              <th>Capacidad Útil</th>
              <th>Rendimiento</th>
              <th>Restricción Zonal (SUB-001-06)</th>
              <th>Estado</th>
              <th style={{ textAlign: 'center' }}>Acciones (SUB-001-03)</th>
            </tr>
          </thead>
          <tbody>
            {vehiculosFiltrados.map(v => (
              <tr key={v.vehiculo_id}>
                <td><strong>{v.placa}</strong></td>
                <td>
                  <div style={{ fontWeight: 600 }}>{v.marca_modelo}</div>
                  <small style={{ color: 'var(--apple-text-tertiary)' }}>Año: {v.anio_fabricacion || 2024}</small>
                </td>
                <td>
                  <span className={`badge ${v.tipo_combustible === 'ELECTRICO' ? 'badge-blue' : v.tipo_combustible === 'GNV' ? 'badge-cyan' : v.tipo_combustible === 'HIBRIDO' ? 'badge-cyan' : 'badge-yellow'}`}>
                    {v.tipo_combustible === 'ELECTRICO' ? <Zap size={11} /> : <Fuel size={11} />}
                    {v.tipo_combustible}
                  </span>
                </td>
                <td style={{ fontVariantNumeric: 'tabular-nums' }}>
                  {v.capacidad_peso_kg} kg · {v.capacidad_volumen_m3} m³
                </td>
                <td style={{ fontVariantNumeric: 'tabular-nums' }}>
                  {v.consumo_km_gal ? `${v.consumo_km_gal} km/gal` : '35.0 km/gal'}
                </td>
                <td>
                  <span className={`badge ${
                    v.restriccion_circulacion === 'LIBRE_CIRCULACION' 
                      ? 'badge-cyan' 
                      : v.restriccion_circulacion === 'RESTRINGIDO_CENTRO_HISTORICO'
                      ? 'badge-red'
                      : 'badge-yellow'
                  }`}>
                    <Shield size={11} />
                    {v.restriccion_circulacion === 'LIBRE_CIRCULACION'
                      ? 'Libre Circulación'
                      : v.restriccion_circulacion === 'RESTRINGIDO_CENTRO_HISTORICO'
                      ? 'Centro Histórico Restringido'
                      : 'Pico y Placa Ambiental'}
                  </span>
                </td>
                <td>
                  <span className={`badge ${v.estado === 'DISPONIBLE' ? 'badge-cyan' : v.estado === 'EN_RUTA' ? 'badge-yellow' : 'badge-red'}`}>
                    {v.estado}
                  </span>
                </td>
                <td style={{ textAlign: 'center' }}>
                  <button
                    onClick={() => handleAbrirEditar(v)}
                    className="btn btn-secondary"
                    style={{ padding: '0.35rem 0.75rem', fontSize: '0.78rem', borderRadius: '8px', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
                    title="Editar vehículo"
                  >
                    <Pencil size={12} color="var(--apple-accent)" />
                    Editar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal Apple Glass para Edición de Vehículo (SUB-001-03) */}
      {editingVehiculo && (
        <div className="apple-modal-overlay" onClick={() => setEditingVehiculo(null)}>
          <div className="apple-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h3>Editar Vehículo: {editingVehiculo.placa}</h3>
                <p style={{ color: 'var(--apple-text-secondary)', fontSize: '0.8rem', marginTop: '0.2rem' }}>
                  Modificación de especificaciones técnicas y operativas en PostgreSQL
                </p>
              </div>
              <button className="modal-close-btn" onClick={() => setEditingVehiculo(null)}>
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleGuardarEdicion} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '0.35rem', color: 'var(--apple-text-secondary)' }}>
                  Marca y Modelo:
                </label>
                <input
                  type="text"
                  required
                  value={editMarca}
                  onChange={e => setEditMarca(e.target.value)}
                  style={{ width: '100%' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '0.35rem', color: 'var(--apple-text-secondary)' }}>
                    Año de Fabricación:
                  </label>
                  <input
                    type="number"
                    min={1990}
                    max={2030}
                    value={editAnio}
                    onChange={e => setEditAnio(Number(e.target.value))}
                    style={{ width: '100%' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '0.35rem', color: 'var(--apple-text-secondary)' }}>
                    Propulsión / Combustible:
                  </label>
                  <select
                    value={editCombustible}
                    onChange={e => setEditCombustible(e.target.value as any)}
                    style={{ width: '100%' }}
                  >
                    <option value="ELECTRICO">100% Eléctrico (0 g CO₂)</option>
                    <option value="GNV">GNV Limpio (165 g CO₂)</option>
                    <option value="HIBRIDO">Híbrido Eco (120 g CO₂)</option>
                    <option value="DIESEL">Diésel Euro VI (245 g CO₂)</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.85rem' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '0.35rem', color: 'var(--apple-text-secondary)' }}>
                    Carga Útil (kg):
                  </label>
                  <input
                    type="number"
                    min={100}
                    value={editPeso}
                    onChange={e => setEditPeso(Number(e.target.value))}
                    style={{ width: '100%' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '0.35rem', color: 'var(--apple-text-secondary)' }}>
                    Volumen (m³):
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={editVolumen}
                    onChange={e => setEditVolumen(Number(e.target.value))}
                    style={{ width: '100%' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '0.35rem', color: 'var(--apple-text-secondary)' }}>
                    Consumo (km/gal):
                  </label>
                  <input
                    type="number"
                    min={0}
                    step="0.5"
                    value={editConsumo}
                    onChange={e => setEditConsumo(Number(e.target.value))}
                    style={{ width: '100%' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '0.35rem', color: 'var(--apple-text-secondary)' }}>
                  Estado Operativo:
                </label>
                <select
                  value={editEstado}
                  onChange={e => setEditEstado(e.target.value)}
                  style={{ width: '100%' }}
                >
                  <option value="DISPONIBLE">DISPONIBLE (Listo para ruta)</option>
                  <option value="EN_RUTA">EN_RUTA (Operando actualmente)</option>
                  <option value="MANTENIMIENTO">MANTENIMIENTO (Taller mecánico)</option>
                  <option value="INACTIVO">INACTIVO (Baja de flota)</option>
                </select>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setEditingVehiculo(null)}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn"
                  disabled={guardandoEdicion}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem' }}
                >
                  <Save size={14} />
                  {guardandoEdicion ? 'Guardando en BDD...' : 'Guardar Cambios'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
