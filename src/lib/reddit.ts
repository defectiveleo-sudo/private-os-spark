// Reddit reader shared by the browser (client) and /api/reddit (server).
// Reddit blocks proxy and data-centre addresses, so pages are rebuilt from Reddit's own
// JSON (fetched from the visitor's own connection) or, failing that, from its RSS feeds.

export type RedditPost = {
  id: string;
  sub: string;
  author: string;
  title: string;
  created: number;
  score: number | null;
  comments: number | null;
  permalink: string;
  url: string;
  domain: string;
  html: string;
  image?: string | undefined;
  gallery?: string[] | undefined;
  video?: string | undefined;
  thumb?: string | undefined;
  flair?: string | undefined;
  nsfw: boolean;
  spoiler: boolean;
  isSelf: boolean;
  stickied: boolean;
};

export type RedditComment = { id: string; author: string; html: string; score: number | null; created: number; op: boolean; replies: RedditComment[] };

export type RedditSource = "direct" | "server" | "feed";

export type RedditPage =
  | { kind: "feed"; title: string; about: string; posts: RedditPost[]; after: string | null; source: RedditSource }
  | { kind: "post"; post: RedditPost; comments: RedditComment[]; source: RedditSource };

export type RedditRoute =
  | { type: "feed"; sub: string | null; sort: string; t: string }
  | { type: "user"; name: string; sort: string }
  | { type: "search"; q: string; sub: string | null; sort: string }
  | { type: "post"; id: string; sub: string | null; path: string };

export const REDDIT_SORTS = ["hot", "new", "top", "rising"] as const;

export function isRedditUrl(url: string) {
  try {
    const { hostname } = new URL(url);
    const host = hostname.toLowerCase();
    if (host === "redd.it") return true;
    if (host !== "reddit.com" && !host.endsWith(".reddit.com")) return false;
    // Media and static hosts load as normal pages.
    return !/^(i|v|preview|external-preview|styles|static)\./.test(host);
  } catch {
    return false;
  }
}

const SAFE = /^[A-Za-z0-9_-]{1,64}$/;

export function parseRedditUrl(url: string): RedditRoute {
  let parsed: URL;
  try {
    parsed = new URL(url, "https://www.reddit.com");
  } catch {
    return { type: "feed", sub: null, sort: "hot", t: "day" };
  }
  const parts = parsed.pathname.split("/").filter(Boolean);
  const query = parsed.searchParams;
  const sortOf = (value: string | undefined) => (value && ["hot", "new", "top", "rising", "controversial", "best"].includes(value) ? value : "hot");
  if (parsed.hostname === "redd.it" && parts[0] && SAFE.test(parts[0])) return { type: "post", id: parts[0], sub: null, path: `/comments/${parts[0]}` };
  if (parts[0] === "comments" && parts[1] && SAFE.test(parts[1])) return { type: "post", id: parts[1], sub: null, path: `/comments/${parts[1]}` };
  if ((parts[0] === "r") && parts[1] && SAFE.test(parts[1].replace(/\+/g, "_"))) {
    const sub = parts[1];
    if (parts[2] === "comments" && parts[3] && SAFE.test(parts[3])) return { type: "post", id: parts[3], sub, path: `/r/${sub}/comments/${parts[3]}` };
    if (parts[2] === "search") return { type: "search", q: (query.get("q") ?? "").slice(0, 200), sub, sort: query.get("sort") ?? "relevance" };
    return { type: "feed", sub, sort: sortOf(parts[2]), t: query.get("t") ?? "day" };
  }
  if ((parts[0] === "user" || parts[0] === "u") && parts[1] && SAFE.test(parts[1])) return { type: "user", name: parts[1], sort: query.get("sort") ?? "new" };
  if (parts[0] === "search") return { type: "search", q: (query.get("q") ?? "").slice(0, 200), sub: null, sort: query.get("sort") ?? "relevance" };
  return { type: "feed", sub: null, sort: sortOf(parts[0]), t: query.get("t") ?? "day" };
}

// The canonical reddit.com address for a route (shown in the address bar).
export function redditHref(route: RedditRoute) {
  const base = "https://www.reddit.com";
  switch (route.type) {
    case "post": return `${base}${route.path}/`;
    case "user": return `${base}/user/${route.name}/`;
    case "search": return `${base}${route.sub ? `/r/${route.sub}` : ""}/search/?q=${encodeURIComponent(route.q)}`;
    default: return `${base}${route.sub ? `/r/${route.sub}` : ""}/${route.sort === "hot" ? "" : `${route.sort}/`}${route.sort === "top" ? `?t=${route.t}` : ""}`;
  }
}

export function jsonUrl(route: RedditRoute, after?: string | null) {
  const base = "https://www.reddit.com";
  const more = after ? `&after=${encodeURIComponent(after)}` : "";
  switch (route.type) {
    case "post": return `${base}/comments/${route.id}.json?raw_json=1&limit=150`;
    case "user": return `${base}/user/${route.name}/submitted.json?raw_json=1&limit=25&sort=${route.sort}${more}`;
    case "search": return `${base}${route.sub ? `/r/${route.sub}` : ""}/search.json?raw_json=1&limit=25&q=${encodeURIComponent(route.q)}&sort=${encodeURIComponent(route.sort)}${route.sub ? "&restrict_sr=1" : ""}${more}`;
    default: return `${base}${route.sub ? `/r/${route.sub}` : ""}/${route.sort}.json?raw_json=1&limit=25${route.sort === "top" ? `&t=${route.t}` : ""}${more}`;
  }
}

export function rssUrl(route: RedditRoute) {
  const base = "https://www.reddit.com";
  switch (route.type) {
    case "post": return `${base}${route.path}/.rss`;
    case "user": return `${base}/user/${route.name}/submitted/.rss`;
    case "search": return `${base}${route.sub ? `/r/${route.sub}` : ""}/search.rss?q=${encodeURIComponent(route.q)}${route.sub ? "&restrict_sr=1" : ""}`;
    default: return `${base}${route.sub ? `/r/${route.sub}` : ""}/${route.sort === "hot" ? "" : `${route.sort}/`}.rss${route.sort === "top" ? `?t=${route.t}` : ""}`;
  }
}

export function routeTitle(route: RedditRoute) {
  switch (route.type) {
    case "post": return route.sub ? `r/${route.sub}` : "Reddit";
    case "user": return `u/${route.name}`;
    case "search": return `Search: ${route.q}`;
    default: return route.sub ? `r/${route.sub}` : "Popular";
  }
}

// ---- JSON ----
// Reddit's replies are deeply nested and loosely shaped, so they are read defensively with these helpers.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Json = any;
const obj = (value: unknown): Json => (value && typeof value === "object" ? value : {});
const str = (value: unknown) => (typeof value === "string" ? value : "");
const num = (value: unknown) => (typeof value === "number" && Number.isFinite(value) ? value : null);
const IMAGE = /\.(jpe?g|png|gif|webp)(\?|$)/i;

function previewOf(data: Json) {
  const image = obj((obj(data.preview).images as unknown[] | undefined)?.[0]);
  const sizes = (image.resolutions as Json[] | undefined) ?? [];
  const fit = [...sizes].reverse().find((size) => (num(size.width) ?? 0) <= 1080) ?? obj(image.source);
  return str(fit.url) || str(obj(image.source).url);
}

export function postFromJson(raw: unknown): RedditPost {
  const data = obj(raw);
  const cross = obj((data.crosspost_parent_list as unknown[] | undefined)?.[0]);
  const media = Object.keys(cross).length ? cross : data;
  const url = str(data.url_overridden_by_dest) || str(data.url);
  const metadata = obj(media.media_metadata);
  const gallery = media.is_gallery
    ? ((obj(media.gallery_data).items as Json[] | undefined) ?? [])
        .map((item) => {
          const entry = obj(metadata[str(item.media_id)]);
          const sizes = (entry.p as Json[] | undefined) ?? [];
          const fit = [...sizes].reverse().find((size) => (num(size.x) ?? 0) <= 1080);
          return str(obj(fit).u) || str(obj(entry.s).u) || str(obj(entry.s).gif);
        })
        .filter(Boolean)
    : undefined;
  const video = str(obj(obj(media.secure_media).reddit_video).fallback_url) || str(obj(obj(media.media).reddit_video).fallback_url) || str(obj(obj(media.preview).reddit_video_preview).fallback_url) || undefined;
  const hint = str(media.post_hint);
  const preview = previewOf(media);
  const image = !video && !gallery?.length && (hint === "image" || IMAGE.test(url)) ? (IMAGE.test(url) && /redd\.it|imgur/.test(url) ? url : preview || url) : undefined;
  const thumb = str(data.thumbnail);
  return {
    id: str(data.id),
    sub: str(data.subreddit),
    author: str(data.author),
    title: str(data.title),
    created: (num(data.created_utc) ?? 0) * 1000,
    score: num(data.score),
    comments: num(data.num_comments),
    permalink: `https://www.reddit.com${str(data.permalink)}`,
    url,
    domain: str(data.domain),
    html: str(data.selftext_html),
    image,
    gallery: gallery?.length ? gallery : undefined,
    video,
    thumb: /^https?:/.test(thumb) ? thumb : preview || undefined,
    flair: str(data.link_flair_text) || undefined,
    nsfw: Boolean(data.over_18),
    spoiler: Boolean(data.spoiler),
    isSelf: Boolean(data.is_self),
    stickied: Boolean(data.stickied),
  };
}

function commentsFromJson(children: unknown, op: string, depth = 0): RedditComment[] {
  if (!Array.isArray(children) || depth > 12) return [];
  return children.flatMap((child): RedditComment[] => {
    const item = obj(child);
    if (item.kind !== "t1") return [];
    const data = obj(item.data);
    const author = str(data.author);
    return [{
      id: str(data.id),
      author,
      html: str(data.body_html),
      score: num(data.score),
      created: (num(data.created_utc) ?? 0) * 1000,
      op: Boolean(op) && author === op,
      replies: commentsFromJson(obj(obj(data.replies).data).children, op, depth + 1),
    }];
  });
}

export function pageFromJson(route: RedditRoute, json: unknown, source: RedditSource): RedditPage {
  if (route.type === "post") {
    const [postListing, commentListing] = Array.isArray(json) ? json : [];
    const first = obj((obj(obj(postListing).data).children as unknown[] | undefined)?.[0]);
    if (first.kind !== "t3") throw new Error("Post not found");
    const post = postFromJson(first.data);
    return { kind: "post", post, comments: commentsFromJson(obj(obj(commentListing).data).children, post.author), source };
  }
  const listing = obj(obj(json).data);
  const children = (listing.children as unknown[] | undefined) ?? [];
  if (!Array.isArray(children)) throw new Error("Unexpected reply");
  const posts = children.flatMap((child) => (obj(child).kind === "t3" ? [postFromJson(obj(child).data)] : []));
  return { kind: "feed", title: routeTitle(route), about: "", posts, after: str(listing.after) || null, source };
}

// ---- RSS (Atom) ----
export function decodeEntities(text: string) {
  return text.replace(/&(#x[0-9a-f]+|#\d+|amp|lt|gt|quot|apos|nbsp);/gi, (match, code: string) => {
    const lower = code.toLowerCase();
    if (lower === "amp") return "&";
    if (lower === "lt") return "<";
    if (lower === "gt") return ">";
    if (lower === "quot") return '"';
    if (lower === "apos") return "'";
    if (lower === "nbsp") return " ";
    const value = lower.startsWith("#x") ? parseInt(lower.slice(2), 16) : parseInt(lower.slice(1), 10);
    return Number.isFinite(value) && value > 0 && value < 0x110000 ? String.fromCodePoint(value) : match;
  });
}

const tag = (entry: string, name: string) => new RegExp(`<${name}[^>]*>([\\s\\S]*?)</${name}>`).exec(entry)?.[1] ?? "";
const attr = (entry: string, pattern: RegExp) => decodeEntities(pattern.exec(entry)?.[1] ?? "");

function postFromEntry(entry: string): RedditPost {
  const html = decodeEntities(tag(entry, "content"));
  const permalink = attr(entry, /<link href="([^"]+)"/);
  const link = decodeEntities(/<a href="([^"]+)">\[link\]<\/a>/.exec(html)?.[1] ?? permalink);
  const thumb = attr(entry, /<media:thumbnail url="([^"]+)"/) || decodeEntities(/<img src="([^"]+)"/.exec(html)?.[1] ?? "");
  const body = /<div class="md">([\s\S]*?)<\/div>\s*<!-- SC_ON -->/.exec(html)?.[1];
  const isSelf = link === permalink || (/\/comments\//.test(link) && link.includes("reddit.com"));
  let domain = "";
  try {
    domain = new URL(link).hostname.replace(/^www\./, "");
  } catch {
    // keep blank
  }
  const isImage = IMAGE.test(link) || /^i\.redd\.it$/.test(domain);
  return {
    id: decodeEntities(tag(entry, "id")).replace(/^t3_/, ""),
    sub: attr(entry, /<category term="([^"]+)"/),
    author: decodeEntities(tag(tag(entry, "author"), "name")).replace(/^\/u\//, ""),
    title: decodeEntities(tag(entry, "title")),
    created: Date.parse(tag(entry, "published") || tag(entry, "updated")) || 0,
    score: null,
    comments: null,
    permalink,
    url: link,
    domain: isSelf ? `self.${attr(entry, /<category term="([^"]+)"/)}` : domain,
    html: body ? `<div class="md">${body}</div>` : "",
    image: isImage ? link : /\/gallery\//.test(link) && thumb ? thumb : undefined,
    gallery: undefined,
    video: undefined,
    thumb: thumb || undefined,
    flair: undefined,
    nsfw: false,
    spoiler: false,
    isSelf,
    stickied: false,
  };
}

export function pageFromRss(route: RedditRoute, xml: string): RedditPage {
  const entries = [...xml.matchAll(/<entry>([\s\S]*?)<\/entry>/g)].map((match) => match[1]!);
  const feedTitle = decodeEntities(tag(xml.split("<entry>")[0] ?? "", "title"));
  const about = decodeEntities(tag(xml.split("<entry>")[0] ?? "", "subtitle"));
  if (route.type === "post") {
    const postEntry = entries.find((entry) => tag(entry, "id").startsWith("t3_"));
    if (!postEntry) throw new Error("Post not found");
    const post = postFromEntry(postEntry);
    const comments = entries
      .filter((entry) => tag(entry, "id").startsWith("t1_"))
      .map((entry): RedditComment => {
        const author = decodeEntities(tag(tag(entry, "author"), "name")).replace(/^\/u\//, "");
        return {
          id: tag(entry, "id").replace(/^t1_/, ""),
          author,
          html: decodeEntities(tag(entry, "content")).replace(/<!-- SC_(?:OFF|ON) -->/g, ""),
          score: null,
          created: Date.parse(tag(entry, "updated")) || 0,
          op: author === post.author,
          replies: [],
        };
      });
    return { kind: "post", post, comments, source: "feed" };
  }
  const posts = entries.filter((entry) => tag(entry, "id").startsWith("t3_")).map(postFromEntry);
  return { kind: "feed", title: route.type === "feed" && !route.sub ? "Popular" : feedTitle || routeTitle(route), about, posts, after: null, source: "feed" };
}
