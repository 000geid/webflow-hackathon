import type { Choice } from "@/lib/game/types";

/**
 * Ronda de ejemplo para maquetar la UI mientras la página no está conectada
 * a los endpoints de partida. No incluye la respuesta correcta: el servidor
 * nunca la manda antes de responder.
 */
export const mockRound: { imageUrl: string | null; category: string; choices: Choice[] } = {
  imageUrl: null,
  category: "Animales",
  choices: [
    { id: "a", label: "Gato" },
    { id: "b", label: "Perro" },
    { id: "c", label: "Zorro" },
    { id: "d", label: "Conejo" },
  ],
};
