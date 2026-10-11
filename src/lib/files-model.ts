import { base64ToBytes, bytesToBase64, clearStore, deleteMany, getAll, getOne, putMany } from "./files-db";
import { FILES_EVENT, logActivity, readPrivacy } from "./privacy";
import type { VaultMeta } from "./vault-crypto";
import type { VaultRecord } from "./vault-session";

// Private Files data model. Files and folders live in IndexedDB inside this browser (PRIVATE OS-managed files).

export type FileNode = {
  id: string;
  parentId: string | null;
  name: string;
  kind: "file" | "folder";
  mime: string;
  size: number;
  createdAt: number;
  modifiedAt: number;
  accessedAt: number;
  favorite: boolean;
  trashedAt: number | null;
  trashParent: string | null;
  blob: Blob | null;
};

export const notifyFiles = () => window.dispatchEvent(new Event(FILES_EVENT));
const newId = () => crypto.randomUUID();

export async function loadNodes(): Promise<FileNode[]> {
  const init = await getOne<{ key: string }>("meta", "init");
  if (!init) {
    const now = Date.now();
    const base = { parentId: null, kind: "folder" as const, mime: "", size: 0, createdAt: now, modifiedAt: now, accessedAt: now, favorite: false, trashedAt: null, trashParent: null, blob: null };
    await putMany("nodes", [{ ...base, id: newId(), name: "Documents" }, { ...base, id: newId(), name: "Downloads" }]);
    await putMany("meta", [{ key: "init", at: now }]);
  }
  return getAll<FileNode>("nodes");
}

export const byId = (nodes: FileNode[]) => new Map(nodes.map((node) => [node.id, node]));

/** A node is "in the trash" if it or any parent folder was trashed. */
export function inTrash(node: FileNode, map: Map<string, FileNode>): boolean {
  let current: FileNode | undefined = node;
  for (let guard = 0; current && guard < 64; guard += 1) {
    if (current.trashedAt !== null) return true;
    current = current.parentId ? map.get(current.parentId) : undefined;
  }
  return false;
}

export function descendantIds(nodes: FileNode[], id: string): string[] {
  const out: string[] = [];
  const queue = [id];
  while (queue.length) {
    const head = queue.shift() as string;
    nodes.forEach((node) => {
      if (node.parentId === head) {
        out.push(node.id);
        queue.push(node.id);
      }
    });
  }
  return out;
}

export function pathOf(nodes: FileNode[], id: string | null): FileNode[] {
  const map = byId(nodes);
  const path: FileNode[] = [];
  let current = id ? map.get(id) : undefined;
  for (let guard = 0; current && guard < 64; guard += 1) {
    path.unshift(current);
    current = current.parentId ? map.get(current.parentId) : undefined;
  }
  return path;
}

export function cleanName(raw: string): string {
  return raw.replace(/[\\/\u0000-\u001f]/g, "").trim().slice(0, 120);
}

function uniqueName(nodes: FileNode[], parentId: string | null, name: string, ignoreId?: string): string {
  const taken = new Set(nodes.filter((node) => node.parentId === parentId && node.trashedAt === null && node.id !== ignoreId).map((node) => node.name.toLowerCase()));
  if (!taken.has(name.toLowerCase())) return name;
  const dot = name.lastIndexOf(".");
  const stem = dot > 0 ? name.slice(0, dot) : name;
  const ext = dot > 0 ? name.slice(dot) : "";
  for (let n = 2; n < 1000; n += 1) {
    const candidate = `${stem} (${n})${ext}`;
    if (!taken.has(candidate.toLowerCase())) return candidate;
  }
  return `${stem} (${Date.now()})${ext}`;
}

export const mimeFromName = (name: string): string => {
  const ext = name.split(".").pop()?.toLowerCase() ?? "";
  const map: Record<string, string> = { txt: "text/plain", md: "text/markdown", json: "application/json", csv: "text/csv", html: "text/html", css: "text/css", js: "text/javascript", pdf: "application/pdf", png: "image/png", jpg: "image/jpeg", jpeg: "image/jpeg", gif: "image/gif", webp: "image/webp", svg: "image/svg+xml", mp3: "audio/mpeg", wav: "audio/wav", ogg: "audio/ogg", mp4: "video/mp4", webm: "video/webm" };
  return map[ext] ?? "";
};

function make(parentId: string | null, name: string, blob: Blob | null, mime: string): FileNode {
  const now = Date.now();
  return { id: newId(), parentId, name, kind: blob === null ? "folder" : "file", mime, size: blob?.size ?? 0, createdAt: now, modifiedAt: now, accessedAt: now, favorite: false, trashedAt: null, trashParent: null, blob };
}

export async function createFolder(nodes: FileNode[], parentId: string | null, rawName: string) {
  const name = cleanName(rawName);
  if (!name) throw new Error("Give the folder a name.");
  const node = make(parentId, uniqueName(nodes, parentId, name), null, "");
  await putMany("nodes", [node]);
  notifyFiles();
  return node;
}

export async function createTextFile(nodes: FileNode[], parentId: string | null, rawName: string, text = "") {
  const name = cleanName(rawName);
  if (!name) throw new Error("Give the file a name.");
  const full = name.includes(".") ? name : `${name}.txt`;
  const node = make(parentId, uniqueName(nodes, parentId, full), new Blob([text], { type: "text/plain" }), mimeFromName(full) || "text/plain");
  await putMany("nodes", [node]);
  notifyFiles();
  return node;
}

export async function importFiles(nodes: FileNode[], parentId: string | null, files: File[]) {
  const created: FileNode[] = [];
  const working = [...nodes];
  for (const file of files) {
    const name = uniqueName(working, parentId, cleanName(file.name) || "file");
    const node = make(parentId, name, file, file.type || mimeFromName(name));
    created.push(node);
    working.push(node);
  }
  await putMany("nodes", created);
  logActivity("Private Files", `${created.length} file${created.length === 1 ? "" : "s"} imported from your device`);
  notifyFiles();
  return created.length;
}

export async function saveText(node: FileNode, text: string) {
  const blob = new Blob([text], { type: node.mime || "text/plain" });
  await putMany("nodes", [{ ...node, blob, size: blob.size, modifiedAt: Date.now(), accessedAt: Date.now() }]);
  notifyFiles();
}

export async function renameNode(nodes: FileNode[], node: FileNode, rawName: string) {
  const name = cleanName(rawName);
  if (!name) throw new Error("Names cannot be empty.");
  const unique = uniqueName(nodes, node.parentId, name, node.id);
  await putMany("nodes", [{ ...node, name: unique, modifiedAt: Date.now() }]);
  notifyFiles();
}

export async function moveNodes(nodes: FileNode[], ids: string[], parentId: string | null) {
  const updated: FileNode[] = [];
  const working = [...nodes];
  for (const id of ids) {
    const node = working.find((item) => item.id === id);
    if (!node) continue;
    if (parentId === node.id || (parentId && descendantIds(nodes, node.id).includes(parentId))) throw new Error("A folder cannot be moved into itself.");
    if (node.parentId === parentId) continue;
    const next = { ...node, parentId, name: uniqueName(working, parentId, node.name, node.id), modifiedAt: Date.now() };
    updated.push(next);
    working[working.indexOf(node)] = next;
  }
  if (updated.length) await putMany("nodes", updated);
  notifyFiles();
  return updated.length;
}

export async function copyNodes(nodes: FileNode[], ids: string[], parentId: string | null) {
  const created: FileNode[] = [];
  const working = [...nodes];
  const copyOne = (source: FileNode, target: string | null, top: boolean) => {
    const name = top ? uniqueName(working, target, source.name) : source.name;
    const clone: FileNode = { ...source, id: newId(), parentId: target, name, createdAt: Date.now(), modifiedAt: Date.now(), accessedAt: Date.now(), favorite: false, trashedAt: null, trashParent: null };
    created.push(clone);
    working.push(clone);
    nodes.filter((child) => child.parentId === source.id).forEach((child) => copyOne(child, clone.id, false));
  };
  ids.forEach((id) => {
    const node = nodes.find((item) => item.id === id);
    if (node) copyOne(node, parentId, true);
  });
  if (created.length) await putMany("nodes", created);
  notifyFiles();
  return created.length;
}

export async function trashNodes(nodes: FileNode[], ids: string[]) {
  const now = Date.now();
  const updated = ids.flatMap((id) => {
    const node = nodes.find((item) => item.id === id);
    return node ? [{ ...node, trashedAt: now, trashParent: node.parentId }] : [];
  });
  await putMany("nodes", updated);
  notifyFiles();
}

export async function restoreNodes(nodes: FileNode[], ids: string[]) {
  const map = byId(nodes);
  const working = [...nodes];
  const updated: FileNode[] = [];
  for (const id of ids) {
    const node = map.get(id);
    if (!node) continue;
    const parent = node.trashParent ? map.get(node.trashParent) : undefined;
    const parentId = parent && !inTrash(parent, map) ? parent.id : null;
    const next = { ...node, parentId, trashedAt: null, trashParent: null, name: uniqueName(working, parentId, node.name, node.id) };
    updated.push(next);
    working[working.indexOf(node)] = next;
  }
  await putMany("nodes", updated);
  notifyFiles();
}

export async function deleteForever(nodes: FileNode[], ids: string[]) {
  const all = new Set<string>();
  ids.forEach((id) => {
    all.add(id);
    descendantIds(nodes, id).forEach((child) => all.add(child));
  });
  await deleteMany("nodes", [...all]);
  notifyFiles();
  return all.size;
}

export async function setFavorite(nodes: FileNode[], ids: string[], favorite: boolean) {
  await putMany("nodes", ids.flatMap((id) => {
    const node = nodes.find((item) => item.id === id);
    return node ? [{ ...node, favorite }] : [];
  }));
  notifyFiles();
}

/** Remembers that a file was opened. Does nothing when "recent files" is switched off in Privacy Center. */
export async function touchNode(node: FileNode) {
  if (!readPrivacy().recentFiles || node.kind !== "file") return;
  await putMany("nodes", [{ ...node, accessedAt: Date.now() }]);
  notifyFiles();
}

export function sortNodes(list: FileNode[], key: "name" | "modified" | "size" | "type", dir: "asc" | "desc") {
  const sign = dir === "asc" ? 1 : -1;
  const ext = (node: FileNode) => (node.kind === "folder" ? "" : node.name.split(".").pop()?.toLowerCase() ?? "");
  return [...list].sort((a, b) => {
    if (a.kind !== b.kind) return a.kind === "folder" ? -1 : 1;
    const by = key === "name" ? a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: "base" }) : key === "modified" ? a.modifiedAt - b.modifiedAt : key === "size" ? a.size - b.size : ext(a).localeCompare(ext(b)) || a.name.localeCompare(b.name);
    return by * sign;
  });
}

export const totalBytes = (nodes: FileNode[]) => nodes.reduce((sum, node) => sum + (node.kind === "file" ? node.size : 0), 0);

export type PreviewKind = "image" | "video" | "audio" | "pdf" | "text" | "none";
export function previewKind(node: FileNode): PreviewKind {
  if (node.kind === "folder") return "none";
  const mime = node.mime || mimeFromName(node.name);
  if (mime.startsWith("image/")) return "image";
  if (mime.startsWith("video/")) return "video";
  if (mime.startsWith("audio/")) return "audio";
  if (mime === "application/pdf") return "pdf";
  if (mime.startsWith("text/") || mime === "application/json" || /\.(txt|md|json|csv|log|ts|tsx|js|jsx|css|html|xml|ya?ml|ini)$/i.test(node.name)) return "text";
  return "none";
}

// ---------- backup and restore (.pfbackup) ----------
const MAGIC = "PFBK1\n";
type ManifestNode = Omit<FileNode, "blob"> & { off: number; len: number };
type Manifest = {
  version: 1;
  createdAt: number;
  nodes: ManifestNode[];
  vault: null | { meta: { salt: string; iterations: number; checkIv: string; check: string }; items: { id: string; createdAt: number; iv: string; metaIv: string; meta: string; off: number; len: number }[] };
};

/** Builds a backup file. With `ids`, only those items (and everything inside folders) are included, without the vault. */
export async function createBackup(nodes: FileNode[], ids?: string[]): Promise<Blob> {
  const chosen = ids ? new Set(ids.flatMap((id) => [id, ...descendantIds(nodes, id)])) : null;
  const parts: Blob[] = [];
  let offset = 0;
  const entries: ManifestNode[] = [];
  for (const node of nodes) {
    if (chosen && !chosen.has(node.id)) continue;
    const { blob, ...rest } = node;
    const len = blob?.size ?? 0;
    entries.push({ ...rest, parentId: chosen && node.parentId && !chosen.has(node.parentId) ? null : node.parentId, off: offset, len });
    if (blob) {
      parts.push(blob);
      offset += len;
    }
  }
  let vault: Manifest["vault"] = null;
  if (!chosen) {
    const meta = await getOne<VaultMeta>("meta", "vault");
    if (meta) {
      const records = await getAll<VaultRecord>("vault");
      const items = records.map((record) => {
        const entry = { id: record.id, createdAt: record.createdAt, iv: bytesToBase64(record.iv), metaIv: bytesToBase64(record.metaIv), meta: bytesToBase64(new Uint8Array(record.meta)), off: offset, len: record.data.byteLength };
        parts.push(new Blob([record.data]));
        offset += record.data.byteLength;
        return entry;
      });
      vault = { meta: { salt: bytesToBase64(meta.salt), iterations: meta.iterations, checkIv: bytesToBase64(meta.checkIv), check: bytesToBase64(new Uint8Array(meta.check)) }, items };
    }
  }
  const manifest: Manifest = { version: 1, createdAt: Date.now(), nodes: entries, vault };
  const json = new TextEncoder().encode(JSON.stringify(manifest));
  const length = new Uint8Array(4);
  new DataView(length.buffer).setUint32(0, json.byteLength);
  return new Blob([MAGIC, length, json, ...parts], { type: "application/octet-stream" });
}

const str = (value: unknown, fallback = "") => (typeof value === "string" ? value : fallback);
const num = (value: unknown, fallback = 0) => (typeof value === "number" && Number.isFinite(value) ? value : fallback);

export type RestoreResult = { added: number; skipped: number; vault: "restored" | "kept-existing" | "none" };

export async function restoreBackup(file: File, mode: "merge" | "replace"): Promise<RestoreResult> {
  const head = new Uint8Array(await file.slice(0, MAGIC.length + 4).arrayBuffer());
  if (new TextDecoder().decode(head.subarray(0, MAGIC.length)) !== MAGIC) throw new Error("This is not a Private Files backup.");
  const length = new DataView(head.buffer, head.byteOffset + MAGIC.length, 4).getUint32(0);
  if (length > 64 * 1024 * 1024 || MAGIC.length + 4 + length > file.size) throw new Error("This backup is damaged.");
  let manifest: Manifest;
  try {
    manifest = JSON.parse(new TextDecoder().decode(await file.slice(MAGIC.length + 4, MAGIC.length + 4 + length).arrayBuffer())) as Manifest;
  } catch {
    throw new Error("This backup is damaged.");
  }
  if (manifest.version !== 1 || !Array.isArray(manifest.nodes)) throw new Error("This backup was made by a newer version and cannot be read.");
  const base = MAGIC.length + 4 + length;
  const slice = (off: number, len: number, type = "") => {
    if (off < 0 || len < 0 || base + off + len > file.size) throw new Error("This backup is damaged.");
    return file.slice(base + off, base + off + len, type);
  };
  if (mode === "replace") await clearStore("nodes");
  const existing = new Set(mode === "merge" ? (await getAll<FileNode>("nodes")).map((node) => node.id) : []);
  const incoming = new Set(manifest.nodes.map((node) => str(node.id)));
  const restored: FileNode[] = [];
  let skipped = 0;
  for (const raw of manifest.nodes) {
    const id = str(raw.id);
    if (!id || existing.has(id)) {
      skipped += 1;
      continue;
    }
    const kind = raw.kind === "folder" ? "folder" : "file";
    const parentId = typeof raw.parentId === "string" && (incoming.has(raw.parentId) || existing.has(raw.parentId)) ? raw.parentId : null;
    const mime = str(raw.mime);
    restored.push({ id, parentId, name: cleanName(str(raw.name, "file")) || "file", kind, mime, size: num(raw.size), createdAt: num(raw.createdAt, Date.now()), modifiedAt: num(raw.modifiedAt, Date.now()), accessedAt: num(raw.accessedAt, Date.now()), favorite: raw.favorite === true, trashedAt: typeof raw.trashedAt === "number" ? raw.trashedAt : null, trashParent: typeof raw.trashParent === "string" ? raw.trashParent : null, blob: kind === "file" ? slice(num(raw.off), num(raw.len), mime) : null });
  }
  if (restored.length) await putMany("nodes", restored);
  await putMany("meta", [{ key: "init", at: Date.now() }]);
  let vault: RestoreResult["vault"] = "none";
  if (manifest.vault) {
    const current = await getOne<VaultMeta>("meta", "vault");
    if (current && mode === "merge") vault = "kept-existing";
    else {
      await clearStore("vault");
      const meta: VaultMeta = { key: "vault", version: 1, salt: base64ToBytes(str(manifest.vault.meta.salt)), iterations: num(manifest.vault.meta.iterations, 600_000), checkIv: base64ToBytes(str(manifest.vault.meta.checkIv)), check: base64ToBytes(str(manifest.vault.meta.check)).buffer };
      const items: VaultRecord[] = await Promise.all(manifest.vault.items.map(async (item) => ({ id: str(item.id), createdAt: num(item.createdAt), iv: base64ToBytes(str(item.iv)), metaIv: base64ToBytes(str(item.metaIv)), meta: base64ToBytes(str(item.meta)).buffer, data: await slice(num(item.off), num(item.len)).arrayBuffer() })));
      await putMany("meta", [meta]);
      await putMany("vault", items);
      vault = "restored";
    }
  }
  logActivity("Private Files", `Backup restored (${restored.length} items)`);
  notifyFiles();
  return { added: restored.length, skipped, vault };
}
