import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'

/**
 * =========================================================================
 * NOTE FOR EEA / UK AD COMPLIANCE:
 * =========================================================================
 * To comply with Google AdSense requirements and GDPR/UK regulations in the
 * European Economic Area (EEA) and the UK, publishers must deploy a Google-
 * certified Consent Management Platform (CMP) integrated with the IAB TCF v2.2.
 * 
 * Google provides a certified consent message (Funding Choices) configured
 * directly in:
 * AdSense Dashboard > Privacy & messaging > European regulations / GDPR.
 * 
 * When configured in the AdSense console, Google's ad script automatically
 * presents the certified CMP modal to visitors from the EEA and UK before
 * serving personalized ads.
 * 
 * The local CookieBanner component manages general site cookie preferences
 * and ensures that first-party advertising script injection only occurs after
 * the user has granted consent ('accepted').
 * =========================================================================
 */

// Allowed public content routes where AdSense is permitted
const ALLOWED_PUBLIC_PREFIXES = [
  '/',
  '/how-it-works',
  '/safety',
  '/faq',
  '/blog',
  '/about',
  '/contact',
  '/privacy',
  '/terms',
  '/community-guidelines',
]

// Disallowed routes: absolutely no ads here under any circumstances
const FORBIDDEN_ROUTES = ['/chat', '/call', '/admin']

function getStoredConsent() {
  if (typeof window === 'undefined') return null
  try {
    return localStorage.getItem('miloo_cookie_consent')
  } catch {
    return null
  }
}

export default function AdSenseScript() {
  const location = useLocation()
  const pathname = location.pathname
  const [consent, setConsent] = useState(getStoredConsent)

  // Listen for consent changes from CookieBanner
  useEffect(() => {
    const handleConsentChange = (e) => {
      const newConsent = e?.detail?.consent || getStoredConsent()
      setConsent(newConsent)
    }

    window.addEventListener('miloo_consent_change', handleConsentChange)
    return () => {
      window.removeEventListener('miloo_consent_change', handleConsentChange)
    }
  }, [])

  useEffect(() => {
    // 1. Safety check: ensure current route is NOT forbidden
    const isForbidden = FORBIDDEN_ROUTES.some(
      (route) => pathname === route || pathname.startsWith(`${route}/`)
    )
    if (isForbidden) {
      // If navigating to /chat, /call, or /admin, remove any ad script immediately
      const existing = document.getElementById('adsense-public-script')
      if (existing) existing.remove()
      return
    }

    // 2. Check if on allowed public route
    const isAllowed = ALLOWED_PUBLIC_PREFIXES.some((prefix) =>
      prefix === '/' ? pathname === '/' : pathname.startsWith(prefix)
    )
    if (!isAllowed) return

    // 3. Consent check: only load dynamically if consent is granted ('accepted')
    // If user selected 'essential', they opted out of advertising cookies
    if (consent !== 'accepted') {
      const existing = document.getElementById('adsense-public-script')
      if (existing && consent === 'essential') {
        existing.remove()
      }
      return
    }

    // 4. Avoid duplicate script injection
    if (document.getElementById('adsense-public-script')) return

    // 5. Inject Google AdSense snippet
    const script = document.createElement('script')
    script.id = 'adsense-public-script'
    script.async = true
    script.src =
      'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-4205636224784725'
    script.crossOrigin = 'anonymous'

    document.head.appendChild(script)
  }, [pathname, consent])

  return null
}
