import { createFileRoute } from "@tanstack/react-router";

// Server-side web search so results show up even when a search site refuses to run inside a proxy.
type Hit = { title: string; url: string; snippet: string };

const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";

const clean = (text: string) =>
  text
    .replace(/<[^>]+>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#x27;|&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s+/g, " ")
    .trim();

function ddgUrl(href: string) {
  const fixed = href.replace(/&amp;/g, "&");
  const match = /[?&]uddg=([^&]+)/.exec(fixed);
  if (match) {
    try {
      return decodeURIComponent(match[1]!);
    } catch {
      // fall through
    }
  }
  return fixed.startsWith("//") ? `https:${fixed}` : fixed;
}

function bingUrl(href: string) {
  const fixed = href.replace(/&amp;/g, "&");
  const match = /[?&]u=a1([^&]+)/.exec(fixed);
  if (match) {
    try {
      return atob(match[1]!.replace(/-/g, "+").replace(/_/g, "/"));
    } catch {
      // fall through
    }
  }
  return fixed;
}

const ok = (url: string) => /^https?:\/\//i.test(url) && !/duckduckgo\.com\/y\.js/i.test(url);

async function post(url: string, q: string) {
  const res = await fetch(url, {
    method: "POST",
    headers: { "user-agent": UA, "content-type": "application/x-www-form-urlencoded", "accept-language": "en-US,en;q=0.9" },
    body: new URLSearchParams({ q }).toString(),
    signal: AbortSignal.timeout(9000),
  });
  return res.text();
}

async function ddgHtml(q: string): Promise<Hit[]> {
  const html = await post("https://html.duckduckgo.com/html/", q);
  const anchors = [...html.matchAll(/<a[^>]*class="[^"]*result__a[^"]*"[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/g)];
  const hits: Hit[] = [];
  anchors.forEach((m, i) => {
    const chunk = html.slice(m.index ?? 0, anchors[i + 1]?.index ?? html.length);
    const snippet = /class="[^"]*result__snippet[^"]*"[^>]*>([\s\S]*?)<\/a>/.exec(chunk);
    const url = ddgUrl(m[1]!);
    if (ok(url)) hits.push({ title: clean(m[2]!), url, snippet: snippet ? clean(snippet[1]!) : "" });
  });
  return hits;
}

async function ddgLite(q: string): Promise<Hit[]> {
  const html = await post("https://lite.duckduckgo.com/lite/", q);
  const anchors = [...html.matchAll(/<a[^>]*href="([^"]+)"[^>]*class=['"]result-link['"][^>]*>([\s\S]*?)<\/a>/g)];
  const hits: Hit[] = [];
  anchors.forEach((m, i) => {
    const chunk = html.slice(m.index ?? 0, anchors[i + 1]?.index ?? html.length);
    const snippet = /class=['"]result-snippet['"][^>]*>([\s\S]*?)<\/td>/.exec(chunk);
    const url = ddgUrl(m[1]!);
    if (ok(url)) hits.push({ title: clean(m[2]!), url, snippet: snippet ? clean(snippet[1]!) : "" });
  });
  return hits;
}

async function bing(q: string): Promise<Hit[]> {
  const res = await fetch(`https://www.bing.com/search?q=${encodeURIComponent(q)}&setlang=en`, {
    headers: { "user-agent": UA, "accept-language": "en-US,en;q=0.9" },
    signal: AbortSignal.timeout(9000),
  });
  const html = await res.text();
  const hits: Hit[] = [];
  for (const block of html.split('<li class="b_algo"').slice(1)) {
    const link = /<h2[^>]*>\s*<a[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/.exec(block);
    if (!link) continue;
    const snippet = /<p[^>]*>([\s\S]*?)<\/p>/.exec(block);
    const url = bingUrl(link[1]!);
    if (ok(url)) hits.push({ title: clean(link[2]!), url, snippet: snippet ? clean(snippet[1]!) : "" });
  }
  return hits;
}

export const Route = createFileRoute("/api/search")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const q = new URL(request.url).searchParams.get("q")?.trim().slice(0, 300) ?? "";
        const headers = { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" };
        if (!q) return new Response(JSON.stringify({ hits: [] }), { headers });
        for (const [engine, run] of [["duckduckgo", ddgHtml], ["duckduckgo-lite", ddgLite], ["bing", bing]] as const) {
          try {
            const hits = (await run(q)).slice(0, 12);
            if (hits.length > 0) return new Response(JSON.stringify({ engine, hits }), { headers });
          } catch {
            // try the next engine
          }
        }
        return new Response(JSON.stringify({ hits: [] }), { headers });
      },
    },
  },
});
