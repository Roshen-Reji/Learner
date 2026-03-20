self.addEventListener("install", (e) => {
  self.skipWaiting();
});

self.addEventListener("activate", (e) => {
  e.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", (e) => {
  // A very basic fetch handler just to satisfy the PWA install criteria
  // For proper offline support, you would cache Next.js assets here.
  e.respondWith(fetch(e.request).catch(() => new Response("Offline Mode")));
});
