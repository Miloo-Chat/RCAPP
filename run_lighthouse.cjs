// run_lighthouse.cjs
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const onlyHome = process.argv.includes('--home-only') || process.argv.includes('home');
const baseUrl = process.env.TARGET_URL || 'http://localhost:8899';
const TARGETS = onlyHome
  ? [{ name: 'home', url: `${baseUrl}/` }]
  : [
      { name: 'home', url: `${baseUrl}/` },
      { name: 'article', url: `${baseUrl}/blog/stay-safe-talking-to-strangers-online` },
      { name: 'faq', url: `${baseUrl}/faq` },
      { name: 'privacy', url: `${baseUrl}/privacy` },
    ];

const outDir = path.join(__dirname, 'lighthouse-reports');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

const modes = ['desktop', 'mobile'];
const summary = [];

for (const target of TARGETS) {
  for (const mode of modes) {
    const reportPath = path.join(outDir, `${target.name}-${mode}.json`);
    const flags = [
      `"${target.url}"`,
      `--output=json`,
      `--output-path="${reportPath}"`,
      `--chrome-flags="--headless --no-sandbox --disable-gpu"`,
      mode === 'desktop' ? `--preset=desktop` : `--form-factor=mobile`,
      `--throttling-method=devtools`,
      `--quiet`,
      `--no-enable-error-reporting`,
    ].join(' ');

    const cmd = `CHROME_PATH="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" npx -y lighthouse ${flags}`;
    console.log(`Running Lighthouse for ${target.name} (${mode})...`);
    try {
      execSync(cmd, { stdio: 'inherit', timeout: 120000 });
      const report = JSON.parse(fs.readFileSync(reportPath, 'utf8'));
      const scores = {
        name: target.name,
        mode,
        url: target.url,
        performance: Math.round(report.categories.performance?.score * 100),
        accessibility: Math.round(report.categories.accessibility?.score * 100),
        bestPractices: Math.round(report.categories['best-practices']?.score * 100),
        seo: Math.round(report.categories.seo?.score * 100),
      };
      summary.push(scores);
      console.log(`✓ ${target.name} (${mode}): Perf: ${scores.performance}, A11y: ${scores.accessibility}, BP: ${scores.bestPractices}, SEO: ${scores.seo}`);
    } catch (err) {
      console.error(`✗ Error running lighthouse for ${target.name} (${mode}):`, err.message);
    }
  }
}

console.log('\n======================================================');
console.log('LIGHTHOUSE AUDIT SUMMARY:');
console.table(summary);
console.log('======================================================\n');
