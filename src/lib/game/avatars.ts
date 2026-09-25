/** Avatares permitidos. El servidor solo acepta estos, así nadie inyecta texto arbitrario. */
export const AVATARS = [
  "🦊", "🐸", "🐙", "🦄", "🐼", "🐯", "🐧", "🦖",
  "👾", "🤖", "👽", "🧠", "🍕", "🌵", "🚀", "⚡",
] as const;

export type Avatar = (typeof AVATARS)[number];

export function isAvatar(value: unknown): value is Avatar {
  return typeof value === "string" && (AVATARS as readonly string[]).includes(value);
}

export const NAME_MAX_LENGTH = 16;
