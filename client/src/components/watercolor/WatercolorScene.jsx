// client/src/components/watercolor/WatercolorScene.jsx
//
// Master Watercolor Scene Component for Miloo.
// Renders the authentic watercolor-and-ink painting aesthetic matching the reference painting:
// - Grey-cream textured paper (#EFECE5 range) with strong, visible rough cold-press paper grain
// - ONE centered watercolor sun (~420px wide) / pale grey-blue moon at night
// - Two smooth, thin ink lines (2px, #1A1A1A, cubic Beziers, round caps, full width edge-to-edge)
// - Exactly 9 ink sparrow birds in reference poses (7 on upper wire, 2 on lower wire facing each other)
// - Centered under the art: Two main buttons ("Text chat" transparent fill, "Video chat" pale wash)
// - Connecting matchmaking scene and developer controls (?dev=1)

import { useState, useEffect, useRef, useCallback } from 'react'
import SunMoon from './SunMoon'
import Wires, { getWireY } from './Wires'
import Bird from './Bird'
import ChatButtons from './ChatButtons'
import Stars from './Stars'
import InkClouds from './InkClouds'
import RainEffect from './RainEffect'
import ConnectingScene from './ConnectingScene'
import DevControls from './DevControls'
import GoldenHours from '../GoldenHours'
import TurnstileModal from '../TurnstileModal'
import { playBirdChirp } from './soundEngine'

export default function WatercolorScene({
  atmosphere,
  moonPhase,
  timeEngine,
  onStartText,
  onStartVideo,
  onStartVoice,
  isAgeVerified,
  onRequestAgeModal,
}) {
  const wiresRef = useRef(null)
  const containerRef = useRef(null)

  // Mouse coordinates for subtle parallax
  const [mousePos, setMousePos] = useState(null)
  const [parallax, setParallax] = useState({ x: 0, y: 0 })

  // Page Initial Bloom moment state
  const [isBloomActive, setIsBloomActive] = useState(false)

  // Connecting Matchmaking state ('text' | 'video' | null)
  const [connectingMode, setConnectingMode] = useState(null)

  // Flock departing bird state (birds temporarily taking flight)
  const [flyingBirdIds, setFlyingBirdIds] = useState(new Set())

  // Initial Bloom trigger on mount
  useEffect(() => {
    if (typeof window === 'undefined') return
    const prefersReducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    if (!prefersReducedMotion) {
      setIsBloomActive(true)
      const timer = setTimeout(() => setIsBloomActive(false), 2200)
      return () => clearTimeout(timer)
    }
  }, [])

  const replayBloom = useCallback(() => {
    setIsBloomActive(true)
    setTimeout(() => setIsBloomActive(false), 2200)
  }, [])

  // Mouse move handler for subtle parallax
  const handleMouseMove = useCallback((e) => {
    const { clientX, clientY } = e
    setMousePos({ x: clientX, y: clientY })

    const px = (clientX / window.innerWidth - 0.5) * 2
    const py = (clientY / window.innerHeight - 0.5) * 2
    setParallax({ x: px * 4, y: py * 3 })
  }, [])

  // Wire dip callbacks
  const handleDipTopWire = useCallback((amount = 2.5) => {
    wiresRef.current?.dipTopWire(amount)
  }, [])

  const handleDipBottomWire = useCallback((amount = 2.5) => {
    wiresRef.current?.dipBottomWire(amount)
  }, [])

  // Flock departure timer: every 24-38 seconds, 1 bird takes off for a graceful flight loop
  useEffect(() => {
    if (typeof window === 'undefined') return
    const prefersReducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    if (prefersReducedMotion) return

    const flockTimer = setInterval(() => {
      const candidateBirds = [1, 3, 5]
      const chosen = candidateBirds[Math.floor(Math.random() * candidateBirds.length)]

      setFlyingBirdIds((prev) => new Set([...prev, chosen]))
      playBirdChirp(2)
      handleDipTopWire(3)

      setTimeout(() => {
        setFlyingBirdIds((prev) => {
          const next = new Set(prev)
          next.delete(chosen)
          return next
        })
        handleDipTopWire(2.5)
        playBirdChirp(0)
      }, 4200)
    }, 34000)

    return () => clearInterval(flockTimer)
  }, [handleDipTopWire])

  // Turnstile security verification state
  const [turnstileOpen, setTurnstileOpen] = useState(false)
  const [pendingMode, setPendingMode] = useState(null)

  const isTurnstileVerified = useCallback(() => {
    if (typeof window === 'undefined') return true
    try {
      const verified = sessionStorage.getItem('miloo_turnstile_verified') === 'true'
      const token = sessionStorage.getItem('miloo_turnstile_token')
      return verified && !!token
    } catch {
      return false
    }
  }, [])

  const startConnectFlow = useCallback((mode) => {
    if (isTurnstileVerified()) {
      setConnectingMode(mode)
    } else {
      setPendingMode(mode)
      setTurnstileOpen(true)
    }
  }, [isTurnstileVerified])

  const handleTurnstileSuccess = useCallback((verificationToken) => {
    setTurnstileOpen(false)
    if (verificationToken) {
      try {
        sessionStorage.setItem('miloo_turnstile_token', verificationToken)
        sessionStorage.setItem('miloo_turnstile_verified', 'true')
      } catch (_) {}
    }
    if (pendingMode) {
      setConnectingMode(pendingMode)
      setPendingMode(null)
    }
  }, [pendingMode])

  // Click handlers for the two main buttons
  const handleInitiateText = useCallback(() => {
    if (isAgeVerified?.()) {
      startConnectFlow('text')
    } else {
      onRequestAgeModal?.('text', () => startConnectFlow('text'))
    }
  }, [isAgeVerified, onRequestAgeModal, startConnectFlow])

  const handleInitiateVideo = useCallback(() => {
    if (isAgeVerified?.()) {
      startConnectFlow('video')
    } else {
      onRequestAgeModal?.('video', () => startConnectFlow('video'))
    }
  }, [isAgeVerified, onRequestAgeModal, startConnectFlow])

  const handleInitiateVoice = useCallback(() => {
    if (isAgeVerified?.()) {
      startConnectFlow('voice')
    } else {
      onRequestAgeModal?.('voice', () => startConnectFlow('voice'))
    }
  }, [isAgeVerified, onRequestAgeModal, startConnectFlow])

  const handleConfirmConnect = useCallback((mode) => {
    setConnectingMode(null)
    if (mode === 'text') onStartText?.()
    else if (mode === 'voice') onStartVoice?.()
    else onStartVideo?.()
  }, [onStartText, onStartVideo, onStartVoice])

  // ── 9 Ink Birds Exactly Matching Reference Painting Arrangement ──
  // Sun is centered at cx = 720, cy = 225, r = 210 (sun spans x: 510 to 930)
  // Scale 1.0 renders each bird ~40-45px tall (40% bigger than previous 30px)
  //
  // Upper Wire Birds (7 total):
  // - Left group of 3:
  //   * Bird 0: outside left of sun (x: 485)
  //   * Bird 1: just inside left sun border (x: 535)
  //   * Bird 2: hunched sparrow with tail flicked UP to the right (x: 615)
  // - Middle bird:
  //   * Bird 3: tall and thin upright sparrow (x: 712)
  // - Right group of 3:
  //   * Bird 4: leaning right, alert (x: 835)
  //   * Bird 5: singing / looking right near rim (x: 895)
  //   * Bird 6: upright just past the sun (x: 955, outside right)
  const topBirds = [
    { id: 0, x: 485, yOffset: 0, scale: 1.15 },
    { id: 1, x: 535, yOffset: 0, scale: 1.15 },
    { id: 2, x: 615, yOffset: 0, scale: 1.15 },
    { id: 3, x: 712, yOffset: 0, scale: 1.15 },
    { id: 4, x: 835, yOffset: 0, scale: 1.15 },
    { id: 5, x: 895, yOffset: 0, scale: 1.15 },
    { id: 6, x: 955, yOffset: 0, scale: 1.15 },
  ]

  // Lower Wire Birds (2 companion birds close together, left of centre, facing each other):
  // - Bird 7: inside sun lower-left (x: 590, facing right towards Bird 8)
  // - Bird 8: inside sun lower-left (x: 638, facing left towards Bird 7)
  const bottomBirds = [
    { id: 7, x: 590, yOffset: 0, scale: 1.15 },
    { id: 8, x: 638, yOffset: 0, scale: 1.15 },
  ]

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className="watercolor-scene-container"
      style={{
        position: 'relative',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        userSelect: 'none',
      }}
    >
      {/* ── 1. STARS (Tiny, sparse, soft at night) ── */}
      <Stars starsOpacity={atmosphere.starsOpacity} />

      {/* ── 4. HORIZONTAL WATERCOLOR STREAKS (Sunset theme) ── */}
      <InkClouds
        sunsetWashOpacity={atmosphere.sunsetWashOpacity}
        isNight={atmosphere.isNight}
      />

      {/* ── 5. RAIN EFFECT (Optional toggle via dev scrubber) ── */}
      <RainEffect active={timeEngine.rainMode} isNight={atmosphere.isNight} />

      {/* ── 6. HERO ARTWORK CONTAINER (Edge-to-edge wires across full width, centered sun) ── */}
      <div
        className="watercolor-hero-artwork"
        style={{
          position: 'relative',
          width: '100vw',
          height: 'min(420px, 46vh)',
          minHeight: '260px',
          overflow: 'visible',
          transform: `translate3d(${parallax.x}px, ${parallax.y}px, 0)`,
          transition: 'transform 0.2s cubic-bezier(0.2, 0.8, 0.2, 1)',
          zIndex: 8,
        }}
      >
        {/* Pale translucent Watercolor Sun & Muted pale grey-blue Moon */}
        <SunMoon
          atmosphere={atmosphere}
          isBloomActive={isBloomActive}
        />

        {/* Diagonal sagging ink wires & perched ink birds spanning edge to edge */}
        <svg
          viewBox="0 0 1440 450"
          preserveAspectRatio="none"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            overflow: 'visible',
            zIndex: 10,
          }}
          aria-hidden="true"
        >
          {/* Smooth, thin 2px cubic Bezier ink wires (no jagged noise filter) */}
          <Wires
            ref={wiresRef}
            wireColor={atmosphere.wireColor}
            isBloomActive={isBloomActive}
          />

          {/* Top Wire Perched Birds (7 total, slope ~9.5 deg) */}
          {topBirds.map((b, idx) => {
            const isFlying = flyingBirdIds.has(b.id)
            const isAsleep = atmosphere.isNight && idx > 2
            const wireY = getWireY(0, b.x)

            return (
              <Bird
                key={b.id}
                id={b.id}
                x={b.x}
                y={isFlying ? wireY - 75 : wireY + (b.yOffset || 0)}
                scale={b.scale}
                color={atmosphere.birdSilhouette}
                isAsleep={isAsleep}
                isFlying={isFlying}
                isNight={atmosphere.isNight}
                mousePos={mousePos}
                onDipWire={handleDipTopWire}
                wireAngle={isFlying ? 0 : (b.wireAngle || 9.5)}
              />
            )
          })}

          {/* Bottom Wire Perched Birds (2 companion birds facing each other, slope ~6.0 deg) */}
          {bottomBirds.map((b, idx) => {
            const isFlying = flyingBirdIds.has(b.id)
            const isAsleep = atmosphere.isNight && idx > 0
            const wireY = getWireY(1, b.x)

            return (
              <Bird
                key={b.id}
                id={b.id}
                x={b.x}
                y={isFlying ? wireY - 70 : wireY + (b.yOffset || 0)}
                scale={b.scale}
                color={atmosphere.birdSilhouette}
                isAsleep={isAsleep}
                isFlying={isFlying}
                isNight={atmosphere.isNight}
                mousePos={mousePos}
                onDipWire={handleDipBottomWire}
                wireAngle={isFlying ? 0 : (b.wireAngle || 6.0)}
              />
            )
          })}
        </svg>
      </div>

      {/* ── 7. TWO MAIN CHAT BUTTONS CENTERED UNDER THE ARTWORK ── */}
      <div
        className="watercolor-buttons-wrapper"
        style={{
          width: '100%',
          marginTop: 'clamp(14px, 2.5vh, 26px)',
          zIndex: 22,
        }}
      >
        <ChatButtons
          onStartText={handleInitiateText}
          onStartVideo={handleInitiateVideo}
          onStartVoice={handleInitiateVoice}
          atmosphere={atmosphere}
        />
        <GoldenHours isNight={atmosphere.isNight} />
      </div>

      {/* Cloudflare Turnstile Verification Modal */}
      <TurnstileModal
        isOpen={turnstileOpen}
        onSuccess={handleTurnstileSuccess}
        onCancel={() => {
          setTurnstileOpen(false)
          setPendingMode(null)
        }}
      />

      {/* ── 8. CONNECTING / MATCHMAKING SEARCH OVERLAY ── */}
      <ConnectingScene
        active={connectingMode !== null}
        mode={connectingMode || 'video'}
        wireColor={atmosphere.wireColor}
        isNight={atmosphere.isNight}
        onConfirmConnect={handleConfirmConnect}
        onCancel={() => setConnectingMode(null)}
      />

      {/* ── 9. DEV CONTROLS TIME SCRUBBER (Hidden unless ?dev=1) ── */}
      <DevControls
        hour={timeEngine.hour}
        formattedTime={timeEngine.formattedTime}
        atmosphere={atmosphere}
        moonPhase={moonPhase}
        isAuto={timeEngine.isAuto}
        onSetHour={timeEngine.setManualHour}
        onResetAuto={timeEngine.resetToAuto}
        rainMode={timeEngine.rainMode}
        onToggleRain={() => timeEngine.setRainMode((r) => !r)}
        onReplayBloom={replayBloom}
      />
    </div>
  )
}
