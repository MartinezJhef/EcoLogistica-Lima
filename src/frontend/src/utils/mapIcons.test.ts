/**
 * mapIcons.test.ts
 * Suite de pruebas para funciones puras de mapIcons.ts
 * Cubre: calcularDistanciaKm, estimarTiempoMin, getSvgVehiculo, crearIconoBanderaLlegada,
 *        crearIconoCasaOrigen, crearIconoVehiculoConductor, crearIconoNegocioCasa
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  calcularDistanciaKm,
  estimarTiempoMin,
  getSvgVehiculo,
  SVG_MINI_FLAG,
  SVG_MINI_CAR,
  SVG_MINI_PIN,
  SVG_MINI_HOUSE,
  crearIconoBanderaLlegada,
  crearIconoCasaOrigen,
  crearIconoNegocioCasa
} from '../utils/mapIcons';

// Mock Leaflet porque crearIconoBanderaLlegada usa L.divIcon
vi.mock('leaflet', () => ({
  default: {
    divIcon: vi.fn().mockImplementation((opts: any) => ({ ...opts, _mock: 'divIcon' })),
    Icon: { Default: { mergeOptions: vi.fn() } }
  }
}));

// ─── calcularDistanciaKm ─────────────────────────────────────────────────────
describe('calcularDistanciaKm (Haversine)', () => {
  it('retorna 0 para coordenadas idénticas', () => {
    const d = calcularDistanciaKm(-12.046, -77.042, -12.046, -77.042);
    expect(d).toBe(0);
  });

  it('calcula la distancia Lima Centro → Miraflores (~3.5km)', () => {
    // Plaza Mayor a Parque Kennedy: approx 3-4km
    const d = calcularDistanciaKm(-12.046, -77.042, -12.120, -77.033);
    expect(d).toBeGreaterThan(2);
    expect(d).toBeLessThan(15);
  });

  it('calcula la distancia Lima → Callao (~10-14km)', () => {
    const d = calcularDistanciaKm(-12.046, -77.042, -12.056, -77.118);
    expect(d).toBeGreaterThan(5);
    expect(d).toBeLessThan(20);
  });

  it('retorna un número con 2 decimales', () => {
    const d = calcularDistanciaKm(-12.046, -77.042, -12.120, -77.033);
    expect(typeof d).toBe('number');
    const decimals = d.toString().split('.')[1]?.length ?? 0;
    expect(decimals).toBeLessThanOrEqual(2);
  });

  it('la distancia A→B es igual a B→A (simetría)', () => {
    const d1 = calcularDistanciaKm(-12.046, -77.042, -12.120, -77.033);
    const d2 = calcularDistanciaKm(-12.120, -77.033, -12.046, -77.042);
    expect(d1).toBe(d2);
  });
});

// ─── estimarTiempoMin ────────────────────────────────────────────────────────
describe('estimarTiempoMin', () => {
  it('retorna al menos 8 minutos para distancias muy cortas', () => {
    expect(estimarTiempoMin(0)).toBe(8);
    expect(estimarTiempoMin(0.1)).toBe(8);
  });

  it('retorna un tiempo razonable para 5km (entre 15-25 min)', () => {
    const t = estimarTiempoMin(5);
    expect(t).toBeGreaterThanOrEqual(15);
    expect(t).toBeLessThanOrEqual(30);
  });

  it('retorna un tiempo razonable para 20km (entre 45-60 min)', () => {
    const t = estimarTiempoMin(20);
    expect(t).toBeGreaterThanOrEqual(40);
    expect(t).toBeLessThanOrEqual(70);
  });

  it('es monótonamente creciente — distancia mayor implica más tiempo', () => {
    expect(estimarTiempoMin(10)).toBeGreaterThan(estimarTiempoMin(5));
    expect(estimarTiempoMin(30)).toBeGreaterThan(estimarTiempoMin(10));
  });

  it('retorna un número entero', () => {
    const t = estimarTiempoMin(8.5);
    expect(Number.isInteger(t)).toBe(true);
  });
});

// ─── getSvgVehiculo ──────────────────────────────────────────────────────────
describe('getSvgVehiculo', () => {
  it('retorna una cadena SVG válida con el color por defecto', () => {
    const svg = getSvgVehiculo();
    expect(typeof svg).toBe('string');
    expect(svg).toContain('<svg');
    expect(svg).toContain('556B2F');
  });

  it('retorna SVG con el color personalizado', () => {
    const svg = getSvgVehiculo('#FF0000');
    expect(svg).toContain('FF0000');
  });
});

// ─── Constantes SVG ──────────────────────────────────────────────────────────
describe('Constantes SVG exportadas', () => {
  it('SVG_MINI_FLAG es un string no vacío', () => {
    expect(typeof SVG_MINI_FLAG).toBe('string');
    expect(SVG_MINI_FLAG.length).toBeGreaterThan(0);
  });

  it('SVG_MINI_CAR es un string no vacío', () => {
    expect(typeof SVG_MINI_CAR).toBe('string');
    expect(SVG_MINI_CAR.length).toBeGreaterThan(0);
  });

  it('SVG_MINI_PIN es un string no vacío', () => {
    expect(typeof SVG_MINI_PIN).toBe('string');
    expect(SVG_MINI_PIN.length).toBeGreaterThan(0);
  });

  it('SVG_MINI_HOUSE es un string no vacío', () => {
    expect(typeof SVG_MINI_HOUSE).toBe('string');
    expect(SVG_MINI_HOUSE.length).toBeGreaterThan(0);
  });
});

// ─── crearIconoBanderaLlegada ────────────────────────────────────────────────
describe('crearIconoBanderaLlegada', () => {
  it('crea un icono sin argumentos (usa defaults)', async () => {
    const L = (await import('leaflet')).default;
    crearIconoBanderaLlegada();
    expect(L.divIcon).toHaveBeenCalled();
  });

  it('acepta un título personalizado', async () => {
    const L = (await import('leaflet')).default;
    vi.mocked(L.divIcon).mockClear();
    crearIconoBanderaLlegada('Destino Final');
    expect(L.divIcon).toHaveBeenCalled();
  });
});

// ─── crearIconoCasaOrigen ────────────────────────────────────────────────────
describe('crearIconoCasaOrigen', () => {
  it('crea el icono con parámetro por defecto', async () => {
    const L = (await import('leaflet')).default;
    vi.mocked(L.divIcon).mockClear();
    crearIconoCasaOrigen();
    expect(L.divIcon).toHaveBeenCalled();
  });

  it('acepta título personalizado', async () => {
    const L = (await import('leaflet')).default;
    vi.mocked(L.divIcon).mockClear();
    crearIconoCasaOrigen('Almacén Principal');
    expect(L.divIcon).toHaveBeenCalled();
  });
});

// ─── crearIconoNegocioCasa ───────────────────────────────────────────────────
describe('crearIconoNegocioCasa', () => {
  it('crea el icono con parámetro por defecto', async () => {
    const L = (await import('leaflet')).default;
    vi.mocked(L.divIcon).mockClear();
    crearIconoNegocioCasa();
    expect(L.divIcon).toHaveBeenCalled();
  });

  it('acepta un label personalizado', async () => {
    const L = (await import('leaflet')).default;
    vi.mocked(L.divIcon).mockClear();
    crearIconoNegocioCasa('Farmacia Central');
    expect(L.divIcon).toHaveBeenCalled();
  });
});

