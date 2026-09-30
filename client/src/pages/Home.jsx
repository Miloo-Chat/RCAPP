import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Logo from '../components/Logo'
import useCanonical from '../hooks/useCanonical'

export default function Home({
  onStartText,
  onStartVideo,
  onTerms,
  theme,
  onToggleTheme,
}) {
  const navigate = useNavigate()

  useCanonical('https://www.miloo.chat/')

  return (
    <div className="page page-enter" style={{ background: 'var(--bg-0)', display: 'flex', flexDirection: 'column' }}>
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
              fontFamily: 'var(--font-body)',
              fontWeight: 500,
              padding: '8px 14px',
              borderRadius: 'var(--radius-pill)',
              border: '1px solid transparent',
              transition: 'all 220ms ease-out',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = 'var(--text-1)'
              e.currentTarget.style.background = 'var(--surface-1)'
              e.currentTarget.style.borderColor = 'var(--border-1)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = 'var(--text-2)'
              e.currentTarget.style.background = 'transparent'
              e.currentTarget.style.borderColor = 'transparent'
            }}
          >
            Safety
          </button>
        }
      />

      {/* ── HERO & TWO DOORS ── */}
      <section
        className="container"
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          paddingTop: 'clamp(48px, 10vh, 96px)',
          paddingBottom: 'clamp(48px, 8vh, 80px)',
        }}
      >
        <div style={{ maxWidth: 760, width: '100%' }}>
          <h1
            className="fade-in-up"
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(40px, 7.5vw, 72px)',
              fontWeight: 400,
              letterSpacing: '-0.025em',
              lineHeight: 1.08,
              margin: '0 0 20px',
              color: 'var(--text-1)',
            }}
          >
            Talk to someone unexpected.
          </h1>

          <p
            className="fade-in-up"
            style={{
              fontSize: 'clamp(16px, 1.8vw, 19px)',
              color: 'var(--text-2)',
              lineHeight: 1.6,
              maxWidth: 520,
              margin: '0 auto 44px',
            }}
          >
            A late-night conversation, a quick story, or just passing the time. Pick a door and see who's there.
          </p>

          {/* ── TWO DOORS ── */}
          <div
            className="fade-in-up"
            style={{
              display: 'flex',
              flexDirection: 'row',
              flexWrap: 'wrap',
              gap: 16,
              justifyContent: 'center',
            }}
          >
            <ModeDoor
              icon={
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
              }
              title="Text Chat"
              desc="Instant messages. No camera, no pressure."
              onClick={onStartText}
            />
            <ModeDoor
              icon={
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="23 7 16 12 23 17 23 7" />
                  <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
                </svg>
              }
              title="Video Chat"
              desc="Face-to-face. Direct live connection."
              onClick={onStartVideo}
            />
          </div>

          {/* ── HONEST SAFETY NOTE ── */}
          <div
            className="fade-in-up"
            style={{
              marginTop: 48,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 12,
              color: 'var(--text-3)',
              fontSize: 14,
              lineHeight: 1.5,
              padding: '8px 16px',
              borderRadius: 'var(--radius-pill)',
              background: 'var(--surface-1)',
              border: '1px solid var(--border-1)',
            }}
          >
            <span>Anonymous & unrecorded</span>
            <span style={{ opacity: 0.4 }}>•</span>
            <span>18+ only</span>
            <span style={{ opacity: 0.4 }}>•</span>
            <span>Skip anytime</span>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer
        style={{
          borderTop: '1px solid var(--border-1)',
          background: 'var(--bg-0)',
          paddingTop: 28,
          paddingBottom: 36,
        }}
      >
        <div
          className="container"
          style={{
            display: 'flex',
            flexDirection: 'row',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 20,
            color: 'var(--text-3)',
            fontSize: 13,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Logo size={22} />
            <span style={{ fontWeight: 500 }}>© {new Date().getFullYear()} Miloo</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
            <FooterLink onClick={onTerms}>Safety & Rules</FooterLink>
            <FooterLink onClick={() => navigate('/blog/omegle-alternative')}>Omegle Alternative</FooterLink>
            <FooterLink onClick={() => navigate('/blog/random-video-chat-india')}>Random Video Chat</FooterLink>
            <FooterLink onClick={() => navigate('/blog/stranger-chat-india')}>Stranger Chat</FooterLink>
          </div>
        </div>
      </footer>
    </div>
  )
}

/* ── Subcomponents ── */

function ModeDoor({ icon, title, desc, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        flex: '1 1 280px',
        maxWidth: 360,
        position: 'relative',
        textAlign: 'left',
        padding: '28px 24px',
        background: 'var(--surface-1)',
        border: '1px solid var(--border-1)',
        borderRadius: 'var(--radius-lg)',
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
        transition: 'all 240ms ease-out',
        minHeight: 130,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = 'var(--border-2)'
        e.currentTarget.style.background = 'var(--surface-2)'
        e.currentTarget.style.transform = 'translateY(-2px)'
        const arrow = e.currentTarget.querySelector('.door-arrow')
        if (arrow) arrow.style.transform = 'translateX(4px)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = 'var(--border-1)'
        e.currentTarget.style.background = 'var(--surface-1)'
        e.currentTarget.style.transform = 'translateY(0)'
        const arrow = e.currentTarget.querySelector('.door-arrow')
        if (arrow) arrow.style.transform = 'translateX(0)'
      }}
      onMouseDown={(e) => {
        e.currentTarget.style.transform = 'translateY(0) scale(0.99)'
      }}
      onMouseUp={(e) => {
        e.currentTarget.style.transform = 'translateY(-2px) scale(1)'
      }}
    >
      <div
        style={{
          color: 'var(--accent)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
        aria-hidden="true"
      >
        {icon}
        <svg
          className="door-arrow"
          width="18" height="18"
          viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
          style={{ transition: 'transform 220ms ease-out', color: 'var(--text-3)' }}
        >
          <line x1="5" y1="12" x2="19" y2="12"></line>
          <polyline points="12 5 19 12 12 19"></polyline>
        </svg>
      </div>
      <div>
        <div
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 22,
            fontWeight: 400,
            color: 'var(--text-1)',
            marginBottom: 6,
            letterSpacing: '-0.01em',
          }}
        >
          {title}
        </div>
        <div style={{ fontSize: 14, color: 'var(--text-2)', lineHeight: 1.45 }}>
          {desc}
        </div>
      </div>
    </button>
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
        fontWeight: 400,
        padding: '4px 6px',
        cursor: 'pointer',
        transition: 'color 180ms ease-out'
      }}
      onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text-1)')}
      onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-3)')}
    >
      {children}
    </button>
  )
}
