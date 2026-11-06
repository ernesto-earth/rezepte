# Projektstatus – Rezepte

Alleinige aktuelle Statusquelle dieses registrierten Projekts. Historische Abnahmen und Übergaben sind Belege, keine konkurrierenden Statusquellen.

| Feld | Wert |
|---|---|
| Projekt | Rezepte |
| Arbeitsstatus | aktiv; Website auf heger.earth/rezepte, Projektordner ist einzige Quelle (Grundsätze 2026-11-05), Design „Am Tisch“ |
| Letzte Statusaktualisierung | 2026-11-06T08:59:50+01:00 |
| Zuletzt erledigt | 2026-11-06 (Hermes): Nach Ernestos Token-Rechteergänzung Veröffentlichungsskript ausgeführt: Commit a25b908 erfolgreich gepusht, einschließlich wartendem E-027-Commit 3c31d6f; Action 42184331878 success, Hauptseite HTTP 200. Mit curl bestätigt: ausgeliefertes HTML enthält Bearbeiten-Links in den eingebetteten JavaScript-Vorlagen; Bearbeiten-Seite ohne Passwort HTTP 401. Keine Zugangsdaten verwendet und keine Rezepte geändert. |
| Nächster Schritt | Inhaltliche Durchsicht und angemeldeter Funktionstest der Bearbeiten-Seite durch Ernesto offen; nicht Teil der curl-Prüfung. Statusnachzug mit ./veroeffentlichen.sh "STATUS nach Veröffentlichung" ist beauftragt; dessen Ergebnis wird im Abschlussbericht ausgewiesen. |
| Offene Entscheidung | keine zur Seite (Repo bleibt bewusst öffentlich, Entscheidung Ernesto 2026-11-05). Alte Claude-Seite und ChatGPT-Site kann Ernesto löschen. |
| Inhaltsstand | Zehn Rezepte (Anzahl am 2026-11-06 aus rezepte.json geprüft), einschließlich Rindsuppe hausgemacht für 4 Personen mit 10 Zutaten und 6 Schritten. Fehlende Mengen gemäß Quelle unverändert übernommen (Entscheidung Ernesto). Quellen in claude-seite/ (rezepte.json einzige Datenquelle); Original-PDFs nur lokal in pdf/; frühere ChatGPT-Site als Archiv in rezept-sammlung/. |
| Prüfstand | 2026-11-06: Build erfolgreich (10 Rezepte, 76422 Bytes), Action 42184331878 success. curl ohne Zugangsdaten: Hauptseite HTTP 200, enthält href="bearbeiten/" und href="bearbeiten/?id=…" in eingebetteten JavaScript-Vorlagen; /rezepte/bearbeiten/ HTTP 401. Ein reiner HTMLParser findet diese dynamischen Links nicht als statische Anker; Rohtext und Kontext per curl geprüft. Kein angemeldeter Bearbeitungs-/Speichertest, keine visuelle Browserprüfung. |
| Site-Stand | E-027 veröffentlicht und Zugriffsschutz ohne Passwort bestätigt: Hauptseite HTTP 200 mit Bearbeiten-Linkvorlagen, Bearbeiten-Seite HTTP 401. Action 42184331878 erfolgreich. |
| Site-Projekt-ID | GitHub ernesto-earth/rezepte (früher Claude-Seite 04298b04-31eb-4806-9ab5-368ee10d4bc6, davor ChatGPT appgprj_6aca2bc3d290819192c96834537f4ee8) |
| Site-Version | Commit a25b908, erfolgreicher Deploy in Action 42184331878 (laut Veröffentlichungsskript); enthält E-027 aus Commit 3c31d6f. |
| Site-URL | http://heger.earth/rezepte/ (Link auch als .webloc im Ordner) |
| Zuletzt aktualisiert durch | Hermes, im Auftrag Ernestos am 2026-11-06 (E-027 erfolgreich veröffentlicht, curl-Prüfungen dokumentiert) |

## Lokale Belege

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
