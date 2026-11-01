import { Link } from 'react-router-dom'
import Navbar from '../../components/Navbar'
import Footer from '../../components/Footer'
import SEOHead from '../../components/SEOHead'

export default function ReportBlockAbuse({ theme, onToggleTheme }) {
  const schemaJson = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: 'How to Report and Block Abusive Users: A Guide to Platform Safety',
    description: 'Understand the difference between skipping, blocking, and reporting abusive users, and learn how moderation protects the Miloo community.',
    url: 'https://www.miloo.chat/blog/how-to-report-and-block-abusive-users',
    datePublished: '2026-10-20',
    dateModified: '2026-10-20',
    author: { '@type': 'Organization', name: 'Miloo Moderation & Trust Team' },
    publisher: { '@type': 'Organization', name: 'Miloo', url: 'https://www.miloo.chat' }
  }

  return (
    <div className="page page-enter" style={{ background: 'var(--bg-0)' }}>
      <SEOHead
        title="How to Report & Block Abusive Users — Miloo Blog"
        description="Learn how reporting and blocking work on Miloo: reporting categories, moderation review, session blacklisting, and community protection."
        canonicalUrl="https://www.miloo.chat/blog/how-to-report-and-block-abusive-users"
        schemaJson={schemaJson}
      />

      <Navbar theme={theme} onToggleTheme={onToggleTheme} />

      <main className="container" style={{ paddingTop: 'clamp(32px, 5vw, 56px)', paddingBottom: 'clamp(48px, 8vw, 80px)', maxWidth: 840 }}>
        <div style={{ marginBottom: 24 }}>
          <Link to="/blog" style={{ color: 'var(--accent)', textDecoration: 'none', fontSize: '14px', fontWeight: 500 }}>
            ← Back to Blog & Safety Guides
          </Link>
        </div>

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
            Trust, Safety & Moderation
          </div>
          <h1
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(30px, 4vw, 46px)',
              fontWeight: 500,
              lineHeight: 1.18,
              color: 'var(--text-1)',
              margin: '0 0 16px',
            }}
          >
            How to Report and Block Abusive Users: A Guide to Platform Safety
          </h1>
          <div style={{ display: 'flex', gap: 16, alignItems: 'center', color: 'var(--text-3)', fontSize: '13px' }}>
            <span>By Miloo Moderation Desk</span>
            <span>·</span>
            <span>Published Oct 20, 2026</span>
            <span>·</span>
            <span>6 min read</span>
          </div>
        </header>

        <article className="content-prose">
          <p>
            An open, anonymous chat network is only as strong as its community moderation and user safety tools. When thousands of people from around the world interact spontaneously, occasional encounters with rude, inappropriate, or malicious individuals are inevitable.
          </p>
          <p>
            On legacy chat platforms, users often felt powerless: abusive participants could simply reload their browsers and terrorize the queue without consequences. At Miloo, we have implemented an active, multi-tiered protection system. Understanding the difference between <strong>Skipping</strong>, <strong>Blocking</strong>, and <strong>Reporting</strong> empowers you to take immediate control of your experience and help keep the platform welcoming for all adults.
          </p>

          <h2>1. The Power of "Skip" vs. "Block" vs. "Report"</h2>
          <p>
            Each of the three primary moderation actions in your chat window serves a distinct purpose:
          </p>
          <ul>
            <li>
              <strong>Skip:</strong> Designed for neutral conversational mismatch. If your match is quiet, speaks a language you do not understand, or shares different interests, hitting <strong>Skip</strong> simply ends the connection and seeks a new partner. It does not penalize either user.
            </li>
            <li>
              <strong>Block User:</strong> Designed for personal protection against annoying or boundary-pushing individuals. When you click <strong>Block</strong>, your client immediately severs the WebRTC stream and saves the partner's technical session token in your local blacklist. You are guaranteed never to match with that individual again during your visit.
            </li>
            <li>
              <strong>Report User:</strong> Designed for actual rule violations (such as nudity, harassment, threats, or scams). Submitting a report dispatches diagnostic telemetry directly to our moderation desk for administrative sanctions, including temporary suspensions and permanent hardware/IP bans.
            </li>
          </ul>

          <h2>2. How the Reporting Process Works</h2>
          <p>
            When you tap <strong>Report User</strong> in a chat room, a structured dialog appears asking you to specify the violation category. Providing accurate categories allows our automated filters and moderation team to prioritize urgent safety issues:
          </p>
          <ul>
            <li><strong>Harassment / Bullying:</strong> For targeted insults, slurs, doxxing threats, or repeated aggressive behavior.</li>
            <li><strong>Nudity / Sexual Misconduct:</strong> For exposing private body parts, masturbation, or displaying sexually explicit videos.</li>
            <li><strong>Spam / Advertising:</strong> For bots posting repetitive text, automated copy-pastes, or commercial links.</li>
            <li><strong>Threats / Violence:</strong> For threats of bodily harm, extortion, or encouraging violence.</li>
            <li><strong>Scam / Fraud:</strong> For phishing links, cryptocurrency schemes, or emergency financial appeals.</li>
          </ul>

          <h2>3. What Happens Behind the Scenes?</h2>
          <p>
            Miloo respects user privacy: we do not maintain recordings of private peer-to-peer video streams. How, then, do our moderators investigate reports?
          </p>
          <p>
            When a report is generated, our signaling server logs an encrypted incident record containing:
          </p>
          <ul>
            <li>The reported user’s ephemeral session ID and masked IP subnet.</li>
            <li>The timestamp and violation category selected by the reporter.</li>
            <li>Recent text signaling events or system logs associated with the session.</li>
          </ul>
          <p>
            Our moderation system aggregates report velocity. If a session accumulates multiple reports from different independent users in a short window, automated safeguards immediately terminate the user's connection and restrict their ability to re-enter the queue.
          </p>

          <h2>4. Severe Violations and Legal Escalations</h2>
          <p>
            Certain violations go far beyond platform rule breaks—they are serious criminal offenses under national and international law:
          </p>
          <ul>
            <li><strong>Child Sexual Abuse Material (CSAM):</strong> Miloo enforces strict zero tolerance for any exploitation or involvement of minors. We actively cooperate with the National Center for Missing & Exploited Children (NCMEC) and relevant law enforcement cyber bureaus.</li>
            <li><strong>Sextortion and Cyber-Blackmail:</strong> Any individual attempting to demand money or compromise victims is permanently banned, and digital connection fingerprints are preserved for criminal investigation.</li>
          </ul>

          <h2>5. Best Practices When Encountering Abusive Users</h2>
          <ol>
            <li><strong>Do Not Retaliate:</strong> Do not yell, trade insults, or try to teach an abusive stranger a lesson. Trolls seek emotional reactions.</li>
            <li><strong>Do Not Click Links:</strong> Never open an external link or download any file sent by an aggressive user.</li>
            <li><strong>Report and Block Immediately:</strong> Take three seconds to submit a report and click block, then move on with your day.</li>
          </ol>
        </article>

        <div className="content-card" style={{ marginTop: 48, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <span style={{ fontSize: '12px', color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Next Article</span>
            <h4 style={{ margin: '4px 0 0', fontFamily: 'var(--font-display)', fontSize: '18px', color: 'var(--text-1)' }}>
              10 Tips for Starting a Great Conversation with a Random Stranger
            </h4>
          </div>
          <Link
            to="/blog/tips-for-starting-good-conversation-with-stranger"
            style={{
              padding: '8px 18px',
              borderRadius: 'var(--radius-pill)',
              background: 'var(--surface-2)',
              border: '1px solid var(--border-2)',
              color: 'var(--accent)',
              textDecoration: 'none',
              fontWeight: 600,
              fontSize: '14px',
            }}
          >
            Read Next →
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  )
}
