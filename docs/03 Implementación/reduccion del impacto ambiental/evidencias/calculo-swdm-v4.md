# Cálculo de la huella de carbono con SWDM v4

Anexo generado con `python scripts/calcular_huella_swdm.py` a partir de los pesos
medidos con Lighthouse sobre la compilación de producción servida con Brotli,
gzip, `Cache-Control` y `ETag` (ver el informe 01).

[Volver al informe](../01%20Informe%20de%20reduccion%20del%20impacto%20ambiental%20V_1_0_0.md)

---

## 1. Coeficientes utilizados

### 1.1 Fórmula simplificada de la rúbrica

```text
E  = ancho_de_banda (GB) × 0.815 kWh/GB
CO₂e = E × 442 g CO₂e/kWh
```

### 1.2 Modelo SWDM v4 segmentado

| Segmento | Energía operativa (kWh/GB) | Energía incorporada (kWh/GB) |
|---|---:|---:|
| Centro de datos | 0.055 | 0.012 |
| Red de transmisión | 0.059 | 0.013 |
| Dispositivo del usuario | 0.080 | 0.081 |
| **Total** | **0.194** | **0.106** |

Energía total por gigabyte: **0.300 kWh/GB**.

### 1.3 Parámetros de visita y red

| Parámetro | Valor | Fuente |
|---|---:|---|
| Visitas nuevas | 25% | SWDM v4 (valor por defecto) |
| Visitas recurrentes | 75% | SWDM v4 (valor por defecto) |
| Ratio de caché del navegador | 2% | SWDM v4 (valor por defecto) |
| Factor promedio por visita | 0.265 | 0.25 + 0.75 × 0.02 |
| Intensidad de red (mundial) | 494 g CO₂e/kWh | Ember, media mundial (valor por defecto de SWDM v4) |
| Intensidad de red (Perú, referencia) | 280 g CO₂e/kWh | Matriz predominantemente hidroeléctrica; pendiente de validación con MINEM/COES |
| Fijación de un árbol maduro | 21.77 kg CO₂/año | EPA |
| Emisión de un turismo | 0.192 kg CO₂/km | Ciclo WLTP |

---

## 2. Ejemplo paso a paso (escritorio · ANTES, 712 KB)

1. **Gigabytes transferidos:** 712 KB ÷ 1 048 576 = **0.000679 GB**.
2. **Energía (rúbrica):** 0.000679 GB × 0.815 kWh/GB = **0.000553 kWh**.
3. **Emisión de una visita nueva:** 0.000553 kWh × 442 g/kWh = **0.2446 g CO₂e**.
4. **Ponderación por visitas:** 0.2446 g × 0.265 = **0.0648 g CO₂e/visita**.
5. **Energía (SWDM v4):** 0.000679 GB × 0.300 kWh/GB = **0.000204 kWh**.
6. **Emisión SWDM v4:** 0.000204 kWh × 494 g/kWh = **0.1006 g CO₂e**; ponderada, **0.0267 g CO₂e/visita**.

---

## 3. Resultados por visita

| Escenario | Peso (KB) | GB transferidos | Energía rúbrica (kWh) | CO₂e rúbrica (g) | CO₂e rúbrica ponderado (g) | Energía SWDM v4 (kWh) | CO₂e SWDM v4 (g) | CO₂e SWDM v4 ponderado (g) |
|---|---|---|---|---|---|---|---|---|
| Escritorio · ANTES | 712 | 0.000679 | 0.000553 | 0.2446 | 0.0648 | 0.000204 | 0.1006 | 0.0267 |
| Escritorio · DESPUÉS | 65 | 0.000062 | 0.000051 | 0.0223 | 0.0059 | 0.000019 | 0.0092 | 0.0024 |
| Móvil · ANTES | 244 | 0.000233 | 0.000190 | 0.0838 | 0.0222 | 0.000070 | 0.0345 | 0.0091 |
| Móvil · DESPUÉS | 65 | 0.000062 | 0.000051 | 0.0223 | 0.0059 | 0.000019 | 0.0092 | 0.0024 |

> El peso incluye HTML, CSS, JavaScript, tipografías, imágenes y las peticiones
> medidas por Lighthouse. «Ponderado» aplica el patrón 25%/75%
> de visitas nuevas y recurrentes con un 2% de caché.

---

## 4. Proyección anual

| Escenario | Modelo | g CO₂e/visita (ponderado) | kg CO₂e/año · 500 000 visitas | kg CO₂e/año · 10 400 visitas |
|---|---|---|---|---|
| Escritorio · ANTES | Rúbrica | 0.0648 | 32.41 | 0.67 |
| Escritorio · ANTES | SWDM v4 | 0.0267 | 13.33 | 0.28 |
| Escritorio · DESPUÉS | Rúbrica | 0.0059 | 2.96 | 0.06 |
| Escritorio · DESPUÉS | SWDM v4 | 0.0024 | 1.22 | 0.03 |
| Móvil · ANTES | Rúbrica | 0.0222 | 11.11 | 0.23 |
| Móvil · ANTES | SWDM v4 | 0.0091 | 4.57 | 0.10 |
| Móvil · DESPUÉS | Rúbrica | 0.0059 | 2.96 | 0.06 |
| Móvil · DESPUÉS | SWDM v4 | 0.0024 | 1.22 | 0.03 |

### 4.1 Ahorro del escenario de referencia (500 000 visitas/año)

| Métrica | Escritorio | Móvil |
|---|---:|---:|
| Emisión ANTES (g/visita) | 0.0648 | 0.0222 |
| Emisión DESPUÉS (g/visita) | 0.0059 | 0.0059 |
| Reducción por visita (g) | 0.0589 | 0.0163 |
| Reducción relativa | 90.9 % | 73.4 % |
| Ahorro anual (kg CO₂e) | 29.45 | 8.15 |
| Árboles equivalentes | 1.35 | 0.37 |
| Kilómetros evitados | 153 | 42 |

Con el modelo segmentado SWDM v4 el ahorro del escritorio es de
**12.12 kg CO₂e/año** (90.9 % menos),
equivalente a **0.56 árboles** o **63 km** en automóvil.

### 4.2 Sensibilidad a la intensidad de la red peruana

| Intensidad de red | CO₂e escritorio ANTES (g/visita) | CO₂e escritorio DESPUÉS (g/visita) | Ahorro anual · 500 000 visitas |
|---|---:|---:|---:|
| 494 g/kWh (mundial) | 0.1006 | 0.0092 | 12.12 kg |
| 280 g/kWh (Perú, referencia) | 0.0570 | 0.0052 | 6.87 kg |

---

## 5. Verificación y límites

1. **Trazabilidad:** los pesos provienen de `evidencias/lighthouse/lh-escritorio-antes.json`,
   `evidencias/lighthouse/lh-escritorio-despues.json`, `evidencias/lighthouse/lh-movil-antes.json`
   y `evidencias/lighthouse/lh-movil-despues.json`, además de
   `evidencias/precompression-report.json`.
2. **Doble modelo:** la rúbrica usa una fórmula simplificada; SWDM v4 separa energía
   operativa e incorporada y aplica intensidad de red por segmento. Ambos se
   presentan para que la comparación sea auditable.
3. **Alcance:** se modela la transferencia de red de la pantalla de inicio de sesión.
   Los módulos internos se descargan bajo demanda y añaden su propio chunk; su peso
   se mide en la auditoría de cada ruta autenticada.
4. **Límites:** el cálculo no incluye el consumo del backend ni el de la base de datos
   (se reporta por separado con CodeCarbon en los sprints de implementación), ni la
   fabricación del dispositivo más allá de la energía incorporada por gigabyte.
5. **Reproducibilidad:** `python scripts/calcular_huella_swdm.py --json` escribe
   `evidencias/swdm-v4.json` con los mismos valores en formato máquina.
