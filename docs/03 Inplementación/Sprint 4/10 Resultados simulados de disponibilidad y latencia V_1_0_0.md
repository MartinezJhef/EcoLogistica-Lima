# Resultados simulados de disponibilidad y latencia

## Alcance

Escenario hipotético para explicar el objetivo de calidad cuando no hay observación suficiente. No corresponde al hosting medido, no demuestra una ejecución ni sustituye los resultados reales del documento 03. Los valores se construyen para ilustrar el cálculo, sin predicción de rendimiento.

## Escenario simulado de disponibilidad durante dos horas

Supuestos: una petición por minuto a cada uno de dos destinos durante una ventana de dos horas; se utilizan 120 ciclos, sin incluir una muestra adicional del extremo final.

| Variable simulada | Valor supuesto |
|---|---:|
| Ventana hipotética | 120 minutos |
| Intervalo hipotético | 60 segundos |
| Destinos | 2 |
| Solicitudes hipotéticas | 240 |
| Respuestas correctas supuestas | 240 |
| Errores supuestos | 0 |
| Éxito muestral simulado | 240 / 240 × 100 = 100 % |

Este 100 % es consecuencia de los supuestos. No acredita disponibilidad real, SLA ni ausencia de interrupciones entre muestras.

## Escenario simulado del objetivo de latencia

Serie hipotética de diez solicitudes en milisegundos: 180, 210, 240, 270, 300, 330, 360, 390, 420 y 450. No procede de peticiones reales ni representa el login observado.

| Métrica simulada | Cálculo | Resultado |
|---|---|---:|
| Mediana | (300 + 330) / 2 | 315 ms |
| p95 por rango más cercano | Posición ceil(0,95 × 10) = 10 | 450 ms |
| Máximo | Mayor elemento | 450 ms |
| Fracción menor de 500 ms | 10 / 10 | 100 % |

Bajo estos supuestos, las diez solicitudes hipotéticas cumplen el objetivo. Esto no permite afirmar que la implementación desplegada lo cumpla: en la medición real hay solicitudes de más de 500 ms y un login de más de un segundo.

## Estado real que se conserva

La optimización del resumen redujo su mediana real de 585,43 a 458,45 ms; 9 de 10 consultas fueron menores de 500 ms y el máximo fue 500,91 ms. El monitoreo de dos horas se analiza a partir de sus muestras reales, sin completar huecos con estos valores hipotéticos. Ver el [informe 03](03%20Analisis%20PlayWrigth%20V_1_0_0.md).

[← Volver al README principal](../../../README.md)
