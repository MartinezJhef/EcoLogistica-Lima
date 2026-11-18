"""Optional CodeCarbon measurement; hardware failures never become invented measurements."""
import functools
import logging
import os
import time


def measured(function):
    @functools.wraps(function)
    def wrapped(db, *args, **kwargs):
        tracker, co2, energy = None, 0., 0.
        started = time.perf_counter()
        if os.getenv("CODECARBON_ENABLED", "1") == "1":
            try:
                from codecarbon import OfflineEmissionsTracker
                tracker = OfflineEmissionsTracker(country_iso_code="PER", save_to_file=False, log_level="error")
                tracker.start()
            except Exception:
                logging.getLogger(__name__).warning("Medición computacional no disponible")
                tracker = None
        try:
            result = function(db, *args, **kwargs)
        finally:
            if tracker:
                try:
                    co2 = float(tracker.stop() or 0)
                    energy = float(getattr(getattr(tracker, "_total_energy", None), "kWh", 0) or 0)
                except Exception:
                    tracker = None
        result.medicion_computacional_disponible = tracker is not None
        if hasattr(result, 'rutas'):
            from app.models.ruta import Ruta
            count = max(1, len(result.rutas))
            for detail in result.rutas:
                route = db.get(Ruta, detail.ruta_id)
                route.co2_computacional_kg = detail.co2_computacional_kg = co2 / count
                route.energia_computacional_kwh = detail.energia_computacional_kwh = energy / count
                route.tiempo_computo_seg = detail.tiempo_computo_seg = time.perf_counter() - started
                route.medicion_computacional_disponible = detail.medicion_computacional_disponible = tracker is not None
            result.co2_computacional_total_kg = co2
            result.energia_computacional_total_kwh = energy
            result.tiempo_computo_total_seg = time.perf_counter() - started
            db.commit()
        else:
            result.co2_computacional_kg = co2
        return result
    return wrapped
