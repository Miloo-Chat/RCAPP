import { Link } from 'react-router-dom'
import ArticleLayout from '../../components/ArticleLayout'

export default function PublicWifiVideoChat({ theme, onToggleTheme }) {
  const tableOfContents = [
    { id: 'risks', label: 'What Is Different About Public Networks' },
    { id: 'checklist', label: 'A Simple Safety Checklist' },
    { id: 'surroundings', label: 'Watch Your Surroundings' },
    { id: 'connection', label: 'Getting a Better Connection' },
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
      title="Staying Safe on Public Wi-Fi While Video Chatting"
      description="How to protect your privacy and your connection when you use video chat on cafe, campus or airport wi-fi, including VPN, browser and surroundings tips."
      url="https://miloo.chat/blog/staying-safe-on-public-wifi-video-chat"
      category="Privacy"
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
        Public wi-fi in cafes, libraries, campuses and airports is convenient, but it is shared with strangers. Video chat adds two more concerns: what your camera shows and how reliable the connection is. These steps keep both under control.
      </p>

      <h2 id="risks">What Is Different About Public Networks</h2>
      <p>
        On a shared network, other users can sometimes see that you are connected and, on poorly configured networks, may be able to observe unprotected traffic. Modern browsers encrypt most traffic, and WebRTC media is always encrypted, but good habits still matter.
      </p>
      <p>
        Public networks also tend to be congested or restricted, which is why calls may freeze or fail to connect.
      </p>

      <h2 id="checklist">A Simple Safety Checklist</h2>
      <p>
        Before you start a call on public wi-fi:
      </p>
      <ul>
        <li>Confirm the network name with staff, since fake hotspots with similar names exist.</li>
        <li>Use a reputable VPN if you want to hide your network address from the other person.</li>
        <li>Keep your browser and operating system updated.</li>
        <li>Do not enter passwords or payment details while chatting.</li>
        <li>Turn off file sharing and automatic network discovery.</li>
      </ul>

      <h2 id="surroundings">Watch Your Surroundings</h2>
      <p>
        A camera shows more than your face. Check for name badges, screens, documents, street signs or anything that reveals your location or routine. In a public place, other people may also appear in the frame without agreeing to it.
      </p>
      <p>
        Headphones help keep your conversation private and reduce echo.
      </p>

      <h2 id="connection">Getting a Better Connection</h2>
      <p>
        If video struggles, move closer to the router, close other tabs and apps, and switch off your camera for a moment to test the connection. Mobile data is often more stable than crowded public wi-fi. Our guide to <Link to="/blog/how-webrtc-video-chat-works">how WebRTC works</Link> explains why some networks need relay servers.
      </p>

      <h2>Conclusion</h2>
      <p>
        Small, thoughtful habits make online conversation safer and more enjoyable. For more guidance, visit our <Link to="/safety">Safety Center</Link> or browse the <Link to="/blog">Miloo blog</Link>.
      </p>
    </ArticleLayout>
  )
}
