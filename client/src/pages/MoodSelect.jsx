// client/src/pages/MoodSelect.jsx
//
// Mood & mode selector with honest copy and editorial styling.

import { useState } from 'react'
import Navbar from '../components/Navbar'
import useCanonical from '../hooks/useCanonical'
import { trackEvent } from '../utils/analytics'

const moods = [
  { id: 'deep', emoji: '🧠', label: 'Deep Talk', desc: 'Meaningful, thoughtful conversation' },
  { id: 'laugh', emoji: '😂', label: 'Just Laugh', desc: 'Light, fun, no pressure' },
  { id: 'vent', emoji: '😤', label: 'Vent', desc: 'Get it off your chest' },
  { id: 'gaming', emoji: '🎮', label: 'Gaming', desc: 'Gaming talk' },
  { id: 'music', emoji: '🎵', label: 'Music', desc: 'Share what you love' },
  { id: 'culture', emoji: '🌍', label: 'Culture', desc: 'Explore the world' },
  { id: 'any', emoji: '✨', label: 'Surprise me', desc: 'Open to anything' },
]

const CHAT_MODES = [
  { id: 'text', label: 'Text Chat', sub: 'Instant messages. No camera.' },
  { id: 'video', label: 'Video Chat', sub: 'Face-to-face live stream.' },
]

export default function MoodSelect({ onContinue, theme, onToggleTheme }) {
  useCanonical('https://www.miloo.chat/mood')
  const [selectedMood, setSelectedMood] = useState('any')
  const [chatMode, setChatMode] = useState('text')

  function handleContinue() {
    trackEvent('mood_selected', { mood: selectedMood })
    trackEvent('chat_mode_selected', { mode: chatMode })
    onContinue({ mood: selectedMood, intent: 'random', safeMode: false, chatMode })
  }

  return (
    <div className="page page-enter" style={{ background: 'var(--rd-bg)', position: 'relative', overflow: 'hidden' }}>
      <div className="grain-overlay" aria-hidden="true" />
      <div className="ambient-light" aria-hidden="true" />

      <Navbar theme={theme} onToggleTheme={onToggleTheme} />

      <main
        className="container"
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          maxWidth: 640,
          width: '100%',
          paddingTop: 'clamp(28px, 4.5vh, 48px)',
          paddingBottom: 'clamp(32px, 5vh, 56px)',
          position: 'relative',
          zIndex: 2,
        }}
      >
        {/* Editorial Left-Aligned Header */}
        <header style={{ textAlign: 'left', marginBottom: 'clamp(24px, 3.5vh, 36px)' }}>
          <h1
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(32px, 4.5vw, 48px)',
              fontWeight: 400,
              letterSpacing: '-0.02em',
              lineHeight: 1.1,
              color: 'var(--rd-text-1)',
              marginBottom: 12,
            }}
          >
            What's your vibe?
          </h1>
          <p
            style={{
              color: 'var(--rd-text-2)',
              fontSize: 'clamp(15px, 1.6vw, 17px)',
              lineHeight: 1.5,
              maxWidth: 440,
              margin: 0,
            }}
          >
            Pick a mood to set the tone.
          </p>
        </header>

        {/* ── Mode Selection ── */}
        <section style={{ marginBottom: 'clamp(24px, 3.5vh, 32px)' }}>
          <p
            style={{
              color: 'var(--rd-text-3)',
              fontSize: 12,
              fontWeight: 600,
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
              marginBottom: 12,
              fontFamily: 'var(--font-body)',
            }}
          >
            Mode
          </p>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: 12,
            }}
          >
            {CHAT_MODES.map((m) => {
              const active = chatMode === m.id
              return (
                <button
                  key={m.id}
                  onClick={() => setChatMode(m.id)}
                  style={{
                    textAlign: 'left',
                    padding: '16px 20px',
                    borderRadius: active ? '28px 28px 12px 12px' : '12px',
                    cursor: 'pointer',
                    background: active ? 'var(--rd-accent)' : 'var(--rd-surface)',
                    color: active ? '#121110' : 'var(--rd-text-1)',
                    border: active ? '1px solid var(--rd-accent)' : '1px solid var(--border-1)',
                    transition: 'all 200ms ease-out',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 4,
                  }}
                >
                  <div
                    style={{
                      fontFamily: 'var(--font-body)',
                      fontWeight: 600,
                      fontSize: 16,
                      color: active ? '#121110' : 'var(--rd-text-1)',
                    }}
                  >
                    {m.label}
                  </div>
                  <div
                    style={{
                      fontSize: 13,
                      color: active ? 'rgba(18, 17, 16, 0.82)' : 'var(--rd-text-2)',
                    }}
                  >
                    {m.sub}
                  </div>
                </button>
              )
            })}
          </div>
        </section>

        {/* ── Mood Selection ── */}
        <section style={{ flex: 1, marginBottom: 'clamp(28px, 4vh, 36px)' }}>
          <p
            style={{
              color: 'var(--rd-text-3)',
              fontSize: 12,
              fontWeight: 600,
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
              marginBottom: 12,
              fontFamily: 'var(--font-body)',
            }}
          >
            Topic
          </p>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
            }}
          >
            {moods.map((m) => {
              const active = selectedMood === m.id
              return (
                <button
                  key={m.id}
                  onClick={() => setSelectedMood(m.id)}
                  style={{
                    textAlign: 'left',
                    padding: '14px 18px',
                    borderRadius: '12px',
                    cursor: 'pointer',
                    background: active ? 'var(--rd-surface-hover)' : 'transparent',
                    border: active ? '1px solid var(--rd-accent)' : '1px solid var(--border-1)',
                    transition: 'all 180ms ease-out',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 16,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span style={{ fontSize: 18, lineHeight: 1 }} aria-hidden="true">
                      {m.emoji}
                    </span>
                    <div>
                      <div
                        style={{
                          fontWeight: 500,
                          fontSize: 15,
                          color: active ? 'var(--rd-accent)' : 'var(--rd-text-1)',
                          fontFamily: 'var(--font-body)',
                        }}
                      >
                        {m.label}
                      </div>
                      <div
                        style={{
                          fontSize: 13,
                          color: 'var(--rd-text-2)',
                          marginTop: 2,
                        }}
                      >
                        {m.desc}
                      </div>
                    </div>
                  </div>
                  <div
                    style={{
                      width: 18,
                      height: 18,
                      borderRadius: '50%',
                      border: active ? '5px solid var(--rd-accent)' : '1.5px solid var(--rd-text-3)',
                      background: active ? 'var(--rd-bg)' : 'transparent',
                      flexShrink: 0,
                      transition: 'all 180ms ease-out',
                    }}
                  />
                </button>
              )
            })}
          </div>
        </section>

        {/* ── Start CTA ── */}
        <div style={{ marginTop: 'auto' }}>
          <button
            onClick={handleContinue}
            style={{
              width: '100%',
              padding: '16px 24px',
              fontSize: 16,
              fontWeight: 600,
              fontFamily: 'var(--font-body)',
              color: '#ffffff',
              background: 'var(--rd-accent)',
              border: 'none',
              borderRadius: 'var(--radius-pill)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              minHeight: 48,
              transition: 'transform 180ms ease-out, opacity 180ms ease-out',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.92')}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
          >
            Start chatting
            <span aria-hidden="true">→</span>
          </button>
        </div>
      </main>
    </div>
  )
}
