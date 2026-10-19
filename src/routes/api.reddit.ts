import { createFileRoute } from "@tanstack/react-router";
import { isRedditUrl, jsonUrl, pageFromJson, pageFromRss, parseRedditUrl, rssUrl, type RedditPage } from "@/lib/reddit";

// Reddit for the browser when the visitor's own connection can't reach it directly.
// Reddit refuses most proxy servers, so this asks Reddit's JSON first and falls back to its RSS feeds,
// keeping answers for a couple of minutes because Reddit only allows a few feed requests per minute.

const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";
const memory = new Map<string, { at: number; page: RedditPage }>();
const FRESH = 120_000;

function reply(body: unknown, status = 200, maxAge = 0) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": maxAge ? `public, max-age=${maxAge}` : "no-store" },
  });
}

async function load(url: string): Promise<RedditPage> {
  const route = parseRedditUrl(url);
  const after = new URL(url).searchParams.get("after");
  try {
    const response = await fetch(jsonUrl(route, after), { headers: { "user-agent": UA, accept: "application/json" }, signal: AbortSignal.timeout(6000) });
    if (response.ok) return pageFromJson(route, await response.json(), "server");
    response.body?.cancel().catch(() => {});
  } catch {
    // try the feed
  }
  if (after) throw new Error("No more posts");
  const response = await fetch(rssUrl(route), { headers: { "user-agent": UA, accept: "application/atom+xml,application/xml" }, signal: AbortSignal.timeout(8000) });
  if (!response.ok) throw new Error(response.status === 429 ? "Reddit is busy. Try again in a few seconds." : `Reddit answered ${response.status}`);
  return pageFromRss(route, await response.text());
}

export const Route = createFileRoute("/api/reddit")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const target = new URL(request.url).searchParams.get("url") ?? "";
        if (!isRedditUrl(target)) return reply({ error: "Only Reddit addresses can be opened here." }, 400);
        const key = new URL(target).pathname + new URL(target).search;
        const hit = memory.get(key);
        if (hit && Date.now() - hit.at < FRESH) return reply(hit.page, 200, 60);
        const shared = (globalThis as { caches?: { default?: Cache } }).caches?.default;
        const cacheKey = new Request(`https://reddit-cache.local${key}`);
        try {
          const cached = await shared?.match(cacheKey);
          if (cached) return cached;
        } catch {
          // no shared cache here
        }
        try {
          const page = await load(target);
          memory.set(key, { at: Date.now(), page });
          if (memory.size > 200) memory.delete(memory.keys().next().value!);
          const response = reply(page, 200, 60);
          try {
            await shared?.put(cacheKey, response.clone());
          } catch {
            // caching is optional
          }
          return response;
        } catch (error) {
          if (hit) return reply(hit.page, 200, 0);
          return reply({ error: error instanceof Error ? error.message : "Reddit couldn't be reached." }, 502);
        }
      },
    },
  },
});
