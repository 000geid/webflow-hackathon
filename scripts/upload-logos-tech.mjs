import { createHash } from "node:crypto";
import { readFileSync, writeFileSync } from "node:fs";

const log = (...args) => console.log(...args);

// Env mínima: leer .env.local (WEBFLOW_SITE_ID / WEBFLOW_COLLECTION_ID / WEBFLOW_SITE_TOKEN)
const env = Object.fromEntries(
  readFileSync(".env.local", "utf8")
    .split("\n")
    .filter((line) => line.trim() && !line.startsWith("#"))
    .map((line) => {
      const i = line.indexOf("=");
      return [line.slice(0, i).trim(), line.slice(i + 1).trim()];
    }),
);
const SITE_ID = env.WEBFLOW_SITE_ID ?? "6ab67289a2a8f7482185d627"; // Pixel Rush (docs/webflow-cms.md)
const COLLECTION_ID = env.WEBFLOW_COLLECTION_ID;
const TOKEN = env.WEBFLOW_SITE_TOKEN;
const API = "https://api.webflow.com/v2";

const headers = {
  Authorization: `Bearer ${TOKEN}`,
  "Content-Type": "application/json",
  Accept: "application/json",
};

async function api(path, options = {}) {
  const res = await fetch(`${API}${path}`, {
    ...options,
    headers: { ...headers, ...(options.headers || {}) },
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`${options.method || "GET"} ${path} -> ${res.status}: ${body}`);
  }
  if (res.status === 204) return null;
  return res.json();
}

// 1. Subir una imagen como asset del sitio y devolver { fileId, url }
async function uploadAsset(fileName, filePath) {
  const bytes = readFileSync(filePath);
  const fileHash = createHash("md5").update(bytes).digest("hex");
  const created = await api(`/sites/${SITE_ID}/assets`, {
    method: "POST",
    body: JSON.stringify({ fileName, fileHash }),
  });
  const { uploadUrl, uploadDetails } = created;
  const form = new FormData();
  for (const [key, value] of Object.entries(uploadDetails)) {
    if (value !== undefined && value !== null) form.append(key, String(value));
  }
  form.append("file", new Blob([bytes], { type: uploadDetails.contentType }), fileName);
  const res = await fetch(uploadUrl, { method: "POST", body: form });
  if (res.status !== 201) {
    throw new Error(`S3 upload de ${fileName} -> ${res.status}: ${await res.text()}`);
  }
  log(`✓ subido ${fileName} (asset ${created.id})`);
  return { fileId: created.id, url: created.hostedUrl };
}

// 2. Buscar un asset ya subido por nombre de archivo
async function findAsset(fileName) {
  const stripExt = (name) => name.replace(/\.(jpeg|jpg|png|webp)$/i, "");
  const target = stripExt(fileName);
  for (let offset = 0; offset < 500; offset += 100) {
    const { assets } = await api(`/sites/${SITE_ID}/assets?limit=100&offset=${offset}`);
    if (!assets?.length) break;
    const found = assets.find(
      (a) =>
        stripExt(a.originalFileName || "") === target ||
        (a.displayName && stripExt(a.displayName.toLowerCase()) === target.toLowerCase()),
    );
    if (found) return found;
  }
  return null;
}

const LOGOS_DIR = "fotos/logos tech";

// Item ID -> datos de content/challenges-logos-tech.csv
const logos = [
  {
    id: "6ab70e078050d8f99bb3c93d",
    file: "10-linux.jpg",
    fields: { "opcion-a": "Ubuntu", "opcion-b": "Windows", "opcion-c": "Linux Mint", "opcion-d": "Linux", "respuesta-correcta": "D" },
  },
  {
    id: "6ab70e078050d8f99bb3c93f",
    file: "11-github.png",
    fields: { "opcion-a": "GitLab", "opcion-b": "GitHub", "opcion-c": "SourceForge", "opcion-d": "Codeberg", "respuesta-correcta": "B" },
  },
  {
    id: "6ab70e078050d8f99bb3c941",
    file: "12-my-sql.png",
    fields: { "opcion-a": "PostgreSQL", "opcion-b": "MongoDB", "opcion-c": "MySQL", "opcion-d": "SQLite", "respuesta-correcta": "C" },
  },
  {
    id: "6ab70e078050d8f99bb3c943",
    file: "13-phyton.jpg",
    fields: { "opcion-a": "Python", "opcion-b": "PHP", "opcion-c": "Ruby", "opcion-d": "JavaScript", "respuesta-correcta": "A" },
  },
  {
    id: "6ab70e078050d8f99bb3c945",
    file: "14-android.jpg",
    fields: { "opcion-a": "iOS", "opcion-b": "Android", "opcion-c": "Windows Phone", "opcion-d": "KaiOS", "respuesta-correcta": "B" },
  },
  {
    id: "6ab70e078050d8f99bb3c947",
    file: "15-apple.jpg",
    fields: { "opcion-a": "Samsung", "opcion-b": "Microsoft", "opcion-c": "Linux", "opcion-d": "Apple", "respuesta-correcta": "D" },
  },
];

// Item ID -> archivo de la tanda pelis/series cuyo asset ya fue subido en la sesión anterior
const pelisPendientes = [
  { id: "6ab70b639f45ab03f5bb2e76", file: "25-blade-runner-2049.jpg" },
  { id: "6ab70b639f45ab03f5bb2e6e", file: "21-et.jpg" },
  { id: "6ab70b639f45ab03f5bb2e6c", file: "20-fight-club.jpg" },
  { id: "6ab70b639f45ab03f5bb2e68", file: "18-matrix.jpg" },
  { id: "6ab70b639f45ab03f5bb2e6a", file: "19-truman-show.jpg" },
  { id: "6ab70b639f45ab03f5bb2e70", file: "22-volver-futuro.jpg" },
  { id: "6ab70b639f45ab03f5bb2e72", file: "23-satc.jpg" },
  { id: "6ab70b639f45ab03f5bb2e7a", file: "27-simpsons.jpg" },
  { id: "6ab70b639f45ab03f5bb2e74", file: "24-the-office.jpg" },
];

const LOGO_ASSETS_CACHE = "/tmp/pixel-rush-logo-assets.json";

async function main() {
  // Reusar assets si el script se corta a la mitad (idempotencia básica)
  let logoAssets;
  try {
    logoAssets = JSON.parse(readFileSync(LOGO_ASSETS_CACHE, "utf8"));
    log(`↻ reusando assets ya subidos: ${Object.keys(logoAssets).length}`);
  } catch {
    logoAssets = {};
  }
  for (const item of logos) {
    if (!logoAssets[item.file]) {
      logoAssets[item.file] = await uploadAsset(item.file, `${LOGOS_DIR}/${item.file}`);
    }
  }
  writeFileSync(LOGO_ASSETS_CACHE, JSON.stringify(logoAssets, null, 2));

  // Completar campos de los 6 ítems de logos
  const logoUpdates = logos.map((item) => ({
    id: item.id,
    fieldData: {
      ...item.fields,
      imagen: logoAssets[item.file],
      categoria: "Logos tech",
    },
  }));
  await api(`/collections/${COLLECTION_ID}/items`, {
    method: "PATCH",
    body: JSON.stringify({ items: logoUpdates }),
  });
  log(`✓ campos actualizados en ${logoUpdates.length} ítems de logos`);

  // Reparar imagen de la tanda pelis/series (los assets ya existen en el CDN)
  const pelisUpdates = [];
  for (const item of pelisPendientes) {
    const asset = await findAsset(item.file);
    if (!asset) {
      log(`✗ no encontré el asset ${item.file} en el sitio`);
      continue;
    }
    pelisUpdates.push({
      id: item.id,
      fieldData: { imagen: { fileId: asset.id, url: asset.hostedUrl } },
    });
  }
  if (pelisUpdates.length) {
    await api(`/collections/${COLLECTION_ID}/items`, {
      method: "PATCH",
      body: JSON.stringify({ items: pelisUpdates }),
    });
    log(`✓ imagen reparada en ${pelisUpdates.length} ítems de pelis/series`);
  }

  // Publicar todo
  const toPublish = [...logos.map((i) => i.id), ...pelisUpdates.map((i) => i.id)];
  await api(`/collections/${COLLECTION_ID}/items/publish`, {
    method: "POST",
    body: JSON.stringify({ itemIds: toPublish }),
  });
  log(`✓ publicados ${toPublish.length} ítems`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
