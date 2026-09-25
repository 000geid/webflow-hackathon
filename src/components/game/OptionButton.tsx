"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/ui/cn";
import type { OptionState } from "@/lib/ui/option-state";

/* Teclas de arcade: letra en tecla ámbar; al pasar el mouse se levantan y se encienden en verde. Los resultados usan neón (verde acierto, rosa error). */
const CARD: Record<OptionState, string> = {
  idle: "border-slate-700 bg-panel text-cream shadow-[3px_3px_0px_0px_#000] enabled:hover:translate-y-[-2px] enabled:hover:border-emerald-400 enabled:hover:bg-slate-800 enabled:hover:text-emerald-400 enabled:hover:shadow-[3px_5px_0px_0px_#000]",
  selected: "border-arcade bg-arcade/15 text-arcade-bright shadow-[3px_3px_0px_0px_#000]",
  correct: "border-neon-bright bg-neon/20 text-neon-bright shadow-[4px_4px_0px_0px_#000,0_0_22px_rgb(16_185_129/0.45)]",
  wrong: "border-hot bg-hot/15 text-hot shadow-[4px_4px_0px_0px_#000,0_0_22px_rgb(251_113_133/0.35)]",
  revealed: "border-dashed border-neon-bright bg-panel text-neon-bright",
  muted: "border-edge bg-panel-deep text-slate-600",
};

/* Keycap con la letra. */
const KEYCAP: Record<OptionState, string> = {
  idle: "border-black bg-[#F59E0B] text-black",
  selected: "border-black bg-arcade text-black",
  correct: "border-black bg-neon text-black",
  wrong: "border-black bg-hot text-black",
  revealed: "border-black bg-neon text-black",
  muted: "border-edge bg-crt text-slate-600",
};

interface OptionButtonProps {
  letter: string;
  label: string;
  state: OptionState;
  disabled?: boolean;
  onClick?: () => void;
}

export function OptionButton({ letter, label, state, disabled, onClick }: OptionButtonProps) {
  const isCorrect = state === "correct";

  return (
    // El shake va en el wrapper para no chocar con el rebote de Framer Motion.
    <div className={cn(state === "wrong" && "animate-shake")}>
      <motion.button
        type="button"
        onClick={onClick}
        disabled={disabled}
        animate={isCorrect ? { scale: [1, 1.03, 1] } : { scale: 1 }}
        transition={isCorrect ? { duration: 0.35, ease: "easeOut" } : { duration: 0.15 }}
        className={cn(
          "group relative flex w-full cursor-pointer items-center gap-3 border-2 px-3 py-3.5 text-left",
          "text-sm font-semibold tracking-tight sm:text-base",
          "transition-all duration-150",
          "enabled:active:translate-x-0.5 enabled:active:translate-y-0.5 enabled:active:shadow-none",
          "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neon-bright",
          "disabled:cursor-not-allowed",
          CARD[state],
        )}
      >
        <kbd className={cn("grid h-7 w-7 shrink-0 place-items-center border-2 font-pixel text-xs leading-none font-bold", KEYCAP[state])}>
          {letter}
        </kbd>
        <span className="truncate">{label}</span>

        {(state === "correct" || state === "wrong") && (
          <span className="ml-auto font-pixel text-sm" aria-hidden="true">
            {state === "correct" ? "✓" : "✕"}
          </span>
        )}
        <span className="sr-only">
          {state === "correct" && "Correcta"}
          {state === "wrong" && "Incorrecta"}
          {state === "revealed" && "Era la correcta"}
        </span>
      </motion.button>
    </div>
  );
}
