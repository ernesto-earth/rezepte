# heger.earth – automatisches Deployment

Jeder Ordner unter `sites/` wird automatisch auf heger.earth veröffentlicht:

| Ordner im Repo     | Adresse                     |
|--------------------|-----------------------------|
| `sites/rezepte/`   | https://heger.earth/rezepte |
| `sites/<name>/`    | https://heger.earth/<name>  |

Bei jedem Push auf `main` lädt die GitHub Action `Deploy` die geänderten Dateien per FTPS hoch und prüft danach, ob die Seite erreichbar ist. Manuell starten: **Actions → Deploy → Run workflow**.

Eine neue Seite veröffentlichen heißt also: Ordner unter `sites/` anlegen (mit `index.html`) und pushen.

## Einmalige Einrichtung

### 1. FTP-Zugang im Domaintechnik Control Panel
Control Panel → Modul **FTP**. Am besten einen eigenen FTP-Benutzer nur für das Deployment anlegen (eigenes Passwort, nicht das Control-Panel-Passwort).

- Ist sein Startordner das Hauptverzeichnis (dort liegen `www`, `logs`, `stats`), passt alles ohne weitere Einstellung.
- Ist sein Startordner direkt `www`, lege unter Settings → Secrets and variables → Actions → **Variables** die Variable `FTP_WEBROOT` mit dem Wert `./` an.

### 2. Secrets in GitHub hinterlegen
Repo → Settings → Secrets and variables → Actions → **New repository secret**:

- `FTP_SERVER` – FTP-Server laut Control Panel (oft einfach `heger.earth`)
- `FTP_USERNAME` – der FTP-Benutzer aus Schritt 1
- `FTP_PASSWORD` – sein Passwort

Die Secrets sind verschlüsselt und auch für Claude nicht lesbar.

### 3. Ersten Lauf starten
Actions → Deploy → **Run workflow**. Ein grüner Haken bedeutet: die Seite ist online.

## Fehlersuche
- **Verbindung/TLS-Fehler:** In `.github/workflows/deploy.yml` `protocol: ftps` auf `protocol: ftp` ändern (unverschlüsselt – nur falls der Server kein FTPS kann).
- **Dateien landen im falschen Ordner:** `FTP_WEBROOT` anpassen (siehe Schritt 1).
- **Prüfschritt rot, Upload grün:** Pfad prüfen, oder ob `.htaccess` die Adresse umleitet.
- Bereits per Hand hochgeladene Dateien werden beim ersten Lauf einfach überschrieben.
