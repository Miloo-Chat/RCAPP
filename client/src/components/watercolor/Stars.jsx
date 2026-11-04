// client/src/components/watercolor/Stars.jsx
//
// Minimal nocturnal stars matching the reference watercolor painting aesthetic:
// - Stars are tiny (0.5 - 0.9px), sparse (around 45 stars total), and soft (alpha ~0.25-0.45).
// - NO glow, NO bloom, NO bright white, NO fireflies.
// - Only active at night to keep 0% CPU during daytime.

import { useEffect, useRef } from 'react'

export default function Stars({
  starsOpacity = 0,
}) {
  const canvasRef = useRef(null)

  useEffect(() => {
    if (starsOpacity < 0.02) return
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

    const prefersReducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

    // Initialize ~45 tiny, sparse, soft stars
    const stars = Array.from({ length: 45 }, () => ({
      x: Math.random() * width,
      y: Math.random() * (height * 0.65),
      radius: Math.random() * 0.45 + 0.5,
      baseAlpha: Math.random() * 0.25 + 0.25,
      twinkleSpeed: Math.random() * 0.015 + 0.008,
      phase: Math.random() * Math.PI * 2,
    }))

    const render = () => {
      ctx.clearRect(0, 0, width, height)

      for (let i = 0; i < stars.length; i++) {
        const s = stars[i]
        if (!prefersReducedMotion) {
          s.phase += s.twinkleSpeed
        }
        const twinkle = prefersReducedMotion ? 0.6 : (Math.sin(s.phase) * 0.2 + 0.8)
        const alpha = s.baseAlpha * twinkle * starsOpacity

        if (alpha > 0.01) {
          ctx.beginPath()
          ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2)
          ctx.fillStyle = `rgba(214, 224, 240, ${alpha})`
          ctx.fill()
        }
      }

      animationFrameId = requestAnimationFrame(render)
    }

    render()

    return () => {
      cancelAnimationFrame(animationFrameId)
      window.removeEventListener('resize', handleResize)
    }
  }, [starsOpacity])

  if (starsOpacity < 0.01) {
    return null
  }

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
        zIndex: 4,
        opacity: starsOpacity,
        transition: 'opacity 0.6s ease',
      }}
      aria-hidden="true"
    />
  )
}
