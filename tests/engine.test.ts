import assert from "node:assert/strict";
import { test } from "node:test";
import { applyAction, expireRound, gameView, GameConflict } from "../src/lib/game/engine";
import type { GameState } from "../src/lib/game/types";

function game(): GameState {
  return { mode: "fixture", index: 0, rounds: Array.from({ length: 5 }, (_, i) => ({
    content: { id: String(i), category: "test", imageUrl: "/test.svg", choices: [{ id: "A", label: "Yes" }, { id: "B", label: "No" }], correctChoiceId: "A" },
    startedAt: null, pausedAt: null, result: null,
  })) };
}
test("five rounds, frozen timing, hidden answers, idempotent scoring and completion", () => {
  const state = game();
  for (let i = 0; i < 5; i++) {
    const now = i * 100000;
    applyAction(state, { type: "start", roundIndex: i }, now);
    const view = gameView("id", state, now);
    assert.deepEqual(view.round.choices, []);
    assert.equal(JSON.stringify(view).includes("correctChoiceId"), false);
    assert.throws(() => applyAction(state, { type: "answer", roundIndex: i, choiceId: "A" }, now + 1000), GameConflict);
    applyAction(state, { type: "pause", roundIndex: i }, now + 2000);
    applyAction(state, { type: "pause", roundIndex: i }, now + 4000);
    expireRound(state, now + 30000);
    assert.equal(gameView("id", state, now + 30000).round.elapsedMs, 2000);
    assert.throws(() => applyAction(state, { type: "answer", roundIndex: i, choiceId: "X" }, now + 30000), GameConflict);
    applyAction(state, { type: "answer", roundIndex: i, choiceId: "A" }, now + 30000);
    applyAction(state, { type: "answer", roundIndex: i, choiceId: "A" }, now + 31000);
    assert.throws(() => applyAction(state, { type: "answer", roundIndex: i, choiceId: "B" }, now + 32000), GameConflict);
  }
  assert.equal(gameView("id", state, 500000).status, "finished");
  assert.equal(gameView("id", state, 500000).score, 4400); // 5 × 880 (frenó a los 2 s)
});
test("deadline wins over pause and answer; stale and future rounds rejected", () => {
  const state = game();
  assert.throws(() => applyAction(state, { type: "start", roundIndex: 1 }, 0), GameConflict);
  applyAction(state, { type: "start", roundIndex: 0 }, 0);
  assert.throws(() => applyAction(state, { type: "expire", roundIndex: 0 }, 14999), GameConflict);
  applyAction(state, { type: "pause", roundIndex: 0 }, 15000);
  assert.equal(gameView("id", state, 15000).status, "answered");
  applyAction(state, { type: "answer", roundIndex: 0, choiceId: "A" }, 16000);
  assert.equal(gameView("id", state, 16000).score, 0);
  applyAction(state, { type: "start", roundIndex: 1 }, 17000);
  assert.throws(() => applyAction(state, { type: "pause", roundIndex: 0 }, 18000), GameConflict);
});

test("one hint per game: only after start, only for the live round, cleared on the next round", () => {
  const state = game();
  assert.throws(() => applyAction(state, { type: "hint", roundIndex: 0 }, 0), GameConflict);
  applyAction(state, { type: "start", roundIndex: 0 }, 0);
  assert.equal(gameView("id", state, 0).hintsLeft, 1);
  applyAction(state, { type: "hint", roundIndex: 0 }, 1000);
  applyAction(state, { type: "hint", roundIndex: 0 }, 1500); // idempotente
  const view = gameView("id", state, 1500);
  assert.equal(view.hintsLeft, 0);
  assert.equal(view.round.hint, "1 palabra · Y__");
  assert.equal(JSON.stringify(view).includes("correctChoiceId"), false);
  applyAction(state, { type: "pause", roundIndex: 0 }, 2000);
  applyAction(state, { type: "answer", roundIndex: 0, choiceId: "A" }, 2500);
  applyAction(state, { type: "start", roundIndex: 1 }, 3000);
  assert.equal(gameView("id", state, 3000).round.hint, null);
  assert.throws(() => applyAction(state, { type: "hint", roundIndex: 1 }, 3500), GameConflict);
  assert.deepEqual(gameView("id", state, 3500).history, [{ category: "test", elapsedMs: 2000, correct: true }]);
});
