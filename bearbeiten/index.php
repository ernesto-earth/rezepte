<?php
declare(strict_types=1);
/*
 * Am Tisch – Rezepte auf der Seite bearbeiten oder neu anlegen (E-027).
 * heger.earth/rezepte/bearbeiten/  ·  Zugang: Benutzer „ernesto“ + Passwort (Basic Auth, geprüft in PHP).
 *
 * Gespeichert wird direkt im GitHub-Repo ernesto-earth/rezepte (claude-seite/rezepte.json und img/),
 * in EINEM Commit; der Commit startet die GitHub Action, die die Seite baut und hochlädt (~1–2 Min.).
 * Der Projektordner am Mac holt die Änderung beim nächsten veroeffentlichen.sh / rezept-neu.mjs (git pull).
 *
 * Konfiguration außerhalb des Webordners: <FTP-Wurzel>/rezepte-data/config.php (schreibt das Deployment):
 *   ['password_hash' => …, 'github_token' => …, 'repo' => 'ernesto-earth/rezepte', 'branch' => 'main']
 * Für lokale Tests: REZEPTE_DATA_DIR und GITHUB_API.
 */

ini_set('display_errors', '0');
header('Cache-Control: no-store');
header('X-Frame-Options: DENY');
header("Content-Security-Policy: default-src 'self'; img-src 'self' data: blob: http: https:; style-src 'unsafe-inline'; script-src 'unsafe-inline'; form-action 'self'");

const DATA_PATH = 'claude-seite/rezepte.json';
const SITE_JS = 'claude-seite/site.js';
const IMG_DIR = 'claude-seite/img/';
const MAX_IMAGE = 1500000; // Bytes nach dem Verkleinern im Browser

function data_dir(): string {
  $env = getenv('REZEPTE_DATA_DIR');
  return (is_string($env) && $env !== '') ? rtrim($env, '/') : dirname(__DIR__, 3) . '/rezepte-data';
}
function config(): array {
  static $c = null;
  if ($c !== null) return $c;
  $f = data_dir() . '/config.php';
  $c = is_file($f) ? (require $f) : [];
  return is_array($c) ? $c : [];
}
function h(?string $s): string { return htmlspecialchars((string)$s, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8'); }

// ---------------------------------------------------------------- Zugang
function auth_header(): string {
  foreach (['HTTP_AUTHORIZATION', 'REDIRECT_HTTP_AUTHORIZATION'] as $k) if (!empty($_SERVER[$k])) return (string)$_SERVER[$k];
  if (isset($_SERVER['PHP_AUTH_USER'])) return 'Basic ' . base64_encode($_SERVER['PHP_AUTH_USER'] . ':' . ($_SERVER['PHP_AUTH_PW'] ?? ''));
  return '';
}
function require_login(): void {
  $hash = config()['password_hash'] ?? '';
  $ok = false;
  $hdr = auth_header();
  if ($hash && stripos($hdr, 'Basic ') === 0) {
    $d = base64_decode(substr($hdr, 6), true);
    if (is_string($d) && strpos($d, ':') !== false) {
      [$u, $p] = explode(':', $d, 2);
      $ok = $u === 'ernesto' && password_verify($p, $hash);
    }
  }
  if ($ok) return;
  if (!$hash) { http_response_code(503); echo 'Bearbeiten ist noch nicht eingerichtet.'; exit; }
  usleep(400000);
  header('WWW-Authenticate: Basic realm="Am Tisch – Rezepte bearbeiten", charset="UTF-8"');
  http_response_code(401);
  echo 'Anmeldung erforderlich.';
  exit;
}
function csrf_token(): string { return hash_hmac('sha256', 'rezepte-bearbeiten', (string)(config()['password_hash'] ?? '')); }
function check_post(): void {
  $host = $_SERVER['HTTP_HOST'] ?? '';
  foreach (['HTTP_ORIGIN', 'HTTP_REFERER'] as $k) {
    if (!empty($_SERVER[$k]) && parse_url((string)$_SERVER[$k], PHP_URL_HOST) !== parse_url('http://' . $host, PHP_URL_HOST)) fail(403, 'Anfrage von fremder Seite abgelehnt.');
  }
  if (!hash_equals(csrf_token(), (string)($_POST['csrf'] ?? ''))) fail(403, 'Formular abgelaufen – bitte Seite neu laden.');
}

// ---------------------------------------------------------------- GitHub
function gh(string $method, string $path, ?array $body = null, bool $raw = false) {
  $c = config();
  $api = getenv('GITHUB_API') ?: 'https://api.github.com';
  $url = $api . '/repos/' . ($c['repo'] ?? 'ernesto-earth/rezepte') . $path;
  $headers = [
    'Authorization: Bearer ' . ($c['github_token'] ?? ''),
    'Accept: ' . ($raw ? 'application/vnd.github.raw' : 'application/vnd.github+json'),
    'User-Agent: AmTisch-Rezepte-Editor', 'X-GitHub-Api-Version: 2022-11-28', 'Content-Type: application/json',
  ];
  $payload = $body === null ? null : json_encode($body, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
  if (function_exists('curl_init')) {
    $ch = curl_init($url);
    curl_setopt_array($ch, [CURLOPT_CUSTOMREQUEST => $method, CURLOPT_HTTPHEADER => $headers, CURLOPT_RETURNTRANSFER => true,
      CURLOPT_TIMEOUT => 30, CURLOPT_POSTFIELDS => $payload]);
    $res = curl_exec($ch); $code = (int)curl_getinfo($ch, CURLINFO_RESPONSE_CODE); curl_close($ch);
  } else {
    $ctx = stream_context_create(['http' => ['method' => $method, 'header' => implode("\r\n", $headers), 'content' => $payload ?? '', 'ignore_errors' => true, 'timeout' => 30]]);
    $res = @file_get_contents($url, false, $ctx);
    $code = 0; foreach ($http_response_header ?? [] as $l) if (preg_match('#^HTTP/\S+ (\d+)#', $l, $m)) $code = (int)$m[1];
  }
  if ($res === false || $code < 200 || $code >= 300) {
    $msg = is_string($res) ? (json_decode($res, true)['message'] ?? '') : '';
    throw new RuntimeException("GitHub antwortet mit HTTP $code" . ($msg ? " ($msg)" : '') . " bei $method $path");
  }
  return $raw ? $res : json_decode($res, true);
}
function branch(): string { return config()['branch'] ?? 'main'; }
function load_recipes(?string $ref = null): array {
  $d = json_decode((string)gh('GET', '/contents/' . DATA_PATH . '?ref=' . rawurlencode($ref ?? branch()), null, true), true);
  if (!is_array($d)) throw new RuntimeException('rezepte.json ist nicht lesbar.');
  return $d;
}
function categories(?string $ref = null): array {
  $js = (string)gh('GET', '/contents/' . SITE_JS . '?ref=' . rawurlencode($ref ?? branch()), null, true);
  if (!preg_match('/const CAT = \{([\s\S]*?)\};/', $js, $m)) return [];
  preg_match_all("/'([^']+)':\s*\['([^']+)'/", $m[1], $mm, PREG_SET_ORDER);
  $out = []; foreach ($mm as $x) $out[$x[1]] = $x[2];
  return $out;
}
function json_like_repo(array $data): string { // wie JSON.stringify(…, null, 1) im Projekt
  $j = json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
  return preg_replace_callback('/^((?: {4})+)/m', fn($m) => str_repeat(' ', intdiv(strlen($m[1]), 4)), $j) . "\n";
}

// ---------------------------------------------------------------- Formular ↔ Rezept
function ingredients_to_text(array $ing): string {
  return implode("\n", array_map(fn($i) => isset($i['h']) ? $i['h'] . ':' : (string)($i['t'] ?? ''), $ing));
}
function text_to_ingredients(string $t): array {
  $out = [];
  foreach (preg_split('/\R/u', $t) as $z) {
    $z = trim(preg_replace('/^[-•*–]\s*/u', '', trim($z)));
    if ($z === '') continue;
    if (preg_match('/:$/u', $z) && !preg_match('/\d/u', $z)) $out[] = ['h' => mb_strtoupper(rtrim($z, ':'))];
    else $out[] = ['t' => $z];
  }
  return $out;
}
function text_to_steps(string $t): array {
  $out = [];
  foreach (preg_split('/\R/u', $t) as $z) { $z = trim(preg_replace('/^\d+[.)]\s*/u', '', trim($z))); if ($z !== '') $out[] = $z; }
  return $out;
}
function slug(string $s): string {
  $s = mb_strtolower($s); $s = strtr($s, ['ä' => 'ae', 'ö' => 'oe', 'ü' => 'ue', 'ß' => 'ss']);
  $s = iconv('UTF-8', 'ASCII//TRANSLIT//IGNORE', $s) ?: $s;
  return substr(trim(preg_replace('/[^a-z0-9]+/', '-', $s), '-'), 0, 60);
}
function short_time(string $t): string { return trim(str_replace(['Stunden', 'Stunde', 'Minuten'], ['Std.', 'Std.', 'Min.'], $t)); }

function fail(int $code, string $msg): void { http_response_code($code); page('Fehler', '<p class="err">' . h($msg) . '</p><p><a href="./">Zurück</a></p>'); exit; }

function page(string $title, string $body): void {
  echo '<!doctype html><html lang="de"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">'
    . '<meta name="robots" content="noindex"><title>' . h($title) . ' – Am Tisch</title><style>' . CSS . '</style></head><body>'
    . '<header class="top"><a class="brand" href="../">AM TISCH <span>REZEPTE</span></a><span>Bearbeiten</span></header><main>'
    . $body . '</main></body></html>';
}
const CSS = <<<'CSS'
:root{--ground:#F6F4F0;--card:#fff;--ink:#1E1A17;--muted:#5E554D;--line:#EEE9E2;--edge:#DDD6CD;--accent:#C2410C;--nav:#F08A5D}
*{box-sizing:border-box}body{margin:0;background:var(--ground);color:var(--ink);font:16px/1.5 -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Arial,sans-serif}
.top{background:var(--ink);color:#ddd;display:flex;justify-content:space-between;align-items:center;padding:14px 20px}
.brand{font:700 22px "Barlow Condensed","Arial Narrow",sans-serif;letter-spacing:.04em;color:#fff;text-decoration:none}.brand span{color:var(--nav)}
main{max-width:860px;margin:0 auto;padding:20px}h1{font:700 34px/1.05 "Barlow Condensed","Arial Narrow",sans-serif;margin:8px 0 16px}
a{color:var(--ink)}a:hover{color:var(--accent)}
.list{list-style:none;padding:0;margin:0;display:grid;gap:8px}.list a{display:flex;gap:12px;align-items:center;background:var(--card);border:1px solid var(--line);border-radius:12px;padding:8px;text-decoration:none}
.list img{width:64px;height:48px;object-fit:cover;border-radius:8px}.list small{color:var(--muted);display:block}
form{background:var(--card);border:1px solid var(--line);border-radius:14px;padding:18px;display:grid;gap:14px}
label{display:grid;gap:4px;font-weight:600;font-size:14px}label small{font-weight:400;color:var(--muted)}
input[type=text],textarea{font:inherit;padding:10px 12px;border:1px solid var(--edge);border-radius:10px;width:100%;background:#fff}
textarea{min-height:180px;resize:vertical}.row{display:grid;grid-template-columns:1fr 1fr;gap:14px}
.cats{display:flex;flex-wrap:wrap;gap:10px;font-weight:400}.cats label{display:flex;gap:6px;align-items:center;font-weight:400}
.photo{display:flex;gap:14px;align-items:center;flex-wrap:wrap}.photo img{width:180px;height:130px;object-fit:cover;border-radius:10px;border:1px solid var(--line)}
.btn{background:var(--accent);color:#fff;border:0;border-radius:999px;padding:12px 22px;font:600 16px inherit;cursor:pointer;justify-self:start}
.btn.sec{background:transparent;color:var(--ink);border:1px solid var(--edge)}.ok{background:#ECFDF3;border:1px solid #A7E3BD;padding:14px;border-radius:12px}
.err{background:#FEF2F2;border:1px solid #F5B5B5;padding:14px;border-radius:12px}.muted{color:var(--muted)}
@media(max-width:640px){.row{grid-template-columns:1fr}h1{font-size:28px}}
CSS;

function form(array $r, array $cats, bool $neu): string {
  $c = '';
  foreach ($cats as $k => $label) $c .= '<label><input type="checkbox" name="cat[]" value="' . h($k) . '"' . (in_array($k, $r['categories'] ?? [], true) ? ' checked' : '') . '> ' . h($label) . '</label>';
  $img = !empty($r['image']) ? '<img id="preview" src="../' . h($r['image']) . '" alt="">' : '<img id="preview" alt="" hidden>';
  return '<h1>' . ($neu ? 'Neues Rezept' : h($r['title'])) . '</h1>'
    . '<form method="post" action="./' . ($neu ? '?neu=1' : '?id=' . h($r['id'])) . '" id="f">'
    . '<input type="hidden" name="csrf" value="' . h(csrf_token()) . '"><input type="hidden" name="foto" id="foto">'
    . '<div class="photo">' . $img . '<label>Foto ' . ($neu ? '' : 'austauschen ') . '<small>JPG, PNG oder HEIC; wird auf 800 px verkleinert</small><input type="file" id="datei" accept="image/*"></label></div>'
    . '<label>Titel<input type="text" name="title" required value="' . h($r['title'] ?? '') . '"></label>'
    . '<label>Untertitel<input type="text" name="subtitle" value="' . h($r['subtitle'] ?? '') . '"></label>'
    . '<div class="row"><label>Personen <small>z. B. „4 Personen“ oder „12 Stück“</small><input type="text" name="portions" required value="' . h($r['portions'] ?? '') . '"></label>'
    . '<label>Zeit<input type="text" name="time" value="' . h(($r['time'] ?? '') === 'Gesamtzeit nicht angegeben' ? '' : ($r['time'] ?? '')) . '"></label></div>'
    . '<div><b style="font-size:14px">Kategorie</b><div class="cats">' . $c . '</div></div>'
    . '<label>Zutaten <small>eine pro Zeile, Menge zuerst · Zwischenüberschrift mit Doppelpunkt, z. B. „Für die Sauce:“</small><textarea name="ingredients" required>' . h(ingredients_to_text($r['ingredients'] ?? [])) . '</textarea></label>'
    . '<label>Zubereitung <small>ein Schritt pro Zeile</small><textarea name="steps" required>' . h(implode("\n", $r['steps'] ?? [])) . '</textarea></label>'
    . '<label>Tipp<input type="text" name="tip" value="' . h($r['tip'] ?? '') . '"></label>'
    . '<div class="row"><label>Quelle<input type="text" name="source" value="' . h($r['source'] ?? 'Eigenes Rezept') . '"></label>'
    . '<label>Autor<input type="text" name="author" value="' . h($r['author'] ?? '') . '"></label></div>'
    . '<div style="display:flex;gap:10px;flex-wrap:wrap"><button class="btn" type="submit">Speichern und veröffentlichen</button><a class="btn sec" href="./">Abbrechen</a></div>'
    . '<p class="muted" style="margin:0">Nach dem Speichern ist die Änderung in etwa 1–2 Minuten auf der Rezeptseite.</p></form>'
    . <<<'JS'
<script>
const datei=document.getElementById('datei'),foto=document.getElementById('foto'),prev=document.getElementById('preview'),f=document.getElementById('f');
datei.addEventListener('change',async()=>{const file=datei.files[0];if(!file)return;
  try{const bmp=await createImageBitmap(file);const s=Math.min(1,800/Math.max(bmp.width,bmp.height));
    const c=document.createElement('canvas');c.width=Math.round(bmp.width*s);c.height=Math.round(bmp.height*s);
    c.getContext('2d').drawImage(bmp,0,0,c.width,c.height);const url=c.toDataURL('image/jpeg',0.82);
    foto.value=url;prev.src=url;prev.hidden=false;}
  catch(e){alert('Dieses Bild kann der Browser nicht lesen. Bitte als JPG oder PNG versuchen.');datei.value='';}});
f.addEventListener('submit',()=>{f.querySelector('button[type=submit]').disabled=true;f.querySelector('button[type=submit]').textContent='Wird gespeichert …';});
</script>
JS;
}

// ---------------------------------------------------------------- Ablauf
require_login();
try {
  $id = isset($_GET['id']) ? (string)$_GET['id'] : '';
  $neu = isset($_GET['neu']);

  if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    check_post();
    $head = gh('GET', '/git/ref/heads/' . branch())['object']['sha'];
    $base = gh('GET', '/git/commits/' . $head)['tree']['sha'];
    $all = load_recipes($head);
    $cats = categories($head);
    $idx = null;
    if (!$neu) { foreach ($all as $k => $x) if (($x['id'] ?? '') === $id) $idx = $k; if ($idx === null) fail(404, 'Rezept nicht gefunden.'); }
    $r = $neu ? ['id' => '', 'pdf' => '', 'added' => date('Y-m-d')] : $all[$idx];

    $r['title'] = trim((string)($_POST['title'] ?? ''));
    $r['subtitle'] = trim((string)($_POST['subtitle'] ?? ''));
    $r['portions'] = trim((string)($_POST['portions'] ?? ''));
    if (preg_match('/^\d+(\s*[–-]\s*\d+)?$/u', $r['portions'])) $r['portions'] .= ' Personen';
    $time = trim((string)($_POST['time'] ?? ''));
    $r['time'] = $time !== '' ? $time : 'Gesamtzeit nicht angegeben';
    $r['timeShort'] = $time !== '' ? short_time($time) : '';
    $r['ingredients'] = text_to_ingredients((string)($_POST['ingredients'] ?? ''));
    $r['steps'] = text_to_steps((string)($_POST['steps'] ?? ''));
    $r['tip'] = trim((string)($_POST['tip'] ?? ''));
    $r['source'] = trim((string)($_POST['source'] ?? '')) ?: 'Eigenes Rezept';
    $r['author'] = trim((string)($_POST['author'] ?? ''));
    $sel = array_values(array_filter((array)($_POST['cat'] ?? []), fn($k) => isset($cats[$k])));

    $fehler = [];
    if ($r['title'] === '') $fehler[] = 'Titel fehlt';
    if (!preg_match('/\d/u', $r['portions'])) $fehler[] = 'Anzahl der Personen fehlt (z. B. „4 Personen“)';
    if (!array_filter($r['ingredients'], fn($i) => isset($i['t']))) $fehler[] = 'keine Zutaten';
    if (!$r['steps']) $fehler[] = 'keine Schritte';
    if (!$sel) $fehler[] = 'bitte mindestens eine Kategorie wählen';
    if ($neu) foreach ($all as $x) if (mb_strtolower($x['title']) === mb_strtolower($r['title'])) $fehler[] = 'ein Rezept mit diesem Titel gibt es schon';

    $foto = (string)($_POST['foto'] ?? '');
    $bild = null;
    if ($foto !== '') {
      if (!preg_match('#^data:image/jpeg;base64,([A-Za-z0-9+/=]+)$#', $foto, $m)) $fehler[] = 'Foto ungültig';
      else { $bild = base64_decode($m[1], true); if (!$bild || substr($bild, 0, 3) !== "\xFF\xD8\xFF" || strlen($bild) > MAX_IMAGE) { $fehler[] = 'Foto ungültig oder zu groß'; $bild = null; } }
    }
    if ($neu && !$bild) $fehler[] = 'Foto fehlt';
    if ($fehler) {
      $r['categories'] = $sel;
      http_response_code(422);
      page('Bitte ergänzen', '<p class="err">Nicht gespeichert: ' . h(implode(' · ', $fehler)) . '</p>' . form($r, $cats, $neu)); exit;
    }

    if ($neu) {
      $base_id = slug($r['title']) ?: 'rezept'; $nid = $base_id; $n = 2;
      while (array_filter($all, fn($x) => $x['id'] === $nid)) $nid = $base_id . '-' . $n++;
      $r['id'] = $nid;
    }
    $r['categories'] = $sel;
    // Stichwörter: Kategorien plus eigene (z. B. „Schnell“) behalten
    $eigene = array_values(array_filter($r['tags'] ?? [], fn($t) => !in_array($t, $cats, true)));
    $r['tags'] = array_values(array_unique(array_merge(array_map(fn($k) => $cats[$k], $sel), $eigene)));
    $r['alt'] = $r['title'] . ($r['subtitle'] ? ' ' . $r['subtitle'] : '');
    $tree = [];
    $alt_bild = $r['image'] ?? null;
    if ($bild) {
      $r['image'] = 'img/' . $r['id'] . '-' . date('YmdHis') . '-' . bin2hex(random_bytes(2)) . '.jpg';
      $blob = gh('POST', '/git/blobs', ['content' => base64_encode($bild), 'encoding' => 'base64'])['sha'];
      $tree[] = ['path' => 'claude-seite/' . $r['image'], 'mode' => '100644', 'type' => 'blob', 'sha' => $blob];
      $genutzt = array_filter($all, fn($x) => ($x['image'] ?? '') === $alt_bild && $x['id'] !== $r['id']);
      if ($alt_bild && $alt_bild !== $r['image'] && !$genutzt) $tree[] = ['path' => 'claude-seite/' . $alt_bild, 'mode' => '100644', 'type' => 'blob', 'sha' => null];
    }
    if ($neu) $all[] = $r; else $all[$idx] = $r;
    $tree[] = ['path' => DATA_PATH, 'mode' => '100644', 'type' => 'blob', 'content' => json_like_repo($all)];
    $t = gh('POST', '/git/trees', ['base_tree' => $base, 'tree' => $tree])['sha'];
    $msg = ($neu ? 'Neues Rezept' : 'Rezept bearbeitet') . ': ' . $r['title'] . ' (über heger.earth/rezepte/bearbeiten)';
    $commit = gh('POST', '/git/commits', ['message' => $msg, 'tree' => $t, 'parents' => [$head]])['sha'];
    gh('PATCH', '/git/refs/heads/' . branch(), ['sha' => $commit, 'force' => false]);
    page('Gespeichert', '<p class="ok"><b>Gespeichert.</b> „' . h($r['title']) . '“ ist in etwa 1–2 Minuten auf der Rezeptseite aktualisiert (Commit ' . h(substr($commit, 0, 7)) . ').</p>'
      . '<p><a href="../#rezept/' . h($r['id']) . '">Zum Rezept</a> · <a href="./">Weitere Rezepte bearbeiten</a></p>');
    exit;
  }

  $all = load_recipes();
  $cats = categories();
  if ($neu) { page('Neues Rezept', form(['categories' => [], 'ingredients' => [], 'steps' => []], $cats, true)); exit; }
  if ($id !== '') {
    foreach ($all as $r) if (($r['id'] ?? '') === $id) { page($r['title'], '<p><a href="../#rezept/' . h($id) . '">← Zum Rezept</a></p>' . form($r, $cats, false)); exit; }
    fail(404, 'Rezept nicht gefunden.');
  }
  usort($all, fn($a, $b) => strcoll($a['title'], $b['title']));
  $li = '';
  foreach ($all as $r) $li .= '<li><a href="./?id=' . h($r['id']) . '"><img src="../' . h($r['image']) . '" alt=""><span><b>' . h($r['title']) . '</b><small>' . h($r['portions']) . ' · ' . h($r['source']) . '</small></span></a></li>';
  page('Rezepte bearbeiten', '<h1>Rezepte bearbeiten</h1><p><a class="btn" href="./?neu=1" style="text-decoration:none;display:inline-block">+ Neues Rezept</a></p><ul class="list">' . $li . '</ul>');
} catch (Throwable $e) {
  fail(502, 'Speichern bzw. Laden ist fehlgeschlagen: ' . $e->getMessage() . '. Bitte später noch einmal versuchen.');
}
