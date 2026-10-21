import { useEffect, useMemo, useRef, useState, type ComponentType } from "react";
import { Check, Copy, Hash, KeyRound, LogIn, MessagesSquare, Send, Users, VolumeX, X } from "lucide-react";
import { NovaTile } from "@/components/nova-shell";

// Chat: live rooms shared by everyone using PRIVATE OS and NOVA OS, plus private rooms joined with a code.
// Messages travel through ntfy.sh, a free public relay: anyone in a room sees them, and the relay
// keeps them for about 12 hours. Nothing here needs an account.

type Icon = ComponentType<{ className?: string }>;
type Message = { id: string; time: number; name: string; text: string; color: string; from: string };
type Room = { id: string; label: string; topic: string; private?: boolean };

const RELAY = "https://ntfy.sh";
const PREFIX = "privateos3";
const MAX_TEXT = 500;
const PUBLIC_ROOMS: Room[] = [
  { id: "general", label: "general", topic: `${PREFIX}-general` },
  { id: "games", label: "games", topic: `${PREFIX}-games` },
  { id: "music", label: "music", topic: `${PREFIX}-music` },
  { id: "help", label: "help", topic: `${PREFIX}-help` },
];
const COLORS = ["#f43f5e", "#f97316", "#eab308", "#22c55e", "#14b8a6", "#0ea5e9", "#6366f1", "#a855f7", "#ec4899"];

export const ChatIcon: Icon = ({ className }) => (
  <NovaTile className={className} from="#8b5cf6" to="#ec4899">
    <MessagesSquare />
  </NovaTile>
);

const read = <T,>(key: string, fallback: T): T => {
  try {
    const value = localStorage.getItem(key);
    return value ? (JSON.parse(value) as T) : fallback;
  } catch {
    return fallback;
  }
};
const write = (key: string, value: unknown) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // storage unavailable
  }
};

const roomCode = (value: string) => value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 32);
const privateRoom = (code: string): Room => ({ id: `code-${code}`, label: code, topic: `${PREFIX}-room-${code}`, private: true });

function myId() {
  const saved = read<string>("pos-chat-id", "");
  if (saved) return saved;
  const id = Math.random().toString(36).slice(2, 10);
  write("pos-chat-id", id);
  return id;
}

function parse(raw: string): Message | null {
  try {
    const event = JSON.parse(raw) as { id?: string; time?: number; event?: string; message?: string };
    if (event.event !== "message" || !event.id || !event.message) return null;
    const body = JSON.parse(event.message) as { n?: unknown; t?: unknown; c?: unknown; u?: unknown };
    if (typeof body.t !== "string" || !body.t.trim()) return null;
    const name = typeof body.n === "string" && body.n.trim() ? body.n.trim().slice(0, 24) : "Guest";
    const color = typeof body.c === "string" && COLORS.includes(body.c) ? body.c : COLORS[0]!;
    return { id: event.id, time: (event.time ?? Date.now() / 1000) * 1000, name, text: body.t.slice(0, MAX_TEXT), color, from: typeof body.u === "string" ? body.u : "" };
  } catch {
    return null;
  }
}

export function ChatApp({ userName }: { userName: string }) {
  const me = useMemo(myId, []);
  const [name, setName] = useState(() => read<string>("pos-chat-name", "") || userName);
  const [joined, setJoined] = useState(() => Boolean(read<string>("pos-chat-name", "")));
  const [color, setColor] = useState(() => read<string>("pos-chat-color", COLORS[Math.floor(Math.random() * COLORS.length)]!));
  const [codes, setCodes] = useState<string[]>(() => read<string[]>("pos-chat-rooms", []));
  const [roomId, setRoomId] = useState("general");
  const [messages, setMessages] = useState<Message[]>([]);
  const [status, setStatus] = useState<"connecting" | "live" | "offline">("connecting");
  const [draft, setDraft] = useState("");
  const [code, setCode] = useState("");
  const [muted, setMuted] = useState<string[]>(() => read<string[]>("pos-chat-muted", []));
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");
  const list = useRef<HTMLDivElement>(null);
  const rooms = [...PUBLIC_ROOMS, ...codes.map(privateRoom)];
  const room = rooms.find((item) => item.id === roomId) ?? PUBLIC_ROOMS[0]!;

  // One live connection per open room. The relay first replays the last 12 hours, then streams.
  useEffect(() => {
    if (!joined) return;
    setMessages([]);
    setStatus("connecting");
    const source = new EventSource(`${RELAY}/${room.topic}/sse?since=12h`);
    source.onopen = () => setStatus("live");
    source.onerror = () => setStatus(source.readyState === EventSource.CLOSED ? "offline" : "connecting");
    source.onmessage = (event: MessageEvent<string>) => {
      const message = parse(event.data);
      if (!message) return;
      setMessages((current) => (current.some((item) => item.id === message.id) ? current : [...current, message].sort((a, b) => a.time - b.time).slice(-300)));
    };
    return () => source.close();
  }, [joined, room.topic]);

  useEffect(() => {
    list.current?.scrollTo({ top: list.current.scrollHeight, behavior: "smooth" });
  }, [messages.length, roomId]);

  const join = () => {
    const clean = name.trim().slice(0, 24);
    if (!clean) return;
    setName(clean);
    write("pos-chat-name", clean);
    write("pos-chat-color", color);
    setJoined(true);
  };

  const send = async () => {
    const text = draft.trim().slice(0, MAX_TEXT);
    if (!text) return;
    setDraft("");
    setError("");
    try {
      const response = await fetch(`${RELAY}/${room.topic}`, { method: "POST", body: JSON.stringify({ n: name, t: text, c: color, u: me }) });
      if (response.status === 429) setError("Slow down a little: the chat relay limits how fast messages can be sent.");
      else if (!response.ok) setError("That message didn't send. Try again.");
    } catch {
      setDraft(text);
      setError("No connection to the chat relay. Check your internet and try again.");
    }
  };

  const addCode = (value: string) => {
    const clean = roomCode(value);
    if (clean.length < 3) return setError("Room codes need at least 3 letters or numbers.");
    const next = codes.includes(clean) ? codes : [...codes, clean];
    setCodes(next);
    write("pos-chat-rooms", next);
    setRoomId(`code-${clean}`);
    setCode("");
    setError("");
  };
  const newCode = () => addCode(`${["sun", "moon", "nova", "pixel", "comet", "orbit"][Math.floor(Math.random() * 6)]}-${Math.random().toString(36).slice(2, 7)}`);
  const leave = (target: Room) => {
    const next = codes.filter((item) => `code-${item}` !== target.id);
    setCodes(next);
    write("pos-chat-rooms", next);
    setRoomId("general");
  };
  const mute = (from: string) => {
    const next = [...muted, from];
    setMuted(next);
    write("pos-chat-muted", next);
  };
  const shown = messages.filter((message) => !message.from || !muted.includes(message.from));
  const people = new Set(messages.filter((message) => Date.now() - message.time < 3_600_000).map((message) => message.from || message.name)).size;

  if (!joined) {
    return (
      <div className="chat-root grid min-h-0 flex-1 place-items-center overflow-y-auto p-6 text-white">
        <div className="w-full max-w-sm text-center">
          <ChatIcon className="mx-auto !size-16" />
          <h2 className="mt-4 text-2xl font-semibold tracking-tight">Chat with everyone</h2>
          <p className="mt-2 text-[13px] leading-relaxed text-white/60">Talk live with other people using PRIVATE OS and NOVA OS, or make a private room and share its code with friends.</p>
          <label className="mt-6 block text-left text-[11px] font-semibold uppercase tracking-[.16em] text-white/50" htmlFor="chat-name">Your name</label>
          <input id="chat-name" value={name} maxLength={24} onChange={(event) => setName(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") join(); }} placeholder="Pick a name" className="chat-input mt-1.5 w-full" />
          <div className="mt-3 flex justify-center gap-1.5" role="radiogroup" aria-label="Your colour">
            {COLORS.map((item) => (
              <button key={item} type="button" role="radio" aria-checked={color === item} aria-label={`Colour ${item}`} onClick={() => setColor(item)} className={`grid size-7 place-items-center rounded-full transition-transform ${color === item ? "scale-110 ring-2 ring-white" : "hover:scale-105"}`} style={{ background: item }}>{color === item && <Check className="size-3.5" />}</button>
            ))}
          </div>
          <button type="button" disabled={!name.trim()} onClick={join} className="chat-send mt-6 flex w-full items-center justify-center gap-2 rounded-full py-2.5 text-[13px] font-semibold disabled:opacity-40"><LogIn className="size-4" />Join the chat</button>
          <p className="mt-4 text-[11px] leading-relaxed text-white/45">Rooms are public and anyone can read them. Don't share passwords, your address or other personal details. Messages disappear after about 12 hours.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="chat-root flex min-h-0 flex-1 text-white">
      <aside className="chat-side hidden w-56 shrink-0 flex-col p-3 sm:flex">
        <p className="px-2 pb-1.5 pt-1 text-[10.5px] font-semibold uppercase tracking-[.18em] text-white/45">Public rooms</p>
        {PUBLIC_ROOMS.map((item) => (
          <button key={item.id} type="button" onClick={() => setRoomId(item.id)} className={`chat-room ${item.id === room.id ? "is-on" : ""}`}><Hash className="size-4 opacity-70" />{item.label}</button>
        ))}
        <p className="mt-4 px-2 pb-1.5 text-[10.5px] font-semibold uppercase tracking-[.18em] text-white/45">Private rooms</p>
        {codes.map((item) => {
          const target = privateRoom(item);
          return (
            <div key={item} className={`chat-room group ${target.id === room.id ? "is-on" : ""}`}>
              <button type="button" onClick={() => setRoomId(target.id)} className="flex min-w-0 flex-1 items-center gap-2 text-left"><KeyRound className="size-4 shrink-0 opacity-70" /><span className="truncate">{item}</span></button>
              <button type="button" aria-label={`Leave ${item}`} onClick={() => leave(target)} className="grid size-5 place-items-center rounded-full opacity-0 hover:bg-white/15 group-hover:opacity-100"><X className="size-3" /></button>
            </div>
          );
        })}
        <form onSubmit={(event) => { event.preventDefault(); addCode(code); }} className="mt-1.5 flex gap-1">
          <input aria-label="Room code" value={code} onChange={(event) => setCode(event.target.value)} placeholder="Enter a code" className="chat-input min-w-0 flex-1 !py-1.5 !text-[12px]" />
          <button type="submit" className="rounded-lg bg-white/10 px-2 text-[12px] hover:bg-white/15">Join</button>
        </form>
        <button type="button" onClick={newCode} className="mt-1.5 rounded-lg px-2 py-1.5 text-left text-[12px] text-white/70 hover:bg-white/[.07] hover:text-white">+ New private room</button>
        <div className="mt-auto flex items-center gap-2 rounded-xl bg-white/[.05] p-2">
          <span className="grid size-8 shrink-0 place-items-center rounded-full text-[13px] font-bold" style={{ background: color }}>{name.slice(0, 1).toUpperCase()}</span>
          <span className="min-w-0 flex-1"><span className="block truncate text-[12.5px] font-medium">{name}</span><button type="button" onClick={() => setJoined(false)} className="text-[11px] text-white/50 hover:text-white">Change name</button></span>
        </div>
      </aside>

      <section className="flex min-w-0 flex-1 flex-col">
        <header className="chat-head flex items-center gap-3 px-4 py-3">
          <select aria-label="Room" value={room.id} onChange={(event) => setRoomId(event.target.value)} className="chat-input !w-auto !py-1 sm:hidden">
            {rooms.map((item) => <option key={item.id} value={item.id}>{item.private ? "🔑 " : "#"}{item.label}</option>)}
          </select>
          <div className="hidden min-w-0 sm:block">
            <h2 className="flex items-center gap-1.5 truncate text-[15px] font-semibold">{room.private ? <KeyRound className="size-4 text-white/60" /> : <Hash className="size-4 text-white/60" />}{room.label}</h2>
            <p className="text-[11px] text-white/50">{room.private ? "Private room: only people with the code can join" : "Public room for everyone on PRIVATE OS and NOVA OS"}</p>
          </div>
          <span className="ml-auto flex items-center gap-1.5 text-[11.5px] text-white/60"><Users className="size-3.5" />{people} active</span>
          <span className={`flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] ${status === "live" ? "bg-emerald-400/15 text-emerald-300" : status === "offline" ? "bg-rose-400/15 text-rose-300" : "bg-white/10 text-white/60"}`}><span className={`size-1.5 rounded-full ${status === "live" ? "bg-emerald-400" : status === "offline" ? "bg-rose-400" : "animate-pulse bg-white/60"}`} />{status === "live" ? "Live" : status === "offline" ? "Offline" : "Connecting"}</span>
          {room.private && <button type="button" onClick={() => { void navigator.clipboard?.writeText(room.label).then(() => { setCopied(true); window.setTimeout(() => setCopied(false), 1500); }); }} className="flex items-center gap-1 rounded-full bg-white/10 px-2.5 py-1 text-[11.5px] hover:bg-white/15">{copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}{copied ? "Copied" : "Copy code"}</button>}
        </header>

        <div ref={list} className="min-h-0 flex-1 space-y-1 overflow-y-auto px-4 py-3">
          {shown.length === 0 && (
            <div className="grid h-full place-items-center text-center text-[13px] text-white/50">
              <div><MessagesSquare className="mx-auto mb-2 size-8 opacity-50" />{status === "live" ? (room.private ? `Share the code "${room.label}" with a friend and say hi.` : "No messages in the last 12 hours. Say hi!") : "Connecting to the chat…"}</div>
            </div>
          )}
          {shown.map((message, index) => {
            const mine = message.from === me;
            const previous = shown[index - 1];
            const grouped = previous && previous.from === message.from && previous.name === message.name && message.time - previous.time < 120_000;
            return (
              <div key={message.id} className={`group flex gap-2.5 ${mine ? "flex-row-reverse" : ""} ${grouped ? "" : "pt-2"}`}>
                <span className={`grid size-8 shrink-0 place-items-center rounded-full text-[12px] font-bold ${grouped ? "invisible" : ""}`} style={{ background: message.color }}>{message.name.slice(0, 1).toUpperCase()}</span>
                <div className={`flex min-w-0 max-w-[75%] flex-col ${mine ? "items-end" : "items-start"}`}>
                  {!grouped && <span className="mb-0.5 flex items-baseline gap-2 text-[11px]"><span className="font-semibold" style={{ color: message.color }}>{mine ? "You" : message.name}</span><span className="text-white/40">{new Date(message.time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span></span>}
                  <span className={`chat-bubble ${mine ? "is-mine" : ""}`}>{message.text}</span>
                </div>
                {!mine && message.from && <button type="button" aria-label={`Mute ${message.name}`} title={`Hide messages from ${message.name}`} onClick={() => mute(message.from)} className="self-center rounded-full p-1 text-white/40 opacity-0 hover:bg-white/10 hover:text-white group-hover:opacity-100"><VolumeX className="size-3.5" /></button>}
              </div>
            );
          })}
        </div>

        {error && <p className="mx-4 mb-1 rounded-lg bg-rose-500/15 px-3 py-1.5 text-[12px] text-rose-200">{error}</p>}
        <form onSubmit={(event) => { event.preventDefault(); void send(); }} className="chat-compose flex items-center gap-2 p-3">
          <input aria-label="Message" value={draft} maxLength={MAX_TEXT} onChange={(event) => setDraft(event.target.value)} placeholder={`Message ${room.private ? room.label : `#${room.label}`}`} className="chat-input min-w-0 flex-1" />
          <button type="submit" aria-label="Send" disabled={!draft.trim()} className="chat-send grid size-10 shrink-0 place-items-center rounded-full disabled:opacity-40"><Send className="size-4" /></button>
        </form>
      </section>
    </div>
  );
}
