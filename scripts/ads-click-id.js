// Persist the Google Ads click id and replay it into the inquiry form.
//
// Formspree relays whatever fields the form carries, so putting the click id on
// the lead record is what makes offline conversion import possible later: a job
// that closes months after the click can still be attributed back to the keyword
// that bought it. Without this the lead arrives anonymous and that link is gone.
//
// gclid covers standard web clicks; wbraid/gbraid are the iOS variants Google
// sends when ATT blocks gclid.

const CLICK_ID_PARAMS = ["gclid", "wbraid", "gbraid"];

// Matches the Google Ads default 90-day conversion window. A click id older than
// that is useless for import, so we let it expire rather than attach a stale one.
const MAX_AGE_MS = 90 * 24 * 60 * 60 * 1000;

const storageKey = (param) => `mammoth_${param}`;

function persistFromUrl(params) {
  CLICK_ID_PARAMS.forEach((param) => {
    const value = params.get(param);
    if (!value) return;
    try {
      localStorage.setItem(storageKey(param), JSON.stringify({ value, savedAt: Date.now() }));
    } catch {
      // Private browsing / storage disabled — the current pageview still works,
      // it just won't survive a navigation.
    }
  });
}

function readStored(param) {
  try {
    const raw = localStorage.getItem(storageKey(param));
    if (!raw) return "";
    const { value, savedAt } = JSON.parse(raw);
    if (Date.now() - savedAt > MAX_AGE_MS) {
      localStorage.removeItem(storageKey(param));
      return "";
    }
    return value || "";
  } catch {
    return "";
  }
}

function fillFormFields(params) {
  CLICK_ID_PARAMS.forEach((param) => {
    const field = document.getElementById(`f-${param}`);
    if (!field) return;
    field.value = params.get(param) || readStored(param);
  });
}

const params = new URLSearchParams(window.location.search);
persistFromUrl(params);
fillFormFields(params);
