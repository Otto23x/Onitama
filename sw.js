const CACHE_NAME = 'onitama-v6.1-master-edition';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './manifest.json',
  './assets/logo.svg',
  './assets/board.svg',
  './assets/cards_data.json',
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
  './assets/cards/cobra.svg',
  './assets/cards/tiger_flipped.svg',
  './assets/cards/dragon_flipped.svg',
  './assets/cards/frog_flipped.svg',
  './assets/cards/rabbit_flipped.svg',
  './assets/cards/crab_flipped.svg',
  './assets/cards/elephant_flipped.svg',
  './assets/cards/goose_flipped.svg',
  './assets/cards/rooster_flipped.svg',
  './assets/cards/monkey_flipped.svg',
  './assets/cards/mantis_flipped.svg',
  './assets/cards/horse_flipped.svg',
  './assets/cards/ox_flipped.svg',
  './assets/cards/crane_flipped.svg',
  './assets/cards/boar_flipped.svg',
  './assets/cards/eel_flipped.svg',
  './assets/cards/cobra_flipped.svg'
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE_NAME).then((c) => c.addAll(ASSETS_TO_CACHE)));
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))));
  self.clients.claim();
});

self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then((res) => res || fetch(e.request))
  );
});
