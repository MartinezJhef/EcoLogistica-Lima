# Registro de cambios

Todas las modificaciones relevantes de EcoLogística Lima se documentan en este archivo. El proyecto sigue [Semantic Versioning 2.0.0](https://semver.org).

## [1.1.0] — 2026-11-12

### Añadido

- Informe formal de reducción del impacto ambiental (`docs/03 Implementación/reduccion del impacto ambiental/01 Informe de reduccion del impacto ambiental V_1_0_0.md`).
- Documento de estándares de ingeniería de software y guía de desarrollo verde (`02 Estandares Ingeniería de software V_1_0_0.md`).
- Anexo reproducible de cálculo SWDM v4 y evidencias Lighthouse.
- Flujo de integración continua `.github/workflows/green-audit.yml` con presupuesto de rendimiento.
- Servidor estático de producción con negociación Brotli/gzip, `ETag`, `304` y caché inmutable.
- Precompresión automática durante el build (`scripts/precompression.mjs`).
- Pipeline de imágenes AVIF/WebP/PNG con `sharp` y `<picture>` responsivo.
- Paginación de 12 registros en backend y frontend con `X-Total-Count`.
- Índices compuestos y migración `002_optimizacion_consultas.sql`.
- Middleware de caché y compresión en FastAPI.

### Modificado

- `App.tsx` usa `React.lazy` y `Suspense` para las seis vistas autenticadas.
- `api.ts` sustituye `axios` por un cliente nativo sobre `fetch`.
- `index.html` incorpora la cáscara crítica en línea, el favicon data URI y la pila de fuentes del sistema.
- `vite.config.ts` separa los fragmentos de React y Leaflet y activa `cssCodeSplit`.
- `LoginView` usa una imagen adaptable y añade nombre accesible al botón de visibilidad de contraseña.
- Los endpoints de listado limitan a 12 registros por página y exponen `X-Total-Count`.
- El `build` excluye las pruebas del type-check mediante `tsconfig.build.json`.

### Eliminado

- Dependencia `axios`.
- Carga de Google Fonts y de Leaflet CSS desde dominios externos en el documento base.
- Artefacto legado `dist-baseline` del árbol de trabajo (excluido por `.gitignore`).

### Rendimiento medido

| Perfil | Puntuación | FCP | LCP | Peso | Peticiones |
|---|---:|---:|---:|---:|---:|
| Escritorio ANTES | 95 | 1 084 ms | 1 234 ms | 712 KB | 10 |
| Escritorio DESPUÉS | 100 | 325 ms | 475 ms | 65 KB | 7 |
| Móvil ANTES | 90 | 2 567 ms | 3 047 ms | 244 KB | 9 |
| Móvil DESPUÉS | 99 | 1 205 ms | 1 985 ms | 65 KB | 7 |

> Los valores DESPUÉS son la mediana de tres ejecuciones de Lighthouse CI; los ANTES provienen de una ejecución de referencia sobre el artefacto legado.

### Documentación

- Versión documental: **1.0.0** (conforme a la rúbrica).
- Versión de la entrega de código: **1.1.0** (cambio compatible).

## [1.0.0] — 2026-10-30

### Añadido

- Línea base del Sprint 1: gestión de vehículos, conductores, clientes, pedidos y rutas.
- Especificaciones US-001 y US-002.
- Pruebas unitarias y de componentes del frontend.
# Integración hasta Sprint 3 (rama de revisión)

- Unificación de web y móvil mediante FastAPI, comprobación de contraseña y permisos, y eliminación de confirmaciones de guardado ficticias.
- Planificación con horarios, acceso, capacidad y jornada; geometría vial, incidencias reportadas y revalidación de preferencias.
- Cola persistente de itinerarios, conservación sin internet, reintentos ordenados, redistribución por avería y confirmación de regreso al depósito.
- Migración aditiva, pruebas de regresión y validación automatizada con PostGIS desechable. Instalación y límites documentados en `docs/SPRINT_3_INSTALACION_Y_VALIDACION.md`.
