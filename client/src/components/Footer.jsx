import { Link } from 'react-router-dom'
import Logo from './Logo'

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer
      style={{
        borderTop: '1px solid var(--border-1)',
        background: 'var(--bg-0)',
        paddingTop: 'clamp(40px, 6vw, 64px)',
        paddingBottom: 'clamp(32px, 5vw, 48px)',
        position: 'relative',
        zIndex: 10,
      }}
    >
      <div className="container" style={{ display: 'flex', flexDirection: 'column', gap: 40 }}>
        {/* Top Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: 32,
          }}
        >
          {/* Column 1: Brand & Mission */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <Link
              to="/"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 10,
                textDecoration: 'none',
                color: 'inherit',
              }}
            >
              <Logo size={26} />
              <span
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '22px',
                  fontWeight: 600,
                  letterSpacing: '-0.02em',
                  color: 'var(--text-1)',
                }}
              >
                Miloo
              </span>
            </Link>
            <p
              style={{
                color: 'var(--text-2)',
                fontSize: '14px',
                lineHeight: 1.6,
                maxWidth: 300,
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
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <h4
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '13px',
                fontWeight: 700,
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                color: 'var(--text-1)',
                margin: 0,
              }}
            >
              Explore Miloo
            </h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
              <li>
                <FooterLink to="/">Home</FooterLink>
              </li>
              <li>
                <FooterLink to="/how-it-works">How It Works</FooterLink>
              </li>
              <li>
                <FooterLink to="/safety">Safety Center</FooterLink>
              </li>
              <li>
                <FooterLink to="/faq">Frequently Asked Questions</FooterLink>
              </li>
              <li>
                <FooterLink to="/blog">Blog & Guides</FooterLink>
              </li>
              <li>
                <FooterLink to="/about">About Us</FooterLink>
              </li>
              <li>
                <FooterLink to="/contact">Contact & Support</FooterLink>
              </li>
            </ul>
          </div>

          {/* Column 3: Safety & Legal */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <h4
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '13px',
                fontWeight: 700,
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                color: 'var(--text-1)',
                margin: 0,
              }}
            >
              Legal & Trust
            </h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
              <li>
                <FooterLink to="/terms">Terms of Service</FooterLink>
              </li>
              <li>
                <FooterLink to="/privacy">Privacy Policy</FooterLink>
              </li>
              <li>
                <FooterLink to="/community-guidelines">Community Guidelines</FooterLink>
              </li>
              <li>
                <FooterLink to="/safety#reporting">Report Abuse</FooterLink>
              </li>
            </ul>
          </div>

          {/* Column 4: Transparent AI & Ad Policy */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <h4
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '13px',
                fontWeight: 700,
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                color: 'var(--text-1)',
                margin: 0,
              }}
            >
              Transparency
            </h4>
            <p
              style={{
                color: 'var(--text-3)',
                fontSize: '13px',
                lineHeight: 1.6,
                margin: 0,
              }}
            >
              Miloo is committed to transparent standards. When waiting queues are empty, some conversations may be facilitated by Milo, an AI companion clearly labeled as such.
            </p>
            <p
              style={{
                color: 'var(--text-3)',
                fontSize: '13px',
                lineHeight: 1.6,
                margin: 0,
              }}
            >
              Advertisements are served solely on public informational pages through Google AdSense. Ads are never displayed inside private chat sessions.
            </p>
          </div>
        </div>

        {/* Bottom Bar */}
        <div
          style={{
            borderTop: '1px solid var(--border-1)',
            paddingTop: 24,
            display: 'flex',
            flexDirection: 'row',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 16,
            fontSize: '13px',
            color: 'var(--text-3)',
          }}
        >
          <div>© {currentYear} Miloo (miloo.chat). All rights reserved.</div>
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
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
        color: 'var(--text-2)',
        fontSize: '14px',
        textDecoration: 'none',
        transition: 'color 180ms ease',
      }}
      onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--accent)')}
      onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-2)')}
    >
      {children}
    </Link>
  )
}
