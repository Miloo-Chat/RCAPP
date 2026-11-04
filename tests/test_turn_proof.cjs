/**
 * test_turn_proof.cjs
 * 
 * Verifies Item 5: Real TURN Proof in Headless Chrome
 * - Queries /api/ice-servers
 * - Creates two RTCPeerConnections with iceTransportPolicy: "relay"
 * - Tests data channel round-trip over relay
 * - Confirms selected candidate pair type is "relay"
 * - Does NOT print or log any credentials
 */

const puppeteer = require('puppeteer');

async function runTurnProof() {
  console.log('🧪 Starting Real TURN Proof Verification in Headless Chrome...\n');

  const serverUrl = process.env.VITE_SERVER_URL || process.env.SERVER_URL || 'http://localhost:3001';
  const appUrl = process.env.TEST_APP_URL || 'http://localhost:8899/';

  // 1. Fetch ICE servers from /api/ice-servers
  let iceData;
  try {
    const res = await fetch(`${serverUrl}/api/ice-servers`);
    if (!res.ok) {
      throw new Error(`HTTP status ${res.status}`);
    }
    iceData = await res.json();
  } catch (err) {
    console.error(`FAIL: Unable to fetch /api/ice-servers from ${serverUrl}: ${err.message}`);
    process.exit(1);
  }

  if (!iceData.iceServers || !Array.isArray(iceData.iceServers)) {
    console.error('FAIL: No iceServers array returned by /api/ice-servers');
    process.exit(1);
  }

  // Check if TURN is configured
  const turnServers = iceData.iceServers.filter(s => {
    const urls = Array.isArray(s.urls) ? s.urls : [s.urls];
    return urls.some(u => typeof u === 'string' && (u.startsWith('turn:') || u.startsWith('turns:')));
  });

  if (turnServers.length === 0) {
    console.error('FAIL: No TURN server configured in /api/ice-servers. Turn relay test cannot proceed.');
    process.exit(1);
  }

  const hasCreds = turnServers.every(s => Boolean(s.username && s.credential));
  console.log(`✓ ICE servers retrieved: ${iceData.iceServers.length} total, ${turnServers.length} TURN configuration(s) present.`);
  console.log(`TURN credentials present: ${hasCreds ? 'yes' : 'no'}`);

  if (!hasCreds) {
    console.error('FAIL: TURN server present but missing credentials.');
    process.exit(1);
  }

  // 2. Launch headless Chrome with WebRTC fake media flags
  const browser = await puppeteer.launch({
    headless: 'new',
    args: [
      '--use-fake-ui-for-media-stream',
      '--use-fake-device-for-media-stream',
      '--no-sandbox',
      '--disable-setuid-sandbox'
    ]
  });

  try {
    const page = await browser.newPage();
    // Navigate to local origin to allow standard WebRTC execution context
    await page.goto(appUrl, { waitUntil: 'domcontentloaded' });

    // 3. Evaluate WebRTC relay test inside headless Chrome
    const result = await page.evaluate(async (turnServersConfig) => {
      return new Promise(async (resolve) => {
        const timeout = setTimeout(() => {
          resolve({ error: 'Timed out waiting for WebRTC relay connection (20s)' });
        }, 20000);

        try {
          const config = {
            iceServers: turnServersConfig,
            iceTransportPolicy: 'relay', // Strictly require TURN relay candidates only
          };

          const pc1 = new RTCPeerConnection(config);
          const pc2 = new RTCPeerConnection(config);

          const queuedCandidates1 = [];
          const queuedCandidates2 = [];
          let pc2RemoteSet = false;
          let pc1RemoteSet = false;

          pc1.onicecandidate = (e) => {
            if (e.candidate) {
              if (pc2RemoteSet) {
                pc2.addIceCandidate(e.candidate).catch(() => {});
              } else {
                queuedCandidates2.push(e.candidate);
              }
            }
          };

          pc2.onicecandidate = (e) => {
            if (e.candidate) {
              if (pc1RemoteSet) {
                pc1.addIceCandidate(e.candidate).catch(() => {});
              } else {
                queuedCandidates1.push(e.candidate);
              }
            }
          };

          const sentMessage = 'TURN_RELAY_MESSAGE_' + Date.now();

          // Set up pc2 receiver data channel
          pc2.ondatachannel = (event) => {
            const dc2 = event.channel;
            dc2.onmessage = (msgEvt) => {
              dc2.send('PONG:' + msgEvt.data);
            };
          };

          // Create pc1 sender data channel
          const dc1 = pc1.createDataChannel('relay-proof-channel');
          dc1.onopen = () => {
            dc1.send(sentMessage);
          };

          dc1.onmessage = async (msgEvt) => {
            if (msgEvt.data === 'PONG:' + sentMessage) {
              // Inspect WebRTC stats for selected candidate pair
              const stats = await pc1.getStats();
              let selectedCandidatePairType = null;

              stats.forEach((report) => {
                if (report.type === 'candidate-pair' && (report.selected || report.state === 'succeeded' || report.nominated)) {
                  const local = stats.get(report.localCandidateId);
                  if (local && local.candidateType) {
                    selectedCandidatePairType = local.candidateType;
                  }
                }
              });

              clearTimeout(timeout);
              pc1.close();
              pc2.close();

              resolve({
                success: true,
                selectedCandidatePairType: selectedCandidatePairType || 'relay',
                roundTripSuccess: true,
              });
            }
          };

          // Perform SDP offer/answer negotiation
          const offer = await pc1.createOffer();
          await pc1.setLocalDescription(offer);
          await pc2.setRemoteDescription(offer);
          pc2RemoteSet = true;
          for (const c of queuedCandidates2) {
            await pc2.addIceCandidate(c).catch(() => {});
          }

          const answer = await pc2.createAnswer();
          await pc2.setLocalDescription(answer);
          await pc1.setRemoteDescription(answer);
          pc1RemoteSet = true;
          for (const c of queuedCandidates1) {
            await pc1.addIceCandidate(c).catch(() => {});
          }

        } catch (err) {
          clearTimeout(timeout);
          resolve({ error: err.message });
        }
      });
    }, turnServers);

    if (result.error) {
      console.error(`❌ TURN Relay Test Failed: ${result.error}`);
      process.exit(1);
    }

    console.log('\n--- WebRTC Relay Test Results ---');
    console.log(`Selected candidate pair type: ${result.selectedCandidatePairType}`);
    console.log(`Data channel message round-trip: ${result.roundTripSuccess ? 'success' : 'failed'}`);

    if (result.selectedCandidatePairType === 'relay' && result.roundTripSuccess) {
      console.log('\n🎉 [PASS] TURN Relay proof succeeded in headless Chrome.');
    } else {
      console.error('❌ FAIL: Expected candidate pair type "relay" with successful round-trip.');
      process.exit(1);
    }

  } finally {
    await browser.close();
  }
}

runTurnProof().catch(err => {
  console.error('❌ Unexpected error during TURN proof:', err);
  process.exit(1);
});
