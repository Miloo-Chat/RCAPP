import { useEffect } from 'react'

/**
 * AdSenseScript Component
 * Inactive while ADS_ENABLED is false.
 * For production advertising configuration and CSP integration,
 * see csp.ads-enabled.md.
 */
export default function AdSenseScript() {
  useEffect(() => {
    // Ad script disabled while ADS_ENABLED is false
    const existing = document.getElementById('adsense-public-script')
    if (existing) existing.remove()
  }, [])

  return null
}
