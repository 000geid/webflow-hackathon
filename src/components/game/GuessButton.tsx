"use client";

import { cn } from "@/lib/ui/cn";

interface GuessButtonProps {
  isPaused: boolean;
  disabled?: boolean;
  onGuess?: () => void;
  onResume?: () => void;
}

/** ADIVINAR frena el tiempo y muestra las opciones. REANUDAR vuelve a correr. */
export function GuessButton({ isPaused, disabled, onGuess, onResume }: GuessButtonProps) {
  return (
    <button
      type="button"
      onClick={isPaused ? onResume : onGuess}
      disabled={disabled}
      aria-pressed={isPaused}
      className={cn(
        "mt-6 w-full cursor-pointer rounded-2xl py-5 text-xl font-extrabold tracking-wider text-white uppercase shadow-lg transition-all duration-200 sm:text-2xl",
        "hover:-translate-y-0.5 hover:shadow-xl active:translate-y-0 active:scale-[0.98]",
        "focus-visible:ring-4 focus-visible:outline-hidden",
        "disabled:pointer-events-none disabled:opacity-40 disabled:shadow-none",
        isPaused
          ? "bg-slate-900 shadow-slate-900/20 hover:bg-slate-800 focus-visible:ring-slate-400/40"
          : "bg-brand shadow-blue-500/25 hover:bg-brand-hover hover:shadow-blue-500/30 focus-visible:ring-blue-500/40",
      )}
    >
      {isPaused ? "Reanudar" : "Adivinar"}
    </button>
  );
}
