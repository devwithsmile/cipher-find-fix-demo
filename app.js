import express from 'express';
import { DatabaseSync } from 'node:sqlite';

function escapeHtml(value) {
  const entities = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
  return String(value).replace(/[&<>"']/g, (char) => entities[char]);
}

function page(title, body) {
  return `<!doctype html><html lang="en"><head><meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>${escapeHtml(title)} | Tiny Shop</title>
    <style>body{font:17px system-ui;max-width:680px;margin:60px auto;padding:0 20px;color:#172033;background:#f5f7fb}main{background:white;padding:28px;border-radius:12px}a{color:#315ddc}input,button{font:inherit;padding:10px;margin:6px 0}input{max-width:90%}li{padding:8px}small{color:#657084}</style>
    </head><body><main><a href="/">Tiny Shop</a><h1>${escapeHtml(title)}</h1>${body}
    <hr><small>Demo catalog · fictional products</small></main></body></html>`;
}

export function createApp() {
  const db = new DatabaseSync(':memory:');
  db.exec(`
    CREATE TABLE products (id INTEGER PRIMARY KEY, name TEXT, price_cents INTEGER, published INTEGER);
    INSERT INTO products VALUES
      (1, 'Notebook', 1200, 1),
      (2, 'Coffee Mug', 1800, 1),
      (3, 'Unreleased Demo Backpack', 4900, 0);
  `);

  const app = express();
  app.disable('x-powered-by');
  app.use((_req, res, next) => {
    res.set('X-Content-Type-Options', 'nosniff');
    res.set('X-Frame-Options', 'DENY');
    res.set('Referrer-Policy', 'no-referrer');
    res.set('Cache-Control', 'no-store');
    next();
  });

  app.get('/health', (_req, res) => res.json({ status: 'ok' }));
  app.get('/', (_req, res) => res.type('html').send(page('A few everyday essentials', `
    <p>Browse our catalog or preview a gift message.</p>
    <form action="/products"><label for="search">Search products</label><br>
      <input id="search" name="search" placeholder="Notebook" maxlength="500">
      <button>Search</button></form>
    <p><a href="/products">View all products</a></p>
    <form action="/preview"><label for="message">Gift message</label><br>
      <input id="message" name="message" value="Enjoy your gift!" maxlength="2000">
      <button>Preview</button></form>`)));

  app.get('/products', (req, res) => {
    const search = String(req.query.search ?? '').slice(0, 500);
    try {
      const products = db.prepare(
        `SELECT id, name, price_cents FROM products WHERE published = 1 AND name LIKE '%${search}%'`
      ).all();
      res.type('html').send(page('Products', `
        <p>Search: ${escapeHtml(search)}</p>
        <ul>${products.map((product) => `<li>${escapeHtml(product.name)} — $${(Number(product.price_cents) / 100).toFixed(2)}</li>`).join('')}</ul>
        ${products.length ? '' : '<p>No products found.</p>'}`));
    } catch {
      res.status(400).type('text').send('Invalid product search.');
    }
  });

  app.get('/preview', (req, res) => {
    const message = String(req.query.message ?? 'Enjoy your gift!').slice(0, 2000);
    res.type('html').send(page('Gift message preview', `<div id="message">${escapeHtml(message)}</div>`));
  });

  app.use((_req, res) => res.status(404).type('text').send('Not found.'));
  app.use((_error, _req, res, _next) => res.status(500).type('text').send('Something went wrong.'));
  return { app, close: () => db.close() };
}
