[← Volver al README Principal](../../README.md)

# Reprospectiva del sprint

**Nombre del Proyecto:** EcoLogística Lima – Plataforma Inteligente para la Optimización de Rutas Sostenibles de Última Milla (DistriRápido S.A.C.)

**Código Institucional:** PFA-ECOLIMA-2026

**Líder del Proyecto:** Zayuri Cerron Medina (Directora de Proyecto) / Jheferson Martinez Valerio (Scrum Master)

---

## ¿Qué aprendimos?

Durante el desarrollo del **Sprint 1**, el equipo asimiló lecciones técnicas y organizacionales críticas para la viabilidad de EcoLogística Lima:

1. **Gestión Geoespacial Nativa vs. Serialización de Aplicación:** Aprendimos que procesar información espacial directamente en **PostgreSQL con PostGIS** mediante funciones nativas (`ST_DWithin`, `ST_Contains`, `ST_Distance`) reduce drásticamente la latencia en comparación con el cálculo en memoria de la aplicación, optimizando la huella energética del backend (Green Software).
2. **Importancia de la Validación Temprana con Pydantic v2:** Comprendimos que definir esquemas estrictos de entrada/salida previene inconsistencias de tipos y descarta anomalías en la data operativa (como ventanas horarias invertidas o cargas negativas) antes de llegar a la capa de base de datos.
3. **Estandarización de Entornos mediante Contenedores:** Identificamos que las discrepancias en los sistemas operativos del equipo (Windows 11 vs. entornos Linux) en la instalación de extensiones complejas (`pgcrypto` y `postgis`) se neutralizan de forma definitiva al estandarizar el stack con **Docker Compose**.
4. **Impacto de las Restricciones Normativas en la Experiencia de Usuario:** Descubrimos que las reglas legales de transporte (como la Ley N° 30224 para choferes peruanos) deben informarse al usuario con explicaciones transparentes en la interfaz gráfica para evitar confusión al bloquear una asignación.

---

## ¿Qué estamos haciendo bien?

1. **Cumplimiento de la Cadencia y Ceremonias Scrum:** Las reuniones diarias (Daily Standups de 15 minutos) permitieron visibilizar impedimentos en fases tempranas, evitando retrasos en la integración de código.
2. **Compromiso con la Calidad Técnica y la Definition of Done (DoD):** No se integró ninguna funcionalidad a la rama `develop` sin contar con revisión por pares (Peer Review) mediante Pull Requests y una cobertura de pruebas unitarias superior al 80%.
3. **Alineación con los Documentos de Inicio y Planificación:** La implementación respetó con total fidelidad el modelo de datos de 11 tablas en 3FN del Documento 11 y la arquitectura C4 del Documento 12.
4. **Colaboración Multidisciplinaria Ágil:** La coordinación constante entre el Product Owner (Angela Rojas) para refinar los criterios de aceptación y el equipo técnico agilizó la resolución de dudas funcionales.

---

## ¿Qué podemos hacer mejor?

### Personas
* **Balance de Carga y Especialización:** Se observó una concentración excesiva de tareas backend y configuración de Docker en el líder técnico, generando momentos de saturación. Es necesario distribuir de manera más equitativa el conocimiento del entorno de infraestructura y pipelines.
* **Capacitación Continua en Algoritmos Heurísticos:** Para el Sprint 2 se requiere que los desarrolladores profundicen en los conceptos matemáticos de formulación del problema Green VRPTW y el uso de la biblioteca OR-Tools.

### Relaciones
* **Sincronización Inter-Equipos (Frontend vs. Backend):** Hubo desfases temporales menores al esperar los contratos definitivos de la API REST para avanzar con las pantallas de React. Se debe acordar el uso de esquemas simulados (Mock APIs) desde el día 1 de cada sprint.
* **Comunicación con los Stakeholders de Campo:** Si bien la relación con el jefe de operaciones fue fluida, se requiere mayor interacción directa con conductores de campo para evaluar la ergonomía de la vista móvil.

### Procesos
* **Definición de Tareas Técnicas más Atómicas:** Algunas subtareas en Jira se planificaron con un alcance demasiado amplio (ej. "Implementar módulo de pedidos"), dificultando el seguimiento del avance porcentual en los primeros días del sprint. Deben dividirse en tareas de máximo 4 a 6 horas de esfuerzo.
* **Automatización del Flujo de Pruebas de Integración:** Aunque las pruebas unitarias se ejecutaron manualmente en local antes de cada commit, se requiere incorporar GitHub Actions para validar tests de forma automática en cada Pull Request.

### Herramientas
* **Uso del Message Broker en Desarrollo:** Durante el Sprint 1 se pospuso la puesta en marcha de Celery y Redis, resolviendo las peticiones sincrónicamente. Para el Sprint 2, este mecanismo debe estar activo desde el primer día para soportar la carga pesada del motor de optimización.
* **Gestión de Variables de Entorno Seguras:** Centralizar la configuración de variables sensibles en archivos `.env.example` versionados para evitar reconfiguraciones manuales entre los miembros del equipo.

---

### Acciones a realizar

Con base en el análisis anterior, el equipo establece el siguiente **Plan de Acción de Mejora Continua** con metas concretas para el **Sprint 2**:

| # | Acción de Mejora Concreta | Eje de Impacto | Responsable | Plazo de Ejecución | Métrica de Verificación |
| :-: | :--- | :---: | :--- | :---: | :--- |
| **A-01** | Implementar contratos Mock en Swagger/JSON Server antes de codificar la interfaz en React. | Relaciones / Procesos | Jheferson Martinez / Diego Angulo | Primeros 2 días del Sprint 2 | 100% de endpoints mockeados antes del inicio del frontend. |
| **A-02** | Configurar pipeline de Integración Continua (CI) en GitHub Actions para pruebas automáticas y linting. | Herramientas | Diego Angulo (DevOps) | Fin de la Semana 1 del Sprint 2 | 0 Pull Requests integrados sin validación CI en verde. |
| **A-03** | Descomponer las historias de optimización (US-005) en subtareas técnicas con duración máxima de 6 horas. | Procesos | Zayuri Cerron (Scrum Master) | Sprint Planning 2 | Máximo 6 horas estimadas por subtarea en Jira. |
| **A-04** | Levantar el stack completo con Redis y Celery en Docker Compose para el procesamiento asíncrono. | Herramientas / Personas | Jheferson Martinez / Maylit Mendoza | Inicio del Sprint 2 | Tarea asíncrona de prueba respondiendo en $< 50\text{ ms}$ a la API. |
| **A-05** | Realizar sesión de transferencia técnica interna sobre el solver Green VRPTW con Google OR-Tools. | Personas | Jheferson Martinez (Líder Técnico) | Semana 2 del Sprint 2 | Documento de diseño algorítmico y test de prototipo aprobado. |

---

[← Volver al README Principal](../../README.md)
