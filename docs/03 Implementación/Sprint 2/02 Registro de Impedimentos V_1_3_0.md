[← Volver al README principal](../../README.md)

# 02 Registro de Impedimentos

---

| Campo | Detalle |
| :--- | :--- |
| **Nombre del Proyecto** | EcoLogistica-Lima: Plataforma Web y Móvil para la Gestión y Optimización de Logística Verde Urbana |
| **Código del Proyecto** | PFA-ECOLIMA-2026 |
| **Integrantes del Equipo** | • Zayuri Cerron Medina <br>• Jheferson Martinez Valerio <br>• Angela Rojas Quispe <br>• Maylit Mendoza Alarcon <br>• Diego Angulo Gonzales  |
| **Responsable del Documento**| Zayuri Cerron Medina |
| **Fecha de Elaboración** | 8 de octubre de 2026 |
| **Versión** | 1.3.0 |

---

## Registro de impedimentos

**Sprint:** Sprint 2

**Historia de Usuario Relacionada:** US-004 – Gestionar preferencias y restricciones del cliente

**Épica:** EP-04 – Gestión de preferencias y restricciones del cliente

## 1. Registro de impedimentos

| Impedimento # | Fecha de Registro | Descripción del Impedimento e Impacto                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               | Prioridad | Reportado por               | Fecha tope de Resolución | Estado      | Fecha de Resolución | Resolución / Comentarios                                                                                                                                                                                                                                                                                                                                                                             |
| ------------- | ----------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------- | --------------------------- | ------------------------ | ----------- | ------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| IMP-010       | 07/10/2026      | **Dificultad para validar las preferencias y restricciones de entrega del cliente.** Durante la implementación de la US-004, podría presentarse una dificultad al registrar y validar las preferencias del cliente y sus restricciones de entrega, como horarios permitidos, indicaciones especiales o condiciones de recepción del pedido. Si estos datos no se guardan correctamente o no se validan antes de la planificación, podrían generarse entregas fuera de las condiciones solicitadas por el cliente, ocasionando retrasos y problemas en la organización de las rutas. | Alta      | Angela Rojas | 07/10/2026             | Cerrado | 09/10/2026                   | Revisar los campos del formulario y las validaciones correspondientes a las preferencias y restricciones del cliente. Verificar que la información se almacene correctamente y pueda consultarse posteriormente durante la planificación de las entregas. Realizar pruebas con diferentes preferencias y restricciones para comprobar que los datos se registren, validen y recuperen adecuadamente. |
| IMP-011       | 08/10/2026      | **Dificultad para considerar las restricciones del cliente en la planificación de las entregas.** Durante las pruebas, podría ocurrir que las preferencias y restricciones registradas, como los horarios permitidos para recibir pedidos o las condiciones especiales de entrega, no se tengan en cuenta al organizar las rutas. Esto podría ocasionar entregas fuera del horario solicitado, incumplimiento de las condiciones del cliente y una disminución en la calidad del servicio.                                                                                          | Alta      | Jeferson Martinez | 08/10/2026             | Cerrado | 09/10/2026                   | Revisar la comunicación entre el módulo de preferencias del cliente y el componente de planificación de rutas. Verificar que las restricciones registradas estén disponibles y sean consideradas al generar las rutas. Realizar pruebas con diferentes horarios y condiciones de entrega para comprobar que la planificación respete las restricciones definidas.                                    |

## 2. Criterios para la resolución de los impedimentos

* **IMP-010:** Las preferencias y restricciones de entrega se registran correctamente, se validan de acuerdo con las reglas del sistema y permanecen disponibles para su consulta durante la planificación de las rutas.
* **IMP-011:** Las restricciones y preferencias registradas por el cliente se consideran correctamente durante la planificación de las entregas. Las pruebas deben comprobar que las rutas respeten los horarios y condiciones configuradas, o que el sistema informe cuando no sea posible cumplirlas.

## 3. Seguimiento y actualización

Los impedimentos deberán revisarse durante las reuniones de seguimiento del equipo. Los responsables asignados informarán sobre los avances, las dificultades encontradas y las acciones aplicadas para resolverlos.

Cuando un impedimento se solucione, se actualizará su estado a **Resuelto**, se registrará la fecha real de resolución y se describirá la solución aplicada en la columna correspondiente.

**Nota:** Los impedimentos IMP-010 e IMP-011 son propuestas para el Sprint 2. Antes de incorporarlos como registros definitivos, deben confirmarse con el equipo. Las fechas, los responsables y los estados deben reflejar la situación real del proyecto. Asimismo, se debe verificar que los códigos no estén asignados a otros impedimentos.

[← Volver al README principal](../../README.md)