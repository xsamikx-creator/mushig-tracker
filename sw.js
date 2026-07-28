const CACHE = 'mushig-tracker-v1';
const ASSETS = ['./', './index.html', './style.css', './app.js', './manifest.json'];
self.addEventListener('install', event => event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(ASSETS))));
self.addEventListener('fetch', event => event.respondWith(caches.match(event.request).then(r => r || fetch(event.request))));
