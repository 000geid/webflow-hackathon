/**
 * Avatares permitidos: los 18 personajes pixel-art de /public/avatars (avatar1.jpg … avatar18.jpg).
 * Se guarda y se envía solo el id ("avatar7"); el servidor acepta únicamente estos, así nadie inyecta texto arbitrario.
 */
export const AVATARS = [
  "avatar1", "avatar2", "avatar3", "avatar4", "avatar5", "avatar6",
  "avatar7", "avatar8", "avatar9", "avatar10", "avatar11", "avatar12",
  "avatar13", "avatar14", "avatar15", "avatar16", "avatar17", "avatar18",
] as const;

export type Avatar = (typeof AVATARS)[number];

export function isAvatar(value: unknown): value is Avatar {
  return typeof value === "string" && (AVATARS as readonly string[]).includes(value);
}

export const NAME_MAX_LENGTH = 16;
