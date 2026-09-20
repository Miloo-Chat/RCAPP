// client/src/components/Logo.jsx
//
// A small, brandable SVG logo for Miloo. Features the spark/bolt mark
// with the brand accent gradient.

export default function Logo({ size = 32 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      style={{ display: 'block', flexShrink: 0 }}
    >
      <defs>
        <linearGradient id="logoGrad" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="var(--accent, #FF6B4A)" />
          <stop offset="100%" stopColor="var(--accent-2, #FF3D81)" />
        </linearGradient>
      </defs>
      <path d="M17 2 L8 18 H15 L13 30 L26 12 H18 L17 2Z" fill="url(#logoGrad)" />
    </svg>
  )
}
