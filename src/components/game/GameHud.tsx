"use client";

import { pointsAt } from "@/lib/game/rules";
import { cn } from "@/lib/ui/cn";

interface GameHudProps {
  score: number;
  roundIndex: number;
  totalRounds: number;
  /** Segundos restantes (con decimales) y duración de la ronda. */
  timeLeft: number;
  duration: number;
  isPaused: boolean;
  isRevealed: boolean;
  /** Puntos que sumó esta ronda según el servidor, cuando ya terminó para vos. */
  earnedPoints: number | null;
  /** Últimos segundos: el reloj pasa a rosa neón y late. */
  tense: boolean;
  onExit?: () => void;
}

const PILL = "flex h-12 items-center gap-2.5 border-2 border-edge bg-panel px-3 shadow-pixel";
const LABEL = "font-pixel text-[10px] leading-none tracking-wider text-cream/60 uppercase";
/* Dígitos de reloj digital: pixel, verde neón con un leve resplandor. */
const DIGITS = "font-pixel text-lg leading-none tabular-nums [text-shadow:0_0_8px_currentColor]";

/** Puntos en juego (o los que sumaste) junto al reloj. */
function roundPoints({ timeLeft, duration, isPaused, isRevealed, earnedPoints }: Pick<GameHudProps, "timeLeft" | "duration" | "isPaused" | "isRevealed" | "earnedPoints">) {
  if (isRevealed) {
    const won = (earnedPoints ?? 0) > 0;
    return { text: won ? `+${earnedPoints}` : "+0", className: won ? "text-neon-bright" : "text-slate-600" };
  }
  const live = pointsAt(Math.max(0, (duration - timeLeft) * 1000));
  return { text: `${live}`, className: isPaused ? "text-arcade-bright" : "text-arcade" };
}

/** HUD 8-bit: puntaje, ronda y reloj como displays digitales, más salir. */
export function GameHud({ score, roundIndex, totalRounds, tense, onExit, ...clock }: GameHudProps) {
  const { timeLeft, duration, isPaused, isRevealed } = clock;
  const segments = Math.round(duration);
  const filled = Math.ceil(Math.max(0, timeLeft));
  const ratio = duration > 0 ? timeLeft / duration : 0;
  const block = tense ? "animate-pulse bg-hot" : isPaused || isRevealed ? "bg-slate-500" : ratio > 0.2 ? "bg-neon" : "bg-arcade";
  const points = roundPoints(clock);

  return (
    // Mobile: [puntaje][ronda] ··· [salir] arriba y el reloj a lo ancho. Desktop: todo en una línea.
    <div className="mb-5 flex flex-wrap items-center gap-2.5 sm:flex-nowrap">
      <div className={cn(PILL, "order-1")} aria-label={`Puntaje ${score}`}>
        <span className={LABEL}>Score</span>
        <span className={cn(DIGITS, "text-emerald-400")}>{String(score).padStart(5, "0")}</span>
      </div>

      <div className={cn(PILL, "order-2")} aria-label={`Ronda ${roundIndex + 1} de ${totalRounds}`}>
        <span className={LABEL}>Ronda</span>
        <span className={cn(DIGITS, "text-emerald-400")}>
          {roundIndex + 1}/{totalRounds}
        </span>
      </div>

      <div className={cn(PILL, "order-4 w-full min-w-0 sm:order-3 sm:w-auto sm:flex-1", tense && "border-hot")}>
        <span className={LABEL}>Time</span>
        <span className={cn(DIGITS, "w-14 shrink-0", tense ? "text-hot" : "text-emerald-400")}>
          {timeLeft.toFixed(1).padStart(4, "0")}
        </span>
        <div
          role="meter"
          aria-label="Tiempo restante"
          aria-valuemin={0}
          aria-valuemax={duration}
          aria-valuenow={Math.round(timeLeft * 10) / 10}
          className="flex h-4 min-w-0 flex-1 gap-[2px] border-2 border-black bg-black p-[2px]"
        >
          {Array.from({ length: segments }, (_, i) => (
            <span key={i} className={cn("flex-1 transition-colors duration-200", i < filled ? block : "bg-edge")} />
          ))}
        </div>
        <span className={cn("hidden w-12 shrink-0 text-right font-pixel text-xs tabular-nums sm:inline", points.className)} aria-label="Puntos en juego">
          {points.text}
        </span>
      </div>

      {onExit && (
        <button
          type="button"
          onClick={onExit}
          aria-label="Salir al lobby"
          className="order-3 ml-auto grid h-12 w-12 shrink-0 cursor-pointer place-items-center border-2 border-edge bg-panel text-slate-300 shadow-pixel transition-[translate,box-shadow,color] duration-100 hover:text-hot focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neon-bright active:translate-x-0.5 active:translate-y-0.5 active:shadow-none sm:order-4 sm:ml-0"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="square" aria-hidden="true" className="h-3.5 w-3.5">
            <path d="M6 6l12 12M18 6 6 18" />
          </svg>
        </button>
      )}
    </div>
  );
}
