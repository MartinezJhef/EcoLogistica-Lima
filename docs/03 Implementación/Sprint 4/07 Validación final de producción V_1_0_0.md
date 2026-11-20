# Validación final publicada — 20/11/2026

Web: https://ecologistica-web.onrender.com

La API y la web publicaron correctamente el commit main `d8de9498b69d4e7acbcc53c06a0bcdb50b3ab62b`. API: despliegue `dep-dc06drajnfac7393dj4g`; web: `dep-dc06esavcj2c739jqa2g`. Render confirmó Deploy succeeded / Live. La publicación manual inicial fue seguida por el despliegue automático aprobado en GitHub Actions.

El recorrido publicado aprobó: acceso, registro del pedido, planificación, trazado vial, emisiones directas de vehículo eléctrico, bloqueo de cierre con entrega pendiente, reoptimización, bloqueo de preferencias en tránsito, entrega, retorno, ruta completada en analítica, generación PDF, descarga privada y rechazo de acceso al PDF sin sesión. Vehículo y conductor de prueba quedaron inactivos al finalizar. Los registros son sintéticos e identificados como PRUEBA FUNCIONAL.

Evidencia: [recorrido completo](evidencias/recorrido-produccion.json), [PDF generado](evidencias/reporte-prueba-publicada.pdf), [comprobaciones públicas](evidencias/disponibilidad-publica.json). Las ocho comprobaciones de disponibilidad, CORS y acceso sin sesión aprobaron también.

Pendientes de la rúbrica: factores operativos reales, cinco cuestionarios SUS reales y sesiones de review/retrospectiva con evidencia. El recorrido técnico aprobado no acredita estas actividades.


[← Volver al README principal](../../../README.md)

## Despliegue automático comprobado

[Deploy production — ejecución 44764670259](https://github.com/MartinezJhef/EcoLogistica-Lima/actions/runs/44764670259) terminó con success el 20/11/2026. Validó CI y Tests del mismo commit y publicó API y web mediante la API de Render. Se configuraron los tres secretos requeridos; la clave tiene lectura de servicios y despliegues y permiso para ejecutar despliegues. No tiene permisos de modificación de variables, bases ni facturación.
