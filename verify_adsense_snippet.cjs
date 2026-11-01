/**
 * verify_adsense_snippet.cjs
 * Automated test for Item 3: AdSense snippet verification in built dist/*.html files
 */

const fs = require('fs');
const path = require('path');
const assert = require('assert');

const CLIENT_DIST = path.resolve(__dirname, 'client/dist');
const ADSENSE_CLIENT_ID = 'ca-pub-4205636224784725';
const EXPECTED_SNIPPET = `<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT_ID}" crossorigin="anonymous"></script>`;

const PUBLIC_ROUTES = [
  '/',
  '/how-it-works',
  '/safety',
  '/faq',
  '/about',
  '/contact',
  '/privacy',
  '/terms',
  '/community-guidelines',
  '/blog',
  '/blog/stay-safe-talking-to-strangers-online',
  '/blog/how-to-spot-scams-on-chat-sites',
  '/blog/protecting-privacy-in-video-chat',
  '/blog/how-to-report-and-block-abusive-users',
  '/blog/tips-for-starting-good-conversation-with-stranger',
  '/blog/what-to-do-if-someone-harasses-you-online',
  '/blog/omegle-alternative',
  '/blog/random-video-chat-india',
  '/blog/stranger-chat-india',
  '/blog/video-chat-no-signup',
];

const PRIVATE_ROUTES = [
  '/chat',
  '/call',
  '/admin',
];

console.log('🧪 Starting AdSense Snippet Placement & Exclusion Verification...\n');

let passCount = 0;
let failCount = 0;

// 1. Verify Public Routes have AdSense in <head>
console.log('--- Checking Public Content Pages (AdSense Must Be Present in <head>) ---');
for (const route of PUBLIC_ROUTES) {
  const filePath = route === '/' 
    ? path.join(CLIENT_DIST, 'index.html') 
    : path.join(CLIENT_DIST, route, 'index.html');

  if (!fs.existsSync(filePath)) {
    console.error(`❌ Missing static file: ${filePath}`);
    failCount++;
    continue;
  }

  const content = fs.readFileSync(filePath, 'utf8');
  const headMatch = content.match(/<head[\s\S]*?<\/head>/i);
  if (!headMatch) {
    console.error(`❌ No <head> found in ${route}`);
    failCount++;
    continue;
  }

  const headContent = headMatch[0];
  const hasClientId = headContent.includes(ADSENSE_CLIENT_ID);
  const hasScript = headContent.includes('pagead2.googlesyndication.com');

  if (hasClientId && hasScript) {
    console.log(`✓ PASS: ${route} has AdSense script in <head>`);
    passCount++;
  } else {
    console.error(`❌ FAIL: ${route} is missing AdSense script in <head>`);
    failCount++;
  }
}

// 2. Verify Private Routes do NOT have AdSense anywhere
console.log('\n--- Checking Private Routes (AdSense Must Be STRICTLY ABSENT) ---');
for (const route of PRIVATE_ROUTES) {
  const filePath = path.join(CLIENT_DIST, route, 'index.html');
  if (!fs.existsSync(filePath)) {
    console.error(`❌ Missing static file for private route: ${filePath}`);
    failCount++;
    continue;
  }

  const content = fs.readFileSync(filePath, 'utf8');
  const hasClientId = content.includes(ADSENSE_CLIENT_ID);
  const hasScript = content.includes('pagead2.googlesyndication.com');

  if (!hasClientId && !hasScript) {
    console.log(`✓ PASS: ${route} is 100% free of AdSense script`);
    passCount++;
  } else {
    console.error(`❌ FAIL: ${route} contains AdSense snippet!`);
    failCount++;
  }
}

// 3. Verify Age Gate component does not contain AdSense
console.log('\n--- Checking Age Gate Modal Component ---');
const ageGatePath = path.resolve(__dirname, 'client/src/components/AgeGateModal.jsx');
const ageGateContent = fs.readFileSync(ageGatePath, 'utf8');
if (!ageGateContent.includes(ADSENSE_CLIENT_ID) && !ageGateContent.includes('adsbygoogle')) {
  console.log('✓ PASS: AgeGateModal.jsx has no AdSense script or ad slots');
  passCount++;
} else {
  console.error('❌ FAIL: AgeGateModal.jsx contains AdSense references!');
  failCount++;
}

console.log('\n======================================================');
console.log(`AdSense Snippet Verification Results: ${passCount} Passed, ${failCount} Failed`);
if (failCount === 0) {
  console.log('🎉 ITEM 3 VERIFICATION PASSED [PASS]');
} else {
  console.error('❌ ITEM 3 VERIFICATION FAILED [FAIL]');
  process.exit(1);
}
console.log('======================================================\n');
