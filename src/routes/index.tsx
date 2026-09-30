import { createFileRoute } from "@tanstack/react-router";
import { createContext, useContext, useEffect, useMemo, useState, type ComponentType } from "react";
import {
  ArrowLeft,
  ArrowRight,
  BatteryFull,
  Cherry,
  ChevronDown,
  CircleUserRound,
  Cloud,
  ExternalLink,
  Folder,
  Grid3X3,
  LockKeyhole,
  Maximize2,
  Minimize2,
  Minus,
  Plus,
  RefreshCw,
  Search,
  Settings,
  ShieldCheck,
  Signal,
  Sparkles,
  Volume2,
  Wifi,
  X,
} from "lucide-react";
import { OsButton } from "@/components/os-button";
import mountainAsset from "@/assets/private-os-mountains.jpg.asset.json";
import cherryAsset from "@/assets/private-os-cherry.jpg.asset.json";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "PRIVATE OS — Your space, your rules" },
      { name: "description", content: "A private, focused desktop with PRIVATE Browser and switchable landscapes." },
      { property: "og:title", content: "PRIVATE OS — Your space, your rules" },
      { property: "og:description", content: "A private, focused desktop with PRIVATE Browser and switchable landscapes." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: PrivateOS,
});

type WindowName = "browser" | "figure" | "settings" | "files" | null;

const CHERRION_URL = "https://cherrion.top/";
const FIGURE_CLOUD_URL = "https://figure-cloud.figure-softwares.workers.dev/";

type IconComponent = ComponentType<{ className?: string }>;

function PrivateBrowserIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
      <defs>
        <linearGradient id="private-browser-gradient" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#6fdc8c" />
          <stop offset="1" stopColor="#e0a43c" />
        </linearGradient>
      </defs>
      <circle cx="16" cy="16" r="15" fill="url(#private-browser-gradient)" />
      <g fill="none" stroke="#0d1a10" strokeWidth="1.6" strokeLinecap="round">
        <circle cx="15" cy="15" r="8" />
        <ellipse cx="15" cy="15" rx="3.4" ry="8" />
        <path d="M7 15h16" />
      </g>
      <path d="M23 18l4.2 1.6v3.1c0 2.5-1.8 4.2-4.2 5.2-2.4-1-4.2-2.7-4.2-5.2v-3.1z" fill="#0d1a10" stroke="#f3f7ee" strokeWidth="1" strokeLinejoin="round" />
    </svg>
  );
}

const WindowContext = createContext<{ minimized: boolean; minimize: () => void }>({ minimized: false, minimize: () => {} });

const dockApps: { id: string; label: string; icon: IconComponent; color: string }[] = [
  { id: "launcher", label: "Apps", icon: Grid3X3, color: "bg-secondary" },
  { id: "browser", label: "PRIVATE Browser", icon: PrivateBrowserIcon, color: "" },
  { id: "figure", label: "Figure Cloud", icon: Cloud, color: "bg-accent text-accent-foreground" },
  { id: "files", label: "Files", icon: Folder, color: "bg-accent text-accent-foreground" },
  { id: "settings", label: "Settings", icon: Settings, color: "bg-secondary" },
];

const launcherApps: { id: string; label: string; icon: IconComponent }[] = [
  { id: "browser", label: "Private Browser", icon: PrivateBrowserIcon },
  { id: "figure", label: "Figure Cloud", icon: Cloud },
  { id: "cherrion", label: "Cherrion", icon: Cherry },
  { id: "files", label: "Private Files", icon: Folder },
  { id: "settings", label: "Settings", icon: Settings },
];

function PrivateOS() {
  const [phase, setPhase] = useState<"start" | "boot" | "desktop">("start");
  const [minimized, setMinimized] = useState(false);
  const [wallpaper, setWallpaper] = useState<0 | 1>(0);
  const [activeWindow, setActiveWindow] = useState<WindowName>(null);
  const [launcher, setLauncher] = useState(false);
  const [quickMenu, setQuickMenu] = useState(false);
  const [query, setQuery] = useState("");
  const [browserStart, setBrowserStart] = useState<string | null>(null);
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const clockTimer = window.setInterval(() => setTime(new Date()), 30000);
    return () => globalThis.clearInterval(clockTimer);
  }, []);

  useEffect(() => {
    if (phase !== "boot") return;
    const bootTimer = window.setTimeout(() => setPhase("desktop"), 2600);
    return () => globalThis.clearTimeout(bootTimer);
  }, [phase]);

  useEffect(() => {
    if (phase === "desktop") return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "Enter" || event.repeat) return;
      setPhase((current) => (current === "start" ? "boot" : "desktop"));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [phase]);

  const wallpapers = [mountainAsset.url, cherryAsset.url];
  const dateLabel = useMemo(
    () => time.toLocaleDateString("en-US", { weekday: "long" }).toUpperCase(),
    [time],
  );
  const timeLabel = time.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  const dockDay = time.toLocaleDateString("en-US", { weekday: "short" }).toUpperCase();

  const closeWindow = () => {
    setActiveWindow(null);
    setMinimized(false);
  };

  const openApp = (id: string) => {
    setMinimized(false);
    setLauncher(false);
    setQuickMenu(false);
    if (id === "browser" || id === "cherrion") {
      setBrowserStart(id === "cherrion" ? CHERRION_URL : null);
      setActiveWindow("browser");
    }
    if (id === "figure") setActiveWindow("figure");
    if (id === "settings") setActiveWindow("settings");
    if (id === "files") setActiveWindow("files");
  };

  if (phase === "start") return <StartScreen onStart={() => setPhase("boot")} />;
  if (phase === "boot") return <BootScreen />;

  return (
    <main className="relative h-dvh w-full overflow-hidden bg-background font-sans text-foreground [animation:desktop-in_.8s_ease-out]">
      <img src={wallpapers[wallpaper]} alt="PRIVATE OS landscape wallpaper" className="absolute inset-0 size-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-b from-background/20 via-transparent to-background/35" />

      <header className="soft-glass absolute inset-x-0 top-0 z-40 flex h-11 items-center justify-between border-x-0 border-t-0 px-4 text-xs font-medium md:px-6">
        <div className="flex items-center gap-3">
          <ShieldCheck className="size-4 text-primary" />
          <span className="hidden sm:inline">PRIVATE OS</span>
        </div>
        <button
          type="button"
          onClick={() => setQuickMenu((value) => !value)}
          aria-label="Open quick settings"
          className="flex items-center gap-3 rounded-md px-2 py-1 transition-colors hover:bg-secondary focus-visible:ring-2 focus-visible:ring-ring"
        >
          <Signal className="size-3.5" />
          <Wifi className="size-3.5" />
          <BatteryFull className="size-4" />
          <span>{timeLabel}</span>
        </button>
      </header>

      <section className="absolute inset-x-0 top-[14%] z-10 text-center drop-shadow-lg">
        <p className="text-xs font-semibold tracking-[.42em] text-foreground/90">{dateLabel}</p>
        <h1 className="mt-3 text-5xl font-light tabular-nums md:text-6xl">{timeLabel}</h1>
        <p className="mt-3 text-xs text-foreground/70">Your space. Your rules.</p>
      </section>

      {quickMenu && (
        <aside className="glass-panel absolute right-3 top-14 z-50 w-[min(22rem,calc(100%-1.5rem))] rounded-lg p-4 [animation:window-in_.22s_ease-out] md:right-6">
          <div className="mb-4 flex items-center justify-between">
            <div><p className="text-sm font-semibold">Quick settings</p><p className="text-xs text-muted-foreground">Private by default</p></div>
            <CircleUserRound className="size-7 text-primary" />
          </div>
          <div className="grid grid-cols-3 gap-2">
            {[{ icon: Wifi, label: "Wi-Fi" }, { icon: Volume2, label: "Sound" }, { icon: LockKeyhole, label: "Privacy" }].map(({ icon: Icon, label }) => (
              <div key={label} className="flex min-h-20 flex-col items-center justify-center gap-2 rounded-md bg-secondary text-xs"><Icon className="size-5 text-primary" />{label}</div>
            ))}
          </div>
          <div className="mt-4 flex items-center gap-3"><span className="text-xs">Display</span><div className="h-1.5 flex-1 rounded-full bg-muted"><div className="h-full w-2/3 rounded-full bg-primary" /></div></div>
        </aside>
      )}

      {launcher && <AppLauncher query={query} setQuery={setQuery} openApp={openApp} close={() => setLauncher(false)} />}
      <WindowContext.Provider value={{ minimized, minimize: () => setMinimized(true) }}>
        {activeWindow === "browser" && <PrivateBrowser initialUrl={browserStart} close={closeWindow} />}
        {activeWindow === "figure" && <FigureCloudApp close={closeWindow} />}
        {activeWindow === "settings" && <WallpaperSettings wallpaper={wallpaper} setWallpaper={setWallpaper} close={closeWindow} />}
        {activeWindow === "files" && <FilesWindow close={closeWindow} />}
      </WindowContext.Provider>

      <nav aria-label="PRIVATE OS dock" className="dock-glass absolute bottom-2 left-1/2 z-40 flex h-11 w-max max-w-[calc(100%-1rem)] -translate-x-1/2 items-center gap-1 rounded-full px-2 md:bottom-3">
        <OsButton label="PRIVATE OS home" onClick={() => { closeWindow(); setLauncher(false); }} className="group relative size-7 shrink-0 rounded-full border border-border bg-background/25 transition-transform hover:-translate-y-0.5">
          <ShieldCheck className="size-4 text-primary" />
          <span className="absolute -top-8 hidden whitespace-nowrap rounded bg-popover px-2 py-1 text-[10px] shadow group-hover:block">PRIVATE OS</span>
        </OsButton>
        <div className="mx-0.5 flex min-w-0 items-center justify-center gap-1.5 border-x border-border px-2">
          {dockApps.map(({ id, label, icon: Icon, color }) => (
            <OsButton
              key={id}
              label={label}
              onClick={() => id === "launcher" ? setLauncher((value) => !value) : openApp(id)}
              className={`group relative size-7 shrink-0 rounded-lg ${color} transition-transform hover:-translate-y-0.5`}
            >
              <Icon className={id === "browser" ? "size-7" : "size-4"} />
              <span className="absolute -top-8 hidden whitespace-nowrap rounded bg-popover px-2 py-1 text-[10px] shadow group-hover:block">{label}</span>
              {activeWindow === id && <span className="absolute -bottom-1 size-1 rounded-full bg-foreground" />}
            </OsButton>
          ))}
        </div>
        <button type="button" onClick={() => setQuickMenu((value) => !value)} aria-label="Open date and quick settings" className="flex shrink-0 flex-col items-end rounded-md px-1.5 text-right leading-tight outline-none transition-colors hover:bg-secondary focus-visible:ring-2 focus-visible:ring-ring">
          <span className="text-[8px] font-bold text-muted-foreground">{dockDay}</span>
          <span className="text-[11px] font-semibold tabular-nums">{timeLabel}</span>
        </button>
      </nav>
    </main>
  );
}

function StartScreen({ onStart }: { onStart: () => void }) {
  return (
    <main className="flex h-dvh flex-col items-center justify-center bg-[linear-gradient(to_bottom,#2b323b,#5d6977_55%,#a4b4c6)] px-4 text-center text-white">
      <h1 className="text-[clamp(2rem,10vw,5rem)] font-extrabold leading-none tracking-[.14em]">PRIVATE OS</h1>
      <div className="mt-5 h-[3px] w-[55%] max-w-xs bg-white" />
      <button type="button" onClick={onStart} className="mt-8 border border-white/70 px-9 py-3 text-xs font-bold tracking-[.2em] outline-none transition-colors hover:bg-white/15 focus-visible:ring-2 focus-visible:ring-white">
        START
      </button>
      <p className="mt-4 text-[11px] tracking-wide text-white/60">Press ENTER twice to skip</p>
    </main>
  );
}

function BootScreen() {
  return (
    <main className="flex h-dvh items-center justify-center bg-background text-foreground">
      <div className="text-center [animation:boot-mark_2.5s_ease-in-out_forwards]">
        <div className="mx-auto flex size-16 items-center justify-center rounded-lg border border-border bg-card shadow-2xl"><ShieldCheck className="size-8 text-primary" /></div>
        <h1 className="mt-5 text-xl font-semibold tracking-[.28em]">PRIVATE OS</h1>
        <p className="mt-2 text-[10px] uppercase tracking-[.22em] text-muted-foreground">Private by design</p>
        <div className="mx-auto mt-8 h-px w-40 overflow-hidden bg-muted"><div className="h-full origin-left bg-primary [animation:boot-bar_2.2s_ease-in-out_forwards]" /></div>
      </div>
    </main>
  );
}

function AppLauncher({ query, setQuery, openApp, close }: { query: string; setQuery: (value: string) => void; openApp: (id: string) => void; close: () => void }) {
  const filtered = launcherApps.filter((app) => app.label.toLowerCase().includes(query.toLowerCase()));
  return (
    <section className="glass-panel absolute bottom-16 left-1/2 z-30 flex h-[min(34rem,68vh)] w-[min(45rem,calc(100%-1.5rem))] -translate-x-1/2 flex-col rounded-lg p-4 [animation:window-in_.24s_ease-out] md:p-6">
      <div className="flex items-center gap-3">
        <div className="flex flex-1 items-center gap-2 rounded-md border border-border bg-input px-3"><Search className="size-4 text-muted-foreground" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search apps" className="h-10 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground" /></div>
        <OsButton label="Close launcher" onClick={close} className="size-10 rounded-md hover:bg-secondary"><X className="size-5" /></OsButton>
      </div>
      <p className="mb-4 mt-5 text-xs font-semibold uppercase text-muted-foreground">All applications</p>
      <div className="grid flex-1 grid-cols-3 gap-3 overflow-auto sm:grid-cols-4 md:grid-cols-6">
        {filtered.map(({ id, label, icon: Icon }) => (
          <OsButton key={id} label={`Open ${label}`} onClick={() => openApp(id)} className="flex min-h-24 flex-col gap-2 rounded-md p-2 transition-colors hover:bg-secondary">
            <span className="flex size-12 items-center justify-center rounded-md bg-secondary shadow-lg"><Icon className="size-6 text-primary" /></span><span className="text-center text-[11px] leading-tight">{label}</span>
          </OsButton>
        ))}
      </div>
      <ChevronDown className="mx-auto mt-3 size-4 text-muted-foreground" />
    </section>
  );
}

function WindowFrame({ title, icon: Icon, close, children }: { title: string; icon: IconComponent; close: () => void; children: React.ReactNode }) {
  const { minimized, minimize } = useContext(WindowContext);
  const [maximized, setMaximized] = useState(false);
  return (
    <section className={`glass-panel absolute z-30 flex flex-col overflow-hidden [animation:window-in_.28s_ease-out] ${minimized ? "hidden" : ""} ${maximized ? "inset-x-0 bottom-14 top-11 rounded-none" : "inset-x-2 bottom-16 top-14 rounded-lg md:inset-x-[8%] md:top-16"}`}>
      <header className="flex h-12 shrink-0 items-center justify-between border-b border-border px-3">
        <div className="flex items-center gap-2 text-sm font-semibold"><Icon className="size-4 text-primary" />{title}</div>
        <div className="flex gap-1">
          <OsButton label="Minimize" onClick={minimize} className="size-8 rounded-md hover:bg-secondary"><Minus className="size-4" /></OsButton>
          <OsButton label={maximized ? "Restore" : "Maximize"} onClick={() => setMaximized((value) => !value)} className="size-8 rounded-md hover:bg-secondary">{maximized ? <Minimize2 className="size-3.5" /> : <Maximize2 className="size-3.5" />}</OsButton>
          <OsButton label="Close" onClick={close} className="size-8 rounded-md hover:bg-destructive"><X className="size-4" /></OsButton>
        </div>
      </header>
      {children}
    </section>
  );
}

function PrivateBrowser({ initialUrl, close }: { initialUrl: string | null; close: () => void }) {
  const [address, setAddress] = useState(initialUrl ?? "");
  const [history, setHistory] = useState<string[]>(initialUrl ? [initialUrl] : []);
  const [historyIndex, setHistoryIndex] = useState(initialUrl ? 0 : -1);
  const [reloadKey, setReloadKey] = useState(0);
  const [loading, setLoading] = useState(Boolean(initialUrl));
  const page = historyIndex >= 0 ? history[historyIndex] : null;

  const navigateTo = (value: string) => {
    const clean = value.trim();
    if (!clean) return;
    const isUrl = /^https?:\/\//i.test(clean) || /^(localhost|[\w-]+\.[a-z]{2,})([/:?#]|$)/i.test(clean);
    const destination = isUrl ? (/^https?:\/\//i.test(clean) ? clean : `https://${clean}`) : `https://search.brave.com/search?q=${encodeURIComponent(clean)}`;
    const nextHistory = [...history.slice(0, historyIndex + 1), destination];
    setHistory(nextHistory);
    setHistoryIndex(nextHistory.length - 1);
    setAddress(destination);
    setLoading(true);
  };

  const moveHistory = (direction: -1 | 1) => {
    const next = historyIndex + direction;
    if (next < 0 || next >= history.length) return;
    const nextPage = history[next];
    if (!nextPage) return;
    setHistoryIndex(next);
    setAddress(nextPage);
    setLoading(true);
  };
  return (
    <WindowFrame title="PRIVATE Browser" icon={PrivateBrowserIcon} close={close}>
      <div className="flex h-12 shrink-0 items-center gap-1.5 border-b border-border bg-background/40 px-2">
        <OsButton label="Back" disabled={historyIndex <= 0} onClick={() => moveHistory(-1)} className="size-8 rounded-md hover:bg-secondary disabled:opacity-30"><ArrowLeft className="size-4" /></OsButton><OsButton label="Forward" disabled={historyIndex >= history.length - 1} onClick={() => moveHistory(1)} className="size-8 rounded-md hover:bg-secondary disabled:opacity-30"><ArrowRight className="size-4" /></OsButton><OsButton label="Reload" disabled={!page} onClick={() => { setLoading(Boolean(page)); setReloadKey((value) => value + 1); }} className="hidden size-8 rounded-md hover:bg-secondary disabled:opacity-30 sm:inline-flex"><RefreshCw className="size-4" /></OsButton>
        <form onSubmit={(event) => { event.preventDefault(); navigateTo(address); }} className="flex h-9 min-w-0 flex-1 items-center gap-2 rounded-md border border-border bg-input px-2 sm:px-3"><LockKeyhole className="size-3.5 shrink-0 text-primary" /><input aria-label="Search or enter address" value={address} onChange={(event) => setAddress(event.target.value)} placeholder="Search or enter address" className="min-w-0 flex-1 bg-transparent text-xs outline-none" /></form>
        <OsButton label="Open this page in a new tab" disabled={!page} onClick={() => page && window.open(page, "_blank", "noopener,noreferrer")} className="size-8 rounded-md hover:bg-secondary disabled:opacity-30"><ExternalLink className="size-4" /></OsButton>
      </div>
      <div className="relative flex-1 overflow-hidden bg-background">
        {page ? <>
          {loading && <div className="absolute inset-0 z-10 grid place-items-center bg-background/80"><div className="text-center"><RefreshCw className="mx-auto size-6 animate-spin text-primary" /><p className="mt-3 text-xs text-muted-foreground">Opening securely…</p></div></div>}
          <iframe key={`${page}-${reloadKey}`} title="PRIVATE Browser page" src={page} onLoad={() => setLoading(false)} className="size-full border-0 bg-background" sandbox="allow-forms allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox allow-downloads allow-modals allow-presentation" />
        </> : (
          <div className="flex size-full flex-col items-center justify-center px-5 text-center">
            <div className="flex size-16 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-xl"><ShieldCheck className="size-8" /></div>
            <h2 className="mt-5 text-2xl font-semibold">Browse without being followed.</h2>
            <p className="mt-2 max-w-md text-sm text-muted-foreground">Search privately or open a website directly. Use the external-open button when a site does not allow an embedded view.</p>
            <div className="mt-6 grid w-full max-w-lg grid-cols-2 gap-2">
              <OsButton label="Open Cherrion" onClick={() => navigateTo(CHERRION_URL)} className="justify-start gap-3 rounded-md border border-border bg-card p-3 text-left hover:bg-secondary"><span className="grid size-9 shrink-0 place-items-center rounded-md bg-accent text-accent-foreground"><Cherry className="size-5" /></span><span><strong className="block text-xs">Cherrion</strong><span className="text-[10px] text-muted-foreground">Recommended app</span></span></OsButton>
              <OsButton label="Search with Brave" onClick={() => { setAddress("https://search.brave.com/"); navigateTo("https://search.brave.com/"); }} className="justify-start gap-3 rounded-md border border-border bg-card p-3 text-left hover:bg-secondary"><span className="grid size-9 shrink-0 place-items-center rounded-md bg-primary text-primary-foreground"><Search className="size-5" /></span><span><strong className="block text-xs">Brave Search</strong><span className="text-[10px] text-muted-foreground">Private search</span></span></OsButton>
            </div>
            <div className="mt-8 grid w-full max-w-lg grid-cols-3 gap-2">
              {["Private search", "Block trackers", "Clear session"].map((text, index) => <div key={text} className="rounded-md border border-border bg-card p-3 text-xs"><span className="mb-2 block text-primary">{index === 0 ? <Search className="mx-auto size-5" /> : index === 1 ? <ShieldCheck className="mx-auto size-5" /> : <Sparkles className="mx-auto size-5" />}</span>{text}</div>)}
            </div>
          </div>
        )}
      </div>
      <footer className="flex h-7 items-center justify-between border-t border-border px-3 text-[10px] text-muted-foreground"><span>Shields active</span><span>0 trackers on this page</span></footer>
    </WindowFrame>
  );
}

function FigureCloudApp({ close }: { close: () => void }) {
  const [loading, setLoading] = useState(true);
  const [reloadKey, setReloadKey] = useState(0);
  return (
    <WindowFrame title="Figure Cloud" icon={Cloud} close={close}>
      <div className="grid h-10 shrink-0 grid-cols-[minmax(0,1fr)_auto] items-center border-b border-border bg-background/30 px-3">
        <div className="flex min-w-0 items-center gap-2"><span className="size-2 shrink-0 rounded-full bg-primary" /><span className="truncate text-[11px] text-muted-foreground">Figure workspace connected</span></div>
        <div className="flex items-center gap-1"><OsButton label="Reload Figure Cloud" onClick={() => { setLoading(true); setReloadKey((value) => value + 1); }} className="size-7 rounded-md hover:bg-secondary"><RefreshCw className="size-3.5" /></OsButton><OsButton label="Open Figure Cloud in a new tab" onClick={() => window.open(FIGURE_CLOUD_URL, "_blank", "noopener,noreferrer")} className="size-7 rounded-md hover:bg-secondary"><ExternalLink className="size-3.5" /></OsButton></div>
      </div>
      <div className="relative flex-1 overflow-hidden bg-background">
        {loading && <div className="absolute inset-0 z-10 grid place-items-center bg-background"><div className="text-center"><div className="mx-auto grid size-14 place-items-center rounded-lg bg-accent text-accent-foreground shadow-xl"><Cloud className="size-7" /></div><p className="mt-4 text-sm font-semibold">Starting Figure Cloud</p><p className="mt-1 text-xs text-muted-foreground">Preparing your workspace…</p></div></div>}
        <iframe key={reloadKey} title="Figure Cloud application" src={FIGURE_CLOUD_URL} onLoad={() => setLoading(false)} className="size-full border-0 bg-background" allow="clipboard-read; clipboard-write; fullscreen" sandbox="allow-forms allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox allow-downloads allow-modals allow-presentation" />
      </div>
    </WindowFrame>
  );
}

function WallpaperSettings({ wallpaper, setWallpaper, close }: { wallpaper: 0 | 1; setWallpaper: (value: 0 | 1) => void; close: () => void }) {
  return (
    <WindowFrame title="Appearance" icon={Settings} close={close}>
      <div className="flex-1 overflow-auto p-5 md:p-8">
        <h2 className="text-xl font-semibold">Choose your landscape</h2><p className="mt-1 text-sm text-muted-foreground">Changes appear instantly across your home screen.</p>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {[{ src: mountainAsset.url, label: "Alpine Lake" }, { src: cherryAsset.url, label: "Cherry Village" }].map((item, index) => (
            <OsButton key={item.label} label={`Use ${item.label} wallpaper`} onClick={() => setWallpaper(index as 0 | 1)} className={`group relative aspect-video overflow-hidden rounded-md border-2 ${wallpaper === index ? "border-primary" : "border-border"}`}>
              <img src={item.src} alt={item.label} className="size-full object-cover transition-transform group-hover:scale-105" /><span className="absolute inset-x-0 bottom-0 bg-background/75 p-3 text-left text-xs font-semibold backdrop-blur-md">{item.label}{wallpaper === index && <span className="float-right text-primary">Selected</span>}</span>
            </OsButton>
          ))}
        </div>
      </div>
    </WindowFrame>
  );
}

function FilesWindow({ close }: { close: () => void }) {
  return (
    <WindowFrame title="Private Files" icon={Folder} close={close}>
      <div className="grid flex-1 place-items-center p-6 text-center"><div><Folder className="mx-auto size-14 text-primary" /><h2 className="mt-4 text-xl font-semibold">Your private space</h2><p className="mt-2 text-sm text-muted-foreground">No files yet. Everything you keep here stays in your session.</p><button type="button" className="mt-5 inline-flex h-10 items-center gap-2 rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground"><Plus className="size-4" />New folder</button></div></div>
    </WindowFrame>
  );
      
