import { z } from "zod";

/**
 * Categorías del juego. Los `id` no cambian aunque cambie la etiqueta: se guardan en salas
 * y en el navegador. Las etiquetas viejas quedan como alias. En el CMS, el campo `categoria` de cada desafío debe coincidir con
 * una etiqueta o alias (sin importar mayúsculas, tildes ni emojis).
 */
export const CATEGORIES = [
  {
    id: "tech", label: "Logos & Tech", emoji: "⚡",
    description: "Adiviná el logo: lenguajes, frameworks, apps y herramientas.",
    aliases: ["logos tech", "logos y tech", "logos", "tech y geek", "tech", "geek", "cultura dev"],
  },
  {
    id: "memes", label: "Memes de Internet", emoji: "🤡",
    description: "Los clásicos que viste mil veces en el grupo.",
    aliases: ["memes del internet", "internet memes", "memes", "memes y cultura dev", "memes argentina", "cultura arg"],
  },
  {
    id: "cine-series", label: "Pelis & Series", emoji: "🍿",
    description: "Escenas, personajes y pósters de pelis y series.",
    aliases: ["pelis y series", "cine y series", "cine", "series", "peliculas"],
  },
] as const;

export type CategoryId = (typeof CATEGORIES)[number]["id"];
/** "mix" = todas las categorías mezcladas. */
export type CategoryChoice = CategoryId | "mix";

export const MIX = { id: "mix", label: "Mezcla", emoji: "🎲", description: "Un poco de todo, al azar." } as const;

export const categoryChoiceSchema = z.enum(["mix", ...CATEGORIES.map((category) => category.id)] as [CategoryChoice, ...CategoryChoice[]]);

const normalize = (text: string) =>
  text.normalize("NFD").replace(/\p{Diacritic}/gu, "").replace(/[^\p{L}\p{N}&\s]/gu, "").replace(/&/g, " y ").replace(/\s+/g, " ").trim().toLowerCase();

/** Categoría canónica de un texto del CMS, o null si no coincide con ninguna. */
export function categoryOf(raw: string): CategoryId | null {
  const text = normalize(raw);
  for (const category of CATEGORIES) {
    if (normalize(category.label) === text || category.aliases.some((alias) => normalize(alias) === text)) return category.id;
  }
  return null;
}

export function categoryInfo(choice: CategoryChoice) {
  return choice === "mix" ? MIX : CATEGORIES.find((category) => category.id === choice)!;
}

export type CategoryAvailability = { id: CategoryChoice; label: string; emoji: string; count: number; available: boolean };
