// ===================== Projektová alchymie – jazyky =====================
// Čeština je výchozí a je přímo v kódu. Jiný jazyk se načte jako js/lang/<jazyk>.js:
// - I18N.ui: slovník textů rozhraní (klíčem je český text, viz tr()),
// - applyContent(): přeloží obsah hry (projekty, praktiky, vzorce…) přímo v datech.
// Jazyk se volí odkazem ?lang=en, jinak se pamatuje volba hráče, jinak podle prohlížeče.
// Soubor se načítá hned po datech a před ikonami, kariérou a hrou.

const LANGS = { cs: 'Čeština', en: 'English' };
const LANG_KEY = 'projektova-alchymie-jazyk';
const I18N = { ui: {} };

const LANG = (() => {
  // Jazyková vstupní stránka (např. en/index.html) má jazyk pevně v <html data-lang>.
  const url = document.documentElement.dataset.lang || new URLSearchParams(location.search).get('lang');
  if (url && LANGS[url]) {
    try { localStorage.setItem(LANG_KEY, url); } catch { /* nic */ }
    return url;
  }
  try { const saved = localStorage.getItem(LANG_KEY); if (saved && LANGS[saved]) return saved; } catch { /* nic */ }
  const nav = (navigator.languages || [navigator.language || 'cs']).map(l => l.slice(0, 2).toLowerCase());
  const first = nav.find(l => l === 'cs' || l === 'sk' || LANGS[l]);
  return first === 'sk' ? 'cs' : first || 'cs';
})();
document.documentElement.lang = LANG;

/**
 * Přeloží text rozhraní. Klíčem je český text; {jméno} se nahradí hodnotou z params.
 * Chybí-li překlad, zůstane čeština (hra nikdy nespadne kvůli chybějícímu textu).
 */
function tr(cs, params) {
  const s = (LANG !== 'cs' && I18N.ui[cs]) || cs;
  return params ? s.replace(/\{(\w+)\}/g, (m, k) => (params[k] ?? m)) : s;
}

/** Tvar podle počtu: forms = { one, few, many } (česky) nebo { one, other } (anglicky). */
function plural(n, cs, en) {
  if (LANG === 'cs') return n === 1 ? cs[0] : n >= 2 && n <= 4 ? cs[1] : cs[2];
  return n === 1 ? en[0] : en[1];
}

/** Rodový tvar pro postavy: česky podle p.f, anglicky jeden tvar. */
const gx = (p, m, f, en) => (LANG === 'cs' ? (p && p.f ? f : m) : en);

/** Sloučí přeložený obsah do dat: objekty podle klíčů, pole podle id (jinak podle pořadí). */
function mergeContent(target, src) {
  if (Array.isArray(src)) {
    src.forEach((s, i) => {
      if (s === null || s === undefined) return;
      const idx = s && typeof s === 'object' && !Array.isArray(s) && s.id !== undefined
        ? target.findIndex(x => x && x.id === s.id) : i;
      if (idx < 0 || target[idx] === undefined) return;
      if (typeof s === 'string') target[idx] = s;
      else mergeContent(target[idx], s);
    });
    return;
  }
  for (const [k, v] of Object.entries(src)) {
    if (k === 'id' || v === null || v === undefined || target[k] === undefined) continue;
    if (typeof v === 'string') target[k] = v;
    else if (typeof v === 'object' && typeof target[k] === 'object') mergeContent(target[k], v);
  }
}

function applyContent(content) {
  const roots = { METRICS, MOSCOW, CONTEXT_TAGS, PRACTICES, WORLD_LABEL, PRACTICE_PAIRS, ESSENTIALS, APPROACHES,
    PATTERNS, GATE_EVENT, GENERIC_EVENTS, SKILLS, GLOSSARY, SCENARIOS };
  for (const [name, part] of Object.entries(content)) if (roots[name]) mergeContent(roots[name], part);
}

/** Přepne jazyk: uloží volbu a načte stránku znovu (obsah se překládá při načtení). */
function setLanguage(lang) {
  try { localStorage.setItem(LANG_KEY, lang); } catch { /* nic */ }
  // Každý jazyk má vlastní adresu: čeština v kořeni, ostatní v podsložce (en/).
  location.href = new URL(lang === 'cs' ? './' : `${lang}/`, document.baseURI).toString();
}

// Překlad se vloží hned za tento skript, takže se použije dřív, než se načtou ikony a hra.
if (LANG !== 'cs' && document.currentScript) {
  const src = document.currentScript.src.replace(/i18n\.js(\?.*)?$/, (m, q) => `lang/${LANG}.js${q || ''}`);
  document.write(`<script src="${src}"><\/script>`);
}
