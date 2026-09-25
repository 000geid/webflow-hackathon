"use client";

import { PauseIcon, PlayIcon } from "@/components/ui/icons";
import { PillButton } from "@/components/ui/PillButton";

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
    <PillButton
      size="lg"
      onClick={isPaused ? onResume : onGuess}
      disabled={isDisabled}
      aria-pressed={isPaused}
      className="mt-5 w-full"
    >
      {!isWaitingForChoice && <Icon className="h-4 w-4" />}
      {isPaused ? (canResume ? "Reanudar" : "Elegí una opción") : "Adivinar"}
    </PillButton>
  );
}
