/** Pistas por partida (solo y salas). */
export const HINTS_PER_GAME = 1;

/**
 * Pista enmascarada a partir de la respuesta correcta: primera letra de cada palabra
 * y el largo del resto. "Drake Hotline Bling" → "3 palabras · D____ H______ B___".
 *
 * Es la pista por defecto, sin IA. Punto de enganche para un agente (Webflow MCP u otro):
 * generar el texto en el servidor, guardarlo en el estado de la ronda y devolverlo en lugar de este.
 */
export function maskedHint(answer: string): string {
  const words = answer.trim().split(/\s+/).filter(Boolean);
  const masked = words.map((word) => {
    const chars = Array.from(word);
    return chars[0] + "_".repeat(Math.max(0, chars.length - 1));
  });
  return `${words.length} palabra${words.length === 1 ? "" : "s"} · ${masked.join("  ")}`;
}

/** Resumen de una ronda terminada, para la tarjeta final. */
export type RoundHistory = {
  category: string;
  /** Ms hasta que frenaste; null si se te acabó el tiempo sin frenar. */
  elapsedMs: number | null;
  correct: boolean;
};
