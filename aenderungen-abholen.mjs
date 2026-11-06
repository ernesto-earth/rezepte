#!/usr/bin/env node
// aenderungen-abholen.mjs – holt Bearbeitungen von der Rezeptseite ins Projekt und dokumentiert sie (E-028).
//
// Läuft stündlich im Hermes-Job am Mac Studio (~/.hermes/scripts/cos-local-status-sync.sh), VOR dem
// Statusabgleich zum Cockpit; kann auch von Hand laufen:  node aenderungen-abholen.mjs [--probe]
//
// 1. Neuere Commits vom Repo übernehmen (nur Vorspulen, nie erzwingen).
// 2. Alle noch nicht protokollierten Bearbeitungen über heger.earth/rezepte/bearbeiten auswerten:
//    welches Rezept, welche Felder (Foto, Zutaten, …), neue oder geänderte Kategorien.
// 3. In AENDERUNGEN.md eintragen und STATUS.md nachziehen (Zuletzt erledigt, Site-Version …).
// 4. Nur diese beiden Dateien committen und pushen (kein Build, kein Deploy nötig).
// Ausgabe endet mit einer Zeile „ERGEBNIS: …“. Kein KI-Modell beteiligt.

import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const LOG = path.join(ROOT, 'AENDERUNGEN.md');
const STATUS = path.join(ROOT, 'STATUS.md');
const MARK = 'über heger.earth/rezepte/bearbeiten';
const TOKEN_FILE = '/Users/ernesto/Documents/a.5. Projekte/Chief of Staff/.cos-runtime/github-publish-token';
const probe = process.argv.includes('--probe');
const say = s => console.log(s);
const ende = (s, code = 0) => { say(`ERGEBNIS: ${s}`); process.exit(code); };

// Git mit Token (nur über GIT_ASKPASS, nie gespeichert)
const env = { ...process.env, GIT_TERMINAL_PROMPT: '0' };
const gitOpts = [];
let token = process.env.COS_GIT_TOKEN || '';
if (!token && fs.existsSync(TOKEN_FILE)) token = fs.readFileSync(TOKEN_FILE, 'utf8').trim();
if (token && !env.GIT_ASKPASS) {
  const ask = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'ab-')), 'askpass.sh');
  fs.writeFileSync(ask, '#!/bin/sh\ncase "$1" in Username*) echo x-access-token ;; *) echo "$COS_GIT_TOKEN" ;; esac\n', { mode: 0o700 });
  Object.assign(env, { GIT_ASKPASS: ask, COS_GIT_TOKEN: token });
  gitOpts.push('-c', 'credential.helper=');
}
const git = (...a) => execFileSync('git', ['-C', ROOT, ...gitOpts, ...a], { env, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();
const gitOk = (...a) => { try { return git(...a); } catch { return null; } };

// 1. Abgleich
if (git('rev-parse', '--abbrev-ref', 'HEAD') !== 'main') ende('FEHLER – Projektordner ist nicht auf main.', 1);
if (gitOk('fetch', '-q', 'origin', 'main') === null) ende('FEHLER – Repo nicht erreichbar, nichts abgeholt.', 1);
const hinter = +git('rev-list', '--count', 'HEAD..origin/main');
const vor = +git('rev-list', '--count', 'origin/main..HEAD');
if (hinter > 0) {
  if (vor > 0) ende(`FEHLER – lokal ${vor} und im Repo ${hinter} unterschiedliche neue Commits; nichts verändert, bitte klären.`, 1);
  if (!probe && gitOk('merge', '-q', '--ff-only', 'origin/main') === null) ende('FEHLER – Vorspulen nicht möglich (lokale Änderungen an denselben Dateien?); nichts verändert.', 1);
  say(`== ${hinter} neuere Änderung(en) aus dem Repo ${probe ? 'vorhanden (Probe, nicht übernommen)' : 'übernommen'}.`);
}
const ziel = probe ? 'origin/main' : 'HEAD';

// 2. Noch nicht protokollierte Bearbeitungen über die Seite
const log = fs.existsSync(LOG) ? fs.readFileSync(LOG, 'utf8') : '';
const bekannt = new Set([...log.matchAll(/Commit ([0-9a-f]{7,40})/g)].map(m => m[1].slice(0, 7)));
const commits = git('log', '--reverse', `--format=%H%x09%cI%x09%s`, ziel).split('\n').filter(Boolean)
  .map(z => { const [sha, datum, ...m] = z.split('\t'); return { sha, datum, msg: m.join('\t') }; })
  .filter(c => c.msg.includes(MARK) && !bekannt.has(c.sha.slice(0, 7)));
if (!commits.length) ende('keine neuen Bearbeitungen über die Seite.');

const FELD = { title: 'Titel', subtitle: 'Untertitel', image: 'Foto', portions: 'Personen', time: 'Zeit', categories: 'Kategorie',
  ingredients: 'Zutaten/Mengen', steps: 'Zubereitung', tip: 'Tipp', source: 'Quelle', author: 'Autor' };
const json = (rev, f) => { const s = gitOk('show', `${rev}:${f}`); try { return s ? JSON.parse(s) : []; } catch { return []; } };
const cats = rev => { const s = gitOk('show', `${rev}:claude-seite/site.js`) || ''; const b = s.match(/const CAT = \{([\s\S]*?)\};/);
  return Object.fromEntries(b ? [...b[1].matchAll(/'([^']+)':\s*\['([^']+)',\s*'([^']+)'\]/g)].map(m => [m[1], { name: m[2], farbe: m[3] }]) : []); };
const zeit = iso => { const d = new Date(iso); return d.toLocaleString('sv-SE', { timeZone: 'Europe/Vienna' }).slice(0, 16); };

const eintraege = [];
for (const c of commits) {
  const vorher = json(`${c.sha}^`, 'claude-seite/rezepte.json'), nachher = json(c.sha, 'claude-seite/rezepte.json');
  const alt = new Map(vorher.map(r => [r.id, r])), zeilen = [];
  for (const r of nachher) {
    const a = alt.get(r.id);
    if (!a) { zeilen.push(`- Neues Rezept „${r.title}“ (${r.id}), ${r.portions}`); continue; }
    const f = Object.keys(FELD).filter(k => JSON.stringify(a[k] ?? null) !== JSON.stringify(r[k] ?? null)).map(k => FELD[k]);
    if (f.length) zeilen.push(`- „${r.title}“ (${r.id}): ${f.join(', ')} geändert${a.title !== r.title ? ` (vorher „${a.title}“)` : ''}`);
  }
  for (const a of vorher) if (!nachher.some(r => r.id === a.id)) zeilen.push(`- Rezept „${a.title}“ (${a.id}) entfernt`);
  const k0 = cats(`${c.sha}^`), k1 = cats(c.sha);
  for (const [k, v] of Object.entries(k1)) {
    if (!k0[k]) zeilen.push(`- Neue Kategorie „${v.name}“ (${v.farbe})`);
    else if (k0[k].farbe !== v.farbe || k0[k].name !== v.name) zeilen.push(`- Kategorie „${v.name}“ geändert (${k0[k].name} ${k0[k].farbe} → ${v.name} ${v.farbe})`);
  }
  if (!zeilen.length) zeilen.push('- keine inhaltliche Änderung erkennbar');
  eintraege.push({ ...c, kurz: c.sha.slice(0, 7), zeilen });
}

// 3. Protokoll und Status
const block = eintraege.map(e => `## ${zeit(e.datum)} – Bearbeitung über die Seite (Commit ${e.kurz})\n\n${e.zeilen.join('\n')}\n`).join('\n');
const kopf = '# Änderungsprotokoll Rezepte\n\nBearbeitungen über heger.earth/rezepte/bearbeiten, stündlich von `aenderungen-abholen.mjs` übernommen (E-028).\nNeueste oben. Änderungen über Hermes stehen in STATUS.md und in der Git-Historie.\n\n';
const rest = log.replace(/^# Änderungsprotokoll Rezepte[\s\S]*?\n\n(?=## |$)/, '');
const neuLog = kopf + eintraege.slice().reverse().map(e => `## ${zeit(e.datum)} – Bearbeitung über die Seite (Commit ${e.kurz})\n\n${e.zeilen.join('\n')}\n`).join('\n') + (rest ? '\n' + rest : '');
const kurzVoll = eintraege.map(e => e.zeilen.map(z => z.replace(/^- /, '')).join('; ')).join(' | ');
const kurzText = kurzVoll.length > 300 ? kurzVoll.slice(0, 297) + '…' : kurzVoll;

if (probe) { say(block); ende(`Probe – ${eintraege.length} Bearbeitung(en) würden protokolliert (nichts geändert).`); }

fs.writeFileSync(LOG, neuLog);
if (fs.existsSync(STATUS)) {
  const jetzt = new Date().toLocaleString('sv-SE', { timeZone: 'Europe/Vienna' }).replace(' ', 'T').slice(0, 19);
  const off = (() => { const m = -new Date().getTimezoneOffset(); return (m >= 0 ? '+' : '-') + String(Math.floor(Math.abs(m) / 60)).padStart(2, '0') + ':' + String(Math.abs(m) % 60).padStart(2, '0'); })();
  const tag = zeit(eintraege.at(-1).datum).slice(0, 10);
  let s = fs.readFileSync(STATUS, 'utf8');
  const anzahl = json('HEAD', 'claude-seite/rezepte.json').length;
  s = s.replace(/^\| Letzte Statusaktualisierung \| [^|]*\|/m, `| Letzte Statusaktualisierung | ${jetzt}${off} |`);
  s = s.replace(/^(\| Zuletzt erledigt \| )/m, `$1${tag}: Über die Bearbeiten-Seite: ${kurzText.replace(/\|/g, '/')} (siehe AENDERUNGEN.md). Davor `);
  s = s.replace(/^\| Site-Version \| [^|]*\|/m, `| Site-Version | Commit ${eintraege.at(-1).kurz} (Bearbeitung über die Seite) und Nachfolger in ernesto-earth/rezepte (main); ${anzahl} Rezepte |`);
  s = s.replace(/^\| Zuletzt aktualisiert durch \| [^|]*\|/m, `| Zuletzt aktualisiert durch | Hermes, stündlicher Abgleich (aenderungen-abholen.mjs) |`);
  fs.writeFileSync(STATUS, s);
}
say(block);

// 4. Nur Protokoll und Status committen und pushen
git('add', 'AENDERUNGEN.md', 'STATUS.md');
if (gitOk('diff', '--cached', '--quiet') !== null) ende(`${eintraege.length} Bearbeitung(en) – nichts zu committen.`);
git('-c', 'user.name=Hermes (Mac Studio)', '-c', 'user.email=hermes@macstudio.local', 'commit', '-q', '-m',
  `Änderungsprotokoll: ${eintraege.length} Bearbeitung(en) über die Seite übernommen`, '--', 'AENDERUNGEN.md', 'STATUS.md');
const sha = git('rev-parse', '--short', 'HEAD');
if (gitOk('push', '-q', 'origin', 'main') === null) ende(`protokolliert in Commit ${sha}, Push fehlgeschlagen – wird beim nächsten Veröffentlichen mitgenommen.`, 1);
ende(`${eintraege.length} Bearbeitung(en) protokolliert und gepusht (Commit ${sha}): ${kurzText}`);
