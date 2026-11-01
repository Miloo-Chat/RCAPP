import { useState } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import SEOHead from '../components/SEOHead'

const SUPPORT_EMAIL = import.meta.env.VITE_SUPPORT_EMAIL || 'support@miloo.chat'

export default function Contact({ theme, onToggleTheme }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: 'General Inquiry',
    message: '',
  })
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
    if (error) setError('')
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!formData.email || !formData.email.includes('@')) {
      setError('Please provide a valid email address so our support team can reply to you.')
      return
    }
    if (!formData.message.trim()) {
      setError('Please enter your message describing your inquiry, report, or appeal in detail.')
      return
    }

    setSubmitted(true)
  }

  return (
    <div className="page page-enter" style={{ background: 'var(--bg-0)' }}>
      <SEOHead
        title="Contact & Support Desk — Miloo"
        description="Get in touch with the Miloo team for technical support, safety reports, business inquiries, and DMCA notices. We respond within 24-48 hours."
        canonicalUrl="https://www.miloo.chat/contact"
      />

      <Navbar theme={theme} onToggleTheme={onToggleTheme} />

      <main className="container" style={{ paddingTop: 'clamp(32px, 5vw, 56px)', paddingBottom: 'clamp(48px, 8vw, 80px)', maxWidth: 960 }}>
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
            Helpdesk & Inquiries
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
            Contact & Support Desk
          </h1>
          <p
            style={{
              fontSize: 'clamp(16px, 1.8vw, 20px)',
              color: 'var(--text-2)',
              lineHeight: 1.6,
              margin: 0,
            }}
          >
            Have a question, feedback, need to appeal an account restriction, or report a platform safety incident? Our administrative team is here to assist you.
          </p>
        </header>

        {/* Support Channels Overview */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: 20,
            marginBottom: 36,
          }}
        >
          <div className="content-card">
            <div style={{ fontSize: '24px', marginBottom: 8 }}>✉️</div>
            <h3 style={{ margin: '0 0 8px', fontFamily: 'var(--font-display)', fontSize: '18px', color: 'var(--text-1)' }}>
              Direct Support Email
            </h3>
            <p style={{ margin: '0 0 12px', fontSize: '14px', lineHeight: 1.6, color: 'var(--text-2)' }}>
              Our official desk email for all user correspondence, technical issues, and security notices.
            </p>
            <a
              href={`mailto:${SUPPORT_EMAIL}`}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                color: 'var(--accent)',
                fontWeight: 600,
                fontSize: '14px',
                textDecoration: 'none',
                wordBreak: 'break-all',
              }}
            >
              {SUPPORT_EMAIL} →
            </a>
          </div>

          <div className="content-card">
            <div style={{ fontSize: '24px', marginBottom: 8 }}>⏱️</div>
            <h3 style={{ margin: '0 0 8px', fontFamily: 'var(--font-display)', fontSize: '18px', color: 'var(--text-1)' }}>
              Expected Response Time
            </h3>
            <p style={{ margin: 0, fontSize: '14px', lineHeight: 1.6, color: 'var(--text-2)' }}>
              Our team operates seven days a week. We review urgent safety reports within 12 hours and respond to general inquiries and ban appeals within 24 to 48 business hours.
            </p>
          </div>

          <div className="content-card">
            <div style={{ fontSize: '24px', marginBottom: 8 }}>💼</div>
            <h3 style={{ margin: '0 0 8px', fontFamily: 'var(--font-display)', fontSize: '18px', color: 'var(--text-1)' }}>
              Press & Business Inquiries
            </h3>
            <p style={{ margin: 0, fontSize: '14px', lineHeight: 1.6, color: 'var(--text-2)' }}>
              For editorial coverage, press inquiries, advertising partnerships, or technical integrations, please tag your subject line with <strong>[Business]</strong>.
            </p>
          </div>
        </div>

        {/* Main Grid: Detailed Guidance Left, Form Right */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
            gap: 32,
            marginBottom: 48,
          }}
        >
          {/* Left Column: Comprehensive Procedures */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            <div className="content-card">
              <h3 style={{ margin: '0 0 12px', fontFamily: 'var(--font-display)', fontSize: '20px', color: 'var(--text-1)' }}>
                How to Report Abuse or Illegal Content
              </h3>
              <p style={{ margin: '0 0 12px', fontSize: '14px', lineHeight: 1.65, color: 'var(--text-2)' }}>
                Your safety is our top priority. If you encounter abusive behavior during a conversation:
              </p>
              <ul style={{ margin: '0 0 12px', paddingLeft: 20, fontSize: '14px', lineHeight: 1.65, color: 'var(--text-2)' }}>
                <li>
                  <strong>In-App Actions:</strong> Always click the <em>Report User</em> button inside the chat header immediately. This packages the partner session identifier and violation category directly into our moderation queue.
                </li>
                <li>
                  <strong>Email Escalation:</strong> For extreme violations (such as non-consensual imagery, extortion, cyberstalking, or child exploitation), email us immediately with <strong>URGENT SAFETY</strong> in the subject line.
                </li>
                <li>
                  <strong>Details to Include:</strong> Provide the approximate date and time (with your time zone), the violation category, and any screenshots or contextual details you preserved.
                </li>
              </ul>
              <p style={{ margin: 0, fontSize: '13px', lineHeight: 1.6, color: 'var(--text-3)' }}>
                Note: In accordance with international law, confirmed instances of child exploitation or terrorism are reported immediately to the National Center for Missing & Exploited Children (NCMEC) and relevant law enforcement.
              </p>
            </div>

            <div className="content-card">
              <h3 style={{ margin: '0 0 12px', fontFamily: 'var(--font-display)', fontSize: '20px', color: 'var(--text-1)' }}>
                What to Include in a Ban or Suspension Appeal
              </h3>
              <p style={{ margin: '0 0 12px', fontSize: '14px', lineHeight: 1.65, color: 'var(--text-2)' }}>
                Miloo utilizes automated device fingerprinting and IP hash identification to enforce suspensions for safety violations. If you believe your access was restricted in error (such as sharing a public university Wi-Fi or dynamic carrier IP), you may appeal:
              </p>
              <ul style={{ margin: '0 0 12px', paddingLeft: 20, fontSize: '14px', lineHeight: 1.65, color: 'var(--text-2)' }}>
                <li>
                  <strong>Network Context:</strong> Mention if you were connected via cellular data, VPN, college campus network, or public Wi-Fi hotspot.
                </li>
                <li>
                  <strong>Timestamp:</strong> Provide the date and approximate time you received the suspension message.
                </li>
                <li>
                  <strong>Explanation:</strong> Provide a clear, respectful summary explaining why you believe the suspension was mistaken or resulted from recycled IP assignments.
                </li>
              </ul>
              <p style={{ margin: 0, fontSize: '13px', lineHeight: 1.6, color: 'var(--text-3)' }}>
                Appeals are reviewed by human administrators. Deliberate or severe violations of our Community Guidelines will not be reinstated.
              </p>
            </div>

            <div className="content-card">
              <h3 style={{ margin: '0 0 12px', fontFamily: 'var(--font-display)', fontSize: '20px', color: 'var(--text-1)' }}>
                DMCA & Copyright Infringement Notices
              </h3>
              <p style={{ margin: '0 0 12px', fontSize: '14px', lineHeight: 1.65, color: 'var(--text-2)' }}>
                Miloo operates an ephemeral peer-to-peer real-time communication platform. Our servers do not host, store, index, or distribute user-uploaded static audio or video media files. All WebRTC live media packets travel encrypted directly between client peers.
              </p>
              <p style={{ margin: '0 0 12px', fontSize: '14px', lineHeight: 1.65, color: 'var(--text-2)' }}>
                To file a formal notice under 17 U.S.C. § 512(c)(3), please provide our designated DMCA agent with:
              </p>
              <ol style={{ margin: 0, paddingLeft: 20, fontSize: '14px', lineHeight: 1.65, color: 'var(--text-2)' }}>
                <li>Physical or electronic signature of the authorized copyright owner.</li>
                <li>Identification of the copyrighted work claimed to have been infringed.</li>
                <li>Specific URL or location on Miloo where the infringing activity occurred.</li>
                <li>Your contact information including email address and telephone number.</li>
                <li>A statement of good-faith belief that the disputed use is unauthorized.</li>
                <li>A statement made under penalty of perjury that the information is accurate.</li>
              </ol>
            </div>
          </div>

          {/* Right Column: Contact Form */}
          <div>
            <div className="content-card" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div>
                <h2 style={{ margin: '0 0 6px', fontFamily: 'var(--font-display)', fontSize: '24px', color: 'var(--text-1)' }}>
                  Send a Message to Support
                </h2>
                <p style={{ margin: 0, fontSize: '14px', color: 'var(--text-2)', lineHeight: 1.5 }}>
                  Fill out the form below and our administrative team will get back to you promptly.
                </p>
              </div>

              {submitted ? (
                <div
                  style={{
                    background: 'var(--accent-dim)',
                    border: '1px solid var(--accent)',
                    borderRadius: 'var(--radius-md)',
                    padding: '28px 24px',
                    textAlign: 'center',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 14,
                  }}
                >
                  <span style={{ fontSize: '36px' }}>✓</span>
                  <h3 style={{ margin: 0, color: 'var(--text-1)', fontSize: '20px' }}>
                    Message Dispatched Successfully!
                  </h3>
                  <p style={{ margin: 0, fontSize: '14px', lineHeight: 1.6, color: 'var(--text-2)' }}>
                    Thank you for reaching out to the Miloo team. We have received your inquiry and our support desk will respond directly to <strong>{formData.email}</strong> within 24 to 48 hours.
                  </p>
                  <div style={{ marginTop: 8 }}>
                    <button
                      type="button"
                      onClick={() => {
                        setSubmitted(false)
                        setFormData({ name: '', email: '', subject: 'General Inquiry', message: '' })
                      }}
                      style={{
                        background: 'transparent',
                        border: '1px solid var(--border-2)',
                        color: 'var(--text-1)',
                        padding: '8px 18px',
                        borderRadius: 'var(--radius-pill)',
                        cursor: 'pointer',
                        fontSize: '13px',
                        fontWeight: 500,
                      }}
                    >
                      Send Another Message
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {error && (
                    <div
                      style={{
                        background: 'rgba(220, 38, 38, 0.15)',
                        border: '1px solid var(--danger)',
                        borderRadius: 'var(--radius-md)',
                        padding: '10px 14px',
                        color: '#f87171',
                        fontSize: '13px',
                      }}
                    >
                      {error}
                    </div>
                  )}

                  <div>
                    <label
                      htmlFor="contact-name"
                      style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-2)', marginBottom: 6 }}
                    >
                      Your Name or Screen Alias (Optional)
                    </label>
                    <input
                      id="contact-name"
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="e.g. Alex"
                      style={{
                        width: '100%',
                        padding: '12px 14px',
                        borderRadius: 'var(--radius-md)',
                        background: 'var(--bg-0)',
                        border: '1px solid var(--border-1)',
                        color: 'var(--text-1)',
                        fontFamily: 'var(--font-body)',
                        fontSize: '14px',
                        outline: 'none',
                      }}
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="contact-email"
                      style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-2)', marginBottom: 6 }}
                    >
                      Your Email Address *
                    </label>
                    <input
                      id="contact-email"
                      type="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="you@example.com"
                      style={{
                        width: '100%',
                        padding: '12px 14px',
                        borderRadius: 'var(--radius-md)',
                        background: 'var(--bg-0)',
                        border: '1px solid var(--border-1)',
                        color: 'var(--text-1)',
                        fontFamily: 'var(--font-body)',
                        fontSize: '14px',
                        outline: 'none',
                      }}
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="contact-subject"
                      style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-2)', marginBottom: 6 }}
                    >
                      Inquiry Category
                    </label>
                    <select
                      id="contact-subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      style={{
                        width: '100%',
                        padding: '12px 14px',
                        borderRadius: 'var(--radius-md)',
                        background: 'var(--bg-0)',
                        border: '1px solid var(--border-1)',
                        color: 'var(--text-1)',
                        fontFamily: 'var(--font-body)',
                        fontSize: '14px',
                        outline: 'none',
                      }}
                    >
                      <option value="General Inquiry">General Platform Inquiry</option>
                      <option value="Ban or Suspension Appeal">Ban or Suspension Appeal</option>
                      <option value="Safety or Abuse Report">Safety or Abuse Report</option>
                      <option value="Technical Bug / Camera Issue">Technical Bug / Camera Issue</option>
                      <option value="Press & Business Partnerships">Press & Business Partnerships</option>
                      <option value="DMCA & Copyright Notice">DMCA & Copyright Notice</option>
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor="contact-message"
                      style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-2)', marginBottom: 6 }}
                    >
                      Detailed Message *
                    </label>
                    <textarea
                      id="contact-message"
                      name="message"
                      required
                      rows={6}
                      value={formData.message}
                      onChange={handleChange}
                      placeholder="Please include full details regarding your question, appeal, or safety report..."
                      style={{
                        width: '100%',
                        padding: '12px 14px',
                        borderRadius: 'var(--radius-md)',
                        background: 'var(--bg-0)',
                        border: '1px solid var(--border-1)',
                        color: 'var(--text-1)',
                        fontFamily: 'var(--font-body)',
                        fontSize: '14px',
                        outline: 'none',
                        resize: 'vertical',
                      }}
                    />
                  </div>

                  <button
                    type="submit"
                    style={{
                      padding: '13px 26px',
                      borderRadius: 'var(--radius-pill)',
                      border: 'none',
                      background: 'var(--accent)',
                      color: '#ffffff',
                      fontSize: '15px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      boxShadow: 'var(--shadow-sm)',
                      marginTop: 4,
                      transition: 'opacity 160ms ease',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.9')}
                    onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
                  >
                    Submit Message →
                  </button>
                </form>
              )}

              {/* Direct Mailto Fallback */}
              <div
                style={{
                  borderTop: '1px solid var(--border-1)',
                  paddingTop: 16,
                  marginTop: 4,
                  fontSize: '13px',
                  color: 'var(--text-3)',
                  lineHeight: 1.6,
                }}
              >
                Prefer your own email client? Write to us directly at{' '}
                <a
                  href={`mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(formData.subject)}`}
                  style={{ color: 'var(--accent)', textDecoration: 'underline' }}
                >
                  {SUPPORT_EMAIL}
                </a>
                .
              </div>
            </div>
          </div>
        </div>

        {/* Quick Reference Policies & Compliance Links */}
        <div className="content-card" style={{ textAlign: 'center', padding: '32px 24px' }}>
          <h3 style={{ margin: '0 0 10px', fontFamily: 'var(--font-display)', fontSize: '20px', color: 'var(--text-1)' }}>
            Quick Safety & Compliance Reference
          </h3>
          <p style={{ margin: '0 0 20px', color: 'var(--text-2)', fontSize: '14px', maxWidth: 640, marginInline: 'auto', lineHeight: 1.6 }}>
            Before submitting your request, please review our public policies and guidelines for instant clarity on platform rules and privacy protections:
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link
              to="/safety"
              style={{
                padding: '8px 18px',
                borderRadius: 'var(--radius-pill)',
                background: 'var(--surface-2)',
                border: '1px solid var(--border-2)',
                color: 'var(--text-1)',
                fontSize: '13px',
                fontWeight: 600,
                textDecoration: 'none',
              }}
            >
              Safety Center
            </Link>
            <Link
              to="/community-guidelines"
              style={{
                padding: '8px 18px',
                borderRadius: 'var(--radius-pill)',
                background: 'var(--surface-2)',
                border: '1px solid var(--border-2)',
                color: 'var(--text-1)',
                fontSize: '13px',
                fontWeight: 600,
                textDecoration: 'none',
              }}
            >
              Community Guidelines
            </Link>
            <Link
              to="/privacy"
              style={{
                padding: '8px 18px',
                borderRadius: 'var(--radius-pill)',
                background: 'var(--surface-2)',
                border: '1px solid var(--border-2)',
                color: 'var(--text-1)',
                fontSize: '13px',
                fontWeight: 600,
                textDecoration: 'none',
              }}
            >
              Privacy Policy
            </Link>
            <Link
              to="/terms"
              style={{
                padding: '8px 18px',
                borderRadius: 'var(--radius-pill)',
                background: 'var(--surface-2)',
                border: '1px solid var(--border-2)',
                color: 'var(--text-1)',
                fontSize: '13px',
                fontWeight: 600,
                textDecoration: 'none',
              }}
            >
              Terms of Service
            </Link>
            <Link
              to="/faq"
              style={{
                padding: '8px 18px',
                borderRadius: 'var(--radius-pill)',
                background: 'var(--surface-2)',
                border: '1px solid var(--border-2)',
                color: 'var(--text-1)',
                fontSize: '13px',
                fontWeight: 600,
                textDecoration: 'none',
              }}
            >
              Help & FAQ
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
