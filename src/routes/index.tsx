import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  AppWindow,
  ArrowLeft,
  ArrowRight,
  BatteryFull,
  BookOpen,
  Bot,
  ChevronDown,
  CircleUserRound,
  Clock3,
  Code2,
  Expand,
  Folder,
  Gamepad2,
  Globe2,
  Grid3X3,
  Home,
  Image,
  Leaf,
  LockKeyhole,
  Maximize2,
  Menu,
  MessageCircle,
  Minus,
  Music2,
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

type WindowName = "browser" | "settings" | "files" | null;

const dockApps = [
  { id: "launcher", label: "Apps", icon: Grid3X3, color: "bg-secondary" },
  { id: "browser", label: "PRIVATE Browser", icon: Globe2, color: "bg-primary text-primary-foreground" },
  { id: "files", label: "Files", icon: Folder, color: "bg-accent text-accent-foreground" },
  { id: "messages", label: "Messages", icon: MessageCircle, color: "bg-secondary" },
  { id: "music", label: "Music", icon: Music2, color: "bg-secondary" },
  { id: "settings", label: "Settings", icon: Settings, color: "bg-secondary" },
] as const;

const launcherApps = [
  { id: "browser", label: "Private Browser", icon: Globe2 },
  { id: "files", label: "Private Files", icon: Folder },
  { id: "messages", label: "Messages", icon: MessageCircle },
  { id: "settings", label: "Settings", icon: Settings },
  { id: "music", label: "Music", icon: Music2 },
  { id: "photos", label: "Photos", icon: Image },
  { id: "code", label: "Code Studio", icon: Code2 },
  { id: "games", label: "Games", icon: Gamepad2 },
  { id: "assistant", label: "Private AI", icon: Bot },
  { id: "reading", label: "Reading", icon: BookOpen },
  { id: "security", label: "Security", icon: ShieldCheck },
  { id: "focus", label: "Focus", icon: Leaf },
] as const;

function PrivateOS() {
  const [booting, setBooting] = useState(true);
  const [wallpaper, setWallpaper] = useState<0 | 1>(0);
  const [activeWindow, setActiveWindow] = useState<WindowName>(null);
  const [launcher, setLauncher] = useState(false);
  const [quickMenu, setQuickMenu] = useState(false);
  const [query, setQuery] = useState("");
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const bootTimer = window.setTimeout(() => setBooting(false), 2600);
    const clockTimer = window.setInterval(() => setTime(new Date()), 30000);
    return () => {
      globalThis.clearTimeout(bootTimer);
      globalThis.clearInterval(clockTimer);
    };
  }, []);

  const wallpapers = [mountainAsset.url, cherryAsset.url];
  const dateLabel = useMemo(
    () => time.toLocaleDateString("en-US", { weekday: "long" }).toUpperCase(),
    [time],
  );
  const timeLabel = time.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  const openApp = (id: string) => {
    setLauncher(false);
    setQuickMenu(false);
    if (id === "browser") setActiveWindow("browser");
    if (id === "settings") setActiveWindow("settings");
    if (id === "files") setActiveWindow("files");
  };

  if (booting) return <BootScreen />;

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
      {activeWindow === "browser" && <PrivateBrowser close={() => setActiveWindow(null)} />}
      {activeWindow === "settings" && <WallpaperSettings wallpaper={wallpaper} setWallpaper={setWallpaper} close={() => setActiveWindow(null)} />}
      {activeWindow === "files" && <FilesWindow close={() => setActiveWindow(null)} />}

      <nav aria-label="PRIVATE OS dock" className="soft-glass absolute bottom-3 left-1/2 z-40 flex h-16 max-w-[calc(100%-1rem)] -translate-x-1/2 items-center gap-1.5 rounded-lg px-2 shadow-2xl md:bottom-5 md:gap-2 md:px-3">
        {dockApps.map(({ id, label, icon: Icon, color }) => (
          <OsButton
            key={id}
            label={label}
            onClick={() => id === "launcher" ? setLauncher((value) => !value) : openApp(id)}
            className={`group relative size-11 shrink-0 rounded-md ${color} transition-transform hover:-translate-y-1 md:size-12`}
          >
            <Icon className="size-5 md:size-6" />
            <span className="absolute -top-9 hidden whitespace-nowrap rounded bg-popover px-2 py-1 text-[10px] shadow group-hover:block">{label}</span>
          </OsButton>
        ))}
      </nav>
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
    <section className="glass-panel absolute bottom-24 left-1/2 z-30 flex h-[min(34rem,68vh)] w-[min(45rem,calc(100%-1.5rem))] -translate-x-1/2 flex-col rounded-lg p-4 [animation:window-in_.24s_ease-out] md:p-6">
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

function WindowFrame({ title, icon: Icon, close, children }: { title: string; icon: typeof Globe2; close: () => void; children: React.ReactNode }) {
  return (
    <section className="glass-panel absolute inset-x-2 bottom-24 top-14 z-30 flex flex-col overflow-hidden rounded-lg [animation:window-in_.28s_ease-out] md:inset-x-[8%] md:bottom-24 md:top-16">
      <header className="flex h-12 shrink-0 items-center justify-between border-b border-border px-3">
        <div className="flex items-center gap-2 text-sm font-semibold"><Icon className="size-4 text-primary" />{title}</div>
        <div className="flex gap-1"><OsButton label="Minimize" className="size-8 rounded-md hover:bg-secondary"><Minus className="size-4" /></OsButton><OsButton label="Maximize" className="size-8 rounded-md hover:bg-secondary"><Maximize2 className="size-3.5" /></OsButton><OsButton label="Close" onClick={close} className="size-8 rounded-md hover:bg-destructive"><X className="size-4" /></OsButton></div>
      </header>
      {children}
    </section>
  );
}

function PrivateBrowser({ close }: { close: () => void }) {
  const [address, setAddress] = useState("");
  const [page, setPage] = useState<string | null>(null);
  const browse = () => {
    const value = address.trim();
    if (!value) return;
    const isUrl = /^https?:\/\//i.test(value) || /^[\w-]+\.[a-z]{2,}/i.test(value);
    setPage(isUrl ? (value.startsWith("http") ? value : `https://${value}`) : `https://search.brave.com/search?q=${encodeURIComponent(value)}`);
  };
  return (
    <WindowFrame title="PRIVATE Browser" icon={Globe2} close={close}>
      <div className="flex h-12 shrink-0 items-center gap-1.5 border-b border-border bg-background/40 px-2">
        <OsButton label="Back" className="size-8 rounded-md hover:bg-secondary"><ArrowLeft className="size-4" /></OsButton><OsButton label="Forward" className="size-8 rounded-md hover:bg-secondary"><ArrowRight className="size-4" /></OsButton><OsButton label="Reload" onClick={() => setPage((current) => current ? `${current}${current.includes("?") ? "&" : "?"}r=${Date.now()}` : current)} className="size-8 rounded-md hover:bg-secondary"><RefreshCw className="size-4" /></OsButton>
        <form onSubmit={(event) => { event.preventDefault(); browse(); }} className="flex h-9 flex-1 items-center gap-2 rounded-md border border-border bg-input px-3"><LockKeyhole className="size-3.5 text-primary" /><input aria-label="Search or enter address" value={address} onChange={(event) => setAddress(event.target.value)} placeholder="Search privately or enter an address" className="min-w-0 flex-1 bg-transparent text-xs outline-none" /></form>
        <OsButton label="Browser menu" className="size-8 rounded-md hover:bg-secondary"><Menu className="size-4" /></OsButton>
      </div>
      <div className="relative flex-1 overflow-hidden bg-background">
        {page ? <iframe title="PRIVATE Browser page" src={page} className="size-full border-0 bg-background" sandbox="allow-forms allow-scripts allow-same-origin allow-popups" /> : (
          <div className="flex size-full flex-col items-center justify-center px-5 text-center">
            <div className="flex size-16 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-xl"><ShieldCheck className="size-8" /></div>
            <h2 className="mt-5 text-2xl font-semibold">Browse without being followed.</h2>
            <p className="mt-2 max-w-md text-sm text-muted-foreground">PRIVATE Browser opens searches through Brave Search. Some websites may choose to open in a separate tab.</p>
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
}