import type { RoundHistory } from "@/lib/game/hints";

export type VictoryStats = {
  correct: number;
  total: number;
  accuracy: number;
  /** Promedio de ms hasta frenar, solo rondas donde frenaste. null si no frenaste nunca. */
  averageMs: number | null;
  /** Categoría más jugada. */
  category: string;
};

export function victoryStats(history: RoundHistory[], totalRounds: number): VictoryStats {
  const correct = history.filter((round) => round.correct).length;
  const times = history.flatMap((round) => (round.elapsedMs === null ? [] : [round.elapsedMs]));
  const counts = new Map<string, number>();
  for (const round of history) counts.set(round.category, (counts.get(round.category) ?? 0) + 1);
  const category = [...counts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? "—";
  return {
    correct,
    total: totalRounds,
    accuracy: totalRounds > 0 ? Math.round((correct / totalRounds) * 100) : 0,
    averageMs: times.length > 0 ? times.reduce((sum, ms) => sum + ms, 0) / times.length : null,
    category,
  };
}

export type VictoryTitle = {
  emoji: string;
  title: string;
  tagline: string;
  rarity: "Legendaria" | "Épica" | "Rara" | "Común";
  /** Detalle visual opcional junto al título. */
  accent?: "blue-dot";
};

/** Puntaje como fracción del máximo a partir del cual se considera alto o medio. */
export const HIGH_SCORE_RATIO = 0.7;
export const MEDIUM_SCORE_RATIO = 0.35;

/**
 * Título de la tarjeta. El orden importa: gana la primera regla que se cumple.
 * Usar la pista pesa más que el puntaje (es el título más gracioso y el más honesto).
 */
export function victoryTitle({ score, maxScore, hintsUsed }: { score: number; maxScore: number; hintsUsed: number }): VictoryTitle {
  const ratio = maxScore > 0 ? score / maxScore : 0;
  if (hintsUsed > 0) return { emoji: "🤖", title: "Más bot que humano", tagline: "La pista hizo la mitad del laburo.", rarity: "Rara" };
  if (ratio >= HIGH_SCORE_RATIO) return { emoji: "👑", title: "La / El GOAT", tagline: "Nadie te frena. Literal.", rarity: "Legendaria" };
  if (ratio >= MEDIUM_SCORE_RATIO) return { emoji: "🧠", title: "Megamente", tagline: "Cerebro a full, reflejos en camino.", rarity: "Épica", accent: "blue-dot" };
  return { emoji: "🐌", title: "El / La colgado/a", tagline: "Te tomaste tu tiempo… demasiado.", rarity: "Común" };
}

export const formatSeconds = (ms: number | null) => (ms === null ? "—" : `${(ms / 1000).toFixed(1).replace(".", ",")} s`);
