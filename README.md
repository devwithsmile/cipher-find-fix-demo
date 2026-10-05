# Cipher Find & Fix demo

A tiny JavaScript/Express shop built as an authorized Cipher test target. It has two deliberately introduced application vulnerabilities and fictional data only. No accounts, credentials, payments, external requests, or persistent database are needed. SQLite runs in memory and resets on restart.

## Run locally

Use Node.js 24 or newer (the Render runtime is pinned to 24).

```sh
npm ci
npm start
```

Open http://localhost:3000. Local startup binds to loopback; Render uses `HOST=0.0.0.0` and its assigned `PORT`.

## The two intended findings

| Finding | Route | Evidence | Expected fix |
| --- | --- | --- | --- |
| SQL injection (CWE-89) | `GET /products?search=...` | Searching for `' OR 1=1 -- ` reveals the unpublished **Unreleased Demo Backpack**. | Bind the search value as a SQL parameter. |
| Reflected XSS (CWE-79) | `GET /preview?message=...` | `<script>document.body.dataset.cipherXss="confirmed"</script>` is emitted as executable HTML. In a browser it sets `document.body.dataset.cipherXss`. | HTML-escape the message before rendering it. |

Both vulnerable statements live in `app.js`. The product-results renderer escapes values so SQL injection does not introduce a second HTML injection point. The home page links to both features for discovery. No login is required.

## Verify

```sh
npm test
npm run verify:issues
```

`npm test` checks normal functionality and should also pass after fixes. The separate verification script reproduces both intentional bugs on a temporary loopback server; it checks raw script reflection, not browser execution. After both fixes, run:

```sh
npm run verify:issues -- --fixed
```

These checks cover the two seeded bugs, not every possible security finding.

## GitHub and Render

The folder is ready to become a GitHub repository. Keep API keys outside it; `.env` files are ignored.

`render.yaml` defines one free Node web service: build `npm ci`, start `npm start`, health check `/health`, and `HOST=0.0.0.0`. No database service or secret environment variables are required. `.node-version` selects Node 24 using [Render's supported runtime configuration](https://render.com/docs/node-version); the app uses [Node's built-in SQLite module](https://nodejs.org/api/sqlite.html).

For the Cipher run, use the deployed Render URL as the web target and this repository as source context. The intended results are two findings and, with Fix access, fixes to the SQL query and message rendering.
