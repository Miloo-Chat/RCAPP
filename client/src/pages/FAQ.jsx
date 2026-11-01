import { useState } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import SEOHead from '../components/SEOHead'

const FAQ_DATA = [
  {
    q: 'Is Miloo completely free to use?',
    a: 'Yes, Miloo is 100% free to use for all adult visitors. We do not have paid subscriptions, VIP tiers, paywalls, coin systems, or hidden fees. Both video chat and text chat features are completely accessible without submitting a credit card, payment details, or in-app purchases. Our operational hosting costs are supported transparently by privacy-friendly Google AdSense advertisements displayed strictly on public editorial pages.'
  },
  {
    q: 'Do I need to create an account, register, or download an app?',
    a: 'No account, sign-up, or mobile app download is required. Miloo is built from the ground up to offer instant, zero-friction anonymous communication directly inside your mobile or desktop web browser. You do not need to link a Google or Apple account, verify an email address, or provide a mobile phone number. You simply open https://www.miloo.chat, verify you are 18 or older, and immediately begin chatting.'
  },
  {
    q: 'Who is allowed to use Miloo? What is your age requirement?',
    a: 'Miloo is strictly and exclusively intended for adults aged 18 years and older. Individuals under the age of 18 (minors) are strictly prohibited from creating connections, viewing video streams, or sending text messages on our platform. Because stranger chats are unmoderated peer-to-peer interactions, we enforce this adult-only policy without exception across all regional rooms and modes.'
  },
  {
    q: 'Why does Miloo strictly prohibit minors and enforce an 18+ age gate?',
    a: 'Protecting minors from spontaneous adult content, online scams, cyberbullying, and potential child exploitation is our highest ethical responsibility. In compliance with the Children’s Online Privacy Protection Act (COPPA), the UK Online Safety Act, and international child protection directives, Miloo enforces a mandatory age verification gate prior to room entry and immediately terminates sessions if underage access is suspected or reported.'
  },
  {
    q: 'Does Miloo record, intercept, or store my video and audio calls?',
    a: 'No. Miloo never records, monitors, intercepts, or stores your live video or audio conversations. All media streams travel directly between you and your matched partner using peer-to-peer WebRTC connections protected by industry-standard DTLS (Datagram Transport Layer Security) and SRTP (Secure Real-time Transport Protocol) encryption. Our central signaling servers merely broker the initial connection handshake and never touch your decrypted video or microphone data.'
  },
  {
    q: 'Can another user record my video feed or take screenshots?',
    a: 'While Miloo itself provides no recording tools or screenshot capture functionality, any external party could theoretically use third-party screen capture software, operating system screenshot shortcuts, or an external camera to record their screen. For this reason, we urge all users to exercise good judgment: never share identifying personal documents, do not show sensitive personal items on camera, and protect your privacy at all times.'
  },
  {
    q: 'How does the "Skip" button work, and can I use keyboard shortcuts?',
    a: 'Clicking the "Skip" button (or pressing the Escape key on your physical keyboard) immediately and cleanly tears down your active WebRTC peer connection. The server instantly detaches you from your previous partner and enters you into the matchmaking queue to pair with a new stranger. Skipping is instantaneous, and all active conversation history is completely wiped from local browser memory the moment you disconnect.'
  },
  {
    q: 'How does the "Block User" feature work?',
    a: 'When you click "Block User" during or immediately following a conversation, Miloo severs the connection and places that user’s ephemeral session ID into your local browser blacklist. Our matchmaking engine cross-references this blacklist to ensure you are never paired with that individual again during your active browser session, giving you absolute control over your conversational environment.'
  },
  {
    q: 'What should I do if a stranger violates the rules or makes me uncomfortable?',
    a: 'You have three immediate protective tools: 1) Click "Skip" or hit Escape to disconnect immediately. 2) Tap "Block User" so you never match with them again. 3) Click "Report User" in the chat header to submit an immediate safety violation report directly to our moderation desk, selecting the appropriate category (harassment, nudity, spam, extortion, or threats).'
  },
  {
    q: 'How do reports work, and what happens after I submit a safety report?',
    a: 'When you submit a report, our backend logs the timestamp, the reported party’s encrypted identifier, and your selected reason code. Our moderation team reviews these reports against automated abuse heuristics. Confirmed violators face immediate session termination, client-side cookie invalidation, browser fingerprint suspensions, and permanent network-level IP bans.'
  },
  {
    q: 'How are bans and suspensions enforced on Miloo?',
    a: 'Miloo uses a multi-layered moderation architecture to enforce bans effectively. We identify offending clients through a combination of SHA-256 hashed IP addresses, persistent client ID cookies (miloo_uid), and device hardware fingerprints. When a user is suspended or banned, our Socket.IO server automatically rejects connection handshakes and prevents the client from entering the matchmaking queue.'
  },
  {
    q: 'Can I appeal an accidental suspension or ban?',
    a: 'Yes. If you believe your device or IP was suspended in error—such as when sharing a communal university Wi-Fi network, cellular carrier NAT gateway, or dynamic residential IP—you can submit a formal appeal through our Contact page or by emailing support@miloo.chat. Include your approximate access timestamp and network environment details, and our human moderation staff will review your case.'
  },
  {
    q: 'Why was I matched with an AI companion named Milo?',
    a: 'During off-peak hours or in queues with temporarily low regional traffic, human matchmaking wait times might otherwise become excessive. To prevent users from waiting indefinitely, Miloo provides Milo, a friendly conversational AI companion. Milo is always clearly labeled with an "AI Companion" badge so you never mistake automated text for a real human, and you can skip Milo at any instant.'
  },
  {
    q: 'Is talking to Milo optional, and how do I know if I am chatting with AI or a human?',
    a: 'Interacting with Milo is 100% optional. Whenever Milo is matched, a prominent header badge and informational banner appear on your screen declaring the session as an AI conversation. If you only wish to speak with real human strangers, simply click "Skip" to return to the human matching queue, or disable AI companion fallbacks in your settings.'
  },
  {
    q: 'What permissions does Miloo request from my browser, and can I use text only?',
    a: 'If you select Text Chat mode, Miloo requests zero hardware permissions from your device. If you select Video Chat mode, your browser will prompt you for permission to access your Camera and Microphone. These permissions are strictly utilized client-side by WebRTC to transmit real-time video frames and audio packets to your peer. You can revoke permissions at any time via your browser settings.'
  },
  {
    q: 'What should I do if my camera or microphone fails to connect or shows a black screen?',
    a: 'If your camera fails to start: 1) Check the lock or tune icon in your browser’s address bar and confirm Camera and Microphone permissions are set to "Allow". 2) Ensure no other program (such as Zoom, Microsoft Teams, FaceTime, or Discord) is locking your webcam hardware. 3) Verify hardware acceleration is enabled in your browser settings. 4) If problems persist, refresh the page or test in a private/incognito window.'
  },
  {
    q: 'Does Miloo work on mobile phones and tablets?',
    a: 'Yes, Miloo is completely mobile-responsive and engineered for touchscreens. It works smoothly in mobile browsers on iOS (Safari, Chrome) and Android (Chrome, Firefox, Samsung Internet). The user interface automatically adapts to both portrait and landscape screen orientations, offering convenient, touch-friendly skip and report controls without needing any app installation.'
  },
  {
    q: 'Which desktop and mobile web browsers are supported?',
    a: 'Miloo supports all modern web browsers compliant with HTML5, WebSockets, and WebRTC protocols. This includes Google Chrome, Apple Safari (macOS and iOS), Mozilla Firefox, Microsoft Edge, Brave, and Opera across Android, iOS, Windows, macOS, Linux, and ChromeOS devices. For the lowest latency and optimal video quality, we recommend keeping your browser updated to its latest stable release.'
  },
  {
    q: 'Does Miloo use cookies or track my browsing activities?',
    a: 'Miloo respects user privacy and does not track your online browsing across external websites. We use necessary first-party cookies and local storage tokens solely to maintain your functional UI preferences (such as dark mode selection and age confirmation status). On public content pages, we utilize Google AdSense to serve privacy-compliant advertisements that keep the site free for everyone.'
  },
  {
    q: 'How does Miloo handle user data deletion and GDPR/CCPA privacy rights?',
    a: 'Because Miloo operates without registered user accounts, profiles, message databases, or stored call recordings, there is virtually no personal identity data retained after a chat terminates. Your text messages exist only in temporary device memory during the active session and are permanently cleared upon disconnect. To purge local preferences, simply clear your browser’s site cookies and storage.'
  },
  {
    q: 'What are the rules regarding nudity, hate speech, and harassment?',
    a: 'Miloo enforces a strict zero-tolerance code of conduct. Nudity, sexually explicit acts, vulgar gestures, harassment, hate speech, racial slurs, threats of violence, cyberbullying, financial scamming, and commercial advertising are strictly banned. Users engaging in prohibited behavior are subject to immediate session termination, automated blacklisting, and permanent device/network bans.'
  },
  {
    q: 'How much internet bandwidth and mobile data does video chat consume?',
    a: 'Text chat consumes virtually zero data (a few kilobytes per minute). Video chat utilizes dynamic WebRTC bandwidth adaptation, typically consuming between 0.5 Mbps and 1.5 Mbps (roughly 250 MB to 600 MB per hour) depending on your resolution and network stability. For the smoothest video calling experience on mobile devices, we recommend connecting via high-speed Wi-Fi or 4G/5G mobile data.'
  }
]

export default function FAQ({ theme, onToggleTheme }) {
  const [openIndices, setOpenIndices] = useState([0, 1, 2, 3])

  const toggleIndex = (idx) => {
    setOpenIndices((prev) =>
      prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx]
    )
  }

  const schemaJson = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQ_DATA.map((item) => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.a,
      },
    })),
  }

  return (
    <div className="page page-enter" style={{ background: 'var(--bg-0)' }}>
      <SEOHead
        title="Frequently Asked Questions (FAQ) — Miloo"
        description="Find clear answers to 20+ questions about Miloo: free random video chat, privacy, WebRTC security, strict 18+ policy, skipping, reporting, and ban appeals."
        canonicalUrl="https://www.miloo.chat/faq"
        schemaJson={schemaJson}
      />

      <Navbar theme={theme} onToggleTheme={onToggleTheme} />

      <main className="container" style={{ paddingTop: 'clamp(32px, 5vw, 56px)', paddingBottom: 'clamp(48px, 8vw, 80px)', maxWidth: 880 }}>
        <header style={{ marginBottom: 48, textAlign: 'left' }}>
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
            Help Center & Common Inquiries
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
            Frequently Asked Questions
          </h1>
          <p
            style={{
              fontSize: 'clamp(16px, 1.8vw, 20px)',
              color: 'var(--text-2)',
              lineHeight: 1.6,
              margin: 0,
            }}
          >
            Find detailed answers to 22 common questions about using Miloo, peer-to-peer WebRTC privacy, reporting abusive behavior, camera troubleshooting, and our strict adult safety standards.
          </p>
        </header>

        {/* FAQ Accordion List */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {FAQ_DATA.map((item, idx) => {
            const isOpen = openIndices.includes(idx)
            return (
              <div key={idx} className="faq-item">
                <button
                  type="button"
                  id={`faq-question-${idx}`}
                  onClick={() => toggleIndex(idx)}
                  aria-expanded={isOpen}
                  aria-controls={`faq-answer-${idx}`}
                  style={{
                    width: '100%',
                    background: 'transparent',
                    border: 'none',
                    padding: '8px 0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 16,
                    cursor: 'pointer',
                    textAlign: 'left',
                  }}
                >
                  <h2
                    style={{
                      margin: 0,
                      fontFamily: 'var(--font-display)',
                      fontSize: 'clamp(18px, 2vw, 21px)',
                      fontWeight: 500,
                      color: isOpen ? 'var(--accent)' : 'var(--text-1)',
                      lineHeight: 1.35,
                      transition: 'color 180ms ease',
                    }}
                  >
                    {item.q}
                  </h2>
                  <span
                    style={{
                      fontSize: '22px',
                      color: 'var(--text-3)',
                      transition: 'transform 200ms ease',
                      transform: isOpen ? 'rotate(45deg)' : 'none',
                      lineHeight: 1,
                      flexShrink: 0,
                    }}
                  >
                    +
                  </span>
                </button>
                <div
                  id={`faq-answer-${idx}`}
                  role="region"
                  aria-labelledby={`faq-question-${idx}`}
                  style={{
                    display: isOpen ? 'block' : 'none',
                    paddingTop: 12,
                    paddingBottom: 8,
                    fontSize: '15px',
                    lineHeight: 1.7,
                    color: 'var(--text-2)',
                    fontFamily: 'var(--font-body)',
                  }}
                >
                  <p style={{ margin: 0 }}>{item.a}</p>
                </div>
              </div>
            )
          })}
        </div>

        {/* Still have questions? */}
        <div className="content-card" style={{ marginTop: 56, textAlign: 'center' }}>
          <h3 style={{ margin: '0 0 10px', fontFamily: 'var(--font-display)', fontSize: '22px', color: 'var(--text-1)' }}>
            Still have questions or need technical support?
          </h3>
          <p style={{ margin: '0 0 20px', color: 'var(--text-2)', fontSize: '15px', maxWidth: 520, marginInline: 'auto' }}>
            Our moderation and support desk is available to assist with safety reports, bug feedback, ban appeals, and partnership questions.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link
              to="/contact"
              style={{
                display: 'inline-block',
                padding: '12px 26px',
                borderRadius: 'var(--radius-pill)',
                background: 'var(--accent)',
                color: '#ffffff',
                fontSize: '14px',
                fontWeight: 600,
                textDecoration: 'none',
              }}
            >
              Contact Support Desk →
            </Link>
            <Link
              to="/safety"
              style={{
                display: 'inline-block',
                padding: '12px 24px',
                borderRadius: 'var(--radius-pill)',
                background: 'var(--surface-2)',
                border: '1px solid var(--border-2)',
                color: 'var(--text-1)',
                fontSize: '14px',
                fontWeight: 600,
                textDecoration: 'none',
              }}
            >
              Safety Center
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
