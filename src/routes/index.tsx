import { createFileRoute } from "@tanstack/react-router";
import { createContext, useContext, useEffect, useMemo, useRef, useState, type ComponentType, type ReactNode } from "react";
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
  LayoutGrid,
  LockKeyhole,
  Maximize,
  Maximize2,
  Minimize,
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
    links: [
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Orbitron:wght@500;700&family=Rajdhani:wght@500;700&display=swap" },
    ],
  }),
  component: PrivateOS,
});

type WindowName = "browser" | "figure" | "settings" | "files" | "minecraft" | null;

const CHERRION_URL = "https://cherrion.top/";
const FIGURE_CLOUD_URL = "https://figure-cloud.figure-softwares.workers.dev/";
const MINECRAFT_URL = "https://eaglercraft.com/play?version=modpack-ultimate-wasm";

type IconComponent = ComponentType<{ className?: string }>;

function PrivateBrowserIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={`drop-shadow-[0_2px_3px_rgb(0_0_0/.45)] ${className ?? ""}`} aria-hidden="true">
      <defs>
        <linearGradient id="private-browser-gradient" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#6fdc8c" />
          <stop offset="1" stopColor="#e0a43c" />
        </linearGradient>
        <linearGradient id="private-browser-gloss" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffffff" stopOpacity=".4" />
          <stop offset=".55" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>
      </defs>
      <rect x=".5" y=".5" width="31" height="31" rx="7.2" fill="url(#private-browser-gradient)" />
      <rect x=".5" y=".5" width="31" height="31" rx="7.2" fill="url(#private-browser-gloss)" />
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

const GLYPH_WHITE = "[&>svg]:size-[56%] [&>svg]:text-white";

// macOS-style app icon: rounded square, soft gradient, glossy top edge and a gentle shadow.
function Tile({ className = "", tone, glyph = GLYPH_WHITE, children }: { className?: string | undefined; tone: string; glyph?: string; children: ReactNode }) {
  return (
    <span className={`relative grid shrink-0 place-items-center overflow-hidden rounded-[22.5%] bg-gradient-to-b shadow-[inset_0_1px_0_rgb(255_255_255/.45),inset_0_-1px_0_rgb(0_0_0/.25),0_2px_5px_rgb(0_0_0/.45)] [&>svg]:relative ${glyph} ${tone} ${className}`}>
      <span className="pointer-events-none absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/30 to-transparent" />
      {children}
    </span>
  );
}

const CloudIcon: IconComponent = ({ className }) => <Tile tone="from-sky-300 to-blue-600" className={className}><Cloud className="fill-white" /></Tile>;
const CherryIcon: IconComponent = ({ className }) => <Tile tone="from-rose-400 to-red-700" className={className}><Cherry /></Tile>;
const FolderIcon: IconComponent = ({ className }) => <Tile tone="from-sky-400 to-blue-600" className={className}><Folder className="fill-white/90" /></Tile>;
const SettingsIcon: IconComponent = ({ className }) => <Tile tone="from-zinc-400 to-zinc-700" glyph="[&>svg]:size-[60%] [&>svg]:text-zinc-100" className={className}><Settings /></Tile>;

function GrassBlock() {
  return (
    <svg viewBox="0 0 32 32" aria-hidden="true">
      <polygon points="16,3 28,9.5 16,16 4,9.5" fill="#6cb04a" />
      <polygon points="4,9.5 16,16 16,29.5 4,23" fill="#8a5a33" />
      <polygon points="16,16 28,9.5 28,23 16,29.5" fill="#6e4526" />
      <polygon points="4,9.5 16,16 16,19.5 4,13" fill="#5a9a3a" />
      <polygon points="16,16 28,9.5 28,13 16,19.5" fill="#478a2c" />
      <polygon points="16,6 18.2,7.2 16,8.4 13.8,7.2" fill="#82c25a" />
      <polygon points="20,10 22.2,11.2 20,12.4 17.8,11.2" fill="#5a9a3a" />
      <polygon points="11,10.4 13.2,11.6 11,12.8 8.8,11.6" fill="#82c25a" />
      <polygon points="6.5,19 9,20.3 9,23 6.5,21.7" fill="#6e4526" />
      <polygon points="23,20.3 25.5,19 25.5,21.7 23,23" fill="#5a381f" />
      <path d="M16 3L28 9.5V23L16 29.5 4 23V9.5Z" fill="none" stroke="#1e1e1e" strokeOpacity=".55" strokeWidth=".6" strokeLinejoin="round" />
    </svg>
  );
}

// Uses /minecraft-icon.png when you add one to the public folder, otherwise the grass-block icon.
function MinecraftIcon({ className }: { className?: string }) {
  const [custom, setCustom] = useState(false);
  useEffect(() => {
    const probe = new Image();
    probe.onload = () => setCustom(true);
    probe.src = "/minecraft-icon.png";
  }, []);
  if (custom) return <img src="/minecraft-icon.png" alt="" draggable={false} className={`rounded-[22.5%] object-cover ${className ?? ""}`} />;
  return <Tile tone="from-zinc-600 to-zinc-900" glyph="[&>svg]:size-[76%]" className={className}><GrassBlock /></Tile>;
}

const dockApps: { id: string; label: string; icon: IconComponent }[] = [
  { id: "browser", label: "PRIVATE Browser", icon: PrivateBrowserIcon },
  { id: "figure", label: "Figure Cloud", icon: CloudIcon },
  { id: "minecraft", label: "Minecraft", icon: MinecraftIcon },
  { id: "files", label: "Files", icon: FolderIcon },
  { id: "settings", label: "Settings", icon: SettingsIcon },
];

const launcherApps: { id: string; label: string; icon: IconComponent }[] = [
  { id: "browser", label: "Private Browser", icon: PrivateBrowserIcon },
  { id: "figure", label: "Figure Cloud", icon: CloudIcon },
  { id: "cherrion", label: "Cherrion", icon: CherryIcon },
  { id: "minecraft", label: "Minecraft", icon: MinecraftIcon },
  { id: "files", label: "Private Files", icon: FolderIcon },
  { id: "settings", label: "Settings", icon: SettingsIcon },
];

type WallpaperOption = { label: string; thumb: string; video?: string; src?: string };

const wallpaperOptions: WallpaperOption[] = [
  { label: "Snowy Campfire", thumb: "/wallpaper-poster.jpg", video: "/wallpaper.mp4" },
  { label: "Alpine Lake", thumb: mountainAsset.url, src: mountainAsset.url },
  { label: "Cherry Village", thumb: cherryAsset.url, src: cherryAsset.url },
];

// Morocco moved to permanent GMT (UTC+0) on 20 Sep 2026. Some browsers still carry the old
// time-zone rules (UTC+1), so those zones are pinned to the real offset.
const MOROCCO_GMT_FROM = Date.UTC(2026, 8, 20, 1, 0, 0);

function clockZone(date: Date) {
  let zone = "UTC";
  try {
    zone = Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
  } catch {
    // keep UTC
  }
  if ((zone === "Africa/Casablanca" || zone === "Africa/El_Aaiun") && date.getTime() >= MOROCCO_GMT_FROM) return "UTC";
  return zone;
}

function PrivateOS() {
  const [phase, setPhase] = useState<"start" | "boot" | "desktop">("start");
  const [minimized, setMinimized] = useState(false);
  const [wallpaper, setWallpaper] = useState(0);
  const [locked, setLocked] = useState(true);
  const [activeWindow, setActiveWindow] = useState<WindowName>(null);
  const [launcher, setLauncher] = useState(false);
  const [quickMenu, setQuickMenu] = useState(false);
  const [query, setQuery] = useState("");
  const [browserStart, setBrowserStart] = useState<string | null>(null);
  const [time, setTime] = useState(new Date());
  const [fullscreen, setFullscreen] = useState(false);
  const [canFullscreen, setCanFullscreen] = useState(false);

  useEffect(() => {
    const clockTimer = window.setInterval(() => {
      setTime((previous) => {
        const next = new Date();
        return Math.floor(next.getTime() / 60000) === Math.floor(previous.getTime() / 60000) ? previous : next;
      });
    }, 1000);
    return () => globalThis.clearInterval(clockTimer);
  }, []);

  useEffect(() => {
    setCanFullscreen(Boolean(document.fullscreenEnabled));
    const onChange = () => setFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
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

  useEffect(() => {
    if (phase !== "desktop" || !locked) return;
    const onKey = (event: KeyboardEvent) => {
      if (!event.repeat) setLocked(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [phase, locked]);

  const zone = clockZone(time);
  const dateLabel = useMemo(
    () => time.toLocaleDateString("en-US", { weekday: "long", timeZone: zone }).toUpperCase(),
    [time, zone],
  );
  const timeLabel = time.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", timeZone: zone });
  const lockDate = `${time.toLocaleDateString("en-GB", { day: "numeric", month: "long", timeZone: zone }).toUpperCase()}, ${time.toLocaleDateString("en-GB", { year: "numeric", timeZone: zone })}.`;
  const lockTime = time.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", hour12: false, timeZone: zone });

  const toggleFullscreen = () => {
    if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
    else document.documentElement.requestFullscreen().catch(() => {});
  };

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
    if (id === "minecraft") setActiveWindow("minecraft");
  };

  if (phase === "start") return <StartScreen onStart={() => setPhase("boot")} />;
  if (phase === "boot") return <BootScreen />;

  return (
    <main className="relative h-dvh w-full overflow-hidden bg-background font-sans text-foreground [animation:desktop-in_.8s_ease-out]">
      <Wallpaper index={wallpaper} />
      <div className="absolute inset-0 bg-gradient-to-b from-background/20 via-transparent to-background/35" />

      <div className="absolute inset-x-0 bottom-3 z-40 mx-auto flex w-max max-w-[calc(100%-1rem)] flex-wrap items-center justify-center gap-1.5 md:bottom-4 md:gap-2">
        <nav aria-label="PRIVATE OS dock" className="flex items-center gap-1.5 rounded-2xl bg-black/35 px-2 py-1.5 backdrop-blur-xl md:gap-3 md:px-4">
          <OsButton label="PRIVATE OS home" onClick={() => { closeWindow(); setLauncher(false); }} className="group relative size-6 shrink-0 transition-transform hover:-translate-y-0.5 md:size-7">
            <ShieldCheck className="size-5 text-white" />
            <span className="absolute bottom-9 left-0 z-50 hidden whitespace-nowrap rounded bg-popover px-2 py-1 text-[10px] shadow group-hover:block">PRIVATE OS</span>
          </OsButton>
          <OsButton label="Apps" onClick={() => setLauncher((value) => !value)} className="group relative size-6 shrink-0 transition-transform hover:-translate-y-0.5 md:size-7">
            <LayoutGrid className="size-5 text-white/70" />
            <span className="absolute bottom-9 left-0 z-50 hidden whitespace-nowrap rounded bg-popover px-2 py-1 text-[10px] shadow group-hover:block">Apps</span>
          </OsButton>
          {dockApps.map(({ id, label, icon: Icon }) => (
            <OsButton key={id} label={label} onClick={() => openApp(id)} className="group relative size-6 shrink-0 transition-transform hover:-translate-y-0.5 md:size-7">
              <Icon className="size-6 md:size-7" />
              <span className="absolute bottom-9 left-0 z-50 hidden whitespace-nowrap rounded bg-popover px-2 py-1 text-[10px] shadow group-hover:block">{label}</span>
              {activeWindow === id && <span className="absolute -bottom-1 size-1 rounded-full bg-white" />}
            </OsButton>
          ))}
        </nav>

        <div className="flex h-9 items-center gap-2 rounded-2xl bg-black/35 px-2.5 text-xs font-medium tabular-nums text-white backdrop-blur-xl md:h-10 md:gap-3 md:px-3">
          <button type="button" onClick={() => setQuickMenu((value) => !value)} aria-label="Open quick settings" className="flex items-center gap-2 rounded-md outline-none focus-visible:ring-2 focus-visible:ring-ring md:gap-3">
            <Signal className="hidden size-3.5 md:block" />
            <Wifi className="size-3.5" />
            <BatteryFull className="size-4" />
            <span>{timeLabel}</span>
          </button>
          {canFullscreen && (
            <OsButton label={fullscreen ? "Exit full screen" : "Full screen"} onClick={toggleFullscreen} className="size-6 shrink-0 rounded-md hover:bg-white/15">
              {fullscreen ? <Minimize className="size-4" /> : <Maximize className="size-4" />}
            </OsButton>
          )}
        </div>
      </div>

      <section className="absolute inset-x-0 top-[14%] z-10 text-center drop-shadow-lg">
        <p className="font-['Rajdhani',sans-serif] text-lg font-bold tracking-[.35em] text-foreground/90">{dateLabel}</p>
        <h1 className="mt-3 font-['Orbitron',sans-serif] text-4xl font-medium tabular-nums tracking-[.12em] md:text-6xl">{timeLabel}</h1>
        <p className="mt-3 text-xs text-foreground/70">Your space. Your rules.</p>
      </section>

      {quickMenu && (
        <aside className="glass-panel absolute inset-x-0 bottom-16 z-50 mx-auto w-[min(22rem,calc(100%-1.5rem))] rounded-lg p-4 [animation:window-in_.22s_ease-out] md:bottom-[4.5rem]">
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
        {activeWindow === "minecraft" && <MinecraftApp close={closeWindow} />}
      </WindowContext.Provider>


      <LockScreen locked={locked} unlock={() => setLocked(false)} day={dateLabel} date={lockDate} clock={lockTime} />
    </main>
  );
}

function Wallpaper({ index }: { index: number }) {
  const item = wallpaperOptions[index] ?? wallpaperOptions[0]!;
  const [failed, setFailed] = useState(false);
  useEffect(() => setFailed(false), [index]);
  if (item.video && !failed) {
    return <video key={item.video} src={item.video} poster={item.thumb} autoPlay loop muted playsInline preload="auto" onError={() => setFailed(true)} aria-label={`${item.label} wallpaper`} className="absolute inset-0 size-full object-cover" />;
  }
  if (item.src) return <img src={item.src} alt={`${item.label} wallpaper`} className="absolute inset-0 size-full object-cover" />;
  return <div className="absolute inset-0 bg-[linear-gradient(to_bottom,#0d1b2a,#1b3a4b_55%,#5c7f8a)]" />;
}

function LockScreen({ locked, unlock, day, date, clock }: { locked: boolean; unlock: () => void; day: string; date: string; clock: string }) {
  return (
    <div
      role="button"
      tabIndex={locked ? 0 : -1}
      aria-hidden={!locked}
      aria-label="Unlock PRIVATE OS"
      onClick={unlock}
      className={`absolute inset-0 z-[60] flex cursor-pointer flex-col items-center bg-gradient-to-b from-black/80 via-black/65 to-black/85 pt-[24dvh] text-center font-['Rajdhani',sans-serif] text-[#f4ecd6] transition-all duration-700 [text-shadow:0_2px_18px_rgb(0_0_0/.55)] ${locked ? "" : "pointer-events-none -translate-y-8 opacity-0"}`}
    >
      <p className="pl-[.2em] text-[clamp(2rem,10.5vw,7.5rem)] font-medium leading-none tracking-[.2em]">{day}</p>
      <p className="mt-5 pl-[.22em] text-sm font-bold tracking-[.22em] sm:text-xl">{date}</p>
      <p className="mt-4 pl-[.18em] font-['Orbitron',sans-serif] text-[clamp(1.5rem,7vw,3rem)] font-bold leading-none tracking-[.18em] text-[#f4ecd6]">{clock}</p>
      <p className="absolute bottom-8 pl-[.3em] text-[11px] font-medium tracking-[.3em] text-white/60">TAP OR PRESS ANY KEY TO UNLOCK</p>
    </div>
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
    <section className="glass-panel absolute inset-x-0 bottom-16 z-30 mx-auto flex h-[min(34rem,calc(100dvh-6rem))] w-[min(45rem,calc(100%-1.5rem))] flex-col rounded-lg p-4 [animation:window-in_.24s_ease-out] md:bottom-[4.5rem] md:p-6">
      <div className="flex items-center gap-3">
        <div className="flex flex-1 items-center gap-2 rounded-md border border-border bg-input px-3"><Search className="size-4 text-muted-foreground" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search apps" className="h-10 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground" /></div>
        <OsButton label="Close launcher" onClick={close} className="size-10 rounded-md hover:bg-secondary"><X className="size-5" /></OsButton>
      </div>
      <p className="mb-4 mt-5 text-xs font-semibold uppercase text-muted-foreground">All applications</p>
      <div className="grid flex-1 grid-cols-3 gap-3 overflow-auto sm:grid-cols-4 md:grid-cols-6">
        {filtered.map(({ id, label, icon: Icon }) => (
          <OsButton key={id} label={`Open ${label}`} onClick={() => openApp(id)} className="flex min-h-24 flex-col gap-2 rounded-md p-2 transition-colors hover:bg-secondary">
            <Icon className="size-12" /><span className="text-center text-[11px] leading-tight">{label}</span>
          </OsButton>
        ))}
      </div>
      <ChevronDown className="mx-auto mt-3 size-4 text-muted-foreground" />
    </section>
  );
}

function WindowFrame({ title, icon: Icon, close, children, app = false, startMaximized = false, actions }: { title: string; icon: IconComponent; close: () => void; children: React.ReactNode; app?: boolean; startMaximized?: boolean; actions?: ReactNode }) {
  const { minimized, minimize } = useContext(WindowContext);
  const [maximized, setMaximized] = useState(startMaximized);
  const toggleMaximize = () => setMaximized((value) => !value);
  const surface = app ? (maximized ? "bg-black" : "border border-white/10 bg-black shadow-2xl") : maximized ? "bg-card/95 backdrop-blur-xl" : "glass-panel";
  const position = maximized ? "inset-x-0 top-0 bottom-14 rounded-none md:bottom-[4.5rem]" : "inset-x-2 top-3 bottom-16 rounded-lg md:inset-x-[8%] md:top-6 md:bottom-20";
  return (
    <section className={`absolute z-30 flex flex-col overflow-hidden [animation:window-in_.28s_ease-out] ${surface} ${minimized ? "hidden" : ""} ${position}`}>
      {app ? (
        <header className="relative flex h-9 shrink-0 items-center border-b border-white/10 bg-[#202020] px-2">
          <div className="flex items-center">
            <button type="button" aria-label="Close" onClick={close} className="grid size-6 place-items-center outline-none"><span className="size-3 rounded-full bg-[#ff5f57]" /></button>
            <button type="button" aria-label="Minimize" onClick={minimize} className="grid size-6 place-items-center outline-none"><span className="size-3 rounded-full bg-[#febc2e]" /></button>
            <button type="button" aria-label={maximized ? "Restore" : "Maximize"} onClick={toggleMaximize} className="grid size-6 place-items-center outline-none"><span className="size-3 rounded-full bg-[#28c840]" /></button>
          </div>
          <div className="pointer-events-none absolute inset-x-0 flex items-center justify-center gap-2 text-xs font-semibold text-white/80"><Icon className="size-4" />{title}</div>
          <div className="relative z-10 ml-auto flex items-center text-white/70">{actions}</div>
        </header>
      ) : (
        <header className="flex h-12 shrink-0 items-center justify-between border-b border-border px-3">
          <div className="flex items-center gap-2 text-sm font-semibold"><Icon className="size-4 text-primary" />{title}</div>
          <div className="flex gap-1">
            <OsButton label="Minimize" onClick={minimize} className="size-8 rounded-md hover:bg-secondary"><Minus className="size-4" /></OsButton>
            <OsButton label={maximized ? "Restore" : "Maximize"} onClick={toggleMaximize} className="size-8 rounded-md hover:bg-secondary">{maximized ? <Minimize2 className="size-3.5" /> : <Maximize2 className="size-3.5" />}</OsButton>
            <OsButton label="Close" onClick={close} className="size-8 rounded-md hover:bg-destructive"><X className="size-4" /></OsButton>
          </div>
        </header>
      )}
      {children}
    </section>
  );
}

function MinecraftApp({ close }: { close: () => void }) {
  const [source, setSource] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Open the game directly when the site allows it; otherwise load it through the page loader.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      let direct = true;
      try {
        const response = await fetch(`/api/proxy?check=1&url=${encodeURIComponent(MINECRAFT_URL)}`);
        const info = (await response.json()) as { frameable?: boolean | null };
        if (info.frameable === false) direct = false;
      } catch {
        // assume the site can be opened directly
      }
      if (!cancelled) setSource(direct ? MINECRAFT_URL : `/api/proxy?url=${encodeURIComponent(MINECRAFT_URL)}`);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const openOutside = (
    <button type="button" aria-label="Open Minecraft in a new tab" onClick={() => window.open(MINECRAFT_URL, "_blank", "noopener,noreferrer")} className="grid size-6 place-items-center rounded outline-none hover:bg-white/10">
      <ExternalLink className="size-3.5" />
    </button>
  );

  return (
    <WindowFrame title="Minecraft" icon={MinecraftIcon} close={close} app startMaximized actions={openOutside}>
      <div className="relative flex-1 overflow-hidden bg-black">
        {loading && (
          <div className="absolute inset-0 z-10 grid place-items-center bg-[#171717]">
            <div className="text-center">
              <MinecraftIcon className="mx-auto size-20" />
              <p className="mt-5 text-sm font-bold tracking-[.3em] text-white">MINECRAFT</p>
              <p className="mt-1 text-[11px] text-white/50">Launching game…</p>
              <div className="mx-auto mt-5 h-1 w-44 overflow-hidden rounded-full bg-white/10"><div className="h-full origin-left bg-[#3fae4b] [animation:boot-bar_2.2s_ease-in-out_forwards]" /></div>
            </div>
          </div>
        )}
        {source && (
          <iframe
            title="Minecraft"
            src={source}
            onLoad={() => setLoading(false)}
            className="size-full border-0 bg-black"
            allow="fullscreen; autoplay; clipboard-read; clipboard-write; gamepad; microphone; pointer-lock; keyboard-map"
            sandbox="allow-forms allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox allow-modals allow-pointer-lock allow-downloads allow-presentation allow-orientation-lock"
          />
        )}
      </div>
    </WindowFrame>
  );
}

const DIRECT_HOSTS = ["cherrion.top"];
const DIRECT_SANDBOX = "allow-forms allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox allow-downloads allow-modals allow-presentation";
const PROXY_SANDBOX = "allow-forms allow-scripts allow-popups allow-popups-to-escape-sandbox allow-downloads allow-modals allow-presentation";

function frameSource(url: string) {
  try {
    const { hostname } = new URL(url);
    if (DIRECT_HOSTS.some((host) => hostname === host || hostname.endsWith(`.${host}`))) return { src: url, direct: true };
  } catch {
    // fall through to the page loader
  }
  return { src: `/api/proxy?url=${encodeURIComponent(url)}`, direct: false };
}

function PrivateBrowser({ initialUrl, close }: { initialUrl: string | null; close: () => void }) {
  const [address, setAddress] = useState(initialUrl ?? "");
  const [nav, setNav] = useState<{ list: string[]; index: number }>({ list: initialUrl ? [initialUrl] : [], index: initialUrl ? 0 : -1 });
  const [frameTarget, setFrameTarget] = useState<string | null>(initialUrl);
  const [frameKey, setFrameKey] = useState(0);
  const [loading, setLoading] = useState(Boolean(initialUrl));
  const frameRef = useRef<HTMLIFrameElement>(null);
  const pending = useRef(true);
  const page = nav.index >= 0 ? nav.list[nav.index] : null;

  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      if (event.source !== frameRef.current?.contentWindow) return;
      const url = (event.data as { privateNav?: unknown } | null)?.privateNav;
      if (typeof url !== "string" || !/^https?:\/\//i.test(url)) return;
      const replace = pending.current;
      pending.current = false;
      setNav((current) => {
        if (current.list[current.index] === url) return current;
        if (replace && current.index >= 0) {
          const list = [...current.list];
          list[current.index] = url;
          return { list, index: current.index };
        }
        return { list: [...current.list.slice(0, current.index + 1), url], index: current.index + 1 };
      });
      setAddress(url);
      setLoading(false);
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  const show = (url: string) => {
    pending.current = true;
    setFrameTarget(url);
    setFrameKey((value) => value + 1);
    setAddress(url);
    setLoading(true);
  };

  const navigateTo = (value: string) => {
    const clean = value.trim();
    if (!clean) return;
    const isUrl = /^https?:\/\//i.test(clean) || /^(localhost|[\w-]+\.[a-z]{2,})([/:?#]|$)/i.test(clean);
    const destination = isUrl ? (/^https?:\/\//i.test(clean) ? clean : `https://${clean}`) : `https://search.brave.com/search?q=${encodeURIComponent(clean)}`;
    setNav((current) => ({ list: [...current.list.slice(0, current.index + 1), destination], index: current.index + 1 }));
    show(destination);
  };

  const moveHistory = (direction: -1 | 1) => {
    const next = nav.index + direction;
    const nextPage = nav.list[next];
    if (!nextPage) return;
    setNav({ list: nav.list, index: next });
    show(nextPage);
  };

  const frame = frameTarget ? frameSource(frameTarget) : null;
  return (
    <WindowFrame title="PRIVATE Browser" icon={PrivateBrowserIcon} close={close}>
      <div className="flex h-12 shrink-0 items-center gap-1.5 border-b border-border bg-background/40 px-2">
        <OsButton label="Back" disabled={nav.index <= 0} onClick={() => moveHistory(-1)} className="size-8 rounded-md hover:bg-secondary disabled:opacity-30"><ArrowLeft className="size-4" /></OsButton><OsButton label="Forward" disabled={nav.index >= nav.list.length - 1} onClick={() => moveHistory(1)} className="size-8 rounded-md hover:bg-secondary disabled:opacity-30"><ArrowRight className="size-4" /></OsButton><OsButton label="Reload" disabled={!page} onClick={() => { if (page) show(page); }} className="hidden size-8 rounded-md hover:bg-secondary disabled:opacity-30 sm:inline-flex"><RefreshCw className="size-4" /></OsButton>
        <form onSubmit={(event) => { event.preventDefault(); navigateTo(address); }} className="flex h-9 min-w-0 flex-1 items-center gap-2 rounded-md border border-border bg-input px-2 sm:px-3"><LockKeyhole className="size-3.5 shrink-0 text-primary" /><input aria-label="Search or enter address" value={address} onChange={(event) => setAddress(event.target.value)} placeholder="Search or enter address" className="min-w-0 flex-1 bg-transparent text-xs outline-none" /></form>
        <OsButton label="Open this page in a new tab" disabled={!page} onClick={() => page && window.open(page, "_blank", "noopener,noreferrer")} className="size-8 rounded-md hover:bg-secondary disabled:opacity-30"><ExternalLink className="size-4" /></OsButton>
      </div>
      <div className="relative flex-1 overflow-hidden bg-background">
        {frame ? <>
          {loading && <div className="absolute inset-0 z-10 grid place-items-center bg-background/80"><div className="text-center"><RefreshCw className="mx-auto size-6 animate-spin text-primary" /><p className="mt-3 text-xs text-muted-foreground">Opening securely…</p></div></div>}
          <iframe ref={frameRef} key={frameKey} title="PRIVATE Browser page" src={frame.src} onLoad={() => setLoading(false)} className="size-full border-0 bg-background" sandbox={frame.direct ? DIRECT_SANDBOX : PROXY_SANDBOX} />
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

function WallpaperSettings({ wallpaper, setWallpaper, close }: { wallpaper: number; setWallpaper: (value: number) => void; close: () => void }) {
  return (
    <WindowFrame title="Appearance" icon={Settings} close={close}>
      <div className="flex-1 overflow-auto p-5 md:p-8">
        <h2 className="text-xl font-semibold">Choose your landscape</h2><p className="mt-1 text-sm text-muted-foreground">Changes appear instantly across your home screen.</p>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {wallpaperOptions.map((item, index) => (
            <OsButton key={item.label} label={`Use ${item.label} wallpaper`} onClick={() => setWallpaper(index)} className={`group relative aspect-video overflow-hidden rounded-md border-2 ${wallpaper === index ? "border-primary" : "border-border"}`}>
              <img src={item.thumb} alt={item.label} onError={(event) => { event.currentTarget.style.visibility = "hidden"; }} className="size-full object-cover transition-transform group-hover:scale-105" /><span className="absolute inset-x-0 bottom-0 bg-background/75 p-3 text-left text-xs font-semibold backdrop-blur-md">{item.label}{wallpaper === index && <span className="float-right text-primary">Selected</span>}</span>
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
