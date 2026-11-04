import { useState, useEffect } from 'react'

export default function PWAInstallCard({ onDismiss }) {
  const [deferredPrompt, setDeferredPrompt] = useState(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    // Check if 2nd chat completed
    try {
      const count = parseInt(localStorage.getItem('miloo_completed_chats_count') || '0', 10)
      const dismissed = localStorage.getItem('miloo_pwa_dismissed') === 'true'
      if (count >= 2 && !dismissed) {
        setVisible(true)
      }
    } catch (_) {}

    const handleBeforeInstall = (e) => {
      e.preventDefault()
      setDeferredPrompt(e)
      try {
        const count = parseInt(localStorage.getItem('miloo_completed_chats_count') || '0', 10)
        const dismissed = localStorage.getItem('miloo_pwa_dismissed') === 'true'
        if (count >= 2 && !dismissed) {
          setVisible(true)
        }
      } catch (_) {}
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstall)
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall)
  }, [])

  if (!visible) return null

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice
      if (outcome === 'accepted') {
        setVisible(false)
      }
      setDeferredPrompt(null)
    } else {
      // Fallback message for iOS Safari (Add to Home Screen)
      alert('To install Miloo on your device: tap the Share button in Safari and select "Add to Home Screen".')
      setVisible(false)
    }
    try {
      localStorage.setItem('miloo_pwa_dismissed', 'true')
    } catch (_) {}
    onDismiss?.()
  }

  const handleClose = () => {
    setVisible(false)
    try {
      localStorage.setItem('miloo_pwa_dismissed', 'true')
    } catch (_) {}
    onDismiss?.()
  }

  return (
    <div
      className="miloo-pwa-card content-card"
      style={{
        width: 'min(100%, 380px)',
        background: 'var(--surface-1)',
        border: '1.5px solid var(--border-2)',
        borderRadius: 'var(--radius-xl)',
        padding: '20px 22px',
        boxShadow: 'var(--shadow)',
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
        margin: '16px auto',
        textAlign: 'left',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ fontSize: 28 }} aria-hidden="true">
          🕊️
        </div>
        <div>
          <div
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 17,
              fontWeight: 600,
              color: 'var(--text-1)',
            }}
          >
            Keep Miloo on your wire
          </div>
          <div style={{ fontSize: 12.5, color: 'var(--text-3)' }}>
            Instant, zero-login stranger chats anytime
          </div>
        </div>
      </div>

      <p style={{ margin: 0, fontSize: 13, color: 'var(--text-2)', lineHeight: 1.5 }}>
        You've completed 2 conversations! Add Miloo to your home screen for clean, one-tap access without an app store download.
      </p>

      <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
        <button
          type="button"
          onClick={handleInstall}
          style={{
            flex: 1,
            padding: '9px 16px',
            borderRadius: 'var(--radius-pill)',
            border: 'none',
            background: 'var(--accent)',
            color: '#fff',
            fontSize: 13.5,
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          Perch App
        </button>
        <button
          type="button"
          onClick={handleClose}
          style={{
            padding: '9px 16px',
            borderRadius: 'var(--radius-pill)',
            border: '1px solid var(--border-1)',
            background: 'transparent',
            color: 'var(--text-2)',
            fontSize: 13.5,
            cursor: 'pointer',
          }}
        >
          Maybe later
        </button>
      </div>
    </div>
  )
}

