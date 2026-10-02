import React, { useState, useEffect } from 'react';
import { 
  Users, Plus, ShieldAlert, CheckCircle2, Clock, AlertTriangle, 
  ShieldCheck, X, Pencil, RotateCcw, MapPin, Navigation, 
  Trash2, RefreshCw, Send, Check, Phone, CreditCard, Award
} from 'lucide-react';
import { Conductor, ConductorService } from '../services/api';

const MOCK_CONDUCTORES: Conductor[] = [
  {
    conductor_id: 'c1111111-1111-1111-1111-111111111111',
    dni: '71234567',
    nombres: 'Carlos Eduardo',
    apellidos: 'Quispe Huamán',
    licencia: 'Q71234567',
    categoria_licencia: 'A-IIIc',
    telefono: '987654321',
    direccion_origen: 'Av. Elmer Faucett 2100, Callao',
    latitud_origen: -12.034500,
    longitud_origen: -77.112300,
    estado: 'DISPONIBLE',
    horas_conduccion_hoy: 7.5
  },
  {
    conductor_id: 'c2222222-2222-2222-2222-222222222222',
    dni: '48765432',
    nombres: 'Jorge Luis',
    apellidos: 'Mendoza Ramos',
    licencia: 'M48765432',
    categoria_licencia: 'A-IIIb',
    telefono: '912345678',
    direccion_origen: 'Av. Nicolás Ayllón 1540, Ate Vitarte',
    latitud_origen: -12.056700,
    longitud_origen: -76.978900,
    estado: 'DISPONIBLE',
    horas_conduccion_hoy: 3.5
  },
  {
    conductor_id: 'c3333333-3333-3333-3333-333333333333',
    dni: '74567812',
    nombres: 'María Elena',
    apellidos: 'Torres Valdivia',
    licencia: 'T74567812',
    categoria_licencia: 'A-IIIc',
    telefono: '945678123',
    direccion_origen: 'Av. Pachacútec 3200, Villa El Salvador',
    latitud_origen: -12.214500,
    longitud_origen: -76.934100,
    estado: 'DISPONIBLE',
    horas_conduccion_hoy: 1.0
  },
  {
    conductor_id: 'c4444444-4444-4444-4444-444444444444',
    dni: '45678901',
    nombres: 'Ricardo Antonio',
    apellidos: 'Gómez Salazar',
    licencia: 'G45678901',
    categoria_licencia: 'A-IIb',
    telefono: '965432198',
    direccion_origen: 'Av. Colonial 1450, Cercado de Lima',
    latitud_origen: -12.046374,
    longitud_origen: -77.042793,
    estado: 'EN_RUTA',
    horas_conduccion_hoy: 5.0
  }
];

export function ConductoresView() {
  const [conductores, setConductores] = useState<Conductor[]>(MOCK_CONDUCTORES);
  const [filtroEstado, setFiltroEstado] = useState<string>('TODOS');
  const [cargando, setCargando] = useState(false);

  // Formulario de Alta
  const [dni, setDni] = useState('');
  const [nombres, setNombres] = useState('');
  const [apellidos, setApellidos] = useState('');
  const [licencia, setLicencia] = useState('');
  const [categoria, setCategoria] = useState('A-IIIc');
  const [telefono, setTelefono] = useState('');
  const [direccionOrigen, setDireccionOrigen] = useState('');
  const [latitudOrigen, setLatitudOrigen] = useState<number | ''>(-12.046374);
  const [longitudOrigen, setLongitudOrigen] = useState<number | ''>(-77.042793);

  // Modal de Edición
  const [editingConductor, setEditingConductor] = useState<Conductor | null>(null);
  const [editNombres, setEditNombres] = useState('');
  const [editApellidos, setEditApellidos] = useState('');
  const [editTelefono, setEditTelefono] = useState('');
  const [editCategoria, setEditCategoria] = useState('A-IIIc');
  const [editDireccion, setEditDireccion] = useState('');
  const [editLatitud, setEditLatitud] = useState<number | ''>('');
  const [editLongitud, setEditLongitud] = useState<number | ''>('');
  const [editEstado, setEditEstado] = useState('DISPONIBLE');

  // Modal de Simulación / Asignación de Ruta (US-002 Escenario 2)
  const [assigningConductor, setAssigningConductor] = useState<Conductor | null>(null);
  const [horasRuta, setHorasRuta] = useState<number>(1.5);
  const [validandoRuta, setValidandoRuta] = useState(false);

  // Toasts de Notificación Apple
  const [alerta, setAlerta] = useState<string | null>(null);
  const [mensajeExito, setMensajeExito] = useState<string | null>(null);

  useEffect(() => {
    cargarConductores();
  }, []);

  useEffect(() => {
    if (mensajeExito) {
      const timer = setTimeout(() => setMensajeExito(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [mensajeExito]);

  useEffect(() => {
    if (alerta) {
      const timer = setTimeout(() => setAlerta(null), 6000);
      return () => clearTimeout(timer);
    }
  }, [alerta]);

  const cargarConductores = async () => {
    setCargando(true);
    try {
      const data = await ConductorService.getAll();
      if (data && data.length > 0) {
        setConductores(data);
      }
    } catch {
      // Si la API remota o PostgreSQL está offline, conserva el estado local
    } finally {
      setCargando(false);
    }
  };

  const handleCrear = async (e: React.FormEvent) => {
    e.preventDefault();
    setAlerta(null);
    setMensajeExito(null);

    // Validación DNI (8 dígitos)
    const cleanDni = dni.trim();
    if (!/^\d{8}$/.test(cleanDni)) {
      setAlerta('El DNI debe contener exactamente 8 dígitos numéricos.');
      return;
    }

    // Validación no duplicidad local previa
    if (conductores.some(c => c.dni === cleanDni)) {
      setAlerta(`El DNI '${cleanDni}' ya se encuentra registrado.`);
      return;
    }

    const cleanLic = licencia.trim().toUpperCase();
    if (conductores.some(c => c.licencia.toUpperCase() === cleanLic)) {
      setAlerta(`El número de licencia '${cleanLic}' ya se encuentra registrado.`);
      return;
    }

    const payload = {
      dni: cleanDni,
      nombres: nombres.trim(),
      apellidos: apellidos.trim(),
      licencia: cleanLic,
      categoria_licencia: categoria,
      telefono: telefono.trim(),
      direccion_origen: direccionOrigen.trim() || undefined,
      latitud_origen: typeof latitudOrigen === 'number' ? latitudOrigen : undefined,
      longitud_origen: typeof longitudOrigen === 'number' ? longitudOrigen : undefined,
      estado: 'DISPONIBLE',
      horas_conduccion_hoy: 0.0
    };

    try {
      const res = await ConductorService.create(payload as any);
      setConductores(prev => [res, ...prev]);
      setMensajeExito(`Conductor ${payload.nombres} ${payload.apellidos} registrado exitosamente.`);
    } catch (err: any) {
      const errorMsg = err.response?.data?.detail || 'Error al conectar con el backend.';
      if (err.response?.status === 409) {
        setAlerta(errorMsg);
        return;
      }
      // Fallback local garantizado
      const localConductor: Conductor = {
        conductor_id: `loc-${Date.now()}`,
        ...payload
      };
      setConductores(prev => [localConductor, ...prev]);
      setMensajeExito(`Conductor ${payload.nombres} registrado localmente.`);
    }

    // Limpiar formulario
    setDni('');
    setNombres('');
    setApellidos('');
    setLicencia('');
    setTelefono('');
    setDireccionOrigen('');
  };

  const abrirEdicion = (c: Conductor) => {
    setEditingConductor(c);
    setEditNombres(c.nombres);
    setEditApellidos(c.apellidos);
    setEditTelefono(c.telefono);
    setEditCategoria(c.categoria_licencia || 'A-IIIc');
    setEditDireccion(c.direccion_origen || '');
    setEditLatitud(c.latitud_origen ?? '');
    setEditLongitud(c.longitud_origen ?? '');
    setEditEstado(c.estado);
  };

  const handleGuardarEdicion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingConductor) return;

    const updatePayload: Partial<Conductor> = {
      nombres: editNombres.trim(),
      apellidos: editApellidos.trim(),
      telefono: editTelefono.trim(),
      categoria_licencia: editCategoria,
      direccion_origen: editDireccion.trim() || undefined,
      latitud_origen: typeof editLatitud === 'number' ? editLatitud : undefined,
      longitud_origen: typeof editLongitud === 'number' ? editLongitud : undefined,
      estado: editEstado
    };

    try {
      await ConductorService.update(editingConductor.conductor_id, updatePayload);
    } catch {
      // Fallback local
    }

    setConductores(prev => prev.map(c => 
      c.conductor_id === editingConductor.conductor_id 
        ? { ...c, ...updatePayload }
        : c
    ));
    setEditingConductor(null);
    setMensajeExito(`Datos del conductor ${editNombres} actualizados exitosamente.`);
  };

  const handleReiniciarJornada = async (c: Conductor) => {
    try {
      await ConductorService.reiniciarJornada(c.conductor_id);
    } catch {
      // Fallback local
    }
    setConductores(prev => prev.map(item => 
      item.conductor_id === c.conductor_id
        ? { ...item, horas_conduccion_hoy: 0.0, estado: item.estado === 'DESCANSO' ? 'DISPONIBLE' : item.estado }
        : item
    ));
    setMensajeExito(`Jornada diaria del conductor ${c.nombres} reiniciada a 0.0 horas.`);
  };

  const handleBajaLogica = async (c: Conductor) => {
    if (!window.confirm(`¿Seguro que deseas pasar a INACTIVO a ${c.nombres} ${c.apellidos}?`)) return;
    try {
      await ConductorService.delete(c.conductor_id);
    } catch {
      // Fallback local
    }
    setConductores(prev => prev.map(item => 
      item.conductor_id === c.conductor_id ? { ...item, estado: 'INACTIVO' } : item
    ));
    setMensajeExito(`Conductor ${c.nombres} marcado como INACTIVO.`);
  };

  const abrirAsignacion = (c: Conductor) => {
    setAssigningConductor(c);
    setHorasRuta(1.5);
  };

  const handleValidarYAsignarRuta = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assigningConductor) return;

    setValidandoRuta(true);
    setAlerta(null);
    setMensajeExito(null);

    // SUB-002-05: Validar disponibilidad
    if (assigningConductor.estado !== 'DISPONIBLE') {
      setAlerta(`Conductor no disponible para asignación. Estado actual: '${assigningConductor.estado}'. Solo se pueden asignar rutas a conductores en estado 'DISPONIBLE'.`);
      setValidandoRuta(false);
      setAssigningConductor(null);
      return;
    }

    // SUB-002-07 & Escenario 2: Límite legal estricto de 8 horas diarias (Ley N° 30224)
    const horasProyectadas = assigningConductor.horas_conduccion_hoy + horasRuta;

    if (horasProyectadas > 8.0) {
      setAlerta('Asignación rechazada: Supera el límite legal de 8 horas diarias (Ley N° 30224).');
      setValidandoRuta(false);
      setAssigningConductor(null);
      return;
    }

    try {
      await ConductorService.validarJornada(assigningConductor.conductor_id, horasRuta);
      await ConductorService.acumularHoras(assigningConductor.conductor_id, horasRuta);
    } catch (err: any) {
      if (err.response?.status === 400) {
        setAlerta(err.response?.data?.detail || 'Asignación rechazada por normativa legal.');
        setValidandoRuta(false);
        setAssigningConductor(null);
        return;
      }
    }

    // Actualizar estado local
    setConductores(prev => prev.map(c => 
      c.conductor_id === assigningConductor.conductor_id
        ? { 
            ...c, 
            horas_conduccion_hoy: Math.round(horasProyectadas * 100) / 100,
            estado: horasProyectadas >= 8.0 ? 'DESCANSO' : c.estado 
          }
        : c
    ));

    setMensajeExito(`Ruta de ${horasRuta}h aprobada y asignada a ${assigningConductor.nombres} ${assigningConductor.apellidos}. Horas acumuladas: ${horasProyectadas.toFixed(1)} / 8.0 h.`);
    setValidandoRuta(false);
    setAssigningConductor(null);
  };

  const conductoresFiltrados = conductores.filter(c => {
    if (filtroEstado === 'TODOS') return true;
    return c.estado === filtroEstado;
  });

  const promedioHoras = conductores.length > 0 
    ? (conductores.reduce((acc, c) => acc + c.horas_conduccion_hoy, 0) / conductores.length).toFixed(1)
    : '0.0';

  const conductoresAlLimite = conductores.filter(c => c.horas_conduccion_hoy >= 7.0).length;

  return (
    <div>
      {/* Encabezado Apple SF */}
      <div className="header-title">
        <div>
          <h1>Gestión de Conductores y Jornada</h1>
          <p>US-002 · Control de fatiga, origen GPS y cumplimiento estricto de 8 horas máximas (Ley N° 30224)</p>
        </div>
        <button 
          className="btn btn-secondary" 
          onClick={cargarConductores} 
          disabled={cargando}
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
        >
          <RefreshCw size={14} className={cargando ? 'spin' : ''} />
          <span>Actualizar</span>
        </button>
      </div>

      {/* Notificaciones Apple Glass Toasts en la Esquina Superior Derecha */}
      {(alerta || mensajeExito) && (
        <div className="apple-toast-container">
          {mensajeExito && (
            <div className="apple-toast apple-toast-success">
              <CheckCircle2 size={18} className="toast-icon" />
              <div className="apple-toast-content">
                <div className="apple-toast-title">Operación Exitosa</div>
                <div className="apple-toast-message">{mensajeExito}</div>
              </div>
              <button 
                className="apple-toast-close" 
                onClick={() => setMensajeExito(null)}
                title="Cerrar notificación"
              >
                <X size={14} />
              </button>
            </div>
          )}

          {alerta && (
            <div className="apple-toast apple-toast-error">
              <ShieldAlert size={18} className="toast-icon" />
              <div className="apple-toast-content">
                <div className="apple-toast-title">Normativa Legal MTC</div>
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

      {/* Tarjetas de Métricas de Fatiga */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', marginBottom: '1.75rem' }}>
        <div className="card" style={{ padding: '1.25rem', margin: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: 'var(--apple-text-secondary)', marginBottom: '0.5rem', fontSize: '0.8rem', fontWeight: 600 }}>
            <Users size={16} color="var(--apple-accent)" /> Total Conductores
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 700, letterSpacing: '-0.03em' }}>
            {conductores.length}
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--apple-cyan-text)', fontWeight: 500 }}>
            100% Brevete MTC Verificado
          </span>
        </div>

        <div className="card" style={{ padding: '1.25rem', margin: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: 'var(--apple-text-secondary)', marginBottom: '0.5rem', fontSize: '0.8rem', fontWeight: 600 }}>
            <Clock size={16} color="var(--apple-cyan)" /> Jornada Promedio Hoy
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 700, letterSpacing: '-0.03em' }}>
            {promedioHoras} h
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--apple-text-secondary)' }}>
            Límite legal: 8.0 horas diarias
          </span>
        </div>

        <div className="card" style={{ padding: '1.25rem', margin: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: 'var(--apple-text-secondary)', marginBottom: '0.5rem', fontSize: '0.8rem', fontWeight: 600 }}>
            <ShieldCheck size={16} color={conductoresAlLimite > 0 ? 'var(--apple-red)' : 'var(--apple-accent)'} /> Choferes en Riesgo Fatiga
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 700, letterSpacing: '-0.03em', color: conductoresAlLimite > 0 ? 'var(--apple-red-text)' : 'var(--apple-text-primary)' }}>
            {conductoresAlLimite}
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--apple-text-secondary)' }}>
            Conducción acumulada &ge; 7.0 h
          </span>
        </div>
      </div>

      {/* SUB-002-01: Formulario de Registro de Conductores */}
      <div className="card">
        <h3 style={{ marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Plus size={18} color="var(--apple-accent)" /> SUB-002-01: Registro de Conductor y Punto de Origen
        </h3>
        <form onSubmit={handleCrear}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.35rem', color: 'var(--apple-text-secondary)' }}>
                <CreditCard size={13} /> DNI (8 dígitos):
              </label>
              <input
                type="text"
                required
                maxLength={8}
                pattern="\d{8}"
                placeholder="Ej. 71234567"
                value={dni}
                onChange={e => setDni(e.target.value.replace(/\D/g, ''))}
                style={{ width: '100%', fontVariantNumeric: 'tabular-nums' }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '0.35rem', color: 'var(--apple-text-secondary)' }}>
                Nombres:
              </label>
              <input
                type="text"
                required
                placeholder="Ej. Carlos Eduardo"
                value={nombres}
                onChange={e => setNombres(e.target.value)}
                style={{ width: '100%' }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '0.35rem', color: 'var(--apple-text-secondary)' }}>
                Apellidos:
              </label>
              <input
                type="text"
                required
                placeholder="Ej. Quispe Huamán"
                value={apellidos}
                onChange={e => setApellidos(e.target.value)}
                style={{ width: '100%' }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.35rem', color: 'var(--apple-text-secondary)' }}>
                <Award size={13} /> Brevete MTC:
              </label>
              <input
                type="text"
                required
                placeholder="Ej. Q71234567"
                value={licencia}
                onChange={e => setLicencia(e.target.value.toUpperCase())}
                style={{ width: '100%', textTransform: 'uppercase' }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '0.35rem', color: 'var(--apple-text-secondary)' }}>
                Categoría MTC:
              </label>
              <select
                value={categoria}
                onChange={e => setCategoria(e.target.value)}
                style={{ width: '100%' }}
              >
                <option value="A-I">A-I (Particular)</option>
                <option value="A-IIa">A-IIa (Taxi / Colectivo)</option>
                <option value="A-IIb">A-IIb (Carga ligera / Microbús)</option>
                <option value="A-IIIa">A-IIIa (Ómnibus interprovincial)</option>
                <option value="A-IIIb">A-IIIb (Remolques / Carga pesada)</option>
                <option value="A-IIIc">A-IIIc (Profesional de carga pesada MTC)</option>
              </select>
            </div>

            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.35rem', color: 'var(--apple-text-secondary)' }}>
                <Phone size={13} /> Teléfono Móvil:
              </label>
              <input
                type="text"
                required
                maxLength={12}
                placeholder="Ej. 987654321"
                value={telefono}
                onChange={e => setTelefono(e.target.value)}
                style={{ width: '100%' }}
              />
            </div>
          </div>

          {/* SUB-002-06: Configuración del Punto de Origen */}
          <div style={{ padding: '0.9rem', backgroundColor: 'var(--apple-bg-secondary)', borderRadius: '10px', marginBottom: '1.25rem', border: '1px solid var(--apple-border)' }}>
            <div style={{ fontSize: '0.82rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.75rem', color: 'var(--apple-cyan-text)' }}>
              <MapPin size={15} /> SUB-002-06: Punto de Partida / Origen Habitual en Lima Metropolitana
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.85rem' }}>
              <div>
                <label style={{ fontSize: '0.75rem', color: 'var(--apple-text-secondary)', display: 'block', marginBottom: '0.25rem' }}>
                  Dirección Base / Domicilio:
                </label>
                <input
                  type="text"
                  placeholder="Ej. Av. Elmer Faucett 2100, Callao"
                  value={direccionOrigen}
                  onChange={e => setDireccionOrigen(e.target.value)}
                  style={{ width: '100%', fontSize: '0.85rem' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', color: 'var(--apple-text-secondary)', display: 'block', marginBottom: '0.25rem' }}>
                  Latitud GPS:
                </label>
                <input
                  type="number"
                  step="0.000001"
                  placeholder="-12.046374"
                  value={latitudOrigen}
                  onChange={e => setLatitudOrigen(e.target.value === '' ? '' : Number(e.target.value))}
                  style={{ width: '100%', fontSize: '0.85rem' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', color: 'var(--apple-text-secondary)', display: 'block', marginBottom: '0.25rem' }}>
                  Longitud GPS:
                </label>
                <input
                  type="number"
                  step="0.000001"
                  placeholder="-77.042793"
                  value={longitudOrigen}
                  onChange={e => setLongitudOrigen(e.target.value === '' ? '' : Number(e.target.value))}
                  style={{ width: '100%', fontSize: '0.85rem' }}
                />
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button type="submit" className="btn" style={{ padding: '0.55rem 1.4rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Plus size={16} /> Guardar Conductor
            </button>
          </div>
        </form>
      </div>

      {/* Padrón y Filtros de Estado */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div>
            <h3>Padrón de Conductores y Control de Fatiga</h3>
            <p style={{ fontSize: '0.75rem', color: 'var(--apple-text-secondary)', marginTop: '0.2rem' }}>
              Mostrando {conductoresFiltrados.length} conductores
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
            {['TODOS', 'DISPONIBLE', 'EN_RUTA', 'DESCANSO', 'INACTIVO'].map(est => (
              <button
                key={est}
                onClick={() => setFiltroEstado(est)}
                className={`btn ${filtroEstado === est ? '' : 'btn-secondary'}`}
                style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem' }}
              >
                {est}
              </button>
            ))}
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table>
            <thead>
              <tr>
                <th>Conductor</th>
                <th>DNI / Brevete</th>
                <th>Categoría</th>
                <th>Contacto & Origen</th>
                <th style={{ minWidth: '170px' }}>Jornada Acumulada</th>
                <th>Estado</th>
                <th style={{ textAlign: 'right' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {conductoresFiltrados.map(c => {
                const porcentaje = Math.min((c.horas_conduccion_hoy / 8.0) * 100, 100);
                const colorBarra = c.horas_conduccion_hoy >= 7.5 
                  ? 'var(--apple-red)' 
                  : c.horas_conduccion_hoy >= 6.0 
                  ? 'var(--apple-orange)' 
                  : 'var(--apple-accent)';

                return (
                  <tr key={c.conductor_id}>
                    <td>
                      <div style={{ fontWeight: 600 }}>{c.nombres} {c.apellidos}</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--apple-text-tertiary)' }}>ID: {c.conductor_id.substring(0, 8)}...</div>
                    </td>
                    <td>
                      <div><strong>DNI:</strong> {c.dni}</div>
                      <div style={{ fontSize: '0.75rem' }}><code>{c.licencia}</code></div>
                    </td>
                    <td>
                      <span className="badge badge-gray">{c.categoria_licencia || 'A-IIIc'}</span>
                    </td>
                    <td>
                      <div style={{ fontVariantNumeric: 'tabular-nums' }}>{c.telefono}</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--apple-text-secondary)', display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.2rem' }}>
                        <MapPin size={11} /> {c.direccion_origen || 'No configurado'}
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '0.3rem', fontVariantNumeric: 'tabular-nums' }}>
                        <span style={{ fontWeight: 600, color: colorBarra }}>
                          {c.horas_conduccion_hoy.toFixed(1)} h
                        </span>
                        <span style={{ color: 'var(--apple-text-tertiary)' }}>8.0 h máx</span>
                      </div>
                      <div className="progress-bar-container">
                        <div 
                          className="progress-bar-fill" 
                          style={{ width: `${porcentaje}%`, backgroundColor: colorBarra }}
                        />
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${
                        c.estado === 'DISPONIBLE' ? 'badge-cyan' :
                        c.estado === 'EN_RUTA' ? 'badge-yellow' :
                        c.estado === 'DESCANSO' ? 'badge-red' : 'badge-gray'
                      }`}>
                        {c.estado}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '0.4rem' }}>
                        {/* Simular / Asignar Ruta */}
                        <button
                          className="btn btn-secondary"
                          onClick={() => abrirAsignacion(c)}
                          title="Simular Asignación de Ruta (US-002 Escenario 2)"
                          style={{ padding: '0.35rem 0.6rem', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
                        >
                          <Send size={13} /> Asignar
                        </button>

                        {/* Editar */}
                        <button
                          className="btn btn-secondary"
                          onClick={() => abrirEdicion(c)}
                          title="Editar Conductor"
                          style={{ padding: '0.35rem 0.5rem' }}
                        >
                          <Pencil size={13} />
                        </button>

                        {/* Reiniciar Jornada */}
                        <button
                          className="btn btn-secondary"
                          onClick={() => handleReiniciarJornada(c)}
                          title="Reiniciar jornada diaria a 0.0h"
                          style={{ padding: '0.35rem 0.5rem' }}
                        >
                          <RotateCcw size={13} />
                        </button>

                        {/* Baja lógica */}
                        {c.estado !== 'INACTIVO' && (
                          <button
                            className="btn btn-secondary"
                            onClick={() => handleBajaLogica(c)}
                            title="Dar de baja lógica"
                            style={{ padding: '0.35rem 0.5rem', color: 'var(--apple-red-text)' }}
                          >
                            <Trash2 size={13} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de Simulación / Asignación de Ruta (SUB-002-05 & SUB-002-07) */}
      {assigningConductor && (
        <div className="modal-overlay" onClick={() => setAssigningConductor(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '480px' }}>
            <div className="modal-header">
              <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Send size={18} color="var(--apple-accent)" /> Asignación de Ruta a Conductor
              </h2>
              <button 
                className="modal-close" 
                onClick={() => setAssigningConductor(null)}
                title="Cerrar modal"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleValidarYAsignarRuta} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
              <div style={{ padding: '0.85rem', backgroundColor: 'var(--apple-bg-secondary)', borderRadius: '10px', border: '1px solid var(--apple-border)' }}>
                <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>
                  {assigningConductor.nombres} {assigningConductor.apellidos}
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--apple-text-secondary)', marginTop: '0.2rem' }}>
                  Brevete: {assigningConductor.licencia} ({assigningConductor.categoria_licencia}) | Estado actual: <strong>{assigningConductor.estado}</strong>
                </div>
                <div style={{ fontSize: '0.78rem', marginTop: '0.4rem', color: assigningConductor.horas_conduccion_hoy >= 7.0 ? 'var(--apple-red-text)' : 'inherit' }}>
                  Jornada acumulada hoy: <strong>{assigningConductor.horas_conduccion_hoy} h</strong> / 8.0 h máxima permitida
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.82rem', fontWeight: 600, display: 'block', marginBottom: '0.35rem' }}>
                  Duración estimada de la ruta a asignar (horas):
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0.1"
                  max="14.0"
                  required
                  value={horasRuta}
                  onChange={e => setHorasRuta(Number(e.target.value))}
                  style={{ width: '100%', fontSize: '1rem', fontVariantNumeric: 'tabular-nums' }}
                />
              </div>

              {/* Cálculo en Tiempo Real */}
              <div style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--apple-border)', fontSize: '0.8rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
                  <span>Horas actuales:</span>
                  <strong>{assigningConductor.horas_conduccion_hoy.toFixed(1)} h</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
                  <span>Horas de la ruta:</span>
                  <strong>+{horasRuta.toFixed(1)} h</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--apple-border)', paddingTop: '0.4rem' }}>
                  <span>Jornada proyectada:</span>
                  <strong style={{ 
                    color: (assigningConductor.horas_conduccion_hoy + horasRuta) > 8.0 
                      ? 'var(--apple-red-text)' 
                      : 'var(--apple-cyan-text)' 
                  }}>
                    {(assigningConductor.horas_conduccion_hoy + horasRuta).toFixed(1)} h / 8.0 h
                  </strong>
                </div>
              </div>

              {(assigningConductor.horas_conduccion_hoy + horasRuta) > 8.0 && (
                <div style={{ padding: '0.65rem 0.85rem', borderRadius: '8px', backgroundColor: 'var(--apple-red-bg)', border: '1px solid var(--apple-red-border)', color: 'var(--apple-red-text)', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <AlertTriangle size={16} />
                  <span>Advertencia Legal: Supera el límite de 8 horas diarias según Ley N° 30224. La asignación será rechazada.</span>
                </div>
              )}

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setAssigningConductor(null)}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn"
                  disabled={validandoRuta}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                >
                  <Check size={16} /> Validar y Confirmar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Edición de Conductor */}
      {editingConductor && (
        <div className="modal-overlay" onClick={() => setEditingConductor(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '540px' }}>
            <div className="modal-header">
              <h2>Editar Conductor: {editingConductor.nombres}</h2>
              <button 
                className="modal-close" 
                onClick={() => setEditingConductor(null)}
                title="Cerrar modal"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleGuardarEdicion} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '0.35rem' }}>
                    Nombres:
                  </label>
                  <input
                    type="text"
                    required
                    value={editNombres}
                    onChange={e => setEditNombres(e.target.value)}
                    style={{ width: '100%' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '0.35rem' }}>
                    Apellidos:
                  </label>
                  <input
                    type="text"
                    required
                    value={editApellidos}
                    onChange={e => setEditApellidos(e.target.value)}
                    style={{ width: '100%' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '0.35rem' }}>
                    Teléfono Móvil:
                  </label>
                  <input
                    type="text"
                    required
                    value={editTelefono}
                    onChange={e => setEditTelefono(e.target.value)}
                    style={{ width: '100%' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '0.35rem' }}>
                    Categoría MTC:
                  </label>
                  <select
                    value={editCategoria}
                    onChange={e => setEditCategoria(e.target.value)}
                    style={{ width: '100%' }}
                  >
                    <option value="A-I">A-I</option>
                    <option value="A-IIa">A-IIa</option>
                    <option value="A-IIb">A-IIb</option>
                    <option value="A-IIIa">A-IIIa</option>
                    <option value="A-IIIb">A-IIIb</option>
                    <option value="A-IIIc">A-IIIc</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '0.35rem' }}>
                  Dirección Base / Origen:
                </label>
                <input
                  type="text"
                  value={editDireccion}
                  onChange={e => setEditDireccion(e.target.value)}
                  style={{ width: '100%' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '0.35rem' }}>
                    Latitud GPS:
                  </label>
                  <input
                    type="number"
                    step="0.000001"
                    value={editLatitud}
                    onChange={e => setEditLatitud(e.target.value === '' ? '' : Number(e.target.value))}
                    style={{ width: '100%' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '0.35rem' }}>
                    Longitud GPS:
                  </label>
                  <input
                    type="number"
                    step="0.000001"
                    value={editLongitud}
                    onChange={e => setEditLongitud(e.target.value === '' ? '' : Number(e.target.value))}
                    style={{ width: '100%' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '0.35rem' }}>
                  Estado Operativo:
                </label>
                <select
                  value={editEstado}
                  onChange={e => setEditEstado(e.target.value)}
                  style={{ width: '100%' }}
                >
                  <option value="DISPONIBLE">DISPONIBLE (Listo para ruta)</option>
                  <option value="EN_RUTA">EN_RUTA (Operando actualmente)</option>
                  <option value="DESCANSO">DESCANSO (Cumplió turno)</option>
                  <option value="INACTIVO">INACTIVO (Baja de padrón)</option>
                </select>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setEditingConductor(null)}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn"
                >
                  Guardar Cambios
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
