"use client";

import { AnimatePresence, motion } from "framer-motion";
import { pointsAt } from "@/lib/game/rules";
import { cn } from "@/lib/ui/cn";

interface GameHudProps {
  score: number;
  /** Aciertos seguidos al final de las rondas jugadas. */
  streak: number;
  /** Segundos restantes (con decimales) y duración de la ronda. */
  timeLeft: number;
  duration: number;
  isPaused: boolean;
  isRevealed: boolean;
  /** Puntos que sumó esta ronda según el servidor, cuando ya terminó para vos. */
  earnedPoints: number | null;
  /** Últimos segundos: el tanque parpadea en coral. */
  tense: boolean;
  onExit?: () => void;
}

type GaugeState = "running" | "frozen" | "won" | "lost";

const LABEL: Record<GaugeState, string> = {
  running: "En juego",
  frozen: "Frenado",
  won: "¡Sumaste!",
  lost: "No suma",
};

/** Marca de Pixel Rush: un "píxel" 2×2. */
function LogoMark() {
  return (
    <span aria-hidden="true" className="grid h-8 w-8 shrink-0 grid-cols-2 gap-0.5 rounded-lg border-2 border-slate-900 bg-slate-900 p-1">
      <span className="rounded-[2px] bg-mint" />
      <span className="rounded-[2px] bg-peach" />
      <span className="rounded-[2px] bg-butter" />
      <span className="rounded-[2px] bg-coral" />
    </span>
  );
}

/** Píldora izquierda: puntaje total y racha. */
function ScorePill({ score, streak }: { score: number; streak: number }) {
  return (
    <div className="flex h-14 items-center gap-3 rounded-full border-2 border-slate-900 bg-peach py-1 pr-2 pl-2 shadow-[3px_3px_0px_0px_#0F172A]">
      <LogoMark />
      <div className="leading-none" aria-label={`${score} puntos`}>
        <p className="font-mono text-[10px] font-bold tracking-wider text-slate-900/60 uppercase">Puntaje</p>
        <p className="mt-0.5 font-mono text-xl font-black text-slate-950 tabular-nums">{score.toLocaleString("es-AR")}</p>
      </div>
      <span
        className={cn(
          "rounded-full border-2 border-slate-900 px-2.5 py-1 font-mono text-[11px] font-black tracking-wide uppercase transition-colors",
          streak >= 2 ? "bg-slate-900 text-peach" : "bg-paper text-slate-400",
        )}
        aria-label={`Racha de ${streak}`}
      >
        Racha {streak}
      </span>
    </div>
  );
}

/**
 * Píldora derecha: tanque de "combustible" con un segmento por segundo (E vacío, F lleno).
 * Verde con tiempo de sobra, manteca a mitad de camino, coral al final.
 */
function FuelGauge({ timeLeft, duration, isPaused, isRevealed, earnedPoints, tense }: Omit<GameHudProps, "score" | "streak" | "onExit">) {
  const elapsedMs = Math.max(0, (duration - timeLeft) * 1000);
  const state: GaugeState = isRevealed ? ((earnedPoints ?? 0) > 0 ? "won" : "lost") : isPaused ? "frozen" : "running";
  const points = state === "won" ? earnedPoints! : state === "lost" ? 0 : pointsAt(elapsedMs);
  const segments = Math.round(duration);
  const filled = Math.ceil(Math.max(0, timeLeft));
  const ratio = duration > 0 ? timeLeft / duration : 0;
  const fuel = tense ? "bg-coral" : ratio > 0.5 ? "bg-mint" : ratio > 0.2 ? "bg-butter" : "bg-coral";

  return (
    <div
      className={cn(
        "flex h-14 min-w-0 flex-1 items-center gap-3 rounded-full border-2 border-slate-900 py-1 pr-4 pl-4 shadow-[3px_3px_0px_0px_#0F172A] transition-colors duration-300",
        tense ? "bg-[#FFE3D9]" : state === "won" ? "bg-mint" : "bg-paper",
      )}
    >
      <div className="w-[5.5rem] shrink-0 leading-none">
        <p className="font-mono text-[10px] font-bold tracking-wider text-slate-900/60 uppercase">{LABEL[state]}</p>
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.p
            key={state === "won" || state === "lost" ? state : "live"}
            initial={{ scale: 1.3, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 500, damping: 28 }}
            className={cn("mt-0.5 origin-left font-mono text-xl font-black tabular-nums", state === "lost" ? "text-slate-400" : "text-slate-950")}
          >
            {state === "won" && "+"}
            {points.toLocaleString("es-AR")}
          </motion.p>
        </AnimatePresence>
      </div>

      <span className="font-mono text-xs font-black text-slate-900" aria-hidden="true">E</span>
      <div
        role="meter"
        aria-label="Tiempo restante"
        aria-valuemin={0}
        aria-valuemax={duration}
        aria-valuenow={Math.round(timeLeft * 10) / 10}
        className="flex h-6 min-w-0 flex-1 items-stretch gap-[3px] rounded-md border-2 border-slate-900 bg-slate-900 p-[3px]"
      >
        {Array.from({ length: segments }, (_, i) => (
          <span
            key={i}
            className={cn(
              "flex-1 rounded-[2px] transition-colors duration-200",
              i < filled ? fuel : "bg-slate-700",
              i < filled && tense && "animate-pulse",
              i < filled && (isPaused || isRevealed) && !tense && "opacity-70",
            )}
          />
        ))}
      </div>
      <span className="font-mono text-xs font-black text-slate-900" aria-hidden="true">F</span>

      <span className={cn("w-12 shrink-0 text-right font-mono text-sm font-black tabular-nums", tense ? "text-[#C2410C]" : "text-slate-950")}>
        {timeLeft.toFixed(1)}s
      </span>
    </div>
  );
}

/** HUD del juego: dos píldoras flotantes (puntaje y tiempo) y salir. */
export function GameHud({ score, streak, onExit, ...gauge }: GameHudProps) {
  return (
    // Mobile: [puntaje ··· salir] arriba y el tanque a lo ancho. Desktop: puntaje | tanque | salir.
    <div className="mb-6 flex flex-wrap items-center gap-3 sm:flex-nowrap">
      <div className="order-1">
        <ScorePill score={score} streak={streak} />
      </div>
      {onExit && (
        <button
          type="button"
          onClick={onExit}
          aria-label="Salir al lobby"
          className="order-2 ml-auto grid h-11 w-11 shrink-0 cursor-pointer place-items-center rounded-full border-2 border-slate-900 bg-paper text-slate-900 shadow-[2px_2px_0px_0px_#0F172A] transition-transform hover:bg-cream focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900 active:translate-y-0.5 active:shadow-none sm:order-3 sm:ml-0"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" aria-hidden="true" className="h-3.5 w-3.5">
            <path d="M6 6l12 12M18 6 6 18" />
          </svg>
        </button>
      )}
      <div className="order-3 flex w-full min-w-0 sm:order-2 sm:w-auto sm:flex-1">
        <FuelGauge {...gauge} />
      </div>
    </div>
  );
}
