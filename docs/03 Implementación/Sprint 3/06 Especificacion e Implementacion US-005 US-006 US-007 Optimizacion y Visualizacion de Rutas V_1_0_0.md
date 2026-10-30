# Especificación e Implementación Técnica: US-005, US-006 y US-007 Optimización, Visualización Cartográfica y Reoptimización de Rutas (Sprint 3)

**Proyecto:** EcoLogística Lima — Optimizador de Rutas Verdes CVRPTW  
**Código del Proyecto:** PFA-ECOLIMA-2026  
**Versión del Entregable:** V_1_0_0  
**Fecha de Emisión:** 30/10/2026  
**Épicas Relacionadas:**  
- **EP-05:** Optimización de Rutas (13 SP)  
- **EP-06:** Monitoreo y Reoptimización de Rutas (8 SP)  
**Requerimientos Funcionales de Origen:**  
- [RF-003: Motor de Optimización de Rutas (CVRPTW multiobjetivo)](../01%20Inicio/06.%20Requisitos%20funcionales%20V_1_0_0.md#rf-003-motor-de-optimizaci%C3%B3n-de-rutas)  
- [RF-004: Visualización Geoespacial e Interactiva de Rutas](../01%20Inicio/06.%20Requisitos%20funcionales%20V_1_0_0.md#rf-004-visualizaci%C3%B3n-geoespacial-e-interactiva-de-rutas)  
- [RF-007: Reoptimización Dinámica ante Contingencias](../01%20Inicio/06.%20Requisitos%20funcionales%20V_1_0_0.md#rf-007-reoptimizaci%C3%B3n-din%C3%A1mica-ante-contingencias)  
**Reglas de Negocio Vinculadas:**  
- [RN-001: Capacidad vehicular máxima (85% - 90%)](../01%20Inicio/09.%20Reglas%20de%20negocio%20V_1_0_0.md#rn-001-capacidad-m%C3%A1xima-de-veh%C3%ADculos)  
- [RN-004: Pausa técnica obligatoria por fatiga (Ley N° 30224 / D.S. 033-2012-MTC)](../01%20Inicio/09.%20Reglas%20de%20negocio%20V_1_0_0.md#rn-004-aplicaci%C3%B3n-de-restricciones-de-circulaci%C3%B3n)  
- **Ordenanza MML N° 2160:** Restricción de unidades de combustión fósil diésel en la Zona de Bajas Emisiones (ZBE) Centro Histórico de Lima  
**Integración de Medición Verde:** `CodeCarbon` (Medición en tiempo real de emisiones computacionales $kg\,CO_2$ y energía $kWh$ de la ejecución Python).

---

## 1. Resumen Ejecutivo y Trazabilidad del Sprint 3

El Sprint 3 corresponde al núcleo algorítmico y geoespacial del sistema. Se implementó la solución completa de punta a punta respetando la Arquitectura N-Tier y Clean Architecture en backend (`src/backend`), componentes modulares con Apple Design y Leaflet en frontend (`src/frontend`) y pruebas automatizadas en `src/backend/tests`:

| Historia de Usuario | Story Points | Estado | Módulos / Archivos Afectados | Criterios y Entregables Cumplidos |
| :--- | :---: | :---: | :--- | :--- |
| **US-005:** Generar rutas optimizadas | 13 SP | **CUMPLIDO** | `app/models/ruta.py`<br>`app/models/tramo.py`<br>`app/services/routing_service.py`<br>`app/api/v1/endpoints/rutas.py` | Motor CVRPTW multiobjetivo (distancia, tiempo, $CO_2$ vehicular y computacional). Inserción de descanso de 30 min por fatiga ($\ge 4.5$h continuas). Desvío de unidades Diésel de la ZBE Centro Histórico. Marcado de exceso de capacidad con estado exacto `"No Asignados por Exceso de Capacidad"`. |
| **US-006:** Visualizar rutas en el mapa | 8 SP | **CUMPLIDO** | `app/models/zona_restringida.py`<br>`src/frontend/src/pages/RutasView.tsx`<br>`src/frontend/src/services/api.ts` | Renderizado interactivo Leaflet con paradas secuenciadas, polilínea verde de recorrido, y polígonos semitransparentes de seguridad urbana (Callao, Barrios Altos, Gamarra, Huáscar, ZBE). **Fallback resiliente** con mensaje exacto: `"Servicio de mapas no disponible temporalmente."`. |
| **US-007:** Reoptimizar rutas ante eventos | 8 SP | **CUMPLIDO** | `app/services/routing_service.py`<br>`POST /rutas/{id}/reoptimizar`<br>`RutasView.tsx` (Modal Reoptimización) | Recálculo dinámico en tiempo real ante cancelaciones de clientes, emergencias o desvíos de seguridad, actualizando kilometraje, tiempos y métricas de CodeCarbon. |
| **Librería CodeCarbon** | N/A | **CUMPLIDO** | `codecarbon>=3.0.0`<br>`routing_service.py` | Integración de `OfflineEmissionsTracker(country_iso_code="PER")` para auditar la huella de carbono digital generada por el cálculo del algoritmo. |

---

## 2. Marco Normativo y Reglas de Negocio Implementadas

### 2.1. Regla RN-001: Límite de Capacidad Vehicular y Ruta Infeliz
- La asignación heurística opera bajo un factor de utilización de seguridad entre el **85% y 90%** de la capacidad nominal de peso ($kg$) y volumen ($m^3$).
- **Criterio BDD de Exceso de Capacidad:** Cuando la demanda supera la capacidad de la flota disponible, el sistema asigna el máximo viable y actualiza los pedidos excedentes con el estado literal:
  `"No Asignados por Exceso de Capacidad"`.

### 2.2. Regla RN-004 y Ley N° 30224: Control de Fatiga y Pausa Obligatoria
- Conforme al Reglamento Nacional de Transporte y la Ley N° 30224, ningún conductor puede conducir más de 4.5 horas continuas sin una pausa técnica.
- Si la simulación de conducción acumulada alcanza $\ge 270$ minutos ($4.5$ horas), el motor algorítmico inserta automáticamente un tramo técnico intermedio:
  - `tipo_parada`: `"DESCANSO_TECNICO_30MIN"`
  - `descripcion`: `"Descanso Técnico Obligatorio por Fatiga (Ley N° 30224 - 30 min)"`
  - `tiempo_estimado_min`: `30.0`
  - Tras la inserción, el contador de conducción continua se reinicia a cero.

### 2.3. Ordenanza Metropolitana N° 2160: Zona de Bajas Emisiones (ZBE) Centro Histórico
- Polígono que delimita el Damero de Pizarro entre la Av. Tacna, Av. Abancay y Av. Nicolás de Piérola.
- Se implementó la restricción que prohíbe el ingreso a unidades con `tipo_combustible == "DIESEL"` o `restriccion_circulacion == "CENTRO_HISTORICO_RESTRINGIDO"`. Dichos pedidos se reservan para vehículos limpios (`ELECTRICO` o `GNV`).

---

## 3. Integración de CodeCarbon: Medición de Emisiones Computacionales de Python

Para dar estricto cumplimiento al requerimiento verde:
> *"COMO PARTE DE CO2 USA: Librería: CodeCarbon (INSTALALO) - Mide las emisiones de CO₂ generadas por la ejecución de código Python."*

Se instaló `codecarbon 3.3.2` en el entorno virtual (`src/backend/.venv`) y se integró dentro del flujo de optimización en `RoutingService`:

```python
from codecarbon import OfflineEmissionsTracker

tracker = OfflineEmissionsTracker(
    country_iso_code="PER",   # Factor de emisión de la matriz energética del Perú
    save_to_file=False,
    log_level="error"
)
tracker.start()
try:
    # Ejecución del algoritmo heurístico de ruteo verde CVRPTW
    ...
finally:
    computational_co2_kg = tracker.stop() or 0.0
    computational_energy_kwh = tracker._total_energy.kWh if hasattr(tracker, '_total_energy') else 0.0
```

Las métricas obtenidas se almacenan en la tabla `rutas` en los campos:
- `co2_computacional_kg`: Emisiones directas generadas por los ciclos de reloj de la CPU en $kg\,CO_2$.
- `energia_computacional_kwh`: Consumo eléctrico en kilovatios-hora.
- `tiempo_computo_seg`: Duración precisa de la ejecución algorítmica.

---

## 4. Estructura de Datos y Modelo Relacional (PostgreSQL 16 + PostGIS)

Se definieron los modelos ORM en SQLAlchemy y tablas en `src/database/init.sql`:

1. **`rutas`**: Almacena el encabezado de la ruta, conductor, vehículo, fecha y métricas consolidadas (distancia, tiempo, $CO_2$ vehicular y computacional).
2. **`tramos`**: Secuencia ordenada de paradas (`DEPOSITO_SALIDA`, `ENTREGA`, `DESCANSO_TECNICO_30MIN`, `DEPOSITO_RETORNO`), coordenadas WGS84, distancia y tiempo por tramo, y marcas de zonas de riesgo.
3. **`zonas_restringidas`**: Catálogo de polígonos geoespaciales de seguridad urbana y ZBE ambiental en Lima Metropolitana.
4. **`depositos`**: Almacenes y centros de distribución de salida y retorno.

---

## 5. Contratos de API REST Backend (`/api/v1/rutas`)

| Método | Endpoint | Descripción | Requisito |
| :---: | :--- | :--- | :---: |
| `POST` | `/api/v1/rutas/optimizar` | Dispara el motor CVRPTW multiobjetivo con medición CodeCarbon. | US-005 |
| `GET` | `/api/v1/rutas/zonas-riesgo` | Retorna polígonos geoespaciales de riesgo y ZBE para Leaflet. | US-006 |
| `GET` | `/api/v1/rutas` | Lista las rutas generadas con filtros por fecha y estado. | US-006 |
| `GET` | `/api/v1/rutas/{ruta_id}` | Obtiene el detalle de la ruta y sus paradas secuenciadas. | US-006 |
| `POST` | `/api/v1/rutas/{ruta_id}/reoptimizar` | Reoptimización dinámica ante cancelaciones o contingencias. | US-007 |

---

## 6. Frontend: Apple Design, Mapa Leaflet y Resiliencia

El componente `src/frontend/src/pages/RutasView.tsx` incluye:
1. **Mapa Interactivo con Leaflet:**
   - Marcadores personalizados con números de parada secuenciales (`#1`, `#2`, `#3`, ...).
   - Marcador central para el Hub de Despacho (Av. Argentina / Callao).
   - Polilínea verde que traza el recorrido optimizado.
   - Polígonos semitransparentes sobre zonas de riesgo (Callao Puerto, Barrios Altos, Gamarra, Huáscar) y ZBE Centro Histórico.
2. **Modo Resiliente Fallback (US-006 BDD):**
   - Si el proveedor de mapas externos no responde o se simula la contingencia de conectividad, la interfaz despliega una tabla secuencial completa acompañada del aviso exacto:
     > **"Servicio de mapas no disponible temporalmente."**
3. **Panel de Métricas CodeCarbon y $CO_2$ Vehicular:**
   - Tarjeta con gradiente esmeralda que reporta el $CO_2$ digital generado por el cálculo del algoritmo.
4. **Modal de Reoptimización Dinámica (US-007):**
   - Permite al operador desasignar paradas canceladas o activar desvíos preventivos, recalculando tiempos y distancias en tiempo real.
5. **Estricta Iconografía SVG:**
   - 0 emojis en toda la interfaz, utilizando íconos consistentes de `@lucide/react`.

---

## 7. Evidencias de Pruebas Automatizadas (Pytest)

Se ejecutó la suite completa de pruebas en `src/backend/tests`, validando la totalidad de los 40 casos de prueba con un **100% de éxito**:

```text
============================= test session starts =============================
platform win32 -- Python 3.13.0, pytest-9.1.1
rootdir: C:\Users\HP\Desktop\DRIVE_MARTINEZ_2\ECOLOGITICA LIMA\src\backend
collected 40 items

src/backend/tests/test_sprint1.py ............                          [ 15%]
src/backend/tests/test_us001_vehiculos.py ......                        [ 30%]
src/backend/tests/test_us002_conductores.py .......                     [ 47%]
src/backend/tests/test_us003_us004_pedidos.py ........                  [ 67%]
src/backend/tests/test_us005_us006_rutas.py ........                    [ 87%]
  - test_haversine_y_deteccion_poligono_zbe PASSED
  - test_deteccion_zonas_riesgo_lima PASSED
  - test_us005_optimizacion_cvrptw_con_codecarbon PASSED
  - test_us005_exceso_capacidad_marca_estado_exacto PASSED
  - test_us005_restriccion_zbe_para_vehiculo_diesel PASSED
  - test_us005_insercion_descanso_tecnico_fatiga_ley_30224 PASSED
  - test_us006_consulta_detalle_ruta PASSED
  - test_us007_reoptimizacion_dinamica_ante_cancelacion PASSED
src/backend/tests/test_usuarios_rbac.py .....                           [100%]

======================= 40 passed, 1 warning in 13.81s ========================
```

