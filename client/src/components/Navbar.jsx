import { useNavigate } from 'react-router-dom'
import ThemeToggle from './ThemeToggle'
import Logo from './Logo'

export default function Navbar({ theme, onToggleTheme, rightSlot }) {
  const navigate = useNavigate()
  return (
    <nav
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        background: 'var(--bg-0)',
        borderTop: 'none',
        outline: 'none',
        borderBottom: '1px solid var(--border-1)',
        transition: 'background 0.25s ease, border-color 0.25s ease',
      }}
    >
      <div
        className="container"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingTop: 14,
          paddingBottom: 14,
        }}
      >
        <button
          onClick={() => navigate('/')}
          aria-label="Go to home"
          className="compact"
          style={{
            background: 'transparent',
            border: 'none',
            padding: 0,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <Logo size={28} />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {rightSlot}
          {onToggleTheme ? <ThemeToggle theme={theme} onToggle={onToggleTheme} /> : null}
        </div>
      </div>
    </nav>
  )
}
