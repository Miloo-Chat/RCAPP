/**
 * test_no_bots.cjs
 * 
 * Verifies Task 9e / Item 5 Requirements:
 * 1. Connects two sockets, waits 70 seconds with no human peer (using fake timers),
 *    and proves no session is ever created for a bot.
 * 2. Proves that any unknown bot-related socket event (request_milo_chat, decline_milo,
 *    canned replies, etc.) is strictly ignored and never triggers a bot session.
 * 3. Proves unmatched send_message while waiting in queue never evokes a bot response.
 */

const assert = require('assert');
const path = require('path');
const FakeTimers = require('@sinonjs/fake-timers');

// Ensure module resolution finds socket.io & socket.io-client across monorepo structure
const clientIoPath = path.resolve(__dirname, '../client/node_modules/socket.io-client');
const ioClient = require(clientIoPath);

process.env.PORT = '5199';
process.env.NODE_ENV = 'test';
process.env.SESSION_SECRET = 'test-session-secret-key-32bytes-long';
process.env.TURNSTILE_SECRET_KEY = '1x0000000000000000000000000000000AA';

async function runNoBotsTestSuite() {
  console.log('================================================================');
  console.log('🛡️  VERIFYING COMPLETE REMOVAL OF AI BOTS & AUTOMATED SESSIONS');
  console.log('================================================================\n');

  // Load server module in-process
  const { server } = require('../server/index.js');
  const metrics = require('../server/metrics.js');

  // Wait briefly for server socket binding
  await new Promise((r) => setTimeout(r, 600));

  const SERVER_URL = 'http://localhost:5199';

  console.log('--- Test 1: Connect Two Sockets, Wait 70s with No Matching Peer (Fake Timers) ---');

  const socket1 = ioClient(SERVER_URL, {
    transports: ['websocket'],
    forceNew: true,
  });

  const socket2 = ioClient(SERVER_URL, {
    transports: ['websocket'],
    forceNew: true,
  });

  await Promise.all([
    new Promise((resolve, reject) => {
      const t = setTimeout(() => reject(new Error('Socket 1 connection timeout')), 3000);
      socket1.on('connect', () => { clearTimeout(t); resolve(); });
    }),
    new Promise((resolve, reject) => {
      const t = setTimeout(() => reject(new Error('Socket 2 connection timeout')), 3000);
      socket2.on('connect', () => { clearTimeout(t); resolve(); });
    }),
  ]);

  console.log('✓ Sockets 1 and 2 successfully connected to server.');

  const socket1Events = [];
  const socket2Events = [];

  socket1.on('match_found', (data) => socket1Events.push({ type: 'match_found', data }));
  socket1.on('receive_message', (data) => socket1Events.push({ type: 'receive_message', data }));
  socket2.on('match_found', (data) => socket2Events.push({ type: 'match_found', data }));
  socket2.on('receive_message', (data) => socket2Events.push({ type: 'receive_message', data }));

  // Socket 1 joins text queue, Socket 2 joins video queue
  // Since their media modes differ, they will NOT match each other and both have 0 human peers available
  const dummyTurnstileToken = '1234567890:mock'; // Dev token
  // Generate valid turnstile token matching server validation logic
  const crypto = require('crypto');
  const validTimestamp = Date.now();
  const validSig = crypto.createHmac('sha256', process.env.SESSION_SECRET).update(String(validTimestamp)).digest('hex');
  const validTurnstileToken = `${validTimestamp}:${validSig}`;

  // Install fake timers to intercept setTimeout
  const clock = FakeTimers.install({
    toFake: ['setTimeout', 'clearTimeout'],
  });

  socket1.emit('find_match', {
    mood: 'any',
    mediaMode: 'text',
    turnstileToken: validTurnstileToken,
  });

  socket2.emit('find_match', {
    mood: 'any',
    mediaMode: 'video',
    turnstileToken: validTurnstileToken,
  });

  // Give microtasks time to execute and queue timeouts
  await clock.tickAsync(200);

  console.log('- Advancing clock by 70 seconds (fake timers)...');
  await clock.tickAsync(70000);

  // Uninstall fake timers so socket.io cleanup functions normally
  clock.uninstall();

  // Give small async tick for any pending microtasks
  await new Promise((r) => setTimeout(r, 100));

  assert.strictEqual(
    socket1Events.length,
    0,
    `Socket 1 must receive zero events after 70s with no peer. Received: ${JSON.stringify(socket1Events)}`
  );
  assert.strictEqual(
    socket2Events.length,
    0,
    `Socket 2 must receive zero events after 70s with no peer. Received: ${JSON.stringify(socket2Events)}`
  );

  console.log('✓ PASS: Sockets waited 70s with no human peer; zero bot sessions or matches created.');

  // ---------------------------------------------------------------------------
  // Test 2: Prove unknown bot-related socket events are completely ignored
  // ---------------------------------------------------------------------------
  console.log('\n--- Test 2: Verify Unknown Bot-Related Socket Events Are Completely Ignored ---');

  let botEventTriggered = false;
  socket1.on('match_found', () => { botEventTriggered = true; });
  socket1.on('receive_message', () => { botEventTriggered = true; });

  // 1. Emit obsolete request_milo_chat
  socket1.emit('request_milo_chat');
  await new Promise((r) => setTimeout(r, 200));
  assert.strictEqual(botEventTriggered, false, 'request_milo_chat must be completely ignored');

  // 2. Emit decline_milo
  socket1.emit('decline_milo');
  await new Promise((r) => setTimeout(r, 100));
  assert.strictEqual(botEventTriggered, false, 'decline_milo must be completely ignored');

  // 3. Emit custom/canned bot events
  socket1.emit('milo_chat_message', { text: 'hello' });
  socket1.emit('canned_reply', { id: 'test' });
  socket1.emit('handoff_ready');
  await new Promise((r) => setTimeout(r, 100));
  assert.strictEqual(botEventTriggered, false, 'All legacy bot events must be completely ignored');

  // 4. Emit send_message while alone in queue
  socket1.emit('send_message', { text: 'Are you an AI bot?' });
  await new Promise((r) => setTimeout(r, 300));
  assert.strictEqual(botEventTriggered, false, 'send_message while unmatched must never trigger bot reply');

  console.log('✓ PASS: Server strictly ignored all bot-related socket events with zero side-effects.');

  // ---------------------------------------------------------------------------
  // Test 3: Metrics Integrity
  // ---------------------------------------------------------------------------
  console.log('\n--- Test 3: Verify Server Metrics Exclude Bot Funnels ---');
  const summary = metrics.getSummary();
  assert.strictEqual(summary.aiMetrics, undefined, 'aiMetrics must NOT exist on server metrics');
  assert.strictEqual(typeof summary.waitTimeouts, 'number', 'waitTimeouts metric must exist');
  assert.ok(summary.waitTimeouts >= 2, 'waitTimeouts must record the 2 timed-out human sessions');

  const csv = metrics.exportCSV();
  assert.strictEqual(csv.includes('AI Funnel'), false, 'CSV export must NOT contain AI Funnel');
  assert.strictEqual(csv.includes('AI Offered'), false, 'CSV export must NOT contain AI Offered');
  console.log('✓ PASS: Server metrics strictly track human wait times and zero bot metrics.');

  // Clean up sockets from Tests 1-3
  socket1.disconnect();
  socket2.disconnect();
  await new Promise(r => setTimeout(r, 100));

  // ---------------------------------------------------------------------------
  // Test 4: Verify User Matched at 20s Does NOT Record a Wait Timeout
  // ---------------------------------------------------------------------------
  console.log('\n--- Test 4: Verify User Matched at 20s Does NOT Record a Wait Timeout ---');

  const initialTimeouts = metrics.getSummary().waitTimeouts;

  const socketA = ioClient(SERVER_URL, { transports: ['websocket'], forceNew: true });
  const socketB = ioClient(SERVER_URL, { transports: ['websocket'], forceNew: true });

  await Promise.all([
    new Promise(res => socketA.on('connect', res)),
    new Promise(res => socketB.on('connect', res)),
  ]);

  let matchedA = false;
  let matchedB = false;
  socketA.on('match_found', () => { matchedA = true; });
  socketB.on('match_found', () => { matchedB = true; });

  const clock2 = FakeTimers.install({ toFake: ['setTimeout', 'clearTimeout'] });

  // Socket A joins queue at t=0
  socketA.emit('find_match', { mood: 'any', mediaMode: 'text', turnstileToken: validTurnstileToken });
  await new Promise(r => setImmediate(r));
  await clock2.tickAsync(100);
  await new Promise(r => setImmediate(r));

  // Advance clock by 20 seconds
  console.log('- Socket A waiting for 20 seconds...');
  await clock2.tickAsync(20000);

  // At t=20s, Socket B joins with same mediaMode ('text') and matches Socket A
  console.log('- Socket B joins text queue at 20s and matches Socket A...');
  socketB.emit('find_match', { mood: 'any', mediaMode: 'text', turnstileToken: validTurnstileToken });
  await new Promise(r => setImmediate(r));
  await clock2.tickAsync(100);
  await new Promise(r => setImmediate(r));

  assert.strictEqual(matchedA, true, 'Socket A must receive match_found');
  assert.strictEqual(matchedB, true, 'Socket B must receive match_found');

  // Advance clock past the 60s mark (advance another 50s so t=70s total)
  console.log('- Advancing clock by another 50s (t=70s total, past 60s mark)...');
  await clock2.tickAsync(50000);

  clock2.uninstall();
  await new Promise(r => setTimeout(r, 100));

  const afterTimeouts = metrics.getSummary().waitTimeouts;
  assert.strictEqual(
    afterTimeouts,
    initialTimeouts,
    `Wait timeouts must NOT increase for users matched at 20s. Initial: ${initialTimeouts}, After: ${afterTimeouts}`
  );
  console.log('✓ PASS: User matched at 20s had waitTimeoutTimer cleared; 0 wait timeouts recorded at 60s.');

  // ---------------------------------------------------------------------------
  // Test 5: Verify Socket Can Never Be in waitingQueue Twice
  // ---------------------------------------------------------------------------
  console.log('\n--- Test 5: Verify Socket Can Never Be in waitingQueue Twice ---');
  const { waitingQueue } = require('../server/index.js');
  const socketC = ioClient(SERVER_URL, { transports: ['websocket'], forceNew: true });
  await new Promise(res => socketC.on('connect', res));

  socketC.emit('find_match', { mood: 'any', mediaMode: 'video', turnstileToken: validTurnstileToken });
  await new Promise(r => setTimeout(r, 1050));
  socketC.emit('find_match', { mood: 'any', mediaMode: 'video', turnstileToken: validTurnstileToken });
  await new Promise(r => setTimeout(r, 1050));

  const socketCOccurrences = waitingQueue.filter(u => u.id === socketC.id).length;
  assert.strictEqual(socketCOccurrences, 1, `Socket C must appear exactly once in waitingQueue, found: ${socketCOccurrences}`);
  console.log('✓ PASS: Socket cannot appear in waitingQueue twice.');

  // ---------------------------------------------------------------------------
  // Test 6: Verify leave_chat Clears Waiting Queue & Timer
  // ---------------------------------------------------------------------------
  console.log('\n--- Test 6: Verify leave_chat Clears Waiting Queue & Timer ---');
  socketC.emit('leave_chat');
  await new Promise(r => setTimeout(r, 150));
  const socketCAfterLeave = waitingQueue.filter(u => u.id === socketC.id).length;
  assert.strictEqual(socketCAfterLeave, 0, `Socket C must be completely removed from waitingQueue after leave_chat`);
  console.log('✓ PASS: leave_chat successfully cleared socket from waitingQueue and cancelled timer.');

  socket1.disconnect();
  socket2.disconnect();
  socketA.disconnect();
  socketB.disconnect();
  socketC.disconnect();
  server.close();

  console.log('\n================================================================');
  console.log('🎉 ALL NO-BOTS SERVER INVARIANT TESTS PASSED SUCCESSFULLY [PASS]');
  console.log('================================================================\n');
  process.exit(0);
}

runNoBotsTestSuite().catch((err) => {
  console.error('\n❌ FAIL: No-bots test suite encountered an error:', err);
  process.exit(1);
});
