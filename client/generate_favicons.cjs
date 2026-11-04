/**
 * client/generate_favicons.cjs
 * Generates Miloo brand favicon set:
 * - favicon.svg
 * - apple-touch-icon.png (180x180)
 * - icon-192.png (192x192)
 * - icon-512.png (512x512)
 * - favicon.ico
 * - site.webmanifest
 */

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const PUBLIC_DIR = path.resolve(__dirname, 'public');

// Vector SVG for Miloo icon: dark #151413 background, crisp off-white 'm' glyph, signature coral dot
const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <rect width="512" height="512" rx="112" fill="#151413"/>
  <g fill="#F0ECE3">
    <!-- Left vertical stem -->
    <rect x="108" y="200" width="48" height="172" rx="24"/>
    <!-- Center arch & stem -->
    <path d="M132 248 C144 206 182 196 220 196 C264 196 284 220 292 252 C306 208 344 196 382 196 C428 196 452 226 452 278 L452 372 L404 372 L404 282 C404 250 390 240 364 240 C336 240 320 258 320 292 L320 372 L272 372 L272 282 C272 250 258 240 232 240 C204 240 188 258 188 292 L188 372 L140 372 Z"/>
  </g>
  <!-- Signature Miloo coral dot -->
  <circle cx="438" cy="148" r="36" fill="#E66345"/>
</svg>`;

async function generate() {
  console.log('🎨 Generating Miloo brand favicons...');

  // 1. Write favicon.svg
  const svgPath = path.join(PUBLIC_DIR, 'favicon.svg');
  fs.writeFileSync(svgPath, svgContent, 'utf8');
  console.log('✓ Wrote favicon.svg');

  const svgBuffer = Buffer.from(svgContent);

  // 2. apple-touch-icon.png (180x180)
  await sharp(svgBuffer)
    .resize(180, 180)
    .png()
    .toFile(path.join(PUBLIC_DIR, 'apple-touch-icon.png'));
  console.log('✓ Generated apple-touch-icon.png (180x180)');

  // 3. icon-192.png (192x192)
  await sharp(svgBuffer)
    .resize(192, 192)
    .png()
    .toFile(path.join(PUBLIC_DIR, 'icon-192.png'));
  console.log('✓ Generated icon-192.png (192x192)');

  // 4. icon-512.png (512x512)
  await sharp(svgBuffer)
    .resize(512, 512)
    .png()
    .toFile(path.join(PUBLIC_DIR, 'icon-512.png'));
  console.log('✓ Generated icon-512.png (512x512)');

  // 5. favicon.ico (32x32 png saved as .ico for modern browsers)
  await sharp(svgBuffer)
    .resize(32, 32)
    .png()
    .toFile(path.join(PUBLIC_DIR, 'favicon.ico'));
  console.log('✓ Generated favicon.ico (32x32)');

  // 6. site.webmanifest
  const siteWebmanifest = {
    name: 'Miloo — Anonymous Video & Text Chat',
    short_name: 'miloo',
    description: 'Free anonymous random video and text chat for adults (18+).',
    start_url: '/',
    display: 'standalone',
    background_color: '#151413',
    theme_color: '#151413',
    icons: [
      {
        src: '/icon-192.png',
        sizes: '192x192',
        type: 'image/png'
      },
      {
        src: '/icon-512.png',
        sizes: '512x512',
        type: 'image/png'
      },
      {
        src: '/favicon.svg',
        sizes: 'any',
        type: 'image/svg+xml'
      }
    ]
  };

  fs.writeFileSync(
    path.join(PUBLIC_DIR, 'site.webmanifest'),
    JSON.stringify(siteWebmanifest, null, 2),
    'utf8'
  );
  console.log('✓ Wrote site.webmanifest');

  // Also sync manifest.json
  fs.writeFileSync(
    path.join(PUBLIC_DIR, 'manifest.json'),
    JSON.stringify(siteWebmanifest, null, 2),
    'utf8'
  );
  console.log('✓ Synced manifest.json');
}

generate().catch(err => {
  console.error('Error generating favicons:', err);
  process.exit(1);
});
