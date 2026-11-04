// client/src/components/CookieBanner.jsx
//
// Google-Certified CMP Integration Point & Minimal Cookie Preferences
// Compliant with IAB Europe TCF v2.2 and Google AdSense consent policies.
//
// Google-Certified CMP Integration Point (TCF v2.2 Placeholder):
// Future CMP Placeholder:
// <script async src="https://fundingchoicesmessages.google.com/i/pub-XXXXXXXXXXXXXXXX?ers=1"></script>
// Publishers: Funding Choices / Privacy & messaging certified CMP for EEA and UK
// will replace this banner later when loaded, ensuring two banners never show together.

import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { useAtmosphere } from '../context/AtmosphereContext'
import { ADS_ENABLED } from '../config/site'

export default function CookieBanner() {
  const [isOpen, setIsOpen] = useState(false)
  const [modalActive, setModalActive] = useState(false)
  const atmosphereContext = useAtmosphere()
  const { atmosphere, hour, isNight } = atmosphereContext || {}

  // Determine theme-specific color tokens (Item 5)
  // Light themes: surface #FBF7EE, text #1A1A1A
  // Dusk: surface #2A2740, text #F6EEE6
  // Night: surface #222A4A, text #F6EEE6
  const h = typeof hour === 'number' ? hour : 12
  const isDusk = h >= 19 && h < 21
  const isNightTheme = h >= 21 || h < 5

  let surfaceColor = '#FBF7EE'
  let textColor = '#1A1A1A'
  let subtextColor = '#4A4A4A'
  let inkColor = '#1A1A1A'
  let borderColor = 'rgba(26, 26, 26, 0.16)'

  if (isDusk) {
    surfaceColor = '#2A2740'
    textColor = '#F6EEE6'
    subtextColor = '#D8D0E0'
    inkColor = '#EADBD0'
    borderColor = 'rgba(234, 219, 208, 0.22)'
  } else if (isNightTheme || isNight) {
    surfaceColor = '#222A4A'
    textColor = '#F6EEE6'
    subtextColor = '#BAC5DC'
    inkColor = '#DCE1EC'
    borderColor = 'rgba(220, 225, 236, 0.22)'
  }

  const linkColor = isDusk || isNightTheme || isNight ? '#FFA38C' : '#B8503A'

  // Listen for the "Cookie settings" trigger from the footer or policy pages
  const openPreferences = useCallback(() => {
    // If a Google-certified CMP (Funding Choices / TCF v2.2) is loaded on the page, delegate to it
    if (typeof window !== 'undefined' && typeof window.__tcfapi === 'function') {
      window.__tcfapi('displayConsentUi', 2, () => {})
      return
    }
    if (typeof window !== 'undefined' && window.googlefc?.callbackQueue) {
      window.googlefc.showRevocationMessage?.()
      return
    }

    setIsOpen(true)
  }, [])

  useEffect(() => {
    const handleTrigger = () => openPreferences()
    window.addEventListener('miloo_open_cookie_settings', handleTrigger)

    // Check if initial choice was made
    try {
      const consent = localStorage.getItem('miloo_cookie_consent')
      if (!consent) {
        // Slide up and fade in over 400ms, 1.5s AFTER the preloader ends
        // (preloader runs for ~1.9s, so 3.4s on first load, or 1.5s if preloader was already completed)
        const preloaded = sessionStorage.getItem('miloo_preloaded') === 'true'
        const delay = preloaded ? 1500 : 3400
        const timer = setTimeout(() => setIsOpen(true), delay)
        return () => clearTimeout(timer)
      }
    } catch {
      // ignore
    }

    return () => {
      window.removeEventListener('miloo_open_cookie_settings', handleTrigger)
    }
  }, [openPreferences])

  // Temporarily suppress if age gate modal or other full screen dialog is open
  useEffect(() => {
    const handleAgeModal = (e) => {
      setModalActive(Boolean(e.detail?.open))
    }
    window.addEventListener('miloo_age_modal_change', handleAgeModal)
    return () => window.removeEventListener('miloo_age_modal_change', handleAgeModal)
  }, [])

  // Reserve bottom space on mobile so banner never covers CTA buttons
  useEffect(() => {
    if (typeof document !== 'undefined') {
      if (isOpen && !modalActive) {
        document.body.classList.add('cookie-banner-active')
      } else {
        document.body.classList.remove('cookie-banner-active')
      }
    }
    return () => {
      if (typeof document !== 'undefined') {
        document.body.classList.remove('cookie-banner-active')
      }
    }
  }, [isOpen, modalActive])

  const handleSave = (type) => {
    try {
      if (type === 'accepted') {
        localStorage.setItem('miloo_cookie_consent', 'accepted')
      } else {
        localStorage.setItem('miloo_cookie_consent', 'essential')
      }
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('miloo_consent_change', { detail: { consent: type } }))
      }
    } catch {
      // ignore
    }
    setIsOpen(false)
  }

  if (!isOpen || modalActive) return null

  return (
    <div
      role="dialog"
      aria-label="Cookie and Privacy Preferences"
      aria-modal="true"
      className="miloo-cookie-banner"
      style={{
        position: 'fixed',
        zIndex: 9990,
        backgroundColor: surfaceColor,
        background: surfaceColor,
        color: textColor,
        border: `1.5px solid ${borderColor}`,
        boxShadow: '0 14px 44px rgba(0, 0, 0, 0.28)',
      }}
    >
      {/* Creative touch: tiny ink sparrow perched on the top edge of the card */}
      <svg
        width="26"
        height="26"
        viewBox="-12 -28 24 32"
        className="cookie-banner-sparrow"
        style={{
          position: 'absolute',
          top: -18,
          left: 24,
          overflow: 'visible',
          pointerEvents: 'none',
          color: inkColor,
        }}
        aria-hidden="true"
      >
        <path
          d="M 1 -25 C 2 -27 4 -27 5.5 -25 C 7 -23 6.5 -21 5 -20 C 7.5 -18 10 -13 10 -7 C 10 -1 7 1 2.5 0.5 C 1.5 0.5 1 3 0.5 8 C 0 12 -1 15 -1.5 16.5 C -0.5 16.5 0.5 14 1.5 9 C 2 4 2.5 1 0 0.5 C -3 -0.5 -5.5 -4 -5.5 -9 C -5.5 -15 -3.5 -20 0 -23 Z"
          fill="currentColor"
        />
        <path d="M 5.5 -24.5 L 9.5 -24 L 5.5 -22.5 Z" fill="currentColor" />
        <line x1="-0.5" y1="-1.5" x2="-0.5" y2="0" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
        <line x1="2" y1="-1.5" x2="2" y2="0" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
        <circle cx="3.5" cy="-24" r="0.6" fill="#ffffff" />
      </svg>

      <div className="cookie-banner-content" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h2
            className="cookie-banner-title"
            style={{
              fontFamily: "var(--font-serif), 'Cormorant Garamond', Georgia, serif",
              fontSize: '20px',
              fontWeight: 600,
              color: textColor,
              margin: 0,
              lineHeight: 1.25,
            }}
          >
            Cookie Preferences
          </h2>
          {/* Close X acts as Essential Only, never as consent */}
          <button
            type="button"
            onClick={() => handleSave('essential')}
            aria-label="Close preferences and use essential only"
            style={{
              background: 'none',
              border: 'none',
              fontSize: '18px',
              cursor: 'pointer',
              color: textColor,
              padding: '4px',
              minWidth: '36px',
              minHeight: '36px',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              opacity: 0.8,
            }}
          >
            ✕
          </button>
        </div>

        <p
          className="cookie-banner-text"
          style={{
            fontFamily: "var(--font-body), 'DM Sans', sans-serif",
            fontSize: '15px',
            lineHeight: 1.5,
            color: subtextColor,
            margin: 0,
          }}
        >
          {!ADS_ENABLED ? (
            <>
              We use essential storage to run the site. No ads or trackers. Learn more in our{' '}
              <Link to="/cookie-policy" style={{ color: linkColor, textDecoration: 'underline', fontWeight: 600 }}>
                Cookie Policy
              </Link>{' '}
              and{' '}
              <Link to="/privacy" style={{ color: linkColor, textDecoration: 'underline', fontWeight: 600 }}>
                Privacy Policy
              </Link>.
            </>
          ) : (
            <>
              We use essential storage for site operation and Google AdSense on public editorial pages. We never inject trackers or advertisements into private chat sessions. Learn more in our{' '}
              <Link to="/cookie-policy" style={{ color: linkColor, textDecoration: 'underline', fontWeight: 600 }}>
                Cookie Policy
              </Link>{' '}
              and{' '}
              <Link to="/privacy" style={{ color: linkColor, textDecoration: 'underline', fontWeight: 600 }}>
                Privacy Policy
              </Link>.
            </>
          )}
        </p>

        {/* Two equally sized action buttons */}
        <div style={{ display: 'flex', gap: 10, marginTop: 4, width: '100%' }}>
          <button
            type="button"
            className="cookie-banner-btn"
            onClick={() => handleSave('accepted')}
            style={{
              flex: 1,
              minHeight: '44px',
              padding: '10px 16px',
              borderRadius: '9999px',
              background: '#B8503A',
              color: '#ffffff',
              border: 'none',
              fontSize: '14.5px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'opacity 0.15s ease',
            }}
          >
            Accept all
          </button>
          <button
            type="button"
            className="cookie-banner-btn"
            onClick={() => handleSave('essential')}
            style={{
              flex: 1,
              minHeight: '44px',
              padding: '10px 16px',
              borderRadius: '9999px',
              background: 'transparent',
              color: textColor,
              border: `2px solid ${inkColor}`,
              fontSize: '14.5px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'opacity 0.15s ease',
            }}
          >
            Essential only
          </button>
        </div>
      </div>

      <style>{`
        .miloo-cookie-banner {
          bottom: 20px;
          left: 20px;
          max-width: 380px;
          width: calc(100% - 40px);
          border-radius: 16px;
          padding: 20px 22px;
          animation: cookieBannerSlideUp 400ms cubic-bezier(.22, 1, .36, 1) forwards;
        }
        @keyframes cookieBannerSlideUp {
          0% {
            transform: translateY(24px);
            opacity: 0;
          }
          100% {
            transform: translateY(0);
            opacity: 1;
          }
        }
        @media (max-width: 640px) {
          .miloo-cookie-banner {
            bottom: 0 !important;
            left: 0 !important;
            right: 0 !important;
            max-width: 100% !important;
            width: 100% !important;
            border-radius: 16px 16px 0 0 !important;
            border-left: none !important;
            border-right: none !important;
            border-bottom: none !important;
            padding: 12px 18px max(12px, env(safe-area-inset-bottom, 12px)) !important;
          }
          .cookie-banner-content {
            gap: 8px !important;
          }
          .cookie-banner-title {
            font-size: 18px !important;
          }
          .cookie-banner-text {
            font-size: 13.5px !important;
            line-height: 1.35 !important;
          }
          .cookie-banner-btn {
            min-height: 38px !important;
            padding: 6px 12px !important;
            font-size: 13.5px !important;
          }
        }
      `}</style>
    </div>
  )
}
