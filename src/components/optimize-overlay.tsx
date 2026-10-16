import { useEffect, useState } from "react";
import { Check, Gauge } from "lucide-react";

export const OPTIMIZE_EVENT = "pos-optimize";

/** Opens the optimize screen from anywhere in the OS. */
export const requestOptimize = () => window.dispatchEvent(new Event(OPTIMIZE_EVENT));

/** True on devices that will likely struggle with heavy glass and blur. */
export function isLowPowerDevice() {
  if (typeof navigator === "undefined") return false;
  const cores = navigator.hardwareConcurrency || 8;
  const memory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 8;
  return cores <= 4 || memory <= 4;
}

const STEPS = [
  "Scanning your device",
  "Optimizing data",
  "Compressing themes",
  "Turning off heavy blur and glow",
  "Freeing memory",
];
const STEP_MS = 420;

/** Short full-screen "optimizing" sequence. Calls onApply once the steps finish, then onDone after the success state. */
export function OptimizeOverlay({ onApply, onDone }: { onApply: () => void; onDone: () => void }) {
  const [step, setStep] = useState(0);
  const finished = step >= STEPS.length;
  const progress = Math.min(100, Math.round((step / STEPS.length) * 100));

  useEffect(() => {
    if (finished) {
      onApply();
      const timer = window.setTimeout(onDone, 900);
      return () => window.clearTimeout(timer);
    }
    const timer = window.setTimeout(() => setStep((value) => value + 1), STEP_MS);
    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  const cores = typeof navigator !== "undefined" ? navigator.hardwareConcurrency : undefined;
  const memory =
    typeof navigator !== "undefined"
      ? (navigator as Navigator & { deviceMemory?: number }).deviceMemory
      : undefined;

  return (
    <div
      role="alertdialog"
      aria-live="polite"
      aria-label="Optimizing PRIVATE OS"
      className="optimize-overlay fixed inset-0 z-[9999] grid place-items-center bg-black/70 p-6 text-white"
    >
      <div className="w-full max-w-sm rounded-3xl border border-white/10 bg-[#0b0c12] p-7 shadow-2xl">
        <div className="mx-auto mb-5 grid size-16 place-items-center rounded-2xl border border-white/15 bg-white/5">
          {finished ? (
            <Check className="size-8 text-emerald-400" aria-hidden />
          ) : (
            <Gauge className="optimize-spin size-8 text-primary" aria-hidden />
          )}
        </div>
        <p className="text-center text-lg font-semibold">
          {finished ? "Optimized" : "Optimizing PRIVATE OS"}
        </p>
        <p className="mb-5 text-center text-[11px] text-white/55">
          {cores ? `${cores} cores` : "Unknown CPU"}
          {memory ? ` · ${memory} GB memory` : ""}
        </p>
        <div className="mb-4 h-1.5 overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full bg-primary transition-[width] duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
        <ul className="space-y-1.5 text-xs">
          {STEPS.map((label, index) => (
            <li
              key={label}
              className={`flex items-center gap-2 transition-opacity duration-200 ${index <= step ? "opacity-100" : "opacity-30"}`}
            >
              <span
                className={`grid size-4 place-items-center rounded-full border ${index < step ? "border-emerald-400 bg-emerald-400/20" : "border-white/30"}`}
              >
                {index < step ? (
                  <Check className="size-2.5 text-emerald-400" aria-hidden />
                ) : index === step ? (
                  <span className="optimize-dot size-1.5 rounded-full bg-primary" />
                ) : null}
              </span>
              {label}
              {index === step ? "…" : ""}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
