/**
 * client/generate_brand_assets.cjs
 *
 * Generates all Miloo brand SVGs and raster assets:
 * 1. Logo SVGs:
 *    - logo-wordmark-light.svg
 *    - logo-wordmark-dark.svg
 *    - logo-symbol.svg
 *    - logo-horizontal.svg
 * 2. Favicons & App Icons:
 *    - favicon.svg
 *    - favicon.ico (32x32)
 *    - apple-touch-icon.png (180x180)
 *    - icon-192.png (192x192, maskable safe padding)
 *    - icon-512.png (512x512, maskable safe padding)
 *    - og-image.png (1200x630, cream paper, sun, wire, birds, headline)
 */

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const PUBLIC_DIR = path.resolve(__dirname, 'public');

// Tiny ink bird SVG snippet (feet at y=0, head at y=-7, tail at y=+4)
const tinyBirdSvg = (x, y, color = '#1A1A1A', scale = 1) => `
<g transform="translate(${x}, ${y}) scale(${scale})">
  <!-- Bird body -->
  <path d="M -1 -7 C -2 -7.5 -3.5 -7.5 -4 -6 C -4.5 -5 -4 -4 -3 -3.5 C -4.5 -3 -5 -1.5 -4.8 0 C -4.5 1 -3.5 1 -2 0.5 C -1.5 1.5 -1.2 3.5 -1.5 5 C -1 5 -0.5 4 -0.2 2.5 C 0.5 0.5 1.5 0 2 -0.2 C 3.2 -0.8 3.5 -2.2 3.2 -3.8 C 2.8 -5.5 1.5 -6.8 -1 -7 Z" fill="${color}" />
  <!-- Beak -->
  <path d="M -4 -6 L -6 -6 L -4 -5.2 Z" fill="${color}" />
  <!-- Eye -->
  <circle cx="-2.6" cy="-5.8" r="0.4" fill="#ffffff" />
  <!-- Legs -->
  <line x1="-1.5" y1="-0.8" x2="-1.5" y2="0" stroke="${color}" stroke-width="0.6" stroke-linecap="round" />
  <line x1="0.5" y1="-0.8" x2="0.5" y2="0" stroke="${color}" stroke-width="0.6" stroke-linecap="round" />
</g>
`;

// 1. Logo Wordmark Light SVG
// "miloo" in Cormorant Garamond style, coral dot, wire passing through both 'o's with one tiny bird
const logoWordmarkLightSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 70" width="240" height="70">
  <defs>
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@600&amp;display=swap');
      .brand-text {
        font-family: 'Cormorant Garamond', Georgia, serif;
        font-size: 52px;
        font-weight: 600;
        letter-spacing: -0.02em;
        fill: #1A1A1A;
      }
    </style>
  </defs>
  <!-- Text 'miloo' -->
  <text x="16" y="50" class="brand-text">miloo</text>
  <!-- Coral Dot -->
  <circle cx="166" cy="48" r="4.5" fill="#D95236" />
  <!-- Thin ink wire passing through both 'o's (x ~95 to ~160, y ~35) -->
  <path d="M 88 35.5 Q 124 37 160 36" fill="none" stroke="#1A1A1A" stroke-width="1.3" stroke-linecap="round" />
  <!-- Tiny perched bird on wire above second 'o' -->
  ${tinyBirdSvg(136, 35.5, '#1A1A1A', 1.05)}
</svg>`;

// 2. Logo Wordmark Dark SVG (for dark paper / night theme)
const logoWordmarkDarkSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 70" width="240" height="70">
  <defs>
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@600&amp;display=swap');
      .brand-text-dark {
        font-family: 'Cormorant Garamond', Georgia, serif;
        font-size: 52px;
        font-weight: 600;
        letter-spacing: -0.02em;
        fill: #F0ECE3;
      }
    </style>
  </defs>
  <text x="16" y="50" class="brand-text-dark">miloo</text>
  <!-- Lighter Warm Coral Dot for night -->
  <circle cx="166" cy="48" r="4.5" fill="#F28B74" />
  <!-- Soft silver-grey ink wire through both 'o's -->
  <path d="M 88 35.5 Q 124 37 160 36" fill="none" stroke="#BAC6D9" stroke-width="1.3" stroke-linecap="round" />
  <!-- Tiny perched bird -->
  ${tinyBirdSvg(136, 35.5, '#F0ECE3', 1.05)}
</svg>`;

// 3. Logo Symbol Only SVG (both 'o' letters with wire and perched bird)
const logoSymbolSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 80" width="100" height="80">
  <defs>
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@600&amp;display=swap');
      .symbol-text {
        font-family: 'Cormorant Garamond', Georgia, serif;
        font-size: 58px;
        font-weight: 600;
        fill: #1A1A1A;
      }
    </style>
  </defs>
  <!-- Two 'oo' letters centered -->
  <text x="14" y="56" class="symbol-text">oo</text>
  <!-- Coral accent dot -->
  <circle cx="85" cy="54" r="4" fill="#D95236" />
  <!-- Thin ink wire running through both loops -->
  <path d="M 6 40.5 Q 48 42.2 92 41" fill="none" stroke="#1A1A1A" stroke-width="1.4" stroke-linecap="round" />
  <!-- Tiny perched bird -->
  ${tinyBirdSvg(56, 40.8, '#1A1A1A', 1.15)}
</svg>`;

// 4. Logo Horizontal Lockup (Wordmark + Tagline)
const logoHorizontalSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 380 70" width="380" height="70">
  <defs>
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@600&amp;family=Newsreader:ital,wght@1,400&amp;display=swap');
      .brand-title {
        font-family: 'Cormorant Garamond', Georgia, serif;
        font-size: 46px;
        font-weight: 600;
        letter-spacing: -0.02em;
        fill: #1A1A1A;
      }
      .brand-sub {
        font-family: 'Newsreader', Georgia, serif;
        font-style: italic;
        font-size: 16px;
        fill: #5F5C58;
        letter-spacing: 0.02em;
      }
    </style>
  </defs>
  <text x="12" y="46" class="brand-title">miloo</text>
  <circle cx="145" cy="44" r="4" fill="#D95236" />
  <path d="M 76 33 Q 108 34.5 140 33.5" fill="none" stroke="#1A1A1A" stroke-width="1.2" stroke-linecap="round" />
  ${tinyBirdSvg(118, 33.8, '#1A1A1A', 0.95)}
  <!-- Divider -->
  <line x1="168" y1="20" x2="168" y2="52" stroke="#1A1A1A" stroke-width="0.8" opacity="0.25" />
  <!-- Subtitle -->
  <text x="185" y="42" class="brand-sub">meet a real stranger</text>
</svg>`;

// 5. Favicon SVG: Golden watercolor circle with one small black bird perched on a thin diagonal wire
const faviconSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <defs>
    <radialGradient id="fav-sun" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#FDF3CE" stop-opacity="0.95" />
      <stop offset="65%" stop-color="#F2D98F" stop-opacity="0.9" />
      <stop offset="92%" stop-color="#E5BE5A" stop-opacity="0.85" />
      <stop offset="100%" stop-color="#D9AF4E" stop-opacity="0.4" />
    </radialGradient>
  </defs>
  <!-- Background transparent -->
  <!-- Golden watercolor sun circle -->
  <circle cx="32" cy="32" r="28" fill="url(#fav-sun)" />
  <!-- Thin diagonal ink wire sloping downward ~10 deg -->
  <line x1="2" y1="30" x2="62" y2="40" stroke="#1A1A1A" stroke-width="1.6" stroke-linecap="round" />
  <!-- One small black bird perched on the wire at x=34 -->
  <!-- At x=34, y on wire is 30 + (34-2)/60 * 10 = 35.3 -->
  ${tinyBirdSvg(34, 35.3, '#1A1A1A', 1.5)}
</svg>`;

// 6. Icon 512 / 192 Maskable: Golden watercolor circle with centered bird on diagonal wire, safe margin
const createIconSvg = (size) => `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}">
  <defs>
    <radialGradient id="app-sun" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#FFF5D6" />
      <stop offset="65%" stop-color="#F2D98F" />
      <stop offset="92%" stop-color="#E5BE5A" />
      <stop offset="100%" stop-color="#D9AF4E" />
    </radialGradient>
  </defs>
  <!-- Solid paper background for maskable icon compliance -->
  <rect width="${size}" height="${size}" fill="#F5F3ED" />
  <!-- Golden watercolor sun circle (diameter 60% of size for safe maskable padding) -->
  <circle cx="${size/2}" cy="${size/2}" r="${size * 0.32}" fill="url(#app-sun)" />
  <!-- Diagonal ink wire -->
  <line x1="${size * 0.12}" y1="${size * 0.47}" x2="${size * 0.88}" y2="${size * 0.60}" stroke="#1A1A1A" stroke-width="${size * 0.024}" stroke-linecap="round" />
  <!-- Small perched bird on wire -->
  ${tinyBirdSvg(size * 0.52, size * 0.54, '#1A1A1A', size * 0.022)}
</svg>
`;

// 7. OG Image (1200 x 630): Cream paper, watercolor sun, diagonal wires with ink birds, headline "Meet a real stranger."
const ogImageSvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 630" width="1200" height="630">
  <defs>
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Caveat:wght@600&amp;family=Cormorant+Garamond:wght@600&amp;family=Newsreader:ital,wght@0,400;1,400&amp;display=swap');
      .og-title {
        font-family: 'Newsreader', Georgia, serif;
        font-size: 64px;
        font-weight: 400;
        letter-spacing: -0.025em;
        fill: #1A1A1A;
      }
      .og-brand {
        font-family: 'Cormorant Garamond', Georgia, serif;
        font-size: 44px;
        font-weight: 600;
        letter-spacing: -0.02em;
        fill: #1A1A1A;
      }
      .og-sub {
        font-family: 'Newsreader', Georgia, serif;
        font-style: italic;
        font-size: 26px;
        fill: #5F5C58;
      }
      .og-hand {
        font-family: 'Caveat', cursive, sans-serif;
        font-size: 28px;
        fill: #D95236;
      }
    </style>
    <radialGradient id="og-sun" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#FFF5D6" stop-opacity="0.95" />
      <stop offset="70%" stop-color="#F2D98F" stop-opacity="0.85" />
      <stop offset="94%" stop-color="#E5BE5A" stop-opacity="0.75" />
      <stop offset="100%" stop-color="#D9AF4E" stop-opacity="0.2" />
    </radialGradient>
  </defs>

  <!-- Cream textured paper background -->
  <rect width="1200" height="630" fill="#F5F3ED" />

  <!-- Watercolor Sun on the right side -->
  <circle cx="850" cy="315" r="210" fill="url(#og-sun)" />

  <!-- Two diagonal ink wires across the canvas -->
  <!-- Upper wire ~9.5 deg -->
  <path d="M 0 240 Q 600 325 1200 405" fill="none" stroke="#1A1A1A" stroke-width="2.5" stroke-linecap="round" />
  <!-- Lower wire ~6.0 deg -->
  <path d="M 0 350 Q 600 400 1200 445" fill="none" stroke="#1A1A1A" stroke-width="2.5" stroke-linecap="round" />

  <!-- Ink birds perched along the wire -->
  ${tinyBirdSvg(640, 330, '#1A1A1A', 2.4)}
  ${tinyBirdSvg(730, 342, '#1A1A1A', 2.4)}
  ${tinyBirdSvg(820, 355, '#1A1A1A', 2.4)}
  ${tinyBirdSvg(920, 368, '#1A1A1A', 2.4)}
  ${tinyBirdSvg(1010, 380, '#1A1A1A', 2.4)}
  <!-- Lower pair -->
  ${tinyBirdSvg(760, 412, '#1A1A1A', 2.4)}
  ${tinyBirdSvg(810, 416, '#1A1A1A', 2.4)}

  <!-- Brand logo top-left -->
  <g transform="translate(80, 85)">
    <text x="0" y="0" class="og-brand">miloo</text>
    <circle cx="112" cy="-4" r="5" fill="#D95236" />
    <path d="M 58 -14 Q 82 -12 108 -13" fill="none" stroke="#1A1A1A" stroke-width="1.3" />
    ${tinyBirdSvg(90, -13, '#1A1A1A', 0.9)}
  </g>

  <!-- Left Hero Content -->
  <g transform="translate(80, 240)">
    <text x="0" y="0" class="og-title">Meet a real stranger.</text>
    <text x="0" y="55" class="og-sub">No algorithm. No signup. Free anonymous chat.</text>
    <text x="0" y="115" class="og-hand">pure human connection on quiet wires ~</text>
  </g>

  <!-- Privacy / Age Badge -->
  <g transform="translate(80, 520)">
    <rect width="210" height="42" rx="21" fill="#EAE6DC" stroke="#1A1A1A" stroke-width="1.5" />
    <text x="24" y="27" font-family="'Cormorant Garamond', serif" font-size="18px" font-weight="600" fill="#1A1A1A">🔞 Strictly 18+ Adults</text>
  </g>
</svg>
`;

async function main() {
  console.log('🎨 Generating all brand SVGs and assets...');

  // 1. Logos
  fs.writeFileSync(path.join(PUBLIC_DIR, 'logo-wordmark-light.svg'), logoWordmarkLightSvg, 'utf8');
  fs.writeFileSync(path.join(PUBLIC_DIR, 'logo-wordmark-dark.svg'), logoWordmarkDarkSvg, 'utf8');
  fs.writeFileSync(path.join(PUBLIC_DIR, 'logo-symbol.svg'), logoSymbolSvg, 'utf8');
  fs.writeFileSync(path.join(PUBLIC_DIR, 'logo-horizontal.svg'), logoHorizontalSvg, 'utf8');
  console.log('✓ Wrote logo SVGs (light, dark, symbol, horizontal)');

  // 2. Favicon SVG
  fs.writeFileSync(path.join(PUBLIC_DIR, 'favicon.svg'), faviconSvg, 'utf8');
  console.log('✓ Wrote favicon.svg');

  // 3. Favicon ICO (32x32)
  await sharp(Buffer.from(faviconSvg))
    .resize(32, 32)
    .png()
    .toFile(path.join(PUBLIC_DIR, 'favicon.ico'));
  console.log('✓ Generated favicon.ico (32x32)');

  // 4. Apple Touch Icon (180x180)
  const icon180Svg = createIconSvg(180);
  await sharp(Buffer.from(icon180Svg))
    .resize(180, 180)
    .png()
    .toFile(path.join(PUBLIC_DIR, 'apple-touch-icon.png'));
  console.log('✓ Generated apple-touch-icon.png (180x180)');

  // 5. Icon 192 (192x192 maskable)
  const icon192Svg = createIconSvg(192);
  await sharp(Buffer.from(icon192Svg))
    .resize(192, 192)
    .png()
    .toFile(path.join(PUBLIC_DIR, 'icon-192.png'));
  console.log('✓ Generated icon-192.png (192x192)');

  // 6. Icon 512 (512x512 maskable)
  const icon512Svg = createIconSvg(512);
  await sharp(Buffer.from(icon512Svg))
    .resize(512, 512)
    .png()
    .toFile(path.join(PUBLIC_DIR, 'icon-512.png'));
  console.log('✓ Generated icon-512.png (512x512)');

  // 7. OG Image (1200x630)
  await sharp(Buffer.from(ogImageSvg))
    .resize(1200, 630)
    .png()
    .toFile(path.join(PUBLIC_DIR, 'og-image.png'));
  console.log('✓ Generated og-image.png (1200x630)');

  // 8. Manifest & Site.webmanifest
  const manifest = {
    name: 'miloo — Meet a real stranger',
    short_name: 'miloo',
    description: 'The modern anonymous video and text chat platform. Free, private, strictly 18+.',
    start_url: '/',
    display: 'standalone',
    background_color: '#F5F3ED',
    theme_color: '#F5F3ED',
    icons: [
      {
        src: '/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable any'
      },
      {
        src: '/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable any'
      },
      {
        src: '/favicon.svg',
        sizes: 'any',
        type: 'image/svg+xml'
      }
    ]
  };

  fs.writeFileSync(path.join(PUBLIC_DIR, 'manifest.json'), JSON.stringify(manifest, null, 2), 'utf8');
  fs.writeFileSync(path.join(PUBLIC_DIR, 'site.webmanifest'), JSON.stringify(manifest, null, 2), 'utf8');
  console.log('✓ Synced manifest.json and site.webmanifest');
}

main().catch(err => {
  console.error('Error generating brand assets:', err);
  process.exit(1);
});
