"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { VictoryModal } from "@/components/game/VictoryModal";
import { GameStage } from "@/components/game/GameStage";
import type { Toast } from "@/components/game/LiveToast";
import { PlayersPanel } from "@/components/game/PlayersPanel";
import { RoundFeed } from "@/components/game/RoundFeed";
import { PillButton } from "@/components/ui/PillButton";
import type { RoomAction, RoomView } from "@/lib/game/room";
import { ROUND_DURATION_MS } from "@/lib/game/rules";
import type { GameSummary } from "@/lib/ui/achievements";
import { eventToast, RequestError, roomRequest } from "./room-api";
import { RoundOverlay } from "./RoundOverlay";
import { WaitingRoom } from "./WaitingRoom";

/** Cada cuánto se consulta la sala. ~1 s alcanza para que los avisos se sientan en vivo. */
const POLL_MS = 900;
/** Refresco local del reloj: el zoom y el timer se mueven suave entre consultas. */
const TICK_MS = 100;
const DURATION_S = ROUND_DURATION_MS / 1000;

interface RoomClientProps {
  code: string;
  token: string;
  onExit: (message?: string) => void;
  notify: (toast: Omit<Toast, "id">) => void;
  onFinished: (summary: GameSummary) => void;
}

function summaryOf(view: RoomView): GameSummary {
  return {
    mode: "room",
    results: view.roundResults.map((result) => result === true),
    score: view.score,
    hosted: view.isHost,
    placement: 1 + view.players.filter((p) => p.score > view.score).length,
    playerCount: view.players.length,
  };
}

const isLost = (cause: unknown) => cause instanceof RequestError && (cause.status === 401 || cause.status === 404);

export function RoomClient({ code, token, onExit, notify, onFinished }: RoomClientProps) {
  const [view, setView] = useState<RoomView | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [clock, setClock] = useState(0);
  const [offset, setOffset] = useState(0);
  const lastSeq = useRef<number | null>(null);
  const lastStatus = useRef<RoomView["status"] | null>(null);
  const lastServerNow = useRef(0);

  const accept = useCallback((next: RoomView) => {
    // Un poll lento puede llegar después de la respuesta a una acción: se descarta.
    if (next.serverNow < lastServerNow.current) return;
    lastServerNow.current = next.serverNow;
    setView(next);
    setError(null);
    setOffset(next.serverNow - Date.now());

    // Avisos: solo eventos nuevos de otros jugadores. En la primera carga no se muestra el historial.
    if (lastSeq.current !== null) {
      for (const event of next.events) {
        if (event.seq > lastSeq.current && event.playerId !== next.youId) notify(eventToast(event));
      }
    }
    lastSeq.current = Math.max(lastSeq.current ?? 0, next.events.at(-1)?.seq ?? 0);

    // Logros: solo si vimos terminar la partida (recargar la pantalla final no cuenta de nuevo).
    if (lastStatus.current !== null && lastStatus.current !== "finished" && next.status === "finished") onFinished(summaryOf(next));
    lastStatus.current = next.status;
  }, [notify, onFinished]);

  useEffect(() => {
    let cancelled = false;
    let timer: number | undefined;
    async function poll() {
      try {
        const next = await roomRequest(`/api/rooms/${code}`, { token });
        if (!cancelled) accept(next);
      } catch (cause) {
        if (cancelled) return;
        if (isLost(cause)) return onExit((cause as Error).message);
        setError(cause instanceof Error ? cause.message : "No se pudo actualizar la sala.");
      }
      if (!cancelled) timer = window.setTimeout(poll, POLL_MS);
    }
    void poll();
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [accept, code, onExit, token]);

  useEffect(() => {
    const timer = window.setInterval(() => setClock(Date.now()), TICK_MS);
    return () => window.clearInterval(timer);
  }, []);

  const act = useCallback(async (action: RoomAction | { type: "rematch" }) => {
    setBusy(true);
    try {
      const next = await roomRequest<RoomView | { left: true }>(`/api/rooms/${code}/actions`, { token, body: action });
      if (!("left" in next)) accept(next);
    } catch (cause) {
      if (isLost(cause)) return onExit((cause as Error).message);
      setError(cause instanceof Error ? cause.message : "No se pudo actualizar la sala.");
    } finally {
      setBusy(false);
    }
  }, [accept, code, onExit, token]);

  const leave = useCallback(async () => {
    try { await roomRequest(`/api/rooms/${code}/actions`, { token, body: { type: "leave" } }); }
    catch { /* Salir igual: el jugador queda como desconectado. */ }
    onExit();
  }, [code, onExit, token]);

  if (!view) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-4 px-4 text-center">
        <p className="flex items-center gap-2 border-2 border-edge bg-panel px-4 py-2.5 font-pixel text-xs tracking-wider text-slate-300 uppercase shadow-pixel" aria-live="polite">
          <span className="h-2 w-2 animate-pulse bg-neon" aria-hidden="true" />
          {error ?? `Conectando a la sala ${code}…`}
        </p>
        <PillButton variant="ghost" size="sm" onClick={() => onExit()}>Volver al lobby</PillButton>
      </main>
    );
  }

  if (view.status === "lobby" || !view.round) {
    return (
      <WaitingRoom
        view={view}
        busy={busy}
        error={error}
        onToggleReady={(ready) => void act({ type: "ready", ready })}
        onForceStart={() => void act({ type: "start" })}
        onLeave={() => void leave()}
      />
    );
  }

  const round = view.round;
  const now = clock === 0 ? view.serverNow : clock + offset;
  // El reloj local mantiene suave la revelación entre consultas al servidor.
  const phase = round.phase === "countdown" && now >= round.startsAt ? "revealing" : round.phase;
  const timeLeft =
    phase === "countdown" ? DURATION_S
      : phase === "revealing" ? Math.min(DURATION_S, Math.max(0, (round.deadline - now) / 1000))
        : round.remainingMs / 1000;
  const secondsUntil = (at: number) => Math.max(0, Math.ceil((at - now) / 1000));
  const me = view.players.find((p) => p.isYou);

  const overlay =
    phase === "countdown" ? <RoundOverlay kind="countdown" seconds={Math.max(1, secondsUntil(round.startsAt))} />
      : phase === "guessing" ? <RoundOverlay kind="chip" text={round.isYourTurn
        ? `Ganaste el turno · respondé en ${secondsUntil(round.answerDeadline)}s`
        : `${round.guesser?.name ?? "Alguien"} ganó el turno · ${secondsUntil(round.answerDeadline)}s`} />
        : phase === "revealing" && round.hasAttempted ? <RoundOverlay kind="chip" text="Ya intentaste esta ronda · esperando al resto" />
          : phase === "result" && round.nextStartsAt !== null && view.status === "playing"
            ? <RoundOverlay kind="chip" text={`${round.winnerId
              ? `${view.players.find((p) => p.id === round.winnerId)?.name ?? "Alguien"} acertó`
              : "Nadie acertó"} · siguiente ronda en ${secondsUntil(round.nextStartsAt)}s`} />
            : <RoundOverlay kind="none" />;

  return (
    <>
      <GameStage
        imageUrl={round.imageUrl}
        category={round.category}
        timeLeft={timeLeft}
        duration={DURATION_S}
        score={view.score}
        roundIndex={round.index}
        totalRounds={view.totalRounds}
        results={view.roundResults.filter((result): result is boolean => result !== null)}
        isPaused={round.isYourTurn}
        isLocked={busy || view.status !== "playing" || round.hasAttempted || (phase !== "revealing" && !round.isYourTurn)}
        canResume={false}
        choices={round.choices}
        selectedChoiceId={round.result?.choiceId ?? null}
        correctChoiceId={round.result?.correctChoiceId ?? null}
        onGuess={() => void act({ type: "pause", roundIndex: round.index })}
        onSelectChoice={(choiceId) => void act({ type: "answer", roundIndex: round.index, choiceId })}
        onExit={() => void leave()}
        earnedPoints={round.result?.points ?? null}
        hint={round.hint}
        hintsLeft={view.hintsLeft}
        onFetchAIHint={async () => {
          await act({ type: "hint", roundIndex: round.index });
          notify({ icon: "?", text: "Pista desbloqueada: la tenés debajo de la imagen", tone: "info" });
        }}
        players={<PlayersPanel players={view.players} maxPlayers={view.maxPlayers} />}
        feed={<RoundFeed events={view.events} youId={view.youId} />}
        overlay={overlay}
      />

      {error && (
        <p role="alert" className="fixed bottom-24 left-1/2 z-40 -translate-x-1/2 border-2 border-black bg-hot px-4 py-2 text-sm font-bold whitespace-nowrap text-black shadow-pixel">
          {error}
        </p>
      )}

      <VictoryModal
        open={view.status === "finished"}
        player={me ?? { name: "", avatar: "🦊" }}
        score={view.score}
        totalRounds={view.totalRounds}
        history={view.history}
        edition={`Sala ${view.code}`}
        ranking={view.players.map((p) => ({ id: p.id, name: p.name, avatar: p.avatar, score: p.score, isYou: p.isYou }))}
        playAgainLabel={view.isHost ? "Revancha" : "Esperando revancha…"}
        playAgainDisabled={!view.isHost || busy}
        onPlayAgain={() => void act({ type: "rematch" })}
        onExit={() => void leave()}
        onNotify={notify}
      />
    </>
  );
}
