import { useCallback, useEffect, useState, useSyncExternalStore, type FormEvent } from "react";
import { Eye, KeyRound, Lock, LockOpen, Plus, RotateCcw, ShieldAlert, Trash2, Upload, Download } from "lucide-react";
import { btn, btnDanger, btnGhost, btnPrimary, downloadBlob, formatBytes, Panel } from "./private-ui";
import { addToVault, changeVaultPassword, createVaultWithPassword, eraseVault, getVaultMeta, isVaultUnlocked, listVaultItems, lockVault, passwordStrength, readVaultItem, removeVaultItems, subscribeVault, touchVault, unlockWithPassword, VaultCorruptError, WrongPasswordError, type VaultItem } from "../lib/vault-session";
import { importFiles, notifyFiles, type FileNode } from "../lib/files-model";
import { readPrivacy } from "../lib/privacy";

const field = "w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-xs outline-none focus:border-primary";

function useUnlocked() {
  return useSyncExternalStore(subscribeVault, isVaultUnlocked, () => false);
}

function PasswordField({ label, value, onChange, autoFocus, autoComplete }: { label: string; value: string; onChange: (value: string) => void; autoFocus?: boolean; autoComplete: "new-password" | "current-password" }) {
  return (
    <label className="block text-[11px] font-semibold">
      {label}
      <input type="password" value={value} autoFocus={autoFocus} autoComplete={autoComplete} onChange={(event) => onChange(event.target.value)} className={`${field} mt-1`} />
    </label>
  );
}

function StrengthBar({ password }: { password: string }) {
  const { score, label } = passwordStrength(password);
  return (
    <div aria-live="polite">
      <div className="mt-1 flex gap-1" aria-hidden>{[1, 2, 3, 4].map((step) => <span key={step} className={`h-1 flex-1 rounded-full ${score >= step ? "bg-primary" : "bg-white/10"}`} />)}</div>
      <p className="mt-1 text-[10px] text-muted-foreground">Strength: {label}. Use 12 or more characters; a few random words work well.</p>
    </div>
  );
}

function describe(error: unknown): string {
  if (error instanceof WrongPasswordError) return "That password is incorrect. The vault stays locked.";
  if (error instanceof VaultCorruptError) return error.message;
  if (error instanceof Error) return error.message;
  return "Something went wrong.";
}

type PreviewState = { name: string; url: string; mime: string } | null;

export function VaultPanel({ nodes, onMessage, onVaultCount }: { nodes: FileNode[]; onMessage: (text: string) => void; onVaultCount: (count: number) => void }) {
  const unlocked = useUnlocked();
  const [exists, setExists] = useState<boolean | null>(null);
  const [items, setItems] = useState<VaultItem[]>([]);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [ack, setAck] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [mode, setMode] = useState<"main" | "change" | "erase">("main");
  const [oldPw, setOldPw] = useState("");
  const [typed, setTyped] = useState("");
  const [preview, setPreview] = useState<PreviewState>(null);

  const refresh = useCallback(async () => {
    setExists(Boolean(await getVaultMeta()));
    if (isVaultUnlocked()) {
      try {
        const list = await listVaultItems();
        setItems(list);
        onVaultCount(list.length);
      } catch {
        setItems([]);
      }
    } else setItems([]);
  }, [onVaultCount]);

  useEffect(() => {
    void refresh();
    return subscribeVault(() => void refresh());
  }, [refresh]);

  useEffect(() => () => { if (preview) URL.revokeObjectURL(preview.url); }, [preview]);

  const run = async (task: () => Promise<void>) => {
    setBusy(true);
    setError("");
    try {
      await task();
    } catch (err) {
      setError(describe(err));
    } finally {
      setBusy(false);
    }
  };

  const create = (event: FormEvent) => {
    event.preventDefault();
    if (password.length < 10) return setError("Use at least 10 characters.");
    if (password !== confirm) return setError("The two passwords don't match.");
    if (!ack) return setError("Please confirm that you understand there is no password recovery.");
    void run(async () => {
      await createVaultWithPassword(password);
      setPassword("");
      setConfirm("");
      setAck(false);
      onMessage("Vault created and unlocked.");
    });
  };

  const unlock = (event: FormEvent) => {
    event.preventDefault();
    void run(async () => {
      await unlockWithPassword(password);
      setPassword("");
    });
  };

  const addFiles = (files: File[]) => {
    if (!files.length) return;
    void run(async () => {
      await addToVault(files.map((file) => ({ name: file.name, mime: file.type, blob: file })));
      onMessage(`${files.length} file${files.length === 1 ? "" : "s"} encrypted. Your original copies on this device (outside the vault) were not touched.`);
    });
  };

  const openItem = (item: VaultItem, action: "preview" | "download" | "restore") => {
    touchVault();
    void run(async () => {
      const plain = await readVaultItem(item.id);
      if (action === "download") downloadBlob(plain.blob, plain.name);
      else if (action === "preview") setPreview({ name: plain.name, url: URL.createObjectURL(plain.blob), mime: plain.mime });
      else {
        await importFiles(nodes, null, [new File([plain.blob], plain.name, { type: plain.mime })]);
        await removeVaultItems([item.id]);
        onMessage(`"${plain.name}" was decrypted and moved to My Files.`);
        notifyFiles();
      }
    });
  };

  const change = (event: FormEvent) => {
    event.preventDefault();
    if (password.length < 10) return setError("Use at least 10 characters for the new password.");
    if (password !== confirm) return setError("The two new passwords don't match.");
    void run(async () => {
      await changeVaultPassword(oldPw, password);
      setOldPw("");
      setPassword("");
      setConfirm("");
      setMode("main");
      onMessage("Password changed. Every item was re-encrypted.");
    });
  };

  const erase = (event: FormEvent) => {
    event.preventDefault();
    if (typed !== "ERASE") return setError('Type ERASE in capital letters to confirm.');
    void run(async () => {
      await eraseVault();
      setTyped("");
      setMode("main");
      onMessage("The vault and everything in it was deleted.");
    });
  };

  if (exists === null) return <p className="p-6 text-sm text-muted-foreground">Checking vault…</p>;

  const notes = (
    <ul className="mt-3 list-disc space-y-1 pl-4 text-[11px] leading-relaxed text-muted-foreground">
      <li>Files and their names are encrypted on this device with AES-256-GCM. The key comes from your password using PBKDF2-SHA-256 (600,000 rounds) and is kept only in memory while the vault is unlocked.</li>
      <li>Your password and key are never saved and never sent anywhere. Nothing from the vault is uploaded.</li>
      <li><strong>There is no password recovery.</strong> If you forget the password, the contents cannot be opened by anyone, including PRIVATE OS. Back up your vault from Home, and keep your password safe.</li>
      <li>This protects files stored in this browser. It does not hide that a vault exists, and it cannot protect a device that is already compromised.</li>
    </ul>
  );

  if (!exists) {
    return (
      <Panel className="mx-auto max-w-lg">
        <p className="flex items-center gap-2 text-sm font-bold"><Lock className="size-4 text-primary" /> Create your Private Vault</p>
        <p className="mt-1 text-[11px] text-muted-foreground">Optional. Choose a master password to encrypt files you want extra protection for.</p>
        <form onSubmit={create} className="mt-3 space-y-3">
          <PasswordField label="Master password" value={password} onChange={setPassword} autoFocus autoComplete="new-password" />
          <StrengthBar password={password} />
          <PasswordField label="Repeat password" value={confirm} onChange={setConfirm} autoComplete="new-password" />
          <label className="flex items-start gap-2 text-[11px]"><input type="checkbox" checked={ack} onChange={(event) => setAck(event.target.checked)} className="mt-0.5" /> I understand that if I forget this password my vault cannot be recovered.</label>
          {error && <p role="alert" className="text-[11px] text-red-300">{error}</p>}
          <button type="submit" disabled={busy} className={btnPrimary}>{busy ? "Creating…" : "Create vault"}</button>
        </form>
        {notes}
      </Panel>
    );
  }

  if (!unlocked) {
    return (
      <Panel className="mx-auto max-w-lg">
        <p className="flex items-center gap-2 text-sm font-bold"><Lock className="size-4 text-primary" /> Private Vault is locked</p>
        {mode === "erase" ? (
          <form onSubmit={erase} className="mt-3 space-y-3">
            <p className="flex items-start gap-2 rounded-lg bg-red-500/10 p-3 text-[11px] text-red-200"><ShieldAlert className="mt-0.5 size-4 shrink-0" /> This permanently deletes the vault and every encrypted file in it. It cannot be undone and cannot be recovered. Only do this if you lost the password and accept losing the contents.</p>
            <label className="block text-[11px] font-semibold">Type ERASE to confirm<input value={typed} onChange={(event) => setTyped(event.target.value)} className={`${field} mt-1`} autoComplete="off" /></label>
            {error && <p role="alert" className="text-[11px] text-red-300">{error}</p>}
            <div className="flex gap-2"><button type="submit" disabled={busy} className={btnDanger}>Erase vault</button><button type="button" onClick={() => { setMode("main"); setError(""); }} className={btnGhost}>Cancel</button></div>
          </form>
        ) : (
          <form onSubmit={unlock} className="mt-3 space-y-3">
            <PasswordField label="Master password" value={password} onChange={setPassword} autoFocus autoComplete="current-password" />
            {error && <p role="alert" className="text-[11px] text-red-300">{error}</p>}
            <div className="flex flex-wrap gap-2"><button type="submit" disabled={busy || !password} className={btnPrimary}><LockOpen className="size-3.5" />{busy ? "Unlocking…" : "Unlock"}</button><button type="button" onClick={() => { setMode("erase"); setError(""); setPassword(""); }} className={btnGhost}>Forgot password…</button></div>
          </form>
        )}
        {notes}
      </Panel>
    );
  }

  const minutes = readPrivacy().vaultAutoLock;
  return (
    <div onPointerDown={touchVault} onKeyDown={touchVault} className="space-y-3">
      <Panel>
        <div className="flex flex-wrap items-center gap-2">
          <p className="mr-auto flex items-center gap-2 text-sm font-bold"><LockOpen className="size-4 text-primary" /> Vault unlocked <span className="text-[11px] font-normal text-muted-foreground">{minutes > 0 ? `locks after ${minutes} min of inactivity` : "locks only when you lock it"}</span></p>
          <label className={`${btnPrimary} cursor-pointer`}><Upload className="size-3.5" /> Add files<input type="file" multiple hidden onChange={(event) => { addFiles(Array.from(event.target.files ?? [])); event.target.value = ""; }} /></label>
          <button type="button" className={btnGhost} onClick={() => { setMode(mode === "change" ? "main" : "change"); setError(""); }}><KeyRound className="size-3.5" /> Change password</button>
          <button type="button" className={btnGhost} onClick={() => lockVault("manual")}><Lock className="size-3.5" /> Lock now</button>
        </div>
        {mode === "change" && (
          <form onSubmit={change} className="mt-3 grid gap-3 sm:grid-cols-3">
            <PasswordField label="Current password" value={oldPw} onChange={setOldPw} autoComplete="current-password" />
            <div><PasswordField label="New password" value={password} onChange={setPassword} autoComplete="new-password" /><StrengthBar password={password} /></div>
            <PasswordField label="Repeat new password" value={confirm} onChange={setConfirm} autoComplete="new-password" />
            <div className="sm:col-span-3 flex gap-2"><button type="submit" disabled={busy} className={btnPrimary}>{busy ? "Re-encrypting…" : "Change password"}</button><button type="button" className={btnGhost} onClick={() => setMode("main")}>Cancel</button></div>
          </form>
        )}
        {error && <p role="alert" className="mt-2 text-[11px] text-red-300">{error}</p>}
      </Panel>
      <Panel className="!p-2">
        {items.length === 0 && <p className="p-6 text-center text-xs text-muted-foreground">The vault is empty. Add files here, or choose “Move to Vault” on a file in My Files.</p>}
        <ul>
          {items.map((item) => (
            <li key={item.id} className="flex flex-wrap items-center gap-2 rounded-xl px-3 py-2 hover:bg-white/5">
              <Lock className="size-4 shrink-0 text-primary" aria-hidden />
              <div className="min-w-0 flex-1"><p className="truncate text-xs font-semibold">{item.name}</p><p className="text-[10px] text-muted-foreground">{item.ok ? `${formatBytes(item.size)} · added ${new Date(item.createdAt).toLocaleDateString()}` : "Can't be decrypted: damaged or changed. You can delete it."}</p></div>
              {item.ok && <button type="button" className={btnGhost} onClick={() => openItem(item, "preview")}><Eye className="size-3.5" /> View</button>}
              {item.ok && <button type="button" className={btnGhost} onClick={() => openItem(item, "download")}><Download className="size-3.5" /> Decrypt and download</button>}
              {item.ok && <button type="button" className={btnGhost} onClick={() => openItem(item, "restore")}><RotateCcw className="size-3.5" /> Move to My Files</button>}
              <button type="button" aria-label={`Delete ${item.name} from the vault`} className={btnDanger} onClick={() => { if (window.confirm(`Permanently delete "${item.name}" from the vault?`)) void run(() => removeVaultItems([item.id])); }}><Trash2 className="size-3.5" /></button>
            </li>
          ))}
        </ul>
      </Panel>
      {notes}
      {preview && (
        <div role="dialog" aria-modal="true" aria-label={`Preview of ${preview.name}`} className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4" onClick={() => setPreview(null)}>
          <div onClick={(event) => event.stopPropagation()} className="glass-panel flex max-h-[85dvh] w-[min(40rem,100%)] flex-col rounded-2xl p-3">
            <div className="mb-2 flex items-center gap-2"><p className="min-w-0 flex-1 truncate text-xs font-bold">{preview.name} <span className="font-normal text-muted-foreground">(decrypted in memory)</span></p><button type="button" className={btnGhost} onClick={() => setPreview(null)}><Plus className="size-3.5 rotate-45" /> Close</button></div>
            <div className="min-h-0 flex-1 overflow-auto rounded-lg bg-black/30 p-2">
              {preview.mime.startsWith("image/") ? <img src={preview.url} alt={preview.name} className="mx-auto max-h-[70dvh] object-contain" /> : preview.mime.startsWith("video/") ? <video src={preview.url} controls className="mx-auto max-h-[70dvh]" /> : preview.mime.startsWith("audio/") ? <audio src={preview.url} controls className="w-full" /> : preview.mime === "application/pdf" ? <iframe title={preview.name} src={preview.url} className="h-[70dvh] w-full rounded bg-white" /> : <p className="p-6 text-center text-xs text-muted-foreground">No preview for this file type. Use “Decrypt and download”.</p>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
