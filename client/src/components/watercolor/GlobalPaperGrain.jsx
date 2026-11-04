// client/src/components/watercolor/GlobalPaperGrain.jsx
//
// Cold-press rough watercolor paper grain overlay.
// Finer scale (baseFrequency ~1.1) and reduced grain intensity (~18-22% day, ~14% night).
// Covers background and painting layers (zIndex: 6), below text, buttons, and navigation.

import { useAtmosphere } from '../../context/AtmosphereContext'
import WatercolorFilters from './WatercolorFilters'

export default function GlobalPaperGrain() {
  const { atmosphere, isNight } = useAtmosphere()

  return (
    <>
      {/* Universal Watercolor SVG Filters Definition */}
      <WatercolorFilters />

      {/* Rough Cold-Press Paper Grain Overlay: visible in EVERY theme */}
      <svg
        className="rough-paper-grain-overlay"
        style={{
          position: 'fixed',
          inset: 0,
          width: '100vw',
          height: '100vh',
          pointerEvents: 'none',
          zIndex: 6,
          mixBlendMode: isNight ? 'screen' : 'multiply',
          opacity: isNight ? 0.33 : 0.22,
        }}
        aria-hidden="true"
      >
        <rect
          width="100%"
          height="100%"
          fill={isNight ? '#000000' : '#ffffff'}
          filter={`url(#${isNight ? 'paper-grain-night-filter' : 'paper-grain-filter'})`}
        />
      </svg>
    </>
  )
}

