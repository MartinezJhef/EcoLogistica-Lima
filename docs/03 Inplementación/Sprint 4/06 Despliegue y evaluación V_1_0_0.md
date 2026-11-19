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

## Publicación gratuita preparada

Se incluye `render.yaml`: web estática y API gratuita en Render, con el trabajador PDF en el mismo contenedor. Se necesita una cuenta de Render y una base PostgreSQL con PostGIS, por ejemplo Neon. No se ha creado una cuenta ni desplegado un servicio público todavía.

Crear una base vacía, activar PostGIS y aplicar `src/database/init.sql`, `scripts/006_sprint3_route_updates.sql` y `scripts/007_sprint4_analytics.sql`, en ese orden. Mantener las credenciales en variables privadas del proveedor. No cargar los datos de las pruebas E2E.

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
