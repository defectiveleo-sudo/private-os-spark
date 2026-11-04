import { useCallback, useEffect, useRef, useState } from "react";
import { Gamepad2, RotateCcw } from "lucide-react";

// Arcade games for the Game Hub (PRIVATE OS 4.6). They draw on a canvas, run offline and take the keyboard,
// touch or mouse, and a game controller (any pad the browser sees through the Gamepad API).

export type ArcadeId = "flappy" | "blocks" | "pong";

export const ARCADE_GAMES: { id: ArcadeId; name: string; sub: string; emoji: string; tone: string; genre: string }[] = [
  { id: "blocks", name: "Blocks", sub: "Stack falling pieces, clear lines", emoji: "🟪", tone: "from-violet-400 to-indigo-800", genre: "Puzzle" },
  { id: "flappy", name: "Flappy Jet", sub: "Tap to fly through the gaps", emoji: "🛩️", tone: "from-sky-300 to-cyan-700", genre: "Arcade" },
  { id: "pong", name: "Pong", sub: "First to 7 against the computer", emoji: "🏓", tone: "from-lime-300 to-emerald-700", genre: "Sports" },
];

const typing = (event: KeyboardEvent) => Boolean((event.target as HTMLElement | null)?.closest?.("input, textarea, [contenteditable]"));

function useBest(id: string) {
  const key = `pos-best-${id}`;
  const [best, setBest] = useState(0);
  useEffect(() => {
    try {
      setBest(Number(localStorage.getItem(key) ?? 0) || 0);
    } catch {
      // storage unavailable
    }
  }, [key]);
  const report = useCallback((score: number) => {
    setBest((current) => {
      if (score <= current) return current;
      try {
        localStorage.setItem(key, String(score));
      } catch {
        // storage unavailable
      }
      return score;
    });
  }, [key]);
  return [best, report] as const;
}

// One snapshot of the first connected controller: stick / d-pad direction and the main buttons.
type Pad = { x: number; y: number; a: boolean; b: boolean; start: boolean };
function readPad(): Pad | null {
  const pads = typeof navigator !== "undefined" && navigator.getGamepads ? navigator.getGamepads() : [];
  const pad = Array.from(pads ?? []).find(Boolean);
  if (!pad) return null;
  const pressed = (index: number) => Boolean(pad.buttons[index]?.pressed);
  const axisX = Math.abs(pad.axes[0] ?? 0) > 0.35 ? (pad.axes[0] ?? 0) : 0;
  const axisY = Math.abs(pad.axes[1] ?? 0) > 0.35 ? (pad.axes[1] ?? 0) : 0;
  return { x: pressed(14) ? -1 : pressed(15) ? 1 : axisX, y: pressed(12) ? -1 : pressed(13) ? 1 : axisY, a: pressed(0), b: pressed(1) || pressed(2), start: pressed(9) };
}

export function usePadName() {
  const [name, setName] = useState<string | null>(null);
  useEffect(() => {
    const sync = () => {
      const pad = Array.from(navigator.getGamepads?.() ?? []).find(Boolean);
      setName(pad ? pad.id.replace(/\s*\(.*$/, "").slice(0, 40) || "Controller" : null);
    };
    sync();
    window.addEventListener("gamepadconnected", sync);
    window.addEventListener("gamepaddisconnected", sync);
    return () => {
      window.removeEventListener("gamepadconnected", sync);
      window.removeEventListener("gamepaddisconnected", sync);
    };
  }, []);
  return name;
}

function Bar({ score, best, label = "Score", restart, extra }: { score: number | string; best?: number; label?: string; restart: () => void; extra?: string }) {
  return (
    <div className="flex w-full items-center justify-between gap-2 text-xs">
      <div className="flex gap-2">
        <span className="rounded-lg bg-white/10 px-3 py-1.5"><span className="text-white/50">{label} </span><b>{score}</b></span>
        {best !== undefined && <span className="rounded-lg bg-white/10 px-3 py-1.5"><span className="text-white/50">Best </span><b>{best}</b></span>}
        {extra && <span className="rounded-lg bg-white/10 px-3 py-1.5 text-white/70">{extra}</span>}
      </div>
      <button type="button" onClick={restart} className="flex items-center gap-1.5 rounded-lg bg-[#3fbf5f] px-3 py-1.5 font-semibold text-black transition-transform active:scale-95"><RotateCcw className="size-3.5" />New game</button>
    </div>
  );
}

function Overlay({ text, sub, action }: { text: string; sub?: string; action: () => void }) {
  return (
    <div className="absolute inset-0 z-10 grid place-items-center rounded-2xl bg-black/65 [animation:window-in_.25s_cubic-bezier(.22,1,.36,1)]">
      <div className="text-center">
        <p className="text-2xl font-black">{text}</p>
        {sub && <p className="mt-1 text-xs text-white/60">{sub}</p>}
        <button type="button" onClick={action} className="mt-4 rounded-lg bg-[#3fbf5f] px-6 py-2 text-sm font-bold text-black active:scale-95">Play</button>
        <p className="mt-3 flex items-center justify-center gap-1.5 text-[10px] text-white/45"><Gamepad2 className="size-3.5" />Controllers work too: press A to play</p>
      </div>
    </div>
  );
}

// ---------------- Flappy Jet ----------------
function FlappyGame() {
  const [best, report] = useBest("flappy");
  const canvas = useRef<HTMLCanvasElement>(null);
  const [score, setScore] = useState(0);
  const [status, setStatus] = useState<"ready" | "play" | "over">("ready");
  const flap = useRef<() => void>(() => undefined);
  const start = useCallback(() => setStatus("play"), []);
  useEffect(() => {
    const ctx = canvas.current?.getContext("2d");
    if (!ctx) return;
    const W = 420, H = 520, gap = 150, speed = 2.4;
    const jet = { y: H / 2, v: 0 };
    let pipes: { x: number; top: number; scored: boolean }[] = [];
    let points = 0, raf = 0, tick = 0, padWas = false;
    const running = status === "play";
    flap.current = () => { if (running) jet.v = -6.4; else setStatus("play"); };
    const draw = () => {
      const sky = ctx.createLinearGradient(0, 0, 0, H);
      sky.addColorStop(0, "#0b1a33"); sky.addColorStop(1, "#1d4e6e");
      ctx.fillStyle = sky; ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = "rgba(255,255,255,.5)";
      for (let i = 0; i < 18; i++) ctx.fillRect((i * 97 + 400 - ((tick * 0.4) % 400)) % W, (i * 53) % (H - 120), 2, 2);
      for (const pipe of pipes) {
        ctx.fillStyle = "#3fbf5f";
        ctx.beginPath(); ctx.roundRect(pipe.x, -10, 56, pipe.top + 10, 8); ctx.fill();
        ctx.beginPath(); ctx.roundRect(pipe.x, pipe.top + gap, 56, H - pipe.top - gap + 10, 8); ctx.fill();
        ctx.fillStyle = "rgba(0,0,0,.18)"; ctx.fillRect(pipe.x + 40, 0, 6, pipe.top); ctx.fillRect(pipe.x + 40, pipe.top + gap, 6, H);
      }
      ctx.save(); ctx.translate(90, jet.y); ctx.rotate(Math.max(-0.5, Math.min(0.9, jet.v / 10)));
      ctx.font = "34px serif"; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText("🛩️", 0, 0);
      ctx.restore();
      ctx.fillStyle = "#fff"; ctx.font = "bold 34px system-ui, sans-serif"; ctx.textAlign = "center"; ctx.fillText(String(points), W / 2, 56);
    };
    const step = () => {
      tick += 1;
      const pad = readPad();
      if (pad?.a && !padWas) jet.v = -6.4;
      padWas = Boolean(pad?.a);
      jet.v = Math.min(9, jet.v + 0.36); jet.y += jet.v;
      if (tick % 96 === 1) pipes.push({ x: W, top: 60 + Math.random() * (H - gap - 140), scored: false });
      pipes = pipes.filter((pipe) => pipe.x > -70);
      for (const pipe of pipes) {
        pipe.x -= speed;
        if (!pipe.scored && pipe.x + 56 < 90) { pipe.scored = true; points += 1; setScore(points); }
        const hitX = 90 + 14 > pipe.x && 90 - 14 < pipe.x + 56;
        if (hitX && (jet.y - 12 < pipe.top || jet.y + 12 > pipe.top + gap)) return false;
      }
      return jet.y < H - 10 && jet.y > -40;
    };
    const loop = () => {
      if (running && !step()) { report(points); setStatus("over"); draw(); return; }
      if (!running) {
        tick += 1;
        const pad = readPad();
        if (pad?.a && !padWas) { padWas = true; setStatus("play"); return; }
        padWas = Boolean(pad?.a);
        jet.y = H / 2 + Math.sin(tick / 18) * 10;
      }
      draw();
      raf = requestAnimationFrame(loop);
    };
    setScore(0);
    loop();
    const onKey = (event: KeyboardEvent) => {
      if (typing(event) || (event.code !== "Space" && event.code !== "ArrowUp" && event.code !== "KeyW")) return;
      event.preventDefault();
      flap.current();
    };
    window.addEventListener("keydown", onKey);
    return () => { cancelAnimationFrame(raf); window.removeEventListener("keydown", onKey); };
  }, [status, report]);
  return (
    <div className="flex flex-col items-center gap-3">
      <Bar score={score} best={best} restart={() => { setStatus("ready"); window.setTimeout(start, 0); }} />
      <div className="relative w-[min(100%,26rem)]">
        <canvas ref={canvas} width={420} height={520} onPointerDown={() => flap.current()} className="w-full touch-none rounded-2xl border border-white/10" />
        {status === "ready" && <Overlay text="Flappy Jet" sub="Space, click or tap to fly" action={start} />}
        {status === "over" && <Overlay text="Crashed!" sub={`Score ${score}`} action={start} />}
      </div>
    </div>
  );
}

// ---------------- Blocks (falling pieces) ----------------
const BW = 10, BH = 20;
const SHAPES: { cells: number[][]; color: string }[] = [
  { cells: [[0, 1], [1, 1], [2, 1], [3, 1]], color: "#38bdf8" },
  { cells: [[0, 0], [1, 0], [0, 1], [1, 1]], color: "#facc15" },
  { cells: [[1, 0], [0, 1], [1, 1], [2, 1]], color: "#c084fc" },
  { cells: [[1, 0], [2, 0], [0, 1], [1, 1]], color: "#4ade80" },
  { cells: [[0, 0], [1, 0], [1, 1], [2, 1]], color: "#f87171" },
  { cells: [[0, 0], [0, 1], [1, 1], [2, 1]], color: "#60a5fa" },
  { cells: [[2, 0], [0, 1], [1, 1], [2, 1]], color: "#fb923c" },
];
type Piece = { cells: number[][]; color: string; x: number; y: number };
const newPiece = (): Piece => { const shape = SHAPES[Math.floor(Math.random() * SHAPES.length)]!; return { cells: shape.cells.map((cell) => [...cell]), color: shape.color, x: 3, y: -1 }; };

function BlocksGame() {
  const [best, report] = useBest("blocks");
  const canvas = useRef<HTMLCanvasElement>(null);
  const [score, setScore] = useState(0);
  const [lines, setLines] = useState(0);
  const [status, setStatus] = useState<"ready" | "play" | "over" | "pause">("ready");
  const control = useRef<(action: "left" | "right" | "rotate" | "down" | "drop") => void>(() => undefined);
  const start = useCallback(() => setStatus("play"), []);
  useEffect(() => {
    const ctx = canvas.current?.getContext("2d");
    if (!ctx) return;
    const S = 26;
    const board: (string | null)[][] = Array.from({ length: BH }, () => Array<string | null>(BW).fill(null));
    let piece = newPiece(), next = newPiece(), points = 0, cleared = 0, raf = 0, last = performance.now(), padAt = 0;
    const running = status === "play";
    const fits = (cells: number[][], x: number, y: number) => cells.every(([cx, cy]) => {
      const px = x + cx!, py = y + cy!;
      return px >= 0 && px < BW && py < BH && (py < 0 || !board[py]![px]);
    });
    const lock = () => {
      for (const [cx, cy] of piece.cells) { const py = piece.y + cy!; if (py < 0) { report(points); setStatus("over"); return false; } board[py]![piece.x + cx!] = piece.color; }
      let full = 0;
      for (let row = BH - 1; row >= 0; row--) {
        if (board[row]!.every(Boolean)) { board.splice(row, 1); board.unshift(Array<string | null>(BW).fill(null)); full += 1; row += 1; }
      }
      if (full) { cleared += full; points += [0, 100, 300, 500, 800][full]! * (1 + Math.floor(cleared / 10)); setScore(points); setLines(cleared); }
      piece = next; next = newPiece();
      if (!fits(piece.cells, piece.x, piece.y)) { report(points); setStatus("over"); return false; }
      return true;
    };
    const act = (action: "left" | "right" | "rotate" | "down" | "drop") => {
      if (!running) return;
      if (action === "left" && fits(piece.cells, piece.x - 1, piece.y)) piece.x -= 1;
      if (action === "right" && fits(piece.cells, piece.x + 1, piece.y)) piece.x += 1;
      if (action === "rotate") {
        const size = Math.max(...piece.cells.map(([cx, cy]) => Math.max(cx!, cy!))) + 1;
        const turned = piece.cells.map(([cx, cy]) => [size - 1 - cy!, cx!]);
        for (const kick of [0, -1, 1, -2, 2]) if (fits(turned, piece.x + kick, piece.y)) { piece.cells = turned; piece.x += kick; break; }
      }
      if (action === "down") { if (fits(piece.cells, piece.x, piece.y + 1)) { piece.y += 1; points += 1; setScore(points); } else lock(); }
      if (action === "drop") { while (fits(piece.cells, piece.x, piece.y + 1)) { piece.y += 1; points += 2; } setScore(points); lock(); }
    };
    control.current = act;
    const cell = (x: number, y: number, color: string, alpha = 1) => {
      ctx.globalAlpha = alpha; ctx.fillStyle = color; ctx.beginPath(); ctx.roundRect(x * S + 1, y * S + 1, S - 2, S - 2, 5); ctx.fill();
      ctx.fillStyle = "rgba(255,255,255,.22)"; ctx.fillRect(x * S + 4, y * S + 3, S - 8, 3); ctx.globalAlpha = 1;
    };
    const draw = () => {
      ctx.fillStyle = "#0d0d12"; ctx.fillRect(0, 0, BW * S + 120, BH * S);
      ctx.strokeStyle = "rgba(255,255,255,.04)";
      for (let x = 0; x <= BW; x++) { ctx.beginPath(); ctx.moveTo(x * S, 0); ctx.lineTo(x * S, BH * S); ctx.stroke(); }
      board.forEach((row, y) => row.forEach((color, x) => { if (color) cell(x, y, color); }));
      let ghost = piece.y;
      while (fits(piece.cells, piece.x, ghost + 1)) ghost += 1;
      piece.cells.forEach(([cx, cy]) => { if (ghost + cy! >= 0) cell(piece.x + cx!, ghost + cy!, piece.color, 0.18); });
      piece.cells.forEach(([cx, cy]) => { if (piece.y + cy! >= 0) cell(piece.x + cx!, piece.y + cy!, piece.color); });
      ctx.fillStyle = "#15151b"; ctx.fillRect(BW * S, 0, 120, BH * S);
      ctx.fillStyle = "rgba(255,255,255,.5)"; ctx.font = "bold 11px system-ui, sans-serif"; ctx.fillText("NEXT", BW * S + 16, 26);
      next.cells.forEach(([cx, cy]) => { ctx.fillStyle = next.color; ctx.beginPath(); ctx.roundRect(BW * S + 18 + cx! * 20, 40 + cy! * 20, 18, 18, 4); ctx.fill(); });
      ctx.fillStyle = "rgba(255,255,255,.5)"; ctx.fillText("LEVEL", BW * S + 16, 140);
      ctx.fillStyle = "#fff"; ctx.font = "bold 22px system-ui, sans-serif"; ctx.fillText(String(1 + Math.floor(cleared / 10)), BW * S + 16, 166);
    };
    const loop = (now: number) => {
      if (running) {
        const pad = readPad();
        if (pad && now - padAt > 130) {
          if (pad.x < 0) { act("left"); padAt = now; } else if (pad.x > 0) { act("right"); padAt = now; } else if (pad.y > 0) { act("down"); padAt = now; } else if (pad.a) { act("rotate"); padAt = now + 90; } else if (pad.b || pad.y < 0) { act("drop"); padAt = now + 160; }
        }
        const speed = Math.max(90, 650 - Math.floor(cleared / 10) * 60);
        if (now - last > speed) {
          last = now;
          if (fits(piece.cells, piece.x, piece.y + 1)) piece.y += 1; else if (!lock()) { draw(); return; }
        }
      } else {
        const pad = readPad();
        if (pad?.a || pad?.start) { setStatus("play"); return; }
      }
      draw();
      raf = requestAnimationFrame(loop);
    };
    if (status === "play" || status === "ready") { setScore(0); setLines(0); }
    raf = requestAnimationFrame(loop);
    const onKey = (event: KeyboardEvent) => {
      if (typing(event)) return;
      const map: Record<string, "left" | "right" | "rotate" | "down" | "drop"> = { ArrowLeft: "left", KeyA: "left", ArrowRight: "right", KeyD: "right", ArrowUp: "rotate", KeyW: "rotate", ArrowDown: "down", KeyS: "down", Space: "drop" };
      const action = map[event.code];
      if (!action) return;
      event.preventDefault();
      act(action);
    };
    window.addEventListener("keydown", onKey);
    return () => { cancelAnimationFrame(raf); window.removeEventListener("keydown", onKey); };
  }, [status, report]);
  const touch = "grid h-11 flex-1 place-items-center rounded-xl bg-white/10 text-lg font-bold active:bg-white/25";
  return (
    <div className="flex flex-col items-center gap-3">
      <Bar score={score} best={best} extra={`${lines} lines`} restart={() => { setStatus("ready"); window.setTimeout(start, 0); }} />
      <div className="relative w-[min(100%,24rem)]">
        <canvas ref={canvas} width={380} height={520} className="w-full touch-none rounded-2xl border border-white/10" />
        {status === "ready" && <Overlay text="Blocks" sub="Arrows to move and turn, Space to drop" action={start} />}
        {status === "over" && <Overlay text="Game over" sub={`Score ${score} · ${lines} lines`} action={start} />}
      </div>
      <div className="flex w-[min(100%,24rem)] gap-2 sm:hidden">
        <button type="button" aria-label="Move left" onClick={() => control.current("left")} className={touch}>◀</button>
        <button type="button" aria-label="Turn" onClick={() => control.current("rotate")} className={touch}>⟳</button>
        <button type="button" aria-label="Move right" onClick={() => control.current("right")} className={touch}>▶</button>
        <button type="button" aria-label="Drop" onClick={() => control.current("drop")} className={touch}>⤓</button>
      </div>
    </div>
  );
}

// ---------------- Pong ----------------
function PongGame() {
  const [best, report] = useBest("pong");
  const canvas = useRef<HTMLCanvasElement>(null);
  const [score, setScore] = useState<[number, number]>([0, 0]);
  const [status, setStatus] = useState<"ready" | "play" | "won" | "lost">("ready");
  const pointer = useRef<number | null>(null);
  const start = useCallback(() => setStatus("play"), []);
  useEffect(() => {
    const ctx = canvas.current?.getContext("2d");
    if (!ctx) return;
    const W = 520, H = 340, PH = 70;
    let me = H / 2, cpu = H / 2, raf = 0, mine = 0, theirs = 0;
    const keys = new Set<string>();
    const ball = { x: W / 2, y: H / 2, vx: 4, vy: 2.2 };
    const running = status === "play";
    const serve = (towards: number) => Object.assign(ball, { x: W / 2, y: H / 2, vx: 4 * towards, vy: (Math.random() * 2 - 1) * 3 });
    const draw = () => {
      ctx.fillStyle = "#0b120e"; ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = "rgba(255,255,255,.15)"; for (let y = 8; y < H; y += 22) ctx.fillRect(W / 2 - 1, y, 2, 12);
      ctx.fillStyle = "#3fbf5f"; ctx.beginPath(); ctx.roundRect(14, me - PH / 2, 10, PH, 5); ctx.fill();
      ctx.fillStyle = "#e5e7eb"; ctx.beginPath(); ctx.roundRect(W - 24, cpu - PH / 2, 10, PH, 5); ctx.fill();
      ctx.fillStyle = "#fff"; ctx.shadowColor = "#fff"; ctx.shadowBlur = 10; ctx.beginPath(); ctx.arc(ball.x, ball.y, 7, 0, Math.PI * 2); ctx.fill(); ctx.shadowBlur = 0;
      ctx.fillStyle = "rgba(255,255,255,.55)"; ctx.font = "bold 28px system-ui, sans-serif"; ctx.textAlign = "center"; ctx.fillText(String(mine), W / 2 - 40, 40); ctx.fillText(String(theirs), W / 2 + 40, 40);
    };
    const step = () => {
      const pad = readPad();
      if (pointer.current !== null) me += (pointer.current - me) * 0.35;
      if (keys.has("ArrowUp") || keys.has("KeyW") || (pad && pad.y < 0)) me -= 6;
      if (keys.has("ArrowDown") || keys.has("KeyS") || (pad && pad.y > 0)) me += 6;
      me = Math.max(PH / 2, Math.min(H - PH / 2, me));
      cpu += Math.max(-4.2, Math.min(4.2, ball.y - cpu)) * (ball.vx > 0 ? 1 : 0.35);
      cpu = Math.max(PH / 2, Math.min(H - PH / 2, cpu));
      ball.x += ball.vx; ball.y += ball.vy;
      if (ball.y < 7 || ball.y > H - 7) ball.vy *= -1;
      const paddle = (y: number, side: number) => {
        const hit = (ball.y - y) / (PH / 2);
        const speed = Math.min(11, Math.hypot(ball.vx, ball.vy) * 1.05);
        ball.vx = speed * Math.cos(hit * 0.9) * side; ball.vy = speed * Math.sin(hit * 0.9);
      };
      if (ball.vx < 0 && ball.x < 31 && ball.x > 10 && Math.abs(ball.y - me) < PH / 2 + 7) paddle(me, 1);
      if (ball.vx > 0 && ball.x > W - 31 && ball.x < W - 10 && Math.abs(ball.y - cpu) < PH / 2 + 7) paddle(cpu, -1);
      if (ball.x < -10) { theirs += 1; setScore([mine, theirs]); serve(1); }
      if (ball.x > W + 10) { mine += 1; setScore([mine, theirs]); serve(-1); }
      if (mine >= 7) { report(mine - theirs); setStatus("won"); return false; }
      if (theirs >= 7) { setStatus("lost"); return false; }
      return true;
    };
    const loop = () => {
      if (running && !step()) { draw(); return; }
      if (!running && readPad()?.a) { setStatus("play"); return; }
      draw();
      raf = requestAnimationFrame(loop);
    };
    setScore([0, 0]);
    loop();
    const down = (event: KeyboardEvent) => { if (typing(event)) return; if (event.code.startsWith("Arrow")) event.preventDefault(); keys.add(event.code); };
    const up = (event: KeyboardEvent) => keys.delete(event.code);
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => { cancelAnimationFrame(raf); window.removeEventListener("keydown", down); window.removeEventListener("keyup", up); };
  }, [status, report]);
  return (
    <div className="flex flex-col items-center gap-3">
      <Bar score={`${score[0]} : ${score[1]}`} best={best} label="You : CPU" restart={() => { setStatus("ready"); window.setTimeout(start, 0); }} />
      <div className="relative w-[min(100%,32rem)]">
        <canvas ref={canvas} width={520} height={340} onPointerMove={(event) => { const box = event.currentTarget.getBoundingClientRect(); pointer.current = ((event.clientY - box.top) / box.height) * 340; }} onPointerLeave={() => { pointer.current = null; }} className="w-full touch-none rounded-2xl border border-white/10" />
        {status === "ready" && <Overlay text="Pong" sub="Mouse, touch or arrow keys move your paddle" action={start} />}
        {status === "won" && <Overlay text="You win! 🎉" sub={`${score[0]} : ${score[1]}`} action={start} />}
        {status === "lost" && <Overlay text="The computer wins" sub={`${score[0]} : ${score[1]}`} action={start} />}
      </div>
    </div>
  );
}

export function ArcadeGame({ id }: { id: ArcadeId }) {
  if (id === "flappy") return <FlappyGame />;
  if (id === "blocks") return <BlocksGame />;
  return <PongGame />;
}
