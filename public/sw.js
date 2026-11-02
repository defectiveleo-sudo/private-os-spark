// PRIVATE OS proxy worker (Scramjet 2).
// The engine itself runs in the page; this worker only hands requests for proxied pages (/~/sj/...)
// to it. Everything else goes straight to the network, so this worker can never take the site offline.
importScripts("/controller/controller.sw.js");

const escapeHtml = (value) => String(value).replace(/[&<>"]/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[char]);

function errorPage(target, details) {
  let host = target;
  try {
    host = new URL(target).hostname.replace(/^www\./, "");
  } catch {
    // keep the raw address
  }
  const html = `<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Couldn't open ${escapeHtml(host)}</title>
<style>body{margin:0;min-height:100vh;display:grid;place-items:center;background:#0b0d12;color:#e8eaf0;font:14px/1.5 system-ui,sans-serif}main{max-width:460px;padding:28px;text-align:center}h1{font-size:20px;margin:14px 0 6px}p{color:#a3a9b8;margin:0 0 18px}button{border:0;border-radius:999px;padding:10px 20px;font:600 13px system-ui;background:#7c9cff;color:#0b0d12;cursor:pointer}details{margin-top:22px;text-align:left;color:#7d8394;font-size:11px}pre{white-space:pre-wrap;word-break:break-all}.dot{width:44px;height:44px;margin:auto;border-radius:50%;background:radial-gradient(circle at 35% 30%,#a5b8ff,#4f63d6);box-shadow:0 0 40px #4f63d680}</style>
<main><div class="dot"></div><h1>Couldn't open ${escapeHtml(host)}</h1><p>The proxy couldn't reach this page. Try again in a moment.</p><button onclick="location.reload()">Try again</button><details><summary>Details</summary><pre>${escapeHtml(details)}</pre></details></main>`;
  return new Response(html, { status: 502, headers: { "content-type": "text/html; charset=utf-8" } });
}

function targetOf(url) {
  try {
    // /~/sj/<engine>/<frame>/<encoded address>
    const parts = new URL(url).pathname.split("/");
    return decodeURIComponent(parts.slice(5).join("/"));
  } catch {
    return url;
  }
}

async function handle(event) {
  const response = await $scramjetController.route(event);
  const page = event.request.method === "GET" && ["document", "iframe"].includes(event.request.destination);
  if (page && response.status === 500) {
    const text = await response.clone().text().catch(() => "");
    if (text.startsWith("Internal Service Worker Error")) return errorPage(targetOf(event.request.url), text.slice(0, 1500));
  }
  return response;
}

addEventListener("fetch", (event) => {
  let routed = false;
  try {
    routed = $scramjetController.shouldRoute(event);
  } catch {
    routed = false;
  }
  if (routed) event.respondWith(handle(event));
});
