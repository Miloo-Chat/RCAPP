# Miloo — Hand-Painted Watercolor Homepage

A minimalist, hand-painted watercolor homepage for **Miloo** ([miloo.chat](https://www.miloo.chat)), where visitors instantly connect with a real stranger with no algorithm, no signup, and no profiles.

The visual aesthetic directly matches a fine-art watercolor illustration: a warm golden sun with an organic bleeding wet edge on textured cold-press cream paper, with tiny black ink birds perched on thin, wobbly sagging wires.

---

## Architecture & Component Structure

```
client/src/components/watercolor/
├── timeEngine.js           # 24-hour continuous interpolation hook & keyframe palettes
├── soundEngine.js          # Procedural Web Audio API bird chirps (zero external MP3s)
├── WatercolorFilters.jsx   # SVG feTurbulence, feDisplacementMap & feGaussianBlur filters
├── SunMoon.jsx             # Hand-painted watercolor Sun & Moon with "Video chat" portal
├── Wires.jsx               # Hand-drawn ink wires with catenary sag & spring dip physics
├── Bird.jsx                # Hand-inked bird silhouettes with idle animation & proximity
├── Stars.jsx               # Canvas-only nocturnal stars, twinkle, shooting stars & fireflies
├── ChatButtons.jsx         # Hand-drawn ink speech bubble "Text chat" perched on top wire
├── ConnectingScene.jsx     # Flight searching, stranger arrival, wire landing & skip action
├── DevControls.jsx         # Interactive 24-hour time scrubber & preset inspector
├── InkClouds.jsx           # Sumi-e drifting clouds & horizontal watercolor sunset bands
├── RainEffect.jsx          # Subtle diagonal ink rain strokes (5% random visits / toggle)
├── WatercolorLogo.jsx      # Dip-pen wordmark with coral watercolor dot
└── WatercolorScene.jsx     # Master responsive viewport & parallax scene
```

---

## Time-Based Live Theme

The scene continuously tracks the visitor's local system time (`new Date()`) and updates every 30 seconds. Colors, sun/moon positions, and opacities interpolate smoothly with zero abrupt jumps:

| Phase | Hours | Atmosphere |
|---|---|---|
| **Dawn** | `05:00 - 07:00` | Pale rose and peach sky wash, small pale sun rising from bottom, birds waking up and chirp-hopping. |
| **Morning** | `07:00 - 11:00` | Bright, airy light cream paper with a warm lemon-gold sun climbing the arc. |
| **Noon** | `11:00 - 15:00` | **Default Look** matching the reference painting. Centered golden ochre sun with bleeding wet edges behind sagging wires. |
| **Afternoon** | `15:00 - 17:00` | Sun slides toward the right; gold deepens into warm honey amber. |
| **Sunset** | `17:00 - 19:30` | Apricot and orange sky with horizontal watercolor streaks; deep orange sun sinking, dramatic bird silhouettes. |
| **Dusk** | `19:30 - 21:00` | Lavender-indigo wash; first stars fade in; most birds fly away to sleep. |
| **Night** | `21:00 - 05:00` | Deep navy paper; pale watercolor moon rises with accurate lunar phase from date; stars twinkle with shooting stars and glowing fireflies. Silvery ink wires. |

---

## Hidden Dev Controls & Time Scrubber

You can preview any time of day instantly:
1. **URL parameter**: Append `?time=HH:MM` (e.g. `http://localhost:5173/?time=18:00` for Sunset, `?time=22:30` for Night, or `?time=12:30` for Noon).
2. **Keyboard shortcut**: Press the **`T`** key on your keyboard to toggle the floating scrubber panel.
3. **Corner pill**: Click the subtle time stamp (`☀️ 12:30 [T]`) in the bottom-right corner.
4. **Presets**: One-click quick presets for **Dawn**, **Morning**, **Noon (Default)**, **Afternoon**, **Sunset**, **Dusk**, and **Night**.
5. **Toggles**: Toggle between **Auto (Local Time)** and **Manual Scrubber**, turn on/off **Rain mode**, mute/unmute **Birdsong**, and replay the **Bloom intro**.

---

## How to Customize the Time-of-Day Palette

All colors, coordinates, and opacities are defined in `client/src/components/watercolor/timeEngine.js` within `TIME_KEYFRAMES`:

```javascript
// Example keyframe:
{
  hour: 12.5,                  // Decimal hour (0..24)
  name: 'Noon',                // Phase name
  paperBg: [250, 247, 239],    // RGB paper background
  paperVignette: [215, 205, 185, 0.22], // Edge vignette RGBA
  sunOpacity: 1.0,             // 0.0 to 1.0
  sunX: 50,                    // Percentage (X position)
  sunY: 36,                    // Percentage (Y position)
  sunRadius: 182,              // SVG radius in px
  sunColor: [238, 204, 108],   // Watercolor sun disc RGB
  sunRim: [212, 172, 74],      // Wet bleeding outer edge RGB
  wireColor: [20, 18, 16],     // Dip-pen ink RGB
  birdSilhouette: [14, 12, 10],// Inked bird RGB
  textColor: [20, 18, 16],     // WCAG AA readable text RGB
  subtextColor: [80, 74, 68],  // Secondary text RGB
}
```

To adjust or add a new phase, simply modify the RGB values or insert another keyframe. The `interpolateAtmosphere()` function automatically applies smoothstep interpolation between surrounding keyframes.

---

## Interactive Elements & Buttons

1. **"Text chat" Speech Bubble Button**:
   - Sits perched on the top wire like a bird, swinging gently in the breeze.
   - On hover: a miniature ink bird hops atop it, a soft watercolor wash fills the bubble, and `"hello..."` writes itself in cursive handwriting.
2. **"Video chat" Sun/Moon Portal**:
   - The watercolor sun (or moon at night) is itself the portal.
   - An ink camera doodle and `"Video chat"` label rest in the lower curve.
   - On hover: the sun ripples organically and an ink brush circle draws itself around the perimeter.
3. **Connecting Animation**:
   - Clicking either button launches the searching state: your bird takes flight into the sky (`"Looking for someone out there..."`).
   - After a match, a second stranger bird swoops in from the horizon; both birds meet, circle, and land side-by-side on the wire.
   - An ink watercolor heart blooms between them.
   - Clicking `"Skip / Next stranger"` sends the stranger bird flying away and resumes searching.
   - Clicking `"Enter Chat"` performs a soft paper-wipe transition into the active chat session.

---

## Running Locally

```bash
# 1. Install dependencies
cd client
npm install

# 2. Run Vite development server
npm run dev
# Open http://localhost:5173

# 3. Production build (includes SSR build & static prerendering)
npm run build
```

---

## Accessibility & Performance

- **Lighthouse Performance > 90**: Zero layout shifts (`CLS = 0`), pure SVG and CSS with canvas only for stars.
- **`prefers-reduced-motion`**: Automatically pauses bird flight, shooting stars, and twinkling while preserving the calm, slow time-of-day color transitions.
- **WCAG AA Compliance**: Dynamic text colors (`textColor`, `subtextColor`) maintain at least 4.5:1 contrast against the current time-of-day paper background.
- **Keyboard Navigation**: Full `Tab`, `Enter`, and `Space` support with ink focus rings and `aria-label` annotations.
