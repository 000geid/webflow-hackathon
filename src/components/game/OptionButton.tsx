"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/ui/cn";
import type { OptionState } from "@/lib/ui/option-state";

/* Tarjeta brutalista: borde negro 2px + sombra dura. */
const CARD: Record<OptionState, string> = {
  idle: "bg-white text-ink shadow-hard-sm enabled:hover:-translate-x-px enabled:hover:-translate-y-px enabled:hover:shadow-hard-brand",
  selected: "bg-blue-100 text-ink shadow-hard-brand",
  correct: "bg-emerald-500 text-white shadow-hard-sm",
  wrong: "bg-rose-500 text-white shadow-hard-sm",
  revealed: "bg-emerald-100 text-emerald-900 shadow-hard-sm",
  muted: "bg-white text-slate-400 opacity-50 shadow-none",
};

/* Tecla con la letra: amarillo eléctrico. */
const KEYCAP: Record<OptionState, string> = {
  idle: "bg-highlight text-ink",
  selected: "bg-highlight text-ink",
  correct: "bg-white text-emerald-700",
  wrong: "bg-white text-rose-600",
  revealed: "bg-emerald-400 text-ink",
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
        animate={isCorrect ? { scale: [1, 1.06, 0.98, 1] } : { scale: 1 }}
        transition={isCorrect ? { duration: 0.5, ease: "easeOut" } : { duration: 0.15 }}
        className={cn(
          "group relative flex w-full cursor-pointer items-center gap-3 overflow-hidden rounded-xl border-2 border-ink p-4 text-left",
          "text-base font-extrabold tracking-tight sm:text-lg",
          "transition-all duration-150",
          "enabled:active:translate-x-[2px] enabled:active:translate-y-[2px] enabled:active:shadow-none",
          "focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-brand",
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
            "relative shrink-0 rounded-md border border-ink px-2 py-0.5 font-sans text-xs font-black",
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
