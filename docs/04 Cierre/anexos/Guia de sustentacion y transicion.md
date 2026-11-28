[← Volver al README principal](../../../README.md)

# Sustentación en vivo y transición operativa

Proyecto EcoLogística Lima · Corte 27/11/2026. Este material prepara la sustentación de 20 minutos; **no es guion ni producción del video excluido del encargo**.

## 1. Exposición de gestión y cierre: 10 minutos

| Tiempo | Tema / responsable propuesto | Evidencia que se abre |
|---|---|---|
| 0:00–2:00 | Zayuri: problema, propósito, alcance y estado de aceptación | Reporte final, secciones 1–2. |
| 2:00–4:00 | Diego: cronograma y desviaciones | Reportes de estado/variación; fecha original 05/11 frente a 26/11 y 27/11. |
| 4:00–6:00 | Jheferson: presupuesto/EVM y arquitectura implementada | EVM y tablero; explicar BAC 11467.50, AC simulado 8036.25, CPI 1.4270 y SPI 1.0000. |
| 6:00–8:00 | Maylit: calidad, riesgos y fuentes reales | Validación técnica y Playwright; distinguir 99.58% muestral de SLA mensual. |
| 8:00–10:00 | Angela: radiadores, lecciones y transición | Mood/radiadores rotulados y pendientes de aceptación real. |

Los responsables son propuesta de exposición basada en los roles del proyecto, no un acta de acuerdos. Explicar qué es simulado desde su primera aparición, no solo al final de preguntas.

## 2. Demostración técnica: 10 minutos

| Tiempo | Acción en vivo | Resultado esperado |
|---|---|---|
| 0:00–1:00 | Abrir la web pública e ingresar con cuenta autorizada | Rol reconocido automáticamente; no se muestra contraseña al público. |
| 1:00–2:15 | Mostrar vehículos/conductores, disponibilidad y licencia | Registros persistidos y listados paginados completos. |
| 2:15–3:30 | Mostrar pedido, horario, coordenadas y vínculo de cliente | Validaciones; preferencias antes del reparto. |
| 3:30–5:30 | En entorno desechable, planificar y consultar mapa/itinerario | Ruta vial y asignación; respuesta de API persistida. En producción usar una ruta de prueba existente, sin alterar pedidos de negocio. |
| 5:30–7:00 | Mostrar recepción de itinerario, entrega y regreso en entorno de pruebas | ASIGNADO → EN_TRANSITO → ENTREGADO/NO_ENTREGADO; regreso confirma COMPLETADA. |
| 7:00–9:00 | Sostenibilidad: periodo 24/11/2026 para los registros de prueba conocidos, o periodo con datos completados confirmado antes | Indicadores con unidades y factores simulados visibles; PDF guardado y descarga privada. No presentar 2.90 kg estimados como medición física. |
| 9:00–10:00 | Mostrar compensación, fuente de factores y prueba de acceso por rol | Porcentajes suman 100%; propuesta no implica compra de créditos o árboles plantados. |

Los pasos en un entorno desechable son una alternativa operativa para demostrar escrituras sin afectar datos de producción. Prepararlo y ensayarlo antes de la exposición; no se declara que la sustentación ya ocurrió.

## 3. Preparación, operación y recuperación

Antes de iniciar el cronómetro de la exposición, abrir la web y comprobar la [salud de la API](https://ecologistica-api.onrender.com/api/v1/health). Continuar cuando responda HTTP 200 y `ONLINE`; si aparece un error o no responde, esperar y volver a comprobar. La preparación previa no se cuenta como una medición de disponibilidad o latencia. El [muestreo de preparación del 28/11](../evidencias/monitoreo-preentrega-28nov.json) conserva un timeout real seguido de respuestas correctas; la causa del timeout no se atribuye a suspensión sin comprobar los registros del proveedor.

Confirmar el acceso de las cuentas antes de exponer y mantener sus contraseñas fuera de pantalla. En Sostenibilidad seleccionar un intervalo con rutas completadas; si el panel está vacío, revisar primero fechas y estado de las rutas. Descargar un reporte existente para confirmar acceso privado. Al iniciar una prueba de escritura, usar un entorno desechable o registros etiquetados como prueba y autorización previa, conservando las validaciones de la aplicación. Si el servicio sigue sin responder, usar la instalación local preparada según la guía de instalación; no presentar resultados locales como disponibilidad del alojamiento público.

- Enlaces: web https://ecologistica-web.onrender.com ; API https://ecologistica-api.onrender.com/docs . Abrir con anticipación para detectar suspensión del servicio gratuito.
- Repositorio: revisar README, los siete reportes y el workflow del commit que se presentará. Si GitHub muestra una ejecución posterior, comprobar su estado antes de afirmar aprobación.
- Instalación: seguir `docs/SPRINT_3_INSTALACION_Y_VALIDACION.md`, la guía de despliegue del Sprint 4 y `docs/GUIA_DE_USO_Y_REPORTES.md`.
- Cuenta de cliente/repartidor: debe crearse con autorización de administración. Cliente se vincula a sus pedidos; repartidor a su conductor. No hay selector libre de roles en login.
- Parámetros: conservar fuente, vigencia y unidades. Mantener simulados los factores del demo hasta que se proporcionen datos reales verificados.
- Credenciales: entregar por canal privado; los reportes y el ZIP no deben contener contraseñas, tokens ni cadenas de base de datos.
- Recuperación: conservar esquema/migraciones y respaldo privado de base; probar restauración en entorno separado antes de borrar o sustituir producción. No hay restauración productiva nueva ejecutada en este cierre documental.
- Caída de red: mostrar error y reintento; usar el entorno local ensayado y explicar el cambio de entorno. No usar una imagen para aparentar una ejecución en vivo.

## 4. Cierre administrativo y soporte propuestos

Zayuri coordina la aceptación; Jheferson el traspaso técnico; Maylit la verificación; Angela la capacitación; Diego las comunicaciones. Registrar la aceptación real, observaciones, responsables y fecha. Proponer soporte durante 30 días, sujeto a aceptación del equipo, y una revisión de acceso/recursos gratuitos al finalizarlo.

No consta firma del patrocinador, capacitación realizada ni cierre contractual certificado. El video y su carpeta no fueron creados por instrucción del usuario.

[← Volver al README principal](../../../README.md)
