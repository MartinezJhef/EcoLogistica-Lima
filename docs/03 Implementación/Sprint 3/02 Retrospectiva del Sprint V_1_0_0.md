[← Volver al README principal](../../README.md)

# 01. Retrospectiva del Sprint V_1_0_0

---

## 1. Información del documento

| Campo | Detalle |
| :--- | :--- |
| **Nombre del Proyecto** | EcoLogistica-Lima: Plataforma Web y Móvil para la Gestión y Optimización de Logística Verde Urbana |
| **Código del Proyecto** | PFA-ECOLIMA-2026 |
| **Integrantes del Equipo** | • Zayuri Cerron Medina <br>• Jheferson Martinez Valerio <br>• Angela Rojas Quispe <br>• Maylit Mendoza Alarcon <br>• Diego Angulo Gonzales |
| **Responsable del Documento** | Zayuri Cerron Medina |
| **Fecha de Elaboración** | 30 de octubre de 2026 |
| **Versión** | 1.0.0 |

---


## 2. ¿Qué aprendimos?

- **La optimización de rutas requiere considerar diferentes restricciones.** Aprendimos que no basta con calcular distancias, sino que también es necesario considerar la capacidad de los vehículos, los tiempos de entrega, las emisiones y las restricciones de circulación para generar recorridos más eficientes.
- **La integración de herramientas geoespaciales mejora el seguimiento logístico.** El uso de Leaflet permitió representar las rutas, las paradas y las zonas restringidas mediante mapas interactivos, facilitando la interpretación de los recorridos.
- **La reoptimización permite responder ante situaciones imprevistas.** Incorporar mecanismos para recalcular las rutas ante cancelaciones, emergencias y desvíos permite adaptar la planificación a las condiciones de las operaciones.
- **La sostenibilidad también debe considerarse en el desarrollo del software.** La integración de CodeCarbon permitió incorporar la medición de las emisiones de CO₂ y el consumo energético generados durante la ejecución del algoritmo.
- **Las pruebas automatizadas ayudan a verificar la calidad del sistema.** La ejecución de 40 pruebas mediante Pytest permitió comprobar el funcionamiento de los diferentes módulos y detectar posibles errores antes de dar por finalizadas las funcionalidades.

## 3. ¿Qué estamos haciendo bien?

- Se logró completar las tres historias de usuario planificadas para el Sprint 3, alcanzando 29 Story Points.
- Se implementó el motor de optimización CVRPTW, considerando restricciones operativas y ambientales.
- Se integró Leaflet para la visualización de rutas, paradas y zonas de riesgo mediante mapas interactivos.
- Se incorporó la reoptimización dinámica para responder ante eventos que afectan los recorridos.
- Se integró CodeCarbon para medir las emisiones computacionales generadas por el algoritmo.
- Se mantuvo una organización modular del backend mediante una arquitectura N-Tier y Clean Architecture.
- Se ejecutaron satisfactoriamente las 40 pruebas automatizadas del proyecto, obteniendo un resultado del 100 % de aprobación.

## 4. ¿Qué podemos hacer mejor?

### 4.1.Personas

- Fortalecer los conocimientos técnicos del equipo sobre algoritmos de optimización, desarrollo web y herramientas geoespaciales.
- Mantener una distribución equilibrada de las actividades para facilitar el cumplimiento de los objetivos.
- Promover la participación de todos los integrantes en las pruebas, revisiones y validaciones de las funcionalidades.

### 4.2. Relaciones

- Mejorar la comunicación entre los integrantes responsables del backend y frontend para facilitar la integración de los módulos.
- Mantener una coordinación constante sobre los cambios realizados en las funcionalidades y sus respectivos requerimientos.
- Considerar las observaciones de los usuarios involucrados en las operaciones logísticas para identificar oportunidades de mejora.

### 4.3. Procesos

- Mantener criterios de aceptación claros y verificables para cada historia de usuario.
- Realizar pruebas de integración después de incorporar nuevos cambios en los módulos de optimización, visualización y reoptimización.
- Continuar verificando las restricciones operativas y ambientales establecidas en las reglas de negocio.
- Documentar los cambios realizados en cada funcionalidad para facilitar su mantenimiento y futuras actualizaciones.
- Mantener un seguimiento del cumplimiento de las actividades planificadas en cada sprint.

### 4.4. Herramientas

- Continuar utilizando GitHub para el control de versiones y el seguimiento de los cambios en el código fuente.
- Mantener el uso de Pytest para ejecutar pruebas automatizadas y verificar el funcionamiento del backend.
- Aprovechar las funcionalidades de PostgreSQL y PostGIS para gestionar la información y los datos geoespaciales.
- Continuar utilizando Leaflet para representar los recorridos y las zonas de riesgo en los mapas interactivos.
- Mantener la integración de CodeCarbon para registrar las métricas de emisiones computacionales y consumo energético.
- Actualizar la documentación técnica y conservar las evidencias de las pruebas realizadas.

### 4.5. Acciones a realizar

| N.° | Acción de mejora | Área relacionada | Responsable | Criterio de verificación |
|:---:|---|---|---|---|
| 1 | Continuar mejorando el algoritmo de optimización de rutas considerando diferentes escenarios de pedidos, vehículos y restricciones operativas. | Procesos | Equipo de backend | Pruebas de optimización ejecutadas con diferentes escenarios. |
| 2 | Verificar la correcta visualización de rutas, paradas y zonas restringidas en el mapa interactivo. | Herramientas | Equipo de frontend | Elementos geoespaciales visualizados correctamente. |
| 3 | Realizar pruebas adicionales de reoptimización ante diferentes eventos y situaciones imprevistas. | Procesos | Equipo de desarrollo | Resultados de los escenarios de reoptimización documentados. |
| 4 | Mantener la ejecución de pruebas automatizadas después de cada actualización del sistema. | Procesos / Herramientas | Equipo de desarrollo | Resultados de pruebas registrados y errores identificados. |
| 5 | Revisar periódicamente la integración entre los módulos del backend y frontend. | Relaciones | Equipo de desarrollo | Comunicación y funcionamiento de los módulos verificados. |
| 6 | Actualizar la documentación técnica y las evidencias de implementación conforme se incorporen nuevas funcionalidades. | Herramientas | Equipo de desarrollo | Documentación actualizada en el repositorio del proyecto. |



[← Volver al README principal](../../README.md)