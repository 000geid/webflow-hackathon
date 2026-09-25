import { z } from "zod";
import { apiError, ApiError, json, readJson } from "@/lib/server/api";
import { createGameState } from "@/lib/server/challenges";
import { insertGame } from "@/lib/server/games";

const schema = z.object({ mode: z.enum(["fixture", "webflow"]).default("webflow") }).strict();
export async function POST(request: Request) {
  try {
    const input = schema.safeParse(await readJson(request));
    if (!input.success) throw new ApiError(400, "INVALID_INPUT", "Usar mode: fixture o webflow.");
    return json(await insertGame(await createGameState(input.data.mode)), 201);
  } catch (error) { return apiError(error); }
}
