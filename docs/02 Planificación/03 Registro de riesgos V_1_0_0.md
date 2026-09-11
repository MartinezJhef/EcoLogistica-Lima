[← Volver al README Principal](../../README.md)

# 03 Registro de riesgos V_1_0_0

## 1. Metadatos

| Campo | Detalle |
|---|---|
| Proyecto | EcoLogistica-Lima: Plataforma Web y Móvil para la Gestión y Optimización de Logística Verde Urbana |
| Código | PFA-ECOLIMA-2026 |
| Artefacto | Registro de riesgos |
| Responsable sugerido | Maylit Mendoza Alarcon — Analista de Riesgos / QA |
| Equipo | 5 integrantes |
| Versión | 1.0.0 |
| Estado | Propuesto para revisión y aprobación |
| Ruta | `docs/02 Planificación/03 Registro de riesgos V_1_0_0.md` |

---

## 2. Objetivo

Establecer la línea base de riesgos del proyecto EcoLogistica-Lima mediante una matriz cuantitativa que incluya probabilidad, impacto, exposición, mitigación preventiva, contingencia reactiva y responsable.

---

## 3. Método de evaluación

`Severidad (Exposición) = Probabilidad × Impacto`

- **Probabilidad:** 1 (Muy baja) a 5 (Muy alta).
- **Impacto:** 1 (Insignificante) a 5 (Catastrófico).
- **Baja:** 1–6.
- **Media:** 8–12.
- **Alta:** 15–25.

> Para evitar ambigüedad en los valores 7, 13 y 14 no clasificados expresamente por la rúbrica, esta línea base usa combinaciones cuyo producto cae dentro de los rangos establecidos.

---

## 4. Matriz de Evaluación de Riesgos

| ID | Descripción del Riesgo | Categoría | Prob. | Imp. | Severidad | Plan de Mitigación (Preventivo) | Plan de Contingencia (Reactivo) | Responsable |
|---|---|---|---:|---:|---|---|---|---|
| **RSK-01** | Latencia, indisponibilidad o agotamiento de cuota en servicios externos de mapas/ruteo. | Técnica / Integración | 3 | 4 | **12 (Media)** | Monitorear cuotas desde Sprint 1, aplicar caché y mantener un proveedor alternativo probado. | Activar fallback a OpenStreetMap/GraphHopper u otra alternativa validada. | Líder Técnico |
| **RSK-02** | Retraso del cronograma de 16 semanas por sobrecarga académica o subestimación. | Cronograma / RR.HH. | 4 | 4 | **16 (Alta)** | Sprints quincenales, límites de WIP, Story Points y revisión de capacidad real. | Reducir alcance no crítico y mover historias Should/Could a sprints posteriores. | Scrum Master / PM |
| **RSK-03** | Factores de emisión desactualizados o insuficientemente sustentados. | Datos / Sostenibilidad | 3 | 3 | **9 (Media)** | Mantener fuente/fecha y validar factores con documentación técnica aprobada. | Marcar resultados como provisionales, actualizar el factor y recalcular. | Product Owner / QA |
| **RSK-04** | Dificultad para pruebas de campo con repartidores y rutas reales. | Operativa / Validación | 3 | 3 | **9 (Media)** | Coordinar piloto anticipadamente y preparar escenarios simulados. | Ejecutar pruebas controladas reproducibles y documentar la limitación. | Project Manager |
| **RSK-05** | Conectividad móvil intermitente durante las entregas. | Operativa / Infraestructura | 4 | 3 | **12 (Media)** | Diseñar flujo tolerante a desconexión y probar sincronización posterior. | Continuidad limitada offline y sincronización al recuperar conectividad. | Líder Técnico |
| **RSK-06** | Exposición o tratamiento indebido de datos personales, direcciones o GPS. | Seguridad / Legal | 3 | 5 | **15 (Alta)** | Mínimo privilegio, cifrado, control de acceso, auditoría y cumplimiento de Ley N.° 29733. | Revocar accesos, aislar el componente, preservar evidencia y ejecutar respuesta a incidentes. | QA / Líder Técnico |
| **RSK-07** | Inconsistencia entre decisiones de arquitectura o stack documentadas en distintos artefactos. | Arquitectura / Configuración | 3 | 4 | **12 (Media)** | Aprobar una única decisión tecnológica y mantener control de cambios. | Revisión técnica y actualización versionada de documentos afectados. | Líder Técnico / Scrum Master |
| **RSK-08** | Sobreconsumo de servicios cloud/API que exceda el presupuesto. | Financiera / Cloud | 3 | 4 | **12 (Media)** | Alertas al 70%, priorizar free tier/Open Source y revisar costos por Sprint. | Desactivar recursos no críticos, migrar a servicios más económicos y usar contingencia con aprobación. | PM / Líder Técnico |
| **RSK-09** | El motor no cumple ≤45 s en cálculo o ≤30 s en reoptimización. | Rendimiento | 3 | 4 | **12 (Media)** | Pruebas tempranas de rendimiento y perfilamiento de cuellos de botella. | Optimizar consultas/caché o simplificar parámetros secundarios. | Líder Técnico / QA |
| **RSK-10** | La disponibilidad real de integrantes cae por debajo de lo planificado. | RR.HH. / Capacidad | 4 | 4 | **16 (Alta)** | Visualizar carga en Jira, pair programming y compartir conocimiento. | Reasignar historias y mover alcance de menor prioridad. | Scrum Master |
| **RSK-11** | Pérdida de trazabilidad Jira↔GitHub por ramas/commits/PR sin identificador. | Configuración / Calidad | 3 | 3 | **9 (Media)** | Definir convención Jira↔GitHub y revisarla en PR. | Corregir referencias y aplicar la convención en cambios siguientes. | Scrum Master / Comunicaciones |
| **RSK-12** | Evidencias de Jira inválidas por capturas completas o mal recortadas. | Académica / Calidad documental | 2 | 4 | **8 (Media)** | Checklist y revisión QA antes de integrar capturas. | Repetir capturas mostrando exclusivamente el panel requerido de Jira. | QA |

---

## 5. Seguimiento

- RSK-02, RSK-06 y RSK-10 son riesgos **Altos** y deben revisarse al menos una vez por Sprint.
- Si cambia la probabilidad o impacto, se recalcula `P × I`.
- Si un riesgo se materializa, se registra la incidencia y se ejecuta su contingencia.
- Riesgos nuevos detectados en Jira, retrospectivas, pruebas o PR se agregan en una nueva versión.

---

## 6. Relación con Jira

Ejemplos:

```text
RSK-09 → EP-03 Optimización y Reoptimización
RSK-06 → EP-05 Calidad, Seguridad e Infraestructura
RSK-02 → Sprint / Roadmap
```

---

## 7. Historial de Control de Cambios

| Versión | Descripción |
|---|---|
| 1.0.0 | Creación inicial de la matriz cuantitativa de riesgos. |

[← Volver al README Principal](../../README.md)