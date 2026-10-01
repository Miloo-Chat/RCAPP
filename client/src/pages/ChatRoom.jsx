// client/src/pages/ChatRoom.jsx
//
// Rewrite scope (per user request):
//   1. Direct-CTA integration with App.jsx routing props
//      (mood, intent, safeMode, chatMode, theme, onToggleTheme, onExit).
//   2. Milo 2.0 adaptive activation timer — 8s for text, 15s for video
//      (per MILOO_MILO_2_0_DESIGN.md §F1).
//   3. WebRTC peer connection with `iceconnectionstatechange`
//      monitoring (per MILOO_MILO_2_0_DATA_FLOW.md §1).
//
// Gaps to backend (intentionally NOT in this file):
//   - The /api/milo endpoint and the LLM call are not exposed by the
//     current server/index.js. The persona picker and activation timer
//     work; the network call to /api/milo would need to be wired up
//     alongside the backend changes in
//     MILOO_MILO_2_0_IMPLEMENTATION_PLAN.md Day 1.
//   - PERSONAS + getStoredPersona/setStoredPersona from analytics.js
//     (impl plan Step 2.1) are mirrored as local constants to keep
//     this file self-contained. Hoist them into analytics.js when the
//     backend lands.

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { io as socketIO } from 'socket.io-client'
import Logo from '../components/Logo'
import ThemeToggle from '../components/ThemeToggle'

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const SERVER =
  (typeof import.meta !== 'undefined' &&
    import.meta.env &&
    import.meta.env.VITE_SERVER_URL) ||
  (typeof window !== 'undefined'
    ? window.location.origin.replace(/:\d+$/, ':5055')
    : 'http://localhost:5055') ||
  'http://localhost:5055'

const MILO_TRIGGER_TEXT = 8 // F1
const MILO_TRIGGER_VIDEO = 15 // F1
const HANDOFF_GRACE_MS = 1800 // F4
const STRIKE_WINDOW_MS = 60000 // §4 Resilience
const STRIKE_LIMIT = 3

// STUN + TURN config. STUN alone only works on open/simple networks —
// TURN is required for mobile data / NAT / college-WiFi style networks
// where direct peer-to-peer connections get blocked.
const METERED_API_KEY = import.meta.env.VITE_METERED_API_KEY || '0a59d59716c0099d36877a25e50a65cf8e2a'

async function fetchIceServers() {
  try {
    const res = await fetch(
      `https://miloo-chat.metered.live/api/v1/turn/credentials?apiKey=${METERED_API_KEY}`
    )
    const servers = await res.json()
    if (Array.isArray(servers) && servers.length > 0) return servers
  } catch (e) {
    console.warn('TURN fetch failed, using STUN only', e)
  }
  return [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
  ]
}

// Placeholder — will be replaced dynamically before RTCPeerConnection
const ICE_SERVERS = [
  { urls: 'stun:stun.l.google.com:19302' },
  { urls: 'stun:stun1.l.google.com:19302' },
  {
    urls: 'turn:openrelay.metered.ca:443?transport=tcp',
    username: 'openrelayproject',
    credential: 'openrelayproject',
  },
]

// ---------------------------------------------------------------------------
// Local persona + analytics helpers
// ---------------------------------------------------------------------------

const PERSONA_STORAGE_KEY = 'miloo_persona'

const PERSONAS = [
  { id: 'milo', label: 'Milo', emoji: '🤗', blurb: 'Warm & supportive' },
  { id: 'mira', label: 'Mira', emoji: '😏', blurb: 'Playful & cheeky' },
  { id: 'jax', label: 'Jax', emoji: '🧊', blurb: 'Dry & brief' },
]

const MATCH_KF = `
@keyframes milooPulseRing {
  0% { transform: scale(0.2); opacity: 0.8; }
  50% { opacity: 0.4; }
  100% { transform: scale(1.8); opacity: 0; }
}
@keyframes milooMsgIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}

@media (prefers-reduced-motion: reduce) {
  .pulse-ring {
    animation: none !important;
    transform: scale(1) !important;
    opacity: 0.15 !important;
  }
}

.video-split-stage {
  position: relative;
  flex: 1;
  width: 100%;
  height: 100%;
  min-height: 0;
  overflow: hidden;
  border-radius: var(--radius-lg);
  border: 1px solid var(--border-1);
}
@media (max-width: 480px) {
  .video-split-stage {
    border-radius: 0;
    border: none;
  }
}

/* Remote video dominates */
.video-feed-remote {
  position: absolute;
  inset: 0;
  background: #000;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

/* Local view corner PiP */
.video-feed-local {
  position: absolute;
  top: 16px;
  right: 16px;
  width: 100px;
  aspect-ratio: 3/4;
  background: #000;
  border-radius: var(--radius-md);
  overflow: hidden;
  box-shadow: 0 8px 32px rgba(0,0,0,0.2);
  border: 1px solid rgba(255, 255, 255, 0.12);
  z-index: 10;
}
@media (min-width: 900px) {
  .video-feed-local {
    top: 24px;
    right: 24px;
    width: 220px;
    aspect-ratio: 16/9;
    border-radius: var(--radius-lg);
  }
}

.video-chat-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
  overflow: hidden;
  position: relative;
}
.video-stage-wrapper {
  flex: 1 1 100%;
  min-height: 0;
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
.video-chat-panel {
  position: absolute;
  bottom: 80px;
  left: 16px;
  width: 320px;
  max-height: 50%;
  background: rgba(30, 28, 26, 0.4);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: var(--radius-lg);
  display: flex;
  flex-direction: column;
  z-index: 20;
  overflow: hidden;
}

.mobile-chat-toggle {
  display: none;
}
.mobile-chat-close-btn {
  display: none;
}

@media (max-width: 480px) {
  .video-chat-panel {
    bottom: 0;
    left: 0;
    right: 0;
    width: 100%;
    height: 60%;
    max-height: 70%;
    z-index: 30;
    background: var(--rd-surface);
    backdrop-filter: none;
    -webkit-backdrop-filter: none;
    border: 1px solid var(--border-1);
    border-bottom: none;
    border-radius: var(--radius-lg) var(--radius-lg) 0 0;
    box-shadow: 0 -8px 32px rgba(0, 0, 0, 0.5);
    transform: translateY(105%);
    opacity: 0;
    pointer-events: none;
    transition: transform 0.3s cubic-bezier(0.2, 0.8, 0.2, 1), opacity 0.3s ease;
  }
  .video-chat-panel.mobile-open {
    transform: translateY(0);
    opacity: 1;
    pointer-events: auto;
  }
  .mobile-chat-toggle {
    display: flex;
    position: absolute;
    bottom: max(24px, env(safe-area-inset-bottom));
    right: 16px;
    z-index: 30;
    background: rgba(0, 0, 0, 0.65);
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
    border: 1px solid rgba(255, 255, 255, 0.15);
    border-radius: var(--radius-pill);
    color: #fff;
    font-size: 13px;
    font-weight: 600;
    padding: 10px 20px;
    cursor: pointer;
    align-items: center;
    gap: 6px;
  }
  .mobile-chat-close-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    background: transparent;
    border: none;
    color: var(--text-2);
    font-size: 16px;
    cursor: pointer;
    padding: 4px 8px;
    border-radius: var(--radius-pill);
  }
}

.ome-control-bar-overlay {
  position: absolute;
  bottom: 28px;
  left: 0;
  right: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  z-index: 25;
  padding: 8px 12px;
  opacity: 0;
  visibility: hidden;
  transition: opacity 0.5s ease 3s, visibility 0s linear 3.5s;
  pointer-events: none;
}
.video-chat-container:hover .ome-control-bar-overlay,
.video-chat-container:active .ome-control-bar-overlay,
.ome-control-bar-overlay:hover,
.ome-control-bar-overlay:focus-within {
  opacity: 1;
  visibility: visible;
  transition: opacity 0.2s ease 0s, visibility 0s linear 0s;
  pointer-events: auto;
}
.ome-control-bar-overlay > div {
  width: auto !important;
  gap: 12px !important;
  padding: 0 !important;
  pointer-events: auto;
}
.ome-control-bar-overlay button {
  flex: none !important;
  width: 96px !important;
  border-radius: var(--radius-pill) !important;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.35);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
}
.ome-control-bar-overlay button:first-of-type {
  background: rgba(0, 0, 0, 0.6) !important;
  border-color: rgba(255, 255, 255, 0.15) !important;
  color: #fff !important;
}
.ome-control-bar-overlay button:first-of-type:hover {
  background: rgba(0, 0, 0, 0.8) !important;
  border-color: rgba(255, 255, 255, 0.3) !important;
}

@media (max-width: 480px) {
  .ome-control-bar-overlay {
    bottom: max(24px, env(safe-area-inset-bottom));
  }
}

.ome-control-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 64px;
  height: 64px;
  border-radius: var(--radius-md);
  border: 1px solid var(--border-1);
  background: var(--surface-2);
  color: var(--text-1);
  gap: 4px;
  cursor: pointer;
  transition: transform var(--ease), background var(--ease), border-color var(--ease), box-shadow var(--ease);
  user-select: none;
}
.ome-control-btn:hover {
  background: var(--surface-3);
  transform: translateY(-2px);
  border-color: var(--border-2);
}
.ome-control-btn:active {
  transform: scale(0.95);
}
.ome-control-btn.ome-next-btn {
  background: var(--gradient-cta);
  border: none;
  color: var(--accent-text);
  box-shadow: var(--accent-glow);
}
.ome-control-btn.ome-next-btn:hover {
  background: var(--gradient-cta-hover);
  box-shadow: var(--accent-glow-soft);
}
.ome-control-btn.ome-stop-btn {
  background: var(--surface-2);
  color: var(--text-2);
}
.ome-control-btn.ome-stop-btn:hover {
  color: var(--text-1);
  border-color: var(--border-2);
}
.ome-control-label {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.02em;
}
`

const MOOD_OPENERS = {
  vent: "I'm here, take your time. What's on your mind?",
  laugh: "okay be honest — worst joke you know. go.",
  deep: "what have you been thinking about a lot lately?",
  music: "if your week had a soundtrack, what's the first song?",
  gaming: "controller or keyboard? settle this once and for all.",
  culture: "where are you from and what's underrated about it?",
  any: "what's your vibe tonight?",
}

const GOODBYE_BY_PERSONA = {
  milo: 'It was fun talking! Bye 👋',
  mira: 'okay go have fun, weirdo 😏',
  jax: "alright, real human's here. don't embarrass me.",
}

function getStoredPersona() {
  try {
    return localStorage.getItem(PERSONA_STORAGE_KEY) || null
  } catch {
    return null
  }
}
function setStoredPersona(p) {
  try {
    localStorage.setItem(PERSONA_STORAGE_KEY, p)
  } catch {
    /* no-op */
  }
}

function trackEvent(name, params = {}) {
  try {
    if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
      window.gtag('event', name, params)
    }
  } catch {
    /* no-op */
  }
}

function moodOpener(m) {
  return MOOD_OPENERS[m] || "hey! what's up? 😊"
}

function nowTime() {
  return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

function getFingerprint() {
  try {
    return (
      localStorage.getItem('miloo_fp') || 'fp_' + Math.random().toString(36).slice(2, 10)
    )
  } catch {
    return 'fp_anon'
  }
}

const EASE = 'cubic-bezier(0.2, 0.8, 0.2, 1)'

export default function ChatRoom({
  mood = 'any',
  intent = 'random',
  chatMode = 'text',
  theme = 'dark',
  onToggleTheme,
  onExit,
}) {
  const isVideo = chatMode === 'video'

  const [status, setStatus] = useState(isVideo ? 'pre_permission' : 'text_connecting')
  const [matchSeconds, setMatchSeconds] = useState(0)
  const [iceState, setIceState] = useState('new')
  const [isStrangerTyping, setIsStrangerTyping] = useState(false)
  const [remoteStreamVersion, setRemoteStreamVersion] = useState(0)
  const [localStreamReady, setLocalStreamReady] = useState(false)
  const [partnerId, setPartnerId] = useState(null)
  const [messages, setMessages] = useState([])

  const [miloActive, setMiloActive] = useState(false)
  const [miloMessages, setMiloMessages] = useState([])
  const [miloTyping, setMiloTyping] = useState(false)
  const [persona, setPersona] = useState(() => getStoredPersona() || 'milo')
  const [showPersonaPicker, setShowPersonaPicker] = useState(() => !getStoredPersona())
  const [miloCapped, setMiloCapped] = useState(false)
  const [miloInput, setMiloInput] = useState('')
  const miloInputRef = useRef(null)
  const miloMessageIndexRef = useRef(0)

  const socketRef = useRef(null)
  const pcRef = useRef(null)
  const localStreamRef = useRef(null)
  const remoteStreamRef = useRef(null)
  const miloActiveRef = useRef(false)
  const partnerIdRef = useRef(null)
  const chatModeRef = useRef(chatMode)
  const moodRef = useRef(mood)
  const personaRef = useRef(persona)
  const matchSecondsRef = useRef(0)
  const waitingTimerRef = useRef(null)
  const handoffTimerRef = useRef(null)
  const autoNextTimerRef = useRef(null)
  const hasJoinedRef = useRef(false)
  const pendingIceCandidatesRef = useRef([])
  const miloScrollRef = useRef(null)
  const msgScrollRef = useRef(null)

  useEffect(() => {
    miloActiveRef.current = miloActive
  }, [miloActive])
  useEffect(() => {
    partnerIdRef.current = partnerId
  }, [partnerId])
  useEffect(() => {
    chatModeRef.current = chatMode
  }, [chatMode])
  useEffect(() => {
    moodRef.current = mood
  }, [mood])
  useEffect(() => {
    personaRef.current = persona
  }, [persona])
  useEffect(() => {
    matchSecondsRef.current = matchSeconds
  }, [matchSeconds])

  // ── Auto-scroll message lists ──
  useEffect(() => {
    if (miloScrollRef.current) {
      miloScrollRef.current.scrollTop = miloScrollRef.current.scrollHeight
    }
  }, [miloMessages, miloTyping])
  useEffect(() => {
    if (msgScrollRef.current) {
      msgScrollRef.current.scrollTop = msgScrollRef.current.scrollHeight
    }
  }, [messages])

  // ── Adaptive activation timer (Milo 2.0 §F1) ──
  useEffect(() => {
    if (status !== 'waiting') return undefined
    waitingTimerRef.current = setInterval(() => {
      setMatchSeconds((prev) => {
        const next = prev + 1
        const trigger =
          chatModeRef.current === 'text' ? MILO_TRIGGER_TEXT : MILO_TRIGGER_VIDEO
        if (next >= trigger && !miloActiveRef.current && !partnerIdRef.current) {
          activateMilo()
        }
        return next
      })
    }, 1000)
    return () => {
      if (waitingTimerRef.current) clearInterval(waitingTimerRef.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status])

  const activateMilo = useCallback(() => {
    setMiloActive(true)
    miloActiveRef.current = true
    const opener = moodOpener(moodRef.current)
    setMiloMessages([{ role: 'assistant', content: opener, time: nowTime() }])
    trackEvent('milo_2_activated', {
      waitSeconds: matchSecondsRef.current,
      mode: chatModeRef.current,
      mood: moodRef.current,
      persona: personaRef.current,
    })
  }, [])

  const choosePersona = useCallback((p) => {
    setPersona(p)
    setStoredPersona(p)
    setShowPersonaPicker(false)
    trackEvent('milo_2_persona_chosen', { persona: p })
  }, [])

  const sendMiloMessage = useCallback(() => {
    const text = miloInputRef.current ? miloInputRef.current.value : miloInput
    const trimmed = (text || '').trim()
    if (!trimmed) return
    const time = nowTime()
    setMiloMessages((prev) => [...prev, { role: 'user', content: trimmed, time }])
    setMiloInput('')
    if (miloInputRef.current) miloInputRef.current.value = ''
    miloMessageIndexRef.current += 1
    trackEvent('milo_2_message_sent', {
      messageLength: trimmed.length,
      sessionMessageIndex: miloMessageIndexRef.current,
    })
    const sock = socketRef.current
    if (sock && typeof sock.emit === 'function' && sock.connected) {
      try {
        sock.emit('milo_chat_message', {
          fingerprint: getFingerprint(),
          text: trimmed,
        })
      } catch (err) {
        trackEvent('milo_emit_failed', { error: String(err && err.message) })
      }
    }
  }, [miloInput])

  // ── WebRTC helpers ──
  const teardownWebRTC = useCallback((stopLocalStream = false) => {
    try {
      if (pcRef.current) {
        pcRef.current.getSenders().forEach((s) => {
          try {
            if (s.track && typeof s.track.stop === 'function') s.track.stop()
          } catch {
            /* no-op */
          }
        })
        pcRef.current.close()
      }
    } catch {
      /* no-op */
    }
    pcRef.current = null
    // Only stop local camera stream on full exit, NOT on skip
    // so camera stays active between matches
    if (stopLocalStream && localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((t) => t.stop())
      localStreamRef.current = null
      setLocalStreamReady(false)
    }
    remoteStreamRef.current = null
    setRemoteStreamVersion((v) => v + 1)
    setIceState('new')
  }, [])

  const setupWebRTC = useCallback(async (remotePartnerId, isInitiator) => {
    if (pcRef.current) {
      try {
        pcRef.current.close()
      } catch {
        /* no-op */
      }
      pcRef.current = null
      remoteStreamRef.current = null
    }
    pendingIceCandidatesRef.current = []
    const iceServers = await fetchIceServers()
    const pc = new RTCPeerConnection({ iceServers })
    pcRef.current = pc
    // Flush any signals that arrived before pcRef was ready
    const buffered = pendingIceCandidatesRef.current.splice(0)
    buffered.forEach(sig => {
      if (sig.type === 'offer' || sig.type === 'answer' || sig.type === 'ice') {
        handleWebRTCSignal(sig)
      }
    })

    const checkAndSetConnected = (pcInst) => {
      setStatus((prevStatus) => {
        if (prevStatus !== 'waiting' && prevStatus !== 'connecting') return prevStatus
        const ice = pcInst.iceConnectionState
        const conn = pcInst.connectionState
        const isIceActive = ice === 'connected' || ice === 'completed'
        const isConnActive = conn === 'connected'
        const hasRemoteTrack = Boolean(
          remoteStreamRef.current && remoteStreamRef.current.getTracks().length > 0
        )
        if (hasRemoteTrack && (isIceActive || isConnActive)) {
          return 'connected'
        }
        return prevStatus
      })
    }

    pc.addEventListener('iceconnectionstatechange', () => {
      const s = pc.iceConnectionState
      setIceState(s)
      if (s === 'failed' || s === 'disconnected' || s === 'closed') {
        trackEvent('webrtc_ice_state', { state: s })
      }
      checkAndSetConnected(pc)
    })

    pc.addEventListener('connectionstatechange', () => {
      checkAndSetConnected(pc)
    })

    pc.addEventListener('icecandidate', (e) => {
      if (!e || !e.candidate) return
      const sock = socketRef.current
      if (!sock || !remotePartnerId) return
      try {
        sock.emit('webrtc_signal', {
          to: remotePartnerId,
          type: 'ice',
          candidate: e.candidate,
        })
      } catch (err) {
        trackEvent('ice_emit_failed', { error: String(err && err.message) })
      }
    })

    pc.addEventListener('track', (e) => {
      console.log('[WebRTC] ontrack fired', e.track?.kind, 'streams:', e.streams?.length)
      if (!remoteStreamRef.current) {
        remoteStreamRef.current = new MediaStream()
      }
      if (e.streams && e.streams[0]) {
        e.streams[0].getTracks().forEach((t) => {
          console.log('[WebRTC] adding track:', t.kind, 'enabled:', t.enabled, 'readyState:', t.readyState)
          if (!remoteStreamRef.current.getTracks().some((existing) => existing.id === t.id)) {
            remoteStreamRef.current.addTrack(t)
          }
        })
      } else if (e.track) {
        console.log('[WebRTC] adding single track:', e.track.kind)
        if (!remoteStreamRef.current.getTracks().some((existing) => existing.id === e.track.id)) {
          remoteStreamRef.current.addTrack(e.track)
        }
      }
      console.log('[WebRTC] remoteStream tracks:', remoteStreamRef.current.getTracks().length)
      setRemoteStreamVersion((v) => v + 1)
      checkAndSetConnected(pc)
    })

    // Restart any ended tracks before adding to new peer connection
    if (localStreamRef.current) {
      const endedTracks = localStreamRef.current.getTracks().filter(t => t.readyState === 'ended')
      if (endedTracks.length > 0) {
        console.log('[WebRTC] restarting ended tracks, count:', endedTracks.length)
        try {
          const freshStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true })
          localStreamRef.current.getTracks().forEach(t => t.stop())
          localStreamRef.current = freshStream
          setLocalStreamReady(false)
          setTimeout(() => setLocalStreamReady(true), 50)
        } catch (e) {
          console.warn('[WebRTC] failed to restart camera', e)
        }
      }
    }
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((t) => pc.addTrack(t, localStreamRef.current))
    }

    if (isInitiator) {
      pc.createOffer()
        .then((offer) => pc.setLocalDescription(offer))
        .then(() => {
          if (socketRef.current) {
            socketRef.current.emit('webrtc_signal', {
              to: remotePartnerId,
              type: 'offer',
              sdp: pc.localDescription,
            })
          }
        })
        .catch(() => {
          /* ICE state watcher will surface a failure */
        })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleWebRTCSignal = useCallback((data) => {
    if (!data) return
    const pc = pcRef.current
    if (!pc) {
      // Buffer the signal — setupWebRTC may not be ready yet
      console.warn('[Signal] pcRef.current is null, buffering signal', data.type)
      pendingIceCandidatesRef.current.push(data)
      return
    }
    console.log('[Signal] received', data.type, 'pc state:', pc.signalingState)
    if (data.type === 'offer' && data.sdp) {
      pc.setRemoteDescription(new RTCSessionDescription(data.sdp))
        .then(() => flushPendingIceCandidates(pc))
        .then(() => pc.createAnswer())
        .then((answer) => pc.setLocalDescription(answer))
        .then(() => {
          if (socketRef.current) {
            socketRef.current.emit('webrtc_signal', {
              to: partnerIdRef.current,
              type: 'answer',
              sdp: pc.localDescription,
            })
          }
        })
        .catch((err) => {
          console.error('[Signal] offer handling failed:', err)
        })
    } else if (data.type === 'answer' && data.sdp) {
      pc.setRemoteDescription(new RTCSessionDescription(data.sdp))
        .then(() => flushPendingIceCandidates(pc))
        .catch(() => {
          /* ignore */
        })
    } else if (data.type === 'ice' && data.candidate) {
      if (pc.remoteDescription && pc.remoteDescription.type) {
        pc.addIceCandidate(new RTCIceCandidate(data.candidate)).catch(() => {
          /* ignore */
        })
      } else {
        pendingIceCandidatesRef.current.push(data.candidate)
      }
    }
  }, [])

  function flushPendingIceCandidates(pc) {
    const queued = pendingIceCandidatesRef.current
    pendingIceCandidatesRef.current = []
    queued.forEach((candidate) => {
      pc.addIceCandidate(new RTCIceCandidate(candidate)).catch(() => {
        /* ignore */
      })
    })
  }

  // ── Socket lifecycle ──
  useEffect(() => {
    const sock = socketIO(SERVER, {
      transports: ['websocket', 'polling'],
      auth: { fingerprint: getFingerprint() },
    })
    socketRef.current = sock

    sock.on('connect', () => {
      if (hasJoinedRef.current) {
        return
      }
      hasJoinedRef.current = true
      if (chatModeRef.current === 'text') {
        sock.emit('find_match', {
          mood: moodRef.current,
          intent,
          mediaMode: chatModeRef.current,
          trustScore: 50,
        })
        setStatus('waiting')
      }
    })

    sock.on('match_found', (raw) => {
      if (autoNextTimerRef.current) clearTimeout(autoNextTimerRef.current)
      const payload = raw && typeof raw === 'object' ? raw : {}
      const pid = typeof payload.partnerId === 'string' ? payload.partnerId : null
      const initiator = !!payload.initiator
      setMessages([])
      if (miloActiveRef.current && pid) {
        const bye = GOODBYE_BY_PERSONA[personaRef.current] || GOODBYE_BY_PERSONA.milo
        setMiloMessages((prev) => [...prev, { role: 'assistant', content: bye, time: nowTime() }])
        trackEvent('milo_2_handoff_completed', {
          miloMessagesExchanged: miloMessageIndexRef.current,
          totalWaitSeconds: matchSecondsRef.current,
          mode: chatModeRef.current,
        })
        if (handoffTimerRef.current) clearTimeout(handoffTimerRef.current)
        handoffTimerRef.current = setTimeout(() => {
          setMiloActive(false)
          miloActiveRef.current = false
          setPartnerId(pid)
          partnerIdRef.current = pid
          if (chatModeRef.current === 'text') setStatus('text_chat')
        }, HANDOFF_GRACE_MS)
      } else {
        setPartnerId(pid)
        partnerIdRef.current = pid
        if (chatModeRef.current === 'text') setStatus('text_chat')
      }

      if (chatModeRef.current === 'video' && pid && typeof pid === 'string') {
        // If localStream was lost (e.g. after skip), re-request camera before WebRTC
        const startWebRTC = async () => {
          try {
            if (!localStreamRef.current) {
              const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true })
              localStreamRef.current = stream
              setLocalStreamReady(true)
            }
            await setupWebRTC(pid, !!initiator)
          } catch (err) {
            trackEvent('webrtc_setup_failed', { error: String(err && err.message) })
            setStatus('cam_error')
          }
        }
        startWebRTC()
      }
    })

    sock.on('webrtc_signal', (data) => {
      handleWebRTCSignal(data)
    })

    sock.on('partner_left', () => {
      setStatus('partner_left')
      setIsStrangerTyping(false)
      teardownWebRTC()
      if (autoNextTimerRef.current) clearTimeout(autoNextTimerRef.current)
      autoNextTimerRef.current = setTimeout(() => {
        setStatus('waiting')
        setMatchSeconds(0)
        if (socketRef.current) {
          socketRef.current.emit('find_match', {
            mood: moodRef.current,
            intent,
            mediaMode: chatModeRef.current,
            trustScore: 50,
          })
        }
      }, 1500)
    })

    sock.on('receive_message', (data) => {
      const text = data && typeof data.text === 'string' ? data.text : ''
      if (!text) return
      setIsStrangerTyping(false)
      setMessages((prev) => [...prev, { from: 'stranger', text, time: nowTime() }])
    })

    sock.on('stranger_typing', (isTyping) => {
      setIsStrangerTyping(isTyping)
    })
    sock.on('slow_down', ({ remainSec }) => {
      setStatus('slow_down')
      if (handoffTimerRef.current) clearTimeout(handoffTimerRef.current)
      handoffTimerRef.current = setTimeout(() => {
        sock.emit('find_match', {
          mood: moodRef.current,
          intent,
          mediaMode: chatModeRef.current,
          trustScore: 50,
        })
        setStatus('waiting')
        setMatchSeconds(0)
      }, (remainSec || 5) * 1000)
    })

    sock.on('server_busy', () => setStatus('busy'))
    sock.on('queue_timeout', () => setStatus('busy'))
    sock.on('milo_response', (data) => {
      const reply =
        (data && typeof data.reply === 'string' && data.reply) ||
        'hmm, lost my train of thought — try again?'
      setMiloTyping(false)
      setMiloMessages((prev) =>
        Array.isArray(prev) ? [...prev, { role: 'assistant', content: reply, time: nowTime() }] : [{ role: 'assistant', content: reply, time: nowTime() }]
      )
    })
    sock.on('milo_system_message', (data) => {
      const text =
        (data && typeof data.text === 'string' && data.text) ||
        'Milo is pausing for a bit so you can focus on the real people here. Try Find someone again ✨'
      setMiloMessages((prev) =>
        Array.isArray(prev) ? [...prev, { role: 'assistant', content: text, time: nowTime() }] : [{ role: 'assistant', content: text, time: nowTime() }]
      )
      setMiloCapped(true)
      setMiloTyping(false)
    })
    sock.on('spam_detected', () => {
      setMiloTyping(false)
    })
    sock.on('disconnect', () => {
      /* handled by cleanup */
    })

    return () => {
      try { sock.disconnect() } catch { /* no-op */ }
      socketRef.current = null
      teardownWebRTC(true)
      if (waitingTimerRef.current) clearInterval(waitingTimerRef.current)
      if (handoffTimerRef.current) clearTimeout(handoffTimerRef.current)
      if (autoNextTimerRef.current) clearTimeout(autoNextTimerRef.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const requestCamera = useCallback(async () => {
    trackEvent('camera_permission_requested')
    try {
      setStatus('connecting')
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      localStreamRef.current = stream
      setLocalStreamReady(true)
      setStatus('waiting')
      trackEvent('camera_permission_granted')
      const sock = socketRef.current
      if (sock) {
        sock.emit('find_match', {
          mood: moodRef.current,
          intent,
          mediaMode: chatModeRef.current,
          trustScore: 50,
        })
      }
    } catch (err) {
      trackEvent('camera_permission_denied', { error: String(err && err.name) })
      setStatus('cam_error')
    }
  }, [intent])

  const sendText = useCallback((text) => {
    const trimmed = (text || '').trim()
    if (!trimmed) return
    const sock = socketRef.current
    if (!sock || typeof sock.emit !== 'function') return
    const pid = partnerIdRef.current
    if (!pid) {
      setMessages((prev) => [
        ...prev,
        { from: 'system', text: 'Still searching for a match — hang tight ✨', time: nowTime() },
      ])
      return
    }
    try {
      sock.emit('send_message', { text: trimmed, to: pid })
      setMessages((prev) => [...prev, { from: 'me', text: trimmed, time: nowTime() }])
    } catch (err) {
      trackEvent('send_message_failed', { error: String(err && err.message) })
    }
  }, [])

  const waitingHint = useMemo(() => {
    if (miloActive) return 'Milo is here to keep you company while you wait ✨'
    if (matchSeconds < 8) return "Looking for someone who's up for a chat..."
    if (matchSeconds < 20) return 'Hang tight — most matches happen in under 30s.'
    return 'Still searching. Want to try text-only? It usually pairs faster.'
  }, [miloActive, matchSeconds])

  const findNext = useCallback(() => {
    teardownWebRTC(false)
    setStatus('waiting')
    setIsStrangerTyping(false)
    setMatchSeconds(0)
    setMessages([])
    remoteStreamRef.current = null
    setRemoteStreamVersion((v) => v + 1)
    if (socketRef.current) {
      socketRef.current.emit('find_match', {
        mood: moodRef.current,
        intent,
        mediaMode: chatModeRef.current,
        trustScore: 50,
      })
    }
  }, [intent, teardownWebRTC])

  // ── Render ──
  return (
    <>
      <style>{MATCH_KF}</style>
      <div
        className="chat-room"
        style={{
          background: 'var(--bg-0)',
          color: 'var(--text-1)',
        }}
      >
        {/* ── Top bar ── */}
        <header
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 6,
            padding: '10px clamp(10px, 3vw, 20px)',
            borderBottom: '1px solid var(--border-1)',
            background: 'var(--bg-0)',
            flexShrink: 0,
          }}
        >
          <button
            onClick={onExit}
            aria-label="Exit chat"
            className="compact"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '8px 12px',
              borderRadius: 'var(--radius-pill)',
              background: 'var(--surface-1)',
              border: '1px solid var(--border-1)',
              color: 'var(--text-2)',
              fontSize: 13,
              fontWeight: 600,
            }}
          >
            <span aria-hidden="true">←</span>
            <span>Exit</span>
          </button>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              fontSize: 13,
              fontFamily: 'var(--font-body)',
              fontWeight: 500,
              color: 'var(--rd-text-3)',
              whiteSpace: 'nowrap',
              flexShrink: 1,
              minWidth: 0,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                background: statusDotColor(status, iceState),
                opacity: 0.85,
                flexShrink: 0,
              }}
              aria-hidden="true"
            />
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{statusLabel(status, iceState, isVideo, mood)}</span>
          </div>

          <ThemeToggle theme={theme} onToggle={onToggleTheme} />
        </header>

        {/* ── Main body ── */}
        <main
          style={{
            flex: 1,
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            minHeight: 0,
          }}
        >
          {(status === 'pre_permission' || status === 'connecting') && (
            <PrePermissionView
              onAllow={requestCamera}
              onExit={() => { trackEvent('pre_permission_exited'); onExit() }}
              disabled={status === 'connecting'}
            />
          )}
          {status === 'cam_error' && <ErrorView title="Camera access denied" onRetry={requestCamera} onExit={() => { trackEvent('cam_error_exited'); onExit() }} />}
          {(status === 'waiting' || status === 'text_connecting') && (
            <MatchingView
              onExit={onExit}
            />
          )}
          {miloActive && (
            <MiloPanel
              persona={persona}
              showPersonaPicker={showPersonaPicker}
              choosePersona={choosePersona}
              personas={PERSONAS}
              miloMessages={miloMessages}
              miloTyping={miloTyping}
              miloCapped={miloCapped}
              miloInput={miloInput}
              setMiloInput={setMiloInput}
              sendMiloMessage={sendMiloMessage}
              miloInputRef={miloInputRef}
              scrollRef={miloScrollRef}
            />
          )}
          {(status === 'text_chat' || status === 'connected') && (
            <ChatView
              isVideo={isVideo}
              iceState={iceState}
              messages={messages}
              sendText={sendText}
              localStream={localStreamReady && localStreamRef.current ? localStreamRef.current : null}
              remoteStream={remoteStreamVersion > 0 ? remoteStreamRef.current : null}
              remoteStreamVersion={remoteStreamVersion}
              scrollRef={msgScrollRef}
              onFindNext={findNext}
              onStop={findNext}
              isStrangerTyping={isStrangerTyping}
            />
          )}
          {status === 'partner_left' && <PartnerLeftView onNext={findNext} onExit={onExit} />}
          {status === 'busy' && <SimpleStatusView title="Server is busy" desc="Too many open sockets from your network." />}
          {status === 'slow_down' && <SimpleStatusView title="Slowing down…" desc="Hang on, we'll re-queue you in a sec." />}
        </main>
      </div>
    </>
  )
}

// ── Helper: status display ──
function statusLabel(status, iceState, isVideo, mood) {
  if (status === 'pre_permission') return 'Camera check'
  if (status === 'cam_error') return 'Camera blocked'
  if (status === 'waiting' || status === 'text_connecting') return 'Looking for someone…'
  if (status === 'text_chat' || status === 'connected') return 'Connected'
  if (status === 'partner_left') return 'Disconnected'
  if (status === 'busy') return 'Server busy'
  if (status === 'slow_down') return 'Slowing down'
  return 'Connecting'
}

function statusDotColor(status, iceState) {
  if (status === 'connected' || iceState === 'connected' || iceState === 'completed') return 'var(--success)'
  if (status === 'partner_left' || status === 'busy' || iceState === 'failed' || iceState === 'disconnected') return 'var(--danger)'
  if (status === 'cam_error') return 'var(--danger)'
  return 'var(--warning)'
}

// ═══════════════════════════════════════════════════════════════════════════
// ── Subcomponents ──
// ═══════════════════════════════════════════════════════════════════════════

function PrePermissionView({ onAllow, onExit, disabled }) {
  return (
    <Center>
      <div
        className="scale-in"
        style={{
          width: 64,
          height: 64,
          borderRadius: '50%',
          background: 'var(--rd-surface-hover)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 28,
          marginBottom: 20,
        }}
      >
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M15 10L19.5528 7.72361C20.2177 7.39116 21 7.87465 21 8.61803V15.382C21 16.1253 20.2177 16.6088 19.5528 16.2764L15 14V10Z" stroke="var(--rd-text-1)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <rect x="3" y="6" width="12" height="12" rx="3" stroke="var(--rd-text-1)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
      <h2 style={{ fontSize: 'clamp(20px, 3vw, 24px)', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: 8, color: 'var(--rd-text-1)' }}>
        Camera & microphone access
      </h2>
      <p style={{ color: 'var(--rd-text-3)', fontSize: 14, marginBottom: 24, maxWidth: 320, lineHeight: 1.5, textAlign: 'center' }}>
        We need camera access to start the video chat. Your stream is peer-to-peer and never recorded.
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, width: 'min(100%, 320px)' }}>
        <PrimaryButton onClick={onAllow} disabled={disabled}>
          {disabled ? 'Requesting access…' : 'Allow Camera & Start'}
        </PrimaryButton>
        <GhostButton onClick={onExit} disabled={disabled}>Go back</GhostButton>
      </div>
    </Center>
  )
}

function ErrorView({ title, onRetry, onExit }) {
  return (
    <Center>
      <div
        style={{
          width: 64,
          height: 64,
          borderRadius: '50%',
          background: 'var(--accent-dim)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 28,
          marginBottom: 16,
        }}
      >
        ⚠️
      </div>
      <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 12 }}>{title}</h2>
      <p style={{ color: 'var(--text-3)', fontSize: 14, marginBottom: 20, maxWidth: 320, lineHeight: 1.5, textAlign: 'center' }}>
        Check your browser's site settings (click the lock icon in the address bar) and allow camera & microphone, then try again.
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, width: 'min(100%, 320px)' }}>
        {onRetry && <PrimaryButton onClick={onRetry}>Try Again</PrimaryButton>}
        <GhostButton onClick={onExit}>Go back</GhostButton>
      </div>
    </Center>
  )
}

function MatchingView({ onExit }) {
  const [copyIdx, setCopyIdx] = useState(0)

  const MICROCOPY = [
    "Looking for someone...",
    "Still looking. No rush.",
    "Someone might walk in any second.",
    "Taking a little longer than usual.",
  ]

  useEffect(() => {
    const timer = setInterval(() => {
      setCopyIdx((prev) => (prev + 1) % MICROCOPY.length)
    }, 3500)
    return () => clearInterval(timer)
  }, [MICROCOPY.length])

  return (
    <div
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'clamp(20px, 4vw, 32px)',
        position: 'relative',
        width: '100%',
        minHeight: 0,
      }}
    >
      {/* Visual calm expanding ring */}
      <div
        aria-hidden="true"
        style={{
          position: 'relative',
          width: 200,
          height: 200,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 36,
        }}
      >
        <span
          className="pulse-ring"
          style={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            borderRadius: '50%',
            border: '1.5px solid var(--rd-accent)',
            animation: 'milooPulseRing 3.6s cubic-bezier(0.2, 0.8, 0.2, 1) infinite',
            pointerEvents: 'none',
          }}
        />
        <span
          className="pulse-ring"
          style={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            borderRadius: '50%',
            border: '1.5px solid var(--rd-accent)',
            animation: 'milooPulseRing 3.6s cubic-bezier(0.2, 0.8, 0.2, 1) infinite',
            animationDelay: '1.8s',
            pointerEvents: 'none',
          }}
        />
        <span
          style={{
            position: 'relative',
            width: 14,
            height: 14,
            borderRadius: '50%',
            background: 'var(--rd-accent)',
            zIndex: 2,
            boxShadow: '0 0 16px rgba(230, 99, 69, 0.5)',
          }}
        />
      </div>

      {/* Rotating Human Microcopy */}
      <div
        style={{
          position: 'relative',
          height: 48,
          width: '100%',
          maxWidth: 460,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {MICROCOPY.map((text, idx) => (
          <h2
            key={idx}
            style={{
              position: 'absolute',
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(22px, 3.2vw, 30px)',
              fontWeight: 400,
              color: 'var(--rd-text-1)',
              letterSpacing: '-0.02em',
              textAlign: 'center',
              margin: 0,
              opacity: copyIdx === idx ? 1 : 0,
              transform: copyIdx === idx ? 'translateY(0)' : 'translateY(6px)',
              transition: 'opacity 400ms ease, transform 400ms ease',
              width: '100%',
              pointerEvents: 'none',
            }}
          >
            {text}
          </h2>
        ))}
      </div>

      {/* Thumb-friendly Cancel Button */}
      <div
        style={{
          position: 'absolute',
          bottom: 'clamp(28px, 6vh, 48px)',
          left: 0,
          right: 0,
          display: 'flex',
          justifyContent: 'center',
        }}
      >
        <button
          onClick={onExit}
          aria-label="Cancel searching"
          style={{
            background: 'transparent',
            color: 'var(--rd-text-2)',
            fontFamily: 'var(--font-body)',
            fontSize: 15,
            fontWeight: 500,
            padding: '12px 24px',
            border: '1px solid var(--border-1)',
            borderRadius: 'var(--radius-pill)',
            cursor: 'pointer',
            minHeight: 44,
            minWidth: 120,
            transition: 'all 200ms ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = 'var(--rd-text-1)'
            e.currentTarget.style.background = 'var(--surface-1)'
            e.currentTarget.style.borderColor = 'var(--border-2)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = 'var(--rd-text-2)'
            e.currentTarget.style.background = 'transparent'
            e.currentTarget.style.borderColor = 'var(--border-1)'
          }}
        >
          Cancel
        </button>
      </div>
    </div>
  )
}

function PartnerLeftView({ onNext, onExit }) {
  const handleShare = () => {
    trackEvent('share_clicked', { trigger: 'partner_left' })
    if (navigator.share) {
      navigator.share({
        title: 'Miloo — Free Random Video Chat',
        text: 'Met someone interesting on Miloo! Try it — free random video chat, no signup needed.',
        url: 'https://www.miloo.chat',
      }).catch(() => {})
    } else {
      navigator.clipboard.writeText('https://www.miloo.chat').then(() => {
        alert('Link copied! Share miloo.chat with your friends 🎉')
      }).catch(() => {})
    }
  }
  return (
    <Center>
      <div
        style={{
          width: 64,
          height: 64,
          borderRadius: '50%',
          background: 'var(--accent-dim)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 28,
          marginBottom: 16,
        }}
      >
        👋
      </div>
      <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 8 }}>Your partner left</h2>
      <p style={{ color: 'var(--text-3)', fontSize: 14, marginBottom: 24 }}>Find the next person?</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, width: 'min(100%, 320px)' }}>
        <PrimaryButton onClick={onNext}>Find next</PrimaryButton>
        <button
          onClick={handleShare}
          style={{
            background: 'transparent',
            border: '1px solid var(--border-1)',
            borderRadius: 'var(--radius-pill)',
            color: 'var(--text-2)',
            fontSize: 14,
            fontWeight: 600,
            padding: '10px 18px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
          }}
        >
          🔗 Share Miloo with a friend
        </button>
        <GhostButton onClick={onExit}>Go home</GhostButton>
      </div>
    </Center>
  )
}

function SimpleStatusView({ title, desc }) {
  return (
    <Center>
      <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 8 }}>{title}</h2>
      <p style={{ color: 'var(--text-3)', fontSize: 14 }}>{desc}</p>
    </Center>
  )
}

function Center({ children }) {
  return (
    <div
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'clamp(24px, 4vw, 40px)',
        textAlign: 'center',
      }}
    >
      {children}
    </div>
  )
}

function PrimaryButton({ children, onClick, disabled }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        width: '100%',
        padding: '14px 22px',
        fontSize: 15,
        fontWeight: 700,
        letterSpacing: '-0.01em',
        color: 'var(--accent-text)',
        background: 'var(--gradient-cta)',
        border: 'none',
        borderRadius: 'var(--radius-pill)',
        cursor: 'pointer',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        boxShadow: 'var(--accent-glow)',
        transition: 'transform 150ms ease, box-shadow 150ms ease',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-1px)'
        e.currentTarget.style.boxShadow = 'var(--shadow-glow)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)'
        e.currentTarget.style.boxShadow = 'var(--accent-glow)'
      }}
    >
      {children}
    </button>
  )
}

function GhostButton({ children, onClick, disabled }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="compact"
      style={{
        width: '100%',
        padding: '12px 22px',
        fontSize: 14,
        fontWeight: 600,
        color: 'var(--text-2)',
        background: 'transparent',
        border: '1px solid var(--border-1)',
        borderRadius: 'var(--radius-pill)',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.6 : 1,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.color = 'var(--text-1)'
        e.currentTarget.style.background = 'var(--surface-1)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.color = 'var(--text-2)'
        e.currentTarget.style.background = 'transparent'
      }}
    >
      {children}
    </button>
  )
}

function MiloPanel({
  persona,
  showPersonaPicker,
  choosePersona,
  personas,
  miloMessages,
  miloTyping,
  miloCapped,
  miloInput,
  setMiloInput,
  sendMiloMessage,
  miloInputRef,
  scrollRef,
}) {
  const currentPersona = personas.find((p) => p.id === persona) || personas[0]
  return (
    <section
      aria-live="polite"
      role="log"
      style={{
        display: 'flex',
        flexDirection: 'column',
        flex: 1,
        minHeight: 0,
        margin: '12px clamp(12px, 3vw, 20px)',
        borderRadius: 'var(--radius-lg)',
        background: 'var(--rd-surface)',
        border: '1px solid var(--border-1)',
        overflow: 'hidden',
        animation: 'milooMsgIn 180ms ease-out both',
      }}
    >
      {/* Persona header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          padding: '12px 16px',
          borderBottom: '1px solid var(--border-1)',
          background: 'var(--rd-surface)',
        }}
      >
        <span style={{ fontSize: 20 }} aria-hidden="true">{currentPersona.emoji}</span>
        <div>
          <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--rd-text-1)', fontFamily: 'var(--font-body)' }}>
            {currentPersona.label} <span style={{ color: 'var(--rd-text-3)', fontWeight: 400 }}>· AI companion</span>
          </div>
          <div style={{ fontSize: 12, color: 'var(--rd-text-3)', fontFamily: 'var(--font-body)' }}>{currentPersona.blurb}</div>
        </div>
      </div>

      {showPersonaPicker && (
        <div
          role="dialog"
          aria-label="Pick a Milo persona"
          style={{
            padding: '10px 14px',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))',
            gap: 8,
            background: 'var(--rd-surface-hover)',
            borderBottom: '1px solid var(--border-1)',
          }}
        >
          {personas.map((p) => (
            <button
              key={p.id}
              onClick={() => choosePersona(p.id)}
              className="card-hover"
              style={{
                padding: '10px 8px',
                borderRadius: 'var(--radius-md)',
                background: 'var(--rd-surface)',
                color: 'var(--rd-text-1)',
                border: '1px solid var(--border-1)',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 4,
                textAlign: 'center',
              }}
            >
              <span style={{ fontSize: 20 }}>{p.emoji}</span>
              <strong style={{ fontSize: 12, fontWeight: 600, fontFamily: 'var(--font-body)' }}>{p.label}</strong>
              <span style={{ fontSize: 10, color: 'var(--rd-text-3)', fontFamily: 'var(--font-body)' }}>{p.blurb}</span>
            </button>
          ))}
        </div>
      )}

      <div
        ref={scrollRef}
        className="no-scrollbar"
        style={{
          flex: 1,
          minHeight: 0,
          overflowY: 'auto',
          padding: '16px',
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
        }}
      >
        {miloMessages.map((m, i) => (
          <MessageBubble key={i} role={m.role} time={m.time} name={m.role === 'user' ? 'You' : currentPersona.label}>
            {m.content}
          </MessageBubble>
        ))}
        {miloTyping && (
          <div style={{ alignSelf: 'flex-start', display: 'flex', alignItems: 'center', gap: 6, padding: '6px 0' }}>
            <span className="terracotta-dot-pulse" />
            <span style={{ fontSize: 12, color: 'var(--rd-text-3)', fontFamily: 'var(--font-body)' }}>{currentPersona.label} is typing…</span>
          </div>
        )}
        {miloCapped && (
          <p style={{ fontSize: 12, color: 'var(--rd-text-3)', textAlign: 'center', padding: '8px 0', fontFamily: 'var(--font-body)' }}>
            Milo is pausing — try Find Next if you want a real person ✨
          </p>
        )}
      </div>

      <div style={{ padding: '8px 12px 12px', background: 'var(--rd-surface)' }}>
        <ChatInput
          inputRef={miloInputRef}
          value={miloInput}
          onChange={(e) => setMiloInput(e.target.value)}
          onSend={sendMiloMessage}
          placeholder="Type a message to Milo…"
        />
      </div>
    </section>
  )
}

function ChatView({
  isVideo,
  iceState,
  messages,
  sendText,
  localStream,
  remoteStream,
  remoteStreamVersion,
  scrollRef,
  onFindNext,
  onStop,
  isStrangerTyping,
}) {
  const [showChat, setShowChat] = React.useState(false)

  return (
    <section
      aria-live="polite"
      role="log"
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        minHeight: 0,
        padding: isVideo ? '0' : '0 clamp(12px, 3vw, 20px)',
        gap: 0,
        position: 'relative',
        width: '100%',
        maxWidth: isVideo ? '100%' : 680,
        margin: '0 auto',
      }}
    >
      {isVideo ? (
        <div className="video-chat-container">
          <div className="video-stage-wrapper">
            <VideoStage
              key={remoteStreamVersion}
              iceState={iceState}
              localStream={localStream}
              remoteStream={remoteStream}
              onFindNext={onFindNext}
            />
            <button
              onClick={() => setShowChat((v) => !v)}
              className="mobile-chat-toggle compact"
              aria-label={showChat ? 'Hide Chat' : 'Chat'}
            >
              💬 {showChat ? 'Hide Chat' : 'Chat'}
              {messages.length > 0 && !showChat && (
                <span
                  style={{
                    background: 'var(--rd-accent)',
                    borderRadius: '50%',
                    minWidth: 18,
                    height: 18,
                    fontSize: 10,
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '0 4px',
                    color: '#fff',
                  }}
                >
                  {messages.length > 9 ? '9+' : messages.length}
                </span>
              )}
            </button>

            <div className={`video-chat-panel ${showChat ? 'mobile-open' : ''}`}>
              <div
                style={{
                  padding: '10px 14px',
                  borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                  fontSize: 12,
                  fontWeight: 600,
                  color: 'rgba(255, 255, 255, 0.7)',
                  flexShrink: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  fontFamily: 'var(--font-body)',
                }}
              >
                <span>Chat with stranger</span>
                <button
                  className="mobile-chat-close-btn compact"
                  onClick={() => setShowChat(false)}
                  aria-label="Close chat"
                  style={{ color: 'rgba(255, 255, 255, 0.7)' }}
                >
                  ✕
                </button>
              </div>

              <div
                ref={scrollRef}
                className="no-scrollbar"
                style={{
                  flex: 1,
                  overflowY: 'auto',
                  padding: '14px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 8,
                  minHeight: 0,
                }}
              >
                {messages.length === 0 ? (
                  <p
                    style={{
                      color: 'rgba(255, 255, 255, 0.5)',
                      fontSize: 13,
                      fontFamily: 'var(--font-body)',
                      textAlign: 'center',
                      margin: 'auto',
                    }}
                  >
                    Say hello.
                  </p>
                ) : (
                  messages.map((m, i) => {
                    if (m.from === 'system') {
                      return (
                        <div
                          key={i}
                          style={{
                            alignSelf: 'center',
                            fontSize: 11,
                            color: 'rgba(255, 255, 255, 0.6)',
                            padding: '3px 10px',
                            borderRadius: 'var(--radius-pill)',
                            background: 'rgba(255, 255, 255, 0.05)',
                            fontFamily: 'var(--font-body)',
                          }}
                        >
                          {m.text}
                        </div>
                      )
                    }
                    const isMe = m.from === 'me'
                    const prev = i > 0 ? messages[i - 1] : null
                    const showHeader = !prev || prev.from !== m.from || prev.time !== m.time
                    return (
                      <MessageBubble
                        key={i}
                        role={isMe ? 'user' : 'stranger'}
                        time={m.time}
                        name={isMe ? 'You' : 'Stranger'}
                        showHeader={showHeader}
                        videoMode={true}
                      >
                        {m.text}
                      </MessageBubble>
                    )
                  })
                )}
                {isStrangerTyping && (
                  <div
                    aria-live="polite"
                    style={{
                      alignSelf: 'flex-start',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      padding: '4px 0',
                    }}
                  >
                    <span className="terracotta-dot-pulse" aria-hidden="true" />
                    <span style={{ fontSize: 12, color: 'rgba(255, 255, 255, 0.5)', fontFamily: 'var(--font-body)' }}>
                      Stranger is typing…
                    </span>
                  </div>
                )}
              </div>

              <div style={{ flexShrink: 0, padding: '8px 12px 12px' }}>
                <ChatInput onSend={sendText} placeholder="Say something…" />
              </div>
            </div>

            <div className="ome-control-bar-overlay">
              <OmeControlBar onNext={onFindNext} onStop={onStop} />
            </div>
          </div>
        </div>
      ) : (
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            minHeight: 0,
            width: '100%',
            height: '100%',
          }}
        >
          {/* Borderless Chat Stream sitting directly on page background */}
          <div
            ref={scrollRef}
            className="no-scrollbar"
            style={{
              flex: 1,
              minHeight: 0,
              overflowY: 'auto',
              padding: '16px 0',
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
            }}
          >
            {messages.length === 0 && (
              <div
                style={{
                  margin: 'auto',
                  textAlign: 'center',
                  color: 'var(--rd-text-3)',
                  fontSize: 14,
                  fontFamily: 'var(--font-body)',
                }}
              >
                Say hello.
              </div>
            )}
            {messages.map((m, i) => {
              if (m.from === 'system') {
                return (
                  <div
                    key={i}
                    style={{
                      alignSelf: 'center',
                      fontSize: 12,
                      color: 'var(--rd-text-3)',
                      padding: '4px 12px',
                      borderRadius: 'var(--radius-pill)',
                      background: 'var(--rd-surface)',
                      border: '1px solid var(--border-1)',
                      fontFamily: 'var(--font-body)',
                      margin: '6px 0',
                    }}
                  >
                    {m.text}
                  </div>
                )
              }
              const isMe = m.from === 'me'
              const prev = i > 0 ? messages[i - 1] : null
              const showHeader = !prev || prev.from !== m.from || prev.time !== m.time
              return (
                <MessageBubble
                  key={i}
                  role={isMe ? 'user' : 'stranger'}
                  time={m.time}
                  name={isMe ? 'You' : 'Stranger'}
                  showHeader={showHeader}
                >
                  {m.text}
                </MessageBubble>
              )
            })}
            {isStrangerTyping && (
              <div
                aria-live="polite"
                style={{
                  alignSelf: 'flex-start',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '6px 2px',
                  animation: 'milooMsgIn 180ms ease-out both',
                }}
              >
                <span className="terracotta-dot-pulse" aria-hidden="true" />
                <span style={{ fontSize: 13, color: 'var(--rd-text-3)', fontFamily: 'var(--font-body)' }}>
                  Stranger is typing…
                </span>
              </div>
            )}
          </div>

          <div style={{ flexShrink: 0, paddingTop: 8 }}>
            <ChatInput onSend={sendText} placeholder="Say something…" />
            <OmeControlBar onNext={onFindNext} onStop={onStop} />
          </div>
        </div>
      )}
    </section>
  )
}

function OmeControlBar({ onNext, onStop }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        paddingTop: 10,
        paddingBottom: 'max(10px, env(safe-area-inset-bottom))',
      }}
    >
      <button
        onClick={onStop}
        aria-label="Leave chat"
        className="compact tactile-btn"
        style={{
          flex: 1,
          padding: '10px 16px',
          borderRadius: 'var(--radius-md)',
          background: 'transparent',
          border: '1px solid var(--border-1)',
          color: 'var(--rd-text-3)',
          fontFamily: 'var(--font-body)',
          fontSize: 14,
          fontWeight: 500,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          cursor: 'pointer',
          minHeight: 44,
          transition: 'all 180ms ease-out',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.color = 'var(--rd-text-1)'
          e.currentTarget.style.background = 'var(--rd-surface-hover)'
          e.currentTarget.style.borderColor = 'var(--border-2)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.color = 'var(--rd-text-3)'
          e.currentTarget.style.background = 'transparent'
          e.currentTarget.style.borderColor = 'var(--border-1)'
        }}
      >
        Leave
      </button>
      <button
        onClick={onNext}
        aria-label="Next partner"
        className="compact tactile-btn"
        style={{
          flex: 1,
          padding: '10px 16px',
          borderRadius: 'var(--radius-md)',
          background: 'var(--rd-accent)',
          border: '1px solid var(--rd-accent)',
          color: '#ffffff',
          fontFamily: 'var(--font-body)',
          fontSize: 14,
          fontWeight: 600,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          cursor: 'pointer',
          minHeight: 44,
          transition: 'all 180ms ease-out',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.filter = 'brightness(1.08)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.filter = 'none'
        }}
      >
        Next
      </button>
    </div>
  )
}

function MessageBubble({ role, time, name, showHeader = true, children }) {
  const isMe = role === 'user' || role === 'me'
  const senderName = name || (isMe ? 'You' : 'Stranger')
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: isMe ? 'flex-end' : 'flex-start',
        maxWidth: 'min(88%, 560px)',
        alignSelf: isMe ? 'flex-end' : 'flex-start',
        animation: 'milooMsgIn 180ms ease-out both',
      }}
    >
      {showHeader && (
        <div
          style={{
            fontSize: 11,
            color: 'var(--rd-text-3)',
            fontFamily: 'var(--font-body)',
            marginBottom: 3,
            marginTop: 6,
            paddingLeft: isMe ? 0 : 2,
            paddingRight: isMe ? 2 : 0,
            userSelect: 'none',
          }}
        >
          <span>{senderName}</span>
          {time && (
            <>
              <span aria-hidden="true" style={{ opacity: 0.4, margin: '0 4px' }}>·</span>
              <span>{time}</span>
            </>
          )}
        </div>
      )}
      <div
        style={{
          padding: '2px 0',
          background: 'transparent',
          color: isMe ? 'var(--rd-text-2)' : 'var(--rd-text-1)',
          fontSize: isMe ? '15px' : 'clamp(16px, 1.7vw, 17.5px)',
          lineHeight: 1.55,
          fontFamily: 'var(--font-body)',
          textAlign: isMe ? 'right' : 'left',
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word',
        }}
      >
        {children}
      </div>
    </div>
  )
}

function DroppedOverlay({ onFindNext }) {
  const [dropSeconds, setDropSeconds] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setDropSeconds((s) => s + 1)
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(21, 20, 19, 0.85)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        zIndex: 10,
        padding: 24,
        textAlign: 'center',
      }}
    >
      <div style={{ position: 'relative', width: 48, height: 48, marginBottom: 20, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div
          style={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            borderRadius: '50%',
            border: '1.5px solid var(--rd-accent)',
            opacity: 0.4,
            animation: 'milooPulseDot 2s ease-in-out infinite',
          }}
        />
        <span
          style={{
            position: 'relative',
            width: 8,
            height: 8,
            borderRadius: '50%',
            background: 'var(--rd-accent)',
            zIndex: 2,
          }}
        />
      </div>
      <h3 style={{ margin: 0, color: 'var(--rd-text-1)', fontSize: 16, fontWeight: 600, marginBottom: 6 }}>
        {dropSeconds >= 8 ? 'Having trouble reconnecting…' : 'Reconnecting…'}
      </h3>
      <p style={{ margin: 0, color: 'var(--rd-text-3)', fontSize: 13, marginBottom: dropSeconds >= 8 ? 20 : 0, maxWidth: 260 }}>
        {dropSeconds >= 8 ? 'Their network might have dropped.' : 'Waiting for connection to resume.'}
      </p>
      {dropSeconds >= 8 && (
        <PrimaryButton onClick={onFindNext}>Find new match</PrimaryButton>
      )}
    </div>
  )
}

function VideoStage({ iceState, localStream, remoteStream, onFindNext }) {
  const localRef = useRef(null)
  const remoteRef = useRef(null)

  useEffect(() => {
    if (localRef.current) {
      localRef.current.srcObject = localStream || null
      if (localStream) localRef.current.play().catch(() => {})
    }
  }, [localStream])
  useEffect(() => {
    if (remoteRef.current) {
      remoteRef.current.srcObject = remoteStream || null
      if (remoteStream) remoteRef.current.play().catch(() => {})
    }
    if (remoteRef.current && remoteStream && remoteRef.current.srcObject !== remoteStream) {
      remoteRef.current.srcObject = remoteStream
      remoteRef.current.play().catch(() => {})
    }
  }, [remoteStream])

  const connState = (iceState || '').toLowerCase()
  const isLive = connState === 'connected' || connState === 'completed'
  const isDropped = connState === 'disconnected' || connState === 'failed'

  return (
    <div
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        minHeight: 0,
        height: '100%',
      }}
    >
      <div className="video-split-stage">
        {/* Remote video feed (Full bleed) */}
        <div className="video-feed-remote">
          <video
            ref={remoteRef}
            autoPlay
            playsInline
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
          {!remoteStream && (
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255, 255, 255, 0.4)', fontSize: 14 }}>
              Waiting for partner's video…
            </div>
          )}
          {isDropped && <DroppedOverlay onFindNext={onFindNext} />}
          <div
            style={{
              position: 'absolute',
              top: 16,
              left: 16,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '6px 12px',
              borderRadius: 'var(--radius-pill)',
              background: 'rgba(0,0,0,0.4)',
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
              fontSize: 12,
              fontWeight: 500,
              color: 'rgba(255,255,255,0.9)',
              zIndex: 5,
            }}
          >
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: isLive ? 'var(--success)' : 'var(--warning)' }} />
            {isLive ? 'Live' : (iceState || 'connecting')}
          </div>
        </div>

        {/* Local video feed (PiP Corner) */}
        <div className="video-feed-local">
          <video
            ref={localRef}
            autoPlay
            playsInline
            muted
            style={{ width: '100%', height: '100%', objectFit: 'cover', transform: 'scaleX(-1)' }}
          />
        </div>
      </div>
    </div>
  )
}

function ChatInput({ value, onChange, onSend, placeholder, inputRef }) {
  const [internalValue, setInternalValue] = useState('')
  const [isFocused, setIsFocused] = useState(false)
  const isControlled = value !== undefined
  const displayValue = isControlled ? value : internalValue

  const fallbackRef = useRef(null)
  const textareaRef = inputRef || fallbackRef

  const handleInput = (e) => {
    const val = e.target.value
    if (isControlled) {
      if (onChange) onChange(e)
    } else {
      setInternalValue(val)
    }
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`
    }
  }

  const handleSend = () => {
    const trimmed = (displayValue || '').trim()
    if (!trimmed) return
    onSend(trimmed)
    if (!isControlled) {
      setInternalValue('')
    }
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-end',
        gap: 8,
        padding: '6px 12px',
        borderRadius: '16px',
        background: 'var(--rd-surface)',
        border: '1px solid',
        borderColor: isFocused ? 'var(--rd-accent)' : 'var(--border-1)',
        boxShadow: isFocused ? '0 0 0 1px var(--rd-accent)' : 'none',
        transition: 'border-color 180ms ease-out, box-shadow 180ms ease-out',
        width: '100%',
      }}
    >
      <textarea
        ref={textareaRef}
        rows={1}
        value={displayValue || ''}
        onChange={handleInput}
        onKeyDown={handleKeyDown}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        placeholder={placeholder || 'Say something…'}
        aria-label="Message input"
        style={{
          flex: 1,
          minWidth: 0,
          background: 'transparent',
          border: 'none',
          color: 'var(--rd-text-1)',
          fontFamily: 'var(--font-body)',
          fontSize: 16,
          lineHeight: 1.5,
          padding: '6px 0',
          resize: 'none',
          outline: 'none',
          maxHeight: 120,
          overflowY: 'auto',
        }}
      />
      <button
        onClick={handleSend}
        disabled={!(displayValue || '').trim()}
        aria-label="Send message"
        className="compact scale-in"
        style={{
          width: 44,
          height: 44,
          borderRadius: '10px',
          border: 'none',
          background: (displayValue || '').trim() ? 'var(--rd-accent)' : 'var(--rd-surface-hover)',
          color: (displayValue || '').trim() ? '#ffffff' : 'var(--rd-text-3)',
          cursor: (displayValue || '').trim() ? 'pointer' : 'not-allowed',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 16,
          flexShrink: 0,
          marginBottom: 2,
          transition: 'all 180ms ease-out',
        }}
      >
        ↑
      </button>
    </div>
  )
}
