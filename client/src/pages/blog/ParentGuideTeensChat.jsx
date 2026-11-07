import { Link } from 'react-router-dom'
import ArticleLayout from '../../components/ArticleLayout'

export default function ParentGuideTeensChat({ theme, onToggleTheme }) {
  const tableOfContents = [
    { id: 'how-it-works', label: 'How Anonymous Chat Works' },
    { id: 'age-limits', label: 'Why Age Limits Matter' },
    { id: 'talking', label: 'Talking With Your Teen' },
    { id: 'warning-signs', label: 'Warning Signs to Notice' },
  ]

  const relatedArticles = [
    {
      url: '/blog/stay-safe-talking-to-strangers-online',
      title: 'How to Stay Safe Talking to Strangers Online',
      blurb: 'Practical habits that keep you in control of every conversation.',
      readTime: '7 min read',
    },
    {
      url: '/blog/how-miloo-moderation-works',
      title: 'How Moderation Works on Miloo',
      blurb: 'The safety layers that run alongside every chat.',
      readTime: '6 min read',
    },
    {
      url: '/blog/protecting-privacy-in-video-chat',
      title: 'Protecting Your Privacy in Video Chat',
      blurb: 'A practical checklist for your webcam space and network.',
      readTime: '5 min read',
    },
  ]

  return (
    <ArticleLayout
      title="A Parent Guide to Teens and Online Chat Platforms"
      description="Practical advice for parents on how anonymous chat platforms work, why age limits matter, and how to talk with teenagers about online conversations."
      url="https://miloo.chat/blog/parent-guide-to-teens-and-online-chat"
      category="Family & Safety"
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
        Many parents first hear about anonymous chat platforms from a teenager, a news story or a friend. This guide explains how these services work and how to have a calm, useful conversation at home. Miloo is intended for adults aged 18 and over, and we support parents who want to understand the wider landscape.
      </p>

      <h2 id="how-it-works">How Anonymous Chat Works</h2>
      <p>
        Anonymous chat services pair two people at random for a text or video conversation, usually without accounts. Because there is no profile or history, the platform cannot rely on reputation, and safety has to come from design: verification, limits and reporting tools.
      </p>
      <p>
        Services differ widely in how seriously they take this. Some have clear age rules and moderation, and some have neither. Looking at a service's published rules is the first useful step.
      </p>

      <h2 id="age-limits">Why Age Limits Matter</h2>
      <p>
        Age limits exist because open conversations with unknown adults carry risks that young people are not always ready to judge: pressure to share images, requests to move to private apps, and attempts to gain trust quickly.
      </p>
      <p>
        If a platform states that it is for adults only, that rule should be respected. Parents can use device-level controls, router filters and app-store restrictions to support it.
      </p>

      <h2 id="talking">Talking With Your Teen</h2>
      <p>
        Open conversations work better than bans alone. Ask what they have heard about these sites instead of starting with accusations, and explain your concerns in terms of specific behaviours such as pressure, secrecy and requests for photos.
      </p>
      <p>
        Make it clear that they can tell you if something goes wrong without losing their device or being blamed. Teens who fear punishment are less likely to ask for help.
      </p>

      <h2 id="warning-signs">Warning Signs to Notice</h2>
      <p>
        Common signs include secrecy about devices, sudden mood changes after being online, new contacts they will not discuss, and gifts or money from people you do not know.
      </p>
      <ul>
        <li>Keep records of anything worrying instead of deleting it.</li>
        <li>Report abusive accounts to the platform and, where appropriate, to local authorities.</li>
        <li>Seek support from a school counsellor or a qualified professional if your teen is distressed.</li>
      </ul>

      <h2>Conclusion</h2>
      <p>
        Small, thoughtful habits make online conversation safer and more enjoyable. For more guidance, visit our <Link to="/safety">Safety Center</Link> or browse the <Link to="/blog">Miloo blog</Link>.
      </p>
    </ArticleLayout>
  )
}
