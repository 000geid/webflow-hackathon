import { z } from "zod";
import { apiError, ApiError, json, readJson } from "@/lib/server/api";
import { accessRoom, roomCodeSchema } from "@/lib/server/rooms";

const roundIndex = z.number().int().min(0).max(4);
const schema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("start") }).strict(),
  z.object({ type: z.literal("leave") }).strict(),
  z.object({ type: z.literal("ready"), ready: z.boolean() }).strict(),
  z.object({ type: z.literal("rematch") }).strict(),
  z.object({ type: z.literal("pause"), roundIndex }).strict(),
  z.object({ type: z.literal("hint"), roundIndex }).strict(),
  z.object({ type: z.literal("answer"), roundIndex, choiceId: z.string().min(1).max(64) }).strict(),
]);
export async function POST(request: Request, context: { params: Promise<{ code: string }> }) {
  try {
    const code = roomCodeSchema.safeParse((await context.params).code);
    if (!code.success) throw new ApiError(404, "ROOM_NOT_FOUND", "Código de sala inválido.");
    const input = schema.safeParse(await readJson(request));
    if (!input.success) throw new ApiError(400, "INVALID_INPUT", "Acción inválida: start, leave, ready, rematch, pause, hint o answer.");
    const view = await accessRoom(request, code.data, input.data);
    return view ? json(view) : json({ left: true });
  } catch (error) { return apiError(error); }
}
