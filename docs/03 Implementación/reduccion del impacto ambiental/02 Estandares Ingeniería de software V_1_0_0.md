[← Volver al README Principal](../../README.md)

# Estándares de ingeniería de software y guía de desarrollo verde

## Marco normativo, reglas de clean code y matriz de trazabilidad

**Proyecto:** EcoLogística Lima — Optimizador de rutas sostenibles
**Versión del documento:** 1.0.0
**Fecha:** 12 de noviembre de 2026
**Repositorio:** `MartinezJhef/EcoLogistica-Lima`

| Campo | Detalle |
|---|---|
| Elaborado por | Equipo de desarrollo de EcoLogística Lima |
| Integrantes | Zayuri Cerron Medina (PM), Jheferson Martinez Valerio, Angela Rojas Quispe, Maylit Mendoza Alarcon, Diego Angulo Gonzales |
| Documento hermano | `01 Informe de reduccion del impacto ambiental V_1_0_0.md` |
| Evidencias | `evidencias/calculo-swdm-v4.md`, `evidencias/lighthouse/` |
| Normas de referencia | ISO/IEC 25010, GSF, W3C WSG 1.0, SWDM v4, SemVer 2.0.0 |

---

## Resumen ejecutivo

Este documento define el marco de ingeniería que sostiene la reducción del impacto ambiental descrita en el informe 01. No se limita a enumerar normas: traduce cada norma en reglas verificables, responsables y evidencias. El marco se apoya en cuatro pilares:

1. **ISO/IEC 25010** para evaluar la calidad del producto, con énfasis en eficiencia de desempeño y mantenibilidad.
2. **Green Software Foundation** para orientar las decisiones de carbono, energía, intensidad de red y hardware.
3. **W3C Web Sustainability Guidelines 1.0** para las prácticas de sostenibilidad web.
4. **Sustainable Web Design Model v4** para convertir bytes en energía y emisiones con una fórmula auditable.

El documento también establece las reglas de clean code para el backend y el frontend, la matriz que conecta las ocho optimizaciones con cada estándar, el flujo de integración continua que impide regresiones y la política de versionado semántico.

La regla central del marco es simple: **ninguna optimización se considera terminada si no tiene una medición antes y después, una prueba que la proteja y una evidencia almacenada en el repositorio**.

---

## Índice

1. [Marco normativo internacional](#1-marco-normativo-internacional)
2. [ISO/IEC 25010 aplicada al proyecto](#2-isoiec-25010-aplicada-al-proyecto)
3. [Principios de la Green Software Foundation](#3-principios-de-la-green-software-foundation)
4. [W3C Web Sustainability Guidelines 1.0](#4-w3c-web-sustainability-guidelines-10)
5. [Modelo SWDM v4 y métrica SCI](#5-modelo-swdm-v4-y-métrica-sci)
6. [Reglas de clean code](#6-reglas-de-clean-code)
7. [Matriz de mapeo de las ocho optimizaciones](#7-matriz-de-mapeo-de-las-ocho-optimizaciones)
8. [Pipeline de integración continua verde](#8-pipeline-de-integración-continua-verde)
9. [Gobernanza y definición de terminado](#9-gobernanza-y-definición-de-terminado)
10. [Versionado semántico](#10-versionado-semántico)
11. [Evidencias y trazabilidad](#11-evidencias-y-trazabilidad)
12. [Conclusiones](#12-conclusiones)
13. [Referencias](#13-referencias)
14. [Anexo A. Secuencia Git de despliegue documental](#anexo-a-secuencia-git-de-despliegue-documental)
15. [Anexo B. Glosario](#anexo-b-glosario)

---

## 1. Marco normativo internacional

### 1.1 Normas adoptadas

| Norma | Objeto | Aplicación en EcoLogística |
|---|---|---|
| ISO/IEC 25010:2011 | Modelo de calidad del producto de software | Criterios de aceptación de eficiencia y mantenibilidad |
| Green Software Foundation | Principios de software verde | Decisiones de diseño, compra de hardware y operación |
| W3C WSG 1.0 | Directrices de sostenibilidad web | Prácticas de UX, activos, red y arquitectura |
| SWDM v4 | Modelo de estimación de energía y carbono | Cálculo de la huella por visita y proyección anual |
| SCI (Software Carbon Intensity) | Métrica de intensidad de carbono por unidad funcional | Comparación entre versiones del sistema |
| SemVer 2.0.0 | Versionado semántico | Numeración de documentos y entregas |

### 1.2 Jerarquía de aplicación

Las normas no se aplican de forma aislada. La jerarquía adoptada es la siguiente:

1. **Norma internacional:** define el atributo de calidad o el principio.
2. **Regla de ingeniería:** traduce el atributo en una práctica concreta y verificable.
3. **Evidencia:** demuestra que la regla se cumplió (prueba, informe, captura o medición).
4. **Responsable:** persona o rol que responde por la evidencia.
5. **Umbral:** valor numérico que determina si la evidencia es aceptable.

Esta jerarquía evita el error frecuente de citar una norma sin demostrar su cumplimiento.

---

## 2. ISO/IEC 25010 aplicada al proyecto

### 2.1 Atributos priorizados

ISO/IEC 25010 define ocho características de calidad. El proyecto prioriza dos por su relación directa con la sostenibilidad:

**Eficiencia de desempeño.** Se divide en comportamiento temporal, utilización de recursos y capacidad.

| Subcaracterística | Definición operativa | Evidencia en EcoLogística |
|---|---|---|
| Comportamiento temporal | Tiempo de respuesta y de procesamiento | FCP 0.325 s, LCP 0.475 s, TBT 0 ms (mediana LHCI de escritorio) |
| Utilización de recursos | CPU, memoria y red consumidos por transacción | Peso 65 KB, 7 peticiones, proyecciones de columnas |
| Capacidad | Máximo de usuarios o transacciones sostenible | Paginación de 12 filas y compresión de respuestas |

**Mantenibilidad.** Se divide en modularidad, reusabilidad, analizabilidad, modificabilidad y capacidad de prueba.

| Subcaracterística | Definición operativa | Evidencia en EcoLogística |
|---|---|---|
| Modularidad | Separación en unidades con responsabilidad única | `React.lazy` por vista, `manualChunks`, hooks y componentes |
| Reusabilidad | Componentes y servicios reutilizables | `Pagination`, `usePagination`, `api.ts` |
| Analizabilidad | Facilidad para diagnosticar fallos | 153 pruebas, nombres descriptivos, errores con contexto |
| Modificabilidad | Costo de cambiar una parte | Configuración centralizada en `vite.config.ts` y `main.py` |
| Capacidad de prueba | Facilidad para verificar el comportamiento | Vitest + Testing Library, CI con presupuesto |

### 2.2 Criterios de aceptación

| Criterio | Umbral | Verificación |
|---|---:|---|
| Rendimiento Lighthouse | ≥ 90 | LHCI en escritorio |
| FCP | ≤ 1.0 s | LHCI en escritorio |
| LCP | ≤ 1.4 s | LHCI en escritorio |
| TBT | ≤ 85 ms | LHCI en escritorio |
| CLS | ≤ 0.02 | LHCI en escritorio |
| Peso de la página | ≤ 1.1 MB | LHCI en escritorio y móvil |
| Cobertura de pruebas | ≥ 80 % en servicios críticos | Vitest con cobertura |
| Accesibilidad | ≥ 90 | LHCI |
| Buenas prácticas | ≥ 90 | LHCI (informativo) |

### 2.3 Trazabilidad de la calidad

Cada criterio de aceptación tiene un origen normativo y una evidencia. Por ejemplo, el criterio «FCP ≤ 1.0 s» se deriva de la subcaracterística «comportamiento temporal» de ISO/IEC 25010, se operacionaliza con la regla «el primer dibujo no depende de hojas externas» y se evidencia con el informe de Lighthouse y la cáscara crítica en línea.

---

## 3. Principios de la Green Software Foundation

### 3.1 Los cuatro principios

| Principio | Definición | Decisión concreta en EcoLogística |
|---|---|---|
| Eficiencia de carbono | Emitir la menor cantidad de carbono por unidad de trabajo | Menos bytes por visita: 712 KB → 65 KB |
| Eficiencia energética | Consumir la menor cantidad de energía por unidad de trabajo | Menos CPU en el cliente: 631 KB de JS → 242 KB iniciales |
| Conciencia de carbono | Ejecutar cuando la red eléctrica es más limpia | Caché y compresión reducen la energía en horas de alta demanda; la programación de tareas pesadas se difiere |
| Eficiencia de hardware | Usar menos recursos y prolongar la vida útil de los dispositivos | Menos memoria y menos peticiones; la app funciona en equipos modestos |

### 3.2 Aplicación del principio de eficiencia de carbono

La eficiencia de carbono se mide como emisiones por unidad funcional. En este proyecto la unidad funcional es **una visita a la pantalla de inicio de sesión**. La reducción de bytes es la palanca principal:

```text
Carbono por visita = (bytes transferidos ÷ 1 048 576) × factor energético × intensidad de red
```

El factor energético y la intensidad de red se documentan en el anexo SWDM v4. La decisión de diseño es clara: cada kilobyte que no se envía es un kilobyte que no se procesa, no se transmite y no se enciende.

### 3.3 Aplicación del principio de eficiencia energética

La eficiencia energética se logra en tres frentes:

1. **Cliente:** menos JavaScript inicial, menos hidratación y menos trabajo de pintado.
2. **Red:** compresión Brotli/gzip y caché inmutable.
3. **Servidor:** respuestas paginadas, `ETag` y compresión de JSON.

### 3.4 Aplicación del principio de conciencia de carbono

La conciencia de carbono implica reconocer que la misma carga de trabajo contamina distinto según la hora y la región. El proyecto adopta dos medidas:

1. **Diferir tareas no interactivas.** La optimización de rutas y los informes pesados pueden ejecutarse fuera de las horas pico.
2. **Medir con intensidad de red declarada.** El cálculo usa 494 g CO₂e/kWh y presenta una sensibilidad a 280 g CO₂e/kWh para la matriz peruana.

### 3.5 Aplicación del principio de eficiencia de hardware

La eficiencia de hardware se traduce en longevidad: una aplicación que funciona bien en un teléfono de gama media no obliga al usuario a renovar el dispositivo. Las decisiones que contribuyen son:

1. Peso inicial de 65 KB.
2. Cero fuentes externas.
3. Carga diferida de mapas y módulos.
4. Imágenes AVIF/WebP con dimensiones explícitas.
5. Componentes accesibles y con foco visible.

---

## 4. W3C Web Sustainability Guidelines 1.0

### 4.1 Grupos de directrices y taxonomía

Las directrices *W3C Web Sustainability Guidelines (WSG) 1.0* organizan las mejores prácticas de sostenibilidad digital en cuatro dimensiones clave: experiencia de usuario (UX), desarrollo y arquitectura web, infraestructura de alojamiento/red y estrategia de producto. El proyecto adopta y operacionaliza rigurosamente los principios de diseño web ecológico para garantizar una navegación de ultrabajo impacto.

| Dimensión WSG | Principio de Sostenibilidad | Práctica Aplicada en EcoLogística | Evidencia Verificable |
|---|---|---|---|
| Experiencia de Usuario (UX) | Eficiencia de interacción y carga inmediata | Shell crítico en línea, cero fuentes web externas, navegación fluida | `index.html`, FCP 0.325 s |
| Desarrollo Web | Código limpio, modularidad y optimización de medios | Componentes atómicos, `<picture>`, WebP/AVIF, SVG inlining | Chunks Vite, `public/brand/` |
| Infraestructura y Red | Minimización de transporte y latencia | Compresión dual Brotli/gzip, validación ETag y caché inmutable | `server.mjs`, `main.py` |
| Estrategia y Monitoreo | Gobernanza y prevención de regresión | Auditoría automatizada con presupuesto estricto en CI | `green-audit.yml`, LHCI |

### 4.2 Justificación Rigurosa de las Pautas Evaluadas

La rúbrica de evaluación Green IT prioriza tres pautas fundamentales de las WSG 1.0 que rigen la optimización full-stack:

#### Pauta 1.2 — Media & Asset Optimization (Optimización de Medios Digitales y Activos)
Esta directriz establece que todos los activos visuales deben entregarse en el formato más eficiente disponible, con el tamaño más ajustado posible y sin bloquear el renderizado ni provocar inestabilidad visual:
1. **Formatos de Próxima Generación (AVIF y WebP):** Las imágenes maestras en PNG de 51.5 KB fueron transcodificadas mediante la biblioteca `sharp` a AVIF (12.4 KB, reducción del 75.9 %) y WebP (17.8 KB, reducción del 65.4 %), logrando ahorros volumétricos radicales sin pérdida perceptual de fidelidad cromática.
2. **Marcado Semántico Adaptativo (`<picture>`):** Se implementó el elemento estándar `<picture>` con fuentes tipadas `<source type="image/avif">`, `<source type="image/webp">` y degradación elegante a `<img>` estándar en PNG para compatibilidad universal con navegadores antiguos.
3. **Reserva Geométrica y Prevención de CLS:** Se definieron atributos explícitos `width` y `height` en la etiqueta de imagen. Esto permite al motor del navegador calcular la relación de aspecto (*aspect ratio*) y reservar el área geométrica antes de la descarga del binario, erradicando desplazamientos acumulados de maquetación y alcanzando un indicador de **CLS = 0.000** (ampliamente superando el umbral de ≤ 0.02).
4. **Carga Asíncrona y Diferida:** Se configuraron las directivas `loading="lazy"` para recursos fuera de la pantalla inicial y `decoding="async"` para descargar la decodificación de mapa de bits del hilo principal (*main thread*), reduciendo drásticamente el tiempo de bloqueo.

#### Pauta 2.4 — Code Architecture & Caching Strategies (Arquitectura de Código y Estrategias de Caché)
Esta directriz promueve una estructura modular del código que minimice el trabajo computacional inicial y establezca esquemas deterministas de reutilización de recursos en red:
1. **División de Código (Code Splitting) y Rutas Asíncronas:** Mediante `React.lazy()` y `Suspense`, el paquete JavaScript principal de la aplicación se descompuso en módulos independientes. Las rutas secundarias (`/clientes`, `/conductores`, `/pedidos`, `/rutas`, `/usuarios`, `/vehiculos`) y las librerías cartográficas pesadas (`leaflet`, 150 KB) se descargan exclusivamente bajo demanda cuando el usuario accede a dichas funcionalidades.
2. **Caché Inmutable en Activos con Hash Criptográfico:** Todos los recursos estáticos generados por el empaquetador (JavaScript, CSS, imágenes) contienen un hash de contenido en su nombre (`index-BSoSFp4l.js`). Se configuran cabeceras HTTP `Cache-Control: public, max-age=31536000, immutable`, indicando al navegador y a las redes de distribución (CDN) que el recurso es inmutable durante un año completo (31,536,000 segundos), eliminando por completo las solicitudes de red en visitas recurrentes.
3. **Validación Condicional con ETag y Respuestas 304:** Para los documentos mutables como `index.html`, el servidor calcula un validador de entidad basado en hash SHA-1. Cuando el cliente envía `If-None-Match`, el servidor responde instantáneamente con un código `304 Not Modified` y un cuerpo vacío (0 bytes de payload), desahogando la red.
4. **Caché de Estado en Cliente:** La integración de TanStack Query / React Query y hooks con control de frescura (`staleTime: 5 min`) evita peticiones duplicadas de API durante la navegación interna del operador.

#### Pauta 3.1 — Network Data Transfer & Optimization (Minimización y Eficiencia de Transferencia de Red)
Esta directriz exige minimizar el volumen bruto de bytes transferidos a través de la infraestructura de telecomunicaciones mediante compresión e interoperabilidad de datos magros:
1. **Compresión HTTP de Alto Rendimiento (Brotli y Gzip):** Se implementó una estrategia dual: compresión estática previa (*precompression*) de todos los activos de producción con Brotli en nivel 11 (máxima compresión sin sobrecarga de CPU en tiempo de ejecución) y gzip nivel 9, complementada por middleware dinámico (`GZipMiddleware` en backend con umbral de 500 bytes). Esto reduce el volumen transferido en más del 74 % frente al código sin comprimir.
2. **Consultas Magras y Proyecciones Selectivas:** En el acceso a datos, se prohíbe la recuperación indiscriminada de registros y atributos completos. En entornos MongoDB se exige `.select()` y `.lean()` para omitir hidratación Mongoose; en el backend SQLAlchemy/PostgreSQL se aplican proyecciones explícitas de columnas (`select=...`), disminuyendo la memoria consumida y el tamaño de la respuesta serializada.
3. **Paginación Estricta a 12 Registros:** Todos los endpoints de consulta masiva implementan parámetros `skip` y `limit` fijados en 12 registros por página, acompañados de la cabecera `X-Total-Count`. Se previene la sobrecarga de ancho de banda y la saturación del cliente móvil ante colecciones de miles de despachos.

### 4.3 Reglas Derivadas de las WSG para el Ciclo de Vida del Software

1. **Activos:** Toda imagen se publica obligatoriamente en AVIF y WebP con reserva PNG; nunca se sube un PNG o JPEG mayor a 200 KB sin justificación técnica y autorización.
2. **Red:** Toda respuesta de texto se comprime con Brotli o gzip; el HTML se revalida condicionalmente y los activos con hash se cachean de forma inmutable.
3. **UX:** La primera pantalla no depende de recursos externos; el contenido crítico se dibuja con CSS en línea.
4. **Arquitectura:** Las rutas secundarias se cargan bajo demanda; los mapas y gráficos pesados no viajan en el paquete inicial.
5. **Peticiones:** Los iconos y pictogramas se entregan como SVG en línea; el favicon es un data URI sin peticiones adicionales.

---

## 5. Modelo SWDM v4 y métrica SCI

### 5.1 Fórmula

El modelo simplificado de la rúbrica es:

```text
E    = ancho_de_banda (GB) × 0.815 kWh/GB
CO₂e = E × 442 g CO₂e/kWh
```

El modelo segmentado SWDM v4 separa la energía operativa de la incorporada:

```text
E_operativa   = GB × (0.055 + 0.059 + 0.080) = GB × 0.194 kWh
E_incorporada = GB × (0.012 + 0.013 + 0.081) = GB × 0.106 kWh
E_total       = GB × 0.300 kWh
CO₂e          = E_operativa × I_red + E_incorporada × I_red
```

Donde `I_red` es la intensidad de carbono de la red eléctrica en g CO₂e/kWh.

### 5.2 Parámetros

| Parámetro | Valor | Fuente |
|---|---:|---|
| Energía operativa por GB | 0.194 kWh | SWDM v4 |
| Energía incorporada por GB | 0.106 kWh | SWDM v4 |
| Intensidad de red mundial | 494 g CO₂e/kWh | Ember / valor por defecto de SWDM v4 |
| Intensidad de red Perú (referencia) | 280 g CO₂e/kWh | Estimación conservadora; validar con MINEM/COES |
| Visitas nuevas | 25 % | SWDM v4 |
| Visitas recurrentes | 75 % | SWDM v4 |
| Ratio de caché | 2 % | SWDM v4 |
| Factor promedio por visita | 0.265 | 0.25 + 0.75 × 0.02 |

### 5.3 Métrica SCI

La métrica SCI se expresa como carbono por unidad funcional:

```text
SCI = carbono_total / unidad_funcional
```

En este proyecto la unidad funcional es una visita a la pantalla de inicio de sesión. El resultado se documenta en `evidencias/calculo-swdm-v4.md` y en `evidencias/swdm-v4.json`. La SCI permite comparar versiones sin depender del número absoluto de visitas: una versión es mejor si emite menos por visita, aunque el tráfico crezca.

### 5.4 Regla de reporte

Toda cifra de carbono debe publicarse con:

1. La fórmula utilizada.
2. Los coeficientes y su fuente.
3. El peso medido y la herramienta de medición.
4. El escenario de visitas.
5. El análisis de sensibilidad.
6. El archivo de evidencia en formato máquina.

Una cifra sin estos seis elementos no se considera evidencia válida.

---

## 6. Reglas de clean code y arquitectura verde (SOLID, DRY, YAGNI)

### 6.1 Fundamentos de Código Limpio y Software Verde

El código limpio no es únicamente una disciplina estética de legibilidad; en el contexto de **Green IT**, la claridad arquitectónica se traduce en menor consumo de ciclos de reloj de CPU, menor retención de memoria RAM y menor huella de carbono digital:
1. **Legibilidad y Comprensión Rápida:** Funciones cortas con nombres inequívocos reducen el tiempo cognitivo del desarrollador y previenen refactorizaciones accidentales que introducen ineficiencias computacionales.
2. **Minimización de Ciclos Inútiles:** Cada instrucción de código que se ejecuta en el backend o en el navegador del cliente consume energía eléctrica. Eliminar bucles redundantes, transformaciones intermedias costosas y re-renderizados innecesarios preserva la batería del dispositivo y reduce la carga en servidores.
3. **Cero Dependencias Fantasma:** Cada kilobyte de una biblioteca externa no aprovechada viaja por la red e incrementa el tiempo de evaluación y parseo del motor V8/SpiderMonkey.

---

### 6.2 Aplicación Rigurosa de Principios SOLID en Backend y Frontend

#### 1. Principio de Responsabilidad Única (Single Responsibility Principle - SRP)
- **Backend:** Separación tajante entre capas. Los routers (`endpoints/`) son exclusivamente adaptadores HTTP encargados de parsear la solicitud, validar cabeceras y retornar códigos de estado REST. La lógica de negocio reside íntegramente en los servicios (`services/`, e.g., `UserService`, `RoutingService`), mientras que el acceso y persistencia se delega a los modelos y repositorios. Ningún controlador ejecuta consultas SQL/NoSQL directas.
- **Frontend:** Desacoplamiento estricto de responsabilidades. Las vistas (`pages/`) componen la pantalla; la lógica de estado y paginación se aísla en hooks dedicados (`usePagination.ts`); la comunicación de red reside en módulos de transporte independientes (`api.ts`); y la presentación se delega a componentes atómicos y reutilizables (`Pagination.tsx`, `Header.tsx`).

#### 2. Principio de Abierto/Cerrado (Open/Closed Principle - OCP)
- **Backend:** Los servicios y middlewares se estructuran de modo que se puedan extender comportamientos (como nuevos algoritmos de compresión o esquemas de logging estructurado) sin modificar el código nuclear ya probado y auditado.
- **Frontend:** Componentes como `<Pagination />` o `<PictureImage />` reciben configuraciones mediante propiedades tipadas (`props`), permitiendo adaptar la presentación o eventos sin alterar su implementación base.

#### 3. Principio de Sustitución de Liskov (Liskov Substitution Principle - LSP)
- **Backend:** Las clases de servicio y los esquemas Pydantic / Mongoose respetan contratos estrictos de tipo. Las subclases o adaptadores de base de datos pueden sustituirse sin alterar la semántica esperada por los controladores o clientes de la API.
- **Frontend:** Los componentes de interfaz cumplen estrictamente con los contratos de las interfaces estándar de React (`HTMLAttributes`, eventos de clic), garantizando que un componente especializado pueda reemplazar a uno genérico sin generar fallos en tiempo de ejecución.

#### 4. Principio de Segregación de Interfaces (Interface Segregation Principle - ISP)
- **Backend:** Esquemas DTO fragmentados y específicos para cada operación (`UsuarioCreate`, `UsuarioUpdate`, `UsuarioResponse`). En lecturas masivas, el esquema de respuesta solo expone los atributos estrictamente requeridos por la vista del cliente, evitando transferir campos pesados (hashes, historiales de auditoría) mediante proyecciones magras (`.select()` en MongoDB o selección de columnas en SQL).
- **Frontend:** Interfaces TypeScript discretas y enfocadas. Un componente de paginación solo requiere `currentPage`, `totalPages`, `onPageChange` e `isFetching`, en lugar de acoplarse al objeto de dominio completo de la entidad listada.

#### 5. Principio de Inversión de Dependencias (Dependency Inversion Principle - DIP)
- **Backend:** Inyección de dependencias a través de las primitivas de FastAPI (`Depends(get_db)`) o contenedores Express. Los servicios de negocio dependen de abstracciones de sesión y repositorios, facilitando la ejecución de 153 pruebas unitarias aisladas con bases de datos en memoria sin acoplamiento a infraestructura externa.
- **Frontend:** Los componentes de presentación no instancian directamente clientes HTTP globales; reciben métodos o consumen servicios abstractos inyectados, facilitando el mocking riguroso en pruebas con Vitest y Testing Library.

---

### 6.3 Principios DRY (Don't Repeat Yourself) y YAGNI (You Aren't Gonna Need It)

#### DRY (No te repitas)
- **Backend:** Centralización de la lógica de paginación (`skip`, `limit`, `X-Total-Count`), middlewares globales de compresión (`GZipMiddleware`) y validación de esquemas comunes. Un único punto de configuración para CORS y cabeceras de seguridad.
- **Frontend:** Creación del hook unificado `usePagination<T>()` que gestiona estado de página, cálculo de límites, rebanado en memoria y sincronización con API. Reutilización del componente `<Pagination />` en todas las pantallas operativas (Vehículos, Conductores, Pedidos, Clientes, Rutas, Usuarios), evitando duplicación de lógica de interfaz.

#### YAGNI (No vas a necesitarlo)
- **Eliminación de Librerías Masivas:** Sustitución radical de dependencias externas redundantes (`moment.js`, `lodash`, `axios`) por las capacidades ya integradas en los estándares web modernos (`Intl.DateTimeFormat`, `Set`, `structuredClone`, `fetch` nativo con `AbortController`). Esto evitó cargar más de 300 KB de código superfluo en el navegador.
- **Proyecciones y Consultas Magras:** No se traen campos ni relaciones de base de datos que la interfaz de usuario no requiera en el pliegue activo. En lecturas no se instancian grafos de objetos completos ni hidratación Mongoose, operando estrictamente sobre datos serializados ligeros.
- **Arquitectura de Software Proporcionada:** No se sobreingeniaron capas de microservicios distribuidos ni brokers de mensajería complejos para una carga que se atiende con máxima eficiencia energética en una arquitectura monolítica modular optimizada.

---

### 6.4 Reglas Normativas para Backend (MERN & EcoLogística)

| # | Regla MERN (Node/Express/MongoDB) | Equivalente en EcoLogística | Principio | Verificación |
|---|---|---|---|---|
| 1 | Prohibido `Model.find()` sin `.select()` | Prohibido `SELECT *`; proyecciones explícitas y `response_model` | ISP / YAGNI | Revisión de código y esquemas |
| 2 | `.lean()` obligatorio en todas las lecturas | Omitir hidratación ORM pesada; usar diccionarios planos o proyecciones | Green / Clean | Inspección de memoria en consultas |
| 3 | Middleware de compresión Brotli/gzip | `GZipMiddleware` y precompresión en el servidor estático | Pauta 3.1 WSG | Cabecera `Content-Encoding` |
| 4 | Paginación estricta de 12 registros | Parámetros `skip` y `limit=12` con cabecera `X-Total-Count` | Eficiencia Capacidad | Prueba funcional de endpoint |
| 5 | Índices compuestos en campos de filtro | Índices B-Tree en `init.sql` y migraciones | Eficiencia Recursos | `EXPLAIN (ANALYZE, BUFFERS)` |
| 6 | Validación tipada de entrada | Esquemas Pydantic / DTOs en todos los endpoints | Robustez / SRP | Pruebas de contrato y validación |
| 7 | Manejo centralizado de excepciones | `HTTPException` con códigos semánticos (200, 201, 400, 404, 409) | Analizabilidad | Pruebas de error controladas |
| 8 | Cero secretos en código fuente | Variables de entorno tipadas y archivo `.env.example` | Seguridad / OWASP | Escaneo de secretos en CI |
| 9 | Trazabilidad sin exposición de PII | Logs estructurados sin contraseñas ni datos sensibles | Privacidad | Auditoría de archivos de log |
| 10 | Cobertura en servicios de negocio | Pruebas unitarias de integración | Testabilidad | Suite de pruebas automatizadas |

---

### 6.5 Reglas Normativas para Frontend (React / TypeScript / Vite)

| # | Regla Normativa | Fundamento de Sostenibilidad | Verificación |
|---|---|---|---|
| 1 | Prohibido publicar PNG/JPG > 200 KB sin compresión AVIF/WebP | Pauta 1.2 WSG / Eficiencia de Carbono | Pipeline `sharp` y revisión de carpeta `public/` |
| 2 | `loading="lazy"` y `decoding="async"` en imágenes fuera del viewport | Desahogo del hilo principal de CPU | Inspección de componentes JSX |
| 3 | Atributos `width` y `height` explícitos en toda etiqueta de imagen | Erradicación de CLS (CLS ≤ 0.02) | Auditoría Lighthouse de maquetación |
| 4 | Rutas secundarias diferidas con `React.lazy()` y `Suspense` | Pauta 2.4 WSG / Modularidad ISO 25010 | Análisis de chunks en reporte Vite |
| 5 | Auditoría en Bundlephobia obligatoria antes de agregar cualquier paquete | Principio YAGNI / Presupuesto de peso | Aprobación en Pull Request |
| 6 | Prohibido importar fuentes web externas (Google Fonts, Adobe Fonts) | Eliminación de peticiones de bloqueo y DNS | Pila tipográfica del sistema en CSS |
| 7 | CSS crítico en línea en `index.html`; sin hojas que bloqueen FCP | FCP ≤ 1.0 s / Comportamiento temporal | Inspección de encabezado HTML |
| 8 | Iconos SVG en línea o empaquetados mediante tree-shaking | Pauta 3.2 WSG / Reducción de peticiones | Chunks de producción |
| 9 | Identificadores estables (`key`) en iteraciones de lista | Rendimiento del algoritmo de reconciliación React | Auditoría de código JSX |
| 10 | Accesibilidad y contraste WCAG 2.1 AA | Inclusión digital y diseño universal | Lighthouse Accesibilidad ≥ 90 |
| 11 | Pruebas de componentes con Testing Library | Capacidad de prueba ISO 25010 | 153 pruebas unitarias aprobadas |
| 12 | Cero uso de `any` en interfaces públicas y contratos de datos | Analizabilidad y tipado fuerte | `tsc --noEmit` en compilación |

---

### 6.6 Contratos de API, Datos y Control de Versiones

1. Los nombres de atributos siguen `snake_case` tanto en base de datos como en respuestas JSON para consistencia interoperable.
2. Las marcas de tiempo se formatean estrictamente bajo ISO 8601 con zona horaria UTC explícita.
3. Los identificadores primarios son cadenas UUID v4 no predecibles.
4. Las respuestas de listado masivo deben proveer `X-Total-Count` para que la UI renderice la navegación paginada sin consultar endpoints adicionales.
5. Los documentos técnicos llevan la versión semántica en el nombre de archivo (`V_1_0_0`).
6. Los mensajes de commit se adhieren al estándar *Conventional Commits* (`feat:`, `fix:`, `perf:`, `docs:`, `test:`, `chore:`).

---

## 7. Matriz de mapeo de las ocho optimizaciones

### 7.1 Matriz principal

| # | Optimización Técnica MERN / Stack Full-Stack | Estándar ISO/IEC 25010 | Principio Green Software (GSF) | Lineamiento W3C WSG 1.0 |
|---|---|---|---|---|
| 1 | **1. Consultas magras `.select()` / `.lean()` e índices:** Proyecciones selectivas y B-Tree composite indexes | Eficiencia — Utilización de recursos | Eficiencia de hardware / cómputo | Pauta 3.1 Network Data Transfer |
| 2 | **2. Paginación backend/frontend de 12 registros:** `limit=12`, `skip`, `X-Total-Count`, `usePagination` y `<Pagination />` | Eficiencia — Capacidad | Eficiencia energética | Pauta 2.1 UX Efficiency / 3.1 Data Transfer |
| 3 | **3. Imágenes WebP/AVIF adaptativas con `<picture>`:** `srcset`, dimensiones fijas y `loading="lazy"` | Eficiencia — Comportamiento temporal | Eficiencia de carbono | Pauta 1.2 Media Optimization |
| 4 | **4. `React.lazy` / `Suspense` para code splitting:** Rutas diferidas y chunks desacoplados de Leaflet | Mantenibilidad — Modularidad | Eficiencia de hardware | Pauta 2.4 Code Architecture |
| 5 | **5. Sustitución de librerías por APIs nativas:** `Intl`, `Set`, `structuredClone`, `fetch` nativo sin `moment`/`lodash`/`axios` | Mantenibilidad — Analizabilidad | Eficiencia energética | Pauta 2.2 Clean Code & Libraries |
| 6 | **6. Inlining de SVGs, data-URI favicon y CSS crítico:** Cero peticiones bloqueantes en carga inicial | Eficiencia — Comportamiento temporal | Eficiencia de carbono | Pauta 3.2 HTTP Requests Minimization |
| 7 | **7. Cabeceras `Cache-Control`, `ETag` (304) y React Query:** Inmutabilidad a 1 año, validación condicional y TanStack Query | Eficiencia — Comportamiento temporal | Eficiencia energética | Pauta 2.4 Caching Strategies |
| 8 | **8. Compresión Brotli / Gzip:** Precompresión estática (Brotli 11, Gzip 9) y `GZipMiddleware` dinámico | Eficiencia — Capacidad | Eficiencia de carbono | Pauta 3.1 Network Optimization |

### 7.2 Trazabilidad ampliada

| # | Regla de ingeniería | Evidencia | Responsable | Umbral |
|---|---|---|---|---|
| 1 | Proyecciones e índices en filtros frecuentes | Migración 002, `EXPLAIN` | Backend | `Index Scan` |
| 2 | Listados acotados a 12 filas | `X-Total-Count`, `usePagination` | Backend + Frontend | 12 filas |
| 3 | AVIF/WebP con reserva PNG | `isotipo-*.avif`, `isotipo-*.webp` | Frontend | ≤ 200 KB por imagen |
| 4 | Rutas secundarias diferidas | `App.tsx`, chunks de Vite | Frontend | 0 vistas pesadas en el paquete inicial |
| 5 | Sin dependencias prescindibles | `package.json`, `api.ts` | Frontend | 0 dependencias de transporte |
| 6 | Sin peticiones externas en la carga inicial | `index.html`, informe LH | Frontend | 0 dominios de terceros |
| 7 | Caché inmutable y revalidación | `server.mjs`, middleware | Frontend + Backend | 304 en segunda visita |
| 8 | Compresión de respuestas | `main.py`, `precompression.mjs` | Backend + Frontend | Brotli ≥ 60 % de ahorro |

### 7.3 Lectura de la matriz

La matriz no es decorativa. Cada fila conecta una decisión de código con un atributo de calidad, un principio de sostenibilidad y una pauta web. Si una optimización no puede ubicarse en una fila, probablemente no esté justificada. Si una fila no tiene evidencia, la optimización no está terminada.

---

## 8. Pipeline de integración continua verde

### 8.1 Objetivo

El flujo `.github/workflows/green-audit.yml` impide que una regresión de rendimiento llegue a `main`. Se ejecuta en cada Pull Request que modifique el frontend y de forma manual. No publica datos en servicios externos: guarda los informes como artefacto del repositorio.

### 8.2 Etapas

| Etapa | Acción | Resultado |
|---|---|---|
| 1 | `actions/checkout@v4` | Código disponible |
| 2 | `actions/setup-node@v4` con caché npm | Node 20 y dependencias cacheadas |
| 3 | `npm ci --ignore-scripts` | Instalación reproducible |
| 4 | `npm run build` | TypeScript, Vite y precompresión |
| 5 | Tabla de pesos en el resumen | Visibilidad del artefacto |
| 6 | `npm test` | 153 pruebas |
| 7 | LHCI escritorio | Presupuesto estricto |
| 8 | LHCI móvil | Complemento con avisos |
| 9 | Resumen de métricas | Tabla en el resumen del job |
| 10 | Artefacto `.lighthouseci` | Evidencia durante 14 días |

### 8.3 Presupuesto de rendimiento

| Métrica | Umbral escritorio | Nivel | Umbral móvil | Nivel |
|---|---:|---|---:|---|
| Rendimiento | ≥ 0.90 | error | ≥ 0.90 | error |
| Accesibilidad | ≥ 0.90 | error | ≥ 0.90 | error |
| Buenas prácticas | ≥ 0.90 | warn | ≥ 0.90 | warn |
| FCP | ≤ 1 000 ms | error | ≤ 2 000 ms | warn |
| LCP | ≤ 1 400 ms | error | ≤ 2 500 ms | warn |
| TBT | ≤ 85 ms | error | ≤ 200 ms | warn |
| CLS | ≤ 0.02 | error | ≤ 0.05 | warn |
| Peso | ≤ 1 153 434 B | error | ≤ 1 153 434 B | error |

### 8.4 Extracto funcional del workflow

```yaml
name: Green IT (auditoría de rendimiento)

on:
  pull_request:
    branches: [main]
    paths:
      - "src/frontend/**"
      - ".github/workflows/green-audit.yml"
  workflow_dispatch:

jobs:
  lighthouse:
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: src/frontend
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
          cache-dependency-path: src/frontend/package-lock.json
      - run: npm ci --ignore-scripts
      - run: npm run build
      - run: npm test
      - run: npx --yes @lhci/cli@0.15.1 autorun --config=lighthouserc.json
      - run: npx --yes @lhci/cli@0.15.1 autorun --config=lighthouserc.movil.json
```

### 8.5 Política de fallos

1. Si falla el build, el PR se bloquea.
2. Si falla una prueba, el PR se bloquea.
3. Si el presupuesto de escritorio se excede, el PR se bloquea.
4. Si el presupuesto móvil se excede en rendimiento o accesibilidad, el PR se bloquea.
5. Si el presupuesto móvil se excede solo en FCP o LCP, el PR se marca con advertencia y requiere revisión del responsable de frontend.

### 8.6 Ejecución local

```bash
cd src/frontend
npm ci
npm run build
npm test
npx --yes @lhci/cli@0.15.1 autorun --config=lighthouserc.json
npx --yes @lhci/cli@0.15.1 autorun --config=lighthouserc.movil.json
```

---

## 9. Gobernanza y definición de terminado

### 9.1 Roles

| Rol | Responsabilidad |
|---|---|
| Product Manager | Prioriza las optimizaciones y valida el impacto en el usuario |
| Tech Lead | Aprueba el diseño técnico y la matriz de trazabilidad |
| Backend | Consultas, índices, paginación, middleware y pruebas |
| Frontend | Componentes, lazy loading, imágenes, caché y accesibilidad |
| QA | Ejecuta la auditoría, conserva evidencias y verifica umbrales |
| DevOps | Mantiene el workflow, los artefactos y la reproducibilidad |

### 9.2 Definición de terminado verde

Una tarea se considera terminada cuando cumple los siguientes siete criterios:

1. **Medición:** existe una medición ANTES y DESPUÉS con la misma herramienta.
2. **Umbral:** el resultado cumple el presupuesto de la sección 8.3.
3. **Prueba:** una prueba automatizada protege el comportamiento.
4. **Evidencia:** el informe o el JSON se guarda en `evidencias/`.
5. **Documentación:** la decisión se explica en el informe 01 o en este documento.
6. **Revisión:** otro integrante revisó el cambio.
7. **Reproducibilidad:** el comando para repetir la medición está documentado.

### 9.3 Lista de revisión para Pull Requests

- [ ] ¿El cambio reduce o mantiene el peso del paquete inicial?
- [ ] ¿Se añadió una dependencia? ¿Se justificó con Bundlephobia?
- [ ] ¿La nueva vista usa `React.lazy`?
- [ ] ¿Las imágenes tienen AVIF/WebP, `width`, `height` y `alt`?
- [ ] ¿Los listados tienen `limit` y `X-Total-Count`?
- [ ] ¿La consulta nueva usa un índice o justifica su ausencia?
- [ ] ¿La respuesta JSON se comprime?
- [ ] ¿La segunda visita devuelve 304?
- [ ] ¿Las pruebas pasan?
- [ ] ¿El presupuesto de Lighthouse se cumple?
- [ ] ¿La documentación y la versión se actualizaron?

### 9.4 Revisión de código

La revisión se concentra en cuatro preguntas:

1. **Corrección:** ¿el cambio hace lo que dice?
2. **Costo:** ¿cuántos bytes, consultas o peticiones añade?
3. **Claridad:** ¿otro integrante puede entenderlo sin explicación oral?
4. **Evidencia:** ¿cómo sabremos que funciona y que no regresó?

---

## 10. Versionado semántico

### 10.1 Esquema

El proyecto adopta SemVer 2.0.0:

```text
MAJOR.MINOR.PATCH
```

| Componente | Se incrementa cuando |
|---|---|
| MAJOR | Hay un cambio incompatible en la API o en el contrato de datos |
| MINOR | Se añade funcionalidad compatible |
| PATCH | Se corrige un defecto compatible |

### 10.2 Versión de esta entrega

La versión documental es **1.0.0**, conforme a la rúbrica:

```text
01 Informe de reduccion del impacto ambiental V_1_0_0.md
02 Estandares Ingeniería de software V_1_0_0.md
```

El repositorio ya contenía la etiqueta `v1.0.0` en el commit `921ba5b`. Para no reescribir historia publicada, la entrega de código se etiqueta como **v1.1.0** (cambio compatible: optimizaciones, documentación y CI) y se conserva la versión 1.0.0 en el nombre de los documentos. Si el equipo decide unificar ambas versiones, debe moverse la etiqueta de forma coordinada y comunicarlo en el `CHANGELOG`.

### 10.3 Registro de cambios

Toda entrega debe actualizar `CHANGELOG.md` con:

1. Versión y fecha.
2. Cambios añadidos, modificados y eliminados.
3. Impacto medido en peso y rendimiento.
4. Enlaces a las evidencias.

### 10.4 Etiquetas

```bash
# Etiqueta anotada de la entrega
git tag -a v1.1.0 -m "perf(green-it): optimizacion de rendimiento y documentacion"
git push origin v1.1.0
```

---

## 11. Evidencias y trazabilidad

### 11.1 Repositorio de evidencias

```text
docs/03 Implementación/reduccion del impacto ambiental/
├── 01 Informe de reduccion del impacto ambiental V_1_0_0.md
├── 02 Estandares Ingeniería de software V_1_0_0.md
└── evidencias/
    ├── calculo-swdm-v4.md
    ├── swdm-v4.json
    └── lighthouse/
        ├── lh-escritorio-antes.json
        ├── lh-escritorio-despues.json
        ├── lh-movil-antes.json
        ├── lh-movil-despues.json
        └── resumen-lighthouse.json
```

### 11.2 Correspondencia norma → regla → evidencia

| Norma | Regla | Evidencia |
|---|---|---|
| ISO/IEC 25010 — Eficiencia | Peso ≤ 1.1 MB | `resumen-lighthouse.json` |
| ISO/IEC 25010 — Mantenibilidad | Rutas diferidas | Chunks de Vite y `App.tsx` |
| GSF — Eficiencia de carbono | Menos bytes por visita | `calculo-swdm-v4.md` |
| GSF — Eficiencia energética | Menos CPU inicial | Peso del paquete inicial |
| GSF — Conciencia de carbono | Intensidad de red declarada | Análisis de sensibilidad |
| GSF — Eficiencia de hardware | Funciona en gama media | Lighthouse móvil |
| WSG 1.0 — Activos | AVIF/WebP | `public/brand/` |
| WSG 1.0 — Red | Brotli/gzip | `precompression-report.json` |
| WSG 1.0 — Arquitectura | Caché inmutable | Cabeceras de `server.mjs` |
| SWDM v4 | Cálculo reproducible | `scripts/calcular_huella_swdm.py` |

### 11.3 Conservación

1. Los informes de Lighthouse se conservan como artefacto de CI durante 14 días.
2. Los informes consolidados se versionan en el repositorio.
3. Los JSON crudos se conservan para auditoría externa.
4. Las capturas de pantalla se guardan en `evidencias/capturas/` cuando aporten información que el JSON no contiene.

---

## 12. Conclusiones

1. El proyecto cuenta con un marco normativo completo y trazable, no con una lista de buenas intenciones.
2. Las ocho optimizaciones se mapean con ISO/IEC 25010, los cuatro principios de GSF y las WSG 1.0.
3. Las reglas de clean code se adaptaron al stack real sin perder el espíritu de la rúbrica MERN.
4. El pipeline de CI convierte el presupuesto de rendimiento en una barrera objetiva.
5. La definición de terminado verde exige medición, prueba, evidencia y revisión.
6. El versionado semántico y el registro de cambios permiten comparar entregas y auditar su evolución.
7. La documentación deja explícitos los límites: el backend y la app móvil requieren su propia medición.

El marco queda operativo. La siguiente iteración debe extenderlo al backend con CodeCarbon y a la aplicación Flutter con DevTools, manteniendo la misma disciplina de evidencia.

---

## 13. Referencias

1. ISO/IEC 25010:2011. *Systems and software engineering — Systems and software Quality Requirements and Evaluation (SQuaRE) — System and software quality models*.
2. Green Software Foundation. *Green Software Practitioner*. https://greensoftware.foundation
3. Green Software Foundation. *Software Carbon Intensity (SCI) Specification*. https://sci.greensoftware.foundation
4. W3C. *Web Sustainability Guidelines (WSG) 1.0*. https://www.w3.org/TR/wsg/
5. Sustainable Web Design. *Sustainable Web Design Model v4*. https://sustainablewebdesign.org
6. SemVer. *Semantic Versioning 2.0.0*. https://semver.org
7. Google. *Lighthouse CI*. https://github.com/GoogleChrome/lighthouse-ci
8. Google. *Web Vitals*. https://web.dev/vitals/
9. Ember. *Global Electricity Review*. https://ember-climate.org
10. Ministerio del Ambiente del Perú. *Inventario Nacional de Gases de Efecto Invernadero*.
11. MDN Web Docs. *HTTP caching*, *ETag*, *Content-Encoding*.
12. OWASP. *Top 10*. https://owasp.org/www-project-top-ten/

---

## Anexo A. Secuencia Git de despliegue documental

La secuencia reproduce la guía de la rúbrica y crea la estructura exacta de carpetas:

```bash
# 1. Verificar el estado actual del repositorio
git status

# 2. Crear las carpetas de destino en la ruta exacta
mkdir -p "docs/03 Implementación/reduccion del impacto ambiental"

# 3. Guardar los dos archivos Markdown en la ruta corregida:
#    - docs/03 Implementación/reduccion del impacto ambiental/01 Informe de reduccion del impacto ambiental V_1_0_0.md
#    - docs/03 Implementación/reduccion del impacto ambiental/02 Estandares Ingeniería de software V_1_0_0.md

# 4. Añadir las carpetas y documentos al staging
git add "docs/03 Implementación/reduccion del impacto ambiental/"

# 5. Registrar el commit formalizando la documentación
git commit -m "docs(green-it): add MERN performance optimization reports and software engineering standards"

# 6. Sincronizar los cambios con el repositorio remoto
git push origin main
```

En Windows PowerShell, el equivalente de `mkdir -p` es:

```powershell
New-Item -ItemType Directory -Force -Path "docs/03 Implementación/reduccion del impacto ambiental"
```

---

## Anexo B. Glosario

| Término | Definición |
|---|---|
| AVIF | Formato de imagen basado en AV1, con alta compresión y calidad |
| Brotli | Algoritmo de compresión sin pérdida, eficiente para texto web |
| CLS | Cumulative Layout Shift; mide los saltos de maquetación |
| Code splitting | División del código en fragmentos que se cargan bajo demanda |
| ETag | Identificador de versión de un recurso para validación condicional |
| FCP | First Contentful Paint; primer contenido dibujado |
| GSF | Green Software Foundation |
| LCP | Largest Contentful Paint; elemento principal dibujado |
| LHCI | Lighthouse CI |
| MERN | MongoDB, Express, React, Node.js |
| SCI | Software Carbon Intensity |
| SWDM | Sustainable Web Design Model |
| TBT | Total Blocking Time; tiempo de bloqueo del hilo principal |
| Tree-shaking | Eliminación de código no utilizado durante el empaquetado |
| WSG | Web Sustainability Guidelines |

[← Volver al README Principal](../../README.md)
