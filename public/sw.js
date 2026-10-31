// Mantém o sistema abrindo rápido mesmo com internet fraca.
// Tenta a versão mais nova primeiro; se a rede demorar mais de 2,5 s, usa a cópia guardada
// e atualiza em segundo plano para a próxima abertura.
const CACHE = 'smt-v8';
const ARQUIVOS = ['./', 'img/marca.webp', 'img/logo.webp', 'img/faixa.webp', 'index.html', 'styles.css', 'app.js', 'firebase-config.js', 'manifest.webmanifest', 'icon-192.png', 'icon-512.png',
  'publico.css', 'publico.js', 'catalogo.js', 'cliente.js', 'contrato.js', 'cadastro.js'];
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(ARQUIVOS).catch(() => {})).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  const r = e.request; const url = new URL(r.url);
  if (r.method !== 'GET' || url.origin !== location.origin) return;
  const rede = fetch(r).then(resp => { if (resp.ok) { const copia = resp.clone(); caches.open(CACHE).then(c => c.put(r, copia)); } return resp; });
  e.waitUntil(rede.catch(() => {}));
  e.respondWith(new Promise(resolve => {
    let feito = false; const fim = x => { if (!feito && x) { feito = true; resolve(x); } };
    const reserva = () => caches.match(r, { ignoreSearch: true }).then(m => m || (r.mode === 'navigate' && (url.pathname === '/' || url.pathname === '/index.html') ? caches.match('index.html') : null));
    const t = setTimeout(() => reserva().then(fim), 2500);
    rede.then(x => { clearTimeout(t); fim(x); }).catch(() => { clearTimeout(t); reserva().then(m => fim(m || Response.error())); });
  }));
});
