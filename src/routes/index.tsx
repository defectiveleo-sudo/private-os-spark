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
  Music,
  CalendarDays,
  Clock3,
  Bell,
  Film,
  Image as ImageIcon,
  RotateCw,
  Camera,
  Info,
  Palette,
  Save,
  Gamepad2,
  Layers,
  PanelsTopLeft,
} from "lucide-react";
import { CalendarUtility, ClockUtility, PhotosUtility } from "@/components/desktop-utilities";
import { OsButton } from "@/components/os-button";
import mountainAsset from "@/assets/private-os-mountains.jpg.asset.json";
import cherryAsset from "@/assets/private-os-cherry.jpg.asset.json";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "PRIVATE OS — Your space, your rules" },
      { name: "description", content: "PRIVATE OS: a glass desktop with browser, files, notes, calendar, photos, and familiar window controls." },
      { property: "og:title", content: "PRIVATE OS — Your space, your rules" },
      { property: "og:description", content: "PRIVATE OS: a glass desktop with browser, files, notes, calendar, photos, and familiar window controls." },
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

const CalendarIcon: IconComponent = ({ className }) => <span className={`app-icon app-icon-calendar ${className ?? ""}`}><CalendarDays /></span>;
const ClockIcon: IconComponent = ({ className }) => <span className={`app-icon app-icon-clock ${className ?? ""}`}><Clock3 /></span>;
const PhotosIcon: IconComponent = ({ className }) => <span className={`app-icon app-icon-photos ${className ?? ""}`}><ImageIcon /></span>;


const LINK_APPS = [
  { id: "spotify", label: "Spotify", url: "https://open.spotify.com/", tone: "from-green-400 to-green-700", icon: Music },
];
const linkLauncher = LINK_APPS.map((app) => ({
  id: app.id,
  label: app.label,
  icon: (({ className }) => <Tile tone={app.tone} glyph="[&>svg]:size-[56%] [&>svg]:text-white" className={className}><app.icon /></Tile>) as IconComponent,
}));

const OS_VERSION = "1.0";
const CHANGELOG = [
  { v: "1.4", date: "10 Oct 2026", items: ["New dock: one floating glass bar with menu, apps, pinned apps and Task view", "Right-click a dock app to open, close or pin it", "Dock page in Settings: pin, reorder, auto-hide and resize", "Ctrl+K search for apps, files and commands"] },
  { v: "1.3", date: "9 Oct 2026", items: ["Settings animations now run in every app", "New settings: glass blur and opacity, wallpaper slideshow, dock size, reduce motion, system or Mint cursors", "Backup page to export and import your setup", "About page with shortcuts and changelog"] },
  { v: "1.2", date: "9 Oct 2026", items: ["Settings center with Themes, Configs and Settings pages", "New cursor set", "Games app with your own game list", "Ambient glow, page transitions, staggered entrances and hover glow"] },
  { v: "1.1", date: "8 Oct 2026", items: ["Removed the movie HUB, PlayStation and controller cards", "New apps: Camera, Media Player and System Info", "Run dialog (Alt+R) and date in the tray", "Glassier surfaces, rounder corners and 200ms smooth motion"] },
  { v: "1.0", date: "4 Oct 2026", items: ["Liquid glass windows, menus and dock with rounder corners", "Smoother window, menu and button animations", "Changelog in the start screen and start menu", "Removed Discord, Crunchyroll, GeForce NOW and Xbox"] },
  { v: "0.9", date: "4 Oct 2026", items: ["Private HUB movie widget and Private Hill window", "Media and console cards in the top-right corner", "Video-style right-click menu and movable dock", "Full-screen app grid"] },
  { v: "0.8", date: "3 Oct 2026", items: ["Windows 11 style snapping and Task View", "Native search results", "Weather, Paint and To-Do apps"] },
  { v: "0.7", date: "3 Oct 2026", items: ["Power menu with lock, sleep and shut down", "Desktop widgets and desktop app icons", "Custom wallpapers, blur and lock screen darkness"] },
  { v: "0.6", date: "2 Oct 2026", items: ["Multi-window desktop, Files, Notes, Calculator and Terminal", "BeeZ and YouTube apps", "Proxy server failover"] },
];

function ChangelogList({ limit }: { limit?: number }) {
  return (
    <div className="space-y-3 text-left">
      {CHANGELOG.slice(0, limit).map((entry) => (
        <div key={entry.v}>
          <p className="flex items-baseline justify-between text-[11px] font-bold text-[#f6d28b]"><span>v{entry.v}</span><span className="font-medium text-white/45">{entry.date}</span></p>
          <ul className="mt-1 space-y-0.5 text-[11px] text-white/80">
            {entry.items.map((item) => <li key={item} className="flex gap-1.5"><span className="text-white/40">•</span>{item}</li>)}
          </ul>
        </div>
      ))}
    </div>
  );
}

const CameraIcon: IconComponent = ({ className }) => <Tile tone="from-slate-400 to-slate-700" glyph="[&>svg]:size-[56%] [&>svg]:text-white" className={className}><Camera /></Tile>;
const MediaIcon: IconComponent = ({ className }) => <Tile tone="from-orange-400 to-rose-600" glyph="[&>svg]:size-[56%] [&>svg]:text-white" className={className}><Film /></Tile>;
const AboutIcon: IconComponent = ({ className }) => <Tile tone="from-cyan-400 to-blue-700" glyph="[&>svg]:size-[56%] [&>svg]:text-white" className={className}><Info /></Tile>;

const GamesIcon: IconComponent = ({ className }) => <Tile tone="from-violet-500 to-fuchsia-700" glyph="[&>svg]:size-[56%] [&>svg]:text-white" className={className}><Gamepad2 /></Tile>;

const dockApps: { id: string; label: string; icon: IconComponent }[] = [
  { id: "browser", label: "PRIVATE Browser", icon: PrivateBrowserIcon },
  { id: "files", label: "Files", icon: FolderIcon },
  { id: "notes", label: "Notes", icon: NotesIcon },
  { id: "calc", label: "Calculator", icon: CalcIcon },
  { id: "figure", label: "Figure Cloud", icon: CloudIcon },
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
  { id: "calendar", label: "Calendar", icon: CalendarIcon },
  { id: "clock", label: "Clock", icon: ClockIcon },
  { id: "photos", label: "Photos", icon: PhotosIcon },
  { id: "settings", label: "Settings", icon: SettingsIcon },
];
launcherApps.push(...linkLauncher, { id: "games", label: "Games", icon: GamesIcon }, { id: "camera", label: "Camera", icon: CameraIcon }, { id: "media", label: "Media Player", icon: MediaIcon }, { id: "about", label: "System Info", icon: AboutIcon });

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
  const [sound, setSound] = useState(70);
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
  const [runOpen, setRunOpen] = useState(false);
  const [runText, setRunText] = useState("");
  const [runIndex, setRunIndex] = useState(0);
  const [dockShown, setDockShown] = useState(false);
  const [dockMenu, setDockMenu] = useState<{ id: string; x: number; y: number } | null>(null);
  const [battery, setBattery] = useState(100);
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

  useEffect(() => {
    const nav = navigator as Navigator & { getBattery?: () => Promise<{ level: number; addEventListener: (type: string, listener: () => void) => void }> };
    nav.getBattery?.().then((b) => {
      const update = () => setBattery(Math.round(b.level * 100));
      update();
      b.addEventListener("levelchange", update);
    }).catch(() => {});
  }, []);

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

  useEffect(() => {
    if (!settings.slideshow || allWalls.length < 2) return;
    const timer = window.setInterval(() => setWallpaper((index) => (index + 1) % allWalls.length), settings.slideshow * 60000);
    return () => window.clearInterval(timer);
  }, [settings.slideshow, allWalls.length]);

  const closeWindow = (id: string) => {
    setOpenWins((list) => list.filter((item) => item !== id));
    setMinWins((list) => list.filter((item) => item !== id));
    setZOrder((list) => list.filter((item) => item !== id));
  };

  // DOM order of windows never changes (moving an iframe in the DOM would reload it); only z-index does.
  const raise = (id: string) => setZOrder((list) => (list[list.length - 1] === id ? list : [...list.filter((item) => item !== id), id]));

  const openApp = (id: string): void => {
    const link = LINK_APPS.find((app) => app.id === id);
    if (link) {
      setBrowserStart(link.url);
      return openApp("browser");
    }
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

  const extraStyle = {
    ...(settings.glassBlur !== 42 ? { "--glass-blur": `${settings.glassBlur}px` } : {}),
    ...(settings.glassOpacity > 0 ? { "--glass-tint": `color-mix(in oklab, var(--card) ${settings.glassOpacity}%, transparent)` } : {}),
  };
  const themeStyle = ({ ...extraStyle, ...(settings.accent
    ? { "--primary": settings.accent, "--ring": settings.accent, "--primary-foreground": readableOn(settings.accent), "--scroll": settings.scrollAccent || settings.accent }
    : { "--scroll": settings.scrollAccent || "rgba(255,255,255,.28)" }) }) as React.CSSProperties;

  const lookupApp = (id: string) => launcherApps.find((item) => item.id === id) ?? dockApps.find((item) => item.id === id);
  const dockList = [...settings.dockPins, ...openWins.filter((id) => !settings.dockPins.includes(id))].flatMap((id) => {
    const app = lookupApp(id);
    return app ? [{ id, app }] : [];
  });
  const dockHidden = settings.dockAutoHide && !dockShown && !startMenu && !dockMenu && !launcher && !taskView && !quickMenu;
  const hideShift = settings.dockPos === "right" ? "translateX(160%)" : settings.dockPos === "top" ? "translateY(-160%)" : "translateY(160%)";

  const webSearch = (text: string) => {
    const looksLikeSite = /^[\w-]+(\.[\w-]+)+(\/|$)/.test(text);
    setBrowserStart(/^https?:\/\//i.test(text) ? text : looksLikeSite ? `https://${text}` : `https://duckduckgo.com/?q=${encodeURIComponent(text)}`);
    openApp("browser");
  };
  const commands: { label: string; run: () => void }[] = [
    { label: "Lock screen", run: () => setLocked(true) },
    { label: "Sleep", run: () => setPower("sleep") },
    { label: "Toggle ambient glow", run: () => patchSettings((current) => ({ ambient: !current.ambient })) },
    { label: "Toggle reduce motion", run: () => patchSettings((current) => ({ reduceMotion: !current.reduceMotion })) },
    { label: "Toggle dock auto-hide", run: () => patchSettings((current) => ({ dockAutoHide: !current.dockAutoHide })) },
    { label: "Reload PRIVATE OS", run: () => window.location.reload() },
  ];
  const spotQuery = runText.trim().toLowerCase();
  const spotlight: { key: string; label: string; hint: string; run: () => void }[] = !runOpen
    ? []
    : [
        ...launcherApps.filter((item) => !spotQuery || item.label.toLowerCase().includes(spotQuery)).slice(0, 8).map((item) => ({ key: `app-${item.id}`, label: item.label, hint: "App", run: () => openApp(item.id) })),
        ...commands.filter((item) => spotQuery && item.label.toLowerCase().includes(spotQuery)).map((item) => ({ key: `cmd-${item.label}`, label: item.label, hint: "Command", run: item.run })),
        ...(spotQuery.length >= 2
          ? Object.entries(readFs()).filter(([path, value]) => typeof value === "string" && path.toLowerCase().includes(spotQuery)).slice(0, 6).map(([path]) => ({ key: `file-${path}`, label: path, hint: "File", run: () => { try { localStorage.setItem("pos-note-path", path); } catch { /* ignore */ } window.dispatchEvent(new Event("pos-note")); openApp("notes"); } }))
          : []),
        ...(spotQuery ? [{ key: "web", label: `Search the web for “${runText.trim()}”`, hint: "Web", run: () => webSearch(runText.trim()) }] : []),
      ];
  const runSpotlight = (hit?: { run: () => void }) => {
    if (!hit) return;
    setRunOpen(false);
    setRunText("");
    setRunIndex(0);
    hit.run();
  };

  const menuItems: { label: string; action: () => void; icon: ReactNode }[] = [
    { label: "Adjust Wallpaper", action: () => openApp("settings"), icon: <ImageIcon className="size-3" /> },
    { label: "Expand Icons", action: () => patchSettings({ bigIcons: true }), icon: <Maximize className="size-3" /> },
    { label: "Standard Icons", action: () => patchSettings({ bigIcons: false }), icon: <Minimize className="size-3" /> },
    { label: "Search… (Ctrl+K)", action: () => setRunOpen(true), icon: <Terminal className="size-3" /> },
    { label: "Reload", action: () => window.location.reload(), icon: <RotateCw className="size-3" /> },
  ];

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.altKey && event.code === "KeyR") || ((event.ctrlKey || event.metaKey) && event.code === "KeyK")) {
        event.preventDefault();
        setRunOpen((value) => !value);
        return;
      }
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
      if (event.key === "Escape") {
        setTaskView(false);
        setRunOpen(false);
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
      case "youtube": return <YouTubeApp close={close} />;
      case "minecraft": return <MinecraftApp close={close} />;
      case "settings": return <WallpaperSettings wallpaper={wallpaper} setWallpaper={setWallpaper} walls={allWalls} custom={customWalls} addWall={addWall} removeWall={removeWall} settings={settings} patch={patchSettings} close={close} />;
      case "files": return <FilesWindow close={close} open={openApp} />;
      case "notes": return <NotesApp close={close} />;
      case "calendar": return <WindowFrame title="Calendar" icon={CalendarIcon} close={close}><CalendarUtility /></WindowFrame>;
      case "clock": return <WindowFrame title="Clock" icon={ClockIcon} close={close}><ClockUtility /></WindowFrame>;
      case "photos": return <WindowFrame title="Photos" icon={PhotosIcon} close={close}><PhotosUtility initialPhotos={allWalls.map(wall => ({ label: wall.label, src: wall.thumb }))} /></WindowFrame>;
      case "calc": return <CalculatorApp close={close} />;
      case "terminal": return <TerminalApp close={close} open={openApp} />;
      case "weather": return <WeatherApp close={close} />;
      case "paint": return <PaintApp close={close} />;
      case "todo": return <TodoApp close={close} />;
      case "games": return <GamesApp close={close} launch={(url) => { setBrowserStart(url); openApp("browser"); }} />;
      case "camera": return <CameraApp close={close} />;
      case "media": return <MediaApp close={close} />;
      case "about": return <AboutApp close={close} />;
      case "taskmgr": return <TaskManagerApp close={close} wins={openWins} end={closeWindow} show={openApp} />;
      default: return null;
    }
  };

  if (phase === "start") return <StartScreen onStart={() => setPhase("boot")} />;
  if (phase === "boot") return <BootScreen />;

  return (
    <main style={themeStyle} data-reduce={settings.reduceMotion ? "" : undefined} data-native-cursor={settings.nativeCursor ? "" : undefined} onContextMenu={(event) => { if ((event.target as HTMLElement).closest("section, nav, aside")) return; event.preventDefault(); setMenu({ x: Math.min(event.clientX, window.innerWidth - 190), y: Math.min(event.clientY, window.innerHeight - 260) }); }} onClick={(event) => { setMenu(null); setDockMenu(null); if (!(event.target as HTMLElement).closest('[data-start], [aria-label^="PRIVATE OS menu"]')) setStartMenu(false); }} className="os-desktop relative h-dvh w-full overflow-hidden bg-background font-sans text-foreground [animation:desktop-in_.9s_cubic-bezier(.22,1,.36,1)]">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0" style={{ filter: `blur(${settings.blur}px)`, transform: settings.blur ? "scale(1.08)" : undefined }}>
          <Wallpaper index={wallpaper} options={allWalls} />
        </div>
      </div>
      <div className="pointer-events-none absolute inset-0 bg-black" style={{ opacity: settings.dim / 100 }} />
      {settings.ambient && (
        <div aria-hidden className="pointer-events-none absolute inset-0 z-[1] overflow-hidden">
          <div className="aurora" />
          {Array.from({ length: 14 }, (_, i) => <span key={i} className="particle" style={{ left: `${(i * 41 + 7) % 100}%`, top: `${(i * 59 + 20) % 100}%`, animationDelay: `${-(i * 2.3) % 12}s`, animationDuration: `${12 + (i % 5) * 3}s` }} />)}
        </div>
      )}
      <div className="absolute inset-0 bg-gradient-to-b from-background/20 via-transparent to-background/35" />

      {settings.dockAutoHide && <div aria-hidden onMouseEnter={() => setDockShown(true)} className={`fixed z-30 ${settings.dockPos === "right" ? "inset-y-0 right-0 w-3" : settings.dockPos === "top" ? "inset-x-0 top-0 h-3" : "inset-x-0 bottom-0 h-3"}`} />}
      <div onMouseEnter={() => setDockShown(true)} onMouseLeave={() => setDockShown(false)} style={{ zoom: settings.dockScale / 100, transition: "transform .32s cubic-bezier(.22,1,.36,1)", transform: dockHidden ? hideShift : undefined }} className={`absolute z-40 flex items-center gap-1.5 md:gap-2 ${settings.dockPos === "right" ? "right-3 top-1/2 -translate-y-1/2 flex-col" : `inset-x-0 mx-auto w-max max-w-[calc(100%-1rem)] flex-wrap justify-center ${settings.dockPos === "top" ? "top-3" : "bottom-3 md:bottom-4"}`}`}>
        <div
          role="separator"
          aria-label="Drag to move the dock to another edge"
          onPointerDown={(event) => event.currentTarget.setPointerCapture(event.pointerId)}
          onPointerUp={(event) => {
            const x = event.clientX / window.innerWidth;
            const y = event.clientY / window.innerHeight;
            patchSettings({ dockPos: x > 0.8 ? "right" : y < 0.25 ? "top" : "bottom" });
          }}
          className={`absolute cursor-grab touch-none rounded-full bg-white/50 ${settings.dockPos === "right" ? "-left-2.5 top-1/2 h-8 w-1 -translate-y-1/2" : settings.dockPos === "top" ? "-bottom-2 left-1/2 h-1 w-8 -translate-x-1/2" : "-top-2 left-1/2 h-1 w-8 -translate-x-1/2"}`}
        />
        <nav aria-label="PRIVATE OS dock" className={`dock-bar dock-glass flex items-center gap-3.5 rounded-2xl px-4 py-2.5 ${settings.dockPos === "right" ? "flex-col" : ""}`}>
          <span data-start id="start-anchor" className="inline-flex">
            <OsButton label="Menu (lock, sleep, power)" onClick={() => {
              const anchor = document.getElementById("start-anchor");
              if (anchor) {
                const box = anchor.getBoundingClientRect();
                const width = Math.min(416, window.innerWidth - 16);
                setStartPos({ left: Math.max(8, Math.min(box.left - 8, window.innerWidth - width - 8)), bottom: window.innerHeight - box.top + 12 });
              }
              setStartMenu((value) => !value);
              setLauncher(false);
              setQuickMenu(false);
            }} className="dock-app group relative size-7 shrink-0 rounded-lg">
              <Layers className="size-6 text-white" />
              <span className="absolute bottom-10 left-1/2 z-50 hidden -translate-x-1/2 whitespace-nowrap rounded bg-popover px-2 py-1 text-[10px] shadow group-hover:block">Menu</span>
            </OsButton>
          </span>
          <OsButton label="Apps" onClick={() => setLauncher((value) => !value)} className="dock-app group relative size-7 shrink-0 rounded-lg">
            <LayoutGrid className="size-5 text-white/80" />
            <span className="absolute bottom-10 left-1/2 z-50 hidden -translate-x-1/2 whitespace-nowrap rounded bg-popover px-2 py-1 text-[10px] shadow group-hover:block">Apps</span>
          </OsButton>
          {dockList.map(({ id, app }) => {
            const Icon = app.icon;
            const open = openWins.includes(id);
            const focused = open && !minWins.includes(id) && zOrder[zOrder.length - 1] === id;
            return (
              <span key={id} onContextMenu={(event) => { event.preventDefault(); event.stopPropagation(); setMenu(null); setDockMenu({ id, x: event.clientX, y: event.clientY }); }} className="contents">
                <OsButton label={app.label} onClick={() => (focused ? setMinWins((list) => [...list, id]) : openApp(id))} className="dock-app group relative size-7 shrink-0 rounded-lg md:size-8">
                  <Icon className={settings.bigIcons ? "size-8 md:size-9" : "size-7 md:size-8"} />
                  <span className="absolute bottom-11 left-1/2 z-50 hidden -translate-x-1/2 whitespace-nowrap rounded bg-popover px-2 py-1 text-[10px] shadow group-hover:block">{app.label}</span>
                  {open && <span className={`absolute -bottom-2 left-1/2 size-1 -translate-x-1/2 rounded-full ${focused ? "bg-white" : "bg-white/50"}`} />}
                </OsButton>
              </span>
            );
          })}
          <span aria-hidden className={`bg-white/15 ${settings.dockPos === "right" ? "h-px w-5" : "h-5 w-px"}`} />
          <OsButton label="Task view (Alt+W)" onClick={() => { setTaskView((value) => !value); setStartMenu(false); setLauncher(false); }} className="dock-app group relative size-7 shrink-0 rounded-lg">
            <PanelsTopLeft className="size-5 text-white/80" />
            <span className="absolute bottom-10 left-1/2 z-50 hidden -translate-x-1/2 whitespace-nowrap rounded bg-popover px-2 py-1 text-[10px] shadow group-hover:block">Task view</span>
          </OsButton>
        </nav>

        <div className={`dock-glass flex h-9 items-center gap-2 rounded-2xl px-2.5 text-xs font-medium tabular-nums text-white md:h-10 md:gap-3 md:px-3 ${settings.dockPos === "right" ? "hidden" : ""}`}>
          <button type="button" onClick={() => setQuickMenu((value) => !value)} aria-label="Open quick settings" className="flex items-center gap-2 rounded-md outline-none focus-visible:ring-2 focus-visible:ring-ring md:gap-3">
            <Signal className="hidden size-3.5 md:block" />
            <Wifi className="size-3.5" />
            <BatteryFull className="size-4" />
            <span className="flex flex-col items-end leading-tight"><span>{timeLabel}</span>{settings.showDate && <span className="text-[9px] text-white/60">{time.toLocaleDateString(undefined, { day: "numeric", month: "short" })}</span>}</span>
          </button>
          {canFullscreen && (
            <OsButton label={fullscreen ? "Exit full screen" : "Full screen"} onClick={toggleFullscreen} className="size-6 shrink-0 rounded-md hover:bg-white/15">
              {fullscreen ? <Minimize className="size-4" /> : <Maximize className="size-4" />}
            </OsButton>
          )}
        </div>
      </div>

      <div className="desktop-status"><span className="flex items-center gap-2"><ShieldCheck className="size-4 text-primary" /><span>PRIVATE OS</span></span><span>{dateLabel.toLowerCase()} · {time.toLocaleDateString(undefined, { month: "short", day: "numeric" })}</span></div>

      {quickMenu && (
        <aside className="glass-panel quick-settings absolute bottom-20 right-3 z-50 w-[min(22rem,calc(100%-1.5rem))] rounded-lg p-5">
          <div className="mb-5 flex items-center justify-between"><p className="text-sm font-semibold">Quick settings</p><OsButton label="Open settings" onClick={() => { setQuickMenu(false); openApp("settings"); }} className="utility-icon"><Settings className="size-4" /></OsButton></div>
          <div className="grid grid-cols-3 gap-2"><div className="quick-tile"><Wifi className="size-5" /><span>Online</span></div><OsButton onClick={() => setSound(v => v === 0 ? 70 : 0)} className="quick-tile"><Volume2 className="size-5" /><span>{sound ? "Sound" : "Muted"}</span></OsButton><OsButton onClick={() => { setQuickMenu(false); setLocked(true); }} className="quick-tile"><LockKeyhole className="size-5" /><span>Lock</span></OsButton></div>
          <label className="mt-5 flex items-center gap-3 text-xs"><Volume2 className="size-4" /><input aria-label="OS sound level" type="range" min="0" max="100" value={sound} onChange={e => setSound(Number(e.target.value))} className="min-w-0 flex-1 accent-primary" /><span className="w-8 text-right">{sound}%</span></label>
          <label className="mt-4 flex items-center gap-3 text-xs"><span>Dim</span><input aria-label="Desktop dimming" type="range" min="0" max="70" value={settings.dim} onChange={e => patchSettings({ dim: Number(e.target.value) })} className="min-w-0 flex-1 accent-primary" /></label>
          <div className="mt-5 flex items-center justify-between border-t border-border pt-3 text-xs text-muted-foreground"><span className="flex items-center gap-2"><BatteryFull className="size-4" />{battery}%</span><span>Local session</span></div>
        </aside>
      )}

      {settings.showIcons && settings.desktop.length > 0 && (
        <div className="pointer-events-none absolute left-3 top-3 z-[9] flex max-h-[calc(100dvh-7rem)] flex-col flex-wrap content-start gap-2">
          {settings.desktop.map((id) => {
            const app = launcherApps.find((item) => item.id === id) ?? dockApps.find((item) => item.id === id);
            if (!app) return null;
            const Icon = app.icon;
            return (
              <div key={id} className="group pointer-events-auto relative w-20 text-center">
                <OsButton label={`Open ${app.label}`} onClick={() => openApp(id)} className="flex w-full flex-col items-center gap-1 rounded-lg p-2 hover:bg-white/10">
                  <Icon className={settings.bigIcons ? "size-16" : "size-12"} />
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
        <aside data-start style={{ left: startPos.left, bottom: startPos.bottom }} className="glass-panel os-start-menu fixed z-50 flex max-h-[min(36rem,calc(100dvh-6rem))] w-[min(26rem,calc(100vw-1rem))] flex-col gap-4 overflow-auto rounded-3xl p-4 [animation:window-in_.22s_cubic-bezier(.22,1,.36,1)]">
          <div className="flex items-center justify-between"><div className="flex items-center gap-2"><ShieldCheck className="size-5 text-primary" /><span className="text-sm font-semibold">PRIVATE OS</span></div><span className="text-xs text-muted-foreground">Personal</span></div>
          <label className="flex items-center gap-2 rounded-md border border-border bg-secondary px-3"><Search className="size-4 text-muted-foreground" /><input aria-label="Search start menu" placeholder="Search apps" value={query} onChange={event => setQuery(event.target.value)} className="h-10 min-w-0 flex-1 bg-transparent text-sm outline-none" /></label>
          <div>
            <p className="mb-2 text-xs font-semibold uppercase text-muted-foreground">Pinned apps</p>
            <div className="grid grid-cols-4 gap-2">
              {launcherApps.filter(app => app.label.toLowerCase().includes(query.toLowerCase())).map(({ id, label, icon: Icon }) => {
                const pinned = settings.desktop.includes(id);
                return (
                  <div key={id} className="relative">
                    <OsButton label={`Launch ${label}`} onClick={() => { setStartMenu(false); openApp(id); }} className="flex w-full flex-col items-center gap-1 rounded-md p-2 text-[11px] hover:bg-secondary">
                      <Icon className="size-10" />
                      <span className="w-full truncate text-center">{label}</span>
                    </OsButton>
                    <button type="button" aria-label={pinned ? `Remove ${label} from desktop` : `Add ${label} to desktop`} onClick={() => patchSettings((current) => ({ desktop: current.desktop.includes(id) ? current.desktop.filter((item) => item !== id) : [...current.desktop, id] }))} className={`absolute right-0 top-0 rounded-full px-1.5 text-[10px] ${pinned ? "bg-primary text-primary-foreground" : "bg-black/50 text-white"}`}>{pinned ? "✓" : "+"}</button>
                  </div>
                );
              })}
            </div>

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
        <div className={`pointer-events-none absolute right-3 z-[9] flex flex-col items-end gap-3 ${settings.railHidden ? "top-3" : "top-72"}`}>
          {settings.widgets.map((id) => (
            <WidgetShell key={id} title={WIDGET_LIST.find((item) => item.id === id)?.label ?? id} offset={settings.wpos[id] ?? { x: 0, y: 0 }} onMove={(pos) => patchSettings((current) => ({ wpos: { ...current.wpos, [id]: pos } }))} onRemove={() => patchSettings((current) => ({ widgets: current.widgets.filter((item) => item !== id) }))}>
              {id === "music" ? <MusicWidget /> : id === "notes" ? <NotesWidget /> : id === "calendar" ? <CalendarWidget /> : <StopwatchWidget />}
            </WidgetShell>
          ))}
        </div>
      )}

      {taskView && (
        <div onClick={() => setTaskView(false)} className="absolute inset-0 z-[45] stagger flex flex-wrap content-center items-center justify-center gap-4 bg-black/55 p-6 backdrop-blur-md [animation:window-in_.22s_cubic-bezier(.22,1,.36,1)]">
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

      {runOpen && (
        <div onClick={() => setRunOpen(false)} className="absolute inset-0 z-[46] flex items-start justify-center bg-black/30 px-3 pt-[14dvh] backdrop-blur-sm">
          <div onClick={(event) => event.stopPropagation()} className="glass-panel w-[min(34rem,100%)] overflow-hidden rounded-3xl [animation:window-in_.22s_cubic-bezier(.22,1,.36,1)]">
            <div className="flex items-center gap-3 border-b border-white/10 px-4">
              <Search className="size-4 text-white/60" />
              <input
                autoFocus
                value={runText}
                aria-label="Search"
                placeholder="Search apps, files and commands..."
                onChange={(event) => { setRunText(event.target.value); setRunIndex(0); }}
                onKeyDown={(event) => {
                  if (event.key === "ArrowDown") { event.preventDefault(); setRunIndex((value) => Math.min(value + 1, spotlight.length - 1)); }
                  else if (event.key === "ArrowUp") { event.preventDefault(); setRunIndex((value) => Math.max(value - 1, 0)); }
                  else if (event.key === "Enter") { event.preventDefault(); runSpotlight(spotlight[runIndex]); }
                }}
                className="h-12 w-full bg-transparent text-sm outline-none"
              />
            </div>
            <ul className="stagger max-h-[50dvh] overflow-auto p-1.5">
              {spotlight.map((hit, index) => (
                <li key={hit.key}>
                  <button type="button" onClick={() => runSpotlight(hit)} onMouseEnter={() => setRunIndex(index)} className={`flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2 text-left text-xs ${index === runIndex ? "bg-primary/20" : ""}`}>
                    <span className="truncate font-medium">{hit.label}</span>
                    <span className="shrink-0 text-[10px] text-white/50">{hit.hint}</span>
                  </button>
                </li>
              ))}
              {spotlight.length === 0 && <li className="p-4 text-center text-xs text-white/50">No results</li>}
            </ul>
          </div>
        </div>
      )}

      {dockMenu && (() => {
        const app = lookupApp(dockMenu.id);
        const open = openWins.includes(dockMenu.id);
        const pinned = settings.dockPins.includes(dockMenu.id);
        const item = "block w-full rounded-lg px-3 py-2 text-left hover:bg-white/10";
        return (
          <div role="menu" onClick={(event) => event.stopPropagation()} style={{ left: Math.max(8, Math.min(dockMenu.x - 80, window.innerWidth - 184)), ...(settings.dockPos === "top" ? { top: dockMenu.y + 16 } : { bottom: window.innerHeight - dockMenu.y + 12 }) }} className="soft-glass fixed z-50 w-44 rounded-2xl p-1.5 text-[11px] text-white [animation:window-in_.18s_cubic-bezier(.22,1,.36,1)]">
            <p className="px-3 py-1.5 text-[10px] font-semibold text-white/50">{app?.label}</p>
            <button type="button" role="menuitem" className={item} onClick={() => { openApp(dockMenu.id); setDockMenu(null); }}>Open</button>
            {open && <button type="button" role="menuitem" className={item} onClick={() => { closeWindow(dockMenu.id); setDockMenu(null); }}>Close window</button>}
            <button type="button" role="menuitem" className={item} onClick={() => { patchSettings((current) => ({ dockPins: current.dockPins.includes(dockMenu.id) ? current.dockPins.filter((entry) => entry !== dockMenu.id) : [...current.dockPins, dockMenu.id] })); setDockMenu(null); }}>{pinned ? "Unpin from dock" : "Pin to dock"}</button>
          </div>
        );
      })()}

      {power !== "on" && (
        <div role="button" tabIndex={0} aria-label="Wake" onClick={() => { setPower("on"); setLocked(true); if (power === "off") setPhase("boot"); }} className="fixed inset-0 z-[80] grid cursor-pointer place-items-center bg-black text-[11px] tracking-[.3em] text-white/30">
          {power === "off" ? "PRESS ANYTHING TO POWER ON" : ""}
        </div>
      )}


      {menu && (
        <div role="menu" style={{ left: menu.x, top: menu.y }} className="fixed z-50 w-52 soft-glass rounded-2xl p-1.5 text-[11px] text-white shadow-2xl [animation:window-in_.22s_cubic-bezier(.22,1,.36,1)]">
          {menuItems.map((item, index) => (
            <div key={item.label}>
              {index === 4 && <div className="my-1 h-px bg-white/10" />}
              <button type="button" role="menuitem" onClick={() => { item.action(); setMenu(null); }} className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left hover:bg-white/10">
                <span className={`grid size-5 place-items-center rounded bg-white/10`}>{item.icon}</span>
                {item.label}
              </button>
            </div>
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
      style={{ backgroundColor: `rgba(0,0,0,${dim / 100})`, backdropFilter: `blur(${blur}px)` }}
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
  const [showLog, setShowLog] = useState(false);
  return (
    <main className="flex h-dvh flex-col items-center justify-center bg-[radial-gradient(ellipse_at_50%_105%,#47525f_0%,#1a2028_42%,#000_78%)] px-4 pb-[12dvh] text-center">
      <div className="relative [animation:window-in_.22s_cubic-bezier(.22,1,.36,1)]">
        <h1 className="font-['Orbitron',sans-serif] text-[clamp(2rem,10vw,4.4rem)] font-bold leading-none tracking-[.1em] text-[#f2c783] [text-shadow:0_0_22px_rgb(240_170_70/.45)]">PRIVATE</h1>
        <span className="absolute -right-3 -top-2 rounded-[3px] bg-[#f2c783] px-1 py-px font-['Orbitron',sans-serif] text-[8px] font-bold leading-none text-black md:-right-5">OS</span>
      </div>
      <div className="mt-4 h-px w-[62%] max-w-sm bg-gradient-to-r from-white/10 via-white/80 to-white/20" />
      <button type="button" onClick={onStart} className="mt-6 border border-white/15 px-5 py-1.5 font-['Rajdhani',sans-serif] text-[11px] font-bold tracking-[.2em] text-white outline-none transition-colors hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-white/60">
        START
      </button>
      <button type="button" onClick={() => setShowLog((value) => !value)} className="mt-5 font-['Rajdhani',sans-serif] text-[11px] font-semibold tracking-[.2em] text-white/55 outline-none hover:text-white focus-visible:text-white">
        {showLog ? "HIDE CHANGELOG" : `WHAT'S NEW · v${OS_VERSION}`}
      </button>
      {showLog && (
        <div className="glass-panel mt-3 max-h-[34dvh] w-[min(24rem,calc(100%-1rem))] overflow-auto rounded-3xl p-4 [animation:window-in_.22s_cubic-bezier(.22,1,.36,1)]">
          <ChangelogList />
        </div>
      )}
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
    <section onClick={close} className="absolute inset-0 z-30 flex flex-col items-center bg-black/55 px-4 pb-16 pt-[9dvh] backdrop-blur-2xl [animation:window-in_.22s_cubic-bezier(.22,1,.36,1)]">
      <div onClick={(event) => event.stopPropagation()} className="flex w-full max-w-xl items-center gap-2 soft-glass rounded-2xl px-4">
        <Search className="size-4 text-white/60" />
        <input autoFocus value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search all apps..." className="h-11 w-full bg-transparent text-sm text-white outline-none placeholder:text-white/50" />
      </div>
      <div onClick={(event) => event.stopPropagation()} className="mt-10 grid w-full max-w-3xl flex-1 grid-cols-3 content-start gap-x-3 gap-y-6 overflow-auto sm:grid-cols-4 md:grid-cols-6">
        {filtered.map(({ id, label, icon: Icon }) => (
          <OsButton key={id} label={`Open ${label}`} onClick={() => openApp(id)} className="flex flex-col items-center gap-2 rounded-2xl p-2 transition-transform hover:scale-105">
            <Icon className="size-14 md:size-16" />
            <span className="text-center text-[11px] font-semibold leading-tight text-white drop-shadow">{label}</span>
          </OsButton>
        ))}
      </div>
      <div className="flex gap-1.5" aria-hidden><span className="size-1.5 rounded-full bg-white" /><span className="size-1.5 rounded-full bg-white/40" /></div>
      <ChevronDown className="mt-3 size-5 text-white/60" />
    </section>
  );
}

function WindowFrame({ title, icon: Icon, close, children, startMaximized = false, actions }: { title: string; icon: IconComponent; close: () => void; children: React.ReactNode; app?: boolean; startMaximized?: boolean; actions?: ReactNode }) {
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
    const box = el.current?.getBoundingClientRect();
    if (!box) return { x: 8, y: 8, w: 640, h: 480 };
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
  const surface = "glass-panel os-window";
  const position = maximized ? "inset-x-0 top-0 bottom-14 rounded-none md:bottom-[4.5rem]" : "inset-x-2 top-3 bottom-16 rounded-2xl md:inset-x-[8%] md:top-6 md:bottom-20";
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
      className={`absolute flex flex-col overflow-hidden [animation:window-in_.22s_cubic-bezier(.22,1,.36,1)] ${surface} ${minimized ? "pointer-events-none translate-y-8 scale-90 opacity-0" : ""} ${position}`}
    >
      <header className="window-titlebar flex h-11 shrink-0 items-center justify-between gap-2 border-b border-border px-3">
        <div className="flex min-w-0 items-center gap-2 text-xs font-semibold"><Icon className="size-5 shrink-0" /><span className="truncate">{title}</span></div>
        <div className="flex shrink-0 items-center gap-1">{actions}<OsButton label="Minimize" onClick={minimize} className="window-control"><Minus className="size-4" /></OsButton><OsButton label={maximized ? "Restore" : "Maximize"} onClick={toggleMaximize} className="window-control">{maximized ? <Minimize2 className="size-3.5" /> : <Maximize2 className="size-3.5" />}</OsButton><OsButton label="Close" onClick={close} className="window-control hover:bg-destructive"><X className="size-4" /></OsButton></div>
      </header>
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

function WallpaperSettings(props: { wallpaper: number; setWallpaper: (value: number) => void; walls: WallpaperOption[]; custom: { id: number; label: string; url: string }[]; addWall: (file: File) => void; removeWall: (id: number) => void; settings: OsSettings; patch: (patch: Partial<OsSettings>) => void; close: () => void }) {
  return <SettingsCenter {...props} />;
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

type OsSettings = { blur: number; dim: number; lockBlur: number; lockDim: number; clock24: boolean; widgets: string[]; wpos: Record<string, { x: number; y: number }>; desktop: string[]; railHidden: boolean; hubHidden: boolean; bigIcons: boolean; dockPos: "bottom" | "top" | "right"; theme: string; accent: string; scrollAccent: string; particles: boolean; ambient: boolean; reduceMotion: boolean; nativeCursor: boolean; glassBlur: number; glassOpacity: number; dockScale: number; showDate: boolean; showIcons: boolean; slideshow: number; dockPins: string[]; dockAutoHide: boolean };
const DEFAULT_SETTINGS: OsSettings = { blur: 0, dim: 15, lockBlur: 8, lockDim: 65, clock24: true, widgets: [], wpos: {}, desktop: ["files", "browser", "notes", "photos"], railHidden: true, hubHidden: true, bigIcons: false, dockPos: "bottom", theme: "private", accent: "", scrollAccent: "", particles: true, ambient: true, reduceMotion: false, nativeCursor: false, glassBlur: 42, glassOpacity: 0, dockScale: 100, showDate: true, showIcons: true, slideshow: 0, dockPins: ["browser", "files", "notes", "calc", "figure", "settings"], dockAutoHide: false };
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

function WidgetShell({ title, offset, onMove, onRemove, children }: { title: string; offset: { x: number; y: number }; onMove: (pos: { x: number; y: number }) => void; onRemove: () => void; children: ReactNode }) {
  const drag = useRef<{ sx: number; sy: number; ox: number; oy: number } | null>(null);
  return (
    <div style={{ transform: `translate(${offset.x}px, ${offset.y}px)` }} className="glass-panel pointer-events-auto w-60 rounded-2xl text-xs">
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

function CameraApp({ close }: { close: () => void }) {
  const video = useRef<HTMLVideoElement>(null);
  const stream = useRef<MediaStream | null>(null);
  const [error, setError] = useState("");
  const [shots, setShots] = useState<string[]>([]);
  useEffect(() => {
    let cancelled = false;
    (navigator.mediaDevices?.getUserMedia({ video: true }) ?? Promise.reject(new Error("no camera")))
      .then((media) => {
        if (cancelled) return media.getTracks().forEach((track) => track.stop());
        stream.current = media;
        if (video.current) video.current.srcObject = media;
      })
      .catch(() => setError("Camera access was blocked or no camera was found."));
    return () => {
      cancelled = true;
      stream.current?.getTracks().forEach((track) => track.stop());
    };
  }, []);
  const shoot = () => {
    const v = video.current;
    if (!v || !v.videoWidth) return;
    const canvas = document.createElement("canvas");
    canvas.width = v.videoWidth;
    canvas.height = v.videoHeight;
    canvas.getContext("2d")?.drawImage(v, 0, 0);
    setShots((list) => [canvas.toDataURL("image/jpeg", 0.9), ...list].slice(0, 12));
  };
  return (
    <WindowFrame title="Camera" icon={CameraIcon} close={close}>
      <div className="flex min-h-0 flex-1 flex-col items-center gap-3 bg-black/40 p-3">
        {error ? <p className="m-auto text-sm text-muted-foreground">{error}</p> : <video ref={video} autoPlay playsInline muted className="min-h-0 w-full flex-1 rounded-xl bg-black object-contain" />}
        <button type="button" onClick={shoot} disabled={Boolean(error)} aria-label="Take photo" className="grid size-12 shrink-0 place-items-center rounded-full border-4 border-white/70 bg-white/90 disabled:opacity-40" />
        {shots.length > 0 && (
          <div className="flex w-full gap-2 overflow-x-auto">
            {shots.map((shot, index) => (
              <a key={index} href={shot} download={`photo-${index + 1}.jpg`} className="shrink-0"><img src={shot} alt={`Photo ${index + 1}`} className="h-14 rounded-md" /></a>
            ))}
          </div>
        )}
      </div>
    </WindowFrame>
  );
}

function MediaApp({ close }: { close: () => void }) {
  const [item, setItem] = useState<{ name: string; url: string; type: string } | null>(null);
  const input = useRef<HTMLInputElement>(null);
  useEffect(() => () => { if (item) URL.revokeObjectURL(item.url); }, [item]);
  return (
    <WindowFrame title="Media Player" icon={MediaIcon} close={close}>
      <div className="flex shrink-0 items-center gap-2 border-b border-border p-2">
        <button type="button" onClick={() => input.current?.click()} className="rounded-md bg-primary px-3 py-1.5 text-xs text-primary-foreground">Open file</button>
        <span className="min-w-0 flex-1 truncate text-xs text-muted-foreground">{item?.name ?? "Play music, video or view a picture from this device"}</span>
        <input ref={input} type="file" accept="audio/*,video/*,image/*" hidden onChange={(event) => { const file = event.target.files?.[0]; if (file) setItem({ name: file.name, url: URL.createObjectURL(file), type: file.type }); event.target.value = ""; }} />
      </div>
      <div className="flex min-h-0 flex-1 items-center justify-center bg-black/40 p-3">
        {!item && <p className="text-sm text-muted-foreground">Nothing open yet.</p>}
        {item?.type.startsWith("video/") && <video src={item.url} controls autoPlay className="max-h-full max-w-full rounded-xl" />}
        {item?.type.startsWith("audio/") && <audio src={item.url} controls autoPlay className="w-full max-w-md" />}
        {item?.type.startsWith("image/") && <img src={item.url} alt={item.name} className="max-h-full max-w-full rounded-xl object-contain" />}
      </div>
    </WindowFrame>
  );
}

function AboutApp({ close }: { close: () => void }) {
  const [storage, setStorage] = useState("…");
  useEffect(() => {
    navigator.storage?.estimate?.().then((info) => setStorage(`${((info.usage ?? 0) / 1048576).toFixed(1)} MB used`)).catch(() => setStorage("Unavailable"));
  }, []);
  const nav = typeof navigator === "undefined" ? null : (navigator as Navigator & { deviceMemory?: number });
  const rows: [string, string][] = [
    ["System", `PRIVATE OS ${OS_VERSION}`],
    ["Browser", nav?.userAgent.match(/(Firefox|Edg|Chrome|Safari)\/[\d.]+/)?.[0] ?? "Unknown"],
    ["Screen", typeof window === "undefined" ? "" : `${window.screen.width} × ${window.screen.height}`],
    ["Language", nav?.language ?? ""],
    ["Time zone", Intl.DateTimeFormat().resolvedOptions().timeZone],
    ["CPU threads", String(nav?.hardwareConcurrency ?? "?")],
    ["Memory", nav?.deviceMemory ? `${nav.deviceMemory} GB` : "Unknown"],
    ["Local storage", storage],
  ];
  return (
    <WindowFrame title="System Info" icon={AboutIcon} close={close}>
      <div className="flex-1 overflow-auto p-6">
        <div className="mb-5 flex items-center gap-3"><ShieldCheck className="size-10 text-primary" /><div><p className="text-lg font-semibold">PRIVATE OS</p><p className="text-xs text-muted-foreground">Everything stays in this browser.</p></div></div>
        <dl className="grid grid-cols-[8rem_1fr] gap-x-4 gap-y-2 text-sm">
          {rows.map(([label, value]) => (<div key={label} className="contents"><dt className="text-muted-foreground">{label}</dt><dd className="truncate">{value}</dd></div>))}
        </dl>
      </div>
    </WindowFrame>
  );
}

type ThemeDef = { id: string; name: string; sub: string; accent: string };
const THEMES: ThemeDef[] = [
  { id: "private", name: "Private", sub: "Original gold", accent: "" },
  { id: "signature", name: "Signature", sub: "Brand purple", accent: "#7c6cff" },
  { id: "iris", name: "Iris", sub: "Deep violet-blue", accent: "#6d5efc" },
  { id: "midnight", name: "Midnight", sub: "Deep space indigo", accent: "#4f6bff" },
  { id: "cobalt", name: "Cobalt", sub: "Saturated electric blue", accent: "#3b82f6" },
  { id: "aurora", name: "Aurora", sub: "Teal boreal cyan", accent: "#2dd4bf" },
  { id: "sage", name: "Sage", sub: "Muted herbal green", accent: "#7fc58a" },
  { id: "mint", name: "Mint", sub: "Linux Mint green", accent: "#87cf3e" },
  { id: "honey", name: "Honey", sub: "Liquid gold amber", accent: "#fbbf24" },
  { id: "ember", name: "Ember", sub: "Warm orange ember", accent: "#fb923c" },
  { id: "coral", name: "Coral", sub: "Soft coral pink", accent: "#fb7185" },
  { id: "plasma", name: "Plasma", sub: "Hot pink plasma", accent: "#f43f9d" },
];

function readableOn(hex: string) {
  const value = hex.replace("#", "");
  if (value.length !== 6) return "#ffffff";
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(value.slice(i, i + 2), 16));
  return (0.299 * (r ?? 0) + 0.587 * (g ?? 0) + 0.114 * (b ?? 0)) / 255 > 0.6 ? "#0b0b0f" : "#ffffff";
}

type ConfigData = { theme: string; accent: string; scrollAccent: string; particles: boolean; blur: number; dim: number; lockBlur: number; lockDim: number; clock24: boolean; bigIcons: boolean; dockPos: "bottom" | "top" | "right"; widgets: string[]; wallpaper: number };
type SavedConfig = { id: string; name: string; desc: string; tags: string[]; mine: boolean; data: ConfigData };

const PUBLIC_CONFIGS: SavedConfig[] = [
  { id: "pub-clean", name: "Clean Glass", desc: "Light blur, bright desktop, mint accent.", tags: ["Mint", "Glass"], mine: false, data: { theme: "mint", accent: "#87cf3e", scrollAccent: "", particles: false, blur: 6, dim: 8, lockBlur: 10, lockDim: 45, clock24: true, bigIcons: false, dockPos: "bottom", widgets: [], wallpaper: 0 } },
  { id: "pub-night", name: "Night Mode", desc: "Dark and calm with a deep indigo accent.", tags: ["Midnight", "Dark"], mine: false, data: { theme: "midnight", accent: "#4f6bff", scrollAccent: "", particles: true, blur: 0, dim: 45, lockBlur: 12, lockDim: 85, clock24: true, bigIcons: false, dockPos: "bottom", widgets: ["calendar"], wallpaper: 0 } },
];

function Switch({ on, onChange, label }: { on: boolean; onChange: (value: boolean) => void; label: string }) {
  return (
    <button type="button" role="switch" aria-checked={on} aria-label={label} onClick={() => onChange(!on)} className={`relative h-5 w-9 shrink-0 rounded-full ${on ? "bg-primary" : "bg-white/15"}`}>
      <span className={`absolute top-0.5 size-4 rounded-full bg-white shadow transition-[left] duration-200 ${on ? "left-[18px]" : "left-0.5"}`} />
    </button>
  );
}

function CfgCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="fx-card rounded-2xl border border-white/10 bg-black/20 p-4">
      <h4 className="mb-3 flex items-center gap-2 text-[11px] font-semibold"><span className="h-3 w-0.5 rounded bg-primary" />{title}</h4>
      <div className="space-y-3">{children}</div>
    </section>
  );
}

function CfgRow({ title, sub, children }: { title: string; sub?: string; children: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="min-w-0"><p className="text-xs font-medium">{title}</p>{sub && <p className="text-[10px] text-muted-foreground">{sub}</p>}</div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}

function CfgSlider({ label, value, max, unit, onChange, min = 0 }: { label: string; value: number; max: number; unit: string; onChange: (value: number) => void; min?: number }) {
  return (
    <label className="block text-xs">
      <span className="flex justify-between"><span className="font-medium">{label}</span><span className="text-muted-foreground">{value}{unit}</span></span>
      <input type="range" min={min} max={max} value={value} onChange={(event) => onChange(Number(event.target.value))} className="mt-2 w-full accent-[var(--primary)]" />
    </label>
  );
}

function SettingsCenter({ wallpaper, setWallpaper, walls, custom, addWall, removeWall, settings, patch, close }: { wallpaper: number; setWallpaper: (value: number) => void; walls: WallpaperOption[]; custom: { id: number; label: string; url: string }[]; addWall: (file: File) => void; removeWall: (id: number) => void; settings: OsSettings; patch: (patch: Partial<OsSettings>) => void; close: () => void }) {
  const NAV: { id: string; label: string; sub: string; icon: IconComponent; title: string; heading: string }[] = [
    { id: "appearance", label: "Appearance", sub: "Wallpaper and glass", icon: ImageIcon, title: "Appearance", heading: "Wallpapers, blur and darkness" },
    { id: "themes", label: "Themes", sub: "Choose your color story", icon: Palette, title: "Themes", heading: "Choose your color story" },
    { id: "configs", label: "Configs", sub: "Save your loadouts", icon: Save, title: "Configs", heading: "Save your loadouts" },
    { id: "widgets", label: "Widgets", sub: "Desktop widgets", icon: LayoutGrid, title: "Widgets", heading: "Add things to your desktop" },
    { id: "network", label: "Network", sub: "Proxy servers", icon: Wifi, title: "Network", heading: "Proxy and privacy" },
    { id: "settings", label: "Settings", sub: "Customize your OS", icon: Settings, title: "Settings", heading: "Customize your OS" },
    { id: "dock", label: "Dock", sub: "Pinned apps and behaviour", icon: Layers, title: "Dock", heading: "Pin, reorder and hide" },
    { id: "backup", label: "Backup", sub: "Export and import", icon: Download, title: "Backup", heading: "Move your setup between browsers" },
    { id: "about", label: "About", sub: "Version and changelog", icon: Info, title: "About", heading: "What this OS is and what's new" },
  ];
  const [page, setPage] = useState("themes");
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState<"all" | "mine" | "public">("all");
  const [cfgQuery, setCfgQuery] = useState("");
  const [configs, setConfigs] = useState<SavedConfig[]>([]);
  const [logs, setLogs] = useState<string[]>(["Initialized PRIVATE OS", "Settings loaded from this browser"]);
  const wallInput = useRef<HTMLInputElement>(null);
  const backupInput = useRef<HTMLInputElement>(null);
  const log = (line: string) => setLogs((list) => [...list, line].slice(-40));
  useEffect(() => {
    try {
      setConfigs(JSON.parse(localStorage.getItem("pos-configs") ?? "[]") as SavedConfig[]);
    } catch {
      // storage unavailable
    }
  }, []);
  const saveConfigs = (next: SavedConfig[]) => {
    setConfigs(next);
    try {
      localStorage.setItem("pos-configs", JSON.stringify(next));
    } catch {
      // storage unavailable
    }
  };
  const snapshot = (): ConfigData => ({ theme: settings.theme, accent: settings.accent, scrollAccent: settings.scrollAccent, particles: settings.particles, blur: settings.blur, dim: settings.dim, lockBlur: settings.lockBlur, lockDim: settings.lockDim, clock24: settings.clock24, bigIcons: settings.bigIcons, dockPos: settings.dockPos, widgets: settings.widgets, wallpaper });
  const applyConfig = (config: SavedConfig) => {
    const { wallpaper: wp, ...rest } = config.data;
    patch(rest);
    setWallpaper(wp);
    log(`Applied config "${config.name}"`);
  };
  const newConfig = () => {
    const name = window.prompt("Name for this config")?.trim();
    if (!name) return;
    const desc = window.prompt("Short description (optional)")?.trim() ?? "";
    const theme = THEMES.find((item) => item.id === settings.theme);
    saveConfigs([{ id: `cfg-${Date.now()}`, name, desc, tags: [theme?.name ?? "Custom", settings.dockPos === "bottom" ? "Dock bottom" : `Dock ${settings.dockPos}`, settings.blur > 0 ? "Blur" : "Sharp"], mine: true, data: snapshot() }, ...configs]);
    log(`Saved config "${name}"`);
  };
  const importConfig = () => {
    const code = window.prompt("Paste a config code")?.trim();
    if (!code) return;
    try {
      const parsed = JSON.parse(decodeURIComponent(escape(atob(code.replace(/^POS1:/, ""))))) as SavedConfig;
      if (!parsed.name || !parsed.data) throw new Error("bad config");
      saveConfigs([{ ...parsed, id: `cfg-${Date.now()}`, mine: true }, ...configs]);
      log(`Imported config "${parsed.name}"`);
    } catch {
      window.alert("That config code isn't valid.");
    }
  };
  const shareConfig = (config: SavedConfig) => {
    const code = `POS1:${btoa(unescape(encodeURIComponent(JSON.stringify(config))))}`;
    navigator.clipboard?.writeText(code).then(() => log(`Copied code for "${config.name}"`)).catch(() => window.prompt("Copy this config code", code));
  };
  const editConfig = (config: SavedConfig) => {
    const name = window.prompt("Config name", config.name)?.trim();
    if (!name) return;
    const desc = window.prompt("Description", config.desc) ?? config.desc;
    saveConfigs(configs.map((item) => (item.id === config.id ? { ...item, name, desc } : item)));
  };
  const exportAll = () => {
    const data: Record<string, string> = {};
    for (let i = 0; i < localStorage.length; i += 1) {
      const key = localStorage.key(i);
      if (key && key.startsWith("pos-")) data[key] = localStorage.getItem(key) ?? "";
    }
    const link = document.createElement("a");
    link.href = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: "application/json" }));
    link.download = "private-os-backup.json";
    link.click();
    window.setTimeout(() => URL.revokeObjectURL(link.href), 1000);
    log("Exported a backup");
  };
  const importAll = (file: File) => {
    file.text().then((text) => {
      const data = JSON.parse(text) as Record<string, unknown>;
      Object.entries(data).forEach(([key, value]) => {
        if (key.startsWith("pos-") && typeof value === "string") localStorage.setItem(key, value);
      });
      window.location.reload();
    }).catch(() => window.alert("That backup file isn't valid."));
  };
  const chooseTheme = (theme: ThemeDef) => {
    patch({ theme: theme.id, accent: theme.accent });
    log(`Theme set to ${theme.name}`);
  };
  const shown = [...configs, ...PUBLIC_CONFIGS].filter((item) => (tab === "all" || (tab === "mine" ? item.mine : !item.mine)) && `${item.name} ${item.tags.join(" ")}`.toLowerCase().includes(cfgQuery.toLowerCase()));
  const current = NAV.find((item) => item.id === page) ?? NAV[0]!;
  const navShown = NAV.filter((item) => `${item.label} ${item.sub}`.toLowerCase().includes(query.toLowerCase()));
  const btn = "rounded-lg px-3 py-1.5 text-[11px] font-semibold";
  return (
    <WindowFrame title="Settings" icon={SettingsIcon} close={close}>
      <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden md:flex-row">
        {settings.particles && (
          <div aria-hidden className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
            {Array.from({ length: 16 }, (_, i) => <span key={i} className="particle" style={{ left: `${(i * 37) % 100}%`, top: `${(i * 53) % 100}%`, animationDelay: `${-(i * 1.7) % 9}s`, animationDuration: `${8 + (i % 5) * 2}s` }} />)}
          </div>
        )}
        <aside className="relative z-10 flex shrink-0 gap-1 overflow-x-auto border-b border-white/10 p-2 md:w-60 md:flex-col md:overflow-y-auto md:border-b-0 md:border-r md:p-3">
          <div className="hidden items-center gap-3 px-2 pb-3 md:flex">
            <span className="grid size-10 place-items-center rounded-xl bg-primary/20 text-primary"><ShieldCheck className="size-5" /></span>
            <div><p className="font-['Playfair_Display',serif] text-base font-bold leading-tight">PRIVATE</p><p className="text-[10px] italic text-muted-foreground">Custom Edition {OS_VERSION}</p></div>
          </div>
          <label className="hidden items-center gap-2 rounded-xl border border-white/10 bg-black/20 px-3 md:flex"><Search className="size-3.5 text-muted-foreground" /><input aria-label="Search settings" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search features..." className="h-9 w-full bg-transparent text-xs outline-none" /></label>
          {navShown.map((item) => {
            const Icon = item.icon;
            const active = item.id === page;
            return (
              <button key={item.id} type="button" onClick={() => setPage(item.id)} className={`flex shrink-0 items-center gap-3 rounded-xl px-3 py-2.5 text-left md:mt-0.5 ${active ? "bg-primary/15 shadow-[inset_2px_0_0_var(--primary)]" : "hover:bg-white/5"}`}>
                <span className={`grid size-7 place-items-center rounded-lg ${active ? "bg-primary/25 text-primary" : "bg-white/5 text-muted-foreground"}`}><Icon className="size-4" /></span>
                <span className="min-w-0"><span className="block text-xs font-semibold">{item.label}</span><span className="hidden text-[10px] text-muted-foreground md:block">{item.sub}</span></span>
              </button>
            );
          })}
          <div className="mt-auto hidden rounded-xl border border-white/10 bg-black/20 p-3 md:block">
            <p className="flex items-center gap-2 text-xs font-semibold"><span className="size-1.5 rounded-full bg-green-400" />PRIVATE OS</p>
            <p className="mt-0.5 text-[10px] text-muted-foreground">Data stored: <span className="text-primary">Locally</span></p>
          </div>
        </aside>

        <div key={page} className="page-in relative z-10 min-h-0 flex-1 overflow-auto p-4 md:p-6">
          <h2 className="font-['Playfair_Display',serif] text-2xl font-bold">{current.title}</h2>
          <p className="mb-4 text-xs text-muted-foreground">{current.heading}</p>

          {page === "themes" && (
            <div className="stagger grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {THEMES.map((theme) => {
                const active = settings.theme === theme.id;
                const color = theme.accent || "#f2c783";
                return (
                  <button key={theme.id} type="button" onClick={() => chooseTheme(theme)} className={`fx-card relative flex h-28 flex-col overflow-hidden rounded-2xl p-3 text-left ${active ? "shine" : ""}`} style={{ background: `linear-gradient(180deg, color-mix(in oklab, ${color} 16%, transparent), rgb(0 0 0 / .25) 75%)`, border: `1px solid ${active ? color : `color-mix(in oklab, ${color} 22%, transparent)`}`, boxShadow: active ? `0 0 0 1px ${color}, 0 0 24px color-mix(in oklab, ${color} 35%, transparent)` : undefined }}>
                    <span className="flex items-start justify-between"><span className="text-xs font-bold">{theme.name}</span>{active && <span className="rounded-full px-2 py-0.5 text-[9px] font-semibold" style={{ background: `color-mix(in oklab, ${color} 30%, transparent)`, color }}>Active</span>}</span>
                    <span className="mt-0.5 text-[10px] text-muted-foreground">{theme.sub}</span>
                    <span className="mt-auto flex gap-2">
                      <span className="size-3.5 rounded-full" style={{ background: color }} />
                      <span className="size-3.5 rounded-full bg-[#1b1d22] ring-1 ring-white/10" />
                      <span className="size-3.5 rounded-full" style={{ background: `color-mix(in oklab, ${color} 55%, white)` }} />
                    </span>
                  </button>
                );
              })}
            </div>
          )}

          {page === "configs" && (
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <label className="flex min-w-0 flex-1 items-center gap-2 rounded-xl border border-white/10 bg-black/20 px-3"><Search className="size-3.5 text-muted-foreground" /><input aria-label="Search configs" value={cfgQuery} onChange={(event) => setCfgQuery(event.target.value)} placeholder="Search configs by name or tag..." className="h-9 w-full bg-transparent text-xs outline-none" /></label>
                <button type="button" onClick={importConfig} className={`${btn} border border-white/15 bg-white/5`}>Import</button>
                <button type="button" onClick={newConfig} className={`${btn} bg-primary text-primary-foreground`}>+ New</button>
              </div>
              <div className="mt-3 flex gap-4 border-b border-white/10 text-[11px]">
                {(["all", "mine", "public"] as const).map((item) => <button key={item} type="button" onClick={() => setTab(item)} className={`-mb-px border-b-2 pb-2 font-semibold capitalize ${tab === item ? "border-primary text-primary" : "border-transparent text-muted-foreground"}`}>{item}</button>)}
              </div>
              <div className="stagger mt-3 space-y-2">
                {shown.length === 0 && <p className="p-6 text-center text-xs text-muted-foreground">No configs here yet. Press + New to save your current setup.</p>}
                {shown.map((config) => (
                  <div key={config.id} className="fx-card rounded-2xl border border-white/10 bg-black/20 p-3">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div className="min-w-0"><p className="text-xs font-bold">{config.name}</p>{config.desc && <p className="mt-0.5 text-[11px] text-muted-foreground">{config.desc}</p>}</div>
                      <div className="flex shrink-0 gap-1.5">
                        <button type="button" onClick={() => applyConfig(config)} className={`${btn} bg-primary text-primary-foreground`}>Apply</button>
                        <button type="button" onClick={() => shareConfig(config)} className={`${btn} bg-white/10`}>Share</button>
                        {config.mine && <button type="button" onClick={() => editConfig(config)} className={`${btn} bg-white/10`}>Edit</button>}
                        {config.mine && <button type="button" onClick={() => saveConfigs(configs.filter((item) => item.id !== config.id))} className={`${btn} bg-red-500/80 text-white`}>Delete</button>}
                      </div>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-1.5">{config.tags.map((tag) => <span key={tag} className="rounded-md bg-primary/15 px-2 py-0.5 text-[10px] font-medium text-primary">{tag}</span>)}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {page === "appearance" && (
            <div className="stagger space-y-4">
              <CfgCard title="Wallpaper">
                <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                  {walls.map((item, index) => (
                    <button key={`${item.label}-${index}`} type="button" onClick={() => { setWallpaper(index); log(`Wallpaper: ${item.label}`); }} className={`overflow-hidden rounded-xl border-2 text-left ${wallpaper === index ? "border-primary" : "border-transparent"}`}>
                      <img src={item.thumb} alt="" className="aspect-video w-full object-cover" />
                      <span className="block truncate px-2 py-1 text-[10px]">{item.label}</span>
                    </button>
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  <button type="button" onClick={() => wallInput.current?.click()} className={`${btn} bg-primary text-primary-foreground`}>Add from device</button>
                  <input ref={wallInput} type="file" accept="image/*" multiple hidden onChange={(event) => { Array.from(event.target.files ?? []).forEach((file) => addWall(file)); event.target.value = ""; }} />
                </div>
                {custom.map((wall) => (
                  <div key={wall.id} className="flex items-center gap-3 text-xs"><img src={wall.url} alt="" className="h-8 w-14 rounded object-cover" /><span className="min-w-0 flex-1 truncate">{wall.label}</span><button type="button" onClick={() => removeWall(wall.id)} className={`${btn} bg-white/10`}>Remove</button></div>
                ))}
              </CfgCard>
              <CfgCard title="Glass and darkness">
                <CfgSlider label="Wallpaper blur" value={settings.blur} max={24} unit="px" onChange={(value) => patch({ blur: value })} />
                <CfgSlider label="Wallpaper darkness" value={settings.dim} max={80} unit="%" onChange={(value) => patch({ dim: value })} />
                <CfgSlider label="Lock screen blur" value={settings.lockBlur} max={30} unit="px" onChange={(value) => patch({ lockBlur: value })} />
                <CfgSlider label="Lock screen darkness" value={settings.lockDim} max={100} unit="%" onChange={(value) => patch({ lockDim: value })} />
                <CfgSlider label="Glass blur" value={settings.glassBlur} max={80} unit="px" onChange={(value) => patch({ glassBlur: value })} />
                <CfgSlider label="Glass opacity (0 = default)" value={settings.glassOpacity} max={90} unit="%" onChange={(value) => patch({ glassOpacity: value })} />
                <CfgRow title="Wallpaper slideshow" sub="Change the wallpaper automatically">
                  <select aria-label="Wallpaper slideshow" value={settings.slideshow} onChange={(event) => patch({ slideshow: Number(event.target.value) })} className="rounded-md bg-white/10 px-2 py-1 text-xs">
                    <option value={0}>Off</option><option value={1}>Every minute</option><option value={5}>Every 5 minutes</option><option value={15}>Every 15 minutes</option>
                  </select>
                </CfgRow>
              </CfgCard>
            </div>
          )}

          {page === "widgets" && (
            <CfgCard title="Desktop widgets">
              {WIDGET_LIST.map((widget) => {
                const on = settings.widgets.includes(widget.id);
                return (
                  <CfgRow key={widget.id} title={widget.label} sub={on ? "Shown on the desktop. Drag it by its title." : "Hidden"}>
                    <Switch on={on} label={widget.label} onChange={(value) => { patch({ widgets: value ? [...settings.widgets, widget.id] : settings.widgets.filter((id) => id !== widget.id) }); log(`${widget.label} widget ${value ? "added" : "removed"}`); }} />
                  </CfgRow>
                );
              })}
            </CfgCard>
          )}

          {page === "network" && <NetworkPrivacy />}

          {page === "dock" && (
            <div className="stagger space-y-4">
              <CfgCard title="Behaviour">
                <CfgRow title="Auto-hide" sub="Slides away until you move to the screen edge"><Switch on={settings.dockAutoHide} label="Auto-hide the dock" onChange={(value) => patch({ dockAutoHide: value })} /></CfgRow>
                <CfgRow title="Position" sub="Or drag the handle above the dock">
                  <div className="flex gap-1">{(["bottom", "top", "right"] as const).map((pos) => <button key={pos} type="button" onClick={() => patch({ dockPos: pos })} className={`${btn} capitalize ${settings.dockPos === pos ? "bg-primary text-primary-foreground" : "bg-white/10"}`}>{pos}</button>)}</div>
                </CfgRow>
                <CfgSlider label="Dock size" value={settings.dockScale} min={70} max={140} unit="%" onChange={(value) => patch({ dockScale: value })} />
                <CfgRow title="Large icons" sub="Bigger dock and desktop icons"><Switch on={settings.bigIcons} label="Large icons" onChange={(value) => patch({ bigIcons: value })} /></CfgRow>
              </CfgCard>
              <CfgCard title="Pinned apps">
                {settings.dockPins.map((id, index) => {
                  const app = launcherApps.find((item) => item.id === id) ?? dockApps.find((item) => item.id === id);
                  if (!app) return null;
                  const Icon = app.icon;
                  const move = (delta: number) => {
                    const next = [...settings.dockPins];
                    const target = index + delta;
                    if (target < 0 || target >= next.length) return;
                    [next[index], next[target]] = [next[target]!, next[index]!];
                    patch({ dockPins: next });
                  };
                  return (
                    <div key={id} className="flex items-center gap-3">
                      <Icon className="size-8 shrink-0" />
                      <span className="min-w-0 flex-1 truncate text-xs font-medium">{app.label}</span>
                      <button type="button" aria-label={`Move ${app.label} left`} disabled={index === 0} onClick={() => move(-1)} className={`${btn} bg-white/10`}>↑</button>
                      <button type="button" aria-label={`Move ${app.label} right`} disabled={index === settings.dockPins.length - 1} onClick={() => move(1)} className={`${btn} bg-white/10`}>↓</button>
                      <button type="button" onClick={() => patch({ dockPins: settings.dockPins.filter((entry) => entry !== id) })} className={`${btn} bg-white/10`}>Unpin</button>
                    </div>
                  );
                })}
                <select aria-label="Pin an app" value="" onChange={(event) => { if (event.target.value) patch({ dockPins: [...settings.dockPins, event.target.value] }); }} className="w-full rounded-md bg-white/10 px-2 py-2 text-xs">
                  <option value="">Pin another app…</option>
                  {launcherApps.filter((item) => !settings.dockPins.includes(item.id)).map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}
                </select>
              </CfgCard>
            </div>
          )}

          {page === "backup" && (
            <div className="stagger space-y-4">
              <CfgCard title="Backup">
                <p className="text-xs text-muted-foreground">Saves your settings, themes, configs, notes, files and to-dos to one file. Custom wallpapers and music are not included.</p>
                <div className="flex gap-2">
                  <button type="button" onClick={exportAll} className={`${btn} bg-primary text-primary-foreground`}>Export backup</button>
                  <button type="button" onClick={() => backupInput.current?.click()} className={`${btn} bg-white/10`}>Import backup</button>
                  <input ref={backupInput} type="file" accept="application/json" hidden onChange={(event) => { const file = event.target.files?.[0]; if (file) importAll(file); event.target.value = ""; }} />
                </div>
              </CfgCard>
            </div>
          )}

          {page === "about" && (
            <div className="stagger space-y-4">
              <CfgCard title="PRIVATE OS">
                <CfgRow title="Version">{OS_VERSION}</CfgRow>
                <CfgRow title="Data">Stored only in this browser</CfgRow>
              </CfgCard>
              <CfgCard title="Keyboard shortcuts">
                {([["Ctrl + K", "Search apps, files and commands"], ["Alt + W", "Task view"], ["Alt + L", "Lock"], ["Ctrl + Space", "App launcher"], ["Alt + Arrows", "Snap, maximize or minimize a window"], ["Esc", "Close overlays"]] as const).map(([keys, what]) => (
                  <CfgRow key={keys} title={what}><kbd className="rounded-md bg-white/10 px-2 py-1 text-[11px] font-semibold">{keys}</kbd></CfgRow>
                ))}
              </CfgCard>
              <CfgCard title="Changelog"><ChangelogList /></CfgCard>
            </div>
          )}

          {page === "settings" && (
            <div className="grid gap-4 lg:grid-cols-[1fr_14rem]">
              <div className="stagger space-y-4">
                <CfgCard title="General">
                  <CfgRow title="Search key" sub="Search apps, files and commands"><kbd className="rounded-md bg-white/10 px-2 py-1 text-xs font-semibold">Ctrl + K</kbd></CfgRow>
                  <CfgRow title="24-hour clock" sub="Switch between 24h and 12h time"><Switch on={settings.clock24} label="24-hour clock" onChange={(value) => patch({ clock24: value })} /></CfgRow>
                  <CfgRow title="Date in the tray" sub="Show the date under the time"><Switch on={settings.showDate} label="Date in the tray" onChange={(value) => patch({ showDate: value })} /></CfgRow>
                  <CfgRow title="Desktop icons" sub="Show app shortcuts on the desktop"><Switch on={settings.showIcons} label="Desktop icons" onChange={(value) => patch({ showIcons: value })} /></CfgRow>
                </CfgCard>
                <CfgCard title="Appearance">
                  <CfgRow title="Main color" sub="Used for highlights, toggles and selection"><input type="color" aria-label="Main color" value={settings.accent || "#f2c783"} onChange={(event) => patch({ accent: event.target.value, theme: "custom" })} className="h-7 w-12 rounded bg-transparent" /></CfgRow>
                  <CfgRow title="Scroll bar color" sub="Tint applied to scroll bars"><input type="color" aria-label="Scroll bar color" value={settings.scrollAccent || "#9aa4ff"} onChange={(event) => patch({ scrollAccent: event.target.value })} className="h-7 w-12 rounded bg-transparent" /></CfgRow>
                  <CfgRow title="Particles" sub="Soft dots drifting behind settings"><Switch on={settings.particles} label="Particles" onChange={(value) => patch({ particles: value })} /></CfgRow>
                  <CfgRow title="Ambient glow" sub="Slow colour glow and floating dots on the desktop"><Switch on={settings.ambient} label="Ambient glow" onChange={(value) => patch({ ambient: value })} /></CfgRow>
                </CfgCard>
                <CfgCard title="Interface">
                  <CfgRow title="Large icons" sub="Bigger dock and desktop icons"><Switch on={settings.bigIcons} label="Large icons" onChange={(value) => patch({ bigIcons: value })} /></CfgRow>
                  <CfgSlider label="Dock size" value={settings.dockScale} min={70} max={140} unit="%" onChange={(value) => patch({ dockScale: value })} />
                  <CfgRow title="Dock position" sub="Or drag the handle above the dock">
                    <div className="flex gap-1">{(["bottom", "top", "right"] as const).map((pos) => <button key={pos} type="button" onClick={() => patch({ dockPos: pos })} className={`${btn} capitalize ${settings.dockPos === pos ? "bg-primary text-primary-foreground" : "bg-white/10"}`}>{pos}</button>)}</div>
                  </CfgRow>
                </CfgCard>
                <CfgCard title="Accessibility">
                  <CfgRow title="Reduce motion" sub="Turns off animations and transitions"><Switch on={settings.reduceMotion} label="Reduce motion" onChange={(value) => patch({ reduceMotion: value })} /></CfgRow>
                  <CfgRow title="Mint cursors" sub="Off uses your system cursor"><Switch on={!settings.nativeCursor} label="Mint cursors" onChange={(value) => patch({ nativeCursor: !value })} /></CfgRow>
                </CfgCard>
                <CfgCard title="Reset">
                  <button type="button" onClick={() => { patch({ ...DEFAULT_SETTINGS }); log("Appearance reset to defaults"); }} className={`${btn} w-full bg-white/10 py-2`}>Reset look and widgets</button>
                  <button type="button" onClick={() => { if (!window.confirm("Erase all PRIVATE OS data in this browser?")) return; try { localStorage.clear(); sessionStorage.clear(); } catch { /* ignore */ } window.setTimeout(() => window.location.reload(), 200); }} className="w-full rounded-lg bg-red-600 py-2.5 text-xs font-bold text-white">Clear all data</button>
                  <p className="text-[10px] text-muted-foreground">Wipes wallpapers, files, notes and settings stored in this browser.</p>
                </CfgCard>
              </div>
              <aside className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <h4 className="mb-3 flex items-center gap-2 text-[11px] font-semibold"><span className="h-3 w-0.5 rounded bg-primary" />System Logs</h4>
                <ol className="space-y-1 font-mono text-[10px] text-muted-foreground">{logs.map((line, index) => <li key={index}><span className="mr-2 opacity-50">{String(index + 1).padStart(4, "0")}</span>{line}</li>)}</ol>
              </aside>
            </div>
          )}
        </div>
      </div>
    </WindowFrame>
  );
}

const FREE_GAMES = [
  { name: "Hedgewars", sub: "Open-source artillery strategy", url: "https://webwars.link/" },
  { name: "Diablo (shareware)", sub: "Browser port of the free shareware version", url: "https://johnimril.github.io/diablo_web/" },
];

function GamesApp({ close, launch }: { close: () => void; launch: (url: string) => void }) {
  const [custom, setCustom] = useState<{ name: string; url: string }[]>([]);
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  useEffect(() => {
    try {
      setCustom(JSON.parse(localStorage.getItem("pos-games") ?? "[]") as { name: string; url: string }[]);
    } catch {
      // storage unavailable
    }
  }, []);
  const save = (next: { name: string; url: string }[]) => {
    setCustom(next);
    try {
      localStorage.setItem("pos-games", JSON.stringify(next));
    } catch {
      // storage unavailable
    }
  };
  const add = () => {
    const link = /^https?:\/\//i.test(url.trim()) ? url.trim() : `https://${url.trim()}`;
    if (!name.trim() || !url.trim() || !/^https?:\/\/[^\s.]+\.[^\s]+$/i.test(link)) return;
    save([...custom, { name: name.trim(), url: link }]);
    setName("");
    setUrl("");
  };
  const card = "fx-card flex items-center gap-3 rounded-2xl border border-white/10 bg-black/20 p-3 text-left hover:bg-white/10";
  return (
    <WindowFrame title="Games" icon={GamesIcon} close={close}>
      <div className="flex-1 overflow-auto p-4">
        <p className="text-xs font-semibold text-muted-foreground">FREE TO PLAY</p>
        <div className="mt-2 grid gap-2 sm:grid-cols-2">
          {FREE_GAMES.map((game) => (
            <button key={game.url} type="button" onClick={() => launch(game.url)} className={card}>
              <GamesIcon className="size-10 shrink-0" />
              <span className="min-w-0"><span className="block text-sm font-semibold">{game.name}</span><span className="block truncate text-[11px] text-muted-foreground">{game.sub}</span></span>
            </button>
          ))}
        </div>
        <p className="mt-6 text-xs font-semibold text-muted-foreground">YOUR GAMES</p>
        <div className="mt-2 grid gap-2 sm:grid-cols-2">
          {custom.length === 0 && <p className="text-xs text-muted-foreground">Nothing added yet. Add a game you can play in the browser below.</p>}
          {custom.map((game) => (
            <div key={game.url} className={card}>
              <button type="button" onClick={() => launch(game.url)} className="flex min-w-0 flex-1 items-center gap-3 text-left">
                <GamesIcon className="size-10 shrink-0" />
                <span className="min-w-0"><span className="block truncate text-sm font-semibold">{game.name}</span><span className="block truncate text-[11px] text-muted-foreground">{game.url}</span></span>
              </button>
              <button type="button" aria-label={`Remove ${game.name}`} onClick={() => save(custom.filter((item) => item.url !== game.url))} className="rounded p-1 hover:bg-white/10"><X className="size-4" /></button>
            </div>
          ))}
        </div>
        <form onSubmit={(event) => { event.preventDefault(); add(); }} className="mt-4 flex flex-wrap gap-2">
          <input value={name} onChange={(event) => setName(event.target.value)} placeholder="Game name" aria-label="Game name" className="utility-input min-w-0 flex-1" />
          <input value={url} onChange={(event) => setUrl(event.target.value)} placeholder="Web address" aria-label="Game web address" className="utility-input min-w-0 flex-[2]" />
          <button type="submit" className="rounded-md bg-primary px-4 py-1.5 text-xs font-semibold text-primary-foreground">Add game</button>
        </form>
      </div>
    </WindowFrame>
  );
}
