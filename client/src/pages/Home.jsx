// client/src/pages/Home.jsx
//
// Miloo — Minimal Watercolor Zen Homepage
// Aesthetic: Hand-painted minimal watercolor on textured cream paper matching the reference image.
// Strictly centered layout with generous whitespace:
// - Top bar: "miloo" on left, "How it works / Safety / About" on right.
// - Centered headline "Meet a real stranger." about 25% from top.
// - Subline "No algorithm. No signup. Just connect."
// - Centered hero art: ONE large watercolor sun (~420px wide) / pale full moon at night,
//   with two diagonal sagging ink wires and 9 ink silhouette birds.
// - Under the art, centered: "Text chat" & "Video chat" buttons side by side (20px gap).
// - Footer: "Anonymous · Instant · Real people", then tiny links Terms, Privacy, FAQ.
// - Tiny "scroll" hint under footer line.
// - Calm paper-style section below the fold (~400 words).

import { useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import SEOHead from '../components/SEOHead'
import AgeGateModal from '../components/AgeGateModal'
import { useAtmosphere } from '../context/AtmosphereContext'
import WatercolorLogo from '../components/watercolor/WatercolorLogo'
import WatercolorScene from '../components/watercolor/WatercolorScene'
import SendBirdButton from '../components/SendBirdButton'

export default function Home({
  onStartText,
  onStartVideo,
}) {
  const { timeEngine, atmosphere, isNight, isDark: ctxIsDark } = useAtmosphere()
  const hour = timeEngine?.hour ?? 12
  // Real luminance check of background paper: values < 128 are dark night wash, >= 128 are light paper wash
  const paperLuminance = Array.isArray(atmosphere?.paperBgRgb)
    ? (atmosphere.paperBgRgb[0] * 0.299 + atmosphere.paperBgRgb[1] * 0.587 + atmosphere.paperBgRgb[2] * 0.114)
    : (Array.isArray(atmosphere?.paperBg)
      ? (atmosphere.paperBg[0] * 0.299 + atmosphere.paperBg[1] * 0.587 + atmosphere.paperBg[2] * 0.114)
      : (isNight ? 50 : 240))
  const isDark = ctxIsDark ?? (paperLuminance < 128)

  // Contrast-compliant font colors across light, dusk, and night atmospheric conditions (all >= 7:1)
  const bodyTextColor = isDark ? '#FFFFFF' : '#1E1B18'
  const subTextColor = isDark ? '#E2E8F0' : '#2E2A26'
  const mutedTextColor = isDark ? '#C4D2E2' : '#3E3830'
  const dividerColor = isDark ? '#9EB0C6' : '#5E5850'
  const accentColor = isDark ? '#F8C0B2' : '#7A1E0A'
  const accentLinkColor = isDark ? '#F8C0B2' : '#7A1E0A'

  const { moonPhase } = timeEngine

  // 18+ Age verification state
  const [ageModalOpen, setAgeModalOpen] = useState(false)
  const [pendingAction, setPendingAction] = useState(null)
  const [pendingMode, setPendingMode] = useState('video')

  // Check age verification status
  const isAgeVerified = useCallback(() => {
    if (typeof window === 'undefined') return false
    try {
      return (
        localStorage.getItem('miloo_age_confirmed') === 'true' ||
        sessionStorage.getItem('miloo_age_confirmed') === 'true'
      )
    } catch {
      return false
    }
  }, [])

  const handleRequestAgeModal = useCallback((mode, proceedCallback) => {
    setPendingMode(mode)
    setPendingAction(() => proceedCallback)
    setAgeModalOpen(true)
  }, [])

  const handleAgeConfirm = useCallback(() => {
    try {
      localStorage.setItem('miloo_age_confirmed', 'true')
      sessionStorage.setItem('miloo_age_confirmed', 'true')
    } catch {
      // ignore
    }
    setAgeModalOpen(false)
    if (pendingAction) {
      pendingAction()
      setPendingAction(null)
    } else {
      if (pendingMode === 'text') onStartText?.()
      else onStartVideo?.()
    }
  }, [pendingAction, pendingMode, onStartText, onStartVideo])

  const schemaJson = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Miloo',
    url: 'https://miloo.chat',
    description: 'Free anonymous random video and text chat platform for adults. Connect with strangers securely without login or signup.',
    applicationCategory: 'SocialNetworkingApplication',
    operatingSystem: 'Any',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
  }

  return (
    <div
      className="miloo-watercolor-page"
      style={{
        position: 'relative',
        width: '100%',
        minHeight: '100vh',
        overflowY: 'auto',
        overflowX: 'hidden',
        backgroundColor: atmosphere.paperBgCss,
        color: atmosphere.textColor,
        transition: 'background-color 0.8s ease, color 0.8s ease',
        boxSizing: 'border-box',
        isolation: 'isolate',
      }}
    >
      <SEOHead
        title="Miloo — Meet a real stranger. Instant, anonymous, no algorithm."
        description="Instant anonymous connection with random real strangers. No signup, no profiles, no algorithm. Peaceful watercolor canvas with real-time video and text chat."
        canonicalUrl="https://miloo.chat/"
        schemaJson={schemaJson}
      />

      {/* ── 1. EXACT ONE SCREEN HERO (Desktop 100vh) ── */}
      <section
        className="watercolor-hero-screen"
        style={{
          width: '100%',
          height: '100vh',
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          position: 'relative',
          boxSizing: 'border-box',
        }}
      >
        {/* Top Bar (Logo on left, "How it works / Safety / About" on right) */}
        <header
          className="watercolor-top-bar"
          style={{
            width: '100%',
            padding: 'clamp(14px, 2.2vh, 24px) clamp(20px, 4vw, 48px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            zIndex: 30,
            boxSizing: 'border-box',
          }}
        >
          {/* Top-Left: Miloo Ink Wordmark */}
          <div>
            <WatercolorLogo
              color={atmosphere.textColor}
              isNight={isDark}
              size={24}
            />
          </div>

          {/* Top-Right: Pure minimal links only */}
          <nav
            aria-label="Main Navigation"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              fontFamily: 'var(--font-serif)',
              fontSize: '15px',
            }}
          >
            <Link
              to="/how-it-works"
              className="nav-ink-link"
              style={{
                color: atmosphere.textColor,
                textDecoration: 'none',
                transition: 'opacity 0.2s ease',
              }}
            >
              How it works
            </Link>

            <span style={{ color: dividerColor }}>/</span>

            <Link
              to="/safety"
              className="nav-ink-link"
              style={{
                color: atmosphere.textColor,
                textDecoration: 'none',
                transition: 'opacity 0.2s ease',
              }}
            >
              Safety
            </Link>

            <span style={{ color: dividerColor }}>/</span>

            <Link
              to="/about"
              className="nav-ink-link"
              style={{
                color: atmosphere.textColor,
                textDecoration: 'none',
                transition: 'opacity 0.2s ease',
              }}
            >
              About
            </Link>

            <span style={{ color: dividerColor }}>/</span>

            <SendBirdButton variant="small" />
          </nav>
        </header>

        {/* Center Content (Headline, Sun/Wires Artwork, Text/Video Buttons) */}
        <main
          className="watercolor-main-container"
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
            padding: '0 clamp(16px, 3vw, 32px)',
            boxSizing: 'border-box',
            zIndex: 10,
          }}
        >
          {/* Centered Headline & Subline (~25% from top) */}
          <div
            className="watercolor-hero-text"
            style={{
              position: 'relative',
              zIndex: 25,
              textAlign: 'center',
              marginBottom: 'clamp(6px, 1.2vh, 14px)',
              maxWidth: '680px',
              width: '100%',
            }}
          >
            <h1
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: 'clamp(32px, 3.4vw, 46px)',
                fontWeight: 500,
                lineHeight: 1.15,
                letterSpacing: '-0.02em',
                color: atmosphere.textColor,
                margin: '0 0 8px 0',
                transition: 'color 0.4s ease',
              }}
            >
              Meet a real stranger.
            </h1>

            <p
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: 'clamp(14px, 1.2vw, 17px)',
                fontWeight: 400,
                lineHeight: 1.4,
                color: subTextColor,
                margin: 0,
                letterSpacing: '0.01em',
                transition: 'color 0.4s ease',
              }}
            >
              No algorithm. No signup. Just connect.
            </p>
          </div>

          {/* Hero Artwork & Centered Main Buttons (Unchanged) */}
          <WatercolorScene
            atmosphere={atmosphere}
            moonPhase={moonPhase}
            timeEngine={timeEngine}
            onStartText={onStartText}
            onStartVideo={onStartVideo}
            isAgeVerified={isAgeVerified}
            onRequestAgeModal={handleRequestAgeModal}
          />
        </main>

        {/* Hero Footer (Trust line, tiny links, and scroll hint) */}
        <footer
          className="watercolor-footer"
          style={{
            width: '100%',
            padding: 'clamp(8px, 1.5vh, 16px) clamp(20px, 4vw, 40px)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '4px',
            zIndex: 30,
            boxSizing: 'border-box',
          }}
        >
          {/* Trust Line */}
          <div
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: 'clamp(13px, 1.3vw, 14.5px)',
              letterSpacing: '0.08em',
              color: bodyTextColor,
              textAlign: 'center',
              userSelect: 'none',
            }}
          >
            Anonymous · Instant · Real people
          </div>

          {/* Tiny Links: Terms, Privacy, FAQ */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              fontFamily: 'var(--font-body)',
              fontSize: '12.5px',
              color: bodyTextColor,
            }}
          >
            <Link to="/terms" className="footer-ink-link" style={{ color: 'inherit', textDecoration: 'none' }}>
              Terms
            </Link>
            <span style={{ color: dividerColor }}>·</span>
            <Link to="/privacy" className="footer-ink-link" style={{ color: 'inherit', textDecoration: 'none' }}>
              Privacy
            </Link>
            <span style={{ color: dividerColor }}>·</span>
            <Link to="/faq" className="footer-ink-link" style={{ color: 'inherit', textDecoration: 'none' }}>
              FAQ
            </Link>
          </div>

          {/* Tiny Scroll Hint under Footer Line */}
          <div
            className="home-scroll-hint"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              fontSize: '11px',
              fontFamily: 'var(--font-body)',
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: mutedTextColor,
              marginTop: '4px',
              userSelect: 'none',
              opacity: 0.85,
            }}
          >
            <span>Scroll to explore</span>
            <span style={{ fontSize: '12px', lineHeight: 1 }} aria-hidden="true">↓</span>
          </div>
        </footer>
      </section>

      {/* ── 2. BELOW THE FOLD: CALM PAPER-STYLE SECTION (~400 WORDS) ── */}
      <section
        className="watercolor-home-paper-section"
        aria-label="About Miloo Platform"
        style={{
          width: '100%',
          backgroundColor: atmosphere.paperBgCss,
          borderTop: `1px solid ${isNight ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.07)'}`,
          padding: 'clamp(48px, 6vw, 76px) clamp(20px, 4vw, 40px)',
          boxSizing: 'border-box',
          position: 'relative',
          zIndex: 20,
        }}
      >
        <div
          style={{
            maxWidth: '860px',
            margin: '0 auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '36px',
          }}
        >
          {/* Subtitle & Heading */}
          <div style={{ textAlign: 'center' }}>
            <span
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: '13px',
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color: accentColor,
                fontWeight: 600,
                display: 'block',
                marginBottom: '10px',
              }}
            >
              Quiet Serendipity
            </span>
            <h2
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: 'clamp(28px, 3.2vw, 40px)',
                fontWeight: 500,
                letterSpacing: '-0.02em',
                color: atmosphere.textColor,
                margin: 0,
                lineHeight: 1.2,
              }}
            >
              A Peaceful Space for Real Human Conversation
            </h2>
          </div>

          {/* 1. What Miloo Is */}
          <div style={{ fontSize: '16px', lineHeight: 1.75, color: bodyTextColor, fontFamily: 'var(--font-body)' }}>
            <p style={{ margin: 0 }}>
              Miloo is an intentional sanctuary for spontaneous human conversation on the open web. In an internet dominated by algorithmic curation, addictive feeds, and performative social profiles, Miloo revives the lost art of unscripted serendipity. You open your browser, enter a quiet watercolor canvas, and instantly connect with a real person somewhere across the globe. There are no logins, no follower metrics, no public histories, and no algorithmic bias—just two strangers sharing a genuine, unburdened human moment.
            </p>
          </div>

          {/* 2. How It Works in 3 Short Steps */}
          <div>
            <h3
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: '22px',
                fontWeight: 600,
                color: atmosphere.textColor,
                margin: '0 0 16px',
              }}
            >
              How It Works in Three Simple Steps
            </h3>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                gap: '20px',
              }}
            >
              <div
                style={{
                  padding: '20px',
                  borderRadius: 'var(--radius-md)',
                  background: isNight ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
                  border: `1px solid ${isNight ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.06)'}`,
                }}
              >
                <div style={{ fontSize: '13px', fontWeight: 700, color: accentColor, textTransform: 'uppercase', marginBottom: '8px' }}>Step 1</div>
                <h4 style={{ fontFamily: 'var(--font-serif)', fontSize: '18px', margin: '0 0 8px', color: atmosphere.textColor }}>Choose Your Medium</h4>
                <p style={{ fontSize: '14px', lineHeight: 1.6, color: subTextColor, margin: 0 }}>
                  Select text chat for quiet, reflective exchanges, or video chat for face-to-face spontaneous dialogue. No downloads or installations needed.
                </p>
              </div>

              <div
                style={{
                  padding: '20px',
                  borderRadius: 'var(--radius-md)',
                  background: isNight ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
                  border: `1px solid ${isNight ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.06)'}`,
                }}
              >
                <div style={{ fontSize: '13px', fontWeight: 700, color: accentColor, textTransform: 'uppercase', marginBottom: '8px' }}>Step 2</div>
                <h4 style={{ fontFamily: 'var(--font-serif)', fontSize: '18px', margin: '0 0 8px', color: atmosphere.textColor }}>Connect Instantly</h4>
                <p style={{ fontSize: '14px', lineHeight: 1.6, color: subTextColor, margin: 0 }}>
                  Confirm you are 18 or older. Our matchmaking system immediately pairs you peer-to-peer with a waiting partner using encrypted WebRTC.
                </p>
              </div>

              <div
                style={{
                  padding: '20px',
                  borderRadius: 'var(--radius-md)',
                  background: isNight ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
                  border: `1px solid ${isNight ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.06)'}`,
                }}
              >
                <div style={{ fontSize: '13px', fontWeight: 700, color: accentColor, textTransform: 'uppercase', marginBottom: '8px' }}>Step 3</div>
                <h4 style={{ fontFamily: 'var(--font-serif)', fontSize: '18px', margin: '0 0 8px', color: atmosphere.textColor }}>Skip or Move On Freely</h4>
                <p style={{ fontSize: '14px', lineHeight: 1.6, color: subTextColor, margin: 0 }}>
                  Converse as long as the chemistry lasts. When ready, tap Skip to cleanly detach. The active session and memory are immediately wiped clean.
                </p>
              </div>
            </div>
          </div>

          {/* 3. How We Keep It Safe */}
          <div>
            <h3
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: '22px',
                fontWeight: 600,
                color: atmosphere.textColor,
                margin: '0 0 12px',
              }}
            >
              How We Keep It Safe
            </h3>
            <p style={{ fontSize: '15px', lineHeight: 1.7, color: bodyTextColor, margin: '0 0 12px' }}>
              Civil, enjoyable conversations require uncompromising safety protections. We protect our community through three core pillars:
            </p>
            <ul style={{ paddingLeft: '20px', fontSize: '15px', lineHeight: 1.7, color: bodyTextColor, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <li>
                <strong>Strictly 18+ Adults Only:</strong> Minors are strictly prohibited from entering rooms. We enforce a mandatory age verification gate before allowing room entry.
              </li>
              <li>
                <strong>Instant Report & Block Controls:</strong> Every conversation includes prominent one-click report and block tools. Blocking instantly severs the connection and blacklists the individual from your session.
              </li>
              <li>
                <strong>Proactive Multi-Layered Moderation:</strong> Our automated heuristics monitor report frequency and abusive patterns, enforcing temporary suspensions, device fingerprint restrictions, and permanent IP bans against bad actors.
              </li>
            </ul>
          </div>

          {/* 4. Who Miloo Is For */}
          <div>
            <h3
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: '22px',
                fontWeight: 600,
                color: atmosphere.textColor,
                margin: '0 0 12px',
              }}
            >
              Who Miloo Is For
            </h3>
            <p style={{ fontSize: '15px', lineHeight: 1.7, color: bodyTextColor, margin: 0 }}>
              Miloo is designed for curious minds, night owls, language learners practicing dialogue, travelers seeking global perspectives, and anyone feeling tired of algorithmic echo chambers. Whether you want to share a laugh after a long workday, discuss music with someone continents away, or enjoy peaceful company during midnight tea, Miloo offers a thoughtful, respectful space for real human voices.
            </p>
          </div>

          {/* 5. Links to How It Works, Safety Center, FAQ and 3 Blog Articles */}
          <div
            style={{
              paddingTop: '20px',
              borderTop: `1px solid ${isNight ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.07)'}`,
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
            }}
          >
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '14px', alignItems: 'center' }}>
              <span style={{ fontSize: '13px', fontWeight: 600, color: mutedTextColor, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Explore Miloo:
              </span>
              <Link to="/how-it-works" style={{ color: accentLinkColor, textDecoration: 'underline', textUnderlineOffset: '3px', fontSize: '14px', fontWeight: 500 }}>
                How It Works
              </Link>
              <span style={{ color: dividerColor }}>·</span>
              <Link to="/safety" style={{ color: accentLinkColor, textDecoration: 'underline', textUnderlineOffset: '3px', fontSize: '14px', fontWeight: 500 }}>
                Safety Center
              </Link>
              <span style={{ color: dividerColor }}>·</span>
              <Link to="/faq" style={{ color: accentLinkColor, textDecoration: 'underline', textUnderlineOffset: '3px', fontSize: '14px', fontWeight: 500 }}>
                FAQ
              </Link>
            </div>

            <div>
              <span style={{ fontSize: '13px', fontWeight: 600, color: mutedTextColor, textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: '8px' }}>
                Featured Safety & Conversation Guides:
              </span>
              <ul style={{ paddingLeft: '20px', margin: 0, display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '14px', color: bodyTextColor }}>
                <li>
                  <Link to="/blog/stay-safe-talking-to-strangers-online" style={{ color: accentLinkColor, textDecoration: 'underline', textUnderlineOffset: '2px' }}>
                    How to Stay Safe Talking to Strangers Online
                  </Link>{' '}
                  — Proven strategies to guard your identity and recognize manipulation.
                </li>
                <li>
                  <Link to="/blog/tips-for-starting-good-conversation-with-stranger" style={{ color: accentLinkColor, textDecoration: 'underline', textUnderlineOffset: '2px' }}>
                    10 Tips for Starting a Great Conversation with a Stranger
                  </Link>{' '}
                  — Playful icebreakers and active listening techniques.
                </li>
                <li>
                  <Link to="/blog/protecting-privacy-in-video-chat" style={{ color: accentLinkColor, textDecoration: 'underline', textUnderlineOffset: '2px' }}>
                    Protecting Your Privacy in Video Chat: Checklist
                  </Link>{' '}
                  — Easy environmental sweep to ensure webcam privacy.
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ── 18+ AGE GATE MODAL ── */}
      <AgeGateModal
        isOpen={ageModalOpen}
        targetMode={pendingMode}
        onConfirm={handleAgeConfirm}
        onCancel={() => {
          setAgeModalOpen(false)
          setPendingAction(null)
        }}
      />

      <style>{`
        .nav-ink-link:hover, .footer-ink-link:hover {
          opacity: 1 !important;
          text-decoration: underline !important;
          text-underline-offset: 3px;
        }

        @media (max-width: 640px) {
          .watercolor-hero-screen {
            height: auto !important;
            min-height: 100vh !important;
            padding-bottom: 24px !important;
          }
          .watercolor-hero-text h1 {
            font-size: 30px !important;
          }
          .watercolor-hero-artwork {
            height: 280px !important;
            min-height: 240px !important;
          }
        }
      `}</style>
    </div>
  )
}
