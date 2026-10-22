// Service worker for the /prototype PWA.
// - Static build assets and icons: cache-first (they are content-hashed / immutable).
// - /prototype page navigations: network-first, falling back to the last cached copy when offline.
// - /api/*: never cached — responses are user-specific and go through the auth proxy.
const CACHE = "weworship-prototype-v1";

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys.filter((k) => k.startsWith("weworship-prototype-") && k !== CACHE).map((k) => caches.delete(k)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

function isCacheable(res) {
  return res?.ok && !res.redirected && res.type === "basic";
}

async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;
  const res = await fetch(request);
  if (isCacheable(res)) {
    const cache = await caches.open(CACHE);
    cache.put(request, res.clone());
  }
  return res;
}

async function networkFirst(request) {
  try {
    const res = await fetch(request);
    if (isCacheable(res)) {
      const cache = await caches.open(CACHE);
      cache.put(request, res.clone());
    }
    return res;
  } catch (err) {
    const cached = await caches.match(request);
    if (cached) return cached;
    throw err;
  }
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  if (url.pathname.startsWith("/api/")) return;

  if (url.pathname.startsWith("/_next/static/") || url.pathname.startsWith("/prototype-icons/")) {
    event.respondWith(cacheFirst(request));
    return;
  }

  if (request.mode === "navigate" && url.pathname.startsWith("/prototype")) {
    event.respondWith(networkFirst(request));
  }
});
