// Společné funkce pro překlad obsahu hry (spouští se v Node.js, ne v prohlížeči).
// Obsah hry (js/data.js, js/data-insane.js) se načte do izolovaného kontextu a z dat se
// vytáhnou jen texty. Překladový soubor kopíruje strukturu dat: objekty podle klíčů,
// pole podle pořadí (prvky s `id` podle id). Netextová pole (id, výčty, čísla) se vynechají.

import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

export const ROOTS = ['METRICS', 'MOSCOW', 'CONTEXT_TAGS', 'PRACTICES', 'WORLD_LABEL', 'PRACTICE_PAIRS',
  'ESSENTIALS', 'APPROACHES', 'PATTERNS', 'GATE_EVENT', 'GENERIC_EVENTS', 'SKILLS', 'GLOSSARY', 'SCENARIOS'];

// Klíče, jejichž hodnoty nejsou text pro hráče (id, výčty, odkazy na jiné položky).
export const SKIP_KEYS = new Set(['id', 'icon', 'answer', 'approach', 'approaches', 'track', 'world', 'kind', 'type',
  'rating', 'moscow', 'area', 'owner', 'requires', 'needs', 'useIn', 'trapIn', 'level', 'context', 'hiddenContext',
  'skill', 'deps', 'period', 'a', 'b', 'any', 'fits', 'reveal', 'mix', 'distractors', 'ms', 'metric', 'joins',
  'leave', 'teach', 'dropScope', 'addStakeholders', 'removeStakeholders', 'knows', 'after', 'key', 'pattern', 'patterns']);

export function loadData() {
  const code = readFileSync(path.join(ROOT, 'js/data.js'), 'utf8') + '\n'
    + readFileSync(path.join(ROOT, 'js/data-insane.js'), 'utf8') + `\n;({ ${ROOTS.join(', ')} });`;
  return vm.runInNewContext(code, {});
}

const isIdent = s => /^[a-z0-9_~\-]+$/.test(s);
const isText = s => typeof s === 'string' && /[A-Za-zÀ-ž]/.test(s) && !isIdent(s);

/** Vrátí kostru jen s texty (nebo undefined, když v uzlu žádný text není). */
export function extract(v, key) {
  if (key !== undefined && SKIP_KEYS.has(key)) return undefined;
  if (typeof v === 'string') return isText(v) ? v : undefined;
  if (Array.isArray(v)) {
    const out = v.map(x => extract(x));
    return out.some(x => x !== undefined) ? out.map(x => (x === undefined ? null : x)) : undefined;
  }
  if (v && typeof v === 'object') {
    const out = {};
    for (const [k, x] of Object.entries(v)) {
      if (typeof x === 'function') continue;
      const e = extract(x, k);
      if (e !== undefined) out[k] = e;
    }
    if (!Object.keys(out).length) return undefined;
    if (v.id !== undefined && typeof v.id === 'string') return { id: v.id, ...out };
    return out;
  }
  return undefined;
}

/** Porovná překlad s českou kostrou: chybějící a přebývající cesty a podezřelé české texty. */
export function compare(cs, tr, p = '', issues = []) {
  if (typeof cs === 'string') {
    if (typeof tr !== 'string' || !tr.trim()) issues.push(`chybí text: ${p}`);
    else {
      const ph = s => (s.match(/\{\w+\}/g) || []).sort().join(' ');
      if (ph(cs) !== ph(tr)) issues.push(`jiné zástupné symboly {…}: ${p}`);
      const tags = s => (s.match(/<\/?[a-z]+/g) || []).sort().join(' ');
      if (tags(cs) !== tags(tr)) issues.push(`jiné HTML značky: ${p}`);
      // Shodný text je v pořádku u ustálených anglických termínů (Daily scrum, Battle pass); hlásí se jen česky vypadající.
      if (tr === cs && /[ěščřžůťďňáéíóúýĚŠČŘŽŮŤĎŇÁÉÍÓÚÝ]/.test(cs) && !cs.split(/\s+/).every(w => compare.names.has(w))) issues.push(`nepřeloženo: ${p}`);
      else {
        const czech = (tr.match(/[A-Za-zÀ-ž]*[ěščřžůťďňĚŠČŘŽŮŤĎŇ][A-Za-zÀ-ž]*/g) || []).filter(w => !compare.names.has(w));
        if (czech.length) issues.push(`zůstala čeština (${czech.slice(0, 3).join(', ')}): ${p}`);
      }
    }
    return issues;
  }
  if (cs === null) return issues;
  if (Array.isArray(cs)) {
    if (!Array.isArray(tr) || tr.length !== cs.length) { issues.push(`jiná délka pole: ${p}`); return issues; }
    cs.forEach((x, i) => compare(x, tr[i], `${p}[${i}]`, issues));
    return issues;
  }
  if (typeof tr !== 'object' || tr === null || Array.isArray(tr)) { issues.push(`chybí objekt: ${p}`); return issues; }
  for (const k of Object.keys(cs)) {
    if (k === 'id') { if (tr.id !== cs.id) issues.push(`jiné id: ${p}.id`); continue; }
    compare(cs[k], tr[k], `${p}.${k}`, issues);
  }
  for (const k of Object.keys(tr)) if (!(k in cs)) issues.push(`navíc: ${p}.${k}`);
  return issues;
}

compare.names = new Set();

/** Jména postav (smí zůstat česky i v překladu). */
export function personNames(data) {
  const names = new Set(['Ruda', 'Gantt', 'Bára', 'Backlogová']);
  const add = n => n && n.split(/\s+/).forEach(w => names.add(w.replace(/[^A-Za-zÀ-ž]/g, '')));
  const walk = v => {
    if (Array.isArray(v)) v.forEach(walk);
    else if (v && typeof v === 'object') {
      if (typeof v.name === 'string' && typeof v.role === 'string') add(v.name);
      Object.values(v).forEach(walk);
    }
  };
  walk(data.SCENARIOS);
  return names;
}
