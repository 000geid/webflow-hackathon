export type SegmentState = "correct" | "wrong" | "current" | "upcoming";

/**
 * Estado de cada segmento de la barra de progreso.
 * `results[i]` = true/false si la ronda i ya se jugó (acierto/error).
 */
export function getProgressSegments(totalRounds: number, roundIndex: number, results: boolean[]): SegmentState[] {
  return Array.from({ length: totalRounds }, (_, i) => {
    if (i < results.length) return results[i] ? "correct" : "wrong";
    if (i === roundIndex) return "current";
    return "upcoming";
  });
}
