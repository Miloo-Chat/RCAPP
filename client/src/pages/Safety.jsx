import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import SEOHead from '../components/SEOHead'
import WatercolorMiniBanner from '../components/watercolor/WatercolorMiniBanner'

export default function Safety({ theme, onToggleTheme }) {
  return (
    <div className="page page-enter" style={{ background: 'var(--bg-0)' }}>
      <SEOHead
        title="Safety Center & Online Chat Guidelines — Miloo"
        description="Essential safety tips for chatting with strangers online. Protect your privacy, spot scam red flags, secure video backgrounds, and report abusive conduct."
        canonicalUrl="https://miloo.chat/safety"
      />

      <Navbar theme={theme} onToggleTheme={onToggleTheme} />

      <main className="container" style={{ paddingTop: 'clamp(20px, 3.5vw, 40px)', paddingBottom: 'clamp(48px, 8vw, 80px)', maxWidth: 880 }}>
        {/* Subtle watercolor sagging wire & perched ink sparrows */}
        <WatercolorMiniBanner />

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
            Trust, Security & User Protection
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
            Safety Center & Tips for Chatting with Strangers
          </h1>
          <p
            style={{
              fontSize: 'clamp(16px, 1.8vw, 20px)',
              color: 'var(--text-2)',
              lineHeight: 1.6,
              margin: 0,
            }}
          >
            Connecting with strangers across the globe can be inspiring and fun, but your personal security and peace of mind must always come first.
          </p>
        </header>

        <article className="content-prose">
          <h2>1. The Core Golden Rule: Keep PII Strictly Confidential</h2>
          <p>
            Personally Identifiable Information (PII) is any piece of data that can be used alone or combined with other data to identify, contact, or locate you in the physical world. When talking to someone you do not know, treat your identity as strictly confidential:
          </p>
          <ul>
            <li><strong>Never share full names:</strong> Stick to simple first-name aliases or casual handles if asked. Never disclose family names or surnames.</li>
            <li><strong>Do not reveal precise geographical locations:</strong> Sharing your general country or broad region is fine, but never name your neighborhood, street, local apartment complex, or school campus.</li>
            <li><strong>Protect contact avenues:</strong> Do not share personal phone numbers, primary email addresses, or social media handles (Instagram, Snapchat, Facebook, LinkedIn) early in a conversation.</li>
            <li><strong>Never share workplace or student details:</strong> Details about where you work, study, or hang out on weekends make physical stalking or social engineering dramatically easier.</li>
          </ul>

          <h2>2. Guarding Your Visual Privacy on Video Chat</h2>
          <p>
            When engaging in live video conversations, your camera lens captures more than just your face. Before enabling your webcam, perform a quick background inspection:
          </p>
          <ul>
            <li><strong>Inspect your background:</strong> Look around your room. Are diplomas, certificates, prescription medication bottles, framed family photos, or mail envelopes visible? Put them away.</li>
            <li><strong>Check window reflections and landmarks:</strong> If your desk sits near an open window, distinctive street signs, vehicle license plates, or recognizable local skylines might be visible to the other person.</li>
            <li><strong>Maintain proper attire:</strong> Treat random video calls as a public space. Do not undress or appear partially clothed on camera. Miloo has zero tolerance for nudity and sexually explicit conduct.</li>
            <li><strong>Be aware of screen mirroring:</strong> If your device has software mirrors or multiple displays, verify that sensitive tabs (banking, email, work slack) are not accidentally broadcast.</li>
          </ul>

          <h2>3. Spotting Scams and Off-Platform Requests</h2>
          <p>
            Malicious actors on stranger chat networks often attempt to bypass platform safety features by urging you to switch apps immediately. Watch out for these standard red flags:
          </p>
          <ul>
            <li><strong>"Let's move to Telegram / WhatsApp / Snapchat":</strong> Scammers frequently try to migrate targets to third-party messaging apps where they can send malicious links, phishing files, or attempt blackmail away from Miloo's reporting infrastructure.</li>
            <li><strong>Emergency money requests:</strong> Anyone claiming sudden travel distress, hospital emergencies, locked bank accounts, or visa problems is running a financial scam. Never transfer money, cryptocurrency, or gift cards to someone you met online.</li>
            <li><strong>Unsolicited investment opportunities:</strong> Be extremely skeptical of anyone bragging about lucrative forex, crypto trading bots, or guaranteed returns.</li>
            <li><strong>External links and downloads:</strong> Never click shortened URLs, file transfer links, or download executable programs sent by a stranger in chat.</li>
          </ul>

          <h2 id="reporting">4. Multi-Layered Moderation & Zero-Tolerance 18+ Enforcement</h2>
          <p>
            Miloo is engineered exclusively for mature legal adults aged 18 and older. Minors are strictly prohibited from using the platform under any circumstances. Because stranger interactions are unscripted, users may encounter sensitive conversations or adult topics. We maintain zero tolerance for child sexual abuse material (CSAM), non-consensual sexually explicit content, harassment, stalking, hate speech, and scams. Any detected or reported violations result in immediate device fingerprint and IP bans.
          </p>
          <p>
            To ensure comprehensive community protection across every connection:
          </p>
          <ul>
            <li>
              <strong>Mandatory Pre-Flight Age Confirmation:</strong> Every visitor must actively affirm that they are 18 or older before any video or text session can be initiated.
            </li>
            <li>
              <strong>Instant User Blacklisting:</strong> Using the "Block" control severs the peer connection and blacklists that partner's session ID, guaranteeing you will not be matched with them again.
            </li>
            <li>
              <strong>Granular Abuse Categorization:</strong> Reports submit diagnostic technical context directly to our review team to identify recurring bad actors and enforce hardware-level bans.
            </li>
          </ul>

          <h2>5. Using Miloo's Built-In Safety Tools</h2>
          <p>
            Miloo provides immediate tools inside every chat room to keep you in complete control of your experience:
          </p>
          <ul>
            <li><strong>Instant Skip:</strong> You never owe a stranger your time or attention. If a conversation feels awkward, pushy, or uncomfortable, press <strong>Skip</strong> (or the ESC key) immediately to move to a new match.</li>
            <li><strong>Block User:</strong> If a user is hostile or creepy, tap <strong>Block</strong>. This severs the connection and blacklists their session ID so you are never matched with them again.</li>
            <li><strong>Report User:</strong> Use the Report button to flag violations. Categories include Harassment, Nudity / Explicit Behavior, Spam, Threats, and Scams. Reports are routed to our administrative moderation review queue.</li>
          </ul>

          <h2>6. What to Do If You Experience Extortion or Sextortion</h2>
          <p>
            Sextortion occurs when someone threatens to share compromising webcam screenshots or recorded video unless you pay money or provide more images. If you encounter this:
          </p>
          <ul>
            <li><strong>Do NOT pay any money:</strong> Paying never stops an extortionist; it only proves that you are willing to pay and encourages further demands.</li>
            <li><strong>Cease all communication:</strong> Immediately disconnect and block the individual.</li>
            <li><strong>Preserve evidence:</strong> Take screenshots of the user's messages and profile information for legal authorities.</li>
            <li><strong>Contact specialized support:</strong> Reach out to local law enforcement cybercrime units and dedicated support services such as the FBI's Internet Crime Complaint Center (IC3) or Take It Down (by NCMEC).</li>
          </ul>

          <h2>7. External Support Hotlines & Helplines</h2>
          <p>
            If you or someone you know has experienced severe harassment, exploitation, or emotional distress, confidential external resources are available 24/7:
          </p>
          <ul>
            <li><strong>Crisis Text Line:</strong> Text HOME to 741741 (Free, 24/7 crisis support in the US, UK, and Canada).</li>
            <li><strong>Cyber Civil Rights Initiative (CCRI):</strong> Helpline for victims of nonconsensual intimate imagery: 844-878-2274.</li>
            <li><strong>National Center for Missing & Exploited Children (NCMEC):</strong> CyberTipline at 1-800-843-5678 or report online at <a href="https://report.cybertip.org" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent)', textDecoration: 'underline' }}>report.cybertip.org</a>.</li>
            <li><strong>International Resources:</strong> Find helplines in your country at <a href="https://findahelpline.com" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent)', textDecoration: 'underline' }}>findahelpline.com</a>.</li>
          </ul>
        </article>

        {/* Action Card */}
        <div className="content-card" style={{ marginTop: 48 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
            <span style={{ fontSize: '24px' }}>🛡️</span>
            <h3 style={{ margin: 0, fontFamily: 'var(--font-display)', fontSize: '20px', color: 'var(--text-1)' }}>
              Need to report an urgent incident to our team?
            </h3>
          </div>
          <p style={{ margin: '0 0 16px', color: 'var(--text-2)', fontSize: '14px', lineHeight: 1.6 }}>
            If you witnessed or experienced severe violations of our policies, contact our moderation team directly via our support channel.
          </p>
          <Link
            to="/contact"
            style={{
              display: 'inline-block',
              padding: '10px 22px',
              borderRadius: 'var(--radius-pill)',
              background: 'var(--surface-2)',
              border: '1px solid var(--border-2)',
              color: 'var(--text-1)',
              fontSize: '14px',
              fontWeight: 600,
              textDecoration: 'none',
            }}
          >
            Contact Safety Team →
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  )
}
