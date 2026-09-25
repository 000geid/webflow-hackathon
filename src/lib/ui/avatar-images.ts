import { appPath } from "@/lib/paths";

/** Avatares pixel-art de /public/avatars (avatar1.jpg … avatar18.jpg). */
export const AVATAR_IMAGES: readonly string[] = Array.from({ length: 18 }, (_, i) => appPath(`/avatars/avatar${i + 1}.jpg`));

/** Hash FNV-1a de 32 bits: rápido, determinista y con buena dispersión para textos cortos. */
function fnv1a(text: string): number {
  let hash = 0x811c9dc5;
  for (const char of text) {
    hash ^= char.codePointAt(0)!;
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
}

/**
 * Avatar fijo para un nombre: el mismo apodo siempre muestra la misma imagen,
 * en cualquier partida y dispositivo, sin guardar nada. No distingue mayúsculas ni espacios extra.
 */
export function avatarImageFor(name: string): string {
  const key = name.trim().toLowerCase() || "jugador";
  return AVATAR_IMAGES[fnv1a(key) % AVATAR_IMAGES.length];
}
