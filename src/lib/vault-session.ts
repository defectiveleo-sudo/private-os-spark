import { clearStore, deleteMany, getAll, getOne, openFilesDb, putMany } from "./files-db";
import { createVault, decryptBytes, encryptBytes, unlockVault, WrongPasswordError, type VaultMeta } from "./vault-crypto";
import { logActivity, readPrivacy } from "./privacy";

// Private Vault session. The derived key lives only in this module's memory (a non-extractable CryptoKey),
// is never written to storage, and disappears when the vault is locked or the page is closed.

export { WrongPasswordError };

export class VaultCorruptError extends Error {
  constructor(message = "This item is damaged or was changed, so it cannot be decrypted.") {
    super(message);
    this.name = "VaultCorruptError";
  }
}

export type VaultRecord = {
  id: string;
  createdAt: number;
  iv: Uint8Array<ArrayBuffer>;
  data: ArrayBuffer;
  metaIv: Uint8Array<ArrayBuffer>;
  meta: ArrayBuffer;
};

export type VaultItem = { id: string; name: string; mime: string; size: number; createdAt: number; ok: boolean };

type Header = { name: string; mime: string; size: number };

let key: CryptoKey | null = null;
let timer: number | null = null;
const listeners = new Set<() => void>();

const emit = () => listeners.forEach((listener) => listener());
export const subscribeVault = (listener: () => void) => {
  listeners.add(listener);
  return () => { listeners.delete(listener); };
};
export const isVaultUnlocked = () => key !== null;

function arm() {
  if (timer !== null) window.clearTimeout(timer);
  timer = null;
  const minutes = readPrivacy().vaultAutoLock;
  if (key && minutes > 0) timer = window.setTimeout(() => lockVault("auto"), minutes * 60_000);
}

/** Call on user activity inside the vault to postpone the automatic lock. */
export const touchVault = () => { if (key) arm(); };

export function lockVault(reason: "manual" | "auto" = "manual") {
  if (!key) return;
  key = null;
  if (timer !== null) window.clearTimeout(timer);
  timer = null;
  logActivity("Private Vault", reason === "auto" ? "Vault locked automatically after inactivity" : "Vault locked");
  emit();
}

export const getVaultMeta = () => getOne<VaultMeta>("meta", "vault");

export async function createVaultWithPassword(password: string) {
  if (await getVaultMeta()) throw new Error("A vault already exists.");
  const created = await createVault(password);
  await putMany("meta", [created.meta]);
  key = created.key;
  arm();
  logActivity("Private Vault", "Vault created");
  emit();
}

export async function unlockWithPassword(password: string) {
  const meta = await getVaultMeta();
  if (!meta) throw new Error("There is no vault yet.");
  key = await unlockVault(meta, password);
  arm();
  logActivity("Private Vault", "Vault unlocked");
  emit();
}

const enc = new TextEncoder();
const dec = new TextDecoder();

function requireKey(): CryptoKey {
  if (!key) throw new Error("The vault is locked.");
  return key;
}

async function readHeader(record: VaultRecord, withKey: CryptoKey): Promise<Header> {
  try {
    const parsed = JSON.parse(dec.decode(await decryptBytes(withKey, record.metaIv, record.meta))) as Partial<Header>;
    if (typeof parsed.name !== "string") throw new Error("bad header");
    return { name: parsed.name, mime: typeof parsed.mime === "string" ? parsed.mime : "application/octet-stream", size: typeof parsed.size === "number" ? parsed.size : 0 };
  } catch {
    throw new VaultCorruptError();
  }
}

export async function listVaultItems(): Promise<VaultItem[]> {
  const k = requireKey();
  const records = await getAll<VaultRecord>("vault");
  const items = await Promise.all(records.map(async (record): Promise<VaultItem> => {
    try {
      const header = await readHeader(record, k);
      return { id: record.id, createdAt: record.createdAt, ok: true, ...header };
    } catch {
      return { id: record.id, createdAt: record.createdAt, ok: false, name: "Damaged item", mime: "", size: 0 };
    }
  }));
  return items.sort((a, b) => b.createdAt - a.createdAt);
}

export async function addToVault(files: { name: string; mime: string; blob: Blob }[]) {
  const k = requireKey();
  const records: VaultRecord[] = [];
  for (const file of files) {
    const body = await encryptBytes(k, await file.blob.arrayBuffer());
    const header: Header = { name: file.name, mime: file.mime || "application/octet-stream", size: file.blob.size };
    const head = await encryptBytes(k, enc.encode(JSON.stringify(header)));
    records.push({ id: crypto.randomUUID(), createdAt: Date.now(), iv: body.iv, data: body.data, metaIv: head.iv, meta: head.data });
  }
  await putMany("vault", records);
  arm();
  logActivity("Private Vault", `${records.length} file${records.length === 1 ? "" : "s"} encrypted`);
  emit();
}

export async function readVaultItem(id: string): Promise<{ name: string; mime: string; blob: Blob }> {
  const k = requireKey();
  const record = await getOne<VaultRecord>("vault", id);
  if (!record) throw new VaultCorruptError("That item no longer exists.");
  const header = await readHeader(record, k);
  let plain: ArrayBuffer;
  try {
    plain = await decryptBytes(k, record.iv, record.data);
  } catch {
    throw new VaultCorruptError();
  }
  arm();
  return { name: header.name, mime: header.mime, blob: new Blob([plain], { type: header.mime }) };
}

export async function removeVaultItems(ids: string[]) {
  await deleteMany("vault", ids);
  arm();
  logActivity("Private Vault", `${ids.length} encrypted item${ids.length === 1 ? "" : "s"} deleted`);
  emit();
}

/** Re-encrypts everything under a new password. Nothing is changed unless every item can be read first. */
export async function changeVaultPassword(oldPassword: string, newPassword: string) {
  const meta = await getVaultMeta();
  if (!meta) throw new Error("There is no vault yet.");
  const oldKey = await unlockVault(meta, oldPassword);
  const records = await getAll<VaultRecord>("vault");
  const plain: { createdAt: number; id: string; body: ArrayBuffer; head: ArrayBuffer }[] = [];
  for (const record of records) {
    try {
      plain.push({ id: record.id, createdAt: record.createdAt, body: await decryptBytes(oldKey, record.iv, record.data), head: await decryptBytes(oldKey, record.metaIv, record.meta) });
    } catch {
      throw new VaultCorruptError("At least one item is damaged, so the password was not changed. Nothing was modified.");
    }
  }
  const created = await createVault(newPassword);
  const rebuilt: VaultRecord[] = [];
  for (const item of plain) {
    const body = await encryptBytes(created.key, item.body);
    const head = await encryptBytes(created.key, item.head);
    rebuilt.push({ id: item.id, createdAt: item.createdAt, iv: body.iv, data: body.data, metaIv: head.iv, meta: head.data });
  }
  const db = await openFilesDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(["vault", "meta"], "readwrite");
    rebuilt.forEach((record) => tx.objectStore("vault").put(record));
    tx.objectStore("meta").put(created.meta);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error ?? new Error("Saving failed."));
    tx.onabort = () => reject(tx.error ?? new Error("Saving was cancelled."));
  });
  key = created.key;
  arm();
  logActivity("Private Vault", "Vault password changed");
  emit();
}

/** The only way forward if the password is lost: delete the vault and everything in it. */
export async function eraseVault() {
  await clearStore("vault");
  await deleteMany("meta", ["vault"]);
  key = null;
  if (timer !== null) window.clearTimeout(timer);
  logActivity("Private Vault", "Vault erased");
  emit();
}

export function passwordStrength(password: string): { score: 0 | 1 | 2 | 3 | 4; label: string } {
  let score = 0;
  if (password.length >= 10) score += 1;
  if (password.length >= 14) score += 1;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score += 1;
  if (/\d/.test(password) && /[^A-Za-z0-9]/.test(password)) score += 1;
  const clamped = Math.min(4, score) as 0 | 1 | 2 | 3 | 4;
  return { score: clamped, label: ["Too weak", "Weak", "Okay", "Good", "Strong"][clamped] ?? "Too weak" };
}
