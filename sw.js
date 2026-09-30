// The app moved to /Guitar_School/. This replaces the old service worker so it
// stops serving the old app from its cache, then removes itself. Stars live in
// localStorage, which this never touches.
self.addEventListener('install', () => self.skipWaiting());

self.addEventListener('activate', (event) => {
  const scope = self.registration.scope;
  event.waitUntil(
    caches.keys()
      // the new app uses the same cache names, so only entries of the old address are dropped
      .then((keys) => Promise.all(keys.map((key) => caches.open(key).then((cache) => cache.keys()
        .then((requests) => Promise.all(requests.filter((r) => r.url.startsWith(scope)).map((r) => cache.delete(r))))))))
      .then(() => self.registration.unregister()),
  );
});
