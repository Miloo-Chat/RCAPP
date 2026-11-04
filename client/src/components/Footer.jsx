import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAtmosphere } from '../context/AtmosphereContext'
import WatercolorLogo from './watercolor/WatercolorLogo'
import { isSoundMuted, toggleSoundMuted, playBirdChirp } from './watercolor/soundEngine'

export default function Footer() {
  const currentYear = new Date().getFullYear()
  const { isNight } = useAtmosphere()
  const [muted, setMuted] = useState(true)

  useEffect(() => {
    setMuted(isSoundMuted())
  }, [])

  const handleToggleSound = () => {
    const next = toggleSoundMuted()
    setMuted(next)
    if (!next) {
      setTimeout(() => playBirdChirp(0), 100)
    }
  }

  const handleOpenCookieSettings = () => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('miloo_open_cookie_settings'))
    }
  }

  return (
    <footer
      style={{
        borderTop: '1px solid var(--border-1)',
        backgroundColor: isNight ? '#121726' : '#FAF4EB',
        paddingTop: 'clamp(40px, 6vw, 56px)',
        paddingBottom: 'clamp(32px, 5vw, 44px)',
        position: 'relative',
        zIndex: 10,
      }}
    >
      <div className="container" style={{ display: 'flex', flexDirection: 'column', gap: 36 }}>
        {/* Top Grid: 2 columns on mobile, 4 on desktop */}
        <div className="footer-grid">
          {/* Column 1: Brand & Mission */}
          <div className="footer-brand-col" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <WatercolorLogo color="var(--text-1)" isNight={isNight} size={32} showDetail={true} />
            <p
              style={{
                color: 'var(--text-2)',
                fontSize: '14px',
                lineHeight: 1.6,
                maxWidth: 320,
                margin: 0,
              }}
            >
              The modern anonymous video and text chat platform for genuine, spontaneous human conversations. Free, private, and strictly 18+.
            </p>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '4px 10px',
                borderRadius: 'var(--radius-pill)',
                background: 'var(--surface-1)',
                border: '1px solid var(--border-1)',
                width: 'fit-content',
                fontSize: '12px',
                fontWeight: 600,
                color: 'var(--text-2)',
              }}
            >
              <span style={{ color: 'var(--accent)', fontSize: '14px' }}>🔞</span>
              <span>18+ Adults Only</span>
            </div>
          </div>

          {/* Column 2: Platform Links */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <h3
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '12px',
                fontWeight: 700,
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                color: 'var(--text-1)',
                margin: 0,
              }}
            >
              Explore Miloo
            </h3>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
              <li>
                <FooterLink to="/about">About</FooterLink>
              </li>
              <li>
                <FooterLink to="/contact">Contact</FooterLink>
              </li>
              <li>
                <FooterLink to="/how-it-works">How It Works</FooterLink>
              </li>
              <li>
                <FooterLink to="/safety">Safety Center</FooterLink>
              </li>
              <li>
                <FooterLink to="/faq">FAQ</FooterLink>
              </li>
              <li>
                <FooterLink to="/blog">Blog</FooterLink>
              </li>
            </ul>
          </div>

          {/* Column 3: Safety & Legal */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <h3
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '12px',
                fontWeight: 700,
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                color: 'var(--text-1)',
                margin: 0,
              }}
            >
              Legal & Trust
            </h3>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
              <li>
                <FooterLink to="/privacy">Privacy Policy</FooterLink>
              </li>
              <li>
                <FooterLink to="/cookie-policy">Cookie Policy</FooterLink>
              </li>
              <li>
                <FooterLink to="/terms">Terms (18+)</FooterLink>
              </li>
              <li>
                <FooterLink to="/community-guidelines">Community Guidelines</FooterLink>
              </li>
              <li>
                <FooterLink to="/transparency">Transparency & Moderation</FooterLink>
              </li>
              <li>
                <button
                  type="button"
                  onClick={handleOpenCookieSettings}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    minHeight: '32px',
                    color: 'var(--text-1)',
                    fontSize: '14px',
                    background: 'none',
                    border: 'none',
                    padding: 0,
                    margin: 0,
                    cursor: 'pointer',
                    font: 'inherit',
                    transition: 'color var(--ease)',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--accent)')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-1)')}
                >
                  Cookie settings
                </button>
              </li>
            </ul>
          </div>

          {/* Column 4: Transparent Standards & Audio Control */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <h3
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '12px',
                fontWeight: 700,
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                color: 'var(--text-1)',
                margin: 0,
              }}
            >
              Experience & Transparency
            </h3>
            <p
              style={{
                color: 'var(--text-2)',
                fontSize: '13px',
                lineHeight: 1.6,
                margin: 0,
              }}
            >
              Advertisements appear solely on informational pages via Google AdSense. Ads and trackers are never loaded inside active video or text chat rooms.
            </p>

            {/* Subtle Chirp Audio Mute Toggle */}
            <div style={{ marginTop: 4 }}>
              <button
                type="button"
                onClick={handleToggleSound}
                aria-label={muted ? 'Chirp sound: Muted (Click to enable)' : 'Chirp sound: Active (Click to mute)'}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '6px 12px',
                  borderRadius: 'var(--radius-pill)',
                  background: 'var(--surface-1)',
                  border: '1px solid var(--border-1)',
                  color: 'var(--text-1)',
                  fontSize: '13px',
                  cursor: 'pointer',
                  transition: 'background var(--ease), border-color var(--ease)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'var(--surface-2)'
                  e.currentTarget.style.borderColor = 'var(--accent)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'var(--surface-1)'
                  e.currentTarget.style.borderColor = 'var(--border-1)'
                }}
              >
                <span>{muted ? '🔇' : '🐦'}</span>
                <span>Chirp sound: {muted ? 'Muted' : 'On'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div
          style={{
            borderTop: '1px solid var(--border-1)',
            paddingTop: 20,
            display: 'flex',
            flexDirection: 'row',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
            fontSize: '13px',
            color: 'var(--text-2)',
          }}
        >
          <div>© {currentYear} miloo (miloo.chat). All rights reserved.</div>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <span>Anonymous Peer-to-Peer WebRTC</span>
            <span>·</span>
            <span>No Registration Required</span>
            <span>·</span>
            <span>Strictly 18+</span>
          </div>
        </div>
      </div>
    </footer>
  )
}

function FooterLink({ to, children }) {
  return (
    <Link
      to={to}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        minHeight: '32px',
        color: 'var(--text-1)',
        fontSize: '14px',
        textDecoration: 'none',
        transition: 'color var(--ease)',
      }}
      onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--accent)')}
      onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-1)')}
    >
      {children}
    </Link>
  )
}
