// client/src/components/watercolor/Bird.jsx
//
// Hand-authored ink sparrow birds matching the reference painting:
// - Solid ink silhouette (black #1A1A1A / deep navy #0B1226 with 1px faint rim at night)
// - Plump rounded body, small round head, tiny pointed beak (short, never a horizontal stick)
// - Tail tapering downward like a thin triangle (or flicked UP to the right for Bird 2)
// - Two tiny legs touching the wire line at y = 0
// - Size ~38-46px tall at 1440 width (scale 1.0)
// - 9 visibly different poses following reference:
//   * Bird 0: upright looking up-left
//   * Bird 1: upright looking right
//   * Bird 2: hunched and tilted forward with tail flicked up to the right
//   * Bird 3: tall and thin
//   * Bird 4: leaning right, alert
//   * Bird 5: singing / looking up-right, arched back, tapered tail
//   * Bird 6: upright just past the sun
//   * Bird 7: lower wire facing right towards Bird 8
//   * Bird 8: lower wire facing left towards Bird 7
// - Night: birds are #0B1226 with faint lighter rim (1px, rgba(214,220,232,0.5)), never disappear.
// - Sleeping: hunch posture, head tucked, never fade out.

import { useState, useEffect } from 'react'

export const BIRD_SILHOUETTES = [
  // 0: Upright alert sparrow, head looking up-left, downward tapering tail
  {
    d: 'M -2 -25 C -3 -27 -5 -27 -6.5 -25 C -8 -23 -7.5 -21 -6 -20 C -8.5 -18 -11 -13 -11 -7 C -11 -1 -8 1 -3.5 0.5 C -2.5 0.5 -2 3 -2 8 C -2 12 -3 15 -3.5 16.5 C -2.5 16.5 -1.5 14 -1 9 C -0.5 4 0 1 1.5 0.5 C 4.5 -0.5 6 -4 6 -9 C 6 -15 4 -20 0.5 -23 Z',
    beak: 'M -6.5 -24.5 L -10.5 -25 L -6.5 -22.5 Z',
    legs: 'M -3 -1.5 L -3 0 M 0.5 -1.5 L 0.5 0',
    eye: { cx: -4.5, cy: -24 },
    headCenter: '-4px -23px',
    sleepAngle: 4,
  },
  // 1: Upright alert looking right, plump chest, downward tapering tail
  {
    d: 'M 1 -25 C 2 -27 4 -27 5.5 -25 C 7 -23 6.5 -21 5 -20 C 7.5 -18 10 -13 10 -7 C 10 -1 7 1 2.5 0.5 C 1.5 0.5 1 3 0.5 8 C 0 12 -1 15 -1.5 16.5 C -0.5 16.5 0.5 14 1.5 9 C 2 4 2.5 1 0 0.5 C -3 -0.5 -5.5 -4 -5.5 -9 C -5.5 -15 -3.5 -20 0 -23 Z',
    beak: 'M 5.5 -24.5 L 9.5 -24 L 5.5 -22.5 Z',
    legs: 'M -0.5 -1.5 L -0.5 0 M 2 -1.5 L 2 0',
    eye: { cx: 3.5, cy: -24 },
    headCenter: '3px -23px',
    sleepAngle: -4,
  },
  // 2: Hunched and leaning forward with tail flicked UP to the right (Bird 2 in reference)
  {
    d: 'M -3 -19 C -4.5 -20.5 -6.5 -20 -8 -18.5 C -9.5 -17 -9 -15 -7.5 -14 C -10 -11 -10.5 -6 -9.5 -1 C -8.5 3 -6.5 4.5 -3.5 3.5 C -2.5 3 -1.5 3.5 -1 4 C -0.5 4.5 0.5 4.5 1 3.5 C 2 2 3.5 1 4.5 -1 C 5.5 -3 6 -5.5 6.5 -9 C 7.5 -11 11 -15 15.5 -19.5 C 17.5 -21.5 18.5 -22 18 -22.5 C 17.5 -23 16 -22 12 -19 C 8.5 -16 6.5 -13.5 5 -13.5 C 3 -13.5 1.5 -15.5 0.5 -17.5 C -0.5 -19 -1.5 -19.5 -3 -19 Z',
    beak: 'M -7.5 -18 L -11 -17.5 L -7 -16 Z',
    legs: 'M -4 -1.5 L -4 0 M 0 -1.5 L 0 0',
    eye: { cx: -5, cy: -17 },
    headCenter: '-5px -17px',
    sleepAngle: 4,
  },
  // 3: Tall and thin upright sparrow in center
  {
    d: 'M 0 -28 C 1.5 -29.5 3.5 -29 4.5 -27.5 C 5.5 -26 5 -24.5 4 -23 C 5.5 -20 6 -15 5.5 -10 C 5 -5 4 0 2 0.5 C 1.5 3 1.5 8 1.2 13 C 1 15.5 -0.2 16.5 -0.8 16.5 C -1.4 16.5 -1.5 15 -1.2 12 C -1 7 -1.5 2.5 -2.5 0.5 C -4 0 -4.5 -6 -4.5 -11 C -4.5 -16 -3 -24 -1.5 -27.5 Z',
    beak: 'M 4.5 -27.5 L 8 -27 L 4 -25 Z',
    legs: 'M -1.5 -1.5 L -1.5 0 M 1.5 -1.5 L 1.5 0',
    eye: { cx: 2.5, cy: -26.5 },
    headCenter: '2px -26px',
    sleepAngle: -3,
  },
  // 4: Leaning right, alert posture
  {
    d: 'M 2 -24 C 3.5 -25 5.5 -24.5 6.5 -23 C 7.5 -21.5 7 -20 5.5 -18.5 C 7.5 -15 9 -10 8.5 -5 C 8 0 6 1 4.5 0.5 C 4 3 4.5 8 5 13 C 5.5 16 4.2 17 3.5 16.5 C 2.8 16 1.8 13 1.2 9 C 0.6 5 0 1 -1.5 0.5 C -3.5 0 -5 -6 -4.8 -11 C -4.5 -17 -2 -22.5 0.5 -24 Z',
    beak: 'M 6.5 -23 L 10.5 -22.5 L 6.5 -21 Z',
    legs: 'M 0 -1.5 L 0 0 M 3.5 -1.5 L 3.5 0',
    eye: { cx: 4.5, cy: -22 },
    headCenter: '4px -22px',
    sleepAngle: -4,
  },
  // 5: Singing / looking up-right, arched back, tapered tail
  {
    d: 'M 3 -26 C 4.5 -27 7 -26.5 8 -24.5 C 9 -22.5 8.5 -21 7 -19.5 C 8.5 -16 10 -11 9.5 -5 C 9 0 7.5 1 5.5 0.5 C 5 4 5 9 5.5 14 C 6 17 4.8 17.5 4 16.5 C 3.5 15.5 3 13 2.5 11 C 2 13 1.5 15.5 1 16.5 C 0.2 17.5 -0.8 17 -0.5 15 C 0.5 10 1 5 0.5 0.5 C -1.5 0 -4 -2 -5 -6 C -6.5 -10 -6.5 -15 -5 -19 C -3.5 -24 0 -26.5 2 -26 Z',
    beak: 'M 8 -24.5 L 12.5 -24.5 L 8 -22.5 Z',
    legs: 'M -0.5 -1.5 L -0.5 0 M 3 -1.5 L 3 0',
    eye: { cx: 5.5, cy: -23.5 },
    headCenter: '5px -23px',
    sleepAngle: -5,
  },
  // 6: Upright sparrow just past the sun, rounded chest, long tail straight down
  {
    d: 'M -0.5 -25 C 1 -26.5 3 -26 4 -24.5 C 5 -23 4.8 -21.5 3.5 -20 C 5.5 -17 7 -12 6.5 -6 C 6 0 4.5 1 3 0.5 C 2.5 3 2.5 8 2 13 C 1.8 15.5 0.6 16.5 0 16 C -0.5 15.5 -0.5 13 -0.2 9 C 0 5 -0.5 1 -2 0.5 C -4 -0.5 -5.5 -5.5 -5 -11.5 C -4.5 -17 -2.5 -23.5 -1 -24.5 Z',
    beak: 'M 4 -24.5 L 8 -24 L 4 -22 Z',
    legs: 'M -1 -1.5 L -1 0 M 2 -1.5 L 2 0',
    eye: { cx: 2, cy: -23 },
    headCenter: '2px -23px',
    sleepAngle: -3,
  },
  // 7: Lower wire left companion, plump sparrow facing RIGHT towards Bird 8
  {
    d: 'M 0 -26 C 1.8 -27.5 4 -27 5.5 -25 C 7 -23 6.5 -21 5 -19.5 C 7.2 -16 8.5 -10 7.8 -4 C 7 1.5 5.5 1.5 3.5 0.5 C 3 4 3 9 2.8 14 C 2.5 16.5 1.3 17 0.6 16.5 C -0.1 16 -0.2 13.5 0 10 C 0.2 5 -0.5 1 -2.5 0.5 C -4.8 0 -6.5 -6 -6 -12 C -5.5 -18 -3.5 -24 -1 -25.5 Z',
    beak: 'M 5.5 -25 L 9.5 -24.5 L 5.5 -22.5 Z',
    legs: 'M -1 -1.5 L -1 0 M 2.5 -1.5 L 2.5 0',
    eye: { cx: 3.5, cy: -23.5 },
    headCenter: '3px -23px',
    sleepAngle: -4,
  },
  // 8: Lower wire right companion, facing LEFT towards Bird 7
  {
    d: 'M 0 -25 C -1.8 -26.5 -4 -26 -5.5 -24 C -7 -22 -6.5 -20 -5 -18.5 C -7.2 -15 -8.5 -9 -7.8 -3 C -7 1.5 -5.5 1.5 -3.5 0.5 C -3 4 -3 9 -2.8 14 C -2.5 16.5 -1.3 17 -0.6 16.5 C 0.1 16 0.2 13.5 0 10 C -0.2 5 0.5 1 2.5 0.5 C 4.8 0 6.5 -6 6 -12 C 5.5 -18 3.5 -23.5 1 -24.5 Z',
    beak: 'M -5.5 -24 L -9.5 -23.5 L -5.5 -21.5 Z',
    legs: 'M -2 -1.5 L -2 0 M 1 -1.5 L 1 0',
    eye: { cx: -3.5, cy: -22.5 },
    headCenter: '-3px -22px',
    sleepAngle: 4,
  },
]

export const BIRD_POSES = BIRD_SILHOUETTES

export default function Bird({
  id,
  x,
  y,
  scale = 1,
  color = '#1A1A1A',
  isAsleep = false,
  isFlying = false,
  isNight = false,
  mousePos = null,
  onDipWire = null,
  wireAngle = 0,
}) {
  const [headAngle, setHeadAngle] = useState(0)
  const [hopOffset, setHopOffset] = useState({ x: 0, y: 0 })
  const [wingFlap, setWingFlap] = useState(false)
  const [isBlinking, setIsBlinking] = useState(false)

  const bird = BIRD_SILHOUETTES[id] || BIRD_SILHOUETTES[0]

  // Subtle organic idle animations (blink, head tilt, tiny hop)
  useEffect(() => {
    if (isAsleep || isFlying) return

    // Subtle blink cycle
    const blinkTimer = setInterval(() => {
      if (Math.random() < 0.28) {
        setIsBlinking(true)
        setTimeout(() => setIsBlinking(false), 140)
      }
    }, 4500 + (id % 5) * 800)

    // Subtle head turn / tilt
    const headTimer = setInterval(() => {
      if (Math.random() < 0.35) {
        const angle = (Math.random() - 0.5) * 8
        setHeadAngle(angle)
        setTimeout(() => setHeadAngle(0), 1200 + Math.random() * 800)
      }
    }, 4200 + (id % 6) * 900)

    // Tiny occasional hop along wire
    const hopTimer = setInterval(() => {
      if (Math.random() < 0.16) {
        const dx = (Math.random() - 0.5) * 3
        setHopOffset({ x: dx, y: -2.0 })
        setWingFlap(true)
        onDipWire?.(0.5)

        setTimeout(() => {
          setHopOffset({ x: dx, y: 0 })
          setWingFlap(false)
        }, 160)
      }
    }, 9000 + (id % 7) * 1500)

    return () => {
      clearInterval(blinkTimer)
      clearInterval(headTimer)
      clearInterval(hopTimer)
    }
  }, [id, isAsleep, isFlying, onDipWire])

  // Mouse proximity reaction: head tilts subtly toward cursor
  useEffect(() => {
    if (!mousePos || isAsleep || isFlying || typeof window === 'undefined') return

    const birdScreenX = (x / 1440) * window.innerWidth
    const birdScreenY = (y / 450) * window.innerHeight
    const dist = Math.hypot(mousePos.x - birdScreenX, mousePos.y - birdScreenY)

    if (dist < 80) {
      const dx = mousePos.x - birdScreenX
      const angle = Math.max(-10, Math.min(10, dx * 0.16))
      setHeadAngle(angle)
    }
  }, [mousePos, x, y, isAsleep, isFlying])

  // Wing flap during flight
  useEffect(() => {
    if (!isFlying) return
    const flapInterval = setInterval(() => {
      setWingFlap((prev) => !prev)
    }, 110)
    return () => clearInterval(flapInterval)
  }, [isFlying])

  // Colors & Rim for Night:
  // Night: #090D1B with a 1px rim rgba(228,232,243,0.5)
  const birdColor = color || (isNight ? '#090D1B' : '#1A1A1A')
  const birdRimColor = isNight ? 'rgba(228, 232, 243, 0.5)' : 'none'
  const rimWidth = isNight ? 1 : 0

  // Sleeping pose: hunch body slightly, tuck head, never fade out
  const sleepHunchStyle = isAsleep
    ? 'scale(0.97, 0.90) translateY(1.5px)'
    : ''
  const effectiveHeadAngle = isAsleep ? (bird.sleepAngle || -4) : headAngle

  return (
    <g
      className={`ink-bird bird-${id} ${isFlying ? 'bird-flying' : ''} ${isAsleep ? 'bird-asleep' : ''}`}
      filter="url(#ink-nib-tooth)"
      style={{
        transform: `translate(${x + hopOffset.x}px, ${y + hopOffset.y}px) rotate(${wireAngle}deg) scale(${scale}) ${sleepHunchStyle}`,
        transition: isFlying ? 'none' : 'transform 0.22s cubic-bezier(0.2, 0.8, 0.2, 1)',
        pointerEvents: 'none',
      }}
    >
      {/* ── 1. MAIN SOLID BLACK SILHOUETTE BODY ── */}
      <path
        d={bird.d}
        fill={birdColor}
        stroke={birdRimColor}
        strokeWidth={rimWidth}
        strokeLinejoin="round"
        style={{ paintOrder: 'stroke fill' }}
      />

      {/* ── 2. TWO TINY LEGS TOUCHING THE WIRE AT y = 0 ── */}
      {bird.legs && (
        <path
          d={bird.legs}
          stroke={birdColor}
          strokeWidth="1.4"
          strokeLinecap="round"
        />
      )}

      {/* ── 3. HEAD DETAIL & SHORT POINTED BEAK (With subtle idle tilt) ── */}
      <g
        style={{
          transformOrigin: bird.headCenter || '0px -22px',
          transform: `rotate(${effectiveHeadAngle}deg)`,
          transition: 'transform 0.2s cubic-bezier(0.2, 0.8, 0.2, 1)',
        }}
      >
        {bird.beak && (
          <path
            d={bird.beak}
            fill={birdColor}
            stroke={birdRimColor}
            strokeWidth={isNight ? 0.8 : 0}
            strokeLinejoin="round"
            style={{ paintOrder: 'stroke fill' }}
          />
        )}

        {/* Tiny eye highlight dot (only when awake) */}
        {!isAsleep && !isBlinking && bird.eye && (
          <circle
            cx={bird.eye.cx}
            cy={bird.eye.cy}
            r="0.55"
            fill={isNight ? 'rgba(255, 255, 255, 0.75)' : '#ffffff'}
          />
        )}
      </g>

      {/* ── 4. FLAPPING WINGS (During flight / hop) ── */}
      {(wingFlap || isFlying) && (
        <g className="bird-wings">
          <path
            d={
              wingFlap
                ? 'M -2 -14 C -8 -24 -12 -28 -16 -20 C -14 -16 -6 -9 0 -11 Z'
                : 'M -2 -12 C -6 -16 -10 -16 -12 -11 C -10 -8 -4 -8 0 -10 Z'
            }
            fill={birdColor}
            stroke={birdRimColor}
            strokeWidth={rimWidth}
            opacity={0.92}
          />
          <path
            d={
              wingFlap
                ? 'M 2 -14 C 8 -24 12 -28 16 -20 C 14 -16 6 -9 0 -11 Z'
                : 'M 2 -12 C 6 -16 10 -16 12 -11 C 10 -8 4 -8 0 -10 Z'
            }
            fill={birdColor}
            stroke={birdRimColor}
            strokeWidth={rimWidth}
            opacity={0.92}
          />
        </g>
      )}
    </g>
  )
}
