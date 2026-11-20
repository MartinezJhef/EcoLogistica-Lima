[← Volver al README principal](../../README.md)

# 01. Revisión del Sprint V_1_0_0

---

## 1. Información del documento

| Campo | Detalle |
| :--- | :--- |
| **Nombre del Proyecto** | EcoLogistica-Lima: Plataforma Web y Móvil para la Gestión y Optimización de Logística Verde Urbana |
| **Código del Proyecto** | PFA-ECOLIMA-2026 |
| **Integrantes del Equipo** | • Zayuri Cerron Medina <br>• Jheferson Martinez Valerio <br>• Angela Rojas Quispe <br>• Maylit Mendoza Alarcon <br>• Diego Angulo Gonzales |
| **Responsable del Documento** | Zayuri Cerron Medina |
| **Fecha de Elaboración** | 19 de noviembre de 2026 |
| **Versión** | 1.0.0 |

---
<br><br>

## Historias de Usuario completadas en este Sprint

Incremento implementado y probado en la [rama de Sprint 4](https://github.com/MartinezJhef/EcoLogistica-Lima/tree/prep/sprint-4), disponible para revisión en el [PR #13](https://github.com/MartinezJhef/EcoLogistica-Lima/pull/13). La [web compartida](https://ecologistica-web.onrender.com) está publicada desde el 19/11/2026. El administrador fue activado y se verificaron login, analítica, configuración, reportes y usuarios. La aceptación completa del recorrido publicado detectó una diferencia de fecha UTC/Lima; su corrección y la del registro de entrega con foto tienen pruebas de regresión. Las historias cuentan con implementación y validaciones técnicas documentadas. Sin embargo, su cierre integral queda sujeto a completar las verificaciones pendientes del entorno publicado y las actividades de aceptación con los participantes, según corresponda a la Definition of Done del proyecto.

| Historia | Criterios de aceptación verificados | Evidencia y trazabilidad |
| :--- | :--- | :--- |
| US-008 — Dashboard | Consulta por periodos; visualización de kilómetros, consumo, energía, CO₂ y costo; comparación con periodo anterior; diferencial cero sin histórico; actualización cada 15 segundos; control de permisos. | PR #13 y pruebas de src/frontend/e2e/sprint4.spec.ts. |
| US-009 — Reportes | Generación de PDF; persistencia y recuperación de trabajos; validación del periodo; descarga de reportes; reintento ante errores; generación multipágina. | PR #13 y pruebas de scripts/sprint4_e2e.py. |
| US-010 — Compensación | Configuración de factores y proyectos; cálculo de créditos y árboles; validación de distribución al 100 %; conservación de totales por redondeo; recálculo y exportación PDF. | PR #13 y pruebas de src/frontend/e2e/sprint4.spec.ts. |

Pruebas locales: 85 del servidor, 217 de la web y 12 recorridos integrales con Playwright Python en tres navegadores. Cobertura: servidor 85,18 %; web 82,77 % de líneas. La integración espacial se comprobó mediante el despliegue local PostgreSQL/PostGIS y migración 007 aplicada dos veces.

## Demostración del trabajo completado

La demostración del incremento desarrollado durante el Sprint 4 se realizó mediante pruebas automatizadas en un entorno local controlado y desechable. Este entorno estuvo compuesto por una API desarrollada con FastAPI, una base de datos PostgreSQL 16 con PostGIS, un trabajador independiente para la generación de archivos PDF y una interfaz web desarrollada con React.

Durante la demostración se verificó el funcionamiento de las principales funcionalidades implementadas, considerando los diferentes roles de usuario:

- **Administrador y personal de oficina:**
  - Consulta de indicadores de sostenibilidad y datos del dashboard.
  - Generación y descarga de reportes en formato PDF.
  - Cálculo de compensaciones ambientales.
  - Validación de porcentajes de distribución, comprobando que el sistema rechazara valores incorrectos.
- **Cliente y repartidor:**
  - Acceso a las funcionalidades correspondientes a sus respectivos perfiles.
  - Verificación de las restricciones de acceso al intentar consultar información de analítica global, obteniendo una respuesta HTTP 403 (acceso prohibido).

### Entorno y evidencias de la demostración

La demostración se ejecutó en un entorno local, no directamente en staging o producción. Para facilitar su verificación y repetición, se utilizaron pruebas automatizadas cuyos archivos y resultados se encuentran en:

- `scripts/sprint4_e2e.py`: pruebas automatizadas de los recorridos del sistema.
- `src/frontend/e2e/sprint4.spec.ts`: pruebas de extremo a extremo de la aplicación web.
- Reportes HTML generados por las ejecuciones de prueba, que permiten revisar los resultados obtenidos.

### Retroalimentación de los stakeholders

No se realizó una sesión formal de demostración con los stakeholders durante este Sprint. Por este motivo, no se registra retroalimentación ni observaciones atribuidas a participantes que no estuvieron presentes. La validación presentada corresponde a las pruebas técnicas ejecutadas por el equipo.

### Aspectos pendientes

Queda pendiente realizar una demostración formal con los stakeholders en un entorno publicado, recoger sus observaciones y registrar los acuerdos o sugerencias en el acta correspondiente. Esto permitirá complementar la validación técnica con la aceptación de los usuarios involucrados.

## Pendientes
Algunos pendientes que se tiene son los siguientes:
| Pendiente | Justificación | Tratamiento posterior |
| :--- | :--- | :--- |
| Publicación de correcciones de fecha y registro de entrega con foto. | Se realizaron correcciones y pruebas locales, pero falta completar la verificación del recorrido publicado. | Publicar los cambios y ejecutar pruebas de regresión en Render. |
| Configuración de factores y proyectos ambientales reales. | Los valores actuales son sintéticos y no representan datos definitivos. | Obtener y registrar factores, precios y proyectos con fuentes verificables. |
| Evaluación SUS y revisión con participantes. | Todavía no se cuenta con resultados de evaluación de usabilidad. | Aplicar el instrumento, consolidar resultados y documentar observaciones. |
| Medición de disponibilidad y tiempos en hosting. | Las mediciones locales no representan el rendimiento del entorno público. | Ejecutar mediciones en producción y registrar disponibilidad y tiempos de respuesta. |
| Automatización del despliegue desde main. | La primera publicación se realizó mediante Render y falta completar la automatización del workflow. | Configurar secretos y validar el proceso de despliegue. |


[← Volver al README principal](../../../README.md)
