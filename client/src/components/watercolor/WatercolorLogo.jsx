// client/src/components/watercolor/WatercolorLogo.jsx
//
// Brand wordmark "miloo" in Cormorant Garamond with the orange dot,
// where a thin ink wire passes through both "o" letters with one tiny bird perched on it.

import { Link } from 'react-router-dom'

export default function WatercolorLogo({
  color = 'var(--text-1)',
  isNight = false,
  size = 28,
  showDetail = undefined,
}) {
  const hasDetail = showDetail !== undefined ? showDetail : size >= 28
  const textColor = color && color !== 'var(--text-1)' ? color : (isNight ? '#ECEBF0' : '#181615')
  const wireColor = isNight ? '#BAC6D9' : (textColor || '#1A1A1A')
  const dotColor = isNight ? '#F28B74' : '#B83A1B'

  return (
    <Link
      to="/"
      aria-label="miloo · Meet a real stranger"
      className="watercolor-logo-link"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        textDecoration: 'none',
        outline: 'none',
        userSelect: 'none',
      }}
    >
      <svg
        aria-hidden="true"
        height={size}
        viewBox={hasDetail ? '0 0 160 48' : '0 0 130 48'}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ overflow: 'visible', display: 'block' }}
      >
        <text
          aria-hidden="true"
          x="4"
          y="35"
          fontFamily="var(--font-serif), 'Cormorant Garamond', Georgia, serif"
          fontSize="38"
          fontWeight="600"
          letterSpacing="-0.02em"
          fill={textColor}
        >
          miloo
        </text>
        {/* Coral/Amber Dot */}
        <circle cx="114" cy="33.5" r="3.5" fill={dotColor} />

        {/* Detailed wire and bird (only shown when height >= 28px) */}
        {hasDetail && (
          <>
            {/* Thin ink wire passing through both 'o' letters */}
            <path
              d="M 58 24.5 Q 84 25.5 110 24.8"
              stroke={wireColor}
              strokeWidth="1.1"
              strokeLinecap="round"
            />
            {/* Tiny perched bird above the second 'o' */}
            <g transform="translate(94, 24.5) scale(0.75)">
              <path
                d="M -1 -7 C -2 -7.5 -3.5 -7.5 -4 -6 C -4.5 -5 -4 -4 -3 -3.5 C -4.5 -3 -5 -1.5 -4.8 0 C -4.5 1 -3.5 1 -2 0.5 C -1.5 1.5 -1.2 3.5 -1.5 5 C -1 5 -0.5 4 -0.2 2.5 C 0.5 0.5 1.5 0 2 -0.2 C 3.2 -0.8 3.5 -2.2 3.2 -3.8 C 2.8 -5.5 1.5 -6.8 -1 -7 Z"
                fill={wireColor}
              />
              <path d="M -4 -6 L -6 -6 L -4 -5.2 Z" fill={wireColor} />
              <circle cx="-2.6" cy="-5.8" r="0.4" fill="#ffffff" />
              <line x1="-1.5" y1="-0.8" x2="-1.5" y2="0" stroke={wireColor} strokeWidth="0.6" strokeLinecap="round" />
              <line x1="0.5" y1="-0.8" x2="0.5" y2="0" stroke={wireColor} strokeWidth="0.6" strokeLinecap="round" />
            </g>
          </>
        )}
      </svg>
    </Link>
  )
}

