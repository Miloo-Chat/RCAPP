// client/src/components/Navbar.jsx
//
// Minimal Watercolor Navigation Bar for Miloo.
// Uses authentic watercolor wordmark, delicate ink typography,
// and displays the user's active local time and atmospheric phase.

import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAtmosphere } from '../context/AtmosphereContext'
import WatercolorLogo from './watercolor/WatercolorLogo'

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
  const { atmosphere, isNight, timeEngine } = useAtmosphere()

  return (
    <header
      className="watercolor-navbar"
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        backgroundColor: atmosphere?.paperBgCss || (isNight ? '#121726' : '#FAF4EB'),
        borderBottom: '1px solid var(--border-1)',
        backdropFilter: 'blur(8px)',
        transition: 'background-color 0.4s ease, border-color 0.4s ease',
      }}
    >
      <div
        className="container"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          minHeight: 'var(--header-h, 64px)',
          gap: 16,
        }}
      >
        {/* Brand: Hand-inked "miloo" wordmark with watercolor dot */}
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <WatercolorLogo
            color="var(--text-1)"
            isNight={isNight}
            size={24}
          />
        </div>

        {/* Desktop Navigation */}
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
                className="nav-ink-link"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  minHeight: '38px',
                  padding: '6px 14px',
                  borderRadius: 'var(--radius-pill)',
                  fontSize: '15px',
                  fontWeight: isActive ? 600 : 500,
                  fontFamily: 'var(--font-serif)',
                  letterSpacing: '0.01em',
                  color: isActive ? (isNight ? '#FCEAE6' : '#6A1604') : 'var(--text-1)',
                  background: isActive ? (isNight ? 'rgba(255,255,255,0.08)' : 'var(--accent-dim)') : 'transparent',
                  border: isActive ? `1px solid ${isNight ? 'rgba(255,255,255,0.2)' : 'var(--accent)'}` : '1px solid transparent',
                  textDecoration: 'none',
                  transition: 'all 0.2s ease',
                }}
              >
                {item.label}
              </Link>
            )
          })}
        </nav>

        {/* Right Actions: Local Time Indicator & Mobile Hamburger */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {rightSlot}

          {/* User Local Time & Atmosphere Indicator */}
          <div
            title={`Local time: ${timeEngine.formattedTime} (${atmosphere.phaseName})`}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              borderRadius: 'var(--radius-pill)',
              background: 'var(--surface-1)',
              border: '1px solid var(--border-1)',
              fontSize: '13px',
              fontFamily: 'var(--font-body)',
              color: 'var(--text-2)',
              userSelect: 'none',
            }}
          >
            <span style={{ fontSize: '14px' }}>
              {isNight ? '🌙' : (timeEngine.hour >= 17 && timeEngine.hour < 20 ? '🌅' : '☀️')}
            </span>
            <span style={{ fontWeight: 600, color: 'var(--text-1)' }}>
              {timeEngine.formattedTime}
            </span>
          </div>

          {/* Mobile hamburger toggle */}
          <button
            type="button"
            className="mobile-menu-btn"
            aria-label={mobileMenuOpen ? 'Close Navigation Menu' : 'Open Navigation Menu'}
            aria-expanded={mobileMenuOpen}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            style={{
              display: 'none',
              alignItems: 'center',
              justifyContent: 'center',
              width: '44px',
              height: '44px',
              minWidth: '44px',
              minHeight: '44px',
              background: 'var(--surface-1)',
              border: '1px solid var(--border-1)',
              borderRadius: 'var(--radius-md)',
              color: 'var(--text-1)',
              fontSize: '20px',
              lineHeight: 1,
              padding: 0,
            }}
          >
            {mobileMenuOpen ? '✕' : '☰'}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <nav
          aria-label="Mobile Navigation Drawer"
          className="mobile-nav-drawer"
          style={{
            background: 'var(--bg-0)',
            borderBottom: '1px solid var(--border-2)',
            padding: '12px 16px',
            display: 'flex',
            flexDirection: 'column',
            gap: 6,
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
                  display: 'flex',
                  alignItems: 'center',
                  minHeight: '44px',
                  fontSize: '16px',
                  fontWeight: isActive ? 600 : 500,
                  fontFamily: 'var(--font-serif)',
                  color: isActive ? (isNight ? '#FCEAE6' : '#6A1604') : 'var(--text-1)',
                  textDecoration: 'none',
                  padding: '8px 14px',
                  borderRadius: 'var(--radius-md)',
                  background: isActive ? (isNight ? 'rgba(255,255,255,0.08)' : 'var(--accent-dim)') : 'transparent',
                }}
              >
                {item.label}
              </Link>
            )
          })}
        </nav>
      )}
    </header>
  )
}
