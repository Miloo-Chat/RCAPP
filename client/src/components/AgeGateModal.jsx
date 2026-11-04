import { useEffect, useRef } from 'react'
import { trackEvent } from '../utils/analytics'

/**
 * AgeGateModal
 * 
 * Strict 18+ verification modal overlay.
 * Renders client-side only when triggered by user interaction.
 * Meets all accessibility standards: role="dialog", aria-modal="true", focus trap, ESC listener, body scroll lock.
 */
export default function AgeGateModal({ isOpen, onConfirm, onCancel, targetMode = 'video' }) {
  const modalRef = useRef(null)
  const confirmBtnRef = useRef(null)
  const cancelBtnRef = useRef(null)

  // Body scroll lock & hide banner while modal is open
  useEffect(() => {
    if (!isOpen) return

    document.body.classList.add('has-age-modal')
    window.dispatchEvent(new CustomEvent('miloo_age_modal_change', { detail: { open: true } }))

    const originalOverflow = document.body.style.overflow
    const originalPaddingRight = document.body.style.paddingRight

    // Compensate for scrollbar jump if needed
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`
    }
    document.body.style.overflow = 'hidden'

    // Autofocus confirm button
    const focusTimer = setTimeout(() => {
      confirmBtnRef.current?.focus()
    }, 50)

    // ESC key listener & focus trap
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        onCancel()
        return
      }

      if (e.key === 'Tab') {
        const focusable = [confirmBtnRef.current, cancelBtnRef.current].filter(Boolean)
        if (focusable.length === 0) return

        const first = focusable[0]
        const last = focusable[focusable.length - 1]

        if (e.shiftKey) {
          if (document.activeElement === first) {
            e.preventDefault()
            last.focus()
          }
        } else {
          if (document.activeElement === last) {
            e.preventDefault()
            first.focus()
          }
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      clearTimeout(focusTimer)
      document.body.classList.remove('has-age-modal')
      window.dispatchEvent(new CustomEvent('miloo_age_modal_change', { detail: { open: false } }))
      document.body.style.overflow = originalOverflow
      document.body.style.paddingRight = originalPaddingRight
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, onCancel])

  if (!isOpen) return null

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="age-gate-title"
      aria-describedby="age-gate-desc"
      onClick={(e) => {
        // Clicking backdrop closes modal
        if (e.target === e.currentTarget) onCancel()
      }}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 10000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        background: 'rgba(0, 0, 0, 0.72)',
        animation: 'fadeIn 180ms ease-out both',
      }}
    >
      <div
        ref={modalRef}
        className="content-card"
        style={{
          width: 'min(100%, 460px)',
          background: 'var(--surface-1)',
          border: '1px solid var(--border-2)',
          borderRadius: 'var(--radius-xl)',
          boxShadow: '0 24px 60px rgba(0, 0, 0, 0.55)',
          padding: 'clamp(24px, 5vw, 32px)',
          display: 'flex',
          flexDirection: 'column',
          gap: 20,
          animation: 'scaleIn 200ms ease-out both',
        }}
      >
        {/* Header icon and title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: '50%',
              background: 'var(--accent-dim)',
              border: '1px solid var(--accent)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '22px',
              flexShrink: 0,
            }}
            aria-hidden="true"
          >
            🔞
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <h2
              id="age-gate-title"
              style={{
                margin: 0,
                fontSize: '20px',
                fontFamily: 'var(--font-display)',
                fontWeight: 600,
                color: 'var(--text-1)',
                lineHeight: 1.25,
              }}
            >
              Are you 18 or older?
            </h2>
            <span style={{ fontSize: '13px', color: 'var(--text-3)' }}>
              Entering {targetMode === 'text' ? 'Text Chat' : 'Video Chat'}
            </span>
          </div>
        </div>

        {/* Short one-line explanation */}
        <p
          id="age-gate-desc"
          style={{
            margin: 0,
            fontSize: '14px',
            lineHeight: 1.6,
            color: 'var(--text-2)',
          }}
        >
          Miloo is strictly for adults aged 18 and older. By continuing, you confirm your age and agree to our safety rules.
        </p>

        {/* Two action buttons */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column-reverse',
            gap: 10,
            marginTop: 4,
          }}
        >
          <button
            ref={cancelBtnRef}
            type="button"
            onClick={() => {
              try {
                trackEvent('age_gate_result', { status: 'exited', mode: targetMode })
              } catch (_) {}
              if (typeof window !== 'undefined') {
                window.location.href = 'https://www.google.com'
              }
              onCancel()
            }}
            style={{
              minHeight: '48px',
              padding: '12px 20px',
              borderRadius: 'var(--radius-pill)',
              border: '1.5px solid var(--border-2)',
              background: 'transparent',
              color: 'var(--text-2)',
              fontSize: '14.5px',
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'background var(--ease), color var(--ease)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
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
            No, take me out
          </button>

          <button
            ref={confirmBtnRef}
            type="button"
            onClick={() => {
              try {
                trackEvent('age_gate_result', { status: 'passed', mode: targetMode })
              } catch (_) {}
              onConfirm()
            }}
            style={{
              minHeight: '48px',
              padding: '12px 24px',
              borderRadius: 'var(--radius-pill)',
              border: 'none',
              background: 'var(--accent)',
              color: '#ffffff',
              fontSize: '15.5px',
              fontWeight: 600,
              cursor: 'pointer',
              boxShadow: '0 4px 16px rgba(230, 99, 69, 0.35)',
              transition: 'opacity var(--ease), transform var(--ease)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.92')}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
          >
            Yes, I'm 18+
          </button>
        </div>
      </div>
    </div>
  )
}
