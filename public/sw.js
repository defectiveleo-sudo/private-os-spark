// PRIVATE OS proxy engine (Scramjet + Epoxy).
// Safety rules: the site's own pages and files are never routed through the proxy, and any error
// falls back to a normal network request, so this worker can never take the whole site offline.
importScripts("/scramjet.all.js");

const { ScramjetServiceWorker } = $scramjetLoadWorker();
const scramjet = new ScramjetServiceWorker();

self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (event) => event.waitUntil(self.clients.claim()));

async function handle(event) {
  const url = new URL(event.request.url);
  const proxied = url.origin === self.location.origin && url.pathname.startsWith("/scramjet/");
  try {
    await scramjet.loadConfig();
    if (scramjet.route(event)) return await scramjet.fetch(event);
  } catch (error) {
    if (proxied) {
      return new Response("Proxy error: " + (error && error.message ? error.message : error), {
        status: 502,
        headers: { "content-type": "text/plain; charset=utf-8" },
      });
    }
  }
  return fetch(event.request);
}

self.addEventListener("fetch", (event) => {
  const request = event.request;
  const url = new URL(request.url);
  // Never intercept the site's own page loads.
  if (request.mode === "navigate" && url.origin === self.location.origin && !url.pathname.startsWith("/scramjet/")) return;
  event.respondWith(handle(event));
});
