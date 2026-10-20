import { useEffect, useMemo, useRef, useState, type ComponentType, type CSSProperties, type ReactNode } from "react";
import {
  BellOff,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Gauge,
  Image as ImageIcon,
  ImagePlus,
  Info,
  LayoutDashboard,
  LayoutPanelLeft,
  Moon,
  MoonStar,
  Palette,
  Play,
  Plus,
  RotateCw,
  Search,
  ShieldCheck,
  Sparkles,
  Sun,
  SunDim,
  Trash2,
  UserRound,
  Volume1,
  Volume2,
  X,
} from "lucide-react";
import { NOVA_PINS, NOVA_SETTINGS_EVENT, NOVA_THEMES, NOVA_WIDGETS, NovaMark, novaTheme, takeSettingsSpace, type NovaApp, type NovaSettings, type NovaTheme } from "@/components/nova-shell";
import { NOVA_WALLS, NovaWallpaper, novaWallName } from "@/components/nova-walls";

// NOVA OS Settings. Not a list of pages: it opens on a home made of live tiles
// (your desktop, theme orbit, quick toggles), and each space slides in with its
// own mini dock to hop between spaces. Nothing here is shared with PRIVATE OS.

type Icon = ComponentType<{ className?: string }>;
export type NovaSettingsData = NovaSettings & { soundHover: boolean; soundClick: boolean; timeZone: string; autoLock: number };
type Wall = { label: string; thumb: string; src?: string; video?: string };
type Props = {
  settings: NovaSettingsData;
  patch: (patch: Partial<NovaSettingsData>) => void;
  apps: NovaApp[];
  version: string;
  changelog: { v: string; date: string; items: string[] }[];
  walls: Wall[];
  customFrom: number;
  customIds: number[];
  addWall: (file: File) => Promise<number | null>;
  removeWall: (id: number) => void | Promise<void>;
  switchToPrivate: () => void;
  optimize: () => void;
  restartSetup: () => void;
  wisp: { servers: string[]; probe: (url: string) => Promise<boolean> };
};

type Space = { id: string; label: string; blurb: string; icon: Icon; hue: [string, string] };
const SPACES: Space[] = [
  { id: "wallpaper", label: "Wallpaper", blurb: "Live scenes, photos and depth", icon: ImageIcon, hue: ["#22d3ee", "#6366f1"] },
  { id: "desktop", label: "Desktop", blurb: "Greeting, shortcuts and widgets", icon: LayoutDashboard, hue: ["#34d399", "#0891b2"] },
  { id: "themes", label: "Themes", blurb: "The colours of everything", icon: Palette, hue: ["#f472b6", "#a855f7"] },
  { id: "dock", label: "Dock", blurb: "Your apps and the hot corner", icon: LayoutPanelLeft, hue: ["#38bdf8", "#2563eb"] },
  { id: "display", label: "Display", blurb: "Brightness and night light", icon: Sun, hue: ["#fde047", "#f97316"] },
  { id: "sound", label: "Sound", blurb: "Clicks, hovers and volume", icon: Volume2, hue: ["#fb7185", "#e11d48"] },
  { id: "focus", label: "Focus", blurb: "Quiet notifications", icon: MoonStar, hue: ["#a5b4fc", "#4f46e5"] },
  { id: "clock", label: "Clock", blurb: "Time zone and format", icon: Clock3, hue: ["#5eead4", "#0d9488"] },
  { id: "privacy", label: "Privacy", blurb: "Lock, Comet and proxy", icon: ShieldCheck, hue: ["#86efac", "#16a34a"] },
  { id: "speed", label: "Speed", blurb: "Optimize, lite mode, motion", icon: Gauge, hue: ["#fdba74", "#ea580c"] },
  { id: "profile", label: "Profile", blurb: "Your name", icon: UserRound, hue: ["#c4b5fd", "#7c3aed"] },
  { id: "about", label: "About", blurb: "Version, updates and reset", icon: Info, hue: ["#e4e4e7", "#52525b"] },
];
const spaceOf = (id: string) => SPACES.find((space) => space.id === id) ?? SPACES[0]!;

// Every single setting, so search can jump straight to it.
const INDEX: { key: string; label: string; space: string; words: string }[] = [
  { key: "scene", label: "Live wallpaper", space: "wallpaper", words: "wallpaper background aurora fluid dunes planet tide bloom silk cosmos animated" },
  { key: "photos", label: "Photo wallpaper", space: "wallpaper", words: "photo picture image upload video background" },
  { key: "depth", label: "Depth effect", space: "wallpaper", words: "parallax mouse move 3d" },
  { key: "dim", label: "Dim wallpaper", space: "wallpaper", words: "darken dark wallpaper" },
  { key: "shuffle", label: "Wallpaper shuffle", space: "wallpaper", words: "shuffle rotate change wallpaper every minutes slideshow" },
  { key: "greet", label: "Desktop greeting", space: "desktop", words: "greeting hello clock big time desktop name" },
  { key: "greetpos", label: "Greeting position", space: "desktop", words: "left centre center position" },
  { key: "widgets", label: "Desktop widgets", space: "desktop", words: "widgets calendar music notes stopwatch desktop" },
  { key: "icons", label: "Desktop shortcuts", space: "desktop", words: "icons shortcuts apps desktop" },
  { key: "island", label: "Dynamic Island", space: "desktop", words: "island notch top clock pill" },
  { key: "glass", label: "Glass style", space: "desktop", words: "glass blur transparent clear frosted solid panels" },
  { key: "theme", label: "Theme", space: "themes", words: "colour color accent aurora nebula ember glacier verdant sakura solar graphite" },
  { key: "pins", label: "Dock apps", space: "dock", words: "dock pin unpin apps taskbar" },
  { key: "magnify", label: "Magnify dock", space: "dock", words: "magnification zoom dock hover" },
  { key: "corner", label: "Hot corner", space: "dock", words: "overview corner windows" },
  { key: "docksize", label: "Dock size", space: "dock", words: "dock icon size big small" },
  { key: "dockhide", label: "Auto-hide the dock", space: "dock", words: "dock hide auto hidden" },
  { key: "bright", label: "Brightness", space: "display", words: "screen dim light" },
  { key: "night", label: "Night light", space: "display", words: "warm night blue light eyes" },
  { key: "sounds", label: "Interface sounds", space: "sound", words: "sound audio click hover effects" },
  { key: "volume", label: "Volume", space: "sound", words: "loud quiet sound" },
  { key: "focus", label: "Focus", space: "focus", words: "do not disturb quiet notifications" },
  { key: "clock24", label: "24-hour clock", space: "clock", words: "time format am pm" },
  { key: "zone", label: "Time zone", space: "clock", words: "time zone city country" },
  { key: "lock", label: "Lock automatically", space: "privacy", words: "auto lock screen idle" },
  { key: "reddit", label: "Reddit in Comet", space: "privacy", words: "reddit comet browser" },
  { key: "bookmarks", label: "Clear bookmarks", space: "privacy", words: "bookmarks comet browser" },
  { key: "proxy", label: "Proxy server", space: "privacy", words: "proxy wisp server network comet" },
  { key: "optimize", label: "Optimize", space: "speed", words: "optimize optimise fast slow performance lag speed" },
  { key: "lite", label: "Lite mode", space: "speed", words: "fast slow performance lag" },
  { key: "motion", label: "Reduce motion", space: "speed", words: "animations motion" },
  { key: "name", label: "Your name", space: "profile", words: "name account user profile" },
  { key: "switch", label: "Switch to PRIVATE OS", space: "about", words: "private os classic edition switch" },
  { key: "setup", label: "Run setup again", space: "about", words: "welcome setup start" },
  { key: "erase", label: "Erase everything", space: "about", words: "reset erase delete wipe" },
  { key: "news", label: "What's new", space: "about", words: "changelog version update news" },
];

function SpaceIcon({ space, size = 44, className = "" }: { space: Space; size?: number; className?: string }) {
  const SIcon = space.icon;
  return (
    <span className={`nsx-glyph ${className}`} style={{ width: size, height: size, "--g1": space.hue[0], "--g2": space.hue[1] } as CSSProperties}>
      <SIcon className="size-[48%]" />
    </span>
  );
}

function Toggle({ on, flip, label }: { on: boolean; flip: () => void; label: string }) {
  return (
    <button type="button" role="switch" aria-checked={on} aria-label={label} onClick={flip} className={`nsx-toggle ${on ? "is-on" : ""}`}>
      <span />
    </button>
  );
}

// A thick Control Center style slider: the fill is the value.
function Fader({ value, min = 0, max = 100, set, label, icon: FIcon, unit = "%" }: { value: number; min?: number; max?: number; set: (value: number) => void; label: string; icon: Icon; unit?: string }) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <label className="nsx-fader" style={{ "--fill": `${pct}%` } as CSSProperties}>
      <span className="nsx-fader-fill" />
      <FIcon className="relative z-[1] ml-3.5 size-[18px] shrink-0 text-black/70" />
      <span className="relative z-[1] ml-auto mr-4 text-[12px] font-semibold tabular-nums text-white/80">{Math.round(value)}{unit}</span>
      <input type="range" aria-label={label} min={min} max={max} value={value} onChange={(event) => set(Number(event.target.value))} />
    </label>
  );
}

function Pane({ title, children, className = "" }: { title?: string; children: ReactNode; className?: string }) {
  return (
    <section className={`nsx-pane nsx-rise ${className}`}>
      {title && <h3 className="nsx-pane-title">{title}</h3>}
      {children}
    </section>
  );
}

function Line({ id, label, hint, children }: { id?: string; label: string; hint?: string; children?: ReactNode }) {
  return (
    <div data-setting={id} className="nsx-line">
      <div className="min-w-0 flex-1">
        <p className="text-[13.5px] font-semibold text-white/95">{label}</p>
        {hint && <p className="mt-0.5 text-[12px] leading-snug text-white/55">{hint}</p>}
      </div>
      {children}
    </div>
  );
}

function Chips<T extends string | number>({ value, options, set, label }: { value: T; options: { id: T; label: string }[]; set: (value: T) => void; label: string }) {
  return (
    <div role="radiogroup" aria-label={label} className="flex flex-wrap gap-1.5">
      {options.map((option) => (
        <button key={String(option.id)} type="button" role="radio" aria-checked={value === option.id} onClick={() => set(option.id)} className={`nsx-chip ${value === option.id ? "is-on" : ""}`}>
          {option.label}
        </button>
      ))}
    </div>
  );
}

// A small copy of the NOVA desktop: wallpaper, Dynamic Island and dock.
function MiniDesktop({ theme, settings, walls, apps, still, className = "" }: { theme: NovaTheme; settings: NovaSettingsData; walls: Wall[]; apps: NovaApp[]; still: boolean; className?: string }) {
  const photo = settings.novaWall.startsWith("photo:") ? walls[Number(settings.novaWall.slice(6))] : undefined;
  const pins = settings.novaPins.map((id) => apps.find((app) => app.id === id)).filter((app): app is NovaApp => Boolean(app)).slice(0, 7);
  return (
    <div className={`overflow-hidden [container-type:inline-size] ${className}`}>
      <NovaWallpaper theme={theme} wall={settings.novaWall} photo={photo?.src ?? photo?.thumb} video={photo?.video} still={still} dim={settings.novaWallDim} />
      {settings.novaIsland && <span className="absolute left-1/2 top-[5%] h-[7%] min-h-3 w-[18%] -translate-x-1/2 rounded-full bg-black/85 shadow-lg" />}
      {(settings.novaGreet !== "off" || settings.novaWidgets.length > 0) && (
        <span className={`absolute top-[20%] flex flex-col gap-[4%] ${settings.novaGreetPos === "center" ? "inset-x-0 items-center" : "left-[6%] items-start"}`}>
          {settings.novaGreet === "hello" && <><span className="h-[.55em] w-[30cqw] max-w-[9rem] rounded-full bg-white/75" /><span className="h-[.55em] w-[20cqw] max-w-[6rem] rounded-full bg-[var(--primary)]" /></>}
          {settings.novaGreet === "clock" && <span className="text-[clamp(1rem,6cqw,2.6rem)] font-extralight leading-none text-white/90">12:30</span>}
          {settings.novaWidgets.length > 0 && <span className="mt-[3%] flex gap-1">{settings.novaWidgets.map((id) => <span key={id} className="h-[2.4em] w-[3.4em] rounded-md border border-white/15 bg-white/15 backdrop-blur" />)}</span>}
        </span>
      )}
      {settings.novaIcons.length > 0 && (
        <span className="absolute right-[2%] top-[13%] flex flex-col gap-[1.2em]">
          {settings.novaIcons.slice(0, 5).map((id) => {
            const app = apps.find((item) => item.id === id);
            if (!app) return null;
            const AppIcon = app.icon;
            return <span key={id} className="size-[1.6em]"><AppIcon className="!size-full" /></span>;
          })}
        </span>
      )}
      <span className="absolute bottom-[5%] left-1/2 flex h-[11%] min-h-5 -translate-x-1/2 items-center justify-center gap-[3%] rounded-[30%/50%] border border-white/15 bg-white/10 px-[2%] backdrop-blur-md" style={{ width: `${Math.max(22, pins.length * 6.5)}%` }}>
        {pins.map((app) => {
          const AppIcon = app.icon;
          return <span key={app.id} className="aspect-square h-[72%]"><AppIcon className="!size-full" /></span>;
        })}
      </span>
    </div>
  );
}

function ThemeOrbit({ theme, pick }: { theme: NovaTheme; pick: (id: string) => void }) {
  return (
    <div className="relative mx-auto aspect-square h-full max-h-[190px]">
      <span className="nsx-core absolute inset-[27%] grid place-items-center rounded-full text-center" style={{ background: `conic-gradient(from 210deg, ${theme.colors[0]}, ${theme.colors[1]}, ${theme.colors[2]}, ${theme.colors[0]})`, boxShadow: `0 0 40px ${theme.accent}66` }}>
        <span className="rounded-full bg-black/45 px-2.5 py-1 text-[11px] font-bold backdrop-blur">{theme.name}</span>
      </span>
      {NOVA_THEMES.map((item, index) => {
        const angle = (index / NOVA_THEMES.length) * Math.PI * 2 - Math.PI / 2;
        const active = item.id === theme.id;
        return (
          <button
            key={item.id}
            type="button"
            aria-label={`${item.name} theme`}
            aria-pressed={active}
            title={item.name}
            onClick={() => pick(item.id)}
            className={`nsx-moon absolute size-[17%] -translate-x-1/2 -translate-y-1/2 rounded-full ${active ? "is-on" : ""}`}
            style={{ left: `${50 + Math.cos(angle) * 42}%`, top: `${50 + Math.sin(angle) * 42}%`, background: `radial-gradient(circle at 32% 30%, #fff8, transparent 40%), linear-gradient(140deg, ${item.colors[0]}, ${item.colors[1]})`, "--glow": item.accent } as CSSProperties}
          />
        );
      })}
    </div>
  );
}

function ProxyPane({ wisp }: { wisp: Props["wisp"] }) {
  const [choice, setChoice] = useState("auto");
  const [custom, setCustom] = useState("");
  const [status, setStatus] = useState<Record<string, boolean>>({});
  const [testing, setTesting] = useState(false);
  useEffect(() => {
    try {
      const saved = localStorage.getItem("pos-wisp-choice") || "auto";
      if (!saved.startsWith("wss://")) return;
      if (wisp.servers.includes(saved)) setChoice(saved);
      else {
        setChoice("custom");
        setCustom(saved);
      }
    } catch {
      // storage unavailable
    }
  }, [wisp.servers]);
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
    const results = await Promise.all(wisp.servers.map((url) => wisp.probe(url)));
    setStatus(Object.fromEntries(wisp.servers.map((url, index) => [url, Boolean(results[index])])));
    setTesting(false);
  };
  const options = [{ id: "auto", label: "Automatic", hint: "Fastest working server" }, ...wisp.servers.map((url) => ({ id: url, label: url.replace(/^wss:\/\//, "").replace(/\/.*$/, ""), hint: "Public server" })), { id: "custom", label: "Custom", hint: "Your own Wisp address" }];
  return (
    <Pane title="Comet proxy server">
      <div data-setting="proxy" className="grid gap-2 @lg:grid-cols-2">
        {options.map((option) => (
          <button key={option.id} type="button" onClick={() => save(option.id)} className={`nsx-option ${choice === option.id ? "is-on" : ""}`}>
            <span className="min-w-0 flex-1 text-left">
              <span className="block truncate text-[13px] font-semibold">{option.label}</span>
              <span className="block truncate text-[11px] text-white/50">{option.hint}</span>
            </span>
            {option.id in status ? <span className={`size-2.5 shrink-0 rounded-full ${status[option.id] ? "bg-emerald-400 shadow-[0_0_10px_#34d399]" : "bg-rose-400"}`} title={status[option.id] ? "Online" : "Offline"} /> : choice === option.id && <Check className="size-4 shrink-0 text-[var(--primary)]" />}
          </button>
        ))}
      </div>
      {choice === "custom" && <input aria-label="Custom Wisp server" value={custom} onChange={(event) => { setCustom(event.target.value); save("custom", event.target.value); }} placeholder="wss://your-server/wisp/" className="nsx-input mt-3 w-full" />}
      <div className="mt-3 flex items-center justify-between gap-3">
        <p className="text-[12px] text-white/55">{Object.keys(status).length ? `${Object.values(status).filter(Boolean).length} of ${wisp.servers.length} servers online` : "See which servers answer right now."}</p>
        <button type="button" onClick={test} disabled={testing} className="nsx-btn">{testing ? "Checking…" : "Check servers"}</button>
      </div>
    </Pane>
  );
}

function LiveClock({ zone, h24 }: { zone: string; h24: boolean }) {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(timer);
  }, []);
  let time = "";
  let day = "";
  try {
    time = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: !h24, ...(zone ? { timeZone: zone } : {}) });
    day = now.toLocaleDateString([], { weekday: "long", day: "numeric", month: "long", ...(zone ? { timeZone: zone } : {}) });
  } catch {
    time = now.toLocaleTimeString();
  }
  return (
    <div className="nsx-pane nsx-rise flex flex-col items-center py-8 text-center">
      <p className="nsx-gradient-text text-[clamp(2.4rem,6cqw,4.2rem)] font-extralight tabular-nums leading-none tracking-tight">{time}</p>
      <p className="mt-3 text-[13px] text-white/60">{day} · {zone ? zone.replace(/_/g, " ") : "This computer's time zone"}</p>
    </div>
  );
}

export function NovaSettingsApp(props: Props) {
  const { settings, patch, apps, walls } = props;
  const [space, setSpace] = useState<string>(() => takeSettingsSpace() || "home");
  const [query, setQuery] = useState("");
  const [flash, setFlash] = useState("");
  const [picked, setPicked] = useState<string | null>(null);
  const [appQuery, setAppQuery] = useState("");
  const scroller = useRef<HTMLDivElement>(null);
  const upload = useRef<HTMLInputElement>(null);
  const theme = novaTheme(settings.novaTheme);
  const motion = !settings.reduceMotion && !settings.lite;
  const liveScene = settings.novaWall.startsWith("photo:") ? "aurora" : settings.novaWall;
  const initial = (settings.userName.trim()[0] ?? "N").toUpperCase();
  const hour = new Date().getHours();
  const greeting = hour < 5 ? "Good night" : hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
  const byId = (id: string) => apps.find((app) => app.id === id);
  const pins = settings.novaPins.filter((id) => byId(id));
  const zones = useMemo(() => {
    try {
      return (Intl as unknown as { supportedValuesOf?: (key: string) => string[] }).supportedValuesOf?.("timeZone") ?? [];
    } catch {
      return [];
    }
  }, []);
  const results = useMemo(() => {
    const text = query.trim().toLowerCase();
    if (!text) return [];
    return INDEX.filter((item) => `${item.label} ${item.words}`.toLowerCase().includes(text)).slice(0, 7);
  }, [query]);

  const go = (id: string, key = "") => {
    setSpace(id);
    setQuery("");
    setFlash(key);
    setPicked(null);
    scroller.current?.scrollTo({ top: 0 });
  };
  // Other parts of NOVA can open Settings on a space (for example "Customize desktop").
  useEffect(() => {
    const open = (event: Event) => {
      const target = (event as CustomEvent<string>).detail;
      takeSettingsSpace();
      if (SPACES.some((item) => item.id === target)) go(target);
    };
    window.addEventListener(NOVA_SETTINGS_EVENT, open);
    return () => window.removeEventListener(NOVA_SETTINGS_EVENT, open);
  }, []);
  useEffect(() => {
    if (!flash) return;
    const timer = window.setTimeout(() => {
      const row = scroller.current?.querySelector(`[data-setting="${flash}"]`);
      row?.scrollIntoView({ block: "center", behavior: "smooth" });
      row?.classList.add("nsx-flash");
      window.setTimeout(() => row?.classList.remove("nsx-flash"), 1600);
      setFlash("");
    }, 320);
    return () => window.clearTimeout(timer);
  }, [flash, space]);

  const movePin = (id: string, by: -1 | 1) => {
    const index = pins.indexOf(id);
    const target = index + by;
    if (index < 0 || target < 0 || target >= pins.length) return;
    const next = [...pins];
    next.splice(index, 1);
    next.splice(target, 0, id);
    patch({ novaPins: next });
  };
  const addPhoto = async (file: File | undefined) => {
    if (!file) return;
    const index = await props.addWall(file);
    if (index !== null) patch({ novaWall: `photo:${index}` });
  };
  const removePhoto = async (index: number) => {
    const id = props.customIds[index - props.customFrom];
    if (id === undefined) return;
    const current = settings.novaWall.startsWith("photo:") ? Number(settings.novaWall.slice(6)) : -1;
    await props.removeWall(id);
    if (current === index) patch({ novaWall: "aurora" });
    else if (current > index) patch({ novaWall: `photo:${current - 1}` });
  };

  // ---- Home: live tiles ----
  const home = (
    <div className="nsx-home space-y-4">
      <section className="nsx-hero nsx-rise">
        <div className="flex min-w-0 items-center gap-4">
          <button type="button" onClick={() => go("profile")} aria-label="Profile" className="nsx-avatar" style={{ "--a1": theme.colors[0], "--a2": theme.accent, "--a3": theme.colors[2] } as CSSProperties}>
            <span>{initial}</span>
          </button>
          <div className="min-w-0">
            <p className="text-[12px] font-medium uppercase tracking-[.22em] text-white/50">NOVA OS {props.version}</p>
            <h2 className="truncate text-[clamp(1.5rem,3.4cqw,2.3rem)] font-light leading-tight tracking-tight">{greeting}, <span className="nsx-gradient-text font-semibold">{settings.userName || "friend"}</span></h2>
          </div>
        </div>
        <div className="relative w-full @3xl:w-[340px]">
          <label className="nsx-search">
            <Search className="size-4 shrink-0 text-white/55" />
            <input aria-label="Search settings" value={query} onChange={(event) => setQuery(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter" && results[0]) go(results[0].space, results[0].key); if (event.key === "Escape") setQuery(""); }} placeholder="Search every setting" className="min-w-0 flex-1 bg-transparent text-[14px] outline-none placeholder:text-white/40" />
            {query && <button type="button" aria-label="Clear search" onClick={() => setQuery("")} className="grid size-6 place-items-center rounded-full bg-white/10"><X className="size-3" /></button>}
          </label>
          {query && (
            <div role="listbox" aria-label="Search results" className="nsx-results">
              {results.map((item) => (
                <button key={item.key} type="button" role="option" aria-selected={false} onClick={() => go(item.space, item.key)} className="flex w-full items-center gap-3 rounded-2xl px-2.5 py-2 text-left hover:bg-white/10">
                  <SpaceIcon space={spaceOf(item.space)} size={30} />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[13px] font-semibold">{item.label}</span>
                    <span className="block text-[11px] text-white/50">{spaceOf(item.space).label}</span>
                  </span>
                  <ChevronRight className="size-4 text-white/40" />
                </button>
              ))}
              {results.length === 0 && <p className="px-3 py-3 text-[12.5px] text-white/50">Nothing matches “{query}”.</p>}
            </div>
          )}
        </div>
      </section>

      <div className="grid grid-cols-2 gap-3 @3xl:grid-cols-6 @3xl:[grid-auto-rows:116px]">
        <button type="button" onClick={() => go("wallpaper")} className="nsx-tile nsx-rise group col-span-2 aspect-[16/10] p-0 text-left @3xl:col-span-4 @3xl:row-span-2 @3xl:aspect-auto">
          <MiniDesktop theme={theme} settings={settings} walls={walls} apps={apps} still={!motion} className="absolute inset-0" />
          <span className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 bg-gradient-to-t from-black/70 via-black/25 to-transparent p-4 pt-12">
            <span>
              <span className="block text-[11px] font-semibold uppercase tracking-[.2em] text-white/60">Wallpaper</span>
              <span className="block text-[18px] font-semibold">{settings.novaWall.startsWith("photo:") ? walls[Number(settings.novaWall.slice(6))]?.label ?? "Photo" : novaWallName(settings.novaWall)}</span>
            </span>
            <span className="nsx-btn pointer-events-none">Change</span>
          </span>
        </button>

        <div className="nsx-tile nsx-rise col-span-2 flex flex-col p-4 @3xl:row-span-2">
          <p className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-[.2em] text-white/60">Theme<button type="button" onClick={() => go("themes")} className="normal-case tracking-normal text-[var(--primary)] hover:underline">All themes</button></p>
          <div className="min-h-0 flex-1 py-2"><ThemeOrbit theme={theme} pick={(id) => patch({ novaTheme: id })} /></div>
        </div>

        <div className="nsx-tile nsx-rise col-span-2 grid grid-cols-4 items-center gap-2 px-3 py-3 @3xl:col-span-3">
          {[
            { label: "Night light", icon: Moon, on: settings.novaNight, flip: () => patch({ novaNight: !settings.novaNight }) },
            { label: "Focus", icon: BellOff, on: settings.novaFocus, flip: () => patch({ novaFocus: !settings.novaFocus }) },
            { label: "Sounds", icon: Volume2, on: settings.uiSounds, flip: () => patch({ uiSounds: !settings.uiSounds }) },
            { label: "Magnify", icon: Sparkles, on: settings.novaMagnify, flip: () => patch({ novaMagnify: !settings.novaMagnify }) },
          ].map((item) => {
            const QIcon = item.icon;
            return (
              <button key={item.label} type="button" role="switch" aria-checked={item.on} onClick={item.flip} className="flex flex-col items-center gap-1.5">
                <span className={`nsx-round ${item.on ? "is-on" : ""}`}><QIcon className="size-5" /></span>
                <span className="text-[11px] font-medium text-white/75">{item.label}</span>
              </button>
            );
          })}
        </div>

        <div className="nsx-tile nsx-rise col-span-2 flex flex-col justify-center gap-2.5 px-4 py-3 @3xl:col-span-3">
          <Fader label="Brightness" icon={Sun} min={30} value={settings.novaBright} set={(value) => patch({ novaBright: value })} />
          <Fader label="Volume" icon={Volume2} value={settings.soundVolume} set={(value) => patch({ soundVolume: value })} />
        </div>
      </div>

      <section className="nsx-rise">
        <h3 className="nsx-pane-title px-1">Everything</h3>
        <nav aria-label="Settings spaces" className="grid grid-cols-3 gap-2 @xl:grid-cols-4 @3xl:grid-cols-6">
          {SPACES.map((item) => (
            <button key={item.id} type="button" onClick={() => go(item.id)} className="nsx-space">
              <SpaceIcon space={item} size={48} />
              <span className="text-[12.5px] font-semibold">{item.label}</span>
              <span className="line-clamp-1 text-[10.5px] text-white/45">{item.blurb}</span>
            </button>
          ))}
        </nav>
      </section>
    </div>
  );

  // ---- Spaces ----
  let content: ReactNode = null;
  switch (space) {
    case "wallpaper":
      content = (
        <>
          <div className="nsx-rise relative overflow-hidden rounded-[28px] ring-1 ring-white/15">
            <MiniDesktop theme={theme} settings={settings} walls={walls} apps={apps} still={!motion} className="relative aspect-[16/9] max-h-[360px] w-full" />
          </div>
          <Pane title="Live scenes">
            <div data-setting="scene" className="grid grid-cols-2 gap-3 @xl:grid-cols-4">
              {NOVA_WALLS.map((wall) => {
                const active = settings.novaWall === wall.id;
                return (
                  <button key={wall.id} type="button" aria-pressed={active} aria-label={`${wall.name} wallpaper`} onClick={() => patch({ novaWall: wall.id })} className={`nsx-wall ${active ? "is-on" : ""}`}>
                    <span className="relative block aspect-[16/10] overflow-hidden rounded-[16px]">
                      <NovaWallpaper theme={theme} wall={wall.id} still />
                      {active && <span className="absolute right-2 top-2 grid size-6 place-items-center rounded-full bg-white text-black shadow-lg"><Check className="size-3.5" /></span>}
                    </span>
                    <span className="block px-1 pt-2 text-[12.5px] font-semibold">{wall.name}</span>
                    <span className="block truncate px-1 text-[11px] text-white/50">{wall.sub}</span>
                  </button>
                );
              })}
            </div>
            <p className="mt-3 px-1 text-[11.5px] text-white/45">Every scene is painted in your theme's colours and keeps moving slowly. It holds still in Lite mode.</p>
          </Pane>
          <Pane title="Photos">
            <div data-setting="photos" className="grid grid-cols-2 gap-3 @xl:grid-cols-4">
              {walls.map((wall, index) => {
                const active = settings.novaWall === `photo:${index}`;
                const custom = index >= props.customFrom;
                return (
                  <div key={`${wall.label}-${index}`} className={`nsx-wall relative ${active ? "is-on" : ""}`}>
                    <button type="button" aria-pressed={active} aria-label={`${wall.label} wallpaper`} onClick={() => patch({ novaWall: `photo:${index}` })} className="block w-full text-left">
                      <span className="relative block aspect-[16/10] overflow-hidden rounded-[16px] bg-black/40">
                        <img src={wall.thumb} alt="" loading="lazy" className="size-full object-cover" />
                        {wall.video && <span className="absolute left-2 top-2 flex items-center gap-1 rounded-full bg-black/60 px-2 py-0.5 text-[10px] font-bold backdrop-blur"><Play className="size-2.5 fill-current" />Video</span>}
                        {active && <span className="absolute right-2 top-2 grid size-6 place-items-center rounded-full bg-white text-black shadow-lg"><Check className="size-3.5" /></span>}
                      </span>
                      <span className="block truncate px-1 pt-2 text-[12.5px] font-semibold">{wall.label}</span>
                    </button>
                    {custom && <button type="button" aria-label={`Delete ${wall.label}`} onClick={() => void removePhoto(index)} className="absolute bottom-0.5 right-1 grid size-6 place-items-center rounded-full text-white/50 hover:bg-rose-500/20 hover:text-rose-300"><Trash2 className="size-3.5" /></button>}
                  </div>
                );
              })}
              <button type="button" onClick={() => upload.current?.click()} className="nsx-add">
                <ImagePlus className="size-6" />
                <span className="text-[12px] font-semibold">Add a photo</span>
              </button>
              <input ref={upload} type="file" accept="image/*" hidden onChange={(event) => { void addPhoto(event.target.files?.[0]); event.target.value = ""; }} />
            </div>
          </Pane>
          <Pane>
            <Line id="depth" label="Depth effect" hint="The wallpaper drifts a little as your mouse moves.">
              <Toggle label="Depth effect" on={settings.novaParallax} flip={() => patch({ novaParallax: !settings.novaParallax })} />
            </Line>
            <div data-setting="dim" className="nsx-line flex-col !items-stretch">
              <div>
                <p className="text-[13.5px] font-semibold">Dim wallpaper</p>
                <p className="mt-0.5 text-[12px] text-white/55">Darkens the wallpaper so windows and text stand out.</p>
              </div>
              <Fader label="Dim wallpaper" icon={SunDim} max={70} value={settings.novaWallDim} set={(value) => patch({ novaWallDim: value })} />
            </div>
            <div data-setting="shuffle" className="nsx-line flex-col !items-stretch">
              <div>
                <p className="text-[13.5px] font-semibold">Wallpaper shuffle</p>
                <p className="mt-0.5 text-[12px] text-white/55">Moves to the next live scene on its own.</p>
              </div>
              <Chips label="Wallpaper shuffle" value={settings.novaShuffle} set={(value) => patch({ novaShuffle: value })} options={[{ id: 0, label: "Off" }, { id: 5, label: "5 min" }, { id: 15, label: "15 min" }, { id: 30, label: "30 min" }, { id: 60, label: "1 hour" }]} />
            </div>
          </Pane>
        </>
      );
      break;
    case "desktop": {
      const iconApps = apps.filter((app) => !settings.novaIcons.includes(app.id) && app.label.toLowerCase().includes(appQuery.trim().toLowerCase()));
      content = (
        <>
          <div className="nsx-rise relative overflow-hidden rounded-[28px] ring-1 ring-white/15">
            <MiniDesktop theme={theme} settings={settings} walls={walls} apps={apps} still={!motion} className="relative aspect-[16/9] max-h-[360px] w-full" />
          </div>
          <Pane title="Greeting">
            <div data-setting="greet" className="grid grid-cols-3 gap-2">
              {([["hello", "Hello", "Good morning and your name"], ["clock", "Big clock", "The time, large"], ["off", "Nothing", "Just the wallpaper"]] as const).map(([id, label, hint]) => (
                <button key={id} type="button" aria-pressed={settings.novaGreet === id} onClick={() => patch({ novaGreet: id })} className={`nsx-pick ${settings.novaGreet === id ? "is-on" : ""}`}>
                  <span className="text-[13px] font-semibold">{label}</span>
                  <span className="text-[11px] text-white/55">{hint}</span>
                </button>
              ))}
            </div>
            <Line id="greetpos" label="Position">
              <Chips label="Greeting position" value={settings.novaGreetPos} set={(value) => patch({ novaGreetPos: value })} options={[{ id: "left", label: "Left" }, { id: "center", label: "Centre" }]} />
            </Line>
          </Pane>
          <Pane title="Widgets">
            <div data-setting="widgets" className="grid grid-cols-2 gap-2 @xl:grid-cols-4">
              {NOVA_WIDGETS.map((widget) => {
                const on = settings.novaWidgets.includes(widget.id);
                return (
                  <button key={widget.id} type="button" role="switch" aria-checked={on} onClick={() => patch({ novaWidgets: on ? settings.novaWidgets.filter((item) => item !== widget.id) : [...settings.novaWidgets, widget.id] })} className={`nsx-pick !flex-row items-center justify-between ${on ? "is-on" : ""}`}>
                    <span className="text-[13px] font-semibold">{widget.label}</span>
                    <span className={`grid size-5 place-items-center rounded-full ${on ? "bg-[var(--primary)] text-black" : "bg-white/10"}`}>{on ? <Check className="size-3" /> : <Plus className="size-3" />}</span>
                  </button>
                );
              })}
            </div>
            <p className="mt-2 px-1 text-[11.5px] text-white/45">Widgets sit under the greeting. Right-click one to remove it.</p>
          </Pane>
          <Pane title="App shortcuts">
            <div data-setting="icons" className="mb-3 flex min-h-12 flex-wrap gap-2">
              {settings.novaIcons.map((id) => {
                const app = byId(id);
                if (!app) return null;
                const AppIcon = app.icon;
                return (
                  <span key={id} className="flex items-center gap-2 rounded-full bg-white/[.08] py-1 pl-1.5 pr-1 text-[12px]">
                    <span className="size-6"><AppIcon className="!size-full" /></span>{app.label}
                    <button type="button" aria-label={`Remove ${app.label} from the desktop`} onClick={() => patch({ novaIcons: settings.novaIcons.filter((item) => item !== id) })} className="grid size-5 place-items-center rounded-full hover:bg-white/15"><X className="size-3" /></button>
                  </span>
                );
              })}
              {settings.novaIcons.length === 0 && <p className="px-1 text-[12px] text-white/50">No shortcuts yet. Add apps below and they appear on the right of the desktop.</p>}
            </div>
            <label className="nsx-search mb-3 !h-10">
              <Search className="size-4 text-white/50" />
              <input aria-label="Find an app for the desktop" value={appQuery} onChange={(event) => setAppQuery(event.target.value)} placeholder="Find an app" className="min-w-0 flex-1 bg-transparent text-[13px] outline-none placeholder:text-white/40" />
            </label>
            <div className="grid max-h-52 grid-cols-4 gap-1 overflow-y-auto @xl:grid-cols-6">
              {iconApps.map((app) => {
                const AppIcon = app.icon;
                return (
                  <button key={app.id} type="button" aria-label={`Put ${app.label} on the desktop`} onClick={() => patch({ novaIcons: [...settings.novaIcons, app.id] })} className="group relative flex flex-col items-center gap-1.5 rounded-2xl p-2 text-center hover:bg-white/[.07]">
                    <span className="size-10"><AppIcon className="!size-full" /></span>
                    <span className="w-full truncate text-[10.5px] text-white/75">{app.label}</span>
                    <span className="absolute right-2 top-1.5 grid size-4 place-items-center rounded-full bg-[var(--primary)] text-black opacity-0 transition-opacity group-hover:opacity-100"><Plus className="size-3" /></span>
                  </button>
                );
              })}
            </div>
          </Pane>
          <Pane title="Look">
            <Line id="island" label="Dynamic Island" hint="The black pill at the top with the clock.">
              <Chips label="Dynamic Island" value={settings.novaIsland ? "on" : "off"} set={(value) => patch({ novaIsland: value === "on" })} options={[{ id: "on", label: "Always" }, { id: "off", label: "Only for alerts" }]} />
            </Line>
            <Line id="glass" label="Glass" hint="How see-through the dock, menus and panels are.">
              <Chips label="Glass" value={settings.novaGlass} set={(value) => patch({ novaGlass: value })} options={[{ id: "clear", label: "Clear" }, { id: "frosted", label: "Frosted" }, { id: "solid", label: "Solid" }]} />
            </Line>
            <Line label="Start over" hint="Greeting on the left, no shortcuts or widgets, frosted glass.">
              <button type="button" onClick={() => patch({ novaGreet: "hello", novaGreetPos: "left", novaIcons: [], novaWidgets: [], novaIsland: true, novaGlass: "frosted" })} className="nsx-btn">Reset desktop</button>
            </Line>
          </Pane>
        </>
      );
      break;
    }
    case "themes":
      content = (
        <>
          <div data-setting="theme" className="grid grid-cols-2 gap-3 @2xl:grid-cols-4">
            {NOVA_THEMES.map((item) => {
              const active = item.id === theme.id;
              return (
                <button key={item.id} type="button" aria-pressed={active} aria-label={`${item.name} theme`} onClick={() => patch({ novaTheme: item.id })} className={`nsx-theme nsx-rise ${active ? "is-on" : ""}`} style={{ "--glow": item.accent } as CSSProperties}>
                  <span className="relative block aspect-[4/5] overflow-hidden rounded-[20px]">
                    <NovaWallpaper theme={item} wall={liveScene} still />
                    <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 to-transparent p-3 pt-10 text-left">
                      <span className="block text-[15px] font-semibold">{item.name}</span>
                      <span className="block text-[11.5px] text-white/65">{item.sub}</span>
                    </span>
                    <span className="absolute left-3 top-3 flex gap-1">{item.colors.map((color) => <span key={color} className="size-3 rounded-full ring-1 ring-white/30" style={{ background: color }} />)}</span>
                    {active && <span className="absolute right-3 top-3 grid size-7 place-items-center rounded-full bg-white text-black shadow-lg"><Check className="size-4" /></span>}
                  </span>
                </button>
              );
            })}
          </div>
          <Pane>
            <Line label="Accent colour" hint={`${theme.name} lights up the dock, the Dynamic Island, switches and sliders in ${theme.accent.toUpperCase()}.`}>
              <span className="size-8 rounded-full ring-2 ring-white/25" style={{ background: theme.accent, boxShadow: `0 0 18px ${theme.accent}` }} />
            </Line>
          </Pane>
        </>
      );
      break;
    case "dock": {
      const shownApps = apps.filter((app) => !pins.includes(app.id) && app.label.toLowerCase().includes(appQuery.trim().toLowerCase()));
      const pickedApp = picked ? byId(picked) : undefined;
      content = (
        <>
          <Pane className="!pb-4">
            <div data-setting="pins" className="flex flex-col items-center gap-3">
              <div className="nsx-dock-preview" aria-label="Dock preview">
                {pins.map((id) => {
                  const app = byId(id)!;
                  const AppIcon = app.icon;
                  return (
                    <button key={id} type="button" aria-label={app.label} aria-pressed={picked === id} title={app.label} onClick={() => setPicked(picked === id ? null : id)} className={`nsx-dock-icon ${picked === id ? "is-on" : ""}`}>
                      <AppIcon className="!size-full" />
                    </button>
                  );
                })}
                {pins.length === 0 && <span className="px-4 text-[12px] text-white/50">The dock is empty</span>}
              </div>
              {pickedApp ? (
                <div className="nsx-rise flex flex-wrap items-center justify-center gap-2">
                  <span className="text-[12.5px] font-semibold">{pickedApp.label}</span>
                  <button type="button" onClick={() => movePin(pickedApp.id, -1)} className="nsx-btn flex items-center gap-1"><ChevronLeft className="size-3.5" />Move left</button>
                  <button type="button" onClick={() => movePin(pickedApp.id, 1)} className="nsx-btn flex items-center gap-1">Move right<ChevronRight className="size-3.5" /></button>
                  <button type="button" onClick={() => { patch({ novaPins: pins.filter((item) => item !== pickedApp.id) }); setPicked(null); }} className="nsx-btn !text-rose-300">Remove</button>
                </div>
              ) : (
                <p className="text-[12px] text-white/50">Click an app in the dock to move or remove it.</p>
              )}
            </div>
          </Pane>
          <Pane title="Add to the dock">
            <label className="nsx-search mb-3 !h-10">
              <Search className="size-4 text-white/50" />
              <input aria-label="Find an app" value={appQuery} onChange={(event) => setAppQuery(event.target.value)} placeholder="Find an app" className="min-w-0 flex-1 bg-transparent text-[13px] outline-none placeholder:text-white/40" />
            </label>
            <div className="grid max-h-60 grid-cols-4 gap-1 overflow-y-auto @xl:grid-cols-6">
              {shownApps.map((app) => {
                const AppIcon = app.icon;
                return (
                  <button key={app.id} type="button" aria-label={`Add ${app.label}`} onClick={() => patch({ novaPins: [...pins, app.id] })} className="group relative flex flex-col items-center gap-1.5 rounded-2xl p-2 text-center hover:bg-white/[.07]">
                    <span className="size-10"><AppIcon className="!size-full" /></span>
                    <span className="w-full truncate text-[10.5px] text-white/75">{app.label}</span>
                    <span className="absolute right-2 top-1.5 grid size-4 place-items-center rounded-full bg-[var(--primary)] text-black opacity-0 transition-opacity group-hover:opacity-100"><Plus className="size-3" /></span>
                  </button>
                );
              })}
            </div>
          </Pane>
          <Pane>
            <Line id="magnify" label="Magnify on hover" hint="Icons swell as your mouse glides over the dock.">
              <Toggle label="Magnify on hover" on={settings.novaMagnify} flip={() => patch({ novaMagnify: !settings.novaMagnify })} />
            </Line>
            <Line id="corner" label="Hot corner" hint="Push the mouse into the top-left corner to see every window.">
              <Toggle label="Hot corner" on={settings.novaHotCorner} flip={() => patch({ novaHotCorner: !settings.novaHotCorner })} />
            </Line>
            <div data-setting="docksize" className="nsx-line flex-col !items-stretch">
              <p className="text-[13.5px] font-semibold">Dock size</p>
              <Fader label="Dock size" icon={LayoutPanelLeft} min={32} max={64} unit="px" value={settings.novaDockSize} set={(value) => patch({ novaDockSize: value })} />
            </div>
            <Line id="dockhide" label="Auto-hide the dock" hint="The dock slides away and comes back when you move the mouse to the bottom of the screen.">
              <Toggle label="Auto-hide the dock" on={settings.novaDockHide} flip={() => patch({ novaDockHide: !settings.novaDockHide })} />
            </Line>
            <Line label="Start over" hint="Put the five default apps back.">
              <button type="button" onClick={() => { patch({ novaPins: NOVA_PINS }); setPicked(null); }} className="nsx-btn">Reset dock</button>
            </Line>
          </Pane>
        </>
      );
      break;
    }
    case "display":
      content = (
        <Pane>
          <div data-setting="bright" className="nsx-line flex-col !items-stretch">
            <p className="text-[13.5px] font-semibold">Brightness</p>
            <Fader label="Brightness" icon={Sun} min={30} value={settings.novaBright} set={(value) => patch({ novaBright: value })} />
          </div>
          <Line id="night" label="Night light" hint="Warmer colours that are easier on your eyes after dark.">
            <Toggle label="Night light" on={settings.novaNight} flip={() => patch({ novaNight: !settings.novaNight })} />
          </Line>
        </Pane>
      );
      break;
    case "sound":
      content = (
        <Pane>
          <Line id="sounds" label="Interface sounds" hint="Soft sounds as you click and hover.">
            <Toggle label="Interface sounds" on={settings.uiSounds} flip={() => patch({ uiSounds: !settings.uiSounds })} />
          </Line>
          <div data-setting="volume" className="nsx-line flex-col !items-stretch">
            <p className="text-[13.5px] font-semibold">Volume</p>
            <Fader label="Volume" icon={Volume1} value={settings.soundVolume} set={(value) => patch({ soundVolume: value })} />
          </div>
          <Line label="Click sound">
            <Toggle label="Click sound" on={settings.soundClick} flip={() => patch({ soundClick: !settings.soundClick })} />
          </Line>
          <Line label="Hover sound">
            <Toggle label="Hover sound" on={settings.soundHover} flip={() => patch({ soundHover: !settings.soundHover })} />
          </Line>
        </Pane>
      );
      break;
    case "focus":
      content = (
        <>
          <button type="button" data-setting="focus" role="switch" aria-checked={settings.novaFocus} onClick={() => patch({ novaFocus: !settings.novaFocus })} className={`nsx-focus nsx-rise ${settings.novaFocus ? "is-on" : ""}`}>
            <MoonStar className="size-10" />
            <span className="text-[20px] font-semibold">{settings.novaFocus ? "Focus is on" : "Focus is off"}</span>
            <span className="text-[12.5px] text-white/60">{settings.novaFocus ? "Notifications stay quiet and a moon sits in the Dynamic Island." : "Tap to silence notifications."}</span>
          </button>
          <Pane>
            <Line label="Focus timer" hint="Start one from the Control Center, or type “focus 25” in Search (Ctrl+K)." />
          </Pane>
        </>
      );
      break;
    case "clock":
      content = (
        <>
          <LiveClock zone={settings.timeZone} h24={settings.clock24} />
          <Pane>
            <Line id="clock24" label="24-hour clock">
              <Toggle label="24-hour clock" on={settings.clock24} flip={() => patch({ clock24: !settings.clock24 })} />
            </Line>
            <Line id="zone" label="Time zone" hint="Automatic follows this computer.">
              <select aria-label="Time zone" value={settings.timeZone} onChange={(event) => patch({ timeZone: event.target.value })} className="nsx-input max-w-[14rem]">
                <option value="">Automatic</option>
                {zones.map((zone) => <option key={zone} value={zone}>{zone.replace(/_/g, " ")}</option>)}
              </select>
            </Line>
          </Pane>
        </>
      );
      break;
    case "privacy":
      content = (
        <>
          <Pane title="Lock">
            <div data-setting="lock" className="nsx-line flex-col !items-stretch">
              <div>
                <p className="text-[13.5px] font-semibold">Lock automatically</p>
                <p className="mt-0.5 text-[12px] text-white/55">Locks NOVA OS when you leave it alone.</p>
              </div>
              <Chips label="Lock automatically" value={settings.autoLock} set={(value) => patch({ autoLock: value })} options={[{ id: 0, label: "Never" }, { id: 1, label: "1 min" }, { id: 5, label: "5 min" }, { id: 15, label: "15 min" }, { id: 30, label: "30 min" }]} />
            </div>
          </Pane>
          <Pane title="Comet">
            <Line id="reddit" label="Reddit" hint="Reddit blocks proxy servers, so Comet opens Reddit in its own reader that loads straight from your connection." />
            <Line id="bookmarks" label="Bookmarks" hint="Remove every bookmark saved in Comet.">
              <button type="button" onClick={() => { try { localStorage.removeItem("pos-bookmarks"); } catch { /* storage unavailable */ } }} className="nsx-btn">Clear</button>
            </Line>
          </Pane>
          <ProxyPane wisp={props.wisp} />
        </>
      );
      break;
    case "speed":
      content = (
        <>
        <button type="button" data-setting="optimize" onClick={props.optimize} className="nsx-optimize nsx-rise">
          <span className="grid size-14 shrink-0 place-items-center rounded-2xl bg-black/25"><Gauge className="size-7" /></span>
          <span className="min-w-0 flex-1 text-left">
            <span className="block text-[19px] font-semibold">Optimize</span>
            <span className="block text-[12.5px] opacity-75">{settings.lite ? "Nova is optimized. Run it again any time." : "One tap to make Nova faster on this device: lite mode, calmer wallpaper and lighter glass."}</span>
          </span>
          <ChevronRight className="size-5 shrink-0 opacity-70" />
        </button>
        <Pane>
          <Line id="lite" label="Lite mode" hint="Stills the wallpaper and turns off heavy effects for slower computers.">
            <Toggle label="Lite mode" on={settings.lite} flip={() => patch({ lite: !settings.lite })} />
          </Line>
          <Line id="motion" label="Reduce motion" hint="Fewer animations everywhere.">
            <Toggle label="Reduce motion" on={settings.reduceMotion} flip={() => patch({ reduceMotion: !settings.reduceMotion })} />
          </Line>
        </Pane>
        </>
      );
      break;
    case "profile":
      content = (
        <>
          <div className="nsx-pane nsx-rise flex flex-col items-center gap-3 py-8 text-center">
            <span className="nsx-avatar !size-24 !text-4xl" style={{ "--a1": theme.colors[0], "--a2": theme.accent, "--a3": theme.colors[2] } as CSSProperties}><span>{initial}</span></span>
            <p className="text-[22px] font-semibold">{settings.userName || "Nova user"}</p>
            <p className="text-[12px] text-white/50">Local account · saved in this browser only</p>
          </div>
          <Pane>
            <Line id="name" label="Name" hint="Shown on the lock screen and in your greeting.">
              <input aria-label="Your name" value={settings.userName} maxLength={24} onChange={(event) => patch({ userName: event.target.value })} className="nsx-input w-52" />
            </Line>
          </Pane>
        </>
      );
      break;
    case "about":
      content = (
        <>
          <div className="nsx-pane nsx-rise relative flex flex-col items-center overflow-hidden py-10 text-center">
            <div className="absolute inset-0 opacity-60"><NovaWallpaper theme={theme} wall="cosmos" still={!motion} /></div>
            <NovaMark className="relative size-20 drop-shadow-[0_0_24px_var(--primary)]" />
            <p className="nsx-word relative mt-4">NOVA</p>
            <p className="relative mt-1 text-[12px] uppercase tracking-[.3em] text-white/60">Version {props.version}</p>
          </div>
          <Pane>
            <Line id="switch" label="Switch to PRIVATE OS" hint="The classic desktop. Your open windows stay open.">
              <button type="button" onClick={props.switchToPrivate} className="nsx-btn flex items-center gap-1.5"><RotateCw className="size-3.5" />Switch</button>
            </Line>
            <Line id="setup" label="Run setup again" hint="Go through the welcome setup on the next start.">
              <button type="button" onClick={props.restartSetup} className="nsx-btn">Run setup</button>
            </Line>
            <Line id="erase" label="Erase everything" hint="Deletes all settings, files and bookmarks in this browser.">
              <button type="button" onClick={() => { if (!window.confirm("Erase all data in this browser?")) return; try { localStorage.clear(); sessionStorage.clear(); } catch { /* storage unavailable */ } window.setTimeout(() => window.location.reload(), 200); }} className="nsx-btn flex items-center gap-1.5 !text-rose-300"><Trash2 className="size-3.5" />Erase</button>
            </Line>
          </Pane>
          <Pane title="What's new">
            <ol data-setting="news" className="nsx-timeline">
              {props.changelog.slice(0, 4).map((entry) => (
                <li key={entry.v}>
                  <p className="flex items-baseline justify-between gap-2 text-[13px] font-bold"><span className="text-[var(--primary)]">Version {entry.v}</span><span className="text-[11px] font-medium text-white/40">{entry.date}</span></p>
                  <ul className="mt-1.5 space-y-1 text-[12px] text-white/70">
                    {entry.items.map((item) => <li key={item}>{item}</li>)}
                  </ul>
                </li>
              ))}
            </ol>
          </Pane>
        </>
      );
      break;
  }

  const current = spaceOf(space);
  return (
    <div className="nsx-root @container relative flex min-h-0 flex-1 flex-col text-white">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <NovaWallpaper theme={theme} wall={liveScene} still className="absolute inset-0 scale-110 opacity-70 blur-2xl" />
        <div className="nsx-veil absolute inset-0" />
      </div>
      <div ref={scroller} className="relative min-h-0 flex-1 overflow-y-auto">
        {space === "home" ? (
          <div key="home" className="nsx-page mx-auto max-w-[1100px] px-5 pb-8 pt-14 @3xl:px-8">{home}</div>
        ) : (
          <div key={space} className="nsx-page nsx-slide mx-auto max-w-[860px] px-5 pb-28 pt-14 @3xl:px-8">
            <header className="mb-5 flex items-center gap-4">
              <button type="button" onClick={() => go("home")} aria-label="Back to all settings" className="nsx-back"><ChevronLeft className="size-5" /></button>
              <SpaceIcon space={current} size={52} />
              <div className="min-w-0">
                <h2 className="truncate text-[26px] font-semibold tracking-tight">{current.label}</h2>
                <p className="truncate text-[12.5px] text-white/55">{current.blurb}</p>
              </div>
            </header>
            <div className="space-y-4">{content}</div>
          </div>
        )}
      </div>
      {space !== "home" && (
        <nav aria-label="Jump to" className="nsx-jump">
          {SPACES.map((item) => (
            <button key={item.id} type="button" aria-label={item.label} title={item.label} aria-current={item.id === space ? "page" : undefined} onClick={() => go(item.id)} className={item.id === space ? "is-on" : ""}>
              <SpaceIcon space={item} size={34} />
            </button>
          ))}
        </nav>
      )}
    </div>
  );
}
