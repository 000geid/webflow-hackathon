import "server-only";

// Invoke from a server component or route handler, never from the browser.
// Callers must validate the returned payload against their CMS collection schema.
export async function getWebflowCollectionItems(collectionId: string): Promise<unknown> {
  const token = process.env.WEBFLOW_SITE_TOKEN;
  if (!token) throw new Error("Falta configurar WEBFLOW_SITE_TOKEN en el servidor.");
  if (!collectionId.trim()) throw new Error("Falta el ID de la colección de Webflow.");

  const response = await fetch(
    `https://api.webflow.com/v2/collections/${encodeURIComponent(collectionId)}/items/live?limit=100`,
    {
      headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
      cache: "no-store",
      signal: AbortSignal.timeout(8_000),
    },
  );

  // Do not relay upstream response bodies or credentials to the client.
  if (!response.ok) throw new Error(`Webflow respondió con estado ${response.status}.`);
  return response.json();
}
