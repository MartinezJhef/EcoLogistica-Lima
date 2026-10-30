[← Volver al README Principal](../../README.md)

# Registro de impedimentos

**Nombre del Proyecto:** EcoLogística Lima – Plataforma Inteligente para la Optimización de Rutas Sostenibles de Última Milla (DistriRápido S.A.C.)

**Código Institucional:** PFA-ECOLIMA-2026

**Líder del Proyecto:** Zayuri Cerron Medina (Directora de Proyecto) / Jheferson Martinez Valerio (Scrum Master)

---

| Impedimento # | Fecha de Registro | Descripción del Impedimento así como el Impacto en el Proyecto | Prioridad | Reportado por | Fecha tope de Resolución | Estado | Fecha de Resolución | Resolución/Comentarios |
| :---: | :---: | :--- | :---: | :--- | :---: | :---: | :---: | :--- |
| **IMP-001** | 18/09/2026 | **Serialización Geoespacial en PostGIS con SQLAlchemy:** Dificultad para convertir geometrías WKB binarias nativas de PostGIS a formato GeoJSON estándar en las respuestas REST de FastAPI para la entidad `PEDIDO`. **Impacto:** Bloqueo temporal en el consumo de coordenadas en el frontend React. | **Alta** | Jheferson Martinez (Backend Lead) | 22/09/2026 | **Resuelto** | 21/09/2026 | Se integró la librería `GeoAlchemy2` junto con serializadores personalizados en Pydantic utilizando `ST_AsGeoJSON` de PostGIS. Se implementó suite de pruebas de regresión. |
| **IMP-002** | 21/09/2026 | **Migración de sintaxis a Pydantic v2:** Incompatibilidad en los métodos de validación de campos (`@validator` vs `@field_validator`) en los esquemas de vehículos y conductores al actualizar dependencias en `requirements.txt`. **Impacto:** Errores de compilación y ejecución de tests unitarios en el backend. | **Media** | Maylit Mendoza (QA Engineer) | 24/09/2026 | **Resuelto** | 23/09/2026 | Se actualizaron todos los esquemas DTO a la sintaxis moderna de Pydantic v2 (`model_validator` y `field_validator`), estandarizando el tipado estricto y reduciendo la latencia de serialización en un 15%. |
| **IMP-003** | 25/09/2026 | **Inconsistencia de Entornos Locales de PostgreSQL:** Dos miembros del equipo experimentaron errores al ejecutar las extensiones `postgis` y `pgcrypto` debido a versiones dispares de PostgreSQL instaladas en Windows. **Impacto:** Demora de 1.5 días en la ejecución local de pruebas cruzadas. | **Alta** | Diego Angulo (DevOps) | 27/09/2026 | **Resuelto** | 26/09/2026 | Se estandarizó el despliegue del entorno de desarrollo mediante **Docker Compose**, empaquetando una imagen oficial de `postgis/postgis:16-3.4-alpine` con scripts de inicialización DDL automáticos (`init.sql`). |
| **IMP-004** | 29/09/2026 | **Falta de API Pública del MTC para Validación en Tiempo Real de Licencias:** No se dispone de un endpoint gubernamental abierto y sin costo para validar el estado de revocación de licencias de conducir de los choferes en vivo. **Impacto:** Riesgo de registrar licencias no verificadas oficialmente. | **Media** | Angela Rojas (Product Owner) | 03/10/2026 | **Resuelto** | 02/10/2026 | Conforme a la definición de requerimientos (RF-008), se implementó un validador sintáctico estricto por regex (formato canónico de brevete peruano MTC) y un flujo de verificación manual asistida con adjunto en PDF del récord del conductor. |
| **IMP-005** | 02/10/2026 | **Manejo de Errores de Geolocalización en Pedidos con Direcciones Incompletas:** La ingesta por lotes de pedidos de DistriRápido S.A.C. contenía registros sin coordenadas GPS directas o con direcciones ambiguas de Lima Este. **Impacto:** Rechazo en la persistencia de pedidos en base de datos al violar la restricción `NOT NULL` de `ubicacion_destino`. | **Alta** | Zayuri Cerron (Project Manager) | 06/10/2026 | **Resuelto** | 05/10/2026 | Se implementó una capa de validación previa en `OrderService` que clasifica los pedidos en estado `OBSERVADO_GEO` y provee un asistente interactivo en React con Leaflet para fijar el pin geográfico en el mapa antes de confirmar el despacho. |

---

### Resumen Estadístico de Gestión de Impedimentos

* **Total de Impedimentos Registrados:** 5
* **Impedimentos Resueltos:** 5 (100% de eficacia en la resolución)
* **Tiempo Promedio de Resolución:** 1.8 días hábiles (dentro de los plazos topes fijados)
* **Impacto en el Cronograma del Sprint:** 0 días de desvío en la entrega final del Sprint 1

---

[← Volver al README Principal](../../README.md)
