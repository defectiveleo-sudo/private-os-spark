// Shared pieces for the Office-style apps (Word, Excel, PowerPoint, OneNote, Outlook) and File Explorer:
// a coloured title bar, ribbon tabs and groups, the File (backstage) page and a Windows status bar.
import type { ComponentType, ReactNode } from "react";
import { ArrowLeft, FilePlus2, FolderOpen, Minus, Plus, Redo2, Save, Search, Undo2 } from "lucide-react";

type Icon = ComponentType<{ className?: string; style?: React.CSSProperties }>;

export type OfficeBrand = { app: string; color: string; dark: string; soft: string };

export const OFFICE: Record<"word" | "excel" | "powerpoint" | "onenote" | "outlook", OfficeBrand> = {
  word: { app: "Word", color: "#185abd", dark: "#103f91", soft: "#dbe6f8" },
  excel: { app: "Excel", color: "#107c41", dark: "#0b5a2f", soft: "#d6ecdf" },
  powerpoint: { app: "PowerPoint", color: "#c43e1c", dark: "#9c2f14", soft: "#f6ddd5" },
  onenote: { app: "OneNote", color: "#7719aa", dark: "#5c1385", soft: "#eadcf3" },
  outlook: { app: "Outlook", color: "#0f6cbd", dark: "#0a4f8c", soft: "#d8e7f6" },
};

const userInitials = () => {
  try {
    const name = (JSON.parse(localStorage.getItem("pos-settings") ?? "{}") as { userName?: string }).userName?.trim();
    if (name) return name.split(/\s+/).map((part) => part[0]).join("").slice(0, 2).toUpperCase();
  } catch {
    // storage unavailable
  }
  return "PO";
};

// Content of the window title bar for an Office app. The window adds the Windows caption buttons on the right.
export function OfficeTitle({ brand, icon: AppIcon, name, status, autoSave, onAutoSave, onSave, onUndo, onRedo, search, onSearch }: { brand: OfficeBrand; icon: Icon; name: string; status?: string; autoSave?: boolean; onAutoSave?: (on: boolean) => void; onSave?: () => void; onUndo?: () => void; onRedo?: () => void; search?: string; onSearch?: (value: string) => void }) {
  const qa = "grid size-7 place-items-center rounded hover:bg-white/15";
  return (
    <div className="grid h-full w-full grid-cols-[1fr_auto_1fr] items-center gap-2 pl-2 text-white" style={{ fontFamily: "'Segoe UI Variable Text','Segoe UI',system-ui,sans-serif" }}>
      <div className="flex min-w-0 items-center gap-1">
        <AppIcon className="size-5 shrink-0" />
        {onAutoSave && (
          <button type="button" role="switch" aria-checked={Boolean(autoSave)} onClick={() => onAutoSave(!autoSave)} className="ml-1 hidden items-center gap-1.5 rounded px-1.5 py-1 text-[12px] hover:bg-white/15 sm:flex">
            AutoSave
            <span className={`relative h-[18px] w-9 rounded-full border ${autoSave ? "border-white bg-white" : "border-white/80"}`}>
              <span className="absolute top-[3px] size-2.5 rounded-full transition-all" style={{ left: autoSave ? 21 : 3, background: autoSave ? brand.color : "#fff" }} />
            </span>
            <span className="w-5 text-left">{autoSave ? "On" : "Off"}</span>
          </button>
        )}
        {onSave && <button type="button" aria-label="Save" title="Save (Ctrl+S)" onClick={onSave} className={qa}><Save className="size-4" /></button>}
        {onUndo && <button type="button" aria-label="Undo" title="Undo (Ctrl+Z)" onClick={onUndo} className={qa}><Undo2 className="size-4" /></button>}
        {onRedo && <button type="button" aria-label="Redo" title="Redo (Ctrl+Y)" onClick={onRedo} className={qa}><Redo2 className="size-4" /></button>}
        <span className="ml-2 hidden min-w-0 truncate text-[12px] lg:inline">{name}{status ? <span className="text-white/75"> • {status}</span> : null}</span>
      </div>
      <label className="hidden h-7 w-[min(34vw,360px)] items-center gap-2 rounded-md bg-white/20 px-2.5 text-[12px] text-white/85 focus-within:bg-white focus-within:text-zinc-800 md:flex">
        <Search className="size-3.5 shrink-0" />
        <input value={search ?? ""} onChange={(event) => onSearch?.(event.target.value)} placeholder="Search" aria-label="Search" className="min-w-0 flex-1 bg-transparent outline-none placeholder:text-current" />
      </label>
      <span className="truncate text-center text-[12px] md:hidden">{name}</span>
      <div className="flex items-center justify-end pr-2">
        <span className="grid size-7 place-items-center rounded-full bg-white/90 text-[11px] font-semibold" style={{ color: brand.dark }}>{userInitials()}</span>
      </div>
    </div>
  );
}

// Ribbon: the tab row plus the active tab's command groups.
export function Ribbon({ brand, tabs, tab, setTab, onFile, onShare, children }: { brand: OfficeBrand; tabs: string[]; tab: string; setTab: (tab: string) => void; onFile: () => void; onShare?: () => void; children: ReactNode }) {
  return (
    <div className="office-ribbon shrink-0 bg-[#f3f3f3] text-zinc-800" style={{ fontFamily: "'Segoe UI Variable Text','Segoe UI',system-ui,sans-serif", colorScheme: "light" }}>
      <div className="flex h-9 items-end gap-0.5 overflow-x-auto px-2">
        <button type="button" onClick={onFile} className="h-8 shrink-0 rounded-t px-3 text-[13px] hover:bg-black/5">File</button>
        {tabs.map((name) => (
          <button key={name} type="button" onClick={() => setTab(name)} className={`relative h-8 shrink-0 rounded-t px-3 text-[13px] hover:bg-black/5 ${tab === name ? "font-semibold" : ""}`} style={tab === name ? { color: brand.dark } : undefined}>
            {name}
            {tab === name && <span className="absolute inset-x-3 bottom-0 h-[3px] rounded-full" style={{ background: brand.color }} />}
          </button>
        ))}
        {onShare && (
          <button type="button" onClick={onShare} className="mb-1 ml-auto flex h-7 shrink-0 items-center gap-1.5 rounded-md px-3 text-[12px] font-semibold text-white" style={{ background: brand.color }}>Share</button>
        )}
      </div>
      <div className="mx-2 mb-2 flex h-[94px] items-stretch overflow-x-auto rounded-lg border border-black/[.06] bg-white px-1 shadow-[0_1px_2px_rgb(0_0_0/.06)]">{children}</div>
    </div>
  );
}

export function RGroup({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex shrink-0 flex-col border-r border-black/[.08] px-1.5 py-1 last:border-r-0">
      <div className="flex flex-1 items-center gap-0.5">{children}</div>
      <span className="text-center text-[11px] leading-4 text-zinc-500">{label}</span>
    </div>
  );
}

// Large button: icon above its label.
export function RBig({ icon: I, label, onClick, color, active, disabled }: { icon: Icon; label: string; onClick?: () => void; color?: string; active?: boolean; disabled?: boolean }) {
  return (
    <button type="button" disabled={disabled} onMouseDown={(event) => event.preventDefault()} onClick={onClick} className={`flex h-[62px] min-w-[52px] flex-col items-center justify-start gap-1 rounded px-1.5 pt-1.5 text-[11.5px] leading-tight hover:bg-black/[.05] disabled:opacity-40 ${active ? "bg-black/[.08]" : ""}`}>
      <I className="size-6 shrink-0" style={{ color: color ?? "#424242" }} />
      <span className="max-w-[74px] text-center">{label}</span>
    </button>
  );
}

// Small button: icon with an optional label, used in stacks of three.
export function RSmall({ icon: I, label, title, onClick, color, active, disabled, className = "" }: { icon?: Icon; label?: ReactNode; title?: string; onClick?: () => void; color?: string; active?: boolean; disabled?: boolean; className?: string }) {
  return (
    <button type="button" disabled={disabled} title={title} aria-label={title ?? (typeof label === "string" ? label : undefined)} aria-pressed={active} onMouseDown={(event) => event.preventDefault()} onClick={onClick} className={`flex h-6 min-w-6 shrink-0 items-center justify-center gap-1.5 rounded px-1 text-[12px] hover:bg-black/[.05] disabled:opacity-40 ${active ? "bg-black/[.1]" : ""} ${className}`}>
      {I && <I className="size-4 shrink-0" style={{ color: color ?? "#424242" }} />}
      {label !== undefined && <span className="whitespace-nowrap">{label}</span>}
    </button>
  );
}

export function RStack({ children }: { children: ReactNode }) {
  return <div className="flex flex-col justify-center gap-0.5">{children}</div>;
}

export function RRow({ children }: { children: ReactNode }) {
  return <div className="flex items-center gap-0.5">{children}</div>;
}

export const rSelect = "h-6 rounded border border-black/15 bg-white px-1 text-[12px] text-zinc-800 outline-none hover:border-black/30 focus:border-[var(--office)]";

// Windows status bar with the zoom slider on the right.
export function OfficeStatus({ left, right, zoom, setZoom }: { left: ReactNode; right?: ReactNode; zoom?: number; setZoom?: (value: number) => void }) {
  return (
    <div className="flex h-6 shrink-0 items-center gap-4 border-t border-black/[.08] bg-[#f3f3f3] px-3 text-[11.5px] text-zinc-600" style={{ fontFamily: "'Segoe UI Variable Text','Segoe UI',system-ui,sans-serif" }}>
      <div className="flex min-w-0 flex-1 items-center gap-4 truncate">{left}</div>
      {right}
      {zoom !== undefined && setZoom && (
        <div className="hidden items-center gap-1.5 sm:flex">
          <button type="button" aria-label="Zoom out" onClick={() => setZoom(Math.max(25, zoom - 10))} className="rounded p-0.5 hover:bg-black/5"><Minus className="size-3" /></button>
          <input type="range" min={25} max={300} value={zoom} onChange={(event) => setZoom(Number(event.target.value))} aria-label="Zoom" className="office-zoom w-24" />
          <button type="button" aria-label="Zoom in" onClick={() => setZoom(Math.min(300, zoom + 10))} className="rounded p-0.5 hover:bg-black/5"><Plus className="size-3" /></button>
          <button type="button" onClick={() => setZoom(100)} className="w-10 text-right tabular-nums hover:underline">{zoom}%</button>
        </div>
      )}
    </div>
  );
}

export type BackstageItem = { label: string; icon: Icon; onClick: () => void };

// The File page: coloured menu on the left, start page with New and Recent on the right.
export function Backstage({ brand, items, onBack, onNew, newLabel, recent, onOpenRecent, onBrowse }: { brand: OfficeBrand; items: BackstageItem[]; onBack: () => void; onNew: () => void; newLabel: string; recent: { name: string; path: string; when?: string }[]; onOpenRecent: (path: string) => void; onBrowse: () => void }) {
  const hour = new Date().getHours();
  const hello = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
  return (
    <div className="absolute inset-0 z-30 flex bg-white text-zinc-800 [animation:rise_.25s_cubic-bezier(.22,1,.36,1)_both]" style={{ fontFamily: "'Segoe UI Variable Text','Segoe UI',system-ui,sans-serif", colorScheme: "light" }}>
      <nav className="flex w-44 shrink-0 flex-col py-3 text-white sm:w-52" style={{ background: brand.color }}>
        <button type="button" onClick={onBack} aria-label="Back" className="mx-3 mb-3 grid size-9 place-items-center rounded-full border border-white/50 hover:bg-white/15"><ArrowLeft className="size-4" /></button>
        <button type="button" onClick={onBack} className="bg-white/15 px-5 py-2.5 text-left text-[13px]">Home</button>
        <button type="button" onClick={onNew} className="flex items-center gap-2 px-5 py-2.5 text-left text-[13px] hover:bg-white/15"><FilePlus2 className="size-4" />New</button>
        <button type="button" onClick={onBrowse} className="flex items-center gap-2 px-5 py-2.5 text-left text-[13px] hover:bg-white/15"><FolderOpen className="size-4" />Open</button>
        <span className="mx-5 my-2 h-px bg-white/25" />
        {items.map((item) => (
          <button key={item.label} type="button" onClick={item.onClick} className="flex items-center gap-2 px-5 py-2.5 text-left text-[13px] hover:bg-white/15"><item.icon className="size-4" />{item.label}</button>
        ))}
      </nav>
      <div className="min-w-0 flex-1 overflow-auto px-8 py-7">
        <h2 className="text-[26px] font-light">{hello}</h2>
        <p className="mt-5 text-[13px] font-semibold">New</p>
        <button type="button" onClick={onNew} className="mt-2 flex w-36 flex-col items-center gap-2 rounded-md border border-zinc-200 p-2 text-[12px] hover:border-zinc-400">
          <span className="block h-36 w-full rounded-sm border border-zinc-200 bg-white shadow-sm" />
          {newLabel}
        </button>
        <div className="mt-7 flex items-center justify-between border-b border-zinc-200 pb-2 text-[13px]">
          <span className="font-semibold" style={{ color: brand.dark }}>Recent</span>
          <button type="button" onClick={onBrowse} className="hover:underline" style={{ color: brand.dark }}>Browse this PC</button>
        </div>
        {recent.length === 0 && <p className="py-6 text-[13px] text-zinc-500">Files you save to Documents show up here.</p>}
        {recent.map((file) => (
          <button key={file.path} type="button" onClick={() => onOpenRecent(file.path)} className="flex w-full items-center gap-3 border-b border-zinc-100 px-2 py-2.5 text-left text-[13px] hover:bg-zinc-50">
            <span className="grid size-8 place-items-center rounded text-[10px] font-bold text-white" style={{ background: brand.color }}>{brand.app[0]}</span>
            <span className="min-w-0 flex-1"><span className="block truncate">{file.name}</span><span className="block truncate text-[11px] text-zinc-500">{file.path.slice(0, file.path.lastIndexOf("/")) || "/"}</span></span>
            <span className="text-[11px] text-zinc-500">{file.when}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

// Windows 11 style folder icon. `kind` adds the small glyph used by Documents, Downloads, Pictures and so on.
export function FolderGlyph({ className = "", kind }: { className?: string; kind?: string | undefined }) {
  const mark: Record<string, ReactNode> = {
    Documents: <path d="M20 22h8l4 4v10H20z" fill="#fff" stroke="#3b82c4" strokeWidth="1.4" />,
    Downloads: <path d="M26 21v12m-5-5 5 5 5-5M20 36h12" stroke="#1f8f4e" strokeWidth="2.4" fill="none" strokeLinecap="round" strokeLinejoin="round" />,
    Pictures: <><rect x="18.5" y="22" width="15" height="13" rx="2" fill="#fff" stroke="#2f7ad1" strokeWidth="1.4" /><path d="m19.5 34 5-5 3 3 2-2 3.5 4" fill="none" stroke="#2f7ad1" strokeWidth="1.4" /></>,
    Music: <path d="M24 34.5a2.5 2.5 0 1 1-2.5-2.5H24V22l8-2v11.5a2.5 2.5 0 1 1-2.5-2.5H32" fill="none" stroke="#e0570f" strokeWidth="1.8" />,
    Videos: <><rect x="18.5" y="22" width="15" height="12" rx="2" fill="#7a3fd1" /><path d="m24.5 25.5 4 2.5-4 2.5z" fill="#fff" /></>,
    Desktop: <><rect x="18" y="22" width="16" height="10.5" rx="1.5" fill="#2f7ad1" /><path d="M23 36h6m-3-3.5V36" stroke="#2f7ad1" strokeWidth="1.6" /></>,
  };
  return (
    <svg viewBox="0 0 48 48" aria-hidden className={className}>
      <path d="M4 11.5A3.5 3.5 0 0 1 7.5 8h10.6a3.5 3.5 0 0 1 2.5 1l3 3H40.5a3.5 3.5 0 0 1 3.5 3.5V37a3.5 3.5 0 0 1-3.5 3.5h-33A3.5 3.5 0 0 1 4 37z" fill="#e2a224" />
      <path d="M4 17.5A3.5 3.5 0 0 1 7.5 14h33a3.5 3.5 0 0 1 3.5 3.5V37a3.5 3.5 0 0 1-3.5 3.5h-33A3.5 3.5 0 0 1 4 37z" fill="#fbc43c" />
      <path d="M7.5 14h33a3.5 3.5 0 0 1 3.5 3.5v1.5H4v-1.5A3.5 3.5 0 0 1 7.5 14z" fill="#ffd96e" />
      {kind ? mark[kind] : null}
    </svg>
  );
}

// Plain document icon with a coloured band and a short type label.
export function FileGlyph({ className = "", label = "", color = "#6b7280" }: { className?: string; label?: string | undefined; color?: string | undefined }) {
  return (
    <svg viewBox="0 0 48 48" aria-hidden className={className}>
      <path d="M11 4h18l10 10v28a2 2 0 0 1-2 2H11a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z" fill="#fafafa" stroke="#c9c9c9" />
      <path d="M29 4v8a2 2 0 0 0 2 2h8" fill="#e6e6e6" stroke="#c9c9c9" />
      {label ? (
        <>
          <rect x="7" y="27" width="26" height="11" rx="2" fill={color} />
          <text x="20" y="35.2" textAnchor="middle" fontSize="7.5" fontWeight="700" fill="#fff" fontFamily="Segoe UI, system-ui, sans-serif">{label}</text>
        </>
      ) : (
        <path d="M15 20h18M15 25h18M15 30h18M15 35h12" stroke="#b5b5b5" strokeWidth="1.6" />
      )}
    </svg>
  );
}

// Colour picker button (font colour, fill colour): the icon with a bar of the current colour under it.
export function RColor({ icon: I, title, value, onPick, label }: { icon: Icon; title: string; value: string; onPick: (color: string) => void; label?: string }) {
  return (
    <label title={title} className={`relative flex h-6 shrink-0 cursor-pointer items-center gap-1.5 rounded hover:bg-black/[.05] ${label ? "px-1 text-[12px]" : "w-7 justify-center"}`} onMouseDown={(event) => event.preventDefault()}>
      <span className="flex flex-col items-center">
        <I className="size-[15px]" style={{ color: "#424242" }} />
        <span className="mt-px h-[3px] w-4 rounded-sm" style={{ background: value }} />
      </span>
      {label}
      <input type="color" aria-label={title} value={value} onChange={(event) => onPick(event.target.value)} className="absolute inset-0 cursor-pointer opacity-0" />
    </label>
  );
}
