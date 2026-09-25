import assert from "node:assert/strict";
import { test } from "node:test";
import { pointsAt, scoreForAnswer } from "../src/lib/game/rules";

test("points decay linearly from 1000 at 0s to 100 at 15s", () => {
  for (const [elapsed, expected] of [[0, 1000], [1500, 910], [3000, 820], [7500, 550], [12000, 280], [14999, 100], [15000, 0]]) {
    assert.equal(scoreForAnswer(elapsed, true), expected);
  }
});

test("the live meter and the server agree, and points never go up over time", () => {
  let previous = Infinity;
  for (let elapsed = 0; elapsed < 15000; elapsed += 7) {
    const points = scoreForAnswer(elapsed, true);
    assert.equal(points, pointsAt(elapsed));
    assert.ok(points <= previous && points >= 100 && points <= 1000);
    previous = points;
  }
});

test("incorrect, expired, and invalid answers earn no points", () => {
  assert.equal(scoreForAnswer(1000, false), 0);
  for (const elapsed of [-1, NaN, Infinity, 16000]) assert.equal(scoreForAnswer(elapsed, true), 0);
});

test("victory ranks: GOAT ≥80 %, CRACK fast 40–60 %, NARNIA ≤20 % or too slow, else MEDIA PILAAA", async () => {
  const { victoryTitle } = await import("../src/lib/ui/victory");
  const rank = (accuracy: number, averageMs: number | null) => victoryTitle({ accuracy, averageMs }).title;
  assert.equal(rank(100, 12_000), "GOAT"); // la precisión manda aunque sea lento
  assert.equal(rank(80, 2_000), "GOAT");
  assert.equal(rank(60, 3_999), "¡CRACK!");
  assert.equal(rank(40, 2_500), "¡CRACK!");
  assert.equal(rank(60, 4_000), "MEDIA PILAAA");
  assert.equal(rank(40, 9_999), "MEDIA PILAAA");
  assert.equal(rank(60, 10_000), "EN NARNIA");
  assert.equal(rank(40, null), "EN NARNIA");
  assert.equal(rank(20, 1_000), "EN NARNIA");
  assert.equal(rank(0, null), "EN NARNIA");
});
