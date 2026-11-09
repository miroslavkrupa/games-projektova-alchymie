// ===================== Projektová alchymie – jazyky =====================
// Čeština je výchozí a je přímo v kódu. Jiný jazyk se načte jako js/lang/<jazyk>.js:
// - I18N.ui: slovník textů rozhraní (klíčem je český text, viz tr()),
// - registerLanguage(): slovník rozhraní a přeložený obsah hry (projekty, praktiky, vzorce…).
// Jazyk se volí odkazem ?lang=en, jinak se pamatuje volba hráče, jinak podle prohlížeče.
// Soubor se načítá hned po datech a před ikonami, kariérou a hrou.

const LANGS = { cs: 'Čeština', en: 'English' };
const LANG_KEY = 'projektova-alchymie-jazyk';
// pairs: text obsahu v jazyce rozehrané hry → text v aktuálním jazyce (pro převod uložené hry).
const I18N = { ui: {}, pairs: new Map(), otherUi: null };

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

/**
 * Projde přeložený obsah souběžně s daty. Režim 'apply' přepíše texty v datech (a zapamatuje si
 * dvojici čeština → překlad), režim 'pairs' data nemění a jen si zapamatuje překlad → čeština.
 */
function mergeContent(target, src, mode = 'apply') {
  const put = (old, v) => {
    if (typeof old !== 'string' || old === v) return;
    if (mode === 'apply') I18N.pairs.set(old, v);
    else I18N.pairs.set(v, old);
  };
  if (Array.isArray(src)) {
    src.forEach((s, i) => {
      if (s === null || s === undefined) return;
      const idx = s && typeof s === 'object' && !Array.isArray(s) && s.id !== undefined
        ? target.findIndex(x => x && x.id === s.id) : i;
      if (idx < 0 || target[idx] === undefined) return;
      if (typeof s === 'string') { put(target[idx], s); if (mode === 'apply') target[idx] = s; }
      else mergeContent(target[idx], s, mode);
    });
    return;
  }
  for (const [k, v] of Object.entries(src)) {
    if (k === 'id' || v === null || v === undefined || target[k] === undefined) continue;
    if (typeof v === 'string') { put(target[k], v); if (mode === 'apply') target[k] = v; }
    else if (typeof v === 'object' && typeof target[k] === 'object') mergeContent(target[k], v, mode);
  }
}

function contentRoots() {
  return { METRICS, MOSCOW, CONTEXT_TAGS, PRACTICES, WORLD_LABEL, PRACTICE_PAIRS, ESSENTIALS, APPROACHES,
    PATTERNS, GATE_EVENT, GENERIC_EVENTS, SKILLS, GLOSSARY, SCENARIOS };
}

/**
 * Volá ho soubor js/lang/<jazyk>.js. Aktuální jazyk se použije (texty rozhraní i obsah),
 * jiný jazyk (rozehraná hra z dřívějška) poslouží jen jako slovník pro převod uložené hry.
 */
function registerLanguage(lang, ui, content) {
  const roots = contentRoots();
  const mode = lang === LANG ? 'apply' : 'pairs';
  if (mode === 'apply') I18N.ui = ui; else I18N.otherUi = ui;
  for (const [name, part] of Object.entries(content)) if (roots[name]) mergeContent(roots[name], part, mode);
}

// ---------- Převod rozehrané hry do jiného jazyka ----------
// Uložená hra obsahuje kopie textů (položky backlogu, události, poznámky, poučení). Po změně jazyka
// se přeloží: texty obsahu přes dvojice z dat, texty rozhraní přes slovník, složené věty podle šablon.

const SKIP_STATE_KEYS = new Set(['id', 'screen', 'approach', 'track', 'rating', 'type', 'moscow', 'area', 'owner',
  'splitOf', 'key', 'answer', 'needs', 'lang', 'icon']);

function relocalizeState(state, from, sc) {
  if (from === LANG) return;
  // Slovník textů: obsah + rozhraní ve směru from → LANG.
  const map = new Map(I18N.pairs);
  const ui = LANG === 'cs' ? I18N.otherUi : I18N.ui;
  if (!ui) return;
  const uiPairs = Object.entries(ui).map(([cs, other]) => (LANG === 'cs' ? [other, cs] : [cs, other]));
  for (const [a, b] of uiPairs) if (!a.includes('{') && a.length > 2 && !map.has(a)) map.set(a, b);
  // Slova pro období (sprint, etapa…) v obou jazycích.
  if (typeof PERIOD_FORMS !== 'undefined') {
    for (const per of Object.keys(PERIOD_FORMS.cs)) {
      const a = PERIOD_FORMS[from][per], b = PERIOD_FORMS[LANG][per];
      for (const f of Object.keys(a)) if (a[f] !== b[f] && !map.has(a[f])) map.set(a[f], b[f]);
    }
  }
  // Texty s {users}, {sponsor}… byly ve hře doplněné výrazy projektu – přidá se i doplněná podoba.
  if (sc && sc.terms && typeof localize === 'function') {
    const back = new Map([...map].map(([a, b]) => [b, a]));
    const termsTo = sc.terms;
    const termsFrom = Object.fromEntries(Object.entries(termsTo).map(([k, v]) => [k, back.get(v) ?? v]));
    for (const [a, b] of [...map]) if (a.includes('{')) map.set(localize(a, termsFrom), localize(b, termsTo));
  }
  // Šablony rozhraní s parametry ({n}, {name}…) jako regulární výrazy, delší (konkrétnější) dřív.
  const esc = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const templates = uiPairs.filter(([a]) => /\{\w+\}/.test(a)).map(([a, b]) => {
    const names = [];
    const re = new RegExp('^' + a.split(/(\{\w+\})/).map(part => {
      const m = part.match(/^\{(\w+)\}$/);
      if (!m) return esc(part);
      if (names.includes(m[1])) return '(?:[\\s\\S]*?)';
      names.push(m[1]);
      return '([\\s\\S]*?)';
    }).join('') + '$');
    return { re, names, to: b, weight: a.replace(/\{\w+\}/g, '').length };
  }).filter(x => x.weight >= 4).sort((x, y) => y.weight - x.weight);

  // Delší známé texty pro hledání uvnitř složených vět (od nejdelších, aby se nepřekládaly kousky).
  const subs = [...map].filter(([a]) => a.length >= 8 && /[A-Za-zÀ-ž]{3}/.test(a)).sort((x, y) => y[0].length - x[0].length);
  const inner = templates.filter(tp => !tp.re.source.endsWith('*?)$')).map(tp => ({ ...tp, re: new RegExp(tp.re.source.slice(1, -1), 'g') }));
  const hasWords = s => /[A-Za-zÀ-ž]{2}/.test(s.replace(/<[^>]*>/g, ''));

  const conv = (s, depth = 0) => {
    if (typeof s !== 'string' || s.length < 3 || depth > 4) return s;
    if (map.has(s)) return map.get(s);
    const part = s.match(/^([\s\S]*) \((\d+\/\d+)\)$/);
    if (part && map.has(part[1])) return `${map.get(part[1])} (${part[2]})`;
    if (s.includes(' · ')) { const segs = s.split(' · '); if (segs.length > 1) return segs.map(x => conv(x, depth + 1)).join(' · '); }
    // Víc vět: když se podaří převést každou zvlášť, použije se to (šablona by spolkla i další větu).
    const sentences = s.split(/(?<=[.!?…])\s+(?=[A-ZÁ-Ž<])/);
    if (sentences.length > 1) {
      const out = sentences.map(x => conv(x, depth + 1));
      if (out.every((x, i) => x !== sentences[i] || !hasWords(x))) return out.join(' ');
    }
    for (const tp of templates) {
      const m = s.match(tp.re);
      if (!m) continue;
      const vals = {};
      tp.names.forEach((n, i) => { vals[n] = m[i + 1].split(', ').map(v => conv(v, depth + 1)).join(', '); });
      return tp.to.replace(/\{(\w+)\}/g, (x, k) => vals[k] ?? x);
    }
    // Poslední možnost: přeložit známé části uvnitř věty (jména praktik, ustálené obraty).
    let out = s;
    for (const [a, b] of subs) if (out.includes(a)) out = out.split(a).join(b);
    for (const tp of inner) out = out.replace(tp.re, (...m) => tp.to.replace(/\{(\w+)\}/g, (x, k) => { const i = tp.names.indexOf(k); return i >= 0 ? m[i + 1] : x; }));
    return out;
  };
  // Kopie praktik a vzorců uložené ve stavu se doplní přímo z aktuálních dat podle id.
  const entity = o => {
    if (typeof o.id !== 'string') return null;
    if ('mech' in o || 'world' in o) return PRACTICES.find(p => p.id === o.id);
    if ('k' in o && 'm' in o && 'd' in o) return PATTERNS.find(p => p.id === o.id);
    return null;
  };
  const walk = v => {
    if (Array.isArray(v)) { v.forEach((x, i) => { if (typeof x === 'string') v[i] = conv(x); else walk(x); }); return; }
    if (!v || typeof v !== 'object') return;
    const src = entity(v);
    if (src) { for (const k of Object.keys(v)) if (typeof v[k] === 'string' && typeof src[k] === 'string') v[k] = src[k]; return; }
    for (const [k, x] of Object.entries(v)) {
      if (SKIP_STATE_KEYS.has(k)) continue;
      if (typeof x === 'string') v[k] = conv(x);
      else walk(x);
    }
  };
  walk(state);
}

/** Přepne jazyk: uloží volbu a načte stránku znovu (obsah se překládá při načtení). */
function setLanguage(lang) {
  try { localStorage.setItem(LANG_KEY, lang); } catch { /* nic */ }
  // Každý jazyk má vlastní adresu: čeština v kořeni, ostatní v podsložce (en/).
  location.href = new URL(lang === 'cs' ? './' : `${lang}/`, document.baseURI).toString();
}

// Jazyk rozehrané hry (uložená hra bez údaje je z doby, kdy hra byla jen česky).
const SAVED_GAME_LANG = (() => {
  try { const d = JSON.parse(localStorage.getItem('projektova-alchymie-rozehrana')); return d ? d.lang || 'cs' : null; } catch { return null; }
})();

// Překlad se vloží hned za tento skript, takže se použije dřív, než se načtou ikony a hra.
// Je-li rozehraná hra v jiném jazyce, načte se i ten – jako slovník pro převod uložené hry.
if (document.currentScript) {
  const load = lang => document.write(`<script src="${document.currentScript.src.replace(/i18n\.js(\?.*)?$/, (m, q) => `lang/${lang}.js${q || ''}`)}"><\/script>`);
  if (LANG !== 'cs') load(LANG);
  if (SAVED_GAME_LANG && SAVED_GAME_LANG !== LANG && SAVED_GAME_LANG !== 'cs') load(SAVED_GAME_LANG);
}
