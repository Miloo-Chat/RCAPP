import { Link } from 'react-router-dom'
import ArticleLayout from '../../components/ArticleLayout'

export default function ReportBlockAbuse({ theme, onToggleTheme }) {
  const tableOfContents = [
    { id: 'why-reporting-matters', label: 'Why Reporting Matters in Anonymous P2P Chat' },
    { id: 'instant-blocking', label: 'How Instant User Blocking Works' },
    { id: 'reporting-categories', label: 'Safety Categories: What to Report' },
    { id: 'moderation-process', label: 'Behind the Scenes: How Moderation Works' },
    { id: 'escalating-penalties', label: 'Escalating Penalties' },
  ]

  const relatedArticles = [
    {
      url: '/blog/stay-safe-talking-to-strangers-online',
      title: 'How to Stay Safe Talking to Strangers Online: The Complete Modern Guide',
      blurb: 'Information firewalls, off-platform migration warnings, and setting boundaries.',
      readTime: '7 min read',
    },
    {
      url: '/blog/what-to-do-if-someone-harasses-you-online',
      title: 'What to Do If Someone Harasses You Online: Action Steps',
      blurb: 'Crucial steps for documenting harassment, reporting offenders, and getting support.',
      readTime: '6 min read',
    },
    {
      url: '/blog/how-to-spot-scams-on-chat-sites',
      title: 'How to Spot Scams and Fake Profiles on Random Chat Sites',
      blurb: 'Learn how to detect virtual webcam loops, phishing tricks, and extortion bots.',
      readTime: '6 min read',
    },
  ]

  return (
    <ArticleLayout
      title="How to Report and Block Abusive Users on Miloo"
      description="Learn how reporting and blocking work on Miloo: reporting categories, moderation review, session blacklisting, and community protection."
      url="https://miloo.chat/blog/how-to-report-and-block-abusive-users"
      category="Community Safety & Moderation"
      datePublished="2026-09-18"
      dateModified="2026-11-03"
      readTime="6 min read"
      tableOfContents={tableOfContents}
      relatedArticles={relatedArticles}
      ogSlug="blog-how-to-report-and-block-abusive-users"
      theme={theme}
      onToggleTheme={onToggleTheme}
    >
      <p>
        An open, anonymous chat network succeeds only when its community members feel protected, respected, and empowered. On Miloo, every chat is with a real person, and while the vast majority of visitors connect to share genuine conversations, laugh, or practice foreign languages, occasional bad actors attempt to disrupt the experience with inappropriate content, harassment, or scams.
      </p>
      <p>
        We designed Miloo’s safety infrastructure to ensure you have instantaneous control over who you interact with. You never have to tolerate offensive behavior. Here is how our reporting and blocking architecture functions, how our moderation desk processes violation notices, and how you can help keep Miloo safe for everyone. Explore our dedicated <Link to="/safety">Safety Center</Link> and read our <Link to="/community-guidelines">Community Guidelines</Link> for full policy details.
      </p>

      <h2 id="why-reporting-matters">1. Why Reporting Matters in Anonymous P2P Chat</h2>
      <p>
        Because Miloo operates without persistent profiles, user accounts, or message databases to preserve absolute privacy, real-time reporting is our most vital community defense.
      </p>
      <p>
        When you submit a report, you do more than detach yourself from an unpleasant interaction—you send a record of the problem to our moderation queue. A human moderator reviews it, and if the report is confirmed the person can be restricted from connecting again.
      </p>

      <h2 id="instant-blocking">2. How Instant User Blocking Works</h2>
      <p>
        During any active text or video conversation, clicking <strong>Block User</strong> performs two immediate actions:
      </p>
      <ol>
        <li><strong>Connection Severance:</strong> The active WebRTC peer connection is immediately torn down on your browser, instantly detaching audio, video, and text data streams.</li>
        <li><strong>No Re-matching:</strong> Your browser asks our server not to match you with that person’s browser again. Block lists are kept in server memory, so they reset when our service restarts, and they depend on each browser’s random client ID. Treat Block as a strong convenience, and use Report for anything serious.</li>
      </ol>
      <p>
        Blocking is completely invisible to the other party; to them, it simply appears as if a partner pressed Skip. Check our <Link to="/faq">FAQ</Link> for common questions on blocking and skipping.
      </p>

      <h2 id="reporting-categories">3. Safety Categories: What to Report</h2>
      <p>
        When clicking <strong>Report User</strong>, you can select from six standardized violation categories:
      </p>
      <ul>
        <li><strong>Nudity or Sexual Misconduct:</strong> Genital exposure, masturbation, sexual acts, or unsolicited explicit content. Miloo enforces zero tolerance for non-consensual nudity.</li>
        <li><strong>Harassment or Bullying:</strong> Targeted insults, offensive slurs, hate speech, body shaming, or aggressive verbal abuse. See our guide on <Link to="/blog/what-to-do-if-someone-harasses-you-online">handling online harassment</Link>.</li>
        <li><strong>Spam, Ads, or Bot Behavior:</strong> Repetitive commercial advertising, automated message scripts, or unsolicited third-party links.</li>
        <li><strong>Threats or Violence:</strong> Threats of physical harm, extortion, swatting, or non-consensual doxxing.</li>
        <li><strong>Scam or Fraud:</strong> Solicitations for cryptocurrency transfers, fake investment schemes, or phishing portals. See our guide on <Link to="/blog/how-to-spot-scams-on-chat-sites">spotting scams on chat sites</Link>.</li>
        <li><strong>Other Violations:</strong> Any other conduct breaching our Community Guidelines or legal terms.</li>
      </ul>

      <h2 id="moderation-process">4. Behind the Scenes: How Moderation Works</h2>
      <p>
        When you file a report, our backend creates a moderation ticket containing:
      </p>
      <ul>
        <li>The reported person’s connection identifier, hashed IP (truncated SHA-256) and random browser client ID.</li>
        <li>Your selected violation category and any optional context you provided.</li>
        <li>A timestamp and, if you were chatting by text, up to the last 20 messages of that conversation. Reports are deleted after 30 days.</li>
      </ul>
      <p>
        Reports are reviewed by a human moderator in our internal moderation dashboard. Separately, text messages are screened automatically before delivery, and repeated violations there lead to an automatic restriction. Read our <Link to="/transparency">Transparency Center</Link> to learn more about our data retention and moderation audits.
      </p>

      <h2 id="escalating-penalties">5. Escalating Penalties</h2>
      <p>
        Miloo uses an escalating penalty schedule designed to deter repeat offenses. Restrictions are tied to a hashed IP and a random browser client ID, not to your identity:
      </p>
      <ul>
        <li><strong>First Strike (10-Minute Suspension):</strong> The offending client is placed into a 10-minute cooling-off suspension.</li>
        <li><strong>Second Strike (24-Hour Ban):</strong> A 24-hour restriction is applied to both the hashed IP and the browser client ID.</li>
        <li><strong>Repeated or Severe Violations (7-Day to Permanent Ban):</strong> Third offences lead to a 7-day ban, and further offences to a permanent ban. Banned clients are rejected when they try to connect. Strike history is kept for up to 30 days after a ban ends. Shared networks can occasionally cause mistakes, so you can appeal from our Contact page.</li>
      </ul>
      <p>
        By utilizing these tools responsibly, you actively protect the spontaneity, dignity, and warmth of our shared conversational space.
      </p>
    </ArticleLayout>
  )
}
