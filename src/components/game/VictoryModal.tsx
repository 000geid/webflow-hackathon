"use client";

import { useEffect, type PointerEvent, type ReactNode } from "react";
import { AnimatePresence, motion, useMotionValue, useReducedMotion, useSpring, useTransform } from "framer-motion";
import { CountUp } from "@/components/ui/CountUp";
import { PillButton } from "@/components/ui/PillButton";
import type { RoundHistory } from "@/lib/game/hints";
import { copyText } from "@/lib/ui/clipboard";
import { cn } from "@/lib/ui/cn";
import { getStarRating } from "@/lib/ui/results";
import { formatSeconds, victoryStats, victoryTitle } from "@/lib/ui/victory";
import type { Toast } from "./LiveToast";
import { StarRating } from "./StarRating";

export type RankingEntry = { id: string; name: string; avatar: string; score: number; isYou: boolean };

export interface VictoryModalProps {
  open: boolean;
  player: { name: string; avatar: string };
  score: number;
  /** Puntaje máximo posible (rondas × 1000). */
  maxScore: number;
  totalRounds: number;
  history: RoundHistory[];
  /** Pistas usadas en la partida (cambia el título). */
  hintsUsed: number;
  /** "Sala 59GT2" o "Solo": va impreso en la tarjeta. */
  edition: string;
  /** Multijugador: tabla final ordenada por puntaje. */
  ranking?: RankingEntry[];
  onPlayAgain: () => void;
  playAgainLabel?: string;
  playAgainDisabled?: boolean;
  onExit?: () => void;
  onNotify?: (toast: Omit<Toast, "id">) => void;
}

const WATERFALL_ACCURACY = 60;
const CONFETTI_COLORS = ["#2563eb", "#60a5fa", "#fcd34d", "#34d399", "#ffffff"];

/** Lluvia continua de confetti mientras la tarjeta está abierta. Devuelve la función para cortarla. */
function startWaterfall(): () => void {
  let stopped = false;
  let timer: number | undefined;
  let reset: (() => void) | undefined;
  void import("canvas-confetti").then(({ default: confetti }) => {
    if (stopped) return;
    reset = () => confetti.reset();
    timer = window.setInterval(() => {
      confetti({
        particleCount: 3,
        startVelocity: 0,
        ticks: 320,
        gravity: 0.55,
        scalar: 0.9,
        drift: Math.random() - 0.5,
        origin: { x: Math.random(), y: -0.05 },
        colors: CONFETTI_COLORS,
        disableForReducedMotion: true,
        zIndex: 60,
      });
    }, 110);
  });
  return () => {
    stopped = true;
    window.clearInterval(timer);
    reset?.();
  };
}

function StatCapsule({ label, children, sub }: { label: string; children: ReactNode; sub?: string }) {
  return (
    <div className="min-w-0 rounded-2xl bg-white/[0.06] px-4 py-3 ring-1 ring-white/10">
      <dt className="font-mono text-[10px] tracking-wider text-slate-400 uppercase">{label}</dt>
      <dd className="mt-1 truncate text-2xl leading-tight font-black tracking-tight tabular-nums">{children}</dd>
      {sub && <p className="mt-0.5 truncate font-mono text-[11px] text-slate-400">{sub}</p>}
    </div>
  );
}

/** Tarjeta coleccionable de fin de partida: título según desempeño, métricas y acciones para compartir. */
export function VictoryModal({
  open, player, score, maxScore, totalRounds, history, hintsUsed, edition, ranking,
  onPlayAgain, playAgainLabel = "Jugar de nuevo", playAgainDisabled = false, onExit, onNotify,
}: VictoryModalProps) {
  const reduceMotion = useReducedMotion();
  const stats = victoryStats(history, totalRounds);
  const title = victoryTitle({ score, maxScore, hintsUsed });
  const stars = getStarRating(score, maxScore);
  const place = ranking ? 1 + ranking.filter((entry) => entry.score > score).length : null;

  // Inclinación 3D siguiendo el puntero, con resorte para que no sea brusca.
  const pointerX = useMotionValue(0.5);
  const pointerY = useMotionValue(0.5);
  const rotateY = useSpring(useTransform(pointerX, [0, 1], [-7, 7]), { stiffness: 200, damping: 20 });
  const rotateX = useSpring(useTransform(pointerY, [0, 1], [6, -6]), { stiffness: 200, damping: 20 });

  function tilt(event: PointerEvent<HTMLDivElement>) {
    if (reduceMotion || event.pointerType !== "mouse") return;
    const box = event.currentTarget.getBoundingClientRect();
    pointerX.set((event.clientX - box.left) / box.width);
    pointerY.set((event.clientY - box.top) / box.height);
  }
  function resetTilt() {
    pointerX.set(0.5);
    pointerY.set(0.5);
  }

  useEffect(() => {
    if (!open || stats.accuracy <= WATERFALL_ACCURACY) return;
    return startWaterfall();
  }, [open, stats.accuracy]);

  async function share() {
    const url = `${window.location.origin}${window.location.pathname}`;
    const text = `${title.emoji} ${title.title} en Pixel Rush: ${score.toLocaleString("es-AR")} pts · ${stats.correct}/${stats.total} correctas`
      + `${stats.averageMs !== null ? ` · ${formatSeconds(stats.averageMs)} de media` : ""}. ¿Me superás? ${url}`;
    if (await copyText(text)) onNotify?.({ icon: "✓", text: "Desafío copiado: pegalo donde quieras", tone: "success" });
    else onNotify?.({ icon: "!", text: "No se pudo copiar el desafío", tone: "danger" });
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="backdrop"
          className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/60 backdrop-blur-md"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="flex min-h-full flex-col items-center justify-center px-4 py-8">
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-labelledby="victory-title"
              className="w-full max-w-sm [perspective:1200px]"
              initial={{ opacity: 0, y: 40, scale: 0.9, rotate: -3 }}
              animate={{ opacity: 1, y: 0, scale: 1, rotate: 0 }}
              exit={{ opacity: 0, y: 20, scale: 0.96 }}
              transition={{ type: "spring", stiffness: 260, damping: 22 }}
            >
              <motion.div onPointerMove={tilt} onPointerLeave={resetTilt} style={{ rotateX, rotateY }} className="[transform-style:preserve-3d]">
                {/* Borde holográfico */}
                <div className="rounded-[1.9rem] bg-[linear-gradient(115deg,#60a5fa,#a78bfa,#fcd34d,#34d399,#60a5fa)] bg-[length:300%_100%] p-[3px] shadow-[0_30px_80px_-20px_rgb(37_99_235/0.55)] motion-safe:animate-holo">
                  <div className="relative isolate overflow-hidden rounded-[1.75rem] bg-slate-950 p-5 text-white">
                    {/* Luz ambiente + brillo que cruza la tarjeta */}
                    <div aria-hidden="true" className="absolute -top-24 -right-16 -z-10 h-64 w-64 rounded-full bg-blue-600/40 blur-3xl" />
                    <div aria-hidden="true" className="absolute -bottom-24 -left-16 -z-10 h-56 w-56 rounded-full bg-amber-300/15 blur-3xl" />
                    <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[linear-gradient(115deg,transparent_35%,rgb(255_255_255/0.12)_48%,transparent_60%)] bg-[length:250%_100%] motion-safe:animate-sheen" />

                    <div className="flex items-center justify-between font-mono text-[10px] tracking-[0.18em] uppercase">
                      <span className="rounded-full bg-white/10 px-2.5 py-1 text-slate-300">{edition}</span>
                      <span className={cn("rounded-full px-2.5 py-1 font-bold", title.rarity === "Legendaria" ? "bg-amber-300 text-slate-950" : "bg-white/10 text-slate-300")}>
                        {title.rarity}
                      </span>
                    </div>

                    <div className="mt-5 flex items-center gap-3">
                      <span className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-white/10 text-3xl ring-2 ring-amber-300/80" aria-hidden="true">
                        {player.avatar}
                      </span>
                      <div className="min-w-0">
                        <p className="truncate text-lg font-bold">{player.name || "Jugador"}</p>
                        <p className="font-mono text-[11px] tracking-wider text-slate-400 uppercase">
                          {place ? `Puesto ${place} de ${ranking!.length}` : "Partida solo"}
                        </p>
                      </div>
                    </div>

                    <div className="mt-5">
                      <p className="text-3xl" aria-hidden="true">{title.emoji}</p>
                      <h2 id="victory-title" className="mt-1 text-3xl leading-none font-black tracking-tight text-amber-300 uppercase sm:text-4xl">
                        {title.title}
                        {title.accent === "blue-dot" && (
                          <span aria-hidden="true" className="ml-2 inline-block h-3 w-3 -translate-y-1 rounded-full bg-blue-500 shadow-[0_0_12px_rgb(59_130_246/0.9)]" />
                        )}
                      </h2>
                      <p className="mt-2 text-sm text-slate-400">{title.tagline}</p>
                    </div>

                    <div className="mt-4">
                      <StarRating stars={stars} size="sm" align="start" />
                    </div>

                    <dl className="mt-5 grid grid-cols-2 gap-2.5">
                      <StatCapsule label="Puntaje total" sub={`de ${maxScore.toLocaleString("es-AR")}`}>
                        <CountUp value={score} /> <span className="text-xs font-bold text-slate-400">PTS</span>
                      </StatCapsule>
                      <StatCapsule label="Precisión" sub={`${stats.correct}/${stats.total} correctas`}>
                        <CountUp value={stats.accuracy} suffix="%" />
                      </StatCapsule>
                      <StatCapsule label="Tiempo medio" sub="hasta frenar">
                        {formatSeconds(stats.averageMs)}
                      </StatCapsule>
                      <StatCapsule label="Categoría" sub={`${history.length} rondas`}>
                        <span className="text-base">{stats.category}</span>
                      </StatCapsule>
                    </dl>

                    {ranking && (
                      <ol className="mt-3 divide-y divide-white/10 rounded-2xl bg-white/[0.04] ring-1 ring-white/10" aria-label="Tabla final">
                        {ranking.map((entry, index) => (
                          <li key={entry.id} className={cn("flex items-center gap-2.5 px-3 py-2", entry.isYou && "bg-white/[0.06]")}>
                            <span
                              className={cn("w-7 text-center font-mono text-xs font-bold", index === 0 ? "text-amber-300" : "text-slate-400")}
                              aria-label={`Puesto ${index + 1}`}
                            >
                              {index + 1}º
                            </span>
                            <span className="text-base" aria-hidden="true">{entry.avatar}</span>
                            <span className="min-w-0 flex-1 truncate text-sm font-semibold">{entry.name}</span>
                            <span className="font-mono text-sm font-bold tabular-nums">{entry.score.toLocaleString("es-AR")}</span>
                          </li>
                        ))}
                      </ol>
                    )}

                    <div className="mt-5 flex items-center justify-between border-t border-white/10 pt-3 font-mono text-[10px] tracking-[0.18em] text-slate-500 uppercase">
                      <span>Pixel Rush</span>
                      <span>{new Date().toLocaleDateString("es-AR", { day: "2-digit", month: "2-digit", year: "numeric" })}</span>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Acciones */}
              <div className="mt-5 space-y-2.5">
                <PillButton size="lg" autoFocus onClick={onPlayAgain} disabled={playAgainDisabled} className="w-full">
                  {playAgainLabel}
                </PillButton>
                <PillButton variant="light" size="md" onClick={() => void share()} className="w-full">
                  Desafiar a un amigo
                </PillButton>
                {onExit && (
                  <button
                    type="button"
                    onClick={onExit}
                    className="block w-full cursor-pointer py-2 text-center font-mono text-xs tracking-wider text-white/70 uppercase underline-offset-4 hover:text-white hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                  >
                    Volver al lobby
                  </button>
                )}
              </div>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
