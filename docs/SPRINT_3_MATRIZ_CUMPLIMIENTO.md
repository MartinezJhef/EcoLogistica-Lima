# Criterios de aceptación de Sprints 1–3

Fuente: `docs/02 Planificación/01 Transformando a ágil V_1_0_0.md`, US-001 a US-007 y DoD global. La columna de evidencia describe comprobaciones realizadas, no sustituye la aprobación del equipo.

| Historia | Comportamiento comprobado | Evidencia |
|---|---|---|
| US-001 Vehículos | Registro validado, placa duplicada rechazada, parámetros ambientales y acceso editables | Tests backend US001/Sprint1, pruebas de interfaz de vehículos y registro HTTP contra PostGIS |
| US-002 Conductores | Licencia vigente, perfil y origen, jornada 7,5 + 1,5 bloqueada, disponibilidad y reserva de conductor | Tests US002, integración Sprint3 y pruebas de formulario |
| US-003 Pedidos/GPS | Dirección geocodificada o punto manual verificado, peso/volumen positivos, horario válido, persistencia confirmada | Tests de pedidos, pantallas móviles y flujo HTTP real |
| US-004 Preferencias | Cuenta propia, horarios/acceso/referencia/foto, edición bloqueada en tránsito y restricciones aplicadas al plan | Tests de cliente web/móvil, aislamiento de API y planificación |
| US-005 Optimización | Capacidades, jornada/esperas/retorno/descansos, distancia/tiempo/CO2, selección de recursos y cargas | Integración y pruebas de planificador; casos de tres cargas pequeñas y vehículo mayor; ruta OSRM real |
| US-006 Mapa | Geometría vial y secuencia, zonas/alertas al cruzar riesgo y conservación del itinerario sin conexión | Tests de mapas web, dibujado móvil y geometría PostGIS/OSRM |
| US-007 Cambios de ruta | Incidencias/cierres, cancelación/urgencia/avería, cola hasta confirmación del conductor y reintentos | Tests de reoptimización, cola/sincronización y flujo HTTP de notificación/confirmación |

Los plazos de consulta y límites operativos se documentan en `SPRINT_3_INSTALACION_Y_VALIDACION.md`. Si la búsqueda no puede verificar su resultado dentro del plazo, falla sin guardar asignaciones parciales. No se certifica óptimo global de distancia/tiempo/CO2 ni disponibilidad de proveedores públicos externos.

Las pruebas y coberturas locales cumplen sus umbrales. Falta la ejecución de CI/despliegue compartido y el PR aprobado por un compañero para considerar satisfecho todo el DoD. Ver `SPRINT_3_RESULTADOS_DE_PRUEBAS.md`.
