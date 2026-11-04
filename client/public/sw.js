// client/public/sw.js
// Miloo Service Worker — Caches ONLY static assets.
// Strictly NEVER intercepts or caches /api/ endpoints, socket.io, or WebRTC streams.

const CACHE_NAME = 'miloo-static-v1';

const STATIC_ASSET_EXTENSIONS = [
  '.css',
  '.js',
  '.svg',
  '.png',
  '.jpg',
  '.jpeg',
  '.webp',
  '.woff',
  '.woff2',
  '.ttf',
  '.ico',
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      )
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // 1. Ignore non-GET requests
  if (event.request.method !== 'GET') return;

  // 2. Strictly bypass API, Socket.IO, metered TURN, or chat UGC endpoints
  if (
    url.pathname.startsWith('/api/') ||
    url.pathname.startsWith('/socket.io/') ||
    url.hostname.includes('metered.live') ||
    url.hostname.includes('metered.ca')
  ) {
    return;
  }

  // 3. Cache ONLY static assets matching recognized extensions
  const isStaticAsset = STATIC_ASSET_EXTENSIONS.some((ext) => url.pathname.endsWith(ext));

  if (isStaticAsset) {
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }
        return fetch(event.request).then((networkResponse) => {
          if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
            return networkResponse;
          }
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
          return networkResponse;
        });
      })
    );
  }
});
