import type { OptionState } from "@/types/game";

export const OPTION_LETTERS = ["A", "B", "C", "D"] as const;

/** Decide cómo pintar cada opción según lo que respondió el jugador. */
export function getOptionState(
  index: number,
  selectedIndex: number | null,
  correctIndex: number | null,
): OptionState {
  if (selectedIndex === null) return "idle";
  if (index === correctIndex) return "correct";
  if (index === selectedIndex) return "wrong";
  return "muted";
}
