import React, { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import {
  Route as RouteIcon,
  MapPin,
  Truck,
  Leaf,
  Cpu,
  Zap,
  Clock,
  AlertTriangle,
  ShieldAlert,
  RotateCcw,
  Sparkles,
  CheckCircle2,
  Calendar,
  Layers,
  ChevronRight,
  Info,
  SlidersHorizontal,
  XCircle,
  FileText,
  X,
  AlertCircle
} from 'lucide-react';
import {
  RutaService,
  RutaDetalle,
  Tramo,
  ZonaRiesgo,
  PedidoNoAsignadoInfo
} from '../services/api';

interface ToastInfo {
  id: string;
  type: 'success' | 'warning' | 'error' | 'info';
  title: string;
  message: string;
}

export const RutasView: React.FC = () => {
  const [rutas, setRutas] = useState<RutaDetalle[]>([]);
  const [rutaSeleccionada, setRutaSeleccionada] = useState<RutaDetalle | null>(null);
  const [zonasRiesgo, setZonasRiesgo] = useState<ZonaRiesgo[]>([]);
  const [pedidosExcedentes, setPedidosExcedentes] = useState<PedidoNoAsignadoInfo[]>([]);
  
  const [loading, setLoading] = useState<boolean>(false);
  const [optimizing, setOptimizing] = useState<boolean>(false);
  const [mapFallback, setMapFallback] = useState<boolean>(false);
  const [mostrarZonasRiesgo, setMostrarZonasRiesgo] = useState<boolean>(true);
  
  // Modal de reoptimización (US-007)
  const [showReoptModal, setShowReoptModal] = useState<boolean>(false);
  const [pedidoACancelarId, setPedidoACancelarId] = useState<string>('');
  const [motivoReopt, setMotivoReopt] = useState<string>('CANCELACION_CLIENTE_VENTANA_CERRADA');
  const [evitarRiesgoActivo, setEvitarRiesgoActivo] = useState<boolean>(false);
  const [reoptimizing, setReoptimizing] = useState<boolean>(false);

  // Toasts
  const [toasts, setToasts] = useState<ToastInfo[]>([]);

  // Referencias de Leaflet
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const leafletMapRef = useRef<L.Map | null>(null);
  const layersGroupRef = useRef<L.LayerGroup | null>(null);

  const showToast = (type: 'success' | 'warning' | 'error' | 'info', title: string, message: string) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts(prev => [...prev, { id, type, title, message }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // Cargar catálogo de zonas y rutas existentes
  useEffect(() => {
    cargarDatosIniciales();
  }, []);

  const cargarDatosIniciales = async () => {
    setLoading(true);
    try {
      const [zonasRes, rutasRes] = await Promise.all([
        RutaService.getZonasRiesgo().catch(() => []),
        RutaService.list().catch(() => [])
      ]);
      setZonasRiesgo(zonasRes);
      setRutas(rutasRes);
      if (rutasRes.length > 0) {
        setRutaSeleccionada(rutasRes[0]);
      }
    } catch (err) {
      console.error(err);
      showToast('error', 'Error de Carga', 'No se pudieron recuperar las rutas planificadas.');
    } finally {
      setLoading(false);
    }
  };

  // Inicializar o actualizar mapa de Leaflet
  useEffect(() => {
    if (mapFallback || !mapContainerRef.current) return;

    try {
      if (!leafletMapRef.current) {
        // Centro inicial: Lima Metropolitana (-12.0450, -77.0600)
        const map = L.map(mapContainerRef.current, {
          center: [-12.0450, -77.0600],
          zoom: 12,
          zoomControl: true,
          attributionControl: true
        });

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19,
          attribution: '&copy; OpenStreetMap contribuyentes · EcoLogística'
        }).addTo(map);

        const group = L.layerGroup().addTo(map);
        layersGroupRef.current = group;
        leafletMapRef.current = map;
      }

      renderizarElementosMapa();
    } catch (err) {
      console.error('Error al inicializar mapa:', err);
      setMapFallback(true);
      showToast('warning', 'Alerta de Mapas', 'Servicio de mapas no disponible temporalmente.');
    }

    return () => {
      // Cleanup on unmount
    };
  }, [rutaSeleccionada, zonasRiesgo, mostrarZonasRiesgo, mapFallback]);

  const renderizarElementosMapa = () => {
    const map = leafletMapRef.current;
    const group = layersGroupRef.current;
    if (!map || !group) return;

    group.clearLayers();
    const bounds = L.latLngBounds([]);

    // 1. Renderizar Polígonos de Riesgo y ZBE (US-006)
    if (mostrarZonasRiesgo) {
      zonasRiesgo.forEach(z => {
        const coordsLatLng: L.LatLngExpression[] = z.poligono_coordenadas.map(coord => [coord[1], coord[0]]);
        const isZBE = z.nivel_peligro === 'ZBE_AMBIENTAL';
        const color = isZBE ? '#8B5CF6' : z.nivel_peligro === 'ALTO' ? '#EF4444' : '#F59E0B';

        const polygon = L.polygon(coordsLatLng, {
          color: color,
          weight: 2,
          fillColor: color,
          fillOpacity: 0.18,
          dashArray: isZBE ? '6, 6' : undefined
        });

        polygon.bindTooltip(
          `<strong>${z.nombre}</strong><br/><em>${z.motivo}</em><br/>Nivel: ${z.nivel_peligro}`,
          { sticky: true }
        );
        group.addLayer(polygon);
      });
    }

    // 2. Renderizar Tramos y Paradas de la Ruta Seleccionada (US-006)
    if (rutaSeleccionada && rutaSeleccionada.tramos.length > 0) {
      const latlngs: [number, number][] = [];

      rutaSeleccionada.tramos.forEach(tramo => {
        const lat = tramo.latitud;
        const lng = tramo.longitud;
        if (!lat || !lng) return;

        latlngs.push([lat, lng]);
        bounds.extend([lat, lng]);

        let markerHtml = '';
        if (tramo.tipo_parada === 'DEPOSITO_SALIDA' || tramo.tipo_parada === 'DEPOSITO_RETORNO') {
          markerHtml = `
            <div style="
              width: 34px; height: 34px; border-radius: 50%;
              background: #2D3A2E; border: 2.5px solid #FFFFFF;
              display: flex; align-items: center; justify-content: center;
              box-shadow: 0 4px 10px rgba(0,0,0,0.3); color: #F5F4EE;
              font-weight: 700; font-size: 11px;
            ">
              HUB
            </div>
          `;
        } else if (tramo.tipo_parada === 'DESCANSO_TECNICO_30MIN') {
          markerHtml = `
            <div style="
              width: 32px; height: 32px; border-radius: 50%;
              background: #3B82F6; border: 2.5px solid #FFFFFF;
              display: flex; align-items: center; justify-content: center;
              box-shadow: 0 4px 10px rgba(0,0,0,0.3); color: #FFFFFF;
              font-weight: 700; font-size: 11px;
            ">
              30m
            </div>
          `;
        } else {
          const bg = tramo.alerta_zona_riesgo ? '#DC2626' : '#0D9417';
          markerHtml = `
            <div style="
              width: 28px; height: 28px; border-radius: 50%;
              background: ${bg}; border: 2px solid #FFFFFF;
              display: flex; align-items: center; justify-content: center;
              box-shadow: 0 4px 8px rgba(0,0,0,0.25); color: #FFFFFF;
              font-weight: 700; font-size: 12px;
            ">
              ${tramo.orden_secuencia}
            </div>
          `;
        }

        const customIcon = L.divIcon({
          html: markerHtml,
          className: 'custom-stop-marker',
          iconSize: [32, 32],
          iconAnchor: [16, 16]
        });

        const marker = L.marker([lat, lng], { icon: customIcon });
        marker.bindPopup(`
          <div style="font-family: inherit; font-size: 13px; line-height: 1.45;">
            <div style="font-weight: 700; color: #2D3A2E; margin-bottom: 4px;">
              Parada #${tramo.orden_secuencia}: ${tramo.tipo_parada}
            </div>
            <div style="color: #4A5568; margin-bottom: 6px;">
              ${tramo.descripcion || 'Sin descripción'}
            </div>
            <div style="font-size: 11px; color: #718096;">
              Distancia: <strong>${tramo.distancia_tramo_km} km</strong> | Tiempo: <strong>${tramo.tiempo_estimado_min} min</strong>
            </div>
            ${tramo.alerta_zona_riesgo ? `
              <div style="margin-top: 6px; padding: 4px 8px; border-radius: 6px; background: #FEE2E2; color: #991B1B; font-size: 11px; font-weight: 600;">
                Zona de Riesgo: ${tramo.nombre_zona_riesgo}
              </div>
            ` : ''}
          </div>
        `);
        group.addLayer(marker);
      });

      // Trazado de la Polyline de la Ruta
      if (latlngs.length >= 2) {
        const polyline = L.polyline(latlngs, {
          color: '#0D9417',
          weight: 4.5,
          opacity: 0.85,
          dashArray: undefined,
          lineJoin: 'round'
        });
        group.addLayer(polyline);

        if (bounds.isValid()) {
          map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
        }
      }
    }
  };

  // Disparar Motor de Optimización CVRPTW (US-005)
  const handleOptimizar = async () => {
    setOptimizing(true);
    try {
      const response = await RutaService.optimizar({
        factor_capacidad_max: 0.90
      });

      setRutas(response.rutas);
      setPedidosExcedentes(response.pedidos_no_asignados);

      if (response.rutas.length > 0) {
        setRutaSeleccionada(response.rutas[0]);
      }

      showToast(
        'success',
        'Optimización CVRPTW Exitosa',
        `Generadas ${response.rutas.length} rutas. Huella computacional: ${response.co2_computacional_total_kg.toFixed(8)} kg CO2 (CodeCarbon).`
      );
    } catch (err: any) {
      console.error(err);
      const msg = err.response?.data?.detail || 'No se pudo completar la optimización algorítmica.';
      showToast('error', 'Error en Optimización', msg);
    } finally {
      setOptimizing(false);
    }
  };

  // Ejecutar Reoptimización Dinámica ante Evento (US-007)
  const handleReoptimizar = async () => {
    if (!rutaSeleccionada) return;
    setReoptimizing(true);
    try {
      const response = await RutaService.reoptimizar(rutaSeleccionada.ruta_id, {
        pedido_cancelado_id: pedidoACancelarId || undefined,
        motivo_incidencia: motivoReopt,
        evitar_zona_riesgo: evitarRiesgoActivo
      });

      // Actualizar la ruta en el estado
      const actualizadas = rutas.map(r => {
        if (r.ruta_id === rutaSeleccionada.ruta_id) {
          return {
            ...r,
            distancia_total_km: response.distancia_total_km,
            tiempo_total_min: response.tiempo_total_min,
            co2_total_kg: response.co2_total_kg,
            co2_computacional_kg: response.co2_computacional_kg,
            tramos: response.tramos
          };
        }
        return r;
      });

      setRutas(actualizadas);
      const nuevaSel = actualizadas.find(r => r.ruta_id === rutaSeleccionada.ruta_id) || null;
      setRutaSeleccionada(nuevaSel);

      setShowReoptModal(false);
      setPedidoACancelarId('');
      showToast('success', 'Recálculo Dinámico Completado', response.mensaje);
    } catch (err: any) {
      console.error(err);
      const msg = err.response?.data?.detail || 'Error al reoptimizar la ruta en tiempo real.';
      showToast('error', 'Error en Recálculo', msg);
    } finally {
      setReoptimizing(false);
    }
  };

  // Pedidos con tramo en la ruta seleccionada (para el modal de cancelación)
  const pedidosEnRuta = rutaSeleccionada
    ? rutaSeleccionada.tramos.filter(t => t.pedido_id && t.tipo_parada === 'ENTREGA')
    : [];

  return (
    <div style={{ padding: '1.5rem', maxWidth: '1440px', margin: '0 auto', color: '#1F2937' }}>
      
      {/* Toast Notifications a la derecha superior */}
      <div style={{
        position: 'fixed',
        top: '1.5rem',
        right: '1.5rem',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        gap: '0.75rem',
        maxWidth: '380px'
      }}>
        {toasts.map(t => (
          <div
            key={t.id}
            style={{
              padding: '0.85rem 1.15rem',
              borderRadius: '12px',
              backdropFilter: 'blur(16px)',
              background: t.type === 'error' ? 'rgba(254, 226, 226, 0.95)' :
                          t.type === 'warning' ? 'rgba(254, 243, 199, 0.95)' :
                          t.type === 'success' ? 'rgba(236, 253, 245, 0.95)' :
                          'rgba(243, 244, 246, 0.95)',
              border: `1.5px solid ${
                t.type === 'error' ? '#F87171' :
                t.type === 'warning' ? '#FBBF24' :
                t.type === 'success' ? '#34D399' :
                '#9CA3AF'
              }`,
              boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '0.75rem',
              transition: 'all 0.2s ease'
            }}
          >
            {t.type === 'error' && <AlertCircle size={20} color="#DC2626" style={{ flexShrink: 0, marginTop: '2px' }} />}
            {t.type === 'warning' && <AlertTriangle size={20} color="#D97706" style={{ flexShrink: 0, marginTop: '2px' }} />}
            {t.type === 'success' && <CheckCircle2 size={20} color="#059669" style={{ flexShrink: 0, marginTop: '2px' }} />}
            {t.type === 'info' && <Info size={20} color="#4B5563" style={{ flexShrink: 0, marginTop: '2px' }} />}
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: '0.86rem', color: '#111827' }}>{t.title}</div>
              <div style={{ fontSize: '0.78rem', color: '#4B5563', marginTop: '2px' }}>{t.message}</div>
            </div>
            <button
              onClick={() => removeToast(t.id)}
              style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#9CA3AF', padding: '0 2px' }}
            >
              <X size={15} />
            </button>
          </div>
        ))}
      </div>

      {/* Cabecera Principal de Gestión de Rutas */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '1rem',
        marginBottom: '1.5rem',
        borderBottom: '1px solid #E5E7EB',
        paddingBottom: '1.25rem'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <RouteIcon size={24} color="#0D9417" />
            <h1 style={{ fontSize: '1.65rem', fontWeight: 800, color: '#1F2937', letterSpacing: '-0.025em', margin: 0 }}>
              Rutas y Despacho Geoespacial (CVRPTW)
            </h1>
          </div>
          <p style={{ margin: 0, fontSize: '0.88rem', color: '#6B7280' }}>
            Optimización multiobjetivo (Distancia, Tiempo, CO₂ vehicular) con medición de emisiones computacionales de Python (CodeCarbon).
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <button
            onClick={() => setMostrarZonasRiesgo(!mostrarZonasRiesgo)}
            style={{
              padding: '0.55rem 0.95rem',
              borderRadius: '10px',
              background: mostrarZonasRiesgo ? '#F3F4F6' : '#FFFFFF',
              border: '1.5px solid #D1D5DB',
              color: '#374151',
              fontSize: '0.82rem',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              cursor: 'pointer'
            }}
          >
            <ShieldAlert size={16} color={mostrarZonasRiesgo ? '#EF4444' : '#6B7280'} />
            <span>{mostrarZonasRiesgo ? 'Zonas de Riesgo Activas' : 'Mostrar Zonas de Riesgo'}</span>
          </button>

          <button
            onClick={handleOptimizar}
            disabled={optimizing}
            style={{
              padding: '0.55rem 1.25rem',
              borderRadius: '10px',
              background: '#0D9417',
              border: 'none',
              color: '#FFFFFF',
              fontSize: '0.84rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              cursor: optimizing ? 'not-allowed' : 'pointer',
              boxShadow: '0 4px 12px rgba(13, 148, 23, 0.25)',
              opacity: optimizing ? 0.75 : 1
            }}
          >
            <Sparkles size={16} />
            <span>{optimizing ? 'Optimizando CVRPTW...' : 'Optimizar Rutas del Día'}</span>
          </button>
        </div>
      </div>

      {/* Tarjetas KPI y Métricas de CodeCarbon */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: '1rem',
        marginBottom: '1.5rem'
      }}>
        {/* Rutas Activas */}
        <div style={{
          background: '#FFFFFF',
          padding: '1.15rem',
          borderRadius: '14px',
          border: '1px solid #E5E7EB',
          boxShadow: '0 2px 6px rgba(0,0,0,0.03)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#6B7280', fontSize: '0.8rem', fontWeight: 600 }}>
            <span>RUTAS PLANIFICADAS</span>
            <RouteIcon size={18} color="#0D9417" />
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#111827', marginTop: '0.35rem' }}>
            {rutas.length}
          </div>
          <div style={{ fontSize: '0.74rem', color: '#10B981', marginTop: '0.25rem', fontWeight: 600 }}>
            Flota asignada con ventanas horarias
          </div>
        </div>

        {/* Distancia y Tiempo */}
        <div style={{
          background: '#FFFFFF',
          padding: '1.15rem',
          borderRadius: '14px',
          border: '1px solid #E5E7EB',
          boxShadow: '0 2px 6px rgba(0,0,0,0.03)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#6B7280', fontSize: '0.8rem', fontWeight: 600 }}>
            <span>DISTANCIA & TIEMPO</span>
            <Clock size={18} color="#3B82F6" />
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#111827', marginTop: '0.35rem' }}>
            {rutaSeleccionada ? `${rutaSeleccionada.distancia_total_km} km` : '0.0 km'}
          </div>
          <div style={{ fontSize: '0.74rem', color: '#6B7280', marginTop: '0.25rem' }}>
            {rutaSeleccionada ? `Aprox. ${(rutaSeleccionada.tiempo_total_min / 60).toFixed(1)} horas de recorrido` : 'Sin ruta activa'}
          </div>
        </div>

        {/* CO2 Vehicular */}
        <div style={{
          background: '#FFFFFF',
          padding: '1.15rem',
          borderRadius: '14px',
          border: '1px solid #E5E7EB',
          boxShadow: '0 2px 6px rgba(0,0,0,0.03)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#6B7280', fontSize: '0.8rem', fontWeight: 600 }}>
            <span>HUELLA VEHICULAR</span>
            <Leaf size={18} color="#059669" />
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#059669', marginTop: '0.35rem' }}>
            {rutaSeleccionada ? `${rutaSeleccionada.co2_total_kg} kg` : '0.00 kg'}
          </div>
          <div style={{ fontSize: '0.74rem', color: '#6B7280', marginTop: '0.25rem' }}>
            {rutaSeleccionada?.vehiculo_tipo_combustible === 'ELECTRICO'
              ? 'Vehículo 100% Eléctrico (Cero Emisiones)'
              : 'Emisiones directas de combustión'}
          </div>
        </div>

        {/* MÉTRICAS COMPUTACIONALES CODECARBON (Requisito Específico) */}
        <div style={{
          background: 'linear-gradient(135deg, #F0FDF4 0%, #ECFDF5 100%)',
          padding: '1.15rem',
          borderRadius: '14px',
          border: '1.5px solid #A7F3D0',
          boxShadow: '0 2px 8px rgba(16, 185, 129, 0.08)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#047857', fontSize: '0.8rem', fontWeight: 700 }}>
            <span>HUELLA CODECARBON (CPU)</span>
            <Cpu size={18} color="#047857" />
          </div>
          <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#065F46', marginTop: '0.35rem' }}>
            {rutaSeleccionada ? `${Number(rutaSeleccionada.co2_computacional_kg).toExponential(4)} kg CO₂` : '0.0000 kg'}
          </div>
          <div style={{ fontSize: '0.73rem', color: '#047857', marginTop: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <Zap size={12} />
            <span>
              {rutaSeleccionada ? `${Number(rutaSeleccionada.energia_computacional_kwh).toExponential(3)} kWh` : '0.000 kWh'}
              {rutaSeleccionada ? ` (${rutaSeleccionada.tiempo_computo_seg}s)` : ''}
            </span>
          </div>
        </div>
      </div>

      {/* Alerta de Exceso de Capacidad (US-005 Criterio BDD Exacto) */}
      {pedidosExcedentes.length > 0 && (
        <div style={{
          marginBottom: '1.5rem',
          padding: '1rem 1.25rem',
          borderRadius: '12px',
          background: '#FFFBEB',
          border: '1.5px solid #FCD34D',
          display: 'flex',
          alignItems: 'flex-start',
          gap: '0.85rem'
        }}>
          <AlertTriangle size={22} color="#D97706" style={{ flexShrink: 0, marginTop: '2px' }} />
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#92400E' }}>
              Atención: {pedidosExcedentes.length} Pedidos Excedieron la Capacidad Máxima Vehicular (85%-90%)
            </div>
            <div style={{ fontSize: '0.8rem', color: '#B45309', marginTop: '4px' }}>
              Los siguientes pedidos fueron marcados con el estado exacto: <strong>"No Asignados por Exceso de Capacidad"</strong>:
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '8px' }}>
              {pedidosExcedentes.map(p => (
                <span
                  key={p.pedido_id}
                  style={{
                    padding: '3px 8px',
                    borderRadius: '6px',
                    background: '#FEF3C7',
                    border: '1px solid #FDE68A',
                    fontSize: '0.74rem',
                    color: '#78350F',
                    fontWeight: 600
                  }}
                >
                  {p.codigo_seguimiento} · {p.cliente_nombre} ({p.peso_kg} kg)
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Disposición Principal: Mapa y Panel Lateral de Paradas */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.25rem' }}>
        
        {/* Columna Izquierda: Mapa Interactivo o Fallback */}
        <div style={{
          background: '#FFFFFF',
          borderRadius: '14px',
          border: '1px solid #E5E7EB',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
        }}>
          <div style={{
            padding: '0.85rem 1.15rem',
            background: '#F9FAFB',
            borderBottom: '1px solid #E5E7EB',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.84rem', fontWeight: 700, color: '#374151' }}>
              <MapPin size={16} color="#0D9417" />
              <span>Mapa Cartográfico de Trazado Vial</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <button
                onClick={() => setMapFallback(!mapFallback)}
                style={{
                  padding: '3px 8px',
                  borderRadius: '6px',
                  border: '1px solid #D1D5DB',
                  background: mapFallback ? '#E5E7EB' : '#FFFFFF',
                  fontSize: '0.72rem',
                  cursor: 'pointer',
                  color: '#4B5563'
                }}
              >
                {mapFallback ? 'Volver a Mapa' : 'Simular Fallback Texto'}
              </button>
            </div>
          </div>

          {/* Renderizado de Mapa o Fallback Resiliente (US-006 Criterio BDD Exacto) */}
          <div style={{ position: 'relative', height: '540px', width: '100%', background: '#F3F4F6' }}>
            {mapFallback ? (
              // Criterio BDD Exacto: "Servicio de mapas no disponible temporalmente."
              <div style={{
                height: '100%',
                overflowY: 'auto',
                padding: '1.5rem',
                background: '#FAFBFB',
                display: 'flex',
                flexDirection: 'column'
              }}>
                <div style={{
                  padding: '0.85rem 1.15rem',
                  borderRadius: '10px',
                  background: '#FEF2F2',
                  border: '1.5px solid #FCA5A5',
                  color: '#991B1B',
                  fontSize: '0.88rem',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.65rem',
                  marginBottom: '1.25rem'
                }}>
                  <AlertCircle size={20} />
                  <span>Servicio de mapas no disponible temporalmente.</span>
                </div>

                <div style={{ fontWeight: 700, fontSize: '0.84rem', color: '#374151', marginBottom: '0.65rem' }}>
                  Lista Secuencial Alternativa de Paradas y Tramos:
                </div>

                <div style={{ flex: 1, overflowY: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
                    <thead>
                      <tr style={{ background: '#E5E7EB', color: '#374151', textAlign: 'left' }}>
                        <th style={{ padding: '8px' }}>#</th>
                        <th style={{ padding: '8px' }}>Tipo</th>
                        <th style={{ padding: '8px' }}>Descripción</th>
                        <th style={{ padding: '8px' }}>Distancia</th>
                        <th style={{ padding: '8px' }}>Tiempo</th>
                        <th style={{ padding: '8px' }}>Seguridad</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rutaSeleccionada?.tramos.map(t => (
                        <tr key={t.tramo_id} style={{ borderBottom: '1px solid #E5E7EB' }}>
                          <td style={{ padding: '8px', fontWeight: 700 }}>{t.orden_secuencia}</td>
                          <td style={{ padding: '8px' }}>{t.tipo_parada}</td>
                          <td style={{ padding: '8px' }}>{t.descripcion}</td>
                          <td style={{ padding: '8px' }}>{t.distancia_tramo_km} km</td>
                          <td style={{ padding: '8px' }}>{t.tiempo_estimado_min} min</td>
                          <td style={{ padding: '8px' }}>
                            {t.alerta_zona_riesgo ? (
                              <span style={{ color: '#DC2626', fontWeight: 600 }}>Alerta: {t.nombre_zona_riesgo}</span>
                            ) : (
                              <span style={{ color: '#059669' }}>Ruta Segura</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div ref={mapContainerRef} style={{ height: '100%', width: '100%' }} />
            )}
          </div>
        </div>

        {/* Columna Derecha: Selector de Ruta, Conductor, Vehículo y Secuencia */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          
          {/* Tarjeta de Ruta Activa & Conductor / Vehículo */}
          <div style={{
            background: '#FFFFFF',
            padding: '1.15rem',
            borderRadius: '14px',
            border: '1px solid #E5E7EB',
            boxShadow: '0 2px 6px rgba(0,0,0,0.03)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.85rem' }}>
              <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#374151' }}>
                RUTA SELECCIONADA
              </span>
              <button
                onClick={() => setShowReoptModal(true)}
                disabled={!rutaSeleccionada}
                style={{
                  padding: '4px 10px',
                  borderRadius: '7px',
                  background: '#EEF2FF',
                  border: '1px solid #C7D2FE',
                  color: '#4338CA',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem'
                }}
              >
                <RotateCcw size={13} />
                <span>Reoptimizar (US-007)</span>
              </button>
            </div>

            {/* Selector de rutas si hay múltiples */}
            {rutas.length > 1 && (
              <div style={{ marginBottom: '0.85rem' }}>
                <select
                  value={rutaSeleccionada?.ruta_id || ''}
                  onChange={e => {
                    const sel = rutas.find(r => r.ruta_id === e.target.value);
                    if (sel) setRutaSeleccionada(sel);
                  }}
                  style={{
                    width: '100%',
                    padding: '0.45rem 0.65rem',
                    borderRadius: '8px',
                    border: '1px solid #D1D5DB',
                    fontSize: '0.8rem',
                    color: '#374151'
                  }}
                >
                  {rutas.map((r, i) => (
                    <option key={r.ruta_id} value={r.ruta_id}>
                      Ruta #{i + 1} · {r.vehiculo_placa} ({r.distancia_total_km} km)
                    </option>
                  ))}
                </select>
              </div>
            )}

            {rutaSeleccionada ? (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <Truck size={17} color="#0D9417" />
                  <span style={{ fontWeight: 700, fontSize: '0.88rem' }}>{rutaSeleccionada.vehiculo_placa}</span>
                  <span style={{
                    fontSize: '0.72rem',
                    padding: '2px 6px',
                    borderRadius: '4px',
                    background: rutaSeleccionada.vehiculo_tipo_combustible === 'ELECTRICO' ? '#DCFCE7' : '#FEF3C7',
                    color: rutaSeleccionada.vehiculo_tipo_combustible === 'ELECTRICO' ? '#166534' : '#92400E',
                    fontWeight: 600
                  }}>
                    {rutaSeleccionada.vehiculo_tipo_combustible}
                  </span>
                </div>

                <div style={{ fontSize: '0.8rem', color: '#4B5563', marginBottom: '0.35rem' }}>
                  Conductor: <strong>{rutaSeleccionada.conductor_nombre}</strong>
                </div>

                <div style={{ fontSize: '0.8rem', color: '#4B5563', marginBottom: '0.35rem' }}>
                  Fecha de Operación: <strong>{rutaSeleccionada.fecha_operacion}</strong>
                </div>

                <div style={{ fontSize: '0.8rem', color: '#4B5563' }}>
                  Paradas de Entrega: <strong>{rutaSeleccionada.pedidos_asignados_count} pedidos</strong>
                </div>
              </div>
            ) : (
              <div style={{ fontSize: '0.8rem', color: '#9CA3AF', fontStyle: 'italic' }}>
                No hay rutas generadas aún. Presiona "Optimizar Rutas del Día".
              </div>
            )}
          </div>

          {/* Secuencia Detallada de Paradas con Descanso Técnico por Fatiga (Ley N° 30224) */}
          <div style={{
            background: '#FFFFFF',
            padding: '1.15rem',
            borderRadius: '14px',
            border: '1px solid #E5E7EB',
            flex: 1,
            overflowY: 'auto',
            maxHeight: '380px',
            boxShadow: '0 2px 6px rgba(0,0,0,0.03)'
          }}>
            <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#374151', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
              <Layers size={16} color="#3B82F6" />
              <span>Itinerario Secuencial</span>
            </div>

            {rutaSeleccionada?.tramos.length ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                {rutaSeleccionada.tramos.map((t, idx) => {
                  const isDescanso = t.tipo_parada === 'DESCANSO_TECNICO_30MIN';
                  const isHub = t.tipo_parada === 'DEPOSITO_SALIDA' || t.tipo_parada === 'DEPOSITO_RETORNO';

                  return (
                    <div
                      key={t.tramo_id || idx}
                      style={{
                        padding: '0.65rem 0.85rem',
                        borderRadius: '9px',
                        background: isDescanso ? '#EFF6FF' : isHub ? '#F9FAFB' : '#FFFFFF',
                        border: `1.5px solid ${isDescanso ? '#93C5FD' : isHub ? '#E5E7EB' : t.alerta_zona_riesgo ? '#FCA5A5' : '#D1FAE5'}`,
                        fontSize: '0.78rem'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '3px' }}>
                        <span style={{ fontWeight: 700, color: isDescanso ? '#1D4ED8' : isHub ? '#374151' : '#047857' }}>
                          #{t.orden_secuencia} · {t.tipo_parada}
                        </span>
                        <span style={{ fontSize: '0.7rem', color: '#6B7280' }}>
                          {t.distancia_tramo_km} km | {t.tiempo_estimado_min} min
                        </span>
                      </div>

                      <div style={{ color: '#4B5563', fontSize: '0.75rem' }}>
                        {t.descripcion}
                      </div>

                      {isDescanso && (
                        <div style={{ marginTop: '4px', fontSize: '0.72rem', color: '#1E40AF', fontWeight: 600 }}>
                          Pausa obligatoria de 30 min (Ley N° 30224 / RN-004)
                        </div>
                      )}

                      {t.alerta_zona_riesgo && (
                        <div style={{ marginTop: '4px', fontSize: '0.72rem', color: '#B91C1C', fontWeight: 600 }}>
                          Atención: Polígono de Riesgo ({t.nombre_zona_riesgo})
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div style={{ fontSize: '0.78rem', color: '#9CA3AF', fontStyle: 'italic', textAlign: 'center', marginTop: '2rem' }}>
                Sin tramos para visualizar
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal de Reoptimización Dinámica ante Evento (US-007) */}
      {showReoptModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10000,
          padding: '1rem'
        }}>
          <div style={{
            background: '#FFFFFF',
            borderRadius: '16px',
            maxWidth: '480px',
            width: '100%',
            padding: '1.5rem',
            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <RotateCcw size={20} color="#4338CA" />
                <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: '#1F2937' }}>
                  Reoptimizar Ruta ante Evento (US-007)
                </h3>
              </div>
              <button
                onClick={() => setShowReoptModal(false)}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#9CA3AF' }}
              >
                <X size={18} />
              </button>
            </div>

            <p style={{ fontSize: '0.8rem', color: '#6B7280', marginBottom: '1.15rem' }}>
              Ajusta dinámicamente la secuencia del conductor ante contingencias operativas (cancelaciones o desvíos preventivos).
            </p>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#374151', marginBottom: '0.35rem' }}>
                Motivo de la Contingencia:
              </label>
              <select
                value={motivoReopt}
                onChange={e => setMotivoReopt(e.target.value)}
                style={{ width: '100%', padding: '0.5rem', borderRadius: '8px', border: '1px solid #D1D5DB', fontSize: '0.82rem' }}
              >
                <option value="CANCELACION_CLIENTE_VENTANA_CERRADA">Cliente canceló / Local cerrado</option>
                <option value="TRAFICO_EXCESIVO_CONGESTION">Congestión vehicular severa en el tramo</option>
                <option value="RIESGO_URBANO_DESVIO">Desvío preventivo por seguridad ciudadana</option>
                <option value="RECALCULO_MANUAL">Ajuste de eficiencia operativo</option>
              </select>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#374151', marginBottom: '0.35rem' }}>
                Cancelar Parada Específica de la Ruta (Opcional):
              </label>
              <select
                value={pedidoACancelarId}
                onChange={e => setPedidoACancelarId(e.target.value)}
                style={{ width: '100%', padding: '0.5rem', borderRadius: '8px', border: '1px solid #D1D5DB', fontSize: '0.82rem' }}
              >
                <option value="">-- No cancelar ninguna parada --</option>
                {pedidosEnRuta.map(p => (
                  <option key={p.pedido_id} value={p.pedido_id!}>
                    #{p.orden_secuencia}: {p.descripcion}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <input
                type="checkbox"
                id="evitar_riesgo"
                checked={evitarRiesgoActivo}
                onChange={e => setEvitarRiesgoActivo(e.target.checked)}
                style={{ width: '16px', height: '16px', cursor: 'pointer' }}
              />
              <label htmlFor="evitar_riesgo" style={{ fontSize: '0.8rem', color: '#374151', cursor: 'pointer' }}>
                Priorizar desvío para evitar zonas de riesgo urbano
              </label>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setShowReoptModal(false)}
                style={{
                  padding: '0.5rem 1rem',
                  borderRadius: '8px',
                  background: '#F3F4F6',
                  border: '1px solid #D1D5DB',
                  color: '#4B5563',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Cancelar
              </button>

              <button
                onClick={handleReoptimizar}
                disabled={reoptimizing}
                style={{
                  padding: '0.5rem 1.25rem',
                  borderRadius: '8px',
                  background: '#4338CA',
                  border: 'none',
                  color: '#FFFFFF',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  cursor: reoptimizing ? 'not-allowed' : 'pointer'
                }}
              >
                {reoptimizing ? 'Recalculando con CodeCarbon...' : 'Confirmar Reoptimización'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RutasView;
