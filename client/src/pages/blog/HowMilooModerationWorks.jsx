import { Link } from 'react-router-dom'
import ArticleLayout from '../../components/ArticleLayout'

export default function HowMilooModerationWorks({ theme, onToggleTheme }) {
  const tableOfContents = [
    { id: 'layers', label: 'Safety in Layers' },
    { id: 'verification', label: 'Verification Before You Chat' },
    { id: 'rate-limits', label: 'Limits That Slow Down Abuse' },
    { id: 'detection', label: 'Automated Detection During Video' },
    { id: 'reports', label: 'Reports and Blocks' },
    { id: 'bans', label: 'Enforcement and Bans' },
    { id: 'your-role', label: 'What You Can Do' },
  ]

  const relatedArticles = [
    {
      url: '/blog/how-to-report-and-block-abusive-users',
      title: 'How to Report and Block Abusive Users',
      blurb: 'Why immediate reporting matters and what happens afterwards.',
      readTime: '5 min read',
    },
    {
      url: '/blog/how-webrtc-video-chat-works',
      title: 'How WebRTC Works: Peer-to-Peer Video Chat Explained',
      blurb: 'The technology that connects two browsers directly.',
      readTime: '6 min read',
    },
    {
      url: '/blog/what-to-do-if-someone-harasses-you-online',
      title: 'What to Do If Someone Harasses You Online',
      blurb: 'An action plan for evidence, reporting and support.',
      readTime: '6 min read',
    },
  ]

  return (
    <ArticleLayout
      title="How Moderation Works on Miloo: Reports, Blocks and Automated Detection"
      description="A transparent look at the safety layers on Miloo: verification, rate limits, automated detection during video chat, user reports and blocks, and how enforcement works."
      url="https://miloo.chat/blog/how-miloo-moderation-works"
      category="Platform Trust"
      datePublished="2026-11-07"
      dateModified="2026-11-07"
      readTime="6 min read"
      tableOfContents={tableOfContents}
      relatedArticles={relatedArticles}
      ogSlug="blog-stay-safe-talking-to-strangers-online"
      theme={theme}
      onToggleTheme={onToggleTheme}
    >
      <p>
        Anonymous chat only works when people feel safe using it. Because there are no accounts or public profiles, a platform cannot rely on reputation the way a social network does, so safety has to be built into the way the service itself behaves. This article explains the layers Miloo uses and what each one is designed to do.
      </p>
      <p>
        No moderation system is perfect, and we would rather say so plainly. The goal is to make misuse harder, make good behavior easier, and give you effective tools when something goes wrong.
      </p>

      <h2 id="layers">Safety in Layers</h2>
      <p>
        Instead of one filter that tries to catch everything, Miloo combines several smaller protections. Some act before a chat starts, some act during it, and some act afterwards. If one layer misses something, another has a chance to catch it.
      </p>

      <h2 id="verification">Verification Before You Chat</h2>
      <p>
        Before matching, the service can ask a visitor to complete a short human-verification check. This helps separate real people from automated scripts that try to flood a chat service with spam. It adds a few seconds of friction for everyone, in exchange for making large-scale automated abuse more expensive. Chat is also intended for adults, and the entry flow reflects that.
      </p>

      <h2 id="rate-limits">Limits That Slow Down Abuse</h2>
      <p>
        Abusive behavior is often repetitive: connecting again and again, or skipping through people at high speed to find targets. Miloo limits how many connection attempts can come from a single network in a short window. Ordinary use is not affected, but bursts of rapid, scripted connections are slowed down or refused.
      </p>

      <h2 id="detection">Automated Detection During Video</h2>
      <p>
        In video chat, automated detection runs in the browser to help identify clearly inappropriate imagery on a video feed. Because the check runs on the device rather than sending your video to a third-party service, it fits the same privacy-first approach as the rest of the platform. Automated tools can make mistakes in both directions, which is why they are paired with human-driven reporting instead of being the only line of defense.
      </p>

      <h2 id="reports">Reports and Blocks</h2>
      <p>
        Every chat includes a Report button and a Block button, and they do different jobs. Block ends your contact with that person right away. Report sends a record of the problem to the moderation team so that it can be reviewed, and repeated problems can be acted on.
      </p>
      <ul>
        <li><strong>Be specific.</strong> Choose the reason that best matches what happened, such as harassment, nudity or scams.</li>
        <li><strong>Report first, then skip.</strong> Reports are most useful when they are made while the conversation is still fresh.</li>
        <li><strong>You do not need to explain yourself.</strong> You never owe a stranger a debate about why you reported them.</li>
      </ul>
      <p>
        Our guide on <Link to="/blog/how-to-report-and-block-abusive-users">reporting and blocking</Link> walks through the buttons step by step.
      </p>

      <h2 id="bans">Enforcement and Bans</h2>
      <p>
        When a report is confirmed, moderators can restrict the offending client from connecting again. Enforcement is designed to apply to the connection that caused the problem, so that someone cannot immediately return and repeat the same behavior. Banned clients are shown a clear message when they try to connect. The rules that apply are described in our <Link to="/community-guidelines">Community Guidelines</Link>, and our <Link to="/transparency">Transparency</Link> page explains more about how we handle this.
      </p>

      <h2 id="your-role">What You Can Do</h2>
      <p>
        The strongest safety layer is still you. Keep personal information private, trust your instincts, and leave the moment a conversation feels wrong. If you want a fuller checklist, read <Link to="/blog/stay-safe-talking-to-strangers-online">how to stay safe talking to strangers online</Link> and visit our <Link to="/safety">Safety Center</Link>.
      </p>

      <h2>Conclusion</h2>
      <p>
        Moderation on Miloo is a combination of verification, limits, automated detection, user reports and enforcement, each covering a different gap. Together they cannot promise a perfect experience, but they make it harder to misuse the platform and easier to protect yourself when something goes wrong.
      </p>
    </ArticleLayout>
  )
}
