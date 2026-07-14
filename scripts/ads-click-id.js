// Persist the Google Ads click id + campaign UTMs and replay them into the
// inquiry form, so the lead record carries the campaign that bought it.
//
// Formspree relays whatever fields the form carries, so this is what makes
// offline conversion import possible: a job that closes months after the click
// can still be attributed back to the keyword that bought it. Without this the
// lead arrives anonymous and that link is gone.
//
// gclid covers standard web clicks; wbraid/gbraid are the iOS variants Google
// sends when ATT blocks gclid. Google sends exactly ONE of the three per click.
//
// Auto-tagging sends a click id and NOTHING ELSE — the utm_* fields stay empty
// on paid traffic until a Final URL suffix is set on AW-952951808.

const CLICK_KEYS = ["gclid", "wbraid", "gbraid"];
const UTM_KEYS = [
  "utm_source", "utm_medium", "utm_campaign",
  "utm_term", "utm_content", "utm_id",
];

// Two questions, two clocks. 90 days is Google's import deadline, not a storage
// guarantee — Ads rejects an older click id. UTMs are our own annotation that
// Google never sees, and a $300K renovation routinely takes longer than a
// quarter to decide.
const CLICK_MAX_AGE_MS = 90 * 24 * 60 * 60 * 1000;
const UTM_MAX_AGE_MS = 180 * 24 * 60 * 60 * 1000;

const CLICK_STORE = "mammoth_attr_click";
const UTM_STORE = "mammoth_attr_utm";

// A hand-written tracking template (instead of the Final URL suffix field)
// produces a double-"?", handing us "Cj0KC...?utm_source=google" as the click
// id. Storing that guarantees a silently-rejected import row 90 days later, so
// a malformed id is dropped rather than kept.
const CLICK_ID_SHAPE = /^[A-Za-z0-9_.-]{8,512}$/;

// UTM values are attacker-controlled and land in an email a human opens. Strip
// anything that could turn one into a clickable link or smuggle markup; real
// campaign tags never need those characters.
const clean = (value) =>
  String(value).replace(/[^A-Za-z0-9 _.+|()\-]/g, "").trim().slice(0, 120);

const readJson = (key) => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const writeJson = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Private browsing / storage disabled. The live URL beats storage
    // everywhere below, so the current pageview still submits with full
    // attribution — it just won't survive a navigation.
  }
};

const fresh = (record, maxAge) =>
  !!record &&
  typeof record.savedAt === "number" &&
  Date.now() - record.savedAt <= maxAge;

// Google appends the Final URL suffix AFTER any params already on the ad's URL,
// so on a duplicate key the LAST value is authoritative — the opposite of what
// URLSearchParams.get() returns.
const lastValue = (params, key) => {
  const all = params.getAll(key);
  return all.length ? all[all.length - 1] : "";
};

// An ad whose Final URL carries an anchor ("/#inquiry?utm_source=...") puts the
// query string after the hash, where location.search cannot see it — a silent
// 100% attribution loss. Merge both, with the real query string winning.
function readParams() {
  const params = new URLSearchParams(window.location.search);
  const hash = window.location.hash;
  const q = hash.indexOf("?");
  if (q !== -1) {
    new URLSearchParams(hash.slice(q + 1)).forEach((value, key) => {
      if (!params.has(key)) params.append(key, value);
    });
  }
  return params;
}

// ONE slot, not three: Google sends a single click id per click, so two stored
// keys would always mean two different clicks, and pairing a March gclid with a
// June wbraid credits the wrong campaign on import.
function captureClick(params) {
  const stored = readJson(CLICK_STORE);

  for (const type of CLICK_KEYS) {
    const value = lastValue(params, type);
    if (!value || !CLICK_ID_SHAPE.test(value)) continue;

    // Re-stamp only when the value actually changes. Chrome's omnibox replays
    // "?gclid=..." from history and prospects forward the ad URL to a spouse —
    // re-stamping would keep a long-dead click alive past Google's real window.
    if (stored && stored.value === value) break;

    const record = { v: 1, type, value, savedAt: Date.now() };
    writeJson(CLICK_STORE, record);
    return record;
  }

  return fresh(stored, CLICK_MAX_AGE_MS) ? stored : null;
}

// The bundle is written and replayed as ONE object, never key by key. Per-key
// storage lets a later "?utm_source=houzz" visit inherit utm_campaign/utm_term
// from an earlier Google click and report a visit that never happened —
// invisibly, because every field looks populated. Losing a field is
// recoverable; fabricating one is not.
function captureUtms(params) {
  const touch = {};
  let tagged = false;

  UTM_KEYS.forEach((key) => {
    const value = clean(lastValue(params, key));
    touch[key] = value;
    if (value) tagged = true;
  });

  // Only a URL carrying at least one utm_* replaces the bundle. A bare
  // "?gclid=..." must not — that is what auto-tagging sends, so treating it as
  // a touch would make every Google click erase the Houzz or newsletter visit
  // that created the demand. A referrer is not a touch either: a returning
  // visitor who Googles the brand and clicks the ORGANIC result would otherwise
  // overwrite a paid campaign with nothing.
  if (tagged) {
    writeJson(UTM_STORE, { v: 1, utm: touch, savedAt: Date.now() });
    return touch;
  }

  const stored = readJson(UTM_STORE);
  return fresh(stored, UTM_MAX_AGE_MS) && stored.utm ? stored.utm : null;
}

// Fields are resolved by name=, so there is no "f-<param>" id contract to keep
// in sync. Empty fields are disabled, which excludes them from the FormData
// (and from a native no-JS POST) — a direct lead's notification email shows the
// fields a human filled in, not nine blank attribution rows.
function fillForm(click, utms) {
  const form = document.querySelector(".form");
  if (!form) return;

  const values = {};
  CLICK_KEYS.concat(UTM_KEYS).forEach((key) => { values[key] = ""; });
  if (click) values[click.type] = click.value;
  if (utms) Object.assign(values, utms);

  Object.entries(values).forEach(([name, value]) => {
    const field = form.querySelector(`input[type="hidden"][name="${name}"]`);
    if (!field) return;
    field.value = value;
    field.disabled = !value;
  });
}

// Click-id capture shipped 2026-07-13 under three separate keys. Carry the
// newest one forward so a click from that window is not orphaned; the old keys
// are left in place so a rollback still finds them.
// DELETE AFTER 2026-10-13 — by then every id written under the old scheme has
// aged past the 90-day import window and this is dead code.
function migrateLegacyClickIds() {
  if (readJson(CLICK_STORE)) return;

  let newest = null;
  CLICK_KEYS.forEach((type) => {
    const old = readJson(`mammoth_${type}`);
    if (!old || !old.value || typeof old.savedAt !== "number") return;
    if (!newest || old.savedAt > newest.savedAt) {
      newest = { v: 1, type, value: old.value, savedAt: old.savedAt };
    }
  });

  if (fresh(newest, CLICK_MAX_AGE_MS)) writeJson(CLICK_STORE, newest);
}

migrateLegacyClickIds();
const params = readParams();
fillForm(captureClick(params), captureUtms(params));
