import type { EffectLevel } from "@/types/game";

/*
 * Tailwind solo genera las clases que encuentra escritas completas en el código.
 * Por eso no se arma `blur-${x}` con template strings: cada nivel apunta a una
 * clase literal.
 */

export const BLUR_CLASSES: Record<EffectLevel, string> = {
  0: "blur-none",
  1: "blur-xs",
  2: "blur-sm",
  3: "blur-md",
  4: "blur-lg",
  5: "blur-xl",
  6: "blur-2xl",
  7: "blur-3xl",
};

export const SCALE_CLASSES: Record<EffectLevel, string> = {
  0: "scale-100",
  1: "scale-110",
  2: "scale-125",
  3: "scale-150",
  4: "scale-175",
  5: "scale-200",
  6: "scale-250",
  7: "scale-300",
};

/** Convierte cualquier número a un nivel válido (0–7). */
export function toEffectLevel(value: number): EffectLevel {
  return Math.min(Math.max(Math.round(value), 0), 7) as EffectLevel;
}
