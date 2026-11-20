[← Volver al README principal](../../../README.md)

# 01. Usabilidad V_1_0_0

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

# Pruebas funcionales y de usabilidad por roles

## Ficha técnica

Evaluación ejecutada: recorridos automatizados por roles en Chromium, Firefox y WebKit sobre entorno local desechable. Son 12 recorridos técnicos, no 12 participantes humanos. Tamaño de muestra SUS disponible: **n = 0**; no se han recibido cuestionarios de usuarios.

Tareas: administración/oficina filtran indicadores, solicitan y descargan PDF, calculan y cambian distribución; cliente/repartidor consultan sus pantallas y se comprueba la restricción a información global. La evaluación SUS preparada utiliza Likert 1–5 y debe aplicarse después a participantes representativos.

## Resultados cuantitativos

| Evidencia | Resultado |
|---|---|
| Recorridos integrales por roles | 12 aprobados de 12 en la ejecución final |
| Roles | Administrador, oficina, repartidor y cliente |
| Navegadores | Chromium, Firefox, WebKit |
| Respuestas SUS recibidas | 0 |
| Puntajes individuales y promedio SUS | No calculables sin respuestas |

No se atribuyen respuestas a los colaboradores. El cálculo está implementado en `scripts/sus_score.py`: restar 1 a ítems impares, restar cada respuesta par de 5, sumar los diez aportes y multiplicar por 2,5. El promedio es la suma de puntajes individuales dividida entre participantes. El script rechaza respuestas ausentes, fuera de rango o identificadores duplicados.

## Comprobaciones de la instalación publicada

El 19/11/2026 a las 21:00, hora de Lima, se comprobaron cinco operaciones HTTP con sesión de administración. Evidencia reproducible: [resultados JSON](evidencias/comprobaciones-autenticadas.json). Son consultas técnicas automatizadas, con el siguiente alcance:

| Caso | Operación | HTTP | Resultado |
|---|---|---:|---|
| C01 | Inicio de sesión de administración | 200 | Aprobado |
| C02 | Resumen de analítica del 01 al 19/11/2026 | 200 | Aprobado |
| C03 | Consulta de configuración ambiental | 200 | Aprobado |
| C04 | Consulta de la lista de reportes | 200 | Aprobado |
| C05 | Consulta de usuarios | 200 | Aprobado |

Tasa de éxito de estas comprobaciones: **5/5 = 100 %**. Esta tasa no mide satisfacción ni acredita cinco cuestionarios SUS; tampoco verifica por sí sola el procesamiento de un PDF o el recorrido completo de entrega en producción.

## Análisis e interpretación

No corresponde asignar grado A–F, adjetivo ni afirmar cumplimiento del umbral 68 sin respuestas. El éxito funcional no mide satisfacción subjetiva.

Hallazgos técnicos comprobados: los costos ausentes deben distinguirse de cero; los porcentajes deben sumar 100 %; los reportes necesitan estado visible; ante desconexión deben conservarse los últimos datos y su fecha. La interfaz incorpora estos mensajes, validación, estados y recuperación. Los factores históricos no cambian al editar configuración.

## Aplicación con usuarios

El [protocolo y cuestionario](06%20Despliegue%20y%20evaluaci%C3%B3n%20V_1_0_0.md) está listo. Recoger al menos cinco respuestas con identificadores anónimos P01–P05, registrar tareas y comentarios, ejecutar el calculador y añadir aquí la matriz real, los puntajes y su interpretación. Esta parte permanece pendiente y no se declara realizada.

V_1_0_0 — 18/11/2026. Actualización 20/11/2026: se incorporan las cinco comprobaciones de la instalación publicada y su evidencia JSON.

[← Volver al README principal](../../../README.md)

La aceptación técnica posterior de producción completó también entrega, regreso y PDF. Sus resultados están en la [validación final](07%20Validaci%C3%B3n%20final%20de%20producci%C3%B3n%20V_1_0_0.md). El cuestionario SUS conserva su estado pendiente de respuestas.

## Resultados simulados del cálculo SUS

Se incorpora un [ejercicio con cinco perfiles ficticios](08%20Anexo%20SUS%20simulado%20V_1_0_0.md), matriz de respuestas simuladas y cálculo individual y promedio. Se mantiene separado de las evidencias reales: no modifica la muestra SUS real ni acredita participación.

## Resultados simulados completos incorporados al documento 04

### Ficha técnica de los resultados simulados


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


La matriz y los cálculos se incluyen aquí para facilitar la evaluación del documento exigido. Se conservan los JSON y el anexo 08 para reproducirlos. La muestra real sigue siendo n = 0.

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
