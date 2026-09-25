import { z } from "zod";
import { categoryChoiceSchema } from "@/lib/game/categories";
import { apiError, ApiError, json, readJson } from "@/lib/server/api";
import { createGameState } from "@/lib/server/challenges";
import { insertGame } from "@/lib/server/games";

const schema = z.object({ category: categoryChoiceSchema.optional() }).strict();
export async function POST(request: Request) {
  try {
    const input = schema.safeParse(await readJson(request));
    if (!input.success) throw new ApiError(400, "INVALID_INPUT", "El cuerpo para crear una partida admite solo `category` (opcional).");
    return json(await insertGame(await createGameState(input.data.category)), 201);
  } catch (error) { return apiError(error); }
}
