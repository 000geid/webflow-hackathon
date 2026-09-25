import "server-only";
import { appPath } from "../paths";
import { parseChallenges } from "../game/challenges";
import { CATEGORIES, categoryInfo, categoryOf, MIX, type CategoryAvailability, type CategoryChoice } from "../game/categories";
import { ROUNDS_PER_GAME } from "../game/rules";
import type { GameState, RoundContent } from "../game/types";
import { ApiError } from "./api";
import { getWebflowCollectionItems } from "./webflow";

const labels = ["Círculo", "Triángulo", "Cuadrado", "Estrella", "Corazón"];
function configuredMode(): GameState["mode"] {
  const mode = process.env.GAME_CONTENT_MODE ?? (process.env.NODE_ENV === "production" ? "webflow" : "fixture");
  if (mode !== "fixture" && mode !== "webflow") {
    throw new ApiError(503, "INVALID_CONTENT_MODE", "GAME_CONTENT_MODE debe ser fixture o webflow.");
  }
  if (process.env.NODE_ENV === "production" && mode !== "webflow") {
    throw new ApiError(503, "FIXTURES_DISABLED", "Producción debe usar contenido de Webflow.");
  }
  return mode;
}

function fixtures(): RoundContent[] {
  return labels.map((label, index) => ({
    id: `fixture-${index}`, category: "Demo · Formas",
    imageUrl: appPath(`/fixtures/${index}.svg`),
    choices: [label, ...labels.filter((other) => other !== label).slice(0, 3)]
      .map((label, i) => ({ id: String.fromCharCode(65 + i), label })),
    correctChoiceId: "A",
  }));
}

/** Desafíos disponibles según la fuente configurada (fixtures en desarrollo, Webflow en producción). */
async function loadContent(): Promise<{ mode: GameState["mode"]; content: RoundContent[] }> {
  const mode = configuredMode();
  if (mode === "fixture") return { mode, content: fixtures() };
  if (!process.env.WEBFLOW_SITE_TOKEN || !process.env.WEBFLOW_COLLECTION_ID) {
    throw new ApiError(503, "CMS_NOT_CONFIGURED", "Configurar WEBFLOW_SITE_TOKEN y WEBFLOW_COLLECTION_ID en el servidor.");
  }
  try { return { mode, content: parseChallenges(await getWebflowCollectionItems(process.env.WEBFLOW_COLLECTION_ID)) }; }
  catch { throw new ApiError(503, "CMS_UNAVAILABLE", "No se pudo leer la colección de Webflow."); }
}

/**
 * Filtra por categoría y deja la etiqueta canónica en cada ronda.
 * En modo fixture no se filtra: las formas de prueba sirven para cualquier categoría.
 */
function inCategory(mode: GameState["mode"], content: RoundContent[], category: CategoryChoice): RoundContent[] {
  if (mode === "fixture") return content;
  const labeled = content.map((round) => {
    const id = categoryOf(round.category);
    return { round: id ? { ...round, category: categoryInfo(id).label } : round, id };
  });
  return labeled.filter(({ id }) => category === "mix" || id === category).map(({ round }) => round);
}

/** Cuántos desafíos tiene cada categoría. Se necesitan cinco para poder jugarla. */
export async function categoryAvailability(): Promise<CategoryAvailability[]> {
  const { mode, content } = await loadContent();
  return [MIX, ...CATEGORIES].map((category) => {
    const count = inCategory(mode, content, category.id).length;
    return { id: category.id, label: category.label, emoji: category.emoji, count, available: count >= ROUNDS_PER_GAME };
  });
}

export async function createGameState(category: CategoryChoice = "mix"): Promise<GameState> {
  const { mode, content: all } = await loadContent();
  const content = inCategory(mode, all, category);
  if (content.length < ROUNDS_PER_GAME) {
    throw new ApiError(
      mode === "fixture" || category === "mix" ? 503 : 409,
      "INSUFFICIENT_CHALLENGES",
      category === "mix"
        ? "Se necesitan cinco desafíos publicados, activos y válidos en Webflow."
        : `Todavía no hay suficientes imágenes de ${categoryInfo(category).label}. Probá con otra categoría.`,
    );
  }
  // Fisher–Yates; no repeated challenges in a game.
  for (let i = content.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [content[i], content[j]] = [content[j], content[i]];
  }
  return { mode, index: 0, rounds: content.slice(0, ROUNDS_PER_GAME).map((content) => ({ content, startedAt: null, pausedAt: null, result: null })) };
}
