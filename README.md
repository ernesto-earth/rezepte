# Rezepte – „Am Tisch“

Ernestos Rezeptsammlung als Website: **http://heger.earth/rezepte/**

Dieser Ordner ist die einzige Quelle des Projekts. Alles, was man zum Neuaufsetzen braucht, liegt hier.
Das GitHub-Repo `ernesto-earth/rezepte` ist ein Spiegel dieses Ordners (ohne die lokalen Teile, siehe unten)
und veröffentlicht die Seite automatisch. Es gibt keine Abhängigkeit zu Claude oder ChatGPT; bearbeitet und veröffentlicht wird über Hermes (E-024).

## Inhalt

| Pfad | Zweck | im Repo |
|---|---|---|
| `claude-seite/rezepte.json` | alle Rezepte (einzige Datenquelle der Seite) | ja |
| `claude-seite/img/` | Rezeptfotos | ja |
| `claude-seite/styles.css`, `site.js`, `fonts/` | Aussehen und Verhalten | ja |
| `claude-seite/build.mjs` | baut `claude-seite/dist/` und prüft jedes Rezept auf Vollständigkeit | ja |
| `.github/workflows/deploy.yml` | baut und lädt bei jedem Push nach heger.earth/rezepte hoch | ja |
| `README.md`, `STATUS.md` | diese Anleitung, aktueller Stand | ja |
| `pdf/` | Original-Rezept-PDFs aus den Zeitschriften | nein (nur lokal) |
| `rezept-sammlung/` | frühere ChatGPT-Site, nur noch Archiv | nein |
| `tmp/`, `work/` | Arbeitsdateien, Designentwürfe | nein |

Der Ordnername `claude-seite` ist historisch; er wird von Chief of Staff referenziert und bleibt vorerst so.

## Neues Rezept ergänzen

Neue Rezepte trägt Hermes ein und veröffentlicht sie (E-024/E-025). Es gibt zwei Wege, beide immer mit
Anzahl der Personen; Mengen werden übernommen, wie die Quelle sie angibt (fehlende bleiben leer):

- **Weg 1 – Link zu einer Rezeptseite:** Auftrag im Cockpit (heger.earth/cos, Projekt Rezepte, „ändern erlaubt“),
  z. B. „Neues Rezept: https://… – eintragen und veröffentlichen“. Hermes führt
  `node rezept-neu.mjs link "<URL>"` aus; das Skript liest Titel, Bild, Zutaten, Schritte, Personen und Zeit aus den
  Rezeptdaten der Seite (schema.org). Fehlt die Personenzahl auf der Seite, im Auftrag dazuschreiben („für 4 Personen“). Seiten ohne
  Rezeptdaten werden aus dem Text gelesen (Abschnitte „Zutaten“ und „Zubereitung“). Fehlt die Personenzahl,
  legt das Skript einen ausgefüllten Entwurf in `eingang/<name>/` an: dort die Personen eintragen, dann Weg 2.
- **Weg 2 – eigenes Bild mit Zutaten und Schritten:** Ordner `eingang/_vorlage` kopieren und umbenennen
  (z. B. `eingang/gulasch`), Foto hineinlegen, `rezept.txt` ausfüllen – geht auch am iPhone in der Dateien-App
  (iCloud Drive › Dokumente › a.5. Projekte › Rezepte › eingang). Dann Auftrag im Cockpit:
  „Neues Rezept aus eingang/gulasch – eintragen und veröffentlichen“. Hermes führt
  `node rezept-neu.mjs ordner eingang/gulasch` aus; der Ordner wandert danach nach `eingang/erledigt/`.

Fehlt etwas (Titel, Personen, Zutaten, Schritte, Bild), trägt das Skript nichts ein und nennt, was fehlt.
Vorschau ohne Änderung: `--probe`. Kategorie erzwingen: `--kategorie fleisch`.

Von Hand (ohne Skript), z. B. für Zeitschriftenrezepte mit PDF:

1. Original-PDF nach `pdf/`, Foto (verkleinert) nach `claude-seite/img/`.
2. Eintrag in `claude-seite/rezepte.json` anlegen (gleiche Felder wie die vorhandenen).
3. Optional lokal prüfen: im Ordner `claude-seite` `node build.mjs` ausführen, `dist/index.html` im Browser öffnen.
4. `STATUS.md` aktualisieren.
5. **Veröffentlichen:** im Projektordner `./veroeffentlichen.sh "Kurze Beschreibung"` ausführen
   (macht Hermes nach jedem Änderungsauftrag selbst, E-024). Das Skript baut, committet, pusht, wartet auf die
   GitHub Action und prüft die Seite; die letzte Zeile `ERGEBNIS:` sagt, ob alles geklappt hat.
   Ausweichweg von Hand: GitHub Desktop (Repository „rezepte“) → **Commit to main** → **Push origin**.
6. Nach ca. 1 Minute ist die Seite aktualisiert. Kontrolle auf github.com/ernesto-earth/rezepte unter
   **Actions**: grüner Haken = online, rotes X = Fehler (Log anklicken, siehe Fehlersuche).

## Rezepte auf der Seite bearbeiten (E-027)

Auf **http://heger.earth/rezepte/bearbeiten/** (Benutzer `ernesto`, Passwort aus dem Secret `REZEPTE_EDIT_PASSWORD`)
lassen sich alle Rezepte bearbeiten – Foto austauschen, Titel, Personen, Zeit, Kategorie, Zutaten mit Mengen,
Arbeitsschritte, Tipp – und neue Rezepte anlegen. Jedes Rezept hat unten den Link „Bearbeiten“.
Das Foto wird im Browser auf 800 px verkleinert (geht auch am iPhone).

Speichern schreibt direkt ins Repo (`claude-seite/rezepte.json`, `claude-seite/img/`) – ein Commit, der die
GitHub Action startet; nach etwa 1–2 Minuten ist die Seite aktualisiert. Der Projektordner holt die Änderung
automatisch beim nächsten `veroeffentlichen.sh` oder `rezept-neu.mjs` (nur Vorspulen, nie erzwingen).
Code: `bearbeiten/index.php` (PHP, läuft am Webspace), Zugangsdatei am Server außerhalb des Webordners
unter `rezepte-data/config.php` (schreibt das Deployment aus den Secrets).

## Neu aufsetzen (z. B. neuer Mac oder neues Repo)

1. Voraussetzungen: Git, Node.js ≥ 18 (nur für lokale Tests), GitHub-Konto `ernesto-earth`.
2. Repo anlegen bzw. klonen, Inhalt dieses Ordners hineinlegen, pushen.
3. **FTP-Zugang** im Domaintechnik Control Panel → Modul **FTP**: eigenen FTP-Benutzer nur fürs Deployment anlegen.
   Startordner = Hauptverzeichnis (dort liegen `www`, `logs`, `stats`) → keine weitere Einstellung.
   Startordner = `www` → Repo-Variable `FTP_WEBROOT` mit Wert `./` anlegen.
4. **Secrets** im Repo unter Settings → Secrets and variables → Actions: `FTP_SERVER` (`host28.ssl-net.net`),
   `FTP_USERNAME`, `FTP_PASSWORD`. Anderer Port als 21 → Variable `FTP_PORT`.
   Für das Bearbeiten auf der Seite zusätzlich `REZEPTE_EDIT_PASSWORD` (frei wählbar) und `REZEPTE_GITHUB_TOKEN`
   (fine-grained Token nur für das Repo `rezepte`, Contents: Read and write). Fehlen sie, wird nur die Seite veröffentlicht.
5. Actions → Deploy → **Run workflow**.

## Fehlersuche

- **Build rot:** Die Meldung nennt das Rezept und das fehlende Feld bzw. Bild.
- **Upload rot:** Servername, Port, Benutzer, Passwort prüfen (Secrets).
- **Prüfschritt rot, Upload grün:** Ordner landet woanders → `FTP_WEBROOT` anpassen; oder `.htaccess` leitet um.
- Am Server wird nie gelöscht. Entfernte Bilder bleiben liegen und müssen bei Bedarf im Dateimanager gelöscht werden.
- heger.earth hat derzeit kein gültiges SSL-Zertifikat, deshalb http.
