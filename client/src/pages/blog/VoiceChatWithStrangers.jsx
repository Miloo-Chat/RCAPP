import { Link } from 'react-router-dom'
import ArticleLayout from '../../components/ArticleLayout'

export default function VoiceChatWithStrangers({ theme, onToggleTheme }) {
  const tableOfContents = [
    { id: 'short-answer', label: 'Short answer' },
    { id: 'what-is-voice-chat', label: '1. What is voice chat on Miloo?' },
    { id: 'how-safe', label: '2. How safe is voice chat with strangers?' },
    { id: 'safety-habits', label: '3. Habits that keep you safe' },
    { id: 'better-conversations', label: '4. How to have a better conversation' },
    { id: 'mic-problems', label: '5. If your microphone does not work' },
  ]

  const relatedArticles = [
    {
      url: '/blog/stay-safe-talking-to-strangers-online',
      title: 'How to Stay Safe Talking to Strangers Online: The Complete Modern Guide',
      blurb: 'Information firewalls, off-platform migration warnings, and setting boundaries.',
      readTime: '7 min read',
    },
    {
      url: '/blog/how-to-report-and-block-abusive-users',
      title: 'How to Report and Block Abusive Users on Miloo',
      blurb: 'Reviewing our report desk, immediate blocklists, and safety bans.',
      readTime: '6 min read',
    },
    {
      url: '/blog/protecting-privacy-in-video-chat',
      title: 'Protecting Your Privacy in Video Chat: The Essential Checklist',
      blurb: 'Setup, background checks, and audio privacy tips.',
      readTime: '5 min read',
    },
  ]

  return (
    <ArticleLayout
      title="Voice Chat with Strangers: Stay Safe and Talk Better | Miloo"
      description="How to use free random voice chat safely: what the other person can see, how to skip, block and report, and how to keep conversations friendly. 18+ only."
      url="https://miloo.chat/blog/voice-chat-with-strangers"
      category="Product Guide"
      datePublished="2026-11-13"
      dateModified="2026-11-13"
      readTime="5 min read"
      tableOfContents={tableOfContents}
      relatedArticles={relatedArticles}
      ogSlug="blog-voice-chat-with-strangers"
      theme={theme}
      onToggleTheme={onToggleTheme}
    >
      <h2 id="short-answer">Short answer</h2>
      <p>
        Voice chat on Miloo is audio only: no camera, and you can skip, block or report at any time. It is not risk-free. Audio is not monitored automatically, the other person hears everything you say, and their device may see basic network information such as your IP address. Share nothing personal and skip anyone who makes you uncomfortable.
      </p>

      <h2 id="what-is-voice-chat">1. What is voice chat on Miloo?</h2>
      <p>
        Voice chat connects you with another adult who also chose voice. Your browser asks for microphone access only, and no camera is used. There is no account or sign-up, and you must confirm you are 18 or older before you start.
      </p>
      <ul>
        <li><strong>Mute:</strong> turn your microphone off without ending the call.</li>
        <li><strong>Skip and End:</strong> leave the conversation at any moment.</li>
        <li><strong>Auto-connect:</strong> when switched on, Miloo looks for the next person after you skip or end.</li>
        <li><strong>Add Friend:</strong> saves a nickname in your own browser. Miloo has no accounts, so no friend list is created on a server.</li>
        <li><strong>Report:</strong> flag abusive behaviour to the moderation team.</li>
      </ul>

      <h2 id="how-safe">2. How safe is voice chat with strangers?</h2>
      <p>
        Safer than many alternatives, but never risk-free. Here is what is true and what is not:
      </p>
      <ul>
        <li>Audio travels between the two browsers over encrypted WebRTC, and Miloo does not record calls. When two networks cannot connect directly, the encrypted audio may pass through a relay server that cannot decode it.</li>
        <li>Audio is not moderated automatically. Reports and blocks are your main protection, so use them early.</li>
        <li>The other person can record the call with tools outside Miloo, which Miloo cannot prevent.</li>
        <li>Your voice reveals more than you expect: accent, age, mood, and background sounds can hint at where you are.</li>
      </ul>
      <p>
        For the full picture, read our <Link to="/safety">Safety Center</Link> and the <Link to="/faq">FAQ</Link>.
      </p>

      <h2 id="safety-habits">3. Habits that keep you safe</h2>
      <ul>
        <li><strong>Keep identity details out.</strong> No full name, school, workplace, address, phone number or social media handles.</li>
        <li><strong>Be wary of moving to another app.</strong> Requests to continue on WhatsApp, Telegram or Snapchat are a common first step in scams.</li>
        <li><strong>Never send money or codes.</strong> No genuine stranger needs an OTP, a payment, or a link click from you.</li>
        <li><strong>Check what your microphone hears.</strong> Names called out in the room, announcements, or a TV can give away more than you intend.</li>
        <li><strong>Skip without guilt.</strong> You do not owe anyone a conversation. Skipping is a normal part of the experience.</li>
        <li><strong>Report threats and sexual or abusive behaviour</strong> with the right reason so the team can act on repeat offenders.</li>
      </ul>

      <h2 id="better-conversations">4. How to have a better conversation</h2>
      <ul>
        <li>Start with a simple question, such as what they are listening to or how their day went.</li>
        <li>Use headphones in a quiet room. This reduces echo and makes it easier to hear each other.</li>
        <li>Listen more than you talk. Short, curious questions keep a chat going.</li>
        <li>Stay respectful. If it is not a good match, skip politely or just move on.</li>
      </ul>

      <h2 id="mic-problems">5. If your microphone does not work</h2>
      <ol>
        <li>Click the lock or tune icon in your browser address bar and set Microphone to Allow for this site.</li>
        <li>Close other apps that may be using the microphone, such as Zoom, Teams or Discord.</li>
        <li>Check that you are not muted on the Miloo screen or in your system settings.</li>
        <li>On a phone, also check the browser's microphone permission in your device settings.</li>
        <li>Refresh the page, or try a private window.</li>
      </ol>
      <p>
        Ready to try it? Open the <Link to="/">Miloo home page</Link> and choose Voice chat. Miloo is strictly for adults aged 18 and over.
      </p>
    </ArticleLayout>
  )
}
