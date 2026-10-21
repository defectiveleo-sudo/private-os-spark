import { useEffect, useId, useRef, type CSSProperties } from "react";
import type { NovaTheme } from "@/components/nova-shell";

// NOVA OS wallpapers: nine live scenes painted in the current theme's colours,
// plus photo and video wallpapers. Canvas scenes pause when the tab is hidden and
// draw a single frame when motion is off.

export type NovaWall = { id: string; name: string; sub: string };
export const NOVA_WALLS: NovaWall[] = [
  { id: "prestige", name: "Prestige", sub: "Indigo glow on midnight" },
  { id: "aurora", name: "Aurora", sub: "Northern lights over the ridge" },
  { id: "fluid", name: "Fluid", sub: "Slow liquid colour" },
  { id: "dunes", name: "Dunes", sub: "Desert at sunset" },
  { id: "planet", name: "Planet", sub: "A ringed world rising" },
  { id: "tide", name: "Tide", sub: "Moonlit waves" },
  { id: "bloom", name: "Bloom", sub: "Glass petals" },
  { id: "silk", name: "Silk", sub: "Flowing threads" },
  { id: "cosmos", name: "Cosmos", sub: "Deep space and shooting stars" },
];
export const novaWallName = (id: string) => NOVA_WALLS.find((wall) => wall.id === id)?.name ?? "Aurora";

type Pal = { a: string; b: string; c: string; base: string; accent: string };
type State = { stars?: Star[]; rays?: Record<string, HTMLCanvasElement>; sky?: HTMLCanvasElement };
type Paint = (ctx: CanvasRenderingContext2D, w: number, h: number, t: number, pal: Pal, state: State) => void;

const rgb = (color: string) => {
  let value = color.replace("#", "");
  if (value.length === 3) value = value.split("").map((ch) => ch + ch).join("");
  const n = parseInt(value, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255] as const;
};
export const mix = (x: string, y: string, amount: number) => {
  const a = rgb(x);
  const b = rgb(y);
  return `#${[0, 1, 2].map((i) => Math.round(a[i]! + (b[i]! - a[i]!) * amount).toString(16).padStart(2, "0")).join("")}`;
};
const rgba = (color: string, alpha: number) => {
  const [r, g, b] = rgb(color);
  return `rgba(${r},${g},${b},${alpha})`;
};
const seeded = (seed: number) => () => {
  seed |= 0;
  seed = (seed + 0x6d2b79f5) | 0;
  let x = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  x = (x + Math.imul(x ^ (x >>> 7), 61 | x)) ^ x;
  return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
};

type Star = { x: number; y: number; r: number; p: number; s: number };
const starsFor = (state: State, count: number, maxY = 1) => {
  if (!state.stars) {
    const rand = seeded(7);
    state.stars = Array.from({ length: count }, () => ({ x: rand(), y: rand() * maxY, r: rand() ** 3 * 1.6 + 0.35, p: rand() * 6.28, s: 0.4 + rand() * 1.6 }));
  }
  return state.stars!;
};
const drawStars = (ctx: CanvasRenderingContext2D, w: number, h: number, t: number, stars: Star[], unit: number, alpha = 1) => {
  ctx.fillStyle = "#fff";
  for (const star of stars) {
    ctx.globalAlpha = alpha * (0.35 + 0.65 * Math.abs(Math.sin(t * star.s + star.p)));
    ctx.beginPath();
    ctx.arc(star.x * w, star.y * h, Math.max(0.35, star.r * unit), 0, 6.283);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
};

// A vertical light streak, drawn once per colour and stretched for each aurora ray.
const ray = (state: State, key: string, color: string) => {
  const cache = (state.rays ??= {});
  if (cache[key]) return cache[key]!;
  const sprite = document.createElement("canvas");
  sprite.width = 4;
  sprite.height = 256;
  const g = sprite.getContext("2d")!;
  const grad = g.createLinearGradient(0, 0, 0, 256);
  grad.addColorStop(0, rgba(color, 0));
  grad.addColorStop(0.55, rgba(color, 0.35));
  grad.addColorStop(0.9, rgba(mix(color, "#ffffff", 0.35), 1));
  grad.addColorStop(1, rgba(color, 0));
  g.fillStyle = grad;
  g.fillRect(0, 0, 4, 256);
  cache[key] = sprite;
  return sprite;
};

const aurora: Paint = (ctx, w, h, t, pal, state) => {
  const sky = ctx.createLinearGradient(0, 0, 0, h);
  sky.addColorStop(0, mix(pal.base, "#000000", 0.25));
  sky.addColorStop(0.55, mix(pal.base, pal.b, 0.18));
  sky.addColorStop(1, mix(pal.base, pal.a, 0.3));
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, w, h);
  drawStars(ctx, w, h, t, starsFor(state, 170, 0.75), w / 1500, 0.8);
  ctx.globalCompositeOperation = "lighter";
  const bands = [pal.a, pal.b, pal.c];
  const step = Math.max(2, Math.round(w / 420));
  bands.forEach((color, k) => {
    const sprite = ray(state, `${k}${color}`, color);
    const base = h * (0.42 + k * 0.07);
    for (let x = -step; x < w + step; x += step) {
      const p = x / w;
      const y = base + Math.sin(p * 5.2 + t * 0.21 + k * 2.1) * h * 0.08 + Math.sin(p * 13 - t * 0.37 + k) * h * 0.022;
      const len = h * (0.2 + 0.16 * (0.5 + 0.5 * Math.sin(p * 8.5 - t * 0.29 + k * 1.7)));
      ctx.globalAlpha = (0.05 + 0.13 * (0.5 + 0.5 * Math.sin(p * 3.6 + t * 0.17 + k * 2.6))) * (k === 2 ? 0.7 : 1);
      ctx.drawImage(sprite, x - step * 2, y - len, step * 5, len);
    }
  });
  ctx.globalAlpha = 1;
  ctx.globalCompositeOperation = "source-over";
};

const fluid: Paint = (ctx, w, h, t, pal) => {
  ctx.fillStyle = mix(pal.base, pal.b, 0.2);
  ctx.fillRect(0, 0, w, h);
  const blobs = [pal.a, pal.b, pal.c, pal.accent, mix(pal.a, pal.c, 0.5), mix(pal.base, "#000000", 0.2)];
  blobs.forEach((color, i) => {
    const x = w * (0.5 + 0.48 * Math.sin(t * (0.05 + i * 0.013) + i * 1.9));
    const y = h * (0.5 + 0.5 * Math.cos(t * (0.043 + i * 0.011) + i * 2.7));
    const r = Math.max(w, h) * (i === 5 ? 0.42 : 0.5);
    const grad = ctx.createRadialGradient(x, y, 0, x, y, r);
    grad.addColorStop(0, rgba(color, i === 5 ? 0.85 : 0.95));
    grad.addColorStop(1, rgba(color, 0));
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);
  });
};

const tide: Paint = (ctx, w, h, t, pal, state) => {
  const horizon = h * 0.5;
  const sky = ctx.createLinearGradient(0, 0, 0, horizon);
  sky.addColorStop(0, mix(pal.base, "#000000", 0.2));
  sky.addColorStop(1, mix(pal.base, pal.b, 0.45));
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, w, horizon + 2);
  drawStars(ctx, w, horizon * 2, t, starsFor(state, 110, 0.42), w / 1400, 0.7);
  const mx = w * 0.7;
  const my = h * 0.22;
  const glow = ctx.createRadialGradient(mx, my, 0, mx, my, h * 0.45);
  glow.addColorStop(0, rgba(pal.accent, 0.45));
  glow.addColorStop(1, rgba(pal.accent, 0));
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = mix(pal.accent, "#ffffff", 0.75);
  ctx.beginPath();
  ctx.arc(mx, my, h * 0.045, 0, 6.283);
  ctx.fill();
  const layers = 8;
  for (let i = 0; i < layers; i++) {
    const depth = i / (layers - 1);
    const y0 = horizon + (h - horizon) * (depth ** 1.6) * 0.92;
    const amp = h * (0.004 + depth * 0.02);
    const f = (0.004 + (1 - depth) * 0.01) * (1000 / w);
    const grad = ctx.createLinearGradient(0, y0 - amp, 0, h);
    grad.addColorStop(0, mix(mix(pal.b, pal.a, depth), pal.base, 0.35 + depth * 0.25));
    grad.addColorStop(1, mix(pal.base, "#000000", 0.35));
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.moveTo(0, h);
    for (let x = 0; x <= w + 8; x += 8) {
      const y = y0 + Math.sin(x * f + t * (0.5 + depth * 0.6) + i * 1.3) * amp + Math.sin(x * f * 2.3 - t * 0.7 + i * 2.1) * amp * 0.45;
      ctx.lineTo(x, y);
    }
    ctx.lineTo(w, h);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = rgba(pal.accent, 0.12 + (1 - depth) * 0.12);
    ctx.lineWidth = Math.max(1, w / 1200);
    ctx.stroke();
  }
  // Moonlight on the water.
  ctx.globalCompositeOperation = "lighter";
  const rand = seeded(Math.floor(t * 3));
  for (let i = 0; i < 70; i++) {
    const y = horizon + (h - horizon) * rand() ** 1.4;
    const spread = (y - horizon) / (h - horizon);
    const x = mx + (rand() - 0.5) * w * (0.04 + spread * 0.22);
    ctx.fillStyle = rgba(pal.accent, 0.08 + rand() * 0.25 * (1 - spread));
    ctx.fillRect(x, y, w * (0.008 + rand() * 0.03), Math.max(1, h / 500));
  }
  ctx.globalCompositeOperation = "source-over";
};

const silk: Paint = (ctx, w, h, t, pal) => {
  const bg = ctx.createRadialGradient(w * 0.55, h * 0.45, 0, w * 0.55, h * 0.45, Math.max(w, h) * 0.8);
  bg.addColorStop(0, mix(pal.base, pal.b, 0.3));
  bg.addColorStop(1, mix(pal.base, "#000000", 0.2));
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, w, h);
  ctx.globalCompositeOperation = "lighter";
  ctx.lineWidth = Math.max(1, w / 900);
  const lines = 56;
  for (let i = 0; i < lines; i++) {
    const p = i / (lines - 1);
    const color = p < 0.5 ? mix(pal.a, pal.b, p * 2) : mix(pal.b, pal.c, (p - 0.5) * 2);
    ctx.strokeStyle = rgba(color, 0.3 + 0.45 * Math.sin(p * 3.14));
    ctx.beginPath();
    for (let x = -20; x <= w + 20; x += 10) {
      const q = x / w;
      const y = h * (0.3 + p * 0.55) + Math.sin(q * 2.6 + t * 0.16 + p * 1.6) * h * 0.13 + Math.sin(q * 6.2 - t * 0.1 + p * 2.4) * h * 0.035;
      if (x === -20) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
  }
  ctx.globalCompositeOperation = "source-over";
};

const cosmos: Paint = (ctx, w, h, t, pal, state) => {
  if (!state.sky || state.sky.width !== w || state.sky.height !== h) {
    const sky = document.createElement("canvas");
    sky.width = w;
    sky.height = h;
    const g = sky.getContext("2d")!;
    g.fillStyle = mix(pal.base, "#000000", 0.15);
    g.fillRect(0, 0, w, h);
    const rand = seeded(42);
    g.save();
    g.translate(w / 2, h / 2);
    g.rotate(-0.42);
    g.globalCompositeOperation = "lighter";
    const span = Math.hypot(w, h);
    for (let i = 0; i < 90; i++) {
      const x = (rand() - 0.5) * span;
      const y = (rand() - 0.5) * h * 0.22 * (1 + rand());
      const r = h * (0.06 + rand() * 0.22);
      const color = [pal.a, pal.b, pal.c, pal.accent][i % 4]!;
      const grad = g.createRadialGradient(x, y, 0, x, y, r);
      grad.addColorStop(0, rgba(color, 0.05 + rand() * 0.12));
      grad.addColorStop(1, rgba(color, 0));
      g.fillStyle = grad;
      g.fillRect(x - r, y - r, r * 2, r * 2);
    }
    g.globalCompositeOperation = "source-over";
    for (let i = 0; i < 26; i++) {
      const x = (rand() - 0.5) * span;
      const y = (rand() - 0.5) * h * 0.08;
      const r = h * (0.03 + rand() * 0.07);
      const grad = g.createRadialGradient(x, y, 0, x, y, r);
      grad.addColorStop(0, rgba(pal.base, 0.55));
      grad.addColorStop(1, rgba(pal.base, 0));
      g.fillStyle = grad;
      g.fillRect(x - r, y - r, r * 2, r * 2);
    }
    for (let i = 0; i < 1400; i++) {
      const x = (rand() - 0.5) * span;
      const y = (rand() - 0.5) * h * (rand() < 0.6 ? 0.3 : 1.4);
      g.globalAlpha = 0.25 + rand() * 0.6;
      g.fillStyle = rand() < 0.15 ? mix(pal.accent, "#ffffff", 0.5) : "#ffffff";
      g.fillRect(x, y, rand() < 0.93 ? 1 : 2, 1);
    }
    g.restore();
    state.sky = sky;
  }
  const drift = Math.sin(t * 0.02) * w * 0.01;
  ctx.drawImage(state.sky, drift - w * 0.02, 0, w * 1.04, h);
  drawStars(ctx, w, h, t, starsFor(state, 60), w / 1000, 0.9);
  // A shooting star every few seconds.
  const cycle = 7;
  const phase = (t % cycle) / cycle;
  if (phase < 0.12) {
    const n = Math.floor(t / cycle);
    const rand = seeded(n + 3);
    const sx = w * (0.15 + rand() * 0.6);
    const sy = h * (0.05 + rand() * 0.3);
    const k = phase / 0.12;
    const x = sx + k * w * 0.25;
    const y = sy + k * h * 0.12;
    const grad = ctx.createLinearGradient(x - w * 0.08, y - h * 0.04, x, y);
    grad.addColorStop(0, "rgba(255,255,255,0)");
    grad.addColorStop(1, `rgba(255,255,255,${0.9 * (1 - k)})`);
    ctx.strokeStyle = grad;
    ctx.lineWidth = Math.max(1.2, w / 900);
    ctx.beginPath();
    ctx.moveTo(x - w * 0.08, y - h * 0.04);
    ctx.lineTo(x, y);
    ctx.stroke();
  }
};

const PAINTS: Record<string, { paint: Paint; scale: number; fps: number; size?: [number, number] }> = {
  aurora: { paint: aurora, scale: 0.4, fps: 30 },
  fluid: { paint: fluid, scale: 1, fps: 24, size: [72, 44] },
  tide: { paint: tide, scale: 0.75, fps: 30 },
  silk: { paint: silk, scale: 0.85, fps: 30 },
  cosmos: { paint: cosmos, scale: 0.75, fps: 30 },
};

function SceneCanvas({ id, pal, still }: { id: string; pal: Pal; still: boolean }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const key = `${pal.a}${pal.b}${pal.c}${pal.base}${pal.accent}`;
  useEffect(() => {
    const canvas = ref.current;
    const spec = PAINTS[id];
    if (!canvas || !spec) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const state: State = {};
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    const frozen = still || reduce;
    let w = 1;
    let h = 1;
    let raf = 0;
    let last = 0;
    const offset = 40 + (id.length * 13) % 30;
    const draw = (now: number) => spec.paint(ctx, w, h, frozen ? offset : offset + now / 1000, pal, state);
    const resize = () => {
      const box = canvas.getBoundingClientRect();
      if (spec.size) [w, h] = spec.size;
      else {
        const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
        w = Math.max(32, Math.round(box.width * dpr * spec.scale));
        h = Math.max(20, Math.round(box.height * dpr * spec.scale));
      }
      canvas.width = w;
      canvas.height = h;
      draw(performance.now());
    };
    const loop = (now: number) => {
      raf = requestAnimationFrame(loop);
      if (document.hidden || now - last < 1000 / spec.fps) return;
      last = now;
      draw(now);
    };
    const observer = new ResizeObserver(resize);
    observer.observe(canvas);
    resize();
    if (!frozen) raf = requestAnimationFrame(loop);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(raf);
    };
    // pal is described by key
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, key, still]);
  return <canvas ref={ref} className={`absolute inset-0 size-full ${id === "fluid" ? "nw-fluid" : ""}`} />;
}

// Crisp mountain ridges in front of the aurora.
function Ridges({ pal }: { pal: Pal }) {
  const u = useId().replace(/:/g, "");
  return (
    <svg viewBox="0 0 1600 1000" preserveAspectRatio="xMidYMax slice" className="absolute inset-0 size-full">
      <defs>
        <linearGradient id={`${u}ridge-far`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={mix(pal.base, pal.a, 0.28)} />
          <stop offset="1" stopColor={mix(pal.base, "#000000", 0.2)} />
        </linearGradient>
        <linearGradient id={`${u}lake`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={mix(pal.base, pal.a, 0.22)} />
          <stop offset="1" stopColor={mix(pal.base, "#000000", 0.4)} />
        </linearGradient>
      </defs>
      <path d="M0 760 L120 700 L210 728 L330 640 L420 690 L520 610 L600 655 L700 590 L820 680 L930 630 L1030 690 L1150 600 L1260 660 L1360 620 L1470 690 L1600 650 L1600 1000 L0 1000Z" fill={`url(#${u}ridge-far)`} opacity=".9" />
      <path d="M0 830 L90 790 L190 815 L300 760 L400 805 L480 780 L590 830 L720 770 L840 820 L960 790 L1080 835 L1190 780 L1300 820 L1420 790 L1520 825 L1600 800 L1600 1000 L0 1000Z" fill={mix(pal.base, "#000000", 0.35)} />
      <rect x="0" y="880" width="1600" height="120" fill={`url(#${u}lake)`} opacity=".85" />
      <path d="M0 880 H1600" stroke={rgba(pal.accent, 0.25)} strokeWidth="1.5" />
    </svg>
  );
}

function Dunes({ pal }: { pal: Pal }) {
  const u = useId().replace(/:/g, "");
  const layers = [
    { d: "M0 640 C220 600 360 560 560 590 C760 620 900 560 1100 545 C1300 530 1450 580 1600 560 L1600 1000 L0 1000Z", top: mix(pal.c, pal.base, 0.3), bottom: mix(pal.b, pal.base, 0.55) },
    { d: "M0 700 C180 660 420 640 640 680 C840 715 1000 640 1220 630 C1400 622 1500 660 1600 650 L1600 1000 L0 1000Z", top: mix(pal.c, pal.base, 0.45), bottom: mix(pal.b, pal.base, 0.7) },
    { d: "M0 780 C240 720 420 735 620 770 C820 805 980 735 1200 730 C1380 726 1500 760 1600 750 L1600 1000 L0 1000Z", top: mix(pal.a, pal.base, 0.5), bottom: mix(pal.base, "#000000", 0.2) },
    { d: "M0 870 C200 820 380 810 600 850 C820 890 1040 820 1260 830 C1420 838 1520 860 1600 855 L1600 1000 L0 1000Z", top: mix(pal.a, pal.base, 0.66), bottom: mix(pal.base, "#000000", 0.4) },
  ];
  return (
    <svg viewBox="0 0 1600 1000" preserveAspectRatio="xMidYMax slice" className="absolute inset-0 size-full">
      <defs>
        <linearGradient id={`${u}dune-sky`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={mix(pal.base, pal.b, 0.25)} />
          <stop offset=".45" stopColor={mix(pal.b, pal.base, 0.35)} />
          <stop offset=".62" stopColor={mix(pal.c, pal.accent, 0.4)} />
        </linearGradient>
        <radialGradient id={`${u}sun-glow`}>
          <stop offset="0" stopColor={pal.accent} stopOpacity=".8" />
          <stop offset=".35" stopColor={pal.c} stopOpacity=".35" />
          <stop offset="1" stopColor={pal.c} stopOpacity="0" />
        </radialGradient>
        <filter id={`${u}haze`} x="-20%" y="-200%" width="140%" height="500%"><feGaussianBlur stdDeviation="30" /></filter>
        {layers.map((layer, i) => (
          <linearGradient key={i} id={`${u}dune-${i}`} x1="0" y1="0" x2=".25" y2="1">
            <stop offset="0" stopColor={layer.top} />
            <stop offset=".6" stopColor={layer.bottom} />
          </linearGradient>
        ))}
      </defs>
      <rect width="1600" height="1000" fill={`url(#${u}dune-sky)`} />
      <g className="nw-sun">
        <circle cx="1060" cy="560" r="420" fill={`url(#${u}sun-glow)`} />
        <circle cx="1060" cy="560" r="66" fill={mix(pal.accent, "#ffffff", 0.55)} />
      </g>
      <ellipse className="nw-haze" cx="800" cy="560" rx="1100" ry="60" fill={rgba(mix(pal.accent, "#ffffff", 0.3), 0.12)} filter={`url(#${u}haze)`} />
      {layers.map((layer, i) => (
        <g key={i}>
          <path d={layer.d} fill={`url(#${u}dune-${i})`} />
          <path d={layer.d.split(" L1600")[0]} fill="none" stroke={rgba(mix(pal.accent, "#ffffff", 0.4), 0.28 - i * 0.05)} strokeWidth="2" />
        </g>
      ))}
    </svg>
  );
}

function Planet({ pal }: { pal: Pal }) {
  const u = useId().replace(/:/g, "");
  return (
    <svg viewBox="0 0 1600 1000" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 size-full">
      <defs>
        <radialGradient id={`${u}space`} cx=".3" cy=".3" r="1">
          <stop offset="0" stopColor={mix(pal.base, pal.b, 0.3)} />
          <stop offset="1" stopColor={mix(pal.base, "#000000", 0.25)} />
        </radialGradient>
        <radialGradient id={`${u}planet`} cx=".32" cy=".28" r=".85">
          <stop offset="0" stopColor={mix(pal.a, "#ffffff", 0.25)} />
          <stop offset=".35" stopColor={pal.a} />
          <stop offset=".7" stopColor={mix(pal.b, pal.base, 0.45)} />
          <stop offset="1" stopColor={mix(pal.base, "#000000", 0.3)} />
        </radialGradient>
        <linearGradient id={`${u}bands`} x1="0" y1="0" x2="0" y2="1">
          {Array.from({ length: 9 }, (_, i) => <stop key={i} offset={i / 8} stopColor={i % 2 ? pal.c : pal.b} stopOpacity={i % 2 ? 0.22 : 0.08} />)}
        </linearGradient>
        <radialGradient id={`${u}atmo`} r=".5">
          <stop offset=".86" stopColor={pal.accent} stopOpacity="0" />
          <stop offset=".93" stopColor={pal.accent} stopOpacity=".4" />
          <stop offset="1" stopColor={pal.accent} stopOpacity="0" />
        </radialGradient>
        <linearGradient id={`${u}ring`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor={pal.c} stopOpacity="0" />
          <stop offset=".3" stopColor={mix(pal.c, "#ffffff", 0.3)} stopOpacity=".7" />
          <stop offset=".7" stopColor={mix(pal.accent, "#ffffff", 0.3)} stopOpacity=".8" />
          <stop offset="1" stopColor={pal.accent} stopOpacity=".1" />
        </linearGradient>
        <clipPath id={`${u}front`}>
          <rect x="-1000" y="0" width="3000" height="400" />
        </clipPath>
        <radialGradient id={`${u}moon`} cx=".35" cy=".35">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="1" stopColor={mix(pal.c, pal.base, 0.4)} />
        </radialGradient>
      </defs>
      <rect width="1600" height="1000" fill={`url(#${u}space)`} />
      <g className="nw-planet">
        <circle cx="1180" cy="680" r="500" fill={`url(#${u}atmo)`} />
        <g transform="translate(1180 680) rotate(-16)">
          <ellipse rx="720" ry="128" fill="none" stroke={`url(#${u}ring)`} strokeWidth="44" opacity=".8" />
          <ellipse rx="650" ry="110" fill="none" stroke={`url(#${u}ring)`} strokeWidth="10" opacity=".6" />
        </g>
        <circle cx="1180" cy="680" r="440" fill={`url(#${u}planet)`} />
        <circle cx="1180" cy="680" r="440" fill={`url(#${u}bands)`} />
        <circle cx="1180" cy="680" r="440" fill="none" stroke={rgba(pal.accent, 0.5)} strokeWidth="3" />
        <g transform="translate(1180 680) rotate(-16)" clipPath={`url(#${u}front)`}>
          <ellipse rx="720" ry="128" fill="none" stroke={`url(#${u}ring)`} strokeWidth="44" opacity="1" />
          <ellipse rx="650" ry="110" fill="none" stroke={`url(#${u}ring)`} strokeWidth="10" opacity=".8" />
        </g>
      </g>
      <g className="nw-moon">
        <circle cx="330" cy="740" r="34" fill={`url(#${u}moon)`} />
      </g>
    </svg>
  );
}

function Bloom({ pal }: { pal: Pal }) {
  const u = useId().replace(/:/g, "");
  const petal = "M0 0 C140 -95 420 -110 640 0 C420 110 140 95 0 0Z";
  return (
    <svg viewBox="0 0 1600 1000" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 size-full">
      <defs>
        <radialGradient id={`${u}bloom-bg`} cx=".62" cy=".55" r=".8">
          <stop offset="0" stopColor={mix(pal.base, pal.b, 0.4)} />
          <stop offset="1" stopColor={mix(pal.base, "#000000", 0.2)} />
        </radialGradient>
        <linearGradient id={`${u}petal-a`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor={mix(pal.accent, "#ffffff", 0.5)} />
          <stop offset=".4" stopColor={pal.a} />
          <stop offset="1" stopColor={pal.b} stopOpacity=".15" />
        </linearGradient>
        <linearGradient id={`${u}petal-b`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset=".35" stopColor={pal.c} />
          <stop offset="1" stopColor={pal.b} stopOpacity=".1" />
        </linearGradient>
        <filter id={`${u}soft`} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="40" />
        </filter>
      </defs>
      <rect width="1600" height="1000" fill={`url(#${u}bloom-bg)`} />
      <g transform="translate(1000 560)">
        <g className="nw-bloom">
          <g filter={`url(#${u}soft)`} opacity=".7">
            {Array.from({ length: 8 }, (_, i) => <path key={i} d={petal} transform={`rotate(${i * 45})`} fill={`url(#${u}petal-a)`} />)}
          </g>
          {Array.from({ length: 8 }, (_, i) => <path key={`o${i}`} d={petal} transform={`rotate(${i * 45 + 8})`} fill={`url(#${u}petal-a)`} opacity=".55" style={{ mixBlendMode: "screen" }} />)}
          {Array.from({ length: 8 }, (_, i) => <path key={`i${i}`} d={petal} transform={`rotate(${i * 45 + 30}) scale(.62)`} fill={`url(#${u}petal-b)`} opacity=".6" style={{ mixBlendMode: "screen" }} />)}
          <circle r="70" fill={mix(pal.accent, "#ffffff", 0.6)} opacity=".55" filter={`url(#${u}soft)`} />
        </g>
      </g>
    </svg>
  );
}

// Midnight navy with two slow, breathing indigo glows, a fine grid and a passing glint. Pure CSS, so it is light.
function Prestige({ pal }: { pal: Pal }) {
  return (
    <div className="nw-prestige absolute inset-0" style={{ "--pa": pal.a, "--pb": pal.b, "--pc": pal.c, background: `radial-gradient(120% 90% at 50% 0%, ${mix(pal.base, pal.a, 0.12)}, ${pal.base} 62%)` } as CSSProperties}>
      <span className="nw-pg nw-pg-a" />
      <span className="nw-pg nw-pg-b" />
      <span className="nw-pg nw-pg-c" />
      <span className="nw-grid" />
      <span className="nw-glint" />
    </div>
  );
}

export function NovaWallpaper({ theme, wall = "aurora", photo, video, still = false, dim = 0, className = "absolute inset-0" }: { theme: NovaTheme; wall?: string; photo?: string | undefined; video?: string | undefined; still?: boolean; dim?: number; className?: string }) {
  const pal: Pal = { a: theme.colors[0], b: theme.colors[1], c: theme.colors[2], base: theme.base, accent: theme.accent };
  const isPhoto = wall.startsWith("photo:") && Boolean(photo || video);
  const scene = NOVA_WALLS.some((item) => item.id === wall) ? wall : "aurora";
  return (
    <div aria-hidden className={`nova-wall overflow-hidden ${isPhoto ? "nova-wall-photo" : ""} ${still ? "nw-still" : ""} ${className}`} style={{ background: theme.base, "--primary": theme.accent } as CSSProperties}>
      <div className="nova-par-1 absolute -inset-[3%]">
        {isPhoto ? (
          video && !still ? <video src={video} poster={photo} autoPlay muted loop playsInline className="absolute inset-0 size-full object-cover" /> : <img src={photo} alt="" className="absolute inset-0 size-full object-cover" />
        ) : PAINTS[scene] ? (
          <>
            <SceneCanvas id={scene} pal={pal} still={still} />
            {scene === "aurora" && <Ridges pal={pal} />}
          </>
        ) : scene === "prestige" ? (
          <Prestige pal={pal} />
        ) : scene === "dunes" ? (
          <Dunes pal={pal} />
        ) : scene === "planet" ? (
          <Planet pal={pal} />
        ) : (
          <Bloom pal={pal} />
        )}
      </div>
      {!isPhoto && <div className="nw-vignette" />}
      <div className="nova-grain" />
      {dim > 0 && <div className="absolute inset-0 bg-black" style={{ opacity: dim / 100 }} />}
    </div>
  );
}
