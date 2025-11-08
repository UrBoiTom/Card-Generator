const GHPATH = '/Card-Generator';
const APP_PREFIX = 'gppwa_';
const VERSION = 'version_005'; // Increment the version to trigger an update
const CACHE_NAME = APP_PREFIX + VERSION;

// The list of URLs for the "app shell" that will be cached on install.
const APP_SHELL_URLS = [
  `${GHPATH}/`,
  `${GHPATH}/index.html`,
  `${GHPATH}/manifest.webmanifest`,
  `${GHPATH}/icons/favicon.ico`,
  `${GHPATH}/icons/icon.png`,
];

// Respond with cached resources, falling back to the network.
// This strategy also dynamically caches new assets as they are requested.
self.addEventListener('fetch', (e) => {
  // We only want to cache GET requests
  if (e.request.method !== 'GET') {
    return;
  }

  console.log('Fetch request : ' + e.request.url);
  e.respondWith(
    caches.open(CACHE_NAME).then(async (cache) => {
      const cachedResponse = await cache.match(e.request);
      if (cachedResponse) {
        console.log('Responding with cache: ' + e.request.url);
        return cachedResponse;
      }

      console.log('File is not cached, fetching: ' + e.request.url);
      const networkResponse = await fetch(e.request);

      // If the fetch is successful, clone the response and store it in the cache.
      // We only cache requests to our own origin to avoid caching third-party assets.
      if (networkResponse && networkResponse.status === 200 && new URL(e.request.url).origin === self.location.origin) {
        console.log('Caching new resource: ' + e.request.url);
        cache.put(e.request, networkResponse.clone());
      }
      return networkResponse;
    })
  );
});

// Cache the app shell on install
self.addEventListener('install', (e) => {
  self.skipWaiting(); // Force the waiting service worker to become the active service worker.
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Installing cache : ' + CACHE_NAME);
      return cache.addAll(APP_SHELL_URLS);
    })
  );

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
    })
  ).then(() => self.clients.claim()) // Take control of all open clients.
});