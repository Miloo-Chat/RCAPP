/**
 * qa_content_audit.cjs
 * Comprehensive QA Audit for Items 6 & 7:
 * - Scans all 20 public routes
 * - Word counts (flags any page under 500 words)
 * - Checks for placeholder text, lorem ipsum, "TODO", generic filler
 * - Checks for repeated paragraphs across articles
 * - Title, meta description length, and H1 count
 */

const fs = require('fs');
const path = require('path');

const CLIENT_DIST = path.resolve(__dirname, 'client/dist');

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
  '/cookie-policy',
  '/transparency',
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

const ARTICLES = [
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

function extractBodyText(html) {
  // Extract content inside <div id="root">...</div>
  const rootMatch = html.match(/<div id="root">([\s\S]*?)<\/div>\s*<script/i) ||
                    html.match(/<div id="root">([\s\S]*?)<\/div>\s*<div id="miloo-splash-screen">/i) ||
                    html.match(/<div id="root">([\s\S]*)<\/div>/i);
  let text = rootMatch ? rootMatch[1] : html;

  // Remove script and style tags
  text = text.replace(/<script[\s\S]*?<\/script>/gi, ' ');
  text = text.replace(/<style[\s\S]*?<\/style>/gi, ' ');
  text = text.replace(/<svg[\s\S]*?<\/svg>/gi, ' ');

  // Strip all HTML tags
  text = text.replace(/<[^>]+>/g, ' ');

  // Decode HTML entities
  text = text.replace(/&amp;/g, '&')
             .replace(/&lt;/g, '<')
             .replace(/&gt;/g, '>')
             .replace(/&quot;/g, '"')
             .replace(/&#39;/g, "'")
             .replace(/&nbsp;/g, ' ');

  // Normalize whitespace
  return text.trim().replace(/\s+/g, ' ');
}

function countWords(text) {
  if (!text) return 0;
  const words = text.match(/[\w'-]+/g);
  return words ? words.length : 0;
}

function extractParagraphs(html) {
  const rootMatch = html.match(/<div id="root">([\s\S]*?)<\/div>/i);
  const content = rootMatch ? rootMatch[1] : html;
  const pMatches = content.match(/<p[\s\S]*?<\/p>/gi) || [];
  return pMatches.map(p => {
    return p.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  }).filter(p => p.length > 50); // only compare substantial paragraphs (>50 chars)
}

function scanContent() {
  console.log('================================================================');
  console.log('🔍 RUNNING COMPREHENSIVE CONTENT QA & ROUTE AUDIT');
  console.log('================================================================\n');

  const results = [];
  const articleParagraphs = new Map(); // paragraphText -> [routes]
  const under500Words = [];
  const placeholderIssues = [];

  for (const route of PUBLIC_ROUTES) {
    const filePath = route === '/'
      ? path.join(CLIENT_DIST, 'index.html')
      : path.join(CLIENT_DIST, route, 'index.html');

    if (!fs.existsSync(filePath)) {
      console.error(`Missing file: ${filePath}`);
      continue;
    }

    const html = fs.readFileSync(filePath, 'utf8');

    // Extract Title
    const titleMatch = html.match(/<title>(.*?)<\/title>/i);
    const title = titleMatch ? titleMatch[1] : 'MISSING';

    // Extract Meta Description
    const descMatch = html.match(/<meta name="description" content="(.*?)"/i);
    const description = descMatch ? descMatch[1] : 'MISSING';
    const descLen = description !== 'MISSING' ? description.length : 0;

    // Count H1
    const h1Matches = html.match(/<h1[\s>]/gi) || [];
    const h1Count = h1Matches.length;

    // Extract Body text & word count
    const bodyText = extractBodyText(html);
    const wordCount = countWords(bodyText);

    // Check placeholders
    const lower = bodyText.toLowerCase();
    const flags = [];
    if (lower.includes('lorem ipsum') || lower.includes('lorem') || lower.includes('ipsum')) {
      flags.push('LOREM_IPSUM');
    }
    if (bodyText.includes('TODO') || bodyText.includes('FIXME')) {
      flags.push('TODO_FOUND');
    }
    if (lower.includes('placeholder text') || lower.includes('sample text') || lower.includes('insert text here') || lower.includes('coming soon')) {
      flags.push('GENERIC_FILLER');
    }

    if (flags.length > 0) {
      placeholderIssues.push({ route, flags });
    }

    const minWords = route === '/' ? 250 : 500;
    if (wordCount < minWords) {
      under500Words.push({ route, wordCount, minExpected: minWords });
    }

    // Paragraph duplicate tracking for articles
    if (ARTICLES.includes(route)) {
      const paragraphs = extractParagraphs(html);
      for (const p of paragraphs) {
        // Skip common nav/boilerplate footer strings if any
        if (p.includes('Miloo uses cookies') || p.includes('Miloo is strictly for adults')) continue;
        if (!articleParagraphs.has(p)) {
          articleParagraphs.set(p, []);
        }
        articleParagraphs.get(p).push(route);
      }
    }

    results.push({
      route,
      wordCount,
      title,
      descLen,
      h1Count,
      flags,
      minWords,
    });
  }

  // Find repeated paragraphs between different articles
  const duplicateParagraphs = [];
  for (const [para, routes] of articleParagraphs.entries()) {
    const uniqueRoutes = [...new Set(routes)];
    if (uniqueRoutes.length > 1) {
      duplicateParagraphs.push({
        routes: uniqueRoutes,
        snippet: para.slice(0, 100) + '...',
      });
    }
  }

  // Print results table
  console.log('| Route | Word Count | Title | Meta Desc Length | H1 Count | Status |');
  console.log('| :--- | :--- | :--- | :--- | :--- | :--- |');
  for (const r of results) {
    const status = (r.wordCount >= r.minWords && r.h1Count === 1 && r.flags.length === 0) ? 'PASS' : 'FLAGGED';
    console.log(`| \`${r.route}\` | ${r.wordCount} words | "${r.title.slice(0, 45)}..." | ${r.descLen} chars | ${r.h1Count} | ${status} |`);
  }

  console.log('\n----------------------------------------------------------------');
  console.log('ITEM 6 CONTENT QA FINDINGS:');
  console.log('----------------------------------------------------------------');
  console.log(`1. Placeholder text / Lorem Ipsum / TODO: ${placeholderIssues.length === 0 ? 'NONE FOUND [CLEAN]' : JSON.stringify(placeholderIssues)}`);
  console.log(`2. Repeated paragraphs between articles: ${duplicateParagraphs.length === 0 ? 'NONE FOUND [CLEAN]' : JSON.stringify(duplicateParagraphs, null, 2)}`);
  console.log(`3. Under target word count (Home >= 250, others >= 500): ${under500Words.length === 0 ? 'NONE [ALL PASS]' : JSON.stringify(under500Words, null, 2)}`);
  console.log('----------------------------------------------------------------\n');
}

scanContent();
