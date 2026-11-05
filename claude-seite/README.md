# Am Tisch – Ernestos Rezepte (Quellen der Website)

**Seite:** http://heger.earth/rezepte/ (veröffentlicht über GitHub `ernesto-earth/rezepte`, siehe `../README.md`)

Bis 2026-11-05 lag die Seite als private Claude-Seite (claude.ai/artifact/1Wp1qiE4qZxpfx9jioABuo); diese wird
nicht mehr gepflegt. Davor gab es die ChatGPT-Site in `../rezept-sammlung/` (Archiv).

| Datei | Inhalt |
|---|---|
| `rezepte.json` | alle Rezepte: Titel, Kategorien, Portionen, Zeit, Quelle, Zutaten (mit Zwischenüberschriften), Schritte, Tipp, Original-PDF in `../pdf/` |
| `img/` | Rezeptfotos (verkleinert, aus den Zeitschriften) |
| `styles.css`, `site.js` | Aussehen und Verhalten (Suche, Kategorien, Portionen umrechnen, Zutaten abhaken, Kochmodus) |
| `fonts/` | Barlow Condensed (OFL), wird beim Build eingebettet |
| `build.mjs` | baut `dist/index.html` und kopiert die Bilder nach `dist/img/` |
| `dist/` | gebaute Seite (entsteht beim Build, nicht im Repo) |

Neues Rezept ergänzen: siehe `../README.md`.
