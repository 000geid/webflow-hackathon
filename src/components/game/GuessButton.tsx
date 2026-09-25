"use client";

import { cn } from "@/lib/ui/cn";

interface GuessButtonProps {
  isPaused: boolean;
  disabled?: boolean;
  onGuess?: () => void;
  onResume?: () => void;
}

/**
 * Botón arcade 3D. ADIVINAR frena el tiempo y muestra las opciones; REANUDAR vuelve a correr.
 * Al apretar baja 4px y pierde el borde inferior; `active:mb-1` compensa esos 4px
 * para que lo de abajo no salte.
 */
export function GuessButton({ isPaused, disabled, onGuess, onResume }: GuessButtonProps) {
  return (
    <button
      type="button"
      onClick={isPaused ? onResume : onGuess}
      disabled={disabled}
      aria-pressed={isPaused}
      className={cn(
        "mt-8 w-full cursor-pointer rounded-2xl border-b-4 py-4 text-xl font-black tracking-[0.15em] text-white uppercase sm:py-5 sm:text-2xl",
        "transition-[transform,translate,background-color,border-color,margin] duration-100",
        "enabled:active:mb-1 enabled:active:translate-y-1 enabled:active:border-b-0",
        "focus-visible:ring-4 focus-visible:outline-hidden",
        "disabled:cursor-not-allowed disabled:border-slate-300 disabled:bg-slate-200 disabled:text-slate-400",
        isPaused
          ? "border-slate-950 bg-slate-800 hover:bg-slate-700 focus-visible:ring-slate-400/50"
          : "border-brand-edge bg-brand hover:bg-[#3b74f0] focus-visible:ring-blue-400/50",
      )}
    >
      {isPaused ? "Reanudar" : "Adivinar"}
    </button>
  );
}
