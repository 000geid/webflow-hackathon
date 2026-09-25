import type { GameRound } from "@/types/game";

/** Ronda de ejemplo para maquetar mientras no hay servidor. */
export const mockRound: GameRound = {
  id: "demo-1",
  imageSrc: undefined,
  imageAlt: "Imagen a adivinar",
  options: ["Gato", "Perro", "Zorro", "Conejo"],
};
