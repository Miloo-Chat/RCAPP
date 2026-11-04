// client/src/components/watercolor/SunMoon.jsx
//
// Watercolor Sun & Moon component matching the reference painting:
// - ONE large watercolor sun, centered, ~420px wide (radius 210 in 1440x450).
// - Noon: Pale, translucent #F2D98F at ~65% opacity. Low-frequency displacement (feTurbulence ~0.012, scale ~8).
//   4 distinct layers:
//   (a) base wash circle
//   (b) 2-3 irregular pooling blotches inside
//   (c) thin darker inner pigment ring (watercolor edge effect)
//   (d) second faint larger halo ring outside the sun (#F6E6B8 at ~40% opacity)
// - Sunset: Pale apricot-to-terracotta wash #E8A074 at ~70% opacity with darker pooling edge.
// - Night: Muted pale grey-blue watercolor moon #D6DCE8 at ~75% opacity with darker pooled rim,
//   visible mottled texture and faint outer halo ring. NO glow, NO bloom, NO bright white.

export default function SunMoon({
  atmosphere,
  isBloomActive = false,
}) {
  const {
    sunOpacity = 1,
    sunColor = '#F2D98F',
    sunRim = '#D9AF4E',
    sunHalo = '#F6E6B8',
    moonOpacity = 0,
    moonColor = '#D6DCE8',
    moonRim = '#9EACC4',
    moonHalo = '#BAC6D9',
  } = atmosphere

  // Centered sun in 1440 x 450 coordinate system:
  // Center: (720, 225), radius: 210 -> diameter 420px
  const sunRadius = 210
  const sunCx = 720
  const sunCy = 225

  return (
    <div
      className="sun-moon-art-layer"
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 5,
      }}
    >
      <svg
        viewBox="0 0 1440 450"
        preserveAspectRatio="xMidYMid meet"
        style={{
          width: '100%',
          height: '100%',
          overflow: 'visible',
        }}
        aria-hidden="true"
      >
        <defs>
          {/* Soft pigment pooling along inner edge only (~10px wide band, fading inward, NO outline ring) */}
          <radialGradient id="sun-inner-pigment-pool" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={sunRim} stopOpacity="0" />
            <stop offset="94%" stopColor={sunRim} stopOpacity="0" />
            <stop offset="97%" stopColor={sunRim} stopOpacity="0.18" />
            <stop offset="100%" stopColor={sunRim} stopOpacity="0.38" />
          </radialGradient>

          <radialGradient id="moon-inner-pigment-pool" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={moonRim} stopOpacity="0" />
            <stop offset="94%" stopColor={moonRim} stopOpacity="0" />
            <stop offset="97%" stopColor={moonRim} stopOpacity="0.12" />
            <stop offset="100%" stopColor={moonRim} stopOpacity="0.25" />
          </radialGradient>
        </defs>

        {/* ── 1. WATERCOLOR SUN (Day / Noon / Sunset) ── */}
        {sunOpacity > 0.01 && (
          <g
            className={`watercolor-sun-group ${isBloomActive ? 'sun-blooming' : ''}`}
            style={{
              opacity: sunOpacity,
              transition: 'opacity 0.6s ease',
            }}
          >
            {/* Faint, irregular wet-bleed ring (opacity 25-35%, uneven edge, no blur glow) */}
            <circle
              cx={sunCx}
              cy={sunCy}
              r={sunRadius + 9}
              fill="none"
              stroke={sunHalo || '#F8EBC4'}
              strokeWidth="18"
              opacity={0.30}
              filter="url(#watercolor-outer-halo)"
            />

            {/* Base wash: golden yellow wash (Base #F4D77A at ~75% opacity) */}
            <circle
              cx={sunCx}
              cy={sunCy}
              r={sunRadius}
              fill={sunColor}
              opacity={0.75}
              filter="url(#watercolor-sun-displace)"
            />

            {/* 3-4 irregular, soft-edged, low-contrast pigment patches (+/-4% lightness) of different shapes, like uneven watercolor wash */}
            <g filter="url(#pigment-pool-filter)">
              {/* Irregular wash patch 1 (upper right, organic bean shape) */}
              <path
                d="M 735 155 C 770 135, 815 145, 845 175 C 860 200, 835 228, 795 232 C 765 235, 730 215, 720 185 Z"
                fill={sunRim}
                opacity={0.065}
              />
              {/* Irregular wash patch 2 (lower-left tilted organic shape) */}
              <path
                d="M 645 240 C 675 225, 715 250, 705 285 C 695 315, 655 330, 625 315 C 600 300, 595 270, 615 250 Z"
                fill={sunRim}
                opacity={0.06}
              />
              {/* Irregular lighter wash pool 3 (upper left, +4% lightness) */}
              <path
                d="M 665 160 C 690 145, 720 165, 712 192 C 705 215, 670 225, 648 210 C 632 198, 635 175, 650 165 Z"
                fill="#FFFBEA"
                opacity={0.08}
              />
              {/* Irregular wash patch 4 (right flank subtle variation) */}
              <path
                d="M 815 220 C 840 212, 865 230, 860 258 C 855 280, 828 295, 808 282 C 792 272, 795 245, 810 228 Z"
                fill={sunRim}
                opacity={0.05}
              />
            </g>

            {/* Soft pigment pooling along inner edge only (~10px wide band, fading inward, NO dark outline ring) */}
            <circle
              cx={sunCx}
              cy={sunCy}
              r={sunRadius}
              fill="url(#sun-inner-pigment-pool)"
              filter="url(#watercolor-sun-displace)"
            />
          </g>
        )}

        {/* ── 2. WATERCOLOR MOON (Night Theme: Pale grey-blue #D6DCE8 at 80%) ── */}
        {moonOpacity > 0.01 && (
          <g
            className="watercolor-moon-group"
            style={{
              opacity: moonOpacity,
              transition: 'opacity 0.6s ease',
            }}
          >
            {/* Faint, irregular wet-bleed ring (opacity 25-35%, uneven edge, no blur glow) */}
            <circle
              cx={sunCx}
              cy={sunCy}
              r={sunRadius + 8}
              fill="none"
              stroke={moonHalo || '#BAC6D9'}
              strokeWidth="16"
              opacity={0.28}
              filter="url(#watercolor-outer-halo)"
            />

            {/* Base wash: pale grey-blue watercolor (#D6DCE8 at 80% opacity) */}
            <circle
              cx={sunCx}
              cy={sunCy}
              r={sunRadius}
              fill={moonColor}
              opacity={0.80}
              filter="url(#watercolor-sun-displace)"
            />

            {/* 3-4 irregular, soft-edged, low-contrast pigment patches (+/-4% lightness) of different shapes */}
            <g filter="url(#pigment-pool-filter)">
              {/* Irregular wash patch 1 */}
              <path
                d="M 650 165 C 685 145, 735 158, 765 190 C 780 220, 750 252, 710 256 C 675 260, 635 230, 625 200 Z"
                fill={moonRim}
                opacity={0.07}
              />
              {/* Irregular wash patch 2 */}
              <path
                d="M 760 235 C 790 220, 835 248, 825 290 C 815 325, 770 342, 735 325 C 705 310, 695 270, 720 245 Z"
                fill={moonRim}
                opacity={0.065}
              />
              {/* Crater blotch 1 */}
              <ellipse
                cx={sunCx - 35}
                cy={sunCy + 15}
                rx={34}
                ry={26}
                transform={`rotate(-15 ${sunCx - 35} ${sunCy + 15})`}
                fill="#8896AF"
                opacity={0.10}
              />
              {/* Crater blotch 2 */}
              <ellipse
                cx={sunCx + 40}
                cy={sunCy - 30}
                rx={28}
                ry={22}
                transform={`rotate(25 ${sunCx + 40} ${sunCy - 30})`}
                fill="#7F8EA8"
                opacity={0.09}
              />
            </g>

            {/* Soft pigment pooling along inner edge only (~10px wide band, fading inward, NO dark outline ring) */}
            <circle
              cx={sunCx}
              cy={sunCy}
              r={sunRadius}
              fill="url(#moon-inner-pigment-pool)"
              filter="url(#watercolor-sun-displace)"
            />
          </g>
        )}
      </svg>

      <style>{`
        @keyframes bloomIn {
          0% {
            transform: scale(0.6);
            opacity: 0;
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }
        .sun-blooming {
          transform-origin: 720px 225px;
          animation: bloomIn 1.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        @media (prefers-reduced-motion: reduce) {
          .sun-blooming {
            animation: none !important;
          }
        }
      `}</style>
    </div>
  )
}
