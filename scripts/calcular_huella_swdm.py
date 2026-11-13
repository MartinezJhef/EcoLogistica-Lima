#!/usr/bin/env python3
"""Cálculo reproducible de la huella de carbono del frontend (SWDM v4).

Genera el anexo de evidencias en Markdown a partir de los pesos reales medidos con
Lighthouse. Se implementan dos modelos:

* ``rubrica``: la fórmula simplificada indicada en el enunciado,
  ``E = GB x 0.815 kWh/GB`` y ``CO2e = E x 442 g/kWh``.
* ``swdm``: el modelo segmentado Sustainable Web Design Model v4
  (centro de datos, red y dispositivo; energía operativa e incorporada).

Uso:
    python scripts/calcular_huella_swdm.py

Los factores de conversión (árboles, kilómetros) se declaran como constantes para
que cualquier revisor pueda recalcular el resultado.
"""

from __future__ import annotations

import json
from dataclasses import dataclass
from pathlib import Path

# ---------------------------------------------------------------------------
# Coeficientes
# ---------------------------------------------------------------------------

# Fórmula simplificada de la rúbrica
RUBRICA_KWH_POR_GB = 0.815
RUBRICA_G_POR_KWH = 442.0

# SWDM v4 · energía por segmento (kWh/GB)
SWDM_OPERATIVA = {"centro_datos": 0.055, "red": 0.059, "dispositivo": 0.080}
SWDM_INCORPORADA = {"centro_datos": 0.012, "red": 0.013, "dispositivo": 0.081}
SWDM_OPERATIVA_TOTAL = sum(SWDM_OPERATIVA.values())      # 0.194
SWDM_INCORPORADA_TOTAL = sum(SWDM_INCORPORADA.values())  # 0.106
SWDM_TOTAL = SWDM_OPERATIVA_TOTAL + SWDM_INCORPORADA_TOTAL  # 0.300

# Intensidad de la red eléctrica (g CO2e/kWh)
RED_MUNDIAL = 494.0          # valor por defecto de SWDM v4 (Ember, media mundial)
RED_PERU_REFERENCIA = 280.0  # estimación conservadora; validar con MINEM/COES

# Patrón de visitas de SWDM v4
NUEVAS = 0.25
RECURRENTES = 0.75
CACHE = 0.02
FACTOR_PROMEDIO = NUEVAS + RECURRENTES * CACHE  # 0.265

# Equivalencias ambientales
KG_CO2_POR_ARBOL_ANIO = 21.77   # EPA: un árbol maduro fija ~21.77 kg CO2/año
KG_CO2_POR_KM_AUTO = 0.192      # turismo gasolina, ciclo WLTP

VISITAS_RUBRICA = 500_000       # escenario institucional del enunciado
VISITAS_PROYECTO = 20 * 260 * 2  # 20 usuarios x 260 días x 2 sesiones = 10 400

GB = 1024 * 1024  # KB -> GB binario


@dataclass
class Escenario:
    clave: str
    etiqueta: str
    kb: float


ESCENARIOS = [
    Escenario("escritorio_antes", "Escritorio · ANTES", 712),
    Escenario("escritorio_despues", "Escritorio · DESPUÉS", 65),
    Escenario("movil_antes", "Móvil · ANTES", 244),
    Escenario("movil_despues", "Móvil · DESPUÉS", 65),
]


def energia_rubrica(kb: float) -> float:
    return (kb / GB) * RUBRICA_KWH_POR_GB


def carbono_rubrica(kb: float) -> float:
    return energia_rubrica(kb) * RUBRICA_G_POR_KWH


def energia_swdm(kb: float) -> tuple[float, float]:
    gb = kb / GB
    return gb * SWDM_OPERATIVA_TOTAL, gb * SWDM_INCORPORADA_TOTAL


def carbono_swdm(kb: float, red: float = RED_MUNDIAL) -> float:
    operativa, incorporada = energia_swdm(kb)
    return operativa * red + incorporada * red


def fmt(valor: float, decimales: int = 4) -> str:
    return f"{valor:,.{decimales}f}".replace(",", " ")


def tabla_por_visita() -> str:
    filas = [
        "| Escenario | Peso (KB) | GB transferidos | Energía rúbrica (kWh) | CO₂e rúbrica (g) | CO₂e rúbrica ponderado (g) | Energía SWDM v4 (kWh) | CO₂e SWDM v4 (g) | CO₂e SWDM v4 ponderado (g) |",
        "|---|---|---|---|---|---|---|---|---|",
    ]
    for e in ESCENARIOS:
        gb = e.kb / GB
        e_rub = energia_rubrica(e.kb)
        c_rub = carbono_rubrica(e.kb)
        c_rub_p = c_rub * FACTOR_PROMEDIO
        e_sw = sum(energia_swdm(e.kb))
        c_sw = carbono_swdm(e.kb)
        c_sw_p = c_sw * FACTOR_PROMEDIO
        filas.append(
            f"| {e.etiqueta} | {e.kb:.0f} | {gb:.6f} | {e_rub:.6f} | {c_rub:.4f} | "
            f"{c_rub_p:.4f} | {e_sw:.6f} | {c_sw:.4f} | {c_sw_p:.4f} |"
        )
    return "\n".join(filas)


def tabla_anual() -> str:
    filas = [
        "| Escenario | Modelo | g CO₂e/visita (ponderado) | kg CO₂e/año · 500 000 visitas | kg CO₂e/año · 10 400 visitas |",
        "|---|---|---|---|---|",
    ]
    for e in ESCENARIOS:
        c_rub = carbono_rubrica(e.kb) * FACTOR_PROMEDIO
        c_sw = carbono_swdm(e.kb) * FACTOR_PROMEDIO
        filas.append(
            f"| {e.etiqueta} | Rúbrica | {c_rub:.4f} | {c_rub * VISITAS_RUBRICA / 1000:.2f} | "
            f"{c_rub * VISITAS_PROYECTO / 1000:.2f} |"
        )
        filas.append(
            f"| {e.etiqueta} | SWDM v4 | {c_sw:.4f} | {c_sw * VISITAS_RUBRICA / 1000:.2f} | "
            f"{c_sw * VISITAS_PROYECTO / 1000:.2f} |"
        )
    return "\n".join(filas)


def ahorro(antes: Escenario, despues: Escenario, modelo: str) -> dict[str, float]:
    if modelo == "rubrica":
        c_antes = carbono_rubrica(antes.kb) * FACTOR_PROMEDIO
        c_despues = carbono_rubrica(despues.kb) * FACTOR_PROMEDIO
    else:
        c_antes = carbono_swdm(antes.kb) * FACTOR_PROMEDIO
        c_despues = carbono_swdm(despues.kb) * FACTOR_PROMEDIO

    ahorro_visita = c_antes - c_despues
    ahorro_anual_kg = ahorro_visita * VISITAS_RUBRICA / 1000
    return {
        "antes_g": c_antes,
        "despues_g": c_despues,
        "ahorro_g": ahorro_visita,
        "reduccion_pct": (ahorro_visita / c_antes) * 100 if c_antes else 0.0,
        "ahorro_anual_kg": ahorro_anual_kg,
        "arboles": ahorro_anual_kg / KG_CO2_POR_ARBOL_ANIO,
        "km_auto": ahorro_anual_kg / KG_CO2_POR_KM_AUTO,
    }


def generar_markdown() -> str:
    escritorio = ahorro(ESCENARIOS[0], ESCENARIOS[1], "rubrica")
    movil = ahorro(ESCENARIOS[2], ESCENARIOS[3], "rubrica")
    swdm = ahorro(ESCENARIOS[0], ESCENARIOS[1], "swdm")

    return f"""# Cálculo de la huella de carbono con SWDM v4

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
| **Total** | **{SWDM_OPERATIVA_TOTAL:.3f}** | **{SWDM_INCORPORADA_TOTAL:.3f}** |

Energía total por gigabyte: **{SWDM_TOTAL:.3f} kWh/GB**.

### 1.3 Parámetros de visita y red

| Parámetro | Valor | Fuente |
|---|---:|---|
| Visitas nuevas | {NUEVAS:.0%} | SWDM v4 (valor por defecto) |
| Visitas recurrentes | {RECURRENTES:.0%} | SWDM v4 (valor por defecto) |
| Ratio de caché del navegador | {CACHE:.0%} | SWDM v4 (valor por defecto) |
| Factor promedio por visita | {FACTOR_PROMEDIO:.3f} | {NUEVAS:.2f} + {RECURRENTES:.2f} × {CACHE:.2f} |
| Intensidad de red (mundial) | {RED_MUNDIAL:.0f} g CO₂e/kWh | Ember, media mundial (valor por defecto de SWDM v4) |
| Intensidad de red (Perú, referencia) | {RED_PERU_REFERENCIA:.0f} g CO₂e/kWh | Matriz predominantemente hidroeléctrica; pendiente de validación con MINEM/COES |
| Fijación de un árbol maduro | {KG_CO2_POR_ARBOL_ANIO} kg CO₂/año | EPA |
| Emisión de un turismo | {KG_CO2_POR_KM_AUTO} kg CO₂/km | Ciclo WLTP |

---

## 2. Ejemplo paso a paso (escritorio · ANTES, 712 KB)

1. **Gigabytes transferidos:** 712 KB ÷ 1 048 576 = **{712 / GB:.6f} GB**.
2. **Energía (rúbrica):** {712 / GB:.6f} GB × 0.815 kWh/GB = **{energia_rubrica(712):.6f} kWh**.
3. **Emisión de una visita nueva:** {energia_rubrica(712):.6f} kWh × 442 g/kWh = **{carbono_rubrica(712):.4f} g CO₂e**.
4. **Ponderación por visitas:** {carbono_rubrica(712):.4f} g × {FACTOR_PROMEDIO:.3f} = **{carbono_rubrica(712) * FACTOR_PROMEDIO:.4f} g CO₂e/visita**.
5. **Energía (SWDM v4):** {712 / GB:.6f} GB × {SWDM_TOTAL:.3f} kWh/GB = **{sum(energia_swdm(712)):.6f} kWh**.
6. **Emisión SWDM v4:** {sum(energia_swdm(712)):.6f} kWh × {RED_MUNDIAL:.0f} g/kWh = **{carbono_swdm(712):.4f} g CO₂e**; ponderada, **{carbono_swdm(712) * FACTOR_PROMEDIO:.4f} g CO₂e/visita**.

---

## 3. Resultados por visita

{tabla_por_visita()}

> El peso incluye HTML, CSS, JavaScript, tipografías, imágenes y las peticiones
> medidas por Lighthouse. «Ponderado» aplica el patrón {NUEVAS:.0%}/{RECURRENTES:.0%}
> de visitas nuevas y recurrentes con un {CACHE:.0%} de caché.

---

## 4. Proyección anual

{tabla_anual()}

### 4.1 Ahorro del escenario de referencia (500 000 visitas/año)

| Métrica | Escritorio | Móvil |
|---|---:|---:|
| Emisión ANTES (g/visita) | {escritorio['antes_g']:.4f} | {movil['antes_g']:.4f} |
| Emisión DESPUÉS (g/visita) | {escritorio['despues_g']:.4f} | {movil['despues_g']:.4f} |
| Reducción por visita (g) | {escritorio['ahorro_g']:.4f} | {movil['ahorro_g']:.4f} |
| Reducción relativa | {escritorio['reduccion_pct']:.1f} % | {movil['reduccion_pct']:.1f} % |
| Ahorro anual (kg CO₂e) | {escritorio['ahorro_anual_kg']:.2f} | {movil['ahorro_anual_kg']:.2f} |
| Árboles equivalentes | {escritorio['arboles']:.2f} | {movil['arboles']:.2f} |
| Kilómetros evitados | {escritorio['km_auto']:.0f} | {movil['km_auto']:.0f} |

Con el modelo segmentado SWDM v4 el ahorro del escritorio es de
**{swdm['ahorro_anual_kg']:.2f} kg CO₂e/año** ({swdm['reduccion_pct']:.1f} % menos),
equivalente a **{swdm['arboles']:.2f} árboles** o **{swdm['km_auto']:.0f} km** en automóvil.

### 4.2 Sensibilidad a la intensidad de la red peruana

| Intensidad de red | CO₂e escritorio ANTES (g/visita) | CO₂e escritorio DESPUÉS (g/visita) | Ahorro anual · 500 000 visitas |
|---|---:|---:|---:|
| {RED_MUNDIAL:.0f} g/kWh (mundial) | {carbono_swdm(712):.4f} | {carbono_swdm(65):.4f} | {(carbono_swdm(712) - carbono_swdm(65)) * FACTOR_PROMEDIO * VISITAS_RUBRICA / 1000:.2f} kg |
| {RED_PERU_REFERENCIA:.0f} g/kWh (Perú, referencia) | {carbono_swdm(712, RED_PERU_REFERENCIA):.4f} | {carbono_swdm(65, RED_PERU_REFERENCIA):.4f} | {(carbono_swdm(712, RED_PERU_REFERENCIA) - carbono_swdm(65, RED_PERU_REFERENCIA)) * FACTOR_PROMEDIO * VISITAS_RUBRICA / 1000:.2f} kg |

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
"""


def main() -> None:
    import argparse
    import sys

    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8")

    parser = argparse.ArgumentParser(description="Cálculo de huella de carbono SWDM v4")
    parser.add_argument(
        "--json",
        action="store_true",
        help="Escribe además el resultado en evidencias/swdm-v4.json",
    )
    parser.add_argument(
        "--markdown",
        action="store_true",
        help="Escribe el anexo en evidencias/calculo-swdm-v4.md",
    )
    args = parser.parse_args()

    markdown = generar_markdown()

    destino = Path(__file__).resolve().parent.parent / "docs" / "03 Implementación" \
        / "reduccion del impacto ambiental" / "evidencias"

    if args.markdown:
        destino.mkdir(parents=True, exist_ok=True)
        (destino / "calculo-swdm-v4.md").write_text(markdown, encoding="utf-8")
        print(f"Markdown escrito en {destino / 'calculo-swdm-v4.md'}")
    else:
        print(markdown)

    if args.json:
        destino.mkdir(parents=True, exist_ok=True)
        datos = {
            "coeficientes": {
                "rubrica_kwh_por_gb": RUBRICA_KWH_POR_GB,
                "rubrica_g_por_kwh": RUBRICA_G_POR_KWH,
                "swdm_operativa_kwh_por_gb": SWDM_OPERATIVA,
                "swdm_incorporada_kwh_por_gb": SWDM_INCORPORADA,
                "red_mundial_g_por_kwh": RED_MUNDIAL,
                "factor_promedio_visita": FACTOR_PROMEDIO,
            },
            "escenarios": [
                {
                    "clave": e.clave,
                    "kb": e.kb,
                    "rubrica_g_visita": round(carbono_rubrica(e.kb) * FACTOR_PROMEDIO, 6),
                    "swdm_g_visita": round(carbono_swdm(e.kb) * FACTOR_PROMEDIO, 6),
                }
                for e in ESCENARIOS
            ],
            "ahorro_escritorio_500k": {k: round(v, 4) for k, v in ahorro(ESCENARIOS[0], ESCENARIOS[1], "rubrica").items()},
            "ahorro_movil_500k": {k: round(v, 4) for k, v in ahorro(ESCENARIOS[2], ESCENARIOS[3], "rubrica").items()},
        }
        (destino / "swdm-v4.json").write_text(
            json.dumps(datos, ensure_ascii=False, indent=2), encoding="utf-8"
        )
        print(f"\nJSON escrito en {destino / 'swdm-v4.json'}")


if __name__ == "__main__":
    main()
