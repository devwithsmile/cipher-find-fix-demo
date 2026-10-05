import assert from 'node:assert/strict';
import { once } from 'node:events';
import { createApp } from '../app.js';

// Runs on an isolated local instance, never against an external target.
const fixed = process.argv.includes('--fixed');
const { app, close } = createApp();
const server = app.listen(0, '127.0.0.1');
await once(server, 'listening');
const base = `http://127.0.0.1:${server.address().port}`;
try {
  const query = new URLSearchParams({ search: "' OR 1=1 -- " });
  const products = await (await fetch(`${base}/products?${query}`)).text();
  const sqlInjection = products.includes('Unreleased Demo Backpack');
  const payload = '<script>document.body.dataset.cipherXss="confirmed"</script>';
  const preview = await (await fetch(`${base}/preview?${new URLSearchParams({ message: payload })}`)).text();
  const reflectedXss = preview.includes(payload);
  console.log(`SQL injection: ${sqlInjection ? 'hidden demo product exposed' : 'blocked'}`);
  console.log(`Reflected XSS: ${reflectedXss ? 'unescaped script returned as HTML' : 'blocked'}`);
  assert.equal(sqlInjection, !fixed, 'SQL injection result differs from the expected mode');
  assert.equal(reflectedXss, !fixed, 'XSS result differs from the expected mode');
} finally {
  await new Promise((resolve) => server.close(resolve));
  close();
}
