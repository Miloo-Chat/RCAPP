import { useState, useEffect } from 'react'

export default function GoldenHours({ isNight }) {
  const [optedIn, setOptedIn] = useState(false)
  const [statusMessage, setStatusMessage] = useState('')

  useEffect(() => {
    try {
      if (localStorage.getItem('miloo_golden_hour_notify') === 'true') {
        setOptedIn(true)
      }
    } catch (_) {}
  }, [])

  const handleNotifyOptIn = async () => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      setStatusMessage('Notifications are not supported in this browser.')
      return
    }

    try {
      const permission = await Notification.requestPermission()
      if (permission === 'granted') {
        localStorage.setItem('miloo_golden_hour_notify', 'true')
        setOptedIn(true)
        setStatusMessage('Your bird will chirp when the golden hour begins!')
        setTimeout(() => setStatusMessage(''), 4000)
      } else {
        setStatusMessage('Permission not granted.')
        setTimeout(() => setStatusMessage(''), 3000)
      }
    } catch (err) {
      console.warn('Notification permission error:', err.message)
    }
  }

  const textColor = isNight ? '#E4EAF4' : '#2D2824'
  const subColor = isNight ? '#BDCCE0' : '#453E37'

  return (
    <div
      className="miloo-golden-hours-container"
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '4px',
        marginTop: '12px',
        userSelect: 'none',
        textAlign: 'center',
      }}
    >
      <div
        style={{
          fontFamily: "var(--font-hand), 'Caveat', cursive, sans-serif",
          fontSize: '19px',
          color: textColor,
          letterSpacing: '0.02em',
        }}
      >
        Golden hours: 8:00 PM – 11:00 PM local time
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        {!optedIn ? (
          <button
            type="button"
            onClick={handleNotifyOptIn}
            aria-label="Tell me when it's golden hour: opt-in to browser notification"
            style={{
              background: 'none',
              border: 'none',
              padding: 0,
              fontFamily: 'var(--font-body)',
              fontSize: '12px',
              color: subColor,
              textDecoration: 'underline',
              cursor: 'pointer',
            }}
          >
            Tell me when it's golden hour
          </button>
        ) : (
          <span
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: '11.5px',
              color: 'var(--accent)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
            }}
          >
            <span>✓</span>
            <span>Golden hour alert active</span>
          </span>
        )}
      </div>

      {statusMessage && (
        <div
          style={{
            fontFamily: "var(--font-hand), 'Caveat', cursive, sans-serif",
            fontSize: '15px',
            color: 'var(--accent)',
            marginTop: '2px',
          }}
        >
          {statusMessage}
        </div>
      )}
    </div>
  )
}

