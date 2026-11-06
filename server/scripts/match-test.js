/**
 * server/scripts/match-test.js
 * 
 * Matchmaking verification script using socket.io-client.
 * 
 * Verifies:
 * 1. Two clients with distinct clientIds and distinct IPs (via X-Forwarded-For)
 *    pair successfully within 10 seconds following real client Turnstile + find_match flow.
 * 2. Two sockets with identical clientId should still pair (original matching logic based only on socketId and mediaMode).
 */

const assert = require('assert');
const path = require('path');

let ioClient;
try {
  ioClient = require('socket.io-client');
} catch (_) {
  ioClient = require(path.resolve(__dirname, '../../client/node_modules/socket.io-client'));
}

const TEST_PORT = process.env.PORT || '5198';
process.env.PORT = TEST_PORT;
process.env.NODE_ENV = process.env.NODE_ENV || 'test';
process.env.SESSION_SECRET = process.env.SESSION_SECRET || 'miloo-match-test-session-secret';
process.env.TURNSTILE_SECRET_KEY = process.env.TURNSTILE_SECRET_KEY || '1x0000000000000000000000000000000AA';

const SERVER_URL = process.env.SERVER_URL || `http://localhost:${TEST_PORT}`;

// Obtain Turnstile verificationToken via server endpoint
async function getTurnstileToken(clientIp = '198.51.100.1') {
  const res = await fetch(`${SERVER_URL}/api/verify-turnstile`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Forwarded-For': clientIp,
    },
    body: JSON.stringify({ token: 'XXXX.DUMMY.PASS.TOKEN.XXXX' }),
  });
  const data = await res.json();
  if (!res.ok || !data.verified || !data.verificationToken) {
    throw new Error(`Turnstile verification failed: ${JSON.stringify(data)}`);
  }
  return data.verificationToken;
}

function createSocket(clientId, clientIp) {
  return ioClient(SERVER_URL, {
    transports: ['websocket'],
    forceNew: true,
    auth: { clientId, fingerprint: `fp_${clientId}` },
    query: { clientId },
    extraHeaders: {
      'X-Forwarded-For': clientIp,
    },
  });
}

async function runMatchTest() {
  console.log('================================================================');
  console.log('🔍 MILOO MATCHMAKING INTEGRATION TEST');
  console.log(`   Target Server: ${SERVER_URL}`);
  console.log('================================================================\n');

  // If running locally against self, require server module
  let localServer = null;
  if (!process.env.SERVER_URL) {
    const serverModule = require('../index.js');
    localServer = serverModule.server;
    await new Promise((r) => setTimeout(r, 600));
  }

  // ---------------------------------------------------------------------------
  // TEST 1: Distinct clientIds & IPs must pair within 10 seconds
  // ---------------------------------------------------------------------------
  console.log('--- TEST 1: Two Distinct Clients (Different clientIds & IPs) ---');
  const clientIdA = `uid_user_A_${Date.now()}`;
  const clientIdB = `uid_user_B_${Date.now()}`;
  const ipA = '198.51.100.10';
  const ipB = '198.51.100.20';

  console.log(`- Requesting Turnstile verification tokens...`);
  const [tokenA, tokenB] = await Promise.all([
    getTurnstileToken(ipA),
    getTurnstileToken(ipB),
  ]);
  console.log(`  ✓ Token A verified: ${tokenA.split(':')[0]}:...`);
  console.log(`  ✓ Token B verified: ${tokenB.split(':')[0]}:...`);

  console.log(`- Connecting Sockets A & B with distinct clientIds and IPs...`);
  const socketA = createSocket(clientIdA, ipA);
  const socketB = createSocket(clientIdB, ipB);

  await Promise.all([
    new Promise((resolve, reject) => {
      socketA.on('connect', resolve);
      socketA.on('connect_error', reject);
    }),
    new Promise((resolve, reject) => {
      socketB.on('connect', resolve);
      socketB.on('connect_error', reject);
    }),
  ]);
  console.log(`  ✓ Socket A connected (id: ${socketA.id}, clientId: ${clientIdA})`);
  console.log(`  ✓ Socket B connected (id: ${socketB.id}, clientId: ${clientIdB})`);

  const matchPromiseA = new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('Socket A match timeout (> 10s)')), 10000);
    socketA.on('match_found', (data) => {
      clearTimeout(timer);
      resolve(data);
    });
  });

  const matchPromiseB = new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('Socket B match timeout (> 10s)')), 10000);
    socketB.on('match_found', (data) => {
      clearTimeout(timer);
      resolve(data);
    });
  });

  const t0 = Date.now();
  console.log(`- Emitting 'find_match' with real client payload...`);
  socketA.emit('find_match', {
    mood: 'any',
    intent: 'chat',
    mediaMode: 'text',
    trustScore: 50,
    turnstileToken: tokenA,
  });

  // Short staggered delay as happens in real world
  await new Promise((r) => setTimeout(r, 200));

  socketB.emit('find_match', {
    mood: 'any',
    intent: 'chat',
    mediaMode: 'text',
    trustScore: 50,
    turnstileToken: tokenB,
  });

  const [matchA, matchB] = await Promise.all([matchPromiseA, matchPromiseB]);
  const duration = ((Date.now() - t0) / 1000).toFixed(2);

  console.log(`  ✓ MATCHED in ${duration}s!`);
  console.log(`    Socket A partnerId: ${matchA.partnerId} (expected ${socketB.id}) | initiator: ${matchA.initiator}`);
  console.log(`    Socket B partnerId: ${matchB.partnerId} (expected ${socketA.id}) | initiator: ${matchB.initiator}`);

  assert.strictEqual(matchA.partnerId, socketB.id, 'Socket A must be paired with Socket B');
  assert.strictEqual(matchB.partnerId, socketA.id, 'Socket B must be paired with Socket A');
  assert.strictEqual(matchA.initiator, !matchB.initiator, 'One socket must be initiator and the other non-initiator');
  console.log('✓ PASS: Test 1 paired successfully within 10 seconds.\n');

  socketA.disconnect();
  socketB.disconnect();
  await new Promise((r) => setTimeout(r, 300));

  // ---------------------------------------------------------------------------
  // TEST 2: Two sockets with identical clientId should still pair
  // ---------------------------------------------------------------------------
  console.log('--- TEST 2: Two Sockets with IDENTICAL clientId Should Still Pair ---');
  const sharedClientId = `uid_identical_${Date.now()}`;
  const sharedIp = '203.0.113.99';

  console.log(`- Both sockets use identical clientId: ${sharedClientId}`);
  const [tokenSame1, tokenSame2] = await Promise.all([
    getTurnstileToken(sharedIp),
    getTurnstileToken(sharedIp),
  ]);

  const socketC1 = createSocket(sharedClientId, sharedIp);
  const socketC2 = createSocket(sharedClientId, sharedIp);

  await Promise.all([
    new Promise((resolve, reject) => {
      socketC1.on('connect', resolve);
      socketC1.on('connect_error', reject);
    }),
    new Promise((resolve, reject) => {
      socketC2.on('connect', resolve);
      socketC2.on('connect_error', reject);
    }),
  ]);
  console.log(`  ✓ Socket C1 connected (id: ${socketC1.id}, clientId: ${sharedClientId})`);
  console.log(`  ✓ Socket C2 connected (id: ${socketC2.id}, clientId: ${sharedClientId})`);

  const matchPromiseC1 = new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('Socket C1 match timeout (> 10s)')), 10000);
    socketC1.on('match_found', (data) => {
      clearTimeout(timer);
      resolve(data);
    });
  });

  const matchPromiseC2 = new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('Socket C2 match timeout (> 10s)')), 10000);
    socketC2.on('match_found', (data) => {
      clearTimeout(timer);
      resolve(data);
    });
  });

  const t1 = Date.now();
  console.log(`- Emitting 'find_match' for sockets with identical clientId...`);
  socketC1.emit('find_match', {
    mood: 'any',
    intent: 'chat',
    mediaMode: 'text',
    trustScore: 50,
    turnstileToken: tokenSame1,
  });

  await new Promise((r) => setTimeout(r, 200));

  socketC2.emit('find_match', {
    mood: 'any',
    intent: 'chat',
    mediaMode: 'text',
    trustScore: 50,
    turnstileToken: tokenSame2,
  });

  const [matchC1, matchC2] = await Promise.all([matchPromiseC1, matchPromiseC2]);
  const durationC = ((Date.now() - t1) / 1000).toFixed(2);

  console.log(`  ✓ MATCHED in ${durationC}s!`);
  console.log(`    Socket C1 partnerId: ${matchC1.partnerId} (expected ${socketC2.id}) | initiator: ${matchC1.initiator}`);
  console.log(`    Socket C2 partnerId: ${matchC2.partnerId} (expected ${socketC1.id}) | initiator: ${matchC2.initiator}`);

  assert.strictEqual(matchC1.partnerId, socketC2.id, 'Socket C1 must pair with Socket C2');
  assert.strictEqual(matchC2.partnerId, socketC1.id, 'Socket C2 must pair with Socket C1');
  assert.strictEqual(matchC1.initiator, !matchC2.initiator, 'One socket must be initiator and the other non-initiator');
  console.log('✓ PASS: Test 2 two sockets with identical clientId paired successfully.\n');

  socketC1.disconnect();
  socketC2.disconnect();

  console.log('================================================================');
  console.log('🎉 ALL MATCHMAKING TESTS PASSED');
  console.log('================================================================');

  if (localServer) {
    localServer.close();
  }
  process.exit(0);
}

runMatchTest().catch((err) => {
  console.error('\n❌ MATCH TEST FAILED:', err);
  process.exit(1);
});

