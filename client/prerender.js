import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const toAbsolute = (p) => path.resolve(__dirname, p)

const ROUTES_META = {
  '/': {
    title: 'Miloo — Free Anonymous Random Video & Text Chat (18+)',
    description: 'Connect with random strangers instantly on Miloo. Free peer-to-peer video and text chat with no login, no apps, and strict privacy protection. Strictly 18+.',
    canonical: 'https://www.miloo.chat/',
  },
  '/how-it-works': {
    title: 'How It Works — Miloo Anonymous Video & Text Chat',
    description: 'Discover how Miloo works: anonymous WebRTC chat matching, camera permissions, instant skips, safety reports, and AI companions. No account or sign-up needed.',
    canonical: 'https://www.miloo.chat/how-it-works',
  },
  '/safety': {
    title: 'Safety Center & Online Chat Guidelines — Miloo',
    description: 'Essential safety tips for chatting with strangers online. Protect your privacy, spot scam red flags, secure video backgrounds, and report abusive conduct.',
    canonical: 'https://www.miloo.chat/safety',
  },
  '/faq': {
    title: 'Frequently Asked Questions (FAQ) — Miloo',
    description: 'Find clear answers to 20+ questions about Miloo: free random video chat, privacy, WebRTC security, strict 18+ policy, skipping, reporting, and ban appeals.',
    canonical: 'https://www.miloo.chat/faq',
  },
  '/about': {
    title: 'About Miloo — Our Story & Vision for Modern Anonymous Chat',
    description: 'Learn why Miloo was built: reviving spontaneous human connection online with modern WebRTC peer privacy, zero profiling, and uncompromising safety standards.',
    canonical: 'https://www.miloo.chat/about',
  },
  '/contact': {
    title: 'Contact & Support Desk — Miloo',
    description: 'Get in touch with the Miloo team for technical support, safety reports, business inquiries, and DMCA notices. We respond within 24-48 hours.',
    canonical: 'https://www.miloo.chat/contact',
  },
  '/privacy': {
    title: 'Privacy Policy — Miloo Anonymous Chat',
    description: 'Miloo Privacy Policy: Learn how we protect privacy, manage ephemeral WebRTC streams, disclose Google AdSense and cookies, and respect user privacy rights.',
    canonical: 'https://www.miloo.chat/privacy',
  },
  '/terms': {
    title: 'Terms of Service — Miloo (18+ Adults Only)',
    description: 'Miloo Terms of Service: Platform rules, strict 18+ eligibility requirement, acceptable use policies, AI companion disclosures, and user agreements.',
    canonical: 'https://www.miloo.chat/terms',
  },
  '/community-guidelines': {
    title: 'Community Guidelines — Miloo',
    description: 'Our expectations for safe, civil, and enjoyable conversations on Miloo. Review our zero-tolerance policies against harassment, nudity, scams, and abuse.',
    canonical: 'https://www.miloo.chat/community-guidelines',
  },
  '/blog': {
    title: 'Miloo Blog — Safety Guides, Chat Tips & Online Privacy',
    description: 'Explore expert guides on staying safe talking to strangers online, spotting digital scams, protecting webcam privacy, and starting engaging conversations.',
    canonical: 'https://www.miloo.chat/blog',
  },
  '/blog/stay-safe-talking-to-strangers-online': {
    title: 'How to Stay Safe Talking to Strangers Online — Miloo Blog',
    description: 'Practical ways to protect your personal identity, identify manipulation, set firm boundaries, and stay safe when chatting with strangers on video and text.',
    canonical: 'https://www.miloo.chat/blog/stay-safe-talking-to-strangers-online',
  },
  '/blog/how-to-spot-scams-on-chat-sites': {
    title: 'How to Spot Scams & Fake Profiles on Random Chat Sites — Miloo',
    description: 'Comprehensive guide to identifying scams, automated bots, fake webcam feeds, and phishing tricks on stranger chat platforms.',
    canonical: 'https://www.miloo.chat/blog/how-to-spot-scams-on-chat-sites',
  },
  '/blog/protecting-privacy-in-video-chat': {
    title: 'Protecting Your Privacy in Video Chat: Checklist — Miloo Blog',
    description: 'Practical checklist for protecting webcam privacy, avoiding background clues, securing WebRTC connections, and managing browser permissions.',
    canonical: 'https://www.miloo.chat/blog/protecting-privacy-in-video-chat',
  },
  '/blog/how-to-report-and-block-abusive-users': {
    title: 'How to Report & Block Abusive Users — Miloo Blog',
    description: 'Learn how reporting and blocking work on Miloo: reporting categories, moderation review, session blacklisting, and community protection.',
    canonical: 'https://www.miloo.chat/blog/how-to-report-and-block-abusive-users',
  },
  '/blog/tips-for-starting-good-conversation-with-stranger': {
    title: '10 Tips for Starting a Great Conversation with a Stranger — Miloo Blog',
    description: 'Ditch awkward "m or f" questions. Discover creative conversation starters, observational humor, and active listening tips for video and text chat.',
    canonical: 'https://www.miloo.chat/blog/tips-for-starting-good-conversation-with-stranger',
  },
  '/blog/what-to-do-if-someone-harasses-you-online': {
    title: 'What to Do If Someone Harasses You Online — Miloo Blog',
    description: 'Action plan for handling cyber harassment, threats, or extortion. Learn evidence preservation, platform reporting, and international legal support hotlines.',
    canonical: 'https://www.miloo.chat/blog/what-to-do-if-someone-harasses-you-online',
  },
  '/blog/omegle-alternative': {
    title: 'Best Omegle Alternatives in India 2026 | Miloo',
    description: 'Looking for the best Omegle alternative in India? Discover Miloo — free random chat, no signup, meet strangers online instantly. Top picks for 2026.',
    canonical: 'https://www.miloo.chat/blog/omegle-alternative',
  },
  '/blog/random-video-chat-india': {
    title: 'Random Video Chat India 2026 — Miloo Safety & Connectivity Guide',
    description: 'Explore how random video chat works in India. Tips for low-latency WebRTC on Jio and Airtel, scam protection, cultural etiquette, and anonymous chatting.',
    canonical: 'https://www.miloo.chat/blog/random-video-chat-india',
  },
  '/blog/stranger-chat-india': {
    title: 'Stranger Chat in India 2026 — Culture, Trends & Safety | Miloo',
    description: 'Discover why anonymous stranger chat is booming across India. How spontaneous 1-on-1 conversations offer relief from algorithm-heavy social networks.',
    canonical: 'https://www.miloo.chat/blog/stranger-chat-india',
  },
  '/blog/video-chat-no-signup': {
    title: 'Video Chat Without Sign-Up — Free, Private & Instant | Miloo',
    description: 'Discover why browser-based WebRTC video chat with no signup is the safest and fastest way to connect with strangers online without sharing personal data.',
    canonical: 'https://www.miloo.chat/blog/video-chat-no-signup',
  },
}

const ADSENSE_SNIPPET = '<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-4205636224784725" crossorigin="anonymous"></script>'

async function prerender() {
  const templatePath = toAbsolute('dist/index.html')
  if (!fs.existsSync(templatePath)) {
    console.error('dist/index.html not found. Run "vite build" first.')
    process.exit(1)
  }

  const template = fs.readFileSync(templatePath, 'utf-8')
  const { render } = await import('./dist/server/entry-server.js')

  console.log(`Prerendering ${Object.keys(ROUTES_META).length} public routes...`)

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

    // Inject AdSense snippet into <head> of public content pages only
    pageHtml = pageHtml.replace('</head>', `    ${ADSENSE_SNIPPET}\n  </head>`)

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
    console.log(`✓ Rendered public page with AdSense: ${url} -> ${path.relative(__dirname, filePath)} (${(pageHtml.length / 1024).toFixed(1)} KB)`)
  }

  // Generate private routes: strictly WITHOUT AdSense snippet
  const PRIVATE_ROUTES = [
    { url: '/chat', title: 'Miloo — Anonymous Video & Text Chat' },
    { url: '/call', title: 'Miloo — Video Call' },
    { url: '/admin', title: 'Miloo — Admin Moderation' },
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

    // Confirm AdSense is absent
    privateHtml = privateHtml.replace(/<script[^>]*ca-pub-4205636224784725[^>]*><\/script>/gi, '')

    fs.writeFileSync(filePath, privateHtml, 'utf-8')
    console.log(`✓ Generated private route (strictly ad-free): ${url} -> ${path.relative(__dirname, filePath)}`)
  }

  console.log('Static prerendering complete!')
}

prerender().catch((err) => {
  console.error('Prerender error:', err)
  process.exit(1)
})
