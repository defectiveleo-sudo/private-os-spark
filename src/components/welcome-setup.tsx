import { useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, Check, Gauge, Monitor, Sparkles, Volume2 } from "lucide-react";

// First-run setup, shown once after the first boot: hello, name, look, preferences, finish.

export type WelcomeResult = { userName: string; theme: string; accent: string; uiStyle: "classic" | "modern"; uiSounds: boolean; lite: boolean; reduceMotion: boolean };
type ThemeChoice = { id: string; name: string; sub: string; accent: string; glass?: boolean };

const HELLOS = ["Hello", "Bonjour", "Hola", "مرحبا", "Ciao", "こんにちは", "Hallo", "Olá", "Привет", "안녕하세요"];
const STEPS = ["Welcome", "Name", "Look", "Preferences", "Ready"];

export function WelcomeSetup({ themes, onDone, lowPower }: { themes: ThemeChoice[]; onDone: (result: WelcomeResult) => void; lowPower: boolean }) {
  const [step, setStep] = useState(0);
  const [hello, setHello] = useState(0);
  const [name, setName] = useState("");
  const [theme, setTheme] = useState(themes[0]!);
  const [uiStyle, setUiStyle] = useState<"classic" | "modern">("classic");
  const [uiSounds, setUiSounds] = useState(true);
  const [lite, setLite] = useState(lowPower);
  const [reduceMotion, setReduceMotion] = useState(false);
  const [progress, setProgress] = useState(0);
  const done = useRef(onDone);
  done.current = onDone;

  useEffect(() => {
    if (step !== 0) return;
    const timer = window.setInterval(() => setHello((value) => (value + 1) % HELLOS.length), 1600);
    return () => window.clearInterval(timer);
  }, [step]);

  useEffect(() => {
    if (step !== 4) return;
    const timer = window.setInterval(() => setProgress((value) => Math.min(100, value + 4)), 60);
    return () => window.clearInterval(timer);
  }, [step]);

  useEffect(() => {
    if (step === 4 && progress >= 100) {
      const timer = window.setTimeout(() => done.current({ userName: name.trim(), theme: theme.id, accent: theme.accent, uiStyle, uiSounds, lite, reduceMotion }), 450);
      return () => window.clearTimeout(timer);
    }
    return undefined;
  }, [step, progress, name, theme, uiStyle, uiSounds, lite, reduceMotion]);

  // Enter moves to the next step.
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "Enter" || event.repeat) return;
      event.stopPropagation();
      setStep((value) => (value < 4 ? value + 1 : value));
    };
    window.addEventListener("keydown", onKey, true);
    return () => window.removeEventListener("keydown", onKey, true);
  }, []);

  const accent = theme.accent || "#f2c783";
  const next = () => setStep((value) => Math.min(4, value + 1));
  const back = () => setStep((value) => Math.max(0, value - 1));
  const shown = themes.slice(0, 12);

  return (
    <div role="dialog" aria-label="Set up PRIVATE OS" className="welcome-root fixed inset-0 z-[90] flex items-center justify-center overflow-hidden bg-black text-white" style={{ "--wa": accent } as React.CSSProperties}>
      <div aria-hidden className="welcome-orb welcome-orb-a" />
      <div aria-hidden className="welcome-orb welcome-orb-b" />
      <div aria-hidden className="welcome-orb welcome-orb-c" />

      {step === 0 ? (
        <div className="relative z-10 flex flex-col items-center text-center">
          <h1 key={hello} className="welcome-hello text-[clamp(3rem,12vw,7rem)] font-semibold leading-none tracking-tight">{HELLOS[hello]}</h1>
          <p className="mt-6 text-sm text-white/60 [animation:rise_.8s_.4s_both]">Welcome to PRIVATE OS</p>
          <button type="button" onClick={next} className="welcome-cta mt-10 flex items-center gap-2 rounded-full px-7 py-3 text-sm font-semibold [animation:rise_.8s_.8s_both]">Get started <ArrowRight className="size-4" /></button>
        </div>
      ) : (
        <div key={step} className="welcome-card relative z-10 w-[min(34rem,calc(100%-2rem))] rounded-[28px] p-7">
          <div className="mb-6 flex items-center gap-1.5" aria-label={`Step ${step} of 4`}>
            {STEPS.slice(1).map((label, index) => <span key={label} className={`h-1 flex-1 rounded-full transition-all duration-500 ${index < step ? "bg-[var(--wa)]" : "bg-white/15"}`} />)}
          </div>

          {step === 1 && (
            <div className="stagger">
              <h2 className="text-2xl font-semibold">What should we call you?</h2>
              <p className="mt-1.5 text-sm text-white/55">Your name shows on the lock screen. It stays on this device.</p>
              <input autoFocus value={name} onChange={(event) => setName(event.target.value.slice(0, 24))} placeholder="Your name" aria-label="Your name" className="mt-6 h-12 w-full rounded-2xl border border-white/15 bg-white/5 px-4 text-base outline-none transition-colors focus:border-[var(--wa)]" />
            </div>
          )}

          {step === 2 && (
            <div className="stagger">
              <h2 className="text-2xl font-semibold">Choose your look</h2>
              <p className="mt-1.5 text-sm text-white/55">You can change it any time in Settings.</p>
              <div className="mt-5 grid max-h-[38dvh] grid-cols-3 gap-2 overflow-auto pr-1 sm:grid-cols-4">
                {shown.map((item) => {
                  const on = item.id === theme.id;
                  const color = item.accent || "#f2c783";
                  return (
                    <button key={item.id} type="button" aria-pressed={on} aria-label={`Theme ${item.name}`} onClick={() => setTheme(item)} className={`welcome-swatch rounded-2xl border p-2 text-left transition-all ${on ? "border-[var(--wa)] bg-white/10" : "border-white/10 bg-white/[.03] hover:bg-white/[.07]"}`}>
                      <span className="relative block h-12 overflow-hidden rounded-xl" style={{ background: `radial-gradient(circle at 30% 30%, ${color}, transparent 70%), linear-gradient(135deg, #111, #222)` }}>
                        {item.glass && <span className="absolute inset-x-2 bottom-1.5 h-3 rounded-full bg-white/25 backdrop-blur" />}
                        {on && <Check className="absolute right-1.5 top-1.5 size-4 rounded-full bg-white p-0.5 text-black" />}
                      </span>
                      <span className="mt-1.5 block truncate text-[11px] font-semibold">{item.name}</span>
                    </button>
                  );
                })}
              </div>
              <div className="mt-4 grid grid-cols-2 gap-2">
                {(["classic", "modern"] as const).map((style) => (
                  <button key={style} type="button" aria-pressed={uiStyle === style} onClick={() => setUiStyle(style)} className={`flex items-center gap-2 rounded-2xl border px-3 py-2.5 text-xs font-semibold capitalize transition-colors ${uiStyle === style ? "border-[var(--wa)] bg-white/10" : "border-white/10 hover:bg-white/5"}`}><Monitor className="size-4" />{style} interface</button>
                ))}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="stagger">
              <h2 className="text-2xl font-semibold">A few preferences</h2>
              <p className="mt-1.5 text-sm text-white/55">{lowPower ? "This device looks low-power, so Optimize is already on." : "Pick what feels right."}</p>
              <div className="mt-5 space-y-2">
                <Pref icon={Volume2} title="Interface sounds" sub="Soft clicks and hovers" on={uiSounds} set={setUiSounds} />
                <Pref icon={Gauge} title="Optimize for speed" sub="Turns off blur and glow on slow PCs" on={lite} set={setLite} />
                <Pref icon={Sparkles} title="Reduce motion" sub="Fewer animations" on={reduceMotion} set={setReduceMotion} />
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="py-4 text-center">
              <div className="welcome-ring mx-auto grid size-20 place-items-center rounded-full">{progress >= 100 ? <Check className="size-9 [animation:tile-pop_.3s_ease-out]" /> : <span className="text-sm font-semibold">{progress}%</span>}</div>
              <h2 className="mt-5 text-2xl font-semibold">{name.trim() ? `Hi ${name.trim()}` : "Hi there"}</h2>
              <p className="mt-1.5 text-sm text-white/55">{progress < 40 ? "Setting things up for you…" : progress < 80 ? "Applying your theme…" : progress < 100 ? "Almost there…" : "All set"}</p>
              <div className="mx-auto mt-5 h-1 w-48 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-[var(--wa)] transition-[width] duration-100" style={{ width: `${progress}%` }} /></div>
            </div>
          )}

          {step < 4 && (
            <div className="mt-7 flex items-center justify-between">
              <button type="button" onClick={back} className="flex items-center gap-1.5 rounded-full px-3 py-2 text-xs font-semibold text-white/60 hover:bg-white/10 hover:text-white"><ArrowLeft className="size-3.5" />Back</button>
              <button type="button" onClick={next} className="welcome-cta flex items-center gap-1.5 rounded-full px-5 py-2.5 text-xs font-semibold">{step === 1 && !name.trim() ? "Skip" : step === 3 ? "Finish" : "Next"}<ArrowRight className="size-3.5" /></button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function Pref({ icon: Icon, title, sub, on, set }: { icon: typeof Gauge; title: string; sub: string; on: boolean; set: (value: boolean) => void }) {
  return (
    <button type="button" role="switch" aria-checked={on} aria-label={title} onClick={() => set(!on)} className="flex w-full items-center gap-3 rounded-2xl border border-white/10 bg-white/[.03] px-3.5 py-3 text-left transition-colors hover:bg-white/[.07]">
      <Icon className="size-5 shrink-0 text-[var(--wa)]" />
      <span className="min-w-0 flex-1"><span className="block text-sm font-semibold">{title}</span><span className="block text-[11px] text-white/50">{sub}</span></span>
      <span className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${on ? "bg-[var(--wa)]" : "bg-white/15"}`}><span className={`absolute top-0.5 size-5 rounded-full bg-white shadow transition-[left] duration-200 ${on ? "left-[22px]" : "left-0.5"}`} /></span>
    </button>
  );
}
