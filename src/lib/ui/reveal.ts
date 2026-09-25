import type { CSSProperties } from "react";

/** Zoom inicial (equivale a scale-[2.5]). */
export const MAX_SCALE = 2.5;
/** Blur inicial en px (equivale a blur-md). */
export const MAX_BLUR_PX = 12;

/**
 * Convierte el tiempo restante en zoom + blur.
 * 15s → scale 2.5 y blur 12px · 0s → scale 1 y sin blur.
 *
 * Va como style inline y no como clase de Tailwind porque el valor cambia de
 * forma continua: Tailwind solo genera clases escritas de antemano.
 */
export function revealStyle(timeLeft: number, duration: number, revealed = false): CSSProperties {
  const progress = revealed ? 0 : Math.min(Math.max(timeLeft / duration, 0), 1);
  const scale = 1 + (MAX_SCALE - 1) * progress;
  const blur = MAX_BLUR_PX * progress;

  return {
    transform: `scale(${scale.toFixed(3)})`,
    filter: blur > 0.05 ? `blur(${blur.toFixed(2)}px)` : "none",
  };
}
