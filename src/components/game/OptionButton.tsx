"use client";

import { cn } from "@/lib/ui/cn";
import type { OptionState } from "@/lib/ui/option-state";

const CONTAINER: Record<OptionState, string> = {
  idle: "border-slate-200 bg-white text-slate-700 hover:border-brand hover:bg-blue-50",
  correct: "border-success bg-emerald-50 text-emerald-700",
  wrong: "border-red-400 bg-red-50 text-red-600",
  muted: "border-slate-200 bg-white text-slate-400 opacity-60",
};

const LETTER: Record<OptionState, string> = {
  idle: "bg-slate-100 text-slate-500 group-hover:bg-brand group-hover:text-white",
  correct: "bg-success text-white",
  wrong: "bg-red-500 text-white",
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
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "group flex cursor-pointer items-center gap-3 rounded-xl border-2 px-4 py-3 text-left font-medium transition-all duration-150 focus-visible:ring-4 focus-visible:ring-blue-500/30 focus-visible:outline-hidden disabled:cursor-not-allowed",
        CONTAINER[state],
      )}
    >
      <span
        className={cn(
          "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-sm font-bold transition-colors",
          LETTER[state],
        )}
      >
        {letter}
      </span>
      <span className="truncate">{label}</span>
    </button>
  );
}
