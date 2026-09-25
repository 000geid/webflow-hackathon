import "server-only";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { applyAction, expireRound, gameView } from "../game/engine";
import type { GameAction, GameState } from "../game/types";
import { ApiError } from "./api";

const GAME_TTL_MS = 24 * 60 * 60 * 1000;
export async function database() {
  const { env } = await getCloudflareContext({ async: true });
  if (!env.DB) throw new ApiError(503, "DATABASE_UNAVAILABLE", "Falta configurar la base de datos.");
  return env.DB;
}
export async function hash(token: string) {
  const bytes = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(token));
  return Array.from(new Uint8Array(bytes), (byte) => byte.toString(16).padStart(2, "0")).join("");
}
export async function insertGame(state: GameState) {
  const db = await database();
  const gameId = crypto.randomUUID();
  const token = crypto.randomUUID() + crypto.randomUUID();
  const now = Date.now();
  await db.prepare("INSERT INTO games (id, token_hash, state_json, expires_at) VALUES (?, ?, ?, ?)")
    .bind(gameId, await hash(token), JSON.stringify(state), now + GAME_TTL_MS).run();
  return { ...gameView(gameId, state, now), token };
}

export async function accessGame(request: Request, id: string, action?: GameAction) {
  const token = request.headers.get("authorization")?.match(/^Bearer ([\w-]{72})$/)?.[1];
  if (!token) throw new ApiError(401, "UNAUTHORIZED", "Falta el token de la partida.");
  const tokenHash = await hash(token);
  const db = await database();
  // Compare-and-swap prevents parallel requests from overwriting a score or pause.
  for (let attempt = 0; attempt < 4; attempt++) {
    const now = Date.now();
    const row = await db.prepare("SELECT state_json, version FROM games WHERE id = ? AND token_hash = ? AND expires_at > ?")
      .bind(id, tokenHash, now).first<{ state_json: string; version: number }>();
    if (!row) throw new ApiError(404, "GAME_NOT_FOUND", "Partida inexistente o vencida.");
    const state = JSON.parse(row.state_json) as GameState;
    expireRound(state, now);
    if (action) applyAction(state, action, now);
    const serialized = JSON.stringify(state);
    if (serialized !== row.state_json) {
      const result = await db.prepare("UPDATE games SET state_json = ?, version = version + 1 WHERE id = ? AND version = ? AND expires_at > ?")
        .bind(serialized, id, row.version, now).run();
      if (result.meta.changes !== 1) continue;
    }
    return gameView(id, state, now);
  }
  throw new ApiError(409, "CONCURRENT_UPDATE", "La partida cambió. Volvé a consultar su estado.");
}
