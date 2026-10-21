import { useEffect, useMemo, useState, type ComponentType } from "react";
import { Activity as ActivityGlyph, Clock3, MousePointerClick, Trash2, TrendingUp } from "lucide-react";
import { NovaTile } from "@/components/nova-shell";

// Activity: screen time for PRIVATE OS and NOVA OS. Counts the time each app spends
// in front and how often it is opened, per day, kept in this browser for two weeks.

type Icon = ComponentType<{ className?: string }>;
type Day = { apps: Record<string, number>; opens: Record<string, number> };
type Store = Record<string, Day>;
const KEY = "pos-activity";
const KEEP_DAYS = 14;

export const ActivityIcon: Icon = ({ className }) => (
  <NovaTile className={className} from="#22c55e" to="#0ea5e9">
    <ActivityGlyph />
  </NovaTile>
);

const dayKey = (date = new Date()) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

function read(): Store {
  try {
    const value = JSON.parse(localStorage.getItem(KEY) || "{}") as unknown;
    return value && typeof value === "object" ? (value as Store) : {};
  } catch {
    return {};
  }
}

function write(store: Store) {
  const keys = Object.keys(store).sort();
  for (const key of keys.slice(0, Math.max(0, keys.length - KEEP_DAYS))) delete store[key];
  try {
    localStorage.setItem(KEY, JSON.stringify(store));
  } catch {
    // storage full or unavailable
  }
}

function update(change: (day: Day) => void) {
  const store = read();
  const key = dayKey();
  const day = store[key] ?? { apps: {}, opens: {} };
  change(day);
  store[key] = day;
  write(store);
}

/** Adds seconds of front time to an app for today. */
export const trackTime = (id: string, seconds: number) => update((day) => { day.apps[id] = (day.apps[id] ?? 0) + seconds; });
/** Counts one launch of an app for today. */
export const trackOpen = (id: string) => update((day) => { day.opens[id] = (day.opens[id] ?? 0) + 1; });

function duration(seconds: number) {
  const minutes = Math.round(seconds / 60);
  if (minutes < 1) return seconds > 0 ? "< 1 min" : "0 min";
  if (minutes < 60) return `${minutes} min`;
  return `${Math.floor(minutes / 60)} h ${minutes % 60 ? `${minutes % 60} min` : ""}`.trim();
}

export function ActivityApp({ apps }: { apps: { id: string; label: string; icon: Icon }[] }) {
  const [store, setStore] = useState<Store>(() => read());
  useEffect(() => {
    const interval = window.setInterval(() => setStore(read()), 5000);
    return () => window.clearInterval(interval);
  }, []);
  const byId = (id: string) => apps.find((app) => app.id === id);
  const today = store[dayKey()] ?? { apps: {}, opens: {} };
  const total = Object.values(today.apps).reduce((sum, value) => sum + value, 0);
  const ranked = Object.entries(today.apps).sort((a, b) => b[1] - a[1]).slice(0, 8);
  const top = ranked[0]?.[1] ?? 1;
  const opens = Object.entries(today.opens).sort((a, b) => b[1] - a[1]).slice(0, 5);
  const week = useMemo(() => {
    const out: { key: string; label: string; seconds: number }[] = [];
    for (let back = 6; back >= 0; back -= 1) {
      const date = new Date();
      date.setDate(date.getDate() - back);
      const key = dayKey(date);
      out.push({ key, label: date.toLocaleDateString(undefined, { weekday: "short" }), seconds: Object.values(store[key]?.apps ?? {}).reduce((sum, value) => sum + value, 0) });
    }
    return out;
  }, [store]);
  const weekMax = Math.max(60, ...week.map((day) => day.seconds));
  const average = week.reduce((sum, day) => sum + day.seconds, 0) / 7;

  return (
    <div className="act-root min-h-0 flex-1 overflow-y-auto p-5 text-white">
      <div className="mx-auto max-w-3xl space-y-4">
        <section className="act-hero rounded-[26px] p-6">
          <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[.22em] text-white/60"><Clock3 className="size-3.5" />Screen time today</p>
          <p className="mt-2 text-[clamp(2.4rem,7vw,3.6rem)] font-extralight leading-none tracking-tight">{duration(total)}</p>
          <p className="mt-2 text-[12.5px] text-white/60">Daily average this week: {duration(average)} · {Object.values(today.opens).reduce((sum, value) => sum + value, 0)} app launches today</p>
        </section>

        <section className="act-card rounded-[22px] p-5">
          <h3 className="mb-4 flex items-center gap-2 text-[12px] font-semibold uppercase tracking-[.18em] text-white/55"><TrendingUp className="size-4" />Last 7 days</h3>
          <div className="flex h-36 items-end gap-2">
            {week.map((day, index) => (
              <div key={day.key} className="flex h-full flex-1 flex-col items-center justify-end gap-1.5">
                <span className="text-[10px] tabular-nums text-white/45">{day.seconds >= 60 ? Math.round(day.seconds / 60) : ""}</span>
                <span className={`act-bar w-full rounded-t-[8px] ${index === 6 ? "is-today" : ""}`} style={{ height: `${Math.max(3, (day.seconds / weekMax) * 100)}%` }} />
                <span className={`text-[11px] ${index === 6 ? "font-semibold text-white" : "text-white/50"}`}>{day.label}</span>
              </div>
            ))}
          </div>
        </section>

        <div className="grid gap-4 md:grid-cols-[1.4fr_1fr]">
          <section className="act-card rounded-[22px] p-5">
            <h3 className="mb-3 text-[12px] font-semibold uppercase tracking-[.18em] text-white/55">Most used today</h3>
            {ranked.length === 0 && <p className="py-6 text-center text-[12.5px] text-white/50">Use a few apps and they show up here.</p>}
            <ul className="space-y-2.5">
              {ranked.map(([id, seconds]) => {
                const app = byId(id);
                const AppIcon = app?.icon;
                return (
                  <li key={id} className="flex items-center gap-3">
                    <span className="size-8 shrink-0">{AppIcon && <AppIcon className="!size-full" />}</span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-baseline justify-between gap-2 text-[13px]"><span className="truncate font-medium">{app?.label ?? id}</span><span className="shrink-0 tabular-nums text-white/55">{duration(seconds)}</span></span>
                      <span className="mt-1 block h-1.5 overflow-hidden rounded-full bg-white/10"><span className="act-fill block h-full rounded-full" style={{ width: `${(seconds / top) * 100}%` }} /></span>
                    </span>
                  </li>
                );
              })}
            </ul>
          </section>
          <section className="act-card rounded-[22px] p-5">
            <h3 className="mb-3 flex items-center gap-2 text-[12px] font-semibold uppercase tracking-[.18em] text-white/55"><MousePointerClick className="size-4" />Opened most</h3>
            {opens.length === 0 && <p className="py-6 text-center text-[12.5px] text-white/50">Nothing opened yet today.</p>}
            <ul className="space-y-2">
              {opens.map(([id, count]) => {
                const app = byId(id);
                const AppIcon = app?.icon;
                return (
                  <li key={id} className="flex items-center gap-3 rounded-xl bg-white/[.05] px-3 py-2 text-[13px]">
                    <span className="size-6 shrink-0">{AppIcon && <AppIcon className="!size-full" />}</span>
                    <span className="min-w-0 flex-1 truncate">{app?.label ?? id}</span>
                    <span className="tabular-nums text-white/60">{count}×</span>
                  </li>
                );
              })}
            </ul>
          </section>
        </div>

        <div className="flex items-center justify-between gap-3 px-1 pb-2 text-[11.5px] text-white/45">
          <span>Kept only in this browser for {KEEP_DAYS} days.</span>
          <button type="button" onClick={() => { try { localStorage.removeItem(KEY); } catch { /* storage unavailable */ } setStore({}); }} className="flex items-center gap-1.5 rounded-full px-3 py-1.5 hover:bg-white/10 hover:text-white"><Trash2 className="size-3.5" />Clear history</button>
        </div>
      </div>
    </div>
  );
}
