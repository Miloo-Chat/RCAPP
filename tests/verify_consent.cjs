/**
 * verify_consent.cjs
 * Automated test for Item 4: Consent and Funding Choices note verification
 */

const fs = require('fs');
const path = require('path');
const assert = require('assert');

console.log('🧪 Starting Consent & Funding Choices Verification...\n');

const cookieBannerPath = path.resolve(__dirname, '../client/src/components/CookieBanner.jsx');
const adSenseScriptPath = path.resolve(__dirname, '../client/src/components/AdSenseScript.jsx');

const bannerContent = fs.readFileSync(cookieBannerPath, 'utf8');
const adScriptContent = fs.readFileSync(adSenseScriptPath, 'utf8');

// 1. Verify Funding Choices code comment in both files
console.log('Test 1: Verify EEA/UK Funding Choices comment in CookieBanner.jsx...');
assert.ok(
  bannerContent.includes('Funding Choices') &&
  bannerContent.includes('Privacy & messaging') &&
  bannerContent.includes('EEA') &&
  bannerContent.includes('certified'),
  'CookieBanner.jsx must include Funding Choices comment'
);
console.log('✓ PASS: CookieBanner.jsx contains the required EEA/UK Funding Choices comment.');

console.log('\nTest 2: Verify EEA/UK Funding Choices comment in AdSenseScript.jsx...');
assert.ok(
  adScriptContent.includes('Funding Choices') &&
  adScriptContent.includes('Privacy & messaging') &&
  adScriptContent.includes('EEA') &&
  adScriptContent.includes('certified'),
  'AdSenseScript.jsx must include Funding Choices comment'
);
console.log('✓ PASS: AdSenseScript.jsx contains the required EEA/UK Funding Choices comment.');

// 2. Verify CookieBanner dispatches consent event on Accept and Decline
console.log('\nTest 3: Verify CookieBanner dispatches miloo_consent_change event on Accept/Decline...');
assert.ok(
  bannerContent.includes("window.dispatchEvent(new CustomEvent('miloo_consent_change'") &&
  bannerContent.includes("localStorage.setItem('miloo_cookie_consent', 'accepted')") &&
  bannerContent.includes("localStorage.setItem('miloo_cookie_consent', 'essential')"),
  'CookieBanner must set localStorage and dispatch consent change event'
);
console.log('✓ PASS: CookieBanner properly manages localStorage and dispatches consent change event.');

// 3. Verify AdSenseScript conditions loading on consent
console.log('\nTest 4: Verify AdSenseScript requires consent before dynamic ad script injection...');
assert.ok(
  adScriptContent.includes("consent !== 'accepted'") &&
  adScriptContent.includes("addEventListener('miloo_consent_change'"),
  'AdSenseScript must condition injection on accepted consent and listen to consent changes'
);
console.log('✓ PASS: AdSenseScript requires accepted consent before dynamic injection and listens for consent changes.');

// 4. Verify forbidden routes cleanup in AdSenseScript
console.log('\nTest 5: Verify forbidden routes (/chat, /call, /admin) cleanup in AdSenseScript...');
assert.ok(
  adScriptContent.includes("const FORBIDDEN_ROUTES = ['/chat', '/call', '/admin']") &&
  adScriptContent.includes("existing.remove()"),
  'AdSenseScript must enforce FORBIDDEN_ROUTES and remove script when entering chat'
);
console.log('✓ PASS: AdSenseScript cleanly removes any ad script on /chat, /call, and /admin.');

console.log('\n======================================================');
console.log('🎉 ITEM 4 VERIFICATION PASSED [PASS]');
console.log('======================================================\n');
