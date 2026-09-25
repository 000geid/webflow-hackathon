"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/ui/cn";
import type { OptionState } from "@/lib/ui/option-state";

/* Keycaps táctiles en papel crema; los resultados usan la paleta pastel (menta acierto, coral error). */
const CARD: Record<OptionState, string> = {
  idle: "border-slate-900 bg-paper text-slate-950 shadow-[3px_3px_0px_0px_#0F172A] enabled:hover:-translate-y-px enabled:hover:bg-white enabled:hover:shadow-[4px_4px_0px_0px_#0F172A]",
  selected: "border-slate-900 bg-butter text-slate-950 shadow-[3px_3px_0px_0px_#0F172A]",
  correct: "border-slate-900 bg-mint text-slate-950 shadow-[3px_3px_0px_0px_#0F172A]",
  wrong: "border-slate-900 bg-coral text-slate-950 shadow-[3px_3px_0px_0px_#0F172A]",
  revealed: "border-dashed border-slate-900 bg-[#DCFCE7] text-slate-950",
  muted: "border-line bg-paper/70 text-slate-400",
};

/* Keycap con la letra. */
const KEYCAP: Record<OptionState, string> = {
  idle: "border-slate-900 bg-cream text-slate-900",
  selected: "border-slate-900 bg-paper text-slate-900",
  correct: "border-slate-900 bg-paper text-slate-900",
  wrong: "border-slate-900 bg-paper text-slate-900",
  revealed: "border-slate-900 bg-mint text-slate-900",
  muted: "border-line bg-cream text-slate-400",
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
          "group relative flex w-full cursor-pointer items-center gap-3 rounded-2xl border-2 px-3.5 py-3.5 text-left",
          "text-sm font-bold tracking-tight sm:text-base",
          "transition-all duration-150",
          "enabled:active:translate-y-1 enabled:active:shadow-none",
          "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900",
          "disabled:cursor-not-allowed",
          CARD[state],
        )}
      >
        <kbd className={cn("shrink-0 rounded-md border-2 px-2 py-1 font-mono text-xs leading-none font-black", KEYCAP[state])}>
          {letter}
        </kbd>
        <span className="truncate">{label}</span>

        {(state === "correct" || state === "wrong") && (
          <span className="ml-auto font-mono text-sm font-bold" aria-hidden="true">
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
