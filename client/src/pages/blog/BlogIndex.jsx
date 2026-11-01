import { Link } from 'react-router-dom'
import Navbar from '../../components/Navbar'
import Footer from '../../components/Footer'
import SEOHead from '../../components/SEOHead'

const ARTICLES = [
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
  return (
    <div className="page page-enter" style={{ background: 'var(--bg-0)' }}>
      <SEOHead
        title="Miloo Blog — Safety Guides, Chat Tips & Online Privacy"
        description="Explore expert guides on staying safe talking to strangers online, spotting digital scams, protecting webcam privacy, and starting engaging conversations."
        canonicalUrl="https://www.miloo.chat/blog"
      />

      <Navbar theme={theme} onToggleTheme={onToggleTheme} />

      <main className="container" style={{ paddingTop: 'clamp(32px, 5vw, 56px)', paddingBottom: 'clamp(48px, 8vw, 80px)', maxWidth: 1040 }}>
        <header style={{ marginBottom: 48, textAlign: 'left' }}>
          <div
            style={{
              display: 'inline-block',
              fontSize: '12px',
              fontWeight: 700,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: 'var(--accent)',
              marginBottom: 12,
            }}
          >
            Miloo Publication & Resources
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
            Insights on staying safe, spotting scams, protecting webcam privacy, and building meaningful conversations with strangers on the modern web.
          </p>
        </header>

        {/* Article Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: 28,
          }}
        >
          {ARTICLES.map((art) => (
            <article
              key={art.slug}
              className="content-card"
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                padding: '24px',
              }}
            >
              <div>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 12,
                    marginBottom: 12,
                  }}
                >
                  <span
                    style={{
                      fontSize: '12px',
                      fontWeight: 600,
                      color: 'var(--accent)',
                      background: 'var(--accent-dim)',
                      padding: '4px 10px',
                      borderRadius: 'var(--radius-pill)',
                    }}
                  >
                    {art.category}
                  </span>
                  <span style={{ fontSize: '12px', color: 'var(--text-3)' }}>
                    {art.readTime}
                  </span>
                </div>

                <h2
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: '20px',
                    lineHeight: 1.35,
                    color: 'var(--text-1)',
                    margin: '0 0 12px',
                  }}
                >
                  <Link
                    to={`/blog/${art.slug}`}
                    style={{ color: 'inherit', textDecoration: 'none' }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--accent)')}
                    onMouseLeave={(e) => (e.currentTarget.style.color = 'inherit')}
                  >
                    {art.title}
                  </Link>
                </h2>

                <p
                  style={{
                    color: 'var(--text-2)',
                    fontSize: '14px',
                    lineHeight: 1.6,
                    margin: '0 0 20px',
                  }}
                >
                  {art.desc}
                </p>
              </div>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  borderTop: '1px solid var(--border-1)',
                  paddingTop: 16,
                  fontSize: '13px',
                }}
              >
                <span style={{ color: 'var(--text-3)' }}>{art.date}</span>
                <Link
                  to={`/blog/${art.slug}`}
                  style={{
                    color: 'var(--accent)',
                    fontWeight: 600,
                    textDecoration: 'none',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 4,
                  }}
                >
                  Read Article →
                </Link>
              </div>
            </article>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  )
}
