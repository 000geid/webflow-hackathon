import "server-only";
import { z } from "zod";

const pageSchema = z.object({
  items: z.array(z.unknown()),
  pagination: z.object({ total: z.number().int().nonnegative() }),
});

// Live content only. Payload validation and active filtering happen in challenges.ts.
export async function getWebflowCollectionItems(collectionId: string): Promise<unknown[]> {
  const token = process.env.WEBFLOW_SITE_TOKEN;
  if (!token) throw new Error("Falta configurar WEBFLOW_SITE_TOKEN en el servidor.");
  if (!collectionId.trim()) throw new Error("Falta el ID de la colección de Webflow.");
  const items: unknown[] = [];
  const signal = AbortSignal.timeout(8_000);
  for (let offset = 0; offset < 10_000; offset += 100) {
    const response = await fetch(
      `https://api.webflow.com/v2/collections/${encodeURIComponent(collectionId)}/items/live?limit=100&offset=${offset}`,
      { headers: { Authorization: `Bearer ${token}`, Accept: "application/json" }, cache: "no-store", signal },
    );
    if (!response.ok) throw new Error(`Webflow respondió con estado ${response.status}.`);
    const page = pageSchema.parse(await response.json());
    items.push(...page.items);
    if (offset + page.items.length >= page.pagination.total) return items;
    if (page.items.length === 0) throw new Error("Paginación de Webflow incompleta.");
  }
  throw new Error("La colección supera el máximo de 10000 ítems.");
}
