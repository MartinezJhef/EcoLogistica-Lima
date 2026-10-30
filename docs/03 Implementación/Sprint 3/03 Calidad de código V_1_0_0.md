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

El análisis realizado en SonarQube sobre el proyecto **EcoLogistica-Lima** muestra un estado general **aprobado** del Quality Gate, con una base sólida en términos de control de duplicación y cumplimiento mínimo de calidad. Sin embargo, la cobertura de pruebas aún se encuentra por debajo de un nivel recomendado para proyectos con lógica operativa y alta criticidad en logística.

- **Estado del Quality Gate:** PASSED
- **Porcentaje de Cobertura de Pruebas (Coverage):** 33.1%
- **Duplicación de Código:** 1.8%
- **Problemas Abiertos Totales:** 125
- **Riesgo General:** Moderado

### Interpretación técnica
La métrica principal que condiciona la calificación global es la cobertura de pruebas, que, aunque no bloquea el cumplimiento del Quality Gate, refleja una deuda importante en validación automatizada. El proyecto no presenta un problema crítico de duplicación, lo que indica que la base de código mantiene buena organización y reutilización, pero requiere trabajo adicional para consolidar estabilidad funcional y calidad en la capa de interfaz.

## 2. Métricas Principales

| Categoría | Cantidad Detectada | Severidad | Observación |
| :--- | :---: | :--- | :--- |
| **Bugs** | 116 | Media / Baja | Predominan en la capa de interfaz y comportamiento de eventos |
| **Vulnerabilidades** | 9 | Media | Afectan principalmente seguridad y manejo de secretos |
| **Code Smells** | 27 | Baja | Indicadores de deuda técnica y mantenibilidad |
| **Security Hotspots** | 0 (vista general) | Bajo / revisión | No presenta hotspots relevantes en la vista analítica general |

### Comentario sobre la clasificación
Los indicadores de SonarQube sugieren que la calidad del proyecto está mejor en control estructural que en control operativo. Es decir, el código no presenta un problema de duplicación excesivo ni un estado dramáticamente comprometido de continuidad, pero sí requiere trabajo previo para reducir defectos en UX, accesibilidad y manejo seguro de secretos.

## 3. Análisis Detallado de Calidad

### 3.1 Cobertura de pruebas
La cobertura del proyecto alcanza **33.1%**, valor global que se considera insuficiente para un sistema con foco en logística, rutas, trazabilidad y gestión operativa. En contextos de producción, una cobertura por debajo del 50% implica que la validación automatizada no está reforzando suficientemente la lógica crítica.

**Implicaciones:**
- Existe una base de pruebas, pero no cubre con profundidad los flujos más sensibles.
- El riesgo principal está en regresiones funcionales no detectadas.
- La validación en servicios de negocio, rutas y validaciones de reglas no está aún consolidada.

### 3.2 Duplicación de Código
La duplicación reportada fue de **1.8%**, una métrica favorable del análisis. Esto indica que el proyecto no acumula código repetido de forma excesiva, lo cual favorece mantenibilidad y legibilidad.

**Conclusión:**
- La base del proyecto se encuentra relativamente ordenada.
- El tiempo de mantenimiento es menor que en proyectos con duplicación alta.
- La mayor prioridad no es la eliminación de código repetido, sino la reducción de defectos funcionales y de seguridad.

### 3.3 Deuda Técnica
La deuda técnica observada se manifiesta principalmente en problemas derivados de:
- seguridad de almacenamiento de credenciales,
- uso inseguro de aleatoriedad en contextos sensibles,
- accesibilidad y etiquetas faltantes en la interfaz,
- manejo de eventos no interactivos en componentes del frontend.

El análisis sugiere que la deuda técnica no es crítica en términos de estructura del código, pero sí es relevante para la operatividad, estabilidad y seguridad del producto.

## 4. Evaluación por Tipo de Riesgo

### 4.1 Seguridad
Se detectaron **9 vulnerabilidades** relevantes. Los hallazgos más importantes se concentran en:
- uso inseguro de PRNG en contexto de seguridad,
- credenciales hard-coded.

Esto requiere acción inmediata, porque la seguridad del sistema se ve comprometida si estos valores se mantienen sin control en el código fuente.

### 4.2 Fiabilidad
La categoría con mayor volumen de incidencias es la fiabilidad, con **116 bugs**. Los principales patrones detectados son:
- etiquetas sin texto asociado,
- controles interactivos sobre elementos no interactivos,
- promesas no manejadas,
- expresiones regulares con comportamiento potencialmente inestable.

Esto afecta la calidad de la experiencia del usuario y puede provocar errores funcionales visibles en la interfaz.

### 4.3 Mantenibilidad
La mantenibilidad registra **27 code smells**. Aunque no son críticos por severidad, sí evidencian una deuda técnica que, si se acumula, puede generar problemas futuros en la evolución del producto.

## 5. Plan de Remediación y Deuda Técnica

La deuda técnica reportada por SonarQube no es crítica a nivel estructural, pero sí tiene impacto directo sobre la estabilidad del sistema, la seguridad operativa y la experiencia de usuario. Por ello, la estrategia de corrección debe priorizar primero los riesgos más inmediatos y luego consolidar la calidad en la capa de presentación.

- **Deuda Técnica Estimada:** 2h 30m a 4h de trabajo técnico prioritario para saneamiento inmediato.
- **Impacto esperado:** reducción de riesgo en seguridad, mejora de accesibilidad, menor probabilidad de regresiones y aumento de confianza operativa.

### 5.1 Priorización de correcciones

1. **Seguridad de credenciales y aleatoriedad**
   - Eliminar cualquier secreto hard-coded del repositorio.
   - Moverlos a variables de entorno, configuración segura o gestores de secretos.
   - Reemplazar PRNG inseguros por generadores criptográficamente seguros para tokens, claves, identificadores y valores sensibles.
   - Esta corrección es crítica porque afecta directamente la integridad y la confidencialidad del sistema.

2. **Fiabilidad de la interfaz y manejo de eventos**
   - Corregir etiquetas faltantes en elementos UI y elementos interactivos sin texto asociado.
   - Revisar la lógica de eventos para evitar elementos no interactivos con handlers interactivos.
   - Controlar promesas no manejadas y condiciones de error en la capa frontend.
   - Este punto es esencial para evitar comportamientos inconsistentes y errores visibles para los usuarios.

3. **Cobertura de pruebas y validación funcional**
   - Fortalecer pruebas para módulos críticos de rutas, conductores, vehículos, validaciones y flujo de entregas.
   - Priorizar pruebas unitarias y de integración en las reglas de negocio más sensibles.
   - Aumentar la cobertura de código para reducir riesgo de regresión en futuras entregas.

4. **Mantenibilidad y limpieza de código**
   - Reducir el uso de métodos y propiedades globales en frontend.
   - Refactorizar componentes con responsabilidades superpuestas.
   - Consolidar un patrón de diseño más claro para facilitar mantenimiento y evolución del producto.

### 5.2 Recomendación de ejecución

La prioridad recomendada es:
1. corregir seguridad,
2. revisar fiabilidad y accesibilidad,
3. elevar cobertura de pruebas,
4. limpiar mantenibilidad.

Con este enfoque, el proyecto puede pasar de un estado aprobado a uno más robusto, con menor riesgo operativo y mejor preparación para producción.

## 6. Conclusión

El proyecto **EcoLogistica-Lima** mantiene un nivel de calidad técnico **aceptable y aprobado por el Quality Gate**, con una buena gestión de duplicación y una estructura general razonable. Sin embargo, la calidad no puede considerarse plenamente madura porque aún persisten deficiencias en cobertura de pruebas, seguridad y fiabilidad de interfaz.

La recomendación principal es priorizar la reducción de deuda técnica en tres frentes: seguridad de secretos y aleatoriedad, accesibilidad y fiabilidad de la UI, y ampliación de pruebas automatizadas. Con estas acciones, el proyecto puede avanzar de un estado aceptable a un estado más sólido, estable y preparado para producción.

[← Volver al README Principal](../../README.md)
