import { useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, Check, Gauge, Languages, Monitor, Sparkles, Volume2 } from "lucide-react";
import { LANGUAGES, t, textDir, type Lang } from "@/lib/i18n";

// First-run setup, shown once after the first boot: hello, language, pick an OS, name, look, preferences, finish.
// The OS, the name and the theme are required; Next stays off until each is chosen.
// The language applies to the whole OS as soon as it is picked, so the rest of setup is already in it.

export type Edition = "private" | "nova";
export type WelcomeResult = { edition: Edition; userName: string; theme: string; accent: string; novaTheme: string; uiStyle: "classic" | "modern"; uiSounds: boolean; lite: boolean; reduceMotion: boolean; language: Lang };
type ThemeChoice = { id: string; name: string; sub: string; accent: string; glass?: boolean; colors?: string[] | undefined };

const HELLOS = ["Hello", "Bonjour", "Hola", "مرحبا", "Ciao", "こんにちは", "Hallo", "Olá", "Привет", "안녕하세요"];
const STEPS = ["Welcome", "Language", "System", "Name", "Look", "Preferences", "Ready"];
const LAST = STEPS.length - 1;
const LANG_STEP = 1;
const OS_STEP = 2;
const NAME_STEP = 3;
const LOOK_STEP = 4;
const PREFS_STEP = 5;

export function WelcomeSetup({ themes, novaThemes, onDone, lowPower, language, setLanguage }: { themes: ThemeChoice[]; novaThemes: ThemeChoice[]; onDone: (result: WelcomeResult) => void; lowPower: boolean; language: Lang; setLanguage: (lang: Lang) => void }) {
  const [step, setStep] = useState(0);
  const [hello, setHello] = useState(0);
  const [edition, setEdition] = useState<Edition | null>(null);
  const [name, setName] = useState("");
  const [theme, setTheme] = useState<ThemeChoice | null>(null);
  const [uiStyle, setUiStyle] = useState<"classic" | "modern">("classic");
  const [uiSounds, setUiSounds] = useState(true);
  const [lite, setLite] = useState(lowPower);
  const [reduceMotion, setReduceMotion] = useState(false);
  const [progress, setProgress] = useState(0);
  const [nudge, setNudge] = useState(false);
  const done = useRef(onDone);
  done.current = onDone;

  const nova = edition === "nova";
  const list = nova ? novaThemes : themes.slice(0, 12);
  const canNext = step === OS_STEP ? edition !== null : step === NAME_STEP ? name.trim().length > 0 : step === LOOK_STEP ? theme !== null : true;

  useEffect(() => {
    if (step !== 0) return;
    const timer = window.setInterval(() => setHello((value) => (value + 1) % HELLOS.length), 1600);
    return () => window.clearInterval(timer);
  }, [step]);

  useEffect(() => {
    if (step !== LAST) return;
    const timer = window.setInterval(() => setProgress((value) => Math.min(100, value + 4)), 60);
    return () => window.clearInterval(timer);
  }, [step]);

  useEffect(() => {
    if (step === LAST && progress >= 100 && edition && theme) {
      const timer = window.setTimeout(() => done.current({
        edition,
        userName: name.trim(),
        theme: nova ? "private" : theme.id,
        accent: nova ? "" : theme.accent,
        novaTheme: nova ? theme.id : "eclipse",
        uiStyle,
        uiSounds,
        lite,
        reduceMotion,
        language,
      }), 450);
      return () => window.clearTimeout(timer);
    }
    return undefined;
  }, [step, progress, edition, nova, name, theme, uiStyle, uiSounds, lite, reduceMotion, language]);

  // Choosing the other OS resets the theme, because each OS has its own themes.
  const pickEdition = (value: Edition) => {
    if (value !== edition) setTheme(null);
    setEdition(value);
  };

  const next = () => {
    if (!canNext) {
      setNudge(true);
      window.setTimeout(() => setNudge(false), 500);
      return;
    }
    setStep((value) => Math.min(LAST, value + 1));
  };
  const back = () => setStep((value) => Math.max(0, value - 1));

  // Enter moves to the next step, but only once the step is filled in.
  const nextRef = useRef(next);
  nextRef.current = next;
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "Enter" || event.repeat) return;
      event.stopPropagation();
      if (step < LAST) nextRef.current();
    };
    window.addEventListener("keydown", onKey, true);
    return () => window.removeEventListener("keydown", onKey, true);
  }, [step]);

  const accent = theme?.accent || (nova ? "#5eead4" : "#f2c783");

  return (
    <div role="dialog" aria-label={t("Set up your computer")} className="welcome-root fixed inset-0 z-[90] flex items-center justify-center overflow-hidden bg-black text-white" style={{ "--wa": accent } as React.CSSProperties}>
      <div aria-hidden className="welcome-orb welcome-orb-a" />
      <div aria-hidden className="welcome-orb welcome-orb-b" />
      <div aria-hidden className="welcome-orb welcome-orb-c" />

      {step === 0 ? (
        <div className="relative z-10 flex flex-col items-center text-center">
          <h1 key={hello} className="welcome-hello text-[clamp(3rem,12vw,7rem)] font-semibold leading-none tracking-tight">{HELLOS[hello]}</h1>
          <p dir={textDir()} className="mt-6 text-sm text-white/60 [animation:rise_.8s_.4s_both]">{t("Let's set up your computer")}</p>
          <button type="button" onClick={next} className="welcome-cta mt-10 flex items-center gap-2 rounded-full px-7 py-3 text-sm font-semibold [animation:rise_.8s_.8s_both]">{t("Get started")} <ArrowRight className="size-4" /></button>
        </div>
      ) : (
        <div key={step} dir={textDir()} className={`welcome-card relative z-10 rounded-[28px] p-7 ${step === OS_STEP ? "w-[min(46rem,calc(100%-2rem))]" : "w-[min(34rem,calc(100%-2rem))]"}`}>
          <div className="mb-6 flex items-center gap-1.5" aria-label={t("Step {n} of {total}", { n: step, total: LAST })}>
            {STEPS.slice(1).map((label, index) => <span key={label} className={`h-1 flex-1 rounded-full transition-all duration-500 ${index < step ? "bg-[var(--wa)]" : "bg-white/15"}`} />)}
          </div>

          {step === LANG_STEP && (
            <div className="stagger">
              <h2 className="flex items-center gap-2.5 text-2xl font-semibold"><Languages className="size-6 text-[var(--wa)]" />{t("Choose your language")}</h2>
              <p className="mt-1.5 text-sm text-white/55">{t("Menus, setup and the desktop use this language. You can change it any time in Settings.")}</p>
              <div role="radiogroup" aria-label={t("Language")} className="mt-5 grid grid-cols-2 gap-2">
                {LANGUAGES.map((item) => {
                  const on = item.id === language;
                  return (
                    <button key={item.id} type="button" role="radio" aria-checked={on} lang={item.id} onClick={() => setLanguage(item.id)} className={`flex items-center gap-3 rounded-2xl border px-3.5 py-3 text-start transition-all ${on ? "border-[var(--wa)] bg-white/10" : "border-white/10 bg-white/[.03] hover:bg-white/[.07]"}`}>
                      <span className="grid h-7 w-10 shrink-0 place-items-center rounded-lg bg-white/10 text-[10px] font-bold tracking-wider text-white/70">{item.abbr}</span>
                      <span className="min-w-0 flex-1">
                        <span dir={item.id === "ar" ? "rtl" : "ltr"} className="block text-sm font-semibold">{item.name}</span>
                        <span className="block text-[11px] text-white/45">{item.english}</span>
                      </span>
                      {on && <Check className="size-4 shrink-0 text-[var(--wa)]" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {step === OS_STEP && (
            <div className="stagger">
              <h2 className="text-2xl font-semibold">{t("Choose your operating system")}</h2>
              <p className="mt-1.5 text-sm text-white/55">{t("Both have every app. You can switch later in Settings.")}</p>
              <div dir="ltr" className="mt-5 grid gap-3 sm:grid-cols-2">
                {([
                  ["private", "PRIVATE OS", t("The classic"), t("Windows-style taskbar and Start menu, your photo wallpapers, and the look you know.")],
                  ["nova", "NOVA OS", t("Reimagined"), t("Live wallpapers, a Dynamic Island, a magnifying dock, Overview, Nova Search, new apps and smoother animations.")],
                ] as const).map(([id, title, tag, sub]) => {
                  const on = edition === id;
                  return (
                    <button key={id} type="button" aria-pressed={on} onClick={() => pickEdition(id)} className={`welcome-os group relative rounded-[22px] border p-2.5 text-left transition-all ${on ? "border-[var(--wa)] bg-white/10" : "border-white/10 bg-white/[.03] hover:bg-white/[.07]"}`}>
                      <OsPreview kind={id} />
                      <span className="mt-3 flex items-center gap-2 px-1">
                        <span className="text-[15px] font-semibold tracking-wide">{title}</span>
                        <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${id === "nova" ? "bg-gradient-to-r from-teal-300 to-violet-400 text-black" : "bg-white/15 text-white/80"}`}>{id === "nova" ? t("NEW") : tag}</span>
                        {on && <Check className="ml-auto size-4 text-[var(--wa)]" />}
                      </span>
                      <span dir={textDir()} className="mt-1 block px-1 pb-1 text-start text-[12px] leading-snug text-white/55">{sub}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {step === NAME_STEP && (
            <div className="stagger">
              <h2 className="text-2xl font-semibold">{t("What should we call you?")}</h2>
              <p className="mt-1.5 text-sm text-white/55">{t("Your name shows on the lock screen. It stays on this device.")}</p>
              <input autoFocus value={name} onChange={(event) => setName(event.target.value.slice(0, 24))} placeholder={t("Your name")} aria-label={t("Your name")} aria-required className={`mt-6 h-12 w-full rounded-2xl border bg-white/5 px-4 text-base outline-none transition-colors focus:border-[var(--wa)] ${nudge ? "welcome-shake border-red-400/70" : "border-white/15"}`} />
              {nudge && <p className="mt-2 text-xs text-red-300">{t("Please enter a name to continue.")}</p>}
            </div>
          )}

          {step === LOOK_STEP && (
            <div className="stagger">
              <h2 className="text-2xl font-semibold">{t("Choose your look")}</h2>
              <p className="mt-1.5 text-sm text-white/55">{nudge ? <span className="text-red-300">{t("Pick a theme to continue.")}</span> : nova ? t("Each NOVA theme has its own live wallpaper.") : t("You can change it any time in Settings.")}</p>
              <div className={`mt-5 grid max-h-[38dvh] grid-cols-3 gap-2 overflow-auto pr-1 sm:grid-cols-4 ${nudge ? "welcome-shake" : ""}`}>
                {list.map((item) => {
                  const on = item.id === theme?.id;
                  const color = item.accent || "#f2c783";
                  const colors = item.colors;
                  return (
                    <button key={item.id} type="button" aria-pressed={on} aria-label={`Theme ${item.name}`} onClick={() => setTheme(item)} className={`welcome-swatch rounded-2xl border p-2 text-left transition-all ${on ? "border-[var(--wa)] bg-white/10" : "border-white/10 bg-white/[.03] hover:bg-white/[.07]"}`}>
                      <span className="relative block h-12 overflow-hidden rounded-xl" style={{ background: colors ? `radial-gradient(circle at 20% 20%, ${colors[0]}, transparent 60%), radial-gradient(circle at 85% 30%, ${colors[1]}, transparent 55%), radial-gradient(circle at 50% 110%, ${colors[2]}, transparent 60%), #05060b` : `radial-gradient(circle at 30% 30%, ${color}, transparent 70%), linear-gradient(135deg, #111, #222)` }}>
                        {item.glass && <span className="absolute inset-x-2 bottom-1.5 h-3 rounded-full bg-white/25 backdrop-blur" />}
                        {on && <Check className="absolute right-1.5 top-1.5 size-4 rounded-full bg-white p-0.5 text-black" />}
                      </span>
                      <span className="mt-1.5 block truncate text-[11px] font-semibold">{item.name}</span>
                      {nova && <span className="block truncate text-[10px] text-white/45">{item.sub}</span>}
                    </button>
                  );
                })}
              </div>
              {!nova && (
                <div className="mt-4 grid grid-cols-2 gap-2">
                  {(["classic", "modern"] as const).map((style) => (
                    <button key={style} type="button" aria-pressed={uiStyle === style} onClick={() => setUiStyle(style)} className={`flex items-center gap-2 rounded-2xl border px-3 py-2.5 text-xs font-semibold transition-colors ${uiStyle === style ? "border-[var(--wa)] bg-white/10" : "border-white/10 hover:bg-white/5"}`}><Monitor className="size-4" />{style === "classic" ? t("Classic interface") : t("Modern interface")}</button>
                  ))}
                </div>
              )}
            </div>
          )}

          {step === PREFS_STEP && (
            <div className="stagger">
              <h2 className="text-2xl font-semibold">{t("A few preferences")}</h2>
              <p className="mt-1.5 text-sm text-white/55">{lowPower ? t("This device looks low-power, so Optimize is already on.") : t("Pick what feels right.")}</p>
              <div className="mt-5 space-y-2">
                <Pref icon={Volume2} title={t("Interface sounds")} sub={t("Soft clicks and hovers")} on={uiSounds} set={setUiSounds} />
                <Pref icon={Gauge} title={t("Optimize for speed")} sub={t("Turns off blur and glow on slow PCs")} on={lite} set={setLite} />
                <Pref icon={Sparkles} title={t("Reduce motion")} sub={t("Fewer animations")} on={reduceMotion} set={setReduceMotion} />
              </div>
            </div>
          )}

          {step === LAST && (
            <div className="py-4 text-center">
              <div className="welcome-ring mx-auto grid size-20 place-items-center rounded-full">{progress >= 100 ? <Check className="size-9 [animation:tile-pop_.3s_ease-out]" /> : <span className="text-sm font-semibold">{progress}%</span>}</div>
              <h2 className="mt-5 text-2xl font-semibold">{t("Hi {name}", { name: name.trim() })}</h2>
              <p className="mt-1.5 text-sm text-white/55">{progress < 40 ? (nova ? t("Building NOVA OS for you…") : t("Setting things up for you…")) : progress < 80 ? t("Applying your theme…") : progress < 100 ? `${t("Almost there")}…` : t("All set")}</p>
              <div className="mx-auto mt-5 h-1 w-48 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-[var(--wa)] transition-[width] duration-100" style={{ width: `${progress}%` }} /></div>
            </div>
          )}

          {step < LAST && (
            <div className="mt-7 flex items-center justify-between">
              <button type="button" onClick={back} className="flex items-center gap-1.5 rounded-full px-3 py-2 text-xs font-semibold text-white/60 hover:bg-white/10 hover:text-white"><ArrowLeft className="size-3.5 rtl:rotate-180" />{t("Back")}</button>
              <button type="button" onClick={next} aria-disabled={!canNext} className={`welcome-cta flex items-center gap-1.5 rounded-full px-5 py-2.5 text-xs font-semibold transition-opacity ${canNext ? "" : "opacity-40"}`}>{step === PREFS_STEP ? t("Finish") : t("Next")}<ArrowRight className="size-3.5 rtl:rotate-180" /></button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Small animated pictures of each OS, used here and in Settings.
export function OsPreview({ kind }: { kind: Edition }) {
  return kind === "nova" ? (
    <span aria-hidden className="nova-mini relative block h-28 overflow-hidden rounded-2xl border border-white/10 bg-[#04060e]">
      <span className="nova-mini-blob nova-mini-a" /><span className="nova-mini-blob nova-mini-b" /><span className="nova-mini-blob nova-mini-c" />
      <span className="absolute left-1/2 top-1.5 h-2.5 w-14 -translate-x-1/2 rounded-full bg-black ring-1 ring-white/15" />
      <span className="absolute left-[18%] top-[24%] h-[44%] w-[52%] rounded-lg border border-white/15 bg-white/[.07] backdrop-blur-sm" />
      <span className="absolute left-[30%] top-[34%] h-[40%] w-[52%] rounded-lg border border-white/20 bg-[#0d1020]/70 shadow-lg" />
      <span className="absolute bottom-1.5 left-1/2 flex -translate-x-1/2 items-end gap-1 rounded-xl border border-white/15 bg-white/10 px-1.5 py-1 backdrop-blur">
        {[0, 1, 2, 3, 4, 5].map((i) => <span key={i} className="rounded-[4px]" style={{ width: i === 2 ? 11 : 8, height: i === 2 ? 11 : 8, background: ["#5eead4", "#60a5fa", "#a78bfa", "#f472b6", "#fbbf24", "#e5e7eb"][i] }} />)}
      </span>
    </span>
  ) : (
    <span aria-hidden className="relative block h-28 overflow-hidden rounded-2xl border border-white/10 bg-[linear-gradient(to_bottom,#0d1b2a,#1b3a4b_55%,#5c7f8a)]">
      <span className="absolute left-2 top-2 flex flex-col gap-1.5">{[0, 1, 2].map((i) => <span key={i} className="size-3.5 rounded bg-white/25" />)}</span>
      <span className="absolute left-[22%] top-[16%] h-[52%] w-[58%] rounded-md border border-white/15 bg-[#1b1d26]/90"><span className="block h-2 rounded-t-md bg-white/10" /></span>
      <span className="absolute inset-x-0 bottom-0 flex h-4 items-center justify-center gap-1 border-t border-white/10 bg-[#202020]/90">
        <span className="grid size-2.5 grid-cols-2 gap-px">{[0, 1, 2, 3].map((i) => <span key={i} className="rounded-[1px] bg-sky-400" />)}</span>
        {[0, 1, 2, 3, 4].map((i) => <span key={i} className="size-2.5 rounded-sm bg-white/40" />)}
      </span>
    </span>
  );
}

function Pref({ icon: Icon, title, sub, on, set }: { icon: typeof Gauge; title: string; sub: string; on: boolean; set: (value: boolean) => void }) {
  return (
    <button type="button" role="switch" aria-checked={on} aria-label={title} onClick={() => set(!on)} className="flex w-full items-center gap-3 rounded-2xl border border-white/10 bg-white/[.03] px-3.5 py-3 text-left transition-colors hover:bg-white/[.07]">
      <Icon className="size-5 shrink-0 text-[var(--wa)]" />
      <span className="min-w-0 flex-1 text-start"><span className="block text-sm font-semibold">{title}</span><span className="block text-[11px] text-white/50">{sub}</span></span>
      <span className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${on ? "bg-[var(--wa)]" : "bg-white/15"}`}><span className={`absolute top-0.5 size-5 rounded-full bg-white shadow transition-[left] duration-200 ${on ? "left-[22px]" : "left-0.5"}`} /></span>
    </button>
  );
}
