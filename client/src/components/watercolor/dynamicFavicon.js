// client/src/components/watercolor/dynamicFavicon.js
//
// Dynamic Favicon, Theme Color & Tab Title Manager for Miloo:
// - Updates the browser favicon every 5 minutes from the local time theme:
//   * dawn (5:00 - 7:30): pale rose-gold sun
//   * morning (7:30 - 11:00): lemon sun
//   * noon (11:00 - 14:00): golden sun
//   * afternoon (14:00 - 17:00): honey sun
//   * sunset (17:00 - 19:30): terracotta sun
//   * dusk (19:30 - 21:00): lavender moon
//   * night (21:00 - 5:00): pale moon with a tiny star
// - Draws on a 32x32 canvas and sets it as the <link rel="icon">
// - Updates <meta name="theme-color"> to match the paper color of current theme
// - Tab title: "miloo · Meet a real stranger". When tab is hidden: "come back, a bird is waiting"

export function getFaviconThemeTokens(hour) {
  const h = ((hour % 24) + 24) % 24

  if (h >= 5.0 && h < 7.5) {
    // Dawn: pale rose-gold sun
    return {
      sunInner: '#FCECE8',
      sunOuter: '#E8A08C',
      sunRim: '#D4806A',
      paperColor: '#F5EDE8',
      wireColor: '#1A1A1A',
      birdColor: '#1A1A1A',
      hasStar: false,
    }
  } else if (h >= 7.5 && h < 11.0) {
    // Morning: lemon sun
    return {
      sunInner: '#FFFCEB',
      sunOuter: '#F5E278',
      sunRim: '#DFCA52',
      paperColor: '#F7F5EE',
      wireColor: '#1A1A1A',
      birdColor: '#1A1A1A',
      hasStar: false,
    }
  } else if (h >= 11.0 && h < 14.0) {
    // Noon: golden sun
    return {
      sunInner: '#FFF7DD',
      sunOuter: '#F2D98F',
      sunRim: '#D9AF4E',
      paperColor: '#F5F3ED',
      wireColor: '#1A1A1A',
      birdColor: '#1A1A1A',
      hasStar: false,
    }
  } else if (h >= 14.0 && h < 17.0) {
    // Afternoon: honey sun
    return {
      sunInner: '#FFF0D0',
      sunOuter: '#EBB860',
      sunRim: '#D09538',
      paperColor: '#F6EFE3',
      wireColor: '#1A1A1A',
      birdColor: '#1A1A1A',
      hasStar: false,
    }
  } else if (h >= 17.0 && h < 19.5) {
    // Sunset: terracotta sun
    return {
      sunInner: '#FCE7D8',
      sunOuter: '#E8A074',
      sunRim: '#C46838',
      paperColor: '#EDE6DB',
      wireColor: '#1A1A1A',
      birdColor: '#1A1A1A',
      hasStar: false,
    }
  } else if (h >= 19.5 && h < 21.0) {
    // Dusk: lavender moon
    return {
      sunInner: '#E9E3F2',
      sunOuter: '#C5B8D8',
      sunRim: '#9B88B4',
      paperColor: '#242232',
      wireColor: '#C4B8D8',
      birdColor: '#EBE5F5',
      hasStar: true,
    }
  } else {
    // Night: pale moon with a tiny star
    return {
      sunInner: '#EBF0F8',
      sunOuter: '#D6DCE8',
      sunRim: '#9EACC4',
      paperColor: '#121726',
      wireColor: '#BAC6D9',
      birdColor: '#F0F3F8',
      hasStar: true,
    }
  }
}

/**
 * Renders the theme-aware favicon onto a 32x32 canvas and returns dataURL
 */
export function generateFaviconDataUrl(hour) {
  if (typeof document === 'undefined') return null

  const canvas = document.createElement('canvas')
  canvas.width = 32
  canvas.height = 32
  const ctx = canvas.getContext('2d')
  if (!ctx) return null

  const tokens = getFaviconThemeTokens(hour)

  ctx.clearRect(0, 0, 32, 32)

  // 1. Sun / Moon Watercolor circle (radius 12.5)
  const grad = ctx.createRadialGradient(16, 16, 2, 16, 16, 13)
  grad.addColorStop(0, tokens.sunInner)
  grad.addColorStop(0.75, tokens.sunOuter)
  grad.addColorStop(1, tokens.sunRim)

  ctx.beginPath()
  ctx.arc(16, 16, 12.5, 0, Math.PI * 2)
  ctx.fillStyle = grad
  ctx.fill()

  // 2. Faint soft watercolor edge
  ctx.lineWidth = 0.8
  ctx.strokeStyle = tokens.sunRim
  ctx.globalAlpha = 0.35
  ctx.stroke()
  ctx.globalAlpha = 1.0

  // 3. Tiny star at night/dusk (top right inside or just outside rim)
  if (tokens.hasStar) {
    ctx.fillStyle = '#FFFFFF'
    ctx.beginPath()
    // 4-point sparkle star at (24, 7)
    ctx.moveTo(24, 5.5)
    ctx.lineTo(24.6, 6.8)
    ctx.lineTo(26, 7.2)
    ctx.lineTo(24.6, 7.6)
    ctx.lineTo(24, 9)
    ctx.lineTo(23.4, 7.6)
    ctx.lineTo(22, 7.2)
    ctx.lineTo(23.4, 6.8)
    ctx.closePath()
    ctx.fill()
  }

  // 4. Thin diagonal ink wire sloping downward ~10 deg across the disc
  ctx.beginPath()
  ctx.moveTo(3, 14)
  ctx.lineTo(29, 18.5)
  ctx.strokeStyle = tokens.wireColor
  ctx.lineWidth = 1.2
  ctx.lineCap = 'round'
  ctx.stroke()

  // 5. One small black bird perched on the wire at x=17, y=16.5
  ctx.save()
  ctx.translate(17, 16.5)
  ctx.fillStyle = tokens.birdColor
  // Bird body (feet at y=0, head at y=-3.8)
  ctx.beginPath()
  ctx.ellipse(-0.5, -2.0, 1.8, 2.5, -0.15, 0, Math.PI * 2)
  ctx.fill()

  // Head
  ctx.beginPath()
  ctx.arc(-1.2, -3.8, 1.2, 0, Math.PI * 2)
  ctx.fill()

  // Beak
  ctx.beginPath()
  ctx.moveTo(-2.2, -3.8)
  ctx.lineTo(-3.4, -3.8)
  ctx.lineTo(-2.2, -3.2)
  ctx.closePath()
  ctx.fill()

  // Hanging tail
  ctx.beginPath()
  ctx.moveTo(0.5, -1.0)
  ctx.lineTo(1.8, 2.0)
  ctx.lineTo(0.2, 1.5)
  ctx.closePath()
  ctx.fill()

  ctx.restore()

  return canvas.toDataURL('image/png')
}

/**
 * Initializes the Dynamic Favicon, Theme Color, and Tab Title listeners.
 */
export function initDynamicFaviconAndTitle(getHour = () => new Date().getHours() + new Date().getMinutes() / 60) {
  if (typeof window === 'undefined') return () => {}

  const updateFaviconAndTheme = () => {
    try {
      const h = getHour()
      const dataUrl = generateFaviconDataUrl(h)
      if (dataUrl) {
        let link = document.querySelector("link[rel*='icon']")
        if (!link) {
          link = document.createElement('link')
          link.rel = 'icon'
          document.head.appendChild(link)
        }
        link.type = 'image/png'
        link.href = dataUrl
      }

      // Update meta theme-color
      const tokens = getFaviconThemeTokens(h)
      let metaTheme = document.querySelector("meta[name='theme-color']")
      if (!metaTheme) {
        metaTheme = document.createElement('meta')
        metaTheme.name = 'theme-color'
        document.head.appendChild(metaTheme)
      }
      metaTheme.content = tokens.paperColor
    } catch {
      // ignore
    }
  }

  // Initial update
  updateFaviconAndTheme()

  // Recurring update every 5 minutes (300,000 ms)
  const timer = setInterval(updateFaviconAndTheme, 300000)

  // Tab visibility title change
  const originalTitle = 'miloo · Meet a real stranger'
  const handleVisibility = () => {
    if (document.hidden) {
      document.title = 'come back, a bird is waiting'
    } else {
      document.title = originalTitle
    }
  }

  document.addEventListener('visibilitychange', handleVisibility)

  return () => {
    clearInterval(timer)
    document.removeEventListener('visibilitychange', handleVisibility)
  }
}

