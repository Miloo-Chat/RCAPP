import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import ThemeToggle from './ThemeToggle'
import Logo from './Logo'

const NAV_LINKS = [
  { label: 'How It Works', path: '/how-it-works' },
  { label: 'Safety', path: '/safety' },
  { label: 'FAQ', path: '/faq' },
  { label: 'Blog', path: '/blog' },
  { label: 'About', path: '/about' },
  { label: 'Contact', path: '/contact' },
]

export default function Navbar({ theme, onToggleTheme, rightSlot }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const location = useLocation()

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        background: 'var(--bg-0)',
        borderBottom: '1px solid var(--border-1)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        transition: 'background 0.25s ease, border-color 0.25s ease',
      }}
    >
      <div
        className="container"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingTop: 12,
          paddingBottom: 12,
          minHeight: 'var(--header-h, 64px)',
        }}
      >
        {/* Brand Logo */}
        <Link
          to="/"
          aria-label="Miloo Home"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            textDecoration: 'none',
            color: 'inherit',
          }}
        >
          <Logo size={28} />
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

        {/* Desktop Navigation Links */}
        <nav
          aria-label="Main Navigation"
          className="desktop-nav"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
          }}
        >
          {NAV_LINKS.map((item) => {
            const isActive = location.pathname === item.path
            return (
              <Link
                key={item.path}
                to={item.path}
                style={{
                  padding: '6px 12px',
                  borderRadius: 'var(--radius-pill)',
                  fontSize: '14px',
                  fontWeight: isActive ? 600 : 500,
                  fontFamily: 'var(--font-body)',
                  color: isActive ? 'var(--accent)' : 'var(--text-2)',
                  background: isActive ? 'var(--accent-dim)' : 'transparent',
                  textDecoration: 'none',
                  transition: 'all 180ms ease',
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.color = 'var(--text-1)'
                    e.currentTarget.style.background = 'var(--surface-1)'
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.color = 'var(--text-2)'
                    e.currentTarget.style.background = 'transparent'
                  }
                }}
              >
                {item.label}
              </Link>
            )
          })}
        </nav>

        {/* Actions & Mobile Menu Toggle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {rightSlot}
          {onToggleTheme && <ThemeToggle theme={theme} onToggle={onToggleTheme} />}

          {/* Mobile hamburger button */}
          <button
            type="button"
            className="mobile-menu-btn"
            aria-label={mobileMenuOpen ? 'Close Menu' : 'Open Menu'}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            style={{
              display: 'none',
              background: 'var(--surface-1)',
              border: '1px solid var(--border-1)',
              borderRadius: 'var(--radius-md)',
              color: 'var(--text-1)',
              padding: '8px 10px',
              cursor: 'pointer',
              fontSize: '18px',
              lineHeight: 1,
            }}
          >
            {mobileMenuOpen ? '✕' : '☰'}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Dropdown */}
      {mobileMenuOpen && (
        <div
          className="mobile-nav-drawer"
          style={{
            background: 'var(--bg-1)',
            borderBottom: '1px solid var(--border-2)',
            padding: '16px 20px',
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
          }}
        >
          {NAV_LINKS.map((item) => {
            const isActive = location.pathname === item.path
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileMenuOpen(false)}
                style={{
                  fontSize: '16px',
                  fontWeight: isActive ? 600 : 500,
                  color: isActive ? 'var(--accent)' : 'var(--text-1)',
                  textDecoration: 'none',
                  padding: '8px 12px',
                  borderRadius: 'var(--radius-sm)',
                  background: isActive ? 'var(--accent-dim)' : 'transparent',
                }}
              >
                {item.label}
              </Link>
            )
          })}
        </div>
      )}
    </header>
  )
}
