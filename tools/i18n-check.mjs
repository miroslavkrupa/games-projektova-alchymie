// Ověří překlad obsahu proti české kostře: chybějící texty, jiné id, zástupné symboly, HTML, zbytky češtiny.
// Použití: node tools/i18n-check.mjs [jazyk] [soubor…]   např. node tools/i18n-check.mjs en scenarios/knihovna
import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { ROOT, loadData, compare, personNames } from './i18n-lib.mjs';

const [lang = 'en', ...only] = process.argv.slice(2);
compare.names = personNames(loadData());
const files = only.length ? only : ['common', ...readdirSync(path.join(ROOT, 'i18n/cs/scenarios')).map(f => `scenarios/${f.replace('.json', '')}`)];
let total = 0;
for (const f of files) {
  const cs = JSON.parse(readFileSync(path.join(ROOT, 'i18n/cs', `${f}.json`), 'utf8'));
  let tr;
  try { tr = JSON.parse(readFileSync(path.join(ROOT, `i18n/${lang}`, `${f}.json`), 'utf8')); }
  catch (e) { console.log(`${f}: nejde načíst (${e.message})`); total++; continue; }
  const issues = compare(cs, tr);
  total += issues.length;
  console.log(`${f}: ${issues.length ? `${issues.length} problémů` : 'OK'}`);
  issues.slice(0, 40).forEach(i => console.log('   ' + i));
}
process.exitCode = total ? 1 : 0;
