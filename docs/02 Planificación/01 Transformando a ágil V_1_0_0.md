[← Volver al README Principal](../../README.md)

# 01 Transformando a ágil V_1_0_0

## 1. Metadatos

| Campo | Detalle |
|---|---|
| Proyecto | EcoLogistica-Lima: Plataforma Web y Móvil para la Gestión y Optimización de Logística Verde Urbana |
| Código | PFA-ECOLIMA-2026 |
| Artefacto | Transformación de requisitos a backlog ágil |
| Equipo | Zayuri Cerron Medina; Jheferson Martinez Valerio; Angela Rojas Quispe; Maylit Mendoza Alarcon; Diego Angulo Gonzales |
| Responsable del documento | Diego Angulo Gonzales |
| Versión | 1.0.0 |
| Estado | Propuesto para revisión del equipo |
| Ruta | `docs/02 Planificación/01 Transformando a ágil V_1_0_0.md` |

---

## 2. Objetivo

Transformar la línea base de Requisitos Funcionales (RF) y Requisitos No Funcionales (RNF) de EcoLogistica-Lima en elementos de trabajo ágiles: Épicas, Historias de Usuario e Historias Técnicas (Enablers), manteniendo trazabilidad, priorización y criterios de aceptación verificables mediante BDD/Gherkin.

---

## 3. Convenciones

- **EP-XX:** Épica.
- **US-XXX:** Historia de Usuario.
- **EN-XXX:** Historia Técnica / Enabler.
- **RF-XX:** Requisito Funcional de origen.
- **RNF-XXX:** Requisito No Funcional de origen.
- **Story Points:** Fibonacci (1, 2, 3, 5, 8, 13).
- **Prioridad:** Must, Should, Could.

---

## 4. Épicas

| ID | Épica | Propósito | Requisitos relacionados |
|---|---|---|---|
| EP-01 | Gestión de Flota y Conductores | Administrar vehículos y conductores para las operaciones de reparto. | RF-01, RF-08 |
| EP-02 | Gestión de Pedidos y Clientes | Registrar pedidos, datos logísticos, clientes y preferencias. | RF-02, RF-09 |
| EP-03 | Optimización y Reoptimización de Rutas | Generar, visualizar y recalcular rutas sostenibles. | RF-03, RF-04, RF-07 |
| EP-04 | Sostenibilidad, Analítica y Reportes | Consultar indicadores, reportes y ahorro de carbono. | RF-05, RF-06, RF-10 |
| EP-05 | Calidad, Seguridad e Infraestructura | Asegurar los atributos de calidad definidos por los RNF. | RNF-001 a RNF-007 |

---

## 5. Mapeo RF → Historias de Usuario

| RF | Historia | Épica | Prioridad | Story Points |
|---|---|---|---|---:|
| RF-01 | US-001 Registrar y administrar vehículos | EP-01 | Must | 5 |
| RF-02 | US-003 Registrar pedidos logísticos | EP-02 | Must | 5 |
| RF-03 | US-005 Generar rutas optimizadas | EP-03 | Must | 13 |
| RF-04 | US-006 Visualizar rutas en mapa | EP-03 | Must | 8 |
| RF-05 | US-008 Consultar dashboard de indicadores | EP-04 | Should | 5 |
| RF-06 | US-009 Exportar reporte de sostenibilidad | EP-04 | Should | 3 |
| RF-07 | US-007 Reoptimizar una ruta activa | EP-03 | Must | 8 |
| RF-08 | US-002 Administrar conductores | EP-01 | Must | 3 |
| RF-09 | US-004 Gestionar clientes y preferencias | EP-02 | Should | 3 |
| RF-10 | US-010 Consultar ahorro/compensación de carbono | EP-04 | Could | 5 |

---

# 6. Historias de Usuario según plantilla canónica

## ID: US-001

**Título:** Registrar y administrar vehículos

**Épica Relacionada:** EP-01 Gestión de Flota y Conductores

**Redacción:**

**Como** operador logístico,  
**quiero** registrar y mantener los vehículos de la flota con sus características operativas y ambientales,  
**para** disponer de información válida durante la planificación de entregas y rutas.

### Criterios de Aceptación

**Escenario 1: Registro válido de vehículo**  
**Dado** que el operador posee permisos de gestión de flota  
**Cuando** registra los datos obligatorios del vehículo con valores válidos  
**Entonces** el sistema guarda el vehículo y lo deja disponible para planificación.

**Escenario 2: Datos inválidos o incompletos**  
**Dado** que el operador intenta registrar un vehículo  
**Cuando** falta un dato obligatorio o existe un valor inválido  
**Entonces** el sistema rechaza el registro e indica los campos que deben corregirse.

---

## ID: US-002

**Título:** Administrar conductores

**Épica Relacionada:** EP-01 Gestión de Flota y Conductores

**Redacción:**

**Como** operador logístico,  
**quiero** registrar y actualizar conductores,  
**para** asignar entregas únicamente a personal habilitado.

### Criterios de Aceptación

**Escenario 1: Registro correcto de conductor**  
**Dado** que el operador posee permisos administrativos  
**Cuando** registra los datos obligatorios de un conductor  
**Entonces** el sistema crea el registro y lo deja disponible para asignación.

**Escenario 2: Conductor inactivo**  
**Dado** que un conductor se encuentra inactivo  
**Cuando** se intenta asignarlo a una nueva ruta  
**Entonces** el sistema impide la asignación e informa su estado.

---

## ID: US-003

**Título:** Registrar pedidos logísticos

**Épica Relacionada:** EP-02 Gestión de Pedidos y Clientes

**Redacción:**

**Como** operador de despacho,  
**quiero** registrar pedidos con sus datos logísticos y restricciones de entrega,  
**para** incorporarlos correctamente a la planificación de rutas.

### Criterios de Aceptación

**Escenario 1: Registro válido de pedido**  
**Dado** que existe un cliente identificado  
**Cuando** se registran dirección, coordenadas, peso, volumen, ventana horaria, prioridad y tipo de producto  
**Entonces** el pedido queda disponible para planificación.

**Escenario 2: Pedido sin ubicación válida**  
**Dado** que se intenta registrar un pedido  
**Cuando** no existe una dirección o coordenada utilizable  
**Entonces** el sistema no habilita el pedido para optimización y solicita corregir la ubicación.

---

## ID: US-004

**Título:** Gestionar clientes y preferencias

**Épica Relacionada:** EP-02 Gestión de Pedidos y Clientes

**Redacción:**

**Como** operador logístico,  
**quiero** registrar clientes y sus preferencias de entrega,  
**para** planificar el servicio respetando las condiciones acordadas.

### Criterios de Aceptación

**Escenario 1: Registrar preferencia**  
**Dado** que existe un cliente válido  
**Cuando** el operador registra una preferencia de entrega  
**Entonces** el sistema la asocia al cliente.

**Escenario 2: Actualizar preferencia**  
**Dado** que el cliente posee una preferencia registrada  
**Cuando** el operador la modifica  
**Entonces** el sistema conserva el nuevo valor para futuras operaciones.

---

## ID: US-005

**Título:** Generar rutas optimizadas

**Épica Relacionada:** EP-03 Optimización y Reoptimización de Rutas

**Redacción:**

**Como** despachador,  
**quiero** generar rutas optimizadas para pedidos y vehículos disponibles,  
**para** reducir distancia, tiempo, consumo, emisiones y penalizaciones operativas.

### Criterios de Aceptación

**Escenario 1: Optimización con datos válidos**  
**Dado** que existen pedidos pendientes y vehículos disponibles con información válida  
**Cuando** el despachador solicita la optimización  
**Entonces** el sistema devuelve una solución válida respetando capacidades y restricciones.

**Escenario 2: Pedido no asignable**  
**Dado** que uno o más pedidos no pueden asignarse sin violar restricciones  
**Cuando** se ejecuta la optimización  
**Entonces** el sistema identifica los pedidos no asignables e informa la causa.

---

## ID: US-006

**Título:** Visualizar rutas en mapa

**Épica Relacionada:** EP-03 Optimización y Reoptimización de Rutas

**Redacción:**

**Como** despachador,  
**quiero** visualizar las rutas generadas en un mapa,  
**para** revisar recorridos, paradas y asignaciones.

### Criterios de Aceptación

**Escenario 1: Visualización correcta**  
**Dado** que existe una ruta generada  
**Cuando** el despachador abre el detalle  
**Entonces** el sistema muestra el trazado y las paradas asociadas.

**Escenario 2: Servicio de mapas no disponible**  
**Dado** que el proveedor cartográfico no responde  
**Cuando** se intenta visualizar una ruta  
**Entonces** el sistema informa la indisponibilidad sin perder los datos logísticos.

---

## ID: US-007

**Título:** Reoptimizar una ruta activa

**Épica Relacionada:** EP-03 Optimización y Reoptimización de Rutas

**Redacción:**

**Como** operador de despacho,  
**quiero** recalcular una ruta ante cambios operativos,  
**para** mantener una planificación viable durante la jornada.

### Criterios de Aceptación

**Escenario 1: Reoptimización por cambio operativo**  
**Dado** que existe una ruta activa y ocurre un cambio relevante  
**Cuando** el operador solicita reoptimizar  
**Entonces** el sistema propone una nueva ruta para las entregas pendientes.

**Escenario 2: Entregas ya completadas**  
**Dado** que existen entregas completadas  
**Cuando** se ejecuta la reoptimización  
**Entonces** el sistema no vuelve a tratarlas como pendientes.

---

## ID: US-008

**Título:** Consultar dashboard de indicadores

**Épica Relacionada:** EP-04 Sostenibilidad, Analítica y Reportes

**Redacción:**

**Como** responsable de operaciones,  
**quiero** consultar indicadores operativos y ambientales,  
**para** evaluar el desempeño de la distribución.

### Criterios de Aceptación

**Escenario 1: Consulta con datos**  
**Dado** que existen operaciones registradas  
**Cuando** el usuario abre el dashboard  
**Entonces** el sistema presenta las métricas definidas para el periodo seleccionado.

**Escenario 2: Periodo sin información**  
**Dado** que no existen operaciones en el periodo seleccionado  
**Cuando** se consulta el dashboard  
**Entonces** el sistema informa que no hay datos y no muestra valores ficticios.

---

## ID: US-009

**Título:** Exportar reporte de sostenibilidad

**Épica Relacionada:** EP-04 Sostenibilidad, Analítica y Reportes

**Redacción:**

**Como** responsable de operaciones,  
**quiero** generar un reporte de sostenibilidad en PDF,  
**para** conservar y compartir evidencia del desempeño ambiental.

### Criterios de Aceptación

**Escenario 1: Exportación correcta**  
**Dado** que existe información del periodo seleccionado  
**Cuando** el usuario solicita exportar el reporte  
**Entonces** el sistema genera un PDF con las métricas correspondientes.

**Escenario 2: Datos insuficientes**  
**Dado** que el periodo no posee información suficiente  
**Cuando** se solicita la exportación  
**Entonces** el sistema informa la situación y no genera resultados ficticios.

---

## ID: US-010

**Título:** Consultar ahorro y compensación de carbono

**Épica Relacionada:** EP-04 Sostenibilidad, Analítica y Reportes

**Redacción:**

**Como** responsable de sostenibilidad,  
**quiero** consultar el ahorro de carbono asociado a las operaciones,  
**para** evaluar el impacto ambiental de las decisiones logísticas.

### Criterios de Aceptación

**Escenario 1: Cálculo con datos completos**  
**Dado** que existen trayectos con distancia y factores de emisión válidos  
**Cuando** el usuario consulta el indicador  
**Entonces** el sistema presenta el ahorro de carbono calculado con la metodología definida.

**Escenario 2: Información insuficiente**  
**Dado** que falta un dato requerido para el cálculo  
**Cuando** se solicita el indicador  
**Entonces** el sistema identifica la información faltante y evita presentar un resultado definitivo.

---

# 7. Transformación RNF → Historias Técnicas / Enablers

| ID | RNF origen | Enabler | Prioridad | Story Points |
|---|---|---|---|---:|
| EN-001 | RNF-001 | Validar rendimiento del motor de optimización | Must | 8 |
| EN-002 | RNF-002 | Implementar y validar controles de seguridad | Must | 8 |
| EN-003 | RNF-003 | Validar accesibilidad WCAG 2.1 AA | Should | 5 |
| EN-004 | RNF-004 | Validar escalabilidad operativa | Should | 8 |
| EN-005 | RNF-005 | Validar usabilidad del modo conductor | Must | 5 |
| EN-006 | RNF-006 | Implementar monitoreo y contingencia de disponibilidad | Must | 5 |
| EN-007 | RNF-007 | Mantener documentación técnica y operativa | Should | 3 |

## ID: EN-001

**Título:** Validar rendimiento del motor de optimización  
**Épica Relacionada:** EP-05 Calidad, Seguridad e Infraestructura

**Redacción:**

**Como** equipo técnico,  
**quiero** medir el tiempo de cálculo y recálculo de rutas,  
**para** comprobar el cumplimiento de los umbrales de rendimiento.

**Escenario 1**  
**Dado** un conjunto de hasta 150 pedidos y 15 vehículos  
**Cuando** se ejecuta una optimización inicial  
**Entonces** se obtiene una solución válida en ≤ 45 segundos.

**Escenario 2**  
**Dado** que una ruta requiere recálculo  
**Cuando** se ejecuta la reoptimización  
**Entonces** se obtiene una nueva solución válida en ≤ 30 segundos.

---

## ID: EN-002

**Título:** Implementar y validar controles de seguridad  
**Épica Relacionada:** EP-05 Calidad, Seguridad e Infraestructura

**Redacción:**

**Como** equipo técnico,  
**quiero** aplicar controles de autenticación, autorización y validación de entradas,  
**para** proteger los datos y reducir vulnerabilidades críticas.

**Escenario 1**  
**Dado** un usuario sin autorización  
**Cuando** intenta acceder a un recurso restringido  
**Entonces** el sistema rechaza la operación.

**Escenario 2**  
**Dado** una versión candidata a liberación  
**Cuando** se ejecuta la revisión de seguridad  
**Entonces** no existen vulnerabilidades críticas explotables dentro del alcance evaluado.

---

## ID: EN-003

**Título:** Validar accesibilidad WCAG 2.1 AA  
**Épica Relacionada:** EP-05 Calidad, Seguridad e Infraestructura

**Redacción:**

**Como** equipo de producto,  
**quiero** validar las pantallas principales con WCAG 2.1 AA,  
**para** asegurar una interacción perceptible, operable y comprensible.

**Escenario 1**  
**Dado** una pantalla principal  
**Cuando** se realiza la evaluación de accesibilidad  
**Entonces** quedan registrados los criterios aplicables de WCAG 2.1 AA.

**Escenario 2**  
**Dado** un incumplimiento detectado  
**Cuando** se aplica la corrección  
**Entonces** la pantalla se vuelve a evaluar antes de considerarse terminada.

---

## ID: EN-004

**Título:** Validar escalabilidad operativa  
**Épica Relacionada:** EP-05 Calidad, Seguridad e Infraestructura

**Redacción:**

**Como** equipo técnico,  
**quiero** probar el sistema con carga ampliada,  
**para** comprobar que puede soportar el crecimiento operativo esperado.

**Escenario 1**  
**Dado** un escenario con 1,000 pedidos diarios y 50 vehículos  
**Cuando** se ejecutan las operaciones principales  
**Entonces** estas completan su flujo sin errores atribuibles al volumen.

**Escenario 2**  
**Dado** una degradación detectada durante la prueba  
**Cuando** finaliza la ejecución  
**Entonces** se registra la incidencia con su evidencia y métrica observada.

---

## ID: EN-005

**Título:** Validar usabilidad del modo conductor  
**Épica Relacionada:** EP-05 Calidad, Seguridad e Infraestructura

**Redacción:**

**Como** conductor,  
**quiero** una vista simplificada con la información esencial,  
**para** ejecutar mi ruta sin acceder a funciones administrativas.

**Escenario 1**  
**Dado** un conductor autenticado  
**Cuando** ingresa a su vista operativa  
**Entonces** identifica ruta asignada, entregas pendientes y alertas disponibles.

**Escenario 2**  
**Dado** un conductor autenticado  
**Cuando** intenta acceder a una función administrativa restringida  
**Entonces** el sistema impide el acceso.

---

## ID: EN-006

**Título:** Implementar monitoreo y contingencia de disponibilidad  
**Épica Relacionada:** EP-05 Calidad, Seguridad e Infraestructura

**Redacción:**

**Como** equipo técnico,  
**quiero** medir la disponibilidad y probar la contingencia,  
**para** sostener la operación durante el horario definido.

**Escenario 1**  
**Dado** el periodo mensual evaluado entre 05:00 y 22:00  
**Cuando** se calcula la disponibilidad  
**Entonces** el resultado objetivo es ≥ 99.5%.

**Escenario 2**  
**Dado** una interrupción simulada  
**Cuando** se ejecuta el mecanismo de contingencia  
**Entonces** existe continuidad o recuperación controlada de la operación.

---

## ID: EN-007

**Título:** Mantener documentación técnica y operativa  
**Épica Relacionada:** EP-05 Calidad, Seguridad e Infraestructura

**Redacción:**

**Como** equipo del proyecto,  
**quiero** mantener la documentación alineada con cada versión,  
**para** asegurar trazabilidad y transferencia de conocimiento.

**Escenario 1**  
**Dado** un hito de entrega  
**Cuando** se ejecuta la lista de comprobación documental  
**Entonces** están presentes los grupos documentales obligatorios.

**Escenario 2**  
**Dado** un cambio de arquitectura, API o funcionalidad  
**Cuando** se prepara una liberación  
**Entonces** la documentación afectada está actualizada.

---

# 8. Backlog inicial priorizado para Jira

| Orden | ID | Tipo | Épica | Prioridad | SP |
|---:|---|---|---|---|---:|
| 1 | US-003 | Story | EP-02 | Must | 5 |
| 2 | US-001 | Story | EP-01 | Must | 5 |
| 3 | US-002 | Story | EP-01 | Must | 3 |
| 4 | US-005 | Story | EP-03 | Must | 13 |
| 5 | EN-001 | Enabler | EP-05 | Must | 8 |
| 6 | US-006 | Story | EP-03 | Must | 8 |
| 7 | US-007 | Story | EP-03 | Must | 8 |
| 8 | EN-002 | Enabler | EP-05 | Must | 8 |
| 9 | EN-005 | Enabler | EP-05 | Must | 5 |
| 10 | EN-006 | Enabler | EP-05 | Must | 5 |
| 11 | US-004 | Story | EP-02 | Should | 3 |
| 12 | US-008 | Story | EP-04 | Should | 5 |
| 13 | US-009 | Story | EP-04 | Should | 3 |
| 14 | EN-003 | Enabler | EP-05 | Should | 5 |
| 15 | EN-004 | Enabler | EP-05 | Should | 8 |
| 16 | EN-007 | Enabler | EP-05 | Should | 3 |
| 17 | US-010 | Story | EP-04 | Could | 5 |

> La selección definitiva de elementos para Sprint 1 deberá realizarse en Jira según la capacidad real del equipo.

---

# 9. Definition of Done (DoD) Global

Toda Historia de Usuario o Enabler deberá cumplir, cuando aplique:

1. Criterios de aceptación BDD/Gherkin aprobados.
2. Cobertura de pruebas unitarias ≥ 80%.
3. Análisis estático sin vulnerabilidades críticas.
4. Pull Request revisado y aprobado por al menos un par técnico.
5. Pruebas funcionales/de integración satisfactorias.
6. Despliegue automatizado ejecutable en Staging/Pruebas.
7. Documentación de API/código actualizada (OpenAPI/Swagger cuando corresponda).
8. Sin defectos críticos o bloqueantes abiertos.
9. Trazabilidad Jira ↔ rama/commit/PR para trabajo de software.
10. Validación final de Product Owner/QA.

---

# 10. Convención Jira ↔ GitHub

Ejemplo:

```text
Issue Jira: ECOL-21 - Generar rutas optimizadas
Rama: feat/ECOL-21-rutas-optimizadas
Commit: ECOL-21 feat: implementar generación de rutas
PR: ECOL-21 - Generar rutas optimizadas
```

---

# 11. Historial de Control de Cambios

| Versión | Descripción |
|---|---|
| 1.0.0 | Creación inicial de Épicas, Historias de Usuario, Enablers, criterios BDD y DoD global. |

[← Volver al README Principal](../../README.md)
