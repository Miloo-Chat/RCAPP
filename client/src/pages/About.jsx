import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import SEOHead from '../components/SEOHead'

export default function About({ theme, onToggleTheme }) {
  return (
    <div className="page page-enter" style={{ background: 'var(--bg-0)' }}>
      <SEOHead
        title="About Miloo — Our Story & Vision for Modern Anonymous Chat"
        description="Learn why Miloo was built: reviving spontaneous human connection online with modern WebRTC peer privacy, zero profiling, and uncompromising safety standards."
        canonicalUrl="https://www.miloo.chat/about"
      />

      <Navbar theme={theme} onToggleTheme={onToggleTheme} />

      <main className="container" style={{ paddingTop: 'clamp(32px, 5vw, 56px)', paddingBottom: 'clamp(48px, 8vw, 80px)', maxWidth: 880 }}>
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
            <li><strong>Peer-to-Peer by Default:</strong> Built on cutting-edge WebRTC standards, routing audio and video directly between browsers with end-to-end encryption.</li>
            <li><strong>Aesthetically Thoughtful:</strong> Designed with clean, elegant typography, warm terracotta accents, and responsive layouts that look stunning on any screen.</li>
          </ul>

          <h2>3. Our Core Architectural Principles</h2>
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
            <li>
              <strong>Transparent Artificial Intelligence:</strong> When traffic is quiet and human queues are waiting, we offer Milo, an AI conversational partner. We clearly label Milo so our community is never misled about whom they are speaking with.
            </li>
          </ol>

          <h2>4. Strictly for Adults (18+)</h2>
          <p>
            Miloo is dedicated exclusively to adult users. We do not permit minors on the site under any circumstances. We enforce mandatory age confirmation gates before any user enters chat rooms and maintain zero tolerance for illegal content, child exploitation, non-consensual imagery, and predatory conduct.
          </p>

          <h2>5. How We Keep Miloo Free</h2>
          <p>
            To keep Miloo fast, dependable, and free for visitors around the world, we display privacy-compliant advertisements on our public content pages through Google AdSense. We strictly forbid advertisements within private chat and video call screens to protect your conversational privacy and ensure an uninterrupted user experience.
          </p>
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
              color: '#ffffff',
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
