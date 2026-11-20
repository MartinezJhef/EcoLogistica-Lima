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
