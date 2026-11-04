# Content Security Policy (CSP) Configuration: Ads-Enabled Variant

This document specifies the exact Content Security Policy (CSP) required for **Miloo** when `ADS_ENABLED` is toggled to `true`.

---

## 1. Context & Architectural Overview

In normal operation (`ADS_ENABLED=false`):
- All advertising networks, third-party trackers, and ad exchanges are completely disabled.
- The CSP is tightly restricted to `'self'`, Cloudflare Turnstile (`https://challenges.cloudflare.com`), self-hosted or privacy-first analytics (`https://cloud.umami.is` / Umami host), and explicit backend socket/API origins.
- Bare schemes (`https:`, `wss:`, `ws:`) are strictly forbidden.

When Google AdSense (`ADS_ENABLED=true`) is activated:
- Google AdSense loader (`https://pagead2.googlesyndication.com`) and its ad serving infrastructure (`https://googleads.g.doubleclick.net`, `https://tpc.googlesyndication.com`, `https://www.google.com`) must be permitted.
- A Google-certified Consent Management Platform (CMP) under IAB TCF v2.2 (such as Google Funding Choices: `https://fundingchoicesmessages.google.com`) must be allowed to present the consent dialog to EEA/UK users.
- Ad iframes dynamically rendered across authorized editorial routes (`/blog/*`, `/faq`, `/about`, `/safety`, `/how-it-works`) must be permitted in `frame-src`.
- Sensitive private routes (`/chat`, `/call`, `/admin`) remain strictly ad-free and enforce separate ad-free policies.

---

## 2. Production CSP Header Comparison

### Current Production Baseline (`ADS_ENABLED=false`)

```http
Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline' https://challenges.cloudflare.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com data:; img-src 'self' data: blob:; connect-src 'self' https://challenges.cloudflare.com ${BACKEND_HTTP_ORIGIN} ${BACKEND_WSS_ORIGIN}; frame-src 'self' https://challenges.cloudflare.com; frame-ancestors 'none'; form-action 'self'; media-src 'self' blob: data:; worker-src 'self' blob:; object-src 'none'; base-uri 'self';
```

### Production Header when `ADS_ENABLED=true`

```http
Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline' https://challenges.cloudflare.com https://pagead2.googlesyndication.com https://googleads.g.doubleclick.net https://fundingchoicesmessages.google.com https://tpc.googlesyndication.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com data:; img-src 'self' data: blob: https://pagead2.googlesyndication.com https://googleads.g.doubleclick.net https://tpc.googlesyndication.com; connect-src 'self' https://challenges.cloudflare.com https://pagead2.googlesyndication.com https://googleads.g.doubleclick.net ${BACKEND_HTTP_ORIGIN} ${BACKEND_WSS_ORIGIN}; frame-src 'self' https://challenges.cloudflare.com https://googleads.g.doubleclick.net https://tpc.googlesyndication.com https://fundingchoicesmessages.google.com; frame-ancestors 'none'; form-action 'self'; media-src 'self' blob: data:; worker-src 'self' blob:; object-src 'none'; base-uri 'self';
```

---

## 3. Detailed Directive Breakdown (`ADS_ENABLED=true`)

| Directive | Origins / Directives | Purpose |
| :--- | :--- | :--- |
| `default-src` | `'self'` | Fallback default to first-party origin only |
| `script-src` | `'self'` `'unsafe-inline'` `https://challenges.cloudflare.com` `https://pagead2.googlesyndication.com` `https://googleads.g.doubleclick.net` `https://fundingchoicesmessages.google.com` `https://tpc.googlesyndication.com` | First-party assets, Cloudflare Turnstile, Google AdSense tag loader, Google-certified Funding Choices CMP |
| `style-src` | `'self'` `'unsafe-inline'` `https://fonts.googleapis.com` | First-party styling and Google Fonts |
| `font-src` | `'self'` `https://fonts.gstatic.com` `data:` | Google Fonts webfonts (woff2) and embedded data fonts |
| `img-src` | `'self'` `data:` `blob:` `https://pagead2.googlesyndication.com` `https://googleads.g.doubleclick.net` `https://tpc.googlesyndication.com` | Local images, avatars, canvas captures, and creative banner assets served by Google Ad networks |
| `connect-src` | `'self'` `https://challenges.cloudflare.com` `https://pagead2.googlesyndication.com` `https://googleads.g.doubleclick.net` `${BACKEND_HTTP_ORIGIN}` `${BACKEND_WSS_ORIGIN}` `${UMAMI_HOST}` | Real-time chat WebSockets, backend safety reporting APIs, Turnstile token checks, and AdSense ad telemetry |
| `frame-src` | `'self'` `https://challenges.cloudflare.com` `https://googleads.g.doubleclick.net` `https://tpc.googlesyndication.com` `https://fundingchoicesmessages.google.com` | Turnstile interactive verification iframe, Google AdSense sandboxed ad containers, and Funding Choices consent dialog |
| `frame-ancestors`| `'none'` | Strictly disallows embedding Miloo inside any iframe on any external domain (complete clickjacking mitigation) |
| `form-action` | `'self'` | Disallows form submissions to external endpoints |
| `media-src` | `'self'` `blob:` `data:` | WebRTC camera/audio mediastream tracks and fake test media streams |
| `worker-src` | `'self'` `blob:` | Service worker and WebGL / web workers |
| `object-src` | `'none'` | Blocks legacy Flash and plugins |
| `base-uri` | `'self'` | Restricts `<base href>` hijacking |

---

## 4. Evaluation of `'unsafe-inline'` & Nonce Constraints

- **Static Prerender Constraint**: Miloo generates pre-rendered static HTML (`client/prerender.js`) for rapid first paint, Zero-FOUC theme application, and maximum SEO indexability. These static HTML files are deployed to static Edge CDN hosting (e.g. Vercel / Cloudflare Pages).
- **Nonce Incompatibility**: Nonces require dynamic per-request generation on a live origin server or Edge middleware where each request generates a fresh cryptographic nonce and rewrites both HTTP headers and HTML tags. On static pre-rendered CDNs without compute middleware overhead, nonces cannot be provided per request.
- **Hashes Limitation**: While `<script>` tags can be hashed using SHA-256, inline event handlers (e.g. `onload="this.media='all'"` used for non-blocking CSS loading) are not covered by script hashes in CSP Level 2/3.
- **Wasm & Eval Note**: Neither `'unsafe-eval'` nor `'wasm-unsafe-eval'` is needed when using TensorFlow.js with the default WebGL shader pipeline. Only when `tfjs-backend-wasm` is explicitly selected would `'wasm-unsafe-eval'` be required; `'unsafe-eval'` is strictly forbidden.

---

## 5. Activating the Ads Variant in `vercel.json`

To switch to the ads-enabled configuration when monetization begins:
1. Update `VITE_ADS_ENABLED=true` in `client/.env`.
2. In `vercel.json` and `client/vercel.json`, update the `"Content-Security-Policy"` header string under `"source": "/(.*)"` to the ads-enabled variant above.
3. Verify that `verify_adsense_snippet.cjs` passes.
4. Redeploy to Vercel.

