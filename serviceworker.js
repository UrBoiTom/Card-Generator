var GHPATH = '/Card-Generator';
var APP_PREFIX = 'gppwa_';
var VERSION = 'version_004';
var URLS = [    
  `${GHPATH}/`,
  `${GHPATH}/index.html`,
  `${GHPATH}/assets/*`,
  `${GHPATH}/icons/*`
]

var CACHE_NAME = APP_PREFIX + VERSION
self.addEventListener('fetch', function (e) {
  console.log('Fetch request : ' + e.request.url);
  e.respondWith(
    fetch(e.request).catch(function() {
      return caches.match(e.request);
    })
  );
});

self.addEventListener('install', function (e) {
  e.waitUntil(
    caches.open(CACHE_NAME).then(function (cache) {
      console.log('Installing cache : ' + CACHE_NAME);
      return cache.addAll(URLS);
    }).then(function() {
      return self.skipWaiting();
    })
  );
});

self.addEventListener('activate', function (e) {
  e.waitUntil(
    Promise.all([
      self.clients.claim(),
      caches.keys().then(function (keyList) {
        return Promise.all(keyList.map(function (key) {
          if (key.startsWith(APP_PREFIX) && key !== CACHE_NAME) {
            console.log('Deleting old cache : ' + key);
            return caches.delete(key);
          }
        }));
      })
    ])
  );
});