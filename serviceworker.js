const GHPATH = '/Card-Generator';
const APP_PREFIX = 'gppwa_';
const VERSION = '62402443fe974b8d92a3a4513222c73327ba405f'; // Replaced by build script
const CACHE_NAME = APP_PREFIX + VERSION;

// Respond with cached resources, falling back to the network.
// This strategy also dynamically caches new assets as they are requested.
self.addEventListener('fetch', (e) => {
  // We only want to cache GET requests
  if (e.request.method !== 'GET') {
    return;
  }

  // For navigation requests, use a network-first strategy.
  if (e.request.mode === 'navigate') {
    e.respondWith(
      fetch(e.request).catch(() => caches.match(e.request))
    );
    return;
  }

  // For all other requests, use a cache-first strategy.
  e.respondWith(
    caches.match(e.request).then((response) => {
      return response || fetch(e.request).then((response) => {
        const responseToCache = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(e.request, responseToCache));
        return response;
      });
    })
  );
});

// Cache the app shell on install
self.addEventListener('install', (e) => {
  console.log('Service worker installing...');
  self.skipWaiting();
});

// Delete old caches on activate
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(
        keyList.map((key) => {
          if (key.startsWith(APP_PREFIX) && key !== CACHE_NAME) {
            console.log('Deleting old cache : ' + key);
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});
