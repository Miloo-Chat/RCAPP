// client/src/components/watercolor/WatercolorMiniBanner.jsx
//
// Compact watercolor wire & perched ink sparrows banner for content pages
// (How It Works, Safety, FAQ, About, Blog, Contact, Legal).
// Carries the authentic watercolor painting aesthetic and subtle animations
// across the entire site.

import { useRef, useCallback } from 'react'
import { useAtmosphere } from '../../context/AtmosphereContext'
import Bird from './Bird'

export default function WatercolorMiniBanner() {
  const { atmosphere, isNight } = useAtmosphere()
  const wireColor = atmosphere.wireColor || (isNight ? '#8E9AA8' : '#1A1A1A')
  const birdColor = atmosphere.birdSilhouette || (isNight ? '#0D111A' : '#1A1A1A')

  // Smooth cubic Bezier wire across 880px width
  // Drops gently from left to right: (0, 36) -> (880, 52)
  const pathWire = 'M 0 36 C 260 44, 600 50, 880 52'

  return (
    <div
      className="watercolor-mini-banner"
      style={{
        width: '100%',
        maxWidth: '880px',
        height: '68px',
        position: 'relative',
        margin: '0 auto 8px auto',
        overflow: 'visible',
        pointerEvents: 'none',
        userSelect: 'none',
      }}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 880 70"
        style={{
          width: '100%',
          height: '100%',
          overflow: 'visible',
        }}
      >
        {/* Faint watercolor wash accent behind the wire */}
        <ellipse
          cx="440"
          cy="42"
          rx="180"
          ry="24"
          fill={isNight ? atmosphere.moonColor : atmosphere.sunColor}
          opacity={isNight ? 0.22 : 0.32}
          filter="url(#watercolor-sun-displace)"
        />

        {/* Smooth 1.8px ink wire */}
        <path
          d={pathWire}
          fill="none"
          stroke={wireColor}
          strokeWidth="1.8"
          strokeLinecap="round"
          className="wire-swaying"
        />

        {/* Sparrow 1: Plump sparrow with tail flicked UP to right (at x = 380, y = 46.5) */}
        <Bird
          id={2}
          x={380}
          y={46.5}
          scale={0.72}
          color={birdColor}
          isNight={isNight}
        />

        {/* Sparrow 2: Upright neat teardrop sparrow (at x = 460, y = 48.5) */}
        <Bird
          id={3}
          x={460}
          y={48.5}
          scale={0.72}
          color={birdColor}
          isNight={isNight}
        />
      </svg>
    </div>
  )
}

