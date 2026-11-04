import { useState } from 'react'
import { trackEvent } from '../utils/analytics'

export default function SendBirdButton({ style = {}, label = 'Send a bird', variant = 'default' }) {
  const [copied, setCopied] = useState(false)

  const handleShare = async () => {
    trackEvent('share_click')
    const shareData = {
      title: 'Miloo — Meet a real stranger',
      text: 'Someone out there wants to talk.',
      url: 'https://miloo.chat/?ref=share',
    }

    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share(shareData)
        return
      } catch (err) {
        if (err.name === 'AbortError') return
      }
    }

    // Fallback: copy to clipboard
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText('https://miloo.chat/?ref=share')
        setCopied(true)
        setTimeout(() => setCopied(false), 2400)
      }
    } catch (_) {
      // ignore
    }
  }

  return (
    <button
      type="button"
      onClick={handleShare}
      aria-label="Send a bird: share Miloo link with a friend"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '8px',
        padding: variant === 'small' ? '6px 14px' : '10px 20px',
        borderRadius: 'var(--radius-pill)',
        background: 'var(--surface-1)',
        border: '1.5px solid var(--border-2)',
        color: 'var(--text-1)',
        fontFamily: "var(--font-hand), 'Caveat', cursive, sans-serif",
        fontSize: variant === 'small' ? '18px' : '20px',
        fontWeight: 600,
        cursor: 'pointer',
        boxShadow: '2px 2px 0 rgba(26, 26, 26, 0.15)',
        transition: 'transform 0.15s ease, background-color 0.15s ease',
        ...style,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-1px)'
        e.currentTarget.style.backgroundColor = 'var(--surface-2)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'none'
        e.currentTarget.style.backgroundColor = 'var(--surface-1)'
      }}
    >
      <span aria-hidden="true" style={{ fontSize: '18px' }}>🕊️</span>
      <span>{copied ? 'Link copied to perch!' : label}</span>
    </button>
  )
}

