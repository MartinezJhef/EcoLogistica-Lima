[← Volver al README Principal](../../../README.md)

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

**Corte:** 30/10/2026 — Sprint 3 cerrado satisfactoriamente.  
**Método:** revisión estática documental y de código en main, base [4d801b7](https://github.com/MartinezJhef/EcoLogistica-Lima/commit/4d801b741ba2510358f111d0594ec853cb1f88ba). No se ejecutó un nuevo escaneo SonarQube/SonarCloud ni una prueba de penetración.

## 1. Matriz de revisión OWASP Top 10 2025

Se corrigen categorías según la [lista oficial OWASP 2025](https://top10.owasp.org/2025/). “Sin conclusión” indica que la revisión no permite acreditar ausencia de vulnerabilidades; reemplaza la calificación “Limpio” basada únicamente en ceros.

| Categoría OWASP 2025 | Estado de revisión | Evidencia y alcance |
| :--- | :--- | :--- |
| A01 — Broken Access Control | Requiere mejora | Los endpoints de usuarios revisados no declaran autorización por usuario; verificar protección efectiva y permisos del servidor |
| A02 — Security Misconfiguration | Requiere mejora | Configuración con valores sensibles por defecto; exigir configuración externa para despliegue |
| A03 — Software Supply Chain Failures | Sin conclusión | No se realizó análisis de dependencias ni de cadena de suministro |
| A04 — Cryptographic Failures | Requiere mejora | Hash SHA-256 directo para contraseñas en user_service.py |
| A05 — Injection | Sin conclusión | La inspección parcial no sustituye pruebas de entradas e inyección |
| A06 — Insecure Design | Revisión parcial | Separar inicialización de cuentas de demostración de la operación real |
| A07 — Authentication Failures | Requiere mejora | Cuentas con contraseñas definidas en código; revisar ciclo de autenticación y sesión |
| A08 — Software or Data Integrity Failures | Sin conclusión | No se verificaron integridad de actualizaciones ni despliegue |
| A09 — Security Logging and Alerting Failures | Sin conclusión | No se validaron registros y alertas de seguridad en ejecución |
| A10 — Mishandling of Exceptional Conditions | Sin conclusión | Ampliar pruebas de errores, recuperación y estados excepcionales |

## 2. Detalles de hallazgos y medidas de mejora

### 2.1 Autorización de operaciones administrativas

En [usuarios.py](../../../src/backend/app/api/v1/endpoints/usuarios.py), las funciones de consulta, creación, edición y eliminación revisadas reciben la dependencia de base de datos, sin una dependencia de identidad/permisos en esas funciones. La presencia de roles y restricciones visuales no demuestra autorización efectiva en la API.

**Acción propuesta:** verificar dependencias globales y middleware, exigir identidad y permisos por operación y conservar pruebas 401/403 para usuarios anónimos y roles no autorizados. No se afirma explotación comprobada.

### 2.2 Protección de contraseñas y configuración

[user_service.py](../../../src/backend/app/services/user_service.py) utiliza SHA-256 directo y contiene inicialización de cuentas de demostración con contraseñas en código. [config.py](../../../src/backend/app/core/config.py) admite variables de entorno, pero también valores predeterminados sensibles.

**Acciones propuestas:** adoptar hash adaptativo con sal, separar datos de demostración del despliegue, exigir secretos externos sin valores sensibles de respaldo y rotar credenciales si fueron utilizadas fuera del entorno de prueba. No se reproducen credenciales en este informe.

### 2.3 Trazabilidad del reporte previo

El antecedente documental consignaba siete incidencias de PRNG y dos de credenciales. No se dispone aquí de identificadores de reglas, ubicaciones y export del análisis que permitan confirmar ese reparto. Se conserva como antecedente, sin presentarlo como nuevo resultado ni denominarlo “hotspot” confirmado.

La aleatoriedad solo se clasifica como fallo criptográfico tras verificar su uso sensible. No corresponde asignar riesgo criptográfico a toda aleatoriedad de simulación o presentación. Tampoco se interpreta “0” hallazgos de una herramienta como prueba de seguridad de una categoría completa.

## 3. Evaluación global del riesgo

El estado documental **Quality Gate PASSED** se conserva según [03 Calidad de código](03%20Calidad%20de%20c%C3%B3digo%20V_1_0_0.md); no certifica seguridad integral. La autorización administrativa y el almacenamiento de contraseñas requieren atención prioritaria antes de exposición operativa. No se asigna una severidad global cuantificada sin validar alcance y entorno.

| Mejora continua | Responsable propuesto | Verificación de la acción |
| :--- | :--- | :--- |
| Autorización efectiva en API | Backend / QA | Pruebas negativas de acceso y de aislamiento por rol |
| Hash adaptativo y secretos externos | Backend | Pruebas de autenticación y configuración sin secretos de respaldo |
| Análisis reproducible de seguridad | Equipo / QA | Reporte con commit, herramienta, reglas, ubicaciones y remediaciones verificadas |

### Conclusión

El **Sprint 3 permanece cerrado satisfactoriamente al 30/10/2026**, con US-005, US-006 y US-007 completadas. Los hallazgos se registran como deuda técnica y mejora continua posterior al cierre. Esta actualización corrige la clasificación y mejora la trazabilidad; no declara remediaciones implementadas ni certifica el cumplimiento integral de RNF-002.

[← Volver al README Principal](../../../README.md)
