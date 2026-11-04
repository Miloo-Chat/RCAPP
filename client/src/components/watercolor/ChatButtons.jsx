// client/src/components/watercolor/ChatButtons.jsx
//
// Standalone Two Main Action Buttons: "Text chat" and "Video chat".
// - Bigger buttons: min 260px wide x 72px tall, 20px gap, label font 22px, icon 26px.
// - Text chat: SOLID fill using theme's sun color (#F2D98F noon, #E8A074 sunset, #D6DCE8 night),
//   2.5px solid ink border (#1A1A1A; night: #F3EFE6), ink text (night: deep navy text #0B1226).
// - Video chat: SOLID ink fill (#1A1A1A; night: #F3EFE6), cream text (night: navy text), same border.
// - Hand-drawn offset ink shadow: box-shadow 5px 5px 0 rgba(26,26,26,0.9) (night: rgba(243,239,230,0.35)).
//   Hover: translate(-2px,-2px), shadow 7px, tiny bird hops onto top edge.
//   Press: translate(3px,3px), shadow 2px.
// - Handwritten caption under each: "chat with words" & "see a face" in Caveat 16px, 70% opacity.
// - Mobile: stack, full width, 64px tall.

import { useState, useCallback } from 'react'
import { playBirdChirp, playWaterDrop } from './soundEngine'

export default function ChatButtons({
  onStartText,
  onStartVideo,
  atmosphere,
}) {
  const isNight = atmosphere?.isNight ?? false
  const [hoveredBtn, setHoveredBtn] = useState(null)
  const [clickedBtn, setClickedBtn] = useState(null)

  const handleMouseEnter = useCallback((btn) => {
    setHoveredBtn(btn)
    playBirdChirp(btn === 'text' ? 0 : 1)
  }, [])

  const handleMouseLeave = useCallback((btn) => {
    setHoveredBtn((current) => (current === btn ? null : current))
  }, [])

  const handleClickText = useCallback(() => {
    setClickedBtn('text')
    playWaterDrop()
    setTimeout(() => {
      onStartText?.()
      setClickedBtn(null)
    }, 280)
  }, [onStartText])

  const handleClickVideo = useCallback(() => {
    setClickedBtn('video')
    playWaterDrop()
    setTimeout(() => {
      onStartVideo?.()
      setClickedBtn(null)
    }, 280)
  }, [onStartVideo])

  // ── Palette Tokens per Theme ──
  // 1) Text Chat Button: SOLID fill with theme's sun color, 2.5px solid border, ink text
  const textBtnBg = isNight
    ? (atmosphere?.moonColor || '#D6DCE8')
    : (atmosphere?.sunColor || '#F4D77A')
  const textBtnBorder = isNight ? '#F3EFE6' : '#1A1A1A'
  const textBtnColor = isNight ? '#0B1226' : '#1A1A1A'

  // 2) Video Chat Button: SOLID ink fill (#1A1A1A; night: #F3EFE6), cream text (night: deep navy)
  const videoBtnBg = isNight ? '#F3EFE6' : '#1A1A1A'
  const videoBtnBorder = isNight ? '#F3EFE6' : '#1A1A1A'
  const videoBtnColor = isNight ? '#0B1226' : '#FAF7EF'

  // 3) Shadow tokens
  const shadowColor = isNight ? 'rgba(243, 239, 230, 0.35)' : 'rgba(26, 26, 26, 0.9)'
  const isDarkPaper = (atmosphere?.paperBg
    ? (atmosphere.paperBg[0] * 0.299 + atmosphere.paperBg[1] * 0.587 + atmosphere.paperBg[2] * 0.114)
    : (isNight ? 50 : 240)) < 128
  const captionColor = isDarkPaper ? '#F0F3F8' : '#1A1A1A'

  return (
    <div
      className="miloo-main-action-buttons"
      role="group"
      aria-label="Start chatting"
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        gap: '20px',
        width: '100%',
        margin: '0 auto',
        zIndex: 25,
        pointerEvents: 'auto',
      }}
    >
      {/* ── BUTTON 1: TEXT CHAT ── */}
      <div
        className="btn-column-wrapper"
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <div className="btn-perch-wrapper" style={{ position: 'relative' }}>
          {/* Perched bird hopping onto top edge of button on hover */}
          <div
            className={`btn-perched-bird ${hoveredBtn === 'text' ? 'visible' : ''} ${clickedBtn === 'text' ? 'flying' : ''}`}
            aria-hidden="true"
          >
            <svg
              width="30"
              height="28"
              viewBox="0 0 28 26"
              fill={textBtnBorder}
              filter="url(#ink-nib-tooth)"
            >
              <path d="M 6 18 C 3 12 5 6 11 5 C 14 4 18 6 17 10 C 16 13 13 16 9 18 Z" />
              <circle cx="13" cy="6.5" r="3.2" />
              <path d="M 15 5.5 L 21 6.5 L 15 8 Z" />
              <path d="M 5 17 C 3 20 2 23 1 25 C 3 24 5 21 7 18 Z" />
              <path
                d="M 7 19 L 6 24 M 11 19 L 10 24"
                stroke={textBtnBorder}
                strokeWidth="1.6"
                strokeLinecap="round"
              />
              <circle cx="14" cy="6" r="0.6" fill={isNight ? '#0B1226' : '#ffffff'} />
            </svg>
          </div>

          <button
            type="button"
            onClick={handleClickText}
            onMouseEnter={() => handleMouseEnter('text')}
            onMouseLeave={() => handleMouseLeave('text')}
            aria-label="Start Text Chat with a real stranger"
            className="miloo-chat-btn text-chat-btn"
            style={{
              position: 'relative',
              minWidth: '260px',
              height: '72px',
              padding: '0 32px',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '14px',
              backgroundColor: textBtnBg,
              color: textBtnColor,
              fontFamily: 'var(--font-serif)',
              fontSize: '22px',
              fontWeight: 500,
              letterSpacing: '0.01em',
              cursor: 'pointer',
              border: `2.5px solid ${textBtnBorder}`,
              borderRadius: '36px',
              outline: 'none',
              boxShadow: `5px 5px 0 ${shadowColor}`,
              userSelect: 'none',
            }}
          >
            {/* Hand-drawn ink speech-bubble icon (26px) */}
            <span
              className="btn-ink-icon"
              style={{
                display: 'inline-flex',
                color: 'inherit',
                width: '26px',
                height: '26px',
              }}
            >
              <svg
                width="26"
                height="26"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
            </span>

            <span className="btn-label-text">Text chat</span>
          </button>
        </div>

        {/* Handwritten caption in Caveat 18px */}
        <div
          className="btn-handwritten-caption"
          style={{
            fontFamily: "var(--font-hand), 'Caveat', cursive, sans-serif",
            fontSize: '18px',
            color: captionColor,
            marginTop: '8px',
            textAlign: 'center',
            letterSpacing: '0.02em',
          }}
        >
          chat with words
        </div>
      </div>

      {/* ── BUTTON 2: VIDEO CHAT ── */}
      <div
        className="btn-column-wrapper"
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <div className="btn-perch-wrapper" style={{ position: 'relative' }}>
          {/* Perched bird hopping onto top edge of button on hover */}
          <div
            className={`btn-perched-bird ${hoveredBtn === 'video' ? 'visible' : ''} ${clickedBtn === 'video' ? 'flying' : ''}`}
            aria-hidden="true"
          >
            <svg
              width="30"
              height="28"
              viewBox="0 0 28 26"
              fill={videoBtnBorder}
              filter="url(#ink-nib-tooth)"
            >
              <path d="M 6 18 C 3 12 5 6 11 5 C 14 4 18 6 17 10 C 16 13 13 16 9 18 Z" />
              <circle cx="13" cy="6.5" r="3.2" />
              <path d="M 15 5.5 L 21 6.5 L 15 8 Z" />
              <path d="M 5 17 C 3 20 2 23 1 25 C 3 24 5 21 7 18 Z" />
              <path
                d="M 7 19 L 6 24 M 11 19 L 10 24"
                stroke={videoBtnBorder}
                strokeWidth="1.6"
                strokeLinecap="round"
              />
              <circle cx="14" cy="6" r="0.6" fill={isNight ? '#0B1226' : '#ffffff'} />
            </svg>
          </div>

          <button
            type="button"
            onClick={handleClickVideo}
            onMouseEnter={() => handleMouseEnter('video')}
            onMouseLeave={() => handleMouseLeave('video')}
            aria-label="Start Video Chat with a real stranger"
            className="miloo-chat-btn video-chat-btn"
            style={{
              position: 'relative',
              minWidth: '260px',
              height: '72px',
              padding: '0 32px',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '14px',
              backgroundColor: videoBtnBg,
              color: videoBtnColor,
              fontFamily: 'var(--font-serif)',
              fontSize: '22px',
              fontWeight: 500,
              letterSpacing: '0.01em',
              cursor: 'pointer',
              border: `2.5px solid ${videoBtnBorder}`,
              borderRadius: '36px',
              outline: 'none',
              boxShadow: `5px 5px 0 ${shadowColor}`,
              userSelect: 'none',
            }}
          >
            {/* Hand-drawn ink camera icon (26px) */}
            <span
              className="btn-ink-icon"
              style={{
                display: 'inline-flex',
                color: 'inherit',
                width: '26px',
                height: '26px',
              }}
            >
              <svg
                width="26"
                height="26"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="2" y="5" width="13" height="14" rx="2.5" ry="2.5" />
                <path d="M15 10l5-3v10l-5-3v-4z" />
              </svg>
            </span>

            <span className="btn-label-text">Video chat</span>
          </button>
        </div>

        {/* Handwritten caption in Caveat 18px */}
        <div
          className="btn-handwritten-caption"
          style={{
            fontFamily: "var(--font-hand), 'Caveat', cursive, sans-serif",
            fontSize: '18px',
            color: captionColor,
            marginTop: '8px',
            textAlign: 'center',
            letterSpacing: '0.02em',
          }}
        >
          see a face
        </div>
      </div>

      <style>{`
        /* ── Button Interactive Transitions & Offset Shadows ── */
        .miloo-chat-btn {
          transition: transform 0.16s cubic-bezier(0.2, 0.8, 0.2, 1),
                      box-shadow 0.16s cubic-bezier(0.2, 0.8, 0.2, 1),
                      background-color 0.2s ease,
                      border-color 0.2s ease;
        }

        /* Hover: translate(-2px, -2px) and grow shadow to 7px */
        .miloo-chat-btn:hover {
          transform: translate(-2px, -2px);
          box-shadow: 7px 7px 0 ${shadowColor} !important;
        }

        /* Active / Press: translate(3px, 3px) and shrink shadow to 2px */
        .miloo-chat-btn:active {
          transform: translate(3px, 3px);
          box-shadow: 2px 2px 0 ${shadowColor} !important;
        }

        .miloo-chat-btn:focus-visible {
          outline: 2px dashed #d95236;
          outline-offset: 4px;
        }

        /* ── Perched Bird Animation on Button Top Edge ── */
        .btn-perched-bird {
          position: absolute;
          top: -24px;
          right: 32px;
          pointer-events: none;
          opacity: 0;
          transform: translateY(-12px) scale(0.7);
          transition: opacity 0.18s ease, transform 0.22s cubic-bezier(0.18, 0.9, 0.2, 1.2);
          z-index: 10;
        }
        .btn-perched-bird.visible {
          opacity: 1;
          transform: translateY(0) scale(1);
        }
        .btn-perched-bird.flying {
          opacity: 0;
          transform: translate(14px, -55px) scale(1.1);
          transition: opacity 0.25s ease-in, transform 0.3s cubic-bezier(0.2, 0.8, 0.2, 1);
        }

        /* ── Mobile Layout (Stack, Full Width, 64px Tall) ── */
        @media (max-width: 640px) {
          .miloo-main-action-buttons {
            flex-direction: column !important;
            gap: 16px !important;
            width: 100% !important;
            max-width: 340px !important;
          }
          .btn-column-wrapper {
            width: 100% !important;
          }
          .btn-perch-wrapper {
            width: 100% !important;
          }
          .miloo-chat-btn {
            width: 100% !important;
            min-width: 100% !important;
            height: 64px !important;
            font-size: 20px !important;
            padding: 0 24px !important;
          }
          .btn-ink-icon {
            width: 24px !important;
            height: 24px !important;
          }
          .btn-ink-icon svg {
            width: 24px !important;
            height: 24px !important;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .miloo-chat-btn, .btn-perched-bird {
            transition: none !important;
            animation: none !important;
          }
        }
      `}</style>
    </div>
  )
}
