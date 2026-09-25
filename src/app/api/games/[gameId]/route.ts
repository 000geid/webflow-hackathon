import { apiError, json } from "@/lib/server/api";
import { accessGame } from "@/lib/server/games";

export async function GET(request: Request, context: { params: Promise<{ gameId: string }> }) {
  try { return json(await accessGame(request, (await context.params).gameId)); }
  catch (error) { return apiError(error); }
}
