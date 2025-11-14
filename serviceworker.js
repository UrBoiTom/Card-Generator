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
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Cache hit - return response
        if (response) {
          return response;
        }
        // Not in cache - fetch from network
        return fetch(event.request);
      })
  );
});
