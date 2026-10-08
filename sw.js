// Troque a versão sempre que atualizar os arquivos, para o app baixar a nova versão.
const CACHE = 'tributos-v1.12.0';
const FILES = ['./', './index.html', './index.css', './manifest.json', './icon-192.png', './icon-512.png', './icon-maskable-512.png', './apple-touch-icon.png', './favicon-32.png', './stk-pkg-secure-vault.js', './stk-pkg-secure-ui.js', './stk-pkg-secure-ui.css', './stk-pkg-financ-icons.js', './tax-engine.js', './app.js', './apoio/apoio.css', './apoio/stk-pkg-doacao.js', './apoio/stk-pkg-feedback.js', './apoio/stk-pkg-erros.js', './apoio/stk-pkg-qrcode.js', './fonts/fonts.css', './fonts/ibm-plex-mono-latin-400.woff2', './fonts/ibm-plex-mono-latin-500.woff2', './fonts/ibm-plex-mono-latin-600.woff2', './fonts/ibm-plex-mono-latin-ext-400.woff2', './fonts/ibm-plex-mono-latin-ext-500.woff2', './fonts/ibm-plex-mono-latin-ext-600.woff2', './fonts/space-grotesk-latin-ext.woff2', './fonts/space-grotesk-latin.woff2'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys()
    .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});

self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET') return;
  // Arquivos do app: rede primeiro (atualização imediata), cache quando offline; links externos passam direto.
  if (url.origin !== location.origin) return;
  e.respondWith(fetch(e.request).then(res => {
    if (res && res.status === 200) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(e.request, copy)); }
    return res;
  }).catch(() => caches.match(e.request, { ignoreSearch: true })));
});
