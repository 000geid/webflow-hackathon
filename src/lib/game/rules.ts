export const ROUND_DURATION_MS = 15_000;
export const ROUNDS_PER_GAME = 5;

export function scoreForAnswer(elapsedMs: number, correct: boolean): number {
  if (!correct || !Number.isFinite(elapsedMs) || elapsedMs < 0 || elapsedMs >= ROUND_DURATION_MS) return 0;
  if (elapsedMs <= 3_000) return 1_000;
  if (elapsedMs <= 7_000) return 700;
  if (elapsedMs <= 12_000) return 400;
  return 100;
}
