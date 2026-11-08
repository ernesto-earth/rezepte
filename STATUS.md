# Projektstatus – Rezepte

Alleinige aktuelle Statusquelle dieses registrierten Projekts. Historische Abnahmen und Übergaben sind Belege, keine konkurrierenden Statusquellen.

| Feld | Wert |
|---|---|
| Projekt | Rezepte |
| Arbeitsstatus | aktiv; COS-Statusmetadaten korrigiert, Rezeptdaten und Seite unverändert. |
| Letzte Statusaktualisierung | 2026-11-08T17:55:01+01:00 |
| Zuletzt erledigt | Vollständige belegte Site-Version innerhalb der COS-Übertragungsgrenze geführt; Vorwert unter Belege erhalten und Metadatenregel ergänzt. |
| Nächster Schritt | Künftige Statuspflege nach COS-017; keine Veröffentlichung beauftragt oder freigegeben. |
| Offene Entscheidung | keine zur Seite (Repo bleibt bewusst öffentlich, Entscheidung Ernesto 2026-11-05). Alte Claude-Seite und ChatGPT-Site kann Ernesto löschen. |
| Inhaltsstand | geprüft: Zehn Rezepte laut dokumentiertem Inhaltsnachweis, bei COS-017 keine Rezeptdaten oder Seiteninhalte geändert. |
| Prüfstand | geprüft: COS-017-Statusformat, Feldreihenfolge, Zeichengrenzen und Belegerhalt lokal geprüft. |
| Site-Stand | veröffentlicht: Seite gemäß dokumentiertem COS-013-Live-Nachweis; diese Statuskorrektur veröffentlicht nichts und ersetzt keine neue Live-Prüfung. |
| Site-Projekt-ID | GitHub ernesto-earth/rezepte |
| Site-Version | abf7522b49473b41018c580547ef3dd6ba69e290 / 2026-11-07T08:00:35.390Z |
| Site-URL | http://heger.earth/rezepte/ (Link auch als .webloc im Ordner) |
| Zuletzt aktualisiert durch | Hermes, ausdrücklich freigegebene COS-Qualitätskorrektur vom 2026-11-08; keine Veröffentlichung. |

## Belege

### Statusmetadaten-Korrektur 2026-11-08

**Dauerhafte COS-Formatregel:** Site-Projekt-ID höchstens 120 und Site-Version höchstens 80 UTF-16-Codeeinheiten. Aktuelle Kennung, voller belegter Commit und belegte Deploy-Zeit bleiben in den Tabellenfeldern; ausführliche Erläuterungen gehören verlustfrei unter Belege. Vor Abschluss vollständige Erhaltung durch den tatsächlichen Empfänger prüfen. Diese Regel bleibt auch hier versioniert, weil die lokale `.hermes.md` bewusst nicht in Git geführt wird. Keine neue Veröffentlichung aus einer Statuspflege ableiten.

Nur Statusdokumentation und Metadatenregel geändert, keine Rezeptdaten, PDFs, Seiteninhalte oder automatisch geführten Änderungsprotokolle. Vollständiger belegter Commit und Deploy-Zeit passen jetzt in die vorhandene Grenze von 80 UTF-16-Codeeinheiten. Die tatsächliche Empfängernormalisierung wurde zuvor offline mit einem Statement-Recorder auf vollständige Erhaltung der vorgeschlagenen Metadaten geprüft; keine Produktions-Testanfrage. Die historische Live-Abnahme bleibt derselbe Beleg, nicht eine neue Veröffentlichung.

Vollständige bisherige Feldwerte vor dieser Korrektur:

- Arbeitsstatus: aktiv; COS-017 lokal umgesetzt, ausschließlich Statusdokumentation geändert.
- Letzte Statusaktualisierung: 2026-11-07T10:24:37+01:00
- Zuletzt erledigt: COS-017: Statusfelder gekürzt, bisherige Angaben unter Belege erhalten und dauerhafte Pflegeregel in .hermes.md ergänzt.
- Site-Stand: veröffentlicht: Seite gemäß dokumentiertem COS-013-Live-Nachweis, bei COS-017 weder erneut online geprüft noch veröffentlicht.
- Site-Version: COS-013-Live-Version vom 2026-11-07T08:00:35.390Z (Commit-Zuordnung unter Belege)
- Zuletzt aktualisiert durch: Hermes, ausdrücklich bestätigter COS-017 (ändern erlaubt, keine Veröffentlichung)

### COS-017 – lokale Statuspflege

Nur `STATUS.md` und `.hermes.md` geändert; keine Veröffentlichung, kein Commit oder Push, keine Zugangsdaten verwendet. Die neue Pflegeregel steht im Abschnitt „Dateibasierter Projektstatus“ der `.hermes.md`. Die folgenden bisherigen Tabellenangaben sind historische Belege, keine aktuellen Statusfelder oder offenen fachlichen Abnahmen.

#### Bisherige Tabellenangaben vor COS-017 (unverändert erhalten)

- Arbeitsstatus: aktiv; COS-013 vollständig abgeschlossen, genau einmal veröffentlicht und Live-Version unabhängig bestätigt. Rezeptdaten und Seitengestaltung unverändert.
- Letzte Statusaktualisierung: 2026-11-07T09:01:52+01:00
- Zuletzt erledigt: COS-013: Workflow schreibt commit (voller SHA) und deployed_at (ISO UTC) in dist/version.json; Workflow und Veröffentlichungsskript vergleichen die Live-Version mit dem erwarteten Commit. Fehlende, ungültige und abweichende Versionen sind Fehler. Commit abf7522 veröffentlicht; Action 42353600632 success; Live-SHA entspricht exakt dem gepushten Commit.
- Nächster Schritt: COS-013 erledigt; keine weitere Veröffentlichung nötig. Abschließende Statusnachpflege bleibt lokal.
- Inhaltsstand: Am 2026-11-06 lokal zehn Rezepte mit eindeutigen IDs aus rezepte.json bestätigt; Original-Rezept-PDFs nur lokal in pdf/. Grenadiermarsch trägt „mit Kürbis, Geselchten und Bratenresten“, Quelle Ernesto; rindsuppe-hausgemacht heißt „Alt Wiener Suppentopf“. Die über die Seite erzeugten Commits f552221 und dac451a änderten Grenadiermarsch, darunter Zutaten, Zubereitung, Tipp, Quelle, Autor und Untertitel; das automatische Protokoll nennt die redaktionellen Felder, die Git-Differenzen zusätzlich das alt-Feld. Import und Protokollierung in 1898378 vorhanden. Kategorie Gemüse statt Kürbis und Suppen bleiben im bestehenden Datenstand. Bei dieser Statuspflege keine Rezeptinhalte geändert; frühere ChatGPT-Site in rezept-sammlung/ bleibt Archiv.
- Prüfstand: COS-013: 32 Offline-Tests bestanden (einschließlich falschem/fehlendem Commit, ungültigem JSON, Zeitfehlern und HTTP-Fehlern); Shell- und Node-Syntax sowie Workflow-YAML geprüft. Build erfolgreich: zehn Rezepte, 77596 Bytes. Live-index.html vor und nach Veröffentlichung bytegleich mit dem lokalen Build, SHA256 f66cf14daacb961df65f97f1a3390605259488558d9d1e00eca7015ccf30c897. Live-version.json zweimal gelesen: voller SHA abf7522b49473b41018c580547ef3dd6ba69e290 und deployed_at 2026-11-07T08:00:35.390Z bestätigt. GitHub-API unabhängig: Action 42353600632 completed/success für exakt diesen SHA.
- Site-Stand: Veröffentlicht: abf7522, Action 42353600632 success. Veröffentlichungsskript mit Exit 0; öffentlicher Check HTTP 200 und Live-Versionsabgleich erfolgreich. Bestehende URL-Werte, Server-, Zertifikats- und Weiterleitungseinstellungen unverändert. Abschließende Statusnachpflege nur lokal, kein zweiter Veröffentlichungslauf.
- Site-Version: abf7522; deployed_at 2026-11-07T08:00:35.390Z (aus live version.json)
- Zuletzt aktualisiert durch: Hermes, ausdrücklich bestätigter COS-013 (ändern und einmal veröffentlichen erlaubt)

### COS-013 – veröffentlichte Version live nachweisbar

Genau einmal `./veroeffentlichen.sh "COS-013: veröffentlichte Version per version.json live abgleichen"` ausgeführt, Exit 0:

`ERGEBNIS: veröffentlicht – Commit abf7522, Action-Lauf 42353600632: success, http://heger.earth/rezepte/ HTTP 200 am geprüften Ziel, version.json bestätigt abf7522b49473b41018c580547ef3dd6ba69e290`

Anschließend version.json erneut ohne Zugangsdaten gelesen: commit
`abf7522b49473b41018c580547ef3dd6ba69e290`, deployed_at
`2026-11-07T08:00:35.390Z`. GitHub-API bestätigt für Action 42353600632
exakt denselben head_sha und completed/success. Startseitenbytes vor und nach
Deploy identisch (SHA256 im Prüfstand); zehn Rezepte, keine Daten- oder
Gestaltungsänderung. Geänderte Veröffentlichungsdateien: `.github/workflows/deploy.yml`,
`veroeffentlichen.sh`, `deploy-pruefen.mjs`, `test-deploy-pruefen.mjs` sowie Statuspflege.
Diese abschließende Statusnachpflege bleibt lokal; kein weiterer Commit oder Deploy.

### COS-012 – Prüfkorrektur nach erneutem ausdrücklichem Auftrag

Veröffentlichung nach erneuter ausdrücklicher Freigabe genau einmal ausgeführt:
`ERGEBNIS: veröffentlicht – Commit b3467bd, Action-Lauf 42277592705: success, http://heger.earth/rezepte/ HTTP 200 am geprüften Ziel`.
Remote-Commit und Action anschließend unabhängig über die GitHub-API gegengelesen;
alle drei Prüfsteps erfolgreich. Hinweis im Browser erneut sichtbar, Daten und
Startseitenquelltext per Hash unverändert. Verifizierter Ergebnisbericht als
Kontext 24 im bestehenden COS-012 lokal/Web gegengelesen; keine neue Haupt-ID,
keine Änderung anderer Aufträge oder Kontexte. Der zusätzliche frühere
Abschlussversuch am Maschinen-Sync-Endpunkt war mit HTTP 401 abgewiesen worden.
Nach „bitte fertigmachen“ stattdessen die vorhandene Eigentümerfunktion
`complete_order` über die lokal authentifizierte MCP-Schnittstelle benutzt;
zuvor deren fehlerhafte ID-Schemagrenze auf gültige COS-IDs korrigiert und getestet.
Danach den Abschluss über die vorhandene Web-Schnittstelle abgeglichen.
Status lokal und im Web frisch gegengelesen:
`completed_on_mac_studio:COS-012`, mit identischem verifiziertem Ergebnis.
Sämtliche bisherigen Kontexte, andere Aufträge/Kontexte und Hauptauftragszahl
unverändert. Kein direkter Datenbankeingriff, keine Schlüssel- oder Rechteänderung,
keine neue Ausführung oder Veröffentlichung. Abschlussbeleg:
`/Users/ernesto/.hermes/cache/scratch/cos-012-close-20261106T205121/verified-completion.json`.
Diese abschließende Statusnachpflege nach dem Commit nur lokal.

Der ursprüngliche Erstlauf veröffentlichte den Hinweis in Commit `9aa603b`.
`ERGEBNIS: FEHLER – Deploy Action-Lauf 42268166465: failure – https://github.com/ernesto-earth/rezepte/actions/runs/42268166465`.
Build und Upload waren erfolgreich; der Zugangscheck bewertete die bestehende
Weiterleitung (301) statt die Passwortsperre am Ziel (401). Der Parent-Browser
bestätigte danach den sichtbaren Hinweis. Der ursprüngliche Ausführungsagent
konnte seinen eigenen Chrome-Zugang nicht benutzen; das ist durch diese spätere
separate Browserprüfung ergänzt, nicht rückwirkend als Agentenprüfung behauptet.

Nach „dann löse das“ nur Prüfcode und erforderliche Statuspflege geändert.
Die ursprünglichen URL-Werte bleiben erhalten. Server-, Zertifikats-, FTP-,
Weiterleitungs- und Zugangsdateieinstellungen werden nicht umgestellt.
`deploy-pruefen.mjs` löst erlaubte Weiterleitungen ohne Zugangsdaten auf,
prüft den anonymen Schutz und die .htaccess und sendet erst danach eine neue
authentifizierte Anfrage an das geprüfte Ziel, ohne authentifiziert weiterzuleiten.
17 Offline-Tests bestanden; öffentlicher Live-Check, Build und Syntaxprüfungen
bestanden. Dieser vorbereitende Stand wurde durch den oben protokollierten
tatsächlichen Veröffentlichungslauf abgelöst. Sicherung:
`/Users/ernesto/.hermes/cache/scratch/recipe-deploy-check-20261106T200307`.

Früheres Feld „Site-Version“ vollständig erhalten:
Gesamtdeploy unbekannt; COS-012-Commit 9aa603b gepusht, Action 42268166465 failure; Startseitenhinweis live nachgewiesen.

### Vollständige Erläuterungen zu den gekürzten Statusfeldern

Die Statusfelder wurden am 2026-11-06 für die bestehenden Übertragungsgrenzen gekürzt. Vollständige Erläuterungen und frühere Projektkennungen bleiben hier erhalten. Keine Rezeptdaten oder Protokolle geändert, kein Commit, Push oder manueller Jobstart durch diese Nachbesserung.

- Bisheriges Feld „Arbeitsstatus“: aktiv; Website „Am Tisch“ auf heger.earth/rezepte. Inhaltsdaten in claude-seite/rezepte.json; gemäß E-027 ist auch das Repository Schreibquelle der Bearbeiten-Seite, der lokale Projektordner übernimmt diese Commits. E-028-Stundenimport lokal belegt; vollständiger Abgleich bis ins Web-Cockpit noch gesondert abzunehmen.
- Bisheriges Feld „Site-Projekt-ID“: GitHub ernesto-earth/rezepte (früher Claude-Seite 04298b04-31eb-4806-9ab5-368ee10d4bc6, davor ChatGPT appgprj_6aca2bc3d290819192c96834537f4ee8)
- Bisheriges Feld „Site-Version“: Aktuelle Live-Version unbekannt (nicht neu geprüft). Lokaler Git-HEAD 1898378: Protokoll/Status der Seitenbearbeitungen f552221 und dac451a; zehn Rezepte. Letzter in dieser Datei dokumentierter erfolgreicher Seiten-Deploy 471c348; daraus keine Aussage über den heutigen Live-Commit ableiten.

### Weitere lokale Belege

- Statusprüfung 2026-11-06: `AENDERUNGEN.md` und die lokalen Commits `f552221`, `dac451a`, `1898378` gelesen. Protokollierung der zwei weiteren Grenadiermarsch-Bearbeitungen um 11:00 lokal belegt; keine neue Aussage über Push, Deploy oder Web-Cockpit-Empfang. Zehn Rezeptdatensätze mit eindeutigen IDs bestätigt. Das bestehende Protokoll wurde nicht von Hand geändert. E-028-Einbindung im vorhandenen `~/.hermes/scripts/cos-local-status-sync.sh` lesend bestätigt; E-027/E-028 tragen in der zentralen Entscheidungsliste noch ältere offene Einrichtungsangaben, die nicht den hier nachgewiesenen lokalen Stand beschreiben. Die Entscheidungsliste wurde in diesem auf Statusdateien begrenzten Schritt nicht verändert.
- Die ursprüngliche Veraltungswarnung zu `AENDERUNGEN.md` entstand bei Statuszeit `11:00:35` und Dateizeit `11:00:35.056603` in derselben Sekunde. Inhalt des Protokolls wurde jetzt fachlich gegen die lokalen Commits geprüft; der neue Statuszeitpunkt dokumentiert diese Prüfung. Keine Änderung an der Veraltungslogik und keine bloße Zeitstempelkorrektur.
E-028 abgeschlossen: Probe 5 Bearbeitungen; schreibender Lauf Commit 0f4e4ae erfolgreich gepusht. Veröffentlichung `ERGEBNIS: veröffentlicht – Commit 696e128, keine Action ausgelöst (nur Dateien außerhalb der Seite geändert), http://heger.earth/rezepte/ HTTP 200`. Sicherung `/Users/ernesto/.hermes/scripts/cos-local-status-sync.sh.bak-2026-11-06`, SHA256 e62cfff3a6fba0383522102590f05c910b98f2b97fad5019268d45f230459cd9. Jobskript exakt um den dreizeiligen E-028-Block aus mac-studio/README.md ergänzt; alle bisherigen Zeilen unverändert. Einmal `bash ~/.hermes/scripts/cos-local-status-sync.sh` ausgeführt: `ERGEBNIS: keine neuen Bearbeitungen über die Seite.` Anschließender Status-/Auftragsabgleich Exit 0, neue lokale Aufträge/Anweisungen, Bestätigungen, Quittierungen, Abschlüsse und Konflikte leer; execution_started=false. Keine anderen git-Befehle, nichts erzwungen. Diese Ergebnisnachpflege nach dem Lauf nur lokal.

Abschluss Suppen-Farbe: `ERGEBNIS: veröffentlicht – Commit 471c348, Action-Lauf 42189953723: success, http://heger.earth/rezepte/ HTTP 200`. Skript übernahm STATUS.md, bearbeiten/index.php, site.js, styles.css und die bereits offene veroeffentlichen.sh. curl bestätigte danach den ausgelieferten CAT-Eintrag Suppen mit #CA8A04. Keine weiteren git-Befehle, nichts erzwungen. Abschließende Ergebnisnachpflege nur lokal.

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
