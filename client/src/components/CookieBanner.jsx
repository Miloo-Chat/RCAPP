/**
 * NOTE FOR EEA / UK AD COMPLIANCE:
 * To comply with Google AdSense requirements and GDPR/UK regulations in the European Economic Area (EEA) and the UK,
 * publishers must deploy a Google-certified Consent Management Platform (CMP) integrated with the IAB TCF v2.2.
 * Google provides a certified consent message (Funding Choices) configured directly in:
 * AdSense Dashboard > Privacy & messaging > European regulations / GDPR.
 * 
 * When configured in the AdSense console, Google's ad script automatically presents the certified CMP modal
 * to visitors from the EEA and UK before serving personalized ads. This local CookieBanner handles site-wide
 * first-party preferences and allows users to manage local cookie acceptance.
 */

import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

export default function CookieBanner() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    try {
      const consent = localStorage.getItem('miloo_cookie_consent')
      if (!consent) {
        // Small delay so page renders smoothly first
        const timer = setTimeout(() => setVisible(true), 600)
        return () => clearTimeout(timer)
      }
    } catch {
      // ignore
    }
  }, [])

  const handleAccept = () => {
    try {
      localStorage.setItem('miloo_cookie_consent', 'accepted')
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('miloo_consent_change', { detail: { consent: 'accepted' } }))
      }
    } catch {
      // ignore
    }
    setVisible(false)
  }

  const handleDecline = () => {
    try {
      localStorage.setItem('miloo_cookie_consent', 'essential')
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('miloo_consent_change', { detail: { consent: 'essential' } }))
      }
    } catch {
      // ignore
    }
    setVisible(false)
  }

  if (!visible) return null

  return (
    <aside
      aria-label="Cookie consent banner"
      style={{
        position: 'fixed',
        bottom: 20,
        left: '50%',
        transform: 'translateX(-50%)',
        width: 'min(92vw, 540px)',
        zIndex: 9990,
        background: 'var(--surface-1)',
        border: '1px solid var(--border-2)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow)',
        padding: '20px 24px',
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: '18px' }}>🍪</span>
          <h4
            style={{
              margin: 0,
              fontSize: '15px',
              fontWeight: 600,
              fontFamily: 'var(--font-body)',
              color: 'var(--text-1)',
            }}
          >
            Cookie & Privacy Preferences
          </h4>
        </div>
        <p
          style={{
            margin: 0,
            fontSize: '13px',
            lineHeight: 1.55,
            color: 'var(--text-2)',
          }}
        >
          Miloo uses essential cookies for site functionality and privacy-conscious analytics and third-party advertising partners (such as Google AdSense) on public pages to support our free platform. Learn more in our{' '}
          <Link
            to="/privacy"
            style={{ color: 'var(--accent)', textDecoration: 'underline' }}
          >
            Privacy Policy
          </Link>
          .
        </p>
      </div>

      <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
        <button
          type="button"
          onClick={handleDecline}
          style={{
            padding: '8px 16px',
            borderRadius: 'var(--radius-pill)',
            border: '1px solid var(--border-1)',
            background: 'transparent',
            color: 'var(--text-2)',
            fontSize: '13px',
            fontWeight: 500,
            cursor: 'pointer',
            transition: 'all 160ms ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = 'var(--text-1)'
            e.currentTarget.style.background = 'var(--surface-2)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = 'var(--text-2)'
            e.currentTarget.style.background = 'transparent'
          }}
        >
          Essential Only
        </button>
        <button
          type="button"
          onClick={handleAccept}
          style={{
            padding: '8px 18px',
            borderRadius: 'var(--radius-pill)',
            border: 'none',
            background: 'var(--accent)',
            color: '#ffffff',
            fontSize: '13px',
            fontWeight: 600,
            cursor: 'pointer',
            boxShadow: 'var(--shadow-sm)',
            transition: 'opacity 160ms ease',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.9')}
          onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
        >
          Accept All
        </button>
      </div>
    </aside>
  )
}
