"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { PillButton } from "@/components/ui/PillButton";
import { TopCapsule } from "@/components/ui/TopCapsule";
import type { RoomPlayerView, RoomView } from "@/lib/game/room";
import { copyText } from "@/lib/ui/clipboard";
import { cn } from "@/lib/ui/cn";
import { PlayerAvatar } from "@/components/ui/PlayerAvatar";

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
          "inline-flex items-center gap-1.5 border-2 px-2 py-1 font-pixel text-[10px] tracking-wider whitespace-nowrap uppercase",
          ready ? "border-black bg-neon text-crt shadow-[0_0_14px_rgb(16_185_129/0.5)]" : "border-edge bg-crt text-slate-400",
        )}
      >
        <span className={cn("h-1.5 w-1.5", ready ? "bg-crt" : "animate-pulse bg-slate-500")} aria-hidden="true" />
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
        "relative flex flex-col items-center gap-2 border-2 bg-panel p-4 text-center transition-[border-color,box-shadow] duration-300 sm:p-5",
        player.ready ? "border-neon shadow-[4px_4px_0px_0px_#000,0_0_24px_rgb(16_185_129/0.3)]" : "border-edge shadow-pixel",
      )}
    >
      {player.isHost && (
        <span className="absolute top-2 left-2 border border-black bg-cyan-400 px-1.5 py-0.5 font-pixel text-[8px] tracking-wider text-black uppercase">
          Anfitrión
        </span>
      )}
      <span className="relative block border-2 border-amber-400 shadow-[2px_2px_0px_#000]" aria-hidden="true">
        <PlayerAvatar avatar={player.avatar} className="h-16 w-16 text-4xl sm:h-20 sm:w-20 sm:text-5xl" />
        <span className={cn("absolute -right-1 -bottom-1 h-3 w-3 border-2 border-panel", player.online ? "bg-neon" : "bg-slate-600")} />
      </span>
      <p className="w-full truncate text-base font-bold text-slate-100">
        {player.name}
        {player.isYou && <span className="ml-1 font-pixel text-[9px] text-neon">VOS</span>}
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
        <PillButton variant="ghost" size="sm" onClick={onLeave}>Salir</PillButton>
      </TopCapsule>

      <section className="flex flex-1 flex-col py-8 sm:py-10">
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 border-2 border-edge bg-panel px-2 py-1 font-pixel text-[10px] tracking-wider text-slate-300 uppercase">
            <span className="h-1.5 w-1.5 animate-pulse bg-hot" aria-hidden="true" />
            Sala {view.code}
          </span>
          <span className="inline-flex items-center gap-1.5 border-2 border-edge bg-panel px-2 py-1 font-pixel text-[10px] tracking-wider text-slate-300 uppercase">
            <span aria-hidden="true">{view.category.emoji}</span> {view.category.label}
          </span>
        </div>
        <h1 className="mt-5 font-pixel text-3xl text-cream uppercase sm:text-4xl">¿Listos para jugar?</h1>
        <p className="mt-3 text-slate-400">
          Tocá <strong className="text-neon-bright">¡Estoy listo!</strong> cuando quieras arrancar. La partida empieza sola cuando están todos.
        </p>

        <ul className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4" aria-label="Jugadores en la sala">
          {view.players.map((player) => <PlayerCard key={player.id} player={player} />)}
          {Array.from({ length: emptySlots }, (_, i) => (
            <li
              key={`empty-${i}`}
              className="flex min-h-40 flex-col items-center justify-center gap-2 border-2 border-dashed border-edge p-4 text-center font-pixel text-[10px] tracking-wider text-slate-600 uppercase"
            >
              <span className="grid h-12 w-12 place-items-center border-2 border-edge font-pixel text-xl text-slate-600" aria-hidden="true">+</span>
              Lugar libre
            </li>
          ))}
          {/* Última celda: código para invitar */}
          <li className="flex min-h-40 flex-col items-center justify-center gap-3 border-2 border-arcade bg-crt p-4 text-center shadow-pixel">
            <span className="font-pixel text-[9px] tracking-widest text-slate-400 uppercase">Invitá con el código</span>
            <span className="font-pixel text-2xl tracking-[0.25em] text-arcade [text-shadow:0_0_14px_rgb(245_158_11/0.55)] sm:text-3xl" aria-label={`Código ${view.code.split("").join(" ")}`}>
              {view.code}
            </span>
            <PillButton variant="ghost" size="sm" onClick={() => void copyLink()}>
              {copied ? "¡Copiado!" : "Copiar link"}
            </PillButton>
          </li>
        </ul>

        {/* Barra de acción: queda pegada abajo en pantallas chicas */}
        <div className="sticky bottom-4 mt-8 border-2 border-edge bg-panel/95 p-3 shadow-[6px_6px_0px_0px_#000] backdrop-blur-sm sm:p-4">
          <div className="flex items-center justify-between gap-3 px-2 pb-3">
            <p className="text-sm font-semibold text-slate-300" aria-live="polite">{status}</p>
            <p className="font-pixel text-xs text-emerald-400 tabular-nums">
              {view.readyCount}/{total} listos
            </p>
          </div>
          <div className="mx-2 mb-3 h-2 overflow-hidden border border-black bg-edge">
            <div className="h-full bg-neon transition-[width] duration-300" style={{ width: `${total ? (view.readyCount / total) * 100 : 0}%` }} />
          </div>
          <PillButton
            size="lg"
            variant={imReady ? "ghost" : "primary"}
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
              className="mt-2 block w-full cursor-pointer py-1.5 text-center font-pixel text-[10px] tracking-wider text-slate-500 uppercase underline-offset-4 hover:text-slate-200 hover:underline disabled:cursor-not-allowed"
            >
              Empezar sin esperar (anfitrión)
            </button>
          )}
          {error && <p className="mt-2 text-center text-sm font-semibold text-hot" role="alert">{error}</p>}
        </div>
      </section>
    </main>
  );
}
