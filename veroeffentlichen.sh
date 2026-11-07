#!/bin/bash
# veroeffentlichen.sh – baut, prüft und veröffentlicht die Seite dieses Projekts auf heger.earth.
#   ./veroeffentlichen.sh "Kurze Beschreibung der Änderung"   bauen, committen, pushen, Deploy und Seite prüfen
#   ./veroeffentlichen.sh --pruefen                           nur Deploy-Lauf des letzten Commits und Seite prüfen
#   ./veroeffentlichen.sh --abgleichen                        nur neuere Commits vom Repo übernehmen (Vorspulen)
#
# Ablauf: neuere Commits vom Repo übernehmen (z. B. Änderungen über die Seite) → Build mit Prüfung →
# git add (nur was .gitignore erlaubt) → Commit → Push auf main → GitHub Action abwarten → Seite prüfen.
# Gedacht für Hermes (E-024), funktioniert genauso von Hand im Terminal.
# Zugangsdaten: Token aus der Cockpit-Ausführung (COS_GIT_TOKEN) oder aus der Token-Datei des Chief of Staff,
# sonst die normalen Git-Zugangsdaten des Macs. Der Token wird nie in Dateien geschrieben oder ausgegeben.

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
[ -n "$msg" ] || stop "Bitte eine Beschreibung angeben: ./veroeffentlichen.sh \"Rezept Gulasch ergänzt\"  (oder --pruefen)"
nur_pruefen=0; [ "$msg" = "--pruefen" ] && nur_pruefen=1
nur_abgleich=0; [ "$msg" = "--abgleichen" ] && nur_abgleich=1

NODE="${NODE:-$(command -v node || true)}"
COS_NODE="/Users/ernesto/Documents/a.5. Projekte/Chief of Staff/.cos-runtime/bin/node"
[ -n "$NODE" ] || { [ -x "$COS_NODE" ] && NODE="$COS_NODE"; }
[ -n "$NODE" ] || stop "Node.js nicht gefunden."

git rev-parse --is-inside-work-tree >/dev/null 2>&1 || stop "Kein Git-Repository."
branch=$(git rev-parse --abbrev-ref HEAD)
[ "$branch" = "main" ] || stop "Nicht auf main (aktuell: $branch)."

# Token (nur über GIT_ASKPASS weitergeben)
git_opts=()
TOKEN_FILE="/Users/ernesto/Documents/a.5. Projekte/Chief of Staff/.cos-runtime/github-publish-token"
if [ -z "${COS_GIT_TOKEN:-}" ] && [ -r "$TOKEN_FILE" ]; then
  export COS_GIT_TOKEN="$(tr -d '[:space:]' < "$TOKEN_FILE")"
fi
if [ -n "${COS_GIT_TOKEN:-}" ] && [ -z "${GIT_ASKPASS:-}" ]; then
  ask=$(mktemp); printf '#!/bin/sh\ncase "$1" in Username*) echo x-access-token ;; *) echo "$COS_GIT_TOKEN" ;; esac\n' > "$ask"; chmod 700 "$ask"
  export GIT_ASKPASS="$ask" GIT_TERMINAL_PROMPT=0; trap 'rm -f "$ask"' EXIT
  git_opts=(-c credential.helper=)
fi
g() { git ${git_opts[@]+"${git_opts[@]}"} "$@"; }

if [ "$nur_pruefen" = 0 ]; then
  # Neuere Commits vom Repo übernehmen (z. B. Bearbeitungen über die Seite), nur als Vorspulen
  if g fetch -q origin main 2>/dev/null; then
    hinter=$(git rev-list --count HEAD..origin/main 2>/dev/null || echo 0)
    vor=$(git rev-list --count origin/main..HEAD 2>/dev/null || echo 0)
    if [ "$hinter" -gt 0 ]; then
      [ "$vor" -gt 0 ] && stop "Lokal und im Repo gibt es unterschiedliche neue Commits ($vor lokal, $hinter im Repo). Nichts verändert – Ernesto bzw. Claude klären."
      git merge -q --ff-only origin/main 2>merge.err || { e=$(tail -2 merge.err); rm -f merge.err; stop "Neuere Änderungen aus dem Repo ließen sich nicht übernehmen ($e). Nichts veröffentlicht."; }
      rm -f merge.err
      say "== $hinter neuere Änderung(en) aus dem Repo übernommen."
    fi
  else
    say "Hinweis: Repo nicht erreichbar, Abgleich übersprungen."
    [ "$nur_abgleich" = 1 ] && stop "Repo nicht erreichbar."
  fi
  if [ "$nur_abgleich" = 1 ]; then
    say "ERGEBNIS: abgeglichen – Stand $(git rev-parse --short HEAD) ($(git log -1 --format=%s))"; exit 0
  fi

  if [ -n "$BUILD_DIR" ]; then
    say "== $PROJEKT: Build ($BUILD_DIR)"
    ( cd "$BUILD_DIR" && "$NODE" build.mjs $BUILD_ARGS ) || stop "Build fehlgeschlagen – nichts veröffentlicht."
  fi

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

  if ! g push -q origin main 2>push.err; then
    err=$(tail -3 push.err); rm -f push.err
    stop "Push abgelehnt ($err). Commit ${sha:0:7} liegt lokal; Ursache klären (Zugang, oder Repo hat neuere Commits), nicht erzwingen."
  fi
  rm -f push.err
  say "== Push erfolgreich."
else
  sha=$(git rev-parse HEAD)
  say "== Prüfe Commit ${sha:0:7} ($(git log -1 --format=%s))"
fi

# GitHub Action abwarten, wenn ein Token verfügbar ist
token="${COS_GIT_TOKEN:-${GITHUB_TOKEN:-}}"
deploy="nicht geprüft (kein Token)"
if [ -n "$token" ]; then
  deploy="keine Action ausgelöst (nur Dateien außerhalb der Seite geändert)"
  for i in $(seq 1 40); do
    [ "$nur_pruefen" = 1 ] && [ "$i" = 1 ] || sleep 10
    json=$(curl -fsS -H "Authorization: Bearer $token" -H "Accept: application/vnd.github+json" \
      "https://api.github.com/repos/$REPO/actions/runs?head_sha=$sha&per_page=1" 2>/dev/null) || continue
    st=$(printf '%s' "$json" | "$NODE" -e 'let s="";process.stdin.on("data",d=>s+=d).on("end",()=>{const r=(JSON.parse(s).workflow_runs||[])[0];console.log(r?[r.status,r.conclusion||"-",r.id].join(" "):"")})')
    if [ -z "$st" ]; then [ "$i" -ge 6 ] && break; continue; fi
    read -r r_status r_conclusion r_id <<< "$st"
    if [ "$r_status" = "completed" ]; then
      deploy="Action-Lauf $r_id: $r_conclusion"
      [ "$r_conclusion" = "success" ] || stop "Deploy $deploy – https://github.com/$REPO/actions/runs/$r_id"
      break
    fi
    deploy="Action-Lauf $r_id läuft noch"
  done
else
  [ "$nur_pruefen" = 1 ] || sleep 90
fi
say "== Deploy: $deploy"

if ! check=$("$NODE" ./deploy-pruefen.mjs seite "$SITE_URL" 2>&1); then
  stop "Seitenprüfung fehlgeschlagen ($check). Commit ${sha:0:7} ist gepusht."
fi
say "== $SITE_URL → $check"

if ! version=$("$NODE" ./deploy-pruefen.mjs version "$sha" "${SITE_URL}version.json" 2>&1); then
  stop "Live-Versionsabgleich fehlgeschlagen ($version). Commit ${sha:0:7} ist gepusht."
fi
say "== Live-Version: $version"

say "ERGEBNIS: veröffentlicht – Commit ${sha:0:7}, $deploy, $SITE_URL HTTP $ERWARTET_HTTP am geprüften Ziel, version.json bestätigt $sha"
