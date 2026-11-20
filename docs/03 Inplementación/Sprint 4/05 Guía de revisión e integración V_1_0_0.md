[← Volver al README principal](../../../README.md)

# 01. Guía de revisión e integración V_1_0_0

---

## 1. Información del documento

| Campo | Detalle |
| :--- | :--- |
| **Nombre del Proyecto** | EcoLogistica-Lima: Plataforma Web y Móvil para la Gestión y Optimización de Logística Verde Urbana |
| **Código del Proyecto** | PFA-ECOLIMA-2026 |
| **Integrantes del Equipo** | • Zayuri Cerron Medina <br>• Jheferson Martinez Valerio <br>• Angela Rojas Quispe <br>• Maylit Mendoza Alarcon <br>• Diego Angulo Gonzales |
| **Responsable del Documento** | Jheferson Martinez Valerio |
| **Fecha de Elaboración** | 19 de noviembre de 2026 |
| **Versión** | 1.0.0 |

--- 
<br><br>

## Qué debe hacer el compañero para aprobar los cambios

**Revisión preparada:** [PR #12](https://github.com/MartinezJhef/EcoLogistica-Lima/pull/12), publicado con DiegoA199.  
**Estado comprobado al preparar esta guía:** abierto, listo para revisión, sin aprobaciones recibidas; sus comprobaciones automáticas aprobaron y GitHub lo considera integrable. No se fusionó en main.

### Pasos del compañero

1. Entrar al PR #12 con su propia cuenta de GitHub y acceso al repositorio.
2. Leer la descripción y abrir **Files changed**. Revisar especialmente el acceso por roles, los cambios pendientes del móvil, las validaciones de capacidad/jornada y la migración de datos. Las notas de instalación y la matriz de aceptación están en `docs/SPRINT_3_INSTALACION_Y_VALIDACION.md` y `docs/SPRINT_3_MATRIZ_CUMPLIMIENTO.md`.
3. Verificar en **Checks** que la validación funcional y Green IT estén aprobadas para el último commit. Consultar los resultados de servidor, web, móvil, APK y staging Docker. Puede ejecutar el proyecto o usar el APK de prueba conectado a la API actualizada; el APK por sí solo no instala el backend ni migra la base.
4. Si encuentra un problema, usar **Review changes → Request changes → Submit review**, con una explicación concreta. El autor puede corregirlo, repetir las comprobaciones y devolverlo a revisión.
5. Si está conforme después de revisarlo, usar **Files changed → Review changes → Approve → Submit review**. No basta con escribir «aprobado» en un comentario normal: debe enviarse una revisión de tipo Approve.

La aprobación debe evaluar los cambios; el compañero no necesita volver a implementarlos. El propio plan del proyecto pide la revisión de un par técnico antes de integrar.

### Qué puede hacer el asistente

Puede preparar la revisión, explicar los cambios, corregir observaciones, ejecutar las pruebas y realizar la integración autorizada después de la aprobación. También puede ayudar a aplicar la migración y el despliegue cuando se identifique el entorno y se disponga de los accesos necesarios.

La aprobación de compañero corresponde a otra persona. La cuenta autora de un PR no puede aprobar su propio PR, según la [documentación de GitHub](https://docs.github.com/en/pull-requests/how-tos/review-pull-requests/reviewing-proposed-changes-in-a-pull-request).

### Después de la aprobación

1. Verificar que la aprobación y los checks correspondan al commit que se va a integrar; si hubo cambios nuevos, confirmar la revisión de esos cambios.
2. Fusionar el PR en main mediante el flujo de revisión del equipo.
3. Configurar el entorno real, respaldar su base antes de migrar, aplicar la migración y desplegar las versiones compatibles de API, web y móvil.
4. Comprobar inicio de sesión, registro, planificación, recepción del itinerario y sincronización con las cuentas y recursos del equipo.
5. Continuar el Sprint 4 sobre esa base integrada. Los resultados de staging desechable no se presentan como un despliegue ya realizado en el entorno del equipo.

[Preparación del Sprint 4](00%20Preparaci%C3%B3n%20del%20Sprint%204%20V_1_0_0.md) · [← Volver al README principal](../../../README.md)
