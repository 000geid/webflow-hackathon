import "server-only";
import { z } from "zod";
import { AVATARS, NAME_MAX_LENGTH } from "../game/avatars";
import { categoryChoiceSchema, type CategoryChoice } from "../game/categories";
import {
  addPlayer, applyRoomAction, createRoomState, restartRoom, roomView, syncRoom, touchPlayer,
  type NewPlayer, type RoomAction, type RoomState, type RoomView,
} from "../game/room";
import { ApiError } from "./api";
import { createGameState } from "./challenges";
import { database, hash } from "./games";

const ROOM_TTL_MS = 6 * 60 * 60 * 1000;
/* Sin I, L, O, 0 ni 1: se confunden al dictar el código en voz alta. */
const CODE_ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
const CODE_LENGTH = 5;

export const roomCodeSchema = z.string().trim().toUpperCase().regex(/^[A-HJKMNP-Z2-9]{5}$/);
export const profileSchema = z.object({
  name: z.string().transform((value) => value.replace(/\s+/g, " ").trim()).pipe(z.string().min(1).max(NAME_MAX_LENGTH)),
  avatar: z.enum(AVATARS),
}).strict();
export type Profile = z.infer<typeof profileSchema>;
export const createRoomSchema = profileSchema.extend({ category: categoryChoiceSchema.optional() }).strict();
export type RoomRequestAction = RoomAction | { type: "rematch" };

function randomCode(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(CODE_LENGTH));
  return Array.from(bytes, (byte) => CODE_ALPHABET[byte % CODE_ALPHABET.length]).join("");
}

async function credentials(profile: Profile): Promise<{ player: NewPlayer; token: string }> {
  const token = crypto.randomUUID() + crypto.randomUUID();
  return { player: { id: crypto.randomUUID(), ...profile, tokenHash: await hash(token) }, token };
}

async function newRoundContent(category: CategoryChoice = "mix") {
  const game = await createGameState(category);
  return { mode: game.mode, content: game.rounds.map((round) => round.content) };
}

export async function createRoom(profile: Profile, category: CategoryChoice = "mix"): Promise<RoomView & { token: string }> {
  const { mode, content } = await newRoundContent(category);
  const { player, token } = await credentials(profile);
  const now = Date.now();
  const state = createRoomState(mode, content, player, now, category);
  const db = await database();
  for (let attempt = 0; attempt < 5; attempt++) {
    const code = randomCode();
    // Un código vencido se puede reutilizar.
    await db.prepare("DELETE FROM rooms WHERE code = ? AND expires_at <= ?").bind(code, now).run();
    const result = await db.prepare("INSERT OR IGNORE INTO rooms (code, state_json, expires_at) VALUES (?, ?, ?)")
      .bind(code, JSON.stringify(state), now + ROOM_TTL_MS).run();
    if (result.meta.changes === 1) return { ...roomView(code, state, player.id, now), token };
  }
  throw new ApiError(503, "ROOM_CODE_UNAVAILABLE", "No se pudo generar un código de sala. Probá de nuevo.");
}

/**
 * Lee la sala, la pone al día, aplica `mutate` y guarda con compare-and-swap
 * (mismo patrón que accessGame): si dos jugadores escriben a la vez, uno reintenta.
 */
async function mutateRoom<T>(code: string, mutate: (state: RoomState, now: number) => T) {
  const db = await database();
  for (let attempt = 0; attempt < 5; attempt++) {
    const now = Date.now();
    const row = await db.prepare("SELECT state_json, version FROM rooms WHERE code = ? AND expires_at > ?")
      .bind(code, now).first<{ state_json: string; version: number }>();
    if (!row) throw new ApiError(404, "ROOM_NOT_FOUND", "La sala no existe o ya venció.");
    const state = JSON.parse(row.state_json) as RoomState;
    syncRoom(state, now);
    const value = mutate(state, now);
    const serialized = JSON.stringify(state);
    if (serialized !== row.state_json) {
      const result = await db.prepare("UPDATE rooms SET state_json = ?, version = version + 1 WHERE code = ? AND version = ?")
        .bind(serialized, code, row.version).run();
      if (result.meta.changes !== 1) continue;
    }
    return { state, now, value };
  }
  throw new ApiError(409, "CONCURRENT_UPDATE", "La sala cambió. Volvé a intentar.");
}

async function roomCategory(code: string): Promise<CategoryChoice> {
  const db = await database();
  const row = await db.prepare("SELECT state_json FROM rooms WHERE code = ?").bind(code).first<{ state_json: string }>();
  return row ? ((JSON.parse(row.state_json) as RoomState).category ?? "mix") : "mix";
}

export async function joinRoom(code: string, profile: Profile): Promise<RoomView & { token: string }> {
  const { player, token } = await credentials(profile);
  const { state, now } = await mutateRoom(code, (state, now) => addPlayer(state, player, now));
  return { ...roomView(code, state, player.id, now), token };
}

/** Consulta (sin acción) o actúa sobre la sala. Devuelve null si el jugador salió. */
export async function accessRoom(request: Request, code: string, action?: RoomRequestAction): Promise<RoomView | null> {
  const token = request.headers.get("authorization")?.match(/^Bearer ([\w-]{72})$/)?.[1];
  if (!token) throw new ApiError(401, "UNAUTHORIZED", "Falta el token de la sala.");
  const tokenHash = await hash(token);
  // La revancha necesita rondas nuevas (misma categoría): se buscan antes de abrir la transacción.
  const rematch = action?.type === "rematch" ? await newRoundContent(await roomCategory(code)) : null;

  const { state, now, value: playerId } = await mutateRoom(code, (state, now) => {
    const player = state.players.find((p) => p.tokenHash === tokenHash);
    if (!player) throw new ApiError(404, "PLAYER_NOT_FOUND", "No estás en esta sala.");
    touchPlayer(state, player.id, now);
    if (action?.type === "rematch") restartRoom(state, player.id, rematch!.content, now);
    else if (action) applyRoomAction(state, player.id, action, now);
    return player.id;
  });
  if (!state.players.some((p) => p.id === playerId)) return null;
  return roomView(code, state, playerId, now);
}
