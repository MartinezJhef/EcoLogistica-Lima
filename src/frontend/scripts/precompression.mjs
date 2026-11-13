/**
 * Precompresión de la aplicación compilada.
 *
 * Genera un archivo `.br` (Brotli, calidad 11) y un `.gz` (gzip, nivel 9) por cada
 * recurso de texto de `dist/`. El servidor estático (`server.mjs`) elige la mejor
 * variante según `Accept-Encoding`, de modo que no se comprime en cada petición.
 */
import { readdir, stat, writeFile, readFile } from 'node:fs/promises';
import { join, extname, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { brotliCompress, gzip, constants } from 'node:zlib';
import { promisify } from 'node:util';

const brotli = promisify(brotliCompress);
const gzipAsync = promisify(gzip);

const DIST = join(dirname(fileURLToPath(import.meta.url)), '..', 'dist');
const COMPRIMIBLES = new Set(['.js', '.css', '.html', '.svg', '.json', '.txt', '.xml', '.webmanifest']);

async function* recorrer(dir) {
  for (const entrada of await readdir(dir, { withFileTypes: true })) {
    const ruta = join(dir, entrada.name);
    if (entrada.isDirectory()) yield* recorrer(ruta);
    else yield ruta;
  }
}

let original = 0;
let brotliTotal = 0;
let gzipTotal = 0;
let archivos = 0;

for await (const ruta of recorrer(DIST)) {
  if (!COMPRIMIBLES.has(extname(ruta))) continue;
  const { size } = await stat(ruta);
  if (size < 1024) continue;

  const contenido = await readFile(ruta);

  const br = await brotli(contenido, {
    params: { [constants.BROTLI_PARAM_QUALITY]: 11 }
  });
  const gz = await gzipAsync(contenido, { level: 9 });

  await writeFile(`${ruta}.br`, br);
  await writeFile(`${ruta}.gz`, gz);

  original += size;
  brotliTotal += br.length;
  gzipTotal += gz.length;
  archivos += 1;
}

const kb = n => (n / 1024).toFixed(1);
const pct = n => (original === 0 ? 0 : (1 - n / original) * 100).toFixed(1);

console.log(`Precompresión: ${archivos} archivos, ${kb(original)} KB sin comprimir`);
console.log(`  Brotli: ${kb(brotliTotal)} KB (-${pct(brotliTotal)} %)`);
console.log(`  gzip:   ${kb(gzipTotal)} KB (-${pct(gzipTotal)} %)`);

// Se deja constancia en un archivo para adjuntarlo como evidencia de la auditoría.
await writeFile(
  join(DIST, 'precompression-report.json'),
  JSON.stringify(
    {
      generado: new Date().toISOString(),
      archivos,
      sin_comprimir_kb: Number(kb(original)),
      brotli_kb: Number(kb(brotliTotal)),
      gzip_kb: Number(kb(gzipTotal)),
      brotli_ahorro_pct: Number(pct(brotliTotal)),
      gzip_ahorro_pct: Number(pct(gzipTotal))
    },
    null,
    2
  )
);
