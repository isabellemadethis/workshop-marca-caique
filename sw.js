// ============ Service Worker — Workshop Marca Pessoal ============
// Cache-first com fallback de rede pra recursos estáticos.
// Bump CACHE_VERSION sempre que algo mudar pra forçar refresh.

const CACHE_VERSION = "v1.2.0";
const CACHE_NAME = `workshop-marca-${CACHE_VERSION}`;

const ASSETS = [
  "./",
  "./index.html",
  "./view.html",
  "./manifest.json",
  "./icon-192.png",
  "./icon-512.png",
  "./icon-maskable.png",
  "./favicon.ico",
  "./favicon-32.png",
  "./apple-touch-icon.png",
  // Ikigai
  "./slides/ikigai/p13.webp",
  "./slides/ikigai/p14.webp",
  "./slides/ikigai/p15.webp",
  "./slides/ikigai/p16.webp",
  "./slides/ikigai/p17.webp",
  "./slides/ikigai/p18.webp",
  // Comunidade
  "./slides/comunidade/p2.webp",
  "./slides/comunidade/p3.webp",
  "./slides/comunidade/p5.webp",
  "./slides/comunidade/p6.webp",
  "./slides/comunidade/p9.webp",
  "./slides/comunidade/p12.webp",
  "./slides/comunidade/p13.webp",
  // Verticais
  "./slides/verticais/p3.webp",
  "./slides/verticais/p4.webp",
  "./slides/verticais/p5.webp",
  "./slides/verticais/p6.webp",
  "./slides/verticais/p8.webp",
  "./slides/verticais/p9.webp",
  "./slides/verticais/p10.webp",
  "./slides/verticais/p12.webp",
  "./slides/verticais/p13.webp",
  "./slides/verticais/p14.webp",
  "./slides/verticais/p17.webp",
  // História
  "./slides/historia/p5.webp",
  "./slides/historia/p7.webp",
  "./slides/historia/p8.webp",
  "./slides/historia/p10.webp",
  "./slides/historia/p21.webp"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", event => {
  const req = event.request;
  if (req.method !== "GET") return;

  // Cache-first com fallback de rede
  event.respondWith(
    caches.match(req).then(cached => {
      if (cached) return cached;
      return fetch(req).then(res => {
        // Cache responses dos próprios assets (mesma origem)
        if (res && res.status === 200 && res.type === "basic") {
          const clone = res.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(req, clone));
        }
        return res;
      }).catch(() => {
        // Offline + recurso não cacheado: tenta index.html como fallback navegacional
        if (req.mode === "navigate") {
          return caches.match("./index.html");
        }
      });
    })
  );
});
