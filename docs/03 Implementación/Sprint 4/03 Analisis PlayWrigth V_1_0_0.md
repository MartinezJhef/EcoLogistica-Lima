[← Volver al README principal](../../README.md)

# 01. Analisis PlayWrigth V_1_0_0

---

## 1. Información del documento

| Campo | Detalle |
| :--- | :--- |
| **Nombre del Proyecto** | EcoLogistica-Lima: Plataforma Web y Móvil para la Gestión y Optimización de Logística Verde Urbana |
| **Código del Proyecto** | PFA-ECOLIMA-2026 |
| **Integrantes del Equipo** | • Zayuri Cerron Medina <br>• Jheferson Martinez Valerio <br>• Angela Rojas Quispe <br>• Maylit Mendoza Alarcon <br>• Diego Angulo Gonzales |
| **Responsable del Documento** | Diego Angulo Gonzales |
| **Fecha de Elaboración** | 19 de noviembre de 2026 |
| **Versión** | 1.0.0 |

--- 

<br><br>

# Análisis Playwright del Sprint 4

## Entorno y ejecución

18/11/2026, Windows, API FastAPI local, PostgreSQL 16 con PostGIS, trabajador de reportes y React. Base nueva aislada con cuentas de prueba y métricas conocidas: ruta completada de 100 km, 45 kg CO₂ y costo estimado PEN 200. No se utilizaron cuentas ni datos operativos de clientes.

`scripts/sprint4_e2e.py` ejecuta recorridos HTTP/UI, captura trazas, PDF, imágenes y métricas en `playwright-report/`. La configuración oficial TypeScript está en `src/frontend/playwright.config.ts`; casos en `src/frontend/e2e/sprint4.spec.ts`, ejecutables con `npx playwright test`. Los artefactos se excluyen de Git y se conservan mediante `tests.yml`.

## Casos y resultados

Suite integral Python: **12/12 recorridos aprobados**, cuatro roles × Chromium, Firefox y WebKit. Casos: login, filtros, indicadores esperados, solicitud de PDF, procesamiento del trabajo nuevo, descarga autenticada, distribución al 100 %, rechazo de 90 %, desconexión y recuperación, consulta restringida a oficina/administración y HTTP 403 para cliente/repartidor.

Suite TypeScript con `playwright.config.ts`: **12/12 aprobados en 28,6 segundos**, verificando login, indicadores, compensación y permisos en los tres navegadores. Su reporte HTML oficial complementa el informe integral.

Primera ejecución: 10/12; Firefox necesitó esperar el límite de red de 10 segundos para mostrar el error. Se corrigió la espera del test a 15 segundos y se repitió: 12/12. No se cambió la aplicación para ocultar el fallo.

## Rendimiento medido

Resultados locales del recorrido integral; no son mediciones del hosting público. Los tiempos de API incluyen autenticación y solicitudes de generación, no el tiempo completo de la cola PDF.

| Navegador | API mediana ms | API máximo ms | TTFB min–max ms | FCP min–max ms | LCP min–max ms |
|---|---:|---:|---:|---:|---:|
| Chromium | 12,97 | 376,38 | 3,2–4,1 | 36–64 | 36–64 |
| Firefox | 13,60 | 516,56 | 3–5 | 30–161 | 30–161 |
| WebKit | 11,82 | 375,72 | 2–4 | 24–36 | 24–36 |

Una petición Firefox supera el objetivo de 500 ms. No se declara que todas las respuestas cumplan ese umbral. El JSON conserva cada muestra y los detalles de navegación; FCP/LCP corresponden a la navegación inicial, no a un indicador de rendimiento continuo de todas las pantallas.

## Disponibilidad y resiliencia

Se verificaron HTTP 200/202 en consultas y solicitudes válidas, 422 por distribución inválida y 403 por permisos. La desconexión conserva el último resultado y muestra error; al recuperar red se puede actualizar. El trabajador guarda PDF y estado en PostgreSQL; sus fallos tienen reintento. Los tests del servidor comprueban descarga privada, falta de datos, reportes multipágina e históricos.

Se observó disponibilidad durante la ejecución local. El hosting público en Render está operativo. Ocho comprobaciones públicas de disponibilidad, CORS y restricciones sin sesión aprobaron el 19/11/2026; cinco comprobaciones autenticadas aprobaron después de activar el administrador. Estas observaciones puntuales no equivalen a uptime mensual. La aceptación publicada detectó y motivó la corrección UTC/Lima del PR #14.

## Evidencias y reproducción

1. Aplicar las migraciones 006/007 a una base desechable; usar `scripts/seed_sprint4_e2e.py` con `E2E_DISPOSABLE_DATABASE=1` y `E2E_PASSWORD` privada.
2. Iniciar API, `report_worker.py` y web.
3. Ejecutar `python scripts/sprint4_e2e.py` y, desde frontend, `npx playwright test`.
4. Revisar `playwright-report/index.html`, `results.json`, capturas por rol, PDF y trazas. El segundo reporte HTML se guarda en `src/frontend/playwright-report/`.

V_1_0_0 — 18/11/2026.

[← Volver al README principal](../../../README.md)

20/11/2026: PR #14 con todas las verificaciones de GitHub aprobadas: backend, frontend, móvil, compilación, aceptación Playwright y despliegue desechable. La ejecución local de servidor fue 92 aprobadas y una prueba PostGIS reservada a CI.
