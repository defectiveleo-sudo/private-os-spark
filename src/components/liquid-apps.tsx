// macOS-style apps for the Liquid Glass theme: Messages, Mail, Contacts and Maps.
// Everything is stored in this browser (localStorage); nothing is sent to a server.
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Archive,
  ExternalLink,
  Inbox,
  Mail,
  MapPin,
  MessageCircle,
  Pencil,
  Phone,
  Plus,
  Search,
  Send,
  SquarePen,
  Star,
  Trash2,
  UserRound,
} from "lucide-react";

function useStored<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(initial);
  const loaded = useRef(false);
  useEffect(() => {
    try {
      const raw = localStorage.getItem(key);
      if (raw) setValue(JSON.parse(raw) as T);
    } catch {
      // storage unavailable
    }
    loaded.current = true;
  }, [key]);
  useEffect(() => {
    if (!loaded.current) return;
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // storage unavailable
    }
  }, [key, value]);
  return [value, setValue] as const;
}

const initials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]!.toUpperCase())
    .join("") || "?";
const AVATAR_TONES = [
  "from-sky-400 to-blue-600",
  "from-violet-400 to-purple-600",
  "from-emerald-400 to-teal-600",
  "from-amber-400 to-orange-600",
  "from-pink-400 to-rose-600",
];
const toneFor = (name: string) =>
  AVATAR_TONES[[...name].reduce((sum, ch) => sum + ch.charCodeAt(0), 0) % AVATAR_TONES.length]!;

function Avatar({ name, size = "size-9" }: { name: string; size?: string }) {
  return (
    <span
      className={`grid shrink-0 place-items-center rounded-full bg-gradient-to-b text-[11px] font-semibold text-white shadow-inner ${toneFor(name)} ${size}`}
    >
      {initials(name)}
    </span>
  );
}

const sidebar =
  "liquid-sidebar flex w-56 shrink-0 flex-col gap-1 overflow-auto border-r border-white/10 p-2 max-md:w-40";
const searchBox = "flex items-center gap-2 rounded-lg bg-white/10 px-2.5";
const rowBase = "flex w-full items-center gap-2.5 rounded-lg px-2 py-2 text-left";
const rowOn = "bg-[#0a84ff] text-white";
const rowOff = "hover:bg-white/10";
const pillBtn =
  "inline-flex items-center gap-1.5 rounded-full bg-white/12 px-3 py-1.5 text-[11px] font-semibold hover:bg-white/20";

// ---------------- Messages ----------------

type Chat = {
  id: string;
  name: string;
  bot?: boolean;
  messages: { from: "me" | "them"; text: string; at: number }[];
};
const DEFAULT_CHATS: Chat[] = [
  {
    id: "assistant",
    name: "PRIVATE Assistant",
    bot: true,
    messages: [
      {
        from: "them",
        text: "Hi! I'm the PRIVATE OS assistant. Ask me the time, the date, or say hello.",
        at: Date.now(),
      },
    ],
  },
  { id: "me", name: "Notes to self", messages: [] },
];

function botReply(text: string) {
  const t = text.toLowerCase();
  if (/\b(time|heure)\b/.test(t))
    return `It's ${new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}.`;
  if (/\b(date|day|jour)\b/.test(t))
    return `Today is ${new Date().toLocaleDateString(undefined, { weekday: "long", day: "numeric", month: "long" })}.`;
  if (/\b(hi|hello|hey|salut|bonjour)\b/.test(t)) return "Hello! 👋 Nice to see you.";
  if (/\b(thanks|thank you|merci)\b/.test(t)) return "You're welcome! 😊";
  return "Got it. Messages here stay on this device.";
}

export function MessagesContent() {
  const [chats, setChats] = useStored<Chat[]>("pos-messages", DEFAULT_CHATS);
  const [activeId, setActiveId] = useState(DEFAULT_CHATS[0]!.id);
  const [draft, setDraft] = useState("");
  const [query, setQuery] = useState("");
  const end = useRef<HTMLDivElement>(null);
  const active = chats.find((chat) => chat.id === activeId) ?? chats[0];
  useEffect(
    () => end.current?.scrollIntoView({ block: "end" }),
    [active?.messages.length, activeId],
  );

  const push = (id: string, message: Chat["messages"][number]) =>
    setChats((list) =>
      list.map((chat) =>
        chat.id === id ? { ...chat, messages: [...chat.messages, message] } : chat,
      ),
    );
  const send = () => {
    const text = draft.trim();
    if (!text || !active) return;
    push(active.id, { from: "me", text, at: Date.now() });
    setDraft("");
    if (active.bot)
      window.setTimeout(
        () => push(active.id, { from: "them", text: botReply(text), at: Date.now() }),
        700,
      );
  };
  const newChat = () => {
    const name = window.prompt("Who is this conversation with?")?.trim();
    if (!name) return;
    const id = `chat-${Date.now()}`;
    setChats((list) => [{ id, name, messages: [] }, ...list]);
    setActiveId(id);
  };
  const shown = chats.filter((chat) => chat.name.toLowerCase().includes(query.toLowerCase()));

  return (
    <div className="flex min-h-0 flex-1 text-white">
      <aside className={sidebar}>
        <div className="mb-1 flex items-center gap-1.5">
          <label className={`${searchBox} flex-1`}>
            <Search className="size-3.5 text-white/50" />
            <input
              aria-label="Search conversations"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search"
              className="h-7 w-full bg-transparent text-xs outline-none"
            />
          </label>
          <button
            type="button"
            aria-label="New message"
            onClick={newChat}
            className="rounded-lg p-1.5 hover:bg-white/10"
          >
            <SquarePen className="size-4" />
          </button>
        </div>
        {shown.map((chat) => {
          const last = chat.messages[chat.messages.length - 1];
          return (
            <button
              key={chat.id}
              type="button"
              onClick={() => setActiveId(chat.id)}
              className={`${rowBase} ${chat.id === active?.id ? rowOn : rowOff}`}
            >
              <Avatar name={chat.name} />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-xs font-semibold">{chat.name}</span>
                <span className="block truncate text-[10px] opacity-70">
                  {last?.text ?? "No messages yet"}
                </span>
              </span>
            </button>
          );
        })}
      </aside>
      {active && (
        <section className="flex min-w-0 flex-1 flex-col">
          <header className="flex items-center justify-center gap-2 border-b border-white/10 py-2">
            <Avatar name={active.name} size="size-7" />
            <span className="text-xs font-semibold">{active.name}</span>
          </header>
          <div className="flex-1 space-y-1.5 overflow-auto p-4">
            {active.messages.length === 0 && (
              <p className="pt-10 text-center text-xs text-white/50">
                No messages yet. Say something!
              </p>
            )}
            {active.messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.from === "me" ? "justify-end" : "justify-start"}`}
              >
                <p
                  className={`max-w-[75%] whitespace-pre-wrap break-words rounded-[18px] px-3.5 py-2 text-[13px] leading-snug [animation:rise_.25s_cubic-bezier(.22,1,.36,1)] ${message.from === "me" ? "bg-[#0a84ff] text-white" : "bg-white/15 text-white"}`}
                >
                  {message.text}
                </p>
              </div>
            ))}
            <div ref={end} />
          </div>
          <form
            onSubmit={(event) => {
              event.preventDefault();
              send();
            }}
            className="flex items-center gap-2 border-t border-white/10 p-2.5"
          >
            <input
              aria-label="Message"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="iMessage"
              className="h-8 flex-1 rounded-full border border-white/15 bg-white/5 px-3.5 text-[13px] outline-none focus:border-white/30"
            />
            <button
              type="submit"
              aria-label="Send"
              disabled={!draft.trim()}
              className="grid size-8 place-items-center rounded-full bg-[#0a84ff] text-white disabled:opacity-40"
            >
              <Send className="size-3.5" />
            </button>
          </form>
        </section>
      )}
    </div>
  );
}

// ---------------- Mail ----------------

type MailItem = {
  id: string;
  box: "inbox" | "sent" | "drafts" | "trash";
  from: string;
  to: string;
  subject: string;
  body: string;
  at: number;
  read: boolean;
  flagged?: boolean;
};
const WELCOME_MAIL: MailItem[] = [
  {
    id: "welcome",
    box: "inbox",
    from: "PRIVATE OS",
    to: "you",
    subject: "Welcome to Mail",
    body: "Mail in PRIVATE OS keeps your messages on this device.\n\nWrite a message with the pencil button. It is saved in Sent, and you can open it in your own email app to really send it.\n\nEnjoy the new Liquid Glass look!",
    at: Date.now(),
    read: false,
  },
];
const BOXES = [
  { id: "inbox", label: "Inbox", icon: Inbox },
  { id: "sent", label: "Sent", icon: Send },
  { id: "drafts", label: "Drafts", icon: Pencil },
  { id: "trash", label: "Trash", icon: Trash2 },
] as const;

export function MailContent() {
  const [mails, setMails] = useStored<MailItem[]>("pos-mail", WELCOME_MAIL);
  const [box, setBox] = useState<MailItem["box"]>("inbox");
  const [openId, setOpenId] = useState<string | null>(null);
  const [compose, setCompose] = useState<{ to: string; subject: string; body: string } | null>(
    null,
  );
  const list = mails.filter((mail) => mail.box === box).sort((a, b) => b.at - a.at);
  const open = mails.find((mail) => mail.id === openId && mail.box === box) ?? null;
  const update = (id: string, patch: Partial<MailItem>) =>
    setMails((all) => all.map((mail) => (mail.id === id ? { ...mail, ...patch } : mail)));
  const save = (target: "sent" | "drafts") => {
    if (!compose) return;
    const item: MailItem = {
      id: `mail-${Date.now()}`,
      box: target,
      from: "me",
      to: compose.to,
      subject: compose.subject || "(No subject)",
      body: compose.body,
      at: Date.now(),
      read: true,
    };
    setMails((all) => [item, ...all]);
    if (target === "sent" && compose.to.trim())
      window.open(
        `mailto:${encodeURIComponent(compose.to)}?subject=${encodeURIComponent(compose.subject)}&body=${encodeURIComponent(compose.body)}`,
        "_blank",
      );
    setCompose(null);
    setBox(target);
    setOpenId(item.id);
  };
  const remove = (mail: MailItem) => {
    if (mail.box === "trash") setMails((all) => all.filter((item) => item.id !== mail.id));
    else update(mail.id, { box: "trash" });
    setOpenId(null);
  };

  return (
    <div className="relative flex min-h-0 flex-1 text-white">
      <aside className={`${sidebar} !w-44 max-md:!w-32`}>
        <p className="px-2 pb-1 pt-1 text-[10px] font-semibold text-white/50">Mailboxes</p>
        {BOXES.map(({ id, label, icon: Icon }) => {
          const unread = mails.filter((mail) => mail.box === id && !mail.read).length;
          return (
            <button
              key={id}
              type="button"
              onClick={() => {
                setBox(id);
                setOpenId(null);
              }}
              className={`${rowBase} !py-1.5 text-xs ${box === id ? "bg-white/15" : rowOff}`}
            >
              <Icon className="size-3.5 text-[#0a84ff]" />
              <span className="flex-1">{label}</span>
              {unread > 0 && <span className="text-[10px] text-white/60">{unread}</span>}
            </button>
          );
        })}
      </aside>
      <div className="flex w-64 shrink-0 flex-col border-r border-white/10 max-md:w-44">
        <div className="flex items-center justify-between px-3 py-2">
          <p className="text-sm font-bold capitalize">{box}</p>
          <button
            type="button"
            aria-label="New message"
            onClick={() => setCompose({ to: "", subject: "", body: "" })}
            className="rounded-lg p-1.5 hover:bg-white/10"
          >
            <SquarePen className="size-4" />
          </button>
        </div>
        <div className="flex-1 overflow-auto">
          {list.length === 0 && (
            <p className="p-6 text-center text-xs text-white/50">No messages</p>
          )}
          {list.map((mail) => (
            <button
              key={mail.id}
              type="button"
              onClick={() => {
                setOpenId(mail.id);
                if (!mail.read) update(mail.id, { read: true });
              }}
              className={`block w-full border-b border-white/5 px-3 py-2 text-left ${mail.id === openId ? "bg-[#0a84ff]/80" : "hover:bg-white/5"}`}
            >
              <span className="flex items-center gap-1.5 text-xs font-semibold">
                {!mail.read && <span className="size-2 rounded-full bg-[#0a84ff]" />}
                <span className="truncate">
                  {box === "sent" || box === "drafts" ? `To: ${mail.to || "—"}` : mail.from}
                </span>
                {mail.flagged && <Star className="ml-auto size-3 fill-amber-400 text-amber-400" />}
              </span>
              <span className="block truncate text-[11px]">{mail.subject}</span>
              <span className="block truncate text-[10px] text-white/50">
                {mail.body.split("\n")[0]}
              </span>
            </button>
          ))}
        </div>
      </div>
      <section className="min-w-0 flex-1 overflow-auto p-5">
        {open ? (
          <article className="[animation:rise_.25s_cubic-bezier(.22,1,.36,1)]">
            <div className="mb-4 flex items-start gap-3">
              <Avatar name={open.from === "me" ? "Me" : open.from} size="size-10" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold">{open.from === "me" ? "Me" : open.from}</p>
                <p className="text-[11px] text-white/60">
                  To: {open.to || "—"} · {new Date(open.at).toLocaleString()}
                </p>
                <h3 className="mt-2 text-base font-bold">{open.subject}</h3>
              </div>
              <button
                type="button"
                aria-label={open.flagged ? "Unflag" : "Flag"}
                onClick={() => update(open.id, { flagged: !open.flagged })}
                className="rounded-lg p-1.5 hover:bg-white/10"
              >
                <Star className={`size-4 ${open.flagged ? "fill-amber-400 text-amber-400" : ""}`} />
              </button>
              <button
                type="button"
                aria-label={open.box === "trash" ? "Delete forever" : "Move to Trash"}
                onClick={() => remove(open)}
                className="rounded-lg p-1.5 hover:bg-white/10"
              >
                <Trash2 className="size-4" />
              </button>
              {open.box === "trash" && (
                <button
                  type="button"
                  aria-label="Move to Inbox"
                  onClick={() => {
                    update(open.id, { box: open.from === "me" ? "sent" : "inbox" });
                    setOpenId(null);
                  }}
                  className="rounded-lg p-1.5 hover:bg-white/10"
                >
                  <Archive className="size-4" />
                </button>
              )}
            </div>
            <p className="whitespace-pre-wrap text-[13px] leading-relaxed text-white/90">
              {open.body}
            </p>
            {open.box === "drafts" && (
              <button
                type="button"
                onClick={() => {
                  setCompose({ to: open.to, subject: open.subject, body: open.body });
                  setMails((all) => all.filter((mail) => mail.id !== open.id));
                }}
                className={`${pillBtn} mt-4`}
              >
                <Pencil className="size-3" />
                Continue editing
              </button>
            )}
          </article>
        ) : (
          <div className="grid h-full place-items-center text-center text-xs text-white/50">
            <div>
              <Mail className="mx-auto mb-2 size-8 opacity-50" />
              No message selected
            </div>
          </div>
        )}
      </section>
      {compose && (
        <div className="absolute inset-0 z-10 grid place-items-center bg-black/30 p-4 backdrop-blur-sm">
          <form
            onSubmit={(event) => {
              event.preventDefault();
              save("sent");
            }}
            className="liquid-sheet flex w-full max-w-lg flex-col overflow-hidden rounded-2xl [animation:window-in_.2s_cubic-bezier(.22,1,.36,1)]"
          >
            <div className="flex items-center justify-between border-b border-white/10 px-4 py-2.5">
              <p className="text-sm font-bold">New Message</p>
              <div className="flex gap-2">
                <button type="button" onClick={() => save("drafts")} className={pillBtn}>
                  Save draft
                </button>
                <button type="button" onClick={() => setCompose(null)} className={pillBtn}>
                  Cancel
                </button>
                <button type="submit" className={`${pillBtn} !bg-[#0a84ff]`}>
                  <Send className="size-3" />
                  Send
                </button>
              </div>
            </div>
            {(["to", "subject"] as const).map((field) => (
              <label
                key={field}
                className="flex items-center gap-2 border-b border-white/10 px-4 text-xs"
              >
                <span className="w-14 text-white/50 capitalize">{field}:</span>
                <input
                  aria-label={field}
                  type={field === "to" ? "email" : "text"}
                  value={compose[field]}
                  onChange={(e) => setCompose({ ...compose, [field]: e.target.value })}
                  className="h-9 flex-1 bg-transparent outline-none"
                />
              </label>
            ))}
            <textarea
              aria-label="Message body"
              value={compose.body}
              onChange={(e) => setCompose({ ...compose, body: e.target.value })}
              className="h-56 resize-none bg-transparent p-4 text-[13px] outline-none"
            />
            <p className="flex items-center gap-1.5 border-t border-white/10 px-4 py-2 text-[10px] text-white/50">
              <ExternalLink className="size-3" />
              Send saves it in Sent and opens your own email app to deliver it.
            </p>
          </form>
        </div>
      )}
    </div>
  );
}

// ---------------- Contacts ----------------

type Contact = { id: string; name: string; phone: string; email: string; note: string };
const SAMPLE_CONTACTS: Contact[] = [
  { id: "c-private", name: "PRIVATE Assistant", phone: "", email: "", note: "Say hi in Messages." },
];

export function ContactsContent({ openApp }: { openApp: (id: string) => void }) {
  const [contacts, setContacts] = useStored<Contact[]>("pos-contacts", SAMPLE_CONTACTS);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<string | null>(null);
  const [editing, setEditing] = useState<Contact | null>(null);
  const sorted = useMemo(
    () =>
      [...contacts]
        .sort((a, b) => a.name.localeCompare(b.name))
        .filter((c) =>
          `${c.name} ${c.email} ${c.phone}`.toLowerCase().includes(query.toLowerCase()),
        ),
    [contacts, query],
  );
  const current = contacts.find((c) => c.id === selected) ?? sorted[0] ?? null;
  const saveEdit = () => {
    if (!editing || !editing.name.trim()) return;
    setContacts((list) =>
      list.some((c) => c.id === editing.id)
        ? list.map((c) => (c.id === editing.id ? editing : c))
        : [...list, editing],
    );
    setSelected(editing.id);
    setEditing(null);
  };
  const field =
    "h-8 w-full rounded-lg border border-white/15 bg-white/5 px-2.5 text-xs outline-none focus:border-white/35";

  return (
    <div className="flex min-h-0 flex-1 text-white">
      <aside className={sidebar}>
        <div className="mb-1 flex items-center gap-1.5">
          <label className={`${searchBox} flex-1`}>
            <Search className="size-3.5 text-white/50" />
            <input
              aria-label="Search contacts"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search"
              className="h-7 w-full bg-transparent text-xs outline-none"
            />
          </label>
          <button
            type="button"
            aria-label="Add contact"
            onClick={() =>
              setEditing({ id: `c-${Date.now()}`, name: "", phone: "", email: "", note: "" })
            }
            className="rounded-lg p-1.5 hover:bg-white/10"
          >
            <Plus className="size-4" />
          </button>
        </div>
        {sorted.map((c, index) => {
          const letter = c.name[0]?.toUpperCase() ?? "#";
          const showLetter = index === 0 || sorted[index - 1]!.name[0]?.toUpperCase() !== letter;
          return (
            <div key={c.id}>
              {showLetter && (
                <p className="px-2 pt-2 text-[10px] font-bold text-white/45">{letter}</p>
              )}
              <button
                type="button"
                onClick={() => {
                  setSelected(c.id);
                  setEditing(null);
                }}
                className={`${rowBase} !py-1.5 text-xs ${current?.id === c.id ? rowOn : rowOff}`}
              >
                {c.name}
              </button>
            </div>
          );
        })}
        {sorted.length === 0 && (
          <p className="p-4 text-center text-[11px] text-white/50">No contacts</p>
        )}
      </aside>
      <section className="min-w-0 flex-1 overflow-auto p-6">
        {editing ? (
          <form
            onSubmit={(event) => {
              event.preventDefault();
              saveEdit();
            }}
            className="mx-auto max-w-sm space-y-3 [animation:rise_.25s_cubic-bezier(.22,1,.36,1)]"
          >
            <div className="flex justify-center">
              <Avatar name={editing.name || "?"} size="size-20 text-2xl" />
            </div>
            {(["name", "phone", "email", "note"] as const).map((key) => (
              <label key={key} className="block text-[11px] capitalize text-white/60">
                {key}
                <input
                  aria-label={key}
                  autoFocus={key === "name"}
                  type={key === "email" ? "email" : key === "phone" ? "tel" : "text"}
                  value={editing[key]}
                  onChange={(e) => setEditing({ ...editing, [key]: e.target.value })}
                  className={`${field} mt-1 text-white`}
                />
              </label>
            ))}
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setEditing(null)} className={pillBtn}>
                Cancel
              </button>
              <button
                type="submit"
                disabled={!editing.name.trim()}
                className={`${pillBtn} !bg-[#0a84ff] disabled:opacity-40`}
              >
                Done
              </button>
            </div>
          </form>
        ) : current ? (
          <div
            key={current.id}
            className="mx-auto max-w-sm text-center [animation:rise_.25s_cubic-bezier(.22,1,.36,1)]"
          >
            <Avatar name={current.name} size="mx-auto size-24 text-3xl" />
            <h2 className="mt-3 text-xl font-bold">{current.name}</h2>
            <div className="mt-4 flex justify-center gap-2">
              <button type="button" onClick={() => openApp("messages")} className="liquid-action">
                <MessageCircle className="size-4" />
                <span>message</span>
              </button>
              <a
                href={current.phone ? `tel:${current.phone}` : undefined}
                aria-disabled={!current.phone}
                className={`liquid-action ${current.phone ? "" : "opacity-40"}`}
              >
                <Phone className="size-4" />
                <span>call</span>
              </a>
              <a
                href={current.email ? `mailto:${current.email}` : undefined}
                aria-disabled={!current.email}
                className={`liquid-action ${current.email ? "" : "opacity-40"}`}
              >
                <Mail className="size-4" />
                <span>mail</span>
              </a>
            </div>
            <dl className="mt-5 divide-y divide-white/10 rounded-2xl bg-white/8 text-left text-xs">
              {(["phone", "email", "note"] as const)
                .filter((key) => current[key])
                .map((key) => (
                  <div key={key} className="px-4 py-2.5">
                    <dt className="text-[10px] capitalize text-white/50">{key}</dt>
                    <dd className="mt-0.5 break-words">{current[key]}</dd>
                  </div>
                ))}
              {!current.phone && !current.email && !current.note && (
                <p className="px-4 py-3 text-center text-white/50">No details yet</p>
              )}
            </dl>
            <div className="mt-4 flex justify-center gap-2">
              <button type="button" onClick={() => setEditing(current)} className={pillBtn}>
                <Pencil className="size-3" />
                Edit
              </button>
              <button
                type="button"
                onClick={() => {
                  if (window.confirm(`Delete ${current.name}?`)) {
                    setContacts((list) => list.filter((c) => c.id !== current.id));
                    setSelected(null);
                  }
                }}
                className={`${pillBtn} !text-red-300`}
              >
                <Trash2 className="size-3" />
                Delete
              </button>
            </div>
          </div>
        ) : (
          <div className="grid h-full place-items-center text-xs text-white/50">
            <div className="text-center">
              <UserRound className="mx-auto mb-2 size-8 opacity-50" />
              No contacts yet
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

// ---------------- Maps ----------------

type Place = { name: string; detail: string; lat: number; lon: number };
const DEFAULT_PLACE: Place = { name: "Paris", detail: "France", lat: 48.8566, lon: 2.3522 };

export function MapsContent() {
  const [place, setPlace] = useStored<Place>("pos-maps-place", DEFAULT_PLACE);
  const [favorites, setFavorites] = useStored<Place[]>("pos-maps-favs", []);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Place[]>([]);
  const [msg, setMsg] = useState("");
  const [zoom, setZoom] = useState(0.06);
  const search = async () => {
    if (!query.trim()) return;
    setMsg("Searching…");
    try {
      const res = (await (
        await fetch(
          `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query.trim())}&count=6`,
        )
      ).json()) as {
        results?: {
          name: string;
          country?: string;
          admin1?: string;
          latitude: number;
          longitude: number;
        }[];
      };
      const found = (res.results ?? []).map((r) => ({
        name: r.name,
        detail: [r.admin1, r.country].filter(Boolean).join(", "),
        lat: r.latitude,
        lon: r.longitude,
      }));
      setResults(found);
      setMsg(found.length ? "" : "No places found.");
      if (found[0]) setPlace(found[0]);
    } catch {
      setMsg("Couldn't search right now.");
    }
  };
  const bbox = [place.lon - zoom * 1.6, place.lat - zoom, place.lon + zoom * 1.6, place.lat + zoom]
    .map((n) => n.toFixed(5))
    .join(",");
  const isFav = favorites.some((f) => f.lat === place.lat && f.lon === place.lon);
  const listBtn = (p: Place, key: string) => (
    <button
      key={key}
      type="button"
      onClick={() => setPlace(p)}
      className={`${rowBase} !py-1.5 ${p.lat === place.lat && p.lon === place.lon ? "bg-white/15" : rowOff}`}
    >
      <span className="grid size-7 shrink-0 place-items-center rounded-full bg-gradient-to-b from-rose-400 to-red-600">
        <MapPin className="size-3.5 text-white" />
      </span>
      <span className="min-w-0">
        <span className="block truncate text-xs font-semibold">{p.name}</span>
        <span className="block truncate text-[10px] text-white/55">{p.detail}</span>
      </span>
    </button>
  );

  return (
    <div className="flex min-h-0 flex-1 text-white">
      <aside className={sidebar}>
        <form
          onSubmit={(event) => {
            event.preventDefault();
            void search();
          }}
          className={searchBox}
        >
          <Search className="size-3.5 text-white/50" />
          <input
            aria-label="Search Maps"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search Maps"
            className="h-8 w-full bg-transparent text-xs outline-none"
          />
        </form>
        {msg && <p className="px-2 py-1 text-[10px] text-white/55">{msg}</p>}
        {results.length > 0 && (
          <p className="px-2 pt-2 text-[10px] font-bold text-white/45">Results</p>
        )}
        {results.map((p, i) => listBtn(p, `r${i}`))}
        <p className="px-2 pt-3 text-[10px] font-bold text-white/45">Favorites</p>
        {favorites.length === 0 && (
          <p className="px-2 text-[10px] text-white/45">Tap the star to save a place.</p>
        )}
        {favorites.map((p, i) => listBtn(p, `f${i}`))}
      </aside>
      <section className="relative min-w-0 flex-1">
        <iframe
          key={bbox}
          title={`Map of ${place.name}`}
          src={`https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${place.lat},${place.lon}`}
          className="absolute inset-0 size-full border-0"
          loading="lazy"
          referrerPolicy="no-referrer"
        />
        <div className="liquid-float absolute left-3 top-3 flex items-center gap-2 rounded-2xl px-3 py-2">
          <div>
            <p className="text-xs font-bold">{place.name}</p>
            <p className="text-[10px] text-white/65">{place.detail}</p>
          </div>
          <button
            type="button"
            aria-label={isFav ? "Remove from favorites" : "Add to favorites"}
            onClick={() =>
              setFavorites(
                isFav
                  ? favorites.filter((f) => !(f.lat === place.lat && f.lon === place.lon))
                  : [...favorites, place],
              )
            }
            className="rounded-full p-1 hover:bg-white/15"
          >
            <Star className={`size-4 ${isFav ? "fill-amber-400 text-amber-400" : ""}`} />
          </button>
        </div>
        <div className="liquid-float absolute bottom-3 right-3 flex flex-col overflow-hidden rounded-xl text-sm font-bold">
          <button
            type="button"
            aria-label="Zoom in"
            onClick={() => setZoom((z) => Math.max(0.004, z / 2))}
            className="size-8 hover:bg-white/15"
          >
            +
          </button>
          <span className="h-px bg-white/15" />
          <button
            type="button"
            aria-label="Zoom out"
            onClick={() => setZoom((z) => Math.min(20, z * 2))}
            className="size-8 hover:bg-white/15"
          >
            −
          </button>
        </div>
      </section>
    </div>
  );
}
