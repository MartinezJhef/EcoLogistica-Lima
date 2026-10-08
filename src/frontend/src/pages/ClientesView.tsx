import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Building2, Store, Users, Plus, Pencil, Trash2, MapPin, 
  Phone, Mail, Clock, ShieldCheck, RefreshCw, X, Check, 
  Search, Filter, ExternalLink, Navigation, Compass, 
  AlertCircle, CheckCircle2, ShieldAlert, Sparkles, Send,
  PackageCheck, Crosshair
} from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { 
  Cliente, 
  ClienteService, 
  ClienteCreatePayload, 
  ClienteUpdatePayload, 
  TipoComercio,
  UsuarioService,
  MOCK_CLIENTES_DEFAULT
} from '../services/api';
import { SVG_MINI_PIN, crearIconoNegocioCasa } from '../utils/mapIcons';

const DISTRITOS_LIMA = [
  { nombre: 'Cercado de Lima', lat: -12.046374, lng: -77.042793 },
  { nombre: 'San Juan de Lurigancho', lat: -12.001200, lng: -77.012300 },
  { nombre: 'Los Olivos', lat: -11.989200, lng: -77.072100 },
  { nombre: 'Miraflores', lat: -12.128900, lng: -77.014500 },
  { nombre: 'San Juan de Miraflores', lat: -12.162300, lng: -76.968900 },
  { nombre: 'Rímac', lat: -12.038900, lng: -77.028900 },
  { nombre: 'Ate Vitarte', lat: -12.056700, lng: -76.978900 },
  { nombre: 'Callao', lat: -12.034500, lng: -77.112300 },
  { nombre: 'San Isidro', lat: -12.098700, lng: -77.034500 },
  { nombre: 'Surco', lat: -12.145600, lng: -76.989000 },
  { nombre: 'Villa El Salvador', lat: -12.214500, lng: -76.934100 },
  { nombre: 'Independencia', lat: -11.995000, lng: -77.054000 }
];

export function ClientesView() {
  const navigate = useNavigate();
  const [clientes, setClientes] = useState<Cliente[]>(() => {
    try {
      const local = localStorage.getItem('ecologistica_clientes_v1');
      if (local) {
        const parsed = JSON.parse(local);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const tieneSanJose = parsed.some(c => 
            (c.razon_social && c.razon_social.toLowerCase().includes('bodega san jos')) ||
            (c.email && c.email.toLowerCase().includes('sanjose'))
          );
          if (!tieneSanJose && MOCK_CLIENTES_DEFAULT.length > 0) {
            return [MOCK_CLIENTES_DEFAULT[0], ...parsed];
          }
          return parsed;
        }
      }
    } catch {}
    return MOCK_CLIENTES_DEFAULT;
  });
  const [cargando, setCargando] = useState(false);
  const [vistaSubTab, setVistaSubTab] = useState<'lista' | 'mapa'>('lista');

  // Filtros y Búsqueda
  const [filtroTipo, setFiltroTipo] = useState<string>('TODOS');
  const [filtroEstado, setFiltroEstado] = useState<string>('TODOS');
  const [busqueda, setBusqueda] = useState<string>('');

  // Formulario de Alta
  const [tipoDocumento, setTipoDocumento] = useState<'RUC' | 'DNI' | 'CE'>('RUC');
  const [numeroDocumento, setNumeroDocumento] = useState('');
  const [razonSocial, setRazonSocial] = useState('');
  const [nombreContacto, setNombreContacto] = useState('');
  const [telefono, setTelefono] = useState('');
  const [email, setEmail] = useState('');
  const [direccion, setDireccion] = useState('');
  const [distrito, setDistrito] = useState('San Juan de Lurigancho');
  const [latitud, setLatitud] = useState<number>(-12.001200);
  const [longitud, setLongitud] = useState<number>(-77.012300);
  const [tipoComercio, setTipoComercio] = useState<TipoComercio>('BODEGA');
  const [ventanaInicio, setVentanaInicio] = useState('08:00');
  const [ventanaFin, setVentanaFin] = useState('14:00');
  const [restriccionAcceso, setRestriccionAcceso] = useState('LIBRE_ACCESO');

  // Modal de Edición
  const [editingCliente, setEditingCliente] = useState<Cliente | null>(null);
  const [editRazonSocial, setEditRazonSocial] = useState('');
  const [editContacto, setEditContacto] = useState('');
  const [editTelefono, setEditTelefono] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editDireccion, setEditDireccion] = useState('');
  const [editDistrito, setEditDistrito] = useState('');
  const [editLatitud, setEditLatitud] = useState<number>(-12.046374);
  const [editLongitud, setEditLongitud] = useState<number>(-77.042793);
  const [editTipoComercio, setEditTipoComercio] = useState<TipoComercio>('BODEGA');
  const [editVentanaInicio, setEditVentanaInicio] = useState('08:00');
  const [editVentanaFin, setEditVentanaFin] = useState('18:00');
  const [editRestriccion, setEditRestriccion] = useState('LIBRE_ACCESO');
  const [editEstado, setEditEstado] = useState<'ACTIVO' | 'INACTIVO'>('ACTIVO');

  // Cliente enfocado en Mapa
  const [clienteEnfocado, setClienteEnfocado] = useState<Cliente | null>(null);

  // Notificaciones Toast Apple
  const [alerta, setAlerta] = useState<string | null>(null);
  const [mensajeExito, setMensajeExito] = useState<string | null>(null);

  // Referencias de Leaflet
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);

  useEffect(() => {
    cargarClientes();
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

  // Referencias para el Selector de Mapa del Formulario
  const formMapContainerRef = useRef<HTMLDivElement | null>(null);
  const formMapInstanceRef = useRef<L.Map | null>(null);
  const formMarkerRef = useRef<L.Marker | null>(null);
  const [mapaFormularioExpandido, setMapaFormularioExpandido] = useState(true);

  // Centrar y sincronizar el mapa del formulario
  const centrarMapaFormulario = (newLat: number, newLng: number) => {
    if (formMapInstanceRef.current && formMarkerRef.current) {
      formMarkerRef.current.setLatLng([newLat, newLng]);
      formMapInstanceRef.current.flyTo([newLat, newLng], 15, { duration: 0.6 });
      formMarkerRef.current.openPopup();
    }
  };

  // Obtener geolocalización actual del navegador
  const obtenerUbicacionGPS = () => {
    if (!navigator.geolocation) {
      setAlerta('La geolocalización GPS no está disponible en este navegador.');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const latRed = Number(pos.coords.latitude.toFixed(6));
        const lngRed = Number(pos.coords.longitude.toFixed(6));
        setLatitud(latRed);
        setLongitud(lngRed);
        centrarMapaFormulario(latRed, lngRed);

        const nearest = DISTRITOS_LIMA.reduce((prev, curr) => {
          const dPrev = Math.hypot(prev.lat - latRed, prev.lng - lngRed);
          const dCurr = Math.hypot(curr.lat - latRed, curr.lng - lngRed);
          return dCurr < dPrev ? curr : prev;
        }, DISTRITOS_LIMA[0]);
        if (nearest) setDistrito(nearest.nombre);

        setMensajeExito(`Ubicación GPS fijada en [${latRed}, ${lngRed}] (${nearest?.nombre || 'Lima'}).`);
      },
      () => {
        setAlerta('No se pudo acceder al GPS del dispositivo. Por favor haz clic directamente en el mapa para fijar tu ubicación.');
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  // Actualizar coordenadas GPS al cambiar el distrito en el formulario
  const handleCambioDistrito = (dNombre: string) => {
    setDistrito(dNombre);
    const dFound = DISTRITOS_LIMA.find(d => d.nombre === dNombre);
    if (dFound) {
      setLatitud(dFound.lat);
      setLongitud(dFound.lng);
      centrarMapaFormulario(dFound.lat, dFound.lng);
    }
  };

  // Inicializar y sincronizar el mapa selector de ubicación del formulario
  useEffect(() => {
    if (vistaSubTab !== 'lista' || !mapaFormularioExpandido) {
      if (formMapInstanceRef.current) {
        formMapInstanceRef.current.remove();
        formMapInstanceRef.current = null;
        formMarkerRef.current = null;
      }
      return;
    }

    const timer = setTimeout(() => {
      if (!formMapContainerRef.current) return;

      if (!formMapInstanceRef.current) {
        const map = L.map(formMapContainerRef.current, {
          center: [latitud, longitud],
          zoom: 14,
          zoomControl: false,
          scrollWheelZoom: true
        });

        L.control.zoom({ position: 'bottomright' }).addTo(map);

        L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19,
          attribution: '&copy; OpenStreetMap'
        }).addTo(map);

        const markerIcon = crearIconoNegocioCasa('Casa / Negocio');
        const marker = L.marker([latitud, longitud], {
          icon: markerIcon,
          draggable: true
        }).addTo(map);

        marker.bindPopup(`
          <div style="font-family:-apple-system,BlinkMacSystemFont,sans-serif;padding:3px;min-width:180px;">
            <div style="font-weight:700;color:#556B2F;font-size:0.85rem;margin-bottom:2px;">Casa / Negocio</div>
            <div style="font-size:0.75rem;color:#2D3A2E;">[${latitud.toFixed(6)}, ${longitud.toFixed(6)}]</div>
            <div style="font-size:0.72rem;color:#6E7E5A;margin-top:2px;">Arrastra o haz clic para reubicar</div>
          </div>
        `);

        const sincronizarPunto = (lat: number, lng: number) => {
          const latFija = Number(lat.toFixed(6));
          const lngFija = Number(lng.toFixed(6));
          setLatitud(latFija);
          setLongitud(lngFija);

          // Detectar automáticamente el distrito más cercano en Lima
          const nearest = DISTRITOS_LIMA.reduce((prev, curr) => {
            const dPrev = Math.hypot(prev.lat - latFija, prev.lng - lngFija);
            const dCurr = Math.hypot(curr.lat - latFija, curr.lng - lngFija);
            return dCurr < dPrev ? curr : prev;
          }, DISTRITOS_LIMA[0]);
          if (nearest) setDistrito(nearest.nombre);

          marker.setPopupContent(`
            <div style="font-family:-apple-system,BlinkMacSystemFont,sans-serif;padding:3px;min-width:180px;">
              <div style="font-weight:700;color:#556B2F;font-size:0.85rem;margin-bottom:2px;">Casa / Negocio</div>
              <div style="font-size:0.75rem;color:#2D3A2E;">[${latFija}, ${lngFija}]</div>
              <div style="font-size:0.72rem;color:#6E7E5A;margin-top:2px;">Distrito detectado: ${nearest ? nearest.nombre : 'Lima'}</div>
            </div>
          `);
        };

        map.on('click', (e: L.LeafletMouseEvent) => {
          marker.setLatLng(e.latlng);
          sincronizarPunto(e.latlng.lat, e.latlng.lng);
          marker.openPopup();
        });

        marker.on('dragend', (e: any) => {
          const pos = e.target.getLatLng();
          sincronizarPunto(pos.lat, pos.lng);
          marker.openPopup();
        });

        formMapInstanceRef.current = map;
        formMarkerRef.current = marker;
      } else {
        formMapInstanceRef.current.invalidateSize();
      }
    }, 120);

    return () => {
      clearTimeout(timer);
    };
  }, [vistaSubTab, mapaFormularioExpandido]);

  // Limpiar mapa del formulario al desmontar
  useEffect(() => {
    return () => {
      if (formMapInstanceRef.current) {
        formMapInstanceRef.current.remove();
        formMapInstanceRef.current = null;
        formMarkerRef.current = null;
      }
    };
  }, []);

  const cargarClientes = async () => {
    setCargando(true);
    try {
      const data = await ClienteService.getAll();
      if (data && data.length > 0) {
        setClientes(data);
      } else {
        setClientes(MOCK_CLIENTES_DEFAULT);
      }
    } catch (e) {
      console.warn('Error al cargar clientes:', e);
      setClientes(prev => prev.length > 0 ? prev : MOCK_CLIENTES_DEFAULT);
    } finally {
      setCargando(false);
    }
  };

  // Mapa de Clientes en Leaflet
  useEffect(() => {
    if (vistaSubTab !== 'mapa') return;

    const timer = setTimeout(() => {
      if (!mapContainerRef.current) return;

      if (!mapInstanceRef.current) {
        const map = L.map(mapContainerRef.current, {
          center: [-12.046374, -77.042793],
          zoom: 12,
          zoomControl: false,
          scrollWheelZoom: true
        });

        L.control.zoom({ position: 'bottomright' }).addTo(map);

        L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19,
          attribution: '&copy; OpenStreetMap'
        }).addTo(map);

        const markers = L.layerGroup().addTo(map);
        markersLayerRef.current = markers;

        mapInstanceRef.current = map;
      }

      if (markersLayerRef.current) {
        markersLayerRef.current.clearLayers();

        clientes.forEach(c => {
          if (c.latitud && c.longitud) {
            const isSelected = clienteEnfocado?.cliente_id === c.cliente_id;
            const markerColor = c.tipo_comercio === 'BODEGA' ? '#556B2F' 
              : c.tipo_comercio === 'SUPERMERCADO' ? '#C47D2B'
              : c.tipo_comercio === 'FARMACIA' ? '#2D3A2E'
              : '#3C4A3F';

            const marker = L.marker([c.latitud, c.longitud], {
              icon: L.divIcon({
                className: 'custom-client-marker',
                html: `
                  <div style="
                    display:flex;
                    flex-direction:column;
                    align-items:center;
                    cursor:pointer;
                    transform:${isSelected ? 'scale(1.2)' : 'scale(1)'};
                    transition:transform 0.2s ease;
                  ">
                    <div style="
                      width:34px;
                      height:34px;
                      border-radius:50%;
                      background:#FFFFFF;
                      border:2.5px solid ${markerColor};
                      box-shadow:0 3px 8px rgba(45,58,46,0.3);
                      display:flex;
                      align-items:center;
                      justifyContent:center;
                    ">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M3 21h18M3 7v1a3 3 0 0 0 6 0V7m0 1a3 3 0 0 0 6 0V7m0 1a3 3 0 0 0 6 0V7M4 7l2-4h12l2 4M5 21V10.85M19 21V10.85" stroke="${markerColor}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                      </svg>
                    </div>
                    <div style="
                      margin-top:2px;
                      background:#2D3A2E;
                      color:#F5F4EE;
                      font-size:0.65rem;
                      font-weight:700;
                      padding:1px 6px;
                      border-radius:6px;
                      border:1px solid #CAD3BD;
                      white-space:nowrap;
                      box-shadow:0 2px 4px rgba(0,0,0,0.25);
                    ">
                      ${c.razon_social.split('·')[0].split('S.A')[0].trim()}
                    </div>
                  </div>
                `,
                iconSize: [36, 48],
                iconAnchor: [18, 44],
                popupAnchor: [0, -42]
              })
            });

            marker.bindPopup(`
              <div style="font-family:-apple-system,BlinkMacSystemFont,sans-serif;min-width:230px;padding:4px;">
                <div style="font-size:0.72rem;font-weight:700;color:#556B2F;text-transform:uppercase;margin-bottom:2px;">
                  ${c.tipo_comercio} · ${c.distrito}
                </div>
                <div style="font-size:0.92rem;font-weight:700;color:#2D3A2E;margin-bottom:2px;">
                  ${c.razon_social}
                </div>
                <div style="font-size:0.75rem;color:#6E7E5A;margin-bottom:4px;">
                  <strong>${c.tipo_documento}:</strong> ${c.numero_documento}
                </div>
                <div style="font-size:0.75rem;color:#2D3A2E;margin-bottom:6px;">
                  Dirección: ${c.direccion}
                </div>
                <div style="display:flex;gap:4px;font-size:0.7rem;margin-bottom:6px;">
                  <span style="background:#F5F4EE;border:1px solid #CAD3BD;padding:2px 6px;border-radius:4px;color:#2D3A2E;">Horario: ${c.ventana_entrega_inicio} - ${c.ventana_entrega_fin}</span>
                  <span style="background:#F5F4EE;border:1px solid #CAD3BD;padding:2px 6px;border-radius:4px;color:#556B2F;">${c.restriccion_acceso}</span>
                </div>
                <div style="font-size:0.72rem;color:#556B2F;font-weight:600;margin-bottom:6px;">
                  Teléfono: ${c.telefono} ${c.nombre_contacto ? `(${c.nombre_contacto})` : ''}
                </div>
              </div>
            `);

            marker.on('click', () => {
              setClienteEnfocado(c);
            });

            marker.addTo(markersLayerRef.current!);
          }
        });

        if (clienteEnfocado && mapInstanceRef.current) {
          mapInstanceRef.current.setView([clienteEnfocado.latitud, clienteEnfocado.longitud], 15, { animate: true });
        }
      }

      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize();
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [vistaSubTab, clientes, clienteEnfocado]);

  // Manejador de Registro de Cliente
  const handleCrear = async (e: React.FormEvent) => {
    e.preventDefault();
    setAlerta(null);
    setMensajeExito(null);

    const docLimpio = numeroDocumento.trim();
    if (tipoDocumento === 'RUC' && (!/^\d{11}$/.test(docLimpio))) {
      setAlerta('El RUC debe contener exactamente 11 dígitos numéricos.');
      return;
    }
    if (tipoDocumento === 'DNI' && (!/^\d{8}$/.test(docLimpio))) {
      setAlerta('El DNI debe contener exactamente 8 dígitos numéricos.');
      return;
    }

    if (clientes.some(c => c.numero_documento === docLimpio)) {
      setAlerta(`El documento '${docLimpio}' ya se encuentra registrado.`);
      return;
    }

    const payload: ClienteCreatePayload = {
      tipo_documento: tipoDocumento,
      numero_documento: docLimpio,
      razon_social: razonSocial.trim(),
      nombre_contacto: nombreContacto.trim() || undefined,
      telefono: telefono.trim(),
      email: email.trim().toLowerCase() || undefined,
      direccion: direccion.trim(),
      distrito: distrito.trim(),
      latitud: Number(latitud),
      longitud: Number(longitud),
      tipo_comercio: tipoComercio,
      ventana_entrega_inicio: ventanaInicio,
      ventana_entrega_fin: ventanaFin,
      restriccion_acceso: restriccionAcceso,
      estado: 'ACTIVO'
    };

    try {
      const creado = await ClienteService.create(payload);
      setClientes(prev => [creado, ...prev]);
      setMensajeExito(`Cliente '${payload.razon_social}' registrado exitosamente con geolocalización.`);

      // Sincronizar creación de cuenta institucional en Administración (Rol: CLIENTE)
      if (payload.email) {
        try {
          await UsuarioService.create({
            email: payload.email.toLowerCase().trim(),
            nombre_completo: `${payload.razon_social.trim()} (Cliente B2B)`,
            telefono: payload.telefono.trim(),
            rol: 'CLIENTE',
            password: 'ecologistica2026',
            permisos: ['TRACKING_CLIENTE'],
            estado: 'ACTIVO'
          });
        } catch (syncUserErr) {
          console.warn('Sync usuario para cliente:', syncUserErr);
        }
      }

      // Limpiar formulario
      setNumeroDocumento('');
      setRazonSocial('');
      setNombreContacto('');
      setTelefono('');
      setEmail('');
      setDireccion('');
    } catch (err: any) {
      setAlerta(err.message || 'Error al registrar el cliente.');
    }
  };

  // Abrir Modal de Edición
  const abrirEdicion = (c: Cliente) => {
    setEditingCliente(c);
    setEditRazonSocial(c.razon_social);
    setEditContacto(c.nombre_contacto || '');
    setEditTelefono(c.telefono);
    setEditEmail(c.email || '');
    setEditDireccion(c.direccion);
    setEditDistrito(c.distrito);
    setEditLatitud(c.latitud);
    setEditLongitud(c.longitud);
    setEditTipoComercio(c.tipo_comercio);
    setEditVentanaInicio(c.ventana_entrega_inicio);
    setEditVentanaFin(c.ventana_entrega_fin);
    setEditRestriccion(c.restriccion_acceso);
    setEditEstado(c.estado);
  };

  const handleGuardarEdicion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCliente) return;

    const payload: ClienteUpdatePayload = {
      razon_social: editRazonSocial.trim(),
      nombre_contacto: editContacto.trim() || undefined,
      telefono: editTelefono.trim(),
      email: editEmail.trim().toLowerCase() || undefined,
      direccion: editDireccion.trim(),
      distrito: editDistrito.trim(),
      latitud: Number(editLatitud),
      longitud: Number(editLongitud),
      tipo_comercio: editTipoComercio,
      ventana_entrega_inicio: editVentanaInicio,
      ventana_entrega_fin: editVentanaFin,
      restriccion_acceso: editRestriccion,
      estado: editEstado
    };

    try {
      const actualizado = await ClienteService.update(editingCliente.cliente_id, payload);
      setClientes(prev => prev.map(item => item.cliente_id === editingCliente.cliente_id ? actualizado : item));
      setEditingCliente(null);
      setMensajeExito(`Datos del cliente '${editRazonSocial}' actualizados.`);

      // Sincronizar cambios en la cuenta de usuario de Administración si existe
      if (editingCliente.email || payload.email) {
        try {
          const usuarios = await UsuarioService.getAll('CLIENTE');
          const target = usuarios.find(u => 
            u.usuario_id === editingCliente.cliente_id || 
            (editingCliente.email && u.email.toLowerCase() === editingCliente.email.toLowerCase()) ||
            (payload.email && u.email.toLowerCase() === payload.email.toLowerCase())
          );
          if (target) {
            await UsuarioService.update(target.usuario_id, {
              nombre_completo: payload.razon_social,
              telefono: payload.telefono,
              estado: payload.estado
            });
          }
        } catch {}
      }
    } catch (err: any) {
      setAlerta(err.message || 'Error al actualizar cliente.');
    }
  };

  const handleBajaLogica = async (c: Cliente) => {
    const nuevoEstado = c.estado === 'ACTIVO' ? 'INACTIVO' : 'ACTIVO';
    if (!window.confirm(`¿Seguro que deseas cambiar el estado de '${c.razon_social}' a ${nuevoEstado}?`)) return;

    try {
      await ClienteService.update(c.cliente_id, { estado: nuevoEstado });
      setClientes(prev => prev.map(item => item.cliente_id === c.cliente_id ? { ...item, estado: nuevoEstado } : item));
      setMensajeExito(`Cliente '${c.razon_social}' marcado como ${nuevoEstado}.`);

      // Sincronizar estado con la cuenta de Administración
      if (c.email) {
        try {
          const usuarios = await UsuarioService.getAll('CLIENTE');
          const target = usuarios.find(u => 
            u.usuario_id === c.cliente_id || 
            (c.email && u.email.toLowerCase() === c.email.toLowerCase())
          );
          if (target) {
            await UsuarioService.update(target.usuario_id, { estado: nuevoEstado });
          }
        } catch {}
      }
    } catch {
      setAlerta('Error al cambiar estado.');
    }
  };

  const enfocarEnMapa = (c: Cliente) => {
    setClienteEnfocado(c);
    setVistaSubTab('mapa');
    setTimeout(() => {
      if (mapInstanceRef.current && c.latitud && c.longitud) {
        mapInstanceRef.current.setView([c.latitud, c.longitud], 15, { animate: true });
      }
    }, 200);
  };

  // Filtrado de la lista
  const clientesFiltrados = clientes.filter(c => {
    if (filtroTipo !== 'TODOS' && c.tipo_comercio !== filtroTipo) return false;
    if (filtroEstado !== 'TODOS' && c.estado !== filtroEstado) return false;
    if (busqueda.trim()) {
      const q = busqueda.toLowerCase().trim();
      const matchDoc = (c.numero_documento || '').toLowerCase().includes(q);
      const matchRazon = (c.razon_social || '').toLowerCase().includes(q);
      const matchContacto = (c.nombre_contacto || '').toLowerCase().includes(q);
      const matchDistrito = (c.distrito || '').toLowerCase().includes(q);
      return matchDoc || matchRazon || matchContacto || matchDistrito;
    }
    return true;
  });

  const distritosUnicos = new Set(clientes.map(c => c.distrito)).size;
  const clientesActivos = clientes.filter(c => c.estado === 'ACTIVO').length;

  return (
    <div>
      {/* Encabezado Apple */}
      <div className="header-title">
        <div>
          <h1>Gestión de Clientes y Comercios</h1>
          <p>Directorio B2B, geocodificación GPS de puntos de entrega y ventanas horarias de recepción en Lima</p>
        </div>
        <button 
          className="btn btn-secondary" 
          onClick={cargarClientes} 
          disabled={cargando}
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
        >
          <RefreshCw size={14} className={cargando ? 'spin' : ''} />
          <span>Actualizar</span>
        </button>
      </div>

      {/* Notificaciones Toasts */}
      {(alerta || mensajeExito) && (
        <div className="apple-toast-container">
          {mensajeExito && (
            <div className="apple-toast apple-toast-success">
              <CheckCircle2 size={18} className="toast-icon" />
              <div className="apple-toast-content">
                <div className="apple-toast-title">Operación Exitosa</div>
                <div className="apple-toast-message">{mensajeExito}</div>
              </div>
              <button className="apple-toast-close" onClick={() => setMensajeExito(null)}>
                <X size={14} />
              </button>
            </div>
          )}

          {alerta && (
            <div className="apple-toast apple-toast-error">
              <ShieldAlert size={18} className="toast-icon" />
              <div className="apple-toast-content">
                <div className="apple-toast-title">Validación de Datos</div>
                <div className="apple-toast-message">{alerta}</div>
              </div>
              <button className="apple-toast-close" onClick={() => setAlerta(null)}>
                <X size={14} />
              </button>
            </div>
          )}
        </div>
      )}

      {/* Segmented Control de Pestañas Apple */}
      <div style={{
        display: 'inline-flex',
        background: '#EAE8DF',
        padding: '4px',
        borderRadius: '12px',
        border: '1px solid #CAD3BD',
        marginBottom: '1.5rem',
        gap: '4px'
      }}>
        <button
          type="button"
          onClick={() => setVistaSubTab('lista')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.55rem 1.2rem',
            borderRadius: '9px',
            fontSize: '0.86rem',
            fontWeight: 700,
            border: 'none',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            background: vistaSubTab === 'lista' ? '#556B2F' : 'transparent',
            color: vistaSubTab === 'lista' ? '#FFFFFF' : '#2D3A2E',
            boxShadow: vistaSubTab === 'lista' ? '0 2px 8px rgba(45, 58, 46, 0.25)' : 'none'
          }}
        >
          <Users size={15} />
          <span>Padrón & Directorio de Clientes</span>
        </button>

        <button
          type="button"
          onClick={() => setVistaSubTab('mapa')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.55rem 1.2rem',
            borderRadius: '9px',
            fontSize: '0.86rem',
            fontWeight: 700,
            border: 'none',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            background: vistaSubTab === 'mapa' ? '#556B2F' : 'transparent',
            color: vistaSubTab === 'mapa' ? '#FFFFFF' : '#2D3A2E',
            boxShadow: vistaSubTab === 'mapa' ? '0 2px 8px rgba(45, 58, 46, 0.25)' : 'none'
          }}
        >
          <Navigation size={15} />
          <span>Mapa de Puntos de Entrega ({clientes.length})</span>
        </button>
      </div>

      {/* PESTAÑA 1: PADRÓN Y REGISTRO DE CLIENTES */}
      {vistaSubTab === 'lista' && (
        <>
          {/* Formulario de Alta de Cliente */}
          <div className="card" style={{ marginBottom: '1.75rem' }}>
            <h3 style={{ marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Plus size={18} color="var(--apple-accent)" /> Registro de Nuevo Comercio o Cliente B2B
            </h3>

            <form onSubmit={handleCrear}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '0.35rem', color: 'var(--apple-text-secondary)' }}>
                    Tipo de Documento:
                  </label>
                  <select
                    value={tipoDocumento}
                    onChange={e => setTipoDocumento(e.target.value as any)}
                    style={{ width: '100%' }}
                  >
                    <option value="RUC">RUC (11 dígitos - Empresas)</option>
                    <option value="DNI">DNI (8 dígitos - Personas)</option>
                    <option value="CE">Carnet de Extranjería</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '0.35rem', color: 'var(--apple-text-secondary)' }}>
                    N° Documento:
                  </label>
                  <input
                    type="text"
                    required
                    placeholder={tipoDocumento === 'RUC' ? 'Ej. 20548962311' : 'Ej. 71234567'}
                    value={numeroDocumento}
                    onChange={e => setNumeroDocumento(e.target.value.replace(/\D/g, ''))}
                    style={{ width: '100%', fontVariantNumeric: 'tabular-nums' }}
                  />
                </div>

                <div style={{ gridColumn: 'span 2' }}>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '0.35rem', color: 'var(--apple-text-secondary)' }}>
                    Razón Social / Nombre Comercial:
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Bodega San José S.A.C."
                    value={razonSocial}
                    onChange={e => setRazonSocial(e.target.value)}
                    style={{ width: '100%' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '0.35rem', color: 'var(--apple-text-secondary)' }}>
                    Tipo de Comercio:
                  </label>
                  <select
                    value={tipoComercio}
                    onChange={e => setTipoComercio(e.target.value as any)}
                    style={{ width: '100%' }}
                  >
                    <option value="BODEGA">Bodega</option>
                    <option value="SUPERMERCADO">Supermercado / Minimarket</option>
                    <option value="DISTRIBUIDORA">Distribuidora Mayorista</option>
                    <option value="FARMACIA">Farmacia / Botica</option>
                    <option value="RESTAURANTE">Restaurante / Hostelería</option>
                    <option value="PARTICULAR">Particular / Residencial</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '0.35rem', color: 'var(--apple-text-secondary)' }}>
                    Contacto / Encargado:
                  </label>
                  <input
                    type="text"
                    placeholder="Ej. José María Quispe"
                    value={nombreContacto}
                    onChange={e => setNombreContacto(e.target.value)}
                    style={{ width: '100%' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '0.35rem', color: 'var(--apple-text-secondary)' }}>
                    Teléfono Móvil:
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. 987654321"
                    value={telefono}
                    onChange={e => setTelefono(e.target.value)}
                    style={{ width: '100%' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '0.35rem', color: 'var(--apple-text-secondary)' }}>
                    Correo Electrónico:
                  </label>
                  <input
                    type="email"
                    placeholder="Ej. contacto@bodegasanjose.pe"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    style={{ width: '100%' }}
                  />
                </div>
              </div>

              {/* Geolocalización y Dirección con Selector Interactivo en Mapa */}
              <div style={{ 
                padding: '1.15rem', 
                backgroundColor: '#F7F6F1', 
                borderRadius: '12px', 
                marginBottom: '1.25rem', 
                border: '1.5px solid #CAD3BD',
                boxShadow: '0 2px 8px rgba(45, 58, 46, 0.04)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.85rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <div style={{ fontSize: '0.86rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.45rem', color: '#2D3A2E' }}>
                    <MapPin size={16} color="#556B2F" />
                    <span>Ubicación Geográfica de Entrega en Lima Metropolitana</span>
                    <span style={{ fontSize: '0.7rem', padding: '0.15rem 0.45rem', background: '#EBF1E6', border: '1px solid #CAD3BD', borderRadius: '6px', color: '#556B2F', fontWeight: 600 }}>
                      Selector en Mapa Activo
                    </span>
                  </div>

                  <div style={{ display: 'flex', gap: '0.45rem', alignItems: 'center', flexWrap: 'wrap' }}>
                    <button
                      type="button"
                      onClick={obtenerUbicacionGPS}
                      className="btn-secondary"
                      style={{ 
                        fontSize: '0.72rem', 
                        padding: '0.25rem 0.6rem', 
                        background: '#FFFFFF', 
                        borderColor: '#CAD3BD',
                        color: '#2D3A2E',
                        fontWeight: 600,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.35rem'
                      }}
                      title="Usar coordenadas GPS actuales de tu dispositivo"
                    >
                      <Crosshair size={13} color="#556B2F" />
                      <span>Mi Ubicación GPS</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleCambioDistrito(distrito)}
                      className="btn-secondary"
                      style={{ 
                        fontSize: '0.72rem', 
                        padding: '0.25rem 0.6rem', 
                        background: '#FFFFFF', 
                        borderColor: '#CAD3BD',
                        color: '#2D3A2E',
                        fontWeight: 600,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.35rem'
                      }}
                      title="Centrar mapa en el distrito seleccionado"
                    >
                      <Compass size={13} color="#556B2F" />
                      <span>Centrar en Distrito</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setMapaFormularioExpandido(!mapaFormularioExpandido);
                        if (!mapaFormularioExpandido && formMapInstanceRef.current) {
                          setTimeout(() => formMapInstanceRef.current?.invalidateSize(), 200);
                        }
                      }}
                      className="btn-secondary"
                      style={{ 
                        fontSize: '0.72rem', 
                        padding: '0.25rem 0.6rem', 
                        background: '#FFFFFF', 
                        borderColor: '#CAD3BD' 
                      }}
                    >
                      <span>{mapaFormularioExpandido ? 'Ocultar Mapa' : 'Ver Mapa'}</span>
                    </button>
                  </div>
                </div>

                {/* Campos de texto y coordenadas */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.85rem', marginBottom: mapaFormularioExpandido ? '0.85rem' : '0' }}>
                  <div style={{ gridColumn: 'span 2' }}>
                    <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--apple-text-secondary)', display: 'block', marginBottom: '0.25rem' }}>
                      Dirección de Destino:
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ej. Av. Canto Grande 2450"
                      value={direccion}
                      onChange={e => setDireccion(e.target.value)}
                      style={{ width: '100%', fontSize: '0.85rem' }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--apple-text-secondary)', display: 'block', marginBottom: '0.25rem' }}>
                      Distrito de Lima:
                    </label>
                    <select
                      value={distrito}
                      onChange={e => handleCambioDistrito(e.target.value)}
                      style={{ width: '100%', fontSize: '0.85rem' }}
                    >
                      {DISTRITOS_LIMA.map(d => (
                        <option key={d.nombre} value={d.nombre}>{d.nombre}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--apple-text-secondary)', display: 'block', marginBottom: '0.25rem' }}>
                      Latitud GPS:
                    </label>
                    <input
                      type="number"
                      step="0.000001"
                      required
                      value={latitud}
                      onChange={e => {
                        const val = Number(e.target.value);
                        setLatitud(val);
                        if (!isNaN(val) && formMapInstanceRef.current && formMarkerRef.current) {
                          formMarkerRef.current.setLatLng([val, longitud]);
                          formMapInstanceRef.current.panTo([val, longitud]);
                        }
                      }}
                      style={{ width: '100%', fontSize: '0.85rem' }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--apple-text-secondary)', display: 'block', marginBottom: '0.25rem' }}>
                      Longitud GPS:
                    </label>
                    <input
                      type="number"
                      step="0.000001"
                      required
                      value={longitud}
                      onChange={e => {
                        const val = Number(e.target.value);
                        setLongitud(val);
                        if (!isNaN(val) && formMapInstanceRef.current && formMarkerRef.current) {
                          formMarkerRef.current.setLatLng([latitud, val]);
                          formMapInstanceRef.current.panTo([latitud, val]);
                        }
                      }}
                      style={{ width: '100%', fontSize: '0.85rem' }}
                    />
                  </div>
                </div>

                {/* Lienzo del Mapa Interactivo para Seleccionar Ubicación */}
                {mapaFormularioExpandido && (
                  <div style={{ position: 'relative', marginTop: '0.5rem' }}>
                    {/* Barra de Instrucciones Superior */}
                    <div style={{ 
                      position: 'absolute', 
                      top: '10px', 
                      left: '10px', 
                      zIndex: 1000, 
                      background: 'rgba(45, 58, 46, 0.92)', 
                      color: '#F5F4EE', 
                      padding: '4px 10px', 
                      borderRadius: '8px', 
                      fontSize: '0.72rem', 
                      fontWeight: 600,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px',
                      boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
                      backdropFilter: 'blur(4px)'
                    }}>
                      <Navigation size={12} color="#FEE11A" />
                      <span>Haz clic en el mapa o arrastra el marcador para fijar la casa o negocio</span>
                    </div>

                    {/* Contenedor del Mapa Leaflet */}
                    <div 
                      ref={formMapContainerRef} 
                      style={{ 
                        height: '290px', 
                        width: '100%', 
                        borderRadius: '10px', 
                        border: '1.5px solid #CAD3BD', 
                        overflow: 'hidden',
                        boxShadow: '0 4px 12px rgba(45, 58, 46, 0.08)'
                      }} 
                    />

                    {/* Barra de Estado Inferior */}
                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center', 
                      marginTop: '0.45rem', 
                      fontSize: '0.72rem', 
                      color: '#6E7E5A',
                      padding: '0 0.2rem',
                      flexWrap: 'wrap',
                      gap: '0.5rem'
                    }}>
                      <span>
                        Punto seleccionado: <strong style={{ color: '#2D3A2E' }}>[{latitud.toFixed(6)}, {longitud.toFixed(6)}]</strong>
                      </span>
                      <span>
                        Distrito detectado: <strong style={{ color: '#556B2F' }}>{distrito}</strong>
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Ventanas Horarias y Restricciones */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.85rem', marginBottom: '1.25rem' }}>
                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: 600, display: 'block', marginBottom: '0.25rem', color: 'var(--apple-text-secondary)' }}>
                    Recepción Desde:
                  </label>
                  <input
                    type="time"
                    value={ventanaInicio}
                    onChange={e => setVentanaInicio(e.target.value)}
                    style={{ width: '100%' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: 600, display: 'block', marginBottom: '0.25rem', color: 'var(--apple-text-secondary)' }}>
                    Recepción Hasta:
                  </label>
                  <input
                    type="time"
                    value={ventanaFin}
                    onChange={e => setVentanaFin(e.target.value)}
                    style={{ width: '100%' }}
                  />
                </div>

                <div style={{ gridColumn: 'span 2' }}>
                  <label style={{ fontSize: '0.78rem', fontWeight: 600, display: 'block', marginBottom: '0.25rem', color: 'var(--apple-text-secondary)' }}>
                    Restricción de Acceso Vehicular:
                  </label>
                  <select
                    value={restriccionAcceso}
                    onChange={e => setRestriccionAcceso(e.target.value)}
                    style={{ width: '100%' }}
                  >
                    <option value="LIBRE_ACCESO">Libre Acceso (Todo tipo de vehículo)</option>
                    <option value="SOLO_FURGONETA_LIGERA">Solo furgoneta ligera &lt; 3.5t</option>
                    <option value="ZONA_ESTRECHA_DESCARGA_RAPIDA">Zona estrecha / Descarga rápida</option>
                    <option value="RESTRICCION_HORARIA_MUNICIPAL">Restricción de horario municipal</option>
                    <option value="CENTRO_HISTORICO_RESTRINGIDO">Centro Histórico restringido</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button type="submit" className="btn" style={{ padding: '0.55rem 1.4rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Plus size={16} /> Guardar Cliente B2B
                </button>
              </div>
            </form>
          </div>

          {/* Directorio de Clientes */}
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
              <div>
                <h3>Directorio de Clientes B2B</h3>
                <p style={{ fontSize: '0.75rem', color: 'var(--apple-text-secondary)', marginTop: '0.2rem' }}>
                  Mostrando {clientesFiltrados.length} comercios registrados
                </p>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
                {/* Buscador */}
                <div style={{ position: 'relative', minWidth: '220px' }}>
                  <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#6E7E5A' }} />
                  <input
                    type="text"
                    placeholder="Buscar por RUC, nombre o distrito..."
                    value={busqueda}
                    onChange={e => setBusqueda(e.target.value)}
                    style={{ paddingLeft: '28px', fontSize: '0.8rem', width: '100%', height: '32px' }}
                  />
                </div>

                {/* Filtro por tipo */}
                <select
                  value={filtroTipo}
                  onChange={e => setFiltroTipo(e.target.value)}
                  style={{ fontSize: '0.8rem', height: '32px', padding: '0 8px' }}
                >
                  <option value="TODOS">Todos los Giros</option>
                  <option value="BODEGA">Bodegas</option>
                  <option value="SUPERMERCADO">Supermercados</option>
                  <option value="FARMACIA">Farmacias</option>
                  <option value="DISTRIBUIDORA">Distribuidoras</option>
                  <option value="RESTAURANTE">Restaurantes</option>
                </select>

                {/* Filtro por estado */}
                <select
                  value={filtroEstado}
                  onChange={e => setFiltroEstado(e.target.value)}
                  style={{ fontSize: '0.8rem', height: '32px', padding: '0 8px' }}
                >
                  <option value="TODOS">Todos los Estados</option>
                  <option value="ACTIVO">ACTIVOS</option>
                  <option value="INACTIVO">INACTIVOS</option>
                </select>
              </div>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table>
                <thead>
                  <tr>
                    <th>Comercio / Razón Social</th>
                    <th>Documento</th>
                    <th>Giro Comercial</th>
                    <th>Contacto & Teléfono</th>
                    <th>Ubicación & Distrito</th>
                    <th>Horario de Entrega</th>
                    <th>Estado</th>
                    <th style={{ textAlign: 'right' }}>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {clientesFiltrados.map(c => (
                    <tr key={c.cliente_id}>
                      <td>
                        <div style={{ fontWeight: 700, color: '#2D3A2E' }}>{c.razon_social}</div>
                        {c.email && (
                          <div style={{ fontSize: '0.72rem', color: '#556B2F', display: 'flex', alignItems: 'center', gap: '3px', marginTop: '2px' }}>
                            <Mail size={11} /> {c.email}
                          </div>
                        )}
                      </td>
                      <td>
                        <div><strong>{c.tipo_documento}:</strong> {c.numero_documento}</div>
                      </td>
                      <td>
                        <span className={`badge ${
                          c.tipo_comercio === 'BODEGA' ? 'badge-cyan' :
                          c.tipo_comercio === 'SUPERMERCADO' ? 'badge-yellow' :
                          c.tipo_comercio === 'FARMACIA' ? 'badge-gray' : 'badge-cyan'
                        }`}>
                          {c.tipo_comercio}
                        </span>
                      </td>
                      <td>
                        <div style={{ fontWeight: 600 }}>{c.telefono}</div>
                        {c.nombre_contacto && (
                          <div style={{ fontSize: '0.72rem', color: '#6E7E5A' }}>{c.nombre_contacto}</div>
                        )}
                      </td>
                      <td>
                        <div style={{ fontSize: '0.82rem' }}>{c.direccion}</div>
                        <div style={{ fontSize: '0.72rem', color: '#556B2F', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '2px', marginTop: '2px' }}>
                          <MapPin size={11} /> {c.distrito}
                        </div>
                      </td>
                      <td>
                        <div style={{ fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '3px' }}>
                          <Clock size={12} color="#556B2F" />
                          <span>{c.ventana_entrega_inicio} - {c.ventana_entrega_fin}</span>
                        </div>
                        <div style={{ fontSize: '0.68rem', color: '#6E7E5A', marginTop: '2px' }}>
                          {c.restriccion_acceso}
                        </div>
                      </td>
                      <td>
                        <span className={`badge ${c.estado === 'ACTIVO' ? 'badge-cyan' : 'badge-red'}`}>
                          {c.estado}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '0.4rem' }}>
                          {/* Crear Pedido Directo */}
                          <button
                            className="btn"
                            onClick={() => navigate('/pedidos')}
                            title="Crear Nueva Orden de Reparto para este Cliente"
                            style={{ padding: '0.35rem 0.6rem', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
                          >
                            <PackageCheck size={13} /> Orden
                          </button>

                          {/* Ver en Mapa */}
                          <button
                            className="btn btn-secondary"
                            onClick={() => enfocarEnMapa(c)}
                            title="Ver Ubicación en Mapa de Clientes"
                            style={{ padding: '0.35rem 0.5rem', color: '#556B2F' }}
                          >
                            <Navigation size={13} />
                          </button>

                          {/* Editar */}
                          <button
                            className="btn btn-secondary"
                            onClick={() => abrirEdicion(c)}
                            title="Editar Datos del Cliente"
                            style={{ padding: '0.35rem 0.5rem' }}
                          >
                            <Pencil size={13} />
                          </button>

                          {/* Baja Lógica */}
                          <button
                            className="btn btn-secondary"
                            onClick={() => handleBajaLogica(c)}
                            title={c.estado === 'ACTIVO' ? 'Desactivar Cliente' : 'Reactivar Cliente'}
                            style={{ padding: '0.35rem 0.5rem', color: c.estado === 'ACTIVO' ? 'var(--apple-red-text)' : '#556B2F' }}
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* PESTAÑA 2: MAPA DE PUNTOS DE ENTREGA */}
      {vistaSubTab === 'mapa' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginBottom: '2rem' }}>
          <div className="card" style={{ padding: '1rem 1.25rem', margin: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600, fontSize: '0.9rem', color: '#2D3A2E' }}>
                <Navigation size={18} color="#556B2F" />
                <span>Geolocalización de Clientes & Puntos de Entrega en Lima</span>
              </div>
              <div style={{ fontSize: '0.75rem', color: '#6E7E5A' }}>
                {clientes.length} puntos mapeados en {distritosUnicos} distritos
              </div>
            </div>

            {/* Selector rápido de cliente en el mapa */}
            <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', marginTop: '0.75rem', paddingBottom: '0.35rem' }}>
              {clientes.map(c => {
                const isSelected = clienteEnfocado?.cliente_id === c.cliente_id;
                return (
                  <button
                    key={c.cliente_id}
                    type="button"
                    onClick={() => enfocarEnMapa(c)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.45rem',
                      padding: '0.45rem 0.8rem',
                      borderRadius: '8px',
                      border: isSelected ? '2px solid #556B2F' : '1px solid #CAD3BD',
                      background: isSelected ? '#EBF1E6' : '#FFFFFF',
                      fontSize: '0.78rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    <Store size={14} color="#556B2F" />
                    <span>{c.razon_social.split('·')[0].trim()}</span>
                    <span style={{ fontSize: '0.7rem', color: '#6E7E5A' }}>({c.distrito})</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Lienzo del Mapa Leaflet */}
          <div 
            className="card" 
            style={{ 
              padding: 0, 
              overflow: 'hidden', 
              boxShadow: '0 8px 30px rgba(45, 58, 46, 0.12)',
              border: '1.5px solid #CAD3BD',
              margin: 0
            }}
          >
            <div 
              ref={mapContainerRef} 
              style={{ height: '540px', width: '100%' }} 
            />
          </div>
        </div>
      )}

      {/* Modal de Edición de Cliente */}
      {editingCliente && (
        <div className="apple-modal-overlay modal-overlay" onClick={() => setEditingCliente(null)}>
          <div className="apple-modal modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '580px' }}>
            <div className="modal-header">
              <h2>Editar Cliente: {editingCliente.razon_social}</h2>
              <button 
                className="modal-close modal-close-btn" 
                onClick={() => setEditingCliente(null)}
                title="Cerrar modal"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleGuardarEdicion} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '0.35rem' }}>
                  Razón Social:
                </label>
                <input
                  type="text"
                  required
                  value={editRazonSocial}
                  onChange={e => setEditRazonSocial(e.target.value)}
                  style={{ width: '100%' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '0.35rem' }}>
                    Tipo de Comercio:
                  </label>
                  <select
                    value={editTipoComercio}
                    onChange={e => setEditTipoComercio(e.target.value as any)}
                    style={{ width: '100%' }}
                  >
                    <option value="BODEGA">Bodega</option>
                    <option value="SUPERMERCADO">Supermercado</option>
                    <option value="DISTRIBUIDORA">Distribuidora</option>
                    <option value="FARMACIA">Farmacia</option>
                    <option value="RESTAURANTE">Restaurante</option>
                    <option value="PARTICULAR">Particular</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '0.35rem' }}>
                    Estado Operativo:
                  </label>
                  <select
                    value={editEstado}
                    onChange={e => setEditEstado(e.target.value as any)}
                    style={{ width: '100%' }}
                  >
                    <option value="ACTIVO">ACTIVO</option>
                    <option value="INACTIVO">INACTIVO</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '0.35rem' }}>
                    Contacto:
                  </label>
                  <input
                    type="text"
                    value={editContacto}
                    onChange={e => setEditContacto(e.target.value)}
                    style={{ width: '100%' }}
                  />
                </div>

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
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '0.35rem' }}>
                  Dirección:
                </label>
                <input
                  type="text"
                  required
                  value={editDireccion}
                  onChange={e => setEditDireccion(e.target.value)}
                  style={{ width: '100%' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.85rem' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '0.35rem' }}>
                    Distrito:
                  </label>
                  <input
                    type="text"
                    required
                    value={editDistrito}
                    onChange={e => setEditDistrito(e.target.value)}
                    style={{ width: '100%' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '0.35rem' }}>
                    Latitud GPS:
                  </label>
                  <input
                    type="number"
                    step="0.000001"
                    required
                    value={editLatitud}
                    onChange={e => setEditLatitud(Number(e.target.value))}
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
                    required
                    value={editLongitud}
                    onChange={e => setEditLongitud(Number(e.target.value))}
                    style={{ width: '100%' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '0.35rem' }}>
                    Ventana Inicio:
                  </label>
                  <input
                    type="time"
                    value={editVentanaInicio}
                    onChange={e => setEditVentanaInicio(e.target.value)}
                    style={{ width: '100%' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '0.35rem' }}>
                    Ventana Fin:
                  </label>
                  <input
                    type="time"
                    value={editVentanaFin}
                    onChange={e => setEditVentanaFin(e.target.value)}
                    style={{ width: '100%' }}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setEditingCliente(null)}
                >
                  Cancelar
                </button>
                <button type="submit" className="btn">
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
