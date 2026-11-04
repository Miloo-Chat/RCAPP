// client/src/components/watercolor/DevControls.jsx
//
// Developer Time Scrubber & Atmosphere Inspector.
// Hidden by default for all normal users.
// Shown ONLY when the URL has ?dev=1, as a tiny collapsible handle, collapsed by default.

import { useState, useEffect } from 'react'

const TIME_PRESETS = [
  { label: 'Dawn', hour: 6.2, icon: '🌅' },
  { label: 'Morning', hour: 9.0, icon: '🌤️' },
  { label: 'Noon (Default)', hour: 12.0, icon: '☀️' },
  { label: 'Afternoon', hour: 15.5, icon: '🌞' },
  { label: 'Sunset', hour: 18.3, icon: '🌇' },
  { label: 'Dusk', hour: 19.8, icon: '🌆' },
  { label: 'Night', hour: 23.0, icon: '🌙' },
]

export default function DevControls({
  hour,
  formattedTime,
  atmosphere,
  moonPhase,
  isAuto,
  onSetHour,
  onResetAuto,
  rainMode,
  onToggleRain,
  onReplayBloom,
}) {
  const [isDevEnabled, setIsDevEnabled] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)

  // Check if URL has ?dev=1
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search)
      if (params.get('dev') === '1') {
        setIsDevEnabled(true)
      }
    }
  }, [])

  // If not in dev mode (?dev=1), hide completely from UI
  if (!isDevEnabled) {
    return null
  }

  // Collapsed handle (tiny discreet button in corner)
  if (!isExpanded) {
    return (
      <button
        type="button"
        onClick={() => setIsExpanded(true)}
        title="Open Dev Time Scrubber (?dev=1)"
        aria-label="Open Dev Time Scrubber"
        style={{
          position: 'fixed',
          bottom: '12px',
          right: '12px',
          zIndex: 9999,
          background: atmosphere.isNight ? 'rgba(28, 36, 52, 0.75)' : 'rgba(255, 250, 242, 0.8)',
          border: `1px solid ${atmosphere.isNight ? 'rgba(150, 170, 200, 0.25)' : 'rgba(100, 80, 60, 0.2)'}`,
          borderRadius: '6px',
          padding: '3px 8px',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '5px',
          fontFamily: 'monospace',
          fontSize: '11px',
          color: atmosphere.textColor,
          cursor: 'pointer',
          opacity: 0.6,
          transition: 'opacity 0.2s ease',
        }}
      >
        <span>⚙</span>
        <span>dev ({formattedTime})</span>
      </button>
    )
  }

  // Expanded Scrubber Panel
  return (
    <div
      role="region"
      aria-label="Time-of-day Dev Controls"
      className="dev-controls-panel"
      style={{
        position: 'fixed',
        bottom: '16px',
        right: '16px',
        zIndex: 9999,
        width: 'min(360px, calc(100vw - 32px))',
        background: atmosphere.isNight ? 'rgba(20, 26, 40, 0.96)' : 'rgba(255, 252, 246, 0.97)',
        border: `1.5px solid ${atmosphere.isNight ? 'rgba(160, 180, 210, 0.35)' : 'rgba(90, 75, 60, 0.25)'}`,
        borderRadius: '12px',
        padding: '16px 18px',
        boxShadow: atmosphere.isNight
          ? '0 16px 40px rgba(0,0,0,0.6)'
          : '0 16px 36px rgba(120, 95, 65, 0.18)',
        backdropFilter: 'blur(8px)',
        color: atmosphere.textColor,
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        fontFamily: 'var(--font-serif)',
      }}
    >
      {/* ── HEADER & COLLAPSE ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '18px' }}>{atmosphere.isNight ? '🌙' : '☀️'}</span>
          <div>
            <div style={{ fontSize: '14px', fontWeight: 600, lineHeight: 1.1 }}>
              {atmosphere.phaseName} Theme
            </div>
            <div style={{ fontSize: '11px', opacity: 0.7, fontFamily: 'monospace' }}>
              {isAuto ? `Auto: ${formattedTime}` : `Manual: ${formattedTime}`}
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsExpanded(false)}
          aria-label="Collapse Dev Scrubber"
          style={{
            background: 'none',
            border: 'none',
            fontSize: '16px',
            color: atmosphere.textColor,
            cursor: 'pointer',
            padding: '4px',
            lineHeight: 1,
            opacity: 0.7,
          }}
        >
          ✕
        </button>
      </div>

      {/* ── 24-HOUR SCRUBBER SLIDER ── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', opacity: 0.7, fontFamily: 'monospace' }}>
          <span>00:00</span>
          <strong style={{ fontSize: '13px', color: 'var(--accent, #d95236)' }}>{formattedTime}</strong>
          <span>24:00</span>
        </div>

        <input
          type="range"
          min="0"
          max="24"
          step="0.05"
          value={hour}
          onChange={(e) => onSetHour?.(parseFloat(e.target.value))}
          aria-label="Time of day scrubber"
          style={{
            width: '100%',
            accentColor: 'var(--accent, #d95236)',
            cursor: 'pointer',
          }}
        />
      </div>

      {/* ── PRESET BUTTONS ── */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
        {TIME_PRESETS.map((p) => {
          const isSelected = Math.abs(hour - p.hour) < 0.6 && !isAuto
          return (
            <button
              key={p.label}
              type="button"
              onClick={() => onSetHour?.(p.hour)}
              style={{
                background: isSelected
                  ? 'var(--accent, #d95236)'
                  : (atmosphere.isNight ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)'),
                color: isSelected ? '#ffffff' : atmosphere.textColor,
                border: 'none',
                borderRadius: '5px',
                padding: '3px 7px',
                fontSize: '11px',
                cursor: 'pointer',
                fontFamily: 'var(--font-serif)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '3px',
              }}
            >
              <span>{p.icon}</span>
              <span>{p.label}</span>
            </button>
          )
        })}
      </div>

      {/* ── ACTION BUTTONS ── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '6px',
          paddingTop: '6px',
          borderTop: `1px solid ${atmosphere.isNight ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
        }}
      >
        <button
          type="button"
          onClick={isAuto ? () => onSetHour?.(hour) : onResetAuto}
          style={{
            background: isAuto
              ? 'var(--accent, #d95236)'
              : (atmosphere.isNight ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)'),
            color: isAuto ? '#ffffff' : atmosphere.textColor,
            border: 'none',
            borderRadius: '5px',
            padding: '5px 8px',
            fontSize: '11px',
            cursor: 'pointer',
            textAlign: 'center',
          }}
        >
          {isAuto ? '✓ Auto (Local)' : 'Switch to Auto'}
        </button>

        <button
          type="button"
          onClick={onReplayBloom}
          style={{
            background: atmosphere.isNight ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)',
            color: atmosphere.textColor,
            border: 'none',
            borderRadius: '5px',
            padding: '5px 8px',
            fontSize: '11px',
            cursor: 'pointer',
            textAlign: 'center',
          }}
        >
          🌸 Replay Bloom
        </button>
      </div>
    </div>
  )
}
