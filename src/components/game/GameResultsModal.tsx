"use client";

import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { getAccuracy, getStarRating, shouldCelebrate, type StarRating as Stars } from "@/lib/ui/results";
import { StarRating } from "./StarRating";

const TITLES: Record<Stars, string> = {
  3: "¡Sos una máquina!",
  2: "¡Muy bien!",
  1: "¡Buen intento!",
};

export interface GameResultsModalProps {
  open: boolean;
  score: number;
  /** Puntaje máximo posible de la partida (rondas × 1000). */
  maxScore: number;
  correctCount: number;
  totalRounds: number;
  onPlayAgain: () => void;
}

/** Tira confetti desde los dos costados. Se carga solo en el navegador. */
async function fireConfetti() {
  const confetti = (await import("canvas-confetti")).default;
  const base = { particleCount: 80, spread: 70, startVelocity: 55, disableForReducedMotion: true, zIndex: 60 };
  confetti({ ...base, angle: 60, origin: { x: 0, y: 0.7 } });
  confetti({ ...base, angle: 120, origin: { x: 1, y: 0.7 } });
  setTimeout(() => confetti({ ...base, particleCount: 120, spread: 100, origin: { y: 0.4 } }), 250);
}

export function GameResultsModal({ open, score, maxScore, correctCount, totalRounds, onPlayAgain }: GameResultsModalProps) {
  const stars = getStarRating(score, maxScore);
  const accuracy = getAccuracy(correctCount, totalRounds);

  useEffect(() => {
    if (open && shouldCelebrate(stars)) void fireConfetti();
  }, [open, stars]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="backdrop"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="results-title"
            className="w-full max-w-md rounded-3xl border-4 border-ink bg-white p-8 text-center shadow-[0_8px_0_0_#0f172a]"
            initial={{ opacity: 0, scale: 0.9, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 260, damping: 22 }}
          >
            <StarRating stars={stars} />

            <h2 id="results-title" className="mt-5 text-2xl font-black tracking-tight sm:text-3xl">
              {TITLES[stars]}
            </h2>
            <p className="mt-1 font-bold text-slate-500">Terminaste la partida</p>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <div className="rounded-2xl border-2 border-b-4 border-blue-200 border-b-blue-300 bg-blue-50 px-4 py-3 shadow-[0_0_24px_rgba(37,99,235,0.25)]">
                <p className="text-xs font-extrabold tracking-widest text-blue-500 uppercase">Puntaje</p>
                <p className="text-3xl font-black text-brand tabular-nums">{score.toLocaleString("es-AR")}</p>
              </div>
              <div className="rounded-2xl border-2 border-b-4 border-emerald-200 border-b-emerald-300 bg-emerald-50 px-4 py-3 shadow-[0_0_24px_rgba(16,185,129,0.25)]">
                <p className="text-xs font-extrabold tracking-widest text-emerald-600 uppercase">Precisión</p>
                <p className="text-3xl font-black text-emerald-600 tabular-nums">{accuracy}%</p>
              </div>
            </div>
            <p className="mt-3 text-sm font-bold text-slate-500">
              {correctCount} de {totalRounds} correctas
            </p>

            <button
              type="button"
              autoFocus
              onClick={onPlayAgain}
              className="mt-7 w-full cursor-pointer rounded-2xl border-b-4 border-brand-edge bg-brand py-4 text-lg font-black tracking-[0.15em] text-white uppercase transition-[translate,background-color,border-color,margin] duration-100 hover:bg-[#3b74f0] focus-visible:ring-4 focus-visible:ring-blue-400/50 focus-visible:outline-hidden active:mb-1 active:translate-y-1 active:border-b-0"
            >
              Jugar de nuevo
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
