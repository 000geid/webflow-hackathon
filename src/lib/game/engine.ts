import { ROUND_DURATION_MS, scoreForAnswer } from "./rules";
import type { GameAction, GameState, GameView } from "./types";

export class GameConflict extends Error {}

export function expireRound(state: GameState, now: number): void {
  const round = state.rounds[state.index];
  if (round.startedAt !== null && round.pausedAt === null && !round.result && now >= round.startedAt + ROUND_DURATION_MS) {
    round.result = { choiceId: null, points: 0 };
  }
}

export function applyAction(state: GameState, action: GameAction, now: number): void {
  expireRound(state, now);
  if (action.type === "start" && action.roundIndex === state.index + 1 && state.rounds[state.index].result && action.roundIndex < state.rounds.length) {
    state.index = action.roundIndex;
  }
  if (action.roundIndex !== state.index) throw new GameConflict("La ronda no es la actual.");
  const round = state.rounds[state.index];

  if (action.type === "start") {
    if (round.startedAt === null) round.startedAt = now;
    return;
  }
  if (round.startedAt === null) throw new GameConflict("Primero hay que iniciar la ronda.");
  if (action.type === "expire") {
    if (!round.result) throw new GameConflict("La ronda todavía no terminó.");
    return;
  }
  if (action.type === "pause") {
    if (!round.result && round.pausedAt === null) round.pausedAt = now;
    return;
  }
  if (action.type !== "answer") throw new GameConflict("Acción desconocida.");
  if (round.result) {
    if (round.result.choiceId !== null && round.result.choiceId !== action.choiceId) throw new GameConflict("La respuesta ya fue registrada.");
    return;
  }
  if (round.pausedAt === null) throw new GameConflict("Primero hay que pausar la ronda.");
  if (!round.content.choices.some((choice) => choice.id === action.choiceId)) throw new GameConflict("La opción no pertenece a esta ronda.");
  round.result = {
    choiceId: action.choiceId,
    points: scoreForAnswer(round.pausedAt - round.startedAt, action.choiceId === round.content.correctChoiceId),
  };
}

export function gameView(id: string, state: GameState, now: number): GameView {
  const round = state.rounds[state.index];
  const status = round.result ? state.index === state.rounds.length - 1 ? "finished" : "answered" : round.pausedAt !== null ? "paused" : round.startedAt !== null ? "revealing" : "ready";
  return {
    gameId: id,
    mode: state.mode,
    status,
    roundIndex: state.index,
    totalRounds: state.rounds.length,
    score: state.rounds.reduce((sum, entry) => sum + (entry.result?.points ?? 0), 0),
    serverNow: now,
    round: {
      imageUrl: round.content.imageUrl,
      category: round.content.category,
      startedAt: round.startedAt,
      deadline: round.startedAt === null ? null : round.startedAt + ROUND_DURATION_MS,
      elapsedMs: round.startedAt === null ? 0 : Math.max(0, Math.min((round.pausedAt ?? now) - round.startedAt, ROUND_DURATION_MS)),
      choices: round.pausedAt !== null || round.result ? round.content.choices : [],
      result: round.result ? { ...round.result, correctChoiceId: round.content.correctChoiceId } : null,
    },
  };
}
