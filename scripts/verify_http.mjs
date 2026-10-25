/** Check a built release over HTTP using disposable accounts and learning data. */
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { createServer } from 'node:net';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { basename, dirname, join, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { randomBytes } from 'node:crypto';
import { once } from 'node:events';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
let checks = 0;

function check(condition, description) {
  assert.ok(condition, description);
  checks += 1;
}

async function unusedPort() {
  const probe = createServer();
  await new Promise((done) => probe.listen(0, '127.0.0.1', done));
  const port = probe.address().port;
  await new Promise((done) => probe.close(done));
  return port;
}

async function waitForServer(base, child) {
  for (let attempt = 0; attempt < 100; attempt += 1) {
    if (child.exitCode !== null) throw new Error('Isolated release server exited before startup');
    try {
      if ((await fetch(base + '/login')).ok) return;
    } catch { /* Retry while the local server is starting. */ }
    await new Promise((done) => setTimeout(done, 200));
  }
  throw new Error('Isolated release server did not become ready');
}

async function request(base, path, method = 'GET', body, cookie) {
  const response = await fetch(base + path, {
    method, redirect: 'manual',
    headers: { ...(body ? { 'Content-Type': 'application/json' } : {}), ...(cookie ? { Cookie: cookie } : {}) },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await response.text();
  let data = null;
  try { data = JSON.parse(text); } catch { /* HTML and static assets are expected. */ }
  return { response, data, text };
}

async function login(base, username, password) {
  const result = await request(base, '/api/auth/login', 'POST', { username, password });
  check(result.response.status === 200, 'authenticate an isolated demo account');
  const header = result.response.headers.get('set-cookie') || '';
  check(/httponly/i.test(header) && /samesite=lax/i.test(header), 'set HttpOnly and SameSite session cookie');
  return header.split(';')[0];
}

async function verifyAccounts(base) {
  check((await request(base, '/api/progress')).response.status === 401, 'deny anonymous progress');
  check((await request(base, '/api/auth/register', 'POST', {})).response.status === 403, 'disable public registration');
  check((await request(base, '/api/setup', 'POST', {})).response.status === 403, 'disable public admin bootstrap');
  check((await request(base, '/api/auth/login', 'POST', { username: 'admin', password: 'invalid' })).response.status === 401, 'deny an incorrect password');
  const admin = await login(base, 'admin', 'admin@123');
  const first = await login(base, 'user01', 'user123456');
  const second = await login(base, 'user02', 'user123456');
  check((await request(base, '/api/admin/users', 'GET', undefined, first)).response.status === 403, 'deny student administration');
  const users = await request(base, '/api/admin/users', 'GET', undefined, admin);
  check(users.data.users.length === 11, 'initialize eleven isolated demo accounts');
  return { admin, first, second };
}

async function verifyProgress(base, first, second) {
  const progress = { completedProblemIds: [1, 1, -1, 99999], notes: { 1: 'Isolated release note' }, unlockedHints: { 1: 8 } };
  check((await request(base, '/api/progress', 'PUT', { progress, userId: 'student-02' }, first)).response.status === 200, 'save authenticated progress');
  const saved = (await request(base, '/api/progress', 'GET', undefined, first)).data.progress;
  check(saved.completedProblemIds.length === 1 && saved.completedProblemIds[0] === 1, 'normalize invalid and duplicate problem IDs');
  check(saved.unlockedHints['1'] === 6 && saved.notes['1'] === progress.notes[1], 'normalize hint levels and persist notes');
  const separate = (await request(base, '/api/progress', 'GET', undefined, second)).data.progress;
  check(separate.completedProblemIds.length === 0 && !separate.notes['1'], 'isolate progress and ignore a caller-supplied user ID');
}

async function verifyAdmin(base, admin) {
  const password = randomBytes(18).toString('hex');
  const created = await request(base, '/api/admin/users', 'POST', { username: 'release_checker', password }, admin);
  check(created.response.status === 200 && created.data.ok, 'create a managed student');
  const id = created.data.user.id;
  check((await request(base, '/api/admin/users', 'DELETE', { userId: 'student-01' }, admin)).response.status === 400, 'protect seeded accounts from deletion');
  const newPassword = randomBytes(18).toString('hex');
  check((await request(base, '/api/admin/users', 'PATCH', { userId: id, password: newPassword }, admin)).data.ok, 'reset a managed student password');
  await login(base, 'release_checker', newPassword);
  check((await request(base, '/api/admin/users', 'DELETE', { userId: id }, admin)).data.ok, 'delete a custom managed student');
}

async function verifyPagesAndAssets(base, cookie) {
  for (const path of ['/', '/learn', '/problem/two-sum', '/wrong-book']) {
    check((await request(base, path, 'GET', undefined, cookie)).response.status === 200, 'serve an authenticated learning page');
  }
  check((await request(base, '/api/video-presentations/two-sum/presentation/index.html')).response.status === 200, 'serve a generated animation');
  check((await request(base, '/api/video-presentations/two-sum/presentation/app.js')).response.status === 200, 'serve its public script');
  // These are denied path strings only; no env file is created or opened.
  for (const path of ['.env', 'presentation/.env', 'presentation/credentials.json', 'audio-segments.json']) {
    check((await request(base, '/api/video-presentations/two-sum/' + path)).response.status === 400, 'reject non-public video resources before file access');
  }
}

async function main() {
  const temporary = await mkdtemp(join(tmpdir(), 'hot100-http-release-'));
  const port = await unusedPort();
  const base = `http://127.0.0.1:${port}`;
  const server = spawn(process.execPath, [join(root, 'node_modules/next/dist/bin/next'), 'start', '-H', '127.0.0.1', '-p', String(port)], {
    cwd: root, windowsHide: true, stdio: ['ignore', 'pipe', 'pipe'],
    env: { ...process.env, NEXT_TELEMETRY_DISABLED: '1', HOT100_DATA_DIR: join(temporary, 'data'), VIDEO_PRESENTATION_ROOT: join(root, 'ship') },
  });
  server.stdout.on('data', () => {});
  server.stderr.on('data', () => {});
  try {
    await waitForServer(base, server);
    const { admin, first, second } = await verifyAccounts(base);
    await verifyProgress(base, first, second);
    await verifyAdmin(base, admin);
    await verifyPagesAndAssets(base, first);
    await request(base, '/api/auth/logout', 'POST', {}, first);
    check((await request(base, '/api/progress', 'GET', undefined, first)).response.status === 401, 'invalidate a logged-out session');
  } finally {
    if (server.exitCode === null) {
      const exited = once(server, 'exit');
      server.kill();
      await exited;
    }
    assert.ok(resolve(temporary).startsWith(resolve(tmpdir()) + sep) && basename(temporary).startsWith('hot100-http-release-'));
    await rm(temporary, { recursive: true, force: true });
  }
  console.log(JSON.stringify({ checksPassed: checks, usedRealAccountData: false, envFilesOpened: 0 }));
}

await main();
