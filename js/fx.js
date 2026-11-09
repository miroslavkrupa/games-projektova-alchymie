// Projektová alchymie – oživení rozhraní: živé ukazatele, kotel s mixem praktik a graf průběhu projektu.
// Načítá se před game.js; funkce se volají až za běhu, kdy jsou stav hry i data k dispozici.

const reduceMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

// ---------- Živé ukazatele ----------
// Mezi dvěma vykresleními porovná hodnoty v HUD: pruh dojede na novou hodnotu, číslo se dopočítá
// a vedle vyletí změna. Po načtení jiné hry (jiný objekt stavu) se nic neanimuje.

let hudPrev = { owner: null, vals: {} };

function countUp(el, from, to) {
  const t0 = performance.now();
  const dur = 700;
  const step = t => {
    const k = Math.min(1, (t - t0) / dur);
    el.textContent = Math.round(from + (to - from) * (1 - (1 - k) ** 3));
    if (k < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

function animateHud() {
  const els = app.querySelectorAll('.meter[data-m], .stake[data-s]');
  if (!els.length) return;
  const same = hudPrev.owner === S;
  const vals = {};
  els.forEach(el => {
    const key = el.dataset.m || `stake-${el.dataset.s}`;
    const v = +el.dataset.v;
    vals[key] = v;
    const old = hudPrev.vals[key];
    if (!same || old === undefined || old === v || reduceMotion()) return;
    const d = v - old;
    el.classList.add(d > 0 ? 'flash-up' : 'flash-down');
    const bar = el.querySelector('.bar i');
    if (bar) {
      const target = bar.style.width;
      bar.style.transition = 'none';
      bar.style.width = `${old}%`;
      void bar.offsetWidth;
      bar.style.transition = '';
      bar.style.width = target;
    }
    const num = el.querySelector('[data-count]');
    if (num) countUp(num, old, v);
    // V mlze reportingu se přesná změna neukazuje.
    if (!el.classList.contains('fog')) {
      const f = document.createElement('span');
      f.className = `float-delta ${d > 0 ? 'up' : 'down'}`;
      f.textContent = d > 0 ? `+${d}` : String(d);
      f.addEventListener('animationend', () => f.remove());
      el.appendChild(f);
    }
  });
  hudPrev = { owner: S, vals };
}

// ---------- Kotel s mixem praktik ----------
// Kotel je prázdný, plný, nebo přetéká (režie nad rozpočet). Barva lektvaru ukazuje poměr
// prediktivních, propojovacích a agilních praktik (váženo režií). Synergie jiskří, konflikty kouří – jen tam, kde hra radí.

const WORLD_COLOR = { pred: 'var(--pred)', hybrid: 'var(--both)', agile: 'var(--agile)' };
const WORLD_ICON = { pred: ic('pred', 'sm'), hybrid: ic('hybrid', 'sm'), agile: ic('agile', 'sm') };
let cauldronPrev = { owner: null, mix: [] };

function cauldron() {
  const chosen = chosenPractices();
  const done = !!S.mixResult;
  const fresh = cauldronPrev.owner === S && !done ? S.mix.filter(id => !cauldronPrev.mix.includes(id)) : [];
  cauldronPrev = { owner: S, mix: S.mix.slice() };

  const cost = done ? S.mixCost : currentMixCost();
  const over = cost > budget();
  const w = { pred: 0, hybrid: 0, agile: 0 };
  for (const p of chosen) w[p.world] += Math.max(1, p.cost);
  const total = w.pred + w.hybrid + w.agile;
  const worlds = Object.keys(w).filter(k => w[k]);
  let at = 0;
  const stops = worlds.map(k => { const mid = at + w[k] / total * 50; at += w[k] / total * 100; return `${WORLD_COLOR[k]} ${mid.toFixed(0)}%`; });
  const brew = worlds.length === 1 ? `${WORLD_COLOR[worlds[0]]}` : `linear-gradient(90deg, ${stops.join(', ')})`;
  const fill = !chosen.length ? 0 : over ? 100 : Math.round(22 + 66 * Math.min(1, cost / budget()));

  const pairs = hints() ? activePairs() : [];
  const syn = pairs.filter(x => x.type === 'syn').length;
  const con = pairs.length - syn;
  const pct = k => Math.round(w[k] / total * 100);
  const ratio = `${worlds.map(k => `${WORLD_ICON[k]}\u2009${pct(k)}`).join(' ')}\u00a0%`;

  const label = chosen.length
    ? tr('Kotel: {n} praktik, režie {cost} z {budget}. Poměr: {ratio}.', { n: chosen.length, cost, budget: budget(), ratio: worlds.map(k => `${WORLD_LABEL[k].replace(/<svg.*?<\/svg>\s*/, '')} ${pct(k)} %`).join(', ') })
    : tr('Prázdný kotel – zatím žádná praktika.');
  const bubbles = fill ? Math.min(4, 1 + Math.round(fill / 30)) : 0;

  return `
    <div class="cauldron ${over ? 'over' : ''} ${done ? 'done' : ''} ${fresh.length ? 'splash' : ''}" role="img" aria-label="${label}">
      <div class="sparks" aria-hidden="true">
        ${`<span class="spark">${ic('jiskra')}</span>`.repeat(Math.min(3, syn))}${`<span class="smoke">${ic('mlha')}</span>`.repeat(Math.min(3, con))}
      </div>
      ${KOTEL_SVG}
      ${fill ? `<div class="brew" aria-hidden="true" style="background:${brew}">${[22, 50, 74, 38].slice(0, bubbles).map((l, i) => `<i class="bubble" style="left:${l}%;animation-delay:${i * 0.6}s"></i>`).join('')}</div>` : ''}
      ${over ? `<div class="foam" aria-hidden="true" style="background:${brew}"></div>` : ''}
      <small class="brew-ratio">${chosen.length ? (over ? `${ic('ok', 'sm')} ${tr('přetéká')}` : ratio) : tr('vhoď první praktiku')}</small>
    </div>`;
}

// Litinový kotel ve stylu úvodního obrázku: rezavé tělo, výstražná páska, kruhy, nožky a oheň.
// Barvy jsou pevné (je to ilustrace), obrys tmavě hnědý v obou režimech.
const KOTEL_TELO = 'M18 33C6 50 10 72 38 79Q64 85 90 79C118 72 122 50 110 33Z';
const KOTEL_SVG = `
  <svg class="pot" viewBox="0 0 128 100" width="128" height="100" aria-hidden="true">
    <defs>
      <clipPath id="kotel-telo"><path d="${KOTEL_TELO}"/></clipPath>
      <pattern id="kotel-paska" width="9" height="9" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
        <rect width="9" height="9" fill="#e8b827"/><rect width="4.5" height="9" fill="#2b2118"/>
      </pattern>
    </defs>
    <g class="fire">
      <path class="fl" d="M64 97c-9 0-13-4-12-10 1-4 4-6 5-10 2 3 3 5 3 7 1-3 3-6 3-10 5 3 10 9 10 13 0 6-3 10-9 10z" fill="#f08a24" stroke="#2b2118" stroke-width="2" stroke-linejoin="round"/>
      <path class="fl fl2" d="M64 97c-4 0-6-2.4-5.5-5.6.5-2.6 2.6-4 3.4-6.6 2.4 1.8 5.4 4 5.4 7 0 3.4-1.5 5.2-3.3 5.2z" fill="#ffd166"/>
    </g>
    <g fill="#8a7a6a" stroke="#2b2118" stroke-width="2"><ellipse cx="47" cy="96" rx="7" ry="3"/><ellipse cx="81" cy="96" rx="7" ry="3"/></g>
    <g fill="#4a3022" stroke="#2b2118" stroke-width="2.5" stroke-linejoin="round"><path d="M34 74 27 94h9l6-17z"/><path d="M94 74l7 20h-9l-6-17z"/></g>
    <g stroke-linecap="round" fill="none"><circle cx="11" cy="50" r="7" stroke="#2b2118" stroke-width="7"/><circle cx="11" cy="50" r="7" stroke="#6b4a36" stroke-width="3"/>
      <circle cx="117" cy="50" r="7" stroke="#2b2118" stroke-width="7"/><circle cx="117" cy="50" r="7" stroke="#6b4a36" stroke-width="3"/></g>
    <path d="${KOTEL_TELO}" fill="#7a4a30"/>
    <g clip-path="url(#kotel-telo)" fill="none">
      <path d="M26 50c-4 9-2 18 5 25" stroke="#b07a52" stroke-width="3.5" stroke-linecap="round" opacity=".85"/>
      <path d="M0 62Q64 92 128 62V100H0z" fill="#5c3623" stroke="none"/>
      <g fill="#5a3524" stroke="none"><circle cx="72" cy="60" r="1.6"/><circle cx="54" cy="66" r="1.2"/><circle cx="92" cy="58" r="1.4"/><circle cx="84" cy="70" r="1.1"/><circle cx="44" cy="56" r="1"/><circle cx="62" cy="76" r="1.3"/></g>
      <g fill="#a2694a" stroke="none"><circle cx="78" cy="56" r="1.1"/><circle cx="58" cy="58" r=".9"/><circle cx="98" cy="64" r=".9"/></g>
      <rect x="0" y="39" width="128" height="9" fill="url(#kotel-paska)"/>
      <path d="M0 39h128M0 48h128" stroke="#2b2118" stroke-width="2"/>
    </g>
    <path d="${KOTEL_TELO}" fill="none" stroke="#2b2118" stroke-width="3" stroke-linejoin="round"/>
    <ellipse cx="64" cy="31" rx="50" ry="8" fill="#4a3022" stroke="#2b2118" stroke-width="3"/>
    <ellipse cx="64" cy="30" rx="42" ry="5" fill="#1c130e"/>
  </svg>`;

// ---------- Graf průběhu projektu ----------
// Pět ukazatelů v čase: bod 0 je start projektu, bod k konec k-tého období.
// Pod osou jsou rozhodnutí a odhalené vzorce z každého období; najetím se ukáže detail.

let chartTips = [];

function progressChart() {
  const hist = [...S.reportHistory, { ...S.metrics }];
  const n = hist.length - 1;
  if (n < 1) return '';
  const X = i => 3 + (i / n) * 94;
  const Y = v => 100 - v;
  const p = per();
  const markIcon = r => RATING_ICON[r];
  const lines = METRICS.map((m, idx) => `<path class="pc-line" data-m="${m.id}" style="stroke:var(--s${idx + 1})" vector-effect="non-scaling-stroke" d="${hist.map((h, i) => `${i ? 'L' : 'M'}${X(i).toFixed(2)} ${Y(h[m.id])}`).join(' ')}"/>`).join('');
  const grid = [0, 25, 50, 75, 100].map(v => `<line class="pc-grid" vector-effect="non-scaling-stroke" x1="0" x2="100" y1="${Y(v)}" y2="${Y(v)}"/>`).join('');
  const fail = failAt() ? `<line class="pc-fail" vector-effect="non-scaling-stroke" x1="0" x2="100" y1="${Y(failAt())}" y2="${Y(failAt())}"/>` : '';
  const yLabels = [0, 50, 100].map(v => `<span class="pc-y" style="top:${Y(v)}%">${v}</span>`).join('');
  const dots = METRICS.map((m, idx) => `<i class="pc-dot" data-m="${m.id}" style="left:${X(n)}%;top:${Y(hist[n][m.id])}%;background:var(--s${idx + 1})"></i>`).join('');
  const xLabels = hist.map((_, i) => `<span style="left:${X(i)}%">${i ? i : 'start'}</span>`).join('');

  const segment = k => ({
    decisions: S.lessons.filter(l => (l.period ?? 1) === k),
    found: S.found.filter(f => f.sprint === k).map(f => PATTERNS.find(x => x.id === f.id)).filter(Boolean),
  });
  chartTips = [];
  const marks = [];
  const hits = [];
  let tallest = 1;
  for (let k = 1; k <= n; k++) {
    const { decisions, found } = segment(k);
    const mid = (X(k - 1) + X(k)) / 2;
    const nPat = found.filter(f => f.type === 'pattern').length;
    const nAnti = found.length - nPat;
    const icons = [...decisions.map(l => markIcon(l.rating)),
      ...(nPat ? [`${ic('vzorec')}${nPat > 1 ? `×${nPat}` : ''}`] : []), ...(nAnti ? [`${ic('antivzorec')}${nAnti > 1 ? `×${nAnti}` : ''}`] : [])];
    tallest = Math.max(tallest, icons.length);
    marks.push(`<span class="pc-mark" style="left:${mid}%">${icons.join('<br>')}</span>`);
    const rows = METRICS.map((m, idx) => {
      const d = hist[k][m.id] - hist[k - 1][m.id];
      return `<li><i style="background:var(--s${idx + 1})"></i><span>${m.icon} ${m.label}</span><b>${hist[k][m.id]}</b><small>${d > 0 ? `+${d}` : d < 0 ? `−${-d}` : '±0'}</small></li>`;
    }).join('');
    const failedHere = S.failed && k === n;
    chartTips.push(`
      <b class="pc-tip-head">${failedHere ? `${ic('stop', 'sm')} ${tr('{nom} {k} – projekt skončil', { nom: p.nom, k })}` : `${p.nom} ${k}`}</b>
      <ul class="pc-tip-vals">${rows}</ul>
      ${decisions.length ? `<ul class="pc-tip-list">${decisions.map(l => `<li>${markIcon(l.rating)} ${l.title}</li>`).join('')}</ul>` : ''}
      ${found.length ? `<ul class="pc-tip-list">${found.map(f => `<li>${ic(f.type === 'pattern' ? 'vzorec' : 'antivzorec', 'sm')} ${f.icon} ${f.name}</li>`).join('')}</ul>` : ''}`);
    hits.push(`<div class="pc-hit" tabindex="0" data-col="${k - 1}" data-x="${X(k)}" style="left:${X(k - 1)}%;width:${X(k) - X(k - 1)}%" aria-label="${p.nom} ${k}"></div>`);
  }

  const table = `
    <details class="pc-table">
      <summary>${tr('Tabulka hodnot')}</summary>
      <div class="table-scroll"><table>
        <thead><tr><th>${tr('Ukazatel')}</th>${hist.map((_, i) => `<th>${i ? `${p.nom} ${i}` : 'Start'}</th>`).join('')}</tr></thead>
        <tbody>${METRICS.map(m => `<tr><th>${m.icon} ${m.label}</th>${hist.map(h => `<td>${h[m.id]}</td>`).join('')}</tr>`).join('')}</tbody>
      </table></div>
    </details>`;

  return `
    <div class="card pchart">
      <h3>${ic('graf-nahoru')} ${tr('Průběh projektu')}</h3>
      <p class="hint">${fogged() || isInsane() ? tr('Skutečné hodnoty ukazatelů – během hry jsi je viděl(a) jen v mlze reportingu.') + ' ' : ''}${tr('Číslo na ose je konec {gen}. Pod osou jsou rozhodnutí ({ratings}) a odhalené vzorce ({patterns}) z daného období – najeď na graf pro detail.', { gen: p.gen, ratings: `${RATING_ICON.best} ${RATING_ICON.ok} ${RATING_ICON.bad}`, patterns: `${ic('vzorec')} ${ic('antivzorec')}` })}</p>
      <div class="pc-legend">${METRICS.map((m, idx) => `<span class="pc-key" data-m="${m.id}"><i style="background:var(--s${idx + 1})"></i>${m.icon} ${m.label}</span>`).join('')}
        ${failAt() ? `<span class="pc-key fail"><i></i>${tr('hranice selhání')}</span>` : ''}</div>
      <div class="pc-frame">
        <div class="pc-plot">
          ${yLabels}
          <svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">${grid}${fail}${lines}</svg>
          ${dots}
          <div class="pc-cross" hidden></div>
          ${hits.join('')}
          <div class="pc-tip" hidden></div>
        </div>
        <div class="pc-x" aria-hidden="true">${xLabels}</div>
        <div class="pc-marks" aria-hidden="true" style="height:${(tallest * 1.3 + 0.6).toFixed(1)}em">${marks.join('')}</div>
      </div>
      ${table}
    </div>`;
}

function showChartTip(hit) {
  const plot = hit.closest('.pc-plot');
  const tip = plot.querySelector('.pc-tip');
  const cross = plot.querySelector('.pc-cross');
  const x = +hit.dataset.x;
  tip.innerHTML = chartTips[+hit.dataset.col] || '';
  tip.hidden = false;
  // Tooltip stojí vedle čáry a nikdy nevyjede z grafu (na mobilu ani přes okraj stránky).
  const pw = plot.clientWidth;
  const tw = tip.offsetWidth;
  const xp = (x / 100) * pw;
  const left = x > 55 ? xp - 10 - tw : xp + 10;
  tip.style.left = `${Math.max(-30, Math.min(pw - tw, left))}px`;
  cross.hidden = false;
  cross.style.left = `${x}%`;
}

function hideChartTip(plot) {
  plot.querySelector('.pc-tip').hidden = true;
  plot.querySelector('.pc-cross').hidden = true;
}

document.addEventListener('pointerover', e => {
  const hit = e.target.closest('.pc-hit');
  if (hit) { showChartTip(hit); return; }
  const key = e.target.closest('.pc-key[data-m]');
  const chart = e.target.closest('.pchart');
  if (!chart) return;
  chart.querySelectorAll('.pc-line, .pc-dot').forEach(l => l.classList.toggle('dim', !!key && l.dataset.m !== key.dataset.m));
});

document.addEventListener('pointerout', e => {
  const plot = e.target.closest('.pc-plot');
  if (plot && !plot.contains(e.relatedTarget)) hideChartTip(plot);
  const chart = e.target.closest('.pchart');
  if (chart && e.target.closest('.pc-key') && !e.relatedTarget?.closest?.('.pc-key')) {
    chart.querySelectorAll('.dim').forEach(l => l.classList.remove('dim'));
  }
});

document.addEventListener('focusin', e => { const hit = e.target.closest('.pc-hit'); if (hit) showChartTip(hit); });
document.addEventListener('focusout', e => { const hit = e.target.closest('.pc-hit'); if (hit) hideChartTip(hit.closest('.pc-plot')); });
