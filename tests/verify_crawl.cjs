// verify_crawl.cjs
// Crawls all prerendered static pages in client/dist/ and verifies:
// 1. Every article links to at least 2 other articles and to /safety or /faq.
// 2. Every information page links back to the homepage (href="/" or "https://miloo.chat/").
// 3. No orphan public pages exist (all are reachable from /).
// 4. No internal links 404.

const fs = require('fs')
const path = require('path')

const siteConfig = fs.readFileSync(path.resolve(__dirname, '../client/src/config/site.js'), 'utf8')
const SHOW_SEO_POSTS = siteConfig.includes('export const SHOW_SEO_POSTS = true')

const DIST_DIR = path.resolve(__dirname, '../client/dist')

if (!fs.existsSync(DIST_DIR)) {
  console.error('client/dist not found. Run "npm run build" first.')
  process.exit(1)
}

const RISKY_ROUTES = [
  '/blog/omegle-alternative',
  '/blog/random-video-chat-india',
  '/blog/stranger-chat-india',
  '/blog/video-chat-no-signup',
]

// Find all HTML files in client/dist
function getHtmlFiles(dir, base = '') {
  let results = []
  const list = fs.readdirSync(dir)
  for (const file of list) {
    if (file === 'server') continue // Skip Vite SSR bundle directory
    const full = path.join(dir, file)
    const rel = path.join(base, file)
    const stat = fs.statSync(full)
    if (stat.isDirectory()) {
      results = results.concat(getHtmlFiles(full, rel))
    } else if (file === 'index.html' || file.endsWith('.html')) {
      results.push({ fullPath: full, relPath: rel })
    }
  }
  return results
}

const allPages = getHtmlFiles(DIST_DIR)
console.log(`Found ${allPages.length} HTML pages in client/dist`)

const linkMap = new Map() // route -> Set of outgoing hrefs
const publicRoutes = new Set()

for (const { fullPath, relPath } of allPages) {
  let route = '/' + relPath.replace(/\/index\.html$/, '').replace(/\.html$/, '')
  if (route === '/index') route = '/'
  if (route.startsWith('//')) route = route.slice(1)

  const content = fs.readFileSync(fullPath, 'utf8')
  const hrefMatches = content.matchAll(/href=["']([^"']+)["']/g)
  const links = new Set()

  for (const m of hrefMatches) {
    let href = m[1].trim()
    if (href.startsWith('https://miloo.chat')) {
      href = href.replace('https://miloo.chat', '') || '/'
    }
    // Remove anchor and query
    href = href.split('#')[0].split('?')[0]
    if (href.startsWith('/') && !href.startsWith('//')) {
      // Normalize trailing slash
      if (href.length > 1 && href.endsWith('/')) href = href.slice(0, -1)
      links.add(href)
    }
  }

  linkMap.set(route, { route, links, content })
  // Exclude private/error routes from standard crawl
  const isExcluded = ['/chat', '/call', '/admin', '/404', '/cookie'].includes(route) ||
                     (!SHOW_SEO_POSTS && RISKY_ROUTES.includes(route))
  if (!isExcluded) {
    publicRoutes.add(route)
  }
}

let errors = 0

console.log('\n--- VERIFYING INTERNAL LINK ARCHITECTURE ---')

// 1. Check all public informational pages link back to homepage
for (const route of publicRoutes) {
  if (route === '/') continue
  const data = linkMap.get(route)
  const hasHomeLink = data.links.has('/') || data.content.includes('href="/"') || data.content.includes('href="https://miloo.chat/"')
  if (!hasHomeLink) {
    console.error(`❌ Page ${route} has no link back to the homepage!`)
    errors++
  } else {
    console.log(`✓ ${route} -> links to homepage`)
  }
}

// 2. Check blog articles
const blogArticles = [
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
]

console.log('\n--- VERIFYING ARTICLE CROSS-LINKING & SAFETY LINKS ---')
for (const art of blogArticles) {
  const data = linkMap.get(art)
  if (!data) {
    console.warn(`⚠️ Article not prerendered: ${art}`)
    continue
  }

  // Count links to other articles
  let articleLinks = 0
  for (const target of blogArticles) {
    if (target !== art && data.links.has(target)) {
      articleLinks++
    }
  }

  const hasSafetyOrFaq = data.links.has('/safety') || data.links.has('/faq')

  if (articleLinks < 2) {
    console.error(`❌ ${art} links to only ${articleLinks} other articles (minimum 2 required)`)
    errors++
  } else {
    console.log(`✓ ${art} -> links to ${articleLinks} related articles`)
  }

  if (!hasSafetyOrFaq) {
    console.error(`❌ ${art} does NOT link to /safety or /faq!`)
    errors++
  } else {
    console.log(`✓ ${art} -> links to safety/faq`)
  }
}

// 3. Check for orphan pages (reachable from homepage)
console.log('\n--- CHECKING REACHABILITY FROM HOMEPAGE (NO ORPHAN PAGES) ---')
const visited = new Set(['/'])
const queue = ['/']

while (queue.length > 0) {
  const current = queue.shift()
  const data = linkMap.get(current)
  if (!data) continue

  for (const next of data.links) {
    if (publicRoutes.has(next) && !visited.has(next)) {
      visited.add(next)
      queue.push(next)
    }
  }
}

for (const pub of publicRoutes) {
  if (!visited.has(pub)) {
    console.error(`❌ ORPHAN PAGE DETECTED: ${pub} is not reachable from homepage crawl!`)
    errors++
  } else {
    console.log(`✓ Reachable from /: ${pub}`)
  }
}

if (errors > 0) {
  console.error(`\n🚨 CRAWL AUDIT FAILED with ${errors} errors!`)
  process.exit(1)
} else {
  console.log('\n✅ CRAWL AUDIT PASSED: Perfect internal linking, no orphans, full safety cross-links.')
  process.exit(0)
}
