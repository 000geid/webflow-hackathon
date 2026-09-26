import assert from "node:assert/strict";
import { test } from "node:test";
import { GameConflict } from "../src/lib/game/engine";
import {
  addPlayer, applyRoomAction, COUNTDOWN_MS, createRoomState, GUESS_DURATION_MS,
  MAX_PLAYERS, restartRoom, REVEAL_MS, roomView, syncRoom, type RoomState,
} from "../src/lib/game/room";
import { ROUND_DURATION_MS, pointsAt } from "../src/lib/game/rules";
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

test("lobby, host permissions, ready check and capacity", () => {
  const state = createRoomState("fixture", content(), player("host", "Ana"), 0);
  assert.throws(() => applyRoomAction(state, "host", { type: "start" }, 0), GameConflict);
  assert.equal(addPlayer(state, player("p2", "ana"), 0), "ana 2");
  assert.throws(() => applyRoomAction(state, "p2", { type: "start" }, 0), GameConflict);
  for (let i = 3; i <= MAX_PLAYERS; i++) addPlayer(state, player(`p${i}`), 0);
  assert.throws(() => addPlayer(state, player("extra"), 0), GameConflict);
  const ready = room();
  applyRoomAction(ready, "host", { type: "ready", ready: true }, 10);
  assert.equal(ready.status, "lobby");
  applyRoomAction(ready, "p2", { type: "ready", ready: true }, 20);
  assert.equal(ready.status, "playing");
});

test("first pause wins and only that player sees the choices", () => {
  const state = room();
  applyRoomAction(state, "host", { type: "start" }, 0);
  const start = COUNTDOWN_MS;
  assert.throws(() => applyRoomAction(state, "host", { type: "pause", roundIndex: 0 }, start - 1), GameConflict);
  applyRoomAction(state, "host", { type: "pause", roundIndex: 0 }, start + 2_000);
  assert.equal(state.round?.guesserId, "host");
  assert.equal(state.round?.remainingMs, 13_000);
  assert.throws(() => applyRoomAction(state, "p2", { type: "pause", roundIndex: 0 }, start + 2_001), GameConflict);
  assert.deepEqual(roomView("CODE", state, "p2", start + 2_001).round?.choices, []);
  assert.deepEqual(roomView("CODE", state, "host", start + 2_001).round?.choices.map((choice) => choice.id), ["A", "B"]);
  applyRoomAction(state, "host", { type: "answer", roundIndex: 0, choiceId: "A" }, start + 2_500);
  assert.equal(state.round?.winnerId, "host");
  assert.equal(roomView("CODE", state, "host", start + 2_500).score, pointsAt(2_000));
  assert.equal(roomView("CODE", state, "p2", start + 2_500).roundResults[0], false);
});

test("wrong answer consumes the attempt and resumes the shared clock", () => {
  const state = room();
  applyRoomAction(state, "host", { type: "start" }, 0);
  const start = COUNTDOWN_MS;
  applyRoomAction(state, "host", { type: "pause", roundIndex: 0 }, start + 2_000);
  applyRoomAction(state, "host", { type: "answer", roundIndex: 0, choiceId: "B" }, start + 2_500);
  assert.equal(state.round?.revealStartedAt, start + 2_500);
  assert.equal(state.round?.remainingMs, 13_000);
  assert.throws(() => applyRoomAction(state, "host", { type: "pause", roundIndex: 0 }, start + 3_000), GameConflict);
  applyRoomAction(state, "p2", { type: "pause", roundIndex: 0 }, start + 4_000);
  applyRoomAction(state, "p2", { type: "answer", roundIndex: 0, choiceId: "A" }, start + 4_200);
  assert.equal(roomView("CODE", state, "p2", start + 4_200).score, pointsAt(3_500));
  assert.equal(state.round?.winnerId, "p2");
});

test("five-second answer window expires and another player can try", () => {
  const state = room();
  applyRoomAction(state, "host", { type: "start" }, 0);
  const start = COUNTDOWN_MS;
  applyRoomAction(state, "host", { type: "pause", roundIndex: 0 }, start + 1_000);
  syncRoom(state, start + 1_000 + GUESS_DURATION_MS);
  assert.equal(state.round?.guesserId, null);
  assert.equal(state.round?.remainingMs, 14_000);
  assert.equal(roomView("CODE", state, "host", start + 6_000).round?.hasAttempted, true);
  applyRoomAction(state, "p2", { type: "pause", roundIndex: 0 }, start + 6_100);
  applyRoomAction(state, "p2", { type: "answer", roundIndex: 0, choiceId: "A" }, start + 6_200);
  assert.equal(state.round?.winnerId, "p2");
});

test("all wrong closes the round; idle rooms finish; rematch resets scores", () => {
  const state = room();
  applyRoomAction(state, "host", { type: "start" }, 0);
  const start = COUNTDOWN_MS;
  applyRoomAction(state, "host", { type: "pause", roundIndex: 0 }, start + 1_000);
  applyRoomAction(state, "host", { type: "answer", roundIndex: 0, choiceId: "B" }, start + 1_500);
  applyRoomAction(state, "p2", { type: "pause", roundIndex: 0 }, start + 2_000);
  applyRoomAction(state, "p2", { type: "answer", roundIndex: 0, choiceId: "B" }, start + 2_500);
  assert.equal(state.round?.endedAt, start + 2_500);
  assert.equal(roomView("CODE", state, "host", start + 2_500).round?.result?.correctChoiceId, "A");
  syncRoom(state, start + 2_500 + REVEAL_MS);
  assert.equal(state.round?.index, 1);
  assert.equal(state.round?.remainingMs, ROUND_DURATION_MS);
  syncRoom(state, 10 * 60_000);
  assert.equal(state.status, "finished");
  assert.throws(() => restartRoom(state, "p2", content(), 10 * 60_000), GameConflict);
  restartRoom(state, "host", content(), 10 * 60_000);
  assert.equal(state.status, "lobby");
  assert.equal(roomView("CODE", state, "host", 10 * 60_000).score, 0);
});

test("hints remain private while the buzzer is free", () => {
  const state = room();
  applyRoomAction(state, "host", { type: "start" }, 0);
  const start = COUNTDOWN_MS;
  applyRoomAction(state, "host", { type: "hint", roundIndex: 0 }, start + 100);
  assert.equal(roomView("CODE", state, "host", start + 100).round?.hint, "1 palabra · Y__");
  assert.equal(roomView("CODE", state, "p2", start + 100).round?.hint, null);
  applyRoomAction(state, "p2", { type: "pause", roundIndex: 0 }, start + 200);
  assert.equal(roomView("CODE", state, "host", start + 201).round?.choices.length, 0);
});

test("leaving during play transfers the host without deleting the score", () => {
  const state = room();
  applyRoomAction(state, "host", { type: "start" }, 0);
  applyRoomAction(state, "host", { type: "pause", roundIndex: 0 }, COUNTDOWN_MS + 100);
  applyRoomAction(state, "host", { type: "answer", roundIndex: 0, choiceId: "A" }, COUNTDOWN_MS + 200);
  const score = roomView("CODE", state, "host", COUNTDOWN_MS + 200).score;
  applyRoomAction(state, "host", { type: "leave" }, COUNTDOWN_MS + 300);
  assert.equal(state.hostId, "p2");
  assert.equal(roomView("CODE", state, "host", COUNTDOWN_MS + 300).score, score);
});

test("leaving during an answer turn releases the buzzer immediately", () => {
  const state = room();
  applyRoomAction(state, "host", { type: "start" }, 0);
  applyRoomAction(state, "host", { type: "pause", roundIndex: 0 }, COUNTDOWN_MS + 100);
  applyRoomAction(state, "host", { type: "leave" }, COUNTDOWN_MS + 200);
  assert.equal(state.hostId, "p2");
  assert.equal(state.round?.guesserId, null);
  assert.equal(roomView("CODE", state, "host", COUNTDOWN_MS + 200).round?.hasAttempted, true);
  applyRoomAction(state, "p2", { type: "pause", roundIndex: 0 }, COUNTDOWN_MS + 300);
  assert.equal(state.round?.guesserId, "p2");
});
