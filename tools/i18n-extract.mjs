// Vytáhne české texty obsahu do i18n/cs/ (kostra) a založí chybějící překladové soubory i18n/<jazyk>/.
// Použití: node tools/i18n-extract.mjs [jazyk]   (výchozí en)
import { mkdirSync, writeFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import { ROOT, ROOTS, loadData, extract } from './i18n-lib.mjs';

const lang = process.argv[2] || 'en';
const data = loadData();
const chunks = { common: {} };
for (const r of ROOTS) {
  if (r === 'SCENARIOS') continue;
  const e = extract(data[r]);
  if (e !== undefined) chunks.common[r] = e;
}
for (const sc of data.SCENARIOS) chunks[`scenarios/${sc.id}`] = extract(sc);

for (const [name, content] of Object.entries(chunks)) {
  const json = JSON.stringify(content, null, 2) + '\n';
  const cs = path.join(ROOT, 'i18n/cs', `${name}.json`);
  mkdirSync(path.dirname(cs), { recursive: true });
  writeFileSync(cs, json);
  const tr = path.join(ROOT, `i18n/${lang}`, `${name}.json`);
  mkdirSync(path.dirname(tr), { recursive: true });
  if (!existsSync(tr)) writeFileSync(tr, json);
}
console.log(`Kostra: ${Object.keys(chunks).length} souborů v i18n/cs, překlad v i18n/${lang}.`);
