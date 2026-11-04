// client/src/context/AtmosphereContext.jsx
//
// Global Time & Atmosphere Context for Miloo.
// Fetches the user's real local time (Date()) by default,
// or respects ?time=HH:MM if present for preview/testing.
// Continuously updates and provides watercolor palette, lighting, and theme tokens
// across ALL pages in the application.

import React, { createContext, useContext, useEffect, useMemo } from 'react'
import { useTimeEngine } from '../components/watercolor/timeEngine'
import { initDynamicFaviconAndTitle } from '../components/watercolor/dynamicFavicon'

const AtmosphereContext = createContext(null)

export function AtmosphereProvider({ children }) {
  const timeEngine = useTimeEngine()
  const { atmosphere, hour } = timeEngine
  const paperLuminance = Array.isArray(atmosphere?.paperBgRgb)
    ? (atmosphere.paperBgRgb[0] * 0.299 + atmosphere.paperBgRgb[1] * 0.587 + atmosphere.paperBgRgb[2] * 0.114)
    : (Array.isArray(atmosphere?.paperBg)
      ? (atmosphere.paperBg[0] * 0.299 + atmosphere.paperBg[1] * 0.587 + atmosphere.paperBg[2] * 0.114)
      : (hour < 5.0 || hour >= 19.0 ? 50 : 240))
  const isNight = paperLuminance < 128

  // Dynamically set CSS custom properties on document.documentElement
  // so all existing CSS variables, text, borders, and cards automatically
  // adapt to the user's local time of day watercolor theme with WCAG AAA/AA contrast!
  useEffect(() => {
    if (typeof document === 'undefined') return
    const root = document.documentElement
    const themeName = atmosphere?.phaseName ? atmosphere.phaseName.toLowerCase() : (isNight ? 'night' : 'noon')

    // 1. Core theme tokens
    const bgPaper = atmosphere.paperBg || (isNight ? '#1A2140' : '#EFECE5')
    const activeSunMoon = isNight
      ? (hour >= 19 && hour < 21 && atmosphere.sunOpacity > 0.05 ? atmosphere.sunColor : atmosphere.moonColor)
      : atmosphere.sunColor

    root.style.setProperty('--paper', bgPaper)
    root.style.setProperty('--sun', activeSunMoon)
    root.style.setProperty('--ink', atmosphere.wireColor)
    root.style.setProperty('--wire', atmosphere.wireColor)
    root.style.setProperty('--bird', atmosphere.birdSilhouette)
    root.style.setProperty('--text', atmosphere.textColor)
    root.style.setProperty('--bg-0', bgPaper)
    root.style.setProperty('--rd-bg', bgPaper)
    root.style.background = 'var(--paper)'
    document.body.style.backgroundColor = bgPaper

    root.setAttribute('data-theme', themeName)

    if (isNight) {
      // ── DUSK & NIGHT THEME ──
      // Text contrast: >= 7:1 against paper
      root.style.setProperty('--text-1', atmosphere.textColor)
      root.style.setProperty('--text-2', atmosphere.subtextColor)
      root.style.setProperty('--text-3', atmosphere.subtextColor)
      root.style.setProperty('--text-4', '#8E9AA8')
      root.style.setProperty('--rd-text-1', atmosphere.textColor)
      root.style.setProperty('--rd-text-2', atmosphere.subtextColor)
      root.style.setProperty('--rd-text-3', atmosphere.subtextColor)

      // Paper wash surfaces
      root.style.setProperty('--surface-1', 'rgba(38, 48, 74, 0.72)')
      root.style.setProperty('--surface-2', 'rgba(48, 60, 90, 0.82)')
      root.style.setProperty('--surface-3', '#242C48')
      root.style.setProperty('--rd-surface', 'rgba(38, 48, 74, 0.85)')
      root.style.setProperty('--rd-surface-hover', 'rgba(48, 60, 90, 0.95)')

      // Soft silver-grey ink rules
      root.style.setProperty('--border-1', 'rgba(220, 225, 236, 0.16)')
      root.style.setProperty('--border-2', 'rgba(220, 225, 236, 0.28)')

      // Warm coral ink dot
      root.style.setProperty('--accent', '#F28B74')
      root.style.setProperty('--accent-dim', 'rgba(242, 139, 116, 0.18)')
      root.style.setProperty('--accent-text', '#111625')
      root.style.setProperty('--rd-accent', '#F28B74')
      root.style.setProperty('--rd-accent-muted', 'rgba(242, 139, 116, 0.18)')

      root.style.colorScheme = 'dark'
    } else {
      // ── DAY & SUNSET THEME ──
      root.style.setProperty('--text-1', atmosphere.textColor)
      root.style.setProperty('--text-2', atmosphere.subtextColor)
      root.style.setProperty('--text-3', '#5A544C')
      root.style.setProperty('--text-4', '#7A736A')
      root.style.setProperty('--rd-text-1', atmosphere.textColor)
      root.style.setProperty('--rd-text-2', atmosphere.subtextColor)
      root.style.setProperty('--rd-text-3', '#5A544C')

      // Paper wash surfaces
      root.style.setProperty('--surface-1', 'rgba(255, 255, 255, 0.65)')
      root.style.setProperty('--surface-2', 'rgba(255, 255, 255, 0.90)')
      root.style.setProperty('--surface-3', '#E8E3D7')
      root.style.setProperty('--rd-surface', 'rgba(255, 255, 255, 0.85)')
      root.style.setProperty('--rd-surface-hover', 'rgba(255, 255, 255, 0.98)')

      // Fine ink rules
      root.style.setProperty('--border-1', 'rgba(26, 26, 26, 0.14)')
      root.style.setProperty('--border-2', 'rgba(26, 26, 26, 0.26)')

      // Authentic watercolor burnt terracotta
      root.style.setProperty('--accent', '#B83A1B')
      root.style.setProperty('--accent-dim', 'rgba(184, 58, 27, 0.12)')
      root.style.setProperty('--accent-text', '#ffffff')
      root.style.setProperty('--rd-accent', '#B83A1B')
      root.style.setProperty('--rd-accent-muted', 'rgba(184, 58, 27, 0.12)')

      root.style.colorScheme = 'light'
    }

    // Common watercolor scene tokens
    root.style.setProperty('--wire-color', atmosphere.wireColor)
    root.style.setProperty('--bird-color', atmosphere.birdSilhouette)
    root.style.setProperty('--sun-moon-wash', activeSunMoon)
    root.style.setProperty('--paper-bg-raw', Array.isArray(atmosphere.paperBgRgb) ? atmosphere.paperBgRgb.join(', ') : (atmosphere.paperBg || ''))
  }, [atmosphere, isNight, hour])

  // Dynamic 5-minute theme favicon, theme-color, and hidden tab title
  useEffect(() => {
    return initDynamicFaviconAndTitle(() => hour)
  }, [hour])

  const contextValue = useMemo(() => ({
    timeEngine,
    atmosphere,
    isNight,
    isDark: isNight,
    hour,
  }), [timeEngine, atmosphere, isNight, hour])

  return (
    <AtmosphereContext.Provider value={contextValue}>
      {children}
    </AtmosphereContext.Provider>
  )
}

export function useAtmosphere() {
  const ctx = useContext(AtmosphereContext)
  if (!ctx) {
    // Graceful fallback for SSR prerendering or test harnesses
    return {
      hour: 12.0,
      isNight: false,
      isDark: false,
      atmosphere: {
        paperBg: '#EFECE5',
        paperBgCss: 'rgb(239, 236, 229)',
        textColor: '#1A1A1A',
        subtextColor: '#5F5C58',
        wireColor: '#1A1A1A',
        sunColor: '#F2D98F',
      },
      timeEngine: {
        hour: 12.0,
        isAuto: true,
        isNight: false,
        formattedTime: '12:00',
        setManualHour: () => {},
        resetToAuto: () => {},
      },
    }
  }
  return ctx
}
