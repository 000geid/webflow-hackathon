"use client";

import { AnimatePresence, motion } from "framer-motion";
import { MAX_POINTS, pointsAt } from "@/lib/game/rules";
import { cn } from "@/lib/ui/cn";

interface PointsMeterProps {
  /** Segundos restantes (con decimales). */
  timeLeft: number;
  /** Duración de la ronda en segundos. */
  duration: number;
  isPaused: boolean;
  isRevealed: boolean;
  /** Puntos que el servidor sumó en esta ronda (cuando ya respondiste o se acabó el tiempo). */
  earnedPoints: number | null;
  /** Últimos segundos: barra roja parpadeando. */
  tense: boolean;
}

type MeterState = "running" | "frozen" | "won" | "lost";

const LABEL: Record<MeterState, string> = {
  running: "En juego ahora",
  frozen: "Si acertás",
  won: "¡Sumaste!",
  lost: "Esta ronda no suma",
};

/**
 * Medidor en vivo: los puntos bajan de 1.000 a 100 mientras corre el reloj.
 * Usa pointsAt(), la misma fórmula con la que puntúa el servidor.
 */
export function PointsMeter({ timeLeft, duration, isPaused, isRevealed, earnedPoints, tense }: PointsMeterProps) {
  const elapsedMs = Math.max(0, (duration - timeLeft) * 1000);
  const state: MeterState = isRevealed ? ((earnedPoints ?? 0) > 0 ? "won" : "lost") : isPaused ? "frozen" : "running";
  const points = state === "won" ? earnedPoints! : state === "lost" ? 0 : pointsAt(elapsedMs);
  const timeRatio = duration > 0 ? Math.min(Math.max(timeLeft / duration, 0), 1) : 0;

  return (
    <div
      className={cn(
        "mb-3 flex items-center gap-3 rounded-2xl px-4 py-3 ring-1 transition-colors duration-300 sm:gap-5",
        tense ? "bg-red-50 ring-red-200" : state === "won" ? "bg-emerald-50 ring-emerald-200" : "bg-white/70 ring-slate-200",
      )}
      aria-live="off"
    >
      <div className="w-[7.5rem] shrink-0 sm:w-36">
        <p className="font-mono text-[10px] tracking-wider text-slate-500 uppercase">{LABEL[state]}</p>
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.p
            // Al pasar a "sumaste" o "no suma", el número hace un pequeño salto.
            key={state === "won" || state === "lost" ? state : "live"}
            initial={{ scale: 1.25, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 500, damping: 28 }}
            className={cn(
              "origin-left font-mono text-2xl leading-tight font-black tabular-nums sm:text-3xl",
              tense ? "text-red-600" : state === "won" ? "text-emerald-600" : state === "lost" ? "text-slate-400" : state === "frozen" ? "text-blue-600" : "text-slate-950",
            )}
          >
            {state === "won" && "+"}
            {points.toLocaleString("es-AR")}
            <span className="ml-1 text-[11px] font-bold text-slate-400">PTS</span>
          </motion.p>
        </AnimatePresence>
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between font-mono text-[10px] tracking-wider text-slate-400 uppercase">
          <span>{isPaused || isRevealed ? "Reloj frenado" : "Tiempo"}</span>
          <span className={cn("tabular-nums", tense && "font-bold text-red-600")}>{timeLeft.toFixed(1)} s</span>
        </div>
        <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-slate-200">
          <div
            className={cn(
              "h-full rounded-full transition-[width] duration-200 ease-linear",
              tense ? "animate-pulse bg-red-500" : isPaused || isRevealed ? "bg-slate-400" : "bg-blue-600",
            )}
            style={{ width: `${timeRatio * 100}%` }}
          />
        </div>
      </div>

      <span
        className={cn(
          "hidden shrink-0 rounded-full px-2.5 py-1 font-mono text-xs font-bold tabular-nums sm:inline-block",
          tense ? "bg-red-500 text-white" : "bg-slate-950 text-white",
        )}
        aria-label={`Multiplicador ${(points / MAX_POINTS).toFixed(2)}`}
      >
        ×{(points / MAX_POINTS).toFixed(2)}
      </span>
    </div>
  );
}
