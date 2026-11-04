import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import SEOHead from '../components/SEOHead'
import WatercolorMiniBanner from '../components/watercolor/WatercolorMiniBanner'
import { SUPPORT_EMAIL, GRIEVANCE_OFFICER } from '../config/site'

export default function Terms({ theme, onToggleTheme }) {
  return (
    <div className="page page-enter" style={{ background: 'var(--bg-0)' }}>
      <SEOHead
        title="Terms of Service — Miloo (18+ Adults Only)"
        description="Miloo Terms of Service: Platform rules, strict 18+ eligibility requirement, acceptable use policies, and user agreements."
        canonicalUrl="https://miloo.chat/terms"
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
            Terms of Service
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
          <h2>1. Acceptance of Terms & 18+ Age Requirement</h2>
          <p>
            Welcome to Miloo (accessible via <a href="https://miloo.chat" style={{ color: 'var(--accent)', textDecoration: 'underline' }}>https://miloo.chat</a>). By accessing, browsing, or using our website, services, and real-time chat features, you agree to be bound by these Terms of Service ("Terms") and our <Link to="/privacy" style={{ color: 'var(--accent)', textDecoration: 'underline' }}>Privacy Policy</Link> and <Link to="/community-guidelines" style={{ color: 'var(--accent)', textDecoration: 'underline' }}>Community Guidelines</Link>. If you do not agree with any part of these Terms, you must immediately discontinue use of the platform.
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

          <h2>4. Reporting & Enforcement Mechanisms</h2>
          <p>
            Miloo provides built-in <strong>Report User</strong> and <strong>Block User</strong> controls. If a user is reported or identified engaging in abusive or prohibited conduct, Miloo reserves the right to terminate active sessions, block IP addresses, and restrict device fingerprints without prior notice or liability.
          </p>

          <h2>5. Third-Party Advertisements</h2>
          <p>
            Miloo is currently operated entirely ad-free (third-party advertisements are not currently active). If third-party advertisements are integrated in the future on public informational pages, your interactions with advertisers will be solely between you and the respective third party. Advertisements are never placed inside private text or video chat rooms.
          </p>

          <h2>6. Disclaimer of Warranties</h2>
          <p>
            MILOO IS PROVIDED ON AN "AS IS" AND "AS AVAILABLE" BASIS WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED. TO THE MAXIMUM EXTENT PERMITTED BY LAW, MILOO DISCLAIMS ALL WARRANTIES, INCLUDING MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT. WE DO NOT GUARANTEE THAT THE SERVICE WILL BE UNINTERRUPTED, BUG-FREE, OR SECURE, NOR DO WE WARRANT THE CONDUCT, SUITABILITY, OR STATEMENTS OF ANY STRANGER YOU MAY ENCOUNTER.
          </p>

          <h2>7. Limitation of Liability</h2>
          <p>
            TO THE FULLEST EXTENT PERMISSIBLE BY APPLICABLE LAW, MILOO AND ITS OPERATORS, AFFILIATES, AND AGENTS SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES ARISING OUT OF OR IN CONNECTION WITH YOUR USE OF THE SERVICE, INCLUDING ANY INTERACTIONS, BEHAVIORS, OR CONTENT TRANSMITTED BY OTHER USERS.
          </p>

          <h2>8. Indemnification</h2>
          <p>
            You agree to defend, indemnify, and hold harmless Miloo and its operators from and against any claims, liabilities, damages, losses, and expenses (including legal fees) arising from or relating to your violation of these Terms or your conduct on the platform.
          </p>

          <h2>9. Modifications to Terms</h2>
          <p>
            Miloo reserves the right to update or modify these Terms at any time. When changes occur, the "Last Updated" date at the top of this page will be revised. Your continued use of the platform after updates indicates your acceptance of the revised Terms.
          </p>

          <h2>10. Grievance Officer (India — IT Rules, 2021)</h2>
          <p>
            In compliance with Rule 3(2) of the Information Technology (Intermediary Guidelines and Digital Media Ethics Code) Rules, 2021, users in India may direct complaints, grievances, or legal concerns regarding content, safety, or access violations to our designated Grievance Officer:
          </p>
          <ul>
            <li><strong>Officer Name:</strong> {GRIEVANCE_OFFICER.name}</li>
            <li><strong>Designation:</strong> {GRIEVANCE_OFFICER.designation}</li>
            <li><strong>Grievance Email:</strong> <a href={`mailto:${GRIEVANCE_OFFICER.email}`} style={{ color: 'var(--accent)', textDecoration: 'underline' }}>{GRIEVANCE_OFFICER.email}</a></li>
            <li><strong>Postal Address:</strong> {GRIEVANCE_OFFICER.address}</li>
            <li><strong>Statutory Timelines:</strong> Acknowledgment within {GRIEVANCE_OFFICER.acknowledgementTime}; resolution within {GRIEVANCE_OFFICER.resolutionTime} of receipt.</li>
          </ul>

          <h2>11. Contact Information</h2>
          <p>
            If you have questions regarding these Terms of Service, please reach out to us:
          </p>
          <p>
            <strong>Support Desk:</strong> <a href={`mailto:${SUPPORT_EMAIL}`} style={{ color: 'var(--accent)', textDecoration: 'underline' }}>{SUPPORT_EMAIL}</a><br />
            <strong>Contact Page:</strong> <Link to="/contact" style={{ color: 'var(--accent)', textDecoration: 'underline' }}>https://miloo.chat/contact</Link>
          </p>
        </article>
      </main>

      <Footer />
    </div>
  )
}
