"use client";

import { useEffect, type PointerEvent } from "react";
import { AnimatePresence, motion, useMotionValue, useReducedMotion, useSpring, useTransform } from "framer-motion";
import { CountUp } from "@/components/ui/CountUp";
import { PillButton } from "@/components/ui/PillButton";
import type { RoundHistory } from "@/lib/game/hints";
import { copyText } from "@/lib/ui/clipboard";
import { cn } from "@/lib/ui/cn";
import { formatSeconds, victoryStats, victoryTitle, type VictoryTitle } from "@/lib/ui/victory";
import type { Toast } from "./LiveToast";

export type RankingEntry = { id: string; name: string; avatar: string; score: number; isYou: boolean };

export interface VictoryModalProps {
  open: boolean;
  player: { name: string; avatar: string };
  score: number;
  totalRounds: number;
  history: RoundHistory[];
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
const CONFETTI_COLORS = ["#10b981", "#06b6d4", "#9333ea", "#f59e0b", "#f3efe6"];

/* Color del marco del avatar según la rareza del título. */
const RARITY_FRAME: Record<VictoryTitle["rarity"], string> = {
  Legendaria: "border-arcade shadow-[0_0_24px_rgb(245_158_11/0.65)]",
  Épica: "border-cyan-400 shadow-[0_0_24px_rgb(34_211_238/0.6)]",
  Rara: "border-purple-400 shadow-[0_0_24px_rgb(192_132_252/0.6)]",
  Común: "border-slate-400 shadow-[0_0_18px_rgb(148_163_184/0.35)]",
};
const RARITY_CHIP: Record<VictoryTitle["rarity"], string> = {
  Legendaria: "bg-arcade text-black",
  Épica: "bg-cyan-400 text-black",
  Rara: "bg-purple-400 text-black",
  Común: "bg-slate-400 text-black",
};

/**
 * Insignia 8-bit: marco cuadrado con brillo neón y esquinas "mordidas" de a un píxel,
 * con el avatar del jugador adentro.
 */
function PixelBadge({ avatar, rarity }: { avatar: string; rarity: VictoryTitle["rarity"] }) {
  return (
    <div className="relative mx-auto h-24 w-24">
      <div className={cn("grid h-full w-full place-items-center border-4 bg-panel text-5xl", RARITY_FRAME[rarity])}>
        <span aria-hidden="true">{avatar}</span>
      </div>
      {/* Esquinas pixeladas */}
      {/* Cada esquina "muerde" el borde de 4px: da el escalón típico de los sprites 8-bit. */}
      {["top-0 left-0", "top-0 right-0", "bottom-0 left-0", "bottom-0 right-0"].map((corner) => (
        <span key={corner} aria-hidden="true" className={cn("absolute h-1 w-1 bg-crt", corner)} />
      ))}
    </div>
  );
}

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

/** Tarjeta-trofeo 8-bit de fin de partida: insignia, título, dos métricas y acciones para compartir. */
export function VictoryModal({
  open, player, score, totalRounds, history, edition, ranking,
  onPlayAgain, playAgainLabel = "Jugar de nuevo", playAgainDisabled = false, onExit, onNotify,
}: VictoryModalProps) {
  const reduceMotion = useReducedMotion();
  const stats = victoryStats(history, totalRounds);
  const title = victoryTitle(stats);
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
    const text = `${title.title} en Pixel Rush: ${score.toLocaleString("es-AR")} pts · ${stats.correct}/${stats.total} correctas`
      + `${stats.averageMs !== null ? ` · ${formatSeconds(stats.averageMs)} de media` : ""}. ¿Me superás? ${url}`;
    if (await copyText(text)) onNotify?.({ icon: "✓", text: "Desafío copiado: pegalo donde quieras", tone: "success" });
    else onNotify?.({ icon: "!", text: "No se pudo copiar el desafío", tone: "danger" });
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="backdrop"
          className="fixed inset-0 z-50 overflow-y-auto bg-crt/70 backdrop-blur-md"
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
                {/* Borde holográfico: verde → cian → violeta, en movimiento. */}
                <div className="bg-[linear-gradient(115deg,#34d399,#06b6d4,#9333ea,#06b6d4,#34d399)] bg-[length:300%_100%] p-[3px] shadow-[8px_8px_0px_0px_#000,0_0_50px_-6px_rgb(6_182_212/0.55)] motion-safe:animate-holo">
                  <div className="relative isolate overflow-hidden bg-crt px-5 pt-5 pb-4 text-center">
                    {/* Luz ambiente + brillo que cruza la tarjeta */}
                    <div aria-hidden="true" className="absolute -top-24 left-1/2 -z-10 h-64 w-64 -translate-x-1/2 rounded-full bg-cyan-500/20 blur-3xl" />
                    <div aria-hidden="true" className="absolute -bottom-28 -left-16 -z-10 h-56 w-56 rounded-full bg-purple-600/20 blur-3xl" />
                    <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[linear-gradient(115deg,transparent_35%,rgb(255_255_255/0.1)_48%,transparent_60%)] bg-[length:250%_100%] motion-safe:animate-sheen" />

                    <div className="flex justify-end">
                      <span className={cn("px-2 py-1 font-pixel text-[9px] tracking-widest uppercase", RARITY_CHIP[title.rarity])}>{title.rarity}</span>
                    </div>

                    <PixelBadge avatar={player.avatar} rarity={title.rarity} />
                    <p className="mt-4 truncate text-base font-bold text-cream">{player.name || "Jugador"}</p>
                    <p className="mt-0.5 font-pixel text-[10px] tracking-wider text-slate-500 uppercase">
                      {place ? `Puesto ${place} de ${ranking!.length}` : "Partida solo"}
                    </p>

                    <h2 id="victory-title" className="mt-4 font-pixel text-2xl leading-tight font-black text-amber-300 uppercase [text-shadow:0_0_18px_rgb(252_211_77/0.65)]">
                      {title.title}
                    </h2>
                    <p className="mx-auto mt-2 max-w-[16rem] text-xs leading-relaxed text-slate-300">{title.tagline}</p>

                    {/* Dos métricas protagonistas */}
                    <dl className="mt-6 grid grid-cols-2 divide-x-2 divide-dashed divide-edge border-y-2 border-dashed border-edge py-4">
                      <div className="px-2">
                        <dt className="font-pixel text-[10px] tracking-widest text-slate-500 uppercase">Puntaje</dt>
                        <dd className="mt-2 font-pixel text-3xl leading-none text-[#F59E0B] tabular-nums [text-shadow:0_0_16px_rgb(245_158_11/0.6)]">
                          <CountUp value={score} />
                        </dd>
                        <p className="mt-1.5 font-pixel text-[10px] tracking-widest text-arcade/70 uppercase">Pts</p>
                      </div>
                      <div className="px-2">
                        <dt className="font-pixel text-[10px] tracking-widest text-slate-500 uppercase">Precisión</dt>
                        <dd className="mt-2 font-pixel text-3xl leading-none text-[#10B981] tabular-nums [text-shadow:0_0_16px_rgb(16_185_129/0.6)]">
                          <CountUp value={stats.accuracy} suffix="%" />
                        </dd>
                        <p className="mt-1.5 font-pixel text-[10px] tracking-widest text-neon/70 uppercase">
                          {stats.correct}/{stats.total}
                        </p>
                      </div>
                    </dl>

                    {ranking && (
                      <ol className="mt-4 space-y-1 text-left" aria-label="Tabla final">
                        {ranking.map((entry, index) => (
                          <li key={entry.id} className={cn("flex items-center gap-2.5 px-2 py-1.5", entry.isYou && "bg-cyan-500/10")}>
                            <span className={cn("w-6 font-pixel text-[11px]", index === 0 ? "text-arcade" : "text-slate-500")} aria-label={`Puesto ${index + 1}`}>
                              {index + 1}º
                            </span>
                            <span className="text-base" aria-hidden="true">{entry.avatar}</span>
                            <span className="min-w-0 flex-1 truncate text-sm font-semibold text-cream">{entry.name}</span>
                            <span className="font-pixel text-xs text-slate-300 tabular-nums">{entry.score}</span>
                          </li>
                        ))}
                      </ol>
                    )}

                    {/* Metadatos en una sola línea */}
                    <p className="mt-4 truncate font-pixel text-[9px] tracking-widest text-slate-600 uppercase">
                      {edition} · {stats.category} · {new Date().toLocaleDateString("es-AR", { day: "2-digit", month: "2-digit", year: "numeric" })}
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* Acciones */}
              <div className="mt-5 space-y-2.5">
                <PillButton size="lg" autoFocus onClick={onPlayAgain} disabled={playAgainDisabled} className="w-full">
                  {playAgainLabel}
                </PillButton>
                <PillButton variant="accent" size="md" onClick={() => void share()} className="w-full">
                  Compartir / Desafiar
                </PillButton>
                {onExit && (
                  <button
                    type="button"
                    onClick={onExit}
                    className="block w-full cursor-pointer py-2 text-center font-pixel text-[11px] tracking-widest text-slate-400 uppercase underline-offset-4 hover:text-cream hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neon-bright"
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
