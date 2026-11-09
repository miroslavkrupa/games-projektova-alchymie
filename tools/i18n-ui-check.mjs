// Ověří, že každý text rozhraní předaný do tr('…') má překlad v i18n/<jazyk>/ui.json,
// a vypíše položky slovníku, které se v kódu už nepoužívají.
// Použití: node tools/i18n-ui-check.mjs [jazyk]
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { ROOT } from './i18n-lib.mjs';

const lang = process.argv[2] || 'en';
const dict = JSON.parse(readFileSync(path.join(ROOT, `i18n/${lang}/ui.json`), 'utf8'));
const files = ['js/game.js', 'js/fx.js', 'js/career.js', 'js/icons.js'];
const keys = new Set();
for (const f of files) {
  const src = readFileSync(path.join(ROOT, f), 'utf8');
  let i = 0;
  while ((i = src.indexOf('tr(', i)) >= 0) {
    if (/[\w.$]/.test(src[i - 1] || '')) { i += 3; continue; }
    let j = i + 3, depth = 0;
    // Projde první argument: sbírá řetězcové literály, končí na čárce nebo závorce nejvyšší úrovně.
    while (j < src.length) {
      const ch = src[j];
      if (ch === "'" || ch === '"') {
        let k = j + 1, s = '';
        while (src[k] !== ch) { if (src[k] === '\\') { s += src[k + 1]; k += 2; } else s += src[k++]; }
        keys.add(s);
        j = k + 1;
        continue;
      }
      if (ch === '`') { j = src.indexOf('`', j + 1) + 1; continue; }
      if (ch === '(' || ch === '[' || ch === '{') depth++;
      else if (ch === ')' || ch === ']' || ch === '}') { if (depth === 0) break; depth--; }
      else if (ch === ',' && depth === 0) break;
      j++;
    }
    i = j;
  }
}
// Klíče předané přes proměnné (pole popisků, měsíce, kroky úvodu) se kontrolují ručně.
const missing = [...keys].filter(k => !(k in dict) && /[A-Za-zÀ-ž]/.test(k));
const unused = Object.keys(dict).filter(k => !keys.has(k));
console.log(`Texty v kódu: ${keys.size}, ve slovníku: ${Object.keys(dict).length}`);
console.log(`Chybí překlad: ${missing.length}`); missing.forEach(k => console.log('  - ' + k));
console.log(`Nepoužité ve slovníku (může jít o klíče z proměnných): ${unused.length}`); unused.forEach(k => console.log('  ? ' + k));
process.exitCode = missing.length ? 1 : 0;
