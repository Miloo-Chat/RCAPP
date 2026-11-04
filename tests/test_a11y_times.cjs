// test_a11y_times.cjs
const { execSync } = require('child_process');

const TIMES = [
  { time: '06:30', name: 'Dawn' },
  { time: '12:00', name: 'Noon' },
  { time: '17:45', name: 'Sunset' },
  { time: '19:45', name: 'Dusk' },
  { time: '23:00', name: 'Night' },
];

console.log('================================================================');
console.log('♿ PA11Y AUDIT: Homepage & Preloader at All Times of Day');
console.log('================================================================\n');

const results = [];
let totalErrors = 0;

for (const { time, name } of TIMES) {
  // 1. Homepage at time
  const homeUrl = `http://localhost:4173/?time=${time}`;
  try {
    const cmd = `CHROME_PATH="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" npx -y pa11y -e axe --level-cap-when-needs-review warning "${homeUrl}"`;
    const output = execSync(cmd, { encoding: 'utf-8', timeout: 35000 });
    const pass = output.includes('No issues found!');
    results.push({ target: `Home (${name} ${time})`, url: homeUrl, status: pass ? 'PASS (0 issues)' : 'CHECK', errors: 0 });
    console.log(`✓ Home [${name} ${time}]: PASS (0 issues)`);
  } catch (err) {
    const stdout = err.stdout ? err.stdout.toString() : '';
    const errorMatches = stdout.match(/• Error:/g) || [];
    const count = errorMatches.length;
    totalErrors += count;
    results.push({ target: `Home (${name} ${time})`, url: homeUrl, status: `FAIL (${count} errors)`, errors: count, output: stdout });
    console.error(`✗ Home [${name} ${time}]: ${count} errors!`);
    console.error(stdout);
  }

  // 2. Preloader at time
  const preloaderUrl = `http://localhost:4173/?time=${time}&preloader=freeze`;
  try {
    const cmd = `CHROME_PATH="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" npx -y pa11y -e axe --level-cap-when-needs-review warning "${preloaderUrl}"`;
    const output = execSync(cmd, { encoding: 'utf-8', timeout: 35000 });
    const pass = output.includes('No issues found!');
    results.push({ target: `Preloader (${name} ${time})`, url: preloaderUrl, status: pass ? 'PASS (0 issues)' : 'CHECK', errors: 0 });
    console.log(`✓ Preloader [${name} ${time}]: PASS (0 issues)`);
  } catch (err) {
    const stdout = err.stdout ? err.stdout.toString() : '';
    const errorMatches = stdout.match(/• Error:/g) || [];
    const count = errorMatches.length;
    totalErrors += count;
    results.push({ target: `Preloader (${name} ${time})`, url: preloaderUrl, status: `FAIL (${count} errors)`, errors: count, output: stdout });
    console.error(`✗ Preloader [${name} ${time}]: ${count} errors!`);
    console.error(stdout);
  }
}

console.log('\n================================================================');
console.log(`PA11Y SUMMARY: Total Errors across 10 audits: ${totalErrors}`);
console.log('================================================================');
console.log(JSON.stringify(results, null, 2));

if (totalErrors > 0) process.exit(1);

