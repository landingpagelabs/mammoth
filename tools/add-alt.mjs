// Fills in descriptive alt text for every <img> in index.html.
// Keyed by the (unique) image src. Decorative-only images intentionally
// keep alt="" (correct a11y treatment).
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const HTML = fileURLToPath(new URL('../index.html', import.meta.url));
let html = readFileSync(HTML, 'utf8');

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const reEsc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// src (png / svg) -> alt text
const ALT = {
  // --- header ---
  'images/header/Logo.png': 'Mammoth',
  'images/header/header-right.png': 'Best of Houzz Design 2022, 2023 and 2024 and HomeGuide 2024 Top Pro award badges',

  // --- about: press features (top row, with quotes) ---
  'images/sections/hero/item-top-1.png': 'Open House New York logo',
  'images/sections/hero/item-top-2.png': 'Architectural Digest logo',
  'images/sections/hero/item-top-3.png': 'The New York Times logo',
  // --- about: press logos (bottom row) ---
  'images/sections/hero/item-bot-1.png': 'Frame magazine logo',
  'images/sections/hero/item-bot-2.png': 'Leibal logo',
  'images/sections/hero/item-bot-3.png': 'Forbes logo',
  'images/sections/hero/item-bot-4.png': 'AD PRO Directory 2026 Featured Designer badge',
  'images/sections/hero/item-bot-5.png': 'CanvasRebel logo',
  'images/sections/hero/item-bot-6.png': 'Dezeen logo',
  'images/sections/hero/item-bot-7.png': 'Brick Underground logo',

  // --- gallery: portfolio interiors ---
  'images/sections/gallery/item-1.png': 'Walnut kitchen with a marble island and leather bar stools in a Mammoth-renovated NYC home',
  'images/sections/gallery/item-2.png': 'Sage-green kitchen with a marble backsplash and a glass-block wall',
  'images/sections/gallery/item-3.png': 'Oak media console and TV wall with framed art and wooden stools',
  'images/sections/gallery/item-4.png': 'Oak-slatted wet bar with a marble counter beside a living room',
  'images/sections/gallery/item-5.png': 'Powder room with a perforated-metal vanity, marble top and a city view',
  'images/sections/gallery/item-6.png': 'Bedroom with an upholstered headboard beneath an exposed wood-beam ceiling',
  'images/sections/gallery/item-7.png': 'Study with an olive-green sofa against deep-blue panelled walls',
  'images/sections/gallery/item-8.png': 'Kitchen with a black soapstone island and backsplash and globe pendant lights',
  'images/sections/gallery/item-9.png': 'Living room with a green-tiled fireplace and a white chaise lounge',
  'images/sections/gallery/item-10.png': 'Blue kitchen with a concrete wall, double wall ovens and a live-edge counter',
  'images/sections/gallery/item-11.png': 'Deep-blue panelled sitting room with an armchair by the window',
  'images/sections/gallery/item-12.png': 'Grey stone-tiled bathroom detail',
  'images/sections/gallery/item-13.png': 'Living room with a burgundy velvet sofa beneath tall windows',
  'images/sections/gallery/item-14.png': 'View through walnut sliding doors into a dining room',
  'images/sections/gallery/item-15.png': 'Dining room with an exposed-brick wall, blue cabinetry and a wood table',
  // gallery: updated portfolio shots (v2/v3)
  'images/sections/gallery/item-2-v2.png': 'Oak storage bench with a built-in pull-out dog-bowl drawer and a small dog feeding',
  'images/sections/gallery/item-3-v2.png': 'Dining area with an exposed red-brick wall, blue-grey cabinetry and a wood table with black cross-back chairs',
  'images/sections/gallery/item-5-v2.png': 'Sitting room with an olive-green velvet sofa against deep blue-green panelled walls and a vase of allium flowers',
  'images/sections/gallery/item-5-v4.png': 'Oak kitchen with a marble-topped island and two ribbed globe pendant lights',
  'images/sections/gallery/item-6-v2.png': 'Bedroom with an upholstered cream bed and a woven pendant light beneath an exposed wood-beam ceiling',
  'images/sections/gallery/item-7-v2.png': 'Sage-green kitchen with a veined-marble backsplash and island beside a glass-block wall',
  'images/sections/gallery/item-8-v2.png': 'Living room with a black marble fireplace, a tan shearling armchair and a burl-wood coffee table',
  'images/sections/gallery/item-9-v2.png': 'Powder room with a perforated-metal vanity, a marble top and a city-view window',
  'images/sections/gallery/item-10-v2.png': 'View through open walnut sliding doors into a dining room with globe pendant lights',
  'images/sections/gallery/item-11-v2.png': 'Bedroom with a full wall of walnut wardrobes and an open door to an ensuite bathroom',
  'images/sections/gallery/item-12-v2.png': 'Bathroom with a glass walk-in shower and an oak vanity with a carved grey marble sink',
  'images/sections/gallery/item-13-v2.png': 'Kitchen with a black soapstone waterfall island and backsplash beneath a row of globe pendant lights',
  'images/sections/gallery/item-14-v2.png': 'Deep blue-green panelled sitting room with a checkered-upholstered armchair beside the window',

  // --- team ---
  'images/sections/team/item-1.png': 'Loft living room with a leather sectional, tall windows and a dog on the rug',
  'images/sections/team/item-2.png': 'Walk-in shower clad in striated stone tile',
  'images/sections/team/item-3.png': 'Mammoth founders Maryana Grinshpun and Jessica Maktal in a Dumbo alleyway',
  'images/sections/team/item-4.png': 'Oak kitchen with a marble island and woven-shade pendant lights',
  'images/sections/team/item-5.png': 'Loft living room with a sectional sofa, wall-mounted TV and large windows',

  // --- process ---
  'images/sections/process/item-1.png': 'Oak storage bench with a built-in dog-bowl drawer and a dog feeding',
  'images/sections/process/item-2.png': 'Bedroom with a full wall of walnut wardrobes',
  'images/sections/process/item-3.png': 'Dining room with an oak table, red pendant lights and a blue artwork',
  'images/sections/process/item-4.png': 'Oak kitchen with globe pendant lights and a marble counter',
  'images/sections/process/item-5.png': 'Bathroom with a walk-in shower and a grey marble vanity',
  'images/sections/process/item-6.png': 'Home office with a wooden desk and floor-to-ceiling city-view windows',
  'images/sections/process/item-7.png': 'White kitchen beneath a glass conservatory roof with a checkerboard floor',
  'images/sections/process/item-8.png': 'Kitchen detail with a dramatic marble backsplash and a red kettle on the range',
  'images/sections/process/item-9.png': 'Hallway leading to an oak-panelled dressing room',
  'images/sections/process/item-10.png': 'Grey stone-tiled wet room with a teak bench',
  'images/sections/process/item-11.png': 'Loft with a bouclé sofa, a billiards table and globe pendant lights',
  'images/sections/process/item-12.png': 'Living room with a black marble fireplace and a shearling armchair',
  // process: updated shots (v1/v2)
  'images/sections/process/item-1-v1.png': 'Oak kitchen with a marble-topped island and two ribbed globe pendant lights',
  'images/sections/process/item-2-v2.png': 'Deep blue-green panelled sitting room with a checkered-upholstered armchair beside the window',
  'images/sections/process/item-3-v2.png': 'Bedroom with a full wall of walnut wardrobes and an open door to an ensuite bathroom',
  'images/sections/process/item-4-v2.png': 'Kitchen with a black soapstone waterfall island and backsplash beneath a row of globe pendant lights',
  'images/sections/process/item-5-v2.png': 'Bathroom with a glass walk-in shower and an oak vanity with a carved grey marble sink',
  'images/sections/process/item-6-v2.png': 'Living room with a black marble fireplace, a tan shearling armchair and a burnt-orange velvet chair',
  'images/sections/process/item-7-v2.png': 'Study with an olive-green velvet sofa against deep blue-green panelled walls',

  // --- reviews (grouped by project) ---
  'images/sections/reviews/item-1.png': 'Industrial loft with a blue kitchen island and skyline views — Brooklyn commercial loft renovation',
  'images/sections/reviews/item-2.png': 'Blue cabinetry wall on a polished-concrete floor',
  'images/sections/reviews/item-3.png': 'Blue kitchen with a concrete wall, double wall ovens and a live-edge counter',
  'images/sections/reviews/item-4.png': 'Bedroom corner with sliding glass doors opening to a terrace — West Village condo renovation',
  'images/sections/reviews/item-5.png': 'Room with a green-tiled fireplace and a white chaise lounge',
  'images/sections/reviews/item-6.png': 'Living room with a grey sectional, a blue rug and an exposed-brick TV wall',
  'images/sections/reviews/item-7.png': 'Black soapstone counter with an integrated sink — Brooklyn condo renovation',
  'images/sections/reviews/item-8.png': 'Oak cabinetry with dovetailed drawer joinery',
  'images/sections/reviews/item-9.png': 'Grey stone-tiled shower niche beside a white bathtub',
  'images/sections/reviews/item-10.png': 'White bathroom with a walnut floating vanity and green patterned floor tile — Brooklyn Heights renovation',
  'images/sections/reviews/item-11.png': 'Brooklyn Heights renovation by Mammoth',
  'images/sections/reviews/item-12.png': 'Playroom with a slate-blue sofa, a surfboard on the wall and a jute pouf',
  'images/sections/reviews/item-13.png': 'White townhouse kitchen with a long island, wood pendants and teal ovens — Brooklyn townhouse renovation',
  'images/sections/reviews/item-14.png': "Children's room with floral wallpaper, a teepee and a striped rug",
  'images/sections/reviews/item-15.png': 'Library den with floor-to-ceiling bookshelves, a record collection and a black sofa',
  'images/sections/reviews/item-16.png': 'Mammoth renovation project',
  'images/sections/reviews/item-17.png': 'Basement lounge with an olive-green quilted sofa beneath a reclaimed-wood ceiling',
  'images/sections/reviews/item-18.png': 'Tiled steam shower with a teak bench and a glass door',

  // --- working strapline ---
  'images/sections/working/strapline.png': 'Features & Awards',

  // --- footer ---
  'images/footer/footer_logo.png': 'Mammoth',
  'images/footer/footer_landing_labs_img.png': 'Landing Page Labs logo',
};

// award_1..16.svg -> generic press/award description (distinct brand logos we
// don't map individually)
for (let i = 1; i <= 16; i++) {
  ALT[`images/sections/working/award_${i}.svg`] = 'Press feature and award logo';
}

let changed = 0, missing = [];
for (const [src, alt] of Object.entries(ALT)) {
  // match EVERY <img ...> tag that references this src (some images, e.g. the
  // gallery, are duplicated in the modal lightbox)
  const re = new RegExp(`<img\\b([^>]*?)src="${reEsc(src)}"([^>]*?)>`, 'gi');
  if (!re.test(html)) { missing.push(src); continue; }
  re.lastIndex = 0;
  html = html.replace(re, (tag) => {
    changed++;
    if (/\salt\s*=\s*"/i.test(tag)) {
      return tag.replace(/(\salt\s*=\s*")[^"]*(")/i, `$1${esc(alt)}$2`);
    }
    // no alt attr present -> add one before the closing >
    return tag.replace(/\s*>$/, ` alt="${esc(alt)}">`);
  });
}

writeFileSync(HTML, html);
console.log(`Updated alt on ${changed} <img> tags.`);
if (missing.length) console.log('NOT FOUND (skipped):\n  ' + missing.join('\n  '));

// Report any <img> still left with an empty alt (excluding the decorative line)
const emptyAlts = [...html.matchAll(/<img\b[^>]*alt=""[^>]*>/gi)].map(m => (m[0].match(/src="([^"]*)"/) || [])[1]);
console.log(`\nRemaining alt="" (${emptyAlts.length}):`);
emptyAlts.forEach(s => console.log('  ' + s));
