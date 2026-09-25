export const ROUND_DURATION_MS = 15_000;
export const ROUNDS_PER_GAME = 5;

export const MAX_POINTS = 1_000;
export const MIN_POINTS = 100;

/**
 * Puntos en juego a los `elapsedMs` de la ronda: bajan en línea recta de 1.000 (segundo 0)
 * a 100 (segundo 15). Lo usan el servidor para puntuar y la UI para el medidor en vivo,
 * así lo que se ve es exactamente lo que se cobra.
 */
export function pointsAt(elapsedMs: number): number {
  const progress = Math.min(Math.max(elapsedMs / ROUND_DURATION_MS, 0), 1);
  return Math.round(MAX_POINTS - (MAX_POINTS - MIN_POINTS) * progress);
}

export function scoreForAnswer(elapsedMs: number, correct: boolean): number {
  if (!correct || !Number.isFinite(elapsedMs) || elapsedMs < 0 || elapsedMs >= ROUND_DURATION_MS) return 0;
  return pointsAt(elapsedMs);
}
