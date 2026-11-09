// Service worker Projektové alchymie: hra se uloží do mezipaměti prohlížeče a jde hrát i bez internetu.
// Strategie: nejdřív síť (hráč má vždy nejnovější verzi), bez sítě se použije uložená kopie.
// Seznam OFFLINE_FILES musí obsahovat všechny soubory hry; hlídá to tools/build-zip.sh.
// VERSION stačí zvýšit při změně seznamu souborů (obsah souborů se obnovuje sám při hraní online).
const VERSION = 'v1';
const CACHE = `projektova-alchymie-${VERSION}`;
const OFFLINE_FILES = [
  './',
  'index.html',
  'en/',
  'en/index.html',
  'manifest.webmanifest',
  'manifest-en.webmanifest',
  'css/style.css',
  'css/fonts.css',
  'fonts/source-sans-3-latin.woff2',
  'fonts/source-sans-3-latin-ext.woff2',
  'fonts/zilla-slab-latin-600.woff2',
  'fonts/zilla-slab-latin-700.woff2',
  'fonts/zilla-slab-latin-ext-600.woff2',
  'fonts/zilla-slab-latin-ext-700.woff2',
  'img/alchymie.webp',
  'img/favicon.svg',
  'img/icon-192.png',
  'img/icon-512.png',
  'img/icon-maskable-512.png',
  'img/apple-touch-icon.png',
  'js/data.js',
  'js/data-insane.js',
  'js/i18n.js',
  'js/lang/en.js',
  'js/icons.js',
  'js/fx.js',
  'js/career.js',
  'js/game.js',
];
const NETWORK_TIMEOUT = 4000; // pomalá síť: po 4 s se použije uložená kopie

// Klíč v mezipaměti je adresa bez ?v=… (verze v odkazech slouží jen proti staré mezipaměti prohlížeče).
const keyOf = url => { const u = new URL(url); u.search = ''; return u.href; };

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE)
    .then(c => Promise.all(OFFLINE_FILES.map(f => {
      const url = new URL(f, self.registration.scope).href;
      return fetch(url, { cache: 'reload' }).then(r => { if (r.ok) return c.put(keyOf(url), r); });
    })))
    .then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys()
    .then(keys => Promise.all(keys.filter(k => k.startsWith('projektova-alchymie-') && k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  const key = keyOf(req.url);
  const fromCache = () => caches.match(key).then(r => r
    || (req.mode === 'navigate' ? caches.match(new URL('./', self.registration.scope).href) : undefined));
  const fromNetwork = fetch(req).then(r => {
    if (r.ok && r.type === 'basic') { const copy = r.clone(); caches.open(CACHE).then(c => c.put(key, copy)); }
    return r;
  });
  e.respondWith(new Promise(resolve => {
    let done = false;
    const finish = r => { if (!done && r) { done = true; resolve(r); } };
    const timer = setTimeout(() => fromCache().then(finish), NETWORK_TIMEOUT);
    fromNetwork.then(r => { clearTimeout(timer); finish(r); })
      .catch(() => { clearTimeout(timer); fromCache().then(r => (r ? finish(r) : (done = true, resolve(Response.error())))); });
  }));
});
