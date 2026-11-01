import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import SEOHead from '../components/SEOHead'

const SUPPORT_EMAIL = import.meta.env.VITE_SUPPORT_EMAIL || 'support@miloo.chat'

export default function Terms({ theme, onToggleTheme }) {
  return (
    <div className="page page-enter" style={{ background: 'var(--bg-0)' }}>
      <SEOHead
        title="Terms of Service — Miloo (18+ Adults Only)"
        description="Miloo Terms of Service: Platform rules, strict 18+ eligibility requirement, acceptable use policies, AI companion disclosures, and user agreements."
        canonicalUrl="https://www.miloo.chat/terms"
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
            Terms of Service
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
          <h2>1. Acceptance of Terms & 18+ Age Requirement</h2>
          <p>
            Welcome to Miloo (accessible via <a href="https://www.miloo.chat" style={{ color: 'var(--accent)' }}>https://www.miloo.chat</a>). By accessing, browsing, or using our website, services, and real-time chat features, you agree to be bound by these Terms of Service ("Terms") and our <Link to="/privacy" style={{ color: 'var(--accent)' }}>Privacy Policy</Link> and <Link to="/community-guidelines" style={{ color: 'var(--accent)' }}>Community Guidelines</Link>. If you do not agree with any part of these Terms, you must immediately discontinue use of the platform.
          </p>
          <div
            style={{
              background: 'var(--accent-dim)',
              border: '1px solid var(--accent)',
              borderRadius: 'var(--radius-md)',
              padding: '16px 20px',
              margin: '24px 0',
            }}
          >
            <p style={{ margin: 0, fontWeight: 600, color: 'var(--text-1)' }}>
              🔞 MANDATORY ELIGIBILITY: YOU MUST BE AT LEAST 18 YEARS OF AGE TO USE MILOO.
            </p>
            <p style={{ margin: '8px 0 0', fontSize: '14px', color: 'var(--text-2)' }}>
              Miloo is an adult-only platform. Individuals under the age of 18 are strictly prohibited from entering chat rooms, accessing video features, or interacting with other users. By clicking "Start Chat" or confirming our age prompt, you represent and warrant under penalty of perjury that you are at least 18 years old.
            </p>
          </div>

          <h2>2. Description of the Service</h2>
          <p>
            Miloo provides an unauthenticated, anonymous peer-to-peer text and video chat service. The service allows two users to be paired randomly based on mutual availability. Miloo does not require user accounts, passwords, or personal credentials. Users understand that conversations occur in real time and are unscripted.
          </p>

          <h2>3. Prohibited Conduct & Acceptable Use Policy</h2>
          <p>
            You agree to use Miloo in a lawful, civil, and responsible manner. You agree that you will NOT:
          </p>
          <ul>
            <li><strong>Transmit or display child exploitation material:</strong> Any depiction or solicitation involving minors will result in immediate permanent bans and instant reporting to the National Center for Missing & Exploited Children (NCMEC) and law enforcement agencies.</li>
            <li><strong>Display nudity or sexual acts:</strong> Nudity, lewd gestures, sexual solicitation, non-consensual sexual exhibitionism, or webcam exposure are strictly prohibited.</li>
            <li><strong>Harass, intimidate, or threaten others:</strong> Hate speech, slurs, stalking, blackmail, death threats, or encouraging self-harm will not be tolerated.</li>
            <li><strong>Commit fraud or financial scams:</strong> You may not solicit money, cryptocurrency, gift cards, or impersonate other persons or organizations.</li>
            <li><strong>Deploy unauthorized automated scripts:</strong> You may not use automated bots, scrapers, crawlers (except compliant search engine crawlers), or socket flooders against our signaling infrastructure.</li>
            <li><strong>Violate intellectual property:</strong> You may not broadcast copyrighted media, movies, or proprietary audio streams without authorization.</li>
          </ul>

          <h2>4. AI Conversational Companions</h2>
          <p>
            To provide continuous conversational availability when human queue sizes are low, Miloo offers Milo, an artificial intelligence conversational companion. Whenever you are connected to Milo, the interface will display a visible AI badge. Milo is intended for casual entertainment and does not provide professional, medical, legal, or psychological advice.
          </p>

          <h2>5. Reporting & Enforcement Mechanisms</h2>
          <p>
            Miloo provides built-in <strong>Report User</strong> and <strong>Block User</strong> controls. If a user is reported or identified engaging in abusive or prohibited conduct, Miloo reserves the right to terminate active sessions, block IP addresses, and restrict device fingerprints without prior notice or liability.
          </p>

          <h2>6. Third-Party Advertisements & Google AdSense</h2>
          <p>
            Miloo displays advertisements on its public informational pages provided by third-party ad networks, including Google AdSense. Your interactions with advertisers are solely between you and the respective third party. We do not place ads inside private chat sessions.
          </p>

          <h2>7. Disclaimer of Warranties</h2>
          <p>
            MILOO IS PROVIDED ON AN "AS IS" AND "AS AVAILABLE" BASIS WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED. TO THE MAXIMUM EXTENT PERMITTED BY LAW, MILOO DISCLAIMS ALL WARRANTIES, INCLUDING MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT. WE DO NOT GUARANTEE THAT THE SERVICE WILL BE UNINTERRUPTED, BUG-FREE, OR SECURE, NOR DO WE WARRANT THE CONDUCT, SUITABILITY, OR STATEMENTS OF ANY STRANGER YOU MAY ENCOUNTER.
          </p>

          <h2>8. Limitation of Liability</h2>
          <p>
            TO THE FULLEST EXTENT PERMISSIBLE BY APPLICABLE LAW, MILOO AND ITS OPERATORS, AFFILIATES, AND AGENTS SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES ARISING OUT OF OR IN CONNECTION WITH YOUR USE OF THE SERVICE, INCLUDING ANY INTERACTIONS, BEHAVIORS, OR CONTENT TRANSMITTED BY OTHER USERS.
          </p>

          <h2>9. Indemnification</h2>
          <p>
            You agree to defend, indemnify, and hold harmless Miloo and its operators from and against any claims, liabilities, damages, losses, and expenses (including legal fees) arising from or relating to your violation of these Terms or your conduct on the platform.
          </p>

          <h2>10. Modifications to Terms</h2>
          <p>
            Miloo reserves the right to update or modify these Terms at any time. When changes occur, the "Last Updated" date at the top of this page will be revised. Your continued use of the platform after updates indicates your acceptance of the revised Terms.
          </p>

          <h2>11. Contact Information</h2>
          <p>
            If you have questions regarding these Terms of Service, please reach out to us:
          </p>
          <p>
            <strong>Support Desk:</strong> <a href={`mailto:${SUPPORT_EMAIL}`} style={{ color: 'var(--accent)' }}>{SUPPORT_EMAIL}</a><br />
            <strong>Contact Page:</strong> <Link to="/contact" style={{ color: 'var(--accent)' }}>https://www.miloo.chat/contact</Link>
          </p>
        </article>
      </main>

      <Footer />
    </div>
  )
}
