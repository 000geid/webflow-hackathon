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
  title: string;
  tagline: string;
  rarity: "Legendaria" | "Épica" | "Rara" | "Común";
};

/** Promedio hasta frenar por debajo del cual se considera "rápido", y desde el cual "colgado". */
export const FAST_AVERAGE_MS = 4_000;
export const SLOW_AVERAGE_MS = 10_000;

/**
 * Rango de la tarjeta final según precisión y velocidad. Gana la primera regla que se cumple:
 *   1. GOAT          — 80 % o más.
 *   2. ¡CRACK!       — 40–60 % y rápido (promedio < 4 s).
 *   3. EN NARNIA     — 20 % o menos, o demasiado lento (≥ 10 s de promedio, o nunca frenó).
 *   4. MEDIA PILAAA  — el resto (40–60 % a ritmo normal).
 */
export function victoryTitle({ accuracy, averageMs }: Pick<VictoryStats, "accuracy" | "averageMs">): VictoryTitle {
  const tooSlow = averageMs === null || averageMs >= SLOW_AVERAGE_MS;
  if (accuracy >= 80) return { title: "GOAT", tagline: "Mirá esa precisión... ¡cero fallas, la cazaste al toque!", rarity: "Legendaria" };
  if (accuracy >= 40 && averageMs !== null && averageMs < FAST_AVERAGE_MS) {
    return { title: "¡CRACK!", tagline: "Casi perfecto. Bajale un cambio a la ansiedad para la próxima.", rarity: "Épica" };
  }
  if (accuracy <= 20 || tooSlow) return { title: "EN NARNIA", tagline: "Te colgaste mal. ¡Te la llevás a marzo!", rarity: "Común" };
  return { title: "MEDIA PILAAA", tagline: "Adivinaste un par de pedo. Tenés que ajustar el ojo.", rarity: "Rara" };
}

export const formatSeconds = (ms: number | null) => (ms === null ? "—" : `${(ms / 1000).toFixed(1).replace(".", ",")} s`);
