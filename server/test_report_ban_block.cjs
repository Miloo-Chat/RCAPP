/**
 * Integration test: reports resolve persistent identifiers, admin bans survive reconnects,
 * and server-side Block really prevents re-matching.
 * Run: node server/test_report_ban_block.cjs   (needs socket.io-client)
 */
const assert = require('assert');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');

process.env.PORT = process.env.PORT || '5077';
process.env.NODE_ENV = 'development';
process.env.ADMIN_PASSWORD_HASH = bcrypt.hashSync('test-pass', 4);
// Empty string (not delete): dotenv never overrides an already-defined variable, so a real
// DATABASE_URL in server/.env can NEVER be loaded by this test. It only uses local JSON files.
process.env.DATABASE_URL = '';
process.env.TEST_ALLOW_NO_DB = '1';

const app = require('./index.js');
const { io: Client } = require('socket.io-client');
const storage = require('./storage');
const base = `http://localhost:${process.env.PORT}`;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
function turnstileToken() {
  const ts = String(Date.now());
  const sig = crypto.createHmac('sha256', process.env.SESSION_SECRET || 'turnstile-verification-salt').update(ts).digest('hex');
  return `${ts}:${sig}`;
}
function connect(clientId, ip) {
  const s = Client(base, {
    auth: { clientId },
    extraHeaders: { 'x-forwarded-for': ip },
    transports: ['websocket'],
    forceNew: true,
    reconnection: false,
  });
  s.events = [];
  s.onAny((ev, data) => s.events.push({ ev, data }));
  return new Promise((resolve) => s.on('connect', () => resolve(s)));
}
const find = (s) => s.emit('find_match', { mediaMode: 'text', turnstileToken: turnstileToken() });
const got = (s, ev) => s.events.find((e) => e.ev === ev);

(async () => {
  await sleep(400);
  // --- Block test ---
  const A = await connect('client_A', '10.0.0.1');
  const B = await connect('client_B', '10.0.0.2');
  find(A); await sleep(200); find(B); await sleep(300);
  assert(got(A, 'match_found') && got(B, 'match_found'), 'A and B should match first');
  const bSocketId = got(A, 'match_found').data.partnerId;
  A.emit('block_partner'); await sleep(100);
  A.events.length = 0; B.events.length = 0;
  await sleep(1100);
  find(A); await sleep(1100); find(B); await sleep(400);
  assert(!got(A, 'match_found') && !got(B, 'match_found'), 'Blocked pair must NOT be re-matched');
  console.log('✓ PASS: blocked pair is not re-matched (server-side block)');
  const C = await connect('client_C', '10.0.0.3');
  find(C); await sleep(400);
  assert(got(C, 'match_found'), 'Unblocked user C should match someone');
  console.log('✓ PASS: unblocked users still match normally');

  // --- Report resolves persistent identifiers (no raw IP) ---
  const res = await fetch(`${base}/api/reports`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ reportedUser: bSocketId, reason: 'harassment' }),
  });
  assert.strictEqual(res.status, 200);
  const { reportId } = await res.json();
  const stored = (await storage.getReports()).find((r) => r.id === reportId);
  assert.strictEqual(stored.reportedClientId, 'client_B');
  assert.strictEqual(stored.reportedIpHash, crypto.createHash('sha256').update('10.0.0.2').digest('hex').slice(0, 16));
  assert(!/^\d+\.\d+\.\d+\.\d+$/.test(stored.reporterId), 'reporterId must never be a raw IP');
  console.log('✓ PASS: report stores clientId + hashed IP (no raw IP)');

  // --- Admin ban survives reconnect (new socket.id) ---
  const login = await fetch(`${base}/api/admin/login`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ password: 'test-pass' }),
  });
  assert.strictEqual(login.status, 200, 'admin login');
  const cookie = login.headers.get('set-cookie').split(';')[0];
  const act = await fetch(`${base}/api/admin/reports/${reportId}/action`, {
    method: 'POST', headers: { 'Content-Type': 'application/json', cookie },
    body: JSON.stringify({ action: 'ban', notes: 'test' }),
  });
  assert.strictEqual(act.status, 200, 'admin action');
  await sleep(300);
  assert(await storage.isBanned('client_B'), 'clientId banned');
  const B2 = await connect('client_B', '10.0.0.99'); // new socket id AND new IP
  await sleep(400);
  assert(got(B2, 'banned'), 'Reconnecting banned client must be rejected');
  console.log('✓ PASS: admin ban persists across reconnect (new socket id, new IP)');
  console.log('\n🎉 ALL REPORT/BAN/BLOCK TESTS PASSED');
  process.exit(0);
})().catch((e) => { console.error('✗ FAIL:', e.message); process.exit(1); });
