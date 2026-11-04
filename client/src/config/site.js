// client/src/config/site.js
//
// Central site configuration for Miloo.
// All global constants (support email, domain, AdSense publisher ID, social links)
// can be replaced in ONE place here or overridden via environment variables.

export const SITE_CONFIG = {
  name: 'Miloo',
  tagline: 'Meet a real stranger',
  url: (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_SITE_URL) || 'https://miloo.chat',
  supportEmail: (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_SUPPORT_EMAIL) || 'support@miloo.chat',
  privacyEmail: (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_PRIVACY_EMAIL) || 'support@miloo.chat',
  dmcaEmail: (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_DMCA_EMAIL) || 'support@miloo.chat',
  adsensePublisherId: (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_ADSENSE_PUB_ID) || 'ca-pub-XXXXXXXXXXXXXXXX',
  twitterHandle: '@miloochat',

  // Privacy-friendly Umami Analytics (cookieless, self-hostable or cloud.umami.is)
  // Per official Umami docs: default Cloud host is https://cloud.umami.is
  umamiHost: (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_UMAMI_HOST) || '',
  umamiScriptUrl: (typeof import.meta !== 'undefined' && import.meta.env && (import.meta.env.VITE_UMAMI_SCRIPT_URL || (import.meta.env.VITE_UMAMI_HOST ? `${import.meta.env.VITE_UMAMI_HOST}/script.js` : ''))) || '',
  umamiWebsiteId: (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_UMAMI_WEBSITE_ID) || '',

  // Google Analytics 4 Measurement ID
  gaMeasurementId: (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_GA_MEASUREMENT_ID) || 'G-HCZVX1YH7B',

  // Cloudflare Turnstile site key (uses official Cloudflare testing key by default)
  turnstileSiteKey: (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_TURNSTILE_SITE_KEY) || '1x00000000000000000000AA',
}

export const SUPPORT_EMAIL = SITE_CONFIG.supportEmail
export const SITE_URL = SITE_CONFIG.url
export const ADSENSE_PUB_ID = SITE_CONFIG.adsensePublisherId
export const GA_MEASUREMENT_ID = SITE_CONFIG.gaMeasurementId
export const UMAMI_HOST = SITE_CONFIG.umamiHost
export const UMAMI_SCRIPT_URL = SITE_CONFIG.umamiScriptUrl
export const UMAMI_WEBSITE_ID = SITE_CONFIG.umamiWebsiteId
export const TURNSTILE_SITE_KEY = SITE_CONFIG.turnstileSiteKey

export const ADS_ENABLED =
  (typeof import.meta !== 'undefined' &&
    import.meta.env &&
    import.meta.env.VITE_ADS_ENABLED === 'true') ||
  false

// Controls display of riskier regional/alternative blog articles
export const SHOW_SEO_POSTS =
  (typeof import.meta !== 'undefined' &&
    import.meta.env &&
    import.meta.env.VITE_SHOW_SEO_POSTS === 'true') ||
  false

// Feature flags for interactive UI components
export const ENABLE_GOLDEN_HOURS =
  (typeof import.meta !== 'undefined' &&
    import.meta.env &&
    import.meta.env.VITE_ENABLE_GOLDEN_HOURS !== 'false') ??
  true

export const ENABLE_GOLDEN_HOUR_NOTIFICATIONS =
  (typeof import.meta !== 'undefined' &&
    import.meta.env &&
    import.meta.env.VITE_ENABLE_GOLDEN_HOUR_NOTIFICATIONS !== 'false') ??
  true

// Author information constant for all editorial safety and blog articles
export const ARTICLE_AUTHOR = {
  name: 'Miloo Safety & Editorial Team',
  role: 'Editorial & Safety Desk',
  bio: 'The Miloo Safety and Editorial Desk researches digital communication, WebRTC privacy, and online user safety to keep spontaneous conversations respectful, authentic, and secure.',
  teamAnchor: '/about#team',
}

// Grievance Officer (India IT Rules, 2021) single-source placeholders
export const GRIEVANCE_OFFICER = {
  name: '[Grievance Officer Name]',
  designation: 'Grievance Officer',
  email: '[grievance-officer@miloo.chat]',
  address: '[Postal Address / Registered Office Address, City, State, PIN, Country]',
  acknowledgementTime: '24 hours',
  resolutionTime: '15 days',
}

export default SITE_CONFIG
