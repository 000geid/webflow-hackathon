import { readLocal, writeLocal } from "./storage";

export type AchievementId = "first-game" | "streak-3" | "perfect" | "lightning" | "host" | "champion";

export type Achievement = { id: AchievementId; emoji: string; title: string; description: string };

export const ACHIEVEMENTS: Achievement[] = [
  { id: "first-game", emoji: "🎮", title: "Primera partida", description: "Terminá una partida completa." },
  { id: "streak-3", emoji: "🔥", title: "En racha", description: "Acertá 3 rondas seguidas." },
  { id: "perfect", emoji: "💎", title: "Perfecto", description: "Acertá las 5 rondas de una partida." },
  { id: "lightning", emoji: "⚡", title: "Relámpago", description: "Sumá 4.000 puntos o más en una partida." },
  { id: "host", emoji: "🎙️", title: "Anfitrión", description: "Armá una sala y jugala con amigos." },
  { id: "champion", emoji: "🏆", title: "Campeón", description: "Ganá una sala multijugador." },
];

/** Resumen de una partida terminada: es todo lo que necesitan las reglas de logros. */
export type GameSummary = {
  mode: "solo" | "room";
  /** Una entrada por ronda: true = acierto. */
  results: boolean[];
  score: number;
  /** Solo en salas: si fuiste el anfitrión, tu puesto final (1 = ganaste) y cuántos jugaron. */
  hosted: boolean;
  placement: number | null;
  playerCount: number;
};

/**
 * Qué logros se ganan con esta partida (según las descripciones de ACHIEVEMENTS).
 * Devuelve todos los que corresponden; si ya estaban desbloqueados no pasa nada.
 */
export function earnedAchievements(summary: GameSummary): AchievementId[] {
  // TODO(gabriela): definir las reglas de cada logro.
  void summary;
  return [];
}

/* ---------- Persistencia (por navegador, sin cuentas) ---------- */

const STORAGE_KEY = "pixel-rush-achievements";
export type UnlockedMap = Partial<Record<AchievementId, number>>;

export function loadUnlocked(): UnlockedMap {
  return readLocal<UnlockedMap>(STORAGE_KEY) ?? {};
}

/** Guarda los logros de la partida y devuelve solo los nuevos (para avisarlos). */
export function recordGame(summary: GameSummary, now = Date.now()): Achievement[] {
  const unlocked = loadUnlocked();
  const fresh = earnedAchievements(summary).filter((id) => !unlocked[id]);
  if (fresh.length === 0) return [];
  for (const id of fresh) unlocked[id] = now;
  writeLocal(STORAGE_KEY, unlocked);
  return ACHIEVEMENTS.filter((achievement) => fresh.includes(achievement.id));
}
