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

| Categoría OWASP 2025 | Estado en Proyecto | Hallazgos observados | Severidad |
| :--- | :--- | :--- | :--- |
| **A01:2025 - Broken Access Control** | **Limpio** | Sin bypass directo evidenciado en la lógica de acceso actual | **Ninguna reportada por SonarQube** |
| **A02:2025 - Cryptographic Failures** | **Revisión manual pendiente** | Se usan valores por defecto para secretos y conexión a base de datos | **Baja** |
| **A03:2025 - Injection** | **Limpio** | No se evidencian consultas SQL dinámicas ni entrada sin validar | **Ninguna reportada por SonarQube** |
| **A04:2025 - Insecure Design** | **Bajo revisión** | El diseño actual es funcional, pero requiere control en nuevas funcionalidades | **Baja** |
| **A05:2025 - Security Misconfiguration** | **Revisión manual pendiente** | Se detectan secretos y CORS con valores por defecto | **Baja** |
| **A06:2025 - Vulnerable and Outdated Components** | **Limpio** | No se evidencian dependencias críticamente obsoletas en la revisión actual | **Ninguna reportada por SonarQube** |
| **A07:2025 - Authentication Failures** | **Revisión manual pendiente** | Hay usuarios semilla con credenciales simples y predefinidas | **Baja** |
| **A08:2025 - Software and Data Integrity Failures** | **Limpio** | No se evidencian alteraciones de integridad visibles en la capa actual | **Ninguna reportada por SonarQube** |
| **A09:2025 - Security Logging and Monitoring Failures** | **Limpio** | Sin fallas funcionales evidentes de auditoría en la revisión actual | **Ninguna reportada por SonarQube** |
| **A10:2025 - SSRF / Request Forgery** | **Limpio** | No se observan llamadas externas no controladas en la implementación actual | **Ninguna reportada por SonarQube** |

### Observación importante
La última ejecución de SonarQube reporta **0 vulnerabilidades abiertas, 0 Security Hotspots y 0 bugs de seguridad**. Sin embargo, durante la revisión del código se identificaron **observaciones leves de seguridad** relacionadas con la configuración y credenciales por defecto, y estas se registran como riesgos residuales pendientes de hardening, no como hallazgos activos del escáner.

## 2. Hallazgos de revisión manual (leves, pocos y documentados)

### Hallazgo #1: Secretos y configuración por defecto
En [src/backend/app/core/config.py](src/backend/app/core/config.py#L11-L37) se observan valores por defecto para `SECRET_KEY`, `POSTGRES_PASSWORD` y la cadena de conexión de base de datos. Aunque no son reportados como vulnerabilidad por SonarQube en la ejecución actual, en entornos reales estos valores pueden exponer la aplicación si no se externalizan con variables de entorno.

**Severidad:** baja  
**Riesgo:** configuración insegura en despliegues sin variables de entorno adecuadas.

**Mitigación recomendada:**
- mover secretos a variables de entorno,
- usar claves únicas por ambiente,
- no dejar credenciales por defecto en repositorios ni archivos de configuración.

### Hallazgo #2: Credenciales predefinidas y usuarios semilla
En [src/backend/app/services/user_service.py](src/backend/app/services/user_service.py#L12-L84) se crean usuarios iniciales con contraseñas conocidas, incluyendo valores simples como `12345678` y otras credenciales definidas en el código. Esto no aparece como una incidencia del escáner actual, pero sí representa un riesgo de seguridad práctico si la aplicación se despliega sin cambios de seguridad adicionales.

**Severidad:** baja  
**Riesgo:** autenticación vulnerable en ambientes de prueba o despliegue sin hardening.

**Mitigación recomendada:**
- eliminar o reconfigurar usuarios semilla,
- exigir contraseñas complejas y cambiar las credenciales por defecto,
- evitar persistir datos sensibles en el código fuente.

### Hallazgo #3: Uso de SHA-256 para almacenamiento de contraseñas
En [src/backend/app/services/user_service.py](src/backend/app/services/user_service.py#L15-L18), el hash de contraseña se calcula con `hashlib.sha256`. Aunque funciona para un prototipo, no es el mecanismo recomendado para autenticación moderna; lo apropiado sería usar `bcrypt`, `argon2` o un algoritmo de password hashing más robusto.

**Severidad:** baja  
**Riesgo:** menor resistencia frente a ataques de fuerza bruta y cruce de diccionario.

**Mitigación recomendada:**
- migrar a un esquema de hashing fuerte,
- reforzar la política de contraseñas,
- incluir pruebas de validación de seguridad en cada cambio de autenticación.

## 3. Evaluación del riesgo actual

La evaluación del proyecto en SonarQube muestra un estado **saludable** para la ejecución actual: **0 vulnerabilidades abiertas, 0 Security Hotspots y calificación de seguridad A**. Sin embargo, la revisión del código evidenció **3 observaciones leves** que no aparecen como alertas del escáner, pero que sí requieren atención para fortalecer la postura de seguridad del sistema antes de pasar a producción completa.

### Conclusión
El análisis estático no reporta incidencias críticas, pero la revisión manual confirma que aún existen riesgos residuales leves en configuración, autenticación y manejo de secretos. La recomendación principal es cerrar esas observaciones antes del despliegue final o de una etapa de producción real.

[← Volver al README Principal](../../README.md)
