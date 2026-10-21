// Soft interface sounds made with the Web Audio API (no audio files, nothing downloaded).
export type SoundPack = "prestige" | "glass" | "bubble" | "classic";
export type SoundPrefs = { enabled: boolean; hover: boolean; click: boolean; volume: number; pack?: SoundPack };

export const SOUND_PACKS: { id: SoundPack; name: string; sub: string }[] = [
  { id: "prestige", name: "Prestige", sub: "Velvet plucks and round pops" },
  { id: "glass", name: "Glass", sub: "Crystal pings" },
  { id: "bubble", name: "Bubble", sub: "Soft water drops" },
  { id: "classic", name: "Classic", sub: "Creamy key thocks" },
];

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

// A bell-like note: a pure tone with a quieter overtone, both ringing out.
function bell(c: AudioContext, at: number, freq: number, duration: number, gain: number) {
  tone(c, at, freq, freq * 0.995, duration, gain);
  tone(c, at, freq * 2.01, freq * 2, duration * 0.6, gain * 0.28);
}

type Sounds = { hover: (c: AudioContext, t: number, v: number) => void; click: (c: AudioContext, t: number, v: number) => void; release: (c: AudioContext, t: number, v: number) => void };
const PACKS: Record<SoundPack, Sounds> = {
  // Velvet: a muted pluck on hover, a round "pop" with a soft low body on click.
  prestige: {
    hover: (c, t, v) => {
      tone(c, t, vary(1480), vary(1320), 0.07, 0.03 * v, "triangle");
      noise(c, t, 0.018, vary(6500), 8, 0.018 * v);
    },
    click: (c, t, v) => {
      tone(c, t, vary(620), 240, 0.11, 0.17 * v);
      tone(c, t, vary(150), 70, 0.12, 0.13 * v);
      noise(c, t, 0.02, vary(2600), 3, 0.05 * v);
    },
    release: (c, t, v) => tone(c, t, vary(780), vary(1040), 0.05, 0.045 * v),
  },
  glass: {
    hover: (c, t, v) => bell(c, t, vary(2350), 0.12, 0.02 * v),
    click: (c, t, v) => {
      bell(c, t, vary(1560), 0.22, 0.07 * v);
      noise(c, t, 0.012, vary(7000), 6, 0.05 * v);
    },
    release: (c, t, v) => bell(c, t, vary(2080), 0.1, 0.025 * v),
  },
  bubble: {
    hover: (c, t, v) => tone(c, t, vary(700), vary(1250), 0.05, 0.035 * v),
    click: (c, t, v) => {
      tone(c, t, vary(1100), 320, 0.08, 0.13 * v);
      tone(c, t + 0.03, vary(480), 820, 0.06, 0.06 * v);
    },
    release: (c, t, v) => tone(c, t, vary(520), vary(980), 0.045, 0.04 * v),
  },
  classic: {
    hover: (c, t, v) => {
      noise(c, t, 0.028, vary(5200), 6, 0.05 * v);
      tone(c, t, vary(2100), vary(2500), 0.045, 0.022 * v);
    },
    click: (c, t, v) => {
      tone(c, t, vary(210), 95, 0.09, 0.2 * v);
      noise(c, t, 0.035, vary(1800), 2.5, 0.12 * v);
      noise(c, t + 0.004, 0.02, vary(4200), 5, 0.04 * v);
    },
    release: (c, t, v) => {
      noise(c, t, 0.022, vary(3000), 4, 0.06 * v);
      tone(c, t, vary(520), 380, 0.04, 0.05 * v);
    },
  },
};

function play(kind: keyof Sounds, volume: number, pack: SoundPack) {
  const c = ready();
  if (!c || volume <= 0) return;
  (PACKS[pack] ?? PACKS.prestige)[kind](c, c.currentTime, volume);
}

/** The hover sound of a sound pack. `volume` is 0 to 1. */
export function playHover(volume: number, pack: SoundPack = "prestige") {
  play("hover", volume, pack);
}

/** The click sound of a sound pack. `volume` is 0 to 1. */
export function playClick(volume: number, pack: SoundPack = "prestige") {
  play("click", volume, pack);
}

/** The lighter sound when a pressed button is let go. `volume` is 0 to 1. */
export function playRelease(volume: number, pack: SoundPack = "prestige") {
  play("release", volume, pack);
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
    playHover(prefs.volume / 100, prefs.pack);
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
    playClick(prefs.volume / 100, prefs.pack);
  };
  const up = (event: PointerEvent) => {
    const prefs = read();
    const el = pressed;
    pressed = null;
    if (!el || !prefs.enabled || !prefs.click || !(event.target instanceof Node && el.contains(event.target))) return;
    playRelease(prefs.volume / 100, prefs.pack);
  };
  const key = (event: KeyboardEvent) => {
    const prefs = read();
    if (event.repeat || (event.key !== "Enter" && event.key !== " ") || !prefs.enabled || !prefs.click || !usable(target(event))) return;
    playClick(prefs.volume / 100, prefs.pack);
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
