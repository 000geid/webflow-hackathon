"use client";

import type { ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";

/* La carta nueva entra desde la derecha y la anterior sale hacia la izquierda.
   Solo desplazamiento + fade: sin rotación, para que se sienta preciso. */
const ENTER = { x: 32, opacity: 0 };
const CENTER = { x: 0, opacity: 1 };
const EXIT = { x: -32, opacity: 0 };

const SPRING = { type: "spring", stiffness: 420, damping: 36 } as const;

interface CardDeckProps {
  /** Cambia en cada ronda: dispara la transición. */
  cardKey: string | number;
  roundIndex: number;
  totalRounds: number;
  children: ReactNode;
}

/** Carta central con la imagen de la ronda. */
export function CardDeck({ cardKey, roundIndex, totalRounds, children }: CardDeckProps) {
  return (
    <div className="relative mx-auto w-full">
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.div
          key={cardKey}
          initial={ENTER}
          animate={CENTER}
          exit={EXIT}
          transition={SPRING}
          className="relative rounded-xl border-2 border-slate-900 bg-white p-2.5 shadow-hard sm:p-3"
        >
          <div className="flex items-center justify-between px-1 pt-0.5 pb-2.5">
            <p className="font-mono text-xs tracking-wider text-slate-500 uppercase">
              Ronda {roundIndex + 1} de {totalRounds}
            </p>
            {/* Tres puntos monocromos, como el chrome de una ventana */}
            <span aria-hidden="true" className="flex gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-slate-300" />
              <span className="h-1.5 w-1.5 rounded-full bg-slate-300" />
              <span className="h-1.5 w-1.5 rounded-full bg-slate-300" />
            </span>
          </div>
          {children}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
