# Preparación del Sprint 4

**Proyecto:** EcoLogística Lima.  
**Fecha de preparación:** 18 de noviembre de 2026.  
**Estado:** preparación técnica; las historias del Sprint 4 no se declaran implementadas ni cerradas.  
**Base:** commit `b60d34d19d3fa52d447108d7a1954ba1501e1db5`, publicado en el [PR #12](https://github.com/MartinezJhef/EcoLogistica-Lima/pull/12). Sus comprobaciones automáticas aprobaron; la revisión de un compañero sigue pendiente.  
**Rama de preparación:** `prep/sprint-4`, separada de la revisión del Sprint 3.

## Fuentes y alcance

- [Backlog y criterios de aceptación versionados](../../02%20Planificaci%C3%B3n/01%20Transformando%20a%20%C3%A1gil%20V_1_0_0.md): US-008, US-009 y US-010.
- Consigna aportada: `Consigna_Inspección_5_sprint_4.html`, sobre implementación, calidad, despliegue y cierre del Sprint 4.
- Inspección del código de FastAPI, PostGIS, React y Flutter sobre la revisión indicada.

La correspondencia con las claves ANA y el contenido actual del Sprint 4 de Jira debe cotejarse antes de iniciar sus tareas; esta preparación no inventa claves ni modifica Jira. El backlog versionado asigna 5, 3 y 5 puntos a las tres historias: 13 puntos funcionales, sin incluir aquí una estimación nueva del trabajo transversal de calidad.

El backlog consultado no asigna GPS en vivo ni negociación de fletes a estas historias. Las menciones anteriores a GPS en vivo como trabajo del Sprint 4 eran tentativas; no deben usarse para ampliar el alcance sin una historia y criterios confirmados.

## Punto de partida comprobado

| Disponible | Falta para el Sprint 4 |
|---|---|
| Rutas con fecha, estado, kilómetros, tiempo y CO₂; geometría e itinerarios | Agregación de indicadores y pantalla de dashboard |
| Parámetros técnicos de vehículos y consumo por combustible | Parámetros de costos y conservación de los valores usados históricamente |
| Estados de entrega y confirmación del regreso al depósito | Regla explícita para contar avance/cierre y evitar duplicados al reoptimizar |
| Autenticación y permisos comprobados en servidor | Permisos específicos de analítica, reportes y compensación |
| Pruebas de servidor, web y móvil; Lighthouse; staging Docker desechable | Playwright en tres navegadores, informes de rendimiento/disponibilidad y producción configurada |
| Documentación y evidencias del incremento hasta Sprint 3 | Review, retrospectiva, análisis Playwright y evaluación SUS reales del Sprint 4 |

No se encontraron módulos de dashboard, reportes o compensación ya implementados. Tampoco se encontró una URL/configuración verificable del proveedor de producción en los archivos revisados; ese destino debe confirmarse antes de escribir un despliegue específico.

## Orden de implementación

### 1. Datos, reglas y permisos compartidos

1. Confirmar en Jira el alcance de US-008/009/010 y las tareas transversales de la consigna.
2. Integrar el PR #12 en main después de la revisión de un compañero. Rebasar la rama del Sprint 4 sobre esa base; mantener separados ambos incrementos.
3. Definir los precios de combustible/energía y los factores ambientales con unidad, fuente, vigencia y responsable de configuración. Los valores ausentes deben mostrarse como no configurados y bloquear los cálculos que los necesitan.
4. Preparar una migración aditiva, por ejemplo `007_sprint4_analytics.sql`, y probar aplicación inicial y repetida sobre una base desechable.
5. Conservar una instantánea versionada de los parámetros utilizados por operación. Editar el precio o consumo de un vehículo no debe recalcular silenciosamente reportes históricos.
6. Diferenciar estimaciones de planificación de mediciones reales. La distancia de OSRM y los factores de consumo actuales no constituyen odómetro, GPS ni combustible medido.
7. Antes de agregar indicadores, preservar la información necesaria de tramos ya confirmados al reoptimizar. No sumar revisiones antiguas junto con la vigente ni perder tramos anteriores. No inferir kilómetros físicos de minutos transcurridos.
8. Añadir permisos de consulta de dashboard, exportación de reportes y gestión de compensación al catálogo existente. ADMIN administra; OFICINA representa al supervisor mediante permisos explícitos. CLIENTE y REPARTIDOR no acceden a los indicadores globales.

### 2. US-008: dashboard operativo y ambiental — 5 puntos del backlog

- Crear un servicio de agregación reutilizable por dashboard, PDF y compensación.
- Filtrar por periodo y separar rutas planificadas, en ejecución y completadas. Los totales de reportes cerrados se basan en operaciones completadas.
- Mostrar kilómetros estimados, consumo estimado, CO₂, costos y ahorros con sus unidades y procedencia. Un eléctrico tiene cero combustible fósil; el costo energético requiere su propio parámetro.
- Comparar con el periodo anterior de igual duración. Si no hay histórico comparable, presentar las métricas absolutas y el diferencial en 0 %, conforme al criterio de aceptación.
- Aplicar las actualizaciones de avance/cierre sin contar dos veces una ruta. Definir frecuencia de actualización visible y una respuesta de error que conserve el último estado con su fecha.
- Diseñar primero la pantalla de filtros y estados: cargando, resultados, sin datos, parámetros incompletos y fallo de conexión.

**Pruebas de aceptación:** totales conocidos; ausencia de histórico; periodos vacíos; filtros por fecha; fin de día en Lima; eléctricos; precios/factores ausentes; permisos; actualización de entrega; reoptimización sin duplicar ni perder métricas.

### 3. US-009: PDF de sostenibilidad y costos — 3 puntos del backlog

- Reutilizar exactamente los filtros y el cálculo del dashboard; no mantener otra fórmula independiente.
- Incluir periodo, fecha de generación, unidades, parámetros aplicados y desglose de costos y emisiones; distinguir estimaciones de mediciones.
- Persistir el trabajo de generación con estados pendiente, procesando, listo y error. Un reinicio debe conservarlo y permitir reintentos idempotentes.
- Generar los documentos de gran volumen fuera de la petición de descarga. Presentar una notificación dentro de la aplicación con su enlace; no añadir envíos externos de correo sin definirlos y autorizarlos.
- Verificar permisos en cada consulta/descarga. El enlace no debe convertir un reporte privado en un archivo público sin control.
- Si no hay datos, cancelar la generación y mostrar: **«No se encontraron datos para generar el reporte en el periodo especificado.»**

**Pruebas de aceptación:** contenido y totales del PDF; periodo vacío; límites de fecha; descarga autorizada/denegada; acceso entre usuarios; reintento; trabajo retenido tras reinicio; volumen grande; archivo sin cortes ni tablas ilegibles.

### 4. US-010: propuesta de compensación — 5 puntos del backlog

- Consultar emisiones acumuladas del mismo periodo con las reglas anteriores.
- Configurar factores de créditos de carbono y árboles con fuente y horizonte temporal. La propuesta es una estimación; no afirma que se hayan comprado, certificado o retirado créditos ni que se hayan plantado árboles.
- Administrar los proyectos ambientales disponibles y su distribución porcentual.
- Exigir factores positivos, porcentajes válidos y total de distribución coherente. Usar un redondeo que conserve el total de árboles entre proyectos.
- Recalcular al cambiar la distribución y permitir exportar la propuesta junto con sus parámetros y supuestos.

**Pruebas de aceptación:** conversiones y unidades; cero emisiones; parámetros inválidos/ausentes; total de porcentajes; redondeo entre varios proyectos; mismo resultado en pantalla y exportación; permisos.

## Contratos previstos para implementar

Estos son contratos de diseño, todavía no endpoints publicados.

| Contrato propuesto | Uso y controles |
|---|---|
| `GET /api/v1/analitica/resumen?desde=AAAA-MM-DD&hasta=AAAA-MM-DD` | Totales, comparación, unidades, versión de parámetros y calidad/disponibilidad de datos; permiso de dashboard |
| `POST /api/v1/reportes` | Solicitar periodo; devolver trabajo persistido y estado, sin esperar a generar un PDF grande |
| `GET /api/v1/reportes/{id}` | Estado, error recuperable y disponibilidad; autorización del solicitante/administrador |
| `GET /api/v1/reportes/{id}/archivo` | Descargar el PDF autorizado; nombre y tipo de contenido correctos |
| `GET /api/v1/compensacion/proyectos` | Catálogo de proyectos configurados |
| `POST /api/v1/compensacion/propuestas` | Periodo y distribución; resultado reproducible con instantánea de factores |
| `GET /api/v1/compensacion/propuestas/{id}/archivo` | Exportar la propuesta autorizada |

Servicios candidatos: `analytics_service.py`, `report_service.py`, `compensation_service.py`; pantallas React de indicadores, reportes y compensación. Los importes usan decimales y se redondean al presentar. Las fechas se validan y las convenciones de periodo se documentan para America/Lima. Añadir índices y consultas agregadas antes de recurrir a cargar todo el histórico en memoria.

## Trabajo obligatorio de calidad y despliegue

1. Crear la suite Playwright con configuración para Chromium, Firefox y WebKit, sesiones aisladas y datos sintéticos en una base desechable. Probar autenticación, permisos, filtros, dashboard, generación/descarga del PDF, compensación, errores de formulario y pérdida de conexión.
2. Conservar resultados reales, trazas/capturas y reporte HTML como artefactos. Medir TTFB, FCP, LCP, tiempos de API y disponibilidad. Informar también las operaciones que excedan 500 ms; no alterar resultados ni omitir fallos para alcanzar el umbral de la rúbrica. Los trabajos largos deben ofrecer un estado asíncrono y un tiempo de finalización separado.
3. Preparar una evaluación SUS con al menos cinco participantes representativos para la rúbrica sobresaliente. Registrar respuestas reales, tareas, perfiles anonimizados y consentimiento; calcular puntajes individuales, promedio y comparación con 68. No generar respuestas ficticias ni atribuir satisfacción a personas que no participaron.
4. Separar los workflows solicitados: `ci.yml` para estilo/análisis/build/dependencias; `tests.yml` para unitarias/integración/E2E y artefactos; `deploy-production.yml` para desplegar el código validado en main o tags autorizados. Reutilizar los controles de Sprint 3 y Green IT; retirar duplicaciones solo cuando exista un reemplazo comprobado.
5. Condicionar producción al mismo commit aprobado por CI y pruebas. Usar GitHub Secrets y un ambiente de producción configurado. No desplegar una rama de PR en producción; probar health, URL pública y reversión. El proveedor sigue por confirmar.
6. Excluir `playwright-report/` y `test-results/`, además de las dependencias, variables privadas y compilados ya ignorados. Revisar enlaces, archivos residuales y el versionado de los documentos afectados.

## Documentos de cierre que se producirán con evidencia

La consigna utiliza literalmente `docs/03 Inplementación/Sprint 4/`; se mantiene esa ruta para esta entrega, sin mover las carpetas históricas llamadas `Implementación`.

| Archivo exigido | Información real necesaria antes de cerrarlo |
|---|---|
| `01 Revisión del Sprint V_1_0_0.md` | Líder confirmado, historias realmente terminadas, PR/commits, demostración, entorno y comentarios de stakeholders |
| `02 Retrospectiva del Sprint V_1_0_0.md` | Sesión realizada, lecciones, análisis de personas/relaciones/procesos/herramientas y compromisos con responsables y seguimiento |
| `03 Analisis PlayWrigth V_1_0_0.md` | Configuración, casos ejecutados, resultados por navegador, métricas, disponibilidad y evidencias del reporte HTML |
| `04 Usabilidad V_1_0_0.md` | Muestra y tareas reales, respuestas anonimizadas, cálculo SUS individual/global, interpretación y mejoras comprobadas |

No se crean todavía esos cuatro documentos como si las sesiones y evaluaciones ya hubieran ocurrido. Esta preparación no es un acta de cierre. Al producirlos se respetarán sus encabezados exigidos, se añadirán los cuatro enlaces al README y cada documento tendrá un enlace de vuelta. Los badges solo apuntarán a workflows existentes.

## Información que falta confirmar para ejecutar el plan

- Destino actual de producción y disponibilidad de los accesos/Secrets correspondientes.
- Claves y alcance actual de las historias del Sprint 4 en Jira; reparto y capacidad del equipo para sus tareas de calidad.
- Precios, factores ambientales y proyectos que el equipo utilizará, con sus fuentes y vigencia.
- Participantes y calendario de demostración, SUS, review y retrospectiva; líder que firmará los documentos.

Estas decisiones no impiden preparar servicios y casos de prueba con datos sintéticos identificados como tales; sí impiden afirmar que producción o la evaluación con usuarios estén terminadas.

## Control de versión

V_1_0_0, 18/11/2026: preparación a partir del backlog, la consigna y el código comprobado hasta Sprint 3. No se modificaron Jira, main ni el PR #12.

[Guía para revisar e integrar el PR #12](05%20Gu%C3%ADa%20de%20revisi%C3%B3n%20e%20integraci%C3%B3n%20V_1_0_0.md) · [← Volver al README principal](../../../README.md)
