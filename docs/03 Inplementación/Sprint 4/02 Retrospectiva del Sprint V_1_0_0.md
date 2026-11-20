[← Volver al README principal](../../../README.md)

# 01. Retrospectiva del Sprint V_1_0_0

---

## 1. Información del documento

| Campo | Detalle |
| :--- | :--- |
| **Nombre del Proyecto** | EcoLogistica-Lima: Plataforma Web y Móvil para la Gestión y Optimización de Logística Verde Urbana |
| **Código del Proyecto** | PFA-ECOLIMA-2026 |
| **Integrantes del Equipo** | • Zayuri Cerron Medina <br>• Jheferson Martinez Valerio <br>• Angela Rojas Quispe <br>• Maylit Mendoza Alarcon <br>• Diego Angulo Gonzales |
| **Responsable del Documento** | Maylit Mendoza Alarcon |
| **Fecha de Elaboración** | 19 de noviembre de 2026 |
| **Versión** | 1.0.0 |

---
<br><br>

## ¿Qué aprendimos?

Durante el Sprint 4 identificamos varios aspectos técnicos que debemos considerar para mejorar el funcionamiento y mantenimiento del sistema:

- **Reoptimización del dashboard:** cuando se vuelve a calcular una ruta, es necesario conservar el avance que ya se había completado y evitar que los kilómetros recorridos se contabilicen dos veces.
- **Conservación de datos históricos:** los precios y factores ambientales deben mantenerse asociados al periodo en que fueron utilizados, para evitar que los cambios de configuración alteren los resultados de periodos anteriores.
- **Generación de reportes:** utilizar una cola de trabajos persistida permite recuperar las solicitudes de generación de PDF después de un reinicio, sin mantener bloqueada la petición de la aplicación web.
- **Pruebas de conectividad:** las pruebas de desconexión en Firefox demostraron que los tiempos de espera de la red deben considerarse al validar los mensajes de error.

Estas experiencias nos permitieron identificar la importancia de conservar la consistencia de los datos, controlar los permisos y probar los diferentes escenarios antes de publicar los cambios.

## ¿Qué estamos haciendo bien?

Durante el desarrollo del Sprint 4 se identificaron las siguientes prácticas positivas:

- Se reutiliza la lógica de cálculo entre el dashboard y los reportes PDF, evitando mantener implementaciones diferentes para una misma operación.
- Se verifican los permisos desde el servidor, evitando que los usuarios accedan a información que no corresponde a su perfil.
- Se diferencian los valores estimados de los datos medidos, para no presentar estimaciones como resultados reales.
- Se ejecutan pruebas unitarias y pruebas automatizadas de extremo a extremo, incluyendo recorridos en navegadores y verificaciones con PostgreSQL.
- Se realizan revisiones de los cambios mediante Pull Requests antes de integrarlos a la rama principal.


## ¿Qué podemos hacer mejor?

### Personas

- Definir con mayor claridad quién será responsable de revisar los cambios técnicos y quién realizará el seguimiento de los servicios publicados.
- Mejorar la distribución de responsabilidades para evitar que determinadas tareas se concentren en pocos integrantes.
- Realizar un seguimiento periódico del avance de las actividades asignadas.

### Relaciones

- Mejorar la coordinación entre los responsables del frontend y backend, especialmente cuando se modifican cálculos, filtros o respuestas del servidor.
- Revisar conjuntamente los factores ambientales y el significado de los indicadores de ahorro frente al periodo anterior.
- Involucrar a los stakeholders en la revisión de las funcionalidades para recoger observaciones y validar que los resultados respondan a sus necesidades.

### Procesos

- Realizar revisiones por pares antes de integrar cambios en la rama principal (`main`).
- Registrar los commits y las pruebas correspondientes a cada incremento para mantener la trazabilidad.
- Completar la demostración de las funcionalidades antes de dar por cerrado el Sprint.
- Mejorar el seguimiento de las tareas pendientes y actualizar su estado en Jira.

### Herramientas

- Mejorar la configuración de los workflows de integración, pruebas y despliegue para reducir las intervenciones manuales.
- Conservar los reportes de pruebas como evidencias de cada ejecución.
- Realizar verificaciones periódicas del funcionamiento de la aplicación en su URL pública y no limitar las validaciones al entorno local.
- Evaluar las limitaciones del hosting gratuito, especialmente la suspensión del servicio después de periodos de inactividad, para considerarlas durante las pruebas y demostraciones.

### Acciones a realizar

Propuestas de seguimiento según las áreas acordadas previamente; deben ratificarse en la sesión real, no se registran como compromisos ya aceptados para Sprint 4.

| Acción | Responsable propuesto | Evidencia / criterio |
|---|---|---|
| Revisar cálculo e instantáneas | Jheferson | Aprobación técnica y casos de reoptimización verdes antes de integrar |
| Revisar filtros y mensajes con participantes | Angela | Registro de problemas y correcciones verificadas antes de la entrega |
| Ejecutar pruebas en URL pública | Maylit | Informe por navegador y roles, sin ocultar fallos |
| Completar actas con participación real | Zayuri | Fecha, asistentes, feedback y acciones ratificadas |
| Confirmar hosting, factores y participantes | Diego | Accesos configurados, fuentes documentadas y al menos cinco evaluaciones reales |


[← Volver al README principal](../../../README.md)

## Material pedagógico complementario

[Review y retrospectiva simuladas](09%20Review%20y%20retrospectiva%20simuladas%20V_1_0_0.md), con guion, retroalimentación ficticia y acciones propuestas. No sustituye el registro de una sesión real.
