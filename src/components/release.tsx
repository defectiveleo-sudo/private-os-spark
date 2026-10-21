import { useEffect, useState, type ComponentType, type CSSProperties } from "react";
import { MessagesSquare, ChevronLeft, ChevronRight, Command, Layers, Palette, Rocket, Sparkles, Zap } from "lucide-react";

// Release labels and the one-time "Welcome to 4.0" tour.

export const RELEASE_LABEL = "ALPHA RELEASE (STILL IN DEVELOPMENT)";
export const BUILD = "4000.21";
const SEEN_KEY = "pos-seen-release";

/** The ALPHA pill used on start and boot screens. */
export function AlphaBadge({ className = "" }: { className?: string }) {
  return (
    <p className={`alpha-badge mx-auto flex w-fit items-center gap-2 rounded-full px-3 py-1 text-[10px] font-bold tracking-[.24em] ${className}`}>
      <span className="alpha-dot size-1.5 rounded-full" />
      {RELEASE_LABEL}
    </p>
  );
}

/** Faint corner text on the desktop, like a pre-release build of a real OS. */
export function AlphaWatermark({ name, version, className = "" }: { name: string; version: string; className?: string }) {
  return (
    <div aria-hidden className={`alpha-mark pointer-events-none select-none text-right ${className}`}>
      <p className="text-[12px] font-semibold">{name} {version} Alpha</p>
      <p className="text-[10.5px]">Still in development · Build {BUILD}</p>
    </div>
  );
}

type Slide = { icon: ComponentType<{ className?: string }>; kicker: string; title: string; body: string; points: string[]; hue: [string, string] };
const SLIDES: Slide[] = [
  { icon: Rocket, kicker: "Version 4.0", title: "NOVA, rebuilt", body: "Every part of NOVA OS got a new look: new fonts, navy glass, and animations that rise into place.", points: ["The Prestige theme and wallpaper", "A brand-new dock", "Four sound packs", "A browser that switches servers by itself"], hue: ["#6352ff", "#a78bfa"] },
  { icon: Palette, kicker: "NOVA OS", title: "Prestige", body: "Indigo glows breathing on midnight blue, DM Serif headlines and letters that arrive one by one.", points: ["New default theme and live wallpaper", "Glass panels with glowing edges", "Shine on the buttons that matter"], hue: ["#6352ff", "#22d3ee"] },
  { icon: Layers, kicker: "NOVA OS", title: "The new dock", body: "Rest on an app to see a preview card. A glowing marker follows the app in front.", points: ["Drag pinned apps to reorder them", "Floating, Edge bar or Icons only", "Bottom or left side, with app names if you like", "Right-click the dock for its options"], hue: ["#38bdf8", "#6366f1"] },
  { icon: MessagesSquare, kicker: "Both systems", title: "Sounds you can choose", body: "Every hover and click has a new sound. Pick the pack you like best.", points: ["Prestige: velvet plucks and round pops", "Glass, Bubble and Classic", "Settings › Sound"], hue: ["#ec4899", "#8b5cf6"] },
  { icon: Zap, kicker: "Browser", title: "Sites that load", body: "The browser now uses two proxy servers together. When one blocks a site, the page goes through the other.", points: ["Remembers the server that works for each site", "Scripts inside pages are rewritten properly again", "Clearer error page when a site still refuses"], hue: ["#22c55e", "#0ea5e9"] },
  { icon: Command, kicker: "NOVA OS", title: "Small things", body: "A quick note in the Control Center, colours in search, and a new shortcut.", points: ["Quick note, saved as you type", "Type #6352ff in Search", "Alt+D shows the desktop"], hue: ["#a855f7", "#f43f5e"] },
  { icon: Sparkles, kicker: "Still in development", title: "Alpha release", body: "NOVA OS is still an alpha: things keep changing and some parts are still being built. Thanks for trying it early.", points: ["Full list in What's new", "Switch back to PRIVATE OS any time"], hue: ["#eab308", "#f97316"] },
];

export const releaseSeen = (version: string) => {
  try {
    return localStorage.getItem(SEEN_KEY) === version;
  } catch {
    return true;
  }
};

export function WhatsNewTour({ version, onDone }: { version: string; onDone: () => void }) {
  const [index, setIndex] = useState(0);
  const slide = SLIDES[index]!;
  const last = index === SLIDES.length - 1;
  const finish = () => {
    try {
      localStorage.setItem(SEEN_KEY, version);
    } catch {
      // storage unavailable
    }
    onDone();
  };
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "ArrowRight") setIndex((value) => Math.min(value + 1, SLIDES.length - 1));
      if (event.key === "ArrowLeft") setIndex((value) => Math.max(value - 1, 0));
      if (event.key === "Escape") finish();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const SlideIcon = slide.icon;
  return (
    <div role="dialog" aria-modal="true" aria-label={`What's new in ${version}`} className="tour-root fixed inset-0 z-[97] grid place-items-center p-4 text-white">
      <div className="tour-card relative w-full max-w-[860px] overflow-hidden rounded-[32px]">
        <div className="grid md:grid-cols-[1fr_1.05fr]">
          <div key={`art-${index}`} className="tour-art relative grid min-h-[220px] place-items-center overflow-hidden md:min-h-[460px]" style={{ "--t1": slide.hue[0], "--t2": slide.hue[1] } as CSSProperties}>
            <span className="tour-ring tour-ring-a" />
            <span className="tour-ring tour-ring-b" />
            <span className="tour-glyph grid size-28 place-items-center rounded-[34px]"><SlideIcon className="size-14" /></span>
            {index === 0 && <span className="absolute bottom-6 text-[64px] font-black leading-none tracking-tighter text-white/90 md:text-[96px]">4.0</span>}
          </div>
          <div key={`text-${index}`} className="tour-text flex flex-col p-7 md:p-9">
            <p className="text-[11px] font-bold uppercase tracking-[.28em] text-white/50">{slide.kicker}</p>
            <h2 className="mt-2 text-[clamp(1.8rem,4vw,2.6rem)] font-semibold leading-tight tracking-tight">{slide.title}</h2>
            <p className="mt-3 text-[14px] leading-relaxed text-white/70">{slide.body}</p>
            <ul className="mt-5 space-y-2">
              {slide.points.map((point) => (
                <li key={point} className="flex items-center gap-2.5 text-[13px] text-white/85"><Sparkles className="size-3.5 shrink-0" style={{ color: slide.hue[0] }} />{point}</li>
              ))}
            </ul>
            <div className="mt-auto flex items-center justify-between gap-3 pt-8">
              <div className="flex gap-1.5">
                {SLIDES.map((item, at) => (
                  <button key={item.title} type="button" aria-label={`Slide ${at + 1}`} onClick={() => setIndex(at)} className={`h-1.5 rounded-full transition-all ${at === index ? "w-6 bg-white" : "w-1.5 bg-white/30"}`} />
                ))}
              </div>
              <div className="flex items-center gap-2">
                {index > 0 && <button type="button" aria-label="Back" onClick={() => setIndex(index - 1)} className="grid size-10 place-items-center rounded-full bg-white/10 hover:bg-white/15"><ChevronLeft className="size-4" /></button>}
                {!last && <button type="button" onClick={finish} className="rounded-full px-3 py-2 text-[12.5px] text-white/60 hover:text-white">Skip</button>}
                <button type="button" onClick={() => (last ? finish() : setIndex(index + 1))} className="tour-next flex items-center gap-1.5 rounded-full px-5 py-2.5 text-[13px] font-semibold text-black" style={{ background: `linear-gradient(120deg, ${slide.hue[0]}, ${slide.hue[1]})` }}>
                  {last ? "Start exploring" : "Next"}{!last && <ChevronRight className="size-4" />}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
