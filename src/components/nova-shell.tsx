import { useCallback, useEffect, useMemo, useRef, useState, type ComponentType, type CSSProperties, type ReactNode } from "react";
import {
  BatteryFull,
  Bell,
  BellOff,
  Briefcase,
  Brush,
  Calculator,
  Check,
  Command,
  Gamepad2,
  Globe2,
  Image as ImageIcon,
  LayoutGrid,
  Lock,
  Magnet,
  Moon,
  MoonStar,
  MousePointer2,
  Move3d,
  Orbit,
  Palette,
  Pin,
  PinOff,
  Power,
  RotateCw,
  Search,
  Settings,
  Sparkles,
  SquareStack,
  Sun,
  Timer,
  Volume2,
  Wifi,
  Wrench,
  X,
  Zap,
} from "lucide-react";

// NOVA OS: the reimagined desktop. It shares the apps and windows with PRIVATE OS
// but has its own shell: live wallpaper, Dynamic Island, magnifying dock, Orbit launcher,
// Nova Search, Control Center, Overview with live windows, and its own lock and boot screens.

type Icon = ComponentType<{ className?: string }>;
export type NovaApp = { id: string; label: string; icon: Icon };
export type NovaTheme = { id: string; name: string; sub: string; accent: string; base: string; colors: [string, string, string] };
export type NovaSettings = {
  novaTheme: string;
  novaPhoto: boolean;
  novaParallax: boolean;
  novaMagnify: boolean;
  novaHotCorner: boolean;
  novaNight: boolean;
  novaFocus: boolean;
  novaBright: number;
  novaPins: string[];
  userName: string;
  clock24: boolean;
  reduceMotion: boolean;
  lite: boolean;
  uiSounds: boolean;
  soundVolume: number;
};

export const NOVA_THEMES: NovaTheme[] = [
  { id: "aurora", name: "Aurora", sub: "Northern lights", accent: "#5eead4", base: "#04060e", colors: ["#10b981", "#3b82f6", "#a855f7"] },
  { id: "nebula", name: "Nebula", sub: "Deep space violet", accent: "#c4b5fd", base: "#07040f", colors: ["#7c3aed", "#db2777", "#1d4ed8"] },
  { id: "ember", name: "Ember", sub: "Glowing coals", accent: "#fdba74", base: "#0c0503", colors: ["#ea580c", "#be123c", "#f59e0b"] },
  { id: "glacier", name: "Glacier", sub: "Ice and light", accent: "#7dd3fc", base: "#030e16", colors: ["#0284c7", "#22d3ee", "#6366f1"] },
  { id: "verdant", name: "Verdant", sub: "Forest at dusk", accent: "#86efac", base: "#030b06", colors: ["#15803d", "#0d9488", "#65a30d"] },
  { id: "sakura", name: "Sakura", sub: "Blossom haze", accent: "#f9a8d4", base: "#0e050b", colors: ["#ec4899", "#f43f5e", "#8b5cf6"] },
  { id: "solar", name: "Solar", sub: "Golden flare", accent: "#fde047", base: "#0c0902", colors: ["#eab308", "#f97316", "#dc2626"] },
  { id: "graphite", name: "Graphite", sub: "Pure monochrome", accent: "#e4e4e7", base: "#050505", colors: ["#3f3f46", "#71717a", "#27272a"] },
];
export const novaTheme = (id: string) => NOVA_THEMES.find((theme) => theme.id === id) ?? NOVA_THEMES[0]!;
export const NOVA_PINS = ["files", "browser", "writer", "soundscapes", "settings"];
// The longer dock NOVA OS 2.2 shipped with; saved docks that still match it are shortened.
export const OLD_NOVA_PINS = ["files", "browser", "writer", "sheets", "slides", "mail", "soundscapes", "pulse", "settings"];

export function novaVars(theme: NovaTheme): CSSProperties {
  return {
    "--nova-a": theme.colors[0],
    "--nova-b": theme.colors[1],
    "--nova-c": theme.colors[2],
    "--nova-base": theme.base,
    "--primary": theme.accent,
    "--ring": theme.accent,
    "--primary-foreground": "#0a0a0a",
    "--scroll": theme.accent,
    "--background": theme.base,
    "--theme-base": theme.base,
    "--card": `color-mix(in oklab, ${theme.base} 70%, transparent)`,
    "--popover": `color-mix(in oklab, ${theme.base} 88%, transparent)`,
  } as CSSProperties;
}

const CATEGORIES: { id: string; label: string; icon: Icon; ids: string[] }[] = [
  { id: "work", label: "Work", icon: Briefcase, ids: ["writer", "sheets", "slides", "pdfreader", "notes", "mail", "todo", "calendar", "files", "contacts", "sticky", "messages"] },
  { id: "create", label: "Create", icon: Brush, ids: ["paint", "recorder", "camera", "photos", "media", "soundscapes"] },
  { id: "web", label: "Web", icon: Globe2, ids: ["browser", "figure", "beez", "youtube", "cherrion", "maps", "weather"] },
  { id: "play", label: "Play", icon: Gamepad2, ids: ["games", "minecraft"] },
  { id: "system", label: "System", icon: Wrench, ids: ["settings", "terminal", "taskmgr", "about", "pulse", "calc", "clock", "convert", "passwords", "focus"] },
];
const categoryOf = (id: string) => CATEGORIES.find((cat) => cat.ids.includes(id))?.id ?? "web";

// The Nova logo: a glowing core with a tilted orbit and a moon.
export function NovaMark({ className = "size-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden>
      <defs>
        <radialGradient id="nova-core" cx=".35" cy=".35" r=".8">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset=".55" style={{ stopColor: "var(--nova-a, #5eead4)" }} />
          <stop offset="1" style={{ stopColor: "var(--nova-b, #3b82f6)" }} />
        </radialGradient>
      </defs>
      <circle cx="16" cy="16" r="7.2" fill="url(#nova-core)" />
      <ellipse cx="16" cy="16" rx="14" ry="5.4" fill="none" stroke="currentColor" strokeOpacity=".75" strokeWidth="1.5" transform="rotate(-24 16 16)" />
      <circle cx="27.6" cy="10.8" r="1.9" fill="currentColor" />
    </svg>
  );
}

export function NovaWallpaper({ theme, photo, className = "absolute inset-0" }: { theme: NovaTheme; photo?: string | undefined; className?: string }) {
  return (
    <div aria-hidden className={`nova-wall overflow-hidden ${photo ? "nova-wall-photo" : ""} ${className}`} style={{ background: theme.base, ...novaVars(theme) }}>
      {photo && <img src={photo} alt="" className="nova-par-1 absolute -inset-[4%] size-[108%] max-w-none object-cover" />}
      <div className="nova-par-1 absolute -inset-[12%]">
        <span className="nova-blob nova-blob-a" style={{ "--c": theme.colors[0] } as CSSProperties} />
        <span className="nova-blob nova-blob-b" style={{ "--c": theme.colors[1] } as CSSProperties} />
        <span className="nova-blob nova-blob-c" style={{ "--c": theme.colors[2] } as CSSProperties} />
      </div>
      {!photo && <div className="nova-stars nova-par-2 absolute -inset-[8%]" />}
      <div className="nova-horizon" />
      <div className="nova-sweep" />
      <div className="nova-grain" />
    </div>
  );
}

function greetingFor(hour: number) {
  if (hour < 5) return "Good night";
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

function chime() {
  try {
    const Ctx = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctx) return;
    const ctx = new Ctx();
    [660, 880, 1320].forEach((freq, index) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const at = ctx.currentTime + index * 0.16;
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0, at);
      gain.gain.linearRampToValueAtTime(0.18, at + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, at + 0.9);
      osc.connect(gain).connect(ctx.destination);
      osc.start(at);
      osc.stop(at + 1);
    });
    window.setTimeout(() => void ctx.close(), 1800);
  } catch {
    // audio unavailable
  }
}

// Small, safe calculator for Nova Search: digits, operators and brackets only.
function calc(text: string): string | null {
  const expr = text.replace(/\s+/g, "").replace(/×/g, "*").replace(/÷/g, "/").replace(/,/g, ".");
  if (!/^[\d.+\-*/()%^]+$/.test(expr) || !/\d/.test(expr) || !/[+\-*/%^]/.test(expr)) return null;
  try {
    const value = Function(`"use strict"; return (${expr.replace(/\^/g, "**")});`)() as unknown;
    if (typeof value !== "number" || !Number.isFinite(value)) return null;
    return String(Math.round(value * 1e10) / 1e10);
  } catch {
    return null;
  }
}

type MenuItem = { label: string; icon?: Icon; run: () => void; danger?: boolean };
type Ctx = { x: number; y: number; items: MenuItem[] } | null;
type Notice = { id: number; title: string; body: string; at: number };
type Slot = { tx: number; ty: number; s: number; box: { l: number; t: number; w: number; h: number } };
type Panel = null | "launcher" | "search" | "control" | "center" | "menu";

export type NovaShellProps = {
  settings: NovaSettings;
  patch: (patch: Partial<NovaSettings>) => void;
  time: Date;
  zone: string;
  apps: NovaApp[];
  openWins: string[];
  minWins: string[];
  zOrder: string[];
  openApp: (id: string) => void;
  closeWindow: (id: string) => void;
  minimize: (id: string) => void;
  minimizeAll: () => void;
  raise: (id: string) => void;
  renderSlot: (id: string) => ReactNode;
  locked: boolean;
  setLocked: (value: boolean) => void;
  power: "on" | "sleep" | "off";
  setPower: (value: "on" | "sleep" | "off") => void;
  shutdown: () => void;
  battery: number;
  photo?: string | undefined;
  renderWidget: (id: string) => ReactNode;
  searchFiles: (query: string) => { key: string; label: string; run: () => void }[];
  webSearch: (query: string) => void;
  switchToPrivate: () => void;
  extra?: ReactNode;
};

export function NovaShell(p: NovaShellProps) {
  const { settings, patch, time, zone } = p;
  const theme = novaTheme(settings.novaTheme);
  const root = useRef<HTMLElement>(null);
  const motion = !settings.reduceMotion && !settings.lite;
  const [panel, setPanel] = useState<Panel>(null);
  const [overview, setOverview] = useState(false);
  const [ctx, setCtx] = useState<Ctx>(null);
  const [notices, setNotices] = useState<Notice[]>([]);
  const [toast, setToast] = useState<Notice | null>(null);
  const [timer, setTimer] = useState<{ end: number; total: number } | null>(null);
  const [now, setNow] = useState(() => Date.now());
  const [bounce, setBounce] = useState<string | null>(null);
  const [hover, setHover] = useState<number | null>(null);
  const dockEdge = useRef(0);
  const focusOn = useRef(settings.novaFocus);
  focusOn.current = settings.novaFocus;
  const seq = useRef(1);

  const toggle = (next: Exclude<Panel, null>) => {
    setCtx(null);
    setOverview(false);
    setPanel((current) => (current === next ? null : next));
  };

  const notify = useCallback((title: string, body = "") => {
    const item = { id: seq.current++, title, body, at: Date.now() };
    setNotices((list) => [item, ...list].slice(0, 30));
    if (!focusOn.current) setToast(item);
  }, []);

  useEffect(() => {
    if (!toast) return;
    const timeout = window.setTimeout(() => setToast(null), 3600);
    return () => window.clearTimeout(timeout);
  }, [toast]);

  const wasLocked = useRef(p.locked);
  useEffect(() => {
    if (wasLocked.current && !p.locked) notify(settings.userName ? `Welcome back, ${settings.userName}` : "Welcome to Nova", "Press Ctrl+K to search anything");
    wasLocked.current = p.locked;
  }, [p.locked, notify, settings.userName]);

  useEffect(() => {
    if (!timer) return;
    const interval = window.setInterval(() => {
      const at = Date.now();
      setNow(at);
      if (at >= timer.end) {
        setTimer(null);
        chime();
        notify("Focus session complete", "Nice work. Take a short break.");
      }
    }, 500);
    return () => window.clearInterval(interval);
  }, [timer, notify]);

  const startTimer = (minutes: number) => {
    setTimer({ end: Date.now() + minutes * 60000, total: minutes * 60000 });
    setNow(Date.now());
    notify(`Focus for ${minutes} minutes`, "The island counts down. Notifications stay quiet if Focus is on.");
  };

  // Wallpaper parallax follows the pointer.
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    if (!settings.novaParallax || !motion) {
      el.style.setProperty("--mx", "0");
      el.style.setProperty("--my", "0");
      return;
    }
    let frame = 0;
    let x = 0;
    let y = 0;
    const move = (event: PointerEvent) => {
      x = (event.clientX / window.innerWidth) * 2 - 1;
      y = (event.clientY / window.innerHeight) * 2 - 1;
      if (frame) return;
      frame = window.requestAnimationFrame(() => {
        frame = 0;
        el.style.setProperty("--mx", x.toFixed(3));
        el.style.setProperty("--my", y.toFixed(3));
      });
    };
    window.addEventListener("pointermove", move, { passive: true });
    return () => {
      window.removeEventListener("pointermove", move);
      window.cancelAnimationFrame(frame);
    };
  }, [settings.novaParallax, motion]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (p.locked || p.power !== "on") return;
      const mod = event.ctrlKey || event.metaKey;
      if ((mod && event.code === "KeyK") || (event.altKey && event.code === "KeyR")) { event.preventDefault(); toggle("search"); return; }
      if ((mod || event.altKey) && event.code === "Space") { event.preventDefault(); toggle("launcher"); return; }
      if ((event.altKey && (event.key === "Tab" || event.code === "KeyW")) || event.key === "F3") { event.preventDefault(); setPanel(null); setOverview((value) => !value); return; }
      if (event.altKey && event.code === "KeyL") { event.preventDefault(); p.setLocked(true); return; }
      if (event.altKey && event.code === "KeyC") { event.preventDefault(); toggle("control"); return; }
      if (event.altKey && event.code === "KeyN") { event.preventDefault(); toggle("center"); return; }
      if (event.altKey && ["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(event.key)) {
        event.preventDefault();
        window.dispatchEvent(new CustomEvent("pos-snap", { detail: event.key.replace("Arrow", "").toLowerCase() }));
        return;
      }
      if (event.key === "Escape") { setPanel(null); setOverview(false); setCtx(null); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  const byId = (id: string) => p.apps.find((app) => app.id === id);
  const visible = p.openWins.filter((id) => !p.minWins.includes(id));
  const topId = [...p.zOrder].reverse().find((id) => visible.includes(id)) ?? null;
  const topApp = topId ? byId(topId) : undefined;

  const launch = (id: string) => {
    if (!p.openWins.includes(id)) {
      setBounce(id);
      window.setTimeout(() => setBounce((value) => (value === id ? null : value)), 1000);
    }
    setPanel(null);
    setOverview(false);
    setCtx(null);
    p.openApp(id);
  };
  const pin = (id: string) => patch({ novaPins: settings.novaPins.includes(id) ? settings.novaPins.filter((item) => item !== id) : [...settings.novaPins, id] });

  // ---- Overview: every open window flies into a grid, live. ----
  const slotRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const [layout, setLayout] = useState<Record<string, Slot>>({});
  const layoutRef = useRef(layout);
  layoutRef.current = layout;
  useEffect(() => {
    if (!overview) {
      setLayout({});
      return;
    }
    const ids = p.openWins.filter((id) => !p.minWins.includes(id));
    const n = ids.length;
    if (!n) {
      setLayout({});
      return;
    }
    const W = window.innerWidth;
    const H = window.innerHeight;
    const area = { x: 40, y: 84, w: W - 80, h: H - 84 - 170 };
    const cols = n === 1 ? 1 : n <= 4 ? 2 : n <= 9 ? 3 : 4;
    const rows = Math.ceil(n / cols);
    const cw = area.w / cols;
    const ch = area.h / rows;
    const next: Record<string, Slot> = {};
    ids.forEach((id, index) => {
      const section = slotRefs.current[id]?.querySelector("section");
      const box = section?.getBoundingClientRect();
      if (!box || !box.width) return;
      const old = layoutRef.current[id];
      // Undo a transform that is already applied so we always measure the real window.
      const r = old ? { left: (box.left - old.tx) / old.s, top: (box.top - old.ty) / old.s, width: box.width / old.s, height: box.height / old.s } : { left: box.left, top: box.top, width: box.width, height: box.height };
      const col = index % cols;
      const row = Math.floor(index / cols);
      const inRow = row === rows - 1 ? n - row * cols : cols;
      const offset = ((cols - inRow) * cw) / 2;
      const s = Math.min((cw - 40) / r.width, (ch - 60) / r.height, 0.82);
      const kx = area.x + offset + col * cw + cw / 2;
      const ky = area.y + row * ch + (ch - 30) / 2;
      const tx = kx - s * (r.left + r.width / 2);
      const ty = ky - s * (r.top + r.height / 2);
      next[id] = { tx, ty, s, box: { l: tx + s * r.left, t: ty + s * r.top, w: s * r.width, h: s * r.height } };
    });
    setLayout(next);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [overview, p.openWins.join(), p.minWins.join()]);

  useEffect(() => {
    if (overview && p.openWins.length === 0) {
      const timeout = window.setTimeout(() => setOverview(false), 1600);
      return () => window.clearTimeout(timeout);
    }
    return undefined;
  }, [overview, p.openWins.length]);

  // ---- Clock and dates ----
  const hour12 = !settings.clock24;
  const clock = time.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12, timeZone: zone });
  const shortDate = time.toLocaleDateString(undefined, { weekday: "short", day: "numeric", month: "short", timeZone: zone });
  const longDate = time.toLocaleDateString(undefined, { weekday: "long", day: "numeric", month: "long", timeZone: zone });
  const hourNow = Number(time.toLocaleTimeString("en-GB", { hour: "2-digit", hour12: false, timeZone: zone }).slice(0, 2));
  const remaining = timer ? Math.max(0, timer.end - now) : 0;
  const mmss = `${String(Math.floor(remaining / 60000)).padStart(2, "0")}:${String(Math.floor((remaining % 60000) / 1000)).padStart(2, "0")}`;

  // ---- Dock with magnification ----
  type DockEntry = { key: string; label: string; icon: ReactNode; onClick: () => void; running?: boolean; focused?: boolean; onContext?: (event: React.MouseEvent) => void; tool?: boolean };
  const dockIds = [...settings.novaPins, ...p.openWins.filter((id) => !settings.novaPins.includes(id))];
  const dockEntries: DockEntry[] = [
    { key: "orbit", label: "Orbit (all apps)", icon: <span className="nova-dock-tool"><LayoutGrid className="size-[46%]" /></span>, onClick: () => toggle("launcher"), tool: true },
    ...dockIds.flatMap((id): DockEntry[] => {
      const app = byId(id);
      if (!app) return [];
      const AppIcon = app.icon;
      const running = p.openWins.includes(id);
      const focused = topId === id;
      return [{
        key: id,
        label: app.label,
        icon: <AppIcon className="size-full" />,
        running,
        focused,
        onClick: () => (focused ? p.minimize(id) : launch(id)),
        onContext: (event) => {
          event.preventDefault();
          event.stopPropagation();
          setPanel(null);
          setCtx({
            x: event.clientX,
            y: event.clientY,
            items: [
              { label: running ? "Show" : "Open", icon: AppWindowIcon, run: () => launch(id) },
              ...(running ? [{ label: "Minimize", icon: SquareStack, run: () => p.minimize(id) }, { label: "Quit", icon: X, run: () => p.closeWindow(id), danger: true }] : []),
              { label: settings.novaPins.includes(id) ? "Remove from dock" : "Keep in dock", icon: settings.novaPins.includes(id) ? PinOff : Pin, run: () => pin(id) },
            ],
          });
        },
      }];
    }),
  ];
  const magnify = settings.novaMagnify && motion;
  const STEP = 50;
  const scaleFor = (index: number) => {
    if (!magnify || hover === null) return 1;
    const d = hover - index;
    return 1 + 0.62 * Math.exp(-(d * d) / 2.4);
  };

  // ---- Search ----
  const actions: { label: string; hint: string; icon: Icon; keys: string; run: () => void }[] = useMemo(() => [
    { label: "Overview", hint: "See every window", icon: SquareStack, keys: "overview windows mission alt tab", run: () => setOverview(true) },
    { label: "Lock screen", hint: "Alt+L", icon: Lock, keys: "lock", run: () => p.setLocked(true) },
    { label: settings.novaFocus ? "Turn off Focus" : "Turn on Focus", hint: "Silence notifications", icon: MoonStar, keys: "focus dnd do not disturb quiet", run: () => patch({ novaFocus: !settings.novaFocus }) },
    { label: settings.novaNight ? "Turn off Night light" : "Turn on Night light", hint: "Warmer screen", icon: Moon, keys: "night light warm shift", run: () => patch({ novaNight: !settings.novaNight }) },
    { label: "Control Center", hint: "Alt+C", icon: Zap, keys: "control center quick settings brightness volume", run: () => setPanel("control") },
    { label: "Notifications and widgets", hint: "Alt+N", icon: Bell, keys: "notifications widgets center", run: () => setPanel("center") },
    { label: "Show desktop", hint: "Minimize everything", icon: SquareStack, keys: "desktop minimize hide", run: p.minimizeAll },
    { label: "Switch to PRIVATE OS", hint: "The classic desktop", icon: RotateCw, keys: "private os classic switch windows taskbar", run: p.switchToPrivate },
    { label: "Sleep", hint: "Press any key to wake", icon: Moon, keys: "sleep", run: () => p.setPower("sleep") },
    { label: "Restart", hint: "Reload Nova", icon: RotateCw, keys: "restart reload reboot", run: () => window.location.reload() },
    ...NOVA_THEMES.map((item) => ({ label: `Theme: ${item.name}`, hint: item.sub, icon: Palette, keys: `theme wallpaper color ${item.name.toLowerCase()}`, run: () => { patch({ novaTheme: item.id }); notify(`${item.name} theme`, item.sub); } })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
  ], [settings.novaFocus, settings.novaNight]);

  const overlayOpen = panel !== null || ctx !== null;
  const greeting = greetingFor(hourNow);
  const unread = notices.length;

  return (
    <main
      ref={root}
      data-nova=""
      data-lite={settings.lite ? "" : undefined}
      data-reduce={settings.reduceMotion ? "" : undefined}
      data-overview={overview ? "" : undefined}
      style={{ ...novaVars(theme), "--dock-h": "86px" } as CSSProperties}
      onContextMenu={(event) => {
        if ((event.target as HTMLElement).closest("section, nav, aside, [data-nova-ui]")) return;
        event.preventDefault();
        setPanel(null);
        setCtx({
          x: event.clientX,
          y: event.clientY,
          items: [
            { label: "Search everything", icon: Search, run: () => setPanel("search") },
            { label: "All apps", icon: LayoutGrid, run: () => setPanel("launcher") },
            { label: "Overview", icon: SquareStack, run: () => setOverview(true) },
            { label: "Change theme", icon: Palette, run: () => setPanel("control") },
            { label: "Settings", icon: Settings, run: () => launch("settings") },
            { label: "Switch to PRIVATE OS", icon: RotateCw, run: p.switchToPrivate },
          ],
        });
      }}
      onClick={(event) => {
        if (ctx) setCtx(null);
        if (panel && !(event.target as HTMLElement).closest("[data-nova-panel], [data-nova-ui]")) setPanel(null);
      }}
      className="nova-root relative h-dvh w-full overflow-hidden font-sans text-white"
    >
      <NovaWallpaper theme={theme} photo={settings.novaPhoto ? p.photo : undefined} />

      {/* Greeting on the desktop */}
      <div className="nova-greet pointer-events-none absolute left-[6vw] top-[17dvh] z-[2] max-w-[80vw] select-none">
        <p className="text-[clamp(2.1rem,5.2vw,4.2rem)] font-extralight leading-[1.05] tracking-tight text-white/90">
          {greeting},<br />
          <span className="nova-gradient-text font-normal">{settings.userName || "friend"}</span>
        </p>
        <p className="mt-4 text-sm text-white/55">{longDate} · {p.openWins.length ? `${p.openWins.length} ${p.openWins.length === 1 ? "window" : "windows"} open` : "Press Ctrl+K to search everything"}</p>
      </div>

      {/* Overview backdrop and labels */}
      {overview && (
        <div className="nova-overview absolute inset-0 z-[5]" onClick={() => setOverview(false)}>
          <p className="absolute inset-x-0 top-[54px] text-center text-[11px] font-semibold uppercase tracking-[.3em] text-white/50">{p.openWins.length ? "Overview · click a window · Esc to go back" : "No open windows"}</p>
        </div>
      )}

      {/* Windows. Each lives in its own full-screen slot so Overview can move it without touching the window. */}
      {p.openWins.map((id) => {
        const slot = layout[id];
        return (
          <div
            key={id}
            ref={(el) => { slotRefs.current[id] = el; }}
            className={`nova-slot ${overview ? "is-overview" : ""}`}
            style={{ zIndex: 10 + Math.max(0, p.zOrder.indexOf(id)), transform: slot ? `translate(${slot.tx}px, ${slot.ty}px) scale(${slot.s})` : undefined }}
          >
            {p.renderSlot(id)}
          </div>
        );
      })}

      {overview && (
        <div className="pointer-events-none absolute inset-0 z-[53]">
          {Object.entries(layout).map(([id, slot]) => {
            const app = byId(id);
            const AppIcon = app?.icon;
            return (
              <div key={id} className="nova-ov-tile pointer-events-auto absolute" style={{ left: slot.box.l, top: slot.box.t, width: slot.box.w, height: slot.box.h }}>
                <button type="button" aria-label={`Show ${app?.label ?? id}`} onClick={() => { setOverview(false); p.raise(id); }} className="absolute inset-0 rounded-[18px]" />
                <button type="button" aria-label={`Close ${app?.label ?? id}`} onClick={() => p.closeWindow(id)} className="nova-ov-close absolute -right-2.5 -top-2.5 grid size-7 place-items-center rounded-full bg-black/80 text-white ring-1 ring-white/20"><X className="size-3.5" /></button>
                <p className="absolute inset-x-0 -bottom-8 flex items-center justify-center gap-2 truncate text-xs font-medium text-white/90">{AppIcon && <AppIcon className="size-4" />}{app?.label ?? id}</p>
              </div>
            );
          })}
          {p.minWins.length > 0 && (
            <div className="pointer-events-auto absolute inset-x-0 bottom-[104px] flex flex-wrap justify-center gap-2 px-4">
              {p.minWins.map((id) => {
                const app = byId(id);
                const AppIcon = app?.icon;
                return (
                  <button key={id} type="button" onClick={() => launch(id)} className="nova-glass flex items-center gap-2 rounded-full px-3 py-1.5 text-xs">
                    {AppIcon && <AppIcon className="size-5" />}{app?.label ?? id}<span className="text-white/45">minimized</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Hot corner: touch the top-left corner for Overview */}
      {settings.novaHotCorner && !p.locked && (
        <div aria-hidden onMouseEnter={() => { if (!overlayOpen) setOverview((value) => !value); }} className="absolute left-0 top-0 z-[60] size-[6px]" />
      )}

      {/* Top-left: Nova menu and the app in front */}
      <div data-nova-ui className="nova-chip absolute left-3 top-2.5 z-[56] flex items-center">
        <button type="button" aria-label="Nova menu" onClick={() => toggle("menu")} className={`nova-glass flex h-9 items-center gap-2 rounded-full pl-2 pr-3.5 text-[13px] font-semibold transition-colors hover:bg-white/10 ${panel === "menu" ? "ring-1 ring-[var(--primary)]" : ""}`}>
          <NovaMark className="size-6 text-white" />
          <span key={topApp?.id ?? "nova"} className="max-w-[40vw] truncate [animation:nova-fade_.35s_ease]">{topApp?.label ?? "Nova"}</span>
        </button>
      </div>

      {/* The Dynamic Island */}
      <div data-nova-ui className="absolute left-1/2 top-2 z-[57] -translate-x-1/2">
        <button
          type="button"
          aria-label="Open Control Center"
          onClick={() => toggle("control")}
          className={`nova-island ${toast ? "is-toast" : timer ? "is-timer" : "is-idle"}`}
        >
          {toast ? (
            <span key={toast.id} className="flex w-full items-center gap-3 px-2 text-left [animation:nova-fade_.4s_.12s_both]">
              <span className="grid size-10 shrink-0 place-items-center rounded-full bg-[var(--primary)] text-black"><Sparkles className="size-5" /></span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[13px] font-semibold">{toast.title}</span>
                {toast.body && <span className="block truncate text-[11.5px] text-white/60">{toast.body}</span>}
              </span>
            </span>
          ) : timer ? (
            <span className="flex w-full items-center justify-between gap-2 px-1 [animation:nova-fade_.35s_both]">
              <svg viewBox="0 0 20 20" className="size-6 -rotate-90"><circle cx="10" cy="10" r="8" fill="none" stroke="rgb(255 255 255 / .15)" strokeWidth="2.5" /><circle cx="10" cy="10" r="8" fill="none" stroke="var(--primary)" strokeWidth="2.5" strokeLinecap="round" strokeDasharray={`${(remaining / timer.total) * 50.27} 50.27`} /></svg>
              <span className="text-[13px] font-semibold tabular-nums text-[var(--primary)]">{mmss}</span>
            </span>
          ) : (
            <span className="flex w-full items-center justify-center gap-2 text-[13px] font-semibold tabular-nums">
              {settings.novaFocus && <MoonStar className="size-3.5 text-[var(--primary)]" />}
              <span>{clock}</span>
              <span className="nova-island-more flex items-center gap-2 overflow-hidden whitespace-nowrap text-white/60"><span className="text-white/25">·</span>{shortDate}<span className="text-white/25">·</span><BatteryFull className="size-3.5" />{p.battery}%</span>
            </span>
          )}
        </button>
      </div>

      {/* Top-right: status and notifications */}
      <div data-nova-ui className="absolute right-3 top-2.5 z-[56] flex items-center gap-2">
        <button type="button" aria-label="Control Center" onClick={() => toggle("control")} className={`nova-glass flex h-9 items-center gap-2.5 rounded-full px-3.5 transition-colors hover:bg-white/10 ${panel === "control" ? "ring-1 ring-[var(--primary)]" : ""}`}>
          <Wifi className="size-4" /><Volume2 className="size-4" /><span className="flex items-center gap-1 text-[12px] font-semibold tabular-nums"><BatteryFull className="size-4" />{p.battery}%</span>
        </button>
        <button type="button" aria-label="Notifications and widgets" onClick={() => toggle("center")} className={`nova-glass relative grid size-9 place-items-center rounded-full transition-colors hover:bg-white/10 ${panel === "center" ? "ring-1 ring-[var(--primary)]" : ""}`}>
          {settings.novaFocus ? <BellOff className="size-4" /> : <Bell className="size-4" />}
          {unread > 0 && <span className="absolute -right-0.5 -top-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-[var(--primary)] px-1 text-[9px] font-bold text-black">{unread}</span>}
        </button>
      </div>

      {/* The dock */}
      <div data-nova-ui className="absolute inset-x-0 bottom-3 z-[54] flex justify-center px-2">
        <nav
          aria-label="Nova dock"
          onPointerEnter={(event) => { dockEdge.current = event.currentTarget.getBoundingClientRect().left + 12; }}
          onPointerMove={(event) => { if (magnify) setHover((event.clientX - dockEdge.current - 22) / STEP); }}
          onPointerLeave={() => setHover(null)}
          className="nova-dock nova-glass flex max-w-full items-end gap-1.5 overflow-x-auto overflow-y-visible rounded-[22px] px-2 pb-2 pt-2"
        >
          {dockEntries.map((entry, index) => {
            const s = scaleFor(index);
            const separator = index === 1;
            return (
              <div key={entry.key} className="contents">
                {separator && <span aria-hidden className="mx-0.5 mb-2 h-7 w-px shrink-0 self-end bg-white/15" />}
                <button
                  type="button"
                  aria-label={entry.label}
                  onClick={entry.onClick}
                  onContextMenu={entry.onContext}
                  className={`nova-dock-item group relative shrink-0 ${bounce === entry.key ? "is-bouncing" : ""}`}
                  style={{ width: 44 * s, height: 44 * s }}
                >
                  {entry.icon}
                  <span className="nova-tip">{entry.label}</span>
                  {entry.running && <span className={`nova-run ${entry.focused ? "is-focused" : ""}`} />}
                </button>
              </div>
            );
          })}
        </nav>
      </div>

      {/* Panels */}
      {panel === "launcher" && <OrbitLauncher apps={p.apps} launch={launch} pins={settings.novaPins} pin={pin} close={() => setPanel(null)} />}
      {panel === "search" && <NovaSearch apps={p.apps} actions={actions} launch={launch} files={p.searchFiles} web={(text) => { setPanel(null); p.webSearch(text); }} startTimer={startTimer} close={() => setPanel(null)} />}
      {panel === "control" && (
        <ControlCenter settings={settings} patch={patch} battery={p.battery} timer={timer ? mmss : null} startTimer={startTimer} stopTimer={() => setTimer(null)} openSettings={() => launch("settings")} switchOS={p.switchToPrivate} notify={notify} />
      )}
      {panel === "center" && (
        <aside data-nova-panel className="nova-glass nova-panel-right absolute bottom-[100px] right-3 top-14 z-[62] flex w-[min(23rem,calc(100%-1.5rem))] flex-col overflow-hidden rounded-[28px]">
          <div className="border-b border-white/10 px-5 pb-4 pt-5">
            <p className="text-[12px] font-semibold uppercase tracking-[.2em] text-[var(--primary)]">{time.toLocaleDateString(undefined, { weekday: "long", timeZone: zone })}</p>
            <p className="mt-1 text-3xl font-extralight">{time.toLocaleDateString(undefined, { day: "numeric", month: "long", timeZone: zone })}</p>
          </div>
          <div className="nova-scroll min-h-0 flex-1 space-y-3 overflow-y-auto p-4">
            <div className="flex items-center justify-between px-1">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-white/50">Notifications</p>
              {notices.length > 0 && <button type="button" onClick={() => setNotices([])} className="text-[11px] text-white/60 hover:text-white">Clear all</button>}
            </div>
            {notices.length === 0 && <p className="rounded-2xl bg-white/[.04] px-4 py-5 text-center text-xs text-white/50">You're all caught up.</p>}
            {notices.slice(0, 6).map((item) => (
              <div key={item.id} className="nova-notice flex gap-3 rounded-2xl bg-white/[.06] p-3">
                <span className="grid size-8 shrink-0 place-items-center rounded-full bg-[var(--primary)]/20 text-[var(--primary)]"><Sparkles className="size-4" /></span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-baseline justify-between gap-2"><span className="truncate text-[13px] font-semibold">{item.title}</span><span className="shrink-0 text-[10px] text-white/40">{new Date(item.at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12 })}</span></span>
                  {item.body && <span className="block text-[12px] text-white/60">{item.body}</span>}
                </span>
              </div>
            ))}
            <p className="px-1 pt-2 text-[11px] font-semibold uppercase tracking-wider text-white/50">Widgets</p>
            {["calendar", "music", "notes"].map((id) => <div key={id} className="nova-widget rounded-2xl bg-white/[.05] p-3">{p.renderWidget(id)}</div>)}
          </div>
        </aside>
      )}
      {panel === "menu" && (
        <aside data-nova-panel className="nova-glass nova-panel-left absolute left-3 top-14 z-[62] w-64 rounded-[24px] p-2 text-[13px]">
          <div className="flex items-center gap-3 rounded-2xl p-2.5">
            <span className="grid size-11 place-items-center rounded-full text-lg font-semibold text-black" style={{ background: `linear-gradient(135deg, ${theme.colors[0]}, ${theme.accent})` }}>{(settings.userName || "N").slice(0, 1).toUpperCase()}</span>
            <span className="min-w-0"><span className="block truncate font-semibold">{settings.userName || "Guest"}</span><span className="block text-[11px] text-white/50">NOVA OS · {theme.name}</span></span>
          </div>
          <div className="my-1 h-px bg-white/10" />
          {([
            ["About Nova", Sparkles, () => launch("about")],
            ["Settings", Settings, () => launch("settings")],
            ["Overview", SquareStack, () => { setPanel(null); setOverview(true); }],
            ["Lock", Lock, () => { setPanel(null); p.setLocked(true); }],
            ["Sleep", Moon, () => { setPanel(null); p.setPower("sleep"); }],
            ["Restart", RotateCw, () => window.location.reload()],
            ["Shut down", Power, () => { setPanel(null); p.shutdown(); }],
          ] as [string, Icon, () => void][]).map(([label, ItemIcon, run]) => (
            <button key={label} type="button" onClick={run} className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left hover:bg-white/10"><ItemIcon className="size-4 text-white/70" />{label}</button>
          ))}
          <div className="my-1 h-px bg-white/10" />
          <button type="button" onClick={p.switchToPrivate} className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-[var(--primary)] hover:bg-white/10"><RotateCw className="size-4" />Switch to PRIVATE OS</button>
        </aside>
      )}

      {ctx && (
        <div data-nova-ui role="menu" onClick={(event) => event.stopPropagation()} style={{ left: Math.min(ctx.x, window.innerWidth - 220), top: Math.min(ctx.y, window.innerHeight - ctx.items.length * 38 - 16) }} className="nova-glass nova-pop fixed z-[70] w-52 rounded-2xl p-1.5 text-[13px]">
          {ctx.items.map((item) => {
            const ItemIcon = item.icon;
            return (
              <button key={item.label} type="button" role="menuitem" onClick={() => { setCtx(null); item.run(); }} className={`flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-left hover:bg-white/10 ${item.danger ? "text-red-300" : ""}`}>
                {ItemIcon && <ItemIcon className="size-4 opacity-70" />}{item.label}
              </button>
            );
          })}
        </div>
      )}

      {/* Screen filters */}
      {settings.novaNight && <div aria-hidden className="pointer-events-none fixed inset-0 z-[79] bg-[#ff8a2a] opacity-[.2] mix-blend-multiply" />}
      {settings.novaBright < 100 && <div aria-hidden className="pointer-events-none fixed inset-0 z-[79] bg-black" style={{ opacity: ((100 - settings.novaBright) / 100) * 0.8 }} />}

      <NovaLock locked={p.locked} unlock={() => p.setLocked(false)} clock={clock} date={longDate} name={settings.userName} theme={theme} battery={p.battery} />

      {p.power !== "on" && (
        <div role="button" tabIndex={0} aria-label="Wake" onClick={() => { p.setPower("on"); p.setLocked(true); }} className="fixed inset-0 z-[85] grid cursor-pointer place-items-center bg-black text-[11px] tracking-[.3em] text-white/40">
          {p.power === "off" ? <span className="flex flex-col items-center gap-4"><NovaMark className="size-10 text-white/60" />PRESS ANY KEY TO POWER ON</span> : ""}
        </div>
      )}
      {p.extra}
    </main>
  );
}

const AppWindowIcon: Icon = ({ className }) => <Sparkles className={className} />;

function NovaLock({ locked, unlock, clock, date, name, theme, battery }: { locked: boolean; unlock: () => void; clock: string; date: string; name: string; theme: NovaTheme; battery: number }) {
  return (
    <div role="button" tabIndex={locked ? 0 : -1} aria-hidden={!locked} aria-label="Unlock Nova" onClick={unlock} className={`nova-lock fixed inset-0 z-[80] flex cursor-pointer select-none flex-col items-center text-white ${locked ? "" : "is-open"}`}>
      <p className="relative mt-[12dvh] text-[15px] font-medium text-white/75">{date}</p>
      <p className="nova-lock-time relative">{clock}</p>
      <div className="relative mb-[11dvh] mt-auto flex flex-col items-center">
        <span className="nova-avatar grid size-[72px] place-items-center rounded-full text-[28px] font-semibold text-black" style={{ background: `linear-gradient(135deg, ${theme.colors[0]}, ${theme.accent} 60%, ${theme.colors[2]})` }}>{(name || "N").slice(0, 1).toUpperCase()}</span>
        <p className="mt-3 text-lg font-semibold">{name || "Guest"}</p>
        <p className="nova-shimmer mt-5 text-[12px] font-medium tracking-wide">Click or press any key to unlock</p>
      </div>
      <div className="absolute bottom-5 right-6 flex items-center gap-3 text-xs text-white/65"><Wifi className="size-4" /><BatteryFull className="size-4" />{battery}%</div>
      <div className="absolute bottom-5 left-6 flex items-center gap-2 text-xs font-semibold tracking-[.25em] text-white/50"><NovaMark className="size-4 text-white/60" />NOVA</div>
    </div>
  );
}

function OrbitLauncher({ apps, launch, pins, pin, close }: { apps: NovaApp[]; launch: (id: string) => void; pins: string[]; pin: (id: string) => void; close: () => void }) {
  const [query, setQuery] = useState("");
  const [cat, setCat] = useState("all");
  const [menu, setMenu] = useState<{ id: string; x: number; y: number } | null>(null);
  const list = apps.filter((app) => (cat === "all" || categoryOf(app.id) === cat) && app.label.toLowerCase().includes(query.toLowerCase()));
  return (
    <div data-nova-panel onClick={() => (menu ? setMenu(null) : close())} className="nova-orbit fixed inset-0 z-[62] flex flex-col items-center px-4 pb-14 pt-[9dvh]">
      <div onClick={(event) => event.stopPropagation()} className="flex w-[min(38rem,100%)] flex-col items-center">
        <label className="nova-glass flex h-12 w-full items-center gap-3 rounded-2xl px-4">
          <Search className="size-4 text-white/60" />
          <input autoFocus value={query} onChange={(event) => setQuery(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter" && list[0]) launch(list[0].id); }} placeholder="Search apps" aria-label="Search apps" className="h-full w-full bg-transparent text-[15px] outline-none placeholder:text-white/40" />
        </label>
        <div className="mt-4 flex flex-wrap justify-center gap-1.5">
          {[{ id: "all", label: "All", icon: Orbit }, ...CATEGORIES].map((item) => {
            const CatIcon = item.icon;
            return (
              <button key={item.id} type="button" onClick={() => setCat(item.id)} className={`flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[12px] font-semibold transition-colors ${cat === item.id ? "bg-white text-black" : "bg-white/10 text-white/80 hover:bg-white/15"}`}><CatIcon className="size-3.5" />{item.label}</button>
            );
          })}
        </div>
      </div>
      <div onClick={(event) => event.stopPropagation()} className="nova-scroll mt-8 grid w-[min(60rem,100%)] flex-1 grid-cols-3 content-start gap-x-2 gap-y-5 overflow-y-auto sm:grid-cols-5 md:grid-cols-7">
        {list.map((app, index) => {
          const AppIcon = app.icon;
          return (
            <button
              key={`${cat}-${app.id}`}
              type="button"
              onClick={() => launch(app.id)}
              onContextMenu={(event) => { event.preventDefault(); setMenu({ id: app.id, x: event.clientX, y: event.clientY }); }}
              style={{ animationDelay: `${Math.min(index, 28) * 16}ms` }}
              className="nova-app-tile flex flex-col items-center gap-2 rounded-2xl p-2"
            >
              <span className="relative size-[60px] md:size-[68px]"><AppIcon className="size-full" />{pins.includes(app.id) && <span className="absolute -bottom-1 left-1/2 size-1 -translate-x-1/2 rounded-full bg-white/70" />}</span>
              <span className="line-clamp-2 text-center text-[12px] font-medium leading-tight text-white/90">{app.label}</span>
            </button>
          );
        })}
        {list.length === 0 && <p className="col-span-full pt-10 text-center text-sm text-white/50">No apps match “{query}”.</p>}
      </div>
      {menu && (
        <div onClick={(event) => event.stopPropagation()} style={{ left: Math.min(menu.x, window.innerWidth - 200), top: menu.y }} className="nova-glass nova-pop fixed z-[70] w-48 rounded-2xl p-1.5 text-[13px]">
          <button type="button" onClick={() => launch(menu.id)} className="flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-left hover:bg-white/10">Open</button>
          <button type="button" onClick={() => { pin(menu.id); setMenu(null); }} className="flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-left hover:bg-white/10">{pins.includes(menu.id) ? <><PinOff className="size-4 opacity-70" />Remove from dock</> : <><Pin className="size-4 opacity-70" />Keep in dock</>}</button>
        </div>
      )}
      <p className="pointer-events-none absolute bottom-6 text-[11px] text-white/40">Right-click an app to keep it in the dock · Esc to close</p>
    </div>
  );
}

type Hit = { key: string; label: string; hint: string; icon?: Icon | undefined; node?: ReactNode; run: () => void };

function NovaSearch({ apps, actions, launch, files, web, startTimer, close }: { apps: NovaApp[]; actions: { label: string; hint: string; icon: Icon; keys: string; run: () => void }[]; launch: (id: string) => void; files: (query: string) => { key: string; label: string; run: () => void }[]; web: (query: string) => void; startTimer: (minutes: number) => void; close: () => void }) {
  const [text, setText] = useState("");
  const [index, setIndex] = useState(0);
  const query = text.trim().toLowerCase();
  const math = calc(text);
  const focusMatch = /^(?:focus|timer)\s*(\d{1,3})/.exec(query);
  const groups: { title: string; hits: Hit[] }[] = [];
  if (math !== null) groups.push({ title: "Calculator", hits: [{ key: "math", label: `${text.trim()} = ${math}`, hint: "Copy", icon: Calculator, run: () => { void navigator.clipboard?.writeText(math).catch(() => {}); } }] });
  if (focusMatch) {
    const minutes = Math.max(1, Math.min(180, Number(focusMatch[1])));
    groups.push({ title: "Focus", hits: [{ key: "focus", label: `Start a ${minutes}-minute focus session`, hint: "Island timer", icon: Timer, run: () => startTimer(minutes) }] });
  }
  const appHits = apps.filter((app) => !query || app.label.toLowerCase().includes(query)).slice(0, query ? 6 : 8);
  if (appHits.length) groups.push({ title: query ? "Apps" : "Suggested", hits: appHits.map((app) => ({ key: `app-${app.id}`, label: app.label, hint: "Open", node: <app.icon className="size-7" />, run: () => launch(app.id) })) });
  if (query) {
    const actionHits = actions.filter((action) => action.label.toLowerCase().includes(query) || action.keys.includes(query)).slice(0, 5);
    if (actionHits.length) groups.push({ title: "Actions", hits: actionHits.map((action) => ({ key: `act-${action.label}`, label: action.label, hint: action.hint, icon: action.icon, run: action.run })) });
    const fileHits = query.length >= 2 ? files(query).slice(0, 5) : [];
    if (fileHits.length) groups.push({ title: "Files", hits: fileHits.map((file) => ({ ...file, hint: "File", icon: ImageIcon })) });
    groups.push({ title: "Web", hits: [{ key: "web", label: `Search the web for “${text.trim()}”`, hint: "Comet", icon: Globe2, run: () => web(text.trim()) }] });
  }
  const flat = groups.flatMap((group) => group.hits);
  const run = (hit: Hit | undefined) => {
    if (!hit) return;
    close();
    hit.run();
  };
  let n = -1;
  return (
    <div data-nova-panel onClick={close} className="fixed inset-0 z-[64] flex items-start justify-center bg-black/30 px-3 pt-[13dvh] backdrop-blur-[6px]">
      <div onClick={(event) => event.stopPropagation()} className="nova-glass nova-search nova-pop w-[min(40rem,100%)] overflow-hidden rounded-[26px]">
        <div className="flex items-center gap-3 px-5">
          <NovaMark className="size-6 shrink-0 text-white/80" />
          <input
            autoFocus
            value={text}
            aria-label="Nova Search"
            placeholder="Search apps, files, actions, or type 12*8, focus 25…"
            onChange={(event) => { setText(event.target.value); setIndex(0); }}
            onKeyDown={(event) => {
              if (event.key === "ArrowDown") { event.preventDefault(); setIndex((value) => Math.min(value + 1, flat.length - 1)); }
              else if (event.key === "ArrowUp") { event.preventDefault(); setIndex((value) => Math.max(value - 1, 0)); }
              else if (event.key === "Enter") { event.preventDefault(); run(flat[index]); }
            }}
            className="h-16 w-full bg-transparent text-[18px] font-light outline-none placeholder:text-white/35"
          />
          <kbd className="hidden shrink-0 rounded-md border border-white/15 px-1.5 py-0.5 text-[10px] text-white/50 sm:block"><Command className="mr-0.5 inline size-3" />K</kbd>
        </div>
        {flat.length > 0 && (
          <div className="nova-scroll max-h-[52dvh] overflow-y-auto border-t border-white/10 p-2">
            {groups.map((group) => (
              <div key={group.title} className="mb-1">
                <p className="px-3 pb-1 pt-2 text-[10.5px] font-semibold uppercase tracking-wider text-white/40">{group.title}</p>
                {group.title === "Suggested" ? (
                  <div className="grid grid-cols-4 gap-1 sm:grid-cols-8">
                    {group.hits.map((hit) => {
                      n += 1;
                      const at = n;
                      return (
                        <button key={hit.key} type="button" onMouseEnter={() => setIndex(at)} onClick={() => run(hit)} className={`flex flex-col items-center gap-1.5 rounded-xl p-2 text-[10.5px] ${at === index ? "bg-white/10" : "hover:bg-white/5"}`}>
                          <span className="size-10 [&>svg]:size-full">{hit.node}</span>
                          <span className="w-full truncate text-center text-white/80">{hit.label}</span>
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  group.hits.map((hit) => {
                    n += 1;
                    const at = n;
                    const HitIcon = hit.icon;
                    return (
                      <button key={hit.key} type="button" onMouseEnter={() => setIndex(at)} onClick={() => run(hit)} className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-[13.5px] ${at === index ? "bg-[var(--primary)]/20" : ""}`}>
                        <span className="grid size-7 shrink-0 place-items-center">{hit.node ?? (HitIcon ? <HitIcon className="size-[18px] text-white/75" /> : null)}</span>
                        <span className="min-w-0 flex-1 truncate">{hit.label}</span>
                        <span className="shrink-0 text-[11px] text-white/40">{hit.hint}</span>
                      </button>
                    );
                  })
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ControlCenter({ settings, patch, battery, timer, startTimer, stopTimer, openSettings, switchOS, notify }: { settings: NovaSettings; patch: (patch: Partial<NovaSettings>) => void; battery: number; timer: string | null; startTimer: (minutes: number) => void; stopTimer: () => void; openSettings: () => void; switchOS: () => void; notify: (title: string, body?: string) => void }) {
  const theme = novaTheme(settings.novaTheme);
  const tiles: { label: string; sub: string; icon: Icon; on: boolean; flip: () => void }[] = [
    { label: "Focus", sub: settings.novaFocus ? "On" : "Off", icon: MoonStar, on: settings.novaFocus, flip: () => patch({ novaFocus: !settings.novaFocus }) },
    { label: "Night light", sub: settings.novaNight ? "Warm" : "Off", icon: Sun, on: settings.novaNight, flip: () => patch({ novaNight: !settings.novaNight }) },
    { label: "Parallax", sub: "Wallpaper depth", icon: Move3d, on: settings.novaParallax, flip: () => patch({ novaParallax: !settings.novaParallax }) },
    { label: "Magnify", sub: "Dock zoom", icon: Magnet, on: settings.novaMagnify, flip: () => patch({ novaMagnify: !settings.novaMagnify }) },
    { label: "Hot corner", sub: "Top-left = Overview", icon: MousePointer2, on: settings.novaHotCorner, flip: () => patch({ novaHotCorner: !settings.novaHotCorner }) },
    { label: "Sounds", sub: "Clicks and hovers", icon: Volume2, on: settings.uiSounds, flip: () => patch({ uiSounds: !settings.uiSounds }) },
  ];
  return (
    <aside data-nova-panel className="nova-glass nova-panel-right nova-scroll absolute right-3 top-14 z-[62] max-h-[calc(100dvh-170px)] w-[min(23rem,calc(100%-1.5rem))] overflow-y-auto rounded-[28px] p-4">
      <div className="grid grid-cols-2 gap-2">
        <div className="col-span-2 flex items-center gap-3 rounded-2xl bg-white/[.06] p-3">
          <span className="grid size-10 place-items-center rounded-full bg-[var(--primary)] text-black"><Wifi className="size-5" /></span>
          <span className="min-w-0 flex-1"><span className="block text-[13px] font-semibold">Connected</span><span className="block text-[11px] text-white/50">Private network</span></span>
          <span className="flex items-center gap-1 text-[12px] font-semibold tabular-nums text-white/70"><BatteryFull className="size-4" />{battery}%</span>
        </div>
        {tiles.map((tile) => {
          const TileIcon = tile.icon;
          return (
            <button key={tile.label} type="button" role="switch" aria-checked={tile.on} onClick={tile.flip} className={`nova-tile flex items-center gap-2.5 rounded-2xl p-3 text-left transition-all ${tile.on ? "bg-white text-black" : "bg-white/[.06] hover:bg-white/10"}`}>
              <TileIcon className={`size-[18px] shrink-0 ${tile.on ? "text-black" : "text-white/75"}`} />
              <span className="min-w-0"><span className="block truncate text-[12.5px] font-semibold">{tile.label}</span><span className={`block truncate text-[10.5px] ${tile.on ? "text-black/55" : "text-white/45"}`}>{tile.sub}</span></span>
            </button>
          );
        })}
      </div>
      <div className="mt-3 space-y-3 rounded-2xl bg-white/[.06] p-3.5">
        <label className="flex items-center gap-3"><Sun className="size-4 shrink-0 text-white/70" /><input type="range" min={30} max={100} value={settings.novaBright} aria-label="Brightness" onChange={(event) => patch({ novaBright: Number(event.target.value) })} className="nova-range w-full" /></label>
        <label className="flex items-center gap-3"><Volume2 className="size-4 shrink-0 text-white/70" /><input type="range" min={0} max={100} value={settings.soundVolume} aria-label="Volume" onChange={(event) => patch({ soundVolume: Number(event.target.value) })} className="nova-range w-full" /></label>
      </div>
      <div className="mt-3 rounded-2xl bg-white/[.06] p-3.5">
        <p className="flex items-center justify-between text-[12px] font-semibold"><span className="flex items-center gap-2"><Timer className="size-4 text-[var(--primary)]" />Focus timer</span>{timer && <span className="tabular-nums text-[var(--primary)]">{timer}</span>}</p>
        <div className="mt-2.5 grid grid-cols-4 gap-1.5">
          {timer ? (
            <button type="button" onClick={stopTimer} className="col-span-4 rounded-xl bg-white/10 py-2 text-[12px] font-semibold hover:bg-white/15">Stop</button>
          ) : (
            [5, 15, 25, 50].map((minutes) => <button key={minutes} type="button" onClick={() => startTimer(minutes)} className="rounded-xl bg-white/10 py-2 text-[12px] font-semibold hover:bg-[var(--primary)] hover:text-black">{minutes}m</button>)
          )}
        </div>
      </div>
      <div className="mt-3 rounded-2xl bg-white/[.06] p-3.5">
        <p className="flex items-center justify-between text-[12px] font-semibold"><span className="flex items-center gap-2"><Palette className="size-4 text-[var(--primary)]" />Theme</span><span className="text-white/60">{theme.name}</span></p>
        <div className="mt-3 grid grid-cols-8 gap-1.5">
          {NOVA_THEMES.map((item) => (
            <button key={item.id} type="button" aria-label={`${item.name} theme`} title={item.name} aria-pressed={item.id === theme.id} onClick={() => { patch({ novaTheme: item.id }); notify(`${item.name} theme`, item.sub); }} className={`nova-swatch aspect-square rounded-full ${item.id === theme.id ? "is-on" : ""}`} style={{ background: `conic-gradient(from 200deg, ${item.colors[0]}, ${item.colors[1]}, ${item.colors[2]}, ${item.colors[0]})` }}>
              {item.id === theme.id && <Check className="m-auto size-3.5 text-white drop-shadow" />}
            </button>
          ))}
        </div>
        <button type="button" role="switch" aria-checked={settings.novaPhoto} onClick={() => patch({ novaPhoto: !settings.novaPhoto })} className="mt-3 flex w-full items-center justify-between rounded-xl px-1 py-1 text-[12px]">
          <span className="flex items-center gap-2"><ImageIcon className="size-4 text-white/70" />Use my photo wallpaper</span>
          <span className={`relative h-5 w-9 rounded-full transition-colors ${settings.novaPhoto ? "bg-[var(--primary)]" : "bg-white/15"}`}><span className={`absolute top-0.5 size-4 rounded-full bg-white shadow transition-[left] ${settings.novaPhoto ? "left-[18px]" : "left-0.5"}`} /></span>
        </button>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2">
        <button type="button" onClick={openSettings} className="flex items-center justify-center gap-2 rounded-2xl bg-white/[.06] py-2.5 text-[12px] font-semibold hover:bg-white/10"><Settings className="size-4" />Settings</button>
        <button type="button" onClick={switchOS} className="flex items-center justify-center gap-2 rounded-2xl bg-white/[.06] py-2.5 text-[12px] font-semibold hover:bg-white/10"><RotateCw className="size-4" />PRIVATE OS</button>
      </div>
    </aside>
  );
}

// ---- Start and boot screens ----
export function NovaStart({ theme, onStart }: { theme: NovaTheme; onStart: () => void }) {
  return (
    <main onClick={onStart} className="nova-boot relative flex h-dvh cursor-pointer flex-col items-center justify-center overflow-hidden text-white" style={novaVars(theme)}>
      <NovaWallpaper theme={theme} className="absolute inset-0 opacity-50" />
      <div className="relative flex flex-col items-center">
        <NovaOrb />
        <h1 className="nova-word mt-10">NOVA</h1>
        <p className="mt-3 text-[11px] uppercase tracking-[.42em] text-white/50 [animation:nova-fade_1s_.9s_both]">Private OS, reimagined</p>
        <span className="nova-start-btn mt-12 [animation:nova-fade_1s_1.3s_both]">Click to start</span>
      </div>
      <p className="absolute bottom-6 text-[10px] tracking-wide text-white/30">Press ENTER twice to skip</p>
    </main>
  );
}

const BOOT_LINES = ["Waking the island", "Mixing the light", "Polishing glass", "Tuning animations", "Almost there"];
export function NovaBoot({ theme }: { theme: NovaTheme }) {
  const [line, setLine] = useState(0);
  useEffect(() => {
    const interval = window.setInterval(() => setLine((value) => Math.min(value + 1, BOOT_LINES.length - 1)), 520);
    return () => window.clearInterval(interval);
  }, []);
  return (
    <main className="nova-boot relative flex h-dvh flex-col items-center justify-center overflow-hidden text-white" style={novaVars(theme)}>
      <div className="relative flex flex-col items-center">
        <NovaOrb fast />
        <div className="mt-14 h-[3px] w-48 overflow-hidden rounded-full bg-white/10"><div className="nova-boot-bar h-full rounded-full" /></div>
        <p key={line} className="mt-4 text-[12px] text-white/55 [animation:nova-fade_.4s_both]">{BOOT_LINES[line]}…</p>
      </div>
    </main>
  );
}

function NovaOrb({ fast = false }: { fast?: boolean }) {
  return (
    <div aria-hidden className={`nova-orb ${fast ? "is-fast" : ""}`}>
      <span className="nova-orb-core" />
      <span className="nova-orb-ring nova-orb-ring-a" />
      <span className="nova-orb-ring nova-orb-ring-b" />
      <span className="nova-orb-ring nova-orb-ring-c" />
    </div>
  );
}

// Tile used for the Nova-only app icons.
export function NovaTile({ className, from, to, children }: { className?: string | undefined; from: string; to: string; children: ReactNode }) {
  return (
    <span className={`nova-icon-tile relative inline-grid shrink-0 place-items-center overflow-hidden rounded-[24%] text-white [&>svg]:size-[54%] ${className ?? ""}`} style={{ background: `linear-gradient(145deg, ${from}, ${to})` }}>
      {children}
    </span>
  );
}

