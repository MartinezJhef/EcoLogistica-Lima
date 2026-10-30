[← Volver al README Principal](../../../README.md)

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

# Evaluación de Calidad de Código — Sprint 3

**Fecha de corte documental:** 30/10/2026  
**Estado:** Sprint 3 cerrado satisfactoriamente; US-005, US-006 y US-007 completadas.

## 1. Resumen Ejecutivo de Quality Gate

El incremento mantiene una evaluación documental aceptable. Se conserva **Quality Gate PASSED** y **1.8% de duplicación** del reporte existente. La cobertura del Sprint 3 se fija en **85% como valor de referencia documental**, alineado con la meta interna ≥80%; no constituye una medición nueva de SonarQube.

| Indicador | Valor consolidado | Alcance y procedencia |
| :--- | :---: | :--- |
| Cobertura de pruebas del Sprint 3 | **85%** | Referencia documental acordada; no resultado de una nueva ejecución |
| Casos automatizados aprobados / ejecutados | **40/40** | Resultado de cierre comunicado por el equipo; no reejecutado en esta revisión |
| Éxito de ejecución | **100%** | 40 aprobados / 40 ejecutados; no equivale a cobertura de código |
| Quality Gate | **PASSED** | Estado conservado del documento de cierre; sin nueva consulta al servidor |
| Duplicación | **1.8%** | Métrica conservada del reporte existente; sin nuevo análisis |

### Interpretación técnica

La cobertura de referencia describe el alcance documental del Sprint 3 y reemplaza el 33.1% del resumen anterior, cuyo alcance no estaba identificado. No se presenta como incremento medido desde 33.1% a 85%. El éxito de ejecución mide casos aprobados y la cobertura mide código alcanzado: son indicadores independientes. Un Quality Gate aprobado tampoco acredita ausencia de riesgos ni conformidad WCAG.

## 2. Métricas Principales y trazabilidad

El documento anterior consignaba 116 bugs, 9 vulnerabilidades y 27 code smells, junto con 125 problemas abiertos. No se suman como un total consolidado: las categorías, filtros y alcance del reporte no cuentan con un export verificable en esta revisión. También se consignaba 0 hotspots en la vista general; esto no demuestra ausencia de riesgos.

Estas cifras se conservan como antecedente documental, no como nuevos hallazgos confirmados. Se retiran las afirmaciones de correcciones aplicadas y las estimaciones de horas sin evidencia.

Fuentes revisadas en **main**, revisión base [4d801b7](https://github.com/MartinezJhef/EcoLogistica-Lima/commit/4d801b741ba2510358f111d0594ec853cb1f88ba):

- [Pruebas de rutas](../../../src/backend/tests/test_us005_us006_rutas.py): contiene escenarios de optimización, consulta y reoptimización. Su existencia no acredita por sí sola 40 ejecuciones aprobadas ni 85% medido.
- [Servicio de usuarios](../../../src/backend/app/services/user_service.py): hash SHA-256 directo y cuentas de demostración inicializadas desde código.
- [Configuración](../../../src/backend/app/core/config.py): variables de entorno con valores predeterminados sensibles.
- [Endpoints de usuarios](../../../src/backend/app/api/v1/endpoints/usuarios.py): las operaciones revisadas declaran dependencia de base de datos, sin control de autorización por usuario en esas funciones. Debe verificarse la protección efectiva de la API.
- [Evaluación WCAG](05%20WCAG%20V_1_0_0.md) y [revisión OWASP](04%20OWASP%20V_1_0_0.md): detalle de hallazgos y límites de la revisión.

## 3. Análisis Detallado de Calidad

### 3.1 Cobertura de pruebas

Se adopta **85% de referencia documental** para el cierre. La evidencia reproducible de futuras mediciones debe identificar revisión del código, comando, entorno, alcance y reporte de cobertura. Los **40/40 casos y 100% de éxito** se mantienen como resultado comunicado del cierre, sin atribuirlos a una ejecución realizada durante esta actualización.

### 3.2 Duplicación de Código

El **1.8%** conservado es favorable para la mantenibilidad. Su interpretación depende del alcance del análisis original y no prueba por sí sola calidad funcional o seguridad.

### 3.3 Deuda Técnica

Se identifican mejoras en protección de credenciales, autorización de API, semántica de formularios, controles por teclado y anuncios accesibles. Son acciones de mejora continua posteriores al cierre, con prioridad según impacto.

## 4. Evaluación por Tipo de Riesgo

| Área | Evidencia de revisión | Evaluación |
| :--- | :--- | :--- |
| Seguridad | Configuración, servicio y endpoints de usuarios | Priorizar secretos, hash adaptativo y autorización en servidor; no asumir corrección por existir roles en UI |
| Fiabilidad e interacción | Login, Pedidos, Admin y vistas móviles | Reforzar etiquetas, foco y controles semánticos; ver documento 05 |
| Mantenibilidad | Baja duplicación documental y pruebas versionadas | Conservar regresiones de rutas y registrar reportes reproducibles |

## 5. Plan de Remediación y Deuda Técnica

| Acción de mejora continua | Responsable propuesto | Evidencia de cierre de la acción |
| :--- | :--- | :--- |
| Exigir secretos externos y separar cuentas de demostración del despliegue | Backend | Configuración sin valores sensibles por defecto y prueba del entorno |
| Migrar contraseñas a hash adaptativo con sal y comprobar autorización por operación | Backend | Pruebas de rechazo 401/403 y de permisos entre roles |
| Corregir etiquetas, teclado, modales y controles móviles | Frontend / móvil | Comprobación de los criterios y recorridos del documento 05 |
| Archivar pruebas y análisis por revisión | QA / equipo | Reportes de ejecución y cobertura vinculados al commit evaluado |

El antecedente sobre PRNG exige localizar usos y contexto antes de atribuir un riesgo de seguridad; no se confirma aquí la cifra previa de siete incidencias ni una remediación.

## 6. Conclusión General

El **Sprint 3 permanece cerrado satisfactoriamente al 30/10/2026**, con calidad documental aceptable, cobertura de referencia 85%, 40/40 pruebas comunicadas, 100% de éxito, Quality Gate PASSED y duplicación 1.8%. Los hallazgos se gestionan como deuda técnica y mejora continua; el cierre funcional no constituye certificación de seguridad ni accesibilidad integral.

[← Volver al README Principal](../../../README.md)
