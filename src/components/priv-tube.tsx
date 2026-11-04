import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import {
  ArrowLeft, Bell, Check, ChevronDown, ChevronUp, Clapperboard, Clock, Download, Flame, Gamepad2, History, House, Library, Lightbulb,
  ListVideo, Menu, MessageSquare, Music2, Newspaper, Play, Radio, RefreshCw, Search, Share2, ThumbsUp, Trash2, Trophy, X, Zap,
} from "lucide-react";
import type { TubeChannel, TubeComment, TubeDetails, TubeVideo } from "../routes/api.youtube";

// Priv-Tube: a YouTube client inside PRIVATE OS. No account: subscriptions, likes, history and saved
// videos stay on this device. Feeds come from the server (src/routes/api.youtube.ts) and turn over
// every 39 minutes. Videos play in YouTube's own privacy-enhanced embed.

export const FEED_EVERY = 39 * 60_000;
export type TubePlayerProps = { id: string; short?: boolean; onEnded?: () => void; onNext?: () => void };

type FeedData = { videos: TubeVideo[]; shorts: TubeVideo[]; updated: number; next: number };
type SearchData = { videos: TubeVideo[]; shorts: TubeVideo[] };
type CommentPage = { comments: TubeComment[]; next: string; count: string };
type ChannelRef = { id: string; title: string; avatar: string };
type View =
  | { name: "home"; topic?: string }
  | { name: "shorts"; start?: TubeVideo; list?: TubeVideo[] }
  | { name: "live" }
  | { name: "subs" }
  | { name: "library"; tab: LibraryTab }
  | { name: "search"; q: string; type: SearchType }
  | { name: "watch"; video: TubeVideo }
  | { name: "channel"; id: string; title?: string; tab: "videos" | "shorts" | "streams" };
type LibraryTab = "saved" | "history" | "later" | "liked";
type SearchType = "all" | "video" | "shorts" | "live";

const YT_ID = /^[A-Za-z0-9_-]{11}$/;

// Reads a YouTube link (watch, youtu.be, shorts, embed, live) or a bare video id.
export function youTubeId(input: string) {
  const value = input.trim();
  if (YT_ID.test(value)) return value;
  try {
    const url = new URL(/^https?:\/\//i.test(value) ? value : `https://${value}`);
    const host = url.hostname.replace(/^(www|m|music)\./, "");
    if (host === "youtu.be") return YT_ID.test(url.pathname.slice(1, 12)) ? url.pathname.slice(1, 12) : null;
    if (host !== "youtube.com" && host !== "youtube-nocookie.com") return null;
    const fromQuery = url.searchParams.get("v") ?? "";
    if (YT_ID.test(fromQuery)) return fromQuery;
    return url.pathname.match(/^\/(?:shorts|embed|live|v)\/([A-Za-z0-9_-]{11})/)?.[1] ?? null;
  } catch {
    return null;
  }
}

const blankVideo = (id: string, short = false): TubeVideo => ({ id, title: "", channel: "", channelId: "", avatar: "", views: "", length: "", published: "", live: false, short });

// ---------- What stays on this device ----------

type TubeStore = { subs: ChannelRef[]; history: TubeVideo[]; later: TubeVideo[]; liked: TubeVideo[]; searches: string[]; autoplay: boolean };
const STORE_KEY = "privtube-v1";
const EMPTY_STORE: TubeStore = { subs: [], history: [], later: [], liked: [], searches: [], autoplay: true };

function loadStore(): TubeStore {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (!raw) return EMPTY_STORE;
    const saved = JSON.parse(raw) as Partial<TubeStore>;
    return {
      subs: Array.isArray(saved.subs) ? saved.subs : [],
      history: Array.isArray(saved.history) ? saved.history : [],
      later: Array.isArray(saved.later) ? saved.later : [],
      liked: Array.isArray(saved.liked) ? saved.liked : [],
      searches: Array.isArray(saved.searches) ? saved.searches : [],
      autoplay: saved.autoplay !== false,
    };
  } catch {
    return EMPTY_STORE;
  }
}

const slim = (video: TubeVideo): TubeVideo => ({ id: video.id, title: video.title, channel: video.channel, channelId: video.channelId, avatar: video.avatar, views: video.views, length: video.length, published: video.published, live: video.live, short: video.short });
const toggleIn = (list: TubeVideo[], video: TubeVideo) => (list.some((item) => item.id === video.id) ? list.filter((item) => item.id !== video.id) : [slim(video), ...list].slice(0, 500));

// Saved videos live in IndexedDB together with their thumbnail, so the library opens with no connection.
type SavedItem = { id: string; video: TubeVideo; savedAt: number; thumb: Blob | null };
let dbPromise: Promise<IDBDatabase> | null = null;
function openDb() {
  dbPromise ??= new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open("privtube", 1);
    request.onupgradeneeded = () => request.result.createObjectStore("saved", { keyPath: "id" });
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error("Storage unavailable"));
  });
  dbPromise.catch(() => {
    dbPromise = null;
  });
  return dbPromise;
}
async function savedTx<T>(mode: IDBTransactionMode, run: (store: IDBObjectStore) => IDBRequest<T>) {
  const db = await openDb();
  return new Promise<T>((resolve, reject) => {
    const request = run(db.transaction("saved", mode).objectStore("saved"));
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error("Storage failed"));
  });
}

function useSavedLibrary() {
  const [items, setItems] = useState<SavedItem[]>([]);
  const [urls, setUrls] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState<Set<string>>(new Set());
  const refresh = useCallback(async () => {
    try {
      const all = await savedTx<SavedItem[]>("readonly", (store) => store.getAll() as IDBRequest<SavedItem[]>);
      setItems(all.sort((a, b) => b.savedAt - a.savedAt));
    } catch {
      setItems([]);
    }
  }, []);
  useEffect(() => {
    void refresh();
  }, [refresh]);
  useEffect(() => {
    const next: Record<string, string> = {};
    for (const item of items) if (item.thumb) next[item.id] = URL.createObjectURL(item.thumb);
    setUrls(next);
    return () => Object.values(next).forEach((url) => URL.revokeObjectURL(url));
  }, [items]);
  const add = async (video: TubeVideo) => {
    setBusy((set) => new Set(set).add(video.id));
    let thumb: Blob | null = null;
    try {
      const response = await fetch(`/api/youtube?thumb=${video.id}&s=${video.short ? "short" : "hq"}`);
      if (response.ok) thumb = await response.blob();
    } catch {
      // keep it without a picture
    }
    try {
      await savedTx("readwrite", (store) => store.put({ id: video.id, video: slim(video), savedAt: Date.now(), thumb } satisfies SavedItem));
      await refresh();
      return true;
    } catch {
      return false;
    } finally {
      setBusy((set) => {
        const copy = new Set(set);
        copy.delete(video.id);
        return copy;
      });
    }
  };
  const remove = async (id: string) => {
    try {
      await savedTx("readwrite", (store) => store.delete(id));
    } catch {
      // already gone
    }
    await refresh();
  };
  const ids = useMemo(() => new Set(items.map((item) => item.id)), [items]);
  const bytes = items.reduce((sum, item) => sum + (item.thumb?.size ?? 0) + 600, 0);
  return { items, urls, ids, busy, add, remove, bytes };
}

// ---------- Talking to the server ----------

const apiCache = new Map<string, { at: number; data: unknown }>();
async function getJson<T>(url: string, maxAge: number): Promise<T> {
  const hit = apiCache.get(url);
  if (hit && Date.now() - hit.at < maxAge) return hit.data as T;
  const response = await fetch(url);
  const data = (await response.json().catch(() => ({}))) as T & { error?: string };
  if (!response.ok) throw new Error(data.error || "Priv-Tube couldn't reach YouTube. Try again in a moment.");
  apiCache.set(url, { at: Date.now(), data });
  if (apiCache.size > 200) apiCache.delete(apiCache.keys().next().value!);
  return data;
}

function useApi<T>(url: string | null, maxAge = 5 * 60_000) {
  const [state, setState] = useState<{ url: string | null; data?: T; error?: string }>({ url: null });
  const [nonce, setNonce] = useState(0);
  useEffect(() => {
    if (!url) return;
    let live = true;
    if (nonce > 0) apiCache.delete(url);
    setState((old) => (old.url === url && old.data ? old : { url }));
    getJson<T>(url, maxAge)
      .then((data) => live && setState({ url, data }))
      .catch((error: unknown) => live && setState({ url, error: error instanceof Error ? error.message : "Something went wrong." }));
    return () => {
      live = false;
    };
  }, [url, nonce, maxAge]);
  const reload = useCallback(() => setNonce((value) => value + 1), []);
  const mine = state.url === url;
  return { data: mine ? state.data : undefined, error: mine ? state.error : undefined, reload };
}

// A feed refetches itself when its 39 minutes are up.
function useFeed(name: "home" | "shorts" | "live", topic = "") {
  const url = `/api/youtube?feed=${name}${topic ? `&topic=${encodeURIComponent(topic)}` : ""}`;
  const api = useApi<FeedData>(url, FEED_EVERY);
  const next = api.data?.next ?? 0;
  const { reload } = api;
  useEffect(() => {
    if (!next) return;
    const wait = Math.min(Math.max(5_000, next - Date.now() + 4_000), 2 ** 31 - 1);
    const timer = window.setTimeout(reload, wait);
    return () => window.clearTimeout(timer);
  }, [next, reload]);
  return api;
}

function useNow(every = 30_000) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), every);
    return () => window.clearInterval(timer);
  }, [every]);
  return now;
}

// "3 days ago" → seconds, so the subscriptions feed can put the newest first.
function ageSeconds(published: string) {
  const match = published.match(/(\d+)\s*(second|minute|hour|day|week|month|year)/i);
  if (!match) return /live|watching/i.test(published) ? 0 : 9e9;
  const unit = { second: 1, minute: 60, hour: 3600, day: 86400, week: 604800, month: 2592000, year: 31536000 }[match[2]!.toLowerCase() as "day"];
  return Number(match[1]) * unit;
}

// ---------- Shared context ----------

type TubeCtx = {
  store: TubeStore;
  update: (change: (store: TubeStore) => TubeStore) => void;
  go: (view: View, replace?: boolean) => void;
  saved: ReturnType<typeof useSavedLibrary>;
  toast: (text: string) => void;
  Player: (props: TubePlayerProps) => ReactNode;
};
const Ctx = createContext<TubeCtx | null>(null);
const useTube = () => useContext(Ctx)!;

// ---------- Small pieces ----------

function Thumb({ id, short = false, className = "" }: { id: string; short?: boolean; className?: string }) {
  return (
    <img
      src={`https://i.ytimg.com/vi/${id}/${short ? "oar2" : "hqdefault"}.jpg`}
      alt=""
      loading="lazy"
      decoding="async"
      draggable={false}
      onError={(event) => {
        const image = event.currentTarget;
        if (image.dataset["step"]) {
          image.style.visibility = "hidden";
          return;
        }
        image.dataset["step"] = "1";
        image.src = `/api/youtube?thumb=${id}&s=${short ? "short" : "hq"}`;
      }}
      className={`size-full bg-white/5 object-cover ${className}`}
    />
  );
}

function AvatarImage({ src, name, className = "size-9" }: { src: string; name: string; className?: string }) {
  const [step, setStep] = useState(0);
  if (!src || step > 1) {
    return <span className={`grid shrink-0 place-items-center rounded-full bg-gradient-to-br from-[#ff5f6d] to-[#7b3fe4] text-[13px] font-bold text-white ${className}`}>{(name.replace(/^@/, "")[0] ?? "?").toUpperCase()}</span>;
  }
  return <img src={step === 0 ? src : `/api/youtube?img=${encodeURIComponent(src)}`} alt="" referrerPolicy="no-referrer" onError={() => setStep((value) => value + 1)} className={`shrink-0 rounded-full bg-white/10 object-cover ${className}`} />;
}
const Avatar = (props: { src: string; name: string; className?: string }) => <AvatarImage key={props.src} {...props} />;

function Badge({ video }: { video: TubeVideo }) {
  if (video.live) return <span className="absolute bottom-1.5 right-1.5 flex items-center gap-1 rounded bg-[#cc0000] px-1.5 py-px text-[10px] font-bold uppercase tracking-wide"><Radio className="size-3" />Live</span>;
  if (!video.length) return null;
  return <span className="absolute bottom-1.5 right-1.5 rounded bg-black/80 px-1 py-px text-[11px] font-semibold">{video.length}</span>;
}

function Chip({ active, children, onClick }: { active: boolean; children: ReactNode; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className={`shrink-0 rounded-lg px-3 py-1.5 text-[13px] font-semibold transition-colors ${active ? "bg-white text-black" : "bg-white/10 text-white hover:bg-white/20"}`}>
      {children}
    </button>
  );
}

function Spinner() {
  return <div className="grid place-items-center py-20"><span className="size-8 animate-spin rounded-full border-2 border-white/15 border-t-white" /></div>;
}

function Problem({ text, onRetry }: { text: string; onRetry?: () => void }) {
  return (
    <div className="py-20 text-center">
      <p className="text-[14px] text-white/65">{text}</p>
      {onRetry && <button type="button" onClick={onRetry} className="mt-4 rounded-full bg-white/10 px-4 py-1.5 text-[13px] font-semibold hover:bg-white/20">Try again</button>}
    </div>
  );
}

const gridClass = "grid grid-cols-1 gap-x-4 gap-y-8 @lg:grid-cols-2 @3xl:grid-cols-3 @6xl:grid-cols-4 @[110rem]:grid-cols-5";

function SkeletonGrid() {
  return (
    <div className={gridClass}>
      {Array.from({ length: 12 }, (_, index) => (
        <div key={index} className="animate-pulse">
          <div className="aspect-video rounded-xl bg-white/10" />
          <div className="mt-3 flex gap-3">
            <div className="size-9 shrink-0 rounded-full bg-white/10" />
            <div className="flex-1"><div className="h-3.5 w-4/5 rounded bg-white/10" /><div className="mt-2 h-3 w-1/2 rounded bg-white/10" /></div>
          </div>
        </div>
      ))}
    </div>
  );
}

function VideoCard({ video, thumbUrl }: { video: TubeVideo; thumbUrl?: string }) {
  const { go, store, update, toast } = useTube();
  const later = store.later.some((item) => item.id === video.id);
  return (
    <div className="group min-w-0">
      <button type="button" onClick={() => go({ name: "watch", video })} className="relative block aspect-video w-full overflow-hidden rounded-xl outline-none">
        {thumbUrl ? <img src={thumbUrl} alt="" className="size-full object-cover" /> : <Thumb id={video.id} className="transition-transform duration-300 group-hover:scale-[1.03]" />}
        <Badge video={video} />
        <span
          role="button"
          tabIndex={0}
          aria-label={later ? "Remove from Watch later" : "Watch later"}
          onClick={(event) => {
            event.stopPropagation();
            update((s) => ({ ...s, later: toggleIn(s.later, video) }));
            toast(later ? "Removed from Watch later" : "Saved to Watch later");
          }}
          onKeyDown={() => undefined}
          className="absolute right-1.5 top-1.5 grid size-8 place-items-center rounded-md bg-black/75 opacity-0 transition-opacity group-hover:opacity-100"
        >
          {later ? <Check className="size-4" /> : <Clock className="size-4" />}
        </span>
      </button>
      <div className="mt-3 flex gap-3">
        <button type="button" disabled={!video.channelId} onClick={() => video.channelId && go({ name: "channel", id: video.channelId, title: video.channel, tab: "videos" })} className="shrink-0 self-start outline-none">
          <Avatar src={video.avatar} name={video.channel || video.title} />
        </button>
        <div className="min-w-0">
          <button type="button" onClick={() => go({ name: "watch", video })} className="line-clamp-2 text-left text-[14px] font-semibold leading-5 text-white outline-none">{video.title}</button>
          {video.channel && (
            <button type="button" disabled={!video.channelId} onClick={() => video.channelId && go({ name: "channel", id: video.channelId, title: video.channel, tab: "videos" })} className="mt-1 block max-w-full truncate text-left text-[12.5px] text-[#aaa] outline-none enabled:hover:text-white">{video.channel}</button>
          )}
          <p className="truncate text-[12.5px] text-[#aaa]">{[video.views, video.published].filter(Boolean).join(" • ")}</p>
        </div>
      </div>
    </div>
  );
}

function VideoRow({ video, compact = false, active = false }: { video: TubeVideo; compact?: boolean; active?: boolean }) {
  const { go } = useTube();
  return (
    <div className={`group flex min-w-0 gap-3 rounded-xl ${active ? "bg-white/10 p-1.5" : ""}`}>
      <button type="button" onClick={() => go({ name: "watch", video }, compact)} className={`relative block aspect-video shrink-0 overflow-hidden rounded-xl outline-none ${compact ? "w-40" : "w-[min(22rem,42%)]"}`}>
        <Thumb id={video.id} />
        <Badge video={video} />
      </button>
      <div className="min-w-0 flex-1 py-0.5">
        <button type="button" onClick={() => go({ name: "watch", video }, compact)} className={`line-clamp-2 text-left font-semibold text-white outline-none ${compact ? "text-[13px] leading-[18px]" : "text-[17px] leading-6"}`}>{video.title}</button>
        {compact ? (
          <>
            <p className="mt-1 truncate text-[12px] text-[#aaa]">{video.channel}</p>
            <p className="truncate text-[12px] text-[#aaa]">{[video.views, video.published].filter(Boolean).join(" • ")}</p>
          </>
        ) : (
          <>
            <p className="mt-1 text-[12px] text-[#aaa]">{[video.views, video.published].filter(Boolean).join(" • ")}</p>
            {video.channel && (
              <button type="button" disabled={!video.channelId} onClick={() => video.channelId && go({ name: "channel", id: video.channelId, title: video.channel, tab: "videos" })} className="mt-3 flex items-center gap-2 text-[12px] text-[#aaa] outline-none enabled:hover:text-white">
                <Avatar src={video.avatar} name={video.channel} className="size-6" />
                {video.channel}
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function ShortCard({ video, list, wide = false }: { video: TubeVideo; list: TubeVideo[]; wide?: boolean }) {
  const { go } = useTube();
  return (
    <button type="button" onClick={() => go({ name: "shorts", start: video, list })} className={`group shrink-0 text-left outline-none ${wide ? "w-full" : "w-[11.5rem]"}`}>
      <span className="relative block aspect-[9/16] overflow-hidden rounded-xl bg-white/5">
        <Thumb id={video.id} short className="transition-transform duration-300 group-hover:scale-[1.03]" />
      </span>
      <span className="mt-2 line-clamp-2 text-[14px] font-semibold leading-5 text-white">{video.title}</span>
      {video.views && <span className="mt-0.5 block text-[12px] text-[#aaa]">{video.views}</span>}
    </button>
  );
}

function ShortsShelf({ shorts }: { shorts: TubeVideo[] }) {
  if (shorts.length === 0) return null;
  return (
    <section className="col-span-full border-y border-white/10 py-5">
      <h3 className="mb-4 flex items-center gap-2 text-[19px] font-bold"><ShortsGlyph className="size-6" />Shorts</h3>
      <div className="flex gap-3 overflow-x-auto pb-1 [scrollbar-width:thin]">
        {shorts.slice(0, 14).map((video) => <ShortCard key={video.id} video={video} list={shorts} />)}
      </div>
    </section>
  );
}

function ShortsGlyph({ className = "size-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <path d="M17.6 2.9a4.3 4.3 0 0 0-5.8-1.6L6 4.6a4.3 4.3 0 0 0-.4 7.3l.8.5-.7.4a4.3 4.3 0 1 0 4.2 7.5l5.8-3.3a4.3 4.3 0 0 0 .4-7.3l-.8-.5.7-.4a4.3 4.3 0 0 0 1.6-5.9Z" fill="#ff4e6a" />
      <path d="m10 8.6 5 3.4-5 3.4Z" fill="#fff" />
    </svg>
  );
}

function SubscribeButton({ channel }: { channel: ChannelRef }) {
  const { store, update, toast } = useTube();
  const on = store.subs.some((item) => item.id === channel.id);
  if (!channel.id) return null;
  return (
    <button
      type="button"
      onClick={() => {
        update((s) => ({ ...s, subs: on ? s.subs.filter((item) => item.id !== channel.id) : [{ id: channel.id, title: channel.title, avatar: channel.avatar }, ...s.subs] }));
        toast(on ? `Unsubscribed from ${channel.title}` : `Subscribed to ${channel.title}`);
      }}
      className={`flex h-9 shrink-0 items-center gap-1.5 rounded-full px-4 text-[14px] font-semibold transition-colors ${on ? "bg-white/10 text-white hover:bg-white/20" : "bg-white text-black hover:bg-white/85"}`}
    >
      {on && <Bell className="size-4" />}
      {on ? "Subscribed" : "Subscribe"}
    </button>
  );
}

function FeedStatus({ data, onRefresh }: { data: FeedData | undefined; onRefresh: () => void }) {
  const now = useNow();
  if (!data) return null;
  const ago = Math.max(0, Math.round((now - data.updated) / 60_000));
  const left = Math.max(1, Math.round((data.next - now) / 60_000));
  return (
    <div className="mb-5 flex items-center gap-2 text-[12px] text-[#aaa]">
      <RefreshCw className="size-3.5" />
      <span>{ago < 1 ? "Updated just now" : `Updated ${ago} min ago`}. New videos in {left} min (the feed changes every 39 minutes).</span>
      <button type="button" onClick={onRefresh} className="ml-1 rounded-full px-2 py-0.5 font-semibold text-white/80 hover:bg-white/10">Reload</button>
    </div>
  );
}

// ---------- Pages ----------

const HOME_CHIPS = ["Music", "Gaming", "Minecraft", "Football", "Comedy", "News", "Science", "Cooking", "Lofi", "Fortnite", "Roblox", "Anime", "Cars", "Podcasts", "Animation"];

function HomeView({ topic = "" }: { topic?: string }) {
  const { go } = useTube();
  const [chip, setChip] = useState(topic);
  useEffect(() => setChip(topic), [topic]);
  const feed = useFeed("home", chip);
  const videos = feed.data?.videos ?? [];
  return (
    <div className="px-4 pb-10 @3xl:px-6">
      <div className="sticky top-0 z-10 -mx-4 mb-4 flex gap-3 overflow-x-auto bg-[#0f0f0f]/95 px-4 py-3 backdrop-blur @3xl:-mx-6 @3xl:px-6">
        <Chip active={!chip} onClick={() => setChip("")}>All</Chip>
        <Chip active={false} onClick={() => go({ name: "live" })}>Live</Chip>
        {HOME_CHIPS.map((name) => <Chip key={name} active={chip === name} onClick={() => setChip(name)}>{name}</Chip>)}
      </div>
      <FeedStatus data={feed.data} onRefresh={feed.reload} />
      {feed.error && !feed.data ? (
        <Problem text={feed.error} onRetry={feed.reload} />
      ) : !feed.data ? (
        <SkeletonGrid />
      ) : (
        <div className={gridClass}>
          {videos.slice(0, 8).map((video) => <VideoCard key={video.id} video={video} />)}
          <ShortsShelf shorts={feed.data.shorts} />
          {videos.slice(8).map((video) => <VideoCard key={video.id} video={video} />)}
        </div>
      )}
    </div>
  );
}

function LiveView() {
  const [chip, setChip] = useState("");
  const feed = useFeed("live", chip ? `${chip} live` : "");
  const chips = ["Music", "News", "Gaming", "Sports", "Space", "Animals", "Lofi", "Minecraft"];
  return (
    <div className="px-4 pb-10 @3xl:px-6">
      <div className="flex items-center gap-4 py-5">
        <span className="grid size-16 place-items-center rounded-full bg-[#cc0000]"><Radio className="size-8" /></span>
        <div>
          <h2 className="text-[28px] font-bold leading-tight">Live</h2>
          <p className="text-[13px] text-[#aaa]">Streams happening right now</p>
        </div>
      </div>
      <div className="mb-5 flex gap-3 overflow-x-auto">
        <Chip active={!chip} onClick={() => setChip("")}>All</Chip>
        {chips.map((name) => <Chip key={name} active={chip === name} onClick={() => setChip(name)}>{name}</Chip>)}
      </div>
      <FeedStatus data={feed.data} onRefresh={feed.reload} />
      {feed.error && !feed.data ? <Problem text={feed.error} onRetry={feed.reload} /> : !feed.data ? <SkeletonGrid /> : feed.data.videos.length === 0 ? <Problem text="No live streams found right now." onRetry={feed.reload} /> : (
        <div className={gridClass}>{feed.data.videos.map((video) => <VideoCard key={video.id} video={video} />)}</div>
      )}
    </div>
  );
}

function SearchView({ q, type }: { q: string; type: SearchType }) {
  const { go } = useTube();
  const result = useApi<SearchData>(`/api/youtube?q=${encodeURIComponent(q)}&type=${type}`);
  const types: [SearchType, string][] = [["all", "All"], ["video", "Videos"], ["shorts", "Shorts"], ["live", "Live"]];
  const videos = result.data?.videos ?? [];
  const shorts = result.data?.shorts ?? [];
  return (
    <div className="mx-auto max-w-[80rem] px-4 pb-10 @3xl:px-6">
      <div className="flex gap-3 overflow-x-auto py-3">
        {types.map(([value, label]) => <Chip key={value} active={type === value} onClick={() => go({ name: "search", q, type: value }, true)}>{label}</Chip>)}
      </div>
      {result.error && !result.data ? <Problem text={result.error} onRetry={result.reload} /> : !result.data ? <Spinner /> : videos.length + shorts.length === 0 ? <Problem text={`No results for "${q}".`} /> : type === "shorts" ? (
        <div className="grid grid-cols-2 gap-4 pt-2 @xl:grid-cols-3 @3xl:grid-cols-4 @5xl:grid-cols-6">{shorts.map((video) => <ShortCard key={video.id} video={video} list={shorts} wide />)}</div>
      ) : (
        <div className="flex flex-col gap-5 pt-2">
          {videos.slice(0, 3).map((video) => <VideoRow key={video.id} video={video} />)}
          {shorts.length > 0 && <div className="grid"><ShortsShelf shorts={shorts} /></div>}
          {videos.slice(3).map((video) => <VideoRow key={video.id} video={video} />)}
        </div>
      )}
    </div>
  );
}

function Comments({ token }: { token: string }) {
  const [pages, setPages] = useState<CommentPage[]>([]);
  const [state, setState] = useState<"idle" | "loading" | "error">("idle");
  const load = useCallback(async (next: string) => {
    setState("loading");
    try {
      const page = await getJson<CommentPage>(`/api/youtube?comments=${encodeURIComponent(next)}`, 15 * 60_000);
      setPages((list) => [...list, page]);
      setState("idle");
    } catch {
      setState("error");
    }
  }, []);
  useEffect(() => {
    setPages([]);
    if (token) void load(token);
  }, [token, load]);
  if (!token) return <p className="py-6 text-[13px] text-[#aaa]">Comments are turned off for this video.</p>;
  const all = pages.flatMap((page) => page.comments);
  const last = pages[pages.length - 1];
  return (
    <section className="mt-6">
      <h3 className="mb-5 text-[18px] font-bold">{pages[0]?.count ? (/comment/i.test(pages[0].count) ? pages[0].count : `${pages[0].count} Comments`) : "Comments"}</h3>
      <div className="flex flex-col gap-5">
        {all.map((comment) => (
          <div key={comment.id} className="flex gap-3">
            <Avatar src={comment.avatar} name={comment.author} className="size-10" />
            <div className="min-w-0">
              <p className="text-[12.5px]"><span className={`font-semibold ${comment.creator ? "rounded-full bg-white/15 px-1.5" : ""}`}>{comment.author}</span> <span className="text-[#aaa]">{comment.published}</span></p>
              <p className="mt-0.5 whitespace-pre-wrap break-words text-[14px] leading-5">{comment.text}</p>
              <p className="mt-1.5 flex items-center gap-4 text-[12px] text-[#aaa]">
                <span className="flex items-center gap-1.5"><ThumbsUp className="size-3.5" />{comment.likes || ""}</span>
                {comment.replies && comment.replies !== "0" && <span className="font-semibold text-[#3ea6ff]">{comment.replies} {comment.replies === "1" ? "reply" : "replies"}</span>}
              </p>
            </div>
          </div>
        ))}
      </div>
      {state === "loading" && <Spinner />}
      {state === "error" && <Problem text="Comments couldn't load." onRetry={() => void load(last?.next || token)} />}
      {state === "idle" && last?.next && (
        <button type="button" onClick={() => void load(last.next)} className="mt-6 rounded-full bg-white/10 px-4 py-2 text-[13px] font-semibold hover:bg-white/20">Show more comments</button>
      )}
    </section>
  );
}

function ActionPill({ onClick, children, active = false, label }: { onClick: () => void; children: ReactNode; active?: boolean; label: string }) {
  return (
    <button type="button" aria-label={label} onClick={onClick} className={`flex h-9 shrink-0 items-center gap-2 rounded-full px-4 text-[14px] font-semibold transition-colors ${active ? "bg-white text-black" : "bg-white/10 hover:bg-white/20"}`}>
      {children}
    </button>
  );
}

function shareLink(id: string, toast: (text: string) => void, short = false) {
  const link = short ? `https://youtube.com/shorts/${id}` : `https://youtu.be/${id}`;
  navigator.clipboard?.writeText(link).then(() => toast("Link copied"), () => toast(link));
}

function SaveButton({ video }: { video: TubeVideo }) {
  const { saved, toast } = useTube();
  const isSaved = saved.ids.has(video.id);
  const busy = saved.busy.has(video.id);
  return (
    <ActionPill
      label={isSaved ? "Remove from saved videos" : "Save this video on this device"}
      active={isSaved}
      onClick={() => {
        if (busy) return;
        if (isSaved) {
          void saved.remove(video.id).then(() => toast("Removed from Saved"));
          return;
        }
        void saved.add(video).then((ok) => toast(ok ? "Saved in your library on this device" : "This browser blocked saving"));
      }}
    >
      {busy ? <span className="size-4 animate-spin rounded-full border-2 border-white/30 border-t-white" /> : isSaved ? <Check className="size-4" /> : <Download className="size-4" />}
      {isSaved ? "Saved" : "Save"}
    </ActionPill>
  );
}

function WatchView({ video }: { video: TubeVideo }) {
  const { go, store, update, toast, Player } = useTube();
  const details = useApi<TubeDetails>(`/api/youtube?video=${video.id}`, 30 * 60_000);
  const full: TubeVideo & Partial<TubeDetails> = { ...video, ...Object.fromEntries(Object.entries(details.data ?? {}).filter(([, value]) => value !== "" && value != null)) };
  const [more, setMore] = useState(false);
  const related = details.data?.related ?? [];
  const next = related[0];
  const liked = store.liked.some((item) => item.id === video.id);
  const later = store.later.some((item) => item.id === video.id);
  useEffect(() => setMore(false), [video.id]);
  // Remember it in History once its details are in, so the entry has a title.
  useEffect(() => {
    const known = details.data ?? (video.title ? video : null);
    if (!known) return;
    const entry = slim({ ...video, ...known, short: video.short });
    update((s) => ({ ...s, history: [entry, ...s.history.filter((item) => item.id !== entry.id)].slice(0, 300) }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [video.id, !!details.data]);
  const onEnded = () => {
    if (store.autoplay && next) go({ name: "watch", video: next }, true);
  };
  return (
    <div className="mx-auto flex max-w-[110rem] flex-col gap-6 p-4 @5xl:flex-row @5xl:px-6">
      <div className="min-w-0 flex-1">
        <Player key={video.id} id={video.id} onEnded={onEnded} {...(next ? { onNext: () => go({ name: "watch", video: next }, true) } : {})} />
        <h1 className="mt-3 text-[20px] font-bold leading-7">{full.title || (details.error ? "Video" : "Loading…")}</h1>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <button type="button" disabled={!full.channelId} onClick={() => full.channelId && go({ name: "channel", id: full.channelId, title: full.channel, tab: "videos" })} className="flex min-w-0 items-center gap-3 text-left outline-none">
            <Avatar src={full.avatar} name={full.channel || "?"} className="size-10" />
            <span className="min-w-0">
              <span className="block truncate text-[16px] font-semibold">{full.channel}</span>
              {full.subscribers && <span className="block text-[12px] text-[#aaa]">{full.subscribers}</span>}
            </span>
          </button>
          <SubscribeButton channel={{ id: full.channelId, title: full.channel, avatar: full.avatar }} />
          <div className="ml-auto flex flex-wrap gap-2">
            <ActionPill label="Like" active={liked} onClick={() => { update((s) => ({ ...s, liked: toggleIn(s.liked, full) })); toast(liked ? "Removed from Liked videos" : "Added to Liked videos"); }}>
              <ThumbsUp className="size-4" />{full.likes || "Like"}
            </ActionPill>
            <ActionPill label="Share" onClick={() => shareLink(video.id, toast)}><Share2 className="size-4" />Share</ActionPill>
            <SaveButton video={full} />
            <ActionPill label="Watch later" active={later} onClick={() => { update((s) => ({ ...s, later: toggleIn(s.later, full) })); toast(later ? "Removed from Watch later" : "Saved to Watch later"); }}>
              <Clock className="size-4" />Later
            </ActionPill>
          </div>
        </div>
        <button type="button" onClick={() => setMore((value) => !value)} className="mt-4 w-full rounded-xl bg-white/10 p-3 text-left text-[14px] transition-colors hover:bg-white/[.14]">
          <p className="font-semibold">{[full.views, full.published || full.date, full.category].filter(Boolean).join("  ")}</p>
          {full.description ? (
            <p className={`mt-1 whitespace-pre-wrap break-words leading-5 ${more ? "" : "line-clamp-3"}`}>{full.description}</p>
          ) : (
            !details.data && !details.error && <p className="mt-1 text-[#aaa]">Loading description…</p>
          )}
          {full.description && <p className="mt-1 font-semibold">{more ? "Show less" : "...more"}</p>}
        </button>
        {details.error && <p className="mt-3 text-[13px] text-[#aaa]">{details.error}</p>}
        <p className="mt-2 text-[12px] text-[#aaa]">
          Video not starting? Some videos only play on YouTube itself:{" "}
          <button type="button" onClick={() => window.open(`https://www.youtube.com/watch?v=${video.id}`, "_blank", "noopener,noreferrer")} className="font-semibold text-[#3ea6ff] hover:underline">watch it on YouTube</button>.
        </p>
        {details.data && <Comments token={details.data.comments} />}
      </div>
      <aside className="flex w-full shrink-0 flex-col gap-2 @5xl:w-[25rem]">
        <div className="mb-1 flex items-center justify-between">
          <p className="text-[16px] font-bold">Up next</p>
          <label className="flex cursor-pointer items-center gap-2 text-[12px] text-[#aaa]">
            Autoplay
            <button type="button" role="switch" aria-checked={store.autoplay} onClick={() => update((s) => ({ ...s, autoplay: !s.autoplay }))} className={`relative h-5 w-9 rounded-full transition-colors ${store.autoplay ? "bg-[#ff4e6a]" : "bg-white/25"}`}>
              <span className={`absolute top-0.5 size-4 rounded-full bg-white transition-all ${store.autoplay ? "left-[1.15rem]" : "left-0.5"}`} />
            </button>
          </label>
        </div>
        {!details.data && !details.error ? <Spinner /> : related.map((item) => <VideoRow key={item.id} video={item} compact />)}
      </aside>
    </div>
  );
}

function ShortsView({ start, list }: { start?: TubeVideo; list?: TubeVideo[] }) {
  const { Player, saved, toast, store, update } = useTube();
  const feed = useFeed("shorts");
  const items = useMemo(() => {
    const seen = new Set<string>();
    return [...(start ? [start] : []), ...(list ?? []), ...(feed.data?.shorts ?? [])].filter((item) => !seen.has(item.id) && !!seen.add(item.id));
  }, [start, list, feed.data]);
  const [active, setActive] = useState(0);
  const [comments, setComments] = useState(false);
  const scroller = useRef<HTMLDivElement>(null);
  const current = items[active];
  const details = useApi<TubeDetails>(current ? `/api/youtube?video=${current.id}` : null, 30 * 60_000);
  useEffect(() => {
    const root = scroller.current;
    if (!root) return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) if (entry.isIntersecting) setActive(Number((entry.target as HTMLElement).dataset["index"]));
      },
      { root, threshold: 0.6 },
    );
    root.querySelectorAll("[data-index]").forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, [items.length]);
  const jump = (index: number) => {
    const target = scroller.current?.querySelector(`[data-index="${index}"]`);
    target?.scrollIntoView({ behavior: "smooth", block: "start" });
  };
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.target as HTMLElement | null)?.closest("input, textarea")) return;
      if (event.key === "ArrowDown") jump(Math.min(items.length - 1, active + 1));
      if (event.key === "ArrowUp") jump(Math.max(0, active - 1));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });
  if (items.length === 0) return feed.error ? <Problem text={feed.error} onRetry={feed.reload} /> : <Spinner />;
  const info = details.data;
  const liked = current ? store.liked.some((item) => item.id === current.id) : false;
  const side = (icon: ReactNode, label: string, onClick: () => void, on = false) => (
    <button type="button" onClick={onClick} className="flex flex-col items-center gap-1 text-[12px] font-semibold outline-none">
      <span className={`grid size-12 place-items-center rounded-full transition-colors ${on ? "bg-white text-black" : "bg-white/10 hover:bg-white/20"}`}>{icon}</span>
      {label}
    </button>
  );
  return (
    <div className="flex h-full min-h-0">
      <div ref={scroller} className="h-full min-w-0 flex-1 snap-y snap-mandatory overflow-y-auto [scrollbar-width:none]">
        {items.map((item, index) => (
          <section key={item.id} data-index={index} className="flex h-full snap-start items-center justify-center gap-4 py-4">
            <div className="relative aspect-[9/16] h-full max-h-full max-w-[calc(100%-5rem)] overflow-hidden rounded-2xl bg-black">
              {index === active ? (
                <Player id={item.id} short {...(index + 1 < items.length ? { onNext: () => jump(index + 1) } : {})} />
              ) : (
                <button type="button" onClick={() => jump(index)} className="absolute inset-0">
                  <Thumb id={item.id} short />
                  <span className="absolute inset-0 grid place-items-center bg-black/20"><Play className="size-12 fill-white" /></span>
                </button>
              )}
              {index === active && (
                <div className="pointer-events-none absolute inset-x-0 bottom-12 bg-gradient-to-t from-black/70 to-transparent px-4 pb-3 pt-10">
                  {info?.channel && <p className="flex items-center gap-2 text-[14px] font-semibold"><Avatar src={info.avatar} name={info.channel} className="size-8" />{info.channel}</p>}
                  <p className="mt-2 line-clamp-2 text-[14px]">{info?.title || item.title}</p>
                </div>
              )}
            </div>
            {index === active && current && (
              <div className="flex shrink-0 flex-col gap-4">
                {side(<ThumbsUp className="size-5" />, info?.likes ? compactNumber(info.likes) : "Like", () => { update((s) => ({ ...s, liked: toggleIn(s.liked, { ...current, ...(info ? { title: info.title, channel: info.channel, channelId: info.channelId, avatar: info.avatar } : {}) }) })); }, liked)}
                {side(<MessageSquare className="size-5" />, "Comments", () => setComments((value) => !value), comments)}
                {side(<Share2 className="size-5" />, "Share", () => shareLink(current.id, toast, true))}
                {side(saved.ids.has(current.id) ? <Check className="size-5" /> : <Download className="size-5" />, saved.ids.has(current.id) ? "Saved" : "Save", () => {
                  const video = { ...current, title: info?.title || current.title, channel: info?.channel || "", channelId: info?.channelId || "", avatar: info?.avatar || "" };
                  if (saved.ids.has(current.id)) void saved.remove(current.id).then(() => toast("Removed from Saved"));
                  else void saved.add(video).then((ok) => toast(ok ? "Saved in your library on this device" : "This browser blocked saving"));
                }, saved.ids.has(current.id))}
              </div>
            )}
          </section>
        ))}
      </div>
      <div className="hidden shrink-0 flex-col justify-center gap-3 px-3 @2xl:flex">
        <button type="button" aria-label="Previous short" disabled={active === 0} onClick={() => jump(active - 1)} className="grid size-12 place-items-center rounded-full bg-white/10 hover:bg-white/20 disabled:opacity-30"><ChevronUp className="size-6" /></button>
        <button type="button" aria-label="Next short" disabled={active >= items.length - 1} onClick={() => jump(active + 1)} className="grid size-12 place-items-center rounded-full bg-white/10 hover:bg-white/20 disabled:opacity-30"><ChevronDown className="size-6" /></button>
      </div>
      {comments && (
        <aside className="hidden w-[24rem] shrink-0 flex-col border-l border-white/10 @4xl:flex">
          <div className="flex items-center justify-between px-4 py-3">
            <p className="text-[16px] font-bold">Comments</p>
            <button type="button" aria-label="Close comments" onClick={() => setComments(false)} className="grid size-8 place-items-center rounded-full hover:bg-white/10"><X className="size-4" /></button>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-6">{info ? <Comments token={info.comments} /> : <Spinner />}</div>
        </aside>
      )}
    </div>
  );
}

function compactNumber(value: string) {
  const number = Number(value.replace(/[^\d]/g, ""));
  if (!number) return value;
  return new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 }).format(number);
}

function ChannelView({ id, title, tab }: { id: string; title?: string; tab: "videos" | "shorts" | "streams" }) {
  const { go } = useTube();
  const channel = useApi<TubeChannel>(`/api/youtube?channel=${encodeURIComponent(id)}&tab=${tab}`, FEED_EVERY);
  const data = channel.data;
  const tabs: ["videos" | "shorts" | "streams", string][] = [["videos", "Videos"], ["shorts", "Shorts"], ["streams", "Live"]];
  return (
    <div className="mx-auto max-w-[96rem] px-4 pb-10 @3xl:px-6">
      {data?.banner && <img src={data.banner} alt="" referrerPolicy="no-referrer" onError={(event) => (event.currentTarget.style.display = "none")} className="mt-3 aspect-[6/1] w-full rounded-2xl object-cover" />}
      <div className="flex flex-wrap items-center gap-5 py-5">
        <Avatar src={data?.avatar ?? ""} name={data?.title || title || "?"} className="size-24 text-[34px] @3xl:size-36" />
        <div className="min-w-0 flex-1">
          <h2 className="truncate text-[30px] font-bold leading-tight @3xl:text-[36px]">{data?.title || title}</h2>
          <p className="mt-1 text-[13px] text-[#aaa]">{[data?.handle, data?.subscribers, data?.videoCount].filter(Boolean).join(" • ")}</p>
          {data?.description && <p className="mt-2 line-clamp-2 max-w-3xl text-[13px] text-[#aaa]">{data.description}</p>}
          <div className="mt-3"><SubscribeButton channel={{ id: data?.id || id, title: data?.title || title || "", avatar: data?.avatar ?? "" }} /></div>
        </div>
      </div>
      <div className="mb-6 flex gap-6 border-b border-white/10">
        {tabs.map(([value, label]) => (
          <button key={value} type="button" onClick={() => go({ name: "channel", id, ...(title ? { title } : {}), tab: value }, true)} className={`-mb-px border-b-2 pb-2.5 text-[15px] font-semibold ${tab === value ? "border-white text-white" : "border-transparent text-[#aaa] hover:text-white"}`}>{label}</button>
        ))}
      </div>
      {channel.error && !data ? <Problem text={channel.error} onRetry={channel.reload} /> : !data ? <SkeletonGrid /> : data.videos.length === 0 ? <Problem text="Nothing here yet." /> : tab === "shorts" ? (
        <div className="grid grid-cols-2 gap-4 @xl:grid-cols-3 @3xl:grid-cols-4 @5xl:grid-cols-6">{data.videos.map((video) => <ShortCard key={video.id} video={{ ...video, short: true }} list={data.videos.map((item) => ({ ...item, short: true }))} wide />)}</div>
      ) : (
        <div className={gridClass}>{data.videos.map((video) => <VideoCard key={video.id} video={video} />)}</div>
      )}
    </div>
  );
}

function SubsView() {
  const { store, go } = useTube();
  const [videos, setVideos] = useState<TubeVideo[] | null>(null);
  const [round, setRound] = useState(0);
  const ids = store.subs.slice(0, 20).map((item) => item.id).join(",");
  useEffect(() => {
    if (!ids) return;
    let live = true;
    setVideos(null);
    void Promise.allSettled(ids.split(",").map((id) => getJson<TubeChannel>(`/api/youtube?channel=${encodeURIComponent(id)}&tab=videos`, FEED_EVERY))).then((results) => {
      if (!live) return;
      const all = results.flatMap((result) => (result.status === "fulfilled" ? result.value.videos.slice(0, 12) : []));
      setVideos(all.sort((a, b) => ageSeconds(a.published) - ageSeconds(b.published)));
    });
    return () => {
      live = false;
    };
  }, [ids, round]);
  // Like the other feeds, subscriptions refresh every 39 minutes.
  useEffect(() => {
    const timer = window.setInterval(() => setRound((value) => value + 1), FEED_EVERY);
    return () => window.clearInterval(timer);
  }, []);
  if (store.subs.length === 0) {
    return (
      <div className="grid place-items-center px-6 py-24 text-center">
        <Bell className="size-16 text-white/30" />
        <h2 className="mt-5 text-[22px] font-bold">No subscriptions yet</h2>
        <p className="mt-2 max-w-md text-[14px] text-[#aaa]">Press Subscribe on any channel and its newest videos show up here. Subscriptions stay on this device, no account needed.</p>
        <button type="button" onClick={() => go({ name: "home" })} className="mt-5 rounded-full bg-white px-5 py-2 text-[14px] font-semibold text-black">Find channels</button>
      </div>
    );
  }
  return (
    <div className="px-4 pb-10 @3xl:px-6">
      <div className="flex gap-5 overflow-x-auto py-5">
        {store.subs.map((channel) => (
          <button key={channel.id} type="button" onClick={() => go({ name: "channel", id: channel.id, title: channel.title, tab: "videos" })} className="flex w-20 shrink-0 flex-col items-center gap-2 outline-none">
            <Avatar src={channel.avatar} name={channel.title} className="size-16" />
            <span className="w-full truncate text-center text-[12px] text-[#aaa]">{channel.title}</span>
          </button>
        ))}
      </div>
      <h2 className="mb-5 text-[19px] font-bold">Latest</h2>
      {videos === null ? <SkeletonGrid /> : videos.length === 0 ? <Problem text="Couldn't load your channels right now." onRetry={() => setRound((value) => value + 1)} /> : (
        <div className={gridClass}>{videos.map((video) => <VideoCard key={video.id} video={video} />)}</div>
      )}
    </div>
  );
}

function LibraryView({ tab }: { tab: LibraryTab }) {
  const { store, update, saved, go } = useTube();
  const tabs: [LibraryTab, string, ReactNode][] = [
    ["saved", "Saved", <Download key="s" className="size-4" />],
    ["history", "History", <History key="h" className="size-4" />],
    ["later", "Watch later", <Clock key="l" className="size-4" />],
    ["liked", "Liked videos", <ThumbsUp key="k" className="size-4" />],
  ];
  const list = tab === "saved" ? saved.items.map((item) => item.video) : store[tab];
  const note = {
    saved: `${saved.items.length} saved on this device • ${saved.bytes < 1024 * 1024 ? `${Math.max(1, Math.round(saved.bytes / 1024))} KB` : `${(saved.bytes / 1024 / 1024).toFixed(1)} MB`}. They stay after you reload; playing them needs internet.`,
    history: "Videos you watched, newest first. Only on this device.",
    later: "Videos you put aside for later.",
    liked: "Videos you liked. Only on this device.",
  }[tab];
  return (
    <div className="px-4 pb-10 @3xl:px-6">
      <div className="flex flex-wrap gap-3 py-4">
        {tabs.map(([value, label, icon]) => (
          <button key={value} type="button" onClick={() => go({ name: "library", tab: value }, true)} className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-[13px] font-semibold ${tab === value ? "bg-white text-black" : "bg-white/10 hover:bg-white/20"}`}>{icon}{label}</button>
        ))}
      </div>
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <p className="text-[13px] text-[#aaa]">{note}</p>
        {tab !== "saved" && list.length > 0 && (
          <button type="button" onClick={() => update((s) => ({ ...s, [tab]: [] }))} className="flex items-center gap-1.5 rounded-full px-3 py-1 text-[12px] font-semibold text-white/80 hover:bg-white/10"><Trash2 className="size-3.5" />Clear all</button>
        )}
      </div>
      {list.length === 0 ? (
        <Problem text={tab === "saved" ? "Press Save under a video to keep it here." : "Nothing here yet."} />
      ) : (
        <div className={gridClass}>
          {list.map((video) => (
            <div key={video.id} className="relative">
              <VideoCard video={video} {...(tab === "saved" && saved.urls[video.id] ? { thumbUrl: saved.urls[video.id]! } : {})} />
              {tab === "saved" && (
                <button type="button" aria-label="Remove from saved" onClick={() => void saved.remove(video.id)} className="absolute left-1.5 top-1.5 grid size-8 place-items-center rounded-md bg-black/75 hover:bg-black"><Trash2 className="size-4" /></button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ---------- Search box ----------

function SearchBox({ initial }: { initial: string }) {
  const { go, store, update } = useTube();
  const [value, setValue] = useState(initial);
  const [open, setOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [pick, setPick] = useState(-1);
  const input = useRef<HTMLInputElement>(null);
  useEffect(() => setValue(initial), [initial]);
  useEffect(() => {
    const term = value.trim();
    if (!open || !term || youTubeId(term)) {
      setSuggestions([]);
      return;
    }
    const timer = window.setTimeout(() => {
      getJson<{ suggestions: string[] }>(`/api/youtube?suggest=${encodeURIComponent(term)}`, 3_600_000).then((data) => setSuggestions(data.suggestions ?? []), () => setSuggestions([]));
    }, 180);
    return () => window.clearTimeout(timer);
  }, [value, open]);
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "/" && !(event.target as HTMLElement | null)?.closest("input, textarea")) {
        event.preventDefault();
        input.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);
  const options = value.trim() ? suggestions : store.searches.slice(0, 8);
  const run = (text: string) => {
    const term = text.trim();
    if (!term) return;
    setOpen(false);
    input.current?.blur();
    const id = youTubeId(term);
    if (id) {
      go({ name: "watch", video: blankVideo(id, /\/shorts\//.test(term)) });
      return;
    }
    setValue(term);
    update((s) => ({ ...s, searches: [term, ...s.searches.filter((item) => item.toLowerCase() !== term.toLowerCase())].slice(0, 20) }));
    go({ name: "search", q: term, type: "all" });
  };
  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        run(pick >= 0 && options[pick] ? options[pick]! : value);
      }}
      className="relative mx-auto flex w-full max-w-[40rem] min-w-0 items-center"
    >
      <label className="flex h-10 min-w-0 flex-1 items-center rounded-l-full border border-white/15 bg-[#121212] pl-4 focus-within:border-[#3ea6ff]">
        <Search className="mr-3 hidden size-4 shrink-0 text-white/50 @3xl:block" />
        <input
          ref={input}
          value={value}
          onChange={(event) => {
            setValue(event.target.value);
            setPick(-1);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => window.setTimeout(() => setOpen(false), 150)}
          onKeyDown={(event) => {
            if (event.key === "ArrowDown") { event.preventDefault(); setPick((index) => Math.min(options.length - 1, index + 1)); }
            if (event.key === "ArrowUp") { event.preventDefault(); setPick((index) => Math.max(-1, index - 1)); }
            if (event.key === "Escape") setOpen(false);
          }}
          placeholder="Search or paste a YouTube link"
          aria-label="Search Priv-Tube"
          className="h-full min-w-0 flex-1 bg-transparent text-[15px] outline-none placeholder:text-white/40"
        />
        {value && <button type="button" aria-label="Clear search" onClick={() => { setValue(""); input.current?.focus(); }} className="mr-1 grid size-8 place-items-center rounded-full hover:bg-white/10"><X className="size-4" /></button>}
      </label>
      <button type="submit" aria-label="Search" className="grid h-10 w-16 shrink-0 place-items-center rounded-r-full border border-l-0 border-white/15 bg-white/[.08] hover:bg-white/15"><Search className="size-5" /></button>
      {open && options.length > 0 && (
        <ul className="absolute left-0 right-16 top-11 z-30 overflow-hidden rounded-xl border border-white/10 bg-[#212121] py-2 shadow-2xl">
          {options.map((option, index) => (
            <li key={option}>
              <button type="button" onMouseDown={(event) => event.preventDefault()} onClick={() => run(option)} className={`flex w-full items-center gap-3 px-4 py-1.5 text-left text-[15px] font-semibold ${index === pick ? "bg-white/10" : "hover:bg-white/10"}`}>
                {value.trim() ? <Search className="size-4 shrink-0 text-white/60" /> : <History className="size-4 shrink-0 text-white/60" />}
                <span className="truncate">{option}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </form>
  );
}

// ---------- The app ----------

const EXPLORE: [string, ReactNode][] = [
  ["Music", <Music2 key="m" className="size-5" />],
  ["Gaming", <Gamepad2 key="g" className="size-5" />],
  ["News", <Newspaper key="n" className="size-5" />],
  ["Football", <Trophy key="t" className="size-5" />],
  ["Science", <Lightbulb key="l" className="size-5" />],
  ["Animation", <Clapperboard key="a" className="size-5" />],
];

export function PrivTube({ Player }: { Player: (props: TubePlayerProps) => ReactNode }) {
  const [stack, setStack] = useState<View[]>([{ name: "home" }]);
  const [store, setStore] = useState<TubeStore>(loadStore);
  const [menu, setMenu] = useState(true);
  const [note, setNote] = useState("");
  const saved = useSavedLibrary();
  const main = useRef<HTMLDivElement>(null);
  const view = stack[stack.length - 1]!;
  const noteTimer = useRef(0);

  useEffect(() => {
    try {
      localStorage.setItem(STORE_KEY, JSON.stringify(store));
    } catch {
      // storage full or blocked
    }
  }, [store]);
  useEffect(() => {
    main.current?.scrollTo({ top: 0 });
  }, [view]);

  const go = useCallback((next: View, replace = false) => setStack((list) => (replace ? [...list.slice(0, -1), next] : [...list.slice(-40), next])), []);
  const toast = useCallback((text: string) => {
    setNote(text);
    window.clearTimeout(noteTimer.current);
    noteTimer.current = window.setTimeout(() => setNote(""), 2600);
  }, []);
  const ctx: TubeCtx = { store, update: setStore, go, saved, toast, Player };

  const focusMode = view.name === "watch" || view.name === "shorts";
  const wide = menu && !focusMode;
  const navItem = (icon: ReactNode, label: string, target: View, on: boolean) => (
    <button
      key={label}
      type="button"
      onClick={() => go(target)}
      className={wide ? `flex h-10 w-full items-center gap-5 rounded-lg px-3 text-[14px] ${on ? "bg-white/10 font-semibold" : "hover:bg-white/10"}` : `flex w-full flex-col items-center gap-1.5 rounded-lg py-3.5 text-[10px] ${on ? "bg-white/10" : "hover:bg-white/10"}`}
    >
      {icon}
      <span className={wide ? "truncate" : ""}>{label}</span>
    </button>
  );

  let page: ReactNode;
  switch (view.name) {
    case "home": page = <HomeView key={`home-${view.topic ?? ""}`} {...(view.topic ? { topic: view.topic } : {})} />; break;
    case "shorts": page = <ShortsView key={`shorts-${view.start?.id ?? ""}`} {...(view.start ? { start: view.start } : {})} {...(view.list ? { list: view.list } : {})} />; break;
    case "live": page = <LiveView />; break;
    case "subs": page = <SubsView />; break;
    case "library": page = <LibraryView tab={view.tab} />; break;
    case "search": page = <SearchView key={`${view.q}-${view.type}`} q={view.q} type={view.type} />; break;
    case "watch": page = <WatchView key={view.video.id} video={view.video} />; break;
    case "channel": page = <ChannelView key={`${view.id}-${view.tab}`} id={view.id} {...(view.title ? { title: view.title } : {})} tab={view.tab} />; break;
  }

  return (
    <Ctx.Provider value={ctx}>
      <div className="@container relative flex min-h-0 flex-1 flex-col bg-[#0f0f0f] font-sans text-white">
        <header className="flex h-14 shrink-0 items-center gap-2 px-3 @3xl:gap-4 @3xl:px-4">
          <div className="flex shrink-0 items-center gap-1">
            <button type="button" aria-label="Menu" onClick={() => setMenu((value) => !value)} className="grid size-10 place-items-center rounded-full hover:bg-white/10"><Menu className="size-5" /></button>
            {stack.length > 1 && <button type="button" aria-label="Back" onClick={() => setStack((list) => list.slice(0, -1))} className="grid size-10 place-items-center rounded-full hover:bg-white/10"><ArrowLeft className="size-5" /></button>}
            <button type="button" onClick={() => go({ name: "home" })} className="ml-1 flex items-center gap-1.5 outline-none" aria-label="Priv-Tube home">
              <img src="/icons/brands/privtube.svg" alt="" className="size-7" draggable={false} />
              <span className="hidden text-[19px] font-bold tracking-[-0.04em] @lg:inline">Priv<span className="text-[#ff4e6a]">-</span>Tube</span>
            </button>
          </div>
          <SearchBox initial={view.name === "search" ? view.q : ""} />
          <div className="flex shrink-0 items-center gap-2">
            <span className="hidden rounded-full bg-white/10 px-3 py-1 text-[11px] font-semibold text-white/65 @5xl:inline">No account needed</span>
            <button type="button" aria-label="Your library" onClick={() => go({ name: "library", tab: "saved" })} className="grid size-8 place-items-center rounded-full bg-gradient-to-br from-[#ff5f6d] to-[#7b3fe4] text-[13px] font-bold">P</button>
          </div>
        </header>
        <div className="flex min-h-0 flex-1">
          <nav className={`hidden shrink-0 flex-col overflow-y-auto px-1.5 pb-4 [scrollbar-width:thin] @2xl:flex ${wide ? "w-60 px-3" : "w-[4.5rem]"} ${view.name === "shorts" && !menu ? "@2xl:hidden" : ""}`}>
            {navItem(<House className="size-5" />, "Home", { name: "home" }, view.name === "home" && !view.topic)}
            {navItem(<ShortsGlyph />, "Shorts", { name: "shorts" }, view.name === "shorts")}
            {navItem(<Radio className="size-5" />, "Live", { name: "live" }, view.name === "live")}
            {navItem(<ListVideo className="size-5" />, "Subscriptions", { name: "subs" }, view.name === "subs")}
            {!wide && navItem(<Library className="size-5" />, "You", { name: "library", tab: "saved" }, view.name === "library")}
            {wide && (
              <>
                <hr className="my-3 border-white/10" />
                <p className="px-3 pb-1 text-[16px] font-bold">You</p>
                {navItem(<Download className="size-5" />, "Saved", { name: "library", tab: "saved" }, view.name === "library" && view.tab === "saved")}
                {navItem(<History className="size-5" />, "History", { name: "library", tab: "history" }, view.name === "library" && view.tab === "history")}
                {navItem(<Clock className="size-5" />, "Watch later", { name: "library", tab: "later" }, view.name === "library" && view.tab === "later")}
                {navItem(<ThumbsUp className="size-5" />, "Liked videos", { name: "library", tab: "liked" }, view.name === "library" && view.tab === "liked")}
                {store.subs.length > 0 && (
                  <>
                    <hr className="my-3 border-white/10" />
                    <p className="px-3 pb-1 text-[16px] font-bold">Subscriptions</p>
                    {store.subs.slice(0, 12).map((channel) => (
                      <button key={channel.id} type="button" onClick={() => go({ name: "channel", id: channel.id, title: channel.title, tab: "videos" })} className="flex h-10 w-full items-center gap-4 rounded-lg px-3 text-[14px] hover:bg-white/10">
                        <Avatar src={channel.avatar} name={channel.title} className="size-6" />
                        <span className="truncate">{channel.title}</span>
                      </button>
                    ))}
                  </>
                )}
                <hr className="my-3 border-white/10" />
                <p className="px-3 pb-1 text-[16px] font-bold">Explore</p>
                {navItem(<Flame className="size-5" />, "Trending", { name: "home", topic: "Trending" }, view.name === "home" && view.topic === "Trending")}
                {EXPLORE.map(([label, icon]) => navItem(icon, label, { name: "home", topic: label }, view.name === "home" && view.topic === label))}
                <hr className="my-3 border-white/10" />
                <p className="px-3 text-[11px] leading-4 text-white/40">Priv-Tube by PRIVATE OS. Feeds refresh every 39 minutes. No account: your subscriptions, likes and saved videos stay on this device.</p>
              </>
            )}
          </nav>
          <main ref={main} className={`min-h-0 min-w-0 flex-1 ${view.name === "shorts" ? "overflow-hidden" : "overflow-y-auto"}`}>
            {page}
          </main>
        </div>
        {note && (
          <div className="pointer-events-none absolute bottom-5 left-5 z-40 flex items-center gap-2 rounded-lg bg-[#f1f1f1] px-4 py-3 text-[14px] font-medium text-[#0f0f0f] shadow-2xl">
            <Zap className="size-4" />{note}
          </div>
        )}
      </div>
    </Ctx.Provider>
  );
}
