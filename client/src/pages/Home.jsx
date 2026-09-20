// client/src/pages/Home.jsx
//
// Hero landing page. Attractive, simple, and fully responsive.
// Layout: hero → mode selector → features → footer.

import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Logo from '../components/Logo'

export default function Home({
  onStartText,
  onStartVideo,
  onTerms,
  theme,
  onToggleTheme,
}) {
  const navigate = useNavigate()

  return (
    <div className="page page-enter" style={{ background: 'var(--bg-0)' }}>
      <Navbar
        theme={theme}
        onToggleTheme={onToggleTheme}
        rightSlot={
          <button
            onClick={onTerms}
            className="compact"
            style={{
              background: 'transparent',
              color: 'var(--text-2)',
              fontSize: '14px',
              fontWeight: 600,
              padding: '8px 12px',
              borderRadius: 'var(--radius-pill)',
            }}
          >
            Safety
          </button>
        }
      />

      {/* ── HERO ── */}
      <section
        className="container"
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          paddingTop: 'clamp(40px, 8vh, 80px)',
          paddingBottom: 'clamp(40px, 6vh, 60px)',
          position: 'relative',
        }}
      >
        {/* Decorative gradient orbs */}
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            top: '10%',
            left: '50%',
            transform: 'translateX(-50%)',
            width: 'clamp(280px, 60vw, 600px)',
            height: 'clamp(280px, 60vw, 600px)',
            background:
              'radial-gradient(circle, rgba(167,139,250,0.25) 0%, rgba(124,58,237,0.08) 40%, transparent 70%)',
            filter: 'blur(40px)',
            pointerEvents: 'none',
            zIndex: 0,
          }}
        />

        <div style={{ position: 'relative', zIndex: 1, maxWidth: 720 }}>
          <h1
            className="fade-in-up"
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(36px, 7vw, 64px)',
              fontWeight: 800,
              letterSpacing: '-0.04em',
              lineHeight: 1.05,
              margin: '0 0 20px',
              color: 'var(--text-1)',
            }}
          >
            Meet someone new.{' '}
            <span className="gradient-text">Instantly.</span>
          </h1>

          <p
            className="fade-in-up"
            style={{
              fontSize: 'clamp(15px, 1.8vw, 18px)',
              color: 'var(--text-2)',
              lineHeight: 1.6,
              maxWidth: 540,
              margin: '0 auto 36px',
            }}
          >
            It's free, anonymous, and there's no sign-up. Miloo matches you with real people who share your vibe — pick a mood, start talking, and let serendipity do the rest.
          </p>

          {/* ── Mode selector ── */}
          <div
            className="fade-in-up"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 220px), 1fr))',
              gap: 12,
              maxWidth: 480,
              margin: '0 auto 24px',
            }}
          >
            <ModeCard
              icon="💬"
              title="Text Chat"
              desc="Type, no camera, instant"
              onClick={onStartText}
            />
            <ModeCard
              icon="🎥"
              title="Video Chat"
              desc="Face to face, real time"
              onClick={onStartVideo}
            />
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section
        className="container"
        style={{
          paddingTop: 'clamp(40px, 6vh, 60px)',
          paddingBottom: 'clamp(40px, 6vh, 60px)',
        }}
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 260px), 1fr))',
            gap: 16,
            maxWidth: 980,
            margin: '0 auto',
          }}
        >
          <div style={{ gridColumn: '1 / -1' }}>
            <FeatureCard
              featured
              icon={
                <svg
                  width="34"
                  height="34"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                >
                  <path d="M12 2 L20 6 V12 C20 17 16.5 20.5 12 22 C7.5 20.5 4 17 4 12 V6 Z" />
                </svg>
              }
              title="Safe by default"
              desc="18+ only, fingerprint bans, no logs"
            />
          </div>
          <FeatureCard
            icon={
              <svg
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <circle cx="12" cy="12" r="9" />
                <circle cx="12" cy="12" r="3.5" />
              </svg>
            }
            title="Mood matching"
            desc="Find someone who actually gets it"
          />
          <FeatureCard
            icon={
              <svg
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <rect x="3" y="5" width="18" height="14" rx="3" />
                <circle cx="9" cy="12" r="1.2" fill="currentColor" stroke="none" />
                <circle cx="15" cy="12" r="1.2" fill="currentColor" stroke="none" />
              </svg>
            }
            title="Milo keeps you company"
            desc="AI companion while you wait"
          />
          <FeatureCard
            icon={
              <svg
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <path d="M13 2 L4 14 H11 L10 22 L20 9 H13 Z" />
              </svg>
            }
            title="Instant, no signup"
            desc="Open the page and you're in"
          />
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer
        className="container"
        style={{
          paddingTop: 24,
          paddingBottom: 32,
          display: 'flex',
          flexDirection: 'row',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 16,
          color: 'var(--text-3)',
          fontSize: 13,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Logo size={20} />
          <span>© {new Date().getFullYear()} Miloo</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
          <FooterLink onClick={onTerms}>Safety</FooterLink>
          <FooterLink onClick={() => navigate('/blog/omegle-alternative')}>
            Omegle Alternative
          </FooterLink>
          <FooterLink onClick={() => navigate('/blog/random-video-chat-india')}>
            Random Video Chat
          </FooterLink>
          <FooterLink onClick={() => navigate('/blog/stranger-chat-india')}>
            Stranger Chat
          </FooterLink>
        </div>
      </footer>
    </div>
  )
}

/* ── Subcomponents ── */

function ModeCard({ icon, title, desc, onClick }) {
  return (
    <button
      onClick={onClick}
      className="card-hover"
      style={{
        position: 'relative',
        textAlign: 'left',
        padding: 'clamp(18px, 3vw, 24px)',
        borderRadius: 'var(--radius-lg)',
        background: 'var(--surface-1)',
        border: '1px solid var(--border-1)',
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        transition: 'all 0.2s ease',
        minHeight: 110,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = 'var(--accent-border)'
        e.currentTarget.style.background = 'var(--surface-2)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = 'var(--border-1)'
        e.currentTarget.style.background = 'var(--surface-1)'
      }}
    >
      <span style={{ fontSize: 28, lineHeight: 1 }} aria-hidden="true">
        {icon}
      </span>
      <div>
        <div
          style={{
            fontSize: 16,
            fontWeight: 700,
            color: 'var(--text-1)',
            marginBottom: 2,
            letterSpacing: '-0.01em',
          }}
        >
          {title}
        </div>
        <div style={{ fontSize: 13, color: 'var(--text-3)', lineHeight: 1.4 }}>
          {desc}
        </div>
      </div>
    </button>
  )
}

function FeatureCard({ icon, title, desc, featured = false }) {
  return (
    <div
      className="card-hover"
      style={{
        padding: featured ? 'clamp(20px, 3.5vw, 28px)' : 'clamp(16px, 2.5vw, 22px)',
        borderRadius: featured ? 'var(--radius-lg)' : 'var(--radius-md)',
        background: 'var(--surface-1)',
        border: '1px solid var(--border-1)',
        display: 'flex',
        flexDirection: 'column',
        gap: featured ? 12 : 8,
        height: '100%',
        boxShadow: 'none',
      }}
    >
      <div
        style={{
          color: 'var(--accent)',
          display: 'flex',
          alignItems: 'center',
          marginBottom: featured ? 2 : 0,
        }}
        aria-hidden="true"
      >
        {icon}
      </div>
      <div style={{ fontSize: featured ? 18 : 15, fontWeight: 700, color: 'var(--text-1)' }}>{title}</div>
      <div style={{ fontSize: featured ? 14 : 13, color: 'var(--text-3)', lineHeight: 1.5 }}>{desc}</div>
    </div>
  )
}

function FooterLink({ onClick, children }) {
  return (
    <button
      onClick={onClick}
      className="compact"
      style={{
        background: 'transparent',
        color: 'var(--text-3)',
        fontSize: 13,
        fontWeight: 500,
        padding: 4,
        cursor: 'pointer',
      }}
      onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text-1)')}
      onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-3)')}
    >
      {children}
    </button>
  )
}
