"use client";

import { motion } from "framer-motion";
import type { Choice } from "@/lib/game/types";
import { getOptionState, OPTION_LETTERS } from "@/lib/ui/option-state";
import { OptionButton } from "./OptionButton";

interface OptionsGridProps {
  choices: Choice[];
  selectedChoiceId: string | null;
  correctChoiceId: string | null;
  /** true = la ronda está cerrada y no se puede elegir. */
  locked?: boolean;
  onSelect?: (choiceId: string) => void;
}

export function OptionsGrid({ choices, selectedChoiceId, correctChoiceId, locked = false, onSelect }: OptionsGridProps) {
  const isDisabled = locked || selectedChoiceId !== null;

  return (
    <motion.div
      role="group"
      aria-label="Opciones de respuesta"
      className="mt-4 grid grid-cols-2 gap-2.5 sm:gap-3"
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 6 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
    >
      {choices.slice(0, OPTION_LETTERS.length).map((choice, index) => (
        <OptionButton
          key={choice.id}
          letter={OPTION_LETTERS[index]}
          label={choice.label}
          state={getOptionState(choice.id, selectedChoiceId, correctChoiceId)}
          disabled={isDisabled}
          onClick={() => onSelect?.(choice.id)}
        />
      ))}
    </motion.div>
  );
}
