import { useEffect, useRef, useState } from 'react'
import { TURNSTILE_SITE_KEY } from '../config/site'

const SERVER_URL = import.meta.env.VITE_SERVER_URL || ''

// miloo-turnstile-preload: page khulte hi script load, modal khulte hi ready
if (typeof window !== 'undefined') {
  try {
    const alreadyVerified = sessionStorage.getItem('miloo_turnstile_verified') === 'true'
    if (!alreadyVerified && !document.getElementById('cloudflare-turnstile-script')) {
      const pre = document.createElement('script')
      pre.id = 'cloudflare-turnstile-script'
      pre.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit'
      pre.async = true
      pre.defer = true
      document.head.appendChild(pre)
    }
  } catch (_) {}
}

/**
 * TurnstileModal
 * 
 * Cloudflare Turnstile modal.
 * Verifies the token on the server with TURNSTILE_SECRET_KEY before allowing a chat session.
 * Fails closed on any error or blocked network.
 */
// miloo-turnstile-prewarm
// Runs the Turnstile check quietly in the background shortly after the page opens,
// so the token is usually ready by the time the user presses a chat button.
// If it cannot finish silently, nothing happens and the normal modal is used.
function hasFreshVerification() {
  try {
    if (sessionStorage.getItem('miloo_turnstile_verified') !== 'true') return false
    const token = sessionStorage.getItem('miloo_turnstile_token')
    const ts = Number(String(token || '').split(':')[0])
    return !!ts && Date.now() - ts < 110 * 60 * 1000
  } catch (_) {
    return false
  }
}

let prewarmStarted = false

function prewarmTurnstile() {
  if (prewarmStarted || typeof window === 'undefined') return
  if (hasFreshVerification()) return
  if (navigator.webdriver || /bot|crawl|spider|lighthouse|headless/i.test(navigator.userAgent)) return
  prewarmStarted = true
  let tries = 0
  const start = () => {
    if (!window.turnstile) {
      if (++tries > 100) return
      setTimeout(start, 100)
      return
    }
    const host = document.createElement('div')
    host.id = 'miloo-turnstile-prewarm'
    host.style.cssText = 'position:fixed;right:12px;bottom:12px;z-index:10000'
    document.body.appendChild(host)
    let widgetId = null
    const cleanup = () => {
      try { if (widgetId !== null) window.turnstile.remove(widgetId) } catch (_) {}
      host.remove()
    }
    try {
      widgetId = window.turnstile.render(host, {
        sitekey: TURNSTILE_SITE_KEY,
        appearance: 'interaction-only',
        callback: async (token) => {
          try {
            const res = await fetch(`${SERVER_URL}/api/verify-turnstile`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ token }),
            })
            const data = await res.json()
            if (res.ok && data.verified && data.verificationToken) {
              sessionStorage.setItem('miloo_turnstile_verified', 'true')
              sessionStorage.setItem('miloo_turnstile_token', data.verificationToken)
            }
          } catch (_) {
            /* the normal modal is the fallback */
          }
          cleanup()
        },
        'error-callback': cleanup,
        'timeout-callback': cleanup,
      })
    } catch (_) {
      host.remove()
    }
  }
  start()
}

if (typeof window !== 'undefined') {
  const events = ['pointerdown', 'mousemove', 'touchstart', 'scroll', 'keydown']
  let timer = null
  const kick = () => {
    events.forEach((e) => window.removeEventListener(e, kick))
    if (timer) clearTimeout(timer)
    prewarmTurnstile()
  }
  events.forEach((e) => window.addEventListener(e, kick, { once: true, passive: true }))
  timer = setTimeout(kick, 2500)
}

export default function TurnstileModal({ isOpen, onSuccess, onCancel }) {
  const containerRef = useRef(null)
  const widgetIdRef = useRef(null)
  const [verifying, setVerifying] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    if (!isOpen) return

    let isMounted = true

    // Function to render the Turnstile widget
    const renderWidget = () => {
      if (!isMounted || !containerRef.current || !window.turnstile) return
      try {
        if (widgetIdRef.current !== null) {
          window.turnstile.remove(widgetIdRef.current)
        }
        widgetIdRef.current = window.turnstile.render(containerRef.current, {
          sitekey: TURNSTILE_SITE_KEY,
          theme: 'auto',
          callback: async (token) => {
            if (!isMounted) return
            setVerifying(true)
            setErrorMessage('')

            try {
              const res = await fetch(`${SERVER_URL}/api/verify-turnstile`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token }),
              })
              const data = await res.json()

              if (res.ok && data.verified && data.verificationToken) {
                try {
                  sessionStorage.setItem('miloo_turnstile_verified', 'true')
                  sessionStorage.setItem('miloo_turnstile_token', data.verificationToken)
                } catch (_) {}
                if (isMounted) {
                  onSuccess?.(data.verificationToken)
                }
              } else {
                if (isMounted) {
                  setErrorMessage(data.error || 'Verification check failed. Please try again.')
                  setVerifying(false)
                }
              }
            } catch (err) {
              if (isMounted) {
                console.error('[Turnstile] Server verification failed:', err.message)
                setErrorMessage('Verification service unreachable. Please check network connection.')
                setVerifying(false)
              }
            }
          },
          'error-callback': () => {
            if (isMounted) {
              console.warn('[Turnstile] Challenge encountered an error or network block.')
              setErrorMessage('Security challenge failed. Please verify your connection or disable blockers.')
              setVerifying(false)
            }
          },
        })
      } catch (err) {
        if (isMounted) {
          console.warn('[Turnstile] Error rendering widget:', err.message)
          setErrorMessage('Failed to initialize security verification.')
        }
      }
    }

    // Load Turnstile script if not present
    if (!window.turnstile) {
      const scriptId = 'cloudflare-turnstile-script'
      let script = document.getElementById(scriptId)
      if (!script) {
        script = document.createElement('script')
        script.id = scriptId
        script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit'
        script.async = true
        script.defer = true
        script.onload = () => {
          if (isMounted) renderWidget()
        }
        script.onerror = () => {
          if (isMounted) {
            console.warn('[Turnstile] Script failed to load.')
            setErrorMessage('Could not load security challenge service. Please check connection.')
            setVerifying(false)
          }
        }
        document.head.appendChild(script)
      } else {
        const checkInterval = setInterval(() => {
          if (window.turnstile) {
            clearInterval(checkInterval)
            if (isMounted) renderWidget()
          }
        }, 100)
        setTimeout(() => clearInterval(checkInterval), 5000)
      }
    } else {
      renderWidget()
    }

    const handleEsc = (e) => {
      if (e.key === 'Escape') onCancel?.()
    }
    window.addEventListener('keydown', handleEsc)

    return () => {
      isMounted = false
      window.removeEventListener('keydown', handleEsc)
      if (widgetIdRef.current !== null && window.turnstile) {
        try {
          window.turnstile.remove(widgetIdRef.current)
        } catch (_) {}
        widgetIdRef.current = null
      }
    }
  }, [isOpen, onSuccess, onCancel])

  if (!isOpen) return null

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="turnstile-modal-title"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 10001,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        background: 'rgba(0, 0, 0, 0.72)',
        animation: 'fadeIn 180ms ease-out both',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onCancel?.()
      }}
    >
      <div
        className="content-card"
        style={{
          width: 'min(100%, 420px)',
          background: 'var(--bg-1)',
          border: '1px solid var(--border-2)',
          borderRadius: 'var(--radius-xl)',
          boxShadow: 'var(--shadow)',
          padding: '28px 24px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          gap: 16,
        }}
      >
        <div style={{ fontSize: 32 }}>🕊️</div>
        <div>
          <h3
            id="turnstile-modal-title"
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 20,
              color: 'var(--text-1)',
              margin: '0 0 6px',
            }}
          >
            Quick Security Check
          </h3>
          <p
            style={{
              fontSize: 13,
              color: 'var(--text-2)',
              margin: 0,
              lineHeight: 1.5,
            }}
          >
            Before your first conversation of this session, please verify to protect Miloo against automated bots.
          </p>
        </div>

        {/* Turnstile Container */}
        <div
          ref={containerRef}
          style={{
            minHeight: '65px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '8px 0',
          }}
        >
          {verifying && (
            <div style={{ fontSize: 13, color: 'var(--accent)', fontWeight: 600 }}>
              Verifying security check on server…
            </div>
          )}
        </div>

        {errorMessage && (
          <div style={{ fontSize: 13, color: 'var(--danger)', lineHeight: 1.4, padding: '4px 8px' }}>
            {errorMessage}
          </div>
        )}

        <button
          type="button"
          onClick={onCancel}
          style={{
            background: 'transparent',
            border: 'none',
            color: 'var(--text-3)',
            fontSize: 13,
            cursor: 'pointer',
            padding: '6px 12px',
          }}
        >
          Cancel
        </button>
      </div>
    </div>
  )
}
