import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import SEOHead from '../components/SEOHead'
import WatercolorMiniBanner from '../components/watercolor/WatercolorMiniBanner'
import { ARTICLE_AUTHOR } from '../config/site'

export default function About({ theme, onToggleTheme }) {
  return (
    <div className="page page-enter" style={{ background: 'var(--bg-0)' }}>
      <SEOHead
        title="About Miloo — Our Story & Vision for Modern Anonymous Chat"
        description="Learn why Miloo was built: reviving spontaneous human connection online where every chat is with a real person, with zero profiling and uncompromising safety."
        canonicalUrl="https://miloo.chat/about"
        ogImage="https://miloo.chat/og/about.png"
      />

      <Navbar theme={theme} onToggleTheme={onToggleTheme} />

      <main className="container" style={{ paddingTop: 'clamp(20px, 3.5vw, 40px)', paddingBottom: 'clamp(48px, 8vw, 80px)', maxWidth: 880 }}>
        {/* Subtle watercolor sagging wire & perched ink sparrows */}
        <WatercolorMiniBanner />

        {/* Breadcrumbs linking back to home */}
        <nav aria-label="Breadcrumb" style={{ marginBottom: 20 }}>
          <ol style={{ display: 'flex', gap: 8, alignItems: 'center', listStyle: 'none', padding: 0, margin: 0, fontSize: 13, color: 'var(--text-3)' }}>
            <li>
              <Link to="/" style={{ color: 'var(--accent)', textDecoration: 'none' }}>Home</Link>
            </li>
            <li aria-hidden="true">/</li>
            <li aria-current="page" style={{ color: 'var(--text-1)' }}>About</li>
          </ol>
        </nav>

        <header style={{ marginBottom: 44, textAlign: 'left' }}>
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
            Mission & Philosophy
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
            About Miloo
          </h1>
          <p
            style={{
              fontSize: 'clamp(16px, 1.8vw, 20px)',
              color: 'var(--text-2)',
              lineHeight: 1.6,
              margin: 0,
            }}
          >
            Reviving spontaneous serendipity in an era of algorithmic echo chambers.
          </p>
        </header>

        <article className="content-prose">
          <h2>1. The Problem with the Modern Internet</h2>
          <p>
            Today’s major social platforms are optimized for engagement loops, algorithmic silos, and permanent personal digital footprints. Every click, like, and follow is tracked, monetized, and used to trap people inside predictable content bubbles. In the process, the web lost something precious that made the early internet extraordinary: the magic of unexpected conversations with strangers from completely different walks of life.
          </p>
          <p>
            When legacy platforms like Omegle shut their doors in late 2023, they left a massive void. Millions of adults around the globe suddenly had nowhere to go for a spontaneous late-night discussion, an impromptu cultural exchange, or a quick laugh with someone they would never otherwise meet. But legacy platforms had serious flaws: outdated interfaces, rampant unmoderated bot armies, and obsolete security architectures.
          </p>

          <h2>2. The Birth of Miloo</h2>
          <p>
            Miloo was created to prove that stranger chat could be redesigned for the modern era. We set out to build a platform that is:
          </p>
          <ul>
            <li><strong>Frictionless:</strong> No registration forms, password resets, email verifications, or phone number demands. Anyone aged 18 or older can start chatting in seconds.</li>
            <li><strong>Privacy-Conscious:</strong> No personal profile creation, no contact lists, and zero interest in tracking who you are or what you do outside our platform.</li>
            <li><strong>Real Human Connection:</strong> Every chat is with a real person. Miloo has zero bots or simulated chat partners. If no real partner is online, we wait honestly.</li>
            <li><strong>Peer-to-Peer by Default:</strong> Built on cutting-edge WebRTC standards, routing audio and video directly between browsers with end-to-end encryption.</li>
            <li><strong>Aesthetically Thoughtful:</strong> Designed with clean, elegant typography, warm terracotta accents, and responsive layouts that look stunning on any screen.</li>
          </ul>

          <h2>3. The Spontaneous Web & Miloo's Role</h2>
          <p>
            Miloo was created as an independent, free random video and text chat platform built for adults seeking genuine, spontaneous conversations with strangers from across the globe. Inspired by the open, unfiltered serendipity of early-web communication platforms like Omegle, Miloo reimagines stranger chat for the modern era with robust technical privacy, modern WebRTC peer-to-peer security, and a strict 18+ community environment.
          </p>
          <p>
            Unlike conventional social networks that require extensive user profiles, persistent friend graphs, and invasive data collection, Miloo operates on a strict zero-retention philosophy. You do not need to register an account, download native software, or link an email or phone number. When you click either "Text Chat" or "Video Chat", our signaling server immediately pairs you with an active, available stranger who is also looking for a conversation.
          </p>
          <p>
            Our mission is to sustain an open digital salon where curious adults can exchange global perspectives, practice foreign languages, debate philosophy, discuss cinema, or simply share a laugh late at night, without algorithmic feeds deciding who you are allowed to encounter. Learn more in our <Link to="/safety">Safety Center</Link> or review our <Link to="/faq">Frequently Asked Questions</Link>.
          </p>

          <h2>4. Our Core Architectural Principles</h2>
          <p>
            Every feature we design at Miloo is guided by four non-negotiable engineering principles:
          </p>
          <ol>
            <li>
              <strong>Zero Data Harvesting:</strong> We do not ask for your name, phone number, location, or social handles. We believe that privacy is best guaranteed by simply not collecting private data in the first place.
            </li>
            <li>
              <strong>Ephemeral Sessions:</strong> When a conversation ends, it is gone. We do not store chat logs, we do not record video feeds, and we do not maintain persistent chat histories.
            </li>
            <li>
              <strong>Proactive Abuse Protection:</strong> Anonymous does not mean unaccountable. We empower users with immediate Report and Block capabilities and use automated rate-limiting to prevent spam, script flooding, and harassment.
            </li>
          </ol>

          <h2>5. Strictly for Adults (18+)</h2>
          <p>
            Miloo is dedicated exclusively to adult users. We do not permit minors on the site under any circumstances. We enforce mandatory age confirmation gates before any user enters chat rooms and maintain zero tolerance for illegal content, child exploitation, non-consensual imagery, and predatory conduct.
          </p>

          <h2>6. How We Keep Miloo Free</h2>
          <p>
            To keep Miloo fast, dependable, and free for visitors around the world, we display privacy-compliant advertisements on our public content pages through Google AdSense. We strictly forbid advertisements within private chat and video call screens to protect your conversational privacy and ensure an uninterrupted user experience.
          </p>

          {/* Section 7 with #team anchor */}
          <section id="team" style={{ marginTop: 44, paddingTop: 28, borderTop: '1px solid var(--border-1)' }}>
            <h2>7. Editorial & Safety Team</h2>
            <p>
              The <strong>{ARTICLE_AUTHOR.name}</strong> comprises experienced privacy researchers, communication designers, and safety engineers dedicated to open-web security and digital civil rights.
            </p>
            <p>
              Our editorial mission is to author rigorous, practical, and candid guides on personal privacy, WebRTC hygiene, cyberstalking prevention, and anti-fraud awareness. Every safety article published in the <Link to="/blog">Miloo Blog</Link> is reviewed against current threat intelligence and vetted for practical clarity before publication.
            </p>
            <div
              className="content-card"
              style={{
                background: 'var(--surface-1)',
                border: '1px solid var(--border-2)',
                borderRadius: 'var(--radius-lg)',
                padding: '20px 24px',
                marginTop: 20,
              }}
            >
              <h4 style={{ margin: '0 0 8px', fontFamily: 'var(--font-display)', fontSize: 18, color: 'var(--text-1)' }}>
                Editorial Review Standards
              </h4>
              <p style={{ margin: 0, fontSize: 14, color: 'var(--text-2)', lineHeight: 1.6 }}>
                All guides are periodically audited and updated to reflect new browser security policies, WebRTC RFC updates, and changing digital risks. We do not accept sponsored content or guest posts from commercial VPN affiliates. Have questions or corrections? Contact our desk at <a href="mailto:support@miloo.chat" style={{ color: 'var(--accent)' }}>support@miloo.chat</a> or visit our <Link to="/transparency">Transparency Center</Link>.
              </p>
            </div>
          </section>
        </article>

        {/* CTA */}
        <div className="content-card" style={{ marginTop: 48, textAlign: 'center' }}>
          <h3 style={{ margin: '0 0 10px', fontFamily: 'var(--font-display)', fontSize: '22px', color: 'var(--text-1)' }}>
            Join the conversation today
          </h3>
          <p style={{ margin: '0 0 20px', color: 'var(--text-2)', fontSize: '15px' }}>
            Meet people from around the world in a clean, private, and spontaneous space.
          </p>
          <Link
            to="/"
            style={{
              display: 'inline-block',
              padding: '12px 28px',
              borderRadius: 'var(--radius-pill)',
              background: 'var(--accent)',
              color: 'var(--accent-text, #ffffff)',
              fontSize: '15px',
              fontWeight: 600,
              textDecoration: 'none',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            Start Chatting Now →
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  )
}
