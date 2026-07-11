// Converts every PNG under images/ into AVIF + WebP siblings.
// Originals are kept untouched (used as <picture> fallback).
import { readdirSync, statSync } from 'node:fs';
import { join, extname } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const ROOT = fileURLToPath(new URL('../images/', import.meta.url));

function walk(dir) {
  const out = [];
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) out.push(...walk(p));
    else if (extname(p).toLowerCase() === '.png') out.push(p);
  }
  return out;
}

const files = walk(ROOT);
let origTotal = 0, avifTotal = 0, webpTotal = 0;

for (const png of files) {
  const base = png.slice(0, -extname(png).length);
  const orig = statSync(png).size;
  origTotal += orig;

  const input = sharp(png);
  await input.clone().avif({ quality: 52, effort: 5 }).toFile(base + '.avif');
  await input.clone().webp({ quality: 78, effort: 5 }).toFile(base + '.webp');

  const a = statSync(base + '.avif').size;
  const w = statSync(base + '.webp').size;
  avifTotal += a;
  webpTotal += w;

  const rel = png.split('images')[1];
  console.log(
    `${rel.padEnd(45)} ${(orig / 1024).toFixed(0).padStart(6)}KB ->` +
    ` avif ${(a / 1024).toFixed(0).padStart(6)}KB` +
    ` webp ${(w / 1024).toFixed(0).padStart(6)}KB`
  );
}

const mb = (b) => (b / 1024 / 1024).toFixed(2);
console.log('\n=== TOTALS (' + files.length + ' images) ===');
console.log(`PNG : ${mb(origTotal)} MB`);
console.log(`AVIF: ${mb(avifTotal)} MB  (${(100 - avifTotal / origTotal * 100).toFixed(0)}% smaller)`);
console.log(`WebP: ${mb(webpTotal)} MB  (${(100 - webpTotal / origTotal * 100).toFixed(0)}% smaller)`);
