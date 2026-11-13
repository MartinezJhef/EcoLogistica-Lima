/**
 * Genera las variantes raster del isotipo para el elemento <picture>.
 *
 * A partir de `public/brand/isotipo.svg` produce AVIF, WebP y PNG en 1x y 2x.
 * El navegador elige el formato más liviano que soporte; el PNG queda como
 * reserva para clientes antiguos. Se ejecuta una vez y los archivos resultantes
 * se versionan, porque el build no necesita sharp en producción.
 */
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { stat } from 'node:fs/promises';
import sharp from 'sharp';

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), '..');
const ORIGEN = join(RAIZ, 'public', 'brand', 'isotipo.svg');
const DESTINO = join(RAIZ, 'public', 'brand');

const TAMANIOS = [56, 112];

for (const ancho of TAMANIOS) {
  const base = sharp(ORIGEN).resize({ width: ancho, height: ancho, fit: 'contain' });
  await base.clone().avif({ quality: 62, effort: 9 }).toFile(join(DESTINO, `isotipo-${ancho}.avif`));
  await base.clone().webp({ quality: 82, effort: 6 }).toFile(join(DESTINO, `isotipo-${ancho}.webp`));
  await base.clone().png({ compressionLevel: 9, palette: true }).toFile(join(DESTINO, `isotipo-${ancho}.png`));
}

for (const ancho of TAMANIOS) {
  for (const ext of ['avif', 'webp', 'png']) {
    const { size } = await stat(join(DESTINO, `isotipo-${ancho}.${ext}`));
    console.log(`isotipo-${ancho}.${ext}: ${(size / 1024).toFixed(1)} KB`);
  }
}
