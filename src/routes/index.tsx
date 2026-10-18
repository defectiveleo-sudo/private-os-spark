import { createFileRoute } from "@tanstack/react-router";
import { installUiSounds, playClick, playHover } from "@/lib/ui-sound";
import { MINI_GAMES, MiniGame, type MiniGameId } from "@/components/mini-games";
import { WelcomeSetup, type WelcomeResult } from "@/components/welcome-setup";
import { Component } from "react";
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ComponentType, type ReactNode } from "react";
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
  ChevronUp,
  Check,
  Crown,
  RotateCcw,
  Check as CheckMark,
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
  ChevronLeft,
  ChevronRight,
  Timer,
  Ruler,
  KeyRound,
  Mic,
  Globe,
  House,
  Star,
  EllipsisVertical,
  MessageCircle,
  Mail,
  BookUser,
  Map as MapIcon,
} from "lucide-react";
import { CalendarUtility, ClockUtility, PhotosUtility } from "@/components/desktop-utilities";
import { OsButton } from "@/components/os-button";
import { ContactsContent, MailContent, MapsContent, MessagesContent } from "@/components/liquid-apps";
import { OPTIMIZE_EVENT, OptimizeOverlay, isLowPowerDevice, requestOptimize } from "@/components/optimize-overlay";
import mountainAsset from "@/assets/private-os-mountains.jpg.asset.json";
import cherryAsset from "@/assets/private-os-cherry.jpg.asset.json";
import inkEyeAsset from "@/assets/ink-eye.jpg.asset.json";
import wukongSnowAsset from "@/assets/wukong-snow.jpg.asset.json";
import moonlitTreeAsset from "@/assets/moonlit-tree.jpg.asset.json";

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

const WindowContext = createContext<{ minimized: boolean; minimize: () => void; focus: () => void; z: number; top: boolean; closing?: boolean }>({ minimized: false, minimize: () => {}, focus: () => {}, z: 10, top: false });

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

// Icons cut from the Windows 11 icon sheet (public/icons/apps/win); they bring their own shape, so no tile.
const WIN_ICONS = new Set(["word", "powerpoint", "excel", "outlook", "onenote", "onedrive", "calc", "calendar", "camera", "clock", "contacts", "files", "games", "mail", "maps", "media", "messages", "notes", "paint", "passwords", "photos", "recorder", "settings", "sticky", "terminal", "todo", "weather"]);

// App picture from public/icons/apps (Microsoft Fluent Emoji, MIT) on the glossy tile.
function AppImage({ className, tone, src }: { className?: string | undefined; tone: string; src: string }) {
  if (WIN_ICONS.has(src)) {
    return <span className={`relative grid shrink-0 place-items-center ${className ?? ""}`}><img src={`/icons/apps/win/${src}.webp`} alt="" draggable={false} decoding="async" className="size-[94%] object-contain drop-shadow-[0_2px_3px_rgb(0_0_0/.35)]" /></span>;
  }
  return <Tile tone={tone} glyph="[&>img]:relative [&>img]:size-[68%] [&>img]:drop-shadow-[0_2px_2px_rgb(0_0_0/.35)]" className={className}><img src={`/icons/apps/${src}.svg`} alt="" draggable={false} decoding="async" /></Tile>;
}

const CloudIcon: IconComponent = ({ className }) => <AppImage tone="from-sky-300 to-blue-600" src="onedrive" className={className} />;
const CherryIcon: IconComponent = ({ className }) => <Tile tone="from-rose-400 to-red-700" className={className}><Cherry /></Tile>;
const FolderIcon: IconComponent = ({ className }) => <AppImage tone="from-sky-400 to-blue-600" src="files" className={className} />;
const SettingsIcon: IconComponent = ({ className }) => <AppImage tone="from-zinc-400 to-zinc-700" src="settings" className={className} />;
const BeeZIcon: IconComponent = ({ className }) => <Tile tone="from-amber-300 to-yellow-600" glyph="[&>svg]:size-[62%] [&>svg]:text-zinc-900" className={className}><Hexagon className="fill-zinc-900/25" /></Tile>;
const NotesIcon: IconComponent = ({ className }) => <AppImage tone="from-yellow-300 to-orange-500" src="onenote" className={className} />;
const CalcIcon: IconComponent = ({ className }) => <AppImage tone="from-zinc-500 to-zinc-800" src="calc" className={className} />;
const TerminalIcon: IconComponent = ({ className }) => <AppImage tone="from-zinc-700 to-black" src="terminal" className={className} />;

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

const TaskIcon: IconComponent = ({ className }) => <AppImage tone="from-emerald-400 to-teal-700" src="taskmgr" className={className} />;

const WeatherIcon: IconComponent = ({ className }) => <AppImage tone="from-sky-400 to-blue-700" src="weather" className={className} />;
const PaintIcon: IconComponent = ({ className }) => <AppImage tone="from-pink-400 to-purple-700" src="paint" className={className} />;
const TodoIcon: IconComponent = ({ className }) => <AppImage tone="from-lime-400 to-green-700" src="todo" className={className} />;

const YouTubeIcon: IconComponent = ({ className }) => <Tile tone="from-red-500 to-red-800" glyph="[&>svg]:size-[52%] [&>svg]:text-white" className={className}><Play className="fill-white" /></Tile>;

const CalendarIcon: IconComponent = ({ className }) => <AppImage tone="from-white to-zinc-200" src="calendar" className={className} />;
const ClockIcon: IconComponent = ({ className }) => <AppImage tone="from-zinc-700 to-zinc-900" src="clock" className={className} />;
const PhotosIcon: IconComponent = ({ className }) => <AppImage tone="from-white to-zinc-200" src="photos" className={className} />;


const LINK_APPS = [
  { id: "spotify", label: "Spotify", url: "https://open.spotify.com/", tone: "from-green-400 to-green-700", icon: Music },
];
const linkLauncher = LINK_APPS.map((app) => ({
  id: app.id,
  label: app.label,
  icon: (({ className }) => <Tile tone={app.tone} glyph="[&>svg]:size-[56%] [&>svg]:text-white" className={className}><app.icon /></Tile>) as IconComponent,
}));

const OS_VERSION = "2.1";
const CHANGELOG = [
  { v: "2.1", date: "18 Oct 2026", items: ["New Clay theme: warm terracotta on soft charcoal with its own slow-moving wallpaper, softer windows and a warm glow", "Removed the macOS-style Liquid Glass desktop; if you used it you now get Clay"] },
  { v: "2.0", date: "18 Oct 2026", items: ["Welcome setup on first start: say hello, enter your name, pick a theme and your preferences", "Your name on the lock screen", "Chrome-style browser: real tabs with site icons and titles, rounded address bar, bookmarks bar, menu and a new tab page with shortcuts", "Six built-in games that work offline: Snake, 2048, Breakout, Minesweeper, Memory and Tic-Tac-Toe", "Seven new themes: Tokyo Night, Dracula, Nord, Sunset, Mono, Ocean Glass and Forest Glass", "Smoother motion: windows spring open, shrink to the dock and fade when closed, and the start menu glides in", "New boot spinner", "Windows 11 style taskbar: apps in the middle, tray and clock on the right, all in one bar", "Right-click the taskbar to change its transparency, turn on liquid glass, switch to the floating dock or add apps", "Private Word, Private Excel, Private PowerPoint, Private Outlook and Private OneNote with new icons", "Cleaner app icons with no white edges"] },
  { v: "1.9", date: "16 Oct 2026", items: ["Liquid Glass theme: macOS-style menu bar, widgets, Spotlight and a magnifying glass dock", "New apps: Messages, Mail, Contacts and Maps", "Desktop style switch in Settings: Standard or Liquid Glass", "Classic and Modern interface styles, now applied to every app", "Themes now tint every app window, and glass themes make windows see-through", "Optimize button: a lite mode that makes every theme faster on slow PCs", "Satisfying hover and click sounds", "Picture icons for the built-in apps", "IN BETA tag on the start screen"] },
  { v: "1.8", date: "10 Oct 2026", items: ["Writer, Sheets, Slides and PDF Reader: open and save .docx, .xlsx, .csv, .pptx and .pdf", "Files opens each document in the right app", "Date & time settings: pick a time zone and add world clocks", "Search results now always show, with Wikipedia as a backup"] },
  { v: "1.7", date: "10 Oct 2026", items: ["Bigger, easier-to-click title bar buttons with a size setting", "New apps: Sticky Notes, Focus Timer, Converter, Passwords and Recorder", "New settings: auto-lock, skip start screen, week start, desktop labels"] },
  { v: "1.6", date: "10 Oct 2026", items: ["Slim window title bar: app icon, back and forward arrows, title, and tiny minimize, expand and close buttons"] },
  { v: "1.5", date: "10 Oct 2026", items: ["Drag a window to the top edge to expand it, with a preview and a smooth glide", "Pull a maximized window down by its title bar to restore it", "Easier snap zones on the screen edges"] },
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

const CameraIcon: IconComponent = ({ className }) => <AppImage tone="from-slate-400 to-slate-700" src="camera" className={className} />;
const MediaIcon: IconComponent = ({ className }) => <AppImage tone="from-orange-400 to-rose-600" src="media" className={className} />;
const AboutIcon: IconComponent = ({ className }) => <AppImage tone="from-cyan-400 to-blue-700" src="about" className={className} />;

const GamesIcon: IconComponent = ({ className }) => <AppImage tone="from-violet-500 to-fuchsia-700" src="games" className={className} />;

const StickyIcon: IconComponent = ({ className }) => <AppImage tone="from-yellow-200 to-yellow-500" src="sticky" className={className} />;
const FocusIcon: IconComponent = ({ className }) => <AppImage tone="from-rose-400 to-red-700" src="focus" className={className} />;
const ConvertIcon: IconComponent = ({ className }) => <AppImage tone="from-teal-400 to-cyan-700" src="convert" className={className} />;
const PasswordIcon: IconComponent = ({ className }) => <AppImage tone="from-slate-500 to-slate-800" src="passwords" className={className} />;
const RecorderIcon: IconComponent = ({ className }) => <AppImage tone="from-red-500 to-pink-700" src="recorder" className={className} />;

const MessagesIcon: IconComponent = ({ className }) => <AppImage tone="from-green-400 to-green-600" src="messages" className={className} />;
const MailIcon: IconComponent = ({ className }) => <AppImage tone="from-sky-400 to-blue-600" src="outlook" className={className} />;
const ContactsIcon: IconComponent = ({ className }) => <AppImage tone="from-stone-300 to-stone-500" src="contacts" className={className} />;
const MapsIcon: IconComponent = ({ className }) => <AppImage tone="from-emerald-300 to-teal-600" src="maps" className={className} />;

const dockApps: { id: string; label: string; icon: IconComponent }[] = [
  { id: "browser", label: "PRIVATE Browser", icon: PrivateBrowserIcon },
  { id: "files", label: "Files", icon: FolderIcon },
  { id: "notes", label: "Private OneNote", icon: NotesIcon },
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
  { id: "notes", label: "Private OneNote", icon: NotesIcon },
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
launcherApps.push(...linkLauncher, { id: "writer", label: "Private Word", icon: WriterIcon }, { id: "sheets", label: "Private Excel", icon: SheetsIcon }, { id: "slides", label: "Private PowerPoint", icon: SlidesIcon }, { id: "pdfreader", label: "PDF Reader", icon: PdfIcon }, { id: "sticky", label: "Sticky Notes", icon: StickyIcon }, { id: "focus", label: "Focus Timer", icon: FocusIcon }, { id: "convert", label: "Converter", icon: ConvertIcon }, { id: "passwords", label: "Passwords", icon: PasswordIcon }, { id: "recorder", label: "Recorder", icon: RecorderIcon }, { id: "games", label: "Games", icon: GamesIcon }, { id: "camera", label: "Camera", icon: CameraIcon }, { id: "media", label: "Media Player", icon: MediaIcon }, { id: "about", label: "System Info", icon: AboutIcon }, { id: "messages", label: "Messages", icon: MessagesIcon }, { id: "mail", label: "Private Outlook", icon: MailIcon }, { id: "contacts", label: "Contacts", icon: ContactsIcon }, { id: "maps", label: "Maps", icon: MapsIcon });

type WallpaperOption = { label: string; thumb: string; video?: string; src?: string };

const wallpaperOptions: WallpaperOption[] = [
  { label: "Snowy Campfire", thumb: "/wallpaper-poster.jpg", video: "/wallpaper.mp4" },
  { label: "Alpine Lake", thumb: mountainAsset.url, src: mountainAsset.url },
  { label: "Cherry Village", thumb: cherryAsset.url, src: cherryAsset.url },
  { label: "Ink Eye", thumb: inkEyeAsset.url, src: inkEyeAsset.url },
  { label: "Snow Fisher", thumb: wukongSnowAsset.url, src: wukongSnowAsset.url },
  { label: "Moonlit Tree", thumb: moonlitTreeAsset.url, src: moonlitTreeAsset.url },
];

// Morocco moved to permanent GMT (UTC+0) on 20 Sep 2026. Some browsers still carry the old
// time-zone rules (UTC+1), so those zones are pinned to the real offset.
const MOROCCO_GMT_FROM = Date.UTC(2026, 8, 20, 1, 0, 0);

function clockZone(date: Date, override = "") {
  if (override) return override;
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
  const [optimizing, setOptimizing] = useState(false);
  useEffect(() => {
    const start = () => setOptimizing(true);
    window.addEventListener(OPTIMIZE_EVENT, start);
    return () => window.removeEventListener(OPTIMIZE_EVENT, start);
  }, []);
  const [runText, setRunText] = useState("");
  const [runIndex, setRunIndex] = useState(0);
  const [dockShown, setDockShown] = useState(false);
  const [barMenu, setBarMenu] = useState<{ x: number; y: number } | null>(null);
  const [dockMenu, setDockMenu] = useState<{ id: string; x: number; y: number } | null>(null);
  const [battery, setBattery] = useState(100);
  const [power, setPower] = useState<"on" | "sleep" | "off">("on");
  const [settings, setSettings] = useState<OsSettings>(DEFAULT_SETTINGS);
  const [settingsReady, setSettingsReady] = useState(false);
  const [closingWins, setClosingWins] = useState<string[]>([]);
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

  const zone = clockZone(time, settings.timeZone);
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
      if (raw) {
        const saved = JSON.parse(raw) as Partial<OsSettings>;
        // The macOS-style Liquid Glass desktop was removed; people who used it get Clay instead.
        if (saved.theme === "liquid") { saved.theme = "clay"; saved.accent = "#d97757"; }
        setSettings({ ...DEFAULT_SETTINGS, ...saved });
      }
    } catch {
      // storage unavailable
    }
    setSettingsReady(true);
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
    if (!settings.autoLock) return;
    const limit = settings.autoLock * 60000;
    let timer = window.setTimeout(() => setLocked(true), limit);
    const reset = () => {
      window.clearTimeout(timer);
      timer = window.setTimeout(() => setLocked(true), limit);
    };
    const events = ["pointerdown", "keydown", "pointermove"];
    events.forEach((name) => window.addEventListener(name, reset, { passive: true }));
    return () => {
      window.clearTimeout(timer);
      events.forEach((name) => window.removeEventListener(name, reset));
    };
  }, [settings.autoLock]);

  useEffect(() => {
    if (settings.skipStart) setPhase((value) => (value === "start" ? "boot" : value));
  }, [settings.skipStart]);

  const soundPrefs = useRef({ enabled: true, hover: true, click: true, volume: 40 });
  useEffect(() => {
    soundPrefs.current = { enabled: settings.uiSounds, hover: settings.soundHover, click: settings.soundClick, volume: settings.soundVolume };
  });
  useEffect(() => installUiSounds(() => soundPrefs.current), []);

  useEffect(() => {
    if (!settings.slideshow || allWalls.length < 2) return;
    const timer = window.setInterval(() => setWallpaper((index) => (index + 1) % allWalls.length), settings.slideshow * 60000);
    return () => window.clearInterval(timer);
  }, [settings.slideshow, allWalls.length]);

  const removeWindow = (id: string) => {
    setClosingWins((list) => list.filter((item) => item !== id));
    setOpenWins((list) => list.filter((item) => item !== id));
    setMinWins((list) => list.filter((item) => item !== id));
    setZOrder((list) => list.filter((item) => item !== id));
  };
  // Play the close animation first, then remove the window.
  const closeWindow = (id: string) => {
    if (settings.reduceMotion || settings.lite) return removeWindow(id);
    setClosingWins((list) => (list.includes(id) ? list : [...list, id]));
    window.setTimeout(() => removeWindow(id), 190);
  };
  const finishSetup = (result: WelcomeResult) => {
    patchSettings({ ...result, onboarded: true });
    setLocked(false);
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
  // The theme accent and the Modern interface style apply to every app, not only Settings.
  const modernUi = settings.uiStyle === "modern";
  const themeDef = THEMES.find((theme) => theme.id === settings.theme);
  const glassTheme = Boolean(themeDef?.glass);
  const clay = settings.theme === "clay";
  // Themes with a base colour also tint the desktop, cards, menus and windows.
  const baseStyle = themeDef?.base
    ? { "--background": themeDef.base, "--theme-base": themeDef.base, "--card": `color-mix(in oklab, ${themeDef.base} 78%, transparent)`, "--popover": `color-mix(in oklab, ${themeDef.base} 86%, transparent)`, ...(settings.glassOpacity > 0 ? {} : { "--glass-tint": `color-mix(in oklab, ${themeDef.base} ${themeDef.glass ? 42 : 62}%, transparent)` }) }
    : {};
  const themeStyle = ({ ...extraStyle, ...baseStyle, ...(settings.accent
    ? { "--primary": settings.accent, "--ring": settings.accent, "--primary-foreground": readableOn(settings.accent), "--scroll": settings.scrollAccent || settings.accent }
    : modernUi
      ? { "--primary": "#8b7cff", "--ring": "#8b7cff", "--primary-foreground": "#ffffff", "--scroll": settings.scrollAccent || "#8b7cff" }
      : { "--scroll": settings.scrollAccent || "rgba(255,255,255,.28)" }) }) as React.CSSProperties;

  const lookupApp = (id: string) => launcherApps.find((item) => item.id === id) ?? dockApps.find((item) => item.id === id);
  const dockList = [...settings.dockPins, ...openWins.filter((id) => !settings.dockPins.includes(id))].flatMap((id) => {
    const app = lookupApp(id);
    return app ? [{ id, app }] : [];
  });
  const visibleWins = openWins.filter((id) => !minWins.includes(id));
  const topId = [...zOrder].reverse().find((id) => visibleWins.includes(id)) ?? null;
  const dockHidden = settings.dockAutoHide && !dockShown && !startMenu && !dockMenu && !barMenu && !launcher && !taskView && !quickMenu;
  // Windows 11 style: one full-width bar with the apps centred and the tray on the right.
  const taskbarMode = settings.dockStyle === "taskbar" && settings.dockPos !== "right";
  const openStartMenu = () => {
    const anchor = document.getElementById("start-anchor");
    if (anchor) {
      const box = anchor.getBoundingClientRect();
      const width = Math.min(416, window.innerWidth - 16);
      setStartPos({ left: Math.max(8, Math.min(box.left - 8, window.innerWidth - width - 8)), bottom: settings.dockPos === "top" ? window.innerHeight - box.bottom - 460 : window.innerHeight - box.top + 10 });
    }
    setStartMenu((value) => !value);
    setLauncher(false);
    setQuickMenu(false);
  };
  const dockSurface = { "--dock-alpha": `${settings.dockOpacity}%` } as React.CSSProperties;
  const hideShift = settings.dockPos === "right" ? "translateX(160%)" : settings.dockPos === "top" ? "translateY(-160%)" : "translateY(160%)";

  const webSearch = (text: string) => {
    const looksLikeSite = /^[\w-]+(\.[\w-]+)+(\/|$)/.test(text);
    setBrowserStart(/^https?:\/\//i.test(text) ? text : looksLikeSite ? `https://${text}` : `search:${encodeURIComponent(text)}`);
    openApp("browser");
  };
  const commands: { label: string; run: () => void }[] = [
    { label: "Lock screen", run: () => setLocked(true) },
    { label: "Sleep", run: () => setPower("sleep") },
    { label: "Toggle ambient glow", run: () => patchSettings((current) => ({ ambient: !current.ambient })) },
    { label: "Toggle reduce motion", run: () => patchSettings((current) => ({ reduceMotion: !current.reduceMotion })) },
    { label: "Optimize for speed", run: requestOptimize },
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
          ? Object.entries(readFs()).filter(([path, value]) => typeof value === "string" && path.toLowerCase().includes(spotQuery)).slice(0, 6).map(([path]) => ({ key: `file-${path}`, label: path, hint: "File", run: () => openPathInApp(path, openApp) }))
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
      case "sticky": return <StickyApp close={close} />;
      case "focus": return <FocusApp close={close} />;
      case "convert": return <ConvertApp close={close} />;
      case "passwords": return <PasswordApp close={close} />;
      case "recorder": return <RecorderApp close={close} />;
      case "writer": return <WriterApp close={close} />;
      case "sheets": return <SheetsApp close={close} />;
      case "slides": return <SlidesApp close={close} />;
      case "pdfreader": return <PdfApp close={close} />;
      case "games": return <GamesApp close={close} launch={(url) => { setBrowserStart(url); openApp("browser"); }} />;
      case "camera": return <CameraApp close={close} />;
      case "media": return <MediaApp close={close} />;
      case "about": return <AboutApp close={close} />;
      case "messages": return <WindowFrame title="Messages" icon={MessagesIcon} close={close}><MessagesContent /></WindowFrame>;
      case "mail": return <WindowFrame title="Private Outlook" icon={MailIcon} close={close}><MailContent /></WindowFrame>;
      case "contacts": return <WindowFrame title="Contacts" icon={ContactsIcon} close={close}><ContactsContent openApp={openApp} /></WindowFrame>;
      case "maps": return <WindowFrame title="Maps" icon={MapsIcon} close={close}><MapsContent /></WindowFrame>;
      case "taskmgr": return <TaskManagerApp close={close} wins={openWins} end={closeWindow} show={openApp} />;
      default: return null;
    }
  };

  if (phase === "start") return <StartScreen onStart={() => setPhase("boot")} />;
  if (phase === "boot") return <BootScreen />;

  return (
    <main style={themeStyle} data-ctl={settings.titleButtons} data-reduce={settings.reduceMotion ? "" : undefined} data-native-cursor={settings.nativeCursor ? "" : undefined} data-clay={clay ? "" : undefined} data-lite={settings.lite ? "" : undefined} data-ui={settings.uiStyle} data-glass={glassTheme ? "" : undefined} data-taskbar={taskbarMode ? settings.dockPos : undefined} onContextMenu={(event) => { if ((event.target as HTMLElement).closest("section, nav, aside")) return; event.preventDefault(); setMenu({ x: Math.min(event.clientX, window.innerWidth - 190), y: Math.min(event.clientY, window.innerHeight - 260) }); }} onClick={(event) => { setMenu(null); setDockMenu(null); setBarMenu(null); if (!(event.target as HTMLElement).closest('[data-start], [aria-label^="PRIVATE OS menu"]')) setStartMenu(false); }} className="os-desktop relative h-dvh w-full overflow-hidden bg-background font-sans text-foreground [animation:desktop-in_.9s_cubic-bezier(.22,1,.36,1)]">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0" style={{ filter: settings.blur && !settings.lite ? `blur(${settings.blur}px)` : undefined, transform: settings.blur && !settings.lite ? "scale(1.08)" : undefined }}>
          {clay ? <ClayWallpaper /> : <Wallpaper index={wallpaper} options={allWalls} />}
        </div>
      </div>
      <div className="pointer-events-none absolute inset-0 bg-black" style={{ opacity: settings.dim / 100 }} />
      {settings.ambient && !settings.lite && !clay && (
        <div aria-hidden className="pointer-events-none absolute inset-0 z-[1] overflow-hidden">
          <div className="aurora" />
          {Array.from({ length: 14 }, (_, i) => <span key={i} className="particle" style={{ left: `${(i * 41 + 7) % 100}%`, top: `${(i * 59 + 20) % 100}%`, animationDelay: `${-(i * 2.3) % 12}s`, animationDuration: `${12 + (i % 5) * 3}s` }} />)}
        </div>
      )}
      {<div className="absolute inset-0 bg-gradient-to-b from-background/20 via-transparent to-background/35" />}

      {taskbarMode && (<>
      {settings.dockAutoHide && <div aria-hidden onMouseEnter={() => setDockShown(true)} className={`fixed inset-x-0 z-30 h-2 ${settings.dockPos === "top" ? "top-0" : "bottom-0"}`} />}
      <div
        onMouseEnter={() => setDockShown(true)}
        onMouseLeave={() => setDockShown(false)}
        onContextMenu={(event) => { event.preventDefault(); event.stopPropagation(); setMenu(null); setDockMenu(null); setBarMenu({ x: Math.min(event.clientX, window.innerWidth - 272), y: event.clientY }); }}
        style={{ ...dockSurface, transition: "transform .32s cubic-bezier(.22,1,.36,1)", transform: dockHidden ? (settings.dockPos === "top" ? "translateY(-110%)" : "translateY(110%)") : undefined }}
        className={`taskbar ${settings.dockLiquid ? "taskbar-liquid" : ""} absolute inset-x-0 z-40 flex h-12 items-center px-2 text-white ${settings.dockPos === "top" ? "top-0 border-b" : "bottom-0 border-t"}`}
      >
        <div className="hidden w-48 shrink-0 md:block" aria-hidden />
        <nav aria-label="PRIVATE OS taskbar" className="flex min-w-0 flex-1 items-center justify-center gap-1 overflow-x-auto">
          <span data-start id="start-anchor" className="inline-flex">
            <OsButton label="Start" onClick={openStartMenu} className={`taskbar-btn ${startMenu ? "is-on" : ""}`}><StartGlyph /></OsButton>
          </span>
          <OsButton label="Search" onClick={() => { setLauncher((value) => !value); setStartMenu(false); }} className={`taskbar-btn ${launcher ? "is-on" : ""}`}><Search className="size-[18px]" /></OsButton>
          <OsButton label="Task view" onClick={() => { setTaskView((value) => !value); setStartMenu(false); setLauncher(false); }} className={`taskbar-btn ${taskView ? "is-on" : ""}`}><PanelsTopLeft className="size-[18px]" /></OsButton>
          {dockList.map(({ id, app }) => {
            const Icon = app.icon;
            const open = openWins.includes(id);
            const focused = open && !minWins.includes(id) && zOrder[zOrder.length - 1] === id;
            return (
              <span key={id} onContextMenu={(event) => { event.preventDefault(); event.stopPropagation(); setMenu(null); setBarMenu(null); setDockMenu({ id, x: event.clientX, y: event.clientY }); }} className="contents">
                <OsButton label={app.label} onClick={() => (focused ? setMinWins((list) => [...list, id]) : openApp(id))} className={`taskbar-btn group ${focused ? "is-on" : ""}`}>
                  <Icon className={settings.bigIcons ? "size-7" : "size-6"} />
                  <span className="taskbar-tip">{app.label}</span>
                  {open && <span className={`taskbar-dot ${focused ? "is-focused" : ""}`} />}
                </OsButton>
              </span>
            );
          })}
        </nav>
        <div className="flex shrink-0 items-center gap-0.5 md:w-48 md:justify-end">
          <OsButton label="Show hidden icons" onClick={() => setLauncher((value) => !value)} className="taskbar-btn hidden w-7 sm:inline-flex"><ChevronUp className="size-4" /></OsButton>
          <button type="button" onClick={() => setQuickMenu((value) => !value)} aria-label="Open quick settings" className={`taskbar-btn w-auto gap-2 px-2.5 ${quickMenu ? "is-on" : ""}`}>
            <span className="hidden text-[11px] font-medium leading-tight sm:block">ENG</span>
            <Wifi className="size-4" />
            <Volume2 className="size-4" />
            <BatteryFull className="size-4" />
          </button>
          <button type="button" onClick={() => setQuickMenu((value) => !value)} aria-label="Date and time" className="taskbar-btn w-auto px-2 text-right">
            <span className="flex flex-col items-end text-[11px] leading-tight tabular-nums"><span>{timeLabel}</span>{settings.showDate && <span className="text-white/75">{time.toLocaleDateString(undefined, { day: "2-digit", month: "2-digit", year: "numeric" })}</span>}</span>
          </button>
          {canFullscreen && <OsButton label={fullscreen ? "Exit full screen" : "Full screen"} onClick={toggleFullscreen} className="taskbar-btn hidden w-8 sm:inline-flex">{fullscreen ? <Minimize className="size-4" /> : <Maximize className="size-4" />}</OsButton>}
        </div>
      </div>
      </>)}

      {!taskbarMode && (<>
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
        <nav aria-label="PRIVATE OS dock" onContextMenu={(event) => { if (event.target !== event.currentTarget) return; event.preventDefault(); event.stopPropagation(); setMenu(null); setBarMenu({ x: Math.min(event.clientX, window.innerWidth - 272), y: event.clientY }); }} style={dockSurface} className={`dock-bar dock-glass ${settings.dockLiquid ? "taskbar-liquid" : ""} flex items-center gap-3.5 rounded-2xl px-4 ${settings.dockPos === "right" ? "flex-col py-3" : "h-[52px]"}`}>
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

        <div onContextMenu={(event) => { event.preventDefault(); event.stopPropagation(); setMenu(null); setBarMenu({ x: Math.min(event.clientX, window.innerWidth - 272), y: event.clientY }); }} style={dockSurface} className={`dock-bar dock-glass ${settings.dockLiquid ? "taskbar-liquid" : ""} flex h-[52px] items-center gap-2 rounded-2xl px-3 text-xs font-medium tabular-nums text-white md:gap-3 md:px-4 ${settings.dockPos === "right" ? "hidden" : ""}`}>
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

      </>)}

      {<div className="desktop-status"><span className="flex items-center gap-2"><ShieldCheck className="size-4 text-primary" /><span>PRIVATE OS</span></span><span>{dateLabel.toLowerCase()} · {time.toLocaleDateString(undefined, { month: "short", day: "numeric" })}</span></div>}

      {quickMenu && (
        <aside className={`glass-panel quick-settings absolute right-3 z-50 bottom-20 w-[min(22rem,calc(100%-1.5rem))] rounded-lg p-5`}>
          <div className="mb-5 flex items-center justify-between"><p className="text-sm font-semibold">Quick settings</p><OsButton label="Open settings" onClick={() => { setQuickMenu(false); openApp("settings"); }} className="utility-icon"><Settings className="size-4" /></OsButton></div>
          <div className="grid grid-cols-3 gap-2"><div className="quick-tile"><Wifi className="size-5" /><span>Online</span></div><OsButton onClick={() => setSound(v => v === 0 ? 70 : 0)} className="quick-tile"><Volume2 className="size-5" /><span>{sound ? "Sound" : "Muted"}</span></OsButton><OsButton onClick={() => { setQuickMenu(false); setLocked(true); }} className="quick-tile"><LockKeyhole className="size-5" /><span>Lock</span></OsButton></div>
          <label className="mt-5 flex items-center gap-3 text-xs"><Volume2 className="size-4" /><input aria-label="OS sound level" type="range" min="0" max="100" value={sound} onChange={e => setSound(Number(e.target.value))} className="min-w-0 flex-1 accent-primary" /><span className="w-8 text-right">{sound}%</span></label>
          <label className="mt-4 flex items-center gap-3 text-xs"><span>Dim</span><input aria-label="Desktop dimming" type="range" min="0" max="70" value={settings.dim} onChange={e => patchSettings({ dim: Number(e.target.value) })} className="min-w-0 flex-1 accent-primary" /></label>
          <div className="mt-5 flex items-center justify-between border-t border-border pt-3 text-xs text-muted-foreground"><span className="flex items-center gap-2"><BatteryFull className="size-4" />{battery}%</span><span>Local session</span></div>
        </aside>
      )}

      {settings.showIcons && settings.desktop.length > 0 && (
        <div className={`pointer-events-none absolute z-[9] flex max-h-[calc(100dvh-7rem)] flex-col flex-wrap gap-2 left-3 top-3 content-start`}>
          {settings.desktop.map((id) => {
            const app = launcherApps.find((item) => item.id === id) ?? dockApps.find((item) => item.id === id);
            if (!app) return null;
            const Icon = app.icon;
            return (
              <div key={id} className="group pointer-events-auto relative w-20 text-center">
                <OsButton label={`Open ${app.label}`} onClick={() => openApp(id)} className="flex w-full flex-col items-center gap-1 rounded-lg p-2 hover:bg-white/10">
                  <Icon className={settings.bigIcons ? "size-16" : "size-12"} />
                  {settings.desktopLabels && <span className="line-clamp-2 text-[11px] text-white drop-shadow">{app.label}</span>}
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
              {id === "music" ? <MusicWidget /> : id === "notes" ? <NotesWidget /> : id === "calendar" ? <CalendarWidget weekStart={settings.weekStart} /> : <StopwatchWidget />}
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

      {optimizing && <OptimizeOverlay onApply={() => patchSettings(() => ({ lite: true }))} onDone={() => setOptimizing(false)} />}
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

      {barMenu && (
        <div role="menu" aria-label="Taskbar options" onClick={(event) => event.stopPropagation()} style={{ left: Math.max(8, barMenu.x), ...(settings.dockPos === "top" ? { top: barMenu.y + 12 } : { bottom: window.innerHeight - barMenu.y + 12 }) }} className="soft-glass fixed z-50 w-64 rounded-2xl p-3 text-[11px] text-white shadow-2xl [animation:start-menu-in_.22s_cubic-bezier(.16,1.1,.3,1)]">
          <p className="px-1 text-[10px] font-semibold uppercase tracking-wider text-white/55">Taskbar</p>
          <div className="mt-2 grid grid-cols-2 gap-1.5">
            {([["taskbar", "Windows bar"], ["floating", "Floating dock"]] as const).map(([value, label]) => (
              <button key={value} type="button" aria-pressed={settings.dockStyle === value} onClick={() => patchSettings({ dockStyle: value })} className={`rounded-xl border px-2 py-2 font-semibold ${settings.dockStyle === value ? "border-primary bg-primary/20" : "border-white/10 hover:bg-white/10"}`}>{label}</button>
            ))}
          </div>
          <label className="mt-3 block px-1">
            <span className="flex justify-between"><span>Transparency</span><span className="tabular-nums text-white/60">{100 - settings.dockOpacity}%</span></span>
            <input type="range" min={0} max={95} value={100 - settings.dockOpacity} aria-label="Taskbar transparency" onChange={(event) => patchSettings({ dockOpacity: 100 - Number(event.target.value) })} className="mt-1.5 w-full accent-primary" />
          </label>
          <button type="button" role="menuitemcheckbox" aria-checked={settings.dockLiquid} onClick={() => patchSettings((current) => ({ dockLiquid: !current.dockLiquid }))} className="mt-2 flex w-full items-center justify-between rounded-lg px-2 py-2 hover:bg-white/10">
            <span>Liquid glass</span>
            <span className={`relative h-4 w-7 rounded-full transition-colors ${settings.dockLiquid ? "bg-primary" : "bg-white/20"}`}><span className={`absolute top-0.5 size-3 rounded-full bg-white transition-[left] ${settings.dockLiquid ? "left-3.5" : "left-0.5"}`} /></span>
          </button>
          <button type="button" role="menuitemcheckbox" aria-checked={settings.dockAutoHide} onClick={() => patchSettings((current) => ({ dockAutoHide: !current.dockAutoHide }))} className="flex w-full items-center justify-between rounded-lg px-2 py-2 hover:bg-white/10">
            <span>Auto-hide</span>
            <span className={`relative h-4 w-7 rounded-full transition-colors ${settings.dockAutoHide ? "bg-primary" : "bg-white/20"}`}><span className={`absolute top-0.5 size-3 rounded-full bg-white transition-[left] ${settings.dockAutoHide ? "left-3.5" : "left-0.5"}`} /></span>
          </button>
          <p className="mt-2 border-t border-white/10 px-1 pt-2.5 text-[10px] font-semibold uppercase tracking-wider text-white/55">Apps on the taskbar</p>
          <div className="mt-1 max-h-48 overflow-auto pr-1">
            {launcherApps.map((app) => {
              const pinned = settings.dockPins.includes(app.id);
              const Icon = app.icon;
              return (
                <button key={app.id} type="button" role="menuitemcheckbox" aria-checked={pinned} onClick={() => patchSettings((current) => ({ dockPins: current.dockPins.includes(app.id) ? current.dockPins.filter((entry) => entry !== app.id) : [...current.dockPins, app.id] }))} className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left hover:bg-white/10">
                  <Icon className="size-5 shrink-0" />
                  <span className="min-w-0 flex-1 truncate">{app.label}</span>
                  {pinned && <Check className="size-3.5 text-primary" />}
                </button>
              );
            })}
          </div>
          <button type="button" onClick={() => { setBarMenu(null); openApp("settings"); }} className="mt-2 w-full rounded-lg border-t border-white/10 px-2 pt-2.5 text-left text-white/80 hover:text-white">Taskbar settings…</button>
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
        <WindowContext.Provider key={id} value={{ minimized: minWins.includes(id), minimize: () => setMinWins((list) => (list.includes(id) ? list : [...list, id])), focus: () => raise(id), z: 10 + Math.max(0, zOrder.indexOf(id)), top: zOrder[zOrder.length - 1] === id && !minWins.includes(id), closing: closingWins.includes(id) }}>
          <AppBoundary close={() => closeWindow(id)}>{renderWindow(id)}</AppBoundary>
        </WindowContext.Provider>
      ))}


      <LockScreen locked={locked} unlock={() => setLocked(false)} day={dateLabel} date={lockDate} clock={lockTime} dim={settings.lockDim} blur={settings.lockBlur} name={settings.userName} />
      {settingsReady && !settings.onboarded && <WelcomeSetup themes={WELCOME_THEMES.flatMap((id) => THEMES.filter((theme) => theme.id === id))} lowPower={isLowPowerDevice()} onDone={finishSetup} />}
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

// Four rounded panes in the theme colour: the Start button.
function StartGlyph() {
  return (
    <span aria-hidden className="grid size-[18px] grid-cols-2 gap-[2px]">
      {[0, 1, 2, 3].map((i) => <span key={i} className="rounded-[2px] bg-gradient-to-br from-[color-mix(in_oklab,var(--primary)_55%,#7dd3fc)] to-[color-mix(in_oklab,var(--primary)_85%,#1d4ed8)]" />)}
    </span>
  );
}

function LockScreen({ locked, unlock, day, date, clock, dim, blur, name }: { locked: boolean; unlock: () => void; day: string; date: string; clock: string; dim: number; blur: number; name?: string }) {
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
      {name && <p className="mt-6 font-['Rajdhani',sans-serif] text-sm font-semibold tracking-[.18em] text-white/80 [animation:rise_.6s_.2s_both]">WELCOME BACK, {name.toUpperCase()}</p>}
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
      <p className="beta-tag mt-4 rounded-full border border-[#f2c783]/60 bg-[#f2c783]/10 px-3 py-1 font-['Orbitron',sans-serif] text-[11px] font-bold tracking-[.32em] text-[#f2c783]">IN BETA</p>
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
        <p className="mx-auto mt-3 w-fit rounded-full border border-primary/50 px-2.5 py-0.5 text-[9px] font-bold tracking-[.3em] text-primary">IN BETA</p>
        <div className="mx-auto mt-6 h-px w-40 overflow-hidden bg-muted"><div className="h-full origin-left bg-primary [animation:boot-bar_2.2s_ease-in-out_forwards]" /></div>
        <div className="boot-spinner mx-auto mt-8" aria-hidden>{Array.from({ length: 5 }, (_, i) => <span key={i} style={{ animationDelay: `${i * 0.14}s` }} />)}</div>
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
  const { minimized, minimize, focus, z, top, closing } = useContext(WindowContext);
  const topGap = 8;
  const el = useRef<HTMLElement>(null);
  const [rect, setRect] = useState<WinRect | null>(null);
  const [snap, setSnap] = useState<string | null>(null);
  const prevRect = useRef<WinRect | null>(null);
  const live = useRef<WinRect | null>(null);
  const gesture = useRef<{ kind: "move" | "resize" | "pending"; mode: string; sx: number; sy: number; start: WinRect; ratio: number } | null>(null);
  const [maximized, setMaximized] = useState(startMaximized);
  const toggleMaximize = () => {
    setSnap(null);
    if (!maximized && el.current) prevRect.current = rect ?? measure();
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
  // Back / forward for windows that show a web page (works for proxied pages, which live on this origin).
  const frameNav = (direction: "back" | "forward") => {
    try {
      const frame = el.current?.querySelector("iframe");
      if (direction === "back") frame?.contentWindow?.history.back();
      else frame?.contentWindow?.history.forward();
    } catch {
      // cross-origin frame: the browser does not allow this
    }
  };
  // Dragging to the top edge: glide the window out to full size, then switch to the maximized layout.
  const expand = () => {
    const node = el.current;
    if (!node) return setMaximized(true);
    const reserve = window.innerWidth >= 768 ? 72 : 56;
    const ease = "cubic-bezier(.22,1,.36,1)";
    node.style.transition = `left .26s ${ease}, top .26s ${ease}, width .26s ${ease}, height .26s ${ease}, border-radius .26s ease`;
    place({ x: 0, y: 0, w: window.innerWidth, h: window.innerHeight - reserve });
    node.style.borderRadius = "0px";
    window.setTimeout(() => {
      node.style.transition = "";
      node.style.borderRadius = "";
      ["left", "top", "width", "height", "right", "bottom"].forEach((property) => node.style.removeProperty(property));
      setSnap(null);
      setMaximized(true);
    }, 270);
  };
  const restore = () => {
    setSnap(null);
    setRect(prevRect.current);
  };
  const snapTo = (zone: string) => {
    if (zone === "up") {
      if (!maximized && el.current) prevRect.current = rect ?? measure();
      return setMaximized(true);
    }
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
    setRect({ x: zone === "left" ? 8 : Math.round(window.innerWidth / 2) + 4, y: topGap, w: half, h: window.innerHeight - 80 - topGap });
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
        if (event.button !== 0 || !target.closest("header") || target.closest("button")) return;
        if (maximized) {
          // Hold the title bar of a maximized window and pull down to restore it.
          gesture.current = { kind: "pending", mode: "", sx: event.clientX, sy: event.clientY, start: { x: 0, y: 0, w: 0, h: 0 }, ratio: 0 };
          event.currentTarget.setPointerCapture(event.pointerId);
          return;
        }
        const start = rect ?? measure();
        const ratio = (event.clientX - start.x) / Math.max(1, start.w);
        let base = start;
        live.current = null;
        if (snap && prevRect.current) {
          base = { ...prevRect.current, x: event.clientX - prevRect.current.w * ratio, y: topGap };
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
        if (g.kind === "pending") {
          if (Math.hypot(dx, dy) < 6) return;
          const base = prevRect.current ?? { x: 80, y: 40, w: Math.min(900, window.innerWidth - 160), h: Math.min(600, window.innerHeight - 160) };
          const next = { ...base, x: event.clientX - base.w * (event.clientX / window.innerWidth), y: Math.max(0, event.clientY - 18) };
          setMaximized(false);
          setSnap(null);
          setRect(next);
          live.current = next;
          gesture.current = { kind: "move", mode: "", sx: event.clientX, sy: event.clientY, start: next, ratio: 0 };
          return;
        }
        if (g.kind === "move") {
          place({ ...g.start, x: Math.min(window.innerWidth - 80, Math.max(80 - g.start.w, g.start.x + dx)), y: Math.min(window.innerHeight - 60, Math.max(0, g.start.y + dy)) });
          showSnap(edgeZone(event.clientX, event.clientY) === "up" ? "max" : edgeZone(event.clientX, event.clientY) as "left" | "right" | null);
        } else {
          place({ ...g.start, w: g.mode.includes("e") ? Math.max(320, g.start.w + dx) : g.start.w, h: g.mode.includes("s") ? Math.max(220, g.start.h + dy) : g.start.h });
        }
      }}
      onPointerUp={(event) => {
        const g = gesture.current;
        gesture.current = null;
        if (!g) return;
        showSnap(null);
        if (g.kind === "pending") return;
        const zone = g.kind === "move" && live.current ? edgeZone(event.clientX, event.clientY) : null;
        if (zone === "up") return expand();
        if (live.current) setRect(live.current);
        if (zone) snapTo(zone);
      }}
      className={`os-window-anim absolute flex flex-col overflow-hidden ${surface} ${minimized ? "os-window-min pointer-events-none" : ""} ${closing ? "os-window-closing pointer-events-none" : ""} ${position}`}
    >
      <header className="window-titlebar flex h-8 shrink-0 items-center justify-between gap-2 px-2.5">
        <div className="flex min-w-0 items-center gap-2">
          <Icon className="size-5 shrink-0" />
          <span className="nav-chev flex items-center">
            <OsButton label="Back" onClick={() => frameNav("back")} className="win-ctl"><ChevronLeft className="size-3.5" /></OsButton>
            <OsButton label="Forward" onClick={() => frameNav("forward")} className="win-ctl"><ChevronRight className="size-3.5" /></OsButton>
          </span>
          <span className="truncate text-[11px] font-medium text-white/85">{title}</span>
        </div>
        <div className="flex shrink-0 items-center gap-1.5 pr-1">
          {actions}
          <OsButton label="Minimize" onClick={minimize} className="win-ctl"><Minus className="size-3.5" /></OsButton>
          <OsButton label={maximized ? "Restore" : "Expand"} onClick={toggleMaximize} className="win-ctl">{maximized ? <Minimize2 className="size-3.5" /> : <Maximize2 className="size-3.5" />}</OsButton>
          <OsButton label="Close" onClick={close} className="win-ctl win-close"><X className="size-3.5" /></OsButton>
        </div>
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

// Waits for a newly installed proxy worker to take over, so the previous one is shut down first.
function workerActivated(worker: ServiceWorker | null) {
  return new Promise<void>((resolve) => {
    if (!worker || worker.state === "activated" || worker.state === "redundant") return resolve();
    const timer = window.setTimeout(resolve, 8000);
    worker.addEventListener("statechange", () => {
      if (worker.state !== "activated" && worker.state !== "redundant") return;
      window.clearTimeout(timer);
      resolve();
    });
  });
}

// Scramjet keeps its settings in an IndexedDB database. The previous proxy worker opened that database
// before the page had set it up, which left it empty and stopped every page from loading.
// An empty database is deleted here so the engine can rebuild it.
function repairEngineStore() {
  return new Promise<void>((resolve) => {
    let request: IDBOpenDBRequest;
    try {
      request = indexedDB.open("$scramjet");
    } catch {
      return resolve();
    }
    request.onerror = () => resolve();
    request.onsuccess = () => {
      const database = request.result;
      const ready = database.objectStoreNames.contains("config");
      database.close();
      if (ready) return resolve();
      const removal = indexedDB.deleteDatabase("$scramjet");
      const timer = window.setTimeout(resolve, 8000);
      removal.onsuccess = removal.onerror = () => {
        window.clearTimeout(timer);
        resolve();
      };
    };
  });
}

function startProxyEngine() {
  if (!engineStart) {
    engineStart = withTimeout((async () => {
      if (!("serviceWorker" in navigator) || typeof SharedWorker === "undefined" || typeof WebAssembly === "undefined" || typeof indexedDB === "undefined") {
        throw new Error("This browser can't run the proxy engine");
      }
      const scope = window as unknown as EngineWindow;
      await loadScript("/baremux.js");
      await loadScript("/scramjet.all.js");
      if (!scope.BareMux || !scope.$scramjetLoadController) throw new Error("Proxy engine files are missing");
      const registration = await navigator.serviceWorker.register("/sw.js", { scope: "/" });
      await workerActivated(registration.installing ?? registration.waiting);
      await withTimeout(navigator.serviceWorker.ready, 8000, "The proxy worker did not start");
      if (!navigator.serviceWorker.controller) {
        await new Promise<void>((resolve) => {
          navigator.serviceWorker.addEventListener("controllerchange", () => resolve(), { once: true });
          window.setTimeout(resolve, 4000);
        });
      }
      await repairEngineStore();
      const { ScramjetController } = scope.$scramjetLoadController();
      const controller = new ScramjetController({ prefix: "/scramjet/" });
      await withTimeout(controller.init(), 10000, "The proxy engine did not initialise");
      const connection = new scope.BareMux.BareMuxConnection("/baremux-worker.js");
      await withTimeout(connection.setTransport("/epoxy.mjs", [{ wisp: await pickWisp() }]), 12000, "Could not reach a proxy server");
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

type TabInfo = { title: string; host: string; loading: boolean };
type Bookmark = { title: string; url: string };
const NTP_SHORTCUTS = [
  { title: "YouTube", url: "https://www.youtube.com/" },
  { title: "Wikipedia", url: "https://en.wikipedia.org/" },
  { title: "GitHub", url: "https://github.com/" },
  { title: "Reddit", url: "https://www.reddit.com/" },
  { title: "Cherrion", url: CHERRION_URL },
  { title: "DuckDuckGo", url: "https://duckduckgo.com/" },
  { title: "Coolmath", url: "https://www.coolmathgames.com/" },
  { title: "Twitch", url: "https://www.twitch.tv/" },
];
const hostOf = (url: string) => {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
};

function SiteIcon({ host, className = "size-4" }: { host: string; className?: string }) {
  const [failed, setFailed] = useState(false);
  useEffect(() => setFailed(false), [host]);
  if (!host || failed) return <span className={`grid shrink-0 place-items-center rounded-full bg-white/15 text-[9px] font-bold uppercase ${className}`}>{host ? host[0] : <Globe className="size-3" />}</span>;
  return <img src={viaLoader(`https://icons.duckduckgo.com/ip3/${host}.ico`)} alt="" loading="lazy" onError={() => setFailed(true)} className={`shrink-0 rounded-sm object-contain ${className}`} />;
}

function PrivateBrowser({ initialUrl, close }: { initialUrl: string | null; close: () => void }) {
  const [tabs, setTabs] = useState<{ id: number; url: string | null }[]>([{ id: 1, url: initialUrl }]);
  const [activeTab, setActiveTab] = useState(1);
  const [info, setInfo] = useState<Record<number, TabInfo>>({});
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const nextId = useRef(2);
  useEffect(() => {
    try {
      setBookmarks(JSON.parse(localStorage.getItem("pos-bookmarks") ?? "[]") as Bookmark[]);
    } catch {
      // storage unavailable
    }
  }, []);
  const toggleBookmark = (mark: Bookmark) => {
    setBookmarks((list) => {
      const next = list.some((item) => item.url === mark.url) ? list.filter((item) => item.url !== mark.url) : [...list, mark];
      try {
        localStorage.setItem("pos-bookmarks", JSON.stringify(next));
      } catch {
        // storage unavailable
      }
      return next;
    });
  };
  const addTab = (url: string | null = null) => {
    const id = nextId.current++;
    setTabs((list) => [...list, { id, url }]);
    setActiveTab(id);
  };
  const closeTab = (id: number) => {
    if (tabs.length === 1) return close();
    const index = tabs.findIndex((tab) => tab.id === id);
    const rest = tabs.filter((tab) => tab.id !== id);
    setTabs(rest);
    if (activeTab === id) setActiveTab(rest[Math.min(index, rest.length - 1)]!.id);
  };
  const report = useCallback((id: number, next: TabInfo) => setInfo((current) => {
    const old = current[id];
    if (old && old.title === next.title && old.host === next.host && old.loading === next.loading) return current;
    return { ...current, [id]: next };
  }), []);
  return (
    <WindowFrame title="PRIVATE Browser" icon={PrivateBrowserIcon} close={close}>
      <div className="chrome-strip flex h-10 shrink-0 items-end overflow-x-auto px-3 pt-1.5" onDoubleClick={(event) => { if (event.target === event.currentTarget) addTab(); }}>
        {tabs.map((tab, index) => {
          const meta = info[tab.id];
          const active = tab.id === activeTab;
          return (
            <div key={tab.id} data-active={active ? "" : undefined} onMouseDown={(event) => { if (event.button === 1) { event.preventDefault(); closeTab(tab.id); } }} className={`chrome-tab group flex h-[34px] min-w-[3.5rem] max-w-[15rem] flex-1 items-center gap-2 pl-3 pr-1.5 text-xs ${active ? "text-foreground" : "text-foreground/65 hover:text-foreground"}`}>
              <button type="button" role="tab" aria-selected={active} onClick={() => setActiveTab(tab.id)} title={meta?.title ?? "New Tab"} className="flex min-w-0 flex-1 items-center gap-2 text-left">
                {meta?.loading ? <RefreshCw className="size-3.5 shrink-0 animate-spin text-primary" /> : meta?.host ? <SiteIcon host={meta.host} /> : <PrivateBrowserIcon className="size-4 shrink-0" />}
                <span className="truncate">{meta?.title || "New Tab"}</span>
              </button>
              <button type="button" aria-label={`Close tab ${index + 1}`} onClick={() => closeTab(tab.id)} className={`grid size-5 shrink-0 place-items-center rounded-full hover:bg-white/15 ${active ? "" : "opacity-0 group-hover:opacity-100"}`}><X className="size-3" /></button>
            </div>
          );
        })}
        <button type="button" aria-label="New tab" title="New tab" onClick={() => addTab()} className="mb-1 ml-1.5 grid size-7 shrink-0 place-items-center rounded-full hover:bg-white/10"><Plus className="size-4" /></button>
      </div>
      {tabs.map((tab) => <BrowserTab key={tab.id} initialUrl={tab.url} active={tab.id === activeTab} onInfo={(next) => report(tab.id, next)} newTab={addTab} bookmarks={bookmarks} toggleBookmark={toggleBookmark} />)}
    </WindowFrame>
  );
}

function BrowserTab({ initialUrl, active, onInfo, newTab, bookmarks, toggleBookmark }: { initialUrl: string | null; active: boolean; onInfo: (info: TabInfo) => void; newTab: (url?: string | null) => void; bookmarks: Bookmark[]; toggleBookmark: (mark: Bookmark) => void }) {
  const searchStart = initialUrl?.startsWith("search:") ? decodeURIComponent(initialUrl.slice(7)) : null;
  const startUrl = searchStart ? null : initialUrl;
  const [address, setAddress] = useState(startUrl ?? "");
  const [nav, setNav] = useState<{ list: string[]; index: number }>({ list: startUrl ? [startUrl] : [], index: startUrl ? 0 : -1 });
  const [frameTarget, setFrameTarget] = useState<string | null>(startUrl);
  const [frameKey, setFrameKey] = useState(0);
  const [loading, setLoading] = useState(Boolean(startUrl));
  const [results, setResults] = useState<{ query: string; hits: SearchHit[] | null; error: boolean; note?: string | undefined } | null>(null);
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
    const show = (hits: SearchHit[], note?: string) => setResults((current) => (current && current.query === query ? { query, hits, error: hits.length === 0, note } : current));
    const wiki = () =>
      fetch(`https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(query)}&format=json&srlimit=10&origin=*`)
        .then((response) => response.json() as Promise<{ query?: { search?: { title: string; snippet: string; pageid: number }[] } }>)
        .then((data) => (data.query?.search ?? []).map((item) => ({ title: item.title, url: `https://en.wikipedia.org/?curid=${item.pageid}`, snippet: item.snippet.replace(/<[^>]+>/g, "").replace(/&quot;/g, '"').replace(/&amp;/g, "&") })));
    const fallback = "Web engines weren't reachable, so these results come from Wikipedia.";
    fetch(`/api/search?q=${encodeURIComponent(query)}`)
      .then((response) => response.json() as Promise<{ hits?: SearchHit[]; engine?: string }>)
      .then(async (data) => {
        if (data.hits?.length) return show(data.hits, data.engine ? `Results from ${data.engine}` : undefined);
        show(await wiki(), fallback);
      })
      .catch(() => { wiki().then((hits) => show(hits, fallback)).catch(() => show([])); });
  };

  useEffect(() => {
    if (searchStart) runSearch(searchStart);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
  const goHome = () => {
    setResults(null);
    setFrameTarget(null);
    setAddress("");
    setLoading(false);
  };

  // Tell the tab strip what to show: page title (when the page lets us read it), site icon, loading.
  const [docTitle, setDocTitle] = useState("");
  useEffect(() => {
    setDocTitle("");
    if (!frameTarget) return;
    const read = () => {
      try {
        const title = frameRef.current?.contentDocument?.title?.trim();
        if (title) setDocTitle(title);
      } catch {
        // cross-origin page: keep the site name
      }
    };
    const timer = window.setInterval(read, 1500);
    return () => window.clearInterval(timer);
  }, [frameTarget, frameKey]);
  const shownUrl = page ?? frameTarget;
  useEffect(() => {
    if (results) return onInfo({ title: `${results.query} - Search`, host: "duckduckgo.com", loading: results.hits === null });
    if (!shownUrl) return onInfo({ title: "New Tab", host: "", loading: false });
    const host = hostOf(shownUrl);
    onInfo({ title: docTitle || host || shownUrl, host, loading });
  }, [results, shownUrl, docTitle, loading, onInfo]);

  const marked = Boolean(page && bookmarks.some((item) => item.url === page));
  const [menuOpen, setMenuOpen] = useState(false);
  const omnibox = useRef<HTMLInputElement>(null);
  const [focused, setFocused] = useState(false);
  const pretty = !focused && address && /^https?:\/\//i.test(address) ? address.replace(/^https?:\/\/(www\.)?/i, "").replace(/\/$/, "") : address;
  const iconBtn = "grid size-8 shrink-0 place-items-center rounded-full transition-colors hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-transparent";

  return (
    <div className={active ? "flex min-h-0 flex-1 flex-col" : "hidden"}>
      <div className="chrome-toolbar relative flex h-11 shrink-0 items-center gap-0.5 px-2">
        <OsButton label="Back" disabled={nav.index <= 0} onClick={() => moveHistory(-1)} className={iconBtn}><ArrowLeft className="size-4" /></OsButton>
        <OsButton label="Forward" disabled={nav.index >= nav.list.length - 1} onClick={() => moveHistory(1)} className={iconBtn}><ArrowRight className="size-4" /></OsButton>
        <OsButton label={loading ? "Stop" : "Reload"} disabled={!page && !results} onClick={() => { if (loading) setLoading(false); else if (results) runSearch(results.query); else if (page) show(page); }} className={iconBtn}>{loading ? <X className="size-4" /> : <RefreshCw className="size-4" />}</OsButton>
        <OsButton label="Home" onClick={goHome} className={`${iconBtn} hidden sm:grid`}><House className="size-4" /></OsButton>
        <form onSubmit={(event) => { event.preventDefault(); navigateTo(address); omnibox.current?.blur(); }} className="chrome-omnibox mx-1.5 flex h-8 min-w-0 flex-1 items-center gap-2 rounded-full px-3">
          {page && !results ? <LockKeyhole className="size-3.5 shrink-0 text-foreground/60" /> : <Search className="size-3.5 shrink-0 text-foreground/60" />}
          <input ref={omnibox} aria-label="Search or enter address" value={pretty} onFocus={(event) => { setFocused(true); window.setTimeout(() => event.target.select(), 0); }} onBlur={() => setFocused(false)} onChange={(event) => setAddress(event.target.value)} placeholder="Search DuckDuckGo or type a URL" className="min-w-0 flex-1 bg-transparent text-[13px] outline-none placeholder:text-foreground/45" />
          {page && <button type="button" aria-label={marked ? "Remove bookmark" : "Bookmark this page"} aria-pressed={marked} onClick={() => toggleBookmark({ title: docTitle || hostOf(page) || page, url: page })} className="grid size-6 shrink-0 place-items-center rounded-full hover:bg-white/10"><Star className={`size-3.5 ${marked ? "fill-primary text-primary" : "text-foreground/60"}`} /></button>}
        </form>
        <div className="relative">
          <OsButton label="Browser menu" onClick={() => setMenuOpen((value) => !value)} className={iconBtn}><EllipsisVertical className="size-4" /></OsButton>
          {menuOpen && (
            <div role="menu" onMouseLeave={() => setMenuOpen(false)} className="soft-glass absolute right-0 top-full z-30 mt-1 w-52 rounded-xl p-1.5 text-xs shadow-2xl [animation:window-in_.16s_cubic-bezier(.22,1,.36,1)]">
              {([
                ["New tab", () => newTab(), true],
                ["Bookmark this page", () => page && toggleBookmark({ title: docTitle || hostOf(page) || page, url: page }), Boolean(page) && !marked],
                ["Open in a real browser tab", () => page && window.open(page, "_blank", "noopener,noreferrer"), Boolean(page)],
                ["Go home", goHome, true],
              ] as [string, () => void, boolean][]).map(([label, run, enabled]) => (
                <button key={label} type="button" role="menuitem" disabled={!enabled} onClick={() => { run(); setMenuOpen(false); }} className="block w-full rounded-lg px-3 py-2 text-left hover:bg-white/10 disabled:opacity-35 disabled:hover:bg-transparent">{label}</button>
              ))}
            </div>
          )}
        </div>
        {(loading || results?.hits === null) && <div className="absolute inset-x-0 bottom-0 h-0.5 overflow-hidden"><div className="chrome-progress h-full w-full origin-left bg-primary" /></div>}
      </div>
      {bookmarks.length > 0 && (
        <div className="chrome-toolbar flex h-8 shrink-0 items-center gap-1 overflow-x-auto border-b border-white/[.06] px-2.5">
          {bookmarks.map((mark) => (
            <button key={mark.url} type="button" title={mark.url} onClick={() => navigateTo(mark.url)} onContextMenu={(event) => { event.preventDefault(); event.stopPropagation(); toggleBookmark(mark); }} className="flex max-w-[10rem] shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] text-foreground/80 hover:bg-white/10">
              <SiteIcon host={hostOf(mark.url)} className="size-3.5" /><span className="truncate">{mark.title}</span>
            </button>
          ))}
        </div>
      )}
      <div className="relative flex-1 overflow-hidden bg-background">
        {results && (
          <div className="absolute inset-0 z-20 overflow-auto bg-background p-4 [animation:rise_.25s_cubic-bezier(.22,1,.36,1)]">
            <div className="mx-auto max-w-2xl">
              <p className="text-xs text-muted-foreground">Results for “{results.query}”</p>
              {results.note && <p className="mt-1 text-[11px] text-muted-foreground/80">{results.note}</p>}
              {results.hits === null && <div className="mt-4 space-y-4">{[0, 1, 2, 3].map((i) => <div key={i} className="animate-pulse space-y-2"><div className="h-3 w-32 rounded bg-white/10" /><div className="h-4 w-2/3 rounded bg-white/10" /><div className="h-3 w-full rounded bg-white/[.06]" /></div>)}</div>}
              {results.error && (
                <p className="mt-6 text-sm">
                  No results came back. <button type="button" className="underline" onClick={() => window.open(`https://duckduckgo.com/?q=${encodeURIComponent(results.query)}`, "_blank", "noopener,noreferrer")}>Open DuckDuckGo in a new tab</button>
                </p>
              )}
              <div className="stagger">{results.hits?.map((hit) => <SearchResult key={hit.url} hit={hit} open={() => navigateTo(hit.url)} />)}</div>
            </div>
          </div>
        )}
        {frame ? <>
          {loading && <div className="absolute inset-0 z-10 grid place-items-center bg-background/80"><div className="text-center"><SiteIcon host={hostOf(frameTarget ?? "")} className="mx-auto size-10 animate-pulse" /><p className="mt-3 text-xs text-muted-foreground">Opening {hostOf(frameTarget ?? "") || "page"} securely…</p></div></div>}
          <iframe ref={frameRef} key={frame.mode === "engine" ? "engine" : `${frame.mode}-${frameKey}`} title="PRIVATE Browser page" src={frame.src} onLoad={() => setLoading(false)} className="size-full border-0 bg-background" allow="fullscreen; clipboard-read; clipboard-write; autoplay" sandbox={frame.mode === "direct" ? DIRECT_SANDBOX : frame.mode === "loader" ? PROXY_SANDBOX : undefined} />
        </> : (
          <div className="flex size-full flex-col items-center overflow-auto px-5 pt-[12%] text-center [animation:rise_.35s_cubic-bezier(.22,1,.36,1)]">
            <div className="relative">
              <h2 className="font-['Orbitron',sans-serif] text-[clamp(2rem,6vw,3.4rem)] font-bold leading-none tracking-[.08em] text-primary [text-shadow:0_0_24px_color-mix(in_oklab,var(--primary)_40%,transparent)]">PRIVATE</h2>
              <span className="absolute -right-4 -top-1.5 rounded-[3px] bg-primary px-1 py-px font-['Orbitron',sans-serif] text-[8px] font-bold leading-none text-primary-foreground">SEARCH</span>
            </div>
            <form onSubmit={(event) => { event.preventDefault(); navigateTo(address); }} className="chrome-omnibox mt-8 flex h-12 w-full max-w-xl items-center gap-3 rounded-full px-5 shadow-lg">
              <Search className="size-4 shrink-0 text-foreground/60" />
              <input id="home-search" autoFocus={active} aria-label="Search DuckDuckGo or enter address" value={address} onChange={(event) => setAddress(event.target.value)} placeholder="Search DuckDuckGo or type a URL" className="h-full min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-foreground/45" />
            </form>
            <div className="stagger mt-8 grid w-full max-w-xl grid-cols-4 gap-2 sm:grid-cols-4">
              {NTP_SHORTCUTS.map((item) => (
                <button key={item.url} type="button" aria-label={`Open ${item.title}`} onClick={() => navigateTo(item.url)} className="chrome-tile flex flex-col items-center gap-2 rounded-2xl p-3 hover:bg-white/[.07]">
                  <span className="grid size-12 place-items-center rounded-full bg-white/10">{item.url === CHERRION_URL ? <Cherry className="size-5 text-rose-300" /> : <SiteIcon host={hostOf(item.url)} className="size-6" />}</span>
                  <span className="w-full truncate text-[11px] text-foreground/80">{item.title}</span>
                </button>
              ))}
            </div>
            <p className="mt-8 flex items-center gap-1.5 pb-6 text-[11px] text-muted-foreground"><ShieldCheck className="size-3.5 text-primary" />Shields on · trackers blocked · nothing saved after you close</p>
          </div>
        )}
      </div>
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
                  openPathInApp(path, open);
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
    <WindowFrame title="Private OneNote" icon={NotesIcon} close={close}>
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

type OsSettings = { blur: number; dim: number; lockBlur: number; lockDim: number; clock24: boolean; widgets: string[]; wpos: Record<string, { x: number; y: number }>; desktop: string[]; railHidden: boolean; hubHidden: boolean; bigIcons: boolean; dockPos: "bottom" | "top" | "right"; theme: string; accent: string; scrollAccent: string; particles: boolean; ambient: boolean; reduceMotion: boolean; nativeCursor: boolean; glassBlur: number; glassOpacity: number; dockScale: number; showDate: boolean; showIcons: boolean; slideshow: number; dockPins: string[]; dockAutoHide: boolean; timeZone: string; worldClocks: string[]; titleButtons: "compact" | "comfortable" | "large"; autoLock: number; weekStart: number; desktopLabels: boolean; skipStart: boolean; uiStyle: "classic" | "modern"; uiSounds: boolean; soundHover: boolean; soundClick: boolean; soundVolume: number; lite: boolean; onboarded: boolean; userName: string; dockStyle: "taskbar" | "floating"; dockOpacity: number; dockLiquid: boolean };
const DEFAULT_SETTINGS: OsSettings = { blur: 0, dim: 15, lockBlur: 8, lockDim: 65, clock24: true, widgets: [], wpos: {}, desktop: ["files", "browser", "notes", "photos"], railHidden: true, hubHidden: true, bigIcons: false, dockPos: "bottom", theme: "private", accent: "", scrollAccent: "", particles: true, ambient: true, reduceMotion: false, nativeCursor: false, glassBlur: 42, glassOpacity: 0, dockScale: 100, showDate: true, showIcons: true, slideshow: 0, dockPins: ["browser", "files", "notes", "calc", "figure", "settings"], dockAutoHide: false, timeZone: "", worldClocks: [], titleButtons: "comfortable", autoLock: 0, weekStart: 0, desktopLabels: true, skipStart: false, uiStyle: "classic", uiSounds: true, soundHover: true, soundClick: true, soundVolume: 40, lite: false, onboarded: false, userName: "", dockStyle: "taskbar", dockOpacity: 70, dockLiquid: false };
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

function CalendarWidget({ weekStart = 0 }: { weekStart?: number }) {
  const now = new Date();
  const first = (new Date(now.getFullYear(), now.getMonth(), 1).getDay() - weekStart + 7) % 7;
  const days = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const cells: (number | null)[] = [...Array.from({ length: first }, () => null), ...Array.from({ length: days }, (_, i) => i + 1)];
  return (
    <div>
      <p className="mb-2 text-center font-semibold">{now.toLocaleDateString("en-US", { month: "long", year: "numeric" })}</p>
      <div className="grid grid-cols-7 gap-1 text-center text-[10px]">
        {(weekStart ? ["M", "T", "W", "T", "F", "S", "S"] : ["S", "M", "T", "W", "T", "F", "S"]).map((day, i) => <span key={i} className="text-muted-foreground">{day}</span>)}
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
type SearchHit = { title: string; url: string; snippet: string; image?: string | undefined };

// Site pictures load through the page loader, so the result sites never see who is searching.
const viaLoader = (url: string) => `/api/proxy?url=${encodeURIComponent(url)}`;

function SearchResult({ hit, open }: { hit: SearchHit; open: () => void }) {
  const [imageFailed, setImageFailed] = useState(false);
  const [iconFailed, setIconFailed] = useState(false);
  let host = "";
  try {
    host = new URL(hit.url).hostname.replace(/^www\./, "");
  } catch {
    // keep the plain address
  }
  return (
    <button type="button" onClick={open} className="mt-3 flex w-full items-start gap-3 rounded-lg p-2 text-left transition-colors hover:bg-secondary/60">
      <span className="min-w-0 flex-1">
        <span className="flex min-w-0 items-center gap-1.5 text-[11px] text-muted-foreground">
          {host && !iconFailed ? <img src={viaLoader(`https://icons.duckduckgo.com/ip3/${host}.ico`)} alt="" loading="lazy" onError={() => setIconFailed(true)} className="size-4 shrink-0 rounded-sm bg-white/90 object-contain" /> : <Globe className="size-4 shrink-0" />}
          <span className="truncate">{host || hit.url}</span>
        </span>
        <span className="mt-0.5 block text-sm font-semibold text-primary">{hit.title}</span>
        <span className="mt-0.5 line-clamp-3 block text-xs text-muted-foreground">{hit.snippet}</span>
      </span>
      {hit.image && !imageFailed && <img src={viaLoader(hit.image)} alt="" loading="lazy" onError={() => setImageFailed(true)} className="h-[4.5rem] w-28 shrink-0 rounded-md border border-border bg-secondary object-cover" />}
    </button>
  );
}

// Where a dragged window would snap: left/right edge, or the top edge to expand it.
function edgeZone(x: number, y: number): "left" | "right" | "up" | null {
  return x <= 16 ? "left" : x >= window.innerWidth - 16 ? "right" : y <= 24 ? "up" : null;
}

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
  const reserve = width >= 768 ? 72 : 56;
  Object.assign(node.style, {
    left: `${zone === "max" ? 0 : zone === "right" ? Math.round(width / 2) + 4 : 8}px`,
    top: zone === "max" ? "0px" : "8px",
    width: `${zone === "max" ? width : half}px`,
    height: `${zone === "max" ? window.innerHeight - reserve : window.innerHeight - 88}px`,
    borderRadius: zone === "max" ? "0px" : "12px",
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

type ThemeDef = { id: string; name: string; sub: string; accent: string; glass?: boolean; base?: string };
const THEMES: ThemeDef[] = [
  { id: "private", name: "Private", sub: "Original gold", accent: "" },
  { id: "clay", name: "Clay", sub: "Claude's pick: warm terracotta on soft charcoal", accent: "#d97757", base: "#1d1a17" },
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
  { id: "vault-glass", name: "Vault Glass", sub: "Smoked graphite with a quiet violet glow", accent: "#8b7cff", glass: true },
  { id: "arctic-glass", name: "Arctic Glass", sub: "Cool graphite with a soft blue glow", accent: "#5aa9ff", glass: true },
  { id: "rose-glass", name: "Rose Glass", sub: "Soft rose reflections on slate glass", accent: "#f59fb8", glass: true },
  { id: "tokyo-night", name: "Tokyo Night", sub: "Neon city blues on ink", accent: "#7aa2f7", base: "#1a1b26" },
  { id: "dracula", name: "Dracula", sub: "Dark purple with a neon glow", accent: "#bd93f9", base: "#282a36" },
  { id: "nord", name: "Nord", sub: "Calm arctic blue-grey", accent: "#88c0d0", base: "#2e3440" },
  { id: "sunset", name: "Sunset", sub: "Warm dusk orange on plum", accent: "#ff7a59", base: "#2a1520" },
  { id: "mono", name: "Mono", sub: "Clean black and white", accent: "#e5e5e5", base: "#0b0b0c" },
  { id: "ocean-glass", name: "Ocean Glass", sub: "Deep sea glass with cyan light", accent: "#22d3ee", glass: true, base: "#06303a" },
  { id: "forest-glass", name: "Forest Glass", sub: "Mossy green glass", accent: "#4ade80", glass: true, base: "#0e2618" },
];

const WELCOME_THEMES = ["private", "clay", "tokyo-night", "dracula", "nord", "sunset", "mono", "ocean-glass", "forest-glass", "aurora", "plasma", "vault-glass"];

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

// True inside the Modern settings style, so cards draw the Modern header.
const ModernUi = createContext(false);

function CfgCard({ title, children }: { title: string; children: ReactNode }) {
  const modern = useContext(ModernUi);
  if (modern) {
    const count = Array.isArray(children) ? children.filter(Boolean).length : 1;
    return (
      <section className="fx-card modern-card overflow-hidden">
        <header className="flex items-center gap-3 border-b border-white/[.06] px-4 py-3">
          <span className="grid size-7 place-items-center rounded-lg border border-primary/40 bg-primary/10 text-primary"><CheckMark className="size-3.5" aria-hidden /></span>
          <h4 className="flex-1 text-[12px] font-semibold">{title}</h4>
          <span className="text-[10px] tabular-nums text-muted-foreground">{count}</span>
        </header>
        <div className="modern-rows px-4 py-1">{children}</div>
      </section>
    );
  }
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
    { id: "time", label: "Date & time", sub: "Time zone and clocks", icon: Globe, title: "Date & time", heading: "Time zone, world clocks and format" },
    { id: "dock", label: "Dock", sub: "Pinned apps and behaviour", icon: Layers, title: "Dock", heading: "Pin, reorder and hide" },
    { id: "backup", label: "Backup", sub: "Export and import", icon: Download, title: "Backup", heading: "Move your setup between browsers" },
    { id: "about", label: "About", sub: "Version and changelog", icon: Info, title: "About", heading: "What this OS is and what's new" },
  ];
  const [page, setPage] = useState("themes");
  const [qcOpen, setQcOpen] = useState(false);
  const [qcQuery, setQcQuery] = useState("");
  const [themeTab, setThemeTab] = useState<"all" | "glass">("all");
  const [themeQuery, setThemeQuery] = useState("");
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
  const modern = settings.uiStyle === "modern";
  const curTheme = THEMES.find((item) => item.id === settings.theme) ?? THEMES[0]!;
  const baseColor = modern ? "#8b7cff" : "#f2c783";
  const curColor = curTheme.accent || baseColor;
  const shownThemes = THEMES.filter((item) => (themeTab === "all" || item.glass) && `${item.name} ${item.sub}`.toLowerCase().includes(themeQuery.toLowerCase()));
  const primaryIds = ["themes", "configs", "appearance", "settings", "backup", "about"];
  const categoryCounts: Record<string, number> = { widgets: settings.widgets.length, dock: settings.dockPins.length, time: settings.worldClocks.length, network: 0 };
  const quickList = [...configs, ...PUBLIC_CONFIGS].filter((item) => item.name.toLowerCase().includes(qcQuery.toLowerCase()));
  const particlesEl = settings.particles && !settings.lite ? (
          <div aria-hidden className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
            {Array.from({ length: 16 }, (_, i) => <span key={i} className="particle" style={{ left: `${(i * 37) % 100}%`, top: `${(i * 53) % 100}%`, animationDelay: `${-(i * 1.7) % 9}s`, animationDuration: `${8 + (i % 5) * 2}s` }} />)}
          </div>
  ) : null;
  const customized = (Object.keys(DEFAULT_SETTINGS) as (keyof OsSettings)[]).filter((key) => key !== "uiStyle" && JSON.stringify(settings[key]) !== JSON.stringify(DEFAULT_SETTINGS[key])).length;
  const resetDefaults = () => { patch({ ...DEFAULT_SETTINGS, uiStyle: settings.uiStyle }); log("Settings reset to defaults"); };
  const classicAside = (
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
  );
  const contentEl = (
        <div key={page} className="page-in relative z-10 min-h-0 flex-1 overflow-auto p-4 md:p-6">
          <h2 className={`text-2xl font-bold ${modern ? "tracking-tight" : "font-['Playfair_Display',serif]"}`}>{current.title}</h2>
          <p className="mb-4 text-xs text-muted-foreground">{current.heading}</p>

          {page === "themes" && modern && (
            <div className="stagger space-y-5">
              <div className="grid gap-4 rounded-2xl border border-white/[.06] bg-[#12131b] p-4 lg:grid-cols-[1fr_17rem]">
                <div>
                  <p className="text-[9px] font-semibold tracking-[.18em] text-muted-foreground">CURRENT THEME</p>
                  <p className="mt-1 text-lg font-bold">{curTheme.name}</p>
                  <p className="mt-0.5 text-[11px] text-primary">✓ Frosted cards + ambient glow</p>
                  <p className="mt-1 text-[11px] text-muted-foreground">{curTheme.sub}</p>
                  <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 text-[10px]">
                    {([["Accent", curColor], ["Background", "#0d0e14"], ["Surface", "#161822"], ["Scrollbar", settings.scrollAccent || curColor]] as const).map(([label, value]) => (
                      <div key={label} className="flex items-center gap-2"><span className="size-4 rounded-[5px] ring-1 ring-white/15" style={{ background: value }} /><div><dt className="text-muted-foreground">{label}</dt><dd className="font-mono">{value}</dd></div></div>
                    ))}
                  </dl>
                </div>
                <ThemePreview accent={curColor} />
              </div>
              <div className="flex items-end justify-between"><p className="text-sm font-bold">Choose a theme</p><span className="text-[10px] text-muted-foreground">{shownThemes.length} themes</span></div>
              <div className="flex flex-wrap items-center gap-2">
                {([["all", "All themes"], ["glass", "Glass"]] as const).map(([id, label]) => <button key={id} type="button" aria-pressed={themeTab === id} onClick={() => setThemeTab(id)} className={`rounded-lg px-3 py-1.5 text-[11px] font-semibold ${themeTab === id ? "bg-primary text-primary-foreground" : "border border-white/10 bg-black/30"}`}>{label}</button>)}
                <label className="flex min-w-[10rem] flex-1 items-center gap-2 rounded-lg border border-white/10 bg-black/30 px-2.5"><Search className="size-3.5 text-muted-foreground" aria-hidden /><input aria-label="Search themes" value={themeQuery} onChange={(event) => setThemeQuery(event.target.value)} placeholder="Search themes…" className="h-8 w-full bg-transparent text-[11px] outline-none" /></label>
              </div>
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {shownThemes.map((theme) => {
                  const on = settings.theme === theme.id;
                  const color = theme.accent || baseColor;
                  return (
                    <button key={theme.id} type="button" onClick={() => chooseTheme(theme)} aria-pressed={on} className="fx-card rounded-2xl border bg-[#12131b] p-2 text-left" style={{ borderColor: on ? color : "rgb(255 255 255 / .07)", boxShadow: on ? `0 0 0 1px ${color}` : undefined }}>
                      <ThemePreview accent={color} badge={theme.glass ? "GLASS" : undefined} />
                      <div className="flex items-start justify-between gap-2 px-1.5 pb-1 pt-2"><div className="min-w-0"><p className="text-[11px] font-bold">{theme.name}</p><p className="truncate text-[9px] text-muted-foreground">{theme.sub}</p></div>{on && <span className="shrink-0 text-[9px] font-semibold" style={{ color }}>✓ Active</span>}</div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {page === "configs" && modern && (
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <label className="flex min-w-[10rem] flex-1 items-center gap-2 rounded-lg border border-white/10 bg-black/30 px-2.5"><Search className="size-3.5 text-muted-foreground" aria-hidden /><input aria-label="Search configs" value={cfgQuery} onChange={(event) => setCfgQuery(event.target.value)} placeholder="Search configs, creators or tags…" className="h-8 w-full bg-transparent text-[11px] outline-none" /></label>
                <button type="button" onClick={importConfig} className={`${btn} border border-white/10 bg-black/30`}>Import</button>
                <button type="button" onClick={newConfig} className={`${btn} bg-primary text-primary-foreground`}>+ New config</button>
              </div>
              <div className="flex gap-1.5 text-[11px]">
                {([["all", `All ${configs.length + PUBLIC_CONFIGS.length}`], ["mine", `Mine ${configs.length}`], ["public", `Public ${PUBLIC_CONFIGS.length}`]] as const).map(([id, label]) => <button key={id} type="button" aria-pressed={tab === id} onClick={() => setTab(id)} className={`rounded-lg px-3 py-1 font-semibold ${tab === id ? "bg-primary text-primary-foreground" : "bg-black/30 text-muted-foreground"}`}>{label}</button>)}
              </div>
              {shown.length === 0 && <p className="p-8 text-center text-xs text-muted-foreground">No configs here yet. Use + New config to save your current setup.</p>}
              <div className="stagger grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {shown.map((config) => (
                  <div key={config.id} className="fx-card overflow-hidden rounded-2xl border border-white/[.07] bg-[#12131b]">
                    <div className="flex items-center gap-2 bg-primary/10 px-3 py-2 text-[9px] font-semibold tracking-widest text-primary"><Save className="size-3.5" aria-hidden />{config.mine ? "PRIVATE" : "BUILT-IN"}</div>
                    <div className="space-y-1.5 p-3">
                      <p className="text-xs font-bold">{config.name}</p>
                      <p className="line-clamp-2 min-h-[2rem] text-[10px] text-muted-foreground">{config.desc}</p>
                      <div className="flex flex-wrap gap-1">{config.tags.map((tag) => <span key={tag} className="rounded bg-primary/15 px-1.5 py-0.5 text-[9px] text-primary">{tag}</span>)}</div>
                      <div className="flex items-center gap-1.5 pt-1">
                        <span className="mr-auto text-[9px] text-muted-foreground">{config.mine ? "By you" : "Public"}</span>
                        {config.mine && <button type="button" onClick={() => editConfig(config)} className={`${btn} bg-black/30`}>Edit</button>}
                        <button type="button" onClick={() => shareConfig(config)} className={`${btn} bg-black/30`}>Share</button>
                        {config.mine && <button type="button" onClick={() => saveConfigs(configs.filter((item) => item.id !== config.id))} className={`${btn} bg-red-500/70 text-white`}>Delete</button>}
                        <button type="button" onClick={() => applyConfig(config)} className={`${btn} bg-primary text-primary-foreground`}>Load</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {page === "themes" && !modern && (
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

          {page === "configs" && !modern && (
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

          {page === "time" && (
            <div className="stagger space-y-4">
              <CfgCard title="Time zone">
                <CfgRow title="Current time" sub={settings.timeZone || "Automatic (this device)"}><LiveTime zone={settings.timeZone || undefined} hour12={!settings.clock24} /></CfgRow>
                <select aria-label="Time zone" value={settings.timeZone} onChange={(event) => patch({ timeZone: event.target.value })} className="w-full rounded-md bg-white/10 px-2 py-2 text-xs">
                  <option value="">Automatic (this device)</option>
                  {ZONES.map((zone) => <option key={zone} value={zone}>{zone.replace(/_/g, " ")}</option>)}
                </select>
                <CfgRow title="24-hour clock" sub="Switch between 24h and 12h time"><Switch on={settings.clock24} label="24-hour clock" onChange={(value) => patch({ clock24: value })} /></CfgRow>
                <CfgRow title="Date in the tray" sub="Show the date under the time"><Switch on={settings.showDate} label="Date in the tray" onChange={(value) => patch({ showDate: value })} /></CfgRow>
              </CfgCard>
              <CfgCard title="World clocks">
                {settings.worldClocks.length === 0 && <p className="text-xs text-muted-foreground">Add cities to see their time here.</p>}
                {settings.worldClocks.map((zone) => (
                  <CfgRow key={zone} title={(zone.split("/").pop() ?? zone).replace(/_/g, " ")} sub={zone}>
                    <span className="flex items-center gap-2"><LiveTime zone={zone} hour12={!settings.clock24} /><button type="button" aria-label={`Remove ${zone}`} onClick={() => patch({ worldClocks: settings.worldClocks.filter((item) => item !== zone) })} className={`${btn} bg-white/10`}>Remove</button></span>
                  </CfgRow>
                ))}
                <select aria-label="Add a world clock" value="" onChange={(event) => { if (event.target.value) patch({ worldClocks: [...settings.worldClocks, event.target.value] }); }} className="w-full rounded-md bg-white/10 px-2 py-2 text-xs">
                  <option value="">Add a city…</option>
                  {ZONES.filter((zone) => !settings.worldClocks.includes(zone)).map((zone) => <option key={zone} value={zone}>{zone.replace(/_/g, " ")}</option>)}
                </select>
              </CfgCard>
            </div>
          )}

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

          {page === "settings" && modern && (
            <div className="-mx-4 -mt-1 mb-4 flex items-center justify-end gap-3 border-y border-white/[.06] bg-[#0d0e14]/70 px-4 py-2 md:-mx-6 md:px-6">
              <span className="text-[10px] text-muted-foreground">{customized} customized</span>
              <button type="button" onClick={resetDefaults} disabled={customized === 0} className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-black/30 px-3 py-1.5 text-[11px] font-semibold disabled:opacity-40"><RotateCcw className="size-3" aria-hidden />Reset defaults</button>
            </div>
          )}

          {page === "settings" && (
            <div className="grid gap-4 lg:grid-cols-[1fr_14rem]">
              <div className="stagger space-y-4">
                <CfgCard title="Interface style">
                  <p className="text-[10px] text-muted-foreground">Pick how every app looks. Both keep the same animations and sounds.</p>
                  <div className="grid grid-cols-2 gap-3">
                    {([["classic", "Classic", "The current look, with a serif heading and soft glass."], ["modern", "Modern", "Dark frosted panels, purple toggles, a search bar, quick configs and a themes grid."]] as const).map(([id, label, sub]) => (
                      <button key={id} type="button" aria-pressed={settings.uiStyle === id} onClick={() => patch({ uiStyle: id })} className={`fx-card rounded-2xl border p-2.5 text-left ${settings.uiStyle === id ? "border-primary bg-primary/10" : "border-white/10 bg-black/20"}`}>
                        <StylePreview kind={id} />
                        <p className="mt-2 text-xs font-bold">{label}{settings.uiStyle === id ? " ✓" : ""}</p>
                        <p className="text-[10px] leading-snug text-muted-foreground">{sub}</p>
                      </button>
                    ))}
                  </div>
                </CfgCard>
                <CfgCard title="Performance">
                  <CfgRow title={settings.lite ? "Optimized ✓" : "Full effects"} sub={settings.lite ? "Blur, glow, particles and looping animations are off so every theme runs smoothly." : isLowPowerDevice() ? "This device looks low-power. Optimize to make every theme faster." : "Glass blur, glow and particles are on. Optimize if things feel slow."}>
                    {settings.lite ? (
                      <button type="button" onClick={() => { patch({ lite: false }); log("Full effects restored"); }} className={`${btn} bg-white/10`}>Restore full effects</button>
                    ) : (
                      <button type="button" onClick={() => { log("Optimizing for speed"); requestOptimize(); }} className={`${btn} bg-primary text-primary-foreground`}>Optimize</button>
                    )}
                  </CfgRow>
                </CfgCard>
                <CfgCard title="Desktop style">
                  <p className="text-[10px] text-muted-foreground">Clay is a warm theme with its own moving wallpaper and softer windows. You can still pick any theme below.</p>
                  <div className="grid grid-cols-2 gap-3">
                    {([["private", "Standard", "The PRIVATE OS desktop with your own wallpaper."], ["clay", "Clay", "Warm terracotta, a slow glowing wallpaper and soft rounded windows."]] as const).map(([id, label, sub]) => {
                      const on = id === "clay" ? settings.theme === "clay" : settings.theme !== "clay";
                      return (
                        <button key={id} type="button" aria-pressed={on} onClick={() => { if (!on) chooseTheme(THEMES.find((theme) => theme.id === id)!); }} className={`fx-card rounded-2xl border p-2.5 text-left ${on ? "border-primary bg-primary/10" : "border-white/10 bg-black/20"}`}>
                          <DesktopPreview kind={id} />
                          <p className="mt-2 text-xs font-bold">{label}{on ? " ✓" : ""}</p>
                          <p className="text-[10px] leading-snug text-muted-foreground">{sub}</p>
                        </button>
                      );
                    })}
                  </div>
                </CfgCard>
                <CfgCard title="Sounds">
                  <CfgRow title="Interface sounds" sub="A soft tick when you hover a button and a pop when you click"><Switch on={settings.uiSounds} label="Interface sounds" onChange={(value) => patch({ uiSounds: value })} /></CfgRow>
                  <CfgRow title="Hover sound" sub="Plays when the pointer moves onto a button"><Switch on={settings.soundHover} label="Hover sound" onChange={(value) => patch({ soundHover: value })} /></CfgRow>
                  <CfgRow title="Click sound" sub="Plays when you press a button or switch"><Switch on={settings.soundClick} label="Click sound" onChange={(value) => patch({ soundClick: value })} /></CfgRow>
                  <CfgSlider label="Volume" value={settings.soundVolume} max={100} unit="%" onChange={(value) => patch({ soundVolume: value })} />
                  <button type="button" onClick={() => { playHover(settings.soundVolume / 100); window.setTimeout(() => playClick(settings.soundVolume / 100), 260); }} className={`${btn} bg-white/10`}>Play a test sound</button>
                  <p className="text-[10px] text-muted-foreground">Sounds are made on your device. Hover sounds only play with a mouse. Your browser may stay silent until you click once.</p>
                </CfgCard>
                <CfgCard title="General">
                  <CfgRow title="Search key" sub="Search apps, files and commands"><kbd className="rounded-md bg-white/10 px-2 py-1 text-xs font-semibold">Ctrl + K</kbd></CfgRow>
                  <CfgRow title="24-hour clock" sub="Switch between 24h and 12h time"><Switch on={settings.clock24} label="24-hour clock" onChange={(value) => patch({ clock24: value })} /></CfgRow>
                  <CfgRow title="Date in the tray" sub="Show the date under the time"><Switch on={settings.showDate} label="Date in the tray" onChange={(value) => patch({ showDate: value })} /></CfgRow>
                  <CfgRow title="Desktop icons" sub="Show app shortcuts on the desktop"><Switch on={settings.showIcons} label="Desktop icons" onChange={(value) => patch({ showIcons: value })} /></CfgRow>
                  <CfgRow title="Desktop labels" sub="Show names under desktop icons"><Switch on={settings.desktopLabels} label="Desktop labels" onChange={(value) => patch({ desktopLabels: value })} /></CfgRow>
                  <CfgRow title="Skip start screen" sub="Go straight to the lock screen when you open PRIVATE OS"><Switch on={settings.skipStart} label="Skip start screen" onChange={(value) => patch({ skipStart: value })} /></CfgRow>
                  <CfgRow title="Auto-lock" sub="Lock after you stop using it">
                    <select aria-label="Auto-lock" value={settings.autoLock} onChange={(event) => patch({ autoLock: Number(event.target.value) })} className="rounded-md bg-white/10 px-2 py-1 text-xs"><option value={0}>Never</option><option value={1}>1 minute</option><option value={5}>5 minutes</option><option value={10}>10 minutes</option><option value={30}>30 minutes</option></select>
                  </CfgRow>
                  <CfgRow title="Week starts on" sub="Used by the calendar widget">
                    <select aria-label="Week starts on" value={settings.weekStart} onChange={(event) => patch({ weekStart: Number(event.target.value) })} className="rounded-md bg-white/10 px-2 py-1 text-xs"><option value={0}>Sunday</option><option value={1}>Monday</option></select>
                  </CfgRow>
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
                <CfgCard title="Windows">
                  <CfgRow title="Title bar buttons" sub="Bigger buttons are easier to click">
                    <div className="flex gap-1">{(["compact", "comfortable", "large"] as const).map((size) => <button key={size} type="button" onClick={() => patch({ titleButtons: size })} className={`${btn} capitalize ${settings.titleButtons === size ? "bg-primary text-primary-foreground" : "bg-white/10"}`}>{size}</button>)}</div>
                  </CfgRow>
                </CfgCard>
                <CfgCard title="Accessibility">
                  <CfgRow title="Reduce motion" sub="Turns off animations and transitions"><Switch on={settings.reduceMotion} label="Reduce motion" onChange={(value) => patch({ reduceMotion: value })} /></CfgRow>
                  <CfgRow title="Mint cursors" sub="Off uses your system cursor"><Switch on={!settings.nativeCursor} label="Mint cursors" onChange={(value) => patch({ nativeCursor: !value })} /></CfgRow>
                </CfgCard>
                <CfgCard title="Reset">
                  <button type="button" onClick={resetDefaults} className={`${btn} w-full bg-white/10 py-2`}>Reset look and widgets</button>
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
  );
  const modernAside = (
    <aside className="relative z-10 flex shrink-0 gap-1 overflow-x-auto border-b border-white/[.06] bg-[#0d0e14] p-2 md:w-52 md:flex-col md:overflow-y-auto md:border-b-0 md:border-r md:p-3">
      <div className="hidden items-center gap-2.5 px-1 pb-3 md:flex">
        <span className="grid size-9 place-items-center rounded-xl bg-primary/20 text-primary shadow-[0_0_18px_color-mix(in_oklab,var(--primary)_35%,transparent)]"><Crown className="size-4" /></span>
        <div><p className="font-['Playfair_Display',serif] text-sm font-bold leading-tight">Private</p><p className="text-[8px] tracking-[.16em] text-muted-foreground">OS EDITION</p></div>
      </div>
      <p className="hidden px-2 pb-1 text-[8px] font-semibold tracking-[.2em] text-muted-foreground md:block">SYSTEM</p>
      {NAV.filter((item) => primaryIds.includes(item.id)).map((item) => {
        const Icon = item.icon;
        const on = item.id === page;
        return <button key={item.id} type="button" onClick={() => setPage(item.id)} aria-current={on ? "page" : undefined} className={`flex shrink-0 items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-[11px] font-semibold ${on ? "bg-primary/15 shadow-[inset_2px_0_0_var(--primary)]" : "text-muted-foreground hover:bg-white/5 hover:text-foreground"}`}><Icon className="size-3.5" />{item.label}</button>;
      })}
      <p className="hidden px-2 pb-1 pt-3 text-[8px] font-semibold tracking-[.2em] text-muted-foreground md:block">CATEGORIES</p>
      {NAV.filter((item) => !primaryIds.includes(item.id)).map((item) => {
        const Icon = item.icon;
        const on = item.id === page;
        return <button key={item.id} type="button" onClick={() => setPage(item.id)} aria-current={on ? "page" : undefined} className={`flex shrink-0 items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-[11px] font-semibold ${on ? "bg-primary/15 shadow-[inset_2px_0_0_var(--primary)]" : "text-muted-foreground hover:bg-white/5 hover:text-foreground"}`}><Icon className="size-3.5" /><span className="flex-1">{item.label}</span>{(categoryCounts[item.id] ?? 0) > 0 && <span className="text-[9px] tabular-nums text-muted-foreground">{categoryCounts[item.id]}</span>}</button>;
      })}
      <div className="mt-auto hidden space-y-2 md:block">
        <button type="button" onClick={() => window.dispatchEvent(new KeyboardEvent("keydown", { key: "k", code: "KeyK", ctrlKey: true }))} className="flex w-full items-center gap-2 rounded-lg border border-white/[.07] px-2.5 py-2 text-[10px] text-muted-foreground hover:bg-white/5"><Search className="size-3" aria-hidden />Quick switch<span className="ml-auto rounded bg-white/10 px-1 text-[9px]">Ctrl K</span></button>
        <div className="flex items-center gap-2 rounded-lg border border-white/[.07] p-2"><span className="grid size-7 place-items-center rounded-lg bg-primary/25 text-[11px] font-bold text-primary">P</span><div><p className="text-[10px] font-semibold">private</p><p className="text-[9px] text-muted-foreground">Local profile</p></div></div>
      </div>
    </aside>
  );
  const modernTop = (
    <div className="relative z-20 flex shrink-0 flex-wrap items-center gap-2 border-b border-white/[.06] bg-[#0d0e14] px-4 py-2">
      <span className="flex items-center gap-2 text-[11px] text-muted-foreground"><current.icon className="size-3.5" />{current.title}</span>
      <div className="ml-auto flex items-center gap-2">
        <label className="flex w-40 items-center gap-2 rounded-lg border border-white/10 bg-black/30 px-2.5 sm:w-60"><Search className="size-3.5 text-muted-foreground" aria-hidden /><input aria-label="Search settings" value={query} onChange={(event) => setQuery(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter" && navShown[0]) { setPage(navShown[0].id); setQuery(""); } }} placeholder="Search modules or settings…" className="h-8 w-full bg-transparent text-[11px] outline-none" /></label>
        <div className="relative">
          <button type="button" aria-haspopup="true" aria-expanded={qcOpen} onClick={() => setQcOpen((value) => !value)} className="flex items-center gap-2 rounded-lg border border-white/10 bg-black/30 px-3 py-1.5 text-[11px] font-semibold"><Save className="size-3.5" aria-hidden />Quick configs<ChevronDown className="size-3" aria-hidden /></button>
          {qcOpen && (
            <div role="dialog" aria-label="Quick configs" className="absolute right-0 top-full z-30 mt-2 w-72 rounded-xl border border-white/10 bg-[#14151d] p-3 shadow-2xl [animation:window-in_.18s_cubic-bezier(.22,1,.36,1)]">
              <div className="flex items-start gap-2"><Save className="mt-0.5 size-4 text-primary" aria-hidden /><div className="flex-1"><p className="text-xs font-bold">Quick configs</p><p className="text-[9px] text-muted-foreground">Your personal library</p></div><button type="button" aria-label="Close quick configs" onClick={() => setQcOpen(false)} className="rounded p-1 hover:bg-white/10"><X className="size-3.5" /></button></div>
              <label className="mt-2 flex items-center gap-2 rounded-lg border border-white/10 bg-black/30 px-2.5"><Search className="size-3 text-muted-foreground" aria-hidden /><input aria-label="Search your configs" value={qcQuery} onChange={(event) => setQcQuery(event.target.value)} placeholder="Search your configs…" className="h-7 w-full bg-transparent text-[10px] outline-none" /></label>
              <ul className="mt-2 max-h-48 overflow-auto">
                {quickList.map((config) => <li key={config.id} className="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-white/5"><span className="min-w-0 flex-1"><span className="block truncate text-[11px] font-semibold">{config.name}</span><span className="text-[9px] text-muted-foreground">{config.mine ? "Private" : "Public"}</span></span><button type="button" onClick={() => { applyConfig(config); setQcOpen(false); }} className="rounded px-2 py-1 text-[10px] font-semibold text-primary hover:bg-primary/15">Apply</button></li>)}
                {quickList.length === 0 && <li className="p-3 text-center text-[10px] text-muted-foreground">No configs match.</li>}
              </ul>
              <button type="button" onClick={() => { setPage("configs"); setQcOpen(false); }} className="mt-2 flex w-full items-center gap-2 border-t border-white/10 px-1 pt-2 text-[10px] text-muted-foreground hover:text-foreground"><Save className="size-3" aria-hidden />Config library</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
  const modernStatus = (
    <div className="flex shrink-0 items-center justify-between border-t border-white/[.06] bg-[#0d0e14] px-4 py-1.5 text-[9px] text-muted-foreground"><span className="flex items-center gap-1.5"><span className="size-1.5 rounded-full bg-green-400" />OS active</span><span>{settings.widgets.length} widgets on</span><span>{OS_VERSION}</span></div>
  );

  return (
    <WindowFrame title="Settings" icon={SettingsIcon} close={close}>
      {modern ? (
        <div style={settings.accent ? undefined : ({ "--primary": "#8b7cff", "--primary-foreground": "#ffffff" } as React.CSSProperties)} className="modern-settings relative flex min-h-0 flex-1 flex-col overflow-hidden md:flex-row">
          <ModernUi.Provider value={true}>
            {particlesEl}
            {modernAside}
            <div className="relative z-10 flex min-h-0 min-w-0 flex-1 flex-col">{modernTop}{contentEl}{modernStatus}</div>
          </ModernUi.Provider>
        </div>
      ) : (
        <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden md:flex-row">
          {particlesEl}
          {classicAside}
          {contentEl}
        </div>
      )}
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
  const [playing, setPlaying] = useState<MiniGameId | null>(null);
  const current = MINI_GAMES.find((game) => game.id === playing);
  if (current) {
    return (
      <WindowFrame title={`Games · ${current.name}`} icon={GamesIcon} close={close}>
        <div className="flex-1 overflow-auto p-4">
          <button type="button" onClick={() => setPlaying(null)} className="mb-3 flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold hover:bg-white/15"><ArrowLeft className="size-3.5" />All games</button>
          <div key={current.id} className="mx-auto max-w-lg [animation:window-in_.25s_cubic-bezier(.22,1,.36,1)]"><MiniGame id={current.id} /></div>
        </div>
      </WindowFrame>
    );
  }
  return (
    <WindowFrame title="Games" icon={GamesIcon} close={close}>
      <div className="flex-1 overflow-auto p-4">
        <p className="text-xs font-semibold text-muted-foreground">BUILT-IN · PLAY OFFLINE</p>
        <div className="stagger mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
          {MINI_GAMES.map((game) => (
            <button key={game.id} type="button" aria-label={`Play ${game.name}`} onClick={() => setPlaying(game.id)} className="fx-card group overflow-hidden rounded-2xl border border-white/10 bg-black/20 text-left">
              <span className={`grid h-20 place-items-center bg-gradient-to-br ${game.tone} text-4xl transition-transform duration-300 group-hover:scale-105`}>{game.emoji}</span>
              <span className="block p-2.5"><span className="block text-sm font-semibold">{game.name}</span><span className="block truncate text-[11px] text-muted-foreground">{game.sub}</span></span>
            </button>
          ))}
        </div>
        <p className="mt-6 text-xs font-semibold text-muted-foreground">FREE TO PLAY ON THE WEB</p>
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

function StickyApp({ close }: { close: () => void }) {
  const COLORS = ["#fde68a", "#bbf7d0", "#bfdbfe", "#fecaca", "#e9d5ff"];
  const [notes, setNotes] = useState<{ id: number; text: string; color: string }[]>([]);
  useEffect(() => {
    try {
      setNotes(JSON.parse(localStorage.getItem("pos-sticky") ?? "[]") as { id: number; text: string; color: string }[]);
    } catch {
      // storage unavailable
    }
  }, []);
  const save = (next: { id: number; text: string; color: string }[]) => {
    setNotes(next);
    try {
      localStorage.setItem("pos-sticky", JSON.stringify(next));
    } catch {
      // storage unavailable
    }
  };
  return (
    <WindowFrame title="Sticky Notes" icon={StickyIcon} close={close}>
      <div className="flex shrink-0 items-center gap-2 border-b border-border p-2">
        {COLORS.map((color) => <button key={color} type="button" aria-label="Add a note" onClick={() => save([...notes, { id: Date.now(), text: "", color }])} className="size-6 rounded-md" style={{ background: color }} />)}
        <span className="text-xs text-muted-foreground">Tap a colour to add a note</span>
      </div>
      <div className="grid flex-1 grid-cols-2 content-start gap-3 overflow-auto p-3 md:grid-cols-3">
        {notes.length === 0 && <p className="col-span-full p-6 text-center text-sm text-muted-foreground">No notes yet.</p>}
        {notes.map((note) => (
          <div key={note.id} className="relative rounded-xl p-2 text-zinc-900 shadow-lg" style={{ background: note.color }}>
            <textarea value={note.text} placeholder="Write something…" aria-label="Note text" onChange={(event) => save(notes.map((item) => (item.id === note.id ? { ...item, text: event.target.value } : item)))} className="h-28 w-full resize-none bg-transparent text-sm outline-none placeholder:text-zinc-600" />
            <button type="button" aria-label="Delete note" onClick={() => save(notes.filter((item) => item.id !== note.id))} className="absolute right-1 top-1 rounded p-1 hover:bg-black/10"><X className="size-3.5" /></button>
          </div>
        ))}
      </div>
    </WindowFrame>
  );
}

function FocusApp({ close }: { close: () => void }) {
  const MODES = { focus: { label: "Focus", seconds: 1500 }, short: { label: "Short break", seconds: 300 }, long: { label: "Long break", seconds: 900 } } as const;
  const [mode, setMode] = useState<keyof typeof MODES>("focus");
  const [left, setLeft] = useState<number>(MODES.focus.seconds);
  const [running, setRunning] = useState(false);
  const [sessions, setSessions] = useState(0);
  const beep = () => {
    try {
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      osc.frequency.value = 880;
      osc.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.4);
    } catch {
      // audio unavailable
    }
  };
  useEffect(() => {
    if (!running) return;
    const timer = window.setInterval(() => setLeft((value) => value - 1), 1000);
    return () => window.clearInterval(timer);
  }, [running]);
  useEffect(() => {
    if (left > 0) return;
    beep();
    setRunning(false);
    if (mode === "focus") setSessions((value) => value + 1);
    setLeft(MODES[mode].seconds);
  }, [left]); // eslint-disable-line react-hooks/exhaustive-deps
  const choose = (next: keyof typeof MODES) => {
    setMode(next);
    setRunning(false);
    setLeft(MODES[next].seconds);
  };
  const total = MODES[mode].seconds;
  return (
    <WindowFrame title="Focus Timer" icon={FocusIcon} close={close}>
      <div className="flex flex-1 flex-col items-center justify-center gap-5 p-6">
        <div className="flex gap-1.5">{(Object.keys(MODES) as (keyof typeof MODES)[]).map((key) => <button key={key} type="button" onClick={() => choose(key)} className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${mode === key ? "bg-primary text-primary-foreground" : "bg-white/10"}`}>{MODES[key].label}</button>)}</div>
        <p className="font-['Orbitron',sans-serif] text-6xl font-bold tabular-nums">{String(Math.floor(left / 60)).padStart(2, "0")}:{String(left % 60).padStart(2, "0")}</p>
        <div className="h-1.5 w-64 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-primary transition-[width] duration-1000 ease-linear" style={{ width: `${((total - left) / total) * 100}%` }} /></div>
        <div className="flex gap-2">
          <button type="button" onClick={() => setRunning((value) => !value)} className="rounded-lg bg-primary px-6 py-2 text-xs font-bold text-primary-foreground">{running ? "Pause" : "Start"}</button>
          <button type="button" onClick={() => { setRunning(false); setLeft(total); }} className="rounded-lg bg-white/10 px-4 py-2 text-xs font-semibold">Reset</button>
        </div>
        <p className="text-xs text-muted-foreground">Focus sessions finished: {sessions}</p>
      </div>
    </WindowFrame>
  );
}

const UNIT_GROUPS: Record<string, Record<string, number>> = {
  Length: { Meters: 1, Kilometers: 1000, Centimeters: 0.01, Millimeters: 0.001, Miles: 1609.344, Yards: 0.9144, Feet: 0.3048, Inches: 0.0254 },
  Weight: { Kilograms: 1, Grams: 0.001, Pounds: 0.45359237, Ounces: 0.0283495231, Tonnes: 1000 },
  Data: { Bytes: 1, Kilobytes: 1024, Megabytes: 1048576, Gigabytes: 1073741824, Terabytes: 1099511627776 },
  Time: { Seconds: 1, Minutes: 60, Hours: 3600, Days: 86400, Weeks: 604800 },
  Speed: { "Meters/second": 1, "Kilometers/hour": 0.277778, "Miles/hour": 0.44704, Knots: 0.514444 },
  Temperature: { Celsius: 1, Fahrenheit: 1, Kelvin: 1 },
};

function ConvertApp({ close }: { close: () => void }) {
  const [group, setGroup] = useState("Length");
  const units = Object.keys(UNIT_GROUPS[group]!);
  const [from, setFrom] = useState("Meters");
  const [to, setTo] = useState("Feet");
  const [value, setValue] = useState("1");
  const pick = (next: string) => {
    const list = Object.keys(UNIT_GROUPS[next]!);
    setGroup(next);
    setFrom(list[0]!);
    setTo(list[1] ?? list[0]!);
  };
  const convert = () => {
    const n = parseFloat(value);
    if (Number.isNaN(n)) return "";
    if (group === "Temperature") {
      const celsius = from === "Fahrenheit" ? (n - 32) * 5 / 9 : from === "Kelvin" ? n - 273.15 : n;
      return String(+(to === "Fahrenheit" ? celsius * 9 / 5 + 32 : to === "Kelvin" ? celsius + 273.15 : celsius).toFixed(4));
    }
    const table = UNIT_GROUPS[group]!;
    return String(+((n * (table[from] ?? 1)) / (table[to] ?? 1)).toPrecision(8));
  };
  const field = "w-full rounded-lg bg-white/10 px-3 py-2 text-sm outline-none";
  return (
    <WindowFrame title="Converter" icon={ConvertIcon} close={close}>
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center gap-3 p-5">
        <select aria-label="Category" value={group} onChange={(event) => pick(event.target.value)} className={field}>{Object.keys(UNIT_GROUPS).map((name) => <option key={name}>{name}</option>)}</select>
        <input aria-label="Value" inputMode="decimal" value={value} onChange={(event) => setValue(event.target.value)} className={field} />
        <div className="grid grid-cols-2 gap-2">
          <select aria-label="From" value={from} onChange={(event) => setFrom(event.target.value)} className={field}>{units.map((name) => <option key={name}>{name}</option>)}</select>
          <select aria-label="To" value={to} onChange={(event) => setTo(event.target.value)} className={field}>{units.map((name) => <option key={name}>{name}</option>)}</select>
        </div>
        <p className="rounded-xl bg-primary/15 p-4 text-center text-2xl font-semibold tabular-nums">{convert() || "—"} <span className="text-sm font-normal text-muted-foreground">{to}</span></p>
      </div>
    </WindowFrame>
  );
}

function PasswordApp({ close }: { close: () => void }) {
  const [length, setLength] = useState(20);
  const [sets, setSets] = useState({ lower: true, upper: true, digits: true, symbols: true });
  const [password, setPassword] = useState("");
  const [copied, setCopied] = useState(false);
  const make = () => {
    const pool = `${sets.lower ? "abcdefghijkmnopqrstuvwxyz" : ""}${sets.upper ? "ABCDEFGHJKLMNPQRSTUVWXYZ" : ""}${sets.digits ? "23456789" : ""}${sets.symbols ? "!@#$%^&*()-_=+[]{}" : ""}`;
    if (!pool) return setPassword("");
    const bytes = new Uint32Array(length);
    crypto.getRandomValues(bytes);
    setPassword(Array.from(bytes, (n) => pool[n % pool.length]).join(""));
    setCopied(false);
  };
  useEffect(make, [length, sets]); // eslint-disable-line react-hooks/exhaustive-deps
  const strength = password.length >= 20 && Object.values(sets).filter(Boolean).length >= 3 ? "Strong" : password.length >= 12 ? "Good" : "Weak";
  return (
    <WindowFrame title="Passwords" icon={PasswordIcon} close={close}>
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center gap-4 p-5">
        <p className="break-all rounded-xl bg-white/10 p-4 text-center font-mono text-sm">{password || "Pick at least one option"}</p>
        <p className="text-center text-xs text-muted-foreground">Strength: {strength} · made on this device, never sent anywhere</p>
        <CfgSlider label="Length" value={length} min={8} max={64} unit="" onChange={setLength} />
        <div className="grid grid-cols-2 gap-2">
          {(["lower", "upper", "digits", "symbols"] as const).map((key) => (
            <label key={key} className="flex items-center justify-between rounded-lg bg-white/5 px-3 py-2 text-xs capitalize">{key}<Switch on={sets[key]} label={key} onChange={(value) => setSets({ ...sets, [key]: value })} /></label>
          ))}
        </div>
        <div className="flex gap-2">
          <button type="button" onClick={make} className="flex-1 rounded-lg bg-white/10 py-2 text-xs font-semibold">Generate again</button>
          <button type="button" onClick={() => { void navigator.clipboard?.writeText(password).then(() => setCopied(true)); }} className="flex-1 rounded-lg bg-primary py-2 text-xs font-bold text-primary-foreground">{copied ? "Copied" : "Copy"}</button>
        </div>
      </div>
    </WindowFrame>
  );
}

function RecorderApp({ close }: { close: () => void }) {
  const [mode, setMode] = useState<"audio" | "screen">("audio");
  const [recording, setRecording] = useState(false);
  const [clips, setClips] = useState<{ url: string; kind: "audio" | "screen"; name: string }[]>([]);
  const [error, setError] = useState("");
  const recorder = useRef<MediaRecorder | null>(null);
  const stream = useRef<MediaStream | null>(null);
  useEffect(() => () => { stream.current?.getTracks().forEach((track) => track.stop()); }, []);
  const start = async () => {
    setError("");
    try {
      const media = mode === "audio" ? await navigator.mediaDevices.getUserMedia({ audio: true }) : await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true });
      stream.current = media;
      const chunks: Blob[] = [];
      const rec = new MediaRecorder(media);
      rec.ondataavailable = (event) => chunks.push(event.data);
      rec.onstop = () => {
        media.getTracks().forEach((track) => track.stop());
        const blob = new Blob(chunks, { type: rec.mimeType || (mode === "audio" ? "audio/webm" : "video/webm") });
        setClips((list) => [{ url: URL.createObjectURL(blob), kind: mode, name: `${mode}-${list.length + 1}.webm` }, ...list]);
        setRecording(false);
      };
      media.getTracks()[0]?.addEventListener("ended", () => rec.state !== "inactive" && rec.stop());
      rec.start();
      recorder.current = rec;
      setRecording(true);
    } catch {
      setError(mode === "audio" ? "Microphone access was blocked or no microphone was found." : "Screen recording was cancelled or isn't supported here.");
    }
  };
  return (
    <WindowFrame title="Recorder" icon={RecorderIcon} close={close}>
      <div className="flex shrink-0 flex-wrap items-center gap-2 border-b border-border p-2">
        {(["audio", "screen"] as const).map((key) => <button key={key} type="button" disabled={recording} onClick={() => setMode(key)} className={`rounded-lg px-3 py-1.5 text-xs font-semibold capitalize ${mode === key ? "bg-primary text-primary-foreground" : "bg-white/10"}`}>{key === "audio" ? "Voice" : "Screen"}</button>)}
        <button type="button" onClick={() => (recording ? recorder.current?.stop() : void start())} className={`ml-auto rounded-lg px-4 py-1.5 text-xs font-bold ${recording ? "bg-red-600 text-white" : "bg-white/10"}`}>{recording ? "● Stop" : "● Record"}</button>
      </div>
      <div className="flex-1 space-y-3 overflow-auto p-3">
        {error && <p className="text-xs text-red-300">{error}</p>}
        {clips.length === 0 && !error && <p className="p-6 text-center text-sm text-muted-foreground">Recordings stay on this device until you download them.</p>}
        {clips.map((clip) => (
          <div key={clip.url} className="rounded-2xl border border-white/10 bg-black/20 p-3">
            {clip.kind === "audio" ? <audio src={clip.url} controls className="w-full" /> : <video src={clip.url} controls className="max-h-56 w-full rounded-lg" />}
            <a href={clip.url} download={clip.name} className="mt-2 inline-block text-xs font-semibold text-primary">Download {clip.name}</a>
          </div>
        ))}
      </div>
    </WindowFrame>
  );
}

// ---------- Office-style apps (Writer, Slides, Sheets, PDF Reader) ----------
const LIBS = {
  xlsx: "https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js",
  mammoth: "https://cdn.jsdelivr.net/npm/mammoth@1.8.0/mammoth.browser.min.js",
  pptx: "https://cdn.jsdelivr.net/npm/pptxgenjs@3.12.0/dist/pptxgen.bundle.js",
  jszip: "https://cdn.jsdelivr.net/npm/jszip@3.10.1/dist/jszip.min.js",
  pdf: "https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.min.js",
  pdfWorker: "https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.worker.min.js",
};
const scriptCache = new Map<string, Promise<void>>();
function loadLibScript(src: string) {
  let task = scriptCache.get(src);
  if (!task) {
    task = new Promise<void>((resolve, reject) => {
      const el = document.createElement("script");
      el.src = src;
      el.async = true;
      el.onload = () => resolve();
      el.onerror = () => {
        scriptCache.delete(src);
        reject(new Error("Couldn't load a file-format helper. Check your connection."));
      };
      document.head.appendChild(el);
    });
    scriptCache.set(src, task);
  }
  return task;
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const lib = (name: string): any => (window as unknown as Record<string, any>)[name];

function appForFile(path: string) {
  const ext = path.split(".").pop()?.toLowerCase() ?? "";
  const map: Record<string, string> = { doc: "writer", docx: "writer", html: "writer", htm: "writer", xlsx: "sheets", xls: "sheets", csv: "sheets", pptx: "slides", pdf: "pdfreader" };
  return map[ext] ?? "notes";
}

function openPathInApp(path: string, openApp: (id: string) => void) {
  const target = appForFile(path);
  try {
    localStorage.setItem(target === "notes" ? "pos-note-path" : "pos-open", path);
  } catch {
    // storage unavailable
  }
  window.dispatchEvent(new Event(target === "notes" ? "pos-note" : "pos-open"));
  openApp(target);
}

function blobToDataUrl(blob: Blob) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
}

async function saveToFiles(name: string, blob: Blob) {
  const url = await blobToDataUrl(blob);
  const fs = { ...readFs() };
  if (!("/Documents" in fs)) fs["/Documents"] = null;
  fs[`/Documents/${name}`] = url;
  const ok = writeFs(fs);
  if (!ok) window.alert("Browser storage is full, so this file couldn't be saved. Use Download instead.");
  return ok;
}

function downloadBlob(name: string, blob: Blob) {
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = name;
  link.click();
  window.setTimeout(() => URL.revokeObjectURL(link.href), 1500);
}

// Lets Files / search open a document straight into the right app.
function useOpenFromFiles(appId: string, onLoad: (name: string, data: ArrayBuffer) => void) {
  const callback = useRef(onLoad);
  callback.current = onLoad;
  useEffect(() => {
    const pull = async () => {
      let path: string | null = null;
      try {
        path = localStorage.getItem("pos-open");
      } catch {
        // storage unavailable
      }
      if (!path || appForFile(path) !== appId) return;
      try {
        localStorage.removeItem("pos-open");
      } catch {
        // storage unavailable
      }
      const value = readFs()[path];
      if (typeof value !== "string") return;
      const data = value.startsWith("data:") ? await (await fetch(value)).arrayBuffer() : (new TextEncoder().encode(value).buffer as ArrayBuffer);
      callback.current(path.slice(path.lastIndexOf("/") + 1), data);
    };
    void pull();
    window.addEventListener("pos-open", pull);
    return () => window.removeEventListener("pos-open", pull);
  }, [appId]);
}

function WriterIcon({ className }: { className?: string }) { return <AppImage tone="from-blue-500 to-blue-800" src="word" className={className} />; }
function SlidesIcon({ className }: { className?: string }) { return <AppImage tone="from-orange-400 to-red-600" src="powerpoint" className={className} />; }
function SheetsIcon({ className }: { className?: string }) { return <AppImage tone="from-green-500 to-emerald-800" src="excel" className={className} />; }
function PdfIcon({ className }: { className?: string }) { return <AppImage tone="from-red-500 to-red-800" src="pdf" className={className} />; }

const tbBtn = "rounded-lg bg-white/10 px-2.5 py-1.5 text-[11px] font-semibold hover:bg-white/20";
const tbPrimary = "rounded-lg bg-primary px-3 py-1.5 text-[11px] font-bold text-primary-foreground";

function WriterApp({ close }: { close: () => void }) {
  const page = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const [name, setName] = useState("Untitled");
  const [words, setWords] = useState(0);
  const [msg, setMsg] = useState("");
  const count = () => setWords(page.current?.innerText.trim().split(/\s+/).filter(Boolean).length ?? 0);
  const cmd = (command: string, value?: string) => {
    page.current?.focus();
    document.execCommand(command, false, value);
    count();
  };
  const loadBuffer = async (fileName: string, buffer: ArrayBuffer) => {
    try {
      let html: string;
      if (/\.docx$/i.test(fileName)) {
        await loadLibScript(LIBS.mammoth);
        html = (await lib("mammoth").convertToHtml({ arrayBuffer: buffer })).value as string;
      } else {
        const text = new TextDecoder().decode(buffer);
        html = /\.html?$|\.doc$/i.test(fileName) ? (/<body[^>]*>([\s\S]*)<\/body>/i.exec(text)?.[1] ?? text) : `<p>${text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/\n/g, "</p><p>")}</p>`;
      }
      if (page.current) page.current.innerHTML = html || "<p><br></p>";
      setName(fileName.replace(/\.[^.]+$/, ""));
      setMsg(`Opened ${fileName}`);
      count();
    } catch (error) {
      setMsg(error instanceof Error ? error.message : "Couldn't open that file.");
    }
  };
  useOpenFromFiles("writer", loadBuffer);
  const html = () => page.current?.innerHTML ?? "";
  const docBlob = () => new Blob([`<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word"><head><meta charset="utf-8"><title>${name}</title></head><body style="font-family:Calibri,Arial,sans-serif">${html()}</body></html>`], { type: "application/msword" });
  const print = () => {
    const win = window.open("", "_blank");
    if (!win) return setMsg("Allow pop-ups to save as PDF.");
    win.document.write(`<title>${name}</title><body style="font-family:Calibri,Arial,sans-serif;max-width:800px;margin:40px auto;line-height:1.5">${html()}</body>`);
    win.document.close();
    win.focus();
    win.print();
  };
  const keep = (event: React.MouseEvent) => event.preventDefault();
  return (
    <WindowFrame title={`Private Word – ${name}`} icon={WriterIcon} close={close}>
      <div className="flex shrink-0 flex-wrap items-center gap-1.5 border-b border-border p-2">
        <button type="button" className={tbBtn} onClick={() => input.current?.click()}>Open</button>
        <button type="button" className={tbBtn} onClick={() => void saveToFiles(`${name}.doc`, docBlob()).then((ok) => ok && setMsg(`Saved ${name}.doc to Documents`))}>Save</button>
        <button type="button" className={tbBtn} onClick={() => downloadBlob(`${name}.doc`, docBlob())}>Download .doc</button>
        <button type="button" className={tbBtn} onClick={print}>PDF</button>
        <input ref={input} type="file" accept=".docx,.doc,.html,.htm,.txt" hidden onChange={(event) => { const file = event.target.files?.[0]; if (file) void file.arrayBuffer().then((buffer) => loadBuffer(file.name, buffer)); event.target.value = ""; }} />
        <span className="mx-1 h-5 w-px bg-white/15" />
        <button type="button" className={`${tbBtn} font-black`} onMouseDown={keep} onClick={() => cmd("bold")}>B</button>
        <button type="button" className={`${tbBtn} italic`} onMouseDown={keep} onClick={() => cmd("italic")}>I</button>
        <button type="button" className={`${tbBtn} underline`} onMouseDown={keep} onClick={() => cmd("underline")}>U</button>
        <select aria-label="Style" defaultValue="p" onChange={(event) => cmd("formatBlock", event.target.value)} className="rounded-lg bg-white/10 px-2 py-1.5 text-[11px]"><option value="p">Normal</option><option value="h1">Heading 1</option><option value="h2">Heading 2</option></select>
        <button type="button" className={tbBtn} onMouseDown={keep} onClick={() => cmd("insertUnorderedList")}>• List</button>
        <button type="button" className={tbBtn} onMouseDown={keep} onClick={() => cmd("insertOrderedList")}>1. List</button>
        <button type="button" className={tbBtn} onMouseDown={keep} onClick={() => cmd("justifyLeft")}>Left</button>
        <button type="button" className={tbBtn} onMouseDown={keep} onClick={() => cmd("justifyCenter")}>Center</button>
        <button type="button" className={tbBtn} onMouseDown={keep} onClick={() => cmd("justifyRight")}>Right</button>
        <input type="color" aria-label="Text colour" defaultValue="#111111" onChange={(event) => cmd("foreColor", event.target.value)} className="h-7 w-9 rounded bg-transparent" />
        <button type="button" className={tbBtn} onMouseDown={keep} onClick={() => cmd("undo")}>Undo</button>
        <button type="button" className={tbBtn} onMouseDown={keep} onClick={() => cmd("redo")}>Redo</button>
      </div>
      <div className="min-h-0 flex-1 overflow-auto bg-black/30 p-4">
        <div ref={page} contentEditable suppressContentEditableWarning spellCheck onInput={count} dangerouslySetInnerHTML={{ __html: "<p><br></p>" }} className="doc-page mx-auto min-h-[60vh] w-full max-w-3xl rounded-sm bg-white p-10 text-zinc-900 shadow-2xl outline-none" style={{ fontFamily: "Calibri, Arial, sans-serif" }} />
      </div>
      <p className="flex h-6 shrink-0 items-center justify-between px-3 text-[11px] text-muted-foreground"><span>{msg}</span><span>{words} words</span></p>
    </WindowFrame>
  );
}

type SlideData = { title: string; body: string; bg: string };
const SLIDE_BGS = ["#1e293b", "#0f766e", "#7c2d12", "#4c1d95", "#9f1239", "#ffffff"];

function SlideView({ slide, className = "" }: { slide: SlideData; className?: string }) {
  const light = readableOn(slide.bg) === "#ffffff";
  return (
    <div className={`flex aspect-video w-full flex-col overflow-hidden rounded-lg p-[6%] ${className}`} style={{ background: slide.bg, color: light ? "#fff" : "#111" }}>
      <p className="font-bold leading-tight" style={{ fontSize: "clamp(.7rem, 3.4cqw, 2.2rem)" }}>{slide.title || "Title"}</p>
      <ul className="mt-[4%] space-y-[2%] pl-[4%]" style={{ fontSize: "clamp(.5rem, 2.2cqw, 1.4rem)", listStyle: "disc" }}>
        {slide.body.split("\n").filter(Boolean).map((line, index) => <li key={index}>{line}</li>)}
      </ul>
    </div>
  );
}

function SlidesApp({ close }: { close: () => void }) {
  const [slides, setSlides] = useState<SlideData[]>([{ title: "My presentation", body: "Click to edit the text\nAdd slides on the left", bg: SLIDE_BGS[0]! }]);
  const [index, setIndex] = useState(0);
  const [name, setName] = useState("Presentation");
  const [present, setPresent] = useState(false);
  const [msg, setMsg] = useState("");
  const input = useRef<HTMLInputElement>(null);
  const slide = slides[Math.min(index, slides.length - 1)]!;
  const update = (patch: Partial<SlideData>) => setSlides((list) => list.map((item, i) => (i === index ? { ...item, ...patch } : item)));
  const move = (delta: number) => {
    const target = index + delta;
    if (target < 0 || target >= slides.length) return;
    setSlides((list) => {
      const next = [...list];
      [next[index], next[target]] = [next[target]!, next[index]!];
      return next;
    });
    setIndex(target);
  };
  const importPptx = async (fileName: string, buffer: ArrayBuffer) => {
    try {
      await loadLibScript(LIBS.jszip);
      const zip = await lib("JSZip").loadAsync(buffer);
      const files = Object.keys(zip.files).filter((file) => /^ppt\/slides\/slide\d+\.xml$/.test(file)).sort((a, b) => parseInt(a.replace(/\D/g, ""), 10) - parseInt(b.replace(/\D/g, ""), 10));
      const decode = (text: string) => text.replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&apos;/g, "'").replace(/&amp;/g, "&");
      const loaded: SlideData[] = [];
      for (const file of files) {
        const xml = (await zip.file(file).async("string")) as string;
        const paragraphs = xml.split("</a:p>").map((chunk) => decode([...chunk.matchAll(/<a:t>([^<]*)<\/a:t>/g)].map((m) => m[1]).join(""))).filter((text) => text.trim());
        loaded.push({ title: paragraphs[0] ?? "", body: paragraphs.slice(1).join("\n"), bg: SLIDE_BGS[loaded.length % 5]! });
      }
      if (!loaded.length) throw new Error("No slides found in that file.");
      setSlides(loaded);
      setIndex(0);
      setName(fileName.replace(/\.[^.]+$/, ""));
      setMsg(`Opened ${fileName} (text only, layouts and pictures aren't imported)`);
    } catch (error) {
      setMsg(error instanceof Error ? error.message : "Couldn't open that file.");
    }
  };
  useOpenFromFiles("slides", importPptx);
  const build = async () => {
    await loadLibScript(LIBS.pptx);
    const pptx = new (lib("PptxGenJS"))();
    slides.forEach((item) => {
      const s = pptx.addSlide();
      s.background = { color: item.bg.slice(1) };
      const color = readableOn(item.bg) === "#ffffff" ? "FFFFFF" : "111111";
      s.addText(item.title, { x: 0.6, y: 0.4, w: 8.8, h: 1, fontSize: 32, bold: true, color });
      const lines = item.body.split("\n").filter(Boolean);
      if (lines.length) s.addText(lines.map((text) => ({ text, options: { bullet: true, breakLine: true } })), { x: 0.8, y: 1.6, w: 8.4, h: 3.6, fontSize: 20, color, valign: "top" });
    });
    return (await pptx.write({ outputType: "blob" })) as Blob;
  };
  useEffect(() => {
    if (!present) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "ArrowRight" || event.key === " " || event.key === "Enter") setIndex((value) => Math.min(value + 1, slides.length - 1));
      else if (event.key === "ArrowLeft") setIndex((value) => Math.max(value - 1, 0));
      else if (event.key === "Escape") setPresent(false);
      else return;
      event.stopPropagation();
    };
    window.addEventListener("keydown", onKey, true);
    return () => window.removeEventListener("keydown", onKey, true);
  }, [present, slides.length]);
  return (
    <WindowFrame title={`Private PowerPoint – ${name}`} icon={SlidesIcon} close={close}>
      <div className="flex shrink-0 flex-wrap items-center gap-1.5 border-b border-border p-2">
        <button type="button" className={tbBtn} onClick={() => input.current?.click()}>Open</button>
        <button type="button" className={tbBtn} onClick={() => void build().then((blob) => saveToFiles(`${name}.pptx`, blob)).then((ok) => ok && setMsg(`Saved ${name}.pptx to Documents`)).catch((error: Error) => setMsg(error.message))}>Save</button>
        <button type="button" className={tbBtn} onClick={() => void build().then((blob) => downloadBlob(`${name}.pptx`, blob)).catch((error: Error) => setMsg(error.message))}>Download .pptx</button>
        <input ref={input} type="file" accept=".pptx" hidden onChange={(event) => { const file = event.target.files?.[0]; if (file) void file.arrayBuffer().then((buffer) => importPptx(file.name, buffer)); event.target.value = ""; }} />
        <span className="mx-1 h-5 w-px bg-white/15" />
        <button type="button" className={tbBtn} onClick={() => { setSlides((list) => [...list, { title: "New slide", body: "", bg: slide.bg }]); setIndex(slides.length); }}>+ Slide</button>
        <button type="button" className={tbBtn} onClick={() => { setSlides((list) => [...list.slice(0, index + 1), { ...slide }, ...list.slice(index + 1)]); setIndex(index + 1); }}>Duplicate</button>
        <button type="button" className={tbBtn} disabled={slides.length < 2} onClick={() => { setSlides((list) => list.filter((_, i) => i !== index)); setIndex(Math.max(0, index - 1)); }}>Delete</button>
        <button type="button" className={tbBtn} onClick={() => move(-1)}>↑</button>
        <button type="button" className={tbBtn} onClick={() => move(1)}>↓</button>
        <button type="button" className={`${tbPrimary} ml-auto`} onClick={() => setPresent(true)}>▶ Present</button>
      </div>
      <div className="flex min-h-0 flex-1 flex-col md:flex-row">
        <div className="stagger flex shrink-0 gap-2 overflow-auto border-b border-border p-2 md:w-44 md:flex-col md:border-b-0 md:border-r">
          {slides.map((item, i) => (
            <button key={i} type="button" onClick={() => setIndex(i)} className={`w-32 shrink-0 rounded-lg border-2 p-0.5 md:w-full ${i === index ? "border-primary" : "border-transparent"}`} style={{ containerType: "inline-size" }}>
              <SlideView slide={item} />
              <span className="block text-[10px] text-muted-foreground">{i + 1}</span>
            </button>
          ))}
        </div>
        <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-auto p-4">
          <div className="mx-auto w-full max-w-3xl" style={{ containerType: "inline-size" }}><SlideView slide={slide} className="shadow-2xl" /></div>
          <div className="mx-auto w-full max-w-3xl space-y-2">
            <input aria-label="Slide title" value={slide.title} onChange={(event) => update({ title: event.target.value })} placeholder="Slide title" className="w-full rounded-lg bg-white/10 px-3 py-2 text-sm font-semibold outline-none" />
            <textarea aria-label="Slide text" value={slide.body} onChange={(event) => update({ body: event.target.value })} placeholder="One bullet per line" rows={4} className="w-full rounded-lg bg-white/10 px-3 py-2 text-sm outline-none" />
            <div className="flex items-center gap-2">{SLIDE_BGS.map((color) => <button key={color} type="button" aria-label={`Background ${color}`} onClick={() => update({ bg: color })} className={`size-6 rounded-full border-2 ${slide.bg === color ? "border-primary" : "border-white/20"}`} style={{ background: color }} />)}<input aria-label="Presentation name" value={name} onChange={(event) => setName(event.target.value)} className="ml-auto w-40 rounded-lg bg-white/10 px-2 py-1 text-xs outline-none" /></div>
            <p className="text-[11px] text-muted-foreground">{msg}</p>
          </div>
        </div>
      </div>
      {present && (
        <div onClick={() => setIndex((value) => Math.min(value + 1, slides.length - 1))} className="fixed inset-0 z-[90] flex cursor-pointer items-center justify-center bg-black p-4">
          <div key={index} className="w-full max-w-[min(100%,calc((100dvh-2rem)*16/9))] [animation:rise_.4s_cubic-bezier(.22,1,.36,1)_both]" style={{ containerType: "inline-size" }}><SlideView slide={slide} /></div>
          <button type="button" aria-label="Exit presentation" onClick={(event) => { event.stopPropagation(); setPresent(false); }} className="absolute right-4 top-4 rounded-full bg-white/15 p-2 text-white"><X className="size-4" /></button>
          <p className="absolute bottom-3 text-[11px] text-white/50">{index + 1} / {slides.length} · arrows or click to move · Esc to exit</p>
        </div>
      )}
    </WindowFrame>
  );
}

function colName(index: number) {
  let n = index + 1;
  let out = "";
  while (n > 0) {
    out = String.fromCharCode(65 + ((n - 1) % 26)) + out;
    n = Math.floor((n - 1) / 26);
  }
  return out;
}
function colIndex(name: string) {
  return [...name].reduce((total, ch) => total * 26 + ch.charCodeAt(0) - 64, 0) - 1;
}

function cellValue(data: string[][], r: number, c: number, depth = 0): string {
  const raw = data[r]?.[c] ?? "";
  if (!raw.startsWith("=")) return raw;
  if (depth > 20) return "#CYCLE";
  let expr = raw.slice(1).toUpperCase();
  const toRC = (ref: string) => {
    const m = /^([A-Z]+)(\d+)$/.exec(ref)!;
    return { c: colIndex(m[1]!), r: parseInt(m[2]!, 10) - 1 };
  };
  expr = expr.replace(/(SUM|AVERAGE|MIN|MAX|COUNT)\(([A-Z]+\d+):([A-Z]+\d+)\)/g, (_match, fn: string, a: string, b: string) => {
    const A = toRC(a);
    const B = toRC(b);
    const nums: number[] = [];
    for (let rr = Math.min(A.r, B.r); rr <= Math.max(A.r, B.r); rr += 1) {
      for (let cc = Math.min(A.c, B.c); cc <= Math.max(A.c, B.c); cc += 1) {
        const v = parseFloat(cellValue(data, rr, cc, depth + 1));
        if (Number.isFinite(v)) nums.push(v);
      }
    }
    if (fn === "COUNT") return String(nums.length);
    if (!nums.length) return "0";
    const sum = nums.reduce((x, y) => x + y, 0);
    return String(fn === "SUM" ? sum : fn === "AVERAGE" ? sum / nums.length : fn === "MIN" ? Math.min(...nums) : Math.max(...nums));
  });
  expr = expr.replace(/\b([A-Z]{1,2})(\d+)\b/g, (_match, col: string, row: string) => {
    const v = parseFloat(cellValue(data, parseInt(row, 10) - 1, colIndex(col), depth + 1));
    return Number.isFinite(v) ? String(v) : "0";
  });
  if (!/^[\d\s+\-*/().]+$/.test(expr)) return "#ERR";
  try {
    const value = Function(`"use strict";return (${expr})`)() as number;
    return Number.isFinite(value) ? String(+value.toFixed(8)) : "#ERR";
  } catch {
    return "#ERR";
  }
}

function SheetsApp({ close }: { close: () => void }) {
  const make = (rows: number, cols: number) => Array.from({ length: rows }, () => Array.from({ length: cols }, () => ""));
  const [data, setData] = useState<string[][]>(() => make(30, 10));
  const [sel, setSel] = useState<{ r: number; c: number }>({ r: 0, c: 0 });
  const [editing, setEditing] = useState<string | null>(null);
  const [name, setName] = useState("Spreadsheet");
  const [msg, setMsg] = useState("");
  const input = useRef<HTMLInputElement>(null);
  const cols = data[0]?.length ?? 10;
  const setCell = (r: number, c: number, value: string) => setData((grid) => grid.map((row, ri) => (ri === r ? row.map((cell, ci) => (ci === c ? value : cell)) : row)));
  const importBuffer = async (fileName: string, buffer: ArrayBuffer) => {
    try {
      await loadLibScript(LIBS.xlsx);
      const XLSX = lib("XLSX");
      const wb = XLSX.read(buffer, { type: "array" });
      const ws = wb.Sheets[wb.SheetNames[0]];
      const range = XLSX.utils.decode_range(ws["!ref"] ?? "A1:A1");
      const grid = make(Math.max(30, range.e.r + 1), Math.max(10, range.e.c + 1));
      for (let r = range.s.r; r <= range.e.r; r += 1) {
        for (let c = range.s.c; c <= range.e.c; c += 1) {
          const cell = ws[XLSX.utils.encode_cell({ r, c })];
          if (cell) grid[r]![c] = cell.f ? `=${cell.f}` : String(cell.w ?? cell.v ?? "");
        }
      }
      setData(grid);
      setName(fileName.replace(/\.[^.]+$/, ""));
      setMsg(`Opened ${fileName}`);
    } catch (error) {
      setMsg(error instanceof Error ? error.message : "Couldn't open that file.");
    }
  };
  useOpenFromFiles("sheets", importBuffer);
  const workbook = async () => {
    await loadLibScript(LIBS.xlsx);
    const XLSX = lib("XLSX");
    const values = data.map((row, r) => row.map((_cell, c) => (data[r]![c]!.startsWith("=") ? "" : data[r]![c]!)));
    const ws = XLSX.utils.aoa_to_sheet(values);
    data.forEach((row, r) => row.forEach((raw, c) => { if (raw.startsWith("=")) ws[XLSX.utils.encode_cell({ r, c })] = { t: "n", f: raw.slice(1), v: Number(cellValue(data, r, c)) || 0 }; }));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
    return { XLSX, wb, ws };
  };
  const xlsxBlob = async () => {
    const { XLSX, wb } = await workbook();
    return new Blob([XLSX.write(wb, { bookType: "xlsx", type: "array" })], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
  };
  const csvBlob = async () => {
    const { XLSX, ws } = await workbook();
    return new Blob([XLSX.utils.sheet_to_csv(ws)], { type: "text/csv" });
  };
  const raw = data[sel.r]?.[sel.c] ?? "";
  return (
    <WindowFrame title={`Private Excel – ${name}`} icon={SheetsIcon} close={close}>
      <div className="flex shrink-0 flex-wrap items-center gap-1.5 border-b border-border p-2">
        <button type="button" className={tbBtn} onClick={() => input.current?.click()}>Open</button>
        <button type="button" className={tbBtn} onClick={() => void xlsxBlob().then((blob) => saveToFiles(`${name}.xlsx`, blob)).then((ok) => ok && setMsg(`Saved ${name}.xlsx to Documents`)).catch((error: Error) => setMsg(error.message))}>Save</button>
        <button type="button" className={tbBtn} onClick={() => void xlsxBlob().then((blob) => downloadBlob(`${name}.xlsx`, blob)).catch((error: Error) => setMsg(error.message))}>Download .xlsx</button>
        <button type="button" className={tbBtn} onClick={() => void csvBlob().then((blob) => downloadBlob(`${name}.csv`, blob)).catch((error: Error) => setMsg(error.message))}>.csv</button>
        <input ref={input} type="file" accept=".xlsx,.xls,.csv" hidden onChange={(event) => { const file = event.target.files?.[0]; if (file) void file.arrayBuffer().then((buffer) => importBuffer(file.name, buffer)); event.target.value = ""; }} />
        <span className="mx-1 h-5 w-px bg-white/15" />
        <button type="button" className={tbBtn} onClick={() => setData((grid) => [...grid, ...make(10, cols)])}>+ 10 rows</button>
        <button type="button" className={tbBtn} onClick={() => setData((grid) => grid.map((row) => [...row, ""]))}>+ Column</button>
        <button type="button" className={tbBtn} onClick={() => setData(make(30, 10))}>Clear</button>
        <input aria-label="File name" value={name} onChange={(event) => setName(event.target.value)} className="ml-auto w-36 rounded-lg bg-white/10 px-2 py-1 text-xs outline-none" />
      </div>
      <div className="flex shrink-0 items-center gap-2 border-b border-border px-2 py-1 text-xs">
        <span className="w-12 rounded bg-white/10 px-2 py-1 text-center font-semibold">{colName(sel.c)}{sel.r + 1}</span>
        <span className="text-muted-foreground">fx</span>
        <input aria-label="Formula bar" value={raw} onChange={(event) => setCell(sel.r, sel.c, event.target.value)} placeholder="Type a value or =SUM(A1:A5)" className="min-w-0 flex-1 rounded bg-white/10 px-2 py-1 outline-none" />
      </div>
      <div className="min-h-0 flex-1 overflow-auto">
        <table className="border-separate border-spacing-0 text-xs">
          <thead className="sticky top-0 z-10"><tr><th className="sticky left-0 z-20 w-10 bg-zinc-800" />{Array.from({ length: cols }, (_, c) => <th key={c} className="min-w-24 border-b border-r border-white/10 bg-zinc-800 py-1 font-semibold text-muted-foreground">{colName(c)}</th>)}</tr></thead>
          <tbody>
            {data.map((row, r) => (
              <tr key={r}>
                <th className="sticky left-0 z-10 border-b border-r border-white/10 bg-zinc-800 px-2 text-muted-foreground">{r + 1}</th>
                {row.map((cell, c) => {
                  const key = `${r}-${c}`;
                  return (
                    <td key={c} className={`border-b border-r border-white/10 p-0 ${sel.r === r && sel.c === c ? "outline outline-2 -outline-offset-2 outline-primary" : ""}`}>
                      <input
                        id={`cell-${r}-${c}`}
                        aria-label={`${colName(c)}${r + 1}`}
                        value={editing === key ? cell : cellValue(data, r, c)}
                        onFocus={() => { setSel({ r, c }); setEditing(key); }}
                        onBlur={() => setEditing(null)}
                        onChange={(event) => setCell(r, c, event.target.value)}
                        onKeyDown={(event) => { if (event.key === "Enter") document.getElementById(`cell-${Math.min(r + 1, data.length - 1)}-${c}`)?.focus(); }}
                        className="h-7 w-24 bg-transparent px-1.5 outline-none"
                      />
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="h-6 shrink-0 px-3 text-[11px] leading-6 text-muted-foreground">{msg || "Formulas: =A1+B1, =SUM(A1:A5), AVERAGE, MIN, MAX, COUNT"}</p>
    </WindowFrame>
  );
}

function PdfApp({ close }: { close: () => void }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const bytes = useRef<ArrayBuffer | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [doc, setDoc] = useState<any>(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [scale, setScale] = useState(1.2);
  const [name, setName] = useState("No file");
  const [msg, setMsg] = useState("Open a PDF to read it.");
  const load = async (fileName: string, buffer: ArrayBuffer) => {
    try {
      setMsg("Opening…");
      await loadLibScript(LIBS.pdf);
      const pdfjs = lib("pdfjsLib");
      pdfjs.GlobalWorkerOptions.workerSrc = LIBS.pdfWorker;
      const pdf = await pdfjs.getDocument({ data: buffer.slice(0) }).promise;
      bytes.current = buffer;
      setDoc(pdf);
      setTotal(pdf.numPages);
      setPage(1);
      setName(fileName);
      setMsg("");
    } catch (error) {
      setMsg(error instanceof Error ? error.message : "Couldn't open that PDF.");
    }
  };
  useOpenFromFiles("pdfreader", load);
  useEffect(() => {
    if (!doc) return;
    let cancelled = false;
    void (async () => {
      const p = await doc.getPage(page);
      const viewport = p.getViewport({ scale });
      const el = canvas.current;
      if (!el || cancelled) return;
      el.width = viewport.width;
      el.height = viewport.height;
      await p.render({ canvasContext: el.getContext("2d"), viewport }).promise;
    })();
    return () => { cancelled = true; };
  }, [doc, page, scale]);
  const pdfBlob = () => new Blob([bytes.current ?? new ArrayBuffer(0)], { type: "application/pdf" });
  return (
    <WindowFrame title={`PDF Reader – ${name}`} icon={PdfIcon} close={close}>
      <div className="flex shrink-0 flex-wrap items-center gap-1.5 border-b border-border p-2">
        <button type="button" className={tbBtn} onClick={() => input.current?.click()}>Open</button>
        <input ref={input} type="file" accept="application/pdf,.pdf" hidden onChange={(event) => { const file = event.target.files?.[0]; if (file) void file.arrayBuffer().then((buffer) => load(file.name, buffer)); event.target.value = ""; }} />
        <button type="button" className={tbBtn} disabled={!doc} onClick={() => void saveToFiles(name, pdfBlob()).then((ok) => ok && setMsg(`Saved ${name} to Documents`))}>Save</button>
        <button type="button" className={tbBtn} disabled={!doc} onClick={() => downloadBlob(name, pdfBlob())}>Download</button>
        <span className="mx-1 h-5 w-px bg-white/15" />
        <button type="button" className={tbBtn} disabled={page <= 1} onClick={() => setPage((value) => value - 1)}>‹</button>
        <span className="text-xs tabular-nums">{doc ? `${page} / ${total}` : "–"}</span>
        <button type="button" className={tbBtn} disabled={page >= total} onClick={() => setPage((value) => value + 1)}>›</button>
        <button type="button" className={tbBtn} onClick={() => setScale((value) => Math.max(0.5, +(value - 0.2).toFixed(1)))}>−</button>
        <span className="text-xs tabular-nums">{Math.round(scale * 100)}%</span>
        <button type="button" className={tbBtn} onClick={() => setScale((value) => Math.min(3, +(value + 0.2).toFixed(1)))}>+</button>
      </div>
      <div className="min-h-0 flex-1 overflow-auto bg-black/30 p-4">
        {!doc && <p className="p-10 text-center text-sm text-muted-foreground">{msg}</p>}
        <canvas ref={canvas} className={`mx-auto max-w-none rounded-sm bg-white shadow-2xl ${doc ? "" : "hidden"}`} />
      </div>
    </WindowFrame>
  );
}

const ZONES: string[] = (() => {
  try {
    const supported = (Intl as unknown as { supportedValuesOf?: (key: string) => string[] }).supportedValuesOf?.("timeZone");
    if (supported?.length) return supported;
  } catch {
    // fall through
  }
  return ["UTC", "America/New_York", "America/Chicago", "America/Denver", "America/Los_Angeles", "America/Sao_Paulo", "Europe/London", "Europe/Paris", "Europe/Berlin", "Africa/Casablanca", "Africa/Cairo", "Asia/Dubai", "Asia/Kolkata", "Asia/Shanghai", "Asia/Tokyo", "Australia/Sydney", "Pacific/Auckland"];
})();

function LiveTime({ zone, hour12 }: { zone?: string | undefined; hour12: boolean }) {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    setNow(new Date());
    const timer = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(timer);
  }, []);
  if (!now) return <span className="font-mono text-sm tabular-nums">--:--:--</span>;
  let text: string;
  try {
    text = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12, timeZone: zone });
  } catch {
    text = now.toLocaleTimeString();
  }
  return <span className="font-mono text-sm tabular-nums">{text}</span>;
}

// Mini picture of an interface, used for theme cards and the interface style picker.
function ThemePreview({ accent, badge }: { accent: string; badge?: string | undefined }) {
  return (
    <div aria-hidden className="relative flex h-[5.2rem] gap-1.5 overflow-hidden rounded-xl border border-white/[.07] bg-[#0b0c11] p-1.5">
      <div className="flex w-5 shrink-0 flex-col gap-1">{[0, 1, 2, 3].map((i) => <span key={i} className="h-1.5 rounded-sm" style={{ background: i === 1 ? accent : "rgb(255 255 255 / .12)" }} />)}</div>
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <span className="h-1.5 w-1/2 rounded-sm bg-white/25" />
        {[0, 1, 2].map((i) => (
          <div key={i} className="flex items-center gap-1 rounded-[4px] bg-white/[.05] px-1 py-[3px]"><span className="h-1 flex-1 rounded-sm bg-white/15" /><span className="h-1.5 w-3 rounded-full" style={{ background: i === 1 ? accent : "rgb(255 255 255 / .18)" }} /></div>
        ))}
      </div>
      {badge && <span className="absolute right-1.5 top-1.5 rounded bg-black/50 px-1 text-[7px] font-semibold tracking-wider text-white/70">{badge}</span>}
    </div>
  );
}

function DesktopPreview({ kind }: { kind: "private" | "clay" }) {
  return kind === "clay" ? (
    <div aria-hidden className="clay-wall relative h-16 overflow-hidden rounded-xl border border-white/10">
      <span className="clay-blob clay-blob-a" /><span className="clay-blob clay-blob-b" />
      <span className="absolute left-2 top-2 h-7 w-12 rounded-lg border border-[#d97757]/30 bg-[#1d1a17]/80" />
      <div className="absolute inset-x-0 bottom-0 flex h-2.5 items-center justify-center gap-0.5 bg-[#1d1a17]/85">{[0, 1, 2, 3, 4].map((i) => <span key={i} className={`size-1.5 rounded-sm ${i === 2 ? "bg-[#d97757]" : "bg-white/40"}`} />)}</div>
    </div>
  ) : (
    <div aria-hidden className="relative h-16 overflow-hidden rounded-xl border border-white/10 bg-gradient-to-br from-[#2a2416] to-[#0b0c12]">
      <div className="absolute right-1.5 top-1.5 flex flex-col gap-1">{[0, 1].map((i) => <span key={i} className="h-3 w-6 rounded bg-white/15" />)}</div>
      <div className="absolute bottom-1 left-1/2 flex -translate-x-1/2 gap-0.5 rounded-md bg-black/40 p-0.5">{[0, 1, 2, 3, 4].map((i) => <span key={i} className="size-1.5 rounded-sm bg-white/40" />)}</div>
    </div>
  );
}

function StylePreview({ kind }: { kind: "classic" | "modern" }) {
  return kind === "classic" ? (
    <div aria-hidden className="flex h-16 gap-1.5 overflow-hidden rounded-xl border border-white/10 bg-white/[.06] p-1.5">
      <div className="flex w-1/4 flex-col gap-1 rounded-lg bg-black/20 p-1">{[0, 1, 2].map((i) => <span key={i} className="h-1.5 rounded bg-white/20" />)}</div>
      <div className="flex-1 space-y-1"><span className="block h-2 w-1/3 rounded bg-white/30" /><span className="block h-4 rounded-lg bg-white/10" /><span className="block h-4 rounded-lg bg-white/10" /></div>
    </div>
  ) : (
    <div aria-hidden className="flex h-16 overflow-hidden rounded-xl border border-white/10 bg-[#0b0c12]">
      <div className="flex w-1/4 flex-col gap-1 border-r border-white/[.06] bg-[#0d0e14] p-1.5">{[0, 1, 2].map((i) => <span key={i} className="h-1.5 rounded bg-white/15" />)}</div>
      <div className="flex flex-1 flex-col"><span className="h-3 border-b border-white/[.06] bg-[#0d0e14]" /><div className="flex-1 space-y-1 p-1.5"><span className="block h-1.5 w-1/3 rounded bg-white/30" /><span className="block h-3 rounded bg-white/[.07]" /><span className="block h-3 rounded bg-white/[.07]" /></div><span className="h-2 border-t border-white/[.06] bg-[#0d0e14]" /></div>
    </div>
  );
}

// Clay: Claude's own theme. Warm charcoal with slow terracotta and sand light, plus a soft paper grain.
function ClayWallpaper() {
  return (
    <div aria-hidden className="clay-wall absolute inset-0 overflow-hidden">
      <span className="clay-blob clay-blob-a" />
      <span className="clay-blob clay-blob-b" />
      <span className="clay-blob clay-blob-c" />
      <span className="clay-grain" />
    </div>
  );
}
