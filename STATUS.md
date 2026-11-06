# Projektstatus – Rezepte

Alleinige aktuelle Statusquelle dieses registrierten Projekts. Historische Abnahmen und Übergaben sind Belege, keine konkurrierenden Statusquellen.

| Feld | Wert |
|---|---|
| Projekt | Rezepte |
| Arbeitsstatus | aktiv; Website auf heger.earth/rezepte, Projektordner ist einzige Quelle (Grundsätze 2026-11-05), Design „Am Tisch“ |
| Letzte Statusaktualisierung | 2026-11-06T08:32:11+01:00 |
| Zuletzt erledigt | 2026-11-06: Zwei Wege für neue Rezepte (E-025): `rezept-neu.mjs` (Link zu Rezeptseite oder Ordner `eingang/<name>` mit Foto und rezept.txt; Pflicht Personen und Mengen), Vorlage `eingang/_vorlage`, `.hermes.md` und README ergänzt; `build.mjs` prüft Kategorien/Personen und erzeugt die Quellenzeile; Seite verlinkt Netzquellen. Beide Wege in einer Kopie getestet (auch Fehlerfälle), Build fehlerfrei; Link-Abruf aus dem Internet noch nicht getestet. Noch nicht veröffentlicht. Davor 2026-11-06: Projekt auf Hermes umgestellt (E-024): `veroeffentlichen.sh` (Build, Commit, Push, Action- und Seitenprüfung), `.hermes.md` mit Arbeitsablauf, README angepasst; Build lokal geprüft. Noch nicht über Hermes veröffentlicht. Davor 2026-11-05: Projektordner ist einzige Quelle: README.md (Neuaufsetzen, Deploy), .gitignore, Workflow baut aus claude-seite/ und lädt nach heger.earth/rezepte; Ordner mit Repo ernesto-earth/rezepte verbunden; Deploy-Lauf 42085257922 erfolgreich. Davor 2026-11-04: Seite „Am Tisch“ neu gebaut. |
| Nächster Schritt | Mit ./veroeffentlichen.sh "Rezept Rindsuppe ergänzt, Rezeptwerkzeug und Seite verbessert" veröffentlichen; Ergebnis anschließend dokumentieren. |
| Offene Entscheidung | keine zur Seite (Repo bleibt bewusst öffentlich, Entscheidung Ernesto 2026-11-05). Alte Claude-Seite und ChatGPT-Site kann Ernesto löschen. |
| Inhaltsstand | Zehn Rezepte (Anzahl am 2026-11-06 aus rezepte.json geprüft), einschließlich Rindsuppe hausgemacht für 4 Personen mit 10 Zutaten und 6 Schritten. Fehlende Mengen gemäß Quelle unverändert übernommen (Entscheidung Ernesto). Quellen in claude-seite/ (rezepte.json einzige Datenquelle); Original-PDFs nur lokal in pdf/; frühere ChatGPT-Site als Archiv in rezept-sammlung/. |
| Prüfstand | 2026-11-06: Ordnerimport zuerst mit --probe erfolgreich geprüft, danach eingetragen und Datensatz zurückgelesen. node build.mjs erfolgreich: 10 Rezepte, dist/index.html 76269 Bytes. Veröffentlichung dieses Inhalts noch ausstehend. Inhaltliche Durchsicht durch Ernesto offen. |
| Site-Stand | veröffentlicht unter http://heger.earth/rezepte/ (GitHub Action, Lauf vom 2026-11-05 18:32 UTC, Prüfschritt HTTP 200). Frühere Claude-Seite und ChatGPT-Site werden nicht mehr gepflegt. |
| Site-Projekt-ID | GitHub ernesto-earth/rezepte (früher Claude-Seite 04298b04-31eb-4806-9ab5-368ee10d4bc6, davor ChatGPT appgprj_6aca2bc3d290819192c96834537f4ee8) |
| Site-Version | Commit 9c6f7e6 und Nachfolger in ernesto-earth/rezepte (main) |
| Site-URL | http://heger.earth/rezepte/ (Link auch als .webloc im Ordner) |
| Zuletzt aktualisiert durch | Hermes, im Auftrag Ernestos am 2026-11-06 (Rindsuppe eingetragen, Veröffentlichung vorbereitet) |

## Lokale Belege

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
