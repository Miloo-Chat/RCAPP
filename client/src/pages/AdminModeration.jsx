import { useState, useEffect, lazy, Suspense } from 'react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import SEOHead from '../components/SEOHead'

const SERVER_URL = import.meta.env.VITE_SERVER_URL || ''

// Moderation portal UI is isolated in its own chunk and loaded ONLY after verified authentication
const AdminModerationPortal = lazy(() => import('./admin/AdminModerationPortal'))

export default function AdminModeration({ theme, onToggleTheme }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [checkingSession, setCheckingSession] = useState(true)
  const [password, setPassword] = useState('')
  const [loginLoading, setLoginLoading] = useState(false)
  const [loginError, setLoginError] = useState('')
  const [lockoutSec, setLockoutSec] = useState(0)

  // Verify server-side session on mount via httpOnly cookie
  useEffect(() => {
    let isMounted = true
    const checkSession = async () => {
      try {
        const res = await fetch(`${SERVER_URL}/api/admin/session`, {
          credentials: 'include',
        })
        if (res.ok && isMounted) {
          setIsAuthenticated(true)
        }
      } catch {
        // Not authenticated
      } finally {
        if (isMounted) setCheckingSession(false)
      }
    }
    checkSession()
    return () => { isMounted = false }
  }, [])

  // Lockout countdown timer
  useEffect(() => {
    if (lockoutSec <= 0) return
    const timer = setInterval(() => {
      setLockoutSec((prev) => (prev > 0 ? prev - 1 : 0))
    }, 1000)
    return () => clearInterval(timer)
  }, [lockoutSec])

  const handleLogin = async (e) => {
    e.preventDefault()
    if (!password || loginLoading || lockoutSec > 0) return

    setLoginLoading(true)
    setLoginError('')

    try {
      const res = await fetch(`${SERVER_URL}/api/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ password }),
      })

      const data = await res.json()

      if (res.ok && data.success) {
        setIsAuthenticated(true)
        setPassword('')
        setLoginError('')
      } else {
        if (res.status === 429 && data.remainingSec) {
          setLockoutSec(data.remainingSec)
        }
        setLoginError(data.error || 'Authentication failed. Please verify credentials.')
      }
    } catch {
      setLoginError('Unable to reach server. Please check your network connection.')
    } finally {
      setLoginLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      await fetch(`${SERVER_URL}/api/admin/logout`, {
        method: 'POST',
        credentials: 'include',
      })
    } catch {
      // ignore
    }
    setIsAuthenticated(false)
  }

  return (
    <div className="page page-enter" style={{ background: 'var(--bg-0)' }}>
      {/* Strictly noindex */}
      <SEOHead
        title="Admin Portal — Miloo"
        description="Internal administrative portal."
        noindex={true}
      />

      <Navbar theme={theme} onToggleTheme={onToggleTheme} />

      <main className="container" style={{ paddingTop: 36, paddingBottom: 64, maxWidth: 1080 }}>
        <header style={{ marginBottom: 32, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>
              Internal Safety Tooling
            </div>
            <h1 style={{ margin: 0, fontFamily: 'var(--font-display)', fontSize: '32px', color: 'var(--text-1)' }}>
              Moderation & Report Review
            </h1>
          </div>
          {isAuthenticated && (
            <button
              onClick={handleLogout}
              style={{
                padding: '8px 16px',
                borderRadius: 'var(--radius-pill)',
                border: '1px solid var(--border-1)',
                background: 'var(--surface-1)',
                color: 'var(--text-2)',
                cursor: 'pointer',
                fontSize: 13,
              }}
            >
              Sign Out
            </button>
          )}
        </header>

        {checkingSession ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-3)' }}>
            Verifying administrative authorization…
          </div>
        ) : !isAuthenticated ? (
          <div className="content-card" style={{ maxWidth: 440, margin: '40px auto', textAlign: 'center', padding: '32px 24px' }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>🛡️</div>
            <h2 style={{ margin: '0 0 10px', fontSize: 20, fontFamily: 'var(--font-display)', color: 'var(--text-1)' }}>
              Admin Access Required
            </h2>
            <p style={{ margin: '0 0 20px', fontSize: 14, color: 'var(--text-2)' }}>
              Enter administrator password to access the safety moderation portal.
            </p>
            <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <input
                type="password"
                required
                disabled={loginLoading || lockoutSec > 0}
                placeholder={lockoutSec > 0 ? `Locked out (${lockoutSec}s)` : "Administrator Password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{
                  padding: '12px 14px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-1)',
                  background: 'var(--bg-0)',
                  color: 'var(--text-1)',
                  fontSize: 14,
                  outline: 'none',
                }}
              />
              <button
                type="submit"
                disabled={loginLoading || lockoutSec > 0}
                style={{
                  padding: '12px',
                  borderRadius: 'var(--radius-sm)',
                  border: 'none',
                  background: lockoutSec > 0 ? 'var(--text-3)' : 'var(--accent)',
                  color: '#fff',
                  fontWeight: 600,
                  fontSize: 14,
                  cursor: lockoutSec > 0 ? 'not-allowed' : 'pointer',
                  opacity: loginLoading ? 0.7 : 1,
                }}
              >
                {loginLoading ? 'Verifying…' : lockoutSec > 0 ? `Locked Out (${lockoutSec}s)` : 'Sign In'}
              </button>
            </form>
            {loginError && (
              <div style={{ marginTop: 14, fontSize: 13, color: 'var(--danger)', lineHeight: 1.4 }}>
                {loginError}
              </div>
            )}
          </div>
        ) : (
          <Suspense fallback={<div style={{ textAlign: 'center', padding: 48, color: 'var(--text-3)' }}>Loading moderation tooling…</div>}>
            <AdminModerationPortal onLogout={handleLogout} />
          </Suspense>
        )}
      </main>

      <Footer />
    </div>
  )
}
