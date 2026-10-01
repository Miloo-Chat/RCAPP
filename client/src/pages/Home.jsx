import { useState, useEffect } from 'react'
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

  // Real visitor local time for subtle human connection
  const [timeStr, setTimeStr] = useState(() => {
    try {
      return new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }).toLowerCase()
    } catch {
      return ''
    }
  })

  useEffect(() => {
    const timer = setInterval(() => {
      try {
        setTimeStr(new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }).toLowerCase())
      } catch {
        // ignore
      }
    }, 15000)
    return () => clearInterval(timer)
  }, [])

  return (
    <div className="page page-enter" style={{ background: 'var(--bg-0)', position: 'relative', overflow: 'hidden' }}>
      {/* ── ATMOSPHERE (GRAIN & SLOW AMBIENT LIGHT) ── */}
      <div className="grain-overlay" aria-hidden="true" />
      <div className="ambient-light" aria-hidden="true" />

      {/* ── NAVBAR ── */}
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
      <main
        className="container"
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          paddingTop: 'clamp(32px, 6vh, 72px)',
          paddingBottom: 'clamp(48px, 8vh, 88px)',
          position: 'relative',
          zIndex: 2,
        }}
      >
        <div className="home-hero-layout">
          {/* ── LEFT COLUMN: ASYMMETRIC EDITORIAL COPY ── */}
          <div style={{ textAlign: 'left', maxWidth: 540 }}>
            {/* Real visitor local time */}
            {timeStr && (
              <div
                className="fade-in-up"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  fontSize: '13px',
                  color: 'var(--text-3)',
                  marginBottom: '20px',
                  fontFamily: 'var(--font-body)',
                  letterSpacing: '0.01em',
                }}
              >
                <span
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: '50%',
                    background: 'var(--accent)',
                    display: 'inline-block',
                    opacity: 0.9,
                  }}
                />
                <span>It's {timeStr}.</span>
              </div>
            )}

            <h1
              className="fade-in-up"
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(38px, 5.2vw, 68px)',
                fontWeight: 400,
                letterSpacing: '-0.03em',
                lineHeight: 1.08,
                margin: '0 0 24px',
                color: 'var(--text-1)',
              }}
            >
              Talk to someone unexpected.
            </h1>

            <p
              className="fade-in-up"
              style={{
                fontSize: 'clamp(15px, 1.6vw, 18px)',
                color: 'var(--text-2)',
                lineHeight: 1.65,
                margin: '0 0 32px',
                maxWidth: 460,
              }}
            >
              A late-night conversation, a quick story, or just passing the time. Pick a door and see who's there.
            </p>

            {/* Honest Safety & Privacy claims */}
            <div
              className="fade-in-up"
              style={{
                color: 'var(--text-3)',
                fontSize: '13px',
                lineHeight: 1.5,
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <span>Anonymous</span>
              <span style={{ opacity: 0.35 }}>·</span>
              <span>Skip anytime</span>
            </div>
          </div>

          {/* ── RIGHT COLUMN: THE TWO ARCHED DOORS ── */}
          <div className="home-doors fade-in-up">
            {/* DOOR 1: TEXT CHAT */}
            <button
              onClick={onStartText}
              className="home-door door-text"
              aria-label="Enter Text Chat"
            >
              <div style={{ width: '100%' }}>
                <h2
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: 'clamp(28px, 2.8vw, 36px)',
                    fontWeight: 400,
                    letterSpacing: '-0.02em',
                    color: '#121110',
                    margin: '0 0 12px',
                    lineHeight: 1.12,
                    whiteSpace: 'nowrap',
                  }}
                >
                  Text Chat
                </h2>
                <p
                  style={{
                    fontSize: '15px',
                    color: 'rgba(18, 17, 16, 0.88)',
                    lineHeight: 1.5,
                    margin: 0,
                  }}
                >
                  Instant messages. No camera, no pressure.
                </p>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 32 }}>
                <span
                  className="door-arrow"
                  style={{
                    fontSize: '28px',
                    lineHeight: 1,
                    color: '#121110',
                    display: 'inline-block',
                    transition: 'transform 220ms ease-out',
                  }}
                >
                  →
                </span>
              </div>
            </button>

            {/* DOOR 2: VIDEO CHAT */}
            <button
              onClick={onStartVideo}
              className="home-door door-video"
              aria-label="Enter Video Chat"
            >
              <div style={{ width: '100%' }}>
                <h2
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: 'clamp(28px, 2.8vw, 36px)',
                    fontWeight: 400,
                    letterSpacing: '-0.02em',
                    color: 'var(--text-1)',
                    margin: '0 0 12px',
                    lineHeight: 1.12,
                    whiteSpace: 'nowrap',
                  }}
                >
                  Video Chat
                </h2>
                <p
                  style={{
                    fontSize: '15px',
                    color: 'var(--text-2)',
                    lineHeight: 1.5,
                    margin: 0,
                  }}
                >
                  Face-to-face. Direct live connection.
                </p>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 32 }}>
                <span
                  className="door-arrow"
                  style={{
                    fontSize: '28px',
                    lineHeight: 1,
                    color: 'var(--text-1)',
                    display: 'inline-block',
                    transition: 'transform 220ms ease-out',
                  }}
                >
                  →
                </span>
              </div>
            </button>
          </div>
        </div>
      </main>

      {/* ── FOOTER ── */}
      <footer
        style={{
          borderTop: '1px solid var(--border-1)',
          background: 'var(--bg-0)',
          paddingTop: 24,
          paddingBottom: 28,
          position: 'relative',
          zIndex: 2,
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
            gap: 16,
            color: 'var(--text-3)',
            fontSize: 13,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Logo size={20} />
            <span style={{ fontWeight: 400, color: 'var(--text-3)' }}>© {new Date().getFullYear()}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
            <FooterLink onClick={onTerms}>Safety & Rules</FooterLink>
            <FooterLink onClick={() => navigate('/blog/omegle-alternative')}>Omegle Alternative</FooterLink>
            <FooterLink onClick={() => navigate('/blog/random-video-chat-india')}>Random Video Chat</FooterLink>
            <FooterLink onClick={() => navigate('/blog/stranger-chat-india')}>Stranger Chat</FooterLink>
          </div>
          <div style={{ width: '100%', color: 'var(--text-3)', fontSize: 12, lineHeight: 1.5, marginTop: 4 }}>
            Some conversations may be with Milo, an AI companion.
          </div>
        </div>
      </footer>
    </div>
  )
}

/* ── Subcomponents ── */

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
        transition: 'color 180ms ease-out',
      }}
      onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text-1)')}
      onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-3)')}
    >
      {children}
    </button>
  )
}
