import { z } from "zod";
import { apiError, ApiError, json, readJson } from "@/lib/server/api";
import { accessGame } from "@/lib/server/games";

const roundIndex = z.number().int().min(0).max(4);
const schema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("start"), roundIndex }).strict(),
  z.object({ type: z.literal("pause"), roundIndex }).strict(),
  z.object({ type: z.literal("expire"), roundIndex }).strict(),
  z.object({ type: z.literal("answer"), roundIndex, choiceId: z.string().min(1).max(64) }).strict(),
  z.object({ type: z.literal("hint"), roundIndex }).strict(),
]);
export async function POST(request: Request, context: { params: Promise<{ gameId: string }> }) {
  try {
    const input = schema.safeParse(await readJson(request));
    if (!input.success) throw new ApiError(400, "INVALID_INPUT", "Acción inválida: indicar type, roundIndex y choiceId solo al responder.");
    return json(await accessGame(request, (await context.params).gameId, input.data));
  } catch (error) { return apiError(error); }
}
