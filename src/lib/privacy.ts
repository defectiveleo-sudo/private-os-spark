import { useSyncExternalStore } from "react";

export type SearchEngine = "duckduckgo" | "brave" | "wikipedia";

export type PrivacySettings = {
  /** PRIVATE Engine records visited pages in local history (never for private tabs). */
  saveHistory: boolean;
  /** PRIVATE Engine reopens normal tabs after a refresh (never private tabs). */
  restoreTabs: boolean;
  /** Typed http:// addresses are upgraded to https:// before loading. */
  httpsOnly: boolean;
  /** PRIVATE Engine may load third-party websites through the PRIVATE OS page loader. */
  thirdParty: boolean;
  /** Private Files remembers recently opened files. */
  recentFiles: boolean;
  /** Privacy events are written to the on-device activity log. */
  activityLog: boolean;
  searchEngine: SearchEngine;
  /** PRIVATE Engine removes well-known tracking parameters (utm_*, fbclid, gclid...) from addresses you open. */
  stripTracking: boolean;
  /** "embed" shows pages inside PRIVATE Engine; "newtab" opens every address in a real browser tab instead. */
  navigation: "embed" | "newtab";
  /** Optional on-device usage counters (app opens). Nothing is ever sent anywhere. */
  telemetry: boolean;
  /** Document apps may download their helper libraries (jsDelivr) the first time they are used. */
  allowCdn: boolean;
  /** Weather may look up a city and forecast with Open-Meteo. */
  allowWeather: boolean;
  /** Typed searches may be sent to the PRIVATE OS server, which asks public search engines. Off = searches open in a real browser tab. */
  allowSearchService: boolean;
  allowCamera: boolean;
  allowMic: boolean;
  allowScreen: boolean;
  /** Minutes of inactivity before Private Vault locks itself (0 = only when you lock it). */
  vaultAutoLock: number;
};

export const DEFAULT_PRIVACY: PrivacySettings = {
  saveHistory: true,
  restoreTabs: true,
  httpsOnly: true,
  thirdParty: true,
  recentFiles: true,
  activityLog: true,
  searchEngine: "duckduckgo",
  stripTracking: true,
  navigation: "embed",
  telemetry: false,
  allowCdn: true,
  allowWeather: true,
  allowSearchService: true,
  allowCamera: true,
  allowMic: true,
  allowScreen: true,
  vaultAutoLock: 5,
};

export const PRIVACY_KEY = "pos-privacy";
export const ACTIVITY_KEY = "pos-privacy-activity";
export const ENGINE_KEYS = { history: "pos-engine-history", bookmarks: "pos-engine-bookmarks", tabs: "pos-engine-tabs" } as const;
export const PRIVACY_EVENT = "pos-privacy-change";
export const ACTIVITY_EVENT = "pos-activity-change";
export const FILES_EVENT = "pos-files-changed";
export const USAGE_KEY = "pos-usage";

let cacheRaw: string | null | undefined;
let cacheValue: PrivacySettings = DEFAULT_PRIVACY;

export function readPrivacy(): PrivacySettings {
  if (typeof window === "undefined") return DEFAULT_PRIVACY;
  let raw: string | null = null;
  try {
    raw = localStorage.getItem(PRIVACY_KEY);
  } catch {
    raw = null;
  }
  if (raw === cacheRaw) return cacheValue;
  cacheRaw = raw;
  try {
    cacheValue = raw ? { ...DEFAULT_PRIVACY, ...(JSON.parse(raw) as Partial<PrivacySettings>) } : DEFAULT_PRIVACY;
  } catch {
    cacheValue = DEFAULT_PRIVACY;
  }
  return cacheValue;
}

export function setPrivacy(patch: Partial<PrivacySettings>) {
  const next = { ...readPrivacy(), ...patch };
  localStorage.setItem(PRIVACY_KEY, JSON.stringify(next));
  window.dispatchEvent(new Event(PRIVACY_EVENT));
}

export function resetPrivacy() {
  localStorage.removeItem(PRIVACY_KEY);
  window.dispatchEvent(new Event(PRIVACY_EVENT));
}

function subscribe(callback: () => void) {
  window.addEventListener(PRIVACY_EVENT, callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener(PRIVACY_EVENT, callback);
    window.removeEventListener("storage", callback);
  };
}

export function usePrivacy() {
  return useSyncExternalStore(subscribe, readPrivacy, () => DEFAULT_PRIVACY);
}

export type Activity = { at: number; app: string; text: string };

export function readActivity(): Activity[] {
  try {
    const list = JSON.parse(localStorage.getItem(ACTIVITY_KEY) ?? "[]") as Activity[];
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}

export function logActivity(app: string, text: string) {
  if (typeof window === "undefined" || !readPrivacy().activityLog) return;
  try {
    const next = [{ at: Date.now(), app, text }, ...readActivity()].slice(0, 200);
    localStorage.setItem(ACTIVITY_KEY, JSON.stringify(next));
    window.dispatchEvent(new Event(ACTIVITY_EVENT));
  } catch {
    // storage full or blocked: the log is optional
  }
}

export function clearActivity() {
  localStorage.removeItem(ACTIVITY_KEY);
  window.dispatchEvent(new Event(ACTIVITY_EVENT));
}

export function searchUrl(engine: SearchEngine, query: string) {
  const q = encodeURIComponent(query);
  if (engine === "brave") return `https://search.brave.com/search?q=${q}`;
  if (engine === "wikipedia") return `https://en.wikipedia.org/w/index.php?search=${q}`;
  return `https://html.duckduckgo.com/html/?q=${q}`;
}

/** Turns what the user typed into a web address: a URL, a bare domain, or a search. */
export function normalizeAddress(input: string, httpsOnly: boolean, engine: SearchEngine): string {
  const text = input.trim();
  if (!text) return "";
  let candidate: string | null = null;
  if (/^https?:\/\//i.test(text)) candidate = text;
  else if (!/\s/.test(text) && /^[\w-]+(\.[\w-]+)+(:\d+)?(\/.*)?$/i.test(text)) candidate = `https://${text}`;
  if (candidate) {
    try {
      const url = new URL(candidate);
      if (httpsOnly && url.protocol === "http:") url.protocol = "https:";
      return url.href;
    } catch {
      // fall through to search
    }
  }
  return searchUrl(engine, text);
}

// ---------- tracking parameters ----------
const TRACKING = /^(utm_[a-z]+|fbclid|gclid|dclid|msclkid|mc_eid|mc_cid|igshid|yclid|_hsenc|_hsmi|spm|ref_src|ref_url)$/i;

/** Removes well-known tracking parameters from an address. Returns the new address and how many were removed. */
export function stripTrackingParams(address: string): { url: string; removed: number } {
  try {
    const url = new URL(address);
    let removed = 0;
    [...url.searchParams.keys()].forEach((key) => {
      if (TRACKING.test(key)) {
        url.searchParams.delete(key);
        removed += 1;
      }
    });
    return { url: removed ? url.href : address, removed };
  } catch {
    return { url: address, removed: 0 };
  }
}

// ---------- optional on-device usage counters ----------
export function readUsage(): Record<string, number> {
  try {
    const data = JSON.parse(localStorage.getItem(USAGE_KEY) ?? "{}") as Record<string, number>;
    return data && typeof data === "object" ? data : {};
  } catch {
    return {};
  }
}

/** Counts an app open, but only when the optional diagnostics switch is on. The counts never leave the device. */
export function bumpUsage(app: string) {
  if (typeof window === "undefined" || !readPrivacy().telemetry) return;
  try {
    const next = readUsage();
    next[app] = (next[app] ?? 0) + 1;
    localStorage.setItem(USAGE_KEY, JSON.stringify(next));
    window.dispatchEvent(new Event(ACTIVITY_EVENT));
  } catch {
    // optional
  }
}

export function clearUsage() {
  localStorage.removeItem(USAGE_KEY);
  window.dispatchEvent(new Event(ACTIVITY_EVENT));
}

// ---------- measuring and clearing local data ----------
export type LocalGroup = { id: string; label: string; description: string; keys: (key: string) => boolean };

const exact = (...names: string[]) => (key: string) => names.includes(key);

export const LOCAL_GROUPS: LocalGroup[] = [
  { id: "look", label: "Look and settings", description: "Theme, wallpaper choice, dock, widgets and saved configs.", keys: exact("pos-settings", "pos-configs", "pos-wallpaper", "pos-wisp-choice", "pos-wisp-last") },
  { id: "legacy-files", label: "Files (older app)", description: "Documents saved by Writer, Sheets, Slides and the original Files app.", keys: exact("pos-fs", "pos-note-path", "pos-open") },
  { id: "notes", label: "Notes, tasks and games list", description: "Sticky notes, to-dos, the quick note widget, weather city and your games.", keys: exact("pos-sticky", "pos-todos", "pos-widget-note", "pos-city", "pos-games") },
  { id: "history", label: "Browsing history", description: "Pages PRIVATE Engine remembered (never from private tabs).", keys: exact(ENGINE_KEYS.history) },
  { id: "bookmarks", label: "Bookmarks", description: "Pages you starred in PRIVATE Engine.", keys: exact(ENGINE_KEYS.bookmarks) },
  { id: "tabs", label: "Saved tabs", description: "Normal tabs PRIVATE Engine reopens after a refresh.", keys: exact(ENGINE_KEYS.tabs) },
  { id: "activity", label: "Activity log and usage counters", description: "The on-device privacy activity log and optional usage counters.", keys: exact(ACTIVITY_KEY, USAGE_KEY) },
];

function allKeys(): string[] {
  const keys: string[] = [];
  try {
    for (let i = 0; i < localStorage.length; i += 1) {
      const key = localStorage.key(i);
      if (key) keys.push(key);
    }
  } catch {
    // storage blocked
  }
  return keys;
}

/** Browsers store strings as UTF-16, so size is estimated as two bytes per character. */
export function localBytes(match: (key: string) => boolean): number {
  return allKeys().filter(match).reduce((sum, key) => sum + (key.length + (localStorage.getItem(key)?.length ?? 0)) * 2, 0);
}

export function clearLocalKeys(match: (key: string) => boolean) {
  allKeys().filter(match).forEach((key) => localStorage.removeItem(key));
  window.dispatchEvent(new Event(PRIVACY_EVENT));
  window.dispatchEvent(new Event(ACTIVITY_EVENT));
  window.dispatchEvent(new Event(FILES_EVENT));
}

/** Every PRIVATE OS setting kept in localStorage, for the "export my data" button. */
export function exportLocalData(): Record<string, string> {
  const out: Record<string, string> = {};
  allKeys().filter((key) => key.startsWith("pos-")).forEach((key) => { out[key] = localStorage.getItem(key) ?? ""; });
  return out;
}

type IdbWithList = { databases?: () => Promise<{ name?: string }[]> };

function deleteDb(name: string) {
  return new Promise<void>((resolve) => {
    const request = indexedDB.deleteDatabase(name);
    request.onsuccess = () => resolve();
    request.onerror = () => resolve();
    request.onblocked = () => resolve();
  });
}

async function dbNames(): Promise<string[]> {
  try {
    const dbs = (await (indexedDB as unknown as IdbWithList).databases?.()) ?? [];
    return dbs.flatMap((db) => (db.name ? [db.name] : []));
  } catch {
    return [];
  }
}

/** Wipes everything PRIVATE OS stores in this browser: localStorage, sessionStorage, IndexedDB, caches and workers. */
export async function wipeAllLocalData() {
  try {
    localStorage.clear();
    sessionStorage.clear();
  } catch {
    // blocked
  }
  await Promise.all((await dbNames()).map(deleteDb));
  try {
    const workers = (await navigator.serviceWorker?.getRegistrations?.()) ?? [];
    await Promise.all(workers.map((worker) => worker.unregister()));
    await Promise.all((await caches.keys()).map((name) => caches.delete(name)));
  } catch {
    // not available
  }
}
