/**
 * server/test_purge.cjs
 * 
 * Verifies Item 6 Requirements:
 * 1. In production mode, server refuses to start without DATABASE_URL (Postgres).
 * 2. 30-day purge job for reports deletes rows older than 30 days (tested with fake timestamps).
 * 3. Expiry job for temporary bans clears expired temporary bans (tested with fake timestamps).
 * 4. Persistent moderation state key-value storage functions properly.
 */

const assert = require('assert');
const { spawnSync } = require('child_process');
const path = require('path');
const storage = require('./storage');

async function runPurgeTests() {
  console.log('🧪 Starting Persistent Storage & Purge Verification Suite...\n');

  // -------------------------------------------------------------------------
  // Test 1: Production Mode Refuses to Start Without DATABASE_URL
  // -------------------------------------------------------------------------
  console.log('--- Test 1: Production Invariant - Server Must Refuse to Start Without DATABASE_URL ---');
  const prodCheck = spawnSync('node', ['-e', 'require("./storage")'], {
    cwd: __dirname,
    env: {
      ...process.env,
      NODE_ENV: 'production',
      DATABASE_URL: '',
      TEST_ALLOW_NO_DB: '',
    },
  });

  const output = (prodCheck.stderr || '').toString() + (prodCheck.stdout || '').toString();
  assert.strictEqual(prodCheck.status, 1, 'Production startup without DATABASE_URL must exit with code 1');
  assert.ok(
    output.includes('FATAL: Production mode requires DATABASE_URL') ||
    output.includes('FATAL: No DATABASE_URL specified in production mode'),
    'Must log FATAL error explaining DATABASE_URL is required in production'
  );
  console.log('✓ PASS: Server correctly refused to start in production mode without DATABASE_URL (exit code 1).');

  // -------------------------------------------------------------------------
  // Test 2: Automatic 30-Day Purge for Reports with Fake Timestamps
  // -------------------------------------------------------------------------
  console.log('\n--- Test 2: Automatic 30-Day Reports Purge with Fake Timestamps ---');
  const fakeNow = Date.now();
  const dayMs = 24 * 60 * 60 * 1000;
  const thirtyDaysMs = 30 * dayMs;

  const oldTimestamp = fakeNow - (45 * dayMs); // 45 days ago (should be purged)
  const freshTimestamp = fakeNow - (5 * dayMs); // 5 days ago (should be retained)

  const oldReport = await storage.addReport({
    id: `rep_stale_${Date.now()}`,
    reporterId: 'user_audit_stale',
    reportedUser: 'target_stale',
    reason: 'spam',
    context: 'Old report from 45 days ago',
    timestamp: oldTimestamp,
  });

  const freshReport = await storage.addReport({
    id: `rep_fresh_${Date.now()}`,
    reporterId: 'user_audit_fresh',
    reportedUser: 'target_fresh',
    reason: 'harassment',
    context: 'Recent report from 5 days ago',
    timestamp: freshTimestamp,
  });

  console.log(`- Created stale report (45 days old): id=${oldReport.id} timestamp=${new Date(oldTimestamp).toISOString()}`);
  console.log(`- Created fresh report (5 days old): id=${freshReport.id} timestamp=${new Date(freshTimestamp).toISOString()}`);

  const purgeReportsResult = await storage.purgeOldReports(thirtyDaysMs, fakeNow);
  console.log(`- Ran purgeOldReports(cutoff=30 days): deleted ${purgeReportsResult.deletedCount} row(s)`);

  const reportsAfter = await storage.getReports();
  const oldFound = reportsAfter.some(r => r.id === oldReport.id);
  const freshFound = reportsAfter.some(r => r.id === freshReport.id);

  assert.strictEqual(oldFound, false, 'Reports older than 30 days must be deleted by purge job');
  assert.strictEqual(freshFound, true, 'Reports newer than 30 days must be retained');
  console.log('✓ PASS: 30-day purge deleted the 45-day-old report and retained the 5-day-old report.');

  // -------------------------------------------------------------------------
  // Test 3: Temporary Ban Expiry Job with Fake Timestamps
  // -------------------------------------------------------------------------
  console.log('\n--- Test 3: Ban Expiry Job with Fake Timestamps ---');
  const expiredBanId = `user_expired_${Date.now()}`;
  const activeBanId = `user_active_${Date.now()}`;
  const permBanId = `user_perm_${Date.now()}`;

  // 1. Add a ban expired 2 hours ago (fake past timestamp)
  const fakeExpiredTime = fakeNow - (2 * 60 * 60 * 1000);
  await storage.setUserStatus(expiredBanId, 'banned', 'Expired 10-minute ban from earlier', { expiresAt: fakeExpiredTime });

  // 2. Add an active ban that expires in 24 hours
  await storage.setUserStatus(activeBanId, 'suspended', 'Active 24-hour suspension', { durationMs: 24 * 60 * 60 * 1000 });

  // 3. Add a permanent ban
  await storage.setUserStatus(permBanId, 'banned', 'Permanent 4th strike ban', { permanent: true });

  console.log(`- Created expired ban: id=${expiredBanId} expiresAt=${new Date(fakeExpiredTime).toISOString()}`);
  console.log(`- Created active ban: id=${activeBanId} (active for 24h)`);
  console.log(`- Created permanent ban: id=${permBanId} (PERMANENT)`);

  // Run purge expired bans as of fakeNow
  const purgeBansResult = await storage.purgeExpiredBans(fakeNow);
  console.log(`- Ran purgeExpiredBans(referenceTime=fakeNow): deleted ${purgeBansResult.deletedCount} row(s)`);

  const expiredAfter = await storage.isBanned(expiredBanId);
  const activeAfter = await storage.isBanned(activeBanId);
  const permAfter = await storage.isBanned(permBanId);

  assert.strictEqual(expiredAfter, false, 'Expired temporary ban must be cleared');
  assert.strictEqual(activeAfter, true, 'Active temporary ban must remain in effect');
  assert.strictEqual(permAfter, true, 'Permanent ban must remain in effect');

  console.log('✓ PASS: Expiry job cleared the expired temporary ban while keeping active and permanent bans intact.');

  // -------------------------------------------------------------------------
  // Test 4: Moderation State Key-Value Persistence
  // -------------------------------------------------------------------------
  console.log('\n--- Test 4: Moderation State Persistence ---');
  const testKey = 'audit_mod_state_test';
  const testVal = { maintenanceMode: false, autoBanThreshold: 3, lastUpdatedBy: 'admin_audit' };

  await storage.setModerationState(testKey, testVal);
  const retrievedVal = await storage.getModerationState(testKey);

  assert.deepStrictEqual(retrievedVal, testVal, 'Moderation state must persist and retrieve cleanly');
  console.log('✓ PASS: Moderation state stored and retrieved accurately.');

  console.log('\n======================================================');
  console.log('🎉 ITEM 6 PERSISTENT STORAGE & PURGE TESTS PASSED [PASS]');
  console.log('======================================================\n');
}

runPurgeTests().catch(err => {
  console.error('❌ Purge test failed:', err);
  process.exit(1);
});
