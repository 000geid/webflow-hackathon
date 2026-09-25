export type StarRating = 1 | 2 | 3;

/** 1 a 3 estrellas según el porcentaje del puntaje máximo posible. */
export function getStarRating(score: number, maxScore: number): StarRating {
  const ratio = maxScore > 0 ? score / maxScore : 0;
  if (ratio >= 0.6) return 3;
  if (ratio >= 0.3) return 2;
  return 1;
}

/** Porcentaje de respuestas correctas, redondeado. */
export function getAccuracy(correctCount: number, totalRounds: number): number {
  return totalRounds > 0 ? Math.round((correctCount / totalRounds) * 100) : 0;
}

/** Con 2 o 3 estrellas se festeja con confetti. */
export function shouldCelebrate(stars: StarRating): boolean {
  return stars >= 2;
}
