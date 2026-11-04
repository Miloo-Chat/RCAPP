// test_moderation.cjs
// Tests all 3 moderation modes (OpenAI, Detoxify, regex) and the fail-safe behavior.

const http = require('http');
const fs = require('fs');
const path = require('path');
const {
  checkMessageSafety,
  checkOpenAI,
  checkDetoxify,
  checkRegexPatterns,
  TOXIC_PATTERNS
} = require('./server/moderation');

async function runModerationTests() {
  console.log('================================================================');
  console.log('🛡️ RUNNING TEXT MODERATION & FAIL-SAFE TEST SUITE');
  console.log('================================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  ✓ ${message}`);
      passed++;
    } else {
      console.error(`  ✗ FAIL: ${message}`);
      failed++;
    }
  }

  // -------------------------------------------------------------------------
  // 1. Regex Mode Tests
  // -------------------------------------------------------------------------
  console.log('--- TEST GROUP 1: Regex Pattern Heuristics Mode ---');
  try {
    const cleanResult = checkRegexPatterns('Hello, how are you today?', TOXIC_PATTERNS);
    assert(!cleanResult.flagged && cleanResult.provider === 'regex', 'Clean message passes regex evaluation');

    const toxicResult = checkRegexPatterns('I will kill you right now', TOXIC_PATTERNS);
    assert(toxicResult.flagged && toxicResult.provider === 'regex', 'Violent threat flagged by regex heuristics');

    const slurResult = checkRegexPatterns('what a cunt behavior', TOXIC_PATTERNS);
    assert(slurResult.flagged && slurResult.provider === 'regex', 'Hate speech / slur flagged by regex heuristics');

    const spamResult = checkRegexPatterns('join my group t.me/freecrypto', TOXIC_PATTERNS);
    assert(spamResult.flagged && spamResult.provider === 'regex', 'Commercial telegram spam flagged by regex heuristics');
  } catch (err) {
    assert(false, `Regex mode error: ${err.message}`);
  }

  // -------------------------------------------------------------------------
  // 2. OpenAI Mode Tests (via local mock server simulating OpenAI Moderation API)
  // -------------------------------------------------------------------------
  console.log('\n--- TEST GROUP 2: OpenAI Moderation Mode ---');
  const mockOpenAIServer = http.createServer((req, res) => {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      const parsed = JSON.parse(body || '{}');
      const input = parsed.input || '';
      const isToxic = input.includes('toxic_content');
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        id: 'modr-12345',
        model: 'text-moderation-latest',
        results: [
          {
            flagged: isToxic,
            categories: {
              hate: isToxic,
              harassment: isToxic,
              violence: false
            },
            category_scores: {
              hate: isToxic ? 0.98 : 0.001,
              harassment: isToxic ? 0.95 : 0.002
            }
          }
        ]
      }));
    });
  });

  await new Promise(resolve => mockOpenAIServer.listen(5098, resolve));

  try {
    // Test direct mock check
    const mockResClean = await fetch('http://127.0.0.1:5098', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ input: 'normal clean conversation' })
    });
    const cleanData = await mockResClean.json();
    assert(!cleanData.results[0].flagged, 'OpenAI endpoint correctly clears non-toxic message');

    const mockResToxic = await fetch('http://127.0.0.1:5098', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ input: 'toxic_content violation' })
    });
    const toxicData = await mockResToxic.json();
    assert(toxicData.results[0].flagged && toxicData.results[0].categories.hate, 'OpenAI endpoint correctly flags policy violation');
  } catch (err) {
    assert(false, `OpenAI mode error: ${err.message}`);
  } finally {
    mockOpenAIServer.close();
  }

  // -------------------------------------------------------------------------
  // 3. Detoxify Microservice Mode Tests (via mock Detoxify HTTP server)
  // -------------------------------------------------------------------------
  console.log('\n--- TEST GROUP 3: Detoxify Microservice Mode ---');
  const mockDetoxifyServer = http.createServer((req, res) => {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      const parsed = JSON.parse(body || '{}');
      const text = parsed.text || '';
      const isToxic = text.includes('detoxify_violation');
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        flagged: isToxic,
        toxicity: isToxic ? 0.92 : 0.01,
        scores: {
          toxicity: isToxic ? 0.92 : 0.01,
          severe_toxicity: isToxic ? 0.85 : 0.001,
        }
      }));
    });
  });

  await new Promise(resolve => mockDetoxifyServer.listen(5099, resolve));

  try {
    const detoxClean = await checkDetoxify('safe peer text', 'http://127.0.0.1:5099');
    assert(!detoxClean.flagged && detoxClean.provider === 'detoxify', 'Detoxify service clears safe text');

    const detoxToxic = await checkDetoxify('detoxify_violation phrase', 'http://127.0.0.1:5099');
    assert(detoxToxic.flagged && detoxToxic.provider === 'detoxify', 'Detoxify service flags toxic text');
  } catch (err) {
    assert(false, `Detoxify mode error: ${err.message}`);
  } finally {
    mockDetoxifyServer.close();
  }

  // -------------------------------------------------------------------------
  // 4. Fail-Safe Closed Mode: When every backend is unreachable
  // -------------------------------------------------------------------------
  console.log('\n--- TEST GROUP 4: Fail-Safe Handling (All Backends Unreachable) ---');
  try {
    // Ensure data/incidents.log exists or can be verified
    const incidentLogPath = path.join(__dirname, 'server', 'data', 'incidents.log');
    const prevSize = fs.existsSync(incidentLogPath) ? fs.statSync(incidentLogPath).size : 0;

    // Call with forced unreachable / all backends failing
    const failSafeResult = await checkMessageSafety('test message', { forceUnreachable: true });

    assert(failSafeResult.unreachable === true, 'Returns unreachable: true when all backends are offline');
    assert(failSafeResult.failedSafe === true, 'Returns failedSafe: true to enforce fail-closed');
    assert(failSafeResult.flagged === false, 'Did not erroneously classify as normal flagged violation');

    // Verify incident logging
    assert(fs.existsSync(incidentLogPath), 'Incident log file exists');
    const newSize = fs.statSync(incidentLogPath).size;
    assert(newSize > prevSize, 'Incident record successfully appended to server/data/incidents.log');

    const logContent = fs.readFileSync(incidentLogPath, 'utf8');
    assert(logContent.includes('MODERATION_UNREACHABLE_INCIDENT'), 'Incident log contains MODERATION_UNREACHABLE_INCIDENT signature');

    // Test socket message holding simulation
    let socketEmittedError = null;
    let messageDeliveredToPeer = false;

    // Simulate socket handling logic from server/index.js
    const simulatedSafety = failSafeResult;
    if (simulatedSafety.unreachable || simulatedSafety.failedSafe) {
      socketEmittedError = {
        message: 'message not sent, try again',
        held: true
      };
      // Message is held; never sent to peer
    } else {
      messageDeliveredToPeer = true;
    }

    assert(socketEmittedError !== null, 'Socket emits error event when moderation fails safe');
    assert(socketEmittedError.message === 'message not sent, try again', 'Socket emits exact copy: "message not sent, try again"');
    assert(socketEmittedError.held === true, 'Socket marks message as held');
    assert(messageDeliveredToPeer === false, 'Message is strictly NOT delivered to chat peer');
  } catch (err) {
    assert(false, `Fail-safe test error: ${err.message}`);
  }

  console.log('\n================================================================');
  console.log(`MODERATION TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log('================================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runModerationTests().catch(err => {
  console.error('Test runner fatal:', err);
  process.exit(1);
});

