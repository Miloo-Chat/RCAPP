import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import SEOHead from '../components/SEOHead'

const SUPPORT_EMAIL = import.meta.env.VITE_SUPPORT_EMAIL || 'support@miloo.chat'

export default function Privacy({ theme, onToggleTheme }) {
  return (
    <div className="page page-enter" style={{ background: 'var(--bg-0)' }}>
      <SEOHead
        title="Privacy Policy — Miloo Anonymous Chat"
        description="Miloo Privacy Policy: Learn how we protect privacy, manage ephemeral WebRTC streams, disclose Google AdSense and cookies, and respect user privacy rights."
        canonicalUrl="https://www.miloo.chat/privacy"
      />

      <Navbar theme={theme} onToggleTheme={onToggleTheme} />

      <main className="container" style={{ paddingTop: 'clamp(32px, 5vw, 56px)', paddingBottom: 'clamp(48px, 8vw, 80px)', maxWidth: 880 }}>
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
            Last Updated: November 1, 2026 · Effective Immediately
          </p>
        </header>

        <article className="content-prose">
          <h2>1. Introduction & Our Commitment to Privacy</h2>
          <p>
            At Miloo (accessible via <a href="https://www.miloo.chat" style={{ color: 'var(--accent)' }}>https://www.miloo.chat</a>), the privacy and confidentiality of our visitors are fundamental to our mission. We believe that spontaneous, serendipitous conversations on the internet should not come at the cost of personal surveillance. This Privacy Policy details the types of information we process, how technical data is handled during peer-to-peer connections, and how we comply with global privacy standards, including the EU General Data Protection Regulation (GDPR), the California Consumer Privacy Act (CCPA/CPRA), and the Indian Digital Personal Data Protection Act (DPDP).
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
              <strong>Ephemeral IP Addresses:</strong> When your device connects to our signaling server, your IP address is processed temporarily in server memory to facilitate WebSockets and ICE candidate routing for WebRTC. IP addresses are never attached to user profiles.
            </li>
            <li>
              <strong>Device & Browser Metadata:</strong> Information such as browser user-agent, operating system, and viewport dimensions are evaluated client-side to ensure responsive layouts and WebRTC browser compatibility.
            </li>
            <li>
              <strong>Diagnostic Logs:</strong> Server connection logs (timestamp of connection, connection duration, error codes) are maintained temporarily for system health monitoring and security rate-limiting, and are regularly purged.
            </li>
          </ul>

          <h2>4. WebRTC Audio & Video Streams: End-to-End Peer-to-Peer</h2>
          <p>
            Miloo’s video chat functions via WebRTC (Web Real-Time Communication). When two users are matched:
          </p>
          <ul>
            <li>Media packets (audio and video) travel directly between the two users’ web browsers using DTLS (Datagram Transport Layer Security) and SRTP (Secure Real-Time Transport Protocol) encryption.</li>
            <li><strong>Miloo servers never receive, record, mirror, decode, or store your live audio or video streams.</strong></li>
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
              <strong>Analytics:</strong> We use Google Analytics 4 to understand macro-level platform usage (aggregate visitor counts, general country distribution, page views). IP anonymization is active.
            </li>
          </ul>

          <h2>6. Advertising & Google AdSense Disclosure</h2>
          <p>
            Miloo displays third-party advertisements served by Google AdSense solely on our public informational and editorial pages (such as our Homepage, About, Safety Center, FAQ, and Blog).
          </p>
          <ul>
            <li>
              <strong>Google AdSense & DoubleClick Cookie:</strong> Google, as a third-party vendor, uses cookies to serve ads on our site. Google's use of advertising cookies enables it and its partners to serve ads to our users based on their visit to our site and other sites on the internet.
            </li>
            <li>
              <strong>Opt-Out Options:</strong> Users may opt out of personalized advertising by visiting <a href="https://adssettings.google.com" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent)' }}>Google Ads Settings</a> or through the Network Advertising Initiative at <a href="https://www.aboutads.info" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent)' }}>www.aboutads.info</a>.
            </li>
            <li>
              <strong>Strict Separation of Ads and Chat Rooms:</strong> Advertisements are strictly prohibited and never injected within private text or video chat rooms, protecting your conversational environment from commercial tracking.
            </li>
          </ul>

          <h2>7. Data Retention & Deletion Requests</h2>
          <p>
            Because Miloo does not maintain persistent user accounts, chat logs, or video recordings, there is generally no personally identifiable record to delete once a chat session terminates. Text messages exist only in browser memory and on the peer’s screen during the active socket session and are wiped immediately upon disconnecting or skipping.
          </p>
          <p>
            If you submitted an abuse report or contacted our support team via email, your correspondence is maintained in our support records for safety verification and legal audit compliance. You have the right to request deletion of any support tickets by emailing <a href={`mailto:${SUPPORT_EMAIL}`} style={{ color: 'var(--accent)' }}>{SUPPORT_EMAIL}</a>.
          </p>

          <h2>8. Your Rights Under GDPR, CCPA, and Global Laws</h2>
          <p>
            Depending on your jurisdiction, you may have statutory privacy rights regarding your personal data:
          </p>
          <ul>
            <li><strong>Right of Access:</strong> You can request details on the technical data we hold about your interactions.</li>
            <li><strong>Right to Rectification & Erasure:</strong> You can ask us to correct or delete any stored communications or support tickets.</li>
            <li><strong>Right to Restrict or Object to Processing:</strong> You can object to specific data processing activities.</li>
            <li><strong>Non-Discrimination:</strong> We will never discriminate against you for exercising any of your privacy rights.</li>
          </ul>

          <h2>9. Children’s Privacy: Strict 18+ Prohibition</h2>
          <p>
            Miloo is strictly for adults aged 18 and older. We do not knowingly collect, solicit, or process personal data from anyone under the age of 18. If we discover or are notified that a minor has accessed the chat platform, we take immediate action to terminate the session, blacklist the associated device identifiers, and purge any related records in compliance with COPPA and international child safety laws.
          </p>

          <h2>10. Security Measures & Contact Us</h2>
          <p>
            We deploy strict technical safeguards, including HTTPS transport security with HSTS preload, Content Security Policies, TLS encryption, and automated rate-limiting to protect our infrastructure.
          </p>
          <p>
            If you have questions, privacy concerns, or data requests, please contact our Data Protection representative at:
          </p>
          <p>
            <strong>Miloo Privacy Desk:</strong> <a href={`mailto:${SUPPORT_EMAIL}`} style={{ color: 'var(--accent)' }}>{SUPPORT_EMAIL}</a><br />
            <strong>Contact Desk:</strong> <Link to="/contact" style={{ color: 'var(--accent)' }}>https://www.miloo.chat/contact</Link>
          </p>
        </article>
      </main>

      <Footer />
    </div>
  )
}
