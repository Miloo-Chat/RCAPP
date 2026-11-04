// client/src/components/watercolor/RainEffect.jsx
//
// Delicate hand-drawn diagonal ink rain strokes.
// Active on 5% of visits or toggled on via Dev Controls.

import { useEffect, useRef } from 'react'

export default function RainEffect({ active = false, isNight = false }) {
  const canvasRef = useRef(null)

  useEffect(() => {
    if (!active) return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animationFrameId
    let width = (canvas.width = window.innerWidth)
    let height = (canvas.height = window.innerHeight)

    const handleResize = () => {
      if (!canvas) return
      width = canvas.width = window.innerWidth
      height = canvas.height = window.innerHeight
    }
    window.addEventListener('resize', handleResize)

    // Check reduced motion
    const prefersReducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    if (prefersReducedMotion) return

    // 45 delicate ink rain drops
    const drops = Array.from({ length: 45 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      len: Math.random() * 22 + 14,
      speed: Math.random() * 3 + 4,
      alpha: Math.random() * 0.25 + 0.15,
      weight: Math.random() * 0.7 + 0.6,
    }))

    const render = () => {
      ctx.clearRect(0, 0, width, height)

      const strokeColor = isNight
        ? 'rgba(190, 210, 240, '
        : 'rgba(50, 42, 35, '

      for (let i = 0; i < drops.length; i++) {
        const d = drops[i]
        d.y += d.speed
        d.x += d.speed * 0.35 // gentle diagonal slant

        if (d.y > height + 30) {
          d.y = -30
          d.x = Math.random() * width
        }

        ctx.beginPath()
        ctx.moveTo(d.x, d.y)
        ctx.lineTo(d.x + d.len * 0.35, d.y + d.len)
        ctx.strokeStyle = `${strokeColor}${d.alpha})`
        ctx.lineWidth = d.weight
        ctx.stroke()
      }

      animationFrameId = requestAnimationFrame(render)
    }

    render()

    return () => {
      cancelAnimationFrame(animationFrameId)
      window.removeEventListener('resize', handleResize)
    }
  }, [active, isNight])

  if (!active) return null

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 6,
        opacity: 0.85,
      }}
      aria-hidden="true"
    />
  )
}

