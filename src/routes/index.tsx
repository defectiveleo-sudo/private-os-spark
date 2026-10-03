import { createFileRoute } from "@tanstack/react-router";
import { Component } from "react";
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
  Calculator,
  Hexagon,
  StickyNote,
  Terminal,
  Activity,
  Download,
  Upload,
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

const CHERRION_URL = "https://cherrion.top/";
const FIGURE_CLOUD_URL = "https://figure-cloud.figure-softwares.workers.dev/";
const BEEZ_URL = "https://beez.beez-softwares.workers.dev/";
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

const WindowContext = createContext<{ minimized: boolean; minimize: () => void; focus: () => void; z: number }>({ minimized: false, minimize: () => {}, focus: () => {}, z: 10 });

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
const BeeZIcon: IconComponent = ({ className }) => <Tile tone="from-amber-300 to-yellow-600" glyph="[&>svg]:size-[62%] [&>svg]:text-zinc-900" className={className}><Hexagon className="fill-zinc-900/25" /></Tile>;
const NotesIcon: IconComponent = ({ className }) => <Tile tone="from-yellow-300 to-orange-500" glyph="[&>svg]:size-[56%] [&>svg]:text-white" className={className}><StickyNote /></Tile>;
const CalcIcon: IconComponent = ({ className }) => <Tile tone="from-zinc-500 to-zinc-800" className={className}><Calculator /></Tile>;
const TerminalIcon: IconComponent = ({ className }) => <Tile tone="from-zinc-700 to-black" glyph="[&>svg]:size-[56%] [&>svg]:text-green-400" className={className}><Terminal /></Tile>;

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

const TaskIcon: IconComponent = ({ className }) => <Tile tone="from-emerald-400 to-teal-700" glyph="[&>svg]:size-[56%] [&>svg]:text-white" className={className}><Activity /></Tile>;

const dockApps: { id: string; label: string; icon: IconComponent }[] = [
  { id: "browser", label: "PRIVATE Browser", icon: PrivateBrowserIcon },
  { id: "figure", label: "Figure Cloud", icon: CloudIcon },
  { id: "beez", label: "BeeZ", icon: BeeZIcon },
  { id: "minecraft", label: "Minecraft", icon: MinecraftIcon },
  { id: "files", label: "Files", icon: FolderIcon },
  { id: "settings", label: "Settings", icon: SettingsIcon },
];

const launcherApps: { id: string; label: string; icon: IconComponent }[] = [
  { id: "browser", label: "Private Browser", icon: PrivateBrowserIcon },
  { id: "figure", label: "Figure Cloud", icon: CloudIcon },
  { id: "beez", label: "BeeZ", icon: BeeZIcon },
  { id: "cherrion", label: "Cherrion", icon: CherryIcon },
  { id: "minecraft", label: "Minecraft", icon: MinecraftIcon },
  { id: "files", label: "Private Files", icon: FolderIcon },
  { id: "notes", label: "Notes", icon: NotesIcon },
  { id: "calc", label: "Calculator", icon: CalcIcon },
  { id: "terminal", label: "Terminal", icon: TerminalIcon },
  { id: "taskmgr", label: "Task Manager", icon: TaskIcon },
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
  const [wallpaper, setWallpaper] = useState(0);
  const [locked, setLocked] = useState(true);
  const [openWins, setOpenWins] = useState<string[]>([]);
  const [minWins, setMinWins] = useState<string[]>([]);
  const [launcher, setLauncher] = useState(false);
  const [quickMenu, setQuickMenu] = useState(false);
  const [query, setQuery] = useState("");
  const [browserStart, setBrowserStart] = useState<string | null>(null);
  const [time, setTime] = useState(new Date());
  const [fullscreen, setFullscreen] = useState(false);
  const [canFullscreen, setCanFullscreen] = useState(false);
  const [menu, setMenu] = useState<{ x: number; y: number } | null>(null);
  const [zOrder, setZOrder] = useState<string[]>([]);
  const [startMenu, setStartMenu] = useState(false);
  const [startPos, setStartPos] = useState<{ left: number; bottom: number } | null>(null);
  const wallInput = useRef<HTMLInputElement>(null);
  const [power, setPower] = useState<"on" | "sleep" | "off">("on");
  const [settings, setSettings] = useState<OsSettings>(DEFAULT_SETTINGS);
  const [customWalls, setCustomWalls] = useState<{ id: number; label: string; url: string }[]>([]);

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
  const timeLabel = time.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: !settings.clock24, timeZone: zone });
  const lockDate = `${time.toLocaleDateString("en-GB", { day: "numeric", month: "long", timeZone: zone }).toUpperCase()}, ${time.toLocaleDateString("en-GB", { year: "numeric", timeZone: zone })}.`;
  const lockTime = time.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", hour12: !settings.clock24, timeZone: zone });

  const toggleFullscreen = () => {
    if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
    else document.documentElement.requestFullscreen().catch(() => {});
  };

  useEffect(() => {
    try {
      const saved = Number(localStorage.getItem("pos-wallpaper"));
      if (Number.isInteger(saved) && saved >= 0 && saved < 100) setWallpaper(saved);
    } catch {
      // storage unavailable
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem("pos-wallpaper", String(wallpaper));
    } catch {
      // storage unavailable
    }
  }, [wallpaper]);

  const patchSettings = (patch: Partial<OsSettings> | ((current: OsSettings) => Partial<OsSettings>)) =>
    setSettings((current) => {
      const next = { ...current, ...(typeof patch === "function" ? patch(current) : patch) };
      try {
        localStorage.setItem("pos-settings", JSON.stringify(next));
      } catch {
        // storage unavailable
      }
      return next;
    });

  const refreshWalls = async () => {
    const list = await loadWalls();
    setCustomWalls(list.map((item) => ({ id: item.id, label: item.label, url: URL.createObjectURL(item.blob) })));
    return list.length;
  };

  useEffect(() => {
    try {
      const raw = localStorage.getItem("pos-settings");
      if (raw) setSettings({ ...DEFAULT_SETTINGS, ...(JSON.parse(raw) as Partial<OsSettings>) });
    } catch {
      // storage unavailable
    }
    refreshWalls().catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (power === "on") return;
    const wake = () => {
      setPower("on");
      setLocked(true);
      if (power === "off") setPhase("boot");
    };
    window.addEventListener("keydown", wake);
    return () => window.removeEventListener("keydown", wake);
  }, [power]);

  const addWall = async (file: File) => {
    try {
      const bitmap = await createImageBitmap(file);
      const scale = Math.min(1, 2200 / bitmap.width);
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(bitmap.width * scale);
      canvas.height = Math.round(bitmap.height * scale);
      canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
      const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.88));
      if (!blob) throw new Error("encode failed");
      await saveWall(file.name.replace(/\.[^.]+$/, ""), blob);
      const count = await refreshWalls();
      setWallpaper(wallpaperOptions.length + count - 1);
    } catch {
      window.alert("Couldn't add that image.");
    }
  };

  const removeWall = async (id: number) => {
    await deleteWall(id);
    await refreshWalls();
    setWallpaper(0);
  };

  const allWalls: WallpaperOption[] = [...wallpaperOptions, ...customWalls.map((wall) => ({ label: wall.label, thumb: wall.url, src: wall.url }))];

  const closeWindow = (id: string) => {
    setOpenWins((list) => list.filter((item) => item !== id));
    setMinWins((list) => list.filter((item) => item !== id));
    setZOrder((list) => list.filter((item) => item !== id));
  };

  // DOM order of windows never changes (moving an iframe in the DOM would reload it); only z-index does.
  const raise = (id: string) => setZOrder((list) => (list[list.length - 1] === id ? list : [...list.filter((item) => item !== id), id]));

  const openApp = (id: string) => {
    setLauncher(false);
    setQuickMenu(false);
    const key = id === "cherrion" ? "browser" : id;
    if (id === "cherrion") setBrowserStart(CHERRION_URL);
    setMinWins((list) => list.filter((item) => item !== key));
    setOpenWins((list) => (list.includes(key) ? list : [...list, key]));
    raise(key);
  };

  const startItems: [string, () => void][] = [
    ["Show desktop", () => setMinWins(openWins)],
    ["Lock", () => setLocked(true)],
    ["Sleep", () => setPower("sleep")],
    ["Restart", () => window.location.reload()],
    ["Shut down", () => { setOpenWins([]); setMinWins([]); setZOrder([]); setPower("off"); }],
  ];

  const menuItems: [string, () => void][] = [
    ["Change wallpaper", () => setWallpaper((index) => (index + 1) % allWalls.length)],
    ["Add wallpaper…", () => wallInput.current?.click()],
    ["Files", () => openApp("files")],
    ["Notes", () => openApp("notes")],
    ["Terminal", () => openApp("terminal")],
    ["Task Manager", () => openApp("taskmgr")],
    ["Settings", () => openApp("settings")],
  ];

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.altKey && event.code === "KeyL") {
        event.preventDefault();
        setLocked(true);
        return;
      }
      if ((event.ctrlKey || event.altKey) && event.code === "Space") {
        event.preventDefault();
        setLauncher((value) => !value);
        return;
      }
      if (event.altKey && (event.key === "Tab" || event.code === "KeyW")) {
        event.preventDefault();
        const visible = zOrder.filter((id) => openWins.includes(id) && !minWins.includes(id));
        if (visible.length > 1) raise(visible[0]!);
        else if (visible.length === 0 && openWins.length > 0) openApp(openWins[openWins.length - 1]!);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  const renderWindow = (id: string) => {
    const close = () => closeWindow(id);
    switch (id) {
      case "browser": return <PrivateBrowser key={browserStart ?? "home"} initialUrl={browserStart} close={close} />;
      case "figure": return <FigureCloudApp close={close} />;
      case "beez": return <BeeZApp close={close} />;
      case "minecraft": return <MinecraftApp close={close} />;
      case "settings": return <WallpaperSettings wallpaper={wallpaper} setWallpaper={setWallpaper} walls={allWalls} custom={customWalls} addWall={addWall} removeWall={removeWall} settings={settings} patch={patchSettings} close={close} />;
      case "files": return <FilesWindow close={close} open={openApp} />;
      case "notes": return <NotesApp close={close} />;
      case "calc": return <CalculatorApp close={close} />;
      case "terminal": return <TerminalApp close={close} open={openApp} />;
      case "taskmgr": return <TaskManagerApp close={close} wins={openWins} end={closeWindow} show={openApp} />;
      default: return null;
    }
  };

  if (phase === "start") return <StartScreen onStart={() => setPhase("boot")} />;
  if (phase === "boot") return <BootScreen />;

  return (
    <main onContextMenu={(event) => { if ((event.target as HTMLElement).closest("section, nav, aside")) return; event.preventDefault(); setMenu({ x: Math.min(event.clientX, window.innerWidth - 190), y: Math.min(event.clientY, window.innerHeight - 260) }); }} onClick={(event) => { setMenu(null); if (!(event.target as HTMLElement).closest('[data-start], [aria-label^="PRIVATE OS menu"]')) setStartMenu(false); }} className="relative h-dvh w-full overflow-hidden bg-background font-sans text-foreground [animation:desktop-in_.8s_ease-out]">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0" style={{ filter: `blur(${settings.blur}px)`, transform: settings.blur ? "scale(1.08)" : undefined }}>
          <Wallpaper index={wallpaper} options={allWalls} />
        </div>
      </div>
      <div className="pointer-events-none absolute inset-0 bg-black" style={{ opacity: settings.dim / 100 }} />
      <div className="absolute inset-0 bg-gradient-to-b from-background/20 via-transparent to-background/35" />

      <div className="absolute inset-x-0 bottom-3 z-40 mx-auto flex w-max max-w-[calc(100%-1rem)] flex-wrap items-center justify-center gap-1.5 md:bottom-4 md:gap-2">
        <nav aria-label="PRIVATE OS dock" className="flex items-center gap-1.5 rounded-2xl bg-black/35 px-2 py-1.5 backdrop-blur-xl md:gap-3 md:px-4">
          <span data-start id="start-anchor" className="inline-flex">
            <OsButton label="PRIVATE OS menu (lock, sleep, power)" onClick={() => {
              const anchor = document.getElementById("start-anchor");
              if (anchor) {
                const box = anchor.getBoundingClientRect();
                const width = Math.min(416, window.innerWidth - 16);
                setStartPos({ left: Math.max(8, Math.min(box.left - 8, window.innerWidth - width - 8)), bottom: window.innerHeight - box.top + 12 });
              }
              setStartMenu((value) => !value);
              setLauncher(false);
              setQuickMenu(false);
            }} className="group relative size-9 shrink-0 rounded-xl bg-white/10 transition-transform hover:-translate-y-0.5 hover:bg-white/20 md:size-11">
              <ShieldCheck className="size-6 text-white md:size-7" />
              <span className="absolute bottom-12 left-0 z-50 hidden whitespace-nowrap rounded bg-popover px-2 py-1 text-[10px] shadow group-hover:block">PRIVATE OS</span>
            </OsButton>
          </span>
          <OsButton label="Apps" onClick={() => setLauncher((value) => !value)} className="group relative size-6 shrink-0 transition-transform hover:-translate-y-0.5 md:size-7">
            <LayoutGrid className="size-5 text-white/70" />
            <span className="absolute bottom-9 left-0 z-50 hidden whitespace-nowrap rounded bg-popover px-2 py-1 text-[10px] shadow group-hover:block">Apps</span>
          </OsButton>
          {dockApps.map(({ id, label, icon: Icon }) => (
            <OsButton key={id} label={label} onClick={() => openApp(id)} className="group relative size-6 shrink-0 transition-transform hover:-translate-y-0.5 md:size-7">
              <Icon className="size-6 md:size-7" />
              <span className="absolute bottom-9 left-0 z-50 hidden whitespace-nowrap rounded bg-popover px-2 py-1 text-[10px] shadow group-hover:block">{label}</span>
              {openWins.includes(id) && <span className="absolute -bottom-1 size-1 rounded-full bg-white" />}
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

      {settings.desktop.length > 0 && (
        <div className="pointer-events-none absolute left-3 top-3 z-[9] flex max-h-[calc(100dvh-7rem)] flex-col flex-wrap content-start gap-2">
          {settings.desktop.map((id) => {
            const app = launcherApps.find((item) => item.id === id) ?? dockApps.find((item) => item.id === id);
            if (!app) return null;
            const Icon = app.icon;
            return (
              <div key={id} className="group pointer-events-auto relative w-20 text-center">
                <OsButton label={`Open ${app.label}`} onClick={() => openApp(id)} className="flex w-full flex-col items-center gap-1 rounded-lg p-2 hover:bg-white/10">
                  <Icon className="size-12" />
                  <span className="line-clamp-2 text-[11px] text-white drop-shadow">{app.label}</span>
                </OsButton>
                <button type="button" aria-label={`Remove ${app.label} from desktop`} onClick={() => patchSettings((current) => ({ desktop: current.desktop.filter((item) => item !== id) }))} className="absolute right-0 top-0 hidden rounded-full bg-black/60 p-0.5 text-white group-hover:block"><X className="size-3" /></button>
              </div>
            );
          })}
        </div>
      )}

      <input ref={wallInput} type="file" accept="image/*" multiple hidden onChange={(event) => { Array.from(event.target.files ?? []).forEach((file) => void addWall(file)); event.target.value = ""; }} />

      {startMenu && startPos && (
        <aside data-start style={{ left: startPos.left, bottom: startPos.bottom }} className="glass-panel fixed z-50 flex max-h-[min(36rem,calc(100dvh-6rem))] w-[min(26rem,calc(100vw-1rem))] flex-col gap-4 overflow-auto rounded-xl p-4 [animation:window-in_.18s_ease-out]">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase text-muted-foreground">Apps</p>
            <div className="grid grid-cols-4 gap-2">
              {launcherApps.map(({ id, label, icon: Icon }) => {
                const pinned = settings.desktop.includes(id);
                return (
                  <div key={id} className="relative">
                    <button type="button" onClick={() => { setStartMenu(false); openApp(id); }} className="flex w-full flex-col items-center gap-1 rounded-md p-2 text-[11px] hover:bg-secondary">
                      <Icon className="size-10" />
                      <span className="w-full truncate text-center">{label}</span>
                    </button>
                    <button type="button" aria-label={pinned ? `Remove ${label} from desktop` : `Add ${label} to desktop`} onClick={() => patchSettings((current) => ({ desktop: current.desktop.includes(id) ? current.desktop.filter((item) => item !== id) : [...current.desktop, id] }))} className={`absolute right-0 top-0 rounded-full px-1.5 text-[10px] ${pinned ? "bg-primary text-primary-foreground" : "bg-black/50 text-white"}`}>{pinned ? "✓" : "+"}</button>
                  </div>
                );
              })}
            </div>
            <p className="mt-2 text-[10px] text-muted-foreground">Tap + on an app to put it on your desktop.</p>
          </div>
          <div>
            <p className="mb-2 text-xs font-semibold uppercase text-muted-foreground">Widgets</p>
            <div className="flex flex-wrap gap-2">
              {WIDGET_LIST.map((widget) => {
                const on = settings.widgets.includes(widget.id);
                return (
                  <button key={widget.id} type="button" onClick={() => patchSettings((current) => ({ widgets: current.widgets.includes(widget.id) ? current.widgets.filter((item) => item !== widget.id) : [...current.widgets, widget.id] }))} className={`rounded-md px-3 py-1.5 text-xs ${on ? "bg-primary text-primary-foreground" : "bg-secondary"}`}>
                    {on ? "✓ " : "+ "}{widget.label}
                  </button>
                );
              })}
            </div>
          </div>
          <div className="grid grid-cols-5 gap-1 border-t border-border pt-3 text-center text-[11px]">
            {startItems.map(([label, action]) => (
              <button key={label} type="button" onClick={() => { setStartMenu(false); action(); }} className="rounded-md px-1 py-2 hover:bg-secondary">{label}</button>
            ))}
          </div>
        </aside>
      )}

      {settings.widgets.length > 0 && (
        <div className="pointer-events-none absolute right-3 top-3 z-[9] flex flex-col items-end gap-3">
          {settings.widgets.map((id) => (
            <WidgetShell key={id} title={WIDGET_LIST.find((item) => item.id === id)?.label ?? id} offset={settings.wpos[id] ?? { x: 0, y: 0 }} onMove={(pos) => patchSettings((current) => ({ wpos: { ...current.wpos, [id]: pos } }))} onRemove={() => patchSettings((current) => ({ widgets: current.widgets.filter((item) => item !== id) }))}>
              {id === "music" ? <MusicWidget /> : id === "notes" ? <NotesWidget /> : id === "calendar" ? <CalendarWidget /> : <StopwatchWidget />}
            </WidgetShell>
          ))}
        </div>
      )}

      {power !== "on" && (
        <div role="button" tabIndex={0} aria-label="Wake" onClick={() => { setPower("on"); setLocked(true); if (power === "off") setPhase("boot"); }} className="fixed inset-0 z-[80] grid cursor-pointer place-items-center bg-black text-[11px] tracking-[.3em] text-white/30">
          {power === "off" ? "PRESS ANYTHING TO POWER ON" : ""}
        </div>
      )}

      {menu && (
        <div role="menu" style={{ left: menu.x, top: menu.y }} className="glass-panel fixed z-50 w-44 rounded-lg p-1 text-xs [animation:window-in_.15s_ease-out]">
          {menuItems.map(([label, action]) => (
            <button key={label} type="button" role="menuitem" onClick={() => { action(); setMenu(null); }} className="block w-full rounded-md px-3 py-2 text-left hover:bg-secondary">{label}</button>
          ))}
        </div>
      )}

      {launcher && <AppLauncher query={query} setQuery={setQuery} openApp={openApp} close={() => setLauncher(false)} />}
      {openWins.map((id) => (
        <WindowContext.Provider key={id} value={{ minimized: minWins.includes(id), minimize: () => setMinWins((list) => (list.includes(id) ? list : [...list, id])), focus: () => raise(id), z: 10 + Math.max(0, zOrder.indexOf(id)) }}>
          <AppBoundary close={() => closeWindow(id)}>{renderWindow(id)}</AppBoundary>
        </WindowContext.Provider>
      ))}


      <LockScreen locked={locked} unlock={() => setLocked(false)} day={dateLabel} date={lockDate} clock={lockTime} dim={settings.lockDim} blur={settings.lockBlur} />
    </main>
  );
}

function Wallpaper({ index, options }: { index: number; options: WallpaperOption[] }) {
  const item = options[index] ?? options[0]!;
  const [failed, setFailed] = useState(false);
  useEffect(() => setFailed(false), [index]);
  if (item.video && !failed) {
    return <video key={item.video} src={item.video} poster={item.thumb} autoPlay loop muted playsInline preload="auto" onError={() => setFailed(true)} aria-label={`${item.label} wallpaper`} className="absolute inset-0 size-full object-cover" />;
  }
  if (item.src) return <img src={item.src} alt={`${item.label} wallpaper`} className="absolute inset-0 size-full object-cover" />;
  return <div className="absolute inset-0 bg-[linear-gradient(to_bottom,#0d1b2a,#1b3a4b_55%,#5c7f8a)]" />;
}

function LockScreen({ locked, unlock, day, date, clock, dim, blur }: { locked: boolean; unlock: () => void; day: string; date: string; clock: string; dim: number; blur: number }) {
  return (
    <div
      role="button"
      tabIndex={locked ? 0 : -1}
      aria-hidden={!locked}
      aria-label="Unlock PRIVATE OS"
      onClick={unlock}
      style={{ backgroundColor: `rgba(0,0,0,${dim / 100})`, backdropFilter: `blur(${blur}px)`, WebkitBackdropFilter: `blur(${blur}px)` }}
      className={`absolute inset-0 z-[60] flex cursor-pointer flex-col items-center pt-[24dvh] text-center font-['Rajdhani',sans-serif] text-[#f4ecd6] transition-all duration-700 [text-shadow:0_2px_18px_rgb(0_0_0/.55)] ${locked ? "" : "pointer-events-none -translate-y-8 opacity-0"}`}
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
  const { minimized, minimize, focus, z } = useContext(WindowContext);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const drag = useRef<{ sx: number; sy: number; ox: number; oy: number } | null>(null);
  const [size, setSize] = useState<{ w: number; h: number } | null>(null);
  const resizing = useRef<{ sx: number; sy: number; w: number; h: number; mode: string } | null>(null);
  const [maximized, setMaximized] = useState(startMaximized);
  const toggleMaximize = () => setMaximized((value) => !value);
  const surface = app ? (maximized ? "bg-black" : "border border-white/10 bg-black shadow-2xl") : maximized ? "bg-card/95 backdrop-blur-xl" : "glass-panel";
  const position = maximized ? "inset-x-0 top-0 bottom-14 rounded-none md:bottom-[4.5rem]" : "inset-x-2 top-3 bottom-16 rounded-lg md:inset-x-[8%] md:top-6 md:bottom-20";
  return (
    <section
      style={{ zIndex: z, transform: maximized ? undefined : `translate(${pos.x}px, ${pos.y}px)`, ...(size && !maximized ? { width: size.w, height: size.h } : {}) }}
      onPointerDown={(event) => {
        focus();
        const target = event.target as HTMLElement;
        if (maximized || event.button !== 0 || !target.closest("header") || target.closest("button")) return;
        drag.current = { sx: event.clientX, sy: event.clientY, ox: pos.x, oy: pos.y };
        event.currentTarget.setPointerCapture(event.pointerId);
      }}
      onPointerMove={(event) => {
        const d = drag.current;
        if (d) setPos({ x: d.ox + event.clientX - d.sx, y: d.oy + event.clientY - d.sy });
      }}
      onPointerUp={() => { drag.current = null; }}
      className={`absolute flex flex-col overflow-hidden [animation:window-in_.28s_ease-out] ${surface} ${minimized ? "hidden" : ""} ${position}`}
    >
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
      {!maximized && (["e", "s", "se"] as const).map((mode) => (
        <div
          key={mode}
          onPointerDown={(event) => {
            event.stopPropagation();
            focus();
            const box = event.currentTarget.parentElement!.getBoundingClientRect();
            resizing.current = { sx: event.clientX, sy: event.clientY, w: box.width, h: box.height, mode };
            event.currentTarget.setPointerCapture(event.pointerId);
          }}
          onPointerMove={(event) => {
            const r = resizing.current;
            if (!r) return;
            setSize({ w: r.mode.includes("e") ? Math.max(320, r.w + event.clientX - r.sx) : r.w, h: r.mode.includes("s") ? Math.max(220, r.h + event.clientY - r.sy) : r.h });
          }}
          onPointerUp={() => { resizing.current = null; }}
          className={`absolute z-20 touch-none ${mode === "e" ? "right-0 top-0 h-full w-1.5 cursor-e-resize" : mode === "s" ? "bottom-0 left-0 h-1.5 w-full cursor-s-resize" : "bottom-0 right-0 size-4 cursor-se-resize"}`}
        />
      ))}
    </section>
  );
}

// ---- Proxy engine: Scramjet (page rewriting) + Epoxy (encrypted transport through a Wisp server) ----
// Change this address to use a different Wisp server.
const WISP_SERVERS = ["wss://wisp.mercurywork.shop/", "wss://anura.pro/", "wss://wisp.rhw.one/wisp/"];

function probeWisp(url: string, ms = 4000) {
  return new Promise<boolean>((resolve) => {
    let done = false;
    let socket: WebSocket | null = null;
    const finish = (ok: boolean) => {
      if (done) return;
      done = true;
      window.clearTimeout(timer);
      try {
        socket?.close();
      } catch {
        // already closed
      }
      resolve(ok);
    };
    const timer = window.setTimeout(() => finish(false), ms);
    try {
      socket = new WebSocket(url);
      socket.onopen = () => finish(true);
      socket.onerror = () => finish(false);
      socket.onclose = () => finish(false);
    } catch {
      finish(false);
    }
  });
}

// Picks a working Wisp server: a custom choice if set, otherwise the first live one (last working server first).
async function pickWisp() {
  let choice = "auto";
  let last = "";
  try {
    choice = localStorage.getItem("pos-wisp-choice") || "auto";
    last = localStorage.getItem("pos-wisp-last") || "";
  } catch {
    // storage unavailable
  }
  if (choice.startsWith("wss://")) return choice;
  const list = [...new Set([last, ...WISP_SERVERS].filter(Boolean))];
  const results = await Promise.all(list.map((url) => probeWisp(url)));
  const working = list.find((_, index) => results[index]) ?? WISP_SERVERS[0]!;
  try {
    localStorage.setItem("pos-wisp-last", working);
  } catch {
    // storage unavailable
  }
  return working;
}

type EngineFrame = {
  go: (url: string) => void;
  addEventListener: (type: string, listener: (event: { url?: string | URL }) => void) => void;
};
type EngineController = { init: () => Promise<void>; createFrame: (frame?: HTMLIFrameElement) => EngineFrame };
type EngineWindow = {
  BareMux?: { BareMuxConnection: new (workerPath: string) => { setTransport: (path: string, args: unknown[]) => Promise<void> } };
  $scramjetLoadController?: () => { ScramjetController: new (config: Record<string, unknown>) => EngineController };
};

let engineStart: Promise<EngineController> | null = null;

function loadScript(src: string) {
  return new Promise<void>((resolve, reject) => {
    const element = document.createElement("script");
    element.src = src;
    element.async = true;
    element.onload = () => resolve();
    element.onerror = () => reject(new Error(`Could not load ${src}`));
    document.head.appendChild(element);
  });
}

function withTimeout<T>(promise: Promise<T>, ms: number, message: string) {
  return new Promise<T>((resolve, reject) => {
    const timer = window.setTimeout(() => reject(new Error(message)), ms);
    promise.then(
      (value) => {
        window.clearTimeout(timer);
        resolve(value);
      },
      (error) => {
        window.clearTimeout(timer);
        reject(error);
      },
    );
  });
}

async function resetProxyWorker() {
  try {
    const list = await navigator.serviceWorker.getRegistrations();
    await Promise.all(list.map((registration) => registration.unregister()));
  } catch {
    // nothing to reset
  }
}

function startProxyEngine() {
  if (!engineStart) {
    engineStart = withTimeout((async () => {
      if (!("serviceWorker" in navigator) || typeof SharedWorker === "undefined" || typeof WebAssembly === "undefined") {
        throw new Error("This browser can't run the proxy engine");
      }
      const scope = window as unknown as EngineWindow;
      await loadScript("/baremux.js");
      await loadScript("/scramjet.all.js");
      if (!scope.BareMux || !scope.$scramjetLoadController) throw new Error("Proxy engine files are missing");
      await navigator.serviceWorker.register("/sw.js", { scope: "/" });
      await withTimeout(navigator.serviceWorker.ready, 8000, "The proxy worker did not start");
      if (!navigator.serviceWorker.controller) {
        await new Promise<void>((resolve) => {
          navigator.serviceWorker.addEventListener("controllerchange", () => resolve(), { once: true });
          window.setTimeout(resolve, 4000);
        });
      }
      const connection = new scope.BareMux.BareMuxConnection("/baremux-worker.js");
      await withTimeout(connection.setTransport("/epoxy.mjs", [{ wisp: await pickWisp() }]), 12000, "Could not reach a proxy server");
      const { ScramjetController } = scope.$scramjetLoadController();
      const controller = new ScramjetController({ prefix: "/scramjet/" });
      await withTimeout(controller.init(), 10000, "The proxy engine did not initialise");
      return controller;
    })(), 30000, "The proxy engine took too long to start").catch((error) => {
      engineStart = null;
      void resetProxyWorker();
      throw error;
    });
  }
  return engineStart;
}

const ENGINE_FRAME_PERMISSIONS = "fullscreen; autoplay; clipboard-read; clipboard-write; gamepad; microphone; pointer-lock; keyboard-map";

function MinecraftApp({ close }: { close: () => void }) {
  const [mode, setMode] = useState<"starting" | "engine" | "fallback">("starting");
  const [fallbackSrc, setFallbackSrc] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const frameRef = useRef<HTMLIFrameElement>(null);
  const controllerRef = useRef<EngineController | null>(null);

  // 1) Epoxy + Scramjet proxy. 2) If this browser can't run it, open the game directly or through the page loader.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        controllerRef.current = await startProxyEngine();
        if (!cancelled) setMode("engine");
      } catch {
        let direct = true;
        try {
          const response = await fetch(`/api/proxy?check=1&url=${encodeURIComponent(MINECRAFT_URL)}`);
          const info = (await response.json()) as { frameable?: boolean | null };
          if (info.frameable === false) direct = false;
        } catch {
          // assume the site can be opened directly
        }
        if (cancelled) return;
        setFallbackSrc(direct ? MINECRAFT_URL : `/api/proxy?url=${encodeURIComponent(MINECRAFT_URL)}`);
        setMode("fallback");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (mode !== "engine") return;
    const element = frameRef.current;
    const controller = controllerRef.current;
    if (element && controller) controller.createFrame(element).go(MINECRAFT_URL);
  }, [mode]);

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
        {mode === "engine" && (
          <iframe ref={frameRef} key="engine" title="Minecraft" onLoad={() => setLoading(false)} className="size-full border-0 bg-black" allow={ENGINE_FRAME_PERMISSIONS} />
        )}
        {mode === "fallback" && fallbackSrc && (
          <iframe
            key="fallback"
            title="Minecraft"
            src={fallbackSrc}
            onLoad={() => setLoading(false)}
            className="size-full border-0 bg-black"
            allow={ENGINE_FRAME_PERMISSIONS}
            sandbox="allow-forms allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox allow-modals allow-pointer-lock allow-downloads allow-presentation allow-orientation-lock"
          />
        )}
      </div>
    </WindowFrame>
  );
}

function BeeZApp({ close }: { close: () => void }) {
  const [mode, setMode] = useState<"starting" | "engine" | "fallback">("starting");
  const [fallbackSrc, setFallbackSrc] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const frameRef = useRef<HTMLIFrameElement>(null);
  const controllerRef = useRef<EngineController | null>(null);

  // 1) Epoxy + Scramjet proxy. 2) If this browser can't run it, open the game directly or through the page loader.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        controllerRef.current = await startProxyEngine();
        if (!cancelled) setMode("engine");
      } catch {
        let direct = true;
        try {
          const response = await fetch(`/api/proxy?check=1&url=${encodeURIComponent(BEEZ_URL)}`);
          const info = (await response.json()) as { frameable?: boolean | null };
          if (info.frameable === false) direct = false;
        } catch {
          // assume the site can be opened directly
        }
        if (cancelled) return;
        setFallbackSrc(direct ? BEEZ_URL : `/api/proxy?url=${encodeURIComponent(BEEZ_URL)}`);
        setMode("fallback");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (mode !== "engine") return;
    const element = frameRef.current;
    const controller = controllerRef.current;
    if (element && controller) controller.createFrame(element).go(BEEZ_URL);
  }, [mode]);

  const openOutside = (
    <button type="button" aria-label="Open BeeZ in a new tab" onClick={() => window.open(BEEZ_URL, "_blank", "noopener,noreferrer")} className="grid size-6 place-items-center rounded outline-none hover:bg-white/10">
      <ExternalLink className="size-3.5" />
    </button>
  );

  return (
    <WindowFrame title="BeeZ" icon={BeeZIcon} close={close} app startMaximized actions={openOutside}>
      <div className="relative flex-1 overflow-hidden bg-black">
        {loading && (
          <div className="absolute inset-0 z-10 grid place-items-center bg-[#171717]">
            <div className="text-center">
              <BeeZIcon className="mx-auto size-20" />
              <p className="mt-5 text-sm font-bold tracking-[.3em] text-white">BEEZ</p>
              <p className="mt-1 text-[11px] text-white/50">Loading…</p>
              <div className="mx-auto mt-5 h-1 w-44 overflow-hidden rounded-full bg-white/10"><div className="h-full origin-left bg-[#f5b301] [animation:boot-bar_2.2s_ease-in-out_forwards]" /></div>
            </div>
          </div>
        )}
        {mode === "engine" && (
          <iframe ref={frameRef} key="engine" title="BeeZ" onLoad={() => setLoading(false)} className="size-full border-0 bg-black" allow={ENGINE_FRAME_PERMISSIONS} />
        )}
        {mode === "fallback" && fallbackSrc && (
          <iframe
            key="fallback"
            title="BeeZ"
            src={fallbackSrc}
            onLoad={() => setLoading(false)}
            className="size-full border-0 bg-black"
            allow={ENGINE_FRAME_PERMISSIONS}
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

function isDirectHost(url: string) {
  try {
    const { hostname } = new URL(url);
    return DIRECT_HOSTS.some((host) => hostname === host || hostname.endsWith(`.${host}`));
  } catch {
    return false;
  }
}

function PrivateBrowser({ initialUrl, close }: { initialUrl: string | null; close: () => void }) {
  const [tabs, setTabs] = useState<{ id: number; url: string | null }[]>([{ id: 1, url: initialUrl }]);
  const [activeTab, setActiveTab] = useState(1);
  const nextId = useRef(2);
  const addTab = () => {
    const id = nextId.current++;
    setTabs((list) => [...list, { id, url: null }]);
    setActiveTab(id);
  };
  const closeTab = (id: number) => {
    if (tabs.length === 1) return close();
    const rest = tabs.filter((tab) => tab.id !== id);
    setTabs(rest);
    if (activeTab === id) setActiveTab(rest[rest.length - 1]!.id);
  };
  return (
    <WindowFrame title="PRIVATE Browser" icon={PrivateBrowserIcon} close={close}>
      <div className="flex h-9 shrink-0 items-center gap-1 overflow-x-auto border-b border-border bg-background/60 px-2">
        {tabs.map((tab, index) => (
          <div key={tab.id} className={`flex h-7 shrink-0 items-center gap-1 rounded-md pl-3 pr-1 text-xs ${tab.id === activeTab ? "bg-secondary" : "hover:bg-secondary/50"}`}>
            <button type="button" onClick={() => setActiveTab(tab.id)}>Tab {index + 1}</button>
            <button type="button" aria-label={`Close tab ${index + 1}`} onClick={() => closeTab(tab.id)} className="rounded p-0.5 hover:bg-background/60"><X className="size-3" /></button>
          </div>
        ))}
        <button type="button" aria-label="New tab" onClick={addTab} className="grid size-7 shrink-0 place-items-center rounded-md hover:bg-secondary"><Plus className="size-4" /></button>
      </div>
      {tabs.map((tab) => <BrowserTab key={tab.id} initialUrl={tab.url} active={tab.id === activeTab} />)}
    </WindowFrame>
  );
}

function BrowserTab({ initialUrl, active }: { initialUrl: string | null; active: boolean }) {
  const [address, setAddress] = useState(initialUrl ?? "");
  const [nav, setNav] = useState<{ list: string[]; index: number }>({ list: initialUrl ? [initialUrl] : [], index: initialUrl ? 0 : -1 });
  const [frameTarget, setFrameTarget] = useState<string | null>(initialUrl);
  const [frameKey, setFrameKey] = useState(0);
  const [loading, setLoading] = useState(Boolean(initialUrl));
  const [engine, setEngine] = useState<"idle" | "loading" | "ready" | "failed">("idle");
  const frameRef = useRef<HTMLIFrameElement>(null);
  const controllerRef = useRef<EngineController | null>(null);
  const engineFrame = useRef<{ element: HTMLIFrameElement; frame: EngineFrame } | null>(null);
  const pending = useRef(true);
  const page = nav.index >= 0 ? nav.list[nav.index] : null;
  const needsEngine = Boolean(frameTarget) && !isDirectHost(frameTarget ?? "");

  // Called whenever the page inside the frame reports its real address.
  const realUrl = useRef<(url: string) => void>(() => {});
  realUrl.current = (url: string) => {
    if (!/^https?:\/\//i.test(url)) return;
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

  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      if (event.source !== frameRef.current?.contentWindow) return;
      const url = (event.data as { privateNav?: unknown } | null)?.privateNav;
      if (typeof url === "string") realUrl.current(url);
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  // Start the Epoxy + Scramjet engine the first time a page needs it.
  useEffect(() => {
    if (!needsEngine || engine !== "idle") return;
    setEngine("loading");
    startProxyEngine()
      .then((controller) => {
        controllerRef.current = controller;
        setEngine("ready");
      })
      .catch(() => setEngine("failed"));
  }, [needsEngine, engine]);

  // Send the current page through the engine.
  useEffect(() => {
    if (engine !== "ready" || !needsEngine || !frameTarget) return;
    const element = frameRef.current;
    const controller = controllerRef.current;
    if (!element || !controller) return;
    if (!engineFrame.current || engineFrame.current.element !== element) {
      const created = controller.createFrame(element);
      created.addEventListener("urlchange", (event) => realUrl.current(String(event.url ?? "")));
      engineFrame.current = { element, frame: created };
    }
    engineFrame.current.frame.go(frameTarget);
  }, [engine, needsEngine, frameTarget, frameKey]);

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
    const destination = isUrl ? (/^https?:\/\//i.test(clean) ? clean : `https://${clean}`) : `https://html.duckduckgo.com/html/?q=${encodeURIComponent(clean)}`;
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

  const frame = frameTarget
    ? isDirectHost(frameTarget)
      ? { mode: "direct" as const, src: frameTarget }
      : engine === "failed"
        ? { mode: "loader" as const, src: `/api/proxy?url=${encodeURIComponent(frameTarget)}` }
        : { mode: "engine" as const, src: undefined }
    : null;
  return (
    <div className={active ? "flex min-h-0 flex-1 flex-col" : "hidden"}>
      <div className="flex h-12 shrink-0 items-center gap-1.5 border-b border-border bg-background/40 px-2">
        <OsButton label="Back" disabled={nav.index <= 0} onClick={() => moveHistory(-1)} className="size-8 rounded-md hover:bg-secondary disabled:opacity-30"><ArrowLeft className="size-4" /></OsButton><OsButton label="Forward" disabled={nav.index >= nav.list.length - 1} onClick={() => moveHistory(1)} className="size-8 rounded-md hover:bg-secondary disabled:opacity-30"><ArrowRight className="size-4" /></OsButton><OsButton label="Reload" disabled={!page} onClick={() => { if (page) show(page); }} className="hidden size-8 rounded-md hover:bg-secondary disabled:opacity-30 sm:inline-flex"><RefreshCw className="size-4" /></OsButton>
        <form onSubmit={(event) => { event.preventDefault(); navigateTo(address); }} className="flex h-9 min-w-0 flex-1 items-center gap-2 rounded-md border border-border bg-input px-2 sm:px-3"><LockKeyhole className="size-3.5 shrink-0 text-primary" /><input aria-label="Search or enter address" value={address} onChange={(event) => setAddress(event.target.value)} placeholder="Search or enter address" className="min-w-0 flex-1 bg-transparent text-xs outline-none" /></form>
        <OsButton label="Open this page in a new tab" disabled={!page} onClick={() => page && window.open(page, "_blank", "noopener,noreferrer")} className="size-8 rounded-md hover:bg-secondary disabled:opacity-30"><ExternalLink className="size-4" /></OsButton>
      </div>
      <div className="relative flex-1 overflow-hidden bg-background">
        {frame ? <>
          {loading && <div className="absolute inset-0 z-10 grid place-items-center bg-background/80"><div className="text-center"><RefreshCw className="mx-auto size-6 animate-spin text-primary" /><p className="mt-3 text-xs text-muted-foreground">Opening securely…</p></div></div>}
          <iframe ref={frameRef} key={frame.mode === "engine" ? "engine" : `${frame.mode}-${frameKey}`} title="PRIVATE Browser page" src={frame.src} onLoad={() => setLoading(false)} className="size-full border-0 bg-background" allow="fullscreen; clipboard-read; clipboard-write; autoplay" sandbox={frame.mode === "direct" ? DIRECT_SANDBOX : frame.mode === "loader" ? PROXY_SANDBOX : undefined} />
        </> : (
          <div className="flex size-full flex-col items-center justify-center px-5 text-center">
            <div className="flex size-16 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-xl"><ShieldCheck className="size-8" /></div>
            <h2 className="mt-5 text-2xl font-semibold">Browse without being followed.</h2>
            <p className="mt-2 max-w-md text-sm text-muted-foreground">Search privately or open a website directly. Use the external-open button when a site does not allow an embedded view.</p>
            <form onSubmit={(event) => { event.preventDefault(); navigateTo(address); }} className="mt-6 flex w-full max-w-lg items-center gap-2 rounded-md border border-border bg-input px-3"><Search className="size-4 shrink-0 text-muted-foreground" /><input aria-label="Search DuckDuckGo or enter address" value={address} onChange={(event) => setAddress(event.target.value)} placeholder="Search DuckDuckGo or enter address" className="h-11 min-w-0 flex-1 bg-transparent text-sm outline-none" /></form>
            <div className="mt-3 grid w-full max-w-lg grid-cols-2 gap-2">
              <OsButton label="Open Cherrion" onClick={() => navigateTo(CHERRION_URL)} className="justify-start gap-3 rounded-md border border-border bg-card p-3 text-left hover:bg-secondary"><span className="grid size-9 shrink-0 place-items-center rounded-md bg-accent text-accent-foreground"><Cherry className="size-5" /></span><span><strong className="block text-xs">Cherrion</strong><span className="text-[10px] text-muted-foreground">Recommended app</span></span></OsButton>
              <OsButton label="Search with DuckDuckGo" onClick={() => { setAddress("https://html.duckduckgo.com/html/"); navigateTo("https://html.duckduckgo.com/html/"); }} className="justify-start gap-3 rounded-md border border-border bg-card p-3 text-left hover:bg-secondary"><span className="grid size-9 shrink-0 place-items-center rounded-md bg-primary text-primary-foreground"><Search className="size-5" /></span><span><strong className="block text-xs">DuckDuckGo</strong><span className="text-[10px] text-muted-foreground">Private search</span></span></OsButton>
            </div>
            <div className="mt-8 grid w-full max-w-lg grid-cols-3 gap-2">
              {["Private search", "Block trackers", "Clear session"].map((text, index) => <div key={text} className="rounded-md border border-border bg-card p-3 text-xs"><span className="mb-2 block text-primary">{index === 0 ? <Search className="mx-auto size-5" /> : index === 1 ? <ShieldCheck className="mx-auto size-5" /> : <Sparkles className="mx-auto size-5" />}</span>{text}</div>)}
            </div>
          </div>
        )}
      </div>
      <footer className="flex h-7 items-center justify-between border-t border-border px-3 text-[10px] text-muted-foreground"><span>Shields active</span><span>0 trackers on this page</span></footer>
    </div>
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

function WallpaperSettings({ wallpaper, setWallpaper, walls, custom, addWall, removeWall, settings, patch, close }: { wallpaper: number; setWallpaper: (value: number) => void; walls: WallpaperOption[]; custom: { id: number; label: string; url: string }[]; addWall: (file: File) => void; removeWall: (id: number) => void; settings: OsSettings; patch: (patch: Partial<OsSettings>) => void; close: () => void }) {
  return (
    <WindowFrame title="Appearance" icon={Settings} close={close}>
      <div className="flex-1 overflow-auto p-5 md:p-8">
        <h2 className="text-xl font-semibold">Choose your landscape</h2><p className="mt-1 text-sm text-muted-foreground">Changes appear instantly across your home screen.</p>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {walls.map((item, index) => (
            <OsButton key={item.label} label={`Use ${item.label} wallpaper`} onClick={() => setWallpaper(index)} className={`group relative aspect-video overflow-hidden rounded-md border-2 ${wallpaper === index ? "border-primary" : "border-border"}`}>
              <img src={item.thumb} alt={item.label} onError={(event) => { event.currentTarget.style.visibility = "hidden"; }} className="size-full object-cover transition-transform group-hover:scale-105" /><span className="absolute inset-x-0 bottom-0 bg-background/75 p-3 text-left text-xs font-semibold backdrop-blur-md">{item.label}{wallpaper === index && <span className="float-right text-primary">Selected</span>}</span>
            </OsButton>
          ))}
        </div>
        <Personalize settings={settings} patch={patch} custom={custom} addWall={addWall} removeWall={removeWall} />
        <NetworkPrivacy />
      </div>
    </WindowFrame>
  );
}


type FsNode = string | null; // string = file, null = folder
const FS_KEY = "pos-fs";

function readFs(): Record<string, FsNode> {
  try {
    const raw = localStorage.getItem(FS_KEY);
    if (raw) {
      const data = JSON.parse(raw) as Record<string, FsNode>;
      if (data && typeof data === "object") return data;
    }
  } catch {
    // storage unavailable or corrupted
  }
  return { "/Documents": null, "/Documents/welcome.txt": "Welcome to PRIVATE OS. Files live only in this browser." };
}

function writeFs(fs: Record<string, FsNode>) {
  let ok = true;
  try {
    localStorage.setItem(FS_KEY, JSON.stringify(fs));
  } catch {
    ok = false;
  }
  window.dispatchEvent(new Event("pos-fs"));
  return ok;
}

function useFs() {
  const [fs, setFs] = useState<Record<string, FsNode>>({});
  useEffect(() => {
    const load = () => setFs(readFs());
    load();
    window.addEventListener("pos-fs", load);
    return () => window.removeEventListener("pos-fs", load);
  }, []);
  return fs;
}

const childrenOf = (fs: Record<string, FsNode>, dir: string) =>
  Object.keys(fs)
    .filter((path) => path !== "/" && (path.slice(0, path.lastIndexOf("/")) || "/") === dir)
    .sort();

const baseName = (path: string) => path.slice(path.lastIndexOf("/") + 1);

function FilesWindow({ close, open }: { close: () => void; open: (id: string) => void }) {
  const fs = useFs();
  const [dir, setDir] = useState("/");
  const fileInput = useRef<HTMLInputElement>(null);
  const items = childrenOf(fs, dir);
  const up = dir === "/" ? "/" : dir.slice(0, dir.lastIndexOf("/")) || "/";
  const make = (folder: boolean) => {
    const name = window.prompt(folder ? "Folder name" : "File name")?.trim().replace(/\//g, "");
    if (!name) return;
    const path = `${dir === "/" ? "" : dir}/${name}`;
    const next = { ...readFs() };
    if (path in next) return;
    next[path] = folder ? null : "";
    writeFs(next);
  };
  const remove = (path: string) => {
    const next = { ...readFs() };
    for (const key of Object.keys(next)) if (key === path || key.startsWith(`${path}/`)) delete next[key];
    writeFs(next);
  };
  const upload = (list: FileList | null) => {
    if (!list) return;
    Array.from(list).forEach((file) => {
      const asText = file.type.startsWith("text/") || /\.(txt|md|json|csv|js|ts|tsx|html|css|xml|ya?ml|log)$/i.test(file.name);
      const reader = new FileReader();
      reader.onload = () => {
        const next = { ...readFs() };
        next[`${dir === "/" ? "" : dir}/${file.name.replace(/\//g, "")}`] = String(reader.result ?? "");
        if (!writeFs(next)) window.alert("Browser storage is full. Try a smaller file.");
      };
      if (asText) reader.readAsText(file);
      else reader.readAsDataURL(file);
    });
  };
  const download = (path: string) => {
    const value = fs[path];
    if (typeof value !== "string") return;
    const isData = value.startsWith("data:");
    const url = isData ? value : URL.createObjectURL(new Blob([value], { type: "text/plain" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = baseName(path);
    link.click();
    if (!isData) window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  };
  const btn = "rounded-md bg-secondary px-2.5 py-1 text-xs hover:bg-secondary/70 disabled:opacity-30";
  return (
    <WindowFrame title="Private Files" icon={Folder} close={close}>
      <div className="flex h-11 shrink-0 items-center gap-2 border-b border-border px-3">
        <button type="button" disabled={dir === "/"} onClick={() => setDir(up)} className={btn}>Up</button>
        <span className="min-w-0 flex-1 truncate text-xs text-muted-foreground">{dir}</span>
        <button type="button" onClick={() => make(true)} className={btn}>New folder</button>
        <button type="button" onClick={() => make(false)} className={btn}>New file</button>
        <button type="button" onClick={() => fileInput.current?.click()} className={btn}><Upload className="inline size-3" /> Upload</button>
        <input ref={fileInput} type="file" multiple hidden onChange={(event) => { upload(event.target.files); event.target.value = ""; }} />
      </div>
      <div className="flex-1 overflow-auto p-3">
        {items.length === 0 && <p className="p-6 text-center text-sm text-muted-foreground">This folder is empty.</p>}
        {items.map((path) => {
          const folder = fs[path] === null;
          return (
            <div key={path} className="flex items-center gap-3 rounded-md px-3 py-2 hover:bg-secondary">
              <button
                type="button"
                className="flex min-w-0 flex-1 items-center gap-3 text-left text-sm"
                onClick={() => {
                  if (folder) return setDir(path);
                  try {
                    localStorage.setItem("pos-note-path", path);
                  } catch {
                    // storage unavailable
                  }
                  window.dispatchEvent(new Event("pos-note"));
                  open("notes");
                }}
              >
                {folder ? <Folder className="size-4 shrink-0 text-primary" /> : <StickyNote className="size-4 shrink-0 text-muted-foreground" />}
                <span className="truncate">{baseName(path)}</span>
              </button>
              {!folder && <button type="button" aria-label={`Download ${baseName(path)}`} onClick={() => download(path)} className="rounded p-1 hover:bg-secondary"><Download className="size-4" /></button>}
              <button type="button" aria-label={`Delete ${baseName(path)}`} onClick={() => remove(path)} className="rounded p-1 hover:bg-secondary">
                <X className="size-4" />
              </button>
            </div>
          );
        })}
      </div>
    </WindowFrame>
  );
}

function NotesApp({ close }: { close: () => void }) {
  const [path, setPath] = useState("/Documents/note.txt");
  const [text, setText] = useState("");
  const [msg, setMsg] = useState("");
  useEffect(() => {
    const pull = () => {
      try {
        const next = localStorage.getItem("pos-note-path");
        if (!next) return;
        localStorage.removeItem("pos-note-path");
        setPath(next);
        const value = readFs()[next];
        setText(typeof value === "string" ? value : "");
        setMsg("Opened");
      } catch {
        // storage unavailable
      }
    };
    pull();
    window.addEventListener("pos-note", pull);
    return () => window.removeEventListener("pos-note", pull);
  }, []);
  const save = () => {
    const fs = { ...readFs() };
    const parent = path.slice(0, path.lastIndexOf("/"));
    if (!path.startsWith("/") || (parent && fs[parent] !== null)) return setMsg("That folder doesn't exist");
    fs[path] = text;
    writeFs(fs);
    setMsg("Saved");
  };
  const load = () => {
    const value = readFs()[path];
    if (typeof value === "string") {
      setText(value);
      setMsg("Opened");
    } else setMsg("File not found");
  };
  return (
    <WindowFrame title="Notes" icon={StickyNote} close={close}>
      <div className="flex shrink-0 items-center gap-2 border-b border-border p-2">
        <input value={path} onChange={(event) => setPath(event.target.value)} aria-label="File path" className="min-w-0 flex-1 rounded-md bg-secondary px-3 py-1.5 text-xs outline-none" />
        <button type="button" onClick={load} className="rounded-md bg-secondary px-2.5 py-1.5 text-xs">Open</button>
        <button type="button" onClick={save} className="rounded-md bg-primary px-2.5 py-1.5 text-xs text-primary-foreground">Save</button>
      </div>
      <textarea value={text} onChange={(event) => setText(event.target.value)} placeholder="Start typing…" className="flex-1 resize-none bg-transparent p-4 text-sm outline-none" />
      <p className="h-6 shrink-0 px-4 text-[11px] text-muted-foreground">{msg}</p>
    </WindowFrame>
  );
}

function CalculatorApp({ close }: { close: () => void }) {
  const [disp, setDisp] = useState("0");
  const [acc, setAcc] = useState<number | null>(null);
  const [op, setOp] = useState<string | null>(null);
  const [fresh, setFresh] = useState(true);
  const fmt = (n: number) => (Number.isFinite(n) ? String(+n.toFixed(10)) : "Error");
  const calc = (a: number, b: number, o: string) => (o === "+" ? a + b : o === "-" ? a - b : o === "×" ? a * b : b === 0 ? NaN : a / b);
  const press = (k: string) => {
    if (/^[\d.]$/.test(k)) {
      setDisp((d) => (fresh ? (k === "." ? "0." : k) : k === "." && d.includes(".") ? d : d === "0" && k !== "." ? k : d + k));
      setFresh(false);
      return;
    }
    if (k === "C") {
      setDisp("0");
      setAcc(null);
      setOp(null);
      setFresh(true);
      return;
    }
    const cur = parseFloat(disp);
    if (k === "=") {
      if (acc !== null && op) {
        setDisp(fmt(calc(acc, cur, op)));
        setAcc(null);
        setOp(null);
        setFresh(true);
      }
      return;
    }
    const base = acc !== null && op && !fresh ? calc(acc, cur, op) : cur;
    setAcc(base);
    setOp(k);
    setDisp(fmt(base));
    setFresh(true);
  };
  const keys = ["C", "÷", "×", "-", "7", "8", "9", "+", "4", "5", "6", "=", "1", "2", "3", "0", "."];
  return (
    <WindowFrame title="Calculator" icon={Calculator} close={close}>
      <div className="mx-auto flex w-full max-w-xs flex-1 flex-col justify-center gap-3 p-4">
        <div className="truncate rounded-md bg-secondary px-4 py-5 text-right text-3xl font-semibold tabular-nums">{disp}</div>
        <div className="grid grid-cols-4 gap-2">
          {keys.map((k) => (
            <button key={k} type="button" onClick={() => press(k)} className={`rounded-md py-3 text-lg ${/[÷×\-+=]/.test(k) ? "bg-primary text-primary-foreground" : "bg-secondary hover:bg-secondary/70"} ${k === "=" ? "row-span-2" : ""}`}>
              {k}
            </button>
          ))}
        </div>
      </div>
    </WindowFrame>
  );
}

function TerminalApp({ close, open }: { close: () => void; open: (id: string) => void }) {
  const [cwd, setCwd] = useState("/");
  const [lines, setLines] = useState<string[]>(["PRIVATE OS terminal. Type 'help'."]);
  const [input, setInput] = useState("");
  const boxRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    boxRef.current?.scrollTo({ top: boxRef.current.scrollHeight });
  }, [lines]);
  const resolve = (p: string) => {
    const out: string[] = [];
    for (const part of (p.startsWith("/") ? p : `${cwd}/${p}`).split("/")) {
      if (!part || part === ".") continue;
      if (part === "..") out.pop();
      else out.push(part);
    }
    return `/${out.join("/")}`;
  };
  const apps: Record<string, string> = { browser: "browser", beez: "beez", files: "files", notes: "notes", calc: "calc", terminal: "terminal", settings: "settings", taskmgr: "taskmgr", minecraft: "minecraft", figure: "figure", cherrion: "cherrion" };
  const run = (line: string) => {
    const [cmd = "", ...args] = line.trim().split(/\s+/);
    const arg = args.join(" ");
    const fs = { ...readFs() };
    let out: string[] = [];
    switch (cmd) {
      case "": break;
      case "help": out = ["ls cd cat mkdir touch rm echo [text > file] clear date open <app>", `apps: ${Object.keys(apps).join(" ")}`]; break;
      case "ls": out = childrenOf(fs, resolve(arg || ".")).map((p) => baseName(p) + (fs[p] === null ? "/" : "")); break;
      case "cd": {
        const t = resolve(arg || "/");
        if (t === "/" || fs[t] === null) setCwd(t);
        else out = ["no such folder"];
        break;
      }
      case "cat": {
        const v = fs[resolve(arg)];
        out = typeof v === "string" ? v.split("\n") : ["no such file"];
        break;
      }
      case "mkdir": fs[resolve(arg)] = null; writeFs(fs); break;
      case "touch": { const t = resolve(arg); if (!(t in fs)) fs[t] = ""; writeFs(fs); break; }
      case "rm": {
        const t = resolve(arg);
        for (const key of Object.keys(fs)) if (key === t || key.startsWith(`${t}/`)) delete fs[key];
        writeFs(fs);
        break;
      }
      case "echo": {
        const [text = "", file] = arg.split(" > ");
        if (file) { fs[resolve(file.trim())] = text; writeFs(fs); } else out = [text];
        break;
      }
      case "date": out = [new Date().toString()]; break;
      case "open": {
        const id = apps[arg.toLowerCase()];
        if (id) open(id);
        else out = ["unknown app"];
        break;
      }
      case "clear": setLines([]); return;
      default: out = [`${cmd}: command not found`];
    }
    setLines((list) => [...list, `${cwd}$ ${line}`, ...out]);
  };
  return (
    <WindowFrame title="Terminal" icon={Terminal} close={close} app>
      <div ref={boxRef} className="flex-1 overflow-auto bg-black p-3 font-mono text-xs text-green-400">
        {lines.map((l, i) => <div key={i} className="whitespace-pre-wrap">{l}</div>)}
        <div className="flex gap-2">
          <span>{cwd}$</span>
          <input
            value={input}
            autoFocus
            aria-label="Terminal input"
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={(event) => {
              if (event.key !== "Enter") return;
              run(input);
              setInput("");
            }}
            className="min-w-0 flex-1 bg-transparent outline-none"
          />
        </div>
      </div>
    </WindowFrame>
  );
}

function NetworkPrivacy() {
  const [choice, setChoice] = useState("auto");
  const [custom, setCustom] = useState("");
  const [status, setStatus] = useState<Record<string, boolean>>({});
  const [testing, setTesting] = useState(false);
  useEffect(() => {
    try {
      const saved = localStorage.getItem("pos-wisp-choice") || "auto";
      if (!saved.startsWith("wss://")) return;
      if (WISP_SERVERS.includes(saved)) setChoice(saved);
      else {
        setChoice("custom");
        setCustom(saved);
      }
    } catch {
      // storage unavailable
    }
  }, []);
  const save = (value: string, customValue = custom) => {
    setChoice(value);
    const stored = value === "custom" ? customValue.trim() : value;
    try {
      localStorage.setItem("pos-wisp-choice", stored.startsWith("wss://") ? stored : "auto");
    } catch {
      // storage unavailable
    }
  };
  const test = async () => {
    setTesting(true);
    const results = await Promise.all(WISP_SERVERS.map((url) => probeWisp(url)));
    setStatus(Object.fromEntries(WISP_SERVERS.map((url, index) => [url, Boolean(results[index])])));
    setTesting(false);
  };
  const wipe = () => {
    if (!window.confirm("Erase all PRIVATE OS data in this browser?")) return;
    try {
      localStorage.clear();
      sessionStorage.clear();
    } catch {
      // storage unavailable
    }
    navigator.serviceWorker?.getRegistrations().then((list) => list.forEach((r) => r.unregister())).catch(() => {});
    window.setTimeout(() => window.location.reload(), 300);
  };
  return (
    <div className="mt-8 space-y-6 text-sm">
      <section>
        <h3 className="font-semibold">Proxy server</h3>
        <p className="mt-1 text-xs text-muted-foreground">Auto tests the servers and uses the first one that responds. Reload the page after changing.</p>
        <select value={choice} onChange={(event) => save(event.target.value)} aria-label="Proxy server" className="mt-3 w-full rounded-md bg-secondary px-3 py-2 text-xs outline-none">
          <option value="auto">Auto (recommended)</option>
          {WISP_SERVERS.map((url) => <option key={url} value={url}>{url}</option>)}
          <option value="custom">Custom…</option>
        </select>
        {choice === "custom" && (
          <input value={custom} placeholder="wss://your-wisp-server/" aria-label="Custom Wisp server" onChange={(event) => { setCustom(event.target.value); save("custom", event.target.value); }} className="mt-2 w-full rounded-md bg-secondary px-3 py-2 text-xs outline-none" />
        )}
        <div className="mt-3 flex items-center gap-2">
          <button type="button" onClick={test} disabled={testing} className="rounded-md bg-secondary px-3 py-1.5 text-xs disabled:opacity-50">{testing ? "Testing…" : "Test connection"}</button>
          <button type="button" onClick={() => window.location.reload()} className="rounded-md bg-primary px-3 py-1.5 text-xs text-primary-foreground">Reload</button>
          <button type="button" onClick={() => { void resetProxyWorker().then(() => window.location.reload()); }} className="rounded-md bg-secondary px-3 py-1.5 text-xs">Repair proxy</button>
        </div>
        {Object.keys(status).length > 0 && (
          <ul className="mt-2 space-y-1 text-xs">
            {WISP_SERVERS.map((url) => <li key={url} className="truncate">{status[url] ? "✓" : "✗"} {url}</li>)}
          </ul>
        )}
      </section>
      <section>
        <h3 className="font-semibold">Privacy</h3>
        <p className="mt-1 text-xs text-muted-foreground">Everything is stored only in this browser. Wipe it any time.</p>
        <button type="button" onClick={wipe} className="mt-3 rounded-md bg-destructive px-3 py-1.5 text-xs text-white">Clear all data</button>
      </section>
    </div>
  );
}

function TaskManagerApp({ close, wins, end, show }: { close: () => void; wins: string[]; end: (id: string) => void; show: (id: string) => void }) {
  const nameOf = (id: string) => [...dockApps, ...launcherApps].find((app) => app.id === id)?.label ?? id;
  return (
    <WindowFrame title="Task Manager" icon={Activity} close={close}>
      <div className="flex-1 overflow-auto p-3">
        {wins.length === 0 && <p className="p-6 text-center text-sm text-muted-foreground">No apps running.</p>}
        {[...wins].reverse().map((id) => (
          <div key={id} className="flex items-center gap-3 rounded-md px-3 py-2 hover:bg-secondary">
            <button type="button" onClick={() => show(id)} className="min-w-0 flex-1 truncate text-left text-sm">{nameOf(id)}</button>
            <button type="button" onClick={() => end(id)} className="rounded-md bg-destructive px-2.5 py-1 text-xs text-white">End task</button>
          </div>
        ))}
      </div>
    </WindowFrame>
  );
}

type OsSettings = { blur: number; dim: number; lockBlur: number; lockDim: number; clock24: boolean; widgets: string[]; wpos: Record<string, { x: number; y: number }>; desktop: string[] };
const DEFAULT_SETTINGS: OsSettings = { blur: 0, dim: 15, lockBlur: 8, lockDim: 65, clock24: true, widgets: [], wpos: {}, desktop: ["browser", "beez", "minecraft", "files"] };
const WIDGET_LIST = [
  { id: "music", label: "Music" },
  { id: "notes", label: "Quick note" },
  { id: "calendar", label: "Calendar" },
  { id: "stopwatch", label: "Stopwatch" },
];

// Custom wallpapers live in IndexedDB (this browser only).
function openWallDb() {
  return new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open("pos-walls", 1);
    request.onupgradeneeded = () => request.result.createObjectStore("w", { keyPath: "id", autoIncrement: true });
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}
async function loadWalls() {
  const db = await openWallDb();
  return new Promise<{ id: number; label: string; blob: Blob }[]>((resolve) => {
    const query = db.transaction("w").objectStore("w").getAll();
    query.onsuccess = () => resolve(query.result as { id: number; label: string; blob: Blob }[]);
    query.onerror = () => resolve([]);
  });
}
async function saveWall(label: string, blob: Blob) {
  const db = await openWallDb();
  return new Promise<void>((resolve) => {
    const tx = db.transaction("w", "readwrite");
    tx.objectStore("w").add({ label, blob });
    tx.oncomplete = () => resolve();
    tx.onerror = () => resolve();
  });
}
async function deleteWall(id: number) {
  const db = await openWallDb();
  return new Promise<void>((resolve) => {
    const tx = db.transaction("w", "readwrite");
    tx.objectStore("w").delete(id);
    tx.oncomplete = () => resolve();
    tx.onerror = () => resolve();
  });
}

class AppBoundary extends Component<{ children: ReactNode; close: () => void }, { error: string | null }> {
  state = { error: null as string | null };
  static getDerivedStateFromError(error: unknown) {
    return { error: error instanceof Error ? error.message : String(error) };
  }
  render() {
    if (this.state.error === null) return this.props.children;
    return (
      <WindowFrame title="App error" icon={X} close={this.props.close}>
        <div className="p-6 text-sm">
          <p className="font-semibold">This app crashed.</p>
          <p className="mt-2 break-words text-muted-foreground">{this.state.error}</p>
        </div>
      </WindowFrame>
    );
  }
}

function Personalize({ settings, patch, custom, addWall, removeWall }: { settings: OsSettings; patch: (patch: Partial<OsSettings>) => void; custom: { id: number; label: string; url: string }[]; addWall: (file: File) => void; removeWall: (id: number) => void }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const slider = (label: string, key: "blur" | "dim" | "lockBlur" | "lockDim", max: number, unit: string) => (
    <label className="block text-xs">
      <span className="flex justify-between"><span>{label}</span><span className="text-muted-foreground">{settings[key]}{unit}</span></span>
      <input type="range" min={0} max={max} value={settings[key]} onChange={(event) => patch({ [key]: Number(event.target.value) } as Partial<OsSettings>)} className="mt-2 w-full" />
    </label>
  );
  const chip = "rounded-md px-3 py-1.5 text-xs";
  return (
    <div className="mt-8 space-y-6 text-sm">
      <section>
        <h3 className="font-semibold">Your wallpapers</h3>
        <p className="mt-1 text-xs text-muted-foreground">Add any image from this device. It stays only in this browser.</p>
        <button type="button" onClick={() => fileRef.current?.click()} className="mt-3 rounded-md bg-primary px-3 py-1.5 text-xs text-primary-foreground">Add from device</button>
        <input ref={fileRef} type="file" accept="image/*" multiple hidden onChange={(event) => { Array.from(event.target.files ?? []).forEach((file) => addWall(file)); event.target.value = ""; }} />
        {custom.map((wall) => (
          <div key={wall.id} className="mt-2 flex items-center gap-3 text-xs">
            <img src={wall.url} alt="" className="h-8 w-14 rounded object-cover" />
            <span className="min-w-0 flex-1 truncate">{wall.label}</span>
            <button type="button" onClick={() => removeWall(wall.id)} className="rounded-md bg-secondary px-2 py-1">Remove</button>
          </div>
        ))}
      </section>
      <section className="space-y-4">
        <h3 className="font-semibold">Look and feel</h3>
        {slider("Wallpaper blur", "blur", 24, "px")}
        {slider("Wallpaper darkness", "dim", 80, "%")}
        {slider("Lock screen blur", "lockBlur", 30, "px")}
        {slider("Lock screen darkness", "lockDim", 100, "%")}
        <div className="flex items-center justify-between text-xs">
          <span>24-hour clock</span>
          <button type="button" onClick={() => patch({ clock24: !settings.clock24 })} className={`${chip} ${settings.clock24 ? "bg-primary text-primary-foreground" : "bg-secondary"}`}>{settings.clock24 ? "On" : "Off"}</button>
        </div>
      </section>
      <section>
        <h3 className="font-semibold">Widgets</h3>
        <p className="mt-1 text-xs text-muted-foreground">Add widgets to the desktop and drag them by their title.</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {WIDGET_LIST.map((widget) => {
            const on = settings.widgets.includes(widget.id);
            return (
              <button key={widget.id} type="button" onClick={() => patch({ widgets: on ? settings.widgets.filter((id) => id !== widget.id) : [...settings.widgets, widget.id] })} className={`${chip} ${on ? "bg-primary text-primary-foreground" : "bg-secondary"}`}>
                {on ? "✓ " : "+ "}{widget.label}
              </button>
            );
          })}
        </div>
        <button type="button" onClick={() => patch(DEFAULT_SETTINGS)} className="mt-4 rounded-md bg-secondary px-3 py-1.5 text-xs">Reset look and widgets</button>
      </section>
    </div>
  );
}

function WidgetShell({ title, offset, onMove, onRemove, children }: { title: string; offset: { x: number; y: number }; onMove: (pos: { x: number; y: number }) => void; onRemove: () => void; children: ReactNode }) {
  const drag = useRef<{ sx: number; sy: number; ox: number; oy: number } | null>(null);
  return (
    <div style={{ transform: `translate(${offset.x}px, ${offset.y}px)` }} className="glass-panel pointer-events-auto w-60 rounded-lg text-xs">
      <div
        onPointerDown={(event) => {
          if ((event.target as HTMLElement).closest("button")) return;
          drag.current = { sx: event.clientX, sy: event.clientY, ox: offset.x, oy: offset.y };
          event.currentTarget.setPointerCapture(event.pointerId);
        }}
        onPointerMove={(event) => {
          const d = drag.current;
          if (d) onMove({ x: d.ox + event.clientX - d.sx, y: d.oy + event.clientY - d.sy });
        }}
        onPointerUp={() => { drag.current = null; }}
        className="flex cursor-grab touch-none items-center justify-between px-3 py-2 font-semibold"
      >
        <span>{title}</span>
        <button type="button" aria-label={`Remove ${title} widget`} onClick={onRemove} className="rounded p-0.5 hover:bg-secondary"><X className="size-3.5" /></button>
      </div>
      <div className="px-3 pb-3">{children}</div>
    </div>
  );
}

function MusicWidget() {
  const [tracks, setTracks] = useState<{ name: string; url: string }[]>([]);
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [volume, setVolume] = useState(0.7);
  const [stream, setStream] = useState("");
  const audio = useRef<HTMLAudioElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const current = tracks[index];
  useEffect(() => {
    if (audio.current) audio.current.volume = volume;
  }, [volume]);
  useEffect(() => {
    const el = audio.current;
    if (!el || !current) return;
    if (playing) el.play().catch(() => setPlaying(false));
    else el.pause();
  }, [playing, current?.url]); // eslint-disable-line react-hooks/exhaustive-deps
  const step = (delta: number) => tracks.length && setIndex((value) => (value + delta + tracks.length) % tracks.length);
  const btn = "rounded-md bg-secondary px-2.5 py-1.5 hover:bg-secondary/70";
  return (
    <div className="space-y-2">
      <audio ref={audio} src={current?.url} loop={tracks.length === 1} onEnded={() => step(1)} />
      <p className="truncate">{current ? current.name : "No song yet"}</p>
      <div className="flex items-center justify-center gap-2">
        <button type="button" aria-label="Previous" onClick={() => step(-1)} className={btn}>⏮</button>
        <button type="button" aria-label={playing ? "Pause" : "Play"} onClick={() => current && setPlaying((value) => !value)} className={`${btn} px-4`}>{playing ? "⏸" : "▶"}</button>
        <button type="button" aria-label="Next" onClick={() => step(1)} className={btn}>⏭</button>
      </div>
      <input type="range" min={0} max={1} step={0.05} value={volume} aria-label="Volume" onChange={(event) => setVolume(Number(event.target.value))} className="w-full" />
      <div className="flex gap-1">
        <input value={stream} onChange={(event) => setStream(event.target.value)} placeholder="Stream URL (mp3…)" aria-label="Stream URL" className="min-w-0 flex-1 rounded-md bg-secondary px-2 py-1 outline-none" />
        <button type="button" onClick={() => { if (!/^https?:\/\//i.test(stream)) return; setTracks((list) => [...list, { name: stream.replace(/^https?:\/\//i, ""), url: stream }]); setStream(""); }} className={btn}>Add</button>
      </div>
      <button type="button" onClick={() => fileRef.current?.click()} className={`${btn} w-full`}>Add songs from device</button>
      <input ref={fileRef} type="file" accept="audio/*" multiple hidden onChange={(event) => { const files = Array.from(event.target.files ?? []); setTracks((list) => [...list, ...files.map((file) => ({ name: file.name.replace(/\.[^.]+$/, ""), url: URL.createObjectURL(file) }))]); event.target.value = ""; }} />
      <p className="text-[10px] text-muted-foreground">Device songs last until you close this tab.</p>
    </div>
  );
}

function NotesWidget() {
  const [text, setText] = useState("");
  useEffect(() => {
    try {
      setText(localStorage.getItem("pos-widget-note") ?? "");
    } catch {
      // storage unavailable
    }
  }, []);
  return (
    <textarea
      value={text}
      placeholder="Quick note…"
      aria-label="Quick note"
      onChange={(event) => {
        setText(event.target.value);
        try {
          localStorage.setItem("pos-widget-note", event.target.value);
        } catch {
          // storage unavailable
        }
      }}
      className="h-24 w-full resize-none rounded-md bg-secondary p-2 outline-none"
    />
  );
}

function CalendarWidget() {
  const now = new Date();
  const first = new Date(now.getFullYear(), now.getMonth(), 1).getDay();
  const days = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const cells: (number | null)[] = [...Array.from({ length: first }, () => null), ...Array.from({ length: days }, (_, i) => i + 1)];
  return (
    <div>
      <p className="mb-2 text-center font-semibold">{now.toLocaleDateString("en-US", { month: "long", year: "numeric" })}</p>
      <div className="grid grid-cols-7 gap-1 text-center text-[10px]">
        {["S", "M", "T", "W", "T", "F", "S"].map((day, i) => <span key={i} className="text-muted-foreground">{day}</span>)}
        {cells.map((day, i) => <span key={i} className={day === now.getDate() ? "rounded bg-primary text-primary-foreground" : ""}>{day}</span>)}
      </div>
    </div>
  );
}

function StopwatchWidget() {
  const [ms, setMs] = useState(0);
  const [run, setRun] = useState(false);
  useEffect(() => {
    if (!run) return;
    const timer = window.setInterval(() => setMs((value) => value + 100), 100);
    return () => window.clearInterval(timer);
  }, [run]);
  const sec = ms / 1000;
  return (
    <div className="text-center">
      <p className="font-['Orbitron',sans-serif] text-2xl tabular-nums">{String(Math.floor(sec / 60)).padStart(2, "0")}:{(sec % 60).toFixed(1).padStart(4, "0")}</p>
      <div className="mt-2 flex justify-center gap-2">
        <button type="button" onClick={() => setRun((value) => !value)} className="rounded-md bg-primary px-3 py-1 text-primary-foreground">{run ? "Pause" : "Start"}</button>
        <button type="button" onClick={() => { setRun(false); setMs(0); }} className="rounded-md bg-secondary px-3 py-1">Reset</button>
      </div>
    </div>
  );
}
