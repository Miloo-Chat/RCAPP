import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import SEOHead from '../components/SEOHead'
import WatercolorMiniBanner from '../components/watercolor/WatercolorMiniBanner'

export default function Transparency({ theme, onToggleTheme }) {
  const schemaJson = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'Transparency & Moderation Policies — Miloo',
    description: 'Learn how Miloo moderation operates: automated text checks, client-side video analysis, zero data retention, and ban appeal procedures.',
    url: 'https://miloo.chat/transparency',
    publisher: {
      '@type': 'Organization',
      name: 'Miloo',
      url: 'https://miloo.chat',
    },
  }

  return (
    <div className="page page-enter" style={{ background: 'var(--bg-0)' }}>
      <SEOHead
        title="Transparency & Moderation Policies — Miloo"
        description="Learn how Miloo moderation operates: automated text checks, client-side video analysis, zero data retention, and ban appeal procedures."
        canonicalUrl="https://miloo.chat/transparency"
        ogImage="https://miloo.chat/og/transparency.png"
        schemaJson={schemaJson}
      />

      <Navbar theme={theme} onToggleTheme={onToggleTheme} />

      <main className="container" style={{ paddingTop: 'clamp(20px, 3.5vw, 40px)', paddingBottom: 'clamp(48px, 8vw, 80px)', maxWidth: 880 }}>
        <WatercolorMiniBanner />

        {/* Breadcrumb Navigation */}
        <nav aria-label="Breadcrumb" style={{ marginBottom: 20 }}>
          <ol style={{ display: 'flex', gap: 8, alignItems: 'center', listStyle: 'none', padding: 0, margin: 0, fontSize: 13, color: 'var(--text-3)' }}>
            <li>
              <Link to="/" style={{ color: 'var(--accent)', textDecoration: 'none' }}>Home</Link>
            </li>
            <li aria-hidden="true">/</li>
            <li aria-current="page" style={{ color: 'var(--text-1)' }}>Transparency</li>
          </ol>
        </nav>

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
            Public Accountability & Trust
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
            Transparency & Moderation
          </h1>
          <p
            style={{
              fontSize: 'clamp(16px, 1.8vw, 20px)',
              color: 'var(--text-2)',
              lineHeight: 1.6,
              margin: 0,
            }}
          >
            A clear, candid account of how we protect users, screen content, retain data, and handle appeals.
          </p>
        </header>

        <article className="content-prose">
          <h2>1. Our Moderation Philosophy</h2>
          <p>
            Miloo was created on a foundational commitment: spontaneous human connection must be safe, civil, and private. Anonymity should empower candid dialogue, not shelter exploitation or abuse.
          </p>
          <p>
            To uphold this balance, our moderation architecture combines privacy-preserving client-side analysis, edge-level server screening, and user-initiated reports. We never sell user data, record calls, or maintain persistent chat histories. Review our <Link to="/safety">Safety Center</Link> and read our <Link to="/community-guidelines">Community Guidelines</Link> for everyday user guidelines.
          </p>

          <h2>2. How Content Screening Works</h2>
          <p>
            We deploy multi-layered automated safeguards to intercept harmful content before it disrupts another user's experience:
          </p>
          <ul>
            <li>
              <strong>Server-Side Text Screening:</strong> Every text message is processed through an automated content safety check prior to delivery. When configured with an API key, we utilize OpenAI's Moderation API; otherwise, an open-source local Detoxify model or internal rule heuristics evaluate the text. Messages containing hate speech, sexual solicitation, severe harassment, or phishing links are immediately blocked. Senders receive a strike warning; repeated violations result in immediate session detachment and temporary bans. Miloo does not use AI bots or automated partners. Every stranger you meet is a real person.
            </li>
            <li>
              <strong>On-Device Video Analysis:</strong> Video streams are sampled client-side using TensorFlow.js and self-hosted NSFWJS model weights running locally in your browser (one frame every 3 seconds). If explicit nudity or sexual misconduct is detected, the remote video is immediately blurred with a safety alert, the connection is terminated, and the incident is flagged. <em>Frames never leave the user's browser unless the user chooses to submit a formal report.</em>
            </li>
            <li>
              <strong>Human-in-the-Loop Review:</strong> Reports submitted by users are queued in an internal moderation portal reviewed by our Trust & Safety staff to resolve contested cases and detect systemic spam networks.
            </li>
          </ul>

          <h2>3. What Is Strictly Blocked</h2>
          <p>
            Miloo enforces a zero-tolerance policy against the following behaviors:
          </p>
          <ol>
            <li><strong>Child Sexual Abuse Material (CSAM):</strong> Any depiction, solicitation, or discussion involving minors is immediately blocked, reported to NCMEC (National Center for Missing & Exploited Children) and law enforcement, and results in a permanent network-wide ban.</li>
            <li><strong>Non-Consensual Nudity & Sexual Acts:</strong> Genital exposure, masturbation, or sexually explicit behavior without mutual adult consent.</li>
            <li><strong>Harassment & Hate Speech:</strong> Targeted racial, religious, sexual orientation, or gender-based slurs, threats of violence, and cyberbullying. Read our guide on <Link to="/blog/what-to-do-if-someone-harasses-you-online">what to do if someone harasses you online</Link>.</li>
            <li><strong>Scams & Financial Fraud:</strong> Phishing URLs, fake investment schemes, extortion, and impersonation bots. Learn more in our guide on <Link to="/blog/how-to-spot-scams-on-chat-sites">spotting chat scams</Link>.</li>
            <li><strong>Doxxing:</strong> Revealing private legal names, phone numbers, home addresses, or social accounts of third parties.</li>
          </ol>

          <h2>4. Data Retention & Logging Policies</h2>
          <p>
            We believe that the safest user data is data that is never stored. Here is exactly what we keep and for how long:
          </p>
          <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 16, marginBottom: 24, fontSize: 14 }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--border-2)', textAlign: 'left' }}>
                <th style={{ padding: '10px 12px', color: 'var(--text-1)' }}>Data Category</th>
                <th style={{ padding: '10px 12px', color: 'var(--text-1)' }}>Recipient / Third Party</th>
                <th style={{ padding: '10px 12px', color: 'var(--text-1)' }}>Purpose</th>
                <th style={{ padding: '10px 12px', color: 'var(--text-1)' }}>Retention Period</th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ borderBottom: '1px solid var(--border-1)' }}>
                <td style={{ padding: '10px 12px' }}>Video & Audio Streams</td>
                <td style={{ padding: '10px 12px' }}>Matched Peer (WebRTC P2P)</td>
                <td style={{ padding: '10px 12px' }}>Live real-time calling</td>
                <td style={{ padding: '10px 12px' }}><strong>0 seconds</strong> (never recorded or mirrored)</td>
              </tr>
              <tr style={{ borderBottom: '1px solid var(--border-1)' }}>
                <td style={{ padding: '10px 12px' }}>Text Chat Messages</td>
                <td style={{ padding: '10px 12px' }}>OpenAI (if key configured) or local Detoxify / Regex engine; matched peer</td>
                <td style={{ padding: '10px 12px' }}>Automated safety check & message delivery</td>
                <td style={{ padding: '10px 12px' }}><strong>Cleared on skip/disconnect</strong> (in-transit check only)</td>
              </tr>
              <tr style={{ borderBottom: '1px solid var(--border-1)' }}>
                <td style={{ padding: '10px 12px' }}>Bot Verification Telemetry</td>
                <td style={{ padding: '10px 12px' }}>Cloudflare Turnstile (challenges.cloudflare.com)</td>
                <td style={{ padding: '10px 12px' }}>Bot mitigation & anti-spam pre-screening</td>
                <td style={{ padding: '10px 12px' }}>Ephemeral (tokens verified server-side and discarded)</td>
              </tr>
              <tr style={{ borderBottom: '1px solid var(--border-1)' }}>
                <td style={{ padding: '10px 12px' }}>Cookieless Analytics</td>
                <td style={{ padding: '10px 12px' }}>Umami (analytics.umami.is or self-hosted)</td>
                <td style={{ padding: '10px 12px' }}>Aggregate pageviews & Web Vitals on public pages only</td>
                <td style={{ padding: '10px 12px' }}>Aggregate metrics; no cookies or chat content</td>
              </tr>
              <tr style={{ borderBottom: '1px solid var(--border-1)' }}>
                <td style={{ padding: '10px 12px' }}>Google Analytics 4 (GA4)</td>
                <td style={{ padding: '10px 12px' }}>Google LLC (googletagmanager.com)</td>
                <td style={{ padding: '10px 12px' }}>Aggregate traffic analysis on public informational pages only (Consent Mode v2 default denied; requires opt-in; strictly excluded from /chat, /call, /admin, and /transparency)</td>
                <td style={{ padding: '10px 12px' }}><code>_ga</code> (2 years), <code>_ga_&lt;container-id&gt;</code> (2 years); 0 IP storage</td>
              </tr>
              <tr style={{ borderBottom: '1px solid var(--border-1)' }}>
                <td style={{ padding: '10px 12px' }}>Server-Side Matching Counters</td>
                <td style={{ padding: '10px 12px' }}>Miloo internal server (no third party)</td>
                <td style={{ padding: '10px 12px' }}>Aggregated matchmaking performance (% matched &le;15s/30s/60s, median wait, wait timeouts, chat length buckets, ended_by reasons, peak concurrent users)</td>
                <td style={{ padding: '10px 12px' }}>Statistical aggregates only; zero IPs, zero user IDs, zero chat content</td>
              </tr>
              <tr style={{ borderBottom: '1px solid var(--border-1)' }}>
                <td style={{ padding: '10px 12px' }}>Hashed IP & Device Tokens</td>
                <td style={{ padding: '10px 12px' }}>Miloo internal storage (PostgreSQL / JSON)</td>
                <td style={{ padding: '10px 12px' }}>Enforcing temporary suspensions and permanent bans</td>
                <td style={{ padding: '10px 12px' }}>Duration of ban (10 min, 24 h, 7 days, or permanent)</td>
              </tr>
              <tr style={{ borderBottom: '1px solid var(--border-1)' }}>
                <td style={{ padding: '10px 12px' }}>User Abuse Reports</td>
                <td style={{ padding: '10px 12px' }}>Miloo moderation queue</td>
                <td style={{ padding: '10px 12px' }}>Investigation of reported harassment or illegal acts</td>
                <td style={{ padding: '10px 12px' }}>30 days (purged automatically)</td>
              </tr>
              <tr>
                <td style={{ padding: '10px 12px' }}>Moderation Incident Log</td>
                <td style={{ padding: '10px 12px' }}>Server filesystem (<code>incidents.log</code>)</td>
                <td style={{ padding: '10px 12px' }}>Auditing fail-safe triggers and moderation outages</td>
                <td style={{ padding: '10px 12px' }}>Server diagnostic cycle; rotated periodically</td>
              </tr>
            </tbody>
          </table>

          <h2>5. Escalating Bans & Enforcement</h2>
          <p>
            To deter repeat offenses while accounting for shared networks (such as university dorms or mobile carrier NAT gateways), Miloo applies progressive enforcement:
          </p>
          <ul>
            <li><strong>First Strike:</strong> Real-time message block and warning modal.</li>
            <li><strong>Second Strike:</strong> 10-minute temporary suspension.</li>
            <li><strong>Third Strike:</strong> 24-hour network ban.</li>
            <li><strong>Severe or Repeated Abuse:</strong> 7-day to permanent blacklist across both IP hash and device tokens.</li>
          </ul>

          <h2>6. How to Appeal a Suspension or Ban</h2>
          <p>
            Because we use automated heuristics, false positives can occasionally occur—especially on communal Wi-Fi networks where a previous user may have caused a shared IP ban.
          </p>
          <p>
            If you believe your connection was restricted in error:
          </p>
          <ol>
            <li>Email our appeals desk at <a href="mailto:support@miloo.chat" style={{ color: 'var(--accent)' }}>support@miloo.chat</a> with the subject line <code>Ban Appeal</code>.</li>
            <li>Include your approximate timestamp, connection mode (Text or Video), and general ISP/region.</li>
            <li>Our human moderation staff reviews appeals within 24 to 48 hours and will clear mistakenly flagged identifiers.</li>
          </ol>
          <p>
            For further legal and privacy policies, review our <Link to="/privacy">Privacy Policy</Link> and <Link to="/terms">Terms of Service</Link>.
          </p>
        </article>

        {/* Back Link */}
        <div style={{ marginTop: 44, paddingTop: 24, borderTop: '1px solid var(--border-1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Link to="/" style={{ color: 'var(--accent)', textDecoration: 'none', fontSize: '14px', fontWeight: 600 }}>
            ← Back to Homepage
          </Link>
          <Link to="/about" style={{ color: 'var(--text-2)', textDecoration: 'none', fontSize: '14px' }}>
            Learn about our team →
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  )
}

