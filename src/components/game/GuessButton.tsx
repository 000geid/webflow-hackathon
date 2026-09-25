"use client";

import { PauseIcon, PlayIcon } from "@/components/ui/icons";
import { cn } from "@/lib/ui/cn";

interface GuessButtonProps {
  isPaused: boolean;
  disabled?: boolean;
  canResume?: boolean;
  onGuess?: () => void;
  onResume?: () => void;
  className?: string;
}

/**
 * Botón principal, verde pastel. ADIVINAR frena el tiempo y muestra las opciones;
 * REANUDAR vuelve a correr. Al apretar se hunde y pierde la sombra.
 */
export function GuessButton({ isPaused, disabled, canResume = true, onGuess, onResume, className }: GuessButtonProps) {
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
        "inline-flex h-14 cursor-pointer items-center justify-center gap-2.5 rounded-full border-2 border-slate-950 bg-mint px-8 text-lg font-black tracking-wider text-slate-950 uppercase shadow-[4px_4px_0px_0px_#0F172A]",
        "transition-[translate,box-shadow,background-color] duration-100",
        "enabled:hover:bg-[#6EE7A0] enabled:active:translate-y-1 enabled:active:shadow-none",
        "focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-slate-900",
        "disabled:cursor-not-allowed disabled:border-slate-300 disabled:bg-line disabled:text-slate-500 disabled:shadow-none",
        className,
      )}
    >
      {!isWaitingForChoice && <Icon className="h-4 w-4" />}
      {isPaused ? (canResume ? "Reanudar" : "Elegí una opción") : "Adivinar"}
    </button>
  );
}
