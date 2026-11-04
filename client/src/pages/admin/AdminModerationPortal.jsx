import { useState, useEffect } from 'react'

const SERVER_URL = import.meta.env.VITE_SERVER_URL || ''

export default function AdminModerationPortal({ onLogout }) {
  const [activeView, setActiveView] = useState('reports') // 'reports' | 'metrics'
  const [reports, setReports] = useState([])
  const [filter, setFilter] = useState('all')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [bannedCount, setBannedCount] = useState(0)
  const [metrics, setMetrics] = useState(null)

  const fetchReports = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`${SERVER_URL}/api/admin/reports`, {
        credentials: 'include',
      })
      if (!res.ok) {
        if (res.status === 401) {
          onLogout?.()
          return
        }
        throw new Error('Failed to retrieve moderation reports.')
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

  const fetchMetrics = async () => {
    try {
      const res = await fetch(`${SERVER_URL}/api/admin/metrics`, {
        credentials: 'include',
      })
      if (res.ok) {
        const data = await res.json()
        setMetrics(data)
      }
    } catch {
      // ignore
    }
  }

  useEffect(() => {
    fetchReports()
    fetchMetrics()
  }, [])

  const handleAction = async (reportId, action) => {
    try {
      const res = await fetch(`${SERVER_URL}/api/admin/reports/${reportId}/action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ action }),
      })
      if (!res.ok) throw new Error('Failed to apply moderation action.')
      fetchReports()
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
    <div>
      {/* Top View Toggle */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 24, borderBottom: '1px solid var(--border-1)', paddingBottom: 12 }}>
        <button
          type="button"
          onClick={() => setActiveView('reports')}
          style={{
            padding: '8px 18px',
            borderRadius: 'var(--radius-pill)',
            border: 'none',
            background: activeView === 'reports' ? 'var(--accent)' : 'transparent',
            color: activeView === 'reports' ? '#ffffff' : 'var(--text-2)',
            fontFamily: 'var(--font-body)',
            fontSize: 14,
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          Moderation Queue ({reports.length})
        </button>
        <button
          type="button"
          onClick={() => { setActiveView('metrics'); fetchMetrics(); }}
          style={{
            padding: '8px 18px',
            borderRadius: 'var(--radius-pill)',
            border: 'none',
            background: activeView === 'metrics' ? 'var(--accent)' : 'transparent',
            color: activeView === 'metrics' ? '#ffffff' : 'var(--text-2)',
            fontFamily: 'var(--font-body)',
            fontSize: 14,
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          Funnel & Matching Metrics
        </button>
      </div>

      {activeView === 'metrics' ? (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <h2 style={{ fontSize: 20, margin: 0, color: 'var(--text-1)', fontFamily: 'var(--font-display)' }}>
              Server-Side Anonymous Metrics
            </h2>
            <div style={{ display: 'flex', gap: 10 }}>
              <button
                type="button"
                onClick={fetchMetrics}
                style={{
                  padding: '8px 16px',
                  borderRadius: 'var(--radius-pill)',
                  border: '1px solid var(--border-1)',
                  background: 'var(--surface-1)',
                  color: 'var(--text-2)',
                  fontSize: 13,
                  cursor: 'pointer',
                }}
              >
                ↻ Refresh
              </button>
              <a
                href={`${SERVER_URL}/api/admin/metrics/export.csv`}
                download="miloo-metrics.csv"
                style={{
                  padding: '8px 16px',
                  borderRadius: 'var(--radius-pill)',
                  background: 'var(--accent)',
                  color: '#ffffff',
                  textDecoration: 'none',
                  fontSize: 13,
                  fontWeight: 600,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                <span>↓</span>
                <span>Export CSV</span>
              </a>
            </div>
          </div>

          {!metrics ? (
            <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-3)' }}>Loading metrics…</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {/* Funnel Overview Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14 }}>
                <div className="content-card" style={{ padding: '16px 18px' }}>
                  <div style={{ fontSize: 12, color: 'var(--text-3)', marginBottom: 4 }}>Human Matches</div>
                  <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-1)' }}>{metrics.totalMatches}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 4 }}>Median wait: {metrics.medianWaitSeconds}s</div>
                </div>
                <div className="content-card" style={{ padding: '16px 18px' }}>
                  <div style={{ fontSize: 12, color: 'var(--text-3)', marginBottom: 4 }}>Matched in &le; 15s</div>
                  <div style={{ fontSize: 22, fontWeight: 700, color: '#10b981' }}>{metrics.matchedWithin15sPct}%</div>
                  <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 4 }}>&le; 30s: {metrics.matchedWithin30sPct}% | &le; 60s: {metrics.matchedWithin60sPct}%</div>
                </div>
                <div className="content-card" style={{ padding: '16px 18px' }}>
                  <div style={{ fontSize: 12, color: 'var(--text-3)', marginBottom: 4 }}>Wait Timeouts (60s)</div>
                  <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--warning)' }}>{metrics.waitTimeouts}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 4 }}>Honest card shown</div>
                </div>
                <div className="content-card" style={{ padding: '16px 18px' }}>
                  <div style={{ fontSize: 12, color: 'var(--text-3)', marginBottom: 4 }}>Concurrent Users</div>
                  <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--accent)' }}>{metrics.concurrentUsers.current}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 4 }}>Peak all-time: {metrics.concurrentUsers.peak}</div>
                </div>
              </div>

              {/* Sessions Requested per Day & Mode */}
              <div className="content-card" style={{ padding: 18 }}>
                <h3 style={{ fontSize: 15, margin: '0 0 12px', color: 'var(--text-1)' }}>Sessions Requested (Per Day & Mode)</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 10 }}>
                  {Object.entries(metrics.sessionsRequested || {}).map(([day, count]) => (
                    <div key={day} style={{ padding: '10px 12px', background: 'var(--bg-0)', borderRadius: 'var(--radius-sm)' }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-1)' }}>{day}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-2)', marginTop: 4 }}>
                        Text: <strong>{count.text || 0}</strong> | Video: <strong>{count.video || 0}</strong>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Chat Duration Buckets & Ended By */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
                <div className="content-card" style={{ padding: 18 }}>
                  <h3 style={{ fontSize: 15, margin: '0 0 12px', color: 'var(--text-1)' }}>Chat Length Buckets</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {Object.entries(metrics.chatLengthBuckets || {}).map(([b, val]) => (
                      <div key={b} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                        <span style={{ color: 'var(--text-2)' }}>{b}</span>
                        <strong style={{ color: 'var(--text-1)' }}>{val}</strong>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="content-card" style={{ padding: 18 }}>
                  <h3 style={{ fontSize: 15, margin: '0 0 12px', color: 'var(--text-1)' }}>Ended By</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {Object.entries(metrics.endedBy || {}).map(([reason, val]) => (
                      <div key={reason} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                        <span style={{ color: 'var(--text-2)', textTransform: 'capitalize' }}>{reason}</span>
                        <strong style={{ color: 'var(--text-1)' }}>{val}</strong>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 28 }}>
            <div className="content-card" style={{ padding: '16px 20px' }}>
              <div style={{ fontSize: 13, color: 'var(--text-3)', marginBottom: 4 }}>Total Reports</div>
              <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--text-1)' }}>{reports.length}</div>
            </div>
            <div className="content-card" style={{ padding: '16px 20px' }}>
              <div style={{ fontSize: 13, color: 'var(--text-3)', marginBottom: 4 }}>Pending Review</div>
              <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--warning)' }}>
                {reports.filter((r) => r.status === 'pending').length}
              </div>
            </div>
            <div className="content-card" style={{ padding: '16px 20px' }}>
              <div style={{ fontSize: 13, color: 'var(--text-3)', marginBottom: 4 }}>Sanctioned Identities</div>
              <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--danger)' }}>{bannedCount}</div>
            </div>
          </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', gap: 8 }}>
          {['all', 'pending', 'banned', 'dismissed'].map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              style={{
                padding: '6px 14px',
                borderRadius: 'var(--radius-pill)',
                border: '1px solid',
                borderColor: filter === tab ? 'var(--accent)' : 'var(--border-1)',
                background: filter === tab ? 'var(--accent)' : 'transparent',
                color: filter === tab ? '#fff' : 'var(--text-2)',
                fontSize: 13,
                fontWeight: filter === tab ? 600 : 400,
                textTransform: 'capitalize',
                cursor: 'pointer',
              }}
            >
              {tab} ({tab === 'all' ? reports.length : reports.filter((r) => tab === 'banned' ? (r.status === 'banned' || r.status === 'suspended') : r.status === tab).length})
            </button>
          ))}
        </div>
        <button
          onClick={fetchReports}
          style={{
            padding: '6px 14px',
            borderRadius: 'var(--radius-pill)',
            border: '1px solid var(--border-1)',
            background: 'var(--surface-1)',
            color: 'var(--text-2)',
            fontSize: 13,
            cursor: 'pointer',
          }}
        >
          {loading ? 'Refreshing…' : '↻ Refresh Data'}
        </button>
      </div>

      {error && (
        <div style={{ padding: '12px 16px', background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', borderRadius: 'var(--radius-sm)', marginBottom: 20, fontSize: 14 }}>
          {error}
        </div>
      )}

      {loading && reports.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-3)' }}>Loading moderation feed…</div>
      ) : filteredReports.length === 0 ? (
        <div className="content-card" style={{ textAlign: 'center', padding: 48, color: 'var(--text-3)' }}>
          No reports match this filter criteria.
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
                gap: 10,
                borderLeft: rep.status === 'pending' ? '4px solid var(--warning)' : rep.status === 'banned' ? '4px solid var(--danger)' : '1px solid var(--border-1)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 8 }}>
                <div>
                  <span style={{ fontWeight: 700, fontSize: 15, color: 'var(--text-1)' }}>
                    Violation: {rep.reason}
                  </span>
                  <span style={{ fontSize: 12, color: 'var(--text-3)', marginLeft: 10 }}>
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
                {rep.sessionId && (
                  <span style={{ marginLeft: 12, fontSize: 13, color: 'var(--text-3)' }}>
                    Session ID: <code>{rep.sessionId}</code>
                  </span>
                )}
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
                  <strong>Notes:</strong> {rep.context}
                </div>
              )}

              {Array.isArray(rep.recentMessages) && rep.recentMessages.length > 0 && (
                <details style={{ fontSize: 12, color: 'var(--text-2)' }}>
                  <summary style={{ cursor: 'pointer', fontWeight: 600, color: 'var(--accent)', marginBottom: 6 }}>
                    View Last {rep.recentMessages.length} Messages in Session
                  </summary>
                  <div style={{ maxHeight: 180, overflowY: 'auto', background: 'var(--bg-0)', padding: 10, borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-1)', display: 'flex', flexDirection: 'column', gap: 4 }}>
                    {rep.recentMessages.map((msg, mIdx) => (
                      <div key={mIdx}>
                        <span style={{ color: 'var(--text-3)' }}>[{msg.from === rep.reportedUser ? 'Reported' : 'Sender'}]: </span>
                        <span>{typeof msg === 'string' ? msg : msg.text || JSON.stringify(msg)}</span>
                      </div>
                    ))}
                  </div>
                </details>
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
        </>
      )}
    </div>
  )
}

