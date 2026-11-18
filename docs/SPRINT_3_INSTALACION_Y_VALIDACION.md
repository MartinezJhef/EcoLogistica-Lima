# Integración funcional hasta Sprint 3

Esta rama corrige el flujo de vehículos/conductores → pedidos/preferencias → planificación → itinerario móvil. No añade funciones del Sprint 4.

## Comportamiento

- Web y móvil usan FastAPI y la misma base PostgreSQL/PostGIS. Ya no escriben directamente en Supabase ni fabrican registros cuando falla el guardado.
- Se comprueba contraseña, cuenta activa y permisos en el servidor. Las cuentas de demostración no permiten saltarse el inicio de sesión. Los hashes SHA-256 antiguos válidos se actualizan al entrar; los hashes ficticios requieren restablecer la cuenta.
- El planificador explora asignaciones e inserciones factibles para aumentar el número de pedidos atendidos y compara alternativas según distancia, tiempo y CO₂; comprueba peso/volumen al 85–90 %, acceso del cliente, horario completo de entrega, espera, retorno, descansos y jornada. Si no puede verificar la selección dentro del plazo, aborta sin guardar una solución parcial presentada como máximo. La ponderación de distancia, tiempo y CO₂ guía la búsqueda; no se certifica un óptimo global de esas tres métricas.
- El cliente autenticado consulta únicamente sus pedidos y modifica horarios, acceso, referencia, teléfono y fotografía en web o móvil. Se bloquea la edición en tránsito. Oficina puede asociar una cuenta al registrar el pedido. Los pedidos antiguos sin dueño no se atribuyen a una persona supuesta.
- Una dirección escrita se geocodifica antes de guardar; si no se localiza, se exige seleccionar el destino manualmente o reintentar. Las alertas revisan la geometría atravesada, además de las paradas.
- Se reserva un conductor y un vehículo por ruta activa; no se reutiliza el mismo conductor para varios vehículos. Los pedidos no asignados conservan un motivo real, sin atribuir todos los fallos a capacidad.
- Los recorridos se consultan sobre calles mediante OSRM. Se guarda la geometría devuelta y se rechazan los trayectos que crucen un cierre o una ZBE restringida. Si no se verifica una alternativa, se conserva el recorrido anterior.
- Oficina marca un área de cierre o demora sobre el mapa. La información de tráfico es **reportada por oficina**, no una fuente de tráfico en vivo. Las incidencias persisten hasta que oficina indica que se resolvieron.
- Se puede cancelar una entrega o insertar un pedido urgente, volviendo a comprobar las restricciones. En ejecución hay que indicar posición, hora, tiempo transcurrido y conducción continua; no se reinicia ficticiamente la jornada.
- En una avería se pueden redistribuir entregas entre los vehículos disponibles. Si la ruta ya comenzó, hay que confirmar que la carga regresó al depósito; el sistema no presupone una transferencia física. Si no hay recursos, la operación falla sin cambios parciales.
- Cada itinerario nuevo queda en una cola PostgreSQL hasta que el móvil confirma haberlo guardado. El móvil consulta cada 30 segundos mientras está abierto, conserva la última geometría y paradas sin internet y reintenta las confirmaciones. No es una notificación push con la aplicación cerrada.
- La cola de pedidos confirma únicamente operaciones enviadas, conserva fallos y cambios nuevos, respeta el orden y separa los datos por cuenta. Las entregas actualizan el estado de su ruta.
- Una comprobación manual de jornada no se presenta como una asignación. La reserva efectiva se hace al planificar; al terminar las entregas el conductor confirma el regreso al depósito antes de liberar la ruta. Esa confirmación también puede quedar pendiente sin internet.
- CodeCarbon se conserva como medición opcional de hardware. Si no está disponible, la interfaz indica «No medido»; cero no se presenta como una medición realizada.

El móvil presenta registro, preferencias, entregas y sincronización conectados a la API. Las demostraciones de puja automática y GPS en vivo se retiraron del flujo activo; el seguimiento vivo corresponde a trabajo posterior y no se presenta como terminado.

## Instalación

1. Hacer copia de seguridad de la base antes de aplicar cambios en un entorno existente.
2. Configurar el backend para usar **una sola base de datos**. Si se utiliza Supabase, `DATABASE_URL` debe apuntar a esa misma base PostgreSQL; no a su endpoint REST. Configurar CORS con el origen real de la web.
3. Aplicar `scripts/006_sprint3_route_updates.sql` con un usuario autorizado. Añade columnas y cola, adapta las columnas del esquema original y conserva datos/columnas geográficas anteriores. Docker lo aplica automáticamente solo al crear un volumen nuevo; reiniciar un volumen existente no ejecuta la migración.
4. Configurar `POSTGRES_PASSWORD` para la base y `SECRET_KEY` con un valor aleatorio estable y privado. Las plantillas dejan ambos valores vacíos: no contienen credenciales utilizables. Sin clave de sesión configurada se usa una clave temporal que invalida sesiones al reiniciar; Docker exige configurar ambos valores antes de arrancar.
5. En una instalación nueva, ejecutar `python bootstrap_admin.py` dentro de `src/backend` para crear el administrador; solicita correo y contraseña sin imprimirla. Para cuentas antiguas con hashes ficticios, restablecer sus contraseñas desde un administrador válido.
6. Configurar `VITE_API_URL` al compilar la web. Para el móvil usar `--dart-define=API_BASE_URL=https://servidor/api/v1` o «Conexión con EcoLogística» en el inicio de sesión. El valor predeterminado `10.0.2.2` sirve para el emulador Android, no para un teléfono físico.
7. Vincular cada usuario repartidor con su conductor desde Administración. Registrar y verificar la fecha de vencimiento de las licencias; las fechas antiguas desconocidas quedan vacías y no permiten asignar rutas. Completar altura y clasificación de acceso en la edición de vehículos; una característica desconocida no se considera compatible por defecto.
   Registrar una ficha de conductor o cliente no crea una cuenta con contraseña compartida. El administrador crea y vincula las cuentas de acceso explícitamente.
8. Configurar `OSRM_URL` con un servicio propio para uso del equipo. El servidor público predeterminado se usa para pruebas pequeñas, limita las consultas y no ofrece garantías de disponibilidad. La búsqueda de asignaciones tiene un plazo de 35 segundos y las consultas viales uno de 40 segundos; ante un fallo no se guardan rutas ficticias. Véase la [API oficial de OSRM](https://project-osrm.org/docs/v5.5.2/api/).
9. Si se despliega en Supabase, revisar/cerrar el acceso anónimo antiguo mediante RLS antes de publicar: retirar las llamadas directas de la app no cambia las políticas existentes de la base. No se modificaron políticas de una base real desde esta rama.

La web y las pruebas usan Node 24, Vite 8.3.8 y Vitest 5.1.0.

## Comprobación antes de publicar

- Ejecutar `pytest` en `src/backend`, `npm ci && npm run test:coverage && npm run build` en `src/frontend` y `flutter pub get`, `flutter analyze --no-fatal-infos`, `flutter test --coverage` en `src/mobile`.
- El workflow `sprint3-validation.yml` aplica el esquema original y la migración dos veces en PostGIS desechable, prueba el flujo con geometría real de PostgreSQL y ejecuta las pruebas móviles. Exige 80 % de cobertura móvil con `dart run tool/check_coverage.dart`, prepara el APK de depuración y el despliegue/aceptación Docker desechable. No aplica cambios a una base compartida.
- La prueba real de PostGIS local se activa con `POSTGRES_TEST_URL`, únicamente contra una base desechable cuyo nombre termine en `_test`. Sin esa variable se omite; las pruebas restantes usan SQLite en memoria y un proveedor vial controlado.
- Comprobar en un entorno de pruebas y un teléfono: registrar pedido → generar ruta → ver itinerario → marcar cierre → recibir revisión → desconectar → conservar recorrido → registrar entrega → reconectar → confirmar sincronización sin duplicados.
- Probar las cuentas y datos existentes tras migrar; las cuentas móviles no deben recibir pedidos ajenos. No se asignaron automáticamente pedidos antiguos sin dueño a un cliente supuesto.
- El análisis móvil con Flutter 3.50 informa usos de Material/Cupertino obsoletos heredados. Se comprueba que no existan errores ni advertencias; la actualización visual de todo Flutter no forma parte de esta corrección.

La validación local y las pruebas automáticas no sustituyen una instalación comprobada en la base real y dispositivos del equipo. No se da por cerrado el Sprint 3 ni se modifica Jira desde esta rama.

## Verificación automatizada del entorno de pruebas

El trabajo `staging` del workflow crea credenciales temporales, compila y levanta Docker, espera la migración, crea un administrador de prueba y ejecuta `scripts/sprint3_staging_smoke.py`. Destruye sus contenedores y volumen al terminar. No usa credenciales ni datos del entorno compartido.

El APK de depuración se genera como artefacto de CI para pruebas; su conexión predeterminada sirve al emulador. Configurar el servidor en la pantalla de acceso para probar en otro dispositivo. No es una publicación en una tienda ni una compilación iOS verificada.
