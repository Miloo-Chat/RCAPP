import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import SEOHead from '../components/SEOHead'
import WatercolorMiniBanner from '../components/watercolor/WatercolorMiniBanner'
import { SUPPORT_EMAIL } from '../config/site'

export default function Privacy({ theme, onToggleTheme }) {
  return (
    <div className="page page-enter" style={{ background: 'var(--bg-0)' }}>
      <SEOHead
        title="Privacy Policy — Miloo Anonymous Chat"
        description="Miloo Privacy Policy. Every chat is with a real person. Learn how we protect privacy, manage ephemeral WebRTC streams, disclose cookies, and respect privacy rights."
        canonicalUrl="https://miloo.chat/privacy"
      />

      <Navbar theme={theme} onToggleTheme={onToggleTheme} />

      <main className="container" style={{ paddingTop: 'clamp(20px, 3.5vw, 40px)', paddingBottom: 'clamp(48px, 8vw, 80px)', maxWidth: 880 }}>
        {/* Subtle watercolor sagging wire & perched ink sparrows */}
        <WatercolorMiniBanner />

        <header style={{ marginBottom: 40, textAlign: 'left' }}>
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
            Legal & Compliance
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
            Privacy Policy
          </h1>
          <p
            style={{
              fontSize: '14px',
              color: 'var(--text-3)',
              margin: 0,
            }}
          >
            Last Updated: November 4, 2026 · Effective Immediately
          </p>
        </header>

        <article className="content-prose">
          <h2>1. Introduction & Our Commitment to Privacy</h2>
          <p>
            At Miloo (accessible via <a href="https://miloo.chat" style={{ color: 'var(--accent)', textDecoration: 'underline' }}>https://miloo.chat</a>), the privacy and confidentiality of our visitors are fundamental to our mission. On Miloo, every chat is with a real person — we never employ automated bots or simulated partners. We believe that spontaneous, serendipitous conversations on the internet should not come at the cost of personal surveillance. This Privacy Policy details the types of information we process, how technical data is handled during peer-to-peer connections, and how we comply with global privacy standards, including the EU General Data Protection Regulation (GDPR), the California Consumer Privacy Act (CCPA/CPRA), and the Indian Digital Personal Data Protection Act (DPDP).
          </p>

          <h2>2. Information We Do NOT Collect</h2>
          <p>
            Miloo operates on a strict zero-retention and data-minimization architecture. Unlike conventional communication apps, we do NOT require:
          </p>
          <ul>
            <li>User accounts, usernames, or passwords.</li>
            <li>Personal email addresses or phone numbers.</li>
            <li>Social network profiles, address books, or friend lists.</li>
            <li>Government IDs, financial information, or credit card details.</li>
          </ul>

          <h2>3. Information Collected Automatically</h2>
          <p>
            To deliver real-time connections, maintain server stability, and prevent malicious abuse or denial-of-service attacks, we process minimal technical diagnostic data:
          </p>
          <ul>
            <li>
              <strong>IP Address (Hashed for Ban Enforcement):</strong> When your device connects to our signaling server, your IP address is processed server-side. For the purpose of enforcing suspensions and bans, your IP is immediately hashed using SHA-256 — the raw IP address is never stored in any database or log. The hashed value is retained only for the duration of an active ban (10 minutes, 24 hours, 7 days, or permanent), and is used solely to prevent re-entry after a moderation action.
            </li>
            <li>
              <strong>Device & Browser Metadata:</strong> Information such as browser user-agent, operating system, and viewport dimensions are evaluated client-side to ensure responsive layouts and WebRTC browser compatibility.
            </li>
            <li>
              <strong>Diagnostic Logs:</strong> Server connection logs (timestamp of connection, connection duration, error codes) are maintained temporarily for system health monitoring and security rate-limiting, and are regularly purged. Moderation backend failures are additionally written to <code>server/data/incidents.log</code> on the server.
            </li>
          </ul>

          <h2>4. WebRTC Audio & Video Streams: End-to-End Peer-to-Peer</h2>
          <p>
            Miloo’s video and voice chat function via WebRTC (Web Real-Time Communication). When two users are matched:
          </p>
          <ul>
            <li>Media packets (audio and video) travel directly between the two users’ web browsers using DTLS (Datagram Transport Layer Security) and SRTP (Secure Real-Time Transport Protocol) encryption.</li>
            <li><strong>Miloo servers never decode, record, mirror, or store your live audio or video streams.</strong></li>
            <li>In Voice Chat mode your browser asks for microphone access only. No camera is used.</li>
            <li>In the rare event that a direct peer-to-peer connection cannot be established due to symmetric NAT firewalls, an encrypted TURN relay transmits packets without decrypting or saving content.</li>
          </ul>

          <h2>5. Cookies, Web Beacons & Local Storage</h2>
          <p>
            Miloo uses cookies and modern browser storage technologies (such as <code>localStorage</code> and <code>sessionStorage</code>) for necessary platform operations:
          </p>
          <ul>
            <li>
              <strong>Essential Storage:</strong> We store your UI theme preference (dark/light), cookie consent choices, and ephemeral session age confirmation. These are strictly functional and do not track you across the web.
            </li>
            <li>
              <strong>Analytics (Google Analytics 4 & Consent Mode v2):</strong> When consented to via our cookie banner, we use Google Analytics 4 (GA4) with Google Consent Mode v2 to collect aggregate, anonymous statistics regarding public editorial visits. Consent signals default to <code>denied</code> on page load. GA4 scripts and cookies (<code>_ga</code> and <code>_ga_&lt;container-id&gt;</code>, each with an exact retention period of <strong>2 years</strong>) are loaded <em>only</em> on public informational pages after explicit opt-in and are <strong>strictly excluded</strong> from <code>/chat</code>, <code>/call</code>, <code>/admin</code>, the age gate, and <code>/transparency</code>. Only 6 non-identifying events are permitted: <code>page_view</code>, <code>click_text_chat</code>, <code>click_video_chat</code>, <code>click_voice_chat</code>, <code>age_gate_result</code>, and <code>share_click</code>. No user IDs, IPs, or chat message content are ever stored or transmitted.
            </li>
            <li>
              <strong>Server-Side Anonymous Counters:</strong> Our backend server tracks aggregate funnel counters (sessions requested per day/mode, % matched within 15/30/60s, median wait, 60s timeouts, chat length buckets, session ended_by reasons, and peak concurrent users). These counters are strictly anonymous with zero IPs, user identifiers, or message text.
            </li>
            <li>
              <strong>Analytics (Umami — Cookieless):</strong> We also support Umami, a privacy-friendly, cookieless analytics tool, to understand aggregate platform usage without fingerprinting or tracking cookies.
            </li>
          </ul>

          <h2>6. Advertising (Currently Not Active)</h2>
          <p>
            Miloo does not currently run third-party advertisements or ad tracking cookies (<code>ADS_ENABLED=false</code>). If ad networks are integrated in the future on public informational pages:
          </p>
          <ul>
            <li>Third-party ad vendors (such as Google AdSense) may use cookies to serve ads based on visits to this and other websites.</li>
            <li>Users can opt out of personalized ads via <a href="https://adssettings.google.com" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent)', textDecoration: 'underline' }}>Google Ads Settings</a>.</li>
            <li><strong>Strict Guarantee:</strong> Advertisements will never be injected into active text, voice or video chat rooms.</li>
          </ul>

          <h2>7. Bot Prevention & Cloudflare Turnstile</h2>
          <p>
            Before entering the matchmaking queue, users complete a privacy-preserving Cloudflare Turnstile check to prevent automated spam bots. Turnstile analyzes browser technical telemetry non-intrusively to verify human presence without using invasive tracking cookies or CAPTCHA puzzles. Verification tokens are checked server-side and immediately discarded.
          </p>

          <h2>8. Text Chat Moderation</h2>
          <p>
            To keep spontaneous chat safe from illegal conduct, hate speech, and harassment:
          </p>
          <ul>
            <li><strong>Automated Text Moderation:</strong> Outgoing chat messages pass through an automated safety evaluation before delivery. If configured, OpenAI's Moderation API is used; otherwise, a local Detoxify machine learning model or rule-based heuristics screen the text. Messages are analyzed strictly in transit and are never permanently stored on servers.</li>
          </ul>

          <h2>9. Data Retention & Deletion Requests</h2>
          <p>
            Because Miloo does not maintain persistent user accounts, chat logs, or video or voice recordings, there is generally no personally identifiable record to delete once a chat session terminates. Text messages exist only in browser memory and on the peer’s screen during the active socket session and are wiped immediately upon disconnecting or skipping.
          </p>
          <p>
            If you submitted an abuse report or contacted our support team via email, your correspondence is maintained in our support records for safety verification and legal audit compliance. Abuse reports (including reported message snippets) are kept for up to 30 days and then permanently purged. You have the right to request deletion of any support tickets by emailing <a href={`mailto:${SUPPORT_EMAIL}`} style={{ color: 'var(--accent)', textDecoration: 'underline' }}>{SUPPORT_EMAIL}</a>.
          </p>

          <h2>10. Your Rights Under GDPR, CCPA, and Global Laws</h2>
          <p>
            Depending on your jurisdiction, you may have statutory privacy rights regarding your personal data:
          </p>
          <ul>
            <li><strong>Right of Access:</strong> You can request details on the technical data we hold about your interactions.</li>
            <li><strong>Right to Rectification & Erasure:</strong> You can ask us to correct or delete any stored communications or support tickets.</li>
            <li><strong>Right to Restrict or Object to Processing:</strong> You can object to specific data processing activities.</li>
            <li><strong>Non-Discrimination:</strong> We will never discriminate against you for exercising any of your privacy rights.</li>
          </ul>

          <h2>11. Children’s Privacy: Strict 18+ Prohibition</h2>
          <p>
            Miloo is strictly for adults aged 18 and older. We do not knowingly collect, solicit, or process personal data from anyone under the age of 18. If we discover or are notified that a minor has accessed the chat platform, we take immediate action to terminate the session, blacklist the associated device identifiers, and purge any related records in compliance with COPPA and international child safety laws.
          </p>

          <h2>12. Security Measures & Contact Us</h2>
          <p>
            We deploy strict technical safeguards, including HTTPS transport security with HSTS preload, Content Security Policies, TLS encryption, and automated rate-limiting to protect our infrastructure.
          </p>
          <p>
            If you have questions, privacy concerns, or data requests, please contact our Data Protection representative at:
          </p>
          <p>
            <strong>Miloo Privacy Desk:</strong> <a href={`mailto:${SUPPORT_EMAIL}`} style={{ color: 'var(--accent)', textDecoration: 'underline' }}>{SUPPORT_EMAIL}</a><br />
            <strong>Contact Desk:</strong> <Link to="/contact" style={{ color: 'var(--accent)', textDecoration: 'underline' }}>https://miloo.chat/contact</Link>
          </p>
        </article>
      </main>

      <Footer />
    </div>
  )
}
