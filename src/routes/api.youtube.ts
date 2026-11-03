import { createFileRoute } from "@tanstack/react-router";

// YouTube search for the YouTube app. The server reads YouTube's public results page and returns the
// videos on it, so search works even when the visitor's own connection can't reach youtube.com.
// ?thumb=<video id> returns that video's thumbnail the same way.

const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";
const VIDEO_ID = /^[A-Za-z0-9_-]{11}$/;
const memory = new Map<string, { at: number; videos: YouTubeVideo[] }>();
const FRESH = 10 * 60_000;

export type YouTubeVideo = { id: string; title: string; channel: string; views: string; length: string; published: string; live: boolean };

type Text = { simpleText?: string; runs?: { text?: string }[] } | undefined;
type RawVideo = { videoId?: unknown; title?: Text; ownerText?: Text; shortViewCountText?: Text; viewCountText?: Text; lengthText?: Text; publishedTimeText?: Text; badges?: unknown };
const text = (value: Text) => value?.simpleText ?? value?.runs?.map((run) => run.text ?? "").join("") ?? "";

function reply(body: unknown, status = 200, maxAge = 0) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": maxAge ? `public, max-age=${maxAge}` : "no-store" },
  });
}

// The results page carries its data as `var ytInitialData = {...};`.
function initialData(html: string): unknown {
  const marker = "var ytInitialData = ";
  const start = html.indexOf(marker);
  if (start < 0) return null;
  const end = html.indexOf(";</script>", start);
  if (end < 0) return null;
  try {
    return JSON.parse(html.slice(start + marker.length, end));
  } catch {
    return null;
  }
}

function collectVideos(data: unknown) {
  const found: YouTubeVideo[] = [];
  const seen = new Set<string>();
  const walk = (node: unknown, depth: number) => {
    if (!node || typeof node !== "object" || depth > 40 || found.length >= 40) return;
    if (Array.isArray(node)) {
      for (const item of node) walk(item, depth + 1);
      return;
    }
    const record = node as { videoRenderer?: RawVideo };
    const video = record.videoRenderer;
    if (video && typeof video.videoId === "string" && VIDEO_ID.test(video.videoId)) {
      if (!seen.has(video.videoId)) {
        seen.add(video.videoId);
        const badges = JSON.stringify(video.badges ?? []);
        found.push({
          id: video.videoId,
          title: text(video.title),
          channel: text(video.ownerText),
          views: text(video.shortViewCountText) || text(video.viewCountText),
          length: text(video.lengthText),
          published: text(video.publishedTimeText),
          live: badges.includes("LIVE") || (!video.lengthText && /watching/i.test(text(video.viewCountText))),
        });
      }
      return;
    }
    for (const value of Object.values(node)) walk(value, depth + 1);
  };
  walk(data, 0);
  return found;
}

async function search(query: string) {
  const url = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}&hl=en&gl=US`;
  const response = await fetch(url, { headers: { "user-agent": UA, "accept-language": "en-US,en;q=0.9", cookie: "CONSENT=YES+1" }, signal: AbortSignal.timeout(9000) });
  if (!response.ok) throw new Error(`YouTube answered ${response.status}`);
  return collectVideos(initialData(await response.text()));
}

export const Route = createFileRoute("/api/youtube")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const params = new URL(request.url).searchParams;
        const thumb = params.get("thumb") ?? "";
        if (thumb) {
          if (!VIDEO_ID.test(thumb)) return reply({ error: "Not a video id" }, 400);
          const image = await fetch(`https://i.ytimg.com/vi/${thumb}/mqdefault.jpg`, { headers: { "user-agent": UA }, signal: AbortSignal.timeout(8000) }).catch(() => null);
          if (!image?.ok || !image.body) return new Response(null, { status: 404 });
          return new Response(image.body, { headers: { "content-type": image.headers.get("content-type") ?? "image/jpeg", "cache-control": "public, max-age=86400" } });
        }
        const query = (params.get("q") ?? "").trim().slice(0, 120);
        if (!query) return reply({ error: "Type something to search for." }, 400);
        const key = query.toLowerCase();
        const hit = memory.get(key);
        if (hit && Date.now() - hit.at < FRESH) return reply({ videos: hit.videos }, 200, 300);
        try {
          const videos = await search(query);
          if (videos.length === 0) return reply({ videos: [], error: "No videos found." }, 200, 0);
          memory.set(key, { at: Date.now(), videos });
          if (memory.size > 300) memory.delete(memory.keys().next().value!);
          return reply({ videos }, 200, 300);
        } catch (error) {
          if (hit) return reply({ videos: hit.videos }, 200, 0);
          return reply({ error: error instanceof Error ? error.message : "YouTube couldn't be reached." }, 502);
        }
      },
    },
  },
});
