import { apiError, json } from "@/lib/server/api";
import { categoryAvailability } from "@/lib/server/challenges";

export async function GET() {
  try { return json(await categoryAvailability()); }
  catch (error) { return apiError(error); }
}
