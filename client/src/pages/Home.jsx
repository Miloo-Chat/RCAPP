import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import SEOHead from '../components/SEOHead'
import AgeGateModal from '../components/AgeGateModal'

export default function Home({
  onStartText,
  onStartVideo,
  theme,
  onToggleTheme,
}) {
  const navigate = useNavigate()
  const [ageModalOpen, setAgeModalOpen] = useState(false)
  const [pendingMode, setPendingMode] = useState('video')

  // Real visitor local time for subtle human connection
  const [timeStr, setTimeStr] = useState(() => {
    try {
      return new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }).toLowerCase()
    } catch {
      return ''
    }
  })

  useEffect(() => {
    const timer = setInterval(() => {
      try {
        setTimeStr(new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }).toLowerCase())
      } catch {
        // ignore
      }
    }, 15000)
    return () => clearInterval(timer)
  }, [])

  const handleStartAttempt = (mode) => {
    const isVerified = sessionStorage.getItem('miloo_age_confirmed') === 'true'
    if (isVerified) {
      if (mode === 'text') onStartText()
      else onStartVideo()
    } else {
      setPendingMode(mode)
      setAgeModalOpen(true)
    }
  }

  const handleAgeConfirm = () => {
    sessionStorage.setItem('miloo_age_confirmed', 'true')
    setAgeModalOpen(false)
    if (pendingMode === 'text') onStartText()
    else onStartVideo()
  }

  const schemaJson = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Miloo',
    url: 'https://www.miloo.chat',
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
    <div className="page page-enter" style={{ background: 'var(--bg-0)', position: 'relative' }}>
      <SEOHead
        title="Miloo — Free Anonymous Random Video & Text Chat (18+)"
        description="Connect with random strangers instantly on Miloo. Free peer-to-peer video and text chat with no login, no apps, and strict privacy protection. Strictly 18+."
        canonicalUrl="https://www.miloo.chat/"
        schemaJson={schemaJson}
      />

      {/* ── ATMOSPHERE (GRAIN & SLOW AMBIENT LIGHT) ── */}
      <div className="grain-overlay" aria-hidden="true" />
      <div className="ambient-light" aria-hidden="true" />

      {/* ── NAVBAR ── */}
      <Navbar theme={theme} onToggleTheme={onToggleTheme} />

      {/* ── HERO & TWO DOORS (ABOVE THE FOLD) ── */}
      <main
        className="container"
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          paddingTop: 'clamp(32px, 6vh, 64px)',
          paddingBottom: 'clamp(40px, 6vh, 64px)',
          position: 'relative',
          zIndex: 2,
        }}
      >
        <div className="home-hero-layout">
          {/* ── LEFT COLUMN: EDITORIAL HERO COPY ── */}
          <div style={{ textAlign: 'left', maxWidth: 540 }}>
            {timeStr && (
              <div
                className="fade-in-up"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  fontSize: '13px',
                  color: 'var(--text-3)',
                  marginBottom: '18px',
                  fontFamily: 'var(--font-body)',
                  letterSpacing: '0.01em',
                }}
              >
                <span
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: '50%',
                    background: 'var(--accent)',
                    display: 'inline-block',
                    opacity: 0.9,
                  }}
                />
                <span>It's {timeStr}. Serendipity awaits.</span>
              </div>
            )}

            <h1
              className="fade-in-up"
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(38px, 5.2vw, 64px)',
                fontWeight: 400,
                letterSpacing: '-0.03em',
                lineHeight: 1.08,
                margin: '0 0 20px',
                color: 'var(--text-1)',
              }}
            >
              Talk to someone unexpected.
            </h1>

            <p
              className="fade-in-up"
              style={{
                fontSize: 'clamp(15px, 1.6vw, 18px)',
                color: 'var(--text-2)',
                lineHeight: 1.65,
                margin: '0 0 28px',
                maxWidth: 480,
              }}
            >
              A late-night conversation, a spontaneous story, or just passing the time. Miloo connects adults worldwide for 1-on-1 random video and text chats. No accounts, no profiling, and zero friction.
            </p>

            {/* Quick feature tags */}
            <div
              className="fade-in-up"
              style={{
                color: 'var(--text-3)',
                fontSize: '13px',
                lineHeight: 1.5,
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                flexWrap: 'wrap',
              }}
            >
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                <span style={{ color: 'var(--accent)' }}>✓</span> Anonymous by design
              </span>
              <span style={{ opacity: 0.35 }}>·</span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                <span style={{ color: 'var(--accent)' }}>✓</span> Peer-to-peer WebRTC
              </span>
              <span style={{ opacity: 0.35 }}>·</span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                <span style={{ color: 'var(--accent)' }}>✓</span> Strictly 18+
              </span>
            </div>
          </div>

          {/* ── RIGHT COLUMN: THE TWO ARCHED DOORS ── */}
          <div className="home-doors fade-in-up">
            {/* DOOR 1: TEXT CHAT */}
            <button
              onClick={() => handleStartAttempt('text')}
              className="home-door door-text"
              aria-label="Enter Text Chat"
            >
              <div style={{ width: '100%' }}>
                <div style={{ fontSize: '13px', fontWeight: 600, color: 'rgba(18, 17, 16, 0.7)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>
                  Option 01
                </div>
                <h2
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: 'clamp(28px, 2.8vw, 36px)',
                    fontWeight: 400,
                    letterSpacing: '-0.02em',
                    color: '#121110',
                    margin: '0 0 12px',
                    lineHeight: 1.12,
                    whiteSpace: 'nowrap',
                  }}
                >
                  Text Chat
                </h2>
                <p
                  style={{
                    fontSize: '15px',
                    color: 'rgba(18, 17, 16, 0.88)',
                    lineHeight: 1.5,
                    margin: 0,
                  }}
                >
                  Instant messaging with strangers. No camera required, zero social pressure.
                </p>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 32 }}>
                <span style={{ fontSize: '13px', fontWeight: 600, color: '#121110' }}>
                  Start Texting
                </span>
                <span
                  className="door-arrow"
                  style={{
                    fontSize: '28px',
                    lineHeight: 1,
                    color: '#121110',
                    display: 'inline-block',
                    transition: 'transform 220ms ease-out',
                  }}
                >
                  →
                </span>
              </div>
            </button>

            {/* DOOR 2: VIDEO CHAT */}
            <button
              onClick={() => handleStartAttempt('video')}
              className="home-door door-video"
              aria-label="Enter Video Chat"
            >
              <div style={{ width: '100%' }}>
                <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>
                  Option 02
                </div>
                <h2
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: 'clamp(28px, 2.8vw, 36px)',
                    fontWeight: 400,
                    letterSpacing: '-0.02em',
                    color: 'var(--text-1)',
                    margin: '0 0 12px',
                    lineHeight: 1.12,
                    whiteSpace: 'nowrap',
                  }}
                >
                  Video Chat
                </h2>
                <p
                  style={{
                    fontSize: '15px',
                    color: 'var(--text-2)',
                    lineHeight: 1.5,
                    margin: 0,
                  }}
                >
                  Direct face-to-face video and voice. Instant encrypted peer connection.
                </p>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 32 }}>
                <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-1)' }}>
                  Start Video
                </span>
                <span
                  className="door-arrow"
                  style={{
                    fontSize: '28px',
                    lineHeight: 1,
                    color: 'var(--text-1)',
                    display: 'inline-block',
                    transition: 'transform 220ms ease-out',
                  }}
                >
                  →
                </span>
              </div>
            </button>
          </div>
        </div>
      </main>

      {/* ── BELOW THE FOLD: RICH ORIGINAL CONTENT (> 500 WORDS) ── */}
      <section
        style={{
          borderTop: '1px solid var(--border-1)',
          background: 'var(--surface-1)',
          paddingTop: 'clamp(48px, 8vw, 80px)',
          paddingBottom: 'clamp(48px, 8vw, 80px)',
          position: 'relative',
          zIndex: 2,
        }}
      >
        <div className="container" style={{ maxWidth: 960 }}>
          {/* Section 1: What is Miloo? */}
          <div style={{ marginBottom: 56 }}>
            <div
              style={{
                display: 'inline-block',
                fontSize: '12px',
                fontWeight: 700,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: 'var(--accent)',
                marginBottom: 12,
              }}
            >
              The Modern Serendipity Network
            </div>
            <h2
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(26px, 3.2vw, 38px)',
                fontWeight: 500,
                color: 'var(--text-1)',
                marginBottom: 20,
                lineHeight: 1.2,
              }}
            >
              What is Miloo and How Does It Work?
            </h2>
            <div className="content-prose">
              <p>
                Miloo is an independent, free random video and text chat platform built for adults seeking genuine, spontaneous conversations with strangers from across the globe. Inspired by the open, unfiltered serendipity of early-web communication platforms like Omegle, Miloo reimagines stranger chat for the modern era with robust technical privacy, modern WebRTC peer-to-peer security, and a strict 18+ community environment.
              </p>
              <p>
                Unlike conventional social networks that require extensive user profiles, persistent friend graphs, and invasive data collection, Miloo operates on a strict zero-retention philosophy. You do not need to register an account, download native software, or link an email or phone number. When you click either "Text Chat" or "Video Chat", our signaling server immediately pairs you with an active, available stranger who is also looking for a conversation.
              </p>
            </div>
          </div>

          {/* Section 2: Step-by-Step Walkthrough Cards */}
          <div style={{ marginBottom: 64 }}>
            <h3
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '24px',
                color: 'var(--text-1)',
                marginBottom: 24,
              }}
            >
              How to Start Chatting in 3 Simple Steps
            </h3>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                gap: 20,
              }}
            >
              <div className="content-card">
                <div style={{ fontSize: '28px', marginBottom: 14 }}>🚪</div>
                <h4 style={{ fontSize: '18px', color: 'var(--text-1)', margin: '0 0 10px', fontFamily: 'var(--font-display)' }}>
                  1. Pick Your Mode
                </h4>
                <p style={{ margin: 0, fontSize: '14px', lineHeight: 1.6, color: 'var(--text-2)' }}>
                  Choose Text Chat for quiet, low-bandwidth text messaging, or Video Chat to connect directly via webcam and microphone.
                </p>
              </div>

              <div className="content-card">
                <div style={{ fontSize: '28px', marginBottom: 14 }}>🔞</div>
                <h4 style={{ fontSize: '18px', color: 'var(--text-1)', margin: '0 0 10px', fontFamily: 'var(--font-display)' }}>
                  2. Confirm 18+ Age
                </h4>
                <p style={{ margin: 0, fontSize: '14px', lineHeight: 1.6, color: 'var(--text-2)' }}>
                  Miloo is strictly for adults. Confirm that you are at least 18 years old and agree to treat strangers with mutual respect and dignity.
                </p>
              </div>

              <div className="content-card">
                <div style={{ fontSize: '28px', marginBottom: 14 }}>⚡</div>
                <h4 style={{ fontSize: '18px', color: 'var(--text-1)', margin: '0 0 10px', fontFamily: 'var(--font-display)' }}>
                  3. Instant Connection
                </h4>
                <p style={{ margin: 0, fontSize: '14px', lineHeight: 1.6, color: 'var(--text-2)' }}>
                  Get paired in seconds. Talk for as long as you enjoy, or tap "Skip / Next" at any moment to instantly meet someone new.
                </p>
              </div>
            </div>
          </div>

          {/* Section 3: Safety, Moderation & Privacy Architecture */}
          <div style={{ marginBottom: 64 }}>
            <h3
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '24px',
                color: 'var(--text-1)',
                marginBottom: 20,
              }}
            >
              Safety, Moderation, and Real-Time Abuse Prevention
            </h3>
            <div className="content-prose">
              <p>
                Anonymous chat should be enjoyable and safe. Because random platforms attract individuals from every background, Miloo implements multi-layered safety controls directly into every chat room:
              </p>
              <ul>
                <li>
                  <strong>One-Tap User Reporting:</strong> Every chat screen features an accessible "Report" button with granular violation categories (Harassment, Nudity / Explicit Content, Spam, Threats, Scams). Reports are dispatched to our moderation queue with minimal diagnostic metadata.
                </li>
                <li>
                  <strong>Instant User Blocking:</strong> If a partner makes you uncomfortable, tap "Block User" to immediately sever the connection and blacklist that partner's session ID, guaranteeing you will not be paired with them again.
                </li>
                <li>
                  <strong>Encrypted Peer-to-Peer Streams:</strong> Video and audio calls travel directly between browsers using WebRTC DTLS/SRTP encryption. Miloo never intercepts, inspects, or records your private video streams.
                </li>
                <li>
                  <strong>Transparent AI Companion Notice:</strong> If waiting queues are low during quiet hours, Miloo provides an AI conversational partner named Milo. All AI interactions are visibly labeled so you always know whether you are chatting with a human or an automated partner.
                </li>
              </ul>
            </div>
          </div>

          {/* Section 4: Who Is Miloo For? (Strict 18+ Adult Policy) */}
          <div
            style={{
              background: 'var(--bg-0)',
              border: '1px solid var(--border-2)',
              borderRadius: 'var(--radius-xl)',
              padding: 'clamp(24px, 4vw, 40px)',
              marginBottom: 56,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <span style={{ fontSize: '28px' }}>🔞</span>
              <h3
                style={{
                  margin: 0,
                  fontFamily: 'var(--font-display)',
                  fontSize: '22px',
                  color: 'var(--text-1)',
                }}
              >
                Strictly 18+ Adults Only Policy
              </h3>
            </div>
            <div className="content-prose" style={{ margin: 0 }}>
              <p>
                Miloo is designed exclusively for mature adults aged 18 and older. Minors are strictly prohibited from using the platform. Because stranger interactions are unscripted, users may encounter sensitive conversations or adult topics. We maintain zero tolerance for child sexual abuse material (CSAM), non-consensual sexually explicit content, harassment, stalking, hate speech, and scams. Any detected or reported violations result in immediate device fingerprint and IP bans.
              </p>
              <p style={{ margin: 0 }}>
                To learn more about keeping your identity protected while meeting strangers online, read our comprehensive{' '}
                <Link to="/safety" style={{ color: 'var(--accent)' }}>
                  Safety Guide
                </Link>{' '}
                and review our{' '}
                <Link to="/community-guidelines" style={{ color: 'var(--accent)' }}>
                  Community Guidelines
                </Link>
                .
              </p>
            </div>
          </div>

          {/* Section 5: Bottom CTA */}
          <div
            style={{
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 16,
              paddingTop: 16,
            }}
          >
            <h3
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '28px',
                color: 'var(--text-1)',
                margin: 0,
              }}
            >
              Ready to meet someone new?
            </h3>
            <p style={{ color: 'var(--text-2)', maxWidth: 480, margin: 0, fontSize: '15px' }}>
              Jump in with zero signups. Free, anonymous, and instant.
            </p>
            <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', justifyContent: 'center', marginTop: 8 }}>
              <button
                onClick={() => handleStartAttempt('video')}
                style={{
                  padding: '12px 28px',
                  borderRadius: 'var(--radius-pill)',
                  border: 'none',
                  background: 'var(--accent)',
                  color: '#ffffff',
                  fontSize: '15px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  boxShadow: 'var(--shadow-sm)',
                }}
              >
                Start Video Chat →
              </button>
              <button
                onClick={() => handleStartAttempt('text')}
                style={{
                  padding: '12px 28px',
                  borderRadius: 'var(--radius-pill)',
                  border: '1px solid var(--border-2)',
                  background: 'var(--surface-1)',
                  color: 'var(--text-1)',
                  fontSize: '15px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Start Text Chat →
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <Footer />

      {/* ── 18+ AGE GATE MODAL ── */}
      <AgeGateModal
        isOpen={ageModalOpen}
        targetMode={pendingMode}
        onConfirm={handleAgeConfirm}
        onCancel={() => setAgeModalOpen(false)}
      />
    </div>
  )
}
