import { useCallback, useEffect, useRef, useState } from "react";
import { RotateCcw } from "lucide-react";

// Built-in games: they run inside the Games window, offline, with no external site.

export type MiniGameId = "snake" | "2048" | "tictactoe" | "minesweeper" | "memory" | "breakout";

export const MINI_GAMES: { id: MiniGameId; name: string; sub: string; emoji: string; tone: string }[] = [
  { id: "snake", name: "Snake", sub: "Eat, grow, don't bite your tail", emoji: "🐍", tone: "from-emerald-400 to-green-700" },
  { id: "2048", name: "2048", sub: "Slide and merge the tiles", emoji: "🔢", tone: "from-amber-300 to-orange-600" },
  { id: "breakout", name: "Breakout", sub: "Bounce the ball, break the bricks", emoji: "🧱", tone: "from-sky-400 to-indigo-700" },
  { id: "minesweeper", name: "Minesweeper", sub: "Clear the field without a boom", emoji: "💣", tone: "from-slate-300 to-slate-600" },
  { id: "memory", name: "Memory", sub: "Find every matching pair", emoji: "🃏", tone: "from-fuchsia-400 to-purple-700" },
  { id: "tictactoe", name: "Tic-Tac-Toe", sub: "Beat the computer", emoji: "⭕", tone: "from-rose-400 to-red-700" },
];

// Keys typed into a text field elsewhere should not move the game.
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

function Bar({ score, best, label = "Score", restart, extra }: { score: number | string; best?: number; label?: string; restart: () => void; extra?: string | undefined }) {
  return (
    <div className="flex w-full items-center justify-between gap-2 text-xs">
      <div className="flex gap-2">
        <span className="rounded-lg bg-white/10 px-3 py-1.5"><span className="text-white/50">{label} </span><b>{score}</b></span>
        {best !== undefined && <span className="rounded-lg bg-white/10 px-3 py-1.5"><span className="text-white/50">Best </span><b>{best}</b></span>}
        {extra && <span className="rounded-lg bg-white/10 px-3 py-1.5 text-white/70">{extra}</span>}
      </div>
      <button type="button" onClick={restart} className="flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 font-semibold text-primary-foreground transition-transform active:scale-95"><RotateCcw className="size-3.5" />New game</button>
    </div>
  );
}

function Overlay({ text, sub, action }: { text: string; sub?: string; action: () => void }) {
  return (
    <div className="absolute inset-0 z-10 grid place-items-center rounded-2xl bg-black/60 backdrop-blur-sm [animation:window-in_.25s_cubic-bezier(.22,1,.36,1)]">
      <div className="text-center">
        <p className="text-2xl font-bold">{text}</p>
        {sub && <p className="mt-1 text-xs text-white/60">{sub}</p>}
        <button type="button" onClick={action} className="mt-4 rounded-full bg-primary px-5 py-2 text-xs font-semibold text-primary-foreground">Play again</button>
      </div>
    </div>
  );
}

/* ---------- Snake ---------- */
const SN = 18;
function SnakeGame() {
  const [best, report] = useBest("snake");
  const [state, setState] = useState(() => freshSnake());
  const dir = useRef({ x: 1, y: 0 });
  const queued = useRef<{ x: number; y: number }[]>([]);
  function freshSnake() {
    return { body: [{ x: 6, y: 9 }, { x: 5, y: 9 }, { x: 4, y: 9 }], food: { x: 12, y: 9 }, over: false, started: false, score: 0 };
  }
  const restart = () => { dir.current = { x: 1, y: 0 }; queued.current = []; setState({ ...freshSnake(), started: true }); };
  const turn = (x: number, y: number) => {
    const last = queued.current[queued.current.length - 1] ?? dir.current;
    if (last.x === -x && last.y === -y) return;
    if (last.x === x && last.y === y) return;
    if (queued.current.length < 3) queued.current.push({ x, y });
    setState((s) => (s.started ? s : { ...s, started: true }));
  };
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const map: Record<string, [number, number]> = { ArrowUp: [0, -1], ArrowDown: [0, 1], ArrowLeft: [-1, 0], ArrowRight: [1, 0], w: [0, -1], s: [0, 1], a: [-1, 0], d: [1, 0] };
      const move = map[event.key];
      if (!move || typing(event)) return;
      event.preventDefault();
      turn(move[0], move[1]);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);
  useEffect(() => {
    if (!state.started || state.over) return;
    const speed = Math.max(70, 140 - state.score * 3);
    const timer = window.setTimeout(() => {
      setState((s) => {
        if (queued.current.length) dir.current = queued.current.shift()!;
        const head = { x: s.body[0]!.x + dir.current.x, y: s.body[0]!.y + dir.current.y };
        const hit = head.x < 0 || head.y < 0 || head.x >= SN || head.y >= SN || s.body.some((part) => part.x === head.x && part.y === head.y);
        if (hit) { report(s.score); return { ...s, over: true }; }
        const ate = head.x === s.food.x && head.y === s.food.y;
        const body = [head, ...s.body];
        if (!ate) body.pop();
        let food = s.food;
        if (ate) {
          do food = { x: Math.floor(Math.random() * SN), y: Math.floor(Math.random() * SN) };
          while (body.some((part) => part.x === food.x && part.y === food.y));
        }
        return { ...s, body, food, score: s.score + (ate ? 1 : 0) };
      });
    }, speed);
    return () => window.clearTimeout(timer);
  }, [state, report]);
  const touch = useRef<{ x: number; y: number } | null>(null);
  return (
    <div className="flex flex-col items-center gap-3">
      <Bar score={state.score} best={best} restart={restart} />
      <div
        onPointerDown={(event) => { touch.current = { x: event.clientX, y: event.clientY }; }}
        onPointerUp={(event) => {
          const start = touch.current;
          if (!start) return;
          const dx = event.clientX - start.x, dy = event.clientY - start.y;
          if (Math.max(Math.abs(dx), Math.abs(dy)) < 20) return;
          if (Math.abs(dx) > Math.abs(dy)) turn(Math.sign(dx), 0); else turn(0, Math.sign(dy));
        }}
        className="relative aspect-square w-[min(100%,26rem)] touch-none rounded-2xl border border-white/10 bg-[#0b1a10]"
        style={{ backgroundImage: "linear-gradient(rgb(255 255 255/.03) 1px,transparent 1px),linear-gradient(90deg,rgb(255 255 255/.03) 1px,transparent 1px)", backgroundSize: `${100 / SN}% ${100 / SN}%` }}
      >
        {state.body.map((part, i) => (
          <span key={i} className="absolute rounded-[30%] bg-emerald-400 transition-[left,top] duration-75 ease-linear" style={{ left: `${(part.x / SN) * 100}%`, top: `${(part.y / SN) * 100}%`, width: `${100 / SN}%`, height: `${100 / SN}%`, opacity: 1 - (i / state.body.length) * 0.45, transform: "scale(.9)", boxShadow: i === 0 ? "0 0 12px rgb(52 211 153/.7)" : undefined }} />
        ))}
        <span className="absolute animate-pulse rounded-full bg-rose-400 shadow-[0_0_12px_rgb(251_113_133/.8)]" style={{ left: `${(state.food.x / SN) * 100}%`, top: `${(state.food.y / SN) * 100}%`, width: `${100 / SN}%`, height: `${100 / SN}%`, transform: "scale(.75)" }} />
        {!state.started && !state.over && <Overlay text="Snake" sub="Arrow keys, WASD or swipe" action={restart} />}
        {state.over && <Overlay text="Game over" sub={`You ate ${state.score}`} action={restart} />}
      </div>
    </div>
  );
}

/* ---------- 2048 ---------- */
type Board = number[];
const TILE: Record<number, string> = { 2: "bg-[#eee4da] text-[#776e65]", 4: "bg-[#ede0c8] text-[#776e65]", 8: "bg-[#f2b179] text-white", 16: "bg-[#f59563] text-white", 32: "bg-[#f67c5f] text-white", 64: "bg-[#f65e3b] text-white", 128: "bg-[#edcf72] text-white", 256: "bg-[#edcc61] text-white", 512: "bg-[#edc850] text-white", 1024: "bg-[#edc53f] text-white", 2048: "bg-[#edc22e] text-white" };
function addTile(board: Board): Board {
  const empty = board.flatMap((v, i) => (v ? [] : [i]));
  if (!empty.length) return board;
  const next = [...board];
  next[empty[Math.floor(Math.random() * empty.length)]!] = Math.random() < 0.9 ? 2 : 4;
  return next;
}
function slide(board: Board, direction: "left" | "right" | "up" | "down") {
  const next = Array<number>(16).fill(0);
  let gained = 0;
  for (let line = 0; line < 4; line++) {
    const idx = [0, 1, 2, 3].map((k) => {
      if (direction === "left") return line * 4 + k;
      if (direction === "right") return line * 4 + (3 - k);
      if (direction === "up") return k * 4 + line;
      return (3 - k) * 4 + line;
    });
    const values = idx.map((i) => board[i]!).filter(Boolean);
    const merged: number[] = [];
    for (let k = 0; k < values.length; k++) {
      if (values[k] === values[k + 1]) { merged.push(values[k]! * 2); gained += values[k]! * 2; k++; } else merged.push(values[k]!);
    }
    idx.forEach((i, k) => { next[i] = merged[k] ?? 0; });
  }
  return { board: next, gained, moved: next.some((v, i) => v !== board[i]) };
}
function Game2048() {
  const [best, report] = useBest("2048");
  const fresh = () => ({ board: addTile(addTile(Array<number>(16).fill(0))), score: 0, over: false, won: false });
  const [state, setState] = useState(fresh);
  const move = useCallback((direction: "left" | "right" | "up" | "down") => {
    setState((s) => {
      if (s.over) return s;
      const result = slide(s.board, direction);
      if (!result.moved) return s;
      const board = addTile(result.board);
      const score = s.score + result.gained;
      const over = (["left", "right", "up", "down"] as const).every((d) => !slide(board, d).moved);
      if (over) report(score);
      return { board, score, over, won: s.won || board.includes(2048) };
    });
  }, [report]);
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const map: Record<string, "left" | "right" | "up" | "down"> = { ArrowLeft: "left", ArrowRight: "right", ArrowUp: "up", ArrowDown: "down", a: "left", d: "right", w: "up", s: "down" };
      const d = map[event.key];
      if (!d || typing(event)) return;
      event.preventDefault();
      move(d);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [move]);
  useEffect(() => { report(state.score); }, [state.score, report]);
  const touch = useRef<{ x: number; y: number } | null>(null);
  return (
    <div className="flex flex-col items-center gap-3">
      <Bar score={state.score} best={best} restart={() => setState(fresh())} />
      <div
        onPointerDown={(event) => { touch.current = { x: event.clientX, y: event.clientY }; }}
        onPointerUp={(event) => {
          const start = touch.current;
          if (!start) return;
          const dx = event.clientX - start.x, dy = event.clientY - start.y;
          if (Math.max(Math.abs(dx), Math.abs(dy)) < 20) return;
          move(Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? "right" : "left") : dy > 0 ? "down" : "up");
        }}
        className="relative grid aspect-square w-[min(100%,24rem)] touch-none grid-cols-4 gap-2 rounded-2xl bg-[#bbada0] p-2"
      >
        {state.board.map((value, i) => (
          <div key={`${i}-${value}`} className={`grid place-items-center rounded-lg font-bold ${value ? `${TILE[value] ?? "bg-[#3c3a32] text-white"} [animation:tile-pop_.18s_ease-out]` : "bg-[#cdc1b4]"} ${value >= 1024 ? "text-xl" : value >= 128 ? "text-2xl" : "text-3xl"}`}>{value || ""}</div>
        ))}
        {state.over && <Overlay text="No more moves" sub={`Score ${state.score}`} action={() => setState(fresh())} />}
      </div>
      <p className="text-[11px] text-white/50">Arrow keys or swipe. Reach 2048{state.won ? " ✓" : ""}.</p>
    </div>
  );
}

/* ---------- Tic-Tac-Toe ---------- */
const LINES = [[0, 1, 2], [3, 4, 5], [6, 7, 8], [0, 3, 6], [1, 4, 7], [2, 5, 8], [0, 4, 8], [2, 4, 6]];
const winner = (b: string[]) => LINES.find(([a, c, d]) => b[a!] && b[a!] === b[c!] && b[a!] === b[d!]);
function minimax(b: string[], ai: boolean): number {
  const w = winner(b);
  if (w) return b[w[0]!] === "O" ? 10 : -10;
  if (b.every(Boolean)) return 0;
  const scores = b.flatMap((v, i) => (v ? [] : [minimax(b.map((x, k) => (k === i ? (ai ? "O" : "X") : x)), !ai)]));
  return ai ? Math.max(...scores) : Math.min(...scores);
}
function TicTacToe() {
  const [board, setBoard] = useState<string[]>(Array(9).fill(""));
  const [tally, setTally] = useState({ you: 0, cpu: 0, draw: 0 });
  const line = winner(board);
  const done = Boolean(line) || board.every(Boolean);
  const play = (i: number) => {
    if (board[i] || done) return;
    const mine = board.map((v, k) => (k === i ? "X" : v));
    if (winner(mine) || mine.every(Boolean)) return finish(mine);
    const options = mine.flatMap((v, k) => (v ? [] : [k]));
    // A little randomness so it is beatable now and then.
    const pick = Math.random() < 0.15 ? options[Math.floor(Math.random() * options.length)]! : options.reduce((bestK, k) => (minimax(mine.map((x, n) => (n === k ? "O" : x)), false) > minimax(mine.map((x, n) => (n === bestK ? "O" : x)), false) ? k : bestK), options[0]!);
    window.setTimeout(() => finish(mine.map((v, k) => (k === pick ? "O" : v))), 0);
    setBoard(mine);
  };
  const finish = (b: string[]) => {
    setBoard(b);
    const w = winner(b);
    if (w) setTally((t) => (b[w[0]!] === "X" ? { ...t, you: t.you + 1 } : { ...t, cpu: t.cpu + 1 }));
    else if (b.every(Boolean)) setTally((t) => ({ ...t, draw: t.draw + 1 }));
  };
  const status = line ? (board[line[0]!] === "X" ? "You win! 🎉" : "Computer wins") : board.every(Boolean) ? "Draw" : "Your turn (X)";
  return (
    <div className="flex flex-col items-center gap-3">
      <Bar score={`${tally.you} – ${tally.cpu}`} label="You vs CPU" extra={`${tally.draw} draws`} restart={() => setBoard(Array(9).fill(""))} />
      <p className="text-sm font-semibold">{status}</p>
      <div className="grid w-[min(100%,20rem)] grid-cols-3 gap-2">
        {board.map((value, i) => (
          <button key={i} type="button" aria-label={`Square ${i + 1}${value ? ` ${value}` : ""}`} onClick={() => play(i)} className={`grid aspect-square place-items-center rounded-2xl border border-white/10 text-5xl font-black transition-colors ${line?.includes(i) ? "bg-primary/30" : "bg-white/5 hover:bg-white/10"}`}>
            {value && <span className={`[animation:tile-pop_.2s_ease-out] ${value === "X" ? "text-sky-300" : "text-rose-300"}`}>{value === "X" ? "✕" : "◯"}</span>}
          </button>
        ))}
      </div>
    </div>
  );
}

/* ---------- Minesweeper ---------- */
const MW = 10, MH = 10, MINES = 14;
type Cell = { mine: boolean; open: boolean; flag: boolean; near: number };
function Minesweeper() {
  const [best, report] = useBest("minesweeper-fast");
  const empty = () => Array.from({ length: MW * MH }, (): Cell => ({ mine: false, open: false, flag: false, near: 0 }));
  const [cells, setCells] = useState<Cell[]>(empty);
  const [state, setState] = useState<"ready" | "play" | "lost" | "won">("ready");
  const [flagMode, setFlagMode] = useState(false);
  const [started, setStarted] = useState(0);
  const [now, setNow] = useState(0);
  useEffect(() => {
    if (state !== "play") return;
    const t = window.setInterval(() => setNow(Date.now()), 500);
    return () => window.clearInterval(t);
  }, [state]);
  const around = (i: number) => {
    const x = i % MW, y = Math.floor(i / MW), out: number[] = [];
    for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
      const nx = x + dx, ny = y + dy;
      if ((dx || dy) && nx >= 0 && ny >= 0 && nx < MW && ny < MH) out.push(ny * MW + nx);
    }
    return out;
  };
  const restart = () => { setCells(empty()); setState("ready"); setNow(0); };
  const reveal = (i: number) => {
    if (state === "lost" || state === "won") return;
    let board = cells.map((c) => ({ ...c }));
    if (state === "ready") {
      const safe = new Set([i, ...around(i)]);
      let placed = 0;
      while (placed < MINES) {
        const k = Math.floor(Math.random() * MW * MH);
        if (safe.has(k) || board[k]!.mine) continue;
        board[k]!.mine = true;
        placed++;
      }
      board.forEach((c, k) => { c.near = around(k).filter((n) => board[n]!.mine).length; });
      setState("play");
      setStarted(Date.now());
      setNow(Date.now());
    }
    const cell = board[i]!;
    if (flagMode && state !== "ready") { if (!cell.open) cell.flag = !cell.flag; setCells(board); return; }
    if (cell.flag || cell.open) return;
    if (cell.mine) {
      board = board.map((c) => (c.mine ? { ...c, open: true } : c));
      setCells(board);
      setState("lost");
      return;
    }
    const stack = [i];
    while (stack.length) {
      const k = stack.pop()!;
      const c = board[k]!;
      if (c.open || c.flag) continue;
      c.open = true;
      if (c.near === 0) stack.push(...around(k));
    }
    setCells(board);
    if (board.every((c) => c.mine || c.open)) {
      setState("won");
      const secs = Math.max(1, Math.round((Date.now() - (state === "ready" ? Date.now() : started)) / 1000));
      report(1000 - Math.min(999, secs));
    }
  };
  const flag = (i: number) => {
    if (state !== "play") return;
    setCells((list) => list.map((c, k) => (k === i && !c.open ? { ...c, flag: !c.flag } : c)));
  };
  const seconds = state === "ready" ? 0 : Math.round(((state === "play" ? now : now || Date.now()) - started) / 1000);
  const NUM = ["", "text-sky-300", "text-emerald-300", "text-rose-300", "text-violet-300", "text-amber-300", "text-cyan-300", "text-white", "text-white"];
  return (
    <div className="flex flex-col items-center gap-3">
      <Bar score={`${MINES - cells.filter((c) => c.flag).length} 💣`} label="Left" extra={`${Math.max(0, seconds)}s${best ? ` · best ${1000 - best}s` : ""}`} restart={restart} />
      <button type="button" aria-pressed={flagMode} onClick={() => setFlagMode((v) => !v)} className={`rounded-full px-3 py-1 text-[11px] font-semibold ${flagMode ? "bg-amber-400 text-black" : "bg-white/10"}`}>🚩 Flag mode {flagMode ? "on" : "off"} · or right-click</button>
      <div className="relative grid w-[min(100%,24rem)] gap-1 rounded-2xl bg-white/5 p-2" style={{ gridTemplateColumns: `repeat(${MW}, minmax(0, 1fr))` }}>
        {cells.map((c, i) => (
          <button key={i} type="button" aria-label={`Cell ${i + 1}`} onClick={() => reveal(i)} onContextMenu={(event) => { event.preventDefault(); event.stopPropagation(); flag(i); }} className={`grid aspect-square place-items-center rounded-md text-sm font-bold transition-colors ${c.open ? (c.mine ? "bg-rose-500/70" : "bg-white/[.04]") : "bg-white/15 hover:bg-white/25"}`}>
            {c.open ? (c.mine ? "💣" : <span className={NUM[c.near]}>{c.near || ""}</span>) : c.flag ? "🚩" : ""}
          </button>
        ))}
        {state === "lost" && <Overlay text="Boom 💥" sub="Try another field" action={restart} />}
        {state === "won" && <Overlay text="Field cleared! 🎉" sub={`${seconds}s`} action={restart} />}
      </div>
    </div>
  );
}

/* ---------- Memory ---------- */
const FACES = ["🍒", "🚀", "🎧", "🌙", "🦊", "🍩", "⚡", "🎲"];
function MemoryGame() {
  const [best, report] = useBest("memory");
  const deal = () => [...FACES, ...FACES].map((face, i) => ({ face, id: i, r: Math.random() })).sort((a, b) => a.r - b.r);
  const [deck, setDeck] = useState(deal);
  const [up, setUp] = useState<number[]>([]);
  const [found, setFound] = useState<string[]>([]);
  const [moves, setMoves] = useState(0);
  const won = found.length === FACES.length;
  const restart = () => { setDeck(deal()); setUp([]); setFound([]); setMoves(0); };
  const flip = (i: number) => {
    if (up.length === 2 || up.includes(i) || found.includes(deck[i]!.face)) return;
    const next = [...up, i];
    setUp(next);
    if (next.length < 2) return;
    setMoves((m) => m + 1);
    const [a, b] = next;
    if (deck[a!]!.face === deck[b!]!.face) {
      const nowFound = [...found, deck[a!]!.face];
      setFound(nowFound);
      setUp([]);
      if (nowFound.length === FACES.length) report(Math.max(1, 100 - moves - 1));
    } else window.setTimeout(() => setUp([]), 750);
  };
  return (
    <div className="flex flex-col items-center gap-3">
      <Bar score={moves} label="Moves" extra={best ? `Best ${100 - best} moves` : undefined} restart={restart} />
      <div className="relative grid w-[min(100%,24rem)] grid-cols-4 gap-2">
        {deck.map((card, i) => {
          const shown = up.includes(i) || found.includes(card.face);
          return (
            <button key={card.id} type="button" aria-label={shown ? card.face : "Hidden card"} onClick={() => flip(i)} className="aspect-square [perspective:600px]">
              <span className={`relative block size-full transition-transform duration-300 [transform-style:preserve-3d] ${shown ? "[transform:rotateY(180deg)]" : ""}`}>
                <span className="absolute inset-0 grid place-items-center rounded-xl border border-white/10 bg-gradient-to-br from-primary/60 to-primary/20 text-xl [backface-visibility:hidden]">✦</span>
                <span className={`absolute inset-0 grid place-items-center rounded-xl border border-white/10 text-3xl [backface-visibility:hidden] [transform:rotateY(180deg)] ${found.includes(card.face) ? "bg-emerald-500/25" : "bg-white/10"}`}>{card.face}</span>
              </span>
            </button>
          );
        })}
        {won && <Overlay text="All pairs found! 🎉" sub={`${moves} moves`} action={restart} />}
      </div>
    </div>
  );
}

/* ---------- Breakout ---------- */
function Breakout() {
  const [best, report] = useBest("breakout");
  const canvas = useRef<HTMLCanvasElement>(null);
  const [score, setScore] = useState(0);
  const [status, setStatus] = useState<"ready" | "play" | "over" | "won">("ready");
  const [round, setRound] = useState(0);
  const paddleX = useRef(0.5);
  useEffect(() => {
    const el = canvas.current;
    const ctx = el?.getContext("2d");
    if (!el || !ctx) return;
    const W = 480, H = 360, cols = 8, rows = 5, bw = W / cols, bh = 18;
    const colors = ["#f43f5e", "#fb923c", "#facc15", "#4ade80", "#38bdf8"];
    const bricks = Array.from({ length: rows * cols }, (_, i) => ({ x: (i % cols) * bw, y: 40 + Math.floor(i / cols) * (bh + 4), alive: true, c: colors[Math.floor(i / cols)]! }));
    const ball = { x: W / 2, y: H - 60, vx: 3.2, vy: -3.6, r: 7 };
    let points = 0, lives = 3, raf = 0, running = status === "play";
    const pw = 84;
    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      bricks.forEach((b) => { if (!b.alive) return; ctx.fillStyle = b.c; ctx.beginPath(); ctx.roundRect(b.x + 3, b.y, bw - 6, bh, 5); ctx.fill(); });
      const px = paddleX.current * (W - pw);
      ctx.fillStyle = "#e2e8f0"; ctx.beginPath(); ctx.roundRect(px, H - 22, pw, 10, 5); ctx.fill();
      ctx.fillStyle = "#fff"; ctx.shadowColor = "#fff"; ctx.shadowBlur = 12; ctx.beginPath(); ctx.arc(ball.x, ball.y, ball.r, 0, Math.PI * 2); ctx.fill(); ctx.shadowBlur = 0;
      ctx.fillStyle = "rgba(255,255,255,.6)"; ctx.font = "12px sans-serif"; ctx.fillText("♥".repeat(lives), 10, 20);
    };
    const step = () => {
      ball.x += ball.vx; ball.y += ball.vy;
      if (ball.x < ball.r || ball.x > W - ball.r) ball.vx *= -1;
      if (ball.y < ball.r) ball.vy *= -1;
      const px = paddleX.current * (W - pw);
      if (ball.vy > 0 && ball.y > H - 22 - ball.r && ball.y < H - 10 && ball.x > px - 4 && ball.x < px + pw + 4) {
        const hit = (ball.x - (px + pw / 2)) / (pw / 2);
        const speed = Math.min(7, Math.hypot(ball.vx, ball.vy) * 1.02);
        ball.vx = speed * Math.sin(hit * 1.05); ball.vy = -Math.abs(speed * Math.cos(hit * 1.05));
      }
      for (const b of bricks) {
        if (b.alive && ball.x > b.x && ball.x < b.x + bw && ball.y - ball.r < b.y + bh && ball.y + ball.r > b.y) { b.alive = false; ball.vy *= -1; points += 10; setScore(points); break; }
      }
      if (ball.y > H + 10) {
        lives -= 1;
        if (lives <= 0) { running = false; report(points); setStatus("over"); }
        else Object.assign(ball, { x: W / 2, y: H - 60, vx: 3.2, vy: -3.6 });
      }
      if (bricks.every((b) => !b.alive)) { running = false; report(points + lives * 50); setStatus("won"); }
    };
    const loop = () => { if (running) step(); draw(); if (running) raf = requestAnimationFrame(loop); };
    setScore(0);
    loop();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "ArrowLeft") paddleX.current = Math.max(0, paddleX.current - 0.06);
      if (event.key === "ArrowRight") paddleX.current = Math.min(1, paddleX.current + 0.06);
    };
    window.addEventListener("keydown", onKey);
    return () => { cancelAnimationFrame(raf); running = false; window.removeEventListener("keydown", onKey); };
  }, [round, status === "play", report]);
  const start = () => { setStatus("play"); setRound((r) => r + 1); };
  return (
    <div className="flex flex-col items-center gap-3">
      <Bar score={score} best={best} restart={start} />
      <div className="relative w-[min(100%,30rem)]">
        <canvas ref={canvas} width={480} height={360} onPointerMove={(event) => { const box = event.currentTarget.getBoundingClientRect(); paddleX.current = Math.min(1, Math.max(0, (event.clientX - box.left - 42 * (box.width / 480)) / (box.width - 84 * (box.width / 480)))); }} className="w-full touch-none rounded-2xl border border-white/10 bg-[#0b1020]" />
        {status === "ready" && <Overlay text="Breakout" sub="Move the mouse or arrow keys" action={start} />}
        {status === "over" && <Overlay text="Game over" sub={`Score ${score}`} action={start} />}
        {status === "won" && <Overlay text="All bricks down! 🎉" sub={`Score ${score}`} action={start} />}
      </div>
    </div>
  );
}

export function MiniGame({ id }: { id: MiniGameId }) {
  if (id === "snake") return <SnakeGame />;
  if (id === "2048") return <Game2048 />;
  if (id === "tictactoe") return <TicTacToe />;
  if (id === "minesweeper") return <Minesweeper />;
  if (id === "memory") return <MemoryGame />;
  return <Breakout />;
}
