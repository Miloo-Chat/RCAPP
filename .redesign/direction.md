# Miloo Redesign: Direction & Design Tokens

## 1. Palette
We are aggressively pivoting from AI-generated "Web3 sludge" (purples, blues, cyans, neons) to a refined, warm, slightly brutalist editorial palette.

**Light Mode:**
- `bg`: `#F5F3ED` (Warm oat/sand background; instantly human and organic.)
- `surface`: `#FFFFFF` (Pure white for cards/chat bubbles to provide crisp contrast.)
- `text-primary`: `#181615` (Off-black, much softer on the eyes than pure #000.)
- `text-secondary`: `#6E6A65` (Warm gray for metadata and placeholders.)
- `accent`: `#D95236` (Terracotta/Warm Rust. Energetic but grounded, not a neon laser.)
- `accent-muted`: `#F3D8D1` (Soft terracotta for subtle active states or secondary chips.)

**Dark Mode:**
- `bg`: `#151413` (Very deep warm charcoal, completely stripping out the standard AI-blue-gray.)
- `surface`: `#1E1C1A` (Step above background for cards/inputs.)
- `text-primary`: `#F0ECE3` (Warm off-white.)
- `text-secondary`: `#928C84` (Muted warm taupe.)
- `accent`: `#E66345` (Punchy rust that glows naturally against dark mode.)
- `accent-muted`: `#38231E` (Deep rust shadow/surface.)

## 2. Font Pairings (Google Fonts)
**Primary Recommendation: Editorial High-Contrast**
- **Display:** `Fraunces` (A warm, quirky, optical-sizing serif for the hero and large headings. Completely removes the "tech template" vibe.)
- **Body:** `DM Sans` (Clean, highly legible geometric sans for chat logs and UI elements. Contrasts beautifully with Fraunces.)

**Alternative Recommendation: Bespoke Modernist**
- **Display:** `Outfit` (Bold, geometric, friendly but highly structured. Great for tight, punchy headlines.)
- **Body:** `Plus Jakarta Sans` (Neutral, highly readable UI font.)

*Reasoning: We will proceed with Fraunces + DM Sans to immediately differentiate from generic SaaS dashboards.*

## 3. Core Scales & Tokens
- **Type Scale:** 12px (xs), 14px (sm), 16px (base), 20px (lg), 24px (xl), 32px (2xl), 48px (3xl), 64px (4xl).
- **Spacing Scale:** 4px, 8px, 12px, 16px, 24px, 32px, 48px, 64px, 96px, 128px.
- **Radii (Mixed):** `0px` (sharp, for raw structural elements), `4px` (sm, for inputs), `8px` (md, for standard surfaces), `999px` (pill, for core action buttons). 
- **Motion:** 
  - `fast`: 150ms `ease-out` (for hovers and tap states).
  - `snappy`: 300ms `cubic-bezier(0.2, 0.8, 0.2, 1)` (spring-like entrances, modals).

## 4. UI Concepts (Max 5 Lines Each)
- **Hero Concept:** A singular, commanding typographic statement in Fraunces on the warm oat background. No 3D floating emojis, no gradients—just raw contrast, a tight grid, and immediate clarity.
- **Two Doors (Text vs. Video):** Instead of glassy glowing cards, these are stark, high-contrast structural blocks. Hovering reveals a crisp background color switch and a sharp 2px border, reminiscent of Japanese editorial design.
- **Waiting State Concept:** Replaces the generic cyberpunk radar with a minimalist typographic pulse ("Looking..."). Subtle organic motion rather than aggressive math-heavy CSS trickery.
- **Chat Feed Concept:** A heavily structured, whitespace-driven column. Messages are simple pill boxes with solid contrast margins. No blurry shadows on bubbles—just tight tracking and high legibility.
- **Video Overlay Concept:** Edge-to-edge brutalist video feed. Controls sit in a crisp, solid pill at the bottom center with high-contrast monochrome icons, abandoning frosted-glass (unless technically required for text legibility) to favor pure utility.

## 5. Microcopy
- **Hero:** "Skip the superficial. Talk to someone real."
- **Waiting State:** "Looking for a stranger..."
- **Empty Chat:** "It's quiet here. Say something to start."
- **Skip Action:** "Next" (or "Skip")
- **Report/Safety:** "Flag inappropriate behavior"

## 6. 21st.dev Pattern Inspirations
- **Borrow:** Minimalist terminal-style raw inputs, fluid typography scaling, magnetic button interactions, solid stark borders, and micro-interactions (like subtle width transitions).
- **Reject:** Heavy WebGL particle backgrounds, overly complex framer-motion dragging physics, infinite animated gradient background blurs ("sludge"). 
- **Why:** Those patterns are the literal hallmark of v0/ChatGPT-generated websites right now. They look impressive for 2 seconds but feel heavy, unoriginal, and distract from the core fast-matching chat utility.