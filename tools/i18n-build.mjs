// Sestaví js/lang/<jazyk>.js z i18n/<jazyk>/*.json (obsah) a i18n/<jazyk>/ui.json (rozhraní).
// Použití: node tools/i18n-build.mjs [jazyk]   (výchozí en)
import { readFileSync, readdirSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import path from 'node:path';
import { ROOT } from './i18n-lib.mjs';

const lang = process.argv[2] || 'en';
const dir = path.join(ROOT, 'i18n', lang);
const read = f => JSON.parse(readFileSync(path.join(dir, f), 'utf8'));
const content = read('common.json');
content.SCENARIOS = readdirSync(path.join(dir, 'scenarios')).filter(f => f.endsWith('.json')).sort()
  .map(f => read(`scenarios/${f}`));
const ui = existsSync(path.join(dir, 'ui.json')) ? read('ui.json') : {};
mkdirSync(path.join(ROOT, 'js/lang'), { recursive: true });
const out = `// Vygenerováno z i18n/${lang}/ skriptem tools/i18n-build.mjs – neupravovat ručně.
registerLanguage('${lang}', ${JSON.stringify(ui)}, ${JSON.stringify(content)});
`;
writeFileSync(path.join(ROOT, `js/lang/${lang}.js`), out);
console.log(`js/lang/${lang}.js: ${Object.keys(ui).length} textů rozhraní, ${content.SCENARIOS.length} projektů, ${Math.round(out.length / 1024)} kB`);
