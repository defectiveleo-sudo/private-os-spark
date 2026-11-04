import { createFileRoute } from "@tanstack/react-router";

// Server side of Priv-Tube. The server reads YouTube's public pages (no account, no API key) and returns
// plain JSON, so Priv-Tube works even when the visitor's own connection can't reach youtube.com.
//   ?feed=home|shorts|live&topic=...   a feed built from rotating topic searches, new every 39 minutes
//   ?q=...&type=all|video|shorts|live   search
//   ?video=<id>                         one video: details, related videos and the comments token
//   ?comments=<token>                   a page of comments (and the token for the next page)
//   ?channel=<UC id or @handle>&tab=videos|shorts|streams
//   ?suggest=...                        search suggestions
//   ?thumb=<id>&s=mq|hq|short           a thumbnail;  ?img=<url> a channel avatar or banner

const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";
const HEADERS = { "user-agent": UA, "accept-language": "en-US,en;q=0.9", cookie: "CONSENT=YES+1" };
const VIDEO_ID = /^[A-Za-z0-9_-]{11}$/;
const CHANNEL_ID = /^UC[A-Za-z0-9_-]{22}$/;
const HANDLE = /^@[A-Za-z0-9._-]{2,60}$/;
const IMAGE_HOSTS = new Set(["i.ytimg.com", "yt3.ggpht.com", "yt3.googleusercontent.com"]);

// Feeds change every 39 minutes: the slot number picks which topics the feed is built from.
export const FEED_EVERY = 39 * 60_000;
const SEARCH_FRESH = 10 * 60_000;

export type TubeVideo = {
  id: string;
  title: string;
  channel: string;
  channelId: string;
  avatar: string;
  views: string;
  length: string;
  published: string;
  live: boolean;
  short: boolean;
};

export type TubeDetails = TubeVideo & {
  description: string;
  subscribers: string;
  likes: string;
  date: string;
  category: string;
  related: TubeVideo[];
  comments: string;
};

export type TubeComment = { id: string; author: string; avatar: string; text: string; published: string; likes: string; replies: string; creator: boolean };

export type TubeChannel = {
  id: string;
  title: string;
  handle: string;
  avatar: string;
  banner: string;
  subscribers: string;
  videoCount: string;
  description: string;
  videos: TubeVideo[];
};

const memory = new Map<string, { at: number; value: unknown }>();
function remember<T>(key: string, value: T) {
  memory.set(key, { at: Date.now(), value });
  if (memory.size > 400) memory.delete(memory.keys().next().value!);
  return value;
}
function recall<T>(key: string, fresh: number): T | undefined {
  const hit = memory.get(key);
  return hit && Date.now() - hit.at < fresh ? (hit.value as T) : undefined;
}

function reply(body: unknown, status = 200, maxAge = 0) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": maxAge ? `public, max-age=${maxAge}` : "no-store" },
  });
}

type Node = Record<string, unknown>;
const isNode = (value: unknown): value is Node => !!value && typeof value === "object" && !Array.isArray(value);
const get = (value: unknown, ...path: (string | number)[]): unknown => {
  let current = value;
  for (const step of path) {
    if (current == null || typeof current !== "object") return undefined;
    current = (current as Record<string | number, unknown>)[step];
  }
  return current;
};
const str = (value: unknown) => (typeof value === "string" ? value : "");
type Text = { simpleText?: string; runs?: { text?: string }[]; content?: string } | undefined;
const text = (value: unknown) => {
  const t = value as Text;
  return t?.simpleText ?? t?.content ?? t?.runs?.map((run) => run.text ?? "").join("") ?? "";
};
const firstUrl = (sources: unknown) => {
  if (!Array.isArray(sources) || sources.length === 0) return "";
  const last = sources[sources.length - 1] as { url?: string };
  const url = str(last?.url);
  return url.startsWith("//") ? `https:${url}` : url;
};

// Every value under `key` anywhere in the tree.
function findAll(node: unknown, key: string, out: unknown[] = [], depth = 0): unknown[] {
  if (!node || typeof node !== "object" || depth > 60) return out;
  if (Array.isArray(node)) {
    for (const item of node) findAll(item, key, out, depth + 1);
    return out;
  }
  for (const [name, value] of Object.entries(node)) {
    if (name === key) out.push(value);
    findAll(value, key, out, depth + 1);
  }
  return out;
}

// YouTube pages carry their data as `var name = {...};`. Reads the JSON object that starts after the marker.
function pageJson(html: string, marker: string): unknown {
  const at = html.indexOf(marker);
  if (at < 0) return null;
  const start = html.indexOf("{", at + marker.length);
  if (start < 0) return null;
  let depth = 0;
  let quoted = false;
  for (let index = start; index < html.length; index++) {
    const char = html[index];
    if (quoted) {
      if (char === "\\") index++;
      else if (char === '"') quoted = false;
      continue;
    }
    if (char === '"') quoted = true;
    else if (char === "{") depth++;
    else if (char === "}" && --depth === 0) {
      try {
        return JSON.parse(html.slice(start, index + 1));
      } catch {
        return null;
      }
    }
  }
  return null;
}

const looksLikeViews = (value: string) => /view|watching|^[\d.,]+[KMB]?$/i.test(value);
const looksLikeDate = (value: string) => /ago|streamed|premiere|scheduled|^\w{3} \d/i.test(value);

function fromVideoRenderer(video: Node): TubeVideo | null {
  const id = str(video["videoId"]);
  if (!VIDEO_ID.test(id)) return null;
  const badges = JSON.stringify([video["badges"] ?? [], video["thumbnailOverlays"] ?? []]);
  const counted = text(video["shortViewCountText"]) || text(video["viewCountText"]);
  const views = /^[\d.,]+[KMB]?$/.test(counted) ? `${counted} views` : counted;
  const owner = video["ownerText"] ?? video["longBylineText"] ?? video["shortBylineText"];
  return {
    id,
    title: text(video["title"]) || text(video["headline"]),
    channel: text(owner),
    channelId: str(get(owner, "runs", 0, "navigationEndpoint", "browseEndpoint", "browseId")),
    avatar: firstUrl(get(video, "channelThumbnailSupportedRenderers", "channelThumbnailWithLinkRenderer", "thumbnail", "thumbnails")) || firstUrl(get(video, "channelThumbnail", "thumbnails")),
    views,
    length: text(video["lengthText"]),
    published: text(video["publishedTimeText"]),
    live: badges.includes("LIVE") || (!video["lengthText"] && /watching/i.test(views)),
    short: false,
  };
}

function fromLockup(lockup: Node): TubeVideo | null {
  const id = str(lockup["contentId"]);
  const type = str(lockup["contentType"]);
  if (!VIDEO_ID.test(id) || (type && type !== "LOCKUP_CONTENT_TYPE_VIDEO")) return null;
  const meta = get(lockup, "metadata", "lockupMetadataViewModel");
  const rows = (get(meta, "metadata", "contentMetadataViewModel", "metadataRows") as { metadataParts?: { text?: unknown }[] }[] | undefined) ?? [];
  const parts = rows.map((row) => (row.metadataParts ?? []).map((part) => text(part.text)).filter(Boolean));
  const flat = parts.flat();
  const views = flat.find(looksLikeViews) ?? "";
  const published = flat.find(looksLikeDate) ?? "";
  const channel = parts.length > 1 ? (parts[0]?.[0] ?? "") : (flat.find((part) => part !== views && part !== published) ?? "");
  const badges = findAll(get(lockup, "contentImage"), "thumbnailBadgeViewModel") as Node[];
  const badgeText = badges.map((badge) => str(badge["text"]));
  const live = badgeText.some((value) => /^live$/i.test(value)) || badges.some((badge) => str(badge["badgeStyle"]).includes("LIVE")) || /watching/i.test(views);
  const avatarNode = get(meta, "image", "decoratedAvatarViewModel");
  return {
    id,
    title: text(get(meta, "title")),
    channel,
    channelId: str((findAll(avatarNode, "browseEndpoint")[0] as Node | undefined)?.["browseId"]),
    avatar: firstUrl(get(avatarNode, "avatar", "avatarViewModel", "image", "sources")),
    views: views ? (/view|watching/i.test(views) ? views : `${views} views`) : "",
    length: live ? "" : (badgeText.find((value) => /^\d+:\d\d/.test(value)) ?? ""),
    published,
    live,
    short: false,
  };
}

function fromShortsLockup(lockup: Node): TubeVideo | null {
  const endpoint = get(lockup, "onTap", "innertubeCommand", "reelWatchEndpoint");
  const id = str(get(endpoint, "videoId")) || str(lockup["entityId"]).replace(/^shorts-shelf-item-/, "");
  if (!VIDEO_ID.test(id)) return null;
  return {
    id,
    title: text(get(lockup, "overlayMetadata", "primaryText")) || str(lockup["accessibilityText"]).split(",")[0] || "",
    channel: "",
    channelId: "",
    avatar: "",
    views: text(get(lockup, "overlayMetadata", "secondaryText")),
    length: "",
    published: "",
    live: false,
    short: true,
  };
}

function fromReelItem(reel: Node): TubeVideo | null {
  const id = str(reel["videoId"]);
  if (!VIDEO_ID.test(id)) return null;
  return { id, title: text(reel["headline"]), channel: "", channelId: "", avatar: "", views: text(reel["viewCountText"]), length: "", published: "", live: false, short: true };
}

// Every video, short and live stream on a page, in page order, each once.
function collect(data: unknown, limit = 80) {
  const videos: TubeVideo[] = [];
  const shorts: TubeVideo[] = [];
  const seen = new Set<string>();
  const add = (item: TubeVideo | null) => {
    if (!item || seen.has(item.id) || !item.title) return;
    seen.add(item.id);
    (item.short ? shorts : videos).push(item);
  };
  const walk = (node: unknown, depth: number) => {
    if (!node || typeof node !== "object" || depth > 50 || videos.length + shorts.length >= limit) return;
    if (Array.isArray(node)) {
      for (const item of node) walk(item, depth + 1);
      return;
    }
    const record = node as Node;
    if (isNode(record["videoRenderer"])) return add(fromVideoRenderer(record["videoRenderer"]));
    if (isNode(record["compactVideoRenderer"])) return add(fromVideoRenderer(record["compactVideoRenderer"]));
    if (isNode(record["gridVideoRenderer"])) return add(fromVideoRenderer(record["gridVideoRenderer"]));
    if (isNode(record["lockupViewModel"])) return add(fromLockup(record["lockupViewModel"]));
    if (isNode(record["shortsLockupViewModel"])) return add(fromShortsLockup(record["shortsLockupViewModel"]));
    if (isNode(record["reelItemRenderer"])) return add(fromReelItem(record["reelItemRenderer"]));
    for (const value of Object.values(record)) walk(value, depth + 1);
  };
  walk(data, 0);
  return { videos, shorts };
}

async function page(url: string) {
  const response = await fetch(url, { headers: HEADERS, signal: AbortSignal.timeout(9000) });
  if (!response.ok) throw new Error(`YouTube answered ${response.status}`);
  return response.text();
}

// Search filters YouTube puts in the `sp` parameter.
const FILTERS: Record<string, string> = { video: "EgIQAQ%253D%253D", shorts: "EgIQCQ%253D%253D", live: "EgJAAQ%253D%253D" };

async function search(query: string, type = "all") {
  const key = `search:${type}:${query.toLowerCase()}`;
  const hit = recall<ReturnType<typeof collect>>(key, SEARCH_FRESH);
  if (hit) return hit;
  const filter = FILTERS[type] ? `&sp=${FILTERS[type]}` : "";
  const html = await page(`https://www.youtube.com/results?search_query=${encodeURIComponent(query)}${filter}&hl=en&gl=US`);
  const found = collect(pageJson(html, "var ytInitialData = "));
  if (found.videos.length + found.shorts.length > 0) remember(key, found);
  return found;
}

// The topics feeds are built from. Each 39-minute slot takes a different handful, so the feed turns over.
const HOME_TOPICS = [
  "new music this week", "gaming highlights", "minecraft", "football highlights", "funny videos", "science explained", "lofi hip hop",
  "cooking recipes", "tech review", "fortnite", "roblox", "nba highlights", "travel vlog", "animation short film", "movie trailers",
  "space documentary", "car review", "pop music video", "rap music video", "life hacks", "animals funny", "f1 highlights",
  "speedrun", "satisfying videos", "drawing tutorial", "news today", "skateboarding", "anime music", "piano cover", "history explained",
];
const SHORT_TOPICS = ["funny shorts", "satisfying shorts", "minecraft shorts", "football shorts", "cooking shorts", "animals shorts", "gaming shorts", "dance shorts", "life hack shorts", "art shorts", "science shorts", "music shorts"];
const LIVE_TOPICS = ["live music radio", "live news", "live gaming", "lofi live", "live space", "live sports", "live animals cam", "live minecraft"];

function pick(list: string[], slot: number, count: number) {
  const out: string[] = [];
  for (let index = 0; index < count; index++) out.push(list[(slot * count + index) % list.length]!);
  return out;
}

function interleave(lists: TubeVideo[][], limit: number) {
  const out: TubeVideo[] = [];
  const seen = new Set<string>();
  for (let row = 0; out.length < limit; row++) {
    let any = false;
    for (const list of lists) {
      const item = list[row];
      if (!item) continue;
      any = true;
      if (!seen.has(item.id)) {
        seen.add(item.id);
        out.push(item);
      }
    }
    if (!any) break;
  }
  return out.slice(0, limit);
}

async function feed(name: string, topic: string) {
  const slot = Math.floor(Date.now() / FEED_EVERY);
  const key = `feed:${name}:${topic.toLowerCase()}:${slot}`;
  const hit = recall<{ videos: TubeVideo[]; shorts: TubeVideo[]; updated: number; next: number }>(key, FEED_EVERY);
  if (hit) return hit;
  let queries: string[];
  let type = "all";
  if (topic) queries = name === "shorts" ? [`${topic} shorts`] : [topic, `${topic} ${["new", "best", "2026"][slot % 3]}`, `${topic} ${["highlights", "today", "top"][slot % 3]}`];
  else if (name === "shorts") queries = pick(SHORT_TOPICS, slot, 3);
  else if (name === "live") queries = pick(LIVE_TOPICS, slot, 3);
  else queries = pick(HOME_TOPICS, slot, 4);
  if (name === "shorts") type = "shorts";
  if (name === "live") type = "live";
  const results = await Promise.allSettled(queries.map((query) => search(query, type)));
  const found = results.flatMap((result) => (result.status === "fulfilled" ? [result.value] : []));
  if (found.length === 0) throw new Error("YouTube couldn't be reached.");
  let videos = interleave(found.map((result) => result.videos), 60);
  if (name === "live") videos = videos.filter((video) => video.live);
  const value = { videos, shorts: interleave(found.map((result) => result.shorts), 40), updated: slot * FEED_EVERY, next: (slot + 1) * FEED_EVERY };
  return remember(key, value);
}

let clientVersion = "2.20261030.02.00";

async function video(id: string): Promise<TubeDetails> {
  const key = `video:${id}`;
  const hit = recall<TubeDetails>(key, 30 * 60_000);
  if (hit) return hit;
  const html = await page(`https://www.youtube.com/watch?v=${id}&hl=en&gl=US`);
  clientVersion = html.match(/"INNERTUBE_CLIENT_VERSION":"([^"]+)"/)?.[1] ?? clientVersion;
  const player = pageJson(html, "var ytInitialPlayerResponse = ");
  const data = pageJson(html, "var ytInitialData = ");
  // When YouTube asks this server to prove it isn't a bot, the player data is missing but the page
  // data still has the title, channel, description, related videos and comments, so use that.
  const details = (get(player, "videoDetails") as Node | undefined) ?? {};
  const micro = get(player, "microformat", "playerMicroformatRenderer") as Node | undefined;
  const owner = findAll(data, "videoOwnerRenderer").find(isNode) as Node | undefined;
  const likes = str(findAll(data, "likeCountIfIndifferentNumber")[0]) || str(findAll(data, "likeCountIfLikedNumber")[0]);
  const primary = findAll(data, "videoPrimaryInfoRenderer").find(isNode) as Node | undefined;
  const secondary = findAll(data, "videoSecondaryInfoRenderer").find(isNode) as Node | undefined;
  const title = str(details["title"]) || text(get(primary, "title"));
  if (!title) throw new Error("That video isn't available.");
  const viewText = text(get(primary, "viewCount", "videoViewCountRenderer", "viewCount"));
  let comments = "";
  for (const section of findAll(data, "itemSectionRenderer")) {
    if (!JSON.stringify(get(section, "sectionIdentifier") ?? "").includes("comment")) continue;
    comments = str((findAll(section, "continuationCommand")[0] as Node | undefined)?.["token"]);
    if (comments) break;
  }
  const seconds = Number(details["lengthSeconds"] ?? 0);
  const live = !!details["isLive"] || (!!details["isLiveContent"] && seconds === 0) || /watching/i.test(viewText);
  const views = Number(details["viewCount"] ?? 0);
  const related = collect(get(data, "contents", "twoColumnWatchNextResults", "secondaryResults") ?? data, 40).videos.filter((item) => item.id !== id);
  const result: TubeDetails = {
    id,
    title,
    channel: str(details["author"]) || text(get(owner, "title")),
    channelId: str(details["channelId"]) || str(get(owner, "navigationEndpoint", "browseEndpoint", "browseId")),
    avatar: firstUrl(get(owner, "thumbnail", "thumbnails")),
    views: live || !views ? viewText : `${views.toLocaleString("en-US")} views`,
    length: seconds ? `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}` : "",
    published: text(get(primary, "relativeDateText")) || text(get(primary, "dateText")),
    live,
    short: false,
    description: str(details["shortDescription"]) || str(get(secondary, "attributedDescription", "content")),
    subscribers: text(get(owner, "subscriberCountText")),
    likes: likes ? Number(likes).toLocaleString("en-US") : "",
    date: str(micro?.["publishDate"]).slice(0, 10),
    category: str(micro?.["category"]),
    related,
    comments,
  };
  return remember(key, result);
}

async function comments(token: string) {
  const key = `comments:${token}`;
  const hit = recall<{ comments: TubeComment[]; next: string; count: string }>(key, 15 * 60_000);
  if (hit) return hit;
  const response = await fetch("https://www.youtube.com/youtubei/v1/next?prettyPrint=false", {
    method: "POST",
    headers: { ...HEADERS, "content-type": "application/json", origin: "https://www.youtube.com" },
    body: JSON.stringify({ context: { client: { clientName: "WEB", clientVersion, hl: "en", gl: "US" } }, continuation: token }),
    signal: AbortSignal.timeout(9000),
  });
  if (!response.ok) throw new Error(`YouTube answered ${response.status}`);
  const data = (await response.json()) as unknown;
  const list = (findAll(data, "commentEntityPayload") as Node[]).map((entity) => ({
    id: str(get(entity, "properties", "commentId")),
    author: str(get(entity, "author", "displayName")),
    avatar: str(get(entity, "author", "avatarThumbnailUrl")),
    text: str(get(entity, "properties", "content", "content")),
    published: str(get(entity, "properties", "publishedTime")),
    likes: str(get(entity, "toolbar", "likeCountNotliked")).trim(),
    replies: str(get(entity, "toolbar", "replyCount")),
    creator: !!get(entity, "author", "isCreator"),
  })).filter((comment) => comment.id && comment.text);
  const replyLevels = new Set((findAll(data, "commentEntityPayload") as Node[]).filter((entity) => Number(get(entity, "properties", "replyLevel") ?? 0) > 0).map((entity) => str(get(entity, "properties", "commentId"))));
  // The last continuation on the page loads the next batch of comments.
  const tokens = (findAll(data, "continuationItemRenderer") as Node[]).map((item) => str((findAll(item, "continuationCommand")[0] as Node | undefined)?.["token"])).filter(Boolean);
  const header = findAll(data, "commentsHeaderRenderer").find(isNode) as Node | undefined;
  const value = { comments: list.filter((comment) => !replyLevels.has(comment.id)), next: tokens[tokens.length - 1] ?? "", count: text(header?.["countText"]) };
  return remember(key, value);
}

async function channel(handle: string, tab: string): Promise<TubeChannel> {
  const key = `channel:${handle}:${tab}`;
  const hit = recall<TubeChannel>(key, FEED_EVERY);
  if (hit) return hit;
  const base = handle.startsWith("@") ? `https://www.youtube.com/${handle}` : `https://www.youtube.com/channel/${handle}`;
  const html = await page(`${base}/${tab}?hl=en&gl=US`);
  const data = pageJson(html, "var ytInitialData = ");
  const meta = get(data, "metadata", "channelMetadataRenderer") as Node | undefined;
  const header = findAll(get(data, "header"), "pageHeaderViewModel").find(isNode) as Node | undefined;
  const rows = (findAll(header, "contentMetadataViewModel")[0] as { metadataRows?: { metadataParts?: { text?: unknown }[] }[] } | undefined)?.metadataRows ?? [];
  const parts = rows.flatMap((row) => (row.metadataParts ?? []).map((part) => text(part.text)));
  const found = collect(get(data, "contents") ?? data, 60);
  const title = str(meta?.["title"]) || text(get(header, "title", "dynamicTextViewModel", "text"));
  const avatar = firstUrl(get(header, "image", "decoratedAvatarViewModel", "avatar", "avatarViewModel", "image", "sources")) || firstUrl(get(meta, "avatar", "thumbnails"));
  const id = str(meta?.["externalId"]) || handle;
  const own = (item: TubeVideo) => ({ ...item, channel: item.channel || title, channelId: item.channelId || id, avatar: item.avatar || avatar });
  const result: TubeChannel = {
    id,
    title,
    handle: parts.find((part) => part.startsWith("@")) ?? "",
    avatar,
    banner: firstUrl(get(findAll(header, "imageBannerViewModel")[0], "image", "sources")),
    subscribers: parts.find((part) => /subscriber/i.test(part)) ?? "",
    videoCount: parts.find((part) => /video/i.test(part)) ?? "",
    description: str(meta?.["description"]),
    videos: (tab === "shorts" ? found.shorts : found.videos).map(own),
  };
  if (!result.title) throw new Error("That channel couldn't be found.");
  return remember(key, result);
}

async function suggest(query: string) {
  const response = await fetch(`https://suggestqueries.google.com/complete/search?client=firefox&ds=yt&hl=en&q=${encodeURIComponent(query)}`, { headers: { "user-agent": UA }, signal: AbortSignal.timeout(5000) });
  if (!response.ok) return [];
  const data = (await response.json().catch(() => null)) as [string, string[]] | null;
  return Array.isArray(data?.[1]) ? data[1].slice(0, 10) : [];
}

async function image(url: string, fallback?: string) {
  let response = await fetch(url, { headers: { "user-agent": UA }, signal: AbortSignal.timeout(8000) }).catch(() => null);
  if ((!response?.ok || !response.body) && fallback) response = await fetch(fallback, { headers: { "user-agent": UA }, signal: AbortSignal.timeout(8000) }).catch(() => null);
  if (!response?.ok || !response.body) return new Response(null, { status: 404 });
  return new Response(response.body, { headers: { "content-type": response.headers.get("content-type") ?? "image/jpeg", "cache-control": "public, max-age=86400" } });
}

const failed = (error: unknown) => reply({ error: error instanceof Error ? error.message : "YouTube couldn't be reached." }, 502);

export const Route = createFileRoute("/api/youtube")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const params = new URL(request.url).searchParams;
        const thumb = params.get("thumb");
        if (thumb !== null) {
          if (!VIDEO_ID.test(thumb)) return reply({ error: "Not a video id" }, 400);
          const size = params.get("s");
          if (size === "short") return image(`https://i.ytimg.com/vi/${thumb}/oar2.jpg`, `https://i.ytimg.com/vi/${thumb}/hqdefault.jpg`);
          return image(`https://i.ytimg.com/vi/${thumb}/${size === "hq" ? "hqdefault" : "mqdefault"}.jpg`);
        }
        const img = params.get("img");
        if (img !== null) {
          try {
            const url = new URL(img);
            if (url.protocol !== "https:" || !IMAGE_HOSTS.has(url.hostname)) return reply({ error: "Not a YouTube image" }, 400);
            return image(url.href);
          } catch {
            return reply({ error: "Not a YouTube image" }, 400);
          }
        }
        try {
          const suggestion = params.get("suggest");
          if (suggestion !== null) return reply({ suggestions: suggestion.trim() ? await suggest(suggestion.trim().slice(0, 100)) : [] }, 200, 3600);
          const feedName = params.get("feed");
          if (feedName !== null) {
            if (!["home", "shorts", "live"].includes(feedName)) return reply({ error: "Unknown feed" }, 400);
            const result = await feed(feedName, (params.get("topic") ?? "").trim().slice(0, 80));
            return reply(result, 200, 300);
          }
          const videoId = params.get("video");
          if (videoId !== null) {
            if (!VIDEO_ID.test(videoId)) return reply({ error: "Not a video id" }, 400);
            return reply(await video(videoId), 200, 600);
          }
          const token = params.get("comments");
          if (token !== null) {
            if (!token || token.length > 2000) return reply({ error: "No comments here." }, 400);
            return reply(await comments(token), 200, 600);
          }
          const channelKey = params.get("channel");
          if (channelKey !== null) {
            if (!CHANNEL_ID.test(channelKey) && !HANDLE.test(channelKey)) return reply({ error: "Not a channel" }, 400);
            const tab = ["videos", "shorts", "streams"].includes(params.get("tab") ?? "") ? params.get("tab")! : "videos";
            return reply(await channel(channelKey, tab), 200, 600);
          }
          const query = (params.get("q") ?? "").trim().slice(0, 120);
          if (!query) return reply({ error: "Type something to search for." }, 400);
          const type = params.get("type") ?? "all";
          const found = await search(query, FILTERS[type] ? type : "all");
          if (found.videos.length + found.shorts.length === 0) return reply({ videos: [], shorts: [], error: "No videos found." });
          return reply(found, 200, 300);
        } catch (error) {
          return failed(error);
        }
      },
    },
  },
});
