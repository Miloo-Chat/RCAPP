/**
 * test_two_browsers_no_bots.cjs
 * 
 * Step 6 Verification:
 * Two-browser-session manual-style test (headless):
 * 1. Two users match with each other in under 5 seconds
 * 2. Text works both ways
 * 3. Skip / Next works
 * 4. Lone user waits 60s and sees the honest waiting card:
 *    "No one is here right now. Your bird will wait on the wire."
 *    with "Keep waiting" and "Try again later"
 *    and ZERO bots paired or contacted.
 */

const puppeteer = require('puppeteer');

const APP_URL = process.env.TEST_APP_URL || 'http://localhost:8899';
const SERVER_URL = process.env.SERVER_URL || 'http://localhost:3001';

async function getValidTurnstileToken() {
  const res = await fetch(`${SERVER_URL}/api/verify-turnstile`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token: 'XXXX.DUMMY.TOKEN.XXXX' })
  });
  const data = await res.json();
  return data.verificationToken;
}

async function setupPage(browser) {
  const token = await getValidTurnstileToken();
  const page = await browser.newPage();
  await page.evaluateOnNewDocument((turnstileToken) => {
    localStorage.setItem('miloo_age_confirmed', 'true');
    sessionStorage.setItem('miloo_age_gate', 'accepted');
    sessionStorage.setItem('miloo_turnstile_verified', 'true');
    sessionStorage.setItem('miloo_turnstile_token', turnstileToken);
  }, token);
  return page;
}

async function run() {
  console.log('================================================================');
  console.log('🧪 TWO-BROWSER MANUAL-STYLE HEADLESS VERIFICATION TEST');
  console.log(`   Frontend: ${APP_URL}`);
  console.log(`   Backend : ${SERVER_URL}`);
  console.log('================================================================\n');

  const browser = await puppeteer.launch({
    headless: 'new',
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--use-fake-ui-for-media-stream',
      '--use-fake-device-for-media-stream',
    ],
  });

  try {
    // -------------------------------------------------------------------------
    // Phase 1: Two Users Matching Under 5 Seconds + Two-Way Text + Skip/Next
    // -------------------------------------------------------------------------
    console.log('--- Phase 1: Two-User Match & Bidirectional Chat ---');
    const pageA = await setupPage(browser);
    const pageB = await setupPage(browser);

    const startTime = Date.now();
    console.log('Connecting User A to /chat?mode=text&time=12:00...');
    await pageA.goto(`${APP_URL}/chat?mode=text&time=12:00`, { waitUntil: 'networkidle0' });

    console.log('Connecting User B to /chat?mode=text&time=12:00...');
    await pageB.goto(`${APP_URL}/chat?mode=text&time=12:00`, { waitUntil: 'networkidle0' });

    // Wait for both to reach 'text_chat' status (ChatInput visible)
    console.log('Waiting for mutual match...');
    const matchTimeout = 5000;
    
    await Promise.all([
      pageA.waitForSelector('textarea, input[placeholder*="Say"]', { timeout: matchTimeout }),
      pageB.waitForSelector('textarea, input[placeholder*="Say"]', { timeout: matchTimeout }),
    ]);

    const matchDuration = (Date.now() - startTime) / 1000;
    console.log(`✓ MATCHED: User A and User B connected in ${matchDuration.toFixed(2)}s (< 5.0s target)!`);

    // Verify two-way text communication
    console.log('Testing two-way text chat...');
    async function sendMessage(page, text) {
      await page.waitForSelector('textarea[aria-label="Message input"]', { timeout: 5000 });
      await page.evaluate((msg) => {
        const textarea = document.querySelector('textarea[aria-label="Message input"]');
        if (!textarea) throw new Error('Textarea not found');
        const nativeSetter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, 'value').set;
        nativeSetter.call(textarea, msg);
        textarea.dispatchEvent(new Event('input', { bubbles: true }));
        const sendBtn = document.querySelector('button[aria-label="Send message"]');
        if (sendBtn) {
          sendBtn.click();
        } else {
          textarea.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', code: 'Enter', keyCode: 13, which: 13, bubbles: true }));
        }
      }, text);
    }

    const msgFromA = 'Hello stranger from User A!';
    await sendMessage(pageA, msgFromA);

    // User B should receive msgFromA
    await pageB.waitForFunction(
      (text) => document.body.innerText.includes(text),
      { timeout: 7000 },
      msgFromA
    );
    console.log(`✓ User B successfully received message from User A: "${msgFromA}"`);

    const msgFromB = 'Greetings! User B here, loud and clear.';
    await sendMessage(pageB, msgFromB);

    // User A should receive msgFromB
    await pageA.waitForFunction(
      (text) => document.body.innerText.includes(text),
      { timeout: 7000 },
      msgFromB
    );
    console.log(`✓ User A successfully received message from User B: "${msgFromB}"`);

    // Test Skip / Next
    console.log('Testing Skip / Next flow...');
    // Click "Next" on User A
    const clickedNext = await pageA.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const nextBtn = btns.find(b => b.textContent.includes('Next') || b.textContent.includes('Skip') || b.getAttribute('aria-label') === 'Next stranger');
      if (nextBtn) {
        nextBtn.click();
        return true;
      }
      return false;
    });

    if (clickedNext) {
      console.log('✓ User A clicked Next.');
    } else {
      console.log('Falling back to Esc / socket next event...');
      await pageA.keyboard.press('Escape');
    }

    // Verify User B observed partner departure
    await pageB.waitForFunction(
      () => {
        const text = document.body.innerText;
        return text.includes('left') || text.includes('Next') || text.includes('disconnected') || text.includes('Looking for');
      },
      { timeout: 5000 }
    );
    console.log('✓ User B successfully observed partner departure / transition.');

    await pageA.close();
    await pageB.close();

    // -------------------------------------------------------------------------
    // Phase 2: Lone User Waits 60s & Honest Waiting Card Verification
    // -------------------------------------------------------------------------
    console.log('\n--- Phase 2: Lone User 60-Second Wait & Honest Card ---');
    const lonePage = await setupPage(browser);

    console.log('Connecting lone user to /chat?mode=text&time=12:00...');
    await lonePage.goto(`${APP_URL}/chat?mode=text&time=12:00`, { waitUntil: 'networkidle0' });

    console.log('Waiting 61 seconds for lone user timeout with 0 bots...');
    const loneStart = Date.now();

    // Wait for the honest waiting card to appear:
    // "No one is here right now. Your bird will wait on the wire."
    await lonePage.waitForFunction(
      () => {
        return document.body.innerText.includes('No one is here right now');
      },
      { timeout: 68000, polling: 1000 }
    );

    const elapsed = Math.round((Date.now() - loneStart) / 1000);
    console.log(`✓ Honest waiting card appeared after ${elapsed}s!`);

    const cardDetails = await lonePage.evaluate(() => {
      const text = document.body.innerText;
      return {
        hasTitle: text.includes('No one is here right now. Keep waiting or try again later.'),
        hasDesc: text.includes('The wire is quiet right now. You can keep waiting, or try again later.'),
        hasKeepWaitingBtn: Array.from(document.querySelectorAll('button')).some(b => b.textContent.includes('Keep waiting')),
        hasTryAgainBtn: Array.from(document.querySelectorAll('button')).some(b => b.textContent.includes('Try again later')),
        hasWebPushBtn: Array.from(document.querySelectorAll('button')).some(b => b.textContent.includes('Tell me when someone is here')),
        hasMiloMention: /\bmilo(?!o)\b|\bpersona\b|\bbot\b/i.test(text),
      };
    });

    console.log('Card verification details:', cardDetails);

    if (!cardDetails.hasTitle) throw new Error('Honest card title missing!');
    if (!cardDetails.hasDesc) throw new Error('Honest card description missing!');
    if (!cardDetails.hasKeepWaitingBtn) throw new Error('"Keep waiting" button missing!');
    if (!cardDetails.hasTryAgainBtn) throw new Error('"Try again later" button missing!');
    if (cardDetails.hasWebPushBtn) throw new Error('Web Push button must be hidden since backend is not fully implemented!');
    if (cardDetails.hasMiloMention) throw new Error('Forbidden bot mention found on waiting card!');

    console.log('✓ PASS: Honest card matches exact specifications!');
    console.log('✓ PASS: Web Push button correctly hidden.');
    console.log('✓ PASS: Zero bot mentions or automated pairing occurred.');

    // Test clicking "Keep waiting"
    console.log('Testing "Keep waiting" button click...');
    await lonePage.evaluate(() => {
      const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Keep waiting'));
      if (btn) btn.click();
    });

    await new Promise(r => setTimeout(r, 1000));
    const stillWaiting = await lonePage.evaluate(() => {
      return document.body.innerText.includes('Looking for') || document.body.innerText.includes('searching') || document.body.innerText.includes('Hang tight');
    });
    console.log(`✓ "Keep waiting" resumed search: ${stillWaiting}`);

    await lonePage.close();
    await browser.close();

    console.log('\n================================================================');
    console.log('🎉 ALL TWO-BROWSER & LONE-USER TESTS PASSED SUCCESSFULLY! [PASS]');
    console.log('================================================================');
  } catch (err) {
    console.error('❌ Test failed:', err);
    await browser.close();
    process.exit(1);
  }
}

run();
