// client/src/components/watercolor/Wires.jsx
//
// Smooth, thin ink lines drawn with a fine ink pen:
// - Two smooth cubic Beziers with natural gentle sag (1.6px edge to edge).
// - Stroke width: 1.6px, strokeLinecap: round, #1A1A1A (soft silver-grey at night).
// - Run edge to edge across the viewport (x: -20 to 1460, full bleed).
// - Upper wire: ~9.5 degrees downward to the right, passing through the middle of the sun at (720, 225.6).
// - Lower wire: ~6.0 degrees downward to the right, getting slightly closer toward the right (not parallel).
// - Very slight sway animation (1-2px) only.

import { useState, useCallback, useImperativeHandle, forwardRef } from 'react'

/**
 * Calculates exact Y coordinate on the cubic Bézier wire curve at any X (-20..1460).
 */
export function getWireY(wireIndex, x, dip = 0) {
  const t = Math.max(0, Math.min(1, (x + 20) / 1480))
  const u = 1 - t
  const sag = dip * Math.sin(Math.PI * t)

  if (wireIndex === 0) {
    // Upper wire: (-20, 100) -> (470, 184.8) -> (970, 267.5) -> (1460, 348)
    // Slope: ~9.5 degrees downward to the right, passes through sun middle at (720, 225.6), gentle 1.6px sag.
    const y0 = 100
    const y1 = 184.8
    const y2 = 267.5
    const y3 = 348
    return u * u * u * y0 + 3 * u * u * t * y1 + 3 * u * t * t * y2 + t * t * t * y3 + sag
  } else {
    // Lower wire: (-20, 220) -> (470, 274.1) -> (970, 326.1) -> (1460, 376)
    // Slope: ~6.0 degrees downward to the right, non-parallel, closer toward right, gentle 1.6px sag.
    const y0 = 220
    const y1 = 274.1
    const y2 = 326.1
    const y3 = 376
    return u * u * u * y0 + 3 * u * u * t * y1 + 3 * u * t * t * y2 + t * t * t * y3 + sag
  }
}

const Wires = forwardRef(function Wires(
  {
    wireColor = '#1A1A1A',
    isBloomActive = false,
  },
  ref
) {
  const [dipTop, setDipTop] = useState(0)
  const [dipBottom, setDipBottom] = useState(0)

  // Subtle physical damped harmonic bounce when birds land or hop
  const triggerWireDip = useCallback((wireIndex = 0, magnitude = 2.5) => {
    const setDip = wireIndex === 0 ? setDipTop : setDipBottom
    setDip(magnitude)

    let step = 0
    const interval = setInterval(() => {
      step += 1
      const damped = magnitude * Math.exp(-step * 0.32) * Math.cos(step * 0.9)
      setDip(damped)
      if (step > 12) {
        clearInterval(interval)
        setDip(0)
      }
    }, 45)
  }, [])

  useImperativeHandle(ref, () => ({
    dipTopWire: (mag) => triggerWireDip(0, mag),
    dipBottomWire: (mag) => triggerWireDip(1, mag),
    getTopWireY: (x) => getWireY(0, x, dipTop),
    getBottomWireY: (x) => getWireY(1, x, dipBottom),
  }))

  // Upper wire cubic Bezier path with dip (slope ~9.5 deg, 1.6px gentle sag, passes sun middle)
  const topSag = dipTop * 1.2
  const pathTop = `M -20 100 C 470 ${184.8 + topSag}, 970 ${267.5 + topSag}, 1460 348`

  // Lower wire cubic Bezier path with dip (slope ~6.0 deg, 1.6px gentle sag, gets closer toward right)
  const bottomSag = dipBottom * 1.2
  const pathBottom = `M -20 220 C 470 ${274.1 + bottomSag}, 970 ${326.1 + bottomSag}, 1460 376`

  return (
    <g
      className="wires-group"
      style={{
        pointerEvents: 'none',
        transition: 'color 0.4s ease',
      }}
    >
      {/* ── UPPER WIRE (Edge to edge, slope ~9.5 deg, crosses sun's middle, 1.6px sag, 1.6px stroke) ── */}
      <path
        d={pathTop}
        fill="none"
        stroke={wireColor}
        strokeWidth="1.6"
        strokeLinecap="round"
        className={`wire-line wire-top ${isBloomActive ? 'wire-drawing' : 'wire-swaying'}`}
      />

      {/* ── LOWER WIRE (Edge to edge, slope ~6.0 deg, non-parallel, 1.6px sag, 1.6px stroke) ── */}
      <path
        d={pathBottom}
        fill="none"
        stroke={wireColor}
        strokeWidth="1.6"
        strokeLinecap="round"
        className={`wire-line wire-bottom ${isBloomActive ? 'wire-drawing' : 'wire-swaying'}`}
      />

      <style>{`
        @keyframes wireDraw {
          0% {
            stroke-dasharray: 1600;
            stroke-dashoffset: 1600;
          }
          100% {
            stroke-dasharray: 1600;
            stroke-dashoffset: 0;
          }
        }
        .wire-drawing {
          animation: wireDraw 1.0s cubic-bezier(0.2, 0.8, 0.2, 1) 0.1s forwards;
        }
        /* Very slight sway animation (1-2px) only */
        @keyframes wireGentleSway {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(1.2px);
          }
        }
        .wire-swaying {
          animation: wireGentleSway 7s ease-in-out infinite;
        }
        @media (prefers-reduced-motion: reduce) {
          .wire-drawing, .wire-swaying {
            animation: none !important;
          }
        }
      `}</style>
    </g>
  )
})

export default Wires
