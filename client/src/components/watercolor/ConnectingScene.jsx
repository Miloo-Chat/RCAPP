// client/src/components/watercolor/ConnectingScene.jsx
//
// Searching & Matching Experience:
// 1. Searching: your bird takes flight into the open sky ("Looking for someone out there...").
// 2. Matched: another bird flies in from the horizon, they meet, land together on the wire,
//    and a small ink heart blooms.
// 3. Skip / Next stranger: sends the other bird flying away and resumes searching.
// 4. Smooth paper-wipe transition to the active chat session.

import { useState, useEffect, useCallback, useRef } from 'react'
import { playBirdChirp, playWaterDrop } from './soundEngine'
import Bird, { BIRD_POSES } from './Bird'

export default function ConnectingScene({
  active = false,
  mode = 'video', // 'text' | 'video'
  wireColor = '#141210',
  isNight = false,
  onConfirmConnect,
  onCancel,
}) {
  // State: 'searching' | 'meeting' | 'matched' | 'wiping'
  const [stage, setStage] = useState('searching')
  const [matchCount, setMatchCount] = useState(1)
  const [isWiping, setIsWiping] = useState(false)

  // Bird flight coordinates (0..1000, 0..800)
  const [bird1Pos, setBird1Pos] = useState({ x: 500, y: 260, scale: 1.2 })
  const [bird2Pos, setBird2Pos] = useState({ x: 1050, y: 150, scale: 1.2 })

  // When connecting scene activates
  useEffect(() => {
    if (!active) {
      setStage('searching')
      return
    }

    setStage('searching')
    playBirdChirp(0)

    // Simulate flight searching curve
    let searchAngle = 0
    const flightInterval = setInterval(() => {
      searchAngle += 0.05
      setBird1Pos({
        x: 500 + Math.sin(searchAngle) * 140,
        y: 220 + Math.cos(searchAngle * 2) * 35,
        scale: 1.25,
      })
    }, 40)

    // Mock match found after 2.6 seconds (Can be plugged into real WebSocket event)
    const matchTimer = setTimeout(() => {
      clearInterval(flightInterval)
      setStage('meeting')
      playBirdChirp(1)

      // Animate second bird arriving from right horizon and landing together
      setBird2Pos({ x: 555, y: 310, scale: 1.15 })
      setBird1Pos({ x: 520, y: 310, scale: 1.15 })

      setTimeout(() => {
        setStage('matched')
        playWaterDrop()
      }, 750)
    }, 2800)

    return () => {
      clearInterval(flightInterval)
      clearTimeout(matchTimer)
    }
  }, [active, matchCount])

  // Handle "Skip / Next stranger"
  const handleSkipStranger = useCallback(() => {
    playBirdChirp(2)
    // Send other bird flying away to left horizon
    setBird2Pos({ x: -100, y: 80, scale: 0.8 })
    setStage('searching')
    setMatchCount((prev) => prev + 1)
  }, [])

  // Handle "Enter Conversation" with soft paper wipe
  const handleEnterChat = useCallback(() => {
    setIsWiping(true)
    playWaterDrop()
    setTimeout(() => {
      onConfirmConnect?.(mode)
    }, 450)
  }, [mode, onConfirmConnect])

  if (!active) return null

  const inkColor = isNight ? '#f0f4fa' : '#1c1815'
  const subInk = isNight ? '#a8b9ce' : '#6b6055'
  const cardBg = isNight ? 'rgba(23, 30, 44, 0.94)' : 'rgba(252, 249, 242, 0.96)'
  const cardBorder = isNight ? 'rgba(140, 160, 190, 0.28)' : 'rgba(50, 40, 30, 0.22)'


  // miloo-auto-enter: match milte hi seedha chat mein, card ke bina
  const autoEnteredRef = useRef(false)
  useEffect(() => {
    if (stage === 'matched' && !autoEnteredRef.current) {
      autoEnteredRef.current = true
      const t = setTimeout(() => handleEnterChat(), 350)
      return () => clearTimeout(t)
    }
  }, [stage, handleEnterChat])

  return (
    <div
      className={`connecting-overlay ${isWiping ? 'paper-wiping' : ''}`}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 50,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backdropFilter: 'blur(3px)',
        backgroundColor: isNight ? 'rgba(10, 14, 24, 0.75)' : 'rgba(245, 240, 230, 0.78)',
        transition: 'opacity 0.4s ease',
      }}
    >
      {/* ── FLIGHT STAGE SVG ── */}
      <svg
        viewBox="0 0 1000 800"
        preserveAspectRatio="xMidYMid meet"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
        }}
      >
        {/* Soft temporary wire for birds to land on */}
        <path
          d="M 200 315 Q 500 325 800 315"
          fill="none"
          stroke={wireColor}
          strokeWidth="1.6"
          strokeDasharray="4 2"
          opacity={0.7}
          filter="url(#ink-wobble)"
        />

        {/* Bird 1 (Your Bird) */}
        <Bird
          id={901}
          x={bird1Pos.x}
          y={bird1Pos.y}
          scale={bird1Pos.scale}
          color={inkColor}
          isFlying={stage === 'searching' || stage === 'meeting'}
          pose={stage === 'matched' ? 'plumpTailUp' : 'upright'}
        />

        {/* Bird 2 (Stranger Bird) */}
        {(stage === 'meeting' || stage === 'matched') && (
          <Bird
            id={902}
            x={bird2Pos.x}
            y={bird2Pos.y}
            scale={bird2Pos.scale}
            color={inkColor}
            isFlying={stage === 'meeting'}
            pose={stage === 'matched' ? 'lookingBack' : 'tilted'}
          />
        )}

        {/* Blooming Ink Heart / Ripple when matched */}
        {stage === 'matched' && (
          <g transform="translate(537, 285)">
            {/* Soft watercolor heart */}
            <path
              d="M 0 0 C -5 -7 -12 -3 -10 3 C -8 8 0 13 0 15 C 0 13 8 8 10 3 C 12 -3 5 -7 0 0 Z"
              fill={isNight ? '#f28b74' : '#d95236'}
              opacity={0.88}
              filter="url(#watercolor-soft)"
              className="ink-heart-bloom-path"
            />
            {/* Ripple ring */}
            <circle
              cx="0"
              cy="6"
              r="22"
              fill="none"
              stroke={isNight ? 'rgba(240, 150, 130, 0.5)' : 'rgba(217, 82, 54, 0.4)'}
              strokeWidth="1.2"
              className="heart-ripple-circle"
            />
          </g>
        )}
      </svg>

      {/* ── CARD CONTENT & CONTROLS ── */}
      <div
        className="connecting-dialog"
        style={{
          position: 'relative',
          zIndex: 10,
          background: cardBg,
          border: `1.8px solid ${cardBorder}`,
          borderRadius: '16px',
          padding: 'clamp(24px, 5vw, 36px)',
          maxWidth: '460px',
          width: '90%',
          boxShadow: isNight
            ? '0 16px 48px rgba(0,0,0,0.6)'
            : '0 16px 40px rgba(160, 130, 90, 0.22)',
          textAlign: 'center',
          marginTop: '180px', // leave room for flying birds above
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '12px',
        }}
      >
        {stage === 'searching' && (
          <>
            <h2
              style={{
                fontFamily: 'var(--font-hand)',
                fontSize: 'clamp(24px, 4vw, 32px)',
                fontWeight: 600,
                color: inkColor,
                margin: 0,
                lineHeight: 1.2,
              }}
            >
              Looking for someone out there...
            </h2>
            <p
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '14px',
                color: subInk,
                margin: 0,
              }}
            >
              Matching you with a real stranger for {mode === 'video' ? 'video' : 'text'} chat.
            </p>
          </>
        )}

        {false && (
          <>
            <span
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: '13px',
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color: 'var(--accent)',
                fontWeight: 600,
              }}
            >
              Stranger Found
            </span>

            <h2
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: 'clamp(24px, 4vw, 32px)',
                fontWeight: 600,
                color: inkColor,
                margin: '2px 0 0',
                lineHeight: 1.15,
              }}
            >
              Someone has landed.
            </h2>

            <p
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '14.5px',
                color: subInk,
                margin: 0,
              }}
            >
              No algorithm, no profiles. Just two real people connected across the wires.
            </p>

            <div
              style={{
                display: 'flex',
                gap: '12px',
                width: '100%',
                marginTop: '12px',
                flexWrap: 'wrap',
                justifyContent: 'center',
              }}
            >
              {/* Primary Connect Button */}
              <button
                type="button"
                onClick={handleEnterChat}
                className="ink-btn-primary"
                style={{
                  flex: '1 1 180px',
                  minHeight: '48px',
                  padding: '12px 24px',
                  borderRadius: '999px',
                  background: 'var(--accent)',
                  color: '#ffffff',
                  border: 'none',
                  fontFamily: 'var(--font-serif)',
                  fontSize: '16px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  boxShadow: '0 4px 14px rgba(217, 82, 54, 0.35)',
                  transition: 'transform 0.15s ease, filter 0.15s ease',
                }}
              >
                Enter {mode === 'video' ? 'Video' : 'Text'} Chat →
              </button>

              {/* Skip / Next stranger button */}
              <button
                type="button"
                onClick={handleSkipStranger}
                className="ink-btn-secondary"
                style={{
                  minHeight: '48px',
                  padding: '12px 20px',
                  borderRadius: '999px',
                  background: 'transparent',
                  border: `1.5px solid ${cardBorder}`,
                  color: inkColor,
                  fontFamily: 'var(--font-serif)',
                  fontSize: '15px',
                  fontWeight: 500,
                  cursor: 'pointer',
                  transition: 'background 0.15s ease',
                }}
              >
                Skip / Next stranger
              </button>
            </div>
          </>
        )}

        {/* Cancel button */}
        <button
          type="button"
          onClick={onCancel}
          style={{
            marginTop: '8px',
            background: 'none',
            border: 'none',
            fontFamily: 'var(--font-hand)',
            fontSize: '16px',
            color: subInk,
            cursor: 'pointer',
            padding: '6px 12px',
            textDecoration: 'underline',
            opacity: 0.85,
          }}
        >
          Return to wire perch
        </button>
      </div>

      <style>{`
        @keyframes heartFloat {
          0% {
            transform: scale(0.3) translateY(8px);
            opacity: 0;
          }
          60% {
            transform: scale(1.15) translateY(-3px);
            opacity: 1;
          }
          100% {
            transform: scale(1) translateY(0);
            opacity: 0.95;
          }
        }
        .ink-heart-bloom-path {
          transform-origin: 0 6px;
          animation: heartFloat 0.6s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
        }
        @keyframes rippleOut {
          0% {
            r: 4;
            opacity: 0.8;
          }
          100% {
            r: 32;
            opacity: 0;
          }
        }
        .heart-ripple-circle {
          animation: rippleOut 1.2s ease-out infinite;
        }
        .paper-wiping {
          opacity: 0;
          pointer-events: none;
          transition: opacity 0.45s cubic-bezier(0.4, 0, 0.2, 1);
        }
      `}</style>
    </div>
  )
}
