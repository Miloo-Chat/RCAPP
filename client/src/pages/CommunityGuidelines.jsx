import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import SEOHead from '../components/SEOHead'
import WatercolorMiniBanner from '../components/watercolor/WatercolorMiniBanner'

export default function CommunityGuidelines({ theme, onToggleTheme }) {
  return (
    <div className="page page-enter" style={{ background: 'var(--bg-0)' }}>
      <SEOHead
        title="Community Guidelines — Miloo"
        description="Our expectations for safe, civil, and enjoyable conversations on Miloo. Review our zero-tolerance policies against harassment, nudity, scams, and abuse."
        canonicalUrl="https://miloo.chat/community-guidelines"
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
            Code of Conduct & Safety Standards
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
            Community Guidelines
          </h1>
          <p
            style={{
              fontSize: 'clamp(16px, 1.8vw, 20px)',
              color: 'var(--text-2)',
              lineHeight: 1.6,
              margin: 0,
            }}
          >
            Miloo thrives when every participant brings basic respect, courtesy, and goodwill to conversations. These guidelines define what is celebrated and what is strictly forbidden.
          </p>
        </header>

        <article className="content-prose">
          <h2>1. Mutual Respect & Consent</h2>
          <p>
            You are talking with another real human being who is spending their personal time to connect. Always interact with kindness and respect boundaries:
          </p>
          <ul>
            <li><strong>Respect conversational consent:</strong> If your chat partner does not wish to discuss a particular personal topic, change the subject gracefully.</li>
            <li><strong>Embrace diversity:</strong> Miloo connects people from diverse nationalities, languages, and cultures. Treat individuals with dignity regardless of race, gender, sexual orientation, disability, or religious belief.</li>
            <li><strong>Accept the skip:</strong> If someone skips you, do not take it personally. Random chatting involves quick sorting to find someone with shared energy.</li>
          </ul>

          <h2>2. Zero-Tolerance Violations (Immediate Permanent Bans)</h2>
          <p>
            Engaging in any of the following conduct will result in immediate termination of your active session, permanent ban from Miloo, and referral to criminal authorities where appropriate:
          </p>
          <ul>
            <li><strong>Underage Participation & Child Exploitation:</strong> Miloo is strictly 18+. Any presence, depiction, or solicitation of minors is illegal, strictly forbidden, and reported immediately to law enforcement.</li>
            <li><strong>Non-Consensual Sexual Exposure & Nudity:</strong> You must remain properly dressed. Flashing genitalia, masturbating, or displaying sexually explicit videos on camera is strictly prohibited.</li>
            <li><strong>Harassment, Stalking & Bullying:</strong> Persistent insults, threats of violence, blackmail, doxxing (releasing private real-world information), or encouraging suicide or self-harm will trigger permanent restrictions.</li>
            <li><strong>Extortion & Blackmail (Sextortion):</strong> Threatening to expose a partner or demanding money under any circumstances is a serious crime that we report directly to cybercrime task forces.</li>
            <li><strong>Hate Speech:</strong> Promoting violence or dehumanizing individuals based on race, ethnicity, religion, disability, age, or sexual orientation is prohibited.</li>
            <li><strong>Scams & Fraud:</strong> Soliciting money, promoting Ponzi schemes, distributing malicious links, or attempting identity theft will result in immediate removal.</li>
          </ul>

          <h2>3. Video Etiquette</h2>
          <p>
            When utilizing live video chat, help keep the environment welcoming:
          </p>
          <ul>
            <li>Face the camera directly in a well-lit space.</li>
            <li>Avoid pointing the camera at static screens, looping pre-recorded videos, ceilings, or blank walls.</li>
            <li>Keep background noise to a reasonable minimum so conversations can be heard clearly.</li>
          </ul>

          <h2>4. How to Deal with Rule Violators</h2>
          <p>
            We rely on our community to help maintain a positive platform. If you encounter someone who breaks these rules:
          </p>
          <ol>
            <li><strong>Do not retaliate:</strong> Do not engage in an argument or trade insults with an abusive user.</li>
            <li><strong>Click Report:</strong> Use the Report button in your chat room to send a report to our moderation team with the appropriate violation category.</li>
            <li><strong>Click Block:</strong> Block the user to sever the connection and prevent any future pairings with that user.</li>
          </ol>
        </article>

        {/* Links box */}
        <div className="content-card" style={{ marginTop: 48, display: 'flex', flexDirection: 'column', gap: 14 }}>
          <h3 style={{ margin: 0, fontFamily: 'var(--font-display)', fontSize: '20px', color: 'var(--text-1)' }}>
            Related Policies & Support
          </h3>
          <p style={{ margin: 0, color: 'var(--text-2)', fontSize: '14px', lineHeight: 1.6 }}>
            For more details on your legal obligations and privacy rights, consult our complete documents:
          </p>
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginTop: 4 }}>
            <Link to="/terms" style={{ color: 'var(--accent)', fontWeight: 600, fontSize: '14px' }}>
              Terms of Service →
            </Link>
            <Link to="/privacy" style={{ color: 'var(--accent)', fontWeight: 600, fontSize: '14px' }}>
              Privacy Policy →
            </Link>
            <Link to="/safety" style={{ color: 'var(--accent)', fontWeight: 600, fontSize: '14px' }}>
              Safety Center →
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
