import { apiError, ApiError, json, readJson } from "@/lib/server/api";
import { joinRoom, profileSchema, roomCodeSchema } from "@/lib/server/rooms";

export async function POST(request: Request, context: { params: Promise<{ code: string }> }) {
  try {
    const code = roomCodeSchema.safeParse((await context.params).code);
    if (!code.success) throw new ApiError(404, "ROOM_NOT_FOUND", "Código de sala inválido.");
    const input = profileSchema.safeParse(await readJson(request));
    if (!input.success) throw new ApiError(400, "INVALID_INPUT", "Indicar name (1 a 16 caracteres) y un avatar válido.");
    return json(await joinRoom(code.data, input.data), 201);
  } catch (error) { return apiError(error); }
}
