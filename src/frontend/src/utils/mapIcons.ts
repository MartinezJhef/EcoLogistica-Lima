import L from 'leaflet';
import { Conductor } from '../services/api';

/**
 * Genera el SVG vector de la Bandera de Meta / Llegada (Checkered Finish Flag)
 * Basado exactamente en la bandera a cuadros monocromática (blanco y negro) con mástil.
 */
export const SVG_BANDERA_LLEGADA = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 72 64" width="46" height="42" style="filter: drop-shadow(0 4px 8px rgba(0,0,0,0.4));">
  <!-- Sombra en la base del mástil -->
  <ellipse cx="9" cy="59" rx="6" ry="2.5" fill="rgba(0,0,0,0.3)" />

  <!-- Asta / Mástil Vertical Negro con Puntera Redondeada -->
  <rect x="6" y="3" width="6" height="56" rx="3" fill="#1A1A1A" stroke="#000000" stroke-width="1"/>
  <circle cx="9" cy="3.5" r="4" fill="#2D3A2E" stroke="#000000" stroke-width="1"/>

  <!-- Definición del Contorno Ondulado de la Tela de la Bandera -->
  <defs>
    <path id="flagWavyCloth" d="M 12 6 C 26 1.5, 46 11, 68 5 L 68 43 C 46 49, 26 39.5, 12 44 Z" />
    <clipPath id="flagClipPath">
      <use href="#flagWavyCloth" />
    </clipPath>
  </defs>

  <!-- Lienzo base Blanco con Borde de Seguridad -->
  <use href="#flagWavyCloth" fill="#FFFFFF" stroke="#000000" stroke-width="2.5" stroke-linejoin="round"/>

  <!-- Cuadrícula Ajedrezada de Cuadros Negros (4 columnas x 3 filas) -->
  <g clip-path="url(#flagClipPath)" fill="#000000">
    <!-- Fila 1: Col 1 y Col 3 son Negras -->
    <path d="M 12 0 L 26 0 L 26 20 L 12 20 Z" />
    <path d="M 40 0 L 54 0 L 54 20 L 40 20 Z" />

    <!-- Fila 2: Col 2 y Col 4 son Negras -->
    <path d="M 26 16 L 40 16 L 40 34 L 26 34 Z" />
    <path d="M 54 16 L 72 16 L 72 34 L 54 34 Z" />

    <!-- Fila 3: Col 1 y Col 3 son Negras -->
    <path d="M 12 30 L 26 30 L 26 50 L 12 50 Z" />
    <path d="M 40 30 L 54 30 L 54 50 L 40 50 Z" />
  </g>

  <!-- Borde definitivo exterior de la bandera -->
  <use href="#flagWavyCloth" fill="none" stroke="#000000" stroke-width="2.2" stroke-linejoin="round"/>
</svg>
`;

/**
 * Genera el SVG vector del Carro / Vehículo de Entrega para el Conductor
 */
export const getSvgVehiculo = (color: string = '#556B2F') => `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52 52" width="44" height="44" style="filter: drop-shadow(0 4px 10px rgba(45,58,46,0.45));">
  <!-- Halo / Pin de Ubicación Exterior -->
  <circle cx="26" cy="26" r="23" fill="#FFFFFF" stroke="${color}" stroke-width="2.8"/>
  <circle cx="26" cy="26" r="20" fill="#F5F4EE"/>
  
  <!-- Carrocería de Reparto EcoLogística (Carro / Furgoneta de Carga) -->
  <g transform="translate(9, 13)">
    <!-- Chasis y furgón -->
    <path d="M 2 18 L 2 10 C 2 8 3.5 7 5 7 L 21 7 C 22.5 7 23.5 7.8 24.5 9 L 30 14 C 31.2 15.2 32 16.5 32 18 L 32 23 C 32 24 31 25 30 25 L 28 25 C 28 22 25.5 20 23 20 C 20.5 20 18 22 18 25 L 14 25 C 14 22 11.5 20 9 20 C 6.5 20 4 22 4 25 L 2 25 C 1 25 0 24 0 23 L 0 20 Z" fill="${color}"/>
    
    <!-- Parabrisas delantero -->
    <path d="M 22 9 L 22 15 L 29.5 15 C 28.5 13 26.5 10 24.5 9 Z" fill="#EBF1E6" stroke="#2D3A2E" stroke-width="1"/>
    
    <!-- Ventanilla del conductor -->
    <rect x="7" y="9" width="12" height="6.5" rx="1" fill="#EBF1E6" stroke="#2D3A2E" stroke-width="0.8"/>
    
    <!-- Faro delantero encendido -->
    <path d="M 31 19 L 32.5 19 C 32.5 20.2 31.8 21 31 21 Z" fill="#FEE11A"/>
    
    <!-- Luz trasera roja -->
    <rect x="0" y="14" width="2" height="4" rx="1" fill="#D64541"/>

    <!-- Rueda Delantera -->
    <circle cx="23" cy="24" r="4.2" fill="#1C1C1E" stroke="#FFFFFF" stroke-width="1.5"/>
    <circle cx="23" cy="24" r="1.8" fill="#CAD3BD"/>

    <!-- Rueda Trasera -->
    <circle cx="9" cy="24" r="4.2" fill="#1C1C1E" stroke="#FFFFFF" stroke-width="1.5"/>
    <circle cx="9" cy="24" r="1.8" fill="#CAD3BD"/>
  </g>
</svg>
`;

export const SVG_MINI_FLAG = `
<svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="vertical-align:middle;">
  <path d="M4 2v20" stroke="#1A1A1A" stroke-width="2.5" stroke-linecap="round"/>
  <path d="M4 4c4-2 8 2 12 0l2 1v10c-4 2-8-2-12 0V4z" fill="#FFFFFF" stroke="#1A1A1A" stroke-width="1.8"/>
  <path d="M4 4h6v5H4zM10 9h6v5h-6z" fill="#1A1A1A"/>
</svg>
`;

export const SVG_MINI_CAR = `
<svg width="15" height="15" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="vertical-align:middle;">
  <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.4-1.7-1.1-2.2l-3.4-2.6A2 2 0 0 0 16.3 8H14V6c0-.6-.4-1-1-1H3c-.6 0-1 .4-1 1v10c0 .6.4 1 1 1h2" stroke="#556B2F" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  <circle cx="7" cy="17" r="2" fill="#556B2F"/>
  <circle cx="17" cy="17" r="2" fill="#556B2F"/>
  <path d="M14 9h3l3 3h-6V9z" fill="#CAD3BD"/>
</svg>
`;

export const SVG_MINI_PIN = `
<svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="vertical-align:middle;">
  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill="#556B2F"/>
  <circle cx="12" cy="9" r="2.5" fill="#FFFFFF"/>
</svg>
`;

/**
 * Crea el icono Leaflet de la Bandera de Meta / Llegada
 */
export const crearIconoBanderaLlegada = (titulo: string = 'Punto de Entrega') => {
  return L.divIcon({
    className: 'custom-flag-marker',
    html: `
      <div style="position:relative;display:flex;flex-direction:column;align-items:flex-start;cursor:pointer;">
        ${SVG_BANDERA_LLEGADA}
        <div style="
          margin-top:-6px;
          margin-left:-2px;
          background:#2D3A2E;
          color:#F5F4EE;
          font-size:0.68rem;
          font-weight:700;
          padding:2px 7px;
          border-radius:10px;
          border:1.5px solid #CAD3BD;
          white-space:nowrap;
          box-shadow:0 3px 6px rgba(0,0,0,0.3);
          letter-spacing:0.02em;
          display:inline-flex;
          align-items:center;
          gap:4px;
        ">
          <span style="display:inline-block;width:6px;height:6px;border-radius:50%;background:#FEE11A;"></span>
          ${titulo}
        </div>
      </div>
    `,
    iconSize: [46, 56],
    iconAnchor: [9, 56],
    popupAnchor: [14, -50]
  });
};

/**
 * Crea el icono Leaflet del Vehículo / Carro de Conductor
 */
export const crearIconoVehiculoConductor = (conductor: Conductor, esSeleccionado: boolean = false) => {
  const color = conductor.estado === 'DISPONIBLE'
    ? '#556B2F'
    : conductor.estado === 'EN_RUTA'
    ? '#C47D2B'
    : '#8A9A75';

  const primerNombre = (conductor.nombres || '').split(' ')[0];
  const primerApellido = (conductor.apellidos || '').split(' ')[0];

  return L.divIcon({
    className: `custom-vehicle-marker ${esSeleccionado ? 'vehicle-selected' : ''}`,
    html: `
      <div style="position:relative;display:flex;flex-direction:column;align-items:center;cursor:pointer;">
        ${esSeleccionado ? `
          <div style="
            position:absolute;
            top:-4px;
            width:48px;
            height:48px;
            border-radius:50%;
            border:2px dashed #556B2F;
            animation:spin 6s linear infinite;
          "></div>
        ` : ''}
        ${getSvgVehiculo(color)}
        <div style="
          margin-top:-4px;
          background:${esSeleccionado ? '#556B2F' : '#FFFFFF'};
          color:${esSeleccionado ? '#FFFFFF' : '#2D3A2E'};
          font-size:0.66rem;
          font-weight:700;
          padding:2px 6px;
          border-radius:8px;
          border:1.5px solid ${color};
          white-space:nowrap;
          box-shadow:0 2px 6px rgba(0,0,0,0.25);
          display:flex;
          align-items:center;
          gap:3px;
        ">
          <span style="display:inline-block;width:6px;height:6px;border-radius:50%;background:${color};"></span>
          ${primerNombre} ${primerApellido.charAt(0)}.
        </div>
      </div>
    `,
    iconSize: [48, 58],
    iconAnchor: [24, 40],
    popupAnchor: [0, -42]
  });
};

/**
 * Cálculo de Distancia Geodésica Haversine en Kilómetros
 */
export const calcularDistanciaKm = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371; // Radio de la Tierra en km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Number((R * c).toFixed(2));
};

/**
 * Estimación de tiempo de viaje en minutos con tráfico urbano de Lima
 */
export const estimarTiempoMin = (distanciaKm: number): number => {
  // Velocidad promedio urbana en Lima: ~25-28 km/h + 5 min de aproximación
  const velocidadKmh = 27;
  const tiempoHoras = distanciaKm / velocidadKmh;
  return Math.max(8, Math.round(tiempoHoras * 60 + 5));
};

/**
 * Genera el icono de marcador para un Negocio o Casa de Entrega
 */
export const crearIconoNegocioCasa = (label: string = 'Punto de Entrega') => {
  return L.divIcon({
    className: 'custom-business-marker',
    html: `
      <div style="position:relative;display:flex;flex-direction:column;align-items:center;cursor:pointer;">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 38 46" width="34" height="42" style="filter:drop-shadow(0 4px 8px rgba(0,0,0,0.35));">
          <!-- Pin body -->
          <path d="M 19 0 C 8.5 0 0 8.5 0 19 C 0 30 16 44 19 46 C 22 44 38 30 38 19 C 38 8.5 29.5 0 19 0 Z" fill="#556B2F" stroke="#FFFFFF" stroke-width="2.5"/>
          <!-- Halo blanco interno -->
          <circle cx="19" cy="18" r="12" fill="#FFFFFF"/>
          <!-- Icono de Casa / Negocio -->
          <g transform="translate(10, 9)" fill="#2D3A2E">
            <path d="M 1 8 L 9 1 L 17 8 L 15 8 L 15 15 L 3 15 L 3 8 Z" fill="#556B2F"/>
            <rect x="7" y="9" width="4" height="6" fill="#F5F4EE"/>
          </g>
        </svg>
        <div style="
          margin-top:-4px;
          background:#2D3A2E;
          color:#F5F4EE;
          font-size:0.68rem;
          font-weight:700;
          padding:2px 7px;
          border-radius:8px;
          border:1.5px solid #CAD3BD;
          white-space:nowrap;
          box-shadow:0 2px 6px rgba(0,0,0,0.3);
          display:inline-flex;
          align-items:center;
          gap:4px;
        ">
          <span style="display:inline-block;width:6px;height:6px;border-radius:50%;background:#FEE11A;"></span>
          ${label}
        </div>
      </div>
    `,
    iconSize: [38, 52],
    iconAnchor: [19, 44],
    popupAnchor: [0, -42]
  });
};
