/**
 * Servidor estático de producción para la aplicación compilada.
 *
 * Implementa las tres cabeceras que pide la auditoría Green IT:
 *   - `Content-Encoding`: sirve la variante Brotli o gzip precompilada.
 *   - `Cache-Control`: inmutable para archivos con hash; revalidación para el HTML.
 *   - `ETag`: responde 304 si el recurso no cambió.
 *
 * Sin dependencias externas: solo el módulo `http` de Node.
 */
import { createServer } from 'node:http';
import { createReadStream } from 'node:fs';
import { stat } from 'node:fs/promises';
import { join, extname, normalize, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = process.env.DIST_DIR
  ? resolve(process.env.DIST_DIR)
  : join(fileURLToPath(new URL('.', import.meta.url)), 'dist');
// 4173 es el puerto que espera Lighthouse CI; Docker lo sobrescribe con PORT=5173.
const PORT = Number(process.env.PORT || 4173);

const TIPOS = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.woff2': 'font/woff2',
  '.ico': 'image/x-icon',
  '.txt': 'text/plain; charset=utf-8'
};

function negociarCodificacion(accept = '') {
  if (/\bbr\b/.test(accept)) return { encoding: 'br', extension: 'br' };
  if (/\bgzip\b/.test(accept)) return { encoding: 'gzip', extension: 'gz' };
  return null;
}

async function resolver(ruta) {
  try {
    const info = await stat(ruta);
    if (info.isFile()) return { ruta, info };
  } catch {
    /* no existe */
  }
  return null;
}

const servidor = createServer(async (req, res) => {
  const url = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`);
  const limpio = normalize(decodeURIComponent(url.pathname)).replace(/^(\.\.[/\\])+/, '');
  let destino = join(ROOT, limpio);

  let encontrado = await resolver(destino);
  if (!encontrado && !extname(limpio)) {
    destino = join(ROOT, 'index.html');
    encontrado = await resolver(destino);
  }
  if (!encontrado) {
    // Reserva para SPA: cualquier ruta desconocida devuelve el documento base.
    encontrado = await resolver(join(ROOT, 'index.html'));
    destino = join(ROOT, 'index.html');
  }
  if (!encontrado) {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('No encontrado');
    return;
  }

  const extension = extname(destino).toLowerCase();
  const esHtml = extension === '.html';
  const esHash = /\/assets\/.+-[A-Za-z0-9_-]{8,}\./.test(destino.replace(/\\/g, '/'));

  const codificacion = negociarCodificacion(req.headers['accept-encoding']);
  let archivo = destino;
  if (codificacion) {
    const variante = `${destino}.${codificacion.extension}`;
    if (await resolver(variante)) archivo = variante;
  }

  const etag = `W/"${encontrado.info.size.toString(16)}-${Math.floor(encontrado.info.mtimeMs).toString(16)}"`;
  if (req.headers['if-none-match'] === etag) {
    res.writeHead(304, { ETag: etag, 'Cache-Control': esHtml ? 'no-cache' : 'public, max-age=31536000, immutable' });
    res.end();
    return;
  }

  const cabeceras = {
    'Content-Type': TIPOS[extension] || 'application/octet-stream',
    'Cache-Control': esHtml || !esHash ? 'no-cache, must-revalidate' : 'public, max-age=31536000, immutable',
    ETag: etag,
    Vary: 'Accept-Encoding',
    'X-Content-Type-Options': 'nosniff'
  };
  if (archivo !== destino) cabeceras['Content-Encoding'] = codificacion.encoding;

  res.writeHead(200, cabeceras);
  if (req.method === 'HEAD') {
    res.end();
    return;
  }
  createReadStream(archivo).pipe(res);
});

servidor.listen(PORT, '0.0.0.0', () => {
  console.log(`EcoLogística frontend en http://localhost:${PORT} (Brotli/gzip + caché)`);
});
