"""Middleware transversal de rendimiento y caché HTTP.

Dos responsabilidades, ambas exigidas por la auditoría Green IT:

1. ``CacheHeadersMiddleware`` calcula un ``ETag`` sobre el cuerpo JSON y responde
   ``304 Not Modified`` cuando el cliente ya tiene la versión vigente. Con eso se
   evita retransmitir la misma carga útil en cada visita.
2. La compresión ``gzip`` se declara en ``main.py`` con ``GZipMiddleware``.

El middleware solo actúa sobre GET/HEAD de la API; los archivos estáticos los sirve
el frontend con su propia política de caché inmutable.
"""

from __future__ import annotations

import hashlib

from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response

CACHE_CONTROL_API = "public, max-age=60, stale-while-revalidate=30"


class CacheHeadersMiddleware(BaseHTTPMiddleware):
    """Añade ETag y Cache-Control a las respuestas JSON de la API."""

    async def dispatch(self, request: Request, call_next):  # type: ignore[override]
        response = await call_next(request)

        if request.method not in ("GET", "HEAD"):
            return response
        if response.status_code != 200:
            return response

        content_type = response.headers.get("content-type", "")
        if not content_type.startswith("application/json"):
            return response

        cuerpo = b""
        async for fragmento in response.body_iterator:  # type: ignore[attr-defined]
            cuerpo += fragmento if isinstance(fragmento, bytes) else str(fragmento).encode()

        etag = 'W/"' + hashlib.sha256(cuerpo).hexdigest()[:32] + '"'
        cabeceras = {
            clave: valor
            for clave, valor in response.headers.items()
            if clave.lower() not in {"content-length", "etag", "cache-control"}
        }
        cabeceras["ETag"] = etag
        cabeceras["Cache-Control"] = CACHE_CONTROL_API
        if request.headers.get("authorization"):
            cabeceras["Cache-Control"] = "private, no-store"
            cabeceras["Vary"] = "Authorization"

        if request.headers.get("if-none-match") == etag:
            return Response(
                status_code=304,
                headers={"ETag": etag, "Cache-Control": cabeceras["Cache-Control"], "Vary": "Authorization"},
            )

        return Response(
            content=b"" if request.method == "HEAD" else cuerpo,
            status_code=response.status_code,
            headers=cabeceras,
        )
