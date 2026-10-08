import React, { useState, useEffect } from 'react';
import { Truck, Plus, AlertCircle, Zap, Shield, Leaf, Gauge, Fuel, CheckCircle2, Pencil, X, Save, RefreshCw } from 'lucide-react';
import { Vehiculo, VehiculoService } from '../services/api';

interface DiagnosticoRestriccion {
  codigo: 'LIBRE_CIRCULACION' | 'PICO_Y_PLACA_AMBIENTAL' | 'RESTRINGIDO_CENTRO_HISTORICO';
  etiqueta: string;
  badgeClass: string;
  motivo: string;
}

export const calcularFactorEmisionCO2 = (combustible: string, consumoKmGal: number): number => {
  const tipo = (combustible || '').toUpperCase();
  if (tipo === 'ELECTRICO') return 0.0;
  
  const rendimiento = Number(consumoKmGal);
  if (!rendimiento || rendimiento <= 0) {
    return tipo === 'GNV' ? 0.165 : tipo === 'HIBRIDO' ? 0.120 : 0.245;
  }
  
  // Emisión teórica estándar por galón (kg CO₂ / galón):
  // GNV: 5.775 kg CO₂/gal equivalente (a 35 km/gal -> 0.165 kg/km)
  // HIBRIDO: 4.200 kg CO₂/galón (a 35 km/gal -> 0.120 kg/km)
  // DIESEL: 10.210 kg CO₂/galón (a 41.6 km/gal -> 0.245 kg/km)
  const kgCo2PorGalon = tipo === 'GNV' ? 5.775 : tipo === 'HIBRIDO' ? 4.200 : 10.210;
  const factor = kgCo2PorGalon / rendimiento;
  return Number(factor.toFixed(4));
};

export const evaluarRestriccionZonalAutomatica = (
  combustible: string,
  anio: number,
  pesoKg: number,
  factorCo2: number,
  placaStr?: string,
  consumoKmGal?: number
): DiagnosticoRestriccion => {
  const tipo = (combustible || '').toUpperCase();
  const esPesado = Number(pesoKg) > 3500;
  const antiguedad = 2026 - (Number(anio) || 2024);

  // 1. Cero emisiones directas: 100% Eléctrico
  if (tipo === 'ELECTRICO') {
    return {
      codigo: 'LIBRE_CIRCULACION',
      etiqueta: 'Libre Circulación',
      badgeClass: 'badge-cyan',
      motivo: 'Cero emisiones directas (0 g CO₂/km). Tránsito ecológico irrestricto en toda Lima Metropolitana.'
    };
  }

  // 2. Control de Altas Emisiones por Consumo Excesivo o Ineficiencia (ej. 1 km/gal -> 5.775 kg CO₂/km)
  // Umbral ZBE Centro Histórico / Damero de Pizarro: >= 0.35 kg CO2/km (350 g/km)
  if (factorCo2 >= 0.35) {
    const detalleRend = consumoKmGal !== undefined ? ` por consumo crítico de ${consumoKmGal} km/gal` : '';
    return {
      codigo: 'RESTRINGIDO_CENTRO_HISTORICO',
      etiqueta: 'Centro Histórico Restringido',
      badgeClass: 'badge-red',
      motivo: `Emisión crítica de ${(factorCo2 * 1000).toFixed(0)} g CO₂/km (≥ 350 g/km)${detalleRend}. Excede límites de Zona de Bajas Emisiones (ZBE Damero de Pizarro).`
    };
  }

  // 3. Restricción por Tonelaje Pesado en trama urbana central (> 3.5 t)
  if (esPesado) {
    return {
      codigo: 'RESTRINGIDO_CENTRO_HISTORICO',
      etiqueta: 'Restringido por Tonelaje (> 3.5 t)',
      badgeClass: 'badge-red',
      motivo: `Carga útil (${pesoKg} kg) excede 3.5 t. Restringido en vías urbanas angostas y Centro Histórico (Ord. 2160).`
    };
  }

  // 4. Control de Emisiones Intermedias / Pico y Placa Ambiental (>= 0.24 kg CO₂/km)
  if (factorCo2 >= 0.24) {
    const digitoPlaca = placaStr ? placaStr.replace(/\D/g, '').slice(-1) : '';
    const parImpar = digitoPlaca ? (Number(digitoPlaca) % 2 === 0 ? 'Placa Par' : 'Placa Impar') : '';
    return {
      codigo: 'PICO_Y_PLACA_AMBIENTAL',
      etiqueta: 'Pico y Placa Ambiental',
      badgeClass: 'badge-yellow',
      motivo: `Emisiones de ${(factorCo2 * 1000).toFixed(0)} g CO₂/km. Sujeto a Pico y Placa ambiental en horas punta${parImpar ? ` (${parImpar})` : ''}.`
    };
  }

  // 5. Flota Diésel: Evaluación de antigüedad (> 10 años)
  if (tipo === 'DIESEL') {
    if (antiguedad > 10) {
      return {
        codigo: 'RESTRINGIDO_CENTRO_HISTORICO',
        etiqueta: 'Centro Histórico Restringido',
        badgeClass: 'badge-red',
        motivo: `Diésel con ${antiguedad} años de antigüedad (> 10 años). Acceso restringido a ZBE Damero de Pizarro.`
      };
    }
    const digitoPlaca = placaStr ? placaStr.replace(/\D/g, '').slice(-1) : '';
    const parImpar = digitoPlaca ? (Number(digitoPlaca) % 2 === 0 ? 'Placa Par' : 'Placa Impar') : '';
    return {
      codigo: 'PICO_Y_PLACA_AMBIENTAL',
      etiqueta: 'Pico y Placa Ambiental',
      badgeClass: 'badge-yellow',
      motivo: `Diésel Euro VI (${anio}). Sujeto a Pico y Placa ambiental en horas punta${parImpar ? ` (${parImpar})` : ''}.`
    };
  }

  // 6. Combustibles limpios de transición verde (GNV / Híbridos) con consumo eficiente
  return {
    codigo: 'LIBRE_CIRCULACION',
    etiqueta: 'Libre Circulación',
    badgeClass: 'badge-cyan',
    motivo: `Combustible limpio eficiente (${tipo} · ${(factorCo2 * 1000).toFixed(0)} g CO₂/km). Tránsito autorizado Ord. MML 2160.`
  };
};

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

  const factorCreacion = calcularFactorEmisionCO2(combustible, consumo);
  const diagnosticoCreacion = evaluarRestriccionZonalAutomatica(combustible, anio, peso, factorCreacion, placa, consumo);

  const factorEdicion = calcularFactorEmisionCO2(editCombustible, editConsumo);
  const diagnosticoEdicion = evaluarRestriccionZonalAutomatica(editCombustible, editAnio, editPeso, factorEdicion, editingVehiculo?.placa, editConsumo);

  const handleCrear = async (e: React.FormEvent) => {
    e.preventDefault();
    setAlerta(null);
    setExito(null);
    setCargando(true);

    const nuevoPayload = {
      placa: placa.trim().toUpperCase(),
      marca_modelo: marca,
      anio_fabricacion: anio,
      capacidad_peso_kg: peso,
      capacidad_volumen_m3: volumen,
      consumo_km_gal: consumo,
      tipo_combustible: combustible,
      factor_emision_co2: factorCreacion,
      restriccion_circulacion: diagnosticoCreacion.codigo,
      estado: 'DISPONIBLE'
    };

    try {
      const guardado = await VehiculoService.create(nuevoPayload);
      setVehiculos(prev => [guardado, ...prev]);
      setExito(`Vehículo ${guardado.placa} registrado con éxito. Restricción zonal calculada automáticamente: ${guardado.restriccion_circulacion}.`);
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

    const payload = {
      marca_modelo: editMarca,
      anio_fabricacion: editAnio,
      tipo_combustible: editCombustible,
      capacidad_peso_kg: editPeso,
      capacidad_volumen_m3: editVolumen,
      consumo_km_gal: editConsumo,
      factor_emision_co2: factorEdicion,
      restriccion_circulacion: diagnosticoEdicion.codigo,
      estado: editEstado
    };

    try {
      const actualizado = await VehiculoService.update(editingVehiculo.vehiculo_id, payload);
      
      // Actualizar en el estado local de inmediato
      setVehiculos(prev => prev.map(v => v.vehiculo_id === actualizado.vehiculo_id ? actualizado : v));
      setExito(`Vehículo ${actualizado.placa} actualizado exitosamente. Restricción: ${actualizado.restriccion_circulacion}.`);
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
          <div style={{
            background: '#F5F4EE',
            border: '1.5px solid #CAD3BD',
            borderRadius: '10px',
            padding: '0.45rem 0.75rem',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            minHeight: '38px',
            gridColumn: 'span 2'
          }}>
            <div style={{ fontSize: '0.68rem', fontWeight: 700, color: '#556B2F', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '2px' }}>
              <Shield size={12} />
              <span>Restricción Zonal Automática (SUB-001-06 · RN-004):</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span className={`badge ${diagnosticoCreacion.badgeClass}`} style={{ fontSize: '0.72rem', padding: '2px 8px', fontWeight: 700 }}>
                {diagnosticoCreacion.etiqueta}
              </span>
              <span style={{ fontSize: '0.68rem', color: '#2D3A2E', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={diagnosticoCreacion.motivo}>
                {diagnosticoCreacion.motivo}
              </span>
            </div>
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
                  <div style={{ fontWeight: 600 }}>{v.consumo_km_gal ? `${v.consumo_km_gal} km/gal` : '35.0 km/gal'}</div>
                  {(() => {
                    const factorReal = calcularFactorEmisionCO2(v.tipo_combustible, Number(v.consumo_km_gal) || 35.0);
                    const esCritico = factorReal >= 0.35;
                    return (
                      <div style={{
                        fontSize: '0.72rem',
                        fontWeight: esCritico ? 700 : 500,
                        color: esCritico ? '#DC2626' : 'var(--apple-text-tertiary)',
                        marginTop: '2px'
                      }}>
                        {(factorReal * 1000).toFixed(0)} g CO₂/km
                      </div>
                    );
                  })()}
                </td>
                <td>
                  {(() => {
                    const factorReal = calcularFactorEmisionCO2(v.tipo_combustible, Number(v.consumo_km_gal) || 35.0);
                    const diag = evaluarRestriccionZonalAutomatica(
                      v.tipo_combustible,
                      v.anio_fabricacion || 2024,
                      Number(v.capacidad_peso_kg),
                      factorReal,
                      v.placa,
                      v.consumo_km_gal
                    );
                    return (
                      <span className={`badge ${diag.badgeClass}`} title={diag.motivo}>
                        <Shield size={11} />
                        {diag.etiqueta}
                      </span>
                    );
                  })()}
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

              <div style={{
                background: '#F5F4EE',
                border: '1.5px solid #CAD3BD',
                borderRadius: '10px',
                padding: '0.75rem 0.9rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.35rem'
              }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#556B2F', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Shield size={14} />
                  <span>Restricción Zonal Evaluada Automáticamente (SUB-001-06 · RN-004):</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  <span className={`badge ${diagnosticoEdicion.badgeClass}`} style={{ fontSize: '0.8rem', padding: '3px 10px', fontWeight: 700 }}>
                    {diagnosticoEdicion.etiqueta}
                  </span>
                  <span style={{ fontSize: '0.74rem', color: '#2D3A2E' }}>
                    {diagnosticoEdicion.motivo}
                  </span>
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
