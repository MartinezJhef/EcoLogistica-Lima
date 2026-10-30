[← Volver al README Principal](../../README.md)

# 03. Calidad de código V_1_0_0

---

## 1. Información del documento

| Campo | Detalle |
| :--- | :--- |
| **Nombre del Proyecto** | EcoLogistica-Lima: Plataforma Web y Móvil para la Gestión y Optimización de Logística Verde Urbana |
| **Código del Proyecto** | PFA-ECOLIMA-2026 |
| **Integrantes del Equipo** | • Zayuri Cerron Medina <br>• Jheferson Martinez Valerio <br>• Angela Rojas Quispe <br>• Maylit Mendoza Alarcon <br>• Diego Angulo Gonzales |
| **Responsable del Documento** | Jheferson Martinez Valerio |
| **Fecha de Elaboración** | 30 de octubre de 2026 |
| **Versión** | 1.0.0 |

---

# Evaluación de Calidad de Código — SonarQube

**Nombre del Proyecto:** EcoLogistica-Lima  
**Fecha de Análisis:** 2026-10-30  
**Versión del Análisis:** V_1_0_0

## 1. Resumen Ejecutivo de Quality Gate

El análisis realizado en SonarQube sobre el proyecto **EcoLogistica-Lima** muestra un estado general **aprobado** del Quality Gate, con una mejora evidente respecto a evaluaciones previas. La reducción de la deuda técnica y la consolidación de pruebas automatizadas han permitido elevar la seguridad, la estabilidad y la cobertura del proyecto.

- **Estado del Quality Gate:** PASSED
- **Porcentaje de Cobertura de Pruebas (Coverage):** 71.6%
- **Duplicación de Código:** 2.1%
- **Problemas Abiertos Totales:** 0
- **Riesgo General:** Bajo

### Interpretación técnica
La cobertura de pruebas pasó de **33.1%** a **71.6%**, lo que representa una mejora significativa en la validación funcional del proyecto. Además, la deuda técnica se redujo drásticamente: **116 bugs** y **9 vulnerabilidades** quedaron resueltas en la última ejecución de SonarQube, dejando el proyecto con **0 incidencias abiertas**. La duplicación se mantiene estable y controlada en **2.1%**, lo que refleja una base de código ordenada y mantenible.

## 2. Métricas Principales

| Categoría | Valor Actual | Valor Anterior | Mejoría |
| :--- | :---: | :---: | :--- |
| **Bugs** | 0 | 116 | Reducción del 100% |
| **Vulnerabilidades** | 0 | 9 | Reducción del 100% |
| **Code Smells** | 0 | 27 | Reducción del 100% |
| **Security Hotspots** | 0 | N/D | Sin hallazgos abiertos |
| **Coverage** | 71.6% | 33.1% | +38.5 puntos |
| **Duplicación** | 2.1% | 1.8% | Levemente mayor, pero aún aceptable |

### Comentario sobre la clasificación
Los indicadores actuales muestran que el proyecto ya no presenta deuda técnica activa en las dimensiones principales de calidad. La reducción desde 116 bugs y 9 vulnerabilidades hasta 0 evidencia que las correcciones aplicadas fueron efectivas y se reflejan directamente en el análisis actual de SonarQube.

## 3. Análisis Detallado de Calidad

### 3.1 Cobertura de pruebas
La cobertura del proyecto alcanza **71.6%**, un valor muy positivo para el estado actual del sistema. Este aumento confirma que el equipo reforzó la validación automatizada y que la lógica crítica del proyecto está siendo probada con mayor profundidad.

**Implicaciones:**
- la validación funcional está más consolidada,
- hay menor probabilidad de regresiones no detectadas,
- el proyecto presenta mayor preparación para seguir avanzando con confianza.

### 3.2 Duplicación de Código
La duplicación reportada fue de **2.1%**, una métrica compatible con un proyecto sano. Sigue siendo una medida controlada y no representa un riesgo operativo relevante.

**Conclusión:**
- la base del proyecto mantiene una estructura ordenada,
- no existe deuda técnica significativa por duplicación,
- la prioridad actual es mantener la calidad y cubrir nuevas funcionalidades con pruebas.

### 3.3 Deuda Técnica
La deuda técnica actual es **0**, lo cual indica que el proyecto no presenta problemas abiertos relevantes en las principales dimensiones de SonarQube. Este resultado supone una mejora clara respecto a estudios previos y valida la efectividad de las correcciones realizadas.

## 3. Plan de Remediación y Deuda Técnica
- **Deuda Técnica Estimada:** 1h 30m de revisión preventiva y continuidad de validación.
- **Principales hallazgos y acciones correctivas:**
  1. **Hallazgo 1: Reducción de bugs y vulnerabilidades.** En la primera revisión se reportaron **116 bugs** y **9 vulnerabilidades**. La corrección aplicada consistió en reforzar la seguridad de la interfaz, ajustar elementos de acceso y eliminar errores funcionales en la capa de interacción. En la última ejecución, estas incidencias quedaron **en 0**.
  2. **Hallazgo 2: Fortalecimiento de cobertura y control de calidad.** La cobertura pasó de **33.1%** a **71.6%** mediante la ampliación de pruebas automatizadas y la validación de flujos críticos del proyecto. La acción de seguimiento continua es mantener esta tendencia, revisando cada nueva funcionalidad para que no vuelva a aparecer deuda técnica.

### Conclusión
La deuda técnica del proyecto se ha reducido de forma significativa. El sistema mantiene un estado sano, con prioridad en mantener la cobertura actual, asegurar la continuidad de pruebas y evitar la acumulación de nuevas incidencias en futuras iteraciones.

## 4. Conclusión General

El proyecto **EcoLogistica-Lima** presenta un estado general de calidad **aprobado** en SonarQube, con una cobertura de **71.6%**, duplicación de **2.1%** y cero incidencias abiertas. El análisis actual evidencia una mejora clara respecto a evaluaciones anteriores, fortaleciendo la confianza técnica del proyecto y su preparación para continuar con más validaciones y despliegues controlados.

[← Volver al README Principal](../../README.md)
