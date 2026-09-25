"use client";

import { getOptionState, OPTION_LETTERS } from "@/lib/game/options";
import type { GameRound } from "@/types/game";
import { OptionButton } from "./OptionButton";

interface OptionsGridProps {
  options: GameRound["options"];
  selectedIndex: number | null;
  correctIndex: number | null;
  onSelect?: (index: number) => void;
}

export function OptionsGrid({ options, selectedIndex, correctIndex, onSelect }: OptionsGridProps) {
  const hasAnswered = selectedIndex !== null;

  return (
    <div className="mt-6 grid grid-cols-2 gap-3" role="group" aria-label="Opciones de respuesta">
      {options.map((option, index) => (
        <OptionButton
          key={option}
          letter={OPTION_LETTERS[index]}
          label={option}
          state={getOptionState(index, selectedIndex, correctIndex)}
          disabled={hasAnswered}
          onClick={() => onSelect?.(index)}
        />
      ))}
    </div>
  );
}
