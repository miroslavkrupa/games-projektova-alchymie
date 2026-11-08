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
// Barva lektvaru ukazuje poměr prediktivních, propojovacích a agilních praktik (váženo režií),
// výška hladiny režii vůči rozpočtu. Synergie jiskří, konflikty kouří – jen tam, kde hra radí.

const WORLD_COLOR = { pred: 'var(--pred)', hybrid: 'var(--both)', agile: 'var(--agile)' };
const WORLD_ICON = { pred: '📐', hybrid: '🔗', agile: '🔄' };
const ING_SLOTS = [[14, 18], [62, 12], [38, 30], [78, 34], [24, 46], [52, 52], [8, 62], [70, 62], [42, 8], [88, 14], [30, 70], [58, 32]];
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

  const ings = chosen.map((p, i) => {
    const [x, y] = ING_SLOTS[i % ING_SLOTS.length];
    const shift = Math.floor(i / ING_SLOTS.length) * 6;
    return `<span class="ing ${fresh.includes(p.id) ? 'drop' : ''}" style="left:${x + shift}%;bottom:${Math.min(fill - 12, y)}%;animation-delay:${fresh.includes(p.id) ? 0 : (i * 0.37) % 2}s">${p.icon}</span>`;
  }).join('');
  const label = chosen.length
    ? `Kotel: ${chosen.length} praktik, režie ${cost} z ${budget()}. Poměr: ${worlds.map(k => `${WORLD_LABEL[k].replace(/^\S+\s/, '')} ${pct(k)} %`).join(', ')}.`
    : 'Prázdný kotel – zatím žádná praktika.';

  return `
    <div class="cauldron ${over ? 'over' : ''} ${done ? 'done' : ''} ${fresh.length ? 'splash' : ''}" role="img" aria-label="${label}">
      <div class="sparks" aria-hidden="true">
        ${'<span class="spark">✨</span>'.repeat(Math.min(3, syn))}${'<span class="smoke">💨</span>'.repeat(Math.min(3, con))}
      </div>
      <div class="pot" aria-hidden="true">
        ${fill ? `<div class="brew" style="height:${fill}%;background:${brew}">
          <i class="bubble" style="left:20%"></i><i class="bubble" style="left:55%;animation-delay:.8s"></i><i class="bubble" style="left:78%;animation-delay:1.6s"></i>
        </div>` : ''}
      </div>
      <div class="ings" aria-hidden="true">${ings}</div>
      ${over ? '<div class="foam" aria-hidden="true" style="background:' + brew + '"></div>' : ''}
      <div class="rim" aria-hidden="true"></div>
      <div class="fire" aria-hidden="true"><i></i><i></i><i></i></div>
      <small class="brew-ratio">${chosen.length ? (over ? '⚠️ přetéká' : ratio) : 'vhoď první praktiku'}</small>
    </div>`;
}

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
  const markIcon = r => RATING_LABEL[r].split(' ')[0];
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
      ...(nPat ? [`🟢${nPat > 1 ? `×${nPat}` : ''}`] : []), ...(nAnti ? [`🔴${nAnti > 1 ? `×${nAnti}` : ''}`] : [])];
    tallest = Math.max(tallest, icons.length);
    marks.push(`<span class="pc-mark" style="left:${mid}%">${icons.join('<br>')}</span>`);
    const rows = METRICS.map((m, idx) => {
      const d = hist[k][m.id] - hist[k - 1][m.id];
      return `<li><i style="background:var(--s${idx + 1})"></i>${m.icon} ${m.label}<b>${hist[k][m.id]}</b><small>${d > 0 ? `+${d}` : d < 0 ? `−${-d}` : '±0'}</small></li>`;
    }).join('');
    const failedHere = S.failed && k === n;
    chartTips.push(`
      <b class="pc-tip-head">${failedHere ? `⛔ ${p.nom} ${k} – projekt skončil` : `${p.nom} ${k}`}</b>
      <ul class="pc-tip-vals">${rows}</ul>
      ${decisions.length ? `<ul class="pc-tip-list">${decisions.map(l => `<li>${markIcon(l.rating)} ${l.title}</li>`).join('')}</ul>` : ''}
      ${found.length ? `<ul class="pc-tip-list">${found.map(f => `<li>${f.type === 'pattern' ? '🟢' : '🔴'} ${f.icon} ${f.name}</li>`).join('')}</ul>` : ''}`);
    hits.push(`<div class="pc-hit" tabindex="0" data-col="${k - 1}" data-x="${X(k)}" style="left:${X(k - 1)}%;width:${X(k) - X(k - 1)}%" aria-label="${p.nom} ${k}"></div>`);
  }

  const table = `
    <details class="pc-table">
      <summary>Tabulka hodnot</summary>
      <div class="table-scroll"><table>
        <thead><tr><th>Ukazatel</th>${hist.map((_, i) => `<th>${i ? `${p.nom} ${i}` : 'Start'}</th>`).join('')}</tr></thead>
        <tbody>${METRICS.map(m => `<tr><th>${m.icon} ${m.label}</th>${hist.map(h => `<td>${h[m.id]}</td>`).join('')}</tr>`).join('')}</tbody>
      </table></div>
    </details>`;

  return `
    <div class="card pchart">
      <h3>📈 Průběh projektu</h3>
      <p class="hint">${fogged() || isInsane() ? 'Skutečné hodnoty ukazatelů – během hry jsi je viděl(a) jen v mlze reportingu. ' : ''}Číslo na ose je konec ${p.gen}. Pod osou jsou rozhodnutí (✅ ⚠️ ❌) a odhalené vzorce (🟢 🔴) z daného období – najeď na graf pro detail.</p>
      <div class="pc-legend">${METRICS.map((m, idx) => `<span class="pc-key" data-m="${m.id}"><i style="background:var(--s${idx + 1})"></i>${m.icon} ${m.label}</span>`).join('')}
        ${failAt() ? '<span class="pc-key fail"><i></i>⛔ hranice selhání</span>' : ''}</div>
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
