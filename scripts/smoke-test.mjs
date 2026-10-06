import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'services');
const gatewayPort = 18080;

const children = [];

function start(name, cwd, env = {}) {
  const childEnv = { ...process.env, ...env };
  if (!env.PORT) {
    delete childEnv.PORT;
  }
  const child = spawn(process.execPath, ['src/index.js'], {
    cwd: path.join(root, cwd),
    env: childEnv,
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  children.push(child);
  child.stdout.on('data', (d) => process.stdout.write(`[${name}] ${d}`));
  child.stderr.on('data', (d) => process.stderr.write(`[${name} err] ${d}`));
  return child;
}

async function waitHealth(url, attempts = 30) {
  for (let i = 0; i < attempts; i += 1) {
    try {
      const res = await fetch(url);
      if (res.ok) {
        return true;
      }
    } catch {
      // retry
    }
    await new Promise((r) => setTimeout(r, 300));
  }
  return false;
}

function shutdown() {
  for (const c of children) {
    c.kill('SIGTERM');
  }
}

process.on('exit', shutdown);
process.on('SIGINT', () => {
  shutdown();
  process.exit(1);
});

start('users', 'users-service', { PORT: '3001' });
start('catalog', 'catalog-service', { PORT: '3002' });
start('notifications', 'notifications-service', { PORT: '3004' });
start('orders', 'orders-service', {
  PORT: '3003',
  USERS_SERVICE_URL: 'http://127.0.0.1:3001',
  CATALOG_SERVICE_URL: 'http://127.0.0.1:3002',
  NOTIFICATIONS_SERVICE_URL: 'http://127.0.0.1:3004',
});
start('gateway', 'api-gateway', {
  PORT: String(gatewayPort),
  USERS_SERVICE_URL: 'http://127.0.0.1:3001',
  CATALOG_SERVICE_URL: 'http://127.0.0.1:3002',
  ORDERS_SERVICE_URL: 'http://127.0.0.1:3003',
  NOTIFICATIONS_SERVICE_URL: 'http://127.0.0.1:3004',
});

const ok = await waitHealth(`http://127.0.0.1:${gatewayPort}/health`);
if (!ok) {
  console.error('Gateway health timeout');
  shutdown();
  process.exit(1);
}

const successBody = {
  userId: 'usr-001',
  lines: [{ bookId: 'book-101', quantity: 1 }],
};
const successRes = await fetch(`http://127.0.0.1:${gatewayPort}/api/orders`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(successBody),
});
const successJson = await successRes.json();
console.log('success status', successRes.status, successJson.orderId ? 'order ok' : successJson);

const conflictBody = {
  userId: 'usr-001',
  lines: [{ bookId: 'book-103', quantity: 1 }],
};
const conflictRes = await fetch(`http://127.0.0.1:${gatewayPort}/api/orders`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(conflictBody),
});
console.log('conflict status', conflictRes.status);

shutdown();
if (successRes.status !== 201 || conflictRes.status !== 409) {
  process.exit(1);
}
console.log('smoke test passed');
