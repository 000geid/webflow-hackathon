"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { PillButton } from "@/components/ui/PillButton";
import { TopCapsule } from "@/components/ui/TopCapsule";
import type { RoomPlayerView, RoomView } from "@/lib/game/room";
import { copyText } from "@/lib/ui/clipboard";
import { cn } from "@/lib/ui/cn";

interface WaitingRoomProps {
  view: RoomView;
  busy: boolean;
  error: string | null;
  onToggleReady: (ready: boolean) => void;
  onForceStart: () => void;
  onLeave: () => void;
}

function ReadyPill({ ready }: { ready: boolean }) {
  return (
    <AnimatePresence mode="popLayout" initial={false}>
      <motion.span
        key={ready ? "ready" : "waiting"}
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.6, opacity: 0 }}
        transition={{ type: "spring", stiffness: 520, damping: 26 }}
        className={cn(
          "inline-flex items-center gap-1 rounded-full px-3 py-1 font-mono text-[11px] font-bold tracking-wider whitespace-nowrap uppercase",
          ready ? "border-2 border-emerald-700 bg-emerald-400 text-emerald-950" : "bg-slate-100 text-slate-500",
        )}
      >
        <span className={cn("h-1.5 w-1.5 rounded-full", ready ? "bg-emerald-950" : "animate-pulse bg-slate-400")} aria-hidden="true" />
        {ready ? "¡Listo!" : "Esperando..."}
      </motion.span>
    </AnimatePresence>
  );
}

function PlayerCard({ player }: { player: RoomPlayerView }) {
  return (
    <motion.li
      layout
      initial={{ opacity: 0, y: 10, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: "spring", stiffness: 380, damping: 30 }}
      className={cn(
        "relative flex flex-col items-center gap-2 rounded-3xl p-4 text-center transition-colors duration-300 sm:p-5",
        player.ready ? "bg-emerald-50 ring-2 ring-emerald-500" : "bg-white/80 ring-1 ring-slate-200",
      )}
    >
      {player.isHost && (
        <span className="absolute top-3 left-3 rounded-full bg-blue-600 px-2 py-0.5 font-mono text-[9px] font-semibold tracking-wider text-white uppercase">
          Anfitrión
        </span>
      )}
      <span className="relative grid h-16 w-16 place-items-center rounded-full bg-white text-4xl shadow-[0_1px_2px_rgb(2_6_23/0.08)] ring-1 ring-slate-200 sm:h-20 sm:w-20 sm:text-5xl" aria-hidden="true">
        {player.avatar}
        <span className={cn("absolute right-0.5 bottom-0.5 h-3.5 w-3.5 rounded-full border-2 border-white", player.online ? "bg-emerald-500" : "bg-slate-300")} />
      </span>
      <p className="w-full truncate text-base font-bold text-slate-950">
        {player.name}
        {player.isYou && <span className="ml-1 font-mono text-[10px] font-medium text-slate-400">VOS</span>}
      </p>
      <ReadyPill ready={player.ready} />
    </motion.li>
  );
}

/** Sala previa: cada jugador confirma que está listo; cuando están todos, arranca sola. */
export function WaitingRoom({ view, busy, error, onToggleReady, onForceStart, onLeave }: WaitingRoomProps) {
  const [copied, setCopied] = useState(false);
  const me = view.players.find((p) => p.isYou);
  const imReady = Boolean(me?.ready);
  const total = view.players.length;
  const missingPlayers = Math.max(0, view.minPlayers - total);
  const emptySlots = Math.max(0, view.maxPlayers - total);
  const canForce = view.isHost && missingPlayers === 0 && view.readyCount < total;

  async function copyLink() {
    const url = `${window.location.origin}${window.location.pathname}?room=${view.code}`;
    if (!(await copyText(url))) return;
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }

  const status =
    missingPlayers > 0
      ? `Falta${missingPlayers > 1 ? "n" : ""} ${missingPlayers} jugador${missingPlayers > 1 ? "es" : ""} para arrancar`
      : view.readyCount === total
        ? "¡Todos listos! Arrancando…"
        : "Arranca cuando estén todos listos";

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col px-4 py-5 sm:px-6 sm:py-8">
      <TopCapsule>
        <PillButton variant="light" size="sm" onClick={onLeave}>Salir</PillButton>
      </TopCapsule>

      <section className="flex flex-1 flex-col py-8 sm:py-10">
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full border-2 border-slate-950 bg-white px-3 py-1 font-mono text-[11px] font-semibold tracking-wider text-slate-950 uppercase">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-blue-600" aria-hidden="true" />
            Sala {view.code}
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full border-2 border-slate-950 bg-white px-3 py-1 font-mono text-[11px] font-semibold tracking-wider text-slate-950 uppercase">
            <span aria-hidden="true">{view.category.emoji}</span> {view.category.label}
          </span>
        </div>
        <h1 className="mt-4 text-4xl font-black tracking-tighter text-slate-950 sm:text-5xl">¿Listos para jugar?</h1>
        <p className="mt-2 text-slate-600">
          Tocá <strong className="text-slate-950">¡Estoy listo!</strong> cuando quieras arrancar. La partida empieza sola cuando están todos.
        </p>

        <ul className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4" aria-label="Jugadores en la sala">
          {view.players.map((player) => <PlayerCard key={player.id} player={player} />)}
          {Array.from({ length: emptySlots }, (_, i) => (
            <li
              key={`empty-${i}`}
              className="flex min-h-40 flex-col items-center justify-center gap-2 rounded-3xl border border-dashed border-slate-300 p-4 text-center font-mono text-xs text-slate-400"
            >
              <span className="grid h-12 w-12 place-items-center rounded-full bg-slate-100 text-xl" aria-hidden="true">+</span>
              Lugar libre
            </li>
          ))}
          {/* Última celda: código para invitar */}
          <li className="flex min-h-40 flex-col items-center justify-center gap-3 rounded-3xl bg-slate-950 p-4 text-center text-white">
            <span className="font-mono text-[10px] tracking-[0.2em] text-slate-400 uppercase">Invitá con el código</span>
            <span className="font-mono text-2xl font-bold tracking-[0.3em] sm:text-3xl" aria-label={`Código ${view.code.split("").join(" ")}`}>
              {view.code}
            </span>
            <PillButton variant="light" size="sm" onClick={() => void copyLink()}>
              {copied ? "¡Copiado!" : "Copiar link"}
            </PillButton>
          </li>
        </ul>

        {/* Barra de acción: queda pegada abajo en pantallas chicas */}
        <div className="sticky bottom-4 mt-8 rounded-[2rem] bg-white/85 p-3 shadow-[0_18px_40px_-16px_rgb(2_6_23/0.35)] ring-1 ring-slate-200 backdrop-blur-md sm:p-4">
          <div className="flex items-center justify-between gap-3 px-2 pb-3">
            <p className="text-sm font-semibold text-slate-700" aria-live="polite">{status}</p>
            <p className="font-mono text-xs font-bold text-slate-950 tabular-nums">
              {view.readyCount}/{total} listos
            </p>
          </div>
          <div className="mx-2 mb-3 h-1.5 overflow-hidden rounded-full bg-slate-200">
            <div className="h-full rounded-full bg-emerald-500 transition-[width] duration-300" style={{ width: `${total ? (view.readyCount / total) * 100 : 0}%` }} />
          </div>
          <PillButton
            size="lg"
            variant={imReady ? "light" : "primary"}
            className="w-full"
            onClick={() => onToggleReady(!imReady)}
            disabled={busy}
            aria-pressed={imReady}
          >
            {imReady ? "Listo · tocá para cancelar" : "¡Estoy listo!"}
          </PillButton>
          {canForce && (
            <button
              type="button"
              onClick={onForceStart}
              disabled={busy}
              className="mt-2 block w-full cursor-pointer py-1.5 text-center font-mono text-xs tracking-wider text-slate-500 uppercase underline-offset-4 hover:text-slate-950 hover:underline disabled:cursor-not-allowed"
            >
              Empezar sin esperar (anfitrión)
            </button>
          )}
          {error && <p className="mt-2 text-center text-sm font-semibold text-rose-600" role="alert">{error}</p>}
        </div>
      </section>
    </main>
  );
}
