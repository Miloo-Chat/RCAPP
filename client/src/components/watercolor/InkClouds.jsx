// client/src/components/watercolor/InkClouds.jsx
//
// Horizontal watercolor streaks across the sky for Sunset theme.
// Soft, watery, translucent bands bleeding across the horizon.

export default function InkClouds({
  sunsetWashOpacity = 0,
  isNight = false,
}) {
  if (isNight || sunsetWashOpacity < 0.01) {
    return null
  }

  return (
    <div
      className="ink-clouds-container"
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 3,
        overflow: 'hidden',
      }}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 1000 600"
        preserveAspectRatio="none"
        style={{ width: '100%', height: '100%' }}
      >
        {/* ── 2-3 VERY FAINT HORIZONTAL WATERCOLOR STREAKS ACROSS THE SKY ── */}
        <g
          style={{
            opacity: sunsetWashOpacity,
            transition: 'opacity 0.6s ease',
          }}
          filter="url(#watercolor-outer-halo)"
        >
          {/* Streak 1: 2-3 faint horizontal peach streaks #E9B896 */}
          <path
            d="M -50 260 Q 250 248 500 262 T 1050 252 L 1050 300 Q 750 310 500 295 T -50 305 Z"
            fill="rgba(233, 184, 150, 0.24)"
          />
          {/* Streak 2: Faint mid peach streak */}
          <path
            d="M -50 310 Q 300 298 600 312 T 1050 302 L 1050 355 Q 700 365 400 350 T -50 360 Z"
            fill="rgba(233, 184, 150, 0.18)"
          />
          {/* Streak 3: Faint lower peach streak */}
          <path
            d="M -50 370 Q 350 358 700 372 T 1050 362 L 1050 410 Q 650 420 300 408 T -50 415 Z"
            fill="rgba(233, 184, 150, 0.14)"
          />
        </g>
      </svg>
    </div>
  )
}
