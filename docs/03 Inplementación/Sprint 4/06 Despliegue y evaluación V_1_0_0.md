[← Volver al README principal](../../../README.md)

## Estado verificado al 20/11/2026

Main d8de949 publicado en ambos servicios. El recorrido completo de entrega y PDF aprobó en producción. GitHub Secrets configurados y [Deploy production aprobado](https://github.com/MartinezJhef/EcoLogistica-Lima/actions/runs/44764670259). Las instrucciones siguientes se conservan para reproducir la instalación. Ver [validación final y evidencias](07%20Validaci%C3%B3n%20final%20de%20producci%C3%B3n%20V_1_0_0.md).

# 01. Guía de revisión e integración V_1_0_0

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

# Instalación, despliegue y evaluación del Sprint 4

## Ejecutar en el equipo

1. Configurar `.env` siguiendo el README, con contraseña propia de PostgreSQL y `SECRET_KEY` aleatoria.
2. Ejecutar `docker compose up -d --build`. Una base nueva aplica automáticamente las migraciones 006 y 007.
3. Si la base ya existía, respaldarla y aplicar `scripts/007_sprint4_analytics.sql` con `psql -v ON_ERROR_STOP=1`. Es aditiva e idempotente; no elimina información.
4. Crear la cuenta de administración con `src/backend/bootstrap_admin.py`. No hay contraseñas de demostración incorporadas.
5. En Administración asignar el permiso `ANALITICA` a las cuentas de oficina que lo necesiten. Las cuentas existentes no reciben permisos nuevos silenciosamente.
6. Abrir Sostenibilidad y configurar factores con fuente y vigencia, precios y proyectos. Los factores de prueba no deben adoptarse como tarifas reales.
7. Las nuevas rutas conservan esos parámetros al comenzar. Las rutas históricas sin instantánea muestran costo no configurado; no se inventa su tarifa.
8. Comprobar `docker compose logs report-worker` si un PDF permanece pendiente. Los trabajos y archivos se conservan en PostgreSQL; reiniciar el trabajador no los pierde.

## Publicación gratuita realizada

El 19/11/2026 se publicó la [web](https://ecologistica-web.onrender.com) y la [API](https://ecologistica-api.onrender.com) en Render, con el trabajador PDF en el mismo contenedor y PostgreSQL 16/PostGIS en Neon. Se usaron recursos gratuitos. Ambos servicios publicaron main `2d94d1dac0040fdf1a8723880270bf7641bd2a3c`, después de la aprobación e integración de los PR #12 y #13. Las correcciones posteriores deben verificarse en su propio despliegue.

Se aplicaron el esquema inicial y las migraciones 006 y 007, y se verificaron 17 tablas públicas, incluida la tabla espacial de PostGIS. La conexión privada está guardada en Render, fuera del repositorio. La web muestra el servidor conectado; CORS acepta su origen HTTPS exacto. Una petición de acceso con cuenta inexistente devolvió HTTP 401 tras consultar la base, sin error del servidor. El propietario activó la cuenta de administración. El login y las lecturas autenticadas de analítica, configuración, reportes y usuarios devolvieron HTTP 200. La prueba de ruta publicada detectó el desfase UTC/Lima al iniciar reparto; se añadió una fecha operativa de Lima y pruebas de cambio de día y año.

Para reproducir el despliegue, crear una base vacía, activar PostGIS y aplicar `src/database/init.sql`, `scripts/006_sprint3_route_updates.sql` y `scripts/007_sprint4_analytics.sql`, en ese orden. Mantener las credenciales en variables privadas del proveedor. No cargar los datos de las pruebas E2E.

Al importar el Blueprint de Render, configurar `DATABASE_URL`, `BACKEND_CORS_ORIGINS` con el origen HTTPS exacto de la web y `VITE_API_URL` con la URL HTTPS de la API terminada en `/api/v1`. Crear la cuenta de administración usando la conexión privada a la base. La API y el trabajador usan la misma base.

El plan gratuito de Render se suspende tras inactividad y puede tardar aproximadamente un minuto en despertar: sirve para una entrega académica, pero no demuestra disponibilidad continua ni tiempos menores de 500 ms. El PostgreSQL gratuito de Render expira a los 30 días; por eso el Blueprint no crea esa base temporal automáticamente. Revisar cuotas actuales antes de publicar.

Fuentes consultadas: [Render gratuito](https://render.com/docs/free), [Blueprint](https://render.com/docs/blueprint-spec), [PostGIS en Neon](https://neon.com/docs/extensions/postgis).

## Workflow de despliegue

Configurar el ambiente GitHub `production` y los secretos `RENDER_API_KEY`, `RENDER_API_SERVICE_ID`, `RENDER_WEB_SERVICE_ID`. Ejecutar `deploy-production.yml` desde main después de integrar los cambios revisados. Exige CI y Tests correctos para el mismo commit y despliega ese SHA mediante la API de Render. Espera a que ambos servicios estén `live`; un fallo termina el workflow con error. Antes de la primera publicación deben estar aplicadas las migraciones.

Comprobar después login, consulta, PDF y permisos en la URL pública. Conservar la URL y el resultado en el acta de revisión. Para revertir una publicación, seleccionar en Render el despliegue anterior; las migraciones son aditivas. No ejecutar un borrado de tablas para revertir código.

## Evaluación SUS con participantes

Usar identificadores P01–P05, con consentimiento y sin registrar contraseñas. Cada participante realiza las tareas de su rol; registrar éxito, tiempo, errores y comentarios antes del cuestionario. Escala: 1 totalmente en desacuerdo, 5 totalmente de acuerdo.

1. Me gustaría utilizar este sistema con frecuencia.
2. El sistema me resultó innecesariamente complejo.
3. El sistema me resultó fácil de usar.
4. Necesitaría ayuda técnica para utilizarlo.
5. Las funciones están bien integradas.
6. Encontré demasiadas inconsistencias.
7. La mayoría de las personas aprendería a utilizarlo rápidamente.
8. Me resultó complicado utilizarlo.
9. Me sentí seguro al utilizarlo.
10. Necesité aprender muchas cosas antes de empezar.

Guardar respuestas reales como JSON con `participante` y `respuestas` (diez enteros). `python scripts/sus_score.py respuestas.json` calcula los puntajes individuales y promedio: impares respuesta−1, pares 5−respuesta, suma×2,5. SUS es una puntuación 0–100, no un porcentaje de tareas completadas. Comparar con 68. No mezclar resultados de automatización con respuestas SUS.

[← Volver al README principal](../../../README.md)

## Configuración simulada aplicada

El 20/11/2026 se guardó y releyó la [configuración simulada](evidencias/configuracion-ambiental-simulada.json) en la aplicación publicada. Precios ficticios: DIESEL 18, GNV 8 e HIBRIDO 18 PEN/gal; electricidad 0,75 PEN/kWh y 0,2 kWh/km; 20 kg por árbol en diez años y 1000 kg por crédito. Son supuestos simulados, sin validez científica o comercial. Los dos proyectos incluyen SIMULADO en su nombre. Se verificó la creación de una propuesta con distribución 60/40. Las rutas con instantánea anterior conservan sus parámetros; la configuración no altera costos históricos.
