import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";

// The NOVA OS 4.0 dock. One component draws both the real dock and the preview in Settings,
// so the preview always looks and behaves exactly like the dock on the desktop.
// It magnifies under the pointer, slides a glowing marker to the app in front, shows a preview
// card when you rest on an app, and pinned apps can be dragged into a new order.

export type DockAction = { label: string; run: () => void; danger?: boolean };
export type DockItem = {
  key: string;
  label: string;
  icon: ReactNode;
  tool?: boolean;
  pinned?: boolean;
  running?: boolean;
  focused?: boolean;
  minimized?: boolean;
  status?: string;
  onClick: () => void;
  onContext?: (event: React.MouseEvent) => void;
  actions?: DockAction[];
};
export type DockLook = { size: number; magnify: boolean; style: "float" | "bar" | "bare"; pos: "bottom" | "left"; labels: boolean };

type Props = DockLook & {
  items: DockItem[];
  /** Indexes before which a thin divider is drawn. */
  breaks?: number[];
  bounce?: string | null;
  hidden?: boolean;
  preview?: boolean;
  selected?: string | null;
  reorder?: (from: string, to: string) => void;
  onPointerEnter?: () => void;
  onPointerLeave?: () => void;
};

type Card = { key: string; x: number; y: number };

export function NovaDock({ items, breaks = [], bounce = null, hidden = false, preview = false, selected = null, reorder, size, magnify, style, pos, labels, onPointerEnter, onPointerLeave }: Props) {
  const nav = useRef<HTMLElement>(null);
  const cells = useRef<Record<string, HTMLButtonElement | null>>({});
  const [hover, setHover] = useState<number | null>(null);
  const [mark, setMark] = useState<{ at: number; len: number } | null>(null);
  const [card, setCard] = useState<Card | null>(null);
  const [drag, setDrag] = useState<{ from: string; over: string | null } | null>(null);
  const [room, setRoom] = useState(1600);
  const cardTimer = useRef(0);
  const side = pos === "left";

  // Icons shrink when there are too many to fit along the screen edge.
  useEffect(() => {
    if (preview) return;
    const measure = () => setRoom(side ? window.innerHeight - 40 : window.innerWidth - 40);
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [preview, side]);
  const gap = Math.round(size * 0.16);
  const fit = preview ? size : Math.max(26, Math.min(size, Math.floor((room - 24) / Math.max(1, items.length)) - gap));
  const step = fit + gap;

  const scaleFor = (index: number) => {
    if (!magnify || hover === null) return 1;
    const d = hover - index;
    return 1 + 0.55 * Math.exp(-(d * d) / 2.2);
  };

  // The marker under the app in front (or the app picked in Settings) glides to its new place.
  const marked = preview ? selected : items.find((item) => item.focused)?.key ?? null;
  useLayoutEffect(() => {
    let frame = 0;
    const place = () => {
      const cell = marked ? cells.current[marked] : null;
      const box = nav.current;
      if (!cell || !box) return setMark(null);
      setMark(side ? { at: cell.offsetTop + cell.offsetHeight / 2, len: cell.offsetHeight } : { at: cell.offsetLeft + cell.offsetWidth / 2, len: cell.offsetWidth });
    };
    place();
    // Magnification animates sizes, so the marker follows for a moment.
    const until = performance.now() + 260;
    const follow = () => {
      place();
      if (performance.now() < until) frame = requestAnimationFrame(follow);
    };
    frame = requestAnimationFrame(follow);
    return () => cancelAnimationFrame(frame);
  }, [marked, hover, items.length, fit, side, labels]);

  const showCard = (item: DockItem, el: HTMLElement) => {
    if (preview || item.tool) return;
    window.clearTimeout(cardTimer.current);
    cardTimer.current = window.setTimeout(() => {
      const box = el.getBoundingClientRect();
      setCard(side ? { key: item.key, x: box.right + 14, y: box.top + box.height / 2 } : { key: item.key, x: box.left + box.width / 2, y: box.top - 14 });
    }, card ? 60 : 420);
  };
  const hideCard = (soon = true) => {
    window.clearTimeout(cardTimer.current);
    if (!soon) return setCard(null);
    cardTimer.current = window.setTimeout(() => setCard(null), 180);
  };
  useEffect(() => () => window.clearTimeout(cardTimer.current), []);
  useEffect(() => {
    if (hidden) setCard(null);
  }, [hidden]);

  const cardItem = card ? items.find((item) => item.key === card.key) : undefined;

  return (
    <>
      <nav
        ref={nav}
        aria-label={preview ? "Dock preview" : "Nova dock"}
        data-style={style}
        data-pos={pos}
        data-hidden={hidden ? "" : undefined}
        data-preview={preview ? "" : undefined}
        data-labels={labels ? "" : undefined}
        onPointerEnter={onPointerEnter}
        onPointerMove={(event) => {
          if (!magnify) return;
          const box = event.currentTarget.getBoundingClientRect();
          const along = side ? event.clientY - box.top : event.clientX - box.left;
          setHover((along - 10 - fit / 2) / step);
        }}
        onPointerLeave={() => {
          setHover(null);
          hideCard();
          onPointerLeave?.();
        }}
        className="nova-dock4"
        style={{ "--cell": `${fit}px`, "--gap": `${gap}px` } as CSSProperties}
      >
        {items.map((item, index) => {
          const s = scaleFor(index);
          const dropping = drag && drag.over === item.key && drag.from !== item.key;
          return (
            <div key={item.key} className="contents">
              {breaks.includes(index) && <span aria-hidden className="nova-dock4-break" />}
              <button
                ref={(el) => { cells.current[item.key] = el; }}
                type="button"
                aria-label={item.label}
                aria-pressed={preview ? selected === item.key : undefined}
                draggable={Boolean(reorder && item.pinned)}
                onClick={() => {
                  hideCard(false);
                  item.onClick();
                }}
                onContextMenu={item.onContext}
                onPointerEnter={(event) => showCard(item, event.currentTarget)}
                onDragStart={(event) => {
                  hideCard(false);
                  event.dataTransfer.effectAllowed = "move";
                  event.dataTransfer.setData("text/plain", item.key);
                  setDrag({ from: item.key, over: null });
                }}
                onDragOver={(event) => {
                  if (!drag || !item.pinned) return;
                  event.preventDefault();
                  if (drag.over !== item.key) setDrag({ ...drag, over: item.key });
                }}
                onDrop={(event) => {
                  event.preventDefault();
                  if (drag && item.pinned && drag.from !== item.key) reorder?.(drag.from, item.key);
                  setDrag(null);
                }}
                onDragEnd={() => setDrag(null)}
                className={`nova-dock4-cell ${item.tool ? "is-tool" : ""} ${bounce === item.key ? "is-bouncing" : ""} ${drag?.from === item.key ? "is-dragging" : ""} ${dropping ? "is-drop" : ""} ${preview && selected === item.key ? "is-picked" : ""}`}
                style={{ width: fit * s, height: fit * s }}
              >
                <span className="nova-dock4-icon">{item.icon}</span>
                {labels && <span className="nova-dock4-label">{item.label}</span>}
                {item.running && <span className={`nova-dock4-run ${item.minimized ? "is-min" : ""}`} />}
                {!preview && !cardItem && <span className="nova-dock4-tip">{item.label}</span>}
              </button>
            </div>
          );
        })}
        {mark && <span aria-hidden className="nova-dock4-mark" style={side ? { top: mark.at, height: Math.max(10, mark.len * 0.42) } : { left: mark.at, width: Math.max(10, mark.len * 0.42) }} />}
      </nav>

      {cardItem && card && (
        <div
          data-nova-ui
          role="dialog"
          aria-label={`${cardItem.label} preview`}
          onPointerEnter={() => window.clearTimeout(cardTimer.current)}
          onPointerLeave={() => hideCard()}
          className={`nova-dock4-card nova-glass ${side ? "is-side" : ""}`}
          style={{ left: card.x, top: card.y }}
        >
          <div className="flex items-center gap-3">
            <span className="size-10 shrink-0 [&>svg]:!size-full">{cardItem.icon}</span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[14px] font-semibold">{cardItem.label}</span>
              <span className="flex items-center gap-1.5 text-[11.5px] text-white/55">
                <span className={`nova-live-dot ${cardItem.running ? (cardItem.minimized ? "is-min" : "") : "is-off"}`} />
                {cardItem.status ?? (cardItem.running ? (cardItem.minimized ? "Minimized" : "Open") : "Not open")}
              </span>
            </span>
          </div>
          {cardItem.actions && cardItem.actions.length > 0 && (
            <div className="mt-3 grid grid-cols-2 gap-1.5">
              {cardItem.actions.map((action) => (
                <button key={action.label} type="button" onClick={() => { setCard(null); action.run(); }} className={`nova-dock4-act ${action.danger ? "is-danger" : ""}`}>{action.label}</button>
              ))}
            </div>
          )}
        </div>
      )}
    </>
  );
}
