/**
 * @license
 * Copyright 2025 UrBoiTom_
 * SPDX-License-Identifier: CC-BY-ND-4.0
 */

const CACHE_NAME = 'ai-character-card-generator-v1.1';
const BASE_PATH = '/Card-Generator';

// List of files to cache.
const urlsToCache = [
  `${BASE_PATH}/`,
  `${BASE_PATH}/manifest.webmanifest`,
  // Note: index.html is cached by the '/' route.
  // The hashed JS and CSS files will be cached on first visit by the 'fetch' event listener.
  `${BASE_PATH}/icons/favicon.ico`,
  `${BASE_PATH}/icons/copy.svg`,
  `${BASE_PATH}/icons/icon.png`,
];

// Install event: cache the app shell.
self.addEventListener('install', (event) => {
  // Force the waiting service worker to become the active service worker.
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        // Use addAll to fetch and cache all the specified resources.
        return cache.addAll(urlsToCache);
      })
  );
});

// Activate event: clean up old caches.
self.addEventListener('activate', (event) => {
  // Take control of all clients as soon as the service worker activates.
  self.clients.claim();

  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Fetch event: serve assets from cache if available.
self.addEventListener('fetch', (event) => {
  // Ignore non-GET requests and requests to other origins (like Google Ads).
  if (event.request.method !== 'GET' || !event.request.url.startsWith(self.location.origin)) {
    return;
  // Only handle requests for same-origin resources and navigations.
  // This prevents the service worker from interfering with third-party
  // requests, like those for Google Ads.
  if (event.request.url.startsWith(self.location.origin) || event.request.mode === 'navigate') {
    event.respondWith(
      caches.match(event.request)
        .then((response) => {
          // Cache hit - return response
          if (response) {
            return response;
          }
          // Not in cache - fetch from network.
          // The response is not being added to the cache here, which is fine for this strategy.
          return fetch(event.request);
        })
    );
  }

  // Use a "Network-first, falling back to cache" strategy.
  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        // If the fetch is successful, clone the response and cache it.
        // A response is a stream and can only be consumed once.
        // We need one for the browser to consume and one for the cache to consume.
        const responseToCache = networkResponse.clone();
        caches.open(CACHE_NAME)
          .then((cache) => {
            cache.put(event.request, responseToCache);
          });
        // Return the original response to the browser.
        return networkResponse;
      })
      .catch(() => {
        // If the network request fails (e.g., offline),
        // try to serve the response from the cache.
        return caches.match(event.request).then((cachedResponse) => {
          return cachedResponse;
        });
      }),
  );
});
