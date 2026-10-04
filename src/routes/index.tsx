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
  CloudSun,
  ListChecks,
  Paintbrush,
  Play,
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
const YOUTUBE_URL = "https://www.youtube.com/";
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

const WindowContext = createContext<{ minimized: boolean; minimize: () => void; focus: () => void; z: number; top: boolean }>({ minimized: false, minimize: () => {}, focus: () => {}, z: 10, top: false });

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

const WeatherIcon: IconComponent = ({ className }) => <Tile tone="from-sky-400 to-blue-700" glyph="[&>svg]:size-[58%] [&>svg]:text-white" className={className}><CloudSun /></Tile>;
const PaintIcon: IconComponent = ({ className }) => <Tile tone="from-pink-400 to-purple-700" glyph="[&>svg]:size-[56%] [&>svg]:text-white" className={className}><Paintbrush /></Tile>;
const TodoIcon: IconComponent = ({ className }) => <Tile tone="from-lime-400 to-green-700" glyph="[&>svg]:size-[56%] [&>svg]:text-white" className={className}><ListChecks /></Tile>;

const YouTubeIcon: IconComponent = ({ className }) => <Tile tone="from-red-500 to-red-800" glyph="[&>svg]:size-[52%] [&>svg]:text-white" className={className}><Play className="fill-white" /></Tile>;

const dockApps: { id: string; label: string; icon: IconComponent }[] = [
  { id: "browser", label: "PRIVATE Browser", icon: PrivateBrowserIcon },
  { id: "figure", label: "Figure Cloud", icon: CloudIcon },
  { id: "beez", label: "BeeZ", icon: BeeZIcon },
  { id: "youtube", label: "YouTube", icon: YouTubeIcon },
  { id: "minecraft", label: "Minecraft", icon: MinecraftIcon },
  { id: "files", label: "Files", icon: FolderIcon },
  { id: "settings", label: "Settings", icon: SettingsIcon },
];

const launcherApps: { id: string; label: string; icon: IconComponent }[] = [
  { id: "browser", label: "Private Browser", icon: PrivateBrowserIcon },
  { id: "figure", label: "Figure Cloud", icon: CloudIcon },
  { id: "beez", label: "BeeZ", icon: BeeZIcon },
  { id: "youtube", label: "YouTube", icon: YouTubeIcon },
  { id: "cherrion", label: "Cherrion", icon: CherryIcon },
  { id: "minecraft", label: "Minecraft", icon: MinecraftIcon },
  { id: "files", label: "Private Files", icon: FolderIcon },
  { id: "notes", label: "Notes", icon: NotesIcon },
  { id: "calc", label: "Calculator", icon: CalcIcon },
  { id: "terminal", label: "Terminal", icon: TerminalIcon },
  { id: "taskmgr", label: "Task Manager", icon: TaskIcon },
  { id: "weather", label: "Weather", icon: WeatherIcon },
  { id: "paint", label: "Paint", icon: PaintIcon },
  { id: "todo", label: "To-Do", icon: TodoIcon },
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
  const [phase, setPhase] = useState<"start" | "boot" | "desktop">("desktop");
  const [wallpaper, setWallpaper] = useState(0);
  const [locked, setLocked] = useState(false);
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
  const [taskView, setTaskView] = useState(false);
  const [dockMode, setDockMode] = useState<"bottom" | "top" | "right" | "floating" | "hidden">("bottom");
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
    ["Taskbar at bottom", () => setDockMode("bottom")],
    ["Taskbar at top", () => setDockMode("top")],
    ["Taskbar on right", () => setDockMode("right")],
    ["Floating taskbar", () => setDockMode("floating")],
    ["Hide taskbar", () => setDockMode("hidden")],
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
        setTaskView((value) => !value);
        return;
      }
      if (event.altKey && ["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(event.key)) {
        event.preventDefault();
        window.dispatchEvent(new CustomEvent("pos-snap", { detail: event.key.replace("Arrow", "").toLowerCase() }));
        return;
      }
      if (event.key === "Escape") setTaskView(false);
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
      case "youtube": return <YouTubeApp close={close} />;
      case "minecraft": return <MinecraftApp close={close} />;
      case "settings": return <WallpaperSettings wallpaper={wallpaper} setWallpaper={setWallpaper} walls={allWalls} custom={customWalls} addWall={addWall} removeWall={removeWall} settings={settings} patch={patchSettings} close={close} />;
      case "files": return <FilesWindow close={close} open={openApp} />;
      case "notes": return <NotesApp close={close} />;
      case "calc": return <CalculatorApp close={close} />;
      case "terminal": return <TerminalApp close={close} open={openApp} />;
      case "weather": return <WeatherApp close={close} />;
      case "paint": return <PaintApp close={close} />;
      case "todo": return <TodoApp close={close} />;
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

      <div className={`os-dock-wrap ${dockMode === "top" ? "os-dock-top" : dockMode === "right" ? "os-dock-right" : dockMode === "floating" ? "os-dock-floating" : dockMode === "hidden" ? "os-dock-hidden" : "os-dock-bottom"}`}>
        <nav aria-label="PRIVATE OS dock" className="os-dock">
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
            }} className="group relative size-7 shrink-0 rounded-md transition-transform hover:-translate-y-0.5 hover:bg-secondary md:size-8">
              <ShieldCheck className="size-4 text-accent md:size-5" />
              <span className="absolute bottom-12 left-0 z-50 hidden whitespace-nowrap rounded bg-popover px-2 py-1 text-[10px] shadow group-hover:block">PRIVATE OS</span>
            </OsButton>
          </span>
          <OsButton label="Task view (Alt+W)" onClick={() => { setTaskView((value) => !value); setStartMenu(false); setLauncher(false); }} className="size-6 shrink-0 rounded-md hover:bg-secondary md:size-7"><LayoutGrid className="size-3.5 text-foreground md:size-4" /></OsButton>
          <OsButton label="Apps" onClick={() => setLauncher((value) => !value)} className="group relative size-6 shrink-0 transition-transform hover:-translate-y-0.5">
            <LayoutGrid className="size-3.5 text-muted-foreground" />
            <span className="absolute bottom-9 left-0 z-50 hidden whitespace-nowrap rounded bg-popover px-2 py-1 text-[10px] shadow group-hover:block">Apps</span>
          </OsButton>
          {dockApps.map(({ id, label, icon: Icon }) => (
            <OsButton key={id} label={label} onClick={() => openApp(id)} className="group relative size-6 shrink-0 transition-transform hover:-translate-y-1">
              <Icon className="size-5" />
              <span className="absolute bottom-9 left-0 z-50 hidden whitespace-nowrap rounded bg-popover px-2 py-1 text-[10px] shadow group-hover:block">{label}</span>
              {openWins.includes(id) && <span className="absolute -bottom-1 size-1 rounded-full bg-white" />}
            </OsButton>
          ))}
        </nav>

        <div className="os-status">
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

      <section className="absolute inset-x-0 top-[5.5%] z-10 text-center">
        <p className="os-day pl-[.42em] font-['Zen_Dots','Orbitron',sans-serif] text-[clamp(.68rem,1.35vw,1.05rem)] tracking-[.42em] text-accent">{dateLabel}</p>
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
        <aside data-start style={{ left: startPos.left, bottom: startPos.bottom }} className="os-feature-panel fixed z-50 w-[min(22rem,calc(100vw-1rem))] overflow-hidden [animation:window-in_.18s_ease-out]">
          <header className="flex items-center justify-between border-b border-border px-4 py-3"><div><p className="text-[10px] uppercase tracking-[.22em] text-accent">Private space</p><h2 className="mt-1 text-sm font-semibold">Recommended</h2></div><button type="button" onClick={() => { setStartMenu(false); setLauncher(true); }} className="text-[10px] text-primary hover:underline">All apps</button></header>
          <div className="grid grid-cols-2 gap-2 p-3">
            {[{ id: "figure", label: "Figure Cloud", icon: CloudIcon }, { id: "cherrion", label: "Cherrion", icon: CherryIcon }, { id: "beez", label: "BeeZ", icon: BeeZIcon }, { id: "browser", label: "Private Browser", icon: PrivateBrowserIcon }].map(({ id, label, icon: Icon }) => (
              <button key={id} type="button" onClick={() => { setStartMenu(false); openApp(id); }} className="group overflow-hidden rounded-md border border-border bg-secondary/60 text-left hover:border-primary/50">
                <div className="flex h-20 items-center justify-center bg-input/70"><Icon className="size-11 transition-transform group-hover:scale-105" /></div>
                <div className="flex items-center justify-between px-2.5 py-2"><span className="truncate text-[10px] font-semibold">{label}</span><span className="rounded-sm bg-primary px-1.5 py-0.5 text-[8px] font-bold text-primary-foreground">OPEN</span></div>
              </button>
            ))}
          </div>
          <div className="grid grid-cols-5 gap-1 border-t border-border p-2 text-center text-[9px] text-muted-foreground">
            {startItems.map(([label, action]) => (
              <button key={label} type="button" onClick={() => { setStartMenu(false); action(); }} className="rounded-sm px-1 py-1.5 hover:bg-secondary hover:text-foreground">{label}</button>
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

      {taskView && (
        <div onClick={() => setTaskView(false)} className="absolute inset-0 z-[45] flex flex-wrap content-center items-center justify-center gap-4 bg-black/55 p-6 backdrop-blur-md [animation:window-in_.18s_ease-out]">
          {openWins.length === 0 && <p className="text-sm text-white/80">No open windows. Open an app from the dock.</p>}
          {openWins.map((id) => {
            const app = launcherApps.find((item) => item.id === id) ?? dockApps.find((item) => item.id === id);
            const Icon = app?.icon ?? Folder;
            const label = app?.label ?? id;
            return (
              <div key={id} onClick={(event) => event.stopPropagation()} className="relative w-52 rounded-xl bg-white/10 p-3 text-white ring-1 ring-white/20 hover:bg-white/20">
                <button type="button" onClick={() => { setTaskView(false); openApp(id); }} className="flex w-full flex-col items-center gap-2 py-3">
                  <Icon className="size-14" />
                  <span className="text-xs">{label}{minWins.includes(id) ? " (minimized)" : ""}</span>
                </button>
                <button type="button" aria-label={`Close ${label}`} onClick={() => closeWindow(id)} className="absolute right-2 top-2 rounded-full bg-black/50 p-1"><X className="size-3" /></button>
              </div>
            );
          })}
        </div>
      )}

      {power !== "on" && (
        <div role="button" tabIndex={0} aria-label="Wake" onClick={() => { setPower("on"); setLocked(true); if (power === "off") setPhase("boot"); }} className="fixed inset-0 z-[80] grid cursor-pointer place-items-center bg-black text-[11px] tracking-[.3em] text-white/30">
          {power === "off" ? "PRESS ANYTHING TO POWER ON" : ""}
        </div>
      )}

      {menu && (
        <div role="menu" style={{ left: menu.x, top: menu.y }} className="os-context fixed z-50 w-44 p-1 text-[10px] [animation:window-in_.15s_ease-out]">
          {menuItems.map(([label, action]) => (
            <button key={label} type="button" role="menuitem" onClick={() => { action(); setMenu(null); }} className="block w-full rounded-md px-3 py-2 text-left hover:bg-secondary">{label}</button>
          ))}
        </div>
      )}

      {launcher && <AppLauncher query={query} setQuery={setQuery} openApp={openApp} close={() => setLauncher(false)} />}
      {openWins.map((id) => (
        <WindowContext.Provider key={id} value={{ minimized: minWins.includes(id), minimize: () => setMinWins((list) => (list.includes(id) ? list : [...list, id])), focus: () => raise(id), z: 10 + Math.max(0, zOrder.indexOf(id)), top: zOrder[zOrder.length - 1] === id && !minWins.includes(id) }}>
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
      className={`absolute inset-0 z-[60] flex cursor-pointer flex-col items-center pt-[30dvh] text-center text-[#f6d28b] transition-all duration-700 ${locked ? "" : "pointer-events-none -translate-y-8 opacity-0"}`}
    >
      <p className="pl-[.1em] font-['Zen_Dots','Orbitron',sans-serif] text-[clamp(2.4rem,11vw,5rem)] leading-none tracking-[.1em] [text-shadow:0_0_22px_rgb(240_170_70/.45),0_2px_12px_rgb(0_0_0/.6)]">{day.slice(0, 3)}</p>
      <p className="mt-4 pl-[.25em] font-['Rajdhani',sans-serif] text-[11px] font-semibold tracking-[.25em] text-[#eadfc4]/90 sm:text-sm">{date}</p>
      <p className="mt-3 pl-[.15em] font-['Orbitron',sans-serif] text-[clamp(1.1rem,5vw,1.8rem)] font-bold leading-none tracking-[.12em] text-[#f9e2ae] [text-shadow:0_0_14px_rgb(240_170_70/.4)]">{clock}</p>
      <div className="mt-10 flex items-center gap-3" aria-hidden>
        <span className="size-3 rounded-full border border-white/40" />
        <span className="size-4 rounded-full bg-emerald-400" />
        <span className="size-4 rounded-[5px] bg-lime-300" />
        <span className="size-4 rounded-[5px] bg-cyan-300" />
      </div>
      <p className="absolute bottom-8 pl-[.3em] font-['Rajdhani',sans-serif] text-[11px] font-medium tracking-[.3em] text-white/50">TAP OR PRESS ANY KEY TO UNLOCK</p>
    </div>
  );
}

function StartScreen({ onStart }: { onStart: () => void }) {
  return (
    <main className="flex h-dvh flex-col items-center justify-center bg-[radial-gradient(ellipse_at_50%_105%,#47525f_0%,#1a2028_42%,#000_78%)] px-4 pb-[12dvh] text-center">
      <div className="relative [animation:window-in_.9s_ease-out]">
        <h1 className="font-['Orbitron',sans-serif] text-[clamp(2rem,10vw,4.4rem)] font-bold leading-none tracking-[.1em] text-[#f2c783] [text-shadow:0_0_22px_rgb(240_170_70/.45)]">PRIVATE</h1>
        <span className="absolute -right-3 -top-2 rounded-[3px] bg-[#f2c783] px-1 py-px font-['Orbitron',sans-serif] text-[8px] font-bold leading-none text-black md:-right-5">OS</span>
      </div>
      <div className="mt-4 h-px w-[62%] max-w-sm bg-gradient-to-r from-white/10 via-white/80 to-white/20" />
      <button type="button" onClick={onStart} className="mt-6 border border-white/15 px-5 py-1.5 font-['Rajdhani',sans-serif] text-[11px] font-bold tracking-[.2em] text-white outline-none transition-colors hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-white/60">
        START
      </button>
      <p className="absolute bottom-6 text-[10px] tracking-wide text-white/30">Press ENTER twice to skip</p>
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
    <section className="os-launcher absolute inset-0 z-30 flex flex-col items-center justify-center px-5 py-16 [animation:window-in_.24s_ease-out]">
      <button type="button" aria-label="Close launcher" onClick={close} className="absolute inset-0 -z-10 cursor-default" />
      <div className="flex w-full max-w-xl items-center gap-2 border-b border-border/60 px-1">
        <Search className="size-3.5 text-muted-foreground" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search all apps" className="h-8 min-w-0 flex-1 bg-transparent text-[11px] outline-none placeholder:text-muted-foreground" />
        <OsButton label="Close launcher" onClick={close} className="size-7 rounded-sm hover:bg-secondary"><X className="size-3.5" /></OsButton>
      </div>
      <p className="mt-5 w-full max-w-xl text-[9px] uppercase tracking-[.25em] text-muted-foreground">All applications</p>
      <div className="mt-4 grid w-full max-w-xl grid-cols-4 gap-x-5 gap-y-6 overflow-auto sm:grid-cols-6">
        {filtered.map(({ id, label, icon: Icon }) => (
          <OsButton key={id} label={`Open ${label}`} onClick={() => openApp(id)} className="group flex min-h-16 flex-col gap-1.5 p-1 transition-transform hover:-translate-y-1">
            <Icon className="size-9 drop-shadow-lg transition-transform group-hover:scale-105" /><span className="text-center text-[9px] leading-tight text-foreground/85">{label}</span>
          </OsButton>
        ))}
      </div>
      <ChevronDown className="mt-5 size-3 text-muted-foreground" />
    </section>
  );
}

function WindowFrame({ title, icon: Icon, close, children, app = false, startMaximized = false, actions }: { title: string; icon: IconComponent; close: () => void; children: React.ReactNode; app?: boolean; startMaximized?: boolean; actions?: ReactNode }) {
  const { minimized, minimize, focus, z, top } = useContext(WindowContext);
  const el = useRef<HTMLElement>(null);
  const [rect, setRect] = useState<WinRect | null>(null);
  const [snap, setSnap] = useState<string | null>(null);
  const prevRect = useRef<WinRect | null>(null);
  const live = useRef<WinRect | null>(null);
  const gesture = useRef<{ kind: "move" | "resize"; mode: string; sx: number; sy: number; start: WinRect; ratio: number } | null>(null);
  const [maximized, setMaximized] = useState(startMaximized);
  const toggleMaximize = () => {
    setSnap(null);
    setMaximized((value) => !value);
  };
  const measure = (): WinRect => {
    const box = el.current!.getBoundingClientRect();
    return { x: box.left, y: box.top, w: box.width, h: box.height };
  };
  // Move/resize by writing straight to the element (no React re-render per pointer move = smooth).
  const place = (next: WinRect) => {
    live.current = next;
    const node = el.current;
    if (!node) return;
    node.style.left = `${next.x}px`;
    node.style.top = `${next.y}px`;
    node.style.width = `${next.w}px`;
    node.style.height = `${next.h}px`;
    node.style.right = "auto";
    node.style.bottom = "auto";
  };
  const restore = () => {
    setSnap(null);
    setRect(prevRect.current);
  };
  const snapTo = (zone: string) => {
    if (zone === "up") return setMaximized(true);
    if (zone === "down") {
      if (maximized) return setMaximized(false);
      if (snap) return restore();
      return minimize();
    }
    if (zone !== "left" && zone !== "right") return;
    if (!snap && !maximized && el.current) prevRect.current = rect ?? measure();
    const half = Math.round(window.innerWidth / 2) - 12;
    setMaximized(false);
    setSnap(zone);
    setRect({ x: zone === "left" ? 8 : Math.round(window.innerWidth / 2) + 4, y: 8, w: half, h: window.innerHeight - 88 });
  };
  useEffect(() => {
    if (!top) return;
    const handler = (event: Event) => snapTo((event as CustomEvent<string>).detail);
    window.addEventListener("pos-snap", handler);
    return () => window.removeEventListener("pos-snap", handler);
  });
  const surface = app ? (maximized ? "bg-background" : "border border-border bg-background shadow-2xl") : maximized ? "bg-card/95 backdrop-blur-xl" : "os-window";
  const position = maximized ? "inset-x-0 top-0 bottom-11 rounded-none" : "inset-x-2 top-[7%] bottom-14 rounded-sm md:inset-x-[10%] md:top-[8%] md:bottom-[9%]";
  return (
    <section
      ref={el}
      style={{ zIndex: z, ...(rect && !maximized ? { left: rect.x, top: rect.y, width: rect.w, height: rect.h, right: "auto", bottom: "auto" } : {}) }}
      onDoubleClick={(event) => {
        const target = event.target as HTMLElement;
        if (target.closest("header") && !target.closest("button")) toggleMaximize();
      }}
      onPointerDown={(event) => {
        focus();
        const target = event.target as HTMLElement;
        if (maximized || event.button !== 0 || !target.closest("header") || target.closest("button")) return;
        const start = rect ?? measure();
        const ratio = (event.clientX - start.x) / Math.max(1, start.w);
        let base = start;
        live.current = null;
        if (snap && prevRect.current) {
          base = { ...prevRect.current, x: event.clientX - prevRect.current.w * ratio, y: 8 };
          setSnap(null);
          place(base);
        } else prevRect.current = start;
        gesture.current = { kind: "move", mode: "", sx: event.clientX, sy: event.clientY, start: base, ratio };
        event.currentTarget.setPointerCapture(event.pointerId);
      }}
      onPointerMove={(event) => {
        const g = gesture.current;
        if (!g) return;
        const dx = event.clientX - g.sx;
        const dy = event.clientY - g.sy;
        if (g.kind === "move") {
          place({ ...g.start, x: Math.min(window.innerWidth - 80, Math.max(80 - g.start.w, g.start.x + dx)), y: Math.min(window.innerHeight - 60, Math.max(0, g.start.y + dy)) });
          showSnap(event.clientX <= 6 ? "left" : event.clientX >= window.innerWidth - 6 ? "right" : event.clientY <= 4 ? "max" : null);
        } else {
          place({ ...g.start, w: g.mode.includes("e") ? Math.max(320, g.start.w + dx) : g.start.w, h: g.mode.includes("s") ? Math.max(220, g.start.h + dy) : g.start.h });
        }
      }}
      onPointerUp={(event) => {
        const g = gesture.current;
        gesture.current = null;
        if (!g) return;
        showSnap(null);
        if (live.current) setRect(live.current);
        if (g.kind !== "move" || !live.current) return;
        const zone = event.clientX <= 6 ? "left" : event.clientX >= window.innerWidth - 6 ? "right" : event.clientY <= 4 ? "up" : null;
        if (zone) snapTo(zone);
      }}
      className={`absolute flex flex-col overflow-hidden [animation:window-in_.28s_ease-out] ${surface} ${minimized ? "hidden" : ""} ${position}`}
    >
      {app ? (
        <header className="relative flex h-8 shrink-0 items-center border-b border-border bg-secondary/70 px-2">
          <div className="flex items-center">
            <button type="button" aria-label="Close" onClick={close} className="grid size-5 place-items-center outline-none"><span className="size-2 rounded-full bg-destructive" /></button>
            <button type="button" aria-label="Minimize" onClick={minimize} className="grid size-5 place-items-center outline-none"><span className="size-2 rounded-full bg-accent" /></button>
            <button type="button" aria-label={maximized ? "Restore" : "Maximize"} onClick={toggleMaximize} className="grid size-5 place-items-center outline-none"><span className="size-2 rounded-full bg-primary" /></button>
          </div>
          <div className="pointer-events-none absolute inset-x-0 flex items-center justify-center gap-2 text-xs font-semibold text-white/80"><Icon className="size-4" />{title}</div>
          <div className="relative z-10 ml-auto flex items-center text-white/70">{actions}</div>
        </header>
      ) : (
        <header className="flex h-9 shrink-0 items-center justify-between border-b border-border bg-secondary/45 px-2.5">
          <div className="flex items-center gap-2 text-[11px] font-semibold"><Icon className="size-3.5 text-primary" />{title}</div>
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
            live.current = null;
            setSnap(null);
            gesture.current = { kind: "resize", mode, sx: event.clientX, sy: event.clientY, start: rect ?? measure(), ratio: 0 };
            event.currentTarget.setPointerCapture(event.pointerId);
          }}
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

function YouTubeApp({ close }: { close: () => void }) {
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
          const response = await fetch(`/api/proxy?check=1&url=${encodeURIComponent(YOUTUBE_URL)}`);
          const info = (await response.json()) as { frameable?: boolean | null };
          if (info.frameable === false) direct = false;
        } catch {
          // assume the site can be opened directly
        }
        if (cancelled) return;
        setFallbackSrc(direct ? YOUTUBE_URL : `/api/proxy?url=${encodeURIComponent(YOUTUBE_URL)}`);
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
    if (element && controller) controller.createFrame(element).go(YOUTUBE_URL);
  }, [mode]);

  const openOutside = (
    <button type="button" aria-label="Open YouTube in a new tab" onClick={() => window.open(YOUTUBE_URL, "_blank", "noopener,noreferrer")} className="grid size-6 place-items-center rounded outline-none hover:bg-white/10">
      <ExternalLink className="size-3.5" />
    </button>
  );

  return (
    <WindowFrame title="YouTube" icon={YouTubeIcon} close={close} app startMaximized actions={openOutside}>
      <div className="relative flex-1 overflow-hidden bg-black">
        {loading && (
          <div className="absolute inset-0 z-10 grid place-items-center bg-[#171717]">
            <div className="text-center">
              <YouTubeIcon className="mx-auto size-20" />
              <p className="mt-5 text-sm font-bold tracking-[.3em] text-white">YOUTUBE</p>
              <p className="mt-1 text-[11px] text-white/50">Loading…</p>
              <div className="mx-auto mt-5 h-1 w-44 overflow-hidden rounded-full bg-white/10"><div className="h-full origin-left bg-[#ff2d2d] [animation:boot-bar_2.2s_ease-in-out_forwards]" /></div>
            </div>
          </div>
        )}
        {mode === "engine" && (
          <iframe ref={frameRef} key="engine" title="YouTube" onLoad={() => setLoading(false)} className="size-full border-0 bg-black" allow={ENGINE_FRAME_PERMISSIONS} />
        )}
        {mode === "fallback" && fallbackSrc && (
          <iframe
            key="fallback"
            title="YouTube"
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
  const [results, setResults] = useState<{ query: string; hits: SearchHit[] | null; error: boolean } | null>(null);
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
    setResults(null);
    pending.current = true;
    setFrameTarget(url);
    setFrameKey((value) => value + 1);
    setAddress(url);
    setLoading(true);
  };

  const runSearch = (query: string) => {
    setAddress(query);
    setResults({ query, hits: null, error: false });
    fetch(`/api/search?q=${encodeURIComponent(query)}`)
      .then((response) => response.json() as Promise<{ hits?: SearchHit[] }>)
      .then((data) => setResults((current) => (current && current.query === query ? { query, hits: data.hits ?? [], error: !data.hits?.length } : current)))
      .catch(() => setResults((current) => (current && current.query === query ? { query, hits: [], error: true } : current)));
  };

  const navigateTo = (value: string) => {
    const clean = value.trim();
    if (!clean) return;
    const isUrl = /^https?:\/\//i.test(clean) || /^(localhost|[\w-]+\.[a-z]{2,})([/:?#]|$)/i.test(clean);
    if (!isUrl) return runSearch(clean);
    const destination = /^https?:\/\//i.test(clean) ? clean : `https://${clean}`;
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
        {results && (
          <div className="absolute inset-0 z-20 overflow-auto bg-background p-4">
            <div className="mx-auto max-w-2xl">
              <p className="text-xs text-muted-foreground">Results for “{results.query}”</p>
              {results.hits === null && <p className="mt-6 text-sm">Searching…</p>}
              {results.error && (
                <p className="mt-6 text-sm">
                  No results came back. <button type="button" className="underline" onClick={() => window.open(`https://duckduckgo.com/?q=${encodeURIComponent(results.query)}`, "_blank", "noopener,noreferrer")}>Open DuckDuckGo in a new tab</button>
                </p>
              )}
              {results.hits?.map((hit) => (
                <button key={hit.url} type="button" onClick={() => navigateTo(hit.url)} className="mt-4 block w-full text-left">
                  <span className="block truncate text-[11px] text-muted-foreground">{hit.url}</span>
                  <span className="block text-sm font-semibold text-primary">{hit.title}</span>
                  <span className="block text-xs text-muted-foreground">{hit.snippet}</span>
                </button>
              ))}
            </div>
          </div>
        )}
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
  override state = { error: null as string | null };
  static getDerivedStateFromError(error: unknown) {
    return { error: error instanceof Error ? error.message : String(error) };
  }
  override render() {
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

type WinRect = { x: number; y: number; w: number; h: number };
type SearchHit = { title: string; url: string; snippet: string };

// Windows 11 style snap preview shown while dragging a window to a screen edge.
function showSnap(zone: "left" | "right" | "max" | null) {
  let node = document.getElementById("snap-preview");
  if (!zone) {
    node?.remove();
    return;
  }
  if (!node) {
    node = document.createElement("div");
    node.id = "snap-preview";
    node.style.cssText = "position:fixed;z-index:60;pointer-events:none;border-radius:12px;background:rgba(255,255,255,.14);border:1px solid rgba(255,255,255,.4);backdrop-filter:blur(6px);transition:all .12s ease";
    document.body.appendChild(node);
  }
  const width = window.innerWidth;
  const half = Math.round(width / 2) - 12;
  Object.assign(node.style, {
    left: `${zone === "right" ? Math.round(width / 2) + 4 : 8}px`,
    top: "8px",
    width: `${zone === "max" ? width - 16 : half}px`,
    height: `${window.innerHeight - 88}px`,
  });
}

const WEATHER_ICONS: Record<number, string> = { 0: "☀️", 1: "🌤️", 2: "⛅", 3: "☁️", 45: "🌫️", 48: "🌫️", 51: "🌦️", 53: "🌦️", 55: "🌧️", 61: "🌧️", 63: "🌧️", 65: "🌧️", 71: "🌨️", 73: "🌨️", 75: "❄️", 80: "🌦️", 81: "🌧️", 82: "⛈️", 95: "⛈️", 96: "⛈️", 99: "⛈️" };

function WeatherApp({ close }: { close: () => void }) {
  const [city, setCity] = useState("");
  const [msg, setMsg] = useState("Search for a city.");
  const [data, setData] = useState<{ place: string; temp: number; wind: number; code: number; days: { d: string; hi: number; lo: number; code: number }[] } | null>(null);
  const load = async (name: string) => {
    if (!name.trim()) return;
    setMsg("Loading…");
    try {
      const geo = (await (await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(name)}&count=1`)).json()) as { results?: { name: string; country?: string; latitude: number; longitude: number }[] };
      const hit = geo.results?.[0];
      if (!hit) return setMsg("City not found.");
      const w = (await (await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${hit.latitude}&longitude=${hit.longitude}&current=temperature_2m,weather_code,wind_speed_10m&daily=temperature_2m_max,temperature_2m_min,weather_code&timezone=auto&forecast_days=5`)).json()) as {
        current: { temperature_2m: number; weather_code: number; wind_speed_10m: number };
        daily: { time: string[]; temperature_2m_max: number[]; temperature_2m_min: number[]; weather_code: number[] };
      };
      setData({
        place: `${hit.name}${hit.country ? `, ${hit.country}` : ""}`,
        temp: w.current.temperature_2m,
        wind: w.current.wind_speed_10m,
        code: w.current.weather_code,
        days: w.daily.time.map((d, i) => ({ d, hi: w.daily.temperature_2m_max[i] ?? 0, lo: w.daily.temperature_2m_min[i] ?? 0, code: w.daily.weather_code[i] ?? 0 })),
      });
      setMsg("");
      try {
        localStorage.setItem("pos-city", name);
      } catch {
        // storage unavailable
      }
    } catch {
      setMsg("Couldn't load the weather.");
    }
  };
  useEffect(() => {
    try {
      const saved = localStorage.getItem("pos-city");
      if (saved) {
        setCity(saved);
        void load(saved);
      }
    } catch {
      // storage unavailable
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <WindowFrame title="Weather" icon={CloudSun} close={close}>
      <form onSubmit={(event) => { event.preventDefault(); void load(city); }} className="flex shrink-0 gap-2 border-b border-border p-2">
        <input value={city} onChange={(event) => setCity(event.target.value)} placeholder="City" aria-label="City" className="min-w-0 flex-1 rounded-md bg-secondary px-3 py-1.5 text-xs outline-none" />
        <button type="submit" className="rounded-md bg-primary px-3 py-1.5 text-xs text-primary-foreground">Search</button>
      </form>
      <div className="flex-1 overflow-auto p-5 text-center">
        {msg && <p className="text-sm text-muted-foreground">{msg}</p>}
        {data && !msg && (
          <>
            <p className="text-sm text-muted-foreground">{data.place}</p>
            <p className="mt-2 text-6xl">{WEATHER_ICONS[data.code] ?? "🌡️"}</p>
            <p className="mt-2 text-4xl font-semibold">{Math.round(data.temp)}°C</p>
            <p className="text-xs text-muted-foreground">Wind {Math.round(data.wind)} km/h</p>
            <div className="mx-auto mt-6 grid max-w-md grid-cols-5 gap-2 text-xs">
              {data.days.map((day) => (
                <div key={day.d} className="rounded-md bg-secondary p-2">
                  <p>{new Date(`${day.d}T12:00`).toLocaleDateString("en-US", { weekday: "short" })}</p>
                  <p className="my-1 text-lg">{WEATHER_ICONS[day.code] ?? "🌡️"}</p>
                  <p>{Math.round(day.hi)}°</p>
                  <p className="text-muted-foreground">{Math.round(day.lo)}°</p>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </WindowFrame>
  );
}

function PaintApp({ close }: { close: () => void }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const [color, setColor] = useState("#ffffff");
  const [width, setWidth] = useState(4);
  const clear = () => {
    const c = canvas.current;
    const ctx = c?.getContext("2d");
    if (!c || !ctx) return;
    ctx.fillStyle = "#111111";
    ctx.fillRect(0, 0, c.width, c.height);
  };
  useEffect(() => {
    clear();
  }, []);
  const point = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const box = event.currentTarget.getBoundingClientRect();
    return { x: (event.clientX - box.left) * (event.currentTarget.width / box.width), y: (event.clientY - box.top) * (event.currentTarget.height / box.height) };
  };
  const draw = (event: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawing.current) return;
    const ctx = event.currentTarget.getContext("2d")!;
    const p = point(event);
    ctx.lineWidth = width;
    ctx.lineCap = "round";
    ctx.strokeStyle = color;
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(p.x, p.y);
  };
  const save = () => {
    const link = document.createElement("a");
    link.href = canvas.current?.toDataURL("image/png") ?? "";
    link.download = "painting.png";
    link.click();
  };
  const btn = "rounded-md bg-secondary px-2.5 py-1.5 text-xs";
  return (
    <WindowFrame title="Paint" icon={Paintbrush} close={close}>
      <div className="flex shrink-0 flex-wrap items-center gap-2 border-b border-border p-2">
        <input type="color" value={color} aria-label="Colour" onChange={(event) => setColor(event.target.value)} className="h-8 w-10 rounded bg-transparent" />
        <input type="range" min={1} max={40} value={width} aria-label="Brush size" onChange={(event) => setWidth(Number(event.target.value))} className="w-24" />
        <button type="button" onClick={() => setColor("#111111")} className={btn}>Eraser</button>
        <button type="button" onClick={clear} className={btn}>Clear</button>
        <button type="button" onClick={save} className={`${btn} ml-auto bg-primary text-primary-foreground`}>Save PNG</button>
      </div>
      <div className="flex min-h-0 flex-1 items-center justify-center bg-black p-2">
        <canvas
          ref={canvas}
          width={1000}
          height={620}
          className="max-h-full max-w-full touch-none rounded bg-[#111]"
          onPointerDown={(event) => {
            drawing.current = true;
            event.currentTarget.setPointerCapture(event.pointerId);
            const ctx = event.currentTarget.getContext("2d")!;
            ctx.beginPath();
            const p = point(event);
            ctx.moveTo(p.x, p.y);
            draw(event);
          }}
          onPointerMove={draw}
          onPointerUp={() => { drawing.current = false; }}
        />
      </div>
    </WindowFrame>
  );
}

function TodoApp({ close }: { close: () => void }) {
  const [items, setItems] = useState<{ id: number; text: string; done: boolean }[]>([]);
  const [text, setText] = useState("");
  useEffect(() => {
    try {
      setItems(JSON.parse(localStorage.getItem("pos-todos") ?? "[]") as { id: number; text: string; done: boolean }[]);
    } catch {
      // storage unavailable
    }
  }, []);
  const save = (next: { id: number; text: string; done: boolean }[]) => {
    setItems(next);
    try {
      localStorage.setItem("pos-todos", JSON.stringify(next));
    } catch {
      // storage unavailable
    }
  };
  return (
    <WindowFrame title="To-Do" icon={ListChecks} close={close}>
      <form onSubmit={(event) => { event.preventDefault(); if (!text.trim()) return; save([...items, { id: Date.now(), text: text.trim(), done: false }]); setText(""); }} className="flex shrink-0 gap-2 border-b border-border p-2">
        <input value={text} onChange={(event) => setText(event.target.value)} placeholder="Add a task" aria-label="New task" className="min-w-0 flex-1 rounded-md bg-secondary px-3 py-1.5 text-xs outline-none" />
        <button type="submit" className="rounded-md bg-primary px-3 py-1.5 text-xs text-primary-foreground">Add</button>
      </form>
      <div className="flex-1 overflow-auto p-3">
        {items.length === 0 && <p className="p-6 text-center text-sm text-muted-foreground">Nothing to do. Nice.</p>}
        {items.map((item) => (
          <div key={item.id} className="flex items-center gap-3 rounded-md px-3 py-2 hover:bg-secondary">
            <input type="checkbox" checked={item.done} aria-label={`Done: ${item.text}`} onChange={() => save(items.map((entry) => (entry.id === item.id ? { ...entry, done: !entry.done } : entry)))} />
            <span className={`min-w-0 flex-1 truncate text-sm ${item.done ? "text-muted-foreground line-through" : ""}`}>{item.text}</span>
            <button type="button" aria-label={`Delete ${item.text}`} onClick={() => save(items.filter((entry) => entry.id !== item.id))} className="rounded p-1 hover:bg-background/60"><X className="size-4" /></button>
          </div>
        ))}
      </div>
    </WindowFrame>
  );
}
