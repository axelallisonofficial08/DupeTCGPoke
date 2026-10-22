const CACHE_NAME = 'pokemon-tcg-mega-duel-v32';
const cardIds = ["30c-120","30c-127","30c-2","cri-70","cri-82","dri-10","dri-48","me1-10","me1-114","me1-115","me1-116","me1-117","me1-119","me1-121","me1-124","me1-125","me1-130","me1-131","me1-72","me1-73","me1-8","me1-9","me2-11","me2-12","me2-13","me2-17","me2-18","me2-85","me2-87","me2-89","me2pt5-105","me2pt5-106","me2pt5-112","me2pt5-113","me2pt5-126","me2pt5-127","me2pt5-158","me2pt5-159","me2pt5-160","me2pt5-196","me2pt5-198","me2pt5-22","me3-108","me3-62","me3-76","me3-87","me4-108","meg-71","pbl-5","sv1-186","sv1-78","sv1-79","sv1-81","sv1-84","sv1-85","sv1-86","sv1-89","sv10-128","sv10-129","sv10-130","sv10-134","sv10-135","sv10-136","sv10-137","sv10-141","sv10-142","sv10-153","sv10-154","sv10-155","sv10-170","sv10-171","sv10-173","sv10-174","sv10-176","sv10-177","sv10-178","sv10-182","sv10-87","sv4-139","sv4-198","sv4-70","sv4pt5-77","sv5-123","sv5-152","sv6-143","sv6-155","sv6-163","sv6-25","sv6pt5-38","sv7-114","sv7-115","sv7-119","sv7-128","sv8-1","sv8-129","sv8-130","sv8-133","sv8-177","sv8-185","sv8-3","sv8pt5-4","sv9-116","sv9-143","sv9-146","sv9-152","sv9-97","sv9-98","sve-1","sve-2","sve-3","sve-4","sve-5","sve-6","sve-7","sve-8","tef-144","tef-155","tef-159","tef-161","twm-151","twm-167","wht-80","zsv10pt5-79"];
const APP_FILES = [
  './', './index.html', './tcg.html', './paho-mqtt.min.js', './traffic-presence.js', './tcg-data.js', './mega-engine.js', './pro-ai.js', './lucario-ai.js', './dragapult-ai.js', './app.js', './styles.css',
  './manifest.webmanifest', './icon.svg', './icon-192.png', './icon-512.png',
  ...cardIds.map(id => './assets/cards/' + id + '.png')
];

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(APP_FILES)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', event => {
  event.waitUntil(Promise.all([
    caches.keys().then(keys => Promise.all(keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key)))),
    self.clients.claim()
  ]));
});

self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET' || new URL(request.url).origin !== self.location.origin) return;
  const url = new URL(request.url);
  const isCode = url.pathname.endsWith('.js') || url.pathname.endsWith('.html') || url.pathname.endsWith('.css') || url.pathname === '/';
  if (isCode) {
    event.respondWith(
      fetch(request).then(response => {
        if (response.ok) {
          const copy = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(request, copy));
        }
        return response;
      }).catch(async () => (await caches.match(request, { ignoreSearch: true })) || (await caches.match('./index.html')))
    );
    return;
  }
  event.respondWith(caches.match(request, { ignoreSearch: true }).then(cached => cached || fetch(request).then(response => {
    if (response.ok) {
      const copy = response.clone();
      caches.open(CACHE_NAME).then(cache => cache.put(request, copy));
    }
    return response;
  })));
});
