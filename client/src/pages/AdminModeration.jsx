import { useState, useEffect } from 'react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import SEOHead from '../components/SEOHead'

const SERVER_URL = import.meta.env.VITE_SERVER_URL || ''

export default function AdminModeration({ theme, onToggleTheme }) {
  const [token, setToken] = useState(() => {
    try {
      return sessionStorage.getItem('miloo_admin_token') || ''
    } catch {
      return ''
    }
  })
  const [inputToken, setInputToken] = useState('')
  const [reports, setReports] = useState([])
  const [filter, setFilter] = useState('all')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [bannedCount, setBannedCount] = useState(0)

  const fetchReports = async (authToken) => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`${SERVER_URL}/api/admin/reports?token=${encodeURIComponent(authToken)}`)
      if (!res.ok) {
        throw new Error('Invalid administrative token or unauthorized access.')
      }
      const data = await res.json()
      setReports(data.reports || [])
      setBannedCount(data.bannedCount || 0)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (token) {
      fetchReports(token)
    }
  }, [token])

  const handleLogin = (e) => {
    e.preventDefault()
    if (!inputToken.trim()) return
    sessionStorage.setItem('miloo_admin_token', inputToken.trim())
    setToken(inputToken.trim())
  }

  const handleLogout = () => {
    sessionStorage.removeItem('miloo_admin_token')
    setToken('')
    setReports([])
  }

  const handleAction = async (reportId, action) => {
    try {
      const res = await fetch(`${SERVER_URL}/api/admin/reports/${reportId}/action?token=${encodeURIComponent(token)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      })
      if (!res.ok) throw new Error('Failed to apply moderation action.')
      // Refresh list
      fetchReports(token)
    } catch (err) {
      alert(err.message)
    }
  }

  const filteredReports = reports.filter((r) => {
    if (filter === 'all') return true
    if (filter === 'pending') return r.status === 'pending'
    if (filter === 'banned') return r.status === 'banned' || r.status === 'suspended'
    if (filter === 'dismissed') return r.status === 'dismissed'
    return true
  })

  return (
    <div className="page page-enter" style={{ background: 'var(--bg-0)' }}>
      {/* Set noindex on admin page */}
      <SEOHead
        title="Admin Moderation Portal — Miloo"
        description="Internal moderation and safety dashboard for review of user reports."
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
          {token && (
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

        {!token ? (
          <div className="content-card" style={{ maxWidth: 440, margin: '40px auto', textAlign: 'center' }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>🛡️</div>
            <h2 style={{ margin: '0 0 10px', fontSize: 20, fontFamily: 'var(--font-display)', color: 'var(--text-1)' }}>
              Admin Access Required
            </h2>
            <p style={{ margin: '0 0 20px', fontSize: 14, color: 'var(--text-2)' }}>
              Enter your administrative secret token to access the safety moderation portal.
            </p>
            <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <input
                type="password"
                required
                placeholder="Admin Secret Token"
                value={inputToken}
                onChange={(e) => setInputToken(e.target.value)}
                style={{
                  padding: '12px 14px',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--bg-0)',
                  border: '1px solid var(--border-2)',
                  color: 'var(--text-1)',
                  fontSize: 14,
                  outline: 'none',
                }}
              />
              <button
                type="submit"
                style={{
                  padding: '12px',
                  borderRadius: 'var(--radius-pill)',
                  background: 'var(--accent)',
                  color: '#fff',
                  border: 'none',
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Authenticate & Access Dashboard →
              </button>
            </form>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {/* Stats Bar */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                gap: 16,
              }}
            >
              <div className="content-card" style={{ padding: '16px 20px' }}>
                <div style={{ fontSize: 12, color: 'var(--text-3)', textTransform: 'uppercase' }}>Total Reports</div>
                <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--text-1)', marginTop: 4 }}>{reports.length}</div>
              </div>
              <div className="content-card" style={{ padding: '16px 20px' }}>
                <div style={{ fontSize: 12, color: 'var(--text-3)', textTransform: 'uppercase' }}>Pending Review</div>
                <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--warning)', marginTop: 4 }}>
                  {reports.filter((r) => r.status === 'pending').length}
                </div>
              </div>
              <div className="content-card" style={{ padding: '16px 20px' }}>
                <div style={{ fontSize: 12, color: 'var(--text-3)', textTransform: 'uppercase' }}>Banned Identities</div>
                <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--danger)', marginTop: 4 }}>{bannedCount}</div>
              </div>
            </div>

            {/* Filter Tabs */}
            <div style={{ display: 'flex', gap: 10, borderBottom: '1px solid var(--border-1)', paddingBottom: 12 }}>
              {['all', 'pending', 'banned', 'dismissed'].map((t) => (
                <button
                  key={t}
                  onClick={() => setFilter(t)}
                  style={{
                    padding: '6px 14px',
                    borderRadius: 'var(--radius-pill)',
                    border: 'none',
                    background: filter === t ? 'var(--accent-dim)' : 'transparent',
                    color: filter === t ? 'var(--accent)' : 'var(--text-2)',
                    fontWeight: filter === t ? 600 : 500,
                    fontSize: 13,
                    cursor: 'pointer',
                    textTransform: 'capitalize',
                  }}
                >
                  {t}
                </button>
              ))}
            </div>

            {loading ? (
              <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-2)' }}>Loading reports...</div>
            ) : filteredReports.length === 0 ? (
              <div className="content-card" style={{ textAlign: 'center', padding: 48, color: 'var(--text-3)' }}>
                No reports matching filter "{filter}".
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {filteredReports.map((rep) => (
                  <div
                    key={rep.id}
                    className="content-card"
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 12,
                      borderLeft: `4px solid ${
                        rep.status === 'pending'
                          ? 'var(--warning)'
                          : rep.status === 'banned'
                          ? 'var(--danger)'
                          : 'var(--border-2)'
                      }`,
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 8 }}>
                      <div>
                        <span
                          style={{
                            fontSize: 11,
                            fontWeight: 700,
                            padding: '3px 8px',
                            borderRadius: 'var(--radius-pill)',
                            background: 'var(--surface-2)',
                            color: 'var(--text-1)',
                            textTransform: 'uppercase',
                            marginRight: 8,
                          }}
                        >
                          {rep.reason}
                        </span>
                        <span style={{ fontSize: 13, color: 'var(--text-3)' }}>
                          {new Date(rep.timestamp).toLocaleString()}
                        </span>
                      </div>
                      <span
                        style={{
                          fontSize: 12,
                          fontWeight: 600,
                          color: rep.status === 'pending' ? 'var(--warning)' : rep.status === 'banned' ? 'var(--danger)' : 'var(--text-3)',
                          textTransform: 'capitalize',
                        }}
                      >
                        Status: {rep.status}
                      </span>
                    </div>

                    <div style={{ fontSize: 14, color: 'var(--text-2)' }}>
                      <strong>Reported Target:</strong> <code style={{ color: 'var(--accent)' }}>{rep.reportedUser}</code>
                    </div>

                    {rep.context && (
                      <div
                        style={{
                          background: 'var(--bg-0)',
                          padding: '8px 12px',
                          borderRadius: 'var(--radius-sm)',
                          fontSize: 13,
                          color: 'var(--text-2)',
                        }}
                      >
                        Context: {rep.context}
                      </div>
                    )}

                    <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', paddingTop: 8 }}>
                      <button
                        onClick={() => handleAction(rep.id, 'dismiss')}
                        style={{
                          padding: '6px 14px',
                          borderRadius: 'var(--radius-pill)',
                          border: '1px solid var(--border-1)',
                          background: 'transparent',
                          color: 'var(--text-2)',
                          fontSize: 13,
                          cursor: 'pointer',
                        }}
                      >
                        Dismiss
                      </button>
                      <button
                        onClick={() => handleAction(rep.id, 'warn')}
                        style={{
                          padding: '6px 14px',
                          borderRadius: 'var(--radius-pill)',
                          border: '1px solid var(--warning)',
                          background: 'rgba(217, 119, 6, 0.1)',
                          color: 'var(--warning)',
                          fontSize: 13,
                          cursor: 'pointer',
                        }}
                      >
                        Warn
                      </button>
                      <button
                        onClick={() => handleAction(rep.id, 'ban')}
                        style={{
                          padding: '6px 14px',
                          borderRadius: 'var(--radius-pill)',
                          border: 'none',
                          background: 'var(--danger)',
                          color: '#fff',
                          fontSize: 13,
                          fontWeight: 600,
                          cursor: 'pointer',
                        }}
                      >
                        Ban Identity
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      <Footer />
    </div>
  )
}
