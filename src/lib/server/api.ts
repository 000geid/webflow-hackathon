import "server-only";
import { GameConflict } from "../game/engine";

export class ApiError extends Error {
  constructor(public status: number, public code: string, message: string) { super(message); }
}
export function json(data: unknown, status = 200) {
  return Response.json(data, { status, headers: { "Cache-Control": "no-store" } });
}
export function apiError(error: unknown) {
  if (error instanceof ApiError) return json({ error: { code: error.code, message: error.message } }, error.status);
  if (error instanceof GameConflict) return json({ error: { code: "GAME_CONFLICT", message: error.message } }, 409);
  // Never expose database state, answers, upstream bodies, or credentials.
  console.error("Game API failed", error instanceof Error ? error.name : "UnknownError");
  return json({ error: { code: "INTERNAL_ERROR", message: "No se pudo procesar la partida." } }, 500);
}
export async function readJson(request: Request): Promise<unknown> {
  if (!request.headers.get("content-type")?.includes("application/json")) throw new ApiError(415, "CONTENT_TYPE", "Enviar application/json.");
  const reader = request.body?.getReader();
  if (!reader) throw new ApiError(400, "INVALID_JSON", "Falta el cuerpo JSON.");
  const chunks: Uint8Array[] = [];
  let size = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.length;
    if (size > 4096) {
      await reader.cancel();
      throw new ApiError(413, "BODY_TOO_LARGE", "El cuerpo supera 4 KB.");
    }
    chunks.push(value);
  }
  const bytes = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.length; }
  try { return JSON.parse(new TextDecoder().decode(bytes)); }
  catch { throw new ApiError(400, "INVALID_JSON", "JSON inválido."); }
}
