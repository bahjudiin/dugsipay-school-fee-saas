/* DugsiPAY service worker — offline-first shell.
   Static assets: cache-first. Navigations: network-first with
   offline fallback to the last cached visit (or /offline).
   API routes & server actions are NEVER cached. */

const VERSION = "v1";
const STATIC_CACHE = `dp-static-${VERSION}`;
const PAGE_CACHE = `dp-pages-${VERSION}`;
const OFFLINE_URL = "/offline";
const PRECACHE = ["/", "/offline", "/icon.svg", "/manifest.webmanifest"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => cache.addAll(PRECACHE)).then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((k) => k !== STATIC_CACHE && k !== PAGE_CACHE).map((k) => caches.delete(k))),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;
  if (url.pathname.startsWith("/api/")) return; // actions + data always live

  // Cache-first for build assets & icons (immutable, hashed by Next)
  if (url.pathname.startsWith("/_next/static/") || /\.(svg|png|webmanifest|woff2?)$/.test(url.pathname)) {
    event.respondWith(
      caches.match(req).then(
        (hit) =>
          hit ||
          fetch(req).then((res) => {
            if (res.ok) {
              const clone = res.clone();
              caches.open(STATIC_CACHE).then((c) => c.put(req, clone));
            }
            return res;
          }),
      ),
    );
    return;
  }

  // Network-first for pages; fall back to the cached copy when offline.
  if (req.mode === "navigate") {
    event.respondWith(
      fetch(req)
        .then((res) => {
          if (res.ok) {
            const clone = res.clone();
            caches.open(PAGE_CACHE).then((c) => c.put(req, clone));
          }
          return res;
        })
        .catch(async () => {
          const hit = await caches.match(req);
          return hit || caches.match(OFFLINE_URL);
        }),
    );
  }
});
