// PRIVATE OS proxy engine (Scramjet + Epoxy).
// Safety rules: only /scramjet/ requests are handled here and everything else goes straight to the
// network, so this worker can never take the whole site offline.
importScripts("/scramjet.all.js");

self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (event) => event.waitUntil(self.clients.claim()));

// Created on the first proxied request. Scramjet opens its database as soon as it is created, and
// doing that before the page has set the database up leaves it empty, which breaks the engine.
let scramjet = null;

async function handle(event) {
  try {
    if (!scramjet) {
      const { ScramjetServiceWorker } = $scramjetLoadWorker();
      scramjet = new ScramjetServiceWorker();
    }
    await scramjet.loadConfig();
    if (scramjet.route(event)) return await scramjet.fetch(event);
  } catch (error) {
    return new Response("Proxy error: " + (error && error.message ? error.message : error), {
      status: 502,
      headers: { "content-type": "text/plain; charset=utf-8" },
    });
  }
  return fetch(event.request);
}

self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin || !url.pathname.startsWith("/scramjet/")) return;
  event.respondWith(handle(event));
});
