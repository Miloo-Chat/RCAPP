import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { ADSENSE_PUB_ID, SHOW_SEO_POSTS } from './src/config/site.js'
import { generateOGImages } from './scripts/generate_og_images.js'
import { generateSitemapAndRSS } from './scripts/generate_sitemap_rss.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const toAbsolute = (p) => path.resolve(__dirname, p)

const RISKY_ROUTES = [
  '/blog/omegle-alternative',
  '/blog/random-video-chat-india',
  '/blog/stranger-chat-india',
  '/blog/video-chat-no-signup',
]

const FAQ_ITEMS = [
  {
    q: 'Is Miloo completely free to use?',
    a: 'Yes, Miloo is 100% free to use for all adult visitors. We do not have paid subscriptions, VIP tiers, paywalls, coin systems, or hidden fees. Both video chat and text chat features are completely accessible without submitting a credit card, payment details, or in-app purchases. Our operational hosting costs are supported transparently by privacy-friendly Google AdSense advertisements displayed strictly on public editorial pages.'
  },
  {
    q: 'Do I need to create an account, register, or download an app?',
    a: 'No account, sign-up, or mobile app download is required. Miloo is built from the ground up to offer instant, zero-friction anonymous communication directly inside your mobile or desktop web browser. You do not need to link a Google or Apple account, verify an email address, or provide a mobile phone number. You simply open https://miloo.chat, verify you are 18 or older, and immediately begin chatting.'
  },
  {
    q: 'Who is allowed to use Miloo? What is your age requirement?',
    a: 'Miloo is strictly and exclusively intended for adults aged 18 years and older. Individuals under the age of 18 (minors) are strictly prohibited from creating connections, viewing video streams, or sending text messages on our platform. Because stranger chats are unmoderated peer-to-peer interactions, we enforce this adult-only policy without exception across all regional rooms and modes.'
  },
  {
    q: 'Why does Miloo strictly prohibit minors and enforce an 18+ age gate?',
    a: 'Protecting minors from spontaneous adult content, online scams, cyberbullying, and potential child exploitation is our highest ethical responsibility. In compliance with the Children’s Online Privacy Protection Act (COPPA), the UK Online Safety Act, and international child protection directives, Miloo enforces a mandatory age verification gate prior to room entry and immediately terminates sessions if underage access is suspected or reported.'
  },
  {
    q: 'Does Miloo record, intercept, or store my video and audio calls?',
    a: 'No. Miloo never records, monitors, intercepts, or stores your live video or audio conversations. All media streams travel directly between you and your matched partner using peer-to-peer WebRTC connections protected by industry-standard DTLS (Datagram Transport Layer Security) and SRTP (Secure Real-time Transport Protocol) encryption. Our central signaling servers merely broker the initial connection handshake and never touch your decrypted video or microphone data.'
  },
  {
    q: 'Can another user record my video feed or take screenshots?',
    a: 'While Miloo itself provides no recording tools or screenshot capture functionality, any external party could theoretically use third-party screen capture software, operating system screenshot shortcuts, or an external camera to record their screen. For this reason, we urge all users to exercise good judgment: never share identifying personal documents, do not show sensitive personal items on camera, and protect your privacy at all times.'
  },
  {
    q: 'How does the "Skip" button work, and can I use keyboard shortcuts?',
    a: 'Clicking the "Skip" button (or pressing the Escape key on your physical keyboard) immediately and cleanly tears down your active WebRTC peer connection. The server instantly detaches you from your previous partner and enters you into the matchmaking queue to pair with a new stranger. Skipping is instantaneous, and all active conversation history is completely wiped from local browser memory the moment you disconnect.'
  },
  {
    q: 'How does the "Block User" feature work?',
    a: 'When you click "Block User" during or immediately following a conversation, Miloo severs the connection and places that user’s ephemeral session ID into your local browser blacklist. Our matchmaking engine cross-references this blacklist to ensure you are never paired with that individual again during your active browser session, giving you absolute control over your conversational environment.'
  },
  {
    q: 'What should I do if a stranger violates the rules or makes me uncomfortable?',
    a: 'You have three immediate protective tools: 1) Click "Skip" or hit Escape to disconnect immediately. 2) Tap "Block User" so you never match with them again. 3) Click "Report User" in the chat header to submit an immediate safety violation report directly to our moderation desk, selecting the appropriate category (harassment, nudity, spam, extortion, or threats).'
  },
  {
    q: 'How do reports work, and what happens after I submit a safety report?',
    a: 'When you submit a report, our backend logs the timestamp, the reported party’s encrypted identifier, and your selected reason code. Our moderation team reviews these reports against automated abuse heuristics. Confirmed violators face immediate session termination, client-side cookie invalidation, browser fingerprint suspensions, and permanent network-level IP bans.'
  },
  {
    q: 'How are bans and suspensions enforced on Miloo?',
    a: 'Miloo uses a multi-layered moderation architecture to enforce bans effectively. We identify offending clients through a combination of SHA-256 hashed IP addresses, persistent client ID cookies (miloo_uid), and device hardware fingerprints. When a user is suspended or banned, our Socket.IO server automatically rejects connection handshakes and prevents the client from entering the matchmaking queue.'
  },
  {
    q: 'Can I appeal an accidental suspension or ban?',
    a: 'Yes. If you believe your device or IP was suspended in error—such as when sharing a communal university Wi-Fi network, cellular carrier NAT gateway, or dynamic residential IP—you can submit a formal appeal through our Contact page or by emailing support@miloo.chat. Include your approximate access timestamp and network environment details, and our human moderation staff will review your case.'
  },
  {
    q: 'Does Miloo use AI bots or automated chat partners?',
    a: 'Miloo does not use AI bots or automated partners. Every stranger you meet is a real person.'
  },
  {
    q: 'What permissions does Miloo request from my browser, and can I use text only?',
    a: 'If you select Text Chat mode, Miloo requests zero hardware permissions from your device. If you select Video Chat mode, your browser will prompt you for permission to access your Camera and Microphone. These permissions are strictly utilized client-side by WebRTC to transmit real-time video frames and audio packets to your peer. You can revoke permissions at any time via your browser settings.'
  },
  {
    q: 'What should I do if my camera or microphone fails to connect or shows a black screen?',
    a: 'If your camera fails to start: 1) Check the lock or tune icon in your browser’s address bar and confirm Camera and Microphone permissions are set to "Allow". 2) Ensure no other program (such as Zoom, Microsoft Teams, FaceTime, or Discord) is locking your webcam hardware. 3) Verify hardware acceleration is enabled in your browser settings. 4) If problems persist, refresh the page or test in a private/incognito window.'
  },
  {
    q: 'Does Miloo work on mobile phones and tablets?',
    a: 'Yes, Miloo is completely mobile-responsive and engineered for touchscreens. It works smoothly in mobile browsers on iOS (Safari, Chrome) and Android (Chrome, Firefox, Samsung Internet). The user interface automatically adapts to both portrait and landscape screen orientations, offering convenient, touch-friendly skip and report controls without needing any app installation.'
  },
  {
    q: 'Which desktop and mobile web browsers are supported?',
    a: 'Miloo supports all modern web browsers compliant with HTML5, WebSockets, and WebRTC protocols. This includes Google Chrome, Apple Safari (macOS and iOS), Mozilla Firefox, Microsoft Edge, Brave, and Opera across Android, iOS, Windows, macOS, Linux, and ChromeOS devices. For the lowest latency and optimal video quality, we recommend keeping your browser updated to its latest stable release.'
  },
  {
    q: 'Does Miloo use cookies or track my browsing activities?',
    a: 'Miloo respects user privacy and does not track your online browsing across external websites. We use necessary first-party cookies and local storage tokens solely to maintain your functional UI preferences (such as dark mode selection and age confirmation status). On public content pages, we utilize Google AdSense to serve privacy-compliant advertisements that keep the site free for everyone.'
  },
  {
    q: 'How does Miloo handle user data deletion and GDPR/CCPA privacy rights?',
    a: 'Because Miloo operates without registered user accounts, profiles, message databases, or stored call recordings, there is virtually no personal identity data retained after a chat terminates. Your text messages exist only in temporary device memory during the active session and are permanently cleared upon disconnect. To purge local preferences, simply clear your browser’s site cookies and storage.'
  },
  {
    q: 'What are the rules regarding nudity, hate speech, and harassment?',
    a: 'Miloo enforces a strict zero-tolerance code of conduct. Nudity, sexually explicit acts, vulgar gestures, harassment, hate speech, racial slurs, threats of violence, cyberbullying, financial scamming, and commercial advertising are strictly banned. Users engaging in prohibited behavior are subject to immediate session termination, automated blacklisting, and permanent device/network bans.'
  },
  {
    q: 'How much internet bandwidth and mobile data does video chat consume?',
    a: 'Text chat consumes virtually zero data (a few kilobytes per minute). Video chat utilizes dynamic WebRTC bandwidth adaptation, typically consuming between 0.5 Mbps and 1.5 Mbps (roughly 250 MB to 600 MB per hour) depending on your resolution and network stability. For the smoothest video calling experience on mobile devices, we recommend connecting via high-speed Wi-Fi or 4G/5G mobile data.'
  }
]

function makeArticleSchema(headline, description, url, datePublished = '2026-09-01', dateModified = '2026-11-03') {
  const slug = url.slice(1).replace(/\//g, '-')
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Article',
        '@id': `${url}#article`,
        headline,
        description,
        url,
        image: `https://miloo.chat/og/${slug}.png`,
        datePublished,
        dateModified,
        author: {
          '@type': 'Organization',
          name: 'Miloo Safety & Editorial Team',
          url: 'https://miloo.chat/about#team'
        },
        publisher: {
          '@type': 'Organization',
          name: 'Miloo',
          url: 'https://miloo.chat',
          logo: {
            '@type': 'ImageObject',
            url: 'https://miloo.chat/logo-symbol.svg'
          }
        }
      },
      {
        '@type': 'BreadcrumbList',
        '@id': `${url}#breadcrumb`,
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://miloo.chat/' },
          { '@type': 'ListItem', position: 2, name: 'Blog', item: 'https://miloo.chat/blog' },
          { '@type': 'ListItem', position: 3, name: headline, item: url }
        ]
      }
    ]
  }
}

function makePageSchema(name, url) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://miloo.chat/' },
      { '@type': 'ListItem', position: 2, name, item: url }
    ]
  }
}

const HOME_SCHEMA = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      '@id': 'https://miloo.chat/#organization',
      name: 'Miloo',
      url: 'https://miloo.chat',
      logo: 'https://miloo.chat/og-image.png',
      sameAs: ['https://twitter.com/miloochat'],
      description: 'Free anonymous random video and text chat platform for adults. Spontaneous human connection with zero login, no apps, and strict privacy protection.'
    },
    {
      '@type': 'WebSite',
      '@id': 'https://miloo.chat/#website',
      name: 'Miloo',
      url: 'https://miloo.chat/',
      description: 'Free anonymous random video and text chat platform for adults. Meet strangers instantly with zero signup.',
      publisher: {
        '@id': 'https://miloo.chat/#organization'
      }
    },
    {
      '@type': 'WebApplication',
      '@id': 'https://miloo.chat/#webapp',
      name: 'Miloo',
      url: 'https://miloo.chat',
      description: 'Free anonymous random video and text chat platform. Connect instantly with strangers without signup or logins.',
      applicationCategory: 'SocialNetworkingApplication',
      operatingSystem: 'Any',
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'USD'
      }
    }
  ]
}

const FAQ_SCHEMA = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'FAQPage',
      '@id': 'https://miloo.chat/faq#faqpage',
      mainEntity: FAQ_ITEMS.map((item) => ({
        '@type': 'Question',
        name: item.q,
        acceptedAnswer: {
          '@type': 'Answer',
          text: item.a
        }
      }))
    },
    {
      '@type': 'BreadcrumbList',
      '@id': 'https://miloo.chat/faq#breadcrumb',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://miloo.chat/' },
        { '@type': 'ListItem', position: 2, name: 'FAQ', item: 'https://miloo.chat/faq' }
      ]
    }
  ]
}

const ROUTES_META = {
  '/': {
    title: 'Miloo — Free Anonymous Random Video & Text Chat (18+)',
    description: 'Connect with random strangers instantly on Miloo. Free peer-to-peer video and text chat with no login, no apps, and strict privacy protection. Strictly 18+.',
    canonical: 'https://miloo.chat/',
    schema: HOME_SCHEMA
  },
  '/how-it-works': {
    title: 'How It Works — Miloo Anonymous Video & Text Chat',
    description: 'Discover how Miloo works: anonymous WebRTC chat matching, camera permissions, instant skips, safety reports, and AI companions. No account or sign-up needed.',
    canonical: 'https://miloo.chat/how-it-works',
    schema: makePageSchema('How It Works', 'https://miloo.chat/how-it-works')
  },
  '/safety': {
    title: 'Safety Center & Online Chat Guidelines — Miloo',
    description: 'Essential safety tips for chatting with strangers online. Protect your privacy, spot scam red flags, secure video backgrounds, and report abusive conduct.',
    canonical: 'https://miloo.chat/safety',
    schema: makePageSchema('Safety Center', 'https://miloo.chat/safety')
  },
  '/faq': {
    title: 'Frequently Asked Questions (FAQ) — Miloo',
    description: 'Find clear answers to 20+ questions about Miloo: free random video chat, privacy, WebRTC security, strict 18+ policy, skipping, reporting, and ban appeals.',
    canonical: 'https://miloo.chat/faq',
    schema: FAQ_SCHEMA
  },
  '/about': {
    title: 'About Miloo — Our Story & Vision for Modern Anonymous Chat',
    description: 'Learn why Miloo was built: reviving spontaneous human connection online with modern WebRTC peer privacy, zero profiling, and uncompromising safety standards.',
    canonical: 'https://miloo.chat/about',
    schema: makePageSchema('About', 'https://miloo.chat/about')
  },
  '/contact': {
    title: 'Contact & Support Desk — Miloo',
    description: 'Get in touch with the Miloo team for technical support, safety reports, business inquiries, and DMCA notices. We respond within 24-48 hours.',
    canonical: 'https://miloo.chat/contact',
    schema: makePageSchema('Contact', 'https://miloo.chat/contact')
  },
  '/privacy': {
    title: 'Privacy Policy — Miloo Anonymous Chat',
    description: 'Miloo Privacy Policy: Learn how we protect privacy, manage ephemeral WebRTC streams, disclose Google AdSense and cookies, and respect user privacy rights.',
    canonical: 'https://miloo.chat/privacy',
    schema: makePageSchema('Privacy Policy', 'https://miloo.chat/privacy')
  },
  '/terms': {
    title: 'Terms of Service — Miloo (18+ Adults Only)',
    description: 'Miloo Terms of Service: Platform rules, strict 18+ eligibility requirement, acceptable use policies, AI companion disclosures, and user agreements.',
    canonical: 'https://miloo.chat/terms',
    schema: makePageSchema('Terms of Service', 'https://miloo.chat/terms')
  },
  '/community-guidelines': {
    title: 'Community Guidelines — Miloo',
    description: 'Our expectations for safe, civil, and enjoyable conversations on Miloo. Review our zero-tolerance policies against harassment, nudity, scams, and abuse.',
    canonical: 'https://miloo.chat/community-guidelines',
    schema: makePageSchema('Community Guidelines', 'https://miloo.chat/community-guidelines')
  },
  '/cookie-policy': {
    title: 'Cookie Policy — Miloo Anonymous Chat',
    description: 'Miloo Cookie Policy: Learn how we use essential cookies, browser local storage, Google Analytics, and Google-certified CMP for advertising consent.',
    canonical: 'https://miloo.chat/cookie-policy',
    schema: makePageSchema('Cookie Policy', 'https://miloo.chat/cookie-policy')
  },
  '/transparency': {
    title: 'Transparency & Moderation Report — Miloo',
    description: 'Miloo transparency report: real-time moderation mechanics, automated safety filters, zero message retention, strike systems, and appeal processes.',
    canonical: 'https://miloo.chat/transparency',
    schema: makePageSchema('Transparency', 'https://miloo.chat/transparency')
  },
  '/blog': {
    title: 'Miloo Blog — Safety Guides, Chat Tips & Online Privacy',
    description: 'Explore expert guides on staying safe talking to strangers online, spotting digital scams, protecting webcam privacy, and starting engaging conversations.',
    canonical: 'https://miloo.chat/blog',
    schema: makePageSchema('Blog', 'https://miloo.chat/blog')
  },
  '/blog/stay-safe-talking-to-strangers-online': {
    title: 'How to Stay Safe Talking to Strangers Online — Miloo Blog',
    description: 'Practical ways to protect your personal identity, identify manipulation, set firm boundaries, and stay safe when chatting with strangers on video and text.',
    canonical: 'https://miloo.chat/blog/stay-safe-talking-to-strangers-online',
    schema: makeArticleSchema(
      'How to Stay Safe Talking to Strangers Online',
      'Practical ways to protect your personal identity, identify manipulation, set firm boundaries, and stay safe when chatting with strangers on video and text.',
      'https://miloo.chat/blog/stay-safe-talking-to-strangers-online',
      '2026-09-01'
    )
  },
  '/blog/how-to-spot-scams-on-chat-sites': {
    title: 'How to Spot Scams & Fake Profiles on Random Chat Sites — Miloo',
    description: 'Comprehensive guide to identifying scams, automated bots, fake webcam feeds, and phishing tricks on stranger chat platforms.',
    canonical: 'https://miloo.chat/blog/how-to-spot-scams-on-chat-sites',
    schema: makeArticleSchema(
      'How to Spot Scams & Fake Profiles on Random Chat Sites',
      'Comprehensive guide to identifying scams, automated bots, fake webcam feeds, and phishing tricks on stranger chat platforms.',
      'https://miloo.chat/blog/how-to-spot-scams-on-chat-sites',
      '2026-09-08'
    )
  },
  '/blog/protecting-privacy-in-video-chat': {
    title: 'Protecting Your Privacy in Video Chat: Checklist — Miloo Blog',
    description: 'Practical checklist for protecting webcam privacy, avoiding background clues, securing WebRTC connections, and managing browser permissions.',
    canonical: 'https://miloo.chat/blog/protecting-privacy-in-video-chat',
    schema: makeArticleSchema(
      'Protecting Your Privacy in Video Chat: The Essential Checklist',
      'Practical checklist for protecting webcam privacy, avoiding background clues, securing WebRTC connections, and managing browser permissions.',
      'https://miloo.chat/blog/protecting-privacy-in-video-chat',
      '2026-09-12'
    )
  },
  '/blog/how-to-report-and-block-abusive-users': {
    title: 'How to Report & Block Abusive Users — Miloo Blog',
    description: 'Learn how reporting and blocking work on Miloo: reporting categories, moderation review, session blacklisting, and community protection.',
    canonical: 'https://miloo.chat/blog/how-to-report-and-block-abusive-users',
    schema: makeArticleSchema(
      'How to Report & Block Abusive Users on Miloo',
      'Learn how reporting and blocking work on Miloo: reporting categories, moderation review, session blacklisting, and community protection.',
      'https://miloo.chat/blog/how-to-report-and-block-abusive-users',
      '2026-09-18'
    )
  },
  '/blog/tips-for-starting-good-conversation-with-stranger': {
    title: '10 Tips for Starting a Great Conversation with a Stranger — Miloo Blog',
    description: 'Ditch awkward "m or f" questions. Discover creative conversation starters, observational humor, and active listening tips for video and text chat.',
    canonical: 'https://miloo.chat/blog/tips-for-starting-good-conversation-with-stranger',
    schema: makeArticleSchema(
      '10 Tips for Starting a Great Conversation with a Stranger',
      'Ditch awkward "m or f" questions. Discover creative conversation starters, observational humor, and active listening tips for video and text chat.',
      'https://miloo.chat/blog/tips-for-starting-good-conversation-with-stranger',
      '2026-09-22'
    )
  },
  '/blog/how-webrtc-video-chat-works': {
    title: 'How WebRTC Works: Peer-to-Peer Video Chat Explained Simply — Miloo Blog',
    description: 'A plain-language guide to signaling, STUN, TURN relays and encryption, and what direct browser video calls mean for your privacy.',
    canonical: 'https://miloo.chat/blog/how-webrtc-video-chat-works',
    schema: makeArticleSchema(
      'How WebRTC Works: Peer-to-Peer Video Chat Explained Simply',
      'A plain-language guide to signaling, STUN, TURN relays and encryption, and what direct browser video calls mean for your privacy.',
      'https://miloo.chat/blog/how-webrtc-video-chat-works',
      '2026-11-07'
    )
  },
  '/blog/how-miloo-moderation-works': {
    title: 'How Moderation Works on Miloo: Reports, Blocks and Automated Detection — Miloo Blog',
    description: 'A transparent look at verification, rate limits, automated detection, reporting and enforcement, and what you can do to stay safe.',
    canonical: 'https://miloo.chat/blog/how-miloo-moderation-works',
    schema: makeArticleSchema(
      'How Moderation Works on Miloo: Reports, Blocks and Automated Detection',
      'A transparent look at verification, rate limits, automated detection, reporting and enforcement, and what you can do to stay safe.',
      'https://miloo.chat/blog/how-miloo-moderation-works',
      '2026-11-07'
    )
  },
  '/blog/what-to-do-if-someone-harasses-you-online': {
    title: 'What to Do If Someone Harasses You Online — Miloo Blog',
    description: 'Action plan for handling cyber harassment, threats, or extortion. Learn evidence preservation, platform reporting, and international legal support hotlines.',
    canonical: 'https://miloo.chat/blog/what-to-do-if-someone-harasses-you-online',
    schema: makeArticleSchema(
      'What to Do If Someone Harasses You Online',
      'Action plan for handling cyber harassment, threats, or extortion. Learn evidence preservation, platform reporting, and international legal support hotlines.',
      'https://miloo.chat/blog/what-to-do-if-someone-harasses-you-online',
      '2026-09-26'
    )
  },
  '/blog/omegle-alternative': {
    title: 'Best Omegle Alternatives in India 2026 | Miloo',
    description: 'Looking for the best Omegle alternative in India? Discover Miloo — free random chat, no signup, meet strangers online instantly. Top picks for 2026.',
    canonical: 'https://miloo.chat/blog/omegle-alternative',
    schema: makeArticleSchema(
      'Best Omegle Alternatives in India 2026',
      'Looking for the best Omegle alternative in India? Discover Miloo — free random chat, no signup, meet strangers online instantly. Top picks for 2026.',
      'https://miloo.chat/blog/omegle-alternative',
      '2026-10-02'
    )
  },
  '/blog/random-video-chat-india': {
    title: 'Random Video Chat India 2026 — Miloo Safety & Connectivity Guide',
    description: 'Explore how random video chat works in India. Tips for low-latency WebRTC on Jio and Airtel, scam protection, cultural etiquette, and anonymous chatting.',
    canonical: 'https://miloo.chat/blog/random-video-chat-india',
    schema: makeArticleSchema(
      'Random Video Chat in India: Staying Safe, Connected, and Anonymous in 2026',
      'Explore how random video chat works in India. Tips for low-latency WebRTC on Jio and Airtel, scam protection, cultural etiquette, and anonymous chatting.',
      'https://miloo.chat/blog/random-video-chat-india',
      '2026-10-08'
    )
  },
  '/blog/stranger-chat-india': {
    title: 'Stranger Chat in India 2026 — Culture, Trends & Safety | Miloo',
    description: 'Discover why anonymous stranger chat is booming across India. How spontaneous 1-on-1 conversations offer relief from algorithm-heavy social networks.',
    canonical: 'https://miloo.chat/blog/stranger-chat-india',
    schema: makeArticleSchema(
      'Stranger Chat in India: The Rise of Anonymous Text & Video Platforms',
      'Discover why anonymous stranger chat is booming across India. How spontaneous 1-on-1 conversations offer relief from algorithm-heavy social networks.',
      'https://miloo.chat/blog/stranger-chat-india',
      '2026-10-15'
    )
  },
  '/blog/video-chat-no-signup': {
    title: 'Video Chat Without Sign-Up — Free, Private & Instant | Miloo',
    description: 'Discover why browser-based WebRTC video chat with no signup is the safest and fastest way to connect with strangers online without sharing personal data.',
    canonical: 'https://miloo.chat/blog/video-chat-no-signup',
    schema: makeArticleSchema(
      'Video Chat Without Sign-Up: Why Browser-Based P2P is the Future',
      'Discover why browser-based WebRTC video chat with no signup is the safest and fastest way to connect with strangers online without sharing personal data.',
      'https://miloo.chat/blog/video-chat-no-signup',
      '2026-10-20'
    )
  },
  '/404': {
    title: '404 — This bird flew away · Miloo',
    description: 'This bird flew away. The perch is empty, but another conversation is waiting on the main wire.',
    canonical: 'https://miloo.chat/404',
    schema: makePageSchema('404 Not Found', 'https://miloo.chat/404')
  }
}

const ADSENSE_SNIPPET = `<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_PUB_ID}" crossorigin="anonymous"></script>`

async function prerender() {
  const isProduction = process.env.NODE_ENV === 'production' || process.env.CHECK_PRODUCTION_BUILD === '1' || process.env.PRODUCTION_BUILD === 'true';
  const backendHttp = process.env.BACKEND_HTTP_ORIGIN;
  const backendWss = process.env.BACKEND_WSS_ORIGIN;

  if (isProduction && (!backendHttp || !backendWss)) {
    console.error('\n❌ PRODUCTION BUILD FAILED: Missing required backend origin environment variables.');
    if (!backendHttp) console.error('   Missing: BACKEND_HTTP_ORIGIN (e.g. BACKEND_HTTP_ORIGIN=https://api.example.com)');
    if (!backendWss) console.error('   Missing: BACKEND_WSS_ORIGIN (e.g. BACKEND_WSS_ORIGIN=wss://api.example.com)');
    console.error('Both variables are strictly required to assemble production Content-Security-Policy.\n');
    process.exit(1);
  }

  const templatePath = toAbsolute('dist/index.html')
  if (!fs.existsSync(templatePath)) {
    console.error('dist/index.html not found. Run "vite build" first.')
    process.exit(1)
  }

  const template = fs.readFileSync(templatePath, 'utf-8')
  const { render } = await import('./dist/server/entry-server.js')

  console.log(`Prerendering ${Object.keys(ROUTES_META).length} routes...`)

  // 1. Generate unique 1200x630 OG Images using satori + sharp
  try {
    await generateOGImages()
  } catch (err) {
    console.warn('OG image generation skipped or failed:', err.message)
  }

  for (const [url, meta] of Object.entries(ROUTES_META)) {
    const { html: appHtml } = render(url)

    let pageHtml = template.replace(
      '<div id="root"></div>',
      `<div id="root">${appHtml}</div>`
    )

    // Helper to escape attribute values
    const esc = (s) => String(s).replace(/"/g, '&quot;')

    // Replace Title
    if (meta.title) {
      pageHtml = pageHtml.replace(/<title>.*?<\/title>/i, `<title>${meta.title}</title>`)
      pageHtml = pageHtml.replace(/<meta property="og:title" content=".*?" \/>/i, `<meta property="og:title" content="${esc(meta.title)}" />`)
      pageHtml = pageHtml.replace(/<meta name="twitter:title" content=".*?" \/>/i, `<meta name="twitter:title" content="${esc(meta.title)}" />`)
    }

    // Replace Description
    if (meta.description) {
      pageHtml = pageHtml.replace(/<meta name="description" content=".*?" \/>/i, `<meta name="description" content="${esc(meta.description)}" />`)
      pageHtml = pageHtml.replace(/<meta property="og:description" content=".*?" \/>/i, `<meta property="og:description" content="${esc(meta.description)}" />`)
      pageHtml = pageHtml.replace(/<meta name="twitter:description" content=".*?" \/>/i, `<meta name="twitter:description" content="${esc(meta.description)}" />`)
    }

    // Replace Canonical
    if (meta.canonical) {
      pageHtml = pageHtml.replace(/<link rel="canonical" href=".*?" \/>/i, `<link rel="canonical" href="${meta.canonical}" />`)
      pageHtml = pageHtml.replace(/<meta property="og:url" content=".*?" \/>/i, `<meta property="og:url" content="${meta.canonical}" />`)
    }

    // Replace OG and Twitter Image with page-specific graphic
    const slug = url === '/' ? 'home' : url.slice(1).replace(/\//g, '-')
    const ogImageUrl = `https://miloo.chat/og/${slug}.png`
    pageHtml = pageHtml.replace(/<meta property="og:image" content=".*?" \/>/i, `<meta property="og:image" content="${ogImageUrl}" />`)
    pageHtml = pageHtml.replace(/<meta property="og:image" content=".*?">/i, `<meta property="og:image" content="${ogImageUrl}">`)
    pageHtml = pageHtml.replace(/<meta name="twitter:image" content=".*?" \/>/i, `<meta name="twitter:image" content="${ogImageUrl}" />`)
    pageHtml = pageHtml.replace(/<meta name="twitter:image" content=".*?">/i, `<meta name="twitter:image" content="${ogImageUrl}">`)

    // Replace JSON-LD schema
    if (meta.schema) {
      const schemaStr = JSON.stringify(meta.schema)
      const schemaTag = `<script type="application/ld+json">\n    ${schemaStr}\n    </script>`
      if (pageHtml.includes('<script type="application/ld+json">')) {
        pageHtml = pageHtml.replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>/i, schemaTag)
      } else {
        pageHtml = pageHtml.replace('</head>', `    ${schemaTag}\n  </head>`)
      }
    }

    // Ensure AdSense verification meta tag is in head
    const adsenseMetaTag = `<meta name="google-adsense-account" content="${ADSENSE_PUB_ID}">`
    if (!pageHtml.includes('name="google-adsense-account"')) {
      pageHtml = pageHtml.replace('</head>', `    ${adsenseMetaTag}\n  </head>`)
    } else {
      pageHtml = pageHtml.replace(/<meta name="google-adsense-account" content=".*?" \/>/i, adsenseMetaTag)
      pageHtml = pageHtml.replace(/<meta name="google-adsense-account" content=".*?">/i, adsenseMetaTag)
    }

    // Handle noindex on 404 page
    if (url === '/404') {
      pageHtml = pageHtml.replace(/<meta name="robots" content=".*?" \/>/i, '<meta name="robots" content="noindex" />')
      pageHtml = pageHtml.replace(/<meta name="robots" content=".*?">/i, '<meta name="robots" content="noindex">')
    }

    // Handle temporary noindex on risky SEO posts (Item 7)
    if (!SHOW_SEO_POSTS && RISKY_ROUTES.includes(url)) {
      pageHtml = pageHtml.replace(/<meta name="robots" content=".*?" \/>/i, '<meta name="robots" content="noindex" />')
      pageHtml = pageHtml.replace(/<meta name="robots" content=".*?">/i, '<meta name="robots" content="noindex">')
    }

    // Inject AdSense ad snippet only when ADS_ENABLED is true (never on 404)
    if (process.env.VITE_ADS_ENABLED === 'true' && url !== '/404') {
      pageHtml = pageHtml.replace('</head>', `    ${ADSENSE_SNIPPET}\n  </head>`)
    }

    // Determine destination path
    let filePath
    if (url === '/') {
      filePath = toAbsolute('dist/index.html')
    } else {
      const routeDir = toAbsolute(`dist${url}`)
      if (!fs.existsSync(routeDir)) {
        fs.mkdirSync(routeDir, { recursive: true })
      }
      filePath = path.join(routeDir, 'index.html')
    }

    fs.writeFileSync(filePath, pageHtml, 'utf-8')

    // If 404, also save directly as dist/404.html for static web hosts
    if (url === '/404') {
      const root404Path = toAbsolute('dist/404.html')
      fs.writeFileSync(root404Path, pageHtml, 'utf-8')
      console.log(`✓ Copied static 404.html to root dist`)
    }

    console.log(`✓ Rendered: ${url} -> ${path.relative(__dirname, filePath)} (${(pageHtml.length / 1024).toFixed(1)} KB)`)
  }

  // Clean up any stale dist/cookie directory if previously generated
  const staleCookieDir = toAbsolute('dist/cookie')
  if (fs.existsSync(staleCookieDir)) {
    fs.rmSync(staleCookieDir, { recursive: true, force: true })
    console.log(`✓ Removed stale dist/cookie directory`)
  }

  // Generate private routes: strictly WITHOUT AdSense script and with noindex
  const PRIVATE_ROUTES = [
    { url: '/chat', title: 'Miloo — Anonymous Video & Text Chat' },
    { url: '/call', title: 'Miloo — Video Call' },
    { url: '/admin', title: 'Miloo — Admin Moderation' },
    { url: '/cookie', title: 'Redirecting to Cookie Policy' },
  ]

  for (const { url, title } of PRIVATE_ROUTES) {
    const routeDir = toAbsolute(`dist${url}`)
    if (!fs.existsSync(routeDir)) {
      fs.mkdirSync(routeDir, { recursive: true })
    }
    const filePath = path.join(routeDir, 'index.html')

    let privateHtml = template
      .replace(/<title>.*?<\/title>/i, `<title>${title}</title>`)
      .replace(/<meta name="robots" content=".*?" \/>/i, '<meta name="robots" content="noindex, nofollow" />')

    // Ensure AdSense verification meta tag is present
    const adsenseMetaTag = `<meta name="google-adsense-account" content="${ADSENSE_PUB_ID}">`
    if (!privateHtml.includes('name="google-adsense-account"')) {
      privateHtml = privateHtml.replace('</head>', `    ${adsenseMetaTag}\n  </head>`)
    }

    // Confirm AdSense ad script is absent
    privateHtml = privateHtml.replace(/<script[^>]*pagead2\.googlesyndication\.com[^>]*><\/script>/gi, '')

    fs.writeFileSync(filePath, privateHtml, 'utf-8')
    console.log(`✓ Generated private route (strictly ad-free): ${url} -> ${path.relative(__dirname, filePath)}`)
  }

  // 2. Generate sitemap.xml and rss.xml
  try {
    generateSitemapAndRSS()
  } catch (err) {
    console.warn('Sitemap/RSS generation failed:', err.message)
  }

  // 3. Inject production origins and copy vercel.json if backend origins provided
  if (backendHttp && backendWss) {
    const vercelFiles = [
      toAbsolute('vercel.json'),
      toAbsolute('../vercel.json'),
      toAbsolute('dist/vercel.json'),
    ]
    const originsStr = `${backendHttp} ${backendWss}`

    for (const vFile of vercelFiles) {
      if (fs.existsSync(vFile)) {
        try {
          const cfg = JSON.parse(fs.readFileSync(vFile, 'utf8'))
          for (const entry of cfg.headers || []) {
            for (const h of entry.headers || []) {
              if (h.key.toLowerCase() === 'content-security-policy') {
                if (!h.value.includes(backendHttp)) {
                  h.value = h.value.replace("connect-src 'self'", `connect-src 'self' ${originsStr}`)
                }
              }
            }
          }
          fs.writeFileSync(vFile, JSON.stringify(cfg, null, 2), 'utf8')
        } catch (_) {}
      }
    }
  }

  // 4. Print CSP verification summary for / and /chat
  try {
    const vPath = toAbsolute('vercel.json')
    if (fs.existsSync(vPath)) {
      const cfg = JSON.parse(fs.readFileSync(vPath, 'utf8'))
      console.log('\n================================================================================')
      console.log('SECURITY HEADERS & CSP CONFIGURATION (/ and /chat):')
      console.log('================================================================================')
      for (const entry of cfg.headers || []) {
        if (entry.source === '/' || entry.source === '/(.*)' || entry.source === '/chat(.*)') {
          console.log(`Route [${entry.source}]:`)
          for (const h of entry.headers) {
            if (h.key === 'Content-Security-Policy' || h.key === 'Permissions-Policy') {
              console.log(`  ${h.key}: ${h.value}`)
            }
          }
        }
      }
      console.log('================================================================================\n')
    }
  } catch (_) {}

  console.log('Static prerendering complete!')
}

prerender().catch((err) => {
  console.error('Prerender error:', err)
  process.exit(1)
})
