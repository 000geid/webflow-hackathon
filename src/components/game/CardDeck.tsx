"use client";

import type { ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { categoryInfo, categoryOf } from "@/lib/game/categories";
import { cn } from "@/lib/ui/cn";
import { getProgressSegments, type SegmentState } from "@/lib/ui/progress";

/* La carta nueva entra desde la derecha y la anterior sale hacia la izquierda. */
const ENTER = { x: 32, opacity: 0, rotate: 1.5 };
const CENTER = { x: 0, opacity: 1, rotate: 0 };
const EXIT = { x: -32, opacity: 0, rotate: -1.5 };

const SPRING = { type: "spring", stiffness: 420, damping: 34 } as const;

const DOT: Record<SegmentState, string> = {
  correct: "bg-mint",
  wrong: "bg-coral",
  current: "bg-slate-900",
  upcoming: "bg-paper",
};

interface CardDeckProps {
  /** Cambia en cada ronda: dispara la transición. */
  cardKey: string | number;
  roundIndex: number;
  totalRounds: number;
  /** Resultado de las rondas ya jugadas (true = acierto), para los puntos de la cabecera. */
  results: boolean[];
  /** Categoría de la ronda. */
  label?: string;
  /** Últimos segundos: la sombra se vuelve coral y el punto actual late. */
  tense?: boolean;
  children: ReactNode;
}

/** Nombre con emoji si la categoría es una de las conocidas ("Pelis & Series" → "🍿 Pelis & Series"). */
function categoryBadge(label: string) {
  const id = categoryOf(label);
  return id ? `${categoryInfo(id).emoji} ${categoryInfo(id).label}` : label;
}

/** Carta coleccionable: cabecera crema con categoría y ronda, y la imagen como ilustración. */
export function CardDeck({ cardKey, roundIndex, totalRounds, results, label, tense = false, children }: CardDeckProps) {
  const segments = getProgressSegments(totalRounds, roundIndex, results);

  return (
    <div className="relative mx-auto w-full">
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.div
          key={cardKey}
          initial={ENTER}
          animate={CENTER}
          exit={EXIT}
          transition={SPRING}
          className={cn(
            "relative overflow-hidden rounded-3xl border-3 border-slate-900 bg-paper transition-shadow duration-300",
            tense ? "shadow-[6px_6px_0px_0px_#FF8A65]" : "shadow-[6px_6px_0px_0px_#0F172A]",
          )}
        >
          <div className="flex items-center justify-between gap-3 border-b-3 border-slate-900 bg-cream px-3 py-2.5 sm:px-4">
            {label && (
              <p className="min-w-0 truncate rounded-full border-2 border-slate-900 bg-peach px-3 py-1 text-xs font-black tracking-wide text-slate-950 uppercase">
                {categoryBadge(label)}
              </p>
            )}
            <div className="ml-auto flex shrink-0 items-center gap-3">
              <span className="hidden items-center gap-1 sm:flex" aria-hidden="true">
                {segments.map((state, i) => (
                  <span
                    key={i}
                    className={cn(
                      "h-2.5 w-2.5 rounded-full border-2 border-slate-900",
                      tense && state === "current" ? "animate-pulse bg-coral" : DOT[state],
                    )}
                  />
                ))}
              </span>
              <p className="font-mono text-xs font-black tracking-wider text-slate-900 uppercase">
                Ronda {roundIndex + 1}/{totalRounds}
              </p>
            </div>
          </div>
          <div className="p-2.5 sm:p-3">{children}</div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
