import { createFileRoute } from "@tanstack/react-router";
import { installUiSounds, playClick, playHover } from "@/lib/ui-sound";
import { MINI_GAMES, MiniGame, type MiniGameId } from "@/components/mini-games";
import { OsPreview, WelcomeSetup, type WelcomeResult } from "@/components/welcome-setup";
import { NovaSettingsApp } from "@/components/nova-settings";
import { RedditView } from "@/components/reddit-view";
import { isRedditUrl } from "@/lib/reddit";
import { NOVA_CUSTOM_DEFAULT, NOVA_PINS, NOVA_THEMES, OLD_NOVA_PINS, NovaBoot, NovaOptimize, NovaShell, NovaStart, applyCustomNovaTheme, convert as convertUnits, novaTheme } from "@/components/nova-shell";
import { ActivityApp, ActivityIcon, trackOpen, trackTime } from "@/components/activity-app";
import { ChatApp, ChatIcon } from "@/components/chat-app";
import { AlphaBadge, AlphaWatermark, BUILD, RELEASE_LABEL, WhatsNewTour, releaseSeen } from "@/components/release";
import { CometIcon, PulseIcon, PulseMonitor, Soundscapes, SoundscapesIcon } from "@/components/nova-apps";
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
  History,
} from "lucide-react";
import { Copy as LuCopy, Square as LuSquare, CirclePlus as LuCirclePlus, Scissors as LuScissors, ClipboardPaste as LuClipboardPaste, TextCursorInput as LuTextCursorInput, Trash2 as LuTrash2, ArrowUpDown as LuArrowUpDown, LayoutList as LuLayoutList, Ellipsis as LuEllipsis, PanelRight as LuPanelRight, ArrowUp as LuArrowUp, Images as LuImages, Monitor as LuMonitor, HardDrive as LuHardDrive, Pin as LuPin, FolderOpen as LuFolderOpen, CheckCheck as LuCheckCheck, FlipHorizontal as LuFlipHorizontal, Bold as LuBold, Italic as LuItalic, Underline as LuUnderline, Strikethrough as LuStrikethrough, Subscript as LuSubscript, Superscript as LuSuperscript, Highlighter as LuHighlighter, Baseline as LuBaseline, List as LuList, ListOrdered as LuListOrdered, IndentDecrease as LuIndentDecrease, IndentIncrease as LuIndentIncrease, AlignLeft as LuAlignLeft, AlignCenter as LuAlignCenter, AlignRight as LuAlignRight, AlignJustify as LuAlignJustify, Replace as LuReplace, TextSelect as LuTextSelect, RemoveFormatting as LuRemoveFormatting, AArrowUp as LuAArrowUp, AArrowDown as LuAArrowDown, Table as LuTable, ImagePlus as LuImagePlus, Link as LuLink, SeparatorHorizontal as LuSeparatorHorizontal, CalendarClock as LuCalendarClock, FileDown as LuFileDown, Printer as LuPrinter, Sigma as LuSigma, Eraser as LuEraser, ArrowDownAZ as LuArrowDownAZ, ArrowDownZA as LuArrowDownZA, PaintBucket as LuPaintBucket, DollarSign as LuDollarSign, Percent as LuPercent, Rows3 as LuRows3, Columns3 as LuColumns3, SquarePlus as LuSquarePlus, Presentation as LuPresentation, StickyNote as LuStickyNote, ZoomIn as LuZoomIn, ZoomOut as LuZoomOut, Expand as LuExpand, MoveUp as LuMoveUp, MoveDown as LuMoveDown, ImageOff as LuImageOff, BetweenHorizontalStart as LuBetweenHorizontalStart, BetweenVerticalStart as LuBetweenVerticalStart, FilePen as LuFilePen, Clock as LuClock, Calendar as LuCalendar, SquareFunction as LuSquareFunction, Search as LuSearch, FileText as LuFileText, SquareCheck as LuSquareCheck } from "lucide-react";
import { Backstage, FileGlyph, FolderGlyph, OFFICE, OfficeStatus, OfficeTitle, RBig, RColor, RGroup, RRow, RSmall, RStack, Ribbon, rSelect } from "@/components/office-ui";
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

const OS_VERSION = "3.0";
const CHANGELOG = [
  { v: "3.0", date: "21 Oct 2026", items: ["PRIVATE OS and NOVA OS are now an ALPHA RELEASE (STILL IN DEVELOPMENT), shown on the start, boot and desktop screens with the build number", "Welcome to 3.0: a tour of everything new shows once after the update", "NOVA Spaces: several desktops with their own windows. Ctrl+Alt+arrows switch, Ctrl+Alt+Shift+arrows move the front window, and Overview shows every Space with buttons to add, remove and move windows", "New Activity app in both systems: screen time today, a 7-day chart, most used and most opened apps, all kept in this browser", "Make your own NOVA theme: pick three colours and NOVA builds the accent, glow and live wallpapers from them", "NOVA screensaver: a floating clock drifts over your live wallpaper after 1, 3, 5 or 10 idle minutes", "Nova Search converts units and temperatures (10 km in miles, 72 f to c, 5 kg to lb, 2 gb in mb)", "Keyboard shortcuts sheet in NOVA (Ctrl+/ or the Nova menu)", "New NOVA boot and start screens with the alpha label", "System Info shows the release channel and build", "Activity is pinned in Orbit, Search and the PRIVATE OS start menu", "New Chat app: talk live with everyone on PRIVATE OS and NOVA OS in public rooms, or make a private room and share its code with friends", "Browser history: every page you visit is saved (Menu > History), with search, delete and a Recently visited list on the new tab page", "Cookies now stay saved, so you stay signed in to sites after closing the browser. Clear them from Menu > Clear cookies", "Gmail and Google sign-in open in their own window, since Google blocks signing in inside other browsers", "When a proxy server drops a page (\"tls handshake eof\"), the browser tries again and moves to another server by itself", "Gmail, Discord, Roblox and Spotify shortcuts on the new tab page"] },
  { v: "2.4", date: "20 Oct 2026", items: ["Switching from NOVA OS to PRIVATE OS now shows a 5 second loading screen first, and you can cancel it", "Optimize button in NOVA OS, with its own optimize screen: find it in the Control Center, Settings › Speed, the Nova menu, a right-click on the desktop, or by typing “optimize” in Search", "New Desktop space in NOVA Settings: choose a greeting, a big clock or nothing, put it on the left or in the centre, add app shortcuts and widgets (calendar, music, notes, stopwatch) to the desktop", "NOVA dock: pick the icon size and let it hide until you move the mouse to the bottom of the screen", "Show the Dynamic Island all the time or only for notifications and timers", "Clear, frosted or solid glass for NOVA panels and menus", "Wallpaper shuffle: NOVA can move to the next live scene every few minutes", "Right-click an app in the dock to add it to the desktop", "Faster proxy: the browser now picks the first proxy server that answers instead of waiting for all of them, loads its engine files at the same time, and starts quietly in the background so the first page opens sooner"] },
  { v: "2.3", date: "19 Oct 2026", items: ["Brand new NOVA OS Settings, designed only for NOVA: a home of live tiles (your desktop, a theme orbit, quick toggles, brightness and volume), spaces that slide in with their own mini dock, and search that jumps straight to any setting", "New NOVA OS wallpapers: eight live scenes painted in your theme colours (Aurora, Fluid, Dunes, Planet, Tide, Bloom, Silk and Cosmos), plus photo and video wallpapers and your own photos, chosen right inside NOVA", "Dim wallpaper slider, and NOVA windows get round glass buttons", "NOVA OS no longer offers desktop styles; it has one desktop of its own", "Shorter NOVA OS dock: five apps by default, smaller icons and no extra buttons", "The browser in NOVA OS is now called Comet, with its own icon", "Reddit works in the browser: it opens in a built-in Reddit reader that loads posts, pictures, galleries, videos and comments straight from your own connection, because Reddit blocks proxy servers"] },
  { v: "2.2", date: "19 Oct 2026", items: ["Two operating systems: choose PRIVATE OS or the new NOVA OS when you set up, and switch any time in Settings", "NOVA OS: live animated wallpapers with depth, a Dynamic Island with notifications and a focus timer, a magnifying dock, the Orbit app launcher, Nova Search with a calculator, Control Center, and a notification and widget panel", "NOVA OS Overview: every open window flies into a live grid (Alt+Tab, F3 or the top-left hot corner)", "NOVA OS themes: Aurora, Nebula, Ember, Glacier, Verdant, Sakura, Solar and Graphite", "New NOVA apps: Soundscapes, a live ambient sound mixer, and Pulse, a system monitor", "NOVA OS has its own start, boot and lock screens and new window animations", "Setup now asks for your name and a theme before you can continue"] },
  { v: "2.1", date: "18 Oct 2026", items: ["New Clay theme: warm terracotta on soft charcoal with its own slow-moving wallpaper, softer windows and a warm glow", "Removed the macOS-style Liquid Glass desktop; if you used it you now get Clay", "Private Files rebuilt like Windows 11 File Explorer: tabs, address bar, command bar, navigation pane, Home and This PC, details and icon views, right-click menu, cut, copy, paste, rename and drag and drop", "Private Word, Excel, PowerPoint and OneNote now look like Microsoft 365: coloured title bar with AutoSave, ribbon tabs, a File page with recent files, and a status bar with zoom"] },
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
launcherApps.push(...linkLauncher, { id: "activity", label: "Activity", icon: ActivityIcon }, { id: "writer", label: "Private Word", icon: WriterIcon }, { id: "sheets", label: "Private Excel", icon: SheetsIcon }, { id: "slides", label: "Private PowerPoint", icon: SlidesIcon }, { id: "pdfreader", label: "PDF Reader", icon: PdfIcon }, { id: "sticky", label: "Sticky Notes", icon: StickyIcon }, { id: "focus", label: "Focus Timer", icon: FocusIcon }, { id: "convert", label: "Converter", icon: ConvertIcon }, { id: "passwords", label: "Passwords", icon: PasswordIcon }, { id: "recorder", label: "Recorder", icon: RecorderIcon }, { id: "games", label: "Games", icon: GamesIcon }, { id: "camera", label: "Camera", icon: CameraIcon }, { id: "media", label: "Media Player", icon: MediaIcon }, { id: "about", label: "System Info", icon: AboutIcon }, { id: "chat", label: "Chat", icon: ChatIcon }, { id: "messages", label: "Messages", icon: MessagesIcon }, { id: "mail", label: "Private Outlook", icon: MailIcon }, { id: "contacts", label: "Contacts", icon: ContactsIcon }, { id: "maps", label: "Maps", icon: MapsIcon });

// NOVA OS gets every app plus its own Soundscapes and Pulse. Its browser is called Comet.
const NOVA_APPS: { id: string; label: string; icon: IconComponent }[] = [...launcherApps.map((app) => (app.id === "browser" ? { id: "browser", label: "Comet", icon: CometIcon } : app)), { id: "soundscapes", label: "Soundscapes", icon: SoundscapesIcon }, { id: "pulse", label: "Pulse", icon: PulseIcon }];

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
  const [switching, setSwitching] = useState(false);
  const [tour, setTour] = useState(false);
  const frontApp = useRef<string | null>(null);
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

  // Activity: every 15 seconds, the app in front gets the time.
  useEffect(() => {
    if (phase !== "desktop" || locked || power !== "on") return;
    const interval = window.setInterval(() => {
      if (document.visibilityState === "visible" && frontApp.current) trackTime(frontApp.current, 15);
    }, 15000);
    return () => window.clearInterval(interval);
  }, [phase, locked, power]);

  // The 3.0 tour shows once, after the desktop unlocks.
  useEffect(() => {
    if (phase !== "desktop" || locked || !settingsReady || !settings.onboarded || releaseSeen(OS_VERSION)) return;
    const timer = window.setTimeout(() => setTour(true), 900);
    return () => window.clearTimeout(timer);
  }, [phase, locked, settingsReady, settings.onboarded]);

  // Start the browser's proxy engine in the background once the desktop is up.
  useEffect(() => {
    if (phase !== "desktop" || locked) return;
    const timer = window.setTimeout(prewarmProxyEngine, 2500);
    return () => window.clearTimeout(timer);
  }, [phase, locked]);

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
        // NOVA OS 2.3 has a shorter dock; docks still on the old default get the new one.
        if (saved.novaPins && saved.novaPins.join() === OLD_NOVA_PINS.join()) saved.novaPins = NOVA_PINS;
        // NOVA OS 2.4 has its own wallpaper choice; the old "use my photo" switch becomes that photo.
        if (saved.novaPhoto && !saved.novaWall) saved.novaWall = `photo:${Number(localStorage.getItem("pos-wallpaper")) || 0}`;
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

  const addWall = async (file: File, select = true): Promise<number | null> => {
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
      if (select) setWallpaper(wallpaperOptions.length + count - 1);
      return wallpaperOptions.length + count - 1;
    } catch {
      window.alert("Couldn't add that image.");
      return null;
    }
  };

  const removeWall = async (id: number) => {
    await deleteWall(id);
    await refreshWalls();
    setWallpaper(0);
  };

  const allWalls: WallpaperOption[] = [...wallpaperOptions, ...customWalls.map((wall) => ({ label: wall.label, thumb: wall.url, src: wall.url }))];
  const novaPhotoWall = settings.novaWall.startsWith("photo:") ? allWalls[Number(settings.novaWall.slice(6))] : undefined;

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
  const nova = settings.edition === "nova";
  const switchEdition = (edition: "private" | "nova", now = false) => {
    // Leaving NOVA OS shows a 5 second loading screen first.
    if (edition === "private" && nova && !now) {
      setLauncher(false);
      setSwitching(true);
      return;
    }
    setSwitching(false);
    setLauncher(false);
    setStartMenu(false);
    setQuickMenu(false);
    setTaskView(false);
    setRunOpen(false);
    patchSettings({ edition });
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
    if (!openWins.includes(key)) trackOpen(key);
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
  frontApp.current = topId;
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
    { label: "Switch to NOVA OS", run: () => switchEdition("nova") },
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
        ...(convertUnits(runText) ? [{ key: "unit", label: `${runText.trim()} = ${convertUnits(runText)}`, hint: "Convert", run: () => { void navigator.clipboard?.writeText(convertUnits(runText) ?? "").catch(() => {}); } }] : []),
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
      if (nova) return; // NOVA OS has its own shortcuts.
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
      case "browser": return <PrivateBrowser key={browserStart ?? "home"} initialUrl={browserStart} close={close} nova={nova} />;
      case "figure": return <FigureCloudApp close={close} />;
      case "beez": return <BeeZApp close={close} />;
      case "youtube": return <YouTubeApp close={close} />;
      case "minecraft": return <MinecraftApp close={close} />;
      case "settings": return nova ? (
        <WindowFrame title="Settings" icon={SettingsIcon} close={close} nova>
          <NovaSettingsApp settings={settings} patch={patchSettings} apps={NOVA_APPS} version={OS_VERSION} changelog={CHANGELOG} walls={allWalls} customFrom={wallpaperOptions.length} customIds={customWalls.map((wall) => wall.id)} addWall={(file) => addWall(file, false)} removeWall={removeWall} switchToPrivate={() => switchEdition("private")} optimize={() => setOptimizing(true)} restartSetup={() => patchSettings({ onboarded: false })} wisp={{ servers: WISP_SERVERS, probe: probeWisp }} />
        </WindowFrame>
      ) : <WallpaperSettings wallpaper={wallpaper} setWallpaper={setWallpaper} walls={allWalls} custom={customWalls} addWall={addWall} removeWall={removeWall} settings={settings} patch={patchSettings} close={close} />;
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
      case "mail": return <WindowFrame title="Mail - Private Outlook" icon={MailIcon} close={close} bar={{ className: "text-white", style: { background: OFFICE.outlook.color }, content: <OfficeTitle brand={OFFICE.outlook} icon={MailIcon} name="Mail" /> }}><MailContent /></WindowFrame>;
      case "contacts": return <WindowFrame title="Contacts" icon={ContactsIcon} close={close}><ContactsContent openApp={openApp} /></WindowFrame>;
      case "maps": return <WindowFrame title="Maps" icon={MapsIcon} close={close}><MapsContent /></WindowFrame>;
      case "taskmgr": return <TaskManagerApp close={close} wins={openWins} end={closeWindow} show={openApp} />;
      case "soundscapes": return <WindowFrame title="Soundscapes" icon={SoundscapesIcon} close={close}><Soundscapes /></WindowFrame>;
      case "chat": return <WindowFrame title="Chat" icon={ChatIcon} close={close}><ChatApp userName={settings.userName} /></WindowFrame>;
      case "activity": return <WindowFrame title="Activity" icon={ActivityIcon} close={close}><ActivityApp apps={NOVA_APPS} /></WindowFrame>;
      case "pulse": return <WindowFrame title="Pulse" icon={PulseIcon} close={close}><PulseMonitor windows={openWins.length} /></WindowFrame>;
      default: return null;
    }
  };

  applyCustomNovaTheme(settings.novaCustom);
  // Wait for saved settings so the right OS shows its own start screen (no flash of the other one).
  if (phase === "start" && !settingsReady) return <main className="h-dvh bg-black" />;
  if (phase === "start") return nova ? <NovaStart theme={novaTheme(settings.novaTheme)} onStart={() => setPhase("boot")} /> : <StartScreen onStart={() => setPhase("boot")} />;
  if (phase === "boot") return nova ? <NovaBoot theme={novaTheme(settings.novaTheme)} /> : <BootScreen />;

  const welcome = settingsReady && !settings.onboarded
    ? <WelcomeSetup themes={WELCOME_THEMES.flatMap((id) => THEMES.filter((theme) => theme.id === id))} novaThemes={NOVA_THEMES.filter((theme) => theme.id !== "custom")} lowPower={isLowPowerDevice()} onDone={finishSetup} />
    : null;
  const renderSlot = (id: string) => (
    <WindowContext.Provider value={{ minimized: minWins.includes(id), minimize: () => setMinWins((list) => (list.includes(id) ? list : [...list, id])), focus: () => raise(id), z: 10 + Math.max(0, zOrder.indexOf(id)), top: zOrder[zOrder.length - 1] === id, closing: closingWins.includes(id) }}>
      <AppBoundary close={() => closeWindow(id)}>{renderWindow(id)}</AppBoundary>
    </WindowContext.Provider>
  );

  if (nova) {
    const shutDown = () => { setOpenWins([]); setMinWins([]); setZOrder([]); setPower("off"); };
    return (
      <NovaShell
        settings={settings}
        patch={patchSettings}
        time={time}
        zone={zone}
        apps={NOVA_APPS}
        openWins={openWins}
        minWins={minWins}
        zOrder={zOrder}
        openApp={openApp}
        closeWindow={closeWindow}
        minimize={(id) => setMinWins((list) => (list.includes(id) ? list : [...list, id]))}
        minimizeAll={() => setMinWins(openWins)}
        raise={raise}
        renderSlot={renderSlot}
        locked={locked}
        setLocked={setLocked}
        power={power}
        setPower={(value) => { if (value === "off") shutDown(); else setPower(value); }}
        shutdown={shutDown}
        battery={battery}
        photo={novaPhotoWall?.src ?? novaPhotoWall?.thumb}
        video={novaPhotoWall?.video}
        renderWidget={(id) => (id === "music" ? <MusicWidget /> : id === "notes" ? <NotesWidget /> : id === "calendar" ? <CalendarWidget weekStart={settings.weekStart} /> : <StopwatchWidget />)}
        searchFiles={(text) => Object.entries(readFs()).filter(([path, value]) => typeof value === "string" && path.toLowerCase().includes(text)).slice(0, 6).map(([path]) => ({ key: `file-${path}`, label: path, run: () => openPathInApp(path, openApp) }))}
        webSearch={webSearch}
        switchToPrivate={() => switchEdition("private")}
        optimize={() => setOptimizing(true)}
        extra={<>{optimizing && <NovaOptimize theme={novaTheme(settings.novaTheme)} onApply={() => patchSettings(() => ({ lite: true }))} onDone={() => setOptimizing(false)} />}{switching && <SwitchScreen onDone={() => switchEdition("private", true)} onCancel={() => setSwitching(false)} />}{tour && <WhatsNewTour version={OS_VERSION} onDone={() => setTour(false)} />}{welcome}</>}
      />
    );
  }

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
          <button type="button" onClick={() => switchEdition("nova")} className="nova-try flex items-center gap-3 rounded-2xl border border-white/10 p-3 text-left">
            <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-black/40"><Sparkles className="size-5 text-teal-300" /></span>
            <span className="min-w-0 flex-1"><span className="block text-xs font-bold tracking-wide">Try NOVA OS</span><span className="block text-[10px] text-white/60">The reimagined desktop. Switch back any time.</span></span>
            <ChevronRight className="size-4 text-white/60" />
          </button>
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

      <AlphaWatermark name="PRIVATE OS" version={OS_VERSION} className={`absolute right-4 z-[2] text-white/40 ${settings.dockPos === "bottom" ? "bottom-[78px]" : "bottom-4"}`} />
      {tour && <WhatsNewTour version={OS_VERSION} onDone={() => setTour(false)} />}
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
      {welcome}
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
      <AlphaBadge className="mt-4 font-['Orbitron',sans-serif]" />
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

// Shown for 5 seconds while NOVA OS hands over to PRIVATE OS.
const SWITCH_STEPS = ["Saving your NOVA session", "Folding away the Dynamic Island", "Building the taskbar", "Loading your PRIVATE OS theme", "Starting PRIVATE OS"];
function SwitchScreen({ onDone, onCancel }: { onDone: () => void; onCancel: () => void }) {
  const [step, setStep] = useState(0);
  useEffect(() => {
    const steps = window.setInterval(() => setStep((value) => Math.min(value + 1, SWITCH_STEPS.length - 1)), 1000);
    const done = window.setTimeout(onDone, 5000);
    return () => {
      window.clearInterval(steps);
      window.clearTimeout(done);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <div role="alertdialog" aria-live="polite" aria-label="Switching to PRIVATE OS" className="os-switch fixed inset-0 z-[99] flex flex-col items-center justify-center text-white">
      <div className="os-switch-mark grid size-16 place-items-center rounded-lg border border-white/15 bg-white/[.04]"><ShieldCheck className="size-8 text-blue-400" /></div>
      <h1 className="mt-5 text-xl font-semibold tracking-[.28em]">PRIVATE OS</h1>
      <p className="mt-2 text-[10px] uppercase tracking-[.22em] text-white/50">Switching from NOVA OS</p>
      <div className="mt-8 h-[3px] w-56 overflow-hidden rounded-full bg-white/10"><div className="os-switch-bar h-full rounded-full bg-gradient-to-r from-blue-500 to-sky-300" /></div>
      <p key={step} className="mt-4 h-4 text-[12px] text-white/60 [animation:nova-fade_.35s_both]">{SWITCH_STEPS[step]}…</p>
      <button type="button" onClick={onCancel} className="mt-10 rounded-full border border-white/15 px-4 py-1.5 text-[12px] text-white/70 transition-colors hover:bg-white/10 hover:text-white">Stay in NOVA</button>
    </div>
  );
}

function BootScreen() {
  return (
    <main className="flex h-dvh items-center justify-center bg-background text-foreground">
      <div className="text-center [animation:boot-mark_2.5s_ease-in-out_forwards]">
        <div className="mx-auto flex size-16 items-center justify-center rounded-lg border border-border bg-card shadow-2xl"><ShieldCheck className="size-8 text-primary" /></div>
        <h1 className="mt-5 text-xl font-semibold tracking-[.28em]">PRIVATE OS</h1>
        <p className="mt-2 text-[10px] uppercase tracking-[.22em] text-muted-foreground">Private by design</p>
        <AlphaBadge className="mt-3 !text-[8.5px]" />
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

// `bar` swaps the standard title bar for an app's own (Office, File Explorer) with Windows caption buttons.
type WindowBar = { className: string; content: ReactNode; light?: boolean; style?: React.CSSProperties };
const NO_DRAG = "button, input, select, textarea, [data-nodrag]";

function WindowFrame({ title, icon: Icon, close, children, startMaximized = false, actions, bar, nova = false }: { title: string; icon: IconComponent; close: () => void; children: React.ReactNode; app?: boolean; startMaximized?: boolean; actions?: ReactNode; bar?: WindowBar; nova?: boolean }) {
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
        if (target.closest("header") && !target.closest(NO_DRAG)) toggleMaximize();
      }}
      onPointerDown={(event) => {
        focus();
        const target = event.target as HTMLElement;
        if (event.button !== 0 || !target.closest("header") || target.closest(NO_DRAG)) return;
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
      className={`os-window-anim absolute flex flex-col overflow-hidden ${surface} ${nova ? "nova-window" : ""} ${minimized ? "os-window-min pointer-events-none" : ""} ${closing ? "os-window-closing pointer-events-none" : ""} ${position}`}
    >
      {nova ? (
        <header className="nova-titlebar absolute inset-x-0 top-0 z-30 flex h-12 items-center justify-end gap-1.5 pl-24 pr-3">
          <button type="button" aria-label="Minimize" title="Minimize" onClick={minimize} className="nova-ctl"><Minus className="size-3.5" /></button>
          <button type="button" aria-label={maximized ? "Restore" : "Expand"} title={maximized ? "Restore" : "Expand"} onClick={toggleMaximize} className="nova-ctl">{maximized ? <Minimize2 className="size-3" /> : <Maximize2 className="size-3" />}</button>
          <button type="button" aria-label="Close" title="Close" onClick={close} className="nova-ctl nova-ctl-close"><X className="size-3.5" /></button>
        </header>
      ) : bar ? (
        <header className={`os-bar flex h-10 shrink-0 items-stretch ${bar.className}`} style={bar.style}>
          <div className="flex min-w-0 flex-1 items-center">{bar.content}</div>
          <div className={`win-caption flex shrink-0 items-stretch ${bar.light ? "win-caption-light" : ""}`}>
            <button type="button" aria-label="Minimize" title="Minimize" onClick={minimize}><Minus className="size-4" strokeWidth={1.25} /></button>
            <button type="button" aria-label={maximized ? "Restore" : "Maximize"} title={maximized ? "Restore Down" : "Maximize"} onClick={toggleMaximize}>{maximized ? <LuCopy className="size-3.5 -scale-x-100" strokeWidth={1.25} /> : <LuSquare className="size-3.5" strokeWidth={1.25} />}</button>
            <button type="button" aria-label="Close" title="Close" onClick={close} className="win-caption-close"><X className="size-4" strokeWidth={1.25} /></button>
          </div>
        </header>
      ) : (
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

// Picks a working Wisp server: a custom choice if set, otherwise the first one that answers.
// The last working server gets a short head start, and the others are only tried if it is slow.
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
  const working = await new Promise<string>((resolve) => {
    let pending = list.length;
    let settled = false;
    const tryServer = (url: string) => {
      void probeWisp(url, 3500).then((ok) => {
        pending -= 1;
        if (settled) return;
        if (ok) {
          settled = true;
          resolve(url);
        } else if (pending === 0) {
          settled = true;
          resolve(WISP_SERVERS[0]!);
        }
      });
    };
    list.forEach((url, index) => {
      if (index === 0 || !last) tryServer(url);
      else window.setTimeout(() => tryServer(url), 350);
    });
  });
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
// The live transport link, so the browser can move to another Wisp server when one drops connections.
let engineLink: { connection: { setTransport: (path: string, args: unknown[]) => Promise<void> }; wisp: string } | null = null;
let rotating: Promise<boolean> | null = null;

// Moves the proxy to the next Wisp server that answers. Skipped when the person picked a server.
function rotateWisp() {
  if (rotating) return rotating;
  rotating = (async () => {
    const link = engineLink;
    if (!link) return false;
    try {
      if ((localStorage.getItem("pos-wisp-choice") || "auto") !== "auto") return false;
    } catch {
      // storage unavailable: treat as automatic
    }
    for (const url of WISP_SERVERS.filter((item) => item !== link.wisp)) {
      if (!(await probeWisp(url, 3000))) continue;
      try {
        await withTimeout(link.connection.setTransport("/epoxy.mjs", [{ wisp: url }]), 8000, "switch timed out");
      } catch {
        continue;
      }
      link.wisp = url;
      try {
        localStorage.setItem("pos-wisp-last", url);
      } catch {
        // storage unavailable
      }
      return true;
    }
    return false;
  })().finally(() => window.setTimeout(() => { rotating = null; }, 4000));
  return rotating;
}

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
      // The proxy server is chosen while the engine files load, instead of after.
      const wisp = pickWisp();
      await Promise.all([loadScript("/baremux.js"), loadScript("/scramjet.all.js")]);
      if (!scope.BareMux || !scope.$scramjetLoadController) throw new Error("Proxy engine files are missing");
      const registration = await navigator.serviceWorker.register("/sw.js", { scope: "/" });
      await workerActivated(registration.installing ?? registration.waiting);
      await withTimeout(navigator.serviceWorker.ready, 8000, "The proxy worker did not start");
      if (!navigator.serviceWorker.controller) {
        await new Promise<void>((resolve) => {
          navigator.serviceWorker.addEventListener("controllerchange", () => resolve(), { once: true });
          window.setTimeout(resolve, 2500);
        });
      }
      await repairEngineStore();
      const { ScramjetController } = scope.$scramjetLoadController();
      const controller = new ScramjetController({ prefix: "/scramjet/" });
      await withTimeout(controller.init(), 10000, "The proxy engine did not initialise");
      const connection = new scope.BareMux.BareMuxConnection("/baremux-worker.js");
      const server = await wisp;
      await withTimeout(connection.setTransport("/epoxy.mjs", [{ wisp: server }]), 12000, "Could not reach a proxy server");
      engineLink = { connection, wisp: server };
      return controller;
    })(), 30000, "The proxy engine took too long to start").catch((error) => {
      engineStart = null;
      void resetProxyWorker();
      throw error;
    });
  }
  return engineStart;
}

// Starts the proxy engine quietly once the desktop is idle, so the first page opens without the wait.
function prewarmProxyEngine() {
  if (typeof window === "undefined" || engineStart) return;
  const run = () => void startProxyEngine().catch(() => undefined);
  const idle = (window as unknown as { requestIdleCallback?: (callback: () => void, options?: { timeout: number }) => number }).requestIdleCallback;
  if (idle) idle(run, { timeout: 6000 });
  else window.setTimeout(run, 1500);
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
  { title: "Gmail", url: "https://mail.google.com/" },
  { title: "Discord", url: "https://discord.com/app" },
  { title: "Roblox", url: "https://www.roblox.com/" },
  { title: "Spotify", url: "https://open.spotify.com/" },
];

// Browsing history, kept in this browser (shared by every tab and by both systems).
type HistoryItem = { url: string; title: string; time: number };
const HISTORY_KEY = "pos-history";
const HISTORY_MAX = 400;
function readHistory(): HistoryItem[] {
  try {
    const list = JSON.parse(localStorage.getItem(HISTORY_KEY) ?? "[]") as unknown;
    return Array.isArray(list) ? (list as HistoryItem[]).filter((item) => item && typeof item.url === "string") : [];
  } catch {
    return [];
  }
}
function writeHistory(list: HistoryItem[]) {
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(list.slice(0, HISTORY_MAX)));
  } catch {
    // storage full or unavailable
  }
  window.dispatchEvent(new Event("pos-history"));
}
function addHistory(url: string, title = "") {
  const list = readHistory();
  const recent = list[0];
  if (recent && recent.url === url && Date.now() - recent.time < 30 * 60_000) {
    recent.time = Date.now();
    if (title) recent.title = title;
    return writeHistory(list);
  }
  writeHistory([{ url, title, time: Date.now() }, ...list]);
}
function titleHistory(url: string, title: string) {
  const list = readHistory();
  const item = list.find((entry) => entry.url === url);
  if (!item || item.title === title) return;
  item.title = title;
  writeHistory(list);
}
function useHistoryList() {
  const [list, setList] = useState<HistoryItem[]>([]);
  useEffect(() => {
    const load = () => setList(readHistory());
    load();
    window.addEventListener("pos-history", load);
    return () => window.removeEventListener("pos-history", load);
  }, []);
  return list;
}
// Forgets every site cookie the proxy saved, which signs you out of sites opened in the browser.
function clearSiteCookies() {
  try {
    navigator.serviceWorker?.controller?.postMessage({ posProxy: "clear-cookies" });
  } catch {
    // no proxy worker running
  }
  try {
    const request = indexedDB.open("$scramjet");
    request.onupgradeneeded = () => request.transaction?.abort();
    request.onsuccess = () => {
      const database = request.result;
      if (database.objectStoreNames.contains("cookies")) database.transaction("cookies", "readwrite").objectStore("cookies").put({}, "cookies");
      database.close();
    };
  } catch {
    // nothing stored
  }
}

function dayLabel(time: number) {
  const date = new Date(time);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  if (date.toDateString() === today.toDateString()) return "Today";
  if (date.toDateString() === yesterday.toDateString()) return "Yesterday";
  return date.toLocaleDateString(undefined, { weekday: "long", day: "numeric", month: "long" });
}

function HistoryPanel({ open, close }: { open: (url: string) => void; close: () => void }) {
  const list = useHistoryList();
  const [query, setQuery] = useState("");
  const [cleared, setCleared] = useState("");
  const shown = list.filter((item) => !query || `${item.title} ${item.url}`.toLowerCase().includes(query.toLowerCase()));
  const groups: { label: string; items: HistoryItem[] }[] = [];
  for (const item of shown) {
    const label = dayLabel(item.time);
    const group = groups[groups.length - 1];
    if (group && group.label === label) group.items.push(item);
    else groups.push({ label, items: [item] });
  }
  const remove = (target: HistoryItem) => writeHistory(readHistory().filter((item) => !(item.url === target.url && item.time === target.time)));
  return (
    <div className="absolute inset-0 z-20 overflow-auto bg-background p-4 [animation:rise_.25s_cubic-bezier(.22,1,.36,1)]">
      <div className="mx-auto max-w-2xl">
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="mr-auto flex items-center gap-2 text-lg font-semibold"><History className="size-5 text-primary" />History</h2>
          <button type="button" onClick={() => { clearSiteCookies(); setCleared("Cookies cleared. You're signed out of sites in the browser."); }} className="rounded-full bg-white/[.07] px-3 py-1.5 text-[12px] hover:bg-white/[.12]">Clear cookies</button>
          <button type="button" onClick={() => { writeHistory([]); setCleared("History cleared."); }} className="rounded-full bg-white/[.07] px-3 py-1.5 text-[12px] hover:bg-white/[.12]">Clear history</button>
          <button type="button" aria-label="Close history" onClick={close} className="grid size-8 place-items-center rounded-full hover:bg-white/10"><X className="size-4" /></button>
        </div>
        <div className="chrome-omnibox mt-4 flex h-10 items-center gap-2 rounded-full px-4">
          <Search className="size-4 text-foreground/55" />
          <input autoFocus aria-label="Search history" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search history" className="min-w-0 flex-1 bg-transparent text-[13px] outline-none placeholder:text-foreground/45" />
        </div>
        {cleared && <p className="mt-3 rounded-xl bg-primary/10 px-3 py-2 text-[12px] text-primary">{cleared}</p>}
        {groups.length === 0 && <p className="mt-10 text-center text-sm text-muted-foreground">{query ? "Nothing in your history matches that." : "Pages you visit show up here."}</p>}
        {groups.map((group) => (
          <section key={group.label} className="mt-5">
            <h3 className="mb-1.5 px-1 text-[11px] font-semibold uppercase tracking-[.16em] text-muted-foreground">{group.label}</h3>
            <ul className="overflow-hidden rounded-2xl bg-white/[.04]">
              {group.items.map((item) => (
                <li key={`${item.url}-${item.time}`} className="group flex items-center gap-3 px-3 py-2 hover:bg-white/[.06]">
                  <span className="w-16 shrink-0 whitespace-nowrap text-[11px] tabular-nums text-muted-foreground">{new Date(item.time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                  <SiteIcon host={hostOf(item.url)} />
                  <button type="button" onClick={() => open(item.url)} className="min-w-0 flex-1 text-left">
                    <span className="block truncate text-[13px]">{item.title || hostOf(item.url) || item.url}</span>
                    <span className="block truncate text-[11px] text-muted-foreground">{item.url.replace(/^https?:\/\/(www\.)?/, "")}</span>
                  </button>
                  <button type="button" aria-label={`Remove ${item.title || item.url} from history`} onClick={() => remove(item)} className="grid size-7 shrink-0 place-items-center rounded-full opacity-0 hover:bg-white/10 group-hover:opacity-100 focus:opacity-100"><X className="size-3.5" /></button>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}

// Google refuses sign-in inside other browsers and proxies ("This browser may not be secure"),
// so Gmail and Google accounts open in a real browser window instead.
const GOOGLE_SIGN_IN = ["accounts.google.com", "mail.google.com", "gmail.com", "www.gmail.com"];
const isGoogleSignIn = (url: string) => GOOGLE_SIGN_IN.includes(hostOf(url)) || hostOf(url) === "gmail.com";
function openGoogleWindow(url: string) {
  const width = Math.min(1180, window.screen.availWidth - 80);
  const height = Math.min(820, window.screen.availHeight - 80);
  const left = Math.max(0, (window.screen.availWidth - width) / 2);
  const top = Math.max(0, (window.screen.availHeight - height) / 2);
  const opened = window.open(url, "pos-google", `popup=yes,width=${width},height=${height},left=${left},top=${top}`);
  if (!opened) window.open(url, "_blank", "noopener,noreferrer");
}

function GoogleGate({ url, proceed }: { url: string; proceed: () => void }) {
  const gmail = /mail\.google\.com|gmail\.com/.test(url);
  return (
    <div className="absolute inset-0 z-10 grid place-items-center overflow-auto bg-background p-6 [animation:rise_.3s_cubic-bezier(.22,1,.36,1)]">
      <div className="w-full max-w-md text-center">
        <SiteIcon host={gmail ? "mail.google.com" : "google.com"} className="mx-auto size-14" />
        <h2 className="mt-4 text-xl font-semibold">{gmail ? "Open Gmail in its own window" : "Sign in with Google in its own window"}</h2>
        <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground">Google blocks signing in from inside another browser, so it would show "This browser may not be secure". A real window keeps you signed in and your Gmail works normally.</p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button type="button" onClick={() => openGoogleWindow(url)} className="rounded-full bg-primary px-5 py-2.5 text-[13px] font-semibold text-primary-foreground">{gmail ? "Open Gmail" : "Open Google sign-in"}</button>
          <button type="button" onClick={proceed} className="rounded-full bg-white/[.08] px-4 py-2.5 text-[13px] hover:bg-white/[.13]">Try here anyway</button>
        </div>
      </div>
    </div>
  );
}
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

function PrivateBrowser({ initialUrl, close, nova = false }: { initialUrl: string | null; close: () => void; nova?: boolean }) {
  const BrandIcon = nova ? CometIcon : PrivateBrowserIcon;
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
    <WindowFrame title={nova ? "Comet" : "PRIVATE Browser"} icon={BrandIcon} close={close}>
      <div className="chrome-strip flex h-10 shrink-0 items-end overflow-x-auto px-3 pt-1.5" onDoubleClick={(event) => { if (event.target === event.currentTarget) addTab(); }}>
        {tabs.map((tab, index) => {
          const meta = info[tab.id];
          const active = tab.id === activeTab;
          return (
            <div key={tab.id} data-active={active ? "" : undefined} onMouseDown={(event) => { if (event.button === 1) { event.preventDefault(); closeTab(tab.id); } }} className={`chrome-tab group flex h-[34px] min-w-[3.5rem] max-w-[15rem] flex-1 items-center gap-2 pl-3 pr-1.5 text-xs ${active ? "text-foreground" : "text-foreground/65 hover:text-foreground"}`}>
              <button type="button" role="tab" aria-selected={active} onClick={() => setActiveTab(tab.id)} title={meta?.title ?? "New Tab"} className="flex min-w-0 flex-1 items-center gap-2 text-left">
                {meta?.loading ? <RefreshCw className="size-3.5 shrink-0 animate-spin text-primary" /> : meta?.host ? <SiteIcon host={meta.host} /> : <BrandIcon className="size-4 shrink-0" />}
                <span className="truncate">{meta?.title || "New Tab"}</span>
              </button>
              <button type="button" aria-label={`Close tab ${index + 1}`} onClick={() => closeTab(tab.id)} className={`grid size-5 shrink-0 place-items-center rounded-full hover:bg-white/15 ${active ? "" : "opacity-0 group-hover:opacity-100"}`}><X className="size-3" /></button>
            </div>
          );
        })}
        <button type="button" aria-label="New tab" title="New tab" onClick={() => addTab()} className="mb-1 ml-1.5 grid size-7 shrink-0 place-items-center rounded-full hover:bg-white/10"><Plus className="size-4" /></button>
      </div>
      {tabs.map((tab) => <BrowserTab key={tab.id} nova={nova} initialUrl={tab.url} active={tab.id === activeTab} onInfo={(next) => report(tab.id, next)} newTab={addTab} bookmarks={bookmarks} toggleBookmark={toggleBookmark} />)}
    </WindowFrame>
  );
}

function BrowserTab({ nova, initialUrl, active, onInfo, newTab, bookmarks, toggleBookmark }: { nova: boolean; initialUrl: string | null; active: boolean; onInfo: (info: TabInfo) => void; newTab: (url?: string | null) => void; bookmarks: Bookmark[]; toggleBookmark: (mark: Bookmark) => void }) {
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
  const retried = useRef(false);
  const page = nav.index >= 0 ? nav.list[nav.index] : null;
  const [historyOpen, setHistoryOpen] = useState(false);
  const [googleOk, setGoogleOk] = useState(false);
  const gated = Boolean(frameTarget && isGoogleSignIn(frameTarget) && !googleOk);
  const needsEngine = Boolean(frameTarget) && !gated && !isDirectHost(frameTarget ?? "") && !isRedditUrl(frameTarget ?? "");
  const recentSites = useHistoryList();
  useEffect(() => {
    if (gated) setLoading(false);
  }, [gated, frameKey]);

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

  // The proxy worker gave up on a page: move to another proxy server and try the page once more.
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;
    const onWorker = (event: MessageEvent) => {
      const data = event.data as { posProxy?: string; url?: string } | null;
      if (data?.posProxy !== "failed" || !active || retried.current || !frameTarget) return;
      if (data.url && hostOf(data.url) !== hostOf(frameTarget)) return;
      retried.current = true;
      void rotateWisp().then((moved) => {
        if (moved) engineFrame.current?.frame.go(frameTarget);
      });
    };
    navigator.serviceWorker.addEventListener("message", onWorker);
    return () => navigator.serviceWorker.removeEventListener("message", onWorker);
  }, [active, frameTarget]);

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
    setHistoryOpen(false);
    retried.current = false;
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
    ? isRedditUrl(frameTarget)
      ? { mode: "reddit" as const, src: undefined }
      : isDirectHost(frameTarget)
      ? { mode: "direct" as const, src: frameTarget }
      : engine === "failed"
        ? { mode: "loader" as const, src: `/api/proxy?url=${encodeURIComponent(frameTarget)}` }
        : { mode: "engine" as const, src: undefined }
    : null;
  const goHome = () => {
    setHistoryOpen(false);
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
    if (page && /^https?:\/\//i.test(page)) addHistory(page);
  }, [page]);
  useEffect(() => {
    if (page && docTitle) titleHistory(page, docTitle);
  }, [page, docTitle]);
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
                ["History", () => setHistoryOpen(true), true],
                ["Bookmark this page", () => page && toggleBookmark({ title: docTitle || hostOf(page) || page, url: page }), Boolean(page) && !marked],
                ["Open in a real browser tab", () => page && window.open(page, "_blank", "noopener,noreferrer"), Boolean(page)],
                ["Clear cookies", clearSiteCookies, true],
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
        {historyOpen && <HistoryPanel open={(url) => navigateTo(url)} close={() => setHistoryOpen(false)} />}
        {gated && frameTarget ? <GoogleGate url={frameTarget} proceed={() => setGoogleOk(true)} /> : frame?.mode === "reddit" && frameTarget ? (
          <RedditView url={frameTarget} go={navigateTo} onReady={(title) => { setDocTitle(title); setLoading(false); }} />
        ) : frame ? <>
          {loading && <div className="absolute inset-0 z-10 grid place-items-center bg-background/80"><div className="text-center"><SiteIcon host={hostOf(frameTarget ?? "")} className="mx-auto size-10 animate-pulse" /><p className="mt-3 text-xs text-muted-foreground">Opening {hostOf(frameTarget ?? "") || "page"} securely…</p></div></div>}
          <iframe ref={frameRef} key={frame.mode === "engine" ? "engine" : `${frame.mode}-${frameKey}`} title="PRIVATE Browser page" src={frame.src} onLoad={() => setLoading(false)} className="size-full border-0 bg-background" allow="fullscreen; clipboard-read; clipboard-write; autoplay" sandbox={frame.mode === "direct" ? DIRECT_SANDBOX : frame.mode === "loader" ? PROXY_SANDBOX : undefined} />
        </> : (
          <div className="flex size-full flex-col items-center overflow-auto px-5 pt-[12%] text-center [animation:rise_.35s_cubic-bezier(.22,1,.36,1)]">
            <div className="relative">
              <h2 className="font-['Orbitron',sans-serif] text-[clamp(2rem,6vw,3.4rem)] font-bold leading-none tracking-[.08em] text-primary [text-shadow:0_0_24px_color-mix(in_oklab,var(--primary)_40%,transparent)]">{nova ? "COMET" : "PRIVATE"}</h2>
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
            {recentSites.length > 0 && (
              <div className="mt-7 w-full max-w-xl text-left">
                <div className="mb-2 flex items-center justify-between px-1"><p className="text-[11px] font-semibold uppercase tracking-[.16em] text-muted-foreground">Recently visited</p><button type="button" onClick={() => setHistoryOpen(true)} className="text-[11px] text-primary hover:underline">See all history</button></div>
                <div className="grid gap-1 sm:grid-cols-2">
                  {recentSites.filter((item, index, list) => list.findIndex((other) => hostOf(other.url) === hostOf(item.url)) === index).slice(0, 6).map((item) => (
                    <button key={`${item.url}-${item.time}`} type="button" onClick={() => navigateTo(item.url)} className="flex min-w-0 items-center gap-2.5 rounded-xl px-3 py-2 text-left hover:bg-white/[.06]">
                      <SiteIcon host={hostOf(item.url)} />
                      <span className="min-w-0 truncate text-[12.5px]">{item.title || hostOf(item.url)}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
            <p className="mt-8 flex items-center gap-1.5 pb-6 text-[11px] text-muted-foreground"><ShieldCheck className="size-3.5 text-primary" />Shields on · trackers blocked · history and sign-ins stay on this device</p>
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

const FS_META_KEY = "pos-fs-meta";

// Last-modified times, keyed by path. Kept next to the file store so every app's saves get a date.
function readFsMeta(): Record<string, number> {
  try {
    const data = JSON.parse(localStorage.getItem(FS_META_KEY) ?? "{}") as Record<string, number>;
    return data && typeof data === "object" ? data : {};
  } catch {
    return {};
  }
}

// `moved` maps new paths to the old ones they came from, so moves and renames keep their dates.
function writeFs(fs: Record<string, FsNode>, moved?: Record<string, string>) {
  let ok = true;
  const prev = readFs();
  const meta = readFsMeta();
  const now = Date.now();
  try {
    localStorage.setItem(FS_KEY, JSON.stringify(fs));
  } catch {
    ok = false;
  }
  if (ok) {
    const next: Record<string, number> = {};
    for (const path of Object.keys(fs)) {
      const from = moved?.[path];
      if (from !== undefined) next[path] = meta[from] ?? now;
      else if (!(path in prev) || prev[path] !== fs[path]) {
        next[path] = now;
        for (let parent = path.slice(0, path.lastIndexOf("/")); parent; parent = parent.slice(0, parent.lastIndexOf("/"))) next[parent] = now;
      } else next[path] = next[path] ?? meta[path] ?? now;
    }
    for (const path of Object.keys(prev)) if (!(path in fs)) for (let parent = path.slice(0, path.lastIndexOf("/")); parent; parent = parent.slice(0, parent.lastIndexOf("/"))) if (parent in fs) next[parent] = now;
    try {
      localStorage.setItem(FS_META_KEY, JSON.stringify(next));
    } catch {
      // dates are a nice-to-have
    }
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

const KNOWN_FOLDERS = ["Desktop", "Downloads", "Documents", "Pictures", "Music", "Videos"];
type ExplorerView = "details" | "large" | "medium";
type ExplorerTab = { id: number; history: string[]; pos: number };
type ExplorerSort = { key: "name" | "date" | "type" | "size"; dir: 1 | -1 };

const joinPath = (dir: string, name: string) => `${dir === "/" ? "" : dir}/${name}`;
const parentPath = (path: string) => path.slice(0, path.lastIndexOf("/")) || "/";

function fsBytes(value: FsNode | undefined) {
  if (typeof value !== "string") return 0;
  if (value.startsWith("data:")) return Math.floor(((value.length - value.indexOf(",") - 1) * 3) / 4);
  return value.length;
}

const fmtBytes = (bytes: number) => `${Math.max(1, Math.ceil(bytes / 1024)).toLocaleString()} KB`;
const fmtWhen = (ms: number | undefined) => (ms ? new Date(ms).toLocaleString([], { month: "numeric", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" }).replace(",", "") : "");

const IMAGE_EXT = /\.(png|jpe?g|gif|webp|bmp|svg|avif)$/i;

// What Windows would call this file, and how to draw it.
function fileKind(path: string, folder: boolean): { type: string; app?: string; label?: string; color?: string } {
  if (folder) return { type: "File folder" };
  const ext = path.includes(".") ? path.slice(path.lastIndexOf(".") + 1).toLowerCase() : "";
  const upper = ext.toUpperCase();
  if (ext === "doc" || ext === "docx") return { type: "Private Word Document", app: "word" };
  if (ext === "xls" || ext === "xlsx") return { type: "Private Excel Worksheet", app: "excel" };
  if (ext === "csv") return { type: "CSV File", app: "excel" };
  if (ext === "ppt" || ext === "pptx") return { type: "Private PowerPoint Presentation", app: "powerpoint" };
  if (ext === "pdf") return { type: "PDF Document", label: "PDF", color: "#d93025" };
  if (ext === "txt") return { type: "Text Document" };
  if (ext === "md") return { type: "Markdown File", label: "MD", color: "#4b5563" };
  if (ext === "html" || ext === "htm") return { type: "HTML Document", label: "HTML", color: "#e34c26" };
  if (IMAGE_EXT.test(path)) return { type: `${upper} File`, label: upper, color: "#2f7ad1" };
  if (/^(mp3|wav|ogg|m4a|flac)$/.test(ext)) return { type: `${upper} File`, label: upper, color: "#e0570f" };
  if (/^(mp4|webm|mov|mkv)$/.test(ext)) return { type: `${upper} File`, label: upper, color: "#7a3fd1" };
  if (!ext) return { type: "File" };
  return { type: `${upper} File`, label: upper.slice(0, 4), color: "#6b7280" };
}

function ItemIcon({ path, value, className }: { path: string; value: FsNode | undefined; className: string }) {
  if (value === null) return <FolderGlyph className={className} kind={KNOWN_FOLDERS.includes(path.slice(1)) ? path.slice(1) : undefined} />;
  if (typeof value === "string" && value.startsWith("data:image")) return <span className={`grid place-items-center ${className}`}><img src={value} alt="" draggable={false} className="max-h-full max-w-full rounded-[3px] object-contain shadow-[0_1px_3px_rgb(0_0_0/.5)]" /></span>;
  const kind = fileKind(path, false);
  if (kind.app) return <AppImage tone="" src={kind.app} className={className} />;
  return <FileGlyph className={className} label={kind.label} color={kind.color} />;
}

function locLabel(loc: string) {
  if (loc === "home") return "Home";
  if (loc === "gallery") return "Gallery";
  if (loc === "pc") return "This PC";
  if (loc === "/") return "Local Disk (C:)";
  return baseName(loc);
}

function crumbsFor(loc: string): { label: string; loc: string }[] {
  if (!loc.startsWith("/")) return [{ label: locLabel(loc), loc }];
  const parts = loc.split("/").filter(Boolean);
  const out = [{ label: "This PC", loc: "pc" }];
  if (!parts.length || !KNOWN_FOLDERS.includes(parts[0]!)) out.push({ label: "Local Disk (C:)", loc: "/" });
  parts.forEach((part, i) => out.push({ label: part, loc: `/${parts.slice(0, i + 1).join("/")}` }));
  return out;
}

function TabIcon({ loc, className }: { loc: string; className: string }) {
  if (loc === "home") return <House className={`${className} text-[#60cdff]`} />;
  if (loc === "gallery") return <LuImages className={`${className} text-[#60cdff]`} />;
  if (loc === "pc") return <LuMonitor className={`${className} text-[#60cdff]`} />;
  if (loc === "/") return <LuHardDrive className={`${className} text-zinc-300`} />;
  return <FolderGlyph className={className} kind={KNOWN_FOLDERS.includes(loc.slice(1)) ? loc.slice(1) : undefined} />;
}

// Private Files, laid out like Windows 11 File Explorer.
function FilesWindow({ close, open }: { close: () => void; open: (id: string) => void }) {
  const fs = useFs();
  const [meta, setMeta] = useState<Record<string, number>>({});
  useEffect(() => setMeta(readFsMeta()), [fs]);
  useEffect(() => {
    const current = readFs();
    const missing = KNOWN_FOLDERS.filter((name) => !(`/${name}` in current));
    if (missing.length) writeFs({ ...current, ...Object.fromEntries(missing.map((name) => [`/${name}`, null])) });
  }, []);
  const [tabs, setTabs] = useState<ExplorerTab[]>([{ id: 1, history: ["home"], pos: 0 }]);
  const [activeTab, setActiveTab] = useState(1);
  const tab = tabs.find((item) => item.id === activeTab) ?? tabs[0]!;
  const loc = tab.history[tab.pos]!;
  const inDir = loc.startsWith("/");
  const here = inDir ? loc : "/Documents";
  const [selected, setSelected] = useState<string[]>([]);
  const anchor = useRef<string | null>(null);
  const [renaming, setRenaming] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [editingPath, setEditingPath] = useState<string | null>(null);
  const [view, setViewState] = useState<ExplorerView>(() => {
    try {
      const saved = localStorage.getItem("pos-explorer-view");
      return saved === "large" || saved === "medium" ? saved : "details";
    } catch {
      return "details";
    }
  });
  const setView = (next: ExplorerView) => {
    setViewState(next);
    try {
      localStorage.setItem("pos-explorer-view", next);
    } catch {
      // storage unavailable
    }
  };
  const [sort, setSort] = useState<ExplorerSort>({ key: "name", dir: 1 });
  const [clip, setClip] = useState<{ mode: "cut" | "copy"; paths: string[] } | null>(null);
  const [menu, setMenu] = useState<{ x: number; y: number; target: string | null } | null>(null);
  const [drop, setDrop] = useState<{ id: "new" | "sort" | "view" | "more"; x: number } | null>(null);
  const [details, setDetails] = useState(false);
  const [dropTarget, setDropTarget] = useState<string | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);
  const root = useRef<HTMLDivElement>(null);

  const go = (next: string) => {
    setTabs((list) => list.map((item) => (item.id === tab.id ? { ...item, history: [...item.history.slice(0, item.pos + 1), next], pos: item.pos + 1 } : item)));
    setSelected([]);
    setRenaming(null);
    setQuery("");
    setEditingPath(null);
  };
  const step = (delta: number) => {
    setTabs((list) => list.map((item) => (item.id === tab.id ? { ...item, pos: Math.max(0, Math.min(item.history.length - 1, item.pos + delta)) } : item)));
    setSelected([]);
    setQuery("");
  };
  const upLoc = loc === "home" ? null : !inDir ? "home" : loc === "/" || KNOWN_FOLDERS.includes(loc.slice(1)) ? "pc" : parentPath(loc);
  const newTab = () => {
    const id = Math.max(...tabs.map((item) => item.id)) + 1;
    setTabs((list) => [...list, { id, history: ["home"], pos: 0 }]);
    setActiveTab(id);
    setSelected([]);
  };
  const closeTab = (id: number) => {
    if (tabs.length === 1) return close();
    const index = tabs.findIndex((item) => item.id === id);
    const rest = tabs.filter((item) => item.id !== id);
    setTabs(rest);
    if (id === activeTab) setActiveTab(rest[Math.max(0, index - 1)]!.id);
  };

  const isFolder = (path: string) => fs[path] === null;
  const sorted = (paths: string[]) =>
    [...paths].sort((a, b) => {
      const fa = isFolder(a);
      const fb = isFolder(b);
      if (fa !== fb) return fa ? -1 : 1;
      let result = 0;
      if (sort.key === "date") result = (meta[a] ?? 0) - (meta[b] ?? 0);
      else if (sort.key === "type") result = fileKind(a, fa).type.localeCompare(fileKind(b, fb).type);
      else if (sort.key === "size") result = fsBytes(fs[a]) - fsBytes(fs[b]);
      else result = baseName(a).localeCompare(baseName(b), undefined, { numeric: true, sensitivity: "base" });
      return result * sort.dir || baseName(a).localeCompare(baseName(b));
    });
  const searching = query.trim().length > 0;
  const searchRoot = inDir ? loc : "/";
  const items = searching
    ? sorted(Object.keys(fs).filter((path) => path !== searchRoot && (searchRoot === "/" || path.startsWith(`${searchRoot}/`)) && baseName(path).toLowerCase().includes(query.trim().toLowerCase())))
    : inDir
      ? sorted(childrenOf(fs, loc))
      : loc === "gallery"
        ? Object.keys(fs).filter((path) => typeof fs[path] === "string" && IMAGE_EXT.test(path)).sort((a, b) => (meta[b] ?? 0) - (meta[a] ?? 0))
        : loc === "home"
          ? Object.keys(fs).filter((path) => typeof fs[path] === "string").sort((a, b) => (meta[b] ?? 0) - (meta[a] ?? 0)).slice(0, 20)
          : [];

  const uniqueName = (dir: string, name: string, files: Record<string, FsNode>, folder: boolean) => {
    if (!(joinPath(dir, name) in files)) return name;
    const dot = folder ? -1 : name.lastIndexOf(".");
    const stem = dot > 0 ? name.slice(0, dot) : name;
    const ext = dot > 0 ? name.slice(dot) : "";
    for (let i = 2; ; i += 1) if (!(joinPath(dir, `${stem} (${i})${ext}`) in files)) return `${stem} (${i})${ext}`;
  };
  const create = (kind: "folder" | "txt" | "doc") => {
    setDrop(null);
    setMenu(null);
    const current = { ...readFs() };
    const name = uniqueName(here, kind === "folder" ? "New folder" : kind === "txt" ? "New Text Document.txt" : "New Word Document.doc", current, kind === "folder");
    const path = joinPath(here, name);
    current[path] = kind === "folder" ? null : "";
    writeFs(current);
    if (!inDir) go(here);
    window.setTimeout(() => {
      setSelected([path]);
      setRenaming(path);
    }, 0);
  };
  const rename = (path: string, nextName: string) => {
    setRenaming(null);
    const clean = nextName.trim().replace(/[\\/:*?"<>|]/g, "");
    if (!clean || clean === baseName(path)) return;
    const target = joinPath(parentPath(path), clean);
    const current = readFs();
    if (target in current) return window.alert("There is already a file with the same name in this location.");
    const next: Record<string, FsNode> = {};
    const moved: Record<string, string> = {};
    for (const [key, value] of Object.entries(current)) {
      if (key === path || key.startsWith(`${path}/`)) {
        next[target + key.slice(path.length)] = value;
        moved[target + key.slice(path.length)] = key;
      } else next[key] = value;
    }
    writeFs(next, moved);
    setSelected([target]);
  };
  const removeItems = (paths: string[]) => {
    setMenu(null);
    if (!paths.length) return;
    if (!window.confirm(paths.length === 1 ? `Delete "${baseName(paths[0]!)}"? It can't be recovered.` : `Delete these ${paths.length} items? They can't be recovered.`)) return;
    const current = { ...readFs() };
    for (const key of Object.keys(current)) if (paths.some((path) => key === path || key.startsWith(`${path}/`))) delete current[key];
    writeFs(current);
    setSelected([]);
  };
  const paste = (into: string, source: { mode: "cut" | "copy"; paths: string[] } | null) => {
    setMenu(null);
    if (!source) return;
    const current = readFs();
    const next = { ...current };
    const moved: Record<string, string> = {};
    const pasted: string[] = [];
    for (const path of source.paths) {
      if (!(path in current) || into === path || into.startsWith(`${path}/`)) continue;
      const fromDir = parentPath(path);
      if (source.mode === "cut" && fromDir === into) continue;
      const folder = current[path] === null;
      let name = baseName(path);
      if (joinPath(into, name) in next) {
        if (source.mode === "copy" && fromDir === into) {
          const dot = folder ? -1 : name.lastIndexOf(".");
          name = dot > 0 ? `${name.slice(0, dot)} - Copy${name.slice(dot)}` : `${name} - Copy`;
        }
        name = uniqueName(into, name, next, folder);
      }
      const target = joinPath(into, name);
      for (const [key, value] of Object.entries(current)) {
        if (key !== path && !key.startsWith(`${path}/`)) continue;
        next[target + key.slice(path.length)] = value;
        if (source.mode === "cut") {
          moved[target + key.slice(path.length)] = key;
          delete next[key];
        }
      }
      pasted.push(target);
    }
    writeFs(next, moved);
    if (source.mode === "cut") setClip(null);
    setSelected(pasted);
  };
  const upload = (list: FileList | null, into = here) => {
    if (!list?.length) return;
    Array.from(list).forEach((file) => {
      const asText = file.type.startsWith("text/") || /\.(txt|md|json|csv|js|ts|tsx|html|css|xml|ya?ml|log)$/i.test(file.name);
      const reader = new FileReader();
      reader.onload = () => {
        const next = { ...readFs() };
        next[joinPath(into, uniqueName(into, file.name.replace(/\//g, ""), next, false))] = String(reader.result ?? "");
        if (!writeFs(next)) window.alert("Browser storage is full. Try a smaller file.");
      };
      if (asText) reader.readAsText(file);
      else reader.readAsDataURL(file);
    });
    if (!inDir) go(into);
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
  const openItem = (path: string) => {
    setMenu(null);
    if (isFolder(path)) go(path);
    else if (path in fs) openPathInApp(path, open);
  };
  const pick = (path: string, event: React.MouseEvent, list: string[]) => {
    if (event.shiftKey && anchor.current && list.includes(anchor.current)) {
      const a = list.indexOf(anchor.current);
      const b = list.indexOf(path);
      setSelected(list.slice(Math.min(a, b), Math.max(a, b) + 1));
      return;
    }
    anchor.current = path;
    if (event.ctrlKey || event.metaKey) setSelected((list2) => (list2.includes(path) ? list2.filter((item) => item !== path) : [...list2, path]));
    else setSelected([path]);
  };
  const local = (event: React.MouseEvent) => {
    const box = root.current?.getBoundingClientRect();
    return { x: event.clientX - (box?.left ?? 0), y: event.clientY - (box?.top ?? 0) };
  };
  const openMenu = (event: React.MouseEvent, target: string | null) => {
    event.preventDefault();
    event.stopPropagation();
    if (target && !selected.includes(target)) setSelected([target]);
    if (!target) setSelected([]);
    setDrop(null);
    setMenu({ ...local(event), target });
  };
  const toggleDrop = (id: "new" | "sort" | "view" | "more", event: React.MouseEvent) => {
    const box = (event.currentTarget as HTMLElement).getBoundingClientRect();
    const outer = root.current?.getBoundingClientRect();
    setMenu(null);
    setDrop((value) => (value?.id === id ? null : { id, x: box.left - (outer?.left ?? 0) }));
  };
  const onKey = (event: React.KeyboardEvent) => {
    if ((event.target as HTMLElement).closest("input, textarea")) return;
    const mod = event.ctrlKey || event.metaKey;
    if (event.key === "Delete") removeItems(selected);
    else if (event.key === "F2" && selected.length === 1) setRenaming(selected[0]!);
    else if (event.key === "Enter" && selected[0]) openItem(selected[0]);
    else if (event.key === "Backspace") step(-1);
    else if (mod && event.key.toLowerCase() === "a") setSelected(items);
    else if (mod && event.key.toLowerCase() === "c" && selected.length) setClip({ mode: "copy", paths: selected });
    else if (mod && event.key.toLowerCase() === "x" && selected.length) setClip({ mode: "cut", paths: selected });
    else if (mod && event.key.toLowerCase() === "v") paste(here, clip);
    else if (event.key === "Escape") {
      setSelected([]);
      setMenu(null);
      setDrop(null);
    } else return;
    event.preventDefault();
  };
  const dragProps = (path: string) => ({
    draggable: renaming !== path,
    onDragStart: (event: React.DragEvent) => event.dataTransfer.setData("application/x-pos-paths", JSON.stringify(selected.includes(path) ? selected : [path])),
    ...(isFolder(path)
      ? {
          onDragOver: (event: React.DragEvent) => {
            event.preventDefault();
            event.stopPropagation();
            setDropTarget(path);
          },
          onDragLeave: () => setDropTarget(null),
          onDrop: (event: React.DragEvent) => {
            event.preventDefault();
            event.stopPropagation();
            setDropTarget(null);
            const raw = event.dataTransfer.getData("application/x-pos-paths");
            if (raw) paste(path, { mode: "cut", paths: (JSON.parse(raw) as string[]).filter((item) => item !== path) });
            else upload(event.dataTransfer.files, path);
          },
        }
      : {}),
  });

  const selectedBytes = selected.reduce((total, path) => total + fsBytes(fs[path]), 0);
  const one = selected.length === 1 ? selected[0]! : null;
  const cutSet = clip?.mode === "cut" ? clip.paths : [];
  const usedBytes = (() => {
    try {
      return (localStorage.getItem(FS_KEY)?.length ?? 0) * 2;
    } catch {
      return 0;
    }
  })();

  const nameCell = (path: string, big: boolean) =>
    renaming === path ? (
      <input
        defaultValue={baseName(path)}
        aria-label="New name"
        ref={(el) => {
          if (el && !el.dataset["ready"]) {
            el.dataset["ready"] = "1";
            el.focus();
            const dot = isFolder(path) ? -1 : el.value.lastIndexOf(".");
            el.setSelectionRange(0, dot > 0 ? dot : el.value.length);
          }
        }}
        onClick={(event) => event.stopPropagation()}
        onDoubleClick={(event) => event.stopPropagation()}
        onBlur={(event) => rename(path, event.target.value)}
        onKeyDown={(event) => {
          event.stopPropagation();
          if (event.key === "Enter") rename(path, event.currentTarget.value);
          if (event.key === "Escape") setRenaming(null);
        }}
        className={`min-w-0 rounded-[3px] border border-[#60cdff] bg-[#1f1f1f] px-1 text-[12.5px] text-white outline-none ${big ? "w-full text-center" : "flex-1"}`}
      />
    ) : (
      <span className={big ? "line-clamp-2 break-words text-center" : "truncate"}>{baseName(path)}</span>
    );

  const detailsTable = (list: string[], extra?: "location") => (
    <table className="w-full table-fixed border-separate border-spacing-0 text-[12.5px]">
      <thead className="sticky top-0 z-10 bg-[#191919]">
        <tr className="text-left text-[12px] text-[#cfcfcf]">
          {([["name", "Name", "w-[44%]"], ["date", "Date modified", "w-[22%]"], [extra ? "location" : "type", extra ? "File location" : "Type", "w-[20%]"], ["size", "Size", "w-[14%]"]] as const).map(([key, label, width]) => (
            <th key={key} className={`${width} relative h-7 border-r border-white/[.06] px-2 font-normal last:border-r-0 hover:bg-white/[.04]`}>
              <button type="button" onClick={() => key !== "location" && setSort((value) => ({ key: key as ExplorerSort["key"], dir: value.key === key ? (value.dir === 1 ? -1 : 1) : 1 }))} className="flex w-full items-center">{label}</button>
              {sort.key === key && <ChevronUp className={`absolute left-1/2 top-0 size-3 -translate-x-1/2 text-[#9d9d9d] ${sort.dir === -1 ? "rotate-180" : ""}`} />}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {list.map((path) => {
          const folder = isFolder(path);
          const on = selected.includes(path);
          return (
            <tr
              key={path}
              {...dragProps(path)}
              onClick={(event) => { event.stopPropagation(); pick(path, event, list); }}
              onDoubleClick={() => openItem(path)}
              onContextMenu={(event) => openMenu(event, path)}
              className={`group h-8 cursor-default ${on ? "bg-white/[.09]" : "hover:bg-white/[.05]"} ${dropTarget === path ? "outline outline-1 -outline-offset-1 outline-[#60cdff]" : ""} ${cutSet.includes(path) ? "opacity-50" : ""}`}
            >
              <td className="rounded-l-[4px] px-2"><span className="flex min-w-0 items-center gap-2"><ItemIcon path={path} value={fs[path]} className="size-[18px] shrink-0" />{nameCell(path, false)}</span></td>
              <td className="truncate px-2 text-[#9d9d9d]">{fmtWhen(meta[path])}</td>
              <td className="truncate px-2 text-[#9d9d9d]">{extra ? crumbsFor(parentPath(path)).map((crumb) => crumb.label).join(" › ") : fileKind(path, folder).type}</td>
              <td className="truncate rounded-r-[4px] px-2 text-right text-[#9d9d9d]">{folder ? "" : fmtBytes(fsBytes(fs[path]))}</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );

  const iconGrid = (list: string[], size: "large" | "medium") => (
    <div className={`grid gap-1 ${size === "large" ? "grid-cols-[repeat(auto-fill,minmax(112px,1fr))]" : "grid-cols-[repeat(auto-fill,minmax(88px,1fr))]"}`}>
      {list.map((path) => {
        const on = selected.includes(path);
        return (
          <div
            key={path}
            {...dragProps(path)}
            onClick={(event) => { event.stopPropagation(); pick(path, event, list); }}
            onDoubleClick={() => openItem(path)}
            onContextMenu={(event) => openMenu(event, path)}
            className={`flex cursor-default flex-col items-center gap-1 rounded-[4px] border px-1.5 py-2 text-[12px] ${on ? "border-white/[.12] bg-white/[.09]" : "border-transparent hover:bg-white/[.05]"} ${dropTarget === path ? "border-[#60cdff]" : ""} ${cutSet.includes(path) ? "opacity-50" : ""}`}
          >
            <ItemIcon path={path} value={fs[path]} className={size === "large" ? "size-[72px]" : "size-12"} />
            {nameCell(path, true)}
          </div>
        );
      })}
    </div>
  );

  const folderTiles = (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(210px,1fr))] gap-1">
      {KNOWN_FOLDERS.map((name) => {
        const path = `/${name}`;
        const on = selected.includes(path);
        return (
          <div key={name} {...dragProps(path)} onClick={(event) => { event.stopPropagation(); setSelected([path]); }} onDoubleClick={() => go(path)} onContextMenu={(event) => openMenu(event, path)} className={`flex cursor-default items-center gap-3 rounded-[4px] px-2 py-1.5 ${on ? "bg-white/[.09]" : "hover:bg-white/[.05]"} ${dropTarget === path ? "outline outline-1 outline-[#60cdff]" : ""}`}>
            <FolderGlyph kind={name} className="size-12 shrink-0" />
            <span className="min-w-0 text-[12.5px]"><span className="block">{name}</span><span className="flex items-center gap-1 text-[11.5px] text-[#9d9d9d]">Stored locally<LuPin className="size-3" /></span></span>
          </div>
        );
      })}
    </div>
  );

  const section = (title: string, body: ReactNode) => (
    <section className="mb-4">
      <h3 className="mb-1.5 flex items-center gap-1 px-1 text-[13px] font-semibold text-white"><ChevronDown className="size-3.5 text-[#9d9d9d]" />{title}</h3>
      {body}
    </section>
  );

  const navItem = (target: string, label: string, icon: ReactNode, indent = false, pinned = false) => {
    const on = loc === target && !searching;
    return (
      <button
        key={target}
        type="button"
        onClick={() => go(target)}
        onDragOver={(event) => { if (target.startsWith("/")) { event.preventDefault(); setDropTarget(target); } }}
        onDragLeave={() => setDropTarget(null)}
        onDrop={(event) => {
          if (!target.startsWith("/")) return;
          event.preventDefault();
          setDropTarget(null);
          const raw = event.dataTransfer.getData("application/x-pos-paths");
          if (raw) paste(target, { mode: "cut", paths: JSON.parse(raw) as string[] });
          else upload(event.dataTransfer.files, target);
        }}
        className={`group relative flex h-8 w-full items-center gap-2.5 rounded-[4px] pr-2 text-left text-[12.5px] ${indent ? "pl-7" : "pl-3"} ${on ? "bg-white/[.09]" : "hover:bg-white/[.05]"} ${dropTarget === target ? "outline outline-1 -outline-offset-1 outline-[#60cdff]" : ""}`}
      >
        {on && <span className="absolute left-0 top-1/2 h-4 w-[3px] -translate-y-1/2 rounded-full bg-[#60cdff]" />}
        {icon}
        <span className="min-w-0 flex-1 truncate">{label}</span>
        {pinned && <LuPin className="size-3 text-[#9d9d9d] opacity-0 group-hover:opacity-100" />}
      </button>
    );
  };

  const cmd = "flex h-8 shrink-0 items-center gap-1.5 rounded-[4px] px-2 text-[12.5px] hover:bg-white/[.06] disabled:opacity-35 disabled:hover:bg-transparent";
  const icoBtn = "grid size-8 shrink-0 place-items-center rounded-[4px] hover:bg-white/[.06] disabled:opacity-35 disabled:hover:bg-transparent";
  const menuItem = (icon: ReactNode, label: string, onClick: () => void, opts: { disabled?: boolean; checked?: boolean; hint?: string } = {}) => (
    <button key={label} type="button" disabled={opts.disabled} onClick={() => { onClick(); setMenu(null); setDrop(null); }} className="flex h-8 w-full items-center gap-3 rounded-[4px] px-2.5 text-left text-[12.5px] hover:bg-white/[.07] disabled:opacity-40 disabled:hover:bg-transparent">
      <span className="grid w-4 place-items-center">{opts.checked ? <span className="size-1.5 rounded-full bg-white" /> : icon}</span>
      <span className="flex-1">{label}</span>
      {opts.hint && <span className="text-[11px] text-[#9d9d9d]">{opts.hint}</span>}
    </button>
  );
  const sep = (key: string) => <span key={key} className="my-1 block h-px bg-white/[.08]" />;
  const panel = "explorer-menu absolute z-40 rounded-lg border border-white/[.08] bg-[#2c2c2c] p-1 shadow-[0_8px_32px_rgb(0_0_0/.5)] [animation:rise_.14s_ease-out_both]";
  const viewItems = () => [
    menuItem(<LayoutGrid className="size-4" />, "Large icons", () => setView("large"), { checked: view === "large" }),
    menuItem(<LayoutGrid className="size-3.5" />, "Medium icons", () => setView("medium"), { checked: view === "medium" }),
    menuItem(<LuLayoutList className="size-4" />, "Details", () => setView("details"), { checked: view === "details" }),
  ];
  const sortItems = () =>
    ([["name", "Name"], ["date", "Date modified"], ["type", "Type"], ["size", "Size"]] as const).map(([key, label]) => menuItem(null, label, () => setSort((value) => ({ ...value, key })), { checked: sort.key === key }));
  const newItems = () => [
    menuItem(<FolderGlyph className="size-4" />, "Folder", () => create("folder")),
    sep("n1"),
    menuItem(<AppImage tone="" src="word" className="size-4" />, "Private Word Document", () => create("doc")),
    menuItem(<FileGlyph className="size-4" />, "Text Document", () => create("txt")),
  ];

  const body = (() => {
    if (searching) return items.length ? detailsTable(items, "location") : <p className="pt-16 text-center text-[12.5px] text-[#9d9d9d]">No items match your search.</p>;
    if (loc === "home") return <>{section("Quick access", folderTiles)}{section("Recent", items.length ? detailsTable(items, "location") : <p className="px-2 py-4 text-[12.5px] text-[#9d9d9d]">After you've opened some files, we'll show the most recent ones here.</p>)}</>;
    if (loc === "gallery") return items.length ? iconGrid(items, "large") : <p className="pt-16 text-center text-[12.5px] text-[#9d9d9d]">Pictures you add to Private Files show up here.</p>;
    if (loc === "pc")
      return (
        <>
          {section("Folders", folderTiles)}
          {section(
            "Devices and drives",
            <div onDoubleClick={() => go("/")} onClick={(event) => { event.stopPropagation(); setSelected(["/"]); }} className={`flex w-72 cursor-default items-center gap-3 rounded-[4px] px-2 py-2 ${selected.includes("/") ? "bg-white/[.09]" : "hover:bg-white/[.05]"}`}>
              <LuHardDrive className="size-11 shrink-0 text-zinc-300" strokeWidth={1.2} />
              <div className="min-w-0 flex-1 text-[12.5px]">
                <p>Local Disk (C:)</p>
                <span className="mt-1 block h-3.5 overflow-hidden border border-white/20 bg-[#3a3a3a]"><span className="block h-full bg-[#60cdff]" style={{ width: `${Math.min(100, Math.max(2, (usedBytes / (10 * 1024 * 1024)) * 100))}%` }} /></span>
                <p className="mt-0.5 text-[11.5px] text-[#9d9d9d]">{(Math.max(0, 10 * 1024 * 1024 - usedBytes) / 1048576).toFixed(1)} MB free of 10.0 MB</p>
              </div>
            </div>,
          )}
        </>
      );
    if (!items.length) return <p className="pt-16 text-center text-[12.5px] text-[#9d9d9d]">This folder is empty.</p>;
    return view === "details" ? detailsTable(items) : iconGrid(items, view);
  })();

  const crumbs = crumbsFor(loc);
  const bar = (
    <div className="flex h-full min-w-0 flex-1 items-end gap-0.5 pl-2 pt-1.5">
      {tabs.map((item) => {
        const tabLoc = item.history[item.pos]!;
        const on = item.id === tab.id;
        return (
          <div key={item.id} data-nodrag onClick={() => { setActiveTab(item.id); setSelected([]); }} className={`group relative flex h-full w-[min(240px,30vw)] min-w-[110px] cursor-default items-center gap-2 rounded-t-lg pl-3 pr-1.5 text-[12px] ${on ? "bg-[#2b2b2b] text-white" : "text-[#cfcfcf] hover:bg-white/[.05]"}`}>
            <TabIcon loc={tabLoc} className="size-4 shrink-0" />
            <span className="min-w-0 flex-1 truncate">{locLabel(tabLoc)}</span>
            <button type="button" aria-label="Close tab" onClick={(event) => { event.stopPropagation(); closeTab(item.id); }} className="grid size-6 place-items-center rounded hover:bg-white/10"><X className="size-3.5" /></button>
          </div>
        );
      })}
      <button type="button" aria-label="New tab" title="Add new tab (Ctrl+T)" onClick={newTab} className="mb-1 grid size-7 place-items-center rounded hover:bg-white/[.08]"><Plus className="size-4" /></button>
    </div>
  );

  return (
    <WindowFrame title={`${locLabel(loc)} - File Explorer`} icon={FolderIcon} close={close} bar={{ className: "explorer-bar bg-[#202020] text-white", content: bar }}>
      <div
        ref={root}
        tabIndex={-1}
        onKeyDown={onKey}
        onPointerDown={(event) => { if (!(event.target as HTMLElement).closest("[data-drop]")) setDrop(null); }}
        className="explorer relative flex min-h-0 flex-1 flex-col bg-[#191919] text-white outline-none"
        style={{ fontFamily: "'Segoe UI Variable Text','Segoe UI',system-ui,sans-serif", colorScheme: "dark" }}
      >
        <div className="flex h-12 shrink-0 items-center gap-1 bg-[#2b2b2b] px-2">
          <button type="button" aria-label="Back" title="Back (Alt+Left)" disabled={tab.pos === 0} onClick={() => step(-1)} className={icoBtn}><ArrowLeft className="size-4" /></button>
          <button type="button" aria-label="Forward" title="Forward (Alt+Right)" disabled={tab.pos >= tab.history.length - 1} onClick={() => step(1)} className={icoBtn}><ArrowRight className="size-4" /></button>
          <button type="button" aria-label="Up" title="Up to parent folder" disabled={!upLoc} onClick={() => upLoc && go(upLoc)} className={icoBtn}><LuArrowUp className="size-4" /></button>
          <button type="button" aria-label="Refresh" title="Refresh" onClick={() => setMeta(readFsMeta())} className={icoBtn}><RotateCw className="size-4" /></button>
          {editingPath !== null ? (
            <input
              autoFocus
              aria-label="Address"
              value={editingPath}
              onChange={(event) => setEditingPath(event.target.value)}
              onBlur={() => setEditingPath(null)}
              onKeyDown={(event) => {
                if (event.key === "Escape") setEditingPath(null);
                if (event.key !== "Enter") return;
                const raw = editingPath.trim().replace(/\\/g, "/").replace(/^c:/i, "").replace(/\/+$/, "") || "/";
                const target = raw.startsWith("/") ? raw : `/${raw}`;
                if (target === "/" || fs[target] === null) go(target);
                else window.alert(`Windows can't find '${editingPath}'. Check the spelling and try again.`);
              }}
              className="mx-1 h-8 min-w-0 flex-1 rounded-[4px] border-b-2 border-[#60cdff] bg-[#1f1f1f] px-3 text-[12.5px] outline-none"
            />
          ) : (
            <div onClick={(event) => { if (event.target === event.currentTarget) setEditingPath(inDir ? `C:${loc === "/" ? "\\" : loc.replace(/\//g, "\\")}` : locLabel(loc)); }} className="mx-1 flex h-8 min-w-0 flex-1 cursor-text items-center gap-0.5 overflow-hidden rounded-[4px] bg-[#1f1f1f] px-1.5 text-[12.5px] hover:bg-[#252525]">
              <TabIcon loc={loc} className="mx-1 size-4 shrink-0" />
              {crumbs.map((crumb, i) => (
                <span key={crumb.loc} className="flex shrink-0 items-center">
                  <ChevronRight className="size-3.5 text-[#9d9d9d]" />
                  <button type="button" onClick={() => go(crumb.loc)} className={`rounded px-1.5 py-1 hover:bg-white/[.07] ${i === crumbs.length - 1 ? "text-white" : "text-[#cfcfcf]"}`}>{crumb.label}</button>
                </span>
              ))}
            </div>
          )}
          <label className="hidden h-8 w-56 items-center gap-2 rounded-[4px] bg-[#1f1f1f] px-3 text-[12.5px] focus-within:border-b-2 focus-within:border-[#60cdff] md:flex lg:w-72">
            <input value={query} onChange={(event) => { setQuery(event.target.value); setSelected([]); }} placeholder={`Search ${locLabel(loc)}`} aria-label="Search" className="min-w-0 flex-1 bg-transparent outline-none placeholder:text-[#9d9d9d]" />
            <Search className="size-4 text-[#cfcfcf]" />
          </label>
        </div>
        <div className="flex h-12 shrink-0 items-center gap-0.5 overflow-x-auto border-b border-black/40 bg-[#2b2b2b] px-2">
          <button type="button" data-drop onClick={(event) => toggleDrop("new", event)} className={`${cmd} pr-1.5`}><LuCirclePlus className="size-[18px] text-[#60cdff]" />New<ChevronDown className="size-3.5" /></button>
          <span className="mx-1.5 h-6 w-px bg-white/[.1]" />
          <button type="button" aria-label="Cut" title="Cut (Ctrl+X)" disabled={!selected.length || !inDir} onClick={() => setClip({ mode: "cut", paths: selected })} className={icoBtn}><LuScissors className="size-[18px]" /></button>
          <button type="button" aria-label="Copy" title="Copy (Ctrl+C)" disabled={!selected.length} onClick={() => setClip({ mode: "copy", paths: selected })} className={icoBtn}><LuCopy className="size-[18px]" /></button>
          <button type="button" aria-label="Paste" title="Paste (Ctrl+V)" disabled={!clip} onClick={() => paste(here, clip)} className={icoBtn}><LuClipboardPaste className="size-[18px]" /></button>
          <button type="button" aria-label="Rename" title="Rename (F2)" disabled={!one || !inDir} onClick={() => one && setRenaming(one)} className={icoBtn}><LuTextCursorInput className="size-[18px]" /></button>
          <button type="button" aria-label="Download" title="Download" disabled={!one || isFolder(one)} onClick={() => one && download(one)} className={icoBtn}><Download className="size-[18px]" /></button>
          <button type="button" aria-label="Delete" title="Delete (Delete)" disabled={!selected.length || selected.includes("/")} onClick={() => removeItems(selected)} className={icoBtn}><LuTrash2 className="size-[18px]" /></button>
          <span className="mx-1.5 h-6 w-px bg-white/[.1]" />
          <button type="button" data-drop onClick={(event) => toggleDrop("sort", event)} className={cmd}><LuArrowUpDown className="size-[18px]" />Sort<ChevronDown className="size-3.5" /></button>
          <button type="button" data-drop onClick={(event) => toggleDrop("view", event)} className={cmd}><LuLayoutList className="size-[18px]" />View<ChevronDown className="size-3.5" /></button>
          <button type="button" aria-label="See more" title="See more" data-drop onClick={(event) => toggleDrop("more", event)} className={icoBtn}><LuEllipsis className="size-[18px]" /></button>
          <button type="button" onClick={() => setDetails((value) => !value)} className={`${cmd} ml-auto ${details ? "bg-white/[.08]" : ""}`}><LuPanelRight className="size-[18px]" />Details</button>
          <input ref={fileInput} type="file" multiple hidden onChange={(event) => { upload(event.target.files); event.target.value = ""; }} />
        </div>
        <div className="flex min-h-0 flex-1">
          <nav className="hidden w-52 shrink-0 overflow-y-auto border-r border-white/[.06] px-1.5 py-2 md:block lg:w-56">
            {navItem("home", "Home", <House className="size-4 shrink-0 text-[#60cdff]" />)}
            {navItem("gallery", "Gallery", <LuImages className="size-4 shrink-0 text-[#60cdff]" />)}
            <span className="mx-2 my-2 block h-px bg-white/[.08]" />
            {KNOWN_FOLDERS.map((name) => navItem(`/${name}`, name, <FolderGlyph kind={name} className="size-[18px] shrink-0" />, false, true))}
            <span className="mx-2 my-2 block h-px bg-white/[.08]" />
            {navItem("pc", "This PC", <LuMonitor className="size-4 shrink-0 text-[#60cdff]" />)}
            {navItem("/", "Local Disk (C:)", <LuHardDrive className="size-4 shrink-0 text-zinc-300" />, true)}
          </nav>
          <div
            className="min-w-0 flex-1 overflow-auto px-3 py-2"
            onClick={() => { setSelected([]); setMenu(null); }}
            onContextMenu={(event) => openMenu(event, null)}
            onDragOver={(event) => { if (inDir) event.preventDefault(); }}
            onDrop={(event) => {
              if (!inDir) return;
              event.preventDefault();
              const raw = event.dataTransfer.getData("application/x-pos-paths");
              if (!raw) upload(event.dataTransfer.files);
            }}
          >
            {body}
          </div>
          {details && (
            <aside className="hidden w-64 shrink-0 overflow-y-auto border-l border-white/[.06] p-4 text-[12.5px] sm:block">
              {one && one in fs ? (
                <>
                  <div className="grid h-36 place-items-center"><ItemIcon path={one} value={fs[one]} className="size-28" /></div>
                  <p className="mt-2 break-words text-[14px] font-semibold">{baseName(one)}</p>
                  <p className="text-[#9d9d9d]">{fileKind(one, isFolder(one)).type}</p>
                  <dl className="mt-4 space-y-2">
                    {!isFolder(one) && <div><dt className="text-[#9d9d9d]">Size</dt><dd>{fmtBytes(fsBytes(fs[one]))}</dd></div>}
                    {isFolder(one) && <div><dt className="text-[#9d9d9d]">Contains</dt><dd>{childrenOf(fs, one).length} items</dd></div>}
                    <div><dt className="text-[#9d9d9d]">Date modified</dt><dd>{fmtWhen(meta[one]) || "Unknown"}</dd></div>
                    <div><dt className="text-[#9d9d9d]">Location</dt><dd className="break-words">C:{parentPath(one).replace(/\//g, "\\")}</dd></div>
                  </dl>
                </>
              ) : (
                <p className="pt-10 text-center text-[#9d9d9d]">{selected.length > 1 ? `${selected.length} items selected` : "Select a single file to get more information."}</p>
              )}
            </aside>
          )}
        </div>
        <div className="flex h-7 shrink-0 items-center gap-5 bg-[#191919] px-3 text-[12px] text-[#cfcfcf]">
          <span>{loc === "pc" ? 7 : loc === "home" && !searching ? KNOWN_FOLDERS.length + items.length : items.length} items</span>
          {selected.length > 0 && <span>{selected.length} item{selected.length === 1 ? "" : "s"} selected{selectedBytes ? `  ${fmtBytes(selectedBytes)}` : ""}</span>}
          {clip && <span className="text-[#9d9d9d]">{clip.paths.length} item{clip.paths.length === 1 ? "" : "s"} on the clipboard</span>}
          <span className="ml-auto flex items-center gap-0.5">
            <button type="button" aria-label="Details view" title="Displays information about each item in the window." onClick={() => setView("details")} className={`grid size-6 place-items-center rounded ${view === "details" ? "bg-white/[.1]" : "hover:bg-white/[.05]"}`}><LuLayoutList className="size-3.5" /></button>
            <button type="button" aria-label="Large icons view" title="Displays items by using large thumbnails." onClick={() => setView("large")} className={`grid size-6 place-items-center rounded ${view === "large" ? "bg-white/[.1]" : "hover:bg-white/[.05]"}`}><LayoutGrid className="size-3.5" /></button>
          </span>
        </div>
        {drop && (
          <div className={`${panel} top-[5.6rem] w-60`} style={{ left: Math.max(4, drop.x) }} onPointerDown={(event) => event.stopPropagation()}>
            {drop.id === "new" && newItems()}
            {drop.id === "sort" && <>{sortItems()}{sep("s1")}{menuItem(null, "Ascending", () => setSort((value) => ({ ...value, dir: 1 })), { checked: sort.dir === 1 })}{menuItem(null, "Descending", () => setSort((value) => ({ ...value, dir: -1 })), { checked: sort.dir === -1 })}</>}
            {drop.id === "view" && viewItems()}
            {drop.id === "more" && (
              <>
                {menuItem(<Upload className="size-4" />, "Upload files", () => fileInput.current?.click())}
                {menuItem(<LuCheckCheck className="size-4" />, "Select all", () => setSelected(items), { hint: "Ctrl+A" })}
                {menuItem(<X className="size-4" />, "Select none", () => setSelected([]))}
                {menuItem(<LuFlipHorizontal className="size-4" />, "Invert selection", () => setSelected(items.filter((path) => !selected.includes(path))))}
              </>
            )}
          </div>
        )}
        {menu && (
          <>
            <div className="absolute inset-0 z-30" onPointerDown={() => setMenu(null)} onContextMenu={(event) => { event.preventDefault(); setMenu(null); }} />
            <div className={`${panel} w-64`} style={{ left: Math.min(menu.x, (root.current?.clientWidth ?? 600) - 264), top: Math.min(menu.y, (root.current?.clientHeight ?? 400) - (menu.target ? 230 : 330)) }}>
              {menu.target ? (
                <>
                  <div className="mb-1 flex justify-around border-b border-white/[.08] pb-1">
                    <button type="button" aria-label="Cut" title="Cut" disabled={!inDir} onClick={() => { setClip({ mode: "cut", paths: selected }); setMenu(null); }} className={icoBtn}><LuScissors className="size-4" /></button>
                    <button type="button" aria-label="Copy" title="Copy" onClick={() => { setClip({ mode: "copy", paths: selected }); setMenu(null); }} className={icoBtn}><LuCopy className="size-4" /></button>
                    <button type="button" aria-label="Rename" title="Rename" disabled={selected.length !== 1 || menu.target === "/"} onClick={() => { setRenaming(menu.target); setMenu(null); }} className={icoBtn}><LuTextCursorInput className="size-4" /></button>
                    <button type="button" aria-label="Delete" title="Delete" disabled={menu.target === "/"} onClick={() => removeItems(selected)} className={icoBtn}><LuTrash2 className="size-4" /></button>
                  </div>
                  {menuItem(<LuFolderOpen className="size-4" />, "Open", () => openItem(menu.target!), { hint: "Enter" })}
                  {isFolder(menu.target) && menuItem(<Plus className="size-4" />, "Open in new tab", () => { const id = Math.max(...tabs.map((item) => item.id)) + 1; setTabs((list) => [...list, { id, history: [menu.target!], pos: 0 }]); setActiveTab(id); })}
                  {!isFolder(menu.target) && menu.target !== "/" && menuItem(<Download className="size-4" />, "Download", () => download(menu.target!))}
                  {isFolder(menu.target) && clip && menuItem(<LuClipboardPaste className="size-4" />, "Paste into folder", () => paste(menu.target!, clip))}
                  {sep("m1")}
                  {menuItem(<Info className="size-4" />, "Properties", () => setDetails(true), { hint: "Alt+Enter" })}
                </>
              ) : (
                <>
                  <p className="px-2.5 pb-0.5 pt-1 text-[11px] text-[#9d9d9d]">View</p>
                  {viewItems()}
                  <p className="px-2.5 pb-0.5 pt-1 text-[11px] text-[#9d9d9d]">Sort by</p>
                  {sortItems()}
                  {sep("b1")}
                  {menuItem(<RotateCw className="size-4" />, "Refresh", () => setMeta(readFsMeta()))}
                  {menuItem(<LuClipboardPaste className="size-4" />, "Paste", () => paste(here, clip), { disabled: !clip, hint: "Ctrl+V" })}
                  {menuItem(<Upload className="size-4" />, "Upload files", () => fileInput.current?.click())}
                  {sep("b2")}
                  {newItems()}
                </>
              )}
            </div>
          </>
        )}
      </div>
    </WindowFrame>
  );
}

// Private OneNote: each page is a text file in a folder (the section), saved as you type.
function NotesApp({ close }: { close: () => void }) {
  const brand = OFFICE.onenote;
  const fs = useFs();
  const [path, setPath] = useState("/Documents/note.txt");
  const [text, setText] = useState(() => {
    const value = readFs()["/Documents/note.txt"];
    return typeof value === "string" ? value : "";
  });
  const [tab, setTab] = useState("Home");
  const [msg, setMsg] = useState("");
  const [search, setSearch] = useState("");
  const [rev, setRev] = useState(0);
  const area = useRef<HTMLTextAreaElement>(null);
  const section = parentPath(path);
  const meta = useMemo(() => readFsMeta(), [fs]);
  const isPage = (file: string) => typeof fs[file] === "string" && !fs[file]!.startsWith("data:") && /\.(txt|md)$/i.test(file);
  const pages = childrenOf(fs, section).filter(isPage).filter((file) => !search || baseName(file).toLowerCase().includes(search.toLowerCase()) || String(fs[file]).toLowerCase().includes(search.toLowerCase()));
  const sections = Object.keys(fs).filter((dir) => fs[dir] === null && childrenOf(fs, dir).some(isPage)).sort();
  if (!sections.includes(section)) sections.unshift(section);
  const openPage = (next: string) => {
    const value = readFs()[next];
    setPath(next);
    setText(typeof value === "string" ? value : "");
    setRev(0);
  };
  useEffect(() => {
    const pull = () => {
      try {
        const next = localStorage.getItem("pos-note-path");
        if (!next) return;
        localStorage.removeItem("pos-note-path");
        openPage(next);
      } catch {
        // storage unavailable
      }
    };
    pull();
    window.addEventListener("pos-note", pull);
    return () => window.removeEventListener("pos-note", pull);
  }, []);
  const saveNow = (value = text) => {
    const current = { ...readFs() };
    if (section !== "/" && current[section] !== null) current[section] = null;
    current[path] = value;
    const ok = writeFs(current);
    setMsg(ok ? "" : "Browser storage is full.");
    return ok;
  };
  useEffect(() => {
    if (rev === 0) return;
    const timer = window.setTimeout(() => saveNow(), 600);
    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rev]);
  const type = (value: string) => {
    setText(value);
    setRev((n) => n + 1);
  };
  const addPage = () => {
    const current = readFs();
    let n = 1;
    while (`${joinPath(section, `Untitled page${n > 1 ? ` ${n}` : ""}`)}.txt` in current) n += 1;
    const next = `${joinPath(section, `Untitled page${n > 1 ? ` ${n}` : ""}`)}.txt`;
    writeFs({ ...current, [next]: "" });
    openPage(next);
    window.setTimeout(() => area.current?.focus(), 0);
  };
  const deletePage = () => {
    if (!window.confirm(`Delete the page "${baseName(path).replace(/\.[^.]+$/, "")}"?`)) return;
    const current = { ...readFs() };
    delete current[path];
    writeFs(current);
    const rest = childrenOf(current, section).filter((file) => typeof current[file] === "string" && /\.(txt|md)$/i.test(file));
    if (rest[0]) openPage(rest[0]);
    else {
      setPath(joinPath(section, "note.txt"));
      setText("");
    }
  };
  const renamePage = (title: string) => {
    const clean = title.trim().replace(/[\\/:*?"<>|]/g, "");
    if (!clean) return;
    const ext = path.slice(path.lastIndexOf("."));
    const target = joinPath(section, `${clean}${ext}`);
    if (target === path) return;
    const current = readFs();
    if (target in current) return setMsg("A page with that name already exists.");
    const next: Record<string, FsNode> = {};
    for (const [key, value] of Object.entries(current)) if (key !== path) next[key] = value;
    next[target] = text;
    writeFs(next, { [target]: path });
    setPath(target);
  };
  const insert = (snippet: string) => {
    const el = area.current;
    if (!el) return type(text + snippet);
    const start = el.selectionStart;
    const next = text.slice(0, start) + snippet + text.slice(el.selectionEnd);
    type(next);
    window.setTimeout(() => {
      el.focus();
      el.setSelectionRange(start + snippet.length, start + snippet.length);
    }, 0);
  };
  const when = meta[path] ? new Date(meta[path]!) : new Date();
  const title = baseName(path).replace(/\.[^.]+$/, "");
  const ribbon: Record<string, ReactNode> = {
    Home: (
      <>
        <RGroup label="Pages">
          <RBig icon={LuSquarePlus} label="New Page" color={brand.color} onClick={addPage} />
          <RBig icon={LuTrash2} label="Delete Page" onClick={deletePage} />
        </RGroup>
        <RGroup label="Tags">
          <RStack>
            <RSmall icon={LuSquareCheck} label="To Do" onClick={() => insert("☐ ")} className="justify-start" />
            <RSmall icon={Star} label="Important" color="#e0a800" onClick={() => insert("★ ")} className="justify-start" />
            <RSmall icon={Info} label="Question" color="#7719aa" onClick={() => insert("? ")} className="justify-start" />
          </RStack>
        </RGroup>
        <RGroup label="Save">
          <RBig icon={Download} label="Download" onClick={() => downloadBlob(baseName(path), new Blob([text], { type: "text/plain" }))} />
        </RGroup>
      </>
    ),
    Insert: (
      <>
        <RGroup label="Time Stamp">
          <RBig icon={LuCalendar} label="Date" color={brand.color} onClick={() => insert(new Date().toLocaleDateString([], { dateStyle: "long" }))} />
          <RBig icon={LuClock} label="Time" color={brand.color} onClick={() => insert(new Date().toLocaleTimeString([], { timeStyle: "short" }))} />
          <RBig icon={LuCalendarClock} label="Date & Time" color={brand.color} onClick={() => insert(new Date().toLocaleString([], { dateStyle: "long", timeStyle: "short" }))} />
        </RGroup>
        <RGroup label="Insert">
          <RBig icon={Minus} label="Divider" onClick={() => insert("\n────────────────────\n")} />
        </RGroup>
      </>
    ),
    View: (
      <RGroup label="Pages">
        <RBig icon={LuSquarePlus} label="New Page" color={brand.color} onClick={addPage} />
      </RGroup>
    ),
  };
  return (
    <WindowFrame
      title={`${title} - Private OneNote`}
      icon={NotesIcon}
      close={close}
      bar={{ className: "text-white", style: { background: brand.color }, content: <OfficeTitle brand={brand} icon={NotesIcon} name={title} status="Saved" search={search} onSearch={setSearch} /> }}
    >
      <div className="office relative flex min-h-0 flex-1 flex-col bg-[#f3f3f3] text-zinc-900" style={{ "--office": brand.color, colorScheme: "light", fontFamily: "'Segoe UI Variable Text','Segoe UI',system-ui,sans-serif" } as React.CSSProperties}>
        <Ribbon brand={brand} tabs={["Home", "Insert", "View"]} tab={tab} setTab={setTab} onFile={addPage}>{ribbon[tab]}</Ribbon>
        <div className="flex min-h-0 flex-1 border-t border-black/[.06]">
          <div className="hidden w-44 shrink-0 flex-col overflow-y-auto border-r border-black/[.08] bg-[#f7f2fa] py-2 sm:flex">
            <p className="px-3 pb-1 text-[11px] font-semibold uppercase tracking-wide text-zinc-500">Sections</p>
            {sections.map((dir) => (
              <button key={dir} type="button" onClick={() => { const first = childrenOf(fs, dir).filter(isPage)[0]; if (first) openPage(first); else { setPath(joinPath(dir, "note.txt")); setText(""); } }} className={`flex items-center gap-2 border-l-4 px-3 py-1.5 text-left text-[13px] ${dir === section ? "bg-white font-semibold" : "border-transparent hover:bg-white/60"}`} style={dir === section ? { borderLeftColor: brand.color } : undefined}>
                <span className="size-2.5 shrink-0 rounded-sm" style={{ background: ["#7719aa", "#1f8f4e", "#2f7ad1", "#e0570f", "#c43e1c"][sections.indexOf(dir) % 5] }} />
                <span className="truncate">{dir === "/" ? "Quick Notes" : baseName(dir)}</span>
              </button>
            ))}
          </div>
          <div className="hidden w-56 shrink-0 flex-col border-r border-black/[.08] bg-white md:flex">
            <button type="button" onClick={addPage} className="flex items-center gap-2 border-b border-black/[.06] px-3 py-2 text-[13px] hover:bg-zinc-50" style={{ color: brand.color }}><Plus className="size-4" />Add page</button>
            <div className="min-h-0 flex-1 overflow-y-auto">
              {pages.length === 0 && <p className="px-3 py-4 text-[12px] text-zinc-500">{search ? "No pages match." : "No pages yet."}</p>}
              {pages.map((file) => (
                <button key={file} type="button" onClick={() => openPage(file)} className={`block w-full border-b border-black/[.04] px-3 py-2 text-left ${file === path ? "bg-[#eadcf3]" : "hover:bg-zinc-50"}`}>
                  <span className="block truncate text-[13px] font-semibold">{baseName(file).replace(/\.[^.]+$/, "")}</span>
                  <span className="block truncate text-[11.5px] text-zinc-500">{String(fs[file]).split("\n").find((line) => line.trim()) || "No additional text"}</span>
                </button>
              ))}
            </div>
          </div>
          <div className="min-w-0 flex-1 overflow-auto bg-white px-10 py-8">
            <input key={path} aria-label="Page title" defaultValue={title} onBlur={(event) => renamePage(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") area.current?.focus(); }} className="w-full max-w-xl border-b border-zinc-300 pb-1 text-[26px] font-light outline-none focus:border-[var(--office)]" style={{ fontFamily: docFont }} />
            <p className="mt-1.5 text-[12px] text-zinc-500">{when.toLocaleDateString([], { weekday: "long", month: "long", day: "numeric", year: "numeric" })}&nbsp;&nbsp;&nbsp;{when.toLocaleTimeString([], { timeStyle: "short" })}</p>
            <textarea ref={area} value={text} onChange={(event) => type(event.target.value)} placeholder="Start typing your note…" spellCheck className="mt-5 min-h-[50vh] w-full resize-none text-[14.5px] leading-relaxed text-zinc-900 outline-none placeholder:text-zinc-400" style={{ fontFamily: docFont }} />
          </div>
        </div>
        {msg && <p className="absolute bottom-2 right-3 rounded bg-white px-2 py-1 text-[11px] text-red-700 shadow">{msg}</p>}
      </div>
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

type OsSettings = { blur: number; dim: number; lockBlur: number; lockDim: number; clock24: boolean; widgets: string[]; wpos: Record<string, { x: number; y: number }>; desktop: string[]; railHidden: boolean; hubHidden: boolean; bigIcons: boolean; dockPos: "bottom" | "top" | "right"; theme: string; accent: string; scrollAccent: string; particles: boolean; ambient: boolean; reduceMotion: boolean; nativeCursor: boolean; glassBlur: number; glassOpacity: number; dockScale: number; showDate: boolean; showIcons: boolean; slideshow: number; dockPins: string[]; dockAutoHide: boolean; timeZone: string; worldClocks: string[]; titleButtons: "compact" | "comfortable" | "large"; autoLock: number; weekStart: number; desktopLabels: boolean; skipStart: boolean; uiStyle: "classic" | "modern"; uiSounds: boolean; soundHover: boolean; soundClick: boolean; soundVolume: number; lite: boolean; onboarded: boolean; userName: string; dockStyle: "taskbar" | "floating"; dockOpacity: number; dockLiquid: boolean; edition: "private" | "nova"; novaTheme: string; novaPhoto: boolean; novaWall: string; novaWallDim: number; novaParallax: boolean; novaMagnify: boolean; novaHotCorner: boolean; novaNight: boolean; novaFocus: boolean; novaBright: number; novaPins: string[]; novaGreet: "hello" | "clock" | "off"; novaGreetPos: "left" | "center"; novaIcons: string[]; novaWidgets: string[]; novaDockSize: number; novaDockHide: boolean; novaIsland: boolean; novaGlass: "clear" | "frosted" | "solid"; novaShuffle: number; novaCustom: string[]; novaSaver: number };
const DEFAULT_SETTINGS: OsSettings = { blur: 0, dim: 15, lockBlur: 8, lockDim: 65, clock24: true, widgets: [], wpos: {}, desktop: ["files", "browser", "notes", "photos"], railHidden: true, hubHidden: true, bigIcons: false, dockPos: "bottom", theme: "private", accent: "", scrollAccent: "", particles: true, ambient: true, reduceMotion: false, nativeCursor: false, glassBlur: 42, glassOpacity: 0, dockScale: 100, showDate: true, showIcons: true, slideshow: 0, dockPins: ["browser", "files", "notes", "calc", "figure", "settings"], dockAutoHide: false, timeZone: "", worldClocks: [], titleButtons: "comfortable", autoLock: 0, weekStart: 0, desktopLabels: true, skipStart: false, uiStyle: "classic", uiSounds: true, soundHover: true, soundClick: true, soundVolume: 40, lite: false, onboarded: false, userName: "", dockStyle: "taskbar", dockOpacity: 70, dockLiquid: false, edition: "private", novaTheme: "aurora", novaPhoto: false, novaWall: "aurora", novaWallDim: 0, novaParallax: true, novaMagnify: true, novaHotCorner: true, novaNight: false, novaFocus: false, novaBright: 100, novaPins: NOVA_PINS, novaGreet: "hello", novaGreetPos: "left", novaIcons: [], novaWidgets: [], novaDockSize: 44, novaDockHide: false, novaIsland: true, novaGlass: "frosted", novaShuffle: 0, novaCustom: NOVA_CUSTOM_DEFAULT, novaSaver: 5 };
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
    ["Channel", RELEASE_LABEL],
    ["Build", BUILD],
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
                <CfgCard title="Operating system">
                  <p className="text-[10px] text-muted-foreground">Both have every app and keep your files. Switching keeps your windows open.</p>
                  <div className="grid grid-cols-2 gap-3">
                    {([["private", "PRIVATE OS", "The classic desktop with a Windows-style taskbar."], ["nova", "NOVA OS", "Reimagined: live wallpapers, Dynamic Island, Overview, new apps."]] as const).map(([id, label, sub]) => {
                      const on = settings.edition === id;
                      return (
                        <button key={id} type="button" aria-pressed={on} onClick={() => { if (!on) { log(`Switching to ${label}`); patch({ edition: id }); } }} className={`fx-card rounded-2xl border p-2.5 text-left ${on ? "border-primary bg-primary/10" : "border-white/10 bg-black/20"}`}>
                          <OsPreview kind={id} />
                          <p className="mt-2 text-xs font-bold">{label}{on ? " ✓" : ""}</p>
                          <p className="text-[10px] leading-snug text-muted-foreground">{sub}</p>
                        </button>
                      );
                    })}
                  </div>
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

// Recent files for an Office app's File page, newest first.
function officeRecent(fs: Record<string, FsNode>, pattern: RegExp) {
  const meta = readFsMeta();
  return Object.keys(fs)
    .filter((path) => typeof fs[path] === "string" && pattern.test(path))
    .sort((a, b) => (meta[b] ?? 0) - (meta[a] ?? 0))
    .slice(0, 12)
    .map((path) => ({ name: baseName(path), path, when: fmtWhen(meta[path]) }));
}

async function fsBuffer(path: string) {
  const value = readFs()[path];
  if (typeof value !== "string") return null;
  return value.startsWith("data:") ? await (await fetch(value)).arrayBuffer() : (new TextEncoder().encode(value).buffer as ArrayBuffer);
}

// Undo/redo for apps whose content lives in React state.
function useHistory<T>(initial: () => T) {
  const [value, setValue] = useState<T>(initial);
  const past = useRef<T[]>([]);
  const future = useRef<T[]>([]);
  const set = (next: T | ((prev: T) => T)) => {
    setValue((prev) => {
      const resolved = typeof next === "function" ? (next as (prev: T) => T)(prev) : next;
      if (resolved !== prev) {
        past.current = [...past.current.slice(-99), prev];
        future.current = [];
      }
      return resolved;
    });
  };
  const reset = (next: T) => {
    past.current = [];
    future.current = [];
    setValue(next);
  };
  const undo = () => setValue((prev) => {
    const last = past.current.pop();
    if (last === undefined) return prev;
    future.current.push(prev);
    return last;
  });
  const redo = () => setValue((prev) => {
    const next = future.current.pop();
    if (next === undefined) return prev;
    past.current.push(prev);
    return next;
  });
  return { value, set, reset, undo, redo };
}

// Save after a pause while AutoSave is on. `rev` counts edits; the returned flag says whether the latest is saved.
function useAutoSave(on: boolean, rev: number, save: () => Promise<boolean>) {
  const [savedRev, setSavedRev] = useState(-1);
  const saveRef = useRef(save);
  saveRef.current = save;
  useEffect(() => {
    if (!on || rev === savedRev) return;
    const timer = window.setTimeout(() => void saveRef.current().then((ok) => ok && setSavedRev(rev)), 1500);
    return () => window.clearTimeout(timer);
  }, [on, rev, savedRev]);
  return { saved: savedRev === rev, markSaved: () => setSavedRev(rev) };
}

const WORD_FONTS = ["Aptos", "Calibri", "Arial", "Times New Roman", "Georgia", "Verdana", "Segoe UI", "Courier New", "Comic Sans MS"];
const WORD_SIZES = [8, 9, 10, 11, 12, 14, 16, 18, 20, 24, 28, 36, 48, 72];
const WORD_MARGINS = { Narrow: 48, Normal: 96, Wide: 192 } as const;
const WORD_STYLES = [
  { label: "Normal", tag: "p", sample: "text-[13px]" },
  { label: "Heading 1", tag: "h1", sample: "text-[15px] text-[#0f4761]" },
  { label: "Heading 2", tag: "h2", sample: "text-[13.5px] text-[#0f4761]" },
  { label: "Heading 3", tag: "h3", sample: "text-[12.5px] text-[#0f4761]" },
  { label: "Quote", tag: "blockquote", sample: "text-[12.5px] italic text-[#404040]" },
] as const;
const docFont = "Aptos, Calibri, 'Segoe UI', Arial, sans-serif";

type WordState = { bold: boolean; italic: boolean; underline: boolean; strike: boolean; sub: boolean; sup: boolean; ul: boolean; ol: boolean; align: string; font: string; block: string };
const WORD_IDLE: WordState = { bold: false, italic: false, underline: false, strike: false, sub: false, sup: false, ul: false, ol: false, align: "left", font: "Aptos", block: "p" };

function WriterApp({ close }: { close: () => void }) {
  const brand = OFFICE.word;
  const fs = useFs();
  const page = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const picture = useRef<HTMLInputElement>(null);
  const canvas = useRef<HTMLDivElement>(null);
  const [name, setName] = useState("Document1");
  const [words, setWords] = useState(0);
  const [pages, setPages] = useState(1);
  const [msg, setMsg] = useState("");
  const [tab, setTab] = useState("Home");
  const [backstage, setBackstage] = useState(false);
  const [zoom, setZoom] = useState(100);
  const [ruler, setRuler] = useState(true);
  const [margin, setMargin] = useState<keyof typeof WORD_MARGINS>("Normal");
  const [landscape, setLandscape] = useState(false);
  const [autoSave, setAutoSave] = useState(false);
  const [rev, setRev] = useState(0);
  const [fmt, setFmt] = useState<WordState>(WORD_IDLE);
  const [size, setSize] = useState(12);
  const [color, setColor] = useState("#c00000");
  const [mark, setMark] = useState("#ffff00");
  const [search, setSearch] = useState("");
  const pageW = landscape ? 1056 : 816;
  const pageH = landscape ? 816 : 1056;
  const pad = WORD_MARGINS[margin];

  const count = () => {
    setWords(page.current?.innerText.trim().split(/\s+/).filter(Boolean).length ?? 0);
    setPages(Math.max(1, Math.ceil((page.current?.scrollHeight ?? pageH) / pageH)));
  };
  const readState = () => {
    const sel = window.getSelection();
    if (!sel?.anchorNode || !page.current?.contains(sel.anchorNode)) return;
    const q = (name: string) => {
      try {
        return document.queryCommandState(name);
      } catch {
        return false;
      }
    };
    const font = String(document.queryCommandValue("fontName") || "Aptos").replace(/["']/g, "").split(",")[0]!.trim();
    const block = String(document.queryCommandValue("formatBlock") || "p").toLowerCase();
    setFmt({ bold: q("bold"), italic: q("italic"), underline: q("underline"), strike: q("strikeThrough"), sub: q("subscript"), sup: q("superscript"), ul: q("insertUnorderedList"), ol: q("insertOrderedList"), align: q("justifyCenter") ? "center" : q("justifyRight") ? "right" : q("justifyFull") ? "justify" : "left", font, block: block === "div" || block === "" ? "p" : block });
    let node: Node | null = sel.anchorNode;
    while (node && node.nodeType !== 1) node = node.parentNode;
    if (node && node !== page.current) setSize(Math.round(parseFloat(getComputedStyle(node as Element).fontSize) * 0.75));
  };
  useEffect(() => {
    document.addEventListener("selectionchange", readState);
    return () => document.removeEventListener("selectionchange", readState);
  });
  const changed = () => {
    count();
    readState();
    setRev((value) => value + 1);
  };
  const cmd = (command: string, value?: string) => {
    page.current?.focus();
    document.execCommand(command, false, value);
    changed();
  };
  const setFontSize = (pt: number) => {
    cmd("fontSize", "7");
    page.current?.querySelectorAll('font[size="7"]').forEach((node) => {
      node.removeAttribute("size");
      (node as HTMLElement).style.fontSize = `${pt}pt`;
    });
    setSize(pt);
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
      setMsg("");
      setBackstage(false);
      count();
    } catch (error) {
      setMsg(error instanceof Error ? error.message : "Couldn't open that file.");
    }
  };
  useOpenFromFiles("writer", loadBuffer);
  const html = () => page.current?.innerHTML ?? "";
  const docBlob = () => new Blob([`<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word"><head><meta charset="utf-8"><title>${name}</title></head><body style="font-family:Aptos,Calibri,Arial,sans-serif">${html()}</body></html>`], { type: "application/msword" });
  const save = () => saveToFiles(`${name}.doc`, docBlob());
  const auto = useAutoSave(autoSave, rev, save);
  const saveNow = () => void save().then((ok) => { if (ok) { auto.markSaved(); setMsg(`Saved to Documents`); } });
  const print = () => {
    const win = window.open("", "_blank");
    if (!win) return setMsg("Allow pop-ups to print or save as PDF.");
    win.document.write(`<title>${name}</title><body style="font-family:Aptos,Calibri,Arial,sans-serif;max-width:${pageW - pad * 2}px;margin:40px auto;line-height:1.15">${html()}</body>`);
    win.document.close();
    win.focus();
    win.print();
  };
  const newDoc = () => {
    if (page.current) page.current.innerHTML = "<p><br></p>";
    setName("Document1");
    setBackstage(false);
    setRev(0);
    count();
  };
  const findText = (text: string) => {
    if (!text || !page.current) return;
    const sel = window.getSelection();
    const range = document.createRange();
    range.setStart(page.current, 0);
    range.collapse(true);
    sel?.removeAllRanges();
    sel?.addRange(range);
    const found = (window as unknown as { find?: (text: string) => boolean }).find?.(text);
    setMsg(found ? "" : `We couldn't find "${text}".`);
  };
  const replaceAll = () => {
    const from = window.prompt("Find what:");
    if (!from || !page.current) return;
    const to = window.prompt(`Replace "${from}" with:`) ?? "";
    let total = 0;
    const walker = document.createTreeWalker(page.current, NodeFilter.SHOW_TEXT);
    for (let node = walker.nextNode(); node; node = walker.nextNode()) {
      const parts = (node.nodeValue ?? "").split(from);
      if (parts.length > 1) {
        total += parts.length - 1;
        node.nodeValue = parts.join(to);
      }
    }
    setMsg(total ? `We made ${total} replacement${total === 1 ? "" : "s"}.` : `We couldn't find "${from}".`);
    changed();
  };
  const pasteText = async () => {
    try {
      const text = await navigator.clipboard.readText();
      cmd("insertText", text);
    } catch {
      setMsg("Use Ctrl+V to paste here.");
    }
  };
  const insertPicture = (file: File | undefined) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => cmd("insertHTML", `<img src="${String(reader.result)}" style="max-width:100%" />`);
    reader.readAsDataURL(file);
  };
  const block = fmt.block.replace(/[<>]/g, "");
  const status = auto.saved && rev > 0 ? "Saved to this PC" : autoSave && rev > 0 ? "Saving…" : "";
  const ribbon: Record<string, ReactNode> = {
    Home: (
      <>
        <RGroup label="Clipboard">
          <RBig icon={LuClipboardPaste} label="Paste" color="#8a6a3a" onClick={() => void pasteText()} />
          <RStack>
            <RSmall icon={LuScissors} label="Cut" onClick={() => cmd("cut")} />
            <RSmall icon={LuCopy} label="Copy" onClick={() => cmd("copy")} />
            <RSmall icon={LuRemoveFormatting} label="Clear" title="Clear all formatting" onClick={() => cmd("removeFormat")} />
          </RStack>
        </RGroup>
        <RGroup label="Font">
          <RStack>
            <RRow>
              <select aria-label="Font" value={WORD_FONTS.includes(fmt.font) ? fmt.font : "Aptos"} onChange={(event) => cmd("fontName", event.target.value)} className={`${rSelect} w-36`} style={{ fontFamily: fmt.font }}>{WORD_FONTS.map((font) => <option key={font} value={font} style={{ fontFamily: font }}>{font}</option>)}</select>
              <select aria-label="Font size" value={WORD_SIZES.includes(size) ? size : 12} onChange={(event) => setFontSize(Number(event.target.value))} className={`${rSelect} w-14`}>{WORD_SIZES.map((pt) => <option key={pt} value={pt}>{pt}</option>)}</select>
              <RSmall icon={LuAArrowUp} title="Increase font size" onClick={() => setFontSize(WORD_SIZES.find((pt) => pt > size) ?? 72)} />
              <RSmall icon={LuAArrowDown} title="Decrease font size" onClick={() => setFontSize([...WORD_SIZES].reverse().find((pt) => pt < size) ?? 8)} />
            </RRow>
            <RRow>
              <RSmall icon={LuBold} title="Bold (Ctrl+B)" active={fmt.bold} onClick={() => cmd("bold")} />
              <RSmall icon={LuItalic} title="Italic (Ctrl+I)" active={fmt.italic} onClick={() => cmd("italic")} />
              <RSmall icon={LuUnderline} title="Underline (Ctrl+U)" active={fmt.underline} onClick={() => cmd("underline")} />
              <RSmall icon={LuStrikethrough} title="Strikethrough" active={fmt.strike} onClick={() => cmd("strikeThrough")} />
              <RSmall icon={LuSubscript} title="Subscript" active={fmt.sub} onClick={() => cmd("subscript")} />
              <RSmall icon={LuSuperscript} title="Superscript" active={fmt.sup} onClick={() => cmd("superscript")} />
              <span className="mx-0.5 h-4 w-px bg-black/10" />
              <RColor icon={LuHighlighter} title="Text highlight color" value={mark} onPick={(value) => { setMark(value); cmd("hiliteColor", value); }} />
              <RColor icon={LuBaseline} title="Font color" value={color} onPick={(value) => { setColor(value); cmd("foreColor", value); }} />
            </RRow>
          </RStack>
        </RGroup>
        <RGroup label="Paragraph">
          <RStack>
            <RRow>
              <RSmall icon={LuList} title="Bullets" active={fmt.ul} onClick={() => cmd("insertUnorderedList")} />
              <RSmall icon={LuListOrdered} title="Numbering" active={fmt.ol} onClick={() => cmd("insertOrderedList")} />
              <RSmall icon={LuIndentDecrease} title="Decrease indent" onClick={() => cmd("outdent")} />
              <RSmall icon={LuIndentIncrease} title="Increase indent" onClick={() => cmd("indent")} />
            </RRow>
            <RRow>
              <RSmall icon={LuAlignLeft} title="Align left (Ctrl+L)" active={fmt.align === "left"} onClick={() => cmd("justifyLeft")} />
              <RSmall icon={LuAlignCenter} title="Center (Ctrl+E)" active={fmt.align === "center"} onClick={() => cmd("justifyCenter")} />
              <RSmall icon={LuAlignRight} title="Align right (Ctrl+R)" active={fmt.align === "right"} onClick={() => cmd("justifyRight")} />
              <RSmall icon={LuAlignJustify} title="Justify (Ctrl+J)" active={fmt.align === "justify"} onClick={() => cmd("justifyFull")} />
            </RRow>
          </RStack>
        </RGroup>
        <RGroup label="Styles">
          <div className="flex gap-1">
            {WORD_STYLES.map((style) => (
              <button key={style.label} type="button" onMouseDown={(event) => event.preventDefault()} onClick={() => cmd("formatBlock", style.tag)} className={`flex h-[58px] w-[76px] flex-col justify-between rounded border bg-white px-1.5 py-1 text-left hover:border-zinc-400 ${block === style.tag ? "border-2" : "border-zinc-200"}`} style={block === style.tag ? { borderColor: brand.color } : undefined}>
                <span className={`truncate leading-tight ${style.sample}`} style={{ fontFamily: docFont }}>AaBbCcDd</span>
                <span className="truncate text-[10.5px] text-zinc-600">{style.label}</span>
              </button>
            ))}
          </div>
        </RGroup>
        <RGroup label="Editing">
          <RStack>
            <RSmall icon={Search} label="Find" onClick={() => { const text = window.prompt("Find what:"); if (text) findText(text); }} />
            <RSmall icon={LuReplace} label="Replace" onClick={replaceAll} />
            <RSmall icon={LuTextSelect} label="Select All" onClick={() => cmd("selectAll")} />
          </RStack>
        </RGroup>
      </>
    ),
    Insert: (
      <>
        <RGroup label="Pages">
          <RBig icon={LuSeparatorHorizontal} label="Page Break" color={brand.color} onClick={() => cmd("insertHTML", '<hr style="page-break-after:always;border:0;border-top:1px dashed #bbb;margin:24px 0" /><p><br></p>')} />
        </RGroup>
        <RGroup label="Tables">
          <RBig icon={LuTable} label="Table" color={brand.color} onClick={() => cmd("insertHTML", `<table style="width:100%;border-collapse:collapse"><tbody>${"<tr>" + '<td style="border:1px solid #000;padding:4px 8px">&nbsp;</td>'.repeat(3) + "</tr>"}${("<tr>" + '<td style="border:1px solid #000;padding:4px 8px">&nbsp;</td>'.repeat(3) + "</tr>").repeat(2)}</tbody></table><p><br></p>`)} />
        </RGroup>
        <RGroup label="Illustrations">
          <RBig icon={LuImagePlus} label="Pictures" color="#2f7ad1" onClick={() => picture.current?.click()} />
        </RGroup>
        <RGroup label="Links">
          <RBig icon={LuLink} label="Link" color={brand.color} onClick={() => { const url = window.prompt("Address:", "https://"); if (url) cmd("createLink", url); }} />
        </RGroup>
        <RGroup label="Text">
          <RBig icon={LuCalendarClock} label="Date & Time" color={brand.color} onClick={() => cmd("insertText", new Date().toLocaleString([], { dateStyle: "long", timeStyle: "short" }))} />
          <RBig icon={Minus} label="Line" color="#424242" onClick={() => cmd("insertHorizontalRule")} />
        </RGroup>
      </>
    ),
    Layout: (
      <>
        <RGroup label="Margins">
          <RStack>{(Object.keys(WORD_MARGINS) as (keyof typeof WORD_MARGINS)[]).map((key) => <RSmall key={key} label={key} active={margin === key} onClick={() => setMargin(key)} className="justify-start px-2" />)}</RStack>
        </RGroup>
        <RGroup label="Orientation">
          <RBig icon={LuFileText} label="Portrait" active={!landscape} color={brand.color} onClick={() => setLandscape(false)} />
          <RBig icon={LuFileText} label="Landscape" active={landscape} color={brand.color} onClick={() => setLandscape(true)} />
        </RGroup>
      </>
    ),
    View: (
      <>
        <RGroup label="Show">
          <RStack><label className="flex items-center gap-1.5 px-1 text-[12px]"><input type="checkbox" checked={ruler} onChange={(event) => setRuler(event.target.checked)} className="accent-[var(--office)]" />Ruler</label></RStack>
        </RGroup>
        <RGroup label="Zoom">
          <RBig icon={LuZoomIn} label="Zoom In" onClick={() => setZoom((value) => Math.min(300, value + 10))} />
          <RBig icon={LuZoomOut} label="Zoom Out" onClick={() => setZoom((value) => Math.max(25, value - 10))} />
          <RStack>
            <RSmall label="100%" onClick={() => setZoom(100)} className="justify-start px-2" />
            <RSmall label="Page Width" onClick={() => setZoom(Math.max(25, Math.min(300, Math.floor(((canvas.current?.clientWidth ?? pageW) - 48) / pageW * 100))))} className="justify-start px-2" />
          </RStack>
        </RGroup>
      </>
    ),
  };
  return (
    <WindowFrame
      title={`${name} - Private Word`}
      icon={WriterIcon}
      close={close}
      bar={{ className: "text-white", style: { background: brand.color }, content: <OfficeTitle brand={brand} icon={WriterIcon} name={name} status={status} autoSave={autoSave} onAutoSave={setAutoSave} onSave={saveNow} onUndo={() => cmd("undo")} onRedo={() => cmd("redo")} search={search} onSearch={(value) => { setSearch(value); findText(value); }} /> }}
    >
      <div className="office relative flex min-h-0 flex-1 flex-col bg-[#f3f3f3] text-zinc-900" style={{ "--office": brand.color, colorScheme: "light" } as React.CSSProperties}>
        <Ribbon brand={brand} tabs={["Home", "Insert", "Layout", "View"]} tab={tab} setTab={setTab} onFile={() => setBackstage(true)} onShare={() => downloadBlob(`${name}.doc`, docBlob())}>{ribbon[tab]}</Ribbon>
        <input ref={input} type="file" accept=".docx,.doc,.html,.htm,.txt" hidden onChange={(event) => { const file = event.target.files?.[0]; if (file) void file.arrayBuffer().then((buffer) => loadBuffer(file.name, buffer)); event.target.value = ""; }} />
        <input ref={picture} type="file" accept="image/*" hidden onChange={(event) => { insertPicture(event.target.files?.[0]); event.target.value = ""; }} />
        <div ref={canvas} className="min-h-0 flex-1 overflow-auto bg-[#e9e9e9] px-6 py-5">
          <div className="mx-auto w-max" style={{ zoom: zoom / 100 }}>
            {ruler && (
              <div aria-hidden className="relative mb-3 h-[22px] border border-[#cfcfcf] bg-white text-[9px] text-zinc-500" style={{ width: pageW }}>
                <span className="absolute inset-y-0 left-0 bg-[#e3e3e3]" style={{ width: pad }} />
                <span className="absolute inset-y-0 right-0 bg-[#e3e3e3]" style={{ width: pad }} />
                <span className="absolute inset-x-0 bottom-0 h-[5px]" style={{ backgroundImage: "repeating-linear-gradient(to right, #9a9a9a 0 1px, transparent 1px 12px)", left: pad, right: pad }} />
                {Array.from({ length: Math.floor((pageW - pad * 2) / 96) }, (_, i) => <span key={i} className="absolute top-0.5 -translate-x-1/2" style={{ left: pad + (i + 1) * 96 }}>{i + 1}</span>)}
              </div>
            )}
            <div
              ref={page}
              contentEditable
              suppressContentEditableWarning
              spellCheck
              onInput={changed}
              onKeyDown={(event) => {
                if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "s") { event.preventDefault(); saveNow(); }
              }}
              dangerouslySetInnerHTML={{ __html: "<p><br></p>" }}
              className="doc-page bg-white text-[12pt] leading-[1.15] text-black shadow-[0_0_0_1px_rgb(0_0_0/.06),0_2px_8px_rgb(0_0_0/.12)] outline-none"
              style={{ width: pageW, minHeight: pageH, padding: pad, fontFamily: docFont }}
            />
          </div>
        </div>
        <OfficeStatus
          left={<><span>Page 1 of {pages}</span><span>{words.toLocaleString()} word{words === 1 ? "" : "s"}</span><span className="hidden sm:inline">English (United States)</span>{msg && <span className="truncate text-zinc-800">{msg}</span>}</>}
          zoom={zoom}
          setZoom={setZoom}
        />
        {backstage && (
          <Backstage
            brand={brand}
            onBack={() => setBackstage(false)}
            onNew={newDoc}
            newLabel="Blank document"
            onBrowse={() => { setBackstage(false); input.current?.click(); }}
            recent={officeRecent(fs, /\.(docx?|html?)$/i)}
            onOpenRecent={(path) => void fsBuffer(path).then((buffer) => buffer && loadBuffer(baseName(path), buffer))}
            items={[
              { label: "Save", icon: Save, onClick: () => { saveNow(); setBackstage(false); } },
              { label: "Save a Copy", icon: Download, onClick: () => downloadBlob(`${name}.doc`, docBlob()) },
              { label: "Rename", icon: LuFilePen, onClick: () => { const next = window.prompt("File name:", name)?.trim(); if (next) setName(next); } },
              { label: "Print", icon: LuPrinter, onClick: print },
              { label: "Export as PDF", icon: LuFileDown, onClick: print },
              { label: "Close", icon: X, onClick: close },
            ]}
          />
        )}
      </div>
    </WindowFrame>
  );
}

type SlideData = { id: number; title: string; body: string; bg: string; img?: string | undefined; notes?: string | undefined };
const SLIDE_BGS = ["#ffffff", "#1e293b", "#0f766e", "#7c2d12", "#4c1d95", "#9f1239"];
const SLIDE_THEMES = [
  { name: "Office Theme", bg: "#ffffff" },
  { name: "Slate", bg: "#1e293b" },
  { name: "Lagoon", bg: "#0f766e" },
  { name: "Rust", bg: "#7c2d12" },
  { name: "Violet", bg: "#4c1d95" },
  { name: "Berry", bg: "#9f1239" },
];
let slideSeq = 1;
const newSlide = (patch: Partial<SlideData> = {}): SlideData => ({ id: slideSeq++, title: "", body: "", bg: "#ffffff", ...patch });

function SlideView({ slide, className = "" }: { slide: SlideData; className?: string }) {
  const light = readableOn(slide.bg) === "#ffffff";
  return (
    <div className={`relative flex aspect-video w-full flex-col overflow-hidden p-[6%] ${className}`} style={{ background: slide.bg, color: light ? "#fff" : "#111", fontFamily: docFont }}>
      <p className="font-semibold leading-tight" style={{ fontSize: "clamp(.5rem, 4.4cqw, 2.8rem)" }}>{slide.title}</p>
      <ul className="mt-[4%] space-y-[1.5%] pl-[4%]" style={{ fontSize: "clamp(.4rem, 2.6cqw, 1.6rem)", listStyle: "disc", width: slide.img ? "52%" : undefined }}>
        {slide.body.split("\n").filter(Boolean).map((line, index) => <li key={index}>{line}</li>)}
      </ul>
      {slide.img && <img src={slide.img} alt="" className="absolute bottom-[8%] right-[6%] h-[60%] w-[38%] object-contain" />}
    </div>
  );
}

// The slide being edited: title and text boxes typed into directly, like PowerPoint's placeholders.
function EditableSlide({ slide, onChange }: { slide: SlideData; onChange: (patch: Partial<SlideData>) => void }) {
  const title = useRef<HTMLDivElement>(null);
  const body = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (title.current) title.current.innerText = slide.title;
    if (body.current) body.current.innerHTML = slide.body ? `<ul>${slide.body.split("\n").map((line) => `<li>${line.replace(/&/g, "&amp;").replace(/</g, "&lt;") || "<br>"}</li>`).join("")}</ul>` : "";
    // Only when switching slides; typing must not reset the caret.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slide.id]);
  const light = readableOn(slide.bg) === "#ffffff";
  const box = `ppt-box rounded-[2px] border border-dashed outline-none ${light ? "border-white/0 hover:border-white/50 focus:border-white/70" : "border-black/0 hover:border-black/40 focus:border-black/60"}`;
  return (
    <div className="relative flex aspect-video w-full flex-col overflow-hidden p-[5%]" style={{ background: slide.bg, color: light ? "#fff" : "#111", fontFamily: docFont }}>
      <div ref={title} contentEditable suppressContentEditableWarning data-placeholder="Click to add title" onInput={(event) => onChange({ title: event.currentTarget.innerText.trim() })} className={`${box} px-[1.5%] py-[1%] font-semibold leading-tight`} style={{ fontSize: "clamp(.7rem, 4.4cqw, 2.8rem)" }} />
      <div
        ref={body}
        contentEditable
        suppressContentEditableWarning
        data-placeholder="Click to add text"
        onFocus={(event) => { if (!event.currentTarget.innerHTML.trim()) event.currentTarget.innerHTML = "<ul><li><br></li></ul>"; }}
        onBlur={(event) => { if (!event.currentTarget.innerText.trim()) event.currentTarget.innerHTML = ""; }}
        onInput={(event) => {
          const items = Array.from(event.currentTarget.querySelectorAll("li")).map((li) => li.innerText.replace(/\n/g, " ").trim());
          onChange({ body: (items.length ? items : event.currentTarget.innerText.split("\n")).filter(Boolean).join("\n") });
        }}
        className={`${box} ppt-body mt-[3%] flex-1 px-[1.5%] py-[1%]`}
        style={{ fontSize: "clamp(.5rem, 2.6cqw, 1.6rem)", width: slide.img ? "56%" : undefined }}
      />
      {slide.img && <img src={slide.img} alt="" className="absolute bottom-[8%] right-[6%] h-[60%] w-[38%] object-contain" />}
    </div>
  );
}

function SlidesApp({ close }: { close: () => void }) {
  const brand = OFFICE.powerpoint;
  const fs = useFs();
  const history = useHistory<SlideData[]>(() => [newSlide({ title: "", body: "" })]);
  const slides = history.value;
  const setSlides = history.set;
  const [index, setIndex] = useState(0);
  const [name, setName] = useState("Presentation1");
  const [present, setPresent] = useState(false);
  const [msg, setMsg] = useState("");
  const [tab, setTab] = useState("Home");
  const [backstage, setBackstage] = useState(false);
  const [zoom, setZoom] = useState(100);
  const [notes, setNotes] = useState(true);
  const [autoSave, setAutoSave] = useState(false);
  const [rev, setRev] = useState(0);
  const [epoch, setEpoch] = useState(0);
  const undo = () => { history.undo(); setEpoch((value) => value + 1); setRev((value) => value + 1); };
  const redo = () => { history.redo(); setEpoch((value) => value + 1); setRev((value) => value + 1); };
  const input = useRef<HTMLInputElement>(null);
  const picture = useRef<HTMLInputElement>(null);
  const at = Math.min(index, slides.length - 1);
  const slide = slides[at]!;
  const edit = (next: SlideData[] | ((prev: SlideData[]) => SlideData[])) => {
    setSlides(next);
    setRev((value) => value + 1);
  };
  const update = (patch: Partial<SlideData>) => edit((list) => list.map((item, i) => (i === at ? { ...item, ...patch } : item)));
  const move = (delta: number) => {
    const target = at + delta;
    if (target < 0 || target >= slides.length) return;
    edit((list) => {
      const next = [...list];
      [next[at], next[target]] = [next[target]!, next[at]!];
      return next;
    });
    setIndex(target);
  };
  const addSlide = () => {
    edit((list) => [...list.slice(0, at + 1), newSlide({ bg: slide.bg }), ...list.slice(at + 1)]);
    setIndex(at + 1);
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
        loaded.push(newSlide({ title: paragraphs[0] ?? "", body: paragraphs.slice(1).join("\n"), bg: "#ffffff" }));
      }
      if (!loaded.length) throw new Error("No slides found in that file.");
      history.reset(loaded);
      setIndex(0);
      setName(fileName.replace(/\.[^.]+$/, ""));
      setMsg("Opened (text only; layouts and pictures aren't imported)");
      setBackstage(false);
    } catch (error) {
      setMsg(error instanceof Error ? error.message : "Couldn't open that file.");
    }
  };
  useOpenFromFiles("slides", importPptx);
  const build = async () => {
    await loadLibScript(LIBS.pptx);
    const pptx = new (lib("PptxGenJS"))();
    pptx.layout = "LAYOUT_16x9";
    slides.forEach((item) => {
      const s = pptx.addSlide();
      s.background = { color: item.bg.slice(1) };
      const color = readableOn(item.bg) === "#ffffff" ? "FFFFFF" : "111111";
      s.addText(item.title, { x: 0.6, y: 0.4, w: 8.8, h: 1, fontSize: 32, bold: true, color, fontFace: "Aptos" });
      const lines = item.body.split("\n").filter(Boolean);
      if (lines.length) s.addText(lines.map((text) => ({ text, options: { bullet: true, breakLine: true } })), { x: 0.8, y: 1.6, w: item.img ? 4.6 : 8.4, h: 3.6, fontSize: 20, color, valign: "top", fontFace: "Aptos" });
      if (item.img) s.addImage({ data: item.img, x: 5.6, y: 1.6, w: 3.8, h: 3.2, sizing: { type: "contain", w: 3.8, h: 3.2 } });
      if (item.notes) s.addNotes(item.notes);
    });
    return (await pptx.write({ outputType: "blob" })) as Blob;
  };
  const save = () => build().then((blob) => saveToFiles(`${name}.pptx`, blob)).catch((error: Error) => { setMsg(error.message); return false; });
  const auto = useAutoSave(autoSave, rev, save);
  const saveNow = () => void save().then((ok) => { if (ok) { auto.markSaved(); setMsg("Saved to Documents"); } });
  const download = () => void build().then((blob) => downloadBlob(`${name}.pptx`, blob)).catch((error: Error) => setMsg(error.message));
  const addPicture = (file: File | undefined) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => update({ img: String(reader.result) });
    reader.readAsDataURL(file);
  };
  useEffect(() => {
    if (!present) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "ArrowRight" || event.key === " " || event.key === "Enter" || event.key === "PageDown") setIndex((value) => Math.min(value + 1, slides.length - 1));
      else if (event.key === "ArrowLeft" || event.key === "PageUp") setIndex((value) => Math.max(value - 1, 0));
      else if (event.key === "Escape") setPresent(false);
      else return;
      event.stopPropagation();
    };
    window.addEventListener("keydown", onKey, true);
    return () => window.removeEventListener("keydown", onKey, true);
  }, [present, slides.length]);
  const status = auto.saved && rev > 0 ? "Saved to this PC" : autoSave && rev > 0 ? "Saving…" : "";
  const themeGallery = (
    <div className="flex gap-1.5">
      {SLIDE_THEMES.map((theme) => (
        <button key={theme.bg} type="button" title={theme.name} onClick={() => edit((list) => list.map((item) => ({ ...item, bg: theme.bg })))} className={`relative h-[54px] w-[86px] overflow-hidden rounded-sm border ${slide.bg === theme.bg ? "border-2" : "border-zinc-300 hover:border-zinc-500"}`} style={{ background: theme.bg, ...(slide.bg === theme.bg ? { borderColor: brand.color } : {}) }}>
          <span className="absolute left-2 top-1.5 text-[15px] font-semibold" style={{ color: readableOn(theme.bg) === "#ffffff" ? "#fff" : "#111", fontFamily: docFont }}>Aa</span>
          <span className="absolute bottom-1.5 left-2 flex gap-0.5">{["#c43e1c", "#156082", "#e97132", "#196b24"].map((c) => <span key={c} className="h-1.5 w-3" style={{ background: c }} />)}</span>
        </button>
      ))}
    </div>
  );
  const ribbon: Record<string, ReactNode> = {
    Home: (
      <>
        <RGroup label="Slides">
          <RBig icon={LuSquarePlus} label="New Slide" color={brand.color} onClick={addSlide} />
          <RStack>
            <RSmall icon={LuCopy} label="Duplicate" onClick={() => { edit((list) => [...list.slice(0, at + 1), { ...slide, id: slideSeq++ }, ...list.slice(at + 1)]); setIndex(at + 1); }} />
            <RSmall icon={LuTrash2} label="Delete" disabled={slides.length < 2} onClick={() => { edit((list) => list.filter((_, i) => i !== at)); setIndex(Math.max(0, at - 1)); }} />
            <RSmall icon={LuEraser} label="Reset" onClick={() => update({ title: "", body: "", img: undefined })} />
          </RStack>
        </RGroup>
        <RGroup label="Arrange">
          <RStack>
            <RSmall icon={LuMoveUp} label="Move Up" disabled={at === 0} onClick={() => move(-1)} />
            <RSmall icon={LuMoveDown} label="Move Down" disabled={at === slides.length - 1} onClick={() => move(1)} />
          </RStack>
        </RGroup>
        <RGroup label="Background">
          <RColor icon={LuPaintBucket} title="Slide background" value={slide.bg} onPick={(value) => update({ bg: value })} />
          <RSmall label="Apply to All" onClick={() => edit((list) => list.map((item) => ({ ...item, bg: slide.bg })))} className="px-2" />
        </RGroup>
        <RGroup label="Slide Show">
          <RBig icon={Play} label="From Beginning" color={brand.color} onClick={() => { setIndex(0); setPresent(true); }} />
        </RGroup>
      </>
    ),
    Insert: (
      <>
        <RGroup label="Slides"><RBig icon={LuSquarePlus} label="New Slide" color={brand.color} onClick={addSlide} /></RGroup>
        <RGroup label="Images">
          <RBig icon={LuImagePlus} label="Pictures" color="#2f7ad1" onClick={() => picture.current?.click()} />
          <RBig icon={LuImageOff} label="Remove Picture" disabled={!slide.img} onClick={() => update({ img: undefined })} />
        </RGroup>
        <RGroup label="Text">
          <RBig icon={LuCalendarClock} label="Date & Time" color={brand.color} onClick={() => update({ body: [slide.body, new Date().toLocaleDateString([], { dateStyle: "long" })].filter(Boolean).join("\n") })} />
        </RGroup>
      </>
    ),
    Design: (
      <>
        <RGroup label="Themes">{themeGallery}</RGroup>
        <RGroup label="Customize"><RStack><RColor icon={LuPaintBucket} title="Format Background" label="Format Background" value={slide.bg} onPick={(value) => update({ bg: value })} /><RSmall label="Apply to All" onClick={() => edit((list) => list.map((item) => ({ ...item, bg: slide.bg })))} className="justify-start px-1" /></RStack></RGroup>
      </>
    ),
    "Slide Show": (
      <RGroup label="Start Slide Show">
        <RBig icon={Play} label="From Beginning" color={brand.color} onClick={() => { setIndex(0); setPresent(true); }} />
        <RBig icon={LuPresentation} label="From Current Slide" color={brand.color} onClick={() => setPresent(true)} />
      </RGroup>
    ),
    View: (
      <>
        <RGroup label="Show"><RBig icon={LuStickyNote} label="Notes" active={notes} onClick={() => setNotes((value) => !value)} /></RGroup>
        <RGroup label="Zoom">
          <RBig icon={LuZoomIn} label="Zoom In" onClick={() => setZoom((value) => Math.min(200, value + 10))} />
          <RBig icon={LuZoomOut} label="Zoom Out" onClick={() => setZoom((value) => Math.max(40, value - 10))} />
          <RBig icon={LuExpand} label="Fit to Window" onClick={() => setZoom(100)} />
        </RGroup>
      </>
    ),
  };
  return (
    <WindowFrame
      title={`${name} - Private PowerPoint`}
      icon={SlidesIcon}
      close={close}
      bar={{ className: "text-white", style: { background: brand.color }, content: <OfficeTitle brand={brand} icon={SlidesIcon} name={name} status={status} autoSave={autoSave} onAutoSave={setAutoSave} onSave={saveNow} onUndo={undo} onRedo={redo} /> }}
    >
      <div className="office relative flex min-h-0 flex-1 flex-col bg-[#f3f3f3] text-zinc-900" style={{ "--office": brand.color, colorScheme: "light" } as React.CSSProperties}>
        <Ribbon brand={brand} tabs={["Home", "Insert", "Design", "Slide Show", "View"]} tab={tab} setTab={setTab} onFile={() => setBackstage(true)} onShare={download}>{ribbon[tab]}</Ribbon>
        <input ref={input} type="file" accept=".pptx" hidden onChange={(event) => { const file = event.target.files?.[0]; if (file) void file.arrayBuffer().then((buffer) => importPptx(file.name, buffer)); event.target.value = ""; }} />
        <input ref={picture} type="file" accept="image/*" hidden onChange={(event) => { addPicture(event.target.files?.[0]); event.target.value = ""; }} />
        <div className="flex min-h-0 flex-1">
          <div className="hidden w-48 shrink-0 overflow-y-auto py-2 pl-1 pr-3 sm:block">
            {slides.map((item, i) => (
              <div key={item.id} className="mb-2 flex gap-1.5">
                <span className="w-5 pt-0.5 text-right text-[11px] text-zinc-600">{i + 1}</span>
                <button type="button" onClick={() => setIndex(i)} className={`min-w-0 flex-1 overflow-hidden rounded-[3px] border-2 bg-white ${i === at ? "" : "border-transparent hover:border-zinc-300"}`} style={{ containerType: "inline-size", ...(i === at ? { borderColor: brand.color } : {}) }}>
                  <SlideView slide={item} className="shadow-[0_0_0_1px_rgb(0_0_0/.1)]" />
                </button>
              </div>
            ))}
          </div>
          <div className="flex min-w-0 flex-1 flex-col">
            <div className="flex min-h-0 flex-1 items-center justify-center overflow-auto bg-[#e6e6e6] p-6">
              <div className="w-full shadow-[0_2px_10px_rgb(0_0_0/.18)]" style={{ maxWidth: `${(zoom / 100) * 880}px`, containerType: "inline-size" }}>
                <EditableSlide key={`${slide.id}-${epoch}`} slide={slide} onChange={update} />
              </div>
            </div>
            {notes && (
              <textarea aria-label="Notes" value={slide.notes ?? ""} onChange={(event) => update({ notes: event.target.value })} placeholder="Click to add notes" className="h-20 shrink-0 resize-none border-t border-black/10 bg-white px-4 py-2 text-[13px] text-zinc-800 outline-none placeholder:text-zinc-500" />
            )}
          </div>
        </div>
        <OfficeStatus
          left={<><span>Slide {at + 1} of {slides.length}</span><span className="hidden sm:inline">English (United States)</span>{msg && <span className="truncate text-zinc-800">{msg}</span>}</>}
          right={<button type="button" onClick={() => setNotes((value) => !value)} className={`rounded px-1.5 hover:bg-black/5 ${notes ? "bg-black/[.06]" : ""}`}>Notes</button>}
          zoom={zoom}
          setZoom={(value) => setZoom(Math.max(40, Math.min(200, value)))}
        />
        {backstage && (
          <Backstage
            brand={brand}
            onBack={() => setBackstage(false)}
            onNew={() => { history.reset([newSlide()]); setIndex(0); setName("Presentation1"); setRev(0); setBackstage(false); }}
            newLabel="Blank Presentation"
            onBrowse={() => { setBackstage(false); input.current?.click(); }}
            recent={officeRecent(fs, /\.pptx$/i)}
            onOpenRecent={(path) => void fsBuffer(path).then((buffer) => buffer && importPptx(baseName(path), buffer))}
            items={[
              { label: "Save", icon: Save, onClick: () => { saveNow(); setBackstage(false); } },
              { label: "Save a Copy", icon: Download, onClick: download },
              { label: "Rename", icon: LuFilePen, onClick: () => { const next = window.prompt("File name:", name)?.trim(); if (next) setName(next); } },
              { label: "Close", icon: X, onClick: close },
            ]}
          />
        )}
      </div>
      {present && (
        <div onClick={() => setIndex((value) => Math.min(value + 1, slides.length - 1))} className="fixed inset-0 z-[90] flex cursor-pointer items-center justify-center bg-black">
          <div key={at} className="w-full max-w-[min(100%,calc(100dvh*16/9))] [animation:rise_.4s_cubic-bezier(.22,1,.36,1)_both]" style={{ containerType: "inline-size" }}><SlideView slide={slide} /></div>
          <button type="button" aria-label="End slide show" onClick={(event) => { event.stopPropagation(); setPresent(false); }} className="absolute right-4 top-4 rounded-full bg-white/15 p-2 text-white opacity-30 hover:opacity-100"><X className="size-4" /></button>
          <p className="absolute bottom-3 left-4 text-[11px] text-white/40">Slide {at + 1} of {slides.length}</p>
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

type CellFmt = { b?: boolean; i?: boolean; u?: boolean; align?: "left" | "center" | "right"; color?: string | undefined; fill?: string | undefined; num?: "general" | "number" | "currency" | "percent" | undefined };
type Book = { data: string[][]; fmt: Record<string, CellFmt> };

function showCell(value: string, num: CellFmt["num"]) {
  const n = Number(value);
  if (value === "" || !Number.isFinite(n) || !num || num === "general") return value;
  if (num === "currency") return n.toLocaleString("en-US", { style: "currency", currency: "USD" });
  if (num === "percent") return `${Math.round(n * 100)}%`;
  return n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function SheetsApp({ close }: { close: () => void }) {
  const brand = OFFICE.excel;
  const fs = useFs();
  const make = (rows: number, cols: number) => Array.from({ length: rows }, () => Array.from({ length: cols }, () => ""));
  const history = useHistory<Book>(() => ({ data: make(40, 14), fmt: {} }));
  const { data, fmt } = history.value;
  const [sel, setSel] = useState<{ r: number; c: number }>({ r: 0, c: 0 });
  const [end, setEnd] = useState<{ r: number; c: number }>({ r: 0, c: 0 });
  const [editing, setEditing] = useState<string | null>(null);
  const [name, setName] = useState("Book1");
  const [msg, setMsg] = useState("");
  const [tab, setTab] = useState("Home");
  const [backstage, setBackstage] = useState(false);
  const [zoom, setZoom] = useState(100);
  const [grid, setGrid] = useState(true);
  const [headings, setHeadings] = useState(true);
  const [autoSave, setAutoSave] = useState(false);
  const [rev, setRev] = useState(0);
  const [nameBox, setNameBox] = useState<string | null>(null);
  const [fill, setFill] = useState("#ffff00");
  const [ink, setInk] = useState("#c00000");
  const clip = useRef<string[][] | null>(null);
  const dragging = useRef(false);
  const input = useRef<HTMLInputElement>(null);
  const formula = useRef<HTMLInputElement>(null);
  const cols = data[0]?.length ?? 14;
  const r0 = Math.min(sel.r, end.r);
  const r1 = Math.max(sel.r, end.r);
  const c0 = Math.min(sel.c, end.c);
  const c1 = Math.max(sel.c, end.c);
  const multi = r0 !== r1 || c0 !== c1;
  const inRange = (r: number, c: number) => r >= r0 && r <= r1 && c >= c0 && c <= c1;
  useEffect(() => {
    const up = () => { dragging.current = false; };
    window.addEventListener("mouseup", up);
    return () => window.removeEventListener("mouseup", up);
  }, []);
  const commit = (next: Book | ((prev: Book) => Book)) => {
    history.set(next);
    setRev((value) => value + 1);
  };
  const setCell = (r: number, c: number, value: string) => commit((book) => ({ ...book, data: book.data.map((row, ri) => (ri === r ? row.map((cell, ci) => (ci === c ? value : cell)) : row)) }));
  const forRange = (fn: (key: string, current: CellFmt) => CellFmt) =>
    commit((book) => {
      const next = { ...book.fmt };
      for (let r = r0; r <= r1; r += 1) for (let c = c0; c <= c1; c += 1) next[`${r}-${c}`] = fn(`${r}-${c}`, next[`${r}-${c}`] ?? {});
      return { ...book, fmt: next };
    });
  const active = fmt[`${sel.r}-${sel.c}`] ?? {};
  const toggle = (key: "b" | "i" | "u") => {
    const on = !active[key];
    forRange((_key, current) => ({ ...current, [key]: on }));
  };
  const setFmt = (patch: CellFmt) => forRange((_key, current) => ({ ...current, ...patch }));
  const goTo = (r: number, c: number, extend = false) => {
    const rr = Math.max(0, Math.min(data.length - 1, r));
    const cc = Math.max(0, Math.min(cols - 1, c));
    if (extend) setEnd({ r: rr, c: cc });
    else document.getElementById(`cell-${rr}-${cc}`)?.focus();
  };
  const rangeValues = () => data.slice(r0, r1 + 1).map((row) => row.slice(c0, c1 + 1));
  const copy = (cut: boolean) => {
    clip.current = rangeValues();
    void navigator.clipboard?.writeText(clip.current.map((row) => row.join("\t")).join("\n")).catch(() => undefined);
    if (cut) commit((book) => ({ ...book, data: book.data.map((row, r) => row.map((cell, c) => (inRange(r, c) ? "" : cell))) }));
    setMsg(cut ? "Cut. Select a cell and Paste." : "Copied. Select a cell and Paste.");
  };
  const pasteAt = (block: string[][]) =>
    commit((book) => {
      const next = book.data.map((row) => [...row]);
      while (next.length < sel.r + block.length) next.push(Array.from({ length: cols }, () => ""));
      block.forEach((line, dr) => line.forEach((value, dc) => {
        const row = next[sel.r + dr]!;
        while (row.length <= sel.c + dc) row.push("");
        row[sel.c + dc] = value;
      }));
      const width = Math.max(...next.map((row) => row.length));
      return { ...book, data: next.map((row) => [...row, ...Array.from({ length: width - row.length }, () => "")]) };
    });
  const paste = async () => {
    if (clip.current) return pasteAt(clip.current);
    try {
      const text = await navigator.clipboard.readText();
      pasteAt(text.split(/\r?\n/).filter((line, i, all) => line || i < all.length - 1).map((line) => line.split("\t")));
    } catch {
      setMsg("Use Ctrl+V to paste here.");
    }
  };
  // AutoSum and friends: with a range selected, the result goes under it; otherwise it covers the numbers above.
  const autoFn = (fn: string) => {
    if (multi) {
      const target = Math.min(r1 + 1, data.length - 1);
      setCell(target, c0, `=${fn}(${colName(c0)}${r0 + 1}:${colName(c0)}${r1 + 1})`);
      goTo(target, c0);
      return;
    }
    let top = sel.r - 1;
    while (top >= 0 && data[top]![sel.c] !== "" && Number.isFinite(Number(cellValue(data, top, sel.c)))) top -= 1;
    const from = top + 1;
    setCell(sel.r, sel.c, from < sel.r ? `=${fn}(${colName(sel.c)}${from + 1}:${colName(sel.c)}${sel.r})` : `=${fn}()`);
    formula.current?.focus();
  };
  const sortBy = (dir: 1 | -1) =>
    commit((book) => {
      const rows = book.data.filter((row) => row.some(Boolean));
      const empty = book.data.length - rows.length;
      const key = (row: string[]) => row[sel.c] ?? "";
      rows.sort((a, b) => {
        const x = key(a);
        const y = key(b);
        if (x === "" || y === "") return x === "" ? 1 : -1;
        const nx = Number(x);
        const ny = Number(y);
        return (Number.isFinite(nx) && Number.isFinite(ny) ? nx - ny : x.localeCompare(y, undefined, { numeric: true })) * dir;
      });
      return { data: [...rows, ...make(empty, cols)], fmt: {} };
    });
  const insertRow = () => commit((book) => {
    const shifted: Record<string, CellFmt> = {};
    for (const [key, value] of Object.entries(book.fmt)) {
      const [r, c] = key.split("-").map(Number) as [number, number];
      shifted[`${r >= sel.r ? r + 1 : r}-${c}`] = value;
    }
    return { data: [...book.data.slice(0, sel.r), Array.from({ length: cols }, () => ""), ...book.data.slice(sel.r)], fmt: shifted };
  });
  const deleteRow = () => commit((book) => {
    const shifted: Record<string, CellFmt> = {};
    for (const [key, value] of Object.entries(book.fmt)) {
      const [r, c] = key.split("-").map(Number) as [number, number];
      if (r < r0) shifted[key] = value;
      else if (r > r1) shifted[`${r - (r1 - r0 + 1)}-${c}`] = value;
    }
    const rest = book.data.filter((_row, r) => r < r0 || r > r1);
    return { data: [...rest, ...make(Math.max(0, 40 - rest.length), cols)], fmt: shifted };
  });
  const insertCol = () => commit((book) => {
    const shifted: Record<string, CellFmt> = {};
    for (const [key, value] of Object.entries(book.fmt)) {
      const [r, c] = key.split("-").map(Number) as [number, number];
      shifted[`${r}-${c >= sel.c ? c + 1 : c}`] = value;
    }
    return { data: book.data.map((row) => [...row.slice(0, sel.c), "", ...row.slice(sel.c)]), fmt: shifted };
  });
  const deleteCol = () => commit((book) => {
    const shifted: Record<string, CellFmt> = {};
    for (const [key, value] of Object.entries(book.fmt)) {
      const [r, c] = key.split("-").map(Number) as [number, number];
      if (c < c0) shifted[key] = value;
      else if (c > c1) shifted[`${r}-${c - (c1 - c0 + 1)}`] = value;
    }
    return { data: book.data.map((row) => { const rest = row.filter((_cell, c) => c < c0 || c > c1); return rest.length ? rest : [""]; }), fmt: shifted };
  });
  const clearRange = () => commit((book) => {
    const next = { ...book.fmt };
    for (let r = r0; r <= r1; r += 1) for (let c = c0; c <= c1; c += 1) delete next[`${r}-${c}`];
    return { data: book.data.map((row, r) => row.map((cell, c) => (inRange(r, c) ? "" : cell))), fmt: next };
  });
  const importBuffer = async (fileName: string, buffer: ArrayBuffer) => {
    try {
      await loadLibScript(LIBS.xlsx);
      const XLSX = lib("XLSX");
      const wb = XLSX.read(buffer, { type: "array" });
      const ws = wb.Sheets[wb.SheetNames[0]];
      const range = XLSX.utils.decode_range(ws["!ref"] ?? "A1:A1");
      const next = make(Math.max(40, range.e.r + 1), Math.max(14, range.e.c + 1));
      for (let r = range.s.r; r <= range.e.r; r += 1) {
        for (let c = range.s.c; c <= range.e.c; c += 1) {
          const cell = ws[XLSX.utils.encode_cell({ r, c })];
          if (cell) next[r]![c] = cell.f ? `=${cell.f}` : String(cell.v ?? cell.w ?? "");
        }
      }
      history.reset({ data: next, fmt: {} });
      setName(fileName.replace(/\.[^.]+$/, ""));
      setMsg("");
      setBackstage(false);
    } catch (error) {
      setMsg(error instanceof Error ? error.message : "Couldn't open that file.");
    }
  };
  useOpenFromFiles("sheets", importBuffer);
  const workbook = async () => {
    await loadLibScript(LIBS.xlsx);
    const XLSX = lib("XLSX");
    const values = data.map((row) => row.map((raw) => (raw.startsWith("=") ? "" : raw !== "" && Number.isFinite(Number(raw)) ? Number(raw) : raw)));
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
  const save = () => xlsxBlob().then((blob) => saveToFiles(`${name}.xlsx`, blob)).catch((error: Error) => { setMsg(error.message); return false; });
  const auto = useAutoSave(autoSave, rev, save);
  const saveNow = () => void save().then((ok) => { if (ok) { auto.markSaved(); setMsg("Saved to Documents"); } });
  const download = () => void xlsxBlob().then((blob) => downloadBlob(`${name}.xlsx`, blob)).catch((error: Error) => setMsg(error.message));
  const raw = data[sel.r]?.[sel.c] ?? "";
  const address = multi ? `${colName(c0)}${r0 + 1}:${colName(c1)}${r1 + 1}` : `${colName(sel.c)}${sel.r + 1}`;
  const nums: number[] = [];
  let filled = 0;
  if (multi) for (let r = r0; r <= r1; r += 1) for (let c = c0; c <= c1; c += 1) {
    const v = cellValue(data, r, c);
    if (v !== "") filled += 1;
    if (v !== "" && Number.isFinite(Number(v))) nums.push(Number(v));
  }
  const fmtNum = (n: number) => String(+n.toFixed(6));
  const status = auto.saved && rev > 0 ? "Saved to this PC" : autoSave && rev > 0 ? "Saving…" : "";
  const ribbon: Record<string, ReactNode> = {
    Home: (
      <>
        <RGroup label="Clipboard">
          <RBig icon={LuClipboardPaste} label="Paste" color="#8a6a3a" onClick={() => void paste()} />
          <RStack>
            <RSmall icon={LuScissors} label="Cut" onClick={() => copy(true)} />
            <RSmall icon={LuCopy} label="Copy" onClick={() => copy(false)} />
          </RStack>
        </RGroup>
        <RGroup label="Font">
          <RStack>
            <RRow>
              <RSmall icon={LuBold} title="Bold (Ctrl+B)" active={Boolean(active.b)} onClick={() => toggle("b")} />
              <RSmall icon={LuItalic} title="Italic (Ctrl+I)" active={Boolean(active.i)} onClick={() => toggle("i")} />
              <RSmall icon={LuUnderline} title="Underline (Ctrl+U)" active={Boolean(active.u)} onClick={() => toggle("u")} />
            </RRow>
            <RRow>
              <RColor icon={LuPaintBucket} title="Fill Color" value={fill} onPick={(value) => { setFill(value); setFmt({ fill: value }); }} />
              <RColor icon={LuBaseline} title="Font Color" value={ink} onPick={(value) => { setInk(value); setFmt({ color: value }); }} />
              <RSmall label="No Fill" onClick={() => setFmt({ fill: undefined, color: undefined })} className="px-1.5 text-[11px]" />
            </RRow>
          </RStack>
        </RGroup>
        <RGroup label="Alignment">
          <RRow>
            <RSmall icon={LuAlignLeft} title="Align Left" active={active.align === "left"} onClick={() => setFmt({ align: "left" })} />
            <RSmall icon={LuAlignCenter} title="Center" active={active.align === "center"} onClick={() => setFmt({ align: "center" })} />
            <RSmall icon={LuAlignRight} title="Align Right" active={active.align === "right"} onClick={() => setFmt({ align: "right" })} />
          </RRow>
        </RGroup>
        <RGroup label="Number">
          <RStack>
            <select aria-label="Number format" value={active.num ?? "general"} onChange={(event) => setFmt({ num: event.target.value as CellFmt["num"] })} className={`${rSelect} w-32`}>
              <option value="general">General</option><option value="number">Number</option><option value="currency">Currency</option><option value="percent">Percentage</option>
            </select>
            <RRow>
              <RSmall icon={LuDollarSign} title="Currency" active={active.num === "currency"} onClick={() => setFmt({ num: "currency" })} />
              <RSmall icon={LuPercent} title="Percent Style" active={active.num === "percent"} onClick={() => setFmt({ num: "percent" })} />
              <RSmall label="," title="Comma Style" active={active.num === "number"} onClick={() => setFmt({ num: "number" })} className="w-6 text-[15px] font-bold" />
            </RRow>
          </RStack>
        </RGroup>
        <RGroup label="Cells">
          <RStack>
            <RSmall icon={LuBetweenHorizontalStart} label="Insert Row" onClick={insertRow} className="justify-start" />
            <RSmall icon={LuBetweenVerticalStart} label="Insert Column" onClick={insertCol} className="justify-start" />
            <RSmall icon={LuTrash2} label="Delete Row" onClick={deleteRow} className="justify-start" />
          </RStack>
          <RStack><RSmall icon={LuTrash2} label="Delete Column" onClick={deleteCol} className="justify-start" /></RStack>
        </RGroup>
        <RGroup label="Editing">
          <RBig icon={LuSigma} label="AutoSum" color="#424242" onClick={() => autoFn("SUM")} />
          <RStack>
            <RSmall icon={LuEraser} label="Clear" onClick={clearRange} className="justify-start" />
            <RSmall icon={LuArrowDownAZ} label="Sort A to Z" onClick={() => sortBy(1)} className="justify-start" />
            <RSmall icon={LuArrowDownZA} label="Sort Z to A" onClick={() => sortBy(-1)} className="justify-start" />
          </RStack>
        </RGroup>
      </>
    ),
    Insert: (
      <>
        <RGroup label="Rows & Columns">
          <RBig icon={LuRows3} label="Add 10 Rows" color={brand.color} onClick={() => commit((book) => ({ ...book, data: [...book.data, ...make(10, cols)] }))} />
          <RBig icon={LuColumns3} label="Add Column" color={brand.color} onClick={() => commit((book) => ({ ...book, data: book.data.map((row) => [...row, ""]) }))} />
        </RGroup>
        <RGroup label="Functions">
          <RBig icon={LuSquareFunction} label="Insert Function" color={brand.color} onClick={() => { if (!raw.startsWith("=")) setCell(sel.r, sel.c, "="); formula.current?.focus(); }} />
        </RGroup>
      </>
    ),
    Formulas: (
      <RGroup label="Function Library">
        <RBig icon={LuSigma} label="AutoSum" color={brand.color} onClick={() => autoFn("SUM")} />
        <RStack>
          <RSmall label="Average" onClick={() => autoFn("AVERAGE")} className="justify-start px-2" />
          <RSmall label="Count Numbers" onClick={() => autoFn("COUNT")} className="justify-start px-2" />
        </RStack>
        <RStack>
          <RSmall label="Max" onClick={() => autoFn("MAX")} className="justify-start px-2" />
          <RSmall label="Min" onClick={() => autoFn("MIN")} className="justify-start px-2" />
        </RStack>
      </RGroup>
    ),
    Data: (
      <>
        <RGroup label="Sort">
          <RBig icon={LuArrowDownAZ} label="Sort A to Z" color={brand.color} onClick={() => sortBy(1)} />
          <RBig icon={LuArrowDownZA} label="Sort Z to A" color={brand.color} onClick={() => sortBy(-1)} />
        </RGroup>
        <RGroup label="Data Tools">
          <RBig icon={LuEraser} label="Clear All" onClick={() => commit({ data: make(40, 14), fmt: {} })} />
        </RGroup>
      </>
    ),
    View: (
      <>
        <RGroup label="Show">
          <RStack>
            <label className="flex items-center gap-1.5 px-1 text-[12px]"><input type="checkbox" checked={grid} onChange={(event) => setGrid(event.target.checked)} className="accent-[var(--office)]" />Gridlines</label>
            <label className="flex items-center gap-1.5 px-1 text-[12px]"><input type="checkbox" checked={headings} onChange={(event) => setHeadings(event.target.checked)} className="accent-[var(--office)]" />Headings</label>
          </RStack>
        </RGroup>
        <RGroup label="Zoom">
          <RBig icon={LuZoomIn} label="Zoom In" onClick={() => setZoom((value) => Math.min(300, value + 10))} />
          <RBig icon={LuZoomOut} label="Zoom Out" onClick={() => setZoom((value) => Math.max(25, value - 10))} />
          <RBig icon={LuSearch} label="100%" onClick={() => setZoom(100)} />
        </RGroup>
      </>
    ),
  };
  const headCls = "border-b border-r border-[#d4d4d4] bg-[#f5f5f5] text-[11px] font-normal text-[#444]";
  return (
    <WindowFrame
      title={`${name} - Private Excel`}
      icon={SheetsIcon}
      close={close}
      bar={{ className: "text-white", style: { background: brand.color }, content: <OfficeTitle brand={brand} icon={SheetsIcon} name={name} status={status} autoSave={autoSave} onAutoSave={setAutoSave} onSave={saveNow} onUndo={() => { history.undo(); setRev((value) => value + 1); }} onRedo={() => { history.redo(); setRev((value) => value + 1); }} /> }}
    >
      <div className="office relative flex min-h-0 flex-1 flex-col bg-[#f3f3f3] text-zinc-900" style={{ "--office": brand.color, colorScheme: "light" } as React.CSSProperties}>
        <Ribbon brand={brand} tabs={["Home", "Insert", "Formulas", "Data", "View"]} tab={tab} setTab={setTab} onFile={() => setBackstage(true)} onShare={download}>{ribbon[tab]}</Ribbon>
        <input ref={input} type="file" accept=".xlsx,.xls,.csv" hidden onChange={(event) => { const file = event.target.files?.[0]; if (file) void file.arrayBuffer().then((buffer) => importBuffer(file.name, buffer)); event.target.value = ""; }} />
        <div className="flex h-8 shrink-0 items-center gap-1 border-b border-[#d4d4d4] bg-white px-2 text-[12px]">
          <input
            aria-label="Name Box"
            value={nameBox ?? address}
            onFocus={(event) => { setNameBox(address); event.currentTarget.select(); }}
            onChange={(event) => setNameBox(event.target.value)}
            onBlur={() => setNameBox(null)}
            onKeyDown={(event) => {
              if (event.key !== "Enter") return;
              const m = /^([A-Z]+)(\d+)$/i.exec((nameBox ?? "").trim());
              setNameBox(null);
              if (m) goTo(parseInt(m[2]!, 10) - 1, colIndex(m[1]!.toUpperCase()));
            }}
            className="h-6 w-24 rounded-sm border border-[#d4d4d4] px-1.5 outline-none focus:border-[var(--office)]"
          />
          <span className="mx-1 text-zinc-400">⋮</span>
          <button type="button" aria-label="Cancel" onClick={() => document.getElementById(`cell-${sel.r}-${sel.c}`)?.blur()} className="grid size-6 place-items-center rounded text-zinc-500 hover:bg-black/5"><X className="size-3.5" /></button>
          <button type="button" aria-label="Enter" onClick={() => goTo(sel.r + 1, sel.c)} className="grid size-6 place-items-center rounded text-zinc-500 hover:bg-black/5"><Check className="size-3.5" /></button>
          <span className="px-1 font-serif italic text-zinc-600">fx</span>
          <input ref={formula} aria-label="Formula bar" value={raw} onChange={(event) => setCell(sel.r, sel.c, event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") goTo(sel.r + 1, sel.c); }} className="h-6 min-w-0 flex-1 border-l border-[#e1e1e1] px-2 outline-none" />
        </div>
        <div className="min-h-0 flex-1 overflow-auto bg-white">
          <table className="border-separate border-spacing-0 text-[14.5px] text-black" style={{ zoom: zoom / 100, fontFamily: "'Aptos Narrow', Calibri, 'Segoe UI', Arial, sans-serif" }}>
            {headings && (
              <thead className="sticky top-0 z-10">
                <tr>
                  <th className={`${headCls} sticky left-0 z-20 h-5 w-10`}><span className="absolute bottom-0.5 right-0.5 size-0 border-b-[7px] border-l-[7px] border-b-[#b6b6b6] border-l-transparent" /></th>
                  {Array.from({ length: cols }, (_, c) => {
                    const on = c >= c0 && c <= c1;
                    return <th key={c} onClick={() => { setSel({ r: 0, c }); setEnd({ r: data.length - 1, c }); }} className={`${headCls} h-5 min-w-[88px] ${on ? "border-b-2 !bg-[#d3f0e0] font-semibold !text-[#0b5a2f]" : ""}`} style={on ? { borderBottomColor: brand.color } : undefined}>{colName(c)}</th>;
                  })}
                </tr>
              </thead>
            )}
            <tbody>
              {data.map((row, r) => {
                const rowOn = r >= r0 && r <= r1;
                return (
                  <tr key={r}>
                    {headings && <th onClick={() => { setSel({ r, c: 0 }); setEnd({ r, c: cols - 1 }); }} className={`${headCls} sticky left-0 z-[5] h-5 px-1.5 text-center ${rowOn ? "border-r-2 !bg-[#d3f0e0] font-semibold !text-[#0b5a2f]" : ""}`} style={rowOn ? { borderRightColor: brand.color } : undefined}>{r + 1}</th>}
                    {row.map((cell, c) => {
                      const key = `${r}-${c}`;
                      const f = fmt[key] ?? {};
                      const shown = cellValue(data, r, c);
                      const numeric = shown !== "" && Number.isFinite(Number(shown));
                      const isActive = sel.r === r && sel.c === c;
                      const ranged = multi && inRange(r, c);
                      return (
                        <td
                          key={c}
                          onMouseDown={(event) => {
                            if (event.shiftKey) {
                              event.preventDefault();
                              setEnd({ r, c });
                            } else {
                              dragging.current = true;
                              setEnd({ r, c });
                            }
                          }}
                          onMouseEnter={() => { if (dragging.current) setEnd({ r, c }); }}
                          className={`relative h-5 p-0 ${grid ? "border-b border-r border-[#e1e1e1]" : "border-b border-r border-transparent"}`}
                          style={{ background: ranged && !isActive ? "rgb(16 124 65 / .1)" : f.fill }}
                        >
                          <input
                            id={`cell-${r}-${c}`}
                            aria-label={`${colName(c)}${r + 1}`}
                            value={editing === key ? cell : showCell(shown, f.num)}
                            onFocus={() => { setSel({ r, c }); if (!dragging.current) setEnd({ r, c }); setEditing(key); }}
                            onBlur={() => setEditing(null)}
                            onChange={(event) => setCell(r, c, event.target.value)}
                            onKeyDown={(event) => {
                              const mod = event.ctrlKey || event.metaKey;
                              if (event.key === "Enter" || event.key === "ArrowDown") { event.preventDefault(); goTo(r + 1, c, event.shiftKey && event.key === "ArrowDown"); }
                              else if (event.key === "ArrowUp") { event.preventDefault(); goTo(r - 1, c, event.shiftKey); }
                              else if (event.key === "Tab") { event.preventDefault(); goTo(r, c + (event.shiftKey ? -1 : 1)); }
                              else if ((event.key === "ArrowRight" || event.key === "ArrowLeft") && (event.currentTarget.selectionStart === (event.key === "ArrowRight" ? cell.length : 0) || cell === "")) { event.preventDefault(); goTo(r, c + (event.key === "ArrowRight" ? 1 : -1), event.shiftKey); }
                              else if (mod && event.key.toLowerCase() === "b") { event.preventDefault(); toggle("b"); }
                              else if (mod && event.key.toLowerCase() === "i") { event.preventDefault(); toggle("i"); }
                              else if (mod && event.key.toLowerCase() === "u") { event.preventDefault(); toggle("u"); }
                              else if (mod && event.key.toLowerCase() === "s") { event.preventDefault(); saveNow(); }
                              else if (event.key === "Delete" && multi) { event.preventDefault(); clearRange(); }
                            }}
                            className="h-5 w-[88px] bg-transparent px-1 outline-none"
                            style={{ fontWeight: f.b ? 700 : undefined, fontStyle: f.i ? "italic" : undefined, textDecoration: f.u ? "underline" : undefined, color: f.color, textAlign: editing === key ? "left" : f.align ?? (numeric ? "right" : "left") }}
                          />
                          {isActive && <span className="pointer-events-none absolute -inset-px z-[3] border-2" style={{ borderColor: brand.color }}><span className="absolute -bottom-[4px] -right-[4px] size-[7px] border border-white" style={{ background: brand.color }} /></span>}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="flex h-8 shrink-0 items-stretch border-t border-[#d4d4d4] bg-[#f3f3f3] text-[12px]">
          <span className="flex items-center gap-1 px-2 text-zinc-400"><ChevronLeft className="size-3.5" /><ChevronRight className="size-3.5" /></span>
          <span className="relative -mt-px flex items-center bg-white px-5 font-semibold shadow-[1px_0_0_#d4d4d4,-1px_0_0_#d4d4d4]" style={{ color: brand.color }}>Sheet1<span className="absolute inset-x-3 bottom-0.5 h-[3px] rounded-full" style={{ background: brand.color }} /></span>
        </div>
        <OfficeStatus
          left={<><span>Ready</span>{msg && <span className="truncate text-zinc-800">{msg}</span>}</>}
          right={multi ? <span className="flex gap-4">{nums.length > 0 && <span>Average: {fmtNum(nums.reduce((a, b) => a + b, 0) / nums.length)}</span>}<span>Count: {filled}</span>{nums.length > 0 && <span>Sum: {fmtNum(nums.reduce((a, b) => a + b, 0))}</span>}</span> : undefined}
          zoom={zoom}
          setZoom={setZoom}
        />
        {backstage && (
          <Backstage
            brand={brand}
            onBack={() => setBackstage(false)}
            onNew={() => { history.reset({ data: make(40, 14), fmt: {} }); setName("Book1"); setRev(0); setBackstage(false); }}
            newLabel="Blank workbook"
            onBrowse={() => { setBackstage(false); input.current?.click(); }}
            recent={officeRecent(fs, /\.(xlsx?|csv)$/i)}
            onOpenRecent={(path) => void fsBuffer(path).then((buffer) => buffer && importBuffer(baseName(path), buffer))}
            items={[
              { label: "Save", icon: Save, onClick: () => { saveNow(); setBackstage(false); } },
              { label: "Save a Copy", icon: Download, onClick: download },
              { label: "Export as CSV", icon: LuFileDown, onClick: () => void csvBlob().then((blob) => downloadBlob(`${name}.csv`, blob)).catch((error: Error) => setMsg(error.message)) },
              { label: "Rename", icon: LuFilePen, onClick: () => { const next = window.prompt("File name:", name)?.trim(); if (next) setName(next); } },
              { label: "Close", icon: X, onClick: close },
            ]}
          />
        )}
      </div>
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
