import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import SEOHead from '../components/SEOHead'
import WatercolorMiniBanner from '../components/watercolor/WatercolorMiniBanner'

export default function HowItWorks({ theme, onToggleTheme }) {
  const schemaJson = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: 'How Miloo Anonymous Random Video, Voice and Text Chat Works',
    description: 'Learn how Miloo securely connects users for anonymous random video, voice and text chats using WebRTC technology without requiring an account.',
    step: [
      {
        '@type': 'HowToStep',
        name: 'Select your conversation mode',
        text: 'Choose Video Chat (camera and microphone), Voice Chat (microphone only), or Text Chat (instant messaging).'
      },
      {
        '@type': 'HowToStep',
        name: 'Verify age and agree to safety rules',
        text: 'Confirm you are at least 18 years old and agree to adhere to community safety standards.'
      },
      {
        '@type': 'HowToStep',
        name: 'Get matched through peer-to-peer WebRTC',
        text: 'Our signaling server establishes a direct peer-to-peer encrypted connection with an available stranger.'
      },
      {
        '@type': 'HowToStep',
        name: 'Chat freely or skip to next',
        text: 'Converse as long as you want, or click Skip at any moment to connect with someone new.'
      }
    ]
  }

  return (
    <div className="page page-enter" style={{ background: 'var(--bg-0)' }}>
      <SEOHead
        title="How It Works — Miloo Anonymous Video, Voice & Text Chat"
        description="Discover how Miloo works: anonymous WebRTC chat matching, camera permissions, instant skips, and safety reports. No account or sign-up needed."
        canonicalUrl="https://miloo.chat/how-it-works"
        schemaJson={schemaJson}
      />

      <Navbar theme={theme} onToggleTheme={onToggleTheme} />

      <main className="container" style={{ paddingTop: 'clamp(20px, 3.5vw, 40px)', paddingBottom: 'clamp(48px, 8vw, 80px)', maxWidth: 880 }}>
        {/* Subtle watercolor sagging wire & perched ink sparrows */}
        <WatercolorMiniBanner />

        {/* Header */}
        <header style={{ marginBottom: 44, textAlign: 'left' }}>
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
            Technical Guide & Platform Overview
          </div>
          <h1
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(32px, 4.5vw, 52px)',
              fontWeight: 500,
              lineHeight: 1.15,
              color: 'var(--text-1)',
              margin: '0 0 16px',
            }}
          >
            How Miloo Works
          </h1>
          <p
            style={{
              fontSize: 'clamp(16px, 1.8vw, 20px)',
              color: 'var(--text-2)',
              lineHeight: 1.6,
              margin: 0,
            }}
          >
            A deep look under the hood: how anonymous peer-to-peer WebRTC matching, camera controls, and user protection operate without user accounts.
          </p>
        </header>

        {/* Content Body */}
        <article className="content-prose">
          <h2>1. The Anonymous Matching Architecture</h2>
          <p>
            Traditional social applications rely heavily on centralized user directories, persistent profile databases, and contact graphs. Miloo deliberately rejects this paradigm. When you arrive on Miloo, you enter as an anonymous visitor identified solely by an ephemeral, random session token generated inside your browser.
          </p>
          <p>
            When you tap <strong>Text Chat</strong>, <strong>Voice Chat</strong> or <strong>Video Chat</strong>, your client connects to our lightweight signaling gateway over secure WebSockets (WSS). The signaling server checks the waiting pool for an available partner who selected the same communication format. As soon as a compatible peer is identified, the server facilitates an initial handshake—transmitting Session Description Protocol (SDP) offers and ICE candidates—and then steps out of the media pathway.
          </p>

          <h2>2. Direct Peer-to-Peer WebRTC Streaming</h2>
          <p>
            One of the biggest concerns users have with online video chat is whether their video feed is being intercepted or stored on remote servers. On Miloo, <strong>all video and audio streams travel directly between you and your chat partner via WebRTC (Web Real-Time Communication)</strong>.
          </p>
          <p>
            WebRTC uses industry-standard DTLS (Datagram Transport Layer Security) and SRTP (Secure Real-Time Transport Protocol) encryption. This ensures:
          </p>
          <ul>
            <li>Your camera and microphone streams are encrypted end-to-end between browsers.</li>
            <li>Miloo’s central servers never receive, decode, inspect, or store your live video or voice.</li>
            <li>Latency is kept minimal because packets travel directly across the nearest internet routing path between peers.</li>
          </ul>

          <h2>3. Text Chat Mode</h2>
          <p>
            If you do not have a webcam, prefer not to appear on camera, or have limited mobile bandwidth, Miloo provides a dedicated <strong>Text Chat</strong> mode. In text mode:
          </p>
          <ul>
            <li>No camera or microphone permissions are ever requested by your browser.</li>
            <li>Messages are transmitted ephemerally during the active connection and are cleared immediately upon skipping or disconnecting.</li>
            <li>Typing indicators allow both participants to see when a reply is being composed in real time.</li>
          </ul>

          <h2>4. The Skip and Next Control</h2>
          <p>
            Spontaneous chatting relies on the ability to leave uninteresting, quiet, or uncomfortable interactions instantly. In every Miloo room, you have direct access to the <strong>Skip / Next</strong> control:
          </p>
          <ul>
            <li>Pressing <strong>Skip</strong> or hitting the Escape key immediately severs the active peer connection.</li>
            <li>The remote partner receives an instant notification that the session has concluded.</li>
            <li>Your client automatically enters the waiting queue and seeks a new partner within seconds.</li>
          </ul>

          <h2>5. Safety Tools Built Into Every Chat</h2>
          <p>
            Because anonymous chat is open to the public, safety mechanisms must be immediate and accessible:
          </p>
          <ul>
            <li><strong>Report User:</strong> If a stranger displays inappropriate behavior, nudity, harassment, or spam, click the "Report" button. You can choose from standard abuse categories, which alerts our moderation queue.</li>
            <li><strong>Block User:</strong> Selecting "Block" immediately terminates the chat and stores the partner’s technical identifier in your local blocklist, preventing any re-matching with that user during your session.</li>
          </ul>

          <h2>6. Technical Requirements & Supported Browsers</h2>
          <p>
            Miloo runs natively inside standard modern web browsers on mobile phones, tablets, laptops, and desktop computers without downloading native apps. Supported platforms include:
          </p>
          <h2>7. Core Architectural Guarantees for Adult Privacy</h2>
          <p>
            To understand why Miloo functions so securely across all device form factors, it helps to review the architectural pillars underpinning our matching framework:
          </p>
          <ul>
            <li>
              <strong>Zero Account Retention:</strong> No phone numbers, emails, passwords, or personal demographic tracking profiles are ever collected or retained. Once your session ends, the connection terminates with no permanent chat logs stored on our servers.
            </li>
            <li>
              <strong>Direct WebRTC Media Pathways:</strong> Audio and video stream directly between browsers using encrypted DTLS/SRTP protocols. Media never routes through central recording or surveillance servers.
            </li>
            <li>
              <strong>Instant Abuse Enforcement:</strong> Every chat screen provides immediate one-tap reporting and blocking. Suspicious actors face immediate device fingerprint and IP suspensions to preserve community safety.
            </li>
          </ul>
        </article>

        {/* CTA Box */}
        <div
          className="content-card"
          style={{
            marginTop: 48,
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 16,
          }}
        >
          <h3 style={{ margin: 0, fontFamily: 'var(--font-display)', fontSize: '24px', color: 'var(--text-1)' }}>
            Experience it for yourself
          </h3>
          <p style={{ margin: 0, color: 'var(--text-2)', maxWidth: 460, fontSize: '15px' }}>
            Jump into a text, voice or video conversation right now. Free, private, and no signup needed.
          </p>
          <Link
            to="/"
            style={{
              display: 'inline-block',
              padding: '12px 28px',
              borderRadius: 'var(--radius-pill)',
              background: 'var(--accent)',
              color: 'var(--accent-text, #ffffff)',
              fontSize: '15px',
              fontWeight: 600,
              textDecoration: 'none',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            Go to Homepage & Start Chat →
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  )
}
