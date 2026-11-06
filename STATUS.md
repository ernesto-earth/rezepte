# Projektstatus – Rezepte

Alleinige aktuelle Statusquelle dieses registrierten Projekts. Historische Abnahmen und Übergaben sind Belege, keine konkurrierenden Statusquellen.

| Feld | Wert |
|---|---|
| Projekt | Rezepte |
| Arbeitsstatus | aktiv; Website auf heger.earth/rezepte, Projektordner ist einzige Quelle (Grundsätze 2026-11-05), Design „Am Tisch“ |
| Letzte Statusaktualisierung | 2026-11-06T09:44:53+01:00 |
| Zuletzt erledigt | 2026-11-06 (Hermes): In CAT ausschließlich Suppen-Farbe von #7C3AED auf #CA8A04 geändert. Vorbereitete lum/ink-Funktionen sowie styles.css und bearbeiten/index.php unverändert belassen; Vergleich mit Ausgangsstand erfolgreich. Build erfolgreich, Veröffentlichung noch ausstehend. |
| Nächster Schritt | Mit ./veroeffentlichen.sh "Helle Kategoriefarben möglich, Suppen in dunklerem Gelb" veröffentlichen, einschließlich vorbereiteter Begleitänderungen. |
| Offene Entscheidung | keine zur Seite (Repo bleibt bewusst öffentlich, Entscheidung Ernesto 2026-11-05). Alte Claude-Seite und ChatGPT-Site kann Ernesto löschen. |
| Inhaltsstand | Zehn Rezepte (Anzahl am 2026-11-06 aus rezepte.json geprüft). Kategorie Gemüse statt Kürbis bei grenadiermarsch, tartiflette und kuerbiseintopf; Rezeptinhalte bei diesem Auftrag unverändert. Datensatz rindsuppe-hausgemacht heißt im aktuellen Quellenstand „Alt Wiener Suppentopf“ (bereits vor diesem Auftrag geändert). Quellen in claude-seite/ (rezepte.json einzige Datenquelle); Original-PDFs nur lokal in pdf/; frühere ChatGPT-Site als Archiv in rezept-sammlung/. |
| Prüfstand | 2026-11-06, 09:44 CET: node build.mjs erfolgreich (10 Rezepte, 77753 Bytes). Automatischer Vergleich bestätigt: site.js nur am Suppen-Farbwert geändert; styles.css, bearbeiten/index.php und rezepte.json gegenüber Auftragsbeginn unverändert. Keine visuelle Browser- oder angemeldete Funktionsprüfung ausgeführt. |
| Site-Stand | Kategorie Gemüse veröffentlicht: Action 42189124241 success, Hauptseite HTTP 200. Ausgelieferter Rohtext per curl auf neuen CAT-Eintrag und Abwesenheit des alten Kategorie-Schlüssels geprüft. |
| Site-Projekt-ID | GitHub ernesto-earth/rezepte (früher Claude-Seite 04298b04-31eb-4806-9ab5-368ee10d4bc6, davor ChatGPT appgprj_6aca2bc3d290819192c96834537f4ee8) |
| Site-Version | Commit de1d897, Action 42189124241 success (laut Veröffentlichungsskript); abschließende Statuspflege nach diesem Commit nur lokal. |
| Site-URL | http://heger.earth/rezepte/ (Link auch als .webloc im Ordner) |
| Zuletzt aktualisiert durch | Hermes, im Auftrag Ernestos am 2026-11-06 (Suppen-Farbe geändert und Build geprüft) |

## Lokale Belege

2026-11-06, Suppen-Farbe: ausschließlich CAT-Farbwert #7C3AED → #CA8A04 in site.js geändert. Baseline-Vergleich bestätigt Erhalt aller sonstigen site.js-Inhalte einschließlich vorbereiteter lum/ink-Funktionen sowie unveränderte styles.css, bearbeiten/index.php und Rezeptdaten. Build erfolgreich (10 Rezepte, 77753 Bytes). Vorbereitete Begleitänderungen gemäß Auftrag mit veröffentlichen; Erfolg erst nach Skriptergebnis dokumentieren.

Abschluss Kategorie Gemüse: `ERGEBNIS: veröffentlicht – Commit de1d897, Action-Lauf 42189124241: success, http://heger.earth/rezepte/ HTTP 200`. Skript übernahm STATUS.md, rezepte.json, site.js und die bereits angepasste rezept-neu.mjs. Danach curl-Prüfung des Live-Rohtexts erfolgreich: CAT Gemüse mit #C2410C vorhanden, alter Kategorie-Schlüssel nicht vorhanden. Diese abschließende Statuspflege liegt nur lokal; kein weiterer git-Befehl oder Veröffentlichungsaufruf.

2026-11-06, Kategorie umbenannt: site.js CAT und die categories/tags von grenadiermarsch, tartiflette, kuerbiseintopf angepasst. Automatischer Vergleich mit gesichertem Ausgangsstand bestätigt: keine weiteren Änderungen an Rezeptdaten oder site.js; Farbe #C2410C bleibt. Keine verbleibende Kategorie kürbis in den aktiven Code-/Datendateien gefunden. `node build.mjs` erfolgreich, 10 Rezepte. Veröffentlichung separat über das beauftragte Skript; vor diesem Schritt ist der neue Inhalt nur lokal geprüft, nicht veröffentlicht.

2026-11-06, Kategorien-Erweiterung: `./veroeffentlichen.sh "Bearbeiten-Seite: neue Kategorien anlegen"` erfolgreich. `ERGEBNIS: veröffentlicht – Commit eb36556, Action-Lauf 42188467544: success, http://heger.earth/rezepte/ HTTP 200`. Anschließend `curl` ohne Zugangsdaten auf http://heger.earth/rezepte/bearbeiten/: HTTP 401. Keine weiteren git-Befehle, nichts erzwungen. Inhalt bleibt bei 10 Rezepten; angemeldete Kategorienanlage nicht geprüft.

Erfolgreiche Veröffentlichung E-027, 2026-11-06: `./veroeffentlichen.sh "STATUS nachgezogen, Bearbeiten-Seite (E-027) veröffentlichen"` lieferte `ERGEBNIS: veröffentlicht – Commit a25b908, Action-Lauf 42184331878: success, http://heger.earth/rezepte/ HTTP 200`. Anschließend curl ohne Passwort: Rohtext der Hauptseite enthält `<a href="bearbeiten/">Rezepte bearbeiten oder neu anlegen</a>` und rezeptbezogene Bearbeiten-Links innerhalb des eingebetteten JavaScripts; Bearbeiten-Seite HTTP 401. Keine weiteren git-Befehle, nichts erzwungen. Dieser erfolgreiche Versuch ersetzt den früheren Push-Blocker; historische Fehlversuche bleiben unten erhalten.

Veröffentlichungsversuch E-027, 2026-11-06: `./veroeffentlichen.sh "Rezepte auf der Seite bearbeiten (E-027), Veröffentlichungsskript verbessert"` genau einmal ausgeführt. Build erfolgreich, Commit 3c31d6f erstellt. `ERGEBNIS: FEHLER – Push abgelehnt`: GitHub verweigert das Aktualisieren von `.github/workflows/deploy.yml` mit dem verwendeten Personal Access Token ohne `workflow`-Scope (`refusing to allow a Personal Access Token to create or update workflow`). Exit 1, Commit bleibt lokal; keine Action für diesen neuen Commit gestartet, deshalb keine Action-Fehlermeldung vorhanden. Kein anderer git-Befehl, kein Erzwingen, keine Wiederholung. Anschließend nur lesend mit curl geprüft: http://heger.earth/rezepte/ HTTP 200, „Rindsuppe hausgemacht“ vorhanden, HTML-Link mit „bearbeiten/“ nicht vorhanden; http://heger.earth/rezepte/bearbeiten/ ohne Passwort HTTP 404 statt 401. Abschließende STATUS.md-Pflege nach Commit nur lokal.

Veröffentlichungsversuch 2026-11-06: `./veroeffentlichen.sh "Rezept Rindsuppe ergänzt, Rezeptwerkzeug und Seite verbessert"` genau einmal ausgeführt. Build erfolgreich, alle vom Skript erfassten offenen Änderungen committet, Commit fe7e6b4 erfolgreich gepusht. Danach Abbruch: `./veroeffentlichen.sh: line 90: $3: unbound variable` (Exit 1); keine abschließende ERGEBNIS-Zeile. Keine weiteren git-Befehle, kein Erzwingen, keine Skriptänderung oder Wiederholung. Nur lesend nachgeprüft: GitHub-Action 42181559854 für den exakten Commit in_progress; Seite HTTP 200, ID rindsuppe-hausgemacht noch nicht enthalten. Diese nachträgliche Statuspflege ist lokal und nicht Bestandteil des bereits gepushten Commits.

Aktueller Arbeitsnachtrag 2026-11-06, 08:32 CET: Aktualisierte .hermes.md gelesen. Nach Ernestos Entscheidung bleiben fehlende Mengen unverändert; keine Angaben ergänzt. `node rezept-neu.mjs ordner eingang/rindsuppe-hausgemacht --probe` erfolgreich, anschließend derselbe Befehl ohne `--probe`: `ERGEBNIS: eingetragen – rindsuppe-hausgemacht („Rindsuppe hausgemacht“, 4 Personen, 10 Zutaten, 6 Schritte, Kategorie fleisch). Jetzt prüfen und mit ./veroeffentlichen.sh veröffentlichen.` Datensatz und Gesamtanzahl zurückgelesen, Build erfolgreich. Dieser Nachtrag ersetzt den früheren nächsten Schritt zur Mengenergänzung.

Aktueller Arbeitsnachtrag 2026-11-06: `node rezept-neu.mjs link "https://www.steirische-spezialitaeten.at/rezepte/rindsuppe.html"` ohne `--probe` ausgeführt. Ergebnis `ERGEBNIS: ENTWURF`: lokaler Entwurf mit Bild, Zutaten und Schritten in `eingang/rindsuppe-hausgemacht/`. Fehlende Mengen: Petersilstängel ((wer hat auch Liebstöckelzweige)), Lorbeerblätter, Wacholderbeeren, Pfefferkörner. Vollständige `rezept.txt` zurückgelesen; nichts geschätzt oder ergänzt, kein Rezept eingetragen. Build nicht ausgeführt (nur Entwurf); keine Veröffentlichung. Damit ist der Link-Abruf für diesen Entwurf tatsächlich getestet; die älteren Angaben unter „Zuletzt erledigt“ bleiben historisch.

- `pdf/` (einziger Ablageort der Original-Rezept-PDFs)
- `README.md`, `.github/workflows/deploy.yml`
- `claude-seite/README.md`, `claude-seite/rezepte.json`, `claude-seite/dist/index.html`
- `rezept-sammlung/.openai/hosting.json`
- `rezept-sammlung/COS-SITE-2-Quellen.json`
- `rezept-sammlung/COS-SITE-2-Uebergabe.md`
- `rezept-sammlung/COS-SITE-2-Pruefung/browser-results.json`
- `rezept-sammlung/check_site.py`
- `../Chief of Staff/INBOX.md`

Die Übergabe beschreibt ausdrücklich den früheren Zustand vor Veröffentlichung und vor Inbox-Abschluss. Die aktuelle Inbox bestätigt nur den lokalen Abschluss, nicht Site-Version oder Live-Inhalt. Nutzerangaben sind als solche erhalten, nicht als lokal verifiziert ausgegeben.

Nachtrag 2026-11-03: Ernesto bestätigt Veröffentlichung als Version 5 unter der genannten URL sowie die Klärung der Veröffentlichungsrechte. Die ältere Übergabe bleibt unverändert als historischer Beleg des Zustands davor. Aufträge laufen seit E-007 über Chief of Staff 2; die alte INBOX.md ist eingefroren.
