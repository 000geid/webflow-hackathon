"use client";

import type { ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { categoryInfo, categoryOf } from "@/lib/game/categories";
import { cn } from "@/lib/ui/cn";

/* La imagen nueva entra desde la derecha y la anterior sale hacia la izquierda. */
const ENTER = { x: 32, opacity: 0 };
const CENTER = { x: 0, opacity: 1 };
const EXIT = { x: -32, opacity: 0 };

const SPRING = { type: "spring", stiffness: 420, damping: 34 } as const;

interface CardDeckProps {
  /** Cambia en cada ronda: dispara la transición. */
  cardKey: string | number;
  /** Categoría de la ronda. */
  label?: string;
  /** Últimos segundos: el marco se enciende en rosa neón. */
  tense?: boolean;
  children: ReactNode;
}

/** Nombre con emoji si la categoría es una de las conocidas ("Pelis & Series" → "🍿 Pelis & Series"). */
function categoryText(label: string) {
  const id = categoryOf(label);
  return id ? `${categoryInfo(id).emoji} ${categoryInfo(id).label}` : label;
}

/**
 * Monitor CRT: carcasa navy con la categoría arriba, pantalla negra con scanlines y viñeta,
 * y abajo la marca y el LED de encendido.
 */
export function CardDeck({ cardKey, label, tense = false, children }: CardDeckProps) {
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
            "relative border-2 bg-panel p-2.5 transition-[border-color,box-shadow] duration-300 sm:p-3",
            tense ? "border-hot shadow-[6px_6px_0px_0px_#000,0_0_28px_rgb(251_113_133/0.35)]" : "border-[#1E2A45] shadow-[6px_6px_0px_0px_#000,0_0_25px_rgba(16,185,129,0.15)]",
          )}
        >
          <div className="flex items-center justify-between gap-3 px-1 pb-2.5">
            <p className="min-w-0 truncate font-pixel text-[11px] tracking-wider text-cream uppercase">{label ? categoryText(label) : ""}</p>
            <span className="font-pixel text-[10px] tracking-widest text-slate-600 uppercase" aria-hidden="true">CH-01</span>
          </div>

          {/* Pantalla */}
          <div className="relative overflow-hidden border-2 border-black bg-black">
            {children}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 bg-[repeating-linear-gradient(to_bottom,rgb(0_0_0/0.28)_0,rgb(0_0_0/0.28)_1px,transparent_1px,transparent_3px)]"
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_55%,rgb(0_0_0/0.55)_100%)] shadow-[inset_0_0_30px_rgb(0_0_0/0.8)]"
            />
          </div>

          <div className="flex items-center justify-between px-1 pt-2.5" aria-hidden="true">
            <span className="font-pixel text-[10px] tracking-widest text-slate-600 uppercase">Pixel Rush · CRT-15</span>
            <span className="flex items-center gap-2 font-pixel text-[10px] tracking-widest text-neon uppercase">
              <span className="h-2.5 w-2.5 bg-neon motion-safe:animate-led" />
              On
            </span>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
