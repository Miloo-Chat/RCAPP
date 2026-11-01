/**
 * verify_redirects_and_canonicals.cjs
 * Automated test for Item 5: Redirects and canonicals verification
 */

const fs = require('fs');
const path = require('path');
const assert = require('assert');

console.log('🧪 Starting Redirects & Canonicals Verification...\n');

let pass = 0;
let fail = 0;

// 1. Verify vercel.json redirect rule
console.log('Test 1: Verify vercel.json 301 redirect configuration...');
const vercelFiles = [
  path.resolve(__dirname, 'vercel.json'),
  path.resolve(__dirname, 'client/vercel.json'),
];

for (const vFile of vercelFiles) {
  assert.ok(fs.existsSync(vFile), `File ${vFile} must exist`);
  const vJson = JSON.parse(fs.readFileSync(vFile, 'utf8'));
  const redirect = vJson.redirects?.find(r => 
    r.destination === 'https://www.miloo.chat/$1' &&
    r.permanent === true &&
    r.has?.some(h => h.value === 'miloo.chat')
  );

  if (redirect) {
    console.log(`✓ PASS: ${path.relative(__dirname, vFile)} redirects 301 (permanent: true) miloo.chat -> https://www.miloo.chat/$1 for every path`);
    pass++;
  } else {
    console.error(`❌ FAIL: ${path.relative(__dirname, vFile)} missing valid 301 redirect to www.miloo.chat`);
    fail++;
  }
}

// 2. Verify sitemap.xml URLs
console.log('\nTest 2: Verify sitemap.xml URLs use https://www.miloo.chat/...');
const sitemapPath = path.resolve(__dirname, 'client/public/sitemap.xml');
const sitemapContent = fs.readFileSync(sitemapPath, 'utf8');
const locMatches = sitemapContent.match(/<loc>(.*?)<\/loc>/g) || [];

assert.ok(locMatches.length >= 20, `Sitemap must contain at least 20 URLs (found: ${locMatches.length})`);
let invalidSitemapLocs = 0;

for (const locTag of locMatches) {
  const url = locTag.replace(/<\/?loc>/g, '');
  if (!url.startsWith('https://www.miloo.chat/')) {
    console.error(`❌ Invalid sitemap URL (must start with https://www.miloo.chat/): ${url}`);
    invalidSitemapLocs++;
  }
}

if (invalidSitemapLocs === 0) {
  console.log(`✓ PASS: All ${locMatches.length} sitemap URLs strictly use https://www.miloo.chat/`);
  pass++;
} else {
  fail++;
}

// 3. Verify built static pages in client/dist
console.log('\nTest 3: Verify all built static pages use www.miloo.chat in canonicals and og:url...');
const distDir = path.resolve(__dirname, 'client/dist');
const htmlFiles = [];

function findHtmlFiles(dir) {
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

let nonWwwFound = 0;

for (const file of htmlFiles) {
  const content = fs.readFileSync(file, 'utf8');
  const relPath = path.relative(distDir, file);

  // Check canonical link
  const canonicalMatch = content.match(/<link rel="canonical" href="(.*?)"/i);
  if (canonicalMatch) {
    const canonical = canonicalMatch[1];
    if (!canonical.startsWith('https://www.miloo.chat')) {
      console.error(`❌ Non-www or invalid canonical in ${relPath}: ${canonical}`);
      nonWwwFound++;
    }
  }

  // Check og:url
  const ogUrlMatch = content.match(/<meta property="og:url" content="(.*?)"/i);
  if (ogUrlMatch) {
    const ogUrl = ogUrlMatch[1];
    if (!ogUrl.startsWith('https://www.miloo.chat')) {
      console.error(`❌ Non-www or invalid og:url in ${relPath}: ${ogUrl}`);
      nonWwwFound++;
    }
  }
}

if (nonWwwFound === 0) {
  console.log(`✓ PASS: All built pages strictly use www.miloo.chat in canonicals and og:url`);
  pass++;
} else {
  fail++;
}

console.log('\n======================================================');
console.log(`Redirects & Canonicals Verification: ${pass} Passed, ${fail} Failed`);
if (fail === 0) {
  console.log('🎉 ITEM 5 VERIFICATION PASSED [PASS]');
} else {
  console.error('❌ ITEM 5 VERIFICATION FAILED [FAIL]');
  process.exit(1);
}
console.log('======================================================\n');
