"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/ui/cn";
import type { OptionState } from "@/lib/ui/option-state";

/* Tarjeta táctil estilo Duolingo: borde de 2px y "labio" inferior de 4px. */
const CARD: Record<OptionState, string> = {
  idle: "border-slate-200 border-b-slate-300 bg-white text-slate-800 hover:border-blue-400 hover:border-b-blue-500 hover:bg-blue-50/50",
  selected: "border-blue-400 border-b-blue-500 bg-blue-50 text-brand",
  correct: "border-emerald-600 border-b-emerald-700 bg-emerald-500 text-white shadow-[0_0_28px_rgba(16,185,129,0.5)]",
  wrong: "border-rose-600 border-b-rose-700 bg-rose-500 text-white",
  revealed: "border-emerald-400 border-b-emerald-500 bg-emerald-50 text-emerald-700",
  muted: "border-slate-200 border-b-slate-300 bg-white text-slate-400 opacity-50",
};

/* Tecla con la letra: pequeña, con volumen. */
const KEYCAP: Record<OptionState, string> = {
  idle: "border-slate-300 border-b-slate-400 bg-slate-100 text-slate-600 group-hover:border-blue-300 group-hover:border-b-blue-400 group-hover:bg-white group-hover:text-brand",
  selected: "border-blue-300 border-b-blue-400 bg-white text-brand",
  correct: "border-white/40 bg-white/20 text-white",
  wrong: "border-white/40 bg-white/20 text-white",
  revealed: "border-emerald-300 border-b-emerald-400 bg-white text-emerald-600",
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
        animate={isCorrect ? { scale: [1, 1.06, 0.98, 1] } : { scale: 1 }}
        transition={isCorrect ? { duration: 0.5, ease: "easeOut" } : { duration: 0.15 }}
        className={cn(
          "group relative flex w-full cursor-pointer items-center gap-3 overflow-hidden rounded-2xl border-2 border-b-4 p-4 text-left",
          "text-base font-extrabold sm:text-lg",
          "transition-[background-color,border-color,color,box-shadow,translate,opacity] duration-150",
          "enabled:active:translate-y-1 enabled:active:border-b-2",
          "focus-visible:ring-4 focus-visible:ring-blue-400/40 focus-visible:outline-hidden",
          "disabled:cursor-not-allowed",
          CARD[state],
        )}
      >
        {/* Destello de acierto */}
        {isCorrect && (
          <motion.span
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-white"
            initial={{ opacity: 0.7 }}
            animate={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          />
        )}

        <kbd
          className={cn(
            "relative shrink-0 rounded-lg border border-b-2 px-2.5 py-1 font-sans text-xs font-bold transition-colors",
            KEYCAP[state],
          )}
        >
          {letter}
        </kbd>
        <span className="relative truncate">{label}</span>

        {(state === "correct" || state === "wrong") && (
          <span className="relative ml-auto text-xl font-black" aria-hidden="true">
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
