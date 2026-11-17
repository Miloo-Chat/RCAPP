// client/src/components/watercolor/GlobalPaperGrain.jsx
//
// Cold-press watercolor paper grain overlay.
// PERF: the old version ran two live feTurbulence + feDiffuseLighting filters over the
// whole viewport with mix-blend-mode, which forced a full-screen repaint on every scroll
// frame (this is what made content appear late / lag on phones).
// Now the noise is rasterised ONCE as a small tiled image, so scrolling costs nothing.

import { useAtmosphere } from '../../context/AtmosphereContext'
import WatercolorFilters from './WatercolorFilters'

const GRAIN_TILE =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='220' height='220'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' seed='17' stitchTiles='stitch'/%3E%3CfeColorMatrix values='0 0 0 0 0.5 0 0 0 0 0.45 0 0 0 0 0.4 0 0 0 0.9 0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")"

export default function GlobalPaperGrain() {
  const { isNight } = useAtmosphere()

  return (
    <>
      {/* Universal Watercolor SVG Filters Definition (sun, ink, halo) */}
      <WatercolorFilters />

      <div
        className="rough-paper-grain-overlay"
        aria-hidden="true"
        style={{
          position: 'fixed',
          inset: 0,
          pointerEvents: 'none',
          zIndex: 6,
          backgroundImage: GRAIN_TILE,
          backgroundSize: '220px 220px',
          opacity: isNight ? 0.12 : 0.16,
          // GPU layer, no repaint while scrolling
          transform: 'translateZ(0)',
        }}
      />
    </>
  )
}
