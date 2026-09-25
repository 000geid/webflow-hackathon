"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/ui/cn";
import type { OptionState } from "@/lib/ui/option-state";

const CARD: Record<OptionState, string> = {
  idle: "border-slate-200 bg-white text-slate-800 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-lg hover:shadow-slate-200/70",
  selected: "border-brand bg-blue-50 text-brand",
  correct: "border-emerald-500 bg-emerald-500 text-white shadow-[0_0_28px_rgba(16,185,129,0.55)]",
  wrong: "border-rose-500 bg-rose-500 text-white",
  revealed: "border-emerald-500 bg-emerald-50 text-emerald-700",
  muted: "border-slate-200 bg-white text-slate-400 opacity-50",
};

const LETTER: Record<OptionState, string> = {
  idle: "bg-slate-100 text-slate-500 group-hover:bg-brand group-hover:text-white",
  selected: "bg-brand text-white",
  correct: "bg-white/25 text-white",
  wrong: "bg-white/25 text-white",
  revealed: "bg-emerald-500 text-white",
  muted: "bg-slate-100 text-slate-400",
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
        animate={isCorrect ? { scale: [1, 1.08, 0.97, 1] } : { scale: 1 }}
        transition={isCorrect ? { duration: 0.5, ease: "easeOut" } : { duration: 0.15 }}
        className={cn(
          "group relative flex w-full cursor-pointer items-center gap-3 overflow-hidden rounded-xl border px-4 py-3 text-left",
          "text-sm font-semibold transition-[background-color,border-color,color,box-shadow,translate,opacity] duration-200 sm:py-4 sm:text-base lg:text-lg",
          "focus-visible:ring-4 focus-visible:ring-blue-500/30 focus-visible:outline-hidden",
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

        <span
          className={cn(
            "relative flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-sm font-bold transition-colors",
            LETTER[state],
          )}
        >
          {letter}
        </span>
        <span className="relative truncate">{label}</span>

        {(state === "correct" || state === "wrong") && (
          <span className="relative ml-auto text-lg" aria-hidden="true">
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
