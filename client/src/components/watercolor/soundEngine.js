// client/src/components/watercolor/soundEngine.js
//
// Procedural Web Audio API sound generator for Miloo.
// Synthesizes delicate, organic watercolor bird chirps and water drops.
// Zero external assets. Off by default. Stored in localStorage.

let audioCtx = null

function getAudioContext() {
  if (typeof window === 'undefined') return null
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext
    if (AudioContextClass) {
      audioCtx = new AudioContextClass()
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {})
  }
  return audioCtx
}

// Global mute state: off by default
let isMutedState = true

if (typeof window !== 'undefined') {
  try {
    const saved = localStorage.getItem('miloo-sound-enabled')
    if (saved === 'true') {
      isMutedState = false
    }
  } catch {
    // ignore
  }
}

export function isSoundMuted() {
  return isMutedState
}

export function setSoundMuted(muted) {
  isMutedState = muted
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem('miloo-sound-enabled', muted ? 'false' : 'true')
    } catch {
      // ignore
    }
  }
  if (!muted) {
    getAudioContext()
  }
}

export function toggleSoundMuted() {
  setSoundMuted(!isMutedState)
  return isMutedState
}

/**
 * Synthesize a gentle bird chirp.
 * @param {number} variation - 0: high chirp, 1: double chirp, 2: soft melodic trill
 */
export function playBirdChirp(variation = Math.floor(Math.random() * 3)) {
  if (isMutedState) return
  const ctx = getAudioContext()
  if (!ctx) return

  const now = ctx.currentTime

  // Master soft volume gain
  const masterGain = ctx.createGain()
  masterGain.gain.setValueAtTime(0.045, now)
  masterGain.connect(ctx.destination)

  // High-pass filter to ensure only sweet, airy chirps
  const filter = ctx.createBiquadFilter()
  filter.type = 'highpass'
  filter.frequency.setValueAtTime(2200, now)
  filter.connect(masterGain)

  if (variation === 0) {
    // Single high sweet chirp (2800Hz -> 4200Hz -> 3100Hz)
    const osc = ctx.createOscillator()
    const env = ctx.createGain()

    osc.type = 'sine'
    osc.frequency.setValueAtTime(2900, now)
    osc.frequency.exponentialRampToValueAtTime(4100, now + 0.04)
    osc.frequency.exponentialRampToValueAtTime(3200, now + 0.09)

    env.gain.setValueAtTime(0.001, now)
    env.gain.linearRampToValueAtTime(0.8, now + 0.02)
    env.gain.exponentialRampToValueAtTime(0.001, now + 0.09)

    osc.connect(env)
    env.connect(filter)

    osc.start(now)
    osc.stop(now + 0.1)
  } else if (variation === 1) {
    // Double hop chirp (two fast pulses)
    for (let i = 0; i < 2; i++) {
      const osc = ctx.createOscillator()
      const env = ctx.createGain()
      const t = now + i * 0.065

      osc.type = 'sine'
      osc.frequency.setValueAtTime(3200 + i * 300, t)
      osc.frequency.exponentialRampToValueAtTime(4500, t + 0.025)
      osc.frequency.exponentialRampToValueAtTime(3600, t + 0.05)

      env.gain.setValueAtTime(0.001, t)
      env.gain.linearRampToValueAtTime(0.7, t + 0.015)
      env.gain.exponentialRampToValueAtTime(0.001, t + 0.05)

      osc.connect(env)
      env.connect(filter)

      osc.start(t)
      osc.stop(t + 0.055)
    }
  } else {
    // Soft trill with subtle frequency modulation
    const osc = ctx.createOscillator()
    const env = ctx.createGain()
    const lfo = ctx.createOscillator()
    const lfoGain = ctx.createGain()

    osc.type = 'sine'
    osc.frequency.setValueAtTime(3400, now)
    osc.frequency.exponentialRampToValueAtTime(3800, now + 0.05)
    osc.frequency.exponentialRampToValueAtTime(2900, now + 0.12)

    lfo.type = 'sine'
    lfo.frequency.setValueAtTime(35, now) // 35Hz vibrato
    lfoGain.gain.setValueAtTime(180, now)

    lfo.connect(osc.frequency)

    env.gain.setValueAtTime(0.001, now)
    env.gain.linearRampToValueAtTime(0.65, now + 0.025)
    env.gain.exponentialRampToValueAtTime(0.001, now + 0.12)

    osc.connect(env)
    env.connect(filter)

    lfo.start(now)
    osc.start(now)
    lfo.stop(now + 0.13)
    osc.stop(now + 0.13)
  }
}

/**
 * Synthesize a soft watercolor water droplet / bubble sound.
 */
export function playWaterDrop() {
  if (isMutedState) return
  const ctx = getAudioContext()
  if (!ctx) return

  const now = ctx.currentTime
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()

  osc.type = 'sine'
  osc.frequency.setValueAtTime(800, now)
  osc.frequency.exponentialRampToValueAtTime(1400, now + 0.04)
  osc.frequency.exponentialRampToValueAtTime(450, now + 0.12)

  gain.gain.setValueAtTime(0.001, now)
  gain.gain.linearRampToValueAtTime(0.08, now + 0.015)
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12)

  osc.connect(gain)
  gain.connect(ctx.destination)

  osc.start(now)
  osc.stop(now + 0.13)
}

