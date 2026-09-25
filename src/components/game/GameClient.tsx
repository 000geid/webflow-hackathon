"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { GameStage } from "@/components/game/GameStage";
import { ROUND_DURATION_MS } from "@/lib/game/rules";
import type { GameView } from "@/lib/game/types";
import type { CategoryChoice } from "@/lib/game/categories";
import { HINTS_PER_GAME } from "@/lib/game/hints";
import type { GameSummary } from "@/lib/ui/achievements";
import type { Toast } from "./LiveToast";
import { VictoryModal } from "./VictoryModal";

const SESSION_KEY = "pixel-rush-game-v2";
type Session = { gameId: string; token: string };
type StoredGame = GameView & { token: string };

async function gameRequest(path: string, token?: string, body?: unknown): Promise<GameView | StoredGame> {
  const response = await fetch(path, {
    method: body === undefined ? "GET" : "POST",
    headers: {
      ...(body === undefined ? {} : { "Content-Type": "application/json" }),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
    cache: "no-store",
  });
  const result = await response.json();
  if (!response.ok) {
    const message = result?.error?.message;
    const error = new Error(typeof message === "string" ? message : "No se pudo cargar la partida.");
    Object.assign(error, { status: response.status });
    throw error;
  }
  return result as GameView | StoredGame;
}

function readSession(): Session | null {
  try {
    const value = sessionStorage.getItem(SESSION_KEY);
    if (!value) return null;
    const session = JSON.parse(value) as Partial<Session>;
    return typeof session.gameId === "string" && typeof session.token === "string"
      ? { gameId: session.gameId, token: session.token }
      : null;
  } catch {
    return null;
  }
}

interface GameClientProps {
  onExit?: () => void;
  onFinished?: (summary: GameSummary) => void;
  notify?: (toast: Omit<Toast, "id">) => void;
  player?: { name: string; avatar: string };
  category?: CategoryChoice;
}

export function GameClient({ onExit, onFinished, notify, player = { name: "", avatar: "🦊" }, category = "mix" }: GameClientProps = {}) {
  const [view, setView] = useState<GameView | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [clock, setClock] = useState(Date.now());
  const [serverOffset, setServerOffset] = useState(0);
  const expiringRound = useRef<string | null>(null);
  const initialized = useRef(false);
  const reportedGame = useRef<string | null>(null);

  const acceptView = useCallback((next: GameView) => {
    setView(next);
    setServerOffset(next.serverNow - Date.now());
  }, []);

  const createAndStart = useCallback(async () => {
    setBusy(true);
    setError(null);
    try {
      const created = await gameRequest("/api/games", undefined, { category });
      const game = created as StoredGame;
      const session = { gameId: game.gameId, token: game.token };
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
      setToken(session.token);
      const started = await gameRequest(`/api/games/${game.gameId}/actions`, session.token, {
        type: "start",
        roundIndex: game.roundIndex,
      });
      acceptView(started as GameView);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "No se pudo iniciar la partida.");
    } finally {
      setBusy(false);
    }
  }, [acceptView, category]);

  const refresh = useCallback(async (session: Session) => {
    const next = await gameRequest(`/api/games/${session.gameId}`, session.token);
    acceptView(next as GameView);
  }, [acceptView]);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;
    const saved = readSession();
    if (!saved) {
      void createAndStart();
      return;
    }
    setToken(saved.token);
    setBusy(true);
    void gameRequest(`/api/games/${saved.gameId}`, saved.token)
      .then(async (restored) => {
        let current = restored as GameView;
        if (current.status === "ready") {
          current = await gameRequest(`/api/games/${saved.gameId}/actions`, saved.token, {
            type: "start",
            roundIndex: current.roundIndex,
          }) as GameView;
        }
        acceptView(current);
      })
      .catch((cause: unknown) => {
        const status = (cause as { status?: number })?.status;
        if (status === 401 || status === 404) {
          sessionStorage.removeItem(SESSION_KEY);
          void createAndStart();
          return;
        }
        setError(cause instanceof Error ? cause.message : "No se pudo recuperar la partida.");
      })
      .finally(() => setBusy(false));
  }, [acceptView, createAndStart]);

  useEffect(() => {
    const timer = window.setInterval(() => setClock(Date.now()), 250);
    return () => window.clearInterval(timer);
  }, []);

  const liveTimeLeft = !view || view.round.deadline === null
    ? 15
    : Math.max(0, (view.round.deadline - (clock + serverOffset)) / 1000);
  const timeLeft = view?.status === "revealing"
    ? liveTimeLeft
    : view ? Math.max(0, (ROUND_DURATION_MS - view.round.elapsedMs) / 1000) : 15;

  useEffect(() => {
    if (!view || !token || view.status !== "revealing" || timeLeft > 0) return;
    const key = `${view.gameId}:${view.roundIndex}`;
    if (expiringRound.current === key) return;
    expiringRound.current = key;
    void refresh({ gameId: view.gameId, token }).catch((cause: unknown) => {
      setError(cause instanceof Error ? cause.message : "No se pudo actualizar la ronda.");
    });
  }, [refresh, timeLeft, token, view]);

  const sendAction = useCallback(async (action: { type: "pause" | "answer" | "start" | "hint"; roundIndex: number; choiceId?: string }) => {
    if (!view || !token || busy) return;
    setBusy(true);
    setError(null);
    try {
      const next = await gameRequest(`/api/games/${view.gameId}/actions`, token, action);
      acceptView(next as GameView);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "No se pudo actualizar la partida.");
      try { await refresh({ gameId: view.gameId, token }); } catch { /* Keep the original action error visible. */ }
    } finally {
      setBusy(false);
    }
  }, [acceptView, busy, refresh, token, view]);

  useEffect(() => {
    if (!view || view.status !== "answered" || busy) return;
    const timer = window.setTimeout(() => {
      void sendAction({ type: "start", roundIndex: view.roundIndex + 1 });
    }, 1800);
    return () => window.clearTimeout(timer);
  }, [busy, sendAction, view]);

  useEffect(() => {
    if (!view || view.status !== "finished" || reportedGame.current === view.gameId) return;
    reportedGame.current = view.gameId;
    onFinished?.({
      mode: "solo",
      results: view.roundResults.map((result) => result === true),
      score: view.score,
      hosted: false,
      placement: null,
      playerCount: 1,
    });
  }, [onFinished, view]);

  if (!view) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-4 px-4 text-center">
        <p aria-live="polite">{error ?? (busy ? "Cargando memes…" : "Preparando partida…")}</p>
        {error && <button className="border-2 border-black bg-neon px-5 py-3 font-pixel text-sm text-crt uppercase shadow-pixel" onClick={() => void createAndStart()}>Reintentar</button>}
      </main>
    );
  }

  const selectedChoiceId = view.round.result?.choiceId ?? null;
  const correctChoiceId = view.round.result?.correctChoiceId ?? null;

  return (
    <>
      <GameStage
        imageUrl={view.round.imageUrl}
        category={view.round.category}
        timeLeft={timeLeft}
        duration={ROUND_DURATION_MS / 1000}
        score={view.score}
        roundIndex={view.roundIndex}
        totalRounds={view.totalRounds}
        isPaused={view.status === "paused"}
        isLocked={busy || view.status === "answered" || view.status === "finished"}
        canResume={false}
        choices={view.round.choices}
        selectedChoiceId={selectedChoiceId}
        correctChoiceId={correctChoiceId}
        onGuess={() => void sendAction({ type: "pause", roundIndex: view.roundIndex })}
        onSelectChoice={(choiceId) => void sendAction({ type: "answer", roundIndex: view.roundIndex, choiceId })}
        onExit={onExit}
        earnedPoints={view.round.result?.points ?? null}
        hint={view.round.hint}
        hintsLeft={view.hintsLeft}
        onFetchAIHint={async () => {
          await sendAction({ type: "hint", roundIndex: view.roundIndex });
          notify?.({ icon: "?", text: "Pista desbloqueada: la tenés debajo de la imagen", tone: "info" });
        }}
      />
      {(error || busy) && (
        <p className={`mx-auto -mt-8 mb-6 w-full max-w-2xl px-4 text-center text-sm font-semibold ${error ? "text-hot" : "text-slate-500"}`} aria-live="polite">
          {error ?? "Actualizando…"}
        </p>
      )}
      <VictoryModal
        open={view.status === "finished"}
        player={player}
        score={view.score}
        maxScore={view.totalRounds * 1000}
        totalRounds={view.totalRounds}
        history={view.history}
        hintsUsed={HINTS_PER_GAME - view.hintsLeft}
        edition="Solo"
        onPlayAgain={() => void createAndStart()}
        onExit={onExit}
        onNotify={notify}
      />
    </>
  );
}
