import React, { useState, useEffect, useRef } from 'react';
import { 
  PackageCheck, Plus, MapPin, AlertCircle, Clock, Weight, 
  CheckCircle2, X, Sliders, ShieldAlert, Store, Phone, 
  Eye, RefreshCw, Navigation, Truck, Ban, Check, Sparkles,
  Maximize2, Minimize2, Crosshair, Wand2, Hash, Search,
  Home, Flag
} from 'lucide-react';
import L from 'leaflet';
import { Pedido, PedidoService, PreferenciasClienteUpdate, Conductor, ConductorService } from '../services/api';
import { 
  crearIconoBanderaLlegada, 
  crearIconoCasaOrigen,
  crearIconoVehiculoConductor, 
  calcularDistanciaKm, 
  estimarTiempoMin,
  SVG_MINI_FLAG,
  SVG_MINI_HOUSE,
  SVG_MINI_CAR,
  SVG_MINI_PIN
} from '../utils/mapIcons';

const MOCK_PEDIDOS_INITIAL: Pedido[] = [
  {
    pedido_id: 'p1111111-1111-1111-1111-111111111111',
    codigo_seguimiento: 'PED-LIMA-001',
    cliente_nombre: 'Bodega San José · San Juan de Lurigancho',
    origen_direccion: 'Av. Nicolás Ayllón 2340, Ate (Centro de Distribución EcoLogística)',
    direccion_destino: 'Av. Canto Grande 2450, SJL',
    latitud: -12.001200,
    longitud: -77.012300,
    peso_kg: 85.0,
    volumen_m3: 0.95,
    ventana_inicio: '08:00',
    ventana_fin: '11:00',
    prioridad: 'ALTA',
    estado: 'PENDIENTE',
    referencia_ubicacion: 'Rampa de Despacho 2, Almacén de Carga Seca, frente a garita principal.',
    restriccion_acceso: 'LIBRE_ACCESO',
    foto_referencia_url: 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=500&auto=format&fit=crop&q=60',
    telefono_contacto: '987112233'
  },
  {
    pedido_id: 'p2222222-2222-2222-2222-222222222222',
    codigo_seguimiento: 'PED-LIMA-002',
    cliente_nombre: 'Minimarket Los Laureles · Santa Anita',
    origen_direccion: 'Av. Argentina 2060, Callao (Almacén Central Callao)',
    direccion_destino: 'Av. Los Frutales 120, Ate',
    latitud: -12.045000,
    longitud: -76.965000,
    peso_kg: 42.0,
    volumen_m3: 0.45,
    ventana_inicio: '10:00',
    ventana_fin: '13:00',
    prioridad: 'ESTANDAR',
    estado: 'EN_TRANSITO',
    referencia_ubicacion: 'Pabellón B, Rampa 5, acceso exclusivo por Av. Materiales.',
    restriccion_acceso: 'ALTURA_MAXIMA_2_5M',
    foto_referencia_url: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=500&auto=format&fit=crop&q=60',
    telefono_contacto: '912334455'
  },
  {
    pedido_id: 'p3333333-3333-3333-3333-333333333333',
    codigo_seguimiento: 'PED-LIMA-003',
    cliente_nombre: 'Supermercado Central · El Agustino',
    origen_direccion: 'Av. Elmer Faucett 2823, Callao (Hub Logístico Aeropuerto)',
    direccion_destino: 'Jr. Ancash 890, El Agustino',
    latitud: -12.038000,
    longitud: -76.998000,
    peso_kg: 120.0,
    volumen_m3: 1.40,
    ventana_inicio: '13:00',
    ventana_fin: '16:00',
    prioridad: 'URGENTE',
    estado: 'PENDIENTE',
    referencia_ubicacion: 'Bahía de Despacho Rápido 1, presentar fotocheck y guía de remisión.',
    restriccion_acceso: 'SOLO_VEHICULOS_LIGEROS',
    foto_referencia_url: 'https://images.unsplash.com/photo-1534723452862-4c874018d66d?w=500&auto=format&fit=crop&q=60',
    telefono_contacto: '965443322'
  }
];

const RESTRICCIONES_OPCIONES = [
  { valor: 'LIBRE_ACCESO', label: 'Libre acceso vehicular', desc: 'Tránsito sin restricciones de galibo ni peso' },
  { valor: 'ALTURA_MAXIMA_2_5M', label: 'Altura máx. 2.5 m', desc: 'Pasajes estrechos, cables bajos o toldos' },
  { valor: 'SOLO_VEHICULOS_LIGEROS', label: 'Solo vehículos ligeros', desc: 'Furgonetas pequeñas o motocicletas' },
  { valor: 'NO_CAMIONES_PESADOS', label: 'No camiones pesados', desc: 'Restricción de pesaje > 3.5 toneladas' },
  { valor: 'ZONA_PEATONAL', label: 'Zona peatonal', desc: 'Ingreso exclusivo a pie con carretilla' }
];

const DICCIONARIO_PUNTOS_LIMA = [
  { lat: -12.112000, lng: -76.998000, dir: 'Av. Primavera 654, Santiago de Surco' },
  { lat: -12.045000, lng: -76.965000, dir: 'Av. Los Ruiseñores 420, Santa Anita' },
  { lat: -12.119000, lng: -77.034000, dir: 'Av. José Pardo 805, Miraflores' },
  { lat: -11.995000, lng: -77.072000, dir: 'Av. Antúnez de Mayolo 1240, Los Olivos' },
  { lat: -12.001200, lng: -77.012300, dir: 'Av. Canto Grande 2450, San Juan de Lurigancho' },
  { lat: -12.056700, lng: -76.978900, dir: 'Av. Nicolás Ayllón 1540, Ate Vitarte' },
  { lat: -12.046374, lng: -77.042793, dir: 'Jr. de la Unión 850, Cercado de Lima' },
  { lat: -12.098700, lng: -77.034500, dir: 'Av. Javier Prado Este 210, San Isidro' },
  { lat: -12.162300, lng: -76.968900, dir: 'Av. Los Héroes 620, San Juan de Miraflores' },
  { lat: -12.034500, lng: -77.112300, dir: 'Av. Sáenz Peña 450, Callao' },
  { lat: -12.038900, lng: -77.028900, dir: 'Av. Francisco Pizarro 410, Rímac' },
  { lat: -12.038000, lng: -76.998000, dir: 'Jr. Ancash 890, El Agustino' },
  { lat: -12.214500, lng: -76.934100, dir: 'Av. Revolución 1200, Villa El Salvador' },
  { lat: -11.989200, lng: -77.054000, dir: 'Av. Carlos Izaguirre 800, Independencia' },
  { lat: -12.078900, lng: -77.068900, dir: 'Av. Brasil 2200, Pueblo Libre' },
  { lat: -12.083400, lng: -77.051200, dir: 'Av. Salaverry 1500, Jesús María' },
  { lat: -12.062300, lng: -77.038900, dir: 'Av. Arequipa 1100, Lince' },
  { lat: -12.138900, lng: -77.023400, dir: 'Av. Pedro de Osma 320, Barranco' },
  { lat: -12.084500, lng: -76.971200, dir: 'Av. Javier Prado Este 4200, La Molina' },
  { lat: -12.071200, lng: -77.023400, dir: 'Av. México 1350, La Victoria' },
  { lat: -12.085000, lng: -77.078900, dir: 'Av. Sucre 640, Magdalena del Mar' },
  { lat: -12.072000, lng: -77.085000, dir: 'Av. La Marina 1800, San Miguel' },
  { lat: -12.022000, lng: -77.065000, dir: 'Av. Perú 2100, San Martín de Porres' }
];

export const resolverDireccionLima = async (lat: number, lng: number): Promise<string> => {
  // 1. Intentar geocodificación inversa vía Nominatim con timeout
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 1600);
    const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`, {
      signal: controller.signal,
      headers: { 'Accept-Language': 'es' }
    });
    clearTimeout(timer);
    if (res.ok) {
      const data = await res.json();
      const addr = data.address || {};
      const calle = addr.road || addr.pedestrian || addr.street || addr.neighbourhood;
      const numero = addr.house_number ? ` ${addr.house_number}` : '';
      const distrito = addr.suburb || addr.city_district || addr.county || addr.city || 'Lima';
      if (calle) {
        return `${calle}${numero}, ${distrito}`;
      }
      if (data.display_name) {
        const partes = data.display_name.split(',');
        return partes.slice(0, 3).join(',').trim();
      }
    }
  } catch {
    // Si falla o timeout, usar diccionario de puntos conocidos de Lima
  }

  // 2. Fallback inteligente: Encontrar punto más cercano del diccionario de Lima
  const masCercano = DICCIONARIO_PUNTOS_LIMA.reduce((prev, curr) => {
    const dPrev = Math.hypot(prev.lat - lat, prev.lng - lng);
    const dCurr = Math.hypot(curr.lat - lat, curr.lng - lng);
    return dCurr < dPrev ? curr : prev;
  }, DICCIONARIO_PUNTOS_LIMA[0]);

  return masCercano.dir;
};

export function PedidosView() {
  const [subTab, setSubTab] = useState<'registro' | 'preferencias' | 'mapa'>('registro');
  const [pedidos, setPedidos] = useState<Pedido[]>(MOCK_PEDIDOS_INITIAL);
  const [filtroEstado, setFiltroEstado] = useState<string>('TODOS');
  const [filtroPrioridad, setFiltroPrioridad] = useState<string>('TODOS');
  const [busquedaOrden, setBusquedaOrden] = useState<string>('');
  const [cargando, setCargando] = useState(false);
  const [cargandoRegistro, setCargandoRegistro] = useState(false);

  // Referencias para auto-foco en validación
  const clienteInputRef = useRef<HTMLInputElement>(null);
  const origenInputRef = useRef<HTMLInputElement>(null);
  const direccionInputRef = useRef<HTMLInputElement>(null);

  // Estados del Formulario de Registro (US-003)
  const [codigo, setCodigo] = useState('');
  const [cliente, setCliente] = useState('');
  const [origenDireccion, setOrigenDireccion] = useState('Av. Argentina 2060, Callao (Centro de Distribución EcoLogística)');
  const [origenLat, setOrigenLat] = useState<number>(-12.052000);
  const [origenLng, setOrigenLng] = useState<number>(-77.085000);
  const [referenciaUbicacion, setReferenciaUbicacion] = useState(''); // Referencia textual exclusiva del Punto A (Origen)
  const [direccion, setDireccion] = useState(''); // Dirección de Destino (Punto B)
  const [latitud, setLatitud] = useState<number>(-12.046374);
  const [longitud, setLongitud] = useState<number>(-77.042793);
  const [referenciaDestino, setReferenciaDestino] = useState(''); // Referencia textual exclusiva del Punto B (Destino)
  const [peso, setPeso] = useState<number>(50.0);
  const [volumen, setVolumen] = useState<number>(0.8);
  const [vInicio, setVInicio] = useState('08:30');
  const [vFin, setVFin] = useState('12:00');
  const [prioridad, setPrioridad] = useState('ESTANDAR');
  const [restriccionAcceso, setRestriccionAcceso] = useState('LIBRE_ACCESO');
  const [telefonoContacto, setTelefonoContacto] = useState('');

  // Selector de modo de fijación en el mapa: 'A' (Casa Origen) o 'B' (Bandera de Meta)
  const [modoFijarPunto, setModoFijarPunto] = useState<'A' | 'B'>('B');
  const modoFijarPuntoRef = useRef<'A' | 'B'>('B');

  // Estados para US-004 (Preferencias del Cliente)
  const [pedidoSeleccionado, setPedidoSeleccionado] = useState<Pedido | null>(null);
  const [prefVInicio, setPrefVInicio] = useState('08:30');
  const [prefVFin, setPrefVFin] = useState('12:00');
  const [prefRestriccion, setPrefRestriccion] = useState('LIBRE_ACCESO');
  const [prefReferencia, setPrefReferencia] = useState('');
  const [prefFotoUrl, setPrefFotoUrl] = useState('');
  const [prefTelefono, setPrefTelefono] = useState('');

  // Toasts estilo Apple
  const [toast, setToast] = useState<{ tipo: 'success' | 'error' | 'warning'; titulo: string; mensaje: string } | null>(null);

  // Modo Pantalla Completa / Ver al Máximo (US-003)
  const [mapaMaximizado, setMapaMaximizado] = useState(false);

  // Estados para Flota de Conductores y Rutas en el Mapa
  const [conductores, setConductores] = useState<Conductor[]>([]);
  const [conductorSeleccionado, setConductorSeleccionado] = useState<Conductor | null>(null);
  const [infoRuta, setInfoRuta] = useState<{ distanciaKm: number; tiempoMin: number; conductorNombre: string } | null>(null);

  // Referencias para el Mapa Leaflet
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const driversLayerRef = useRef<L.LayerGroup | null>(null);
  const markerPuntoARef = useRef<L.Marker | null>(null);
  const markerPuntoBRef = useRef<L.Marker | null>(null);
  const tempMarkerRef = useRef<L.Marker | null>(null);
  const routeLineRef = useRef<L.Polyline | null>(null);

  // Cargar flota de conductores para el mapa
  useEffect(() => {
    ConductorService.getAll().then(data => {
      if (data && data.length > 0) setConductores(data);
    }).catch(() => {});
  }, []);

  // Cargar pedidos desde API con fallback a mock
  const fetchPedidos = async () => {
    setCargando(true);
    try {
      const data = await PedidoService.getAll({
        estado: filtroEstado,
        prioridad: filtroPrioridad
      });
      if (data && data.length > 0) {
        setPedidos(data);
      }
    } catch {
      // Fallback a memoria local
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    fetchPedidos();
  }, [filtroEstado, filtroPrioridad]);

  // Filtrado reactivo en memoria para búsqueda inmediata por código, cliente o dirección
  const pedidosFiltrados = pedidos.filter(p => {
    if (!busquedaOrden.trim()) return true;
    const term = busquedaOrden.toLowerCase().trim();
    return (
      (p.codigo_seguimiento && p.codigo_seguimiento.toLowerCase().includes(term)) ||
      (p.cliente_nombre && p.cliente_nombre.toLowerCase().includes(term)) ||
      (p.direccion_destino && p.direccion_destino.toLowerCase().includes(term)) ||
      (p.referencia_ubicacion && p.referencia_ubicacion.toLowerCase().includes(term))
    );
  });

  // Temporizador para toasts
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 6000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Inicializar o sincronizar el pedido seleccionado para US-004
  useEffect(() => {
    if (pedidos.length > 0 && !pedidoSeleccionado) {
      cargarPedidoEnPreferencias(pedidos[0]);
    }
  }, [pedidos]);

  const cargarPedidoEnPreferencias = (p: Pedido) => {
    setPedidoSeleccionado(p);
    setPrefVInicio(p.ventana_inicio?.slice(0, 5) || '08:00');
    setPrefVFin(p.ventana_fin?.slice(0, 5) || '12:00');
    setPrefRestriccion(p.restriccion_acceso || 'LIBRE_ACCESO');
    setPrefReferencia(p.referencia_ubicacion || '');
    setPrefFotoUrl(p.foto_referencia_url || '');
    setPrefTelefono(p.telefono_contacto || '');
  };

  // Autogenerar código de seguimiento
  const autogenerarCodigo = () => {
    const num = Math.floor(1000 + Math.random() * 9000);
    setCodigo(`PED-LIMA-${num}`);
  };

  // Abrir mapa interactivo para fijar coordenadas de Punto A (Casa) o Punto B (Bandera Meta)
  const abrirMapaParaFijar = (punto: 'A' | 'B') => {
    setModoFijarPunto(punto);
    modoFijarPuntoRef.current = punto;
    setSubTab('mapa');
    setTimeout(() => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize();
        const targetLat = punto === 'A' ? origenLat : latitud;
        const targetLng = punto === 'A' ? origenLng : longitud;
        if (targetLat && targetLng) {
          mapInstanceRef.current.setView([targetLat, targetLng], 15, { animate: true });
        }
      }
    }, 150);
  };

  // Ajustar nombre de dirección de destino según coordenadas seleccionadas
  const actualizarDireccionDesdeCoords = async (targetLat: number, targetLng: number) => {
    if (isNaN(targetLat) || isNaN(targetLng)) return;
    try {
      const dirResuelta = await resolverDireccionLima(targetLat, targetLng);
      setDireccion(dirResuelta);
    } catch {
      // Continuar sin interrumpir
    }
  };

  // Rellenar formulario con datos de prueba reales de Lima Metropolitana
  const llenarDatosPrueba = () => {
    const num = Math.floor(1000 + Math.random() * 9000);
    const ejemplos = [
      {
        cliente: 'Distribuidora Santa Anita S.A.C.',
        origen: 'Av. Nicolás Ayllón 2340, Ate (Centro de Distribución EcoLogística)',
        origenLat: -12.049000,
        origenLng: -76.972000,
        refOrigen: 'Rampa de Carga 2, Muelle Este, portón metálico frente a garita de pesaje.',
        direccion: 'Av. Los Ruiseñores 420, Santa Anita',
        refDest: 'Frente al parque Los Ruiseñores, portón negro, timbre 201.',
        lat: -12.045000,
        lng: -76.965000,
        peso: 75.0,
        vol: 0.85,
        ini: '08:30',
        fin: '12:00',
        prio: 'ALTA',
        rest: 'LIBRE_ACCESO',
        tel: '984123456'
      },
      {
        cliente: 'Bodega San Martín · Surco',
        origen: 'Av. Argentina 2060, Callao (Almacén Central Callao)',
        origenLat: -12.052000,
        origenLng: -77.085000,
        refOrigen: 'Pabellón B, Rampa 5, acceso exclusivo por Av. Materiales.',
        direccion: 'Av. Primavera 654, Santiago de Surco',
        refDest: 'Pasando el óvalo Higuereta, fachada con toldo verde.',
        lat: -12.112000,
        lng: -76.998000,
        peso: 45.0,
        vol: 0.50,
        ini: '09:00',
        fin: '13:00',
        prio: 'ESTANDAR',
        rest: 'LIBRE_ACCESO',
        tel: '912345678'
      },
      {
        cliente: 'Supermercado Central Miraflores',
        origen: 'Av. Elmer Faucett 2823, Callao (Hub Logístico Aeropuerto)',
        origenLat: -12.023000,
        origenLng: -77.108000,
        refOrigen: 'Bahía de Despacho Rápido 1, presentar fotocheck y guía de remisión.',
        direccion: 'Av. José Pardo 805, Miraflores',
        refDest: 'Sótano 1, muelle de recepción de proveedores con rampa de tijera.',
        lat: -12.119000,
        lng: -77.034000,
        peso: 120.0,
        vol: 1.40,
        ini: '10:00',
        fin: '15:00',
        prio: 'URGENTE',
        rest: 'ALTURA_MAXIMA_2_5M',
        tel: '965443322'
      },
      {
        cliente: 'Minimarket Los Olivos Express',
        origen: 'Av. Trapiche 150, Comas (Hub Lima Norte)',
        origenLat: -11.932000,
        origenLng: -77.054000,
        refOrigen: 'Rampa de Carga Liviana 3, galpón C, puerta enrollable gris.',
        direccion: 'Av. Antúnez de Mayolo 1240, Los Olivos',
        refDest: 'Al lado de la farmacia, puerta corrediza blanca con intercomunicador.',
        lat: -11.995000,
        lng: -77.072000,
        peso: 50.0,
        vol: 0.60,
        ini: '08:00',
        fin: '11:30',
        prio: 'ALTA',
        rest: 'SOLO_VEHICULOS_LIGEROS',
        tel: '976543210'
      }
    ];

    const item = ejemplos[Math.floor(Math.random() * ejemplos.length)];
    setCodigo(`PED-LIMA-${num}`);
    setCliente(item.cliente);
    setOrigenDireccion(item.origen);
    setOrigenLat(item.origenLat);
    setOrigenLng(item.origenLng);
    setReferenciaUbicacion(item.refOrigen);
    setDireccion(item.direccion);
    setReferenciaDestino(item.refDest);
    setLatitud(item.lat);
    setLongitud(item.lng);
    setPeso(item.peso);
    setVolumen(item.vol);
    setVInicio(item.ini);
    setVFin(item.fin);
    setPrioridad(item.prio);
    setRestriccionAcceso(item.rest);
    setTelefonoContacto(item.tel);

    setToast({
      tipo: 'success',
      titulo: 'Datos de Prueba Cargados',
      mensaje: `Datos cargados para "${item.cliente}". Haz clic en "Registrar Pedido con Coordenadas" para guardar.`
    });
  };

  // Atajo de teclado Escape para salir de pantalla completa
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && mapaMaximizado) {
        setMapaMaximizado(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mapaMaximizado]);

  // Centrar mapa en Lima Metropolitana
  const centrarEnLima = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView([-12.046374, -77.042793], 12);
    }
  };

  // Ajustar vista para abarcar todas las órdenes
  const verTodosLosPedidos = () => {
    if (mapInstanceRef.current && pedidos.length > 0) {
      const bounds = L.latLngBounds(pedidos.map(p => [p.latitud, p.longitud]));
      mapInstanceRef.current.fitBounds(bounds, { padding: [50, 50] });
    }
  };

  // Inicializar o actualizar mapa de Leaflet
  useEffect(() => {
    if (subTab !== 'mapa') return;

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

        // Capa de mosaicos OpenStreetMap
        L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19,
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        }).addTo(map);

        // Capa de marcadores de órdenes
        const markers = L.layerGroup().addTo(map);
        markersLayerRef.current = markers;

        // Capa de vehículos de conductores (Carro SVG)
        const driversLayer = L.layerGroup().addTo(map);
        driversLayerRef.current = driversLayer;

        // Marcadores iniciales de Origen (Casa) y Destino (Bandera Meta)
        if (origenLat && origenLng && !markerPuntoARef.current) {
          markerPuntoARef.current = L.marker([origenLat, origenLng], {
            icon: crearIconoCasaOrigen('Origen (Casa Despacho)')
          }).addTo(map);
        }
        if (latitud && longitud && !markerPuntoBRef.current) {
          markerPuntoBRef.current = L.marker([latitud, longitud], {
            icon: crearIconoBanderaLlegada('Destino (Meta Final)')
          }).addTo(map);
        }
        if (origenLat && origenLng && latitud && longitud && !routeLineRef.current) {
          routeLineRef.current = L.polyline([
            [origenLat, origenLng],
            [latitud, longitud]
          ], {
            color: '#556B2F',
            weight: 4,
            dashArray: '6, 8',
            opacity: 0.9
          }).addTo(map);
        }

        // Captura interactiva de coordenadas al hacer clic:
        // Casa SVG para Origen, Bandera de Fin de Carrera SVG para Destino
        map.on('click', async (e: L.LeafletMouseEvent) => {
          const { lat, lng } = e.latlng;
          const latFija = parseFloat(lat.toFixed(6));
          const lngFija = parseFloat(lng.toFixed(6));
          const modo = modoFijarPuntoRef.current;
          const nuevaDir = await resolverDireccionLima(latFija, lngFija);

          if (modo === 'A') {
            setOrigenLat(latFija);
            setOrigenLng(lngFija);
            setOrigenDireccion(nuevaDir);

            // Colocar o actualizar la CASA SVG para Origen
            if (markerPuntoARef.current) {
              markerPuntoARef.current.setLatLng(e.latlng);
              markerPuntoARef.current.setIcon(crearIconoCasaOrigen('Origen (Casa Despacho)'));
            } else {
              markerPuntoARef.current = L.marker(e.latlng, {
                icon: crearIconoCasaOrigen('Origen (Casa Despacho)')
              }).addTo(map);
            }

            markerPuntoARef.current.bindPopup(`
              <div style="font-family:-apple-system,BlinkMacSystemFont,sans-serif;min-width:220px;padding:4px;">
                <div style="font-weight:700;color:#556B2F;font-size:0.85rem;margin-bottom:2px;display:flex;align-items:center;gap:5px;">
                  ${SVG_MINI_HOUSE} Origen (Casa de Despacho)
                </div>
                <div style="font-size:0.75rem;color:#2D3A2E;margin-bottom:2px;font-weight:600;">
                  ${nuevaDir}
                </div>
                <div style="font-size:0.72rem;color:#6E7E5A;margin-bottom:4px;">
                  GPS Origen: [${latFija}, ${lngFija}]
                </div>
                <div style="font-size:0.7rem;color:#556B2F;background:#EBF1E6;padding:2px 5px;border-radius:4px;border:1px solid #CAD3BD;">
                  Dirección de Origen transferida al formulario.
                </div>
              </div>
            `);

            setToast({
              tipo: 'success',
              titulo: 'Origen Fijado con Casa SVG',
              mensaje: `Origen: "${nuevaDir}" [${latFija}, ${lngFija}]. Datos transferidos al formulario.`
            });
          } else {
            // Modo Destino con Bandera de Fin de Carrera SVG
            setLatitud(latFija);
            setLongitud(lngFija);
            setDireccion(nuevaDir);

            // Colocar o actualizar la BANDERA DE FIN DE CARRERA SVG de meta/llegada
            if (markerPuntoBRef.current) {
              markerPuntoBRef.current.setLatLng(e.latlng);
              markerPuntoBRef.current.setIcon(crearIconoBanderaLlegada('Destino (Meta Final)'));
            } else {
              markerPuntoBRef.current = L.marker(e.latlng, {
                icon: crearIconoBanderaLlegada('Destino (Meta Final)')
              }).addTo(map);
            }

            markerPuntoBRef.current.bindPopup(`
              <div style="font-family:-apple-system,BlinkMacSystemFont,sans-serif;min-width:220px;padding:4px;">
                <div style="font-weight:700;color:#1A1A1A;font-size:0.85rem;margin-bottom:2px;display:flex;align-items:center;gap:5px;">
                  ${SVG_MINI_FLAG} Destino (Meta Final)
                </div>
                <div style="font-size:0.75rem;color:#C47D2B;margin-bottom:2px;font-weight:600;">
                  ${nuevaDir}
                </div>
                <div style="font-size:0.72rem;color:#6E7E5A;margin-bottom:4px;">
                  GPS Destino: [${latFija}, ${lngFija}]
                </div>
                <div style="font-size:0.7rem;color:#2D3A2E;background:#F5F4EE;padding:2px 5px;border-radius:4px;border:1px solid #CAD3BD;">
                  Dirección de Destino transferida al formulario.
                </div>
              </div>
            `);

            setToast({
              tipo: 'success',
              titulo: 'Destino Fijado con Bandera de Meta',
              mensaje: `Destino: "${nuevaDir}" [${latFija}, ${lngFija}]. Datos transferidos al formulario.`
            });
          }

          // Si ambos puntos están fijados, trazar ruta entre Origen y Destino
          const pALat = modo === 'A' ? latFija : (markerPuntoARef.current ? markerPuntoARef.current.getLatLng().lat : null);
          const pALng = modo === 'A' ? lngFija : (markerPuntoARef.current ? markerPuntoARef.current.getLatLng().lng : null);
          const pBLat = modo === 'B' ? latFija : (markerPuntoBRef.current ? markerPuntoBRef.current.getLatLng().lat : null);
          const pBLng = modo === 'B' ? lngFija : (markerPuntoBRef.current ? markerPuntoBRef.current.getLatLng().lng : null);

          if (pALat && pALng && pBLat && pBLng) {
            const distKm = calcularDistanciaKm(pALat, pALng, pBLat, pBLng);
            const tMin = estimarTiempoMin(distKm);
            setInfoRuta({
              distanciaKm: distKm,
              tiempoMin: tMin,
              conductorNombre: 'Ruta Origen (Casa) → Destino (Meta)'
            });

            if (routeLineRef.current) {
              routeLineRef.current.setLatLngs([
                [pALat, pALng],
                [pBLat, pBLng]
              ]);
            } else {
              routeLineRef.current = L.polyline([
                [pALat, pALng],
                [pBLat, pBLng]
              ], {
                color: '#556B2F',
                weight: 4,
                dashArray: '6, 8',
                opacity: 0.9
              }).addTo(map);
            }
          }
        });

        mapInstanceRef.current = map;
      }

      // 1. Actualizar vehículos de conductores en el mapa (Carro SVG)
      if (driversLayerRef.current) {
        driversLayerRef.current.clearLayers();
        conductores.forEach(c => {
          if (c.latitud_origen && c.longitud_origen) {
            const isSelected = conductorSeleccionado?.conductor_id === c.conductor_id;
            const vMarker = L.marker([c.latitud_origen, c.longitud_origen], {
              icon: crearIconoVehiculoConductor(c, isSelected)
            });

            vMarker.bindPopup(`
              <div style="font-family:-apple-system,BlinkMacSystemFont,sans-serif;min-width:230px;padding:4px;">
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
                  <span style="background:#F5F4EE;border:1px solid #CAD3BD;padding:2px 6px;border-radius:4px;color:#2D3A2E;">Jornada: ${c.horas_conduccion_hoy} h</span>
                </div>
                <div style="font-size:0.72rem;color:#556B2F;font-weight:600;">
                  Teléfono: ${c.telefono}
                </div>
              </div>
            `);

            vMarker.on('click', () => {
              setConductorSeleccionado(c);
              if (tempMarkerRef.current) {
                const dest = tempMarkerRef.current.getLatLng();
                const dKm = calcularDistanciaKm(c.latitud_origen!, c.longitud_origen!, dest.lat, dest.lng);
                const tM = estimarTiempoMin(dKm);
                setInfoRuta({
                  distanciaKm: dKm,
                  tiempoMin: tM,
                  conductorNombre: `${c.nombres} ${c.apellidos}`
                });
                if (routeLineRef.current) {
                  routeLineRef.current.setLatLngs([
                    [c.latitud_origen!, c.longitud_origen!],
                    [dest.lat, dest.lng]
                  ]);
                } else if (mapInstanceRef.current) {
                  routeLineRef.current = L.polyline([
                    [c.latitud_origen!, c.longitud_origen!],
                    [dest.lat, dest.lng]
                  ], {
                    color: '#556B2F',
                    weight: 4,
                    dashArray: '6, 8',
                    opacity: 0.9
                  }).addTo(mapInstanceRef.current);
                }
              }
            });

            vMarker.addTo(driversLayerRef.current!);
          }
        });
      }

      // 2. Sincronizar marcadores Origen (Casa) y Destino (Bandera Meta Final)
      if (mapInstanceRef.current) {
        if (origenLat && origenLng) {
          if (!markerPuntoARef.current) {
            markerPuntoARef.current = L.marker([origenLat, origenLng], {
              icon: crearIconoCasaOrigen('Origen (Casa Despacho)')
            }).addTo(mapInstanceRef.current);
          } else {
            markerPuntoARef.current.setLatLng([origenLat, origenLng]);
          }
        }

        if (latitud && longitud) {
          if (!markerPuntoBRef.current) {
            markerPuntoBRef.current = L.marker([latitud, longitud], {
              icon: crearIconoBanderaLlegada('Destino (Meta Final)')
            }).addTo(mapInstanceRef.current);
          } else {
            markerPuntoBRef.current.setLatLng([latitud, longitud]);
          }
        }

        // Sincronizar trazado de ruta entre A y B
        if (origenLat && origenLng && latitud && longitud) {
          if (!routeLineRef.current) {
            routeLineRef.current = L.polyline([
              [origenLat, origenLng],
              [latitud, longitud]
            ], {
              color: '#556B2F',
              weight: 4,
              dashArray: '6, 8',
              opacity: 0.9
            }).addTo(mapInstanceRef.current);
          } else {
            routeLineRef.current.setLatLngs([
              [origenLat, origenLng],
              [latitud, longitud]
            ]);
          }
        }
      }

      // 3. Actualizar marcadores de pedidos existentes
      if (markersLayerRef.current) {
        markersLayerRef.current.clearLayers();
        pedidos.forEach(p => {
          const color = p.prioridad === 'URGENTE' ? '#D64541' : p.prioridad === 'ALTA' ? '#C47D2B' : '#556B2F';
          const marker = L.marker([p.latitud, p.longitud], {
            icon: L.divIcon({
              className: 'custom-pin',
              html: `<div style="background:${color};width:14px;height:14px;border-radius:50%;border:2px solid #FFFFFF;box-shadow:0 2px 6px rgba(0,0,0,0.35);"></div>`,
              iconSize: [14, 14],
              iconAnchor: [7, 7]
            })
          });

          marker.bindPopup(`
            <div style="font-family:-apple-system,BlinkMacSystemFont,sans-serif;min-width:210px;padding:4px;">
              <div style="font-weight:700;color:#556B2F;font-size:0.85rem;margin-bottom:2px;">${p.codigo_seguimiento}</div>
              <div style="font-weight:600;font-size:0.85rem;color:#2D3A2E;margin-bottom:4px;">${p.cliente_nombre}</div>
              <div style="font-size:0.75rem;color:#6E7E5A;margin-bottom:6px;">${p.direccion_destino}</div>
              <div style="display:flex;gap:4px;font-size:0.7rem;margin-bottom:6px;">
                <span style="background:#F5F4EE;border:1px solid #CAD3BD;padding:2px 6px;border-radius:4px;color:#2D3A2E;">${p.peso_kg} kg</span>
                <span style="background:#F5F4EE;border:1px solid #CAD3BD;padding:2px 6px;border-radius:4px;color:#2D3A2E;">${p.ventana_inicio} - ${p.ventana_fin}</span>
              </div>
              <div style="font-size:0.72rem;color:#C47D2B;font-weight:600;">${p.restriccion_acceso || 'LIBRE_ACCESO'}</div>
            </div>
          `);
          marker.addTo(markersLayerRef.current!);
        });
      }

      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize();
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [subTab, pedidos, conductores, conductorSeleccionado, mapaMaximizado, origenLat, origenLng, latitud, longitud]);

  // =========================================================================
  // SUB-003: Registrar Pedido con Geolocalización
  // =========================================================================
  const handleCrearPedido = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    // 1. Validación de Cliente (Requerido)
    if (!cliente || !cliente.trim()) {
      setToast({
        tipo: 'warning',
        titulo: 'Campo Requerido: Cliente (US-003)',
        mensaje: 'Por favor, ingresa el Nombre o Razón Social del Cliente para registrar la orden.'
      });
      clienteInputRef.current?.focus();
      return;
    }

    // 2. Validación de Dirección de Origen
    if (!origenDireccion || !origenDireccion.trim()) {
      setToast({
        tipo: 'warning',
        titulo: 'Campo Requerido: Dirección de Origen',
        mensaje: 'Por favor, ingresa la Dirección de Origen para el despacho.'
      });
      origenInputRef.current?.focus();
      return;
    }

    // 3. Validación de Dirección de Destino
    if (!direccion || !direccion.trim()) {
      setToast({
        tipo: 'warning',
        titulo: 'Campo Requerido: Dirección de Destino',
        mensaje: 'Por favor, ingresa la Dirección de Destino en Lima Metropolitana.'
      });
      direccionInputRef.current?.focus();
      return;
    }

    // 4. Validación de Coordenadas
    if (isNaN(latitud) || isNaN(longitud)) {
      setToast({
        tipo: 'warning',
        titulo: 'Coordenadas GPS Inválidas',
        mensaje: 'Por favor, ingresa coordenadas numéricas válidas para la entrega en Lima.'
      });
      return;
    }

    // 5. Validación de Peso y Volumen
    if (isNaN(peso) || peso <= 0) {
      setToast({
        tipo: 'error',
        titulo: 'Peso Inválido (US-003)',
        mensaje: 'El peso de la carga debe ser un valor mayor a 0 kg.'
      });
      return;
    }

    if (isNaN(volumen) || volumen <= 0) {
      setToast({
        tipo: 'error',
        titulo: 'Volumen Inválido (US-003)',
        mensaje: 'El volumen de la carga debe ser un valor mayor a 0 m³.'
      });
      return;
    }

    // 6. Validación BDD Escenario 3 (Ruta Infeliz RF-002) y Regla RN-007
    if (vFin <= vInicio) {
      setToast({
        tipo: 'error',
        titulo: 'Ventana Horaria Inválida (RN-007)',
        mensaje: `La hora de fin (${vFin}) debe ser estrictamente posterior a la hora de inicio (${vInicio}).`
      });
      return;
    }

    setCargandoRegistro(true);

    const codFinal = codigo.trim() || `PED-LIMA-${Math.floor(1000 + Math.random() * 9000)}`;

    const nuevoPedidoPayload = {
      codigo_seguimiento: codFinal,
      cliente_nombre: cliente.trim(),
      origen_direccion: origenDireccion.trim(),
      origen_lat: origenLat,
      origen_lng: origenLng,
      direccion_destino: direccion.trim(),
      latitud,
      longitud,
      peso_kg: peso,
      volumen_m3: volumen,
      ventana_inicio: vInicio,
      ventana_fin: vFin,
      prioridad,
      referencia_ubicacion: referenciaUbicacion.trim() || undefined,
      referencia_destino: referenciaDestino.trim() || undefined,
      restriccion_acceso: restriccionAcceso,
      telefono_contacto: telefonoContacto.trim() || undefined
    };

    try {
      const creado = await PedidoService.create(nuevoPedidoPayload);
      setPedidos(prev => [creado, ...prev]);
      setToast({
        tipo: 'success',
        titulo: 'Pedido Registrado con Éxito (US-003)',
        mensaje: `Orden ${creado.codigo_seguimiento} para "${creado.cliente_nombre}" registrada en Supabase PostGIS.`
      });
      limpiarFormulario();
    } catch (err: any) {
      console.warn('Error en persistencia remota, aplicando fallback resiliente:', err);
      // Fallback local
      const nuevoLocal: Pedido = {
        ...nuevoPedidoPayload,
        pedido_id: `local-${Date.now()}`,
        estado: 'PENDIENTE'
      };
      setPedidos(prev => [nuevoLocal, ...prev]);
      setToast({
        tipo: 'success',
        titulo: 'Pedido Registrado (Modo Resiliente)',
        mensaje: `Registrado: ${nuevoLocal.codigo_seguimiento}. Estado: Pendiente de Programación.`
      });
      limpiarFormulario();
    } finally {
      setCargandoRegistro(false);
    }
  };

  const limpiarFormulario = () => {
    setCodigo('');
    setCliente('');
    setOrigenDireccion('Av. Argentina 2060, Callao (Centro de Distribución EcoLogística)');
    setOrigenLat(-12.052000);
    setOrigenLng(-77.085000);
    setDireccion('');
    setReferenciaUbicacion('');
    setReferenciaDestino('');
    setTelefonoContacto('');
  };

  // =========================================================================
  // SUB-004: Actualizar Preferencias y Restricciones del Cliente
  // =========================================================================
  const handleGuardarPreferencias = async () => {
    if (!pedidoSeleccionado) return;

    // Regla de Negocio RN-007 / RN-010 / RF-009 Escenario 2:
    // Si el pedido está en tránsito, rechazar con mensaje exacto.
    if (pedidoSeleccionado.estado === 'EN_TRANSITO' || pedidoSeleccionado.estado === 'EN_RUTA') {
      setToast({
        tipo: 'error',
        titulo: 'Restricción de Negocio (RN-007 / RN-010)',
        mensaje: 'No se pueden alterar las preferencias de un pedido en tránsito.'
      });
      return;
    }

    if (prefVFin <= prefVInicio) {
      setToast({
        tipo: 'error',
        titulo: 'Validación de Ventana Horaria',
        mensaje: 'Ventana de entrega o dimensiones de carga inválidas.'
      });
      return;
    }

    const payload: PreferenciasClienteUpdate = {
      ventana_inicio: prefVInicio,
      ventana_fin: prefVFin,
      restriccion_acceso: prefRestriccion,
      referencia_ubicacion: prefReferencia,
      foto_referencia_url: prefFotoUrl,
      telefono_contacto: prefTelefono
    };

    try {
      const actualizado = await PedidoService.updatePreferencias(pedidoSeleccionado.pedido_id, payload);
      setPedidos(prev => prev.map(p => p.pedido_id === actualizado.pedido_id ? actualizado : p));
      setPedidoSeleccionado(actualizado);
      setToast({
        tipo: 'success',
        titulo: 'Preferencias Actualizadas (US-004)',
        mensaje: `Preferencias del cliente aplicadas para ${actualizado.codigo_seguimiento} y futuros cálculos de ruteo.`
      });
    } catch (err: any) {
      const msg = err.response?.data?.detail || 'No se pudo conectar al backend. Actualizando en sesión local.';
      if (err.response?.status === 400 && msg.includes('tránsito')) {
        setToast({
          tipo: 'error',
          titulo: 'Restricción de Negocio (RN-007 / RN-010)',
          mensaje: msg
        });
        return;
      }
      // Actualización en estado local
      const localAct: Pedido = {
        ...pedidoSeleccionado,
        ventana_inicio: prefVInicio,
        ventana_fin: prefVFin,
        restriccion_acceso: prefRestriccion,
        referencia_ubicacion: prefReferencia,
        foto_referencia_url: prefFotoUrl,
        telefono_contacto: prefTelefono
      };
      setPedidos(prev => prev.map(p => p.pedido_id === localAct.pedido_id ? localAct : p));
      setPedidoSeleccionado(localAct);
      setToast({
        tipo: 'success',
        titulo: 'Preferencias Guardadas (Local)',
        mensaje: `Restricciones y preferencias guardadas para ${localAct.codigo_seguimiento}.`
      });
    }
  };

  // Alternar estado para simular pedidos en tránsito (Prueba de Escenario 2 US-004)
  const toggleEstadoPedido = async (p: Pedido) => {
    const nuevoEstado = p.estado === 'PENDIENTE' ? 'EN_TRANSITO' : 'PENDIENTE';
    try {
      const act = await PedidoService.updateEstado(p.pedido_id, nuevoEstado);
      setPedidos(prev => prev.map(item => item.pedido_id === act.pedido_id ? act : item));
      if (pedidoSeleccionado?.pedido_id === act.pedido_id) setPedidoSeleccionado(act);
    } catch {
      // Fallback local
      const actLocal = { ...p, estado: nuevoEstado };
      setPedidos(prev => prev.map(item => item.pedido_id === actLocal.pedido_id ? actLocal : item));
      if (pedidoSeleccionado?.pedido_id === actLocal.pedido_id) setPedidoSeleccionado(actLocal);
    }
    setToast({
      tipo: 'warning',
      titulo: 'Estado Logístico Actualizado',
      mensaje: `Pedido ${p.codigo_seguimiento} ahora se encuentra en estado: ${nuevoEstado}.`
    });
  };

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', paddingBottom: '3rem' }}>
      
      {/* HUD Apple Toasts */}
      {toast && (
        <div className="apple-toast-container">
          <div className={`apple-toast apple-toast-${toast.tipo === 'error' ? 'error' : 'success'}`}>
            {toast.tipo === 'error' ? (
              <AlertCircle size={20} className="toast-icon" />
            ) : toast.tipo === 'warning' ? (
              <ShieldAlert size={20} className="toast-icon" style={{ color: 'var(--apple-orange)' }} />
            ) : (
              <CheckCircle2 size={20} className="toast-icon" />
            )}
            <div className="apple-toast-content">
              <div className="apple-toast-title">{toast.titulo}</div>
              <div className="apple-toast-message">{toast.mensaje}</div>
            </div>
            <button className="apple-toast-close" onClick={() => setToast(null)}>
              <X size={15} />
            </button>
          </div>
        </div>
      )}

      {/* Cabecera Principal Sticky (Permanece siempre fija arriba al hacer scroll) */}
      <div style={{ 
        position: 'sticky', 
        top: '-2.25rem', 
        zIndex: 40,
        background: '#F5F4EE',
        paddingTop: '0.5rem',
        paddingBottom: '1rem',
        marginBottom: '1.5rem',
        borderBottom: '1.5px solid #D8DFCD',
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        flexWrap: 'wrap', 
        gap: '1rem' 
      }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem', padding: '0.2rem 0.65rem', borderRadius: '8px', background: '#EBF1E6', border: '1px solid #A7B38B', marginBottom: '0.35rem' }}>
            <Sparkles size={13} color="#556B2F" />
            <span style={{ fontSize: '0.72rem', fontWeight: 600, color: '#2D3A2E', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Sprint 2 · RF-002 (US-003) & RF-009 (US-004)
            </span>
          </div>
          <h1 style={{ fontSize: '1.65rem' }}>Gestión de Pedidos, Geolocalización y Clientes</h1>
          <p style={{ color: '#556B2F', fontSize: '0.85rem', marginTop: '0.15rem' }}>
            Plataforma para el registro de órdenes con geocodificación PostGIS y administración de restricciones.
          </p>
        </div>

        {/* Segmented Control macOS / visionOS */}
        <div className="segmented-control" style={{ minWidth: '380px' }}>
          <button 
            className={subTab === 'registro' ? 'selected' : ''} 
            onClick={() => setSubTab('registro')}
          >
            <PackageCheck size={15} />
            <span>Registro y Órdenes</span>
          </button>
          <button 
            className={subTab === 'preferencias' ? 'selected' : ''} 
            onClick={() => setSubTab('preferencias')}
          >
            <Sliders size={15} />
            <span>Preferencias (US-004)</span>
          </button>
          <button 
            className={subTab === 'mapa' ? 'selected' : ''} 
            onClick={() => setSubTab('mapa')}
          >
            <MapPin size={15} />
            <span>Mapa GPS</span>
          </button>
        </div>
      </div>

      {/* =====================================================================
          PESTAÑA 1: REGISTRO Y GESTIÓN DE PEDIDOS (US-003)
          ===================================================================== */}
      {subTab === 'registro' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', width: '100%' }}>
          
          {/* BLOQUE SUPERIOR COMPLETO: Formulario Nuevo Pedido de Entrega (100% Ancho) */}
          <div className="apple-card" style={{ padding: '1.6rem', marginBottom: 0, width: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <div style={{ background: '#F5F4EE', border: '1.5px solid #CAD3BD', borderRadius: '8px', padding: '0.35rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Plus size={18} color="#556B2F" />
                </div>
                <div>
                  <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#2D3A2E' }}>Nuevo Pedido de Entrega</h2>
                  <p style={{ fontSize: '0.75rem', color: '#6E7E5A', marginTop: '1px' }}>US-003: Registro y Georreferenciación de Órdenes en Lima Metropolitana</p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.45rem', alignItems: 'center' }}>
                <button 
                  type="button" 
                  onClick={llenarDatosPrueba}
                  className="btn-secondary" 
                  style={{ 
                    fontSize: '0.74rem', 
                    padding: '0.28rem 0.65rem', 
                    background: '#F0EFE9', 
                    borderColor: '#CAD3BD', 
                    color: '#2D3A2E', 
                    fontWeight: 600, 
                    display: 'inline-flex', 
                    alignItems: 'center', 
                    gap: '0.35rem' 
                  }}
                  title="Rellenar automáticamente con un cliente y dirección real de Lima"
                >
                  <Wand2 size={13} color="#556B2F" />
                  <span>Datos de Prueba</span>
                </button>
              </div>
            </div>

            <form onSubmit={handleCrearPedido} noValidate style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
              
              {/* Fila 1: Identificación del Pedido (Código, Cliente y Teléfono) */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#556B2F', marginBottom: '0.35rem', letterSpacing: '0.02em' }}>
                    CÓDIGO DE SEGUIMIENTO (ÚNICO)
                  </label>
                  <input 
                    type="text" 
                    value={codigo} 
                    onChange={e => setCodigo(e.target.value)} 
                    placeholder="Ej. PED-LIMA-105" 
                    style={{ width: '100%', fontFamily: 'monospace', fontWeight: 600 }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#2D3A2E', marginBottom: '0.35rem', letterSpacing: '0.02em' }}>
                    CLIENTE / RAZÓN SOCIAL *
                  </label>
                  <input 
                    ref={clienteInputRef}
                    type="text" 
                    value={cliente} 
                    onChange={e => setCliente(e.target.value)} 
                    placeholder="Ej. Distribuidora Santa Anita S.A.C." 
                    style={{ width: '100%' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#2D3A2E', marginBottom: '0.35rem', letterSpacing: '0.02em' }}>
                    TELÉFONO DE CONTACTO
                  </label>
                  <input 
                    type="tel" 
                    value={telefonoContacto} 
                    onChange={e => setTelefonoContacto(e.target.value)} 
                    placeholder="Ej. 984123456" 
                    style={{ width: '100%' }}
                  />
                </div>
              </div>

              {/* Fila 2: Ruta Logística · Origen y Destino */}
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', 
                gap: '1.2rem',
                background: '#FAF9F5',
                border: '1.5px solid #CAD3BD',
                borderRadius: '12px',
                padding: '1.15rem'
              }}>
                {/* Columna Izquierda: ORIGEN */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '0.35rem', borderBottom: '1px solid #CAD3BD' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                      <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: '#556B2F', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Home size={12} color="#FFFFFF" />
                      </div>
                      <div>
                        <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#2D3A2E' }}>
                          ORIGEN (PUNTO DE RECOJO / DESPACHO)
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => abrirMapaParaFijar('A')}
                      className="btn-secondary"
                      style={{ 
                        fontSize: '0.72rem', 
                        padding: '0.2rem 0.6rem', 
                        display: 'inline-flex', 
                        alignItems: 'center', 
                        gap: '0.35rem',
                        color: '#2D3A2E',
                        background: '#FFFFFF',
                        borderColor: '#CAD3BD',
                        fontWeight: 600,
                        borderRadius: '6px'
                      }}
                      title="Abrir mapa para fijar coordenadas de origen en Lima con Casa SVG"
                    >
                      <Home size={12} color="#556B2F" />
                      <span>Fijar en Mapa</span>
                    </button>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 700, color: '#2D3A2E', marginBottom: '0.35rem', letterSpacing: '0.01em' }}>
                      DIRECCIÓN DE ORIGEN *
                    </label>
                    <input 
                      ref={origenInputRef}
                      type="text" 
                      value={origenDireccion} 
                      onChange={e => setOrigenDireccion(e.target.value)} 
                      placeholder="Ej. Av. Argentina 2060, Callao (Centro de Distribución EcoLogística)" 
                      style={{ width: '100%', background: '#FFFFFF' }}
                    />
                    <div style={{ fontSize: '0.7rem', color: '#6E7E5A', marginTop: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <Navigation size={11} color="#556B2F" />
                      <span>GPS Origen fijado: <strong style={{ color: '#2D3A2E', fontFamily: 'monospace' }}>[{origenLat.toFixed(6)}, {origenLng.toFixed(6)}]</strong></span>
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 700, color: '#556B2F', marginBottom: '0.35rem', letterSpacing: '0.01em' }}>
                      REFERENCIA TEXTUAL DEL ORIGEN
                    </label>
                    <input 
                      type="text" 
                      value={referenciaUbicacion} 
                      onChange={e => setReferenciaUbicacion(e.target.value)} 
                      placeholder="Ej. Rampa de Despacho 4, Pabellón Este, ingresar por garita de pesaje..."
                      style={{ width: '100%', background: '#FFFFFF' }}
                    />
                    <div style={{ fontSize: '0.68rem', color: '#6E7E5A', marginTop: '0.25rem' }}>
                      * Referencia física/textual para el transportista exclusiva del punto de partida.
                    </div>
                  </div>
                </div>

                {/* Columna Derecha: DESTINO */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '0.35rem', borderBottom: '1px solid #CAD3BD' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                      <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: '#C47D2B', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Flag size={12} color="#FFFFFF" />
                      </div>
                      <div>
                        <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#2D3A2E' }}>
                          DESTINO (PUNTO DE ENTREGA)
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => abrirMapaParaFijar('B')}
                      className="btn-secondary"
                      style={{ 
                        fontSize: '0.72rem', 
                        padding: '0.2rem 0.6rem', 
                        display: 'inline-flex', 
                        alignItems: 'center', 
                        gap: '0.35rem',
                        color: '#2D3A2E',
                        background: '#FFFFFF',
                        borderColor: '#CAD3BD',
                        fontWeight: 600,
                        borderRadius: '6px'
                      }}
                      title="Abrir mapa para fijar coordenadas de entrega con Bandera de Fin de Carrera SVG"
                    >
                      <Flag size={12} color="#C47D2B" />
                      <span>Fijar en Mapa</span>
                    </button>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 700, color: '#2D3A2E', marginBottom: '0.35rem', letterSpacing: '0.01em' }}>
                      DIRECCIÓN DE DESTINO *
                    </label>
                    <input 
                      ref={direccionInputRef}
                      type="text" 
                      value={direccion} 
                      onChange={e => setDireccion(e.target.value)} 
                      placeholder="Ej. Av. Primavera 654, Santiago de Surco" 
                      style={{ width: '100%', background: '#FFFFFF' }}
                    />
                    <div style={{ fontSize: '0.7rem', color: '#6E7E5A', marginTop: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <Navigation size={11} color="#C47D2B" />
                      <span>GPS Destino fijado: <strong style={{ color: '#2D3A2E', fontFamily: 'monospace' }}>[{latitud.toFixed(6)}, {longitud.toFixed(6)}]</strong></span>
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 700, color: '#C47D2B', marginBottom: '0.35rem', letterSpacing: '0.01em' }}>
                      REFERENCIA TEXTUAL DEL DESTINO
                    </label>
                    <input 
                      type="text" 
                      value={referenciaDestino} 
                      onChange={e => setReferenciaDestino(e.target.value)} 
                      placeholder="Ej. Pasando el óvalo Higuereta, fachada con toldo verde, timbre 201..."
                      style={{ width: '100%', background: '#FFFFFF' }}
                    />
                    <div style={{ fontSize: '0.68rem', color: '#6E7E5A', marginTop: '0.25rem' }}>
                      * Referencia física/textual para el transportista exclusiva del punto de entrega.
                    </div>
                  </div>
                </div>
              </div>

              {/* Fila 3: Parámetros Operativos (Peso, Volumen, Ventana Inicio, Ventana Fin, Prioridad, Acceso) (6 Columnas) */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '0.85rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 700, color: '#2D3A2E', marginBottom: '0.35rem' }}>
                    PESO CARGA (KG) *
                  </label>
                  <input 
                    type="number" 
                    step="0.1" 
                    min="0.1" 
                    required 
                    value={peso} 
                    onChange={e => setPeso(parseFloat(e.target.value))} 
                    style={{ width: '100%' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 700, color: '#2D3A2E', marginBottom: '0.35rem' }}>
                    VOLUMEN (M³) *
                  </label>
                  <input 
                    type="number" 
                    step="0.05" 
                    min="0.01" 
                    required 
                    value={volumen} 
                    onChange={e => setVolumen(parseFloat(e.target.value))} 
                    style={{ width: '100%' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 700, color: '#2D3A2E', marginBottom: '0.35rem' }}>
                    VENTANA INICIO *
                  </label>
                  <input 
                    type="time" 
                    required 
                    value={vInicio} 
                    onChange={e => setVInicio(e.target.value)} 
                    style={{ width: '100%' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 700, color: '#2D3A2E', marginBottom: '0.35rem' }}>
                    VENTANA FIN *
                  </label>
                  <input 
                    type="time" 
                    required 
                    value={vFin} 
                    onChange={e => setVFin(e.target.value)} 
                    style={{ width: '100%' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 700, color: '#2D3A2E', marginBottom: '0.35rem' }}>
                    PRIORIDAD
                  </label>
                  <select 
                    value={prioridad} 
                    onChange={e => setPrioridad(e.target.value)} 
                    style={{ width: '100%' }}
                  >
                    <option value="BAJA">Baja</option>
                    <option value="ESTANDAR">Estándar</option>
                    <option value="ALTA">Alta</option>
                    <option value="URGENTE">Urgente</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 700, color: '#2D3A2E', marginBottom: '0.35rem' }}>
                    ACCESO VEHICULAR
                  </label>
                  <select 
                    value={restriccionAcceso} 
                    onChange={e => setRestriccionAcceso(e.target.value)} 
                    style={{ width: '100%' }}
                  >
                    {RESTRICCIONES_OPCIONES.map(r => (
                      <option key={r.valor} value={r.valor}>{r.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Fila 4: Botón de Envío */}
              <button 
                type="submit" 
                disabled={cargandoRegistro}
                onClick={(e) => {
                  if (!cargandoRegistro) {
                    handleCrearPedido(e);
                  }
                }}
                className="btn" 
                style={{ 
                  width: '100%', 
                  marginTop: '0.25rem', 
                  justifyContent: 'center',
                  padding: '0.85rem',
                  cursor: cargandoRegistro ? 'wait' : 'pointer',
                  opacity: cargandoRegistro ? 0.75 : 1,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  background: '#556B2F',
                  color: '#F5F4EE',
                  borderRadius: '10px',
                  border: '1px solid #485B27',
                  fontSize: '0.92rem',
                  fontWeight: 600
                }}
              >
                {cargandoRegistro ? (
                  <>
                    <RefreshCw size={16} className="spin" />
                    <span>Guardando Pedido en Supabase...</span>
                  </>
                ) : (
                  <>
                    <PackageCheck size={16} />
                    <span>Registrar Pedido con Coordenadas (US-003)</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* =================================================================
              BLOQUE INFERIOR: ÓRDENES REGISTRADAS EN CARDS PEQUEÑAS (GRID)
              ================================================================= */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%' }}>
            
            {/* Cabecera del Listado con Filtros y Buscador */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#2D3A2E' }}>
                  Órdenes Registradas ({pedidosFiltrados.length})
                </h2>
                {cargando && <RefreshCw size={14} className="spin" color="#556B2F" />}
              </div>

              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                {/* Buscador Rápido */}
                <div style={{ position: 'relative' }}>
                  <input 
                    type="text" 
                    placeholder="Buscar código o cliente..." 
                    value={busquedaOrden} 
                    onChange={e => setBusquedaOrden(e.target.value)} 
                    style={{ 
                      fontSize: '0.78rem', 
                      padding: '0.35rem 0.65rem 0.35rem 1.85rem', 
                      width: '210px', 
                      borderRadius: '8px' 
                    }} 
                  />
                  <Search size={13} color="#6E7E5A" style={{ position: 'absolute', left: '0.6rem', top: '50%', transform: 'translateY(-50%)' }} />
                </div>

                <select 
                  value={filtroEstado} 
                  onChange={e => setFiltroEstado(e.target.value)} 
                  style={{ fontSize: '0.78rem', padding: '0.35rem 0.65rem', borderRadius: '8px' }}
                >
                  <option value="TODOS">Todos los Estados</option>
                  <option value="PENDIENTE">Pendiente</option>
                  <option value="EN_TRANSITO">En Tránsito</option>
                  <option value="ENTREGADO">Entregado</option>
                </select>

                <select 
                  value={filtroPrioridad} 
                  onChange={e => setFiltroPrioridad(e.target.value)} 
                  style={{ fontSize: '0.78rem', padding: '0.35rem 0.65rem', borderRadius: '8px' }}
                >
                  <option value="TODOS">Todas las Prioridades</option>
                  <option value="BAJA">Baja</option>
                  <option value="ESTANDAR">Estándar</option>
                  <option value="ALTA">Alta</option>
                  <option value="URGENTE">Urgente</option>
                </select>
              </div>
            </div>

            {/* Grid de Cards Pequeñas (3 a 4 por fila según pantalla) */}
            {pedidosFiltrados.length === 0 ? (
              <div className="apple-card" style={{ padding: '2.5rem', textAlign: 'center', color: '#6E7E5A', background: '#FFFFFF' }}>
                <PackageCheck size={36} color="#CAD3BD" style={{ margin: '0 auto 0.75rem' }} />
                <p style={{ fontWeight: 600, color: '#2D3A2E' }}>No se encontraron órdenes registradas</p>
                <p style={{ fontSize: '0.8rem', marginTop: '0.25rem' }}>Prueba ajustando los filtros o registra un nuevo pedido en el formulario superior.</p>
              </div>
            ) : (
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fill, minmax(285px, 1fr))', 
                gap: '1rem',
                width: '100%'
              }}>
                {pedidosFiltrados.map(p => (
                  <div 
                    key={p.pedido_id} 
                    className="apple-card" 
                    style={{ 
                      padding: '1.1rem', 
                      marginBottom: 0,
                      display: 'flex', 
                      flexDirection: 'column', 
                      justifyContent: 'space-between', 
                      gap: '0.75rem',
                      borderRadius: '12px',
                      border: '1.5px solid #CAD3BD',
                      boxShadow: '0 2px 6px rgba(45, 58, 46, 0.05)',
                      background: '#FFFFFF'
                    }}
                  >
                    {/* Header de la Card */}
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.45rem' }}>
                        <span style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '0.88rem', color: '#556B2F' }}>
                          {p.codigo_seguimiento}
                        </span>
                        <div style={{ display: 'flex', gap: '0.3rem' }}>
                          <span className={`badge ${p.estado === 'EN_TRANSITO' ? 'badge-yellow' : p.estado === 'ENTREGADO' ? 'badge-blue' : 'badge-cyan'}`} style={{ fontSize: '0.67rem', padding: '0.15rem 0.45rem' }}>
                            {p.estado}
                          </span>
                          <span className={`badge ${p.prioridad === 'URGENTE' ? 'badge-red' : p.prioridad === 'ALTA' ? 'badge-yellow' : 'badge-blue'}`} style={{ fontSize: '0.67rem', padding: '0.15rem 0.45rem' }}>
                            {p.prioridad}
                          </span>
                        </div>
                      </div>

                      {/* Cliente */}
                      <h3 style={{ fontSize: '0.94rem', fontWeight: 700, color: '#2D3A2E', lineHeight: 1.25, marginBottom: '0.4rem' }}>
                        {p.cliente_nombre}
                      </h3>

                      {/* Origen */}
                      <div style={{ fontSize: '0.74rem', color: '#2D3A2E', display: 'flex', alignItems: 'flex-start', gap: '0.35rem', lineHeight: 1.3, marginBottom: '0.25rem' }}>
                        <span style={{ fontSize: '0.64rem', fontWeight: 700, background: '#EBF1E6', border: '1px solid #CAD3BD', borderRadius: '4px', padding: '1px 5px', color: '#556B2F', flexShrink: 0, display: 'inline-flex', alignItems: 'center', gap: '2px' }}>
                          <Home size={10} color="#556B2F" /> Origen
                        </span>
                        <span style={{ color: '#556B2F', fontWeight: 600, fontSize: '0.73rem' }}>{p.origen_direccion || 'Centro de Distribución Central'}</span>
                      </div>

                      {/* Destino */}
                      <div style={{ fontSize: '0.74rem', color: '#2D3A2E', display: 'flex', alignItems: 'flex-start', gap: '0.35rem', lineHeight: 1.3 }}>
                        <span style={{ fontSize: '0.64rem', fontWeight: 700, background: '#FBEEDB', border: '1px solid #E5CEAC', borderRadius: '4px', padding: '1px 5px', color: '#C47D2B', flexShrink: 0, display: 'inline-flex', alignItems: 'center', gap: '2px' }}>
                          <Flag size={10} color="#C47D2B" /> Destino
                        </span>
                        <span style={{ color: '#2D3A2E', fontSize: '0.73rem' }}>{p.direccion_destino}</span>
                      </div>
                    </div>

                    {/* Parámetros Operativos en Caja Compacta */}
                    <div style={{ background: '#F7F6F1', padding: '0.55rem 0.7rem', borderRadius: '8px', border: '1px solid #CAD3BD', display: 'flex', flexDirection: 'column', gap: '0.35rem', fontSize: '0.73rem', color: '#2D3A2E' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                          <Weight size={12} color="#556B2F" />
                          <strong>{p.peso_kg} kg</strong> · {p.volumen_m3} m³
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: '#2D3A2E' }}>
                          <Clock size={12} color="#556B2F" />
                          {p.ventana_inicio} - {p.ventana_fin}
                        </span>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px dashed #CAD3BD', paddingTop: '0.35rem' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: '#6E7E5A' }}>
                          <Navigation size={12} color="#556B2F" />
                          [{p.latitud.toFixed(3)}, {p.longitud.toFixed(3)}]
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: '#C47D2B', fontWeight: 600, fontSize: '0.7rem' }}>
                          <Store size={12} />
                          {p.restriccion_acceso ? p.restriccion_acceso.replace(/_/g, ' ') : 'LIBRE'}
                        </span>
                      </div>

                      {p.referencia_ubicacion && (
                        <div style={{ borderTop: '1px dashed #CAD3BD', paddingTop: '0.3rem', color: '#556B2F', fontSize: '0.7rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                          <strong>Ref. Origen (A):</strong> {p.referencia_ubicacion}
                        </div>
                      )}
                    </div>

                    {/* Acciones */}
                    <div style={{ display: 'flex', gap: '0.4rem', borderTop: '1px solid #EAE8DF', paddingTop: '0.6rem' }}>
                      <button 
                        onClick={() => {
                          cargarPedidoEnPreferencias(p);
                          setSubTab('preferencias');
                        }}
                        className="btn-secondary" 
                        title="Gestionar preferencias y restricciones de este cliente (US-004)"
                        style={{ flex: 1, fontSize: '0.72rem', padding: '0.35rem 0.45rem', justifyContent: 'center' }}
                      >
                        <Sliders size={13} color="#556B2F" />
                        <span>Preferencias</span>
                      </button>
                      <button 
                        onClick={() => toggleEstadoPedido(p)}
                        className="btn-secondary" 
                        title={p.estado === 'PENDIENTE' ? 'Cambiar a En Tránsito' : 'Regresar a Pendiente'}
                        style={{ 
                          flex: 1, 
                          fontSize: '0.72rem', 
                          padding: '0.35rem 0.45rem', 
                          justifyContent: 'center',
                          color: p.estado === 'PENDIENTE' ? '#C47D2B' : '#556B2F',
                          borderColor: p.estado === 'PENDIENTE' ? '#E5CEAC' : '#CAD3BD'
                        }}
                      >
                        <Truck size={13} />
                        <span>{p.estado === 'PENDIENTE' ? 'En Tránsito' : 'Pendiente'}</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* =====================================================================
          PESTAÑA 2: GESTIÓN DE PREFERENCIAS Y RESTRICCIONES (US-004)
          ===================================================================== */}
      {subTab === 'preferencias' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(320px, 420px) 1fr', gap: '1.75rem' }}>
          
          {/* Panel Lateral: Selector de Cliente/Pedido */}
          <div className="apple-card" style={{ padding: '1.25rem' }}>
            <h2 style={{ marginBottom: '0.4rem' }}>Seleccionar Cliente / Pedido</h2>
            <p style={{ fontSize: '0.78rem', color: 'var(--apple-text-secondary)', marginBottom: '1rem' }}>
              Elige el pedido a configurar para adaptar las ventanas y acceso vehicular.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              {pedidos.map(p => (
                <div 
                  key={p.pedido_id}
                  onClick={() => cargarPedidoEnPreferencias(p)}
                  style={{
                    padding: '0.85rem',
                    borderRadius: '10px',
                    cursor: 'pointer',
                    background: pedidoSeleccionado?.pedido_id === p.pedido_id ? 'var(--apple-accent-surface)' : '#FFFFFF',
                    border: pedidoSeleccionado?.pedido_id === p.pedido_id ? '1.5px solid var(--apple-accent-border)' : '1px solid var(--apple-card-border)',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.2rem' }}>
                    <span style={{ fontWeight: 600, fontSize: '0.82rem', color: pedidoSeleccionado?.pedido_id === p.pedido_id ? 'var(--apple-accent-text)' : 'var(--apple-text-primary)' }}>
                      {p.codigo_seguimiento}
                    </span>
                    <span className={`badge ${p.estado === 'EN_TRANSITO' ? 'badge-yellow' : 'badge-blue'}`} style={{ fontSize: '0.65rem' }}>
                      {p.estado}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--apple-text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {p.cliente_nombre}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Formulario de Preferencias del Cliente (US-004) */}
          {pedidoSeleccionado && (
            <div className="apple-card" style={{ padding: '1.75rem' }}>
              
              {/* Alerta de Pedido en Tránsito (Regla RN-007 / RN-010) */}
              {pedidoSeleccionado.estado === 'EN_TRANSITO' && (
                <div className="apple-banner apple-banner-error" style={{ marginBottom: '1.25rem' }}>
                  <ShieldAlert size={18} style={{ flexShrink: 0 }} />
                  <div>
                    <div style={{ fontWeight: 600 }}>Aviso de Gobernanza (Regla RN-007 / RN-010):</div>
                    <div>Este pedido se encuentra en tránsito activo. El sistema bloqueará cualquier modificación de horarios o restricciones de acceso.</div>
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <div>
                  <h2 style={{ fontSize: '1.15rem' }}>Preferencias de Entrega: {pedidoSeleccionado.cliente_nombre}</h2>
                  <p style={{ fontSize: '0.78rem', color: 'var(--apple-text-secondary)' }}>
                    Código de Orden: <code>{pedidoSeleccionado.codigo_seguimiento}</code> · Estado Actual: <strong>{pedidoSeleccionado.estado}</strong>
                  </p>
                </div>
                
                {/* Botón de cambio rápido para probar el bloqueo */}
                <button 
                  onClick={() => toggleEstadoPedido(pedidoSeleccionado)}
                  className="btn-secondary"
                  style={{ fontSize: '0.72rem', padding: '0.35rem 0.65rem' }}
                >
                  <Truck size={13} /> {pedidoSeleccionado.estado === 'PENDIENTE' ? 'Simular En Tránsito' : 'Poner Pendiente'}
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                
                {/* 1. Horarios de Atención del Establecimiento */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--apple-text-secondary)', marginBottom: '0.5rem' }}>
                    HORARIOS DE ATENCIÓN / VENTANA PERMITIDA DE RECEPCIÓN (RN-007)
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div>
                      <span style={{ fontSize: '0.72rem', color: 'var(--apple-text-tertiary)' }}>Hora Apertura:</span>
                      <input 
                        type="time" 
                        value={prefVInicio} 
                        onChange={e => setPrefVInicio(e.target.value)} 
                        style={{ width: '100%' }}
                      />
                    </div>
                    <div>
                      <span style={{ fontSize: '0.72rem', color: 'var(--apple-text-tertiary)' }}>Hora Cierre:</span>
                      <input 
                        type="time" 
                        value={prefVFin} 
                        onChange={e => setPrefVFin(e.target.value)} 
                        style={{ width: '100%' }}
                      />
                    </div>
                  </div>
                </div>

                {/* 2. Restricciones de Acceso Vehicular */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--apple-text-secondary)', marginBottom: '0.5rem' }}>
                    RESTRICCIÓN DE ACCESO VEHICULAR (CONDICIONES DE CALLE / LOCAL)
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.65rem' }}>
                    {RESTRICCIONES_OPCIONES.map(opt => (
                      <div 
                        key={opt.valor}
                        onClick={() => setPrefRestriccion(opt.valor)}
                        style={{
                          padding: '0.75rem',
                          borderRadius: '10px',
                          cursor: 'pointer',
                          background: prefRestriccion === opt.valor ? 'var(--apple-accent-surface)' : '#FFFFFF',
                          border: prefRestriccion === opt.valor ? '1.5px solid var(--apple-accent)' : '1px solid var(--apple-card-border)',
                          transition: 'all 0.12s ease'
                        }}
                      >
                        <div style={{ fontWeight: 600, fontSize: '0.82rem', color: prefRestriccion === opt.valor ? 'var(--apple-accent-text)' : 'var(--apple-text-primary)' }}>
                          {opt.label}
                        </div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--apple-text-tertiary)', marginTop: '2px' }}>
                          {opt.desc}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 3. Referencias de Entrega y Teléfono */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--apple-text-secondary)', marginBottom: '0.35rem' }}>
                      REFERENCIA TEXTUAL DEL ORIGEN
                    </label>
                    <textarea 
                      rows={3} 
                      value={prefReferencia} 
                      onChange={e => setPrefReferencia(e.target.value)} 
                      placeholder="Instrucciones para el punto de recojo (rampa de carga, muelle este, garita de pesaje...)"
                      style={{ width: '100%', resize: 'none' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--apple-text-secondary)', marginBottom: '0.35rem' }}>
                      TELÉFONO DE CONTACTO RECEPTOR
                    </label>
                    <input 
                      type="text" 
                      value={prefTelefono} 
                      onChange={e => setPrefTelefono(e.target.value)} 
                      placeholder="Ej. 987112233" 
                      style={{ width: '100%', marginBottom: '0.5rem' }}
                    />
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--apple-text-secondary)', marginBottom: '0.35rem' }}>
                      URL FOTOGRAFÍA DE REFERENCIA (FACHADA)
                    </label>
                    <input 
                      type="url" 
                      value={prefFotoUrl} 
                      onChange={e => setPrefFotoUrl(e.target.value)} 
                      placeholder="https://..." 
                      style={{ width: '100%' }}
                    />
                  </div>
                </div>

                {/* 4. Previsualización Visual Instantánea (< 1 seg, Criterio Ruta Feliz RF-009) */}
                {prefFotoUrl && (
                  <div style={{ background: '#F7F6F1', padding: '0.85rem', borderRadius: '10px', border: '1.5px solid #CAD3BD' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.5rem', fontSize: '0.76rem', fontWeight: 600, color: 'var(--apple-cyan-text)' }}>
                      <Eye size={14} /> REFERENCIA VISUAL DE FACHADA (TIEMPO DE RESPUESTA &lt; 1 SEG)
                    </div>
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                      <img 
                        src={prefFotoUrl} 
                        alt="Fachada de cliente" 
                        style={{ width: '120px', height: '80px', objectFit: 'cover', borderRadius: '8px', border: '1px solid var(--apple-chrome-border)' }}
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                      <div style={{ fontSize: '0.75rem', color: 'var(--apple-text-secondary)' }}>
                        Esta fotografía se desplegará al conductor en la app móvil al aproximarse a la geocerca de los 100 m para confirmación de entrega (POD).
                      </div>
                    </div>
                  </div>
                )}

                {/* Botón de Guardado */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                  <button 
                    onClick={handleGuardarPreferencias}
                    className="btn"
                    style={{ padding: '0.65rem 1.4rem' }}
                  >
                    <Check size={16} />
                    <span>Guardar Preferencias del Cliente (US-004)</span>
                  </button>
                </div>

              </div>
            </div>
          )}
        </div>
      )}

      {/* =====================================================================
          PESTAÑA 3: MAPA INTERACTIVO DE ENTREGAS (PERSISTENTE EN EL DOM)
          ===================================================================== */}
      <div style={{ display: subTab === 'mapa' ? 'block' : 'none' }}>
        <div 
          className={mapaMaximizado ? "mapa-fullscreen-container" : "apple-card"}
          style={mapaMaximizado ? {
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            zIndex: 99999,
            background: '#F5F4EE',
            padding: '1.25rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem',
            margin: 0,
            borderRadius: 0,
            border: 'none',
            boxShadow: 'none',
            boxSizing: 'border-box'
          } : {
            padding: '1.25rem',
            position: 'relative'
          }}
        >
          {/* Barra Superior de Control del Mapa */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.75rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <MapPin size={18} color="#556B2F" />
                <h2 style={{ fontSize: '1.15rem' }}>
                  {mapaMaximizado ? 'Mapa GPS a Pantalla Completa (Ver al Máximo)' : 'Mapa Geoespacial de Órdenes y Geocodificación Manual'}
                </h2>
              </div>
              <p style={{ fontSize: '0.78rem', color: '#556B2F', marginTop: '2px' }}>
                Haz clic en cualquier punto de Lima para capturar coordenadas exactas o inspecciona los pedidos registrados.
              </p>
            </div>

            {/* Acciones y Botón de Pantalla Completa */}
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
              {/* Selector de Modo de Fijación con Clic */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.3rem',
                background: '#FFFFFF',
                border: '1.5px solid #CAD3BD',
                borderRadius: '8px',
                padding: '0.2rem 0.35rem'
              }}>
                <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#6E7E5A', padding: '0 0.25rem' }}>
                  Fijar con Clic:
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setModoFijarPunto('A');
                    modoFijarPuntoRef.current = 'A';
                    if (markerPuntoARef.current && mapInstanceRef.current) {
                      mapInstanceRef.current.setView(markerPuntoARef.current.getLatLng(), 15, { animate: true });
                    }
                  }}
                  style={{
                    fontSize: '0.72rem',
                    fontWeight: 600,
                    padding: '0.25rem 0.55rem',
                    borderRadius: '6px',
                    border: modoFijarPunto === 'A' ? '1.5px solid #556B2F' : '1px solid transparent',
                    background: modoFijarPunto === 'A' ? '#EBF1E6' : 'transparent',
                    color: modoFijarPunto === 'A' ? '#556B2F' : '#2D3A2E',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.3rem'
                  }}
                  title="Fijar Origen (con Casa SVG)"
                >
                  <Home size={12} color="#556B2F" />
                  <span>Origen (Casa Despacho)</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setModoFijarPunto('B');
                    modoFijarPuntoRef.current = 'B';
                    if (markerPuntoBRef.current && mapInstanceRef.current) {
                      mapInstanceRef.current.setView(markerPuntoBRef.current.getLatLng(), 15, { animate: true });
                    }
                  }}
                  style={{
                    fontSize: '0.72rem',
                    fontWeight: 600,
                    padding: '0.25rem 0.55rem',
                    borderRadius: '6px',
                    border: modoFijarPunto === 'B' ? '1.5px solid #C47D2B' : '1px solid transparent',
                    background: modoFijarPunto === 'B' ? '#FBF4E8' : 'transparent',
                    color: modoFijarPunto === 'B' ? '#C47D2B' : '#2D3A2E',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.3rem'
                  }}
                  title="Fijar Destino (con Bandera de Meta SVG)"
                >
                  <Flag size={12} color="#C47D2B" />
                  <span>Destino (Bandera Meta)</span>
                </button>
              </div>

              <button 
                type="button" 
                onClick={centrarEnLima}
                className="btn-secondary"
                style={{ fontSize: '0.74rem', padding: '0.35rem 0.7rem' }}
                title="Centrar vista en Lima Centro"
              >
                <Crosshair size={13} />
                <span>Centrar en Lima</span>
              </button>

              <button 
                type="button" 
                onClick={verTodosLosPedidos}
                className="btn-secondary"
                style={{ fontSize: '0.74rem', padding: '0.35rem 0.7rem' }}
                title="Enfocar todos los pedidos registrados"
              >
                <Navigation size={13} />
                <span>Ver Pedidos ({pedidos.length})</span>
              </button>

              <button 
                type="button" 
                onClick={() => setMapaMaximizado(!mapaMaximizado)}
                className="btn"
                style={{ fontSize: '0.74rem', padding: '0.35rem 0.85rem' }}
              >
                {mapaMaximizado ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
                <span>{mapaMaximizado ? 'Salir de Pantalla Completa (Esc)' : 'Ver al Máximo (Pantalla Completa)'}</span>
              </button>
            </div>
          </div>

          {/* Contenedor del Mapa Leaflet */}
          <div style={{ position: 'relative', width: '100%', flex: mapaMaximizado ? 1 : 'unset' }}>
            <div 
              ref={mapContainerRef} 
              style={{ 
                width: '100%', 
                height: mapaMaximizado ? 'calc(100vh - 120px)' : 'calc(100vh - 280px)', 
                minHeight: '500px',
                borderRadius: '12px', 
                border: '1.5px solid #CAD3BD',
                background: '#EAE8DF',
                boxShadow: '0 2px 8px rgba(45, 58, 46, 0.06)'
              }} 
            />

            {/* Floating Pill con Coordenadas Capturadas (Origen y Destino) */}
            <div style={{
              position: 'absolute',
              bottom: '20px',
              left: '50%',
              transform: 'translateX(-50%)',
              zIndex: 1000,
              background: '#FFFFFF',
              border: '1.5px solid #CAD3BD',
              borderRadius: '12px',
              padding: '0.65rem 1.15rem',
              boxShadow: '0 6px 20px rgba(45, 58, 46, 0.16)',
              display: 'flex',
              alignItems: 'center',
              gap: '1.25rem',
              maxWidth: '94%',
              flexWrap: 'wrap'
            }}>
              {/* Origen (Casa Despacho) */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', paddingRight: '0.85rem', borderRight: '1px solid #CAD3BD' }}>
                <Home size={16} color="#556B2F" />
                <div>
                  <div style={{ fontSize: '0.65rem', fontWeight: 700, color: '#556B2F', textTransform: 'uppercase' }}>
                    Origen (Casa Despacho):
                  </div>
                  <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#2D3A2E', fontFamily: 'monospace' }}>
                    [{origenLat.toFixed(5)}, {origenLng.toFixed(5)}]
                  </div>
                  <div style={{ fontSize: '0.68rem', color: '#6E7E5A', maxWidth: '180px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {origenDireccion}
                  </div>
                </div>
              </div>

              {/* Destino (Bandera Meta) */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                <Flag size={16} color="#C47D2B" />
                <div>
                  <div style={{ fontSize: '0.65rem', fontWeight: 700, color: '#C47D2B', textTransform: 'uppercase' }}>
                    Destino (Bandera Meta):
                  </div>
                  <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#2D3A2E', fontFamily: 'monospace' }}>
                    [{latitud.toFixed(5)}, {longitud.toFixed(5)}]
                  </div>
                  <div style={{ fontSize: '0.68rem', color: '#6E7E5A', maxWidth: '180px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {direccion || 'Sin fijar'}
                  </div>
                </div>
              </div>

              {/* Botón Volver al Formulario */}
              <button
                type="button"
                onClick={() => {
                  if (mapaMaximizado) setMapaMaximizado(false);
                  setSubTab('registro');
                  setToast({
                    tipo: 'success',
                    titulo: 'Coordenadas Listas',
                    mensaje: `Origen (Casa) y Destino (Bandera) listos en el formulario de registro.`
                  });
                }}
                className="btn"
                style={{ fontSize: '0.78rem', padding: '0.4rem 0.85rem', marginLeft: 'auto' }}
              >
                <PackageCheck size={14} />
                <span>Volver al Formulario</span>
              </button>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}

export default PedidosView;
