# Revisión de datos incluidos en esta rama

La rama se dirige al mismo repositorio de origen, con autorización expresa de su colaborador. La publicación no debe incluir archivos `.env`, bases de datos, sesiones del navegador ni registros del equipo.

- Se retiraron del código las claves públicas antiguas de Supabase y los endpoints REST específicos de esa instalación. Web y móvil se conectan a la API configurada.
- Se retiraron los catálogos de cuentas de producción con nombres, teléfonos y correos de demostración, y la creación de cuentas con una contraseña compartida.
- Se retiró la creación automática de cuentas predeterminadas en el servidor. El administrador se crea explícitamente con una contraseña solicitada sin imprimirla.
- Las plantillas de entorno dejan las contraseñas y la clave de sesión vacías. Docker exige valores configurados por quien instala. El backend no contiene una contraseña de base ni una clave de sesión fija como alternativa.
- Los archivos de pruebas contienen contraseñas ficticias para verificar el inicio de sesión y datos sintéticos; no son credenciales de una cuenta externa. Las nuevas cuentas de pruebas usan el dominio reservado `example.test`. Las pruebas se excluyen de la imagen del servidor.
- El servidor usado para la revisión visual es un archivo temporal fuera del repositorio, usa SQLite en memoria y no se incluye en la rama.
- No se copiaron datos de Jira, archivos descargados del usuario, datos de una base compartida ni credenciales del navegador. Los registros y dependencias de las pruebas locales también quedan fuera del repositorio.

La migración incluida es código para revisión: no se ejecutó contra la base compartida ni cambia las políticas de Supabase por publicar la rama.
