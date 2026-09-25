"use client";

import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/ui/cn";

/*
 * Textos del power-up. Hoy la pista sale de una regla (máscara de la respuesta), no de una IA
 * ni del MCP: cuando el backend conecte un agente, cambiar estas etiquetas junto con la fuente.
 */
const BUTTON_LABEL = "Pista";
const USED_LABEL = "Usada";

function BulbIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="square" strokeLinejoin="miter" aria-hidden="true" className={className}>
      <path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-3.6 10.8c.6.5 1 1.2 1.1 2V16h5v-.2c.1-.8.5-1.5 1.1-2A6 6 0 0 0 12 3Z" />
    </svg>
  );
}

interface HintButtonProps {
  hintsLeft: number;
  disabled: boolean;
  onClick: () => void;
}

/** Botón de arcade ámbar junto a ADIVINAR. El número indica cuántas pistas quedan en la partida. */
export function HintButton({ hintsLeft, disabled, onClick }: HintButtonProps) {
  const available = hintsLeft > 0;
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || !available}
      aria-label={available ? `Pedir pista (quedan ${hintsLeft})` : "Pista usada"}
      className={cn(
        "inline-flex h-14 shrink-0 cursor-pointer items-center gap-2 border-2 px-4 font-pixel text-sm tracking-wide uppercase sm:px-5",
        "transition-[translate,box-shadow,background-color] duration-100",
        "focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-arcade-bright",
        available
          ? "border-black bg-[#F59E0B] text-black shadow-pixel enabled:hover:translate-x-[-2px] enabled:hover:translate-y-[-2px] enabled:hover:bg-arcade-bright enabled:active:translate-x-0.5 enabled:active:translate-y-0.5 enabled:active:shadow-none disabled:cursor-not-allowed disabled:opacity-50"
          : "cursor-default border-edge bg-panel text-slate-500",
        available && !disabled && "motion-safe:animate-glow",
      )}
    >
      {available ? <BulbIcon className="h-5 w-5" /> : <span aria-hidden="true">✓</span>}
      <span className="hidden sm:inline">{available ? BUTTON_LABEL : USED_LABEL}</span>
      {available && (
        <span className="grid h-5 min-w-5 place-items-center bg-black px-1 font-pixel text-[10px] text-arcade-bright" aria-hidden="true">
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
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      className="mt-4 flex items-start gap-3 border-2 border-arcade bg-arcade/10 p-3 shadow-pixel"
      role="status"
      aria-label={`Pista: ${text}`}
    >
      <span className="grid h-9 w-9 shrink-0 place-items-center border-2 border-black bg-arcade text-black" aria-hidden="true">
        <BulbIcon className="h-4.5 w-4.5" />
      </span>
      <div className="min-w-0 pt-0.5">
        <p className="font-pixel text-[10px] tracking-wider text-arcade uppercase">Tu pista</p>
        <p className="mt-1 font-mono text-base font-bold break-words whitespace-pre-wrap text-arcade-bright" aria-hidden="true">
          {shown}
          {!done && <span className="ml-0.5 inline-block h-4 w-2 translate-y-0.5 animate-pulse bg-arcade-bright" />}
        </p>
      </div>
    </motion.div>
  );
}
