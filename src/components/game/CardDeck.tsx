"use client";

import type { ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CardBack } from "./CardBack";

/* Punto de partida de la carta nueva: viene del mazo de la derecha. */
const ENTER = { x: "18%", rotate: 6, scale: 0.9, opacity: 0 };
/* Posición final en el centro. */
const CENTER = { x: 0, rotate: 0, scale: 1, opacity: 1 };
/* Salida: se desliza hacia la izquierda como una carta descartada. */
const EXIT = { x: "-130%", rotate: -14, opacity: 0 };

const SPRING = { type: "spring", stiffness: 300, damping: 20 } as const;

interface CardDeckProps {
  /** Cambia en cada ronda: dispara la animación de swipe. */
  cardKey: string | number;
  roundIndex: number;
  totalRounds: number;
  children: ReactNode;
}

/**
 * Mazo de cartas: una carta activa al centro y dos asomando atrás.
 * La carta de la derecha muestra el dorso con el logo.
 */
export function CardDeck({ cardKey, roundIndex, totalRounds, children }: CardDeckProps) {
  return (
    <div className="relative mx-auto w-full">
      {/* Cartas de fondo (decorativas) */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 -translate-x-[9%] translate-y-2 scale-90 -rotate-6">
          <div className="h-full w-full rounded-2xl border-3 border-ink bg-highlight shadow-hard-lg" />
        </div>
        <div className="absolute inset-0 translate-x-[9%] translate-y-2 scale-90 rotate-6">
          <CardBack />
        </div>
      </div>

      {/* Carta activa */}
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.div
          key={cardKey}
          initial={ENTER}
          animate={CENTER}
          exit={EXIT}
          transition={SPRING}
          className="relative rounded-2xl border-3 border-ink bg-white p-3 shadow-hard-lg sm:p-4"
        >
          <div className="flex items-center justify-between px-0.5 pb-3">
            <p className="text-xs font-black tracking-widest text-ink uppercase">
              Ronda {roundIndex + 1} de {totalRounds}
            </p>
            {/* Tres "píxeles" decorativos, estilo etiqueta suiza */}
            <span aria-hidden="true" className="flex gap-1">
              <span className="h-2.5 w-2.5 border-2 border-ink bg-brand" />
              <span className="h-2.5 w-2.5 border-2 border-ink bg-highlight" />
              <span className="h-2.5 w-2.5 border-2 border-ink bg-white" />
            </span>
          </div>
          {children}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
