import { useState } from 'react'
import { trackEvent } from '../utils/analytics'

const REASONS = [
  { id: 'harassment', label: 'Harassment or Bullying', desc: 'Targeted insults, offensive slurs, or aggressive behavior' },
  { id: 'nudity', label: 'Nudity or Sexual Misconduct', desc: 'Genital exposure, masturbation, or sexually explicit video' },
  { id: 'spam', label: 'Spam, Ads, or Bot Behavior', desc: 'Automated messages, repetitive links, or commercial promotion' },
  { id: 'threats', label: 'Threats or Violence', desc: 'Threats of physical harm, doxxing, or blackmail' },
  { id: 'scam', label: 'Scam or Fraud', desc: 'Emergency money requests, fake investment bots, or phishing' },
  { id: 'other', label: 'Other Violation', desc: 'Other behavior violating community guidelines' },
]

const SERVER_URL = import.meta.env.VITE_SERVER_URL || ''

export default function ReportModal({ isOpen, onClose, reportedUser, onBlockAndNext, sessionId, recentMessages = [] }) {
  const [selectedReason, setSelectedReason] = useState('harassment')
  const [notes, setNotes] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  if (!isOpen) return null

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')

    try {
      trackEvent('report_clicked', { reason: selectedReason })
    } catch (_) {}

    try {
      const res = await fetch(`${SERVER_URL}/api/reports`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reportedUser: reportedUser || 'unknown_partner',
          reason: selectedReason,
          context: notes,
          sessionId: sessionId || '',
          recentMessages: Array.isArray(recentMessages) ? recentMessages.slice(-20) : [],
        }),
      })

      if (!res.ok) {
        throw new Error('Failed to submit report. Please try again.')
      }

      setSubmitted(true)
    } catch (err) {
      setError(err.message || 'Error submitting report.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleReset = () => {
    setSubmitted(false)
    setNotes('')
    setSelectedReason('harassment')
    onClose()
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="report-modal-title"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
        background: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
      }}
    >
      <div
        className="content-card"
        style={{
          width: 'min(100%, 500px)',
          background: 'var(--bg-1)',
          border: '1px solid var(--border-2)',
          borderRadius: 'var(--radius-xl)',
          boxShadow: 'var(--shadow)',
          padding: 'clamp(20px, 3.5vw, 32px)',
          display: 'flex',
          flexDirection: 'column',
          gap: 18,
          maxHeight: '90vh',
          overflowY: 'auto',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 22 }}>🚩</span>
            <h3 id="report-modal-title" style={{ margin: 0, fontFamily: 'var(--font-display)', fontSize: 20, color: 'var(--text-1)' }}>
              Report Abusive User
            </h3>
          </div>
          <button
            type="button"
            onClick={handleReset}
            aria-label="Close"
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-3)',
              cursor: 'pointer',
              fontSize: 20,
              padding: 4,
            }}
          >
            ✕
          </button>
        </div>

        {submitted ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, textAlign: 'center', padding: '16px 0' }}>
            <div style={{ fontSize: 36, color: 'var(--success)' }}>✓</div>
            <h4 style={{ margin: 0, fontSize: 18, color: 'var(--text-1)' }}>
              Report Successfully Submitted
            </h4>
            <p style={{ margin: 0, fontSize: 14, lineHeight: 1.6, color: 'var(--text-2)' }}>
              Thank you for keeping Miloo safe. Our moderation team has logged this incident. Would you like to block this user and move to the next person?
            </p>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap', marginTop: 8 }}>
              <button
                type="button"
                onClick={handleReset}
                style={{
                  padding: '10px 18px',
                  borderRadius: 'var(--radius-pill)',
                  border: '1px solid var(--border-1)',
                  background: 'var(--surface-1)',
                  color: 'var(--text-2)',
                  fontSize: 14,
                  cursor: 'pointer',
                }}
              >
                Close Window
              </button>
              {onBlockAndNext && (
                <button
                  type="button"
                  onClick={() => {
                    handleReset()
                    onBlockAndNext()
                  }}
                  style={{
                    padding: '10px 22px',
                    borderRadius: 'var(--radius-pill)',
                    border: 'none',
                    background: 'var(--danger)',
                    color: '#ffffff',
                    fontSize: 14,
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Block User & Skip to Next →
                </button>
              )}
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <p style={{ margin: 0, fontSize: 14, color: 'var(--text-2)', lineHeight: 1.5 }}>
              Select the reason for reporting this partner. Reports are reviewed to apply warnings, suspensions, and permanent bans.
            </p>

            {error && (
              <div
                style={{
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-md)',
                  background: 'rgba(220, 38, 38, 0.15)',
                  border: '1px solid var(--danger)',
                  color: '#f87171',
                  fontSize: 13,
                }}
              >
                {error}
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {REASONS.map((r) => {
                const isSelected = selectedReason === r.id
                return (
                  <label
                    key={r.id}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: 12,
                      padding: '10px 12px',
                      borderRadius: 'var(--radius-md)',
                      background: isSelected ? 'var(--accent-dim)' : 'var(--surface-1)',
                      border: `1px solid ${isSelected ? 'var(--accent)' : 'var(--border-1)'}`,
                      cursor: 'pointer',
                      transition: 'all 150ms ease',
                    }}
                  >
                    <input
                      type="radio"
                      name="reportReason"
                      value={r.id}
                      checked={isSelected}
                      onChange={() => setSelectedReason(r.id)}
                      style={{ marginTop: 3, accentColor: 'var(--accent)' }}
                    />
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-1)' }}>{r.label}</span>
                      <span style={{ fontSize: 12, color: 'var(--text-3)' }}>{r.desc}</span>
                    </div>
                  </label>
                )
              })}
            </div>

            <div>
              <label
                htmlFor="report-notes"
                style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-2)', marginBottom: 6 }}
              >
                Additional Details (Optional)
              </label>
              <textarea
                id="report-notes"
                rows={3}
                placeholder="Briefly describe what happened..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--bg-0)',
                  border: '1px solid var(--border-1)',
                  color: 'var(--text-1)',
                  fontSize: 13,
                  outline: 'none',
                  resize: 'vertical',
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', paddingTop: 6 }}>
              <button
                type="button"
                onClick={handleReset}
                disabled={submitting}
                style={{
                  padding: '10px 18px',
                  borderRadius: 'var(--radius-pill)',
                  border: '1px solid var(--border-1)',
                  background: 'transparent',
                  color: 'var(--text-2)',
                  fontSize: 14,
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                style={{
                  padding: '10px 22px',
                  borderRadius: 'var(--radius-pill)',
                  border: 'none',
                  background: 'var(--danger)',
                  color: '#ffffff',
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: 'pointer',
                  opacity: submitting ? 0.6 : 1,
                }}
              >
                {submitting ? 'Submitting...' : 'Submit Report'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
