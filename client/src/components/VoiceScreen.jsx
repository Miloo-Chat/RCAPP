// client/src/components/VoiceScreen.jsx
// Voice-chat screen for Miloo. Uses the site's existing theme variables only.
// Matching / WebRTC / reporting all live in ChatRoom.jsx; this file is UI only.
import { useCallback, useEffect, useRef, useState } from 'react'

const FRIENDS_KEY = 'miloo_voice_friends'
const MAX_FRIENDS = 50

function loadFriends() {
  try {
    const raw = JSON.parse(localStorage.getItem(FRIENDS_KEY) || '[]')
    return Array.isArray(raw) ? raw.filter((f) => f && typeof f.name === 'string') : []
  } catch {
    return []
  }
}

function saveFriends(list) {
  try {
    localStorage.setItem(FRIENDS_KEY, JSON.stringify(list.slice(0, MAX_FRIENDS)))
  } catch {
    /* storage unavailable: friends simply won't persist */
  }
}

const Icon = {
  phone: (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M6.6 10.8a15.1 15.1 0 0 0 6.6 6.6l2.2-2.2a1 1 0 0 1 1-.25c1.1.37 2.3.57 3.6.57a1 1 0 0 1 1 1V20a1 1 0 0 1-1 1C10.6 21 3 13.4 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.25.2 2.45.57 3.6a1 1 0 0 1-.25 1z" />
    </svg>
  ),
  end: (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 9c-1.6 0-3.15.25-4.6.72v3.1c0 .4-.23.74-.56.9-.98.49-1.87 1.12-2.66 1.85a.99.99 0 0 1-.7.28.99.99 0 0 1-.71-.29L.29 13.08a.96.96 0 0 1-.29-.7c0-.28.11-.53.29-.71C3.34 8.78 7.46 7 12 7s8.66 1.78 11.71 4.67c.18.18.29.43.29.71 0 .28-.11.53-.29.71l-2.48 2.48a.99.99 0 0 1-.7.29.99.99 0 0 1-.7-.28 11.5 11.5 0 0 0-2.67-1.85.99.99 0 0 1-.56-.9v-3.1C15.15 9.25 13.6 9 12 9z" />
    </svg>
  ),
  skip: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M5 5v14l9-7zM16 5h3v14h-3z" />
    </svg>
  ),
  mic: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 14a3 3 0 0 0 3-3V5a3 3 0 0 0-6 0v6a3 3 0 0 0 3 3zm5-3a5 5 0 0 1-10 0H5a7 7 0 0 0 6 6.92V21h2v-3.08A7 7 0 0 0 19 11z" />
    </svg>
  ),
  micOff: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M19 11a7 7 0 0 1-1.1 3.76l-1.46-1.46A5 5 0 0 0 17 11zM15 11.17V5a3 3 0 0 0-5.7-1.3zM4.27 3 3 4.27l6 6V11a3 3 0 0 0 4.1 2.8l1.7 1.7A5 5 0 0 1 7 11H5a7 7 0 0 0 6 6.92V21h2v-3.08c.9-.13 1.75-.43 2.5-.87L19.73 21 21 19.73z" />
    </svg>
  ),
  userPlus: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M15 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zm-9-2V7H4v3H1v2h3v3h2v-3h3v-2zm9 4c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
    </svg>
  ),
  flag: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M14.4 6 14 4H5v17h2v-7h5.6l.4 2h7V6z" />
    </svg>
  ),
  chat: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M4 4h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H8l-4 4V6a2 2 0 0 1 2-2z" />
    </svg>
  ),
  send: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M2 21 23 12 2 3v7l15 2-15 2z" />
    </svg>
  ),
  close: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M19 6.41 17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
    </svg>
  ),
}

function formatTime(total) {
  const m = String(Math.floor(total / 60)).padStart(2, '0')
  const s = String(total % 60).padStart(2, '0')
  return `${m}:${s}`
}

export default function VoiceScreen({
  status,
  hasPartner,
  matchSeconds = 0,
  iceState = 'new',
  remoteStream,
  remoteStreamVersion,
  messages = [],
  sendText,
  scrollRef,
  isStrangerTyping,
  isMuted,
  onToggleMute,
  autoCall,
  onToggleAuto,
  onCall,
  onEnd,
  onSkip,
  onReport,
}) {
  const phase =
    status === 'connected'
      ? 'connected'
      : status === 'waiting'
        ? hasPartner
          ? 'linking'
          : 'searching'
        : status === 'connecting'
          ? 'asking'
          : status === 'partner_left'
            ? 'left'
            : status === 'cam_error'
              ? 'error'
              : 'idle'

  const unstable = phase === 'connected' && (iceState === 'disconnected' || iceState === 'failed')

  // ── remote audio playback ──
  const audioRef = useRef(null)
  const [soundBlocked, setSoundBlocked] = useState(false)
  useEffect(() => {
    const el = audioRef.current
    if (!el) return
    if (remoteStream) {
      if (el.srcObject !== remoteStream) el.srcObject = remoteStream
      const p = el.play()
      if (p && typeof p.then === 'function') {
        p.then(() => setSoundBlocked(false)).catch(() => setSoundBlocked(true))
      }
    } else {
      el.srcObject = null
    }
  }, [remoteStream, remoteStreamVersion])

  const enableSound = useCallback(() => {
    const el = audioRef.current
    if (!el) return
    el.play().then(() => setSoundBlocked(false)).catch(() => {})
  }, [])

  // ── call timer ──
  const [secs, setSecs] = useState(0)
  useEffect(() => {
    if (phase !== 'connected') {
      setSecs(0)
      return undefined
    }
    const t0 = Date.now()
    const id = setInterval(() => setSecs(Math.floor((Date.now() - t0) / 1000)), 1000)
    return () => clearInterval(id)
  }, [phase])

  // ── chat panel (side panel on desktop, bottom sheet on mobile) ──
  const [chatOpen, setChatOpen] = useState(false)
  const [unread, setUnread] = useState(0)
  const seenRef = useRef(0)
  useEffect(() => {
    const n = messages.length
    if (chatOpen) {
      seenRef.current = n
      setUnread(0)
      return
    }
    if (n < seenRef.current) seenRef.current = 0
    const fresh = messages.slice(seenRef.current).filter((m) => m.from === 'stranger').length
    seenRef.current = n
    if (fresh) setUnread((u) => u + fresh)
  }, [messages, chatOpen])

  const [draft, setDraft] = useState('')
  const submitDraft = (e) => {
    e.preventDefault()
    const text = draft.trim()
    if (!text || phase !== 'connected') return
    sendText(text)
    setDraft('')
  }

  // ── friends (device-only, no database) ──
  const [friends, setFriends] = useState(loadFriends)
  const [naming, setNaming] = useState(false)
  const [nickname, setNickname] = useState('')
  const [friendsOpen, setFriendsOpen] = useState(false)
  const [toast, setToast] = useState('')

  useEffect(() => {
    if (phase !== 'connected') setNaming(false)
  }, [phase])

  useEffect(() => {
    if (!toast) return undefined
    const id = setTimeout(() => setToast(''), 2200)
    return () => clearTimeout(id)
  }, [toast])

  const saveFriend = (e) => {
    e.preventDefault()
    const name = nickname.trim().slice(0, 20)
    if (!name) return
    if (friends.some((f) => f.name.toLowerCase() === name.toLowerCase())) {
      setToast('That nickname is already saved')
      return
    }
    const next = [{ id: `f_${Date.now()}`, name, savedAt: Date.now() }, ...friends].slice(0, MAX_FRIENDS)
    setFriends(next)
    saveFriends(next)
    setNickname('')
    setNaming(false)
    setToast(`Saved "${name}"`)
  }

  const removeFriend = (id) => {
    const next = friends.filter((f) => f.id !== id)
    setFriends(next)
    saveFriends(next)
  }

  // ── copy ──
  const copy = {
    idle: ['Ready when you are', 'Tap Call to talk with a new stranger'],
    asking: ['Allow microphone', 'Choose Allow in your browser to continue'],
    searching: ['Finding someone…', `Searching · ${matchSeconds}s`],
    linking: ['Connecting…', 'Setting up your audio link'],
    connected: unstable
      ? ['Connection unstable', 'Trying to keep the call alive…']
      : ['Connected', formatTime(secs)],
    left: ['Stranger left', autoCall ? 'Finding the next person…' : 'Tap Call to meet someone new'],
    error: ['Microphone blocked', 'Allow microphone access in your browser settings, then tap Call'],
  }[phase]

  const live = phase === 'connected' || phase === 'searching' || phase === 'linking'
  const inCall = phase === 'connected'
  const showEnd = phase === 'asking' || phase === 'searching' || phase === 'linking' || phase === 'connected'

  return (
    <div className="vs-root">
      <style>{VS_CSS}</style>
      <audio ref={audioRef} autoPlay playsInline />

      <section className="vs-stage" aria-label="Voice chat">
        <div className={`vs-orb${live ? ' live' : ''}${phase === 'connected' ? ' on' : ''}`} aria-hidden="true">
          <span>Miloo</span>
        </div>

        <div className="vs-copy" role="status" aria-live="polite">
          <div className="vs-title">{copy[0]}</div>
          <div className="vs-sub">{copy[1]}</div>
        </div>

        {soundBlocked && inCall && (
          <button type="button" className="vs-pill" onClick={enableSound}>
            Tap to turn on sound
          </button>
        )}

        <div className="vs-controls">
          {showEnd ? (
            <button type="button" className="vs-btn end" onClick={onEnd} aria-label={inCall ? 'End call' : 'Cancel'}>
              <span className="ic">{Icon.end}</span>
              <span>{inCall ? 'End' : 'Cancel'}</span>
            </button>
          ) : (
            <button type="button" className="vs-btn call" onClick={onCall} aria-label="Call a new stranger">
              <span className="ic">{Icon.phone}</span>
              <span>Call</span>
            </button>
          )}

          <button type="button" className="vs-btn" onClick={onSkip} disabled={!inCall} aria-label="Skip to next stranger">
            <span className="ic">{Icon.skip}</span>
            <span>Skip</span>
          </button>

          <button
            type="button"
            className={`vs-btn${isMuted ? ' on' : ''}`}
            onClick={onToggleMute}
            disabled={!inCall}
            aria-pressed={isMuted}
            aria-label={isMuted ? 'Unmute microphone' : 'Mute microphone'}
          >
            <span className="ic">{isMuted ? Icon.micOff : Icon.mic}</span>
            <span>{isMuted ? 'Unmute' : 'Mute'}</span>
          </button>

          <button
            type="button"
            className="vs-btn"
            onClick={() => setNaming((v) => !v)}
            disabled={!inCall}
            aria-label="Add friend"
          >
            <span className="ic">{Icon.userPlus}</span>
            <span>Add Friend</span>
          </button>

          <button
            type="button"
            className="vs-btn"
            onClick={onReport}
            disabled={!(inCall || phase === 'left')}
            aria-label="Report this user"
          >
            <span className="ic">{Icon.flag}</span>
            <span>Report</span>
          </button>
        </div>

        {naming && (
          <form className="vs-name" onSubmit={saveFriend}>
            <input
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              maxLength={20}
              placeholder="Any nickname (not a real name)"
              aria-label="Nickname for this stranger"
              autoFocus
            />
            <button type="submit" disabled={!nickname.trim()}>
              Save
            </button>
          </form>
        )}

        <div className="vs-row">
          <label className="vs-switch">
            <input
              type="checkbox"
              role="switch"
              checked={autoCall}
              onChange={onToggleAuto}
              aria-label="Auto connect to the next stranger"
            />
            <span className="track" aria-hidden="true">
              <span className="thumb" />
            </span>
            <span>Auto connect</span>
          </label>
          <span className="vs-sep" aria-hidden="true">|</span>
          <button type="button" className="vs-link" onClick={() => setFriendsOpen(true)}>
            Friends ({friends.length})
          </button>
        </div>

        {toast && <div className="vs-toast" role="status">{toast}</div>}
      </section>

      <aside className={`vs-chat${chatOpen ? ' open' : ''}`} aria-label="Chat">
        <div className="vs-chat-head">
          <span>Chat</span>
          <button type="button" className="vs-x" onClick={() => setChatOpen(false)} aria-label="Close chat">
            {Icon.close}
          </button>
        </div>
        <div className="vs-msgs" ref={scrollRef}>
          {messages.length === 0 && (
            <div className="vs-empty">
              {inCall ? 'Say hi to your stranger 👋' : 'Messages appear here once you are connected'}
            </div>
          )}
          {messages.map((m, i) => (
            <div key={m.id || i} className={`vs-msg ${m.from}`}>
              <span>{m.text}</span>
              <time>{m.time}</time>
            </div>
          ))}
          {isStrangerTyping && <div className="vs-typing">Stranger is typing…</div>}
        </div>
        <form className="vs-compose" onSubmit={submitDraft}>
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder={inCall ? 'Type a message…' : 'Connect to start chatting'}
            disabled={!inCall}
            maxLength={500}
            aria-label="Type a message"
          />
          <button type="submit" disabled={!inCall || !draft.trim()} aria-label="Send message">
            {Icon.send}
          </button>
        </form>
      </aside>

      <button type="button" className="vs-fab" onClick={() => setChatOpen(true)} aria-label="Open chat">
        {Icon.chat}
        {unread > 0 && <span className="vs-badge">{unread > 9 ? '9+' : unread}</span>}
      </button>

      {friendsOpen && (
        <div className="vs-overlay" onClick={() => setFriendsOpen(false)}>
          <div className="vs-modal" role="dialog" aria-label="Friends" onClick={(e) => e.stopPropagation()}>
            <div className="vs-chat-head">
              <span>Friends</span>
              <button type="button" className="vs-x" onClick={() => setFriendsOpen(false)} aria-label="Close">
                {Icon.close}
              </button>
            </div>
            <p className="vs-note">
              Nicknames are saved only on this device. Use any nickname you like, never a real name.
            </p>
            <ul className="vs-flist">
              {friends.length === 0 && <li className="vs-empty">No friends saved yet</li>}
              {friends.map((f) => (
                <li key={f.id}>
                  <span>{f.name}</span>
                  <button type="button" onClick={() => removeFriend(f.id)} aria-label={`Remove ${f.name}`}>
                    {Icon.close}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  )
}

const VS_CSS = `
.vs-root{flex:1;min-height:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:24px;padding:20px clamp(12px,3vw,32px);overflow-y:auto;position:relative}
@media(min-width:900px){.vs-root{flex-direction:row;align-items:center;justify-content:center;gap:48px}}
.vs-stage{display:flex;flex-direction:column;align-items:center;gap:16px;text-align:center;flex:0 1 440px;min-width:0;width:100%}
.vs-orb{position:relative;width:clamp(150px,34vw,230px);aspect-ratio:1;border-radius:50%;display:grid;place-items:center;color:#fff;font-family:var(--font-display);font-size:clamp(26px,6vw,40px);font-weight:700;letter-spacing:.5px;background:radial-gradient(circle at 30% 25%,color-mix(in srgb,var(--accent) 65%,#fff 35%),var(--accent));box-shadow:var(--shadow);transition:filter .3s,transform .3s}
.vs-orb.on{transform:scale(1.03)}
.vs-orb::before,.vs-orb::after{content:'';position:absolute;inset:0;border-radius:50%;border:2px solid var(--accent);opacity:0;pointer-events:none}
.vs-orb.live::before{animation:vsRing 2.4s ease-out infinite}
.vs-orb.live::after{animation:vsRing 2.4s ease-out 1.2s infinite}
@keyframes vsRing{0%{transform:scale(1);opacity:.5}100%{transform:scale(1.55);opacity:0}}
.vs-title{font-family:var(--font-display);font-size:clamp(18px,3vw,22px);font-weight:600;color:var(--text-1)}
.vs-sub{margin-top:4px;font-size:14px;color:var(--text-2);font-variant-numeric:tabular-nums}
.vs-controls{display:flex;flex-wrap:wrap;justify-content:center;gap:14px 12px}
.vs-btn{display:flex;flex-direction:column;align-items:center;gap:6px;min-width:62px;background:none;border:none;padding:0;color:var(--text-2);font:500 12px var(--font-body);cursor:pointer}
.vs-btn .ic{width:54px;height:54px;border-radius:50%;display:grid;place-items:center;background:var(--surface-1);border:1px solid var(--border-1);color:var(--text-1);transition:transform .15s,background .15s,border-color .15s}
.vs-btn:hover:not(:disabled) .ic{transform:translateY(-2px);border-color:var(--border-2)}
.vs-btn:active:not(:disabled) .ic{transform:scale(.94)}
.vs-btn:focus-visible .ic{outline:2px solid var(--accent);outline-offset:3px}
.vs-btn:disabled{opacity:.4;cursor:not-allowed}
.vs-btn.call .ic{width:62px;height:62px;background:#2e9e5b;border-color:transparent;color:#fff}
.vs-btn.end .ic{width:62px;height:62px;background:var(--danger,#e5484d);border-color:transparent;color:#fff}
.vs-btn.on .ic{background:var(--accent);border-color:transparent;color:#fff}
.vs-row{display:flex;align-items:center;justify-content:center;gap:12px;flex-wrap:wrap;font-size:13px;color:var(--text-2)}
.vs-sep{opacity:.5}
.vs-link{background:none;border:none;color:var(--text-1);text-decoration:underline;font:inherit;cursor:pointer;padding:4px}
.vs-switch{display:inline-flex;align-items:center;gap:8px;cursor:pointer;position:relative}
.vs-switch input{position:absolute;opacity:0;width:1px;height:1px}
.vs-switch .track{width:38px;height:22px;border-radius:999px;background:var(--surface-1);border:1px solid var(--border-2);position:relative;transition:background .2s}
.vs-switch .thumb{position:absolute;top:2px;left:2px;width:16px;height:16px;border-radius:50%;background:var(--text-2);transition:transform .2s,background .2s}
.vs-switch input:checked + .track{background:var(--accent);border-color:transparent}
.vs-switch input:checked + .track .thumb{transform:translateX(16px);background:#fff}
.vs-switch input:focus-visible + .track{outline:2px solid var(--accent);outline-offset:2px}
.vs-name{display:flex;gap:8px;width:100%;max-width:320px}
.vs-name input,.vs-compose input{flex:1;min-width:0;padding:10px 14px;border-radius:var(--radius-pill);border:1px solid var(--border-1);background:var(--surface-1);color:var(--text-1);font:14px var(--font-body)}
.vs-name button{padding:0 16px;border-radius:var(--radius-pill);border:none;background:var(--accent);color:#fff;font-weight:600;cursor:pointer}
.vs-name button:disabled{opacity:.5;cursor:not-allowed}
.vs-pill{padding:8px 16px;border-radius:var(--radius-pill);border:1px solid var(--border-2);background:var(--surface-1);color:var(--text-1);cursor:pointer;font-size:13px}
.vs-toast{padding:8px 14px;border-radius:var(--radius-pill);background:var(--surface-1);border:1px solid var(--border-1);color:var(--text-1);font-size:13px}
.vs-chat{display:flex;flex-direction:column;flex:0 1 460px;width:100%;min-width:0;height:min(540px,70dvh);background:var(--surface-1);border:1px solid var(--border-1);border-radius:var(--radius-lg);overflow:hidden}
.vs-chat-head{display:flex;align-items:center;justify-content:space-between;padding:12px 16px;border-bottom:1px solid var(--border-1);font:600 15px var(--font-display);color:var(--text-1)}
.vs-x{display:none;background:none;border:none;color:var(--text-2);cursor:pointer;padding:4px}
.vs-modal .vs-x{display:inline-flex}
.vs-msgs{flex:1;overflow-y:auto;padding:14px;display:flex;flex-direction:column;gap:8px}
.vs-empty{margin:auto;color:var(--text-2);font-size:13px;text-align:center;padding:12px}
.vs-msg{max-width:80%;padding:8px 12px;border-radius:16px;font-size:14px;line-height:1.4;word-break:break-word;display:flex;flex-direction:column;gap:2px}
.vs-msg time{font-size:10px;opacity:.6}
.vs-msg.me{align-self:flex-end;background:var(--accent);color:#fff;border-bottom-right-radius:4px}
.vs-msg.stranger{align-self:flex-start;background:var(--bg-0);border:1px solid var(--border-1);color:var(--text-1);border-bottom-left-radius:4px}
.vs-msg.system,.vs-msg.system_warning{align-self:center;background:none;color:var(--text-2);font-size:12px;text-align:center}
.vs-msg.system_warning{color:var(--danger,#e5484d)}
.vs-typing{font-size:12px;color:var(--text-2)}
.vs-compose{display:flex;gap:8px;padding:10px;border-top:1px solid var(--border-1)}
.vs-compose button{width:42px;height:42px;border-radius:50%;border:none;background:var(--accent);color:#fff;display:grid;place-items:center;cursor:pointer;flex-shrink:0}
.vs-compose button:disabled,.vs-compose input:disabled{opacity:.5;cursor:not-allowed}
.vs-fab{display:none;position:fixed;right:16px;bottom:calc(20px + env(safe-area-inset-bottom));width:56px;height:56px;border-radius:50%;border:none;background:var(--accent);color:#fff;place-items:center;box-shadow:var(--shadow);cursor:pointer;z-index:30}
.vs-badge{position:absolute;top:-2px;right:-2px;min-width:20px;height:20px;padding:0 5px;border-radius:999px;background:var(--danger,#e5484d);color:#fff;font:700 11px/20px var(--font-body);text-align:center}
.vs-overlay{position:fixed;inset:0;background:rgba(0,0,0,.5);display:grid;place-items:center;padding:16px;z-index:60}
.vs-modal{width:100%;max-width:380px;max-height:80dvh;display:flex;flex-direction:column;background:var(--bg-0);border:1px solid var(--border-1);border-radius:var(--radius-lg);overflow:hidden}
.vs-note{margin:0;padding:10px 16px 0;font-size:12px;color:var(--text-2)}
.vs-flist{list-style:none;margin:0;padding:10px 12px 14px;overflow-y:auto;display:flex;flex-direction:column;gap:6px}
.vs-flist li{display:flex;align-items:center;justify-content:space-between;padding:8px 12px;border-radius:12px;background:var(--surface-1);border:1px solid var(--border-1);color:var(--text-1);font-size:14px}
.vs-flist li.vs-empty{justify-content:center;border:none;background:none;color:var(--text-2)}
.vs-flist button{background:none;border:none;color:var(--text-2);cursor:pointer;display:inline-flex}
@media(max-width:899px){
  .vs-chat{position:fixed;left:0;right:0;bottom:0;width:auto;height:min(72dvh,540px);border-radius:var(--radius-lg) var(--radius-lg) 0 0;transform:translateY(105%);visibility:hidden;transition:transform .28s cubic-bezier(.2,.8,.2,1),visibility 0s .28s;z-index:50;box-shadow:0 -12px 40px rgba(0,0,0,.35);padding-bottom:env(safe-area-inset-bottom)}
  .vs-chat.open{transform:none;visibility:visible;transition:transform .28s cubic-bezier(.2,.8,.2,1)}
  .vs-fab{display:grid}
  .vs-x{display:inline-flex}
}
@media(prefers-reduced-motion:reduce){
  .vs-orb.live::before,.vs-orb.live::after{animation:none}
  .vs-chat,.vs-btn .ic,.vs-orb{transition:none}
}
`
