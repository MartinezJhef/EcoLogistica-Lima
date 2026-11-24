# Registro, roles y reportes

## Entrar con otro rol

No se elige el rol en el login. Administración crea la cuenta en **Administración → Nuevo Usuario**, asigna rol y permisos y entrega sus credenciales por un medio privado. Para entrar con ella se cierra la sesión actual y se utiliza su correo y contraseña. El rol se reconoce automáticamente.

- ADMIN administra usuarios, factores y módulos y consulta los reportes existentes.
- OFICINA usa los módulos permitidos y necesita ANALITICA para indicadores y PDF.
- REPARTIDOR debe estar vinculado a un conductor; consulta entregas en web y registra la operación en la aplicación móvil.
- CLIENTE consulta pedidos vinculados a su cuenta y edita preferencias antes del reparto; registra pedidos desde la aplicación móvil.

Una sesión rechazada por el servidor devuelve al login. No debe confundirse con un fallo de base de datos.

## Recorrido de registro a reporte

1. Registrar vehículo disponible y conductor con licencia vigente.
2. Configurar precios y factores ambientales antes de comenzar las operaciones.
3. Registrar el pedido con carga, coordenadas y horario. Vincular su cuenta de cliente cuando corresponda.
4. En Rutas y Despacho pulsar Optimizar Rutas del Día y revisar cualquier pedido sin asignar.
5. Iniciar el reparto: ASIGNADO → EN_TRANSITO → ENTREGADO o NO_ENTREGADO. La ruta debe estar programada para hoy en Lima.
6. Reoptimizar ante incidencias, conservando las entregas ya resueltas.
7. Confirmar regreso al depósito para completar la ruta.
8. En Sostenibilidad seleccionar las fechas de operación, actualizar indicadores, generar PDF y descargarlo cuando esté LISTO.

## Conservación y acceso

Los registros y PDF se conservan en la base de datos del servidor. Cerrar el navegador no los elimina. Los reportes no son públicos para todas las cuentas: oficina lista los propios y administración puede consultar los existentes. Cliente y repartidor no acceden a reportes globales.

CO₂ se expresa en kg de emisiones estimadas; el costo se expresa en PEN. Un eléctrico tiene cero emisiones directas de combustión. Cuando faltan factores históricos el costo se muestra no configurado. La configuración académica usa valores simulados identificados; no son tarifas ni emisiones físicas verificadas. Los nuevos factores no modifican retroactivamente una ruta con instantánea histórica.

## Verificación funcional

Se comprobó el recorrido publicado con registros identificados como prueba: creación, planificación, reoptimización, entrega, regreso, resumen y descarga privada PDF. También se comprobó persistencia desde otra conexión. Las comprobaciones técnicas no sustituyen aceptación de usuarios ni medición física del impacto ambiental.

[← Volver al README](../README.md)
