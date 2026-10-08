import React, { useState, useEffect } from 'react';
import { 
  Users, UserPlus, ShieldCheck, ShieldAlert, KeyRound, 
  Briefcase, Truck, Store, CheckCircle2, X, Edit, Trash2, 
  Lock, RefreshCw, Check, Sparkles, AlertCircle
} from 'lucide-react';
import { 
  Usuario, UsuarioService, RolUsuario, EstadoUsuario, 
  PermisoItem, CatalogoPermisosResponse, UsuarioCreatePayload,
  ClienteService
} from '../services/api';

const ROL_CONFIG: Record<RolUsuario, { label: string; icon: React.ReactNode; color: string; bg: string; border: string }> = {
  ADMIN: {
    label: 'Administrador General',
    icon: <ShieldCheck size={14} />,
    color: '#bf5af2', // Apple Purple
    bg: 'rgba(191, 90, 242, 0.15)',
    border: 'rgba(191, 90, 242, 0.35)'
  },
  OFICINA: {
    label: 'Personal de Oficina (Seguimiento)',
    icon: <Briefcase size={14} />,
    color: 'var(--apple-accent-text)',
    bg: 'var(--apple-accent-surface)',
    border: 'var(--apple-accent-border)'
  },
  REPARTIDOR: {
    label: 'Repartidor / Conductor',
    icon: <Truck size={14} />,
    color: 'var(--apple-orange-text)',
    bg: 'var(--apple-orange-surface)',
    border: 'var(--apple-orange-border)'
  },
  CLIENTE: {
    label: 'Cliente Comercial',
    icon: <Store size={14} />,
    color: 'var(--apple-cyan-text)',
    bg: 'var(--apple-cyan-surface)',
    border: 'var(--apple-cyan-border)'
  }
};

interface AdminUsersViewProps {
  currentSimulatedRole?: RolUsuario;
  onRoleChange?: (role: RolUsuario) => void;
}

export function AdminUsersView({ currentSimulatedRole, onRoleChange }: AdminUsersViewProps) {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [catalogo, setCatalogo] = useState<CatalogoPermisosResponse | null>(null);
  const [cargando, setCargando] = useState<boolean>(true);
  const [filtroRol, setFiltroRol] = useState<string>('TODOS');
  const [filtroEstado, setFiltroEstado] = useState<string>('TODOS');

  // Modales
  const [modalAbierto, setModalAbierto] = useState<boolean>(false);
  const [usuarioEditando, setUsuarioEditando] = useState<Usuario | null>(null);

  // Estados del Formulario
  const [email, setEmail] = useState<string>('');
  const [nombreCompleto, setNombreCompleto] = useState<string>('');
  const [telefono, setTelefono] = useState<string>('');
  const [rolSeleccionado, setRolSeleccionado] = useState<RolUsuario>('OFICINA');
  const [password, setPassword] = useState<string>('');
  const [permisosSeleccionados, setPermisosSeleccionados] = useState<string[]>([]);
  const [estadoSeleccionado, setEstadoSeleccionado] = useState<EstadoUsuario>('ACTIVO');

  // Mensajes y Alertas
  const [mensajeExito, setMensajeExito] = useState<string | null>(null);
  const [errorAlerta, setErrorAlerta] = useState<string | null>(null);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    setCargando(true);
    try {
      const [usersData, catData] = await Promise.all([
        UsuarioService.getAll(),
        UsuarioService.getCatalogoPermisos()
      ]);
      setUsuarios(usersData);
      setCatalogo(catData);
    } catch (err: any) {
      setErrorAlerta('Error al conectar con la base de datos de usuarios. Verifique que el backend esté activo.');
    } finally {
      setCargando(false);
    }
  };

  // Al cambiar el rol en el formulario, sugerir automáticamente los permisos por defecto
  const handleCambioRolEnForm = (nuevoRol: RolUsuario) => {
    setRolSeleccionado(nuevoRol);
    if (catalogo) {
      const rolEncontrado = catalogo.roles_disponibles.find(r => r.codigo === nuevoRol);
      if (rolEncontrado) {
        setPermisosSeleccionados(rolEncontrado.permisos_default);
      }
    }
  };

  const togglePermiso = (codigoPermiso: string) => {
    setPermisosSeleccionados(prev => 
      prev.includes(codigoPermiso)
        ? prev.filter(p => p !== codigoPermiso)
        : [...prev, codigoPermiso]
    );
  };

  const abrirModalCreacion = () => {
    setUsuarioEditando(null);
    setEmail('');
    setNombreCompleto('');
    setTelefono('');
    setRolSeleccionado('OFICINA');
    setPassword('Eco2026*!');
    setEstadoSeleccionado('ACTIVO');

    if (catalogo) {
      const rolEncontrado = catalogo.roles_disponibles.find(r => r.codigo === 'OFICINA');
      setPermisosSeleccionados(rolEncontrado ? rolEncontrado.permisos_default : []);
    } else {
      setPermisosSeleccionados(['GESTION_FLOTA', 'SEGUIMIENTO_RUTAS']);
    }
    setModalAbierto(true);
  };

  const abrirModalEdicion = (user: Usuario) => {
    setUsuarioEditando(user);
    setEmail(user.email);
    setNombreCompleto(user.nombre_completo);
    setTelefono(user.telefono || '');
    setRolSeleccionado(user.rol);
    setPassword('');
    setPermisosSeleccionados(user.permisos || []);
    setEstadoSeleccionado(user.estado);
    setModalAbierto(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorAlerta(null);

    try {
      if (usuarioEditando) {
        // Actualizar
        const updatePayload: any = {
          nombre_completo: nombreCompleto,
          telefono: telefono || undefined,
          rol: rolSeleccionado,
          permisos: permisosSeleccionados,
          estado: estadoSeleccionado
        };
        if (password.trim().length >= 6) {
          updatePayload.password = password;
        }

        const actualizado = await UsuarioService.update(usuarioEditando.usuario_id, updatePayload);
        setUsuarios(prev => prev.map(u => u.usuario_id === actualizado.usuario_id ? actualizado : u));
        setMensajeExito(`Usuario ${actualizado.nombre_completo} actualizado correctamente.`);

        // Sincronizar actualización con el Directorio de Clientes B2B si es CLIENTE
        if (actualizado.rol === 'CLIENTE') {
          try {
            const list = await ClienteService.getAll();
            const match = list.find(c => 
              c.cliente_id === actualizado.usuario_id || 
              (c.email && actualizado.email && c.email.toLowerCase() === actualizado.email.toLowerCase())
            );
            if (match) {
              await ClienteService.update(match.cliente_id, {
                razon_social: actualizado.nombre_completo,
                telefono: actualizado.telefono,
                email: actualizado.email,
                estado: (actualizado.estado === 'INACTIVO' || (actualizado.estado as string) === 'BLOQUEADO') ? 'INACTIVO' : 'ACTIVO'
              });
            }
          } catch (syncErr) {
            console.warn('Sync client update:', syncErr);
          }
        }
      } else {
        // Crear
        const nuevoPayload: UsuarioCreatePayload = {
          email: email.trim().toLowerCase(),
          nombre_completo: nombreCompleto.trim(),
          telefono: telefono.trim() || undefined,
          rol: rolSeleccionado,
          password: password,
          permisos: permisosSeleccionados,
          estado: estadoSeleccionado
        };

        const creado = await UsuarioService.create(nuevoPayload);
        setUsuarios(prev => [creado, ...prev]);
        setMensajeExito(`Usuario ${creado.nombre_completo} (${ROL_CONFIG[creado.rol].label}) creado con éxito.`);

        // Sincronizar automáticamente con el Directorio de Clientes B2B si es CLIENTE
        if (creado.rol === 'CLIENTE') {
          try {
            await ClienteService.create({
              tipo_documento: 'RUC',
              numero_documento: '20' + Math.floor(100000000 + Math.random() * 900000000),
              razon_social: creado.nombre_completo,
              nombre_contacto: creado.nombre_completo.replace(/\s*\(.*\)/, '').split('·')[0].trim() || 'Contacto Comercial',
              telefono: creado.telefono || '987112233',
              email: creado.email,
              direccion: 'Av. Canto Grande 2450',
              distrito: 'San Juan de Lurigancho',
              latitud: -12.001200,
              longitud: -77.012300,
              tipo_comercio: 'BODEGA',
              ventana_entrega_inicio: '08:00',
              ventana_entrega_fin: '13:00',
              restriccion_acceso: 'LIBRE_ACCESO',
              estado: creado.estado === 'INACTIVO' ? 'INACTIVO' : 'ACTIVO'
            });
          } catch (syncErr) {
            console.warn('Sync client create:', syncErr);
          }
        }
      }

      setModalAbierto(false);
    } catch (err: any) {
      const msg = err.response?.data?.detail || 'No se pudo guardar el usuario. Verifique los datos.';
      setErrorAlerta(msg);
    }
  };

  const handleEliminar = async (user: Usuario) => {
    if (!window.confirm(`¿Está seguro de eliminar al usuario ${user.nombre_completo} (${user.email})?`)) return;

    try {
      await UsuarioService.delete(user.usuario_id);
      setUsuarios(prev => prev.filter(u => u.usuario_id !== user.usuario_id));
      setMensajeExito(`Usuario ${user.nombre_completo} eliminado.`);

      // Si es CLIENTE, eliminar o dar de baja también del Directorio de Clientes
      if (user.rol === 'CLIENTE') {
        try {
          const list = await ClienteService.getAll();
          const match = list.find(c => 
            c.cliente_id === user.usuario_id || 
            (c.email && user.email && c.email.toLowerCase() === user.email.toLowerCase())
          );
          if (match) {
            await ClienteService.delete(match.cliente_id);
          }
        } catch {}
      }
    } catch (err: any) {
      setErrorAlerta('Error al eliminar el usuario.');
    }
  };

  const usuariosFiltrados = usuarios.filter(u => {
    const pasaRol = filtroRol === 'TODOS' || u.rol === filtroRol;
    const pasaEstado = filtroEstado === 'TODOS' || u.estado === filtroEstado;
    return pasaRol && pasaEstado;
  });

  const totalOficina = usuarios.filter(u => u.rol === 'OFICINA').length;
  const totalRepartidores = usuarios.filter(u => u.rol === 'REPARTIDOR').length;
  const totalClientes = usuarios.filter(u => u.rol === 'CLIENTE').length;

  return (
    <div>
      {/* Toast Notificaciones */}
      {(errorAlerta || mensajeExito) && (
        <div className="apple-toast-container">
          {mensajeExito && (
            <div className="apple-toast apple-toast-success">
              <CheckCircle2 size={18} className="toast-icon" />
              <div className="apple-toast-content">
                <div className="apple-toast-title">Operación Completada</div>
                <div className="apple-toast-message">{mensajeExito}</div>
              </div>
              <button className="apple-toast-close" onClick={() => setMensajeExito(null)}>
                <X size={14} />
              </button>
            </div>
          )}

          {errorAlerta && (
            <div className="apple-toast apple-toast-error">
              <ShieldAlert size={18} className="toast-icon" />
              <div className="apple-toast-content">
                <div className="apple-toast-title">Alerta de Seguridad</div>
                <div className="apple-toast-message">{errorAlerta}</div>
              </div>
              <button className="apple-toast-close" onClick={() => setErrorAlerta(null)}>
                <X size={14} />
              </button>
            </div>
          )}
        </div>
      )}

      {/* Encabezado */}
      <div className="header-title">
        <div>
          <h1>Módulo de Administración y Control de Acceso (RBAC)</h1>
          <p>
            Gestión integral de personal de oficina (seguimiento), repartidores y clientes con asignación granular de permisos.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <button 
            className="btn btn-secondary" 
            onClick={cargarDatos}
            disabled={cargando}
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
          >
            <RefreshCw size={14} className={cargando ? 'spin' : ''} />
            <span>Actualizar</span>
          </button>
          <button 
            className="btn" 
            onClick={abrirModalCreacion}
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
          >
            <UserPlus size={16} />
            <span>Nuevo Usuario</span>
          </button>
        </div>
      </div>

      {/* Selector de Simulación de Rol Activo */}
      {onRoleChange && (
        <div className="card" style={{ padding: '1rem 1.25rem', marginBottom: '1.5rem', background: '#F7F6F1', border: '1.5px solid #CAD3BD' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <Sparkles size={18} color="var(--apple-accent)" />
              <div>
                <strong style={{ fontSize: '0.88rem' }}>Simulador de Rol Activo:</strong>
                <p style={{ fontSize: '0.75rem', color: 'var(--apple-text-secondary)', margin: 0 }}>
                  Cambia de perspectiva para evidenciar cómo cada perfil accede únicamente a sus módulos autorizados.
                </p>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
              {(['ADMIN', 'OFICINA', 'REPARTIDOR', 'CLIENTE'] as RolUsuario[]).map(r => {
                const conf = ROL_CONFIG[r];
                const activo = currentSimulatedRole === r;
                return (
                  <button
                    key={r}
                    onClick={() => onRoleChange(r)}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      padding: '0.4rem 0.8rem',
                      borderRadius: '8px',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      border: activo ? `1.5px solid ${conf.color}` : '1.5px solid #CAD3BD',
                      background: activo ? conf.bg : '#FFFFFF',
                      color: activo ? conf.color : 'var(--apple-text-primary)',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    {conf.icon}
                    <span>{conf.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Padrón y Filtros de Usuarios */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div>
            <h3>Directorio de Cuentas y Permisos Asignados</h3>
            <p style={{ fontSize: '0.75rem', color: 'var(--apple-text-secondary)', marginTop: '0.2rem' }}>
              Mostrando {usuariosFiltrados.length} de {usuarios.length} cuentas registradas
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
            {['TODOS', 'ADMIN', 'OFICINA', 'REPARTIDOR', 'CLIENTE'].map(r => (
              <button
                key={r}
                onClick={() => setFiltroRol(r)}
                className={`btn ${filtroRol === r ? '' : 'btn-secondary'}`}
                style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem' }}
              >
                {r === 'TODOS' ? 'Todos los Roles' : r}
              </button>
            ))}
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table>
            <thead>
              <tr>
                <th>Usuario / Identidad</th>
                <th>Rol Asignado</th>
                <th>Permisos Granulares Habilitados</th>
                <th>Contacto</th>
                <th>Estado</th>
                <th style={{ textAlign: 'right' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {usuariosFiltrados.map(u => {
                const conf = ROL_CONFIG[u.rol] || ROL_CONFIG.OFICINA;
                return (
                  <tr key={u.usuario_id}>
                    <td>
                      <div style={{ fontWeight: 600, color: 'var(--apple-text-primary)' }}>
                        {u.nombre_completo}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--apple-text-secondary)', marginTop: '0.15rem' }}>
                        {u.email}
                      </div>
                    </td>

                    <td>
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.35rem',
                        padding: '0.25rem 0.6rem',
                        borderRadius: '9999px',
                        fontSize: '0.72rem',
                        fontWeight: 600,
                        color: conf.color,
                        backgroundColor: conf.bg,
                        border: `1px solid ${conf.border}`
                      }}>
                        {conf.icon}
                        <span>{conf.label}</span>
                      </span>
                    </td>

                    <td>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem', maxWidth: '320px' }}>
                        {u.permisos.map(p => (
                          <span
                            key={p}
                            style={{
                              fontSize: '0.68rem',
                              padding: '0.15rem 0.45rem',
                              borderRadius: '6px',
                              backgroundColor: 'rgba(255, 255, 255, 0.06)',
                              border: '1px solid rgba(255, 255, 255, 0.08)',
                              color: 'var(--apple-text-secondary)'
                            }}
                          >
                            {p}
                          </span>
                        ))}
                      </div>
                    </td>

                    <td style={{ fontSize: '0.8rem' }}>
                      {u.telefono ? u.telefono : <span style={{ color: 'var(--apple-text-tertiary)' }}>Sin teléfono</span>}
                    </td>

                    <td>
                      <span className={`badge ${u.estado === 'ACTIVO' ? 'badge-active' : 'badge-inactive'}`}>
                        {u.estado}
                      </span>
                    </td>

                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '0.35rem' }}>
                        <button
                          className="btn-secondary"
                          onClick={() => abrirModalEdicion(u)}
                          title="Editar usuario y permisos"
                          style={{ padding: '0.3rem 0.55rem', borderRadius: '8px' }}
                        >
                          <Edit size={14} />
                        </button>
                        <button
                          className="btn-secondary"
                          onClick={() => handleEliminar(u)}
                          title="Eliminar usuario"
                          style={{ padding: '0.3rem 0.55rem', borderRadius: '8px', color: 'var(--apple-red-text)' }}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Apple Obsidian Glass para Alta y Edición de Usuario */}
      {modalAbierto && (
        <div className="apple-modal-overlay modal-overlay" onClick={() => setModalAbierto(false)}>
          <div className="apple-modal modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '600px' }}>
            <div className="modal-header">
              <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <KeyRound size={20} color="var(--apple-accent)" />
                <span>{usuarioEditando ? 'Editar Usuario y Permisos' : 'Registrar Nuevo Usuario'}</span>
              </h2>
              <button 
                className="modal-close modal-close-btn" 
                onClick={() => setModalAbierto(false)}
                title="Cerrar modal"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.15rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
                <div style={{ gridColumn: 'span 2' }}>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '0.35rem' }}>
                    Nombre Completo:
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Ing. Carlos Mendoza o Bodega Central"
                    value={nombreCompleto}
                    onChange={e => setNombreCompleto(e.target.value)}
                    style={{ width: '100%' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '0.35rem' }}>
                    Correo Electrónico (Login):
                  </label>
                  <input
                    type="email"
                    required
                    disabled={!!usuarioEditando}
                    placeholder="correo@ecologistica.pe"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    style={{ width: '100%' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '0.35rem' }}>
                    Teléfono de Contacto:
                  </label>
                  <input
                    type="text"
                    placeholder="Ej. 998877665"
                    value={telefono}
                    onChange={e => setTelefono(e.target.value)}
                    style={{ width: '100%' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '0.35rem' }}>
                    Rol Institucional:
                  </label>
                  <select
                    value={rolSeleccionado}
                    onChange={e => handleCambioRolEnForm(e.target.value as RolUsuario)}
                    style={{ width: '100%' }}
                  >
                    <option value="ADMIN">ADMIN - Administrador General</option>
                    <option value="OFICINA">OFICINA - Personal de Oficina / Seguimiento</option>
                    <option value="REPARTIDOR">REPARTIDOR - Conductor en Campo</option>
                    <option value="CLIENTE">CLIENTE - Cliente Final / Destinatario</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '0.35rem' }}>
                    {usuarioEditando ? 'Nueva Contraseña (Opcional):' : 'Contraseña Inicial:'}
                  </label>
                  <input
                    type="password"
                    required={!usuarioEditando}
                    placeholder={usuarioEditando ? 'Dejar en blanco para conservar' : 'Mínimo 6 caracteres'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    style={{ width: '100%' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '0.35rem' }}>
                    Estado de la Cuenta:
                  </label>
                  <select
                    value={estadoSeleccionado}
                    onChange={e => setEstadoSeleccionado(e.target.value as EstadoUsuario)}
                    style={{ width: '100%' }}
                  >
                    <option value="ACTIVO">ACTIVO (Permitido ingreso)</option>
                    <option value="INACTIVO">INACTIVO (Suspendido temporalmente)</option>
                    <option value="BLOQUEADO">BLOQUEADO (Seguridad)</option>
                  </select>
                </div>
              </div>

              {/* Matriz Granular de Permisos RBAC */}
              <div style={{ marginTop: '0.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <label style={{ fontSize: '0.82rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <ShieldCheck size={15} color="var(--apple-accent)" />
                    Permisos de Acceso Asignados:
                  </label>
                  <span style={{ fontSize: '0.72rem', color: 'var(--apple-text-secondary)' }}>
                    Preconfigurado para rol {rolSeleccionado}
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '0.5rem', maxHeight: '200px', overflowY: 'auto', paddingRight: '0.5rem' }}>
                  {catalogo?.catalogo_permisos.map(p => {
                    const seleccionado = permisosSeleccionados.includes(p.codigo);
                    return (
                      <div
                        key={p.codigo}
                        onClick={() => togglePermiso(p.codigo)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.75rem',
                          padding: '0.55rem 0.8rem',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          background: seleccionado ? 'var(--apple-accent-surface)' : 'rgba(255, 255, 255, 0.03)',
                          border: seleccionado ? '1px solid var(--apple-accent)' : '1px solid rgba(255, 255, 255, 0.07)',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        <div style={{
                          width: '18px',
                          height: '18px',
                          borderRadius: '5px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          background: seleccionado ? 'var(--apple-accent)' : 'transparent',
                          border: seleccionado ? 'none' : '1.5px solid var(--apple-text-tertiary)',
                          color: 'white',
                          flexShrink: 0
                        }}>
                          {seleccionado && <Check size={12} strokeWidth={3} />}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: '0.8rem', fontWeight: 600, color: seleccionado ? 'var(--apple-accent-text)' : 'var(--apple-text-primary)' }}>
                            {p.nombre} <code style={{ fontSize: '0.68rem', marginLeft: '0.3rem' }}>{p.codigo}</code>
                          </div>
                          <div style={{ fontSize: '0.72rem', color: 'var(--apple-text-secondary)' }}>
                            {p.descripcion}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setModalAbierto(false)}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn"
                  style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                >
                  <Check size={16} />
                  <span>{usuarioEditando ? 'Guardar Cambios' : 'Crear Usuario'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
