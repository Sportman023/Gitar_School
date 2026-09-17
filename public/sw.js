// Network first, cache as a fallback.
// With a connection the app is always the latest version; without one
// (e.g. a tablet with no internet) it keeps working from the cache.
// Paths are relative to this file, so the app works both at the site root
// and in a subfolder such as GitHub Pages' /Gitar_School/.
//
// GitHub Pages lets browsers keep files for 10 minutes, so right after a deploy
// the page would still get old files. That's why every request asks the server
// whether a file changed (cache: 'no-cache'), and answers are marked no-cache
// too, so the page doesn't reuse them from memory on reload.
const CACHE = 'gitar-school-v2';

// The piano recordings are cached up front, so the piano works offline
// even in sections that were never opened online. Keep in sync with js/core/piano.js.
const PRECACHE = [
  './', './index.html', './styles.css',
  ...['C4', 'Ds4', 'Fs4', 'A4', 'C5'].map((key) => `./audio/piano/${key}.mp3`),
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(PRECACHE.map((url) => new Request(url, { cache: 'no-cache' })))).catch(() => {}));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

function noReuse(response) {
  if (response.type !== 'basic') return response;
  const headers = new Headers(response.headers);
  headers.set('Cache-Control', 'no-cache');
  return new Response(response.body, { status: response.status, statusText: response.statusText, headers });
}

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET' || !request.url.startsWith(self.location.origin)) return;

  event.respondWith(
    fetch(request, { cache: 'no-cache' })
      .then((response) => {
        const copy = response.clone();
        caches.open(CACHE).then((cache) => cache.put(request, copy)).catch(() => {});
        return noReuse(response);
      })
      .catch(() => caches.match(request).then((cached) => cached || caches.match('./index.html'))),
  );
});
