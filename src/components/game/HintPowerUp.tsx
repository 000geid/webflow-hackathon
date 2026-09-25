"use client";

import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/ui/cn";

/*
 * Textos del power-up. Hoy la pista sale de una regla (máscara de la respuesta), no de una IA:
 * cuando el backend conecte un agente, cambiar estas etiquetas junto con la fuente de la pista.
 */
const BUTTON_LABEL = "Pista";
const USED_LABEL = "Usada";

function BulbIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.25} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={className}>
      <path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-3.6 10.8c.6.5 1 1.2 1.1 2V16h5v-.2c.1-.8.5-1.5 1.1-2A6 6 0 0 0 12 3Z" />
    </svg>
  );
}

interface HintButtonProps {
  hintsLeft: number;
  disabled: boolean;
  onClick: () => void;
}

/** Píldora manteca junto a ADIVINAR. El número indica cuántas pistas quedan en la partida. */
export function HintButton({ hintsLeft, disabled, onClick }: HintButtonProps) {
  const available = hintsLeft > 0;
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || !available}
      aria-label={available ? `Pedir pista (quedan ${hintsLeft})` : "Pista usada"}
      className={cn(
        "inline-flex h-14 shrink-0 cursor-pointer items-center gap-2 rounded-full border-2 px-4 text-sm font-black tracking-wider uppercase sm:px-5",
        "transition-[translate,box-shadow,background-color] duration-100",
        "focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-slate-900",
        available
          ? "border-slate-950 bg-butter text-slate-950 shadow-[4px_4px_0px_0px_#0F172A] enabled:hover:bg-[#FDE68A] enabled:active:translate-y-1 enabled:active:shadow-none disabled:cursor-not-allowed disabled:opacity-60"
          : "cursor-default border-slate-300 bg-line text-slate-500",
        available && !disabled && "motion-safe:animate-glow",
      )}
    >
      {available ? <BulbIcon className="h-5 w-5" /> : <span aria-hidden="true">✓</span>}
      <span className="hidden sm:inline">{available ? BUTTON_LABEL : USED_LABEL}</span>
      {available && (
        <span className="grid h-6 min-w-6 place-items-center rounded-full bg-slate-900 px-1.5 font-mono text-[11px] text-butter" aria-hidden="true">
          {hintsLeft}
        </span>
      )}
    </button>
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
      initial={{ opacity: 0, y: -6, rotate: -0.6 }}
      animate={{ opacity: 1, y: 0, rotate: 0 }}
      exit={{ opacity: 0, y: -6 }}
      className="mt-4 flex items-start gap-3 rounded-2xl border-2 border-slate-900 bg-butter p-3 shadow-[3px_3px_0px_0px_#0F172A]"
      role="status"
      aria-label={`Pista: ${text}`}
    >
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-slate-900 text-butter" aria-hidden="true">
        <BulbIcon className="h-4.5 w-4.5" />
      </span>
      <div className="min-w-0 pt-0.5">
        <p className="font-mono text-[10px] font-bold tracking-wider text-slate-900/60 uppercase">Tu pista</p>
        <p className="mt-0.5 font-mono text-base font-bold break-words whitespace-pre-wrap text-slate-950" aria-hidden="true">
          {shown}
          {!done && <span className="ml-0.5 inline-block h-4 w-2 translate-y-0.5 animate-pulse bg-slate-900" />}
        </p>
      </div>
    </motion.div>
  );
}
