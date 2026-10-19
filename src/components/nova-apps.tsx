import { useEffect, useRef, useState, type ComponentType } from "react";
import { Activity, AudioWaveform, Bird, CloudRain, Coffee, Cpu, Flame, Gauge, HardDrive, Leaf, MemoryStick, Monitor, Moon, Play, Square, Waves, Wind } from "lucide-react";
import { NovaTile } from "@/components/nova-shell";

// Apps that only ship with NOVA OS: Soundscapes (a live ambient sound mixer) and Pulse (a system monitor).

type Icon = ComponentType<{ className?: string }>;

export const SoundscapesIcon: Icon = ({ className }) => <NovaTile className={className} from="#14b8a6" to="#4338ca"><AudioWaveform /></NovaTile>;
export const PulseIcon: Icon = ({ className }) => <NovaTile className={className} from="#fb7185" to="#f97316"><Activity /></NovaTile>;
// Comet is NOVA OS's web browser (the same engine as PRIVATE Browser, with its own look).
export const CometIcon: Icon = ({ className }) => (
  <NovaTile className={className} from="#22d3ee" to="#6d28d9">
    <svg viewBox="0 0 24 24" aria-hidden="true" className="!size-[70%]">
      <defs>
        <linearGradient id="comet-tail" x1=".85" y1=".1" x2="0" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity=".95" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d="M13.4 4.4 19.6 10.6 2.6 21.4Z" fill="url(#comet-tail)" />
      <circle cx="16.5" cy="7.5" r="4.4" fill="#fff" />
      <circle cx="15.2" cy="6.2" r="1.5" fill="#22d3ee" fillOpacity=".45" />
      <path d="M6 5.5v2M5 6.5h2" stroke="#fff" strokeWidth="1" strokeLinecap="round" strokeOpacity=".8" />
    </svg>
  </NovaTile>
);

// ---------------- Soundscapes ----------------

type Kind = "white" | "pink" | "brown";
type Voice = { out: GainNode; stop: () => void };
type LayerDef = { id: string; name: string; sub: string; icon: Icon; color: string; build: (ctx: AudioContext, noise: (kind: Kind) => AudioBuffer) => Voice };

function loop(ctx: AudioContext, buffer: AudioBuffer) {
  const src = ctx.createBufferSource();
  src.buffer = buffer;
  src.loop = true;
  src.loopStart = 0;
  src.loopEnd = buffer.duration;
  src.start(0, Math.random() * buffer.duration);
  return src;
}

function filter(ctx: AudioContext, type: BiquadFilterType, frequency: number, q = 0.7) {
  const node = ctx.createBiquadFilter();
  node.type = type;
  node.frequency.value = frequency;
  node.Q.value = q;
  return node;
}

function lfo(ctx: AudioContext, rate: number, depth: number, target: AudioParam) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.frequency.value = rate;
  gain.gain.value = depth;
  osc.connect(gain).connect(target);
  osc.start();
  return osc;
}

const LAYERS: LayerDef[] = [
  {
    id: "rain", name: "Rain", sub: "Soft rain on a window", icon: CloudRain, color: "#38bdf8",
    build: (ctx, noise) => {
      const out = ctx.createGain();
      const src = loop(ctx, noise("white"));
      const body = ctx.createGain();
      body.gain.value = 0.32;
      src.connect(filter(ctx, "highpass", 900)).connect(filter(ctx, "lowpass", 6500)).connect(body).connect(out);
      // Little drops on top.
      const timer = window.setInterval(() => {
        if (Math.random() > 0.55) return;
        const drop = ctx.createBufferSource();
        drop.buffer = noise("white");
        const g = ctx.createGain();
        const at = ctx.currentTime + Math.random() * 0.08;
        g.gain.setValueAtTime(0, at);
        g.gain.linearRampToValueAtTime(0.12 + Math.random() * 0.1, at + 0.004);
        g.gain.exponentialRampToValueAtTime(0.0001, at + 0.05);
        drop.connect(filter(ctx, "bandpass", 2500 + Math.random() * 3000, 4)).connect(g).connect(out);
        drop.start(at, Math.random() * 2, 0.06);
      }, 60);
      return { out, stop: () => { window.clearInterval(timer); src.stop(); } };
    },
  },
  {
    id: "waves", name: "Ocean", sub: "Slow waves on the shore", icon: Waves, color: "#22d3ee",
    build: (ctx, noise) => {
      const out = ctx.createGain();
      const src = loop(ctx, noise("brown"));
      const swell = ctx.createGain();
      swell.gain.value = 0.55;
      const low = filter(ctx, "lowpass", 700);
      src.connect(low).connect(swell).connect(out);
      const a = lfo(ctx, 0.085, 0.45, swell.gain);
      const b = lfo(ctx, 0.085, 500, low.frequency);
      return { out, stop: () => { src.stop(); a.stop(); b.stop(); } };
    },
  },
  {
    id: "wind", name: "Wind", sub: "Gusts through the trees", icon: Wind, color: "#a5b4fc",
    build: (ctx, noise) => {
      const out = ctx.createGain();
      const src = loop(ctx, noise("pink"));
      const band = filter(ctx, "bandpass", 450, 1.1);
      const g = ctx.createGain();
      g.gain.value = 0.7;
      src.connect(band).connect(g).connect(out);
      const a = lfo(ctx, 0.07, 280, band.frequency);
      const b = lfo(ctx, 0.13, 0.25, g.gain);
      return { out, stop: () => { src.stop(); a.stop(); b.stop(); } };
    },
  },
  {
    id: "fire", name: "Fireplace", sub: "Warm crackling fire", icon: Flame, color: "#fb923c",
    build: (ctx, noise) => {
      const out = ctx.createGain();
      const src = loop(ctx, noise("brown"));
      const g = ctx.createGain();
      g.gain.value = 0.45;
      src.connect(filter(ctx, "lowpass", 420)).connect(g).connect(out);
      const timer = window.setInterval(() => {
        if (Math.random() > 0.38) return;
        const pop = ctx.createBufferSource();
        pop.buffer = noise("white");
        const env = ctx.createGain();
        const at = ctx.currentTime + Math.random() * 0.06;
        const length = 0.01 + Math.random() * 0.04;
        env.gain.setValueAtTime(0, at);
        env.gain.linearRampToValueAtTime(0.2 + Math.random() * 0.35, at + 0.002);
        env.gain.exponentialRampToValueAtTime(0.0001, at + length);
        pop.connect(filter(ctx, "highpass", 1500 + Math.random() * 2500)).connect(env).connect(out);
        pop.start(at, Math.random() * 2, length + 0.02);
      }, 70);
      return { out, stop: () => { window.clearInterval(timer); src.stop(); } };
    },
  },
  {
    id: "focus", name: "Deep focus", sub: "Brown noise that blocks distractions", icon: Leaf, color: "#86efac",
    build: (ctx, noise) => {
      const out = ctx.createGain();
      const src = loop(ctx, noise("brown"));
      const g = ctx.createGain();
      g.gain.value = 0.6;
      src.connect(filter(ctx, "lowpass", 1100)).connect(g).connect(out);
      return { out, stop: () => src.stop() };
    },
  },
  {
    id: "night", name: "Summer night", sub: "Crickets and a quiet breeze", icon: Moon, color: "#c4b5fd",
    build: (ctx, noise) => {
      const out = ctx.createGain();
      const air = loop(ctx, noise("pink"));
      const airGain = ctx.createGain();
      airGain.gain.value = 0.12;
      air.connect(filter(ctx, "lowpass", 320)).connect(airGain).connect(out);
      const osc = ctx.createOscillator();
      osc.frequency.value = 4300;
      const chirp = ctx.createGain();
      chirp.gain.value = 0;
      osc.connect(chirp).connect(out);
      osc.start();
      const timer = window.setInterval(() => {
        const start = ctx.currentTime + Math.random() * 0.3;
        osc.frequency.setValueAtTime(4100 + Math.random() * 500, start);
        for (let i = 0; i < 3; i += 1) {
          const at = start + i * 0.055;
          chirp.gain.setValueAtTime(0, at);
          chirp.gain.linearRampToValueAtTime(0.045, at + 0.012);
          chirp.gain.linearRampToValueAtTime(0, at + 0.035);
        }
      }, 820);
      return { out, stop: () => { window.clearInterval(timer); air.stop(); osc.stop(); } };
    },
  },
  {
    id: "birds", name: "Morning birds", sub: "Little songs in the distance", icon: Bird, color: "#fde047",
    build: (ctx) => {
      const out = ctx.createGain();
      const timer = window.setInterval(() => {
        if (Math.random() > 0.45) return;
        const osc = ctx.createOscillator();
        const env = ctx.createGain();
        const at = ctx.currentTime + 0.02;
        const base = 2200 + Math.random() * 1800;
        const notes = 2 + Math.floor(Math.random() * 4);
        env.gain.setValueAtTime(0, at);
        for (let i = 0; i < notes; i += 1) {
          const t = at + i * 0.09;
          osc.frequency.setValueAtTime(base * (1 + (Math.random() - 0.3) * 0.25), t);
          osc.frequency.exponentialRampToValueAtTime(base * (1.25 + Math.random() * 0.3), t + 0.06);
          env.gain.linearRampToValueAtTime(0.05, t + 0.01);
          env.gain.linearRampToValueAtTime(0.0, t + 0.07);
        }
        osc.connect(env).connect(out);
        osc.start(at);
        osc.stop(at + notes * 0.09 + 0.1);
      }, 650);
      return { out, stop: () => window.clearInterval(timer) };
    },
  },
  {
    id: "cafe", name: "Café", sub: "Busy murmur and warm hum", icon: Coffee, color: "#d6a77a",
    build: (ctx, noise) => {
      const out = ctx.createGain();
      const src = loop(ctx, noise("pink"));
      const band = filter(ctx, "bandpass", 600, 0.6);
      const g = ctx.createGain();
      g.gain.value = 0.5;
      src.connect(band).connect(g).connect(out);
      const a = lfo(ctx, 0.31, 0.12, g.gain);
      const b = lfo(ctx, 0.17, 160, band.frequency);
      return { out, stop: () => { src.stop(); a.stop(); b.stop(); } };
    },
  },
];

const PRESETS: { name: string; mix: Record<string, number> }[] = [
  { name: "Deep work", mix: { focus: 55, rain: 35 } },
  { name: "Cozy", mix: { fire: 70, rain: 40 } },
  { name: "Sleep", mix: { waves: 60, wind: 25 } },
  { name: "Outdoors", mix: { birds: 60, wind: 30, night: 0 } },
  { name: "Night", mix: { night: 60, wind: 20 } },
  { name: "Café", mix: { cafe: 65, rain: 20 } },
];

export function Soundscapes() {
  const ctxRef = useRef<AudioContext | null>(null);
  const master = useRef<GainNode | null>(null);
  const analyser = useRef<AnalyserNode | null>(null);
  const voices = useRef<Record<string, Voice>>({});
  const buffers = useRef<Partial<Record<Kind, AudioBuffer>>>({});
  const canvas = useRef<HTMLCanvasElement>(null);
  const [levels, setLevels] = useState<Record<string, number>>({});
  const [volume, setVolume] = useState(70);
  const [error, setError] = useState("");
  const playing = Object.values(levels).some((value) => value > 0);

  const ensure = () => {
    if (ctxRef.current) {
      void ctxRef.current.resume();
      return ctxRef.current;
    }
    const Ctx = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctx) {
      setError("This browser can't play generated sound.");
      return null;
    }
    const ctx = new Ctx();
    const out = ctx.createGain();
    out.gain.value = volume / 100;
    const an = ctx.createAnalyser();
    an.fftSize = 256;
    out.connect(an).connect(ctx.destination);
    ctxRef.current = ctx;
    master.current = out;
    analyser.current = an;
    return ctx;
  };

  const noise = (kind: Kind) => {
    const ctx = ctxRef.current!;
    const cached = buffers.current[kind];
    if (cached) return cached;
    const length = ctx.sampleRate * 4;
    const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0, last = 0;
    for (let i = 0; i < length; i += 1) {
      const white = Math.random() * 2 - 1;
      if (kind === "white") data[i] = white * 0.5;
      else if (kind === "pink") {
        b0 = 0.99886 * b0 + white * 0.0555179; b1 = 0.99332 * b1 + white * 0.0750759; b2 = 0.969 * b2 + white * 0.153852;
        b3 = 0.8665 * b3 + white * 0.3104856; b4 = 0.55 * b4 + white * 0.5329522; b5 = -0.7616 * b5 - white * 0.016898;
        data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11;
        b6 = white * 0.115926;
      } else {
        last = (last + 0.02 * white) / 1.02;
        data[i] = last * 3.5;
      }
    }
    buffers.current[kind] = buffer;
    return buffer;
  };

  const setLevel = (id: string, value: number) => {
    setLevels((current) => ({ ...current, [id]: value }));
    const ctx = value > 0 ? ensure() : ctxRef.current;
    if (!ctx || !master.current) return;
    let voice = voices.current[id];
    if (value > 0 && !voice) {
      const def = LAYERS.find((layer) => layer.id === id);
      if (!def) return;
      voice = def.build(ctx, noise);
      voice.out.gain.value = 0;
      voice.out.connect(master.current);
      voices.current[id] = voice;
    }
    if (!voice) return;
    voice.out.gain.setTargetAtTime(value / 100, ctx.currentTime, 0.25);
    if (value === 0) {
      const old = voice;
      delete voices.current[id];
      window.setTimeout(() => { try { old.stop(); old.out.disconnect(); } catch { /* already stopped */ } }, 1200);
    }
  };

  const applyMix = (mix: Record<string, number>) => {
    LAYERS.forEach((layer) => setLevel(layer.id, mix[layer.id] ?? 0));
  };
  const stopAll = () => LAYERS.forEach((layer) => { if (levels[layer.id]) setLevel(layer.id, 0); });

  useEffect(() => {
    if (master.current && ctxRef.current) master.current.gain.setTargetAtTime(volume / 100, ctxRef.current.currentTime, 0.1);
  }, [volume]);

  useEffect(() => () => {
    Object.values(voices.current).forEach((voice) => { try { voice.stop(); } catch { /* already stopped */ } });
    void ctxRef.current?.close();
  }, []);

  // Live visualizer.
  useEffect(() => {
    if (!playing) return;
    let frame = 0;
    const draw = () => {
      frame = window.requestAnimationFrame(draw);
      const el = canvas.current;
      const an = analyser.current;
      if (!el || !an) return;
      const g = el.getContext("2d");
      if (!g) return;
      const width = (el.width = el.clientWidth * devicePixelRatio);
      const height = (el.height = el.clientHeight * devicePixelRatio);
      const data = new Uint8Array(an.frequencyBinCount);
      an.getByteFrequencyData(data);
      g.clearRect(0, 0, width, height);
      const bars = 48;
      const gap = width / bars;
      const accent = getComputedStyle(el).getPropertyValue("--primary").trim() || "#5eead4";
      for (let i = 0; i < bars; i += 1) {
        const v = (data[Math.floor((i / bars) * data.length * 0.7)] ?? 0) / 255;
        const h = Math.max(3 * devicePixelRatio, v * height * 0.95);
        g.fillStyle = accent;
        g.globalAlpha = 0.35 + v * 0.65;
        const x = i * gap + gap * 0.2;
        g.beginPath();
        g.roundRect?.(x, (height - h) / 2, gap * 0.6, h, gap * 0.3);
        g.fill();
      }
    };
    draw();
    return () => window.cancelAnimationFrame(frame);
  }, [playing]);

  return (
    <div className="nova-scroll flex min-h-0 flex-1 flex-col overflow-y-auto bg-[radial-gradient(120%_70%_at_50%_0%,color-mix(in_oklab,var(--primary)_14%,transparent),transparent_70%)] p-5 text-white">
      <div className="flex flex-wrap items-center gap-4">
        <div className="min-w-0 flex-1">
          <h2 className="text-2xl font-semibold tracking-tight">Soundscapes</h2>
          <p className="text-[12px] text-white/55">Mix calming sounds, made live on your device. No downloads.</p>
        </div>
        <div className="flex items-center gap-2">
          <input type="range" min={0} max={100} value={volume} aria-label="Master volume" onChange={(event) => setVolume(Number(event.target.value))} className="w-28 accent-[var(--primary)]" />
          {playing ? (
            <button type="button" onClick={stopAll} className="flex items-center gap-1.5 rounded-full bg-white px-4 py-2 text-[12px] font-semibold text-black"><Square className="size-3.5 fill-black" />Stop all</button>
          ) : (
            <button type="button" onClick={() => applyMix(PRESETS[0]!.mix)} className="flex items-center gap-1.5 rounded-full bg-[var(--primary)] px-4 py-2 text-[12px] font-semibold text-black"><Play className="size-3.5 fill-black" />Play</button>
          )}
        </div>
      </div>
      <canvas ref={canvas} className={`mt-4 h-16 w-full rounded-2xl bg-black/25 transition-opacity ${playing ? "opacity-100" : "opacity-40"}`} />
      {error && <p className="mt-3 text-xs text-red-300">{error}</p>}
      <div className="mt-4 flex flex-wrap gap-1.5">
        {PRESETS.map((preset) => <button key={preset.name} type="button" onClick={() => applyMix(preset.mix)} className="rounded-full bg-white/10 px-3 py-1.5 text-[12px] font-semibold hover:bg-white/20">{preset.name}</button>)}
      </div>
      <div className="mt-4 grid gap-2.5 sm:grid-cols-2">
        {LAYERS.map((layer) => {
          const value = levels[layer.id] ?? 0;
          const LayerIcon = layer.icon;
          return (
            <div key={layer.id} className={`flex items-center gap-3 rounded-2xl border p-3 transition-colors ${value ? "border-white/20 bg-white/[.09]" : "border-white/[.06] bg-white/[.03]"}`}>
              <button type="button" aria-label={value ? `Mute ${layer.name}` : `Play ${layer.name}`} onClick={() => setLevel(layer.id, value ? 0 : 50)} className={`grid size-11 shrink-0 place-items-center rounded-xl transition-transform active:scale-90 ${value ? "nova-breathe" : ""}`} style={{ background: value ? layer.color : "rgb(255 255 255 / .08)", color: value ? "#0a0a0a" : layer.color }}>
                <LayerIcon className="size-5" />
              </button>
              <div className="min-w-0 flex-1">
                <p className="flex items-baseline justify-between gap-2"><span className="truncate text-[13px] font-semibold">{layer.name}</span><span className="text-[10px] tabular-nums text-white/40">{value ? `${value}%` : "off"}</span></p>
                <p className="truncate text-[11px] text-white/45">{layer.sub}</p>
                <input type="range" min={0} max={100} value={value} aria-label={`${layer.name} level`} onChange={(event) => setLevel(layer.id, Number(event.target.value))} className="mt-1 w-full" style={{ accentColor: layer.color }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ---------------- Pulse ----------------

function Spark({ values, max, color }: { values: number[]; max: number; color: string }) {
  const points = values.map((value, index) => `${(index / Math.max(1, values.length - 1)) * 100},${30 - (Math.min(value, max) / max) * 28}`).join(" ");
  return (
    <svg viewBox="0 0 100 30" preserveAspectRatio="none" className="h-14 w-full">
      <defs>
        <linearGradient id={`pulse-${color.slice(1)}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={color} stopOpacity=".45" /><stop offset="1" stopColor={color} stopOpacity="0" /></linearGradient>
      </defs>
      {values.length > 1 && <polygon points={`0,30 ${points} 100,30`} fill={`url(#pulse-${color.slice(1)})`} />}
      {values.length > 1 && <polyline points={points} fill="none" stroke={color} strokeWidth="1.4" vectorEffect="non-scaling-stroke" strokeLinejoin="round" />}
    </svg>
  );
}

const fmtMB = (bytes: number) => (bytes >= 1e9 ? `${(bytes / 1e9).toFixed(2)} GB` : `${Math.round(bytes / 1e6)} MB`);

export function PulseMonitor({ windows }: { windows: number }) {
  const [fps, setFps] = useState<number[]>([]);
  const [lag, setLag] = useState<number[]>([]);
  const [heap, setHeap] = useState<number[]>([]);
  const [storage, setStorage] = useState<{ usage: number; quota: number } | null>(null);
  const [uptime, setUptime] = useState(0);

  useEffect(() => {
    let frames = 0;
    let frame = 0;
    const count = () => { frames += 1; frame = window.requestAnimationFrame(count); };
    frame = window.requestAnimationFrame(count);
    let last = performance.now();
    let expected = performance.now() + 100;
    let worst = 0;
    const probe = window.setInterval(() => {
      const t = performance.now();
      worst = Math.max(worst, t - expected);
      expected = t + 100;
    }, 100);
    const sample = window.setInterval(() => {
      const t = performance.now();
      setFps((list) => [...list, Math.round((frames * 1000) / (t - last))].slice(-60));
      setLag((list) => [...list, Math.max(0, Math.round(worst))].slice(-60));
      frames = 0;
      worst = 0;
      last = t;
      const memory = (performance as unknown as { memory?: { usedJSHeapSize: number } }).memory;
      if (memory) setHeap((list) => [...list, memory.usedJSHeapSize].slice(-60));
      setUptime(t);
    }, 1000);
    navigator.storage?.estimate?.().then((value) => setStorage({ usage: value.usage ?? 0, quota: value.quota ?? 0 })).catch(() => {});
    return () => { window.cancelAnimationFrame(frame); window.clearInterval(probe); window.clearInterval(sample); };
  }, []);

  const nav = navigator as Navigator & { deviceMemory?: number; connection?: { effectiveType?: string; downlink?: number } };
  const fpsNow = fps[fps.length - 1] ?? 0;
  const lagNow = lag[lag.length - 1] ?? 0;
  const heapNow = heap[heap.length - 1];
  const health = fpsNow >= 50 && lagNow < 60 ? "Smooth" : fpsNow >= 30 ? "Okay" : "Busy";
  const mins = Math.floor(uptime / 60000);
  const card = "rounded-2xl border border-white/[.07] bg-white/[.04] p-3.5";
  return (
    <div className="nova-scroll flex min-h-0 flex-1 flex-col overflow-y-auto p-5 text-white">
      <div className="flex items-end justify-between gap-3">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Pulse</h2>
          <p className="text-[12px] text-white/55">Live health of this device and session.</p>
        </div>
        <span className={`rounded-full px-3 py-1 text-[12px] font-semibold ${health === "Smooth" ? "bg-emerald-400/20 text-emerald-300" : health === "Okay" ? "bg-amber-400/20 text-amber-300" : "bg-rose-400/20 text-rose-300"}`}>{health}</span>
      </div>
      <div className="mt-4 grid gap-2.5 md:grid-cols-2">
        <div className={card}>
          <p className="flex items-center justify-between text-[12px] text-white/60"><span className="flex items-center gap-2"><Gauge className="size-4 text-emerald-300" />Frame rate</span><span className="text-xl font-semibold tabular-nums text-white">{fpsNow}<span className="text-xs text-white/50"> fps</span></span></p>
          <Spark values={fps} max={Math.max(60, ...fps)} color="#34d399" />
        </div>
        <div className={card}>
          <p className="flex items-center justify-between text-[12px] text-white/60"><span className="flex items-center gap-2"><Cpu className="size-4 text-sky-300" />Main thread delay</span><span className="text-xl font-semibold tabular-nums text-white">{lagNow}<span className="text-xs text-white/50"> ms</span></span></p>
          <Spark values={lag} max={Math.max(100, ...lag)} color="#38bdf8" />
        </div>
        <div className={card}>
          <p className="flex items-center justify-between text-[12px] text-white/60"><span className="flex items-center gap-2"><MemoryStick className="size-4 text-violet-300" />Memory in use</span><span className="text-xl font-semibold tabular-nums text-white">{heapNow ? fmtMB(heapNow) : "n/a"}</span></p>
          {heap.length ? <Spark values={heap} max={Math.max(...heap) * 1.2} color="#a78bfa" /> : <p className="py-5 text-center text-[11px] text-white/40">This browser doesn't share memory use.</p>}
        </div>
        <div className={card}>
          <p className="flex items-center justify-between text-[12px] text-white/60"><span className="flex items-center gap-2"><HardDrive className="size-4 text-amber-300" />Storage for Nova</span><span className="text-sm font-semibold tabular-nums text-white">{storage ? `${fmtMB(storage.usage)} of ${fmtMB(storage.quota)}` : "n/a"}</span></p>
          <div className="mt-5 h-2.5 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-gradient-to-r from-amber-300 to-orange-500 transition-[width] duration-700" style={{ width: storage && storage.quota ? `${Math.max(1, (storage.usage / storage.quota) * 100)}%` : "1%" }} /></div>
          <p className="mt-2 text-[11px] text-white/40">Files, wallpapers and settings saved in this browser.</p>
        </div>
      </div>
      <div className={`${card} mt-2.5 grid grid-cols-2 gap-3 text-[12px] sm:grid-cols-4`}>
        {([
          [Cpu, "CPU threads", String(navigator.hardwareConcurrency || "n/a")],
          [MemoryStick, "Device memory", nav.deviceMemory ? `${nav.deviceMemory} GB+` : "n/a"],
          [Monitor, "Screen", `${screen.width}×${screen.height} @${devicePixelRatio}x`],
          [Activity, "Network", nav.connection?.effectiveType ? nav.connection.effectiveType.toUpperCase() : navigator.onLine ? "Online" : "Offline"],
          [Gauge, "Session", `${mins} min`],
          [Monitor, "Open windows", String(windows)],
        ] as [Icon, string, string][]).map(([ItemIcon, label, value]) => (
          <div key={label}>
            <p className="flex items-center gap-1.5 text-white/45"><ItemIcon className="size-3.5" />{label}</p>
            <p className="mt-0.5 font-semibold">{value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
