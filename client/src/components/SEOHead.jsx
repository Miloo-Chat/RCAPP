import { useEffect } from 'react'
import { ADSENSE_PUB_ID } from '../config/site'

/**
 * Reusable SEO component to manage document title, meta description,
 * canonical URL, robots, open-graph tags, AdSense account verification meta tag,
 * and optional JSON-LD structured data.
 */
export default function SEOHead({
  title,
  description,
  canonicalUrl,
  ogType = 'website',
  ogImage = 'https://miloo.chat/og-image.png',
  schemaJson,
  noindex = false,
}) {
  useEffect(() => {
    if (title) {
      document.title = title
    }

    // Update meta description
    if (description) {
      let descMeta = document.querySelector('meta[name="description"]')
      if (!descMeta) {
        descMeta = document.createElement('meta')
        descMeta.setAttribute('name', 'description')
        document.head.appendChild(descMeta)
      }
      descMeta.setAttribute('content', description)
    }

    // Update canonical link
    const canonical = canonicalUrl || window.location.href.split('?')[0].split('#')[0]
    let canonicalTag = document.querySelector('link[rel="canonical"]')
    if (!canonicalTag) {
      canonicalTag = document.createElement('link')
      canonicalTag.setAttribute('rel', 'canonical')
      document.head.appendChild(canonicalTag)
    }
    canonicalTag.setAttribute('href', canonical)

    // Ensure robots is configured correctly
    let robotsMeta = document.querySelector('meta[name="robots"]')
    if (!robotsMeta) {
      robotsMeta = document.createElement('meta')
      robotsMeta.setAttribute('name', 'robots')
      document.head.appendChild(robotsMeta)
    }
    robotsMeta.setAttribute('content', noindex ? 'noindex' : 'index, follow')

    // AdSense verification meta tag (loads no ads, sets no cookies)
    let adsenseMeta = document.querySelector('meta[name="google-adsense-account"]')
    if (!adsenseMeta) {
      adsenseMeta = document.createElement('meta')
      adsenseMeta.setAttribute('name', 'google-adsense-account')
      document.head.appendChild(adsenseMeta)
    }
    adsenseMeta.setAttribute('content', ADSENSE_PUB_ID)

    // OpenGraph Title & Description
    const setMetaProperty = (prop, content) => {
      let tag = document.querySelector(`meta[property="${prop}"]`)
      if (!tag) {
        tag = document.createElement('meta')
        tag.setAttribute('property', prop)
        document.head.appendChild(tag)
      }
      tag.setAttribute('content', content)
    }

    if (title) setMetaProperty('og:title', title)
    if (description) setMetaProperty('og:description', description)
    if (canonical) setMetaProperty('og:url', canonical)
    if (ogType) setMetaProperty('og:type', ogType)
    if (ogImage) setMetaProperty('og:image', ogImage)

    // Inject JSON-LD schema if provided
    let scriptTag = null
    if (schemaJson) {
      scriptTag = document.createElement('script')
      scriptTag.type = 'application/ld+json'
      scriptTag.id = 'page-schema-jsonld'
      scriptTag.text = typeof schemaJson === 'string' ? schemaJson : JSON.stringify(schemaJson)
      document.head.appendChild(scriptTag)
    }

    return () => {
      if (scriptTag && scriptTag.parentNode) {
        scriptTag.parentNode.removeChild(scriptTag)
      }
    }
  }, [title, description, canonicalUrl, ogType, ogImage, schemaJson, noindex])

  return null
}
