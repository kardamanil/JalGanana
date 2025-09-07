const CACHE_NAME = "jalganana-cache-v1";
const urlsToCache = [
  "/JalGanana/",
  "/JalGanana/index.html",
  "/JalGanana/script.js",
  "/JalGanana/index.js",
  "/JalGanana/manifest.json",
  "/JalGanana/icon.png"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request).then(response => response || fetch(event.request))
  );
});
