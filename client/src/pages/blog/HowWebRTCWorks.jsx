import { Link } from 'react-router-dom'
import ArticleLayout from '../../components/ArticleLayout'

export default function HowWebRTCWorks({ theme, onToggleTheme }) {
  const tableOfContents = [
    { id: 'what-is-webrtc', label: 'What WebRTC Actually Is' },
    { id: 'signaling', label: 'Step One: Signaling' },
    { id: 'finding-a-path', label: 'Step Two: Finding a Path (STUN and ICE)' },
    { id: 'relay', label: 'When a Direct Path Fails: TURN Relays' },
    { id: 'encryption', label: 'How the Media Stays Encrypted' },
    { id: 'privacy', label: 'What This Means for Your Privacy' },
  ]

  const relatedArticles = [
    {
      url: '/blog/protecting-privacy-in-video-chat',
      title: 'Protecting Your Privacy in Video Chat: A Practical Checklist',
      blurb: 'Secure your webcam space and understand what peers can and cannot see.',
      readTime: '5 min read',
    },
    {
      url: '/blog/how-miloo-moderation-works',
      title: 'How Moderation Works on Miloo: Reports, Blocks and Detection',
      blurb: 'A look at the safety systems that run alongside every conversation.',
      readTime: '6 min read',
    },
    {
      url: '/blog/stay-safe-talking-to-strangers-online',
      title: 'How to Stay Safe Talking to Strangers Online',
      blurb: 'Practical habits that keep you in control of every conversation.',
      readTime: '7 min read',
    },
  ]

  return (
    <ArticleLayout
      title="How WebRTC Works: Peer-to-Peer Video Chat Explained Simply"
      description="A plain-language explanation of how browser video chat connects two people directly: signaling, STUN, TURN relays and encryption, and what it means for your privacy."
      url="https://miloo.chat/blog/how-webrtc-video-chat-works"
      category="Technology"
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
        When you start a video chat in your browser, there is no app to install and no plugin to approve, yet a live video call begins within a few seconds. The technology behind this is called WebRTC, short for Web Real-Time Communication. It is built into every modern browser, and it is the reason a site like Miloo can connect two people without asking either of them to create an account.
      </p>
      <p>
        This guide explains how a WebRTC call is set up, why some calls need help from a relay server, and what all of this means for your privacy. You do not need any technical background to follow it.
      </p>

      <h2 id="what-is-webrtc">What WebRTC Actually Is</h2>
      <p>
        WebRTC is a set of standards that lets two browsers exchange audio, video and data directly with each other. The key word is directly. In a traditional video service, your video travels to a company’s server and is then forwarded to the other person. In a peer-to-peer call, the video can travel straight from your device to theirs.
      </p>
      <p>
        That design has two practical benefits. Calls tend to have lower delay because the data takes a shorter path, and the service does not have to carry every video stream through its own servers. It is one reason browser-based platforms can stay fast without requiring heavy native apps.
      </p>

      <h2 id="signaling">Step One: Signaling</h2>
      <p>
        Two browsers cannot simply find each other on the internet. Before a call starts, they need to introduce themselves and agree on how to talk: which video formats each supports, and how each can be reached. This introduction phase is called signaling.
      </p>
      <p>
        Signaling is handled by a server. On Miloo, a real-time connection to the server is used to pair two waiting people and pass these small setup messages between them. The messages describe capabilities and network details. They do not contain your video or audio. Once the two browsers have exchanged enough information, the server steps out of the way of the media itself.
      </p>

      <h2 id="finding-a-path">Step Two: Finding a Path (STUN and ICE)</h2>
      <p>
        Most devices sit behind a home router that uses network address translation, which means the device does not know its own public address. To discover it, the browser asks a lightweight helper called a STUN server, which simply replies with the address it sees.
      </p>
      <p>
        The browser then gathers a list of possible routes, called ICE candidates, and the two sides try them in turn until one works. This process, known as ICE, is why a call sometimes takes a moment to connect: the browsers are testing several possible paths and keeping the best one.
      </p>

      <h2 id="relay">When a Direct Path Fails: TURN Relays</h2>
      <p>
        Some networks, such as strict corporate or campus networks and certain mobile carriers, block direct connections. When no direct path works, WebRTC falls back to a TURN server, which relays the traffic between the two people.
      </p>
      <p>
        This is why video chat can work on your home wifi but fail between two different mobile networks if a platform has no relay configured. A relay costs more to run because the media passes through it, so it is used only when it is genuinely needed. Even then, the relay forwards encrypted data and cannot read it.
      </p>

      <h2 id="encryption">How the Media Stays Encrypted</h2>
      <p>
        WebRTC requires encryption. Audio and video are protected with a standard called SRTP, and the keys are negotiated through a secure handshake called DTLS. Browsers do not allow an unencrypted WebRTC call, so encryption is not an optional setting a site can forget to switch on.
      </p>
      <p>
        In practice, this means someone watching traffic on a public network cannot simply watch your call, and a TURN relay cannot see your video even though it carries it.
      </p>

      <h2 id="privacy">What This Means for Your Privacy</h2>
      <p>
        Peer-to-peer connections have one trade-off worth knowing. To reach each other directly, the two browsers exchange network addresses, so in a direct connection the other person’s browser can learn your public IP address. That address reveals roughly your internet provider and general area, not your street or name, but it is still information you may prefer to keep private.
      </p>
      <ul>
        <li><strong>Use a VPN</strong> if you want to hide your real network address from the person you are chatting with.</li>
        <li><strong>Mind your surroundings.</strong> The camera feed shows your room, so check what is visible behind you. Our <Link to="/blog/protecting-privacy-in-video-chat">privacy checklist</Link> covers this in detail.</li>
        <li><strong>Use the safety tools.</strong> Skip, report and block work instantly. Read how in our guide to <Link to="/blog/how-miloo-moderation-works">moderation on Miloo</Link>.</li>
      </ul>

      <h2>Conclusion</h2>
      <p>
        WebRTC turns your browser into a direct line to another person: a server makes the introduction, helpers find a route, and the call itself is encrypted. Understanding those steps explains why calls connect quickly, why they occasionally need a relay, and which privacy habits matter most. For more on staying safe, visit our <Link to="/safety">Safety Center</Link>.
      </p>
    </ArticleLayout>
  )
}
