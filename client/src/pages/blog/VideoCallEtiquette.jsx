import { Link } from 'react-router-dom'
import ArticleLayout from '../../components/ArticleLayout'

export default function VideoCallEtiquette({ theme, onToggleTheme }) {
  const tableOfContents = [
    { id: 'setup', label: 'Frame and Light Yourself Simply' },
    { id: 'sound', label: 'Get Your Sound Right' },
    { id: 'eye-contact', label: 'Eye Contact and Expression' },
    { id: 'listening', label: 'Listening and Turn-Taking' },
    { id: 'first-minute', label: 'The First Minute' },
    { id: 'boundaries', label: 'Respect and Consent' },
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
      dateModified="2026-11-27"
      readTime="3 min read"
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

      <p>
        A quick test takes less than a minute: open your camera app and look at the preview. Can you see your whole face? Is a bright window turning you into a silhouette? Is anything readable behind you, such as a certificate, parcel label or work badge? Fix these before you join. On a phone, lean it against something steady at about face height so the picture does not shake.
      </p>

      <h2 id="sound">Get Your Sound Right</h2>
      <p>
        People forgive a soft picture more easily than sound they cannot follow. Pick a quiet spot, turn off the television or music, and use headphones if you can. Headphones reduce the echo that happens when your microphone picks up your speaker. Speak at a normal pace and keep the microphone uncovered.
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

      <p>
        Silence is not always a problem. The other person may be translating in their head or waiting for the connection to catch up. Give it a few seconds, then try a simple question about something neutral. If the picture freezes, say that you lost them for a moment and repeat your last point instead of talking over the gap.
      </p>

      <h2 id="first-minute">The First Minute</h2>
      <p>
        Start with a greeting and one light question, such as “How is your day going?” or “What have you been listening to lately?” Avoid opening with questions about exact location, age, relationship status or appearance. They can feel like an interrogation, and some of them ask for details a stranger has good reason to keep private.
      </p>

      <h2 id="boundaries">Respect and Consent</h2>
      <p>
        Do not record or screenshot someone without their clear agreement. Keep your clothing and behaviour appropriate: nudity and sexual conduct are reportable on Miloo. Do not pressure anyone to move closer, show their room, remove headphones or switch to another app. “No” is a complete answer.
      </p>
      <p>
        Assume that the person you are talking to could be recording you, even though they should not, and avoid saying or showing anything you would not want repeated. If someone else is in your room, make sure they know the camera is on.
      </p>

      <h2 id="leaving">Leaving Politely, or Not</h2>
      <p>
        You can end a conversation at any time. A short line such as thanks for chatting, I am going to move on works well. If someone is rude or makes you uncomfortable, you do not owe an explanation: use Skip, and Report or Block if needed.
      </p>

      <p>
        If you want to report someone, do it while you are still in the chat, before pressing Next. Block also moves you on and asks Miloo not to match your browser with that person again. Our <Link to="/blog/how-to-report-and-block-abusive-users">guide to reporting and blocking</Link> explains the difference.
      </p>

      <h2>Conclusion</h2>
      <p>
        Small, thoughtful habits make online conversation safer and more enjoyable. For more guidance, visit our <Link to="/safety">Safety Center</Link> or browse the <Link to="/blog">Miloo blog</Link>.
      </p>
    </ArticleLayout>
  )
}
