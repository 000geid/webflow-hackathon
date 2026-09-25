import { apiError, ApiError, json, readJson } from "@/lib/server/api";
import { createRoom, createRoomSchema } from "@/lib/server/rooms";

export async function POST(request: Request) {
  try {
    const input = createRoomSchema.safeParse(await readJson(request));
    if (!input.success) throw new ApiError(400, "INVALID_INPUT", "Indicar name (1 a 16 caracteres) y un avatar válido.");
    return json(await createRoom({ name: input.data.name, avatar: input.data.avatar }, input.data.category), 201);
  } catch (error) { return apiError(error); }
}
