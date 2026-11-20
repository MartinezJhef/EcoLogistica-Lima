# Revisión del sprint

**Nombre del Proyecto:** EcoLogística Lima.
**Líder del Proyecto:** Rol ficticio de facilitador para este ejercicio.

Este documento es una presentación de resultados simulados de review y retrospectiva. No acredita una reunión celebrada, asistentes reales, aceptación de stakeholders ni compromisos asumidos por integrantes. Fecha de elaboración del ejercicio: 20/11/2026.

## Historias de Usuario completadas en este Sprint

| Historia | Implementación y evidencia técnica real usada en el ejercicio |
|---|---|
| US-008 Dashboard | Indicadores por periodo, comparación y conservación de parámetros históricos. [PR 13](https://github.com/MartinezJhef/EcoLogistica-Lima/pull/13) |
| US-009 Reportes | Cola persistente, generación y descarga privada PDF; recorrido publicado aprobado. [Validación final](07%20Validaci%C3%B3n%20final%20de%20producci%C3%B3n%20V_1_0_0.md) |
| US-010 Compensación | Factores configurables y distribución al 100 %. Configuración simulada aplicada con fuente y proyectos identificados como simulados. [Configuración](evidencias/configuracion-ambiental-simulada.json) |

## Demostración del trabajo completado

Guion propuesto: ingresar como administración, consultar Sostenibilidad, mostrar indicadores del periodo de prueba, generar y descargar PDF y preparar una distribución de compensación 60/40. Mostrar también el rechazo de porcentajes que no sumen 100 %. La web está publicada en https://ecologistica-web.onrender.com.

Retroalimentación ficticia para ensayar la sesión: el rol de oficina pide distinguir rutas planificadas de completadas; el rol de consulta ambiental solicita que las propuestas indiquen fuente y horizonte; el rol de administración pide conservar tarifas históricas. Son ejemplos de discusión, no comentarios recogidos de personas. La implementación ya contiene esos controles y advertencias documentados.

## Pendientes

Para el ejercicio, el incremento técnico se presenta con sus pruebas aprobadas. Para la aceptación real faltan la sesión del equipo y sus acuerdos, los cuestionarios SUS reales y la sustitución de parámetros ficticios por valores con fuentes verificables. La configuración actual sirve para demostración académica.

# Retrospectiva del sprint

**Nombre del Proyecto:** EcoLogística Lima.
**Líder del Proyecto:** Rol ficticio de facilitador para este ejercicio.

## ¿Qué aprendimos?

Las fechas de operación deben usar Lima independientemente de UTC del servidor. Las entregas con foto deben respetar las mismas transiciones que el resto de la API. Reoptimizar exige conservar el prefijo completado y las tarifas necesitan instantáneas históricas. Estas lecciones proceden de correcciones técnicas verificadas.

## ¿Qué estamos haciendo bien?

Separación cliente/servidor, permisos en la API, reportes persistidos, CI y pruebas en tres navegadores, publicación automática y evidencias del recorrido publicado.

## ¿Qué podemos hacer mejor?

### Personas

Ensayar el uso del sistema por cada rol y explicar el significado de los indicadores antes de recoger cuestionarios.

### Relaciones

Confirmar contratos entre interfaz, API y móvil y registrar observaciones en una sesión real.

### Procesos

Probar el recorrido completo en producción después de cada cambio funcional y conservar la relación entre commit, workflow y evidencia.

### Herramientas

Mantener las credenciales en Secrets, comprobar despliegues y distinguir los valores simulados de datos operativos.

### Acciones a realizar

Plan ficticio para practicar la retrospectiva; los responsables son roles propuestos, sin atribuir compromisos a personas.

| Acción propuesta | Rol propuesto | Plazo relativo | Criterio verificable |
|---|---|---|---|
| Revisar factores y fuente | Administración | Antes de uso operativo | Todos los factores con fuente y vigencia aprobadas |
| Ejecutar cinco evaluaciones reales | Facilitación | Antes de cierre académico definitivo | Cinco cuestionarios completos y cálculo reproducible |
| Comprobar entrega y PDF tras cambios | Pruebas | Después de cada publicación funcional | Recorrido aprobado y evidencia guardada |
| Registrar review y retrospectiva reales | Documentación | Al celebrar cada sesión | Fecha, asistentes, feedback y acuerdos confirmados |

[← Volver al README principal](../../../README.md)
