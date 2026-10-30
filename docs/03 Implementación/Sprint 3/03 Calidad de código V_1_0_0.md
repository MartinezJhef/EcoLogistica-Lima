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
- **Estado del Quality Gate:** PASSED
- **Porcentaje de Cobertura de Pruebas (Coverage):** 33.1%
- **Duplicación de Código:** 1.8%

## 2. Métricas Principales

| Categoría | Cantidad Detectada | Severidad |
| :--- | :---: | :--- |
| **Bugs** | 116 | Media / Baja |
| **Vulnerabilidades** | 9 | Media |
| **Code Smells** | 27 | Baja |
| **Security Hotspots** | 0 (sin evidencia principal reportada en la vista general) | Bajo / revisión |

## 3. Plan de Remediación y Deuda Técnica
- **Deuda Técnica Estimada:** 2h 30m de trabajo recomendado para saneamiento prioritario.
- **Principales hallazgos y acciones correctivas:**
  1. **Generación insegura de valores aleatorios y credenciales hard-coded**: revisar los 7 hallazgos de PRNG y los 2 hallazgos de credenciales embebidas, migrando secretos a variables de entorno y reemplazando generadores no seguros por funciones criptográficamente adecuadas.
  2. **Problemas de fiabilidad en UI y accesibilidad**: corregir etiquetas faltantes y controladores interactivos en elementos no interactivos; estos hallazgos son los más repetidos en SonarQube y afectan la experiencia de uso y la estabilidad del frontend.

### Conclusión
El proyecto cuenta con un Quality Gate en estado aprobado, pero presenta deuda técnica moderada en seguridad y fiabilidad. La prioridad inmediata es reducir la deuda acumulada en accesibilidad de interfaz, manejo seguro de secretos y fortalecimiento de las pruebas automatizadas para elevar la cobertura y disminuir riesgos operativos.

[← Volver al README Principal](../../README.md)
