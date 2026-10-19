import { useEffect, useMemo, useRef, useState, type FormEvent, type MouseEvent as ReactMouseEvent, type ReactNode } from "react";
import { ArrowBigUp, ChevronLeft, ChevronRight, ExternalLink, Flame, Loader2, MessageSquare, Minus, Plus, RefreshCw, Search, Sparkles, TrendingUp, Trophy, X } from "lucide-react";
import { isRedditUrl, jsonUrl, pageFromJson, parseRedditUrl, redditHref, routeTitle, type RedditComment, type RedditPage, type RedditPost, type RedditRoute } from "@/lib/reddit";

// Reddit inside the browser. Reddit refuses proxy servers, so instead of loading its site through one,
// the page is rebuilt here from Reddit's own data: first straight from this computer's connection
// (which Reddit accepts), then through PRIVATE OS's server, which falls back to Reddit's RSS feeds.

let directFailures = 0;

async function fetchPage(url: string, after?: string | null): Promise<RedditPage> {
  const route = parseRedditUrl(url);
  if (directFailures < 2) {
    try {
      const response = await fetch(jsonUrl(route, after), { credentials: "omit", referrerPolicy: "no-referrer", signal: AbortSignal.timeout(7000) });
      if (response.ok) {
        directFailures = 0;
        return pageFromJson(route, await response.json(), "direct");
      }
    } catch {
      directFailures += 1;
    }
  }
  const target = new URL(url);
  if (after) target.searchParams.set("after", after);
  const response = await fetch(`/api/reddit?url=${encodeURIComponent(target.href)}`);
  const data = (await response.json().catch(() => ({ error: "Reddit couldn't be reached." }))) as RedditPage | { error: string };
  if (!response.ok || "error" in data) throw new Error("error" in data ? data.error : "Reddit couldn't be reached.");
  return data;
}

const SUBS = ["popular", "all", "pics", "AskReddit", "gaming", "funny", "worldnews", "technology", "movies", "aww", "memes", "science"];

function ago(time: number) {
  if (!time) return "";
  const s = Math.max(1, Math.round((Date.now() - time) / 1000));
  if (s < 60) return `${s}s`;
  if (s < 3600) return `${Math.floor(s / 60)}m`;
  if (s < 86400) return `${Math.floor(s / 3600)}h`;
  if (s < 2592000) return `${Math.floor(s / 86400)}d`;
  if (s < 31536000) return `${Math.floor(s / 2592000)}mo`;
  return `${Math.floor(s / 31536000)}y`;
}

const compact = (value: number | null) => (value === null ? "" : value >= 1000 ? `${(value / 1000).toFixed(value >= 10000 ? 0 : 1)}k` : String(value));

function hue(text: string) {
  let h = 0;
  for (const ch of text) h = (h * 31 + ch.charCodeAt(0)) % 360;
  return h;
}

function SubAvatar({ name, size = 24 }: { name: string; size?: number }) {
  return (
    <span aria-hidden className="grid shrink-0 place-items-center rounded-full font-bold text-white" style={{ width: size, height: size, fontSize: size * 0.45, background: `linear-gradient(140deg, hsl(${hue(name)} 70% 55%), hsl(${(hue(name) + 40) % 360} 70% 40%))` }}>
      {name.replace(/^(r|u)\//, "").charAt(0).toUpperCase() || "r"}
    </span>
  );
}

function RedditMark({ className = "size-8" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
      <circle cx="16" cy="16" r="16" fill="#ff4500" />
      <ellipse cx="16" cy="19" rx="8.5" ry="6" fill="#fff" />
      <circle cx="12.6" cy="18.2" r="1.4" fill="#ff4500" />
      <circle cx="19.4" cy="18.2" r="1.4" fill="#ff4500" />
      <path d="M12.8 21.6q3.2 2 6.4 0" stroke="#ff4500" strokeWidth="1.1" fill="none" strokeLinecap="round" />
      <circle cx="22.5" cy="9.5" r="1.7" fill="#fff" />
      <path d="M16 13l1.4-5.2 5.1 1.7" stroke="#fff" strokeWidth="1.1" fill="none" />
      <circle cx="9" cy="15.5" r="2" fill="#fff" />
      <circle cx="23" cy="15.5" r="2" fill="#fff" />
    </svg>
  );
}

// Reddit's own HTML, cleaned: only formatting tags and safe links survive. Plain image links become pictures.
const ALLOWED = new Set(["P", "A", "EM", "STRONG", "B", "I", "DEL", "S", "CODE", "PRE", "BLOCKQUOTE", "UL", "OL", "LI", "H1", "H2", "H3", "H4", "H5", "H6", "HR", "BR", "TABLE", "THEAD", "TBODY", "TR", "TH", "TD", "SUP", "SUB", "SPAN", "DIV"]);
function cleanHtml(html: string) {
  if (typeof DOMParser === "undefined" || !html) return "";
  const doc = new DOMParser().parseFromString(`<div>${html}</div>`, "text/html");
  const walk = (node: Element) => {
    for (const child of [...node.children]) {
      if (!ALLOWED.has(child.tagName)) {
        if (["SCRIPT", "STYLE", "IFRAME", "OBJECT", "EMBED", "FORM", "IMG", "SVG", "VIDEO", "AUDIO"].includes(child.tagName)) child.remove();
        else child.replaceWith(...child.childNodes);
        continue;
      }
      for (const name of [...child.getAttributeNames()]) if (!(child.tagName === "A" && name === "href")) child.removeAttribute(name);
      if (child.tagName === "A") {
        const href = child.getAttribute("href") ?? "";
        let full = "";
        try {
          full = new URL(href, "https://www.reddit.com").href;
        } catch {
          // leave blank
        }
        if (!/^https?:/i.test(full)) child.removeAttribute("href");
        else {
          child.setAttribute("href", full);
          if (/^https:\/\/(preview|i)\.redd\.it\//.test(full) && child.textContent?.trim().startsWith("http")) {
            const img = doc.createElement("img");
            img.setAttribute("src", full);
            img.setAttribute("alt", "");
            img.setAttribute("loading", "lazy");
            img.setAttribute("referrerpolicy", "no-referrer");
            img.className = "rd-inline-img";
            child.textContent = "";
            child.appendChild(img);
          }
        }
      }
      walk(child);
    }
  };
  walk(doc.body.firstElementChild!);
  return doc.body.firstElementChild!.innerHTML;
}

function RichText({ html, className = "" }: { html: string; className?: string }) {
  const clean = useMemo(() => cleanHtml(html), [html]);
  if (!clean) return null;
  return <div className={`rd-md ${className}`} dangerouslySetInnerHTML={{ __html: clean }} />;
}

function Media({ post, full, zoom }: { post: RedditPost; full: boolean; zoom: (src: string) => void }) {
  const [shown, setShown] = useState(!post.nsfw && !post.spoiler);
  const [slide, setSlide] = useState(0);
  const cover = !shown && (
    <button type="button" onClick={(event) => { event.stopPropagation(); setShown(true); }} className="absolute inset-0 z-10 grid place-items-center bg-black/40 text-xs font-semibold backdrop-blur-2xl">
      <span className="rounded-full bg-black/60 px-3 py-1.5">{post.nsfw ? "NSFW" : "Spoiler"} · click to show</span>
    </button>
  );
  const box = `relative overflow-hidden rounded-2xl bg-black/40 ${full ? "max-h-[78vh]" : "max-h-[30rem]"}`;
  if (post.video) {
    return (
      <div className={box} onClick={(event) => event.stopPropagation()}>
        {cover}
        <video src={post.video} poster={post.thumb} controls playsInline loop preload="metadata" className={`mx-auto block w-full object-contain ${full ? "max-h-[78vh]" : "max-h-[30rem]"}`} />
      </div>
    );
  }
  if (post.gallery?.length) {
    const list = post.gallery;
    return (
      <div className={box}>
        {cover}
        <img src={list[slide]} alt="" referrerPolicy="no-referrer" loading="lazy" onClick={(event) => { event.stopPropagation(); zoom(list[slide]!); }} className={`mx-auto block w-full cursor-zoom-in object-contain ${full ? "max-h-[78vh]" : "max-h-[30rem]"}`} />
        <span className="absolute right-3 top-3 rounded-full bg-black/60 px-2 py-0.5 text-[11px] font-semibold">{slide + 1} / {list.length}</span>
        {slide > 0 && <button type="button" aria-label="Previous picture" onClick={(event) => { event.stopPropagation(); setSlide(slide - 1); }} className="absolute left-2 top-1/2 grid size-8 -translate-y-1/2 place-items-center rounded-full bg-black/60 hover:bg-black/80"><ChevronLeft className="size-4" /></button>}
        {slide < list.length - 1 && <button type="button" aria-label="Next picture" onClick={(event) => { event.stopPropagation(); setSlide(slide + 1); }} className="absolute right-2 top-1/2 grid size-8 -translate-y-1/2 place-items-center rounded-full bg-black/60 hover:bg-black/80"><ChevronRight className="size-4" /></button>}
      </div>
    );
  }
  if (post.image) {
    return (
      <div className={box}>
        {cover}
        <img src={post.image} alt="" referrerPolicy="no-referrer" loading="lazy" onClick={(event) => { event.stopPropagation(); zoom(post.image!); }} className={`mx-auto block w-full cursor-zoom-in object-contain ${full ? "max-h-[78vh]" : "max-h-[30rem]"}`} />
      </div>
    );
  }
  return null;
}

function LinkCard({ post, go }: { post: RedditPost; go: (url: string) => void }) {
  if (post.isSelf || post.image || post.video || post.gallery || !post.url || isRedditUrl(post.url)) return null;
  return (
    <button type="button" onClick={(event) => { event.stopPropagation(); go(post.url); }} className="flex w-full items-center gap-3 overflow-hidden rounded-2xl border border-white/10 bg-white/[.04] p-2 text-left hover:bg-white/[.08]">
      {post.thumb ? <img src={post.thumb} alt="" referrerPolicy="no-referrer" loading="lazy" className="size-16 shrink-0 rounded-xl object-cover" /> : <span className="grid size-16 shrink-0 place-items-center rounded-xl bg-white/10"><ExternalLink className="size-5 opacity-70" /></span>}
      <span className="min-w-0">
        <span className="block truncate text-[13px] font-semibold text-[#8cb4ff]">{post.domain}</span>
        <span className="block truncate text-[11px] text-white/50">{post.url}</span>
      </span>
    </button>
  );
}

function PostMeta({ post, go }: { post: RedditPost; go: (url: string) => void }) {
  return (
    <div className="flex min-w-0 flex-wrap items-center gap-x-1.5 gap-y-1 text-[12px] text-white/55">
      <button type="button" onClick={(event) => { event.stopPropagation(); go(`https://www.reddit.com/r/${post.sub}/`); }} className="flex items-center gap-1.5 font-semibold text-white/90 hover:underline">
        <SubAvatar name={post.sub} size={20} />r/{post.sub}
      </button>
      <span>·</span>
      <span>{ago(post.created)}</span>
      {post.author && <><span>·</span><button type="button" onClick={(event) => { event.stopPropagation(); go(`https://www.reddit.com/user/${post.author}/`); }} className="hover:underline">u/{post.author}</button></>}
      {post.stickied && <span className="rounded bg-emerald-500/20 px-1.5 py-px text-[10px] font-bold text-emerald-300">PINNED</span>}
      {post.nsfw && <span className="rounded bg-rose-500/20 px-1.5 py-px text-[10px] font-bold text-rose-300">NSFW</span>}
    </div>
  );
}

function PostStats({ post, open }: { post: RedditPost; open?: () => void }) {
  return (
    <div className="flex items-center gap-2 text-[12px] font-semibold text-white/75">
      <span className="flex items-center gap-1 rounded-full bg-white/[.07] px-2.5 py-1.5"><ArrowBigUp className="size-4" />{post.score === null ? "Vote" : compact(post.score)}</span>
      <button type="button" onClick={open} className="flex items-center gap-1.5 rounded-full bg-white/[.07] px-3 py-1.5 hover:bg-white/[.12]"><MessageSquare className="size-3.5" />{post.comments === null ? "Comments" : compact(post.comments)}</button>
    </div>
  );
}

function PostCard({ post, go, zoom }: { post: RedditPost; go: (url: string) => void; zoom: (src: string) => void }) {
  const open = () => go(post.permalink);
  return (
    <article onClick={open} className="rd-card cursor-pointer space-y-2.5 rounded-3xl p-4">
      <PostMeta post={post} go={go} />
      <h3 className="text-[17px] font-semibold leading-snug text-white">
        {post.flair && <span className="mr-2 inline-block translate-y-[-2px] rounded-full bg-white/10 px-2 py-0.5 align-middle text-[11px] font-semibold text-white/80">{post.flair}</span>}
        {post.title}
      </h3>
      <Media post={post} full={false} zoom={zoom} />
      <LinkCard post={post} go={go} />
      {post.html && !post.image && !post.gallery && !post.video && <div className="rd-clamp text-[13.5px] text-white/75"><RichText html={post.html} /></div>}
      <PostStats post={post} open={open} />
    </article>
  );
}

function Comment({ comment, depth, go }: { comment: RedditComment; depth: number; go: (url: string) => void }) {
  const [folded, setFolded] = useState(false);
  return (
    <div className="relative">
      <div className="flex items-center gap-2 text-[12px]">
        <SubAvatar name={`u/${comment.author}`} size={22} />
        <span className="font-semibold text-white/90">{comment.author || "[deleted]"}</span>
        {comment.op && <span className="rounded bg-[#ff4500]/25 px-1.5 text-[10px] font-bold text-[#ff8a5c]">OP</span>}
        <span className="text-white/45">· {ago(comment.created)}</span>
        <button type="button" aria-label={folded ? "Show replies" : "Hide replies"} onClick={() => setFolded(!folded)} className="ml-auto grid size-5 place-items-center rounded-full text-white/50 hover:bg-white/10">{folded ? <Plus className="size-3" /> : <Minus className="size-3" />}</button>
      </div>
      {!folded && (
        <div className="ml-[10px] border-l-2 pl-4 pt-1" style={{ borderColor: `hsl(${(depth * 47 + 14) % 360} 60% 55% / .35)` }}>
          <RichText html={comment.html} className="text-[13.5px] text-white/85" />
          {comment.score !== null && <div className="mt-1 flex items-center gap-1 text-[11px] font-semibold text-white/50"><ArrowBigUp className="size-3.5" />{compact(comment.score)}</div>}
          {comment.replies.length > 0 && <div className="mt-3 space-y-4">{comment.replies.map((reply) => <Comment key={reply.id} comment={reply} depth={depth + 1} go={go} />)}</div>}
        </div>
      )}
    </div>
  );
}

const SORT_ICON: Record<string, typeof Flame> = { hot: Flame, new: Sparkles, top: Trophy, rising: TrendingUp };

export function RedditView({ url, go, onReady }: { url: string; go: (url: string) => void; onReady: (title: string) => void }) {
  const route = useMemo<RedditRoute>(() => parseRedditUrl(url), [url]);
  const [page, setPage] = useState<RedditPage | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [more, setMore] = useState<"idle" | "loading" | "done">("idle");
  const [zoomed, setZoomed] = useState<string | null>(null);
  const [query, setQuery] = useState(route.type === "search" ? route.q : "");
  const [attempt, setAttempt] = useState(0);
  const scroller = useRef<HTMLDivElement>(null);
  const ready = useRef(onReady);
  ready.current = onReady;

  useEffect(() => {
    let cancelled = false;
    setPage(null);
    setError(null);
    setMore("idle");
    scroller.current?.scrollTo({ top: 0 });
    fetchPage(url)
      .then((result) => {
        if (cancelled) return;
        setPage(result);
        ready.current(result.kind === "post" ? result.post.title : `${result.title} - Reddit`);
      })
      .catch((reason: unknown) => {
        if (cancelled) return;
        setError(reason instanceof Error ? reason.message : "Reddit couldn't be reached.");
        ready.current("Reddit");
      });
    return () => {
      cancelled = true;
    };
  }, [url, attempt]);

  const loadMore = () => {
    if (!page || page.kind !== "feed" || !page.after || more === "loading") return;
    setMore("loading");
    fetchPage(url, page.after)
      .then((next) => {
        if (next.kind !== "feed") return setMore("done");
        setPage((current) => (current && current.kind === "feed" ? { ...current, posts: [...current.posts, ...next.posts.filter((post) => !current.posts.some((item) => item.id === post.id))], after: next.after } : current));
        setMore(next.after ? "idle" : "done");
      })
      .catch(() => setMore("done"));
  };

  // Links inside posts and comments open in this view (Reddit) or as normal pages (everything else).
  const onLinks = (event: ReactMouseEvent) => {
    const anchor = (event.target as HTMLElement).closest?.("a[href]");
    if (!anchor) return;
    event.preventDefault();
    event.stopPropagation();
    go((anchor as HTMLAnchorElement).href);
  };

  const sub = route.type === "feed" || route.type === "search" ? route.sub : route.type === "post" ? route.sub ?? (page?.kind === "post" ? page.post.sub : null) : null;
  const search = (event: FormEvent) => {
    event.preventDefault();
    const text = query.trim();
    if (text) go(redditHref({ type: "search", q: text, sub: sub && sub !== "all" && sub !== "popular" ? sub : null, sort: "relevance" }));
  };
  const sourceNote = page?.source === "direct" ? "Loaded straight from Reddit" : page?.source === "server" ? "Loaded through PRIVATE OS" : page?.source === "feed" ? "Loaded from Reddit's public feed, so votes and some videos are missing" : "";

  let body: ReactNode;
  if (error) {
    body = (
      <div className="mx-auto mt-16 max-w-sm text-center">
        <RedditMark className="mx-auto size-14 opacity-90" />
        <h2 className="mt-4 text-lg font-semibold">Reddit didn't load</h2>
        <p className="mt-1.5 text-sm text-white/60">{error}</p>
        <div className="mt-5 flex justify-center gap-2">
          <button type="button" onClick={() => setAttempt((value) => value + 1)} className="flex items-center gap-1.5 rounded-full bg-[#ff4500] px-4 py-2 text-sm font-semibold text-white hover:brightness-110"><RefreshCw className="size-4" />Try again</button>
          <button type="button" onClick={() => window.open(url, "_blank", "noopener,noreferrer")} className="flex items-center gap-1.5 rounded-full bg-white/10 px-4 py-2 text-sm font-semibold hover:bg-white/15"><ExternalLink className="size-4" />New tab</button>
        </div>
      </div>
    );
  } else if (!page) {
    body = (
      <div className="space-y-3" aria-busy="true">
        {[0, 1, 2].map((index) => (
          <div key={index} className="rd-card animate-pulse space-y-3 rounded-3xl p-4">
            <div className="h-3 w-40 rounded-full bg-white/10" />
            <div className="h-4 w-3/4 rounded-full bg-white/10" />
            <div className="h-48 rounded-2xl bg-white/[.06]" />
          </div>
        ))}
      </div>
    );
  } else if (page.kind === "post") {
    const post = page.post;
    body = (
      <div className="space-y-4">
        <button type="button" onClick={() => go(`https://www.reddit.com/r/${post.sub}/`)} className="flex items-center gap-1 text-[13px] font-semibold text-white/70 hover:text-white"><ChevronLeft className="size-4" />r/{post.sub}</button>
        <article className="rd-card space-y-3 rounded-3xl p-5">
          <PostMeta post={post} go={go} />
          <h1 className="text-[22px] font-bold leading-tight text-white">
            {post.flair && <span className="mr-2 inline-block translate-y-[-3px] rounded-full bg-white/10 px-2 py-0.5 align-middle text-[11px] font-semibold text-white/80">{post.flair}</span>}
            {post.title}
          </h1>
          <Media post={post} full zoom={setZoomed} />
          <LinkCard post={post} go={go} />
          <RichText html={post.html} className="text-[14.5px] text-white/85" />
          <PostStats post={post} />
        </article>
        <section className="rd-card rounded-3xl p-5">
          <h2 className="mb-4 text-sm font-semibold text-white/80">{page.comments.length ? `Comments` : "No comments yet"}</h2>
          <div className="space-y-5">{page.comments.map((comment) => <Comment key={comment.id} comment={comment} depth={0} go={go} />)}</div>
        </section>
      </div>
    );
  } else {
    body = (
      <div className="space-y-3">
        {page.posts.length === 0 && <p className="mt-10 text-center text-sm text-white/60">Nothing here yet.</p>}
        {page.posts.map((post) => <PostCard key={post.id} post={post} go={go} zoom={setZoomed} />)}
        {page.after && more !== "done" && (
          <button type="button" onClick={loadMore} className="mx-auto flex items-center gap-2 rounded-full bg-white/10 px-5 py-2 text-sm font-semibold hover:bg-white/15">
            {more === "loading" && <Loader2 className="size-4 animate-spin" />}Show more posts
          </button>
        )}
      </div>
    );
  }

  const feedRoute = route.type === "feed" ? route : null;
  const heading = route.type === "post" ? null : routeTitle(route);

  return (
    <div ref={scroller} onClickCapture={onLinks} className="reddit-view absolute inset-0 overflow-y-auto bg-[#0b0e11] text-[#e9ecef]" onScroll={(event) => {
      const el = event.currentTarget;
      if (el.scrollHeight - el.scrollTop - el.clientHeight < 600) loadMore();
    }}>
      <header className="sticky top-0 z-20 border-b border-white/[.07] bg-[#0b0e11]/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-3xl items-center gap-3 px-4 py-2.5">
          <button type="button" aria-label="Reddit home" onClick={() => go("https://www.reddit.com/")} className="flex shrink-0 items-center gap-2">
            <RedditMark className="size-8" />
            <span className="hidden text-[19px] font-bold tracking-tight sm:inline">reddit</span>
          </button>
          <form onSubmit={search} className="flex h-9 min-w-0 flex-1 items-center gap-2 rounded-full bg-white/[.08] px-3.5 focus-within:bg-white/[.12] focus-within:ring-1 focus-within:ring-white/25">
            <Search className="size-4 shrink-0 text-white/50" />
            {sub && sub !== "popular" && sub !== "all" && <span className="flex shrink-0 items-center gap-1 rounded-full bg-white/10 py-0.5 pl-0.5 pr-2 text-[11px] font-semibold"><SubAvatar name={sub} size={16} />r/{sub}</span>}
            <input aria-label="Search Reddit" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search Reddit" className="min-w-0 flex-1 bg-transparent text-[13px] outline-none placeholder:text-white/40" />
          </form>
          <button type="button" aria-label="Open on reddit.com in a new tab" title="Open on reddit.com in a new tab" onClick={() => window.open(url, "_blank", "noopener,noreferrer")} className="grid size-9 shrink-0 place-items-center rounded-full hover:bg-white/10"><ExternalLink className="size-4" /></button>
        </div>
        <nav aria-label="Communities" className="rd-chips mx-auto flex max-w-3xl gap-1.5 overflow-x-auto px-4 pb-2.5">
          {SUBS.map((name) => {
            const active = (name === "popular" && route.type === "feed" && !route.sub) || sub === name;
            return (
              <button key={name} type="button" onClick={() => go(name === "popular" ? "https://www.reddit.com/" : `https://www.reddit.com/r/${name}/`)} className={`shrink-0 rounded-full px-3 py-1 text-[12px] font-semibold transition-colors ${active ? "bg-white text-black" : "bg-white/[.07] text-white/80 hover:bg-white/[.13]"}`}>
                {name === "popular" || name === "all" ? name[0]!.toUpperCase() + name.slice(1) : `r/${name}`}
              </button>
            );
          })}
        </nav>
      </header>
      <main className="mx-auto max-w-3xl px-4 pb-10 pt-5">
        {heading && (
          <div className="mb-4 flex flex-wrap items-center gap-3">
            <SubAvatar name={heading} size={44} />
            <div className="min-w-0 flex-1">
              <h1 className="truncate text-xl font-bold">{heading}</h1>
              {page?.kind === "feed" && page.about && <p className="truncate text-[12px] text-white/55">{page.about}</p>}
            </div>
            {feedRoute && (
              <div className="flex gap-1 rounded-full bg-white/[.06] p-1">
                {(["hot", "new", "top", "rising"] as const).map((sort) => {
                  const SortIcon = SORT_ICON[sort]!;
                  const active = feedRoute.sort === sort;
                  return (
                    <button key={sort} type="button" onClick={() => go(redditHref({ ...feedRoute, sort }))} className={`flex items-center gap-1 rounded-full px-3 py-1 text-[12px] font-semibold capitalize ${active ? "bg-white/15 text-white" : "text-white/60 hover:text-white"}`}>
                      <SortIcon className="size-3.5" />{sort}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}
        {body}
        {sourceNote && <p className="mt-8 text-center text-[11px] text-white/35">{sourceNote}</p>}
      </main>
      {zoomed && (
        <button type="button" aria-label="Close picture" onClick={() => setZoomed(null)} className="fixed inset-0 z-50 grid cursor-zoom-out place-items-center bg-black/90 p-6 [animation:nova-fade_.2s_ease]">
          <img src={zoomed} alt="" referrerPolicy="no-referrer" className="max-h-full max-w-full rounded-xl object-contain" />
          <span className="absolute right-4 top-4 grid size-9 place-items-center rounded-full bg-white/10"><X className="size-4" /></span>
        </button>
      )}
    </div>
  );
}
