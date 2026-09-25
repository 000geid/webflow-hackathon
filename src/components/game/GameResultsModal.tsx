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
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink/60 px-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="results-title"
            className="w-full max-w-md rounded-2xl border-3 border-ink bg-white p-8 text-center shadow-hard-xl"
            initial={{ opacity: 0, scale: 0.9, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 260, damping: 22 }}
          >
            <StarRating stars={stars} />

            <h2 id="results-title" className="mt-5 text-2xl font-black tracking-tight sm:text-3xl">
              {TITLES[stars]}
            </h2>
            <p className="mt-1 text-sm font-extrabold tracking-widest text-slate-500 uppercase">Terminaste la partida</p>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <div className="rounded-xl border-2 border-ink bg-brand px-4 py-3 text-white shadow-hard-sm">
                <p className="text-xs font-black tracking-widest text-blue-100 uppercase">Puntaje</p>
                <p className="text-3xl font-black tracking-tight tabular-nums">{score.toLocaleString("es-AR")}</p>
              </div>
              <div className="rounded-xl border-2 border-ink bg-highlight px-4 py-3 text-ink shadow-hard-sm">
                <p className="text-xs font-black tracking-widest text-ink/70 uppercase">Precisión</p>
                <p className="text-3xl font-black tracking-tight tabular-nums">{accuracy}%</p>
              </div>
            </div>
            <p className="mt-4 text-sm font-bold text-slate-600">
              {correctCount} de {totalRounds} correctas
            </p>

            <button
              type="button"
              autoFocus
              onClick={onPlayAgain}
              className="mt-7 w-full cursor-pointer rounded-xl border-2 border-ink bg-brand py-4 text-lg font-black tracking-[0.12em] text-white uppercase shadow-hard transition-[translate,box-shadow] duration-100 hover:-translate-x-px hover:-translate-y-px hover:shadow-hard-lg focus-visible:outline-3 focus-visible:outline-offset-4 focus-visible:outline-brand active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
            >
              Jugar de nuevo
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
