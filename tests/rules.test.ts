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

test("victory titles: hint beats score; high / medium / low by score ratio", async () => {
  const { victoryTitle } = await import("../src/lib/ui/victory");
  const title = (score: number, hintsUsed = 0) => victoryTitle({ score, maxScore: 5000, hintsUsed }).title;
  assert.equal(title(4900, 1), "Más bot que humano");
  assert.equal(title(3500), "La / El GOAT");
  assert.equal(title(3499), "Megamente");
  assert.equal(title(1750), "Megamente");
  assert.equal(title(1749), "El / La colgado/a");
  assert.equal(victoryTitle({ score: 2000, maxScore: 5000, hintsUsed: 0 }).accent, "blue-dot");
});
