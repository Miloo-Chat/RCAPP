import { Link } from 'react-router-dom'
import Navbar from '../../components/Navbar'
import Footer from '../../components/Footer'
import SEOHead from '../../components/SEOHead'

export default function OnlineHarassment({ theme, onToggleTheme }) {
  const schemaJson = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: 'What to Do If Someone Harasses You Online: Action Plan & Resources',
    description: 'A practical, step-by-step action plan to handle online harassment, threats, and cyberstalking, including evidence preservation and legal reporting.',
    url: 'https://www.miloo.chat/blog/what-to-do-if-someone-harasses-you-online',
    datePublished: '2026-10-10',
    dateModified: '2026-10-10',
    author: { '@type': 'Organization', name: 'Miloo Safety & Legal Desk' },
    publisher: { '@type': 'Organization', name: 'Miloo', url: 'https://www.miloo.chat' }
  }

  return (
    <div className="page page-enter" style={{ background: 'var(--bg-0)' }}>
      <SEOHead
        title="What to Do If Someone Harasses You Online — Miloo Blog"
        description="Action plan for handling cyber harassment, threats, or extortion. Learn evidence preservation, platform reporting, and international legal support hotlines."
        canonicalUrl="https://www.miloo.chat/blog/what-to-do-if-someone-harasses-you-online"
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
            Cyber Safety & Support Action Plan
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
            What to Do If Someone Harasses You Online: Action Plan & Resources
          </h1>
          <div style={{ display: 'flex', gap: 16, alignItems: 'center', color: 'var(--text-3)', fontSize: '13px' }}>
            <span>By Miloo Safety & Legal Desk</span>
            <span>·</span>
            <span>Published Oct 10, 2026</span>
            <span>·</span>
            <span>7 min read</span>
          </div>
        </header>

        <article className="content-prose">
          <p>
            Encountering digital harassment, aggressive threats, or extortion can be a disorienting and stressful experience. In the heat of the moment, it is natural to feel anxious, angry, or tempted to argue back. However, engaging with a malicious actor almost always escalates the situation and plays into their psychological objectives.
          </p>
          <p>
            Whether an incident occurred on Miloo or across the wider internet, having a clear, structured action plan ensures you protect your emotional well-being, preserve legal evidence, and neutralize the threat swiftly. Here is our step-by-step guidance.
          </p>

          <h2>Step 1: Do Not Retaliate or Negotiate</h2>
          <p>
            Harassers and online trolls thrive on reaction. Their currency is your emotional distress, anger, or panic. When you insult them back or attempt to appeal to their empathy, you provide the validation they seek:
          </p>
          <ul>
            <li><strong>Cease communication immediately:</strong> Do not reply with <em>"Why are you doing this?"</em> or <em>"Leave me alone."</em> Simply stop typing or speaking.</li>
            <li><strong>Do not negotiate with extortionists:</strong> If someone claims they will post screenshots or send images to contacts unless you pay money, paying will NOT make them stop. It only marks you as a willing target for repeated demands.</li>
          </ul>

          <h2>Step 2: Preserve the Digital Evidence</h2>
          <p>
            Before you close your tab or clear your browser history, take ten seconds to preserve objective evidence of what occurred. This is critical if the incident involves stalking, physical threats, or extortion:
          </p>
          <ul>
            <li><strong>Take Uncropped Full-Screen Screenshots:</strong> Capture the entire browser window, ensuring the device clock, date, URL, and full chat dialogue are visible.</li>
            <li><strong>Record Relevant User Identifiers:</strong> Note any handles, links, or technical details the harasser posted in the chat box.</li>
            <li><strong>Do Not Edit or Crop the Images:</strong> Law enforcement and platform security teams need unaltered images with valid file metadata for chain-of-custody verification.</li>
          </ul>

          <h2>Step 3: Block and Report on the Platform</h2>
          <p>
            Once you have documented the interaction, deploy platform moderation tools:
          </p>
          <ul>
            <li><strong>Report User:</strong> On Miloo, click <strong>Report User</strong> and select the appropriate category (Harassment, Threats, or Scams). This sends an alert to our moderation queue and logs connection details.</li>
            <li><strong>Block User:</strong> Hit <strong>Block User</strong> to instantly disconnect and blacklist the session, ensuring your browser will not be matched with them again.</li>
          </ul>

          <h2>Step 4: Audit and Lock Down Your Digital Footprint</h2>
          <p>
            If a harasser threatened to "find you" or claimed to know who you are, perform an immediate privacy audit across your external accounts:
          </p>
          <ul>
            <li><strong>Set Social Profiles to Private:</strong> Temporarily lock down your Instagram, Facebook, TikTok, and LinkedIn accounts so only confirmed friends can see your posts and contact lists.</li>
            <li><strong>Revoke Location Sharing:</strong> Disable location tracking on social apps and messaging platforms.</li>
            <li><strong>Review Passwords and 2FA:</strong> Ensure all your email and personal accounts use strong, unique passwords and two-factor authentication (2FA) via authenticator apps.</li>
          </ul>

          <h2>Step 5: File a Formal Cybercrime Report</h2>
          <p>
            If the harassment involves credible threats of physical violence, cyber-extortion, or non-consensual intimate imagery, contact law enforcement authorities. Specialized national cybercrime reporting portals include:
          </p>
          <ul>
            <li><strong>United States:</strong> The FBI Internet Crime Complaint Center (IC3) at <a href="https://www.ic3.gov" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent)' }}>www.ic3.gov</a>.</li>
            <li><strong>India:</strong> The National Cyber Crime Reporting Portal at <a href="https://cybercrime.gov.in" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent)' }}>cybercrime.gov.in</a> or dial the national helpline at 1930.</li>
            <li><strong>United Kingdom:</strong> Action Fraud at <a href="https://www.actionfraud.police.uk" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent)' }}>actionfraud.police.uk</a> or your local police non-emergency line (101).</li>
            <li><strong>Canada:</strong> The Canadian Anti-Fraud Centre (CAFC) and your local municipal police service.</li>
            <li><strong>International Directory:</strong> Find reporting avenues and hotlines in your country via <a href="https://findahelpline.com" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent)' }}>findahelpline.com</a>.</li>
          </ul>

          <h2>Step 6: Prioritize Your Mental and Emotional Health</h2>
          <p>
            Experiencing hostility from a stranger can leave lingering feelings of anxiety or hypervigilance. Remind yourself that a stranger’s abusive behavior reflects their character, not your worth.
          </p>
          <p>
            Take a break from screens. Talk through what happened with a trusted friend, family member, or mental health professional. If you need confidential emotional support right now, free crisis counselors are available 24/7 by texting <strong>HOME</strong> to <strong>741741</strong> (US/UK/Canada).
          </p>
        </article>

        <div className="content-card" style={{ marginTop: 48, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <span style={{ fontSize: '12px', color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Explore More</span>
            <h4 style={{ margin: '4px 0 0', fontFamily: 'var(--font-display)', fontSize: '18px', color: 'var(--text-1)' }}>
              Explore the Miloo Safety Center
            </h4>
          </div>
          <Link
            to="/safety"
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
            Visit Safety Center →
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  )
}
