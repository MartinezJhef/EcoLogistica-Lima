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
| A02:2025-Cryptographic Failures | Vulnerable | 7 |
| A03:2025-Injection | Limpio | 0 |
| A04:2025-Insecure Design | Bajo Revisión | 0 |
| A05:2025-Security Misconfiguration | Limpio | 0 |
| A06:2025-Vulnerable and Outdated Components | Limpio | 0 |
| A07:2025-Identification and Authentication Failures | Vulnerable | 2 |
| A08:2025-Software and Data Integrity Failures | Limpio | 0 |
| A09:2025-Security Logging and Monitoring Failures | Limpio | 0 |
| A10:2025-Server-Side Request Forgery (SSRF) | Limpio | 0 |

## 2. Detalles de Security Hotspots y Vulnerabilidades Críticas
- **Hotspot #1:** Uso de PRNG en contexto de seguridad; identificado en el código del proyecto y asociado a la regla de SonarQube sobre generadores pseudoaleatorios no seguros. Mitigación: reemplazar por generadores criptográficamente seguros y revisar los puntos donde se generen tokens, identificadores o valores sensibles.
- **Hotspot #2:** Credenciales hard-coded en código fuente; hallazgo reportado por SonarQube y relacionado con el manejo de secretos. Mitigación: mover las credenciales a variables de entorno, secretos de infraestructura o gestores seguros y evitar almacenamiento literal en el repositorio.

### Conclusión
El proyecto presenta una evaluación de seguridad global aceptable, con un Quality Gate aprobado, pero con riesgos moderados concretos en la categoría A02 y A07 del OWASP Top 10 2025. La corrección de estos hallazgos es crítica para reforzar la postura de seguridad antes de una entrega operativa.

[← Volver al README Principal](../../README.md)
