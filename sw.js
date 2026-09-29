// Troque a versão sempre que atualizar os arquivos, para o app baixar a nova versão.
const CACHE = 'tributos-v9-bio-passkey';
const FONTS = 'tributos-fontes';
const FILES = ['./', './index.html', './manifest.json', './icon-192.png', './icon-512.png', './icon-maskable-512.png', './apple-touch-icon.png', './favicon-32.png', './secure-vault.js', './secure-ui.js', './secure-ui.css', './financ-icons.js'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys()
    .then(keys => Promise.all(keys.filter(k => k !== CACHE && k !== FONTS).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});

self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET') return;
  // Fontes do Google: guarda na primeira visita para funcionar offline depois.
  if (url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com') {
    e.respondWith(caches.open(FONTS).then(c => c.match(e.request).then(hit => hit ||
      fetch(e.request).then(res => { c.put(e.request, res.clone()); return res; }))));
    return;
  }
  // Arquivos do app: primeiro o cache; links externos passam direto.
  if (url.origin !== location.origin) return;
  e.respondWith(caches.match(e.request, { ignoreSearch: true }).then(hit => hit || fetch(e.request)));
});
