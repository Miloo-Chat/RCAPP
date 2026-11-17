// client/src/utils/turnstileGate.js
//
// Silent, background Cloudflare Turnstile verification.
//
// Goal: the visitor should NEVER have to tap inside a checkbox box.
//  - The check starts by itself a moment after the page opens (no waiting for interaction).
//  - The token is stored in localStorage (+ sessionStorage), so new tabs / returning
//    visitors within ~2h are not asked again.
//  - When the user taps Text / Video / Voice chat we only wait for the already-running
//    background check. The visible modal is a FALLBACK, shown only if Cloudflare says
//    it really needs a human interaction, or the background check fails.

import { TURNSTILE_SITE_KEY } from '../config/site'

const SERVER_URL = import.meta.env.VITE_SERVER_URL || ''
const TOKEN_KEY = 'miloo_turnstile_token'
const VERIFIED_KEY = 'miloo_turnstile_verified'
const SCRIPT_ID = 'cloudflare-turnstile-script'
const SCRIPT_SRC = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit'
const TTL_MS = 110 * 60 * 1000 // server accepts 2h; keep a safety margin

function isFresh(token) {
  const ts = Number(String(token || '').split(':')[0])
  return !!ts && Date.now() - ts < TTL_MS
}

/** Returns a valid verification token, or null. Syncs localStorage -> sessionStorage. */
export function getStoredToken() {
  if (typeof window === 'undefined') return null
  try {
    const sTok = sessionStorage.getItem(TOKEN_KEY)
    if (sessionStorage.getItem(VERIFIED_KEY) === 'true' && isFresh(sTok)) return sTok
  } catch { /* ignore */ }
  try {
    const lTok = localStorage.getItem(TOKEN_KEY)
    if (isFresh(lTok)) {
      try {
        sessionStorage.setItem(TOKEN_KEY, lTok)
        sessionStorage.setItem(VERIFIED_KEY, 'true')
      } catch { /* ignore */ }
      return lTok
    }
  } catch { /* ignore */ }
  return null
}

export function storeToken(token) {
  try {
    sessionStorage.setItem(TOKEN_KEY, token)
    sessionStorage.setItem(VERIFIED_KEY, 'true')
  } catch { /* ignore */ }
  try {
    localStorage.setItem(TOKEN_KEY, token)
  } catch { /* ignore */ }
}

export function hasFreshVerification() {
  return !!getStoredToken()
}

/** Exchange a Turnstile token for Miloo's own verification token. Resolves to token or null. */
export async function verifyOnServer(turnstileToken) {
  const res = await fetch(`${SERVER_URL}/api/verify-turnstile`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token: turnstileToken }),
  })
  const data = await res.json()
  return res.ok && data.verified && data.verificationToken ? data.verificationToken : null
}

/** Loads the Turnstile script once. Resolves when window.turnstile is ready, else rejects. */
export function loadTurnstileScript(maxWaitMs = 8000) {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') return reject(new Error('no window'))
    if (window.turnstile) return resolve(window.turnstile)
    if (!document.getElementById(SCRIPT_ID)) {
      const s = document.createElement('script')
      s.id = SCRIPT_ID
      s.src = SCRIPT_SRC
      s.async = true
      s.defer = true
      s.onerror = () => reject(new Error('turnstile script blocked'))
      document.head.appendChild(s)
    }
    const started = Date.now()
    const poll = setInterval(() => {
      if (window.turnstile) {
        clearInterval(poll)
        resolve(window.turnstile)
      } else if (Date.now() - started > maxWaitMs) {
        clearInterval(poll)
        reject(new Error('turnstile script timeout'))
      }
    }, 60)
  })
}

let inflight = null

function runSilentCheck() {
  return new Promise((resolve) => {
    let widgetId = null
    let host = null
    let settled = false

    const finish = (ok) => {
      if (settled) return
      settled = true
      try { if (widgetId !== null) window.turnstile.remove(widgetId) } catch { /* ignore */ }
      if (host) host.remove()
      resolve(ok)
    }

    loadTurnstileScript()
      .then((turnstile) => {
        host = document.createElement('div')
        host.id = 'miloo-turnstile-silent'
        host.style.cssText = 'position:fixed;right:12px;bottom:12px;z-index:10000'
        document.body.appendChild(host)

        widgetId = turnstile.render(host, {
          sitekey: TURNSTILE_SITE_KEY,
          appearance: 'interaction-only', // invisible unless Cloudflare really needs the human
          // Cloudflare needs a click/puzzle -> give up silently, the modal will take over
          'before-interactive-callback': () => finish(false),
          callback: async (token) => {
            try {
              const vToken = await verifyOnServer(token)
              if (vToken) storeToken(vToken)
              finish(!!vToken)
            } catch {
              finish(false)
            }
          },
          'error-callback': () => finish(false),
          'timeout-callback': () => finish(false),
          'expired-callback': () => finish(false),
        })
      })
      .catch(() => finish(false))
  })
}

/**
 * Resolves true as soon as the visitor is verified (instantly if a fresh token exists),
 * false if a visible challenge is needed / it failed / it took longer than timeoutMs.
 * Many callers share one single background check.
 */
export function ensureVerified(timeoutMs = 8000) {
  if (hasFreshVerification()) return Promise.resolve(true)
  if (!inflight) {
    inflight = runSilentCheck().finally(() => {
      inflight = null
    })
  }
  return Promise.race([
    inflight,
    new Promise((resolve) => setTimeout(() => resolve(hasFreshVerification()), timeoutMs)),
  ])
}

// ── Start warming up right after the page opens (no need to wait for a tap) ──
if (typeof window !== 'undefined') {
  getStoredToken() // copy localStorage token into sessionStorage for ChatRoom
  const isBot = navigator.webdriver || /bot|crawl|spider|lighthouse|headless/i.test(navigator.userAgent)
  if (!isBot && !hasFreshVerification()) {
    const start = () => ensureVerified(0)
    if ('requestIdleCallback' in window) window.requestIdleCallback(start, { timeout: 1200 })
    else setTimeout(start, 400)
  }
}
