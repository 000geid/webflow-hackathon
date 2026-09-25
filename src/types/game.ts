/** Nivel visual de 0 (imagen nítida / sin zoom) a 7 (máximo efecto). */
export type EffectLevel = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7;

/** Una ronda del juego: la imagen y sus 4 respuestas posibles. */
export interface GameRound {
  id: string;
  imageSrc?: string;
  imageAlt: string;
  options: [string, string, string, string];
}

/** Cómo se ve una opción después de responder. */
export type OptionState = "idle" | "correct" | "wrong" | "muted";
