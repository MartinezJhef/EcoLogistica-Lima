# Retrospectiva del sprint

**Nombre del Proyecto:** EcoLogística Lima.

**Líder del Proyecto:** No confirmado para esta sesión. Este documento registra observaciones técnicas y una agenda de mejora; no acredita una reunión del equipo.

## ¿Qué aprendimos?

Reoptimizar cambia el itinerario pendiente: el dashboard debe conservar el prefijo completado sin sumarlo dos veces. Los precios y factores necesitan instantáneas históricas. Generar archivos en una cola persistida permite recuperarse de reinicios sin bloquear la petición web. La desconexión en Firefox puede agotar el plazo de red antes de informar el error; las pruebas deben respetar ese plazo.

## ¿Qué estamos haciendo bien?

Se reutiliza el cálculo en dashboard y PDF, se verifican permisos en servidor, se distinguen estimaciones de mediciones y se muestran costos no configurados cuando falta una tarifa histórica. Se ejecutan pruebas de navegador contra HTTP y PostgreSQL reales, además de las unitarias.

## ¿Qué podemos hacer mejor?

### Personas

Confirmar quién revisa la implementación y quién administra las cuentas de hosting. No se han evaluado desempeño, carga ni opiniones individuales de colaboradores.

### Relaciones

Revisar juntos los factores ambientales, el significado de ahorro frente al periodo anterior y las tareas para la evaluación. Los resultados de automatización no sustituyen comentarios de usuarios.

### Procesos

Aplicar la revisión por pares antes de main, conservar evidencia del commit validado y completar la demostración del incremento antes de cerrar el Sprint en Jira.

### Herramientas

Usar los workflows CI, Tests y Deploy, conservar los reportes como artefactos y medir el servicio público después de publicar. El hosting gratuito suspende actividad tras inactividad y debe evaluarse como entorno académico.

### Acciones a realizar

Propuestas de seguimiento según las áreas acordadas previamente; deben ratificarse en la sesión real, no se registran como compromisos ya aceptados para Sprint 4.

| Acción | Responsable propuesto | Evidencia / criterio |
|---|---|---|
| Revisar cálculo e instantáneas | Jheferson | Aprobación técnica y casos de reoptimización verdes antes de integrar |
| Revisar filtros y mensajes con participantes | Angela | Registro de problemas y correcciones verificadas antes de la entrega |
| Ejecutar pruebas en URL pública | Maylit | Informe por navegador y roles, sin ocultar fallos |
| Completar actas con participación real | Zayuri | Fecha, asistentes, feedback y acciones ratificadas |
| Confirmar hosting, factores y participantes | Diego | Accesos configurados, fuentes documentadas y al menos cinco evaluaciones reales |

V_1_0_0 — 18/11/2026: observaciones técnicas para la retrospectiva pendiente.

[← Volver al README principal](../../../README.md)
