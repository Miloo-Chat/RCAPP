// client/src/pages/NotFound.jsx
//
// 404 Page: "This bird flew away."
// - Empty sagging ink wire across the scene (vacant perch)
// - One bird flying away into the sky
// - Watercolor sun wash in background
// - "Go home" button

import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import SEOHead from '../components/SEOHead'
import { useAtmosphere } from '../context/AtmosphereContext'
import Bird from '../components/watercolor/Bird'

export default function NotFound({ theme, onToggleTheme }) {
  const navigate = useNavigate()
  const { atmosphere, isNight } = useAtmosphere()

  const wireColor = atmosphere?.wireColor || (isNight ? '#ECEBF0' : '#1A1A1A')
  const inkColor = isNight ? '#ECEBF0' : '#232220'
  const subInk = isNight ? '#A7A6B5' : '#6A625A'
  const sunWash = isNight ? '#D6DCE8' : (atmosphere?.sunColor || '#F4D77A')

  return (
    <div
      className="page page-enter"
      style={{
        background: 'var(--bg-0)',
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <SEOHead
        title="404 — This bird flew away · miloo"
        description="This bird flew away. The perch is empty, but another conversation is waiting on the main wire."
        canonicalUrl="https://miloo.chat/404"
        noindex={true}
      />

      <Navbar theme={theme} onToggleTheme={onToggleTheme} />

      <main
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          padding: '40px 24px 60px',
          position: 'relative',
          zIndex: 5,
        }}
      >
        {/* Watercolor Illustration: Empty Wire & Flying Bird */}
        <div
          style={{
            position: 'relative',
            width: '100%',
            maxWidth: '720px',
            height: '240px',
            margin: '0 auto 20px',
          }}
          aria-hidden="true"
        >
          <svg
            viewBox="0 0 720 240"
            preserveAspectRatio="xMidYMid meet"
            style={{ width: '100%', height: '100%', overflow: 'visible' }}
          >
            {/* Soft watercolor sun wash behind wire */}
            <circle
              cx="360"
              cy="120"
              r="75"
              fill={sunWash}
              opacity={isNight ? 0.35 : 0.45}
              style={{ filter: 'blur(8px)' }}
            />

            {/* Empty sagging wire (no birds perched) */}
            <path
              d="M 20 125 C 240 148, 480 148, 700 135"
              fill="none"
              stroke={wireColor}
              strokeWidth="1.6"
              strokeLinecap="round"
              opacity={0.85}
            />

            {/* One bird flying away up and to the right */}
            <g transform="translate(460, 65)">
              <Bird
                id={999}
                x={0}
                y={0}
                scale={1.2}
                color={inkColor}
                isFlying={true}
              />
            </g>

            {/* Subtle flight path trail */}
            <path
              d="M 380 132 C 400 120, 430 95, 455 72"
              fill="none"
              stroke={isNight ? 'rgba(236,235,240,0.25)' : 'rgba(35,34,32,0.2)'}
              strokeWidth="1.2"
              strokeDasharray="3 3"
            />
          </svg>
        </div>

        {/* 404 Status Pill */}
        <span
          style={{
            fontFamily: 'var(--font-serif)',
            fontSize: '14px',
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: 'var(--accent)',
            fontWeight: 600,
            marginBottom: '10px',
          }}
        >
          404 • Empty Wire
        </span>

        {/* Main Heading */}
        <h1
          style={{
            fontFamily: 'var(--font-serif)',
            fontSize: 'clamp(36px, 6vw, 56px)',
            fontWeight: 500,
            letterSpacing: '-0.02em',
            margin: '0 0 16px',
            color: inkColor,
            lineHeight: 1.15,
          }}
        >
          This bird flew away.
        </h1>

        {/* Description */}
        <p
          style={{
            fontFamily: 'var(--font-serif)',
            fontSize: 'clamp(16px, 2.2vw, 19px)',
            color: subInk,
            lineHeight: 1.6,
            maxWidth: 480,
            margin: '0 auto 36px',
          }}
        >
          There is nothing perched on this wire. The page may have moved, or the link has dissolved like wet ink.
        </p>

        {/* Action Button: "Go home" */}
        <button
          onClick={() => navigate('/')}
          className="watercolor-btn"
          style={{
            background: isNight ? '#F3EFE6' : '#1A1A1A',
            color: isNight ? '#0B1226' : '#FAF7EF',
            border: `2px solid ${isNight ? '#F3EFE6' : '#1A1A1A'}`,
            padding: '14px 36px',
            borderRadius: '999px',
            fontSize: '16px',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 10,
            boxShadow: isNight
              ? '0 6px 20px rgba(0,0,0,0.5)'
              : '0 6px 20px rgba(26,26,26,0.22)',
            transition: 'transform 0.15s ease, box-shadow 0.15s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)'
          }}
        >
          <span aria-hidden="true">←</span>
          <span>Go home</span>
        </button>
      </main>

      <Footer />
    </div>
  )
}
