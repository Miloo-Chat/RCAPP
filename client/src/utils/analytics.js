// client/src/utils/analytics.js
//
// Google Analytics 4 (GA4) with Consent Mode v2 & Umami Analytics Integration.
// Strictly loaded on public informational pages only.
// NEVER loaded inside /chat, /call, /admin, the age gate, or /transparency.
// NEVER logs or transmits message content, IPs, or personal identifiers.

import { GA_MEASUREMENT_ID, UMAMI_SCRIPT_URL, UMAMI_WEBSITE_ID } from '../config/site.js'

// Routes strictly exempt from all third-party analytics
const FORBIDDEN_ROUTES = ['/chat', '/call', '/admin', '/transparency']

// Allowed event names whitelist - ONLY these 5 approved events can ever be tracked
export const ALLOWED_EVENTS = new Set([
  'page_view',
  'click_text_chat',
  'click_video_chat',
  'age_gate_result',
  'share_click',
])

export function isPublicPage(pathname) {
  if (!pathname) return true
  return !FORBIDDEN_ROUTES.some(
    (forbidden) => pathname === forbidden || pathname.startsWith(`${forbidden}/`)
  )
}

function hasCookieConsent() {
  if (typeof window === 'undefined') return false
  try {
    return localStorage.getItem('miloo_cookie_consent') === 'accepted'
  } catch {
    return false
  }
}

// ---------------------------------------------------------------------------
// Google Analytics 4 Consent Mode v2 Setup (Default: Denied)
// ---------------------------------------------------------------------------
if (typeof window !== 'undefined') {
  window.dataLayer = window.dataLayer || []
  window.gtag = function () {
    window.dataLayer.push(arguments)
  }
  // Consent Mode v2: Default Denied on page initial load
  window.gtag('consent', 'default', {
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
    analytics_storage: 'denied',
  })
}

/**
 * Ensures analytics scripts are loaded ONLY on approved public routes
 * and ONLY after user acceptance in the cookie banner.
 * Teardown immediately removes analytics on /chat, /call, /admin, and /transparency.
 */
export function syncAnalyticsWithRoute(pathname) {
  if (typeof window === 'undefined' || typeof document === 'undefined') return

  const gaScriptId = 'ga4-gtag-script'
  const existingGa = document.getElementById(gaScriptId)
  const isAllowedRoute = isPublicPage(pathname)
  const isConsented = hasCookieConsent()

  // 1. Guard against forbidden routes or missing consent
  if (!isAllowedRoute || !isConsented) {
    // Teardown GA4 script immediately
    if (existingGa) {
      existingGa.remove()
    }
    if (GA_MEASUREMENT_ID) {
      window[`ga-disable-${GA_MEASUREMENT_ID}`] = true
    }
    if (typeof window.gtag === 'function') {
      window.gtag('consent', 'update', {
        ad_storage: 'denied',
        ad_user_data: 'denied',
        ad_personalization: 'denied',
        analytics_storage: 'denied',
      })
    }
    return
  }

  // 2. User consented & on public page -> Grant consent & load GA4
  if (GA_MEASUREMENT_ID) {
    window[`ga-disable-${GA_MEASUREMENT_ID}`] = false

    if (typeof window.gtag === 'function') {
      window.gtag('consent', 'update', {
        analytics_storage: 'granted',
        ad_storage: 'granted',
        ad_user_data: 'granted',
        ad_personalization: 'granted',
      })
    }

    if (!existingGa) {
      const script = document.createElement('script')
      script.id = gaScriptId
      script.async = true
      script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`
      document.head.appendChild(script)

      window.gtag('js', new Date())
      window.gtag('config', GA_MEASUREMENT_ID, {
        anonymize_ip: true,
        send_page_view: false, // Pageviews are controlled manually
      })
    }
  }

  // 3. Optional Umami loader for cookieless stats
  const umamiScriptId = 'umami-analytics-script'
  const existingUmami = document.getElementById(umamiScriptId)
  const PLACEHOLDER_ID = '00000000-0000-0000-0000-000000000000'
  const isValidUmami = UMAMI_WEBSITE_ID && UMAMI_WEBSITE_ID !== PLACEHOLDER_ID

  if (isAllowedRoute && isValidUmami && UMAMI_SCRIPT_URL && !existingUmami) {
    const uScript = document.createElement('script')
    uScript.id = umamiScriptId
    uScript.async = true
    uScript.defer = true
    uScript.src = UMAMI_SCRIPT_URL
    uScript.setAttribute('data-website-id', UMAMI_WEBSITE_ID)
    uScript.setAttribute('data-auto-track', 'false')
    document.head.appendChild(uScript)
  }
}

// React to CookieBanner consent choices dynamically
if (typeof window !== 'undefined') {
  window.addEventListener('miloo_consent_change', () => {
    syncAnalyticsWithRoute(window.location.pathname)
  })
}

/**
 * Track an approved event in GA4 & Umami.
 * Strictly sends only the 5 approved events. No user-identifying parameters.
 */
export const trackEvent = (eventName, params = {}) => {
  if (typeof window === 'undefined') return

  // 1. Strictly forbidden inside /chat, /call, /admin, or /transparency
  const pathname = window.location.pathname || ''
  if (!isPublicPage(pathname)) return

  // 2. Strict event whitelist
  if (!ALLOWED_EVENTS.has(eventName)) return

  // 3. Requires explicit cookie consent
  if (!hasCookieConsent()) return

  // 4. Sanitize parameters: strictly remove user IDs, IPs, message content, tokens
  const sanitized = {}
  const FORBIDDEN_PARAM_KEYS = new Set([
    'text', 'message', 'content', 'transcript', 'ip', 'ipHash',
    'clientId', 'userId', 'fingerprint', 'user_id', 'client_id',
    'token', 'turnstileToken', 'socketId',
  ])

  for (const [key, val] of Object.entries(params)) {
    if (FORBIDDEN_PARAM_KEYS.has(key)) continue
    if (typeof val === 'string' || typeof val === 'number' || typeof val === 'boolean') {
      sanitized[key] = val
    }
  }

  // Google Analytics 4
  if (typeof window.gtag === 'function' && GA_MEASUREMENT_ID && !window[`ga-disable-${GA_MEASUREMENT_ID}`]) {
    try {
      window.gtag('event', eventName, sanitized)
    } catch {
      // ignore
    }
  }

  // Umami (if loaded)
  if (typeof window.umami !== 'undefined' && typeof window.umami.track === 'function') {
    try {
      window.umami.track(eventName, sanitized)
    } catch {
      // ignore
    }
  }
}

/**
 * Track page view with URL on public pages
 */
export const trackPageView = (pathname) => {
  if (typeof window === 'undefined') return
  if (!isPublicPage(pathname)) return

  trackEvent('page_view', {
    page_path: pathname,
  })
}

// Stub for legacy callers
export function initWebVitals() {}
