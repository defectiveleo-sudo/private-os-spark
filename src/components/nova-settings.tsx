import { useEffect, useMemo, useState, type ComponentType, type CSSProperties, type ReactNode } from "react";
import {
  ArrowDown,
  ArrowUp,
  Bell,
  Check,
  Clock,
  Cpu,
  Globe2,
  Image as ImageIcon,
  Info,
  LayoutPanelLeft,
  Lock,
  Moon,
  Palette,
  Plus,
  RotateCw,
  Search,
  ShieldCheck,
  Sparkles,
  Sun,
  Trash2,
  UserRound,
  Volume2,
  X,
} from "lucide-react";
import { NOVA_PINS, NOVA_THEMES, NovaMark, NovaWallpaper, novaTheme, type NovaApp, type NovaSettings } from "@/components/nova-shell";

// NOVA OS Settings: one calm window with a searchable sidebar and grouped cards,
// built only around what NOVA OS has (no desktop styles, taskbars or classic themes).

type Icon = ComponentType<{ className?: string }>;
export type NovaSettingsData = NovaSettings & { soundHover: boolean; soundClick: boolean; timeZone: string; autoLock: number };
type Props = {
  settings: NovaSettingsData;
  patch: (patch: Partial<NovaSettingsData>) => void;
  apps: NovaApp[];
  version: string;
  changelog: { v: string; date: string; items: string[] }[];
  photo?: string | undefined;
  switchToPrivate: () => void;
  restartSetup: () => void;
  wisp: { servers: string[]; probe: (url: string) => Promise<boolean> };
};

type Page = { id: string; label: string; icon: Icon; from: string; to: string; keys: string };
const PAGES: Page[] = [
  { id: "appearance", label: "Appearance", icon: Palette, from: "#a855f7", to: "#6366f1", keys: "theme color accent aurora nebula ember glacier verdant sakura solar graphite" },
  { id: "wallpaper", label: "Wallpaper", icon: ImageIcon, from: "#22d3ee", to: "#0ea5e9", keys: "wallpaper photo live parallax depth background" },
  { id: "dock", label: "Dock & Desktop", icon: LayoutPanelLeft, from: "#f472b6", to: "#e11d48", keys: "dock pin apps magnify magnification hot corner overview" },
  { id: "display", label: "Display", icon: Sun, from: "#fbbf24", to: "#f97316", keys: "brightness night light warm screen" },
  { id: "sound", label: "Sound", icon: Volume2, from: "#fb7185", to: "#ef4444", keys: "sound volume click hover effects" },
  { id: "focus", label: "Focus & Notifications", icon: Bell, from: "#818cf8", to: "#4f46e5", keys: "focus notifications do not disturb quiet" },
  { id: "time", label: "Date & Time", icon: Clock, from: "#94a3b8", to: "#475569", keys: "clock time zone 24 hour" },
  { id: "privacy", label: "Privacy & Web", icon: ShieldCheck, from: "#34d399", to: "#059669", keys: "privacy proxy server wisp lock auto-lock reddit comet browser erase" },
  { id: "performance", label: "Performance", icon: Cpu, from: "#fdba74", to: "#ea580c", keys: "performance lite fast slow animations motion" },
  { id: "account", label: "Account", icon: UserRound, from: "#60a5fa", to: "#2563eb", keys: "name account user profile" },
  { id: "system", label: "System", icon: Info, from: "#a1a1aa", to: "#52525b", keys: "about version changelog private os switch setup reset" },
];

function PageIcon({ page, size = 28 }: { page: Page; size?: number }) {
  const PIcon = page.icon;
  return (
    <span className="grid shrink-0 place-items-center rounded-[30%] text-white shadow-[inset_0_1px_0_rgb(255_255_255/.35),0_2px_6px_rgb(0_0_0/.35)]" style={{ width: size, height: size, background: `linear-gradient(145deg, ${page.from}, ${page.to})` }}>
      <PIcon className="size-[56%]" />
    </span>
  );
}

function Switch({ on, flip, label }: { on: boolean; flip: () => void; label: string }) {
  return (
    <button type="button" role="switch" aria-checked={on} aria-label={label} onClick={flip} className={`ns-switch ${on ? "is-on" : ""}`}>
      <span />
    </button>
  );
}

function Card({ title, children }: { title?: string; children: ReactNode }) {
  return (
    <section className="ns-in">
      {title && <h3 className="mb-2 px-1 text-[11px] font-semibold uppercase tracking-[.12em] text-white/45">{title}</h3>}
      <div className="ns-card divide-y divide-white/[.06] overflow-hidden rounded-[18px]">{children}</div>
    </section>
  );
}

function Row({ label, hint, children }: { label: string; hint?: string; children?: ReactNode }) {
  return (
    <div className="flex min-h-[54px] items-center gap-4 px-4 py-2.5">
      <div className="min-w-0 flex-1">
        <p className="text-[13px] font-medium text-white/90">{label}</p>
        {hint && <p className="mt-0.5 text-[11.5px] leading-snug text-white/50">{hint}</p>}
      </div>
      {children}
    </div>
  );
}

function Slider({ value, min = 0, max = 100, set, label, icons }: { value: number; min?: number; max?: number; set: (value: number) => void; label: string; icons?: [Icon, Icon] }) {
  const [Low, High] = icons ?? [];
  return (
    <div className="flex w-56 items-center gap-2.5">
      {Low && <Low className="size-3.5 shrink-0 text-white/50" />}
      <input type="range" aria-label={label} min={min} max={max} value={value} onChange={(event) => set(Number(event.target.value))} className="ns-range min-w-0 flex-1" style={{ "--ns-fill": `${((value - min) / (max - min)) * 100}%` } as CSSProperties} />
      {High && <High className="size-4 shrink-0 text-white/70" />}
    </div>
  );
}

function Segmented<T extends string>({ value, options, set, label }: { value: T; options: { id: T; label: string }[]; set: (value: T) => void; label: string }) {
  return (
    <div role="radiogroup" aria-label={label} className="flex rounded-full bg-black/30 p-0.5">
      {options.map((option) => (
        <button key={option.id} type="button" role="radio" aria-checked={value === option.id} onClick={() => set(option.id)} className={`rounded-full px-3.5 py-1 text-[12px] font-semibold transition-colors ${value === option.id ? "bg-white/90 text-black shadow" : "text-white/65 hover:text-white"}`}>
          {option.label}
        </button>
      ))}
    </div>
  );
}

function ThemeCard({ id, active, pick }: { id: string; active: boolean; pick: () => void }) {
  const theme = novaTheme(id);
  const [a, b, c] = theme.colors;
  return (
    <button type="button" aria-pressed={active} onClick={pick} className={`ns-theme group relative overflow-hidden rounded-2xl text-left ${active ? "is-active" : ""}`} style={{ "--ns-accent": theme.accent } as CSSProperties}>
      <span className="relative block aspect-[16/10] w-full" style={{ background: `radial-gradient(60% 80% at 20% 30%, ${a}cc, transparent 70%), radial-gradient(55% 70% at 80% 25%, ${b}bb, transparent 70%), radial-gradient(70% 60% at 55% 95%, ${c}aa, transparent 70%), ${theme.base}` }}>
        <span className="absolute inset-x-[22%] bottom-2 h-2.5 rounded-full bg-white/25 backdrop-blur" />
        <span className="absolute left-1/2 top-2 h-2 w-10 -translate-x-1/2 rounded-full bg-black/70" />
      </span>
      <span className="flex items-center justify-between gap-2 px-3 py-2">
        <span className="min-w-0">
          <span className="block truncate text-[12.5px] font-semibold text-white">{theme.name}</span>
          <span className="block truncate text-[11px] text-white/50">{theme.sub}</span>
        </span>
        <span className="size-3 shrink-0 rounded-full" style={{ background: theme.accent, boxShadow: `0 0 10px ${theme.accent}` }} />
      </span>
      {active && <span className="absolute right-2 top-2 grid size-6 place-items-center rounded-full bg-white text-black shadow-lg"><Check className="size-3.5" /></span>}
    </button>
  );
}

function NetworkCard({ wisp }: { wisp: Props["wisp"] }) {
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
  const options = [{ id: "auto", label: "Automatic", hint: "Picks the fastest working server" }, ...wisp.servers.map((url) => ({ id: url, label: url.replace(/^wss:\/\//, "").replace(/\/.*$/, ""), hint: url })), { id: "custom", label: "Custom server", hint: "Your own Wisp address" }];
  return (
    <Card title="Comet proxy server">
      {options.map((option) => (
        <button key={option.id} type="button" onClick={() => save(option.id)} className="flex w-full items-center gap-3 px-4 py-2.5 text-left hover:bg-white/[.04]">
          <span className={`grid size-[18px] shrink-0 place-items-center rounded-full border ${choice === option.id ? "border-[var(--primary)] bg-[var(--primary)]" : "border-white/30"}`}>{choice === option.id && <span className="size-1.5 rounded-full bg-black" />}</span>
          <span className="min-w-0 flex-1">
            <span className="block text-[13px] font-medium text-white/90">{option.label}</span>
            <span className="block truncate text-[11px] text-white/45">{option.hint}</span>
          </span>
          {option.id in status && <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${status[option.id] ? "bg-emerald-400/15 text-emerald-300" : "bg-rose-400/15 text-rose-300"}`}>{status[option.id] ? "Online" : "Offline"}</span>}
        </button>
      ))}
      {choice === "custom" && (
        <div className="px-4 py-2.5">
          <input aria-label="Custom Wisp server" value={custom} onChange={(event) => { setCustom(event.target.value); save("custom", event.target.value); }} placeholder="wss://your-server/wisp/" className="h-9 w-full rounded-xl bg-black/30 px-3 text-[13px] outline-none ring-1 ring-white/10 focus:ring-[var(--primary)]" />
        </div>
      )}
      <Row label="Check servers" hint="Sees which proxy servers answer right now.">
        <button type="button" onClick={test} disabled={testing} className="ns-btn">{testing ? "Checking…" : "Check now"}</button>
      </Row>
    </Card>
  );
}

export function NovaSettingsApp(props: Props) {
  const { settings, patch, apps } = props;
  const [page, setPage] = useState("appearance");
  const [query, setQuery] = useState("");
  const [adding, setAdding] = useState(false);
  const theme = novaTheme(settings.novaTheme);
  const current = PAGES.find((item) => item.id === page) ?? PAGES[0]!;
  const shown = useMemo(() => {
    const text = query.trim().toLowerCase();
    if (!text) return PAGES;
    return PAGES.filter((item) => `${item.label} ${item.keys}`.toLowerCase().includes(text));
  }, [query]);
  const byId = (id: string) => apps.find((app) => app.id === id);
  const pins = settings.novaPins.filter((id) => byId(id));
  const movePin = (index: number, by: -1 | 1) => {
    const next = [...pins];
    const [item] = next.splice(index, 1);
    next.splice(index + by, 0, item!);
    patch({ novaPins: next });
  };
  const zones = useMemo(() => {
    try {
      return (Intl as unknown as { supportedValuesOf?: (key: string) => string[] }).supportedValuesOf?.("timeZone") ?? [];
    } catch {
      return [];
    }
  }, []);
  const initial = (settings.userName.trim()[0] ?? "N").toUpperCase();

  let content: ReactNode;
  switch (page) {
    case "appearance":
      content = (
        <>
          <Card title="Theme">
            <div className="grid grid-cols-2 gap-3 p-3 sm:grid-cols-3 xl:grid-cols-4">
              {NOVA_THEMES.map((item) => <ThemeCard key={item.id} id={item.id} active={item.id === theme.id} pick={() => patch({ novaTheme: item.id })} />)}
            </div>
          </Card>
          <Card>
            <Row label="Accent colour" hint={`${theme.name} uses ${theme.accent.toUpperCase()} for highlights, the dock and the Dynamic Island.`}>
              <span className="size-6 rounded-full ring-2 ring-white/20" style={{ background: theme.accent, boxShadow: `0 0 14px ${theme.accent}` }} />
            </Row>
          </Card>
        </>
      );
      break;
    case "wallpaper":
      content = (
        <>
          <div className="ns-in relative aspect-[16/8] overflow-hidden rounded-[22px] ring-1 ring-white/10">
            <NovaWallpaper theme={theme} photo={settings.novaPhoto ? props.photo : undefined} />
            <div className="absolute inset-x-0 bottom-0 flex items-end justify-between bg-gradient-to-t from-black/60 to-transparent p-4">
              <div>
                <p className="text-[15px] font-semibold">{settings.novaPhoto ? "Photo" : `${theme.name} live`}</p>
                <p className="text-[11.5px] text-white/60">{settings.novaPhoto ? "Your PRIVATE OS wallpaper with Nova colours on top" : "Moves slowly and follows your mouse"}</p>
              </div>
            </div>
          </div>
          <Card>
            <Row label="Wallpaper" hint="A live animated scene, or the photo you chose in PRIVATE OS.">
              <Segmented label="Wallpaper type" value={settings.novaPhoto ? "photo" : "live"} options={[{ id: "live", label: "Live" }, { id: "photo", label: "Photo" }]} set={(value) => patch({ novaPhoto: value === "photo" })} />
            </Row>
            <Row label="Depth effect" hint="The wallpaper shifts a little as you move the mouse.">
              <Switch label="Depth effect" on={settings.novaParallax} flip={() => patch({ novaParallax: !settings.novaParallax })} />
            </Row>
          </Card>
        </>
      );
      break;
    case "dock":
      content = (
        <>
          <Card title="Dock">
            <Row label="Magnify on hover" hint="Icons grow as your mouse passes over them.">
              <Switch label="Magnify on hover" on={settings.novaMagnify} flip={() => patch({ novaMagnify: !settings.novaMagnify })} />
            </Row>
            {pins.map((id, index) => {
              const app = byId(id)!;
              const AppIcon = app.icon;
              return (
                <div key={id} className="flex items-center gap-3 px-4 py-2">
                  <span className="size-8 shrink-0"><AppIcon className="size-full" /></span>
                  <span className="min-w-0 flex-1 truncate text-[13px] text-white/90">{app.label}</span>
                  <button type="button" aria-label={`Move ${app.label} up`} disabled={index === 0} onClick={() => movePin(index, -1)} className="ns-icon-btn"><ArrowUp className="size-3.5" /></button>
                  <button type="button" aria-label={`Move ${app.label} down`} disabled={index === pins.length - 1} onClick={() => movePin(index, 1)} className="ns-icon-btn"><ArrowDown className="size-3.5" /></button>
                  <button type="button" aria-label={`Remove ${app.label} from the dock`} onClick={() => patch({ novaPins: pins.filter((item) => item !== id) })} className="ns-icon-btn hover:!text-rose-300"><X className="size-3.5" /></button>
                </div>
              );
            })}
            <div className="flex items-center gap-2 px-4 py-2.5">
              <button type="button" onClick={() => setAdding(!adding)} className="ns-btn flex items-center gap-1.5"><Plus className="size-3.5" />Add an app</button>
              <button type="button" onClick={() => patch({ novaPins: NOVA_PINS })} className="ns-btn">Reset dock</button>
            </div>
            {adding && (
              <div className="grid max-h-56 grid-cols-3 gap-1 overflow-y-auto p-3 sm:grid-cols-4">
                {apps.filter((app) => !pins.includes(app.id)).map((app) => {
                  const AppIcon = app.icon;
                  return (
                    <button key={app.id} type="button" onClick={() => patch({ novaPins: [...pins, app.id] })} className="flex flex-col items-center gap-1.5 rounded-xl p-2 text-center hover:bg-white/[.06]">
                      <span className="size-9"><AppIcon className="size-full" /></span>
                      <span className="w-full truncate text-[10.5px] text-white/75">{app.label}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </Card>
          <Card title="Desktop">
            <Row label="Hot corner" hint="Move the mouse to the top-left corner to see every window.">
              <Switch label="Hot corner" on={settings.novaHotCorner} flip={() => patch({ novaHotCorner: !settings.novaHotCorner })} />
            </Row>
          </Card>
        </>
      );
      break;
    case "display":
      content = (
        <Card>
          <Row label="Brightness" hint="Dims the whole screen.">
            <Slider label="Brightness" min={30} value={settings.novaBright} set={(value) => patch({ novaBright: value })} icons={[Sun, Sun]} />
          </Row>
          <Row label="Night light" hint="Warmer colours that are easier on the eyes at night.">
            <Switch label="Night light" on={settings.novaNight} flip={() => patch({ novaNight: !settings.novaNight })} />
          </Row>
        </Card>
      );
      break;
    case "sound":
      content = (
        <Card>
          <Row label="Interface sounds" hint="Soft sounds when you click and hover.">
            <Switch label="Interface sounds" on={settings.uiSounds} flip={() => patch({ uiSounds: !settings.uiSounds })} />
          </Row>
          <Row label="Volume">
            <Slider label="Interface sound volume" value={settings.soundVolume} set={(value) => patch({ soundVolume: value })} icons={[Volume2, Volume2]} />
          </Row>
          <Row label="Click sound">
            <Switch label="Click sound" on={settings.soundClick} flip={() => patch({ soundClick: !settings.soundClick })} />
          </Row>
          <Row label="Hover sound">
            <Switch label="Hover sound" on={settings.soundHover} flip={() => patch({ soundHover: !settings.soundHover })} />
          </Row>
        </Card>
      );
      break;
    case "focus":
      content = (
        <Card>
          <Row label="Focus" hint="Silences notifications and shows a moon in the Dynamic Island.">
            <Switch label="Focus" on={settings.novaFocus} flip={() => patch({ novaFocus: !settings.novaFocus })} />
          </Row>
          <Row label="Focus timer" hint="Start one from the Control Center or type “focus 25” in Search." />
        </Card>
      );
      break;
    case "time":
      content = (
        <Card>
          <Row label="24-hour clock">
            <Switch label="24-hour clock" on={settings.clock24} flip={() => patch({ clock24: !settings.clock24 })} />
          </Row>
          <Row label="Time zone" hint="Automatic uses this computer's time zone.">
            <select aria-label="Time zone" value={settings.timeZone} onChange={(event) => patch({ timeZone: event.target.value })} className="ns-select max-w-[13rem]">
              <option value="">Automatic</option>
              {zones.map((zone) => <option key={zone} value={zone}>{zone.replace(/_/g, " ")}</option>)}
            </select>
          </Row>
        </Card>
      );
      break;
    case "privacy":
      content = (
        <>
          <Card title="Lock">
            <Row label="Lock automatically" hint="Locks NOVA OS when you leave it alone.">
              <select aria-label="Lock automatically" value={settings.autoLock} onChange={(event) => patch({ autoLock: Number(event.target.value) })} className="ns-select">
                {[[0, "Never"], [1, "After 1 minute"], [5, "After 5 minutes"], [15, "After 15 minutes"], [30, "After 30 minutes"]].map(([value, label]) => <option key={value} value={value}>{label}</option>)}
              </select>
            </Row>
          </Card>
          <Card title="Comet browser">
            <Row label="Reddit" hint="Reddit blocks proxy servers, so Comet shows Reddit with its own reader that loads straight from your connection." >
              <Globe2 className="size-4 text-white/50" />
            </Row>
            <Row label="Bookmarks" hint="Remove every bookmark saved in Comet.">
              <button type="button" onClick={() => { try { localStorage.removeItem("pos-bookmarks"); } catch { /* storage unavailable */ } }} className="ns-btn">Clear</button>
            </Row>
          </Card>
          <NetworkCard wisp={props.wisp} />
        </>
      );
      break;
    case "performance":
      content = (
        <Card>
          <Row label="Lite mode" hint="Turns off heavy effects so NOVA OS runs well on slower computers.">
            <Switch label="Lite mode" on={settings.lite} flip={() => patch({ lite: !settings.lite })} />
          </Row>
          <Row label="Reduce motion" hint="Fewer animations and no moving wallpaper.">
            <Switch label="Reduce motion" on={settings.reduceMotion} flip={() => patch({ reduceMotion: !settings.reduceMotion })} />
          </Row>
        </Card>
      );
      break;
    case "account":
      content = (
        <>
          <div className="ns-in ns-card flex items-center gap-4 rounded-[22px] p-5">
            <span className="grid size-16 shrink-0 place-items-center rounded-full text-2xl font-bold text-black" style={{ background: `linear-gradient(140deg, ${theme.colors[0]}, ${theme.accent})` }}>{initial}</span>
            <div className="min-w-0">
              <p className="truncate text-lg font-semibold">{settings.userName || "Nova user"}</p>
              <p className="text-[12px] text-white/50">Local account on this browser</p>
            </div>
          </div>
          <Card>
            <Row label="Name" hint="Shown on the lock screen and in your greeting.">
              <input aria-label="Your name" value={settings.userName} maxLength={24} onChange={(event) => patch({ userName: event.target.value })} className="h-9 w-48 rounded-xl bg-black/30 px-3 text-[13px] outline-none ring-1 ring-white/10 focus:ring-[var(--primary)]" />
            </Row>
          </Card>
        </>
      );
      break;
    default:
      content = (
        <>
          <div className="ns-in ns-card flex flex-col items-center gap-2 rounded-[22px] px-6 py-8 text-center">
            <NovaMark className="size-14" />
            <p className="mt-1 text-xl font-bold tracking-tight">NOVA OS</p>
            <p className="text-[12px] text-white/50">Version {props.version} · runs in your browser</p>
          </div>
          <Card>
            <Row label="Switch to PRIVATE OS" hint="The classic desktop. Your open windows stay open.">
              <button type="button" onClick={props.switchToPrivate} className="ns-btn flex items-center gap-1.5"><RotateCw className="size-3.5" />Switch</button>
            </Row>
            <Row label="Run setup again" hint="Go through the welcome setup on the next start.">
              <button type="button" onClick={props.restartSetup} className="ns-btn">Run setup</button>
            </Row>
            <Row label="Erase everything" hint="Deletes all settings, files and bookmarks in this browser.">
              <button type="button" onClick={() => { if (!window.confirm("Erase all data in this browser?")) return; try { localStorage.clear(); sessionStorage.clear(); } catch { /* storage unavailable */ } window.setTimeout(() => window.location.reload(), 200); }} className="ns-btn flex items-center gap-1.5 !text-rose-300"><Trash2 className="size-3.5" />Erase</button>
            </Row>
          </Card>
          <Card title="What's new">
            {props.changelog.slice(0, 3).map((entry) => (
              <div key={entry.v} className="px-4 py-3">
                <p className="flex items-baseline justify-between text-[12px] font-bold" style={{ color: theme.accent }}><span>Version {entry.v}</span><span className="font-medium text-white/40">{entry.date}</span></p>
                <ul className="mt-1.5 space-y-1 text-[12px] text-white/75">
                  {entry.items.map((item) => <li key={item} className="flex gap-2"><Sparkles className="mt-0.5 size-3 shrink-0 text-white/35" />{item}</li>)}
                </ul>
              </div>
            ))}
          </Card>
        </>
      );
  }

  return (
    <div className="ns-root flex min-h-0 flex-1 text-white">
      <aside className="ns-side flex w-60 shrink-0 flex-col gap-3 overflow-y-auto p-3">
        <button type="button" onClick={() => setPage("account")} className={`flex items-center gap-3 rounded-2xl p-2.5 text-left transition-colors ${page === "account" ? "bg-white/[.1]" : "hover:bg-white/[.06]"}`}>
          <span className="grid size-10 shrink-0 place-items-center rounded-full text-base font-bold text-black" style={{ background: `linear-gradient(140deg, ${theme.colors[0]}, ${theme.accent})` }}>{initial}</span>
          <span className="min-w-0">
            <span className="block truncate text-[13px] font-semibold">{settings.userName || "Nova user"}</span>
            <span className="block text-[11px] text-white/50">NOVA OS {props.version}</span>
          </span>
        </button>
        <label className="flex h-8 items-center gap-2 rounded-xl bg-black/25 px-2.5 ring-1 ring-white/[.06] focus-within:ring-[var(--primary)]">
          <Search className="size-3.5 shrink-0 text-white/45" />
          <input aria-label="Search settings" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search" className="min-w-0 flex-1 bg-transparent text-[12.5px] outline-none placeholder:text-white/40" />
        </label>
        <nav aria-label="Settings sections" className="flex flex-col gap-0.5">
          {shown.map((item) => (
            <button key={item.id} type="button" onClick={() => setPage(item.id)} aria-current={page === item.id ? "page" : undefined} className={`flex items-center gap-2.5 rounded-xl px-2 py-1.5 text-left text-[13px] transition-colors ${page === item.id ? "bg-[var(--primary)]/20 text-white" : "text-white/80 hover:bg-white/[.06]"}`}>
              <PageIcon page={item} size={24} />
              {item.label}
            </button>
          ))}
          {shown.length === 0 && <p className="px-2 py-3 text-[12px] text-white/45">No settings match.</p>}
        </nav>
        <div className="mt-auto flex items-center gap-2 rounded-xl px-2 py-2 text-[11px] text-white/40"><Lock className="size-3" />Saved on this browser only</div>
      </aside>
      <main key={page} className="min-w-0 flex-1 overflow-y-auto px-6 pb-8 pt-6">
        <header className="ns-in mb-5 flex items-center gap-3">
          <PageIcon page={current} size={40} />
          <h2 className="text-[22px] font-bold tracking-tight">{current.label}</h2>
          {page === "display" && settings.novaNight && <Moon className="ml-auto size-4 text-amber-300" />}
        </header>
        <div className="ns-stack max-w-3xl space-y-5">{content}</div>
      </main>
    </div>
  );
}
