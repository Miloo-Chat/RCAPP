import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import SEOHead from '../components/SEOHead'
import WatercolorMiniBanner from '../components/watercolor/WatercolorMiniBanner'
import { SUPPORT_EMAIL } from '../config/site'

export default function CookiePolicy({ theme, onToggleTheme }) {
  const handleOpenCookieSettings = () => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('miloo_open_cookie_settings'))
    }
  }

  return (
    <div className="page page-enter" style={{ background: 'var(--bg-0)' }}>
      <SEOHead
        title="Cookie Policy — Miloo Anonymous Chat"
        description="Miloo Cookie Policy: Learn how we use essential cookies, browser local storage, Google Analytics, and Google-certified CMP for advertising consent."
        canonicalUrl="https://miloo.chat/cookie-policy"
      />

      <Navbar theme={theme} onToggleTheme={onToggleTheme} />

      <main
        className="container"
        style={{
          paddingTop: 'clamp(20px, 3.5vw, 40px)',
          paddingBottom: 'clamp(48px, 8vw, 80px)',
          maxWidth: 880,
        }}
      >
        <WatercolorMiniBanner />

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
            Compliance & Transparency
          </div>
          <h1
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(32px, 4.5vw, 52px)',
              fontWeight: 500,
              lineHeight: 1.15,
              color: 'var(--text-1)',
              margin: '0 0 16px',
            }}
          >
            Cookie Policy
          </h1>
          <p
            style={{
              fontSize: '14px',
              color: 'var(--text-3)',
              margin: 0,
            }}
          >
            Last Updated: November 1, 2026 · Effective Immediately
          </p>
        </header>

        <article className="content-prose">
          <h2>1. What Are Cookies & Web Storage Technologies?</h2>
          <p>
            Cookies are small text files placed on your computer or mobile device by websites that you visit. They are widely used to make websites work efficiently, provide user convenience, and deliver analytical and advertising information to website operators.
          </p>
          <p>
            In addition to HTTP cookies, modern web platforms utilize HTML5 Web Storage technologies, primarily <code>localStorage</code> and <code>sessionStorage</code>. These store data locally in your browser with zero transmission overhead to network servers on every request. Miloo prioritizes privacy-preserving local storage for user preferences and relies on industry-standard Google-certified Consent Management Platforms (CMP) for third-party advertising cookies.
          </p>

          <h2>2. How Miloo Uses Cookies and Local Storage</h2>
          <p>
            Miloo does not require registration, login credentials, or persistent user profiles. Therefore, our use of cookies and local storage is strictly compartmentalized into three clear categories:
          </p>

          <h3>A. Strictly Necessary & Essential Storage (Always Active)</h3>
          <p>
            These technical items are required for the fundamental operation of the website and cannot be deactivated without breaking core platform functionality. They do not store personal identifiable data:
          </p>
          <ul>
            <li>
              <strong><code>miloo_age_confirmed</code> (localStorage):</strong> Remembers your confirmation that you are 18 years of age or older, satisfying mandatory child safety legal compliance.
            </li>
            <li>
              <strong><code>miloo-theme</code> (localStorage):</strong> Remembers your chosen watercolor aesthetic or automatic daylight/night theme preference.
            </li>
            <li>
              <strong><code>miloo_cookie_consent</code> (localStorage):</strong> Records your privacy choices regarding cookies and analytics.
            </li>
            <li>
              <strong><code>miloo_preloaded</code> (sessionStorage):</strong> Prevents redundant playback of the watercolor painting preloader when navigating during a single browsing session.
            </li>
            <li>
              <strong>WebRTC ICE Session Tokens:</strong> Ephemeral session variables in browser memory necessary for peer-to-peer audio/video connection establishment, completely purged upon room exit.
            </li>
          </ul>

          <h3>B. Performance & Analytics Cookies</h3>
          <p>
            When consented to via our cookie banner, we use Google Analytics 4 (GA4) with Google Consent Mode v2 to collect aggregate, anonymous statistics regarding how visitors interact with our public editorial pages (e.g., visitor counts, approximate geographic region by country, and popular guide topics).
          </p>
          <ul>
            <li>
              <strong>Consent Mode v2 Default Denied:</strong> All analytics storage and ad personalization signals are set to <code>denied</code> by default upon page load. No cookies are stored until you explicitly click "Accept" in our Cookie Banner.
            </li>
            <li>
              <strong>Strict Route Boundary:</strong> Analytics scripts and cookies are loaded <strong>exclusively</strong> on public informational pages (Home, Blog, About, FAQ, Privacy, Safety). They are strictly prohibited and <strong>never loaded</strong> on <code>/chat</code>, <code>/call</code>, <code>/admin</code>, the age gate modal, or the <code>/transparency</code> page.
            </li>
            <li>
              <strong>Exact GA4 Cookies & Retention:</strong>
              <ul>
                <li><code>_ga</code>: Used to distinguish unique visitors anonymously. Retention period: <strong>2 years</strong>.</li>
                <li><code>_ga_&lt;container-id&gt;</code>: Used to persist session state across pageviews. Retention period: <strong>2 years</strong>.</li>
              </ul>
            </li>
            <li>
              <strong>Permitted Event Whitelist:</strong> Only five non-identifying interaction events are tracked: <code>page_view</code>, <code>click_text_chat</code>, <code>click_video_chat</code>, <code>age_gate_result</code>, and <code>share_click</code>. No message text, prompts, usernames, or IPs are collected.
            </li>
          </ul>

          <h3>C. Server-Side Anonymous Matchmaking & Funnel Counters</h3>
          <p>
            To monitor queue health, prevent denial-of-service abuse, and assess wait times, our backend server maintains non-persistent, anonymous aggregate statistics:
          </p>
          <ul>
            <li>Sessions requested per day and mode (text vs. video)</li>
            <li>Percentage of users matched with a human within 15s, 30s, and 60s, alongside median wait times and 60s wait timeouts</li>
            <li>Aggregated chat duration buckets (&lt;30s, 30s–2m, 2m–5m, 5m–15m, 15m+) and session end reasons (user, peer, skip, report)</li>
            <li>Current and peak hourly concurrent connected users</li>
            <li><strong>Strict Invariant:</strong> Server-side metrics maintain zero message content, zero IP addresses, and zero persistent user identifiers.</li>
          </ul>

          <h3>D. Third-Party Advertising Cookies (Google AdSense & CMP)</h3>
          <p>
            To keep Miloo 100% free without charging subscriptions or selling private data, we display digital advertisements served by Google AdSense solely on our public informational and editorial pages (such as our Blog, About, and Safety pages).
          </p>
          <ul>
            <li>
              <strong>Google DoubleClick Cookie:</strong> Google uses cookies to serve ads based on prior visits to our site or other websites across the web.
            </li>
            <li>
              <strong>No Ads Inside Chat:</strong> Advertisements and third-party advertising tracking scripts are <em>never</em> rendered inside private text or video chat rooms, matchmaking loaders, or camera views.
            </li>
            <li>
              <strong>Google-Certified CMP (Consent Management Platform):</strong> In compliance with the European Economic Area (EEA), UK GDPR, and IAB Europe Transparency and Consent Framework (TCF v2.2), visitors from applicable jurisdictions are presented with a Google-certified CMP to make granular consent choices prior to any non-essential advertising cookies being set.
            </li>
          </ul>

          <h2>3. Managing and Disabling Cookies</h2>
          <p>
            You have full control over the cookies and storage technologies placed on your device. You can exercise your preferences through several channels:
          </p>
          <ul>
            <li>
              <strong>On-Site Cookie Settings:</strong> You can review or adjust your consent choices at any time by clicking the <button type="button" onClick={handleOpenCookieSettings} style={{ background: 'none', border: 'none', padding: 0, color: 'var(--accent)', textDecoration: 'underline', cursor: 'pointer', font: 'inherit' }}>Cookie Settings</button> link located in our footer.
            </li>
            <li>
              <strong>Google Personalized Ads Opt-Out:</strong> You can opt out of personalized advertising by visiting Google's official Ads Settings portal at <a href="https://adssettings.google.com" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent)', textDecoration: 'underline' }}>https://adssettings.google.com</a>.
            </li>
            <li>
              <strong>Industry-Wide Opt-Out Tools:</strong> You can opt out of third-party interest-based advertising through the Digital Advertising Alliance at <a href="https://optout.aboutads.info" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent)', textDecoration: 'underline' }}>optout.aboutads.info</a> or Your Online Choices (EU) at <a href="https://www.youronlinechoices.eu" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent)', textDecoration: 'underline' }}>youronlinechoices.eu</a>.
            </li>
            <li>
              <strong>Browser Controls:</strong> Most modern browsers (Chrome, Safari, Firefox, Edge) allow you to block third-party cookies, clear existing cookies, or browse in private/incognito mode through your browser settings menu.
            </li>
          </ul>

          <h2>4. Updates to This Cookie Policy</h2>
          <p>
            We may update this Cookie Policy periodically to reflect technological changes, regulatory requirements, or updates to our advertising partnerships. When changes are published, the "Last Updated" date at the top of this page will be revised.
          </p>

          <h2>5. Contact Us</h2>
          <p>
            If you have questions or concerns about our use of cookies or privacy standards, please contact our privacy compliance team via our <Link to="/contact" style={{ color: 'var(--accent)', textDecoration: 'underline' }}>Contact Desk</Link> or by email at <a href={`mailto:${SUPPORT_EMAIL}`} style={{ color: 'var(--accent)', textDecoration: 'underline' }}>{SUPPORT_EMAIL}</a>.
          </p>
        </article>
      </main>

      <Footer />
    </div>
  )
}

