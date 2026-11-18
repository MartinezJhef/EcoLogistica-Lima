# Verificación hasta Sprint 3 — 18 de noviembre de 2026

Base: `c2357c1ef500d1174a202a191601c672fa671830` de `MartinezJhef/EcoLogistica-Lima`. El cierre formal depende del PR y de su validación en el entorno compartido; las comprobaciones locales no se presentan como una aprobación de un compañero.

| Comprobación | Resultado |
|---|---|
| Servidor | 64 pruebas aprobadas; cobertura de líneas 83 % |
| PostgreSQL/PostGIS real | 1 prueba adicional aprobada; PostgreSQL 16.16/PostGIS 3.7.0 desechable; migración aplicada dos veces |
| Web | 210 pruebas aprobadas; líneas 82,71 %, sentencias 81,11 %; umbral de ambas 80 % |
| Móvil | 21 pruebas aprobadas; cobertura global 1004/1163 líneas: 86.33 %; umbral 80 % |
| Compilación web | TypeScript, Vite 8.3.8 y precompresión aprobados |
| Compilación Flutter web | Aprobada con Flutter 3.50; no equivale a un APK Android ni a una prueba en un teléfono físico |
| Análisis móvil | Sin errores ni advertencias; avisos informativos de APIs Material/Cupertino heredadas |
| Diseño móvil | Pruebas de cliente y conductor a 414 × 896 px, sin excepciones de distribución; capturas generadas localmente |
| Seguridad Python | Bandit sin hallazgos altos; pip-audit sin vulnerabilidades conocidas en 63 dependencias resueltas |
| Seguridad web | Eliminados los avisos críticos antiguos de Vitest/Tinypool. Persiste un aviso alto de picomatch 4.0.7, sin corrección publicada en la consulta, usado por las herramientas de desarrollo; la imagen final de la web solo sirve archivos estáticos y no incluye esas dependencias |

## Flujo completo sobre base y calles reales

- Cliente autenticado registra pedido propio y guarda sus preferencias en PostgreSQL real.
- Ruta sobre calles OSRM: 24.17 km, 92 min; planificación 1.91 s; CO2 eléctrico cero.
- El conductor recibe y confirma el itinerario persistido; la cola queda vacía.
- Entrega en tránsito bloquea cambios del cliente; entrega y regreso confirmado completan la ruta.

Las cuentas, vehículos y pedidos de esta comprobación son sintéticos y están en una base local desechable. Sus claves, datos de conexión, tokens y registros no se incluyen en el repositorio.

## Correcciones verificadas

- El móvil encola cada cambio incluso con conexión; solo la respuesta aceptada del servidor lo confirma. Un rechazo conserva datos y orden de reintentos.
- El registro móvil envía peso, volumen, horarios, acceso y referencia reales. Geocodifica la dirección o admite coordenadas verificadas; no confirma un envío fallido.
- Cliente y conductor consultan sus datos autorizados. Las preferencias se guardan en servidor y se bloquean en tránsito. El conductor recibe geometría vial persistida y puede confirmar el regreso al depósito.
- Se retiraron pantallas/componentes sin integración que simulaban aceptación de fletes, fotografía, ubicación en vivo y recorridos. Los flujos activos del Sprint 3 usan estados de la API; no se implementó seguimiento GPS vivo del Sprint 4.
- Web: guardado sin éxito ficticio, fecha de licencia, vinculación de cuentas, geocodificación, restricciones, incidencias y alertas sobre la geometría recorrida.
- Planificador: jornada, retorno, ventanas, espera, descansos, capacidades, recursos no duplicados, selección de varias cargas pequeñas y del vehículo compatible, cancelación, urgencia y redistribución por avería.
- Docker recibe la URL web de la API, CORS y OSRM configurados. El workflow exige cobertura en las tres capas y prepara compilación Android y despliegue/aceptación en un entorno Docker desechable.

## Pendiente para el cierre formal

1. Publicar la rama autorizada y ejecutar los workflows en GitHub. La compilación APK y el trabajo Docker de staging están preparados; no se ejecutaron localmente por falta de esos entornos.
2. Obtener la revisión y aprobación de al menos un compañero mediante PR, como exige el DoD del proyecto.
3. Configurar, migrar y validar el entorno compartido del equipo con sus cuentas y recursos reales; integrar en main después de esa revisión. No se inventaron fechas de licencia, alturas ni propietarios de pedidos antiguos.

No se modificó Jira. La publicación había sido bloqueada por la revisión automática por posibles datos sensibles y credenciales de demostración; no se eludió el bloqueo por otro medio. Consultar el resultado de publicación más reciente en la conversación.
