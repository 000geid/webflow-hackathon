import assert from "node:assert/strict";
import { test } from "node:test";
import { scoreForAnswer } from "../src/lib/game/rules";

test("continuous scoring boundaries have no gaps", () => {
  for (const [elapsed, expected] of [[0, 1000], [3000, 1000], [3001, 700], [7000, 700], [7001, 400], [12000, 400], [12001, 100], [14999, 100], [15000, 0]]) {
    assert.equal(scoreForAnswer(elapsed, true), expected);
  }
});

test("incorrect, expired, and invalid answers earn no points", () => {
  assert.equal(scoreForAnswer(1000, false), 0);
  for (const elapsed of [-1, NaN, Infinity, 16000]) assert.equal(scoreForAnswer(elapsed, true), 0);
});
