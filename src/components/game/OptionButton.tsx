"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/ui/cn";
import type { OptionState } from "@/lib/ui/option-state";

/* Keycaps táctiles: fondo blanco, borde de 2px y sombra dura de 3px.
   Los estados de resultado tiñen fondo, borde y sombra. */
const CARD: Record<OptionState, string> = {
  idle: "border-slate-950 bg-white text-slate-950 shadow-[3px_3px_0_0_#020617] enabled:hover:-translate-y-px enabled:hover:bg-slate-50 enabled:hover:shadow-[4px_4px_0_0_#020617]",
  selected: "border-blue-600 bg-blue-50 text-slate-950 shadow-[3px_3px_0_0_#2563eb]",
  correct: "border-emerald-600 bg-emerald-50 text-emerald-900 shadow-[3px_3px_0_0_#059669]",
  wrong: "border-rose-600 bg-rose-50 text-rose-900 shadow-[3px_3px_0_0_#e11d48]",
  revealed: "border-emerald-600 border-dashed bg-white text-emerald-800",
  muted: "border-slate-300 bg-white/70 text-slate-400",
};

/* Keycap discreta con la letra. */
const KEYCAP: Record<OptionState, string> = {
  idle: "border-slate-300 bg-slate-100 text-slate-800",
  selected: "border-blue-200 bg-blue-100 text-blue-700",
  correct: "border-emerald-200 bg-emerald-100 text-emerald-700",
  wrong: "border-rose-200 bg-rose-100 text-rose-700",
  revealed: "border-emerald-200 bg-emerald-50 text-emerald-700",
  muted: "border-slate-200 bg-slate-50 text-slate-400",
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
          "text-sm font-semibold tracking-tight sm:text-base",
          "transition-all duration-150",
          "enabled:active:translate-y-0.5 enabled:active:shadow-[1px_1px_0_0_#020617]",
          "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600",
          "disabled:cursor-not-allowed",
          CARD[state],
        )}
      >
        <kbd className={cn("shrink-0 rounded border px-2 py-1 font-mono text-xs leading-none font-medium", KEYCAP[state])}>
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
