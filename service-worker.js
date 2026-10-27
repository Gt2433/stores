/* =============================================
   CROWN – Service Worker (Client Preview Mode)
   ============================================= */

const CACHE_NAME = 'crown-preview-v1';

const STATIC_ASSETS = [
  './',
  './index.html',
  './preview-data.js',
  './script.js',
  './style.css',
  './manifest.json',
  './images/logo.jpg',
  './Designer.otf',
  './Firlest-Regular.otf'
];

// ===== INSTALL =====
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return Promise.allSettled(
        STATIC_ASSETS.map(url => cache.add(url).catch(err => console.warn('[SW] Could not cache:', url, err)))
      );
    }).then(() => self.skipWaiting())
  );
});

// ===== ACTIVATE =====
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(key => key !== CACHE_NAME).map(key => {
          return caches.delete(key);
        })
      )
    ).then(() => self.clients.claim())
  );
});

// ===== FETCH =====
self.addEventListener('fetch', event => {
  const { request } = event;

  event.respondWith(
    fetch(request)
      .then(response => {
        if (response && response.status === 200 && response.type === 'basic') {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(request, responseClone));
        }
        return response;
      })
      .catch(() => {
        return caches.match(request).then(cached => {
          if (cached) return cached;
          if (request.destination === 'document') {
            return caches.match('./index.html');
          }
        });
      })
  );
});
