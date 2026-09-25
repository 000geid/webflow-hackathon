/** Letras que coinciden con los campos `opcion-a`…`opcion-d` del CMS. */
export const OPTION_LETTERS = ["A", "B", "C", "D"] as const;

/** Cómo se ve una opción después de responder. */
export type OptionState = "idle" | "correct" | "wrong" | "muted";

/** Decide cómo pintar cada opción según lo que respondió el jugador. */
export function getOptionState(
  choiceId: string,
  selectedChoiceId: string | null,
  correctChoiceId: string | null,
): OptionState {
  if (selectedChoiceId === null && correctChoiceId === null) return "idle";
  if (choiceId === correctChoiceId) return "correct";
  if (choiceId === selectedChoiceId) return "wrong";
  return "muted";
}
