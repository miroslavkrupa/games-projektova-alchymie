// ===================== Projektová alchymie – kariéra a odznaky =====================
// Meta-hra napříč projekty. Hodnost se počítá z uložených hvězd, rekordů a atlasu, takže se
// dopočítá i hráčům s dřívějším postupem. Nově se ukládá jen historie her a získané odznaky.
// Soubor se načítá před game.js; funkce ze hry (getStars, getAtlas, sum…) volá až za běhu.

const HISTORY_KEY = 'projektova-alchymie-historie';
const BADGES_KEY = 'projektova-alchymie-odznaky';
const HISTORY_MAX = 50;

const loadJSON = (key, fallback) => {
  try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; }
};
const saveJSON = (key, value) => {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* bez úložiště se kariéra neuloží */ }
};
const getHistory = () => loadJSON(HISTORY_KEY, []);
const getEarned = () => loadJSON(BADGES_KEY, {});

// ---------- Souhrn napříč hrami ----------

function careerStats() {
  const stars = Object.fromEntries(SCENARIOS.map(sc => [sc.id, getStars(sc.id)]));
  const st = id => stars[id] ?? 0;
  const ofLevel = lv => SCENARIOS.filter(sc => (sc.level || 'normal') === lv);
  const atlas = getAtlas();
  const hist = getHistory();
  return {
    stars, st, ofLevel, hist,
    total: sum(SCENARIOS, sc => st(sc.id)),
    patterns: PATTERNS.filter(p => p.type === 'pattern' && atlas.includes(p.id)).length,
    antis: PATTERNS.filter(p => p.type === 'anti' && atlas.includes(p.id)).length,
    atlas: atlas.length,
  };
}

// ---------- Hodnosti ----------
// Každá hodnost vyžaduje i všechny předchozí. `skill` říká, co hráč na té úrovni prokázal.

const RANKS = [
  { name: 'Praktikant', skill: 'Rozhlížíš se po stavbě a zjišťuješ, že univerzální recept neexistuje.', need: [] },
  { name: 'Junior PM', skill: 'Poznáš, co řídit prediktivně a co agilně – a kdy projekt hybrid vůbec nepotřebuje.',
    need: [c => ({ ok: c.total >= 3, text: 'Celkem 3 ★', have: `${Math.min(c.total, 3)}/3` })] },
  { name: 'Projektový manažer', skill: 'Složíš mix praktik, který sedí na kontext projektu a nepadá do pastí.',
    need: [c => ({ ok: c.total >= 8, text: 'Celkem 8 ★', have: `${Math.min(c.total, 8)}/8` }),
      () => ({ ok: hardUnlocked(), text: 'Odemčená náročná úroveň' })] },
  { name: 'Senior PM', skill: 'Když se svět kolem projektu změní, přizpůsobíš řízení – metodika pro tebe není dogma.',
    need: [c => ({ ok: c.total >= 15, text: 'Celkem 15 ★', have: `${Math.min(c.total, 15)}/15` }),
      c => { const n = c.ofLevel('normal').filter(sc => c.st(sc.id) >= 2).length; const all = c.ofLevel('normal').length;
        return { ok: n === all, text: 'Všechny projekty základní úrovně aspoň za ★★', have: `${n}/${all}` }; }] },
  { name: 'Programový manažer', skill: 'Řídíš i v horších podmínkách: s menším rozpočtem, se skrytými faktory a s rozhodnutími, která se vracejí.',
    need: [c => ({ ok: c.total >= 22, text: 'Celkem 22 ★', have: `${Math.min(c.total, 22)}/22` }),
      c => ({ ok: c.ofLevel('hard').some(sc => c.st(sc.id) === 3), text: 'Aspoň jeden náročný projekt za ★★★' })] },
  { name: 'Ředitel PMO', skill: 'Myslíš na lidi, stakeholdery i na to, co z projektu zbude po roce.',
    need: [c => ({ ok: c.total >= 28, text: 'Celkem 28 ★', have: `${Math.min(c.total, 28)}/28` }),
      c => ({ ok: c.ofLevel('insane').some(sc => c.st(sc.id) >= 2), text: 'Aspoň jeden velmi obtížný projekt za ★★' })] },
  { name: 'Mistr alchymie', skill: 'Pro každý projekt namícháš řízení přesně podle jeho povahy.',
    need: [c => ({ ok: c.total >= 33, text: 'Celkem 33 ★', have: `${Math.min(c.total, 33)}/33` }),
      c => ({ ok: c.atlas >= 24, text: `Aspoň 24 z ${PATTERNS.length} vzorců v atlasu`, have: `${Math.min(c.atlas, 24)}/24` })] },
];

const rankChecks = (r, c) => RANKS[r].need.map(fn => fn(c));
function rankIndex(c = careerStats()) {
  let r = 0;
  while (r + 1 < RANKS.length && rankChecks(r + 1, c).every(x => x.ok)) r++;
  return r;
}

// ---------- Odznaky ----------
// `global` = jde ověřit kdykoli z uloženého postupu; ostatní se vyhodnotí jen na konci hry (g = stav hry).

const BADGE_CATS = {
  mistr: { name: 'Mistrovství', color: 'caution' },
  poznani: { name: 'Poznání', color: 'agile' },
  styl: { name: 'Styl řízení', color: 'pred' },
  lide: { name: 'Lidé a udržitelnost', color: 'good' },
  skryte: { name: 'Skryté', color: 'primary' },
};

const ofApproach = a => SCENARIOS.filter(sc => sc.approach === a);
const finished = g => g && !g.failed;

const BADGES = [
  { id: 'prvni_trojka', cat: 'mistr', icon: 'pohar', name: 'První trojka', global: true,
    hint: 'Získej ★★★ v libovolném projektu.',
    lesson: 'Tři hvězdy znamenají, že řízení sedělo na povahu projektu – nejen že to nějak dopadlo.',
    check: c => SCENARIOS.some(sc => c.st(sc.id) === 3) },
  { id: 'vodopad', cat: 'mistr', icon: 'pred', name: 'Vodopád tam, kde sedí', global: true,
    hint: 'Získej ★★★ v prediktivně řízeném projektu.',
    lesson: 'Plán předem není přežitek: kde je zadání jasné a změna drahá, vyhrává.',
    check: c => ofApproach('pred').some(sc => c.st(sc.id) === 3) },
  { id: 'agilita', cat: 'mistr', icon: 'agile', name: 'Čistá agilita', global: true,
    hint: 'Získej ★★★ v agilně řízeném projektu.',
    lesson: 'Kde nikdo předem neví, co uživatelé ocení, vyhrává krátký cyklus a rychlá zpětná vazba.',
    check: c => ofApproach('agile').some(sc => c.st(sc.id) === 3) },
  { id: 'hybrid', cat: 'mistr', icon: 'hybrid', name: 'Hybridní alchymista', global: true,
    hint: 'Získej ★★★ ve všech hybridních projektech základní úrovně.',
    lesson: 'Hybrid je propojení dvou světů ve společných milnících, ne dva projekty vedle sebe.',
    check: c => c.ofLevel('normal').filter(sc => sc.approach === 'hybrid').every(sc => c.st(sc.id) === 3) },
  { id: 'velmi_obtizne', cat: 'mistr', icon: 'velmiobtizna', name: 'Ani mlha nepomohla', global: true,
    hint: 'Získej ★★★ ve velmi obtížném projektu.',
    lesson: 'I bez nápověd, s unaveným týmem a rozhádanými stakeholdery jde řídit dobře.',
    check: c => c.ofLevel('insane').some(sc => c.st(sc.id) === 3) },

  { id: 'sberatel', cat: 'poznani', icon: 'vzorec', name: 'Sběratel vzorců', global: true,
    hint: 'Objev všechny vzorce v atlasu.',
    lesson: 'Vzorec je mechanismus, ne recept: funguje jen v kontextu, pro který vznikl.',
    progress: c => `${c.patterns}/${PATTERNS.filter(p => p.type === 'pattern').length}`,
    check: c => c.patterns === PATTERNS.filter(p => p.type === 'pattern').length },
  { id: 'znalec', cat: 'poznani', icon: 'antivzorec', name: 'Znalec průšvihů', global: true,
    hint: 'Objev všechny antivzorce v atlasu.',
    lesson: 'Antivzorce se nepoznají podle formy, ale podle důsledků – a ty přicházejí pozdě.',
    progress: c => `${c.antis}/${PATTERNS.filter(p => p.type === 'anti').length}`,
    check: c => c.antis === PATTERNS.filter(p => p.type === 'anti').length },
  { id: 'diagnoza', cat: 'poznani', icon: 'lupa', name: 'Správná diagnóza',
    hint: 'U převzatého projektu najdi všechny antivzorce a žádný navíc.',
    lesson: 'Než začneš měnit, zjisti, co v projektu doopravdy nefunguje.',
    check: (c, g) => !!g?.diag?.result && !g.diag.result.wrong.length && !g.diag.result.missed.length },

  { id: 'cisty_stul', cat: 'styl', icon: 'best', name: 'Čistý stůl',
    hint: 'Dokonči projekt bez jediného špatného rozhodnutí.',
    lesson: 'Dobré řízení je hlavně řada malých rozhodnutí, která nic nezhorší.',
    check: (c, g) => finished(g) && g.lessons.length > 0 && !g.lessons.some(l => l.rating === 'bad') },
  { id: 'stihla_rezie', cat: 'styl', icon: 'rozpocet', name: 'Štíhlá režie',
    hint: 'Získej aspoň ★★ s mixem praktik nejméně o 3 body levnějším, než je rozpočet režie.',
    lesson: 'Víc praktik neznamená lepší řízení. Každá porada a report stojí čas, který chybí na práci.',
    check: (c, g, res) => res.stars >= 2 && g.mixCost <= budget() - 3 },
  { id: 'prizpusobivy', cat: 'styl', icon: 'znovu', name: 'Přizpůsobivý', global: true,
    hint: 'Po změně kontextu přeskládej mix správně ve třech hrách.',
    lesson: 'Metodika nastavená na začátku řeší včerejší problémy. Když se svět změní, změň i řízení.',
    progress: c => `${Math.min(3, c.hist.filter(h => h.adapted).length)}/3`,
    check: c => c.hist.filter(h => h.adapted).length >= 3 },
  { id: 'rozdel', cat: 'styl', icon: 'nuzky', name: 'Rozděl a panuj',
    hint: 'Rozděl příliš velkou položku a dodej všechny její části.',
    lesson: 'Co se nevejde do jednoho sprintu, nedodáš nikdy celé. Malé kusy jdou dodat i ověřit.',
    check: (c, g) => { const groups = [...new Set(g.backlog.filter(b => b.splitOf).map(b => b.splitOf))];
      return groups.some(id => g.backlog.filter(b => b.splitOf === id).every(b => b.done)); } },
  { id: 'hypoteza', cat: 'styl', icon: 'zkumavka', name: 'Hypotéza ověřena',
    hint: 'Ověř v jednom projektu hodnotu aspoň 4 experimenty.',
    lesson: 'Levný experiment je lepší než drahá funkce, o kterou nikdo nestojí.',
    check: (c, g) => (g.expTotal || 0) >= 4 },
  { id: 'rezerva', cat: 'styl', icon: 'harmonogram', name: 'Rezerva nedotčena',
    hint: 'Dokonči etapový projekt, aniž bys sáhl(a) do rezervy.',
    lesson: 'Rezerva je pojistka, ne rozpočet na neplánování. Nejlepší je ta, kterou nepotřebuješ.',
    check: (c, g) => finished(g) && !!g.sc.phases && g.overrunTotal === 0 },

  { id: 'nikdo_neodesel', cat: 'lide', icon: 'tym', name: 'Nikdo neodešel',
    hint: 'Ve velmi obtížném projektu udrž celý tým a morálku aspoň 60.',
    lesson: 'Projekt se dá dotáhnout na úkor lidí jen jednou. Další už s tebou nikdo dělat nebude.',
    check: (c, g) => finished(g) && g.team.length > 0 && g.team.every(p => !p.gone) && g.metrics.moralka >= 60 },
  { id: 'jasna_hranice', cat: 'lide', icon: 'ozubene', name: 'Jasná hranice',
    hint: 'Předej provozu všechnu rutinu a žádnou skutečnou projektovou práci.',
    lesson: 'Projekt je dočasný a jedinečný. Rutina patří linii, jinak po projektu nikdo nezůstane.',
    check: (c, g) => g.lessons.some(l => l.title === 'Projekt, nebo provoz?' && l.rating === 'best') },
  { id: 'rok_pote', cat: 'lide', icon: 'v-investice_se_vraci', name: 'Rok poté',
    hint: 'Dosáhni udržitelnosti výsledku aspoň 80 %.',
    lesson: 'Úspěch projektu se pozná až po roce: jestli řešení žije, lidé ho umí a stakeholdeři ho chtějí.',
    check: (c, g) => !!g.epilog && g.epilog.sustain >= 80 },

  { id: 'meloun', cat: 'skryte', icon: 'v-melounovy_reporting', name: 'Meloun roku', global: true, hidden: true,
    hint: 'Skrytý odznak.',
    lesson: 'Zvenku zelený, uvnitř červený. Když reporting ukazuje procenta místo hotové práce, pravda přijde pozdě.',
    check: c => c.hist.filter(h => h.meloun).length >= 3 },
  { id: 'hrdina', cat: 'skryte', icon: 'v-hrdinske_tempo', name: 'Hrdina týdne', hidden: true,
    hint: 'Skrytý odznak.',
    lesson: 'Tohle nebyla výhra. Přesčasy jako rezerva kapacity jen odkládají účet – zaplatí ho kvalita a lidé.',
    check: (c, g, res) => finished(g) && g.mix.includes('prescasy') && res.stars >= 1 },
  { id: 'komise', cat: 'skryte', icon: 'x-ccball', name: 'Komise schválila komisi', hidden: true,
    hint: 'Skrytý odznak.',
    lesson: 'Měsíční komise pro každou změnu backlogu zabije to hlavní, proč je projekt agilní: rychlou reakci.',
    check: (c, g) => g.mix.includes('ccball') && g.approach === 'agile' },
];

const badgeById = id => BADGES.find(b => b.id === id);

/** Udělí odznaky, které jde ověřit z uloženého postupu (bez rozehrané hry). Vrací nově získané. */
function awardGlobal(c = careerStats()) {
  const earned = getEarned();
  const fresh = BADGES.filter(b => b.global && !earned[b.id] && b.check(c));
  if (fresh.length) { fresh.forEach(b => { earned[b.id] = Date.now(); }); saveJSON(BADGES_KEY, earned); }
  return fresh.map(b => b.id);
}

/** Zapíše dohranou hru do historie a vyhodnotí odznaky a povýšení. Volá se jednou na konci hry. */
function recordCareer(f, res, rankBefore) {
  const hist = getHistory();
  hist.unshift({ id: S.sc.id, at: Date.now(), score: f.score, stars: res.stars, failed: !!S.failed,
    adapted: S.shiftAdapted === true, meloun: isFound('melounovy_reporting') });
  saveJSON(HISTORY_KEY, hist.slice(0, HISTORY_MAX));
  const c = careerStats();
  const earned = getEarned();
  const fresh = BADGES.filter(b => !earned[b.id] && (b.global ? b.check(c) : b.check(c, S, res)));
  fresh.forEach(b => { earned[b.id] = Date.now(); });
  if (fresh.length) saveJSON(BADGES_KEY, earned);
  return { newBadges: fresh.map(b => b.id), rankBefore, rankAfter: rankIndex(c) };
}

// ---------- Vykreslení ----------

/** Nášivka odznaku: šestiúhelník v barvě kategorie s ikonou uprostřed. */
function patch(b, earned, cls = '') {
  const icon = earned ? b.icon : b.hidden ? 'otaznik' : 'zamek';
  return `<span class="patch ${earned ? '' : 'locked'} ${cls}" style="--patch:var(--${BADGE_CATS[b.cat].color})" aria-hidden="true">
    <svg class="patch-bg" viewBox="0 0 48 52"><use href="#i-nasivka"/></svg>${ic(icon)}</span>`;
}

function badgeCard(b, earned, c) {
  const name = earned || !b.hidden ? b.name : 'Skrytý odznak';
  const text = earned ? b.lesson : b.hint;
  const prog = !earned && b.progress ? ` <span class="badge-prog">${b.progress(c)}</span>` : '';
  return `<div class="badge ${earned ? 'earned' : 'locked'}">${patch(b, earned)}
    <span><b>${name}</b>${prog}<small>${b.hidden && !earned ? 'Objevíš ho, až ho získáš.' : text}</small></span></div>`;
}

/** Krátký souhrn na úvodní obrazovku. */
function careerSummary() {
  const c = careerStats();
  awardGlobal(c);
  const n = Object.keys(getEarned()).length;
  return { rank: RANKS[rankIndex(c)].name, badges: n, total: c.total };
}

function careerModal() {
  const c = careerStats();
  awardGlobal(c);
  const r = rankIndex(c);
  const earned = getEarned();
  const next = RANKS[r + 1];
  const nextChecks = next ? rankChecks(r + 1, c) : [];
  const ladder = RANKS.map((x, i) => `<li class="${i < r ? 'past' : i === r ? 'now' : ''}">${x.name}</li>`).join('');
  const played = SCENARIOS.filter(sc => c.stars[sc.id] !== null);
  const games = id => c.hist.filter(h => h.id === id).length;
  const praxe = played.length
    ? `<ul class="cv-list">${played.map(sc => `
        <li><span class="cv-icon">${sc.icon}</span><span><b>${sc.name}</b><small>${APPROACHES[sc.approach].label}${games(sc.id) ? ` · odehráno ${games(sc.id)}×` : ''}</small></span>
        <span class="cv-res">${starRow(c.st(sc.id), 'sm')}<small>${getRecord(sc.id)} b.</small></span></li>`).join('')}</ul>`
    : '<p class="hint">Zatím žádná praxe. Dokonči první projekt.</p>';
  const cats = Object.entries(BADGE_CATS).map(([id, cat]) => `
    <h4 class="badge-cat">${cat.name}</h4>
    <div class="badge-grid">${BADGES.filter(b => b.cat === id).map(b => badgeCard(b, !!earned[b.id], c)).join('')}</div>`).join('');
  return modal(`${ic('medaile')} Životopis projektového manažera`, `
    <div class="cv-head">
      <div><span class="cv-label">Současná pozice</span><h3 class="cv-rank">${RANKS[r].name}</h3><p>${RANKS[r].skill}</p></div>
      <ol class="cv-ladder">${ladder}</ol>
    </div>
    ${next ? `<div class="cv-next"><b>Na povýšení na ${next.name} chybí:</b>
      <ul class="checklist">${nextChecks.map(x => `<li>${okIc(x.ok)} ${x.text}${x.have ? ` <small>(${x.have})</small>` : ''}</li>`).join('')}</ul></div>`
      : '<div class="cv-next"><b>Dosáhl(a) jsi nejvyšší pozice.</b> Gratulujeme, mistře alchymie.</div>'}
    <h3>${ic('kniha')} Praxe <small class="cv-count">${c.total} ★ z ${SCENARIOS.length * 3} · odehráno her: ${c.hist.length}</small></h3>
    ${praxe}
    <h3>${ic('medaile')} Odznaky <small class="cv-count">${Object.keys(earned).length} z ${BADGES.length}</small></h3>
    ${cats}`);
}

/** Karta na závěrečné obrazovce: povýšení a nově získané odznaky. */
function careerNews() {
  const k = S.career;
  if (!k || (!k.newBadges.length && k.rankAfter <= k.rankBefore)) return '';
  const promo = k.rankAfter > k.rankBefore ? `
    <div class="promo"><span class="cv-label">Povýšení</span>
      <h3>${RANKS[k.rankBefore].name} ${GO} ${RANKS[k.rankAfter].name}</h3><p>${RANKS[k.rankAfter].skill}</p></div>` : '';
  const badges = k.newBadges.map(badgeById).filter(Boolean);
  return `
    <div class="card career-news">
      ${promo}
      ${badges.length ? `<h3>${ic('oslava')} ${badges.length > 1 ? 'Nové odznaky' : 'Nový odznak'}</h3>
        <div class="badge-grid">${badges.map(b => badgeCard(b, true)).join('')}</div>` : ''}
      <div class="actions"><button class="btn" data-action="career">${ic('medaile')} Životopis</button></div>
    </div>`;
}
