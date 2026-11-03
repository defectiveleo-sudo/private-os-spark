import { useEffect, useRef, useState } from "react";

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

// Quick Note sticky cards like the video: drag them by the header, right-click for Edit, colour, Add and Remove.
export function StickyNotes({ notes, onChange }: Props) {
  const [menu, setMenu] = useState<{ id: string; x: number; y: number } | null>(null);
  const [editing, setEditing] = useState<string | null>(null);
  const drag = useRef<{ id: string; sx: number; sy: number; ox: number; oy: number } | null>(null);
  const areas = useRef<Record<string, HTMLTextAreaElement | null>>({});

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

  useEffect(() => {
    if (editing) areas.current[editing]?.focus();
  }, [editing]);

  const update = (id: string, patch: Partial<StickyNote>) => onChange(notes.map((note) => (note.id === id ? { ...note, ...patch } : note)));
  const clamp = (x: number, y: number) => ({ x: Math.max(4, Math.min(window.innerWidth - 190, x)), y: Math.max(40, Math.min(window.innerHeight - 160, y)) });

  return (
    <>
      {notes.map((note) => (
        <div
          key={note.id}
          style={{ left: note.x, top: note.y }}
          className={`sticky-note is-${note.color}`}
          onContextMenu={(event) => {
            event.preventDefault();
            event.stopPropagation();
            setMenu({ id: note.id, x: Math.min(event.clientX, window.innerWidth - 190), y: Math.min(event.clientY, window.innerHeight - 200) });
          }}
        >
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
            <span className="sticky-note-hint">{note.text ? "Saved" : "Right-click"}</span>
          </div>
          <textarea
            ref={(el) => { areas.current[note.id] = el; }}
            value={note.text}
            placeholder="Write a note…"
            aria-label="Quick note"
            onChange={(event) => update(note.id, { text: event.target.value })}
            onBlur={() => setEditing(null)}
            className="sticky-note-text"
          />
        </div>
      ))}
      {menu && (
        <div role="menu" aria-label="Note options" style={{ left: menu.x, top: menu.y }} className="sticky-menu" onPointerDown={(event) => event.stopPropagation()}>
          <button type="button" role="menuitem" onClick={() => { setEditing(menu.id); setMenu(null); }}>Edit note</button>
          <div className="sticky-menu-colors" role="group" aria-label="Note colour">
            {STICKY_COLORS.map((color) => (
              <button key={color} type="button" aria-label={`Make the note ${color}`} aria-pressed={notes.find((note) => note.id === menu.id)?.color === color} onClick={() => { update(menu.id, { color }); setMenu(null); }} className={`sticky-dot is-${color}`} />
            ))}
          </div>
          <button type="button" role="menuitem" onClick={() => { onChange([...notes, newSticky(notes)]); setMenu(null); }}>Add note</button>
          <button type="button" role="menuitem" className="is-danger" onClick={() => { onChange(notes.filter((note) => note.id !== menu.id)); setMenu(null); }}>Remove note</button>
        </div>
      )}
    </>
  );
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
