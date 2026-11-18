"""Road geometry from OSRM. Never silently substitute a straight line for a road."""
import os
import time
import threading
from dataclasses import dataclass
import httpx
from shapely.geometry import LineString, Polygon, Point


class RoadUnavailable(ValueError):
    pass


class RoadBlocked(ValueError):
    pass


@dataclass
class RoadLeg:
    distance: float
    minutes: float
    coordinates: list


class RoadService:
    _demo_lock = threading.Lock()
    _demo_last_request = 0.
    def __init__(self):
        self.base_url = os.getenv("OSRM_URL", "https://router.project-osrm.org").rstrip("/")
        self.cache = {}
        self.deadline = time.monotonic() + 40
        self.distance_weight, self.time_weight = 1, 1 / 60

    def _fetch(self, points):
        key = tuple(tuple(p) for p in points)
        if key not in self.cache:
            remaining = self.deadline - time.monotonic()
            if remaining <= 0:
                raise RoadUnavailable("La consulta vial superó 40 segundos. Reduzca el lote y reintente.")
            path = ";".join(f"{lng},{lat}" for lng, lat in points)
            try:
                if self.base_url == "https://router.project-osrm.org":
                    # Public demo only: avoid bursts. Production must configure its own OSRM_URL.
                    with self._demo_lock:
                        delay = max(0, 1.01 - (time.monotonic() - RoadService._demo_last_request))
                        if delay >= self.deadline - time.monotonic():
                            raise RoadUnavailable("Se agotó el tiempo de consulta vial")
                        time.sleep(delay)
                        RoadService._demo_last_request = time.monotonic()
                response = httpx.get(f"{self.base_url}/route/v1/driving/{path}",
                    params={"overview": "full", "geometries": "geojson", "alternatives": "true"}, timeout=min(5, remaining))
                response.raise_for_status()
                data = response.json()
                if data.get("code") == "NoRoute":
                    raise RoadBlocked("No existe una vía transitable hasta esta parada")
                if data.get("code") != "Ok" or not data.get("routes"):
                    raise ValueError("Sin recorrido vial")
                self.cache[key] = [RoadLeg(r["distance"] / 1000, r["duration"] / 60,
                    r["geometry"]["coordinates"]) for r in data["routes"]]
            except (RoadBlocked, RoadUnavailable):
                raise
            except (httpx.HTTPError, ValueError, KeyError) as exc:
                raise RoadUnavailable("No se pudo consultar el recorrido vial. Reintente; no se guardó una ruta estimada.") from exc
        return self.cache[key]

    def leg(self, start, end, blocked=(), traffic=()):
        """Coordinates are [longitude, latitude]; reject every intersecting alternative."""
        polygons = [Polygon(p) for p in blocked]
        if any(p.covers(Point(start)) or p.covers(Point(end)) for p in polygons):
            raise RoadBlocked("Una parada está dentro de una zona bloqueada; requiere otro punto de entrega.")
        candidates = self._fetch([start, end])
        valid = [r for r in candidates if not any(LineString(r.coordinates).intersects(p) for p in polygons)]
        # Request roads through safe points around each blocked area, then verify the full geometry.
        if not valid and polygons:
            for polygon in polygons:
                x0, y0, x1, y1 = polygon.buffer(0.002).bounds
                for waypoint in [(x0, y0), (x0, y1), (x1, y0), (x1, y1)]:
                    try:
                        alternatives = self._fetch([start, waypoint, end])
                    except RoadBlocked:
                        continue
                    for r in alternatives:
                        if not any(LineString(r.coordinates).intersects(p) for p in polygons):
                            valid.append(r)
        if not valid:
            raise RoadBlocked("No hay alternativa vial verificada fuera del cierre. Se conserva el itinerario anterior.")
        scored = []
        for r in valid:
            line = LineString(r.coordinates)
            delay = sum(t.demora_minutos for t in traffic if line.intersects(Polygon(t.poligono)))
            scored.append(RoadLeg(r.distance, r.minutes + delay, r.coordinates))
        return min(scored, key=lambda r: r.minutes * self.time_weight + r.distance * self.distance_weight)
