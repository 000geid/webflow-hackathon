import assert from "node:assert/strict";
import { test } from "node:test";
import { GameConflict } from "../src/lib/game/engine";
import {
  addPlayer, ANSWER_WINDOW_MS, applyRoomAction, COUNTDOWN_MS, createRoomState, MAX_PLAYERS,
  restartRoom, REVEAL_MS, roomView, syncRoom, type RoomState,
} from "../src/lib/game/room";
import { ROUND_DURATION_MS } from "../src/lib/game/rules";
import type { RoundContent } from "../src/lib/game/types";

const content = (): RoundContent[] => Array.from({ length: 5 }, (_, i) => ({
  id: String(i), category: "test", imageUrl: `/test-${i}.svg`,
  choices: [{ id: "A", label: "Yes" }, { id: "B", label: "No" }], correctChoiceId: "A",
}));
const player = (id: string, name = id) => ({ id, name, avatar: "avatar1", tokenHash: `hash-${id}` });

function room(): RoomState {
  const state = createRoomState("fixture", content(), player("host", "Ana"), 0);
  addPlayer(state, player("p2", "Diego"), 0);
  return state;
}

test("lobby: host only starts with 2+, names deduplicated, room caps at 5", () => {
  const solo = createRoomState("fixture", content(), player("host", "Ana"), 0);
  assert.throws(() => applyRoomAction(solo, "host", { type: "start" }, 0), GameConflict);
  assert.equal(addPlayer(solo, player("p2", "ana"), 0), "ana 2");
  assert.throws(() => applyRoomAction(solo, "p2", { type: "start" }, 0), GameConflict);
  for (let i = 3; i <= MAX_PLAYERS; i++) addPlayer(solo, player(`p${i}`), 0);
  assert.throws(() => addPlayer(solo, player("extra"), 0), GameConflict);
  applyRoomAction(solo, "host", { type: "start" }, 1000);
  assert.throws(() => addPlayer(solo, player("late"), 1000), GameConflict);
});

test("leaving the lobby hands the host role to the next player", () => {
  const state = room();
  applyRoomAction(state, "host", { type: "leave" }, 10);
  assert.equal(state.hostId, "p2");
  assert.equal(state.players.length, 1);
});

test("shared round: countdown, per-player scoring, early close when everyone answered", () => {
  const state = room();
  applyRoomAction(state, "host", { type: "start" }, 0);
  const startsAt = COUNTDOWN_MS;
  assert.equal(roomView("CODE", state, "host", 0).round?.status, "countdown");
  assert.throws(() => applyRoomAction(state, "host", { type: "pause", roundIndex: 0 }, 100), GameConflict);

  applyRoomAction(state, "host", { type: "pause", roundIndex: 0 }, startsAt + 2000);
  // Frenar no revela la respuesta a nadie.
  assert.equal(JSON.stringify(roomView("CODE", state, "p2", startsAt + 2000)).includes("correctChoiceId"), false);
  assert.equal(roomView("CODE", state, "p2", startsAt + 2000).players.find((p) => p.id === "host")?.status, "guessing");

  applyRoomAction(state, "host", { type: "answer", roundIndex: 0, choiceId: "A" }, startsAt + 5000);
  assert.equal(roomView("CODE", state, "host", startsAt + 5000).score, 880); // frenó a los 2 s
  assert.equal(state.round?.endedAt, null);

  applyRoomAction(state, "p2", { type: "pause", roundIndex: 0 }, startsAt + 8000);
  applyRoomAction(state, "p2", { type: "answer", roundIndex: 0, choiceId: "B" }, startsAt + 9000);
  assert.equal(state.round?.endedAt, startsAt + 9000);
  assert.equal(roomView("CODE", state, "p2", startsAt + 9000).round?.status, "ended");

  syncRoom(state, startsAt + 9000 + REVEAL_MS);
  assert.equal(state.round?.index, 1);
  assert.equal(state.round?.startsAt, startsAt + 9000 + REVEAL_MS);
  assert.deepEqual(state.events.map((e) => e.kind), ["joined", "started", "guessing", "correct", "guessing", "wrong"]);
});

test("timeouts: never paused loses at 15s, paused-but-silent loses at the answer window", () => {
  const state = room();
  applyRoomAction(state, "host", { type: "start" }, 0);
  const startsAt = COUNTDOWN_MS;
  applyRoomAction(state, "host", { type: "pause", roundIndex: 0 }, startsAt + 1000);
  syncRoom(state, startsAt + ROUND_DURATION_MS);
  assert.equal(roomView("CODE", state, "p2", startsAt + ROUND_DURATION_MS).players.find((p) => p.id === "p2")?.status, "timeout");
  assert.equal(state.round?.endedAt, null);
  syncRoom(state, startsAt + ROUND_DURATION_MS + ANSWER_WINDOW_MS);
  assert.equal(state.round?.endedAt, startsAt + ROUND_DURATION_MS + ANSWER_WINDOW_MS);
});

test("an idle room catches up through every round and finishes; host can rematch", () => {
  const state = room();
  applyRoomAction(state, "host", { type: "start" }, 0);
  syncRoom(state, 10 * 60_000);
  assert.equal(state.status, "finished");
  assert.deepEqual(roomView("CODE", state, "host", 10 * 60_000).roundResults, [false, false, false, false, false]);
  assert.throws(() => restartRoom(state, "p2", content(), 10 * 60_000), GameConflict);
  restartRoom(state, "host", content(), 10 * 60_000);
  assert.equal(state.status, "lobby");
  assert.equal(roomView("CODE", state, "host", 10 * 60_000).score, 0);
});

test("streaks count trailing correct answers", () => {
  const state = room();
  applyRoomAction(state, "host", { type: "start" }, 0);
  for (let i = 0; i < 3; i++) {
    const startsAt = state.round!.startsAt;
    for (const id of ["host", "p2"]) {
      applyRoomAction(state, id, { type: "pause", roundIndex: i }, startsAt + 1000);
      applyRoomAction(state, id, { type: "answer", roundIndex: i, choiceId: id === "host" || i === 2 ? "A" : "B" }, startsAt + 1000);
    }
    syncRoom(state, state.round!.endedAt! + REVEAL_MS);
  }
  const players = roomView("CODE", state, "host", state.round!.startsAt).players;
  assert.equal(players.find((p) => p.id === "host")?.streak, 3);
  assert.equal(players.find((p) => p.id === "p2")?.streak, 1);
  assert.equal(players[0].id, "host"); // ordenado por puntaje
});

test("room hints: one per player, private to that player, announced to the room", () => {
  const state = room();
  applyRoomAction(state, "host", { type: "start" }, 0);
  const startsAt = COUNTDOWN_MS;
  assert.throws(() => applyRoomAction(state, "host", { type: "hint", roundIndex: 0 }, 100), GameConflict);
  applyRoomAction(state, "host", { type: "hint", roundIndex: 0 }, startsAt + 500);
  assert.equal(roomView("CODE", state, "host", startsAt + 500).round?.hint, "1 palabra · Y__");
  assert.equal(roomView("CODE", state, "p2", startsAt + 500).round?.hint, null);
  assert.equal(roomView("CODE", state, "p2", startsAt + 500).hintsLeft, 1);
  assert.equal(state.events.at(-1)?.kind, "hint");
  applyRoomAction(state, "host", { type: "pause", roundIndex: 0 }, startsAt + 1000);
  applyRoomAction(state, "host", { type: "answer", roundIndex: 0, choiceId: "A" }, startsAt + 1200);
  assert.deepEqual(roomView("CODE", state, "host", startsAt + 1200).history, [{ category: "test", elapsedMs: 1000, correct: true }]);
});

test("ready check: auto-start only when 2+ players are all ready; host can force; rematch resets", () => {
  const state = createRoomState("fixture", content(), player("host", "Ana"), 0, "memes");
  applyRoomAction(state, "host", { type: "ready", ready: true }, 10);
  assert.equal(state.status, "lobby"); // solo: no arranca
  addPlayer(state, player("p2", "Diego"), 20);
  addPlayer(state, player("p3", "Lu"), 20);
  applyRoomAction(state, "p2", { type: "ready", ready: true }, 30);
  assert.equal(roomView("CODE", state, "p3", 30).readyCount, 2);
  applyRoomAction(state, "p2", { type: "ready", ready: false }, 40);
  applyRoomAction(state, "p2", { type: "ready", ready: true }, 50);
  assert.equal(state.status, "lobby");
  applyRoomAction(state, "p3", { type: "leave" }, 60); // se va el único que faltaba
  assert.equal(state.status, "playing");
  assert.equal(roomView("CODE", state, "host", 60).category.label, "Memes de Internet");
  assert.ok(state.players.every((p) => !p.ready));

  const forced = room();
  assert.throws(() => applyRoomAction(forced, "p2", { type: "start" }, 0), GameConflict);
  applyRoomAction(forced, "host", { type: "start" }, 0); // nadie confirmó, el anfitrión fuerza
  assert.equal(forced.status, "playing");
  syncRoom(forced, 10 * 60_000);
  applyRoomAction(forced, "p2", { type: "ready", ready: true }, 10 * 60_000); // fuera del lobby: no hace nada
  restartRoom(forced, "host", content(), 10 * 60_000);
  assert.equal(roomView("CODE", forced, "host", 10 * 60_000).readyCount, 0);
});
