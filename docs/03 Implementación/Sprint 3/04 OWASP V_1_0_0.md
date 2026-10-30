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

| Categoría OWASP 2025 | Equivale a (plantilla de la consigna) | Estado en Proyecto | Hallazgos de SonarQube |
| :--- | :--- | :--- | :--- |
| **A01:2025 Broken Access Control (incluye SSRF)** | **A01 Broken Access Control y A10 SSRF** | **Limpio** | 0; no existen incidencias abiertas actuales |
| **A02:2025 Security Misconfiguration** | **A05 Security Misconfiguration** | **Limpio** | 0; sin hallazgos abiertos en el análisis actual |
| **A03:2025 Software Supply Chain Failures** | **A06 Vulnerable and Outdated Components** | **Limpio** | 0; sin dependencias críticas reportadas |
| **A04:2025 Cryptographic Failures** | **A02 Cryptographic Failures** | **Limpio** | 0; sin hallazgos activos en la ejecución actual |
| **A05:2025 Injection** | **A03 Injection** | **Limpio** | 0; sin inyección SQL, XSS ni comandos detectados |
| **A06:2025 Insecure Design** | **A04 Insecure Design** | **Bajo revisión** | 0; se mantiene revisión manual conforme a diseño y arquitectura |
| **A07:2025 Authentication Failures** | **A07 Identification and Authentication Failures** | **Limpio** | 0; sin credenciales abiertas ni fallas activas |
| **A08:2025 Software or Data Integrity Failures** | **A08 Software and Data Integrity Failures** | **Bajo revisión** | 0; revisión continua de integridad y validación de datos |
| **A09:2025 Security Logging and Alerting Failures** | **A09 Security Logging and Monitoring Failures** | **Bajo revisión** | 0; sin eventos críticos reportados |
| **A10:2025 Mishandling of Exceptional Conditions** | **No existe en la plantilla; reemplaza a SSRF** | **Limpio** | 0; sin incidencias relevantes reportadas |

### Observación relevante
En la última ejecución del análisis, SonarQube reporta **0 vulnerabilidades abiertas, 0 Security Hotspots y 0 bugs de seguridad** para el proyecto. Esto representa una mejora clara respecto a ejecuciones anteriores, en donde sí se documentaron incidencias de seguridad, especialmente en la categoría de autenticación y seguridad criptográfica.

## 2. Detalles de Security Hotspots y Vulnerabilidades Críticas

### Hotspot #1: Riesgo de seguridad resuelto en la última ejecución
La revisión actual no reporta hallazgos críticos de seguridad. Los riesgos anteriormente asociados a credenciales hard-coded y generación insegura de valores aleatorios quedaron resueltos en la última revisión, por lo que la recomendación principal actual es mantener la validación automática en cada cambio del proyecto.

**Riesgo actual:** bajo.

**Mitigación aplicada:**
- revisión de secretos,
- control de autenticación,
- validación de datos y flujo de seguridad,
- continuidad de análisis automatizado.

### Hotspot #2: Mantenimiento de la calidad de seguridad
Aunque la versión actual no presenta vulnerabilidades abiertas, el proyecto aún requiere mantener la disciplina de seguridad en nuevas incorporaciones. Las categorías de diseño, integridad y logging deben seguir revisándose manualmente para asegurar que no entren nuevas brechas en futuras iteraciones.

**Riesgo actual:** controlado y preventivo.

**Mitigación recomendada:**
- ejecutar SonarQube en cada integración o despliegue,
- revisar dependencias antes de merge,
- mantener políticas de secretos y acceso,
- validar que toda nueva funcionalidad pase por revisión de seguridad.

## 3. Resultado del reanálisis

**Resultado del reanálisis (30-10-2026): 0 vulnerabilidades abiertas, 0 Security Hotspots y calificación de seguridad A.** La evolución del proyecto demuestra una mejora significativa en la postura de seguridad y en la calidad del código, reflejada en la reducción de incidencias desde análisis previos hasta la validación actual.

[← Volver al README Principal](../../README.md)
