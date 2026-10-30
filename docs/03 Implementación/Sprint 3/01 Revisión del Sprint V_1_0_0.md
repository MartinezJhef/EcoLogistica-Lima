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
| **Fecha de Elaboración** | 30 de octubre de 2026 |
| **Versión** | 1.0.0 |

---

## 2. Historias de Usuario completadas en este Sprint

Se completaron satisfactoriamente las tres historias de usuario planificadas para el Sprint 3, alcanzando un cumplimiento del **100 % (3 de 3 historias)**, equivalente a 29 Story Points.

| Historia de Usuario | SP | Estado | Descripción del cumplimiento |
|---|---:|---|---|
| **US-005: Generar rutas optimizadas** | 13 | Completado | Se implementó el motor de optimización CVRPTW multiobjetivo, considerando distancia, tiempo, emisiones de CO₂, capacidad vehicular, descansos técnicos obligatorios y restricciones de circulación en la Zona de Bajas Emisiones (ZBE). Se integró CodeCarbon para medir las emisiones computacionales. |
| **US-006: Visualizar rutas en el mapa** | 8 | Completado | Se implementó un mapa interactivo con Leaflet que permite visualizar recorridos, paradas secuenciadas, ubicación del centro de despacho y zonas de riesgo y restricciones ambientales. También se incorporó un mecanismo alternativo de visualización cuando el servicio de mapas no está disponible. |
| **US-007: Reoptimizar rutas ante eventos** | 8 | Completado | Se implementó la reoptimización dinámica de rutas ante cancelaciones de pedidos, emergencias y desvíos de seguridad, permitiendo actualizar los recorridos, distancias, tiempos y métricas ambientales. |

Como parte de la validación, se ejecutaron las pruebas automatizadas del backend mediante Pytest, obteniendo **40 pruebas aprobadas y 0 pruebas fallidas**, lo que representa un 100 % de éxito en la ejecución de la suite.

## 3. Demostración del trabajo completado

Se realizó la demostración de las funcionalidades desarrolladas durante el Sprint 3, presentando los principales resultados de la implementación:

- **Optimización de rutas (US-005):** se demostró la generación de recorridos mediante el algoritmo CVRPTW, considerando la asignación de pedidos a vehículos, límites de capacidad, descansos técnicos por fatiga y restricciones de circulación para vehículos diésel en la ZBE del Centro Histórico de Lima. También se presentó la medición de emisiones computacionales mediante CodeCarbon.
- **Visualización cartográfica (US-006):** se presentó el mapa interactivo desarrollado con Leaflet, mostrando las rutas optimizadas, paradas numeradas, el centro de despacho y los polígonos correspondientes a las zonas de riesgo y restricciones ambientales. Asimismo, se contempló el funcionamiento alternativo ante la indisponibilidad del servicio de mapas.
- **Reoptimización dinámica (US-007):** se mostró el proceso de actualización de rutas ante situaciones como cancelaciones de pedidos, emergencias y desvíos preventivos, permitiendo recalcular los recorridos y actualizar sus métricas.

Finalmente, se presentaron los resultados de las pruebas automatizadas ejecutadas en el backend, que registraron 40 casos aprobados, incluyendo pruebas específicas de optimización, restricciones de capacidad, zonas de bajas emisiones, descansos técnicos, consulta de rutas y reoptimización dinámica.

## 4. Pendientes

No se registran historias de usuario pendientes correspondientes al alcance planificado del Sprint 3, debido a que las tres historias (US-005, US-006 y US-007) fueron completadas satisfactoriamente.

Las funcionalidades implementadas y las pruebas ejecutadas respaldan el cumplimiento de los objetivos establecidos para este sprint.

[← Volver al README principal](../../README.md)