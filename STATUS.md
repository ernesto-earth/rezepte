# Projektstatus – Rezepte

Alleinige aktuelle Statusquelle dieses registrierten Projekts. Historische Abnahmen und Übergaben sind Belege, keine konkurrierenden Statusquellen.

| Feld | Wert |
|---|---|
| Projekt | Rezepte |
| Arbeitsstatus | aktiv; Website auf heger.earth/rezepte, Projektordner ist einzige Quelle (Grundsätze 2026-11-05), Design „Am Tisch“ |
| Letzte Statusaktualisierung | 2026-11-06T08:51:15+01:00 |
| Zuletzt erledigt | 2026-11-06 (Hermes): Aktualisierte .hermes.md einschließlich E-027 gelesen; Veröffentlichungsskript einmal mit beauftragter Beschreibung ausgeführt. Build erfolgreich (10 Rezepte, 76422 Bytes), offene Änderungen in Commit 3c31d6f übernommen. Push wegen fehlendem workflow-Scope des Personal Access Tokens abgelehnt; kein Deploy dieses Commits. Drei beauftragte curl-Prüfungen ausgeführt: Rindsuppe vorhanden, Bearbeiten-Link fehlt, Bearbeiten-Seite HTTP 404 statt 401. Zuvor lokal E-027 und verbessertes Veröffentlichungsskript vorbereitet (Claude); frühere Rindsuppe-Import- und Veröffentlichungsversuche siehe Belege. |
| Nächster Schritt | Ernesto klärt die GitHub-Berechtigung zum Aktualisieren von .github/workflows/deploy.yml (Token benötigt workflow-Scope). Danach separater Auftrag zur Veröffentlichung und erneuten Prüfung von Bearbeiten-Link und HTTP 401. Secrets REZEPTE_EDIT_PASSWORD und REZEPTE_GITHUB_TOKEN laut vorherigem Status noch einzurichten; aktueller Secret-Stand unbekannt. |
| Offene Entscheidung | keine zur Seite (Repo bleibt bewusst öffentlich, Entscheidung Ernesto 2026-11-05). Alte Claude-Seite und ChatGPT-Site kann Ernesto löschen. |
| Inhaltsstand | Zehn Rezepte (Anzahl am 2026-11-06 aus rezepte.json geprüft), einschließlich Rindsuppe hausgemacht für 4 Personen mit 10 Zutaten und 6 Schritten. Fehlende Mengen gemäß Quelle unverändert übernommen (Entscheidung Ernesto). Quellen in claude-seite/ (rezepte.json einzige Datenquelle); Original-PDFs nur lokal in pdf/; frühere ChatGPT-Site als Archiv in rezept-sammlung/. |
| Prüfstand | 2026-11-06, 08:51 CET: Build erfolgreich (10 Rezepte, 76422 Bytes); Rezeptanzahl lokal zurückgelesen. Push abgelehnt, keine neue Action dieses Commits. curl ohne Zugangsdaten: Hauptseite HTTP 200; Text „Rindsuppe hausgemacht“ vorhanden; kein HTML-Link mit bearbeiten/; /rezepte/bearbeiten/ HTTP 404 (erwartet 401). Inhaltliche Durchsicht durch Ernesto offen. |
| Site-Stand | Rindsuppe auf der öffentlichen Hauptseite per curl bestätigt (HTTP 200). E-027 nicht veröffentlicht: Bearbeiten-Link fehlt, Bearbeiten-Seite HTTP 404. Neuer Commit 3c31d6f nur lokal; Push abgelehnt. |
| Site-Projekt-ID | GitHub ernesto-earth/rezepte (früher Claude-Seite 04298b04-31eb-4806-9ab5-368ee10d4bc6, davor ChatGPT appgprj_6aca2bc3d290819192c96834537f4ee8) |
| Site-Version | Exakte aktuell ausgelieferte Commit-Version unbekannt; Rindsuppe live bestätigt. Letzter zuvor gepushter Commit fe7e6b4064a6411400d05afcbe148e02ff71b46f. Neuer Commit 3c31d6f nur lokal, nicht gepusht. |
| Site-URL | http://heger.earth/rezepte/ (Link auch als .webloc im Ordner) |
| Zuletzt aktualisiert durch | Hermes, im Auftrag Ernestos am 2026-11-06 (E-027: Push-Fehler und curl-Prüfungen dokumentiert; abschließende Statuspflege nur lokal, nach Commit 3c31d6f) |

## Lokale Belege

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
