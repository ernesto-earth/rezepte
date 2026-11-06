(() => {
  const R = window.REZEPTE;
  const CAT = {
    'gemüse': ['Gemüse', '#C2410C'], 'fleisch': ['Fleisch', '#9F1239'], 'vegetarisch': ['Vegetarisch', '#3F6212'],
    'fisch': ['Fisch', '#1D4E89'], 'süßspeisen': ['Süßspeisen', '#6D28D9'],
    'suppen': ['Suppen', '#CA8A04'],
  };
  const app = document.getElementById('app');
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const state = { filter: 'alle', term: '', portions: {}, checked: {}, cook: null };
  let wakeLock = null;

  // ---------- Mengen umrechnen ----------
  const FR = { '½': .5, '¼': .25, '¾': .75, '⅓': 1 / 3, '⅔': 2 / 3 };
  const UNITS = ['g', 'kg', 'dag', 'ml', 'l', 'cl', 'EL', 'TL', 'Msp.', 'Prise', 'Prisen', 'Bund', 'Pkg.', 'Pck.', 'Packung', 'Becher', 'Dose', 'Zehe', 'Zehen', 'Stück', 'Scheiben', 'cm'];
  const num = s => s ? parseFloat(s.replace(',', '.')) : 0;
  function parseAmount(t) {
    const m = t.match(/^(\d+(?:[.,]\d+)?)?\s?([½¼¾⅓⅔])?(?:\s?[–-]\s?(\d+(?:[.,]\d+)?))?\s+/);
    if (!m || (!m[1] && !m[2])) return null;
    const a = num(m[1]) + (m[2] ? FR[m[2]] : 0);
    const b = m[3] ? num(m[3]) : null;
    let rest = t.slice(m[0].length), unit = '';
    const u = rest.match(/^(\S+)\s+/);
    if (u && UNITS.includes(u[1])) { unit = u[1]; rest = rest.slice(u[0].length); }
    return { a, b, unit, rest };
  }
  function fmt(v, unit) {
    if (['g', 'ml'].includes(unit) && v >= 20) return String(Math.round(v / 5) * 5);
    const whole = Math.floor(v + 1e-9), f = v - whole;
    const q = Math.round(f * 4) / 4;
    if (Math.abs(f - q) < .04) {
      const fc = { 0: '', .25: '¼', .5: '½', .75: '¾', 1: '' }[q];
      const w = q === 1 ? whole + 1 : whole;
      return (w ? String(w) : '') + (fc && w ? ' ' : '') + (fc || (w ? '' : '0'));
    }
    return (Math.round(v * 10) / 10).toString().replace('.', ',');
  }
  function amountHtml(t, factor) {
    const p = parseAmount(t);
    if (!p) return esc(t);
    const show = v => fmt(v * factor, p.unit);
    const amt = show(p.a) + (p.b != null ? '–' + show(p.b) : '') + (p.unit ? ' ' + p.unit : '');
    return `<b>${esc(amt)}</b> ${esc(p.rest)}`;
  }
  function basePortions(r) {
    const m = r.portions.match(/(\d+)/);
    if (!m || !/Portion|Person/.test(r.portions)) return null;
    const word = /Person/.test(r.portions) ? 'Personen' : 'Portionen';
    return { n: parseInt(m[1], 10), word };
  }

  // ---------- Ansichten ----------
  const catLabel = r => r.categories.map(c => CAT[c][0]).join(' · ');
  // Kategoriefarben dürfen hell sein: Punkte zeigen die echte Farbe, Schrift wird bei Bedarf abgedunkelt (Kontrast ≥ 4,5:1)
  const lum = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16) / 255)
    .map(v => v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4).reduce((s, v, i) => s + v * [0.2126, 0.7152, 0.0722][i], 0);
  const ink = h => {
    if (!/^#[0-9a-f]{6}$/i.test(h)) return h;
    let x = h;
    for (let k = 0; k < 30 && lum(x) > 0.18; k++) x = '#' + [1, 3, 5].map(i => Math.round(parseInt(x.slice(i, i + 2), 16) * 0.9).toString(16).padStart(2, '0')).join('');
    return x;
  };
  const catColor = r => ink(CAT[r.categories[0]][1]);

  function viewList() {
    const term = state.term.toLocaleLowerCase('de');
    const visible = R.filter(r => (state.filter === 'alle' || r.categories.includes(state.filter)) &&
      (!term || [r.title, r.subtitle, ...r.tags, ...r.ingredients.map(i => i.t || '')].join(' ').toLocaleLowerCase('de').includes(term)));
    const chips = ['alle', ...Object.keys(CAT)].map(k => {
      const n = k === 'alle' ? R.length : R.filter(r => r.categories.includes(k)).length;
      return `<button class="chip" type="button" data-filter="${k}" aria-pressed="${state.filter === k}">${k === 'alle' ? '' : `<span class="dot" style="background:${CAT[k][1]}"></span>`}${k === 'alle' ? 'Alle' : CAT[k][0]} <small>${n}</small></button>`;
    }).join('');
    const cards = visible.map(r => `<a class="card" href="#rezept/${r.id}">
      <img src="${r.image}" alt="${esc(r.alt)}" loading="lazy">
      <span class="card-body"><span class="lbl" style="color:${catColor(r)}">${esc(catLabel(r))}</span><b>${esc(r.title)}</b><span class="sub">${esc(r.subtitle)}</span>
      <span class="facts"><span class="por">${esc(r.portions)}</span>${r.timeShort ? `<span>${esc(r.timeShort)}</span>` : ''}</span></span></a>`).join('');
    const sources = [...new Set(R.map(r => r.source.replace(/, Seiten? .*$/, '')))].sort();
    return `<main id="main">
      <div class="list-head"><h1 tabindex="-1">Was kochen wir heute?</h1>
        <label class="search"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6B625A" stroke-width="2" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m16.5 16.5 4 4"/></svg><span class="vh">Rezepte durchsuchen</span>
        <input id="search" type="search" placeholder="Rezept oder Zutat, z. B. Kürbis, Mohn …" value="${esc(state.term)}" autocomplete="off"></label></div>
      <p>Die Rezeptesammlung wird laufend ergänzt.</p>
      <div class="chips" role="group" aria-label="Kategorien">${chips}</div>
      <div class="grid" aria-live="polite">${cards}</div>
      ${visible.length ? '' : '<p class="empty">Kein Rezept gefunden. Vielleicht wartet es noch darauf, gesammelt zu werden.</p>'}
      <section class="about" id="sammlung"><h2>Über die Sammlung</h2><div>
        <p>${R.length} Rezepte, die Ernesto aus Zeitschriften, von Rezeptseiten und aus der eigenen Küche gesammelt hat. Zutaten und Zubereitung stammen aus der jeweiligen Quelle; Kategorien und Kurztexte sind ergänzt. Die Original-PDFs der Zeitschriftenrezepte liegen im Projektordner Rezepte/pdf.</p>
        <ul>${sources.map(s => `<li>${esc(s)}</li>`).join('')}</ul><p><a href="bearbeiten/">Rezepte bearbeiten oder neu anlegen</a> (mit Passwort)</p></div></section>
    </main>`;
  }

  function viewRecipe(r) {
    const base = basePortions(r);
    const p = state.portions[r.id] ?? (base ? base.n : null);
    const factor = base ? p / base.n : 1;
    const checked = state.checked[r.id] || (state.checked[r.id] = {});
    const ing = r.ingredients.map((i, k) => i.h
      ? `<li class="h">${esc(i.h)}</li>`
      : `<li><label><input type="checkbox" data-ing="${k}"${checked[k] ? ' checked' : ''}><span>${amountHtml(i.t, factor)}</span></label></li>`).join('');
    const stepper = base
      ? `<div class="stepper"><button type="button" data-portions="-1" aria-label="Eine Portion weniger"${p <= 1 ? ' disabled' : ''}>−</button><span aria-live="polite">${p} ${base.word}</span><button type="button" data-portions="1" aria-label="Eine Portion mehr"${p >= 24 ? ' disabled' : ''}>+</button></div>`
      : `<span class="yield">ergibt ${esc(r.portions)}</span>`;
    const note = base ? `<p class="note">Original: ${esc(r.portions)}. Mengen im Text der Schritte gelten für die Originalmenge.</p>` : '';
    const steps = r.steps.map((s, k) => `<li><span class="n">${k + 1}</span><p>${esc(s)}</p></li>`).join('');
    return `<main id="main">
      <a class="back" href="#rezepte">← Alle Rezepte</a>
      <div class="recipe">
        <section style="display:flex;flex-direction:column;gap:16px">
          <img class="recipe-photo" src="${r.image}" alt="${esc(r.alt)}">
          <div class="box"><div class="box-head"><h2>Zutaten</h2>${stepper}</div><ul class="ing">${ing}</ul>${note}</div>
        </section>
        <section>
          <div class="title-block"><span class="lbl">${esc(r.tags.join(' · '))}</span><h1 tabindex="-1">${esc(r.title)}</h1><p>${esc(r.subtitle)}</p></div>
          <div class="facts-row">
            <span class="fact"><small>Zeit</small><b>${esc(r.time)}</b></span>
            ${r.author ? `<span class="fact"><small>Rezept</small><b>${esc(r.author)}</b></span>` : ''}
            <button class="btn" type="button" data-cook>Kochmodus starten →</button>
          </div>
          <div class="box"><h2 style="margin:6px 0 4px">Zubereitung</h2><ol class="steps">${steps}</ol></div>
          ${r.tip ? `<div class="tip"><b>Tipp</b> · ${esc(r.tip)}</div>` : ''}
          <p class="src">Quelle: ${r.url ? `<a href="${esc(r.url)}" rel="noopener">${esc(r.source)}</a>` : esc(r.source)}${r.pdf ? ` · Original-PDF: ${esc(r.pdf)}` : ''} · <a href="bearbeiten/?id=${encodeURIComponent(r.id)}">Bearbeiten</a></p>
        </section>
      </div>
    </main>`;
  }

  function viewCook(r) {
    const s = state.cook.step, total = r.steps.length;
    const base = basePortions(r);
    const p = state.portions[r.id] ?? (base ? base.n : null);
    const factor = base ? p / base.n : 1;
    const ing = r.ingredients.map(i => i.h ? `<div class="h">${esc(i.h)}</div>` : `<div>${amountHtml(i.t, factor)}</div>`).join('');
    return `<div class="cook" role="dialog" aria-modal="true" aria-label="Kochmodus ${esc(r.title)}"><div class="cook-inner">
      <div class="cook-top"><button class="cook-close" type="button" data-cook-close aria-label="Kochmodus beenden"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg></button>
        <div class="cook-title"><small>Kochmodus</small><b>${esc(r.title)}</b></div>
        <button class="cook-ing-btn" type="button" data-cook-ing aria-expanded="${state.cook.ing}">Zutaten</button></div>
      <div class="bars" aria-hidden="true">${r.steps.map((_, k) => `<span class="${k < s ? 'on' : ''}"></span>`).join('')}</div>
      <div class="cook-body"><div class="cook-step">Schritt ${s} von ${total}</div><p class="cook-text" aria-live="polite">${esc(r.steps[s - 1])}</p>
        ${state.cook.ing ? `<div class="cook-ing">${base ? `<div class="h">Für ${p} ${base.word}</div>` : ''}${ing}</div>` : ''}</div>
      ${wakeLock ? '<p class="cook-hint">Der Bildschirm bleibt im Kochmodus an.</p>' : ''}
      <div class="cook-nav"><button class="cook-prev" type="button" data-cook-step="-1"${s <= 1 ? ' disabled' : ''}>Zurück</button>
        <button class="cook-next" type="button" data-cook-step="1">${s < total ? 'Weiter' : 'Fertig – Mahlzeit!'}</button></div>
    </div></div>`;
  }

  // ---------- Steuerung ----------
  const byId = id => R.find(r => r.id === id);
  function route() {
    const [view, id] = decodeURIComponent(location.hash.slice(1)).split('/');
    const r = id && byId(id);
    const active = r ? 'rezepte' : (view === 'sammlung' ? 'sammlung' : 'rezepte');
    document.querySelectorAll('[data-nav]').forEach(a => {
      if (a.dataset.nav === active) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current');
    });
    if (view === 'kochen' && r) { if (!state.cook || state.cook.id !== r.id) state.cook = { id: r.id, step: 1, ing: false }; render(r, true); return; }
    state.cook = null; releaseWake();
    if (view === 'rezept' && r) { render(r, false); window.scrollTo(0, 0); document.title = `${r.title} · Am Tisch`; return; }
    render(null, false);
    document.title = 'Am Tisch – Ernestos Rezepte';
    if (view === 'sammlung') requestAnimationFrame(() => document.getElementById('sammlung')?.scrollIntoView({ block: 'start' }));
    else window.scrollTo(0, 0);
  }
  function render(r, cooking) {
    const focusSearch = document.activeElement?.id === 'search';
    const pos = focusSearch ? document.activeElement.selectionStart : null;
    app.innerHTML = r ? viewRecipe(r) + (cooking ? viewCook(r) : '') : viewList();
    document.body.classList.toggle('cooking', !!cooking);
    if (cooking) { requestWake(); app.querySelector('.cook-next')?.focus(); }
    if (focusSearch) { const s = document.getElementById('search'); s.focus(); s.setSelectionRange(pos, pos); }
  }
  const current = () => byId(decodeURIComponent(location.hash.slice(1)).split('/')[1]);

  async function requestWake() {
    try { if (!wakeLock && navigator.wakeLock) { wakeLock = await navigator.wakeLock.request('screen'); wakeLock.addEventListener?.('release', () => { wakeLock = null; }); } } catch (e) { wakeLock = null; }
  }
  function releaseWake() { try { wakeLock?.release(); } catch (e) { /* egal */ } wakeLock = null; }

  app.addEventListener('click', e => {
    const t = e.target.closest('button');
    if (!t) return;
    const r = current();
    if (t.dataset.filter) { state.filter = t.dataset.filter; render(null, false); return; }
    if (t.dataset.portions && r) {
      const base = basePortions(r); const p = (state.portions[r.id] ?? base.n) + parseInt(t.dataset.portions, 10);
      state.portions[r.id] = Math.min(24, Math.max(1, p)); render(r, false); return;
    }
    if (t.hasAttribute('data-cook') && r) { location.hash = `kochen/${r.id}`; return; }
    if (t.hasAttribute('data-cook-close') && r) { location.hash = `rezept/${r.id}`; return; }
    if (t.hasAttribute('data-cook-ing') && r) { state.cook.ing = !state.cook.ing; render(r, true); return; }
    if (t.dataset.cookStep && r) {
      const d = parseInt(t.dataset.cookStep, 10), total = r.steps.length;
      if (d > 0 && state.cook.step >= total) { location.hash = `rezept/${r.id}`; return; }
      state.cook.step = Math.min(total, Math.max(1, state.cook.step + d)); render(r, true);
    }
  });
  app.addEventListener('change', e => {
    const box = e.target.closest('[data-ing]'); const r = current();
    if (box && r) (state.checked[r.id] ||= {})[box.dataset.ing] = box.checked;
  });
  app.addEventListener('input', e => { if (e.target.id === 'search') { state.term = e.target.value; render(null, false); } });
  document.addEventListener('keydown', e => {
    if (!state.cook) return;
    const r = current(); if (!r) return;
    if (e.key === 'Escape') location.hash = `rezept/${r.id}`;
    if (e.key === 'ArrowRight') app.querySelector('.cook-next')?.click();
    if (e.key === 'ArrowLeft') app.querySelector('.cook-prev:not(:disabled)')?.click();
  });
  document.addEventListener('visibilitychange', () => { if (state.cook && document.visibilityState === 'visible') requestWake(); });
  addEventListener('hashchange', route);
  route();
})();
