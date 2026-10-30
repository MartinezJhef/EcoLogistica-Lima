[← Volver al README Principal](../../README.md)

# 04. OWASP V_1_0_0

---

## 1. Información del documento

| Campo | Detalle |
| :--- | :--- |
| **Nombre del Proyecto** | EcoLogistica-Lima: Plataforma Web y Móvil para la Gestión y Optimización de Logística Verde Urbana |
| **Código del Proyecto** | PFA-ECOLIMA-2026 |
| **Integrantes del Equipo** | • Zayuri Cerron Medina <br>• Jheferson Martinez Valerio <br>• Angela Rojas Quispe <br>• Maylit Mendoza Alarcon <br>• Diego Angulo Gonzales |
| **Responsable del Documento** | Maylit Mendoza Alarcon |
| **Fecha de Elaboración** | 30 de octubre de 2026 |
| **Versión** | 1.0.0 |

---

# Reporte de Seguridad OWASP Top 10 (2025)

**Nombre del Proyecto:** EcoLogistica-Lima  
**Herramienta de Escaneo:** SonarQube / SonarCloud

## 1. Matriz de Cumplimiento OWASP Top 10 2025

| Categoría OWASP 2025 | Estado en Proyecto | Hallazgos de SonarQube |
| :--- | :--- | :--- |
| A01:2025-Broken Access Control | Limpio | 0 |
| A02:2025-Cryptographic Failures | Limpio | 0 |
| A03:2025-Injection | Limpio | 0 |
| A04:2025-Insecure Design | Limpio | 0 |
| A05:2025-Security Misconfiguration | Limpio | 0 |
| A06:2025-Vulnerable and Outdated Components | Limpio | 0 |
| A07:2025-Identification and Authentication Failures | Limpio | 0 |
| A08:2025-Software and Data Integrity Failures | Limpio | 0 |
| A09:2025-Security Logging and Monitoring Failures | Limpio | 0 |
| A10:2025-Server-Side Request Forgery (SSRF) | Limpio | 0 |

## 2. Detalles de Security Hotspots y Vulnerabilidades Críticas

### Hotspot #1: Evaluación actual sin hallazgos críticos
En la última ejecución de SonarQube, la propuesta no reporta vulnerabilidades ni hotspots abiertos en la clasificación de seguridad del proyecto. El análisis refleja un estado de seguridad saludable para la versión actual del sistema.

**Riesgo:** bajo, según la evidencia del escaneo actual.

**Mitigación recomendada:**
- mantener la vigilancia en cada análisis,
- reforzar pruebas de seguridad en nuevas funcionalidades,
- conservar la política de gestión de secretos en ambientes de desarrollo y producción.

### Hotspot #2: Mantenimiento del nivel de calidad de seguridad
La revisión demuestra que el proyecto ha superado la etapa de riesgos de seguridad más frecuentes en la clasificación OWASP. El siguiente paso es mantener ese nivel y asegurar que futuras incorporaciones no vuelvan a introducir secretos, fallas de autenticación o riesgos de integridad.

**Riesgo:** controlado y preventivo.

**Mitigación recomendada:**
- continuar con escaneos automáticos en la pipeline,
- revisar cualquier cambio de dependencias o autenticación,
- validar accesos y secretos antes del despliegue final.

### Otros puntos de revisión
La seguridad del sistema en la revisión actual se presenta bajo control, con ausencia de hallazgos críticos o abiertos en las categorías principales del OWASP Top 10 2025. La recomendación principal es mantener esta estabilidad mediante análisis continuo y pruebas de regresión.

## 3. Evaluación global del riesgo

La evaluación del proyecto muestra que el riesgo de seguridad es **bajo** en el análisis actual. El Quality Gate ha sido aprobado y los indicadores de SonarQube corroboran que no existen incidencias abiertas relevantes en seguridad para la versión analizada.

### Conclusión
El proyecto presenta una evaluación de seguridad global sólida, con un Quality Gate aprobado y sin hallazgos relevantes del OWASP Top 10 2025 en la ejecución actual. La estrategia recomendada es mantener las revisiones automáticas y reforzar la validación de seguridad en cada nueva funcionalidad que se incorpore.

[← Volver al README Principal](../../README.md)
