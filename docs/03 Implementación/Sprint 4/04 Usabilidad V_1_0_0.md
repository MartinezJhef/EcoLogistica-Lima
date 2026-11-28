[← Volver al README principal](../../../README.md)

# 01. Usabilidad V_1_0_0

> **Modalidad de encuestas confirmada, 28/11/2026.** El usuario informa que el ingeniero permite encuestas simuladas. Se entregan cinco casos SUS como **resultados simulados**, media 77,5; este apartado no queda pendiente por falta de participantes reales. No cambia la meta original SUS ≥85 ni acredita aceptación humana. La autorización se limita a encuestas.


---

## 1. Información del documento

| Campo | Detalle |
| :--- | :--- |
| **Nombre del Proyecto** | EcoLogistica-Lima: Plataforma Web y Móvil para la Gestión y Optimización de Logística Verde Urbana |
| **Código del Proyecto** | PFA-ECOLIMA-2026 |
| **Integrantes del Equipo** | • Zayuri Cerron Medina <br>• Jheferson Martinez Valerio <br>• Angela Rojas Quispe <br>• Maylit Mendoza Alarcon <br>• Diego Angulo Gonzales |
| **Responsable del Documento** | Angela Rojas Quispe |
| **Fecha de Elaboración** | 19 de noviembre de 2026 |
| **Versión** | 1.0.0 |

--- 
<br><br>

# Evaluación de usabilidad: evidencia técnica real y cuestionarios simulados

## Ficha técnica y alcance de las evidencias

Sistema evaluado: EcoLogística Lima, interfaz React, API FastAPI y PostgreSQL/PostGIS. Se distinguen dos conjuntos de datos:

| Conjunto | Origen | Alcance |
|---|---|---|
| Evidencia técnica real | Ejecuciones automáticas locales y peticiones a la aplicación desplegada | Funcionamiento, permisos, validaciones, recuperación de red y tiempos observados |
| Cuestionarios SUS simulados | Cinco perfiles y respuestas construidos para el ejercicio | Demostración del cálculo SUS; no son opiniones recogidas de personas |

Muestra humana real: **n = 0**. Casos SUS simulados: **5**. La matriz, los puntajes y el grado derivados de las respuestas conservan su naturaleza simulada. Los datos técnicos reales no convierten esa muestra en participantes.

## Tareas realmente ejecutadas en las pruebas

| Entorno | Tareas ejecutadas | Resultado y evidencia |
|---|---|---|
| Local desechable, cuatro roles y tres navegadores | Login, indicadores, restricciones por rol y cálculo de compensación | 12/12 recorridos TypeScript aprobados; [captura oficial](evidencias/playwright-reporte-oficial.jpg) |
| Local desechable, recorrido integral Python | Solicitar y descargar PDF, validación de distribución, desconexión y recuperación, permisos | 12/12; [muestras originales](evidencias/playwright-resultados-originales.json) e [informe HTML](evidencias/playwright-informe-integral.html) |
| Instalación publicada | Login y lectura de indicadores, configuración, reportes y usuarios | 5/5 HTTP 200; [registro](evidencias/comprobaciones-autenticadas.json) |
| Instalación publicada, registros de prueba | Pedido, planificación vial, reoptimización, entrega, regreso, analítica y PDF privado | Recorrido aprobado; [registro](evidencias/recorrido-produccion.json) |

Las ejecuciones ocurrieron contra software real. Los pedidos, vehículos y parámetros usados para probarlo son datos de prueba, no actividad comercial. No se atribuyen esas tareas a cinco evaluadores humanos.

## Cuellos de botella reales, mejoras y verificación

| Hallazgo técnico comprobado | Mejora aplicada | Verificación y límite |
|---|---|---|
| El resumen necesitaba varias consultas consecutivas a PostgreSQL | Consulta conjunta de periodos e instantáneas: máximo dos consultas | Mediana publicada de 585,43 a 458,45 ms; 9/10 consultas <500 ms. Máximo 500,91 ms: objetivo universal pendiente |
| La fecha UTC del servidor bloqueaba iniciar rutas válidas por la noche en Lima | Calendario operativo de Lima | Prueba de regresión y posterior recorrido publicado aprobados; PR #14 |
| El registro de entrega con foto podía saltarse la secuencia de estados | Uso de las mismas transiciones de entrega y actualización de itinerario | Se rechazan saltos; prueba de entrega y cierre por regreso aprobada; PR #14 |
| Una distribución ambiental incompleta debe impedir el cálculo | Validación de suma exactamente 100 % | El recorrido integral comprueba el rechazo de 90 % y la aceptación de 100 % |
| Un costo sin tarifa histórica no permite afirmar costo cero | Indicador «No configurado» e instantáneas históricas | Casos de servidor verifican ausencia de parámetros y conservación de factores |
| Ante desconexión no se debe presentar información antigua como recién actualizada | Error visible, conservación del último resultado y fecha, recuperación al actualizar | Prueba de desconexión/recuperación en los tres navegadores |
| El PDF requiere procesamiento independiente y control de acceso | Estados de trabajo, descarga cuando está LISTO, reintento y autorización | Generación y descarga reales aprobadas; descarga sin sesión rechazada |

Estos son resultados de pruebas y análisis técnico. No se presentan como comentarios de personas ni demuestran un aumento de satisfacción antes/después. [Medición anterior](evidencias/latencia-produccion-antes.json), [medición posterior](evidencias/latencia-produccion-despues.json) y [análisis Playwright](03%20Analisis%20PlayWrigth%20V_1_0_0.md).

## Interpretación de la evidencia real

Las tareas técnicas comprobadas permiten documentar que los flujos y las validaciones funcionan en los entornos indicados. No permiten medir satisfacción subjetiva ni generalizar a una población de usuarios. La mejora de latencia del resumen es aproximadamente 21,7 % en mediana entre esas muestras; no garantiza que todas las solicitudes sean menores de 500 ms. El login sigue superando ese objetivo.

## Instrumento de usabilidad

SUS utiliza diez ítems y Likert 1–5. El cuestionario completo y el protocolo están en el [documento 06](06%20Despliegue%20y%20evaluaci%C3%B3n%20V_1_0_0.md). Para sustituir los datos simulados deben recogerse respuestas reales después de ejecutar las tareas, sin reutilizar opiniones inventadas. El cálculo se reproduce con scripts/sus_score.py.

## Resultados de los cuestionarios simulados

La sección siguiente conserva los perfiles ficticios, respuestas, cálculo paso a paso, promedio e interpretación del conjunto simulado.

### Ficha técnica del conjunto simulado


Cinco perfiles ficticios, SIM01–SIM05, para demostrar el procesamiento de un cuestionario SUS. No se realizaron entrevistas ni se recogieron estas respuestas de personas. Muestra real: n = 0; casos simulados: 5. Los valores fueron construidos para el ejercicio y no acreditan el requisito de participantes de la rúbrica.

Instrumento: diez ítems SUS, escala Likert de 1 (totalmente en desacuerdo) a 5 (totalmente de acuerdo), descritos en el protocolo del documento 06. Fecha de elaboración del ejercicio: 20/11/2026. No hay fecha de aplicación a personas.

## Tareas planteadas para los perfiles ficticios

| Perfil | Rol | Tarea propuesta, sin atribuir ejecución humana |
|---|---|---|
| SIM01 | Administración | Consultar usuarios y configuración ambiental |
| SIM02 | Oficina y despacho | Registrar un pedido y consultar su ruta |
| SIM03 | Reparto | Consultar itinerario, registrar entrega y confirmar regreso |
| SIM04 | Cliente | Consultar un pedido propio y sus preferencias |
| SIM05 | Consulta de sostenibilidad | Filtrar indicadores y solicitar un reporte PDF |

## Matriz de respuestas ficticias y cálculo individual

Para los ítems impares se calcula respuesta − 1; para los pares, 5 − respuesta. Se suman los diez aportes (0–40) y se multiplican por 2,5. SUS es una puntuación de 0 a 100, no un porcentaje de tareas completadas.

| Caso | I1 | I2 | I3 | I4 | I5 | I6 | I7 | I8 | I9 | I10 | Aportes ajustados | Suma | SUS |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---|---:|---:|
| SIM01 | 4 | 2 | 4 | 2 | 5 | 1 | 4 | 2 | 4 | 2 | 3 + 3 + 3 + 3 + 4 + 4 + 3 + 3 + 3 + 3 | 32 | 80.0 |
| SIM02 | 4 | 2 | 4 | 3 | 4 | 2 | 4 | 2 | 4 | 2 | 3 + 3 + 3 + 2 + 3 + 3 + 3 + 3 + 3 + 3 | 29 | 72.5 |
| SIM03 | 4 | 2 | 5 | 2 | 4 | 2 | 4 | 1 | 4 | 2 | 3 + 3 + 4 + 3 + 3 + 3 + 3 + 4 + 3 + 3 | 32 | 80.0 |
| SIM04 | 5 | 1 | 4 | 2 | 4 | 2 | 5 | 2 | 4 | 1 | 4 + 4 + 3 + 3 + 3 + 3 + 4 + 3 + 3 + 4 | 34 | 85.0 |
| SIM05 | 4 | 3 | 4 | 2 | 4 | 2 | 4 | 2 | 4 | 3 | 3 + 2 + 3 + 3 + 3 + 3 + 3 + 3 + 3 + 2 | 28 | 70.0 |

## Promedio e interpretación del ejercicio

Promedio = (80.0 + 72.5 + 80.0 + 85.0 + 70.0) / 5 = **77.5 puntos**. El promedio construido supera el umbral 68 usado por la consigna. Este resultado describe exclusivamente los datos ficticios y no permite concluir que los usuarios reales estén satisfechos. La clasificación de los datos simulados se detalla en la escala citada al final; el umbral 68 por sí solo no determina un grado.

## Análisis de resultados simulados y mejoras a comprobar

Los ítems pares 4 y 10 permiten plantear una posible necesidad de ayuda y aprendizaje; no son hallazgos observados en participantes. En una evaluación real se debe comprobar la claridad de la configuración ambiental, la visibilidad del estado del PDF y las restricciones de permisos.

La aplicación ya incorpora mensajes ante porcentajes incorrectos, estados de reporte, costos no configurados y errores de conexión. La relación entre esas mejoras y la satisfacción requiere medir respuestas reales; este ejercicio no demuestra una mejora antes/después.

## Reproducción y evidencias

[Respuestas ficticias](evidencias/sus-respuestas-simuladas.json) y [resultado del cálculo](evidencias/sus-resultados-simulados.json). Desde la raíz: `python scripts/sus_score.py "docs/03 Inplementación/Sprint 4/evidencias/sus-respuestas-simuladas.json"`.

[← Volver al README principal](../../../README.md)

## Clasificación de los resultados simulados con escala citada

Se usa la escala curva Sauro–Lewis presentada por [MeasuringU, Understanding Different Types of 100-Point Scales](https://measuringu.com/types-of-100-point-scales/). En ella, 77,2–78,8 corresponde a B+; por tanto, **77,5 puntos simulados corresponden a B+** y superan 68. La letra B+ es una interpretación numérica del conjunto ficticio, no una evaluación observada de usuarios.

| Caso simulado | SUS | Grado según la escala citada |
|---|---:|---|
| SIM01 | 80,0 | A− |
| SIM02 | 72,5 | C+ |
| SIM03 | 80,0 | A− |
| SIM04 | 85,0 | A+ |
| SIM05 | 70,0 | C |
| Promedio simulado | 77,5 | B+ |


Actualización 20/11/2026: evidencia técnica real consolidada y diferenciada de los cuestionarios simulados.

[← Volver al README principal](../../../README.md)
