// Herní logika: stav hry, vyhodnocování rozhodnutí a vykreslování obrazovek.
'use strict';

const SPRINTS = 6;
const BASE_CAPACITY = 9;
const START_METRIC = 50;
// Rozpočet řídicí režie pro mix praktik; každý bod navíc stojí 1 SP kapacity za sprint.
const OVERHEAD_BUDGET = 8;
const MILESTONE_THRESHOLD = 45;
const MIX_INSIGHT_MAX = 80;
// Náročná úroveň (Hard): menší rozpočet režie, nižší start ukazatelů, dřívější konec projektu.
const HARD = { budget: 6, startMetric: 40, failAt: 10 };
const HARD_UNLOCK_SCORE = 70;
// Velmi obtížná úroveň (Insane): pravidla bez nápověd, mlha reportingu, stakeholdeři, provoz, lidé a rok poté platí jen pro ni.
const INSANE = { budget: 6, startMetric: 40, failAt: 12 };
const INSANE_UNLOCK_SCORE = 70;
const LEVELS = { normal: { budget: OVERHEAD_BUDGET, startMetric: START_METRIC, failAt: 0 }, hard: HARD, insane: INSANE };
const STAKE_START = 50;
// Únava lidí (0–100): přírůstek za SP práce v oblasti, kterou umí, odpočinek za období, přetížení a přesčasy.
const FATIGUE = { perSP: 4, perSPShared: 2, rest: 10, restRetro: 14, overtime: 8, overload: 10, overloadKanban: 5, warn: 75, quit: 100 };
// Za každou oblast, kterou nikdo v týmu neumí, je práce o polovinu pracnější.
const UNKNOWN_AREA_FACTOR = 1.5;
const OPS_POINTS = 5;
const DIAG_POINTS = 5;
const TAKEOVER_ADD_COST = { rozpocet: -1, moralka: -1 };
// Změna kontextu: kolik praktik lze přidat a co každá stojí.
const MAX_SHIFT_ADDS = 2;
const SHIFT_ADD_COST = { rozpocet: -3, moralka: -2 };
// Každá hra vylosuje nejvýš tolik obecných událostí, zbytek do SPRINTS doplní události scénáře.
const GENERIC_EVENTS_PER_GAME = 3;
// S praktikou Hypotézy a experimenty lze za sprint levně ověřit hodnotu tolika položek.
const EXPERIMENTS_PER_SPRINT = 2;
const RATING_POINTS = { best: 10, ok: 4, bad: 0 };
const RATING_ICON = { best: ic('best'), ok: ic('ok'), bad: ic('bad') };
const RATING_LABEL = { best: `${RATING_ICON.best} ${tr('Výborná volba')}`, ok: `${RATING_ICON.ok} ${tr('Přijatelná volba')}`, bad: `${RATING_ICON.bad} ${tr('Špatná volba')}` };
const GO = ic('sipka');
const okIc = ok => ic(ok ? 'best' : 'bad', 'sm');
const stakeIdx = id => S.sc.stakeholders.findIndex(x => x.id === id);
const TRACK_LABEL = { pred: `${ic('pred')} ${tr('prediktivně řízené prvky')}`, agile: `${ic('agile')} ${tr('agilně řízené prvky')}`, both: `${ic('hybrid')} ${tr('propojení obou přístupů')}` };
const PATTERN_TYPE = { pattern: `${ic('vzorec')} Vzorec`, anti: `${ic('antivzorec')} Antivzorec` };
const ALL_APPROACHES = ['hybrid', 'pred', 'agile'];
const RECORD_KEY = 'hybridni-projekt-rekord-';
const STARS_KEY = 'projektova-alchymie-hvezdy-';
const ATLAS_KEY = 'hybridni-projekt-atlas';

// Tvary slov pro období projektu (sprint v agilním a hybridním, etapa v prediktivním).
const PERIOD_FORMS = {
  cs: {
    Sprint: { nom: 'Sprint', gen: 'sprintu', acc: 'sprint', few: 'sprinty', many: 'sprintů', next: 'příštího sprintu', review: 'Sprint review', toReview: 'sprint review' },
    Etapa: { nom: 'Etapa', gen: 'etapy', acc: 'etapu', few: 'etapy', many: 'etap', next: 'příští etapy', review: 'Kontrola etapy', toReview: 'kontrolu etapy' },
  },
  en: {
    Sprint: { nom: 'Sprint', gen: 'sprint', acc: 'sprint', few: 'sprints', many: 'sprints', next: 'next sprint', review: 'Sprint review', toReview: 'sprint review' },
    Etapa: { nom: 'Stage', gen: 'stage', acc: 'stage', few: 'stages', many: 'stages', next: 'next stage', review: 'Stage review', toReview: 'stage review' },
  },
};
const PERIODS = PERIOD_FORMS[LANG] || PERIOD_FORMS.cs;

const TIMELINE_LABELS = {
  hybrid: [[`${ic('pred')} ${tr('Prediktivní prvky')}`, tr('fáze a milníky')], [`${ic('agile')} ${tr('Agilní prvky')}`, tr('sprinty')]],
  pred: [[`${ic('cil')} ${tr('Milníky')}`, tr('konec každé etapy')], [`${ic('harmonogram')} ${tr('Etapy')}`, tr('plán po vlnách')]],
  agile: [[`${ic('terc')} ${tr('Cíle trakce')}`, tr('hodnota pro uživatele')], [`${ic('agile')} ${tr('Sprinty')}`, tr('po 2 týdnech')]],
};

const app = document.getElementById('app');
let S;

function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const clamp = v => Math.max(0, Math.min(100, v));
const sum = (arr, fn) => arr.reduce((s, x) => s + fn(x), 0);
const metricById = id => METRICS.find(m => m.id === id);
const practiceById = id => PRACTICES.find(p => p.id === id);
const appliesTo = (item, approach) => (item.approaches || ALL_APPROACHES).includes(approach);

function addEffects(...list) {
  const out = {};
  for (const e of list) for (const [k, v] of Object.entries(e || {})) out[k] = (out[k] || 0) + v;
  return out;
}

// Dosadí výrazy scénáře za {klíč}. Text začínající zástupným symbolem dostane velké písmeno.
function localize(v, terms) {
  if (typeof v === 'string') {
    if (!v.includes('{')) return v;
    const s = v.replace(/\{(\w+)\}/g, (m, k) => terms[k] ?? m);
    return v.startsWith('{') ? s.charAt(0).toUpperCase() + s.slice(1) : s;
  }
  if (Array.isArray(v)) return v.map(x => localize(x, terms));
  if (v && typeof v === 'object') return Object.fromEntries(Object.entries(v).map(([k, x]) => [k, localize(x, terms)]));
  return v;
}

// Připraví rozhodnutí pro hru: dosadí texty a zamíchá pořadí odpovědí.
function prepDecision(item, terms) {
  const d = localize(item, terms);
  d.choices = shuffle(d.choices);
  return d;
}

// ---------- Trvalé úložiště (rekordy, atlas) ----------

function getRecord(id) {
  try { return +localStorage.getItem(RECORD_KEY + id) || 0; } catch { return 0; }
}

function setRecord(id, score) {
  try { localStorage.setItem(RECORD_KEY + id, String(score)); } catch { /* bez úložiště se rekord neuloží */ }
}

function getStars(id) {
  try { const v = localStorage.getItem(STARS_KEY + id); return v === null ? null : +v; } catch { return null; }
}

function setStars(id, stars) {
  try { localStorage.setItem(STARS_KEY + id, String(stars)); } catch { /* bez úložiště se hvězdy neuloží */ }
}

function getAtlas() {
  try { return JSON.parse(localStorage.getItem(ATLAS_KEY)) || []; } catch { return []; }
}

function addToAtlas(id) {
  const atlas = getAtlas();
  if (atlas.includes(id)) return;
  atlas.push(id);
  try { localStorage.setItem(ATLAS_KEY, JSON.stringify(atlas)); } catch { /* atlas se neuloží */ }
}

// ---------- Nová hra ----------

function newGame() {
  S = { screen: 'intro', sc: null, modal: null };
  render();
}

const scPeriods = sc => (sc.phases ? sc.phases.length : sc.sprints ?? SPRINTS);

// Události: buď pevné pořadí slotů (v každém se vylosuje jedna z možností), nebo zamíchané události scénáře a obecné.
function drawEvents(sc) {
  if (sc.eventSlots) return sc.eventSlots.map(pool => prepDecision(pool[Math.floor(Math.random() * pool.length)], sc.terms));
  const generic = shuffle(GENERIC_EVENTS.filter(e => appliesTo(e, sc.approach)));
  const nGeneric = Math.min(GENERIC_EVENTS_PER_GAME, generic.length);
  return shuffle([
    ...shuffle(sc.events).slice(0, scPeriods(sc) - nGeneric),
    ...generic.slice(0, nGeneric),
  ]).map(e => prepDecision(e, sc.terms));
}

function startScenario(id) {
  const sc = SCENARIOS.find(s => s.id === id);
  const lv = LEVELS[sc.level || 'normal'];
  const metrics = Object.fromEntries(METRICS.map(m => [m.id, sc.startMetrics?.[m.id] ?? lv.startMetric]));
  S = {
    screen: 'brief',
    sc,
    approach: sc.approach,
    targetValue: sc.targetValue ?? (sum((sc.backlog || []).filter(b => b.moscow === 'M' || b.moscow === 'S'), b => b.value) || 1),
    metrics,
    reportHistory: [{ ...metrics }],
    stake: Object.fromEntries((sc.stakeholders || []).filter(s => !s.joins).map(s => [s.id, s.start ?? STAKE_START])),
    team: (sc.team || []).map(p => ({ ...p, knows: p.knows.slice(), fatigue: p.fatigue ?? 20, gone: false })),
    teamLoss: 0,
    opsOverhead: 0,
    handedOver: [],
    splitSeq: 0,
    diag: sc.takeover ? { picks: [], result: null, symptoms: shuffle(sc.takeover.symptoms) } : null,
    extraContext: [],
    shiftsDone: [],
    shiftCur: null,
    shiftPenalty: null,
    shiftDelay: 0,
    epilog: null,
    closed: false,
    insight: 0,
    insightMax: 0,
    lessons: [],
    sortOrder: shuffle(sc.workstreams || []),
    sortAnswers: {},
    sortResult: null,
    mix: sc.takeover ? sc.takeover.mix.slice() : [],
    mixCost: 0,
    mixResult: null,
    overloads: 0,
    found: [],
    sprint: 1,
    backlog: (sc.backlog || []).map(b => ({ ...b, done: false })),
    selected: [],
    verified: [],
    experiments: 0,
    expTotal: 0,
    career: null,
    valueDelivered: 0,
    buffer: 0,
    initialBuffer: 0,
    gantt: null,
    phaseRun: null,
    phaseDelay: 0,
    phaseResults: [],
    overrunTotal: 0,
    carryIn: [],
    hiddenRevealed: false,
    shiftAdapted: null,
    shiftCapacity: 0,
    reshape: null,
    shiftResult: null,
    echoes: { good: 0, bad: 0 },
    aftermath: [],
    aftermathApplied: false,
    capacityMod: 0,
    events: drawEvents(sc),
    gate: prepDecision(sc.gate || GATE_EVENT, sc.terms),
    current: null,
    review: null,
    milestones: {},
    depUnlock: 3,
    gateDone: false,
    failed: null,
    prevRecord: null,
    prevStars: null,
    modal: null,
  };
  // Převzatý projekt už nějaký mix praktik má.
  S.mixCost = currentMixCost();
}

// ---------- Typ projektu a úroveň ----------

// Typ projektu se může během hry změnit (projekt, který mění tvář).
const AP = () => S.approach;
const level = () => S.sc.level || 'normal';
const isHard = () => level() === 'hard';
const isInsane = () => level() === 'insane';
const budget = () => LEVELS[level()].budget;
const failAt = () => LEVELS[level()].failAt;
const expPerSprint = () => S.sc.experimentsPerSprint ?? EXPERIMENTS_PER_SPRINT;
// Kontext, který hráč zná: skrytý faktor a nové okolnosti se přidají až po změně kontextu.
const visibleContext = () => [
  ...S.sc.context,
  ...(S.hiddenRevealed && S.sc.hiddenContext ? [S.sc.hiddenContext] : []),
  ...S.extraContext,
];

const urlFlag = name => new RegExp(`[?&]${name}\\b`).test(location.search);

function hardUnlocked() {
  if (urlFlag('hard') || urlFlag('insane')) return true;
  return SCENARIOS.some(sc => !sc.level && getRecord(sc.id) >= HARD_UNLOCK_SCORE);
}

function insaneUnlocked() {
  if (urlFlag('insane')) return true;
  return SCENARIOS.some(sc => sc.level === 'hard' && getRecord(sc.id) >= INSANE_UNLOCK_SCORE);
}

function levelUnlocked(lv) {
  return lv === 'hard' ? hardUnlocked() : lv === 'insane' ? insaneUnlocked() : true;
}

// Pravidla velmi obtížné úrovně: bez nápověd (1) a mlha reportingu (2), dokud v mixu není dashboard nebo EVM.
const hints = () => !isInsane();
const fogged = () => isInsane() && !has('dashboard') && !has('evm');

// V mlze přicházejí aspoň neformální signály, když je některý ukazatel opravdu nízko.
const FOG_SIGNALS = {
  rozpocet: `${ic('bublina')} ${tr('Finanční oddělení se začíná vyptávat na každou fakturu.')}`,
  harmonogram: `${ic('bublina')} ${tr('Na chodbě se šušká, že termín je nereálný.')}`,
  kvalita: `${ic('bublina')} ${tr('Testeři si stěžují na čím dál víc chyb.')}`,
  spokojenost: `${ic('bublina')} ${tr('Zadavatel přestal odpovídat na e-maily.')}`,
  moralka: `${ic('bublina')} ${tr('Lidé v týmu si potichu aktualizují životopisy.')}`,
};
const fogSignals = () => (fogged() ? METRICS.filter(m => S.metrics[m.id] < 25).map(m => FOG_SIGNALS[m.id]) : []);
const per = () => PERIODS[APPROACHES[AP()].period];

// ---------- Velmi obtížná úroveň: stakeholdeři (3) ----------

const stakeholderById = id => S.sc.stakeholders.find(s => s.id === id);

function applyStake(changes = {}) {
  const deltas = {};
  for (const [k, v] of Object.entries(changes)) {
    if (!(k in S.stake)) continue;
    const before = S.stake[k];
    S.stake[k] = clamp(before + v);
    deltas[k] = S.stake[k] - before;
  }
  return deltas;
}

const stakeMin = () => (Object.keys(S.stake).length ? Math.min(...Object.values(S.stake)) : null);

// ---------- Velmi obtížná úroveň: lidé a znalosti (5) ----------

const present = () => S.team.filter(p => !p.gone);
const knowers = area => present().filter(p => p.knows.includes(area));
const areaLabel = a => S.sc.areas[a].label;
const vf = (p, m, f) => (p.f ? f : m);
// Práce v oblasti, kterou v týmu nikdo neumí, je pracnější – někdo se ji musí naučit za pochodu.
const itemSP = it => (it.area && S.team.length && !knowers(it.area).length ? Math.ceil(it.sp * UNKNOWN_AREA_FACTOR) : it.sp);

function leavePerson(p, reason) {
  if (p.gone) return [];
  p.gone = true;
  S.teamLoss++;
  const lost = p.knows.filter(a => !knowers(a).length);
  applyEffects({ moralka: -4 });
  return [`${ic('dvere')} ${p.name} ${reason}.${lost.length ? ' ' + tr('Nikdo jiný neumí: {areas} – práce v {where} bude o polovinu pracnější.', { areas: lost.map(areaLabel).join(', '), where: lost.length > 1 ? tr('těchto oblastech') : tr('této oblasti') }) : ''}`];
}

// Sdílení znalostí: oblast, kterou umí jen jeden člověk, se naučí ten nejméně unavený z ostatních.
function teach(area) {
  const ks = knowers(area);
  const learner = present().filter(p => !p.knows.includes(area)).sort((a, b) => a.fatigue - b.fatigue)[0];
  if (!learner) return null;
  learner.knows.push(area);
  return `${ic('kniha')} ${tr('{name} se naučil{a}: {area}', { name: learner.name, a: learner.f ? 'a' : '', area: areaLabel(area) })}${ks.length ? ' ' + tr('(učí {who})', { who: ks.map(p => p.name).join(tr(' a ')) }) : ''}.`;
}

// Změny týmu z rozhodnutí a změn kontextu: { leave, fatigue: { id | all: n }, teach: area, join: [osoby] }.
function applyTeam(t) {
  if (!t || !S.team.length) return [];
  const notes = [];
  for (const [id, n] of Object.entries(t.fatigue || {})) {
    for (const p of id === 'all' ? present() : present().filter(x => x.id === id)) p.fatigue = clamp(p.fatigue + n);
  }
  for (const id of [].concat(t.leave || [])) {
    const p = S.team.find(x => x.id === id);
    if (p) notes.push(...leavePerson(p, t.reason || tr('odchází z projektu')));
  }
  for (const p of t.join || []) {
    S.team.push({ ...p, knows: p.knows.slice(), fatigue: p.fatigue ?? 10, gone: false });
    notes.push(`${ic('tym')} ${tr('Do týmu přišel{a} {name} ({role}).', { a: p.f ? 'a' : '', name: p.name, role: p.role })}`);
  }
  if (t.teach) { const n = teach(t.teach); if (n) notes.push(n); }
  return notes;
}

// Únava po období: práce ve vlastní oblasti, přesčasy, přetížení, odpočinek a sdílení znalostí.
function teamAfterPeriod(items, overloaded) {
  if (!S.team.length) return [];
  const notes = [];
  const load = {};
  for (const it of items) {
    const ks = it.area ? knowers(it.area) : [];
    const who = ks.length ? ks : present();
    const per = (ks.length ? FATIGUE.perSP : FATIGUE.perSPShared) * it.sp / who.length;
    for (const p of who) load[p.id] = (load[p.id] || 0) + per;
  }
  const base = (has('prescasy') ? FATIGUE.overtime : 0)
    + (overloaded ? (has('kanban') ? FATIGUE.overloadKanban : FATIGUE.overload) : 0)
    - (has('retro') ? FATIGUE.restRetro : FATIGUE.rest);
  for (const p of present()) p.fatigue = clamp(Math.round(p.fatigue + (load[p.id] || 0) + base));
  if (has('znalosti')) {
    const single = Object.keys(S.sc.areas).find(a => knowers(a).length === 1);
    const n = single && teach(single);
    if (n) notes.push(n);
  }
  for (const p of present()) {
    if (p.fatigue >= FATIGUE.quit) notes.push(...leavePerson(p, tr('vyhořel{a} a odchází', { a: p.f ? 'a' : '' })));
    else if (p.fatigue >= FATIGUE.warn) notes.push(`${ic('tvar-vycerpani')} ${tr('{name} je na hraně sil.', { name: p.name })}`);
  }
  return notes;
}

// ---------- Praktiky a vzorce ----------

const has = id => S.mix.includes(id);
const chosenPractices = () => S.mix.map(practiceById);
const currentMixCost = () => sum(chosenPractices(), p => p.cost);
const activePairs = () => PRACTICE_PAIRS.filter(x => has(x.a) && has(x.b));
const isTrap = p => (p.trapIn || []).includes(AP());
const isMisfit = p => !isTrap(p) && p.useIn && !p.useIn.includes(AP());
const hasPlanning = () => chosenPractices().some(p => p.planning);

function patternCtx() {
  return { has, approach: AP(), cost: S.mixCost, budget: budget(), overloads: S.overloads,
    adapted: S.shiftAdapted, goodEchoes: S.echoes.good, badEchoes: S.echoes.bad };
}

const isFound = id => S.found.some(f => f.id === id);
const activePatterns = () => PATTERNS.filter(p => appliesTo(p, AP()) && p.when(patternCtx()));

// Odhalí vzorce, které v této hře vznikly a jejichž chvíle právě nastala.
function revealPatterns(trigger) {
  const out = [];
  for (const p of activePatterns()) {
    if (isFound(p.id)) continue;
    const due = typeof p.reveal === 'number' ? trigger === 'sprint' && S.sprint >= Math.min(p.reveal, periods()) : p.reveal === trigger;
    if (!due) continue;
    const deltas = applyEffects(p.once);
    S.found.push({ id: p.id, sprint: S.sprint });
    addToAtlas(p.id);
    out.push({ p, deltas });
  }
  return out;
}

function practiceCapacity() {
  return sum(chosenPractices(), p => p.capacity || 0) - Math.max(0, S.mixCost - budget());
}

function milestoneThreshold() {
  let t = hasPlanning() ? MILESTONE_THRESHOLD : MILESTONE_THRESHOLD + 10;
  if (has('sync') && has('integrace')) t -= 10;
  return t;
}

// Zmírní negativní dopady události podle zvolených praktik.
function softenEffects(effects, track) {
  const out = { ...effects };
  const by = [];
  for (const p of chosenPractices()) {
    const s = p.softens;
    if (!s) continue;
    if (s.track && s.track !== track) continue;
    let changed = false;
    for (const [k, v] of Object.entries(out)) {
      if (v >= 0 || (s.metrics && !s.metrics.includes(k))) continue;
      out[k] = Math.round(v * s.factor);
      changed = changed || out[k] !== v;
    }
    if (changed) by.push(p);
  }
  return { effects: out, by };
}

// ---------- Mechaniky ----------

function applyEffects(effects = {}) {
  const deltas = {};
  for (const [k, v] of Object.entries(effects)) {
    if (!(k in S.metrics)) continue;
    const before = S.metrics[k];
    S.metrics[k] = clamp(before + v);
    deltas[k] = (deltas[k] || 0) + S.metrics[k] - before;
  }
  return deltas;
}

function recordDecision(title, choice, lesson) {
  S.insight += RATING_POINTS[choice.rating];
  S.insightMax += RATING_POINTS.best;
  S.lessons.push({ period: S.sprint, title, rating: choice.rating, choice: choice.text, lesson });
}

function checkFail() {
  const m = S.metrics;
  const f = failAt();
  if (S.failed) { /* projekt už skončil (např. zmeškaný start) */ }
  else if (m.rozpocet <= f) S.failed = tr('Rozpočet je vyčerpaný. Sponzor projekt zastavil.');
  else if (m.spokojenost <= f) S.failed = tr('Řídicí výbor ztratil důvěru a odvolal tě z projektu.');
  else if (m.moralka <= f) S.failed = tr('Tým se rozpadl – většina lidí odešla.');
  else if (m.harmonogram <= f) S.failed = tr('Projekt se zpozdil natolik, že ho vedení zrušilo.');
  else {
    const lost = Object.entries(S.stake).find(([, v]) => v <= f);
    if (lost) { const s = stakeholderById(lost[0]); S.failed = `${s.name}: ${s.quit}`; }
  }
  if (S.failed) { closeProject(); S.screen = 'end'; }
  return !!S.failed;
}

const baseCapacity = () => S.sc.baseCapacity ?? BASE_CAPACITY;
const moraleCapacity = () => Math.floor((S.metrics.moralka - 50) / 10);

function capacity() {
  // Kapacita nesmí klesnout pod největší položky backlogu (5 SP), jinak by nešly nikdy dokončit.
  return Math.max(5, baseCapacity() + moraleCapacity() + practiceCapacity() + S.capacityMod + S.shiftCapacity - S.teamLoss - S.opsOverhead);
}

// Skutečná hodnota položky (v agilním scénáři se liší od odhadu).
const itemValue = it => it.actual ?? it.value;
const valueKnown = it => it.actual === undefined || it.done || S.verified.includes(it.id);

// Must položky včetně těch předaných provozu – předaný Must v projektu dodaný nebude.
const mustItems = () => [...S.backlog, ...S.handedOver].filter(b => b.moscow === 'M');

// Položka větší než kapacita se ve sprintu nikdy nedokončí – dá se ale rozdělit na menší části.
const tooBig = it => !it.done && itemSP(it) > capacity();
const canSplit = it => tooBig(it) && it.sp >= 2;

// Rozdělí celé číslo na n co nejrovnějších částí (větší napřed).
function splitInt(total, n) {
  const base = Math.floor(total / n);
  return Array.from({ length: n }, (_, i) => base + (i < total % n ? 1 : 0));
}

const SPLIT_LESSON = tr('Co se nevejde do jednoho sprintu, nedodáš nikdy celé. Velkou položku rozděl na menší části, z nichž každá jde dokončit a předvést – třeba podle kroků procesu, typů dat nebo skupin uživatelů.');

function splitItem(it) {
  const cap = capacity();
  let n = 2;
  while (n < it.sp && itemSP({ ...it, sp: Math.ceil(it.sp / n) }) > cap) n++;
  const sps = splitInt(it.sp, n);
  const vals = splitInt(it.value, n);
  const acts = it.actual !== undefined ? splitInt(it.actual, n) : null;
  // Poslední část si nechá původní id, aby dál platily návaznosti, milníky i předání.
  const ids = sps.map((_, i) => (i === n - 1 ? it.id : `${it.id}~${++S.splitSeq}`));
  const parts = sps.map((sp, i) => {
    const part = { ...it, id: ids[i], sp, value: vals[i], name: `${it.name} (${i + 1}/${n})`, splitOf: it.splitOf || it.id };
    if (acts) part.actual = acts[i];
    if (i > 0) part.requires = [ids[i - 1]];
    if (i < n - 1) { delete part.reveals; delete part.handover; }
    return part;
  });
  if (S.verified.includes(it.id)) S.verified.push(...ids.slice(0, -1));
  S.backlog.splice(S.backlog.indexOf(it), 1, ...parts);
  S.selected = S.selected.filter(x => x !== it.id);
  const note = tr('{name} na {n} části', { name: it.name, n });
  const l = S.lessons.find(x => x.key === 'split');
  if (l) l.choice += `, ${note}`;
  else S.lessons.push({ period: S.sprint, key: 'split', title: tr('Příliš velká položka'), rating: 'best', choice: tr('rozděleno: {note}', { note }), lesson: SPLIT_LESSON });
}

function itemLock(item) {
  if (item.done) return 'Hotovo';
  if (item.needsMilestone && S.sprint < S.depUnlock) {
    return tr('{lock} – dostupné od {gen} {n}', { lock: S.sc.dependency.lock, gen: per().gen, n: S.depUnlock });
  }
  const missing = (item.requires || []).filter(id => !S.backlog.find(b => b.id === id)?.done);
  if (missing.length) {
    const name = id => (S.backlog.find(b => b.id === id) || S.sc.backlog.find(b => b.id === id) || { name: id }).name;
    return tr('Nejdřív musí být hotové: {list}', { list: missing.map(name).join(', ') });
  }
  return null;
}

function selectedSP() {
  return sum(S.selected, id => itemSP(S.backlog.find(b => b.id === id)));
}

function addItems(items) {
  const added = [];
  for (const it of items || []) {
    if (S.backlog.some(b => b.id === it.id)) continue;
    S.backlog.push({ ...it, done: false });
    added.push(it);
  }
  return added;
}

// Průběžné působení mixu praktik a vzorců (i těch, které hráč ještě neodhalil).
function applyOngoing() {
  const sources = [
    ...chosenPractices().filter(p => p.perSprint).map(p => ({ label: `${p.icon} ${p.name}`, e: p.perSprint })),
    ...activePatterns().filter(p => p.perSprint).map(p => ({
      label: isFound(p.id) ? `${p.icon} ${p.name}` : `${ic('otaznik')} ${tr('neodhalený vliv')}`, e: p.perSprint,
    })),
  ];
  if (S.shiftPenalty) { const sp = PATTERNS.find(p => p.id === 'strnula_metodika'); sources.push({ label: `${sp.icon} ${sp.name}`, e: S.shiftPenalty }); }
  if (!sources.length) return null;
  return { labels: sources.map(x => x.label), deltas: applyEffects(addEffects(...sources.map(x => x.e))) };
}

function runSprint() {
  const cap = capacity();
  S.capacityMod = 0;
  const items = S.selected.map(id => S.backlog.find(b => b.id === id));
  const committed = sum(items, itemSP);
  const delivered = [];
  const unfinished = [];
  let used = 0;
  for (const it of items) {
    if (!unfinished.length && used + itemSP(it) <= cap) {
      used += itemSP(it);
      it.done = true;
      delivered.push(it);
    } else {
      unfinished.push(it);
    }
  }
  const value = sum(delivered, itemValue);
  S.valueDelivered += value;
  const feedback = AP() === 'pred' || chosenPractices().some(p => p.feedbackLoop);
  const notes = [];
  const effects = { spokojenost: Math.round(value / (feedback ? 6 : 12)) };
  if (unfinished.length) {
    S.overloads++;
    effects.moralka = has('kanban') ? practiceById('kanban').overloadMorale : -8;
    effects.kvalita = -4;
    effects.spokojenost -= 4;
    notes.push(tr('Tým se zavázal k víc práci, než zvládne. Nedokončené položky se vrací zpět, lidé jsou vyčerpaní a sliby nesplněné.'));
  }
  const anyAvailable = S.backlog.some(b => !itemLock(b));
  if (committed < cap * 0.6 && anyAvailable) {
    effects.spokojenost -= 3;
    notes.push(tr('Tým nevyužil velkou část kapacity, i když byla dostupná práce.'));
  }
  if (value) {
    const tail = AP() === 'pred' ? '' : ' ' + (feedback ? tr('Přírůstek si vyzkoušeli na review.') : tr('Bez review ji ale uživatelé skoro nevidí.'));
    notes.unshift(tr('Dodaná hodnota: +{value}.', { value }) + tail);
  }
  if (S.sc.burn) {
    const revenue = Math.round(value / (S.sc.revenueDiv || 5));
    effects.rozpocet = (effects.rozpocet || 0) - S.sc.burn + revenue;
    notes.push(`${ic('rozpocet')} ${tr('Provoz týmu stál {burn}, tržby z nové verze přinesly {revenue}.', { burn: S.sc.burn, revenue })}`);
  }
  const deltas = applyEffects(effects);

  // Stakeholdeři: každý sleduje hlavně „své“ položky. Kdo dlouho nic nedostane, ztrácí trpělivost.
  const stakeChange = {};
  for (const id of Object.keys(S.stake)) {
    const val = sum(delivered.filter(it => it.owner === id), itemValue);
    const waiting = S.backlog.some(b => !b.done && b.owner === id && !b.ops && b.moscow !== 'W');
    stakeChange[id] = val ? Math.round(val / 3) : waiting ? -3 : 0;
  }
  const stakeDeltas = applyStake(stakeChange);

  // Dodané funkce mohou odhalit nové podněty od uživatelů.
  const discovered = addItems(delivered.flatMap(it => (it.reveals || []).map(id => (S.sc.discoveries || []).find(d => d.id === id)).filter(Boolean)));

  const ongoing = applyOngoing();
  const teamNotes = teamAfterPeriod(items, unfinished.length > 0);

  S.review = {
    cap, committed, experiments: S.experiments, delivered, unfinished, value, notes, deltas, stakeDeltas, teamNotes,
    discovered, ongoing, milestone: null, reveals: [], signals: fogSignals(),
  };
  S.selected = [];
  S.experiments = 0;
}

function checkMilestone() {
  const ms = S.sc.milestones.find(m => m.afterSprint === S.sprint);
  if (!ms) return null;
  let ok, text, effects = {};
  if (ms.kind === 'launch') {
    const missing = mustItems().filter(b => !b.done);
    ok = missing.length === 0;
    text = ok ? ms.okText : `${ms.lateText} ${missing.map(b => b.name).join(', ')}.`;
    if (!ok) effects = { spokojenost: -4 * missing.length };
    if (!ok && ms.fatal) S.failed = ms.failText;
  } else if (ms.kind === 'integration') {
    const missing = ms.requires.filter(id => !S.backlog.find(b => b.id === id)?.done);
    ok = !missing.length;
    text = ok ? ms.okText : `${ms.lateText} ${tr('Chybí: {list}.', { list: missing.map(id => [...S.backlog, ...S.handedOver].find(b => b.id === id)?.name || id).join(', ') })}`;
    if (!ok) effects = { kvalita: -8, spokojenost: -6 };
  } else if (ms.kind === 'traction') {
    ok = S.valueDelivered >= ms.target;
    text = `${ok ? ms.okText : ms.lateText} ${tr('(Skutečná hodnota pro uživatele: {value}, cíl {target}.)', { value: S.valueDelivered, target: ms.target })}`;
    if (!ok) effects = { spokojenost: ms.afterSprint === periods() ? -10 : -6 };
  } else {
    const threshold = milestoneThreshold();
    ok = S.metrics.harmonogram >= threshold;
    text = ok ? ms.okText : `${ms.lateText}${fogged() ? '' : ' ' + tr('(Harmonogram {h}, potřeba ≥ {need}.)', { h: S.metrics.harmonogram, need: threshold })}`;
    if (!ok && ms.kind === 'dependency') { S.depUnlock = 4; effects = { spokojenost: -6 }; }
    if (!ok && ms.kind === 'schedule') effects = { spokojenost: -8, rozpocet: -5 };
  }
  const deltas = applyEffects(effects);
  S.milestones[ms.id] = ok ? 'ok' : 'late';
  return { ...ms, ok, text, deltas };
}

const MIX_LESSON = {
  hybrid: tr('Dobrý hybridní mix pokryje plán a rizika prediktivně řízených prvků, iterace a Product Ownera u agilně řízených prvků a hlavně jejich propojení v jednom projektu – bez zbytečné režie.'),
  pred: tr('V prediktivním projektu se vyplatí detailní plán s kritickou cestou, řízení změn a rizik a přesné měření stavu. Agilní ceremonie by tu byly jen režií.'),
  agile: tr('V agilním projektu se vyplatí iterace, Product Owner, ověřování hypotéz a průběžné zlepšování. Detailní plán by stál na neověřených předpokladech.'),
};

// Vyhodnotí mix praktik: jednorázové efekty, soulad s kontextem a manažerský úsudek.
function evaluateMix() {
  S.mixCost = currentMixCost();
  const chosen = chosenPractices();
  // Převzatý projekt: jednorázově působí jen nově zavedené praktiky; zavedení stojí, zrušení škodlivých uleví.
  const to = S.sc.takeover;
  const fresh = to ? chosen.filter(p => !to.mix.includes(p.id)) : chosen;
  const removed = to ? to.mix.filter(id => !has(id)) : [];
  const fits = fresh.flatMap(p => (p.fits || []).filter(t => visibleContext().includes(t)).map(t => ({ p, t })));
  const deltas = applyEffects(addEffects(
    ...fresh.map(p => p.effects), ...fits.map(() => CONTEXT_FIT_EFFECTS),
    ...(to ? fresh.map(() => TAKEOVER_ADD_COST) : []), ...removed.map(id => (to.removeBonus || {})[id]),
  ));
  const essentials = ESSENTIALS[AP()].map(e => ({ ...e, ok: e.any.some(has) }));
  const traps = chosen.filter(isTrap);
  const misfits = chosen.filter(isMisfit);
  const costOk = S.mixCost >= Math.min(4, budget() - 2) && S.mixCost <= budget() + 1;
  if (AP() === 'pred') S.buffer = S.initialBuffer = (S.sc.buffer || 0) + sum(chosen, p => p.bufferBonus || 0);

  // Mix je klíčové rozhodnutí hry, proto váží víc než jednotlivá událost.
  const perEssential = Math.floor((MIX_INSIGHT_MAX - 8) / essentials.length);
  let points = perEssential * essentials.filter(e => e.ok).length + (traps.length || misfits.length ? 0 : 8)
    - 15 * traps.length - 8 * misfits.length - (costOk ? 0 : 15);
  points = Math.max(0, Math.min(MIX_INSIGHT_MAX, points));
  S.insight += points;
  S.insightMax += MIX_INSIGHT_MAX;
  S.lessons.push({ period: S.sprint,
    title: to ? tr('Zásah do mixu praktik') : tr('Mix praktik'),
    rating: points >= 64 ? 'best' : points >= 40 ? 'ok' : 'bad',
    choice: (chosen.map(p => p.icon).join(' ') || tr('žádné praktiky')) + (hints() ? '' : ` · ${tr('chyběly základy: {list}', { list: essentials.filter(e => !e.ok).map(e => e.name.toLowerCase()).join(', ') || tr('žádné') })}${traps.length ? ` · ${tr('pasti: {list}', { list: traps.map(p => p.name).join(', ') })}` : ''}`),
    lesson: to ? to.lesson : MIX_LESSON[AP()],
  });
  S.mixResult = { deltas, fits, essentials, traps, misfits, pairs: activePairs(), fresh, removed };
}

// ---------- Prediktivní projekt: etapy, Gantt a plánování po vlnách ----------

const isPhased = () => !!S.sc.phases;
const periods = () => scPeriods(S.sc);
const gateAfter = () => S.sc.gateAfter ?? 4;
const phase = () => S.sc.phases[S.sprint - 1];
const taskMD = t => t.days * t.people;
const taskSkill = t => t.skill || 'lide';
const phaseMD = ph => sum(ph.tasks, taskMD);
const taskEnd = (start, t) => start + t.days - 1;
const byTaskId = tasks => Object.fromEntries(tasks.map(t => [t.id, t]));
// Úkoly aktuální etapy včetně práce přesunuté z minulé výluky.
const phaseTasks = () => [...S.carryIn, ...phase().tasks];
const GANTT_EXTRA_DAYS = 5;
const GANTT_LESSON = tr('Dobrý Gantt má správné závislosti, respektuje kapacitu lidí a vejde se do délky etapy – ideálně s malou vůlí na neočekávané.');

function initGantt() {
  const tasks = phaseTasks();
  S.gantt = {
    starts: Object.fromEntries(tasks.map(t => [t.id, 1])),
    deps: Object.fromEntries(tasks.map(t => [t.id, []])),
  };
  // Neupravená metodika po změně kontextu (Hard) zdržuje každou etapu.
  S.phaseDelay = S.shiftDelay;
}

// Lidé každé profese na den: základ etapy upravený morálkou, mixem praktik a událostmi.
function crews() {
  const ph = phase();
  const base = typeof ph.crew === 'number' ? { lide: ph.crew } : ph.crew;
  const mod = Math.trunc((practiceCapacity() + moraleCapacity() + S.capacityMod + S.shiftCapacity) / 2);
  // Každá profese má vždy aspoň tolik lidí, kolik potřebuje její největší úkol – jinak by úkol nikdy nezačal.
  const need = k => Math.max(1, ...phaseTasks().filter(t => taskSkill(t) === k).map(t => t.people));
  return Object.fromEntries(Object.entries(base).map(([k, n]) => [k, Math.max(need(k), n - 2, n + mod)]));
}

// Kolik lidí (dané profese) je potřeba v jednotlivých dnech; extra = dny navíc u úkolu (opravy).
function usage(tasks, startOf, extra = {}, skill = null) {
  const out = [];
  for (const t of tasks) {
    if (skill && taskSkill(t) !== skill) continue;
    const s = startOf(t);
    for (let d = s; d < s + t.days + (extra[t.id] || 0); d++) out[d] = (out[d] || 0) + t.people;
  }
  return out;
}

// Počet dní, kdy některá profese nestačí.
function overloadDays(tasks, startOf, crew) {
  const days = new Set();
  for (const k of Object.keys(crew)) usage(tasks, startOf, {}, k).forEach((u, d) => { if (u > crew[k]) days.add(d); });
  return days.size;
}

// Úkoly, které začínají dřív, než skončí některý jejich předchůdce.
function depConflicts(tasks, starts, depsOf) {
  const byId = byTaskId(tasks);
  return tasks.filter(t => depsOf(t).some(d => byId[d] && starts[t.id] <= taskEnd(starts[d], byId[d])));
}

// Úkoly naplánované dřív, než přijede inspektor nebo zkušebna.
const holdConflicts = (tasks, starts) => tasks.filter(t => t.holdDay && starts[t.id] < t.holdDay);

// Nejdřívější začátky podle vyznačených závislostí a inspekčních dnů (bez ohledu na kapacitu).
function earliestStarts(tasks, deps) {
  const byId = byTaskId(tasks);
  const es = Object.fromEntries(tasks.map(t => [t.id, 1]));
  for (let i = 0; i <= tasks.length; i++) {
    for (const t of tasks) es[t.id] = Math.max(1, t.holdDay || 1, ...deps[t.id].filter(d => byId[d]).map(d => es[d] + byId[d].days));
  }
  return es;
}

// Kritická cesta a vůle úkolů podle vyznačených závislostí.
function criticalInfo(tasks, deps) {
  const es = earliestStarts(tasks, deps);
  const end = Math.max(...tasks.map(t => taskEnd(es[t.id], t)));
  const ls = Object.fromEntries(tasks.map(t => [t.id, end - t.days + 1]));
  for (let i = 0; i <= tasks.length; i++) {
    for (const t of tasks) {
      const succ = tasks.filter(x => deps[x.id].includes(t.id));
      const lf = succ.length ? Math.min(...succ.map(x => ls[x.id])) - 1 : end;
      ls[t.id] = lf - t.days + 1;
    }
  }
  const float = Object.fromEntries(tasks.map(t => [t.id, Math.max(0, ls[t.id] - es[t.id])]));
  return { end, float, critical: new Set(tasks.filter(t => float[t.id] === 0).map(t => t.id)) };
}

// Posouzení plánu: vůči vyznačeným (viditelné) i skutečným závislostem (skryté do konce etapy).
function evaluateGantt() {
  const tasks = phaseTasks();
  const g = S.gantt;
  const crew = crews();
  return {
    crew,
    finish: Math.max(...tasks.map(t => taskEnd(g.starts[t.id], t))),
    declaredConflicts: depConflicts(tasks, g.starts, t => g.deps[t.id]),
    trueConflicts: depConflicts(tasks, g.starts, t => t.deps),
    holdConflicts: holdConflicts(tasks, g.starts),
    missed: tasks.flatMap(t => t.deps.filter(d => !g.deps[t.id].includes(d)).map(d => [d, t.id])),
    extra: tasks.flatMap(t => g.deps[t.id].filter(d => !t.deps.includes(d)).map(d => [d, t.id])),
    overDays: overloadDays(tasks, t => g.starts[t.id], crew),
  };
}

// Přehraje etapu den po dni podle skutečných závislostí a skutečné velikosti týmu:
// úkol začne nejdřív v plánovaný den (a ne před inspekcí), až skončí jeho předchůdci
// a jsou volní lidé dané profese. Konflikt se skutečnou závislostí = přerušení a den navíc.
function simulatePhase() {
  const run = S.phaseRun;
  const tasks = run.tasks;
  const crew = run.plan.crew;
  const conflictIds = new Set(run.plan.trueConflicts.map(t => t.id));
  const actual = {};
  const use = Object.fromEntries(Object.keys(crew).map(k => [k, []]));
  const pending = tasks.slice().sort((a, b) => run.starts[a.id] - run.starts[b.id] || a.id.localeCompare(b.id));
  for (let day = 1; pending.length && day < 200; day++) {
    for (const t of pending.slice()) {
      if (day < run.starts[t.id] || day < (t.holdDay || 1)) continue;
      if (!t.deps.every(d => actual[d] && actual[d].end < day)) continue;
      const len = t.days + (conflictIds.has(t.id) ? 1 : 0);
      const u = use[taskSkill(t)] || (use[taskSkill(t)] = []);
      const cap = Math.max(crew[taskSkill(t)] ?? 0, t.people);
      if (Array.from({ length: len }, (_, i) => (u[day + i] || 0) + t.people > cap).some(Boolean)) continue;
      for (let i = 0; i < len; i++) u[day + i] = (u[day + i] || 0) + t.people;
      const ready = Math.max(run.starts[t.id], t.holdDay || 1, ...t.deps.map(d => actual[d].end + 1));
      actual[t.id] = { start: day, end: day + len - 1, rework: len > t.days, waitedForPeople: Math.max(0, day - ready) };
      pending.splice(pending.indexOf(t), 1);
    }
  }
  const workEnd = Math.max(...tasks.map(t => actual[t.id].end));
  return {
    actual, workEnd,
    overDays: run.plan.overDays,
    delay: S.phaseDelay,
    finish: workEnd + S.phaseDelay,
    rework: tasks.filter(t => actual[t.id].rework),
    waited: tasks.filter(t => actual[t.id].waitedForPeople),
  };
}

function finalizePhase() {
  const ph = phase();
  const tasks = S.phaseRun.tasks;
  const sim = simulatePhase();
  // Výluka: co se do okna nevejde, přesune se do další výluky (rezerva projektu se čerpá až v poslední).
  const windowed = ph.window && S.sprint < periods();
  let overrun = Math.max(0, sim.finish - ph.days);
  let carry = [];
  let base;
  const before = S.buffer;
  if (windowed) {
    const limit = ph.days - S.phaseDelay;
    carry = tasks.filter(t => sim.actual[t.id].end > limit).map(t => {
      const a = sim.actual[t.id];
      return {
        id: `${t.id}${S.sprint}`, name: t.carried ? t.name : tr('{name} – dokončení', { name: t.name }), days: Math.max(1, a.end - Math.max(limit, a.start - 1)),
        people: t.people, skill: t.skill, deps: [], carried: true, note: tr('Nestihlo se v minulé výluce – dokončuje se teď.'),
      };
    });
    base = carry.length ? { spokojenost: -4 * carry.length, rozpocet: -3 * carry.length } : { spokojenost: 4, harmonogram: 2 };
  } else {
    S.buffer -= overrun;
    S.overrunTotal += overrun;
    base = overrun ? { spokojenost: -3 * overrun } : { spokojenost: 4, harmonogram: 2 };
  }
  const beyond = Math.max(0, -S.buffer) - Math.max(0, -before);
  const deltas = applyEffects(addEffects(
    base,
    beyond ? { harmonogram: -5 * beyond, rozpocet: -4 * beyond } : {},
    sim.rework.length ? { rozpocet: -sim.rework.length, moralka: -sim.rework.length } : {},
    sim.overDays ? { moralka: -Math.min(8, 2 * sim.overDays) } : {},
  ));
  const late = windowed ? carry.length > 0 : overrun > 0;
  if (windowed && !carry.length) overrun = 0;
  S.carryIn = carry;
  S.overrunTotal += carry.length;
  S.milestones[ph.id] = late ? 'late' : 'ok';
  S.phaseResults[S.sprint - 1] = { finish: sim.finish, overrun, carried: carry.length };
  S.review = {
    phase: ph, tasks, sim, plan: S.phaseRun.plan, starts: S.phaseRun.starts, deps: S.phaseRun.deps,
    overrun, beyond, buffer: S.buffer, deltas, carry, windowed, late,
    plannedMD: sum(tasks, taskMD), actualMD: sum(tasks, taskMD) + sum(sim.rework, t => t.people),
    ongoing: applyOngoing(), reveals: [],
  };
}

// ---------- Úroveň Hard: změna kontextu a opožděné následky ----------

// Změny kontextu: Hard má jednu hned po kontrolním bodu, projekt měnící tvář jich má víc.
const shifts = () => S.sc.shifts || (S.sc.shift ? [{ ...S.sc.shift, after: gateAfter() }] : []);
const curShift = () => shifts()[S.shiftCur];
const pendingShiftIdx = () => shifts().findIndex((sh, i) => sh.after === S.sprint && !S.shiftsDone.includes(i));
const maxShiftAdds = () => curShift().maxAdds ?? MAX_SHIFT_ADDS;

// Změna kontextu: odhalí skrytý faktor, případně změní typ projektu, upraví backlog a tým a otevře přeskládání mixu.
function applyShift() {
  S.shiftCur = pendingShiftIdx();
  const sh = curShift();
  S.hiddenRevealed = true;
  if (sh.context) S.extraContext.push(sh.context);
  const prevApproach = AP();
  if (sh.approach) S.approach = sh.approach;
  const devalued = [];
  if (sh.devalue) {
    for (const b of S.backlog) {
      if (b.done || b.category !== sh.devalue.category) continue;
      b.actual = sh.devalue.actual;
      S.verified = S.verified.filter(id => id !== b.id);
      devalued.push(b);
    }
  }
  const added = addItems(sh.addItems);
  S.shiftCapacity -= sh.capacityLoss || 0;
  for (const id of sh.addStakeholders || []) S.stake[id] = stakeholderById(id).start ?? STAKE_START;
  const teamNotes = applyTeam(sh.team);
  S.reshape = { original: S.mix.slice(), mix: S.mix.slice(), devalued, added, teamNotes, prevApproach };
  S.shiftResult = null;
}

const reshapeAdds = () => S.reshape.mix.filter(id => !S.reshape.original.includes(id));

function confirmReshape() {
  const sh = curShift();
  const adds = reshapeAdds();
  const removed = S.reshape.original.filter(id => !S.reshape.mix.includes(id));
  S.mix = S.reshape.mix.slice();
  S.mixCost = currentMixCost();
  const costDeltas = applyEffects(addEffects(...adds.map(() => SHIFT_ADD_COST)));
  // needs: seznam praktik (stačí jedna), nebo seznam skupin (z každé skupiny aspoň jedna).
  const groups = Array.isArray(sh.needs[0]) ? sh.needs : [sh.needs];
  const adapted = groups.every(g => g.some(has));
  S.shiftAdapted = adapted;
  S.shiftPenalty = adapted ? null : sh.penalty;
  S.shiftDelay = adapted ? 0 : sh.delayIfNot || 0;
  // Praktiky, které sedí na nově odhalený kontext, se teď vyplatí.
  const newCtx = sh.context || S.sc.hiddenContext;
  const hiddenFits = chosenPractices().filter(p => (p.fits || []).includes(newCtx));
  const fitDeltas = applyEffects(addEffects(...hiddenFits.map(() => CONTEXT_FIT_EFFECTS)));
  // Když se změní typ projektu, posuzuje se celý mix – i praktiky, které novému typu škodí.
  const newBad = (sh.approach ? chosenPractices() : adds.map(practiceById)).filter(p => isTrap(p) || isMisfit(p));
  const rating = adapted && !newBad.length && S.mixCost <= budget() + 1 ? 'best' : adapted ? 'ok' : 'bad';
  const icons = ids => ids.map(id => practiceById(id).icon).join(' ') || '–';
  recordDecision(tr('Změna kontextu: {title}', { title: sh.title }),
    { rating, text: adds.length || removed.length ? tr('přidáno {added}, odebráno {removed}', { added: icons(adds), removed: icons(removed) }) : tr('mix beze změny') }, sh.lesson);
  // Reakce na změnu kontextu je klíčová lekce – v úsudku váží dvojnásob.
  S.insight += RATING_POINTS[rating];
  S.insightMax += RATING_POINTS.best;
  S.shiftsDone.push(S.shiftCur);
  S.shiftResult = { adapted, adds, removed, newBad, hiddenFits, deltas: addEffects(costDeltas, fitDeltas), reveals: revealPatterns('shift') };
}

// Opožděný následek: navazující událost se vloží o několik období později.
// Když se do projektu nevejde, dopadne na projekt až po jeho konci.
function scheduleFollowup(choice, ev) {
  const fu = (S.sc.followups || {})[choice.later.event];
  if (!fu) return null;
  const meta = { echo: true, good: choice.rating === 'best', fromTitle: ev.title, fromChoice: choice.text, fromSprint: S.sprint };
  let idx = S.sprint - 1 + choice.later.after;
  while (idx < periods() && S.events[idx] && S.events[idx].echo) idx++;
  if (idx < periods()) {
    S.events[idx] = { ...prepDecision(fu, S.sc.terms), ...meta };
    return idx + 1;
  }
  S.aftermath.push({ ...meta, title: fu.title, text: fu.unresolvedText || fu.text, effects: fu.unresolved || {} });
  return null;
}

function applyAftermath() {
  if (S.aftermathApplied) return;
  S.aftermathApplied = true;
  for (const a of S.aftermath) a.deltas = applyEffects(a.effects);
}

// ---------- Velmi obtížná úroveň: diagnóza, provoz a rok poté ----------

// Antivzorce, které v převzatém projektu skutečně působí (podle mixu předchozího vedení).
function takeoverTruth() {
  const saved = S.mix;
  S.mix = S.sc.takeover.mix;
  const ids = activePatterns().filter(p => p.type === 'anti').map(p => p.id);
  S.mix = saved;
  return ids;
}

function evaluateDiagnosis() {
  const truth = takeoverTruth();
  const picks = S.diag.picks;
  const hits = picks.filter(id => truth.includes(id));
  const wrong = picks.filter(id => !truth.includes(id));
  const missed = truth.filter(id => !picks.includes(id));
  const points = Math.max(0, DIAG_POINTS * (hits.length - wrong.length));
  S.insight += points;
  S.insightMax += DIAG_POINTS * truth.length;
  const names = ids => ids.map(id => PATTERNS.find(p => p.id === id).name).join(', ') || tr('žádné');
  S.lessons.push({ period: S.sprint,
    title: tr('Diagnóza převzatého projektu'),
    rating: !wrong.length && !missed.length ? 'best' : hits.length > wrong.length ? 'ok' : 'bad',
    choice: tr('správně {hits} z {all} · navíc: {wrong} · přehlédnuto: {missed}', { hits: hits.length, all: truth.length, wrong: names(wrong), missed: names(missed) }),
    lesson: S.sc.takeover.diagLesson,
  });
  S.diag.result = { hits, wrong, missed, truth };
}

// Projekt, nebo provoz (4): rutinu je lepší předat liniové organizaci, než ji řídit jako projekt.
function evaluateOps() {
  const all = [...S.backlog, ...S.handedOver];
  const ops = all.filter(b => b.ops);
  if (!ops.length && !S.sc.workstreams?.some(w => w.answer === 'ops')) return;
  const handedOps = S.handedOver.filter(b => b.ops);
  const handedReal = S.handedOver.filter(b => !b.ops);
  const doneOps = ops.filter(b => b.done);
  S.insightMax += OPS_POINTS * ops.length;
  S.insight += Math.max(0, OPS_POINTS * (handedOps.length - handedReal.length));
  S.lessons.push({ period: S.sprint,
    title: tr('Projekt, nebo provoz?'),
    rating: handedOps.length === ops.length && !handedReal.length ? 'best' : handedOps.length && handedOps.length >= handedReal.length ? 'ok' : 'bad',
    choice: `${tr('provozu předáno {n} z {all} rutinních úkolů', { n: handedOps.length, all: ops.length })}${doneOps.length ? ` · ${tr('v projektu se dělalo: {list}', { list: doneOps.map(b => b.name).join(', ') })}` : ''}${handedReal.length ? ` · ${tr('omylem předáno: {list}', { list: handedReal.map(b => b.name).join(', ') })}` : ''}`,
    lesson: tr('Projekt je dočasné úsilí s jedinečným výsledkem. Opakovanou rutinu (reporty, podpora, údržba) má dělat linie – když se řídí jako projekt, jen spotřebovává kapacitu a nic nového nevznikne.'),
  });
}

// Rok poté (6): co z projektu po roce zbylo – kvalita, předání, znalosti, lidé a podpora stakeholderů.
function computeEpilog() {
  const t = S.sc.terms;
  const cards = [];
  const add = (icon, title, text, pts) => cards.push({ icon, title, text, pts });
  const q = S.metrics.kvalita;
  if (q >= 60) add('📈', tr('Stabilní provoz'), tr('{product} běží spolehlivě a provoz hlásí jen drobnosti.', { product: t.product }), 15);
  else if (q >= 40) add('🩹', tr('Občasné výpadky'), tr('{product} funguje, ale každý měsíc se něco opravuje.', { product: t.product }), 0);
  else add('🚨', tr('Série incidentů'), tr('{product} padá a opravy stojí víc, než projekt ušetřil.', { product: t.product }), -20);

  const ho = [...S.backlog, ...S.handedOver].find(b => b.handover);
  if (ho) {
    if (ho.done) add('📦', tr('Předáno do provozu'), tr('Provoz převzal dokumentaci a proškolené lidi. Projektový tým se může věnovat dalšímu projektu.'), 15);
    else add('📭', tr('Předání bez předání'), tr('Projekt skončil, ale provoz nedostal dokumentaci ani školení. Projektový tým je další rok „na telefonu“.'), -15);
  }

  const areas = Object.keys(S.sc.areas || {});
  const none = areas.filter(a => !knowers(a).length);
  const single = areas.filter(a => knowers(a).length === 1);
  if (none.length) add('🕳️', tr('Nikdo tomu nerozumí'), tr('Po roce už nikdo nerozumí: {areas}. Každá změna je dobrodružství.', { areas: none.map(areaLabel).join(', ') }), -15);
  else if (single.length) add('🏝️', tr('Úzká hrdla'), single.map(a => tr('{area} umí jen {name}', { area: areaLabel(a), name: knowers(a)[0].name })).join(', ') + tr('. Když odejdou, je problém.'), -5 * Math.min(3, single.length));
  else if (areas.length) add('🧠', tr('Znalosti zůstaly v týmu'), tr('Každou část řešení umí aspoň dva lidé.'), 15);

  const team = present();
  const avgFatigue = team.length ? sum(team, p => p.fatigue) / team.length : 100;
  if (S.metrics.moralka < 35 || avgFatigue >= FATIGUE.warn) add('🚪', tr('Tým se rozešel'), tr('Unavení lidé po projektu odešli – i s tím, co věděli.'), -15);
  else if (S.metrics.moralka >= 60) add('🤝', tr('Tým zůstal'), tr('Lidé chtějí na řešení dál pracovat a rozvíjet ho.'), 10);

  const opsInProject = S.opsOverhead + S.backlog.filter(b => b.ops && b.done).length;
  if (opsInProject) add('⚙️', tr('Provoz v převleku za projekt'), tr('Rutina, která se řídila jako projekt, zůstala bez vlastníka v linii. Po skončení projektu ji nikdo nedělá.'), -10);
  else add('⚙️', tr('Jasná hranice projektu'), tr('Rutinu od začátku dělala linie – po projektu se nic nerozpadlo.'), 5);

  const min = stakeMin();
  if (min !== null) {
    const [id] = Object.entries(S.stake).sort((a, b) => a[1] - b[1])[0];
    const s = stakeholderById(id);
    if (min < 30) add('😠', tr('Ztracená podpora'), `${s.name} ${s.epilogBad}`, -15);
    else if (min >= 55) add('🌟', tr('Podpora všech stran'), tr('Všichni stakeholdeři řešení po roce aktivně používají a podporují.'), 10);
  }

  if (S.aftermath.length) add('⏳', tr('Odložené problémy'), tr('Vrátilo se {n} dříve odložených problémů.', { n: S.aftermath.length }), -5 * S.aftermath.length);

  const months = ['Za měsíc', 'Za 2 měsíce', 'Za 3 měsíce', 'Za 5 měsíců', 'Za 7 měsíců', 'Za 9 měsíců', 'Za rok'].map(m => tr(m));
  cards.forEach((c, i) => { c.when = months[Math.round(i * (months.length - 1) / Math.max(1, cards.length - 1))]; });
  S.epilog = { cards, sustain: clamp(50 + sum(cards, c => c.pts)) };
}

// Uzavře projekt jednou: dozvuky, vyhodnocení provozu a rok poté.
function closeProject() {
  if (S.closed) return;
  S.closed = true;
  if (!S.failed) applyAftermath();
  if (!isInsane()) return;
  evaluateOps();
  if (!S.failed) computeEpilog();
}

// ---------- Rozehraná hra ----------
// Stav hry se ukládá po každém kroku, takže zavřená karta nebo obnovení stránky o hru nepřipraví.
// Scénář se ukládá jen jako id (obsahuje funkce), ostatní stav je čistě datový.

const SAVE_KEY = 'projektova-alchymie-rozehrana';
const SAVE_VERSION = 1;

function saveGame() {
  // Úvod a zadání projektu nic nepřepisují – rozehraná hra zůstane, dokud nezačne jiná.
  if (!S.sc || S.screen === 'brief') return;
  if (S.screen === 'end') { clearSave(); return; }
  const { sc, modal, ...rest } = S;
  try { localStorage.setItem(SAVE_KEY, JSON.stringify({ v: SAVE_VERSION, lang: LANG, sc: sc.id, at: Date.now(), S: rest })); } catch { /* bez úložiště se hra neuloží */ }
}

function loadSave() {
  try {
    const d = JSON.parse(localStorage.getItem(SAVE_KEY));
    const sc = d && d.v === SAVE_VERSION && SCENARIOS.find(x => x.id === d.sc);
    return sc ? { ...d, sc } : null;
  } catch { return null; }
}

function clearSave() {
  try { localStorage.removeItem(SAVE_KEY); } catch { /* nic */ }
}

function resumeCard() {
  const d = loadSave();
  if (!d) return '';
  const st = d.S;
  const pd = PERIODS[APPROACHES[st.approach].period];
  const where = ['sort', 'toolbox', 'diagnose', 'kickoff'].includes(st.screen) ? tr('příprava projektu')
    : st.screen === 'epilog' ? tr('rok poté') : tr('{nom} {n} z {all}', { nom: pd.nom, n: st.sprint, all: scPeriods(d.sc) });
  const lv = { hard: `${ic('narocna')} ${tr('náročná úroveň')}`, insane: `${ic('velmiobtizna')} ${tr('velmi obtížná úroveň')}` }[d.sc.level] || `${ic('zakladni')} ${tr('základní úroveň')}`;
  const when = new Date(d.at).toLocaleString(LANG === 'cs' ? 'cs-CZ' : 'en-US', { day: 'numeric', month: 'numeric', hour: '2-digit', minute: '2-digit' });
  return `
    <div class="card resume-card">
      <span class="pr-icon">${d.sc.icon}</span>
      <div class="resume-main"><b>${tr('Rozehraná hra: {name}', { name: d.sc.name })}</b><small>${lv} · ${where} · ${tr('uloženo {when}', { when })}</small></div>
      <div class="resume-btns">
        <button class="btn primary" data-action="resume">${tr('Pokračovat')} ${GO}</button>
        <button class="btn ghost" data-action="discardSave">${tr('Zahodit')}</button>
      </div>
    </div>`;
}

// ---------- Akce ----------

const ACTIONS = {
  askReset() { S.confirmReset = true; S.resetDone = false; },
  cancelReset() { S.confirmReset = false; },
  install() {
    const p = installPrompt;
    if (!p) return;
    installPrompt = null;
    p.prompt();
    p.userChoice.finally(() => render());
  },
  resetProgress() {
    for (const k of progressKeys()) { try { localStorage.removeItem(k); } catch { /* nic */ } }
    S.confirmReset = false;
    S.resetDone = true;
  },

  pickScenario({ id }) {
    const sc = SCENARIOS.find(x => x.id === id);
    if (!levelUnlocked(sc.level)) return;
    startScenario(id);
  },

  start() { S.screen = S.sc.takeover ? 'diagnose' : 'sort'; },

  diagPick({ id }) {
    if (S.diag.result) return;
    const p = S.diag.picks;
    S.diag.picks = p.includes(id) ? p.filter(x => x !== id) : [...p, id];
  },

  diagEval() {
    if (!S.diag.result && S.diag.picks.length) evaluateDiagnosis();
  },

  sortPick({ id, val }) { if (!S.sortResult) S.sortAnswers[id] = val; },

  sortEval() {
    let correct = 0;
    for (const w of S.sc.workstreams) {
      S.insightMax += 5;
      if (S.sortAnswers[w.id] === w.answer) { correct++; S.insight += 5; }
    }
    const total = S.sc.workstreams.length;
    const wrong = total - correct;
    // Rutina řízená jako projekt ukrajuje kapacitu po celý projekt; projektová práce odložená do provozu propadne.
    const wrongWs = S.sc.workstreams.filter(w => S.sortAnswers[w.id] !== w.answer);
    S.opsOverhead = wrongWs.filter(w => w.answer === 'ops').length;
    const toOps = wrongWs.filter(w => S.sortAnswers[w.id] === 'ops').length;
    const deltas = applyEffects(addEffects(
      { kvalita: -3 * (wrong - S.opsOverhead - toOps), harmonogram: -2 * (wrong - S.opsOverhead - toOps) },
      { kvalita: -4 * toOps, harmonogram: -3 * toOps },
    ));
    S.sortResult = { correct, wrong, deltas, opsOverhead: S.opsOverhead };
    const hasOps = S.sc.workstreams.some(w => w.answer === 'ops');
    S.lessons.push({ period: S.sprint,
      title: tr('Rozdělení práce'),
      rating: wrong === 0 ? 'best' : wrong <= 2 ? 'ok' : 'bad',
      choice: `${tr('{n} z {all} oblastí správně', { n: correct, all: total })} · ${APPROACHES[AP()].label}${hints() || !wrong ? '' : ` · ${tr('chybně: {list}', { list: wrongWs.map(w => w.name).join(', ') })}`}`,
      lesson: tr('Jasné a stabilní požadavky → prediktivně. Nejistota a potřeba zpětné vazby → agilně. Hybrid jen tam, kde projekt obsahuje obojí.')
        + (hasOps ? ' ' + tr('A opakovaná rutina není projekt vůbec – patří do provozu.') : ''),
    });
  },

  toToolbox() { S.screen = 'toolbox'; },

  togglePractice({ id }) {
    if (S.mixResult) return;
    S.mix = has(id) ? S.mix.filter(x => x !== id) : [...S.mix, id];
  },

  confirmMix() {
    if (S.mixResult) return;
    evaluateMix();
  },

  toKickoff() {
    if (checkFail()) return;
    S.screen = 'kickoff';
  },

  toPlan() {
    if (isPhased()) initGantt();
    S.screen = 'plan';
  },

  toggle({ id }) {
    const idx = S.selected.indexOf(id);
    if (idx >= 0) S.selected.splice(idx, 1);
    else if (!itemLock(S.backlog.find(b => b.id === id))) S.selected.push(id);
  },

  handover({ id }) {
    const it = S.backlog.find(b => b.id === id);
    if (!isInsane() || !it || it.done) return;
    S.backlog = S.backlog.filter(b => b !== it);
    S.selected = S.selected.filter(x => x !== id);
    it.handedAt = S.sprint;
    S.handedOver.push(it);
    // Skutečnou projektovou práci provoz neudělá – její vlastník to nese těžce.
    it.stakeHit = !it.ops && it.owner ? applyStake({ [it.owner]: -6 })[it.owner] || 0 : 0;
  },

  // Předání jde vzít zpět jen během plánování, ve kterém se stalo – po spuštění sprintu už práci převzal provoz.
  unhandover({ id }) {
    const it = S.handedOver.find(b => b.id === id);
    if (!it || S.screen !== 'plan' || it.handedAt !== S.sprint) return;
    S.handedOver = S.handedOver.filter(b => b !== it);
    if (it.stakeHit && it.owner) applyStake({ [it.owner]: -it.stakeHit });
    delete it.handedAt;
    delete it.stakeHit;
    S.backlog.push(it);
  },

  split({ id }) {
    const it = S.backlog.find(b => b.id === id);
    if (it && canSplit(it)) splitItem(it);
  },

  experiment({ id }) {
    const it = S.backlog.find(b => b.id === id);
    if (!has('lean') || !it || valueKnown(it) || S.experiments >= expPerSprint()) return;
    S.experiments++;
    S.expTotal = (S.expTotal || 0) + 1;
    S.verified.push(id);
  },

  ganttStart({ task, day }) { S.gantt.starts[task] = +day; },

  ganttDep({ task, dep }) {
    const list = S.gantt.deps[task];
    S.gantt.deps[task] = list.includes(dep) ? list.filter(d => d !== dep) : [...list, dep];
  },

  ganttAuto() {
    if (!hasPlanning()) return;
    const ph = phase();
    const tasks = phaseTasks();
    const es = earliestStarts(tasks, S.gantt.deps);
    for (const t of tasks) S.gantt.starts[t.id] = Math.min(es[t.id], ph.days + GANTT_EXTRA_DAYS - t.days + 1);
  },

  startPhase() {
    const ev = evaluateGantt();
    const ph = phase();
    const conflicts = ev.trueConflicts.length + ev.holdConflicts.length;
    const rating = !conflicts && !ev.overDays && !ev.missed.length && ev.finish <= ph.days ? 'best'
      : conflicts <= 1 && ev.overDays <= 1 && ev.finish <= ph.days + 1 ? 'ok' : 'bad';
    recordDecision(tr('Gantt etapy {n}: {name}', { n: S.sprint, name: ph.name }),
      { rating, text: tr('plán do dne {finish} z {days}, konflikty {conflicts}, přetížení {over}', { finish: ev.finish, days: ph.days, conflicts, over: days(ev.overDays) }) }, GANTT_LESSON);
    S.phaseRun = { plan: ev, tasks: phaseTasks(), starts: { ...S.gantt.starts }, deps: JSON.parse(JSON.stringify(S.gantt.deps)) };
    S.current = { event: S.events[S.sprint - 1], result: null, isGate: false };
    S.screen = 'event';
  },

  startSprint() {
    runSprint();
    S.current = { event: S.events[S.sprint - 1], result: null, isGate: false };
    S.screen = 'event';
  },

  eventPick({ i }) {
    if (S.current.result) return;
    const ev = S.current.event;
    const choice = ev.choices[+i];
    if (choice.needs && !has(choice.needs)) return;
    const soft = softenEffects(choice.effects, ev.track);
    let effects = soft.effects;
    if (S.current.isGate) effects = addEffects(effects, ...chosenPractices().map(p => p.gateBonus));
    const deltas = applyEffects(effects);
    const stakeDeltas = applyStake(choice.stake);
    const teamNotes = applyTeam(choice.team);
    if (choice.capacityMod) S.capacityMod += choice.capacityMod;
    if (choice.dropScope) S.backlog = S.backlog.filter(b => b.done || b.moscow !== choice.dropScope);
    const added = addItems(choice.addItems);
    let delay = 0;
    if (choice.delay) {
      // Riziková rezerva zmírní i zpoždění etapy.
      delay = has('risk') ? Math.round(choice.delay * 0.6) : choice.delay;
      if (delay < choice.delay && !soft.by.some(p => p.id === 'risk')) soft.by.push(practiceById('risk'));
      S.phaseDelay += delay;
    }
    for (const id of choice.verify || []) if (!S.verified.includes(id)) S.verified.push(id);
    recordDecision(ev.title, choice, ev.lesson);
    if (choice.later) scheduleFollowup(choice, ev);
    if (ev.echo) S.echoes[ev.good ? 'good' : 'bad']++;
    const reveals = [
      ...(ev.echo ? revealPatterns(ev.good ? 'echo-good' : 'echo-bad') : []),
      ...(soft.by.some(p => p.id === 'risk') ? revealPatterns('soften') : []),
      ...(S.current.isGate ? revealPatterns('gate') : []),
    ];
    S.current.result = { i: +i, deltas, stakeDeltas, teamNotes, softenedBy: soft.by, added, delay, later: !!choice.later, reveals };
  },

  eventNext() {
    if (checkFail()) return;
    if (S.current.isGate) {
      S.gateDone = true;
      if (pendingShiftIdx() >= 0) {
        applyShift();
        S.screen = 'shift';
        return;
      }
      nextSprint();
      return;
    }
    if (isPhased()) {
      finalizePhase();
      S.review.reveals = [...(S.sprint === 1 ? revealPatterns('m1') : []), ...revealPatterns('sprint')];
      S.screen = 'review';
      return;
    }
    const milestone = checkMilestone();
    S.review.milestone = milestone;
    S.review.reveals = [
      ...(milestone && milestone.kind === 'dependency' ? revealPatterns('m1') : []),
      ...revealPatterns('sprint'),
    ];
    S.screen = 'review';
  },

  reviewNext() {
    if (checkFail()) return;
    if (S.sprint >= periods()) {
      closeProject();
      S.screen = S.epilog ? 'epilog' : 'end';
      return;
    }
    if (S.sprint === gateAfter() && !S.gateDone) {
      S.current = { event: S.gate, result: null, isGate: true };
      S.screen = 'event';
      return;
    }
    if (pendingShiftIdx() >= 0) {
      applyShift();
      S.screen = 'shift';
      return;
    }
    nextSprint();
  },

  epilogNext() { S.screen = 'end'; },

  reshapeToggle({ id }) {
    if (S.shiftResult) return;
    const r = S.reshape;
    if (r.mix.includes(id)) r.mix = r.mix.filter(x => x !== id);
    else if (r.original.includes(id) || reshapeAdds().length < maxShiftAdds()) r.mix = [...r.mix, id];
  },

  confirmShift() {
    if (S.shiftResult) return;
    confirmReshape();
  },

  shiftNext() {
    if (checkFail()) return;
    nextSprint();
  },

  glossary() { S.modal = S.modal === 'glossary' ? null : 'glossary'; },
  atlas() { S.modal = S.modal === 'atlas' ? null : 'atlas'; },
  career() { S.modal = S.modal === 'career' ? null : 'career'; },
  lang({ val }) { setLanguage(val); },
  closeModal() { S.modal = null; },
  replay() { startScenario(S.sc.id); },
  restart() { newGame(); },
  resume() {
    const d = loadSave();
    if (!d) return;
    S = { ...d.S, sc: d.sc, modal: null };
    // Hra rozehraná v jiném jazyce: texty uložené ve stavu se převedou do aktuálního jazyka.
    try { relocalizeState(S, d.lang || 'cs', d.sc); } catch (err) { console.error('Převod jazyka rozehrané hry selhal', err); }
    try { render(); } catch (err) { console.error('Uloženou hru nelze obnovit', err); clearSave(); newGame(); }
  },
  discardSave() { clearSave(); },
};

function nextSprint() {
  S.sprint++;
  S.reportHistory.push({ ...S.metrics });
  S.selected = [];
  S.experiments = 0;
  if (isPhased()) initGantt();
  S.screen = 'plan';
}

document.addEventListener('click', e => {
  const el = e.target.closest('[data-action]');
  if (!el || el.disabled) return;
  // Klik dovnitř okna ho nemá zavřít, jen klik na pozadí.
  if (el.classList.contains('modal-back') && e.target !== el) return;
  const fn = ACTIONS[el.dataset.action];
  if (!fn) return;
  const prevScreen = S.screen;
  fn(el.dataset);
  render();
  if (S.screen !== prevScreen) window.scrollTo({ top: 0, behavior: 'smooth' });
});

document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && S.modal) { S.modal = null; render(); }
});

// ---------- Vykreslování ----------

function render() {
  const screens = { intro, brief, sort, toolbox, kickoff, end, event, shift, diagnose, epilog,
    plan: () => (isPhased() ? ganttPlan() : plan()),
    review: () => (isPhased() ? phaseReview() : review()) };
  const showHud = !['intro', 'brief', 'end', 'epilog'].includes(S.screen);
  app.innerHTML = `
    ${header()}
    ${showHud ? hud() : ''}
    <main class="screen screen-${S.screen}">${screens[S.screen]()}</main>
    ${S.modal === 'glossary' ? glossaryModal() : ''}
    ${S.modal === 'atlas' ? atlasModal() : ''}
    ${S.modal === 'career' ? careerModal() : ''}
  `;
  animateHud();
  saveGame();
}

function header() {
  return `
    <header class="topbar">
      <div class="brand"><span class="logo">${S.sc ? S.sc.icon : ic('logo')}</span> ${tr('Projektová alchymie')}
        <small>${S.sc ? S.sc.name : tr('namíchej správné řízení pro každý projekt')}</small></div>
      <div class="top-btns">
        <button class="btn ghost" data-action="career">${ic('medaile')} ${tr('Kariéra')}</button>
        <button class="btn ghost" data-action="atlas">${ic('mapa')} ${tr('Atlas')}</button>
        <button class="btn ghost" data-action="glossary">${ic('kniha')} ${tr('Slovníček')}</button>
        <button class="btn ghost lang-btn" data-action="lang" data-val="${LANG === 'cs' ? 'en' : 'cs'}" lang="${LANG === 'cs' ? 'en' : 'cs'}" title="${LANG === 'cs' ? 'English' : 'Čeština'}">${LANG === 'cs' ? 'EN' : 'CS'}</button>
      </div>
    </header>`;
}

function meterClass(v) { return v < 35 ? 'low' : v < 60 ? 'mid' : 'high'; }

// Mlha reportingu: bez dashboardu nebo EVM vidíš stav o období zpožděný a jen v rozmezí.
const round5 = v => Math.round(v / 5) * 5;
const fogRange = v => [Math.max(0, round5(v) - 5), Math.min(100, round5(v) + 5)];

function hud() {
  const fog = fogged();
  const h = S.reportHistory;
  const shown = fog ? h[Math.max(0, h.length - 2)] : S.metrics;
  const meters = METRICS.map(m => {
    const v = shown[m.id];
    const [lo, hi] = fogRange(v);
    return `
      <div class="meter ${meterClass(v)} ${fog ? 'fog' : ''}" data-m="${m.id}" data-v="${fog ? hi : v}" title="${fog ? tr('{label}: odhad {lo}–{hi}, stav k minulému období', { label: m.label, lo, hi }) : `${m.label}: ${v} / 100`}">
        <div class="meter-head"><span>${m.icon} ${m.label}</span><b ${fog ? '' : 'data-count'}>${fog ? `${lo}–${hi}` : v}</b></div>
        <div class="bar">${fog ? `<i style="width:${hi}%"></i>` : `<i style="width:${v}%"></i>`}</div>
      </div>`;
  }).join('');
  const stakes = Object.keys(S.stake).length ? `
    <div class="stake-row" aria-label="${tr('Stakeholdeři')}">
      ${Object.entries(S.stake).map(([id, v]) => {
        const s = stakeholderById(id);
        return `<div class="stake ${meterClass(v)}" ${fog ? '' : `data-s="${id}" data-v="${v}"`} title="${s.name}: ${s.wants}">${mono(s, stakeIdx(id))}<span><b>${s.name}</b><small>${s.wants}</small></span><span class="mood">${fog ? moodIcon(v) : `${moodIcon(v)} <span data-count>${v}</span>`}</span></div>`;
      }).join('')}
    </div>` : '';
  return `
    <section class="hud ${fog ? 'fogged' : ''}" aria-label="${tr('Stav projektu')}">${meters}</section>
    ${fog ? '<p class="fog-note">' + ic('mlha') + ' ' + tr('Bez dashboardu nebo EVM vidíš stav jen nahrubo a s jednoperiodovým zpožděním.') + '</p>' : ''}
    ${stakes}`;
}

const moodIcon = v => ic(v < 25 ? 'tvar-zlost' : v < 45 ? 'tvar-obava' : v < 65 ? 'tvar-neutral' : 'tvar-dobre');

function stakeChips(deltas) {
  return Object.entries(deltas || {}).filter(([, v]) => v !== 0).map(([id, v]) => {
    const s = stakeholderById(id);
    return `<span class="chip ${v > 0 ? 'up' : 'down'}">${fogged() ? (v > 0 ? '▲' : '▼') : signed(v)} ${s.name}</span>`;
  }).join('');
}

function deltaChips(deltas) {
  const entries = Object.entries(deltas || {}).filter(([, v]) => v !== 0);
  if (!entries.length) return `<span class="chip neutral">${tr('beze změny metrik')}</span>`;
  // V mlze reportingu je vidět jen směr změny, ne její velikost.
  const fog = S.sc && S.screen !== 'end' && fogged();
  return entries.map(([k, v]) => {
    const m = metricById(k);
    return `<span class="chip ${v > 0 ? 'up' : 'down'}">${fog ? (v > 0 ? '▲' : '▼') : `${v > 0 ? '+' : ''}${v}`} ${m.icon} ${m.label}</span>`;
  }).join('');
}

function contextChips() {
  const chips = visibleContext().map(t => `<span class="ctx ${t === S.sc.hiddenContext ? 'revealed' : ''}">${CONTEXT_TAGS[t].icon} ${CONTEXT_TAGS[t].label}</span>`);
  if (S.sc.hiddenContext && !S.hiddenRevealed) chips.push(`<span class="ctx hidden-ctx" title="${tr('Odhalí se během projektu')}">${ic('otaznik')} ${tr('Skrytý faktor')}</span>`);
  return chips.join('');
}

const approachChip = () => `<span class="ctx approach ${AP()}">${APPROACHES[AP()].icon} ${APPROACHES[AP()].label}</span>`;

// Karta vzorce v řetězci kontext → forma → mechanismus → důsledek.
function patternCard(p, { deltas, story } = {}) {
  return `
    <div class="pattern ${p.type}">
      <div class="pattern-head"><span class="pattern-icon">${p.icon}</span><b>${p.name}</b><span class="ptype">${PATTERN_TYPE[p.type]}</span></div>
      ${story ? `<p class="story">${p.story}</p>` : ''}
      <ol class="kfmd">
        <li><span>${tr('Kontext')}</span>${p.k}</li>
        <li><span>${tr('Forma')}</span>${p.f}</li>
        <li><span>${tr('Mechanismus')}</span>${p.m}</li>
        <li><span>${tr('Důsledek')}</span>${p.d}</li>
      </ol>
      ${deltas && Object.keys(deltas).length ? `<div class="chips">${deltaChips(deltas)}</div>` : ''}
    </div>`;
}

function revealBlock(reveals) {
  // Bez nápověd (velmi obtížná úroveň): vzorce se ukážou až na konci projektu.
  if (!reveals || !reveals.length || !hints()) return '';
  return `
    <div class="reveal">
      <h3>${ic('odemceno')} ${reveals.length > 1 ? tr('Odhaleny vzorce') : tr('Odhalen vzorec')}</h3>
      <p class="hint">${tr('Mechanismus působil od chvíle, kdy jsi zvolil(a) svůj mix praktik. Teď se ukázal jeho důsledek.')}</p>
      ${reveals.map(r => patternCard(r.p, { deltas: r.deltas, story: true })).join('')}
    </div>`;
}

function timeline() {
  if (isPhased()) return phaseTimeline();
  const [top, bottom] = TIMELINE_LABELS[AP()];
  const cells = [];
  for (let s = 1; s <= periods(); s++) {
    const cls = s < S.sprint ? 'past' : s === S.sprint ? 'now' : '';
    cells.push(`<div class="sprint-cell ${cls}">${per().nom} ${s}<small>${tr('týden {a}–{b}', { a: s * 2 - 1, b: s * 2 })}</small></div>`);
  }
  const lateLabel = ' ' + (AP() === 'agile' ? tr('(nesplněno)') : tr('(zpoždění)'));
  const ms = S.sc.milestones.map(m => {
    const st = S.milestones[m.id] || 'pending';
    return `<div class="ms ${st}" style="grid-column:${m.afterSprint}">
      <span class="diamond">◆</span>${m.name}${st === 'late' ? lateLabel : st === 'ok' ? ' ' + ic('fajfka', 'sm') : ''}</div>`;
  }).join('');
  return `
    <section class="timeline" aria-label="${tr('Časová osa projektu')}">
      <div class="track-label">${top[0]} <small>${top[1]}</small></div>
      <div class="track pred">${ms}</div>
      <div class="track-label">${bottom[0]} <small>${bottom[1]}</small></div>
      <div class="track agile">${cells.join('')}</div>
    </section>`;
}

function intro() {
  const atlas = getAtlas();
  const car = careerSummary();
  const unlocked = hardUnlocked();
  const insaneOpen = insaneUnlocked();
  const row = sc => {
    const rec = getRecord(sc.id);
    const stars = getStars(sc.id);
    const locked = !levelUnlocked(sc.level);
    return `
      <button class="project-row ${sc.level || ''} ${locked ? 'locked' : ''}" data-action="pickScenario" data-id="${sc.id}" ${locked ? 'disabled' : ''}>
        <span class="pr-icon">${locked ? ic('zamek') : sc.icon}</span>
        <span class="pr-main"><b>${sc.name}</b><small>${sc.tagline}</small></span>
        <span class="pr-meta">${locked ? tr('Zamčeno') : stars !== null ? `${starRow(stars, 'sm')} <small>${tr('{n} b.', { n: rec })}</small>` : rec ? `${ic('medaile')} ${tr('{n} bodů', { n: rec })}` : tr('Zatím nehráno')}</span>
        <span class="pr-go" aria-hidden="true">${locked ? '' : GO}</span>
      </button>`;
  };
  const steps = [
    ['Rozděl práci', 'Co řídit prediktivně a co agilně? A je to vůbec hybrid?'],
    ['Slož mix praktik', 'Karty se synergiemi, konflikty a omezenou režií.'],
    ['Řiď projekt', 'Sprint po sprintu, nebo etapu po etapě. Plánuj, řeš krize, hlídej milníky.'],
    ['Odhal vzorce', 'Co tvůj mix v projektu doopravdy způsobil – dobré i špatné.'],
  ].map(([a, b]) => [tr(a), tr(b)]);
  return `
    <div class="hero card intro-hero">
      <img class="hero-art" src="img/alchymie.webp?v=3" alt="${tr('Ruda Gantt s deskami s Ganttovým diagramem míchá kotel praktik a Bára Backlogová s tabletem do něj přihazuje lístečky. Z páry stoupá na jedné straně harmonogram s milníky, na druhé šipky iterací a nahoře se spojí do zelené fajfky.')}" width="1536" height="1024">
      <h1>${tr('Projektová alchymie')}</h1>
      <p class="tagline">${tr('Namíchej správné řízení pro každý projekt')}</p>
      <p class="lead">${tr('Některé projekty se dají naplánovat dopředu, jiné se musí objevovat za pochodu a některé kombinují obojí. Univerzální recept neexistuje.')}</p>
    </div>
    ${resumeCard()}
    <h2 class="section-title">${tr('Co tě čeká')}</h2>
    <div class="tile-grid">
      ${steps.map(([t, d], i) => `<div class="tile"><span class="tile-num">${i + 1}</span><b>${t}</b><p>${d}</p></div>`).join('')}
    </div>
    <div class="tile-grid three">
      <div class="tile soft"><b>${ic('kostka')} ${tr('Pokaždé jinak')}</b><p>${tr('Každá hra vylosuje jiné události a odpovědi jsou pokaždé v jiném pořadí.')}</p></div>
      <button class="tile soft tile-btn" data-action="career"><b>${ic('medaile')} ${tr('Kariéra: {rank}', { rank: car.rank })}</b><p>${tr('Celkem {n} ★ z {all} · odznaky {b} z {ball}.', { n: car.total, all: SCENARIOS.length * 3, b: car.badges, ball: BADGES.length })}</p></button>
      <button class="tile soft tile-btn" data-action="atlas"><b>${ic('mapa')} ${tr('Atlas vzorců')}</b><p>${tr('Objeveno {n} z {all} vzorců a antivzorců.', { n: atlas.length, all: PATTERNS.length })}</p></button>
    </div>
    <h2 class="section-title">${tr('Vyber si projekt')}</h2>
    ${levelHead('', ic('zakladni'), tr('Základní úroveň'),
      tr('Pět projektů na seznámení se hrou: tři hybridní, jeden prediktivní a jeden agilní. Ukazatele startují na {start}, na mix praktik máš {budget} bodů režie a projekt končí, až když některý ukazatel klesne na nulu.', { start: START_METRIC, budget: OVERHEAD_BUDGET }))}
    <div class="project-list">${SCENARIOS.filter(sc => !sc.level).map(row).join('')}</div>
    ${levelHead('hard', ic('narocna'), tr('Náročná úroveň'), unlocked
      ? tr('Méně zdrojů, skrytý faktor, změna kontextu uprostřed projektu a rozhodnutí, která se vrací. Ukazatele startují na {start}, na mix praktik máš {budget} bodů režie a projekt končí už při poklesu ukazatele na {fail}.', { start: HARD.startMetric, budget: HARD.budget, fail: HARD.failAt })
      : tr('Odemkne se, až v kterémkoli projektu základní úrovně dosáhneš alespoň {n} bodů. Čeká tě méně zdrojů, skrytý faktor, změna kontextu a rozhodnutí, která se vrací.', { n: HARD_UNLOCK_SCORE }))}
    <div class="project-list">${SCENARIOS.filter(sc => sc.level === 'hard').map(row).join('')}</div>
    ${levelHead('insane', ic('velmiobtizna'), tr('Velmi obtížná úroveň'), insaneOpen
      ? tr('Žádné nápovědy, mlha v reportech, stakeholdeři, kteří chtějí každý něco jiného, konkrétní lidé, kteří se unaví nebo odejdou, rutina převlečená za projekt – a na konci se ukáže, co z projektu zbylo po roce.')
      : tr('Odemkne se, až v kterémkoli projektu náročné úrovně dosáhneš alespoň {n} bodů. Bez nápověd, s mlhou v reportech, se stakeholdery, lidmi a tím, co z projektu zbude po roce.', { n: INSANE_UNLOCK_SCORE }))}
    <div class="project-list">${SCENARIOS.filter(sc => sc.level === 'insane').map(row).join('')}</div>
    ${offlineBox()}
    ${progressReset()}`;
}

// ---------- Hraní bez internetu: instalace jako aplikace, nebo ZIP ke stažení ----------
const OFFLINE_ZIP_URL = 'https://github.com/miroslavkrupa/games-projektova-alchymie/releases/latest';
let installPrompt = null; // nabídka instalace od prohlížeče (Chrome, Edge, Android)
const runsInstalled = () => matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;
const isIos = () => /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

function offlineBox() {
  if (location.protocol === 'file:') return `<div class="offline-box"><p class="hint">${ic('stahnout')} ${tr('Hraješ staženou verzi z počítače. Postup se ukládá jen v tomto prohlížeči.')}</p></div>`;
  if (runsInstalled()) return '';
  const install = installPrompt
    ? `<button class="btn" data-action="install">${ic('stahnout')} ${tr('Nainstalovat aplikaci')}</button>`
    : `<p class="hint">${isIos()
      ? tr('Na iPhonu a iPadu ji nainstaluješ v Safari: Sdílet → Přidat na plochu.')
      : tr('Nainstaluješ ji ikonou instalace v adresním řádku Chromu nebo Edge, v Safari na Macu přes Soubor → Přidat do Docku.')}</p>`;
  return `
    <div class="offline-box">
      <h3>${ic('stahnout')} ${tr('Hraj i bez internetu')}</h3>
      <p class="hint">${tr('Hra se dá nainstalovat jako aplikace a pak běží i offline.')}</p>
      ${install}
      <p class="hint">${tr('Nebo si stáhni <a href="{url}" target="_blank" rel="noopener">ZIP s hrou</a>, rozbal ho a otevři soubor index.html.', { url: OFFLINE_ZIP_URL })}</p>
    </div>`;
}

addEventListener('beforeinstallprompt', e => {
  e.preventDefault();
  installPrompt = e;
  if (S && !S.sc) render();
});
addEventListener('appinstalled', () => { installPrompt = null; if (S && !S.sc) render(); });
// Offline režim: service worker uloží hru do mezipaměti (jen na webu, ne ve stažené verzi ze souboru).
if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
  addEventListener('load', () => navigator.serviceWorker.register(new URL('sw.js', document.baseURI)).catch(err => console.warn('Offline režim není k dispozici', err)));
}

// ---------- Smazání veškerého postupu (rekordy, hvězdy, atlas, rozehraná hra) ----------
const PROGRESS_PREFIXES = [RECORD_KEY, STARS_KEY];
const progressKeys = () => {
  try {
    return Object.keys(localStorage).filter(k => [ATLAS_KEY, SAVE_KEY, HISTORY_KEY, BADGES_KEY].includes(k) || PROGRESS_PREFIXES.some(p => k.startsWith(p)));
  } catch { return []; }
};
function progressReset() {
  if (S.resetDone) return `<div class="reset-box done"><p>${ic('fajfka')} ${tr('Veškerý postup je smazaný. Můžeš začít od začátku.')}</p></div>`;
  if (!progressKeys().length) return '';
  if (S.confirmReset) return `
    <div class="reset-box confirm" role="alertdialog" aria-label="${tr('Potvrzení smazání postupu')}">
      <p>${ic('ok')} <b>${tr('Opravdu smazat veškerý postup?')}</b> ${tr('Zmizí rekordy a hvězdy ve všech projektech, kariéra a odznaky, objevené vzorce v atlasu, rozehraná hra a odemčené úrovně. Vrátit to nejde.')}</p>
      <div class="actions"><button class="btn danger" data-action="resetProgress">${tr('Ano, smazat vše')}</button><button class="btn" data-action="cancelReset">${tr('Zrušit')}</button></div>
    </div>`;
  return `<div class="reset-box"><button class="btn ghost" data-action="askReset">${ic('znovu')} ${tr('Smazat veškerý postup')}</button></div>`;
}

function levelHead(cls, icon, title, text) {
  return `<div class="level-head ${cls}"><h3>${icon} ${title}</h3><p>${text}</p></div>`;
}

function brief() {
  const sc = S.sc;
  return `
    <div class="hero card">
      <div class="hero-emoji">${sc.icon}</div>
      <h1>${sc.name}</h1>
      ${sc.level === 'hard' ? `<p class="hard-badge">${ic('narocna')} ${tr('Náročná úroveň')}</p>` : ''}
      ${sc.level === 'insane' ? `<p class="hard-badge insane">${ic('velmiobtizna')} ${tr('Velmi obtížná úroveň')}</p>` : ''}
      <p class="lead">${sc.intro}</p>
      <p><b>${tr('Co projekt zahrnuje:')}</b> ${sc.scope}</p>
      <p><b>${tr('Kontext projektu:')}</b></p>
      <div class="ctx-row">${sc.takeover ? approachChip() : ''}${contextChips()}</div>
      ${sc.stakeholders ? `<p><b>${tr('Stakeholdeři:')}</b></p><ul class="people-list">${sc.stakeholders.filter(x => !x.joins).map(x => `<li>${mono(x, stakeIdx(x.id), 'sm')} <b>${x.name}</b> – ${x.wants}</li>`).join('')}</ul>` : ''}
      ${S.team.length ? `<p><b>${tr('Tým:')}</b></p><ul class="people-list">${S.team.map((p, i) => `<li>${mono(p, i, 'sm')} <b>${p.name}</b> – ${p.role} <span class="knows">${p.knows.map(areaLabel).join(' · ')}</span></li>`).join('')}</ul>` : ''}
      <p><b>${tr('Cíle projektu:')}</b></p>
      ${starGoals(null)}
      <p class="hint">${sc.takeover ? tr('Projekt přebíráš rozjetý. Nejdřív zjisti, co se v něm děje, pak zasáhni.') : tr('Jak projekt řídit, je na tobě – přijdeš na to v první fázi.')} ${failAt() ? tr('Sleduj pět ukazatelů projektu; když některý spadne na {n}, projekt končí.', { n: failAt() }) : tr('Sleduj pět ukazatelů projektu; když některý spadne na nulu, projekt končí.')}</p>
      <div class="actions">
        <button class="btn primary big" data-action="start">${sc.takeover ? tr('Začít diagnózou') : tr('Převzít projekt')} ${GO}</button>
        <button class="btn ghost" data-action="restart">← ${tr('Jiný projekt')}</button>
      </div>
    </div>`;
}

function approachReveal() {
  const sc = S.sc;
  const a = APPROACHES[AP()];
  const body = AP() === 'hybrid' ? `
      <p>${tr('V jednom projektu se potkávají prvky, které sedí tradičnímu, i prvky, které sedí agilnímu přístupu. Proto potřebuje <b>hybridní řízení</b>: nejde o dva samostatné projekty s různými metodikami (to by byl program), ale o kombinaci prvků obou přístupů v jednom projektu.')}</p>
      <div class="two-col">
        <div class="mini pred"><h3>${ic('pred')} ${tr('Prvky řízené prediktivně')}</h3><p>${sc.predWorld}</p></div>
        <div class="mini agile"><h3>${ic('agile')} ${tr('Prvky řízené agilně')}</h3><p>${sc.agileWorld}</p></div>
      </div>` : `<p>${sc.approachText}</p>`;
  return `<div class="approach-reveal ${AP()}"><h3>${a.icon} ${tr('Tohle je {label}', { label: a.label.toLowerCase(), art: /^[aeiou]/i.test(a.label) ? 'an' : 'a' })}</h3>${body}</div>`;
}

function sort() {
  const r = S.sortResult;
  const ws = S.sc.workstreams;
  const allDone = ws.every(w => S.sortAnswers[w.id]);
  // Velmi obtížná úroveň: třetí možnost – tohle vůbec není projekt, ale provoz.
  const withOps = isInsane();
  const ANSWER = { pred: tr('prediktivně'), agile: tr('agilně'), ops: tr('provoz – není to projekt') };
  const cards = S.sortOrder.map(w => {
    const a = S.sortAnswers[w.id];
    const verdict = r && hints() ? (a === w.answer ? 'correct' : 'wrong') : '';
    return `
      <div class="ws card ${verdict}">
        <div class="ws-head"><b>${w.name}</b></div>
        <div class="ws-btns">
          <button class="btn toggle ${a === 'pred' ? 'on pred' : ''}" data-action="sortPick" data-id="${w.id}" data-val="pred" ${r ? 'disabled' : ''}>${ic('pred')} ${tr('Prediktivně')}</button>
          <button class="btn toggle ${a === 'agile' ? 'on agile' : ''}" data-action="sortPick" data-id="${w.id}" data-val="agile" ${r ? 'disabled' : ''}>${ic('agile')} ${tr('Agilně')}</button>
          ${withOps ? `<button class="btn toggle ${a === 'ops' ? 'on ops' : ''}" data-action="sortPick" data-id="${w.id}" data-val="ops" ${r ? 'disabled' : ''}>${ic('ozubene')} ${tr('Provoz')}</button>` : ''}
        </div>
        ${verdict ? `<p class="why">${verdict === 'correct' ? ic('best') : `${ic('bad')} ${tr('Správně: {answer}.', { answer: ANSWER[w.answer] })}`} ${w.why}</p>` : ''}
      </div>`;
  }).join('');
  return `
    <div class="phase-title"><span class="phase">${tr('Fáze {n} / 3', { n: 1 })}</span><h2>${tr('Rozděl práci')}</h2>
      <p>${withOps ? tr('U každé oblasti projektu rozhodni, zda ji řídit <b>prediktivně</b> (plán předem, vodopád) nebo <b>agilně</b> (iterace, zpětná vazba) – nebo jestli to vůbec není projekt, ale běžný <b>provoz</b>, který patří linii.') : tr('U každé oblasti projektu rozhodni, zda ji řídit <b>prediktivně</b> (plán předem, vodopád) nebo <b>agilně</b> (iterace, zpětná vazba).')}</p>
      ${hints() ? `<p class="hint">${tr('Tip: Jak jasné jsou požadavky? Jak drahá je změna v průběhu? Dá se výsledek dodávat po kouscích? Projekt nemusí být hybridní.')}</p>` : ''}
    </div>
    <div class="ws-grid">${cards}</div>
    ${r && !hints() ? `
      <div class="card result">
        <h3>${tr('Rozdělení je zapsané')}</h3>
        <p>${tr('Jak dobře jsi práci rozdělil(a), se ukáže během projektu a v závěrečném hodnocení.')}</p>
        <div class="chips">${deltaChips(r.deltas)}</div>
        ${approachReveal()}
        <button class="btn primary" data-action="toToolbox">${tr('Pokračovat: mix praktik')} ${GO}</button>
      </div>` : r ? `
      <div class="card result">
        <h3>${tr('Výsledek: {n} z {all} správně', { n: r.correct, all: ws.length })}</h3>
        <p>${r.wrong ? tr('Špatně zvolený přístup se v projektu projeví:') : tr('Skvělé – každá část má přístup, který jí sedí.')}</p>
        <div class="chips">${deltaChips(r.deltas)}</div>
        ${approachReveal()}
        <div class="lesson">${ic('zarovka')} ${tr('<b>Pravidlo palce:</b> Jasné a stabilní požadavky + drahá změna → prediktivně. Nejistota, potřeba zpětné vazby, možnost dodávat po částech → agilně. <b>Hybridní</b> řízení potřebuje jen projekt, který obsahuje obojí.')}</div>
        <button class="btn primary" data-action="toToolbox">${tr('Pokračovat: mix praktik')} ${GO}</button>
      </div>` : `
      <div class="actions"><button class="btn primary" data-action="sortEval" ${allDone ? '' : 'disabled'}>${tr('Vyhodnotit')} (${Object.keys(S.sortAnswers).length}/${ws.length})</button></div>`}
  `;
}

function practiceCard(p) {
  const on = has(p.id);
  const fit = (p.fits || []).some(t => visibleContext().includes(t));
  const pairs = PRACTICE_PAIRS.filter(x => on && (x.a === p.id ? has(x.b) : x.b === p.id && has(x.a)));
  const revealed = !!S.mixResult;
  const trap = revealed && on && isTrap(p) && hints();
  const misfit = revealed && on && isMisfit(p) && hints();
  return `
    <button class="practice ${on ? 'on' : ''} ${trap ? 'trap' : ''} ${misfit ? 'misfit' : ''}" data-action="togglePractice" data-id="${p.id}" ${revealed ? 'disabled' : ''}>
      <span class="pp-head"><span class="pp-icon">${p.icon}</span><b>${p.name}</b>
        <span class="cost" title="${tr('Režie řízení')}">${p.cost ? '●'.repeat(p.cost) : tr('zdarma')}</span></span>
      <span class="pp-desc">${p.desc}</span>
      ${hints() ? `<span class="pp-mech">${ic('ozubene', 'sm')} ${p.mech}</span>` : ''}
      ${fit && hints() ? `<span class="pp-fit">${ic('terc', 'sm')} ${tr('sedí na kontext projektu')}</span>` : ''}
      ${S.sc.takeover && S.sc.takeover.mix.includes(p.id) ? `<span class="pp-orig">${ic('sponka', 'sm')} ${tr('zavedl předchozí PM')}</span>` : ''}
      ${(hints() ? pairs : []).map(x => `<span class="pp-pair ${x.type}">${ic(x.type === 'syn' ? 'jiskra' : 'blesk', 'sm')} ${tr('s')} ${practiceById(x.a === p.id ? x.b : x.a).icon}</span>`).join('')}
      ${trap ? `<span class="pp-trap">${ic('ok', 'sm')} ${tr('Past: lákavá, ale tady škodí')}</span>` : ''}
      ${misfit ? `<span class="pp-trap">${ic('spanek', 'sm')} ${tr('V tomto typu projektu zbytečná režie')}</span>` : ''}
    </button>`;
}

function pairList(pairs) {
  if (!pairs.length) return `<p class="hint">${tr('Zatím žádné synergie ani konflikty.')}</p>`;
  return `<ul class="pairs">${pairs.map(x => `
    <li class="${x.type}">${x.type === 'syn' ? `${ic('jiskra')} ${tr('Synergie')}` : `${ic('blesk')} ${tr('Konflikt')}`}: ${practiceById(x.a).icon} + ${practiceById(x.b).icon} – ${x.text}</li>`).join('')}</ul>`;
}

function toolbox() {
  const r = S.mixResult;
  const cost = r ? S.mixCost : currentMixCost();
  const over = cost - budget();
  const columns = Object.keys(WORLD_LABEL).map(w => `
    <div class="pcol"><h3>${WORLD_LABEL[w]}</h3>
      ${PRACTICES.filter(p => p.world === w).map(practiceCard).join('')}
    </div>`).join('');
  const to = S.sc.takeover;
  const summary = r && !hints() ? `
    <div class="card mix-result">
      <div class="mix-result-head">${cauldron()}<h3>${to ? tr('Zásah je hotový') : tr('Tvůj mix je nastavený')}</h3></div>
      ${to ? `<p>${tr('Zavedeno: {added} · zrušeno: {removed}', { added: r.fresh.map(p => `${p.icon} ${p.name}`).join(', ') || tr('nic'), removed: r.removed.map(id => `${practiceById(id).icon} ${practiceById(id).name}`).join(', ') || tr('nic') })}</p>` : ''}
      <div class="chips">${deltaChips(r.deltas)}</div>
      <p class="hint">${tr('Na velmi obtížné úrovni ti nikdo neřekne, jestli mix sedí. Poznáš to podle toho, jak se bude projekt vyvíjet – a v závěrečném hodnocení.')}</p>
      <button class="btn primary" data-action="toKickoff">${tr('Pokračovat')} ${GO}</button>
    </div>` : r ? `
    <div class="card mix-result">
      <div class="mix-result-head">${cauldron()}<h3>${tr('Tvůj mix je nastavený')}</h3></div>
      <div class="chips">${deltaChips(r.deltas)}</div>
      <div class="two-col">
        <div>
          <h4>${tr('Základy pro {label}', { label: APPROACHES[AP()].label.toLowerCase() })}</h4>
          <ul class="checklist">${r.essentials.map(e => `<li class="${e.ok ? 'ok' : 'ko'}">${okIc(e.ok)} ${e.name}</li>`).join('')}</ul>
        </div>
        <div>
          <h4>${tr('Soulad s kontextem')}</h4>
          ${r.fits.length ? `<ul class="checklist">${r.fits.map(f => `<li class="ok">${ic('terc')} ${f.p.icon} ${f.p.name} → ${CONTEXT_TAGS[f.t].label}</li>`).join('')}</ul>` : `<p class="hint">${tr('Žádná z praktik necílí na kontext projektu.')}</p>`}
        </div>
      </div>
      <h4>${tr('Synergie a konflikty')}</h4>
      ${pairList(r.pairs)}
      ${r.traps.length ? `<p class="warn">${ic('ok')} ${tr('Pasti v mixu: {list}', { list: r.traps.map(p => `${p.icon} ${p.name}`).join(', ') })}</p>` : ''}
      ${r.misfits.length ? `<p class="warn">${ic('spanek')} ${tr('Zbytečná režie pro tento typ projektu: {list}', { list: r.misfits.map(p => `${p.icon} ${p.name}`).join(', ') })}</p>` : ''}
      ${over > 0 ? `<p class="warn">${tr('Režie je {n} bod(y) nad rozpočtem – kapacita týmu klesne o {n} každé období.', { n: over })}</p>` : ''}
      <div class="lesson">${ic('lupa')} ${tr('Co tvůj mix v projektu doopravdy způsobí, se ukáže až za pochodu. Vzorce a antivzorce budeš odhalovat během projektu – každý jako řetězec <b>kontext → forma → mechanismus → důsledek</b>.')}</div>
      <button class="btn primary" data-action="toKickoff">${tr('Pokračovat')} ${GO}</button>
    </div>` : `
    <div class="mix-bar card">
      ${cauldron()}
      <div class="mix-cost">
        <span>${tr('Režie řízení')}</span>
        <b class="${over > 0 ? 'over' : ''}">${cost} / ${budget()}</b>
        <div class="bar cap ${over > 0 ? 'over' : ''}"><i style="width:${Math.min(100, cost / budget() * 100)}%"></i></div>
        ${over > 0 ? `<small class="warn">${tr('kapacita týmu −{n} každé období', { n: over })}</small>` : `<small>${tr('Každý bod nad rozpočet sníží kapacitu týmu.')}</small>`}
      </div>
      <div class="mix-pairs">${hints() ? pairList(activePairs()) : to ? `<p class="hint">${tr('Zrušit praktiku předchozího vedení nic nestojí. Každá nově zavedená praktika stojí −1 {b} a −1 {m} (změna zaběhnutého procesu v krizi). Nově zavedeno: {n}.', { b: ic('rozpocet', 'sm'), m: ic('moralka', 'sm'), n: S.mix.filter(id => !to.mix.includes(id)).length })}</p>` : `<p class="hint">${tr('Synergie a konflikty praktik musíš odhadnout sám/sama.')}</p>`}</div>
      <button class="btn primary big" data-action="confirmMix" ${S.mix.length ? '' : 'disabled'}>${to ? tr('Potvrdit zásah') : tr('Potvrdit mix')} ${GO}</button>
    </div>`;
  return `
    <div class="phase-title"><span class="phase">${tr('Fáze {n} / 3', { n: 2 })}</span><h2>${to ? tr('Zasáhni do mixu praktik') : tr('Slož mix praktik')}</h2>
      ${to ? `<p>${tr('Předchozí vedení řídilo projekt praktikami označenými {icon}. Ponech, co pomáhá, zruš, co škodí, a zaveď, co chybí.', { icon: ic('sponka', 'sm') })}</p>` : ''}
      <p>${tr('Vyber praktiky, kterými budeš projekt řídit. Každá stojí <b>režii řízení</b> (porady, reporty, schvalování) – rozpočet je {n} bodů. Hledej kombinace, které se doplňují a sedí na tento typ projektu.', { n: budget() })}</p>
      <div class="ctx-row"><b>${tr('Projekt:')}</b> ${approachChip()} ${contextChips()}</div>
    </div>
    <div class="pgrid">${columns}</div>
    ${summary}
  `;
}

function choiceCard(item, result, pickAction) {
  const choices = item.choices.map((c, i) => {
    const locked = c.needs && !has(c.needs);
    let cls = locked ? 'locked' : '';
    if (result) cls = i === result.i ? `picked ${hints() ? c.rating : 'neutral'}` : 'dim';
    return `<button class="choice ${cls}" data-action="${pickAction}" data-i="${i}" ${result || locked ? 'disabled' : ''}>
      <span class="choice-letter">${'ABCD'[i]}</span><span>${c.text}
      ${locked ? `<small class="lock-note">${ic('zamek', 'sm')} ${tr('Vyžaduje praktiku: {p}', { p: `${practiceById(c.needs).icon} ${practiceById(c.needs).name}` })}</small>` : ''}</span></button>`;
  }).join('');
  let fb = '';
  if (result) {
    const c = item.choices[result.i];
    const best = item.choices.find(x => x.rating === 'best');
    fb = `
      <div class="feedback ${hints() ? c.rating : 'neutral'}">
        ${hints() ? `<div class="rating">${RATING_LABEL[c.rating]}</div>` : ''}
        <p>${c.feedback}</p>
        ${(result.teamNotes || []).map(n => `<p class="team-note">${n}</p>`).join('')}
        <div class="chips">${deltaChips(result.deltas)}${stakeChips(result.stakeDeltas)}${c.capacityMod ? `<span class="chip down">${tr('{n} SP kapacita {next}', { n: c.capacityMod, next: per().next })}</span>` : ''}${c.dropScope ? `<span class="chip down">${tr('„{label}“ položky odstraněny', { label: MOSCOW[c.dropScope].label })}</span>` : ''}${(result.added || []).map(a => `<span class="chip neutral">${ic('novy', 'sm')} ${a.name}</span>`).join('')}${result.delay ? `<span class="chip down">${ic('hodiny', 'sm')} ${tr('+{d} zpoždění etapy', { d: days(result.delay) })}</span>` : ''}</div>
        ${result.softenedBy && result.softenedBy.length ? `<p class="softened">${ic('stit')} ${tr('Dopad zmírnila praktika: {list}', { list: result.softenedBy.map(p => `${p.icon} ${p.name}`).join(', ') })}</p>` : ''}
        ${c.rating !== 'best' && hints() ? `<p class="best-was">${tr('Nejlepší volba:')} <b>${best.text}</b>${best.needs && !has(best.needs) ? tr(' – ale tvůj mix praktik ji neumožnil.') : ''}</p>` : ''}
        ${result.later && hints() ? `<p class="later">${ic('hodiny')} ${tr('Tohle rozhodnutí bude mít dohru.')}</p>` : ''}
        ${hints() ? `<div class="lesson">${ic('zarovka')} ${item.lesson}</div>` : ''}
      </div>
      ${revealBlock(result.reveals)}`;
  }
  const showTrack = item.track && AP() === 'hybrid';
  return `
    <div class="card decision">
      <div class="decision-head"><h3>${item.title}</h3>
        ${showTrack ? `<span class="tag ${item.track}">${TRACK_LABEL[item.track]}</span>` : ''}
      </div>
      ${item.echo ? `<div class="echo">${ic('hodiny')} ${tr('<b>Následek dřívějšího rozhodnutí</b> ({title}, {period} {n}): „{choice}“', { title: item.fromTitle, period: per().nom.toLowerCase(), n: item.fromSprint, choice: item.fromChoice })}</div>` : ''}
      <p class="situation">${item.text}</p>
      <div class="choices">${choices}</div>
      ${fb}
    </div>`;
}

function kickoffRules() {
  const t = S.sc.terms;
  if (AP() === 'pred' && !isPhased()) {
    return [
      tr('Zadání je <b>pevně dané</b> – {contract}. Každá položka má jasnou hodnotu a priority dává smlouva (MoSCoW).', { contract: t.contract }),
      tr('Na začátku každé etapy vyber z plánu položky do <b>kapacity týmu</b>. Hlídej návaznosti a milníky; milník se splní, když udržíš harmonogram.'),
      tr('Během každé etapy přijde <b>událost</b>. V polovině projektu tě čeká <b>kontrolní bod</b>.'),
    ];
  }
  if (AP() === 'pred') {
    const ph = S.sc.phases;
    return [
      tr('Projekt má {n} etapy různé délky ({days} pracovních dní). Plánuje se <b>po vlnách</b>: budoucí etapy znáš jen nahrubo (délka, odhad práce v MD, milník), nejbližší etapu naplánuješ podrobně v <b>Ganttu</b>.', { n: ph.length, days: ph.map(p => p.days).join(', ') }),
      tr('V Ganttu kliknutím nastavíš začátek každého úkolu a vyznačíš <b>závislosti</b> – po kterých úkolech smí začít. Hlídej, kolik lidí je který den potřeba: tým má omezenou velikost.'),
      tr('<b>Skutečné závislosti</b> se ukážou až během etapy. Když úkol začne dřív, než skončí jeho předchůdce, práce se přeruší a den se dělá znovu. Přetížený tým etapu natáhne.'),
      hasPlanning() ? tr('Tvůj nástroj pro harmonogram umí úkoly jedním kliknutím <b>seřadit co nejdřív podle závislostí</b>.') : ic('ok') + ' ' + tr('Bez praktiky pro harmonogram musíš všechno rozvrhnout ručně.'),
      has('cpm') ? tr('Analýza kritické cesty ukáže <b>kritické úkoly a vůli</b> ostatních.') : tr('Bez analýzy kritické cesty nevidíš, které úkoly nesmí sklouznout.'),
      ph.some(p => p.window)
        ? tr('Etapy jsou <b>výluky</b>: co se ve výluce nestihne, přesune se do další a stojí to {s} i {b}. Rezervu projektu ({buffer}) čerpá jen poslední výluka.', { s: ic('spokojenost', 'sm'), b: ic('rozpocet', 'sm'), buffer: days(S.buffer) })
        : tr('Co se nevejde do délky etapy, ukrojí z <b>rezervy projektu ({buffer})</b>. Když dojde, každý další den stojí {h} i {b}.', { buffer: days(S.buffer), h: ic('harmonogram', 'sm'), b: ic('rozpocet', 'sm') }),
      ...(ph.some(p => typeof p.crew === 'object') ? [tr('Tým má <b>několik profesí</b> (dělníci, svářeči, jeřáb) a každá má vlastní kapacitu – hlídej každou zvlášť.')] : []),
      ...(ph.some(p => p.tasks.some(t => t.holdDay)) ? [tr('Některé úkoly smí začít až v den, kdy přijede <b>inspektor nebo zkušebna {icon}</b>.', { icon: ic('lupa', 'sm') })] : []),
      ...(ph.some(p => p.rough) ? [tr('Odhady budoucích etap <b>nahrubo bývají optimistické</b> – podrobný plán ukáže skutečnou pracnost.')] : []),
      tr('V každé etapě přijde <b>událost</b>; některé volby odemyká jen správná praktika. Po 2. etapě tě čeká <b>kontrolní den</b>.'),
    ];
  }
  if (AP() === 'agile') {
    return [
      tr('Rozsah <b>není pevný</b>. Cílem je co nejvíc <b>skutečné hodnoty pro uživatele</b> – měří se trakce po 2., 4. a 6. sprintu.'),
      tr('Na začátku sprintu vyber z backlogu položky do <b>kapacity týmu</b> (story pointy).'),
      has('lean') ? tr('Hodnota u položek je jen <b>odhad (hypotéza)</b> – skutečnost ukáže až dodání, nebo ji <b>ověříš experimentem {icon}</b> (až {n} za sprint).', { icon: ic('zkumavka', 'sm'), n: expPerSprint() }) : tr('Hodnota u položek je jen <b>odhad (hypotéza)</b> – skutečnost ukáže až dodání.'),
      tr('Dodané funkce mohou odhalit <b>nové podněty od uživatelů</b> – backlog se vyvíjí.'),
      tr('Během každého sprintu přijde <b>událost</b>. V polovině projektu tě čeká <b>demo day</b> pro investory.'),
    ];
  }
  return [
    tr('<b>Prediktivně řízené prvky</b> ({pred}) běží podle plánu. S tvým mixem se milníky splní, pokud udržíš <b>{icon} Harmonogram ≥ {n}</b>.', { pred: t.predShort, icon: ic('harmonogram', 'sm'), n: milestoneThreshold() }),
    tr('<b>Agilně řízené prvky</b>: na začátku každého sprintu vyber z backlogu položky do <b>kapacity týmu</b> (story pointy). Kapacitu ovlivňuje morálka i tvůj mix praktik.'),
    tr('Prioritizuj podle <b>MoSCoW</b>. Všechny <b>Must</b> položky musí být hotové do {launch}.', { launch: t.launch }),
    ...(S.sc.dependency ? [tr('Některé položky na sobě závisí – a {hint} Tady se oba přístupy v jednom projektu potkávají!', { hint: S.sc.dependency.hint })] : [tr('Některé položky na sobě závisí. Integrační milník ověří, že prediktivně i agilně řízené části do sebe zapadají.')]),
    tr('Během každého sprintu přijde <b>událost</b>. Některé volby odemyká jen správná praktika. V polovině projektu tě čeká <b>stage gate</b>.'),
  ];
}

function kickoff() {
  return `
    <div class="phase-title"><span class="phase">${tr('Fáze {n} / 3', { n: 3 })}</span><h2>${tr('Realizace: {n} {unit} do cíle', { n: periods(), unit: periods() <= 4 ? per().few : per().many })}</h2></div>
    ${timeline()}
    <div class="card">
      <h3>${tr('Jak to funguje')}</h3>
      <ul class="rules">
        ${kickoffRules().map(r => `<li>${r}</li>`).join('')}
        <li>${hints() ? tr('Tvůj mix praktik působí celou dobu – a postupně odhalíš, jaké <b>vzorce a antivzorce</b> v projektu vytvořil.') : tr('Tvůj mix praktik působí celou dobu – a až na konci uvidíš, jaké <b>vzorce a antivzorce</b> v projektu vytvořil.')}</li>
        ${isInsane() ? insaneRules() : ''}
        ${isHard() ? `<li class="hard-rule">${ic('narocna')} ${tr('<b>Náročná úroveň:</b> rozpočet režie jen {budget} bodů, ukazatele začínají na {start} a projekt končí už při poklesu na {fail}. Po {n}. {loc} se <b>změní kontext</b> a odhalí se skrytý faktor – pak můžeš přeskládat mix. Některá rozhodnutí se <b>vrátí později</b>.', { budget: budget(), start: HARD.startMetric, fail: HARD.failAt, n: gateAfter(), loc: APPROACHES[AP()].period === 'Etapa' ? tr('etapě') : tr('sprintu') })}</li>` : ''}
      </ul>
      <button class="btn primary" data-action="toPlan">${tr('Na plánování {n}. {gen}', { n: 1, gen: per().gen })} ${GO}</button>
    </div>`;
}

function insaneRules() {
  const sc = S.sc;
  const rules = [
    tr('<b>Bez nápověd:</b> nikdo ti neřekne, jestli byla volba dobrá, jak praktiky působí ani které vzorce v projektu vznikají. Všechno se dozvíš až na konci.'),
    tr('<b>Mlha reportingu:</b> ukazatele vidíš jen v rozmezí a o období zpožděné – pokud v mixu nemáš praktiku, která ukazuje skutečný stav projektu.'),
    tr('<b>Stakeholdeři:</b> {n} strany s různými zájmy. Každá sleduje hlavně svou práci; když některá klesne na {fail}, projekt končí.', { n: Object.keys(S.stake).length, fail: failAt() }),
    tr('<b>Projekt, nebo provoz?</b> Některé položky backlogu jsou rutina, která do projektu nepatří. Tlačítkem {icon} je předáš provozu – ale skutečná projektová práce tam nepatří.', { icon: ic('ozubene', 'sm') }),
    tr('<b>Lidé a znalosti:</b> každý člověk umí jen některé oblasti. Práci, kterou nikdo neumí, dělá tým o polovinu pomaleji. Přetížení lidé vyhoří a odejdou – i se svými znalostmi.'),
    tr('<b>Rok poté:</b> po konci projektu se ukáže, co z něj zbylo: kvalita, předání do provozu, znalosti, lidé a podpora stakeholderů. Započítá se do skóre.'),
  ];
  if (sc.shifts) rules.push(tr('<b>Projekt mění tvář:</b> během projektu se {n}× změní jeho povaha. Pokaždé můžeš přeskládat mix praktik.', { n: sc.shifts.length }));
  if (sc.takeover) rules.push(tr('<b>Převzatý projekt:</b> na dokončení máš jen zbytek projektu – a dědíš to, co předchozí vedení rozbilo.'));
  return `<li class="hard-rule insane-rule">${ic('velmiobtizna')} ${tr('<b>Velmi obtížná úroveň</b> – ukazatele končí už při poklesu na {fail}, rozpočet režie je {budget} bodů.', { fail: failAt(), budget: budget() })}<ol>${rules.map(r => `<li>${r}</li>`).join('')}</ol></li>`;
}

function signed(n) { return n > 0 ? `+${n}` : String(n); }

function days(n) {
  const a = Math.abs(n);
  return `${n} ${plural(a, ['den', 'dny', 'dní'], ['day', 'days'])}`;
}

function itemBadge(it) {
  return `<span class="mos m-${it.moscow}" title="${MOSCOW[it.moscow].title}">${MOSCOW[it.moscow].label}</span>`;
}

function itemValueLabel(it) {
  if (valueKnown(it)) return `${ic('hodnota', 'sm')} ${itemValue(it)}${it.actual !== undefined ? ' ' + ic('fajfka', 'sm') : ''}`;
  return `${ic('hodnota', 'sm')} ~${it.value}`;
}

function plan() {
  const cap = capacity();
  const used = selectedSP();
  const pct = Math.min(100, Math.round(used / cap * 100));
  const over = used > cap;
  const order = { M: 0, S: 1, C: 2, W: 3 };
  const items = S.backlog.slice().sort((a, b) => (a.done - b.done) || (order[a.moscow] - order[b.moscow]));
  const canExperiment = has('lean') && S.experiments < expPerSprint();
  const rows = items.map(it => {
    const lock = itemLock(it);
    const sel = S.selected.includes(it.id);
    const exp = has('lean') && !it.done && !valueKnown(it)
      ? `<button class="exp-btn" data-action="experiment" data-id="${it.id}" ${canExperiment ? '' : 'disabled'} title="${tr('Ověřit skutečnou hodnotu levným experimentem (landing page, rozhovory)')}">${ic('zkumavka', 'sm')} ${tr('ověřit')}</button>` : '';
    const ops = isInsane() && !it.done
      ? `<button class="exp-btn ops-btn" data-action="handover" data-id="${it.id}" title="${tr('Předat liniové organizaci – v projektu se dělat nebude')}">${ic('ozubene', 'sm')} ${tr('do provozu')}</button>` : '';
    const cut = canSplit(it)
      ? `<button class="exp-btn split-btn" data-action="split" data-id="${it.id}" title="${tr('Položka je větší než kapacita týmu – celá se nikdy nedokončí. Rozdělí ji na menší části, které se vejdou.')}">${ic('nuzky', 'sm')} ${tr('rozdělit')}</button>` : '';
    const big = tooBig(it) && !lock ? `<small class="too-big">${tr('Nevejde se do kapacity týmu ({n} SP) – celá se nedokončí.', { n: capacity() })}</small>` : '';
    const sp = itemSP(it);
    const owner = it.owner && S.stake[it.owner] !== undefined ? mono(stakeholderById(it.owner), stakeIdx(it.owner), 'sm') : '';
    const area = it.area && S.sc.areas ? `<small class="area ${knowers(it.area).length ? '' : 'unknown'}">${areaLabel(it.area)}${knowers(it.area).length ? '' : ' – ' + tr('nikdo neumí')}</small>` : '';
    return `
      <div class="bl-row">
        <button class="bl-item ${it.done ? 'done' : ''} ${lock && !it.done ? 'locked' : ''} ${sel ? 'sel' : ''}" data-action="toggle" data-id="${it.id}" ${lock ? 'disabled' : ''} title="${lock || MOSCOW[it.moscow].title}">
          <span class="check">${ic(it.done ? 'best' : sel ? 'box-vybrano' : lock ? 'zamek' : 'box')}</span>
          ${itemBadge(it)}
          <span class="bl-name">${owner ? `<span class="owner" title="${stakeholderById(it.owner).name}">${owner}</span> ` : ''}${it.name}${area}${big}${lock && !it.done ? `<small>${lock}</small>` : ''}</span>
          <span class="sp ${sp > it.sp ? 'over' : ''}">${sp} SP</span>
          <span class="val" title="${tr('Hodnota pro uživatele')}">${itemValueLabel(it)}</span>
        </button>${cut}${exp}${ops}
      </div>`;
  }).join('');
  const handed = S.handedOver.length ? `
        <div class="handed">
          <h4>${ic('ozubene')} ${tr('Předáno provozu')}</h4>
          ${S.handedOver.map(it => `
            <div class="handed-row">
              <span>${itemBadge(it)} ${it.name}${it.moscow === 'M' ? `<small class="warn">${tr('Must – v projektu dodaná nebude')}</small>` : ''}</span>
              ${it.handedAt === S.sprint
                ? `<button class="exp-btn ops-btn" data-action="unhandover" data-id="${it.id}" title="${tr('Vrátit zpět do backlogu')}">${ic('zpet', 'sm')} ${tr('vrátit')}</button>`
                : `<small>${tr('převzal provoz')}</small>`}
            </div>`).join('')}
          <p class="hint">${tr('Vrátit jde jen během plánování, ve kterém položka odešla. Po spuštění {gen} ji převzal provoz.', { gen: per().gen })}</p>
        </div>` : '';
  const mustLeft = mustItems().filter(b => !b.done).length;
  const parts = [
    ['Základ', baseCapacity()],
    ['Morálka', moraleCapacity()],
    ['Mix praktik', practiceCapacity()],
    ['Události', S.capacityMod],
    ['Změna kontextu', S.shiftCapacity],
    ['Odchody z týmu', -S.teamLoss],
    ['Provoz v projektu', -S.opsOverhead],
  ].filter(([, v], i) => i === 0 || v).map(([l, v]) => [tr(l), v]);
  const listTitle = AP() === 'pred' ? tr('Plán prací') : 'Product backlog';
  const hint = AP() === 'agile'
      ? (has('lean') ? tr('Klikni na položky, které tým ve sprintu udělá. {v} ~ je jen odhad hodnoty – skutečnost ukáže dodání nebo experiment {e}.', { v: ic('hodnota', 'sm'), e: ic('zkumavka', 'sm') }) : tr('Klikni na položky, které tým ve sprintu udělá. {v} ~ je jen odhad hodnoty – skutečnost ukáže dodání.', { v: ic('hodnota', 'sm') }))
      : AP() === 'pred' ? tr('Klikni na položky, které tým v této etapě udělá. Pořadí kliknutí = priorita.') : tr('Klikni na položky, které tým v tomto sprintu udělá. Pořadí kliknutí = priorita.');
  const goal = AP() === 'agile'
    ? (() => { const next = S.sc.milestones.find(m => m.afterSprint >= S.sprint); return `<li>${tr('Dodaná hodnota zatím <b>{v}</b>', { v: S.valueDelivered })}${next ? tr(', další cíl: {name} – {target}', { name: next.name, target: next.target }) : ''}.</li>`; })()
    : `<li>${tr('Zbývá dokončit <b>{n}</b> Must položek ({period} {s} z {all}).', { n: mustLeft, period: per().nom.toLowerCase(), s: S.sprint, all: periods() })}</li>`;
  return `
    <div class="phase-title"><span class="phase">${tr('{nom} {n} z {all}', { nom: per().nom, n: S.sprint, all: periods() })}</span><h2>${tr('Plánování {gen}', { gen: per().gen })}</h2></div>
    ${timeline()}
    <div class="plan-grid">
      <div class="card backlog">
        <h3>${listTitle}</h3>
        <p class="hint">${hint}</p>
        ${rows}
        ${handed}
      </div>
      <aside class="card side">
        <h3>${tr('Kapacita týmu')}</h3>
        <div class="cap-num ${over ? 'over' : ''}"><b>${used}</b> / ${cap} SP</div>
        <div class="bar cap ${over ? 'over' : ''}"><i style="width:${pct}%"></i></div>
        ${over ? `<p class="warn">${ic('ok')} ${tr('Přetížení! Tým nestihne vše a morálka i kvalita utrpí.')}</p>` : ''}
        ${has('lean') && AP() !== 'pred' ? `<p class="hint">${ic('zkumavka')} ${tr('Experimenty v tomto sprintu: {n} / {all}', { n: S.experiments, all: expPerSprint() })}</p>` : ''}
        <ul class="facts">
          <li>${tr('Kapacita: {list}.', { list: parts.map(([l, v], i) => `${l} ${i ? signed(v) : v}`).join(', ') })}</li>
          ${goal}
        </ul>
        <button class="btn primary big" data-action="startSprint" ${S.selected.length || !S.backlog.some(b => !itemLock(b)) ? '' : 'disabled'}>${tr('Spustit {acc} {n}', { acc: per().acc, n: S.sprint })} ${GO}</button>
      </aside>
    </div>
    ${teamPanel()}`;
}

const fatigueIcon = f => ic(f < 40 ? 'tvar-dobre' : f < 60 ? 'tvar-neutral' : f < FATIGUE.warn ? 'tvar-unava' : 'tvar-vycerpani');

function teamPanel() {
  if (!S.team.length) return '';
  return `
    <div class="card team">
      <h3>${ic('tym')} ${tr('Tým')}</h3>
      <div class="team-grid">
        ${S.team.map((p, i) => `
          <div class="person ${p.gone ? 'gone' : ''}">
            ${mono(p, i)}
            <span class="p-main"><b>${p.name}</b><small>${p.gone ? tr('odešel{a} z projektu', { a: p.f ? 'a' : '' }) : p.role}</small>
              <span class="knows">${p.knows.map(a => `<span class="${knowers(a).length === 1 && !p.gone ? 'solo' : ''}">${areaLabel(a)}</span>`).join('')}</span></span>
            <span class="p-fatigue" title="${tr('Únava')}">${p.gone ? ic('dvere') : `${fatigueIcon(p.fatigue)}<i class="fbar"><i style="width:${p.fatigue}%"></i></i>`}</span>
          </div>`).join('')}
      </div>
      <p class="hint">${tr('Únava roste prací v oblasti, kterou člověk umí (čím méně lidí ji umí, tím víc), přesčasy a přetížením. Kdo je vyčerpaný, odejde.')}</p>
    </div>`;
}

function event() {
  const c = S.current;
  const gateTitle = AP() === 'agile' ? tr('Investoři rozhodují') : AP() === 'pred' ? tr('Kontrolní den') : tr('Řídicí výbor zasedá');
  return `
    <div class="phase-title"><span class="phase">${c.isGate ? tr('Kontrolní bod') : tr('{nom} {n} z {all} · probíhá', { nom: per().nom, n: S.sprint, all: periods() })}</span>
      <h2>${c.isGate ? gateTitle : c.event.echo ? tr('Vrací se dřívější rozhodnutí…') : tr('Uprostřed {gen} se něco stalo…', { gen: per().gen })}</h2></div>
    ${choiceCard(c.event, c.result, 'eventPick')}
    ${c.result ? `<div class="actions"><button class="btn primary" data-action="eventNext">${c.isGate ? `${tr('Na plánování {n}. {gen}', { n: S.sprint + 1, gen: per().gen })} ${GO}` : `${tr('Na {review}', { review: per().toReview })} ${GO}`}</button></div>` : ''}
  `;
}

function deliveredRow(i) {
  if (i.actual === undefined) return `<li class="ok">${ic('fajfka', 'sm')} ${i.name} <small>${i.sp} SP · ${ic('hodnota', 'sm')} ${i.value}</small></li>`;
  const diff = i.actual - i.value;
  const mood = diff >= 3 ? ic('oslava', 'sm') : diff <= -3 ? ic('tvar-obava', 'sm') : '';
  return `<li class="ok">${ic('fajfka', 'sm')} ${i.name} <small>${i.sp} SP · ${tr('odhad ~{est} → skutečnost <b>{act}</b>', { est: i.value, act: i.actual })} ${mood}</small></li>`;
}

function review() {
  const r = S.review;
  const m = r.milestone;
  const last = S.sprint >= periods();
  const heading = { hybrid: tr('Agilně řízené prvky: co tým dodal'), pred: tr('Co se v etapě dokončilo'), agile: tr('Co tým dodal') }[AP()];
  const msPrefix = { hybrid: `${ic('pred')} ${tr('Prediktivní milník')}`, pred: `${ic('cil')} ${tr('Milník')}`, agile: `${ic('terc')} ${tr('Cíl trakce')}` }[AP()];
  const gateLabel = `${AP() === 'agile' ? tr('Na demo day') : AP() === 'pred' ? tr('Na kontrolní den') : tr('Na stage gate')} ${GO}`;
  return `
    <div class="phase-title"><span class="phase">${tr('{nom} {n} z {all} · konec', { nom: per().nom, n: S.sprint, all: periods() })}</span><h2>${per().review}</h2></div>
    ${timeline()}
    <div class="card">
      <h3>${heading}</h3>
      <p>${tr('Závazek <b>{c} SP</b> při kapacitě <b>{cap} SP</b>', { c: r.committed, cap: r.cap })}${r.experiments ? ` · ${tr('ověřené hypotézy: {n}', { n: r.experiments })}` : ''}.</p>
      <ul class="delivered">
        ${r.delivered.map(deliveredRow).join('')}
        ${r.unfinished.map(i => `<li class="ko">${ic('krizek', 'sm')} ${i.name} <small>${tr('nedokončeno – zpět mezi nedodělané')}</small></li>`).join('')}
      </ul>
      ${r.notes.map(n => `<p>${n}</p>`).join('')}
      <div class="chips">${deltaChips(r.deltas)}${stakeChips(r.stakeDeltas)}</div>
      ${r.ongoing ? `
        <h4>${tr('Průběžný vliv tvého mixu')}</h4>
        ${hints() ? `<p class="hint">${r.ongoing.labels.join(' · ')}</p>` : `<p class="hint">${tr('Odkud se vlivy berou, musíš vyčíst sám/sama.')}</p>`}
        <div class="chips">${deltaChips(r.ongoing.deltas)}</div>` : ''}
      ${(r.teamNotes || []).length ? `<h4>${ic('tym')} ${tr('Tým')}</h4>${r.teamNotes.map(n => `<p class="team-note">${n}</p>`).join('')}` : ''}
      ${(r.signals || []).length ? `<div class="signals">${r.signals.map(n => `<p>${n}</p>`).join('')}</div>` : ''}
    </div>
    ${r.discovered.length ? `
      <div class="card discovered">
        <h3>${ic('novy')} ${tr('Nové podněty od uživatelů')}</h3>
        ${r.discovered.map(d => `<p><b>${d.name}</b> – ${d.why}</p>`).join('')}
        <p class="hint">${tr('Položky přibyly do backlogu.')}</p>
      </div>` : ''}
    ${m ? `
      <div class="card milestone ${m.ok ? 'ok' : 'late'}">
        <h3>${msPrefix}: ${m.name} ${m.ok ? ic('fajfka') : tr('– problém')}</h3>
        <p>${m.text}</p>
        ${Object.keys(m.deltas).length ? `<div class="chips">${deltaChips(m.deltas)}</div>` : ''}
      </div>` : ''}
    ${revealBlock(r.reveals)}
    <div class="actions"><button class="btn primary" data-action="reviewNext">${last ? (isInsane() ? `${tr('Konec projektu – a co dál?')} ${GO}` : `${tr('Vyhodnotit projekt')} ${ic('cil')}`) : S.sprint === gateAfter() && !S.gateDone ? gateLabel : pendingShiftIdx() >= 0 ? `${tr('Něco se mění…')} ${GO}` : `${tr('Na plánování {n}. {gen}', { n: S.sprint + 1, gen: per().gen })} ${GO}`}</button></div>
  `;
}

// ---------- Vykreslení: Gantt a etapy ----------

const roughMD = ph => `~${Math.round((ph.rough ?? phaseMD(ph)) / 5) * 5} ${tr('MD')}`;
const skillLabel = k => (SKILLS[k] || SKILLS.lide);
const crewText = crew => Object.entries(crew).map(([k, n]) => `${n} ${skillLabel(k).label.toLowerCase()}`).join(' · ');

function phaseTimeline() {
  const phases = S.sc.phases;
  const [top, bottom] = TIMELINE_LABELS.pred;
  const cols = phases.map(p => `${p.days}fr`).join(' ');
  const ms = phases.map((p, i) => {
    const st = S.milestones[p.id] || 'pending';
    return `<div class="ms ${st}" style="grid-column:${i + 1}"><span class="diamond">◆</span>${p.milestone.name}${st === 'late' ? ' ' + tr('(zpoždění)') : st === 'ok' ? ' ' + ic('fajfka', 'sm') : ''}</div>`;
  }).join('');
  const cells = phases.map((p, i) => {
    const n = i + 1;
    const res = S.phaseResults[i];
    const cls = n < S.sprint ? 'past' : n === S.sprint ? 'now' : 'future';
    const detail = n < S.sprint && res ? (res.carried ? tr('nestihlo se {n} úkolů', { n: res.carried }) : tr('skutečně {f} z {d} dní', { f: res.finish, d: p.days }))
      : n === S.sprint ? tr('{d} dní · podrobný Gantt', { d: p.days }) : tr('{d} dní · nahrubo {r}', { d: p.days, r: roughMD(p) });
    return `<div class="sprint-cell phase-cell ${cls}" title="${p.goal}">${n}. ${p.name}<small>${detail}</small></div>`;
  }).join('');
  return `
    <section class="timeline" aria-label="${tr('Plán po etapách')}">
      <div class="track-label">${top[0]} <small>${top[1]}</small></div>
      <div class="track pred" style="grid-template-columns:${cols}">${ms}</div>
      <div class="track-label">${bottom[0]} <small>${bottom[1]}</small></div>
      <div class="track agile" style="grid-template-columns:${cols}">${cells}</div>
    </section>`;
}

// Mřížka Ganttu (plánování i plán vs. skutečnost).
function ganttGrid(tasks, gridDays, phaseDays, rowFn, footer) {
  const holds = new Set(tasks.filter(t => t.holdDay).map(t => t.holdDay));
  const head = Array.from({ length: gridDays }, (_, i) => i + 1)
    .map(d => `<div class="g-day ${d > phaseDays ? 'out' : ''} ${d === phaseDays ? 'end' : ''}" ${holds.has(d) ? `title="${tr('Inspekce / zkušebna')}"` : ''}>${holds.has(d) ? ic('lupa', 'sm') : d}</div>`).join('');
  return `
    <div class="gantt-wrap">
      <div class="gantt" style="--days:${gridDays}">
        <div class="g-row g-head"><div class="g-task">${tr('Úkol')}</div><div class="g-deps">${tr('Začíná po')}</div><div class="g-days">${head}</div></div>
        ${tasks.map(rowFn).join('')}
        ${footer || ''}
      </div>
    </div>`;
}

function usageRows(tasks, startOf, gridDays, phaseDays, crew) {
  return Object.entries(crew).map(([k, n]) => {
    const use = usage(tasks, startOf, {}, Object.keys(crew).length > 1 || k !== 'lide' ? k : null);
    const cells = Array.from({ length: gridDays }, (_, i) => {
      const u = use[i + 1] || 0;
      return `<div class="g-use ${u > n ? 'over' : ''} ${i + 1 > phaseDays ? 'out' : ''}">${u || ''}</div>`;
    }).join('');
    const lbl = skillLabel(k);
    return `<div class="g-row g-foot"><div class="g-task"><b>${tr('{label} na den', { label: lbl.label })}</b><small>${tr('k dispozici {n}', { n })}</small></div><div class="g-deps"></div><div class="g-days">${cells}</div></div>`;
  }).join('');
}

function ganttPlan() {
  const ph = phase();
  const tasks = phaseTasks();
  const g = S.gantt;
  const gridDays = ph.days + GANTT_EXTRA_DAYS;
  const ev = evaluateGantt();
  const conflictIds = new Set([...ev.declaredConflicts, ...ev.holdConflicts].map(t => t.id));
  const cp = has('cpm') ? criticalInfo(tasks, g.deps) : null;
  const multi = Object.keys(ev.crew).length > 1;
  const row = t => {
    const s = g.starts[t.id];
    const e = taskEnd(s, t);
    const cells = Array.from({ length: gridDays }, (_, i) => {
      const d = i + 1;
      const inBar = d >= s && d <= e;
      const cls = [inBar ? 'in' : '', inBar && conflictIds.has(t.id) ? 'conflict' : '', inBar && cp && cp.critical.has(t.id) ? 'crit' : '',
        inBar && t.carried ? 'carried' : '', d > ph.days ? 'out' : '', d === ph.days ? 'end' : '', t.holdDay === d ? 'hold' : ''].join(' ');
      return `<button class="g-cell ${cls}" data-action="ganttStart" data-task="${t.id}" data-day="${d}" title="${tr('{id}: začít dnem {d}', { id: t.id, d })}">${inBar && d === s ? t.id : !inBar && t.holdDay === d ? ic('lupa', 'sm') : ''}</button>`;
    }).join('');
    const chips = tasks.filter(o => o.id !== t.id).map(o => `
      <button class="dep ${g.deps[t.id].includes(o.id) ? 'on' : ''}" data-action="ganttDep" data-task="${t.id}" data-dep="${o.id}" title="${tr('{a} smí začít až po skončení {b}', { a: t.id, b: o.id })}">${o.id}</button>`).join('');
    const cpNote = cp ? (cp.critical.has(t.id) ? `<span class="crit-tag">${ic('cil', 'sm')} ${tr('kritická cesta')}</span>` : `<span class="float-tag">${tr('vůle {d}', { d: days(cp.float[t.id]) })}</span>`) : '';
    const sk = skillLabel(taskSkill(t));
    return `
      <div class="g-row ${conflictIds.has(t.id) ? 'has-conflict' : ''}">
        <div class="g-task"><b class="g-id ${t.carried ? 'carried' : ''}">${t.id}</b> ${t.name}
          <small>${days(t.days)} · ${t.people} ${multi ? sk.label.toLowerCase() : ic('tym', 'sm')} · ${taskMD(t)} ${tr('MD')} ${cpNote}</small>
          ${t.holdDay ? `<small class="hold-note">${ic('lupa', 'sm')} ${tr('nejdřív {d}. den', { d: t.holdDay })}</small>` : ''}
          <small class="note">${t.note}</small></div>
        <div class="g-deps">${chips}</div>
        <div class="g-days">${cells}</div>
      </div>`;
  };
  const slack = ph.days - ev.finish;
  const planMD = sum(tasks, taskMD);
  const roughNote = ph.rough && S.sprint > 1 ? `<p class="rough-note">${tr('Odhad nahrubo byl {rough}, podrobný plán má <b>{md} MD</b> ({diff} %). Hrubé odhady bývají optimistické.', { rough: roughMD(ph), md: planMD, diff: `${planMD >= ph.rough ? '+' : ''}${Math.round((planMD / ph.rough - 1) * 100)}` })}</p>` : '';
  const carryNote = S.carryIn.length ? `<p class="warn">${ic('zabrana')} ${tr('Z minulé výluky se přesunulo: {list}.', { list: S.carryIn.map(t => t.name).join(', ') })}</p>` : '';
  return `
    <div class="phase-title"><span class="phase">${tr('{nom} {n} z {all}', { nom: per().nom, n: S.sprint, all: periods() })}</span><h2>${tr('Podrobný plán: {name}', { name: ph.name })}</h2>
      <p>${ph.goal} ${tr('Cíl: <b>{name}</b>.', { name: ph.milestone.name })}${ph.window ? ' ' + tr('Je to <b>výluka</b> – co se nestihne, čeká na další.') : ''}</p></div>
    ${phaseTimeline()}
    <div class="card">
      ${roughNote}${carryNote}
      <div class="gantt-stats">
        <div><span>${ph.window ? tr('Délka výluky') : tr('Délka etapy')}</span><b>${days(ph.days)}</b>${S.phaseDelay ? `<small class="warn">${tr('zdržení {d}', { d: days(S.phaseDelay) })}</small>` : ''}</div>
        <div class="${slack < 0 ? 'bad' : slack === 0 ? 'warn' : 'good'}"><span>${tr('Plán končí')}</span><b>${tr('dnem {d}', { d: ev.finish })}</b><small>${slack >= 0 ? tr('vůle {d}', { d: days(slack) }) : tr('přesah {d}', { d: days(-slack) })}</small></div>
        <div><span>${tr('Práce')}</span><b>${planMD} ${tr('MD')}</b><small>${crewText(ev.crew)}</small></div>
        <div class="${conflictIds.size ? 'bad' : 'good'}"><span>${tr('Konflikty')}</span><b>${conflictIds.size}</b><small>${tasks.some(t => t.holdDay) ? tr('závislosti a inspekce') : tr('závislosti')}</small></div>
        <div class="${ev.overDays ? 'bad' : 'good'}"><span>${tr('Přetížení týmu')}</span><b>${days(ev.overDays)}</b></div>
        <div class="${S.buffer < 0 ? 'bad' : S.buffer === 0 ? 'warn' : ''}"><span>${tr('Rezerva projektu')}</span><b>${days(S.buffer)}</b></div>
      </div>
      <p class="hint">${tr(multi ? 'Klikni v řádku úkolu na den, kdy má začít. Ve sloupci <b>Začíná po</b> vyznač, po kterých úkolech smí začít. Dole vidíš, kolik lidí každé profese je který den potřeba. Skutečné závislosti se ukážou až během {gen} – odvoď je z popisu práce.' : 'Klikni v řádku úkolu na den, kdy má začít. Ve sloupci <b>Začíná po</b> vyznač, po kterých úkolech smí začít. Dole vidíš, kolik lidí je který den potřeba. Skutečné závislosti se ukážou až během {gen} – odvoď je z popisu práce.', { gen: per().gen })}</p>
      ${ganttGrid(tasks, gridDays, ph.days, row, usageRows(tasks, t => g.starts[t.id], gridDays, ph.days, ev.crew))}
      <div class="actions">
        ${hasPlanning() ? `<button class="btn" data-action="ganttAuto">${tr('Seřadit co nejdřív podle závislostí')}</button>` : `<span class="hint">${tr('S praktikou pro harmonogram by úkoly seřadil nástroj.')}</span>`}
        <button class="btn primary big" data-action="startPhase">${tr('Spustit {acc} {n}', { acc: per().acc, n: S.sprint })} ${GO}</button>
      </div>
    </div>`;
}

function phaseReview() {
  const r = S.review;
  const ph = r.phase;
  const tasks = r.tasks;
  const gridDays = Math.max(ph.days, r.sim.finish, r.plan.finish) + 1;
  const byId = byTaskId(tasks);
  const row = t => {
    const ps = r.starts[t.id];
    const pe = taskEnd(ps, t);
    const a = r.sim.actual[t.id];
    const cells = Array.from({ length: gridDays }, (_, i) => {
      const d = i + 1;
      const cls = [d >= ps && d <= pe ? 'plan' : '', d >= a.start && d <= a.end ? 'act' : '', a.rework && d === a.end ? 'rework' : '',
        d > ph.days ? 'out' : '', d === ph.days ? 'end' : ''].join(' ');
      return `<div class="g-cell ro ${cls}">${d === a.start ? t.id : ''}</div>`;
    }).join('');
    const truth = t.deps.length ? t.deps.join(', ') : '–';
    const waitedHold = t.holdDay && ps < t.holdDay;
    return `
      <div class="g-row">
        <div class="g-task"><b class="g-id ${t.carried ? 'carried' : ''}">${t.id}</b> ${t.name}<small>${a.rework ? `${ic('ok', 'sm')} ${tr('přerušeno, den navíc')}` : waitedHold ? `${ic('lupa', 'sm')} ${tr('čekal na inspekci ({d}. den)', { d: t.holdDay })}` : a.waitedForPeople ? `${ic('tym', 'sm')} ${tr('čekal na volné lidi ({d})', { d: days(a.waitedForPeople) })}` : a.start > ps ? tr('čekal na předchůdce ({d})', { d: days(a.start - ps) }) : `${ic('fajfka', 'sm')} ${tr('podle plánu')}`}</small></div>
        <div class="g-deps"><small>${tr('skutečně po: <b>{list}</b>', { list: truth })}</small></div>
        <div class="g-days">${cells}</div>
      </div>`;
  };
  const causes = [
    ...r.sim.rework.map(t => {
      const pred = t.deps.find(d => r.starts[t.id] <= taskEnd(r.starts[d], byId[d]));
      return `${ic('ok')} ${tr('<b>{a}</b> začal dřív, než skončil <b>{b}</b> – práce se přerušila a den se dělal znovu.', { a: `${t.id} ${t.name}`, b: `${pred} ${byId[pred].name}` })}`;
    }),
    ...r.plan.holdConflicts.map(t => `${ic('lupa')} ${tr('<b>{a}</b> byl naplánovaný před příjezdem inspektora/zkušebny ({d}. den) – musel čekat.', { a: `${t.id} ${t.name}`, d: t.holdDay })}`),
    ...(r.plan.missed.length && !r.sim.rework.length ? [tr('Nevyznačil(a) jsi {n} skutečnou závislost(i), ale plán je náhodou dodržel.', { n: r.plan.missed.length })] : []),
    ...(r.plan.extra.length ? [tr('Zbytečné vazby: {list} – úkoly mohly běžet souběžně.', { list: r.plan.extra.map(([d, t]) => tr('{a} po {b}', { a: t, b: d })).join(', ') })] : []),
    ...(r.sim.waited.length ? [`${ic('tym')} ${tr('Plán počítal s víc lidmi, než tým má ({d} přetížení). Úkoly {list} musely čekat, až se lidé uvolní.', { d: days(r.sim.overDays), list: r.sim.waited.map(t => t.id).join(', ') })}`] : []),
    ...(r.sim.delay ? [`${ic('harmonogram')} ${tr('Zdržení z událostí a okolností: {d}.', { d: days(r.sim.delay) })}`] : []),
    ...(r.carry.length ? [`${ic('zabrana')} ${tr('Ve výluce se nestihlo: {list}. Práce se přesouvá do další výluky.', { list: r.carry.map(t => t.name).join(', ') })}`] : []),
  ];
  const evm = has('evm') ? `<p>${ic('graf-nahoru')} <b>EVM:</b> ${tr('plánovaná práce {p} MD, skutečná {a} MD', { p: r.plannedMD, a: r.actualMD })} · CPI ≈ ${(r.plannedMD / r.actualMD).toFixed(2)} · SPI ≈ ${(Math.min(ph.days, r.plan.finish) / r.sim.finish).toFixed(2)}</p>` : '';
  const last = S.sprint >= periods();
  const msText = r.windowed
    ? (r.late ? tr('Výluka skončila s nedodělky ({n}). Přesouvají se do další výluky.', { n: r.carry.length }) : tr('Výluka skončila podle plánu.'))
    : r.overrun ? (r.buffer >= 0 ? tr('{nom} přetáhla o {d}, zatím to pokryla rezerva projektu.', { nom: per().nom, d: days(r.overrun) }) : tr('{nom} přetáhla o {d} a rezerva projektu nestačila.', { nom: per().nom, d: days(r.overrun) })) : tr('{nom} skončila v plánované délce.', { nom: per().nom });
  return `
    <div class="phase-title"><span class="phase">${tr('{nom} {n} z {all} · konec', { nom: per().nom, n: S.sprint, all: periods() })}</span><h2>${tr('Kontrola: {name}', { name: ph.name })}</h2></div>
    ${phaseTimeline()}
    <div class="card">
      <div class="gantt-stats">
        <div><span>${tr('Plán')}</span><b>${tr('dnem {d}', { d: r.plan.finish })}</b></div>
        <div class="${r.late ? 'bad' : 'good'}"><span>${tr('Skutečnost')}</span><b>${tr('dnem {d}', { d: r.sim.finish })}</b><small>${tr('z {d}', { d: days(ph.days) })}</small></div>
        <div class="${r.buffer < 0 ? 'bad' : r.buffer === 0 ? 'warn' : ''}"><span>${tr('Rezerva projektu')}</span><b>${days(r.buffer)}</b>${!r.windowed && r.overrun ? `<small>${tr('čerpáno {d}', { d: days(r.overrun) })}</small>` : ''}</div>
      </div>
      <p class="hint">${tr('Obrys = tvůj plán, plná barva = skutečnost. Teď vidíš i skutečné závislosti.')}</p>
      ${ganttGrid(tasks, gridDays, ph.days, row)}
      ${causes.length ? `<ul class="causes">${causes.map(c => `<li>${c}</li>`).join('')}</ul>` : `<p class="good-note">${ic('best')} ${tr('Proběhlo přesně podle plánu.')}</p>`}
      ${evm}
      ${r.beyond ? `<p class="warn">${tr('Rezerva projektu je vyčerpaná – {d} navíc stojí harmonogram i peníze.', { d: days(r.beyond) })}</p>` : ''}
      <div class="chips">${deltaChips(r.deltas)}</div>
      ${r.ongoing ? `<h4>${tr('Průběžný vliv tvého mixu')}</h4><p class="hint">${r.ongoing.labels.join(' · ')}</p><div class="chips">${deltaChips(r.ongoing.deltas)}</div>` : ''}
    </div>
    <div class="card milestone ${r.late ? 'late' : 'ok'}">
      <h3>${ic('cil')} ${tr('Milník: {name}', { name: ph.milestone.name })} ${r.late ? tr('– se zpožděním') : ic('fajfka')}</h3>
      <p>${msText}</p>
    </div>
    ${revealBlock(r.reveals)}
    <div class="actions"><button class="btn primary" data-action="reviewNext">${last ? `${tr('Vyhodnotit projekt')} ${ic('cil')}` : S.sprint === gateAfter() && !S.gateDone ? `${tr('Na kontrolní den')} ${GO}` : `${tr('Na plánování {n}. {gen}', { n: S.sprint + 1, gen: per().gen })} ${GO}`}</button></div>
  `;
}

// ---------- Vykreslení: změna kontextu ----------

function shift() {
  const sh = curShift();
  const r = S.reshape;
  const res = S.shiftResult;
  const adds = reshapeAdds();
  const cost = sum(r.mix.map(practiceById), p => p.cost);
  const over = cost - budget();
  const card = p => {
    const on = r.mix.includes(p.id);
    const orig = r.original.includes(p.id);
    const cls = [on ? 'on' : '', on && !orig ? 'added' : '', !on && orig ? 'removed' : ''].join(' ');
    const disabled = res || (!on && !orig && adds.length >= maxShiftAdds());
    return `<button class="reshape-card ${cls}" data-action="reshapeToggle" data-id="${p.id}" ${disabled ? 'disabled' : ''} title="${p.desc}">
      <span>${p.icon}</span><b>${p.name}</b><small>${p.cost ? '●'.repeat(p.cost) : tr('zdarma')}</small>
      ${on && !orig ? `<em>${tr('nově')}</em>` : !on && orig ? `<em>${tr('odebráno')}</em>` : ''}</button>`;
  };
  const cols = Object.keys(WORLD_LABEL).map(w => `
    <div class="pcol"><h3>${WORLD_LABEL[w]}</h3>${PRACTICES.filter(p => p.world === w).map(card).join('')}</div>`).join('');
  const changes = [
    ...(r.devalued.length ? [`${ic('graf-dolu')} ${tr('Ztratily hodnotu: {list}.', { list: r.devalued.map(b => b.name).join(', ') })}`] : []),
    ...(r.added.length ? [`${ic('novy')} ${tr('Přibyla práce: {list}.', { list: r.added.map(b => b.name).join(', ') })}`] : []),
    ...(sh.capacityLoss ? [`${ic('hodiny')} ${tr('Kapacita týmu je do konce projektu nižší o {n}.', { n: sh.capacityLoss })}`] : []),
    ...(sh.approach && sh.approach !== r.prevApproach ? [`${APPROACHES[sh.approach].icon} ${tr('Z projektu je teď <b>{now}</b> (dosud {before}).', { now: APPROACHES[sh.approach].label.toLowerCase(), before: APPROACHES[r.prevApproach].label.toLowerCase() })}`] : []),
    ...(sh.addStakeholders || []).map(id => { const x = stakeholderById(id); return `${mono(x, stakeIdx(id), 'sm')} ${tr('Nový stakeholder: <b>{name}</b> – {wants}', { name: x.name, wants: x.wants })}`; }),
    ...r.teamNotes,
  ];
  const result = res && !hints() ? `
    <div class="card mix-result">
      <h3>${tr('Mix je upravený')}</h3>
      <p>${tr('Přidáno: {added} · odebráno: {removed}', { added: res.adds.map(id => `${practiceById(id).icon} ${practiceById(id).name}`).join(', ') || tr('nic'), removed: res.removed.map(id => `${practiceById(id).icon} ${practiceById(id).name}`).join(', ') || tr('nic') })}</p>
      <div class="chips">${deltaChips(res.deltas)}</div>
      <p class="hint">${tr('Jestli úprava odpovídá nové situaci, ukáže projekt.')}</p>
      <button class="btn primary" data-action="shiftNext">${tr('Na plánování {n}. {gen}', { n: S.sprint + 1, gen: per().gen })} ${GO}</button>
    </div>` : res ? `
    <div class="card mix-result ${res.adapted ? 'adapted' : 'rigid'}">
      <h3>${res.adapted ? `${ic('best')} ${tr('Řízení jsi přizpůsobil(a) nové situaci')}` : `${ic('bad')} ${tr('Metodika zůstala stejná, i když se svět změnil')}`}</h3>
      <p>${sh.lesson}</p>
      ${res.hiddenFits.length ? `<p>${ic('terc')} ${tr('Na odhalený faktor sedí: {list}.', { list: res.hiddenFits.map(p => `${p.icon} ${p.name}`).join(', ') })}</p>` : ''}
      ${res.newBad.length ? `<p class="warn">${ic('ok')} ${tr('Nově přidané, ale tady nevhodné: {list}.', { list: res.newBad.map(p => `${p.icon} ${p.name}`).join(', ') })}</p>` : ''}
      <div class="chips">${deltaChips(res.deltas)}</div>
      ${revealBlock(res.reveals)}
      <button class="btn primary" data-action="shiftNext">${tr('Na plánování {n}. {gen}', { n: S.sprint + 1, gen: per().gen })} ${GO}</button>
    </div>` : `
    <div class="mix-bar card">
      <div class="mix-cost">
        <span>${tr('Režie řízení')}</span>
        <b class="${over > 0 ? 'over' : ''}">${cost} / ${budget()}</b>
        <small>${tr('Přidáno {n} / {max}', { n: adds.length, max: maxShiftAdds() })}</small>
      </div>
      <div class="mix-pairs"><p class="hint">${tr('Každá nově zavedená praktika stojí −3 {b} a −2 {m} (změna procesu uprostřed projektu). Odebrat můžeš cokoli zdarma.', { b: ic('rozpocet', 'sm'), m: ic('moralka', 'sm') })}</p></div>
      <button class="btn primary big" data-action="confirmShift">${tr('Potvrdit úpravu mixu')} ${GO}</button>
    </div>`;
  return `
    <div class="phase-title"><span class="phase">${ic(isInsane() ? 'velmiobtizna' : 'narocna')} ${tr('Změna kontextu · po {loc} {n}', { loc: APPROACHES[AP()].period === 'Etapa' ? tr('etapě') : tr('sprintu'), n: S.sprint })}</span><h2>${sh.title}</h2></div>
    <div class="card shift-card">
      <p class="situation">${sh.text}</p>
      ${changes.length ? `<ul class="causes">${changes.map(c => `<li>${c}</li>`).join('')}</ul>` : ''}
      <div class="ctx-row"><b>${tr('Kontext teď:')}</b> ${contextChips()}</div>
      <div class="lesson">${ic('zarovka')} ${tr('Tvůj mix praktik byl nastavený pro původní situaci. Zvaž, které praktiky nová situace vyžaduje – a které už nedávají smysl.')}</div>
    </div>
    ${res ? '' : `<div class="pgrid reshape">${cols}</div>`}
    ${result}`;
}

// ---------- Vykreslení: velmi obtížná úroveň ----------

function diagnose() {
  const to = S.sc.takeover;
  const d = S.diag;
  const truth = takeoverTruth();
  if (!d.candidates) d.candidates = shuffle([...truth, ...to.distractors]);
  const cards = d.candidates.map(id => {
    const p = PATTERNS.find(x => x.id === id);
    const on = d.picks.includes(id);
    return `<button class="diag-card ${on ? 'on' : ''}" data-action="diagPick" data-id="${id}" ${d.result ? 'disabled' : ''}>
      <span class="pattern-icon">${p.icon}</span><b>${p.name}</b><small>${p.m}</small></button>`;
  }).join('');
  return `
    <div class="phase-title"><span class="phase">${tr('Fáze {n} / 3', { n: 1 })}</span><h2>${tr('Diagnóza: co se v projektu děje?')}</h2>
      <p>${to.situation}</p></div>
    <div class="card">
      <h3>${ic('lupa')} ${tr('Co vidíš v prvním týdnu')}</h3>
      <ul class="symptoms">${d.symptoms.map(x => `<li>${x}</li>`).join('')}</ul>
      <p class="hint">${tr('Příznaky jsou <b>důsledky</b>. Najdi <b>mechanismy</b>, které je způsobují – antivzorce, které předchozí vedení do projektu zavedlo. Pozor, ne všechny nabízené v projektu působí.')}</p>
    </div>
    <div class="diag-grid">${cards}</div>
    ${d.result ? `
      <div class="card result">
        <h3>${tr('Diagnóza je zapsaná')}</h3>
        <p>${tr('Označil(a) jsi {n} {word}. Jestli jsi trefil(a) skutečné příčiny, se ukáže až na konci – teď podle diagnózy zasáhni do mixu praktik.', { n: d.picks.length, word: plural(d.picks.length, ['antivzorec', 'antivzorce', 'antivzorců'], ['anti-pattern', 'anti-patterns']) })}</p>
        <button class="btn primary" data-action="toToolbox">${tr('Na zásah do mixu')} ${GO}</button>
      </div>` : `
      <div class="actions"><button class="btn primary" data-action="diagEval" ${d.picks.length ? '' : 'disabled'}>${tr('Potvrdit diagnózu')} (${d.picks.length})</button></div>`}`;
}

function epilog() {
  const e = S.epilog;
  return `
    <div class="phase-title"><span class="phase">${tr('Projekt skončil')}</span><h2>${ic('harmonogram')} ${tr('Rok poté')}</h2>
      <p>${tr('Projekt je předaný a tým se rozešel k dalším úkolům. Co z něj zůstalo?')}</p></div>
    <div class="epilog-list">
      ${e.cards.map(c => `
        <div class="card epilog-card ${c.pts > 0 ? 'good' : c.pts < 0 ? 'bad' : ''}">
          <span class="ep-when">${c.when}</span>
          <h3>${ic(c.pts > 0 ? 'best' : c.pts < 0 ? 'bad' : 'ok')} ${c.title}</h3>
          <p>${c.text}</p>
          <span class="ep-pts">${c.pts > 0 ? `+${c.pts}` : c.pts || '±0'}</span>
        </div>`).join('')}
    </div>
    <div class="card result">
      <h3>${tr('Udržitelnost výsledku: {n} %', { n: e.sustain })}</h3>
      <p class="hint">${tr('Projekt nekončí předáním. To, jestli jeho výsledek po roce žije, rozhoduje kvalita, předání do provozu, znalosti v týmu, odpočatí lidé a podpora stakeholderů.')}</p>
      <button class="btn primary big" data-action="epilogNext">${tr('Celkové vyhodnocení')} ${ic('cil')}</button>
    </div>`;
}

// Na konci velmi obtížné úrovně se ukáže, co bylo během hry skryté.
function insaneReveal() {
  if (!isInsane()) return '';
  const r = S.mixResult;
  const stakes = Object.entries(S.stake).map(([id, v]) => { const x = stakeholderById(id); return `<li>${mono(x, stakeIdx(id), 'sm')} <b>${x.name}</b>: ${moodIcon(v)} ${v}</li>`; }).join('');
  return `
    <div class="card">
      <h3>${ic('mlha')} ${tr('Co se skrývalo v mlze')}</h3>
      <div class="two-col">
        <div>
          <h4>${tr('Skutečné ukazatele na konci')}</h4>
          <ul class="checklist">${METRICS.map(m => `<li>${m.icon} ${m.label}: <b>${S.metrics[m.id]}</b></li>`).join('')}</ul>
          ${stakes ? `<h4>${tr('Stakeholdeři')}</h4><ul class="checklist">${stakes}</ul>` : ''}
        </div>
        <div>
          ${r ? `<h4>${tr('Základy pro {label} v tvém mixu', { label: APPROACHES[AP()].label.toLowerCase() })}</h4>
          <ul class="checklist">${ESSENTIALS[AP()].map(e => `<li class="${e.any.some(has) ? 'ok' : 'ko'}">${okIc(e.any.some(has))} ${e.name}</li>`).join('')}</ul>
          ${chosenPractices().filter(p => isTrap(p) || isMisfit(p)).length ? `<p class="warn">${ic('ok')} ${tr('Pro tento typ projektu nevhodné:')} ${chosenPractices().filter(p => isTrap(p) || isMisfit(p)).map(p => `${p.icon} ${p.name}`).join(', ')}</p>` : ''}` : ''}
          ${S.team.length ? `<h4>${tr('Tým na konci')}</h4><ul class="checklist">${S.team.map((p, i) => `<li>${mono(p, i, 'sm')} ${p.name}: ${p.gone ? `${ic('dvere')} ${tr('odešel{a}', { a: p.f ? 'a' : '' })}` : `${fatigueIcon(p.fatigue)} ${tr('únava {n}', { n: p.fatigue })}`}</li>`).join('')}</ul>` : ''}
        </div>
      </div>
    </div>`;
}

function finalScore() {
  const avgMetrics = sum(METRICS, m => S.metrics[m.id]) / METRICS.length;
  const value = sum(S.backlog.filter(b => b.done), itemValue);
  // Prediktivní projekt: hodnotí se dodání v termínu (čerpání rezervy mírně, přetažení výrazně).
  const valuePct = isPhased()
    ? Math.max(0, 100 - 5 * Math.min(S.overrunTotal, S.initialBuffer) - 15 * Math.max(0, -S.buffer))
    : Math.min(100, value / S.targetValue * 100);
  const insightPct = S.insightMax ? S.insight / S.insightMax * 100 : 0;
  // Velmi obtížná úroveň: do zdraví projektu se počítá i nejméně spokojený stakeholder a do skóre rok poté.
  const min = stakeMin();
  const health = min === null ? avgMetrics : avgMetrics * 0.8 + min * 0.2;
  const sustain = S.epilog ? S.epilog.sustain : null;
  let score;
  if (S.failed) score = Math.min(35, health * 0.35);
  else if (sustain !== null) score = health * 0.25 + valuePct * 0.25 + insightPct * 0.3 + sustain * 0.2;
  else score = health * 0.35 + valuePct * 0.3 + insightPct * 0.35;
  return { avgMetrics: health, value, valuePct, insightPct, sustain, score: Math.round(score) };
}

// ---------- Hvězdy: 0–3 podle bodů, KO podmínek a podmínek pro ★★★ (pro každý projekt jinak) ----------

function starCheck(c) {
  if (c.ms) return S.milestones[c.ms] === 'ok';
  if (c.allMs) return S.sc.milestones.every(m => S.milestones[m.id] === 'ok');
  if (c.metric) return S.metrics[c.metric] >= c.min;
  if (c.buffer !== undefined) return S.buffer >= c.buffer;
  if (c.sustain) return (S.epilog?.sustain ?? 0) >= c.sustain;
  if (c.stake) return (stakeMin() ?? 100) >= c.stake;
  return true;
}

function starResult(score) {
  const r = S.sc.stars;
  const ko = r.ko.map(c => ({ text: c.text, ok: starCheck(c) }));
  const top = r.top.map(c => ({ text: c.text, ok: starCheck(c) }));
  const byScore = r.at.filter(t => score >= t).length;
  let stars = byScore;
  let why = null;
  if (S.failed) { stars = 0; why = 'failed'; }
  else if (ko.some(c => !c.ok)) { stars = 0; why = 'ko'; }
  else if (byScore === 0) why = 'low';
  else if (byScore === 3 && top.some(c => !c.ok)) { stars = 2; why = 'top'; }
  return { stars, why, at: r.at, ko, top, missing: byScore < 3 ? r.at[byScore] - score : 0 };
}

const starRow = (n, cls = '') => `<span class="stars ${cls}" role="img" aria-label="${tr('{n} ze 3 hvězd', { n })}">${[0, 1, 2].map(i => `<i class="${i < n ? 'on' : ''}">★</i>`).join('')}</span>`;

// Slovní hodnocení se řídí hvězdami, ne body – hranice hvězd jsou pro každý projekt jiné.
function grade(res) {
  if (res.why === 'failed') return [ic('narocna'), tr('Projekt v krizi'), tr('Projekt skončil předčasně. Přečti si poučení a zkus to znovu!')];
  if (res.why === 'ko') return [ic('stop'), tr('Nesplněno'), tr('Projekt doběhl, ale nesplnil zásadní podmínku: {list}.', { list: res.ko.filter(c => !c.ok).map(c => c.text.toLowerCase()).join('; ') })];
  if (res.stars === 0) return [ic('dest'), tr('Nesplněno'), tr('Projekt doběhl, ale na první hvězdu chybí {n} bodů. Zkus hru znovu – události budou jiné.', { n: res.missing })];
  if (res.stars === 1) return [ic('medaile-bronz'), tr('Začínající PM'), tr('Projekt doběhl do cíle, ale se šrámy. Mrkni na poučení níže a zkus to znovu.')];
  if (res.stars === 2) return [ic('medaile'), tr('Zkušený projektový manažer'), res.why === 'top'
    ? tr('Body máš na tři hvězdy, chybí ale podmínka pro mistrovství – viz níže.')
    : tr('Velmi dobrá práce. Pár rozhodnutí šlo udělat lépe – mrkni na poučení níže.')];
  return [ic('pohar'), tr('Mistr řízení projektů'), tr('Projekt jsi řídil(a) přesně tak, jak jeho povaha vyžadovala.')];
}

// Cíle projektu: hranice hvězd a podmínky (v zadání bez stavu, na konci se splněním).
function starGoals(res) {
  const r = S.sc.stars;
  const mark = c => (res ? okIc(c.ok) : '•');
  const list = (title, items) => `<div class="sg-col"><b>${title}</b><ul>${items.map(c => `<li class="${res ? (c.ok ? 'ok' : 'no') : ''}">${mark(c)} ${c.text}</li>`).join('')}</ul></div>`;
  return `
    <div class="star-goals ${res ? 'result' : ''}">
      <div class="sg-at">${r.at.map((t, i) => `<span class="${res && res.stars > i ? 'got' : ''}">${starRow(i + 1, 'sm')} ${tr('{n} b.', { n: t })}</span>`).join('')}</div>
      <div class="sg-cols">
        ${list(tr('Musí platit, jinak 0 ★'), res ? res.ko : r.ko)}
        ${list(tr('Navíc pro ★★★'), res ? res.top : r.top)}
      </div>
    </div>`;
}

function end() {
  const f = finalScore();
  // Kariéra se zapíše jednou za hru; hodnost před hrou se počítá ještě před uložením rekordu a hvězd.
  const firstEnd = !S.career;
  const rankBefore = firstEnd ? rankIndex() : 0;
  // Rekord se porovná jen jednou, aby překreslení (např. slovníček) nezměnilo „nový rekord“.
  if (S.prevRecord === null) {
    S.prevRecord = getRecord(S.sc.id);
    if (f.score > S.prevRecord) setRecord(S.sc.id, f.score);
  }
  const res = starResult(f.score);
  if (S.prevStars == null) {
    S.prevStars = getStars(S.sc.id) ?? -1;
    if (res.stars > S.prevStars) setStars(S.sc.id, res.stars);
  }
  if (firstEnd) S.career = recordCareer(f, res, rankBefore);
  const newRecord = f.score > S.prevRecord;
  const newStars = res.stars > S.prevStars && S.prevStars >= 0;
  const [icon, title, text] = grade(res);
  const mustDone = mustItems().filter(b => b.done).length;
  const mustAll = mustItems().length;
  const valueNote = isPhased() ? tr('přesah etap {o} · rezerva {b}', { o: days(S.overrunTotal), b: days(S.buffer) })
    : AP() === 'agile' ? `${ic('hodnota', 'sm')} ${tr('{n} skutečné hodnoty', { n: f.value })}` : `${ic('hodnota', 'sm')} ${f.value} · Must ${mustDone}/${mustAll}`;
  const lessons = S.lessons.map(l => `
    <li class="lesson-row ${l.rating}">
      <div><b>${RATING_ICON[l.rating]} ${l.title}</b> <small>— ${l.choice}</small></div>
      <div class="lesson-text">${ic('zarovka')} ${l.lesson}</div>
    </li>`).join('');
  const found = S.found.map(x => PATTERNS.find(p => p.id === x.id));
  const atlas = getAtlas();
  const foundPos = found.filter(p => p.type === 'pattern').length;
  return `
    <div class="card hero end">
      ${S.failed ? `<div class="failed">${ic('stop')} ${S.failed}</div>` : ''}
      ${starRow(res.stars, 'big')}
      <h1>${icon} ${title}</h1>
      <div class="score">${f.score}<small>${tr('/100 bodů')}</small></div>
      <p class="record">${newStars ? `${ic('oslava')} ${tr('Nově {stars} v tomto projektu!', { stars: starRow(res.stars, 'sm') })}` : newRecord ? `${ic('oslava')} ${tr('Nový osobní rekord v tomto projektu!')}` : `${ic('medaile')} ${tr('Tvůj rekord v tomto projektu: {n} bodů', { n: S.prevRecord })}${S.prevStars > 0 ? ` · ${tr('nejvíc {stars}', { stars: starRow(S.prevStars, 'sm') })}` : ''}`}</p>
      <p class="lead">${text}</p>
      ${starGoals(res)}
      <div class="score-grid">
        <div><span>${tr('Zdraví projektu')}</span><b>${Math.round(f.avgMetrics)}%</b><small>${stakeMin() === null ? tr('průměr 5 ukazatelů') : tr('ukazatele a stakeholdeři')}</small></div>
        <div><span>${isPhased() ? tr('Dodání v termínu') : tr('Dodaná hodnota')}</span><b>${Math.round(f.valuePct)}%</b><small>${valueNote}</small></div>
        <div><span>${tr('Manažerský úsudek')}</span><b>${Math.round(f.insightPct)}%</b><small>${tr('přístup, mix praktik a rozhodnutí')}</small></div>
        ${f.sustain !== null ? `<div><span>${tr('Rok poté')}</span><b>${f.sustain}%</b><small>${tr('udržitelnost výsledku')}</small></div>` : ''}
      </div>
    </div>
    ${careerNews()}
    ${progressChart()}
    ${insaneReveal()}
    ${S.aftermath.length ? `
      <div class="card aftermath">
        <h3>${ic('hodiny')} ${tr('Dozvuky po projektu')}</h3>
        ${S.aftermath.map(a => `<p><b>${a.title}</b> – ${a.text} <small>${tr('(rozhodnutí „{choice}“)', { choice: a.fromChoice })}</small></p><div class="chips">${deltaChips(a.deltas)}</div>`).join('')}
      </div>` : ''}
    <div class="card">
      <h3>${ic('mapa')} ${tr('Vzorce, které tvůj projekt vytvořil')}</h3>
      <p>${approachChip()} ${tr('Tvůj mix:')} ${chosenPractices().map(p => `<span class="ctx">${p.icon} ${p.name}</span>`).join(' ') || '–'}</p>
      ${found.length ? `
        <p class="hint">${tr('{p} vzorců, {a} antivzorců. Každý je zapsaný jako řetězec kontext → forma → mechanismus → důsledek.', { p: foundPos, a: found.length - foundPos })}</p>
        <div class="pattern-grid">${found.map(p => patternCard(p)).join('')}</div>` : `<p class="hint">${tr('V tomto projektu se žádný vzorec neprojevil.')}</p>`}
      <div class="actions"><button class="btn" data-action="atlas">${ic('mapa')} ${tr('Celý atlas: {n} / {all} objeveno', { n: atlas.length, all: PATTERNS.length })}</button></div>
    </div>
    <div class="card">
      <h3>${tr('Co sis z projektu odnesl(a)')}</h3>
      <ul class="lessons">${lessons}</ul>
    </div>
    <div class="actions">
      <button class="btn primary big" data-action="replay">${tr('Hrát znovu')} ${ic('znovu')}</button>
      <button class="btn" data-action="restart">${tr('Jiný projekt')} ${GO}</button>
    </div>
  `;
}

function modal(title, body) {
  return `
    <div class="modal-back" data-action="closeModal">
      <div class="modal card" role="dialog" aria-label="${title.replace(/<[^>]*>/g, '').trim()}">
        <div class="modal-head"><h2>${title}</h2><button class="btn ghost" data-action="closeModal" aria-label="${tr('Zavřít')}">${ic('zavrit')}</button></div>
        ${body}
      </div>
    </div>`;
}

function glossaryModal() {
  return modal(`${ic('kniha')} ${tr('Slovníček řízení projektů')}`, `<dl>${GLOSSARY.map(([t, d]) => `<dt>${t}</dt><dd>${d}</dd>`).join('')}</dl>`);
}

function atlasModal() {
  const atlas = getAtlas();
  const section = type => PATTERNS.filter(p => p.type === type).map(p => atlas.includes(p.id)
    ? patternCard(p)
    : `<div class="pattern locked ${type}"><span class="pattern-icon">${ic('zamek')}</span> <b>${type === 'pattern' ? tr('Neobjevený vzorec') : tr('Neobjevený antivzorec')}</b></div>`).join('');
  return modal(`${ic('mapa')} ${tr('Atlas vzorců')} (${atlas.length} / ${PATTERNS.length})`, `
    <p class="hint">${tr('Vzorce a antivzorce řízení projektů, které jsi odhalil(a) ve svých hrách. Každý popisuje, <b>v jakém kontextu</b> a <b>jakou formou</b> se projekt řídil, <b>jakým mechanismem</b> to působilo a <b>jaký to mělo důsledek</b>. Neobjevené odhalíš jinými projekty a mixy praktik.')}</p>
    <h3>${ic('vzorec')} ${tr('Vzorce – mechanismy, které vytvářejí hodnotu')}</h3>
    <div class="pattern-grid">${section('pattern')}</div>
    <h3>${ic('antivzorec')} ${tr('Antivzorce – mechanismy, které vedou k dysfunkcím')}</h3>
    <div class="pattern-grid">${section('anti')}</div>`);
}

// Titulek a popis stránky v jazyce hry (meta značky pro sdílení jsou statické v index.html a en/index.html).
document.title = tr('Projektová alchymie – namíchej správné řízení pro každý projekt');
document.querySelector('meta[name=description]')?.setAttribute('content', tr('Výuková hra o řízení projektů: poznej, jestli projekt potřebuje plán, agilitu, nebo hybrid, a namíchej správné praktiky.'));

newGame();
