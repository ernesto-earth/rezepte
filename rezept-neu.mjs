#!/usr/bin/env node
// rezept-neu.mjs – trägt ein neues Rezept in claude-seite/rezepte.json ein (E-024/E-025).
//
//   Weg 1 – Link zu einer Rezeptseite:
//     node rezept-neu.mjs link "https://…" [--kategorie fleisch] [--personen 4]
//     Liest das strukturierte Rezept der Seite (schema.org/Recipe, wie es fast alle Rezeptseiten
//     mitliefern): Titel, Bild, Zutaten, Schritte, Personen, Zeit. Kein KI-Modell nötig.
//
//   Weg 2 – eigenes Bild mit Zutaten und Schritten:
//     node rezept-neu.mjs ordner eingang/<name> [--kategorie …]
//     Der Ordner enthält ein Bild (jpg, png, heic) und rezept.txt (Vorlage: eingang/_vorlage/rezept.txt).
//     Nach dem Eintragen wird der Ordner nach eingang/erledigt/ verschoben.
//
//   --probe  zeigt nur, was eingetragen würde, und ändert nichts.
//
// Pflicht: Anzahl der Personen. Mengen werden übernommen, wie die Quelle sie angibt; fehlende bleiben leer.
// Fehlt etwas, wird NICHTS eingetragen; die Meldung sagt, was fehlt. Veröffentlicht wird danach mit
// ./veroeffentlichen.sh – dieses Skript veröffentlicht nicht selbst.

import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const SITE = path.join(ROOT, 'claude-seite');
const DATA = path.join(SITE, 'rezepte.json');
const IMG_DIR = path.join(SITE, 'img');

const stop = (msg, code = 1) => { console.log(`ERGEBNIS: FEHLER – ${msg}`); process.exit(code); };

// Vorher neuere Änderungen aus dem Repo übernehmen (z. B. über heger.earth/rezepte/bearbeiten, E-027) – nur Vorspulen
try {
  execFileSync('git', ['-C', ROOT, 'fetch', '-q', 'origin', 'main'], { stdio: 'ignore', timeout: 30000 });
  execFileSync('git', ['-C', ROOT, 'merge', '-q', '--ff-only', 'origin/main'], { stdio: 'ignore' });
} catch { console.log('Hinweis: Abgleich mit dem Repo nicht möglich – es wird mit dem lokalen Stand gearbeitet.'); }

// ---- Argumente ---------------------------------------------------------------------------
const args = process.argv.slice(2);
const opt = name => { const i = args.indexOf(name); if (i < 0) return null; const v = args[i + 1]; args.splice(i, 2); return v; };
const flag = name => { const i = args.indexOf(name); if (i < 0) return false; args.splice(i, 1); return true; };
const probe = flag('--probe');
const katOpt = opt('--kategorie');
const persOpt = opt('--personen');
const [modus, ziel] = args;
if (!['link', 'ordner'].includes(modus) || !ziel)
  stop('Aufruf: node rezept-neu.mjs link "<URL>"  oder  node rezept-neu.mjs ordner eingang/<name>  [--kategorie …] [--personen N] [--probe]');

// ---- Hilfen ------------------------------------------------------------------------------
const KATEGORIEN = (() => {
  const js = fs.readFileSync(path.join(SITE, 'site.js'), 'utf8');
  const block = js.match(/const CAT = \{([\s\S]*?)\};/);
  return block ? [...block[1].matchAll(/'([^']+)':\s*\['([^']+)'/g)].map(m => ({ key: m[1], label: m[2] })) : [];
})();
const ENT = { nbsp: ' ', amp: '&', quot: '"', apos: "'", lt: '<', gt: '>', auml: 'ä', ouml: 'ö', uuml: 'ü',
  Auml: 'Ä', Ouml: 'Ö', Uuml: 'Ü', szlig: 'ß', eacute: 'é', egrave: 'è', agrave: 'à', ccedil: 'ç', deg: '°',
  frac12: '½', frac14: '¼', frac34: '¾', ndash: '–', mdash: '—', hellip: '…', bdquo: '„', ldquo: '“', rdquo: '”',
  lsquo: '‘', rsquo: '’', times: '×', middot: '·', shy: '' };
const decode = s => String(s ?? '')
  .replace(/<(br|p|li|div|h\d)\b[^>]*>/gi, ' ').replace(/<[^>]+>/g, '')
  .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(+n))
  .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)))
  .replace(/&([a-z]+\d*);/gi, (m, n) => ENT[n] ?? m)
  .replace(/\(\(+/g, '(').replace(/\)\)+/g, ')')
  .replace(/([a-zäöüß])([.!?])([A-ZÄÖÜ])/g, '$1$2 $3')
  .replace(/\s+/g, ' ').replace(/\s+([.,;:!?])/g, '$1').trim();
const slug = s => s.toLowerCase().replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue').replace(/ß/g, 'ss')
  .normalize('NFKD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60);

function dauer(iso) { // PT1H20M → [lang, kurz]
  const m = /^P(?:(\d+)D)?T?(?:(\d+)H)?(?:(\d+)M)?/i.exec(iso || '');
  if (!m) return null;
  const ges = ((+(m[1] || 0)) * 24 + +(m[2] || 0)) * 60 + +(m[3] || 0);
  const h = Math.floor(ges / 60), min = ges % 60;
  if (!h && !min) return null;
  const lang = [h ? `${h} ${h === 1 ? 'Stunde' : 'Stunden'}` : '', min ? `${min} Minuten` : ''].filter(Boolean).join(' ');
  const kurz = [h ? `${h} Std.` : '', min ? `${min} Min.` : ''].filter(Boolean).join(' ');
  return [lang, kurz];
}

function personen(text) { // "4", "4 servings", "4 Portionen", "für 4 Personen", "12 Stück"
  const s = Array.isArray(text) ? text.join(' ') : String(text ?? '');
  const n = s.match(/(\d+(?:\s*[–-]\s*\d+)?)/);
  if (!n) return null;
  const zahl = n[1].replace(/\s*[–-]\s*/, '–');
  if (/stück|stk/i.test(s)) return `${zahl} Stück`;
  if (/portion/i.test(s)) return `${zahl} Portionen`;
  return `${zahl} ${zahl === '1' ? 'Person' : 'Personen'}`;
}

const OHNE_MENGE_OK = /\b(salz|pfeffer|zucker zum|nach (geschmack|belieben|bedarf)|zum (braten|bestreuen|servieren|garnieren|bestreichen|frittieren|einfetten)|f(ü|ue)r die form|etwas|prise|optional|wasser)\b/i;
const hatMenge = t => /\d|[½¼¾⅓⅔⅛]/.test(t) || /^(ein|eine|einen|einer|zwei|drei|vier|fünf|sechs|halbe?|1\/2)\b/i.test(t) || OHNE_MENGE_OK.test(t);

function kategorien(text) {
  if (katOpt) return katOpt.split(',').map(s => s.trim().toLowerCase());
  const t = text.toLowerCase(), k = [];
  if (/kürbis/.test(t)) k.push('kürbis');
  if (/lachs|fisch|thunfisch|garnele|forelle|zander|kabeljau|saibling|scampi|muschel/.test(t)) k.push('fisch');
  else if (/\b(rind|schwein|huhn|hühner|hähnchen|hendl|speck|wurst|würst|faschiert|hack|kalb|lamm|dürre|schinken|ente|pute|leber|steak|chorizo|sucuk)/.test(t)) k.push('fleisch');
  if (!k.some(x => x === 'fisch' || x === 'fleisch') && /kuchen|torte|dessert|mehlspeise|palatschinke|schokolade|muffin|creme|strudel|buchtel|knödel.*(marille|zwetschk)|zimt/.test(t)) k.push('süßspeisen');
  if (!k.some(x => ['fisch', 'fleisch', 'süßspeisen'].includes(x))) k.push('vegetarisch');
  return [...new Set(k)];
}

function bildSpeichern(quelle, id, ziel = path.join(IMG_DIR, `${id}.jpg`)) { // max. 800 px, JPEG
  if (probe) return `img/${id}.jpg`;
  const sips = fs.existsSync('/usr/bin/sips');
  try {
    if (sips) execFileSync('/usr/bin/sips', ['-s', 'format', 'jpeg', '-s', 'formatOptions', '82', '-Z', '800', quelle, '--out', ziel], { stdio: 'ignore' });
    else execFileSync('python3', ['-c', 'import sys;from PIL import Image;i=Image.open(sys.argv[1]).convert("RGB");i.thumbnail((800,800));i.save(sys.argv[2],"JPEG",quality=82)', quelle, ziel], { stdio: 'ignore' });
  } catch { stop(`Bild konnte nicht umgewandelt werden (${path.basename(quelle)}).`); }
  if (!fs.existsSync(ziel)) stop('Bild wurde nicht gespeichert.');
  return `img/${id}.jpg`;
}

// ---- Weg 1, Rückfall: Seiten ohne Rezeptdaten -------------------------------------------
// Liest den sichtbaren Text: Abschnitt „Zutaten“ bis „Zubereitung“, danach die Schritte bis zur nächsten
// Überschrift; Titel, Bild und Beschreibung aus den Vorschau-Angaben der Seite (og:…).
function ausSeitentext(html) {
  const meta = name => {
    const m = html.match(new RegExp(`<meta[^>]+(?:property|name)=["']${name}["'][^>]*content=["']([^"']*)["']`, 'i'))
      || html.match(new RegExp(`<meta[^>]+content=["']([^"']*)["'][^>]*(?:property|name)=["']${name}["']`, 'i'));
    return m ? decode(m[1]) : '';
  };
  const text = html
    .replace(/<(script|style|noscript|svg|nav|footer|form)\b[\s\S]*?<\/\1>/gi, ' ')
    .replace(/<li\b[^>]*>/gi, '\n• ').replace(/<h[1-6]\b[^>]*>/gi, '\n# ')
    .replace(/<\/?(p|div|br|tr|dt|dd|ul|ol|section|article|h[1-6]|li|table|header|aside)\b[^>]*>/gi, '\n');
  const zeilen = text.split('\n').map(z => { const kopf = z.trimStart().startsWith('#'), li = z.trimStart().startsWith('•');
    const t = decode(z.replace(/^\s*[#•]\s*/, '')); return t ? { t, kopf, li } : null; }).filter(Boolean);
  const ZUT = /^zutaten\b/i, ZUB = /^(zubereitung|anleitung|so geht'?s|so wird'?s gemacht|arbeitsschritte)\b/i;
  const ENDE = /^(tipp|tipps|guten appetit|das könnte|weitere rezepte|ähnliche rezepte|teilen|kommentar|bewertung|newsletter|produkte)/i;
  const iz = zeilen.findIndex(z => ZUT.test(z.t) && z.t.length < 60);
  if (iz < 0) return null;
  const ib = zeilen.findIndex((z, i) => i > iz && ZUB.test(z.t) && z.t.length < 60);
  if (ib < 0) return null;
  const zutBlock = zeilen.slice(iz + 1, ib).filter(z => z.t.length < 140);
  const zutaten = (zutBlock.some(z => z.li) ? zutBlock.filter(z => z.li || /:$/.test(z.t)) : zutBlock).map(z => z.t);
  const schritte = [];
  for (const z of zeilen.slice(ib + 1)) {
    if ((z.kopf && schritte.length) || ENDE.test(z.t) || schritte.length >= 30) break;
    if (z.kopf || z.t.length < 15) continue;
    schritte.push(z.t.replace(/^\d+[.)]\s*/, ''));
  }
  if (!zutaten.length || !schritte.length) return null;
  const alles = zeilen.map(z => z.t).join('\n');
  const ertrag = (zeilen[iz].t.match(/\d.*?(portion|person|stück)\w*/i) || alles.match(/\d+(?:\s*[–-]\s*\d+)?\s*(portionen|personen|stück)/i) || [''])[0];
  const z = alles.match(/(zubereitungszeit|gesamtzeit|kochzeit|dauer)\D{0,25}(\d+(?:[,.]\d+|½)?)\s*(std|stunden?|h\b|min)/i);
  const zeit = z ? (/^min/i.test(z[3]) ? [`${z[2]} Minuten`, `${z[2]} Min.`] : [`${z[2]} ${z[2] === '1' ? 'Stunde' : 'Stunden'}`, `${z[2]} Std.`]) : null;
  const h1 = zeilen.find(x => x.kopf)?.t || '';
  return {
    _seitentext: true, _zeit: zeit,
    name: meta('og:title').split(/\s[|–-]\s/)[0] || h1, description: meta('og:description'),
    image: meta('og:image'), recipeYield: ertrag, recipeIngredient: zutaten, recipeInstructions: schritte,
    publisher: { name: meta('og:site_name') },
  };
}

// ---- Weg 1: Link ------------------------------------------------------------------------
async function ausLink(url) {
  let u; try { u = new URL(url); } catch { stop(`Kein gültiger Link: ${url}`); }
  const holen = async (adr, art) => {
    const r = await fetch(adr, { headers: { 'User-Agent': 'Mozilla/5.0 (Macintosh) AmTisch-Rezepte/1.0', 'Accept-Language': 'de-AT,de;q=0.9' }, redirect: 'follow' })
      .catch(e => stop(`${art} nicht erreichbar (${e.cause?.code || e.message}).`));
    if (!r.ok) stop(`${art} antwortet mit HTTP ${r.status}.`);
    return r;
  };
  const html = await (await holen(u.href, 'Seite')).text();
  const knoten = [];
  for (const m of html.matchAll(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)) {
    try { const walk = x => { if (Array.isArray(x)) x.forEach(walk); else if (x && typeof x === 'object') { knoten.push(x); if (x['@graph']) walk(x['@graph']); } }; walk(JSON.parse(m[1].trim())); } catch {}
  }
  const r = knoten.find(x => [].concat(x['@type'] || []).includes('Recipe')) || ausSeitentext(html);
  if (!r) stop('Auf der Seite wurden weder Rezeptdaten (schema.org) noch die Abschnitte „Zutaten“ und „Zubereitung“ gefunden. Bitte Weg 2 verwenden: Bild in eingang/ legen und Zutaten/Schritte in rezept.txt eintragen.');
  if (r._seitentext) console.log('Hinweis: keine Rezeptdaten auf der Seite – Zutaten und Schritte aus dem Seitentext gelesen, bitte mit --probe kontrollieren.');

  const title = decode(r.name);
  const steps = [];
  const schritt = s => { if (typeof s === 'string') steps.push(decode(s)); else if (s?.itemListElement) [].concat(s.itemListElement).forEach(schritt); else if (s?.text) steps.push(decode(s.text)); };
  [].concat(r.recipeInstructions || []).forEach(schritt);
  const bild = [].concat(r.image || []).map(b => typeof b === 'string' ? b : b?.url).filter(Boolean)[0];
  const zeit = dauer(r.totalTime) || dauer(r.cookTime) || r._zeit || null;
  const autor = [].concat(r.author || []).map(a => typeof a === 'string' ? a : a?.name).filter(Boolean).join(', ');
  const site = decode([].concat(r.publisher || []).map(p => p?.name)[0] || '') || u.hostname.replace(/^www\./, '');
  const desc = decode(r.description);

  let bildDatei = null;
  if (bild) {
    const res = await holen(new URL(bild, u).href, 'Rezeptbild');
    bildDatei = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'rezept-')), 'bild');
    fs.writeFileSync(bildDatei, Buffer.from(await res.arrayBuffer()));
  }
  return {
    title, subtitle: desc && desc.length <= 90 ? desc : '',
    portions: persOpt ? personen(persOpt) : personen(r.recipeYield),
    time: zeit ? zeit[0] : 'Gesamtzeit nicht angegeben', timeShort: zeit ? zeit[1] : '',
    author: decode(autor), source: site, url: u.href,
    ingredients: [].concat(r.recipeIngredient || r.ingredients || []).map(t => ({ t: decode(t) })).filter(i => i.t),
    steps: steps.filter(Boolean), tip: '', bildDatei,
    katText: [title, desc, ...[].concat(r.recipeCategory || []), ...[].concat(r.recipeIngredient || [])].join(' '),
  };
}

// ---- Weg 2: Eingangsordner --------------------------------------------------------------
function ausOrdner(rel) {
  const dir = path.resolve(ROOT, rel);
  if (!dir.startsWith(path.join(ROOT, 'eingang') + path.sep) || !fs.statSync(dir, { throwIfNoEntry: false })?.isDirectory())
    stop(`Ordner ${rel} nicht gefunden (erwartet: eingang/<name>).`);
  const txt = path.join(dir, 'rezept.txt');
  if (!fs.existsSync(txt)) stop(`In ${rel} fehlt rezept.txt (Vorlage: eingang/_vorlage/rezept.txt).`);
  const bild = fs.readdirSync(dir).find(f => /\.(jpe?g|png|heic|webp)$/i.test(f) && !f.startsWith('.'));
  if (!bild) stop(`In ${rel} fehlt ein Bild (jpg, png oder heic).`);

  const kopf = {}, ingredients = [], steps = [];
  let teil = 'kopf', nummeriert = false;
  for (const roh of fs.readFileSync(txt, 'utf8').split(/\r?\n/)) {
    const z = roh.trim();
    if (!z || z.startsWith('#')) continue;
    if (/^zutaten\s*:?$/i.test(z)) { teil = 'zutaten'; continue; }
    if (/^(schritte|zubereitung)\s*:?$/i.test(z)) { teil = 'schritte'; continue; }
    if (teil === 'kopf') { const m = z.match(/^([^:]+):\s*(.*)$/); if (m) kopf[m[1].trim().toLowerCase()] = m[2].trim(); continue; }
    if (teil === 'zutaten') {
      const t = z.replace(/^[-•*–]\s*/, '');
      if (/:$/.test(t) && !/\d/.test(t)) ingredients.push({ h: t.replace(/:$/, '').toUpperCase() });
      else ingredients.push({ t });
      continue;
    }
    const m = z.match(/^(\d+)[.)]\s*(.*)$/);
    if (m) { nummeriert = true; steps.push(m[2]); }
    else if (nummeriert && steps.length) steps[steps.length - 1] += ' ' + z.replace(/^[-•*]\s*/, '');
    else steps.push(z.replace(/^[-•*]\s*/, ''));
  }
  const p = persOpt || kopf.personen || kopf.portionen || kopf['anzahl personen'];
  return {
    title: kopf.titel || kopf.title || '', subtitle: kopf.untertitel || '',
    portions: p ? personen(/^\d+(\s*[–-]\s*\d+)?$/.test(p) ? `${p} ${kopf.portionen && !kopf.personen ? 'Portionen' : 'Personen'}` : p) : null,
    time: kopf.zeit || 'Gesamtzeit nicht angegeben', timeShort: (kopf.zeit || '').replace(/Stunden?/g, 'Std.').replace(/Minuten/g, 'Min.'),
    author: kopf.autor || '', source: kopf.quelle || 'Eigenes Rezept', url: kopf.link || '',
    ingredients, steps, tip: kopf.tipp || '', bildDatei: path.join(dir, bild), ordner: dir,
    katText: [kopf.titel, kopf.untertitel, ...ingredients.map(i => i.t || '')].join(' '),
    kategorieText: kopf.kategorie,
  };
}

// ---- Zusammenführen und prüfen ----------------------------------------------------------
const roh = modus === 'link' ? await ausLink(ziel) : ausOrdner(ziel);
const rezepte = JSON.parse(fs.readFileSync(DATA, 'utf8'));
const fehler = [];
if (!roh.title) fehler.push('Titel fehlt');
if (!roh.portions) fehler.push('Anzahl der Personen fehlt (rezept.txt: „Personen: 4“, beim Link: --personen 4)');
if (!roh.ingredients.filter(i => i.t).length) fehler.push('keine Zutaten');
if (!roh.steps.length) fehler.push('keine Schritte');
if (!roh.bildDatei) fehler.push('kein Bild');
// Mengen: werden übernommen, wie sie in der Quelle stehen; fehlende Mengen bleiben leer (E-025, 2026-11-06)
const ohne = roh.ingredients.filter(i => i.t && !hatMenge(i.t)).map(i => i.t);
if (ohne.length) console.log(`Hinweis: ohne Mengenangabe in der Quelle (bleibt so): ${ohne.join('; ')}`);
const kats = !katOpt && roh.kategorieText ? roh.kategorieText.split(',').map(s => s.trim().toLowerCase()) : kategorien(roh.katText);
const unbekannt = kats.filter(k => !KATEGORIEN.some(c => c.key === k));
if (unbekannt.length) fehler.push(`unbekannte Kategorie ${unbekannt.join(', ')} (erlaubt: ${KATEGORIEN.map(c => c.key).join(', ')})`);
const gleich = rezepte.find(r => (roh.url && r.url === roh.url) || r.title.toLowerCase() === roh.title.toLowerCase());
if (gleich) fehler.push(`Rezept ist schon in der Sammlung (${gleich.id})`);
// Weg 1 mit Lücke (nur die Personenzahl fehlt): Entwurf für Weg 2 anlegen, statt etwas zu schätzen
const nurLuecken = modus === 'link' && fehler.length && roh.title && roh.bildDatei && roh.steps.length &&
  fehler.every(f => /^Anzahl der Personen/.test(f));
if (nurLuecken) {
  const name = slug(roh.title), dir = path.join(ROOT, 'eingang', name);
  const entwurf = msg => { console.log(`ERGEBNIS: ENTWURF – ${msg}`); process.exit(3); };
  if (probe) entwurf(`Rezept unvollständig (${fehler.join(' · ')}). Nächster Schritt: denselben Befehl OHNE --probe ausführen, dann entsteht der Entwurf eingang/${name}. Nicht veröffentlichen.`);
  if (fs.existsSync(dir)) entwurf(`Entwurf eingang/${name} gibt es schon – dort ergänzen (${fehler.join(' · ')}). Nicht veröffentlichen.`);
  fs.mkdirSync(dir, { recursive: true });
  bildSpeichern(roh.bildDatei, name, path.join(dir, 'bild.jpg'));
  const zeilen = [
    `# Entwurf aus ${roh.url} (${new Date().toISOString().slice(0, 10)}).`,
    '# Bitte die Anzahl der Personen eintragen.',
    '# Danach im Cockpit: „Neues Rezept aus eingang/' + name + ' – eintragen und veröffentlichen“.', '',
    `Titel: ${roh.title}`, `Untertitel: ${roh.subtitle}`,
    `Personen: ${roh.portions || ''}${roh.portions ? '' : '   # FEHLT'}`,
    `Zeit: ${roh.time === 'Gesamtzeit nicht angegeben' ? '' : roh.time}`, `Kategorie: ${kats.join(', ')}`,
    `Quelle: ${roh.source}`, `Link: ${roh.url}`, `Autor: ${roh.author}`, 'Tipp: ', '', 'Zutaten:',
    ...roh.ingredients.map(i => i.h ? `${i.h}:` : `- ${i.t}`), '', 'Schritte:',
    ...roh.steps.map((s, k) => `${k + 1}. ${s}`), '',
  ];
  fs.writeFileSync(path.join(dir, 'rezept.txt'), zeilen.join('\n'));
  entwurf(`Entwurf mit Bild, Zutaten und Schritten liegt in eingang/${name}/rezept.txt. Fehlt: ${fehler.join(' · ')}. Ernesto füllt die Lücken, danach „Neues Rezept aus eingang/${name}“. Nicht veröffentlichen.`);
}
if (fehler.length) stop(`nichts eingetragen: ${fehler.join(' · ')}`, 2);

let id = slug(roh.title), n = 2;
while (rezepte.some(r => r.id === id)) id = `${slug(roh.title)}-${n++}`;
const eintrag = {
  id, title: roh.title, subtitle: roh.subtitle,
  image: bildSpeichern(roh.bildDatei, id),
  alt: `${roh.title}${roh.subtitle ? ' ' + roh.subtitle : ''}`,
  tags: kats.map(k => KATEGORIEN.find(c => c.key === k).label),
  categories: kats, portions: roh.portions, time: roh.time, timeShort: roh.timeShort,
  author: roh.author, source: roh.source, ...(roh.url ? { url: roh.url } : {}),
  ingredients: roh.ingredients, tip: roh.tip, steps: roh.steps, pdf: '',
  added: new Date().toISOString().slice(0, 10),
};

if (probe) { console.log(JSON.stringify(eintrag, null, 1)); console.log(`ERGEBNIS: Probe – würde ${id} eintragen (nichts geändert).`); process.exit(0); }
rezepte.push(eintrag);
fs.writeFileSync(DATA, JSON.stringify(rezepte, null, 1) + '\n');
if (roh.ordner) {
  const erledigt = path.join(ROOT, 'eingang', 'erledigt');
  fs.mkdirSync(erledigt, { recursive: true });
  fs.renameSync(roh.ordner, path.join(erledigt, `${eintrag.added}-${path.basename(roh.ordner)}`));
}
console.log(`ERGEBNIS: eingetragen – ${id} („${eintrag.title}“, ${eintrag.portions}, ${eintrag.ingredients.filter(i => i.t).length} Zutaten, ${eintrag.steps.length} Schritte, Kategorie ${kats.join('/')}). Jetzt prüfen und mit ./veroeffentlichen.sh veröffentlichen.`);
