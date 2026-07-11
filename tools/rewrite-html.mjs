// Wraps every <img> that points to a .png in a <picture> element with
// AVIF + WebP <source>s. The original <img> (with all its attributes) is
// kept as the fallback for old browsers. SVG/other <img> tags are untouched.
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const HTML = fileURLToPath(new URL('../index.html', import.meta.url));
const src = readFileSync(HTML, 'utf8');

// URL-encode only spaces (valid inside srcset, where raw spaces are delimiters)
const enc = (p) => p.replace(/ /g, '%20');

let wrapped = 0, skipped = 0;
// Idempotent: skip any <img> that is already the fallback of a <picture>
// (i.e. immediately preceded by a webp <source>), so re-runs don't double-wrap.
const out = src.replace(/(?<!type="image\/webp">)<img\b[^>]*>/gi, (tag) => {
  const m = tag.match(/\ssrc\s*=\s*"([^"]*\.png)"/i);
  if (!m) return tag;                       // not a png <img> (svg etc.)
  if (/<picture/i.test(tag)) return tag;    // safety, shouldn't happen
  const pngPath = m[1];
  const base = pngPath.slice(0, -4);        // strip ".png"

  // sanity: only rewrite if the generated files actually exist on disk
  const diskBase = fileURLToPath(new URL('../' + base, import.meta.url));
  if (!existsSync(diskBase + '.avif') || !existsSync(diskBase + '.webp')) {
    skipped++;
    return tag;
  }

  wrapped++;
  return (
    '<picture>' +
    `<source srcset="${enc(base)}.avif" type="image/avif">` +
    `<source srcset="${enc(base)}.webp" type="image/webp">` +
    tag +
    '</picture>'
  );
});

writeFileSync(HTML, out);
console.log(`Wrapped ${wrapped} <img> tags in <picture>. Skipped (no encoded file): ${skipped}.`);
