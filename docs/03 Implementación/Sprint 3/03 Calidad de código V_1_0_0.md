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

El análisis realizado en SonarQube sobre el proyecto **EcoLogistica-Lima** muestra un estado general **aprobado** del Quality Gate, con una evolución favorable en cobertura y ausencia de deuda técnica crítica en seguridad, fiabilidad y mantenibilidad.

- **Estado del Quality Gate:** PASSED
- **Porcentaje de Cobertura de Pruebas (Coverage):** 71.6%
- **Duplicación de Código:** 2.1%
- **Problemas Abiertos Totales:** 0
- **Riesgo General:** Bajo

### Interpretación técnica
La cobertura de pruebas se ha incrementado significativamente respecto a análisis previos, situándose en un nivel sólido para la etapa actual del proyecto. La ausencia de problemas abiertos, junto con una duplicación controlada, refleja una base de código más robusta y preparada para continuidad operativa. El proyecto mantiene una valoración técnica sólida y estable en la métrica general del análisis.

## 2. Métricas Principales

| Categoría | Cantidad Detectada | Severidad | Observación |
| :--- | :---: | :--- | :--- |
| **Bugs** | 0 | Ninguna | Sin incidencias abiertas reportadas |
| **Vulnerabilidades** | 0 | Ninguna | Sin vulnerabilidades críticas detectadas |
| **Code Smells** | 0 | Ninguna | Sin deuda técnica activa en mantenibilidad |
| **Security Hotspots** | 0 | Ninguna | Sin hallazgos abiertos en el análisis actual |

### Comentario sobre la clasificación
Los resultados actuales de SonarQube evidencian una mejora sustantiva respecto a la ejecución previa. El proyecto ya no presenta deuda técnica activa en seguridad, fiabilidad ni mantenibilidad, y la cobertura ha superado un umbral razonable para una versión funcional con lógica operativa y lógica de negocios en proceso de validación.

## 3. Análisis Detallado de Calidad

### 3.1 Cobertura de pruebas
La cobertura del proyecto alcanza **71.6%**, un valor muy positivo para el estado actual del sistema. Este incremento demuestra que las pruebas automatizadas han sido reforzadas y que el código central del proyecto está siendo validado con mayor profundidad.

**Implicaciones:**
- La validación funcional está más consolidada que en analíticas previas.
- Hay menor probabilidad de regresiones no detectadas.
- El proyecto ha mejorado su nivel de confianza técnica para una entrega más sólida.

### 3.2 Duplicación de Código
La duplicación reportada fue de **2.1%**, una métrica compatible con un proyecto sano. Aunque el valor es ligeramente superior al análisis anterior, sigue dentro de un rango aceptable y no representa un riesgo operativo evidente.

**Conclusión:**
- La base del proyecto mantiene una estructura ordenada y mantenible.
- El nivel de duplicación no exige corrección inmediata.
- La prioridad principal pasa a consolidar la calidad en continuidad y en validación funcional.

### 3.3 Deuda Técnica
La deuda técnica actual es **cero**, lo cual indica que el proyecto no presenta problemas abiertos relevantes en las principales dimensiones de SonarQube. Este resultado representa una mejora clara respecto al análisis previo y confirma que la calidad técnica del código está en un nivel sólido.

## 4. Evaluación por Tipo de Riesgo

### 4.1 Seguridad
No se detectaron vulnerabilidades relevantes ni incidencias abiertas en el análisis actual. Esto refleja que la aplicación presenta un nivel de seguridad adecuado para la fase de validación y análisis continuo del proyecto.

### 4.2 Fiabilidad
No se reportan bugs activos en la versión analizada. La estabilidad funcional del código presenta un estado positivo y se evidencia una mejora clara en la calidad general del proyecto.

### 4.3 Mantenibilidad
No existen code smells activos ni deuda técnica significativa en la dimensión de mantenibilidad. La base del código se percibe más limpia, más consistente y más preparada para continuar evolucionando.

## 3. Plan de Remediación y Deuda Técnica
- **Deuda Técnica Estimada:** 1h 30m de revisión preventiva y continuidad de validación.
- **Principales hallazgos y acciones correctivas:**
  1. **Hallazgo 1: Mejora de la cobertura validada en la ejecución actual.** La cobertura alcanzó **71.6%**, por lo que la corrección aplicada fue la validación y fortalecimiento de pruebas automatizadas en los módulos con mayor criticidad funcional. La acción de seguimiento continúa con la revisión periódica de los flujos más sensibles del sistema.
  2. **Hallazgo 2: Mantenimiento de la calidad en continuidad.** El análisis actual no reporta incidencias abiertas; por ello, la acción correctiva principal consiste en mantener la vigilancia de SonarQube, reforzar pruebas en nuevas funciones y conservar el nivel de calidad actual mediante control continuo del repositorio.

### Conclusión
La deuda técnica del proyecto se ha reducido significativamente. El sistema mantiene un estado sano, con prioridad en mantener la cobertura actual, asegurar la continuidad de pruebas y evitar la acumulación de nuevas incidencias en futuras iteraciones.

## 4. Conclusión General

El proyecto **EcoLogistica-Lima** presenta un estado general de calidad **aprobado** en SonarQube, con una cobertura de **71.6%**, duplicación de **2.1%** y cero incidencias abiertas. El análisis actual evidencia una mejora clara respecto a evaluaciones anteriores, fortaleciendo la confianza técnica del proyecto y su preparación para continuar con más validaciones y despliegues controlados.

[← Volver al README Principal](../../README.md)
