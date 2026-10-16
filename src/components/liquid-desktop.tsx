// Liquid Glass desktop (macOS style): wallpaper, menu bar, widgets, Spotlight bar and dock.
import {
  createContext,
  useEffect,
  useRef,
  useState,
  type ComponentType,
  type ReactNode,
} from "react";
import {
  BatteryFull,
  Cloud,
  CloudDrizzle,
  CloudFog,
  CloudLightning,
  CloudRain,
  CloudSnow,
  CloudSun,
  Copy,
  Folder,
  Layers,
  LayoutGrid,
  Play,
  Search,
  ShieldCheck,
  Smile,
  SlidersHorizontal,
  Sun,
  Trash2,
  Wifi,
} from "lucide-react";

type IconComponent = ComponentType<{ className?: string }>;
export type LiquidApp = { id: string; label: string; icon: IconComponent };

/** True when the Liquid Glass theme is on (windows read it to draw macOS-style title bars). */
export const LiquidContext = createContext(false);

export const LIQUID_DOCK = [
  "browser",
  "messages",
  "mail",
  "maps",
  "photos",
  "camera",
  "calendar",
  "contacts",
  "todo",
  "notes",
  "media",
  "writer",
  "sheets",
  "slides",
  "games",
  "settings",
];

// ---------------- Wallpaper ----------------

export function LiquidWallpaper() {
  return (
    <div aria-hidden className="absolute inset-0 overflow-hidden bg-[#1a1a6e]">
      <svg
        viewBox="0 0 1440 900"
        preserveAspectRatio="xMidYMid slice"
        className="liquid-wall absolute inset-0 size-full"
      >
        <defs>
          <linearGradient id="lw-base" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#2d1fa8" />
            <stop offset=".35" stopColor="#4a3df0" />
            <stop offset=".62" stopColor="#2342c9" />
            <stop offset="1" stopColor="#0d1a5c" />
          </linearGradient>
          <linearGradient id="lw-wave" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#7b8cff" stopOpacity=".0" />
            <stop offset=".45" stopColor="#b7c4ff" stopOpacity=".55" />
            <stop offset="1" stopColor="#5f7dff" stopOpacity=".15" />
          </linearGradient>
          <linearGradient id="lw-deep" x1="0" y1="1" x2="1" y2="0">
            <stop offset="0" stopColor="#0b1450" />
            <stop offset="1" stopColor="#3550e0" />
          </linearGradient>
          <filter id="lw-soft" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="18" />
          </filter>
          <filter id="lw-softer" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="40" />
          </filter>
        </defs>
        <rect width="1440" height="900" fill="url(#lw-base)" />
        <ellipse
          cx="260"
          cy="120"
          rx="520"
          ry="300"
          fill="#6a3cff"
          opacity=".55"
          filter="url(#lw-softer)"
        />
        <path
          d="M-80 640 C 260 520 520 300 820 230 C 1080 170 1300 120 1540 40 L 1540 980 L -80 980 Z"
          fill="url(#lw-deep)"
          opacity=".9"
          filter="url(#lw-soft)"
        />
        <path
          d="M-60 700 C 300 560 560 330 860 250 C 1120 180 1320 110 1520 20"
          fill="none"
          stroke="url(#lw-wave)"
          strokeWidth="46"
          strokeLinecap="round"
          filter="url(#lw-soft)"
        />
        <path
          d="M-60 700 C 300 560 560 330 860 250 C 1120 180 1320 110 1520 20"
          fill="none"
          stroke="#dfe6ff"
          strokeOpacity=".55"
          strokeWidth="3"
        />
        <path
          d="M520 980 C 700 700 980 560 1500 520"
          fill="none"
          stroke="#6f86ff"
          strokeOpacity=".35"
          strokeWidth="120"
          filter="url(#lw-softer)"
        />
        <ellipse
          cx="1180"
          cy="700"
          rx="340"
          ry="160"
          fill="#1b2b8f"
          opacity=".7"
          filter="url(#lw-softer)"
        />
      </svg>
    </div>
  );
}

// ---------------- Menu bar ----------------

export type MenuItem = { label: string; run?: (() => void) | undefined; divider?: boolean };

export function LiquidMenuBar({
  appName,
  menus,
  battery,
  time,
  clock24,
  onSearch,
  onControl,
  onAppleMenu,
}: {
  appName: string;
  menus: { title: string; items: MenuItem[] }[];
  battery: number;
  time: Date;
  clock24: boolean;
  onSearch: () => void;
  onControl: () => void;
  onAppleMenu: MenuItem[];
}) {
  const [open, setOpen] = useState<string | null>(null);
  const bar = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const close = (event: PointerEvent) => {
      if (!bar.current?.contains(event.target as Node)) setOpen(null);
    };
    window.addEventListener("pointerdown", close);
    return () => window.removeEventListener("pointerdown", close);
  }, [open]);
  const all = [
    { title: "__apple", items: onAppleMenu },
    { title: appName, items: [] as MenuItem[] },
    ...menus,
  ];
  const stamp = `${time.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}  ${time.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: !clock24 })}`;
  return (
    <div
      ref={bar}
      className="liquid-menubar absolute inset-x-0 top-0 z-[48] flex h-7 items-center justify-between px-2 text-[13px] text-white"
    >
      <div className="flex min-w-0 items-center">
        {all.map((menu) => {
          const isApple = menu.title === "__apple";
          const isApp = menu.title === appName;
          const items = isApp ? onAppleMenu.slice(0, 2) : menu.items;
          return (
            <div key={menu.title} className="relative">
              <button
                type="button"
                onClick={() => setOpen((value) => (value === menu.title ? null : menu.title))}
                onPointerEnter={() => open && setOpen(menu.title)}
                className={`rounded-md px-2.5 py-0.5 ${isApp ? "font-bold" : ""} ${open === menu.title ? "bg-white/20" : "hover:bg-white/10"} ${!isApple && !isApp ? "max-sm:hidden" : ""}`}
              >
                {isApple ? (
                  <ShieldCheck aria-label="PRIVATE menu" className="size-4" />
                ) : (
                  menu.title
                )}
              </button>
              {open === menu.title && items.length > 0 && (
                <div
                  role="menu"
                  className="liquid-menu absolute left-0 top-full mt-1 min-w-52 rounded-xl p-1.5 text-[13px] [animation:window-in_.16s_cubic-bezier(.22,1,.36,1)]"
                >
                  {items.map((item, index) =>
                    item.divider ? (
                      <div key={index} className="mx-2 my-1 h-px bg-white/15" />
                    ) : (
                      <button
                        key={item.label}
                        type="button"
                        role="menuitem"
                        disabled={!item.run}
                        onClick={() => {
                          setOpen(null);
                          item.run?.();
                        }}
                        className="block w-full rounded-md px-2.5 py-1 text-left hover:bg-[#0a84ff] disabled:opacity-40 disabled:hover:bg-transparent"
                      >
                        {item.label}
                      </button>
                    ),
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
      <div className="flex shrink-0 items-center gap-3 pr-1.5 text-[12px]">
        <span className="flex items-center gap-1 max-sm:hidden">
          <BatteryFull className="size-[18px]" />
          <span className="tabular-nums">{battery}%</span>
        </span>
        <Wifi className="size-4 max-sm:hidden" />
        <button
          type="button"
          aria-label="Spotlight Search"
          onClick={onSearch}
          className="rounded p-0.5 hover:bg-white/15"
        >
          <Search className="size-3.5" />
        </button>
        <button
          type="button"
          aria-label="Control Center"
          onClick={onControl}
          className="rounded p-0.5 hover:bg-white/15"
        >
          <SlidersHorizontal className="size-3.5" />
        </button>
        <span className="whitespace-pre font-medium tabular-nums">{stamp}</span>
      </div>
    </div>
  );
}

// ---------------- Widgets ----------------

const card = "liquid-card pointer-events-auto rounded-[22px] text-white";

function MiniCalendar({ now, weekStart }: { now: Date; weekStart: number }) {
  const first = (new Date(now.getFullYear(), now.getMonth(), 1).getDay() - weekStart + 7) % 7;
  const days = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const cells = [
    ...Array.from({ length: first }, () => 0),
    ...Array.from({ length: days }, (_, i) => i + 1),
  ];
  const heads = weekStart
    ? ["M", "T", "W", "T", "F", "S", "S"]
    : ["S", "M", "T", "W", "T", "F", "S"];
  return (
    <div className={`${card} w-[8.5rem] p-3`}>
      <p className="mb-1 text-[9px] font-bold uppercase tracking-wide text-[#ff6b6b]">
        {now.toLocaleDateString("en-US", { month: "long" })}
      </p>
      <div className="grid grid-cols-7 gap-y-0.5 text-center text-[8px] font-semibold tabular-nums">
        {heads.map((d, i) => (
          <span key={i} className="text-white/60">
            {d}
          </span>
        ))}
        {cells.map((d, i) => (
          <span
            key={i}
            className={
              d === now.getDate()
                ? "mx-auto grid size-3.5 place-items-center rounded-full bg-white text-[#3a3ad0]"
                : ""
            }
          >
            {d || ""}
          </span>
        ))}
      </div>
    </div>
  );
}

function zoneParts(zone: string, now: Date) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: zone,
    hour: "numeric",
    minute: "numeric",
    hourCycle: "h23",
    year: "numeric",
    month: "numeric",
    day: "numeric",
  }).formatToParts(now);
  const get = (type: string) => Number(parts.find((p) => p.type === type)?.value ?? 0);
  return {
    h: get("hour"),
    m: get("minute"),
    stamp: Date.UTC(get("year"), get("month") - 1, get("day"), get("hour"), get("minute")),
  };
}

function AnalogClock({ h, m }: { h: number; m: number }) {
  const hourAngle = ((h % 12) + m / 60) * 30;
  const minAngle = m * 6;
  return (
    <svg viewBox="0 0 40 40" className="size-12">
      <circle cx="20" cy="20" r="19" className="fill-white/90" />
      {Array.from({ length: 12 }, (_, i) => (
        <text
          key={i}
          x={20 + 14 * Math.sin(((i + 1) * Math.PI) / 6)}
          y={20 - 14 * Math.cos(((i + 1) * Math.PI) / 6) + 2}
          textAnchor="middle"
          fontSize="5"
          fontWeight="600"
          className="fill-[#2b2b6b]"
        >
          {i + 1}
        </text>
      ))}
      <line
        x1="20"
        y1="20"
        x2={20 + 8 * Math.sin((hourAngle * Math.PI) / 180)}
        y2={20 - 8 * Math.cos((hourAngle * Math.PI) / 180)}
        stroke="#1f1f4d"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <line
        x1="20"
        y1="20"
        x2={20 + 12.5 * Math.sin((minAngle * Math.PI) / 180)}
        y2={20 - 12.5 * Math.cos((minAngle * Math.PI) / 180)}
        stroke="#1f1f4d"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
      <circle cx="20" cy="20" r="1.3" fill="#ff9f0a" />
    </svg>
  );
}

const DEFAULT_CLOCKS = ["America/Los_Angeles", "Asia/Tokyo", "Australia/Sydney", "Europe/Paris"];

function WorldClocks({ now, zones, localZone }: { now: Date; zones: string[]; localZone: string }) {
  const list = (zones.length ? zones : DEFAULT_CLOCKS).slice(0, 4);
  const here = zoneParts(localZone, now);
  return (
    <div className={`${card} flex gap-3 p-3`}>
      {list.map((zone) => {
        const t = zoneParts(zone, now);
        const diff = Math.round((t.stamp - here.stamp) / 3600000);
        const dayShift = Math.round(
          Math.floor(t.stamp / 86400000) - Math.floor(here.stamp / 86400000),
        );
        return (
          <div key={zone} className="flex w-14 flex-col items-center text-center">
            <AnalogClock h={t.h} m={t.m} />
            <p className="mt-1 w-full truncate text-[10px] font-semibold">
              {zone.split("/").pop()!.replace(/_/g, " ")}
            </p>
            <p className="text-[8px] text-white/70">
              {dayShift > 0 ? "Tomorrow" : dayShift < 0 ? "Yesterday" : "Today"}
            </p>
            <p className="text-[8px] text-white/70">
              {diff >= 0 ? "+" : ""}
              {diff}HRS
            </p>
          </div>
        );
      })}
    </div>
  );
}

const WX: Record<number, [string, IconComponent]> = {
  0: ["Clear", Sun],
  1: ["Mostly Clear", CloudSun],
  2: ["Partly Cloudy", CloudSun],
  3: ["Cloudy", Cloud],
  45: ["Fog", CloudFog],
  48: ["Fog", CloudFog],
  51: ["Drizzle", CloudDrizzle],
  53: ["Drizzle", CloudDrizzle],
  55: ["Drizzle", CloudDrizzle],
  61: ["Rain", CloudRain],
  63: ["Rain", CloudRain],
  65: ["Heavy Rain", CloudRain],
  71: ["Snow", CloudSnow],
  73: ["Snow", CloudSnow],
  75: ["Snow", CloudSnow],
  80: ["Showers", CloudRain],
  81: ["Showers", CloudRain],
  82: ["Showers", CloudRain],
  95: ["Thunderstorm", CloudLightning],
};
const wx = (code: number) => WX[code] ?? WX[Math.floor(code / 10) * 10] ?? ["—", Cloud];

type WeatherData = {
  place: string;
  temp: number;
  code: number;
  hi: number;
  lo: number;
  hours: { label: string; temp: number; code: number }[];
};

function WeatherCard({ onOpen }: { onOpen: () => void }) {
  const [data, setData] = useState<WeatherData | null>(null);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    let city = "Paris";
    try {
      city = localStorage.getItem("pos-city") || city;
    } catch {
      // storage unavailable
    }
    (async () => {
      const geo = (await (
        await fetch(
          `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1`,
        )
      ).json()) as {
        results?: { name: string; latitude: number; longitude: number; timezone?: string }[];
      };
      const hit = geo.results?.[0];
      if (!hit) throw new Error("no city");
      const w = (await (
        await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${hit.latitude}&longitude=${hit.longitude}&current=temperature_2m,weather_code&hourly=temperature_2m,weather_code&daily=temperature_2m_max,temperature_2m_min&forecast_days=2&timezone=auto`,
        )
      ).json()) as {
        current: { temperature_2m: number; weather_code: number; time: string };
        hourly: { time: string[]; temperature_2m: number[]; weather_code: number[] };
        daily: { temperature_2m_max: number[]; temperature_2m_min: number[] };
      };
      const start = Math.max(
        0,
        w.hourly.time.findIndex((t) => t.slice(0, 13) === w.current.time.slice(0, 13)),
      );
      const hours = w.hourly.time.slice(start, start + 6).map((t, i) => {
        const hour = Number(t.slice(11, 13));
        return {
          label: `${hour % 12 || 12} ${hour < 12 ? "AM" : "PM"}`,
          temp: w.hourly.temperature_2m[start + i] ?? 0,
          code: w.hourly.weather_code[start + i] ?? 0,
        };
      });
      setData({
        place: hit.name,
        temp: w.current.temperature_2m,
        code: w.current.weather_code,
        hi: w.daily.temperature_2m_max[0] ?? 0,
        lo: w.daily.temperature_2m_min[0] ?? 0,
        hours,
      });
    })().catch(() => setFailed(true));
  }, []);
  const [desc, Icon] = wx(data?.code ?? 2);
  return (
    <button type="button" onClick={onOpen} className={`${card} w-[17.5rem] p-3.5 text-left`}>
      {data ? (
        <>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[13px] font-bold">{data.place}</p>
              <p className="text-4xl font-light leading-tight">{Math.round(data.temp)}°</p>
            </div>
            <div className="text-right text-[11px] font-semibold">
              <Icon className="mb-1 ml-auto size-5" />
              <p>{desc}</p>
              <p>
                H:{Math.round(data.hi)}° L:{Math.round(data.lo)}°
              </p>
            </div>
          </div>
          <div className="mt-2 grid grid-cols-6 text-center text-[10px] font-semibold">
            {data.hours.map((h, i) => {
              const [, HIcon] = wx(h.code);
              return (
                <div key={i} className="space-y-1">
                  <p className="text-white/80">{i === 0 ? "Now" : h.label}</p>
                  <HIcon className="mx-auto size-4" />
                  <p>{Math.round(h.temp)}°</p>
                </div>
              );
            })}
          </div>
        </>
      ) : (
        <div className="grid h-[7.5rem] place-items-center text-xs text-white/70">
          {failed ? "Weather unavailable. Open Weather to pick a city." : "Loading weather…"}
        </div>
      )}
    </button>
  );
}

export function LiquidWidgets({
  now,
  weekStart,
  zones,
  localZone,
  openApp,
}: {
  now: Date;
  weekStart: number;
  zones: string[];
  localZone: string;
  openApp: (id: string) => void;
}) {
  return (
    <div className="liquid-widgets pointer-events-none absolute left-4 top-10 z-[9] flex flex-col gap-4 max-md:hidden">
      <div className="stagger flex items-start gap-3">
        <MiniCalendar now={now} weekStart={weekStart} />
        <WorldClocks now={now} zones={zones} localZone={localZone} />
      </div>
      <div className="stagger mt-[min(12vh,7rem)] flex flex-col gap-3">
        <WeatherCard onOpen={() => openApp("weather")} />
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => openApp("focus")}
            className={`${card} flex size-[8.5rem] flex-col justify-between p-3 text-left`}
          >
            <span className="grid size-9 place-items-center rounded-lg bg-gradient-to-br from-fuchsia-500 to-indigo-600 text-[9px] font-black leading-none">
              FOCUS
            </span>
            <span>
              <span className="block text-[9px] text-white/70">Focus Timer</span>
              <span className="block text-[11px] font-semibold leading-tight">
                Time to get things done
              </span>
            </span>
            <span className="inline-flex w-max items-center gap-1 rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-semibold">
              <Play className="size-2.5 fill-white" />
              25m
            </span>
          </button>
          <button
            type="button"
            onClick={() => openApp("notes")}
            className={`${card} flex size-[8.5rem] flex-col justify-between p-3 text-left`}
          >
            <Smile className="size-7 stroke-[1.5]" />
            <span className="text-[11px] font-semibold">New Note</span>
          </button>
        </div>
      </div>
    </div>
  );
}

// ---------------- Spotlight bar ----------------

export function LiquidSpotlight({
  onSearch,
  onApps,
  onFiles,
  onTaskView,
  onNotes,
}: {
  onSearch: () => void;
  onApps: () => void;
  onFiles: () => void;
  onTaskView: () => void;
  onNotes: () => void;
}) {
  const circle =
    "liquid-pill grid size-11 place-items-center rounded-full text-white transition-transform hover:scale-110";
  return (
    <div className="absolute inset-x-0 top-[34%] z-[8] flex items-center justify-center gap-2.5 px-4 [animation:rise_.4s_cubic-bezier(.22,1,.36,1)] max-sm:top-[22%]">
      <button
        type="button"
        onClick={onSearch}
        className="liquid-pill flex h-11 w-[min(19rem,60vw)] items-center gap-2.5 rounded-full px-4 text-left text-lg text-white/85"
      >
        <Search className="size-5" />
        Spotlight Search
      </button>
      <button type="button" aria-label="Apps" onClick={onApps} className={circle}>
        <LayoutGrid className="size-5" />
      </button>
      <button
        type="button"
        aria-label="Files"
        onClick={onFiles}
        className={`${circle} max-sm:hidden`}
      >
        <Folder className="size-5" />
      </button>
      <button
        type="button"
        aria-label="Open windows"
        onClick={onTaskView}
        className={`${circle} max-sm:hidden`}
      >
        <Layers className="size-5" />
      </button>
      <button
        type="button"
        aria-label="Notes"
        onClick={onNotes}
        className={`${circle} max-sm:hidden`}
      >
        <Copy className="size-5" />
      </button>
    </div>
  );
}

// ---------------- Dock ----------------

export function LiquidDock({
  apps,
  openWins,
  focusedId,
  onApp,
  onLauncher,
  onFiles,
  onContext,
  extra,
}: {
  apps: LiquidApp[];
  openWins: string[];
  focusedId: string | null;
  onApp: (id: string) => void;
  onLauncher: () => void;
  onFiles: () => void;
  onContext: (id: string, x: number, y: number) => void;
  extra?: ReactNode;
}) {
  const item = (
    key: string,
    label: string,
    content: ReactNode,
    onClick: () => void,
    running = false,
    id?: string,
  ) => (
    <button
      key={key}
      type="button"
      aria-label={label}
      onClick={onClick}
      onContextMenu={
        id
          ? (event) => {
              event.preventDefault();
              event.stopPropagation();
              onContext(id, event.clientX, event.clientY);
            }
          : undefined
      }
      className="liquid-dock-item group relative grid place-items-center"
    >
      {content}
      <span className="liquid-tip pointer-events-none absolute -top-9 left-1/2 hidden -translate-x-1/2 whitespace-nowrap rounded-lg px-2 py-1 text-[11px] text-white group-hover:block">
        {label}
      </span>
      {running && (
        <span
          className={`absolute -bottom-1.5 left-1/2 size-1 -translate-x-1/2 rounded-full ${focusedId === id ? "bg-white" : "bg-white/60"}`}
        />
      )}
    </button>
  );
  const glyph = (Icon: IconComponent, tone: string) => (
    <span
      className={`liquid-glyph grid size-full place-items-center rounded-[24%] bg-gradient-to-b ${tone}`}
    >
      <Icon className="size-[58%] text-white" />
    </span>
  );
  return (
    <nav
      aria-label="Dock"
      className="liquid-dock absolute bottom-2 left-1/2 z-40 flex max-w-[calc(100%-1rem)] -translate-x-1/2 items-end gap-1 overflow-x-auto rounded-[26px] px-2 pb-2 pt-2"
    >
      {item(
        "files",
        "Files",
        glyph(Smile, "from-sky-300 to-blue-600"),
        onFiles,
        openWins.includes("files"),
        "files",
      )}
      {item("launcher", "Apps", glyph(LayoutGrid, "from-zinc-300 to-zinc-500"), onLauncher)}
      {apps.map(({ id, label, icon: Icon }) =>
        item(id, label, <Icon className="size-full" />, () => onApp(id), openWins.includes(id), id),
      )}
      <span aria-hidden className="mx-1 h-10 w-px self-center bg-white/25" />
      {item("downloads", "Downloads", glyph(Folder, "from-violet-400 to-purple-700"), onFiles)}
      {item(
        "trash",
        "Trash",
        <span className="liquid-glyph grid size-full place-items-center rounded-[24%] bg-white/15">
          <Trash2 className="size-[58%] text-white/90" />
        </span>,
        onFiles,
      )}
      {extra}
    </nav>
  );
}
