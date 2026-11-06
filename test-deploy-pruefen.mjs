import assert from 'node:assert/strict';
import test from 'node:test';
import { checkEditing, checkPublic } from './deploy-pruefen.mjs';

const source = 'http://heger.earth/rezepte/bearbeiten/';
const destination = 'https://www.heger.earth/rezepte/bearbeiten/';
function fixture(responses) {
  const calls = [];
  const fetchImpl = async (url, options) => {
    calls.push({ url, options });
    assert.equal(options.redirect, 'manual');
    const next = responses.shift();
    assert.ok(next, 'Unexpected extra request.');
    return new Response(next.body || '', { status: next.status, headers: next.location ? { location: next.location } : {} });
  };
  return { calls, fetchImpl };
}
const allowed = () => [{ status: 301, location: destination }, { status: 401 }, { status: 403 }, { status: 200, body: 'Rezepte bearbeiten' }];

test('existing redirect: no credentials until fresh verified target request', async () => {
  const f = fixture(allowed());
  assert.deepEqual(await checkEditing({ password: 'synthetic-fixture-only', fetchImpl: f.fetchImpl }), { anonymous: 401, authenticated: 200, htaccess: 403, redirects: 1 });
  assert.deepEqual(f.calls.map(c => c.url), [source, destination, destination + '.htaccess', destination]);
  for (const c of f.calls.slice(0, 3)) assert.equal(c.options.headers?.authorization, undefined);
  assert.ok(f.calls[3].options.headers.authorization.startsWith('Basic '));
});
for (const target of ['https://evil.invalid/rezepte/bearbeiten/', 'https://heger.earth.evil.invalid/rezepte/bearbeiten/', 'https://www.heger.earth/cos/', 'https://user@www.heger.earth/rezepte/bearbeiten/', 'https://www.heger.earth:8443/rezepte/bearbeiten/', 'https://www.heger.earth/rezepte/bearbeiten/?extra=1']) {
  test('reject changed host, path, credentials, port or query: ' + target, async () => {
    const f = fixture([{ status: 301, location: target }]);
    await assert.rejects(checkEditing({ password: 'synthetic-fixture-only', fetchImpl: f.fetchImpl }));
    assert.equal(f.calls.length, 1); assert.equal(f.calls[0].options.headers, undefined);
  });
}
test('authenticated redirect is not followed', async () => {
  const f = fixture([...allowed().slice(0, 3), { status: 302, location: 'https://evil.invalid/' }]);
  await assert.rejects(checkEditing({ password: 'synthetic-fixture-only', fetchImpl: f.fetchImpl })); assert.equal(f.calls.length, 4);
});
test('reject downgrade after secure redirect', async () => {
  const f = fixture([{ status: 301, location: destination }, { status: 302, location: source }]);
  await assert.rejects(checkEditing({ password: 'synthetic-fixture-only', fetchImpl: f.fetchImpl })); assert.equal(f.calls.length, 2);
});
test('redirect loop stops before extra request', async () => {
  const f = fixture([{ status: 301, location: source }]);
  await assert.rejects(checkEditing({ password: 'synthetic-fixture-only', fetchImpl: f.fetchImpl })); assert.equal(f.calls.length, 1);
});
test('open editing page fails before any credentials', async () => {
  const f = fixture([{ status: 200 }]); await assert.rejects(checkEditing({ password: 'synthetic-fixture-only', fetchImpl: f.fetchImpl })); assert.equal(f.calls.length, 1);
});
test('readable htaccess fails before authentication', async () => {
  const f = fixture([{ status: 301, location: destination }, { status: 401 }, { status: 200 }]); await assert.rejects(checkEditing({ password: 'synthetic-fixture-only', fetchImpl: f.fetchImpl })); assert.equal(f.calls.length, 3);
});
test('HTTP-only authentication challenge never receives password', async () => {
  const f = fixture([{ status: 401 }]); await assert.rejects(checkEditing({ password: 'synthetic-fixture-only', fetchImpl: f.fetchImpl })); assert.equal(f.calls.length, 1);
});
test('wrong password fails', async () => {
  const f = fixture([...allowed().slice(0, 3), { status: 401 }]); await assert.rejects(checkEditing({ password: 'synthetic-fixture-only', fetchImpl: f.fetchImpl }));
});
test('unexpected authenticated content fails', async () => {
  const f = fixture([...allowed().slice(0, 3), { status: 200, body: 'Wrong page' }]); await assert.rejects(checkEditing({ password: 'synthetic-fixture-only', fetchImpl: f.fetchImpl }));
});
test('public page uses existing redirect without authentication', async () => {
  const f = fixture([{ status: 301, location: 'https://www.heger.earth/rezepte/' }, { status: 200 }]); assert.deepEqual(await checkPublic({ fetchImpl: f.fetchImpl }), { public: 200, redirects: 1 }); assert.ok(f.calls.every(c => c.options.headers === undefined));
});
test('public server error is not accepted', async () => {
  const f = fixture([{ status: 503 }]); await assert.rejects(checkPublic({ fetchImpl: f.fetchImpl }));
});
