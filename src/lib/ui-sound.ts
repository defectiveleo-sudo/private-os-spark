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

// A short burst of filtered noise: the soft "tk" texture that makes the sounds feel tactile (ASMR-like).
let noiseBuf: AudioBuffer | null = null;
function noise(c: AudioContext, at: number, duration: number, freq: number, q: number, gain: number) {
  if (!noiseBuf || noiseBuf.sampleRate !== c.sampleRate) {
    noiseBuf = c.createBuffer(1, Math.ceil(c.sampleRate * 0.2), c.sampleRate);
    const data = noiseBuf.getChannelData(0);
    for (let i = 0; i < data.length; i += 1) data[i] = Math.random() * 2 - 1;
  }
  const src = c.createBufferSource();
  src.buffer = noiseBuf;
  const filter = c.createBiquadFilter();
  filter.type = "bandpass";
  filter.frequency.value = freq;
  filter.Q.value = q;
  const amp = c.createGain();
  amp.gain.setValueAtTime(0.0001, at);
  amp.gain.exponentialRampToValueAtTime(Math.max(0.0002, gain), at + 0.002);
  amp.gain.exponentialRampToValueAtTime(0.0001, at + duration);
  src.connect(filter).connect(amp).connect(c.destination);
  src.start(at, Math.random() * 0.1);
  src.stop(at + duration + 0.02);
}

// A rounded tone that slides from one pitch to another and fades out.
function tone(c: AudioContext, at: number, from: number, to: number, duration: number, gain: number, type: OscillatorType = "sine") {
  const osc = c.createOscillator();
  const amp = c.createGain();
  const soften = c.createBiquadFilter();
  soften.type = "lowpass";
  soften.frequency.value = Math.max(from, to) * 2.5;
  osc.type = type;
  osc.frequency.setValueAtTime(from, at);
  osc.frequency.exponentialRampToValueAtTime(Math.max(40, to), at + duration);
  amp.gain.setValueAtTime(0.0001, at);
  amp.gain.exponentialRampToValueAtTime(Math.max(0.0002, gain), at + 0.004);
  amp.gain.exponentialRampToValueAtTime(0.0001, at + duration);
  osc.connect(soften).connect(amp).connect(c.destination);
  osc.start(at);
  osc.stop(at + duration + 0.03);
}

function ready(): AudioContext | null {
  const c = audio();
  return c && c.state === "running" ? c : null;
}

// Tiny random detune so repeated sounds feel organic instead of robotic.
const vary = (value: number) => value * (0.96 + Math.random() * 0.08);

/** A soft, airy tick for hovering, like brushing a glass key. `volume` is 0 to 1. */
export function playHover(volume: number) {
  const c = ready();
  if (!c || volume <= 0) return;
  const t = c.currentTime;
  noise(c, t, 0.028, vary(5200), 6, 0.05 * volume);
  tone(c, t, vary(2100), vary(2500), 0.045, 0.022 * volume);
}

/** A deep, satisfying "thock" for clicking, like a creamy mechanical key. `volume` is 0 to 1. */
export function playClick(volume: number) {
  const c = ready();
  if (!c || volume <= 0) return;
  const t = c.currentTime;
  tone(c, t, vary(210), 95, 0.09, 0.2 * volume);
  noise(c, t, 0.035, vary(1800), 2.5, 0.12 * volume);
  noise(c, t + 0.004, 0.02, vary(4200), 5, 0.04 * volume);
}

/** The lighter "tk" when a pressed button is let go. `volume` is 0 to 1. */
export function playRelease(volume: number) {
  const c = ready();
  if (!c || volume <= 0) return;
  const t = c.currentTime;
  noise(c, t, 0.022, vary(3000), 4, 0.06 * volume);
  tone(c, t, vary(520), 380, 0.04, 0.05 * volume);
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
  let pressed: Element | null = null;
  const down = (event: PointerEvent) => {
    const prefs = read();
    const el = target(event);
    if (!prefs.enabled || !prefs.click || !usable(el)) return;
    pressed = el;
    playClick(prefs.volume / 100);
  };
  const up = (event: PointerEvent) => {
    const prefs = read();
    const el = pressed;
    pressed = null;
    if (!el || !prefs.enabled || !prefs.click || !(event.target instanceof Node && el.contains(event.target))) return;
    playRelease(prefs.volume / 100);
  };
  const key = (event: KeyboardEvent) => {
    const prefs = read();
    if (event.repeat || (event.key !== "Enter" && event.key !== " ") || !prefs.enabled || !prefs.click || !usable(target(event))) return;
    playClick(prefs.volume / 100);
  };
  document.addEventListener("pointerover", over, true);
  document.addEventListener("pointerout", out, true);
  document.addEventListener("pointerdown", down, true);
  document.addEventListener("pointerup", up, true);
  document.addEventListener("keydown", key, true);
  return () => {
    document.removeEventListener("pointerup", up, true);
    document.removeEventListener("keydown", key, true);
    document.removeEventListener("pointerover", over, true);
    document.removeEventListener("pointerout", out, true);
    document.removeEventListener("pointerdown", down, true);
  };
}
