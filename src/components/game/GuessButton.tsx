"use client";

import { cn } from "@/lib/ui/cn";

interface GuessButtonProps {
  isPaused: boolean;
  disabled?: boolean;
  canResume?: boolean;
  onGuess?: () => void;
  onResume?: () => void;
}

/**
 * Botón principal brutalista. ADIVINAR frena el tiempo y muestra las opciones;
 * REANUDAR vuelve a correr. Al apretar se "hunde" hacia la sombra.
 */
export function GuessButton({ isPaused, disabled, canResume = true, onGuess, onResume }: GuessButtonProps) {
  const isDisabled = disabled || (isPaused && !canResume);
  return (
    <button
      type="button"
      onClick={isPaused ? onResume : onGuess}
      disabled={isDisabled}
      aria-pressed={isPaused}
      className={cn(
        "mt-8 w-full cursor-pointer rounded-xl border-2 border-ink py-4 text-xl font-black tracking-[0.12em] uppercase shadow-hard sm:py-5 sm:text-2xl",
        "transition-[translate,box-shadow,background-color] duration-100",
        "enabled:hover:-translate-x-px enabled:hover:-translate-y-px enabled:hover:shadow-hard-lg",
        "enabled:active:translate-x-[2px] enabled:active:translate-y-[2px] enabled:active:shadow-none",
        "focus-visible:outline-3 focus-visible:outline-offset-4 focus-visible:outline-brand",
        "disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400 disabled:shadow-none",
        isPaused ? "bg-highlight text-ink" : "bg-brand text-white",
      )}
    >
      {isPaused ? (canResume ? "Reanudar" : "Elegí una opción") : "Adivinar"}
    </button>
  );
}
