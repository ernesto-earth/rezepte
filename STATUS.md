# Projektstatus – Rezepte

Alleinige aktuelle Statusquelle dieses registrierten Projekts. Historische Abnahmen und Übergaben sind Belege, keine konkurrierenden Statusquellen.

| Feld | Wert |
|---|---|
| Projekt | Rezepte |
| Arbeitsstatus | aktiv; Website auf heger.earth/rezepte, Projektordner ist einzige Quelle (Grundsätze 2026-11-05), Design „Am Tisch“ |
| Letzte Statusaktualisierung | 2026-11-05T19:40:00+01:00 |
| Zuletzt erledigt | 2026-11-05: Projektordner ist einzige Quelle: README.md (Neuaufsetzen, Deploy), .gitignore, Workflow baut aus claude-seite/ und lädt nach heger.earth/rezepte; Ordner mit Repo ernesto-earth/rezepte verbunden; Deploy-Lauf 42085257922 erfolgreich. Davor 2026-11-04: Seite „Am Tisch“ neu gebaut. |
| Nächster Schritt | Neue Rezepte selbst veröffentlichen: siehe README.md (GitHub Desktop: Commit, Push). |
| Offene Entscheidung | keine zur Seite (Repo bleibt bewusst öffentlich, Entscheidung Ernesto 2026-11-05). Alte Claude-Seite und ChatGPT-Site kann Ernesto löschen. |
| Inhaltsstand | Neun Rezepte; Quellen in claude-seite/ (rezepte.json einzige Datenquelle, 9 Fotos, build.mjs); Original-PDFs nur lokal in pdf/; frühere ChatGPT-Site als Archiv in rezept-sammlung/. |
| Prüfstand | 2026-11-05: Build aus dem Projektordner byte-identisch mit der bisherigen Seite; GitHub Action: Build, Upload und Erreichbarkeitsprüfung (HTTP 200 auf http://heger.earth/rezepte/) erfolgreich. Inhaltliche Durchsicht durch Ernesto offen. |
| Site-Stand | veröffentlicht unter http://heger.earth/rezepte/ (GitHub Action, Lauf vom 2026-11-05 18:32 UTC, Prüfschritt HTTP 200). Frühere Claude-Seite und ChatGPT-Site werden nicht mehr gepflegt. |
| Site-Projekt-ID | GitHub ernesto-earth/rezepte (früher Claude-Seite 04298b04-31eb-4806-9ab5-368ee10d4bc6, davor ChatGPT appgprj_6aca2bc3d290819192c96834537f4ee8) |
| Site-Version | Commit 9c6f7e6 und Nachfolger in ernesto-earth/rezepte (main) |
| Site-URL | http://heger.earth/rezepte/ (Link auch als .webloc im Ordner) |
| Zuletzt aktualisiert durch | Claude, im Auftrag Ernestos am 2026-11-05 |

## Lokale Belege

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
