// Service Worker for offline support
const CACHE_NAME = 'attendance-v1';
const urlsToCache = [
  '/',
  '/attendance',
  '/admin',
  '/_next/static/css/',
  '/_next/static/chunks/',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => response || fetch(event.request))
  );
});

