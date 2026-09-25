import { apiError, ApiError, json } from "@/lib/server/api";
import { accessRoom, roomCodeSchema } from "@/lib/server/rooms";

export async function GET(request: Request, context: { params: Promise<{ code: string }> }) {
  try {
    const code = roomCodeSchema.safeParse((await context.params).code);
    if (!code.success) throw new ApiError(404, "ROOM_NOT_FOUND", "Código de sala inválido.");
    return json(await accessRoom(request, code.data));
  } catch (error) { return apiError(error); }
}
