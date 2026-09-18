[← Volver al README Principal](../../README.md)

# 04 Presupuesto del proyecto 

---

## 1. Información del documento

| Campo | Detalle |
| :--- | :--- |
| **Nombre del Proyecto** | EcoLogistica-Lima: Plataforma Web y Móvil para la Gestión y Optimización de Logística Verde Urbana |
| **Código del Proyecto** | PFA-ECOLIMA-2026 |
| **Integrantes del Equipo** | • Zayuri Cerron Medina <br>• Jheferson Martinez Valerio <br>• Angela Rojas Quispe <br>• Maylit Mendoza Alarcon <br>• Diego Angulo Gonzales  |
| **Responsable del Documento**| Jheferson Martinez Valerio |
| **Fecha de Elaboración** | 4 de septiembre de 2026 |
| **Versión** | 1.0.0 |

---

## 2. Objetivo

Modelar el costo proyectado de recursos humanos, herramientas, licenciamiento, infraestructura cloud y reserva de contingencia para EcoLogistica-Lima.

El Acta de Constitución establece un límite presupuestal de **S/ 12,850.00 PEN**. La actividad exige presentar el modelo financiero en USD, por lo que esta versión usa un **tipo de cambio presupuestario interno referencial de S/ 3.75 por USD** exclusivamente para planificación. Antes de la aprobación final deberá reemplazarse por el tipo de cambio adoptado oficialmente por el equipo.

---

## 3. Supuestos

1. Duración: **16 semanas**.
2. Equipo: **5 integrantes**.
3. Dedicación de referencia: hasta **15 h/semana por integrante**.
4. Se priorizan herramientas Open Source, planes gratuitos y créditos educativos.
5. Reserva de contingencia: **10% del subtotal**.
6. Las tarifas de RR.HH. son **valorizaciones académicas referenciales**, no salarios reales.
7. Los recursos pagos requieren aprobación del Project Manager.

---

# 4. Recursos Humanos (CAPEX)

`Costo = Horas asignadas × Tarifa por hora (USD)`

| Rol | Responsable | Horas proyectadas | Tarifa referencial USD/h | Costo USD |
|---|---|---:|---:|---:|
| Project Manager | Zayuri Cerron Medina | 240 | 1.75 | 420.00 |
| Líder Técnico / Scrum Master | Jheferson Martinez Valerio | 240 | 2.00 | 480.00 |
| Product Owner / Analista de Negocio | Angela Rojas Quispe | 240 | 1.70 | 408.00 |
| Analista de Riesgos / QA | Maylit Mendoza Alarcon | 240 | 1.70 | 408.00 |
| Stakeholders / Comunicaciones | Diego Angulo Gonzales | 240 | 1.60 | 384.00 |
| **TOTAL RR.HH.** |  | **1,200 h** |  | **2,100.00** |

---

# 5. Licenciamiento y Herramientas

| Herramienta / Servicio | Uso | Modelo | Costo USD |
|---|---|---|---:|
| Atlassian Jira | Backlog, Scrum, Roadmap y Sprint | Plan free/académico | 0.00 |
| GitHub | Repositorio, PR, Actions y CodeQL | Free/educativo | 0.00 |
| Figma | UI/UX | Free/educativo | 0.00 |
| SonarQube / CodeQL | Calidad y seguridad | Community/GitHub | 0.00 |
| OpenStreetMap | Cartografía base | Open Source | 0.00 |
| OpenAPI/Swagger | Documentación API | Open Source | 0.00 |
| Dominio/servicios auxiliares | Identidad web y apoyo al piloto | Estimación | 40.00 |
| Consumo adicional de mapas/plugins | Uso excepcional fuera de free tier | Estimación | 60.00 |
| **TOTAL LICENCIAMIENTO** |  |  | **100.00** |

---

# 6. Infraestructura Cloud y Servicios (OPEX)

| Recurso | Propósito | Costo proyectado USD |
|---|---|---:|
| Backend / API | Servicios de negocio | 160.00 |
| PostgreSQL / PostGIS | Datos relacionales y geoespaciales | 160.00 |
| Redis / caché | Caché y sesiones | 70.00 |
| Almacenamiento / backups | Evidencias y respaldos | 60.00 |
| Monitoreo y logs | Disponibilidad y diagnóstico | 40.00 |
| Servicios geoespaciales adicionales | Cuotas/fallback para pruebas | 90.00 |
| **TOTAL OPEX CLOUD** |  | **580.00** |

---

# 7. Resumen Financiero

| Categoría | Costo Subtotal (USD) | Porcentaje del Subtotal |
|---|---:|---:|
| **1. Recursos Humanos (CAPEX)** | **2,100.00** | **75.54%** |
| **2. Licenciamiento de Software** | **100.00** | **3.60%** |
| **3. Infraestructura Cloud (OPEX)** | **580.00** | **20.86%** |
| **SUBTOTAL DE PROYECTO** | **2,780.00** | **100.00%** |
| **4. Reserva de Contingencia (10%)** | **278.00** | N/A |
| **PRESUPUESTO TOTAL ESTIMADO** | **3,058.00 USD** | **100.00% del presupuesto final** |

---

# 8. Control contra el Tope de S/ 12,850.00

Con el tipo de cambio presupuestario referencial de **S/ 3.75/USD**:

```text
USD 3,058.00 × S/ 3.75 = S/ 11,467.50
```

Margen respecto al tope:

```text
S/ 12,850.00 - S/ 11,467.50 = S/ 1,382.50
```

Por tanto, el presupuesto modelado se mantiene por debajo del límite del Acta de Constitución bajo este supuesto de control.

> Antes de aprobar la versión final debe actualizarse esta conversión con el tipo de cambio oficial seleccionado por el equipo y dejar constancia en el historial de cambios si modifica los montos.

---

# 9. Reserva de Contingencia

La reserva de **USD 278.00** solo podrá emplearse ante riesgos materializados que generen gasto adicional, por ejemplo:

- sobreconsumo de APIs;
- capacidad cloud adicional;
- almacenamiento o respaldo;
- contingencias del piloto;
- sustitución temporal de un servicio externo.

Cada uso debe registrar el riesgo/incidencia, monto, responsable que autoriza y saldo restante.

---

# 10. Controles de Costo

1. Alertas de consumo al **70%** del umbral proyectado.
2. Revisión de gasto en cada Sprint Review.
3. Preferencia por Open Source y free tier.
4. Ningún recurso pago se activa sin responsable y justificación.
5. Gastos extraordinarios deben relacionarse con un riesgo/incidencia.
6. Recalcular pronóstico ante desviaciones materiales.
7. Mantener el presupuesto final bajo el tope aprobado.

---

[← Volver al README Principal](../../README.md)
