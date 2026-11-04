import { useState, useEffect, useRef } from 'react'
import { ENABLE_GOLDEN_HOURS, ENABLE_GOLDEN_HOUR_NOTIFICATIONS } from '../config/site'

export default function GoldenHours({ isNight }) {
  const [optedIn, setOptedIn] = useState(false)
  const [statusMessage, setStatusMessage] = useState('')
  const timerRef = useRef(null)

  const triggerGoldenHourNotification = () => {
    if (typeof window === 'undefined' || !('Notification' in window)) return
    if (Notification.permission !== 'granted') return

    const todayStr = new Date().toISOString().slice(0, 10)
    try {
      if (localStorage.getItem('miloo_gh_last_notified') === todayStr) return
      localStorage.setItem('miloo_gh_last_notified', todayStr)
    } catch (_) {}

    try {
      new Notification('Miloo Golden Hour 🕊️', {
        body: 'Birds are gathering on the wire (8–11 PM). Come meet a real stranger.',
        icon: '/favicon.svg',
      })
    } catch (e) {
      console.warn('Could not display notification:', e)
    }
  }

  const scheduleNextGoldenHour = () => {
    if (typeof window === 'undefined') return
    if (timerRef.current) clearTimeout(timerRef.current)

    const now = new Date()
    const currentHour = now.getHours() + now.getMinutes() / 60

    // If currently between 20:00 (8 PM) and 23:00 (11 PM)
    if (currentHour >= 20.0 && currentHour < 23.0) {
      triggerGoldenHourNotification()
      return
    }

    // Target next 20:00:00 local time
    const target = new Date(now)
    target.setHours(20, 0, 0, 0)
    if (now.getTime() >= target.getTime()) {
      target.setDate(target.getDate() + 1)
    }

    const msUntilTarget = target.getTime() - now.getTime()
    // Cap at ~24 hours
    if (msUntilTarget > 0 && msUntilTarget < 86400000) {
      timerRef.current = setTimeout(() => {
        triggerGoldenHourNotification()
      }, msUntilTarget)
    }
  }

  useEffect(() => {
    if (!ENABLE_GOLDEN_HOURS || !ENABLE_GOLDEN_HOUR_NOTIFICATIONS) return

    try {
      if (localStorage.getItem('miloo_golden_hour_notify') === 'true') {
        setOptedIn(true)
        if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
          scheduleNextGoldenHour()
        }
      }
    } catch (_) {}

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [])

  if (!ENABLE_GOLDEN_HOURS) {
    return null
  }

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
        scheduleNextGoldenHour()
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

      {ENABLE_GOLDEN_HOUR_NOTIFICATIONS && (
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
      )}

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
