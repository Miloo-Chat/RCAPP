/**
 * test_turn_relay.cjs
 *
 * Verifies that the server provides valid ICE/TURN configurations
 * and validates the structure expected by RTCPeerConnection.
 */

const http = require('http');

async function testIceServersEndpoint() {
  console.log('--- Testing /api/ice-servers Endpoint ---');
  const serverUrl = process.env.VITE_SERVER_URL || process.env.SERVER_URL || 'http://localhost:5000';

  try {
    const res = await fetch(`${serverUrl}/api/ice-servers`);
    if (!res.ok) {
      throw new Error(`HTTP status ${res.status}`);
    }
    const data = await res.json();
    console.log('Received ICE Server configuration from /api/ice-servers: [REDACTED]');

    if (!data.iceServers || !Array.isArray(data.iceServers) || data.iceServers.length === 0) {
      console.error('FAIL: iceServers array is missing or empty');
      process.exit(1);
    }

    const hasStun = data.iceServers.some(s => {
      const urls = Array.isArray(s.urls) ? s.urls : [s.urls];
      return urls.some(u => typeof u === 'string' && u.startsWith('stun:'));
    });

    const hasTurn = data.iceServers.some(s => {
      const urls = Array.isArray(s.urls) ? s.urls : [s.urls];
      return urls.some(u => typeof u === 'string' && (u.startsWith('turn:') || u.startsWith('turns:')));
    });

    const hasTurnCreds = data.iceServers.some(s => {
      const urls = Array.isArray(s.urls) ? s.urls : [s.urls];
      const isTurn = urls.some(u => typeof u === 'string' && (u.startsWith('turn:') || u.startsWith('turns:')));
      return isTurn && Boolean(s.username && s.credential);
    });

    console.log('\nValidation Results:');
    console.log(`- STUN Server Present: ${hasStun ? 'PASS' : 'WARN'}`);
    console.log(`- TURN Server Present: ${hasTurn ? 'PASS' : 'WARN'}`);
    console.log(`TURN credentials present: ${hasTurnCreds ? 'yes' : 'no'}`);

    console.log('\n[PASS] ICE configuration test completed.');
  } catch (err) {
    console.error('FAIL to connect to server /api/ice-servers:', err.message);
    console.log('Note: Ensure the backend server is running on', serverUrl);
    process.exit(1);
  }
}

testIceServersEndpoint();

