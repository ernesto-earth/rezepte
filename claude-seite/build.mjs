// Am Tisch – Ernestos Rezepte: Build der Claude-Seite.
// Daten: rezepte.json · Bilder: img/ · Aussehen: styles.css · Verhalten: site.js
// Ergebnis: dist/index.html (+ dist/img/). Aufruf im Ordner claude-seite: node build.mjs
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = f => fs.readFileSync(path.join(root, f), 'utf8');
const rezepte = JSON.parse(read('rezepte.json'));
const fontFile = path.join(root, 'fonts', 'barlow-condensed-latin-700-normal.woff2');
const font = fs.existsSync(fontFile)
  ? `@font-face{font-family:"Barlow Condensed";font-weight:700;font-display:swap;src:url(data:font/woff2;base64,${fs.readFileSync(fontFile).toString('base64')}) format("woff2");}`
  : '';
const css = read('styles.css').replace('/*FONT*/', font);
const js = read('site.js');

// Prüfungen: jedes Rezept vollständig, jedes Bild vorhanden
const fehler = [];
for (const r of rezepte) {
  for (const k of ['id', 'title', 'image', 'portions', 'source']) if (!r[k]) fehler.push(`${r.id}: ${k} fehlt`);
  if (!r.ingredients?.length) fehler.push(`${r.id}: keine Zutaten`);
  if (!r.steps?.length) fehler.push(`${r.id}: keine Schritte`);
  if (!fs.existsSync(path.join(root, r.image))) fehler.push(`${r.id}: Bild ${r.image} fehlt`);
}
if (new Set(rezepte.map(r => r.id)).size !== rezepte.length) fehler.push('doppelte Rezept-ID');
if (fehler.length) { console.error('Build abgebrochen:\n- ' + fehler.join('\n- ')); process.exit(1); }

const data = JSON.stringify(rezepte).replace(/</g, '\\u003c');
const html = `<!doctype html>
<html lang="de">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="description" content="Am Tisch – Ernestos Rezeptsammlung: ${rezepte.length} Rezepte zum Suchen, Umrechnen und Nachkochen.">
<meta name="theme-color" content="#1E1A17">
<title>Am Tisch – Ernestos Rezepte</title>
<style>${css}</style>
</head>
<body>
<header class="topbar"><div class="topbar-inner">
  <a class="brand" href="#rezepte">AM TISCH <span>REZEPTE</span></a>
  <nav class="topnav" aria-label="Hauptnavigation"><a href="#rezepte" data-nav="rezepte">Alle Rezepte</a><a href="#sammlung" data-nav="sammlung" class="wide">Über die Sammlung</a></nav>
  <span class="meta">${rezepte.length} Rezepte · aus GUSTO und Men’s Health</span>
</div></header>
<div id="app"></div>
<footer class="foot"><span>Am Tisch · Ernestos Rezeptsammlung</span><span>Rezepte aus den genannten Zeitschriften, nur für den privaten Gebrauch</span></footer>
<script>window.REZEPTE=${data};</script>
<script>${js}</script>
</body>
</html>`;

fs.mkdirSync(path.join(root, 'dist', 'img'), { recursive: true });
fs.writeFileSync(path.join(root, 'dist', 'index.html'), html);
for (const r of rezepte) fs.copyFileSync(path.join(root, r.image), path.join(root, 'dist', r.image));
console.log(`Built dist/index.html (${html.length} bytes, ${rezepte.length} Rezepte)`);
