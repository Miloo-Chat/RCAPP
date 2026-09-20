import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'

export default function NotFound({ theme, onToggleTheme }) {
  const navigate = useNavigate()

  return (
    <div className="page page-enter" style={{ background: 'var(--bg-0)', display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar theme={theme} onToggleTheme={onToggleTheme} />

      <main
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          padding: '24px',
        }}
      >
        <h1
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(36px, 8vw, 80px)',
            fontWeight: 800,
            letterSpacing: '-0.04em',
            margin: '0 0 16px',
            color: 'var(--text-1)',
            lineHeight: 1.1,
          }}
        >
          <span className="gradient-text">Lost in the void.</span>
        </h1>

        <p
          style={{
            fontSize: 'clamp(15px, 2vw, 18px)',
            color: 'var(--text-2)',
            lineHeight: 1.6,
            maxWidth: 400,
            margin: '0 auto 32px',
          }}
        >
          This page wandered off and we can't find it. Let's get you back to meeting someone new.
        </p>

        <button
          onClick={() => navigate('/')}
          style={{
            background: 'var(--accent)',
            color: '#fff',
            border: 'none',
            padding: '14px 32px',
            borderRadius: 'var(--radius-pill)',
            fontSize: 16,
            fontWeight: 700,
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <span aria-hidden="true">←</span>
          <span>Back to Home</span>
        </button>
      </main>
    </div>
  )
}
