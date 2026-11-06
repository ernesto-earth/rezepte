#!/bin/bash
# veroeffentlichen.sh – baut, prüft und veröffentlicht die Seite dieses Projekts auf heger.earth.
# Aufruf (im Projektordner):  ./veroeffentlichen.sh "Kurze Beschreibung der Änderung"
#
# Ablauf: Build mit Prüfung → git add (nur was .gitignore erlaubt) → Commit → Push auf main →
# GitHub Action abwarten (wenn ein Token verfügbar ist) → Erreichbarkeit der Seite prüfen.
# Gedacht für Hermes (E-024), funktioniert genauso von Hand im Terminal.
# Zugangsdaten: entweder die normalen Git-Zugangsdaten des Macs (z. B. aus GitHub Desktop) oder,
# in der Cockpit-Ausführung, ein Token über GIT_ASKPASS/COS_GIT_TOKEN. Nie ein Token in Dateien schreiben.

set -uo pipefail

# ---- Projektkonfiguration -----------------------------------------------------------------
PROJEKT="Rezepte"
REPO="ernesto-earth/rezepte"                 # GitHub owner/name
SITE_URL="http://heger.earth/rezepte/"
ERWARTET_HTTP="200"        # 200 öffentlich, 401 bei Passwortschutz
BUILD_DIR="claude-seite"
BUILD_ARGS=""
# ------------------------------------------------------------------------------------------

cd "$(dirname "$0")" || exit 1
say() { printf '%s\n' "$*"; }
stop() { say "ERGEBNIS: FEHLER – $*"; exit 1; }

msg="${1:-}"
[ -n "$msg" ] || stop "Bitte eine Beschreibung angeben: ./veroeffentlichen.sh \"Rezept Gulasch ergänzt\""

# Node finden (eigene Installation, Homebrew oder die Laufzeit des Chief of Staff)
NODE="${NODE:-$(command -v node || true)}"
COS_NODE="/Users/ernesto/Documents/a.5. Projekte/Chief of Staff/.cos-runtime/bin/node"
[ -n "$NODE" ] || { [ -x "$COS_NODE" ] && NODE="$COS_NODE"; }
[ -n "$NODE" ] || stop "Node.js nicht gefunden."

git rev-parse --is-inside-work-tree >/dev/null 2>&1 || stop "Kein Git-Repository."
branch=$(git rev-parse --abbrev-ref HEAD)
[ "$branch" = "main" ] || stop "Nicht auf main (aktuell: $branch)."
say "== $PROJEKT: Build ($BUILD_DIR)"
( cd "$BUILD_DIR" && "$NODE" build.mjs $BUILD_ARGS ) || stop "Build fehlgeschlagen – nichts veröffentlicht."

git add -A
if git diff --cached --quiet; then
  say "ERGEBNIS: nichts zu veröffentlichen (keine Änderungen gegenüber dem letzten Commit)."
  exit 0
fi
say "== Geänderte Dateien:"
git diff --cached --name-status

git -c user.name="${GIT_AUTHOR_NAME:-$(git config user.name || echo Hermes)}" \
    -c user.email="${GIT_AUTHOR_EMAIL:-$(git config user.email || echo hermes@macstudio.local)}" \
    commit -q -m "$msg" || stop "Commit fehlgeschlagen."
sha=$(git rev-parse HEAD)
say "== Commit ${sha:0:7}: $msg"

# Token für den Push: aus der Cockpit-Ausführung (COS_GIT_TOKEN) oder, in einer Hermes-Sitzung am Mac,
# aus der Datei des Chief of Staff (E-024). Der Token wird nur über GIT_ASKPASS weitergegeben, nie gespeichert.
push_opts=()
TOKEN_FILE="/Users/ernesto/Documents/a.5. Projekte/Chief of Staff/.cos-runtime/github-publish-token"
if [ -z "${COS_GIT_TOKEN:-}" ] && [ -r "$TOKEN_FILE" ]; then
  export COS_GIT_TOKEN="$(tr -d '[:space:]' < "$TOKEN_FILE")"
  ask=$(mktemp); printf '#!/bin/sh\ncase "$1" in Username*) echo x-access-token ;; *) echo "$COS_GIT_TOKEN" ;; esac\n' > "$ask"; chmod 700 "$ask"
  export GIT_ASKPASS="$ask" GIT_TERMINAL_PROMPT=0; trap 'rm -f "$ask"' EXIT
  push_opts=(-c credential.helper=)
fi

if ! git ${push_opts[@]+"${push_opts[@]}"} push -q origin main 2>push.err; then
  err=$(tail -3 push.err); rm -f push.err
  stop "Push abgelehnt ($err). Commit ${sha:0:7} liegt lokal; Ursache klären (Zugang, oder Repo hat neuere Commits), nicht erzwingen."
fi
rm -f push.err
say "== Push erfolgreich."

# GitHub Action abwarten, wenn ein Token verfügbar ist
token="${COS_GIT_TOKEN:-${GITHUB_TOKEN:-}}"
deploy="nicht geprüft (kein Token)"
if [ -n "$token" ]; then
  deploy="keine Action ausgelöst (nur Dateien außerhalb der Seite geändert)"
  for i in $(seq 1 40); do
    sleep 10
    json=$(curl -fsS -H "Authorization: Bearer $token" -H "Accept: application/vnd.github+json" \
      "https://api.github.com/repos/$REPO/actions/runs?head_sha=$sha&per_page=1" 2>/dev/null) || continue
    st=$(printf '%s' "$json" | "$NODE" -e 'let s="";process.stdin.on("data",d=>s+=d).on("end",()=>{const r=(JSON.parse(s).workflow_runs||[])[0];console.log(r?[r.status,r.conclusion||"",r.id].join(" "):"")})')
    [ -z "$st" ] && { [ "$i" -ge 6 ] && break; continue; }
    set -- $st
    if [ "$1" = "completed" ]; then
      deploy="Action-Lauf $3: $2"
      [ "$2" = "success" ] || stop "Deploy $deploy – https://github.com/$REPO/actions/runs/$3"
      break
    fi
    deploy="Action-Lauf $3 läuft noch"
  done
else
  sleep 90
fi
say "== Deploy: $deploy"

code=$(curl -s -o /dev/null -w '%{http_code}' "$SITE_URL" || true)
say "== $SITE_URL → HTTP $code (erwartet $ERWARTET_HTTP)"
[ "$code" = "$ERWARTET_HTTP" ] || stop "Seite antwortet mit HTTP $code statt $ERWARTET_HTTP. Commit ${sha:0:7} ist gepusht."

say "ERGEBNIS: veröffentlicht – Commit ${sha:0:7}, $deploy, $SITE_URL HTTP $code"
