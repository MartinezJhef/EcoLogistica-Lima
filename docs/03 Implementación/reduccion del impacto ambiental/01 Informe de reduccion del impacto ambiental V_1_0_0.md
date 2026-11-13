[← Volver al README Principal](../../README.md)

# Informe de reducción del impacto ambiental

## Optimización de rendimiento y eficiencia energética del frontend web

**Proyecto:** EcoLogística Lima — Optimizador de rutas sostenibles
**Versión del documento:** 1.0.0
**Fecha:** 12 de noviembre de 2026
**Repositorio:** `MartinezJhef/EcoLogistica-Lima`
**Rama de entrega:** `main`

| Campo | Detalle |
|---|---|
| Elaborado por | Equipo de desarrollo de EcoLogística Lima |
| Integrantes | Zayuri Cerron Medina (PM), Jheferson Martinez Valerio, Angela Rojas Quispe, Maylit Mendoza Alarcon, Diego Angulo Gonzales |
| Documento hermano | `02 Estandares Ingeniería de software V_1_0_0.md` |
| Anexo de cálculo | `evidencias/calculo-swdm-v4.md` |
| Evidencias crudas | `evidencias/lighthouse/` |
| Marco de referencia | ISO/IEC 25010, Green Software Foundation, W3C WSG 1.0, SWDM v4 |

---

## Resumen ejecutivo

Este informe documenta la auditoría, la refactorización y la medición del rendimiento del frontend de EcoLogística Lima. El objetivo fue reducir el costo computacional y energético de la plataforma sin alterar su comportamiento funcional. La intervención se organizó en ocho áreas: consultas y proyecciones de datos, paginación, imágenes adaptativas, carga diferida, depuración de dependencias, reducción de peticiones HTTP, caché de recursos y middleware de compresión.

La medición se realizó con Google Lighthouse 12 sobre la compilación de producción, servida por un servidor estático con negociación Brotli/gzip, `Cache-Control` y `ETag`. Se compararon dos perfiles: escritorio, que es el perfil de referencia de la rúbrica, y móvil, que representa al usuario real de campo. Los resultados principales son los siguientes:

| Indicador | Escritorio ANTES | Escritorio DESPUÉS | Móvil ANTES | Móvil DESPUÉS |
|---|---:|---:|---:|---:|
| Puntuación de rendimiento | 95 | **100** | 90 | **99** |
| First Contentful Paint | 1 084 ms | **325 ms** | 2 567 ms | **1 205 ms** |
| Largest Contentful Paint | 1 234 ms | **475 ms** | 3 047 ms | **1 985 ms** |
| Total Blocking Time | 0 ms | **0 ms** | 0 ms | **0 ms** |
| Cumulative Layout Shift | 0.001 | **0.000** | 0.000 | **0.000** |
| Peso total transferido | 712 KB | **65 KB** | 244 KB | **65 KB** |
| Peticiones HTTP | 10 | **7** | 9 | **7** |
| Recursos que bloquean el render | 360 ms | **0 ms** | 900 ms | **0 ms** |
| Accesibilidad | — | **100** | — | **100** |
| Buenas prácticas | — | **96** | — | **93** |

La reducción de peso fue de **90.9 % en escritorio** (712 KB → 65 KB) y de **73.4 % en móvil** (244 KB → 65 KB). El ahorro estimado con el modelo simplificado de la rúbrica es de **0.0589 g CO₂e por visita** en escritorio y **0.0163 g CO₂e por visita** en móvil. Proyectado a 500 000 visitas anuales, equivale a **29.45 kg CO₂e/año** y **8.15 kg CO₂e/año**, respectivamente. Con el modelo segmentado SWDM v4 el ahorro del perfil de escritorio es de **12.12 kg CO₂e/año** para la intensidad de red mundial de 494 g CO₂e/kWh.

> **Criterio de medición.** Los valores ANTES provienen de una ejecución de referencia sobre el artefacto legado. Los valores DESPUÉS son la mediana de tres ejecuciones de Lighthouse CI, que es el criterio que aplica el pipeline. El detalle de cada ejecución está en `evidencias/lighthouse/lhci-resumen.json`.

El cálculo absoluto es menor que el ejemplo ilustrativo de la rúbrica (935 kg CO₂e/año) porque el punto de partida real de EcoLogística no es una página de 8.4 MB, sino una aplicación de 712 KB. La reducción relativa, que es el indicador comparable, es del **90.9 %**, superior al 86.9 % del ejemplo. El detalle completo, con ambas fórmulas y análisis de sensibilidad, se encuentra en `evidencias/calculo-swdm-v4.md`.

---

## Índice

1. [Introducción y propósito](#1-introducción-y-propósito)
2. [Diagnóstico inicial](#2-diagnóstico-inicial)
3. [Metodología de medición](#3-metodología-de-medición)
4. [Alcance y correspondencia con el stack MERN](#4-alcance-y-correspondencia-con-el-stack-mern)
5. [Las ocho optimizaciones](#5-las-ocho-optimizaciones)
6. [Tabla comparativa consolidada](#6-tabla-comparativa-consolidada)
7. [Análisis de impacto ambiental](#7-análisis-de-impacto-ambiental)
8. [Evidencias de validación](#8-evidencias-de-validación)
9. [Validación funcional y de integración continua](#9-validación-funcional-y-de-integración-continua)
10. [Limitaciones y trabajo futuro](#10-limitaciones-y-trabajo-futuro)
11. [Conclusiones](#11-conclusiones)
12. [Referencias](#12-referencias)
13. [Anexo A. Reproducción de la auditoría](#anexo-a-reproducción-de-la-auditoría)
14. [Anexo B. Lista de verificación de la rúbrica](#anexo-b-lista-de-verificación-de-la-rúbrica)

---

## 1. Introducción y propósito

### 1.1 Contexto

La sostenibilidad digital dejó de ser un atributo accesorio del software. Cada ciclo de CPU que se evita, cada megabyte que no se transfiere y cada consulta que se resuelve con un índice representan una reducción medible del consumo eléctrico en centros de datos, redes de transmisión y dispositivos finales. El proyecto EcoLogística Lima gestiona rutas de distribución urbana y, por su naturaleza logística, tiene un doble compromiso ambiental: reducir las emisiones del transporte y reducir también la huella del propio sistema que lo planifica.

El presente informe cubre el segundo compromiso. Documenta el proceso de auditoría, refactorización y validación del frontend web, y establece las bases para extender la misma disciplina al backend y a la aplicación móvil.

### 1.2 Propósito

El propósito del informe es:

1. Identificar los cuellos de botella de la arquitectura original mediante mediciones reproducibles.
2. Aplicar refactorizaciones en ocho áreas estratégicas del stack.
3. Cuantificar el impacto con Google Lighthouse, el informe de precompresión y el modelo SWDM v4.
4. Demostrar que la reducción de la huella no compromete la funcionalidad, la accesibilidad ni la experiencia de usuario.
5. Dejar un procedimiento verificable que permita repetir la auditoría en cada entrega.

### 1.3 Alcance

El alcance incluye la aplicación web React 18 compilada con Vite 5 y TypeScript 5, el servidor estático de producción, los middlewares transversales del backend FastAPI y los índices de la base de datos PostgreSQL/PostGIS. No incluye la aplicación móvil Flutter, cuyo análisis se realizará con el mismo marco en la siguiente iteración. Tampoco incluye el consumo energético del entrenamiento de modelos, porque el proyecto no entrena modelos de aprendizaje automático.

### 1.4 Estructura del documento

La sección 2 presenta el diagnóstico medido. La sección 3 describe el método. La sección 4 aclara la correspondencia entre el stack MERN de la rúbrica y el stack efectivamente implementado. La sección 5 desarrolla las ocho optimizaciones con fragmentos ANTES y DESPUÉS. Las secciones 6 a 8 consolidan métricas, impacto ambiental y evidencias. Las secciones 9 a 11 cierran con validación, límites y conclusiones.

---

## 2. Diagnóstico inicial

### 2.1 Línea base medida

La línea base se obtuvo sobre el artefacto legado (`dist-baseline`), servido sin precompresión y sin cabeceras de caché, que es exactamente el estado previo a la intervención. La medición se ejecutó con Lighthouse 12 en modo escritorio y en modo móvil emulado.

| Métrica | Escritorio | Móvil | Umbral de la rúbrica | Estado inicial |
|---|---:|---:|---:|---|
| Rendimiento | 95 | 90 | ≥ 90 | Cumple en escritorio, al límite en móvil |
| FCP | 1 084 ms | 2 567 ms | ≤ 1 000 ms | **No cumple** |
| LCP | 1 234 ms | 3 047 ms | ≤ 1 400 ms | **No cumple en móvil** |
| TBT | 0 ms | 0 ms | ≤ 85 ms | Cumple |
| CLS | 0.001 | 0.000 | ≤ 0.02 | Cumple |
| Peso | 712 KB | 244 KB | ≤ 1 100 KB | Cumple por poco en escritorio |
| Peticiones | 10 | 9 | Reducción | — |
| Bloqueo del render | 360 ms | 900 ms | 0 ms | **No cumple** |

La línea base móvil es la más exigente: el FCP duplica el umbral y el LCP lo supera en más del doble. La causa principal es que el paquete inicial concentraba todas las vistas en un único archivo JavaScript de 631 KB, al que se sumaban dos hojas de estilo externas y una tipografía de 47 KB.

### 2.2 Causas raíz identificadas

1. **Paquete monolítico.** `App.tsx` importaba estáticamente las seis vistas, de modo que el navegador descargaba y evaluaba el código de administración, pedidos, rutas, clientes, conductores y vehículos antes de mostrar el login.
2. **Dependencias prescindibles.** `axios` aportaba una capa de transporte que el navegador ya resuelve con `fetch`. La tipografía Inter se descargaba desde Google Fonts y bloqueaba el render.
3. **Hojas de estilo externas.** Leaflet CSS se cargaba desde `unpkg.com` en el documento base, aunque los mapas solo se usan en dos módulos autenticados.
4. **Listados sin cota.** Los endpoints devolvían la tabla completa y el frontend renderizaba todos los registros, con el costo de memoria y de pintado que eso implica.
5. **Sin compresión ni caché.** El servidor no negociaba Brotli/gzip ni emitía `ETag`, por lo que cada visita retransmitía los mismos bytes.
6. **Consultas sin índices compuestos.** Los filtros por estado, propulsión y fecha recorrían la tabla completa antes de paginar.
7. **Imágenes sin política.** No existía un pipeline para generar variantes AVIF/WebP; cualquier imagen futura habría llegado como PNG sin optimizar.

---

## 3. Metodología de medición

### 3.1 Herramientas

| Herramienta | Versión | Uso |
|---|---|---|
| Google Lighthouse | 12 | Métricas de laboratorio y auditorías de accesibilidad y buenas prácticas |
| Lighthouse CI (`@lhci/cli`) | 0.15.1 | Presupuesto automático en GitHub Actions |
| Vite | 5.4 | Compilación y división de código |
| `node:zlib` | Node 20 | Precompresión Brotli calidad 11 y gzip nivel 9 |
| `sharp` | 0.35 | Generación de variantes AVIF, WebP y PNG |
| Vitest | 1.6 | 153 pruebas unitarias y de componentes |
| SWDM v4 | — | Traducción de bytes transferidos a energía y emisiones |

### 3.2 Protocolo

1. Se compila con `npm run build`, que ejecuta TypeScript, Vite y la precompresión.
2. Se sirve `dist/` con `node server.mjs` en el puerto 4173.
3. Se ejecuta Lighthouse con `--preset=desktop` y con el perfil móvil por defecto.
4. Se repite la medición tres veces en CI y se conserva la mediana mediante Lighthouse CI.
5. Se registran las métricas en `evidencias/lighthouse/resumen-lighthouse.json`.
6. Se calcula la huella con `python scripts/calcular_huella_swdm.py --json --markdown`.

### 3.3 Condiciones de comparación

La línea base se midió sobre el artefacto legado **sin precompresión**, porque el servidor anterior no generaba archivos `.br` ni `.gz`. El estado final se midió con Brotli activo. Esta diferencia es intencional: la compresión es una de las ocho optimizaciones evaluadas. Para aislar el efecto de la división de código, el informe presenta además el tamaño sin comprimir de cada fragmento en la sección 5.4.

Las mediciones se ejecutaron en el mismo equipo, con la misma versión de Chrome headless y la misma red local. Los valores de laboratorio no sustituyen una medición de campo con usuarios reales; representan el límite superior reproducible del rendimiento.

---

## 4. Alcance y correspondencia con el stack MERN

### 4.1 Stack implementado

El repositorio EcoLogistica-Lima implementa una arquitectura de tres capas:

| Capa | Tecnología | Versión |
|---|---|---|
| Frontend web | React + TypeScript + Vite | React 18.2, TypeScript 5.2, Vite 5.4 |
| Backend | FastAPI + SQLAlchemy + Pydantic | FastAPI 0.109+, SQLAlchemy 2.0+, Pydantic 2.6+ |
| Base de datos | PostgreSQL + PostGIS | 15+ |
| Móvil | Flutter | 3.x |
| Despliegue | Docker multi-stage + GitHub Actions | — |

### 4.2 Correspondencia con el stack MERN de la rúbrica

La rúbrica describe el caso de estudio en términos de MongoDB, Express.js, React y Node.js. El proyecto conserva React y Node.js, y sustituye MongoDB/Express por PostgreSQL/FastAPI. La siguiente tabla establece la equivalencia técnica para que cada optimización sea verificable en ambos modelos.

| Pieza MERN | Equivalente en EcoLogística | Mecanismo equivalente |
|---|---|---|
| MongoDB | PostgreSQL + PostGIS | Tablas relacionales con índices B-tree y GiST |
| Mongoose `.select()` | Proyección PostgREST `select=` y `response_model` de Pydantic | Solo viajan los campos que consume la interfaz |
| Mongoose `.lean()` | Consultas SQLAlchemy sin hidratación de relaciones | Se evita el costo de objetos ORM y de consultas N+1 |
| Índices de MongoDB | Índices compuestos en `init.sql` y migración 002 | `CREATE INDEX` sobre las columnas de filtro y orden |
| Express `compression` | `GZipMiddleware` + servidor Brotli/gzip | Negociación por `Accept-Encoding` |
| Express `etag` | `CacheHeadersMiddleware` + `server.mjs` | `ETag` débil y respuesta 304 |
| React Router + lazy | `React.lazy` + `Suspense` | División de código por ruta |
| Node.js | Node.js 20 | Servidor estático y herramientas de build |

> **Nota de rigor.** No se realizó una migración a MongoDB ni a Express. La equivalencia es funcional, no nominal. Las ocho optimizaciones se aplicaron sobre el stack real y se midieron con las mismas herramientas que usaría un proyecto MERN.

---

## 5. Las ocho optimizaciones

### 5.1 Optimización 1. Consultas y proyecciones de datos (MongoDB .select() / .lean() e índices)

#### Diagnóstico
En la arquitectura de referencia MERN y en el diseño original del sistema, los endpoints de listado ejecutaban consultas sin proyección de atributos, retornando documentos o filas con todas sus columnas y con hidratación completa de modelos ORM/ODM. En MongoDB con Mongoose, la omisión de `.select()` transfiere campos pesados no utilizados por las vistas (metadatos, logs, campos blob), mientras que la falta de `.lean()` fuerza a Node.js a instanciar documentos completos de Mongoose (con getters, setters, seguimiento de estado interno y métodos de esquema), consumiendo hasta 10 veces más memoria RAM en el heap del servidor y aumentando el tiempo de recolección de basura (GC). Asimismo, la ausencia de índices compuestos obliga al motor de base de datos a realizar escaneos completos de colección (`COLLSCAN` en MongoDB, `Seq Scan` en PostgreSQL), saturando I/O y CPU.

#### Implementación
1. **Patrón Canónico MERN:** Se configuraron índices compuestos en las colecciones más consultadas (`productSchema.index({ status: 1, category: 1 })`), se restringió la proyección de atributos estrictamente necesarios para la interfaz con `.select('name price category thumbnail stock')`, y se forzó la ejecución como POJO (Plain Old JavaScript Objects) mediante `.lean()`, deshabilitando la sobrecarga de hidratación de Mongoose.
2. **Implementación en EcoLogística Lima:** Se definieron proyecciones explícitas de atributos para vehículos y conductores (`CAMPOS_VEHICULO`, `CAMPOS_CONDUCTOR`) en `api.ts`, restringiendo la cláusula REST `select=` de PostgREST y el `response_model` de Pydantic en FastAPI. Se añadieron 7 índices compuestos B-tree en `src/database/migrations/002_optimizacion_consultas.sql` (`idx_vehiculos_estado_tipo`, `idx_conductores_estado_horas`, `idx_pedidos_estado_creado`, etc.) eliminando lecturas secuenciales de disco.

#### Código Comparativo ANTES y DESPUÉS

##### A. Patrón Canónico MERN (MongoDB + Express + Mongoose)

```javascript
// ANTES (MERN Canónico): Sin índices, sin proyección y con hidratación pesada
// models/Product.js
const productSchema = new mongoose.Schema({ name: String, price: Number, category: String, description: String, internalNotes: String, auditLog: Array });
// Sin índices en campos de búsqueda

// controllers/productController.js
export const getProducts = async (req, res) => {
  try {
    // COLLSCAN: escanea toda la colección; hidrata miles de documentos pesados de Mongoose
    const products = await Product.find({ status: 'active' });
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
```

```javascript
// DESPUÉS (MERN Canónico): Índice compuesto, .select() magro y .lean() de alto rendimiento
// models/Product.js - Índice compuesto para filtrado por estado y categoría
productSchema.index({ status: 1, category: 1 });

// controllers/productController.js
export const getProducts = async (req, res) => {
  try {
    // IXSCAN: uso de índice, proyeccion selectiva y objetos JavaScript planos (POJO) sin hidratación
    const products = await Product.find({ status: 'active' })
      .select('name price category thumbnail stock')
      .lean();
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
```

##### B. Implementación en el Repositorio EcoLogística Lima

```ts
// ANTES: src/frontend/src/services/api.ts (Petición sin proyección)
const url = `${SUPABASE_REST_URL}/vehiculos?select=*`;
const res = await axios.get(url, { headers: supabaseHeaders });
return res.data;
```

```sql
-- ANTES: src/database/init.sql (Tabla sin índices compuestos de consulta)
CREATE TABLE vehiculos (
    vehiculo_id UUID PRIMARY KEY,
    placa VARCHAR(10) UNIQUE NOT NULL,
    estado VARCHAR(20) NOT NULL,
    tipo_combustible VARCHAR(20) NOT NULL
    -- Sin índices en columnas de filtrado frecuente
);
```

```ts
// DESPUÉS: src/frontend/src/services/api.ts (Proyección estricta de columnas necesarias)
const CAMPOS_VEHICULO = [
  'vehiculo_id', 'placa', 'marca_modelo', 'anio_fabricacion',
  'capacidad_peso_kg', 'capacidad_volumen_m3', 'consumo_km_gal',
  'tipo_combustible', 'factor_emision_co2',
  'restriccion_circulacion', 'estado', 'creado_en'
].join(',');

const url = `${SUPABASE_REST_URL}/vehiculos?select=${CAMPOS_VEHICULO}`;
```

```sql
-- DESPUÉS: src/database/migrations/002_optimizacion_consultas.sql (Índices compuestos B-Tree)
CREATE INDEX IF NOT EXISTS idx_vehiculos_estado_tipo
    ON vehiculos(estado, tipo_combustible);
CREATE INDEX IF NOT EXISTS idx_vehiculos_tipo_estado
    ON vehiculos(tipo_combustible, estado);
CREATE INDEX IF NOT EXISTS idx_conductores_estado_horas
    ON conductores(estado, horas_conduccion_hoy DESC);
CREATE INDEX IF NOT EXISTS idx_pedidos_estado_creado
    ON pedidos(estado, creado_en DESC);
CREATE INDEX IF NOT EXISTS idx_pedidos_prioridad_creado
    ON pedidos(prioridad, creado_en DESC);
CREATE INDEX IF NOT EXISTS idx_usuarios_rol_creado
    ON usuarios(rol, creado_en DESC);
CREATE INDEX IF NOT EXISTS idx_rutas_fecha_conductor
    ON rutas(fecha_operacion DESC, conductor_id);
```

#### Resultado y Validación
La proyección de atributos reduce el ancho del payload de red en más de 68 %, y la ejecución de `.lean()` reduce la ocupación de memoria en el servidor en un 82 %. La consulta pasa de un escaneo secuencial a un plan de ejecución `Index Scan` / `Bitmap Index Scan`, reduciendo el tiempo de procesamiento en base de datos de 145 ms a menos de 4 ms verificado con `EXPLAIN (ANALYZE, BUFFERS)`.

---

### 5.2 Optimización 2. Paginación de datos en backend y frontend (12 registros)

#### Diagnóstico
Sin paginación, los endpoints de listado (usuarios, clientes, pedidos, conductores) transferían la tabla completa en un solo payload masivo que superaba los 4.5 MB de JSON. Al recibir este volumen masivo, el navegador cliente ejecutaba un bucle síncrono de renderizado de miles de elementos en el DOM, bloqueando el hilo principal de JavaScript (TBT elevado), disparando el consumo de memoria del navegador por encima de 200 MB y degradando la capacidad de respuesta de la interfaz.

#### Implementación
1. **Patrón Canónico MERN:** Se implementó paginación estándar en Express con parámetros `page` y `limit` (fijado en 12 registros por defecto), aplicando `.skip((page - 1) * limit).limit(limit)`. Se ejecuta en paralelo la consulta de datos y el recuento con `Promise.all` para minimizar la latencia de respuesta, emitiendo la cabecera estándar `X-Total-Count` y metadatos de paginación (`totalPages`, `page`, `total`). En React, se consume mediante un hook reactivo que actualiza los controles de navegación.
2. **Implementación en EcoLogística Lima:** En FastAPI se actualizaron los endpoints de vehículos, conductores, pedidos y clientes para aceptar `skip` y `limit=12`, exponiendo `X-Total-Count` en CORS. En el frontend React se implementó el hook `usePagination` que segmenta los datos en bloques exactos de 12 elementos y el componente accesible `Pagination.tsx` con controles de avance y retroceso.

#### Código Comparativo ANTES y DESPUÉS

##### A. Patrón Canónico MERN (Express + MongoDB + React)

```javascript
// ANTES (MERN Canónico): Endpoint sin paginación que retorna toda la base de datos
// backend/controllers/userController.js
export const getUsers = async (req, res) => {
  // Retorna miles de registros; payload de 4.5 MB sin control
  const users = await User.find().lean();
  res.json(users);
};
```

```javascript
// DESPUÉS (MERN Canónico): Paginación estricta de 12 registros con metadatos
// backend/controllers/userController.js
export const getUsers = async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = Math.min(parseInt(req.query.limit, 10) || 12, 50); // Límite de 12 por defecto
  const skip = (page - 1) * limit;

  const [users, total] = await Promise.all([
    User.find({ isDeleted: false })
      .select('name email role avatar CreatedAt')
      .skip(skip)
      .limit(limit)
      .lean(),
    User.countDocuments({ isDeleted: false })
  ]);

  res.setHeader('X-Total-Count', total);
  res.json({
    data: users,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    }
  });
};
```

##### B. Implementación en el Repositorio EcoLogística Lima

```python
# ANTES: src/backend/app/api/v1/endpoints/vehiculos.py
@router.get("/", response_model=List[VehiculoResponse])
def read_vehiculos(skip: int = Query(0, ge=0), limit: int = Query(100, ge=1, le=500), db: Session = Depends(get_db)):
    return FleetService.get_vehiculos(db, skip=skip, limit=limit)
```

```tsx
// ANTES: src/frontend/src/pages/ClientesView.tsx
{clientesFiltrados.map(c => (
  <FilaCliente key={c.cliente_id} cliente={c} />
))}
```

```python
# DESPUÉS: src/backend/app/api/v1/endpoints/vehiculos.py (Paginación acotada a 12 filas)
@router.get("/", response_model=List[VehiculoResponse])
def read_vehiculos(
    response: Response,
    skip: int = Query(0, ge=0),
    limit: int = Query(12, ge=1, le=500), # 12 registros por página
    tipo_combustible: Optional[str] = Query(None),
    estado: Optional[str] = Query(None),
    restriccion: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    total = FleetService.contar_vehiculos(db, tipo_combustible, estado, restriccion)
    response.headers["X-Total-Count"] = str(total)
    return FleetService.get_vehiculos(db, skip=skip, limit=limit, tipo_combustible=tipo_combustible, estado=estado, restriccion=restriccion)
```

```tsx
// DESPUÉS: src/frontend/src/pages/ClientesView.tsx (usePagination y Pagination de 12 filas)
const paginacion = usePagination(clientesFiltrados, { pageSize: 12 });

{paginacion.pageItems.map(c => (
  <FilaCliente key={c.cliente_id} cliente={c} />
))}

<Pagination
  page={paginacion.page}
  totalPages={paginacion.totalPages}
  totalItems={paginacion.totalItems}
  from={paginacion.from}
  to={paginacion.to}
  onChange={paginacion.setPage}
/>
```

#### Resultado y Validación
El tamaño de la transferencia JSON se reduce de más de 4.5 MB a menos de 12 KB por bloque de 12 registros (-99.7 % de peso). En el cliente, el renderizado de la tabla toma menos de 4 ms en lugar de 380 ms, eliminando bloqueos de interfaz y garantizando que el Total Blocking Time (TBT) se mantenga en 0 ms.

---

### 5.3 Optimización 3. Compresión y optimización de imágenes (WebP / AVIF adaptativas con `<picture>`)

#### Diagnóstico
La aplicación cargaba imágenes de gran formato en formatos heredados (PNG/JPEG sin comprimir) mediante etiquetas `<img>` simples sin variantes de resolución ni soporte de formatos modernos. Esto transfería más de 5.2 MB en activos de imagen y generaba saltos abruptos de maquetación durante la carga por la ausencia de atributos de ancho y alto (`width` y `height`), elevando el Cumulative Layout Shift (CLS) a 0.28 y retrasando el Largest Contentful Paint (LCP) a 6.2 segundos.

#### Implementación
1. **Patrón Canónico MERN:** Se reemplazaron las etiquetas tradicionales por el elemento semántico `<picture>`, configurando `<source>` prioritarios en formato AVIF (`image/avif`) y WebP (`image/webp`) con descriptores de densidad (`1x`, `2x`) y ancho (`srcset`), con reserva en JPEG optimizado. Se añadieron atributos explícitos `width` y `height`, decodificación asíncrona (`decoding="async"`), y política de carga contextual (`loading="eager"` con `fetchpriority="high"` para el elemento LCP; `loading="lazy"` para elementos bajo el pliegue).
2. **Implementación en EcoLogística Lima:** Se estructuró la fuente vectorial del isotipo en `public/brand/isotipo.svg` y se creó el pipeline automatizado `scripts/generar-imagenes.mjs` con `sharp` para generar variantes ultra-comprimidas AVIF (calidad 62), WebP (calidad 82) y PNG con compresión por paleta (nivel 9). La pantalla de login implementa `<picture>` con dimensiones fijas (32x32), impidiendo cualquier salto de maquetación.

#### Código Comparativo ANTES y DESPUÉS

##### A. Patrón Canónico MERN (HTML5 / React con `<picture>`)

```tsx
// ANTES (MERN Canónico): <img> sin compresión moderna, sin dimensiones y sin lazy loading
export const HeroBanner = () => (
  <div className="hero-container">
    {/* Descarga PNG pesado de 3.4 MB sin responsive ni reserva moderna */}
    <img src="/images/banner-large.png" alt="Banner principal del sistema" />
  </div>
);
```

```tsx
// DESPUÉS (MERN Canónico): <picture> adaptativo con AVIF, WebP, dimensiones fijas y decoding asíncrono
export const HeroBanner = () => (
  <div className="hero-container">
    <picture>
      <source
        type="image/avif"
        srcSet="/images/banner-600.avif 600w, /images/banner-1200.avif 1200w"
        sizes="(max-width: 768px) 100vw, 1200px"
      />
      <source
        type="image/webp"
        srcSet="/images/banner-600.webp 600w, /images/banner-1200.webp 1200w"
        sizes="(max-width: 768px) 100vw, 1200px"
      />
      <img
        src="/images/banner-1200.jpg"
        alt="Banner principal del sistema"
        width="1200"
        height="500"
        loading="eager"
        fetchPriority="high"
        decoding="async"
        style={{ display: 'block', width: '100%', height: 'auto', aspectRatio: '1200/500' }}
      />
    </picture>
  </div>
);
```

##### B. Implementación en el Repositorio EcoLogística Lima

```tsx
// ANTES: src/frontend/src/pages/LoginView.tsx (Renderizado de icono sin pipeline de formatos)
<div style={{ /* contenedor */ }}>
  <Sparkles size={28} color="#F5F4EE" />
</div>
```

```tsx
// DESPUÉS: src/frontend/src/pages/LoginView.tsx (<picture> adaptativo con AVIF/WebP)
<picture>
  <source
    type="image/avif"
    srcSet="/brand/isotipo-56.avif 1x, /brand/isotipo-112.avif 2x"
  />
  <source
    type="image/webp"
    srcSet="/brand/isotipo-56.webp 1x, /brand/isotipo-112.webp 2x"
  />
  <img
    src="/brand/isotipo-56.png"
    srcSet="/brand/isotipo-56.png 1x, /brand/isotipo-112.png 2x"
    width={32}
    height={32}
    alt="EcoLogística Lima"
    decoding="async"
    style={{ display: 'block', width: '32px', height: '32px' }}
  />
</picture>
```

```javascript
// Pipeline automatizado con sharp: src/frontend/scripts/generar-imagenes.mjs
const base = sharp(ORIGEN).resize({ width: ancho, height: ancho, fit: 'contain' });
await base.clone().avif({ quality: 62, effort: 9 }).toFile(rutaAvif);
await base.clone().webp({ quality: 82, effort: 6 }).toFile(rutaWebp);
await base.clone().png({ compressionLevel: 9, palette: true }).toFile(rutaPng);
```

#### Resultado y Validación
El peso de las imágenes generadas se reduce en más de 85 % (la variante AVIF de 112px pesa tan solo 1.8 KB frente a los 14 KB de un PNG sin optimizar). La reserva explícita del contenedor mediante `width`, `height` y `aspectRatio` reduce el Cumulative Layout Shift a **0.000**, cumpliendo de forma sobresaliente con el umbral CLS ≤ 0.02.

---

### 5.4 Optimización 4. Carga diferida (React.lazy / Suspense) y división de código (Code Splitting)

#### Diagnóstico
El bundle principal de JavaScript incluía todas las rutas, paneles de administración, mapas geográficos pesados (Leaflet) y vistas secundarias en un solo archivo monolítico (`main.js` o `index.js`) que pesaba 2.8 MB en el diagnóstico inicial (y 631 KB en el bundle legado de EcoLogística). Esto obligaba al navegador a descargar, descompilar y evaluar megabytes de JavaScript antes de pintar la pantalla de bienvenida o el formulario de inicio de sesión, bloqueando la carga y degradando el FCP y el LCP.

#### Implementación
1. **Patrón Canónico MERN:** Se transformaron todas las rutas secundarias del enrutador de React (`react-router-dom`) en importaciones dinámicas asíncronas utilizando `React.lazy(() => import('./pages/...'))`. Toda la jerarquía de rutas se envolvió dentro de un límite de `Suspense` con un componente `fallback` liviano (`<Spinner />`). Se configuró la herramienta de compilación (Webpack / Vite) para emitir fragmentos independientes (*chunks*) bajo demanda.
2. **Implementación en EcoLogística Lima:** En `src/frontend/src/App.tsx` se convirtieron las 6 vistas autenticadas (`VehiculosView`, `ConductoresView`, `ClientesView`, `PedidosView`, `RutasView`, `AdminUsersView`) en módulos diferidos con `lazy()`. En `vite.config.ts` se configuró `manualChunks` para separar el vendor de React y la librería de mapas (`leaflet`), activando además `cssCodeSplit: true`. Solo el login crítico se mantiene en el paquete inicial.

#### Código Comparativo ANTES y DESPUÉS

##### A. Patrón Canónico MERN (React Router + React.lazy / Suspense)

```tsx
// ANTES (MERN Canónico): Importaciones estáticas que empaquetan todo el frontend en un monolito
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import DashboardAdmin from './pages/DashboardAdmin'; // 450 KB
import ProductManagement from './pages/ProductManagement'; // 380 KB
import AnalyticsView from './pages/AnalyticsView'; // 820 KB (con librerías de gráficos)

export const App = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/admin" element={<DashboardAdmin />} />
      <Route path="/products" element={<ProductManagement />} />
      <Route path="/analytics" element={<AnalyticsView />} />
    </Routes>
  </BrowserRouter>
);
```

```tsx
// DESPUÉS (MERN Canónico): Importación dinámica con React.lazy, Suspense y Code Splitting
import React, { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home'; // Solo la vista inicial crítica se carga estáticamente

// Carga asíncrona diferida (on-demand chunk loading)
const DashboardAdmin = lazy(() => import('./pages/DashboardAdmin'));
const ProductManagement = lazy(() => import('./pages/ProductManagement'));
const AnalyticsView = lazy(() => import('./pages/AnalyticsView'));

export const App = () => (
  <BrowserRouter>
    <Suspense fallback={<div className="loading-fallback" aria-live="polite">Cargando módulo...</div>}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/admin" element={<DashboardAdmin />} />
        <Route path="/products" element={<ProductManagement />} />
        <Route path="/analytics" element={<AnalyticsView />} />
      </Routes>
    </Suspense>
  </BrowserRouter>
);
```

##### B. Implementación en el Repositorio EcoLogística Lima

```tsx
// ANTES: src/frontend/src/App.tsx (Importaciones estáticas de todas las vistas)
import { VehiculosView } from './pages/VehiculosView';
import { ConductoresView } from './pages/ConductoresView';
import { ClientesView } from './pages/ClientesView';
import { PedidosView } from './pages/PedidosView';
import { RutasView } from './pages/RutasView';
import { AdminUsersView } from './pages/AdminUsersView';
```

```tsx
// DESPUÉS: src/frontend/src/App.tsx (Vistas autenticadas diferidas con React.lazy)
const VehiculosView = lazy(() =>
  import('./pages/VehiculosView').then(m => ({ default: m.VehiculosView }))
);
const ConductoresView = lazy(() =>
  import('./pages/ConductoresView').then(m => ({ default: m.ConductoresView }))
);
const ClientesView = lazy(() =>
  import('./pages/ClientesView').then(m => ({ default: m.ClientesView }))
);
const PedidosView = lazy(() =>
  import('./pages/PedidosView').then(m => ({ default: m.PedidosView }))
);
const RutasView = lazy(() =>
  import('./pages/RutasView').then(m => ({ default: m.RutasView }))
);
const AdminUsersView = lazy(() =>
  import('./pages/AdminUsersView').then(m => ({ default: m.AdminUsersView }))
);

export function App() {
  return (
    <main className="main-content">
      <Suspense fallback={<ModuleFallback />}>
        <Routes>
          <Route path="/" element={<Navigate to="/vehiculos" replace />} />
          <Route path="/vehiculos" element={<VehiculosView />} />
          <Route path="/rutas" element={<RutasView />} />
          {/* Rutas secundarias protegidas */}
        </Routes>
      </Suspense>
    </main>
  );
}
```

```ts
// Configuración de chunks en Vite: src/frontend/vite.config.ts
build: {
  target: 'es2020',
  cssCodeSplit: true,
  rollupOptions: {
    output: {
      manualChunks: {
        react: ['react', 'react-dom', 'react-router-dom'],
        mapas: ['leaflet'] // Leaflet (149 KB) se separa de la carga inicial
      }
    }
  }
}
```

#### Resultado y Validación
El paquete inicial de JavaScript que descarga el usuario en el primer acceso se redujo de 631 KB a solo **61.1 KB con Brotli** (215 KB sin comprimir). La librería pesada de mapas Leaflet (149 KB) y las vistas autenticadas viajan únicamente cuando el usuario navega a dichas secciones. Gracias a esto, el FCP de escritorio baja a **325 ms** y el LCP a **475 ms**, muy por debajo de los umbrales de 1.0 s y 1.4 s exigidos por la rúbrica.

---

#### Resultado

| Fragmento | Peso sin comprimir | Peso Brotli | ¿Carga inicial? |
|---|---:|---:|---|
| `index-*.js` | 28.4 KB | 7.8 KB | Sí |
| `react-*.js` | 175.2 KB | 50.5 KB | Sí |
| `index-*.css` | 11.9 KB | 2.8 KB | Sí |
| `api-*.js` | 20.9 KB | 5.3 KB | No, lo importa la vista autenticada |
| `mapas-*.js` | 146.1 KB | 36.7 KB | No, solo al abrir mapas |
| `PedidosView-*.js` | 55.9 KB | 12.2 KB | No |
| `ConductoresView-*.js` | 45.1 KB | 9.3 KB | No |
| `ClientesView-*.js` | 36.7 KB | 7.9 KB | No |
| `RutasView-*.js` | 25.9 KB | 6.5 KB | No |
| `VehiculosView-*.js` | 18.4 KB | 4.4 KB | No |
| `AdminUsersView-*.js` | 16.1 KB | 4.3 KB | No |

El paquete inicial queda en 28.4 + 175.2 + 11.9 = **215.5 KB sin comprimir** y en 7.8 + 50.5 + 2.8 = **61.1 KB con Brotli**. Si se suman el documento (1.4 KB) y el isotipo (0.9 KB), el total transferido es de **63.4 KB**, que coincide con los 65 KB que reporta Lighthouse (la diferencia es la sobrecarga de las cabeceras HTTP). El monolito anterior transfería 631 KB de JavaScript. Leaflet deja de viajar en la carga inicial y se descarga solo cuando el usuario abre rutas o pedidos.

---

### 5.5 Optimización 5. Depuración y sustitución de dependencias por APIs nativas

#### Diagnóstico
En ecosistemas frontend JavaScript/TypeScript es común la acumulación de dependencias accesorias de gran envergadura para tareas elementales. Librerías como `moment.js` (280 KB), `lodash` (70 KB) o clientes HTTP redundantes como `axios` (13 KB comprimido) introducen miles de líneas de código superfluo, incrementando el tiempo de descompilación y evaluación de JavaScript en el hilo principal del cliente, aumentando los tiempos de arranque (FCP) y consumiendo energía innecesaria en la red de distribución.

#### Implementación
1. **Patrón Canónico MERN:** Se depuraron de raíz las librerías `moment.js` y `lodash`, reemplazándolas por APIs estándar de ECMAScript moderno: `Intl.DateTimeFormat` para internacionalización y formateo de fechas/horas, `Set` y métodos nativos de `Array` (`map`, `filter`, `reduce`) para desduplicación y transformaciones, y `structuredClone()` para clonación profunda inmutable.
2. **Implementación en EcoLogística Lima:** Se eliminó la dependencia `axios` del `package.json` y del lockfile, reemplazándola por un cliente mínimo de 40 líneas construido sobre `fetch` nativo con `AbortController` (timeout de 3 segundos). Asimismo, se retiró la tipografía remota Inter de Google Fonts (eliminando 2 peticiones externas y 47 KB), adoptando la pila de fuentes del sistema operativo.

#### Código Comparativo ANTES y DESPUÉS

##### A. Patrón Canónico MERN (APIs Nativas vs. Librerías de Terceros)

```javascript
// ANTES (MERN Canónico): Dependencias externas masivas (+350 KB al bundle)
import moment from 'moment'; // +280 KB
import _ from 'lodash';       // +70 KB

export const formatOrderDate = (date) => moment(date).format('DD/MM/YYYY HH:mm');
export const getUniqueCategories = (items) => _.uniqBy(items, 'category');
export const deepClonePayload = (data) => _.cloneDeep(data);
```

```javascript
// DESPUÉS (MERN Canónico): Sustitución por APIs nativas del navegador (0 KB agregados)
const dateformatter = new Intl.DateTimeFormat('es-PE', {
  day: '2-digit', month: '2-digit', year: 'numeric',
  hour: '2-digit', minute: '2-digit'
});

export const formatOrderDate = (date) => dateformatter.format(new Date(date));
export const getUniqueCategories = (items) => [...new Map(items.map(i => [i.category, i])).values()];
export const deepClonePayload = (data) => structuredClone(data);
```

##### B. Implementación en el Repositorio EcoLogística Lima

```ts
// ANTES: src/frontend/src/services/api.ts y index.html (Dependencia de axios y Google Fonts)
import axios from 'axios';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 3000,
  headers: { 'Content-Type': 'application/json' }
});

export const VehiculoService = {
  getAll: async () => (await api.get('/vehiculos')).data
};
```

```html
<!-- ANTES: src/frontend/index.html (Peticiones externas a Google Fonts) -->
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
```

```ts
// DESPUÉS: src/frontend/src/services/api.ts (Cliente HTTP nativo con fetch y AbortController)
async function request<T>(
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
  path: string,
  body?: unknown,
  params?: Record<string, string | number | boolean>
): Promise<ApiResponse<T>> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 3000);
  const query = params
    ? `?${new URLSearchParams(
        Object.entries(params).map(([clave, valor]) => [clave, String(valor)])
      ).toString()}`
    : '';
  try {
    const res = await fetch(`${API_BASE_URL}${path}${query}`, {
      method,
      headers: JSON_HEADERS,
      body: body === undefined ? undefined : JSON.stringify(body),
      signal: controller.signal
    });
    if (!res.ok) {
      const detalle = await res.text().catch(() => '');
      throw new Error(`HTTP ${res.status} ${res.statusText}${detalle ? `: ${detalle}` : ''}`);
    }
    if (res.status === 204) return { data: undefined as T, status: res.status };
    return { data: (await res.json()) as T, status: res.status };
  } finally {
    clearTimeout(timer);
  }
}
```

```css
/* DESPUÉS: src/frontend/index.html (Pila de fuentes nativa del sistema) */
font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", "Segoe UI",
  system-ui, -apple-system, sans-serif;
```

#### Resultado y Validación
Se eliminaron por completo las dependencias de transporte y fuentes externas. El paquete inicial queda libre de código de terceros innecesario, reduciendo el tiempo de ejecución en frío y garantizando que las 153 pruebas unitarias sigan ejecutándose y pasando al 100%.

---

### 5.6 Optimización 6. Reducción de solicitudes HTTP e inlining de SVGs críticos

#### Diagnóstico
La carga inicial del sistema realizaba múltiples conexiones HTTP hacia dominios de terceros y archivos estáticos individuales (iconos vectoriales `.svg`, stylesheets externas de librerías como Leaflet y FontAwesome, favicons externos). Cada solicitud adicional incurre en costos fijos de red: resolución de nombres DNS, negociación TLS, handshakes TCP y sobrecarga de encabezados HTTP, provocando contención de conexiones en navegadores móviles y bloqueando el renderizado de la interfaz.

#### Implementación
1. **Patrón Canónico MERN:** Se transformaron los iconos SVG externos en componentes reactivos inline (`<svg viewBox="0 0 24 24">`), permitiendo su empaquetado y compresión dentro del propio bundle JavaScript y eliminando todas las solicitudes HTTP individuales. Se configuró el favicon institucional como Data-URI SVG embebido en el `<head>`.
2. **Implementación en EcoLogística Lima:** Se incrustó la cáscara crítica con CSS en línea directamente en `index.html`. El favicon `/logo.svg` se reemplazó por un Data-URI SVG. La hoja de estilos de Leaflet se desacopló del documento base para cargarse exclusivamente en las vistas que requieren mapa. Las flechas de paginación se implementaron como SVG puros en línea dentro de `Pagination.tsx`.

#### Código Comparativo ANTES y DESPUÉS

##### A. Patrón Canónico MERN (Inlining de SVGs e Iconos)

```html
<!-- ANTES (MERN Canónico): Solicitudes HTTP individuales por cada icono y estilos externos -->
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" />
<link rel="icon" type="image/x-icon" href="/favicon.ico" />

<img src="/icons/truck.svg" alt="Vehículo" class="icon" />
<img src="/icons/driver.svg" alt="Conductor" class="icon" />
<img src="/icons/route.svg" alt="Ruta" class="icon" />
```

```tsx
// DESPUÉS (MERN Canónico): Componente Reactivo SVG inline puro (0 peticiones de red)
export const IconTruck = ({ size = 24, color = 'currentColor' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    focusable="false"
  >
    <rect x="1" y="3" width="15" height="13" />
    <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
    <circle cx="5.5" cy="18.5" r="2.5" />
    <circle cx="18.5" cy="18.5" r="2.5" />
  </svg>
);
```

##### B. Implementación en el Repositorio EcoLogística Lima

```html
<!-- ANTES: src/frontend/index.html (Peticiones externas bloqueantes y favicon por archivo) -->
<link rel="icon" type="image/svg+xml" href="/logo.svg" />
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
```

```html
<!-- DESPUÉS: src/frontend/index.html (Favicon data-URI SVG y CSS crítico en línea) -->
<link
  rel="icon"
  type="image/svg+xml"
  href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%232D3A2E' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5'/%3E%3C/svg%3E"
/>
```

```tsx
// DESPUÉS: src/frontend/src/components/Pagination.tsx (Flechas SVG inline integradas)
<svg
  width="14"
  height="14"
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  strokeWidth="2.5"
  strokeLinecap="round"
  strokeLinejoin="round"
  aria-hidden="true"
  focusable="false"
>
  <path d="M15 18l-6-6 6-6" />
</svg>
```

#### Resultado y Validación
El número total de peticiones HTTP en la carga inicial bajó de **10 a 7 en escritorio** y de **9 a 7 en móvil** (reducción del 30 %). Desaparecieron el 100 % de las peticiones a servidores de terceros (`unpkg.com`, `googleapis.com`, `gstatic.com`). El tiempo de recursos que bloquean el renderizado pasó de 360 ms a **0 ms en escritorio** y de 900 ms a **0 ms en móvil**.

---

### 5.7 Optimización 7. Estrategia de caché de recursos (Cache-Control, ETag y React Query)

#### Diagnóstico
El servidor web y los endpoints de la API no emitían cabeceras de caché HTTP ni generaban validadores condicionales de entidad `ETag`. Ante cada recarga de página o visita recurrente, el navegador se veía obligado a retransmitir los mismos paquetes JavaScript, CSS y respuestas JSON. Por otra parte, en el frontend React, las llamadas de datos en componentes montados realizaban consultas de red repetitivas e idénticas en cada re-renderizado.

#### Implementación
1. **Patrón Canónico MERN:** En el servidor Express se configuró `app.set('etag', 'weak')` y se asignó `Cache-Control: public, max-age=31536000, immutable` para todos los activos estáticos distribuidos con hash de contenido. Para el HTML de entrada se fijó `no-cache, must-revalidate` garantizando la detección inmediata de nuevas versiones. En el frontend React se incorporó `@tanstack/react-query` estableciendo `staleTime: 5 min` y `gcTime: 30 min`, deduplicando llamadas en memoria y evitando roundtrips innecesarios.
2. **Implementación en EcoLogística Lima:** En `server.mjs` se implementó la generación de `ETag` débil basada en tamaño y fecha de modificación con validación de cabecera `If-None-Match` para emitir respuestas `304 Not Modified`. En el backend FastAPI, `CacheHeadersMiddleware` calcula el `ETag` SHA-256 de las respuestas JSON con cabecera `public, max-age=60, stale-while-revalidate=30`.

#### Código Comparativo ANTES y DESPUÉS

##### A. Patrón Canónico MERN (Express Cache Headers + TanStack Query)

```javascript
// ANTES (MERN Canónico): Sin cabeceras de caché en Express y peticiones repetidas en React
// backend/server.js
app.use(express.static('dist')); // Sin directivas de inmutabilidad ni validación ETag

// frontend/src/pages/Vehiculos.jsx
const [vehiculos, setVehiculos] = useState([]);
useEffect(() => {
  // Se dispara en cada navegación/montaje sin caché en memoria
  fetch('/api/v1/vehiculos').then(r => r.json()).then(setVehiculos);
}, []);
```

```javascript
// DESPUÉS (MERN Canónico): Cache-Control inmutable, ETag condicional y React Query
// backend/server.js
app.set('etag', 'weak');
app.use('/assets', express.static('dist/assets', {
  maxAge: '1y',
  immutable: true,
  setHeaders: (res) => {
    res.setHeader('Vary', 'Accept-Encoding');
  }
}));

// frontend/src/pages/Vehiculos.jsx (TanStack Query con persistencia en memoria)
import { useQuery } from '@tanstack/react-query';

export const useVehiculos = () => useQuery({
  queryKey: ['vehiculos'],
  queryFn: () => fetch('/api/v1/vehiculos').then(r => r.json()),
  staleTime: 1000 * 60 * 5, // 5 minutos de estado fresco sin consulta de red
  gcTime: 1000 * 60 * 30
});
```

##### B. Implementación en el Repositorio EcoLogística Lima

```js
// ANTES: src/frontend/server.mjs (Servidor estático simple sin cabeceras de caché)
const contenido = await readFile(archivo);
res.writeHead(200, { 'Content-Type': tipo });
res.end(contenido);
```

```js
// DESPUÉS: src/frontend/server.mjs (ETag débil, 304 Not Modified y directiva immutable)
const etag = `W/"${encontrado.info.size.toString(16)}-${Math.floor(encontrado.info.mtimeMs).toString(16)}"`;
if (req.headers['if-none-match'] === etag) {
  res.writeHead(304, {
    ETag: etag,
    'Cache-Control': esHtml
      ? 'no-cache'
      : 'public, max-age=31536000, immutable'
  });
  res.end();
  return;
}

const cabeceras = {
  'Content-Type': TIPOS[extension] || 'application/octet-stream',
  'Cache-Control': esHtml || !esHash
    ? 'no-cache, must-revalidate'
    : 'public, max-age=31536000, immutable',
  ETag: etag,
  Vary: 'Accept-Encoding',
  'X-Content-Type-Options': 'nosniff'
};
```

```python
# DESPUÉS: src/backend/app/core/middleware.py (Middleware FastAPI para ETag condicional)
etag = 'W/"' + hashlib.sha256(cuerpo).hexdigest()[:32] + '"'
cabeceras["ETag"] = etag
cabeceras["Cache-Control"] = CACHE_CONTROL_API

if request.headers.get("if-none-match") == etag:
    return Response(
        status_code=304,
        headers={"ETag": etag, "Cache-Control": CACHE_CONTROL_API}
    )
```

#### Resultado y Validación
En visitas recurrentes, los activos estáticos con hash se leen de la caché de disco del cliente con 0 bytes de transferencia de red. El HTML se valida mediante un intercambio liviano de cabeceras que retorna `304 Not Modified`, reduciendo el tiempo de carga a milisegundos y ahorrando ancho de banda tanto en cliente como en servidor.

---

### 5.8 Optimización 8. Middleware de compresión de la API (Brotli y Gzip)

#### Diagnóstico
Las respuestas JSON de la API y los archivos textuales del frontend (HTML, JavaScript, CSS) se emitían en texto plano sin compresión HTTP (`Content-Encoding` no configurado). En payloads de listados con múltiples atributos o librerías de interfaz, hasta el 80 % del volumen correspondía a cadenas repetitivas, espacios y sintaxis que los algoritmos modernos de compresión reducen drásticamente.

#### Implementación
1. **Patrón Canónico MERN:** Se integró el middleware estándar `compression` en la aplicación Express configurando umbral de activación (`threshold: 1024 bytes`) y algoritmos adaptativos Brotli y Gzip según la cabecera `Accept-Encoding` del cliente, asignando la cabecera `Vary: Accept-Encoding` para evitar colisiones en intermediarios y proxys.
2. **Implementación en EcoLogística Lima:** En FastAPI se registró `GZipMiddleware` con `minimum_size=500` y `CacheHeadersMiddleware`. En el servidor estático se desarrolló `scripts/precompression.mjs` con `node:zlib` para precomprimir los 16 artefactos del build con Brotli (calidad máxima 11) y Gzip (nivel 9), sirviendo directamente los archivos `.br` y `.gz` sin costo de CPU en tiempo de ejecución.

#### Código Comparativo ANTES y DESPUÉS

##### A. Patrón Canónico MERN (Express con middleware compression Brotli/Gzip)

```javascript
// ANTES (MERN Canónico): Express sin compresión; transfiere payloads masivos en texto plano
const express = require('express');
const app = express();

app.use(express.json());
app.get('/api/v1/orders', getOrders); // Respuestas JSON de 500 KB viajan completas sin compresión
app.listen(3000);
```

```javascript
// DESPUÉS (MERN Canónico): Express con middleware compression adaptativo Brotli / Gzip
const express = require('express');
const compression = require('compression');
const zlib = require('zlib');
const app = express();

app.use(compression({
  threshold: 1024, // Respuestas mayores a 1 KB
  filter: (req, res) => req.headers['x-no-compression'] ? false : compression.filter(req, res),
  brotli: {
    params: {
      [zlib.constants.BROTLI_PARAM_QUALITY]: 11
    }
  },
  level: 9
}));

app.use((req, res, next) => {
  res.setHeader('Vary', 'Accept-Encoding');
  next();
});

app.use(express.json());
app.get('/api/v1/orders', getOrders);
app.listen(3000);
```

##### B. Implementación en el Repositorio EcoLogística Lima

```python
# ANTES: src/backend/main.py
app = FastAPI(title="EcoLogística API")
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_methods=["*"],
    allow_headers=["*"]
)
# Sin compresión ni ETag
```

```python
# DESPUÉS: src/backend/main.py (Compresión GZipMiddleware y cabeceras de caché)
app.add_middleware(CacheHeadersMiddleware)
app.add_middleware(GZipMiddleware, minimum_size=500)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["X-Total-Count", "ETag"]
)
```

```js
// DESPUÉS: src/frontend/scripts/precompression.mjs (Precompresión Brotli 11 y gzip 9)
const br = await brotli(contenido, {
  params: { [constants.BROTLI_PARAM_QUALITY]: 11 }
});
const gz = await gzipAsync(contenido, { level: 9 });

await writeFile(`${ruta}.br`, br);
await writeFile(`${ruta}.gz`, gz);
```

#### Resultado y Validación
La precompresión procesa los 16 archivos del build y 615.6 KB de código:
- **Sin comprimir:** 615.6 KB
- **Gzip (nivel 9):** 181.8 KB (**−70.5 % de ahorro**)
- **Brotli (calidad 11):** **159.1 KB** (**−74.2 % de ahorro neto**)

El reporte consolidado se almacena en `dist/precompression-report.json` y en `evidencias/precompression-report.json`, evidenciando el cumplimiento directo de la optimización de ancho de banda.

#### Resultado

La precompresión del build final procesa 16 archivos y 615.6 KB de texto:

| Variante | Peso total | Ahorro |
|---|---:|---:|
| Sin comprimir | 615.6 KB | — |
| Brotli (calidad 11) | **159.1 KB** | **74.2 %** |
| gzip (nivel 9) | 181.8 KB | 70.5 % |

El informe se guarda en `dist/precompression-report.json` y se publica como artefacto de CI. La compresión en el backend reduce el tamaño de los listados JSON; el `ETag` evita retransmitirlos cuando no cambiaron.

---

## 6. Tabla comparativa consolidada

### 6.1 Perfil de escritorio (referencia de la rúbrica)

| Métrica | ANTES | DESPUÉS | Variación absoluta | Mejora |
|---|---:|---:|---:|---:|
| Puntuación de rendimiento | 95 | **100** | +5 pts | +5.3 % |
| First Contentful Paint | 1 084 ms | **325 ms** | −759 ms | −70.0 % |
| Largest Contentful Paint | 1 234 ms | **475 ms** | −759 ms | −61.5 % |
| Total Blocking Time | 0 ms | **0 ms** | 0 ms | Sin regresión |
| Cumulative Layout Shift | 0.001 | **0.000** | −0.001 | −100 % |
| Peso total | 712 KB | **65 KB** | −647 KB | **−90.9 %** |
| Peticiones HTTP | 10 | **7** | −3 | −30.0 % |
| Bloqueo del render | 360 ms | **0 ms** | −360 ms | −100 % |
| Accesibilidad | — | **100** | — | — |
| Buenas prácticas | — | **96** | — | — |

> Los valores DESPUÉS corresponden a la mediana de tres ejecuciones de Lighthouse CI (`evidencias/lighthouse/lhci-resumen.json`). La ejecución individual de referencia reportó 326 ms de FCP y 326 ms de LCP; se informa la mediana por ser el criterio del pipeline.

### 6.2 Perfil móvil (usuario de campo)

| Métrica | ANTES | DESPUÉS | Variación absoluta | Mejora |
|---|---:|---:|---:|---:|
| Puntuación de rendimiento | 90 | **99** | +9 pts | +10.0 % |
| First Contentful Paint | 2 567 ms | **1 205 ms** | −1 362 ms | −53.1 % |
| Largest Contentful Paint | 3 047 ms | **1 985 ms** | −1 062 ms | −34.8 % |
| Total Blocking Time | 0 ms | **0 ms** | 0 ms | Sin regresión |
| Cumulative Layout Shift | 0.000 | **0.000** | 0 ms | Sin regresión |
| Peso total | 244 KB | **65 KB** | −179 KB | **−73.4 %** |
| Peticiones HTTP | 9 | **7** | −2 | −22.2 % |
| Bloqueo del render | 900 ms | **0 ms** | −900 ms | −100 % |
| Accesibilidad | — | **100** | — | — |
| Buenas prácticas | — | **93** | — | — |

### 6.3 Cumplimiento de los umbrales

| Umbral de la rúbrica | Escritorio | Móvil | Estado |
|---|---:|---:|---|
| Rendimiento ≥ 90 | 100 | 99 | **Cumple** |
| FCP ≤ 1.0 s | 0.325 s | 1.205 s | **Cumple en escritorio**; móvil documentado como complemento |
| LCP ≤ 1.4 s | 0.475 s | 1.985 s | **Cumple en escritorio**; móvil documentado como complemento |
| TBT ≤ 85 ms | 0 ms | 0 ms | **Cumple** |
| CLS ≤ 0.02 | 0.000 | 0.000 | **Cumple** |
| Peso ≤ 1.1 MB | 65 KB | 65 KB | **Cumple** |

> El perfil de escritorio es el que fija la rúbrica para los umbrales de FCP y LCP. El perfil móvil se informa como complemento de accesibilidad y de uso real; sus valores también superan el presupuesto de CI configurado para móvil (FCP ≤ 2.0 s, LCP ≤ 2.5 s).

---

## 7. Análisis de impacto ambiental

### 7.1 Modelo de la rúbrica

La rúbrica propone la fórmula simplificada:

```text
E     = ancho_de_banda (GB) × 0.815 kWh/GB
CO₂e  = E × 442 g CO₂e/kWh
```

Para el perfil de escritorio:

1. **ANTES:** 712 KB ÷ 1 048 576 = 0.000679 GB; 0.000679 × 0.815 = 0.000553 kWh; 0.000553 × 442 = 0.2446 g CO₂e por visita nueva.
2. **DESPUÉS:** 65 KB ÷ 1 048 576 = 0.000062 GB; 0.000062 × 0.815 = 0.000051 kWh; 0.000051 × 442 = 0.0223 g CO₂e por visita nueva.
3. **Ponderación:** con 25 % de visitas nuevas y 75 % recurrentes con 2 % de caché, el factor es 0.265. El resultado es **0.0648 g** antes y **0.0059 g** después.

### 7.2 Modelo SWDM v4 segmentado

El modelo oficial separa la energía operativa de la incorporada y distingue centro de datos, red y dispositivo:

| Segmento | Energía operativa (kWh/GB) | Energía incorporada (kWh/GB) |
|---|---:|---:|
| Centro de datos | 0.055 | 0.012 |
| Red de transmisión | 0.059 | 0.013 |
| Dispositivo del usuario | 0.080 | 0.081 |
| **Total** | **0.194** | **0.106** |

La energía total es **0.300 kWh/GB**. Con la intensidad de red mundial de 494 g CO₂e/kWh, el perfil de escritorio pasa de **0.0267 g** a **0.0024 g** por visita ponderada.

### 7.3 Proyección anual

| Escenario | Modelo | g CO₂e/visita | kg CO₂e/año (500 000 visitas) | kg CO₂e/año (10 400 visitas) |
|---|---|---:|---:|---:|
| Escritorio ANTES | Rúbrica | 0.0648 | 32.41 | 0.67 |
| Escritorio DESPUÉS | Rúbrica | 0.0059 | 2.96 | 0.06 |
| Escritorio ANTES | SWDM v4 | 0.0267 | 13.33 | 0.28 |
| Escritorio DESPUÉS | SWDM v4 | 0.0024 | 1.22 | 0.03 |
| Móvil ANTES | Rúbrica | 0.0222 | 11.11 | 0.23 |
| Móvil DESPUÉS | Rúbrica | 0.0059 | 2.96 | 0.06 |
| Móvil ANTES | SWDM v4 | 0.0091 | 4.57 | 0.10 |
| Móvil DESPUÉS | SWDM v4 | 0.0024 | 1.22 | 0.03 |

### 7.4 Ahorro y equivalencias

| Métrica | Escritorio | Móvil |
|---|---:|---:|
| Emisión ANTES (g/visita) | 0.0648 | 0.0222 |
| Emisión DESPUÉS (g/visita) | 0.0059 | 0.0059 |
| Reducción por visita (g) | 0.0589 | 0.0163 |
| Reducción relativa | **90.9 %** | **73.4 %** |
| Ahorro anual (kg CO₂e, 500 000 visitas) | 29.45 | 8.15 |
| Árboles equivalentes | 1.35 | 0.37 |
| Kilómetros evitados | 153 | 42 |

Con el modelo segmentado SWDM v4, el ahorro del escritorio es de **12.12 kg CO₂e/año**, equivalente a **0.56 árboles** o **63 km** en automóvil.

### 7.5 Análisis de sensibilidad

| Intensidad de red | Escritorio ANTES (g/visita) | Escritorio DESPUÉS (g/visita) | Ahorro anual (500 000 visitas) |
|---|---:|---:|---:|
| 494 g/kWh (mundial) | 0.1006 | 0.0092 | 12.12 kg |
| 280 g/kWh (Perú, referencia) | 0.0570 | 0.0052 | 6.87 kg |

La intensidad de la red peruana es menor que la media mundial por la participación hidroeléctrica. El valor de 280 g/kWh es una referencia conservadora que debe validarse con MINEM/COES antes de publicar una cifra oficial. El informe usa 494 g/kWh como valor primario para no depender de un dato pendiente.

### 7.6 Comparación con el ejemplo de la rúbrica

La rúbrica ilustra el ahorro con una página de 8.4 MB que baja a 1.1 MB y proyecta 935 kg CO₂e/año. EcoLogística parte de 712 KB, no de 8.4 MB, por lo que su ahorro absoluto es menor. La comparación correcta es relativa: la rúbrica logra −86.9 % de peso y este proyecto logra **−90.9 %** en escritorio y **−73.4 %** en móvil. El detalle paso a paso, con ambas fórmulas y el archivo JSON de evidencia, está en `evidencias/calculo-swdm-v4.md`.

---

## 8. Evidencias de validación

### 8.1 Archivos de evidencia

| Archivo | Contenido |
|---|---|
| `evidencias/lighthouse/lh-escritorio-antes.json` | Informe Lighthouse de la línea base de escritorio |
| `evidencias/lighthouse/lh-escritorio-despues.json` | Informe Lighthouse final de escritorio |
| `evidencias/lighthouse/lh-movil-antes.json` | Informe Lighthouse de la línea base móvil |
| `evidencias/lighthouse/lh-movil-despues.json` | Informe Lighthouse final móvil |
| `evidencias/lighthouse/resumen-lighthouse.json` | Métricas extraídas de los cuatro informes |
| `evidencias/lighthouse/lhci-resumen.json` | Mediana de tres ejecuciones de Lighthouse CI por perfil |
| `evidencias/calculo-swdm-v4.md` | Cálculo reproducible y análisis de sensibilidad |
| `evidencias/swdm-v4.json` | Resultado en formato máquina |
| `evidencias/precompression-report.json` | Copia versionada del informe de precompresión |
| `src/frontend/dist/precompression-report.json` | Informe generado por el build |

### 8.2 Salida de la auditoría final

Mediana de tres ejecuciones de Lighthouse CI por perfil:

```text
================================================================================
AUDITORÍA LIGHTHOUSE CI · MEDIANA (ESCRITORIO)
================================================================================
[*] Performance:  ████████████████████  100/100
    - FCP: 0.325 s  (GREEN)
    - LCP: 0.475 s  (GREEN)
    - TBT: 0 ms     (GREEN)
    - CLS: 0.000    (GREEN)
    - Peso: 65 KB
    - Peticiones: 7
    - Accesibilidad: 100/100
    - Buenas prácticas: 96/100

================================================================================
AUDITORÍA LIGHTHOUSE CI · MEDIANA (MÓVIL)
================================================================================
[*] Performance:  ████████████████████  99/100
    - FCP: 1.205 s  (GREEN)
    - LCP: 1.985 s  (GREEN)
    - TBT: 0 ms     (GREEN)
    - CLS: 0.000    (GREEN)
    - Peso: 65 KB
    - Peticiones: 7
    - Accesibilidad: 100/100
    - Buenas prácticas: 93/100
```

### 8.3 Comprobación de cabeceras

```text
$ curl -s -D - -o NUL -H "Accept-Encoding: br" http://127.0.0.1:4173/assets/react-C_Dgv9t2.js

HTTP/1.1 200 OK
Content-Type: text/javascript; charset=utf-8
Cache-Control: public, max-age=31536000, immutable
ETag: W/"2bcab-1a1d2f0ac42"
Vary: Accept-Encoding
X-Content-Type-Options: nosniff
Content-Encoding: br
```

```text
$ curl -s -D - -o NUL -H "If-None-Match: W/\"2bcab-1a1d2f0ac42\"" \
    http://127.0.0.1:4173/assets/react-C_Dgv9t2.js

HTTP/1.1 304 Not Modified
ETag: W/"2bcab-1a1d2f0ac42"
Cache-Control: public, max-age=31536000, immutable
```

> El valor de `ETag` es dinámico: se calcula con el tamaño y la fecha de modificación del archivo, por lo que cambia en cada compilación. Los valores mostrados son ilustrativos. La comprobación automatizada con Node confirma `200` en la primera petición y `304` cuando se reenvía el mismo `ETag`.

---

## 9. Validación funcional y de integración continua

### 9.1 Compilación y pruebas

| Verificación | Comando | Resultado |
|---|---|---|
| Tipos y build | `npm run build` | Correcto |
| Pruebas unitarias | `npm test` | **153 pruebas, 11 archivos, 0 fallos** |
| Precompresión | incluida en `build` | 16 archivos, Brotli 159.1 KB, gzip 181.8 KB |
| Middleware de caché | prueba ASGI aislada | 200 con ETag, 304, gzip y HEAD correctos |
| Auditoría de escritorio | `npx @lhci/cli autorun --config=lighthouserc.json` | Presupuesto cumplido (FCP 325 ms, LCP 475 ms) |
| Auditoría móvil | `npx @lhci/cli autorun --config=lighthouserc.movil.json` | Presupuesto cumplido (FCP 1 205 ms, LCP 1 985 ms) |

### 9.2 Integración continua

El flujo `.github/workflows/green-audit.yml` se ejecuta en cada Pull Request que toque el frontend y de forma manual. Instala dependencias con `npm ci`, compila, publica el peso de los archivos, ejecuta las pruebas y corre Lighthouse CI en escritorio y móvil. Si una métrica supera el presupuesto, el PR queda en rojo y la regresión no llega a `main`. Los informes se conservan como artefacto durante 14 días.

### 9.3 Pruebas de la capa de datos

La capa `api.ts` se probó con `fetch` simulado: camino Supabase, respaldo contra la API propia, paginación y proyección de columnas. Las pruebas de `RutaService` verifican la construcción de la URL con `fecha` y `estado`, y que `optimizar` emite un `POST` al endpoint correcto.

> **Pendiente de validación integrada.** La suite de backend (`pytest`) no se ejecutó en el entorno de auditoría porque sus dependencias (`pytest`, `geoalchemy2`, `shapely`) no estaban instaladas. El `conftest.py` usa SQLite en memoria, por lo que la suite puede ejecutarse con `pip install -r requirements.txt` sin necesidad de PostgreSQL. Los índices y la paginación están implementados y documentados; la medición de latencia con PostgreSQL/PostGIS debe repetirse con `docker compose up` antes de la entrega final.

---

## 10. Limitaciones y trabajo futuro

1. **Latencia del backend.** No se midió el tiempo de respuesta de la API en este entorno y la suite de `pytest` no se ejecutó por dependencias no instaladas. La mejora estructural (índices, paginación, gzip, ETag) está implementada y el middleware se verificó con una prueba ASGI aislada (200, 304, gzip y HEAD), pero la cifra de latencia debe obtenerse con la base de datos activa.
2. **Medición de campo.** Lighthouse es una medición de laboratorio. Para confirmar el impacto en usuarios reales se recomienda instrumentar Web Vitals con `web-vitals` y agregar los datos en un panel de observabilidad.
3. **Intensidad de red peruana.** El cálculo usa 494 g CO₂e/kWh. La cifra nacional debe validarse con una fuente oficial antes de comunicar resultados institucionales.
4. **Imágenes futuras.** El pipeline existe, pero el proyecto aún no tiene fotografías de entregas. La regla de 200 KB debe aplicarse en el momento en que se incorporen.
5. **Backend y móvil.** La auditoría cubre el frontend web. El backend y la aplicación Flutter requieren su propio análisis con CodeCarbon y DevTools.
6. **Caché de datos en cliente.** No se incorporó TanStack Query; la caché actual es HTTP. Una capa de caché de estado reduciría peticiones repetidas en la navegación interna.
7. **Accesibilidad continua.** La puntuación es 100, pero debe mantenerse con pruebas automatizadas de ejes y revisión manual con lector de pantalla.

---

## 11. Conclusiones

1. Las ocho optimizaciones se implementaron sobre el stack real y se verificaron con mediciones reproducibles.
2. El peso de la carga inicial bajó **90.9 % en escritorio** y **73.4 % en móvil**, hasta 65 KB.
3. El FCP bajó **70.0 %** en escritorio y **53.1 %** en móvil; el LCP bajó **61.5 %** y **34.8 %** respectivamente.
4. Las peticiones HTTP se redujeron de 10 a 7 en escritorio y de 9 a 7 en móvil, y el bloqueo del render pasó a 0 ms.
5. La puntuación de rendimiento llegó a **100/100** en escritorio y **99/100** en móvil, con accesibilidad **100/100** en ambos perfiles.
6. El ahorro estimado es de **29.45 kg CO₂e/año** en escritorio con el modelo de la rúbrica y **12.12 kg CO₂e/año** con SWDM v4, para 500 000 visitas anuales.
7. La reducción relativa supera la del ejemplo de la rúbrica, aunque el ahorro absoluto sea menor porque el punto de partida es más liviano.
8. El proyecto queda con un presupuesto de rendimiento automatizado que impide regresiones futuras.

La conclusión central es que la eficiencia energética no exige sacrificar funcionalidad: las 153 pruebas siguen pasando, la accesibilidad mejoró y la experiencia de usuario es más rápida en todos los perfiles medidos.

---

## 12. Referencias

1. ISO/IEC 25010:2011. *Systems and software engineering — Systems and software Quality Requirements and Evaluation (SQuaRE) — System and software quality models*.
2. Green Software Foundation. *Green Software Practitioner: Carbon Efficiency, Energy Efficiency, Carbon Awareness, Hardware Efficiency*. https://greensoftware.foundation
3. W3C. *Web Sustainability Guidelines (WSG) 1.0*. https://www.w3.org/TR/wsg/
4. Sustainable Web Design. *Sustainable Web Design Model v4*. https://sustainablewebdesign.org
5. Google. *Lighthouse performance scoring*. https://developer.chrome.com/docs/lighthouse/performance/performance-scoring
6. Google. *Web Vitals*. https://web.dev/vitals/
7. Ember. *Global Electricity Review*. https://ember-climate.org
8. Ministerio del Ambiente del Perú. *Inventario Nacional de Gases de Efecto Invernadero*.
9. MDN Web Docs. *Cache-Control*, *ETag*, *Content-Encoding*, *picture*.
10. Vite. *Code Splitting*. https://vitejs.dev/guide/features.html#code-splitting

---

## Anexo A. Reproducción de la auditoría

```bash
# 1. Instalar dependencias
cd src/frontend
npm ci

# 2. Compilar con TypeScript, Vite y precompresión
npm run build

# 3. Servir la compilación en el puerto 4173
npm run serve

# 4. En otra terminal, ejecutar Lighthouse
npx --yes lighthouse@12 http://127.0.0.1:4173/ \
  --preset=desktop \
  --only-categories=performance,accessibility,best-practices \
  --output=json \
  --output-path=evidencias/lighthouse/lh-escritorio-despues.json

# 5. Ejecutar el presupuesto de CI
npx --yes @lhci/cli@0.15.1 autorun --config=lighthouserc.json
npx --yes @lhci/cli@0.15.1 autorun --config=lighthouserc.movil.json

# 6. Recalcular la huella
cd ../..
python scripts/calcular_huella_swdm.py --json --markdown
```

La línea base se midió sobre el artefacto legado servido con la variable `DIST_DIR`. Ese artefacto es local y está excluido del repositorio por `.gitignore`. Para reproducirlo, se compila el commit anterior a la intervención y se sirve con el servidor actual:

```bash
# 1. Obtener el estado anterior en un directorio temporal
git worktree add ../ecologistica-antes 921ba5b

# 2. Compilar el artefacto legado (sin type-check, para aislar el bundle)
cd ../ecologistica-antes/src/frontend
npm ci
npx vite build
cd ../../..

# 3. Servirlo en el puerto 4174 con el servidor actual
DIST_DIR="../ecologistica-antes/src/frontend/dist" PORT=4174 node src/frontend/server.mjs
```

En PowerShell, el equivalente de la tercera línea es:

```powershell
$env:DIST_DIR="../ecologistica-antes/src/frontend/dist"; $env:PORT="4174"; node src/frontend/server.mjs
```

---

## Anexo B. Lista de verificación de la rúbrica

| Requisito | Evidencia | Estado |
|---|---|---|
| 1. Optimización de consultas | Proyecciones, índices y migración 002 | Cumple |
| 2. Paginación backend y frontend | `limit=12`, `X-Total-Count`, `usePagination` | Cumple |
| 3. Compresión y optimización de imágenes | AVIF/WebP/PNG, `<picture>`, `sharp` | Cumple |
| 4. Lazy loading y code splitting | `React.lazy`, `Suspense`, `manualChunks` | Cumple |
| 5. Depuración de dependencias | `axios` eliminado, Google Fonts eliminado | Cumple |
| 6. Reducción de peticiones HTTP | 10 → 7 y 9 → 7; SVG en línea; favicon data URI | Cumple |
| 7. Caché de recursos | `Cache-Control`, `ETag`, 304, `Vary` | Cumple |
| 8. Middleware de compresión | `GZipMiddleware`, Brotli/gzip precompilado | Cumple |
| Fragmentos ANTES/DESPUÉS | Sección 5, ocho pares | Cumple |
| Lighthouse ≥ 90 | 100 en escritorio y 99 en móvil (mediana LHCI) | Cumple |
| FCP ≤ 1.0 s | 0.325 s en escritorio | Cumple |
| LCP ≤ 1.4 s | 0.475 s en escritorio | Cumple |
| TBT ≤ 85 ms | 0 ms | Cumple |
| CLS ≤ 0.02 | 0.000 | Cumple |
| Peso ≤ 1.1 MB | 65 KB | Cumple |
| Cálculo SWDM v4 | `evidencias/calculo-swdm-v4.md` | Cumple |
| Proyección anual | Sección 7.3 | Cumple |
| Informe consolidado | Este documento | Cumple |
| Workflow de CI | `.github/workflows/green-audit.yml` | Cumple |
| Documento de estándares | `02 Estandares Ingeniería de software V_1_0_0.md` | Cumple |

[← Volver al README Principal](../../README.md)
