import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

// Shared building blocks for PRIVATE Engine, Privacy Center and Private Files, styled like Settings.

export const btn = "inline-flex items-center justify-center gap-1.5 rounded-lg px-3 py-1.5 text-[11px] font-semibold transition hover:brightness-110 disabled:pointer-events-none disabled:opacity-40";
export const btnPrimary = `${btn} bg-primary text-primary-foreground`;
export const btnGhost = `${btn} border border-white/15 bg-white/5`;
export const btnDanger = `${btn} bg-red-500/80 text-white`;
export const iconBtn = "grid size-8 shrink-0 place-items-center rounded-lg text-muted-foreground transition hover:bg-white/10 hover:text-foreground disabled:pointer-events-none disabled:opacity-30";

export function formatBytes(bytes: number) {
  if (!bytes || bytes < 1) return "0 B";
  const units = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.min(units.length - 1, Math.floor(Math.log(bytes) / Math.log(1024)));
  return `${(bytes / 1024 ** i).toFixed(i ? 1 : 0)} ${units[i]}`;
}

export type NavItem = { id: string; label: string; sub?: string; icon: LucideIcon; badge?: string | number };

export function AppSidebar({ brand, brandSub, brandIcon: BrandIcon, items, active, onSelect, footer }: { brand: string; brandSub: string; brandIcon: LucideIcon; items: NavItem[]; active: string; onSelect: (id: string) => void; footer?: ReactNode }) {
  return (
    <nav aria-label={`${brand} sections`} className="relative z-10 flex shrink-0 gap-1 overflow-x-auto border-b border-white/10 p-2 md:w-56 md:flex-col md:overflow-y-auto md:border-b-0 md:border-r md:p-3">
      <div className="hidden items-center gap-3 px-2 pb-3 md:flex">
        <span className="grid size-10 place-items-center rounded-xl bg-primary/20 text-primary"><BrandIcon className="size-5" /></span>
        <div><p className="font-['Playfair_Display',serif] text-base font-bold leading-tight">{brand}</p><p className="text-[10px] italic text-muted-foreground">{brandSub}</p></div>
      </div>
      {items.map((item) => {
        const Icon = item.icon;
        const on = item.id === active;
        return (
          <button key={item.id} type="button" aria-current={on ? "page" : undefined} onClick={() => onSelect(item.id)} className={`flex shrink-0 items-center gap-3 rounded-xl px-3 py-2 text-left md:mt-0.5 ${on ? "bg-primary/15 shadow-[inset_2px_0_0_var(--primary)]" : "hover:bg-white/5"}`}>
            <span className={`grid size-7 place-items-center rounded-lg ${on ? "bg-primary/25 text-primary" : "bg-white/5 text-muted-foreground"}`}><Icon className="size-4" /></span>
            <span className="min-w-0 flex-1"><span className="block text-xs font-semibold">{item.label}</span>{item.sub && <span className="hidden text-[10px] text-muted-foreground md:block">{item.sub}</span>}</span>
            {item.badge !== undefined && item.badge !== 0 && <span className="rounded-full bg-white/10 px-1.5 text-[10px] tabular-nums text-muted-foreground">{item.badge}</span>}
          </button>
        );
      })}
      {footer && <div className="mt-auto hidden md:block">{footer}</div>}
    </nav>
  );
}

export function PageTitle({ title, heading, children }: { title: string; heading?: string; children?: ReactNode }) {
  return (
    <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
      <div><h2 className="font-['Playfair_Display',serif] text-2xl font-bold">{title}</h2>{heading && <p className="text-xs text-muted-foreground">{heading}</p>}</div>
      {children && <div className="flex flex-wrap gap-1.5">{children}</div>}
    </div>
  );
}

export function Panel({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`rounded-2xl border border-white/10 bg-black/20 p-4 ${className}`}>{children}</div>;
}

export function Toggle({ checked, onChange, label, description, disabled }: { checked: boolean; onChange: (next: boolean) => void; label: string; description?: string; disabled?: boolean }) {
  return (
    <div className="flex items-start justify-between gap-4 py-3">
      <div className="min-w-0"><p className="text-xs font-semibold">{label}</p>{description && <p className="mt-0.5 text-[11px] leading-relaxed text-muted-foreground">{description}</p>}</div>
      <button type="button" role="switch" aria-checked={checked} aria-label={label} disabled={disabled} onClick={() => onChange(!checked)} className={`relative h-6 w-11 shrink-0 rounded-full transition disabled:opacity-40 ${checked ? "bg-primary" : "bg-white/15"}`}>
        <span className={`absolute top-0.5 size-5 rounded-full bg-background shadow transition-all ${checked ? "left-[22px]" : "left-0.5"}`} />
      </button>
    </div>
  );
}

export function Meter({ value, max }: { value: number; max: number }) {
  const pct = max > 0 ? Math.min(100, (value / max) * 100) : 0;
  return <div role="meter" aria-valuemin={0} aria-valuemax={max} aria-valuenow={value} className="h-1.5 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-primary transition-all" style={{ width: `${Math.max(pct, value > 0 ? 1 : 0)}%` }} /></div>;
}

export function downloadBlob(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = name;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}
