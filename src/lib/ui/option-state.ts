/** Letras que coinciden con los campos `opcion-a`…`opcion-d` del CMS. */
export const OPTION_LETTERS = ["A", "B", "C", "D"] as const;

/**
 * Cómo se ve una opción:
 * - idle: se puede elegir
 * - selected: elegida, esperando que el servidor diga si está bien
 * - correct: elegida y correcta (verde + rebote)
 * - wrong: elegida e incorrecta (rojo + shake)
 * - revealed: no la elegiste, pero era la correcta
 * - muted: el resto, apagadas
 */
export type OptionState = "idle" | "selected" | "correct" | "wrong" | "revealed" | "muted";

export function getOptionState(
  choiceId: string,
  selectedChoiceId: string | null,
  correctChoiceId: string | null,
): OptionState {
  const isSelected = choiceId === selectedChoiceId;
  const isCorrect = choiceId === correctChoiceId;

  if (correctChoiceId === null) {
    if (selectedChoiceId === null) return "idle";
    return isSelected ? "selected" : "muted";
  }
  if (isSelected) return isCorrect ? "correct" : "wrong";
  return isCorrect ? "revealed" : "muted";
}
