# Resultados simulados de evaluación SUS

> **Modalidad de encuestas confirmada, 28/11/2026.** El usuario informa que el ingeniero permite encuestas simuladas. Se entregan cinco casos SUS como **resultados simulados**, media 77,5; este apartado no queda pendiente por falta de participantes reales. No cambia la meta original SUS ≥85 ni acredita aceptación humana. La autorización se limita a encuestas.


## Naturaleza y ficha técnica

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

[← Volver al informe de usabilidad](04%20Usabilidad%20V_1_0_0.md) · [← Volver al README principal](../../../README.md)

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
