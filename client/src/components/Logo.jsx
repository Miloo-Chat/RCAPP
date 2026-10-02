// client/src/components/Logo.jsx
//
// A custom wordmark treatment for Miloo: Fraunces "miloo" with a distinctive terracotta dot.

export default function Logo({ size = 28 }) {
  return (
    <div
      aria-label="Miloo logo"
      style={{
        display: 'inline-flex',
        alignItems: 'baseline',
        fontFamily: 'var(--font-display)',
        fontSize: size,
        fontWeight: 600,
        letterSpacing: '-0.03em',
        color: 'var(--text-1)',
        lineHeight: 1,
        userSelect: 'none',
      }}
    >
      miloo
      <span style={{ color: 'var(--accent)', marginLeft: '1px' }}>.</span>
    </div>
  )
}
