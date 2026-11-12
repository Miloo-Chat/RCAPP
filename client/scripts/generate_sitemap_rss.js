// client/scripts/generate_sitemap_rss.js
// Generates sitemap.xml (with real <lastmod>) and rss.xml for the blog.
// Respects SHOW_SEO_POSTS switch: omits noindexed/risky posts when SHOW_SEO_POSTS=false.

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { SHOW_SEO_POSTS } from '../src/config/site.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const rootDir = path.resolve(__dirname, '..')

const DOMAIN = 'https://miloo.chat'

const CORE_PAGES = [
  { url: '/', priority: '1.0', changefreq: 'daily', lastmod: '2026-11-10' },
  { url: '/how-it-works', priority: '0.8', changefreq: 'weekly', lastmod: '2026-11-02' },
  { url: '/safety', priority: '0.9', changefreq: 'weekly', lastmod: '2026-11-02' },
  { url: '/faq', priority: '0.8', changefreq: 'weekly', lastmod: '2026-11-02' },
  { url: '/about', priority: '0.7', changefreq: 'monthly', lastmod: '2026-11-03' },
  { url: '/contact', priority: '0.6', changefreq: 'monthly', lastmod: '2026-11-01' },
  { url: '/transparency', priority: '0.8', changefreq: 'monthly', lastmod: '2026-11-03' },
  { url: '/privacy', priority: '0.6', changefreq: 'monthly', lastmod: '2026-11-01' },
  { url: '/terms', priority: '0.6', changefreq: 'monthly', lastmod: '2026-11-01' },
  { url: '/community-guidelines', priority: '0.7', changefreq: 'monthly', lastmod: '2026-11-01' },
  { url: '/cookie-policy', priority: '0.5', changefreq: 'monthly', lastmod: '2026-11-01' },
  { url: '/blog', priority: '0.8', changefreq: 'weekly', lastmod: '2026-11-03' },
]

const BLOG_POSTS = [
  {
    url: '/blog/parent-guide-to-teens-and-online-chat',
    title: 'A Parent Guide to Teens and Online Chat Platforms',
    description: 'Practical advice for parents on how anonymous chat platforms work, why age limits matter, and how to talk with teenagers about online conversations.',
    pubDate: 'Sat, 07 Nov 2026 08:30:00 GMT',
    lastmod: '2026-11-07',
    priority: '0.7',
    isRisky: false,
  },
  {
    url: '/blog/staying-safe-on-public-wifi-video-chat',
    title: 'Staying Safe on Public Wi-Fi While Video Chatting',
    description: 'How to protect your privacy and your connection when you use video chat on cafe, campus or airport wi-fi, including VPN, browser and surroundings tips.',
    pubDate: 'Sat, 07 Nov 2026 09:30:00 GMT',
    lastmod: '2026-11-07',
    priority: '0.7',
    isRisky: false,
  },
  {
    url: '/blog/video-call-etiquette-and-body-language',
    title: 'Video Call Etiquette and Body Language Basics',
    description: 'Simple, friendly habits for video conversations with new people: framing, lighting, eye contact, listening and how to leave a call politely.',
    pubDate: 'Sat, 07 Nov 2026 10:30:00 GMT',
    lastmod: '2026-11-07',
    priority: '0.7',
    isRisky: false,
  },
  {
    url: '/blog/why-anonymity-matters-online',
    title: 'Why Anonymity Matters: Privacy, Accountability and Trust Online',
    description: 'A balanced look at the value of anonymity on the internet, the problems it can cause, and how platforms try to keep anonymous spaces safe.',
    pubDate: 'Sat, 07 Nov 2026 11:30:00 GMT',
    lastmod: '2026-11-07',
    priority: '0.7',
    isRisky: false,
  },
  {
    url: '/blog/practicing-a-new-language-with-strangers',
    title: 'Practicing a New Language With Strangers Online',
    description: 'How to use spontaneous conversations to practice speaking a new language: preparation, simple goals, handling mistakes and staying safe.',
    pubDate: 'Sat, 07 Nov 2026 12:30:00 GMT',
    lastmod: '2026-11-07',
    priority: '0.7',
    isRisky: false,
  },
  {
    url: '/blog/social-anxiety-and-anonymous-conversation',
    title: 'Social Anxiety and Anonymous Conversation: When It Helps and When It Does Not',
    description: 'A balanced look at how anonymous chat can feel easier for shy or anxious people, where it helps, where it falls short, and how to practice gently.',
    pubDate: 'Sat, 07 Nov 2026 11:00:00 GMT',
    lastmod: '2026-11-07',
    priority: '0.7',
    isRisky: false,
  },
  {
    url: '/blog/healthy-limits-for-late-night-chatting',
    title: 'Healthy Limits for Late-Night Chatting: A Practical Digital Wellbeing Guide',
    description: 'Practical ways to keep late-night conversations enjoyable without hurting your sleep, focus or mood: warning signs, simple limits and wind-down habits.',
    pubDate: 'Sat, 07 Nov 2026 12:00:00 GMT',
    lastmod: '2026-11-07',
    priority: '0.7',
    isRisky: false,
  },
  {
    url: '/blog/how-webrtc-video-chat-works',
    title: 'How WebRTC Works: Peer-to-Peer Video Chat Explained Simply',
    description: 'A plain-language guide to signaling, STUN, TURN relays and encryption, and what direct browser video calls mean for your privacy.',
    pubDate: 'Sat, 07 Nov 2026 09:00:00 GMT',
    lastmod: '2026-11-07',
    priority: '0.7',
    isRisky: false,
  },
  {
    url: '/blog/how-miloo-moderation-works',
    title: 'How Moderation Works on Miloo: Reports, Blocks and Automated Detection',
    description: 'A transparent look at verification, rate limits, automated detection, reporting and enforcement, and what you can do to stay safe.',
    pubDate: 'Sat, 07 Nov 2026 10:00:00 GMT',
    lastmod: '2026-11-07',
    priority: '0.7',
    isRisky: false,
  },
  {
    url: '/blog/stay-safe-talking-to-strangers-online',
    title: 'How to Stay Safe Talking to Strangers Online: The Complete Modern Guide',
    description: 'A comprehensive, actionable guide to protecting your identity, privacy, and peace of mind when chatting with strangers online.',
    pubDate: 'Sun, 01 Nov 2026 10:00:00 GMT',
    lastmod: '2026-11-12',
    priority: '0.7',
    isRisky: false,
  },
  {
    url: '/blog/how-to-spot-scams-on-chat-sites',
    title: 'How to Spot Scams and Fake Profiles on Random Chat Sites',
    description: 'Practical ways to identify financial fraud, phishing bots, and fake camera loops on random chat platforms.',
    pubDate: 'Tue, 08 Sep 2026 12:00:00 GMT',
    lastmod: '2026-11-12',
    priority: '0.7',
    isRisky: false,
  },
  {
    url: '/blog/protecting-privacy-in-video-chat',
    title: 'Protecting Your Privacy in Video Chat: The Essential Checklist',
    description: 'Actionable steps to safeguard your personal space, webcam angle, and network details before turning on video.',
    pubDate: 'Sat, 12 Sep 2026 14:00:00 GMT',
    lastmod: '2026-11-03',
    priority: '0.7',
    isRisky: false,
  },
  {
    url: '/blog/how-to-report-and-block-abusive-users',
    title: 'How to Report and Block Abusive Users on Miloo',
    description: 'A detailed walkthrough of our instant blocking, moderation reporting desk, and permanent ban enforcement.',
    pubDate: 'Fri, 18 Sep 2026 09:00:00 GMT',
    lastmod: '2026-11-03',
    priority: '0.7',
    isRisky: false,
  },
  {
    url: '/blog/tips-for-starting-good-conversation-with-stranger',
    title: '10 Tips for Starting a Great Conversation with a Stranger',
    description: 'Break the ice effortlessly with creative conversation openers, humor, and active listening.',
    pubDate: 'Tue, 22 Sep 2026 11:00:00 GMT',
    lastmod: '2026-11-03',
    priority: '0.7',
    isRisky: false,
  },
  {
    url: '/blog/what-to-do-if-someone-harasses-you-online',
    title: 'What to Do If Someone Harasses You Online: Action Steps',
    description: 'Crucial steps for documenting harassment, reporting offenders, and getting immediate support.',
    pubDate: 'Sat, 26 Sep 2026 16:00:00 GMT',
    lastmod: '2026-11-03',
    priority: '0.7',
    isRisky: false,
  },
  {
    url: '/blog/omegle-alternative',
    title: 'Best Omegle Alternatives in India 2026',
    description: 'Looking for the best Omegle alternative? Discover Miloo — free random chat, no signup, meet strangers online instantly.',
    pubDate: 'Fri, 02 Oct 2026 08:00:00 GMT',
    lastmod: '2026-11-03',
    priority: '0.6',
    isRisky: true,
  },
  {
    url: '/blog/random-video-chat-india',
    title: 'Random Video Chat in India: Staying Safe, Connected, and Anonymous in 2026',
    description: 'Explore how random video chat works in India. Tips for low-latency WebRTC on Jio and Airtel, scam protection, and etiquette.',
    pubDate: 'Thu, 08 Oct 2026 10:30:00 GMT',
    lastmod: '2026-11-03',
    priority: '0.6',
    isRisky: true,
  },
  {
    url: '/blog/stranger-chat-india',
    title: 'Stranger Chat in India: The Rise of Anonymous Text & Video Platforms',
    description: 'Discover why anonymous stranger chat is booming across India. How spontaneous 1-on-1 conversations offer relief from algorithms.',
    pubDate: 'Thu, 15 Oct 2026 14:00:00 GMT',
    lastmod: '2026-11-03',
    priority: '0.6',
    isRisky: true,
  },
  {
    url: '/blog/video-chat-no-signup',
    title: 'Video Chat Without Sign-Up: Why Browser-Based P2P is the Future',
    description: 'Discover why browser-based WebRTC video chat with no signup is the safest and fastest way to connect with strangers online.',
    pubDate: 'Tue, 20 Oct 2026 12:00:00 GMT',
    lastmod: '2026-11-03',
    priority: '0.6',
    isRisky: true,
  },
]

export function generateSitemapAndRSS() {
  const activeBlogPosts = BLOG_POSTS.filter((post) => SHOW_SEO_POSTS || !post.isRisky)

  // 1. Build sitemap.xml
  const sitemapUrls = [...CORE_PAGES, ...activeBlogPosts.map(p => ({
    url: p.url,
    priority: p.priority,
    changefreq: 'weekly',
    lastmod: p.lastmod,
  }))]

  const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemapUrls
  .map(
    (item) => `  <url>
    <loc>${DOMAIN}${item.url}</loc>
    <lastmod>${item.lastmod}</lastmod>
    <changefreq>${item.changefreq}</changefreq>
    <priority>${item.priority}</priority>
  </url>`
  )
  .join('\n')}
</urlset>
`

  // 2. Build rss.xml
  const rssXml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Miloo Blog — Online Safety, Privacy &amp; Digital Connection</title>
    <link>${DOMAIN}/blog</link>
    <description>Expert safety guides, WebRTC privacy checklists, and conversation tips for spontaneous stranger chats.</description>
    <language>en-US</language>
    <lastBuildDate>Tue, 03 Nov 2026 12:00:00 GMT</lastBuildDate>
    <atom:link href="${DOMAIN}/rss.xml" rel="self" type="application/rss+xml"/>
${activeBlogPosts
  .map(
    (post) => `    <item>
      <title><![CDATA[${post.title}]]></title>
      <link>${DOMAIN}${post.url}</link>
      <guid isPermaLink="true">${DOMAIN}${post.url}</guid>
      <pubDate>${post.pubDate}</pubDate>
      <description><![CDATA[${post.description}]]></description>
      <author>support@miloo.chat (Miloo Safety &amp; Editorial Team)</author>
    </item>`
  )
  .join('\n')}
  </channel>
</rss>
`

  // Write to public/ and dist/
  const publicDir = path.join(rootDir, 'public')
  const distDir = path.join(rootDir, 'dist')

  fs.writeFileSync(path.join(publicDir, 'sitemap.xml'), sitemapXml, 'utf-8')
  fs.writeFileSync(path.join(publicDir, 'rss.xml'), rssXml, 'utf-8')

  if (fs.existsSync(distDir)) {
    fs.writeFileSync(path.join(distDir, 'sitemap.xml'), sitemapXml, 'utf-8')
    fs.writeFileSync(path.join(distDir, 'rss.xml'), rssXml, 'utf-8')
  }

  console.log(`✓ Generated sitemap.xml (${sitemapUrls.length} URLs) and rss.xml (${activeBlogPosts.length} articles)`)
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  generateSitemapAndRSS()
}
