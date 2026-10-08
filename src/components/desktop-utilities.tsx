import { useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, ImagePlus, Pause, Play, RotateCcw, Upload, ZoomIn, ZoomOut } from "lucide-react";
import { OsButton } from "@/components/os-button";

export function CalendarUtility() {
  const [month, setMonth] = useState(() => new Date());
  const [selected, setSelected] = useState(() => new Date().getDate());
  const [events, setEvents] = useState<Record<string, string[]>>({});
  const [draft, setDraft] = useState("");
  const year = month.getFullYear();
  const index = month.getMonth();
  const offset = (new Date(year, index, 1).getDay() + 6) % 7;
  const count = new Date(year, index + 1, 0).getDate();
  const key = `${year}-${index}-${selected}`;
  const today = new Date();
  function shift(amount: number) { setMonth(new Date(year, index + amount, 1)); setSelected(1); }
  return <div className="utility-layout">
    <div className="min-w-0 flex-1 p-5 md:p-8">
      <div className="mb-6 flex items-center justify-between gap-2"><h2 className="text-xl font-semibold">{month.toLocaleDateString(undefined, { month: "long", year: "numeric" })}</h2><div className="flex gap-1"><OsButton label="Previous month" onClick={() => shift(-1)} className="utility-icon"><ArrowLeft className="size-4" /></OsButton><OsButton label="Next month" onClick={() => shift(1)} className="utility-icon"><ArrowRight className="size-4" /></OsButton></div></div>
      <div className="grid grid-cols-7 gap-1 text-center">{["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(d => <span key={d} className="py-2 text-xs text-muted-foreground">{d}</span>)}{Array.from({ length: offset }, (_, i) => <span key={`blank-${i}`} />)}{Array.from({ length: count }, (_, i) => i + 1).map(day => <OsButton key={day} label={`Select day ${day}`} onClick={() => setSelected(day)} className={`relative aspect-square rounded-md text-sm ${selected === day ? "bg-primary text-primary-foreground" : "hover:bg-secondary"}`}><span className={day === today.getDate() && index === today.getMonth() && year === today.getFullYear() ? "font-bold underline underline-offset-4" : ""}>{day}</span>{events[`${year}-${index}-${day}`]?.length ? <span className="absolute bottom-1 size-1 rounded-full bg-accent" /> : null}</OsButton>)}</div>
    </div>
    <aside className="utility-sidebar"><p className="mb-5 text-lg font-semibold">{new Date(year, index, selected).toLocaleDateString(undefined, { weekday: "long", month: "short", day: "numeric" })}</p><form onSubmit={e => { e.preventDefault(); if (!draft.trim()) return; setEvents(current => ({ ...current, [key]: [...(current[key] ?? []), draft.trim()] })); setDraft(""); }} className="flex flex-col gap-2"><input aria-label="Event title" placeholder="Add an event" value={draft} onChange={e => setDraft(e.target.value)} className="utility-input" /><OsButton type="submit" className="rounded-md bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground">Add event</OsButton></form><div className="mt-5 space-y-3">{(events[key] ?? []).map((event, i) => <div key={`${event}-${i}`} className="flex items-center justify-between border-l-2 border-primary pl-3 text-sm"><span className="break-words">{event}</span><OsButton label={`Delete ${event}`} onClick={() => setEvents(current => ({ ...current, [key]: (current[key] ?? []).filter((_, n) => n !== i) }))} className="utility-icon">×</OsButton></div>)}{!events[key]?.length && <p className="text-xs text-muted-foreground">No events</p>}</div></aside>
  </div>;
}

export function ClockUtility() {
  const [tab, setTab] = useState("Clock");
  const [now, setNow] = useState(() => new Date());
  const [running, setRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const start = useRef(0);
  useEffect(() => { const timer = window.setInterval(() => { setNow(new Date()); if (running) setElapsed(Date.now() - start.current); }, 100); return () => clearInterval(timer); }, [running]);
  const duration = `${Math.floor(elapsed / 60000).toString().padStart(2, "0")}:${Math.floor(elapsed / 1000 % 60).toString().padStart(2, "0")}.${Math.floor(elapsed % 1000 / 10).toString().padStart(2, "0")}`;
  return <div className="flex min-h-0 flex-1 flex-col"><div className="flex gap-2 border-b border-border p-3">{["Clock", "Stopwatch"].map(item => <OsButton key={item} onClick={() => setTab(item)} className={`rounded-md px-4 py-2 text-sm ${item === tab ? "bg-secondary text-foreground" : "text-muted-foreground"}`}>{item}</OsButton>)}</div><div className="flex flex-1 flex-col items-center justify-center gap-5 p-5"><p className="text-xs uppercase text-muted-foreground">{tab === "Clock" ? Intl.DateTimeFormat().resolvedOptions().timeZone.replaceAll("_", " ") : "Stopwatch"}</p><p aria-live="off" className="text-4xl font-medium tabular-nums md:text-6xl">{tab === "Clock" ? now.toLocaleTimeString([], { hour12: false }) : duration}</p>{tab === "Clock" ? <p className="text-sm text-muted-foreground">{now.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })}</p> : <div className="flex gap-3"><OsButton label={running ? "Pause stopwatch" : "Start stopwatch"} onClick={() => { if (!running) start.current = Date.now() - elapsed; setRunning(!running); }} className="grid size-12 place-items-center rounded-full bg-primary text-primary-foreground">{running ? <Pause className="size-5" /> : <Play className="size-5" />}</OsButton><OsButton label="Reset stopwatch" onClick={() => { setRunning(false); setElapsed(0); }} className="utility-icon size-12"><RotateCcw className="size-5" /></OsButton></div>}</div></div>;
}

export function PhotosUtility({ initialPhotos }: { initialPhotos: { label: string; src: string }[] }) {
  const [photos, setPhotos] = useState(initialPhotos);
  const [selected, setSelected] = useState(0);
  const [zoom, setZoom] = useState(1);
  const input = useRef<HTMLInputElement>(null);
  const urls = useRef<string[]>([]);
  useEffect(() => () => urls.current.forEach(url => URL.revokeObjectURL(url)), []);
  const photo = photos[selected];
  return <div className="flex min-h-0 flex-1 flex-col"><div className="flex shrink-0 items-center gap-2 border-b border-border px-3 py-2"><span className="min-w-0 flex-1 truncate text-xs text-muted-foreground">{photo?.label ?? "Photos"}</span><OsButton label="Zoom out" onClick={() => setZoom(z => Math.max(0.5, z - 0.25))} className="utility-icon"><ZoomOut className="size-4" /></OsButton><span className="w-10 text-center text-xs">{Math.round(zoom * 100)}%</span><OsButton label="Zoom in" onClick={() => setZoom(z => Math.min(3, z + 0.25))} className="utility-icon"><ZoomIn className="size-4" /></OsButton><OsButton label="Import photos" onClick={() => input.current?.click()} className="utility-icon"><Upload className="size-4" /></OsButton><input ref={input} type="file" accept="image/*" multiple hidden onChange={e => { const added = Array.from(e.target.files ?? []).filter(f => f.type.startsWith("image/")).map(f => { const src = URL.createObjectURL(f); urls.current.push(src); return { label: f.name, src }; }); setPhotos(current => [...current, ...added]); if (added.length) { setSelected(photos.length); setZoom(1); } e.target.value = ""; }} /></div><div className="relative flex min-h-0 flex-1 items-center justify-center overflow-auto p-5">{photo ? <img src={photo.src} alt={photo.label} className="max-h-full max-w-full object-contain" style={{ transform: `scale(${zoom})` }} /> : <ImagePlus className="size-12 text-muted-foreground" />}</div><div className="flex h-24 shrink-0 gap-2 overflow-x-auto border-t border-border p-3">{photos.map((p, i) => <OsButton key={`${p.src}-${i}`} label={`View ${p.label}`} onClick={() => { setSelected(i); setZoom(1); }} className={`w-24 shrink-0 overflow-hidden rounded-md border-2 ${selected === i ? "border-primary" : "border-transparent"}`}><img src={p.src} alt="" className="size-full object-cover" /></OsButton>)}</div></div>;
}