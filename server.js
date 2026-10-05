import { createApp } from './app.js';

const { app, close } = createApp();
const port = Number(process.env.PORT || 3000);
const host = process.env.HOST || '127.0.0.1';
const server = app.listen(port, host, () => console.log(`Tiny Shop listening on http://${host}:${port}`));
for (const signal of ['SIGTERM', 'SIGINT']) {
  process.once(signal, () => server.close(() => { close(); process.exit(0); }));
}
