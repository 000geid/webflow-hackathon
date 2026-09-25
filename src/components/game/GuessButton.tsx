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
 * Botón principal de arcade, verde neón. ADIVINAR frena el tiempo y muestra las opciones;
 * REANUDAR vuelve a correr. Se levanta al pasar el mouse y se hunde al apretar.
 */
export function GuessButton({ isPaused, disabled, canResume = true, onGuess, onResume, className }: GuessButtonProps) {
  const isDisabled = disabled || (isPaused && !canResume);
  const isWaitingForChoice = isPaused && !canResume;
  const Icon = isPaused ? PlayIcon : PauseIcon;

  // Frenaste y no se puede reanudar: no hay nada que apretar, así que es un cartel de estado.
  if (isWaitingForChoice) {
    return (
      <div
        role="status"
        className={cn(
          "inline-flex h-14 min-w-0 items-center justify-center gap-2 border-2 border-arcade bg-crt px-3 font-pixel text-sm tracking-wide whitespace-nowrap text-arcade-bright uppercase sm:gap-3 sm:px-6 sm:text-lg",
          "shadow-[4px_4px_0px_0px_#000,0_0_24px_rgb(245_158_11/0.35)] [text-shadow:0_0_10px_rgb(245_158_11/0.7)]",
          className,
        )}
      >
        <span aria-hidden="true" className="text-arcade">▸</span>
        <span>
          Elegí una opción
          <span aria-hidden="true" className="motion-safe:animate-blink">_</span>
        </span>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={isPaused ? onResume : onGuess}
      disabled={isDisabled}
      aria-pressed={isPaused}
      className={cn(
        "inline-flex h-14 cursor-pointer items-center justify-center gap-3 border-2 border-black bg-[#10B981] px-6 font-pixel text-base tracking-wide text-[#0A0E17] uppercase sm:text-lg",
        "shadow-[4px_4px_0px_0px_#000,0_0_26px_rgb(16_185_129/0.4)]",
        "transition-[translate,box-shadow,background-color] duration-100",
        "enabled:hover:translate-x-[-2px] enabled:hover:translate-y-[-2px] enabled:hover:bg-neon-bright enabled:hover:shadow-[6px_6px_0px_0px_#000,0_0_32px_rgb(16_185_129/0.5)]",
        "enabled:active:translate-x-0.5 enabled:active:translate-y-0.5 enabled:active:shadow-none",
        "focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-neon-bright",
        "disabled:cursor-not-allowed disabled:border-edge disabled:bg-panel disabled:text-slate-500 disabled:shadow-pixel",
        className,
      )}
    >
      <Icon className="h-4 w-4" />
      {isPaused ? "Reanudar" : "Adivinar"}
    </button>
  );
}
