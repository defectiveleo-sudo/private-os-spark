import { useCallback, useEffect, useState } from "react";
import { Activity as ActivityIcon, Database, Download, HardDrive, KeyRound, LayoutDashboard, RotateCcw, Shield, ShieldCheck, Trash2 } from "lucide-react";
import { ACTIVITY_EVENT, ENGINE_KEYS, FILES_EVENT, PRIVACY_KEY, ACTIVITY_KEY, clearActivity, logActivity, readActivity, resetPrivacy, setPrivacy, usePrivacy, type Activity } from "@/lib/privacy";
import { clearStore, getAll } from "@/lib/files-db";
import { AppSidebar, Meter, PageTitle, Panel, Toggle, btnDanger, btnGhost, downloadBlob, formatBytes } from "@/components/private-ui";

const PERMISSIONS = [
  { name: "camera", label: "Camera", used: "Camera app" },
  { name: "microphone", label: "Microphone", used: "Recorder app" },
  { name: "geolocation", label: "Location", used: "Weather app" },
  { name: "notifications", label: "Notifications", used: "Reminders" },
  { name: "persistent-storage", label: "Persistent storage", used: "Private Files" },
] as const;

type Usage = { estimate: { usage: number; quota: number } | null; local: { label: string; bytes: number }[]; nodes: number; vault: number };

const sizeOf = (key: string) => ((localStorage.getItem(key)?.length ?? 0) + key.length) * 2;

async function measure(): Promise<Usage> {
  let estimate: Usage["estimate"] = null;
  try {
    const e = await navigator.storage?.estimate?.();
    if (e) estimate = { usage: e.usage ?? 0, quota: e.quota ?? 0 };
  } catch {
    estimate = null;
  }
  let other = 0;
  for (let i = 0; i < localStorage.length; i += 1) {
    const key = localStorage.key(i);
    if (key && ![ENGINE_KEYS.history, ENGINE_KEYS.bookmarks, ENGINE_KEYS.tabs, ACTIVITY_KEY, PRIVACY_KEY].includes(key as never)) other += sizeOf(key);
  }
  const local = [
    { label: "Browsing history", bytes: sizeOf(ENGINE_KEYS.history) },
    { label: "Bookmarks", bytes: sizeOf(ENGINE_KEYS.bookmarks) },
    { label: "Saved tabs", bytes: sizeOf(ENGINE_KEYS.tabs) },
    { label: "Activity log", bytes: sizeOf(ACTIVITY_KEY) },
    { label: "Other app settings", bytes: other },
  ];
  let nodes = 0;
  let vault = 0;
  try {
    nodes = (await getAll("nodes")).length;
    vault = (await getAll("vault")).length;
  } catch {
    // no IndexedDB
  }
  return { estimate, local, nodes, vault };
}

export function PrivacyCenter() {
  const privacy = usePrivacy();
  const [page, setPage] = useState("overview");
  const [usage, setUsage] = useState<Usage | null>(null);
  const [activity, setActivity] = useState<Activity[]>([]);
  const [perms, setPerms] = useState<Record<string, string>>({});
  const [note, setNote] = useState("");
  const refresh = useCallback(() => {
    void measure().then(setUsage);
    setActivity(readActivity());
  }, []);

  useEffect(() => {
    refresh();
    window.addEventListener(ACTIVITY_EVENT, refresh);
    window.addEventListener(FILES_EVENT, refresh);
    return () => {
      window.removeEventListener(ACTIVITY_EVENT, refresh);
      window.removeEventListener(FILES_EVENT, refresh);
    };
  }, [refresh]);

  const readPerms = useCallback(async () => {
    const out: Record<string, string> = {};
    for (const p of PERMISSIONS) {
      try {
        out[p.name] = (await navigator.permissions.query({ name: p.name as PermissionName })).state;
      } catch {
        out[p.name] = "unsupported";
      }
    }
    setPerms(out);
  }, []);
  useEffect(() => { void readPerms(); }, [readPerms]);

  const flash = (text: string) => {
    setNote(text);
    logActivity("Privacy Center", text);
    refresh();
    window.setTimeout(() => setNote(""), 3000);
  };

  const clear = async (what: string) => {
    if (!window.confirm(`Clear ${what}? This cannot be undone.`)) return;
    if (what === "browsing history") localStorage.removeItem(ENGINE_KEYS.history);
    if (what === "bookmarks") localStorage.removeItem(ENGINE_KEYS.bookmarks);
    if (what === "saved tabs") localStorage.removeItem(ENGINE_KEYS.tabs);
    if (what === "the activity log") clearActivity();
    if (what === "all Private Files") {
      await clearStore("nodes");
      await clearStore("meta").catch(() => undefined);
      window.dispatchEvent(new Event(FILES_EVENT));
    }
    flash(`Cleared ${what}`);
  };

  const exportData = async () => {
    const local: Record<string, string> = {};
    for (let i = 0; i < localStorage.length; i += 1) {
      const key = localStorage.key(i);
      if (key) local[key] = localStorage.getItem(key) ?? "";
    }
    let files: unknown[] = [];
    try {
      files = (await getAll<Record<string, unknown>>("nodes")).map(({ blob: _blob, ...rest }) => rest);
    } catch {
      files = [];
    }
    const body = { format: "private-os-data-export", exported: new Date().toISOString(), settings: local, files, note: "File contents and vault items are not included. Use Private Files → Backup for a full backup." };
    downloadBlob(new Blob([JSON.stringify(body, null, 2)], { type: "application/json" }), `private-os-data-${Date.now()}.json`);
    flash("Exported your data");
  };

  const NAV = [
    { id: "overview", label: "Overview", sub: "What stays where", icon: LayoutDashboard },
    { id: "controls", label: "Controls", sub: "Privacy switches", icon: Shield },
    { id: "permissions", label: "Permissions", sub: "Browser controlled", icon: KeyRound },
    { id: "data", label: "Local data", sub: "Storage and clearing", icon: Database },
    { id: "activity", label: "Activity", sub: "On-device log", icon: ActivityIcon, badge: activity.length },
  ];

  return (
    <div className="flex min-h-0 flex-1 flex-col md:flex-row">
      <AppSidebar brand="Privacy Center" brandSub="Your data, your rules" brandIcon={ShieldCheck} items={NAV} active={page} onSelect={setPage} />
      <div className="min-h-0 flex-1 overflow-y-auto p-4 md:p-6">
        {note && <p role="status" className="mb-3 rounded-lg bg-primary/15 px-3 py-2 text-[11px] text-primary">{note}</p>}

        {page === "overview" && (
          <>
            <PageTitle title="Overview" heading="A plain explanation of how PRIVATE OS handles your information" />
            <div className="grid gap-3 md:grid-cols-2">
              <Panel>
                <p className="text-xs font-semibold text-emerald-300">Stays on this device</p>
                <ul className="mt-2 list-disc space-y-1 pl-4 text-[11px] text-muted-foreground">
                  <li>Settings, wallpapers, notes and app data (browser storage)</li>
                  <li>Private Files and Private Vault (IndexedDB)</li>
                  <li>Browsing history, bookmarks and the activity log</li>
                  <li>Your vault password — never stored, never sent</li>
                </ul>
              </Panel>
              <Panel>
                <p className="text-xs font-semibold text-amber-300">Sent to servers</p>
                <ul className="mt-2 list-disc space-y-1 pl-4 text-[11px] text-muted-foreground">
                  <li>Addresses you open in PRIVATE Engine go to the PRIVATE OS page loader, which fetches them from the website</li>
                  <li>Searches go to your chosen search engine ({privacy.searchEngine})</li>
                  <li>Embedded apps (Figure Cloud, Cherrion, YouTube…) talk to their own servers</li>
                </ul>
              </Panel>
              <Panel>
                <p className="text-xs font-semibold">Telemetry</p>
                <p className="mt-2 text-[11px] text-muted-foreground">PRIVATE OS collects no usage analytics, so there is nothing to switch off.</p>
              </Panel>
              <Panel>
                <p className="text-xs font-semibold">Controlled by your browser</p>
                <p className="mt-2 text-[11px] text-muted-foreground">Camera, microphone, location and notifications are granted by your browser, not PRIVATE OS. Change them in your browser's site settings.</p>
              </Panel>
            </div>
            <p className="mt-4 text-[10px] text-muted-foreground">PRIVATE OS is not a VPN, does not make you anonymous, and does not block trackers across your device.</p>
          </>
        )}

        {page === "controls" && (
          <>
            <PageTitle title="Controls" heading="Every switch changes how the apps behave right away" />
            <Panel className="divide-y divide-white/10 py-1">
              <Toggle label="Third-party websites" description="Allow PRIVATE Engine to load outside websites through the page loader. Off = nothing leaves the device from PRIVATE Engine." checked={privacy.thirdParty} onChange={(v) => setPrivacy({ thirdParty: v })} />
              <Toggle label="Save browsing history" description="PRIVATE Engine records pages from normal tabs." checked={privacy.saveHistory} onChange={(v) => setPrivacy({ saveHistory: v })} />
              <Toggle label="Reopen tabs" description="PRIVATE Engine restores normal tabs. Off also deletes the saved tab list." checked={privacy.restoreTabs} onChange={(v) => setPrivacy({ restoreTabs: v })} />
              <Toggle label="HTTPS-only addresses" description="Typed http:// addresses are upgraded to https://." checked={privacy.httpsOnly} onChange={(v) => setPrivacy({ httpsOnly: v })} />
              <Toggle label="Remember recent files" description="Private Files keeps a Recent list." checked={privacy.recentFiles} onChange={(v) => setPrivacy({ recentFiles: v })} />
              <Toggle label="Activity log" description="Write privacy events to the on-device log." checked={privacy.activityLog} onChange={(v) => setPrivacy({ activityLog: v })} />
            </Panel>
            <button type="button" onClick={() => { if (window.confirm("Reset all privacy settings to their defaults?")) { resetPrivacy(); flash("Privacy settings reset"); } }} className={`${btnGhost} mt-3`}><RotateCcw className="size-3.5" /> Reset privacy settings</button>
          </>
        )}

        {page === "permissions" && (
          <>
            <PageTitle title="Permissions" heading="Current state reported by your browser"><button type="button" onClick={() => void readPerms()} className={btnGhost}>Refresh</button></PageTitle>
            <Panel className="divide-y divide-white/10 py-1">
              {PERMISSIONS.map((p) => {
                const state = perms[p.name] ?? "…";
                const tone = state === "granted" ? "bg-emerald-500/20 text-emerald-300" : state === "denied" ? "bg-red-500/20 text-red-300" : "bg-white/10 text-muted-foreground";
                return (
                  <div key={p.name} className="flex items-center justify-between gap-3 py-3">
                    <div><p className="text-xs font-semibold">{p.label}</p><p className="text-[10px] text-muted-foreground">Used by {p.used}</p></div>
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold capitalize ${tone}`}>{state === "prompt" ? "Ask" : state}</span>
                  </div>
                );
              })}
            </Panel>
            <p className="mt-3 text-[11px] text-muted-foreground">To revoke a permission, open your browser's site settings for this page. PRIVATE OS cannot change them for you.</p>
          </>
        )}

        {page === "data" && (
          <>
            <PageTitle title="Local data" heading="What is stored in this browser">
              <button type="button" onClick={() => void exportData()} className={btnGhost}><Download className="size-3.5" /> Export my data</button>
            </PageTitle>
            {usage?.estimate && (
              <Panel className="mb-3">
                <div className="mb-2 flex justify-between text-[11px]"><span className="flex items-center gap-1.5 font-semibold"><HardDrive className="size-3.5" /> Site storage</span><span className="text-muted-foreground">{formatBytes(usage.estimate.usage)} of {formatBytes(usage.estimate.quota)}</span></div>
                <Meter value={usage.estimate.usage} max={usage.estimate.quota} />
              </Panel>
            )}
            <Panel className="divide-y divide-white/10 py-1">
              {usage?.local.map((row) => (
                <div key={row.label} className="flex items-center justify-between py-2.5 text-xs"><span>{row.label}</span><span className="tabular-nums text-muted-foreground">{formatBytes(row.bytes)}</span></div>
              ))}
              <div className="flex items-center justify-between py-2.5 text-xs"><span>Private Files items</span><span className="tabular-nums text-muted-foreground">{usage?.nodes ?? 0}</span></div>
              <div className="flex items-center justify-between py-2.5 text-xs"><span>Encrypted vault items</span><span className="tabular-nums text-muted-foreground">{usage?.vault ?? 0}</span></div>
            </Panel>
            <p className="mb-2 mt-5 text-xs font-semibold">Clear selected data</p>
            <div className="flex flex-wrap gap-2">
              {["browsing history", "bookmarks", "saved tabs", "the activity log"].map((what) => <button key={what} type="button" onClick={() => void clear(what)} className={btnGhost}><Trash2 className="size-3.5" /> {what[0]!.toUpperCase() + what.slice(1)}</button>)}
              <button type="button" onClick={() => void clear("all Private Files")} className={btnDanger}><Trash2 className="size-3.5" /> All Private Files</button>
            </div>
            <p className="mt-2 text-[10px] text-muted-foreground">The Private Vault is cleared from inside Private Files, so it can't be wiped by accident.</p>
          </>
        )}

        {page === "activity" && (
          <>
            <PageTitle title="Activity" heading={privacy.activityLog ? "Privacy events recorded on this device" : "The activity log is turned off"}>
              <button type="button" disabled={!activity.length} onClick={() => void clear("the activity log")} className={btnGhost}><Trash2 className="size-3.5" /> Clear</button>
            </PageTitle>
            <Panel className="divide-y divide-white/10 py-1">
              {activity.length ? activity.map((a, i) => (
                <div key={`${a.at}-${i}`} className="flex items-start justify-between gap-3 py-2.5">
                  <div><p className="text-xs">{a.text}</p><p className="text-[10px] text-muted-foreground">{a.app}</p></div>
                  <span className="shrink-0 text-[10px] tabular-nums text-muted-foreground">{new Date(a.at).toLocaleString()}</span>
                </div>
              )) : <p className="py-3 text-[11px] text-muted-foreground">Nothing recorded yet.</p>}
            </Panel>
          </>
        )}
      </div>
    </div>
  );
}
