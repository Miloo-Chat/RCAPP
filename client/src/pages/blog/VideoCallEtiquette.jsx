import { Link } from 'react-router-dom'
import ArticleLayout from '../../components/ArticleLayout'

export default function VideoCallEtiquette({ theme, onToggleTheme }) {
  const tableOfContents = [
    { id: 'setup', label: 'Frame and Light Yourself Simply' },
    { id: 'eye-contact', label: 'Eye Contact and Expression' },
    { id: 'listening', label: 'Listening and Turn-Taking' },
    { id: 'leaving', label: 'Leaving Politely, or Not' },
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
      title="Video Call Etiquette and Body Language Basics"
      description="Simple, friendly habits for video conversations with new people: framing, lighting, eye contact, listening and how to leave a call politely."
      url="https://miloo.chat/blog/video-call-etiquette-and-body-language"
      category="Conversations"
      datePublished="2026-11-07"
      dateModified="2026-11-07"
      readTime="5 min read"
      tableOfContents={tableOfContents}
      relatedArticles={relatedArticles}
      ogSlug="blog-stay-safe-talking-to-strangers-online"
      theme={theme}
      onToggleTheme={onToggleTheme}
    >
      <p>
        A good video conversation does not need a perfect setup. A few small habits make you easier to talk to and make the other person feel comfortable, which tends to make the whole chat better.
      </p>

      <h2 id="setup">Frame and Light Yourself Simply</h2>
      <p>
        Place the camera at eye level and sit facing a light source such as a window or lamp, not with it behind you. A tidy, neutral background keeps attention on the conversation and avoids sharing details you did not intend to.
      </p>
      <p>
        Check what is visible behind you before you start. Our <Link to="/blog/protecting-privacy-in-video-chat">privacy checklist</Link> covers this in more detail.
      </p>

      <h2 id="eye-contact">Eye Contact and Expression</h2>
      <p>
        Looking at the camera lens instead of the screen feels like eye contact to the other person. You do not need to do it constantly; glancing at the lens while you speak is enough.
      </p>
      <p>
        A relaxed face and an occasional nod show that you are listening. Smiling is optional, but being visibly attentive helps.
      </p>

      <h2 id="listening">Listening and Turn-Taking</h2>
      <p>
        Video calls have a small delay, so people often interrupt by accident. Leave a short pause before answering, and if you overlap, simply let the other person continue.
      </p>
      <p>
        Ask open questions and respond to what you hear. Our <Link to="/blog/tips-for-starting-good-conversation-with-stranger">conversation starter tips</Link> give you ideas.
      </p>

      <h2 id="leaving">Leaving Politely, or Not</h2>
      <p>
        You can end a conversation at any time. A short line such as thanks for chatting, I am going to move on works well. If someone is rude or makes you uncomfortable, you do not owe an explanation: use Skip, and Report or Block if needed.
      </p>

      <h2>Conclusion</h2>
      <p>
        Small, thoughtful habits make online conversation safer and more enjoyable. For more guidance, visit our <Link to="/safety">Safety Center</Link> or browse the <Link to="/blog">Miloo blog</Link>.
      </p>
    </ArticleLayout>
  )
}
