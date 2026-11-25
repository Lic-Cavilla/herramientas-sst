// Service worker: deja la app disponible sin internet.
const CACHE = 'qhse-v1';
const BASE = ['./', './index.html', './formularios.json', './manifest.webmanifest', './icon-192.png', './icon-512.png'];
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(BASE)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const r = e.request, u = new URL(r.url);
  if (r.method !== 'GET' || u.origin !== location.origin) return;      // el envío a Google no se toca
  const red = r.mode === 'navigate' || u.pathname.endsWith('formularios.json') || u.pathname.endsWith('index.html');
  if (red) {   // primero la red (así los cambios llegan), y si no hay señal, lo guardado
    e.respondWith(fetch(r).then(x => { const c = x.clone(); caches.open(CACHE).then(k => k.put(r, c)); return x; })
      .catch(() => caches.match(r).then(x => x || caches.match('./index.html'))));
  } else {
    e.respondWith(caches.match(r).then(x => x || fetch(r).then(y => { const c = y.clone(); caches.open(CACHE).then(k => k.put(r, c)); return y; })));
  }
});
