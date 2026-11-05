/* Offline support: app shell is cached up front, each image is cached the first time it is shown. */
const CACHE = "time-v2";
const SHELL = ["./", "index.html", "images.js", "manifest.webmanifest", "fonts/sora.woff2",
               "fonts/instrument-serif-italic.woff2", "icons/icon-192.png", "icons/icon-512.png", "icons/apple-touch-icon.png"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});
self.addEventListener("fetch", e => {
  const url = new URL(e.request.url);
  if (e.request.method !== "GET" || url.origin !== location.origin) return;   // online images: network only
  const fresh = e.request.mode === "navigate" || /\.(html|js)$/.test(url.pathname) || url.pathname.endsWith("/");
  const fromNet = () => fetch(e.request).then(res => {
    if (res.ok) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(e.request, copy)); }
    return res;
  });
  // pages and scripts: network first (updates arrive immediately), cache when offline; images and fonts: cache first
  e.respondWith(fresh ? fromNet().catch(() => caches.match(e.request)) : caches.match(e.request).then(hit => hit || fromNet()));
});
