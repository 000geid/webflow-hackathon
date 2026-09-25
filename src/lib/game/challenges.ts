import { z } from "zod";
import type { RoundContent } from "./types";

const text = z.string().trim().min(1);
const challenge = z.object({
  id: text,
  isDraft: z.boolean().optional(),
  isArchived: z.boolean().optional(),
  fieldData: z.object({
    activa: z.literal(true),
    imagen: z.object({ url: z.url().refine((url) => new URL(url).protocol === "https:") }),
    categoria: text,
    "opcion-a": text, "opcion-b": text, "opcion-c": text, "opcion-d": text,
    "respuesta-correcta": z.string().trim().toUpperCase().pipe(z.enum(["A", "B", "C", "D"])),
  }),
});

export function parseChallenges(items: unknown[]): RoundContent[] {
  const rounds: RoundContent[] = [];
  const seen = new Set<string>();
  for (const item of items) {
    const parsed = challenge.safeParse(item);
    if (!parsed.success) continue;
    const { id, fieldData: data, isDraft, isArchived } = parsed.data;
    if (isDraft || isArchived || seen.has(id)) continue;
    const choices = (["opcion-a", "opcion-b", "opcion-c", "opcion-d"] as const).map((field, index) => ({
      id: String.fromCharCode(65 + index), label: data[field],
    }));
    if (new Set(choices.map(({ label }) => label.toLocaleLowerCase())).size !== 4) continue;
    seen.add(id);
    rounds.push({ id, category: data.categoria, imageUrl: data.imagen.url, choices, correctChoiceId: data["respuesta-correcta"] });
  }
  return rounds;
}
