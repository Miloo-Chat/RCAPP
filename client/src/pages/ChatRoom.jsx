// client/src/pages/ChatRoom.jsx
//
// Miloo Stranger Chat Room (100% Real Human Matching Only - No Bots)
//
// Direct-CTA integration with App.jsx routing props
// (mood, intent, safeMode, chatMode, theme, onToggleTheme, onExit).
// WebRTC peer connection with `iceconnectionstatechange` monitoring.

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { io as socketIO } from 'socket.io-client'
import Logo from '../components/Logo'
import ThemeToggle from '../components/ThemeToggle'
import ReportModal from '../components/ReportModal'
import SendBirdButton from '../components/SendBirdButton'
import PWAInstallCard from '../components/PWAInstallCard'
import { trackEvent as globalTrackEvent } from '../utils/analytics'

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

const MATCH_TIMEOUT_SECONDS = 60
const STRIKE_WINDOW_MS = 60000 // §4 Resilience
const STRIKE_LIMIT = 3

// STUN + TURN config. STUN alone only works on open/simple networks —
// TURN is required for mobile data / NAT / college-WiFi style networks
// where direct peer-to-peer connections get blocked.
// Fetches from the backend /api/ice-servers endpoint (or falls back to public STUN).
async function fetchIceServers() {
  try {
    const res = await fetch(`${SERVER}/api/ice-servers`, {
      signal: AbortSignal.timeout ? AbortSignal.timeout(3000) : undefined
    })
    if (res.ok) {
      const data = await res.json()
      if (Array.isArray(data.iceServers) && data.iceServers.length > 0) {
        return data.iceServers
      }
    }
  } catch (e) {
    console.warn('ICE servers fetch from backend failed, using STUN defaults:', e.message)
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
]

const MATCH_KF = `
@keyframes milooPulseRing {
  0% { transform: scale(0.2); opacity: 0.8; }
  50% { opacity: 0.4; }
  100% { transform: scale(1.8); opacity: 0; }
}
@keyframes milooMsgIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}
@keyframes milooBirdBob{0%,100%{transform:translateY(0)}50%{transform:translateY(-5px)}}

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

function trackEvent(name, params = {}) {
  try {
    globalTrackEvent(name, params)
  } catch {
    /* no-op */
  }
}

function nowTime() {
  return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

function getOrCreateClientId() {
  try {
    if (typeof document !== 'undefined' && document.cookie) {
      const match = document.cookie.match(/(?:^|;\s*)miloo_uid=([^;]+)/)
      if (match && match[1]) {
        const uid = decodeURIComponent(match[1])
        try { localStorage.setItem('miloo_uid', uid) } catch {}
        return uid
      }
    }
    const saved = typeof localStorage !== 'undefined' ? localStorage.getItem('miloo_uid') : null
    if (saved) {
      if (typeof document !== 'undefined') {
        document.cookie = `miloo_uid=${encodeURIComponent(saved)}; Path=/; Max-Age=31536000; SameSite=Lax`
      }
      return saved
    }
    const newUid = `uid_${Date.now()}_${Math.random().toString(36).substring(2, 12)}`
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('miloo_uid', newUid)
    }
    if (typeof document !== 'undefined') {
      document.cookie = `miloo_uid=${encodeURIComponent(newUid)}; Path=/; Max-Age=31536000; SameSite=Lax`
    }
    return newUid
  } catch {
    return `uid_anon_${Math.random().toString(36).substring(2, 10)}`
  }
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
  const [reportModalOpen, setReportModalOpen] = useState(false)
  const [banReason, setBanReason] = useState(null)

  const [waitingTimedOut, setWaitingTimedOut] = useState(false)
  const [pushOptedIn, setPushOptedIn] = useState(false)

  const socketRef = useRef(null)
  const pcRef = useRef(null)
  const localStreamRef = useRef(null)
  const remoteStreamRef = useRef(null)
  const partnerIdRef = useRef(null)
  const chatModeRef = useRef(chatMode)
  const moodRef = useRef(mood)
  const matchSecondsRef = useRef(0)
  const waitingTimerRef = useRef(null)
  const autoNextTimerRef = useRef(null)
  const hasJoinedRef = useRef(false)
  const pendingIceCandidatesRef = useRef([])
  const msgScrollRef = useRef(null)
  const chatStartTimeRef = useRef(null)
  const sessionIdRef = useRef(`session_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`)

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
    matchSecondsRef.current = matchSeconds
  }, [matchSeconds])

  // ── Auto-scroll message list ──
  useEffect(() => {
    if (msgScrollRef.current) {
      msgScrollRef.current.scrollTop = msgScrollRef.current.scrollHeight
    }
  }, [messages])

  // ── ESC key closes chat session ──
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && !reportModalOpen) {
        onExit?.()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onExit, reportModalOpen])

  // ── Honest Matching Timer (60s search) ──
  // Keeps matching for 60 seconds. Does NOT connect any bots.
  useEffect(() => {
    if (status !== 'waiting') return undefined
    waitingTimerRef.current = setInterval(() => {
      setMatchSeconds((prev) => {
        const next = prev + 1
        if (next >= MATCH_TIMEOUT_SECONDS && !partnerIdRef.current) {
          setWaitingTimedOut(true)
        }
        return next
      })
    }, 1000)
    return () => {
      if (waitingTimerRef.current) clearInterval(waitingTimerRef.current)
    }
  }, [status])

  const handlePushOptIn = useCallback(async () => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      alert('Push notifications are not supported on this browser.')
      return
    }
    try {
      const res = await Notification.requestPermission()
      if (res === 'granted') {
        localStorage.setItem('miloo_notify_match', 'true')
        setPushOptedIn(true)
      }
    } catch {
      // ignore
    }
  }, [])

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
    const urlParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null
    const forceRelay = urlParams && (urlParams.get('forceRelay') === '1' || urlParams.get('relay') === '1')
    const rtcConfig = { iceServers }
    if (forceRelay) {
      rtcConfig.iceTransportPolicy = 'relay'
      console.info('[WebRTC] Diagnostic relay-only mode active (iceTransportPolicy: relay)')
    }
    const pc = new RTCPeerConnection(rtcConfig)
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
    const clientId = getOrCreateClientId()
    const sock = socketIO(SERVER, {
      transports: ['websocket', 'polling'],
      auth: { clientId, fingerprint: getFingerprint() },
      query: { clientId },
    })
    socketRef.current = sock

    sock.on('banned', (payload) => {
      const reason = (payload && payload.reason) || 'Your access to Miloo has been suspended due to violations of our Community Guidelines and Safety Policies.'
      setBanReason(reason)
      setStatus('banned')
      if (autoNextTimerRef.current) clearTimeout(autoNextTimerRef.current)
      try { sock.disconnect() } catch {}
    })

    sock.on('verification_required', (payload) => {
      setStatus('banned')
      setBanReason(payload?.error || 'Turnstile verification required before connecting.')
    })

    sock.on('moderation_error', (payload) => {
      setMessages((prev) => [
        ...prev,
        {
          id: `mod_err_${Date.now()}`,
          from: 'system_warning',
          text: payload?.message || 'message not sent, try again',
          time: nowTime(),
        },
      ])
    })

    sock.on('connect', () => {
      if (hasJoinedRef.current) {
        return
      }
      hasJoinedRef.current = true
      if (chatModeRef.current === 'text') {
        const turnstileToken = typeof sessionStorage !== 'undefined' ? sessionStorage.getItem('miloo_turnstile_token') || '' : ''
        sock.emit('find_match', {
          mood: moodRef.current,
          intent,
          mediaMode: chatModeRef.current,
          trustScore: 50,
          turnstileToken,
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
      chatStartTimeRef.current = Date.now()
      sessionIdRef.current = `session_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`
      trackEvent('chat_started', { mode: chatModeRef.current })
      setPartnerId(pid)
      partnerIdRef.current = pid
      if (chatModeRef.current === 'text') setStatus('text_chat')

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
      if (chatStartTimeRef.current) {
        const durationSec = Math.round((Date.now() - chatStartTimeRef.current) / 1000)
        chatStartTimeRef.current = null
        trackEvent('chat_ended', { durationSec })
        try {
          const cur = parseInt(localStorage.getItem('miloo_completed_chats_count') || '0', 10)
          localStorage.setItem('miloo_completed_chats_count', String(cur + 1))
        } catch (_) {}
      }
      if (autoNextTimerRef.current) clearTimeout(autoNextTimerRef.current)
      autoNextTimerRef.current = setTimeout(() => {
        setStatus('waiting')
        setMatchSeconds(0)
        if (socketRef.current) {
          const turnstileToken = typeof sessionStorage !== 'undefined' ? sessionStorage.getItem('miloo_turnstile_token') || '' : ''
          socketRef.current.emit('find_match', {
            mood: moodRef.current,
            intent,
            mediaMode: chatModeRef.current,
            trustScore: 50,
            turnstileToken,
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

    sock.on('moderation_warning', (data) => {
      setMessages((prev) => [
        ...prev,
        {
          from: 'system_warning',
          text: data?.message || 'Warning: Your message was blocked for violating Miloo Community Guidelines.',
          time: nowTime(),
        },
      ])
    })

    sock.on('stranger_typing', (isTyping) => {
      setIsStrangerTyping(isTyping)
    })
    sock.on('slow_down', ({ remainSec }) => {
      setStatus('slow_down')
      setTimeout(() => {
        const turnstileToken = typeof sessionStorage !== 'undefined' ? sessionStorage.getItem('miloo_turnstile_token') || '' : ''
        sock.emit('find_match', {
          mood: moodRef.current,
          intent,
          mediaMode: chatModeRef.current,
          trustScore: 50,
          turnstileToken,
        })
        setStatus('waiting')
        setMatchSeconds(0)
      }, (remainSec || 5) * 1000)
    })

    sock.on('server_busy', () => setStatus('busy'))
    sock.on('queue_timeout', () => setStatus('busy'))
    sock.on('connect_error', () => {
      setStatus('server_unreachable')
    })
    sock.on('disconnect', () => {
      /* handled by cleanup */
    })

    return () => {
      try { sock.disconnect() } catch { /* no-op */ }
      socketRef.current = null
      teardownWebRTC(true)
      if (waitingTimerRef.current) clearInterval(waitingTimerRef.current)
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
        const turnstileToken = typeof sessionStorage !== 'undefined' ? sessionStorage.getItem('miloo_turnstile_token') || '' : ''
        sock.emit('find_match', {
          mood: moodRef.current,
          intent,
          mediaMode: chatModeRef.current,
          trustScore: 50,
          turnstileToken,
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
    if (matchSeconds < 8) return "Looking for someone who's up for a chat..."
    if (matchSeconds < 20) return 'Hang tight — most matches happen in under 30s.'
    return 'Still searching. Want to try text-only? It usually pairs faster.'
  }, [matchSeconds])

  const findNext = useCallback(() => {
    if (chatStartTimeRef.current) {
      const durationSec = Math.round((Date.now() - chatStartTimeRef.current) / 1000)
      chatStartTimeRef.current = null
      trackEvent('chat_ended', { durationSec })
      try {
        const cur = parseInt(localStorage.getItem('miloo_completed_chats_count') || '0', 10)
        localStorage.setItem('miloo_completed_chats_count', String(cur + 1))
      } catch (_) {}
    }
    teardownWebRTC(false)
    setStatus('waiting')
    setIsStrangerTyping(false)
    setMatchSeconds(0)
    setMessages([])
    remoteStreamRef.current = null
    setRemoteStreamVersion((v) => v + 1)
    if (socketRef.current) {
      const turnstileToken = typeof sessionStorage !== 'undefined' ? sessionStorage.getItem('miloo_turnstile_token') || '' : ''
      socketRef.current.emit('find_match', {
        mood: moodRef.current,
        intent,
        mediaMode: chatModeRef.current,
        trustScore: 50,
        turnstileToken,
      })
    }
  }, [intent, teardownWebRTC])

  const handleBlockUser = useCallback(() => {
    const pid = partnerIdRef.current
    if (pid) {
      try {
        const stored = JSON.parse(localStorage.getItem('miloo_blocked_users') || '[]')
        if (!stored.includes(pid)) {
          stored.push(pid)
          localStorage.setItem('miloo_blocked_users', JSON.stringify(stored.slice(-500)))
        }
      } catch {
        // ignore
      }
    }
    findNext()
  }, [findNext])

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

          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            {status !== 'banned' && (
              <button
                type="button"
                onClick={() => setReportModalOpen(true)}
                title="Report abusive behavior"
                aria-label="Report User"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 4,
                  padding: '6px 10px',
                  borderRadius: 'var(--radius-pill)',
                  background: 'var(--surface-1)',
                  border: '1px solid var(--border-1)',
                  color: 'var(--text-2)',
                  fontSize: 12,
                  fontWeight: 500,
                  cursor: 'pointer',
                  transition: 'all 160ms ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = 'var(--text-1)'
                  e.currentTarget.style.borderColor = 'var(--danger)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = 'var(--text-2)'
                  e.currentTarget.style.borderColor = 'var(--border-1)'
                }}
              >
                <span aria-hidden="true">🚩</span>
                <span>Report</span>
              </button>
            )}
            {(status === 'connected' || status === 'text_chat') && (
              <>
                <button
                  type="button"
                  onClick={handleBlockUser}
                  title="Block this partner and skip"
                  aria-label="Block User"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 4,
                    padding: '6px 10px',
                    borderRadius: 'var(--radius-pill)',
                    background: 'var(--surface-1)',
                    border: '1px solid var(--border-1)',
                    color: 'var(--text-2)',
                    fontSize: 12,
                    fontWeight: 500,
                    cursor: 'pointer',
                    transition: 'all 160ms ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = 'var(--text-1)'
                    e.currentTarget.style.borderColor = 'var(--border-2)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = 'var(--text-2)'
                    e.currentTarget.style.borderColor = 'var(--border-1)'
                  }}
                >
                  <span aria-hidden="true">🚫</span>
                  <span>Block</span>
                </button>
              </>
            )}
            <ThemeToggle theme={theme} onToggle={onToggleTheme} />
          </div>
        </header>

        {/* Safety reminder */}
        <div
          style={{
            background: 'var(--surface-1)',
            borderBottom: '1px solid var(--border-1)',
            padding: '7px 16px',
            textAlign: 'center',
            fontSize: '12.5px',
            color: 'var(--text-2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
            flexShrink: 0,
          }}
        >
          <span>🛡️</span>
          <span>Never share personal details, passwords, or financial information.</span>
        </div>

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
              matchSeconds={matchSeconds}
              waitingTimedOut={waitingTimedOut}
              onKeepWaiting={() => setWaitingTimedOut(false)}
              chatMode={chatMode}
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
              onNSFWTrigger={(flaggedId) => {
                teardownWebRTC(false)
                trackEvent('video_nsfw_detected', { flaggedId })
              }}
              onReportViolation={() => {
                setReportModalOpen(true)
              }}
            />
          )}
          {status === 'partner_left' && (
            <PartnerLeftView
              onNext={findNext}
              onExit={onExit}
              onReport={() => setReportModalOpen(true)}
            />
          )}
          {status === 'busy' && <SimpleStatusView title="Server is busy" desc="Too many open sockets from your network." />}
          {status === 'slow_down' && <SimpleStatusView title="Slowing down…" desc="Hang on, we'll re-queue you in a sec." />}
          {status === 'server_unreachable' && (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '40px 24px',
                textAlign: 'center',
                gap: 16,
                maxWidth: 480,
                margin: 'auto',
                background: 'var(--surface-1)',
                border: '1px solid var(--border-1)',
                borderRadius: 'var(--radius-lg)',
                boxShadow: 'var(--shadow)',
              }}
            >
              <div style={{ fontSize: '40px' }}>☕</div>
              <h2 style={{ margin: 0, fontSize: '20px', fontFamily: 'var(--font-display)', color: 'var(--text-1)' }}>
                Taking a Short Break
              </h2>
              <p style={{ margin: 0, fontSize: '14px', lineHeight: 1.6, color: 'var(--text-2)' }}>
                Chat is taking a short break, please try again.
              </p>
              <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
                <button
                  type="button"
                  onClick={() => window.location.reload()}
                  style={{
                    padding: '10px 24px',
                    borderRadius: 'var(--radius-pill)',
                    border: 'none',
                    background: 'var(--accent)',
                    color: '#fff',
                    fontFamily: 'var(--font-body)',
                    fontSize: '14px',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Try Again
                </button>
                <button
                  type="button"
                  onClick={onExit}
                  style={{
                    padding: '10px 20px',
                    borderRadius: 'var(--radius-pill)',
                    border: '1px solid var(--border-2)',
                    background: 'transparent',
                    color: 'var(--text-2)',
                    fontFamily: 'var(--font-body)',
                    fontSize: '14px',
                    cursor: 'pointer',
                  }}
                >
                  Return Home
                </button>
              </div>
            </div>
          )}
          {status === 'banned' && (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '40px 24px',
                textAlign: 'center',
                gap: 16,
                maxWidth: 520,
                margin: 'auto',
                background: 'var(--surface-1)',
                border: '1px solid var(--border-1)',
                borderRadius: 'var(--radius-lg)',
                boxShadow: 'var(--shadow)',
              }}
            >
              <div style={{ fontSize: '48px' }}>🚫</div>
              <h2 style={{ margin: 0, fontSize: '22px', fontFamily: 'var(--font-display)', color: 'var(--danger, #ff5c5c)' }}>
                Access Suspended
              </h2>
              <p style={{ margin: 0, fontSize: '14px', lineHeight: 1.6, color: 'var(--text-2)' }}>
                {banReason || 'Your access to Miloo has been suspended due to violations of our Community Guidelines and Safety Policies.'}
              </p>
              <div style={{ display: 'flex', gap: 12, marginTop: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
                <button
                  type="button"
                  onClick={onExit}
                  style={{
                    padding: '10px 24px',
                    borderRadius: 'var(--radius-pill)',
                    border: 'none',
                    background: 'var(--accent)',
                    color: '#fff',
                    fontWeight: 600,
                    fontSize: '14px',
                    cursor: 'pointer',
                  }}
                >
                  Return to Home
                </button>
                <a
                  href="/safety"
                  style={{
                    padding: '10px 20px',
                    borderRadius: 'var(--radius-pill)',
                    border: '1px solid var(--border-1)',
                    color: 'var(--text-2)',
                    textDecoration: 'none',
                    fontSize: '14px',
                  }}
                >
                  Safety Guidelines
                </a>
                <a
                  href="/contact"
                  style={{
                    padding: '10px 20px',
                    borderRadius: 'var(--radius-pill)',
                    border: '1px solid var(--border-1)',
                    color: 'var(--text-2)',
                    textDecoration: 'none',
                    fontSize: '14px',
                  }}
                >
                  Contact Support
                </a>
              </div>
            </div>
          )}
        </main>

        <ReportModal
          isOpen={reportModalOpen}
          onClose={() => setReportModalOpen(false)}
          reportedUser={partnerIdRef.current || partnerId || 'stranger'}
          sessionId={sessionIdRef.current || `session_${Date.now()}`}
          recentMessages={messages.slice(-20)}
          onBlockAndNext={handleBlockUser}
        />
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
  if (status === 'server_unreachable') return 'Taking a short break'
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

function ErrorView({ title = 'Camera permission needed', onRetry, onExit }) {
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
        📷
      </div>
      <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 12 }}>Camera permission needed</h2>
      <div
        style={{
          color: 'var(--text-2)',
          fontSize: 14,
          marginBottom: 24,
          maxWidth: 380,
          lineHeight: 1.6,
          textAlign: 'left',
          background: 'var(--surface-1)',
          padding: '16px 20px',
          borderRadius: '12px',
          border: '1px solid var(--border-1)',
        }}
      >
        <ol style={{ margin: 0, paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 6 }}>
          <li>Click the <strong>lock icon 🔒</strong> in your browser's address bar.</li>
          <li>Set <strong>Camera</strong> and <strong>Microphone</strong> permissions to <em>Allow</em>.</li>
          <li>Click <strong>Try Again</strong> below to start connecting.</li>
        </ol>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, width: 'min(100%, 320px)' }}>
        {onRetry && <PrimaryButton onClick={onRetry}>Try Again</PrimaryButton>}
        <GhostButton onClick={onExit}>Go back</GhostButton>
      </div>
    </Center>
  )
}

function MatchingView({
  onExit,
  matchSeconds = 0,
  waitingTimedOut = false,
  onKeepWaiting,
  chatMode = 'text'
}) {
  const [copyIdx, setCopyIdx] = useState(0)
  const [onlineCount, setOnlineCount] = useState(null)

  useEffect(() => {
    let active = true
    const fetchOnlineCount = async () => {
      try {
        const res = await fetch(`${SERVER}/api/health`)
        if (res.ok) {
          const data = await res.json()
          if (active && typeof data.onlineUsers === 'number') {
            setOnlineCount(data.onlineUsers)
          }
        }
      } catch {
        /* no-op */
      }
    }
    fetchOnlineCount()
    const timer = setInterval(fetchOnlineCount, 8000)
    return () => {
      active = false
      clearInterval(timer)
    }
  }, [])

  const MICROCOPY = [
    "Looking for someone out there...",
    "Still looking. No rush.",
    "Holding your wire...",
    "Taking a little longer than usual.",
  ]

  useEffect(() => {
    const timer = setInterval(() => {
      setCopyIdx((prev) => (prev + 1) % MICROCOPY.length)
    }, 3500)
    return () => clearInterval(timer)
  }, [MICROCOPY.length])

  const isEmptyRoom = onlineCount !== null && onlineCount <= 1

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
      {/* Watercolor waiting animation: Bird waiting on a wire */}
      <div
        aria-hidden="true"
        style={{
          position: 'relative',
          width: 280,
          height: 120,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 24,
        }}
      >
        <svg
          viewBox="0 0 280 120"
          style={{ width: '100%', height: '100%', overflow: 'visible' }}
        >
          {/* Watercolor sun aura */}
          <circle cx="140" cy="60" r="42" fill="var(--accent, #e06345)" opacity="0.14" />
          <circle cx="140" cy="60" r="26" fill="var(--accent, #e06345)" opacity="0.22" />
          {/* Telephone wire with natural sag */}
          <path
            d="M 10 65 Q 140 76 270 65"
            fill="none"
            stroke="var(--text-3)"
            strokeWidth="1.75"
            strokeLinecap="round"
            opacity="0.6"
          />
          {/* Bird perched on wire */}
          <g
            style={{
              transformOrigin: '140px 71px',
              animation: 'milooBirdBob 3s ease-in-out infinite',
            }}
          >
            {/* Claws */}
            <line x1="138" y1="70" x2="138" y2="73" stroke="var(--text-2)" strokeWidth="1.5" />
            <line x1="142" y1="70" x2="142" y2="73" stroke="var(--text-2)" strokeWidth="1.5" />
            {/* Body */}
            <ellipse cx="140" cy="61" rx="9" ry="11" fill="var(--text-1)" />
            {/* Head */}
            <circle cx="143" cy="50" r="5.5" fill="var(--text-1)" />
            {/* Beak */}
            <polygon points="148,49 154,51 148,53" fill="var(--accent, #e06345)" />
            {/* Eye */}
            <circle cx="145" cy="49" r="1" fill="#fff" />
            {/* Wing fold */}
            <path d="M 136 57 Q 131 64 138 67" fill="none" stroke="var(--accent, #e06345)" strokeWidth="1.5" opacity="0.8" />
            {/* Tail */}
            <path d="M 133 65 L 125 76 L 135 69 Z" fill="var(--text-1)" opacity="0.9" />
          </g>
        </svg>
      </div>

      {/* Honest Waiting Timeout Card */}
      {waitingTimedOut ? (
        <div
          role="dialog"
          aria-label="Wait status"
          style={{
            maxWidth: 440,
            width: '100%',
            background: 'var(--surface-1)',
            border: '1.5px solid var(--border-2)',
            borderRadius: 'var(--radius-lg)',
            padding: 'clamp(20px, 3.5vw, 28px)',
            margin: '0 auto 20px',
            textAlign: 'center',
            boxShadow: '0 8px 32px rgba(0,0,0,0.14)',
            animation: 'milooMsgIn 220ms ease-out both',
            zIndex: 10,
          }}
        >
          <div style={{ fontSize: 26, marginBottom: 8 }} aria-hidden="true">🕊️</div>
          <h2
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(18px, 2.5vw, 22px)',
              fontWeight: 600,
              color: 'var(--text-1)',
              margin: '0 0 10px',
              lineHeight: 1.3,
            }}
          >
            No one is here right now. Keep waiting or try again later.
          </h2>
          <p
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: 13.5,
              color: 'var(--text-2)',
              margin: '0 0 20px',
              lineHeight: 1.55,
            }}
          >
            The wire is quiet right now. You can keep waiting, or try again later.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <button
              type="button"
              onClick={onKeepWaiting}
              style={{
                padding: '10px 18px',
                borderRadius: 'var(--radius-pill)',
                background: 'var(--accent)',
                border: 'none',
                color: '#ffffff',
                fontFamily: 'var(--font-body)',
                fontSize: 14,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Keep waiting
            </button>
            <button
              type="button"
              onClick={onExit}
              style={{
                padding: '8px 18px',
                borderRadius: 'var(--radius-pill)',
                background: 'transparent',
                border: 'none',
                color: 'var(--text-3)',
                fontFamily: 'var(--font-body)',
                fontSize: 13,
                cursor: 'pointer',
              }}
            >
              Try again later
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Primary Status Title */}
          <div
            style={{
              width: '100%',
              maxWidth: 480,
              textAlign: 'center',
              marginBottom: 10,
            }}
          >
            <h2
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(20px, 3.2vw, 26px)',
                fontWeight: 500,
                color: 'var(--text-1)',
                letterSpacing: '-0.01em',
                margin: '0 0 8px',
                lineHeight: 1.3,
              }}
            >
              {isEmptyRoom
                ? 'No one is here yet, your bird will wait on the wire'
                : matchSeconds >= 30
                ? 'Still searching on the wire... taking a moment'
                : MICROCOPY[copyIdx]}
            </h2>
            <p
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: 13.5,
                color: 'var(--text-2)',
                margin: 0,
                lineHeight: 1.5,
              }}
            >
              {matchSeconds < 60
                ? `Matching in the background (${Math.max(0, 60 - matchSeconds)}s)...`
                : 'Still listening on the wire. No rush — or return during Golden Hours (8–11 PM).'}
            </p>
          </div>

          {/* Real Online Count Badge (Strictly Real — Never Fake; hidden when 0 or 1) */}
          {onlineCount !== null && onlineCount > 1 && (
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '4px 12px',
                borderRadius: 'var(--radius-pill)',
                background: 'var(--surface-1)',
                border: '1px solid var(--border-1)',
                fontSize: 12.5,
                color: 'var(--text-2)',
                marginTop: 10,
                marginBottom: 20,
              }}
            >
              <span
                style={{
                  width: 7,
                  height: 7,
                  borderRadius: '50%',
                  background: '#10b981',
                  display: 'inline-block',
                }}
              />
              <span>{`${onlineCount} birds here now`}</span>
            </div>
          )}

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
                color: 'var(--text-2)',
                fontFamily: 'var(--font-body)',
                fontSize: 14,
                fontWeight: 500,
                padding: '10px 22px',
                border: '1px solid var(--border-1)',
                borderRadius: 'var(--radius-pill)',
                cursor: 'pointer',
                minHeight: 42,
                minWidth: 110,
                transition: 'all 200ms ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = 'var(--text-1)'
                e.currentTarget.style.background = 'var(--surface-1)'
                e.currentTarget.style.borderColor = 'var(--border-2)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = 'var(--text-2)'
                e.currentTarget.style.background = 'transparent'
                e.currentTarget.style.borderColor = 'var(--border-1)'
              }}
            >
              Cancel
            </button>
          </div>
        </>
      )}
    </div>
  )
}

function PartnerLeftView({ onNext, onExit, onReport }) {
  return (
    <Center>
      <div
        style={{
          width: 56,
          height: 56,
          borderRadius: '50%',
          background: 'var(--accent-dim, rgba(224, 99, 69, 0.12))',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 26,
          marginBottom: 14,
        }}
      >
        🕊️
      </div>
      <h2 style={{ fontSize: 22, fontWeight: 700, fontFamily: 'var(--font-display)', marginBottom: 6 }}>
        Stranger left the chat
      </h2>
      <p style={{ color: 'var(--text-2)', fontSize: 13.5, marginBottom: 20 }}>
        They flew away. Ready for the next conversation?
      </p>

      {/* "That was a good one? Send a bird to a friend" card */}
      <div
        style={{
          width: 'min(100%, 360px)',
          background: 'var(--surface-1)',
          border: '1px solid var(--border-1)',
          borderRadius: 'var(--radius-lg)',
          padding: '16px',
          marginBottom: 16,
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 12,
        }}
      >
        <div style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--text-1)' }}>
          That was a good one? Send a bird to a friend
        </div>
        <SendBirdButton />
      </div>

      {/* Custom bird-themed PWA install prompt shown after 2nd completed chat */}
      <div style={{ width: 'min(100%, 360px)', marginBottom: 16 }}>
        <PWAInstallCard />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, width: 'min(100%, 360px)' }}>
        <PrimaryButton onClick={onNext}>Find next person</PrimaryButton>
        <GhostButton onClick={onExit}>Return home</GhostButton>

        {/* Subtle, accessible Report link */}
        <button
          type="button"
          onClick={onReport}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--text-3)',
            fontSize: 12.5,
            textDecoration: 'underline',
            cursor: 'pointer',
            padding: '6px 12px',
            marginTop: 4,
          }}
        >
          🚩 Report previous conversation
        </button>
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
  onNSFWTrigger,
  onReportViolation,
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
              onNSFWTrigger={onNSFWTrigger}
              onReportViolation={onReportViolation}
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

          <div style={{ flexShrink: 0, paddingTop: 8, paddingBottom: 'max(10px, env(safe-area-inset-bottom))' }}>
            <ChatInput onSend={sendText} placeholder="Say something…" onNext={onFindNext} />
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
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
            <span>{senderName}</span>
          </span>
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
        <PrimaryButton onClick={onFindNext}>Find someone new</PrimaryButton>
      )}
    </div>
  )
}

function VideoStage({ iceState, localStream, remoteStream, onFindNext, onNSFWTrigger, onReportViolation }) {
  const localRef = useRef(null)
  const remoteRef = useRef(null)
  const [isBlurred, setIsBlurred] = useState(false)
  const [reportableId, setReportableId] = useState(null)

  useEffect(() => {
    setIsBlurred(false)
    setReportableId(null)
  }, [remoteStream])

  // Lazy-load nsfwjs & sample 1 frame every 3 seconds from remoteRef
  useEffect(() => {
    if (!remoteStream || isBlurred) return

    let cancelled = false
    let timer = null

    async function checkFrame() {
      if (cancelled || !remoteRef.current) return
      const video = remoteRef.current
      if (video.videoWidth > 0 && video.videoHeight > 0 && !video.paused) {
        try {
          await import('@tensorflow/tfjs')
          const nsfwjs = await import('nsfwjs')
          // Load self-hosted model from /nsfwjs/model.json with 224x224 input size
          const model = await nsfwjs.load('/nsfwjs/model.json', { size: 224 })
          if (cancelled) return

          const canvas = document.createElement('canvas')
          canvas.width = 224
          canvas.height = 224
          const ctx = canvas.getContext('2d')
          ctx.drawImage(video, 0, 0, 224, 224)

          const predictions = await model.classify(canvas)
          const porn = predictions.find((p) => p.className === 'Porn')?.probability || 0
          const hentai = predictions.find((p) => p.className === 'Hentai')?.probability || 0

          if (porn > 0.60 || (porn + hentai) > 0.70) {
            console.warn('[NSFWJS] Explicit content detected. Blurring video stream.')
            setIsBlurred(true)
            const flaggedId = `nsfw_${Date.now()}`
            setReportableId(flaggedId)
            onNSFWTrigger?.(flaggedId)
            return
          }
        } catch (err) {
          console.warn('[NSFWJS] Frame analysis skipped:', err.message)
        }
      }
      if (!cancelled) {
        timer = setTimeout(checkFrame, 3000)
      }
    }

    timer = setTimeout(checkFrame, 3000)
    return () => {
      cancelled = true
      if (timer) clearTimeout(timer)
    }
  }, [remoteStream, isBlurred, onNSFWTrigger])

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
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              filter: isBlurred ? 'blur(36px)' : 'none',
              transition: 'filter 0.25s ease',
            }}
          />
          {isBlurred && (
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background: 'rgba(0, 0, 0, 0.85)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 24,
                textAlign: 'center',
                zIndex: 25,
              }}
            >
              <div style={{ fontSize: 36, marginBottom: 12 }}>🛡️</div>
              <div style={{ fontSize: 20, fontWeight: 700, color: '#fff', marginBottom: 8 }}>
                This stream was blurred for safety
              </div>
              <p style={{ fontSize: 13.5, color: 'rgba(255, 255, 255, 0.85)', maxWidth: 360, margin: '0 0 20px', lineHeight: 1.5 }}>
                Automated on-device safety detection identified explicit content. The video feed was blurred immediately and disconnected. Frames never leave your browser.
              </p>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center' }}>
                <button
                  type="button"
                  onClick={() => onReportViolation?.(reportableId)}
                  style={{
                    padding: '10px 20px',
                    borderRadius: 'var(--radius-pill)',
                    background: 'var(--danger)',
                    color: '#fff',
                    border: 'none',
                    fontSize: 13.5,
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  🚩 Report User
                </button>
                <button
                  type="button"
                  onClick={onFindNext}
                  style={{
                    padding: '10px 20px',
                    borderRadius: 'var(--radius-pill)',
                    background: 'rgba(255, 255, 255, 0.15)',
                    color: '#fff',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    fontSize: 13.5,
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Find Next Person →
                </button>
              </div>
            </div>
          )}
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

function ChatInput({ value, onChange, onSend, placeholder, inputRef, onNext }) {
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

  // miloo-autofocus: chat shuru hote hi cursor input mein
  React.useEffect(() => {
    const t = setTimeout(() => {
      const el = textareaRef.current
      if (el && el.offsetParent !== null) el.focus({ preventScroll: true })
    }, 80)
    return () => clearTimeout(t)
  }, [])

  // miloo-next-inline: Esc = Next (sirf jab input khaali ho)
  React.useEffect(() => {
    if (!onNext) return undefined
    const h = (ev) => {
      if (ev.key !== 'Escape') return
      if (document.querySelector('[role="dialog"],[aria-modal="true"]')) return
      ev.preventDefault()
      ev.stopImmediatePropagation()
      const el = textareaRef.current
      if (el && el.value.trim()) return
      onNext()
    }
    window.addEventListener('keydown', h, true)
    return () => window.removeEventListener('keydown', h, true)
  }, [onNext])

  const pill = (
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

  if (!onNext) return pill

  const showEsc =
    typeof window !== 'undefined' &&
    window.matchMedia &&
    window.matchMedia('(hover: hover) and (pointer: fine)').matches

  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, width: '100%' }}>
      <button
        onClick={onNext}
        aria-label="Next partner"
        className="compact tactile-btn"
        style={{
          flexShrink: 0,
          minHeight: 48,
          padding: '10px 16px',
          borderRadius: 'var(--radius-md)',
          background: 'var(--rd-accent)',
          border: '1px solid var(--rd-accent)',
          color: '#ffffff',
          fontFamily: 'var(--font-body)',
          fontSize: 14,
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          cursor: 'pointer',
          transition: 'all 180ms ease-out',
        }}
      >
        Next
        {showEsc && (
          <span
            aria-hidden="true"
            style={{
              fontSize: 11,
              fontWeight: 600,
              padding: '2px 6px',
              borderRadius: 6,
              background: 'rgba(255,255,255,0.22)',
            }}
          >
            Esc
          </span>
        )}
      </button>
      <div style={{ flex: 1, minWidth: 0 }}>{pill}</div>
    </div>
  )
}
