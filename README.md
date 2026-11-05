# Rezepte – „Am Tisch“

Ernestos Rezeptsammlung als Website: **http://heger.earth/rezepte/**

Dieser Ordner ist die einzige Quelle des Projekts. Alles, was man zum Neuaufsetzen braucht, liegt hier.
Das GitHub-Repo `ernesto-earth/rezepte` ist ein Spiegel dieses Ordners (ohne die lokalen Teile, siehe unten)
und veröffentlicht die Seite automatisch. Es gibt keine Abhängigkeit zu Claude oder ChatGPT.

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

1. Original-PDF nach `pdf/`, Foto (verkleinert) nach `claude-seite/img/`.
2. Eintrag in `claude-seite/rezepte.json` anlegen (gleiche Felder wie die vorhandenen).
3. Optional lokal prüfen: im Ordner `claude-seite` `node build.mjs` ausführen, `dist/index.html` im Browser öffnen.
4. Committen und pushen. Die Action baut und veröffentlicht; ein grüner Haken unter **Actions** heißt: online.
5. `STATUS.md` aktualisieren.

## Neu aufsetzen (z. B. neuer Mac oder neues Repo)

1. Voraussetzungen: Git, Node.js ≥ 18 (nur für lokale Tests), GitHub-Konto `ernesto-earth`.
2. Repo anlegen bzw. klonen, Inhalt dieses Ordners hineinlegen, pushen.
3. **FTP-Zugang** im Domaintechnik Control Panel → Modul **FTP**: eigenen FTP-Benutzer nur fürs Deployment anlegen.
   Startordner = Hauptverzeichnis (dort liegen `www`, `logs`, `stats`) → keine weitere Einstellung.
   Startordner = `www` → Repo-Variable `FTP_WEBROOT` mit Wert `./` anlegen.
4. **Secrets** im Repo unter Settings → Secrets and variables → Actions: `FTP_SERVER` (`host28.ssl-net.net`),
   `FTP_USERNAME`, `FTP_PASSWORD`. Anderer Port als 21 → Variable `FTP_PORT`.
5. Actions → Deploy → **Run workflow**.

## Fehlersuche

- **Build rot:** Die Meldung nennt das Rezept und das fehlende Feld bzw. Bild.
- **Upload rot:** Servername, Port, Benutzer, Passwort prüfen (Secrets).
- **Prüfschritt rot, Upload grün:** Ordner landet woanders → `FTP_WEBROOT` anpassen; oder `.htaccess` leitet um.
- Am Server wird nie gelöscht. Entfernte Bilder bleiben liegen und müssen bei Bedarf im Dateimanager gelöscht werden.
- heger.earth hat derzeit kein gültiges SSL-Zertifikat, deshalb http.
