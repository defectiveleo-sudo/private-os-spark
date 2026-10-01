import { createFileRoute } from "@tanstack/react-router";

// PRIVATE Browser page loader.
// Many sites (Brave Search, GitHub, Google...) send headers that forbid being shown
// inside another page, which is why they showed an error. This route fetches the page
// on the server, drops those headers, and hands the page back so it can be displayed.

const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";

function isBlockedHost(hostname: string) {
  const host = hostname.toLowerCase().replace(/^\[|\]$/g, "");
  if (host === "localhost" || host.endsWith(".localhost") || host.endsWith(".local") || host.endsWith(".internal")) return true;
  if (host.includes(":")) return true;
  const ip = host.match(/^(\d+)\.(\d+)\.(\d+)\.(\d+)$/);
  if (ip) {
    const a = Number(ip[1]);
    const b = Number(ip[2]);
    return a === 0 || a === 10 || a === 127 || a >= 224 || (a === 169 && b === 254) || (a === 172 && b >= 16 && b <= 31) || (a === 192 && b === 168) || (a === 100 && b >= 64 && b <= 127);
  }
  return false;
}

function escapeHtml(value: string) {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function errorPage(status: number, title: string, detail: string, url?: string) {
  const link = url && /^https?:\/\//i.test(url)
    ? `<p><a href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer">Open this page in a new tab</a></p>`
    : "";
  const html = `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escapeHtml(title)}</title><style>body{margin:0;min-height:100vh;display:grid;place-items:center;background:#0f1711;color:#f3f0e0;font-family:system-ui,sans-serif;text-align:center;padding:24px}main{max-width:26rem}h1{font-size:1.25rem;margin:0 0 .5rem}p{margin:.5rem 0;font-size:.875rem;opacity:.75}a{color:#7bdc8f}</style></head><body><main><h1>${escapeHtml(title)}</h1><p>${escapeHtml(detail)}</p>${link}</main></body></html>`;
  return new Response(html, {
    status,
    headers: { "content-type": "text/html; charset=utf-8", "cache-control": "no-store" },
  });
}

// Runs inside the loaded page: keeps links and GET forms going through this loader
// and tells PRIVATE Browser which address the page is on.
function clientScript(realUrl: string, origin: string) {
  const real = JSON.stringify(realUrl).replace(/</g, "\\u003c");
  const proxy = JSON.stringify(`${origin}/api/proxy?url=`).replace(/</g, "\\u003c");
  return `(function(){var R=${real},P=${proxy};
function tell(){try{parent.postMessage({privateNav:R},"*")}catch(e){}}
function go(u){location.href=P+encodeURIComponent(u)}
tell();
document.addEventListener("click",function(e){
if(e.defaultPrevented||e.button||e.metaKey||e.ctrlKey||e.shiftKey||e.altKey)return;
var a=e.target&&e.target.closest?e.target.closest("a[href]"):null;if(!a)return;
var t=a.getAttribute("target");if(t&&t!=="_self")return;
var h=a.getAttribute("href");if(!h||h.charAt(0)==="#"||/^(javascript|mailto|tel|data|blob):/i.test(h))return;
if(a.hasAttribute("download"))return;
var u=a.href;if(typeof u!=="string"||!/^https?:/i.test(u))return;
e.preventDefault();go(u);
},true);
document.addEventListener("submit",function(e){
var f=e.target;if(!f||f.tagName!=="FORM")return;
if((f.getAttribute("method")||"get").toLowerCase()!=="get")return;
var t=f.getAttribute("target");if(t&&t!=="_self")return;
e.preventDefault();
var u=new URL(f.getAttribute("action")||"",R);var q=new URLSearchParams();
new FormData(f).forEach(function(v,k){if(typeof v==="string")q.append(k,v)});
var s=e.submitter;if(s&&s.name)q.append(s.name,s.value||"");
u.search=q.toString();go(u.href);
},true);
})();`;
}

export const Route = createFileRoute("/api/proxy")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const self = new URL(request.url);
        const raw = self.searchParams.get("url") ?? "";

        let target: URL;
        try {
          target = new URL(raw);
        } catch {
          return errorPage(400, "That address isn't valid", "Check the address and try again.");
        }
        if (!/^https?:$/.test(target.protocol) || isBlockedHost(target.hostname)) {
          return errorPage(400, "That address can't be opened", "Only public websites can be opened.");
        }

        let upstream: Response;
        try {
          upstream = await fetch(target.href, {
            headers: {
              "user-agent": USER_AGENT,
              accept: request.headers.get("accept") ?? "*/*",
              "accept-language": request.headers.get("accept-language") ?? "en-US,en;q=0.9",
            },
            redirect: "follow",
            signal: AbortSignal.timeout(15000),
          });
        } catch {
          return errorPage(502, "Couldn't reach this site", "The site didn't respond. Try again in a moment.", target.href);
        }

        const finalUrl = upstream.url || target.href;
        try {
          if (isBlockedHost(new URL(finalUrl).hostname)) {
            return errorPage(400, "That address can't be opened", "Only public websites can be opened.");
          }
        } catch {
          return errorPage(502, "Couldn't open this page", "The site sent back an address that can't be used.", target.href);
        }

        const type = upstream.headers.get("content-type") ?? "";
        const headers = new Headers({
          "cache-control": "no-store",
          "referrer-policy": "no-referrer",
          "x-content-type-options": "nosniff",
        });

        if (!/text\/html|application\/xhtml\+xml/i.test(type)) {
          headers.set("content-type", type || "application/octet-stream");
          const disposition = upstream.headers.get("content-disposition");
          if (disposition) headers.set("content-disposition", disposition);
          return new Response(upstream.body, { status: upstream.status, headers });
        }

        const buffer = await upstream.arrayBuffer();
        const charset = /charset=([^;]+)/i.exec(type)?.[1]?.trim().replace(/["']/g, "") || "utf-8";
        let html: string;
        try {
          html = new TextDecoder(charset).decode(buffer);
        } catch {
          html = new TextDecoder("utf-8").decode(buffer);
        }

        html = html.replace(/<meta[^>]+http-equiv=["']?(?:content-security-policy|x-frame-options)[^>]*>/gi, "");
        const inject = `<base href="${escapeHtml(finalUrl)}"><script>${clientScript(finalUrl, self.origin)}</script>`;
        if (/<head(\s[^>]*)?>/i.test(html)) {
          html = html.replace(/<head(\s[^>]*)?>/i, (match) => match + inject);
        } else {
          html = html.replace(/^(\s*<!doctype[^>]*>)?/i, (match) => match + inject);
        }

        headers.set("content-type", "text/html; charset=utf-8");
        return new Response(html, { status: upstream.status, headers });
      },
    },
  },
});
