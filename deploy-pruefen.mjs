// Deployment verification only. No server settings or saved URLs are changed.
import { pathToFileURL } from 'node:url';

const hosts = new Set(['heger.earth', 'www.heger.earth']);
const redirects = new Set([301, 302, 303, 307, 308]);

function checkedUrl(value, path) {
  const url = new URL(value);
  if (!hosts.has(url.hostname) || !['http:', 'https:'].includes(url.protocol) || url.port || url.username || url.password || url.pathname !== path || url.search || url.hash) {
    throw new Error('Unerwartetes Prüfziel; keine Zugangsdaten gesendet.');
  }
  return url;
}

async function resolveAnonymous(entry, path, fetchImpl) {
  let url = checkedUrl(entry, path);
  const seen = new Set();
  for (let count = 0; count <= 5; count++) {
    if (seen.has(url.href)) throw new Error('Weiterleitungsschleife im Prüfaufruf.');
    seen.add(url.href);
    const response = await fetchImpl(url.href, { redirect: 'manual', signal: AbortSignal.timeout(20000) });
    await response.body?.cancel();
    if (!redirects.has(response.status)) return { url, status: response.status, redirects: count };
    if (count === 5) throw new Error('Zu viele Weiterleitungen im Prüfaufruf.');
    const location = response.headers.get('location');
    if (!location) throw new Error('Weiterleitung ohne Ziel.');
    const next = checkedUrl(new URL(location, url).href, path);
    if (url.protocol === 'https:' && next.protocol !== 'https:') throw new Error('Unsichere Rückleitung abgewiesen.');
    url = next;
  }
  throw new Error('Prüfziel nicht ermittelt.');
}

export async function checkEditing({ password, fetchImpl = fetch, entry = 'http://heger.earth/rezepte/bearbeiten/' } = {}) {
  // Resolve without credentials first. Never use authenticated redirect following.
  const target = await resolveAnonymous(entry, '/rezepte/bearbeiten/', fetchImpl);
  if (target.status !== 401) throw new Error(`Bearbeiten ohne Passwort: HTTP ${target.status} statt 401.`);
  if (target.url.protocol !== 'https:') throw new Error('Kein verifiziertes sicheres Ziel für die Zugangskontrolle.');
  const htaccess = await fetchImpl(new URL('.htaccess', target.url).href, { redirect: 'manual', signal: AbortSignal.timeout(20000) });
  await htaccess.body?.cancel();
  if (![401, 403].includes(htaccess.status)) throw new Error(`Schutz der .htaccess nicht bestätigt: HTTP ${htaccess.status}.`);
  if (typeof password !== 'string' || !password) throw new Error('Zugangskontrolle nicht geprüft: Passwort fehlt.');
  const authenticated = await fetchImpl(target.url.href, {
    redirect: 'manual', signal: AbortSignal.timeout(20000),
    headers: { authorization: 'Basic ' + Buffer.from('ernesto:' + password).toString('base64') }
  });
  if (authenticated.status !== 200) {
    await authenticated.body?.cancel();
    throw new Error(`Bearbeiten mit Passwort: HTTP ${authenticated.status} statt 200; keine Weiterleitung mit Zugangsdaten.`);
  }
  if (!(await authenticated.text()).includes('Rezepte bearbeiten')) throw new Error('Erwartete Bearbeiten-Oberfläche nicht bestätigt.');
  return { anonymous: target.status, authenticated: authenticated.status, htaccess: htaccess.status, redirects: target.redirects };
}

export async function checkPublic({ fetchImpl = fetch, entry = 'http://heger.earth/rezepte/' } = {}) {
  const target = await resolveAnonymous(entry, '/rezepte/', fetchImpl);
  if (target.status !== 200) throw new Error(`Rezeptseite: HTTP ${target.status} statt 200.`);
  return { public: target.status, redirects: target.redirects };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    const mode = process.argv[2];
    const result = mode === 'bearbeiten' ? await checkEditing({ password: process.env.EDIT_PASSWORD })
      : mode === 'seite' ? await checkPublic(process.argv[3] ? { entry: process.argv[3] } : {}) : null;
    if (!result) throw new Error('Prüfmodus bearbeiten oder seite erforderlich.');
    console.log('PRÜFUNG: ' + JSON.stringify(result));
  } catch (error) {
    console.error('PRÜFUNG: FEHLER – ' + error.message);
    process.exitCode = 1;
  }
}
