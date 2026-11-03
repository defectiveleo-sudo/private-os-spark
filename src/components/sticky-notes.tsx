import { useEffect, useRef, useState, type ComponentType } from "react";

export type StickyColor = "yellow" | "blue" | "pink" | "green";
export type StickyNote = { id: string; color: StickyColor; text: string; x: number; y: number };

export const STICKY_COLORS: StickyColor[] = ["yellow", "blue", "pink", "green"];
export const DEFAULT_STICKIES: StickyNote[] = [{ id: "note-1", color: "yellow", text: "", x: 112, y: 96 }];

export function newSticky(list: StickyNote[], color?: StickyColor): StickyNote {
  const last = list[list.length - 1];
  const nextColor = color ?? STICKY_COLORS[list.length % STICKY_COLORS.length] ?? "yellow";
  return { id: `note-${Date.now().toString(36)}`, color: nextColor, text: "", x: last ? last.x : 112, y: last ? last.y + 128 : 96 };
}

type Props = {
  notes: StickyNote[];
  onChange: (notes: StickyNote[]) => void;
};

// Quick Note cards like the video: drag them by the header, or right-click for Move Widget and Delete Widget.
export function StickyNotes({ notes, onChange }: Props) {
  const [menu, setMenu] = useState<{ id: string; x: number; y: number } | null>(null);
  const [moving, setMoving] = useState<string | null>(null);
  const drag = useRef<{ id: string; sx: number; sy: number; ox: number; oy: number } | null>(null);

  useEffect(() => {
    if (!menu) return;
    const close = () => setMenu(null);
    window.addEventListener("pointerdown", close);
    window.addEventListener("keydown", close);
    return () => {
      window.removeEventListener("pointerdown", close);
      window.removeEventListener("keydown", close);
    };
  }, [menu]);

  // "Move Widget": the note follows the pointer until the next click, like the video.
  useEffect(() => {
    if (!moving) return;
    const move = (event: PointerEvent) => update(moving, clamp(event.clientX - 90, event.clientY - 14));
    const drop = (event: PointerEvent) => { event.preventDefault(); event.stopPropagation(); setMoving(null); };
    const cancel = (event: KeyboardEvent) => { if (event.key === "Escape") setMoving(null); };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerdown", drop, true);
    window.addEventListener("keydown", cancel);
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerdown", drop, true);
      window.removeEventListener("keydown", cancel);
    };
  });

  const update = (id: string, patch: Partial<StickyNote>) => onChange(notes.map((note) => (note.id === id ? { ...note, ...patch } : note)));
  const clamp = (x: number, y: number) => ({ x: Math.max(4, Math.min(window.innerWidth - 190, x)), y: Math.max(40, Math.min(window.innerHeight - 160, y)) });

  return (
    <>
      {notes.map((note) => (
        <div
          key={note.id}
          style={{ left: note.x, top: note.y }}
          className={`sticky-frame ${moving === note.id ? "is-moving" : ""}`}
          onContextMenu={(event) => {
            event.preventDefault();
            event.stopPropagation();
            setMenu({ id: note.id, x: Math.min(event.clientX, window.innerWidth - 190), y: Math.min(event.clientY, window.innerHeight - 200) });
          }}
        >
          <div className={`sticky-note is-${note.color}`}>
          <div
            className="sticky-note-head"
            onPointerDown={(event) => {
              if (event.button !== 0) return;
              drag.current = { id: note.id, sx: event.clientX, sy: event.clientY, ox: note.x, oy: note.y };
              event.currentTarget.setPointerCapture(event.pointerId);
            }}
            onPointerMove={(event) => {
              const d = drag.current;
              if (!d || d.id !== note.id) return;
              update(note.id, clamp(d.ox + event.clientX - d.sx, d.oy + event.clientY - d.sy));
            }}
            onPointerUp={() => { drag.current = null; }}
          >
            <span>Quick note</span>
            <span className="sticky-note-hint">{note.text ? "Auto-saved" : "Right-click"}</span>
          </div>
          <textarea
            value={note.text}
            placeholder="Write a note…"
            aria-label="Quick note"
            onChange={(event) => update(note.id, { text: event.target.value })}
            className="sticky-note-text"
          />
          </div>
        </div>
      ))}
      {menu && (
        <div role="menu" aria-label="Note options" style={{ left: menu.x, top: menu.y }} className="sticky-menu" onPointerDown={(event) => event.stopPropagation()}>
          <button type="button" role="menuitem" onClick={() => { setMoving(menu.id); setMenu(null); }}><MoveIcon />Move Widget</button>
          <button type="button" role="menuitem" className="is-danger" onClick={() => { onChange(notes.filter((note) => note.id !== menu.id)); setMenu(null); }}><TrashIcon />Delete Widget</button>
        </div>
      )}
    </>
  );
}

function MoveIcon() {
  return <svg viewBox="0 0 24 24" className="size-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M12 2v20M2 12h20M12 2l-3 3M12 2l3 3M12 22l-3-3M12 22l3-3M2 12l3-3M2 12l3 3M22 12l-3-3M22 12l-3 3" /></svg>;
}
function TrashIcon() {
  return <svg viewBox="0 0 24 24" className="size-3.5" fill="currentColor" aria-hidden><path d="M9 3h6l1 2h4v2H4V5h4l1-2Zm-3 6h12l-1 12H7L6 9Z" /></svg>;
}

// The clock card from the video: big time, short day and date, and a ring that fills with the seconds.
export function ClockCard({ clock24, locale }: { clock24: boolean; locale: string | undefined }) {
  const [time, setTime] = useState(() => new Date());
  useEffect(() => {
    const timer = window.setInterval(() => setTime(new Date()), 1000);
    return () => window.clearInterval(timer);
  }, []);
  const hm = time.toLocaleTimeString(locale, { hour: "2-digit", minute: "2-digit", hour12: !clock24 });
  const day = time.toLocaleDateString(locale, { weekday: "short" }).replace(".", "");
  const date = time.toLocaleDateString(locale, { month: "short", day: "numeric" }).replace(".", "");
  const progress = time.getSeconds() / 60;
  const r = 11;
  const c = 2 * Math.PI * r;
  return (
    <div className="desktop-clock">
      <span className="min-w-0">
        <span className="block text-[22px] font-bold leading-none tabular-nums text-white">{hm}</span>
        <span className="mt-1 block text-[10px] font-semibold uppercase tracking-[.14em] text-white/55">{day} · {date}</span>
      </span>
      <svg viewBox="0 0 28 28" className="size-7 shrink-0 -rotate-90" aria-hidden>
        <circle cx="14" cy="14" r={r} fill="none" stroke="rgb(255 255 255 / .14)" strokeWidth="3" />
        <circle cx="14" cy="14" r={r} fill="none" stroke="rgb(255 255 255 / .85)" strokeWidth="3" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * (1 - progress)} />
      </svg>
    </div>
  );
}

type ShortcutApp = { id: string; label: string; Icon: ComponentType<{ className?: string }> };

// Top corners of the desktop, like the video: a menu button and the time on the left, battery and your avatar on the right.
export function DesktopTopBar({ clock24, locale, userName, onMenu, onAvatar }: { clock24: boolean; locale: string | undefined; userName: string; onMenu: () => void; onAvatar: () => void }) {
  const now = useNow(10000);
  const [battery, setBattery] = useState<number | null>(null);
  useEffect(() => {
    const nav = navigator as Navigator & { getBattery?: () => Promise<{ level: number; addEventListener: (type: string, fn: () => void) => void }> };
    if (!nav.getBattery) return;
    let alive = true;
    nav.getBattery().then((b) => {
      const read = () => { if (alive) setBattery(Math.round(b.level * 100)); };
      read();
      b.addEventListener("levelchange", read);
    }).catch(() => undefined);
    return () => { alive = false; };
  }, []);
  const time = now.toLocaleTimeString(locale, { hour: "2-digit", minute: "2-digit", hour12: !clock24 });
  return (
    <>
      <div className="desktop-topbar is-left">
        <button type="button" aria-label="Open minimal view" title="Minimal view" onClick={onMenu} className="desktop-topbar-btn">
          <svg viewBox="0 0 24 24" className="size-3.5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden><path d="M5 7h14M5 12h14M5 17h14" /></svg>
        </button>
        <span className="tabular-nums">{time}</span>
      </div>
      <div className="desktop-topbar is-right">
        {battery !== null && (
          <span className="desktop-battery" aria-label={`Battery ${battery}%`}>
            <svg viewBox="0 0 24 14" className="h-2.5 w-4" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden><rect x="1" y="1" width="19" height="12" rx="3" /><rect x="3" y="3" width={Math.max(1, 15 * battery / 100)} height="8" rx="1.5" fill="currentColor" stroke="none" /><path d="M22 5v4" strokeLinecap="round" /></svg>
            {battery}%
          </span>
        )}
        <button type="button" aria-label="Open settings" title={userName || "Settings"} onClick={onAvatar} className="desktop-avatar">{(userName || "P").slice(0, 1).toUpperCase()}</button>
      </div>
    </>
  );
}

// The black minimal view from the video: the day, the date, the time, four app shortcuts and a clock widget.
export function MinimalView({ clock24, locale, apps, dayLabel, openApp, onClose }: { clock24: boolean; locale: string | undefined; apps: ShortcutApp[]; dayLabel: string; openApp: (id: string) => void; onClose: () => void }) {
  const now = useNow(1000);
  const [menu, setMenu] = useState<{ x: number; y: number } | null>(null);
  const [hidden, setHidden] = useState(false);
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);
  const [moving, setMoving] = useState(false);
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => { if (event.key === "Escape") { if (moving) setMoving(false); else onClose(); } };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [moving, onClose]);
  const day = dayLabel.slice(0, 3);
  const date = `${now.getDate()} ${now.toLocaleDateString(locale, { month: "long" })}, ${now.getFullYear()}.`;
  const hm = now.toLocaleTimeString(locale, { hour: "2-digit", minute: "2-digit", hour12: !clock24 });
  const short = `${now.toLocaleDateString(locale, { weekday: "short" })} · ${now.toLocaleDateString(locale, { month: "short", day: "numeric" })}`.replace(/\./g, "");
  return (
    <div
      className="minimal-view"
      role="dialog"
      aria-label="Minimal view"
      onPointerMove={(event) => { if (moving) setPos({ x: event.clientX - 80, y: event.clientY - 20 }); }}
      onPointerDown={(event) => {
        if (moving) { setMoving(false); return; }
        if (event.target === event.currentTarget) { if (menu) setMenu(null); else onClose(); }
      }}
    >
      <div className="minimal-block" onPointerDown={(event) => { if (event.target === event.currentTarget) setMenu(null); }}>
        <p className="minimal-day">{day}</p>
        <p className="minimal-date">{date}</p>
        <p className="minimal-time">{hm}</p>
        <div className="minimal-apps">
          {apps.map(({ id, label, Icon }) => (
            <button key={id} type="button" aria-label={`Open ${label}`} title={label} onClick={() => { onClose(); openApp(id); }} className="minimal-app"><Icon className="size-5" /></button>
          ))}
        </div>
        {!hidden && (
          <div className="minimal-widget" style={pos ? { position: "fixed", left: pos.x, top: pos.y } : undefined} onContextMenu={(event) => { event.preventDefault(); setMenu({ x: event.clientX, y: event.clientY }); }}>
            <span className="block text-[17px] font-bold leading-none tabular-nums text-[#5be38a]">{hm}</span>
            <span className="mt-1 block text-[9px] font-semibold uppercase tracking-[.14em] text-white/45">{short}</span>
          </div>
        )}
        <p className="minimal-hint">Click anywhere to go back</p>
      </div>
      {menu && (
        <div role="menu" aria-label="Widget options" style={{ left: menu.x, top: menu.y }} className="sticky-menu" onPointerDown={(event) => event.stopPropagation()}>
          <button type="button" role="menuitem" onClick={() => { setMoving(true); setMenu(null); }}><MoveIcon />Move Widget</button>
          <button type="button" role="menuitem" className="is-danger" onClick={() => { setHidden(true); setMenu(null); }}><TrashIcon />Delete Widget</button>
        </div>
      )}
    </div>
  );
}

function useNow(every: number) {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), every);
    return () => window.clearInterval(timer);
  }, [every]);
  return now;
}
