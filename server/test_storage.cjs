/**
 * server/test_storage.cjs
 * Automated unit test for server/storage.js interface:
 * getReports, addReport, setUserStatus, isBanned, getBannedCount
 */

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const storage = require('./storage');

async function runTests() {
  console.log('🧪 Starting Storage Abstraction Unit Tests...\n');

  const testId = `test_user_${Date.now()}`;
  const testIpHash = `ip_${Date.now().toString(36)}`;

  // Test 1: Verify isBanned returns false for new user
  console.log('Test 1: Verify isBanned on non-banned user...');
  const initialBanned = await storage.isBanned(testId);
  assert.strictEqual(initialBanned, false, 'Non-banned user should return false');
  console.log('✓ Passed: Non-banned user returns false');

  // Test 2: Add a safety report
  console.log('\nTest 2: Add safety report via addReport()...');
  const report = await storage.addReport({
    reporterId: 'reporter_unit_test',
    reportedUser: testId,
    reason: 'harassment',
    context: 'Test report during automated verification',
  });
  assert.ok(report.id, 'Report must have an ID');
  assert.strictEqual(report.reportedUser, testId);
  assert.strictEqual(report.status, 'pending');
  console.log(`✓ Passed: Report added with id: ${report.id}`);

  // Test 3: Retrieve reports via getReports()
  console.log('\nTest 3: Retrieve reports via getReports()...');
  const allReports = await storage.getReports();
  assert.ok(Array.isArray(allReports), 'getReports should return an array');
  const found = allReports.find(r => r.id === report.id);
  assert.ok(found, 'Added report must be present in getReports()');
  console.log(`✓ Passed: Found report in getReports() (total: ${allReports.length})`);

  // Test 4: Retrieve reports with filter
  console.log('\nTest 4: Filter reports by status="pending"...');
  const pendingReports = await storage.getReports({ status: 'pending' });
  assert.ok(pendingReports.some(r => r.id === report.id), 'Pending filter should include our test report');
  console.log('✓ Passed: Status filtering functions correctly');

  // Test 5: setUserStatus - Ban user
  console.log('\nTest 5: Set user status to "banned" via setUserStatus()...');
  const banRes = await storage.setUserStatus(testId, 'banned', 'Violated safety guidelines during test');
  assert.strictEqual(banRes, true);
  const isBannedNow = await storage.isBanned(testId);
  assert.strictEqual(isBannedNow, true, 'isBanned should return true after ban');
  console.log('✓ Passed: isBanned returns true for banned user');

  // Test 6: setUserStatus - Suspend IP hash
  console.log('\nTest 6: Set IP hash status to "suspended"...');
  await storage.setUserStatus(testIpHash, 'suspended', 'Suspicious IP flood');
  const isIpSuspended = await storage.isBanned(testIpHash);
  assert.strictEqual(isIpSuspended, true, 'isBanned should return true for suspended IP');
  console.log('✓ Passed: isBanned returns true for suspended IP hash');

  // Test 7: setUserStatus - Lift ban / set active
  console.log('\nTest 7: Lift ban / set status to active...');
  await storage.setUserStatus(testId, 'active', 'Ban lifted upon appeal');
  const isStillBanned = await storage.isBanned(testId);
  assert.strictEqual(isStillBanned, false, 'isBanned should return false after ban lifted');
  console.log('✓ Passed: isBanned returns false after ban lifted');

  // Clean up test IP
  await storage.setUserStatus(testIpHash, 'active');

  console.log('\n======================================================');
  console.log('🎉 ALL STORAGE ABSTRACTION TESTS PASSED [PASS]');
  console.log('======================================================\n');
}

runTests().catch(err => {
  console.error('❌ Storage test failed:', err);
  process.exit(1);
});
