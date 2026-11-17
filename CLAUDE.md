# Rezepte „Am Tisch“ – Hinweise für Claude Code

Ernestos Rezeptsammlung, veröffentlicht auf **http://heger.earth/rezepte/** (kein gültiges SSL → http).
Antworten und Commit-Nachrichten auf Deutsch. Ausführliche Anleitung: `README.md`, Stand: `STATUS.md`.

## Wo die Rezepte liegen

- **Einzige Datenquelle:** `claude-seite/rezepte.json` – ein Array, ein Objekt pro Rezept.
- **Fotos:** `claude-seite/img/<id>.jpg` (verkleinert auf max. 800 px, JPEG).
- Kategorien sind in `claude-seite/site.js` in `const CAT = { 'schlüssel': ['Anzeigename', '#Farbe'], … }`
  definiert (derzeit: gemüse, fleisch, vegetarisch, fisch, süßspeisen, suppen). Neue Kategorie → dort ergänzen.
- Nur lokal beim Besitzer, **nicht im Repo**: `pdf/`, `eingang/`, `tmp/`, `work/`, `rezept-sammlung/`, `.hermes.md`.

Schnell nachschlagen:

```bash
node -e 'for (const r of require("./claude-seite/rezepte.json")) console.log(r.id, "|", r.title, "|", r.categories.join(","), "|", r.portions)'
```

## Aufbau eines Rezepts

```jsonc
{
  "id": "grenadiermarsch",            // Pflicht, eindeutig, klein, ohne Umlaute, mit Bindestrichen
  "title": "Grenadiermarsch",         // Pflicht
  "subtitle": "mit Kürbis, …",        // optional
  "image": "img/grenadiermarsch.jpg", // Pflicht, Datei muss existieren
  "alt": "Bildbeschreibung",
  "tags": ["Gemüse", "Fleisch", "Schnell"],
  "categories": ["gemüse", "fleisch"],// Pflicht, Schlüssel aus CAT in site.js
  "portions": "4 Portionen",          // Pflicht, muss eine Zahl enthalten (Basis fürs Umrechnen)
  "time": "30 Minuten", "timeShort": "30 Min.",
  "author": "",
  "source": "GUSTO, 24. September 2026, Seite 42", // Pflicht; Quelle vor dem ersten Komma erscheint im Seitenkopf
  "ingredients": [{ "h": "FÜR DIE SAUCE" }, { "t": "400 g Kürbis, gewürfelt" }], // h = Zwischenüberschrift, t = Zutat
  "steps": ["Schritt 1 …", "Schritt 2 …"], // Pflicht
  "tip": "optional",
  "pdf": "Rezepte/pdf/…pdf",          // optional, nur Verweis auf lokales PDF
  "url": "https://…", "added": "2026-11-06" // optional, bei Rezepten aus dem Web
}
```

Regeln: Mengen so übernehmen, wie die Quelle sie angibt (Zahl + Einheit am Zeilenanfang, z. B. `250 g …`, `½ TL …`,
damit das Umrechnen funktioniert); fehlende Mengen leer lassen, nichts erfinden. Personenzahl ist Pflicht.
Datei mit 2 Leerzeichen eingerückt und UTF-8 (typografische Zeichen wie „ “ ’ – bleiben erhalten).

## Prüfen

```bash
cd claude-seite && node build.mjs && rm -rf dist
```

Der Build bricht ab und nennt Rezept und Feld, wenn etwas fehlt (Pflichtfelder, Bild, Kategorie, Zahl in `portions`,
doppelte ID). Vorschau: `dist/index.html` vor dem Löschen im Browser öffnen (Playwright ist verfügbar).

## Neues Rezept

- **Aus einem Link:** `node rezept-neu.mjs link "<URL>" [--personen 4] [--kategorie fleisch] [--probe]`
  liest schema.org-Rezeptdaten, lädt und verkleinert das Bild (braucht `python3` mit Pillow, falls kein `sips`)
  und trägt in `rezepte.json` ein. Erst mit `--probe` ansehen. Das Skript versucht vorher `git merge --ff-only origin/main`.
- **Von Hand:** Eintrag in `rezepte.json` ergänzen, Bild nach `claude-seite/img/` (max. 800 px), Build prüfen.
- Danach `STATUS.md` kurz nachziehen (Tabelle oben; alte Werte unter „Belege“ erhalten, siehe Regeln dort).

## Veröffentlichen

Jeder Push auf `main`, der `claude-seite/**` ändert, löst `.github/workflows/deploy.yml` aus (Build → FTP-Upload →
Live-Prüfung über `version.json`). Nach 1–2 Minuten ist die Änderung auf heger.earth/rezepte.

- In Claude-Code-Cloud-Sitzungen wird auf dem zugewiesenen Arbeitszweig committet und gepusht; live geht es erst,
  wenn der Zweig in `main` gemergt ist (Pull Request nur auf Wunsch).
- `veroeffentlichen.sh` ist für den lokalen Projektordner (Hermes) gedacht und läuft nur auf `main`.
- Nie Zugangsdaten (FTP, `REZEPTE_*`-Secrets) ins Repo schreiben – das Repo ist öffentlich.
- Über heger.earth/rezepte/bearbeiten/ können parallel Änderungen direkt auf `main` landen: vor dem Arbeiten
  `git fetch origin main` und bei Bedarf übernehmen.
