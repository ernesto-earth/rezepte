# Rezepte „Am Tisch“ – Hinweise für Claude Code

Ernestos Rezeptsammlung, veröffentlicht auf **http://heger.earth/rezepte/** (kein gültiges SSL → http).
Antworten und Commit-Nachrichten auf Deutsch. Ausführliche Anleitung: `README.md`, Stand: `STATUS.md`.

**Öffentlich, ohne Passwort – endgültig (E-036, Ernesto 2026-11-18):** Das Repo `ernesto-earth/rezepte` bleibt public,
die Rezeptseite (Prod und Vorprod) ist ohne Passwort lesbar. Nicht auf privat stellen, keinen Passwortschutz und keine
solche Rückfrage vorschlagen. Deshalb kommt nur Veröffentlichbares ins Repo (siehe unten); Original-PDFs aus
Zeitschriften und Eingangsmaterial bleiben draußen. Die Bearbeiten-Seite behält ihr eigenes Passwort (E-027).

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

Push auf `main` mit Änderungen an `claude-seite/**` oder `bearbeiten/**` löst `.github/workflows/deploy.yml` aus und
geht auf **Vorprod** (http://heger.earth/vorprod/rezepte/). Live (http://heger.earth/rezepte/) geht es erst mit der
Freigabe nach `prod`.

- `veroeffentlichen.sh` läuft im Projektordner auf `main` (Hermes und von Hand).
- Nie Zugangsdaten (FTP, `REZEPTE_*`-Secrets) ins Repo schreiben – das Repo ist öffentlich.
- Über heger.earth/rezepte/bearbeiten/ landen Änderungen direkt auf `main`; war `main` gleich `prod`, wird `prod`
  mit vorgespult und die Bearbeitung ist sofort live (E-035 Punkt 7). Deshalb vor dem Arbeiten immer
  `git pull --rebase`.

## Git, Vorprod und Prod (E-035, gilt für Claude und Hermes gleich)

Beschluss: `ENTSCHEIDUNGEN.md` im Repo `ernesto-earth/chief-of-staff`, E-035.

- **Einzige Quelle ist dieses Repo.** Was nicht gepusht ist, zählt nicht – auch keine iCloud-Stände.
- **Nur zwei Branches:** `main` (Arbeitsstand, deployt nach `heger.earth/vorprod/<seite>/`) und `prod` (live,
  deployt auf die heutige Adresse). **Keine eigenen Branches** – auch nicht für Claude, auch nicht in
  Cloud-Sitzungen. Kein Force-Push, kein Umschreiben der Historie.
- **Arbeitsablauf:** vor Beginn Arbeitskopie sauber, dann `git pull --rebase`; kleine, fertige Commits mit
  bestandenem Build/Test; sofort auf `main` pushen. Push abgelehnt → `git pull --rebase`, Prüfung wiederholen,
  erneut pushen. Konflikt → abbrechen, nichts erzwingen, Ernesto melden. Nichts Unkommittiertes zurücklassen.
- **Freigabe nach Prod nur auf ausdrückliche Anweisung von Ernesto** (bzw. im freigegebenen Hermes-Auftrag):
  genau den auf Vorprod geprüften Commit vorspulen – `./veroeffentlichen.sh --freigeben <commit>` oder
  `git push origin <commit>:prod`. `prod` nie direkt bearbeiten; Fehler auf `main` korrigieren und neu freigeben.
- Am Mac Studio teilen sich Claude und Hermes die Arbeitskopie in `a.5. Projekte/`: nicht arbeiten, solange ein
  Hermes-Lauf das Projekt beansprucht. Vom MacBook aus wird in `a.5. Projekte/` nichts geschrieben.
- Nie Zugangsdaten, Tokens oder Laufzeitdatenbanken ins Repo.
