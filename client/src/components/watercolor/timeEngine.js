// client/src/components/watercolor/timeEngine.js
//
// Continuous Time & Atmosphere Engine for Miloo Watercolor Homepage.
// Interpolates paper colors, sun/moon position, opacities, wire tint,
// and bird behavior across a 24-hour cycle matching the reference watercolor painting.

import { useState, useEffect, useMemo, useCallback } from 'react'

/**
 * 24-hour atmosphere keyframes.
 * Each keyframe defines the exact palette and scene geometry.
 * Values between keyframes are smoothly interpolated with zero abrupt steps.
 */
export const TIME_KEYFRAMES = [
  {
    hour: 0.0, // Night (21-05: paper #1A2140, moon #E4E8F3 at 90%, wires #DCE1EC at 85%, birds #090D1B rim rgba(228,232,243,0.5), text #F3EFE6)
    name: 'Night',
    paperBg: [26, 33, 64], // #1A2140
    paperVignette: [14, 18, 38, 0.35],
    sunOpacity: 0.0,
    sunX: 50,
    sunY: 80,
    sunRadius: 160,
    sunColor: [224, 121, 79],
    sunRim: [186, 92, 54],
    moonOpacity: 0.90, // #E4E8F3 at 90%
    moonColor: [228, 232, 243], // #E4E8F3
    moonRim: [168, 180, 204],
    moonHalo: [186, 198, 217],
    moonX: 50,
    moonY: 34,
    moonRadius: 210,
    starsOpacity: 0.55, // 10 stars visible at night
    firefliesOpacity: 0.0,
    wireColor: [220, 225, 236, 0.85], // #DCE1EC at 85%
    birdSilhouette: [9, 13, 27], // #090D1B
    birdRimColor: [228, 232, 243, 0.5], // 1px rim
    textColor: [243, 239, 230], // #F3EFE6
    subtextColor: [185, 195, 212],
    sunsetWashOpacity: 0.0,
    cloudOpacity: 0.0,
    activeBirdRatio: 0.25,
  },
  {
    hour: 5.0, // Dawn (05-07: paper #F4E4DC, sun #F2C4A0)
    name: 'Dawn',
    paperBg: [244, 228, 220], // #F4E4DC
    paperVignette: [0, 0, 0, 0],
    sunOpacity: 0.75,
    sunX: 50,
    sunY: 36,
    sunRadius: 210,
    sunColor: [242, 196, 160], // #F2C4A0
    sunRim: [212, 136, 94], // pooled edge for >= 1.5:1 contrast
    sunHalo: [250, 228, 214],
    moonOpacity: 0.0,
    moonColor: [228, 232, 243],
    moonRim: [168, 180, 204],
    moonHalo: [186, 198, 217],
    moonX: 85,
    moonY: 60,
    moonRadius: 80,
    starsOpacity: 0.0,
    firefliesOpacity: 0.0,
    wireColor: [26, 26, 26, 1.0], // #1A1A1A
    birdSilhouette: [26, 26, 26], // #1A1A1A
    birdRimColor: [0, 0, 0, 0],
    textColor: [26, 26, 26], // #1A1A1A
    subtextColor: [95, 90, 85],
    sunsetWashOpacity: 0.0,
    cloudOpacity: 0.0,
    activeBirdRatio: 0.5,
  },
  {
    hour: 7.0, // Morning (07-11: paper #F7F1E3, sun #F6E08A)
    name: 'Morning',
    paperBg: [247, 241, 227], // #F7F1E3
    paperVignette: [0, 0, 0, 0],
    sunOpacity: 0.75,
    sunX: 50,
    sunY: 36,
    sunRadius: 210,
    sunColor: [246, 224, 138], // #F6E08A
    sunRim: [218, 172, 54], // #DAAC36
    sunHalo: [250, 240, 192],
    moonOpacity: 0.0,
    moonColor: [228, 232, 243],
    moonRim: [168, 180, 204],
    moonHalo: [186, 198, 217],
    moonX: 85,
    moonY: 60,
    moonRadius: 80,
    starsOpacity: 0.0,
    firefliesOpacity: 0.0,
    wireColor: [26, 26, 26, 1.0], // #1A1A1A
    birdSilhouette: [26, 26, 26], // #1A1A1A
    birdRimColor: [0, 0, 0, 0],
    textColor: [26, 26, 26], // #1A1A1A
    subtextColor: [95, 92, 88],
    sunsetWashOpacity: 0.0,
    cloudOpacity: 0.0,
    activeBirdRatio: 1.0,
  },
  {
    hour: 11.0, // Noon (11-15 approved, do not change: paper #EFECE5, sun #F4D77A)
    name: 'Noon',
    paperBg: [239, 236, 229], // #EFECE5
    paperVignette: [0, 0, 0, 0],
    sunOpacity: 0.75,
    sunX: 50,
    sunY: 36,
    sunRadius: 210,
    sunColor: [244, 215, 122], // #F4D77A
    sunRim: [218, 172, 54], // #DAAC36
    sunHalo: [248, 235, 196], // #F8EBC4
    moonOpacity: 0.0,
    moonColor: [228, 232, 243],
    moonRim: [168, 180, 204],
    moonHalo: [186, 198, 217],
    moonX: 90,
    moonY: 70,
    moonRadius: 80,
    starsOpacity: 0.0,
    firefliesOpacity: 0.0,
    wireColor: [26, 26, 26, 1.0], // #1A1A1A
    birdSilhouette: [26, 26, 26], // #1A1A1A
    birdRimColor: [0, 0, 0, 0],
    textColor: [26, 26, 26], // #1A1A1A
    subtextColor: [95, 92, 88],
    sunsetWashOpacity: 0.0,
    cloudOpacity: 0.0,
    activeBirdRatio: 1.0,
  },
  {
    hour: 15.0, // Afternoon (15-17: paper #F3E9D2, sun #E9B94F)
    name: 'Afternoon',
    paperBg: [243, 233, 210], // #F3E9D2
    paperVignette: [0, 0, 0, 0],
    sunOpacity: 0.75,
    sunX: 50,
    sunY: 36,
    sunRadius: 210,
    sunColor: [233, 185, 79], // #E9B94F
    sunRim: [199, 151, 40], // #C79728
    sunHalo: [245, 214, 136],
    moonOpacity: 0.0,
    moonColor: [228, 232, 243],
    moonRim: [168, 180, 204],
    moonHalo: [186, 198, 217],
    moonX: 20,
    moonY: 65,
    moonRadius: 80,
    starsOpacity: 0.0,
    firefliesOpacity: 0.0,
    wireColor: [26, 26, 26, 1.0], // #1A1A1A
    birdSilhouette: [26, 26, 26], // #1A1A1A
    birdRimColor: [0, 0, 0, 0],
    textColor: [26, 26, 26], // #1A1A1A
    subtextColor: [95, 92, 88],
    sunsetWashOpacity: 0.0,
    cloudOpacity: 0.0,
    activeBirdRatio: 1.0,
  },
  {
    hour: 17.0, // Sunset (17-19: paper #F1D8BE, sun #E0794F at 85%, ink #2B1B17, streaks #E9B896)
    name: 'Sunset',
    paperBg: [241, 216, 190], // #F1D8BE
    paperVignette: [0, 0, 0, 0],
    sunOpacity: 0.85, // #E0794F at 85%
    sunX: 50,
    sunY: 38,
    sunRadius: 210,
    sunColor: [224, 121, 79], // #E0794F
    sunRim: [186, 92, 54],
    sunHalo: [244, 185, 150],
    moonOpacity: 0.0,
    moonColor: [228, 232, 243],
    moonRim: [168, 180, 204],
    moonHalo: [186, 198, 217],
    moonX: 30,
    moonY: 55,
    moonRadius: 85,
    starsOpacity: 0.0,
    firefliesOpacity: 0.0,
    wireColor: [43, 27, 23, 1.0], // ink #2B1B17
    birdSilhouette: [43, 27, 23], // ink #2B1B17
    birdRimColor: [0, 0, 0, 0],
    textColor: [43, 27, 23], // ink #2B1B17
    subtextColor: [75, 50, 45],
    sunsetWashOpacity: 0.35, // 2-3 faint horizontal peach streaks #E9B896
    cloudOpacity: 0.0,
    activeBirdRatio: 0.85,
  },
  {
    hour: 18.7, // Sunset holds through dusk arrival
    name: 'Sunset',
    paperBg: [241, 216, 190], // #F1D8BE
    paperVignette: [0, 0, 0, 0],
    sunOpacity: 0.85,
    sunX: 50,
    sunY: 38,
    sunRadius: 210,
    sunColor: [224, 121, 79], // #E0794F
    sunRim: [186, 92, 54],
    sunHalo: [244, 185, 150],
    moonOpacity: 0.0,
    moonColor: [228, 232, 243],
    moonRim: [168, 180, 204],
    moonHalo: [186, 198, 217],
    moonX: 30,
    moonY: 55,
    moonRadius: 85,
    starsOpacity: 0.0,
    firefliesOpacity: 0.0,
    wireColor: [43, 27, 23, 1.0], // ink #2B1B17
    birdSilhouette: [43, 27, 23], // ink #2B1B17
    birdRimColor: [0, 0, 0, 0],
    textColor: [43, 27, 23], // ink #2B1B17
    subtextColor: [75, 50, 45],
    sunsetWashOpacity: 0.35,
    cloudOpacity: 0.0,
    activeBirdRatio: 0.85,
  },
  {
    hour: 19.0, // Dusk (19-21: paper #3D3358, sun fades from #E39A86 into pale moon, wires #EADBD0 at 90%, birds #120E1D, text #F6EEE6)
    name: 'Dusk',
    paperBg: [61, 51, 88], // #3D3358
    paperVignette: [38, 30, 56, 0.25],
    sunOpacity: 0.50, // Fading from terracotta-rose #E39A86 into pale moon
    sunX: 50,
    sunY: 38,
    sunRadius: 210,
    sunColor: [227, 154, 134], // #E39A86
    sunRim: [195, 120, 100],
    sunHalo: [240, 175, 155],
    moonOpacity: 0.45,
    moonColor: [228, 232, 243], // #E4E8F3
    moonRim: [168, 180, 204],
    moonHalo: [186, 198, 217],
    moonX: 50,
    moonY: 34,
    moonRadius: 210,
    starsOpacity: 0.30, // stars begin to appear
    firefliesOpacity: 0.0,
    wireColor: [234, 219, 208, 0.90], // #EADBD0 at 90%
    birdSilhouette: [18, 14, 29], // #120E1D
    birdRimColor: [0, 0, 0, 0],
    textColor: [246, 238, 230], // #F6EEE6
    subtextColor: [195, 185, 210],
    sunsetWashOpacity: 0.10,
    cloudOpacity: 0.0,
    activeBirdRatio: 0.45,
  },
  {
    hour: 21.0, // Night (21-05: paper #1A2140, moon #E4E8F3 at 90%, wires #DCE1EC at 85%, birds #090D1B rim rgba(228,232,243,0.5), text #F3EFE6)
    name: 'Night',
    paperBg: [26, 33, 64], // #1A2140
    paperVignette: [14, 18, 38, 0.35],
    sunOpacity: 0.0,
    sunX: 50,
    sunY: 80,
    sunRadius: 160,
    sunColor: [224, 121, 79],
    sunRim: [186, 92, 54],
    moonOpacity: 0.90, // #E4E8F3 at 90%
    moonColor: [228, 232, 243], // #E4E8F3
    moonRim: [168, 180, 204],
    moonHalo: [186, 198, 217],
    moonX: 50,
    moonY: 34,
    moonRadius: 210,
    starsOpacity: 0.55,
    firefliesOpacity: 0.0,
    wireColor: [220, 225, 236, 0.85], // #DCE1EC at 85%
    birdSilhouette: [9, 13, 27], // #090D1B
    birdRimColor: [228, 232, 243, 0.5], // 1px rim
    textColor: [243, 239, 230], // #F3EFE6
    subtextColor: [185, 195, 212],
    sunsetWashOpacity: 0.0,
    cloudOpacity: 0.0,
    activeBirdRatio: 0.25,
  },
  {
    hour: 24.0, // Midnight wrap
    name: 'Night',
    paperBg: [26, 33, 64], // #1A2140
    paperVignette: [14, 18, 38, 0.35],
    sunOpacity: 0.0,
    sunX: 50,
    sunY: 80,
    sunRadius: 160,
    sunColor: [224, 121, 79],
    sunRim: [186, 92, 54],
    moonOpacity: 0.90,
    moonColor: [228, 232, 243],
    moonRim: [168, 180, 204],
    moonHalo: [186, 198, 217],
    moonX: 50,
    moonY: 34,
    moonRadius: 210,
    starsOpacity: 0.55,
    firefliesOpacity: 0.0,
    wireColor: [220, 225, 236, 0.85],
    birdSilhouette: [9, 13, 27],
    birdRimColor: [228, 232, 243, 0.5],
    textColor: [243, 239, 230],
    subtextColor: [185, 195, 212],
    sunsetWashOpacity: 0.0,
    cloudOpacity: 0.0,
    activeBirdRatio: 0.25,
  },
]

/** Linear interpolation helper */
function lerp(a, b, t) {
  return a + (b - a) * t
}

/** Interpolate between two RGB or RGBA arrays */
function lerpColor(c1, c2, t) {
  if (!c1 || !c2) return 'rgba(0,0,0,0)'
  const r = Math.round(lerp(c1[0], c2[0], t))
  const g = Math.round(lerp(c1[1], c2[1], t))
  const b = Math.round(lerp(c1[2], c2[2], t))
  if (c1.length === 4 || c2.length === 4) {
    const a1 = c1[3] !== undefined ? c1[3] : 1
    const a2 = c2[3] !== undefined ? c2[3] : 1
    const a = +(lerp(a1, a2, t).toFixed(3))
    return `rgba(${r}, ${g}, ${b}, ${a})`
  }
  return `rgb(${r}, ${g}, ${b})`
}

/** Converts RGB array to hex string */
function rgbToHex([r, g, b]) {
  const h = (n) => n.toString(16).padStart(2, '0')
  return `#${h(r)}${h(g)}${h(b)}`
}

/**
 * Calculates current moon phase from Date object.
 */
export function getMoonPhase(date = new Date()) {
  const ref = new Date(Date.UTC(2024, 0, 11, 11, 57)).getTime()
  const now = date.getTime()
  const synodicMonthMs = 29.53058867 * 86400000
  const diff = (now - ref) % synodicMonthMs
  const phase = (diff < 0 ? diff + synodicMonthMs : diff) / synodicMonthMs

  let phaseName = 'Full Moon'
  if (phase < 0.06 || phase > 0.94) phaseName = 'New Moon'
  else if (phase < 0.22) phaseName = 'Waxing Crescent'
  else if (phase < 0.28) phaseName = 'First Quarter'
  else if (phase < 0.44) phaseName = 'Waxing Gibbous'
  else if (phase < 0.56) phaseName = 'Full Moon'
  else if (phase < 0.72) phaseName = 'Waning Gibbous'
  else if (phase < 0.78) phaseName = 'Last Quarter'
  else phaseName = 'Waning Crescent'

  return { phase, phaseName }
}

/**
 * Computes interpolated theme state for any given hour (0..24).
 */
export function interpolateAtmosphere(hour) {
  const h = ((hour % 24) + 24) % 24

  let k1 = TIME_KEYFRAMES[0]
  let k2 = TIME_KEYFRAMES[1]

  for (let i = 0; i < TIME_KEYFRAMES.length - 1; i++) {
    if (h >= TIME_KEYFRAMES[i].hour && h <= TIME_KEYFRAMES[i + 1].hour) {
      k1 = TIME_KEYFRAMES[i]
      k2 = TIME_KEYFRAMES[i + 1]
      break
    }
  }

  const range = k2.hour - k1.hour
  const tRaw = range === 0 ? 0 : (h - k1.hour) / range
  const t = tRaw * tRaw * (3 - 2 * tRaw)

  const phaseName = t < 0.5 ? k1.name : k2.name

  const paperBgRgb = [
    Math.round(lerp(k1.paperBg[0], k2.paperBg[0], t)),
    Math.round(lerp(k1.paperBg[1], k2.paperBg[1], t)),
    Math.round(lerp(k1.paperBg[2], k2.paperBg[2], t)),
  ]
  const paperBg = rgbToHex(paperBgRgb)
  const paperBgCss = `rgb(${paperBgRgb.join(',')})`

  const paperVignette = lerpColor(k1.paperVignette, k2.paperVignette, t)

  const sunColorRgb = [
    Math.round(lerp(k1.sunColor[0], k2.sunColor[0], t)),
    Math.round(lerp(k1.sunColor[1], k2.sunColor[1], t)),
    Math.round(lerp(k1.sunColor[2], k2.sunColor[2], t)),
  ]
  const sunColor = rgbToHex(sunColorRgb)

  const sunRimRgb = [
    Math.round(lerp(k1.sunRim[0], k2.sunRim[0], t)),
    Math.round(lerp(k1.sunRim[1], k2.sunRim[1], t)),
    Math.round(lerp(k1.sunRim[2], k2.sunRim[2], t)),
  ]
  const sunRim = rgbToHex(sunRimRgb)

  const sunHaloK1 = k1.sunHalo || k1.sunColor
  const sunHaloK2 = k2.sunHalo || k2.sunColor
  const sunHaloRgb = [
    Math.round(lerp(sunHaloK1[0], sunHaloK2[0], t)),
    Math.round(lerp(sunHaloK1[1], sunHaloK2[1], t)),
    Math.round(lerp(sunHaloK1[2], sunHaloK2[2], t)),
  ]
  const sunHalo = rgbToHex(sunHaloRgb)

  const moonColorK1 = k1.moonColor || [214, 220, 232]
  const moonColorK2 = k2.moonColor || [214, 220, 232]
  const moonColorRgb = [
    Math.round(lerp(moonColorK1[0], moonColorK2[0], t)),
    Math.round(lerp(moonColorK1[1], moonColorK2[1], t)),
    Math.round(lerp(moonColorK1[2], moonColorK2[2], t)),
  ]
  const moonColor = rgbToHex(moonColorRgb)

  const moonRimK1 = k1.moonRim || [158, 172, 196]
  const moonRimK2 = k2.moonRim || [158, 172, 196]
  const moonRimRgb = [
    Math.round(lerp(moonRimK1[0], moonRimK2[0], t)),
    Math.round(lerp(moonRimK1[1], moonRimK2[1], t)),
    Math.round(lerp(moonRimK1[2], moonRimK2[2], t)),
  ]
  const moonRim = rgbToHex(moonRimRgb)

  const moonHaloK1 = k1.moonHalo || [186, 198, 217]
  const moonHaloK2 = k2.moonHalo || [186, 198, 217]
  const moonHaloRgb = [
    Math.round(lerp(moonHaloK1[0], moonHaloK2[0], t)),
    Math.round(lerp(moonHaloK1[1], moonHaloK2[1], t)),
    Math.round(lerp(moonHaloK1[2], moonHaloK2[2], t)),
  ]
  const moonHalo = rgbToHex(moonHaloRgb)

  const wireColor = lerpColor(k1.wireColor, k2.wireColor, t)
  const birdSilhouette = lerpColor(k1.birdSilhouette, k2.birdSilhouette, t)
  const birdRimColor = lerpColor(k1.birdRimColor, k2.birdRimColor, t)

  const textColorRgb = [
    Math.round(lerp(k1.textColor[0], k2.textColor[0], t)),
    Math.round(lerp(k1.textColor[1], k2.textColor[1], t)),
    Math.round(lerp(k1.textColor[2], k2.textColor[2], t)),
  ]
  const textColor = rgbToHex(textColorRgb)

  const subtextColorRgb = [
    Math.round(lerp(k1.subtextColor[0], k2.subtextColor[0], t)),
    Math.round(lerp(k1.subtextColor[1], k2.subtextColor[1], t)),
    Math.round(lerp(k1.subtextColor[2], k2.subtextColor[2], t)),
  ]
  const subtextColor = rgbToHex(subtextColorRgb)

  const sunOpacity = +(lerp(k1.sunOpacity, k2.sunOpacity, t).toFixed(3))
  const sunX = +(lerp(k1.sunX, k2.sunX, t).toFixed(2))
  const sunY = +(lerp(k1.sunY, k2.sunY, t).toFixed(2))
  const sunRadius = +(lerp(k1.sunRadius, k2.sunRadius, t).toFixed(1))

  const moonOpacity = +(lerp(k1.moonOpacity, k2.moonOpacity, t).toFixed(3))
  const moonX = +(lerp(k1.moonX, k2.moonX, t).toFixed(2))
  const moonY = +(lerp(k1.moonY, k2.moonY, t).toFixed(2))
  const moonRadius = +(lerp(k1.moonRadius, k2.moonRadius, t).toFixed(1))

  const starsOpacity = +(lerp(k1.starsOpacity, k2.starsOpacity, t).toFixed(3))
  const firefliesOpacity = +(lerp(k1.firefliesOpacity, k2.firefliesOpacity, t).toFixed(3))
  const sunsetWashOpacity = +(lerp(k1.sunsetWashOpacity, k2.sunsetWashOpacity, t).toFixed(3))
  const cloudOpacity = +(lerp(k1.cloudOpacity, k2.cloudOpacity, t).toFixed(3))
  const activeBirdRatio = +(lerp(k1.activeBirdRatio, k2.activeBirdRatio, t).toFixed(2))

  const isNight = h < 5.0 || h >= 19.0

  return {
    hour: h,
    phaseName,
    isNight,
    paperBg,
    paperBgRgb,
    paperBgCss,
    paperVignette,
    sunOpacity,
    sunX,
    sunY,
    sunRadius,
    sunColor,
    sunRim,
    sunHalo,
    moonOpacity,
    moonColor,
    moonRim,
    moonHalo,
    moonX,
    moonY,
    moonRadius,
    starsOpacity,
    firefliesOpacity,
    wireColor,
    birdSilhouette,
    birdRimColor,
    textColor,
    subtextColor,
    sunsetWashOpacity,
    cloudOpacity,
    activeBirdRatio,
  }
}

export function formatHour(hour) {
  const h = Math.floor(hour) % 24
  const m = Math.floor((hour - Math.floor(hour)) * 60)
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`
}

export function parseHour(str) {
  if (!str || typeof str !== 'string') return null
  const match = str.match(/^(\d{1,2}):?(\d{2})?$/)
  if (!match) return null
  const h = parseInt(match[1], 10)
  const m = match[2] ? parseInt(match[2], 10) : 0
  if (isNaN(h) || h < 0 || h > 24) return null
  if (isNaN(m) || m < 0 || m >= 60) return null
  return h + m / 60
}

export function useTimeEngine() {
  const getInitialHour = () => {
    if (typeof window !== 'undefined') {
      try {
        const params = new URLSearchParams(window.location.search)
        const timeParam = params.get('time')
        if (timeParam) {
          const parsed = parseHour(timeParam)
          if (parsed !== null) return { hour: parsed, isAuto: false, hasUrlParam: true }
        }
      } catch {
        // ignore
      }
      const now = new Date()
      return {
        hour: now.getHours() + now.getMinutes() / 60 + now.getSeconds() / 3600,
        isAuto: true,
        hasUrlParam: false,
      }
    }
    return { hour: 12.0, isAuto: true, hasUrlParam: false }
  }

  const initial = useMemo(getInitialHour, [])
  const [currentHour, setCurrentHour] = useState(initial.hour)
  const [isAuto, setIsAuto] = useState(initial.isAuto)
  const [devControlsOpen, setDevControlsOpen] = useState(initial.hasUrlParam)
  const [rainMode, setRainMode] = useState(false)

  useEffect(() => {
    if (!isAuto) return
    const update = () => {
      const now = new Date()
      const h = now.getHours() + now.getMinutes() / 60 + now.getSeconds() / 3600
      setCurrentHour(h)
    }
    update()
    const timer = setInterval(update, 30000)
    return () => clearInterval(timer)
  }, [isAuto])

  useEffect(() => {
    if (typeof window === 'undefined') return
    const handleKeyDown = (e) => {
      if (['INPUT', 'TEXTAREA'].includes(e.target.tagName)) return
      if (e.key === 't' || e.key === 'T') {
        e.preventDefault()
        setDevControlsOpen((prev) => !prev)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  const setManualHour = useCallback((h) => {
    setIsAuto(false)
    setCurrentHour(h)
  }, [])

  const resetToAuto = useCallback(() => {
    setIsAuto(true)
    const now = new Date()
    setCurrentHour(now.getHours() + now.getMinutes() / 60 + now.getSeconds() / 3600)
  }, [])

  const atmosphere = useMemo(() => {
    return interpolateAtmosphere(currentHour)
  }, [currentHour])

  const moonPhaseInfo = useMemo(() => {
    return typeof window !== 'undefined' ? getMoonPhase(new Date()) : { phase: 0.5, phaseName: 'Full Moon' }
  }, [currentHour])

  const isNight = currentHour < 5.5 || currentHour >= 18.5

  return {
    hour: currentHour,
    isNight,
    formattedTime: formatHour(currentHour),
    atmosphere,
    moonPhase: moonPhaseInfo,
    isAuto,
    setIsAuto,
    setManualHour,
    resetToAuto,
    devControlsOpen,
    setDevControlsOpen,
    rainMode,
    setRainMode,
  }
}
