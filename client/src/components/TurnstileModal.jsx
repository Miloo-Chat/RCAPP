import { useEffect, useRef, useState } from 'react'
import { TURNSTILE_SITE_KEY } from '../config/site'
import { storeToken } from '../utils/turnstileGate'

const SERVER_URL = import.meta.env.VITE_SERVER_URL || ''

/**
 * TurnstileModal (FALLBACK ONLY)
 *
 * The normal flow is a silent background check (see utils/turnstileGate.js).
 * This modal only opens if Cloudflare needs a real interaction or the silent check failed.
 * The server still verifies every token with TURNSTILE_SECRET_KEY (fails closed).
 */
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
                storeToken(data.verificationToken)
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
            One quick tap to confirm you're human, then you're in.
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
