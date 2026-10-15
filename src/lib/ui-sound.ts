// Soft interface sounds made with the Web Audio API (no audio files, nothing downloaded).
export type SoundPrefs = { enabled: boolean; hover: boolean; click: boolean; volume: number };

let ctx: AudioContext | null = null;
function audio(): AudioContext | null {
  try {
    ctx ??= new AudioContext();
    if (ctx.state === "suspended") void ctx.resume();
    return ctx;
  } catch {
    return null;
  }
}

function blip(from: number, to: number, duration: number, gain: number, type: OscillatorType = "sine") {
  const c = audio();
  if (!c || c.state !== "running") return;
  const t = c.currentTime;
  const osc = c.createOscillator();
  const amp = c.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(from, t);
  osc.frequency.exponentialRampToValueAtTime(Math.max(40, to), t + duration);
  amp.gain.setValueAtTime(0.0001, t);
  amp.gain.exponentialRampToValueAtTime(Math.max(0.0002, gain), t + 0.006);
  amp.gain.exponentialRampToValueAtTime(0.0001, t + duration);
  osc.connect(amp).connect(c.destination);
  osc.start(t);
  osc.stop(t + duration + 0.03);
}

/** A light, glassy tick for hovering. `volume` is 0 to 1. */
export function playHover(volume: number) {
  blip(1900, 2400, 0.05, 0.05 * volume);
  blip(3800, 4300, 0.03, 0.014 * volume);
}

/** A soft, rounded pop for clicking. `volume` is 0 to 1. */
export function playClick(volume: number) {
  blip(640, 300, 0.1, 0.12 * volume, "triangle");
  blip(1500, 900, 0.045, 0.035 * volume);
}

const INTERACTIVE = 'button, a[href], [role="button"], [role="menuitem"], [role="switch"], [role="tab"], [role="option"], select, summary, input[type="checkbox"], input[type="range"], label[for]';

/** Plays hover and click sounds for every interactive element on the page. Returns a function that removes the listeners. */
export function installUiSounds(read: () => SoundPrefs): () => void {
  let lastEl: Element | null = null;
  let lastAt = 0;
  const target = (event: Event) => (event.target instanceof Element ? event.target.closest(INTERACTIVE) : null);
  const usable = (el: Element | null) => el !== null && !(el as HTMLButtonElement).disabled && el.getAttribute("aria-disabled") !== "true";
  const over = (event: PointerEvent) => {
    const prefs = read();
    if (!prefs.enabled || !prefs.hover || event.pointerType !== "mouse") return;
    const el = target(event);
    if (!usable(el) || el === lastEl) return;
    lastEl = el;
    const now = performance.now();
    if (now - lastAt < 55) return;
    lastAt = now;
    playHover(prefs.volume / 100);
  };
  const out = (event: PointerEvent) => {
    if (target(event) === lastEl && !(event.relatedTarget instanceof Node && lastEl?.contains(event.relatedTarget))) lastEl = null;
  };
  const down = (event: PointerEvent) => {
    const prefs = read();
    if (!prefs.enabled || !prefs.click || !usable(target(event))) return;
    playClick(prefs.volume / 100);
  };
  document.addEventListener("pointerover", over, true);
  document.addEventListener("pointerout", out, true);
  document.addEventListener("pointerdown", down, true);
  return () => {
    document.removeEventListener("pointerover", over, true);
    document.removeEventListener("pointerout", out, true);
    document.removeEventListener("pointerdown", down, true);
  };
}
