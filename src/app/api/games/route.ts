import { z } from "zod";
import { apiError, ApiError, json, readJson } from "@/lib/server/api";
import { createGameState } from "@/lib/server/challenges";
import { insertGame } from "@/lib/server/games";

const schema = z.object({}).strict();
export async function POST(request: Request) {
  try {
    const input = schema.safeParse(await readJson(request));
    if (!input.success) throw new ApiError(400, "INVALID_INPUT", "El cuerpo para crear una partida debe ser un objeto vacío.");
    return json(await insertGame(await createGameState()), 201);
  } catch (error) { return apiError(error); }
}
