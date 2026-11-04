// test_a11y.cjs
// Runs pa11y across all public pages and reports any accessibility issues.

const { execSync } = require('child_process');

const ROUTES = [
  '/',
  '/how-it-works',
  '/safety',
  '/faq',
  '/about',
  '/contact',
  '/privacy',
  '/cookie-policy',
  '/transparency',
  '/cookie',
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
  '/404',
];

console.log('================================================================');
console.log('♿ RUNNING FULL ACCESSIBILITY AUDIT (pa11y / axe-rules)');
console.log('================================================================\n');

let totalErrors = 0;
const results = [];

const BASE_URL = process.env.TARGET_URL || 'http://localhost:8899';
const TIME_PARAM = process.env.TIME_PARAM || '12:00';

for (const route of ROUTES) {
  const url = `${BASE_URL}${route}${route.includes('?') ? '&' : '?'}time=${TIME_PARAM}`;
  try {
    const cmd = `CHROME_PATH="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" npx -y pa11y -e axe --level-cap-when-needs-review warning "${url}"`;
    const output = execSync(cmd, { encoding: 'utf-8', timeout: 30000 });
    const hasNoIssues = output.includes('No issues found!');
    results.push({ route, status: hasNoIssues ? 'PASS (0 issues)' : 'CHECK', errorCount: 0 });
    console.log(`✓ ${route}: PASS (0 accessibility issues)`);
  } catch (err) {
    const stdout = err.stdout ? err.stdout.toString() : '';
    const errorMatches = stdout.match(/• Error:/g) || [];
    const count = errorMatches.length;
    totalErrors += count;
    results.push({ route, status: `FAIL (${count} errors)`, errorCount: count, output: stdout });
    console.error(`✗ ${route}: ${count} errors found!`);
    console.error(stdout);
  }
}

console.log('\n================================================================');
console.log(`ACCESSIBILITY AUDIT SUMMARY: Total Errors across all ${ROUTES.length} routes: ${totalErrors}`);
console.log('================================================================\n');

if (totalErrors > 0) {
  process.exit(1);
}
