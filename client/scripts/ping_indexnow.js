// client/scripts/ping_indexnow.js
// Production deploy step that pings IndexNow (Bing, Yandex, Seznam, Naver).
//
// Rules:
// 1. Never ping from local, preview, or development builds.
// 2. Only run during production deploy step (--production flag or VERCEL_ENV=production).
// 3. Confirm https://miloo.chat/<key>.txt returns HTTP 200 with the exact key inside before pinging.
// 4. Exclude all noindex and private URLs (/chat, /call, /admin, /404, /cookie, and hidden posts).

import https from 'node:https'
import { SHOW_SEO_POSTS } from '../src/config/site.js'

export const INDEXNOW_KEY = '902d1d9dc4e41ddc387811ffd6b99f38'
export const HOST = 'miloo.chat'

// Strictly indexable public canonical routes
export const INDEXABLE_CORE_URLS = [
  'https://miloo.chat/',
  'https://miloo.chat/how-it-works',
  'https://miloo.chat/safety',
  'https://miloo.chat/faq',
  'https://miloo.chat/about',
  'https://miloo.chat/contact',
  'https://miloo.chat/transparency',
  'https://miloo.chat/privacy',
  'https://miloo.chat/terms',
  'https://miloo.chat/community-guidelines',
  'https://miloo.chat/cookie-policy',
  'https://miloo.chat/blog',
  'https://miloo.chat/blog/stay-safe-talking-to-strangers-online',
  'https://miloo.chat/blog/how-to-spot-scams-on-chat-sites',
  'https://miloo.chat/blog/protecting-privacy-in-video-chat',
  'https://miloo.chat/blog/how-to-report-and-block-abusive-users',
  'https://miloo.chat/blog/tips-for-starting-good-conversation-with-stranger',
  'https://miloo.chat/blog/what-to-do-if-someone-harasses-you-online',
]

// Optional SEO posts (strictly excluded when SHOW_SEO_POSTS is false)
export const OPTIONAL_SEO_URLS = [
  'https://miloo.chat/blog/omegle-alternative',
  'https://miloo.chat/blog/random-video-chat-india',
  'https://miloo.chat/blog/stranger-chat-india',
  'https://miloo.chat/blog/video-chat-no-signup',
]

// Strictly excluded noindex URLs
export const NOINDEX_EXCLUSIONS = [
  '/chat',
  '/call',
  '/admin',
  '/404',
  '/cookie',
]

export function getSanitizedUrlList() {
  const urlList = [...INDEXABLE_CORE_URLS]
  if (SHOW_SEO_POSTS) {
    urlList.push(...OPTIONAL_SEO_URLS)
  }
  return urlList.filter((url) => {
    return !NOINDEX_EXCLUSIONS.some((exclusion) => url.endsWith(exclusion) || url.includes(`${exclusion}/`))
  })
}

export function verifyKeyFileOnline(keyUrl, expectedKey, maxRedirects = 3) {
  return new Promise((resolve) => {
    https
      .get(keyUrl, { timeout: 8000 }, (res) => {
        if ([301, 302, 307, 308].includes(res.statusCode) && res.headers.location && maxRedirects > 0) {
          const redirectUrl = new URL(res.headers.location, keyUrl).toString()
          return resolve(verifyKeyFileOnline(redirectUrl, expectedKey, maxRedirects - 1))
        }
        if (res.statusCode !== 200) {
          resolve({ ok: false, status: res.statusCode })
          return
        }
        let data = ''
        res.on('data', (chunk) => {
          data += chunk
        })
        res.on('end', () => {
          const body = data.trim()
          resolve({ ok: body === expectedKey, status: 200, body })
        })
      })
      .on('error', (err) => {
        resolve({ ok: false, error: err.message })
      })
  })
}

export async function pingIndexNow(options = {}) {
  const isProductionDeploy =
    options.forceProduction ||
    process.env.VERCEL_ENV === 'production' ||
    process.env.DEPLOY_ENV === 'production' ||
    process.argv.includes('--production')

  if (!isProductionDeploy) {
    console.log('[IndexNow] Skipping ping: IndexNow is strictly configured to run only during production deploy.')
    return { skipped: true, reason: 'not_production_deploy' }
  }

  // 1. Build and sanitize URL list (strictly exclude noindex)
  const urlList = [...INDEXABLE_CORE_URLS]
  if (SHOW_SEO_POSTS) {
    urlList.push(...OPTIONAL_SEO_URLS)
  }

  // Filter out any accidentally added noindex or private URLs
  const sanitizedUrls = urlList.filter((url) => {
    return !NOINDEX_EXCLUSIONS.some((exclusion) => url.endsWith(exclusion) || url.includes(`${exclusion}/`))
  })

  // 2. Pre-flight check: confirm https://miloo.chat/<key>.txt returns HTTP 200 with matching key
  const keyLocation = `https://${HOST}/${INDEXNOW_KEY}.txt`
  console.log(`[IndexNow] Pre-flight verification: checking ${keyLocation}...`)

  if (!options.skipOnlineCheck) {
    const check = await verifyKeyFileOnline(keyLocation, INDEXNOW_KEY)
    if (!check.ok) {
      console.warn(
        `[IndexNow] Pre-flight check failed! ${keyLocation} did not return HTTP 200 with matching key (Status: ${check.status || check.error}). Aborting ping.`
      )
      return { skipped: true, reason: 'key_verification_failed', details: check }
    }
    console.log(`✓ [IndexNow] Verified key file online: HTTP 200 with matching key content.`)
  }

  // 3. Dispatch payload to api.indexnow.org
  const payload = JSON.stringify({
    host: HOST,
    key: INDEXNOW_KEY,
    keyLocation,
    urlList: sanitizedUrls,
  })

  console.log(`[IndexNow] Dispatching ping for ${sanitizedUrls.length} indexable URLs to api.indexnow.org...`)

  return new Promise((resolve) => {
    const req = https.request(
      'https://api.indexnow.org/indexnow',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          'Content-Length': Buffer.byteLength(payload),
        },
        timeout: 5000,
      },
      (res) => {
        let data = ''
        res.on('data', (chunk) => (data += chunk))
        res.on('end', () => {
          console.log(`✓ [IndexNow] Response status: ${res.statusCode} (${res.statusMessage || 'OK'})`)
          resolve({ status: res.statusCode, body: data, count: sanitizedUrls.length })
        })
      }
    )

    req.on('error', (err) => {
      console.warn(`[IndexNow] Ping warning (non-blocking): ${err.message}`)
      resolve({ status: null, error: err.message })
    })

    req.on('timeout', () => {
      req.destroy()
      console.warn(`[IndexNow] Request timed out.`)
      resolve({ status: 408 })
    })

    req.write(payload)
    req.end()
  })
}

// Direct CLI invocation
if (process.argv[1] && process.argv[1].endsWith('ping_indexnow.js')) {
  pingIndexNow().then((result) => {
    console.log('[IndexNow] Execution complete:', result)
  })
}
