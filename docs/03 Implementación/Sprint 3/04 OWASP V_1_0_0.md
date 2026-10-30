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

### Hotspot #1: Uso de PRNG en contexto de seguridad
El primer hallazgo relevante corresponde a la categoría **A02:2025-Cryptographic Failures**. SonarQube reporta el uso de generadores pseudoaleatorios no seguros para contextos que requieren aleatoriedad criptográfica. Esto puede afectar la generación de tokens, validaciones temporales, identificadores o cualquier mecanismo que dependa de valores aleatorios para asegurar la integridad del sistema.

**Riesgo:** pérdida de seguridad en mecanismos de autenticación, validación o control de sesión.

**Mitigación recomendada:**
- reemplazar funciones no seguras por generadores criptográficamente fuertes,
- revisar cada punto donde se genere un valor confidencial,
- aplicar pruebas específicas para confirmar que los valores producidos cumplen con seguridad criptográfica.

### Hotspot #2: Credenciales hard-coded
El segundo hallazgo principal corresponde a **A07:2025-Identification and Authentication Failures**. La presencia de credenciales escritas directamente en el código fuente representa un riesgo alto de exposición accidental, especialmente cuando el repositorio se comparte o se despliega sin una Política de secretos adecuada.

**Riesgo:** exposición de datos, escalamiento de privilegios o compromiso del entorno.

**Mitigación recomendada:**
- mover secretos a variables de entorno,
- usar gestores de secretos en infraestructura,
- reforzar estándares de configuración y revisión de código antes del despliegue.

### Otros puntos de revisión
Aunque no se encontraron hallazgos de inyección, SSRF ni configuraciones visibles de alto riesgo en esta revisión, el proyecto debe mantener vigilancia continua porque la infraestructura de logística y gestión de flotas puede incorporar nuevos componentes y servicios que agraven la superficie de ataque en futuras versiones.

## 3. Evaluación global del riesgo

La evaluación del proyecto muestra que el riesgo de seguridad es **moderado y controlable**, no crítico en magnitud, pero sí relevante en el corto plazo. El análisis del Quality Gate no bloquea la entrega, pero los hallazgos actuales indican que la solución aún necesita reforzar la protección de credenciales y la generación segura de valores aleatorios.

### Conclusión
El proyecto presenta una evaluación de seguridad global aceptable, con un Quality Gate aprobado, pero con riesgos moderados concretos en la categoría A02 y A07 del OWASP Top 10 2025. La corrección de estos hallazgos es crítica para reforzar la postura de seguridad antes de una entrega operativa y reducir la exposición de la solución en entornos reales.

[← Volver al README Principal](../../README.md)
