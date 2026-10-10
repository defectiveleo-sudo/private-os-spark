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
};

export const DEFAULT_PRIVACY: PrivacySettings = {
  saveHistory: true,
  restoreTabs: true,
  httpsOnly: true,
  thirdParty: true,
  recentFiles: true,
  activityLog: true,
  searchEngine: "duckduckgo",
};

export const PRIVACY_KEY = "pos-privacy";
export const ACTIVITY_KEY = "pos-privacy-activity";
export const ENGINE_KEYS = { history: "pos-engine-history", bookmarks: "pos-engine-bookmarks", tabs: "pos-engine-tabs" } as const;
export const PRIVACY_EVENT = "pos-privacy-change";
export const ACTIVITY_EVENT = "pos-activity-change";
export const FILES_EVENT = "pos-files-changed";

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
