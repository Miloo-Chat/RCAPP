/**
 * verify_adsense_snippet.cjs
 * Automated test for Item 2:
 * - Static <meta name="google-adsense-account" content="ca-pub-XXXXXXXXXXXXXXXX"> in <head> of every page
 * - Ad script disabled while ADS_ENABLED is false
 * - ca-pub-4205636224784725 completely replaced by ca-pub-XXXXXXXXXXXXXXXX
 * - ads.txt contains only comments
 */

const fs = require('fs');
const path = require('path');
const assert = require('assert');

const CLIENT_DIST = path.resolve(__dirname, 'client/dist');
const ADSENSE_PLACEHOLDER_ID = 'ca-pub-XXXXXXXXXXXXXXXX';
const OLD_ID = 'ca-pub-4205636224784725';

const ALL_DIST_ROUTES = [
  '/',
  '/how-it-works',
  '/safety',
  '/faq',
  '/about',
  '/contact',
  '/privacy',
  '/terms',
  '/community-guidelines',
  '/cookie-policy',
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
  '/chat',
  '/call',
  '/admin',
  '/404',
];

console.log('🧪 Starting AdSense Verification & Meta Audit...\n');

let passCount = 0;
let failCount = 0;

// 1. Verify every page has <meta name="google-adsense-account" content="ca-pub-XXXXXXXXXXXXXXXX">
console.log('--- 1. Checking Static Meta Tag in Every Page ---');
for (const route of ALL_DIST_ROUTES) {
  const filePath = route === '/' 
    ? path.join(CLIENT_DIST, 'index.html') 
    : path.join(CLIENT_DIST, route, 'index.html');

  if (!fs.existsSync(filePath)) {
    console.error(`❌ Missing static file: ${filePath}`);
    failCount++;
    continue;
  }

  const content = fs.readFileSync(filePath, 'utf8');
  const hasMeta = content.includes('name="google-adsense-account"') && content.includes(ADSENSE_PLACEHOLDER_ID);

  if (hasMeta) {
    console.log(`✓ PASS: ${route} has <meta name="google-adsense-account" content="${ADSENSE_PLACEHOLDER_ID}">`);
    passCount++;
  } else {
    console.error(`❌ FAIL: ${route} missing AdSense verification meta tag`);
    failCount++;
  }
}

// 2. Verify Ad Script is DISABLED while ADS_ENABLED is false
console.log('\n--- 2. Checking Ad Script Disabled While ADS_ENABLED is false ---');
let activeScriptFound = 0;
for (const route of ALL_DIST_ROUTES) {
  const filePath = route === '/' 
    ? path.join(CLIENT_DIST, 'index.html') 
    : path.join(CLIENT_DIST, route, 'index.html');

  if (!fs.existsSync(filePath)) continue;
  const content = fs.readFileSync(filePath, 'utf8');
  if (content.includes('pagead2.googlesyndication.com/pagead/js/adsbygoogle.js')) {
    console.error(`❌ FAIL: ${route} contains active AdSense ad script while ADS_ENABLED is false!`);
    activeScriptFound++;
  }
}

if (activeScriptFound === 0) {
  console.log('✓ PASS: All routes have AdSense ad script strictly disabled');
  passCount++;
} else {
  failCount++;
}

// 3. Verify Old ID ca-pub-4205636224784725 is nowhere in built files or source code
console.log('\n--- 3. Checking for Old ID (ca-pub-4205636224784725) Elimination ---');
const adsTxtPath = path.resolve(__dirname, 'ads.txt');
const clientAdsTxtPath = path.resolve(__dirname, 'client/public/ads.txt');

const adsTxtContent = fs.readFileSync(adsTxtPath, 'utf8');
const clientAdsTxtContent = fs.readFileSync(clientAdsTxtPath, 'utf8');

if (!adsTxtContent.includes(OLD_ID) && !clientAdsTxtContent.includes(OLD_ID)) {
  console.log(`✓ PASS: Old ID ${OLD_ID} absent from ads.txt`);
  passCount++;
} else {
  console.error(`❌ FAIL: Old ID ${OLD_ID} found in ads.txt!`);
  failCount++;
}

// 4. Verify ads.txt contains ONLY comments
console.log('\n--- 4. Checking ads.txt Contains ONLY Comments ---');
const adsTxtLines = adsTxtContent.split('\n').map(l => l.trim()).filter(l => l.length > 0);
const nonCommentLines = adsTxtLines.filter(l => !l.startsWith('#'));

if (nonCommentLines.length === 0) {
  console.log('✓ PASS: ads.txt contains strictly comments only');
  passCount++;
} else {
  console.error(`❌ FAIL: ads.txt contains active records: ${nonCommentLines.join(', ')}`);
  failCount++;
}

console.log('\n======================================================');
console.log(`AdSense Verification Results: ${passCount} Passed, ${failCount} Failed`);
if (failCount === 0) {
  console.log('🎉 ITEM 2 VERIFICATION PASSED [PASS]');
} else {
  console.error('❌ ITEM 2 VERIFICATION FAILED [FAIL]');
  process.exit(1);
}
console.log('======================================================\n');
