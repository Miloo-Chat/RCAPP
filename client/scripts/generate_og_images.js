// client/scripts/generate_og_images.js
// Generates unique 1200x630 OG image per page at build time using satori + sharp.
// Features: Watercolor sun circle, sagging ink wire motif, bird silhouette, and elegant serif typography.

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import satori from 'satori'
import sharp from 'sharp'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const rootDir = path.resolve(__dirname, '..')

const FONT_PATH = path.join(rootDir, 'src/assets/fonts/Georgia.ttf')
if (!fs.existsSync(FONT_PATH)) {
  console.error(`Font not found at ${FONT_PATH}`)
  process.exit(1)
}
const fontData = fs.readFileSync(FONT_PATH)

const PAGES = [
  {
    slug: 'home',
    title: 'Miloo — Meet a Real Stranger',
    subtitle: 'Free anonymous random video & text chat with zero signup.',
    badge: 'Anonymous · Instant · Real People',
  },
  {
    slug: 'how-it-works',
    title: 'How Miloo Works — Anonymous P2P Chat',
    subtitle: 'Zero accounts, encrypted WebRTC streams, and instant skips.',
    badge: 'Technology & Architecture',
  },
  {
    slug: 'safety',
    title: 'Safety Center & Chat Guidelines',
    subtitle: 'Essential advice to protect your privacy and spot red flags.',
    badge: 'Trust & Protection',
  },
  {
    slug: 'faq',
    title: 'Frequently Asked Questions (FAQ)',
    subtitle: 'Everything you need to know about privacy, security, and rules.',
    badge: 'Knowledge Base',
  },
  {
    slug: 'about',
    title: 'About Miloo — Reviving Spontaneous Connection',
    subtitle: 'Our story, open standards, and vision for genuine conversation.',
    badge: 'Our Mission & Team',
  },
  {
    slug: 'contact',
    title: 'Contact Desk & Safety Support',
    subtitle: 'Reach our moderation desk, submit inquiries, or file reports.',
    badge: 'User Support',
  },
  {
    slug: 'privacy',
    title: 'Privacy Policy — No Logs, No Tracking',
    subtitle: 'Learn how ephemeral WebRTC keeps your personal data private.',
    badge: 'Legal & Privacy',
  },
  {
    slug: 'terms',
    title: 'Terms of Service — 18+ Adults Only',
    subtitle: 'Eligibility requirements and code of conduct for all users.',
    badge: 'Terms & Conditions',
  },
  {
    slug: 'community-guidelines',
    title: 'Community Guidelines — Zero Tolerance for Abuse',
    subtitle: 'Rules for respectful, safe, and enjoyable stranger conversations.',
    badge: 'Community Standards',
  },
  {
    slug: 'cookie-policy',
    title: 'Cookie Policy & Consent Settings',
    subtitle: 'Clear disclosure of necessary functional storage and consent.',
    badge: 'Cookie Management',
  },
  {
    slug: 'transparency',
    title: 'Transparency & Moderation Report',
    subtitle: 'How automated moderation works, what is blocked, and appeals.',
    badge: 'Public Accountability',
  },
  {
    slug: 'blog',
    title: 'Miloo Blog — Safety Guides & Online Privacy',
    subtitle: 'In-depth essays on privacy, cybersecurity, and conversation.',
    badge: 'Editorial & Research',
  },
  {
    slug: 'blog-stay-safe-talking-to-strangers-online',
    title: 'How to Stay Safe Talking to Strangers Online',
    subtitle: 'Protect your identity, set boundaries, and avoid manipulation.',
    badge: 'Safety Guide',
  },
  {
    slug: 'blog-how-to-spot-scams-on-chat-sites',
    title: 'How to Spot Scams on Random Chat Sites',
    subtitle: 'Identify fake webcam feeds, bot loops, and phishing tactics.',
    badge: 'Security Guide',
  },
  {
    slug: 'blog-protecting-privacy-in-video-chat',
    title: 'Protecting Your Privacy in Video Chat',
    subtitle: 'Checklist for webcam security, background privacy, and WebRTC.',
    badge: 'Webcam Privacy',
  },
  {
    slug: 'blog-how-to-report-and-block-abusive-users',
    title: 'How to Report & Block Abusive Users',
    subtitle: 'Reviewing our report desk, immediate blocklists, and safety bans.',
    badge: 'Safety Tools',
  },
  {
    slug: 'blog-tips-for-starting-good-conversation-with-stranger',
    title: '10 Tips for Starting a Great Conversation',
    subtitle: 'Ditch awkward greetings and spark fun, engaging dialogues.',
    badge: 'Conversation Tips',
  },
  {
    slug: 'blog-what-to-do-if-someone-harasses-you-online',
    title: 'What to Do If Someone Harasses You Online',
    subtitle: 'Immediate steps for evidence preservation, reporting, and help.',
    badge: 'Harassment Defense',
  },
  {
    slug: 'blog-omegle-alternative',
    title: 'Omegle Alternative: Safe Random Video Chat',
    subtitle: 'Spontaneous stranger connections with modern privacy safeguards.',
    badge: 'Platform Comparison',
  },
  {
    slug: 'blog-random-video-chat-india',
    title: 'Random Video Chat in India: Safety & Etiquette',
    subtitle: 'Tips for mobile connectivity, regional etiquette, and privacy.',
    badge: 'Regional Guide',
  },
  {
    slug: 'blog-stranger-chat-india',
    title: 'Stranger Chat in India: The Rise of P2P Rooms',
    subtitle: 'Why anonymous text and video chat offers relief from algorithms.',
    badge: 'Cultural Insights',
  },
  {
    slug: 'blog-video-chat-no-signup',
    title: 'Video Chat Without Sign-Up: Why P2P is the Future',
    subtitle: 'Browser-based WebRTC with zero accounts, zero login barriers.',
    badge: 'WebRTC Architecture',
  },
]

// Bird silhouette SVG path data
const BIRD_PATH = 'M6 18 C3 12 5 6 11 5 C14 4 18 6 17 10 C16 13 13 16 9 18 Z M13 6.5 A3.2 3.2 0 1 0 13 6.4 Z M15 5.5 L21 6.5 L15 8 Z M5 17 C3 20 2 23 1 25 C3 24 5 21 7 18 Z'

export async function generateOGImages() {
  const publicOgDir = path.join(rootDir, 'public/og')
  const distOgDir = path.join(rootDir, 'dist/og')

  fs.mkdirSync(publicOgDir, { recursive: true })
  fs.mkdirSync(distOgDir, { recursive: true })

  console.log(`Generating ${PAGES.length} OG images (1200x630) with satori...`)

  for (const page of PAGES) {
    const vnode = {
      type: 'div',
      props: {
        style: {
          display: 'flex',
          flexDirection: 'column',
          width: '1200px',
          height: '630px',
          backgroundColor: '#FAF4EB',
          position: 'relative',
          padding: '56px 64px',
          justifyContent: 'space-between',
          overflow: 'hidden',
          fontFamily: 'Georgia',
        },
        children: [
          // 1. Subtle Paper Edge Border
          {
            type: 'div',
            props: {
              style: {
                position: 'absolute',
                inset: '16px',
                border: '1.5px solid rgba(26, 26, 26, 0.12)',
                borderRadius: '8px',
                pointerEvents: 'none',
              },
            },
          },

          // 2. Watercolor Sun Motif (Warm translucent circle, offset top-right)
          {
            type: 'div',
            props: {
              style: {
                position: 'absolute',
                top: '40px',
                right: '90px',
                width: '320px',
                height: '320px',
                borderRadius: '160px',
                backgroundColor: '#F4D77A',
                opacity: 0.55,
              },
            },
          },

          // 3. Sagging Ink Wire SVG across the image
          {
            type: 'svg',
            props: {
              width: '1200',
              height: '300',
              viewBox: '0 0 1200 300',
              style: {
                position: 'absolute',
                top: '110px',
                left: '0px',
              },
              children: [
                // Wire line (smooth curve)
                {
                  type: 'path',
                  props: {
                    d: 'M 0 100 Q 600 210 1200 130',
                    fill: 'none',
                    stroke: '#1A1A1A',
                    strokeWidth: '2.5',
                    opacity: 0.85,
                  },
                },
                // Perched bird on wire
                {
                  type: 'g',
                  props: {
                    transform: 'translate(860, 142) scale(1.6)',
                    children: [
                      {
                        type: 'path',
                        props: {
                          d: BIRD_PATH,
                          fill: '#1A1A1A',
                        },
                      },
                      // Tiny legs to wire
                      {
                        type: 'line',
                        props: {
                          x1: '7',
                          y1: '19',
                          x2: '6',
                          y2: '24',
                          stroke: '#1A1A1A',
                          strokeWidth: '1.5',
                        },
                      },
                      {
                        type: 'line',
                        props: {
                          x1: '11',
                          y1: '19',
                          x2: '10',
                          y2: '24',
                          stroke: '#1A1A1A',
                          strokeWidth: '1.5',
                        },
                      },
                    ],
                  },
                },
                // Second bird companion on wire
                {
                  type: 'g',
                  props: {
                    transform: 'translate(940, 137) scale(-1.4, 1.4)',
                    children: [
                      {
                        type: 'path',
                        props: {
                          d: BIRD_PATH,
                          fill: '#1A1A1A',
                        },
                      },
                    ],
                  },
                },
              ],
            },
          },

          // 4. Header: Brand Logo & Category Badge
          {
            type: 'div',
            props: {
              style: {
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                width: '100%',
                zIndex: 10,
              },
              children: [
                {
                  type: 'div',
                  props: {
                    style: {
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                    },
                    children: [
                      {
                        type: 'div',
                        props: {
                          style: {
                            fontSize: '34px',
                            fontWeight: 700,
                            letterSpacing: '-0.03em',
                            color: '#1A1A1A',
                          },
                          children: 'miloo',
                        },
                      },
                      {
                        type: 'div',
                        props: {
                          style: {
                            width: '8px',
                            height: '8px',
                            borderRadius: '4px',
                            backgroundColor: '#E0794F',
                          },
                        },
                      },
                      {
                        type: 'div',
                        props: {
                          style: {
                            fontSize: '15px',
                            letterSpacing: '0.12em',
                            textTransform: 'uppercase',
                            color: '#5E5850',
                          },
                          children: 'Meet a real stranger',
                        },
                      },
                    ],
                  },
                },
                {
                  type: 'div',
                  props: {
                    style: {
                      fontSize: '14px',
                      letterSpacing: '0.08em',
                      textTransform: 'uppercase',
                      color: '#1A1A1A',
                      padding: '6px 14px',
                      backgroundColor: 'rgba(26, 26, 26, 0.06)',
                      borderRadius: '20px',
                      border: '1px solid rgba(26, 26, 26, 0.15)',
                    },
                    children: page.badge,
                  },
                },
              ],
            },
          },

          // 5. Middle: Main Page Title & Subtitle
          {
            type: 'div',
            props: {
              style: {
                display: 'flex',
                flexDirection: 'column',
                gap: '16px',
                maxWidth: '780px',
                zIndex: 10,
                marginTop: '40px',
              },
              children: [
                {
                  type: 'div',
                  props: {
                    style: {
                      fontSize: page.title.length > 40 ? '46px' : '54px',
                      fontWeight: 600,
                      lineHeight: 1.15,
                      letterSpacing: '-0.02em',
                      color: '#1A1A1A',
                    },
                    children: page.title,
                  },
                },
                {
                  type: 'div',
                  props: {
                    style: {
                      fontSize: '22px',
                      lineHeight: 1.4,
                      color: '#4A443D',
                    },
                    children: page.subtitle,
                  },
                },
              ],
            },
          },

          // 6. Bottom Bar: Trust Indicators & URL
          {
            type: 'div',
            props: {
              style: {
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                width: '100%',
                borderTop: '1px solid rgba(26, 26, 26, 0.15)',
                paddingTop: '20px',
                zIndex: 10,
              },
              children: [
                {
                  type: 'div',
                  props: {
                    style: {
                      fontSize: '15px',
                      color: '#5E5850',
                      letterSpacing: '0.04em',
                    },
                    children: 'Free · Anonymous · WebRTC Encrypted · Strictly 18+',
                  },
                },
                {
                  type: 'div',
                  props: {
                    style: {
                      fontSize: '17px',
                      fontWeight: 600,
                      color: '#1A1A1A',
                      letterSpacing: '0.02em',
                    },
                    children: 'miloo.chat',
                  },
                },
              ],
            },
          },
        ],
      },
    }

    const svg = await satori(vnode, {
      width: 1200,
      height: 630,
      fonts: [
        {
          name: 'Georgia',
          data: fontData,
          weight: 400,
          style: 'normal',
        },
      ],
    })

    const pngBuffer = await sharp(Buffer.from(svg)).png({ quality: 90 }).toBuffer()

    const publicPath = path.join(publicOgDir, `${page.slug}.png`)
    const distPath = path.join(distOgDir, `${page.slug}.png`)

    fs.writeFileSync(publicPath, pngBuffer)
    fs.writeFileSync(distPath, pngBuffer)
  }

  // Also write the default og-image.png (copied from home.png)
  const homePublic = path.join(publicOgDir, 'home.png')
  if (fs.existsSync(homePublic)) {
    fs.copyFileSync(homePublic, path.join(rootDir, 'public/og-image.png'))
    fs.copyFileSync(homePublic, path.join(rootDir, 'dist/og-image.png'))
  }

  console.log(`✓ Successfully generated ${PAGES.length} OG images in public/og/ and dist/og/`)
}

// Allow direct CLI invocation
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  generateOGImages().catch((err) => {
    console.error('OG Image Generation Error:', err)
    process.exit(1)
  })
}

