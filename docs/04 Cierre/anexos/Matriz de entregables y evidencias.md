[← Volver al README principal](../../../README.md)

# Matriz de cumplimiento y procedencia

| Requisito del encargo | Entrega / control | Condición de evidencia |
|---|---|---|
| Siete nombres exactos en docs/04 Cierre | Reportes 01–07 y validador documental | Archivos entregados; validación de existencia, marcadores y enlaces. |
| Reporte de estado y variación | Alcance, cronograma, costos, proyección, riesgos y causas | Narrativa técnica con limitaciones; ejecución financiera simulada. |
| EVM con tres columnas y tres EAC | Modelo JSON, CSV, horas y fórmulas verificables | Simulado; no libro contable ni horas reales. |
| Dashboards híbridos | RAG, líneas EVM, flujo acumulado, burbujas CSI y barras | Figuras rotuladas; tablas como alternativa textual accesible. |
| Radiadores | Burndown, burnup, mood, tablero Jira histórico y síntesis de retro | Curvas/mood simulados; tablero real histórico; retro reconstruida. No son nuevas capturas reales de ejecución. |
| Reporte final y lecciones | Separación predictivo/adaptativo, riesgos y transición | Aprobación administrativa y reunión real no acreditadas. |
| Nomenclatura y versiones previas | Acta, presupuesto, backlog y stack V_1_1_0 | Versiones originales conservadas; sin aprobación histórica inventada. |
| Arquitectura, limpieza y .gitignore | Web/API/móvil separados; inspección de archivos rastreados y exclusiones | Fuente en repositorio; secretos y dependencias fuera de la entrega. |
| Demostración funcional y tiempo | Guía de 10 min de gestión y 10 min de demo; CI y pruebas | Guía preparada, no exposición ya efectuada. |
| Video MP4 | Excluido expresamente por el usuario | No entregado; no se declara cumplimiento de ese criterio del curso. |

## Fuentes

Consigna final HTML y material docente proporcionados por el usuario, revisados localmente el 27/11/2026. No se publican copias de los PDF docentes. Datos técnicos de referencia: workflows del commit be3e3ac, pruebas documentadas, monitoreo original y retrospectivas versionadas. No se convierten las simulaciones en registros reales.

## Regeneración y revisión

`python scripts/build_closure_figures.py` requiere matplotlib solo para autoría; `python scripts/build_closure_documents.py` y `python scripts/build_closure_addenda.py` usan biblioteca estándar. `python scripts/verify_closure.py` verifica integridad sin instalar dependencias. Los gráficos tienen PNG para Markdown y SVG para exportación.

[← Volver al README principal](../../../README.md)
