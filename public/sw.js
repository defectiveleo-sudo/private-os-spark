// PRIVATE OS proxy engine (Scramjet + Epoxy).
// Safety rules: only /scramjet/ requests are handled here and everything else goes straight to the
// network, so this worker can never take the whole site offline.
importScripts("/scramjet.all.js");

self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (event) => event.waitUntil(self.clients.claim()));

// Created on the first proxied request. Scramjet opens its database as soon as it is created, and
// doing that before the page has set the database up leaves it empty, which breaks the engine.
let scramjet = null;
let cookiesRestored = null;
let savedCookies = "";

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Opens the engine database only if the page already set it up, so this never creates an empty one.
function openStore() {
  return new Promise((resolve) => {
    let request;
    try {
      request = indexedDB.open("$scramjet");
    } catch {
      return resolve(null);
    }
    request.onupgradeneeded = () => request.transaction.abort();
    request.onerror = () => resolve(null);
    request.onsuccess = () => {
      const database = request.result;
      if (database.objectStoreNames.contains("cookies")) return resolve(database);
      database.close();
      resolve(null);
    };
  });
}

// Site cookies live in the worker's memory and the worker is stopped when idle, so they are kept in
// the engine database and put back when it starts again. That keeps people signed in to sites.
async function restoreCookies() {
  const database = await openStore();
  if (!database) return;
  await new Promise((resolve) => {
    const request = database.transaction("cookies").objectStore("cookies").get("cookies");
    request.onsuccess = () => {
      const stored = request.result;
      if (stored && typeof stored === "object") Object.assign(scramjet.cookieStore.cookies, stored, { ...scramjet.cookieStore.cookies });
      savedCookies = scramjet.cookieStore.dump();
      resolve();
    };
    request.onerror = () => resolve();
  });
  database.close();
}

async function writeCookies(cookies) {
  const database = await openStore();
  if (!database) return;
  try {
    database.transaction("cookies", "readwrite").objectStore("cookies").put(cookies, "cookies");
  } catch {
    // database busy: the next response saves again
  }
  database.close();
}

async function saveCookies() {
  const dump = scramjet.cookieStore.dump();
  if (dump === savedCookies) return;
  savedCookies = dump;
  await writeCookies(JSON.parse(dump));
}

// Scramjet answers a page it could not reach with its own error page (status 500).
async function isEngineError(response) {
  if (response.status !== 500) return false;
  try {
    const text = await response.clone().text();
    return text.includes("Destination: ") && text.includes("Message: ");
  } catch {
    return false;
  }
}

const escapeHtml = (value) => String(value).replace(/[&<>"]/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[char]);

async function errorPage(response, target) {
  let details = "";
  try {
    details = (await response.clone().text()).replace(/<[^>]+>/g, " ").replace(/\s+\n/g, "\n").trim().slice(0, 1500);
  } catch {
    // no details
  }
  let host = target;
  try {
    host = new URL(target).hostname.replace(/^www\./, "");
  } catch {
    // keep the raw address
  }
  const html = `<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Couldn't open ${escapeHtml(host)}</title>
<style>body{margin:0;min-height:100vh;display:grid;place-items:center;background:#0b0d12;color:#e8eaf0;font:14px/1.5 system-ui,sans-serif}main{max-width:460px;padding:28px;text-align:center}h1{font-size:20px;margin:14px 0 6px}p{color:#a3a9b8;margin:0 0 18px}button{border:0;border-radius:999px;padding:10px 20px;font:600 13px system-ui;background:#7c9cff;color:#0b0d12;cursor:pointer}details{margin-top:22px;text-align:left;color:#7d8394;font-size:11px}pre{white-space:pre-wrap;word-break:break-all}.dot{width:44px;height:44px;margin:auto;border-radius:50%;background:radial-gradient(circle at 35% 30%,#a5b8ff,#4f63d6);box-shadow:0 0 40px #4f63d680}</style>
<main><div class="dot"></div><h1>Couldn't open ${escapeHtml(host)}</h1><p>The proxy server dropped the connection, so the browser switched to another server. Try again in a moment.</p><button onclick="location.reload()">Try again</button><details><summary>Details</summary><pre>${escapeHtml(details)}</pre></details></main>`;
  return new Response(html, { status: 502, headers: { "content-type": "text/html; charset=utf-8" } });
}

async function tellPages(message) {
  try {
    const list = await self.clients.matchAll({ type: "window" });
    for (const client of list) client.postMessage(message);
  } catch {
    // no pages open
  }
}

async function handle(event) {
  try {
    if (!scramjet) {
      const { ScramjetServiceWorker } = $scramjetLoadWorker();
      scramjet = new ScramjetServiceWorker();
    }
    await scramjet.loadConfig();
    if (!cookiesRestored) cookiesRestored = restoreCookies().catch(() => undefined);
    await cookiesRestored;
    if (!scramjet.route(event)) return fetch(event.request);
    const page = event.request.method === "GET" && ["document", "iframe"].includes(event.request.destination);
    let response = await scramjet.fetch(event);
    // Public proxy servers sometimes drop a connection mid-handshake ("tls handshake eof").
    // A page is tried again twice before giving up, and the browser then moves to another server.
    if (page && (await isEngineError(response))) {
      for (const wait of [350, 1100]) {
        await sleep(wait);
        const again = await scramjet.fetch(event);
        if (!(await isEngineError(again))) {
          response = again;
          break;
        }
        response = again;
      }
      if (await isEngineError(response)) {
        let target = event.request.url;
        try {
          target = decodeURIComponent(new URL(event.request.url).pathname.slice("/scramjet/".length));
        } catch {
          // keep the proxied address
        }
        void tellPages({ posProxy: "failed", url: target });
        return errorPage(response, target);
      }
    }
    void saveCookies();
    return response;
  } catch (error) {
    return new Response("Proxy error: " + (error && error.message ? error.message : error), {
      status: 502,
      headers: { "content-type": "text/plain; charset=utf-8" },
    });
  }
}

self.addEventListener("message", (event) => {
  if (!event.data || event.data.posProxy !== "clear-cookies") return;
  if (scramjet) scramjet.cookieStore.cookies = {};
  savedCookies = "{}";
  event.waitUntil(writeCookies({}));
});

self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin || !url.pathname.startsWith("/scramjet/")) return;
  event.respondWith(handle(event));
});
