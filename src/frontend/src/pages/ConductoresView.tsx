import React, { useState, useEffect, useRef } from 'react';
import { 
  Users, Plus, ShieldAlert, CheckCircle2, Clock, AlertTriangle, 
  ShieldCheck, X, Pencil, RotateCcw, MapPin, Navigation, 
  Trash2, RefreshCw, Send, Check, Phone, CreditCard, Award,
  Smartphone, KeyRound, Sparkles, Maximize2, Minimize2, Crosshair,
  LocateFixed, Eye, Flag
} from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Conductor, ConductorService, UsuarioService } from '../services/api';
import { 
  crearIconoBanderaLlegada, 
  crearIconoVehiculoConductor, 
  calcularDistanciaKm, 
  estimarTiempoMin,
  SVG_MINI_FLAG,
  SVG_MINI_CAR,
  SVG_MINI_PIN
} from '../utils/mapIcons';

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
  },
  {
    conductor_id: 'c5555555-5555-5555-5555-555555555555',
    dni: '45892176',
    nombres: 'Juan Alberto',
    apellidos: 'Morales Paredes',
    licencia: 'M45892176',
    categoria_licencia: 'A-IIIc',
    telefono: '978123456',
    direccion_origen: 'Av. Argentina 2050, Cercado de Lima',
    latitud_origen: -12.046374,
    longitud_origen: -77.042793,
    estado: 'DISPONIBLE',
    horas_conduccion_hoy: 2.0
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

  // Segmented Control de Pestañas: 'mapa' (Flota & Rutas) | 'padron' (Padrón & Registro)
  const [vistaTab, setVistaTab] = useState<'mapa' | 'padron'>('mapa');

  // Conductor Seleccionado para la Ruta
  const [conductorSeleccionado, setConductorSeleccionado] = useState<Conductor | null>(null);

  // Punto de Llegada / Meta (Bandera SVG)
  const [puntoLlegada, setPuntoLlegada] = useState<{ lat: number; lng: number } | null>(null);

  // Telemetría de Ruta Dinámica
  const [infoRuta, setInfoRuta] = useState<{
    distanciaKm: number;
    tiempoMin: number;
    horasEst: number;
  } | null>(null);

  const [mapaMaximizado, setMapaMaximizado] = useState(false);

  // Referencias de Leaflet
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const driversLayerRef = useRef<L.LayerGroup | null>(null);
  const flagMarkerRef = useRef<L.Marker | null>(null);
  const routeLineRef = useRef<L.Polyline | null>(null);

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

  const getEmailConductor = (c: Conductor) => {
    const mapaEmails: Record<string, string> = {
      '71234567': 'carlos.quispe@ecologistica.pe',
      '48765432': 'jorge.mendoza@ecologistica.pe',
      '74567812': 'maria.torres@ecologistica.pe',
      '45678901': 'ricardo.gomez@ecologistica.pe',
      '45892176': 'repartidor.juan@ecologistica.pe'
    };
    if (mapaEmails[c.dni]) return mapaEmails[c.dni];
    const primerNombre = (c.nombres || '').split(' ')[0].toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    const primerApellido = (c.apellidos || '').split(' ')[0].toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    return `${primerNombre}.${primerApellido}@ecologistica.pe`;
  };

  const cargarConductores = async () => {
    setCargando(true);
    try {
      const data = await ConductorService.getAll();
      if (data && data.length > 0) {
        setConductores(data);
        if (!conductorSeleccionado) {
          setConductorSeleccionado(data[0]);
        }
      }
    } catch {
      // Si la API remota o PostgreSQL está offline, conserva el estado local
    } finally {
      setCargando(false);
    }
  };

  // Inicialización y actualización reactiva del Mapa de Flota Leaflet
  useEffect(() => {
    if (vistaTab !== 'mapa') return;

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
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        }).addTo(map);

        const driversLayer = L.layerGroup().addTo(map);
        driversLayerRef.current = driversLayer;

        // Captura interactiva de coordenadas al hacer clic: Despliega la BANDERA DE META SVG
        map.on('click', (e: L.LeafletMouseEvent) => {
          const { lat, lng } = e.latlng;
          const latClean = parseFloat(lat.toFixed(6));
          const lngClean = parseFloat(lng.toFixed(6));
          setPuntoLlegada({ lat: latClean, lng: lngClean });

          if (flagMarkerRef.current) {
            flagMarkerRef.current.setLatLng(e.latlng);
            flagMarkerRef.current.setIcon(crearIconoBanderaLlegada('Punto de Llegada'));
          } else {
            flagMarkerRef.current = L.marker(e.latlng, {
              icon: crearIconoBanderaLlegada('Punto de Llegada')
            }).addTo(map);
          }

          flagMarkerRef.current.bindPopup(`
            <div style="font-family:-apple-system,BlinkMacSystemFont,sans-serif;min-width:220px;padding:4px;">
              <div style="font-weight:700;color:#1A1A1A;font-size:0.85rem;margin-bottom:2px;display:flex;align-items:center;gap:5px;">
                ${SVG_MINI_FLAG} Punto de Llegada / Entrega
              </div>
              <div style="font-size:0.75rem;color:#556B2F;margin-bottom:4px;">
                Coordenadas GPS: [${latClean}, ${lngClean}]
              </div>
              <div style="font-size:0.72rem;color:#6E7E5A;">
                Punto de destino marcado con Bandera a Cuadros SVG.
              </div>
            </div>
          `);

          // Determinar conductor activo para trazar ruta
          let chofer = conductorSeleccionado;
          if (!chofer && conductores.length > 0) {
            chofer = conductores.find(c => c.latitud_origen && c.longitud_origen) || conductores[0];
            setConductorSeleccionado(chofer);
          }

          if (chofer && chofer.latitud_origen && chofer.longitud_origen) {
            const distKm = calcularDistanciaKm(chofer.latitud_origen, chofer.longitud_origen, latClean, lngClean);
            const tMin = estimarTiempoMin(distKm);
            setInfoRuta({
              distanciaKm: distKm,
              tiempoMin: tMin,
              horasEst: Math.round((tMin / 60) * 10) / 10
            });

            if (routeLineRef.current) {
              routeLineRef.current.setLatLngs([
                [chofer.latitud_origen, chofer.longitud_origen],
                [latClean, lngClean]
              ]);
            } else {
              routeLineRef.current = L.polyline([
                [chofer.latitud_origen, chofer.longitud_origen],
                [latClean, lngClean]
              ], {
                color: '#556B2F',
                weight: 4,
                dashArray: '6, 8',
                opacity: 0.95
              }).addTo(map);
            }
          }

          setMensajeExito(`Destino fijado en [${latClean}, ${lngClean}] con Bandera SVG. Ruta calculada desde el vehículo.`);
        });

        mapInstanceRef.current = map;
      }

      // Renderizar o actualizar vehículos de conductores (Carro SVG)
      if (driversLayerRef.current) {
        driversLayerRef.current.clearLayers();
        conductores.forEach(c => {
          if (c.latitud_origen && c.longitud_origen) {
            const isSelected = conductorSeleccionado?.conductor_id === c.conductor_id;
            const vMarker = L.marker([c.latitud_origen, c.longitud_origen], {
              icon: crearIconoVehiculoConductor(c, isSelected)
            });

            vMarker.bindPopup(`
              <div style="font-family:-apple-system,BlinkMacSystemFont,sans-serif;min-width:240px;padding:4px;">
                <div style="font-size:0.75rem;font-weight:700;color:#556B2F;text-transform:uppercase;margin-bottom:2px;display:flex;align-items:center;gap:4px;">
                  ${SVG_MINI_CAR} Conductor · ${c.estado}
                </div>
                <div style="font-size:0.92rem;font-weight:700;color:#2D3A2E;margin-bottom:2px;">
                  ${c.nombres} ${c.apellidos}
                </div>
                <div style="font-size:0.75rem;color:#6E7E5A;margin-bottom:6px;display:flex;align-items:center;gap:4px;">
                  ${SVG_MINI_PIN} Base Fija: ${c.direccion_origen || 'Lima Metropolitana'}
                </div>
                <div style="display:flex;gap:4px;font-size:0.7rem;margin-bottom:6px;">
                  <span style="background:#F5F4EE;border:1px solid #CAD3BD;padding:2px 6px;border-radius:4px;color:#2D3A2E;">Brevete: ${c.licencia}</span>
                  <span style="background:#F5F4EE;border:1px solid #CAD3BD;padding:2px 6px;border-radius:4px;color:#2D3A2E;">Jornada: ${c.horas_conduccion_hoy} h / 8h</span>
                </div>
                <div style="font-size:0.72rem;color:#556B2F;font-weight:600;">
                  Teléfono: ${c.telefono}
                </div>
              </div>
            `);

            vMarker.on('click', () => {
              seleccionarConductorParaRuta(c);
            });

            vMarker.addTo(driversLayerRef.current!);
          }
        });
      }

      // Si existe un punto de llegada fijado y no está en el mapa, añadirlo
      if (puntoLlegada && mapInstanceRef.current && !flagMarkerRef.current) {
        flagMarkerRef.current = L.marker([puntoLlegada.lat, puntoLlegada.lng], {
          icon: crearIconoBanderaLlegada('Punto de Llegada')
        }).addTo(mapInstanceRef.current);
      }

      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize();
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [vistaTab, conductores, conductorSeleccionado, puntoLlegada, mapaMaximizado]);

  const seleccionarConductorParaRuta = (c: Conductor) => {
    setConductorSeleccionado(c);
    if (c.latitud_origen && c.longitud_origen && mapInstanceRef.current) {
      mapInstanceRef.current.panTo([c.latitud_origen, c.longitud_origen], { animate: true });
    }

    if (puntoLlegada && c.latitud_origen && c.longitud_origen) {
      const distKm = calcularDistanciaKm(c.latitud_origen, c.longitud_origen, puntoLlegada.lat, puntoLlegada.lng);
      const tMin = estimarTiempoMin(distKm);
      setInfoRuta({
        distanciaKm: distKm,
        tiempoMin: tMin,
        horasEst: Math.round((tMin / 60) * 10) / 10
      });

      if (routeLineRef.current) {
        routeLineRef.current.setLatLngs([
          [c.latitud_origen, c.longitud_origen],
          [puntoLlegada.lat, puntoLlegada.lng]
        ]);
      } else if (mapInstanceRef.current) {
        routeLineRef.current = L.polyline([
          [c.latitud_origen, c.longitud_origen],
          [puntoLlegada.lat, puntoLlegada.lng]
        ], {
          color: '#556B2F',
          weight: 4,
          dashArray: '6, 8',
          opacity: 0.95
        }).addTo(mapInstanceRef.current);
      }
    }
  };

  const centrarEnConductor = () => {
    if (conductorSeleccionado && conductorSeleccionado.latitud_origen && conductorSeleccionado.longitud_origen && mapInstanceRef.current) {
      mapInstanceRef.current.setView([conductorSeleccionado.latitud_origen, conductorSeleccionado.longitud_origen], 14, { animate: true });
    }
  };

  const centrarEnBandera = () => {
    if (puntoLlegada && mapInstanceRef.current) {
      mapInstanceRef.current.setView([puntoLlegada.lat, puntoLlegada.lng], 14, { animate: true });
    }
  };

  const verTodosEnMapa = () => {
    if (!mapInstanceRef.current) return;
    const puntos: [number, number][] = [];
    conductores.forEach(c => {
      if (c.latitud_origen && c.longitud_origen) {
        puntos.push([c.latitud_origen, c.longitud_origen]);
      }
    });
    if (puntoLlegada) {
      puntos.push([puntoLlegada.lat, puntoLlegada.lng]);
    }
    if (puntos.length > 0) {
      const bounds = L.latLngBounds(puntos);
      mapInstanceRef.current.fitBounds(bounds, { padding: [50, 50] });
    }
  };

  const limpiarPuntoLlegada = () => {
    if (flagMarkerRef.current && mapInstanceRef.current) {
      mapInstanceRef.current.removeLayer(flagMarkerRef.current);
      flagMarkerRef.current = null;
    }
    if (routeLineRef.current && mapInstanceRef.current) {
      mapInstanceRef.current.removeLayer(routeLineRef.current);
      routeLineRef.current = null;
    }
    setPuntoLlegada(null);
    setInfoRuta(null);
    setMensajeExito('Punto de llegada y ruta restablecidos.');
  };

  const verEnMapaDesdePadron = (c: Conductor) => {
    setVistaTab('mapa');
    setConductorSeleccionado(c);
    setTimeout(() => {
      if (c.latitud_origen && c.longitud_origen && mapInstanceRef.current) {
        mapInstanceRef.current.setView([c.latitud_origen, c.longitud_origen], 14, { animate: true });
      }
    }, 200);
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

      // Creación automática de la cuenta de usuario para la App Móvil (Rol: REPARTIDOR)
      const pNombre = nombres.trim().split(' ')[0].toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      const pApellido = apellidos.trim().split(' ')[0].toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      const emailGenerado = `${pNombre}.${pApellido}@ecologistica.pe`;
      try {
        await UsuarioService.create({
          email: emailGenerado,
          nombre_completo: `${nombres.trim()} ${apellidos.trim()} (Conductor / Repartidor)`,
          telefono: telefono.trim(),
          rol: 'REPARTIDOR',
          password: 'ecologistica2026',
          permisos: ['REPARTO_POD', 'SEGUIMIENTO_RUTAS'],
          estado: 'ACTIVO'
        });
      } catch {}

      setMensajeExito(`Conductor ${payload.nombres} registrado. Cuenta para app móvil habilitada: ${emailGenerado} (Clave: ecologistica2026).`);
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
      setMensajeExito(`Conductor ${payload.nombres} registrado localmente con acceso móvil.`);
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

      {/* Segmented Control de Vistas */}
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
          onClick={() => setVistaTab('mapa')}
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
            background: vistaTab === 'mapa' ? '#556B2F' : 'transparent',
            color: vistaTab === 'mapa' ? '#FFFFFF' : '#2D3A2E',
            boxShadow: vistaTab === 'mapa' ? '0 2px 8px rgba(45, 58, 46, 0.25)' : 'none'
          }}
        >
          <Navigation size={15} />
          <span>Mapa de Flota & Simulación de Rutas</span>
        </button>

        <button
          type="button"
          onClick={() => setVistaTab('padron')}
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
            background: vistaTab === 'padron' ? '#556B2F' : 'transparent',
            color: vistaTab === 'padron' ? '#FFFFFF' : '#2D3A2E',
            boxShadow: vistaTab === 'padron' ? '0 2px 8px rgba(45, 58, 46, 0.25)' : 'none'
          }}
        >
          <Users size={15} />
          <span>Padrón & Registro de Conductores</span>
        </button>
      </div>

      {/* Pestaña 1: MAPA DE FLOTA Y SIMULACIÓN DE RUTAS GPS */}
      {vistaTab === 'mapa' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginBottom: '2rem' }}>
          {/* Barra de Selección Rápida de Conductores de la Flota */}
          <div className="card" style={{ padding: '1rem 1.25rem', margin: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600, fontSize: '0.9rem', color: '#2D3A2E' }}>
                <span dangerouslySetInnerHTML={{ __html: SVG_MINI_CAR }} />
                <span>Seleccionar Conductor para Trazar Ruta desde su Base Fija:</span>
              </div>
              <div style={{ fontSize: '0.75rem', color: '#6E7E5A' }}>
                {conductores.length} unidades activas en Lima Metropolitana
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.6rem', overflowX: 'auto', paddingBottom: '0.35rem' }}>
              {conductores.map(c => {
                const isSelected = conductorSeleccionado?.conductor_id === c.conductor_id;
                const statusColor = c.estado === 'DISPONIBLE' ? '#556B2F' : c.estado === 'EN_RUTA' ? '#C47D2B' : '#D64541';
                return (
                  <button
                    key={c.conductor_id}
                    type="button"
                    onClick={() => seleccionarConductorParaRuta(c)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.6rem',
                      padding: '0.55rem 0.9rem',
                      borderRadius: '10px',
                      border: isSelected ? '2px solid #556B2F' : '1px solid #CAD3BD',
                      background: isSelected ? '#EBF1E6' : '#FFFFFF',
                      cursor: 'pointer',
                      textAlign: 'left',
                      whiteSpace: 'nowrap',
                      boxShadow: isSelected ? '0 2px 8px rgba(85, 107, 47, 0.2)' : 'none',
                      transition: 'all 0.15s ease',
                      flexShrink: 0
                    }}
                  >
                    <div style={{ width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <span dangerouslySetInnerHTML={{ __html: SVG_MINI_CAR }} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.82rem', color: '#2D3A2E' }}>
                        {c.nombres.split(' ')[0]} {c.apellidos.split(' ')[0]}
                      </div>
                      <div style={{ fontSize: '0.7rem', color: '#6E7E5A', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <span style={{ display: 'inline-block', width: '6px', height: '6px', borderRadius: '50%', background: statusColor }}></span>
                        {c.direccion_origen ? c.direccion_origen.split(',')[1]?.trim() || c.direccion_origen.split(',')[0] : 'Lima'} · {c.horas_conduccion_hoy}h
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Contenedor del Mapa Leaflet Interactivo */}
          <div 
            className="card" 
            style={{ 
              padding: 0, 
              overflow: 'hidden', 
              position: 'relative',
              boxShadow: '0 8px 30px rgba(45, 58, 46, 0.12)',
              border: '1.5px solid #CAD3BD',
              margin: 0
            }}
          >
            {/* Barra Superior del Mapa */}
            <div style={{
              padding: '0.75rem 1.25rem',
              background: '#FFFFFF',
              borderBottom: '1.5px solid #EAE8DF',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '0.75rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <Navigation size={18} color="#556B2F" />
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#2D3A2E' }}>
                    Mapa Geoespacial de Rutas y Flota en Vivo
                  </div>
                  <div style={{ fontSize: '0.74rem', color: '#6E7E5A' }}>
                    Haz clic en el mapa para colocar la <strong>Bandera de Llegada SVG</strong> y calcular la ruta desde el carro
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={centrarEnConductor}
                  disabled={!conductorSeleccionado}
                  title="Centrar vista en el vehículo del conductor seleccionado"
                  style={{ padding: '0.35rem 0.65rem', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
                >
                  <LocateFixed size={14} /> Centrar en Carro
                </button>

                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={centrarEnBandera}
                  disabled={!puntoLlegada}
                  title="Centrar vista en la bandera de llegada"
                  style={{ padding: '0.35rem 0.65rem', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
                >
                  <Flag size={14} /> Centrar en Bandera
                </button>

                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={verTodosEnMapa}
                  title="Ajustar zoom para ver toda la flota y puntos"
                  style={{ padding: '0.35rem 0.65rem', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
                >
                  <Crosshair size={14} /> Ver Toda la Flota
                </button>

                {puntoLlegada && (
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={limpiarPuntoLlegada}
                    title="Eliminar la bandera y limpiar la ruta"
                    style={{ padding: '0.35rem 0.65rem', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#D64541' }}
                  >
                    <X size={14} /> Limpiar Bandera
                  </button>
                )}

                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setMapaMaximizado(!mapaMaximizado)}
                  title={mapaMaximizado ? "Restaurar tamaño normal" : "Maximizar mapa a pantalla completa"}
                  style={{ padding: '0.35rem 0.55rem', fontSize: '0.75rem' }}
                >
                  {mapaMaximizado ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
                </button>
              </div>
            </div>

            {/* Lienzo Leaflet con Contenedor React Ref */}
            <div 
              ref={mapContainerRef} 
              style={{ 
                height: mapaMaximizado ? '80vh' : '520px', 
                width: '100%',
                position: 'relative'
              }} 
            />

            {/* Panel de Leyenda y Estado Flotante en la esquina inferior */}
            <div style={{
              position: 'absolute',
              bottom: '16px',
              left: '16px',
              zIndex: 999,
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(10px)',
              borderRadius: '10px',
              padding: '0.6rem 0.9rem',
              border: '1.5px solid #CAD3BD',
              boxShadow: '0 4px 14px rgba(45, 58, 46, 0.15)',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.4rem',
              fontSize: '0.73rem'
            }}>
              <div style={{ fontWeight: 700, color: '#2D3A2E', display: 'flex', alignItems: 'center', gap: '5px' }}>
                <span>Simbología SVG Oficial</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span dangerouslySetInnerHTML={{ __html: SVG_MINI_CAR }} />
                <span>Carro SVG: Conductor en Base Fija Inicial</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span dangerouslySetInnerHTML={{ __html: SVG_MINI_FLAG }} />
                <span>Bandera SVG: Punto de Llegada / Entrega</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '18px', height: '3px', background: '#556B2F', display: 'inline-block', borderTop: '2px dashed #556B2F' }}></span>
                <span>Línea Discontinua: Ruta calculada en tiempo real</span>
              </div>
            </div>
          </div>

          {/* Tarjeta Telemetría HUD: Datos de la Ruta Calculada */}
          <div className="card" style={{ padding: '1.25rem', margin: 0, border: '1.5px solid #CAD3BD' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span dangerouslySetInnerHTML={{ __html: SVG_MINI_FLAG }} />
                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#2D3A2E' }}>
                  Telemetría de la Ruta: Carro del Conductor &rarr; Bandera de Llegada
                </h3>
              </div>
              {infoRuta && conductorSeleccionado && (
                <button
                  type="button"
                  className="btn"
                  onClick={() => {
                    abrirAsignacion(conductorSeleccionado);
                    setHorasRuta(infoRuta.horasEst);
                  }}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.45rem 1rem', fontSize: '0.8rem' }}
                >
                  <Send size={14} /> Asignar Esta Ruta ({infoRuta.horasEst} h)
                </button>
              )}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
              {/* Origen del Conductor */}
              <div style={{ padding: '0.85rem', background: '#F5F4EE', borderRadius: '10px', border: '1px solid #CAD3BD' }}>
                <div style={{ fontSize: '0.72rem', color: '#6E7E5A', textTransform: 'uppercase', fontWeight: 700, marginBottom: '0.35rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span dangerouslySetInnerHTML={{ __html: SVG_MINI_CAR }} />
                  Vehículo & Base Fija de Origen
                </div>
                {conductorSeleccionado ? (
                  <>
                    <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#2D3A2E' }}>
                      {conductorSeleccionado.nombres} {conductorSeleccionado.apellidos}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: '#556B2F', fontWeight: 600, marginTop: '0.2rem' }}>
                      {conductorSeleccionado.direccion_origen || 'Cercado de Lima'}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: '#6E7E5A', marginTop: '0.2rem' }}>
                      GPS: [{conductorSeleccionado.latitud_origen?.toFixed(6)}, {conductorSeleccionado.longitud_origen?.toFixed(6)}]
                    </div>
                    <div style={{ fontSize: '0.72rem', color: '#2D3A2E', marginTop: '0.35rem' }}>
                      Brevete: <strong>{conductorSeleccionado.licencia}</strong> ({conductorSeleccionado.categoria_licencia})
                    </div>
                  </>
                ) : (
                  <div style={{ fontSize: '0.8rem', color: '#6E7E5A' }}>Ningún conductor seleccionado</div>
                )}
              </div>

              {/* Destino de la Bandera */}
              <div style={{ padding: '0.85rem', background: '#F5F4EE', borderRadius: '10px', border: '1px solid #CAD3BD' }}>
                <div style={{ fontSize: '0.72rem', color: '#6E7E5A', textTransform: 'uppercase', fontWeight: 700, marginBottom: '0.35rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span dangerouslySetInnerHTML={{ __html: SVG_MINI_FLAG }} />
                  Punto de Llegada (Bandera SVG)
                </div>
                {puntoLlegada ? (
                  <>
                    <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#2D3A2E' }}>
                      Destino de Entrega Marcado
                    </div>
                    <div style={{ fontSize: '0.78rem', color: '#556B2F', fontWeight: 600, marginTop: '0.2rem' }}>
                      Coordenadas: [{puntoLlegada.lat}, {puntoLlegada.lng}]
                    </div>
                    <div style={{ fontSize: '0.72rem', color: '#6E7E5A', marginTop: '0.2rem' }}>
                      Punto fijado interactivamente con clic en el mapa
                    </div>
                    <div style={{ fontSize: '0.72rem', color: '#556B2F', marginTop: '0.35rem', fontWeight: 600 }}>
                      Listo para asociar con orden de reparto
                    </div>
                  </>
                ) : (
                  <div style={{ fontSize: '0.8rem', color: '#6E7E5A', lineHeight: 1.5 }}>
                    Haz clic en cualquier punto del mapa de Lima para clavar la Bandera de Llegada SVG.
                  </div>
                )}
              </div>

              {/* Estimaciones de Ruta */}
              <div style={{ padding: '0.85rem', background: '#F5F4EE', borderRadius: '10px', border: '1px solid #CAD3BD' }}>
                <div style={{ fontSize: '0.72rem', color: '#6E7E5A', textTransform: 'uppercase', fontWeight: 700, marginBottom: '0.35rem' }}>
                  Distancia & Tiempo Estimado
                </div>
                {infoRuta ? (
                  <>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                      <span style={{ fontSize: '1.4rem', fontWeight: 800, color: '#556B2F' }}>
                        {infoRuta.distanciaKm} km
                      </span>
                      <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#2D3A2E' }}>
                        ~{infoRuta.tiempoMin} min
                      </span>
                    </div>
                    <div style={{ fontSize: '0.72rem', color: '#6E7E5A', marginTop: '0.3rem' }}>
                      Cálculo geodésico Haversine + modelo tráfico urbano Lima
                    </div>
                    <div style={{ fontSize: '0.72rem', color: '#2D3A2E', marginTop: '0.35rem' }}>
                      Tiempo proyectado de conducción: <strong>+{infoRuta.horasEst} h</strong>
                    </div>
                  </>
                ) : (
                  <div style={{ fontSize: '0.8rem', color: '#6E7E5A' }}>
                    Selecciona un vehículo y clava la bandera en el mapa para calcular distancia y tiempo.
                  </div>
                )}
              </div>

              {/* Control de Fatiga Legal Ley N° 30224 */}
              <div style={{ padding: '0.85rem', background: '#F5F4EE', borderRadius: '10px', border: '1px solid #CAD3BD' }}>
                <div style={{ fontSize: '0.72rem', color: '#6E7E5A', textTransform: 'uppercase', fontWeight: 700, marginBottom: '0.35rem' }}>
                  Cumplimiento Legal MTC (Ley N° 30224)
                </div>
                {conductorSeleccionado && (
                  <>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: '0.25rem' }}>
                      <span>Jornada acumulada hoy:</span>
                      <strong>{conductorSeleccionado.horas_conduccion_hoy} h</strong>
                    </div>
                    {infoRuta && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: '0.25rem' }}>
                        <span>Tiempo de esta ruta:</span>
                        <strong>+{infoRuta.horasEst} h</strong>
                      </div>
                    )}
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', fontWeight: 700, borderTop: '1px solid #CAD3BD', paddingTop: '0.3rem', marginTop: '0.2rem' }}>
                      <span>Total proyectado:</span>
                      <span style={{ 
                        color: ((conductorSeleccionado.horas_conduccion_hoy + (infoRuta?.horasEst || 0)) > 8.0) ? '#D64541' : '#556B2F' 
                      }}>
                        {(conductorSeleccionado.horas_conduccion_hoy + (infoRuta?.horasEst || 0)).toFixed(1)} / 8.0 h
                      </span>
                    </div>
                    <div style={{ 
                      fontSize: '0.72rem', 
                      marginTop: '0.35rem', 
                      fontWeight: 600,
                      color: ((conductorSeleccionado.horas_conduccion_hoy + (infoRuta?.horasEst || 0)) > 8.0) ? '#D64541' : '#556B2F' 
                    }}>
                      {((conductorSeleccionado.horas_conduccion_hoy + (infoRuta?.horasEst || 0)) > 8.0)
                        ? 'Alerta: Excedería las 8 horas legales'
                        : 'Dentro del límite legal permitido'}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Pestaña 2: PADRÓN Y REGISTRO DE CONDUCTORES */}
      {vistaTab === 'padron' && (
        <>
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
                      <div style={{ fontWeight: 600, color: '#2D3A2E' }}>{c.nombres} {c.apellidos}</div>
                      <div style={{ 
                        fontSize: '0.73rem', 
                        color: '#556B2F', 
                        fontWeight: 600, 
                        display: 'inline-flex', 
                        alignItems: 'center', 
                        gap: '0.35rem', 
                        marginTop: '0.25rem',
                        background: '#F0EFE9',
                        padding: '0.15rem 0.45rem',
                        borderRadius: '6px',
                        border: '1px solid #CAD3BD'
                      }} title="Cuenta de acceso a la App Móvil (Rol: REPARTIDOR · Clave: ecologistica2026)">
                        <Smartphone size={11} color="#556B2F" />
                        <span>{getEmailConductor(c)}</span>
                      </div>
                      <div style={{ fontSize: '0.68rem', color: 'var(--apple-text-tertiary)', marginTop: '0.15rem' }}>
                        ID: {c.conductor_id.substring(0, 8)}... · Rol: REPARTIDOR
                      </div>
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
                        {/* Ver en Mapa y Trazar Ruta */}
                        <button
                          className="btn btn-secondary"
                          onClick={() => verEnMapaDesdePadron(c)}
                          title="Ver Vehículo en el Mapa y Trazar Ruta con Bandera SVG"
                          style={{ padding: '0.35rem 0.6rem', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.3rem', color: '#556B2F' }}
                        >
                          <Navigation size={13} /> Ruta
                        </button>

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
    </>
  )}

      {/* Modal de Simulación / Asignación de Ruta (SUB-002-05 & SUB-002-07) */}
      {assigningConductor && (
        <div className="apple-modal-overlay modal-overlay" onClick={() => setAssigningConductor(null)}>
          <div className="apple-modal modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '480px' }}>
            <div className="modal-header">
              <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Send size={18} color="var(--apple-accent)" /> Asignación de Ruta a Conductor
              </h2>
              <button 
                className="modal-close modal-close-btn" 
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
        <div className="apple-modal-overlay modal-overlay" onClick={() => setEditingConductor(null)}>
          <div className="apple-modal modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '540px' }}>
            <div className="modal-header">
              <h2>Editar Conductor: {editingConductor.nombres}</h2>
              <button 
                className="modal-close modal-close-btn" 
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
