import { useState, type ReactNode } from "react";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";

// Search engines for words typed in the address bar. Results always come back as a list inside the
// browser: the search sites themselves refuse searches that arrive through the secure engine (DuckDuckGo
// shows an error, Bing an empty page, Brave a captcha), so this site's server reads the results instead.
export type SearchEngineId = "private" | "bing";
export const SEARCH_ENGINES: { id: SearchEngineId; name: string; host: string; note: string; source: "duckduckgo" | "bing" }[] = [
  { id: "private", name: "Private Search", host: "", note: "Built in and fastest. DuckDuckGo results, shown as a list here.", source: "duckduckgo" },
  { id: "bing", name: "Bing", host: "bing.com", note: "Microsoft's results, shown as a list here.", source: "bing" },
];

const SETUP_KEY = "pos-browser-setup";
const ENGINE_KEY = "pos-browser-engine";
const BAR_KEY = "pos-browser-bookmarks-bar";

function read(key: string) {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}
function write(key: string, value: string) {
  try {
    localStorage.setItem(key, value);
  } catch {
    // storage unavailable: the choice lasts until the window closes
  }
}

export type BrowserPrefs = { setupDone: boolean; engine: SearchEngineId; bookmarksBar: boolean };
export function readBrowserPrefs(): BrowserPrefs {
  const engine = read(ENGINE_KEY);
  return {
    setupDone: read(SETUP_KEY) === "1",
    engine: SEARCH_ENGINES.some((item) => item.id === engine) ? (engine as SearchEngineId) : "private",
    bookmarksBar: read(BAR_KEY) === "1",
  };
}
export function saveBrowserPrefs(prefs: BrowserPrefs) {
  write(SETUP_KEY, prefs.setupDone ? "1" : "0");
  write(ENGINE_KEY, prefs.engine);
  write(BAR_KEY, prefs.bookmarksBar ? "1" : "0");
}

// First-run page, laid out like a desktop browser's own welcome screen: one choice to keep the defaults,
// one to pick a search engine and the bookmarks bar.
export function BrowserSetup({ logo, prefs, renderIcon, done }: { logo: ReactNode; prefs: BrowserPrefs; renderIcon: (host: string) => ReactNode; done: (prefs: BrowserPrefs) => void }) {
  const [step, setStep] = useState<"hello" | "configure">("hello");
  const [engine, setEngine] = useState<SearchEngineId>(prefs.engine);
  const [bar, setBar] = useState(prefs.bookmarksBar);
  return (
    <div className="hel-setup absolute inset-0 z-20 flex flex-col overflow-auto text-white">
      {step === "hello" ? (
        <div key="hello" className="m-auto flex max-w-[34rem] flex-col items-center px-6 py-10 text-center [animation:rise_.35s_cubic-bezier(.22,1,.36,1)]">
          <div className="size-16">{logo}</div>
          <h1 className="mt-5 text-[clamp(1.7rem,3.6vw,2.7rem)] font-semibold leading-tight whitespace-nowrap tracking-[-.01em]">Meet PRIVATE Browser</h1>
          <p className="mt-3 text-[clamp(.95rem,1.4vw,1.2rem)] leading-snug text-[#afbeff]">Let's set up your browser just the way you want it. If you're in a rush, keep the defaults: Shields on, built-in search and nothing saved off this device.</p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <button type="button" onClick={() => done({ setupDone: true, engine: prefs.engine, bookmarksBar: prefs.bookmarksBar })} className="hel-setup-ghost flex h-[42px] items-center gap-2.5 rounded-lg px-5 text-[14px] font-medium">
              <Check className="size-4" />Use defaults
            </button>
            <button type="button" onClick={() => setStep("configure")} className="flex h-[42px] items-center gap-2.5 rounded-lg bg-white px-5 text-[14px] font-medium text-[#313131] hover:bg-white/90">
              <ArrowRight className="size-4" />Configure
            </button>
          </div>
        </div>
      ) : (
        <div key="configure" className="m-auto w-full max-w-[34rem] px-6 py-10 [animation:rise_.35s_cubic-bezier(.22,1,.36,1)]">
          <button type="button" onClick={() => setStep("hello")} className="mb-4 flex items-center gap-1.5 text-[13px] text-[#afbeff] hover:text-white"><ArrowLeft className="size-4" />Back</button>
          <h2 className="text-[clamp(1.6rem,3vw,2.2rem)] font-semibold leading-tight">Search engine</h2>
          <p className="mt-1 text-[14px] text-[#afbeff]">Used for anything you type in the address bar that isn't a web address.</p>
          <div role="radiogroup" aria-label="Search engine" className="mt-5 space-y-2">
            {SEARCH_ENGINES.map((item) => (
              <button key={item.id} type="button" role="radio" aria-checked={engine === item.id} onClick={() => setEngine(item.id)} className={`hel-setup-option flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left ${engine === item.id ? "is-on" : ""}`}>
                <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-white/10">{item.host ? renderIcon(item.host) : <span className="size-5">{logo}</span>}</span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[14px] font-semibold">{item.name}</span>
                  <span className="block truncate text-[12px] text-[#c5cefc]/80">{item.note}</span>
                </span>
                <span className={`grid size-5 shrink-0 place-items-center rounded-full border-2 ${engine === item.id ? "border-white bg-white text-[#24398f]" : "border-white/40"}`}>{engine === item.id && <Check className="size-3" strokeWidth={3} />}</span>
              </button>
            ))}
          </div>
          <label className="hel-setup-option mt-5 flex cursor-pointer items-center gap-3 rounded-xl px-4 py-3">
            <span className="min-w-0 flex-1">
              <span className="block text-[14px] font-semibold">Always show the bookmarks bar</span>
              <span className="block text-[12px] text-[#c5cefc]/80">Otherwise it shows once you bookmark a page with the star.</span>
            </span>
            <input type="checkbox" checked={bar} onChange={(event) => setBar(event.target.checked)} className="size-4 accent-white" />
          </label>
          <button type="button" onClick={() => done({ setupDone: true, engine, bookmarksBar: bar })} className="mt-7 flex h-[42px] w-full items-center justify-center gap-2.5 rounded-lg bg-white text-[14px] font-medium text-[#313131] hover:bg-white/90">
            <Check className="size-4" />Done
          </button>
        </div>
      )}
      <p className="mt-auto px-6 pb-5 text-center text-[11px] leading-snug text-[#a5b5f8]">History, bookmarks and sign-ins stay in this browser on this device.<br />You can change these choices later from the menu in the top right.</p>
    </div>
  );
}
