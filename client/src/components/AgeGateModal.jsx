import { Link } from 'react-router-dom'

export default function AgeGateModal({ isOpen, onConfirm, onCancel, targetMode = 'video' }) {
  if (!isOpen) return null

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="age-gate-title"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9995,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        background: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
      }}
    >
      <div
        className="content-card"
        style={{
          width: 'min(100%, 520px)',
          background: 'var(--bg-1)',
          border: '1px solid var(--border-2)',
          borderRadius: 'var(--radius-xl)',
          boxShadow: 'var(--shadow)',
          padding: 'clamp(24px, 4vw, 36px)',
          display: 'flex',
          flexDirection: 'column',
          gap: 20,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
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
          >
            🔞
          </div>
          <div>
            <h2
              id="age-gate-title"
              style={{
                margin: 0,
                fontSize: '20px',
                fontFamily: 'var(--font-display)',
                color: 'var(--text-1)',
              }}
            >
              18+ Age & Safety Confirmation
            </h2>
            <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-3)' }}>
              Entering {targetMode === 'video' ? 'Video Chat' : 'Text Chat'}
            </p>
          </div>
        </div>

        <p style={{ margin: 0, fontSize: '14px', lineHeight: 1.6, color: 'var(--text-2)' }}>
          Miloo is strictly intended for adults aged 18 and older. Random stranger chats are unmoderated peer-to-peer connections and may contain spontaneous content unsuitable for minors.
        </p>

        <div
          style={{
            background: 'var(--surface-1)',
            border: '1px solid var(--border-1)',
            borderRadius: 'var(--radius-md)',
            padding: '14px 16px',
            fontSize: '13px',
            lineHeight: 1.6,
            color: 'var(--text-2)',
            display: 'flex',
            flexDirection: 'column',
            gap: 8,
          }}
        >
          <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
            <span style={{ color: 'var(--accent)', fontWeight: 'bold' }}>✓</span>
            <span>I confirm that I am at least 18 years of age.</span>
          </div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
            <span style={{ color: 'var(--accent)', fontWeight: 'bold' }}>✓</span>
            <span>I will not transmit illegal content, nudity, harassment, or spam.</span>
          </div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
            <span style={{ color: 'var(--accent)', fontWeight: 'bold' }}>✓</span>
            <span>
              I agree to the{' '}
              <Link to="/terms" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent)' }}>
                Terms of Service
              </Link>
              ,{' '}
              <Link to="/privacy" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent)' }}>
                Privacy Policy
              </Link>
              , and{' '}
              <Link to="/community-guidelines" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent)' }}>
                Community Guidelines
              </Link>
              .
            </span>
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            gap: 12,
            justifyContent: 'flex-end',
            flexWrap: 'wrap',
            paddingTop: 8,
          }}
        >
          <button
            type="button"
            onClick={onCancel}
            style={{
              padding: '10px 20px',
              borderRadius: 'var(--radius-pill)',
              border: '1px solid var(--border-1)',
              background: 'transparent',
              color: 'var(--text-2)',
              fontSize: '14px',
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
            I am under 18 — Exit
          </button>
          <button
            type="button"
            onClick={onConfirm}
            style={{
              padding: '10px 24px',
              borderRadius: 'var(--radius-pill)',
              border: 'none',
              background: 'var(--accent)',
              color: '#ffffff',
              fontSize: '14px',
              fontWeight: 600,
              cursor: 'pointer',
              boxShadow: 'var(--shadow-sm)',
              transition: 'opacity 160ms ease',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.9')}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
          >
            I am 18 or Older — Enter Chat
          </button>
        </div>
      </div>
    </div>
  )
}
