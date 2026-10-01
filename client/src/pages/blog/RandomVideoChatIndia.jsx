import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

export default function RandomVideoChatIndia() {
  const navigate = useNavigate()
  useEffect(() => {
    document.title = 'Free Random Video Chat India 2026 - Miloo'
  }, [])
  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '40px 20px', fontFamily: 'sans-serif', background: 'var(--bg-0)', color: 'var(--text-1)', minHeight: '100vh' }}>
      <h1 style={{ color: 'var(--accent-2)', fontSize: 32, marginBottom: 16 }}>Free Random Video Chat India 2026</h1>
      <p style={{ color: 'var(--text-2)', lineHeight: 1.7, marginBottom: 20 }}>Looking for free random video chat in India? Miloo is the best platform to meet strangers online — no signup, no login, completely free. Works perfectly on Jio, Airtel, and Vi mobile data.</p>
      <h2 style={{ color: 'var(--accent-2)', fontSize: 24, marginBottom: 12 }}>Why Miloo is Best for India</h2>
      <ul style={{ color: 'var(--text-2)', lineHeight: 2 }}>
        <li>✅ Works on slow mobile data (2G/3G/4G)</li>
        <li>✅ No registration required</li>
        <li>✅ Anonymous — your identity is never revealed</li>
        <li>✅ Pick a mood — set the tone of the chat</li>
        <li>✅ Text and video chat both available</li>
      </ul>
      <h2 style={{ color: 'var(--accent-2)', fontSize: 24, margin: '24px 0 12px' }}>How to Start</h2>
      <ol style={{ color: 'var(--text-2)', lineHeight: 2 }}>
        <li>Visit miloo.chat</li>
        <li>Select Video Chat or Text Chat</li>
        <li>Allow camera access</li>
        <li>Get instantly connected with a stranger</li>
      </ol>
      <button onClick={() => navigate('/')} style={{ background: 'var(--accent)', color: 'var(--text-1)', border: 'none', padding: '14px 32px', borderRadius: 50, fontSize: 18, cursor: 'pointer', marginTop: 32 }}>
        Start Free Chat →
      </button>
    </div>
  )
}
