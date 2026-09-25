import { HINTS_PER_GAME, maskedHint, type RoundHistory } from "./hints";
import { ROUND_DURATION_MS, scoreForAnswer } from "./rules";
import type { GameAction, GameState, GameView } from "./types";

export class GameConflict extends Error {}

export const correctLabel = (content: { choices: { id: string; label: string }[]; correctChoiceId: string }) =>
  content.choices.find((choice) => choice.id === content.correctChoiceId)?.label ?? "";

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
  if (action.type === "hint") {
    if (state.hintRound === state.index) return; // idempotente
    if (round.result) throw new GameConflict("La ronda ya terminó.");
    if (state.hintRound !== undefined && state.hintRound !== null) throw new GameConflict("Ya usaste tu pista de esta partida.");
    state.hintRound = state.index;
    return;
  }
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

/** Rondas terminadas, para la tarjeta final. */
export function roundHistory(rounds: GameState["rounds"]): RoundHistory[] {
  return rounds.filter((entry) => entry.result).map((entry) => ({
    category: entry.content.category,
    elapsedMs: entry.result!.choiceId !== null && entry.startedAt !== null && entry.pausedAt !== null
      ? Math.min(entry.pausedAt - entry.startedAt, ROUND_DURATION_MS)
      : null,
    correct: entry.result!.choiceId !== null && entry.result!.choiceId === entry.content.correctChoiceId,
  }));
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
    roundResults: state.rounds.map((entry) => entry.result
      ? entry.result.choiceId !== null && entry.result.choiceId === entry.content.correctChoiceId
      : null),
    history: roundHistory(state.rounds),
    hintsLeft: state.hintRound === undefined || state.hintRound === null ? HINTS_PER_GAME : 0,
    serverNow: now,
    round: {
      imageUrl: round.content.imageUrl,
      category: round.content.category,
      startedAt: round.startedAt,
      deadline: round.startedAt === null ? null : round.startedAt + ROUND_DURATION_MS,
      elapsedMs: round.startedAt === null ? 0 : Math.max(0, Math.min((round.pausedAt ?? now) - round.startedAt, ROUND_DURATION_MS)),
      choices: round.pausedAt !== null || round.result ? round.content.choices : [],
      result: round.result ? { ...round.result, correctChoiceId: round.content.correctChoiceId } : null,
      hint: state.hintRound === state.index ? maskedHint(correctLabel(round.content)) : null,
    },
  };
}
