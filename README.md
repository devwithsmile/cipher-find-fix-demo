# Tiny Shop

A small JavaScript/Express application with a product catalog, search, and gift-message preview. It uses an in-memory SQLite database with fictional products; data resets on restart.

## Run locally

Use Node.js 24 or newer. Render uses Node 24.

```sh
npm ci
npm start
```

Open http://localhost:3000. Local startup binds to loopback; Render uses `HOST=0.0.0.0` and its assigned `PORT`.

## Features

- Browse and search products at `/products`.
- Preview a gift message at `/preview`.
- Check service health at `/health`.

## Tests

```sh
npm test
```

## Deploy on Render

`render.yaml` defines a Node web service with:

- Build command: `npm ci`
- Start command: `npm start`
- Health check: `/health`
- Host: `0.0.0.0`

No database service or secret environment variables are required. `.node-version` selects Node 24. Keep API keys outside the repository; `.env` files are ignored.
