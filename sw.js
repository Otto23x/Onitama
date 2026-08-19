const CACHE_NAME = 'onitama-v2.0';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './manifest.json',
  './assets/board.svg',
  './assets/cards_data.json',
  './assets/pieces/master-blue.svg',
  './assets/pieces/student-blue.svg',
  './assets/pieces/master-red.svg',
  './assets/pieces/student-red.svg',
  './assets/icons/icon-192.svg',
  './assets/icons/icon-512.svg',
  './assets/cards/tiger.svg',
  './assets/cards/dragon.svg',
  './assets/cards/frog.svg',
  './assets/cards/rabbit.svg',
  './assets/cards/crab.svg',
  './assets/cards/elephant.svg',
  './assets/cards/goose.svg',
  './assets/cards/rooster.svg',
  './assets/cards/monkey.svg',
  './assets/cards/mantis.svg',
  './assets/cards/horse.svg',
  './assets/cards/ox.svg',
  './assets/cards/crane.svg',
  './assets/cards/boar.svg',
  './assets/cards/eel.svg',
  './assets/cards/cobra.svg'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS_TO_CACHE))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      return cachedResponse || fetch(event.request).then((response) => {
        if (event.request.method === 'GET' && response.status === 200) {
          const resClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, resClone));
        }
        return response;
      });
    }).catch(() => caches.match('./index.html'))
  );
});
