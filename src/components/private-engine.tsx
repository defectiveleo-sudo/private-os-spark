import { useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, Bookmark, BookmarkPlus, EyeOff, ExternalLink, History, Lock, LockOpen, Plus, RefreshCw, Search, Settings2, ShieldAlert, Trash2, X } from "lucide-react";
import { ENGINE_KEYS, logActivity, normalizeAddress, setPrivacy, usePrivacy, type SearchEngine } from "@/lib/privacy";
import { Toggle, iconBtn, btnGhost, btnPrimary } from "@/components/private-ui";

// PRIVATE Engine: tabbed browsing through the PRIVATE OS page loader (/api/proxy), which fetches
// pages on the server so sites that refuse to be embedded can still be shown.

type Tab = { id: number; list: string[]; index: number; src: string | null; reload: number; loading: boolean; incognito: boolean };
type Entry = { url: string; title: string; at: number };

const PROXY_SANDBOX = "allow-forms allow-scripts allow-popups allow-popups-to-escape-sandbox allow-downloads allow-modals allow-presentation";

function readList(key: string): Entry[] {
  try {
    const list = JSON.parse(localStorage.getItem(key) ?? "[]") as Entry[];
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}
function writeList(key: string, list: Entry[]) {
  try {
    localStorage.setItem(key, JSON.stringify(list));
  } catch {
    // storage full: skip
  }
}
function hostOf(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

export function PrivateEngine({ startPrivate = false }: { startPrivate?: boolean }) {
  const privacy = usePrivacy();
  const nextId = useRef(1);
  const makeTab = (url: string | null, incognito: boolean): Tab => ({ id: nextId.current++, list: url ? [url] : [], index: url ? 0 : -1, src: url, reload: 0, loading: Boolean(url), incognito });
  const [tabs, setTabs] = useState<Tab[]>(() => {
    if (!startPrivate && privacy.restoreTabs) {
      try {
        const saved = JSON.parse(localStorage.getItem(ENGINE_KEYS.tabs) ?? "[]") as string[];
        if (Array.isArray(saved) && saved.length) return saved.slice(0, 12).map((url) => makeTab(url || null, false));
      } catch {
        // ignore
      }
    }
    return [makeTab(null, startPrivate)];
  });
  const [activeId, setActiveId] = useState(() => tabs[0]!.id);
  const [address, setAddress] = useState("");
  const [panel, setPanel] = useState<null | "bookmarks" | "history" | "settings">(null);
  const [history, setHistory] = useState<Entry[]>(() => readList(ENGINE_KEYS.history));
  const [bookmarks, setBookmarks] = useState<Entry[]>(() => readList(ENGINE_KEYS.bookmarks));
  const frames = useRef<Record<number, HTMLIFrameElement | null>>({});
  const active = tabs.find((tab) => tab.id === activeId) ?? tabs[0]!;
  const page = active.index >= 0 ? active.list[active.index] ?? null : null;

  useEffect(() => setAddress(page ?? ""), [activeId, page]);

  // Remember normal tabs (never private ones) when the setting allows it.
  useEffect(() => {
    if (!privacy.restoreTabs) return localStorage.removeItem(ENGINE_KEYS.tabs);
    const urls = tabs.filter((tab) => !tab.incognito).map((tab) => tab.list[tab.index] ?? "");
    try {
      localStorage.setItem(ENGINE_KEYS.tabs, JSON.stringify(urls));
    } catch {
      // ignore
    }
  }, [tabs, privacy.restoreTabs]);

  const record = (tab: Tab, url: string) => {
    if (tab.incognito || !privacy.saveHistory) return;
    setHistory((list) => {
      const next = [{ url, title: hostOf(url), at: Date.now() }, ...list.filter((item, i) => !(i === 0 && item.url === url))].slice(0, 300);
      writeList(ENGINE_KEYS.history, next);
      return next;
    });
  };

  const patchTab = (id: number, fn: (tab: Tab) => Tab) => setTabs((list) => list.map((tab) => (tab.id === id ? fn(tab) : tab)));

  const go = (input: string) => {
    const url = normalizeAddress(input, privacy.httpsOnly, privacy.searchEngine);
    if (!url) return;
    const tab = active;
    patchTab(tab.id, (t) => ({ ...t, list: [...t.list.slice(0, t.index + 1), url], index: t.index + 1, src: url, reload: t.reload + 1, loading: true }));
    record(tab, url);
    setAddress(url);
  };
  const step = (delta: number) => patchTab(active.id, (t) => {
    const index = t.index + delta;
    const url = t.list[index];
    if (!url) return t;
    return { ...t, index, src: url, reload: t.reload + 1, loading: true };
  });
  const reload = () => page && patchTab(active.id, (t) => ({ ...t, src: page, reload: t.reload + 1, loading: true }));

  // Pages loaded through the loader report their real address after links are followed.
  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      const url = (event.data as { privateNav?: unknown } | null)?.privateNav;
      if (typeof url !== "string" || !/^https?:\/\//i.test(url)) return;
      const id = Number(Object.entries(frames.current).find(([, frame]) => frame?.contentWindow === event.source)?.[0]);
      if (!id) return;
      setTabs((list) => list.map((tab) => {
        if (tab.id !== id) return tab;
        if (tab.list[tab.index] === url) return { ...tab, loading: false };
        if (!tab.incognito && privacy.saveHistory) record(tab, url);
        return { ...tab, list: [...tab.list.slice(0, tab.index + 1), url], index: tab.index + 1, loading: false };
      }));
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  });

  const addTab = (incognito: boolean) => {
    const tab = makeTab(null, incognito);
    setTabs((list) => [...list, tab]);
    setActiveId(tab.id);
    if (incognito) logActivity("PRIVATE Engine", "Opened a private tab");
  };
  const closeTab = (id: number) => {
    const rest = tabs.filter((tab) => tab.id !== id);
    if (!rest.length) {
      const fresh = makeTab(null, false);
      setTabs([fresh]);
      setActiveId(fresh.id);
      return;
    }
    if (tabs.find((t) => t.id === id)?.incognito) logActivity("PRIVATE Engine", "Closed a private tab — nothing was kept");
    setTabs(rest);
    if (id === activeId) setActiveId(rest[rest.length - 1]!.id);
  };

  const marked = Boolean(page && bookmarks.some((b) => b.url === page));
  const toggleBookmark = () => {
    if (!page) return;
    const next = marked ? bookmarks.filter((b) => b.url !== page) : [{ url: page, title: hostOf(page), at: Date.now() }, ...bookmarks];
    setBookmarks(next);
    writeList(ENGINE_KEYS.bookmarks, next);
  };
  const removeBookmark = (url: string) => {
    const next = bookmarks.filter((b) => b.url !== url);
    setBookmarks(next);
    writeList(ENGINE_KEYS.bookmarks, next);
  };
  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem(ENGINE_KEYS.history);
    logActivity("PRIVATE Engine", "Cleared browsing history");
  };

  const secure = page?.startsWith("https://");

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div role="tablist" aria-label="Tabs" className="flex h-9 shrink-0 items-center gap-1 overflow-x-auto border-b border-white/10 bg-black/20 px-2">
        {tabs.map((tab) => {
          const url = tab.list[tab.index];
          const on = tab.id === active.id;
          return (
            <div key={tab.id} className={`flex h-7 max-w-44 shrink-0 items-center gap-1.5 rounded-md pl-2.5 pr-1 text-[11px] ${on ? "bg-white/12" : "hover:bg-white/6"} ${tab.incognito ? "text-violet-200" : ""}`}>
              {tab.incognito && <EyeOff className="size-3 shrink-0" aria-label="Private tab" />}
              <button type="button" role="tab" aria-selected={on} onClick={() => setActiveId(tab.id)} className="min-w-0 truncate">{url ? hostOf(url) : tab.incognito ? "Private tab" : "New tab"}</button>
              <button type="button" aria-label="Close tab" onClick={() => closeTab(tab.id)} className="rounded p-0.5 hover:bg-white/10"><X className="size-3" /></button>
            </div>
          );
        })}
        <button type="button" aria-label="New tab" title="New tab" onClick={() => addTab(false)} className={iconBtn}><Plus className="size-4" /></button>
        <button type="button" aria-label="New private tab" title="New private tab" onClick={() => addTab(true)} className={iconBtn}><EyeOff className="size-4" /></button>
      </div>

      <form onSubmit={(e) => { e.preventDefault(); go(address); }} className="flex shrink-0 items-center gap-1 border-b border-white/10 px-2 py-1.5">
        <button type="button" aria-label="Back" disabled={active.index <= 0} onClick={() => step(-1)} className={iconBtn}><ArrowLeft className="size-4" /></button>
        <button type="button" aria-label="Forward" disabled={active.index >= active.list.length - 1} onClick={() => step(1)} className={iconBtn}><ArrowRight className="size-4" /></button>
        <button type="button" aria-label="Reload" disabled={!page} onClick={reload} className={iconBtn}><RefreshCw className={`size-4 ${active.loading ? "animate-spin" : ""}`} /></button>
        <label className={`flex min-w-0 flex-1 items-center gap-2 rounded-full border px-3 py-1.5 ${active.incognito ? "border-violet-400/40 bg-violet-500/10" : "border-white/10 bg-white/5"}`}>
          {page ? (secure ? <Lock className="size-3.5 shrink-0 text-emerald-400" aria-label="Secure connection (HTTPS)" /> : <LockOpen className="size-3.5 shrink-0 text-amber-400" aria-label="Not secure (HTTP)" />) : <Search className="size-3.5 shrink-0 text-muted-foreground" />}
          <input aria-label="Address or search" value={address} onChange={(e) => setAddress(e.target.value)} onFocus={(e) => e.target.select()} placeholder={active.incognito ? "Private tab — search or enter address" : "Search or enter address"} className="min-w-0 flex-1 bg-transparent text-xs outline-none placeholder:text-muted-foreground" />
          {page && <span className={`hidden shrink-0 text-[10px] sm:inline ${secure ? "text-emerald-400" : "text-amber-400"}`}>{secure ? "HTTPS" : "Not secure"}</span>}
        </label>
        <button type="button" aria-label={marked ? "Remove bookmark" : "Add bookmark"} disabled={!page} onClick={toggleBookmark} className={iconBtn}>{marked ? <Bookmark className="size-4 fill-primary text-primary" /> : <BookmarkPlus className="size-4" />}</button>
        <button type="button" aria-label="Open in a real browser tab" disabled={!page} onClick={() => page && window.open(page, "_blank", "noopener,noreferrer")} className={iconBtn}><ExternalLink className="size-4" /></button>
        <button type="button" aria-label="Bookmarks" aria-pressed={panel === "bookmarks"} onClick={() => setPanel(panel === "bookmarks" ? null : "bookmarks")} className={iconBtn}><Bookmark className="size-4" /></button>
        <button type="button" aria-label="History" aria-pressed={panel === "history"} onClick={() => setPanel(panel === "history" ? null : "history")} className={iconBtn}><History className="size-4" /></button>
        <button type="button" aria-label="Privacy settings" aria-pressed={panel === "settings"} onClick={() => setPanel(panel === "settings" ? null : "settings")} className={iconBtn}><Settings2 className="size-4" /></button>
      </form>

      <div className="relative flex min-h-0 flex-1">
        <div className="relative min-w-0 flex-1">
          {tabs.map((tab) => {
            const show = tab.id === active.id;
            if (!tab.src) return show ? <NewTabPage key={tab.id} incognito={tab.incognito} bookmarks={bookmarks} go={go} /> : null;
            if (!privacy.thirdParty) return show ? <Blocked key={tab.id} /> : null;
            return (
              <iframe
                key={`${tab.id}-${tab.reload}`}
                ref={(node) => { frames.current[tab.id] = node; }}
                title={`Page in tab ${tab.id}`}
                src={`/api/proxy?url=${encodeURIComponent(tab.src)}`}
                sandbox={PROXY_SANDBOX}
                referrerPolicy="no-referrer"
                onLoad={() => patchTab(tab.id, (t) => ({ ...t, loading: false }))}
                className={`absolute inset-0 size-full border-0 bg-background ${show ? "" : "invisible"}`}
              />
            );
          })}
        </div>
        {panel && (
          <aside className="absolute inset-y-0 right-0 z-10 flex w-full max-w-xs flex-col border-l border-white/10 bg-background/95 backdrop-blur md:static md:bg-black/30">
            <div className="flex items-center justify-between border-b border-white/10 px-3 py-2">
              <h3 className="text-xs font-semibold capitalize">{panel === "settings" ? "Privacy settings" : panel}</h3>
              <button type="button" aria-label="Close panel" onClick={() => setPanel(null)} className={iconBtn}><X className="size-4" /></button>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto p-3">
              {panel === "bookmarks" && (bookmarks.length ? bookmarks.map((b) => <Row key={b.url} entry={b} open={go} remove={() => removeBookmark(b.url)} />) : <p className="text-[11px] text-muted-foreground">No bookmarks yet. Use the bookmark button in the address bar.</p>)}
              {panel === "history" && (
                <>
                  {!privacy.saveHistory && <p className="mb-2 rounded-lg bg-amber-500/10 p-2 text-[11px] text-amber-200">History saving is off. New pages are not recorded.</p>}
                  {history.length ? (
                    <>
                      <button type="button" onClick={clearHistory} className={`${btnGhost} mb-2 w-full`}><Trash2 className="size-3.5" /> Clear history</button>
                      {history.map((h, i) => <Row key={`${h.url}-${h.at}-${i}`} entry={h} open={go} />)}
                    </>
                  ) : <p className="text-[11px] text-muted-foreground">No history. Private tabs are never recorded.</p>}
                </>
              )}
              {panel === "settings" && (
                <div className="divide-y divide-white/10">
                  <Toggle label="Save browsing history" description="Normal tabs only. Private tabs are never saved." checked={privacy.saveHistory} onChange={(v) => setPrivacy({ saveHistory: v })} />
                  <Toggle label="Reopen tabs" description="Restore normal tabs when PRIVATE Engine opens again." checked={privacy.restoreTabs} onChange={(v) => setPrivacy({ restoreTabs: v })} />
                  <Toggle label="HTTPS-only addresses" description="Typed http:// addresses are upgraded to https://." checked={privacy.httpsOnly} onChange={(v) => setPrivacy({ httpsOnly: v })} />
                  <Toggle label="Load outside websites" description="Pages are fetched by the PRIVATE OS page loader server, then shown here." checked={privacy.thirdParty} onChange={(v) => setPrivacy({ thirdParty: v })} />
                  <label className="block py-3 text-xs font-semibold">Search engine
                    <select value={privacy.searchEngine} onChange={(e) => setPrivacy({ searchEngine: e.target.value as SearchEngine })} className="mt-1.5 w-full rounded-lg border border-white/10 bg-white/5 px-2 py-1.5 text-xs">
                      <option value="duckduckgo">DuckDuckGo</option>
                      <option value="brave">Brave Search</option>
                      <option value="wikipedia">Wikipedia</option>
                    </select>
                  </label>
                  <p className="pt-3 text-[10px] leading-relaxed text-muted-foreground">PRIVATE Engine is not a VPN and does not make you anonymous. Websites still see requests from the page loader server, and it does not block trackers across your device.</p>
                </div>
              )}
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}

function Row({ entry, open, remove }: { entry: Entry; open: (url: string) => void; remove?: () => void }) {
  return (
    <div className="group flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-white/5">
      <button type="button" onClick={() => open(entry.url)} className="min-w-0 flex-1 text-left">
        <span className="block truncate text-[11px] font-semibold">{entry.title}</span>
        <span className="block truncate text-[10px] text-muted-foreground">{entry.url}</span>
      </button>
      {remove && <button type="button" aria-label={`Remove ${entry.title}`} onClick={remove} className={iconBtn}><Trash2 className="size-3.5" /></button>}
    </div>
  );
}

function NewTabPage({ incognito, bookmarks, go }: { incognito: boolean; bookmarks: Entry[]; go: (url: string) => void }) {
  const [q, setQ] = useState("");
  const quick = bookmarks.length ? bookmarks.slice(0, 8) : ["https://en.wikipedia.org", "https://news.ycombinator.com", "https://cherrion.top", "https://example.com"].map((url) => ({ url, title: hostOf(url), at: 0 }));
  return (
    <div className="absolute inset-0 overflow-y-auto p-6">
      <div className="mx-auto flex max-w-xl flex-col items-center pt-8 text-center">
        <span className={`grid size-14 place-items-center rounded-2xl ${incognito ? "bg-violet-500/20 text-violet-200" : "bg-primary/20 text-primary"}`}>{incognito ? <EyeOff className="size-7" /> : <ShieldAlert className="size-7" />}</span>
        <h2 className="mt-4 font-['Playfair_Display',serif] text-2xl font-bold">{incognito ? "Private tab" : "PRIVATE Engine"}</h2>
        <p className="mt-1 max-w-md text-xs text-muted-foreground">{incognito ? "Pages you visit here are not added to history and this tab is not reopened later. Sites can still see your visit." : "Search the web or enter an address. Pages load through the PRIVATE OS page loader."}</p>
        <form onSubmit={(e) => { e.preventDefault(); go(q); }} className="mt-5 flex w-full gap-2">
          <input aria-label="Search the web" autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search or type a web address" className="min-w-0 flex-1 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs outline-none focus:border-primary" />
          <button type="submit" className={btnPrimary}>Go</button>
        </form>
        <div className="mt-6 grid w-full grid-cols-2 gap-2 sm:grid-cols-4">
          {quick.map((b) => (
            <button key={b.url} type="button" onClick={() => go(b.url)} className="rounded-xl border border-white/10 bg-white/5 p-3 text-left hover:bg-white/10">
              <span className="block truncate text-[11px] font-semibold">{b.title}</span>
              <span className="block truncate text-[10px] text-muted-foreground">{b.url.replace(/^https?:\/\//, "")}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function Blocked() {
  return (
    <div className="absolute inset-0 grid place-items-center p-6 text-center">
      <div className="max-w-sm">
        <ShieldAlert className="mx-auto size-8 text-amber-400" />
        <p className="mt-3 text-sm font-semibold">Outside websites are turned off</p>
        <p className="mt-1 text-xs text-muted-foreground">Turn on “Load outside websites” in Privacy Center or this window's privacy settings to load pages.</p>
        <button type="button" onClick={() => setPrivacy({ thirdParty: true })} className={`${btnPrimary} mt-4`}>Turn on</button>
      </div>
    </div>
  );
}
