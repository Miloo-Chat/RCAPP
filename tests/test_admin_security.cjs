// test_admin_security.cjs
// Tests admin authentication invariants, lockout after 5 failed attempts, session cookie enforcement, and production startup guards.

const { execSync, spawn } = require('child_process');
const http = require('http');
const bcrypt = require('../server/node_modules/bcryptjs');

async function runAdminSecurityTests() {
  console.log('================================================================');
  console.log('🔒 RUNNING ADMIN SECURITY & SESSION ENFORCEMENT AUDIT');
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

  // 1. In production, server must refuse to start if ADMIN_PASSWORD_HASH is missing
  console.log('--- TEST 1: Production Startup Guard (Missing ADMIN_PASSWORD_HASH) ---');
  try {
    execSync('NODE_ENV=production SESSION_SECRET=testsecret node server/index.js', {
      encoding: 'utf8',
      stdio: 'pipe',
      timeout: 3000,
    });
    assert(false, 'Server should have refused to start in production without ADMIN_PASSWORD_HASH');
  } catch (err) {
    const stderr = err.stderr ? err.stderr.toString() : '';
    assert(stderr.includes('FATAL: Production mode requires ADMIN_PASSWORD_HASH'), 'Refused to start in production mode when ADMIN_PASSWORD_HASH was missing');
  }

  // 2. In production, server must refuse to start if Turnstile test key is used
  console.log('\n--- TEST 2: Production Startup Guard (Turnstile Test Key Refusal) ---');
  try {
    execSync('NODE_ENV=production ADMIN_PASSWORD_HASH=hash SESSION_SECRET=testsecret TURNSTILE_SITE_KEY=1x00000000000000000000AA node server/index.js', {
      encoding: 'utf8',
      stdio: 'pipe',
      timeout: 3000,
    });
    assert(false, 'Server should have refused to start in production with test Turnstile key');
  } catch (err) {
    const stderr = err.stderr ? err.stderr.toString() : '';
    assert(stderr.includes('FATAL: Production mode requires a valid non-test Cloudflare Turnstile'), 'Refused to start in production with Cloudflare test site key');
  }

  // 3. Start test server instance with bcrypt hash
  console.log('\n--- TEST 3: Admin Login, Lockout (5 attempts), and Session Cookie Enforcement ---');
  const testPassword = 'Strong-Admin-Password-2026!';
  const testHash = bcrypt.hashSync(testPassword, 10);
  const testPort = 5088;

  const serverProc = spawn('node', ['server/index.js'], {
    env: {
      ...process.env,
      PORT: String(testPort),
      ADMIN_PASSWORD_HASH: testHash,
      SESSION_SECRET: 'super-secure-session-secret-key-32bytes',
      NODE_ENV: 'development',
    },
    stdio: 'pipe',
  });

  // Wait for server to start
  await new Promise(resolve => setTimeout(resolve, 1500));

  try {
    // 3a. Unauthenticated access to /api/admin/reports must return 401
    const unauthRes = await fetch(`http://127.0.0.1:${testPort}/api/admin/reports`);
    assert(unauthRes.status === 401, 'Unauthenticated request to /api/admin/reports is rejected with HTTP 401');

    // 3b. 5 failed login attempts trigger lockout
    console.log('  Testing 5 consecutive failed login attempts...');
    for (let attempt = 1; attempt <= 4; attempt++) {
      const failRes = await fetch(`http://127.0.0.1:${testPort}/api/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: 'wrong-password' }),
      });
      assert(failRes.status === 401, `Failed attempt ${attempt}/5 returned HTTP 401`);
    }

    // 5th failed attempt should trigger lockout (429)
    const fifthRes = await fetch(`http://127.0.0.1:${testPort}/api/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: 'wrong-password' }),
    });
    const fifthData = await fifthRes.json();
    assert(fifthRes.status === 429, '5th failed attempt triggers HTTP 429 Lockout');
    assert(fifthData.error.includes('Locked out for 15 minutes'), 'Error explicitly informs user of 15-minute lockout');

    // Subsequent attempt during lockout window is still blocked with 429 even with correct password
    const lockoutCheck = await fetch(`http://127.0.0.1:${testPort}/api/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: testPassword }),
    });
    assert(lockoutCheck.status === 429, 'Blocked during lockout window even if valid password is submitted');

  } finally {
    serverProc.kill();
  }

  // 4. Test Successful Login from a new client IP / clean state
  console.log('\n--- TEST 4: Successful Admin Login Sets httpOnly + Secure + SameSite=Strict Cookie ---');
  const serverProc2 = spawn('node', ['server/index.js'], {
    env: {
      ...process.env,
      PORT: '5089',
      ADMIN_PASSWORD_HASH: testHash,
      SESSION_SECRET: 'super-secure-session-secret-key-32bytes',
      NODE_ENV: 'production',
      TURNSTILE_SITE_KEY: 'live_turnstile_site_key_prod',
      TURNSTILE_SECRET_KEY: 'live_turnstile_secret_key_prod',
    },
    stdio: 'pipe',
  });

  await new Promise(resolve => setTimeout(resolve, 1500));

  try {
    const loginRes = await fetch('http://127.0.0.1:5089/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: testPassword }),
    });
    assert(loginRes.status === 200, 'Valid password returns HTTP 200');

    const setCookieHeader = loginRes.headers.get('set-cookie') || '';
    assert(setCookieHeader.includes('miloo_admin_session='), 'Set-Cookie header sets miloo_admin_session cookie');
    assert(setCookieHeader.toLowerCase().includes('httponly'), 'Session cookie has httpOnly flag');
    assert(setCookieHeader.toLowerCase().includes('samesite=strict'), 'Session cookie has SameSite=Strict flag');
    assert(setCookieHeader.toLowerCase().includes('secure'), 'Session cookie has Secure flag in production');

    // Extract cookie
    const cookieMatch = setCookieHeader.match(/miloo_admin_session=([^;]+)/);
    const sessionCookie = cookieMatch ? `miloo_admin_session=${cookieMatch[1]}` : '';

    // Verify authenticated session check
    const sessionCheckRes = await fetch('http://127.0.0.1:5089/api/admin/session', {
      headers: { Cookie: sessionCookie },
    });
    assert(sessionCheckRes.status === 200, 'GET /api/admin/session returns 200 with valid session cookie');

    // Access protected reports endpoint
    const reportsRes = await fetch('http://127.0.0.1:5089/api/admin/reports', {
      headers: { Cookie: sessionCookie },
    });
    assert(reportsRes.status === 200, 'GET /api/admin/reports succeeds with valid session cookie');

    // Test Logout
    const logoutRes = await fetch('http://127.0.0.1:5089/api/admin/logout', {
      method: 'POST',
      headers: { Cookie: sessionCookie },
    });
    assert(logoutRes.status === 200, 'POST /api/admin/logout succeeds');

    // After logout, session is revoked
    const afterLogoutRes = await fetch('http://127.0.0.1:5089/api/admin/session', {
      headers: { Cookie: sessionCookie },
    });
    assert(afterLogoutRes.status === 401, 'Session revoked after logout (returns HTTP 401)');

  } finally {
    serverProc2.kill();
  }

  console.log('\n================================================================');
  console.log(`ADMIN SECURITY AUDIT SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log('================================================================\n');

  if (failed > 0) process.exit(1);
}

runAdminSecurityTests().catch(err => {
  console.error('Fatal admin test error:', err);
  process.exit(1);
});

