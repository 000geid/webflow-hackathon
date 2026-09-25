"use client";

import type { ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/ui/cn";

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
  /** Categoría de la ronda, se muestra como etiqueta. */
  label?: string;
  /** Últimos segundos: el borde se pone rojo. */
  tense?: boolean;
  children: ReactNode;
}

/** Carta central con la imagen de la ronda. Superficie suave: el borde grueso queda para las acciones. */
export function CardDeck({ cardKey, roundIndex, totalRounds, label, tense = false, children }: CardDeckProps) {
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
            "relative rounded-3xl bg-white p-2 shadow-[0_24px_48px_-28px_rgb(2_6_23/0.35)] transition-shadow duration-300 sm:p-2.5",
            tense ? "ring-2 ring-red-400" : "ring-1 ring-slate-200",
          )}
        >
          <div className="flex items-center justify-between gap-3 px-2.5 pt-1 pb-2.5">
            <p className="font-mono text-xs tracking-wider text-slate-500 uppercase">
              Ronda <span className="text-slate-950">{roundIndex + 1}</span> / {totalRounds}
            </p>
            {label && (
              <p className="truncate rounded-full bg-slate-100 px-2.5 py-1 font-mono text-[11px] tracking-wider text-slate-600 uppercase">
                {label}
              </p>
            )}
          </div>
          {children}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
