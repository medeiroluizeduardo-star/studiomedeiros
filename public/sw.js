// Mantém o sistema abrindo mesmo com internet fraca. Sempre tenta a versão mais nova primeiro.
const CACHE = 'smt-v1';
const ARQUIVOS = ['./', 'index.html', 'styles.css', 'app.js', 'firebase-config.js', 'manifest.webmanifest', 'icon-192.png', 'icon-512.png'];
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(ARQUIVOS)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  const r = e.request;
  if (r.method !== 'GET' || new URL(r.url).origin !== location.origin) return;
  e.respondWith(fetch(r).then(resp => { const copia = resp.clone(); caches.open(CACHE).then(c => c.put(r, copia)); return resp; }).catch(() => caches.match(r).then(m => m || caches.match('index.html'))));
});
