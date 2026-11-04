/**
 * verify_redirects_and_canonicals.cjs
 * Automated test for Item 3 & Item 5: Redirects and canonicals verification
 */

const fs = require('fs');
const path = require('path');
const assert = require('assert');

console.log('🧪 Starting Redirects & Canonicals Verification...\n');

let pass = 0;
let fail = 0;

// 1. Verify vercel.json redirect rules
console.log('Test 1: Verify vercel.json 301 redirect configuration...');
const vercelFiles = [
  path.resolve(__dirname, 'vercel.json'),
  path.resolve(__dirname, 'client/vercel.json'),
];

for (const vFile of vercelFiles) {
  assert.ok(fs.existsSync(vFile), `File ${vFile} must exist`);
  const vJson = JSON.parse(fs.readFileSync(vFile, 'utf8'));
  
  // Check www -> non-www redirect
  const redirectWww = vJson.redirects?.find(r => 
    r.destination === 'https://miloo.chat/$1' &&
    r.permanent === true &&
    r.has?.some(h => h.value === 'www.miloo.chat')
  );

  // Check /cookie -> /cookie-policy redirect
  const redirectCookie = vJson.redirects?.find(r =>
    r.source === '/cookie' &&
    r.destination === '/cookie-policy' &&
    r.permanent === true
  );

  if (redirectWww && redirectCookie) {
    console.log(`✓ PASS: ${path.relative(__dirname, vFile)} redirects 301 www.miloo.chat -> https://miloo.chat/$1 and /cookie -> /cookie-policy`);
    pass++;
  } else {
    console.error(`❌ FAIL: ${path.relative(__dirname, vFile)} missing valid 301 redirects (www -> non-www or /cookie -> /cookie-policy)`);
    fail++;
  }
}

// 2. Verify sitemap.xml URLs
console.log('\nTest 2: Verify sitemap.xml URLs use https://miloo.chat/...');
const sitemapPath = path.resolve(__dirname, 'client/public/sitemap.xml');
const sitemapContent = fs.readFileSync(sitemapPath, 'utf8');
const locMatches = sitemapContent.match(/<loc>(.*?)<\/loc>/g) || [];

assert.ok(locMatches.length >= 10, `Sitemap must contain URLs (found: ${locMatches.length})`);
let invalidSitemapLocs = 0;

for (const locTag of locMatches) {
  const url = locTag.replace(/<\/?loc>/g, '');
  if (!url.startsWith('https://miloo.chat/') || url.includes('www.')) {
    console.error(`❌ Invalid sitemap URL (must start with https://miloo.chat/ with no www): ${url}`);
    invalidSitemapLocs++;
  }
  if (url === 'https://miloo.chat/cookie' || url === 'https://miloo.chat/404') {
    console.error(`❌ Excluded URL found in sitemap: ${url}`);
    invalidSitemapLocs++;
  }
}

if (invalidSitemapLocs === 0) {
  console.log(`✓ PASS: All ${locMatches.length} sitemap URLs strictly use https://miloo.chat/ with no www and exclude /cookie & /404`);
  pass++;
} else {
  fail++;
}

// 3. Verify built static pages in client/dist
console.log('\nTest 3: Verify all built static pages use miloo.chat (no www) in canonicals and og:url...');
const distDir = path.resolve(__dirname, 'client/dist');
const htmlFiles = [];

function findHtmlFiles(dir) {
  if (!fs.existsSync(dir)) return;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory() && entry.name !== 'server') {
      findHtmlFiles(fullPath);
    } else if (entry.isFile() && entry.name === 'index.html') {
      htmlFiles.push(fullPath);
    }
  }
}

findHtmlFiles(distDir);
console.log(`Auditing ${htmlFiles.length} generated static HTML files...`);

let wwwFound = 0;

for (const file of htmlFiles) {
  const content = fs.readFileSync(file, 'utf8');
  const relPath = path.relative(distDir, file);

  // Check canonical link
  const canonicalMatch = content.match(/<link rel="canonical" href="(.*?)"/i);
  if (canonicalMatch) {
    const canonical = canonicalMatch[1];
    if (canonical.includes('www.miloo.chat') || !canonical.startsWith('https://miloo.chat')) {
      console.error(`❌ www or invalid canonical in ${relPath}: ${canonical}`);
      wwwFound++;
    }
  }

  // Check og:url
  const ogUrlMatch = content.match(/<meta property="og:url" content="(.*?)"/i);
  if (ogUrlMatch) {
    const ogUrl = ogUrlMatch[1];
    if (ogUrl.includes('www.miloo.chat') || !ogUrl.startsWith('https://miloo.chat')) {
      console.error(`❌ www or invalid og:url in ${relPath}: ${ogUrl}`);
      wwwFound++;
    }
  }
}

if (wwwFound === 0) {
  console.log(`✓ PASS: All built pages strictly use miloo.chat (no www) in canonicals and og:url`);
  pass++;
} else {
  fail++;
}

console.log('\n======================================================');
console.log(`Redirects & Canonicals Verification: ${pass} Passed, ${fail} Failed`);
if (fail === 0) {
  console.log('🎉 ITEM 3 & 5 VERIFICATION PASSED [PASS]');
} else {
  console.error('❌ ITEM 3 & 5 VERIFICATION FAILED [FAIL]');
  process.exit(1);
}
console.log('======================================================\n');
