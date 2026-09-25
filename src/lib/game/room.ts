import { categoryInfo, type CategoryChoice } from "./categories";
import { correctLabel, GameConflict } from "./engine";
import { HINTS_PER_GAME, maskedHint, type RoundHistory } from "./hints";
import { ROUND_DURATION_MS, scoreForAnswer } from "./rules";
import type { Choice, GameState, RoundContent } from "./types";

/*
 * Salas multijugador. Todos juegan las mismas rondas al mismo tiempo:
 *
 *   startsAt ──15s revelando──▶ + 8s para responder ──▶ endedAt ──4s resultados──▶ siguiente ronda
 *
 * Cada jugador frena y responde por su cuenta, con el mismo puntaje que el modo
 * solo (scoreForAnswer). La ronda termina antes si todos ya respondieron.
 * El tiempo avanza "perezosamente": syncRoom() se llama en cada request y
 * pone al día la sala según `now`, igual que expireRound() en partidas solo.
 */

export const MIN_PLAYERS = 2;
export const MAX_PLAYERS = 5;
export const COUNTDOWN_MS = 3_000;
export const ANSWER_WINDOW_MS = 8_000;
export const REVEAL_MS = 4_000;
/** Sin consultas en este lapso, el jugador figura desconectado. */
export const ONLINE_WINDOW_MS = 10_000;
/** Cada cuánto se persiste la presencia: evita escribir en la base en cada poll. */
export const PRESENCE_WRITE_MS = 4_000;
const EVENTS_KEPT = 30;
const EVENTS_SENT = 20;

type PlayerResult = {
  choiceId: string | null;
  points: number;
  correct: boolean;
  at: number;
  /** Ms desde el inicio de la ronda hasta frenar; null si no respondió. */
  elapsedMs?: number | null;
};
export type PlayerRound = { pausedAt: number | null; result: PlayerResult | null };

export type RoomPlayer = {
  id: string;
  name: string;
  avatar: string;
  tokenHash: string;
  joinedAt: number;
  lastSeen: number;
  rounds: PlayerRound[];
  /** Ronda en la que usó su pista (una por partida). */
  hintRound?: number | null;
  /** Listo para arrancar (solo en el lobby). */
  ready?: boolean;
};
export type NewPlayer = Pick<RoomPlayer, "id" | "name" | "avatar" | "tokenHash">;

export type RoomEventKind = "joined" | "left" | "ready" | "started" | "guessing" | "hint" | "correct" | "wrong" | "rematch";
export type RoomEvent = {
  seq: number;
  at: number;
  kind: RoomEventKind;
  playerId: string;
  name: string;
  avatar: string;
  points?: number;
};

export type RoomState = {
  mode: GameState["mode"];
  /** Categoría elegida al crear la sala; la revancha usa la misma. Opcional en salas viejas. */
  category?: CategoryChoice;
  hostId: string;
  status: "lobby" | "playing" | "finished";
  content: RoundContent[];
  players: RoomPlayer[];
  round: { index: number; startsAt: number; endedAt: number | null } | null;
  events: RoomEvent[];
  seq: number;
};

export type RoomAction =
  | { type: "start" }
  | { type: "leave" }
  | { type: "ready"; ready: boolean }
  | { type: "pause"; roundIndex: number }
  | { type: "hint"; roundIndex: number }
  | { type: "answer"; roundIndex: number; choiceId: string };

/* ---------- Vista que recibe cada jugador ---------- */

export type PlayerStatus = "waiting" | "revealing" | "guessing" | "correct" | "wrong" | "timeout";

export type RoomPlayerView = {
  id: string;
  name: string;
  avatar: string;
  score: number;
  streak: number;
  status: PlayerStatus;
  online: boolean;
  isHost: boolean;
  isYou: boolean;
  ready: boolean;
};

export type RoomRoundView = {
  index: number;
  /** Desde tu punto de vista: countdown → revealing → paused → answered → ended. */
  status: "countdown" | "revealing" | "paused" | "answered" | "ended";
  imageUrl: string;
  category: string;
  startsAt: number;
  deadline: number;
  answerDeadline: number;
  nextStartsAt: number | null;
  elapsedMs: number;
  choices: Choice[];
  result: { choiceId: string | null; points: number; correctChoiceId: string } | null;
  hint: string | null;
};

export type RoomView = {
  code: string;
  status: RoomState["status"];
  category: { id: CategoryChoice; label: string; emoji: string };
  readyCount: number;
  youId: string;
  hostId: string;
  isHost: boolean;
  minPlayers: number;
  maxPlayers: number;
  totalRounds: number;
  serverNow: number;
  score: number;
  roundResults: (boolean | null)[];
  history: RoundHistory[];
  hintsLeft: number;
  players: RoomPlayerView[];
  round: RoomRoundView | null;
  events: RoomEvent[];
};

/* ---------- Estado ---------- */

const emptyRounds = (count: number): PlayerRound[] =>
  Array.from({ length: count }, () => ({ pausedAt: null, result: null }));

function uniqueName(state: RoomState, name: string): string {
  const taken = new Set(state.players.map((p) => p.name.toLowerCase()));
  if (!taken.has(name.toLowerCase())) return name;
  for (let n = 2; ; n++) if (!taken.has(`${name} ${n}`.toLowerCase())) return `${name} ${n}`;
}

function pushEvent(state: RoomState, player: RoomPlayer, kind: RoomEventKind, at: number, points?: number) {
  state.seq += 1;
  state.events.push({ seq: state.seq, at, kind, playerId: player.id, name: player.name, avatar: player.avatar, ...(points === undefined ? {} : { points }) });
  if (state.events.length > EVENTS_KEPT) state.events.splice(0, state.events.length - EVENTS_KEPT);
}

function findPlayer(state: RoomState, playerId: string): RoomPlayer {
  const player = state.players.find((p) => p.id === playerId);
  if (!player) throw new GameConflict("No estás en esta sala.");
  return player;
}

export function createRoomState(mode: RoomState["mode"], content: RoundContent[], host: NewPlayer, now: number, category: CategoryChoice = "mix"): RoomState {
  return {
    mode,
    category,
    hostId: host.id,
    status: "lobby",
    content,
    players: [{ ...host, joinedAt: now, lastSeen: now, rounds: emptyRounds(content.length) }],
    round: null,
    events: [],
    seq: 0,
  };
}

/** Suma un jugador. Devuelve el nombre final (puede llevar sufijo si estaba repetido). */
export function addPlayer(state: RoomState, player: NewPlayer, now: number): string {
  if (state.status !== "lobby") throw new GameConflict("La partida ya empezó.");
  if (state.players.length >= MAX_PLAYERS) throw new GameConflict(`La sala está llena (${MAX_PLAYERS} de ${MAX_PLAYERS}).`);
  const joined: RoomPlayer = { ...player, name: uniqueName(state, player.name), joinedAt: now, lastSeen: now, rounds: emptyRounds(state.content.length) };
  state.players.push(joined);
  pushEvent(state, joined, "joined", now);
  return joined.name;
}

/** Pone la sala al día: vence rondas, cierra la actual y arranca la siguiente. */
export function syncRoom(state: RoomState, now: number): void {
  while (state.status === "playing" && state.round) {
    const round = state.round;
    const revealEnds = round.startsAt + ROUND_DURATION_MS;
    const hardDeadline = revealEnds + ANSWER_WINDOW_MS;

    if (round.endedAt === null) {
      for (const player of state.players) {
        const entry = player.rounds[round.index];
        if (entry.result) continue;
        // Nunca frenó: pierde al terminar la revelación. Frenó pero no respondió: al cerrar la ventana.
        if (entry.pausedAt === null && now >= revealEnds) {
          entry.result = { choiceId: null, points: 0, correct: false, at: revealEnds };
        } else if (now >= hardDeadline) {
          entry.result = { choiceId: null, points: 0, correct: false, at: hardDeadline };
        }
      }
      const results = state.players.map((p) => p.rounds[round.index].result);
      if (results.some((result) => result === null)) break;
      round.endedAt = Math.max(round.startsAt, ...results.map((result) => result!.at));
    }

    const nextStartsAt = round.endedAt + REVEAL_MS;
    if (now < nextStartsAt) break;
    if (round.index >= state.content.length - 1) {
      state.status = "finished";
      break;
    }
    state.round = { index: round.index + 1, startsAt: nextStartsAt, endedAt: null };
  }
}

function currentRound(state: RoomState, roundIndex: number) {
  const round = state.round;
  if (state.status !== "playing" || !round || round.index !== roundIndex) throw new GameConflict("La ronda no es la actual.");
  return round;
}

function startGame(state: RoomState, by: RoomPlayer, now: number) {
  state.status = "playing";
  state.round = { index: 0, startsAt: now + COUNTDOWN_MS, endedAt: null };
  for (const p of state.players) {
    p.rounds = emptyRounds(state.content.length);
    p.hintRound = null;
    p.ready = false;
  }
  pushEvent(state, by, "started", now);
}

/** Arranca solo cuando hay al menos MIN_PLAYERS y todos confirmaron. */
function startIfEveryoneReady(state: RoomState, by: RoomPlayer, now: number) {
  if (state.status === "lobby" && state.players.length >= MIN_PLAYERS && state.players.every((p) => p.ready)) startGame(state, by, now);
}

export function applyRoomAction(state: RoomState, playerId: string, action: RoomAction, now: number): void {
  syncRoom(state, now);
  const player = findPlayer(state, playerId);

  if (action.type === "leave") {
    // Durante la partida el jugador queda como desconectado; solo se lo quita en el lobby.
    if (state.status !== "lobby") return;
    state.players = state.players.filter((p) => p.id !== playerId);
    if (state.hostId === playerId && state.players.length > 0) state.hostId = state.players[0].id;
    pushEvent(state, player, "left", now);
    // Si el que faltaba confirmar se fue, puede que ya estén todos listos.
    if (state.players.length > 0) startIfEveryoneReady(state, state.players[0], now);
    return;
  }

  if (action.type === "ready") {
    if (state.status !== "lobby") return; // la partida ya arrancó: no hay nada que confirmar
    if (Boolean(player.ready) === action.ready) return;
    player.ready = action.ready;
    if (action.ready) pushEvent(state, player, "ready", now);
    startIfEveryoneReady(state, player, now);
    return;
  }

  if (action.type === "start") {
    // El anfitrión puede forzar el inicio aunque falte alguien por confirmar.
    if (playerId !== state.hostId) throw new GameConflict("Solo el anfitrión puede empezar.");
    if (state.status === "playing") return;
    if (state.status !== "lobby") throw new GameConflict("La partida ya terminó.");
    if (state.players.length < MIN_PLAYERS) throw new GameConflict(`Se necesitan al menos ${MIN_PLAYERS} jugadores.`);
    startGame(state, player, now);
    return;
  }

  const round = currentRound(state, action.roundIndex);
  const entry = player.rounds[round.index];

  if (action.type === "hint") {
    if (player.hintRound === round.index) return; // idempotente
    if (now < round.startsAt) throw new GameConflict("La ronda todavía no empezó.");
    if (entry.result) throw new GameConflict("La ronda ya terminó para vos.");
    if (player.hintRound !== undefined && player.hintRound !== null) throw new GameConflict("Ya usaste tu pista de esta partida.");
    player.hintRound = round.index;
    pushEvent(state, player, "hint", now);
    return;
  }

  if (action.type === "pause") {
    if (now < round.startsAt) throw new GameConflict("La ronda todavía no empezó.");
    if (entry.result || entry.pausedAt !== null) return;
    entry.pausedAt = now;
    pushEvent(state, player, "guessing", now);
    return;
  }

  if (entry.result) {
    if (entry.result.choiceId !== null && entry.result.choiceId === action.choiceId) return;
    throw new GameConflict(entry.result.choiceId === null ? "Se terminó el tiempo de esta ronda." : "La respuesta ya fue registrada.");
  }
  if (entry.pausedAt === null) throw new GameConflict("Primero hay que frenar la ronda.");
  const content = state.content[round.index];
  if (!content.choices.some((choice) => choice.id === action.choiceId)) throw new GameConflict("La opción no pertenece a esta ronda.");
  const correct = action.choiceId === content.correctChoiceId;
  const points = scoreForAnswer(entry.pausedAt - round.startsAt, correct);
  entry.result = { choiceId: action.choiceId, points, correct, at: now, elapsedMs: entry.pausedAt - round.startsAt };
  pushEvent(state, player, correct ? "correct" : "wrong", now, points);
  // Si era el último en responder, la ronda se cierra ya.
  syncRoom(state, now);
}

/** Revancha: la sala vuelve al lobby con los mismos jugadores y rondas nuevas. */
export function restartRoom(state: RoomState, playerId: string, content: RoundContent[], now: number): void {
  syncRoom(state, now);
  const player = findPlayer(state, playerId);
  if (playerId !== state.hostId) throw new GameConflict("Solo el anfitrión puede pedir revancha.");
  if (state.status !== "finished") throw new GameConflict("La partida todavía no terminó.");
  state.status = "lobby";
  state.content = content;
  state.round = null;
  for (const p of state.players) {
    p.rounds = emptyRounds(content.length);
    p.hintRound = null;
    p.ready = false;
  }
  pushEvent(state, player, "rematch", now);
}

/** Marca presencia. Devuelve true si cambió el estado (hay que persistir). */
export function touchPlayer(state: RoomState, playerId: string, now: number): boolean {
  const player = state.players.find((p) => p.id === playerId);
  if (!player || now - player.lastSeen < PRESENCE_WRITE_MS) return false;
  player.lastSeen = now;
  return true;
}

/* ---------- Vista ---------- */

const totalPoints = (player: RoomPlayer) => player.rounds.reduce((sum, r) => sum + (r.result?.points ?? 0), 0);

/** Aciertos seguidos contando desde la última ronda resuelta. */
function streakOf(player: RoomPlayer): number {
  let streak = 0;
  for (let i = player.rounds.length - 1; i >= 0; i--) {
    const result = player.rounds[i].result;
    if (!result) continue; // rondas futuras
    if (!result.correct) break;
    streak++;
  }
  return streak;
}

function statusOf(state: RoomState, player: RoomPlayer, now: number): PlayerStatus {
  if (state.status === "lobby" || !state.round) return "waiting";
  const entry = player.rounds[state.round.index];
  if (entry.result) return entry.result.choiceId === null ? "timeout" : entry.result.correct ? "correct" : "wrong";
  if (entry.pausedAt !== null) return "guessing";
  return now < state.round.startsAt ? "waiting" : "revealing";
}

export function roomView(code: string, state: RoomState, playerId: string, now: number): RoomView {
  const me = findPlayer(state, playerId);

  const players = state.players.map((p): RoomPlayerView => ({
    id: p.id,
    name: p.name,
    avatar: p.avatar,
    score: totalPoints(p),
    streak: streakOf(p),
    status: statusOf(state, p, now),
    online: p.id === playerId || now - p.lastSeen < ONLINE_WINDOW_MS,
    isHost: p.id === state.hostId,
    isYou: p.id === playerId,
    ready: Boolean(p.ready),
  }));
  // En el lobby, por orden de llegada; en partida, por puntaje (sort es estable).
  if (state.status !== "lobby") players.sort((a, b) => b.score - a.score);

  let round: RoomRoundView | null = null;
  if (state.round && state.status !== "lobby") {
    const { index, startsAt, endedAt } = state.round;
    const content = state.content[index];
    const entry = me.rounds[index];
    const ended = endedAt !== null;
    const stoppedAt = entry.pausedAt ?? entry.result?.at ?? now;
    round = {
      index,
      status: ended ? "ended" : entry.result ? "answered" : now < startsAt ? "countdown" : entry.pausedAt !== null ? "paused" : "revealing",
      imageUrl: content.imageUrl,
      category: content.category,
      startsAt,
      deadline: startsAt + ROUND_DURATION_MS,
      answerDeadline: startsAt + ROUND_DURATION_MS + ANSWER_WINDOW_MS,
      nextStartsAt: ended ? endedAt + REVEAL_MS : null,
      elapsedMs: Math.max(0, Math.min(stoppedAt - startsAt, ROUND_DURATION_MS)),
      // Las opciones y la correcta solo se mandan cuando ya no dan ventaja.
      choices: entry.pausedAt !== null || entry.result ? content.choices : [],
      result: entry.result
        ? { choiceId: entry.result.choiceId, points: entry.result.points, correctChoiceId: content.correctChoiceId }
        : null,
      hint: me.hintRound === index ? maskedHint(correctLabel(content)) : null,
    };
  }

  return {
    code,
    status: state.status,
    category: (({ id, label, emoji }) => ({ id, label, emoji }))(categoryInfo(state.category ?? "mix")),
    readyCount: state.players.filter((p) => p.ready).length,
    youId: playerId,
    hostId: state.hostId,
    isHost: playerId === state.hostId,
    minPlayers: MIN_PLAYERS,
    maxPlayers: MAX_PLAYERS,
    totalRounds: state.content.length,
    serverNow: now,
    score: totalPoints(me),
    roundResults: me.rounds.map((r) => (r.result ? r.result.correct : null)),
    history: me.rounds.flatMap((r, i) => r.result
      ? [{ category: state.content[i].category, elapsedMs: r.result.elapsedMs ?? null, correct: r.result.correct }]
      : []),
    hintsLeft: me.hintRound === undefined || me.hintRound === null ? HINTS_PER_GAME : 0,
    players,
    round,
    events: state.events.slice(-EVENTS_SENT),
  };
}
