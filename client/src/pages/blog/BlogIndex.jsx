import { Link } from 'react-router-dom'
import Navbar from '../../components/Navbar'
import Footer from '../../components/Footer'
import SEOHead from '../../components/SEOHead'
import WatercolorMiniBanner from '../../components/watercolor/WatercolorMiniBanner'
import { SHOW_SEO_POSTS } from '../../config/site'

const RISKY_SLUGS = [
  'omegle-alternative',
  'random-video-chat-india',
  'stranger-chat-india',
  'video-chat-no-signup',
]

const ALL_ARTICLES = [
  {
    slug: 'stay-safe-talking-to-strangers-online',
    title: 'How to Stay Safe Talking to Strangers Online: The Complete Modern Guide',
    desc: 'Actionable strategies to protect your digital identity, avoid social engineering traps, and maintain healthy boundaries during spontaneous online conversations.',
    date: 'Nov 1, 2026',
    readTime: '6 min read',
    category: 'Safety & Security',
  },
  {
    slug: 'how-to-spot-scams-on-chat-sites',
    title: 'How to Spot Scams and Fake Profiles on Random Chat Sites',
    desc: 'Learn the most common deceptive tactics used by scammers on stranger chat platforms, from off-platform messaging tricks to fake emergency financial solicitations.',
    date: 'Oct 28, 2026',
    readTime: '6 min read',
    category: 'Scam Prevention',
  },
  {
    slug: 'protecting-privacy-in-video-chat',
    title: 'Protecting Your Privacy in Video Chat: A Practical Checklist',
    desc: 'A step-by-step checklist to secure your webcam environment, eliminate background disclosures, and understand how peer-to-peer WebRTC encryption works.',
    date: 'Oct 24, 2026',
    readTime: '5 min read',
    category: 'Privacy',
  },
  {
    slug: 'how-to-report-and-block-abusive-users',
    title: 'How to Report and Block Abusive Users: A Guide to Platform Safety',
    desc: 'Why immediate reporting and blocking are vital for community health, what happens behind the scenes during moderation, and how to protect yourself in real time.',
    date: 'Oct 20, 2026',
    readTime: '5 min read',
    category: 'Platform Trust',
  },
  {
    slug: 'tips-for-starting-good-conversation-with-stranger',
    title: '10 Tips for Starting a Great Conversation with a Random Stranger',
    desc: 'Tired of awkward silences or endless "m or f" queries? Discover engaging openers, active listening techniques, and curiosity-driven conversation starters.',
    date: 'Oct 15, 2026',
    readTime: '5 min read',
    category: 'Conversations',
  },
  {
    slug: 'what-to-do-if-someone-harasses-you-online',
    title: 'What to Do If Someone Harasses You Online: Action Plan & Resources',
    desc: 'A comprehensive action plan for handling online harassment, cyberstalking, and extortion, including legal evidence preservation and emergency support helplines.',
    date: 'Oct 10, 2026',
    readTime: '6 min read',
    category: 'Mental Health & Support',
  },
  {
    slug: 'omegle-alternative',
    title: 'Best Omegle Alternative in India: Modern Random Video Chat',
    desc: 'Exploring the best Omegle alternatives for secure, fast, and anonymous stranger conversations without registrations or invasive mobile app permissions.',
    date: 'Sep 28, 2026',
    readTime: '7 min read',
    category: 'Product Guide',
  },
  {
    slug: 'random-video-chat-india',
    title: 'Random Video Chat in India: Staying Safe and Connected',
    desc: 'A guide to optimizing WebRTC video chat performance across diverse mobile networks in India while safeguarding personal privacy and avoiding scam operations.',
    date: 'Sep 20, 2026',
    readTime: '5 min read',
    category: 'Regional Guide',
  },
  {
    slug: 'stranger-chat-india',
    title: 'Stranger Chat in India: The Rise of Anonymous Text & Video Platforms',
    desc: 'How anonymous stranger chatting became a popular late-night social medium in India, cultural conversational etiquette, and staying safe online.',
    date: 'Sep 15, 2026',
    readTime: '5 min read',
    category: 'Culture & Web',
  },
  {
    slug: 'video-chat-no-signup',
    title: 'Video Chat Without Sign-Up: Why Browser-Based P2P is the Future',
    desc: 'Why account-free, browser-based WebRTC applications offer superior privacy and convenience compared to account-locked native apps.',
    date: 'Sep 05, 2026',
    readTime: '5 min read',
    category: 'Technology',
  },
]

export default function BlogIndex({ theme, onToggleTheme }) {
  const articles = SHOW_SEO_POSTS
    ? ALL_ARTICLES
    : ALL_ARTICLES.filter((a) => !RISKY_SLUGS.includes(a.slug))

  return (
    <div className="page page-enter" style={{ background: 'var(--bg-0)' }}>
      <SEOHead
        title="Miloo Blog — Safety Guides, Chat Tips & Online Privacy"
        description="Explore expert guides on staying safe talking to strangers online, spotting scams, and protecting privacy. Every chat is with a real person."
        canonicalUrl="https://miloo.chat/blog"
        ogImage="https://miloo.chat/og/blog.png"
      />

      <Navbar theme={theme} onToggleTheme={onToggleTheme} />

      <main className="container" style={{ paddingTop: 'clamp(20px, 3.5vw, 40px)', paddingBottom: 'clamp(48px, 8vw, 80px)', maxWidth: 1040 }}>
        {/* Subtle watercolor sagging wire & perched ink sparrows */}
        <WatercolorMiniBanner />

        {/* Breadcrumb Navigation */}
        <nav aria-label="Breadcrumb" style={{ marginBottom: 20 }}>
          <ol style={{ display: 'flex', gap: 8, alignItems: 'center', listStyle: 'none', padding: 0, margin: 0, fontSize: 13, color: 'var(--text-3)' }}>
            <li>
              <Link to="/" style={{ color: 'var(--accent)', textDecoration: 'none' }}>Home</Link>
            </li>
            <li aria-hidden="true">/</li>
            <li aria-current="page" style={{ color: 'var(--text-1)' }}>Blog</li>
          </ol>
        </nav>

        <header style={{ marginBottom: 44, textAlign: 'left' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 12 }}>
            <div
              style={{
                display: 'inline-block',
                fontSize: '12px',
                fontWeight: 700,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: 'var(--accent)',
              }}
            >
              Miloo Publication & Resources
            </div>
            <a
              href="/rss.xml"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                fontSize: '12px',
                fontWeight: 600,
                color: 'var(--accent)',
                textDecoration: 'none',
                padding: '4px 10px',
                borderRadius: 'var(--radius-pill)',
                background: 'var(--surface-1)',
                border: '1px solid var(--border-2)',
              }}
              title="Subscribe via RSS feed"
            >
              <span>📡</span>
              <span>RSS Feed</span>
            </a>
          </div>

          <h1
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(32px, 4.5vw, 52px)',
              fontWeight: 500,
              lineHeight: 1.15,
              color: 'var(--text-1)',
              margin: '0 0 16px',
            }}
          >
            Blog & Safety Guides
          </h1>
          <p
            style={{
              fontSize: 'clamp(16px, 1.8vw, 20px)',
              color: 'var(--text-2)',
              lineHeight: 1.6,
              maxWidth: 720,
              margin: 0,
            }}
          >
            Insights on staying safe, spotting scams, protecting webcam privacy, and building meaningful conversations with strangers on the modern web. On Miloo, every chat is with a real person.
          </p>
          <p
            style={{
              fontSize: '15px',
              color: 'var(--text-2)',
              lineHeight: 1.65,
              maxWidth: 760,
              margin: '14px 0 0',
            }}
          >
            Looking for quick safety rules? Check our <Link to="/safety" style={{ color: 'var(--accent)', textDecoration: 'none', fontWeight: 600 }}>Safety Center</Link>, review the <Link to="/faq" style={{ color: 'var(--accent)', textDecoration: 'none', fontWeight: 600 }}>Frequently Asked Questions</Link>, or read our editorial standards in <Link to="/about#team" style={{ color: 'var(--accent)', textDecoration: 'none', fontWeight: 600 }}>About Us</Link>.
          </p>
        </header>

        {/* Article Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: 24,
          }}
        >
          {articles.map((article) => (
            <article
              key={article.slug}
              className="content-card"
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                padding: 'clamp(20px, 3vw, 28px)',
                borderRadius: 'var(--radius-xl)',
                border: '1px solid var(--border-1)',
                background: 'var(--surface-1)',
                boxShadow: 'var(--shadow-sm)',
                transition: 'transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--accent)'
                e.currentTarget.style.transform = 'translateY(-2px)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--border-1)'
                e.currentTarget.style.transform = 'none'
              }}
            >
              <div>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: 12,
                    fontSize: '12px',
                    color: 'var(--text-3)',
                  }}
                >
                  <span
                    style={{
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: '0.06em',
                      color: 'var(--accent)',
                    }}
                  >
                    {article.category}
                  </span>
                  <span>{article.readTime}</span>
                </div>
                <h2
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: 'clamp(19px, 2.2vw, 22px)',
                    fontWeight: 600,
                    lineHeight: 1.3,
                    color: 'var(--text-1)',
                    margin: '0 0 12px',
                  }}
                >
                  <Link
                    to={`/blog/${article.slug}`}
                    style={{
                      color: 'inherit',
                      textDecoration: 'none',
                    }}
                  >
                    {article.title}
                  </Link>
                </h2>
                <p
                  style={{
                    fontSize: '14px',
                    color: 'var(--text-2)',
                    lineHeight: 1.6,
                    margin: 0,
                  }}
                >
                  {article.desc}
                </p>
              </div>

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginTop: 20,
                  paddingTop: 16,
                  borderTop: '1px solid var(--border-1)',
                  fontSize: '13px',
                }}
              >
                <span style={{ color: 'var(--text-3)' }}>{article.date}</span>
                <Link
                  to={`/blog/${article.slug}`}
                  style={{
                    color: 'var(--accent)',
                    textDecoration: 'none',
                    fontWeight: 600,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 4,
                  }}
                >
                  Read guide →
                </Link>
              </div>
            </article>
          ))}
        </div>
        {/* Editorial Standards & Reader Guidance */}
        <section
          style={{
            marginTop: 56,
            padding: '32px clamp(20px, 4vw, 36px)',
            background: 'var(--surface-1)',
            borderRadius: 'var(--radius-xl)',
            border: '1px solid var(--border-1)',
          }}
        >
          <h2
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '24px',
              margin: '0 0 16px',
              color: 'var(--text-1)',
            }}
          >
            Editorial Mission & Community Research
          </h2>
          <p style={{ color: 'var(--text-2)', lineHeight: 1.7, margin: '0 0 16px' }}>
            The Miloo editorial desk publishes independent, practical resources focused on digital privacy, human connection, and harm reduction in unmoderated peer-to-peer web environments. As online communication evolves, maintaining personal autonomy requires both technical awareness and intuitive interpersonal boundaries.
          </p>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
              gap: 20,
              marginTop: 20,
            }}
          >
            <div style={{ padding: '16px', background: 'var(--bg-0)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-1)' }}>
              <h3 style={{ fontSize: '16px', margin: '0 0 8px', color: 'var(--text-1)' }}>🛡️ Harm Reduction</h3>
              <p style={{ fontSize: '13.5px', color: 'var(--text-2)', lineHeight: 1.6, margin: 0 }}>
                Practical advice on setting healthy personal boundaries, recognizing digital red flags, and avoiding financial or extortion scams.
              </p>
            </div>
            <div style={{ padding: '16px', background: 'var(--bg-0)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-1)' }}>
              <h3 style={{ fontSize: '16px', margin: '0 0 8px', color: 'var(--text-1)' }}>🔒 Technical Privacy</h3>
              <p style={{ fontSize: '13.5px', color: 'var(--text-2)', lineHeight: 1.6, margin: 0 }}>
                In-depth analysis of peer-to-peer WebRTC streaming, network packet confidentiality, local camera safety, and zero data footprint principles.
              </p>
            </div>
            <div style={{ padding: '16px', background: 'var(--bg-0)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-1)' }}>
              <h3 style={{ fontSize: '16px', margin: '0 0 8px', color: 'var(--text-1)' }}>🤝 Human Connection</h3>
              <p style={{ fontSize: '13.5px', color: 'var(--text-2)', lineHeight: 1.6, margin: 0 }}>
                Creative icebreakers, thoughtful listening prompts, and conversational etiquette designed to replace awkward stranger silences with genuine moments.
              </p>
            </div>
          </div>
          <p style={{ color: 'var(--text-3)', fontSize: '13px', lineHeight: 1.6, margin: '20px 0 0' }}>
            Have a safety question or feedback on our guides? Learn more about our team on our <Link to="/about#team" style={{ color: 'var(--accent)', textDecoration: 'underline' }}>About page</Link>, review our public <Link to="/transparency" style={{ color: 'var(--accent)', textDecoration: 'underline' }}>Transparency Report</Link>, or contact our safety desk directly at support@miloo.chat.
          </p>
        </section>
      </main>

      <Footer />
    </div>
  )
}
