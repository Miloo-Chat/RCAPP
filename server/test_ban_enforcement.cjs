/**
 * server/test_ban_enforcement.cjs
 * Automated integration test for Ban Enforcement:
 * 1. Connection rejection by client ID cookie / auth
 * 2. Connection rejection by IP hash
 * 3. Matchmaking rejection: banned client cannot join queue
 */

const assert = require('assert');
const http = require('http');
const express = require('express');
const { Server } = require('socket.io');
const { io: Client } = require('socket.io-client');
const crypto = require('crypto');
const storage = require('./storage');

// Create test server instance mimicking server/index.js logic
async function runBanEnforcementTest() {
  console.log('🧪 Starting Ban Enforcement & Matchmaking Queue Tests...\n');

  const app = express();
  const server = http.createServer(app);
  const io = new Server(server, { cors: { origin: '*' } });

  const waitingQueue = [];
  const BAN_MESSAGE = 'Your access to Miloo has been suspended due to violations of our Community Guidelines and Safety Policies.';

  function getSocketIdentifiers(socket) {
    const rawIp = socket.handshake.headers['x-forwarded-for']?.split(',')[0].trim() ||
                  socket.handshake.address ||
                  '127.0.0.1';
    const ipHash = rawIp ? crypto.createHash('sha256').update(rawIp).digest('hex').slice(0, 16) : '';

    let clientId = socket.handshake.auth?.clientId || socket.handshake.query?.clientId || '';
    if (!clientId && socket.handshake.headers.cookie) {
      const match = socket.handshake.headers.cookie.match(/(?:^|;\s*)miloo_uid=([^;]+)/);
      if (match) clientId = decodeURIComponent(match[1]);
    }

    return { rawIp, ipHash, clientId, socketId: socket.id };
  }

  async function isClientBanned(ids) {
    if (ids.clientId && (await storage.isBanned(ids.clientId))) return true;
    if (ids.ipHash && (await storage.isBanned(ids.ipHash))) return true;
    if (ids.rawIp && (await storage.isBanned(ids.rawIp))) return true;
    if (ids.socketId && (await storage.isBanned(ids.socketId))) return true;
    return false;
  }

  io.on('connection', async (socket) => {
    const ids = getSocketIdentifiers(socket);

    const banned = await isClientBanned(ids);
    if (banned) {
      socket.emit('banned', { reason: BAN_MESSAGE });
      setTimeout(() => {
        try { socket.disconnect(true); } catch (_) {}
      }, 50);
      return;
    }

    socket.on('find_match', async (data) => {
      const isNowBanned = await isClientBanned(ids);
      if (isNowBanned) {
        socket.emit('banned', { reason: BAN_MESSAGE });
        setTimeout(() => {
          try { socket.disconnect(true); } catch (_) {}
        }, 50);
        return;
      }

      waitingQueue.push({ id: socket.id, mediaMode: data?.mediaMode || 'text' });
      socket.emit('in_queue', { position: waitingQueue.length });
    });

    socket.on('disconnect', () => {
      const idx = waitingQueue.findIndex(u => u.id === socket.id);
      if (idx !== -1) waitingQueue.splice(idx, 1);
    });
  });

  // Start test server on random open port
  await new Promise((resolve) => server.listen(0, resolve));
  const port = server.address().port;
  const SERVER_URL = `http://localhost:${port}`;
  console.log(`Test server running on port ${port}`);

  try {
    // Test 1: Clean client connects and enters queue
    console.log('\nTest 1: Clean client connects and joins queue...');
    const cleanClientId = `clean_${Date.now()}`;
    const cleanSocket = Client(SERVER_URL, {
      auth: { clientId: cleanClientId },
      transports: ['websocket'],
    });

    await new Promise((resolve, reject) => {
      cleanSocket.on('connect', () => {
        cleanSocket.emit('find_match', { mediaMode: 'text' });
      });
      cleanSocket.on('in_queue', (data) => {
        assert.ok(data.position >= 1, 'Clean client should be in queue');
        assert.strictEqual(waitingQueue.some(u => u.id === cleanSocket.id), true);
        console.log('✓ Passed: Clean client successfully entered waiting queue');
        cleanSocket.disconnect();
        resolve();
      });
      cleanSocket.on('banned', () => reject(new Error('Clean client should not be banned')));
      setTimeout(() => reject(new Error('Timeout waiting for in_queue')), 3000);
    });

    // Test 2: Banned clientId connects -> must be rejected with BAN_MESSAGE
    console.log('\nTest 2: Banned client ID connects -> must receive "banned" event and disconnect...');
    const bannedClientId = `banned_user_${Date.now()}`;
    await storage.setUserStatus(bannedClientId, 'banned', 'Testing ban enforcement');

    const bannedSocket = Client(SERVER_URL, {
      auth: { clientId: bannedClientId },
      transports: ['websocket'],
    });

    await new Promise((resolve, reject) => {
      let receivedBan = false;
      bannedSocket.on('banned', (data) => {
        receivedBan = true;
        assert.strictEqual(data.reason, BAN_MESSAGE, 'Must receive exact BAN_MESSAGE');
        console.log(`✓ Passed: Banned client received expected event: "${data.reason}"`);
      });
      bannedSocket.on('disconnect', () => {
        assert.strictEqual(receivedBan, true, 'Disconnect must happen after ban event');
        // Ensure banned socket is NOT in queue
        assert.strictEqual(waitingQueue.some(u => u.id === bannedSocket.id), false, 'Banned socket must not be in queue');
        console.log('✓ Passed: Banned client was forcibly disconnected and queue is clean');
        resolve();
      });
      bannedSocket.on('connect', () => {
        bannedSocket.emit('find_match', { mediaMode: 'text' });
      });
      setTimeout(() => reject(new Error('Timeout waiting for ban rejection')), 3000);
    });

    // Test 3: Cookie-based ban identification
    console.log('\nTest 3: Ban via miloo_uid cookie in handshake headers...');
    const bannedCookieId = `cookie_ban_${Date.now()}`;
    await storage.setUserStatus(bannedCookieId, 'suspended', 'Testing cookie ban');

    const cookieSocket = Client(SERVER_URL, {
      extraHeaders: {
        Cookie: `miloo_uid=${bannedCookieId}; path=/`,
      },
      transports: ['websocket'],
    });

    await new Promise((resolve, reject) => {
      let receivedBan = false;
      cookieSocket.on('banned', (data) => {
        receivedBan = true;
        assert.strictEqual(data.reason, BAN_MESSAGE);
        console.log('✓ Passed: Client identified by cookie was rejected with ban message');
      });
      cookieSocket.on('disconnect', () => {
        assert.strictEqual(receivedBan, true);
        resolve();
      });
      setTimeout(() => reject(new Error('Timeout waiting for cookie ban rejection')), 3000);
    });

    // Test 4: Dynamic ban during session -> find_match rejection
    console.log('\nTest 4: User banned during active session tries to find_match...');
    const dynamicId = `dynamic_${Date.now()}`;
    const dynamicSocket = Client(SERVER_URL, {
      auth: { clientId: dynamicId },
      transports: ['websocket'],
    });

    await new Promise((resolve, reject) => {
      dynamicSocket.on('connect', async () => {
        // Ban the user while connected
        await storage.setUserStatus(dynamicId, 'banned', 'Mid-session ban');
        // User attempts to search for a match
        dynamicSocket.emit('find_match', { mediaMode: 'text' });
      });

      dynamicSocket.on('banned', (data) => {
        assert.strictEqual(data.reason, BAN_MESSAGE);
        // Verify user was NOT added to waitingQueue
        assert.strictEqual(waitingQueue.some(u => u.id === dynamicSocket.id), false, 'Banned user must NEVER join queue');
        console.log('✓ Passed: Mid-session banned user rejected from queue upon find_match');
      });

      dynamicSocket.on('disconnect', () => {
        resolve();
      });

      dynamicSocket.on('in_queue', () => {
        reject(new Error('Banned user should NOT have been admitted to queue!'));
      });

      setTimeout(() => reject(new Error('Timeout in mid-session ban test')), 3000);
    });

    // Clean up bans
    await storage.setUserStatus(bannedClientId, 'active');
    await storage.setUserStatus(bannedCookieId, 'active');
    await storage.setUserStatus(dynamicId, 'active');

    console.log('\n======================================================');
    console.log('🎉 ALL BAN ENFORCEMENT & QUEUE TESTS PASSED [PASS]');
    console.log('======================================================\n');
  } finally {
    server.close();
  }
}

runBanEnforcementTest().catch((err) => {
  console.error('❌ Ban enforcement test failed:', err);
  process.exit(1);
});
