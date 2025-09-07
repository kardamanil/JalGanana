const CACHE_NAME = "jalganana-cache-v1";
const BASE = "/JalGanana/";

const urlsToCache = [
  `${BASE}`,
  `${BASE}index.html`,
  `${BASE}script.js`,
  `${BASE}manifest.json`
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request).then(resp => resp || fetch(event.request))
  );
});
