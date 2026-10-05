import { after, before, test } from 'node:test';
import assert from 'node:assert/strict';
import { once } from 'node:events';
import { createApp } from '../app.js';

const { app, close } = createApp();
let server, base;
before(async () => {
  server = app.listen(0, '127.0.0.1');
  await once(server, 'listening');
  base = `http://127.0.0.1:${server.address().port}`;
});
after(async () => {
  await new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
  close();
});

test('health endpoint and homepage are usable', async () => {
  assert.deepEqual(await (await fetch(`${base}/health`)).json(), { status: 'ok' });
  const html = await (await fetch(base)).text();
  assert.match(html, /action="\/products"/);
  assert.match(html, /action="\/preview"/);
});
test('catalog shows public products and supports normal search', async () => {
  const all = await (await fetch(`${base}/products`)).text();
  assert.match(all, /Notebook/);
  assert.match(all, /Coffee Mug/);
  assert.doesNotMatch(all, /Unreleased Demo Backpack/);
  const filtered = await (await fetch(`${base}/products?search=Mug`)).text();
  assert.match(filtered, /Coffee Mug/);
  assert.doesNotMatch(filtered, /Notebook/);
});
test('normal gift messages render', async () => {
  const html = await (await fetch(`${base}/preview?message=Happy%20birthday`)).text();
  assert.match(html, /Happy birthday/);
});
test('unknown routes return 404', async () => {
  assert.equal((await fetch(`${base}/missing`)).status, 404);
});
