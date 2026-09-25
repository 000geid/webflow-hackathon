"use client";

import type { Choice } from "@/lib/game/types";
import { getOptionState, OPTION_LETTERS } from "@/lib/ui/option-state";
import { OptionButton } from "./OptionButton";

interface OptionsGridProps {
  choices: Choice[];
  selectedChoiceId: string | null;
  correctChoiceId: string | null;
  onSelect?: (choiceId: string) => void;
}

export function OptionsGrid({ choices, selectedChoiceId, correctChoiceId, onSelect }: OptionsGridProps) {
  const hasAnswered = selectedChoiceId !== null || correctChoiceId !== null;

  return (
    <div className="mt-6 grid grid-cols-2 gap-3" role="group" aria-label="Opciones de respuesta">
      {choices.slice(0, OPTION_LETTERS.length).map((choice, index) => (
        <OptionButton
          key={choice.id}
          letter={OPTION_LETTERS[index]}
          label={choice.label}
          state={getOptionState(choice.id, selectedChoiceId, correctChoiceId)}
          disabled={hasAnswered}
          onClick={() => onSelect?.(choice.id)}
        />
      ))}
    </div>
  );
}
