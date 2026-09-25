"use client";

import { PauseIcon, PlayIcon } from "@/components/ui/icons";
import { cn } from "@/lib/ui/cn";

interface GuessButtonProps {
  isPaused: boolean;
  disabled?: boolean;
  canResume?: boolean;
  onGuess?: () => void;
  onResume?: () => void;
}

/**
 * Botón principal. ADIVINAR frena el tiempo y muestra las opciones;
 * REANUDAR vuelve a correr. Al apretar se "hunde" hacia la sombra.
 */
export function GuessButton({ isPaused, disabled, canResume = true, onGuess, onResume }: GuessButtonProps) {
  const isDisabled = disabled || (isPaused && !canResume);
  const isWaitingForChoice = isPaused && !canResume;
  const Icon = isPaused ? PlayIcon : PauseIcon;

  return (
    <button
      type="button"
      onClick={isPaused ? onResume : onGuess}
      disabled={isDisabled}
      aria-pressed={isPaused}
      className={cn(
        "mt-6 flex w-full cursor-pointer items-center justify-center gap-2.5 rounded-xl border-2 border-slate-900 bg-blue-600 py-4 text-base font-extrabold tracking-wider text-white uppercase shadow-hard sm:text-lg",
        "transition-[translate,box-shadow,background-color] duration-100",
        "enabled:hover:-translate-x-px enabled:hover:-translate-y-px enabled:hover:bg-blue-700 enabled:hover:shadow-hard-lg",
        "enabled:active:translate-x-[2px] enabled:active:translate-y-[2px] enabled:active:shadow-none",
        "focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-600",
        "disabled:cursor-not-allowed disabled:border-slate-300 disabled:bg-slate-100 disabled:text-slate-400 disabled:shadow-none",
      )}
    >
      {!isWaitingForChoice && <Icon className="h-4 w-4" />}
      {isPaused ? (canResume ? "Reanudar" : "Elegí una opción") : "Adivinar"}
    </button>
  );
}
