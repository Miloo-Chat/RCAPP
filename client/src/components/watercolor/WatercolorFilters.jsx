// client/src/components/watercolor/WatercolorFilters.jsx
//
// Authentic SVG Filters for cold-press rough watercolor paper grain,
// low-frequency organic sun displacement, pigment pooling, and fine pen ink tooth.

export default function WatercolorFilters() {
  return (
    <svg
      style={{
        position: 'absolute',
        width: 0,
        height: 0,
        pointerEvents: 'none',
        overflow: 'hidden',
      }}
      aria-hidden="true"
    >
      <defs>
        {/* ── 1. Rough Cold-Press Watercolor Paper Grain Filter (Day / Sunset) ── */}
        {/* Finer scale (baseFrequency ~1.1). Cold-press watercolor paper look, not fabric or stucco */}
        <filter id="paper-grain-filter" x="0%" y="0%" width="100%" height="100%">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.04 0.04"
            numOctaves="3"
            seed="42"
            result="macroPits"
          />
          <feTurbulence
            type="fractalNoise"
            baseFrequency="1.1 1.1"
            numOctaves="4"
            seed="17"
            result="microTooth"
          />
          <feComposite
            in="macroPits"
            in2="microTooth"
            operator="arithmetic"
            k1="0"
            k2="0.60"
            k3="0.40"
            k4="0"
            result="combinedNoise"
          />
          <feDiffuseLighting
            in="combinedNoise"
            lightingColor="#ffffff"
            surfaceScale="1.8"
            diffuseConstant="1.1"
            result="diffuseGrain"
          >
            <feDistantLight azimuth="45" elevation="52" />
          </feDiffuseLighting>
          <feComponentTransfer in="diffuseGrain" result="embossedPaper">
            <feFuncR type="linear" slope="0.85" intercept="0.08" />
            <feFuncG type="linear" slope="0.85" intercept="0.08" />
            <feFuncB type="linear" slope="0.85" intercept="0.08" />
          </feComponentTransfer>
          <feBlend in="SourceGraphic" in2="embossedPaper" mode="multiply" />
        </filter>

        {/* ── 2. Night Rough Paper Grain (Embossed tooth for deep indigo paper) ── */}
        <filter id="paper-grain-night-filter" x="0%" y="0%" width="100%" height="100%">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.04 0.04"
            numOctaves="3"
            seed="42"
            result="macroPits"
          />
          <feTurbulence
            type="fractalNoise"
            baseFrequency="1.1 1.1"
            numOctaves="4"
            seed="17"
            result="microTooth"
          />
          <feComposite
            in="macroPits"
            in2="microTooth"
            operator="arithmetic"
            k1="0"
            k2="0.60"
            k3="0.40"
            k4="0"
            result="combinedNoise"
          />
          <feDiffuseLighting
            in="combinedNoise"
            lightingColor="#8fa3c7"
            surfaceScale="1.8"
            diffuseConstant="1.1"
            result="diffuseGrain"
          >
            <feDistantLight azimuth="45" elevation="48" />
          </feDiffuseLighting>
          <feComponentTransfer in="diffuseGrain" result="nightTooth">
            <feFuncR type="linear" slope="0.45" intercept="0.0" />
            <feFuncG type="linear" slope="0.45" intercept="0.0" />
            <feFuncB type="linear" slope="0.60" intercept="0.0" />
          </feComponentTransfer>
          <feBlend in="SourceGraphic" in2="nightTooth" mode="screen" />
        </filter>

        {/* ── 3. Low-Frequency Organic Sun/Moon Soft Edge Filter ── */}
        {/* feTurbulence baseFrequency ~0.012, feDisplacementMap scale ~8. No jagged edges */}
        <filter id="watercolor-sun-displace" x="-20%" y="-20%" width="140%" height="140%">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.012"
            numOctaves="3"
            seed="54"
            result="lowNoise"
          />
          <feDisplacementMap
            in="SourceGraphic"
            in2="lowNoise"
            scale="8"
            xChannelSelector="R"
            yChannelSelector="G"
            result="softDisplaced"
          />
          <feGaussianBlur in="softDisplaced" stdDeviation="0.75" />
        </filter>

        {/* ── 4. Pigment Pooling Filter (Soft-edged, irregular watercolor wash patches) ── */}
        <filter id="pigment-pool-filter" x="-25%" y="-25%" width="150%" height="150%">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.015"
            numOctaves="3"
            seed="83"
            result="poolNoise"
          />
          <feDisplacementMap
            in="SourceGraphic"
            in2="poolNoise"
            scale="8"
            xChannelSelector="R"
            yChannelSelector="G"
            result="displacedPool"
          />
          <feGaussianBlur in="displacedPool" stdDeviation="2.5" />
        </filter>

        {/* ── 5. Fine Ink Nib Grain (Subtle irregularity for ink pen lines) ── */}
        <filter id="ink-nib-tooth" x="-10%" y="-10%" width="120%" height="120%">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.25"
            numOctaves="2"
            seed="19"
            result="nibNoise"
          />
          <feDisplacementMap
            in="SourceGraphic"
            in2="nibNoise"
            scale="0.75"
            xChannelSelector="R"
            yChannelSelector="G"
          />
        </filter>

        {/* ── 6. Faint, Uneven Watercolor Bleed Ring (Irregular shape, NO gaussian glow) ── */}
        <filter id="watercolor-outer-halo" x="-30%" y="-30%" width="160%" height="160%">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.014"
            numOctaves="3"
            seed="88"
            result="haloNoise"
          />
          <feDisplacementMap
            in="SourceGraphic"
            in2="haloNoise"
            scale="8"
            xChannelSelector="R"
            yChannelSelector="G"
          />
        </filter>
      </defs>
    </svg>
  )
}
