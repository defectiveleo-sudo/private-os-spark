// Small IndexedDB wrapper for Private Files and Private Vault. Everything stays in this browser.

export type StoreName = "nodes" | "vault" | "meta";

const DB_NAME = "private-os-files";
const VERSION = 1;
let dbPromise: Promise<IDBDatabase> | null = null;

export function openFilesDb(): Promise<IDBDatabase> {
  if (!dbPromise) {
    dbPromise = new Promise((resolve, reject) => {
      if (typeof indexedDB === "undefined") return reject(new Error("This browser does not support local file storage."));
      const request = indexedDB.open(DB_NAME, VERSION);
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains("nodes")) db.createObjectStore("nodes", { keyPath: "id" });
        if (!db.objectStoreNames.contains("vault")) db.createObjectStore("vault", { keyPath: "id" });
        if (!db.objectStoreNames.contains("meta")) db.createObjectStore("meta", { keyPath: "key" });
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => {
        dbPromise = null;
        reject(request.error ?? new Error("Could not open local storage."));
      };
    });
  }
  return dbPromise;
}

export async function getAll<T>(store: StoreName): Promise<T[]> {
  const db = await openFilesDb();
  return new Promise((resolve, reject) => {
    const request = db.transaction(store).objectStore(store).getAll();
    request.onsuccess = () => resolve(request.result as T[]);
    request.onerror = () => reject(request.error);
  });
}

export async function getOne<T>(store: StoreName, key: string): Promise<T | undefined> {
  const db = await openFilesDb();
  return new Promise((resolve, reject) => {
    const request = db.transaction(store).objectStore(store).get(key);
    request.onsuccess = () => resolve(request.result as T | undefined);
    request.onerror = () => reject(request.error);
  });
}

function write(store: StoreName, action: (s: IDBObjectStore) => void): Promise<void> {
  return openFilesDb().then(
    (db) =>
      new Promise<void>((resolve, reject) => {
        const tx = db.transaction(store, "readwrite");
        action(tx.objectStore(store));
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error ?? new Error("Saving failed."));
        tx.onabort = () => reject(tx.error ?? new Error("Saving was cancelled — storage may be full."));
      }),
  );
}

export const putMany = (store: StoreName, items: unknown[]) => write(store, (s) => items.forEach((item) => s.put(item)));
export const deleteMany = (store: StoreName, keys: string[]) => write(store, (s) => keys.forEach((key) => s.delete(key)));
export const clearStore = (store: StoreName) => write(store, (s) => s.clear());

export function bytesToBase64(bytes: Uint8Array): string {
  let binary = "";
  for (let i = 0; i < bytes.length; i += 0x8000) binary += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  return btoa(binary);
}

export function base64ToBytes(text: string): Uint8Array<ArrayBuffer> {
  const binary = atob(text);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
  return bytes;
}
