"use client";

import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { HINTS_PER_GAME } from "@/lib/game/hints";
import { cn } from "@/lib/ui/cn";

/*
 * Textos del power-up. Hoy la pista sale de una regla (máscara de la respuesta), no de una IA:
 * cuando el backend conecte un agente, cambiar estas etiquetas junto con la fuente de la pista.
 */
const BUTTON_LABEL = "Pedir pista";
const USED_LABEL = "Pista usada";

function BulbIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={className}>
      <path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-3.6 10.8c.6.5 1 1.2 1.1 2V16h5v-.2c.1-.8.5-1.5 1.1-2A6 6 0 0 0 12 3Z" />
    </svg>
  );
}

interface HintButtonProps {
  hintsLeft: number;
  disabled: boolean;
  onClick: () => void;
}

export function HintButton({ hintsLeft, disabled, onClick }: HintButtonProps) {
  const available = hintsLeft > 0;
  return (
    <div className="mt-3 flex items-center justify-between gap-3">
      <button
        type="button"
        onClick={onClick}
        disabled={disabled || !available}
        className={cn(
          "inline-flex h-10 cursor-pointer items-center gap-2 rounded-full border-2 px-4 text-sm font-bold transition-[translate,background-color] duration-100",
          "focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-indigo-600",
          available
            ? "border-indigo-600 bg-indigo-50 text-indigo-950 enabled:hover:bg-indigo-100 enabled:active:translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50"
            : "cursor-default border-slate-200 bg-white/60 text-slate-400",
          available && !disabled && "motion-safe:animate-glow",
        )}
      >
        {available ? <BulbIcon className="h-4 w-4" /> : <span aria-hidden="true">✓</span>}
        {available ? BUTTON_LABEL : USED_LABEL}
      </button>
      <p className="font-mono text-[11px] tracking-wider text-slate-400 uppercase">
        {hintsLeft}/{HINTS_PER_GAME} pista por partida
      </p>
    </div>
  );
}

/** Caja de la pista con efecto de tipeo. Se monta con `key={texto}` para reiniciar el tipeo. */
export function HintBox({ text }: { text: string }) {
  const reduceMotion = useReducedMotion();
  const chars = Array.from(text);
  const [typed, setTyped] = useState(0);

  useEffect(() => {
    if (reduceMotion) return;
    const timer = window.setInterval(() => {
      setTyped((count) => {
        if (count >= chars.length) {
          window.clearInterval(timer);
          return count;
        }
        return count + 1;
      });
    }, 32);
    return () => window.clearInterval(timer);
  }, [chars.length, reduceMotion]);

  const shown = reduceMotion ? text : chars.slice(0, typed).join("");
  const done = reduceMotion || typed >= chars.length;

  return (
    <motion.div
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      className="mt-3 flex items-start gap-3 rounded-2xl bg-white/80 p-3 ring-1 ring-indigo-200"
      role="status"
      aria-label={`Pista: ${text}`}
    >
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-indigo-600 text-white" aria-hidden="true">
        <BulbIcon className="h-4.5 w-4.5" />
      </span>
      <div className="min-w-0 pt-0.5">
        <p className="font-mono text-[10px] tracking-wider text-indigo-600 uppercase">Tu pista</p>
        <p className="mt-0.5 font-mono text-base font-semibold break-words whitespace-pre-wrap text-slate-950" aria-hidden="true">
          {shown}
          {!done && <span className="ml-0.5 inline-block h-4 w-2 translate-y-0.5 animate-pulse bg-indigo-600" />}
        </p>
      </div>
    </motion.div>
  );
}
