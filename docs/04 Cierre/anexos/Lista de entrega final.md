[← Volver al README principal](../../../README.md)

# Lista de preparación de la entrega final

**Corte:** 28/11/2026. Lista del material solicitado por la consigna final. «Preparado» significa que el archivo y su contenido están disponibles; no atribuye una nota, certificación o aprobación del docente.

| Material solicitado | Estado | Dónde está y qué contiene |
|---|---|---|
| 01 Reporte de Estado | Preparado | [Reporte 01](../01%20Reporte%20de%20Estado%20V_1_0_0.md): alcance, cronograma, costos, proyección, riesgos y acciones. |
| 02 Reporte de Variación | Preparado | [Reporte 02](../02%20Reporte%20de%20Variaci%C3%B3n%20V_1_0_0.md): plan frente a resultados, causas y respuestas en tiempo, costo y calidad. |
| 03 Análisis EVM | Preparado y cálculos comprobados | [Reporte 03](../03%20Reporte%20de%20An%C3%A1lisis%20de%20Valor%20Ganado%20-%20EVM%20V_1_0_0.md): periodo/acumulados, índices y tres EAC; escenario financiero simulado identificado. |
| 04 Tableros híbridos | Preparado | [Reporte 04](../04%20Tableros%20de%20Control%20-%20H%C3%ADbridos%20V_1_0_0.md): RAG, tendencias, flujo, burbujas CSI, barras, interpretación y frecuencia. |
| 05 Radiadores | Preparado | [Reporte 05](../05%20Radiadores%20de%20Informaci%C3%B3n%20V_1_0_0.md): burnup, burndown y Kanban de Jira; mood simulado y retrospectiva reconstruida identificados. |
| 06 Reporte final | Preparado | [Reporte 06](../06%20Reporte%20Final%20del%20Proyecto%20V_1_0_0.md): desempeño predictivo/adaptativo, calidad, fechas, costos, riesgos, éxito y transición. |
| 07 Lecciones aprendidas | Preparado | [Reporte 07](../07%20Reporte%20Final%20de%20Lecciones%20Aprendidas%20V_1_0_0.md): ocho categorías, aprendizajes y acciones con responsables propuestos. |
| Encuestas | Preparadas como resultados simulados permitidos | [Cinco casos, respuestas, cálculo individual y promedio SUS](../../03%20Implementaci%C3%B3n/Sprint%204/08%20Anexo%20SUS%20simulado%20V_1_0_0.md). Media 77,5; [modalidad confirmada por el usuario](../evidencias/criterio-encuestas-simuladas-28nov.json). |
| Código, arquitectura y limpieza | Preparados y verificados | [Frontend](../../../src/frontend), [backend](../../../src/backend), [móvil](../../../src/mobile), [.gitignore](../../../.gitignore), [CI y despliegue de referencia](../evidencias/validacion-cierre-28nov.json). |
| Trazabilidad y versiones previas | Preparadas | Siete enlaces directos desde el [README](../../../README.md), enlaces de retorno y [matriz de evidencias/versiones](Matriz%20de%20entregables%20y%20evidencias.md). |
| Sustentación de veinte minutos | Guion preparado; se ejecuta durante la evaluación | [Diez minutos de gestión y diez de demostración](Guia%20de%20sustentacion%20y%20transicion.md). La ejecución futura no se declara realizada. |
| Video | A cargo del equipo; fuera de este encargo | El usuario lo prepara por separado. Este paquete no lo produce ni acredita su entrega. |

## Aplicación y evidencia disponible

Sistema: [EcoLogística](https://ecologistica-web.onrender.com). [API y contratos](https://ecologistica-api.onrender.com/docs). Se conserva la [verificación pública de los recursos desplegados y de la base](../evidencias/verificacion-publica-cierre-28nov.json) y la ejecución de [66 pruebas de navegador](../evidencias/playwright-ci-66-28nov.json). Las credenciales no se incluyen en el repositorio ni en el ZIP.

Para la demostración seguir el recorrido del guion: registro del pedido → planificación → asignación al conductor → entrega y regreso → sostenibilidad → solicitud y descarga del PDF. Usar cuentas y permisos habilitados por administración, y un periodo que incluya operaciones registradas. Los factores de CO₂ y costos deben explicarse como estimaciones según la configuración.

## Observaciones que se entregan junto al producto

La documentación está preparada incluso cuando informa desviaciones. **No equivale a que todas las metas originales del producto estén cumplidas:** ANA-26 sigue En curso hasta acreditar la revisión integral WCAG; las pruebas seleccionadas y los árboles nativos no certifican todos sus criterios. El muestreo no acredita disponibilidad mensual y se conservan respuestas superiores a 500 ms. La capacidad medida usa datos sintéticos y un adaptador vial controlado. Las metas originales de SUS y reducción ambiental no se cambian para hacerlas coincidir con resultados favorables.

Horas, costos y mood se presentan como escenarios simulados autorizados por el usuario; la confirmación específica del ingeniero comunicada por el usuario corresponde a las encuestas. No se inventan pagos, reuniones, firmas ni aceptación de interesados. Estas condiciones se detallan en la [revisión de la rúbrica](Revision%20de%20la%20rubrica%20final.md) y en los [resultados técnicos](Cierre%20de%20validaciones%2028nov.md).

## Verificación reproducible y empaquetado

Desde la raíz del repositorio ejecutar `python scripts/verify_closure.py`: comprueba los siete nombres, enlaces, cálculos EVM, procedencia de los datos y evidencias. Para regenerar los resúmenes actuales sin modificar los cortes históricos: `python scripts/finalize_quality_documents.py`.

El ZIP de entrega se obtiene de los archivos versionados, excluyendo entornos y credenciales; se comprueba su integridad antes de entregarlo. Mantener la estructura al extraerlo. Después de añadir el video, el equipo debe colocarlo en la ruta exigida por la consigna, sin sustituir documentos o evidencias existentes.

[← Volver al README principal](../../../README.md)
