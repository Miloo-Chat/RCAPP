// curl_audit.cjs
// Executes curl on every required route and counts the words in the HTML body.

const { execSync } = require('child_process');

const ROUTES = [
  '/',
  '/about',
  '/contact',
  '/privacy',
  '/cookie',
  '/cookie-policy',
  '/terms',
  '/community-guidelines',
  '/transparency',
  '/safety',
  '/how-it-works',
  '/faq',
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
  '/this-does-not-exist',
];

function extractBodyText(html) {
  // Extract content between <div id="root"> and </div> or <body> and </body>
  const rootMatch = html.match(/<div id="root">([\s\S]*?)<\/div>\s*<script/i) ||
                    html.match(/<div id="root">([\s\S]*?)<\/div>/i) ||
                    html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  let text = rootMatch ? rootMatch[1] : html;

  // Remove script, style, svg
  text = text.replace(/<script[\s\S]*?<\/script>/gi, ' ');
  text = text.replace(/<style[\s\S]*?<\/style>/gi, ' ');
  text = text.replace(/<svg[\s\S]*?<\/svg>/gi, ' ');
  text = text.replace(/<[^>]+>/g, ' ');

  // Decode entities
  text = text.replace(/&amp;/g, '&')
             .replace(/&lt;/g, '<')
             .replace(/&gt;/g, '>')
             .replace(/&quot;/g, '"')
             .replace(/&#39;/g, "'")
             .replace(/&nbsp;/g, ' ');

  return text.trim().replace(/\s+/g, ' ');
}

function countWords(text) {
  if (!text) return 0;
  const words = text.match(/[\w'-]+/g);
  return words ? words.length : 0;
}

console.log('| Route | HTTP Status | HTML Body Word Count | Prerender / Response Status | First 60 Chars |');
console.log('| :--- | :--- | :--- | :--- | :--- |');

for (const route of ROUTES) {
  try {
    const url = `http://localhost:4173${route}`;
    const curlOutput = execSync(`curl -s -i "${url}"`, { encoding: 'utf-8' });
    const [headerPart, ...bodyParts] = curlOutput.split(/\r?\n\r?\n/);
    const bodyHtml = bodyParts.join('\n\n') || headerPart;
    const statusMatch = headerPart.match(/HTTP\/[12](\.[01])?\s+(\d+)/);
    const statusCode = statusMatch ? statusMatch[2] : '200';

    const bodyText = extractBodyText(bodyHtml);
    const wordCount = countWords(bodyText);
    const isPrerendered = wordCount > 0 && !bodyHtml.includes('<div id="root"></div>');
    const sample = bodyText.slice(0, 60).replace(/\n/g, ' ');

    let label = isPrerendered ? 'PRERENDERED (REAL TEXT)' : 'EMPTY SPA';
    if (statusCode === '301') label = '301 REDIRECT';
    if (statusCode === '404') label = '404 NOT FOUND (BRANDED)';

    console.log(`| \`${route}\` | ${statusCode} | ${wordCount} words | ${label} | "${sample}..." |`);
  } catch (err) {
    console.error(`Error curling ${route}:`, err.message);
  }
}
