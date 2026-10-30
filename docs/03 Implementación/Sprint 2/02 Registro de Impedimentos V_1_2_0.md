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
| **Versión** | 1.2.0 |

---

## Registro de impedimentos

**Sprint:** Sprint 2

**Historia de Usuario Relacionada:** US-003 – Gestionar pedidos y geolocalización

**Épica:** EP-03 – Gestión de Pedidos y Geolocalización

## 1. Registro de impedimentos

| Impedimento # | Fecha de Registro | Descripción del Impedimento e Impacto                                                                                                                                                                                                                                                                                                                                      | Prioridad | Reportado por               | Fecha tope de Resolución | Estado      | Fecha de Resolución | Resolución / Comentarios                                                                                                                                                                                                                                                                               |
| ------------- | ----------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------- | --------------------------- | ------------------------ | ----------- | ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| IMP-006       | 05/10/2026      | **Validación inconsistente de las dimensiones y ventanas horarias de los pedidos.** Durante las pruebas, podría ocurrir que el sistema acepte valores inválidos de peso o volumen, o ventanas de entrega en las que la hora final sea menor o igual a la hora inicial. Esto afectaría la calidad de los datos y podría generar problemas en la planificación de las rutas. | Alta      | Jeferson Martinez |    05/10/2026      | Cerrado | 09/10/2026                   | Revisar las validaciones del formulario y del backend. Comprobar que el peso y el volumen sean mayores que cero y que la hora final sea posterior a la hora inicial. Realizar pruebas con datos válidos e inválidos.                                                                                   |
| IMP-007       | 05/10/2026      | **Posible pérdida de información al corregir un pedido.** Durante las pruebas del registro, podría ocurrir que los datos ingresados se pierdan cuando el usuario regresa a un formulario anterior o modifica algún campo. Esto ocasionaría que tenga que ingresar nuevamente la información, aumentando el tiempo de registro y la posibilidad de cometer errores.         | Media     | Zayuri Cerron | 05/10/2026             | Cerrado | 09/10/2026                   | Revisar el formulario y el manejo de los datos ingresados. Realizar pruebas al modificar campos y regresar entre pantallas, verificando que la información se conserve hasta guardar el pedido correctamente.                                                                                          |
| IMP-008       | 06/10/2026      | **Mensajes de validación poco claros al registrar pedidos.** El formulario podría rechazar información incorrecta sin indicar qué campo debe corregirse, o no orientar adecuadamente al usuario cuando falta información obligatoria. Esto dificultaría el registro de pedidos y podría ocasionar errores en los datos utilizados para planificar las entregas.            | Media     | Maylit Mendoza | 06/10/2026             | Cerrado | 09/10/2026                   | Mejorar los mensajes de validación del formulario. Probar los campos del cliente, dirección, dimensiones de carga, ubicación y horario de entrega para asegurar que el usuario pueda identificar y corregir los errores.                                                                               |
| IMP-009       | 06/10/2026      | **Error al guardar los pedidos en la base de datos.** Durante las pruebas, podría ocurrir que un pedido validado no se guarde correctamente o que el sistema no muestre una confirmación clara después del registro. Esto podría generar intentos repetidos, registros duplicados o dificultades para disponer de los pedidos durante la planificación de rutas.           | Alta      | Diego Angulo | 06/10/2026             | Cerrado | 09/10/2026                   | Revisar la comunicación entre el formulario, el servicio de registro y la base de datos. Verificar las respuestas del sistema, los mensajes de confirmación y el manejo de errores. Realizar pruebas para comprobar que los pedidos se guarden correctamente y que no se generen registros duplicados. |

## 2. Criterios para la resolución de los impedimentos

* **IMP-006:** Las validaciones impiden registrar dimensiones inválidas y ventanas horarias inconsistentes.
* **IMP-007:** La información ingresada se conserva al modificar campos o regresar entre pantallas.
* **IMP-008:** Los mensajes de validación identifican claramente los campos que deben corregirse.
* **IMP-009:** Los pedidos se guardan correctamente, el sistema confirma el resultado y se controlan los intentos repetidos.

## 3. Seguimiento y actualización

Los impedimentos registrados deberán revisarse durante las reuniones de seguimiento del equipo. Cada responsable deberá informar los avances, las dificultades encontradas y las acciones aplicadas para resolverlos.

Cuando un impedimento se solucione, se actualizará su estado a **Resuelto**, se registrará la fecha real de resolución y se describirá la solución aplicada en la columna correspondiente.

**Nota:** Los impedimentos IMP-006 al IMP-009 son propuestas para el Sprint 2. Antes de incorporarlos como registros definitivos, se deben confirmar con el equipo y reemplazar las fechas y los responsables pendientes por información real. Se debe comprobar también que los códigos no estén asignados a otros impedimentos.

[← Volver al README principal](../../README.md)